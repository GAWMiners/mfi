var express = require('express')
  , http = require('http')
  , bodyParser = require('body-parser')
  , log = require('npmlog')
  , baseUrl = 'https://api.hipchat.com/v1/rooms/message?format=json&auth_token='
  , request = require('request')

log.heading = 'webhooks'

var mfi = exports

mfi.log = log

mfi.load = function(opts) {
  mfi.port = opts.port || 3030
  mfi.token = opts.token
  mfi.roomId = opts.roomId
  log.verbose('[opts]', {
    token: mfi.token
  , roomId: mfi.roomId
  , port: mfi.port
  })
  return mfi
}

mfi.start = function() {
  mfi.server = http
    .createServer(app)
    .listen(mfi.port, function() {
      log.info('[listen]', mfi.port)
    })
}
var app = express()

app.use(bodyParser())

app.post('/', function(req, res) {
  log.http('['+req.method+']', req.url)
  var body = req.body
  log.verbose('[body]', body)
  res.send(200)
  push(body)
})

function push(data, cb) {
  log.http('POST', baseUrl)
  var r = request.post(baseUrl+mfi.token, function(err, res, body) {
    if (err) {
      log.error('[hipchat]', err)
      return cb && cb(err)
    }
    var code = res.statusCode
    if (code !== 200) {
      var err = new Error('Received non-200 status code: '+code)
      err.body = body
      log.error('[hipchat]', err, body)
      return cb && cb(err)
    }
    log.info('[hipchat]', 'successfully posted to hipchat')
    cb && cb()
  })
  var form = r.form()
  form.append('color', 'red')
  var msg = 'ALERT:<br/><table style="padding: 0; margin:0;" cellpadding="0" '+
    'cellspacing="0">'
  msg += row('SENSOR:', data.sensor)
  msg += row('RULE:', data.rule)
  msg += row('TEMP:', data.value, true)
  msg += '</table>'
  form.append('message', msg)
  form.append('room_id', mfi.roomId)
  form.append('from', 'mFi')
}

function row(title, value, strong) {
  var r = '<tr style="padding:0; margin:0;">'+
    '<td style="padding:0; margin:0; text-align: right;">'+
    '  '+title+'</td>'+
    '<td style="padding:0; margin:0;">'

  if (strong) r += '<strong>' + (ctof(+value)) + '</strong>'
  else r += value

  r += '</td></tr>'
  return r
}

function ctof(i) { return (((i*9)/5)+32).toFixed(2) + '°' }
