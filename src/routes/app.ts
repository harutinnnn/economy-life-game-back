import cors from "cors";
import express from "express";
import passport from "../config/passport";
import {AppContext} from "../types/app.context.type";
import {authRouter} from "./auth.route";
import {userRouter} from "./user.route";
import path from "node:path";
import * as http from "node:http";

export const createApp = (context: AppContext) => {

    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(passport.initialize());
    app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

    app.use(cors());
    app.use(express.json());

    app.use(passport.initialize());

    app.use('/api/auth', authRouter(context));
    app.use('/api/users', userRouter(context));

    return http.createServer(app);

}
