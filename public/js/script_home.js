let btn = document.getElementById("btn");
var notificationsBlock = document.getElementById("notifications");
let teams = document.getElementById("teams")
var teamsBlock = document.getElementById("teamsBlock");

btn.onclick = function getNotifications() {
  console.log("fetching notifications ....");
  fetch("/notifications", { method: "GET", credentials: 'same-origin' })
    .then(function (response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
      }
      response.json().then(function (data) {

        data.forEach((notification) => {

          if (notification.type === 'joinTeam') {
            createJoinButtonNotification(notification);
          }

          else if (notification.type === 'allowMember') {
            createAllowMemberButtonNotification(notification);
          }

          else if (notification.type === 'allMembersJoined') {
            createAllMembersJoinedNotification(notification);
          }

          else if (notification.type === 'openTeam') {
            createOpenTeamButtonNotification(notification);
          }

        });
      })
      .catch(function (err) {
        console.log("oops some error while parsing the response", err);
      })
    })
    .catch(function (err) {
      console.log('Fetch Error :-S', err);
    });

}


/*
  requesting server to fetch all the team for the user.....
*/
teams.onclick = function getTeams() {
  console.log("fetchimg your teams...");
  fetch("/myTeams", { method: "GET", credentials: 'same-origin' })
    .then(function (response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
      }
      response.json().then(function (data) {

        data.forEach((team) => {
          createMyTeamButton(team);
        })
      })
        .catch(function (err) {
          console.log("oops there is problem while parsing the JSON", err);
        })
    })
    .catch(function (err) {
      console.log('Fetch Error :-S', err);
    })
}


function createJoinButtonNotification(notification) {
  let button = document.createElement("button");
  button.innerHTML = `Join team ${notification.teamName}`
  button.onclick = function joinTeam() {
    console.log(`Join team ${notification.teamName}`);
    fetch("/joinTeam",
      {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ teamName: notification.teamName})
      }
    ).then(function (response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
      }
      console.log("team joined successfully");
      notificationsBlock.removeChild(button);

    })
      .catch(function (err) {
        console.log('Fetch Error :-S', err);
      })
  }
  notificationsBlock.appendChild(button);
}


function createAllowMemberButtonNotification(notification) {
  let button = document.createElement("button");
  button.innerHTML = `Allow member ${notification.by} for team ${notification.teamName}`
  button.onclick = function joinTeam() {
    console.log(`Allow member ${notification.by} for team ${notification.teamName}`);
    fetch("/allowMember",
      {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ teamName: notification.teamName, by: notification.by })
      }
    )
      .then(function (response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }

        console.log("allowed the member");
        notificationsBlock.removeChild(button);
      })
      .catch(function (err) {
        console.log('Fetch Error :-S', err);
      })
  }
  notificationsBlock.appendChild(button);
}


function createAllMembersJoinedNotification(notification) {
  console.log(notification);
  let p = document.createElement('p');
  p.innerHTML = `Team created ${notification.teamName}`;
  p.onclick = function(){
    notificationsBlock.removeChild(p);
  }
  notificationsBlock.appendChild(p);
}


function createMyTeamButton(team) {
  let button = document.createElement('button');
  button.innerHTML = `Team ${team.teamname}`;
  button.onclick = function openteamDrive() {
    console.log(`requesting to open Team ${team.teamname}`);
    fetch("/askMembers",
      {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ teamName: team.teamname })
      }
    )
      .then(function (response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }
        console.log("asking for members");
      })
      .catch(function (err) {
        console.log('Fetch Error :-S', err);
      })

  }
  teamsBlock.appendChild(button);
}


function createOpenTeamButtonNotification(notification) {
  let p = document.createElement("p");
  p.innerHTML = `You can now open ${notification.teamName} drive go to terminal and type command open team drive ${notification.teamName}`
  notificationsBlock.appendChild(p);
  p.onclick = function(){
    notificationsBlock.removeChild(p);
  }
  notificationsBlock.appendChild(p);  
}
