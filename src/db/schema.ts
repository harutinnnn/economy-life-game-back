import {
    mysqlTable,
    unique,
    int,
    varchar,
    timestamp,
    text,
    foreignKey,
    mysqlEnum,
    float, tinyint
} from "drizzle-orm/mysql-core";
import {Statuses} from "../enums/Statuses";
import {Gender} from "../enums/Gender";

export const users = mysqlTable("users", {
    id: int('id').autoincrement().primaryKey(),
    name: varchar("name", {length: 255}).notNull(),
    nickname: varchar("nickname", {length: 255}).notNull(),
    email: varchar("email", {length: 255}).notNull().unique(),
    password: varchar("password", {length: 255}).notNull(),
    refreshToken: varchar("refresh_token", {length: 255}),
    avatar: varchar("avatar", {length: 255}),
    gender: mysqlEnum('gender', [Gender.MALE, Gender.FEMALE, Gender.UNKNOWN]).notNull().default(Gender.UNKNOWN),
    status: mysqlEnum('status', [Statuses.PENDING, Statuses.PUBLISHED, Statuses.BLOCKED, Statuses.NOT_ACTIVATED]).notNull().default(Statuses.NOT_ACTIVATED),
    activationToken: varchar('activationToken', {length: 255}),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({}));
