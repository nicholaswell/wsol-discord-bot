const Contestant = require('../../models/Contestant');
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'resetuseditems',
    description: 'Remove all used items from each user\'s inventory.',
    devOnly: true, // Restrict the command to developers

    callback: async (client, interaction) => {
        try {
            // Fetch all contestants from the database
            const allContestants = await Contestant.find();

            // Remove used items for each contestant
            for (const contestant of allContestants) {
                contestant.itemsOwned = contestant.itemsOwned.filter(item => !item.used);
                await contestant.save();
            }

            interaction.reply('All used items have been removed from each user\'s inventory.');
        } catch (error) {
            console.error('Error in resetuseditems command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};
