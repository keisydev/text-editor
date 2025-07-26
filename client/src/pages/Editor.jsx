import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom'; 
import io from 'socket.io-client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import '../App.css'; 
import './Editor.css'; 
import Delta from 'quill-delta'; 
import Quill from 'quill';

import jsPDF from 'jspdf'; 
import html2canvas from 'html2canvas'; 

const socket = io('https://text-editor-j60f.onrender.com'); 


function Editor() {
  const { id } = useParams(); // Pega o ID da sala da URL
  
  const [charCount, setCharCount] = useState(0); 
  const quillRef = useRef(null); 
  const socketRef = useRef(null); 
  const [quillInitialized, setQuillInitialized] = useState(false); 

  // useEffect para configurar o Socket.IO e listeners
  useEffect(() => {
    const currentSocket = io('https://text-editor-j60f.onrender.com'); 
    socketRef.current = currentSocket; 

    console.log(`[Frontend] Tentando conectar e entrar na sala: ${id}`);
    currentSocket.emit('join_room', id);

    const handleInitialDocument = (initialDelta) => {
      console.log(`[Frontend][INITIAL] Conteúdo inicial recebido:`, initialDelta);
      if (quillRef.current && initialDelta && typeof initialDelta === 'object' && initialDelta.ops) {
        const editor = quillRef.current.getEditor();
        editor.setContents(new Delta(initialDelta), 'silent'); 
        setCharCount(editor.getText().trim().length);
        console.log(`[Frontend][INITIAL] Conteúdo inicial aplicado.`);
      } else {
        console.error('[Frontend][INITIAL] Conteúdo inicial inválido ou quillRef não disponível:', initialDelta);
      }
    };

    const handleTextChange = (deltaChange) => { 
      console.log(`[Frontend][CHANGE] Mudança Delta incremental recebida:`, deltaChange);
      if (quillRef.current && deltaChange && typeof deltaChange === 'object' && deltaChange.ops) {
        const editor = quillRef.current.getEditor();
        editor.updateContents(new Delta(deltaChange), 'silent'); 
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

    return () => {
      console.log(`[Frontend] Limpando listeners e desconectando para sala: ${id}`);
      currentSocket.off('initial_document', handleInitialDocument);
      currentSocket.off('text_change', handleTextChange);
      currentSocket.off('update_char_count', handleUpdateCharCount);
      currentSocket.emit('leave_room', id); 
      currentSocket.disconnect(); 
    };
  }, [id]); 

  // useEffect para inicializar o Quill (roda apenas se houver ID e não inicializado)
  useEffect(() => {
    if (quillRef.current && !quillInitialized) {
      const editor = quillRef.current.getEditor();
      editor.setContents(new Delta([{ insert: '\n' }]), 'silent'); 
      setCharCount(0);
      setQuillInitialized(true); 
      console.log("[Frontend] Quill inicializado no DOM.");
    }
    
  }, [quillInitialized]); 


  const handleQuillChange = ( delta, source) => {
    // Não precisa mais do `!id` aqui, pois o componente só roda com ID
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

  // Função para exportar para PDF (agora simplificada sem a verificação 'id')
  const exportToPdf = () => {
    if (quillRef.current) {
      const editorElement = quillRef.current.editor.scroll.domNode; 
      
      html2canvas(editorElement, {
        scale: 2, 
        useCORS: true 
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4'); 

        const imgWidth = pdf.internal.pageSize.getWidth(); 
        const imgHeight = (canvas.height * imgWidth) / canvas.width; 

        let heightLeft = imgHeight;
        let position = 0; 

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();

        while (heightLeft >= -1) { 
          position = heightLeft - imgHeight; 
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdf.internal.pageSize.getHeight();
        }
        
        pdf.save(`${id}.pdf`); 
      }).catch(error => {
        console.error("Erro ao gerar PDF:", error);
        alert("Erro ao gerar PDF. Verifique o console.");
      });
    } else {
      alert("Editor não está pronto para exportar.");
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
            [{ 'header': [1, 2, false] }], // Títulos (H1, H2, Normal)
            // Seletores de Fonte 
            [{ 'font': [] }],

            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            [{ 'color': [] }, { 'background': [] }],
            ['clean'] // Remover formatação
          ],
        }}
      />
      <div className="editor-statusbar">
        <span>Caracteres: {charCount}</span>
      </div>
      <div className='button'><button onClick={exportToPdf} className="export-button">Exportar para PDF</button> {/* Botão de exportar */}</div>
    </div>
  );
}

export default Editor;