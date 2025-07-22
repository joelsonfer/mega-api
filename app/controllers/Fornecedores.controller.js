const {getConnection} = require('../database/Oracle.database');

async function listarFornecedores(req, res) {
    const {page = 1, limit = 10, dataAlteracao: dataAlteracao, cnpj: cnpj} = req.query;
    const offset = (page - 1) * limit;
    let connection;

    try {
        let where = '';
        const binds = {offset: offset + 1, limit: offset + parseInt(limit)};
        if (dataAlteracao) {
            where += ' AND agente.AGN_DT_ULTIMAATUCAD >= TO_TIMESTAMP(:dataAlteracao, \'YYYY-MM-DD HH24:MI:SS\')';
            binds.dataAlteracao = dataAlteracao;
        }
        if (cnpj) {
            where += ' AND REPLACE(REPLACE(REPLACE(agente.AGN_ST_CGC, \'.\', \'\'), \'/\', \'\'), \'-\', \'\') = :cnpj';
            binds.cnpj = cnpj;
        }
        const sql = `
            SELECT id, codigo, nome, nome_fantasia, cnpj, email
            FROM (select agente.AGN_PAD_IN_CODIGO || '-' || agente.AGN_IN_CODIGO as codigo,
                         agente.AGN_IN_CODIGO                                    as id,
                         AGN_ST_NOME                                             as nome,
                         AGN_ST_FANTASIA                                         as nome_fantasia,
                         AGN_ST_CGC                                              as cnpj,
                         AGN_ST_EMAIL                                            as email,
                         (SELECT LISTAGG(TEA_ST_TELEFONE, ';') WITHIN
                  GROUP (ORDER BY TEA_ST_TELEFONE) AS telefones
                  FROM (SELECT TEA_ST_TELEFONE
                      FROM GLO_TEL_AGENTES
                      WHERE AGN_IN_CODIGO = agente.AGN_IN_CODIGO)) as telefones,
                 ROWNUM sequencia from mega.glo_agentes agente
        join mega.GLO_FORNECEDOR f
            on f.AGN_IN_CODIGO = agente.AGN_IN_CODIGO
            where AGN_CH_TIPOPESSOAFJ = 'J' ${where}
            ORDER BY agente.AGN_PAD_IN_CODIGO, agente.AGN_IN_CODIGO
                )
            WHERE sequencia BETWEEN :offset AND :limit
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
        console.error('Erro ao listar fornecedores:', err);
        res.status(500).json({erro: 'Erro ao consultar fornecedores'});
    } finally {
        if (connection) await connection.close();
    }
}

module.exports = {listarFornecedores};
