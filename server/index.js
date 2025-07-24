// server/index.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Delta = require('quill-delta'); // Importe Delta aqui!

// Inicializa o aplicativo Express e o servidor HTTP
const app = express();
const server = http.createServer(app);

// Configura o Socket.IO com a configuração de CORS
// Permite conexões de qualquer origem para o desenvolvimento/produção
const io = socketIo(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 4000;

// Adiciona uma rota GET para a URL raiz.
// Serve como um "health check" para o servidor.
app.get('/', (req, res) => {
  console.log('[Server] GET / request received');
  res.send('Servidor do Editor de Texto Colaborativo funcionando!');
});

// Estado do servidor: agora é um objeto para gerenciar múltiplas salas.
// O 'text' será armazenado como um objeto Delta (formato do Quill.js).
let roomsState = {};

// Configura a conexão do Socket.IO
io.on('connection', (socket) => {
    console.log(`[Socket.IO] Novo cliente conectado! ID: ${socket.id}`);
    
    // Ouve o evento de um cliente para entrar em uma sala
    socket.on('join_room', (roomId) => {
      socket.join(roomId); // Faz o socket entrar na sala
      console.log(`[Socket.IO] Cliente ${socket.id} entrou na sala: ${roomId}`);
      
      if (!roomsState[roomId]) {
          // Inicializa o texto como um Delta vazio (documento vazio no Quill)
          roomsState[roomId] = { text: new Delta([{ insert: '\n' }]), charCount: 0 }; 
          console.log(`[Room State] Sala ${roomId} inicializada com Delta vazio.`);
      }
      
      // Envia o estado ATUAL (Delta COMPLETO) da sala para o cliente que acabou de entrar
      console.log(`[Socket.IO] Enviando Delta COMPLETO (inicial) para ${socket.id} na sala ${roomId}:`, JSON.stringify(roomsState[roomId].text).substring(0, 50) + '...');
      socket.emit('initial_document', roomsState[roomId].text);
      
      // A contagem de caracteres inicial
      socket.emit('update_char_count', roomsState[roomId].charCount);
    });

    // Ouve o evento de um cliente para sair de uma sala
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`[Socket.IO] Cliente ${socket.id} saiu da sala: ${roomId}`);
    });

    // Ouve as mensagens de texto (Deltas de mudança) de um cliente
    socket.on('send_message', (deltaChange, roomId) => { 
        // Log DETALHADO do Delta de mudança recebido
        console.log(`[Socket.IO] Delta de MUDANÇA recebido de ${socket.id} na sala ${roomId}:`, JSON.stringify(deltaChange));
        
        // Aplica a mudança Delta ao estado atual do documento (Delta completo)
        // Certifica-se de que o roomsState[roomId].text é um objeto Delta antes de compor
        let currentDocumentDelta = new Delta(roomsState[roomId].text);
        currentDocumentDelta = currentDocumentDelta.compose(new Delta(deltaChange));
        roomsState[roomId].text = currentDocumentDelta; // Armazena o novo Delta completo no estado do servidor
        
        // Retransmite APENAS a MUDANÇA (deltaChange) via evento 'text_change'
        console.log(`[Socket.IO] Retransmitindo MUDANÇA Delta para sala ${roomId}:`, JSON.stringify(deltaChange).substring(0, 50) + '...');
        socket.to(roomId).emit('text_change', deltaChange); 
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

    // Opcional: Log para erros do Socket.IO
    socket.on('error', (error) => {
        console.error(`[Socket.IO Error] Erro no socket ${socket.id}:`, error);
    });
});

// Inicia o servidor para ouvir na porta configurada.
server.listen(PORT, () => {
    console.log(`[Server] Servidor rodando na porta ${PORT}`);
});