import { Request, Response, NextFunction } from "express";
import { Auth } from "../auth/auth";

const auth = new Auth();
export const AuthenticateAdmin = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const token = request.header("Authorization")?.split(" ")[1] as string;

        if (!token) {
            response.status(401).send({
                message: "authorization needed",
            });
            return;
        }

        const isValid = await auth.verifyToken(token);
        if (!isValid) {
            response.status(401).send({
                message: 'Your session has expired or you are logged in elsewhere',
                code: 'SESSION INVALID',
                isLoggedIn: false,
                forceLogout: true
            })
            return;
        }

        (request as any).token = token;

        next();

    } catch (error) {
        response.status(401).json({
            message: 'Authentication failed',
            isLoggedIn: false,
            forceLogout: true
        });
    }


}
