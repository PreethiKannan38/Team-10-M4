import { useRef, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, Navigate } from 'react-router-dom';
import TopBar from './components/TopBar';
import Toolbar from './components/Toolbar';
import Footer from './components/Footer';
import TimelineControls from './components/TimelineControls';
import Canvas from './components/Canvas';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import LandingPage from './components/LandingPage';
import Profile from './components/Profile';
import ChatPanel from './components/ChatPanel';
import JoinCanvas from './components/JoinCanvas';
import NotificationSystem from './components/NotificationSystem';

import axios from 'axios';
import { API_BASE_URL } from './config';

// Simple Auth Guard
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const isGuest = localStorage.getItem('isGuest') === 'true';

  // If neither, go to login
  if (!token && !isGuest) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Route Guard
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const isGuest = localStorage.getItem('isGuest') === 'true';

  if (token || isGuest) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function CanvasWorkspace({ canvasEngineRef }) {
  const { canvasId } = useParams();
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState('draw');
  const [brushColor, setBrushColor] = useState('#8b5cf6');
  const [brushSize, setBrushSize] = useState(5);
  const [brushOpacity, setBrushOpacity] = useState(100);
  const [fontFamily, setFontFamily] = useState('Inter, sans-serif');
  const [eraserStrength, setEraserStrength] = useState(100);
  const [gridOpacity, setGridOpacity] = useState(30);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [fillEnabled, setFillOn] = useState(false);
  const [canvasMetadata, setCanvasMetadata] = useState(null);
  const [branches, setBranches] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAuthorshipMode, setIsAuthorshipMode] = useState(false);

  const [activeLayer, setActiveLayer] = useState('default-layer');

  useEffect(() => {
    fetchCanvasMetadata();
    fetchRelatedBranches();
  }, [canvasId]);

  const fetchCanvasMetadata = async () => {
    const token = localStorage.getItem('token');
    const isGuestCanvas = canvasId.startsWith('guest-');
    if (!token && !isGuestCanvas) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/canvas/${canvasId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : 'Bearer null' }
      });
      setCanvasMetadata(res.data);
    } catch (err) {
      console.error('Error fetching canvas metadata:', err);
    }
  };

  const fetchRelatedBranches = async () => {
    const token = localStorage.getItem('token');
    const isGuestCanvas = canvasId.startsWith('guest-');
    if (!token && !isGuestCanvas) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/canvas/${canvasId}/branches`, {
        headers: { Authorization: token ? `Bearer ${token}` : 'Bearer null' }
      });
      setBranches(res.data);
    } catch (err) {
      console.error('Error fetching related branches:', err);
    }
  };

  const handleBranch = async () => {
    const token = localStorage.getItem('token');
    const isGuestCanvas = canvasId.startsWith('guest-');
    if (!token && !isGuestCanvas) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/canvas/${canvasId}/branch`, {}, {
        headers: { Authorization: token ? `Bearer ${token}` : 'Bearer null' }
      });
      navigate(`/canvas/${res.data.canvasId}`);
    } catch (err) {
      console.error('Error branching canvas:', err);
      alert('Failed to create branch');
    }
  };

  // Compute User Role
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const getRole = () => {
    if (canvasId.startsWith('guest-')) return 'owner'; // Guests are owners of guest canvases
    if (!canvasMetadata) return 'viewer'; // Default until loaded
    const isOwner = canvasMetadata.owner?._id === currentUser._id || canvasMetadata.owner === currentUser._id;
    if (isOwner) return 'owner';
    const member = canvasMetadata.members?.find(m => (m.user?._id || m.user) === currentUser._id);
    return member?.role || 'viewer';
  };
  const userRole = getRole();

  const handleNameChange = async (newName) => {
    const token = localStorage.getItem('token');
    const isGuestCanvas = canvasId.startsWith('guest-');
    if (!token && !isGuestCanvas) return;
    try {
      const res = await axios.put(`${API_BASE_URL}/canvas/${canvasId}/name`,
        { name: newName },
        { headers: { Authorization: token ? `Bearer ${token}` : 'Bearer null' } }
      );
      setCanvasMetadata(res.data);
      fetchRelatedBranches(); // Refresh branch list to show new name
    } catch (err) {
      console.error('Error updating canvas name:', err);
    }
  };

  const handleAuthorshipToggle = () => {
    const newVal = !isAuthorshipMode;
    setIsAuthorshipMode(newVal);
    if (canvasEngineRef.current) {
      canvasEngineRef.current.setAuthorshipMode(newVal);
    }
  };

  const handleDeleteBranch = async (targetCanvasId) => {
    const token = localStorage.getItem('token');
    const isGuestCanvas = targetCanvasId.startsWith('guest-');
    if (!token && !isGuestCanvas) return;
    try {
      await axios.delete(`${API_BASE_URL}/canvas/${targetCanvasId}`, {
        headers: { Authorization: token ? `Bearer ${token}` : 'Bearer null' }
      });

      if (targetCanvasId === canvasId) {
        // If we deleted the current branch, go back to dashboard
        navigate('/dashboard');
      } else {
        // Otherwise just refresh list
        fetchRelatedBranches();
      }
    } catch (err) {
      console.error('Error deleting branch:', err);
      alert('Failed to delete branch');
    }
  };

  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const clearCanvas = () => {
    if (canvasEngineRef.current) canvasEngineRef.current.clearAll();
  };

  const handleTagState = async () => {
    const tagName = window.prompt("Enter a name for this timeline marker (e.g. 'Finished sketching base'):");
    if (!tagName || !tagName.trim()) return;

    const token = localStorage.getItem('token');
    const isGuestCanvas = canvasId.startsWith('guest-');
    if (!token && !isGuestCanvas) return;

    try {
      await axios.post(`${API_BASE_URL}/canvas/${canvasId}/tag`,
        { name: tagName.trim() },
        { headers: { Authorization: token ? `Bearer ${token}` : 'Bearer null' } }
      );
      // Let the user know it worked visually (since prompt halts the UI, a simple alert or just silent success is fine, let's keep it silent if success)
    } catch (err) {
      console.error('Error tagging timeline:', err);
      alert('Failed to tag timeline state');
    }
  };
  const handleImportAction = (format) => {
    if (!canvasEngineRef.current) return;
    const input = document.createElement('input');
    input.type = 'file';
    if (format === 'json') {
      input.accept = '.json';
    } else if (format === 'png') {
      input.accept = 'image/png';
    } else if (format === 'jpeg') {
      input.accept = 'image/jpeg, image/jpg';
    }
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      if (format === 'json') {
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            canvasEngineRef.current.importFromJson(data);
          } catch(err) {
            console.error('Invalid JSON', err);
            alert('Invalid JSON file format.');
          }
        };
        reader.readAsText(file);
      } else {
        reader.onload = (event) => {
          const img = new window.Image();
          img.onload = () => {
            const layerId = 'default-layer';
            const imageId = 'imported-image-' + Date.now();
            
            const importedJson = {
              version: '1.0',
              layers: [
                {
                  id: layerId,
                  name: 'Background',
                  visible: true,
                  locked: false,
                  opacity: 1.0,
                  objects: [imageId],
                  metadata: {}
                }
              ],
              objects: {
                [imageId]: {
                  id: imageId,
                  type: 'image',
                  layerId: layerId,
                  visible: true,
                  geometry: {
                    x: (window.innerWidth / 2) - (img.width / 2) || 0,
                    y: (window.innerHeight / 2) - (img.height / 2) || 0,
                    width: img.width,
                    height: img.height,
                    src: event.target.result
                  },
                  style: { opacity: 1.0 },
                  metadata: { name: 'Imported Image Background' }
                }
              }
            };

            canvasEngineRef.current.importFromJson(importedJson);
            
            // Optionally force pan/zoom reset via engine if we want it centered
            if (canvasEngineRef.current.state) {
              canvasEngineRef.current.state.pan = { x: 0, y: 0 };
              canvasEngineRef.current.setZoom(1.0);
            }
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleAction = (actionId) => {
    if (!canvasEngineRef.current) return;

    switch (actionId) {
      case 'undo':
        canvasEngineRef.current.undo();
        break;
      case 'redo':
        canvasEngineRef.current.redo();
        break;
      case 'clear':
        clearCanvas();
        break;
      case 'export-png':
        canvasEngineRef.current.exportToImage('png');
        break;
      case 'export-jpeg':
        canvasEngineRef.current.exportToImage('jpeg');
        break;
      case 'export-json':
        canvasEngineRef.current.exportToJson();
        break;
      case 'tag':
        handleTagState();
        break;
      case 'dashboard':
        navigate('/');
        break;
      default:
        break;
    }
  };

  const handlePreviewAction = (actionId, enabled) => {
    if (!canvasEngineRef.current) return;
    if (actionId === 'undo') {
      canvasEngineRef.current.setUndoPreview(enabled);
    } else if (actionId === 'redo') {
      canvasEngineRef.current.setRedoPreview(enabled);
    }
  };

  useEffect(() => {
    const handleStateChange = (e) => {
      const { key, value } = e.detail;
      if (key === 'brushOptions') {
        if (value.color) setBrushColor(value.color);
        if (value.width) setBrushSize(value.width);
        if (value.opacity) setBrushOpacity(Math.round(value.opacity * 100));
      }
      if (key === 'tool') setActiveTool(value);
    };
    window.addEventListener('engineStateChange', handleStateChange);
    return () => window.removeEventListener('engineStateChange', handleStateChange);
  }, []);

  return (
    <div className="w-screen h-screen bg-[#FAFAFC] flex flex-col overflow-hidden font-sans text-slate-800 relative">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#7C6AF2] blur-[180px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#6B7A99] blur-[180px] rounded-full" />
      </div>

      <div className="h-20 shrink-0 relative z-50">
        <TopBar
          canvas={{
            canvasId,
            owner: canvasMetadata?.owner,
            members: canvasMetadata?.members,
            refetch: fetchCanvasMetadata
          }}
          canvasName={canvasMetadata?.name}
          onNameChange={handleNameChange}
          onClear={clearCanvas}
          onTag={handleTagState}
          onDashboard={() => navigate('/dashboard')}
          onLogout={onLogout}
          userRole={userRole}
          onExport={(format) => handleAction(`export-${format}`)}
          onImport={handleImportAction}
          branches={branches}
          onBranch={handleBranch}
          onBranchDelete={handleDeleteBranch}
          isTimelineOpen={isTimelineOpen}
          setIsTimelineOpen={setIsTimelineOpen}
          isChatOpen={isChatOpen}
          setIsChatOpen={setIsChatOpen}
          isAuthorshipMode={isAuthorshipMode}
          onAuthorshipToggle={handleAuthorshipToggle}
        />
      </div>

      <ChatPanel
        canvasId={canvasId}
        engine={canvasEngineRef.current}
        currentUser={currentUser}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <TimelineControls
        canvasId={canvasId}
        engine={canvasEngineRef.current}
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {userRole !== 'viewer' && (
          <button
            onClick={() => setIsToolbarOpen(!isToolbarOpen)}
            className={`absolute top-1/2 -translate-y-1/2 z-30 w-8 h-25 bg-white/80 backdrop-blur-md border border-slate-200 border-l-0 rounded-r-2xl flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-xl transition-all duration-500 ease-spring ${isToolbarOpen ? 'left-[112px]' : 'left-0'}`}
          >
            <div className={`transition-transform duration-500 ${isToolbarOpen ? '' : 'rotate-180'}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </div>
          </button>
        )}

        <aside className={`absolute top-0 bottom-0 left-0 z-40 px-6 py-8 flex items-center transition-all duration-500 ease-spring ${isToolbarOpen ? 'translate-x-0 opacity-100' : 'translate-x-[-150px] opacity-0 pointer-events-none'}`}>
          <Toolbar activeTool={activeTool} onToolChange={setActiveTool} onAction={handleAction} onPreviewAction={handlePreviewAction} userRole={userRole} />
        </aside>

        <main className="flex-1 relative flex items-center justify-center">
          <div className="w-full h-full bg-[#FAFAFC] overflow-hidden border-none" style={{ background: 'white' }}>
            <Canvas
              canvasId={canvasId}
              canvasEngineRef={canvasEngineRef}
              activeTool={activeTool}
              brushColor={brushColor}
              brushSize={brushSize}
              brushOpacity={brushOpacity}
              fontFamily={fontFamily}
              eraserStrength={eraserStrength}
              activeLayer={activeLayer}
              fillEnabled={fillEnabled}
              gridOpacity={gridOpacity}
              userRole={userRole}
              currentUser={currentUser}
            />
          </div>

          {userRole !== 'viewer' && (
            <button
              onClick={() => setIsPropertiesOpen(!isPropertiesOpen)}
              className={`absolute top-1/2 -translate-y-1/2 z-50 w-8 h-32 bg-white/80 backdrop-blur-md border border-slate-200 border-r-0 rounded-l-2xl flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-xl transition-all duration-500 ease-spring ${isPropertiesOpen ? 'right-[320px]' : 'right-0'}`}
            >
              <div className={`transition-transform duration-500 ${isPropertiesOpen ? '' : 'rotate-180'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </button>
          )}

          <div className={`absolute top-6 bottom-6 right-6 z-40 transition-all duration-500 ease-spring ${isPropertiesOpen ? 'translate-x-0 opacity-100' : 'translate-x-[360px] opacity-0 pointer-events-none'}`}>
            <Footer
              brushColor={brushColor}
              strokeWidth={brushSize}
              strokeOpacity={brushOpacity}
              gridOpacity={gridOpacity}
              fontFamily={fontFamily}
              activeTool={activeTool}
              eraserStrength={eraserStrength}
              onEraserStrengthChange={setEraserStrength}
              onFontFamilyChange={setFontFamily}
              onBrushColorChange={setBrushColor}
              onStrokeWidthChange={setBrushSize}
              onStrokeOpacityChange={setBrushOpacity}
              onGridOpacityChange={setGridOpacity}
              fillEnabled={fillEnabled}
              onFillToggle={() => setFillOn(!fillEnabled)}
            />
          </div>
        </main>
      </div>

      <footer className="h-12 border-t border-slate-200 flex items-center justify-between px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <span>Canvas ID</span>
            <span className="text-purple-600 font-mono">{canvasId}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Tool</span>
            <span className="text-purple-600">{activeTool}</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <span>Real-time Sync Active</span>
          <div className="w-px h-3 bg-slate-200" />
          <span>V 1.0.4</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const canvasEngineRef = useRef(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/canvas/:canvasId"
          element={
            <ProtectedRoute>
              <CanvasWorkspace canvasEngineRef={canvasEngineRef} />
            </ProtectedRoute>
          }
        />
        <Route path="/join/:canvasId" element={<JoinCanvas />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <NotificationSystem />
    </Router>
  );
}
