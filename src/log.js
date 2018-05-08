import winston, { Logger, transports as _transports } from 'winston';

const logger = new Logger({
  level: winston.level,
  transports: [
    new (_transports.Console)({
      timestamp() {
        return Date.now();
      },
      formatter(options) {
        const level = winston.config.colorize(options.level, options.level.toUpperCase().padEnd(6));
        const message = options.message ? options.message : '';
        const meta = options.meta && Object.keys(options.meta).length ?
          `\n${JSON.stringify(options.meta, null, 2)}` :
          '';
        return `[${options.timestamp()}][${level}] ${message} ${meta}`;
      },
    }),
  ],
});

export default logger;

export function setLogLevel(level) {
  logger.transports.console.level = level;
}
