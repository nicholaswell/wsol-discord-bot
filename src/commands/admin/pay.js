const Contestant = require('../../models/Contestant');
const { ApplicationCommandOptionType, PermissionFlagBits } = require('discord.js');
const updateLeaderboardMessage = require('../../editMessage/updateLeaderboardMessage');
const LEADERBOARD_CHANNEL_ID = '1175250077997072410';

module.exports = {
    name: 'pay',
    description: 'Pays a user a specific amount of money.',
    devOnly: true,
    options: [
        {
            name: 'user',
            description: 'The user to pay the money to.',
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
                // Add the specified amount to the existing money
                contestant.money += amount;
                await contestant.save();

                interaction.reply(`Successfully paid $${amount} to ${user.displayName}.`);
                const leaderboardTargetChannel = client.channels.cache.get(LEADERBOARD_CHANNEL_ID);
                await updateLeaderboardMessage(client, leaderboardTargetChannel);

            } else {
                interaction.reply('Contestant not found in the database.');
            }
        } catch (error) {
            console.error('Error in pay command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};