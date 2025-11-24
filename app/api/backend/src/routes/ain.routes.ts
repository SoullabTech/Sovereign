import express from "express";
import { oracle } from "../core/agents/MainOracleAgent";

const router = express.Router();

router.get("/ain", (req, res) => {
  res.json(oracle.identityProfile);
});

export default router;
