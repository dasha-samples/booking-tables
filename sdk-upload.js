const uuid = require("node-uuid");
const csv = require("./csv-plugin");
const moment = require("moment");
const fs = require("fs");

const callData = new Map();

const headers = [
  { id: "key", title: "key" },
  { id: "phone", title: "phone" },
  { id: "handleStatus", title: "handleStatus" },
  { id: "status", title: "status" },
  { id: "serviceStatus", title: "serviceStatus" },
  { id: "callBackDetails", title: "callBackDetails" },
  { id: "record", title: "record" }
];

let writer;

function writeResult(writer, timestamp, input, output, custom) {
  writer.writeRecords([{ timestamp, ...input, ...output, ...custom }]);
};

module.exports = exports = {
  async loadAndQueue(app, path, csvParams) {
    const data = await csv.load(path, csvParams);
    for (const dataRecord of data) {
      const uniqueId = uuid.v4();
      app.queue.push(uniqueId);
      callData.set(uniqueId, dataRecord);
    }
  },
  handleCalls(app, reportPath, onEnded) {
    writer = csv.createWriter(reportPath, headers);
    app.queue.on("ready", async (key, conv) => {
      const data = callData.get(key);
      conv.input = data;

      if (conv.input.phone !== "chat") conv.on("transcription", console.log);
      else {
        console.warn(`chat was rejected, use 'npm start chat ...' instead`);
        callData.delete(key);
        if(callData.size == 0){
          onEnded();
        }
        return;
      }

      const logFile = await fs.promises.open(`./logs/${key}.txt`, "w");
      await logFile.appendFile("#".repeat(100) + "\n");

      conv.on("transcription", async (entry) => {
        await logFile.appendFile(`${entry.speaker}: ${entry.text}\n`);
      });

      conv.on("debugLog", async (event) => {
        if (event?.msg?.msgId === "RecognizedSpeechMessage") {
          const logEntry = event?.msg?.results[0]?.facts;
          await logFile.appendFile(
            JSON.stringify(logEntry, undefined, 2) + "\n"
          );
        }
      });

      try {
        const result = await conv.execute();
        console.log(result.output);
        const now = moment();
        writeResult(writer, now, conv.input, result.output, {
          key,
          handleStatus: "Rejected",
          record: result.recordingUrl
        });
      } catch (error) {
        const now = moment();
        console.error(
          `Job ${key} execution was failed. Error: ${error.name}: ${error.message}`
        );
        writeResult(writer, now, conv.input, null, { key, handleStatus: "Failed" });
      } finally {
        await logFile.close();
        callData.delete(key);
        if(callData.size == 0){
          onEnded();
        }
      }
    });

    app.queue.on("error", (error) => {
      console.error(
        `Error ${error.name}:${error.message}. Reason ${error.reason}`
      );
    });

    app.queue.on("rejected", (key, error) => {
      console.warn(
        `Job ${key} was rejected. Error ${error.name}:${error.message}. Reason ${error.reason}`
      );
      const now = moment();
      writeResult(writer, now, callData.get(key), null, { key, handleStatus: "Rejected" });
      callData.delete(key);
      if(callData.size == 0){
        onEnded();
      }
    });

    app.queue.on("timeout", (key) => {
      console.log(`Job ${key} was timed out`);
      const now = moment();
      writeResult(writer, now, callData.get(key), null, { key, handleStatus: "Timeout" });
      callData.delete(key);
      if(callData.size == 0){
        onEnded();
      }
    });
  },
};
