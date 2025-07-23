// server/index.js

// 1. Importa as bibliotecas necessárias
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// 2. Inicializa o aplicativo Express e o servidor HTTP
const app = express();
const server = http.createServer(app);

// 3. Configura o Socket.IO com a configuração de CORS
const io = socketIo(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// 4. Define a porta do servidor.
const PORT = process.env.PORT || 4000;

// 5. Adiciona uma rota GET para a URL raiz
app.get('/', (req, res) => {
  res.send('Servidor do Editor de Texto Colaborativo funcionando!');
});

// 6. Estado do servidor: agora é um objeto para gerenciar múltiplas salas
let roomsState = {};

// 7. Configura a conexão do Socket.IO
io.on('connection', (socket) => {
    console.log(`Novo cliente conectado! ID: ${socket.id}`);
    
    // Ouve o evento de um cliente para entrar em uma sala
    socket.on('join_room', (roomId) => {
      socket.join(roomId); // O socket entra na sala
      console.log(`Cliente ${socket.id} entrou na sala: ${roomId}`);
      
      // Inicializa a sala se ela não existir
      if (!roomsState[roomId]) {
          roomsState[roomId] = { text: '', charCount: 0 };
      }
      
      // Envia o estado atual da sala para o cliente que acabou de entrar
      socket.emit('receive_message', roomsState[roomId].text);
      socket.emit('update_char_count', roomsState[roomId].charCount);
    });

    // Ouve o evento de um cliente para sair de uma sala
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`Cliente ${socket.id} saiu da sala: ${roomId}`);
    });

    // Ouve as mensagens de texto de um cliente
    socket.on('send_message', (data, roomId) => {
        // Atualiza o estado global da sala
        roomsState[roomId].text = data;
        
        // Envia o novo texto para TODOS os clientes na mesma sala, EXCETO o remetente
        socket.to(roomId).emit('receive_message', roomsState[roomId].text);
    });

    // Ouve a contagem de caracteres de um cliente
    socket.on('send_char_count', (count, roomId) => {
        // Atualiza a contagem de caracteres da sala
        roomsState[roomId].charCount = count;
        
        // Envia a nova contagem para TODOS os clientes na mesma sala, EXCETO o remetente
        socket.to(roomId).emit('update_char_count', roomsState[roomId].charCount);
    });

    // Ouve a desconexão de um cliente
    socket.on('disconnect', () => {
        console.log(`Cliente desconectado. ID: ${socket.id}`);
    });
});

// 8. Inicia o servidor para ouvir na porta configurada.
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});