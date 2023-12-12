const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Provides a list of commands for the WSOL bot.',
    // devOnly: Boolean, 
    options: [],
    
    callback: (client, interaction) => {
        try {
            const embed = new EmbedBuilder()
                .setColor(297994)
                .setTitle('Commands')
                .setDescription(`To check how much money you have or what's inside of the shop, check the shop or leaderboard channels. Once a purchase has been made, it will be announced in the contestant-announcements channel.\n\n__Contestant Commands__\n**/purchase *{itemName}* :** Purchase an item from the shop with your money.\n**/listMoney :** Lists the amount of money you have in your account.\n**/donatemoney *{user} {amount}* :** Send another contestant a certain amount of money.\n**/listItems {user} :** Lists all of the items that a user owns.\n**/transferItem {user} {item} :** Send another contestant an item you own.\n\n__Admin Commands__\n**/initializeshop :** Initializes the shop based on what's in the database, and outputs a message to the shop channel.\n**/initializecontestants :** Initializes the contestants in the database based on who has the contestants role (only use this at the start of the season.)\n**/add {user} :** Adds a user manually to the contestant database so they can start accessing the shop.\n**/remove {user} :** Removes a user manually from the contestant database.\n**/pay {user} {amount} :** Gives a user an amount of money based on input.\n**/setMoney {user} {amount} :** Sets a user's money manually based on the input.`)
            interaction.reply({embeds: [embed]});
    
        } catch (error) {
            console.error('Error in help command:', error);
        }
    }
}