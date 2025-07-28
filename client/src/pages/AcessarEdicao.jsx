// client/src/pages/AcessarEdicao.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../App.css'; 
import './AcessarEdicao.css'; 

const AcessarEdicao = () => {
  const [inputRoomName, setInputRoomName] = useState('');
  const [error, setError] = useState(''); // Novo estado para mensagens de erro
  const navigate = useNavigate();

  const handleAccessRoom = async () => { // Função agora é assíncrona
    setError(''); // Limpa mensagens de erro anteriores
    if (inputRoomName.trim() === '') {
      setError('Por favor, digite um nome ou link de Quill.');
      return;
    }

    let extractedRoomId = inputRoomName.trim(); 

    try {
      const url = new URL(extractedRoomId); 
      const possiblePaths = ['/edicao/', '/editor/']; 
      let foundId = '';

      for (const pathPrefix of possiblePaths) {
        if (url.pathname.includes(pathPrefix)) {
          foundId = url.pathname.split(pathPrefix)[1];
          break;
        }
        if (url.hash.includes(pathPrefix)) {
          foundId = url.hash.split(pathPrefix)[1];
          break;
        }
      }
      
      if (foundId) {
        extractedRoomId = foundId.split('?')[0].split('#')[0];
      } else {
        console.warn("URL colada não contém um padrão de sala conhecido. Usando o texto puro.");
      }
    } catch (e) {
      console.log("Entrada não é uma URL válida. Usando o texto como nome de sala.");
    }

    // *** MUDANÇA CRÍTICA AQUI: CHAMA O BACK-END PARA VERIFICAR ***
    const renderApiBaseUrl = 'https://text-editor-j60f.onrender.com'; // Sua URL base do Render
    try {
        const response = await fetch(`${renderApiBaseUrl}/api/room-exists/${extractedRoomId}`);
        const data = await response.json();

        if (data.exists) {
            navigate(`/edicao/${extractedRoomId}`); // Redireciona se a sala existe
        } else {
            setError(`A sala '${extractedRoomId}' não foi encontrada.`);
        }
    } catch (apiError) {
        console.error("Erro ao verificar existência da sala:", apiError);
        setError("Não foi possível verificar a sala. Digite um URL ou ID existentes.");
    }
  };

  return (
    <div className="access-room-form app-container">
      <h1>Acessar Quill Existente</h1>
      <p>Digite o nome ou cole o link completo do Quill que deseja acessar para iniciar a edição colaborativa.</p>
      <input
        type="text"
        placeholder="Nome da sala ou link do Quill"
        value={inputRoomName}
        onChange={(e) => setInputRoomName(e.target.value)}
        onKeyPress={(e) => { 
            if (e.key === 'Enter') {
                handleAccessRoom();
            }
        }}
      />
      <button onClick={handleAccessRoom}>Acessar Sala</button>
      {error && <p className="error-message">{error}</p>} {/* Exibe a mensagem de erro */}
    </div>
  );
};

export default AcessarEdicao;