const { EmbedBuilder } = require('discord.js');
const Contestant = require('../models/Contestant')

async function updateLeaderboard(client, targetChannel) {
    try {
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

        // Collect the messages in the leaderboard channel
        const messages = await targetChannel.messages.fetch();

        // Find the original leaderboard message
        const leaderboardMessage = messages.find(
            (message) => message.author.id === client.user.id && message.embeds.length > 0
        );

        // If the leaderboard message exists, update it; otherwise, send a new one
        if (leaderboardMessage) {
            await leaderboardMessage.edit({ embeds: [embed] });
        } else {
            await targetChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Error in updateLeaderboard function:', error);
    }
}

module.exports = updateLeaderboard;
