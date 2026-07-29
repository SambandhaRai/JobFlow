/** @type {import('jest').Config} */

// Both project types compile TypeScript the same way, via the test tsconfig.
const tsTransform = {
    "^.+\\.ts$": [
        "ts-jest",
        { tsconfig: "<rootDir>/tsconfig.jest.json" },
    ],
};

module.exports = {
    // Two separate projects so the layers never share setup:
    //  - unit:        pure, mock-based, NO database. Fast and isolated.
    //  - integration: real request path through an in-memory MongoDB.
    projects: [
        {
            displayName: "unit",
            testEnvironment: "node",
            transform: tsTransform,
            roots: ["<rootDir>/__tests__/unit"],
            testMatch: ["**/*.test.ts"],
            // Restore spied-on methods to their originals before each test so a
            // stub set in one test can never leak into the next.
            clearMocks: true,
            restoreMocks: true,
            // Only pins the JWT secret — deliberately no MongoDB is started.
            setupFilesAfterEnv: ["<rootDir>/__tests__/unit/setup.unit.ts"],
        },
        {
            displayName: "integration",
            testEnvironment: "node",
            transform: tsTransform,
            roots: ["<rootDir>/__tests__/integration"],
            testMatch: ["**/*.test.ts"],
            clearMocks: true,
            // Boots/tears down the in-memory MongoDB and clears it per test.
            setupFilesAfterEnv: ["<rootDir>/__tests__/integration/setup.ts"],
            // mongodb-memory-server may download its binary on the first run.
            testTimeout: 30000,
        },
    ],
};
