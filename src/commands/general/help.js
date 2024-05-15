const { EmbedBuilder } = require('discord.js');
const { buttonPages } = require('../../utils/pagination');
const config = require('../../../config.json');

module.exports = {
    name: 'help',
    description: 'Provides a list of commands for the WSOL bot.',
    options: [],
    
    callback: async (client, interaction) => {
        try {
            // Define the contestant and admin commands
            const contestantCommands = [
                '**Contestant Commands**\n',
                '**/shop** : Get an embed of all shop items that are purchasable.',
                '**/purchase {itemName}** : Purchase an item from the shop with your money.',
                '**/listmoney** : Lists the amount of money you have in your account.',
                '**/donatemoney {user} {amount}** : Send another contestant a certain amount of money.',
                '**/listitems {user}** : Lists all of the items that a user owns.',
                '**/transferitem {user} {item}** : Send another contestant an item you own.',
                '**/listallitems** : Lists all items owned by all contestants in the database.',
                '**/useitem {itemName} {quantity} (opt.) {usedOn} (opt.)** : Use an item that you own in your inventory.',
                '**/unuseitem {itemName} {quantity} (opt.)** : Unuse an item that you previously marked as used.',
                '\n**Item Commands**\n',
                '**/scavenge** : Once you have bought loot, used to get random item/money from loot.',
                '**/spinwheel** : Spin a wheel in your inventory to get a random item. Once used, it\'s removed from the inventory.',
                '**/listwheelitems** : List all items available on the wheel as long as their quantity and chances.'
            ];

            const adminCommands = [
                '**Admin Commands**\n',
                '**/initializeshop** : Initializes the shop in the shop channel.',
                '**/initializecontestants** : Initializes the contestants in the database based on who has the contestants role and creates channels (only use this at the start of the season.)',
                '**/add {user}** : Adds a user manually to the contestant database so they can start accessing the shop.',
                '**/remove {user}** : Removes a user manually from the contestant database.',
                '**/pay {user} {amount}** : Gives a user an amount of money based on input.',
                '**/setmoney {user} {amount}** : Sets a user\'s money manually based on the input.',
                '**/eliminate {user}** : Removes a user from the database and puts their items up for grabs.',
                '**/resetloot** : Resets the items and money in the loot.',
                '**/autorankings** : Automatically posts the rankings based on spreadsheet placements.',
                '**/autopay {amount}** : Automatically pays the contestant based on the spreadsheet placements, and the amount you input to be distributed.',
                '**/toggleshop** : Toggles the shop on/off. If it\'s off, contestants cant purchase items.',
                '**/updatechecklist {MM/DD/YYYY} {00:00 AM/PM} {MM/DD/YYYY} {00:00 AM/PM}** : Updates the checklist based on the time input.',
                '**/getuseditems** : Returns a list of all items being used in the database.',
                '**/resetuseditems** : Resets all used items by removing them from the users inventory.',
                '**/additem {user} {itemname}** : Manually add an item to a user\'s items'
            ];

            // Convert commands to embed format
            const contestantEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setDescription(contestantCommands.join('\n'));
            const adminEmbed = new EmbedBuilder()
                .setColor(config.color)
                .setDescription(adminCommands.join('\n'));

            // Create pages array for pagination
            const pages = [contestantEmbed, adminEmbed];

            // Handle button interaction to switch between contestant and admin commands
            await buttonPages(interaction, pages);

        } catch (error) {
            console.error('Error in help command:', error);
        }
    }
};