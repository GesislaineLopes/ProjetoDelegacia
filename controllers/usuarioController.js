const Usuario = require("../models/usuario");
const bcryptjs = require("bcryptjs");
class UsuarioController {

    static  async listar(req,res){
        const status = req.query.s;
        const usuarios  = await Usuario.find();
        res.render('usuario/relatorio', { status, usuarios });
    }

    static async cadastrar(req,res){
        res.render('usuario/cadastrar');
    }

    static async detalhar(req,res)
    {
        const id = req.params.id;
        const usuario = await Usuario.findById(id);
        if (usuario) {
            res.render('usuario/detalhar', { usuario });
        } else {
            res.status(404).send('Usuario não encontrado');
        }
    }
    static async salvarPost (req,res){
        const { nome, telefone, email, senha} = req.body;
        const salt = bcryptjs.genSaltSync();
        const hash = bcryptjs.hashSync(senha, salt);
        const novoUsuario = new Usuario({
            nome,
            telefone,
            email,
            senha: hash
        });
        const resultado = await novoUsuario.save();
        if (resultado) {
            res.redirect('/usuarios/relatorio?s=1');
        } else {
            let errorMessage = 'Erro ao cadastrar usuario.';
            res.status(400).render('usuario/cadastrar', { errorMessage });
        }
    }
    static async remover (req,res){
        const id = req.params.id;
        const resultado = await Usuario.findByIdAndDelete(id);
        if (resultado) {
            res.redirect('/usuarios/relatorio?s=2');
        } else {
            res.status(500).send('Erro ao deletar usuario');
        }
    }

    static async editar(req,res){
        const id = req.params.id;
        const usuario = await Usuario.findById(id);
        if (usuario) {
            res.render('usuario/editar', { usuario });
        } else {
            res.status(404).send('Usuário não encontrado');
        }
    }

    static async atualizar(req,res){
        const id = req.params.id;
        const { nome, telefone, email, senha } = req.body;
        const resultado = await Usuario.findByIdAndUpdate(id, {
            nome,
            telefone,
            email,
            senha
        });
        if (resultado) {
            res.redirect('/usuarios/relatorio');
        } else {
            res.status(500).send('Erro ao atualizar usuário');
        }
    }

    static loginForm(req, res) {
        res.render('usuario/login', { errorMessage: null });
    }

    static async login(req, res) {
        const { email, senha } = req.body;
        console.log('Login attempt:', email, senha);
        const usuario = await Usuario.findOne({ email });
        console.log('Usuario encontrado:', usuario);
        if (usuario) {
            if(bcryptjs.compareSync(senha, usuario.senha)){
                req.session.usuarioId = usuario._id;
                console.log('Login bem-sucedido, sessão criada');
                res.redirect('/');
            } else {
                console.log('Senha correta');
                return res.status(401).render('usuario/login', { errorMessage: ' senha ou email inválidos' });
            }
        } else {
            console.log('E-mail incorreto');
            return res.status(401).render('usuario/login', { errorMessage: 'senha ou email inválidos' });
        }
    }
    static logout(req,res){
        req.session.usuarioId = null;
        res.redirect('/');
    }
}
module.exports = UsuarioController;
