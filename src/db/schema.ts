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
    gameMoney: int('gameMoney', {unsigned: true}).default(0),
    realMoney: int('realMoney', {unsigned: true}).default(0),
    activationToken: varchar('activationToken', {length: 255}),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({}));


export const userInfo = mysqlTable("user_info", {
    id: int('id').autoincrement().primaryKey(),
    userId: int("userId").references(() => users.id).unique(),
    countryId: int("countryId").references(() => countries.id),
    timezoneId: int("timezoneId").references(() => timezones.id),

}, (table) => ({
    userFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
    }).onDelete("cascade"),
}));

export const userProgressInfo = mysqlTable("userProgressInfo", {
    id: int('id').autoincrement().primaryKey(),
    userId: int("userId").references(() => users.id).unique(),
    level: int("level").default(1),
    xp: int("xp").default(0),
    experienceXp: int("experienceXp").default(0),

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


export const countries = mysqlTable("countries", {
    id: int('id').autoincrement().primaryKey(),
    name: varchar("name", {length: 255}).notNull(),
    capital: varchar("capital", {length: 255}).notNull(),
    code: varchar("code", {length: 3}).notNull(),
}, (table) => ({}));


export const timezones = mysqlTable("timezones", {
    id: int('id').autoincrement().primaryKey(),
    countryId: int("countryId").references(() => countries.id),
    timezoneName: varchar("timezoneName", {length: 255}).notNull(),
    utcOffset: varchar("utcOffset", {length: 255}).notNull(),
}, (table) => ({

    countryFk: foreignKey({
        columns: [table.countryId],
        foreignColumns: [countries.id],
    }).onDelete("cascade"),
}));


export const professions = mysqlTable("professions", {
    id: int('id').autoincrement().primaryKey(),
    name: varchar("name", {length: 255}).notNull(),
    availabilityLvl: int("availabilityLvl"),
}, (table) => ({}));

export const education = mysqlTable("education", {
    id: int('id').autoincrement().primaryKey(),
    name: varchar("name", {length: 255}).notNull(),
    duration: int("duration").default(0),
}, (table) => ({}));


export const skills = mysqlTable("skills", {
    id: int('id').autoincrement().primaryKey(),
    name: varchar("name", {length: 255}).notNull(),
    professionId: int("professionId"),
}, (table) => ({
    userFk: foreignKey({
        columns: [table.professionId],
        foreignColumns: [professions.id],
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

