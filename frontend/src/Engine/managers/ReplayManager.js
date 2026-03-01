import * as Y from 'yjs';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

class ReplayManager {
    constructor(canvasId, onUpdate) {
        this.canvasId = canvasId;
        this.onUpdate = onUpdate; // Callback to notify UI of state changes
        this.replayDoc = new Y.Doc();
        this.events = [];
        this.currentIndex = -1;
        this.isReplaying = false;

        // Listen for changes in the shadow doc
        this.replayDoc.on('update', () => {
            if (this.onUpdate) {
                // Return the current state (layers and objects)
                const layers = this.replayDoc.getArray('layers').toJSON();
                const objects = this.replayDoc.getMap('objects').toJSON();
                this.onUpdate({ layers, objects });
            }
        });
    }

    async fetchTimeline() {
        try {
            const token = localStorage.getItem('token');
            // Fixed URL construction to use API_BASE_URL
            const response = await axios.get(`${API_BASE_URL}/canvas/${this.canvasId}/timeline`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            this.events = response.data.events || [];
            console.log(`[Replay] Loaded ${this.events.length} events for ${this.canvasId}`);
            return this.events;
        } catch (error) {
            console.error('[Replay] Failed to fetch timeline:', error);
            this.events = [];
            throw error;
        }
    }

    /**
     * Replays events up to a specific index
     * @param {number} targetIndex 
     */
    async jumpTo(targetIndex) {
        if (targetIndex < -1 || targetIndex >= this.events.length) return;

        // Reset the doc if we are jumping backwards
        if (targetIndex < this.currentIndex) {
            this.replayDoc = new Y.Doc();
            // Re-attach listener
            this.replayDoc.on('update', () => {
                if (this.onUpdate) {
                    const layers = this.replayDoc.getArray('layers').toJSON();
                    this.onUpdate(layers);
                }
            });
            this.currentIndex = -1;
        }

        // Apply updates one by one from current + 1 to target
        for (let i = this.currentIndex + 1; i <= targetIndex; i++) {
            const event = this.events[i];
            const binaryUpdate = Uint8Array.from(atob(event.update), c => c.charCodeAt(0));
            Y.applyUpdate(this.replayDoc, binaryUpdate);
        }

        this.currentIndex = targetIndex;
    }

    /**
     * Plays the timeline sequentially
     * @param {number} speed Multiplier for playback speed
     */
    async play(speed = 1, onComplete) {
        if (this.isReplaying || this.currentIndex >= this.events.length - 1) {
            if (onComplete) onComplete();
            return;
        }

        this.isReplaying = true;

        while (this.isReplaying && this.currentIndex < this.events.length - 1) {
            const nextIndex = this.currentIndex + 1;
            const currentEvent = this.events[this.currentIndex];
            const nextEvent = this.events[nextIndex];

            // Calculate delay based on actual timestamps
            let delay = 100; // Default fallback delay
            if (currentEvent && nextEvent) {
                const diff = new Date(nextEvent.timestamp) - new Date(currentEvent.timestamp);
                delay = Math.min(Math.max(diff / speed, 50), 2000); // Bound between 50ms and 2s
            }

            await new Promise(resolve => setTimeout(resolve, delay));

            if (!this.isReplaying) break;

            await this.jumpTo(nextIndex);
        }

        this.isReplaying = false;
        if (onComplete) onComplete();
    }

    pause() {
        this.isReplaying = false;
    }

    reset() {
        this.pause();
        this.replayDoc = new Y.Doc();
        this.currentIndex = -1;
    }
}

export default ReplayManager;
