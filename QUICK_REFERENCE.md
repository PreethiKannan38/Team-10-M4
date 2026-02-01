# DrawSpace Sprint 1 - Quick Reference Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd server
npm install
```

### 2. Start Both Servers
```bash
# Terminal 1: Frontend
cd frontend && npm run dev
# → http://localhost:5173

# Terminal 2: Backend  
cd server && node server.js
# → ws://localhost:1234
```

### 3. Open Application
```
http://localhost:5173
```

---

## 🎯 Component Guide

### MenuBar
**File:** `/frontend/src/components/MenuBar.jsx`

```jsx
import MenuBar from './components/MenuBar'

<MenuBar />
```

**Features:**
- Fixed top navigation (h-16)
- Shows user profile (avatar, name, role)
- Action buttons: Share, Export, Logout
- Responsive (icons on mobile, text on desktop)

**Customization:**
```jsx
// Edit user info
<div>Username: "User" → Change here</div>
<div>Avatar: Blue bg → Edit color</div>
<div>Role badge: "Editor" → Change role</div>
```

---

### Toolbar
**File:** `/frontend/src/components/Toolbar.jsx`

```jsx
import Toolbar from './components/Toolbar'

<Toolbar 
  activeTool="draw" 
  onToolChange={(tool) => console.log(tool)}
/>
```

**Props:**
- `activeTool` (string): Current active tool ('draw', 'select', 'eraser')
- `onToolChange` (function): Called when user selects a tool

**Features:**
- Left-docked vertical toolbar
- Expands on hover
- Three tools: Draw, Select, Erase
- Active tool highlighting

**Integration:**
```javascript
// Called from App.jsx
engineRef.current.setDraw()
engineRef.current.setSelect()
engineRef.current.setEraser()
```

---

### LayerPanel
**File:** `/frontend/src/components/LayerPanel.jsx`

```jsx
import LayerPanel from './components/LayerPanel'

<LayerPanel
  layers={layers}
  activeLayerId="1"
  onLayerSelect={(id) => console.log(id)}
  onToggleVisibility={(id) => console.log(id)}
/>
```

**Props:**
- `layers` (array): Layer objects with id, name, visible
- `activeLayerId` (string): Currently selected layer
- `onLayerSelect` (function): Called when layer selected
- `onToggleVisibility` (function): Called when eye icon clicked

**Layer Object Structure:**
```javascript
{
  id: '1',
  name: 'Layer 1',
  visible: true
}
```

**Features:**
- Right-docked panel
- Expands on hover
- Visibility toggles
- Scrollable list
- Active layer highlight

---

## 📝 Layout Structure

```
App (h-screen, flex flex-col)
├── MenuBar (h-16, fixed)
└── Main Content (flex-1, flex)
    ├── Toolbar (w-14/w-48, left)
    ├── Canvas (flex-1, center)
    └── LayerPanel (w-12/w-64, right)
```

---

## 🎨 Styling

### Colors Used
```css
/* Backgrounds */
Canvas:      bg-gray-50   (#F9FAFB)
Panels:      bg-white     (#FFFFFF)
Hover:       bg-gray-100  (#F3F4F6)

/* Text */
Primary:     text-gray-900  (#111827)
Secondary:   text-gray-600  (#4B5563)
Muted:       text-gray-400  (#9CA3AF)

/* Accents */
Blue:        bg-blue-500    (#3B82F6)
Light Blue:  bg-blue-100    (#DBEAFE)
Dark Blue:   text-blue-700  (#1D4ED8)

/* Borders */
Default:     border-gray-200  (#E5E7EB)
```

### Common Classes
```css
/* Buttons */
.btn = "px-3 py-1.5 rounded-md transition-colors duration-150"
.btn-primary = ".btn bg-blue-500 text-white hover:bg-blue-600"
.btn-secondary = ".btn text-gray-700 hover:bg-gray-100"

/* Panels */
.panel = "bg-white border border-gray-200 rounded-lg shadow-sm"

/* Active States */
.active = "bg-blue-100 text-blue-700 border-blue-300"
```

---

## 🔧 Modifying Components

### Add a New Tool to Toolbar
```jsx
// In Toolbar.jsx, update tools array
const tools = [
  { id: 'draw', label: 'Draw', icon: ICONS.draw },
  { id: 'select', label: 'Select', icon: ICONS.select },
  { id: 'eraser', label: 'Erase', icon: ICONS.eraser },
  // Add new tool here:
  // { id: 'shape', label: 'Shapes', icon: ICONS.shape },
]
```

### Change Menu Bar Colors
```jsx
// In MenuBar.jsx
<nav className="h-16 bg-white ...">
  {/* Change bg-white to other colors */}
  {/* Available: bg-gray-50, bg-stone-50, bg-blue-50 */}
</nav>
```

### Add New Menu Bar Button
```jsx
// In MenuBar.jsx, after Logout button
<button
  onClick={() => alert('New action')}
  className="px-3 py-1.5 text-sm font-medium bg-green-500 text-white hover:bg-green-600 rounded-md"
>
  New Button
</button>
```

### Customize Layer Panel Collapsed Width
```jsx
// In LayerPanel.jsx, change w-12 to other values
className={`w-12 hover:w-64 ...`}
// Options: w-10, w-12, w-14, w-16, etc.
```

---

## 🐛 Troubleshooting

### Drawing doesn't work
**Solution:** Check if backend server is running
```bash
# Terminal 2
cd server && node server.js
# Should show: ✅ Yjs WebSocket server running on ws://localhost:1234
```

### Tool switching doesn't change anything
**Solution:** Verify canvas engine is initialized
```javascript
// In App.jsx useEffect, engineRef should be populated
useEffect(() => {
  if (!canvasRef.current) return
  engineRef.current = initCanvas(canvasRef.current) // <- Check this
}, [])
```

### Toolbar doesn't expand on hover
**Solution:** Check component is not hidden
```jsx
// Toolbar should have hover:w-48 class
<aside className="w-14 hover:w-48 ...">
```

### Layer panel showing empty
**Solution:** Check layers state is populated
```javascript
// In App.jsx
const [layers, setLayers] = useState([
  { id: '1', name: 'Layer 1', visible: true },
  // Add layers here if empty
])
```

---

## 📊 Performance Tuning

### Optimize Layer List for 50+ Layers
```jsx
// In LayerPanel.jsx, layers are already scrollable
// Consider adding virtualization if > 100 layers
import { FixedSizeList as List } from 'react-window'
```

### Check Animation Performance
```bash
# Chrome DevTools → Performance tab
# Record 5 seconds
# Look for green (60 FPS) not red (janky)
```

### Measure Tool Switch Speed
```javascript
// In App.jsx handleToolChange
const start = performance.now()
handleToolChange('draw')
const end = performance.now()
console.log(`Tool switch took ${end - start}ms`) // Should be < 50ms
```

---

## 🔒 What NOT to Change

❌ `/frontend/src/Engine/canvasEngine.js` - Drawing logic  
❌ `/frontend/src/Engine/ToolManager.js` - Tool management  
❌ `/frontend/src/Engine/Tools/` - Individual tools  
❌ `/frontend/src/Engine/scene/` - Scene graph  
❌ `/server/server.js` - WebSocket server  

**Why?** These contain core functional logic. UI changes should stay in components only.

---

## ✅ Testing Checklist

Before committing changes:

```
[ ] Drawing works
[ ] Tool switching works
[ ] All 3 tools functional
[ ] Layer panel displays correctly
[ ] No console errors
[ ] Responsive on mobile/tablet
[ ] Animations smooth (60 FPS)
[ ] Hover states visible
[ ] Focus indicators present
[ ] Keyboard navigation works
```

---

## 📚 Key Files Reference

### Components (YOU CAN MODIFY)
- `/frontend/src/components/MenuBar.jsx` - Top navigation
- `/frontend/src/components/Toolbar.jsx` - Tool buttons
- `/frontend/src/components/LayerPanel.jsx` - Layer management
- `/frontend/src/App.jsx` - Main layout
- `/frontend/src/index.css` - Global styles

### Core Logic (DO NOT MODIFY)
- `/frontend/src/Engine/canvasEngine.js` - Canvas initialization
- `/frontend/src/Engine/ToolManager.js` - Tool switching
- `/frontend/src/Engine/Tools/*.js` - Individual tools
- `/frontend/src/Engine/scene/*.js` - Scene management
- `/server/server.js` - WebSocket server

---

## 🎯 Next Sprint (Sprint 2)

Planned enhancements (not in scope for Sprint 1):
- [ ] Additional drawing tools (shapes, text)
- [ ] Color picker
- [ ] Stroke width selector
- [ ] Undo/redo buttons
- [ ] Zoom controls
- [ ] Pan/navigate canvas
- [ ] Export options
- [ ] Share dialog

---

**Last Updated:** February 1, 2026  
**Version:** 1.0  
**Status:** Production Ready ✅
