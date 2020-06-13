const btn = document.getElementById("btn");
var notificationsBlock = document.getElementById("notifications");
const teams = document.getElementById("teams");
var teamsBlock = document.getElementById("teamsBlock");

btn.onclick = function getNotifications () {
  console.log("fetching notifications ....");
  fetch("/notifications", { method: "GET", credentials: "same-origin" })
    .then(function (response) {
      if (response.status !== 200) {
        console.log("Looks like there was a problem. Status Code: " +
          response.status);
        return;
      }
      response.json().then(function (data) {
        data.forEach((e) => {
          if (e.notification.type === "joinTeam") {
            createJoinButtonNotification(e.notification);
          } else if (e.notification.type === "permissionToOpenDrive") {
            createPermissionToOpenDriveButtonNotification(e.notification);
          } else if (e.notification.type === "allMembersJoined") {
            createAllMembersJoinedNotification(e.notification);
          } else if (e.notification.type === "openTeam") {
            createOpenTeamButtonNotification(e.notification);
          }
        });
      })
        .catch(function (err) {
          console.log("oops some error while parsing the response", err);
        });
    })
    .catch(function (err) {
      console.log("Fetch Error :-S", err);
    });
};

/*
  requesting server to fetch all the team for the user.....
*/
teams.onclick = function getTeams () {
  console.log("fetchimg your teams...");
  fetch("/myTeams", { method: "GET", credentials: "same-origin" })
    .then(function (response) {
      if (response.status !== 200) {
        console.log("Looks like there was a problem. Status Code: " +
          response.status);
        return;
      }
      response.json().then(function (data) {
        data.forEach((team) => {
          createMyTeamButton(team);
        });
      })
        .catch(function (err) {
          console.log("oops there is problem while parsing the JSON", err);
        });
    })
    .catch(function (err) {
      console.log("Fetch Error :-S", err);
    });
};

function createJoinButtonNotification (notification) {
  const button = document.createElement("button");
  button.innerHTML = `Join team ${notification.teamname}`;
  button.onclick = function joinTeam () {
    console.log(`Join team ${notification.teamname}`);
    fetch("/joinTeam",
      {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ teamname: notification.teamname })
      }
    ).then(function (response) {
      if (response.status !== 200) {
        console.log("Looks like there was a problem. Status Code: " +
          response.status);
        return;
      }
      console.log("team joined successfully");
      notificationsBlock.removeChild(button);
    })
      .catch(function (err) {
        console.log("Fetch Error :-S", err);
      });
  };
  notificationsBlock.appendChild(button);
}

function createPermissionToOpenDriveButtonNotification (notification) {
  const button = document.createElement("button");
  button.innerHTML = `Allow member ${notification.initiator} for team ${notification.drivename}`;
  button.onclick = function joinTeam () {
    console.log(`Allow member ${notification.initiator} for team ${notification.drivename}`);
    fetch("/allowMember",
      {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ teamname: notification.drivename, initiator: notification.initiator })
      }
    )
      .then(function (response) {
        if (response.status !== 200) {
          console.log("Looks like there was a problem. Status Code: " +
            response.status);
          return;
        }

        console.log("allowed the member");
        notificationsBlock.removeChild(button);
      })
      .catch(function (err) {
        console.log("Fetch Error :-S", err);
      });
  };
  notificationsBlock.appendChild(button);
}

function createAllMembersJoinedNotification (notification) {
  console.log(notification);
  const p = document.createElement("p");
  p.innerHTML = `Team created ${notification.teamname}`;
  p.onclick = function () {
    notificationsBlock.removeChild(p);
  };
  notificationsBlock.appendChild(p);
}

function createMyTeamButton (team) {
  const button = document.createElement("button");
  button.innerHTML = `Team ${team.teamname}`;
  button.onclick = function openteamDrive () {
    console.log(`requesting to open Team ${team.teamname}`);
    fetch("/askfrommembers",
      {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ teamname: team.teamname })
      }
    )
      .then(function (response) {
        if (response.status !== 200) {
          console.log("Looks like there was a problem. Status Code: " +
            response.status);
          return;
        }
        console.log("asking for members");
      })
      .catch(function (err) {
        console.log("Fetch Error :-S", err);
      });
  };
  teamsBlock.appendChild(button);
}

function createOpenTeamButtonNotification (notification) {
  const p = document.createElement("p");
  p.innerHTML = `You can now open ${notification.teamname} drive go to terminal and type command open team drive ${notification.teamname}`;
  notificationsBlock.appendChild(p);
  p.onclick = function () {
    notificationsBlock.removeChild(p);
  };
  notificationsBlock.appendChild(p);
}
