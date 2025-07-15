const {getConnection} = require('../database/Oracle.database');


function montarFiltroSolicitacoes(queryParams) {
    const whereClauses = [];
    const binds = {};

    const {
        dataAlteracao,
        aprovado,
        id,
        numero,
        filial,
        status,
        statusNecessidade
    } = queryParams;

    if (dataAlteracao) {
        whereClauses.push('IT.SOI_DT_ALTERACAO >= TO_DATE(:dataAlteracao, \'YYYY-MM-DD\')');
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

    if (status) {
        whereClauses.push('it.SOI_CH_STATUS = :status');
        binds.status = status;
    }
    if (statusNecessidade) {
        whereClauses.push('it.SOI_CH_STATUSNEC = :statusNecessidade');
        binds.statusNecessidade = statusNecessidade;
    }

    if (whereClauses.length === 0) {
        return {
            where: '',
            binds
        };
    }

    return {
        where: `where ${whereClauses.join(' AND ')}`,
        binds
    };
}

async function listarItensSolicitacoes(req, res) {
    const {
        page = 1,
        limit = 10,
    } = req.query;
    const offset = (page - 1) * limit;
    const {where, binds} = montarFiltroSolicitacoes(req.query);
    binds.offset = offset + 1;
    binds.limit = offset + limit;
    let connection;
    try {
        const sql = `
            SELECT sub.*,
                   (select count(*) 
                    from GLO_ANEXO
                    where ANX_ST_NOMETABELA = 'EST_ITENSSOLI'
                      and ANX_ST_CHAVEPK = sub.chave_anexos) anexos
            FROM (SELECT sc.SOL_IN_CODIGO                     as id,
                         sc.SOL_IN_NUMRM                      as numero,
                         sc.FIL_IN_CODIGO                     as filial,
                         sc.SOL_DT_EMISSAO                    as emissao,
                         sc.CCF_IN_REDUZIDO                   as centro_custo,
                         sc.PROJ_IN_REDUZIDO                  as projeto,
                         origem.SOL_CH_ORIGEM                 as codigo_origem,
                         origem.INT_ST_DESCRICAO              as descricao_origem,
                         sc.SOL_BO_APROVAAPPROVO              as aprovado,
                         ROWNUM                               as sequencia,
                         it.SOI_IN_CODIGO                     as numero_item,
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
                             END                              as status_necessidade,
                         it.SOI_DT_ALTERACAO                  as data_alteracao,
                         it.SOI_DT_INCLUSAO                   as data_inclusao,
                         it.ORG_TAB_IN_CODIGO || ';' || it.ORG_PAD_IN_CODIGO || ';' || it.ORG_IN_CODIGO || ';' ||
                         it.ORG_TAU_ST_CODIGO || ';' ||
                         it.SER_TAB_IN_CODIGO || ';' || it.SER_IN_SEQUENCIA || ';' || it.SOL_IN_CODIGO || ';' ||
                         it.SOI_IN_CODIGO                     AS chave_anexos
                  FROM EST_ITENSSOLI it
                           join EST_SOLICITACAO sc on it.ORG_TAB_IN_CODIGO = sc.ORG_TAB_IN_CODIGO
                      AND it.ORG_PAD_IN_CODIGO = sc.ORG_PAD_IN_CODIGO
                      AND it.ORG_IN_CODIGO = sc.ORG_IN_CODIGO
                      AND it.ORG_TAU_ST_CODIGO = sc.ORG_TAU_ST_CODIGO
                      AND it.SER_TAB_IN_CODIGO = sc.SER_TAB_IN_CODIGO
                      AND it.SER_IN_SEQUENCIA = sc.SER_IN_SEQUENCIA
                      AND it.SOL_IN_CODIGO = sc.SOL_IN_CODIGO
                           left join EST_INTEGRASOLIC origem on sc.SOL_CH_ORIGEM = origem.SOL_CH_ORIGEM
                           left join GLO_GRUPO_USUARIO user_solicitante
                                     on it.USU_IN_SOLICITANTE = user_solicitante.GRU_IN_CODIGO
                           left join EST_PRODUTOS produto on produto.PRO_TAB_IN_CODIGO = it.PRO_TAB_IN_CODIGO
                      and produto.PRO_PAD_IN_CODIGO = it.PRO_PAD_IN_CODIGO
                      and produto.PRO_IN_CODIGO = it.PRO_IN_CODIGO
                      ${where}
                  order by numero, numero_item) sub
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
        console.error('Erro ao listar solicitações:', err);
        res.status(500).json({erro: 'Erro ao consultar solicitações'});
    } finally {
        if (connection) await connection.close();
    }
}




module.exports = {listarItensSolicitacoes};
