const { Schema, model } = require('mongoose');

const spinnerSchema = new Schema({

    name: {
        type: String,
        required: true
    },
    itemsOwned: [{
        itemName: String,

    }],
},
{
    collection: 'spinners',
});

module.exports = model('Spinner', spinnerSchema);
