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
    const {PDC_IN_CODIGO, FIL_IN_CODIGO, OBS_IN_CODIGO, ENA_IN_CODIGOENT, Itens} = req.body;

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
        if (OBS_IN_CODIGO) {
            await compraServices.atualizarObservacaoCompra(PDC_IN_CODIGO, FIL_IN_CODIGO, OBS_IN_CODIGO);
        }
        if (ENA_IN_CODIGOENT) {
            await compraServices.atualizarLocalEntrega(PDC_IN_CODIGO, FIL_IN_CODIGO, ENA_IN_CODIGOENT);
        }
        const pedidoLivres = await solicitacaoService.verificarPedidoLivres(Itens);
        if (pedidoLivres) {
            await processarPedidosLivres(Itens, compraServices, compra, solicitacaoService);
            connection.commit();
            res.json({
                COT_IN_CODIGO: null,
                OBS_IN_CODIGO: OBS_IN_CODIGO,
                TIPO: "LIVRE",
                itens: Itens
            });
        } else {
            if (compra.COTACAO) {
                res.json({
                    COT_IN_CODIGO: compra.COTACAO,
                    STATUS: "Não atualizado",
                });
                return;
            }
            const cotInCodigo = await processarPedidosObra(cotacaoService, compra, Itens, compraServices, solicitacaoService);
            await compraServices.atualizarSituacaoPedido(PDC_IN_CODIGO, FIL_IN_CODIGO);
            await compraServices.atualizarSituacaoItensPedido(compra);

            await connection.commit();
            res.json({
                COT_IN_CODIGO: cotInCodigo,
                OBS_IN_CODIGO: OBS_IN_CODIGO,
                TIPO: "OBRA",
                itens: Itens
            });
        }
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
        const cotInCodigo = compra.COTACAO;
        for (const item of Itens) {
            if (cotInCodigo) {
                const compraItem = await compraServices.buscarItensDaCompra(compra, item.ITP_IN_SEQUENCIA);
                const solicitacao = await solicitacaoService.buscarItemSolicitacao(item.solicitacao);
                await cotacaoService.excluirVinculoSolicitacaoPedido(compraItem);
                await cotacaoService.atualizarVinculoComCompraItem(solicitacao);
                await cotacaoService.excluirVinculoItemCotacao(compraItem, cotInCodigo);
                await cotacaoService.excluirItemCotacao(compraItem, cotInCodigo);
            }
            await solicitacaoService.atualizarStatusItemSolicitacao(solicitacao, item.solicitacao);
        }
        if (cotInCodigo) {
            await cotacaoService.excluirCotacaoMega(compra, cotInCodigo);
        }

        await connection.commit();
        res.json({
            COT_IN_CODIGO: cotInCodigo,
            itens: Itens
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

async function processarPedidosLivres(Itens, compraServices, compra, solicitacaoService) {
    for (const item of Itens) {
        if (item.ITP_DT_ENTREGA) {
            const compraItem = await compraServices.buscarItensDaCompra(compra, item.ITP_IN_SEQUENCIA);
            await compraServices.atualizarDataEntrega(compraItem, item.ITP_DT_ENTREGA);
        }
        if (item.solicitacao) {
            const solicitacao = await solicitacaoService.buscarItemSolicitacao(item.solicitacao);
            await solicitacaoService.atualizarStatusItemSolicitacao(solicitacao, item.solicitacao);
        }
    }
}

async function processarPedidosObra(cotacaoService, compra, Itens, compraServices, solicitacaoService) {
    const cotInCodigo = await cotacaoService.getCotacaoSequence(compra.ORG_IN_CODIGO);
    await cotacaoService.inserirCotacaoMega(compra, cotInCodigo);
    for (const item of Itens) {
        const compraItem = await compraServices.buscarItensDaCompra(compra, item.ITP_IN_SEQUENCIA);
        if (item.ITP_DT_ENTREGA) {
            await compraServices.atualizarDataEntrega(compraItem, item.ITP_DT_ENTREGA);
        }
        if (item.solicitacao) {
            const solicitacao = await solicitacaoService.buscarItemSolicitacao(item.solicitacao);
            await cotacaoService.inserirItemCotacao(compraItem, cotInCodigo);
            await cotacaoService.inserirVinculoItemCotacao(compraItem, cotInCodigo);
            await cotacaoService.atualizarVinculoComCompraItem(compraItem, cotInCodigo, solicitacao);
            await cotacaoService.gerarVinculoSolicitacaoPedido(compraItem, cotInCodigo, solicitacao);
            await solicitacaoService.atualizarStatusItemSolicitacao(solicitacao, item.solicitacao);
        }
    }
    return cotInCodigo;
}

module.exports = {inserirCotacao, excluirCotacao, buscarCotacao};
