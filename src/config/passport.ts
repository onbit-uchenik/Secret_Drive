import bcrypt = require("bcryptjs");
import passportLocal = require("passport-local");
import {query} from "../db";
import { QueryResult } from "pg";
import logger from "../util/logger";
import { Request, Response, NextFunction } from "express";
const LocalStrategy = passportLocal.Strategy;

export const configStrategy  = (passport: any) => {
  passport.use(new LocalStrategy(
    function (username: string, password: string, done: any) {
      query("SELECT name,password FROM atithi WHERE name = $1", [username])
        .then(function (result: QueryResult<any>) {
          const data = result.rows;
          if (data.length === 0) {
            return done(null, false, { message: "User Doesn't Exist.Kindly register" });
          }
          const hash = data[0].password;
          bcrypt.compare(password, hash)
            .then(function (match) {
              return match ? done(null, data[0].name) : done(null, false, { message: "Password Doesn't Match" });
            })
            .catch(function (err) {
              logger.error(err);
              return done(null, false, { message: "Internal Server Error. Kindly try Again" });
            });
        })
        .catch(function (err) {
          logger.error(err);
          return done(null, false, { message: "Internal Server Error. Kindly try Again" });
        });
    }
  ));


  // meaning storing a information in cookie to identify the user.
  passport.serializeUser(function (user: string, done:any) {
    done(null, user);
  });

  passport.deserializeUser(function (id: string, done:any) {
    done(null, id);
  });

};

export const isAuthenticated = (req:Request, res:Response, next:NextFunction) => {
  if(req.isAuthenticated()) {
    res.set("Cache-control", "no-cache, private, no-store, must-revalidate, post-check=0,pre-check=0");
    return next();
  } else {
    console.log("the request was not authenticated");
    res.redirect("/login");
  }
};
