import { Router } from "express";

/* ROUTES */
import discord from "./auth/discord";
import google from "./auth/google";

const router = Router();

router.use("/discord", discord);
router.use("/google", google);

export default router;
