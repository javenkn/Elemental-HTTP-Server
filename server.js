var http = require('http');
var fs = require('fs');
var querystring = require('querystring');
var CONFIG = require('./config');
var PUBLIC = './public';

var server = http.createServer((request, response) => {
  console.log('Somebody connected.');
  // when something comes from the request
  // creates an array to put all of the form values in
  var postValues = [];
  var dataBuff = '';
  request.on('data', (data) => {
    dataBuff += data;
  });

  request.on('end', () => {
    // gets the request and organizes it into an object
    var requestElementObj = querystring.parse(dataBuff.toString());
    // gets the keys from the object
    var requestKeys = Object.keys(requestElementObj);

    // go through the request keys and push each key into the array
    requestKeys.forEach(function (element) {
      postValues.push(requestElementObj[element]);
    });

    var HTMLContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Elements - ` + postValues[0] +
  `</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <h1>` + postValues[0] + `</h1>
  <h2>` + postValues[1] + `</h2>
  <h3>Atomic number ` + postValues[2] + `</h3>
  <p>` + postValues[3] + `</p>
  <p><a href="/">back</a></p>
</body>
</html>`;

    var filepath = PUBLIC + request.url; // file path
    // checks if there is no request url
    if(filepath === './public/'){
      filepath = PUBLIC + '/index.html';
    }

    // for /elements add a .html to it so that we can check if
    if(filepath.slice(-5) !== '.html'){
      filepath = filepath + '.html';
    }
    // console.log(HTMLContent);

    fs.readFile(filepath, 'utf8', (error, data) => {
      if(error){ // if there is an error (file doesn't exist)

        if(request.method === 'POST') {
          fs.writeFile(filepath, HTMLContent,'utf8', (error) => {
            console.log('Finished writing.');
          });
        }

        response.statusCode = 404;
        response.statusMessage = 'Not Found';
        filepath = PUBLIC + '/404.html';
        fs.readFile(filepath, 'utf8', (error, data) => {
          if(request.method === 'GET') {
            response.setHeader('Content-Length', data.length);
            response.write(data);
          }else if(request.method === 'HEAD') {
            response.setHeader('Content-Length', data.length);
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
        } else if(request.method === 'POST') {
          fs.writeFile(filepath, HTMLContent,'utf8', (error) => {
            console.log('Finished writing.');
          });
        }
        response.end();
      }
    }); // fs read
  }); // end event code

}); // server


server.listen(CONFIG.PORT, () => {
  var PORT = server.address().port;
  console.log('Listening on port', PORT);
});