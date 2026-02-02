# Team-10-M4

A real-time collaborative digital canvas that allows multiple users to draw and interact on a shared workspace using WebSockets and CRDT-based synchronization.

## Project Structure
Design_Deck/

├── frontend/ # Client-side canvas application

└── server/ # WebSocket collaboration server

## Setup & Execution

Both the frontend and server must be running simultaneously for real-time collaboration to work.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd server
npm install
npm install y-websocket ws
node server.js
```
Notes

Ensure Node.js is installed before running the project.

Open the frontend in multiple browser tabs or devices to test collaboration.
