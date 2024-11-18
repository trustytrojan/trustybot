import { ChatInputApplicationCommandData, Collection, EmbedBuilder, User } from 'discord.js';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { default as Pokedex, NamedAPIResourceList } from 'pokedex-promise-v2';
import { TbChatInputCommandInteraction } from '../classes/Trustybot.js';

const P = new Pokedex();

if (!existsSync('data/pkmn.json')) {
	if (!existsSync('data')) {
		mkdirSync('data');
	}
	const pkmnNames = ((await P.getResource('/api/v2/pokemon?limit=100000')) as NamedAPIResourceList).results.map(o => o.name);
	writeFileSync('data/pkmn.json', JSON.stringify(pkmnNames));
}

const pokemonSet = new Set((await import(`${process.cwd()}/data/pkmn.json`, { with: { type: 'json' } })).default);
const guessedSet = new Set<string>();

export async function callback(interaction: TbChatInputCommandInteraction) {
	const replyMsg = await interaction.reply({
		content: 'pokemon quiz starting in the thread below!',
		fetchReply: true
	});

	const thread = await replyMsg.startThread({ name: 'pokemon naming quiz' });
	const coll = thread.createMessageCollector({
		filter: msg => !msg.author.bot
	});
	const pkmnPerUser = new Collection<User, Set<string>>();

	console.log(`[pkmn_quiz ${thread.id}] starting!`);

	coll.on('collect', async msg => {
		if (msg.content === '!lb') {
			const embed = new EmbedBuilder();
			let userStr = '',
				scoreStr = '';
			for (const [user, pkmn] of pkmnPerUser) {
				userStr += `${user}\n`;
				scoreStr += `${pkmn.size}\n`;
			}
			msg.reply({
				embeds: [
					{
						fields: [
							{ name: 'user', value: userStr, inline: true },
							{ name: 'score', value: scoreStr, inline: true }
						]
					}
				]
			});
			return;
		}

		const guess = msg.content.trim().toLowerCase();
		console.log(`[pkmn_quiz ${thread.id}] ${msg.author.tag} guessed '${guess}'`);

		if (pokemonSet.has(guess)) {
			pokemonSet.delete(guess);
			guessedSet.add(guess);
			const score = pkmnPerUser.ensure(msg.author, () => new Set()).add(guess).size;
			msg.react('✅');

			const pkmn = await P.getPokemonByName(guess);
			const imgUrl = pkmn.sprites.front_default;
			msg.reply({
				content: `${msg.author} named \`${guess}\`! their new score is **${score}**`,
				embeds: [
					{
						image: imgUrl ? { url: imgUrl } : void 0
					}
				]
			});
			return;
		}

		if (guessedSet.has(guess)) {
			msg.react('🔁');
			return;
		}
	});
}

export const data: ChatInputApplicationCommandData = {
	name: 'pkmn_quiz',
	description: 'start a pokemon naming quiz!'
};
