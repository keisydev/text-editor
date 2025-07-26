import{ useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateQuillModal from '../components/CreateQuillModal';
import './Home.css'

const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleCreateQuill = (quillName) => {
    setIsModalOpen(false); // Fecha o modal
    navigate(`/editor/${quillName}`); // Redireciona para o novo quill
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