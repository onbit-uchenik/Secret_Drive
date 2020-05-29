const username = $("h1").text().split(' ')[1];

let socket = io();

socket.on('welcome',function() {
    console.log("connected " + socket.id);
    socket.emit('register',username);
})

socket.on('notification',function(notifications){
    console.log(notifications);
})



