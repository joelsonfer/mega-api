class SolicitacaoServices {

    constructor(connection) {
        this.connection = connection;
    }


    /**
     * As que forem administrativas, origem U, devem ser consideradas como Pedidos Livres
     * Pedidos Livres não podem gerar cotações
     *
     * @param Itens
     * @returns {Promise<boolean>}
     */
    async verificarPedidoLivres(Itens) {
        if (Itens && Itens.length > 0) {
            const itemVerificao = Itens[0];
            if (itemVerificao.solicitacao) {
                const solicitacao = await this.buscarItemSolicitacao(itemVerificao.solicitacao);
                /**
                 * As que forem administrativas, origem U, devem ser consideradas como Pedidos Livres
                 * Pedidos Livres não podem gerar cotações
                 */
                if (solicitacao && solicitacao.SOL_CH_ORIGEM == 'U') {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Busca o item solicitacao com base na variavel item
     * @param item
     * @returns {Promise<*>}
     */
    async buscarItemSolicitacao(item) {
        const sql = `
            SELECT solicitacao.ORG_TAB_IN_CODIGO,
                   solicitacao.ORG_PAD_IN_CODIGO,
                   solicitacao.ORG_IN_CODIGO,
                   solicitacao.ORG_TAU_ST_CODIGO,
                   solicitacao.SER_TAB_IN_CODIGO,
                   solicitacao.SER_IN_SEQUENCIA,
                   solicitacao.SOL_IN_CODIGO,
                   solicitacao.SOI_IN_CODIGO,
                   SOL_CH_ORIGEM,
                   FIL_IN_CODIGO
            FROM EST_ITENSSOLI solicitacao
                     join EST_SOLICITACAO ES
                          on solicitacao.ORG_TAB_IN_CODIGO = ES.ORG_TAB_IN_CODIGO
                              and solicitacao.ORG_PAD_IN_CODIGO = ES.ORG_PAD_IN_CODIGO
                              and solicitacao.ORG_IN_CODIGO = ES.ORG_IN_CODIGO
                              and solicitacao.ORG_TAU_ST_CODIGO = ES.ORG_TAU_ST_CODIGO
                              and solicitacao.SER_TAB_IN_CODIGO = ES.SER_TAB_IN_CODIGO
                              and solicitacao.SER_IN_SEQUENCIA = ES.SER_IN_SEQUENCIA
                              and solicitacao.SOL_IN_CODIGO = ES.SOL_IN_CODIGO
            WHERE solicitacao.SOI_IN_CODIGO = :SOI_IN_CODIGO
              AND ES.SOL_IN_NUMRM = :SOL_IN_NUMRM
              AND ES.FIL_IN_CODIGO = :FIL_IN_CODIGO
              AND ES.SOL_IN_CODIGO = :SOL_IN_CODIGO
        `;

        const binds = {
            FIL_IN_CODIGO: item.FIL_IN_CODIGO,
            SOI_IN_CODIGO: item.SOI_IN_CODIGO,
            SOL_IN_CODIGO: item.SOL_IN_CODIGO,
            SOL_IN_NUMRM: item.SOL_IN_NUMRM,
        };


        const result = await this.connection.execute(sql, binds);
        if (result.rows.length > 0) {
            return result.rows[0];
        } else {
            throw new Error('Item solicitacao nao encontrado');
        }
    }

    async atualizarStatusItemSolicitacao(solicitacao, item) {
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

        await this.connection.execute(itemSql, {
            SOI_CH_STATUS: item.SOI_CH_STATUS,
            SOI_CH_STATUSNEC: item.SOI_CH_STATUSNEC,
            SOL_IN_CODIGO: solicitacao.SOL_IN_CODIGO,
            ORG_TAB_IN_CODIGO: solicitacao.ORG_TAB_IN_CODIGO,
            ORG_PAD_IN_CODIGO: solicitacao.ORG_PAD_IN_CODIGO,
            ORG_IN_CODIGO: solicitacao.ORG_IN_CODIGO,
            ORG_TAU_ST_CODIGO: solicitacao.ORG_TAU_ST_CODIGO,
            SER_TAB_IN_CODIGO: solicitacao.SER_TAB_IN_CODIGO,
            SER_IN_SEQUENCIA: solicitacao.SER_IN_SEQUENCIA,
            SOI_IN_CODIGO: item.SOI_IN_CODIGO,
        });
    }
}

module.exports = SolicitacaoServices;
