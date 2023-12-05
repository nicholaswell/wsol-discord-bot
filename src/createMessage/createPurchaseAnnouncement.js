async function announcePurchase(client, interaction, shopItem, announcementChannelId) {
    try {
        // Get the announcement channel
        const announcementChannel = client.channels.cache.get(announcementChannelId);

        if (!announcementChannel) {
            console.error('Announcement channel not found.');
            return;
        }

        // Create an embed for the purchase announcement
        const announcementString = `<@${interaction.user.id}> has purchased **${shopItem.name}**!`;

        // Send the announcement
        await announcementChannel.send(announcementString);

    } catch (error) {
        console.error('Error announcing purchase:', error);
    }
}

module.exports = announcePurchase;