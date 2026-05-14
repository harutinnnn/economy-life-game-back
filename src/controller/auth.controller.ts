import {Request, Response} from "express";
import {userCollectedSeeds} from "../db/schema";
import {countries} from "../db/models/location";
import {users,userInfo,userProgressInfo,userSeeds} from "../db/models/user";
import {and, eq} from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {ZodError} from "zod";
import {UserSchema} from "../schemas/user.schema";
import {AppContext} from "../types/app.context.type";
import {UpdateUserSchema} from "../schemas/update.user.schema";
import {Statuses} from "../enums/Statuses";
import {randomUUID} from "node:crypto";
import {mailService} from "../modules/mail/mail.service";
import {newMemberTemplate} from "../modules/mail/templates/newMember.template";
import {TokenParamSchema} from "../schemas/IdParamSchema";
import {forgotSchema} from "../schemas/login.schema";
import {forgotPassword} from "../modules/mail/templates/forgotPassword.template";
import {generatePassword} from "../helpers/password.helper";
import {FieldTypeEnum} from "../enums/FieldTypesEnum";

export class AuthController {


    constructor(private context: AppContext) {
    }

    register = async (req: Request, res: Response) => {
        try {
            const validatedData = UserSchema.parse(req.body);

            // Check if user already exists
            const [existingUser] = await this.context.db.select().from(users).where(eq(users.email, validatedData.email));
            if (existingUser) {
                return res.status(201).json({error: "User with this email already exists"});
            }

            this.context.db.transaction(async (trx: any) => {


                const hashedPassword = await bcrypt.hash(validatedData.password, 10);
                const activationHash = randomUUID();

                await trx.insert(users).values({
                    name: validatedData.name,
                    nickname: validatedData.nickname,
                    email: validatedData.email,
                    gender: validatedData.gender,
                    password: hashedPassword,
                    status: Statuses.NOT_ACTIVATED,
                    activationToken: activationHash,
                    gameMoney: 100
                });

                const [newUser] = await trx.select().from(users).where(eq(users.email, validatedData.email));


                await trx.insert(userInfo).values({
                    userId: newUser.id,
                    countryId: validatedData.countryId,
                    timezoneId: validatedData.timezoneId,
                });

                await trx.insert(userSeeds).values(
                    {
                        userId: newUser.id,
                        seedType: FieldTypeEnum.WHEAT,
                        count: 1
                    }
                )

                await trx.insert(userCollectedSeeds).values(
                    {
                        userId: newUser.id,
                        seedType: FieldTypeEnum.WHEAT,
                        count: 0
                    }
                )


                const payload = {id: newUser.id, email: newUser.email};
                const token = jwt.sign(payload, process.env.JWT_SECRET || "default_super_secret_key", {expiresIn: "15m"});
                const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || "default_refresh_secret", {expiresIn: "7d"});

                // Save refresh token to db
                await trx.update(users).set({refreshToken}).where(eq(users.id, newUser.id));


                const activationLink = process.env.API_URL + '/api/auth/activation/' + activationHash;
                //Send email activation
                await mailService.sendMail({
                    to: validatedData.email,
                    subject: "Activation mail",
                    html: newMemberTemplate(validatedData.name, activationLink),
                });


                res.status(200).json({
                    token,
                    refreshToken,
                    user: {id: newUser.id, name: newUser.name, email: newUser.email}
                });

            }).catch((err: any) => {
                console.log(err);
                res.status(500).json({error: "Failed to register user"});

            })

            // Fetch newly created user


        } catch (error) {
            console.log(error);
            if (error instanceof ZodError) {
                res.status(400).json({error: (error as any).errors});
            } else {
                res.status(500).json({error: "Failed to register user"});
            }
        }

    }

    authMe = async (req: Request, res: Response) => {

        try {

            if (req.user?.id) {

                const [userInfoData] = await this.context.db.select(
                    {
                        countryId: userInfo.countryId,
                        timezoneId: userInfo.timezoneId,
                        userGameLocation: userInfo.userGameLocation,
                        countryCode: countries.code,
                        countryName: countries.name
                    }
                ).from(userInfo)
                    .innerJoin(
                        countries,
                        and(eq(countries.id, userInfo.countryId), eq(userInfo.userId, req.user?.id)),
                    )
                    .where(eq(userInfo.userId, req.user?.id));

                const [userProgressInfoData] = await this.context.db.select().from(userProgressInfo).where(eq(userProgressInfo.userId, req.user?.id));

                res.json({
                    user: req.user,
                    userInfo: userInfoData,
                    userProgressInfoData: userProgressInfoData
                });

            } else {
                res.status(400).json({message: "Invalid token"});
            }
        } catch (err) {
            res.status(400).json({message: "Invalid token"});
        }
    }

    activate = async (req: Request, res: Response) => {

        const validatedData = TokenParamSchema.parse(req.params);


        try {


            const activationToken = validatedData.token;
            const status = Statuses.PUBLISHED;

            const [user] = await this.context.db.select().from(users).where(eq(users.activationToken, activationToken));

            if (user) {

                await this.context.db.update(users).set({
                    activationToken: null,
                    status: status
                }).where(eq(users.id, user.id));

                return res.redirect(process.env.SITE_URL as string);

                //TODO check wrong-activation-code path not redirect or cache
            } else {
                return res.redirect((process.env.SITE_URL as string) + '/wrong-activation-code');
            }


        } catch (err) {
            return res.redirect((process.env.SITE_URL as string) + '/wrong-activation-code');
        }

    }

    updateMe = async (req: Request, res: Response) => {


        try {

            const validatedData = UpdateUserSchema.parse(req.body);


            const name = validatedData.name;
            const nickname = validatedData.nickname;
            const gender = validatedData.gender;

            await this.context.db.update(users).set({
                name,
                nickname,
                gender
            }).where(eq(users.id, Number(req.user?.id)));

            res.json(req.user);

        } catch (err) {
            res.status(400).json({message: "Invalid token"});
        }
    }

    login = async (req: Request, res: Response) => {

        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).json({error: "Email and password are required"});
        }

        try {
            const [user] = await this.context.db.select().from(users).where(eq(users.email, email));
            if (!user) {
                return res.status(401).json({error: "Invalid credentials"});
            }

            if (user.status === Statuses.NOT_ACTIVATED) {
                return res.status(200).json({error: "Your account not activated please check you email!"});
            }

            if (user.status === Statuses.BLOCKED) {
                return res.status(200).json({error: "Your account blocked please contact your company administrator!"});
            }


            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({error: "Invalid credentials"});
            }

            const payload = {id: user.id, email: user.email};
            const token = jwt.sign(payload, process.env.JWT_SECRET || "default_super_secret_key", {expiresIn: "2h"});
            const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || "default_refresh_secret", {expiresIn: "7d"});

            // Save refresh token to db
            await this.context.db.update(users).set({refreshToken}).where(eq(users.id, user.id));

            res.json({token, refreshToken, user: {id: user.id, name: user.name, email: user.email}});
        } catch (error) {
            res.status(500).json({error: "Login failed"});
        }
    }

    forgot = async (req: Request, res: Response) => {

        const validatedData = forgotSchema.parse(req.body);

        const {email} = req.body;

        try {
            const [user] = await this.context.db.select().from(users).where(eq(users.email, email));

            if (!user) {
                return res.status(201).json({error: "Wrong email"});
            }


            const newPass = generatePassword(10)
            const hashedPassword = await bcrypt.hash(newPass, 10);

            await this.context.db.update(users).set({password: hashedPassword}).where(eq(users.id, user.id));

            //Send email activation
            await mailService.sendMail({
                to: validatedData.email,
                subject: "Forgot password",
                html: forgotPassword(user.name, newPass),
            });


            res.json({message: "Password successfully forgotten please check you email"});

        } catch (error) {
            res.status(500).json({error: "Forgot failed"});
        }
    }

    refresh = async (req: Request, res: Response) => {

        const {refreshToken} = req.body;
        if (!refreshToken) {
            return res.status(401).json({error: "Refresh token is required"});
        }

        try {
            // Verify refresh token signature
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || "default_refresh_secret") as {
                id: number,
                email: string
            };

            // Verify it matches user in database
            const [user] = await this.context.db.select().from(users).where(eq(users.id, decoded.id));

            if (!user || user.refreshToken !== refreshToken) {
                return res.status(403).json({error: "Invalid refresh token"});
            }

            // Generate new short-lived access token
            const payload = {id: user.id, email: user.email};
            const newToken = jwt.sign(payload, process.env.JWT_SECRET || "default_super_secret_key", {expiresIn: "15m"});

            res.json({token: newToken});
        } catch (error) {
            return res.status(403).json({error: "Invalid or expired refresh token"});
        }


    }

    logout = async (req: Request, res: Response) => {
        try {
            const userId = (req.user as any).id;

            // Remove the refresh token from the database
            await this.context.db.update(users).set({refreshToken: null}).where(eq(users.id, userId));

            res.json({message: "Logged out successfully"});
        } catch (error) {
            res.status(500).json({error: "Logout failed"});
        }
    }

}