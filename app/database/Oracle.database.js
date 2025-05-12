const oracledb = require('oracledb');
const dbConfig = require('../config/db.conf');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.initOracleClient({libDir: dbConfig.libDir});

async function getConnection() {

    return await oracledb.getConnection(dbConfig);
}

module.exports = { getConnection };
