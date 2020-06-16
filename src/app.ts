import express = require("express");
import session = require("express-session");
import path = require("path");
import bodyParser = require("body-parser")
import morgan = require("morgan");
import cookieParser = require("cookie-parser");
import flash = require("connect-flash");
import fileUpload = require("express-fileupload");
import {COOKIE_SECRET,SESSION_SECRET,PORT} from "./env";
import passport = require("passport");
// import lusca = require("lusca");

import * as passportConfig from "./config/passport";
import * as userController from "./controllers/user";
import * as accountController from "./controllers/account";
import * as driveController from "./controllers/drive";
const app = express();

app.set("port", PORT);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(fileUpload());
app.use(cookieParser(COOKIE_SECRET));

app.use(session({
  secret: SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge : 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passportConfig.configStrategy(passport);



app.use(express.static(path.join(__dirname, "../public")));




app.use(function (req, res, next) {
  res.locals.success_message = req.flash("success_message");
  res.locals.error_message = req.flash("error_message");
  res.locals.error = req.flash("error");
  next();
});

/**
 * primary app routes
 */
app.get("/signup",userController.getSignup);
app.post("/signup",userController.postSignup);
app.get("/login", userController.getLogin);
app.post("/login",userController.postLogin);
app.get("/logout",passportConfig.isAuthenticated,userController.getLogout);
app.get("/account",passportConfig.isAuthenticated,accountController.getAccount);
app.get("/createnewteam",passportConfig.isAuthenticated,accountController.getCreateNewTeam);
app.post("/createnewteam",passportConfig.isAuthenticated,accountController.postCreateNewTeam);
app.get("/notifications",passportConfig.isAuthenticated, accountController.getNotifications);
app.post("/joinTeam", passportConfig.isAuthenticated, accountController.joinTeam);
app.get("/myTeams",passportConfig.isAuthenticated, accountController.getMyTeams);
app.post("/askfrommembers",passportConfig.isAuthenticated, driveController.postAskFromMembers);
app.post("/allowMember",passportConfig.isAuthenticated, driveController.postAllowMember);
app.post("/openDrive",passportConfig.isAuthenticated, driveController.postOpenDrive);
app.post("/closedrive",passportConfig.isAuthenticated, driveController.closeDrive);
export default app;