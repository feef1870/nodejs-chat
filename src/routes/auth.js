const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/database');




//GET register
router.get('/register', (req, res) => {
    const error = req.session.error;

    req.session.error = null;

    res.render('register', {
        error: error
    });
});


//POST register
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (password.length < 8) {
        req.session.error = "Password must be at least 8 characters";

        return res.redirect('/auth/register');
    }

    if (username.length < 3) {
        req.session.error = "Username must be at least 3 characters";

        return res.redirect('/auth/register');
    }

    if (!username || !password) {
        req.session.error = "Username or password incorrect";

        return res.redirect('/auth/register');
    }

    const hash = await bcrypt.hash(password, 10);

    try {
        await db.execute(
            'INSERT INTO users (username, password_hash) VALUES (?, ?)',
            [username, hash]
        );
        res.redirect('/auth/login');
    } catch (err) {
        req.session.error = "Username taken";
        res.redirect('/auth/register')
    }
});


//GET login
router.get('/login', (req, res) => {
    const error = req.session.error;

    req.session.error = null;

    res.render('login', {
        error: error
    });
});


//POST login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        req.session.error = "Username or password incorrect";

        return res.redirect('/auth/login');
    }

    const [rows] = await db.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
    );

    if (rows.length === 0) {
        req.session.error = "User not found";

        return res.redirect('/auth/login');
    }

    const user = rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
        req.session.error = "Wrong password";

        return res.redirect('/auth/login');
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;

    res.redirect('/chat/chat');
});

router.get('/logout', async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }

        res.clearCookie('connect.sid');
        res.redirect('/auth/login');
    });
});

module.exports = router;