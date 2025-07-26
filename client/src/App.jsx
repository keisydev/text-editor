// client/src/App.jsx
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // Componente de navegação
import Home from './pages/Home';
import Editor from './pages/Editor';
import About from './pages/About';
import AcessarEdicao from './pages/AcessarEdicao';
import '../../client/src/App.css'; // Estilos globais

function App() {
  return (
    <Router> 
      <Navbar /> 
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Rota para acessar uma sala existente */}
        <Route path="/editor" element={<AcessarEdicao />} /> 
        <Route path="/editor/:id" element={<Editor />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  )
}

export default App