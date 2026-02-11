# 🧪 TESTING STRATEGY – DesignDeck Project

## 1️⃣ Overview
This document outlines the comprehensive testing strategy for the DesignDeck project, covering both the **Backend** (Node.js/Express) and **Frontend** (React/Vite). The objective is to ensure that authentication, user management, canvas operations, and UI interactions work correctly, securely, and reliably.

---

## 2️⃣ Backend Testing Strategy
The backend is tested using **Automated API Testing** with **Jest** and **Supertest**. This ensures that the server endpoints behave as expected without requiring a manual client.

### Types of Testing Performed
#### ✅ Integration Testing (Primary)
Integration testing verifies the interaction between different layers of the backend:
- **Routes → Controllers**: Ensuring requests are routed correctly.
- **Controllers → Database**: Verifying correct data persistence in MongoDB.
- **Middleware → Authentication**: confirming JWT validation and role-based access.
- **End-to-End API Flows**: Testing full workflows (e.g., Register -> Login -> Create Canvas) rather than just isolated functions.

#### ✅ API Testing
All backend endpoints are tested using **Supertest**, simulating HTTP requests.
**Tested Endpoints:**
- **🔐 Authentication**: `POST /api/auth/register`, `POST /api/auth/login`
- **👤 User**: `GET /api/auth/me` (Protected)
- **🎨 Canvas**: `POST /api/canvas/create`, `GET /api/canvas/my-canvases`

#### ✅ Security Testing
Specific tests focus on security mechanisms:
- JWT token generation and validation.
- Access control for protected routes (ensuring 401 Unauthorized for invalid/missing tokens).
- Input validation and error handling.

### Backend Test Environment
- **Framework**: Jest + Supertest
- **Database**: `mongodb-memory-server` (for fast, isolated, in-memory database testing)
- **Environment Handling**: `cross-env` (ensures compatibility across Windows/Linux/macOS)

### Execution Results
- **Run Command**: `npm test` (in `Backend/` directory)
- **Current Status**: All test suites passed.
- **Coverage**: High coverage for Routes and Models; moderate coverage for Controllers.

---

## 3️⃣ Frontend Testing Strategy
The frontend is currently tested using **Manual Verification** and **Linting**, with plans for automated unit testing.

### Current Approaches
#### ✅ Manual UI Testing
- **Component Rendering**: Verifying that UI components (Dashboard, Canvas, Auth forms) render correctly across different screen sizes.
- **User Flows**: Manually executing critical paths:
    1.  User Registration & Login.
    2.  Navigating to Dashboard.
    3.  Creating a new Canvas.
    4.  Using Canvas tools (drawing, resizing).
    5.  Saving and retrieving projects.
- **Responsiveness**: Testing layout on Desktop, Tablet, and Mobile views.

#### ✅ Static Analysis (Linting)
- **ESLint**: Enforces code quality and catches syntax errors.
- **Type Checking**: Ensuring prompt validation of props and state (via PropTypes or implicit types).

### Future Improvements (Recommended)
To enhance frontend reliability, the following automated testing tools are recommended:
- **Vitest**: A fast unit test framework compatible with Vite.
- **React Testing Library**: For testing React components in a way that resembles user interaction.

---

## 4️⃣ End-to-End (E2E) Strategy
End-to-End testing verifies the system as a whole, ensuring the Frontend and Backend communicate correctly.

### Workflow Verification
Currently performed manually:
1.  **Start Backend**: `npm start` (Port 5000)
2.  **Start Frontend**: `npm run dev` (Port 5173)
3.  **Execute Scenarios**:
    - **Happy Path**: Register -> Login -> Create Project -> Save -> Logout -> Login -> specific Project exists.
    - **Error Path**: Try logging in with wrong password -> Verify error message on UI.

---

## 5️⃣ Code Coverage Summary
### Backend Coverage
- **Routes**: ~100%
- **Models**: ~100%
- **Controllers**: ~50% (Focus on critical paths)
- **Overall**: ~55% coverage

### Frontend Coverage
- **Automated**: 0% (Dependent on Manual Testing)

---

## 6️⃣ Test File Structure
```
Project Root
├── Backend/
│    ├── tests/
│    │    ├── setup.js        # Test DB setup/teardown
│    │    ├── auth.test.js    # Auth flow tests
│    │    ├── user.test.js    # User profile tests
│    │    └── canvas.test.js  # Canvas CRUD tests
```
