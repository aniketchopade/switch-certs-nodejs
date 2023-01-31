var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    express = require('express');
var certinfo = require('cert-info');

var port = 443;

var options = {
    key: fs.readFileSync('./cert/privatekey.pem'),
    cert: fs.readFileSync('./cert/certificate.pem'),
    ca: fs.readFileSync('./cert/ca.pem')
};

var app = express();
var certstr = {}
var certswitch = 0;

var server = https.createServer(options, app).listen(port, function(){
  console.log("Express server listening on port " + port);
});

setInterval(function () {
    //console.log("change the certs")
    if (certswitch === 0) {
        certswitch = 1
        server.setSecureContext({
        ca: fs.readFileSync('./cert/ca.pem'),
        cert: fs.readFileSync('./cert/second/certificate.pem', 'utf8'),
        key: fs.readFileSync('./cert/second/privatekey.pem', 'utf8')})

    } else {
        certswitch = 0
        server.setSecureContext({
        ca: fs.readFileSync('./cert/ca.pem'),
        cert: fs.readFileSync('./cert/certificate.pem', 'utf8'),
        key: fs.readFileSync('./cert/privatekey.pem', 'utf8')})
    }
  },3000)

server.on('secureConnection', (tlsSocket) => {
    if (tlsSocket.authorized) {
        console.log('secureConnectListener, session:', tlsSocket.isSessionReused(), tlsSocket.getProtocol());
    } else {
        //console.log(JSON.stringify(tlsSocket.getCertificate()));
        certstr = tlsSocket.getCertificate()
    }
});

app.get('/', function (req, res) {
    //res.writeHead(200);
    /*var cert = fs.readFile('./cert/certificate.pem', 'ascii', (err, certstr)=>{
        res.end(JSON.stringify(certinfo.info(certstr)))
    })*/
    validfrom = certstr.valid_from
    validto = certstr.valid_to
    fingerprint = certstr.fingerprint
    serialNumber = certstr.serialNumber
    res.json({ serialNumber, fingerprint })
});