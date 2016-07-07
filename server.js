var http = require('http');
var fs = require('fs');
var querystring = require('querystring');
var CONFIG = require('./config');
var PUBLIC = './public';

var server = http.createServer((request, response) => {
  console.log('Somebody connected.');

  // when something comes from the request
  request.on('data', (data) => {
    // gets the request and organizes it into an object
    var requestElementObj = querystring.parse(data.toString());
    // gets the keys from the object
    var requestKeys = Object.keys(requestElementObj);
    // creates an array to put all of the form values in
    var postValues = [];
    // go through the request keys and push each key into the array
    requestKeys.forEach(function (element) {
      postValues.push(requestElementObj[element]);
    });
  });

  var filepath = PUBLIC + request.url; // file path

  fs.readFile(filepath, 'utf8', (error, data) => {
    if(error){ // if there is an error (file doesn't exist)
      response.statusCode = 404;
      response.statusMessage = 'Not Found';
      filepath = PUBLIC + '/404.html';
      fs.readFile(filepath, 'utf8', (error, data) => {
        if(request.method === 'GET') {
          response.setHeader('Content-Length', data.length);
          response.write(data);
        }else if(request.method === 'HEAD') {
          response.setHeader('Content-Length', data.length);
        }else if(request.method === 'POST') {

        }
        response.end();
      });
    }else{ // if the file exists
      response.statusCode = 200;
      response.statusMessage = 'OK';
      if(request.method === 'GET') {
        response.setHeader('Content-Length', data.length);
        response.write(data);
      } else if(request.method === 'HEAD') {
        response.setHeader('Content-Length', data.length);
      }
      response.end();
    }
  });
});


server.listen(CONFIG.PORT, () => {
  var PORT = server.address().port;
  console.log('Listening on port', PORT);
});