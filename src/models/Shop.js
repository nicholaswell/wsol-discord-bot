const { Schema, model } = require('mongoose');

const shopSchema = new Schema({
    name: {
        type: String 
    },
    description: {
        type: String 
    },
    price: {
        type: Number
    },
    remaining: {
        type: Number
    }

},
{
  collection: 'shopItems',
});


module.exports = model('Shop' , shopSchema);