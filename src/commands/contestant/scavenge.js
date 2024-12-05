const Contestant = require('../../models/Contestant');
const Eliminated = require('../../models/Eliminated');
const updateLeaderboardMessage = require('../../editMessage/updateLeaderboardMessage');
const config = require('../../../config.json');
const LEADERBOARD_CHANNEL_ID = config.leaderboardChannelId;

module.exports = {
    name: 'scavenge',
    description: 'Scavenge through the loot to have the chance of gaining random item/money',
    cooldown: 120, 
    callback: async (client, interaction) => {
        try {
            const contestantData = await Contestant.findOne({ id: interaction.user.id });
            if (!contestantData) {
                return interaction.reply("Contestant not found in the database.");
            }

            // Find the eliminated items
            const eliminatedData = await Eliminated.findOne({ identifier: 'eliminated' });

            // Check if the contestant has loot in their inventory
            const lootIndex = contestantData.itemsOwned.findIndex(item => item.itemName === 'Loot');
            if (lootIndex === -1) {
                interaction.reply('You do not have Loot in your inventory.');
                return;
            }

            // Check if the user has a cooldown entry for this command
            const cooldownIndex = contestantData.cooldowns.findIndex(cooldown => cooldown.command === 'scavenge');
            const now = new Date();

            if (cooldownIndex !== -1) {
                let cooldownExpiration = contestantData.cooldowns[cooldownIndex].cooldownExpiration;
                if (cooldownExpiration !== null && now < cooldownExpiration) {
                    // Cooldown has not expired yet
                    const remainingTimeInSeconds = Math.max((cooldownExpiration - now) / 1000, 0);
                    const remainingTimeInMinutes = Math.ceil(remainingTimeInSeconds / 60);
                    return interaction.reply(`You are on cooldown. Please wait ${remainingTimeInMinutes} minute(s).`);
                } else {
                    // Cooldown has expired, reset the cooldown
                    const newCooldownExpiration = new Date(now.getTime() + 3600 * 1000); // Add 120 seconds to now
                    contestantData.cooldowns[cooldownIndex].cooldownExpiration = newCooldownExpiration;
                    await contestantData.save();
                }
            } else {
                // Create a new cooldown entry if the user is using the command for the first time
                const newCooldownExpiration = new Date(now.getTime() + 3600 * 1000); // Set the expiration time to now + 120 seconds
                contestantData.cooldowns.push({ command: 'scavenge', cooldownExpiration: newCooldownExpiration });
                await contestantData.save(); // Save the updated contestant data
            }



            // Roll a dice to determine the outcome (e.g., get a random item, money, or nothing)
            const outcome = Math.random();

            let response;
            
    
            if (outcome < 0.2 && eliminatedData.itemsOwned.length > 0) { // 20% chance of getting item from loot
                const randomIndex = Math.floor(Math.random() * eliminatedData.itemsOwned.length);
                const randomItem = eliminatedData.itemsOwned[randomIndex];
                contestantData.itemsOwned.push({ itemName: randomItem });
                await contestantData.save();
                eliminatedData.itemsOwned.splice(randomIndex, 1);
                await eliminatedData.save();
                response = `You found **${randomItem}** in the loot!`;
            } else if (outcome < 0.6 && eliminatedData.money > 0) { // 40% chance of getting a random amount of money
                let randomAmount;
                if(eliminatedData.money < 100){
                    randomAmount = Math.floor(Math.random() * eliminatedData.money) + 1; // Random amount between 1 and the amount in the loot
                }
                else{
                    randomAmount = Math.floor(Math.random() * 100) + 1; // Random amount between 1 and 100
                }
                    contestantData.money += randomAmount;
                    await contestantData.save();
                    eliminatedData.money -= randomAmount;
                    await eliminatedData.save();

                response = `You found **$${randomAmount}** in the loot!`;
            } else { // 40% chance of getting nothing
                response = 'You found nothing in the loot.';
            }

            const leaderboardTargetChannel = client.channels.cache.get(LEADERBOARD_CHANNEL_ID);
            await updateLeaderboardMessage(client, leaderboardTargetChannel);
            interaction.reply(response);
        } catch (error) {
            console.error('Error in scavenge command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};
