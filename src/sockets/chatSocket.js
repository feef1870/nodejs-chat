const db = require('../config/database');

module.exports = function (io, sessionMiddleware) {
    io.use((socket, next) => { //Bierzemy socket
        sessionMiddleware(socket.request, {}, next); //Bierzemy socket.request i dodajemy session (teraz mamy socket.request.session)
    });

    io.on('connection', (socket) => { //Nasłuchujemy połączenia
        const session = socket.request.session;

        //Odłącz jeśli nie ma session lub uresId w session
        if (!session || !session.userId) {
            return socket.disconnect();
        }

        console.log(`${session.username} connected`);

        socket.on('sendMessage', async (data) => { //Nasłuchujemy sendMessage, otrzymujemy dane
            const text = data.text; //Z danych bierzemy text wiadomości
            const userId = session.userId; //Z session bierzemy userId
            const user = session.username; //Z session bierzemy username

            if (!userId || !text) return;

            //Wykonujemy polecenie SQL. Await używamy żeby kod nie wykonywał się dalej dopóki nie otrzymamy rezultatu polecenia
            await db.execute(
                'INSERT INTO messages (user_id, text) VALUES (?, ?)',
                [userId, text]
            );

            //Mówimy wszystkim, że mamy newMessage. mamy parametry userId, username i text
            io.emit('newMessage', {
                userId: userId,
                username: user,
                text: text
            });
        });

        //Nasłuchujemy disconnect
        socket.on('disconnect', () => {
            console.log(`${session.username} disconnected`);
        });
    });
}