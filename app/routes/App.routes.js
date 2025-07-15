const express = require('express');
const router = express.Router();
const {listarFornecedores} = require('../controllers/Fornecedores.controller');
const {
    listarSolicitacoes,
    buscarSolicitacaoPorId,
    atualizarSolicitacao,
    downloadAnexos
} = require('../controllers/Solicitacao.controller');
const {listarTiposClasses} = require('../controllers/TipoClasses.controller');
const {listarOperacoes} = require('../controllers/Operacoes.controller');
const {listarUsuariosGrupos} = require("../controllers/UsuariosGrupos.controller");
const {listarItensSolicitacoes} = require("../controllers/SolicitacaoItens.controller");
const {inserirCotacao, excluirCotacao, buscarCotacao} = require("../controllers/Cotacoes.controller");
const {atualizarCompra} = require("../controllers/Compras.controller");

router.get('/fornecedores', listarFornecedores);
router.get('/solicitacoes', listarSolicitacoes);
router.put('/solicitacoes', atualizarSolicitacao);
router.get('/solicitacoes/:filial/:numero', buscarSolicitacaoPorId);
router.get('/solicitacoes/anexos', downloadAnexos);
router.get('/tipos-classes', listarTiposClasses);
router.get('/operacoes', listarOperacoes);
router.get('/usuarios/grupos', listarUsuariosGrupos);
router.get('/solicitacoes/itens', listarItensSolicitacoes);
router.get('/cotacoes', buscarCotacao);
router.post('/cotacoes', inserirCotacao);
router.post('/cotacoes/excluir', excluirCotacao);
router.put('/compras', atualizarCompra);

module.exports = router;
