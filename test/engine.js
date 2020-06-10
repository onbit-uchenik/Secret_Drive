"use strict";
exports.__esModule = true;
var addon = require("../build/Release/addon.node");
console.log("adding team1 for construction", addon.addTeam("team1", 2, 2, "construction"));
console.log("adding member ab in team1 for construction", addon.addMember("team1", "ab", "construction"));
console.log("adding member cd in team1 for construction", addon.addMember("team1", "cd", "construction"));
