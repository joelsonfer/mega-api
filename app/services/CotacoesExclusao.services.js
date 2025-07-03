class CotacoesExclusaoServices {
    constructor(connection) {
        this.connection = connection;
    }

    /**
     * Exclui cotaçao com base na compra passada como parametro
     * @param compra
     * @param cotInCodigo
     * @returns {Promise<*>}
     */
    async excluirCotacaoMega(compra, cotInCodigo) {
        const sql = `
            DELETE FROM est_cotacoes
            WHERE org_tab_in_codigo = :org_tab_in_codigo
              and org_pad_in_codigo = :org_pad_in_codigo
              and org_in_codigo = :org_in_codigo
              and org_tau_st_codigo = :org_tau_st_codigo
              and ser_tab_in_codigo = :ser_tab_in_codigo
              and ser_in_sequencia = :ser_in_sequencia
              and cot_in_codigo = :cotInCodigo
        `;
        const binds = {
            org_tab_in_codigo: compra.ORG_TAB_IN_CODIGO,
            org_pad_in_codigo: compra.ORG_PAD_IN_CODIGO,
            org_in_codigo: compra.ORG_IN_CODIGO,
            org_tau_st_codigo: compra.ORG_TAU_ST_CODIGO,
            ser_tab_in_codigo: compra.SER_TAB_IN_CODIGO,
            ser_in_sequencia: compra.SER_IN_SEQUENCIA,
            cotInCodigo: cotInCodigo
        };
        await this.connection.execute(sql, binds);
    }
    /**
     * Exclui cotaçao com base na compra passada como parametro
     * @param compraItem
     * @param cotInCodigo
     * @returns {Promise<*>}
     */
    async excluirItemCotacao(compraItem, cotInCodigo) {
        const sql = `
            DELETE FROM EST_ITENSCOTA
            WHERE ORG_TAB_IN_CODIGO = :ORG_TAB_IN_CODIGO
              AND ORG_PAD_IN_CODIGO = :ORG_PAD_IN_CODIGO
              AND ORG_IN_CODIGO = :ORG_IN_CODIGO
              AND ORG_TAU_ST_CODIGO = :ORG_TAU_ST_CODIGO
              AND SER_TAB_IN_CODIGO = :SER_TAB_IN_CODIGO
              AND SER_IN_SEQUENCIA = :SER_IN_SEQUENCIA
              AND COT_IN_CODIGO = :COT_IN_CODIGO
              AND COI_IN_CODIGO = :COI_IN_CODIGO
        `;
        const binds = {
            ORG_TAB_IN_CODIGO: compraItem.ORG_TAB_IN_CODIGO,
            ORG_PAD_IN_CODIGO: compraItem.ORG_PAD_IN_CODIGO,
            ORG_IN_CODIGO: compraItem.ORG_IN_CODIGO,
            ORG_TAU_ST_CODIGO: compraItem.ORG_TAU_ST_CODIGO,
            SER_TAB_IN_CODIGO: compraItem.SER_TAB_IN_CODIGO,
            SER_IN_SEQUENCIA: compraItem.SER_IN_SEQUENCIA,
            COT_IN_CODIGO: cotInCodigo,
            COI_IN_CODIGO: compraItem.ITP_IN_SEQUENCIA,
        };
        await this.connection.execute(sql, binds);
    }

    /**
     * Exclui o vnculo entre cotaçao e item da cotaçao
     * @param compraItem
     * @param cotInCodigo
     * @returns {Promise<*>}
     */
    async excluirVinculoItemCotacao(compraItem, cotInCodigo) {
        const sql = `
            DELETE FROM est_cotapedido
            WHERE COI_IN_CODIGO = :COI_IN_CODIGO
              AND COT_IN_CODIGO = :COT_IN_CODIGO
              AND COT_ORG_IN_CODIGO = :COT_ORG_IN_CODIGO
              AND COT_ORG_PAD_IN_CODIGO = :COT_ORG_PAD_IN_CODIGO
              AND COT_ORG_TAB_IN_CODIGO = :COT_ORG_TAB_IN_CODIGO
              AND COT_ORG_TAU_ST_CODIGO = :COT_ORG_TAU_ST_CODIGO
              AND COT_SER_IN_SEQUENCIA = :COT_SER_IN_SEQUENCIA
              AND COT_SER_TAB_IN_CODIGO = :COT_SER_TAB_IN_CODIGO
              AND ITP_IN_SEQUENCIA = :ITP_IN_SEQUENCIA
              AND ORG_IN_CODIGO = :ORG_IN_CODIGO
              AND ORG_PAD_IN_CODIGO = :ORG_PAD_IN_CODIGO
              AND ORG_TAB_IN_CODIGO = :ORG_TAB_IN_CODIGO
              AND ORG_TAU_ST_CODIGO = :ORG_TAU_ST_CODIGO
              AND PDC_IN_CODIGO = :PDC_IN_CODIGO
              AND PDC_SER_IN_SEQUENCIA = :PDC_SER_IN_SEQUENCIA
              AND PDC_SER_TAB_IN_CODIGO = :PDC_SER_TAB_IN_CODIGO
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

    async atualizarVinculoComCompraItem(solicitacao) {
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
            COT_ORG_TAB_IN_CODIGO: null,
            COT_ORG_PAD_IN_CODIGO: null,
            COT_ORG_IN_CODIGO: null,
            COT_ORG_TAU_ST_CODIGO: null,
            COT_SER_TAB_IN_CODIGO: null,
            COT_SER_IN_SEQUENCIA: null,
            COT_IN_CODIGO: null,
            COI_IN_CODIGO: null,
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

    async excluirVinculoSolicitacaoPedido(compraItem) {
        const sql = `
            DELETE FROM est_solicpedido
            WHERE PDC_IN_CODIGO = :PDC_IN_CODIGO
              AND PDC_ORG_IN_CODIGO = :PDC_ORG_IN_CODIGO
              AND PDC_ORG_PAD_IN_CODIGO = :PDC_ORG_PAD_IN_CODIGO
              AND PDC_ORG_TAB_IN_CODIGO = :PDC_ORG_TAB_IN_CODIGO
              AND PDC_ORG_TAU_ST_CODIGO = :PDC_ORG_TAU_ST_CODIGO
              AND PDC_SER_IN_SEQUENCIA = :PDC_SER_IN_SEQUENCIA
              AND PDC_SER_TAB_IN_CODIGO = :PDC_SER_TAB_IN_CODIGO
              AND ITP_IN_SEQUENCIA = :ITP_IN_SEQUENCIA
        `;
        const binds = {
            PDC_IN_CODIGO: compraItem.PDC_IN_CODIGO,
            PDC_ORG_IN_CODIGO: compraItem.ORG_IN_CODIGO,
            PDC_ORG_PAD_IN_CODIGO: compraItem.ORG_PAD_IN_CODIGO,
            PDC_ORG_TAB_IN_CODIGO: compraItem.ORG_TAB_IN_CODIGO,
            PDC_ORG_TAU_ST_CODIGO: compraItem.ORG_TAU_ST_CODIGO,
            PDC_SER_IN_SEQUENCIA: compraItem.SER_IN_SEQUENCIA,
            PDC_SER_TAB_IN_CODIGO: compraItem.SER_TAB_IN_CODIGO_COMPRAS,
            ITP_IN_SEQUENCIA: compraItem.ITP_IN_SEQUENCIA,
        };
        await this.connection.execute(sql, binds);
    }
}

module.exports = CotacoesExclusaoServices;
