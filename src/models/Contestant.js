const { Schema, model } = require('mongoose');

const contestantSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    itemsOwned: [{
        itemName: String,
        used: {
            type: Boolean,
            default: false
        },
        usedOn: String
    }],
    money: {
        type: Number,
        default: 0 
    },
    submitted: {
        type: Boolean
    },
    cooldowns: [{
        command: { type: String, required: true }, // Command name or ID
        cooldownExpiration: { type: Date, required: false }, // Cooldown expiration timestamp
    }],
},
{
    collection: 'contestants',
});

module.exports = model('Contestant', contestantSchema);
