class Notification {
  constructor (to, from, type, teamName, driveName, initiator) {
    this.to = to
    this.from = from
    this.type = type
    this.teamName = teamName
    this.driveName = driveName
    this.initiator = initiator
  }
}
const notifications = {}

module.exports = {
  inviteMembersNotification: inviteMembersNotification,
  askFromMembersNotification: askFromMembersNotification,
  teamCreatedNotification: teamCreatedNotification,
  sendDriveOpenNotification: sendDriveOpenNotification,
  getNotificationsOfUser: getNotificationsOfUser
}

function inviteMembersNotification (toAll, teamName, from) {
  toAll.forEach((to) => {
    if (notifications[to] === undefined) {
      notifications[to] = [new Notification(to, from, 'joinTeam', teamName, null, null)]
    } else {
      notifications[to].push(new Notification(to, from, 'joinTeam', teamName, null, null))
    }
  })
  delete notifications[' ']
  console.log(notifications)
}

function teamCreatedNotification (toAll, teamName) {
  toAll.forEach((to) => {
    if (notifications[to] === undefined) {
      notifications[to] = [new Notification(to, null, 'teamCreationSuccessful', teamName, null, null)]
    } else {
      notifications[to].push(new Notification(to, null, 'teamCreationSuccessful', teamName, null, null))
    }
  })
  delete notifications[' ']
  console.log(notifications)
}

function sendDriveOpenNotification (to, driveName) {
  if (notifications[to] === undefined) {
    notifications[to] = [new Notification(to, null, 'driveOpenSuccessful', null, driveName, null)]
  } else {
    notifications[to].push(new Notification(to, null, 'driveOpenSuccessful', null, driveName, null))
  }
  console.log(notifications)
}

function askFromMembersNotification (toAll, driveName, initiator) {
  toAll.forEach((to) => {
    if (notifications[to] === undefined) {
      notifications[to] = [new Notification(to, null, 'permissionToOpenDrive', null, driveName, initiator)]
    } else {
      notifications[to].push(new Notification(to, null, 'permissionToOpenDrive', null, driveName, initiator))
    }
  })
  delete notifications[' ']
  console.log(notifications)
}

function getNotificationsOfUser (user) {
  const result = notifications[user]
  delete notifications[user]
  return result
}
