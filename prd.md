# Product Requirements Document (PRD)
## DrawSpace - Real-Time Collaborative Drawing Application
### Sprint 1: Frontend UI Enhancement

**Document Version:** 1.0  
**Date:** February 1, 2026  
**Status:** Active Development - Sprint 1  
**Project Name:** DrawSpace  
**Owner:** Engineering Team

---

## 1. Executive Summary

### 1.1 Product Overview
**DrawSpace** is a real-time collaborative drawing application that enables multiple users to draw, select, and erase visual content simultaneously on a shared infinite canvas. The application is **fully functional** with complete drawing engine, tool system, and real-time synchronization already implemented.

Sprint 1 focuses **exclusively on frontend UI/UX enhancement** without modifying any existing functional behavior.

### 1.2 Sprint 1 Objectives
- **Enhance and professionalize** the existing UI without breaking functionality
- Deliver an **original, developer-tool-like** interface that differentiates from Figma, Canva, Miro, and Excalidraw
- Improve layout, visual hierarchy, and component structure
- Ensure all existing drawing, selection, and erasing behavior remains **100% intact**
- NO new features, NO backend changes, NO logic modifications

### 1.3 Critical Constraint
⚠️ **The application must continue to work EXACTLY as it works now.**
All drawing, selection, erasing, hit-testing, and collaboration behavior must remain completely unchanged.

---

## 2. Technical Architecture

### 2.1 Technology Stack (Confirmed)

#### Frontend (`/frontend`)
- **Framework:** React 18+
- **Build Tool:** Vite
- **Canvas Rendering:** HTML5 Canvas 2D API
- **Styling:** Tailwind CSS
- **Real-time Client:** Yjs (y-websocket client)
- **State Management:** React hooks (useState, useContext)
- **Package Manager:** npm

#### Backend (`/Design_Deck/server`)
- **Runtime:** Node.js
- **Real-time Server:** WebSocket (ws library)
- **CRDT Framework:** Yjs with y-websocket provider
- **Server Type:** WebSocket server for collaborative editing
- **Purpose:** Handles real-time synchronization, conflict resolution, and multi-user state management

#### Core Architecture Components (Already Implemented)
- **Canvas Engine:** Drawing, rendering, scene graph management
- **Tool Manager:** Tool switching, tool behaviors (Draw, Select, Erase)
- **Scene Graph:** Object management, hit-testing, z-index
- **Collaboration Layer:** Yjs CRDT for real-time sync
- **Event System:** Mouse/touch input handling

#### Infrastructure
```
Project Root
├── frontend/                # React + Vite application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── canvasEngine/   # Drawing engine (DO NOT MODIFY)
│   │   ├── tools/          # Tool implementations (DO NOT MODIFY)
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── Design_Deck/
    └── server/              # WebSocket + Yjs server
        ├── server.js        # Main server file
        ├── package.json
        └── node_modules/
```

### 2.2 Development Environment

#### Starting the Application (Required: Run Both Simultaneously)

**Terminal 1 - Frontend Server:**
```bash
cd frontend
npm install
npm run dev
```
*Expected output: Vite dev server running on http://localhost:5173 (or similar)*

**Terminal 2 - WebSocket Server:**
```bash
cd Design_Deck/server
npm install
npm install y-websocket ws  # Install real-time dependencies
node server.js
```
*Expected output: WebSocket server running on ws://localhost:1234 (or configured port)*

#### Development Workflow
1. Both servers MUST run simultaneously for full functionality
2. Frontend connects to WebSocket server for real-time collaboration
3. Hot reload enabled on frontend (Vite HMR)
4. Backend requires manual restart on code changes

### 2.3 System Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                     DrawSpace Frontend                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                 React + Vite App                       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │  UI Layer    │  │ Canvas Engine│  │ Tool Manager│ │ │
│  │  │ (Components) │  │  (2D Context)│  │ (Draw/etc.) │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  │         │                  │                 │        │ │
│  │         └──────────────────┴─────────────────┘        │ │
│  │                            │                           │ │
│  │                    ┌───────▼────────┐                 │ │
│  │                    │  Yjs Provider  │                 │ │
│  │                    │  (y-websocket) │                 │ │
│  │                    └───────┬────────┘                 │ │
│  └────────────────────────────┼──────────────────────────┘ │
└─────────────────────────────────┼──────────────────────────┘
                                  │
                       WebSocket Connection
                       (CRDT Sync Protocol)
                                  │
┌─────────────────────────────────▼──────────────────────────┐
│              Node.js WebSocket Server                       │
│  ┌────────────────────────────────────────────────────────┐│
│  │               y-websocket Provider                     ││
│  │  ┌──────────────────────────────────────────────────┐ ││
│  │  │        Yjs Shared Document (CRDT)                │ ││
│  │  │  • Drawing data                                  │ ││
│  │  │  • Tool states                                   │ ││
│  │  │  • User presence                                 │ ││
│  │  └──────────────────────────────────────────────────┘ ││
│  └────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────┘
```

### 2.4 Data Flow (Read-Only for Sprint 1)
Sprint 1 focuses on **UI only**. Understanding the data flow helps preserve existing behavior:

1. **User Input** → Canvas event handlers
2. **Tool Manager** → Processes input based on active tool
3. **Canvas Engine** → Renders to 2D context
4. **Yjs Provider** → Syncs changes to server
5. **Server** → Broadcasts to all connected clients
6. **Other Clients** → Receive updates via Yjs
7. **Local Canvas** → Re-renders with new data

**DO NOT MODIFY:** Steps 2-7 are off-limits for Sprint 1.

---

## 3. Functional Requirements (UI Enhancement Only)

### 3.1 Critical Rules
1. **DO NOT** modify canvasEngine logic
2. **DO NOT** change ToolManager or tool behavior  
3. **DO NOT** alter Yjs sync logic
4. **DO NOT** introduce new backend requirements
5. **DO NOT** break existing drawing, erasing, or selection behavior

### 3.2 UI Enhancement Scope (Sprint 1)

#### 3.2.1 Canvas Area (UI Polish Only)
| Requirement ID | Description | Type | Priority |
|----------------|-------------|------|----------|
| FR-CAN-001 | Canvas fills viewport (minus menu bar) | Layout | P0 |
| FR-CAN-002 | Neutral background color (#F5F5F7 or similar) | Visual | P0 |
| FR-CAN-003 | No visible borders around canvas | Visual | P0 |
| FR-CAN-004 | Cursor changes per active tool (existing behavior preserved) | Visual | P0 |
| FR-CAN-005 | Optional grid overlay toggle UI (default OFF) | Feature | P1 |
| FR-CAN-006 | Canvas container structure optimized | Architecture | P1 |

**Note:** Drawing, hit-testing, rendering logic remains untouched.

#### 3.2.2 Toolbar (UI Component Only)
| Requirement ID | Description | Type | Priority |
|----------------|-------------|------|----------|
| FR-TB-001 | Vertical left-docked toolbar | Layout | P0 |
| FR-TB-002 | Collapsible/expandable behavior | Interaction | P0 |
| FR-TB-003 | Draw tool button with icon | UI | P0 |
| FR-TB-004 | Select tool button with icon | UI | P0 |
| FR-TB-005 | Erase tool button with icon | UI | P0 |
| FR-TB-006 | Active tool visual highlight | Visual | P0 |
| FR-TB-007 | Tooltip on hover (collapsed state) | UX | P1 |
| FR-TB-008 | Icon + label in expanded state | UI | P1 |
| FR-TB-009 | Smooth expand/collapse animation (200-300ms) | Polish | P1 |
| FR-TB-010 | Calls existing tool switching methods | Integration | P0 |

**Note:** Tool behavior (draw, select, erase) is already implemented. UI only triggers existing methods.

#### 3.2.3 Top Menu Bar (UI Component Only)
| Requirement ID | Description | Type | Priority |
|----------------|-------------|------|----------|
| FR-MB-001 | Fixed horizontal bar at top | Layout | P0 |
| FR-MB-002 | Compact height (~56-64px) | Design | P0 |
| FR-MB-003 | App name/logo "DrawSpace" (left) | Content | P0 |
| FR-MB-004 | User avatar (circular, center/right) | UI | P0 |
| FR-MB-005 | Username display | UI | P0 |
| FR-MB-006 | Access role badge (guest/user/admin) | UI | P1 |
| FR-MB-007 | Share button (stubbed onClick) | UI | P0 |
| FR-MB-008 | Export button (stubbed onClick) | UI | P0 |
| FR-MB-009 | Login/Logout button (stubbed onClick) | UI | P0 |
| FR-MB-010 | Responsive text hiding (<768px) | UX | P1 |
| FR-MB-011 | Muted background, no heavy shadows | Visual | P0 |

**Note:** Buttons trigger placeholder functions. Backend integration is out of scope.

#### 3.2.4 Layer Management Panel (UI Component Only)
| Requirement ID | Description | Type | Priority |
|----------------|-------------|------|----------|
| FR-LM-001 | Slim right-docked panel | Layout | P0 |
| FR-LM-002 | Collapsible behavior | Interaction | P0 |
| FR-LM-003 | Layer list display | UI | P0 |
| FR-LM-004 | Layer name text | UI | P0 |
| FR-LM-005 | Visibility toggle (eye icon) | UI | P0 |
| FR-LM-006 | Active layer highlight | Visual | P0 |
| FR-LM-007 | Scalable list design (50+ layers) | Architecture | P1 |
| FR-LM-008 | Clean list layout (no heavy borders) | Visual | P1 |
| FR-LM-009 | Connects to existing layer state | Integration | P0 |

**Note:** Layer data structure already exists. UI displays and modifies via existing APIs.

### 3.3 Explicitly Out of Scope
❌ **DO NOT IMPLEMENT:**
- New drawing tools (shapes, text, etc.)
- Color picker (unless basic one exists)
- Undo/redo UI (unless trivial)
- Real-time cursor indicators
- User presence avatars on canvas
- Export format selection
- Share link generation
- Authentication flow
- Settings panel
- Zoom controls (unless already implemented)
- Pan indicators

---

## 4. Non-Functional Requirements

### 4.1 Performance
| Requirement ID | Description | Target Metric |
|----------------|-------------|---------------|
| NFR-PERF-001 | Tool switching response time | < 50ms |
| NFR-PERF-002 | Panel animation smoothness | 60 FPS |
| NFR-PERF-003 | Canvas rendering frame rate | > 30 FPS |
| NFR-PERF-004 | Initial page load time | < 2s |

### 4.2 Usability
| Requirement ID | Description | Standard |
|----------------|-------------|----------|
| NFR-UX-001 | Click target minimum size | ≥ 40px × 40px |
| NFR-UX-002 | Focus indicators visible | WCAG 2.1 AA |
| NFR-UX-003 | ARIA labels for interactive elements | WCAG 2.1 A |
| NFR-UX-004 | Keyboard navigation support | Full support |

### 4.3 Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 4.4 Responsiveness
- Desktop: 1920×1080 (primary)
- Laptop: 1366×768
- Tablet: 768×1024 (degraded features acceptable)
- Mobile: Out of scope for Sprint 1

---

## 5. Design System Specifications

### 5.1 Design Philosophy Principles
1. **Canvas-First:** The drawing area dominates; UI is minimal and unobtrusive
2. **Developer-Tool Aesthetic:** Professional, utilitarian, engineering-oriented (not playful)
3. **Anti-Pattern Avoidance:** NO visual similarity to Figma, Canva, Miro, Excalidraw
4. **Functional Over Decorative:** Every UI element serves a clear purpose
5. **Low Visual Noise:** Muted colors, subtle contrasts, flat design with soft shadows only
6. **Instant Feedback:** Tool switches, hover states, and interactions feel immediate

### 5.2 Visual Language

#### Color Palette (Tailwind CSS Classes)
```
Canvas & Backgrounds:
- Canvas: bg-gray-50 (#F9FAFB) or bg-stone-50 (#FAFAF9)
- UI Panels: bg-white or bg-gray-100
- Menu Bar: bg-white border-b border-gray-200
- Sidebar: bg-gray-50

Borders & Dividers:
- Default: border-gray-200 (#E5E7EB)
- Subtle: border-gray-100
- Hover: border-gray-300

Text:
- Primary: text-gray-900 (#111827)
- Secondary: text-gray-600 (#4B5563)
- Muted: text-gray-400 (#9CA3AF)

Interactive Elements:
- Primary Action: bg-blue-500 hover:bg-blue-600 (#3B82F6 → #2563EB)
- Active Tool: bg-blue-100 text-blue-700 border-blue-300
- Hover State: bg-gray-100 (subtle, low-key)
- Focus Ring: ring-2 ring-blue-500 ring-offset-2

Avoid:
- Bright saturated colors (no neon, no pastels)
- Gradients (except very subtle ones if necessary)
- Heavy shadows (only soft: shadow-sm, shadow-md)
```

#### Typography (Tailwind)
```
Font Stack: font-sans (system fonts)
- Sizes:
  • Headings: text-base (16px) or text-lg (18px)
  • Body: text-sm (14px)
  • Labels: text-xs (12px)
  • Tiny text: text-[11px]

- Weights:
  • Normal: font-normal (400)
  • Medium: font-medium (500)
  • Semibold: font-semibold (600)
```

#### Spacing System (Tailwind)
```
Base: 4px (space-1)
Common values:
- xs: space-1 (4px)
- sm: space-2 (8px)
- md: space-3 (12px) or space-4 (16px)
- lg: space-6 (24px)
- xl: space-8 (32px)

Padding/Margin Guidelines:
- Buttons: px-4 py-2 (16px × 8px)
- Panels: p-4 or p-6
- Container gaps: gap-2, gap-3, gap-4
```

#### Shadows (Tailwind)
```
- Minimal: shadow-sm (0 1px 2px rgba(0,0,0,0.05))
- Standard: shadow-md (0 4px 6px rgba(0,0,0,0.1))
- Avoid: shadow-lg, shadow-xl (too heavy)

Apply to:
- Floating panels (shadow-md)
- Dropdowns (shadow-lg only if necessary)
- Buttons: No shadow (flat design)
```

#### Borders & Radius (Tailwind)
```
- Border width: border (1px default)
- Radius:
  • Buttons: rounded-md (6px)
  • Panels: rounded-lg (8px)
  • Avatars: rounded-full
  • Avoid: rounded-2xl, rounded-3xl (too soft)
```

#### Animation & Transitions (Tailwind)
```
- Duration:
  • Fast: duration-150 (hover states)
  • Standard: duration-200 (panel slides)
  • Slow: duration-300 (complex transitions)

- Easing: ease-in-out (default)

- Common patterns:
  • Hover: transition-colors duration-150
  • Panel expand: transition-all duration-200
  • Fade: transition-opacity duration-150
```

### 5.3 Component Specifications

#### 5.3.1 Toolbar (Vertical, Left-docked)
```
Collapsed State:
- Width: w-14 (56px)
- Padding: p-2 (8px)
- Item height: h-10 (40px)
- Item spacing: gap-1 (4px)
- Icon size: w-5 h-5 (20px)
- Background: bg-white border-r border-gray-200

Expanded State:
- Width: w-44 (176px) or w-48 (192px)
- Layout: Flexbox (icon + label)
- Label: text-sm ml-3
- Transition: transition-all duration-200

Tool Item:
- Base: flex items-center justify-center (collapsed)
  OR flex items-center justify-start (expanded)
- Hover: bg-gray-100
- Active: bg-blue-100 text-blue-700 border-l-2 border-blue-500
- Radius: rounded-md
- Click target: min-h-[40px]
```

#### 5.3.2 Top Menu Bar
```
Container:
- Height: h-14 or h-16 (56px or 64px)
- Background: bg-white border-b border-gray-200
- Layout: flex items-center justify-between px-4 or px-6

Sections:
- Left (Logo): flex items-center gap-2
- Center/Right (User): flex items-center gap-3
- Right (Actions): flex items-center gap-2

Buttons:
- Style: px-3 py-1.5 text-sm rounded-md
- Primary: bg-blue-500 text-white hover:bg-blue-600
- Secondary: border border-gray-300 hover:bg-gray-50
- Icon + Text: hidden sm:inline-block (text hidden on mobile)

Avatar:
- Size: w-8 h-8 (32px)
- Style: rounded-full border-2 border-gray-200
```

#### 5.3.3 Layer Panel (Right-docked)
```
Container:
- Width: w-60 (240px) or w-64 (256px)
- Background: bg-white border-l border-gray-200
- Padding: p-4

Layer Item:
- Height: h-10 (40px)
- Layout: flex items-center justify-between
- Hover: bg-gray-50
- Active: bg-blue-50 border-l-2 border-blue-500
- Spacing: gap-2

Visibility Toggle:
- Size: w-5 h-5
- Color: text-gray-400 hover:text-gray-600
- Active (visible): text-gray-700
```

#### 5.3.4 Canvas Container
```
Container:
- Layout: Flexbox or Grid (fills remaining space)
- Background: bg-gray-50
- Overflow: overflow-hidden
- Cursor: Set dynamically via inline style or class

Canvas Element:
- Native <canvas> tag
- No border
- No shadow
- Full available width/height
```

---

## 6. Technical Requirements

### 6.1 Code Quality Standards
- **Linting:** ESLint (React hooks rules, Tailwind plugin)
- **Formatting:** Prettier (if configured)
- **Component Type:** Functional components with React hooks only
- **File Naming:** 
  - Components: PascalCase (e.g., `Toolbar.jsx`, `MenuBar.jsx`)
  - Utilities: camelCase (e.g., `useToolbar.js`)
- **Comments:** 
  - JSDoc for component props
  - Inline comments for complex UI logic only

### 6.2 State Management Strategy
| State Type | Approach | Example |
|------------|----------|---------|
| Local UI state | `useState` | Toolbar collapsed/expanded |
| Shared UI state | `useContext` or prop drilling | Active tool, active layer |
| Canvas state | **DO NOT MODIFY** | Managed by canvasEngine |
| Collaboration state | **DO NOT MODIFY** | Managed by Yjs |

**Critical:** UI components should READ state, not OWN it (except for local UI toggles).

### 6.3 Component Architecture Rules
1. **Separation of Concerns:**
   - UI components handle rendering only
   - Logic/state lives in existing managers (ToolManager, etc.)
   - UI calls methods, doesn't reimplement logic

2. **Component Hierarchy (Proposed):**
```
<App>
  ├── <MenuBar>
  │   ├── <Logo>
  │   ├── <UserInfo>
  │   └── <ActionButtons>
  ├── <Toolbar>
  │   └── <ToolButton> (×3: Draw, Select, Erase)
  ├── <CanvasContainer>
  │   └── <canvas> (existing)
  └── <LayerPanel>
      └── <LayerItem> (×N)

---

## 6. Technical Requirements

### 6.1 Code Quality Standards
- **Code Style:** ESLint + Prettier (if configured)
- **Component Structure:** Functional components with hooks
- **File Naming:** PascalCase for components, camelCase for utilities
- **Comments:** JSDoc for public APIs, inline for complex logic

### 6.2 State Management Strategy
- **Local State:** useState for component-specific UI
- **Shared State:** Context API for toolbar, layers, user info
- **Backend State:** Yjs shared types (if applicable)

### 6.3 Performance Optimization
- Memoization for expensive renders (useMemo, React.memo)
- Virtualization for layer lists (if > 50 layers)
- Canvas optimization (requestAnimationFrame)
- Debouncing for resize events

### 6.4 Accessibility Requirements
- Semantic HTML (nav, main, aside)
- Keyboard shortcuts documented
- Focus trap in modals (if any)
- Screen reader announcements for tool changes

---

## 7. User Stories

### 7.1 Primary User Stories (Sprint 1)

**US-001: Tool Selection**
> As a user, I want to select drawing tools from a toolbar so that I can draw, select, or erase on the canvas.

**Acceptance Criteria:**
- Toolbar displays Draw, Select, Erase tools
- Clicking a tool activates it (visual feedback)
- Cursor changes to reflect active tool
- Only one tool active at a time

---

**US-002: Canvas Interaction**
> As a user, I want to draw on an infinite canvas so that I can create visual content without space constraints.

**Acceptance Criteria:**
- Canvas fills viewport (minus menu bar)
- Drawing feels smooth and responsive
- No visible borders or artificial limits
- Canvas is pannable (if zoom implemented)

---

**US-003: Layer Management**
> As a user, I want to manage layers so that I can organize my drawings.

**Acceptance Criteria:**
- Layer panel shows all layers
- Can toggle layer visibility
- Active layer is clearly highlighted
- Layers persist in state

---

**US-004: User Authentication Display**
> As a user, I want to see my login status and profile so that I know I'm authenticated.

**Acceptance Criteria:**
- Avatar displays in menu bar
- Username visible
- Role shown (guest/user/admin)
- Login/Logout button functional (stubbed action)

---

**US-005: Collaboration Access**
> As a user, I want to share my canvas with others so that we can collaborate.

**Acceptance Criteria:**
- Share button visible in menu bar
- Clicking opens share dialog (stubbed)
- Export button visible (stubbed action)

---

## 8. Technical Constraints & Assumptions

### 8.1 Constraints
1. **No Backend Changes:** Must work with existing WebSocket server
2. **No Feature Creep:** Strictly Sprint 1 scope (3 tools only)
3. **Existing Codebase:** Refactor, do not rebuild from scratch
4. **Browser APIs:** Limited to standard HTML5 Canvas, no WebGL (unless already implemented)

### 8.2 Assumptions
1. Backend WebSocket server handles all real-time sync
2. Yjs provides CRDT conflict resolution
3. User authentication is handled externally (stubbed in UI)
4. Export/Share functionality triggers will be implemented in future sprints
5. Existing component structure is reasonably organized

### 8.3 Dependencies
- **External Libraries:**
  - y-websocket (backend)
  - ws (backend)
  - React (frontend)
  - [To be discovered from codebase: state management, canvas library]

### 8.4 Risks & Mitigations
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Existing codebase is unstructured | High | Medium | Incremental refactoring with clear documentation |
| Canvas performance issues | High | Low | Optimize render cycles, use requestAnimationFrame |
| WebSocket connection instability | Medium | Low | Implement reconnection logic (frontend UX only) |
| Design originality hard to achieve | Medium | Medium | Multiple design iterations, avoid copying patterns |

---

## 9. Development Phases

### Phase 1: Discovery & Analysis (Current)
- [ ] Analyze existing codebase structure
- [ ] Identify current component hierarchy
- [ ] Document existing state management
- [ ] Review WebSocket integration points

### Phase 2: Component Refactoring
- [ ] Refactor main layout structure
- [ ] Create reusable UI components (Button, Panel, etc.)
- [ ] Implement toolbar component with expand/collapse
- [ ] Build menu bar with responsive layout

### Phase 3: Canvas & Interaction
- [ ] Enhance canvas component
- [ ] Implement cursor changes per tool
- [ ] Add grid toggle (default OFF)
- [ ] Optimize canvas rendering

### Phase 4: Layer Management
- [ ] Build layer panel UI
- [ ] Implement visibility toggle
- [ ] Add active layer highlight
- [ ] Connect to state management

### Phase 5: Polish & Testing
- [ ] Add animations and transitions
- [ ] Accessibility audit
- [ ] Cross-browser testing
- [ ] Performance profiling

---

## 10. Success Metrics

### 10.1 Sprint 1 Completion Criteria
```

3. **Reusable Components:**
   - `<Button>`: Variants (primary, secondary, icon-only)
   - `<IconButton>`: Toolbar tools, visibility toggles
   - `<Panel>`: Sidebar wrapper (collapsible logic)
   - `<Tooltip>`: Hover hints

4. **Props Interface Example:**
```jsx
// ToolButton.jsx
interface ToolButtonProps {
  icon: ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  tooltip?: string;
  expanded?: boolean;
}
```

### 6.4 Performance Optimization
- **Rendering:**
  - `React.memo()` for list items (LayerItem)
  - `useMemo()` for expensive computations (if any)
  - Avoid re-renders of canvas container
  
- **Canvas:**
  - **DO NOT MODIFY** existing render loop
  - Only update UI chrome, not canvas drawing logic

- **Event Handling:**
  - Debounce resize events (if adding responsive logic)
  - Throttle scroll events (if adding scroll-based UI)

### 6.5 Accessibility Requirements (WCAG 2.1 Level A Minimum)
| Requirement | Implementation | Priority |
|-------------|----------------|----------|
| Keyboard Navigation | Tab order, Enter/Space for actions | P0 |
| Focus Indicators | ring-2 ring-blue-500 on focus | P0 |
| ARIA Labels | aria-label for icon-only buttons | P0 |
| Color Contrast | Text ≥ 4.5:1 ratio | P0 |
| Click Targets | min-h-[40px] min-w-[40px] | P0 |
| Screen Reader | Announce tool changes (aria-live) | P1 |

### 6.6 File Structure Guidelines
```
frontend/src/
├── components/
│   ├── ui/               # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── IconButton.jsx
│   │   ├── Panel.jsx
│   │   └── Tooltip.jsx
│   ├── MenuBar.jsx       # Top navigation
│   ├── Toolbar.jsx       # Left tool panel
│   ├── CanvasContainer.jsx # Canvas wrapper (minimal logic)
│   └── LayerPanel.jsx    # Right layer management
├── canvasEngine/         # ⚠️ DO NOT MODIFY
├── tools/                # ⚠️ DO NOT MODIFY
├── hooks/                # Custom hooks (if needed)
│   └── useToolbar.js
├── utils/                # Helper functions
└── App.jsx               # Main layout orchestration
```

---

## 7. User Stories (UI Enhancement Focus)

### 7.1 Primary User Stories (Sprint 1)

**US-001: Professional UI Layout**
> As a user, I want a clean, professional interface so that I can focus on drawing without visual distractions.

**Acceptance Criteria:**
- Canvas occupies maximum available space
- Menu bar is compact and non-intrusive
- UI chrome uses muted colors (no bright pastels)
- Design does NOT resemble Figma, Canva, Miro, or Excalidraw

---

**US-002: Tool Selection Clarity**
> As a user, I want to clearly see which tool is active so that I know what mode I'm in.

**Acceptance Criteria:**
- Active tool has distinct visual highlight (e.g., blue background)
- Cursor changes immediately on tool switch
- Toolbar is always visible (docked left)
- Tool switching feels instant (< 50ms perceived delay)

---

**US-003: Expandable Toolbar**
> As a user, I want to expand the toolbar to see tool names so that I can learn the interface.

**Acceptance Criteria:**
- Toolbar expands on hover or click
- Expanded state shows icon + label
- Animation is smooth (200-300ms)
- Toolbar does not block canvas significantly

---

**US-004: User Identity Display**
> As a user, I want to see my profile in the menu bar so that I know I'm logged in.

**Acceptance Criteria:**
- Avatar is visible (circular image or initials)
- Username displayed next to avatar
- Role badge shown (guest/user/admin)
- UI updates when user state changes (stubbed)

---

**US-005: Layer Visibility Control**
> As a user, I want to toggle layer visibility so that I can focus on specific content.

**Acceptance Criteria:**
- Layer panel lists all layers
- Eye icon toggles visibility
- Hidden layers are visually muted
- Active layer is highlighted
- Panel is collapsible to save space

---

## 8. Technical Constraints & Assumptions

### 8.1 Immutable Constraints (CRITICAL)
1. **Canvas Engine:** Drawing, rendering, scene graph logic CANNOT be changed
2. **Tool Manager:** Tool switching, tool behavior (draw/select/erase) is off-limits
3. **Yjs Integration:** Real-time sync logic must remain intact
4. **Event Handlers:** Existing mouse/touch event handlers preserved
5. **Data Structures:** Scene graph, layer data, object models unchanged

### 8.2 Operational Assumptions
1. **Backend Server:** Fully functional, no changes needed
2. **Yjs CRDT:** Handles all conflict resolution automatically
3. **Authentication:** Stubbed in UI; backend handles actual auth
4. **Export/Share:** UI buttons trigger placeholder functions (stubbed)
5. **Existing State:** Component state structure may need refactoring, but data contracts stay the same

### 8.3 Technology Constraints
- **Styling:** Tailwind CSS ONLY (no new frameworks)
- **Icons:** Use existing icon library or Heroicons/Lucide (lightweight)
- **No New Dependencies:** Unless absolutely necessary (ask first)
- **React Version:** Work with installed version (likely React 18)

### 8.4 Risks & Mitigations
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Breaking existing drawing behavior | **CRITICAL** | Medium | Test drawing after each UI change; avoid touching canvasEngine |
| Performance regression from UI renders | High | Low | Use React.memo, minimize re-renders of canvas wrapper |
| Accessibility gaps | Medium | Medium | Follow WCAG checklist, test keyboard navigation |
| UI feels too generic/boring | Low | Medium | Iterate on design, get feedback, prioritize originality |
| Responsive layout issues | Medium | Low | Test on 1366×768, 1920×1080; mobile out of scope |

---

## 9. Development Phases (Sprint 1 Breakdown)

### Phase 1: Discovery & Analysis ✅ (Day 1)
- [ ] Clone repository and verify setup
- [ ] Run frontend + backend servers simultaneously
- [ ] Analyze existing component structure (`/src/components`)
- [ ] Identify canvasEngine, ToolManager, Yjs integration points
- [ ] Document current state management approach
- [ ] Map out existing UI components

**Deliverable:** Codebase analysis document

---

### Phase 2: Core Layout Refactoring (Day 1-2)
- [ ] Create main layout structure in `App.jsx`
- [ ] Set up CSS Grid or Flexbox for menu bar + canvas + sidebars
- [ ] Ensure canvas fills remaining viewport space
- [ ] Verify drawing still works after layout changes
- [ ] Test responsive behavior (desktop only)

**Deliverable:** Functional layout with canvas operational

---

### Phase 3: Menu Bar Implementation (Day 2-3)
- [ ] Create `<MenuBar>` component
- [ ] Add logo/app name (left)
- [ ] Add user info section (avatar, username, role)
- [ ] Add action buttons (Share, Export, Login/Logout)
- [ ] Implement responsive text hiding
- [ ] Apply Tailwind styling (muted colors, compact design)
- [ ] Test button interactions (stubbed functions)

**Deliverable:** Functional menu bar component

---

### Phase 4: Toolbar Implementation (Day 3-4)
- [ ] Create `<Toolbar>` component (vertical, left-docked)
- [ ] Add Draw, Select, Erase tool buttons
- [ ] Implement collapse/expand logic
- [ ] Add active tool highlight
- [ ] Connect to existing ToolManager (call existing methods)
- [ ] Add tooltips (collapsed state)
- [ ] Test tool switching (verify drawing works)

**Deliverable:** Functional toolbar with tool switching

---

### Phase 5: Layer Panel Implementation (Day 4-5)
- [ ] Create `<LayerPanel>` component (right-docked)
- [ ] Fetch layer data from existing state
- [ ] Display layer list with names
- [ ] Add visibility toggle (eye icon)
- [ ] Highlight active layer
- [ ] Implement collapse/expand
- [ ] Test with multiple layers
- [ ] Optimize for 50+ layers (virtualization if needed)

**Deliverable:** Functional layer management panel

---

### Phase 6: Polish & Refinement (Day 5-6)
- [ ] Add smooth animations (panel slides, fades)
- [ ] Refine hover states (subtle, consistent)
- [ ] Ensure cursor changes per tool
- [ ] Add focus indicators for accessibility
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Fix any visual inconsistencies
- [ ] Verify all existing functionality works

**Deliverable:** Polished, consistent UI

---

### Phase 7: Testing & QA (Day 6-7)
- [ ] **Functionality Test:** Draw, select, erase still work perfectly
- [ ] **UI Test:** All buttons, panels, toggles respond correctly
- [ ] **Accessibility Test:** Keyboard navigation, focus states, ARIA labels
- [ ] **Responsive Test:** 1366×768 and 1920×1080 displays
- [ ] **Performance Test:** No jank in animations, smooth canvas rendering
- [ ] **Cross-browser Test:** Chrome, Firefox, Safari, Edge

**Deliverable:** Bug-free, tested UI

---

### Phase 8: Documentation & Handoff (Day 7)
- [ ] Document component props and usage
- [ ] Add inline comments for complex UI logic
- [ ] Create README for UI components
- [ ] List known limitations or future improvements
- [ ] Provide deployment notes (if any)

**Deliverable:** Complete documentation

---

## 10. Success Metrics

### 10.1 Sprint 1 Completion Criteria (Checklist)
- [ ] ✅ All existing functionality works (drawing, selection, erasing)
- [ ] ✅ Menu bar implemented with all required elements
- [ ] ✅ Toolbar implemented with Draw, Select, Erase tools
- [ ] ✅ Layer panel displays and manages layers
- [ ] ✅ UI feels original (not Figma/Canva/Miro/Excalidraw-like)
- [ ] ✅ Tailwind CSS used consistently
- [ ] ✅ Accessibility basics met (keyboard nav, focus states)
- [ ] ✅ Animations smooth (200-300ms, 60 FPS)
- [ ] ✅ Code is readable and maintainable
- [ ] ✅ No new bugs introduced

### 10.2 Quality Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Tool switch response | < 50ms perceived | Manual testing |
| Animation frame rate | 60 FPS | Browser DevTools |
| Accessibility score | WCAG 2.1 A | Lighthouse audit |
| Code coverage | N/A (UI only) | Manual review |
| Browser compatibility | Chrome 90+, Firefox 88+, Safari 14+ | Manual testing |

### 10.3 User Experience Metrics (Qualitative)
- **Visual Clarity:** UI elements are clearly distinguishable
- **Originality:** Design feels fresh, not derivative
- **Professionalism:** Interface looks polished and production-ready
- **Usability:** New users can find tools without instruction
- **Performance:** UI feels snappy and responsive

---

## 11. Appendices

### Appendix A: Glossary
- **Canvas Engine:** Core drawing and rendering system (off-limits)
- **Tool Manager:** System for managing active tools (off-limits)
- **CRDT:** Conflict-free Replicated Data Type (Yjs)
- **Scene Graph:** Data structure representing canvas objects
- **Hit-testing:** Detecting which object was clicked
- **Stubbed:** Placeholder function (not fully implemented)

### Appendix B: References
- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **React Hooks API:** https://react.dev/reference/react
- **Yjs Documentation:** https://docs.yjs.dev
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

### Appendix C: Contact & Support
- **Project Owner:** [To be filled]
- **Lead Developer:** [To be filled]
- **Design Review:** [To be filled]

---

**Document Status:** ✅ APPROVED FOR SPRINT 1  
**Next Review:** End of Sprint 1 (before Sprint 2 planning)