const { EmbedBuilder } = require('discord.js');
const Contestant = require('../../models/Contestant');
const config = require('../../../config.json');

module.exports = {
    name: 'initializechecklist',
    description: 'Initializes the checklist in the designated channel.',
    devOnly: true,
    options: [],

    callback: async (client, interaction) => {
        try {
            const targetChannelId = config.checklistChannelId;
            const targetChannel = client.channels.cache.get(targetChannelId);

            // Fetch contestants from the database
            const contestants = await Contestant.find();

            // Create an embed for the checklist
            const embed = new EmbedBuilder()
                .setTitle('Checklist')
                .setDescription('List of contestants and their submission status:')
                .setColor('#00FFFF'); // Cyan color

            // Add fields for each contestant
            const fields = contestants.map(contestant => {
                const status = contestant.submitted ? '✅ Submitted' : '❌ Not Submitted';
                return { name: contestant.name, value: status };
            });

            embed.addFields(fields);

            // Send the embed to the checklist channel
            targetChannel.send({ embeds: [embed] });

            interaction.reply('Initialized the checklist.');
        } catch (error) {
            console.error('Error in initializechecklist command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};
