import request from "supertest";
import app from "../../src/app";

// Institutions is the only fully public router — no auth at all — and it seeds
// a default list on first read, so these tests double as a check that seeding
// works against a fresh database.
describe("GET /api/institutions", () => {
    it("seeds and returns the default institutions", async () => {
        const res = await request(app).get("/api/institutions");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("filters by type", async () => {
        const res = await request(app).get("/api/institutions").query({ type: "university" });

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data.every((i: { type: string }) => i.type === "university")).toBe(true);
    });

    it("filters by a case-insensitive name search", async () => {
        const res = await request(app).get("/api/institutions").query({ search: "kathmandu" });

        expect(res.status).toBe(200);
        expect(
            res.body.data.some((i: { name: string }) => /kathmandu/i.test(i.name)),
        ).toBe(true);
    });

    it("rejects an invalid type (400)", async () => {
        const res = await request(app).get("/api/institutions").query({ type: "bogus" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid institution type");
    });
});
