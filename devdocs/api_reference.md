# API Reference

DesignDeck uses a RESTful API for metadata and workspace management, and WebSockets for real-time synchronization.

## Authentication
All routes except `/auth/login` and `/auth/register` require a `Bearer <token>` in the `Authorization` header.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/register` | Create a new user account. |
| POST | `/api/auth/login` | Authenticate and receive a JWT. |

## Canvas Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/canvas` | List all canvases the user has access to. |
| POST | `/api/canvas` | Create a new canvas. |
| GET | `/api/canvas/:id` | Get detailed metadata for a specific canvas. |
| DELETE | `/api/canvas/:id` | Delete a canvas. |

## Chat & Comments
Object-level chat is stored in MongoDB and synchronized via Socket.io.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/comments/:canvasId` | Retrieve all comments for a specific canvas. |
| POST | `/api/comments` | Post a new comment (internal/admin use). |

## Collaboration & Real-time Sync
DesignDeck uses a hybrid WebSocket approach.

| Type | Endpoint | Protocol | Description |
| :--- | :--- | :--- | :--- |
| Yjs Sync | `/` | WebSockets | Real-time CRDT sync for layers and objects. |
| Chat | `/socket.io/` | Socket.io | Real-time object-level chat broadcasting. |

### Yjs Persistence
The server automatically initializes a default layer on first connection:
- **Layer 0**: ID `default-layer`, Name `Background`.
