// client/src/components/CreateQuillModal.jsx
import { useState } from 'react';
import './CreateQuillModal.css'; 

const CreateQuillModal = ({ onClose, onCreate }) => {
  const [quillName, setQuillName] = useState('');
  const [duration, setDuration] = useState('um mês'); // Placeholder
  const [generatedLink, setGeneratedLink] = useState(''); // Novo estado para o link

  const handleCreate = () => {
    if (quillName.trim() !== '') {
      // Gera o link ANTES de chamar onCreate
      const baseUrl = window.location.origin + '/text-editor'; // Base GitHub Pages
      const link = `${baseUrl}/editor/${quillName}`;
      setGeneratedLink(link); // Armazena o link no estado
    }
  };

  const handleAccessQuill = () => {
      onCreate(quillName); // onCreate para redirecionar
  };

  const handleCopyLink = () => {
      navigator.clipboard.writeText(generatedLink);
      alert('Link copiado para a área de transferência!'); 
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {!generatedLink ? ( // Se o link ainda não foi gerado, mostra o formulário
          <>
            <h2>Criar um novo Quill</h2>
            <div className="form-group">
              <label>Nome do Quill</label>
              <input
                type="text"
                placeholder="Nome único"
                value={quillName}
                onChange={(e) => setQuillName(e.target.value)}
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
            <div className="modal-actions">
              <button onClick={onClose}>Cancelar</button>
              <button onClick={handleCreate}>Criar</button>
            </div>
          </>
        ) : ( // Se o link já foi gerado, mostra o link e as opções
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