const {getConnection} = require('../database/Oracle.database');
const CompraServices = require("../services/Compra.services");

async function atualizarCompra(req, res) {
    const {PDC_IN_CODIGO, FIL_IN_CODIGO, Itens} = req.body;

    if (!PDC_IN_CODIGO || !FIL_IN_CODIGO || !Array.isArray(Itens)) {
        return res.status(400).json({erro: 'Parâmetros inválidos'});
    }

    let connection;
    try {
        connection = await getConnection();
        const compraServices = new CompraServices(connection);
        const compra = await compraServices.buscarCompras(PDC_IN_CODIGO, FIL_IN_CODIGO);
        if (!compra) {
            res.status(404).json({erro: 'Compra nao encontrada'});
            return;
        }
        for (const item of Itens) {
            if (item.ITP_DT_ENTREGA) {
                const compraItem = await compraServices.buscarItensDaCompra(compra, item.ITP_IN_SEQUENCIA);
                await compraServices.atualizarDataEntrega(compraItem, item.ITP_DT_ENTREGA);
            }
        }
        await connection.commit();
        res.json(req.body);
    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Erro ao atualizar compras:', err);
        res.status(500).json({
            erro: 'Erro ao atualizar compras',
            detail: err.toString()
        });
    } finally {
        if (connection) await connection.close();
    }
}


module.exports = {atualizarCompra};
