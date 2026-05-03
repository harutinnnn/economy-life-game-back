import {Router} from 'express';
import {AppContext} from "../types/app.context.type";
import {MainController} from "../controller/main.controller";
import {authenticateJWT} from "../middlewares/auth";
import {ProductsController} from "../controller/products.controller";

export const ProductsRoute = (context: AppContext) => {

    const router = Router();

    const productsController = new ProductsController(context);

    router.get(
        "/",
        authenticateJWT,
        productsController.getProducts
    );

    return router
}

