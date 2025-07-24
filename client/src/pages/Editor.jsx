import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import io from 'socket.io-client'
import './Editor.css'

const socket = io('https://text-editor-j60f.onrender.com');

function Editor() {
    const {id} = useParams() //pega o id da url


  const [text, setText] = useState('')
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    // Escuta por uma conexão bem-sucedida
    socket.on('connect', () => {
      console.log('Conectado ao servidor! ID:', socket.id);
      socket.emit('join_room', id)
    });

    //Recebe o texto atualizado de outros clientes
    socket.on('receive_message', (data) => {
      setText(data)
    })

    socket.on('update_char_count', (count) =>{
      setCharCount(count)
    })

    return () => {
      socket.emit('leave_room', id);
      socket.off('connect')
      socket.off('receive_message');
      socket.off('update_char_count')
    };
  }, [id]); // O array vazio garante que o efeito rode apenas uma vez

  const handleTextChange = (event) => {
    const newText = event.target.value
    const newCharCount = newText.length

    setText(newText)
    setCharCount(newCharCount)

    socket.emit('send_message', newText, id)
    socket.emit('send_char_count', newCharCount, id)
  }



   return (
        <div className="editor-container">
            <div className="editor-header">
                <h1>Editor da sala: {id}</h1>
            </div>
            <textarea
                className="editor-textarea"
                // ...
            />
            <div className="editor-statusbar">
                <span>Caracteres: {charCount}</span>
            </div>
        </div>
    )
}

export default Editor