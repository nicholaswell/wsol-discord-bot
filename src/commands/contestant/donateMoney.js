const Contestant = require('../../models/Contestant');
const { ApplicationCommandOptionType } = require('discord.js');
const updateLeaderboardMessage = require('../../editMessage/updateLeaderboardMessage');
const createContestantAnnouncement = require('../../createMessage/createDonateMoneyAnnouncement');
const config = require('../../../config.json')

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
            const donor = await Contestant.findOne({ id: interaction.user.id });
            const recipientContestant = await Contestant.findOne({ id: recipient.id });

             // Check if the donor is a coach
             const donorIsCoach = interaction.member.roles.cache.has(config.coachRoleId);

             // Check if the recipient is a coach
             const recipientIsCoach = interaction.guild.members.cache.get(recipient.id)?.roles.cache.has(config.coachRoleId);
 
             if (!donorIsCoach) {
                 interaction.reply('Only coaches can donate money to other coaches.');
                 return;
             }
 
             if (!recipientIsCoach) {
                 interaction.reply('You can only donate money to another coach.');
                 return;
             }

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

            interaction.reply(`Successfully donated $${amount} to ${recipientContestant.name}.`);

            const leaderboardTargetChannel = client.channels.cache.get(config.leaderboardChannelId);
            await updateLeaderboardMessage(client, leaderboardTargetChannel);

            // Calls the updateShopMessage function to update the message in the shop.
            if(amount >= 50){
                await createContestantAnnouncement(client, interaction.user.id, recipient.id, amount, config.announcementChannelId);
            }
        } catch (error) {
            console.error('Error in donateMoney command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};
