# Team-10-M4

A real-time collaborative digital canvas that allows multiple users to draw and interact on a shared workspace using WebSockets and CRDT-based synchronization.

## Project Structure

- `frontend/` - React-based client application.
- `Backend/` - Express server with WebSocket support and MongoDB persistence.

## Prerequisites

- **Node.js**: Installed on your system.
- **MongoDB**: Ensure MongoDB is running locally on `mongodb://localhost:27017`.

## Setup & Execution

Both the frontend and backend must be running simultaneously for the application to function correctly.

### 1. Backend Setup

The backend is configured to run on port **5001** (to avoid conflicts with macOS default services).

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

## Troubleshooting

- **Database Connection**: If you cannot login, ensure your local MongoDB service is active.
- **Port Conflicts**: If port 5001 is busy, you can change the `PORT` in `Backend/.env` and update the API URLs in the frontend.
- **Environment Variables**: The `.env` file in the `Backend` folder contains the database connection string and JWT secret.