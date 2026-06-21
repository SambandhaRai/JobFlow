import { Response } from "express";

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

export function sendToUser(userId: string, event: string, data: unknown): void {
    const connections = clients.get(userId);
    if (!connections || connections.size === 0) return;

    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const res of connections) {
        res.write(payload);
    }
}
