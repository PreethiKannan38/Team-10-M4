# Design Deck - Collaborative Digital Canvas

A real-time collaborative digital canvas that allows multiple users to draw, brainstorm, and interact on a shared workspace using WebSockets and CRDT-based synchronization.

## Getting Started with DesignDeck Development

### Environment Setup

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **MongoDB**: A running instance (local or MongoDB Atlas)
- **NPM**: v9.x or higher

### 2. Backend Setup
1. Navigate to `/Backend`.
2. run `npm install`.
3. Create a `.env` file (copy from `.env.example`):
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```
4. run `npm start` (or `npm run dev` if available) to start the Express server and Yjs WebSocket provider.

### 3. Frontend Setup
1. Navigate to /frontend.
2. run `npm install`.
3. run `npm run dev`.
4. Open `http://localhost:5173` in your browser.

### Tech Stack
- **Frontend**: React, Vite, HTML5 Canvas API.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Real-time**: Yjs, y-websocket.
- **Styling**: Vanilla CSS with modern design tokens.
- **State/Auth**: JWT, LocalStorage.

### Repository Structure
```text
/Backend        --> Express server, WebSocket logic, DB models
/frontend       --> React application
  /src/Engine   --> Custom Canvas drawing engine
  /src/components -> UI components (Toolbar, Canvas, etc.)
```
