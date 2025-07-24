// client/src/pages/Editor.jsx
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
  const [quillInitialized, setQuillInitialized] = useState(false); // Novo estado para controlar a inicialização do Quill

  // useEffect para configurar o Socket.IO e listeners
  useEffect(() => {
    // CRÍTICO: Criar a conexão e armazenar na ref
    const currentSocket = io('https://text-editor-j60f.onrender.com'); 
    socketRef.current = currentSocket; 

    console.log(`[Frontend] Tentando conectar e entrar na sala: ${id}`);
    currentSocket.emit('join_room', id);

    // Listener para o conteúdo INICIAL COMPLETO
    const handleInitialDocument = (initialDelta) => {
      console.log(`[Frontend][INITIAL] Conteúdo inicial recebido:`, initialDelta);
      if (quillRef.current && initialDelta && typeof initialDelta === 'object' && initialDelta.ops) {
        const editor = quillRef.current.getEditor();
        editor.setContents(new Delta(initialDelta), 'silent'); // setContents para conteúdo COMPLETO
        setCharCount(editor.getText().trim().length);
        console.log(`[Frontend][INITIAL] Conteúdo inicial aplicado.`);
      } else {
        console.error('[Frontend][INITIAL] Conteúdo inicial inválido ou quillRef não disponível:', initialDelta);
      }
    };

    // Listener para MUDANÇAS INCREMENTAIS
    const handleTextChange = (deltaChange) => { 
      console.log(`[Frontend][CHANGE] Mudança Delta incremental recebida:`, deltaChange);
      if (quillRef.current && deltaChange && typeof deltaChange === 'object' && deltaChange.ops) {
        const editor = quillRef.current.getEditor();
        editor.updateContents(new Delta(deltaChange), 'silent'); // updateContents para MUDANÇAS
        setCharCount(editor.getText().trim().length); 
        console.log(`[Frontend][CHANGE] Mudança Delta aplicada.`);
      } else {
        console.error('[Frontend][CHANGE] Mudança Delta incremental inválida ou quillRef não disponível:', deltaChange);
      }
    };

    const handleUpdateCharCount = (count) => {
      console.log(`[Frontend] Contagem de caracteres recebida: ${count}`);
      setCharCount(count);
    };

    currentSocket.on('initial_document', handleInitialDocument); 
    currentSocket.on('text_change', handleTextChange);           
    currentSocket.on('update_char_count', handleUpdateCharCount);

    // Função de limpeza CRÍTICA
    return () => {
      console.log(`[Frontend] Limpando listeners e desconectando para sala: ${id}`);
      currentSocket.off('initial_document', handleInitialDocument);
      currentSocket.off('text_change', handleTextChange);
      currentSocket.off('update_char_count', handleUpdateCharCount);
      currentSocket.emit('leave_room', id); 
      currentSocket.disconnect(); // Desconecta o socket
    };
  }, [id]); 

  // Novo useEffect para inicializar o Quill e garantir que ele esteja pronto
  useEffect(() => {
    if (quillRef.current && !quillInitialized) {
      const editor = quillRef.current.getEditor();
      editor.setContents(new Delta([{ insert: '\n' }]), 'silent'); // Garante que começa limpo
      setCharCount(0);
      setQuillInitialized(true); // Marca como inicializado
      console.log("[Frontend] Quill inicializado no DOM.");
    }
  }, [quillInitialized]); // Rode uma vez quando a ref estiver pronta e o estado for falso


  const handleQuillChange = (content, delta, source) => {
    if (source === 'user') {
      if (socketRef.current && quillRef.current) { 
        const editor = quillRef.current.getEditor();
        const currentText = editor.getText();
        const newCharCount = currentText.trim().length;

        setCharCount(newCharCount);

        socketRef.current.emit('send_message', delta, id); 
        socketRef.current.emit('send_char_count', newCharCount, id);
        console.log(`[Frontend] Delta ENVIADO:`, JSON.parse(JSON.stringify(delta))); 
      } else {
        console.warn('[Frontend] Socket ou Quill não disponível para enviar mensagem.');
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