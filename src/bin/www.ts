import app from "../app";
import http  = require("http");
import dotenv = require("dotenv");
import debugLib = require("debug");
const debug = debugLib("shamir-team-drive:server");


dotenv.config();


function normalizePort(val:string): number {
  const port = parseInt(val, 10);
  return port;
}

function onError(err: any):void {
  switch (err.code) {
    case "EACCES":
      console.error(port + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(port + " is already in use");
      process.exit(1);
      break;
    default:
      throw err;
  }
}

function onListening() {
  const addr = server.address();
  debug("server is listening at", addr);
}

const port = normalizePort(process.env.PORT || "8888");

app.set("port", port);

const server = http.createServer(app);

server.on("error", onError);
server.on("listening", onListening);
