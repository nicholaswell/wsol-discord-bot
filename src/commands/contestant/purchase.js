const Contestant = require('../../models/Contestant');
const ShopItem = require('../../models/Shop');
const SHOP_CHANNEL_ID = '1183906075259457536'
const ANNOUNCEMENT_CHANNEL_ID = '1072281700668813472'
const LEADERBOARD_CHANNEL_ID = '1069474006236925983';
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
            // Extract item name from options
            const itemName = interaction.options.getString('item');

            // Find the contestant in the database
            const contestant = await Contestant.findOne({ name: interaction.user.tag });

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
                    const shopTargetChannel = client.channels.cache.get(SHOP_CHANNEL_ID);
                    const leaderboardTargetChannel = client.channels.cache.get(LEADERBOARD_CHANNEL_ID);

                    // Calls the updateShopMessage function to update the message in the shop.
                    await updateShopMessage(client, shopTargetChannel, updatedShopItems);
                    await updateLeaderboardMessage(client, leaderboardTargetChannel);
                    await createContestantAnnouncement(client, interaction, shopItem, ANNOUNCEMENT_CHANNEL_ID);


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