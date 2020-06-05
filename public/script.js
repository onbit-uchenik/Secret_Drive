const term = new Terminal({ cursorBlink: true })
const fileSelector = document.getElementById('fileSelector')
const divTerminal = document.getElementById('terminal')

const session = {
  current_command: '',
  history: [],
  historyLength: 0,
  prefix: '',
  directory: '~$ ',
  lock: false
}
// attaches all event listeners and intialises to the script.

function init () {
  term.open(document.getElementById('terminal'))
  term.write(session.prefix + session.directory)
  term.attachCustomKeyEventHandler(keyboardHandler)
  fileSelector.onchange = selectFileFromLocal
}

async function keyboardHandler(event) {
  event.preventDefault()
  event.stopPropagation()

  if (event.type === 'keydown' && !session.lock) {
    if (event.code === 'Enter') {
      await parseCommand()
    } else if (event.code === 'ControlLeft' || event.code === 'ControlRight' || event.code === 'ShiftLeft' || event.code === 'ShiftRight' || event.code === 'AltLeft' || event.code === 'AltRight' || event.code === 'Tab') {
      // do nothing
    } else if (event.code === 'ArrowLeft') {
      term.write('\b')
    } else if (event.code === 'ArrowRight') {
      term.write('\t')
    } else if (event.code === 'ArrowUp') {

    } else if (event.code === 'Backspace') {
      session.current_command = session.current_command.substring(0, session.current_command.length - 1)
      term.write('\b \b')
    } else {
      session.current_command += event.key
      term.write(event.key)
    }
  }
}

function selectFileFromLocal () {
  const fileList = this.files
  console.log(typeof fileList)
  divTerminal.style.display = 'block'
  fileSelector.style.display = 'none'
  Array.from(fileList).forEach(file => {
    const formData = new FormData()
    formData.append('file', file)
    uploadFile(formData)
      .then(function () {
        console.log('file uploaded successfully', formData.get('file').name)
      })
      .catch(function (err) {
        console.log(err)
        console.log('error while uploading file', formData.get('file').name)
      })
  })
}

function uploadFile (formData) {
  return new Promise(function (resolve, reject) {
    fetch('/upload', {
      method: 'POST',
      credentials: 'same-origin',
      body: formData
    })
      .then(function (response) {
        if (response.status !== 200) {
          reject(new Error(''))
          return
        }
        resolve()
      })
      .catch(function (err) {
        console.log(err)
        reject(new Error(''))
      })
  })
}



function runCommand(cmnd) {
  return new Promise(function () {
    session.lock = true
    if(commandBox[cmnd] !== undefined) {
      commandBox[cmnd.split(' ')[0]](cmnd)
      .then(function(){
        term.write('\r\n' + session.prefix + session.directory)
        session.history.push(session.current_command)
        session.current_command = ''
        session.historyLength++
        session.lock = false  
      })
      .catch(function(err){
        term.write('\r\n' + session.current_command + err)
        term.write('\r\n' + session.prefix + session.directory)
        session.history.push(session.current_command)
        session.current_command = ''
        session.historyLength++
        session.lock = false
      })
    }
    else {
      term.write('\r\n' + session.current_command + ': command not found')
      session.history.push(session.current_command)
      session.current_command = ''
      session.historyLength++
      session.lock = false
    }
  })
}

const commandBox = {
  open: function(cmnd) {
    return new Promise(function (resolve,reject) {
      const route = '/openTeamDrive'
      const driveName = cmnd.split(' ')[3]
      sendCommandToServer(route,{driveName: driveName})
        .then(function(result){
          session.prefix = result
          resolve()
        })
        .catch(function(err){
          reject(err)
        })
    })
  }
}

function sendCommandToServer(route,data) {
  return new Promise(function (resolve,reject) {
    fetch(route, {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)})
      .then(function (response){
        if(response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' + response.status)
          reject(new Error('bad request to server'))
          return 
        }
        response.json()
          .then(function(data){
            resolve(data.result)
          })
          .catch(function(err) {
            console.log('oops error while parsing json response from server',err)
            reject(new Error('unable to parse the response kindly try agian'))
          })   
      })
      .catch(function (err){
        reject(new Error('unable to request server'))
      })
}