import type { NextFunction, Request, Response } from "express";

import appDB from "../db/App";

function extractBearerToken(req: Request) {
    const authHeader =
        (req.headers?.Authorization as string) ?? (req.headers?.authorization as string);

    if (authHeader && authHeader.startsWith("Bearer")) return authHeader.split(" ")[1];
    return null;
}

export async function verifyApp(req: Request, res: Response, next: NextFunction) {
    try {
        const token = extractBearerToken(req);
        if (!token) return res.status(401).send({ message: "Unauthorized" });

        // Verify the token
        const app = await appDB.findOne({ token }, {}, { lean: true });
        if (!app) return res.status(401).send({ message: "Unauthorized" });

        // Attach the app to the request object
        (req as any).app = app;

        return next();
    } catch (e) {
        console.error(e);
        return res.status(500).send({ message: "An error occured." });
    }
}
