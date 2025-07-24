# MyQuill - Editor de Texto Colaborativo em Tempo Real

<br>

![Badge de Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-blue)
![Badge de Tecnologia](https://img.shields.io/badge/Tecnologia-React%20%7C%20Node.js%20%7C%20Socket.IO%20%7C%20Quill.js-orange)
![Badge de Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages%20%7C%20Render-blue)

---

## 🔗 Links do Projeto

-   **Aplicação Online:** [Acesse o MyQuill Aqui](https://keisydev.github.io/text-editor)
-   **API (Back-end):** [Status da API](https://text-editor-j60f.onrender.com)

---

## 🚀 Sobre o Projeto

Este projeto é um editor de texto colaborativo inspirado em ferramentas como o Framapad e o Google Docs. Seu principal objetivo é permitir que múltiplos usuários editem o mesmo documento em tempo real, com todas as alterações e formatações sendo instantaneamente sincronizadas entre os participantes.

O "MyQuill" foi desenvolvido como um projeto de portfólio para demonstrar habilidades avançadas em programação **Full-Stack**, comunicação em tempo real e construção de interfaces interativas.

## ✨ Tecnologias Utilizadas

* **Front-end:**
    * **React:** Biblioteca JavaScript robusta para construir interfaces de usuário dinâmicas.
    * **Vite:** Ferramenta de build extremamente rápida, proporcionando um ambiente de desenvolvimento ágil.
    * **React Router DOM:** Para gerenciar o roteamento entre as diferentes páginas da aplicação.
    * **Quill.js:** Editor de texto rico de alto desempenho, utilizado para a edição e formatação avançada do conteúdo.
    * **gh-pages:** Biblioteca para automatizar o processo de deploy da aplicação front-end no GitHub Pages.
    * **Socket.IO-client:** Biblioteca para estabelecer e gerenciar a comunicação em tempo real com o servidor.

* **Back-end:**
    * **Node.js:** Ambiente de execução JavaScript para o servidor.
    * **Express:** Framework web minimalista e flexível para construir a API.
    * **Socket.IO:** Biblioteca para habilitar a comunicação bidirecional em tempo real (WebSockets) entre o servidor e os clientes.
    * **Quill-Delta:** Biblioteca utilizada no servidor para manipular e compor os objetos Delta do Quill.js, garantindo a sincronização correta das edições.

* **Deploy:**
    * **GitHub Pages:** Hospeda a aplicação front-end estática, sendo ideal para demonstrar o projeto publicamente.
    * **Render:** Hospeda o serviço de back-end em Node.js, fornecendo a infraestrutura necessária para o funcionamento contínuo do Socket.IO.

## 🛠️ Funcionalidades Implementadas

-   **Edição Colaborativa em Tempo Real:** Múltiplos usuários podem digitar e formatar o texto simultaneamente, com as alterações aparecendo instantaneamente para todos.
-   **Criação de Quills (Salas Dinâmicas):** Os usuários podem criar novos documentos colaborativos com nomes únicos, gerando um link compartilhável para acesso direto à sala.
-   **Editor de Texto Rico (Rich Text Editor):** Suporte a formatação de texto (negrito, itálico, listas, etc.) através da integração do Quill.js.
-   **Contagem de Caracteres em Tempo Real:** Exibição dinâmica do número de caracteres do documento.
-   **Arquitetura Cliente-Servidor:** Demonstração completa da integração entre um front-end moderno (React) e um back-end (Node.js) para funcionalidades em tempo real.
-   **Deploy Integrado e Estratégico:** A aplicação é publicada utilizando diferentes plataformas (GitHub Pages para o front-end estático e Render para o back-end com WebSockets), refletindo uma prática robusta e eficiente para a hospedagem de aplicações completas.

## ⚙️ Como Rodar o Projeto Localmente

Para testar este projeto em sua máquina, siga os passos abaixo:

### Pré-requisitos
Certifique-se de ter o **Node.js** e o **npm** instalados.

### 1. Clone o Repositório
Abra seu terminal e execute:
```bash
git clone [https://github.com/keisydev/text-editor.git](https://github.com/keisydev/text-editor.git)
cd text-editor