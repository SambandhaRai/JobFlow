// Unit tests never touch MongoDB — every repository call is mocked — so this
// setup only pins the JWT secret used when services sign tokens. It must match
// what the app would use so any decoded-token assertions line up.
process.env.JWT_SECRET = process.env.JWT_SECRET ?? "test-jwt-secret";
