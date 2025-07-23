# Editor de Texto Colaborativo em Tempo Real

<br>

![Badge de Status](https://img.shields.io/badge/Status-Online-green)
![Badge de Tecnologia](https://img.shields.io/badge/Tecnologia-React%20%7C%20Node.js%20%7C%20Socket.IO-orange)
![Badge de Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages%20%7C%20Render-blue)

---

## 🔗 Links do Projeto

-   **Aplicação Online:** [Acesse o Editor Aqui](https://keisydev.github.io/text-editor)
-   **API (Back-end):** [Status da API](https://text-editor-j60f.onrender.com)

---

## 🚀 Sobre o Projeto

Este projeto é um editor de texto colaborativo simples, inspirado em ferramentas como o Google Docs. O objetivo principal é permitir que múltiplos usuários editem o mesmo documento em tempo real, com as alterações de um usuário sendo instantaneamente refletidas para os outros.

O editor foi construído como um projeto de portfólio para demonstrar habilidades em programação **Full-Stack** e comunicação em tempo real.

## ✨ Tecnologias Utilizadas

* **Front-end:**
    * **React:** Biblioteca JavaScript para construir a interface de usuário.
    * **Vite:** Ferramenta de build extremamente rápida para o ambiente de desenvolvimento.
    * **gh-pages:** Biblioteca para automatizar o deploy no GitHub Pages.
* **Back-end:**
    * **Node.js:** Ambiente de execução JavaScript.
    * **Express:** Framework para criar e gerenciar o servidor.
    * **Socket.IO:** Biblioteca para implementar WebSockets e comunicação em tempo real.
* **Deploy:**
    * **GitHub Pages:** Hospeda o front-end estático da aplicação.
    * **Render:** Hospeda o back-end em Node.js, permitindo a comunicação em tempo real.

## 🛠️ Funcionalidades

-   **Edição em Tempo Real:** O texto digitado por um usuário é instantaneamente sincronizado e visível para todos os outros usuários conectados.
-   **Arquitetura Cliente-Servidor:** Demonstra a integração de um front-end React com um back-end Node.js.
-   **Deploy Integrado:** O projeto é publicado em plataformas separadas, uma para o front-end estático e outra para o servidor de API, o que é uma prática comum e robusta de produção.

## ⚙️ Como Rodar o Projeto Localmente

Para rodar este projeto em sua máquina, siga os passos abaixo:

### Pré-requisitos
Certifique-se de ter o **Node.js** e o **npm** instalados.

### 1. Clone o Repositório
```bash
git clone [https://github.com/keisydev/editor-colaborativo.git](https://github.com/keisydev/editor-colaborativo.git)
cd editor-colaborativo

### Configurar e iniciar o Back-end
cd server
npm install
node index.js

### Configurar e iniciar o Front-end
cd client
npm install
npm run dev