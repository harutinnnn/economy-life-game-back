import {Router} from 'express';
import {AppContext} from "../types/app.context.type";
import {UserController} from "../controller/user.controller";
import {authenticateJWT} from "../middlewares/auth";
import {validate} from "../middlewares/validate";
import {UserInfoSchema} from "../schemas/user.schema";
import {FieldsController} from "../controller/fields.controller";

export const fieldsRouter = (context: AppContext) => {

    const router = Router();


    const fieldsController = new FieldsController(context);

    router.get(
        "/",
        authenticateJWT,
        fieldsController.index
    );


    return router
}

