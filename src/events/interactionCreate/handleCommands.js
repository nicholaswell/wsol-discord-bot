const { devs } = require('../../../config.json');
const getLocalCommands = require('../../utils/getLocalCommands');

module.exports = async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const localCommands = getLocalCommands();

    try {
        const commandObject = localCommands.find((cmd) => cmd.name === interaction.commandName);

        if (!commandObject) {
            interaction.reply({
                content: 'Unknown command. Use `/help` for a list of available commands.',
                ephemeral: true,
            });
            return;
        }

        if (commandObject.devOnly) {
            if (!devs.includes(interaction.member.id)) {
                interaction.reply({
                    content: 'Only admins are allowed to run this command.',
                    ephemeral: true,
                });
                return;
            }
        }

        if (commandObject.permissionsRequired?.length) {
            for (const permission of commandObject.permissionsRequired) {
                if (!interaction.member.permissions.has(permission)) {
                    interaction.reply({
                        content: 'Not enough permissions.',
                        ephemeral: true,
                    });
                    return;
                }
            }
        }

        // Continue with the execution of the command here...
        await commandObject.callback(client, interaction);

    } catch (error) {
        console.error(`There was an error running this command: ${error}`);
        interaction.reply({
            content: 'An error occurred while processing the command.',
            ephemeral: true,
        });
    }
};