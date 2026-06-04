import { UserRoleType } from "./user.types";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: UserRoleType;
            };
        }
    }
}

export { };