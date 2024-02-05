async function announceDonateMoney(client, userid, recipientid, amount, announcementChannelId) {
    try {
        // Get the announcement channel
        const announcementChannel = client.channels.cache.get(announcementChannelId);

        if (!announcementChannel) {
            console.error('Announcement channel not found.');
            return;
        }

        // Create an embed for the purchase announcement
        const announcementString = `<@${userid}> has donated **$${amount}** to <@${recipientid}>!`;

        // Send the announcement
        await announcementChannel.send(announcementString);

    } catch (error) {
        console.error('Error announcing donateMoney:', error);
    }
}

module.exports = announceDonateMoney;