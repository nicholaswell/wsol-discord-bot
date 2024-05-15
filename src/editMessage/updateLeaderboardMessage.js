const { EmbedBuilder } = require('discord.js');
const Contestant = require('../models/Contestant');
const Eliminated = require('../models/Eliminated'); 
const config = require('../../../config.json');

async function updateLeaderboard(client, targetChannel) {
    try {
        // Fetch all contestants from the database
        const contestants = await Contestant.find();

        // Fetch eliminated information
        const eliminatedInfo = await Eliminated.findOne();

        // Create an embed for the leaderboard
        const embed = new EmbedBuilder()
            .setColor(config.color)
            .setTitle('Leaderboard')
            .setDescription('Here are the current standings on the leaderboard:\n\n');

        // Add each contestant's information to the embed
        contestants.forEach((contestant) => {
            embed.addFields({ name: contestant.name, value: `$${contestant.money}\n\n` });
        });

        // Add eliminated information to the embed
        if (eliminatedInfo) {
            embed.addFields({ name: 'LOOT', value: `Items: ${eliminatedInfo.itemsOwned.join(', ')}\nMoney: $${eliminatedInfo.money}` });
        }

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