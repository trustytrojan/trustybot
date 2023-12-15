/**
 * @typedef {import("discord.js").Client<true> & { tguilds: import("discord.js").Collection<string, import("./dataclasses").TGuild> }} Trustybot
 */

/**
 * @callback ChatInputCommandCallback
 * @param {Trustybot} client
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 */

/**
 * @typedef {object} CommandModule
 * @prop {ChatInputCommandCallback} callback
 * @prop {import("discord.js").APIApplicationCommand} data
 */
