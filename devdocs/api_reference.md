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
| PUT | `/api/canvas/:id/name` | Edit the name of a canvas. |
| DELETE | `/api/canvas/:id` | Delete a canvas. |

## Collaboration & Snapshots
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/snapshot/:id` | Retrieve the latest Yjs binary snapshot from DB. |
| WS | `ws://server/room/:id` | WebSocket connection for real-time Yjs syncing. |
