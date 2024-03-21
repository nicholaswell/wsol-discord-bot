const { Schema, model } = require('mongoose');

const rankingsStateSchema = new Schema({
    isRunning: {
        type: Boolean,
        default: false // Assuming autorankings is initially disabled
    },
    currentIndex: {
        type: Number,
        default: 0 // Assuming rankings start from index 0
    },
    lastProcessedIndex: {
        type: Number,
        default: 0 // Assuming no rankings have been processed yet
    },
    timeoutId: {
        type: Number,
        default: null // Assuming no timeout initially
    }
},
{
    collection: 'rankingsState'
});

module.exports = model('RankingsState', rankingsStateSchema);
