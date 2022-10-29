import Keyv from "@keyvhq/core";
import KeyvSqlite from "@keyvhq/sqlite";
import cheerio from "cheerio";

const keyvSQLite = new Keyv({
  store: new KeyvSqlite("sqlite://./cachedb.sqlite"),
});

export const downloadSubject = async (url: string) => {
  const existing = await keyvSQLite.get(url);

  let data = "";

  if (existing) {
    data = existing;
  } else {
    const subjectPage = await fetch(url);
    data = await subjectPage.text();
    await keyvSQLite.set(url, data);
  }
  // const data = await response.text();
  const $ = cheerio.load(data);
  // h1 inside div with id is content
  const subjectNameRef = $("#content h1");
  // subjectnameText is the text after the subject code
  if (!subjectNameRef.text()) {
    throw new Error("Subject not found");
  }
  const name = subjectNameRef.text().split(" ").slice(1).join(" ");

  const courseArea = $("#header .coursearea").text();

  // subject id is a 5 digit number in the title (regex)
  const subjectId = parseInt(subjectNameRef.text().match(/\d{5}/)?.[0] ?? "");

  const descriptionHeadingRef = $("#content h3:contains('Description')");
  const description = descriptionHeadingRef.nextUntil("h3").text();

  // console.log(parseRequisites(requisite));

  return {
    id: subjectId,
    name,
    description,
    courseArea,
    url,
  };
  // console.log(subjectDescription);
};
