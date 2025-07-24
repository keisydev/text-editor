const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

//  Inicializa o aplicativo Express e o servidor HTTP
const app = express();
const server = http.createServer(app);

// Configura o Socket.IO com a configuração de CORS
const io = socketIo(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  },
});

const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
  console.log('GET / request received'); // Log para cada requisição GET
  res.send('Servidor do Editor de Texto Colaborativo funcionando!');
});

let roomsState = {};

io.on('connection', (socket) => {
    console.log(`[Socket.IO] Novo cliente conectado! ID: ${socket.id}`);
    
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      // Log quando um cliente entra na sala
      console.log(`[Socket.IO] Cliente ${socket.id} entrou na sala: ${roomId}`);
      
      if (!roomsState[roomId]) {
          roomsState[roomId] = { text: '', charCount: 0 };
          console.log(`[Room State] Sala ${roomId} inicializada.`);
      }
      
      // Envia o estado ATUAL da sala para o cliente que acabou de entrar
      console.log(`[Socket.IO] Enviando estado inicial para ${socket.id} na sala ${roomId}: ${roomsState[roomId].text.substring(0, 20)}...`);
      socket.emit('receive_message', roomsState[roomId].text);
      socket.emit('update_char_count', roomsState[roomId].charCount);
    });

    socket.on('send_message', (data, roomId) => {
        // Log da mensagem recebida
        console.log(`[Socket.IO] Mensagem recebida de ${socket.id} na sala ${roomId}: ${data.substring(0, 50)}...`);
        roomsState[roomId].text = data;
        
        // Log do broadcast
        console.log(`[Socket.IO] Retransmitindo para sala ${roomId}: ${roomsState[roomId].text.substring(0, 50)}...`);
        socket.to(roomId).emit('receive_message', roomsState[roomId].text);
    });

    socket.on('send_char_count', (count, roomId) => {
        console.log(`[Socket.IO] Contagem recebida de ${socket.id} na sala ${roomId}: ${count}`);
        roomsState[roomId].charCount = count;
        
        socket.to(roomId).emit('update_char_count', roomsState[roomId].charCount);
    });

    socket.on('disconnect', () => {
        console.log(`[Socket.IO] Cliente desconectado. ID: ${socket.id}`);
    });

    // Opcional: Log para erros do Socket.IO
    socket.on('error', (error) => {
        console.error(`[Socket.IO Error] Erro no socket ${socket.id}:`, error);
    });
});

server.listen(PORT, () => {
    console.log(`[Server] Servidor rodando na porta ${PORT}`);
});