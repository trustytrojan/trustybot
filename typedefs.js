/**
 * @typedef {import("discord.js").ChatInputCommandInteraction<"cached"> & { client: import("./Trustybot.js").default }} TbChatInputCommandInteraction
 */

/**
 * @typedef {object} CommandModule
 * @prop {(_: TbChatInputCommandInteraction) => *} callback
 * @prop {import("discord.js").APIApplicationCommand} data
 */

/**
 * @callback ServerSettingsOptionCheck
 * @param {string} value 
 * @param {TbChatInputCommandInteraction} 
 * @param {import("discord.js").EmbedBuilder} embed
 * @returns {string}
 */