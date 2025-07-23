const express = require('express')
const http = require('http')
const socketIo = require('socket.io')

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  // Configuração para CORS (Cross-Origin Resource Sharing)
  // Essencial para que o front-end (em outra porta) possa se conectar
  cors: {
    origin: "http://localhost:5173", // A porta padrão do Vite
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 4000;

io.on('connection', (socket) => {
    console.log(`Novo cliente conectado! ID: ${socket.id}`);

    socket.on('send_message', (data) => {
        console.log(`Mensagem recebida de ${socket.id} : ${data.substring(0, 20)}...`)

        socket.broadcast.emit('receive_message', data)
    })

    socket.on('disconnect', () => {
        console.log(`Cliente desconectado. ID: ${socket.id}`);
    })
})

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
})