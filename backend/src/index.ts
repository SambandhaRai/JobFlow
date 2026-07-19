import app from "./app";
import { PORT } from "./config";
import { connectDatabase } from "./database/mongoose";

async function start() {
    await connectDatabase();

    let failed = false;

    const server = app.listen(PORT);

    // Without this, a failed bind is silent: nothing is logged and the process
    // sits there serving nothing, which looks identical to a healthy start.
    server.on("error", (error: NodeJS.ErrnoException) => {
        failed = true;

        if (error.code === "EADDRINUSE") {
            console.error(
                `Port ${PORT} is already in use. Another process is bound to it — ` +
                `stop that process or set a different PORT in .env.`
            );
        } else {
            console.error("Failed to start server:", error);
        }
        process.exit(1);
    });

    // "listening" can still fire on a partially-bound dual-stack socket that
    // then errors, so defer the success log by a tick and skip it if the bind
    // turned out to have failed. Otherwise startup logs a URL that never serves.
    server.on("listening", () => {
        setImmediate(() => {
            if (!failed) console.log(`Server: http://localhost:${PORT}`);
        });
    });
}

start().catch((error) => {
    console.error("Startup failed:", error);
    process.exit(1);
});