import {Router} from 'express';
import {AppContext} from "../types/app.context.type";
import {UserController} from "../controller/user.controller";
import {authenticateJWT} from "../middlewares/auth";
import {validate} from "../middlewares/validate";
import {UserInfoSchema} from "../schemas/user.schema";

export const userRouter = (context: AppContext) => {

    const router = Router();


    const userController = new UserController(context);

    router.get(
        "/",
        authenticateJWT,
        userController.index
    );

    router.post(
        "/update-user-info",
        authenticateJWT,
        validate(UserInfoSchema),
        userController.updateUserInfo
    );


    return router
}

