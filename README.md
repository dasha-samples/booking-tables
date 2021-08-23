This is an example of a Discord bot built using [Discord.js], [Dasha.AI SDK] and its [Discord adapter library].

[discord.js]: https://npmjs.com/package/discord.js
[dasha.ai sdk]: https://npmjs.com/package/@dasha.ai/sdk
[discord adapter library]: https://npmjs.com/package/@dasha.ai/discord

If on Windows, ensure that you have set up the [development environment].

[development environment]: https://github.com/Microsoft/nodejs-guidelines/blob/master/windows-environment.md#environment-setup-and-configuration

To run this example, you first need to [create a bot] and [add it to a server].

[create a bot]: https://discordjs.guide/preparations/setting-up-a-bot-application.html
[add it to a server]: https://discordjs.guide/preparations/adding-your-bot-to-servers.html

Then, obtain your bot's [auth token], and assign it to the `DISCORD_BOT_TOKEN` environment variable. You can also use a [`.env` file].

[auth token]: https://discordjs.guide/preparations/setting-up-a-bot-application.html#your-token
[`.env` file]: https://www.npmjs.com/package/dotenv#usage

Finally, run `npm start`. The bot should now be displayed as online in Discord.

To launch a conversation in a Discord voice channel, join that channel first, and then send a `/dasha start` command to any text channel on the server.
