const Contestant = require('../../models/Contestant');
const config = require('../../../config.json')
const guildId = config.serverId;
const { PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
    name: 'initializecontestants',
    description: 'Initializes the contestants with the "Contestant" role to the database. (User must have a nickname)',
    devOnly: true,
    options: [],

    callback: async (client, interaction) => {
        try {
            const roleId = config.contestantRoleId;
            const categoryId = config.confessionalsCategoryId;  

            const guild = await client.guilds.fetch(guildId);
            const role = guild.roles.cache.get(roleId);

            // Ensure members are fetched
            await guild.members.fetch();

            // Filter members with the role
            const membersWithRole = guild.members.cache.filter(member => member.roles.cache.has(role.id));

            // Counter for channel naming
            let contestantNumber = 1;

            // Iterate over members and add them to the contestants collection
            for (const member of membersWithRole.values()) {
                try {
                    const existingContestant = await Contestant.findOne({ id: member.user.id });

                    if (!existingContestant) {
                        const newContestant = new Contestant({
                            id: member.user.id,
                            name: member.nickname,
                            itemsOwned: [],
                            money: 0,
                            submitted: false,
                        });

                        await newContestant.save();
                        console.log(`Added ${member.user.tag} to contestants.`);

                        // Create a private channel for the contestant
                        const channelName = `cf-${contestantNumber}-${member.nickname.replace(/\s+/g, '-').toLowerCase()}`;
                        const channel = await guild.channels.create({
                            name: channelName,
                            type: ChannelType.GuildText, // Correct channel type
                            parent: categoryId,
                            permissionOverwrites: [
                                {
                                    id: guild.id,
                                    deny: [PermissionsBitField.Flags.ViewChannel],
                                },
                                {
                                    id: member.id,
                                    allow: [PermissionsBitField.Flags.ViewChannel],
                                }
                            ]
                        });

                        console.log(`Created channel ${channelName} for ${member.user.tag}.`);
                        contestantNumber++;  // Increment the counter for the next contestant
                    } else {
                        console.log("User already exists in the database.");
                    }

                } catch (error) {
                    console.error(`Error adding ${member.user.tag} to contestants or creating channel:`, error.message);
                }
            }

            interaction.reply('Contestants initialized and channels created.');

        } catch (error) {
            console.error('Error in initializecontestants command:', error);
        }
    },
};
