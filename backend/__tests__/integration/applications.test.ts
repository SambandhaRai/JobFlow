import request from "supertest";
import app from "../../src/app";
import { authHeader, createUserWithAuth, jobPayload } from "./helpers";

const applicationPayload = (jobId: string, overrides: Record<string, unknown> = {}) => ({
    jobId,
    resumeUrl: "resume-123.pdf",
    fullName: "Jane Applicant",
    email: "jane.applicant@example.com",
    phone: "9812345678",
    applicationNote: "I am very interested in this role.",
    ...overrides,
});

/**
 * Post a job as an employer and verify it as an admin, returning everything a
 * test needs to then apply to (and manage) that job. Applications can only be
 * filed against verified jobs, so verification is part of the fixture.
 */
async function createVerifiedJob() {
    const { user: employer, auth: employerAuth } = await createUserWithAuth("employer");
    const created = await request(app).post("/api/jobs").set("Authorization", employerAuth).send(jobPayload());
    const jobId = created.body.data._id as string;

    const { auth: adminAuth } = await createUserWithAuth("admin");
    await request(app).patch(`/api/jobs/${jobId}/verify`).set("Authorization", adminAuth);

    return { employer, employerAuth, adminAuth, jobId };
}

describe("POST /api/applications", () => {
    it("returns 401 without a token", async () => {
        const { jobId } = await createVerifiedJob();
        const res = await request(app).post("/api/applications").send(applicationPayload(jobId));
        expect(res.status).toBe(401);
    });

    it("forbids an employer from applying (403)", async () => {
        const { jobId, employerAuth } = await createVerifiedJob();
        const res = await request(app)
            .post("/api/applications")
            .set("Authorization", employerAuth)
            .send(applicationPayload(jobId));
        expect(res.status).toBe(403);
    });

    it("rejects an invalid payload (400)", async () => {
        const { jobId } = await createVerifiedJob();
        const { auth } = await createUserWithAuth("user");
        const res = await request(app)
            .post("/api/applications")
            .set("Authorization", auth)
            .send(applicationPayload(jobId, { email: "not-an-email" }));
        expect(res.status).toBe(400);
    });

    it("lets a job seeker apply to a verified job (201)", async () => {
        const { jobId } = await createVerifiedJob();
        const { auth } = await createUserWithAuth("user");

        const res = await request(app)
            .post("/api/applications")
            .set("Authorization", auth)
            .send(applicationPayload(jobId));

        expect(res.status).toBe(201);
        expect(res.body.data.status).toBe("submitted");
        expect(res.body.data.jobId).toBe(jobId);
    });

    it("rejects a duplicate application (409)", async () => {
        const { jobId } = await createVerifiedJob();
        const { auth } = await createUserWithAuth("user");

        await request(app).post("/api/applications").set("Authorization", auth).send(applicationPayload(jobId));
        const dup = await request(app)
            .post("/api/applications")
            .set("Authorization", auth)
            .send(applicationPayload(jobId));

        expect(dup.status).toBe(409);
    });

    it("rejects applying to an unverified job (403)", async () => {
        const { auth: employerAuth } = await createUserWithAuth("employer");
        const created = await request(app).post("/api/jobs").set("Authorization", employerAuth).send(jobPayload());
        const jobId = created.body.data._id as string;

        const { auth } = await createUserWithAuth("user");
        const res = await request(app)
            .post("/api/applications")
            .set("Authorization", auth)
            .send(applicationPayload(jobId));

        expect(res.status).toBe(403);
    });
});

describe("listing applications", () => {
    it("returns a job seeker's own applications", async () => {
        const { jobId } = await createVerifiedJob();
        const { auth } = await createUserWithAuth("user");
        await request(app).post("/api/applications").set("Authorization", auth).send(applicationPayload(jobId));

        const res = await request(app).get("/api/applications/me").set("Authorization", auth);

        expect(res.status).toBe(200);
        expect(res.body.totalApplications).toBe(1);
    });

    it("forbids a non-admin from listing all applications but allows an admin", async () => {
        const { auth: userAuth } = await createUserWithAuth("user");
        const { auth: adminAuth } = await createUserWithAuth("admin");

        const forbidden = await request(app).get("/api/applications").set("Authorization", userAuth);
        expect(forbidden.status).toBe(403);

        const allowed = await request(app).get("/api/applications").set("Authorization", adminAuth);
        expect(allowed.status).toBe(200);
    });
});

describe("PATCH /api/applications/:id/status", () => {
    async function applyAndGetId(jobId: string) {
        const { user, auth } = await createUserWithAuth("user");
        const res = await request(app)
            .post("/api/applications")
            .set("Authorization", auth)
            .send(applicationPayload(jobId));
        return { applicant: user, applicantAuth: auth, applicationId: res.body.data._id as string };
    }

    it("lets the posting employer update an application's status", async () => {
        const { jobId, employerAuth } = await createVerifiedJob();
        const { applicationId } = await applyAndGetId(jobId);

        const res = await request(app)
            .patch(`/api/applications/${applicationId}/status`)
            .set("Authorization", employerAuth)
            .send({ status: "shortlisted" });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe("shortlisted");
    });

    it("forbids an unrelated employer from updating the status (403)", async () => {
        const { jobId } = await createVerifiedJob();
        const { applicationId } = await applyAndGetId(jobId);
        const { user: stranger } = await createUserWithAuth("employer");

        const res = await request(app)
            .patch(`/api/applications/${applicationId}/status`)
            .set("Authorization", authHeader(stranger))
            .send({ status: "shortlisted" });

        expect(res.status).toBe(403);
    });

    it("rejects an invalid status value (400)", async () => {
        const { jobId, employerAuth } = await createVerifiedJob();
        const { applicationId } = await applyAndGetId(jobId);

        const res = await request(app)
            .patch(`/api/applications/${applicationId}/status`)
            .set("Authorization", employerAuth)
            .send({ status: "made_up_status" });

        expect(res.status).toBe(400);
    });
});
