// client/src/components/CreateQuillModal.jsx
import React, { useState } from 'react';
import './CreateQuillModal.css'; 

const CreateQuillModal = ({ onClose, onCreate }) => {
  const [quillName, setQuillName] = useState('');
  const [duration, setDuration] = useState('um mês'); 
  const [generatedLink, setGeneratedLink] = useState(''); 
  const [error, setError] = useState(''); 
  const [loadingSuggestion, setLoadingSuggestion] = useState(false); 

  const handleCreate = async () => { 
    setError(''); 
    if (quillName.trim() === '') {
      setError('Por favor, digite um nome para o Quill.');
      return;
    }

    const result = await onCreate(quillName); 

    if (result && result.error) {
      setError(result.error); 
      setGeneratedLink(''); // Garante que a tela de link não apareça no erro
    } else if (result && result.success && result.link) { // *** MUDANÇA AQUI: Verifica 'result.link' ***
      setGeneratedLink(result.link); // <<-- Usa o link retornado pela Home
      // Nao chama onClose aqui ainda, permite que o usuario veja o link
    }
  };

  const handleAccessQuill = () => {
      window.open(generatedLink, '_blank'); 
      onClose(); // Fecha o modal depois de abrir a aba
  };

  const handleCopyLink = () => {
      navigator.clipboard.writeText(generatedLink);
      alert('Link copiado para a área de transferência!'); 
  };

  const handleSuggestName = async () => {
    setLoadingSuggestion(true);
    setError(''); 
    const renderApiBaseUrl = 'https://text-editor-j60f.onrender.com'; 
    try {
        const response = await fetch(`${renderApiBaseUrl}/api/suggest-room-name/${quillName.trim() || 'novo-quill'}`);
        const data = await response.json();
        if (data.suggestedName) {
            setQuillName(data.suggestedName); 
            setError('Nome sugerido. Tente criar novamente.'); 
            setGeneratedLink(''); // Garante que não esteja mostrando um link antigo
        } else {
            setError('Não foi possível gerar uma sugestão de nome.');
        }
    } catch (apiError) {
        console.error("Erro ao sugerir nome:", apiError);
        setError("Erro ao sugerir nome. Verifique a conexão.");
    } finally {
        setLoadingSuggestion(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {!generatedLink ? ( 
          <>
            <h2>Criar um novo Quill</h2>
            <div className="form-group">
              <label>Nome do Quill</label>
              <input
                type="text"
                placeholder="Nome único"
                value={quillName}
                onChange={(e) => { setQuillName(e.target.value); setError(''); }} 
              />
            </div>
            <div className="form-group">
              <label>Duração do Quill</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option value="um mês">Um Mês</option>
                <option value="uma semana">Uma Semana</option>
                <option value="um dia">Um Dia</option>
              </select>
            </div>
            {error && <p className="error-message">{error}</p>} 
            <div className="modal-actions">
              <button onClick={onClose}>Cancelar</button>
              {/* O botão de sugestão aparece se houver erro E o erro contiver a frase específica */}
              {error && error.includes('já existe') && ( 
                <button onClick={handleSuggestName} disabled={loadingSuggestion}>
                  {loadingSuggestion ? 'Sugerindo...' : 'Sugerir Nome'}
                </button>
              )}
              <button onClick={handleCreate} disabled={loadingSuggestion}>Criar</button>
            </div>
          </>
        ) : ( 
          <>
            <h2>Quill Criado!</h2>
            <p>Seu Quill está pronto para ser compartilhado:</p>
            <div className="form-group link-display">
                <input type="text" value={generatedLink} readOnly />
                <button onClick={handleCopyLink} className="copy-button">Copiar</button>
            </div>
            <div className="modal-actions">
              <button onClick={onClose}>Fechar</button>
              <button onClick={handleAccessQuill}>Acessar Quill</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateQuillModal;