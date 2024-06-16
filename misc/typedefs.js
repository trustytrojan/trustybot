// When using VSCode, keep this file pinned open to make typedef hovers work.

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

/**
 * @typedef {object} TgCounting
 * @prop {string?} channel
 * @prop {readonly string} channelString
 * @prop {number} count
 * @prop {string?} lastUser
 */

/**
 * @typedef {object} TGuildData
 * @prop {string} embedColor
 * @prop {string?} logChannel
 * @prop {string?} bumpChannel
 * @prop {TgCounting} counting
 */

/**
 * @typedef {object} TgBumpReminder
 * @prop {string?} channel
 * @prop {readonly string} channelString
 * @prop {string?} message
 */