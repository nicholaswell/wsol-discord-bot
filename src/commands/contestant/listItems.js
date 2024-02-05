const Contestant = require('../../models/Contestant');
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'listitems',
    description: 'List the items you or another user own.',
    options: [
        {
            name: 'user',
            type: ApplicationCommandOptionType.Mentionable,
            description: 'The user to list items for.',
            required: false, // This makes the option not mandatory
        },
    ],

    callback: async (client, interaction) => {
        try {
            let targetUser = interaction.options.getUser('user') || interaction.user;

            // Find the contestant in the database
            const contestant = await Contestant.findOne({ id: targetUser.id });

            if (!contestant) {
                interaction.reply('Contestant not found in the database.');
                return;
            }

            // Check if the contestant has any items
            if (contestant.itemsOwned.length === 0) {
                interaction.reply(`${contestant.name} doesn't own any items.`);
                return;
            }

            // Format the list of items
            const itemList = contestant.itemsOwned.map(item => item.itemName).join(', ');

            interaction.reply(`**${contestant.name} owns the following items:** ${itemList}`);
        } catch (error) {
            console.error('Error in listitems command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};
