require('dotenv').config({ debug: true })
console.log(process.env)
const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.SERVER_PORT || 3000;

app.use(express.json({ limit: require('./app/config/app.conf').payloadLimit }));
app.use(cors({ origin: '*' }));
app.use('/api', require('./app/routes/App.routes'));

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));