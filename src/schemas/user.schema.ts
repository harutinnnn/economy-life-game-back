import {z} from "zod";
import {Gender} from "../enums/Gender";

export const UserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    nickname: z.string().min(1, "Nickname is required"),
    email: z.email("Invalid email address"),
    gender: z.enum(Gender),
    password: z.string().min(6, "Password must be at least 6 characters"),
    countryId: z.coerce.number(),
    timezoneId: z.coerce.number(),
});

export const UserInfoSchema = z.object({
    countryId: z.coerce.number(),
    timezoneId: z.coerce.number(),
});