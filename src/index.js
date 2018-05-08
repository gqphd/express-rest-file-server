import nodegetopt from 'node-getopt';
import logger, { setLogLevel } from './log';
import server from './server';
import pkg from '../package.json';

const opt = nodegetopt.create([
  ['p', 'port=PORT', 'server port (default 5000)'],
  ['', 'chunknumber=CHUNKNUMBER', "chunk number parameter (default 'chunknumber')"],
  ['', 'totalsize=TOTALSIZE', "total size parameter (default 'totalsize')"],
  ['', 'storageType=TYPE', "disk or memory (default 'memory')"],
  ['', 'storagePath=PATH', "where to save files (default '/tmp')"],
  ['', 'route=flies', "the API starting path (default '/files')"],
  ['v', 'verbose', 'change log level to lowest'],
]).bindHelp().parseSystem().options;

logger.info('================================');
logger.info('>>> Express REST file server');
logger.info(`>>> version: ${pkg.version}`);
logger.info('================================');

if (opt.verbose) {
  setLogLevel('silly');
  logger.debug('Command line options', opt);
}

server.run({
  port: (opt.port || process.env.PORT || 5000),
  chunkNumber: opt.chunknumber,
  totalSize: opt.totalsize,
  storage: {
    type: (opt.storageType || 'memory'),
    path: (opt.storageType === 'disk' && opt.storagePath ? opt.storagePath : '/tmp'),
  },
  route: (opt.route || 'files'),
  verbose: (!!opt.verbose),
});
