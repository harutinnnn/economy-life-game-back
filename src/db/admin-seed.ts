import {db} from "./index";
import {Statuses} from "../enums/Statuses";
import {UserRoles} from "../enums/UserRoles";
import {users} from "./schema";
import bcrypt from "bcrypt";
import {and, eq} from "drizzle-orm";


async function seedSuperAdminUser() {

    try {

        const email = 'admin@admin.com';
        const pass = "123456";
        const hashedPassword = await bcrypt.hash(pass, 10);

        const [user] = await db.select().from(users).where(
            eq(users.email, email)
        )

        const hasSamePassword = user ? await bcrypt.compare(pass, user.password) : false;

        if (!user) {


            const userData = {
                name: "Admin",
                nickname: "admin",
                email: email,
                password: hashedPassword,
                status: Statuses.PUBLISHED as typeof users.$inferInsert.status,
                role: UserRoles.SUPERADMIN as typeof users.$inferInsert.role,
            }


            await db.insert(users).values(userData);
            console.log('Super admin created');

        } else {

            if (!hasSamePassword) {
                console.log('Super admin exists, but password is different');
            } else {
                console.log('Super already exists');
            }

        }

    } catch (err) {
        console.log(err);
    }
}

void seedSuperAdminUser();
