const express = require('express')
const routes = express.Router()
const promise = require('bluebird')
const db = promise.promisifyAll(require('../db'))
const addon = require('../build/Release/addon.node')
const drive = require('../lib/drive')

routes.post('/openTeamDrive', (req, res) => {
  const user = req.session.passport.user
  const { driveName } = req.body
  const currentDrive = drive.canDriveOpen(user, driveName)
  if (currentDrive !== null) {
    if (!drive.isDriveAlreadyOpened(driveName)) {
      const queryString = formQuery(currentDrive.members, currentDrive.driveName)
      console.log(queryString)
      db.queryAsync(queryString)
        .then(function (result) {
          const arr = []
          for (let i = 0; i < currentDrive.threshold; i++) {
            result.rows[i].share.forEach((val) => {
              arr.push(val)
            })
          }
          const kshares = new Uint8Array(arr)
          console.log(kshares)
          const secret = addon.getSecret(kshares, parseInt(currentDrive.threshold, 10))
          console.log(secret)
          const currentOpenedDrive = new drive.OpenDrive(driveName, secret, user)
          drive.addOpenedDriveToOpenDriveList(currentOpenedDrive)
          drive.removeDriveFromDriveToOpen(user, driveName)
          res.json({ result: `${user}@${driveName}:` })
          res.end()
        })
        .catch(function (err) {
          console.log(err)
          drive.removeDriveFromDriveToOpen(user, driveName)
          res.statusCode = 500
          res.end()
        })
    } else {
      drive.getDriveAlreadyOpened(driveName).addMember(user)
      res.statusCode = 200
      res.json({ result: `${user}@${driveName}:` })
      res.end()
    }
  } else {
    res.statusCode = 400
    res.end()
  }
})

function formQuery (members, teamName) {
  let queryString = 'SELECT share.share FROM link INNER JOIN share on link.shareid=share.id WHERE link.membername IN('
  for (let i = 0; i < members.length - 1; i++) {
    const temp = "'" + `${members[i]}` + "',"
    console.log(temp)
    queryString += temp
  }
  queryString = queryString.slice(0, queryString.length - 1)
  queryString += `) and teamname='${teamName}'`

  return queryString
}
