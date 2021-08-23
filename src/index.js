require("dotenv/config");

const assert = require("assert");
const events = require("events");
const fs = require("fs"); 

const { DiscordVoiceAdapter } = require("@dasha.ai/discord");
const dasha = require("@dasha.ai/sdk");
const discord = require("discord.js");

const log = require("./log");

dasha.log.clear();
dasha.log.add(log);

const gcalendar = require("./google-calendar");

async function main() {
  log.info("authorizing with google calendar");

  await gcalendar.authorize();

  log.info("logging into discord");

  const discordClient = new discord.Client();
  await discordClient.login(process.env.DISCORD_BOT_TOKEN);

  const botInviteLink = await discordClient.generateInvite({
    permissions: ["VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS", "CONNECT", "SPEAK", "USE_VAD"],
  });
  log.info(`bot invite link: ${botInviteLink}`);

  log.info("deploying the dasha application");

  const dashaApp = await dasha.deploy(`${__dirname}/../app`);

  dashaApp.connectionProvider = () => dasha.audio.connect();

  dashaApp.setExternal("google_calendar_book", gcalendar.book);

  dashaApp.setExternal("discord_invite", async ({ user_name }, conv) => {
    try {
      log.info(`trying to invite ${JSON.stringify(user_name)}`)

      const voiceChannel = await discordClient.channels.fetch(conv.input.discord.voiceChannelId);
      assert(voiceChannel instanceof discord.VoiceChannel);

      const invite = await voiceChannel.createInvite({ unique: true, maxAge: 5 * 60 });

      const member = (await voiceChannel.guild.members.fetch({ query: user_name })).first();
      if (member === undefined) throw new Error(`no user found: ${JSON.stringify(user_name)}`);

      await member.send(invite);

      log.info(`successfully invited ${JSON.stringify(user_name)}`);
      return "success";
    } catch (error) {
      log.error(error);
      return "error";
    }
  });

  dashaApp.incoming.on("request", async (endpoint, additionalInfo) => {
    const { discord } = JSON.parse(additionalInfo);

    const conv = dashaApp.createConversation({ endpoint, discord });

    /** @type discord.TextChannel */
    const discordTextChannel = await discordClient.channels.fetch(discord.startTextChannelId);

    const discordMessage = await discordTextChannel.messages.fetch(discord.startMessageId);

    conv.on("transcription", async (t) => {
      discordMessage.reply(`${t.speaker}: ${t.text}`);
    });


  const logFile = await fs.promises.open(`${__dirname}/../log.txt`, "w");
  await logFile.appendFile("#".repeat(100) + "\n");

  conv.on("transcription", async (entry) => {
    await logFile.appendFile(`${entry.speaker}: ${entry.text}\n`);
  });

  conv.on("debugLog", async (event) => {
    if (event?.msg?.msgId === "RecognizedSpeechMessage") {
      const logEntry = event?.msg?.results[0]?.facts;
      await logFile.appendFile(JSON.stringify(logEntry, undefined, 2) + "\n");
    }
  });

    await conv.execute();
  });

  log.info("starting the dasha application");

  await dashaApp.start();

  log.info("setting up command handlers");

  discordClient.on("message", async (message) => {
    if (message.author === discordClient.user) return;

    if (message.channel === message.author.dmChannel || message.mentions.has(discordClient.user)) {
      message.reply("Use the `/dasha start` command in any text channel to start a convo.");
      return;
    }

    if (message.content === "/dasha start") {
      log.info("got a /dasha start command");

      if (!message.guild) {
        await message.reply("Voice only works in guilds.");
        return;
      }

      const discordVoiceChannel = message.member.voice.channel;

      if (!discordVoiceChannel) {
        await message.reply("You need to join a voice channel first!");
        return;
      }

      const dashaAudioClientAccount = await dashaApp.getAudioClientAccount();
      const dashaAudioChannel = await dasha.audioClient.connect(dashaAudioClientAccount, {
        additionalInfo: JSON.stringify({
          discord: {
            voiceChannelId: discordVoiceChannel.id,
            startTextChannelId: message.channel.id,
            startMessageId: message.id,
          },
        }),
      });

      log.info("connecting");

      const dashaDiscordAdapter = new DiscordVoiceAdapter(dashaAudioChannel, discordVoiceChannel);

      log.info("waiting for conversation to end");

      await events.once(dashaAudioChannel, "close");

      log.info("cleaning up");

      dashaDiscordAdapter.close();
    }
  });

  log.info("waiting for a /dasha start");
}

main().catch(log.error);
