const { ApplicationCommandOptionType } = require('discord.js');
const Contestant = require('../../models/Contestant');
const items = [
    'Mask', 'Scissors', 'Licensing Agreement', 'Phone a Friend',
    'Flashlight', 'Coathanger', 'Amplifier', 'Muffler',
    'Noise Cancellation Headphones', 'Miss Voodoo', 'Faulty Microphone',
    'Turnips', 'Balloon', 'Slingshot', 'Kunai', 'Bow', 'Javelin', 'Knife',
    'Sword', 'Mace', 'Punch', 'Spit', 'Breakfast in Bed', 'Cranberry Juice',
    'Mug', 'Theme Wheel', 'Random Sabotage', 'Kneecap Breaker', 'Double or Nothing',
    '10 Free Spins', 'Diamond', 'Unlucky Penny', 'Another Drink', 'Horse Advantage',
    'Dueling Guns', 'Empty Box', 'Item Voucher', 'Eddy Nano', ' Record Label'
];
const stringSimilarity = require('string-similarity');

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
            type: ApplicationCommandOptionType.String,
            description: 'The name of the item to remove.',
            required: true,
        },
    ],

    callback: async (client, interaction) => {
        try {
            // Extract user and item name from options
            const targetUser = interaction.options.getUser('user');
            const inputItemName = interaction.options.getString('item');

            // Find the closest matching item name
            const matches = stringSimilarity.findBestMatch(inputItemName, items);
            const bestMatch = matches.bestMatch;

            // Check if the match is sufficiently close
            if (bestMatch.rating < 0.5) {
                return interaction.reply(`Item "${inputItemName}" not found. Please check the item name and try again.`);
            }

            const itemName = bestMatch.target;

            // Find the contestant in the database
            const contestant = await Contestant.findOne({ id: targetUser.id });

            if (!contestant) {
                return interaction.reply('Contestant not found in the database.');
            }

            // Find the index of the item in the itemsOwned array
            const itemIndex = contestant.itemsOwned.findIndex(item => item.itemName === itemName);

            // Check if the item was found
            if (itemIndex !== -1) {
                // Remove the item from the itemsOwned array
                contestant.itemsOwned.splice(itemIndex, 1);

                // Save changes to the database
                await contestant.save();

                return interaction.reply(`Successfully removed **${itemName}** from ${targetUser.displayName}'s items.`);
            } else {
                return interaction.reply(`${targetUser.tag} does not own ${itemName}.`);
            }
        } catch (error) {
            console.error('Error in removeitem command:', error);
            return interaction.reply('An error occurred while processing the command.');
        }
    },
};
