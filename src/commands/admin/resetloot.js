const Eliminated = require('../../models/Eliminated');
const updateLeaderboardMessage = require('../../editMessage/updateLeaderboardMessage');
const config = require('../../../config.json');
const LEADERBOARD_CHANNEL_ID = config.leaderboardChannelId;

module.exports = {
    name: 'resetloot',
    description: 'Resets the loot',
    devOnly: true,

    callback: async (client, interaction) => {
        try {

            // Find the existing document in the Eliminated collection
            const eliminatedDoc = await Eliminated.findOne({ identifier: 'eliminated' });

      
            eliminatedDoc.itemsOwned = [];
            eliminatedDoc.money = 0;

            // Save the changes to the Eliminated collection
            await eliminatedDoc.save();

            // Call the updateLeaderboardMessage method
            const leaderboardTargetChannel = client.channels.cache.get(LEADERBOARD_CHANNEL_ID);
            await updateLeaderboardMessage(client, leaderboardTargetChannel);

            interaction.reply(`Reset the loot.`);
        } catch (error) {
            console.error('Error in eliminate command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};
