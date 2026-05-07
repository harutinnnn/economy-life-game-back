import {Multer} from "multer";

export {}; // 👈 required

global {
    namespace Express {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface

        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        interface User {
            id: number;
            email: string;
            name: string;
            nickname: string;
            level:number;
            role: string;
        }

        interface Request {
            user?: User | undefined;
            file?: Multer.File
            files?:
                | {
                [fieldname: string]: Multer.File[];
            }
                | Multer.File[]
                | undefined;
        }
    }
}