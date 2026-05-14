import {
    mysqlTable,
    int,
    varchar,
    foreignKey,
} from "drizzle-orm/mysql-core";


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


export type CountryType = {
    id: number
    name: string
    capital: string
    code: string
}

export  type  TimezoneType = {
    id: number
    countryId: string
    timezoneName: string
    utcOffset: string
}
