require("dotenv").config();

import express, { type Application } from "express";
import cors from "cors";
import mongoose from "mongoose";
import passport from "passport";
import session from "express-session";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import routes from "./routes";

mongoose.connect(process.env.MONGO_URI!); // MongoDB

const app: Application = express();
const server = require("http").createServer(app);

/* Middlewares */
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
    rateLimit({
        windowMs: 5 * 60 * 1000,
        max: 1000,
        message: "Too many requests from this IP, please try again later.",
    }),
);

// Session
app.use(
    session({
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false,
    }),
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", routes);

// Start the server
server.listen(process.env.PORT, () => console.log(`pwrapp is running on port ${process.env.PORT}`));
