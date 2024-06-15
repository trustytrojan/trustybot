/**
 * @typedef {import("discord.js").ChatInputCommandInteraction<"cached"> & { client: import("../classes/Trustybot.js").default }} TbChatInputCommandInteraction
 */

/**
 * @typedef {object} CommandModule
 * @prop {(_: TbChatInputCommandInteraction) => *} callback
 * @prop {import("discord.js").APIApplicationCommand} data
 */

/**
 * @callback ServerSettingsSetter
 * @param {string} value 
 * @param {TbChatInputCommandInteraction} interaction
 * @param {import("discord.js").EmbedBuilder} embed
 * @returns {string}
 */
