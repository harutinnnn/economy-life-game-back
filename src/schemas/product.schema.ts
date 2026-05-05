import {z} from "zod";

export const ProductCategorySchema = z.object({
    name: z.string().min(1, "Name is required"),
});