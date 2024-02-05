const Contestant = require('../../models/Contestant');
const config = require('../../../config.json')
const guildId = config.serverId;

module.exports = {
    name: 'initializecontestants',
    description: 'Initializes the contestants with the "Contestant" role to the database. (User must have a nickname)',
    devOnly: true,
    options: [],

    callback: async (client, interaction) => {
        try {
            const roleId = config.contestantRoleId;

            const guild = await client.guilds.fetch(guildId);
            const role = guild.roles.cache.get(roleId);

            // Ensure members are fetched
            await guild.members.fetch();

            // Filter members with the role
            const membersWithRole = guild.members.cache.filter(member => member.roles.cache.has(role.id));

            // Iterate over members and add them to the contestants collection
            membersWithRole.forEach(async (member) => {
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
                    } else{
                        console.log("User already exist in the database.");
                    }

                } catch (error) {
                    console.error(`Error adding ${member.user.tag} to contestants:`, error.message);
                }
            });

            interaction.reply('Contestants initialized.');

        } catch (error) {
            console.error('Error in initializecontestants command:', error);
        }
    },
};
