import  { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import io from 'socket.io-client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import '../App.css'; 
import './Editor.css'; 
import Delta from 'quill-delta'; 

import jsPDF from 'jspdf'; 
import html2canvas from 'html2canvas'; 


const socket = io('https://text-editor-j60f.onrender.com'); 



function Editor() {
  const { id } = useParams(); 
  const navigate = useNavigate(); 
  
  const [charCount, setCharCount] = useState(0); 
  const quillRef = useRef(null); 
  const socketRef = useRef(null); 
  const [quillEditorInstanceReady, setQuillEditorInstanceReady] = useState(false); // Indica se a instância do Quill está pronta
  const [initialDeltaReceived, setInitialDeltaReceived] = useState(null); // Estado para armazenar o delta inicial recebido

  // useEffect principal para configurar o Socket.IO e seus listeners
  // Este useEffect AGORA ASSUME que 'id' sempre estará presente
  useEffect(() => {
    socketRef.current = socket; 

    console.log(`[Frontend] Tentando conectar e entrar na sala: ${id}`);
    socketRef.current.emit('join_room', id);

    const handleInitialDocument = (initialDelta) => {
      console.log(`[Frontend][INITIAL] Conteúdo inicial recebido:`, initialDelta);
      setInitialDeltaReceived(initialDelta); 
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

    // Para quando a sala é deletada pelo servidor (do backend)
    const handleRoomDeleted = () => {
        alert(`O Quill '${id}' foi deletado por outro usuário.`);
        navigate('/edicao'); // Redireciona para a página de acesso a edição
    };

    socketRef.current.on('initial_document', handleInitialDocument); 
    socketRef.current.on('text_change', handleTextChange);           
    socketRef.current.on('update_char_count', handleUpdateCharCount);
    socketRef.current.on('room_deleted', handleRoomDeleted); 

    return () => {
      console.log(`[Frontend] Limpando listeners e emitindo leave_room para sala: ${id}`);
      socketRef.current.off('initial_document', handleInitialDocument);
      socketRef.current.off('text_change', handleTextChange);
      socketRef.current.off('update_char_count', handleUpdateCharCount);
      socketRef.current.off('room_deleted', handleRoomDeleted); // Remove o listener
      socketRef.current.emit('leave_room', id); 
    };
  }, [id, navigate]); // Adicionado 'navigate' como dependência


  // useEffect para detectar quando a instância do editor Quill está pronta e inicializá-la
  useEffect(() => {
    // Só executa se a ref do Quill estiver disponível e a instância do editor Quill ainda não estiver marcada como pronta
    // E se estamos em uma sala (ID não é undefined)
    if (id && quillRef.current && quillRef.current.getEditor() && !quillEditorInstanceReady) { 
      const editor = quillRef.current.getEditor();
      editor.setContents(new Delta([{ insert: '\n' }]), 'silent'); 
      setCharCount(0);
      setQuillEditorInstanceReady(true); // Marca que a instância do editor Quill está pronta
      console.log("[Frontend] Instância do editor Quill totalmente inicializada e pronta.");
    }
  }, [id, quillRef.current, quillEditorInstanceReady]); 


  // useEffect para aplicar o Delta inicial APENAS QUANDO o Quill estiver TOTALMENTE pronto E o Delta foi recebido
  useEffect(() => {
    if (quillEditorInstanceReady && initialDeltaReceived) { 
      const editor = quillRef.current.getEditor();
      editor.setContents(new Delta(initialDeltaReceived), 'silent'); 
      setCharCount(editor.getText().trim().length);
      console.log("[Frontend] Conteúdo inicial (armazenado) aplicado ao Quill.");
      setInitialDeltaReceived(null); 
    }
  }, [initialDeltaReceived, quillEditorInstanceReady, quillRef.current]); 


  const handleQuillChange = (content, delta, source) => { // 'content' é o HTML, 'delta' a mudança, 'source' de onde veio
    if (source === 'user' && id && socketRef.current && socketRef.current.connected && quillEditorInstanceReady) { 
      if (quillRef.current) { 
        const editor = quillRef.current.getEditor();
        const currentText = editor.getText();
        const newCharCount = currentText.trim().length;

        setCharCount(newCharCount);

        socketRef.current.emit('send_message', delta, id); 
        socketRef.current.emit('send_char_count', newCharCount, id);
        console.log(`[Frontend] Delta ENVIADO:`, JSON.parse(JSON.stringify(delta))); 
      } else {
        console.warn('[Frontend] Quill (ref) não disponível para enviar mensagem.');
      }
    } else if (source === 'user' && (!socketRef.current || !socketRef.current.connected)) {
        console.warn('[Frontend] Socket não conectado para enviar mensagem.');
    }
  };

  const exportToPdf = () => {
    if (quillRef.current && quillEditorInstanceReady && id) { 
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
      alert("Editor não está pronto ou sala não selecionada para exportar.");
    }
  };

  // Deletar Quill
  const handleDeleteQuill = async () => {
      if (window.confirm(`Tem certeza que deseja deletar o Quill '${id}'? Esta ação não pode ser desfeita.`)) {
          const renderApiBaseUrl = 'https://text-editor-j60f.onrender.com'; 
          try {
              const response = await fetch(`${renderApiBaseUrl}/api/delete-room/${id}`, {
                  method: 'DELETE',
              });

              if (response.ok) {
                  alert(`O Quill '${id}' foi deletado com sucesso.`);
                  navigate('/edicao'); // Redireciona para a página de acesso a edição
              } else {
                  const errorData = await response.json();
                  alert(`Falha ao deletar o Quill: ${errorData.message || response.statusText}`);
              }
          } catch (apiError) {
              console.error("Erro ao deletar Quill:", apiError);
              alert("Erro de rede ao tentar deletar o Quill.");
          }
      }
  };


  return (
    <div className="editor-container">
      <div className="editor-header">
        <h1>Editor da sala: {id}</h1>
      </div>
      <div id="toolbar-container"></div> {/* Div para o Quill anexar a toolbar */}
      {/* O ReactQuill SEMPRE renderiza para que a ref possa ser populada e o useEffect possa detectar */}
      <ReactQuill
        ref={quillRef} 
        theme="snow" 
        onChange={handleQuillChange} 
        modules={{
          toolbar: [
            [{ 'header': [1, 2, false] }], // Títulos (H1, H2, Normal)
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
      {/* A mensagem de carregamento é exibida POR CIMA DO EDITOR se não estiver pronto */}
      {!quillEditorInstanceReady && (
        <div className="loading-overlay">
          <div className="loading-editor">Carregando editor...</div>
        </div>
      )}
      <div className="editor-statusbar">
        <span>Caracteres: {charCount}</span>
      </div>
      <div className='button'><button onClick={exportToPdf} className="export-button">Exportar para PDF</button> </div>
    </div>
  );
}

export default Editor;