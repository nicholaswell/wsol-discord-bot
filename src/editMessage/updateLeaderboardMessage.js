const { EmbedBuilder } = require('discord.js');
const Contestant = require('../models/Contestant');
const config = require('../../config.json');

async function updateLeaderboard(client, targetChannel) {
    try {
        const contestants = await Contestant.find();

        const embeds = [];
        let embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('Leaderboard')
            .setDescription('Here are the current standings on the leaderboard:\n\n');

        contestants.forEach((contestant, index) => {
            embed.addFields({ name: contestant.name, value: `$${contestant.money}` });
            if ((index + 1) % 25 === 0 || index === contestants.length - 1) {
                embeds.push(embed);
                embed = new EmbedBuilder()
                    .setColor(config.color)
                    .setTitle('Leaderboard - Continued')
                    .setDescription('Continuation of the leaderboard:\n\n');
            }
        });

        const messageIds = config.leaderboardMessageIds; // Retrieve stored IDs
        if (!messageIds) return;

        for (let i = 0; i < messageIds.length; i++) {
            const messageId = messageIds[i];
            const embed = embeds[i];

            const message = await targetChannel.messages.fetch(messageId);
            if (message) {
                await message.edit({ embeds: [embed] });
            }
        }
    } catch (error) {
        console.error('Error updating leaderboard:', error);
    }
}

module.exports = updateLeaderboard;
