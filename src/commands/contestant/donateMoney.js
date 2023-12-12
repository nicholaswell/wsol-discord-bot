const Contestant = require('../../models/Contestant');
const { ApplicationCommandOptionType } = require('discord.js');
const updateLeaderboardMessage = require('../../editMessage/updateLeaderboardMessage');
const LEADERBOARD_CHANNEL_ID = '1069474006236925983';

module.exports = {
    name: 'donatemoney',
    description: 'Donate money to another user.',
    options: [
        {
            name: 'recipient',
            description: 'The user to donate the money to.',
            type: ApplicationCommandOptionType.Mentionable,
            required: true,
        },
        {
            name: 'amount',
            description: 'The amount of money to donate.',
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
    ],

    callback: async (client, interaction) => {
        try {
            // Extract recipient and amount from options
            const recipient = interaction.options.getUser('recipient');
            const amount = interaction.options.getInteger('amount');

            // Find the donor and recipient in the database
            const donor = await Contestant.findOne({ name: interaction.user.tag });
            const recipientContestant = await Contestant.findOne({ name: recipient.tag });

            if (!donor || !recipientContestant) {
                interaction.reply('Donor or recipient not found in the database.');
                return;
            }

            // Check if the donor has enough money
            if (donor.money < amount) {
                interaction.reply('Not enough money to donate this amount.');
                return;
            }

            // Deduct money from the donor
            donor.money -= amount;

            // Add money to the recipient
            recipientContestant.money += amount;

            // Save changes to the databases
            await donor.save();
            await recipientContestant.save();

            interaction.reply(`Successfully donated $${amount} to ${recipient.tag}.`);

            const leaderboardTargetChannel = client.channels.cache.get(LEADERBOARD_CHANNEL_ID);
            await updateLeaderboardMessage(client, leaderboardTargetChannel);
        } catch (error) {
            console.error('Error in donateMoney command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};
