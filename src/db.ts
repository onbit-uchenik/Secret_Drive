import pg = require("pg");

const dbConfig = {
  user: process.env.SQL_DB_USER,
  password: process.env.SQL_DB_PASSWORD,
  database: process.env.SQL_DB_DBNAME,
  host: process.env.SQL_DB_HOST,
  port: parseInt(process.env.SQL_DB_PORT, 10),
  max: parseInt(process.env.SQL_MAX_POOL_CONNECTIONS),
  connectionTimeoutMillis: parseInt(process.env.SQL_CONNECTION_TIMEOUT_MILLIS, 10),
  idleTimeoutMillis: parseInt(process.env.SQL_IDEAL_TIMEOUT_MILLIS)
};

export const pool = new pg.Pool(dbConfig);

export function query(sqlcommand: string, params?: Array<unknown>): Promise<pg.QueryResult<unknown>> {

  return new Promise<pg.QueryResult<unknown>>((resolve, reject) => {
    
    pool.query(sqlcommand, params)
      
      .then(function (value: pg.QueryResult<unknown>): void {
        resolve(value);
      })
      .catch(function (err) {
        reject(err);
      
      });

  });
} 


