import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../src/app";
import { JWT_SECRET } from "../../src/config";

// The forgot-password flow calls sendEmail, which would try to reach a real
// SMTP server. Stub the whole email module so the test stays hermetic and we
// can assert the endpoint's behaviour without sending anything.
jest.mock("../../src/config/email", () => ({
    sendEmail: jest.fn().mockResolvedValue(undefined),
}));

import { sendEmail } from "../../src/config/email";

const validUser = {
    fullName: "Test User",
    email: "test.user@example.com",
    password: "password123",
    confirmPassword: "password123",
    phone: "9800000000",
    role: "user" as const,
};

/** Register a user and return the parsed response body. */
async function register(overrides: Record<string, unknown> = {}) {
    return request(app)
        .post("/api/auth/register")
        .send({ ...validUser, ...overrides });
}

describe("POST /api/auth/register", () => {
    it("creates a new job seeker and returns a valid JWT", async () => {
        const res = await register();

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("User registered successfully");
        expect(res.body.data.email).toBe(validUser.email);
        // toJSON on the model strips the password — it must never leak.
        expect(res.body.data.password).toBeUndefined();

        // The token must be a real JWT signed with the app's secret and carry
        // the user's id, email and role.
        const decoded = jwt.verify(res.body.token, JWT_SECRET) as {
            id: string;
            email: string;
            role: string;
        };
        expect(decoded.email).toBe(validUser.email);
        expect(decoded.role).toBe("user");
        expect(decoded.id).toBe(res.body.data._id);
    });

    it("rejects a payload whose passwords do not match (400)", async () => {
        const res = await register({ confirmPassword: "different123" });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors).toBeDefined();
    });

    it("rejects an invalid email (400)", async () => {
        const res = await register({ email: "not-an-email" });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("refuses to self-register as admin (400)", async () => {
        const res = await register({ role: "admin" });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it("rejects a duplicate email (403)", async () => {
        await register();
        const res = await register({ phone: "9811111111" });

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Email is already in use");
    });

    it("rejects a duplicate phone number (403)", async () => {
        await register();
        const res = await register({ email: "someone.else@example.com" });

        expect(res.status).toBe(403);
        expect(res.body.message).toBe("Phone number is already in use");
    });
});

describe("POST /api/auth/login", () => {
    beforeEach(async () => {
        await register();
    });

    it("logs in with correct credentials and returns a token", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: validUser.email, password: validUser.password });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Login successful");
        expect(res.body.data.email).toBe(validUser.email);
        expect(res.body.data.password).toBeUndefined();
        expect(typeof res.body.token).toBe("string");
    });

    it("returns 401 for a wrong password", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: validUser.email, password: "wrongpassword" });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Invalid credentials");
    });

    it("returns 404 for an unknown email", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "nobody@example.com", password: "password123" });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("User not found");
    });

    it("returns 400 when the body fails validation", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: validUser.email });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe("POST /api/auth/forgot-password", () => {
    it("sends a reset email for a known account (200)", async () => {
        await register();

        const res = await request(app)
            .post("/api/auth/forgot-password")
            .send({ email: validUser.email });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(sendEmail).toHaveBeenCalledTimes(1);
        expect(sendEmail).toHaveBeenCalledWith(
            validUser.email,
            expect.any(String),
            expect.any(String),
            expect.any(String),
        );
    });

    it("returns 404 for an unknown account and sends no email", async () => {
        const res = await request(app)
            .post("/api/auth/forgot-password")
            .send({ email: "nobody@example.com" });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("No account found with that email");
        expect(sendEmail).not.toHaveBeenCalled();
    });
});
