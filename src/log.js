import winston, { Logger, transports as _transports } from 'winston';

const { config } = winston;
const logger = new (Logger)({
  transports: [
    new (_transports.Console)({
      timestamp() {
        return Date.now();
      },
      formatter(options) {
        const color = config.colorize(options.level, options.level.toUpperCase());
        const message = options.message ? options.message : '';
        const meta = options.meta && Object.keys(options.meta).length ?
          `\n\t${JSON.stringify(options.meta)}` :
          '';
        return `[${options.timestamp()}][${color}] ${message} ${meta}`;
      },
    }),
  ],
});

export default logger;
