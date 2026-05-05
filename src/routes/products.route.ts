import {Router} from 'express';
import {AppContext} from "../types/app.context.type";
import {authenticateJWT} from "../middlewares/auth";
import {ProductsController} from "../controller/products.controller";
import {validate, validateParams} from "../middlewares/validate";
import {IdParamSchema} from "../schemas/IdParamSchema";
import {ProductCategorySchema} from "../schemas/product.schema";
import multer from "multer";
import {storage} from "../config/storage";

const iconUploader = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 5MB
    },
});


export const ProductsRoute = (context: AppContext) => {

    const router = Router();

    const productsController = new ProductsController(context);

    router.get(
        "/",
        authenticateJWT,
        productsController.getProducts
    );


    router.get(
        "/product-categories",
        authenticateJWT,
        productsController.getProductCategories
    );

    router.get(
        "/product-category/:id",
        authenticateJWT,
        validateParams(IdParamSchema),
        productsController.getProductCategory
    );

    router.post(
        "/edit",
        iconUploader.single('icon'),
        authenticateJWT,
        validate(ProductCategorySchema),
        productsController.editProductCategories
    );

    router.delete(
        "/delete/:id",
        validateParams(IdParamSchema),
        authenticateJWT,
        productsController.deleteProductCategories
    );

    return router
}

