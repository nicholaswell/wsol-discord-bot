const Contestant = require('../../models/Contestant');
const Eliminated = require('../../models/Eliminated');
const { ApplicationCommandOptionType } = require('discord.js');
const updateLeaderboardMessage = require('../../editMessage/updateLeaderboardMessage');
const LEADERBOARD_CHANNEL_ID = '1069474006236925983';

module.exports = {
    name: 'eliminate',
    description: 'Eliminate a contestant from the game.',
    devOnly: true,
    options: [
        {
            name: 'user',
            description: 'The user to eliminate.',
            type: ApplicationCommandOptionType.Mentionable,
            required: true,
        },
    ],

    callback: async (client, interaction) => {
        try {
            const user = interaction.options.getUser('user');

            // Find the contestant in the database
            const contestant = await Contestant.findOne({ name: user.tag });

            if (!contestant) {
                interaction.reply('Contestant not found in the database.');
                return;
            }

            // Find the existing document in the Eliminated collection
            const eliminatedDoc = await Eliminated.findOne({ identifier: 'eliminated' });

            // Update the existing document with the contestant's items and money
            const itemsOwnedNames = contestant.itemsOwned.map(item => item.itemName);
            eliminatedDoc.itemsOwned = eliminatedDoc.itemsOwned.concat(itemsOwnedNames);
            eliminatedDoc.money += contestant.money;

            // Save the changes to the Eliminated collection
            await eliminatedDoc.save();

            // Remove the contestant from the Contestant collection
            await Contestant.deleteOne({ name: user.tag });

            // Call the updateLeaderboardMessage method
            const leaderboardTargetChannel = client.channels.cache.get(LEADERBOARD_CHANNEL_ID);
            await updateLeaderboardMessage(client, leaderboardTargetChannel);

            interaction.reply(`Contestant ${user.tag} removed from the database.`);
        } catch (error) {
            console.error('Error in eliminate command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};
