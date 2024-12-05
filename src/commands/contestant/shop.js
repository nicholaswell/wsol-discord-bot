const { EmbedBuilder, ButtonStyle, ComponentType, ButtonBuilder, ActionRowBuilder, AttachmentBuilder } = require('discord.js');
const Shop = require('../../models/Shop');
const config = require('../../../config.json');
const fs = require('fs');
const path = require('path');
const { buttonPages } = require('../../utils/pagination');

// Define the season images object
const seasonImages = {
    1: 'https://i.imgur.com/8aIHktt.png',
    2: 'https://i.imgur.com/2UPl02S.png',
    3: 'https://i.imgur.com/JReWQqE.png',
    4: 'https://i.imgur.com/XeuVhTS.png',
    5: 'https://i.imgur.com/nVMRnmZ.png',
    6: 'https://i.imgur.com/UN86icH.png',
    7: 'https://i.imgur.com/NmAVsNZ.png',
    8: 'https://i.imgur.com/YLbiHMF.png',
    9: 'https://i.imgur.com/hvXq3ON.png'
};

const seasonColors = {
    1: '#fdd221',
    2: '#d7abcc',
    3: '#a86621',
    4: '#456323',
    5: '#f200a1',
    6: '#47050e',
    7: '#b0a36d',
    8: '#ffffff',
    9: '#5394ca'
}

module.exports = {
    name: 'shop',
    description: 'Sends an embed of the shop items.',
    devOnly: false,
    options: [],

    callback: async (client, interaction) => {
        try {
            const seasons = await Shop.distinct('season');
            const pages = [];

            for (const season of seasons) {
                const shopItems = await Shop.find({ season });

                const embed = new EmbedBuilder()
                    .setColor(config.color)
                    .setTitle(`Shop - Page ${season}`)

                shopItems.forEach((item) => {
                    embed.addFields({ name: item.name, value: `$${item.price}\n${item.description}\n*Left Remaining: ${item.remaining}*\n\n`});
                });

                pages.push(embed);
            }

            await buttonPages(interaction, pages);

        } catch (error) {
            console.error('Error in initializeshop command:', error);
            interaction.reply({ content: "An error occurred while initializing the shop.", ephemeral: true });
        }
    }
};
