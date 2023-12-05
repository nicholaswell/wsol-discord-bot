const Contestant = require('../../models/Contestant');
const { ApplicationCommandOptionType, PermissionFlagBits } = require('discord.js');
const updateLeaderboardMessage = require('../../editMessage/updateLeaderboardMessage');
const LEADERBOARD_CHANNEL_ID = '1175250077997072410';

module.exports = {
    name: 'setmoney',
    description: 'Set the money for a user in the database.',
    devOnly: true,
    options: [
        {
            name: 'user',
            description: 'The user to set the money for.',
            type: ApplicationCommandOptionType.Mentionable,
            required: true,
        },
        {
            name: 'amount',
            description: 'The amount of money to set.',
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
    ],

    callback: async (client, interaction) => {
        try {
            // Extract user and amount from options
            const user = interaction.options.getUser('user');
            const amount = interaction.options.getInteger('amount');

            // Find the contestant in the database
            const contestant = await Contestant.findOne({ name: user.tag });

            if (contestant) {
                // Update the money for the contestant
                contestant.money = amount;
                await contestant.save();

                interaction.reply(`Successfully set ${user.displayName}'s money to **$${amount}**.`);

                const leaderboardTargetChannel = client.channels.cache.get(LEADERBOARD_CHANNEL_ID);
                await updateLeaderboardMessage(client, leaderboardTargetChannel);
                
            } else {
                interaction.reply('Contestant not found in the database.');
            }
        } catch (error) {
            console.error('Error in setmoney command:', error);
            interaction.reply('An error occurred while setting the money.');
        }
    },
};