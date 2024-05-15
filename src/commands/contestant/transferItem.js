const Contestant = require('../../models/Contestant');
const { ApplicationCommandOptionType } = require('discord.js');
const config = require('../../../config.json')
const createContestantAnnouncement = require('../../createMessage/createDonateItemAnnouncement');
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
    name: 'transferitem',
    description: 'Donate an item to another user.',
    options: [
        {
            name: 'recipient',
            type: ApplicationCommandOptionType.Mentionable,
            description: 'The user to donate the item to.',
            required: true,
        },
        {
            name: 'itemname',
            description: 'Name of the item to be marked as unused.',
            type: ApplicationCommandOptionType.String,
            required: true,
        }

    ],

    callback: async (client, interaction) => {
        try {
            // Extract recipient and item name from options
            const recipient = interaction.options.getUser('recipient');
            const inputItemName = interaction.options.getString('itemname');

            const matches = stringSimilarity.findBestMatch(inputItemName, items);
            const bestMatch = matches.bestMatch;

            if (bestMatch.rating < 0.5) {
                return interaction.reply(`Item "${inputItemName}" not found. Please check the item name and try again.`);
            }

            const itemName = bestMatch.target;

            // Find the contestant in the database
            const donor = await Contestant.findOne({ id: interaction.user.id });
            const recipientContestant = await Contestant.findOne({ id: recipient.id });

            if (!donor || !recipientContestant) {
                interaction.reply('Donor or recipient not found in the database.');
                return;
            }

            // Find the index of the item in the donor's itemsOwned array
            const itemIndex = donor.itemsOwned.findIndex(item => item.itemName === itemName);

            // Check if the item was found
            if (itemIndex !== -1) {
                // Remove the item from the donor's itemsOwned array
                const donatedItem = donor.itemsOwned.splice(itemIndex, 1)[0];

                // Create a new item object for the recipient
                const newItem = {
                    itemName: donatedItem.itemName,
                    // Include any other properties from the original item that you want to transfer
                };

                // Add the item to the recipient's itemsOwned array
                recipientContestant.itemsOwned.push(newItem);

                // Save changes to the databases
                await donor.save();
                await recipientContestant.save();

                interaction.reply(`Successfully donated ${itemName} to ${recipientContestant.name}.`);

                // Calls the updateShopMessage function to update the message in the shop.
                await createContestantAnnouncement(client, interaction.user.id, recipient.id, itemName, config.announcementChannelId);
            } else {
                interaction.reply(`You do not own ${itemName} to donate.`);
            }
        } catch (error) {
            console.error('Error in donateitem command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};
