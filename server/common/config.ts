import TOML from '@ltd/j-toml';
import fs from "fs";

const buf=fs.readFileSync("config.toml")
let con=buf.toString('utf8')
con = con.replace(/\r/g, "");
const table = TOML.parse(con, 1, '\n');

interface config {
  database:{
    db_uri:string
  }
}

export default table as unknown as config