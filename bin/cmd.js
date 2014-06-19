#!/usr/bin/env node

var fs = require('fs')
  , nopt = require('nopt')
  , knownOpts = { loglevel: ['verbose', 'info', 'error']
                , help: Boolean
                , version: Boolean
                , token: String
                , roomId: String
                , port: Number
                }
  , shortHand = { verbose: ['--loglevel', 'verbose']
                , h: ['--help']
                , v: ['--version']
                , p: ['--port']
                , t: ['--token']
                , r: ['--roomId']
                , l: ['--loglevel']
                }
  , parsed = nopt(knownOpts, shortHand)

var mfi = require('../')
var pkg = require('../package')

if (parsed.help) {
  usage(0)
  return
}

if (parsed.version) {
  console.log('mfi', 'v'+pkg.version)
  return
}

if (parsed.loglevel) mfi.log.level = parsed.loglevel

if (!parsed.token) {
  mfi.log.error('[args]', 'token is required')
  usage(1)
  return
}

if (!parsed.roomId) {
  mfi.log.error('[args]', 'roomId is required')
  usage(1)
  return
}

mfi.load(parsed).start()

function usage(code) {
  var rs = fs.createReadStream(__dirname + '/usage.txt')
  rs.pipe(process.stdout)
  rs.on('close', function() {
    if (code) process.exit(code)
  })
}
