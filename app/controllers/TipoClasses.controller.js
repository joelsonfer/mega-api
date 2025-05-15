const {getConnection} = require('../database/Oracle.database');

async function listarTiposClasses(req, res) {
    const {page = 1, limit = 10} = req.query;
    const offset = (page - 1) * limit;
    let connection;

    try {
        let where = '';
        const binds = {offset: offset + 1, limit: offset + parseInt(limit)};
        const sql = `
            SELECT id, descricao
            FROM (select TPC_ST_CLASSE    as id,
                         TPC_ST_DESCRICAO as descricao,
                         ROWNUM           as sequencia
                  from EST_TIPOCLASSES
                  ORDER BY TPC_ST_CLASSE)
            WHERE sequencia BETWEEN :
            offset AND :limit
        `;

        connection = await getConnection();
        const result = await connection.execute(sql, binds);

        res.json({
            page: parseInt(page),
            limit: parseInt(limit),
            total: result.rows.length,
            data: result.rows
        });

    } catch (err) {
        console.error('Erro ao listar tipos de classes:', err);
        res.status(500).json({erro: 'Erro ao consultar tipos de classes'});
    } finally {
        if (connection) await connection.close();
    }
}

module.exports = {listarTiposClasses};
