import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/app";
import { createUserWithAuth, jobPayload } from "./helpers";

describe("GET /api/jobs", () => {
    it("is public and returns an (initially empty) list", async () => {
        const res = await request(app).get("/api/jobs");

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
        expect(res.body.totalJobs).toBe(0);
    });

    it("rejects an invalid enum filter (400)", async () => {
        const res = await request(app).get("/api/jobs").query({ jobType: "nonsense" });
        expect(res.status).toBe(400);
    });
});

describe("GET /api/jobs/:id", () => {
    it("returns 400 for a malformed id", async () => {
        const res = await request(app).get("/api/jobs/not-an-id");
        expect(res.status).toBe(400);
    });

    it("returns 404 for a well-formed but unknown id", async () => {
        const res = await request(app).get(`/api/jobs/${new mongoose.Types.ObjectId()}`);
        expect(res.status).toBe(404);
    });
});

describe("POST /api/jobs", () => {
    it("returns 401 without a token", async () => {
        const res = await request(app).post("/api/jobs").send(jobPayload());
        expect(res.status).toBe(401);
    });

    it("forbids a job seeker from posting (403)", async () => {
        const { auth } = await createUserWithAuth("user");
        const res = await request(app).post("/api/jobs").set("Authorization", auth).send(jobPayload());
        expect(res.status).toBe(403);
    });

    it("rejects an invalid payload from an employer (400)", async () => {
        const { auth } = await createUserWithAuth("employer");
        const res = await request(app)
            .post("/api/jobs")
            .set("Authorization", auth)
            .send(jobPayload({ title: "x" })); // too short
        expect(res.status).toBe(400);
    });

    it("lets an employer create a job (201)", async () => {
        const { auth } = await createUserWithAuth("employer");
        const res = await request(app).post("/api/jobs").set("Authorization", auth).send(jobPayload());

        expect(res.status).toBe(201);
        expect(res.body.data.title).toBe("Frontend Developer");
        expect(res.body.data.isVerified).toBe(false);
    });
});

describe("job management (verify / update / delete)", () => {
    async function createJobAsEmployer() {
        const { user, auth } = await createUserWithAuth("employer");
        const res = await request(app).post("/api/jobs").set("Authorization", auth).send(jobPayload());
        return { employer: user, auth, jobId: res.body.data._id as string };
    }

    it("lets an admin verify a job, but forbids a non-admin", async () => {
        const { jobId } = await createJobAsEmployer();
        const { auth: userAuth } = await createUserWithAuth("user");
        const { auth: adminAuth } = await createUserWithAuth("admin");

        const forbidden = await request(app)
            .patch(`/api/jobs/${jobId}/verify`)
            .set("Authorization", userAuth);
        expect(forbidden.status).toBe(403);

        const verified = await request(app)
            .patch(`/api/jobs/${jobId}/verify`)
            .set("Authorization", adminAuth);
        expect(verified.status).toBe(200);
        expect(verified.body.data.isVerified).toBe(true);
    });

    it("lets the owner update the job but forbids another employer", async () => {
        const { auth, jobId } = await createJobAsEmployer();
        const { auth: otherAuth } = await createUserWithAuth("employer");

        const forbidden = await request(app)
            .put(`/api/jobs/${jobId}`)
            .set("Authorization", otherAuth)
            .send({ title: "Hijacked Title" });
        expect(forbidden.status).toBe(403);

        const updated = await request(app)
            .put(`/api/jobs/${jobId}`)
            .set("Authorization", auth)
            .send({ title: "Senior Frontend Developer" });
        expect(updated.status).toBe(200);
        expect(updated.body.data.title).toBe("Senior Frontend Developer");
    });

    it("lets the owner delete the job", async () => {
        const { auth, jobId } = await createJobAsEmployer();

        const res = await request(app).delete(`/api/jobs/${jobId}`).set("Authorization", auth);
        expect(res.status).toBe(200);

        const gone = await request(app).get(`/api/jobs/${jobId}`);
        expect(gone.status).toBe(404);
    });
});
