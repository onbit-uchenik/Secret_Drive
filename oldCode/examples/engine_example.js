const addon = require('../build/Release/addon.node');


function check() {
    addon.addTeam("codegeeks",4,3,false);
    console.log(addon.addMember("codegeeks","anubhav",false));
    console.log(addon.addMember("magicians","anubhav",false));
    console.log(addon.addMember("codegeeks","raghav",true));

}
check();



function example() {
    addon.addTeam("codegeeks",4,3,false);  //for construction of shares type = false;
    addon.addTeam("magicians",4,3,true); //for reconstruction of shares type = true
    addon.addTeam("coders",2,1,false);  //for construction of shares type  = true;
    console.log(addon.addMember("codegeeks","anubhav",false));
    console.log(addon.addMember("codegeeks","anubhav",false));
    console.log(addon.addMember("codegeeks","anubhav",false));
    console.log(addon.addMember("codegeeks","anubhav",false));
    console.log(addon.addMember("codegeeks","anubhav",false));
    console.log(addon.addMember("codegeeks","anubhav",false));
    console.log(addon.addMember("codegeeks","bhairav",false));
    console.log(addon.addMember("codegeeks","bhairav",false));
    console.log(addon.addMember("codegeeks","bhairav",false));
    console.log(addon.addMember("codegeeks","rajat",false));
    console.log(addon.addMember("codegeeks","damru",false));
    console.log(addon.addMember("coders","damru",false));
    console.log(addon.addMember("coders","rajat",false));
    console.log(addon.addMember("coders","eihk",false));
    console.log(addon.addMember("magicians","anubhava",true));
    console.log(addon.addMember("magicians","anubhava",true));
    console.log(addon.addMember("magicians","anubhava",true));
    console.log(addon.addMember("magicians","anubhava",true));
    console.log(addon.addMember("magicians","anubhava",true));
    console.log(addon.addMember("magicians","anubhava",true));
    console.log(addon.addMember("magicians","bhairava",true));
    console.log(addon.addMember("magicians","bhairava",true));
    console.log(addon.addMember("magicians","bhairava",true));
    console.log(addon.addMember("magicians","rajata",true));
   
}

//example();
  