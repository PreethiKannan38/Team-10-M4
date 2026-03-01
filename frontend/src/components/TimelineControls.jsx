import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Clock, Activity, Layout } from 'lucide-react';
import ReplayManager from '../Engine/managers/ReplayManager';

const TimelineControls = ({ canvasId, engine, isOpen, onClose }) => {
    const [events, setEvents] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const replayManagerRef = useRef(null);

    useEffect(() => {
        if (isOpen && canvasId) {
            const manager = new ReplayManager(
                canvasId,
                (state) => engine.setReplayState(state),
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
                engine.setReplayState(null);
            }
        };
    }, [isOpen, canvasId, engine]);

    const handlePlayPause = () => {
        if (isPlaying) {
            replayManagerRef.current.pause();
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            replayManagerRef.current.play(playbackSpeed, () => {
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
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between p-8 pointer-events-none">
            {/* Backdrop & Click-away */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto transition-all animate-in fade-in"
                onClick={onClose}
            />

            {/* Premium Header */}
            <div className="relative z-10 w-full max-w-5xl flex justify-between items-start pointer-events-none">
                <div className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl shadow-2xl border border-slate-200/50 flex items-center gap-4 pointer-events-auto transform transition-all animate-in slide-in-from-top-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <Activity size={20} className="animate-pulse" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-slate-800 uppercase tracking-tighter text-sm">Playback Active</h3>
                            <span className="px-2 py-0.5 bg-indigo-50 text-[10px] font-black text-indigo-600 rounded-full uppercase tracking-widest">
                                Live View Locked
                            </span>
                        </div>
                        <p className="text-xs font-bold text-slate-400">
                            {isLoading ? 'Fetching history...' : `Exploring ${events.length} canvas operations`}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-2 items-end pointer-events-auto">
                    <button
                        onClick={onClose}
                        className="w-12 h-12 bg-white/95 backdrop-blur-md hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-2xl shadow-xl border border-slate-200/50 flex items-center justify-center transition-all active:scale-90"
                    >
                        <X size={24} />
                    </button>
                    {currentEvent && (
                        <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-200/50 text-[10px] font-black uppercase tracking-widest text-slate-500 animate-in slide-in-from-right-4">
                            {currentEvent.type || 'Update'} • {new Date(currentEvent.timestamp).toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </div>

            {/* The Dedicated Replay "Window" Controls */}
            <div className="relative z-10 w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-slate-200/50 p-8 mb-4 pointer-events-auto transform transition-all animate-in slide-in-from-bottom-8">
                <div className="flex items-center gap-8">
                    <button
                        onClick={handleReset}
                        className="w-14 h-14 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all active:scale-90"
                        title="Reset Timeline"
                    >
                        <RotateCcw size={24} />
                    </button>

                    <button
                        onClick={handlePlayPause}
                        className={`w-20 h-20 rounded-[1.75rem] transition-all shadow-xl active:scale-95 flex items-center justify-center ${isPlaying ? 'bg-slate-900 text-white shadow-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'}`}
                    >
                        {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </button>

                    <div className="flex-1 flex flex-col gap-4">
                        <div className="relative group">
                            <input
                                type="range"
                                min="-1"
                                max={events.length - 1}
                                value={currentIndex}
                                onChange={handleSliderChange}
                                className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:bg-slate-200 transition-colors"
                            />
                            {/* Visual Progress Bar */}
                            <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-3 bg-indigo-500/20 rounded-full pointer-events-none"
                                style={{ width: `${((currentIndex + 1) / events.length) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Beginning</span>
                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className="text-sm font-black text-indigo-600 tabular-nums">
                                    {(currentIndex + 1).toString().padStart(2, '0')} <span className="text-slate-300 font-bold mx-0.5">/</span> {events.length.toString().padStart(2, '0')}
                                </span>
                            </div>
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Current Tip</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Playback Speed</span>
                        <div className="flex items-center bg-slate-100/50 rounded-2xl p-1 border border-slate-200/50">
                            {[0.5, 1, 2, 5].map(speed => (
                                <button
                                    key={speed}
                                    onClick={() => setPlaybackSpeed(speed)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${playbackSpeed === speed ? 'bg-white text-indigo-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual focus hint for the canvas */}
            <div className="absolute inset-0 border-[16px] border-indigo-500/10 pointer-events-none transition-opacity duration-1000" />
        </div>
    );
};

export default TimelineControls;
