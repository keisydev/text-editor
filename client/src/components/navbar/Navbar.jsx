// client/src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/editor">Editor</Link>
      <Link to="/sobre">Sobre</Link>
    </nav>
  );
};

export default Navbar;