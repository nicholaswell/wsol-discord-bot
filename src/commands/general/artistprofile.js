const { ApplicationCommandOptionType, ApplicationCommandType } = require('discord.js');
const Canvas = require('canvas');
const { parse } = require('csv-parse');
const fs = require('fs');
const path = require('path');

// Load the CSV file path
const dataFilePath = path.resolve(__dirname, '../../../sheets/9292024songsubmissions.csv');
let submissionsData = [];

// Function to load the CSV data
async function loadCsvData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(dataFilePath)
            .pipe(parse({ columns: true }))
            .on('data', (row) => {
                submissionsData.push(row);
            })
            .on('end', () => {
              
                resolve();
            })
            .on('error', (error) => {
                console.error('Error processing CSV file:', error);
                reject(error);
            });
    });
}

// Load CSV data when the file is loaded
(async () => {
    await loadCsvData();
})();

module.exports = {
    name: 'artistprofile',
    description: 'Generate a music profile visualization for a specific artist and season.',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'season',
            description: 'Select the season',
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        },
        {
            name: 'artist',
            description: 'Select the artist',
            type: ApplicationCommandOptionType.String,
            required: true,
            autocomplete: true,
        },
    ],

    callback: async (client, interaction) => {
        // Check if data is still loading
        if (submissionsData.length === 0) {
            await interaction.reply({ content: 'Data is still loading. Please try again shortly.', ephemeral: true });
            return; // Prevent further execution
        }

        const selectedSeason = interaction.options.getString('season');
        const selectedArtist = interaction.options.getString('artist');

        // Filter the data based on the selected season and artist
        const filteredData = submissionsData.filter(
            (row) => row.Season === selectedSeason && row.Artist === selectedArtist
        );

        if (filteredData.length === 0) {
            await interaction.reply({ content: `No data found for ${selectedArtist} in Season ${selectedSeason}.`, ephemeral: true });
            return; // Prevent further execution
        }

        // Defer the reply to give more time for processing
        await interaction.deferReply();

        try {
            const backgroundImagePath = path.resolve(__dirname, '../../images/cards/card-design-2.png');

            // Calculate dynamic canvas height based on the number of songs
            const baseHeight = 350; // Base height for header and initial spacing
            const songHeight = 50; // Height for each song entry
            const totalHeight = baseHeight + filteredData.length * songHeight; // Calculate total height dynamically

            // Set a fixed canvas width and dynamic height
            const canvasWidth = 1280;
            const canvasHeight = totalHeight > 1600 ? 1600 : totalHeight; // Max height is set to 1055, adjust as needed

            // Create the canvas with fixed width and dynamic height
            const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
            const ctx = canvas.getContext('2d');

            // Load the background image
            const backgroundImage = await Canvas.loadImage(backgroundImagePath);

            // Draw the background image on the canvas (crop it if canvasHeight < image height)
            ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);

            // Header and artist information
            ctx.font = 'bold 40px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`${selectedSeason}`, 50, 90);

            ctx.font = 'bold 40px Roboto';
            ctx.fillText(`WSOL ARTIST PROFILE`, 725, 90);

            ctx.font = 'bold 75px Arial';
            ctx.fillText(`${selectedArtist}`, 50, 180);
            ctx.font = '50px Arial';
            ctx.fillText(`played by ${filteredData[0]['Author'] || 'N/A'}`, 50, 250); // Fixed access to 'Author'

            // Function to truncate text if it exceeds the maximum length
            function truncateText(text, maxLength) {
                if (text.length > maxLength) {
                    return text.slice(0, maxLength - 3) + '...'; // Truncate and add ellipses
                }
                return text;
            }

            // Set font and text styling for song entries
            ctx.font = '30px Arial';
            ctx.fillStyle = '#ffffff';
            const maxThemeLength = 20; // Maximum length for the theme text
            const maxSongTitleLength = 50; // Maximum length for the song title
            const lineHeight = 50; // Height between lines
            const maxYPosition = canvasHeight - 50; // Max Y position to ensure content fits within the canvas

            // Draw song entries but stop if they exceed the canvas height
            filteredData.forEach((row, index) => {
                const yPosition = 350 + index * lineHeight; // Calculate Y position based on the number of songs

                // Ensure we don't draw outside of the canvas height
                if (yPosition > maxYPosition) return; // Stop drawing if we exceed the canvas height

                // Get and truncate the theme and song title
                const themeText = truncateText(`${row['Theme'] || 'N/A'}`, maxThemeLength);
                const songTitleText = truncateText(`${row['Song Title'] || 'N/A'}`, maxSongTitleLength);

                // Set font for the bold part (Theme)
                ctx.font = 'bold 30px Arial';
                ctx.fillText(themeText, 50, yPosition); // Draw the Theme

                // Set font for the regular part (Song Title)
                ctx.font = '30px Arial';
                const songTitleXPosition = ctx.measureText(themeText).width + 100; // Calculate x position after Theme text
                ctx.fillText(songTitleText, songTitleXPosition, yPosition); // Draw the Song Title
            });

            // Convert the canvas to a buffer and send the image as a response
            const attachment = canvas.toBuffer();
            await interaction.editReply({ files: [{ attachment, name: 'musicprofile.png' }] });

        } catch (error) {
            console.error(`Error while generating or sending the image:`, error);
            await interaction.editReply({ content: 'There was an error generating the music profile image.', ephemeral: true });
        }
    },

    autocomplete: async (interaction) => {
        const focusedOption = interaction.options.getFocused(true);  // Get the focused option

        // Check if the data is ready before providing suggestions
        if (submissionsData.length === 0) {
            await interaction.respond([{ name: 'Data is still loading...', value: 'loading' }]);
            return; // Prevent further execution
        }

        // Handle autocomplete for "season" option
        if (focusedOption.name === 'season') {
            const uniqueSeasons = [...new Set(submissionsData.map(row => row.Season.trim()))];
            const filteredSeasons = uniqueSeasons.filter(season =>
                season.toLowerCase().includes(focusedOption.value.toLowerCase())
            ).filter(season => season.length > 0); // Ensure no empty suggestions

            await interaction.respond(filteredSeasons.map(season => ({ name: season, value: season })));

        // Handle autocomplete for "artist" option
        } else if (focusedOption.name === 'artist') {
            const uniqueArtists = [...new Set(submissionsData.map(row => row.Artist.trim()))];
            const filteredArtists = uniqueArtists.filter(artist =>
                artist.toLowerCase().includes(focusedOption.value.toLowerCase())
            ).filter(artist => artist.length > 0); // Ensure no empty suggestions

            await interaction.respond(filteredArtists.slice(0, 25).map(artist => ({ name: artist, value: artist })));
        }
    }
};
