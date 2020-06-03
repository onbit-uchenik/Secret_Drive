var term = new Terminal({ cursorBlink: true });

var session = {
    current_command: "",
    history: [],
    historyLength: 0,
    prefix: "",
    directory: "~$ ",
    lock: false

};

term.open(document.getElementById('terminal'));
term.write(session.prefix + session.directory);


term.attachCustomKeyEventHandler(function (event) {
    event.stopPropagation();
    if (event.type === "keydown" && !session.lock) {
        if (event.code === 'Enter') {
            if (session.prefix === "") {
                //send request to server for authentication....
                term.write("\r\n" + "opening team drive kindly wait...");
                session.lock = true;
                check('/openTeamDrive',{ teamName: session.current_command.split(' ')[3]},function(data){
                    session.prefix = data.result;
                })
            }
            else {
                //fetch the result of the desired command..
                term.write("\r\n" + "running the command kindly wait....");
                session.lock = true;
                let teamName = session.prefix.split('@')[1];
                teamName = teamName.substring(0, teamName.length - 1);
                if (session.current_command === 'exit') {
                    check('/command/exit',{'command' : session.current_command,'teamName':teamName},function(data){
                        session.prefix = "";
                        session.directory = "~$ ";
                        term.write("\r\n" + "GoodBye...")
                    })
                }
                else {
                    check('/command',{ 'command' : session.current_command,'teamName':teamName},function(data){
                        term.write("\r\n" + data.result);
                    })
                }
            }
        }
        else if (event.code === 'ControlLeft' || event.code === 'ControlRight' || event.code === 'ShiftLeft' || event.code === 'ShiftRight' || event.code === 'AltLeft' || event.code === 'AltRight' || event.code === 'Tab');
        else if (event.code === 'ArrowLeft') {
            term.write('\b');
        }
        else if (event.code === 'ArrowRight') {
            term.write('\t');
        }
        else if (event.code === 'ArrowUp') {

        }
        else if (event.code === 'Backspace') {
            session.current_command = session.current_command.substring(0, session.current_command.length - 1);
            term.write('\b \b');
        }
        else {
            session.current_command += event.key;
            term.write(event.key);
        }
    }
})


function check(route,data,cb) {
    fetch(route, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
    )
        .then(function (response) {
            if (response.status !== 200) {
                console.log('Looks like there was a problem. Status Code: ' + response.status);
                term.write("\r\n" + session.current_command + ": either command not found or session is expired kindly login again")
                term.write("\r\n" + session.prefix + session.directory);
                session.history.push(session.current_command);
                session.current_command = "";
                session.historyLength++;
                session.lock = false;
                return;
            }

            response.json().then(function (data) {
                cb(data);
                //session.prefix = data.result;
                term.write("\r\n" + session.prefix + session.directory);
                session.history.push(session.current_command);
                session.current_command = "";
                session.historyLength++;
                session.lock = false;
            })
                .catch(function (err) {
                    console.log("oops some error while parsing the response", err);
                    session.history.push(session.current_command);
                    session.current_command = "";
                    session.historyLength++;
                    session.lock = false;
                })
        })
        .catch(function (err) {
            console.log('Fetch Error :-S', err);
            session.history.push(session.current_command);
            session.current_command = "";
            session.historyLength++;
            session.lock = false;
        })
}
