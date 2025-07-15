const oracledb = require('oracledb');
const dbConfig = require('../config/db.conf');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.initOracleClient({libDir: dbConfig.libDir});
oracledb.fetchAsBuffer = [ oracledb.BLOB ];

async function getConnection() {
    try {
        return await oracledb.getConnection(dbConfig);
    } catch (err) {
        console.error('Erro ao conectar ao banco:', err);
        throw err;
    }
}

module.exports = { getConnection };
