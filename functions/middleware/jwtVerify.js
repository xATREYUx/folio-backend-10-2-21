const e = require("express");
const jwt = require("jsonwebtoken");

const jwtVerify = (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token) {
      return res.status(401).json({ errorMessage: "Unauthorized, No Token" });
    } else {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          res.json({ auth: false, message: "Authentication Failed" });
        } else {
          console.log("decoded", decoded.user);
          req.user = decoded.user;
          next();
        }
      });
    }
  } catch (err) {
    console.error(err);
    res.status(401).json({
      errorMessage: "Unauthorized",
    });
  }
};
module.exports = jwtVerify;
