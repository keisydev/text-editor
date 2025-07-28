// client/src/pages/Home.jsx
import React, { useState } from 'react';
import CreateQuillModal from '../components/CreateQuillModal';
import './Home.css'

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Função que será passada para o modal, para lidar com a criação e validação
  const handleCreateQuill = async (quillName) => { 
    const renderApiBaseUrl = 'https://text-editor-j60f.onrender.com'; 
    
    try {
        const response = await fetch(`${renderApiBaseUrl}/api/room-exists/${quillName}`);
        const data = await response.json();

        if (data.exists) {
            return { error: `O Quill '${quillName}' já existe. Por favor, escolha outro nome ou acesse-o.` };
        } else {
            setIsModalOpen(false); 
            const baseUrl = window.location.origin + '/text-editor'; 
            const editorUrl = `${baseUrl}/#/edicao/${quillName}`;
            window.open(editorUrl, '_blank'); 
            return { success: true }; 
        }
    } catch (apiError) {
        console.error("Erro ao verificar existência do Quill:", apiError);
        return { error: "Não foi possível criar o Quill. Erro de rede." };
    }
  };

  return (
    <div className="home-container">
      <h1>Bem-vindo ao Quill Colaborativo!</h1>
      <p>Sua plataforma para notas e documentos em tempo real.</p>
      
      <button 
        className="create-button"
        onClick={() => setIsModalOpen(true)}
      >
        Criar um novo Quill
      </button>

      {isModalOpen && (
        <CreateQuillModal
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateQuill} 
        />
      )}
    </div>
  );
};

export default Home;