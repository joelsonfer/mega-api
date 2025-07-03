class CotacoesServices {
    constructor(connection) {
        this.connection = connection;
    }

    /**
     * Gera código sequencia para Cotação
     * @param org_in_codigo
     * @returns {Promise<*>}
     */
    async getCotacaoSequence(org_in_codigo) {
        const sql = `
            SELECT fon$_sequencia_cotacao(:org_in_codigo) AS sequence_value
            FROM dual
        `;

        const result = await this.connection.execute(sql, {org_in_codigo});
        const row = result.rows[0];
        return row.SEQUENCE_VALUE;
    }

    /**
     * Insere cotaçao com base na compra passada como parametro
     * @param compra
     * @param cotInCodigo
     * @returns {Promise<*>}
     */
    async inserirCotacaoMega(compra, cotInCodigo) {
        const sql = `
            INSERT INTO est_cotacoes (org_tab_in_codigo, org_pad_in_codigo, org_in_codigo, org_tau_st_codigo,
                                      ser_tab_in_codigo, ser_in_sequencia, cot_in_codigo, fil_in_codigo, cot_dt_emissao,
                                      cot_st_descricao, usu_in_comprador, usu_in_inclusao, cot_st_encerrado,
                                      cot_bo_frete,
                                      cot_bo_seguro, cot_bo_despacessoria, cot_bo_pzentrega, cot_bo_rotatividade,
                                      cot_bo_sreajuste, cot_bo_ipi, cot_bo_icms, cot_bo_emcotacao, cot_st_motivo,
                                      cot_dt_limitefornecedor, cot_bo_calciss, cot_ch_tipo, loc_in_sequencia,
                                      cot_bo_aprovaportalweb, usu_in_cotacao)
            VALUES (:org_tab_in_codigo, :org_pad_in_codigo, :org_in_codigo, :org_tau_st_codigo, :ser_tab_in_codigo,
                    :ser_in_sequencia, :cotInCodigo,
                    :fil_in_codigo, :cot_dt_emissao, :cot_st_descricao, :usu_in_comprador, :usu_in_inclusao,
                    :cot_st_encerrado, 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'N', NULL, NULL, 'N', 'I', NULL, 'N',
                    :usu_in_cotacao)
        `;
        const binds = {
            org_tab_in_codigo: compra.ORG_TAB_IN_CODIGO,
            org_pad_in_codigo: compra.ORG_PAD_IN_CODIGO,
            org_in_codigo: compra.ORG_IN_CODIGO,
            org_tau_st_codigo: compra.ORG_TAU_ST_CODIGO,
            ser_tab_in_codigo: compra.SER_TAB_IN_CODIGO,
            ser_in_sequencia: compra.SER_IN_SEQUENCIA,
            cotInCodigo: cotInCodigo,
            fil_in_codigo: compra.FIL_IN_CODIGO,
            cot_dt_emissao: compra.PDC_DT_EMISSAO,
            cot_st_descricao: compra.PDC_ST_DESCRICAO,
            usu_in_comprador: compra.GRU_IN_CODIGO,
            usu_in_inclusao: compra.GRU_IN_CODIGO,
            cot_st_encerrado: 'S',
            usu_in_cotacao: compra.GRU_IN_CODIGO,
        };

        await this.connection.execute(sql, binds);
    }


    /**
     * Insere o vnculo entre cotaçao e item da cotaçao
     * @param compraItem
     * @param cotInCodigo
     * @returns {Promise<*>}
     */
    async inserirVinculoItemCotacao(compraItem, cotInCodigo) {
        const sql = `
            INSERT INTO est_cotapedido
            (COI_IN_CODIGO,
             COT_IN_CODIGO,
             COT_ORG_IN_CODIGO,
             COT_ORG_PAD_IN_CODIGO,
             COT_ORG_TAB_IN_CODIGO,
             COT_ORG_TAU_ST_CODIGO,
             COT_SER_IN_SEQUENCIA,
             COT_SER_TAB_IN_CODIGO,
             ITP_IN_SEQUENCIA,
             ORG_IN_CODIGO,
             ORG_PAD_IN_CODIGO,
             ORG_TAB_IN_CODIGO,
             ORG_TAU_ST_CODIGO,
             PDC_IN_CODIGO,
             PDC_SER_IN_SEQUENCIA,
             PDC_SER_TAB_IN_CODIGO)
            VALUES (:COI_IN_CODIGO,
                    :COT_IN_CODIGO,
                    :COT_ORG_IN_CODIGO,
                    :COT_ORG_PAD_IN_CODIGO,
                    :COT_ORG_TAB_IN_CODIGO,
                    :COT_ORG_TAU_ST_CODIGO,
                    :COT_SER_IN_SEQUENCIA,
                    :COT_SER_TAB_IN_CODIGO,
                    :ITP_IN_SEQUENCIA,
                    :ORG_IN_CODIGO,
                    :ORG_PAD_IN_CODIGO,
                    :ORG_TAB_IN_CODIGO,
                    :ORG_TAU_ST_CODIGO,
                    :PDC_IN_CODIGO,
                    :PDC_SER_IN_SEQUENCIA,
                    :PDC_SER_TAB_IN_CODIGO)
        `;
        const binds = {
            COI_IN_CODIGO: compraItem.ITP_IN_SEQUENCIA,
            COT_IN_CODIGO: cotInCodigo,
            COT_ORG_IN_CODIGO: compraItem.ORG_IN_CODIGO,
            COT_ORG_PAD_IN_CODIGO: compraItem.ORG_PAD_IN_CODIGO,
            COT_ORG_TAB_IN_CODIGO: compraItem.ORG_TAB_IN_CODIGO,
            COT_ORG_TAU_ST_CODIGO: compraItem.ORG_TAU_ST_CODIGO,
            COT_SER_IN_SEQUENCIA: compraItem.SER_IN_SEQUENCIA,
            COT_SER_TAB_IN_CODIGO: compraItem.SER_TAB_IN_CODIGO,
            ITP_IN_SEQUENCIA: compraItem.ITP_IN_SEQUENCIA,
            ORG_IN_CODIGO: compraItem.ORG_IN_CODIGO,
            ORG_PAD_IN_CODIGO: compraItem.ORG_PAD_IN_CODIGO,
            ORG_TAB_IN_CODIGO: compraItem.ORG_TAB_IN_CODIGO,
            ORG_TAU_ST_CODIGO: compraItem.ORG_TAU_ST_CODIGO,
            PDC_IN_CODIGO: compraItem.PDC_IN_CODIGO,
            PDC_SER_IN_SEQUENCIA: compraItem.SER_IN_SEQUENCIA,
            PDC_SER_TAB_IN_CODIGO: compraItem.SER_TAB_IN_CODIGO_COMPRAS,
        };
        await this.connection.execute(sql, binds);
    }

    /**
     * Insere cotaçao com base na compra passada como parametro
     * @param compraItem
     * @param cotInCodigo
     * @returns {Promise<*>}
     */
    async inserirItemCotacao(compraItem, cotInCodigo) {
        const sql = `
            INSERT INTO EST_ITENSCOTA (ORG_TAB_IN_CODIGO, ORG_PAD_IN_CODIGO, ORG_IN_CODIGO, ORG_TAU_ST_CODIGO,
                                       SER_TAB_IN_CODIGO, SER_IN_SEQUENCIA, COT_IN_CODIGO, COI_IN_CODIGO,
                                       PRO_TAB_IN_CODIGO, PRO_PAD_IN_CODIGO, PRO_IN_CODIGO, COS_IN_CODIGO,
                                       APL_TAB_IN_CODIGO, APL_PAD_IN_CODIGO, APL_IN_CODIGO,
                                       TPC_TAB_IN_CODIGO, TPC_PAD_IN_CODIGO, TPC_ST_CLASSE,
                                       MVS_ST_REFERENCIA,
                                       COI_RE_QTDSUGERIDA, COI_RE_QTDMINIMA, COI_ST_ENCERRADO,
                                       COI_DT_INCLUSAO, COI_DT_ALTERA, COI_DT_MINIMA, COI_BO_GERACONTRATO,
                                       COI_IN_NRAGRUPAMENTO)
            VALUES (:ORG_TAB_IN_CODIGO, :ORG_PAD_IN_CODIGO, :ORG_IN_CODIGO, :ORG_TAU_ST_CODIGO,
                    :SER_TAB_IN_CODIGO, :SER_IN_SEQUENCIA, :COT_IN_CODIGO, :COI_IN_CODIGO,
                    :PRO_TAB_IN_CODIGO, :PRO_PAD_IN_CODIGO, :PRO_IN_CODIGO, NULL,
                    :APL_TAB_IN_CODIGO, :APL_PAD_IN_CODIGO, :APL_IN_CODIGO,
                    :TPC_TAB_IN_CODIGO, :TPC_PAD_IN_CODIGO, :TPC_ST_CLASSE,
                    :MVS_ST_REFERENCIA,
                    :COI_RE_QTDSUGERIDA, :COI_RE_QTDMINIMA, 'S',
                    TO_TIMESTAMP(:COI_DT_INCLUSAO, 'YYYY-MM-DD'),
                    TO_TIMESTAMP(:COI_DT_ALTERA, 'YYYY-MM-DD'),
                    TO_TIMESTAMP(:COI_DT_MINIMA, 'YYYY-MM-DD'),
                    'N',
                    :COI_IN_NRAGRUPAMENTO)
        `;
        const data = (compraItem.ITP_DT_ORCAMENTO || new Date()).toISOString().slice(0, 10);
        const binds = {
            ORG_TAB_IN_CODIGO: compraItem.ORG_TAB_IN_CODIGO,
            ORG_PAD_IN_CODIGO: compraItem.ORG_PAD_IN_CODIGO,
            ORG_IN_CODIGO: compraItem.ORG_IN_CODIGO,
            ORG_TAU_ST_CODIGO: compraItem.ORG_TAU_ST_CODIGO,
            SER_TAB_IN_CODIGO: compraItem.SER_TAB_IN_CODIGO,
            SER_IN_SEQUENCIA: compraItem.SER_IN_SEQUENCIA,
            COT_IN_CODIGO: cotInCodigo,
            COI_IN_CODIGO: compraItem.ITP_IN_SEQUENCIA,

            PRO_TAB_IN_CODIGO: compraItem.PRO_TAB_IN_CODIGO,
            PRO_PAD_IN_CODIGO: compraItem.PRO_PAD_IN_CODIGO,
            PRO_IN_CODIGO: compraItem.PRO_IN_CODIGO,
            APL_TAB_IN_CODIGO: compraItem.APL_TAB_IN_CODIGO,
            APL_PAD_IN_CODIGO: compraItem.APL_PAD_IN_CODIGO,
            APL_IN_CODIGO: compraItem.APL_IN_CODIGO,
            TPC_TAB_IN_CODIGO: compraItem.TPC_TAB_IN_CODIGO,
            TPC_PAD_IN_CODIGO: compraItem.TPC_PAD_IN_CODIGO,
            TPC_ST_CLASSE: compraItem.TPC_ST_CLASSE,
            MVS_ST_REFERENCIA: compraItem.ITP_ST_REFERENCIA,
            COI_RE_QTDSUGERIDA: compraItem.ITP_RE_QTDEACONVERTER,
            COI_RE_QTDMINIMA: compraItem.ITP_RE_QTDEACONVERTER,
            COI_DT_INCLUSAO: data,
            COI_DT_ALTERA: data,
            COI_DT_MINIMA: data,
            COI_IN_NRAGRUPAMENTO: compraItem.ITP_IN_SEQUENCIA,
        };

        await this.connection.execute(sql, binds);
    }

    async atualizarVinculoComCompraItem(compraItem, cotInCodigo, solicitacao) {
        const sql = `
            UPDATE est_itenssoli a
            SET COT_ORG_TAB_IN_CODIGO = :COT_ORG_TAB_IN_CODIGO,
                COT_ORG_PAD_IN_CODIGO = :COT_ORG_PAD_IN_CODIGO,
                COT_ORG_IN_CODIGO     = :COT_ORG_IN_CODIGO,
                COT_ORG_TAU_ST_CODIGO = :COT_ORG_TAU_ST_CODIGO,
                COT_SER_TAB_IN_CODIGO = :COT_SER_TAB_IN_CODIGO,
                COT_SER_IN_SEQUENCIA  = :COT_SER_IN_SEQUENCIA,
                COT_IN_CODIGO         = :COT_IN_CODIGO,
                COI_IN_CODIGO         = :COI_IN_CODIGO
            WHERE a.ORG_TAB_IN_CODIGO = :ORG_TAB_IN_CODIGO
              AND a.ORG_PAD_IN_CODIGO = :ORG_PAD_IN_CODIGO
              AND a.ORG_IN_CODIGO = :ORG_IN_CODIGO
              AND a.ORG_TAU_ST_CODIGO = :ORG_TAU_ST_CODIGO
              AND a.SER_TAB_IN_CODIGO = :SER_TAB_IN_CODIGO
              AND a.SER_IN_SEQUENCIA = :SER_IN_SEQUENCIA
              AND a.SOL_IN_CODIGO = :SOL_IN_CODIGO
              AND a.SOI_IN_CODIGO = :SOI_IN_CODIGO
        `;
        const binds = {
            COT_ORG_TAB_IN_CODIGO: compraItem.ORG_TAB_IN_CODIGO,
            COT_ORG_PAD_IN_CODIGO: compraItem.ORG_PAD_IN_CODIGO,
            COT_ORG_IN_CODIGO: compraItem.ORG_IN_CODIGO,
            COT_ORG_TAU_ST_CODIGO: compraItem.ORG_TAU_ST_CODIGO,
            COT_SER_TAB_IN_CODIGO: compraItem.SER_TAB_IN_CODIGO,
            COT_SER_IN_SEQUENCIA: compraItem.SER_IN_SEQUENCIA,
            COT_IN_CODIGO: cotInCodigo,
            COI_IN_CODIGO: compraItem.ITP_IN_SEQUENCIA,
            ORG_TAB_IN_CODIGO: solicitacao.ORG_TAB_IN_CODIGO,
            ORG_PAD_IN_CODIGO: solicitacao.ORG_PAD_IN_CODIGO,
            ORG_IN_CODIGO: solicitacao.ORG_IN_CODIGO,
            ORG_TAU_ST_CODIGO: solicitacao.ORG_TAU_ST_CODIGO,
            SER_TAB_IN_CODIGO: solicitacao.SER_TAB_IN_CODIGO,
            SER_IN_SEQUENCIA: solicitacao.SER_IN_SEQUENCIA,
            SOL_IN_CODIGO: solicitacao.SOL_IN_CODIGO,
            SOI_IN_CODIGO: solicitacao.SOI_IN_CODIGO,
        };
        await this.connection.execute(sql, binds);
    }

    async gerarVinculoSolicitacaoPedido(compraItem, cotInCodigo, solicitacao) {
        const sql = `
            INSERT INTO est_solicpedido (ITP_DT_ENTREGA, ITP_IN_SEQUENCIA, ORG_IN_CODIGO, ORG_PAD_IN_CODIGO,
                                         ORG_TAB_IN_CODIGO, ORG_TAU_ST_CODIGO, PDC_IN_CODIGO, PDC_ORG_IN_CODIGO,
                                         PDC_ORG_PAD_IN_CODIGO, PDC_ORG_TAB_IN_CODIGO, PDC_ORG_TAU_ST_CODIGO,
                                         PDC_SER_IN_SEQUENCIA, PDC_SER_TAB_IN_CODIGO, SOI_IN_CODIGO, SOL_IN_CODIGO,
                                         SOL_SER_IN_SEQUENCIA, SOL_SER_TAB_IN_CODIGO, SOP_ST_ORIGEM)
            SELECT a.ITP_DT_ENTREGA,
                   a.ITP_IN_SEQUENCIA,
                   :SOL_ORG_IN_CODIGO,
                   :SOL_ORG_PAD_IN_CODIGO,
                   :SOL_ORG_TAB_IN_CODIGO,
                   :SOL_ORG_TAU_ST_CODIGO,
                   a.PDC_IN_CODIGO,
                   a.ORG_IN_CODIGO,
                   a.ORG_PAD_IN_CODIGO,
                   a.ORG_TAB_IN_CODIGO,
                   a.ORG_TAU_ST_CODIGO,
                   a.SER_IN_SEQUENCIA,
                   a.SER_TAB_IN_CODIGO,
                   :SOI_IN_CODIGO,
                   :SOL_IN_CODIGO,
                   :SOL_SER_IN_SEQUENCIA,
                   :SOL_SER_TAB_IN_CODIGO,
                   'C'
            FROM est_itenspedprogramados a
                     JOIN est_itenspedcompra b ON a.ORG_TAB_IN_CODIGO = b.ORG_TAB_IN_CODIGO
                AND a.ORG_PAD_IN_CODIGO = b.ORG_PAD_IN_CODIGO
                AND a.ORG_IN_CODIGO = b.ORG_IN_CODIGO
                AND a.ORG_TAU_ST_CODIGO = b.ORG_TAU_ST_CODIGO
                AND a.SER_TAB_IN_CODIGO = b.SER_TAB_IN_CODIGO
                AND a.SER_IN_SEQUENCIA = b.SER_IN_SEQUENCIA
                AND a.PDC_IN_CODIGO = b.PDC_IN_CODIGO
                AND a.ITP_IN_SEQUENCIA = b.ITP_IN_SEQUENCIA
            WHERE b.ORG_TAB_IN_CODIGO = :ORG_TAB_IN_CODIGO
              AND b.ORG_PAD_IN_CODIGO = :ORG_PAD_IN_CODIGO
              AND b.ORG_IN_CODIGO = :ORG_IN_CODIGO
              AND b.ORG_TAU_ST_CODIGO = :ORG_TAU_ST_CODIGO
              AND b.SER_TAB_IN_CODIGO = :SER_TAB_IN_CODIGO
              AND b.SER_IN_SEQUENCIA = :SER_IN_SEQUENCIA
              AND b.PDC_IN_CODIGO = :PDC_IN_CODIGO
              AND b.ITP_IN_SEQUENCIA = :ITP_IN_SEQUENCIA
        `;
        const binds = {
            SOL_ORG_IN_CODIGO: solicitacao.ORG_IN_CODIGO,
            SOL_ORG_PAD_IN_CODIGO: solicitacao.ORG_PAD_IN_CODIGO,
            SOL_ORG_TAB_IN_CODIGO: solicitacao.ORG_TAB_IN_CODIGO,
            SOL_ORG_TAU_ST_CODIGO: solicitacao.ORG_TAU_ST_CODIGO,
            SOI_IN_CODIGO: solicitacao.SOI_IN_CODIGO,
            SOL_IN_CODIGO: solicitacao.SOL_IN_CODIGO,
            SOL_SER_IN_SEQUENCIA: solicitacao.SER_IN_SEQUENCIA,
            SOL_SER_TAB_IN_CODIGO: solicitacao.SER_TAB_IN_CODIGO,
            ORG_TAB_IN_CODIGO: compraItem.ORG_TAB_IN_CODIGO,
            ORG_PAD_IN_CODIGO: compraItem.ORG_PAD_IN_CODIGO,
            ORG_IN_CODIGO: compraItem.ORG_IN_CODIGO,
            ORG_TAU_ST_CODIGO: compraItem.ORG_TAU_ST_CODIGO,
            SER_TAB_IN_CODIGO: compraItem.SER_TAB_IN_CODIGO_COMPRAS,
            SER_IN_SEQUENCIA: compraItem.SER_IN_SEQUENCIA,
            PDC_IN_CODIGO: compraItem.PDC_IN_CODIGO,
            ITP_IN_SEQUENCIA: compraItem.ITP_IN_SEQUENCIA,
        };
        console.log(sql, binds);
        await this.connection.execute(sql, binds);
    }
}

module.exports = CotacoesServices;
