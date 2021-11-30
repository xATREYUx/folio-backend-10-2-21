const domain = () => {
  console.log("Environment process: ", process.env.NODE_ENV);
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  } else {
    return "https://devfolio-front.web.app";
  }
};

module.exports = domain;
