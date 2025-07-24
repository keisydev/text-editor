import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import '../../App.css';
import './Editor.css'; 

const socket = io('https://text-editor-j60f.onrender.com');

function Editor() {
  const { id } = useParams(); // Pega o 'id' da URL
  
  const [text, setText] = useState('');
  const [charCount, setCharCount] = useState(0);

  // useEffect principal para a lógica do Socket.IO
  useEffect(() => {
    socket.emit('join_room', id);
    console.log(`[Frontend] Emitindo join_room para sala: ${id}`);


    // Ouve o evento de receber mensagem
    socket.on('receive_message', (data) => {
      console.log(`[Frontend] Mensagem recebida: ${data.substring(0, 20)}...`);
      setText(data);
    });

    // Ouve o evento de atualização da contagem de caracteres
    socket.on('update_char_count', (count) => {
      console.log(`[Frontend] Contagem de caracteres recebida: ${count}`);
      setCharCount(count);
    });

    // Limpeza: Remove os listeners quando o componente é desmontado ou ID muda
    return () => {
      console.log(`[Frontend] Limpando listeners e saindo da sala: ${id}`);
      socket.off('receive_message');
      socket.off('update_char_count');
    };
  }, [id]); // O 'id' no array de dependências garante que o efeito rode se a URL (id da sala) mudar


  const handleTextChange = (event) => {
    const newText = event.target.value;
    const newCharCount = newText.length;
    
    setText(newText); // Atualiza o estado local IMEDIATAMENTE
    setCharCount(newCharCount); // Atualiza o estado local IMEDIATAMENTE

    // Emite as mensagens com o nome da sala
    socket.emit('send_message', newText, id);
    socket.emit('send_char_count', newCharCount, id);
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h1>Editor da sala: {id}</h1>
      </div>
      <textarea
        className="editor-textarea"
        placeholder="Comece a digitar..."
        value={text} // Garante que o textarea reflita o estado 'text'
        onChange={handleTextChange}
      />
      <div className="editor-statusbar">
        <span>Caracteres: {charCount}</span>
      </div>
    </div>
  );
}

export default Editor;