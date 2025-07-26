
import{ useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importe useNavigate
import '../App.css'; // Importa estilos globais
import './AcessarEdicao.css'; // Novo CSS para esta página

const AcessarEdicao = () => {
  const [inputRoomName, setInputRoomName] = useState('');
  const navigate = useNavigate();

  const handleAccessRoom = () => {
    if (inputRoomName.trim() !== '') {
      
      let finalRoomName = inputRoomName.trim();
      try {
        const url = new URL(finalRoomName);
        if (url.pathname.includes('/editor/')) { // Altere de /editor/ para /edicao/
          const parts = url.pathname.split('/editor/');
          if (parts.length > 1) {
            finalRoomName = parts[1]; // Pega a parte após /editor/
          }
        }
      } catch (e) {
        // Não é uma URL válida, continua com o texto puro
      }
      navigate(`/editor/${finalRoomName}`); // Redireciona para a URL da sala
    }
  };

  return (
    <div className="access-room-form app-container"> {/* Use app-container para centralizar */}
      <h1>Acessar Quill Existente</h1>
      <p>Digite o nome ou cole o link do Quill que deseja acessar para iniciar a edição colaborativa.</p>
      <input
        type="text"
        placeholder="Nome da sala ou link do Quill"
        value={inputRoomName}
        onChange={(e) => setInputRoomName(e.target.value)}
        onKeyPress={(e) => { // Permite acessar com Enter
            if (e.key === 'Enter') {
                handleAccessRoom();
            }
        }}
      />
      <button onClick={handleAccessRoom}>Acessar Sala</button>
    </div>
  );
};

export default AcessarEdicao;