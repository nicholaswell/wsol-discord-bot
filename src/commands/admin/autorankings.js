const config = require('../../../config.json');
const axios = require('axios');
const Contestant = require('../../models/Contestant');
const { ApplicationCommandOptionType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const RankingsState = require('../../models/RankingsState');

module.exports = {
    name: 'autorankings',
    description: 'Automatically does the rankings in rankings channel based on spreadsheet placements.',
    devOnly: true,
    options: [
        {
            name: 'action',
            description: 'Action to perform (start, continue, end)',
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                {
                    name: 'Start',
                    value: 'start'
                },
                {
                    name: 'Continue',
                    value: 'continue'
                },
                {
                    name: 'End',
                    value: 'end'
                }
            ]
        }
    ],

    callback: async (client, interaction) => {
        try {
            await interaction.deferReply({ ephemeral: true }); // Defer initial reply and make it ephemeral

            // Get action from user input
            const action = interaction.options.getString('action');

            switch (action) {
                case 'start':
                    await startRankings(interaction);
                    break;
                case 'continue':
                    await continueRankings(interaction);
                    break;
                case 'end':
                    await endRankings(interaction);
                    break;
                default:
                    await interaction.editReply({ content: 'Invalid action.', ephemeral: true }); // Make reply ephemeral
                    break;
            }
        } catch (error) {
            console.error('Error in autorankings command:', error);
            await interaction.editReply({ content: 'An error occurred while processing the command.', ephemeral: true }); // Make reply ephemeral
        }
    },
};

async function startRankings(interaction) {
    try {
        // Clear existing rankings state
        await RankingsState.deleteMany({});

        // Create new rankings state with currentIndex set to 0
        await RankingsState.create({ currentIndex: 0, isRunning: true });

        await interaction.editReply({ content: 'Autorankings started. Use the `/autorankings continue` command to process the rankings.', ephemeral: true });
    } catch (error) {
        console.error('Error in startRankings:', error);
        await interaction.editReply({ content: 'An error occurred while starting autorankings.', ephemeral: true }); // Make reply ephemeral
    }
}

async function continueRankings(interaction) {
    try {
        // Retrieve rankings state from MongoDB
        const rankingsState = await RankingsState.findOne();

        if (!rankingsState || !rankingsState.isRunning) {
            await interaction.editReply({ content: 'Autorankings is not running or has been paused.', ephemeral: true }); // Make reply ephemeral
            return;
        }

        // Process rankings
        await processRankings(interaction.client);

        await interaction.editReply({ content: 'Autorankings continued.', ephemeral: true }); // Make reply ephemeral
    } catch (error) {
        console.error('Error in continueRankings:', error);
        await interaction.editReply({ content: 'An error occurred while continuing autorankings.', ephemeral: true }); // Make reply ephemeral
    }
}

async function endRankings(interaction) {
    try {
        // Clear existing rankings state
        await RankingsState.deleteMany({});

        await interaction.editReply({ content: 'Autorankings ended. Use the `/autorankings start` command to start the rankings again.', ephemeral: true }); // Make reply ephemeral
    } catch (error) {
        console.error('Error in endRankings:', error);
        await interaction.editReply({ content: 'An error occurred while ending autorankings.', ephemeral: true }); // Make reply ephemeral
    }
}

async function processRankings(client) {
    try {
        // Retrieve rankings state from MongoDB
        const rankingsState = await RankingsState.findOne();

        if (!rankingsState || !rankingsState.isRunning) {
            return;
        }

        // Retrieving Data from the Google Sheets via API
        const response = await axios.get('https://sheetdb.io/api/v1/buwmalz8z9x9j?sheet=WSOL');
        const data = response.data;

        // Extract names from data returned from API
        const names = data.map(row => row['']).filter(Boolean);

        // Rankings Channel Id
        const rankingsChannelId = config.rankingChannelId;
        const rankingsChannel = client.channels.cache.get(rankingsChannelId);

        let i = rankingsState.currentIndex

        // Loop through names starting from currentIndex
            const name = names[i];
        
            const contestantImageFileName = `${name}.png`; // Assuming the image file name matches the contestant's name

            const contestantImageFilePath = path.join(__dirname, '../../images/contestants', contestantImageFileName);
            const borderImagePath = path.join(__dirname, '../../images/borders/secondaryborder.png');
        
            if(names[i] === null){
                rankingsState.currentIndex = 0;
				await rankingsChannel.send({
                files: [borderImagePath],
            	});
                return;
            }
        
            const contestant = await Contestant.findOne({ name });

            const userId = contestant.id;

            await rankingsChannel.send({
                files: [borderImagePath],
            });

            function toOrdinal(number) {
                const suffixes = ["th", "st", "nd", "rd"];
                const suffix = number % 100 > 10 && number % 100 < 14 ? suffixes[0] : suffixes[number % 10] || suffixes[0];
                return `${number}${suffix}`;
            }

            // Check if the contestant image file exists
            if (fs.existsSync(contestantImageFilePath)) {
                // Post contestant image in the rankings channel
                console.log(`Posting ${name}'s image`);

                // Send message with image to rankings channel
                await rankingsChannel.send({
                    content: `Tonight in **${toOrdinal(i + 1)} place** is... <@${userId}>`,
                    files: [contestantImageFilePath],
                });
            }

            // Update currentIndex in rankings state
            await RankingsState.updateOne({}, { currentIndex: i + 1 });

    } catch (error) {
        console.error('Error in processRankings:', error);
    }
}
