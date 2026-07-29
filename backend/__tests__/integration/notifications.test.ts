import request from "supertest";
import mongoose from "mongoose";
import app from "../../src/app";
import { createUserWithAuth } from "./helpers";

// The /stream endpoint holds an open Server-Sent-Events connection, so it is
// intentionally left out here — Supertest would hang waiting for the response
// to end. These cover the regular REST endpoints around it.
describe("notification endpoints", () => {
    it("returns 401 without a token", async () => {
        const res = await request(app).get("/api/notifications");
        expect(res.status).toBe(401);
    });

    it("returns an empty list and zero unread for a new user", async () => {
        const { auth } = await createUserWithAuth("user");

        const list = await request(app).get("/api/notifications").set("Authorization", auth);
        expect(list.status).toBe(200);
        expect(list.body.data).toEqual([]);
        expect(list.body.unreadCount).toBe(0);

        const count = await request(app).get("/api/notifications/unread-count").set("Authorization", auth);
        expect(count.status).toBe(200);
        expect(count.body.data.unreadCount).toBe(0);
    });

    it("marks all as read without error", async () => {
        const { auth } = await createUserWithAuth("user");
        const res = await request(app).patch("/api/notifications/read-all").set("Authorization", auth);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it("returns 404 when marking a non-existent notification as read", async () => {
        const { auth } = await createUserWithAuth("user");
        const res = await request(app)
            .patch(`/api/notifications/${new mongoose.Types.ObjectId()}/read`)
            .set("Authorization", auth);
        expect(res.status).toBe(404);
    });
});
