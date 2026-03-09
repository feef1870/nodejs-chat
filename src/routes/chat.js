const express = require('express');
const db = require('../config/database');


module.exports = (io) => {
    const router = express.Router();

    router.get('/chat', async (req, res) => {
        if (!req.session.userId) {
            return res.redirect('/auth/login');
        }

        const [rows] = await db.execute(`
            SELECT
                messages.id,
                messages.user_id AS userId,
                users.username AS username,
                messages.text
            FROM messages
                     JOIN users ON users.id = messages.user_id
            ORDER BY messages.id ASC;
        `);

        res.render('chat', {
            username: req.session.username,
            userId: req.session.userId,
            role: req.session.role,
            messages: rows
        });
    });

    router.post('/clear', async (req, res) => {
        if (!req.session.role || req.session.role !== 'admin') {
            return res.status(403).send('Permission denied!');
        }

        await db.execute(`DELETE FROM messages`);
        io.emit('clearChat');

        res.sendStatus(200);
    });



    return router;
}

