const config = require('../../../config.json');
const axios = require('axios');
const Contestant = require('../../models/Contestant');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'autorankings',
    description: 'Automatically does the rankings in rankings channel based on spreadsheet placements.',
    devOnly: true,

    callback: async (client, interaction) => {
        try {
            await interaction.deferReply(); // Defer initial reply

            // Retrieving Data from the Google Sheets via API
            const response = await axios.get('https://sheetdb.io/api/v1/buwmalz8z9x9j?sheet=WSOL');
            const data = response.data;

            // Extract names from data returned from API
            const names = data.map(row => row['']).filter(Boolean);

            // Image Paths
            const contestantImagesPath = path.join(__dirname, '../../images/contestants');
            const borderImagePath = path.join(__dirname, '../../images/borders/secondaryborder.png');

            // Rankings Channel Id
            const rankingsChannelId = config.rankingChannelId;
            const rankingsChannel = client.channels.cache.get(rankingsChannelId);

            await rankingsChannel.send({
                files: [borderImagePath],
            });

            function toOrdinal(number) {
                const suffixes = ["th", "st", "nd", "rd"];
                const suffix = number % 100 > 10 && number % 100 < 14 ? suffixes[0] : suffixes[number % 10] || suffixes[0];
                return `${number}${suffix}`;
            }

            for (let i = 0; i < names.length; i++) {
                const name = names[i];
                const contestantImageFileName = `${name}.png`; // Assuming the image file name matches the contestant's name
                const contestantImageFilePath = path.join(contestantImagesPath, contestantImageFileName);

                const contestant = await Contestant.findOne({ name: name });

                const userId = contestant.id;

                // Check if the contestant image file exists
                if (fs.existsSync(contestantImageFilePath)) {
                    // Post contestant image in the rankings channel
                    await rankingsChannel.send({
                        content: `Tonight in **${toOrdinal(i + 1)} place** is... <@${userId}>`,
                        files: [contestantImageFilePath],
                    });

                    // Wait for 2 minutes
                    await new Promise(resolve => setTimeout(resolve, 45 * 1000));

                    // Send the border image as an attachment to the rankings channel
                    await rankingsChannel.send({
                        files: [borderImagePath],
                    });
                }
            }

            await interaction.editReply('Autorankings completed successfully.'); // Edit interaction reply

        } catch (error) {
            console.error('Error in autorankings command:', error);
            await interaction.editReply('An error occurred while processing the command.'); // Edit interaction reply
        }
    },
};
