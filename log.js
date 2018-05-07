const winston = require('winston');

const { config } = winston;
const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
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

module.exports = logger;
