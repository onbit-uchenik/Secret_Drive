const promise = require('bluebird')
const db = promise.promisifyAll(require('./db'))
const bcrypt = require('bcryptjs')
const LocalStrategy = require('passport-local').Strategy

module.exports = {
  x: (passport) => {
    // start of authentication strategy...

    passport.use(new LocalStrategy(
      function (username, password, done) {
        db.queryAsync('SELECT name,password FROM atithi WHERE name = $1', [username])
          .then(function (result) {
            const data = result.rows
            if (data.length === 0) {
              return done(null, false, { message: "User Doesn't Exist.Kindly register" })
            }

            bcrypt.compare(password, data[0].password, function (err, match) {
              if (err) {
                return done(null, false, { message: 'Internal Server Error. Kindly try Again' })
              }
              if (!match) {
                return done(null, false, { message: "Password Doesn't Match" })
              }
              if (match) {
                return done(null, data[0])
              }
            })
          })

          .catch(function (err) {
            done(err)
          })
      }
    ))
    // meaning storing a information in cookie to identify the user.
    passport.serializeUser(function (user, cb) {
      cb(null, user.name)
    })
    // meaning using a information store in the cookie to get more information about the user
    // and attaching the object of imformation with that user.
    passport.deserializeUser(function (username, cb) {
      cb(null, username)
    })

    // end of authentication strategy..
  }
}
