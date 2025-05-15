# Mega API

API para consumo dos dados do Senior Mega

## Endpoints

### Fornecedores

* `GET /fornecedores?dataAlteracao={dataAlteracao}&cnpj={cnpj}&page={page}&limit={limit}`: lista todos os fornecedores
  com os seguintes parametros:
    + `dataAlteracao`: data de altera o dos dados do fornecedor (formato `YYYY-MM-DD HH24:MI:SSZ`)
    + `cnpj`: cnpj do fornecedor
    + `page`: n mero da p gina da lista de fornecedores (padr o: 1)
    + `limit`: quantidade de fornecedores por p gina (padr o: 10)

### Solicitações

* `GET /solicitacoes`: lista todas as solicitações com os seguintes parametros:
  + `dataAlteracao`: data de altera o dos dados do fornecedor (formato `YYYY-MM-DD HH24:MI:SSZ`)
  + `cnpj`: cnpj do fornecedor
  + `page`: n mero da p gina da lista de fornecedores (padrão: 1)
  + `limit`: quantidade de fornecedores por p gina (padrão: 10)
* `GET /solicitacoes/:id`: busca uma solicitação pelo código

### Tipos de Classes

* `GET /tipos-classes`: lista todos os tipos de classes com os seguintes parâmetros:
  + `page`: número da página da lista de tipos de classes (padrão: 1)
  + `limit`: quantidade de tipos de classes por página (padrão: 10)

### Operações

* `GET /operacoes`: lista todas as operações com os seguintes parâmetros:
  + `page`: número da página da lista de operações (padrão: 1)
  + `limit`: quantidade de operações por página (padrão: 10)

## Configuração

A configura o do projeto feita atraves de variaveis de ambiente. As variaveis de ambiente são:

A configuração pode ser feita atraves de um arquivo `.env` no diretório raiz do projeto.

* `DB_USER`: usuário do banco de dados
* `DB_PASSWORD`: senha do banco de dados
* `DB_CONNECTIONSTRING`: string de conexão do banco de dados, exemplo: `192.168.0.1:1521/SID`
* `DB_LIBDIR`: caminho para a pasta de bibliotecas do driver `oracledb`
* `SERVER_PORT`: porta do servidor


### Configuração do Instant Client

O Instant Client do Oracle precisa ser configurado para funcionar corretamente com o driver `oracledb`.

[Download Aqui](https://www.oracle.com/database/technologies/instant-client/downloads.html)


## Executar o projeto

* Node.js 16 ou superior.

Para instalar as dependências do projeto, execute o comando `npm install` no diretório do projeto.

Para executar o projeto, execute o comando `npm start` no diretório do projeto.