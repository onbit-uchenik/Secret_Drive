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
  }
}

function test () {
  const cmnd = 'rm -r acd'
  commandBox[cmnd.split(' ')[0]](cmnd, 'test')
    .then(function (result) {
      console.log(result)
    })
    .catch(function (err) {
      console.log(err)
    })
}
test()
