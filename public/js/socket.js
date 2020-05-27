let teamNames  = document.querySelectorAll('.teamNames')

teamNames.forEach((team)=>{
    team.addEventListener("onclick",function(team){
        console.log(team);
    },false);
})