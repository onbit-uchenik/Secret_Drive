const express = require('express')
const routes = express.Router()
// const promise = require('bluebird')
// const db = promise.promisifyAll(require('../db'))
// const addon = require('../build/Release/addon.node')
// const url = require('url')
// const fs = require('fs')

class Drive {
  constructor (secret, member) {
    this.secret = secret
    this.members = [member]
  }
}

var drivesOpen = {}

// const commandBox = {}

function addDriveTodrivesOpen (data) {
  const { teamName, secret, member } = data
  if (!teamName || !secret || !member) {
    return false
  } else {
    drivesOpen[teamName] = new Drive(secret, member)
  }
}

function addMemberToDriveOpenend (data) {
  console.log('hey deva shri ganesha deva.....')
  const { teamName, member } = data
  if (!teamName || !member) {
    return false
  } else {
    drivesOpen[teamName].members.push(member)
    console.log(drivesOpen)
  }
}

function isTeamDriveOpen (teamName) {
  console.log(drivesOpen)
  if (drivesOpen[teamName] !== undefined) return true
  else return false
}

routes.post('/command/exit', (req, res) => {
  const user = req.session.passport.user
  const { teamName, command } = req.body
  console.log(teamName)
  console.log(command)
  if (!user || !teamName || !command) {
    res.statusCode = 400
    res.end()
  } else {
    // console.log(drivesOpen[teamName]);
    if (drivesOpen[teamName] !== undefined && drivesOpen[teamName].members.includes(user)) {
      const index = drivesOpen[teamName].members.indexOf(user)
      drivesOpen[teamName].members.splice(index, 1)
      if (drivesOpen[teamName].members.length === 0) {
        delete drivesOpen[teamName]
        console.log(drivesOpen)
      }
      res.statusCode = 200
      res.send({ result: '' })
      res.end()
    } else {
      res.statusCode = 400
      res.end()
    }
  }
})

module.exports = {
  routes: routes,
  addDriveTodrivesOpen: addDriveTodrivesOpen,
  isTeamDriveOpen: isTeamDriveOpen,
  addMemberToDriveOpenend: addMemberToDriveOpenend
}
