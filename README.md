# trustybot

discord bot project of the same name that i have revived for the 10th time now. this time however is the only time i actually follow the official [discord.js guide on how to start a discord bot project](https://discordjs.guide/creating-your-bot/command-handling.html) properly, using a modular command/event handler system.

due to a lack of time/motivation to work on this (i'm years past the discord bot phase), nothing worked for a while. but since [deno 2.0 released with typescript support out of the box](https://deno.com/blog/v2.0), i suddenly gained the motivation to translate all the code here to typescript for a better DX... but then the bot never logged in... welp we're going back to node and tsc for now!

## setup
- with deno run `deno install npm:discord.js npm:typescript` (or `npm i` if you're patient)
- to start up the bot in the background run `deno run start` or `npm start`
- to stop the bot when started with the `start` task, run `deno run stop` or `npm stop`

## features
- custom embed color (per server)
- send audit log events to a text channel (per server)
