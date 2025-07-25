import { Link } from 'react-router-dom';
import './Navbar.css'

const Navbar = () => {
  return (
    <nav>
       <div className='title'>
          <img src="quill.png" alt="logo" />
          <Link to="/" className="logo">MyQuill</Link> {/* Nome do seu projeto */}
       </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/editor">Acessar Edição</Link> {/* Este link pode ser alterado para um botão de criar quill na Home */}
        <Link to="/about">Sobre</Link>
      </div>
    </nav>
  );
};

export default Navbar;