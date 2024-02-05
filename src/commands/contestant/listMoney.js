const Contestant = require('../../models/Contestant');
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'listmoney',
    description: 'Check the amount of money a contestant has.',
    options: [
        {
            name: 'user',
            description: 'The user to check the money for.',
            type: ApplicationCommandOptionType.Mentionable,
            required: false,
        },
    ],

    callback: async (client, interaction) => {
        try {
            // Extract user from options
            const user = interaction.options.getUser('user') || interaction.user;

            // Find the contestant in the database
            const contestant = await Contestant.findOne({ id: user.id });


            if (contestant) {
                interaction.reply(`${contestant.name} has **$${contestant.money}**.`);
            } else {
                interaction.reply('Contestant not found in the database.');
            }
        } catch (error) {
            console.error('Error in listmoney command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};
