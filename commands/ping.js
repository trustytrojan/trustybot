/** @param {TbChatInputCommandInteraction} interaction */
export function callback(interaction) {
	interaction.reply(`pong: \`${interaction.client.ws.ping}ms\``);
}

/** @type {import("discord.js").APIApplicationCommand} */
export const data = {
	description: "ping",
};
