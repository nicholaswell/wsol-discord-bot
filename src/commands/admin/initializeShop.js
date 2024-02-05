const { EmbedBuilder } = require('discord.js');
const Shop = require('../../models/Shop')
const config = require('../../../config.json')
const targetChannelId = config.shopChannelId;

module.exports = {
    name: 'initializeshop',
    description: 'Initializes the shop in the shop channel.',
    devOnly: true, 
    options: [],
    
    callback: async (client, interaction) => {
        try {
            // Variable for the target channel
            const targetChannel = client.channels.cache.get(targetChannelId);

            const shopItems = await Shop.find();

            const embed = new EmbedBuilder()
                 .setColor([0, 255, 255])
                 .setTitle('Shop')
                 .setDescription(`Welcome to the shop! Here are the available items: \n\n`);

            shopItems.forEach((item) => {
                embed.addFields({ name: item.name, value: `$${item.price} \n ${item.description} \n *Left Remaining: ${item.remaining}* \n\n`});
            });
            
            targetChannel.send({ embeds: [embed] });
            interaction.reply("Initialized the shop in #shop.");
    
        } catch (error) {
            console.error('Error in initializeshop command:', error);
        }
    }
}
