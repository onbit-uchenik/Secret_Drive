const util = require('util');
const execFile = util.promisify(require('child_process').execFile);


async function run(path,args) {
	 try{
		const {stdout,stderr} = await execFile(path,args);
		return {
				stdout : stdout,
				stderr : stderr
			}; 
		} catch(err) {
			throw new Error(`THE CHILD PROCESS CRASHED!!\nWhile running child process ${path} an error is encountered.Child process exited with error code => ${err.code} and termination signal => ${err.signal}`);
			
		}
}

module.exports.run = run;
