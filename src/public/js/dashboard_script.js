const ul = document.getElementById("notifications");

function askFromMembers(x) {
  console.log(this.event);
  console.log(x);
  fetch("/askfrommembers",
    {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ teamname: x })
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
}

function getNotifications() {
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
          } else if (e.notification.type === "driveOpenSuccessful") {
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
}



function createJoinButtonNotification (notification) {
  const li  = document.createElement("li");
  li.innerHTML = `Join team ${notification.teamname}`;
  li.onclick = function joinTeam () {
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
      ul.removeChild(li);
    })
      .catch(function (err) {
        console.log("Fetch Error :-S", err);
      });
  };
  ul.appendChild(li);
}

function createPermissionToOpenDriveButtonNotification (notification) {
  const li = document.createElement("li");
  li.innerHTML = `Allow member ${notification.initiator} for team ${notification.drivename}`;
  li.onclick = function joinTeam () {
    console.log(`Allow member ${notification.initiator} for team ${notification.drivename}`);
    fetch("/allowMember",
      {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ drivename: notification.drivename, initiator: notification.initiator })
      }
    )
      .then(function (response) {
        if (response.status !== 200) {
          console.log("Looks like there was a problem. Status Code: " +
            response.status);
          return;
        }

        console.log("allowed the member");
        ul.removeChild(li);
      })
      .catch(function (err) {
        console.log("Fetch Error :-S", err);
      });
  };
  ul.appendChild(li);
}

function createAllMembersJoinedNotification (notification) {
  const li = document.createElement("li");
  li.innerHTML = `Team created ${notification.teamname}`;
  li.onclick = function () {
    ul.removeChild(li);
  };
  ul.appendChild(li);
}

function createOpenTeamButtonNotification (notification) {
  const li = document.createElement("li");
  li.innerHTML = `You can now open ${notification.drivename} drive go to terminal and type command open team drive ${notification.drivename}`;
  li.onclick = function () {
    window.open("http://localhost:3456/opendrive");
    ul.removeChild(li);
  };
  ul.appendChild(li);
}

