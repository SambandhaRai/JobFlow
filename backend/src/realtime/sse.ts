import { Response } from "express";

// In-memory registry of active Server-Sent Events connections, keyed by user id.
// A single user may have several open tabs, so each maps to a set of responses.
// This lives in process memory, which is the right scope for a single long-running
// Node server. Scaling to multiple instances would require a shared pub/sub (e.g.
// Redis) so an event created on one instance reaches clients on another.
const clients = new Map<string, Set<Response>>();

export function addClient(userId: string, res: Response): void {
    let connections = clients.get(userId);
    if (!connections) {
        connections = new Set();
        clients.set(userId, connections);
    }
    connections.add(res);
}

export function removeClient(userId: string, res: Response): void {
    const connections = clients.get(userId);
    if (!connections) return;

    connections.delete(res);
    if (connections.size === 0) {
        clients.delete(userId);
    }
}

// Push a named event with a JSON payload to every open connection for a user.
// No-ops when the user has no active connection (they'll see it via REST instead).
export function sendToUser(userId: string, event: string, data: unknown): void {
    const connections = clients.get(userId);
    if (!connections || connections.size === 0) return;

    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of connections) {
        res.write(payload);
    }
}
