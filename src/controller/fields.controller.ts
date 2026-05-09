import {Request, Response} from "express";
import {fields, userInfo} from "../db/schema";
import {AppContext} from "../types/app.context.type";
import {eq} from "drizzle-orm";
import {db} from "../db";
import {FieldTypeEnum} from "../enums/FieldTypesEnum";

export class FieldsController {


    constructor(private context: AppContext) {
    }

    /**
     * @param req
     * @param res
     */
    index = async (req: Request, res: Response) => {

        try {

            if (req.user?.id) {

                let fieldList = await db.select().from(fields).where(eq(
                    fields.userId, req.user?.id
                ));
                console.log(fieldList);

                if (!fieldList.length) {

                    await this.context.db.insert(fields).values({
                        userId: req.user.id,
                        fieldType: FieldTypeEnum.WHEAT
                    })

                    fieldList = await db.select().from(fields).where(eq(
                        fields.userId, req.user?.id
                    ));

                }

                res.json({
                    fields: fieldList
                });

            } else {
                res.status(400).json({message: "Invalid token"});
            }

        } catch (error) {
            res.status(500).json({error: "Failed to fetch users"});
        }
    }
}