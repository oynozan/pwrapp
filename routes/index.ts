import { z } from "zod";
import { randomUUID } from "crypto";
import { type Request, Router } from "express";

import appDB, { type IApp } from "../db/App";
import { verifyApp } from '../funcs/middleware';

/* ROUTES */
import auth from "./auth";
import wallet from "./wallet";

const router = Router();

router.use("/auth", auth);
router.use("/wallet", wallet);

/**
 * @description Sign an application up for the API
 */
router.post("/sign-application", async (req, res) => {
    const body = req.body;

    // Validate the request body
    const schema = z.object({
        name: z.string().min(3).max(100),
        redirect: z.string().url().startsWith("http"),
    });

    try {
        var { name, redirect } = schema.parse(body);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: "Invalid request body" });
    }

    // Generate a unique appID and token
    const appID = randomUUID();
    const token = randomUUID();

    // Create a new application document
    const newApplication = new appDB({
        _id: appID,
        name,
        redirect,
        token,
    });

    // Save the application to the database
    await newApplication.save();

    return res.send({ appID, token });
});

/**
 * @description Update the name of the application
 */
router.post("/update-name", verifyApp, async (req, res) => {
    const body = req.body;

    // Validate the request body
    const schema = z.object({
        name: z.string().min(3).max(100),
    });

    try {
        var { name } = schema.parse(body);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: "Invalid request body" });
    }

    // Update the application name
    const { app } = req as any;
    await appDB.updateOne({ _id: app._id }, { $set: { name } });

    return res.send({ message: "OK" });
});

/**
 * @description Update the redirect URL of the application
 */
router.post("/update-redirect", verifyApp, async (req, res) => {
    const body = req.body;

    // Validate the request body
    const schema = z.object({
        redirect: z.string().url().startsWith("http"),
    });

    try {
        var { redirect } = schema.parse(body);
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: "Invalid request body" });
    }

    // Update the application redirect URL
    const { app } = req as any;
    await appDB.updateOne({ _id: app._id }, { $set: { redirect } });

    return res.send({ message: "OK" });
});

/**
 * @description Failed to login route
 */
router.get("/failed", (req, res) => {
    return res.send("Failed to login");
});

export type AppRequest = Request & { app: IApp };
export default router;
