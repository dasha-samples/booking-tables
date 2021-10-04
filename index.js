const dasha = require("@dasha.ai/sdk");
const csv = require("./csv-plugin");
const simpleCsvSchedule = require("./sdk-upload");
const fs = require("fs");
const moment = require("moment");

async function main() {
  const app = await dasha.deploy("./app");

  app.ttsDispatcher = () => "Default";

    console.log(args);
  });

  await app.start();
  
 conv.audio.tts = "dasha";

  if (conv.input.phone === "chat") {
    await dasha.chat.createConsoleChat(conv);
  } else {
    conv.on("transcription", console.log);
  }

    conv.on("debugLog", async (event) => {
      if (event?.msg?.msgId === "RecognizedSpeechMessage") {
        const logEntry = event?.msg?.results[0]?.facts;
        await logFile.appendFile(
          JSON.stringify(logEntry, undefined, 2) + "\n"
        );
      }
    });

  const result = await conv.execute({
    channel: conv.input.phone === "chat" ? "text" : "audio",
  });
    console.log(result.output);
    
    await app.stop();
    app.dispose();
    await logFile.close();
    
  } else {
    const fileIn = process.argv[2];
    let fileOut = process.argv[3];
    if(!fileOut) {
      fileOut = `${moment().format("YYYY-MM-DD_HH-mm-ss")}.csv`;
    }
    await simpleCsvSchedule.loadAndQueue(app, fileIn);
    simpleCsvSchedule.handleCalls(app, fileOut, async () => {
      console.log(`Calls completed`);
      await app.stop();
      app.dispose();
      process.exit(0);
    });
  }
}

main();
