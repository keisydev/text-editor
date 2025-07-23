# Editor de Texto Colaborativo em Tempo Real

<br>

![Badge de Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-blue)
![Badge de Tecnologia](https://img.shields.io/badge/Tecnologia-JavaScript%20%7C%20React%20%7C%20Node.js-orange)

---

## 🚀 Sobre o Projeto

Este projeto é um editor de texto colaborativo simples, inspirado em ferramentas como o Google Docs. O objetivo principal é permitir que múltiplos usuários editem o mesmo documento em tempo real, com as alterações de um usuário sendo instantaneamente refletidas para os outros.

O editor foi construído como um projeto de portfólio para demonstrar habilidades em programação **Full-Stack** e comunicação em tempo real.

## ✨ Tecnologias Utilizadas

* **Front-end:**
    * **React:** Biblioteca JavaScript para construir a interface de usuário.
    * **Vite:** Ferramenta de build extremamente rápida para o ambiente de desenvolvimento.
    * **Socket.io-client:** Biblioteca para gerenciar a comunicação em tempo real com o servidor.
* **Back-end:**
    * **Node.js:** Ambiente de execução JavaScript.
    * **Express:** Framework para criar e gerenciar o servidor.
    * **Socket.io:** Biblioteca para implementar WebSockets e comunicação em tempo real.

## 🛠️ Funcionalidades Atuais

-   **Edição em Tempo Real:** O texto digitado por um usuário é instantaneamente sincronizado e visível para todos os outros usuários conectados.
-   **Arquitetura Cliente-Servidor:** Demonstra a integração de um front-end React com um back-end Node.js.

## ⚙️ Como Rodar o Projeto

Para rodar este projeto localmente, siga os passos abaixo:

### Pré-requisitos
Certifique-se de ter o **Node.js** e o **npm** instalados.

### 1. Clone o repositório
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