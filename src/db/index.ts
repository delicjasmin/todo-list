import { drizzle } from 'drizzle-orm/mysql2';
import mysql from "mysql2"

export const poolConnection = mysql.createPool({
  "host": "127.0.0.1",
  "port": 3306,
  "database": "jaskich",
  "user": "root",
  "password": "2580"
})

export const db = drizzle(poolConnection);