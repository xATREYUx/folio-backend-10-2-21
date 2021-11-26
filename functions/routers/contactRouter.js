const router = require("express").Router();
// const axios = require("axios");

const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const captchaCheck = require("../middleware/captcha-check");
const Busboy = require("busboy");

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

router.post("/", captchaCheck, async (req, res) => {
  console.log("contact router fired");
  // console.log("captchaCheck result", captchaCheck);

  if (req.method === "OPTIONS") {
    console.log("res.end - method was 'OPTIONS'");
    res.end();
  } else {
    try {
      if (req.method !== "POST") {
        console.log("return - method was a post request");
        return;
      }
      if (req.captcha !== true) {
        console.log("Prove you're human.");
        return;
      }
      if (req.captcha === true) {
        console.log("You're human.");
      }

      const busboy = new Busboy({ headers: req.headers });
      let fields = {};
      busboy.on("field", (fieldname, fieldvalue) => {
        console.log("fieldname", fieldname);
        fields[fieldname] = fieldvalue;
      });
      busboy.on("finish", async () => {
        console.log("log fields", fields);

        const mailTransport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: gmailEmail,
            pass: gmailPassword,
          },
        });

        const mailOptions = {
          from: fields.email,
          replyTo: fields.email,
          to: gmailEmail,
          subject: `${fields.name} just messaged me from my website`,
          text: fields.message,
          html: `<p>${fields.message}</p>`,
        };

        return mailTransport
          .sendMail(mailOptions)
          .then(() => {
            console.log("New email sent to:", gmailEmail);
            res.status(200).send({
              isEmailSend: true,
            });
            // return;
          })
          .catch((err) => {
            console.log("Contact Email Error", err);
          });

        // const mailTransport = nodemailer.createTransport({
        //   service: "gmail",
        //   auth: {
        //     user: gmailEmail,
        //     pass: gmailPassword,
        //   },
        // });

        // const mailOptions = {
        //   from: req.body.email,
        //   replyTo: req.body.email,
        //   to: gmailEmail,
        //   subject: `${req.body.name} just messaged me from my website`,
        //   text: req.body.message,
        //   html: `<p>${req.body.message}</p>`,
        // };

        // return mailTransport.sendMail(mailOptions).then(() => {
        //   console.log("New email sent to:", gmailEmail);
        //   res
        //     .status(200)
        //     .send({
        //       isEmailSend: true,
        //     })
        //     .catch((err) => {
        //       console.log("Contact Email Error", err);
        //     });
        //   return;
      });
      busboy.end(req.rawBody);
    } catch (err) {
      console.log("create contact error", err);
    }
  }
});
module.exports = router;
