const { ApplicationCommandOptionType } = require('discord.js');
const Contestant = require('../../models/Contestant');
const stringSimilarity = require('string-similarity');

const items = [
    'Mask', 'Scissors', 'Licensing Agreement', 'Phone a Friend', 'Flashlight', 'Coathanger',
    'Amplifier', 'Muffler', 'Noise Cancellation Headphones', 'Loot', 'Faulty Microphone', 'Record Label', 'Truth Telling Teeth', 'Mind Control', 'Love Potion', 'Journal 2'
];

module.exports = {
    name: 'useitem',
    description: 'Command to mark an item as being used by the contestant.',
    options: [
        {
            name: 'itemname',
            description: 'Name of the item to be used.',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'quantity',
            description: 'Quantity of the item to be used (optional).',
            type: ApplicationCommandOptionType.Integer,
        },
        {
            name: 'contestant',
            description: 'Name of the contestant to use the item on (optional).',
            type: ApplicationCommandOptionType.String,
        },
    ],

    callback: async (client, interaction) => {
        try {
            const inputItemName = interaction.options.getString('itemname');
            const quantity = interaction.options.getInteger('quantity') || 1;
            const targetContestantName = interaction.options.getString('contestant');

            // Find the closest matching item name
            const matches = stringSimilarity.findBestMatch(inputItemName, items);
            const bestMatch = matches.bestMatch;

            // Check if the match is sufficiently close
            if (bestMatch.rating < 0.5) {
                return interaction.reply(`Item "${inputItemName}" not found. Please check the item name and try again.`);
            }

            const itemName = bestMatch.target;

            // Find the contestant in the database
            const contestantData = await Contestant.findOne({ id: interaction.user.id });

            if (!contestantData) {
                return interaction.reply('Contestant not found in the database.');
            }

            // Find the index of the item in the contestant's itemsOwned array
            const itemIndex = contestantData.itemsOwned.findIndex(item => item.itemName === itemName);

            // Check if the contestant owns the item
            if (itemIndex === -1) {
                return interaction.reply(`You do not own ${itemName}.`);
            }

            // Find the index of the item in the contestant's itemsOwned array
            const itemCount = contestantData.itemsOwned.filter(item => item.itemName === itemName).length;

            // Check if the quantity specified exceeds the number of items the contestant owns
            if (quantity > itemCount) {
                return interaction.reply(`You only have ${itemCount} ${itemName}(s).`);
            }

            // Check if all instances of the item are already marked as used
            const unusedItemCount = contestantData.itemsOwned.filter(item => item.itemName === itemName && !item.used).length;

            if (unusedItemCount === 0) {
                return interaction.reply(`You have no more ${itemName}(s) available to use.`);
            }

            // Update the 'used' field for the specified quantity of the item
            for (let i = 0; i < quantity; i++) {
                const unusedItem = contestantData.itemsOwned.find(item => item.itemName === itemName && !item.used);
                if (unusedItem) {
                    unusedItem.used = true;
                    unusedItem.usedOn = targetContestantName; // Add the name of the contestant the item is being used on
                } else {
                    // No more unused items of this type
                    break;
                }
            }

            // Save changes to the database
            await contestantData.save();

            interaction.reply(`Successfully marked ${quantity} ${itemName}(s) as used.`);
        } catch (error) {
            console.error('Error in useitem command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};
