import {Request, Response} from "express";
import {fields, userCollectedSeeds, users, userSeeds} from "../db/schema";
import {AppContext} from "../types/app.context.type";
import {and, eq} from "drizzle-orm";
import {db} from "../db";
import {FieldTypeEnum} from "../enums/FieldTypesEnum";
import {FieldStatusesEnum} from "../enums/FieldStatusesEnum";
import {CollectFieldsEnumXP} from "../enums/CollectFieldsEnumXP";

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

    /**
     * @param req
     * @param res
     */
    collectField = async (req: Request, res: Response) => {

        //TODO check is duration end
        try {

            const {id} = req.params;

            if (req.user?.id) {

                const [field] = await this.context.db.select().from(fields).where(
                    and(
                        eq(fields.userId, req.user?.id),
                        eq(fields.id, Number(id))
                    )
                );


                if (field && field.status == FieldStatusesEnum.IN_PROGRESS && field.startProgressTime && field.endProgressTime) {
                    const now = Date.now();
                    const start = new Date(field.endProgressTime);

                    if (((start.getTime()) - now) / 1000 <= 0) {

                        this.context.db.transaction(async (trx: any) => {


                            const [user] = await trx.select().from(users).where(eq(users.id, Number(req.user?.id)));

                            await trx.update(users).set({
                                xp: user.xp + CollectFieldsEnumXP.WHEAT
                            }).where(
                                eq(users.id, Number(req.user?.id))
                            )

                            await trx.update(fields).set({
                                status: FieldStatusesEnum.EMPTY,
                            }).where(
                                and(
                                    eq(fields.id, Number(id)),
                                    eq(fields.userId, Number(req.user?.id))
                                )
                            )


                            const [userSeed] = await trx.select().from(userCollectedSeeds)
                                .where(
                                    and(
                                        eq(userCollectedSeeds.userId, Number(req.user?.id)),
                                        eq(userCollectedSeeds.seedType, FieldTypeEnum.WHEAT)
                                    )
                                );

                            if (userSeed) {

                                await trx.update(userCollectedSeeds).set({
                                    count: userSeed.count + 1,
                                }).where(
                                    eq(userCollectedSeeds.id, userSeed.id)
                                )

                            } else {
                                throw Error('Failed to fetch seeds');
                            }

                            return res.json({
                                fields: field
                            });

                        }).catch((err: any) => {
                            console.error(err);

                            return res.status(500).json({error: "Some thing went wrong"});

                        })
                    } else {
                        return res.status(200).json({error: "The field not ready for collect!"});
                    }

                }

            } else {
                return res.status(400).json({message: "Invalid token"});
            }

        } catch (error) {
            console.log(error);
            return res.status(500).json({error: "Failed to fetch users"});
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

                            const wheatDurationSec: number = 30;
                            const dateNow = new Date();
                            const endDate = new Date();
                            endDate.setSeconds(endDate.getSeconds() + wheatDurationSec);

                            const seeding = await this.context.db.update(fields).set({
                                status: FieldStatusesEnum.IN_PROGRESS,
                                startProgressTime: dateNow,
                                endProgressTime: endDate,
                                durationBySeconds: wheatDurationSec

                            }).where(eq(fields.id, field.id));

                            await this.context.db.update(userSeeds).set({
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
            console.log(e)
            res.status(500).json({error: "Failed to fetch users"});
        }

    }
}