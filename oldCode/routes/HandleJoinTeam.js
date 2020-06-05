const express = require('express')
const routes = express.Router()
const promise = require('bluebird')
const db = promise.promisifyAll(require('../db'))
const addon = require('../build/Release/addon.node')
const fs = require('fs')
const notifications = require('../lib/notifications')

routes.post('/joinTeam', async (req, res) => {
  const { teamName } = req.body
  const user = req.session.passport.user

  const output = addon.addMember(teamName, user, false)

  if (output.error === '') {
    if (output.message === 'member added successfully') {
      if (output.allMemberJoined) {
        const members = output.members.split(' ')
        const secret = addon.createUniqueSecret()
        console.log(secret)
        const shares = addon.getShares(secret, output.memberCnt, output.threshold)
        console.log(shares)
        db.queryAsync('INSERT INTO team(name,membercnt,threshold) VALUES($1,$2,$3)', [output.teamName, output.memberCnt, output.threshold])
          .then(function () {
            console.log('team added in database')
          })
          .catch(function (err) {
            console.log(err)
          })

        const x = secret.length * 2
        let temp = []
        let j = 0; let cnt = 0

        for (let i = 0; i < output.memberCnt; i++) {
          temp = []
          cnt = 0
          while (cnt < x) {
            temp.push(shares[j])
            j++
            cnt++
          }
          console.log(`shares of ${members[i]}=>`, temp)
          db.queryAsync('INSERT INTO share(share) VALUES($1) RETURNING id', [temp])
            .then(function (result) {
              const id = result.rows[0].id
              console.log('shares added to the database')
              console.log(id)
              db.queryAsync('INSERT INTO link(teamname,membername,shareid) VALUES($1,$2,$3)', [output.teamName, members[i], id])
                .then(function () {
                  console.log('link table inserted')
                })
                .catch(function (err) {
                  console.log(err)
                  res.statusCode = 500
                  res.end()
                })
            })
            .catch(function (err) {
              res.statusCode = 500
              res.end()
              console.log(err)
            })
        }
        // sending notifications to all the members that team is now formed..
        notifications.teamCreatedNotification(members, teamName)
        // creating folder...
        fs.mkdir(`/home/onbit-syn/data/${secret}`, { recursive: true }, (err) => {
          if (err) throw err
          console.log('secret location to store data is formed')
        })

        res.statusCode = 200
        res.end()
      } else {
        res.statusCode = 200
        res.end()
      }
    }
  } else {
    res.statusCode = 500
    res.end()
  }
})

module.exports = routes