var term = new Terminal();
var config = {
    history : [],
    prefix : '$',
    historyLength : 0,
    current_command : ""
};

term.open(document.getElementById('terminal'));
term.write(config.prefix);


term.attachCustomKeyEventHandler(function(event){
    console.log(event);
    if(event.type === "keydown") {
        if(event.code==='Enter') {
            config.history.push(config.current_command);
            config.historyLength++;
            config.current_command = "";
            term.write(prefix+"\r\n");
        }
        else if(event.code === 'ControlLeft' || event.code==='ControlRight' || event.code==='ShiftLeft' || event.code==='ShiftRight' || event.code==='AltLeft' || event.code === 'AltRight' || event.code==='Tab');
        else if(event.code === 'ArrowLeft'){
            term.write('\b');   
        }
        else if(event.code === 'ArrowRight'){
            term.write('\t');
        }
        else if(event.code === 'ArrowUp') {
            let x = config.historyLength-1;
            for(let i=0;i<config.current_command.length + config.prefix.length;i++) {
                term.write('\b \b');
            }
            for(let i=x;i>=0;i--){
                term.write(config.prefix + config.history[i]);
            }
        }
        else if(event.code === 'Backspace') {
            config.current_command = config.current_command.splice(0,config.current_command.length-1);
            term.write('\b \b');
        }
        else {
            config.current_command += key;
            term.write(event.key);
        }   
    }
})