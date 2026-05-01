import {db} from "./index";

import fs from 'fs';
import path from 'path';
import {countries, timezones} from "./schema";

const fileName = "countries-timezones.json";

type CountryTimezoneInput = {
    name: string;
    code: string;
    capital?: string;
    timezones?: Array<{
        timezone: string;
        utcOffset?: string;
    }>;
};

async function seedCountriesAndTimezones() {
    const filePath = path.join(__dirname, fileName);
    const file = fs.readFileSync(filePath, "utf-8");
    const countryList: CountryTimezoneInput[] = JSON.parse(file);

    for (const ele of countryList) {
        const [tmpCountry] = await db.insert(countries).values({
            name: ele.name,
            code: ele.code,
            capital: ele.capital || "",
        });

        const insertId = tmpCountry?.insertId;
        if (!insertId || !ele.timezones?.length) {
            continue;
        }

        for (const tEle of ele.timezones) {
            await db.insert(timezones).values({
                countryId: insertId,
                timezoneName: tEle.timezone,
                utcOffset: tEle.utcOffset || "",
            });
        }
    }
}

seedCountriesAndTimezones().catch((error) => {
    console.error("Failed to seed countries and timezones:", error);
    process.exit(1);
});
