import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import '../App.css';
import './Editor.css'; 

const socket = io('https://text-editor-j60f.onrender.com'); // Sua URL do Render

function Editor() {
  const { id } = useParams();
  const [text, setText] = useState(''); // Estado para o conteúdo HTML/Delta do Quill
  const [charCount, setCharCount] = useState(0); 
  const quillRef = useRef(null); 

  useEffect(() => {
    socket.emit('join_room', id);
    console.log(`[Frontend] Emitindo join_room para sala: ${id}`);

    //Ouve o evento de receber mensagem
    socket.on('receive_message', (delta) => {
      console.log(`[Frontend] Delta recebido do servidor:`, delta); // Log para ver o delta recebido
      if (quillRef.current) {
        const editor = quillRef.current.getEditor();
        // Aplica o delta recebido no editor
        // 'silent' evita loop infinito
        editor.setContents(delta, 'silent'); 
      }
    });

    // Ouve o evento de atualização da contagem de caracteres
    socket.on('update_char_count', (count) => {
      console.log(`[Frontend] Contagem de caracteres recebida: ${count}`);
      setCharCount(count);
    });

    // Limpeza dos listeners quando o componente é desmontado ou o ID da sala muda
    return () => {
      console.log(`[Frontend] Limpando listeners e saindo da sala: ${id}`);
      socket.off('receive_message');
      socket.off('update_char_count');
    };
  }, [id]); // Dependência do ID da sala

  // ENVIO: Função para lidar com mudanças no Quill
  const handleQuillChange = (content, delta, source) => {
    if (source === 'user') { 
      setText(content); // Atualiza o estado local para garantir que o Quill reflita a digitação local
      const currentText = quillRef.current.getEditor().getText(); // Pega o texto puro para contagem
      const newCharCount = currentText.trim().length; 

      setCharCount(newCharCount);

      // Emite o DELTA para o servidor
      socket.emit('send_message', delta, id); 
      socket.emit('send_char_count', newCharCount, id);
    }
  
  };

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h1>Editor da sala: {id}</h1>
      </div>
      <ReactQuill
        ref={quillRef} 
        theme="snow" 
        value={text} // O valor do editor é controlado pelo estado 'text'
        onChange={handleQuillChange} 
        modules={{
          toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            [{ 'color': [] }, { 'background': [] }],
            ['clean']
          ],
        }}
      />
      <div className="editor-statusbar">
        <span>Caracteres: {charCount}</span>
      </div>
    </div>
  );
}

export default Editor;