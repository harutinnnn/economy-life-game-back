import {
    mysqlTable,
    int,
    varchar,
    foreignKey,
} from "drizzle-orm/mysql-core";

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


export type ProfessionType = {
    id: number
    name: string
    availabilityLvl: number
}

export type EducationType = {
    id: number
    name: string
    duration: number
}

export type SkillType = {
    id: number
    name: string
    professionId: number
}