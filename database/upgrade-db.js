'use strict';
/*
 *   node upgrade-db.js [--force]
 *
 * Run SQL scripts against database specified by ADMIN_DATABASE_URL, with user
 * credential who has table creation privileges. Hash of each SQL file is checked
 * before actually executes the file, and afterward the file's hash is recorded
 * in 'db_upgrade' table.
 *
 * [IMPORTANT] Because node-postgres package does not seem to support anonymous code
 * block(e.g. DO $$ ...), 'create_types.sql' is not handled here, and one must run
 * manually. If postgres supports "CREATE TYPE IF NOT EXISTS ..." syntax, we don't
 * need to run "CREATE TYPE" statements in anonymous code block and 'create_types.sql'
 * can be added to 'SQL_FILES'
*/
const appRoot = require('app-root-path');
const { Client } = require('pg');
const Promise = require('bluebird');
const fs = require('fs');
const url = require('url');
const md5File = require('md5-file');
require('dotenv').config();

// IMPORTANT. order of SQL files matter.
const SQL_FILES = ['database/create_tables.sql', 'database/update_tables.sql'];

/*
 * @param {string} DB connection URL
 * @returns {Object} - client object
 */
function getClient(dbUrl) {
  // parse DB URL
  const params = url.parse(dbUrl, true);
  const auth = params.auth.split(':');

  return new Client({
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: params.query.ssl
  });
}

/*
 * @param {Object} Postgres client instance
 * @param {string} sql file name
 * @returns {string} hash value of last run
 */
async function getLastRunHash(client, filepath) {
  let lastRunHash = null;
  const queryCmd = `SELECT last_hash FROM db_upgrade WHERE filepath='${filepath}'`;
  try {
    let result = await client.query(queryCmd);
    if (result.rows.length > 0) {
      lastRunHash = result.rows[0].last_hash;
    }
  } catch (error) {
    if (error.code !== '42P01') {
      console.error(`Error while executing '${queryCmd}'`);
      console.error(JSON.stringify(error, null, 4));
    }
  }
  return lastRunHash;
}

/*
 * @param {Object} Postgres client instance
 * @param {string} sql file name
 */
async function setLastRunHash(client, filepath) {
  const fileHash = md5File.sync(appRoot + '/' + filepath);
  const insertQuery = {
    text: 'INSERT INTO db_upgrade AS db_up (filepath, last_hash) VALUES($1, $2) ON CONFLICT (filepath) DO UPDATE SET last_hash = $2, last_run_time = DEFAULT WHERE db_up.filepath = $1',
    values: [filepath, fileHash]
  };
  await client.query(insertQuery);
}

/*
 * @param {string} sql file name
 * @returns {string[]} statements in the file
 */
function getQueryStatementsFromFile(filepath) {
  // Extract SQL queries from file.
  return fs.readFileSync(appRoot + '/' + filepath).toString()
    .replace(/^--.*$/gm, '')  // remove comment
    .replace(/(\r\n|\n|\r)/gm, ' ') // remove newlines
    .replace(/\s+/g, ' ') // excess white space
    .split(';') // split into all statements
    .map(Function.prototype.call, String.prototype.trim)
    .filter(function(el) { return el.length !== 0; }); // remove any empty ones
}

/*
 * @param {Object} Postgres client instance
 * @param {string} SQL file name
 * @param {boolean} Flag to skip last run check.
 * @returns {integer} 0 if successful, -1 otherwise.
 */
async function executeSqlFile(client, filepath, force) {
  try {
    // check if execution is necessary
    if (!force) {
      const fileHash = md5File.sync(appRoot + '/' + filepath);
      const lastRunHash = await getLastRunHash(client, filepath);
      if (fileHash === lastRunHash) {
        console.debug(`Skipping ${filepath} because its hash value(${fileHash}) matches.`);
        return 0;    // the file has not changed since last run
      }
    }

    // execute commands in the file in a transaction.
    const sqlCmds = getQueryStatementsFromFile(filepath);
    console.log(`Executing ${filepath}...`);
    try {
      await client.query('BEGIN');
      await Promise.mapSeries(sqlCmds, async (cmd) => {
        try {
          if (process.env.DEBUG) {
            console.log(`Running ${cmd.slice(0, 120)}...`);
          }
          await client.query(cmd);
        } catch (error) {
          console.error(`Error while running ${cmd.slice(0, 120)}...`);
          throw error;
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      await client.query('COMMIT');
    }
    // finally record file hash value
    await setLastRunHash(client, filepath);
    console.log('Done');
  } catch (error) {
    console.error(`Error while executing ${filepath}`);
    console.error(error.stack);
    console.error(JSON.stringify(error, null, 4));
    return -1;
  }
  return 0;
}

// main function
(async () => {
  // check environment variables
  const DB_URL = process.env.ADMIN_DATABASE_URL || process.env.DATABASE_URL;
  if (!DB_URL) {
    console.error('ADMIN_DATABASE_URL nor DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  // check command line arguments
  let forceFlag = false;
  if (process.argv.length > 2 && process.argv[2] === '--force') {
    forceFlag = true;
  }

  const client = getClient(DB_URL);
  client.connect();
  try {
    await Promise.mapSeries(SQL_FILES, async filepath => {
      let result = await executeSqlFile(client, filepath, forceFlag);
      if (result !== 0) {
        process.exit(-1);
      }
    });
  } finally {
    client.end();
  }
  process.exit(0);
})();
