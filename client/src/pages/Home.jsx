import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [roomName, setRoomName] = useState('');
  const navigate = useNavigate();

  const handleCreatePad = () => {
    if (roomName.trim() !== '') {
      // Redireciona o usuário para a URL do editor com o nome da sala
      navigate(`/editor/${roomName}`);
    }
  };

  return (
    <div>
      <h1>Bem-vindo ao Editor Colaborativo!</h1>
      <p>Crie um novo pad público para começar a colaborar.</p>
      <div>
        <input
          type="text"
          placeholder="Nome do novo pad"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <button onClick={handleCreatePad}>Criar Pad</button>
      </div>
    </div>
  );
};

export default Home;