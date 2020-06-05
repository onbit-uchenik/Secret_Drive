const express = require('express')
const routes = express.Router()
const promise = require('bluebird')
const db = promise.promisifyAll(require('../db'))
const addon = require('../build/Release/addon.node')
const notifications = require('../lib/notifications')

routes.post('/askMembers', (req, res) => {
  const { teamName } = req.body
  console.log(teamName)
  const initiator = req.session.passport.user
  db.queryAsync('SELECT membername FROM link WHERE teamname=$1', [teamName])
    .then(function (result) {
      const members = []
      result.rows.forEach((element) => {
        members.push(element.name)
      })

      // getting complete details of team from database

      db.queryAsync('SELECT membercnt,threshold FROM team WHERE name=$1', [teamName])
        .then(function (result) {
          const data = result.rows[0]
          if (addon.addTeam(teamName, data.membercnt, data.threshold, true)) {
            notifications.askFromMembersNotification(members, teamName, initiator)
            res.statusCode = 200
            res.end()
          } else {
            res.statusCode = 400
            res.end()
          }
        })
        .catch(function (err) {
          console.log(err)
          res.statusCode = 500
          res.end()
        })
    })
    .catch(function (err) {
      console.log(err)
      res.statusCode = 500
      res.end()
    })
})

module.exports = routes
