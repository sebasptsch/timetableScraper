import { downloadSubject } from "./classes/Subject";
import { getSubjectList } from "./classes/SubjectDir";
import fs from "fs/promises";
import { PrismaClient } from "@prisma/client";
import { getData, getEdges, getNodes } from "./classes/edges";
import { downloadSubjectBetter } from "./classes/betterScrape";
const { default: pThrottle } = await import("p-throttle");
const db = new PrismaClient();
const throttle = pThrottle({
  limit: 1,
  interval: 50,
});

const {
  default: { Signale },
} = await import("signale");

const logger = new Signale({
  scope: "main",
  interactive: true,
});

// const subjectData = await downloadSubject(48024);
// console.log(subjectData);
const subjectList = await getSubjectList();
const prog2Idx = subjectList.findIndex((el) => el.includes("48024"));

const res = await Promise.all(
  subjectList.map(async (url, idx) => {
    logger.info(`Downloading ${idx + 1}/${subjectList.length}`);
    const subjectAccess = await downloadSubjectBetter(url);
    const subjectData = await downloadSubject(url);
    return { ...subjectData, ...subjectAccess };
  })
);

const changed = db.$transaction(
  res.map((subjectData) =>
    db.subject.upsert({
      include: {
        antirequisites: {
          select: { id: true },
        },
        requisites: {
          select: { id: true },
        },
      },
      where: {
        id: subjectData.id,
      },
      update: {
        name: subjectData.name,
        url: subjectData.url,
        courseArea: subjectData.courseArea,
        requisites: {
          connectOrCreate: subjectData.requisites?.map((el) => ({
            where: { id: el },
            create: { id: el },
          })),
        },
        antirequisites: {
          connectOrCreate: subjectData.antirequisites?.map((el) => ({
            where: { id: el },
            create: { id: el },
          })),
        },
      },
      create: {
        id: subjectData.id,
        name: subjectData.name,
        url: subjectData.url,
        courseArea: subjectData.courseArea,
        requisites: {
          connectOrCreate: subjectData.requisites?.map((el) => ({
            where: { id: el },
            create: { id: el },
          })),
        },
        antirequisites: {
          connectOrCreate: subjectData.antirequisites?.map((el) => ({
            where: { id: el },
            create: { id: el },
          })),
        },
        // name: subjectData.name,
        // description: subjectData.description,
      },
    })
  )
);

await fs.writeFile("./output/*.json", JSON.stringify(await changed, null, 4));

changed.then(async () => {
  const nodes = await getNodes();
  await fs.writeFile("./output/nodes.json", JSON.stringify(nodes, null, 4));
  const edges = await getEdges();
  await fs.writeFile("./output/edges.json", JSON.stringify(edges, null, 4));
  const data = await getData();
  await fs.writeFile("./output/data.json", JSON.stringify(data, null, 4));
  logger.success("Done");
});
