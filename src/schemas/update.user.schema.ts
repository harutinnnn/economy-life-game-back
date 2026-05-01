import {z} from "zod";
import {Gender} from "../enums/Gender";

export const UpdateUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    nickname: z.string().min(1, "Nickname is required"),
    gender: z.enum(Gender),
});