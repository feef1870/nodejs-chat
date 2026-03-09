const express = require('express'); //import express framework
const path = require('path'); //moduł do pracy z ścieżkami
const session = require('express-session'); //moduł to tworzenia sessji
const http = require('http'); //moduł http
const { Server } = require('socket.io'); //klasa do tworzenia serwera socket.io
const db = require('./src/config/database'); //podłączamy db
const initChatSocket = require('./src/sockets/chatSocket'); //importujemy funkcje z chatSocket.js

const authRoutes = require('./src/routes/auth'); //Importujemy plik z trasami auth
const chatRoutes = require('./src/routes/chat'); //Importujemy plik z trasami chat

const app = express(); //Główna aplikacja Express
const server = http.createServer(app); //Serwer HTTP oparty na naszej aplikacji
const io = new Server(server); //Tworzymy serwer Sockrt.io
const sessionMiddleware = session({ //Tworzymy sesję
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
});



app.set('view engine', 'ejs'); //Ustawiamy silnik szablonów na ejs
app.set('views', path.join(__dirname, 'src', 'views')); //Folder gdzie leżą pliki ejs
app.use(express.static(path.join(__dirname, 'src', 'public'))); //Pozwalamy przeglądarce brać pliki z public
app.use(express.urlencoded({extended: true})); //Pozwala serwerowi odczytywać dane przesłane w formularzach HTML (req.body)
app.use(sessionMiddleware); //Włączamy obsługę sesji dla zwykłych stron HTTP

app.use('/auth', authRoutes); //Podłączamy trasy autoryzacji pod adres /auth

app.use('/chat', chatRoutes(io)); //Podłączamy trasy czatu. Przekazujemy 'io' aby móc wysyłać wiadomości do czatu z poziomu zwykłych zapytań HTTP

//Przekierowanie na czat
app.get('/', (req, res) => {
    res.redirect('/chat/chat');
});


initChatSocket(io, sessionMiddleware); //Uruchamiamy logikę socketów z pliku chatSocket.js (nasłuchiwanie i wysyłanie zdarzeń)

//Uruchamiamy serwer na porcie 3000
server.listen(3000, '0.0.0.0', () => {
    console.log("http://localhost:3000");
});




























