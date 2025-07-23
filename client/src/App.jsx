// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // Componente de navegação
import Home from './pages/Home';
import Editor from './pages/Editor';
import About from './pages/About';
import './App.css'; // Estilos globais

function App() {
  return (
    <Router basename="/editor-colaborativo"> {/* O basename é crucial para o GitHub Pages! */}
      <Navbar /> {/* A navbar aparece em todas as páginas */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor/:id" element={<Editor />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  )
}

export default App