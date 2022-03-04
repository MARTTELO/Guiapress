const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");
const session = require('express-session')
const categoriesController = require('./categories/CategoriesController');
const articlesController = require('./articles/ArticlesController')
const usersController = require('./user/UserController')
const Category = require('./categories/Category');
const Article = require("./articles/Article");
const User = require('./user/User.js')
const port = 4001;


//SESSOES

app.use(session({
    secret: 'hjkhjjhkhkhkjgfdrsrytyui',
    cookie: {maxAge: 600000}
}))




//CONECTANDO NO BANCO
connection
    .authenticate()
    .then(() => {
        console.log('Conexao feita com sucesso')
    }).catch((msgError) => {
        console.log(msgError)
    });

//DEFININDO USES E VIEW ENGINE

app.set('view engine', 'ejs'); // dizendo pro express usar o ejs como view engine(renderizador de HTML)
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', categoriesController);
app.use('/', articlesController);
app.use('/', usersController);


//ROTAS

app.get('/', (req, res) => {
    Article.findAll({
        order: [
            ['id', 'DESC']
        ], limit: 4
    }).then(articles => {
        Category.findAll().then(categories => {
            res.render("index", { articles: articles, categories: categories });
        });
    });
})

app.get('/:slug', (req, res) => {
    var slug = req.params.slug
    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        if (article !== undefined) {
            Category.findAll().then(categories => {
                res.render("article", { article: article, categories: categories });
            })
        } else {
            res.redirect('/')
        }
    }).catch(err => {
        res.send(err);
        res.redirect('/')
    })
})

app.get('/category/:slug', (req, res) => {
    var slug = req.params.slug
    Category.findOne({
        where: {
            slug: slug
        },
        include: [{ model: Article }]
    }).then(category => {
        if (category !== undefined) {
            Category.findAll().then(categories => {
                res.render('index', { articles: category.articles, categories: categories });
            })
        } else {
            res.redirect('/')
        }
    }).catch((err) => {
        res.send(err.message)
        res.redirect('/')
    })
})

app.listen(port, () => {
    console.log('o servidor está rodando')
})