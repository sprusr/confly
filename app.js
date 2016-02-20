var express = require('express');
var request = require('request');

var apiKey = require('./config.js').apiKey;

var info = {
  conferences: [{
    name: 'BigCon',
    city: 'SFO'
  }, {
    name: 'SmallCon',
    city: 'DUB'
  }]
};

var app = express();

app.set('view engine', 'jade');

app.get('/', function(req, res) {
  res.render('index', {});
})

app.get('/test', function(req, res) {
  var market = 'GB', currency = 'GBP', locale = 'en-GB', originPlace = 'BHX', destinationPlace = 'BCN', outboundPartialDate = '2016-02-22', inboundPartialDate = '2016-02-24';
  request.get('http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/' + market + '/' + currency + '/' + locale + '/' + originPlace + '/' + destinationPlace + '/' + outboundPartialDate + '/' + inboundPartialDate + '?apiKey=' + apiKey, function(err, response, body) {
    var jsonres = JSON.parse(body);
    res.send('Price: ' + jsonres.Currencies[0].Symbol + jsonres.Quotes[0].MinPrice + '\n' + body);
  })
});

app.get('/test/old', function(req, res) {
  request.post('http://partners.api.skyscanner.net/apiservices/pricing/v1.0').form({
    apiKey: apiKey,
    country: 'GB',
    currency: 'GBP',
    locale: 'en-GB',
    originplace: 'BHX',
    destinationplace: 'BCN',
    outbounddate: '2016-02-22',
    inbounddate: '2016-02-24',
    adults: 1,
    locationschema: 'Iata'
  }).on('response', function(sessRes) {
    if(sessRes.headers.location) {
      request.get(sessRes.headers.location + '?apiKey=' + apiKey, function(err, queryRes, body) {
        res.send(body);
      });
    }
  });
});

app.use(express.static(__dirname + '/static'));

app.listen(8000);
