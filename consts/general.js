import path from "path";

require("dotenv").config();

export const staticPath = path.join(__dirname, "../static");

export const staticUrl = process.env.BACKEND_URL + "static/";
