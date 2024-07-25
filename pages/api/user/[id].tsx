import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import prisma from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { id } = req.query;
    if (id && id.indexOf("@") < 0) {
      try {
        const users = await prisma.user.findMany({
          where: {
            walletAddress: String(id),
          },
        });
        res.status(200).json({ user: users[0] });
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    } else if (id && id.indexOf("@") > -1) {
      try {
        const users = await prisma.user.findMany({
          where: {
            walletAddress: "",
            email: String(id),
          },
        });
        res.status(200).json({ user: users[0] });
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
