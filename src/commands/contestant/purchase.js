const { ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const Contestant = require('../../models/Contestant');
const ShopItem = require('../../models/Shop');
const ShopState = require('../../models/ShopState');
const config = require('../../../config.json');
const updateShopMessage = require('../../editMessage/updateShopMessage');
const updateLeaderboardMessage = require('../../editMessage/updateLeaderboardMessage');
const createContestantAnnouncement = require('../../createMessage/createPurchaseAnnouncement');
const stringSimilarity = require('string-similarity');

const items = [
    'Mask', 'Scissors', 'Licensing Agreement', 'Phone a Friend', 'Flashlight', 'Coathanger',
    'Amplifier', 'Muffler', 'Noise Cancellation Headphones', 'Loot', 'Faulty Microphone', 'Record Label', 'Truth Telling Teeth', 'Mind Control', 'Love Potion', 'Journal 2'
];

module.exports = {
    name: 'purchase',
    description: 'Purchase an item from the shop.',
    options: [
        {
            name: 'item',
            type: ApplicationCommandOptionType.String,
            description: 'The item to purchase.',
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
            const inputItemName = interaction.options.getString('item');

            // Find the closest matching item name
            const matches = stringSimilarity.findBestMatch(inputItemName, items);
            const bestMatch = matches.bestMatch;

            // Check if the match is sufficiently close
            if (bestMatch.rating < 0.3) {
                return interaction.reply(`Item "${inputItemName}" not found. Please check the item name and try again.`);
            }

            const itemName = bestMatch.target;

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
                .setStyle(ButtonStyle.Success);

            const secondButton = new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('No')
                .setStyle(ButtonStyle.Danger);

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
                time: 5_000,
            });

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

                 if(shopItem.name == 'Loot'){
interaction.followUp(`Successfully purchased **${shopItem.name}**. To use it, use /scavenge.`);
} else{
interaction.followUp(`Successfully purchased **${shopItem.name}**. To use it, use /useitem.`);
}
                     

                    const updatedShopItems = await ShopItem.find();

                    // Update the shop message after the purchase
                    const shopTargetChannel = client.channels.cache.get(config.shopChannelId);
                    const leaderboardTargetChannel = client.channels.cache.get(config.leaderboardChannelId);

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
