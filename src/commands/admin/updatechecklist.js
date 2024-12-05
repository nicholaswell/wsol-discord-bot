const { EmbedBuilder } = require('discord.js');
const Contestant = require('../../models/Contestant');
const config = require('../../../config.json');

let checklistMessages = []; // Store message IDs for checklist messages
let checklistInterval = null;

module.exports = {
    name: 'updatechecklist',
    description: 'Update checklist based on messages since the last message in the themes channel',
    devOnly: true,
    options: [], // Removed the date/time options, since we're fetching them automatically

    callback: async (client, interaction) => {
        try {
            await interaction.deferReply({ ephemeral: true }); // Defer initial reply

            // Fetch the last message in the themes channel
            const themesChannel = client.channels.cache.get(config.themesChannelId);
            const messages = await themesChannel.messages.fetch({ limit: 1 });
            const lastMessage = messages.first();

            if (!lastMessage) {
                await interaction.editReply('No messages found in the themes channel.');
                return;
            }

            // Log the content of the last message for debugging

            // Extract start and end date/time from the message content
            const messageContent = lastMessage.content;

            // Adjusted regex to capture "You will have until MM/DD/YY HH:MM AM/PM"
            const regex = /You will have until (\d{1,2}\/\d{1,2}\/\d{2} \**\d{1,2} (?:AM|PM)\**)/;
            const match = messageContent.match(regex);

            if (!match) {
                console.log('Regex did not match. Check the message format and regex.');
                await interaction.editReply('Could not find a valid deadline in the last message.');
                return;
            }

            // Log the matched string to see if we got the correct result

            let endDateTimeString = match[1];

            const convertedEndDateTimeString = await convertDate(endDateTimeString);


            let endDateTime = new Date(convertedEndDateTimeString);


            // Adjust the time to be 4 hours ahead (from EST to UTC-4)
            endDateTime.setHours(endDateTime.getHours() + 4);

        
            const startDateTime = new Date(lastMessage.createdTimestamp); // Start time is when the message was posted

    
            await updateChecklist(client, startDateTime, endDateTime);

            await interaction.editReply('Checklist tracking started.');

            const currentTime = new Date();
            if (currentTime > endDateTime) {
                console.log('End time already reached. Stopping checklist tracking.');
                return;
            }

            checklistInterval = setInterval(async () => {
                const now = new Date();
                if (now > endDateTime) {
                    clearInterval(checklistInterval);
                    console.log('Checklist tracking stopped.');
                } else {
                    await updateChecklist(client, startDateTime, endDateTime);
                }
            }, 10 * 60 * 1000); // 10 minutes interval
        } catch (error) {
            console.error('Error in updatechecklist command:', error);
            await interaction.editReply('An error occurred while processing the command.');
        }
    },
};

async function convertDate(input) {
    try {
        // Extract the month (the part before the first '/')
        let month = input.substring(0, input.indexOf('/'));

        // Extract the day and year part before any spaces
        let dayAndYear = input.substring(input.indexOf('/') + 1, input.indexOf(' **'));

        // Extract the time period (e.g., "PM")
        let timePeriod = input.substring(input.lastIndexOf(' ') + 1);

        // Split the day and year part
        let day = dayAndYear.substring(0, dayAndYear.indexOf('/'));
        let year = '20' + dayAndYear.substring(dayAndYear.indexOf('/') + 1); // Assuming the year is in the last two digits

        
    
        // Step 2: Extract time and period
        let timeString = input.match(/(\d{1,2})\s*(AM|PM)/i);
        let time = timeString[1];
        let period = timeString[2];
    
        // Convert time to 24-hour format
        let hours = parseInt(time);
        if (period === 'PM' && hours < 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }
    
        // Step 3: Get the current date and time for the `T` part and `Z` part of the final format
        let now = new Date();
        let minutes = now.getMinutes();
        let seconds = now.getSeconds();
        let milliseconds = now.getMilliseconds();
    
        // Step 4: Format into the desired output string
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}Z`;
    } catch (error) {
        console.error('Error converting time:', error);
    }
}

async function updateChecklist(client, startDateTime, endDateTime) {
    try {
        const contestants = await Contestant.find();
        const submissionsChannel = client.channels.cache.get(config.submissionsChannelId);
        const messages = await submissionsChannel.messages.fetch({ limit: 100 });

        const userIds = messages
            .filter(msg => {
                const msgTime = new Date(msg.createdTimestamp);
                return msgTime >= startDateTime && msgTime <= endDateTime;
            })
            .map(msg => msg.author.id);

        // Updating the Contestant Submission Status
        await updateContestantsSubmissionStatus(userIds);

        // Update submission status for contestants not found in the messages
        await updateNotSubmittedContestants(contestants, userIds);

        const updatedContestants = await Contestant.find();

        // Create or update embeds with the list of contestants and their submission status
        const checklistChannel = client.channels.cache.get(config.checklistChannelId);
        await createOrUpdateChecklistEmbeds(updatedContestants, checklistChannel);

        // Stop updating if the end date is passed
        const currentTime = new Date();
        if (currentTime > endDateTime) {
            clearInterval(checklistInterval);
            console.log('Checklist tracking stopped.');
        }
    } catch (error) {
        console.error('Error updating checklist:', error);
    }
}

async function createOrUpdateChecklistEmbeds(contestants, checklistChannel) {

    const filteredContestants = contestants.filter(contestant => !contestant.coach);

    const chunks = [];
    const chunkSize = 25; // Maximum allowed fields per embed
    for (let i = 0; i < filteredContestants.length; i += chunkSize) {
        chunks.push(filteredContestants.slice(i, i + chunkSize));
    }

    const embeds = chunks.map(chunk => {
        const embed = new EmbedBuilder()
            .setTitle('Checklist')
            .setDescription('List of contestants and their submission status (Updates every 10 min): ')
            .setColor(config.color);

        const fields = chunk.map(contestant => {
            const status = contestant.submitted ? '✅ Submitted' : '❌ Not Submitted';
            return { name: contestant.name, value: status };
        });

        embed.addFields(fields);

        return embed;
    });

    // Update or create messages for embeds
    for (let i = 0; i < embeds.length; i++) {
        const embed = embeds[i];
        const messageId = checklistMessages[i];

        if (messageId) {
            // Update existing message
            await checklistChannel.messages.fetch(messageId).then(message => {
                message.edit({ embeds: [embed] });
            }).catch(async () => {
                // If the message no longer exists, send a new one
                const newMessage = await checklistChannel.send({ embeds: [embed] });
                checklistMessages[i] = newMessage.id;
            });
        } else {
            // Send a new message if there are more embeds than messages
            const newMessage = await checklistChannel.send({ embeds: [embed] });
            checklistMessages.push(newMessage.id);
        }
    }

    // Remove any extra stored messages
    if (checklistMessages.length > embeds.length) {
        for (let i = embeds.length; i < checklistMessages.length; i++) {
            const extraMessageId = checklistMessages[i];
            await checklistChannel.messages.fetch(extraMessageId).then(message => {
                message.delete();
            }).catch(() => {
                console.log(`Could not delete message with ID: ${extraMessageId}`);
            });
        }
        checklistMessages = checklistMessages.slice(0, embeds.length);
    }
}

async function updateContestantsSubmissionStatus(userIds) {
    for (const userId of userIds) {
        const contestant = await Contestant.findOne({ id: userId });
        if (contestant) {
            contestant.submitted = true;
            await contestant.save();
        }
    }
}

async function updateNotSubmittedContestants(contestants, userIds) {
    for (const contestant of contestants) {
        if (!userIds.includes(contestant.id)) {
            contestant.submitted = false;
            await contestant.save();
        }
    }
}
