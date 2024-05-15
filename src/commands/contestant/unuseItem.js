const { ApplicationCommandOptionType } = require('discord.js');
const Contestant = require('../../models/Contestant');
const stringSimilarity = require('string-similarity');

const items = [
    'Mask', 'Scissors', 'Licensing Agreement', 'Phone a Friend', 'Flashlight', 'Coathanger',
    'Amplifier', 'Muffler', 'Noise Cancellation Headphones', 'Loot', 'Wuuf\'s Wheel of Fortune',
    'Musical Wand', 'Tech Wand', 'Wave Wand', 'Dragon Wand', 'Galaxy Wand', 'Life Wand', 'Animal Wand',
    'Turnips', 'Barbie Mirror', 'Slingshot', 'Barbie Car', 'Javelin', 'Mace', 'Buttercup Nano', 'Courage Nano',
    'Rigby Nano', 'Spit', 'Deathberry', 'Starclan\'s Blessing', 'Kunai', 'Knife', 'Coco Nano', 'Baddie Phone',
    'Balloon', 'Moonpool Plunge', 'Bow', 'Sword', 'Eddy Nano', 'Cranberry Juice', 'Punch', 'Breakfast in Bed',
    'Mug', 'Switch Up', 'Theme Wheel', 'Random Sabotage', 'Double or Nothing', '10 Free Spins', 'Diamond',
    'Unlucky Penny', 'Another Drink', 'Horse Advantage', 'Dueling Guns', 'Empty Box'
];

module.exports = {
    name: 'unuseitem',
    description: 'Command to mark an item as not being used by the contestant.',
    options: [
        {
            name: 'itemname',
            description: 'Name of the item to be marked as unused.',
            type: ApplicationCommandOptionType.String,
            required: true,
        },
        {
            name: 'quantity',
            description: 'Quantity of the item to be marked as unused (optional).',
            type: ApplicationCommandOptionType.Integer,
        },
    ],

    callback: async (client, interaction) => {
        try {
            const inputItemName = interaction.options.getString('itemname');
            const quantity = interaction.options.getInteger('quantity') || 1;

            // Find the closest matching item name
            const matches = stringSimilarity.findBestMatch(inputItemName, items);
            const bestMatch = matches.bestMatch;

            // Check if the match is sufficiently close
            if (bestMatch.rating < 0.5) {
                return interaction.reply(`Item "${inputItemName}" not found. Please check the item name and try again.`);
            }

            const itemName = bestMatch.target;

            // Find the contestant using the command
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

            // Check if the quantity specified exceeds the number of items the contestant has marked as used
            let usedItemCount = contestantData.itemsOwned.filter(item => item.itemName === itemName && item.used === true).length;
            if (quantity > usedItemCount) {
                return interaction.reply(`You have only marked ${usedItemCount} ${itemName}(s) as used.`);
            }

            // Mark the specified quantity of items as unused
            let count = 0;
            for (let i = 0; i < contestantData.itemsOwned.length; i++) {
                if (contestantData.itemsOwned[i].itemName === itemName && contestantData.itemsOwned[i].used === true) {
                    contestantData.itemsOwned[i].used = false;
                    contestantData.itemsOwned[i].usedOn = null;
                    count++;
                }
                if (count === quantity) break;
            }

            // Save changes to the database
            await contestantData.save();

            interaction.reply(`Successfully marked ${quantity} ${itemName}(s) as unused.`);
        } catch (error) {
            console.error('Error in unuseitem command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};
