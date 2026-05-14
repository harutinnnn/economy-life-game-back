import {Request, Response} from "express";
import {userInfo} from "../db/models/user";
import {AppContext} from "../types/app.context.type";
import {eq} from "drizzle-orm";
import {CITY_AVAILABLE, UserGameLocations} from "../enums/UserGameLocations";

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

            const {countryId, timezoneId, userGameLocation} = req.body;
            console.log(countryId, timezoneId, userGameLocation)

            if (req.user?.id) {

                const [useInfo] = await this.context.db.select().from(userInfo).where(eq(userInfo.userId, req.user.id));

                if (useInfo) {

                    //TODO important if user set userGameLocation => country need check level of user and game money too


                    if (userGameLocation === UserGameLocations.VILLAGE) {

                        await this.context.db.update(userInfo).set({
                            userId: req.user.id,
                            countryId: countryId,
                            timezoneId: timezoneId
                        }).where(eq(userInfo.userId, req.user.id));

                    } else if (userGameLocation === UserGameLocations.VILLAGE && req.user.level >= CITY_AVAILABLE) {

                        await this.context.db.update(userInfo).set({
                            userId: req.user.id,
                            countryId: countryId,
                            timezoneId: timezoneId,
                            userGameLocation: userGameLocation
                        }).where(eq(userInfo.userId, req.user.id));


                    } else {
                        res.status(400).json({message: `Need level ${CITY_AVAILABLE} for relocate to city!`});
                    }

                } else {

                    await this.context.db.insert(userInfo).values({
                        userId: req.user.id,
                        countryId: countryId,
                        timezoneId: timezoneId
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