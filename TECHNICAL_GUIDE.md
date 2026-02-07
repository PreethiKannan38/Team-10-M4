# Design Deck - Technical Documentation

This document explains the architecture, functionality, and setup of the Design Deck collaborative canvas application.

---

## 1. Technology Stack

### **Frontend**
- **React.js**: Functional components with Hooks (`useState`, `useEffect`, `useRef`).
- **Tailwind CSS**: For modern, responsive, and minimal UI styling.
- **Canvas API**: The drawing engine uses the native HTML5 Canvas API for high-performance rendering.
- **Yjs (CRDT)**: Used for conflict-free real-time synchronization between multiple users.
- **Lucide React**: Premium icon set used throughout the application.
- **Axios**: For communicating with the REST API.

### **Backend**
- **Node.js & Express**: The web server and REST API handler.
- **MongoDB & Mongoose**: Database for storing users and canvas metadata.
- **y-websocket**: A specialized WebSocket provider for Yjs synchronization.
- **JWT (JSON Web Tokens)**: Used for secure user authentication.
- **Bcrypt.js**: For hashing user passwords.

---

## 2. Drawing Engine Architecture

### **How a drawing is created:**
1.  **The Trigger**: When a user interacts with the `<canvas>` element, event listeners in `CanvasEngineController.js` (`onPointerDown`, `onPointerMove`, `onPointerUp`) capture the coordinates.
2.  **The Tool**: The event is passed to the currently active tool (e.g., `DrawTool.js` or `RectangleTool.js`).
3.  **Geometry Generation**:
    - **Down**: Captures the start point.
    - **Move**: Updates the temporary geometry (width, height, or points array).
    - **Up**: Finalizes the object data.
4.  **The Command Pattern**: The finalized object is wrapped in an `AddObjectCommand`.
5.  **Synchronization**: 
    - The command calls `engine.addObject()`.
    - `addObject` pushes the data into a **Yjs Shared Map** (`yObjects`).
    - The WebSocket provider broadcasts this change to all other users in the room instantly.
6.  **Rendering**: The `render()` loop in the engine detects the change and draws the new object on the canvas for everyone.

---

## 3. Database & Persistence

### **Local Database**
Currently, the app uses a local MongoDB instance:
- **Connection**: `mongodb://localhost:27017/Canvas`
- **Models**:
    - `User`: Stores name, email, and hashed password.
    - `Canvas`: Stores workspace name, owner ID, and the binary `documentState` (the drawing data).

### **Migrating to MongoDB Atlas (Cloud)**
To make the project accessible over the internet, follow these steps:
1.  **Create an Account**: Go to [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2.  **Create a Cluster**: Follow the "Build a Database" wizard (Shared/Free tier).
3.  **Get Connection String**:
    - Click **Connect** on your cluster.
    - Choose **"Connect your application"**.
    - Copy the URI (it looks like `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/...`).
4.  **Update Environment**:
    - Open `Backend/.env`.
    - Replace the `MONGO_URI` with your new Atlas connection string.
    - Replace `<password>` with your actual database user password.
5.  **Whitelist IP**: In Atlas, go to "Network Access" and ensure your current IP (or `0.0.0.0/0` for everywhere) is whitelisted.
6.  **Restart Backend**: Run `npm start` again. The data will now be stored in the cloud.

---

## 4. Feature Details

- **Smart Eraser**: Uses a distance-based hit-testing algorithm to detect objects. At <90% strength, it splits lines into segments by removing points.
- **Text Tool**: Creates a dynamic HTML `textarea` positioned over the canvas coordinates. Upon "Enter", it converts the text into a vector object.
- **History Manager**: Maintains an Undo/Redo stack using the Command Pattern, ensuring every action can be reversed without breaking sync.
