const Contestant = require('../../models/Contestant');
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'listallitems',
    description: 'List all items owned by each contestant.',

    callback: async (client, interaction) => {
        try {
            // Fetch all contestants from the database
            const allContestants = await Contestant.find();

            // Check if there are any contestants in the database
            if (allContestants.length === 0) {
                interaction.reply('There are no contestants in the database.');
                return;
            }

            // Create a message to display the list of items
            let message = `**List of items owned by each contestant:**\n\n`;
            allContestants.forEach(contestant => {
                if (contestant.itemsOwned.length > 0) {
                    message += `**${contestant.name}:**\n`;
                    contestant.itemsOwned.forEach(item => {
                        if (!item.used) {
                            message += `- ${item.itemName}\n`;
                        }
                    });
                }
            });

            interaction.reply(message);
        } catch (error) {
            console.error('Error in listallitems command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};
