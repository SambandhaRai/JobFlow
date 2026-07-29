// Pin a known JWT secret BEFORE any app module is imported. The auth
// middleware reads process.env.JWT_SECRET directly and dotenv never overrides
// an already-set variable, so fixing it here keeps token signing (in the test
// helpers) and token verification (in the app) in agreement, regardless of
// whatever a developer's .env happens to contain.
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-jwt-secret";

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// A single in-memory MongoDB instance shared by every test in a run. Tests use
// the real Mongoose models against a throwaway database, so nothing touches a
// developer's actual MongoDB and no test can leak state into another.
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

// Wipe every collection after each test so suites stay independent regardless
// of the order Jest runs them in.
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
        await collections[key].deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});
