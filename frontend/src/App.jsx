import { useRef, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, Navigate, useLocation } from 'react-router-dom';
import TopBar from './components/TopBar';
import Toolbar from './components/Toolbar';
import Footer from './components/Footer';
import Canvas from './components/Canvas';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import LandingPage from './components/LandingPage';
import Profile from './components/Profile';
import ShareModal from './components/ShareModal';

import axios from 'axios';

// Simple Auth Guard
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const isGuest = localStorage.getItem('isGuest') === 'true';

  // If neither, go to login
  if (!token && !isGuest) {
    // Double check if user data exists as fallback
    if (user) return children;
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
  
  // State
  const [activeTool, setActiveTool] = useState('draw');
  const [brushColor, setBrushColor] = useState('#8b5cf6');
  const [brushSize, setBrushSize] = useState(5);
  const [brushOpacity, setBrushOpacity] = useState(100);
  const [fontFamily, setFontFamily] = useState('Inter, sans-serif');
  const [eraserStrength, setEraserStrength] = useState(100);
  const [gridOpacity, setGridOpacity] = useState(30);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [fillEnabled, setFillOn] = useState(false);
  const [canvasMetadata, setCanvasMetadata] = useState(null);
  const [activeLayer, setActiveLayer] = useState('default-layer');

  // User & Role Logic
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isGuest = localStorage.getItem('isGuest') === 'true';
  const token = localStorage.getItem('token');

  // Calculate role - Strictly Viewer by default for security
  let userRole = 'viewer'; 
  
  if (canvasMetadata) {
    const ownerId = canvasMetadata.owner?._id || canvasMetadata.owner?.id || canvasMetadata.owner;
    const currentUserId = user._id || user.id;
    const isOwner = ownerId && currentUserId && ownerId.toString() === currentUserId.toString();
    
    if (isOwner) {
      userRole = 'editor';
    } else {
      const memberEntry = canvasMetadata.members?.find(m => {
        const mId = m.user?._id || m.user?.id || m.user;
        return mId?.toString() === currentUserId?.toString();
      });
      userRole = memberEntry?.role || 'viewer';
    }
  } else if (isGuest && canvasId?.startsWith('guest-')) {
    userRole = 'editor';
  } else if (location.state?.isOwner || (token && !canvasMetadata)) {
    // During initial creation or metadata loading, allow Editor role
    // if we have the isOwner hint or a valid token
    userRole = 'editor';
  }

  useEffect(() => {
    fetchCanvasMetadata();
  }, [canvasId]);

  const fetchCanvasMetadata = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get(`http://localhost:5001/api/canvas/${canvasId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCanvasMetadata(res.data);
    } catch (err) {
      console.error('Error fetching canvas metadata:', err);
    }
  };

  // Compute User Role
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const getRole = () => {
    if (!canvasMetadata) return 'viewer'; // Default until loaded
    const isOwner = canvasMetadata.owner?._id === currentUser._id || canvasMetadata.owner === currentUser._id;
    if (isOwner) return 'owner';
    const member = canvasMetadata.members?.find(m => (m.user?._id || m.user) === currentUser._id);
    return member?.role || 'viewer';
  };
  const userRole = getRole();

  const handleNameChange = async (newName) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.put(`http://localhost:5001/api/canvas/${canvasId}/name`,
        { name: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCanvasMetadata(res.data);
    } catch (err) {
      console.error('Error updating canvas name:', err);
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
      case 'export':
        canvasEngineRef.current.exportToImage();
        break;
      case 'dashboard':
        navigate('/');
        break;
      default:
        break;
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
          onDashboard={() => navigate('/dashboard')}
          onLogout={onLogout}
          userRole={userRole}
        />
      </div>

      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        canvasId={canvasId}
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
          <Toolbar activeTool={activeTool} onToolChange={setActiveTool} onAction={handleAction} userRole={userRole} />
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
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

