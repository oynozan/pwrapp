import { Router } from "express";
import passport from "passport";
import { PWRWallet } from "@pwrjs/core";
import { Strategy as DiscordStrategy } from "passport-discord";

import appDB from "../../db/App";
import userDB from "../../db/User";
import Encryption from "../../funcs/encryption";

const router = Router();

// Discord Strategy
passport.use(
    new DiscordStrategy(
        {
            clientID: process.env.DISCORD_CLIENT_ID as string,
            clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
            callbackURL: process.env.DISCORD_REDIRECT_URI as string,
            scope: ["identify", "email"],
            passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                const { id: discordId, email, avatar: raw_avatar } = profile;
                const appID = (req.session as any)?.appID;
                if (!appID) return done(new Error("Invalid application ID"), undefined);

                const app = await appDB.findOne({ _id: appID });
                if (!app) return done(new Error("Application not found"), undefined);

                (req.session as any).redirect = app.redirect;
                let user: any;

                // Check if user is already registered
                const existingUser = await userDB.findOne({
                    appID,
                    _id: discordId,
                });
                if (!existingUser) {
                    // Generate PWR Wallet
                    const wallet = new PWRWallet();
                    const address = wallet.getAddress();
                    const privateKey = wallet.getPrivateKey();

                    // Register user
                    const pfp = `https://cdn.discordapp.com/avatars/${discordId}/${raw_avatar}.png`;
                    const newUser = new userDB({
                        _id: discordId,
                        wallet: address,
                        privateKey,
                        appID,
                        email,
                        pfp,
                        type: "discord",
                    });

                    user = await newUser.save();
                }

                // User already exists
                else {
                    // Get user
                    user = await userDB.findOne(
                        { appID, _id: discordId },
                        { _id: 0, __v: 0 },
                        { lean: true },
                    );
                }

                done(null, { id: discordId, appID, redirect: app.redirect, wallet: user.wallet });
            } catch (error) {
                done(error, undefined);
            }
        },
    ),
);

// Serialize user to session
passport.serializeUser((user: any, done) => {
    done(null, {
        id: user.id,
        appID: user.appID,
        redirect: user.redirect,
        wallet: user.wallet,
    });
});

// Deserialize user from session
passport.deserializeUser(async (user: { id: string; appID: string; redirect: string; wallet: string; }, done) => {
    try {
        const userRecord = await userDB.findOne(
            { _id: user.id, appID: user.appID },
            { _id: 0, __v: 0 },
            { lean: true },
        );
        done(null, userRecord);
    } catch (error) {
        done(error, undefined);
    }
});

/**
 * @description Discord OAuth route
 */
router.get(
    "/",
    (req, res, next) => {
        try {
            const { appID } = req.query;
            if (!appID) {
                return res.status(400).json({ error: "Application ID is required" });
            }

            (req.session as any).appID = appID;
            return next();
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "An error occured" });
        }
    },
    passport.authenticate("discord"),
);

/**
 * @description Callback route for Discord OAuth
 */
router.get(
    "/callback",
    passport.authenticate("discord", {
        failureRedirect: "/failed",
    }),
    async (req, res) => {
        try {
            const userSession = (req.session as any)?.passport?.user;

            if (req.isAuthenticated() && userSession) {
                // Get app token
                const app = await appDB.findOne({ _id: userSession.appID }, { token: 1 });
                if (!app) return res.redirect("/failed");

                const token = app.token;

                // Set cookie for the user
                res.cookie(
                    "user-token",
                    Encryption.generateJwt(
                        { id: userSession.id, wallet: userSession.wallet },
                        "90d",
                        token,
                    ),
                    {
                        maxAge: 1000 * 60 * 60 * 24 * 90,
                        httpOnly: true,
                    },
                );

                // Redirect to the application
                res.redirect(`${userSession.redirect}?appID=${userSession.appID}`);
            } else res.redirect("/failed");
        } catch (error) {
            console.error(error);
            return res.redirect("/failed");
        }
    },
);

export default router;
