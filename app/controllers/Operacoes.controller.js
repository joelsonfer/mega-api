const {getConnection} = require('../database/Oracle.database');

async function listarOperacoes(req, res) {
    const {page = 1, limit = 10} = req.query;
    const offset = (page - 1) * limit;
    let connection;

    try {
        let where = '';
        const binds = {offset: offset + 1, limit: offset + parseInt(limit)};
        const sql = `
            SELECT id, descricao
            FROM (select APL_IN_CODIGO as id,
                         APL_ST_NOME as descricao,
                         ROWNUM           as sequencia
                  from TRF_APLICACAO
                  ORDER BY APL_IN_CODIGO)
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
        console.error('Erro ao listar operações:', err);
        res.status(500).json({erro: 'Erro ao consultar operações'});
    } finally {
        if (connection) await connection.close();
    }
}

module.exports = {listarOperacoes};
