import pg = require("pg");
import {dbConfig} from "./env";
import { Promise } from "bluebird";

export const pool = new pg.Pool(dbConfig);

export function query(sqlcommand: string, params: Array<any>) {
  
  return new Promise<pg.QueryResult<any>>((resolve, reject) => {
    pool.query(sqlcommand,params)
    .then(function(value: pg.QueryResult<any>){
      resolve(value);
    })
    .catch(function(err){
      reject(err);
    });
    
  });
} 


