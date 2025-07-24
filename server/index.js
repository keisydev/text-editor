const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

//Inicializa o aplicativo Express e o servidor HTTP
const app = express();
const server = http.createServer(app);

// Configura o Socket.IO com a configuração de CORS
const io = socketIo(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// Define a porta do servidor.
//    process.env.PORT é usado em ambientes de produção (Render).
//    A porta 4000 é a padrão para o desenvolvimento local.
const PORT = process.env.PORT || 4000;

// Adiciona uma rota GET para a URL raiz.
app.get('/', (req, res) => {
  console.log('GET / request received');
  res.send('Servidor do Editor de Texto Colaborativo funcionando!');
});

//Estado do servidor: um objeto para gerenciar múltiplas salas.
let roomsState = {};

// Configura a conexão do Socket.IO
io.on('connection', (socket) => {
    console.log(`[Socket.IO] Novo cliente conectado! ID: ${socket.id}`);
    
    // Ouve o evento de um cliente para entrar em uma sala
    socket.on('join_room', (roomId) => {
      socket.join(roomId); // Faz o socket entrar na sala
      console.log(`[Socket.IO] Cliente ${socket.id} entrou na sala: ${roomId}`);
      
      // Inicializa a sala se ela não existir
      if (!roomsState[roomId]) {
          // O estado inicial do texto para o Quill é um Delta vazio com um caractere de nova linha
          roomsState[roomId] = { text: { ops: [{ insert: '\n' }] }, charCount: 0 }; 
          console.log(`[Room State] Sala ${roomId} inicializada.`);
      }
      
      // Envia o estado ATUAL (Delta) da sala para o cliente que acabou de entrar
      console.log(`[Socket.IO] Enviando estado inicial (Delta) para ${socket.id} na sala ${roomId}:`, JSON.stringify(roomsState[roomId].text).substring(0, 50));
      socket.emit('receive_message', roomsState[roomId].text);
      socket.emit('update_char_count', roomsState[roomId].charCount);
    });

    // Ouve o evento de um cliente para sair de uma sala
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`[Socket.IO] Cliente ${socket.id} saiu da sala: ${roomId}`);
    });

    // Ouve as mensagens de texto (Deltas) de um cliente
    socket.on('send_message', (delta, roomId) => { 
        // Log da mensagem Delta recebida
        console.log(`[Socket.IO] Delta recebido de ${socket.id} na sala ${roomId}:`, JSON.stringify(delta).substring(0, 50));
        roomsState[roomId].text = delta; // Armazena o Delta
        
        // Retransmite o DELTA para TODOS os clientes na mesma sala, EXCETO o remetente
        console.log(`[Socket.IO] Retransmitindo Delta para sala ${roomId}:`, JSON.stringify(roomsState[roomId].text).substring(0, 50));
        socket.to(roomId).emit('receive_message', roomsState[roomId].text);
    });

    // Ouve a contagem de caracteres de um cliente
    socket.on('send_char_count', (count, roomId) => {
        console.log(`[Socket.IO] Contagem recebida de ${socket.id} na sala ${roomId}: ${count}`);
        roomsState[roomId].charCount = count;
        
        // Retransmite a nova contagem para TODOS os clientes na mesma sala, EXCETO o remetente
        socket.to(roomId).emit('update_char_count', roomsState[roomId].charCount);
    });

    // Ouve a desconexão de um cliente
    socket.on('disconnect', () => {
        console.log(`[Socket.IO] Cliente desconectado. ID: ${socket.id}`);
    });

    // Log para erros do Socket.IO
    socket.on('error', (error) => {
        console.error(`[Socket.IO Error] Erro no socket ${socket.id}:`, error);
    });
});

// Inicia o servidor para ouvir na porta configurada.
server.listen(PORT, () => {
    console.log(`[Server] Servidor rodando na porta ${PORT}`);
});