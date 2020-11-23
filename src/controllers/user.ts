import {Request, Response, NextFunction} from "express";
import { check, validationResult } from "express-validator";
import {query} from "../db";
import { QueryResult } from "pg";
import bcrypt = require("bcryptjs");
import logger from "../util/logger";
import passport = require("passport");
import {validPasswordLength} from "../env";
import express = require("express");


const router = express.Router();

router
  .get("/signup", (req:Request, res:Response) => {
      res.render("signup");
  })
  .post("/signup", async (req: Request, res: Response) => {
    const {email="", 
    username="", password="", confirmPassword=""} = req.body;
    
    await check("email").isEmail().normalizeEmail().run(req);
    await check("username").notEmpty().run(req);
    await check("password").isLength({min:validPasswordLength }).run(req);
    await check("confirmPassword").equals(req.body.password).run(req);
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      res.statusCode = 422;
      errors.array.forEach((err) => {
        if(err.param === "confirmPassword") {
          res.render("signup", {err:"Passwords do not matches"});
          return;
        }
      });
      res.render("signup", {err: "Kindly cross-check all entries"});
      return;
    }  
  
  });


/**
 * 
 * @param req Request
 * @param res Response
 * POST /signup
 */
export const postSignup = async (req: Request, res: Response) => {
  
  await check("email").isEmail().normalizeEmail().run(req);
  await check("username").notEmpty().run(req);
  await check("password").isLength({min:validPasswordLength }).run(req);
  await check("confirmPassword").equals(req.body.password).run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.statusCode = 422;
    console.log(errors);
    let err = "";
    errors.array().forEach(element => {
      if(element.param === "confirmPassword") {
        err += "Password do not matches";
      }
      else {
        err += "Invalid " + element.param + ".";
      }      
    });
    res.render("signup",{err:`${err}`});
    return;
  }
  const user = {
    email: req.body.email,
    passsword: req.body.password,
    username: req.body.username
  };

  query("SELECT name FROM atithi WHERE name = $1", [user.username])
    .then(function (result: QueryResult) {
      if (result.rows.length !== 0) {
        req.flash("error", "User already registered");
        res.render("signup",{err:"User already registered, try login."});
      }
      else {
        bcrypt.genSalt(12)
          .then(function (salt: string) {

            bcrypt.hash(user.passsword, salt)
              .then(function (hash: string) {

                query("INSERT INTO atithi(name,email,password) VALUES($1,$2,$3)", [user.username, user.email, hash])
                  .then(function (result :QueryResult) {
                    req.flash("success_message", "Registered successfully... Login to continue..");
                    res.redirect("/login");
                  })
                  .catch(function (err) {
                    logger.error(err);
                    console.error(err);
                    res.render("signup",{err:"internal server error"});
                  });

              })
              .catch(function (err) {
                logger.error(err);
                console.error("error while calculation hash of password");
                res.render("signup",{err:"internal server error"});
              });

          })
          .catch(function (err) {
            logger.error(err);
            console.error(err);
            res.render("signup",{err:"internal server errror"});
          });
      }


    })
    .catch(function (err) {
      logger.error(err);
      console.error(err);
      res.render("signup",{});
    });

};

/**
 * 
 * @param req Request
 * @param res Response
 * GET /login
 */
export const getLogin = (req:Request, res:Response) => {
  res.render("login");
};

/**
 * 
 * @param req Request
 * @param res Response
 * @param next NextFunction 
 * POST /login
 */
export const postLogin = async (req:Request, res:Response, next:NextFunction) => {
  await check("password").isLength({min: 1}).run(req);
  passport.authenticate("local", {
    failureRedirect: "/login",
    successRedirect: "/dashboard",
    failureFlash: true
  })(req, res, next);
};

/**
 * 
 * @param req Request
 * @param res Response
 * GET /logout
 */
export const getLogout = (req:Request, res:Response) => {
  req.logOut();
  res.redirect("/");
};



export const getThankyou = (req: Request, res: Response) => {
  res.render("thankyou");
};