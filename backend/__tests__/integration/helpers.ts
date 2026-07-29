import jwt from "jsonwebtoken";
import {
    AdminModel,
    EmployerModel,
    IUser,
    JobSeekerModel,
} from "../../src/models/user.model";
import { UserRoleType } from "../../src/types/user.type";

// A per-run counter keeps generated emails/phones unique across every test,
// so the unique indexes on the User collection never collide.
let counter = 0;

/** Sign a JWT the same way the app does, using the secret pinned in setup.ts. */
export function tokenFor(user: Pick<IUser, "_id" | "email" | "role">): string {
    return jwt.sign(
        { id: user._id.toString(), email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "30d" },
    );
}

/** Ready-to-use Authorization header value for a user. */
export function authHeader(user: Pick<IUser, "_id" | "email" | "role">): string {
    return `Bearer ${tokenFor(user)}`;
}

/**
 * Insert a user of the given role straight into the (in-memory) database and
 * return the document. Bypassing the register endpoint lets us mint admins and
 * employers directly, which the public API deliberately won't create.
 */
export async function createUser(
    role: UserRoleType,
    overrides: Record<string, unknown> = {},
): Promise<IUser> {
    counter += 1;
    const base = {
        fullName: `Test ${role} ${counter}`,
        email: `${role}${counter}@example.com`,
        phone: `98${String(counter).padStart(8, "0")}`,
        // A placeholder hash — tests that need login go through the register
        // endpoint instead; token-based tests never check the password.
        password: "hashed-placeholder",
        ...overrides,
    };

    if (role === "employer") return EmployerModel.create({ ...base, role: "employer" });
    if (role === "admin") return AdminModel.create({ ...base, role: "admin" });
    return JobSeekerModel.create({ ...base, role: "user" });
}

/** Create a user of a role and return both the document and its auth header. */
export async function createUserWithAuth(
    role: UserRoleType,
    overrides: Record<string, unknown> = {},
): Promise<{ user: IUser; auth: string }> {
    const user = await createUser(role, overrides);
    return { user, auth: authHeader(user) };
}

/** A valid CreateJobDto body for a small-business hiring profile. */
export function jobPayload(overrides: Record<string, unknown> = {}) {
    return {
        title: "Frontend Developer",
        hiringType: "small-business",
        hiringName: "Acme Studio",
        hiringEmail: "hire@acme.example.com",
        location: "Kathmandu",
        jobType: "full-time",
        workMode: "on-site",
        experienceLevel: "entry-level",
        category: "IT & Software",
        description: "We are hiring a frontend developer to build our web app.",
        ...overrides,
    };
}
