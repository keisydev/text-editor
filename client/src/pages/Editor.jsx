import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import '../App.css';
import './Editor.css'; 
import Delta from 'quill-delta'; 


function Editor() {
  const { id } = useParams(); 
  const [charCount, setCharCount] = useState(0); 
  const quillRef = useRef(null); 
  const socketRef = useRef(null); 

  // useEffect principal para GERENCIAR A CONEXÃO E OS LISTENERS DO SOCKET.IO
  useEffect(() => {
    // Inicializa a conexão do socket apenas UMA VEZ por componente
    const currentSocket = io('https://text-editor-j60f.onrender.com'); 
    socketRef.current = currentSocket; // Armazena a instância na ref

    console.log(`[Frontend] Tentando conectar e entrar na sala: ${id}`);
    currentSocket.emit('join_room', id);

    const handleInitialDocument = (initialDelta) => {
      console.log(`[Frontend][INITIAL] Conteúdo recebido:`, initialDelta);
      if (initialDelta && typeof initialDelta === 'object' && initialDelta.ops) {
        if (quillRef.current) {
          const editor = quillRef.current.getEditor();
          editor.setContents(new Delta(initialDelta), 'silent'); 
          setCharCount(editor.getText().trim().length);
          console.log(`[Frontend][INITIAL] Conteúdo inicial aplicado.`);
        }
      } else {
        console.error('[Frontend][INITIAL] Conteúdo inicial inválido recebido:', initialDelta);
      }
    };

    const handleTextChange = (deltaChange) => { 
      console.log(`[Frontend][CHANGE] Mudança Delta recebida:`, deltaChange);
      if (deltaChange && typeof deltaChange === 'object' && deltaChange.ops) {
        if (quillRef.current) {
          const editor = quillRef.current.getEditor();
          editor.updateContents(new Delta(deltaChange), 'silent'); 
          console.log(`[Frontend][CHANGE] Mudança Delta aplicada.`);
        }
      } else {
        console.error('[Frontend][CHANGE] Mudança Delta inválida recebida:', deltaChange);
      }
    };

    const handleUpdateCharCount = (count) => {
      console.log(`[Frontend] Contagem de caracteres recebida: ${count}`);
      setCharCount(count);
    };

    // Adiciona os listeners à instância atual do socket
    currentSocket.on('initial_document', handleInitialDocument); 
    currentSocket.on('text_change', handleTextChange);           
    currentSocket.on('update_char_count', handleUpdateCharCount);

    // FUNÇÃO DE LIMPEZA: Desconecta e remove listeners quando o componente desmonta
    return () => {
      console.log(`[Frontend] Limpando listeners e desconectando para sala: ${id}`);
      currentSocket.off('initial_document', handleInitialDocument);
      currentSocket.off('text_change', handleTextChange);
      currentSocket.off('update_char_count', handleUpdateCharCount);
      currentSocket.emit('leave_room', id); // Avisa o servidor que está saindo da sala
      currentSocket.disconnect(); // Desconecta o socket
    };
  }, [id]); // Dependência do ID da sala


  useEffect(() => {
    if (quillRef.current) {
        const editor = quillRef.current.getEditor();
        editor.setContents(new Delta([{ insert: '\n' }]), 'silent'); 
        setCharCount(0); 
    }
  }, [id]);


  const handleQuillChange = (content, delta, source) => {
    if (source === 'user') {
      // Use socketRef.current para acessar a instância do socket
      if (socketRef.current) { 
        const editor = quillRef.current.getEditor();
        const currentText = editor.getText();
        const newCharCount = currentText.trim().length;

        setCharCount(newCharCount);

        socketRef.current.emit('send_message', delta, id); 
        socketRef.current.emit('send_char_count', newCharCount, id);
        console.log(`[Frontend] Delta ENVIADO:`, JSON.parse(JSON.stringify(delta))); // Log do Delta com JSON.parse/stringify
      } else {
        console.warn('[Frontend] Socket não disponível para enviar mensagem.');
      }
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