const { EmbedBuilder } = require('discord.js');
const Contestant = require('../../models/Contestant');
const targetChannelId = '1175250077997072410'; // Replace with the actual channel ID

module.exports = {
    name: 'initializeleaderboard',
    description: 'Initializes the leaderboard in the designated channel.',
    devOnly: true,
    options: [],

    callback: async (client, interaction) => {
        try {
            // Variable for the target channel
            const targetChannel = client.channels.cache.get(targetChannelId);

            // Fetch all contestants from the database
            const contestants = await Contestant.find();

            // Create an embed for the leaderboard
            const embed = new EmbedBuilder()
                .setColor(297994)
                .setTitle('Leaderboard')
                .setDescription('Here are the current standings on the leaderboard:\n\n');

            // Add each contestant's information to the embed
            contestants.forEach((contestant) => {
                embed.addFields({ name: contestant.name, value: `$${contestant.money}\n\n` });
            });

            // Send the embed to the leaderboard channel
            targetChannel.send({ embeds: [embed] });
            interaction.reply('Initialized the leaderboard.');
        } catch (error) {
            console.error('Error in initializeleaderboard command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};