const assert = require("assert");
const events = require("events");
const http = require("http");

const { google } = require("googleapis");
const luxon = require("luxon");
const open = require("open");

const log = require("./log");

const oauth2Client = new google.auth.OAuth2({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: "http://localhost:13337/oauthcallback",
});

module.exports.authorize = function authorize() {
  return new Promise((resolve, reject) => {
    const server = new http.Server(async (req, res) => {
      const url = new URL(req.url, "http://localhost:13337/");

      if (url.pathname !== "/oauthcallback") {
        res.statusCode = 404;
        res.end();
        return;
      }

      const code = url.searchParams.get("code");
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      res.statusCode = 200;
      res.end("You can now close this page.");

      server.close();
      resolve();
    });

    server.on("error", reject);
    server.listen(13337);

    const authUrl = oauth2Client.generateAuthUrl({
      scope: [
        "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
        "https://www.googleapis.com/auth/calendar.events",
      ],
    });

    open(authUrl, { wait: false });
  });
};

module.exports.book = async function book({ day_of_week, time_hour, time_duration, title }) {
  assert(typeof day_of_week === "string");
  assert(typeof time_hour === "number" && 0 <= time_hour && time_hour < 24);
  assert(typeof time_duration === "number" && time_duration >= 0);
  assert(typeof title === "string");

  const weekdayIndex = luxon.Info.weekdays()
    .map((s) => s.toLowerCase())
    .indexOf(day_of_week);
  assert(weekdayIndex !== -1);

  let eventStart = luxon.DateTime.now()
    .set({ weekday: weekdayIndex + 1 })
    .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    .plus({ hours: time_hour });
  if (eventStart < luxon.DateTime.now()) eventStart = eventStart.plus({ weeks: 1 });

  const eventEnd = eventStart.plus({ hours: time_duration });

  log.info(`trying to book ${JSON.stringify(title)}`);
  log.info(`start time: ${eventStart.toISO()}`);
  log.info(`end time: ${eventEnd.toISO()}`);

  try {
    const calendarApi = google.calendar({ version: "v3", auth: oauth2Client });

    const { data: calendars } = await calendarApi.calendarList.list();

    const calendar = calendars.items.find((c) => c.accessRole === "owner");
    if (calendar === undefined) throw new Error("no owned calendar found");

    log.info(`using calendar ${calendar.id}`);

    const { data: conflictingEvents } = await calendarApi.events.list({
      calendarId: calendar.id,
      timeMin: eventStart.toISO(),
      timeMax: eventEnd.toISO(),
    });

    if (conflictingEvents.items.length > 0) {
      log.info("event conflict found");
      return "conflict";
    }

    await calendarApi.events.insert({
      calendarId: calendar.id,
      requestBody: {
        start: { dateTime: eventStart.toISO() },
        end: { dateTime: eventEnd.toISO() },
        summary: title,
      },
    });

    log.info("event booked successfully");

    return "success";
  } catch (error) {
    log.error(error);
    return "error";
  }
};
