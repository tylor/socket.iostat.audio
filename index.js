var fs = require('fs');
var sio = require('socket.io');
var http = require('http');

var app = http.createServer(function (req, res) {
  fs.readFile('./index.html', function(error, content) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(content, 'utf-8');
  });
});

var iostat = require('child_process').spawn("iostat", ["-w 1"]);

app.listen(1337, "127.0.0.1");

var io = sio.listen(app);

iostat.stdout.on('data', function (data) {
  io.sockets.emit('data', format(data));
})

// From https://github.com/makoto/node-websocket-activity-monitor/blob/master/server/activity-monitor.js
function format (data) {
  var output_data = data.toString();
  header = 'disk0       cpu     load average'
  if (output_data.match(header)) {
  }else{
    // disk0 cpu load 
    // average kbt tps kbs us sy id 1m 5m 15m
    var output_array = output_data.replace(/^\s+|\s+$/g,"").split(/\s+/);
    for (var i=0; i < output_array.length; i++) {
      output_array[i] = parseFloat( output_array[i]);
    };
    output_hash = {
      date:new Date(),
      disk:{
        kbt:output_array[0],
        tps:output_array[1],
        mbs:output_array[2]
      },
      cpu:{
        us:output_array[3],
        sy:output_array[4],
        id:output_array[5]
      },
      load_average:{
        m1:output_array[6],
        m5:output_array[7],
        m15:output_array[8]
      }
    }
    return output_hash;
  }
}