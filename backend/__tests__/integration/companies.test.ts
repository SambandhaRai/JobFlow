import request from "supertest";
import app from "../../src/app";
import { createUserWithAuth } from "./helpers";

const companyPayload = (overrides: Record<string, unknown> = {}) => ({
    name: "Acme Technologies",
    industry: "IT & Software",
    location: "Kathmandu",
    email: "info@acme.example.com",
    ...overrides,
});

describe("public company directory", () => {
    it("lists public companies without auth", async () => {
        const res = await request(app).get("/api/companies/public");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("returns public company facets without auth", async () => {
        const res = await request(app).get("/api/companies/public/facets");
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

describe("POST /api/companies", () => {
    it("returns 401 without a token", async () => {
        const res = await request(app).post("/api/companies").send(companyPayload());
        expect(res.status).toBe(401);
    });

    it("forbids a job seeker from creating a company (403)", async () => {
        const { auth } = await createUserWithAuth("user");
        const res = await request(app).post("/api/companies").set("Authorization", auth).send(companyPayload());
        expect(res.status).toBe(403);
    });

    it("rejects an invalid name (400)", async () => {
        const { auth } = await createUserWithAuth("employer");
        const res = await request(app)
            .post("/api/companies")
            .set("Authorization", auth)
            .send(companyPayload({ name: "A" }));
        expect(res.status).toBe(400);
    });

    it("lets an employer create a company and derives a slug (201)", async () => {
        const { auth } = await createUserWithAuth("employer");
        const res = await request(app).post("/api/companies").set("Authorization", auth).send(companyPayload());

        expect(res.status).toBe(201);
        expect(res.body.data.name).toBe("Acme Technologies");
        expect(res.body.data.slug).toBe("acme-technologies");
    });
});

describe("company access control", () => {
    async function createCompanyAsEmployer() {
        const { user, auth } = await createUserWithAuth("employer");
        const res = await request(app).post("/api/companies").set("Authorization", auth).send(companyPayload());
        return { owner: user, auth, companyId: res.body.data._id as string };
    }

    it("returns the owner's companies via /me", async () => {
        const { auth } = await createCompanyAsEmployer();
        const res = await request(app).get("/api/companies/me").set("Authorization", auth);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBe(1);
    });

    it("forbids an employer from listing all companies but allows an admin", async () => {
        await createCompanyAsEmployer();
        const { auth: employerAuth } = await createUserWithAuth("employer");
        const { auth: adminAuth } = await createUserWithAuth("admin");

        const forbidden = await request(app).get("/api/companies").set("Authorization", employerAuth);
        expect(forbidden.status).toBe(403);

        const allowed = await request(app).get("/api/companies").set("Authorization", adminAuth);
        expect(allowed.status).toBe(200);
        expect(allowed.body.totalCompanies).toBeGreaterThanOrEqual(1);
    });

    it("hides recruiter contact fields from anonymous viewers", async () => {
        const { companyId, auth } = await createCompanyAsEmployer();

        const anon = await request(app).get(`/api/companies/${companyId}`);
        expect(anon.status).toBe(200);
        expect(anon.body.data.name).toBe("Acme Technologies");
        // email/contacts are recruiter-only and must be stripped for anonymous callers.
        expect(anon.body.data.email).toBeUndefined();

        const signedIn = await request(app).get(`/api/companies/${companyId}`).set("Authorization", auth);
        expect(signedIn.body.data.email).toBe("info@acme.example.com");
    });

    it("lets an admin verify and delete a company", async () => {
        const { companyId } = await createCompanyAsEmployer();
        const { auth: adminAuth } = await createUserWithAuth("admin");

        const verified = await request(app)
            .patch(`/api/companies/${companyId}/verify`)
            .set("Authorization", adminAuth);
        expect(verified.status).toBe(200);
        expect(verified.body.data.isVerified).toBe(true);

        const deleted = await request(app)
            .delete(`/api/companies/${companyId}`)
            .set("Authorization", adminAuth);
        expect(deleted.status).toBe(200);
    });
});
