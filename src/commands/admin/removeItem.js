const Contestant = require('../../models/Contestant');
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'removeitem',
    description: 'Remove a specific item from a user.',
    devOnly: true,
    options: [
        {
            name: 'user',
            type: ApplicationCommandOptionType.Mentionable,
            description: 'The user to remove the item from.',
            required: true,
        },
        {
            name: 'item',
            description: 'The name of the item to remove.',
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: 'Amplifier',
                    value: 'Amplifier'
                },
                {
                    name: 'Muffler',
                    value: 'Muffler'
                },
                {
                    name: 'Noise Cancellation Headphones',
                    value: 'Noise Cancellation Headphones'
                },
                {
                    name: 'Faulty Microphone',
                    value: 'Faulty Microphone'
                },
                {
                    name: 'Vinyl',
                    value: 'Vinyl'
                },
                {
                    name: 'Record Label',
                    value: 'Record Label'
                },
                {
                    name: 'Pickpocket',
                    value: 'Pickpocket'
                },
                {
                    name: 'Phone (a friend)',
                    value: 'Phone (A Friend)'
                },
                {
                    name: 'Flashlight',
                    value: 'Flashlight'
                },
                {
                    name: 'Mask',
                    value: 'Mask'
                },
                {
                    name: 'Licensing Agreemnt',
                    value: 'Licensing Agreement'
                },
                {
                    name: 'Scissors',
                    value: 'Scissors'
                }],
            required: true,
        },
    ],

    callback: async (client, interaction) => {
        try {
            // Extract user and item name from options
            const targetUser = interaction.options.getUser('user');
            const itemName = interaction.options.getString('item');

            // Find the contestant in the database
            const contestant = await Contestant.findOne({ name: targetUser.tag });

            if (!contestant) {
                interaction.reply('Contestant not found in the database.');
                return;
            }

            // Find the index of the item in the itemsOwned array
            const itemIndex = contestant.itemsOwned.findIndex(item => item.itemName === itemName);

            // Check if the item was found
            if (itemIndex !== -1) {
                // Remove the item from the itemsOwned array
                contestant.itemsOwned.splice(itemIndex, 1);

                // Save changes to the database
                await contestant.save();

                interaction.reply(`Successfully removed **${itemName}** from ${targetUser.displayName}'s items.`);
            } else {
                interaction.reply(`${targetUser.tag} does not own ${itemName}.`);
            }
        } catch (error) {
            console.error('Error in removeitem command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};
