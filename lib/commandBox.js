const fs = require('fs').promises
let commandBox = {}

commandBox = {
  rm: function (command, secret) {
    return new Promise(function (resolve, reject) {
      const flag = command.split(' ')[1]
      let directoryName = null
      let options = {}
      if (flag[0] === '-') {
        if (flag === '-r') {
          directoryName = command.split(' ')[2]
          options = { recursive: true }
        } else {
          reject(new Error('invalid flags, please try again'))
        }
      } else directoryName = command.split(' ')[1]
      fs.rmdir(`/home/onbit-syn/data/${secret}/${directoryName}`, options)
        .then(function () {
          resolve('sucessfull: directory deleted.')
        })
        .catch(function (err) {
          if (err.code === 'EINVAL') reject(new Error('invalid arguments'))
          if (err.code === 'ENOENT') reject(new Error('no such file or directory'))
          if (err.code === 'EACESS') reject(new Error('permission deniad'))
          if (err.code === 'ENOTEMPTY') reject(new Error('directory not empty'))
        })
    })
  },

  mkdir: function (command, secret) {
    return new Promise(function (resolve, reject) {
      const directoryName = command.split(' ')[1]
      fs.mkdir(`/home/onbit-syn/data/${secret}/${directoryName}`)
        .then(function () {
          resolve('sucessfull: directory Creation.')
        })
        .catch(function (err) {
          if (err.code === 'EINVAL') reject(new Error('invalid arguments'))
          // if (err.code === 'ENOENT') reject(new Error('no such file or directory'))
          if (err.code === 'EACESS') reject(new Error('permission deniad'))
          // if (err.code === 'ENOTEMPTY') reject(new Error('directory not empty'))
        })
    })
  },
  move: function (command, secret) { // can also be used to rename files.
    return new Promise(function (resolve, reject) {
      const sourceDirectory = command.split(' ')[1]
      const destinationDirectory = command.split(' ')[2]
      const fullSource = `/home/onbit-syn/data/${secret}/${sourceDirectory}`
      const fullDest = `/home/onbit-syn/data/${secret}/${destinationDirectory}`
      fs.rename(fullSource, fullDest)
        .then(function () {
          resolve('sucessfull: directory move.')
        })
        .catch(function (err) {
          if (err.code === 'EINVAL') reject(new Error('invalid arguments'))
          if (err.code === 'ENOENT') reject(new Error('no such file or directory'))
          if (err.code === 'EACESS') reject(new Error('permission deniad'))
          // if (err.code === 'ENOTEMPTY') reject(new Error('directory not empty'))
        })
    })
  },
  copy: function (command, secret) {
    return new Promise(function (resolve, reject) {
      const sourceFile = command.split(' ')[1]
      const destinationFile = command.split(' ')[2]
      const fullSource = `/home/onbit-syn/data/${secret}/${sourceFile}`
      const fullDest = `/home/onbit-syn/data/${secret}/${destinationFile}`
      fs.copyFile(fullSource, fullDest)
        .then(function () {
          resolve('sucessfull: directory copy.')
        })
        .catch(function (err) {
          if (err.code === 'EINVAL') reject(new Error('invalid arguments'))
          // if (err.code === 'ENOENT') reject(new Error('no such file or directory'))
          if (err.code === 'EACESS') reject(new Error('permission deniad'))
          // if (err.code === 'ENOTEMPTY') reject(new Error('directory not empty'))
        })
    })
  }
}

function testRm () {
  const cmnd = 'rm -r acd'
  commandBox[cmnd.split(' ')[0]](cmnd, 'test')
    .then(function (result) {
      console.log(result)
    })
    .catch(function (result) {
      console.log(result)
    })
}

function testMkdir () {
  const cmnd = 'mkdir hello'
  commandBox[cmnd.split(' ')[0]](cmnd, 'test')
    .then(function (result) {
      console.log(result)
    })
    .catch(function (result) {
      console.log(result)
    })
}
testRm()
testMkdir()
