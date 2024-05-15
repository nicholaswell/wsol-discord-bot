const Contestant = require('../../models/Contestant');
const { ApplicationCommandOptionType} = require('discord.js');

module.exports = {
    name: 'additem',
    description: 'Manually add an item to a contestant\'s items.',
    devOnly: true,
    options: [
        {
            name: 'user',
            type: ApplicationCommandOptionType.Mentionable,
            description: 'The contestant to add the item to.',
            required: true,
        },
        {
            name: 'item',
            type: ApplicationCommandOptionType.String,
            description: 'The name of the item to add.',
            required: true,
        }
    ],

    callback: async (client, interaction) => {
        try {

            // Extract user and item from options
            const user = interaction.options.getUser('user');
            const itemName = interaction.options.getString('item');

            // Find the contestant in the database
            const contestant = await Contestant.findOne({ id: user.id });

            if (!contestant) {
                interaction.reply('Contestant not found in the database.');
                return;
            }

            // Add the item to the contestant's itemsOwned array
            const newItem = {
                itemName: itemName,
                
            };
            contestant.itemsOwned.push(newItem);

            // Save the changes to the database
            await contestant.save();

            interaction.reply(`Successfully added ${itemName} to ${contestant.name}'s items.`);

        } catch (error) {
            console.error('Error in additem command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};
