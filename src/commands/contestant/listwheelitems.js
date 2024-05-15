const Spinner = require('../../models/Spinner');
const { EmbedBuilder } = require('discord.js');
const config = require('../../../config.json');

module.exports = {
    name: 'listwheelitems',
    description: 'Lists the items on Wuuf\'s Wheel of Fortune with quantities and chances.',
    callback: async (client, interaction) => {
        try {
            // Fetch the spinner data
            const spinner = await Spinner.findOne({ name: 'Wuuf\'s Wheel of Fortune' });
            if (!spinner || spinner.itemsOwned.length === 0) {
                return interaction.reply('The wheel is empty. No items available.');
            }

            // Count the quantity of each item
            const itemCounts = spinner.itemsOwned.reduce((counts, item) => {
                counts[item.itemName] = (counts[item.itemName] || 0) + 1;
                return counts;
            }, {});

            // Calculate total items
            const totalItems = spinner.itemsOwned.length;

            // Generate the list of items with quantities and chances
            let itemList = '';
            for (const [itemName, quantity] of Object.entries(itemCounts)) {
                const chance = ((quantity / totalItems) * 100).toFixed(2);
                itemList += `**${itemName}**: ${quantity} (Chance: ${chance}%)\n`;
            }

            // Create an embed to display the list
            const listEmbed = new EmbedBuilder()
                .setTitle('Wuuf\'s Wheel of Fortune Items')
                .setDescription(itemList)
                .setColor(config.color);

            // Send the embed
            interaction.reply({ embeds: [listEmbed] });
        } catch (error) {
            console.error('Error in listwheel command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};
