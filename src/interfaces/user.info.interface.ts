import {Gender} from "../enums/Gender";
import {UserRoles} from "../enums/UserRoles";

export interface UserInfo {
    id: number;
    userId: number;
    countryId: number;
    timezoneId: number;
}

export interface UserProgressInfo {
    id: number;
    userId: number;
    level: number;
    xp: number;
    hunger: number;
    energy: number;
    experienceXp: number;
}

export interface User {
    id: number;
    name: string;
    nickname: string;
    email: string;
    password: string;
    refreshToken: string;
    avatar: string;
    gender: Gender;
    status: string;
    gameMoney: number;
    realMoney: number;
    activationToken: number;
    role: UserRoles;
    createdAt: Date | string;
}