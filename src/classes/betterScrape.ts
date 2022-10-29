import Keyv from "@keyvhq/core";
import KeyvSqlite from "@keyvhq/sqlite";
import { getSubjectList } from "./SubjectDir";
import cheerio from "cheerio";
const subjectList = await getSubjectList();

const keyvSQLite = new Keyv({
  store: new KeyvSqlite("sqlite://./cachedb.sqlite"),
});

export const downloadSubjectBetter = async (url: string) => {
  const subjectId = url
    .match(/^https:\/\/handbook.uts.edu.au\/subjects\/(\d+)\.html$/)
    ?.at(1);
  if (!subjectId) return;

  const newURL = `https://studentforms.uts.edu.au/evop/access/search.cfm?subjectcode=${parseInt(
    subjectId
  ).toString()}`;

  const existing = await keyvSQLite.get(newURL);

  let data = "";

  if (existing) {
    data = existing;
  } else {
    const subjectPage = await fetch(newURL);
    data = await subjectPage.text();
    await keyvSQLite.set(newURL, data);
  }

  const $ = cheerio.load(data);

  const requisites: number[] = [];
  const antirequisites: number[] = [];

  $("h3:contains('Requisite(s)') + table tr")
    .slice(2)
    .each((i, el) => {
      const row = $(el);
      const itemId = row.find("td").eq(0).text();
      const type = row.find("td").eq(1).text();
      const details = row.find("td").eq(2).text();
      if (type === "Academic requisite") {
        const matched = details.match(/(\d{5}) (.*)/);
        if (matched?.at(1)) {
          requisites.push(parseInt(matched.at(1)!));
        }
      }
    });

  $("h3:contains('Anti-requisite(s)') + table tr")
    .slice(2)
    .each((i, el) => {
      const row = $(el);
      const itemId = row.find("td").eq(0).text();
      const details = row.find("td").eq(1).text();

      const matched = details.match(/(\d{5}) (.*)/);
      if (matched?.at(1)) {
        antirequisites.push(parseInt(matched.at(1)!));
      }
    });
  //   console.log();
  return { requisites, antirequisites };

  //   subjectList.push(url);
};
