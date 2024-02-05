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
        itemName: String
    }],
    money: {
        type: Number,
        default: 0 
    },
    submitted: {
        type: Boolean
    }
},
{
  collection: 'contestants',
});

module.exports = model('Contestant', contestantSchema);
