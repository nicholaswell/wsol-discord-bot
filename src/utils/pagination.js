const { ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');


async function buttonPages(interaction, pages, time = 300000) {
    if (!interaction) throw new Error("Please provide an interaction argument");
    if (!pages) throw new Error("Please provide a page argument");
    if (!Array.isArray(pages)) throw new Error("Pages must be an array");
    if (typeof time !== "number") throw new Error("Time must be a number.");
    if (parseInt(time) < 30000) throw new Error("Time must be greater than 30 Seconds");

    const prev = new ButtonBuilder()
        .setCustomId("prev")
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);

    const next = new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("➡️")
        .setStyle(ButtonStyle.Primary);

    const buttonRow = new ActionRowBuilder().addComponents(prev, next);
    let index = 0;

    const currentPage = await interaction.reply({
        embeds: [pages[index]],
        components: [buttonRow],
        fetchReply: true
    });

    const collector = currentPage.createMessageComponentCollector({ componentType: ComponentType.BUTTON, time: time });

    collector.on("collect", async (i) => {
        if (i.user.id !== interaction.user.id) {
            await i.reply({ content: "You can't use these buttons", ephemeral: true });
            return;
        }

        await i.deferUpdate();

        if (i.customId === "prev") {
            if (index > 0) index--;
        } else if (i.customId === "next") {
            if (index < pages.length - 1) index++;
        }

        prev.setDisabled(index === 0);
        next.setDisabled(index === pages.length - 1);

        await currentPage.edit({
            embeds: [pages[index]],
            components: [buttonRow]
        });
    });

    collector.on("end", () => {
        const disabledButtonRow = new ActionRowBuilder().addComponents(prev.setDisabled(true), next.setDisabled(true));
        currentPage.edit({ components: [disabledButtonRow] });
    });
}

module.exports = { buttonPages };