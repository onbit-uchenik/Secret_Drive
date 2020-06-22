const term = new Terminal({ cursorBlink: true });
const fileSelector = document.getElementById("fileSelector");
const divTerminal = document.getElementById("terminal");

const session = {
  current_command: "",
  history: [],
  historyLength: 0,
  prefix: "",
  directory: "~$ ",
  lock: false
};
// attaches all event listeners and intialises to the script.

(function() {
  term.open(document.getElementById("terminal"));
  term.write(session.prefix + session.directory);
  term.attachCustomKeyEventHandler(keyboardHandler);
  fileSelector.onchange = selectFileFromLocal;
})();

async function keyboardHandler(event) {
  event.preventDefault();
  event.stopPropagation();

  if (event.type === "keydown" && !session.lock) {
    if (event.code === "Enter") {
      await runCommand(session.current_command);
    } else if (event.code === "ControlLeft" || event.code === "ControlRight" || event.code === "ShiftLeft" || event.code === "ShiftRight" || event.code === "AltLeft" || event.code === "AltRight" || event.code === "Tab") {
      // do nothing
    } else if (event.code === "ArrowLeft") {
      term.write("\b");
    } else if (event.code === "ArrowRight") {
      term.write("\t");
    } else if (event.code === "ArrowUp") {

    } else if (event.code === "Backspace") {
      session.current_command = session.current_command.substring(0, session.current_command.length - 1);
      term.write("\b \b");
    } else {
      session.current_command += event.key;
      term.write(event.key);
    }
  }
}

function selectFileFromLocal () {
  return new Promise(function(resolve,reject) {
    const fileList = this.files;
    console.log(typeof fileList);
    divTerminal.style.display = "block";
    fileSelector.style.display = "none";
    let cnt = 1;
    const fileListNotUpdatedSuccessfully = [];
    Array.from(fileList).forEach( (file,index,array) => {
    const formData = new FormData();
    formData.append("file", file);
    uploadFile(formData)
      .then(function () {
        if(cnt === array.length) {
          resolve(fileListNotUpdatedSuccessfully);
        }
        console.log("file uploaded successfully", formData.get("file").name);
        cnt++;
      })
      .catch(function (err) {
        fileListNotUpdatedSuccessfully.push(formData.get("file").name);
        if(cnt === array.length) {
          resolve(fileListNotUpdatedSuccessfully);
        }
        cnt++;
        console.log(err);
        console.log("error while uploading file", formData.get("file").name);
      });
    });
  });
}

function uploadFile (formData) {
  return new Promise(function (resolve, reject) {
    fetch("/upload", {
      method: "POST",
      credentials: "same-origin",
      body: formData
    })
      .then(function (response) {
        if (response.status !== 200) {
          reject(new Error(""));
          return;
        }
        resolve();
      })
      .catch(function (err) {
        console.log(err);
        reject(new Error(""));
      });
  });
}



function runCommand(cmnd) {
  return new Promise(function () {
    session.lock = true;
    const command = cmnd.split(" ")[0];
    if(commandBox[command] !== undefined) {
      commandBox[command](cmnd)
      .then(function(){
        term.write("\r\n" + session.prefix + session.directory);
        session.history.push(session.current_command);
        session.current_command = "";
        session.historyLength++;
        session.lock = false;  
      })
      .catch(function(err){
        term.write("\r\n" + session.current_command + err);
        term.write("\r\n" + session.prefix + session.directory);
        session.history.push(session.current_command);
        session.current_command = "";
        session.historyLength++;
        session.lock = false;
      });
    }
    else {
      term.write("\r\n" + session.current_command + ": command not found");
      term.write("\r\n" + session.prefix + session.directory);
      session.history.push(session.current_command);
      session.current_command = "";
      session.historyLength++;
      session.lock = false;
    }
  });
}

const commandBox = {
  open: function(cmnd) {
    return new Promise(function (resolve,reject) {
      const route = "/openDrive";
      const drivename = cmnd.split(" ")[3];
      sendCommandToServer(route,{drivename: drivename})
        .then(function(result){
          session.prefix = result;
          resolve();
        })
        .catch(function(err){
          reject(err);
        });
    });
  },
  mkdir: function(cmnd) {
    return new Promise(function(resolve, reject) {
      normalCommand(cmnd)
        .then(function() {
          resolve();
        })
        .catch(function(err){
          reject(err);
        });
    });
    
  },
  rm: function(cmnd) {
    return new Promise(function(resolve, reject) {
      normalCommand(cmnd)
        .then(function() {
          resolve();
        })
        .catch(function(err){
          reject(err);
        });
    });
  },
  move: function(cmnd) {
    return new Promise(function(resolve, reject) {
      normalCommand(cmnd)
        .then(function() {
          resolve();
        })
        .catch(function(err){
          reject(err);
        });
    });
  },
  copy: function(cmnd) {
    return new Promise(function(resolve, reject) {
      normalCommand(cmnd)
        .then(function() {
          resolve();
        })
        .catch(function(err){
          reject(err);
        });
    }); 
  },
  exit: function(cmnd) {
    return new Promise(function (resolve,reject) {
      const route = "/closedrive";
      let drivename = session.prefix.split("@")[1];
      drivename = drivename.substr(0,drivename.length-1);
      sendCommandToServer(route,{drivename:drivename})
        .then(function(){
          session.prefix = "";
          session.directory = "~$";
          resolve();
        })
        .catch(function(err) {
          reject(err);
        });
    });
  },
  upload: function(cmnd) {
    return new Promise(function(resolve) {
      divTerminal.style.display = "none";
      fileSelector.style.display = "block";
      selectFileFromLocal()
        .then(function(fileListNotUpdatedSuccessfully){
          console.log(fileListNotUpdatedSuccessfully);
        });
      resolve();
    });
  },
  ls: function(cmnd) {
    return new Promise(function(resolve, reject) {
      normalCommand(cmnd)
        .then(function() {
          resolve();
        })
        .catch(function(err){
          reject(err);
        });
    });
  }

};

function normalCommand(cmnd){
  return new Promise(function(resolve, reject) {
    const route = "/command";
    let drivename = session.prefix.split("@")[1];
    drivename = drivename.substr(0,drivename.length-1);
    sendCommandToServer(route,{command:cmnd,drivename:drivename})
    .then(function(result) {
      term.write("\r\n" + result);
      resolve();
    })
    .catch(function(err) {
      reject(err);
    });
  });
}


function sendCommandToServer(route,data) {
  return new Promise(function (resolve,reject) {
    fetch(route, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)})
      .then(function (response){
        if(response.status !== 200) {
          console.log("Looks like there was a problem. Status Code: " + response.status);
          reject(new Error("bad request to server"));
          return; 
        }
        response.json()
          .then(function(data){
            resolve(data.result);
          })
          .catch(function(err) {
            console.log("oops error while parsing json response from server",err);
            reject(new Error("unable to parse the response kindly try agian"));
          });   
      })
      .catch(function (err){
        console.log("error while running the request in the server",err);
        reject(new Error("unable to request server"));
      });
});
}