import {Request, Response} from "express";
import {db} from "../db";
import {users, userInfo} from "../db/schema";
import {AppContext} from "../types/app.context.type";
import {eq} from "drizzle-orm";
import {Statuses} from "../enums/Statuses";

export class UserController {


    constructor(private context: AppContext) {
    }

    /**
     * @param req
     * @param res
     */
    index = async (req: Request, res: Response) => {

        try {
            // const allUsers = await db.select().from(users);
            res.json([]);
        } catch (error) {
            res.status(500).json({error: "Failed to fetch users"});
        }
    }

    /**
     * @param req
     * @param res
     */
    updateUserInfo = async (req: Request, res: Response) => {

        try {

            const {countryId, timezoneId} = req.body;
            console.log(countryId, timezoneId)

            if (req.user?.id) {

                const [useInfo] = await this.context.db.select().from(userInfo).where(eq(userInfo.userId, req.user.id));

                if (useInfo) {

                    console.log('Update user info');
                    await this.context.db.update(userInfo).set({
                        userId: req.user.id,
                        countryId: countryId,
                        timezoneId: timezoneId
                    }).where(eq(userInfo.userId, req.user.id));

                } else {

                    console.log('Insert user info');
                    await this.context.db.insert(userInfo).values({
                        userId: req.user.id,
                        countryId: countryId,
                        timezoneId: timezoneId,
                    });

                }


            } else {
                res.status(400).json({message: "Invalid token"});
            }

            res.json([]);
        } catch (error) {
            res.status(500).json({error: "Failed to fetch users"});
        }
    }


}