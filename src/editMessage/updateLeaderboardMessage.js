const { MessageEmbed } = require('discord.js');
const Contestant = require('../models/Contestant');
const Eliminated = require('../models/Eliminated');

async function updateLeaderboard(client, targetChannel) {
    try {
        // Fetch all contestants from the database
        const contestants = await Contestant.find();

        // Fetch eliminated information
        const eliminatedInfo = await Eliminated.findOne();

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
            if ((index + 1) % 25 === 0 || index === contestants.length - 1) {
                // Push the current embed to the array
                embeds.push(embed);
                // Create a new embed for the next chunk of contestants
                embed = new MessageEmbed()
                    .setColor([0, 255, 255])
                    .setTitle('Leaderboard')
                    .setDescription('Continuation of the leaderboard:\n\n');
            }
        });

        // Collect the messages in the leaderboard channel
        const messages = await targetChannel.messages.fetch();

        // Find the original leaderboard message
        const leaderboardMessage = messages.find(
            (message) => message.author.id === client.user.id && message.embeds.length > 0
        );

        // If the leaderboard message exists, update it; otherwise, send a new one
        if (leaderboardMessage) {
            // If there are multiple embeds, update the original message with all embeds
            for (const embed of embeds) {
                await leaderboardMessage.edit({ embeds: [embed] });
            }
        } else {
            // If there are multiple embeds, send them all as separate messages
            for (const embed of embeds) {
                await targetChannel.send({ embeds: [embed] });
            }
        }
    } catch (error) {
        console.error('Error in updateLeaderboard function:', error);
    }
}

module.exports = updateLeaderboard;
