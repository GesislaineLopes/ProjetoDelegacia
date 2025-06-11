
const express = require('express');
const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
const mongoose = require("mongoose");
require('dotenv/config');
const Usuario = require('./models/usuario');

//conexão com o mongoose (banco de dados)
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Conectado ao MongoDB com sucesso');
  })
  .catch((error) => {
    console.error('Erro ao conectar ao MongoDB:', error);
  });

//rotas
const policialRoutes = require('./routers/policialRoutes');
const vitimaRoutes = require('./routers/vitimaRoutes');
const ocorrenciaRoutes = require('./routers/ocorrenciaRoutes');
const usuarioRoutes = require('./routers/usuarioRoutes');
const session = require("express-session");

app.use(session({
  secret : 'ifpe',
  saveUninitialized: false,
  resave: false
}));

// Middleware para mostrar qual o usuário logado 
app.use(async (req, res, next) => {
  if (req.session && req.session.usuarioId) {
    try {
      const usuario = await Usuario.findById(req.session.usuarioId);
      if (usuario) {
        res.locals.user = usuario;
      } else {
        res.locals.user = null;
      }
    } catch (error) {
      console.error('Erro ao buscar usuário logado:', error);
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
});

//autenticação de usuario
app.get("/", async function (req, res) {
  if (req.session && req.session.usuarioId) {
    res.render("index");
  } else {
    res.redirect('/usuarios/login');
  }
});
app.use("/policiais",policialRoutes);
app.use("/",vitimaRoutes);
app.use("/",ocorrenciaRoutes);
app.use("/usuarios",usuarioRoutes);

//inicia o servidor web
app.listen(process.env.PORT, function () {
  console.log('Rodando....');
});
