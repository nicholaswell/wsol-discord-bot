const Contestant = require('../../models/Contestant');
const { ApplicationCommandOptionType } = require('discord.js');
const ANNOUNCEMENT_CHANNEL_ID = '1175250077850292243'
const createContestantAnnouncement = require('../../createMessage/createDonateItemAnnouncement');

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
            name: 'item',
            type: ApplicationCommandOptionType.String,
            description: 'The name of the item to donate.',
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
            // Extract recipient and item name from options
            const recipient = interaction.options.getUser('recipient');
            const itemName = interaction.options.getString('item');

            // Find the contestant in the database
            const donor = await Contestant.findOne({ name: interaction.user.tag });
            const recipientContestant = await Contestant.findOne({ name: recipient.tag });

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

                interaction.reply(`Successfully donated ${itemName} to ${recipient.displayName}.`);

                // Calls the updateShopMessage function to update the message in the shop.
                await createContestantAnnouncement(client, interaction.user.id, recipient.id, itemName, ANNOUNCEMENT_CHANNEL_ID);
            } else {
                interaction.reply(`You do not own ${itemName} to donate.`);
            }
        } catch (error) {
            console.error('Error in donateitem command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};
