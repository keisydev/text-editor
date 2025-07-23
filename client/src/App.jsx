// client/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/Navbar'; // Componente de navegação
import Home from './pages/Home';
import Editor from './pages/Editor';
import About from './pages/About';
import '../../client/src/App.css'; // Estilos globais

function App() {
  return (
    <Router basename="/text-editor"> 
      <Navbar /> 
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor/:id" element={<Editor />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  )
}

export default App