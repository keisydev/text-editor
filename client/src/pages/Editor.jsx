// client/src/pages/Editor.jsx
import  { useState, useEffect, useRef } from 'react'; 
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
  const [charCount, setCharCount] = useState(0); // Para a contagem de caracteres
  const quillRef = useRef(null); // Ref para acessar a instância do Quill diretamente

  // useEffect principal para a lógica do Socket.IO
  useEffect(() => {
    socket.emit('join_room', id);
    console.log(`[Frontend] Emitindo join_room para sala: ${id}`);

    // Recebe o conteúdo do editor do servidor
    socket.on('receive_message', (delta) => {
      if (quillRef.current) {
        const editor = quillRef.current.getEditor();
        // Aplica o delta recebido no editor
        // 'silent' para não disparar eventos locais e evitar loops infinitos
        editor.setContents(delta, 'silent'); 
      }
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
  }, [id]);

  // Função para lidar com mudanças no Quill
  // 'content' é o HTML, 'delta' é o objeto Delta, 'source' é de onde veio a mudança
  const handleQuillChange = (content, delta, source) => {
    // Atualiza o estado local apenas se a mudança veio do usuário (não do Socket.IO)
    if (source !== 'silent') {
      setText(content); 
      const currentText = quillRef.current.getEditor().getText(); // Pega o texto puro para contagem
      const newCharCount = currentText.trim().length; // Contagem sem espaços extras

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
        ref={quillRef} // Atribui a ref ao componente Quill
        theme="snow" // Tema padrão do Quill com barra de ferramentas
        value={text} // O valor do editor é controlado pelo estado 'text'
        onChange={handleQuillChange} // Função que lida com as mudanças
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