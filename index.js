require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
// const passport = require("passport");
const request = require("request");

// const accesslogo = require('./routes/api/accesslogo');
const userApi = require("./routes/api/users");
const sharedApi = require("./routes/api/shared");

const userHelper = require("./helpers/users");

const cors = require("cors");

const app = express();

//Add Cors
app.use(cors());
app.options("*", cors());
app.use(express.static("public"));

// Bodyparser middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());
app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// DB Config
const db = process.env.DATABASE_URL;
console.log(db);

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB successfully connected"))
  .catch((err) => console.log(err));

// // Passport middleware
// app.use(passport.initialize());

// // Passport config
// require("./config/passport")(passport);

// Routes
// app.use("/api/logo", accesslogo);
app.use("/api/user", userApi);
app.use("/api/shared", sharedApi);
app.use(express.static(path.join(__dirname, "../gambits-frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../gambits-frontend/build/index.html"));
});

const port = process.env.SERVER_PORT || 8000;

app.listen(port, () => console.log(`Server up and running on port ${port} !`));

module.exports = app;
