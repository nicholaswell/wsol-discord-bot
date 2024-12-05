const { EmbedBuilder } = require('discord.js');
const Contestant = require('../../models/Contestant');
const config = require('../../../config.json');

module.exports = {
    name: 'initializeleaderboard',
    description: 'Initializes the leaderboard in the designated channel.',
    devOnly: true,
    options: [],

    callback: async (client, interaction) => {
        try {
            const targetChannelId = config.leaderboardChannelId;
            const targetChannel = client.channels.cache.get(targetChannelId);

            // Fetch only coaches from the database (where coach: true)
            const coaches = await Contestant.find({ coach: true });

            const embeds = [];
            let embed = new EmbedBuilder()
                .setColor(config.color)
                .setTitle('Leaderboard')
                .setDescription('Here are the current standings on the leaderboard\n\n');

            coaches.forEach((contestant, index) => {
                embed.addFields({ name: contestant.name, value: `$${contestant.money}` });
                if ((index + 1) % 25 === 0 || index === coaches.length - 1) {
                    embeds.push(embed);
                    embed = new EmbedBuilder()
                        .setColor(config.color);
                }
            });

            const messageIds = [];
            for (const embed of embeds) {
                const message = await targetChannel.send({ embeds: [embed] });
                messageIds.push(message.id);
            }

            // Save the message IDs in the config or database
            config.leaderboardMessageIds = messageIds; // Save appropriately
            interaction.reply('Leaderboard initialized for coaches only.');
        } catch (error) {
            console.error('Error in initializeleaderboard:', error);
            interaction.reply('An error occurred while initializing the leaderboard.');
        }
    },
};
