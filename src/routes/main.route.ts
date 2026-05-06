import {Router} from 'express';
import {AppContext} from "../types/app.context.type";
import {MainController} from "../controller/main.controller";

export const mainRouter = (context: AppContext) => {

    const router = Router();

    const mainController = new MainController(context);

    router.get(
        "/countries",
        mainController.getCountries
    );

    router.get(
        "/timezones/:countryId",
        mainController.getTimezones
    );

    router.get(
        "/users-by-country",
        mainController.usersByCountry
    );
    return router
}

