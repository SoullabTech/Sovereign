// 📁 src/pages/api/oracle/extractSymbols.ts
import { NextApiRequest, NextApiResponse } from "next";
import { extractSymbols } from "@/lib/oracle";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const symbols = await extractSymbols(req.body);
    res.status(200).json(symbols);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
