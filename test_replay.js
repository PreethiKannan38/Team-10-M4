const mongoose = require('mongoose');
const Y = require('yjs');
const Event = require('./Backend/models/Event').default; // Need to adjust this since it's ES module

async function testReplay() {
    await mongoose.connect('mongodb://localhost:27017/designdeck'); // adjust URL if needed
    // In our backend, Event model is exported as default. Let's just create a raw mongoose model to bypass ES6 require issues.

    const eventSchema = new mongoose.Schema({}, { strict: false, collection: 'events' });
    const EventModel = mongoose.model('RawEvent', eventSchema);

    const events = await EventModel.find({ canvasId: 'guest-3de4o1a' }).sort({ createdAt: 1 });
    console.log(`Found ${events.length} events`);

    const doc = new Y.Doc();
    events.forEach((ev, i) => {
        const update = ev.update.buffer ? Buffer.from(ev.update.buffer) : ev.update;
        Y.applyUpdate(doc, new Uint8Array(update));

        if (i === events.length - 1) {
            console.log('Final State:');
            console.log('Layers:', doc.getArray('layers').toJSON());
            console.log('Objects:', Object.keys(doc.getMap('objects').toJSON()).length);
        }
    });

    process.exit(0);
}

testReplay().catch(console.error);
