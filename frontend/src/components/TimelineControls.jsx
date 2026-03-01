import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, FastForward, SkipBack, SkipForward, Clock } from 'lucide-react';
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
            const manager = new ReplayManager(canvasId, (state) => {
                // state is { layers, objects }
                engine.setReplayState(state);
            });

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
                setCurrentIndex(replayManagerRef.current.currentIndex);
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

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl p-6 transition-all animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800">Timeline Replay</h3>
                            <p className="text-xs text-slate-500">
                                {isLoading ? 'Loading events...' : `${events.length} events recorded`}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                    >
                        <SkipBack size={20} className="rotate-90" />
                    </button>
                </div>

                <div className="flex items-center gap-6">
                    <button
                        onClick={handleReset}
                        className="p-3 text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
                        title="Reset"
                    >
                        <RotateCcw size={20} />
                    </button>

                    <button
                        onClick={handlePlayPause}
                        className={`p-4 rounded-2xl transition-all shadow-lg ${isPlaying ? 'bg-slate-800 text-white hover:bg-slate-900' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                    </button>

                    <div className="flex-1 flex flex-col gap-2">
                        <input
                            type="range"
                            min="-1"
                            max={events.length - 1}
                            value={currentIndex}
                            onChange={handleSliderChange}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                            <span>Start</span>
                            <span>{currentIndex + 1} / {events.length}</span>
                            <span>Live</span>
                        </div>
                    </div>

                    <div className="flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-100">
                        {[0.5, 1, 2, 5].map(speed => (
                            <button
                                key={speed}
                                onClick={() => setPlaybackSpeed(speed)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${playbackSpeed === speed ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {speed}x
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimelineControls;
