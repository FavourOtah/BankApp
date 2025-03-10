import dotenv from "dotenv";
import pkg from "pg"


dotenv.config()
const { Pool } = pkg;


// The pg library is CommonJS-based, 
// so if you're using "type": "module" in your
//  package.json, a direct import { Pool } from 'pg'; 
//  might throw an error. Using the import pkg from 'pg';
//   workaround is a safe way to import CommonJS packages.

const pool = new Pool({
    user: "postgres",
    password: "Favourchiotah1!",
    host: "localhost",
    port: 5432,
    database: "bankdb"
});



export { pool };
