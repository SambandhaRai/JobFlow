import mongoose from "mongoose";
import { connectDatabase } from "../database/mongoose";
import { InstitutionModel } from "../models/institution.model";
import { institutionsSeedData, VALID_INSTITUTION_TYPES, InstitutionType } from "./seed-institutions-data";

interface SeedSummary {
    total: number;
    inserted: number;
    updated: number;
    skipped: number;
}

function normalizeName(raw: string): string {
    return raw.trim().replace(/\s+/g, " ");
}

function isValidType(value: string): value is InstitutionType {
    return (VALID_INSTITUTION_TYPES as readonly string[]).includes(value);
}

async function resetInstitutions(): Promise<void> {
    const { deletedCount } = await InstitutionModel.deleteMany({});
    console.log(`🗑  Reset: deleted ${deletedCount} existing institution(s)\n`);
}

async function seedInstitutions(): Promise<void> {
    const summary: SeedSummary = {
        total: institutionsSeedData.length,
        inserted: 0,
        updated: 0,
        skipped: 0,
    };

    console.log(`📦 Starting institution seed — ${summary.total} input rows\n`);

    // ── Deduplicate input rows case-insensitively ─────────────────
    const seen = new Set<string>();
    const uniqueEntries = institutionsSeedData.filter((entry) => {
        const key = normalizeName(entry.name).toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    const duplicateCount = summary.total - uniqueEntries.length;
    if (duplicateCount > 0) {
        console.log(`⚠️  Skipped ${duplicateCount} duplicate(s) in seed data file\n`);
        summary.skipped += duplicateCount;
    }

    for (const entry of uniqueEntries) {
        const name = normalizeName(entry.name);

        // ── Validate entry ────────────────────────────────────────
        if (!name) {
            summary.skipped++;
            console.log(`  ⏭  Skipped: empty name`);
            continue;
        }

        if (!isValidType(entry.type)) {
            summary.skipped++;
            console.log(`  ⏭  Skipped: "${name}" — invalid type "${entry.type}"`);
            continue;
        }

        try {
            // ── Type-safe upsert: check existence first ───────────
            const existing = await InstitutionModel.findOne({ name });

            await InstitutionModel.findOneAndUpdate(
                { name },
                {
                    $set: {
                        name,
                        type: entry.type,
                        isActive: entry.isActive,
                    },
                },
                { upsert: true, new: true }
            );

            if (existing) {
                summary.updated++;
                console.log(`  🔄 Updated : ${name}`);
            } else {
                summary.inserted++;
                console.log(`  ✅ Inserted: ${name}`);
            }
        } catch (error) {
            summary.skipped++;
            const message = error instanceof Error ? error.message : String(error);
            console.log(`  ❌ Failed  : "${name}" — ${message}`);
        }
    }

    // ── Summary ───────────────────────────────────────────────────
    console.log("\n─────────────────────────────────────");
    console.log("  Seed Summary");
    console.log("─────────────────────────────────────");
    console.log(`  Total input rows : ${summary.total}`);
    console.log(`  Inserted         : ${summary.inserted}`);
    console.log(`  Updated          : ${summary.updated}`);
    console.log(`  Skipped/Invalid  : ${summary.skipped}`);
    console.log("─────────────────────────────────────\n");
}

async function main(): Promise<void> {
    const resetMode = process.argv.includes("--reset");

    try {
        await connectDatabase();
        console.log("✅ Database connected\n");

        if (resetMode) {
            console.log("⚠️  Reset mode enabled — existing institutions will be deleted\n");
            await resetInstitutions();
        }

        await seedInstitutions();

        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error instanceof Error ? error.message : error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 Database connection closed");
    }
}

main();