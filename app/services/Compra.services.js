class CompraServices {
    constructor(connection) {
        this.connection = connection;
    }

    /**
     * Busca a compra com base no parametro
     * @param codigo
     * @param filial
     * @returns {Promise<*>}
     */
    async buscarCompras(codigo, filial) {
        const sql = `
            SELECT ORG_TAB_IN_CODIGO,
                   ORG_PAD_IN_CODIGO,
                   ORG_IN_CODIGO,
                   ORG_TAU_ST_CODIGO,
                   110               as                                   SER_TAB_IN_CODIGO,
                   SER_TAB_IN_CODIGO AS                                   SER_TAB_IN_CODIGO_COMPRAS,
                   SER_IN_SEQUENCIA,
                   PDC_IN_CODIGO,
                   FIL_IN_CODIGO,
                   PDC_DT_EMISSAO,
                   PDC_ST_SITUACAO,
                   GRU_IN_CODIGO,
                   (select max(c.cot_in_codigo)
                    from est_cotapedido c
                    where c.ORG_TAB_IN_CODIGO = EST_PEDCOMPRAS.ORG_TAB_IN_CODIGO
                      and c.ORG_PAD_IN_CODIGO = EST_PEDCOMPRAS.ORG_PAD_IN_CODIGO
                      and c.ORG_IN_CODIGO = EST_PEDCOMPRAS.ORG_IN_CODIGO
                      and c.ORG_TAU_ST_CODIGO = EST_PEDCOMPRAS.ORG_TAU_ST_CODIGO
                      and c.org_tab_in_codigo = EST_PEDCOMPRAS.org_tab_in_codigo
                      and c.PDC_IN_CODIGO = EST_PEDCOMPRAS.PDC_IN_CODIGO) COTACAO
            FROM EST_PEDCOMPRAS
            WHERE PDC_IN_CODIGO = :codigo
              AND FIL_IN_CODIGO = :filial
        `;

        const result = await this.connection.execute(sql, {codigo, filial});
        if (result.rows.length > 0) {
            return result.rows[0];
        } else {
            throw new Error('Compra nao encontrada');
        }
    }


    /**
     * Busca os itens da compra
     * @param compra
     * @param sequencia
     * @returns {Promise<*>}
     */
    async buscarItensDaCompra(compra, sequencia) {
        const sql = `
            select ORG_TAB_IN_CODIGO,
                   ORG_PAD_IN_CODIGO,
                   ORG_IN_CODIGO,
                   ORG_TAU_ST_CODIGO,
                   110 as SER_TAB_IN_CODIGO,
                   SER_TAB_IN_CODIGO as  SER_TAB_IN_CODIGO_COMPRAS,
                   SER_IN_SEQUENCIA,
                   ITP_IN_SEQUENCIA,
                   PRO_TAB_IN_CODIGO,
                   PRO_PAD_IN_CODIGO,
                   PRO_IN_CODIGO,
                   COS_IN_CODIGO,
                   APL_TAB_IN_CODIGO,
                   APL_PAD_IN_CODIGO,
                   APL_IN_CODIGO,
                   TPC_TAB_IN_CODIGO,
                   TPC_PAD_IN_CODIGO,
                   TPC_ST_CLASSE,
                   ITP_ST_REFERENCIA,
                   ITP_RE_QTDEACONVERTER,
                   ITP_RE_QTDEVINCCONHEC,
                   ITP_DT_ORCAMENTO,
                   PDC_IN_CODIGO
            from est_itenspedcompra
            WHERE ORG_TAB_IN_CODIGO = :ORG_TAB_IN_CODIGO
              and ORG_PAD_IN_CODIGO = :ORG_PAD_IN_CODIGO
              and ORG_IN_CODIGO = :ORG_IN_CODIGO
              and ORG_TAU_ST_CODIGO = :ORG_TAU_ST_CODIGO
              and PDC_IN_CODIGO = :PDC_IN_CODIGO
              and SER_IN_SEQUENCIA = :SER_IN_SEQUENCIA
              and ITP_IN_SEQUENCIA = :ITP_IN_SEQUENCIA
        `;

        const binds = {
            ORG_TAB_IN_CODIGO: compra.ORG_TAB_IN_CODIGO,
            ORG_PAD_IN_CODIGO: compra.ORG_PAD_IN_CODIGO,
            ORG_IN_CODIGO: compra.ORG_IN_CODIGO,
            ORG_TAU_ST_CODIGO: compra.ORG_TAU_ST_CODIGO,
            PDC_IN_CODIGO: compra.PDC_IN_CODIGO,
            SER_IN_SEQUENCIA: compra.SER_IN_SEQUENCIA,
            ITP_IN_SEQUENCIA: sequencia,
        };
        const result = await this.connection.execute(sql, binds);
        if (result.rows.length > 0) {
            return result.rows[0];
        } else {
            throw new Error('Item not found');
        }
    }

    /**
     * Busca os itens da compra
     * @param compra
     * @param sequencia
     * @returns {Promise<*>}
     */
    async listarItensDaCompra(compra) {
        const sql = `
            select ped.ORG_TAB_IN_CODIGO,
                   ped.ORG_PAD_IN_CODIGO,
                   ped.ORG_IN_CODIGO,
                   ped.ORG_TAU_ST_CODIGO,
                   110 as SER_TAB_IN_CODIGO,
                   ped.SER_IN_SEQUENCIA,
                   ped.ITP_IN_SEQUENCIA,
                   ped.PRO_TAB_IN_CODIGO,
                   ped.PRO_PAD_IN_CODIGO,
                   ped.PRO_IN_CODIGO,
                   ped.COS_IN_CODIGO,
                   ped.APL_TAB_IN_CODIGO,
                   ped.APL_PAD_IN_CODIGO,
                   ped.APL_IN_CODIGO,
                   ped.TPC_TAB_IN_CODIGO,
                   ped.TPC_PAD_IN_CODIGO,
                   ped.TPC_ST_CLASSE,
                   ped.ITP_ST_REFERENCIA,
                   ped.ITP_RE_QTDEACONVERTER,
                   ped.ITP_RE_QTDEVINCCONHEC,
                   ped.ITP_DT_ORCAMENTO,
                   ped.PDC_IN_CODIGO,
                   c.COT_IN_CODIGO,
                   c.COI_IN_CODIGO
            from est_itenspedcompra ped
                     left join est_cotapedido c
                               on c.ORG_TAB_IN_CODIGO = ped.ORG_TAB_IN_CODIGO
                                   and c.ORG_PAD_IN_CODIGO = ped.ORG_PAD_IN_CODIGO
                                   and c.ORG_IN_CODIGO = ped.ORG_IN_CODIGO
                                   and c.ORG_TAU_ST_CODIGO = ped.ORG_TAU_ST_CODIGO
                                   and c.org_tab_in_codigo = ped.org_tab_in_codigo
                                   and c.PDC_IN_CODIGO = ped.PDC_IN_CODIGO
                                   and c.ITP_IN_SEQUENCIA = ped.itp_in_sequencia
            WHERE ped.ORG_TAB_IN_CODIGO = :ORG_TAB_IN_CODIGO
              and ped.ORG_PAD_IN_CODIGO = :ORG_PAD_IN_CODIGO
              and ped.ORG_IN_CODIGO = :ORG_IN_CODIGO
              and ped.ORG_TAU_ST_CODIGO = :ORG_TAU_ST_CODIGO
              and ped.PDC_IN_CODIGO = :PDC_IN_CODIGO
              and ped.SER_IN_SEQUENCIA = :SER_IN_SEQUENCIA
        `;

        const binds = {
            ORG_TAB_IN_CODIGO: compra.ORG_TAB_IN_CODIGO,
            ORG_PAD_IN_CODIGO: compra.ORG_PAD_IN_CODIGO,
            ORG_IN_CODIGO: compra.ORG_IN_CODIGO,
            ORG_TAU_ST_CODIGO: compra.ORG_TAU_ST_CODIGO,
            PDC_IN_CODIGO: compra.PDC_IN_CODIGO,
            SER_IN_SEQUENCIA: compra.SER_IN_SEQUENCIA,
        };
        const result = await this.connection.execute(sql, binds);
        if (result.rows.length > 0) {
            return result.rows;
        } else {
            throw new Error('Item not found');
        }
    }

}

module.exports = CompraServices;
