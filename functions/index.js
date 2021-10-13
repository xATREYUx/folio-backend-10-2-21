const express = require("express");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");
var cookieParser = require("cookie-parser");

require("dotenv").config();

admin.initializeApp({
  storageBucket: "folio-9-26-21.appspot.com",
});
if (process.env.NODE_ENV == "development") {
  process.env["FIRESTORE_EMULATOR_HOST"] = "localhost:8080";
}
const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "https://foliofront.web.app"],
    credentials: true,
    cacheControl: "private",
    allowedHeaders: ["set-cookie", "content-type", "cookie", "authorization"],
  })
);

app.use(cookieParser());

app.use("/auth", require("./routers/authRouter"));
app.use("/posts", require("./routers/postRouter"));
app.use("/users", require("./routers/userRouter"));

exports.app = functions.https.onRequest(app);
