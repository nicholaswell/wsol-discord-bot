const { EmbedBuilder } = require('discord.js'); // Import EmbedBuilder
const { ApplicationCommandOptionType } = require('discord.js');
const Contestant = require('../../models/Contestant');
const config = require('../../../config.json');

let checklistMessage = null

module.exports = {
    name: 'updatechecklist',
    description: 'Update checklist based on messages since a certain date and time',
    devOnly: true,
    options: [
        {
            name: 'startdate',
            description: 'Date to start tracking messages (MM-DD-YYYY)',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'starttime',
            description: 'Time to start tracking messages (HH:MM AM/PM)',
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],

    callback: async (client, interaction) => {
        try {
            await interaction.deferReply({ ephemeral: true }); // Defer initial reply

            // Parse input date and time
            const startDateString = interaction.options.getString('startdate');
            const startTimeString = interaction.options.getString('starttime');
            const startDateTimeString = `${startDateString} ${startTimeString}`;
            const startDateTime = new Date(startDateTimeString);

            updateChecklist(client, startDateTime);

            // Monitor messages in the submissions channel
            setInterval(async () => {
                await updateChecklist(client, startDateTime)
            }, 10 * 60 * 1000); // 10 minutes interval


            await interaction.editReply('Checklist tracking started.');
        } catch (error) {
            console.error('Error in trackchecklist command:', error);
            await interaction.editReply('An error occurred while processing the command.');
        }
    },
};

async function updateChecklist(client, startDateTime) {
    try {
        // Fetch contestants from the database
        const contestants = await Contestant.find();

        const submissionsChannel = client.channels.cache.get(config.submissionsChannelId);

        // Fetch all messages in the submissions channel since the bot started
        const messages = await submissionsChannel.messages.fetch({limit: 30});

        // Convert each message's createdTimestamp to the desired format
        const newMessages = [];

        messages.forEach(message => {
            const createdDateTime = new Date(message.createdTimestamp);
            if (createdDateTime >= startDateTime) {
                newMessages.push(message);
            }
        });

        const userIds = newMessages
            .filter(msg => msg.author)
            .map(msg => msg.author.id);

        // Updating the Contestant Submission Status
        await updateContestantsSubmissionStatus(userIds);

        // Update submission status for contestants not found in the messages
        await updateNotSubmittedContestants(contestants, userIds);

        const updatedContestants = await Contestant.find();

        // Create an embed with the list of contestants and their submission status
        const embed = createSubmissionStatusEmbed(updatedContestants);

        // Get the existing message in the checklist channel
        const checklistChannel = client.channels.cache.get(config.checklistChannelId);
        if (!checklistMessage) {
            // If the checklist message is not found, send a new message with the embed
            checklistMessage = await checklistChannel.send({ embeds: [embed] });
        } else {
            // If the checklist message exists, update it with the new embed
            await checklistMessage.edit({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Error updating checklist:', error);
    }
}

// Function to update submission status for contestants found in the messages
async function updateContestantsSubmissionStatus(userIds) {
    for (const userId of userIds) {
        // Find the contestant with the current user ID in the database
        const contestant = await Contestant.findOne({ id: userId });
        if (contestant) {
            // Update the submission status to true
            contestant.submitted = true;
            await contestant.save();
        }
    }
}

// Function to update submission status for contestants not found in the messages
async function updateNotSubmittedContestants(contestants, userIds) {
    for (const contestant of contestants) {
        // Check if the contestant's user ID is not in the list of user IDs from messages
        if (!userIds.includes(contestant.id)) {
            // Update the submission status to false
            contestant.submitted = false;
            await contestant.save();
        }
    }
}



// Function to create an embed with the list of contestants and their submission status
function createSubmissionStatusEmbed(contestants) {
    const embed = new EmbedBuilder()
        .setTitle('Checklist')
        .setDescription('List of contestants and their submission status:')
        .setColor('#00FFFF'); // Cyan color

    const fields = contestants.map(contestant => {
        const status = contestant.submitted ? '✅ Submitted' : '❌ Not Submitted';
        return { name: contestant.name, value: status };
    });

    embed.addFields(fields);

    return embed;
}