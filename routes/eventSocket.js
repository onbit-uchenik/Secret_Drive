let activeUsers = {}
let notifications = {}

module.exports = {
    emitWelcome : function(socket){
        socket.emit('welcome');
    },
    register : function(socket,name) {
        console.log(name);
        console.log(socket.id);
        activeUsers.name = socket.id;
    },
    
    inviteMembers : function(members,teamName) {
        members.forEach( (member) => {
            if(notifications[member] === undefined) {
                notifications[member] = [`You are invited to join the team ${teamName}`];
            }
            else{
                notifications[member].push(`You are invited to join the team ${teamName}`);
            }
        });
    }

    
}
