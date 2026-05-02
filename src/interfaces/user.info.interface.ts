import {Gender} from "../enums/Gender";

export interface UserInfo {
    id: number;
    userId: number;
    countryId: number;
    timezoneId: number;
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
    createdAt: Date | string;
}