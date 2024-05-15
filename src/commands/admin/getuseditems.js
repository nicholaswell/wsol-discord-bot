const Contestant = require('../../models/Contestant');
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'getuseditems',
    description: 'Get a list of all used items in the database.',
    devOnly: true,

    callback: async (client, interaction) => {
        try {
            // Fetch all contestants from the database
            const allContestants = await Contestant.find();

            // Filter contestants to get only those who have used items
            const contestantsWithUsedItems = allContestants.filter(contestant => {
                return contestant.itemsOwned.some(item => item.used);
            });

            // Check if there are any contestants with used items
            if (contestantsWithUsedItems.length === 0) {
                interaction.reply('There are no used items in the database.');
                return;
            }

            // Format and send the list of used items
            let message = '**List of items being used by each contestant:**\n\n';
            contestantsWithUsedItems.forEach(contestant => {
                message += `**${contestant.name}:**\n`;
                contestant.itemsOwned.forEach(item => {
                    if (item.used) {
                        message += `- ${item.itemName}`;
                        if (item.usedOn) {
                            message += ` (Used on: ${item.usedOn})`;
                        }
                        message += '\n';
                    }
                });
            });

            interaction.reply(message);
        } catch (error) {
            console.error('Error in useditems command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};
