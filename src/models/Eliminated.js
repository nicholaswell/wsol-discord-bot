const { Schema, model } = require('mongoose');

const eliminatedSchema = new Schema({
    // Use a specific identifier for the single document
    identifier: { type: String, default: 'eliminated' },
    itemsOwned: [{
        itemName: String
    }],
    money: Number,
},
{
    collection: 'eliminated'
}

);

module.exports = model('Eliminated', eliminatedSchema);
