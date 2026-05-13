import {Router} from 'express';
import {AppContext} from "../types/app.context.type";
import {authenticateJWT} from "../middlewares/auth";
import {ProductsController} from "../controller/products.controller";
import {validate, validateParams} from "../middlewares/validate";
import {IdParamSchema} from "../schemas/IdParamSchema";
import {ProductCategorySchema, ProductSchema} from "../schemas/product.schema";
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
        "/goup-by",
        authenticateJWT,
        productsController.getProductsCategoriesGrouped
    );


    router.get(
        "/product-categories",
        authenticateJWT,
        productsController.getProductCategories
    );

    router.post(
        "/buy-product/:id",
        authenticateJWT,
        productsController.buyProduct
    );

    router.get(
        "/product-category/:id",
        authenticateJWT,
        validateParams(IdParamSchema),
        productsController.getProductCategory
    );

    router.post(
        "/edit-category",
        iconUploader.single('icon'),
        authenticateJWT,
        validate(ProductCategorySchema),
        productsController.editProductCategories
    );

    router.delete(
        "/delete-category/:id",
        validateParams(IdParamSchema),
        authenticateJWT,
        productsController.deleteProductCategories
    );


    router.get(
        "/product/:id",
        authenticateJWT,
        validateParams(IdParamSchema),
        productsController.getProduct
    );

    router.post(
        "/edit",
        iconUploader.single('icon'),
        authenticateJWT,
        validate(ProductSchema),
        productsController.editProduct
    );


    router.delete(
        "/delete/:id",
        validateParams(IdParamSchema),
        authenticateJWT,
        productsController.deleteProduct
    );

    return router
}

