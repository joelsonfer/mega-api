const {getConnection} = require('../database/Oracle.database');


function montarFiltroSolicitacoes(queryParams) {
    const whereClauses = [];
    const binds = {};

    const {
        dataAlteracao,
        aprovado,
        id,
        numero,
        filial
    } = queryParams;

    if (dataAlteracao) {
        whereClauses.push('sc.SOL_DT_EMISSAO >= TO_TIMESTAMP(:dataAlteracao, \'YYYY-MM-DD HH24:MI:SS\')');
        binds.dataAlteracao = dataAlteracao;
    }

    if (aprovado !== undefined) {
        whereClauses.push('sc.SOL_BO_APROVAAPPROVO = :aprovado');
        binds.aprovado = aprovado === 'true' || aprovado === 'S' ? 'S' : 'N';
    }

    if (id) {
        whereClauses.push('sc.SOL_IN_CODIGO = :id');
        binds.id = id;
    }

    if (numero) {
        whereClauses.push('sc.SOL_IN_NUMRM = :numero');
        binds.numero = numero;
    }

    if (filial) {
        whereClauses.push('sc.FIL_IN_CODIGO = :filial');
        binds.filial = filial;
    }

    if (whereClauses.length === 0) {
        return {
            where: '',
            binds
        }
    }

    return {
        where: `where ${whereClauses.join(' AND ')}`,
        binds
    };
}

async function buscarSolicitacaoPorId(req, res) {
    const {filial, numero} = req.params;
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
            where SOL_IN_CODIGO = :numero
              and FIL_IN_CODIGO = :filial
        `;

        connection = await getConnection();
        const result = await connection.execute(sql, {numero, filial});
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
    const {
        page = 1,
        limit = 10,
    } = req.query;
    const offset = (page - 1) * limit;
    const { where, binds } = montarFiltroSolicitacoes(req.query);
    binds.offset = offset + 1;
    binds.limit = offset + limit;
    let connection;
    try {
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
                  ${where}
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


async function atualizarSolicitacao(req, res) {
    const {SOL_IN_CODIGO, FIL_IN_CODIGO, SOL_IN_NUMRM, Itens} = req.body;
    let connection;

    try {
        const sql = `
            select ORG_TAB_IN_CODIGO,
                   ORG_PAD_IN_CODIGO,
                   ORG_IN_CODIGO,
                   ORG_TAU_ST_CODIGO,
                   SER_TAB_IN_CODIGO,
                   SER_IN_SEQUENCIA,
                   SOL_IN_CODIGO
            from EST_SOLICITACAO
            WHERE FIL_IN_CODIGO = :FIL_IN_CODIGO
              and SOL_IN_NUMRM = :SOL_IN_NUMRM
              and SOL_IN_CODIGO = :SOL_IN_CODIGO
        `;
        const itemSql = `
            UPDATE EST_ITENSSOLI it
            SET SOI_CH_STATUS    = :SOI_CH_STATUS,
                SOI_CH_STATUSNEC = :SOI_CH_STATUSNEC
            WHERE it.ORG_TAB_IN_CODIGO = :ORG_TAB_IN_CODIGO
              AND it.ORG_PAD_IN_CODIGO = :ORG_PAD_IN_CODIGO
              AND it.ORG_IN_CODIGO = :ORG_IN_CODIGO
              AND it.ORG_TAU_ST_CODIGO = :ORG_TAU_ST_CODIGO
              AND it.SER_TAB_IN_CODIGO = :SER_TAB_IN_CODIGO
              AND it.SER_IN_SEQUENCIA = :SER_IN_SEQUENCIA
              AND it.SOL_IN_CODIGO = :SOL_IN_CODIGO
              AND it.SOI_IN_CODIGO = :SOI_IN_CODIGO
        `;
        connection = await getConnection();
        const result = await connection.execute(sql, {FIL_IN_CODIGO, SOL_IN_NUMRM, SOL_IN_CODIGO});
        if (result.rows.length === 0) {
            res.status(404).json({erro: 'Solicitação não encontrada'});
            return;
        }

        for (const item of Itens) {
            await connection.execute(itemSql, {
                ...item,
                SOL_IN_CODIGO: result.rows[0].SOL_IN_CODIGO,
                ORG_TAB_IN_CODIGO: result.rows[0].ORG_TAB_IN_CODIGO,
                ORG_PAD_IN_CODIGO: result.rows[0].ORG_PAD_IN_CODIGO,
                ORG_IN_CODIGO: result.rows[0].ORG_IN_CODIGO,
                ORG_TAU_ST_CODIGO: result.rows[0].ORG_TAU_ST_CODIGO,
                SER_TAB_IN_CODIGO: result.rows[0].SER_TAB_IN_CODIGO,
                SER_IN_SEQUENCIA: result.rows[0].SER_IN_SEQUENCIA
            });
        }
        await connection.commit();
        res.status(200).json({message: 'Solicitação atualizada com sucesso'});

    } catch (err) {
        console.error('Erro ao atualizar solicitação:', err);
        res.status(500).json({erro: 'Erro ao atualizar solicitação'});
    } finally {
        if (connection) await connection.close();
    }
}

async function carregarItens(row, connection) {
    const itemSql = `
        SELECT it.SOL_IN_CODIGO                     as id,
               it.SOI_IN_CODIGO                     as numero,
               it.UNI_ST_UNIDADE                    as unidade,
               it.COS_IN_CODIGO                     as servico,
               it.PRO_IN_CODIGO                     as produto,
               produto.PRO_ST_DESCRICAO             as nome_produto,
               produto.GRU_IN_CODIGO                as codigo_grupo,
               it.SOI_DT_NECESSIDADE                as dt_necessidade,
               it.SOI_RE_QUANTIDADESOL              as quantidade,
               it.SOI_ST_ESPECIFICACAO              as especificacao,
               it.SOI_ST_MOTIVOSOLICITACAO          as motivo_solicitacao,
               it.APL_IN_CODIGO                     as operacao,
               it.TPC_ST_CLASSE                     as tipo_classe,
               user_solicitante.GRU_IN_CODIGO       as codigo_solicitante,
               user_solicitante.GRU_ST_NOMECOMPLETO as nome_complento_solicitante,
               user_solicitante.GRU_ST_NOME         as nome_solicitante,
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
                   END                              as status,
               CASE it.SOI_CH_STATUSNEC
                   WHEN 'A' THEN 'A_COTAR'
                   WHEN 'C' THEN 'EM_COTACAO'
                   WHEN 'P' THEN 'PEDIDO'
                   WHEN 'E' THEN 'EMPREITEIROS'
                   WHEN 'N' THEN 'BAIXADA'
                   ELSE 'DESCONHECIDO'
                   END                              as status_necessidade
        FROM EST_ITENSSOLI it
                 left join GLO_GRUPO_USUARIO user_solicitante on it.USU_IN_SOLICITANTE = user_solicitante.GRU_IN_CODIGO
                 left join EST_PRODUTOS produto on produto.PRO_TAB_IN_CODIGO = it.PRO_TAB_IN_CODIGO
            and produto.PRO_PAD_IN_CODIGO = it.PRO_PAD_IN_CODIGO
            and produto.PRO_IN_CODIGO = it.PRO_IN_CODIGO
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

module.exports = {listarSolicitacoes, buscarSolicitacaoPorId, atualizarSolicitacao};
