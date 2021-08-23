const winston = require("winston");

const log = winston.createLogger({
  format: winston.format.errors({ stack: true }),
  transports: new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(
        ({ timestamp, label, level, message, stack }) =>
          `${timestamp} [${label ?? "app"}] ${level} ${stack ?? message}`
      )
    ),
  }),
});

module.exports = log;
