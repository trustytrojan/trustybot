/** @param {import("discord.js").ChatInputCommandInteraction & { client: import("../Trustybot.js").default }} interaction */
export function callback(interaction) {
	interaction.reply("pong");
}

/** @type {import("discord.js").APIApplicationCommand} */
export const data = {
	description: "ping",
};
