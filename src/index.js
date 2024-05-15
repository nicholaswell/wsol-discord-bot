require('dotenv').config();

// Variables 

const { TOKEN ,  GUILD_ID, CLIENT_ID, DATABASE_CONNECTION_STRING } = process.env;
const { mongoose } = require('mongoose');
const {Client, GatewayIntentBits, Collection} = require('discord.js');
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

client.cooldowns = new Collection();


// Database Connection

(async () => {
	try {
		await mongoose.connect(DATABASE_CONNECTION_STRING);
		console.log("Connected to the database.")
	} catch (error) {
		console.log(`Error connecting to the database: ${error}`);
	}
})();



eventHandler(client);


// Login into Discord bot

client.login(TOKEN);

