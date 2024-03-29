import cookieParser from "cookie-parser";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import passport from "passport";
import router from "./router";
/* utils */
import { getDateStamp } from "./utils/general";

// we load up the environment variables here
// so they could be used on the fly
require("dotenv").config();
// initialize app
const app = express();

mongoose
  .connect(process.env.DATABASE_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(
    () => {
      console.log(getDateStamp(), "Database is connected");
    },
    (err) => {
      console.log(getDateStamp(), `Can not connect to the database ${err}`);
    }
  );

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// for parsing multipart/form-data
app.use("/static", express.static("static"));

app.use(
  session({
    proxy: true,
    // session expiration set to 1 hour
    cookie: {
      maxAge: 600000 * 6,
      secure: process.env.NODE_ENV === "production",
    },
    secret: process.env.COOKIE_KEY,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());

app.use(passport.session());

// connecting to router
app.use("/api", router);

app.listen(process.env.PORT, () => {
  console.log(getDateStamp(), `Listening at on: ${process.env.PORT}`);
});
