import {UserRoles} from "../enums/UserRoles";

export const checkIsAdmin = (role: UserRoles): void => {

    if ((![UserRoles.ADMIN, UserRoles.SUPERADMIN].includes(role))) throw Error("Wrong user");

}