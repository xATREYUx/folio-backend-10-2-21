const express = require("express");
const functions = require("firebase-functions");

const admin = require("firebase-admin");
const cors = require("cors");
var cookieParser = require("cookie-parser");

require("dotenv").config();

var serviceAccount = require("./fbServiceAccount.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "folio-9-26-21.appspot.com",
});

if (process.env.NODE_ENV == "development") {
  process.env["FIRESTORE_EMULATOR_HOST"] = "localhost:8080";
  // process.env["FIREBASE_STORAGE_EMULATOR_HOST"] = "localhost:9199";
}

const app = express();
console.log("Server Initiated");

app.use(
  cors({
    origin: ["http://localhost:3000", "https://devfolio-front.web.app"],
    methods: ["POST", "GET", "PUT", "OPTIONS", "DELETE"],
    credentials: true,
    cacheControl: ["private"],
    allowedHeaders: ["content-type", "x-access-token"],
  })
);

app.use(cookieParser());

app.use("/auth", require("./routers/authRouter"));
app.use("/posts", require("./routers/postRouter"));
app.use("/users", require("./routers/userRouter"));
app.use("/contacts", require("./routers/contactRouter"));

exports.app = functions.https.onRequest(app);
