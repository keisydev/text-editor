# MyQuill - Real-time Collaborative Text Editor

<br>

![Badge de Status](https://img.shields.io/badge/Status-In%20Development-blue)
![Badge de Tecnologia](https://img.shields.io/badge/Tecnologia-React%20%7C%20Node.js%20%7C%20Socket.IO%20%7C%20Quill.js-orange)
![Badge de Deploy](https://img.shields.io/badge/Deploy-GitHub%20Pages%20%7C%20Render-blue)
![Badge de Persistência](https://img.shields.io/badge/Persist%C3%AAncia-MongoDB%20Atlas-green)

---

## 🔗 Project Links

-   **Live Application:** [Access MyQuill Here](https://keisydev.github.io/text-editor)
-   **API (Back-end):** [API Status](https://text-editor-j60f.onrender.com)

---

## 🚀 About the Project

This project is a collaborative text editor inspired by tools like Framapad and Google Docs. Its main goal is to allow multiple users to edit the same document in real-time, with all changes and formatting being instantly synchronized among participants.

"MyQuill" was developed as a portfolio project to demonstrate advanced skills in **Full-Stack** programming, real-time communication, and interactive interface design.

## ✨ Technologies Used

* **Front-end:**
    * **React:** A robust JavaScript library for building dynamic user interfaces.
    * **Vite:** An extremely fast build tool, providing an agile development environment.
    * **React Router DOM:** For managing routing between the application's different pages.
    * **Quill.js:** A high-performance rich text editor used for advanced content editing and formatting.
    * **jsPDF & html2canvas:** Libraries for the document export-to-PDF functionality.
    * **gh-pages:** A library to automate the deployment process of the front-end application to GitHub Pages.
    * **Socket.IO-client:** A library to establish and manage real-time communication with the server.

* **Back-end:**
    * **Node.js:** A JavaScript runtime environment for the server.
    * **Express:** A minimalist and flexible web framework for building the API.
    * **Socket.IO:** A library to enable real-time bidirectional communication (WebSockets) between the server and clients.
    * **Quill-Delta:** A library used on the server to manipulate and compose Quill.js Delta objects, ensuring correct synchronization of edits.
    * **Mongoose:** A library for MongoDB object modeling, facilitating interaction with the database.
    * **Cors:** A middleware for Node.js, enabling Cross-Origin Resource Sharing for HTTP requests between different origins.

* **Database:**
    * **MongoDB Atlas:** A cloud-based NoSQL database service used to persist document data (Quills), ensuring no work is lost after the server shuts down.

* **Deployment:**
    * **GitHub Pages:** Hosts the static front-end application, making it ideal for public project demonstrations.
    * **Render:** Hosts the Node.js back-end service, providing the necessary infrastructure for continuous Socket.IO operation and communication with MongoDB.

## 🛠️ Implemented Features

-   **Real-time Collaborative Editing:** Multiple users can type and format text simultaneously, with changes appearing instantly for everyone.
-   **Rich Text Editor (Quill.js):** Support for text formatting (bold, italics, lists, colors, etc.) through Quill.js integration.
-   **Real-time Character Count:** Dynamic display of the number of characters in the document.
-   **Data Persistence:** Documents are saved to and loaded from a MongoDB database, ensuring work is not lost.
-   **Quill Creation (Dynamic Rooms):** Users can create new collaborative documents with unique names.
    -   **Shareable Link Generation:** Direct links are generated for quick access and sharing of rooms.
    -   **Name Suggestion:** If a Quill name already exists, the system suggests alternative names.
-   **Access Existing Quills:** A dedicated page for accessing pre-created rooms, with existence validation.
-   **Export to PDF:** Ability to export the editor's content as a downloadable PDF file.
-   **Quill Deletion:** The user can delete an existing document, permanently removing it from the system.
-   **Client-Server Architecture:** A complete demonstration of the integration between a modern front-end (React) and a back-end (Node.js) for real-time functionalities.
-   **Strategic and Integrated Deployment:** The application is deployed using different platforms (GitHub Pages for the static front-end and Render for the WebSocket back-end), reflecting a robust and efficient practice for hosting full-stack applications.

## ⚙️ How to Run the Project Locally

To test this project on your machine, follow the steps below:

### Prerequisites
Make sure you have **Node.js** and **npm** installed.

### 1. Clone the Repository
Open your terminal and run:
```bash
git clone [https://github.com/keisydev/text-editor.git](https://github.com/keisydev/text-editor.git)
cd text-editor