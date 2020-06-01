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

          else if (notification.type === 'teamCreated') {
            createTeamCreatedNotification(notification);
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
        body: JSON.stringify({ teamName: notification.teamName, tkn: notification.token })
      }
    ).then(function (response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
      }
      console.log("team joined successfully");
      div.removeChild(button);

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
        body: JSON.stringify({ teamName: notification.teamName, tkn: notification.token, by: notification.by })
      }
    )
      .then(function (response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }

        console.log("permission send to all members");
        notificationsBlock.removeChild(button);
      })
      .catch(function (err) {
        console.log('Fetch Error :-S', err);
      })
  }
  notificationsBlock.appendChild(button);
}


function createTeamCreatedNotification(notification) {
  let p = document.createElement('p');
  p.innerHTML = `Team created ${notification.teamName}`;
  notificationsBlock.appendChild(button);
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
  let button = document.createElement("button");
  button.innerHTML = `open ${notification.teamName} Drive`
  button.onclick = function joinTeam() {
    console.log(`open ${notification.teamName} Drive`);
    console.log(notification);
    fetch("/openMyTeamDrive",
      {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ teamName: notification.teamName, tkn: notification.token, details: notification.details,timestamp:notification.timestamp })
      }
    )
      .then(function (response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }

        console.log("Opened your drive");
        notificationsBlock.removeChild(button);
      })
      .catch(function (err) {
        console.log('Fetch Error :-S', err);
      })
  }
  notificationsBlock.appendChild(button);

}
