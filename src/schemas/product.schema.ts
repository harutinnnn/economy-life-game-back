import {z} from "zod";

export const ProductCategorySchema = z.object({
    name: z.string().min(1, "Name is required"),
});
export const ProductSchema = z.object({
    name: z.string().min(1, "Name is required"),
    price: z.coerce.number({ error: "Price is required"}),
    categoryId: z.coerce.number({ error: "Category is required"}),
});