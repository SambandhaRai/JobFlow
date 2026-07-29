import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/app";
import { createUserWithAuth } from "./helpers";

describe("GET /api/users/me", () => {
    it("returns 401 without a token", async () => {
        const res = await request(app).get("/api/users/me");
        expect(res.status).toBe(401);
    });

    it("returns the signed-in user's profile", async () => {
        const { user, auth } = await createUserWithAuth("user");

        const res = await request(app).get("/api/users/me").set("Authorization", auth);

        expect(res.status).toBe(200);
        expect(res.body.data.email).toBe(user.email);
        expect(res.body.data.password).toBeUndefined();
    });
});

describe("PUT /api/users/me", () => {
    it("updates basic profile fields", async () => {
        const { auth } = await createUserWithAuth("user");

        const res = await request(app)
            .put("/api/users/me")
            .set("Authorization", auth)
            .send({ fullName: "Renamed User" });

        expect(res.status).toBe(200);
        expect(res.body.data.fullName).toBe("Renamed User");
    });

    it("forbids an employer from editing job-seeker-only fields (403)", async () => {
        const { auth } = await createUserWithAuth("employer");

        const res = await request(app)
            .put("/api/users/me")
            .set("Authorization", auth)
            .send({ skills: ["react"] });

        expect(res.status).toBe(403);
    });
});

describe("job-seeker-only saved jobs guard", () => {
    it("forbids an employer from listing saved jobs (403)", async () => {
        const { auth } = await createUserWithAuth("employer");

        const res = await request(app).get("/api/users/me/saved-jobs").set("Authorization", auth);

        expect(res.status).toBe(403);
    });

    it("returns an empty saved-jobs list for a new job seeker", async () => {
        const { auth } = await createUserWithAuth("user");

        const res = await request(app).get("/api/users/me/saved-jobs").set("Authorization", auth);

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
    });
});

describe("admin-only user management", () => {
    it("forbids a non-admin from listing all users (403)", async () => {
        const { auth } = await createUserWithAuth("user");

        const res = await request(app).get("/api/users").set("Authorization", auth);

        expect(res.status).toBe(403);
    });

    it("lets an admin list users", async () => {
        const { auth } = await createUserWithAuth("admin");
        await createUserWithAuth("user");

        const res = await request(app).get("/api/users").set("Authorization", auth);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.totalUsers).toBeGreaterThanOrEqual(2);
    });

    it("returns 404 for a non-existent user id", async () => {
        const { auth } = await createUserWithAuth("admin");
        const missingId = new mongoose.Types.ObjectId().toString();

        const res = await request(app).get(`/api/users/${missingId}`).set("Authorization", auth);

        expect(res.status).toBe(404);
    });

    it("lets an admin delete a user", async () => {
        const { auth } = await createUserWithAuth("admin");
        const { user } = await createUserWithAuth("user");

        const res = await request(app)
            .delete(`/api/users/${user._id.toString()}`)
            .set("Authorization", auth);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
