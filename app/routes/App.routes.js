const express = require('express');
const router = express.Router();
const {listarFornecedores} = require('../controllers/Fornecedores.controller');
const {listarSolicitacoes, buscarSolicitacaoPorId, atualizarSolicitacao} = require('../controllers/Solicitacao.controller');
const {listarTiposClasses} = require('../controllers/TipoClasses.controller');
const {listarOperacoes} = require('../controllers/Operacoes.controller');
const {listarUsuariosGrupos} = require("../controllers/UsuariosGrupos.controller");

router.get('/fornecedores', listarFornecedores);
router.get('/solicitacoes', listarSolicitacoes);
router.put('/solicitacoes', atualizarSolicitacao);
router.get('/solicitacoes/:filial/:numero', buscarSolicitacaoPorId);
router.get('/tipos-classes', listarTiposClasses);
router.get('/operacoes', listarOperacoes);
router.get('/usuarios/grupos', listarUsuariosGrupos);

module.exports = router;
