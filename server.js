var express = require('express');
var bodyParser = require('body-parser');
var Pusher = require('pusher');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// to serve our JavaScript, CSS and index.html
app.use(express.static('./'));

var pusher = new Pusher({
  appId: '576320',
  key: '6780742e5e8b3e07326f',
  secret:  'e207bb5c71bf789028d6' 
});


app.post('/pusher/auth', function(req, res) {
  var socketId = req.body.socket_id;
  var channel = req.body.channel_name;
  const user_id = req.cookies.user_id;
  const presenceData = { user_id };
  var auth = pusher.authenticate(socketId, channel, presenceData);
  res.send(auth);
});

var port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listening at http://localhost:5000'));