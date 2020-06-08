import errorHandler = require("errorhandler")
import http = require("http");
import app from "./app";
app.use(errorHandler());

/**
 * Start Express server.
 */

const server = http.createServer(app);

console.log(`Server started at https://localhost:${app.get("port")}/`);

server.listen(app.get("port"));

export default server;
