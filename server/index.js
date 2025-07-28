const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Delta = require('quill-delta'); 
const cors = require('cors'); 

const app = express();
const server = http.createServer(app);

// APLICA O MIDDLEWARE CORS A TODAS AS ROTAS HTTP DO EXPRESS AQUI 
//Permite que seu front-end (mesmo em domínios diferentes, como localhost ou GitHub Pages)
// faça requisições GET/POST para as APIs REST do seu back-end.
app.use(cors()); 


// Configura o Socket.IO com a configuração de CORS
const io = socketIo(server, {
  cors: {
    origin: "*", // Permite qualquer origem para as conexões de WebSocket
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 4000;

// Rota principal para verificar se o servidor está online
app.get('/', (res) => {
  console.log('[Server] GET / request received');
  res.send('Servidor do Editor de Texto Colaborativo funcionando!');
});

// Endpoint para verificar se uma sala existe
// O front-end (AcessarEdicao.jsx, CreateQuillModal.jsx) vai chamar esta API
app.get('/api/room-exists/:id', (req, res) => {
    const roomId = req.params.id;
    const exists = !!roomsState[roomId]; // Converte para booleano: true se roomsState[roomId] existe, false caso contrário
    console.log(`[Server] API: Verificando se sala '${roomId}' existe. Resultado: ${exists}`);
    res.json({ exists: exists }); // Retorna um JSON com o resultado
});

// Endpoint para sugerir um nome de sala quando o desejado já existe
// O front-end (CreateQuillModal.jsx) vai chamar esta API
app.get('/api/suggest-room-name/:baseName', (req, res) => {
    let baseName = req.params.baseName;
    let suggestedName = baseName;
    let counter = 1;

    // Tenta adicionar um número ao nome base até encontrar um nome que não esteja em uso
    while (roomsState[suggestedName]) {
        suggestedName = `${baseName}-${counter}`;
        counter++;
    }
    console.log(`[Server] API: Sugerindo nome para '${baseName}'. Sugestão: '${suggestedName}'`);
    res.json({ suggestedName: suggestedName }); // Retorna um JSON com o nome sugerido
});


// Objeto para armazenar o estado dos documentos (salas)
// A chave é o ID da sala, e o valor contém o Delta completo e a contagem de caracteres
let roomsState = {}; 

// Configura os ouvintes para as conexões de Socket.IO
io.on('connection', (socket) => {
    console.log(`[Socket.IO] Novo cliente conectado! ID: ${socket.id}`);
    
    // Ouve o evento 'join_room' quando um cliente quer entrar em uma sala
    socket.on('join_room', (roomId) => {
      socket.join(roomId); // Adiciona o socket à "sala" (room) do Socket.IO
      console.log(`[Socket.IO] Cliente ${socket.id} entrou na sala: '${roomId}'`);
      
      // Se a sala não existe no roomsState, a inicializa com um Delta vazio
      if (!roomsState[roomId]) {
          roomsState[roomId] = { text: new Delta([{ insert: '\n' }]), charCount: 0 }; 
          console.log(`[Room State] Sala '${roomId}' inicializada com Delta vazio.`);
      }
      
      // Envia o estado COMPLETO do documento (Delta) para o cliente que acabou de entrar
      console.log(`[Socket.IO] Enviando Delta COMPLETO (inicial) para ${socket.id} na sala '${roomId}': ${JSON.stringify(roomsState[roomId].text).substring(0, 50)}...`);
      socket.emit('initial_document', roomsState[roomId].text);
      
      // Envia a contagem de caracteres inicial
      socket.emit('update_char_count', roomsState[roomId].charCount);
    });

    // Ouve o evento 'leave_room' quando um cliente sai de uma sala
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId); // Remove o socket da sala
      console.log(`[Socket.IO] Cliente ${socket.id} saiu da sala: '${roomId}'`);
    });

    // Ouve o evento 'send_message' (Deltas de mudança) quando um cliente digita
    socket.on('send_message', (deltaChange, roomId) => { 
        console.log(`[Socket.IO] Delta de MUDANÇA recebido de ${socket.id} na sala '${roomId}':`, JSON.stringify(deltaChange));
        
        // Aplica a mudança recebida ao estado atual do documento no servidor (composição de Deltas)
        let currentDocumentDelta = new Delta(roomsState[roomId].text);
        currentDocumentDelta = currentDocumentDelta.compose(new Delta(deltaChange));
        roomsState[roomId].text = currentDocumentDelta; // Armazena o Delta completo atualizado
        
        // Retransmite APENAS a MUDANÇA (deltaChange) para os outros clientes na mesma sala
        console.log(`[Socket.IO] Retransmitindo MUDANÇA Delta para sala '${roomId}': ${JSON.stringify(deltaChange).substring(0, 50)}...`);
        socket.to(roomId).emit('text_change', deltaChange); 
    });

    // Ouve o evento 'send_char_count' (contagem de caracteres) de um cliente
    socket.on('send_char_count', (count, roomId) => {
        console.log(`[Socket.IO] Contagem recebida de ${socket.id} na sala '${roomId}': ${count}`);
        roomsState[roomId].charCount = count;
        
        // Retransmite a nova contagem para todos os outros clientes na mesma sala
        socket.to(roomId).emit('update_char_count', roomsState[roomId].charCount);
    });

    // Ouve o evento 'disconnect' quando um cliente se desconecta do Socket.IO
    socket.on('disconnect', () => {
        console.log(`[Socket.IO] Cliente desconectado. ID: ${socket.id}`);
    });

    // Log para erros do Socket.IO (erros de comunicação)
    socket.on('error', (error) => {
        console.error(`[Socket.IO Error] Erro no socket ${socket.id}:`, error);
    });
});

// Inicia o servidor para ouvir na porta configurada.
server.listen(PORT, () => {
    console.log(`[Server] Servidor rodando na porta ${PORT}`);
});