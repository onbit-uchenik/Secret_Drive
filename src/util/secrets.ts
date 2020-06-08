import logger from "./logger";
import dotenv = require("dotenv")

dotenv.config({path:".env",debug:true});

export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === "production";

export const SESSION_SECRET = process.env["SESSION_SECRET"];

export const DbConfig = {
    user: prod ? process.env["PROD_USER"] : process.env["DEV_USER"],
    password: prod ? process.env["PROD_PASSWORD"] : process.env["DEV_PASSWORD"],
    database: prod ? process.env["PROD_DATABASE"] : process.env["DEV_DATABASE"],
    host: prod ? process.env["PROD_HOST"] : process.env["DEV_HOST"],
    port: prod ? process.env["PROD_PORT"] : process.env["DEV_PORT"],
    connectionTimeoutMillis: prod ? process.env["PROD_CONNECTION_TIMEOUT_MILLIS"]: process.env["DEV_CONNECTION_TIMEOUT_MILLIS"],
    idleTimeoutMillis: prod ? process.env["PROD_IDLE_TIMEOUT_MILLIS"] : process.env["DEV_IDLE_TIMEOUT_MILLIS"],
};
console.log(SESSION_SECRET);
console.log(DbConfig);

if (!SESSION_SECRET) {
  logger.error("No client secret. Set SESSION_SECRET environment variable.");
  process.exit(1);
}

if (!DbConfig.connectionTimeoutMillis || !DbConfig.database || !DbConfig.user || !DbConfig.password || !DbConfig.idleTimeoutMillis || !DbConfig.host || !DbConfig.port) {
  logger.error("No database configuration");
  process.exit(1);
} 
