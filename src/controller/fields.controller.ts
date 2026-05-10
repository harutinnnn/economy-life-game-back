import {Request, Response} from "express";
import {fields, userInfo, userSeeds} from "../db/schema";
import {AppContext} from "../types/app.context.type";
import {and, eq} from "drizzle-orm";
import {db} from "../db";
import {FieldTypeEnum} from "../enums/FieldTypesEnum";
import {FieldStatusesEnum} from "../enums/FieldStatusesEnum";

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

    seedField = async (req: Request, res: Response) => {

        try {

            const {fieldId, seedType} = req.body;

            if (req.user?.id) {

                const [field] = await this.context.db.select().from(fields).where(and(
                    eq(fields.userId, req.user?.id),
                    eq(fields.id, fieldId)
                ));

                if (field) {

                    if (field.status === FieldStatusesEnum.EMPTY) {

                        const [seedWheat] = await db.select().from(userSeeds).where(and(
                            eq(userSeeds.userId, req.user?.id), eq(userSeeds.seedType, FieldTypeEnum.WHEAT)
                        ))

                        if (seedWheat && Number(seedWheat.count) > 0) {

                            const wheatDurationSec: number = 100;
                            const dateNow = new Date();
                            const endDate = new Date();
                            endDate.setSeconds(endDate.getSeconds() + wheatDurationSec);

                            const seeding = await this.context.db.update(fields).set({
                                status: FieldStatusesEnum.IN_PROGRESS,
                                startProgressTime: dateNow,
                                endProgressTime: endDate,
                                durationBySeconds: wheatDurationSec

                            }).where(eq(fields.id, field.id));

                            const take = await this.context.db.update(userSeeds).set({
                                count: Number(seedWheat.count) - 1,
                            }).where(eq(userSeeds.id, seedWheat.id));

                            res.status(200).json(seeding);

                        } else {

                            res.status(200).json({error: "You dont have seeds. Please buy seeds from marketplace!"});
                        }

                    } else {

                        res.status(200).json({error: "The filed not empty!"});
                    }


                } else {
                    res.status(200).json({error: "The filed not found!"});
                }

            } else {
                res.status(500).json({error: "Failed to fetch users"});
            }

        } catch (e) {
            console.error(e);
            res.status(500).json({error: "Failed to fetch users"});
        }

    }
}