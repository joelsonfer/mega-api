const {getConnection} = require('../database/Oracle.database');

async function buscarSolicitacaoPorId(req, res) {
    const {numero} = req.params;
    let connection;

    try {
        const sql = `
select SOL_IN_CODIGO           as id,
   SOL_IN_NUMRM            as numero,
   FIL_IN_CODIGO           as filial,
   SOL_DT_EMISSAO          as emissao,
   CCF_IN_REDUZIDO         as centro_custo,
   PROJ_IN_REDUZIDO        as projeto,
   SOL_DT_NECESSIDADE      as dt_necessidade,
   origem.SOL_CH_ORIGEM    as codigo_origem,
   origem.INT_ST_DESCRICAO as descricao_origem,
   SOL_BO_APROVAAPPROVO    as aprovado,
   sc.ORG_TAB_IN_CODIGO,
   sc.ORG_PAD_IN_CODIGO,
   sc.ORG_IN_CODIGO,
   sc.ORG_TAU_ST_CODIGO,
   sc.SER_TAB_IN_CODIGO,
   sc.SER_IN_SEQUENCIA,
   sc.SOL_IN_CODIGO
from EST_SOLICITACAO sc
     left join EST_INTEGRASOLIC origem on sc.SOL_CH_ORIGEM = origem.SOL_CH_ORIGEM
            where SOL_IN_NUMRM = :numero
        `;

        connection = await getConnection();
        const result = await connection.execute(sql, {numero});
        for (const row of result.rows) {
            await carregarItens(row, connection);
        }

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({erro: 'Solicitação não encontrada'});
        }

    } catch (err) {
        console.error('Erro ao buscar solicitação:', err);
        res.status(500).json({erro: 'Erro ao consultar solicitação'});
    } finally {
        if (connection) await connection.close();
    }
}

async function listarSolicitacoes(req, res) {
    const {page = 1, limit = 10, dataAlteracao: dataAlteracao, aprovado: aprovado} = req.query;
    const offset = (page - 1) * limit;
    let connection;

    try {
        let where = '';
        const binds = {offset: offset + 1, limit: offset + parseInt(limit)};
        if (dataAlteracao) {
            where += 'and sc.SOL_DT_EMISSAO >= TO_TIMESTAMP(:dataAlteracao, \'YYYY-MM-DD HH24:MI:SS\')';
            binds.dataAlteracao = dataAlteracao;
        }
        if (aprovado) {
            where += 'and sc.SOL_BO_APROVAAPPROVO = :aprovado';
            binds.aprovado = aprovado ? "S" : "N";
        }
        const sql = `
            SELECT *
            FROM (select SOL_IN_CODIGO           as id,
                         SOL_IN_NUMRM            as numero,
                         FIL_IN_CODIGO           as filial,
                         SOL_DT_EMISSAO          as emissao,
                         CCF_IN_REDUZIDO         as centro_custo,
                         PROJ_IN_REDUZIDO        as projeto,
                         SOL_DT_NECESSIDADE      as dt_necessidade,
                         origem.SOL_CH_ORIGEM    as codigo_origem,
                         origem.INT_ST_DESCRICAO as descricao_origem,
                         SOL_BO_APROVAAPPROVO    as aprovado,
                         sc.ORG_TAB_IN_CODIGO,
                         sc.ORG_PAD_IN_CODIGO,
                         sc.ORG_IN_CODIGO,
                         sc.ORG_TAU_ST_CODIGO,
                         sc.SER_TAB_IN_CODIGO,
                         sc.SER_IN_SEQUENCIA,
                         sc.SOL_IN_CODIGO,
                         ROWNUM                     sequencia
                  from EST_SOLICITACAO sc
                           left join EST_INTEGRASOLIC origem on sc.SOL_CH_ORIGEM = origem.SOL_CH_ORIGEM
                      where 1=1  ${where}
                  order by numero)
            WHERE sequencia BETWEEN :offset AND :limit
        `;

        connection = await getConnection();
        const result = await connection.execute(sql, binds);
        for (const row of result.rows) {
            await carregarItens(row, connection);
        }

        res.json({
            page: parseInt(page),
            limit: parseInt(limit),
            total: result.rows.length,
            data: result.rows
        });

    } catch (err) {
        console.error('Erro ao listar solicitações:', err);
        res.status(500).json({erro: 'Erro ao consultar solicitações'});
    } finally {
        if (connection) await connection.close();
    }
}

async function carregarItens(row, connection) {
    const itemSql = `
        SELECT it.SOL_IN_CODIGO            as id,
               it.SOI_IN_CODIGO            as numero,
               it.UNI_ST_UNIDADE           as unidade,
               it.COS_IN_CODIGO            as servico,
               it.PRO_IN_CODIGO            as produto,
               it.SOI_DT_NECESSIDADE       as dt_necessidade,
               it.SOI_RE_QUANTIDADESOL     as quantidade,
               it.SOI_ST_ESPECIFICACAO     as especificacao,
               it.SOI_ST_MOTIVOSOLICITACAO as motivo_solicitacao,
               it.APL_IN_CODIGO            as operacao,
               it.TPC_ST_CLASSE            as tipo_classe,
               CASE it.SOI_CH_STATUS
                   WHEN 'T' THEN 'APROVAÇÃO_TECNICA'
                   WHEN 'E' THEN 'APROVAÇÃO_ESTOQUE'
                   WHEN 'L' THEN 'APROVAÇÃO_PRE_COTACAO'
                   WHEN 'O' THEN 'APROVAÇÃO_ORCAMENTARIA'
                   WHEN 'C' THEN 'CANCELADA'
                   WHEN 'P' THEN 'PENDENTE'
                   WHEN 'A' THEN 'ABERTO'
                   WHEN 'B' THEN 'BAIXADA'
                   ELSE 'DESCONHECIDO'
                   END                     as status,
               CASE it.SOI_CH_STATUSNEC
                   WHEN 'A' THEN 'A_COTAR'
                   WHEN 'C' THEN 'EM_COTACAO'
                   WHEN 'P' THEN 'PEDIDO'
                   WHEN 'E' THEN 'EMPREITEIROS'
                   WHEN 'N' THEN 'BAIXADA'
                   ELSE 'DESCONHECIDO'
                   END                     as status_necessidade
        FROM EST_ITENSSOLI it
        WHERE it.ORG_TAB_IN_CODIGO = :ORG_TAB_IN_CODIGO
          AND it.ORG_PAD_IN_CODIGO = :ORG_PAD_IN_CODIGO
          AND it.ORG_IN_CODIGO = :ORG_IN_CODIGO
          AND it.ORG_TAU_ST_CODIGO = :ORG_TAU_ST_CODIGO
          AND it.SER_TAB_IN_CODIGO = :SER_TAB_IN_CODIGO
          AND it.SER_IN_SEQUENCIA = :SER_IN_SEQUENCIA
          AND it.SOL_IN_CODIGO = :SOL_IN_CODIGO
    `;

    const itemBinds = {
        ORG_TAB_IN_CODIGO: row.ORG_TAB_IN_CODIGO,
        ORG_PAD_IN_CODIGO: row.ORG_PAD_IN_CODIGO,
        ORG_IN_CODIGO: row.ORG_IN_CODIGO,
        ORG_TAU_ST_CODIGO: row.ORG_TAU_ST_CODIGO,
        SER_TAB_IN_CODIGO: row.SER_TAB_IN_CODIGO,
        SER_IN_SEQUENCIA: row.SER_IN_SEQUENCIA,
        SOL_IN_CODIGO: row.SOL_IN_CODIGO
    };

    const itemResult = await connection.execute(itemSql, itemBinds);
    row.ITEMS = itemResult.rows;
}

module.exports = {listarSolicitacoes, buscarSolicitacaoPorId};
