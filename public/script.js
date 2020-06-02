var term = new Terminal({cursorBlink:true});

var session ={
    current_command : "",
    history : [],
    historyLength : 0,
    prefix : "",
    directory: "~$ ",
    lock:false

};

term.open(document.getElementById('terminal'));
term.write(session.prefix + session.directory);


term.attachCustomKeyEventHandler(function(event){
    event.stopPropagation();
    if(event.type === "keydown" && !session.lock) {
        if(event.code==='Enter') {
            if(session.prefix === ""){
                //send request to server for authentication....
                term.write("\r\n" + "opening team drive kindly wait...");
                session.lock = true;
                fetch('/openTeamDrive',{
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ teamName: session.current_command.split(' ')[3]})
                    }
                )
                .then(function(response){
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' + response.status);
                    return;
                    }

                    response.json().then(function(data){
                        session.prefix = data.result;
                        term.write("\r\n" + session.prefix + session.directory);
                        session.lock = false;
                    })
                    .catch(function(err){
                        console.log("oops some error while parsing the response", err);
                        session.lock = false;
                    })
                })
                .catch(function (err) {
                    console.log('Fetch Error :-S', err);
                    session.lock = false;
                })
            }
            else{
                //fetch the result of the desired command..
                term.write("\r\n" + "Running the command...");
                session.lock = true;
                setTimeout(function(){
                    term.write("\r\n"+"drwxr-xr-x  3 onbit-syn onbit-syn 4096 Jun  1 23:45");
                    term.write("\r\n" + session.prefix + session.directory);
                    session.lock = false;
                },2000);
            }
        }
        else if(event.code === 'ControlLeft' || event.code==='ControlRight' || event.code==='ShiftLeft' || event.code==='ShiftRight' || event.code==='AltLeft' || event.code === 'AltRight' || event.code==='Tab');
        else if(event.code === 'ArrowLeft'){
            term.write('\b');   
        }
        else if(event.code === 'ArrowRight'){
            term.write('\t');
        }
        else if(event.code === 'ArrowUp') {
            
        }
        else if(event.code === 'Backspace') {
            session.current_command = session.current_command.substring(0,session.current_command.length-1);
            term.write('\b \b');
        }
        else {
            session.current_command += event.key;
            term.write(event.key);
        }   
    }
})
