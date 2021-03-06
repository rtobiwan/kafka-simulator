const { Kafka, logLevel } = require("kafkajs");
const winston = require("winston");
const server = require("http").createServer();

const io = require("socket.io")(3030, {
  path: "/log",
  serveClient: false,
  // below are engine.IO options
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
});

// const createConsumer = require('./consumer');

const toWinstonLogLevel = (level) => {
  switch (level) {
    case logLevel.ERROR:
    case logLevel.NOTHING:
      return "error";
    case logLevel.WARN:
      return "warn";
    case logLevel.INFO:
      return "info";
    case logLevel.DEBUG:
      return "debug";
  }
};

const WinstonLogCreator = (logLevel) => {
  const logger = winston.createLogger({
    level: toWinstonLogLevel(logLevel),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: "myapp.log" }),
    ],
  });

  logger.stream({ start: -1 }).on("log", function (log) {
    io.sockets.emit("message", "randomString");
    // console.log("<<<<<<<<<<<>>>>>>>>>>>>>><<<<<<<<<<<<<<<>>>>>>>>>>>>");
  });

  return ({ namespace, level, label, log }) => {
    const { message, ...extra } = log;
    logger.log({
      level: toWinstonLogLevel(level),
      message,
      extra,
    });
  };
};

const kafka = new Kafka({
  clientId: "brocoin",
  brokers: ["localhost:9092"],
  logLevel: logLevel.DEBUG,
  logCreator: WinstonLogCreator,
});

module.exports = kafka;
