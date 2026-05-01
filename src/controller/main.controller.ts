import {AppContext} from "../types/app.context.type";
import {countries, timezones, userInfo} from "../db/schema";
import {eq} from "drizzle-orm";
import {Request, Response} from "express";

export class MainController {


    constructor(private context: AppContext) {
    }


    getCountries = async (req: Request, res: Response) => {

        try {

            const countryList = await this.context.db.select().from(countries);

            res.json({
                countries: countryList,
            });

        } catch (err) {
            console.log(err);
            res.status(400).json({message: "Invalid token"});
        }
    }

    getTimezones = async (req: Request, res: Response) => {

        const {countryId} = req.params;

        try {

            const timezoneList = await this.context.db.select().from(timezones).where(eq(timezones.countryId, Number(countryId)));

            res.json({
                timezones: timezoneList,
            });

        } catch (err) {
            console.log(err);
            res.status(400).json({message: "Invalid token"});
        }
    }

}