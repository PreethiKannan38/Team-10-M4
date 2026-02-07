# Design Deck - Collaborative Digital Canvas

A real-time collaborative digital canvas that allows multiple users to draw, brainstorm, and interact on a shared workspace using WebSockets and CRDT-based synchronization.

## 🚀 New Features (v1.1)

- **Landing Page**: Modern, minimal entry point with a clear onboarding flow.
- **Advanced Dashboard**:
  - **Search Bar**: Quickly find your workspaces.
  - **Delete Workspaces**: Full control for owners to manage their projects.
  - **View Modes**: Toggle between Grid and List views for better organization.
  - **Improved UI**: Beautiful cards with timestamps and collaborator indicators.
- **Port Conflict Fix**: Moved backend to port `5001` to avoid macOS AirPlay issues.
- **Local Setup**: Pre-configured for local MongoDB for easy development.

## 🛠️ Project Structure

- `frontend/` - React-based client application.
- `Backend/` - Express server with WebSocket support and MongoDB persistence.

## 📋 Prerequisites

- **Node.js**: Installed on your system.
- **MongoDB**: Ensure MongoDB is running locally on `mongodb://localhost:27017`.

## ⚙️ Setup & Execution

### 1. Backend Setup

The backend is configured to run on port **5001**.

```bash
cd Backend
npm install
npm start
```

### 2. Frontend Setup

The frontend is configured to communicate with the backend at `http://localhost:5001`.

```bash
cd frontend
npm install
npm run dev
```

## 💡 Troubleshooting

- **Login/Registration**: Ensure the **Backend is running** in a separate terminal and your local MongoDB service is active.
- **Environment**: The `.env` file is included in the repository for immediate use.
