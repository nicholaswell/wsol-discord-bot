const Contestant = require('../../models/Contestant');
const config = require('../../../config.json');
const guildId = config.serverId;
const { PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
    name: 'initializecontestants',
    description: 'Initializes the contestants and coaches with the "Contestant" role to the database.',
    devOnly: true,
    options: [],

    callback: async (client, interaction) => {
        try {
            const contestantRoleId = config.contestantRoleId;
            const coachRoleId = config.coachRoleId;
            const categoryId = config.confessionalsCategoryId;  

            const guild = await client.guilds.fetch(guildId);
            const contestantRole = guild.roles.cache.get(contestantRoleId);
            const coachRole = guild.roles.cache.get(coachRoleId);

            // Ensure members are fetched
            await guild.members.fetch();

            // Filter members with the "contestant" or "coach" role
            const membersWithRole = guild.members.cache.filter(member =>
                member.roles.cache.has(contestantRole.id) || member.roles.cache.has(coachRole.id)
            );

            // Counter for channel naming (if creating channels)
            let contestantNumber = 1;

            // Iterate over members and add them to the contestants collection
            for (const member of membersWithRole.values()) {
                try {
                    const existingContestant = await Contestant.findOne({ id: member.user.id });

                    if (!existingContestant) {
                        // Check if the member is a coach
                        const isCoach = member.roles.cache.has(coachRole.id);

                        const newContestant = new Contestant({
                            id: member.user.id,
                            name: member.nickname || member.user.username, // Use nickname if available
                            itemsOwned: [],
                            money: 0,
                            submitted: false,
                            coach: isCoach, // Mark as coach if they have the coach role
                        });

                        await newContestant.save();
                        console.log(`Added ${member.user.tag} to contestants.`);

                        // Uncomment to create a private channel if needed
                        // const channelName = `cf-${contestantNumber}-${member.nickname.replace(/\s+/g, '-').toLowerCase()}`;
                        // const channel = await guild.channels.create({
                        //     name: channelName,
                        //     type: ChannelType.GuildText,
                        //     parent: categoryId,
                        //     permissionOverwrites: [
                        //         {
                        //             id: guild.id,
                        //             deny: [PermissionsBitField.Flags.ViewChannel],
                        //         },
                        //         {
                        //             id: member.id,
                        //             allow: [PermissionsBitField.Flags.ViewChannel],
                        //         }
                        //     ]
                        // });

                        // console.log(`Created channel ${channelName} for ${member.user.tag}.`);
                        contestantNumber++; // Increment the counter for the next contestant
                    } else {
                        console.log("User already exists in the database.");
                    }

                } catch (error) {
                    console.error(`Error adding ${member.user.tag} to contestants:`, error.message);
                }
            }

            interaction.reply('Contestants and coaches initialized.');

        } catch (error) {
            console.error('Error in initializecontestants command:', error);
        }
    },
};
