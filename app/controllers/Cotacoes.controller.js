const {getConnection} = require('../database/Oracle.database');
const CotacoesServices = require("../services/Cotacoes.services");
const CompraServices = require("../services/Compra.services");
const SolicitacoesServices = require("../services/Solicitacao.services");
const CotacoesExclusaoServices = require("../services/CotacoesExclusao.services");


async function buscarCotacao(req, res) {
    const {PDC_IN_CODIGO, FIL_IN_CODIGO} = req.query;
    let connection;
    try {
        connection = await getConnection();
        const compraService = new CompraServices(connection);
        const compra = await compraService.buscarCompras(PDC_IN_CODIGO, FIL_IN_CODIGO);
        compra.itens = await compraService.listarItensDaCompra(compra);
        res.json(compra);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            erro: 'Erro ao buscar compras',
            detail: err.toString()
        });
    } finally {
        if (connection) {
            connection.close();
        }
    }
}

async function inserirCotacao(req, res) {
    const {PDC_IN_CODIGO, FIL_IN_CODIGO, Itens} = req.body;

    if (!PDC_IN_CODIGO || !FIL_IN_CODIGO || !Array.isArray(Itens)) {
        return res.status(400).json({erro: 'Parâmetros inválidos'});
    }

    let connection;
    try {
        connection = await getConnection();
        const cotacaoService = new CotacoesServices(connection);
        const solicitacaoService = new SolicitacoesServices(connection);
        const compraServices = new CompraServices(connection);
        const compra = await compraServices.buscarCompras(PDC_IN_CODIGO, FIL_IN_CODIGO);
        if (!compra) {
            res.status(404).json({erro: 'Compra nao encontrada'});
            return;
        }
        if (compra.COTACAO) {
            res.json({
                COT_IN_CODIGO: compra.COTACAO,
                STATUS: "Não atualizado",
            });
            return;
        }
        const cotInCodigo = await cotacaoService.getCotacaoSequence(compra.ORG_IN_CODIGO);
        await cotacaoService.inserirCotacaoMega(compra, cotInCodigo);
        const itensProcessados = [];
        for (const item of Itens) {
            const compraItem = await compraServices.buscarItensDaCompra(compra, item.ITP_IN_SEQUENCIA);
            const solicitacao = await solicitacaoService.buscarItemSolicitacao(item.solicitacao);
            await cotacaoService.inserirItemCotacao(compraItem, cotInCodigo);
            await cotacaoService.inserirVinculoItemCotacao(compraItem, cotInCodigo);
            await cotacaoService.atualizarVinculoComCompraItem(compraItem, cotInCodigo, solicitacao);
            await cotacaoService.gerarVinculoSolicitacaoPedido(compraItem, cotInCodigo, solicitacao);
            await solicitacaoService.atualizarStatusItemSolicitacao(solicitacao, item.solicitacao);
            itensProcessados.push({...item})
        }

        await connection.commit();
        res.json({
            COT_IN_CODIGO: cotInCodigo,
            itens: itensProcessados
        });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Erro ao inserir cotacao:', err);
        res.status(500).json({
            erro: 'Erro ao inserir cotacao',
            detail: err.toString()
        });
    } finally {
        if (connection) await connection.close();
    }
}

async function excluirCotacao(req, res) {
    const {PDC_IN_CODIGO, FIL_IN_CODIGO, Itens} = req.body;

    if (!PDC_IN_CODIGO || !FIL_IN_CODIGO || !Array.isArray(Itens)) {
        return res.status(400).json({erro: 'Parâmetros inválidos'});
    }

    let connection;
    try {
        connection = await getConnection();
        const cotacaoService = new CotacoesExclusaoServices(connection);
        const compraServices = new CompraServices(connection);
        const solicitacaoService = new SolicitacoesServices(connection);
        const compra = await compraServices.buscarCompras(PDC_IN_CODIGO, FIL_IN_CODIGO);
        if (!compra) {
            res.status(404).json({erro: 'Compra nao encontrada'});
            return;
        }
        if (!compra.COTACAO) {
            return res.status(400).json({erro: 'Não foi localizado uma cotação para essa compra'});
        }
        const cotInCodigo = compra.COTACAO;
        const itensProcessados = [];
        for (const item of Itens) {
            const compraItem = await compraServices.buscarItensDaCompra(compra, item.ITP_IN_SEQUENCIA);
            const solicitacao = await solicitacaoService.buscarItemSolicitacao(item.solicitacao);
            await cotacaoService.excluirVinculoSolicitacaoPedido(compraItem);
            await cotacaoService.atualizarVinculoComCompraItem(solicitacao);
            await cotacaoService.excluirVinculoItemCotacao(compraItem, cotInCodigo);
            await cotacaoService.excluirItemCotacao(compraItem, cotInCodigo);
            await solicitacaoService.atualizarStatusItemSolicitacao(solicitacao, item.solicitacao);
            itensProcessados.push({...item})
        }
        await cotacaoService.excluirCotacaoMega(compra, cotInCodigo);

        await connection.commit();
        res.json({
            COT_IN_CODIGO: cotInCodigo,
            itens: itensProcessados
        });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Erro ao excluir cotacao:', err);
        res.status(500).json({
            erro: 'Erro ao excluir cotacao',
            detail: err.toString()
        });
    } finally {
        if (connection) await connection.close();
    }
}

module.exports = {inserirCotacao, excluirCotacao, buscarCotacao};
