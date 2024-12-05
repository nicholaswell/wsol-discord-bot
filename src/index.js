require('dotenv').config();

// Variables 
const { TOKEN, GUILD_ID, CLIENT_ID, DATABASE_CONNECTION_STRING } = process.env;
const { mongoose } = require('mongoose');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');

// Initializing intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

// Initialize commands collection
client.commands = new Collection();

// Register the musicprofile command
const musicProfileCommand = require('./commands/general/artistprofile.js');
client.commands.set(musicProfileCommand.name, musicProfileCommand);

// Set up cooldown collection
client.cooldowns = new Collection();

// Database Connection
(async () => {
    try {
        await mongoose.connect(DATABASE_CONNECTION_STRING);
        console.log("Connected to the database.");
    } catch (error) {
        console.log(`Error connecting to the database: ${error}`);
    }
})();

// Load event handlers
eventHandler(client);

// Set up the interactionCreate event listener
client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand()) {
        // Handle command interactions
        const command = client.commands.get(interaction.commandName);

    }

    if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);

        if (command && typeof command.autocomplete === 'function') {
            try {
                // Execute the command's autocomplete function
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(`Error executing autocomplete for ${interaction.commandName}:`, error);
            }
        } else {
            console.log(`No autocomplete function found for command: ${interaction.commandName}`); // Log if no autocomplete function
        }
    }
});

// Log in to Discord with your bot token
client.login(TOKEN);
