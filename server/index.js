const express = require('express')
const http = require('http')
const socketIo = require('socket.io')

// Inicializa o aplicativo Express e o servidor HTTP
const app = express();
const server = http.createServer(app);

// Configura o Socket.IO com a configuração de CORS
const io = socketIo(server, {
  cors: {
    // Permite conexões de qualquer origem para o desenvolvimento
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// porta do servidor. 
const PORT = process.env.PORT || 4000

//Adiciona uma rota GET para a URL raiz. 
app.get('/', (req, res) => {
  res.send('Servidor do Editor de Texto Colaborativo funcionando!');
});

// 6. Variável para armazenar o estado do texto.
let textState = ''

// 7. Configura a conexão do Socket.IO
io.on('connection', (socket) => {
    console.log(`Novo cliente conectado! ID: ${socket.id}`)
    
    // Envia o estado atual do texto para o novo cliente
    socket.emit('receive_message', textState)

    // Ouve a mensagem de um cliente
    socket.on('send_message', (data) => {
        console.log(`Mensagem recebida de ${socket.id}: ${data.substring(0, 50)}...`)

        // Atualiza o estado global do texto
        textState = data

        // Envia o novo texto para todos os outros clientes, exceto o remetente.
        socket.broadcast.emit('receive_message', textState)
    });

    // Ouve a desconexão do cliente
    socket.on('disconnect', () => {
        console.log(`Cliente desconectado. ID: ${socket.id}`)
    })
})

// 8. Inicia o servidor para ouvir na porta configurada.
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})