import {
    mysqlTable,
    int,
    varchar,
    timestamp,
    foreignKey,
    mysqlEnum,
} from "drizzle-orm/mysql-core";
import {Gender} from "../../enums/Gender";
import {Statuses} from "../../enums/Statuses";
import {UserRoles} from "../../enums/UserRoles";
import {education, products, skills} from "../schema";
import {UserGameLocations} from "../../enums/UserGameLocations";
import {countries, timezones} from "./location";
import {FieldTypeEnum} from "../../enums/FieldTypesEnum";
import {FieldStatusesEnum} from "../../enums/FieldStatusesEnum";
import {SeedTypeEnum} from "../../enums/SeedTypeEnum";

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
    gameMoney: int('gameMoney', {unsigned: true}).default(0),
    realMoney: int('realMoney', {unsigned: true}).default(0),
    activationToken: varchar('activationToken', {length: 255}),
    level: int('level').default(1),
    xp: int('xp').default(0),
    role: mysqlEnum('role', [UserRoles.USER, UserRoles.SUPERADMIN, UserRoles.ADMIN]).default(UserRoles.USER),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({}));

export const userInfo = mysqlTable("user_info", {
    id: int('id').autoincrement().primaryKey(),
    userId: int("userId").references(() => users.id).unique(),
    countryId: int("countryId").references(() => countries.id),
    timezoneId: int("timezoneId").references(() => timezones.id),
    userGameLocation: mysqlEnum('userGameLocation', UserGameLocations).default(UserGameLocations.VILLAGE),

}, (table) => ({
    userFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
    }).onDelete("cascade"),
}));

export const userProgressInfo = mysqlTable("userProgressInfo", {
    id: int('id').autoincrement().primaryKey(),
    userId: int("userId").references(() => users.id).unique(),
    hunger: int("hunger").default(100).notNull(),
    energy: int("energy").default(100).notNull(),

}, (table) => ({
    userFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
    }).onDelete("cascade"),
}));

export const userEducation = mysqlTable("userEducation", {
    id: int('id').autoincrement().primaryKey(),
    educationId: int("educationId").references(() => education.id),
    startEducation: timestamp("startEducation").defaultNow(),
    endEducation: timestamp("endEducation").defaultNow(),
    status: mysqlEnum('status', [Statuses.STARTED, Statuses.FINISHED, Statuses.CANCELED, Statuses.FAILED]).default(Statuses.STARTED),

}, (table) => ({
    userFk: foreignKey({
        columns: [table.educationId],
        foreignColumns: [education.id],
    }).onDelete("cascade"),
}));

export const userProfessions = mysqlTable("userProgressInfo", {
    id: int('id').autoincrement().primaryKey(),
    userId: int("userId").references(() => users.id),
    professionId: int("professionId").notNull(),
}, (table) => ({
    userFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
    }).onDelete("cascade"),
}));


export const userSkills = mysqlTable("userSkills", {
    id: int('id').autoincrement().primaryKey(),
    userId: int("userId").references(() => users.id).notNull(),
    skillId: int("skillId").notNull(),
}, (table) => ({
    userFk: foreignKey({
        columns: [table.skillId],
        foreignColumns: [skills.id],
    }).onDelete("cascade"),
}));

export const userProducts = mysqlTable("userProducts", {
    id: int('id').autoincrement().primaryKey(),
    userId: int("userId").references(() => users.id),
    productId: int('productId').references(() => products.id),
    count: int('count').notNull().default(0),
}, (table) => ({
    userFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
    }).onDelete("cascade"),
    userProductFk: foreignKey({
        columns: [table.productId],
        foreignColumns: [products.id],
    }).onDelete("cascade"),
}));

export const userSeeds = mysqlTable("userSeeds", {
    id: int('id').autoincrement().primaryKey(),
    userId: int('userId').references(() => users.id).notNull(),
    seedType: mysqlEnum('seedType', SeedTypeEnum).notNull(),
    count: int('count').default(0),
}, (table) => ({
    fieldUserFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
    }).onDelete("cascade"),
}));

export type UserType = {
    id: number
    name: string
    nickname: string
    email: string
    password: string
    refreshToken: string
    avatar: string
    gender: Gender,
    status: Statuses.PENDING | Statuses.PUBLISHED | Statuses.BLOCKED | Statuses.NOT_ACTIVATED
    gameMoney: number
    realMoney: number
    activationToken: string
    level: number
    xp: number
    role: UserRoles.USER | UserRoles.SUPERADMIN | UserRoles.ADMIN
    createdAt: string | Date
}

export type UserInfoType = {
    id: number
    userId: number
    countryId: number
    timezoneId: number
    userGameLocation: number
}

export type UserProgressInfoType = {
    id: number
    userId: number
    hunger: number,
    energy: number,
}

export type UserEducationType = {
    id: number
    educationId: number
    startEducation: string | Date
    endEducation: string | Date
    status: Statuses.STARTED | Statuses.FINISHED | Statuses.CANCELED | Statuses.FAILED
}

export type UserProfessionType = {
    id: number
    userId: number
    professionId: string | Date
}

export type UserSkillType = {
    id: number
    userId: number
    skillId: number
}

export type UserProductType = {
    id: number
    userId: number
    productId: number
    count: number
}

export type UserSeedType = {
    id: number
    userId: number
    seedType: SeedTypeEnum
    count: number
}