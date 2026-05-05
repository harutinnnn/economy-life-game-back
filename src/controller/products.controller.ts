import {AppContext} from "../types/app.context.type";
import {products, productsCategories} from "../db/schema";
import {eq} from "drizzle-orm";
import {Request, Response} from "express";
import {checkIsAdmin} from "../helpers/userHelper";
import {UserRoles} from "../enums/UserRoles";
import path from "node:path";
import fs from "fs";
import {removeFile, uploadFile} from "../helpers/file.helper";

export class ProductsController {


    constructor(private context: AppContext) {
    }


    getProducts = async (req: Request, res: Response) => {

        if (req?.user?.role) {
            checkIsAdmin(req.user.role as UserRoles)
        }

        try {

            const productsList = await this.context.db.select().from(products);

            res.json({
                products: productsList,
            });

        } catch (err) {
            console.log(err);
            res.status(400).json({message: "Invalid token"});
        }
    }

    getProductCategories = async (req: Request, res: Response) => {

        if (req?.user?.role) {
            checkIsAdmin(req.user.role as UserRoles)
        }

        try {

            const productCategoriesList = await this.context.db.select().from(productsCategories);

            res.json({
                productsCategories: productCategoriesList,
            });

        } catch (err) {
            console.log(err);
            res.status(400).json({message: "Invalid token"});
        }
    }

    getProductCategory = async (req: Request, res: Response) => {

        if (req?.user?.role) {
            checkIsAdmin(req.user.role as UserRoles)
        }


        try {
            const {id} = req.params;

            if (id) {

                const [productCategory] = await this.context.db.select().from(productsCategories).where(eq(productsCategories.id, Number(id)));


                return res.json({
                    productCategory: productCategory,
                });

            } else {
                console.log(req.user);
                return res.status(400).json({message: "Invalid token"});
            }

        } catch (err) {
            console.log(err);
            res.status(400).json({message: "Invalid token"});
        }
    }

    editProductCategories = async (req: Request, res: Response) => {

        if (req?.user?.role) {
            checkIsAdmin(req.user.role as UserRoles)
        }


        try {

            const {id, name} = req.body;

            const tmpId = !isNaN(id) ? id : 0;

            const [productCategory] = await this.context.db.select().from(productsCategories).where(eq(productsCategories.id, parseInt(tmpId)));


            if (productCategory?.id) {

                let iconUrl = productCategory.icon;


                if (req?.file) {

                    const rootDir = process.cwd();
                    await removeFile(path.join(rootDir, iconUrl));

                    iconUrl = await uploadFile(req.file, 'product-categories');
                }

                await this.context.db.update(productsCategories).set({
                    name: name,
                    icon: iconUrl
                }).where(eq(productsCategories.id, productCategory.id));


                return res.json({
                    productCategory: productCategory,
                });

            } else {

                const [tmpProductCategory] = await this.context.db.insert(productsCategories).values({
                    name: name,
                    icon: ""
                });
                const insertId = tmpProductCategory?.insertId;


                if (req?.file) {

                    const fileUrl = await uploadFile(req.file, 'product-categories')
                    console.log(fileUrl);
                    console.log(insertId);

                    await this.context.db.update(productsCategories).set({
                        icon: fileUrl,
                    }).where(eq(productsCategories.id, insertId));

                }


                return res.json({
                    productCategory: tmpProductCategory,
                });

            }


        } catch (err) {
            console.log(err);
            res.status(400).json({message: "Invalid token"});
        }
    }

    deleteProductCategories = async (req: Request, res: Response) => {

        if (req?.user?.role) {
            checkIsAdmin(req.user.role as UserRoles)
        }


        try {

            const {id} = req.params;


            const [productCategory] = await this.context.db.select().from(productsCategories).where(eq(productsCategories.id, Number(id)));

            if (productCategory) {

                const rootDir = process.cwd();
                await removeFile(path.join(rootDir, productCategory.icon));
                await this.context.db.delete(productsCategories).where(eq(productsCategories.id, Number(id)));
            }

            return res.json(true);

        } catch (err) {
            console.log(err);
            res.status(400).json({message: "Invalid token"});
        }
    }

}