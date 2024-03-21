const Contestant = require('../../models/Contestant');
const ShopItem = require('../../models/Shop');
const ShopState = require('../../models/ShopState');
const config = require('../../../config.json')
const { ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const updateShopMessage = require('../../editMessage/updateShopMessage');
const updateLeaderboardMessage = require('../../editMessage/updateLeaderboardMessage');
const createContestantAnnouncement = require('../../createMessage/createPurchaseAnnouncement');


module.exports = {
    name: 'purchase',
    description: 'Purchase an item from the shop.',
    options: [
        {
            name: 'item',
            type: ApplicationCommandOptionType.String,
            description: 'The item to purchase.',
            choices: [
                {
                    name: 'Mask',
                    value: 'Mask'
                },
                {
                    name: 'Scissors',
                    value: 'Scissors'
                },
                {
                    name: 'Licensing Agreement',
                    value: 'Licensing Agreement'
                },
                {
                    name: 'Phone a Friend',
                    value: 'Phone a Friend'
                },
                {
                    name: `Flashlight`,
                    value: `Flashlight`
                },
                {
                    name: `Coathanger`,
                    value: `Coathanger`
                },
                {
                    name: 'Amplifier',
                    value: 'Amplifier'
                },
                {
                    name: 'Muffler',
                    value: 'Muffler'
                },
                {
                    name: `Noise Cancellation Headphones`,
                    value: `Noise Cancellation Headphones`
                },
                {
                    name: `Miss Voodoo`,
                    value: `Miss Voodoo`
                },
                {
                    name: 'Cranberry Juice',
                    value: 'Cranberry Juice'
                },
                {
                    name: `Breakfast in Bed`,
                    value: `Breakfast in Bed`
                },
                {
                    name: `Punch`,
                    value: `Punch`
                },
                {
                    name: `Spit`,
                    value: `Spit`
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

            const shopState = await ShopState.findOne();

            if (shopState && !shopState.isEnabled) {
                interaction.reply('The shop is currently disabled.');
                return;
            }
            
            // Extract item name from options
            const itemName = interaction.options.getString('item');

            // Find the contestant in the database
            const contestant = await Contestant.findOne({ id: interaction.user.id });

            // Find the shop item in the database
            const shopItem = await ShopItem.findOne({ name: itemName });

            if (!contestant || !shopItem) {
                interaction.reply('Contestant or shop item not found in the database.');
                return;
            }

            // Ask for confirmation
            const firstButton = new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('Yes')
                .setStyle(ButtonStyle.Success)

            const secondButton = new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('No')
                .setStyle(ButtonStyle.Danger)

            const buttonRow = new ActionRowBuilder().addComponents(firstButton, secondButton);

            const reply = await interaction.reply({
                content: `Are you sure you want to purchase **${shopItem.name}** for **$${shopItem.price}**?`,
                components: [buttonRow],
            });

            // Collect user's response
            const filter = i => i.customId === 'confirm' || i.customId === 'cancel';
            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.Button,
                filter,
                time: 5_000
            })

            collector.on('collect', async i => {
                if (i.customId === 'confirm') {
                    // Check if contestant has enough money
                    if (contestant.money < shopItem.price) {
                        interaction.followUp('Not enough money to purchase this item.');
                        return;
                    }

                    // Check if there are remaining items in the shop
                    if (shopItem.remaining <= 0) {
                        interaction.followUp('This item is out of stock.');
                        return;
                    }

                    // Deduct money from contestant
                    contestant.money -= shopItem.price;

                    // Add item to contestant's itemsOwned array
                    contestant.itemsOwned.push({ itemName: shopItem.name });

                    // Decrease remaining count in the shop
                    shopItem.remaining--;

                    // Save changes to the databases
                    await contestant.save();
                    await shopItem.save();

                    interaction.followUp(`Successfully purchased **${shopItem.name}**.`);

                    const updatedShopItems = await ShopItem.find();

                    // Update the shop message after the purchase
                    // Getting shop and contestant-announcement channels
                    const shopTargetChannel = client.channels.cache.get(config.shopChannelId);
                    const leaderboardTargetChannel = client.channels.cache.get(config.leaderboardChannelId);

                    // Calls the updateShopMessage function to update the message in the shop.
                    await updateShopMessage(client, shopTargetChannel, updatedShopItems);
                    await updateLeaderboardMessage(client, leaderboardTargetChannel);
                    await createContestantAnnouncement(client, interaction, shopItem, config.announcementChannelId);


                } else {
                    interaction.followUp('Purchase canceled.');
                }
                collector.stop();

                
            });

            collector.on('end', () => {
                firstButton.setDisabled(true);
                secondButton.setDisabled(true);

                reply.delete();
            });

        } catch (error) {
            console.error('Error in purchase command:', error);
            interaction.deferReply('An error occurred while processing the command.');
        }
    },
};