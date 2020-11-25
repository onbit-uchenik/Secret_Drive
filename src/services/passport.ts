import bcrypt = require("bcryptjs");
import passportLocal = require("passport-local");
import { getMemberByEmail, getMemberById } from "../models/memberModel"
import { Request, Response, NextFunction } from "express";


const LocalStrategy = passportLocal.Strategy;

interface SerializedUser {
  id: Number;
  role: string;
}

const memberStartegy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password"
  },
  async function (userEmail, password, done) {
    try {
      const member = await getMemberByEmail(userEmail);
      if (!member) {
        done("User Do Not Exist", false, { message: "User Doesn't Exist.Kindly register" });
        return;
      }

      const match = await bcrypt.compare(password, member.memberPassword);
      if (!match) {
        done("Password Donot Matches", false, { message: "Password and Email combination is incorrect" });
        return;
      }

      done(false, { id: member.memberId, role: "member" })
    } catch (err) {
      console.error(err);
      done("Internal Server Error", false, { message: "Internal Server Error Kindly Try Again" });
    };
  }
);

export const configStrategy = (passport) => {
  passport.use("member", memberStartegy);


  // storing small identifier in cookie to maintan session
  passport.serializeUser(function (user: SerializedUser, done: any) {
    
    done(null, JSON.stringify(user));
  });


  passport.deserializeUser(async function (data: string, done: any) {
    try {
      
      const parsedData = JSON.parse(data);
      if (parsedData.role === "member") {
        
        const member = await getMemberById(parsedData.id);
        
        done(null, member);
      }
    } catch (err) {
      console.log(err);
    }
  });
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    res.set("Cache-control", "no-cache, private, no-store, must-revalidate, post-check=0,pre-check=0");
    return next();
  } else {
    console.log("the request was not authenticated");
    res.redirect("/member/login");
  }
};
