import {z} from "zod";



export const SeedFieldSchema = z.object({
    fieldId: z.coerce.number(),
    seedType: z.coerce.string(),
});