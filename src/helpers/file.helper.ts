import fs from "fs";
import path from "node:path";

export const uploadFile = async (file: Express.Multer.File, pathStr: string): Promise<string | Error> => {

    return new Promise((resolve, reject) => {

        const name = file?.filename;
        const mimetype = file?.mimetype;
        const filePath = file?.path as string;

        const dirPath = path.join(__dirname, `../../uploads/${pathStr}/`)


        try {

            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath);
            }

            const newPath = dirPath + name;

            fs.rename(filePath, newPath, async (err) => {
                if (!err) {


                    resolve(`/uploads/product-categories/${name}`)


                } else {
                    reject('Failed to upload file');
                }
            })

        } catch (e) {

            if (e instanceof Error) {
                reject(e.message);
                reject('Failed to upload file');
            } else {

            }
        }
    })
}

export const removeFile = async (path: string): Promise<void> => {
    try {
        const stat = fs.statSync(path);
        if (stat.isFile()) {
            fs.rmSync(path, {force: true});
        }
    } catch (err: any) {
        if (err.code !== "ENOENT") {
            throw err; // real error
        }
        // file doesn't exist → ignore
    }
}