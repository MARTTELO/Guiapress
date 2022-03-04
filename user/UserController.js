const express = require("express");
const User = require("./User");
const router = express.Router();
const bcrypt = require("bcryptjs");
const adminAuth = require('../middlewares/adminAuth')

//GET
router.get('/admin/users', adminAuth, (req, res) => {
    User.findAll().then(users => {
        res.render('admin/users/index', { users: users })
    })
})

router.get('/admin/users/create', adminAuth, (req, res) => {
    res.render('admin/users/create')
})


//LOGIN
router.get('/login', (req, res) => {
    res.render('admin/users/login');
})
router.get('/logout', (req, res) => {
    req.session.user = undefined;
    res.redirect('/')
})

//AUTHENTICATE
router.post('/authenticate', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    User.findOne({ where: { email: email } }).then(user => {
        if (user !== undefined) {
            var correct = bcrypt.compareSync(password, user.password);
            if (correct) {
                req.session.user = {
                    id: user.id,
                    email: user.email
                }
                res.redirect('/admin/articles')
            } else {
                res.redirect('/login')
            }
        } else {
            res.redirect('/login');
        }
    })
})

//POST
router.post('/users/create', adminAuth, (req, res) => {
    var email = req.body.email
    var password = req.body.password;
    User.findOne({ where: { email: email } }).then((user) => {
        if (user == undefined) {
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);
            User.create({ email: email, password: hash })
                .then(() => {
                    res.redirect('/admin/users')
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('admin/users')
                });
        } else {
            res.redirect('/admin/users/create')
        }

    })


})

//DELETE
router.post('/users/delete', adminAuth, (req, res) => {
    var id = req.body.id;
    if (id !== undefined) {
        if (!isNaN(id)) {
            User.destroy({
                where: {
                    id: id
                },
            }).then(() => {
                res.redirect('/admin/users')
            })
        } else {
            res.send('algo deu errado porra')
        }

    } else {
        res.redirect('/')

    }
})

//EDIT
router.get('/admin/users/edit/:id', adminAuth, (req, res) => {
    var id = req.params.id;
    if (isNaN(id)) {
        res.redirect('/admin/users');
    }
    User.findByPk(id).then(user => {
        if (user != undefined) {
            res.render('admin/users/edit', { user: user });

        } else {
            res.redirect('/admin/users');
        }
    }).catch(err => {
        console.log(err);
        res.redirect('/admin/users');
    })
});

//UPDATE
router.post('/users/update', adminAuth, (req, res) => {
    var id = req.body.id;
    var email = req.body.email;
    User.update({
        email: email,
    }, {
        where: { id: id },
    }).then(() => {
        console.log('Usuário atualizada');
        res.redirect('/admin/users');
    }).catch(err => {
        console.log(err);
    })
})

module.exports = router; 