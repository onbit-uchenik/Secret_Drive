let btn = document.getElementById("btn");

btn.onclick = function getNotifications(){
    console.log("fetching the notifications");
    fetch("/notifications",{method:"GET",credentials:'same-origin'}) 
      .then(function(response) {
          if (response.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' +
              response.status);
            return;
          }
            console.log(response);
            console.log(typeof(response));
            // Examine the text in the response
            response.json().then(function(data) {
                console.log(data);
                let div = document.getElementById("notifications");
                data.forEach((notification) => {
                  if(notification.type === 'joinTeam'){
                    let button = document.createElement("button");
                    button.innerHTML  = `Join team ${notification.teamName}`
                    button.onclick = function joinTeam(){
                      console.log(`Join team ${notification.teamName}`);
                      fetch("/joinTeam",
                        {
                          method:'POST',
                          credentials:'same-origin',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body:JSON.stringify({teamName:notification.teamName,tkn:notification.token})
                          }
                        )
                      .then(function(response){
                        if (response.status !== 200) {
                          console.log('Looks like there was a problem. Status Code: ' +
                            response.status);
                          return;
                        }
                        console.log("team joined successfully");
                        div.removeChild(button);

                      })
                      .catch(function(err){
                        console.log('Fetch Error :-S', err);
                      })
                    }
                    div.appendChild(button);
                  }
                  else{
                    let button = document.createElement("button");
                    button.innerHTML  = `Allow member ${notification.from} for team ${notification.teamName}`
                    button.onclick = function joinTeam(){
                      console.log(`Allow member ${notification.from} for team ${notification.teamName}`);
                      fetch("/allowMember",
                        {
                          method:'POST',
                          credentials:'same-origin',
                          headers: {
                            'Content-Type': 'application/json'
                          },
                          body:JSON.stringify({teamName:notification.teamName,token:notification.token})
                          }
                        )
                      .then(function(response){
                        if (response.status !== 200) {
                          console.log('Looks like there was a problem. Status Code: ' +
                            response.status);
                          return;
                        }
                      })
                      .catch(function(err){
                        console.log('Fetch Error :-S', err);
                      })                    
                    }
                    div.appendChild(button);
                  }
                });
            })
            .catch(function(err){
              console.log("oops some error while parsing the response",err);
            })
        })
    .catch(function(err) {
        console.log('Fetch Error :-S', err);
    });
    
}