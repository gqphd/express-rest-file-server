import nodegetopt from 'node-getopt';
import server from './server';

const opt = nodegetopt.create([
  ['p', 'port=PORT', 'server port (default 5000)'],
  ['', 'chunknumber=CHUNKNUMBER', "chunk number parameter (default 'chunknumber')"],
  ['', 'totalsize=TOTALSIZE', "total size parameter (default 'totalsize')"],
  ['', 'storageType=TYPE', "disk or memory (default 'memory')"],
  ['', 'storagePath=PATH', "where to save files (default '/tmp')"],
  ['', 'route=flies', "the API starting path (default '/files')"],
]).bindHelp().parseSystem().options;

server.run({
  port: (opt.port || process.env.PORT || 5000),
  chunkNumber: opt.chunknumber,
  totalSize: opt.totalsize,
  storage: {
    type: opt.storageType,
    path: opt.storagePath,
  },
  route: (opt.route || 'files'),
});
