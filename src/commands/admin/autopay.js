const Contestant = require('../../models/Contestant');
const { ApplicationCommandOptionType, PermissionFlagBits } = require('discord.js');
const updateLeaderboardMessage = require('../../editMessage/updateLeaderboardMessage');
const config = require('../../../config.json')
const axios = require('axios');


module.exports = {
    name: 'autopay',
    description: 'Auto pays from the WSOL spreadsheet based on placements and distribution amount.',
    devOnly: true,
    options: [
        {
            name: 'amount',
            description: 'The amount to be distributed.',
            type: ApplicationCommandOptionType.Integer,
            required: true,
        }
    ],

    callback: async (client, interaction) => {
        try {
            // Get the payment amount from the command input
            const totalAmount = interaction.options.getInteger('amount');

            // Make API request to retrieve data from the "WSOL" sheet
            const response = await axios.get('https://sheetdb.io/api/v1/buwmalz8z9x9j?sheet=WSOL');
            const data = response.data;

            // Process the response to extract names as an array
            const names = data.map(row => row['']).filter(Boolean);

            // Calculate base amount per person
            const baseAmount = Math.floor(totalAmount / names.length);

            // Loop through names array and pay each person accordingly
            for (let i = 0; i < names.length - 1; i++) {
                const name = names[i];

                // Calculate payment amount for this person
                const paymentAmount = (baseAmount * (names.length - i))+2;

                // Find the corresponding person in the database using their name
                const contestant = await Contestant.findOne({ name: name });

                // Update the database with the calculated payment amount for this person
                if (contestant) {
                    contestant.money += paymentAmount;
                    await contestant.save();
                }
            }

            interaction.reply(`Successfully distributed $${totalAmount} among contestants.`);
            const leaderboardTargetChannel = client.channels.cache.get(config.leaderboardChannelId);

            // Update Leaderboard Message
            await updateLeaderboardMessage(client, leaderboardTargetChannel);
        } catch (error) {
            console.error('Error in autopay command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};