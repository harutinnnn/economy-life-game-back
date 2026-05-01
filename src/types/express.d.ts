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
        }

        interface Request {
            user?: User | undefined;
        }
    }
}