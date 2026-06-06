export class HttpError extends Error {
    public statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = "HttpError";

        // Maintain proper stack trace
        Object.setPrototypeOf(this, HttpError.prototype);
    }
}