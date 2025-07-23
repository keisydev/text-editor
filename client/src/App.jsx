import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import './App.css'

// A URL do seu servidor.
// Se você estiver rodando em localhost, a URL é esta.
const socket = io('https://text-editor-pearl-pi.vercel.app');

function App() {
  const [text, setText] = useState('')

  useEffect(() => {
    // Escuta por uma conexão bem-sucedida
    socket.on('connect', () => {
      console.log('Conectado ao servidor! ID:', socket.id);
    });

    //Recebe o texto atualizado de outros clientes
    socket.on('receive_message', (data) => {
      setText(data)
    })

    return () => {
      socket.off('connect');
      socket.off('receive_message');
    };
  }, []); // O array vazio garante que o efeito rode apenas uma vez

  const handleTextChange = (event) => {
    const newText = event.target.value
    setText(newText) //atualiza o estado
    socket.emit('send_message', newText) //Enviar o texto para o servidor
  }



  return (
    <div className="app-container">
      <h1>Editor Colaborativo</h1>
      {/* Aqui é onde o seu textarea vai ficar */}
      <textarea
        className="editor"
        placeholder="Comece a digitar..."
        value={text}
        onChange={handleTextChange}
      />
    </div>
  )
}

export default App