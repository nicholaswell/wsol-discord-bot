const Contestant = require('../../models/Contestant');
const Spinner = require('../../models/Spinner');
const { EmbedBuilder } = require('discord.js');
const config = require('../../../config.json');

module.exports = {
    name: 'spinwheel',
    description: 'Spin the wheel for a chance to win an item!',
    callback: async(client, interaction) => {
        try {
            // Find contestant data
            const contestantData = await Contestant.findOne({ id: interaction.user.id });
            if (!contestantData) {
                return interaction.reply("Contestant not found in the database.");
            }

            // Fetch the list of available items from the spinner
            const wheel = await Spinner.findOne({ name: `Wuuf's Wheel of Fortune` });
            if (!wheel || wheel.itemsOwned.length === 0) {
                return interaction.reply('The spinner is empty. No items available to win.');
            }

            // Check if the user has Wuuf's Wheel of Fortune in their inventory
            const wheelIndex = contestantData.itemsOwned.findIndex(item => item.itemName === `Wuuf's Wheel of Fortune`);
            if (wheelIndex === -1) {
                return interaction.reply("You don't have Wuuf's Wheel of Fortune in your inventory.");
            }

            // Remove the wheel from the contestant's inventory
            contestantData.itemsOwned.splice(wheelIndex, 1);
            await contestantData.save();

            // Send a message indicating that the spinning has started
            const spinEmbed = new EmbedBuilder()
                .setTitle('Spinning the Wheel')
                .setDescription('🔄 Spinning...')
                .setColor(config.color);

            const spinMessage = await interaction.reply({ embeds: [spinEmbed] });

            // Simulate the spinning effect
            const spinDuration = 10000; // Duration of spinning in milliseconds
            const spinInterval = 500; // Interval between each item change in milliseconds
            const startTime = Date.now();

            // Function to simulate the spinning effect
            const spinWheel = async () => {
                const elapsedTime = Date.now() - startTime;
                const remainingTime = Math.max(spinDuration - elapsedTime, 0);

                // Calculate the rate at which messages should be sent based on the remaining time
                const messageInterval = spinInterval;

                // Calculate the index of the item to display based on the elapsed time
                const currentIndex = Math.floor((elapsedTime / messageInterval) % wheel.itemsOwned.length);
                const currentItem = wheel.itemsOwned[currentIndex].itemName;

                // Update the embed with the current item name
                spinEmbed.setDescription(`🔄 Spinning... **${currentItem}**`);
                spinMessage.edit({ embeds: [spinEmbed] });

                // If spinning duration has elapsed, stop spinning and announce the winner
                if (remainingTime <= 0) {
                    const winningIndex = Math.floor(Math.random() * wheel.itemsOwned.length);
                    const winningItem = wheel.itemsOwned[winningIndex].itemName;

                    // Remove the winning item from the spinner
                    wheel.itemsOwned.splice(winningIndex, 1);
                    await wheel.save();

                    // // Add the winning item to the contestant's inventory
                    contestantData.itemsOwned.push({ itemName: winningItem });
                    await contestantData.save();

                    // Update the embed with the winner announcement
                    spinEmbed.setDescription(`🎉 Congratulations ${interaction.user}! You won **${winningItem}** from spinning the wheel. You will also move down -1 in the placements.`);
                    spinEmbed.setColor('#87ff95');
                    return spinMessage.edit({ embeds: [spinEmbed] });
                }

                // Continue spinning by scheduling the next iteration
                setTimeout(spinWheel, messageInterval);
            };

            // Start spinning the wheel
            await spinWheel();
        } catch (error) {
            console.error('Error in spinwheel command:', error);
            interaction.reply('An error occurred while processing the command.');
        }
    },
};
