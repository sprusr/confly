// @ Author: Scott Street & Nathaniel Baulch-Jones
// @ Version: v0.1a

var express = require('express'); // Require Express Module
var request = require('request'); // Require Request Module

var apiKey = require('./config.js').apiKey; // Require config.js API Key - see README for details

var budget = 5200; // Set the user's cash budget, we can change this later.
var userCurrency = 'GBP'; // Set the user's local currency - defaults to Pound Sterling

var conferences = [
  // Hard code conferences for now ^_^ #lazy
  {
    name: 'Mobile World Congress', // name: Name of the event
    city: 'BCN', // city: The IATA airport code of the host airport (no support for multiple in v1.0)
    startDate: '2016-02-22', // startDate: YYYY-MM-DD
    endDate: '2016-02-25', // endDate: YYYY-MM-DD
    cost: 1039.32, // cost: The base cost of a ticket in GBP (locales ignored for now!)
    importance: 800 // importance: The subjective scale of importance of the event - which we will rank by.
  },
  {
    name: 'RSA Conference',
    city: 'SFO',
    startDate: '2016-02-29',
    endDate: '2016-03-04',
    cost: 996.11,
    importance: 300
  },
  {
    name: 'SXSW Interactive',
    city: 'AUS',
    startDate: '2016-03-11',
    endDate: '2016-03-15',
    cost: 898.93,
    importance: 250
  },
  {
    name: 'Game Developers Conference',
    city: 'SFO',
    startDate: '2016-03-14',
    endDate: '2016-03-18',
    cost: 971.12,
    importance: 700
  },
  {
    name: 'Black Hat Asia',
    city: 'SIN',
    startDate: '2016-03-29',
    endDate: '2016-04-01',
    cost: 936.42,
    importance: 400
  },
  {
    name: 'Microsoft Build',
    city: 'SFO',
    startDate: '2016-03-30',
    endDate: '2016-04-01',
    cost: 690.68,
    importance: 600
  },
  {
    name: 'TechCrunch Disrupt NY',
    city: 'JFK',
    startDate: '2016-05-09',
    endDate: '2016-05-11',
    cost: 1246.01,
    importance: 700
  },
  {
    name: 'Google I/O',
    city: 'SFO',
    startDate: '2016-05-18',
    endDate: '2016-05-20',
    cost: 208.25,
    importance: 700
  },
  {
    name: 'E3',
    city: 'LAX',
    startDate: '2016-06-14',
    endDate: '2016-06-16',
    cost: 551.85,
    importance: 700
  },
  {
    name: 'The Next Web',
    city: 'AMS',
    startDate: '2016-05-26',
    endDate: '2016-05-27',
    cost: 382.52,
    importance: 700
  },
];

var app = express();

app.set('view engine', 'jade');

app.get('/', function(req, res) {
  res.render('index', {});
});

app.get('/search', function(req, res) {
  if(!(req.query.origin && req.query.budget)) {
    res.send('Need to supply origin and budget query params.');
  } else {
    var cons = conferences;
    var resCount = 0;
    var totalCost = 0;
    var chosenCons = [];
    var budget = req.query.budget;

    cons.sort(function(a, b) {
      if(a.importance < b.importance) {
        return 1;
      } else {
        return -1;
      }
    });

    cons.forEach(function(con) {
      var market = 'GB', currency = 'GBP', locale = 'en-GB', originPlace = req.query.origin, destinationPlace = con.city, outboundPartialDate = con.startDate, inboundPartialDate = con.endDate;
      getFlightsPrice(originPlace, con.city, con.startDate, con.endDate, function(err, cost, response) {
        if(!err) {
          var conCost = con.cost + cost;
          con.totalCost = conCost;
          con.flights = response;
        }

        resCount++;

        if(resCount == conferences.length) {
          resCount = 0;
          cons.forEach(function(con) {
            if(totalCost + con.totalCost <= budget) {
              totalCost += con.totalCost;
              chosenCons.push(con);
            }

            resCount++;

            if(resCount == conferences.length) {
              //res.send(chosenCons);
              res.render('test', {cons: chosenCons, budget: budget});
            }
          });
        }
      });
    });
  }
});

app.get('/test/cons', function(req, res) {
  var cons = conferences;
  var resCount = 0;
  var totalCost = 0;
  var chosenCons = [];

  cons.sort(function(a, b) {
    if(a.importance < b.importance) {
      return 1;
    } else {
      return -1;
    }
  });

  cons.forEach(function(con) {
    var market = 'GB', currency = 'GBP', locale = 'en-GB', originPlace = 'BHX', destinationPlace = con.city, outboundPartialDate = con.startDate, inboundPartialDate = con.endDate;
    getFlightsPrice(originPlace, con.city, con.startDate, con.endDate, function(err, cost, response) {
      if(!err) {
        var conCost = con.cost + cost;
        con.totalCost = conCost;
        con.flights = response;
      }

      resCount++;

      if(resCount == conferences.length) {
        resCount = 0;
        cons.forEach(function(con) {
          if(totalCost + con.totalCost <= budget) {
            totalCost += con.totalCost;
            chosenCons.push(con);
          }

          resCount++;

          if(resCount == conferences.length) {
            //res.send(chosenCons);
            res.render('test', {cons: chosenCons, budget: budget})
          }
        });
      }
    });
  });
});

app.get('/test/lowest', function(req, res) {
  var market = 'GB', currency = 'GBP', locale = 'en-GB', originPlace = 'BHX', destinationPlace = 'BCN', outboundPartialDate = '2016-02-22', inboundPartialDate = '2016-02-24';
  request.get('http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/' + market + '/' + currency + '/' + locale + '/' + originPlace + '/' + destinationPlace + '/' + outboundPartialDate + '/' + inboundPartialDate + '?apiKey=' + apiKey, function(err, response, body) {
    var jsonres = JSON.parse(body);
    res.send('Price: ' + jsonres.Currencies[0].Symbol + jsonres.Quotes[0].MinPrice + '\n' + body);
  })
});

app.use(express.static(__dirname + '/static'));

app.listen(8000);

var getFlightsPrice = function(originPlace, destinationPlace, outDate, inDate, cb) {
  if(originPlace == destinationPlace) {
    cb(null, 0, null);
  } else {
    var market = 'GB', currency = 'GBP', locale = 'en-GB', originPlace = originPlace, destinationPlace = destinationPlace, outboundPartialDate = outDate, inboundPartialDate = inDate;
    request.get('http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/' + market + '/' + currency + '/' + locale + '/' + originPlace + '/' + destinationPlace + '/' + outboundPartialDate + '/' + inboundPartialDate + '?apiKey=' + apiKey, function(err, response, body) {
      var jsonres = JSON.parse(body);
      if(jsonres.Quotes.length) {
        cb(err, jsonres.Quotes[0].MinPrice, jsonres);
      } else {
        request.post({url: 'http://partners.api.skyscanner.net/apiservices/pricing/v1.0', form: {
          apiKey: apiKey,
          country: 'GB',
          currency: 'GBP',
          locale: 'en-GB',
          originplace: originPlace,
          destinationplace: destinationPlace,
          outbounddate: outDate,
          inbounddate: inDate,
          adults: 1,
          locationschema: 'Iata'
        }}, function(err, response, body) {
          if(response.headers.location) {
            request.get(response.headers.location + '?apiKey=' + apiKey, function(err, response, body) {
              var jsonres = JSON.parse(body);
              cb(err, jsonres.Itineraries[0].PricingOptions[0].Price, jsonres);
            });
          }
        });
        //cb(err, null, jsonres); //TODO: do a live search
      }
    });
  }
};
