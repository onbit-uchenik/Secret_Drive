import { Request, Response, NextFunction } from "express";
import { check, validationResult } from "express-validator";
import bcrypt = require("bcryptjs");
import passport = require("passport");
import {insertMember} from "../models/memberModel"
import express = require("express");


export const router = express.Router();

router
  
  .get("/signup", (req: Request, res: Response) => {
    res.render("signup");
  })

  .post("/signup", async (req: Request, res: Response) => {
    const { email = "",
      username = "", password = "", confirmPassword = "" } = req.body;
    try {
      await check("email").isEmail().normalizeEmail().run(req);
      await check("username").notEmpty().run(req);
      await check("password").isLength(
        {
          min: parseInt(process.env.MIN_PASSWORD_LENGTH, 10)
        }
      ).run(req);
      await check("confirmPassword").equals(req.body.password).run(req);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.statusCode = 422;
        errors.array().forEach((err) => {
          if (err.param === "confirmPassword") {
            res.render("signup", { err: "Passwords do not matches" });
            return;
          }
          
        });
        res.render("signup", { err: "Kindly cross-check all entries" });
        return;
      }
      
      const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUND, 10));
      await insertMember({memberName: username, memberEmail: email, memberPassword: passwordHash});

      req.flash("success_message", "Successful registered, kindly login to continue");
      res.redirect("/member/login");
    } catch (err) {
      console.log(err);
      res.statusCode = 500;
      res.send("<h1> Internal Server Error </h1>");
    }
  })

  .get("/login", (req:Request, res:Response) => {
    res.render("login");
  })

  .post("/login", async (req:Request, res:Response, next: NextFunction) => {
    await check("password").isLength(
      {
      min: parseInt(process.env.MIN_PASSWORD_LENGTH, 10)
      }
      ).run(req);
    passport.authenticate("member", {
      failureRedirect: "/member/login",
      successRedirect: "/dashboard",
      failureFlash: true
    })(req, res, next); 
  })
  
  .get("/logout", (req: Request, res: Response)=>{
    req.logOut();
    res.redirect("/");
  });
