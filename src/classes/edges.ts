import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

export const getEdges = async () => {
  const edges: { source: number; target: number }[] = [];
  const nodes = await db.subject.findMany({
    include: {
      antirequisites: {
        select: { id: true },
      },
      requisites: {
        select: { id: true },
      },
    },
  });
  nodes.forEach((node) => {
    node.requisites.forEach((edge) => {
      if (edge.id !== node.id) {
        edges.push({ source: node.id, target: edge.id });
      }
    });
  });
  return edges;
};

export const getNodes = async () => {
  const res = await db.subject.findMany({
    include: {
      antirequisites: {
        select: { id: true },
      },
      requisites: {
        select: { id: true },
      },
    },
  });

  return res.map((node) => ({
    id: node.id,
    label: node.name,
    url: node.url,
    course: node.courseArea,
  }));
};

export const getData = async () => {
  const nodes = await getNodes();
  const links = await getEdges();
  return { nodes, links };
};
