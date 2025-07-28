import React, { useState } from 'react';
import './CreateQuillModal.css'; 

const CreateQuillModal = ({ onClose, onCreate }) => {
  const [quillName, setQuillName] = useState('');
  const [duration, setDuration] = useState('um mês'); 
  const [generatedLink, setGeneratedLink] = useState(''); 
  const [error, setError] = useState(''); // Novo estado para mensagens de erro no modal
  const [loadingSuggestion, setLoadingSuggestion] = useState(false); // Declaração correta do estado

  const handleCreate = async () => { 
    setError(''); // Limpa erros anteriores
    if (quillName.trim() === '') {
      setError('Por favor, digite um nome para o Quill.');
      return;
    }

    // Chama a função onCreate (que agora verifica no back-end)
    const result = await onCreate(quillName); // Espera o resultado da Promise

    if (result && result.error) {
      setError(result.error); // Exibe o erro vindo da Home
    } else if (result && result.success) {
      // Se a criação foi um sucesso e já redirecionou, podemos apenas fechar o modal ou deixá-lo no estado de link gerado
      // Como o handleCreateQuill na Home já abre a aba e fecha o modal,
      // podemos apenas gerar o link aqui se quisermos que ele continue no modal
      const baseUrl = window.location.origin + '/text-editor'; 
      const link = `${baseUrl}/#/edicao/${quillName}`; // <<-- Use '/edicao/' conforme suas rotas
      setGeneratedLink(link); // Armazena o link para exibição
      // Não fecha o modal aqui, permite que o usuário veja o link ou acesse.
    }
  };

  const handleAccessQuill = () => {
      window.open(generatedLink, '_blank'); 
      onClose(); 
  };

  const handleCopyLink = () => {
      navigator.clipboard.writeText(generatedLink);
      alert('Link copiado para a área de transferência!'); 
  };

  // Sugerir nome 
  const handleSuggestName = async () => {
    setLoadingSuggestion(true); // <<-- Usando o nome correto aqui
    setError(''); // Limpa o erro ao tentar sugerir
    const renderApiBaseUrl = 'https://text-editor-j60f.onrender.com'; // Sua URL base do Render
    try {
        const response = await fetch(`${renderApiBaseUrl}/api/suggest-room-name/${quillName.trim() || 'novo-quill'}`);
        const data = await response.json();
        if (data.suggestedName) {
            setQuillName(data.suggestedName); // Atualiza o input com o nome sugerido
            setError('Nome sugerido. Tente criar novamente.'); // Informa o usuário
        } else {
            setError('Não foi possível gerar uma sugestão de nome.');
        }
    } catch (apiError) {
        console.error("Erro ao sugerir nome:", apiError);
        setError("Erro ao sugerir nome. Verifique a conexão.");
    } finally {
        setLoadingSuggestion(false); // <<-- Usando o nome correto aqui
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
                onChange={(e) => { setQuillName(e.target.value); setError(''); }} // Limpa erro ao digitar
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
              {error.includes('já existe') && ( // Mostra o botão de sugestão apenas se o erro for de nome existente
                // *** CORREÇÃO FINAL AQUI: loadingSuggestion ***
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