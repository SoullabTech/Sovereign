import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req: Request, res: Response) => {
  res.send("🔮 Soullab Oracle API is live");
});

app.listen(PORT, () => {
  console.log(`🚀 Oracle backend is running at http://localhost:${PORT}`);
});
