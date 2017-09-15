/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var url = require('url');
var fs = require('fs');

var file = 'test.json';

var data = {};
data.results = [];

fs.readFile(file, 'utf8', (err, dataFromFile) => {
  if (err) {
    throw err;
  }
  console.log('Loaded data');
  data = JSON.parse(dataFromFile);
});


var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var requestHandler = function(request, response) {
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  var statusCode = 200;
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'application/json';

  var pathname = url.parse(request.url, true).pathname;


  if (request.method === 'POST') {
    var saveToFile = (message) => {
      var writeToContainer = function(loadedData, message) {
        loadedData.results.push(message);
        fs.open(file, 'w+', (err, fd) => {
          if (err) {
            throw err;
          } else {
            fs.write(fd, JSON.stringify(loadedData));
          }
        });
        
      };

      fs.readFile(file, 'utf8', (err, loadedData) => {
        if (err) {
          throw err;
        }
        writeToContainer(JSON.parse(loadedData), message);
      });
    };
    
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
    });
    
    request.on('end', () => {
      body = JSON.parse(body);
      body.objectId = Date.now();
      body.createdAt = Date.now();
      data.results = data.results.concat(body);
      saveToFile(body);
    });
    statusCode = 201;
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(data));
  } else if (request.method === 'GET') {
    var loadFile = function (path, contentType) {
      fs.readFile(__dirname + '/../client' + path, function(err, readData) {
        if (err) {
          throw err;
        }
        response.writeHead(statusCode, {'Content-Type': contentType});
        response.end(readData.toString());
      });
    };
    if (pathname === '/') {
      loadFile('/client/index.html', 'text/html');
    } else if (pathname === '/styles/styles.css') {
      loadFile('/client' + pathname, 'text/css');
    } else if (pathname === '/bower_components/jquery/dist/jquery.js') {
      loadFile(pathname, 'application/javascript');
    } else if (pathname === '/scripts/app.js') {
      loadFile('/client' + pathname, 'application/javascript');
    } else if (pathname === '/images/spiffygif_46x46.gif') {
      fs.readFile(__dirname + '/../client/client/images/spiffygif_46x46.gif', function(err, readData) {
        if (err) {
          throw err;
        }
        response.writeHead(statusCode, {'Content-Type': 'image/gif'});
        response.end(readData);
      });
    } else if (pathname === '/classes/room' || pathname === '/classes/messages') {
      var query = url.parse(request.url, true).query;
      if (query.order) {
        var newData = {results: data.results.slice(0)};
        var key = query.order;
        if (query.order[0] === '-') {
          key = key.split('').slice(1).join('');
          newData.results.sort(function(a, b) {
            return a[key] - b[key];
          });
        } else {
          newData.results.sort(function(a, b) {
            return b[key] - a[key];
          });
        }
        response.writeHead(statusCode, headers);
        response.end(JSON.stringify(newData));
      }
    } else {
      statusCode = 404;
      response.writeHead(statusCode, headers);
      response.end(JSON.stringify(data));
    }
  } else if (request.method === 'PUT') {
    // find the message by id
      // if it doesn't exist, create new object and append it to data.results
    // requires id parameter, property(either message or username)
    // modify whatever property
  } else if (request.method === 'DELETE') {
    // find the message by id
    // requires id parameter
    // splice it from data.results
  } else if (request.method === 'OPTIONS') {
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(headers));
  } else {
    statusCode = 404;
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(data));
  }

};

exports.requestHandler = requestHandler;
exports.defaultCorsHeaders = defaultCorsHeaders;

