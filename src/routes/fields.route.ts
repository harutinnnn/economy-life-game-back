import {Router} from 'express';
import {AppContext} from "../types/app.context.type";
import {authenticateJWT} from "../middlewares/auth";
import {validate} from "../middlewares/validate";
import {FieldsController} from "../controller/fields.controller";
import {SeedFieldSchema} from "../schemas/fields.schema";

export const fieldsRouter = (context: AppContext) => {

    const router = Router();


    const fieldsController = new FieldsController(context);

    router.get(
        "/",
        authenticateJWT,
        fieldsController.index
    );

    router.post(
        "/seed-field",
        authenticateJWT,
        validate(SeedFieldSchema),
        fieldsController.seedField
    );


    return router
}

