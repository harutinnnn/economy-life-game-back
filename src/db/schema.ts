import {
    mysqlTable,
    int,
    varchar,
    timestamp,
    foreignKey,
    mysqlEnum,
} from "drizzle-orm/mysql-core";
import {FieldTypeEnum} from "../enums/FieldTypesEnum";
import {FieldStatusesEnum} from "../enums/FieldStatusesEnum";
import {ProductTypesEnum} from "../enums/ProductTypesEnum";
import {SeedTypeEnum} from "../enums/SeedTypeEnum";
import {users} from "./models/user";




export const productsCategories = mysqlTable("productsCategories", {
    id: int('id').autoincrement().primaryKey(),
    name: varchar("name", {length: 255}).notNull(),
    icon: varchar("icon", {length: 255}).notNull(),
}, (table) => ({}));

export const products = mysqlTable("products", {
    id: int('id').autoincrement().primaryKey(),
    categoryId: int('categoryId').references(() => productsCategories.id).notNull(),
    name: varchar("name", {length: 255}).notNull(),
    price: int("price").notNull(),
    icon: varchar("icon", {length: 255}).notNull(),
    productType: mysqlEnum('productType', ProductTypesEnum)
}, (table) => ({
    productCategoryFk: foreignKey({
        columns: [table.categoryId],
        foreignColumns: [productsCategories.id],
    }).onDelete("cascade"),
}));

export const fields = mysqlTable("fields", {
    id: int('id').autoincrement().primaryKey(),
    userId: int('userId').references(() => users.id).notNull(),
    fieldType: mysqlEnum('fieldType', FieldTypeEnum).notNull(),
    status: mysqlEnum('status', FieldStatusesEnum).notNull().default(FieldStatusesEnum.EMPTY),
    startProgressTime: timestamp("startProgressTime"),
    endProgressTime: timestamp("endProgressTime"),
    durationBySeconds: int("durationBySeconds").default(0),
}, (table) => ({
    fieldUserFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
    }).onDelete("cascade"),
}));

export const userCollectedSeeds = mysqlTable("userCollectedSeeds", {
    id: int('id').autoincrement().primaryKey(),
    userId: int('userId').references(() => users.id).notNull(),
    seedType: mysqlEnum('seedType', FieldTypeEnum).notNull(),
    count: int('count').default(0),
}, (table) => ({
    fieldUserFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [users.id],
    }).onDelete("cascade"),
}));

export const seeds = mysqlTable("seeds", {
    id: int('id').autoincrement().primaryKey(),
    seedType: mysqlEnum('seedType', SeedTypeEnum).notNull(),
    price: int("price").notNull(),
    name: varchar("name", {length: 255}).notNull(),
    icon: varchar("icon", {length: 255}).notNull(),
}, (table) => ({}));

