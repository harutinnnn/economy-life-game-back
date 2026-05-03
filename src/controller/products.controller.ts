import {AppContext} from "../types/app.context.type";
import {countries, products, timezones, userInfo} from "../db/schema";
import {eq} from "drizzle-orm";
import {Request, Response} from "express";
import {checkIsAdmin} from "../helpers/userHelper";
import {UserRoles} from "../enums/UserRoles";

export class ProductsController {


    constructor(private context: AppContext) {
    }


    getProducts = async (req: Request, res: Response) => {

        if (req?.user?.role) {
            checkIsAdmin(req.user.role as UserRoles)
        }

        try {

            const productsList = await this.context.db.select().from(products);

            res.json({
                products: productsList,
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