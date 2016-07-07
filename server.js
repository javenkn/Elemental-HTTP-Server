var http = require('http');
var fs = require('fs');
var querystring = require('querystring');
var CONFIG = require('./config');
var PUBLIC = './public';
var elementCount = 2;

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
    getNeededValues(dataBuff, postValues);

    var HTMLContent = createHTMLContent(postValues);

    var filepath = PUBLIC + request.url; // file path
    // checks if there is no request url
    if(filepath === './public/') {
      filepath = PUBLIC + '/index.html';
    }

    // for /elements add a .html to it so that we can check if
    if(filepath.slice(-5) !== '.html' && filepath.slice(-4) !== '.css') {
      filepath = filepath + '.html';
    }

    fs.readFile(filepath, 'utf8', (error, data) => {
      if(error){ // if there is an error (file doesn't exist)
        response.statusCode = 404;
        response.statusMessage = 'Not Found';
        if(request.method === 'POST') {
          elementCount++;
          sendPostResponse(response, filepath, HTMLContent);
          updateIndex(elementCount, filepath.slice(8), postValues);
        } else {
          filepath = PUBLIC + '/404.html';
          fs.readFile(filepath, 'utf8', (error, data) => {
            sendResponse(request, response, filepath, HTMLContent, data);
          });
        }
      }else{ // if the file exists
        response.statusCode = 200;
        response.statusMessage = 'OK';
        if(request.method === 'POST') {
          sendPostResponse(response, filepath, HTMLContent);
        } else {
          sendResponse(request, response, filepath, HTMLContent, data);
        }
      }
    }); // fs read
  }); // end event code

}); // server


server.listen(CONFIG.PORT, () => {
  var PORT = server.address().port;
  console.log('Listening on port', PORT);
});

function createHTMLContent(elementValueArray) {
  var content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Elements - ` + elementValueArray[0] +
  `</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <h1>` + elementValueArray[0] + `</h1>
  <h2>` + elementValueArray[1] + `</h2>
  <h3>Atomic number ` + elementValueArray[2] + `</h3>
  <p>` + elementValueArray[3] + `</p>
  <p><a href="/">back</a></p>
</body>
</html>`;

  return content;
}

function getNeededValues (data, array) {
  // gets the request and organizes it into an object
  var requestElementObj = querystring.parse(data.toString());
  // gets the keys from the object
  var requestKeys = Object.keys(requestElementObj);

  // go through the request keys and push each key into the array
  requestKeys.forEach(function (element) {
    array.push(requestElementObj[element]);
  });
}

function sendPostResponse (response, filepath, HTMLContent) {
  fs.writeFile(filepath, HTMLContent,'utf8', (error) => {
    if(error) throw error;

    console.log('Finished writing.');
    var contentBody = JSON.stringify({success : true});
    response.writeHead(200, {
      'Content-Length' : contentBody.length,
      'Content-Type' : 'application/json'
    });
    response.write(contentBody);
    response.end();
  });
}

function sendResponse (request, response, filepath, HTMLContent, data) {
  if (request.method === 'GET') {
    response.setHeader('Content-Length', data.length);
    response.write(data);
    response.end();
  } else if(request.method === 'HEAD') {
    response.setHeader('Content-Length', data.length);
    response.end();
  }
}

function updateIndex (count, filename, array) {
  var filepath = PUBLIC + '/index.html';
  var newResource = `    <li>
      <a href="` + filename + `">` + array[0] + `</a>
    </li>`;
  fs.readFile(filepath, 'utf8', (error, data) => {
    if(error) throw (error);
    var dataArr = data.split('\n');
    var countData = dataArr[10].split(''); // splits it into letters
    countData.splice(-6,1, count); // splices out the count number
    var newIndexLine = countData.join(''); // rejoins the line
    // splices out the original count and replaces it with the new count line
    dataArr.splice(10, 1, newIndexLine);
    // adds the new resource link for the specific element
    dataArr.splice(-4, 0, newResource);
    var updatedIndex = dataArr.join('\n'); // rejoins everything with a new line

    fs.writeFile(filepath, updatedIndex, 'utf8', (error) => {
      if(error) throw error;
      console.log('Finished writing.');
    });
  });
}