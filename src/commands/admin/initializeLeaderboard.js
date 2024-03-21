const { MessageEmbed } = require('discord.js');
const Contestant = require('../../models/Contestant');
const Eliminated = require('../../models/Eliminated'); 
const config = require('../../../config.json');

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

            // Create an array to hold embeds
            const embeds = [];

            // Create an initial embed for the leaderboard
            let embed = new MessageEmbed()
                .setColor([224,9,120])
                .setTitle('Leaderboard')
                .setDescription('Here are the current standings on the leaderboard:\n\n');

            // Add each contestant's information to the embed
            contestants.forEach((contestant, index) => {
                embed.addFields({ name: contestant.name, value: `$${contestant.money}\n\n` });
                // If we've reached 25 contestants or this is the last contestant
                if ((index + 1) % 23 === 0 || index === contestants.length - 1) {
                    // Push the current embed to the array
                    embeds.push(embed);
                    // Create a new embed for the next chunk of contestants
                    embed = new MessageEmbed()
                        .setColor([0, 255, 255])
                        .setTitle('Leaderboard')
                        .setDescription('Continuation of the leaderboard:\n\n');
                }
            });

            // Send each embed to the leaderboard channel
            for (const embed of embeds) {
                await targetChannel.send({ embeds: [embed] });
            }

            interaction.reply('Initialized the leaderboard.');
        } catch (error) {
            console.error('Error in initializeleaderboard command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};
