/** @type {ChatInputCommandCallback} */
export function callback(client, interaction) {
	interaction.reply("pong");
}

/** @type {import("discord.js").APIApplicationCommand} */
export const data = {
	description: "ping",
};
