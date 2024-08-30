require("dotenv").config();

import path from "path";
import express from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = express();
const port = 3000;

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "..", "..", "demo", "static")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "demo", "static", "index.html"));
});

app.get("/user", (req, res) => {
    const { uid } = req.query;

    if (uid)
        return res.sendFile(path.join(__dirname, "..", "..", "demo", "static", "user.html"));

    // Parse user cookie
    const user = req.cookies["user-token"];
    if (!user) return res.status(401).send({ message: "Unauthorized" });

    // Decrypt JWT
    const decoded: any = jwt.verify(user, process.env.APP_TOKEN!);

    return res.redirect("/user?uid=" + decoded.id + "&wallet=" + decoded.wallet);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
