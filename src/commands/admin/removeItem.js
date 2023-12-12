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
                    name: 'Mud',
                    value: 'Mud'
                },
                {
                    name: 'Spool of Thread',
                    value: 'Spool of Thread'
                },
                {
                    name: 'Jabberjay',
                    value: 'Jabberjay'
                },
                {
                    name: 'Firepit',
                    value: 'Firepit'
                },
                {
                    name: 'Map',
                    value: 'Map'
                },
                {
                    name: 'Vinyl',
                    value: 'Vinyl'
                },
                {
                    name: 'Medicine',
                    value: 'Medicine'
                },
                {
                    name: 'Nightshade',
                    value: 'Nightshade'
                },
                {
                    name: 'Riot Shield',
                    value: 'Riot Shield'
                },
                {
                    name: 'Kunai',
                    value: 'Kunai'
                },
                {
                    name: 'Bow',
                    value: 'Bow'
                },
                {
                    name: 'Javelin',
                    value: 'Javelin'
                },
                {
                    name: 'Knife',
                    value: 'Knife'
                },
                {
                    name: 'Sword',
                    value: 'Sword'
                },
                {
                    name: 'Mace',
                    value: 'Mace'
                },
                {
                    name: 'Record Label',
                    value: 'Record Label'
                },
                {
                    name: 'Loot',
                    value: 'Loot'
                }
            ],
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
