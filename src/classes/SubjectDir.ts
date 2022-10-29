import cheerio from "cheerio";
export const getSubjectList = async () => {
  const numericalIndex = await fetch(
    "https://www.handbook.uts.edu.au/subjects/numerical.html"
  );

  const pageData = await numericalIndex.text();

  const $ = cheerio.load(pageData);

  // get all elements of type a in div with id content
  const subjectList = $("#content a");
  const list: string[] = [];
  subjectList.each((i, el) => {
    if (el.type === "tag") {
      //   const subjectId = parseInt(el.attribs.href.split(".")[0]);
      // if url starts with https://handbook.uts.edu.au/subjects/ has a subject id and ends with .html (regex)
      if (
        el.attribs.href.match(
          /^https:\/\/handbook.uts.edu.au\/subjects\/\d+\.html$/
        )
      ) {
        list.push(el.attribs.href);
      }
      // list.push(el.attribs.href);
    }
  });
  return list;
};
