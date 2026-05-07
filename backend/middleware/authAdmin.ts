import { Request, Response, NextFunction } from "express";
import { Auth } from "../auth/auth";
import jwt, { JwtPayload } from "jsonwebtoken";

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
        return;
    }


}

export const RestrictDemoAdmin = (request: Request, response: Response, next: NextFunction) => {
    try {
        const token = (request as any).token;
        if (!token) return next();

        const decoded = jwt.verify(token, process.env.JWT_KEY as string) as JwtPayload;

        if (decoded && !decoded.email.includes('awoplatfrm')) {
            response.status(403).send({
                code: 403,
                message: "Demo Account: You are only allowed to view the functionality of the admin dashboard, but cannot perform any operations.",
                data: null
            });
            return;
        }

        next();
    } catch (error) {
        next();
    }
};
