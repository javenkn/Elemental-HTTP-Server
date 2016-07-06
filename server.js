var http = require('http');
var fs = require('fs');
var CONFIG = require('./config');
var PUBLIC = './public';

var server = http.createServer((request, response) => {
  console.log('Somebody connected.');
  var filepath = PUBLIC + request.url; // file path

  fs.readFile(filepath, 'utf8', (error, data) => {
    if(error){ // if there is an error (file doesn't exist)
      response.statusCode = 404;
      response.statusMessage = 'Not Found';
      filepath = PUBLIC + '/404.html';
      fs.readFile(filepath, 'utf8', (error, data) => {
        response._contentLength = data.length + 15;
        response.write(data);
        response.end('\nDone sending.\n');
      });
    }else{ // if the file exists
      response.statusCode = 200;
      response.statusMessage = 'OK';
      response._contentLength = data.length + 15;
      response.write(data);
      response.end('\nDone sending.\n');
    }
  });
});


server.listen(CONFIG.PORT, () => {
  var PORT = server.address().port;
  console.log('Listening on port', PORT);
});