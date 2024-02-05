const { Schema, model } = require('mongoose');

const shopStateSchema = new Schema({
    isEnabled: {
        type: Boolean
    }
},
{
  collection: 'shopState',
});

module.exports = model('ShopState', shopStateSchema);
