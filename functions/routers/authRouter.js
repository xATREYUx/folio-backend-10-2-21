const router = require("express").Router();
const jwt = require("jsonwebtoken");

const admin = require("firebase-admin");
const db = admin.firestore();
const Users = db.collection("users");

router.get("/", (req, res) => {
  res.json("True");
  console.log("REQ HEADERS", req.headers);
});

router.get("/loggedIn", (req, res) => {
  console.log("login validation initiated");

  try {
    const { token } = req.cookies.__session || "";
    console.log("req.cookies.__session", token);
    if (!token) {
      console.log("no token cookie");
      return res.status(200).json(false);
    }
    //if it is there then decrypt it
    console.log("Verify Token Initiated: ", token);
    const verificationResult = jwt.verify(token, process.env.JWT_SECRET);
    //respond to client with whether it is valid or not
    console.log("loggedIn function verificationResult: ", verificationResult);
    res.json(verificationResult);
  } catch (err) {
    console.log("loggedIn Error", err);
  }
});

router.post("/logout", (req, res) => {
  console.log("Logout Initiated");
  try {
    // const cookies = req.cookies;
    // console.log("req.cookies: ", cookies);

    // for (let prop in cookies) {
    //   // res.cookie(prop, "", { expires: new Date(0) });
    //   console.log("cleared cookie: ", prop);
    // }
    return res
      .cookie("__session", "", {
        httpOnly: true,
        sameSite: "none",
        expires: new Date(0),
        secure: true,
      })
      .send();
  } catch (err) {
    console.log("logout error", err);
  }
});

router.post("/create", async (req, res) => {
  console.log("---Create User initiated---");
  try {
    const { token } = req.body;
    console.log("create user fbToken", token);
    admin
      .auth()
      .verifyIdToken(token)
      .then((decodedToken) => {
        const { email, uid } = decodedToken;
        console.log("Fetched UID: ", uid);
        console.log("Fetched email: ", email);
        Users.doc(`${uid}`).set({
          email: email,
          posts: [],
        });
        console.log("---jwt signing initiated---");
        let authToken = { token: null };
        verifiedUserToken = jwt.sign(
          {
            user: { email, uid },
          },
          process.env.JWT_SECRET
        );
        console.log("Token to set as cookie: ", verifiedUserToken);
        authToken = { token: verifiedUserToken };
        return res
          .cookie("__session", authToken, {
            httpOnly: true,
            sameSite: "none",
            secure: true,
          })
          .send();
      })
      .catch((err) => {
        console.log("User create err:", err);
      });
  } catch (err) {
    console.log(err);
  }
});

router.post("/login", async (req, res) => {
  console.log("Login Initiated");
  try {
    const { token } = req.body;
    console.log("Recieved login token", token);
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log("Login verifyToken decodedToken", decodedToken);
    const { email, user_id } = decodedToken;
    // const existingUser = await admin.auth().getUserByEmail(email);
    let authToken = { token: null };
    verifiedUserToken = jwt.sign(
      {
        user: { email, user_id },
      },
      process.env.JWT_SECRET
    );
    console.log("Token to set as cookie: ", verifiedUserToken);
    authToken = { token: verifiedUserToken };
    return res
      .cookie("__session", authToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
      })
      .send();
  } catch (err) {
    () => {};
  }

  //   authToken = { token: verifiedUserToken };
  //   return res
  //     .cookie("__session", authToken, {
  //       httpOnly: true,
  //       sameSite: "none",
  //       secure: true,
  //     })
  //     .send();
  // } catch (err) {
  //   console.log("Error in the login function", err);
  // }
  // const { email, password } = req.body;
  // if (!email || !password)
  //   return res
  //     .status(400)
  //     .json({ errorMessage: "Please enter all required fields." });

  // const existingUser = await admin.auth().getUserByEmail(email);
  // if (!existingUser)
  //   return res.status(401).json({ errorMessage: "Wrong email or password" });
  // console.log("---User Found---", existingUser.uid);

  // Users.doc(existingUser.uid)
  //   .get()
  //   .then(async (doc) => {
  //     if (doc.exists) {
  //       console.log("Document data:", doc.data());
  //       await bcrypt
  //         .compare(password, doc.data().passwordHash)
  //         .then((result) => {
  //           if (result) {
  //             console.log("Authentication successful: ", result);
  //           } else {
  // console.log("Authentication failed. Password doesn't match");
  //           }
  //         })
  //         .catch((err) => console.error(err));
  //     } else {
  //       // doc.data() will be undefined in this case
  //       console.log("No such document!");
  //     }
  //   })
  //   .then(async () => {
  //     admin
  //       .auth()
  //       .createCustomToken(existingUser.uid)
  //       .then((token) => {
  //         res
  //           .cookie("token", token, {
  //             httpOnly: true,
  //             sameSite:
  //               process.env.NODE_ENV === "development"
  //                 ? "lax"
  //                 : process.env.NODE_ENV === "production" && "none",
  //             secure:
  //               process.env.NODE_ENV === "development"
  //                 ? false
  //                 : process.env.NODE_ENV === "production" && true,
  //           })
  //           .send();
  //       });
  // })
  //   .catch((error) => {
  //     console.log("Error getting document:", error);
  //   });
});

module.exports = router;
