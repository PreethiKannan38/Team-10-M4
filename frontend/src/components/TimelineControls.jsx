import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Clock, Activity, Layout } from 'lucide-react';
import ReplayManager from '../Engine/managers/ReplayManager';
import ReplayCanvas from './ReplayCanvas';

const TimelineControls = ({ canvasId, engine, isOpen, onClose }) => {
    const [events, setEvents] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [replayState, setReplayState] = useState({ layers: [], objects: {} });
    const replayManagerRef = useRef(null);

    useEffect(() => {
        if (isOpen && canvasId) {
            const manager = new ReplayManager(
                canvasId,
                (state) => setReplayState(state),
                (index) => setCurrentIndex(index)
            );

            replayManagerRef.current = manager;

            manager.fetchTimeline().then(evs => {
                setEvents(evs);
                setIsLoading(false);
            });
        }

        return () => {
            if (replayManagerRef.current) {
                replayManagerRef.current.pause();
            }
        };
    }, [isOpen, canvasId]);

    const handlePlayPause = () => {
        if (isPlaying) {
            replayManagerRef.current.pause();
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            replayManagerRef.current.setSpeed(playbackSpeed);
            replayManagerRef.current.play(() => {
                setIsPlaying(false);
            });
        }
    };

    const handleSliderChange = (e) => {
        const index = parseInt(e.target.value);
        setCurrentIndex(index);
        replayManagerRef.current.jumpTo(index);
    };

    const handleReset = () => {
        replayManagerRef.current.reset();
        setCurrentIndex(-1);
        setIsPlaying(false);
    };

    if (!isOpen) return null;

    const currentEvent = events[currentIndex];

    return (
        <div className="fixed inset-0 z-[100] flex flex-row items-stretch justify-center p-4 sm:p-6 gap-6 pointer-events-none overflow-hidden max-h-screen h-screen">
            {/* Backdrop & Click-away */}
            <div
                className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm pointer-events-auto transition-all animate-in fade-in"
                onClick={onClose}
            />

            {/* Left/Main Side: Canvas + Floating Close Button */}
            <div className="relative z-10 flex-1 h-full min-w-0 flex flex-col pointer-events-auto">
                <div className="relative w-full h-full transform transition-all animate-in zoom-in-95 duration-500 overflow-hidden border-[8px] border-white/40 rounded-[2.5rem] shadow-2xl bg-[#FAFAFC]">
                    {/* Floating Close Button in Top Left of Canvas border context */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 left-4 z-50 w-12 h-12 bg-white/95 backdrop-blur-md hover:bg-red-50 hover:text-red-500 text-slate-500 rounded-2xl shadow-xl border border-slate-200/50 flex items-center justify-center transition-all active:scale-90"
                    >
                        <X size={24} strokeWidth={2.5} />
                    </button>

                    <ReplayCanvas state={replayState} isLoading={isLoading} engine={engine} />
                </div>
            </div>

            {/* Right Side: Sidebar Panel */}
            <div className="relative z-10 w-80 flex flex-col gap-6 pointer-events-auto shrink-0 transform transition-all animate-in slide-in-from-right-8 h-full">

                {/* Header Info */}
                <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-slate-200/50 flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0">
                            <Activity size={24} className="animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-slate-800 uppercase tracking-tighter text-sm">Playback</h3>
                            </div>
                            <p className="text-xs font-bold text-slate-400 mt-0.5">
                                {isLoading ? 'Fetching...' : `${events.length} operations`}
                            </p>
                        </div>
                    </div>
                    {currentEvent && (
                        <div className="bg-slate-50 py-2.5 px-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-500 text-center border border-indigo-100/50">
                            {currentEvent.type || 'Update'} • {new Date(currentEvent.timestamp).toLocaleTimeString()}
                        </div>
                    )}
                </div>

                {/* Main Controls */}
                <div className="flex-1 bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-slate-200/50 p-6 flex flex-col items-center gap-8 justify-center min-h-0">

                    <button
                        onClick={handlePlayPause}
                        className={`w-28 h-28 rounded-[2rem] transition-all shadow-2xl active:scale-95 flex items-center justify-center ${isPlaying ? 'bg-slate-900 text-white shadow-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'}`}
                    >
                        {isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2" />}
                    </button>

                    <button
                        onClick={handleReset}
                        className="w-14 h-14 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all active:scale-90"
                        title="Reset Timeline"
                    >
                        <RotateCcw size={24} />
                    </button>

                    <div className="w-full flex flex-col gap-3 mt-4">
                        <div className="relative group w-full">
                            <input
                                type="range"
                                min="-1"
                                max={events.length > 0 ? events.length - 1 : 0}
                                value={currentIndex}
                                onChange={handleSliderChange}
                                className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:bg-slate-200 transition-colors relative z-10"
                            />
                            {/* Visual Progress Bar overlay */}
                            <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-3 bg-indigo-500/20 rounded-full pointer-events-none z-0"
                                style={{ width: `${events.length > 0 ? ((currentIndex + 1) / events.length) * 100 : 0}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Start</span>
                            <span className="text-sm font-black text-indigo-600 tabular-nums bg-indigo-50 px-3 py-1 rounded-xl">
                                {(currentIndex + 1).toString().padStart(2, '0')} <span className="text-indigo-300 font-bold mx-0.5">/</span> {events.length.toString().padStart(2, '0')}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full mt-auto">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Playback Speed</span>
                        <div className="flex items-center justify-between bg-slate-100/50 rounded-2xl p-1.5 border border-slate-200/50 w-full">
                            {[0.5, 1, 2, 5].map(speed => (
                                <button
                                    key={speed}
                                    onClick={() => {
                                        setPlaybackSpeed(speed);
                                        if (replayManagerRef.current) {
                                            replayManagerRef.current.setSpeed(speed);
                                        }
                                    }}
                                    className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${playbackSpeed === speed ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'}`}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Visual focus hint for the canvas */}
            <div className="absolute inset-0 border-[16px] border-indigo-500/5 pointer-events-none transition-opacity duration-1000" />
        </div>
    );
};

export default TimelineControls;
