const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const Delta = require('quill-delta'); 
const cors = require('cors'); 
const mongoose = require('mongoose'); 

const app = express();
const server = http.createServer(app);

app.use(cors()); 

const io = socketIo(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 4000;

const MONGODB_URI = 'mongodb+srv://keisydev:pdbp0LrHrf9evyto@myquill-cluster.zwneduf.mongodb.net/?retryWrites=true&w=majority&appName=myquill-cluster'; 


// *** CONECTAR AO MONGODB ***
mongoose.connect(MONGODB_URI)
  .then(() => console.log('[MongoDB] Conectado ao MongoDB Atlas!'))
  .catch(err => console.error('[MongoDB] Erro de conexão ao MongoDB:', err));

// *** DEFINIR O SCHEMA (ESQUEMA) PARA OS DOCUMENTOS (QUILLS) ***
// Um schema define a estrutura dos documentos na sua coleção 'rooms'
const RoomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true }, // ID único da sala
    // Content armazena o Delta. 
    content: { type: Object, default: { ops: [{ insert: '\n' }] } }, 
    charCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Atualiza o campo 'updatedAt' automaticamente antes de salvar
RoomSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Cria o Modelo 'Room' a partir do schema. Ele interage com a coleção 'rooms' no BD.
const Room = mongoose.model('Room', RoomSchema);


app.get('/', (req, res) => {
  console.log('[Server] GET / request received');
  res.send('Servidor do Editor de Texto Colaborativo funcionando!');
});

// Endpoint para verificar se uma sala existe
app.get('/api/room-exists/:id', async (req, res) => { // <<-- AGORA ASYNC
    const roomId = req.params.id;
    try {
        const room = await Room.findOne({ roomId: roomId }); // Busca no BD
        const exists = !!room;
        console.log(`[Server] API: Verificando se sala '${roomId}' existe. Resultado: ${exists}`);
        res.json({ exists: exists });
    } catch (error) {
        console.error(`[Server] Erro ao verificar sala no BD: ${error}`);
        res.status(500).json({ error: 'Erro interno do servidor ao verificar sala.' });
    }
});

// Endpoint para sugerir um nome
app.get('/api/suggest-room-name/:baseName', async (req, res) => { // <<-- AGORA ASYNC
    let baseName = req.params.baseName;
    let suggestedName = baseName;
    let counter = 1;

    try {
        // Tenta encontrar o nome no BD
        while (await Room.findOne({ roomId: suggestedName })) {
            suggestedName = `${baseName}-${counter}`;
            counter++;
        }
        console.log(`[Server] API: Sugerindo nome para '${baseName}'. Sugestão: '${suggestedName}'`);
        res.json({ suggestedName: suggestedName });
    } catch (error) {
        console.error(`[Server] Erro ao sugerir nome no BD: ${error}`);
        res.status(500).json({ error: 'Erro interno do servidor ao sugerir nome.' });
    }
});


let roomsState = {}; 

io.on('connection', (socket) => {
    console.log(`[Socket.IO] Novo cliente conectado! ID: ${socket.id}`);
    
    socket.on('join_room', async (roomId) => { 
      socket.join(roomId); 
      console.log(`[Socket.IO] Cliente ${socket.id} entrou na sala: '${roomId}'`);
      
      try {
          // Busca a sala no banco de dados
          let room = await Room.findOne({ roomId: roomId });

          if (!room) {
              // Se a sala não existe no BD, cria uma nova
              console.log(`[Room State] Sala '${roomId}' não encontrada no BD. Criando nova.`);
              room = new Room({ roomId: roomId });
              await room.save(); // Salva a nova sala no BD
              console.log(`[Room State] Sala '${roomId}' criada no BD.`);
          }

          // Armazena o Delta do BD em roomsState para uso do Socket.IO
          roomsState[roomId] = { text: new Delta(room.content), charCount: room.charCount }; 
          
          // Envia o estado COMPLETO do documento para o cliente
          console.log(`[Socket.IO] Enviando Delta COMPLETO (inicial) para ${socket.id} na sala '${roomId}': ${JSON.stringify(roomsState[roomId].text).substring(0, 50)}...`);
          socket.emit('initial_document', roomsState[roomId].text);
          socket.emit('update_char_count', roomsState[roomId].charCount);

      } catch (error) {
          console.error(`[Socket.IO] Erro ao entrar ou carregar sala '${roomId}' do BD: ${error}`);
          // Emitir um erro para o cliente ou desconectar, se necessário
      }
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId); 
      console.log(`[Socket.IO] Cliente ${socket.id} saiu da sala: '${roomId}'`);
  
    });

    socket.on('send_message', async (deltaChange, roomId) => { // <<-- AGORA ASYNC
        console.log(`[Socket.IO] Delta de MUDANÇA recebido de ${socket.id} na sala '${roomId}':`, JSON.stringify(deltaChange));
        
        try {
            // Aplica a mudança ao Delta armazenado em roomsState
            let currentDocumentDelta = new Delta(roomsState[roomId].text);
            currentDocumentDelta = currentDocumentDelta.compose(new Delta(deltaChange));
            roomsState[roomId].text = currentDocumentDelta; // Atualiza o cache em memória

            //  SALVA O NOVO ESTADO COMPLETO NO BANCO DE DADOS 
            await Room.findOneAndUpdate(
                { roomId: roomId }, // Encontra o documento da sala
                { content: currentDocumentDelta.ops }, // Atualiza o conteúdo (armazenamos 'ops' array)
                { new: true, upsert: true } // Retorna o doc atualizado, cria se não existir
            );
            console.log(`[Socket.IO] Delta completo salvo no BD para sala '${roomId}'.`);

            // Retransmite APENAS a MUDANÇA (deltaChange) para os outros clientes na mesma sala
            console.log(`[Socket.IO] Retransmitindo MUDANÇA Delta para sala '${roomId}': ${JSON.stringify(deltaChange).substring(0, 50)}...`);
            socket.to(roomId).emit('text_change', deltaChange); 

        } catch (error) {
            console.error(`[Socket.IO] Erro ao aplicar mudança ou salvar no BD para sala '${roomId}': ${error}`);
        }
    });

    socket.on('send_char_count', async (count, roomId) => { 
        console.log(`[Socket.IO] Contagem recebida de ${socket.id} na sala '${roomId}': ${count}`);
        roomsState[roomId].charCount = count; // Atualiza o cache em memória

        try {
            // SALVA A NOVA CONTAGEM NO BANCO DE DADOS
            await Room.findOneAndUpdate(
                { roomId: roomId },
                { charCount: count },
                { new: true, upsert: true }
            );
        } catch (error) {
            console.error(`[Socket.IO] Erro ao salvar contagem no BD para sala '${roomId}': ${error}`);
        }
        
        socket.to(roomId).emit('update_char_count', roomsState[roomId].charCount);
    });

    socket.on('disconnect', () => {
        console.log(`[Socket.IO] Cliente desconectado. ID: ${socket.id}`);
    });

    socket.on('error', (error) => {
        console.error(`[Socket.IO Error] Erro no socket ${socket.id}:`, error);
    });
});

server.listen(PORT, () => {
    console.log(`[Server] Servidor rodando na porta ${PORT}`);
});