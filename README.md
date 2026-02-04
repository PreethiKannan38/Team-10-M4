# Software Engineer Project - Team 10 M4

A real-time collaborative digital canvas that allows multiple users to draw and interact on a shared workspace using WebSockets and CRDT-based synchronization.

## Project Structure

├── frontend/  # React + Vite application
└── server/    # Node.js WebSocket collaboration server

## Setup & Execution

Both the frontend and server must be running simultaneously for real-time collaboration to work.

### 1. Setup & Run Backend (Server)
The backend handles real-time collaboration using WebSockets.

```bash
cd server
npm install
node server.js
```
The server will start on `ws://localhost:1234`.

### 2. Setup & Run Frontend
The frontend is the drawing application.

```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:5173`.

## Features
- **Real-time Collaboration**: Draw with others in real-time.
- **Tools**: Pencil, Shapes, Eraser, Fill, and more.
- **Properties Panel**: Change colors, stroke width, and opacity.
- **Layers**: Manage different drawing layers.
- **Auth**: Full Login and Signup flow (available on the `main` branch).

## Notes
- Ensure **Node.js** is installed on your system.
- Open the frontend in multiple browser tabs or devices to test the collaborative features.