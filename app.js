//dependencies for each module used
var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var dotenv = require('dotenv');
var pg = require('pg');
var app = express();


//client id and client secret here, taken from .env
dotenv.load();

//connect to database
var conString = process.env.DATABASE_CONNECTION_URL;

//Configures the Template engine
app.engine('handlebars', handlebars({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat',
                  saveUninitialized: true,
                  resave: true}));

//set environment ports and start application
app.set('port', process.env.PORT || 3000);

//routes
app.get('/', function(req, res){
  res.render('index');
});

app.get('/delphidata', function (req, res) {
    // initialize connection pool 
        
    pg.connect(conString, function(err, client, done) {
        var handleError = function(err, res) {
          // no error occurred, continue with the request
          if(!err) return false;
          else console.log(err);

          // An error occurred, remove the client from the connection pool.
          // A truthy value passed to done will remove the connection from the pool
          // instead of simply returning it to be reused.
          // In this case, if we have successfully received a client (truthy)
          // then it will be removed from the pool.
          done(client);
          res.writeHead("500", {'content-type': 'text/plain'});
          res.end('An error occurred');
          return true;
        };    

        //var args = [];
        var query = "SELECT * FROM arjis_crimes";
        //console.log(query);
        // filter by zip code if available, otherwise return all data'
        if(req.query.zipcode) {
          query += " WHERE zip='" + req.query.zipcode + "'";
          //args.push(req.query.zipcode);
          console.log("############ " + query);
        }
        console.log(query);
        client.query(query, function(err, result) {
          if(handleError(err, res)) return;

          // return the client to the connection pool for other requests to reuse
          done();

          res.writeHead("200", {'content-type': 'application/json'});
          res.end(JSON.stringify(result.rows));
	      });
    });
});

///////////// YEAR ////////
/*
app.get('/year2013', function (req, res) {
    // initialize connection pool 
        
    pg.connect(conString, function(err, client, done) {
        var handleError = function(err, res) {
          // no error occurred, continue with the request
          if(!err) return false;
          else console.log(err);

          // An error occurred, remove the client from the connection pool.
          // A truthy value passed to done will remove the connection from the pool
          // instead of simply returning it to be reused.
          // In this case, if we have successfully received a client (truthy)
          // then it will be removed from the pool.
          done(client);
          res.writeHead("500", {'content-type': 'text/plain'});
          res.end('An error occurred');
          return true;
        };    

        //var args = [];
        var query = "SELECT charge_description, count(*) FROM arjis_crimes";
        //console.log(query);
        // filter by zip code if available, otherwise return all data'
        if(req.query.zipcode) {
          query += " WHERE zip='" + req.query.zipcode + "' " + "and date_part('year', 'activity_date')='2013' " + "group by 'charge_description' " + "order by count(*) desc";
          //args.push(req.query.zipcode);
          console.log("############ " + query);
        }
        //console.log(query);
        client.query(query, function(err, result) {
          if(handleError(err, res)) return;

          // return the client to the connection pool for other requests to reuse
          done();

          res.writeHead("200", {'content-type': 'application/json'});
          res.end(JSON.stringify(result.rows));
	      });
    });
});
*/


///////////////////////////  

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
