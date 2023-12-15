import { CommandInteraction } from "discord.js";

/**
 * @param {import("discord.js").APIEmbed} embed 
 */
CommandInteraction.prototype.replyEmbed = function(embed) { this.reply({ embeds: [embed] }); };
