const { EmbedBuilder } = require('discord.js');

async function updateShopMessage(client, targetChannel, shopItems) {

    const embed = new EmbedBuilder()
        .setColor([0, 255, 255])
        .setTitle('Shop')
        .setDescription(`Welcome to the shop! Here are the available items: \n\n`);

    shopItems.forEach((item) => {
        embed.addFields({ name: item.name, value: `$${item.price} \n ${item.description} \n *Left Remaining: ${item.remaining}* \n\n` });
    });

    // Collect the messages in the shop channel
    const messages = await targetChannel.messages.fetch();

    // Find the original shop message
    const shopMessage = messages.find(
        (message) => message.author.id === client.user.id && message.embeds.length > 0
    );

    // If the shop message exists, update it; otherwise, send a new one
    if (shopMessage) {
        await shopMessage.edit({ embeds: [embed] });
    } else {
        await targetChannel.send({ embeds: [embed] });
    }
}

module.exports = updateShopMessage;