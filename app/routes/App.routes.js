const express = require('express');
const router = express.Router();
const {listarFornecedores} = require('../controllers/Fornecedores.controller');
const {listarSolicitacoes, buscarSolicitacaoPorId} = require('../controllers/Solicitacao.controller');
const {listarTiposClasses} = require('../controllers/TipoClasses.controller');
const {listarOperacoes} = require('../controllers/Operacoes.controller');

router.get('/fornecedores', listarFornecedores);
router.get('/solicitacoes', listarSolicitacoes);
router.get('/solicitacoes/:numero', buscarSolicitacaoPorId);
router.get('/tipos-classes', listarTiposClasses);
router.get('/operacoes', listarOperacoes);

module.exports = router;
