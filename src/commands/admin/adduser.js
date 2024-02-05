const Contestant = require('../../models/Contestant');
const { ApplicationCommandOptionType } = require('discord.js');
const updateLeaderboardMessage = require('../../editMessage/updateLeaderboardMessage');
const config = require('../../../config.json')
const guildId = config.serverId;

module.exports = {
    name: 'adduser',
    description: 'Add a user to the contestant database.',
    devOnly: true, 
    options: [
        {
            name: 'user',
            description: 'The user to add to the contestant database. (User must have a nickname)',
            type: ApplicationCommandOptionType.Mentionable,
            required: true,
        },
    ],

    callback: async (client, interaction) => {
        try {
            // Extract user from options
            const user = interaction.options.getUser('user');

            const guild = await client.guilds.fetch(guildId);

            const member = guild.members.cache.get(user.id);

            // Check if the user already exists in the database
            const existingContestant = await Contestant.findOne({ id: user.id });

            if (existingContestant) {
                interaction.reply('User already exists in the contestant database.');
                return;
            }

            // Add the user to the contestant database
            const newContestant = new Contestant({
                id: user.id,
                name: member.nickname, // You can adjust this as needed
                itemsOwned: [], // Optional: initialize other fields
                money: 0,
                submitted: false,
            });

            await newContestant.save();
            interaction.reply(`User ${user.username} (${member.nickname}) added to the contestant database.`);


            const leaderboardTargetChannel = client.channels.cache.get(config.leaderboardChannelId);
            
            // Update Leaderboard Message
            await updateLeaderboardMessage(client, leaderboardTargetChannel);
        } catch (error) {
            console.error('Error adding user to contestant database:', error);
            interaction.reply('An error occurred while adding user to contestant database.');
        }
    }
};