const ShopState = require('../../models/ShopState');

module.exports = {
    name: 'toggleshop',
    description: 'Toggle the shop functionality.',
    devOnly: true, 

    callback: async(client, interaction) => {
        try {
            let shopState = await ShopState.findOne();
            if (!shopState) {
                shopState = await ShopState.create({});
            }

            shopState.isEnabled = !shopState.isEnabled;
            await shopState.save();

            interaction.reply(`Shop ${shopState.isEnabled ? 'enabled' : 'disabled'} successfully.`);
        } catch (error) {
            console.error('Error toggling shop state:', error);
            interaction.reply('An error occurred while toggling the shop state.');
        }
    }
};