const express = require('express');
const router = express.Router();
const {listarFornecedores} = require('../controllers/Fornecedores.controller');
const {listarSolicitacoes, buscarSolicitacaoPorId} = require('../controllers/Solicitacao.controller');

router.get('/fornecedores', listarFornecedores);
router.get('/solicitacoes', listarSolicitacoes);
router.get('/solicitacoes/:numero', buscarSolicitacaoPorId);

module.exports = router;
