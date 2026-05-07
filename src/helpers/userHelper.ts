import {UserRoles} from "../enums/UserRoles";

export const checkIsAdmin = (role: UserRoles): void => {

    if ((![UserRoles.ADMIN, UserRoles.SUPERADMIN].includes(role))) throw Error("Wrong user");

}
export const BASE_XP = 100;
export const GROWTH = 2.25;


export const levelCalculation = (level: number): void => {

    function xpForLevel(level: number) {
        return Math.floor(BASE_XP * Math.pow(level - 1, GROWTH));
    }

}