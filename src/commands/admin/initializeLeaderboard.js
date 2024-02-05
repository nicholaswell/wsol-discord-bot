const { EmbedBuilder } = require('discord.js');
const Contestant = require('../../models/Contestant');
const Eliminated = require('../../models/Eliminated'); 
const config = require('../../../config.json')
 // Replace with the actual channel ID

module.exports = {
    name: 'initializeleaderboard',
    description: 'Initializes the leaderboard in the designated channel.',
    devOnly: true,
    options: [],

    callback: async (client, interaction) => {
        try {

            const targetChannelId = config.leaderboardChannelId;

            // Variable for the target channel
            const targetChannel = client.channels.cache.get(targetChannelId);

            // Fetch all contestants from the database
            const contestants = await Contestant.find();

            // Create an embed for the leaderboard
            const embed = new EmbedBuilder()
                .setColor([0, 255, 255])
                .setTitle('Leaderboard')
                .setDescription('Here are the current standings on the leaderboard:\n\n');

            // Add each contestant's information to the embed
            contestants.forEach((contestant) => {
                embed.addFields({ name: contestant.name, value: `$${contestant.money}\n\n` });
            });

            // Fetch eliminated information
            const eliminatedInfo = await Eliminated.findOne();

            // Add eliminated information to the embed
            if (eliminatedInfo) {
                embed.addFields({ name: 'LOOT', value: `Items: ${eliminatedInfo.itemsOwned.join(', ')}\nMoney: $${eliminatedInfo.money}` });
            }

            // Send the embed to the leaderboard channel
            targetChannel.send({ embeds: [embed] });
            interaction.reply('Initialized the leaderboard.');
        } catch (error) {
            console.error('Error in initializeleaderboard command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};
