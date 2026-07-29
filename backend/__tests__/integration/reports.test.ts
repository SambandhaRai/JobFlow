import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/app";
import { createUserWithAuth, jobPayload } from "./helpers";

/** Post a job (as an employer) and return its id — reports must target a real job. */
async function createJob() {
    const { auth } = await createUserWithAuth("employer");
    const created = await request(app).post("/api/jobs").set("Authorization", auth).send(jobPayload());
    return created.body.data._id as string;
}

const reportPayload = (jobId: string, overrides: Record<string, unknown> = {}) => ({
    jobId,
    reason: "scam",
    message: "This listing asks for an upfront payment.",
    ...overrides,
});

describe("POST /api/reports", () => {
    it("returns 401 without a token", async () => {
        const jobId = await createJob();
        const res = await request(app).post("/api/reports").send(reportPayload(jobId));
        expect(res.status).toBe(401);
    });

    it("returns 400 for a missing jobId", async () => {
        const { auth } = await createUserWithAuth("user");
        const res = await request(app).post("/api/reports").set("Authorization", auth).send({ reason: "scam" });
        expect(res.status).toBe(400);
    });

    it("returns 404 when the reported job does not exist", async () => {
        const { auth } = await createUserWithAuth("user");
        const res = await request(app)
            .post("/api/reports")
            .set("Authorization", auth)
            .send(reportPayload(new mongoose.Types.ObjectId().toString()));
        expect(res.status).toBe(404);
    });

    it("lets a user report a job (201)", async () => {
        const jobId = await createJob();
        const { auth } = await createUserWithAuth("user");

        const res = await request(app).post("/api/reports").set("Authorization", auth).send(reportPayload(jobId));

        expect(res.status).toBe(201);
        expect(res.body.data.reason).toBe("scam");
        expect(res.body.data.status).toBe("open");
    });

    it("rejects reporting the same job twice (409)", async () => {
        const jobId = await createJob();
        const { auth } = await createUserWithAuth("user");

        await request(app).post("/api/reports").set("Authorization", auth).send(reportPayload(jobId));
        const dup = await request(app).post("/api/reports").set("Authorization", auth).send(reportPayload(jobId));

        expect(dup.status).toBe(409);
    });
});

describe("report listing and moderation", () => {
    it("returns the reporter's own reports", async () => {
        const jobId = await createJob();
        const { auth } = await createUserWithAuth("user");
        await request(app).post("/api/reports").set("Authorization", auth).send(reportPayload(jobId));

        const res = await request(app).get("/api/reports/me").set("Authorization", auth);

        expect(res.status).toBe(200);
        expect(res.body.totalReports).toBe(1);
    });

    it("forbids a non-admin from listing all reports but allows an admin", async () => {
        const { auth: userAuth } = await createUserWithAuth("user");
        const { auth: adminAuth } = await createUserWithAuth("admin");

        const forbidden = await request(app).get("/api/reports").set("Authorization", userAuth);
        expect(forbidden.status).toBe(403);

        const allowed = await request(app).get("/api/reports").set("Authorization", adminAuth);
        expect(allowed.status).toBe(200);
    });

    it("lets an admin update a report's status", async () => {
        const jobId = await createJob();
        const { user: reporter, auth: reporterAuth } = await createUserWithAuth("user");
        const created = await request(app)
            .post("/api/reports")
            .set("Authorization", reporterAuth)
            .send(reportPayload(jobId));
        const reportId = created.body.data._id as string;

        const { auth: adminAuth } = await createUserWithAuth("admin");
        const res = await request(app)
            .patch(`/api/reports/${reportId}/status`)
            .set("Authorization", adminAuth)
            .send({ status: "reviewed" });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe("reviewed");
        expect(reporter).toBeDefined();
    });

    it("forbids a non-admin from updating a report's status (403)", async () => {
        const jobId = await createJob();
        const { auth } = await createUserWithAuth("user");
        const created = await request(app).post("/api/reports").set("Authorization", auth).send(reportPayload(jobId));
        const reportId = created.body.data._id as string;

        const res = await request(app)
            .patch(`/api/reports/${reportId}/status`)
            .set("Authorization", auth)
            .send({ status: "reviewed" });

        expect(res.status).toBe(403);
    });
});
