import {AppContext} from "../types/app.context.type";
import {countries, products, productsCategories, userInfo, users} from "../db/schema";
import {and, eq} from "drizzle-orm";
import {Request, Response} from "express";
import {checkIsAdmin} from "../helpers/userHelper";
import {UserRoles} from "../enums/UserRoles";
import path from "node:path";
import {removeFile, uploadFile} from "../helpers/file.helper";
import {ProductTypesEnum} from "../enums/ProductTypesEnum";

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

    getProductsCategoriesGrouped = async (req: Request, res: Response) => {

        try {

            const productsList = await this.context.db.select()
                .from(productsCategories)
                .innerJoin(
                    products,
                    and(eq(products.categoryId, productsCategories.id)),
                );

            res.json({
                products: productsList,
            });

        } catch (err) {
            console.log(err);
            res.status(400).json({message: "Invalid token"});
        }
    }

    getProduct = async (req: Request, res: Response) => {

        if (req?.user?.role) {
            checkIsAdmin(req.user.role as UserRoles)
        }


        try {
            const {id} = req.params;

            if (id) {

                const [productItem] = await this.context.db.select().from(products).where(eq(products.id, Number(id)));


                return res.json({
                    product: productItem,
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

    buyProduct = async (req: Request, res: Response) => {
        try {

            const {id} = req.params;

            if (id) {

                if (req.user?.gameMoney) {

                    const product = await this.context.db.select().from(products).where(eq(products.id, Number(id)));

                    if (product) {

                        if (req.user?.gameMoney >= product.price) {

                            this.context.db.transaction(async (trx: any) => {


                                switch (product.productType) {

                                    case ProductTypesEnum.SEED:

                                        break;
                                    case ProductTypesEnum.FOOD:

                                        break;
                                    case ProductTypesEnum.ANIMALS:

                                        break;
                                    case ProductTypesEnum.TECHNIQUE:

                                        break;
                                    case ProductTypesEnum.MATERIAL:

                                        break;
                                }

                                trx.update(users).set({
                                    gameMoney: Number(req.user?.gameMoney) - product.price,
                                }).where(eq(users.id, Number(req.user?.id)));


                                res.json({product: product});


                            }).catch((err: any) => {

                                console.log(err);
                                res.status(500).json({error: "Failed to buy product"});

                            })
                        } else {
                            res.status(400).json({message: "Not enough money!"});
                        }

                    } else {

                        res.status(400).json({message: "Cant fetch product"});
                    }

                } else {

                    res.status(400).json({message: "Invalid token"});
                }
            } else {
                res.status(400).json({message: "Cant fetch product"});
            }


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

    editProduct = async (req: Request, res: Response) => {

        if (req?.user?.role) {
            checkIsAdmin(req.user.role as UserRoles)
        }

        try {

            const {id, name, price, categoryId, productType} = req.body;

            const tmpId = !isNaN(id) ? id : 0;

            const [productCategory] = await this.context.db.select().from(products).where(eq(products.id, parseInt(tmpId)));

            if (productCategory?.id) {

                let iconUrl = productCategory.icon;


                if (req?.file) {

                    const rootDir = process.cwd();
                    await removeFile(path.join(rootDir, iconUrl));

                    iconUrl = await uploadFile(req.file, 'products');
                }

                await this.context.db.update(products).set({
                    name: name,
                    price: price,
                    categoryId: categoryId,
                    productType: productType,
                    icon: iconUrl
                }).where(eq(products.id, productCategory.id));


                return res.json({
                    productCategory: productCategory,
                });

            } else {

                const [tmpProduct] = await this.context.db.insert(products).values({
                    name: name,
                    icon: "",
                    price: price,
                    categoryId: categoryId,
                });
                const insertId = tmpProduct?.insertId;


                if (req?.file) {

                    const fileUrl = await uploadFile(req.file, 'products')
                    console.log(fileUrl);
                    console.log(insertId);

                    await this.context.db.update(products).set({
                        icon: fileUrl,
                    }).where(eq(products.id, insertId));

                }


                return res.json({
                    productCategory: tmpProduct,
                });

            }


        } catch (err) {
            console.log(err);
            res.status(400).json({message: "Invalid token"});
        }
    }

    deleteProduct = async (req: Request, res: Response) => {

        if (req?.user?.role) {
            checkIsAdmin(req.user.role as UserRoles)
        }


        try {

            const {id} = req.params;


            const [product] = await this.context.db.select().from(products).where(eq(products.id, Number(id)));

            if (product) {

                const rootDir = process.cwd();
                await removeFile(path.join(rootDir, product.icon));
                await this.context.db.delete(products).where(eq(products.id, Number(id)));
            }

            return res.json(true);

        } catch (err) {
            console.log(err);
            res.status(400).json({message: "Invalid token"});
        }
    }


}