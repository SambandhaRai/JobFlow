import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { UserService } from "../../src/services/user.service";
import { UserRepository } from "../../src/repositories/user.repository";

// A true unit test: the service under test is exercised in isolation while
// every UserRepository method it touches is replaced with a spy, so no MongoDB
// is involved. `restoreMocks: true` (see jest.config) resets these per test.
const service = new UserService();
const oid = () => new mongoose.Types.ObjectId();

describe("UserService.registerUser", () => {
    const validInput = {
        fullName: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
        confirmPassword: "password123",
        phone: "9812345678",
        role: "user",
    } as any;

    it("rejects an already-registered email with 403", async () => {
        jest.spyOn(UserRepository.prototype, "getUserByEmail").mockResolvedValue({ _id: oid() } as any);

        await expect(service.registerUser(validInput)).rejects.toMatchObject({ statusCode: 403 });
    });

    it("rejects an already-used phone with 403", async () => {
        jest.spyOn(UserRepository.prototype, "getUserByEmail").mockResolvedValue(null);
        jest.spyOn(UserRepository.prototype, "getUserByPhone").mockResolvedValue({ _id: oid() } as any);

        await expect(service.registerUser(validInput)).rejects.toMatchObject({ statusCode: 403 });
    });

    it("hashes the password before saving and returns a signed token", async () => {
        const created = { _id: oid(), email: validInput.email, role: "user" };
        jest.spyOn(UserRepository.prototype, "getUserByEmail").mockResolvedValue(null);
        jest.spyOn(UserRepository.prototype, "getUserByPhone").mockResolvedValue(null);
        const createSpy = jest
            .spyOn(UserRepository.prototype, "createUser")
            .mockResolvedValue(created as any);

        const result = await service.registerUser(validInput);

        expect(typeof result.token).toBe("string");
        // The repository must receive a bcrypt hash, never the plaintext.
        const savedData = createSpy.mock.calls[0][0] as { password: string };
        expect(savedData.password).not.toBe("password123");
        expect(await bcryptjs.compare("password123", savedData.password)).toBe(true);
    });
});

describe("UserService.loginUser", () => {
    it("throws 404 when no user matches the email", async () => {
        jest.spyOn(UserRepository.prototype, "getUserByEmail").mockResolvedValue(null);

        await expect(
            service.loginUser({ email: "nobody@example.com", password: "password123" }),
        ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("throws 401 when the password does not match", async () => {
        const hash = await bcryptjs.hash("correct-password", 10);
        jest.spyOn(UserRepository.prototype, "getUserByEmail").mockResolvedValue({
            _id: oid(),
            email: "jane@example.com",
            role: "user",
            password: hash,
        } as any);

        await expect(
            service.loginUser({ email: "jane@example.com", password: "wrong-password" }),
        ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("returns a token when the password matches", async () => {
        const hash = await bcryptjs.hash("correct-password", 10);
        const user = { _id: oid(), email: "jane@example.com", role: "user", password: hash };
        jest.spyOn(UserRepository.prototype, "getUserByEmail").mockResolvedValue(user as any);

        const result = await service.loginUser({ email: user.email, password: "correct-password" });

        expect(result.user).toBe(user);
        expect(typeof result.token).toBe("string");
    });
});

describe("UserService.saveJob", () => {
    it("rejects a malformed job id with 400", async () => {
        await expect(service.saveJob(oid().toString(), "not-an-id")).rejects.toMatchObject({
            statusCode: 400,
        });
    });

    it("forbids a non-job-seeker from saving a job with 403", async () => {
        jest.spyOn(UserRepository.prototype, "getUserById").mockResolvedValue({
            _id: oid(),
            role: "employer",
        } as any);

        await expect(service.saveJob(oid().toString(), oid().toString())).rejects.toMatchObject({
            statusCode: 403,
        });
    });

    it("adds the job for a valid job seeker", async () => {
        const userId = oid().toString();
        const jobId = oid().toString();
        jest.spyOn(UserRepository.prototype, "getUserById").mockResolvedValue({
            _id: userId,
            role: "user",
        } as any);
        const addSpy = jest
            .spyOn(UserRepository.prototype, "addSavedJob")
            .mockResolvedValue({ _id: userId, savedJobs: [jobId] } as any);

        const result = await service.saveJob(userId, jobId);

        expect(addSpy).toHaveBeenCalledWith(userId, jobId);
        expect(result).toMatchObject({ savedJobs: [jobId] });
    });
});
