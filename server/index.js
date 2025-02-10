import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { menu_compact as menuCompact, menu_full as menuFull } from "./data.js";

dotenv.config();

const app = express();

app.use(cors()); // allow all for cors
app.use(express.json());

app.get("/", async (req, res, next) => {
  res.send("Hello World!");
});

app.get("/menu", async (req, res, next) => {
  res.json(menuFull);
});

app.get("/minimenu", async (req, res, next) => {
  res.json(menuCompact);
});

app.listen(5001, () => {
  console.log("Server listening on port 5001...");
});
