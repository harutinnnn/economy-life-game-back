import {db} from "./index";

import fs from 'fs';
import path from 'path';
import {countries, timezones} from "./schema";

const fileName = "countries-timezones.json";

(async () => {


    const file = fs.readFileSync(path.join(__dirname, fileName));
    const countryList = JSON.parse(file);
    countryList.map(async ele => {


        const [tmpCountry] = await db.insert(countries).values(
            {
                name: ele.name,
                code: ele.code,
                capital: ele.capital || "",
            }
        );

        if (tmpCountry.insertId && ele.timezones.length > 0) {

            ele.timezones.map(async tEle => {

                await db.insert(timezones).values(
                    {
                        countryId: tmpCountry.insertId,
                        timezoneName: tEle.timezone,
                        utcOffset: tEle.utcOffset || "",
                    }
                );
            })

        }


    })

})()
