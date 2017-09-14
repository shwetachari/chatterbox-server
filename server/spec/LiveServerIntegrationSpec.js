var request = require('request');
var expect = require('chai').expect;

describe('server', function() {
  it('should respond to GET requests for /classes/messages with a 200 status code', function(done) {
    request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it('should send back parsable stringified JSON', function(done) {
    request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
      expect(JSON.parse.bind(this, body)).to.not.throw();
      done();
    });
  });

  it('should send back an object', function(done) {
    request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
      var parsedBody = JSON.parse(body);
      expect(parsedBody).to.be.an('object');
      done();
    });
  });

  it('should send an object containing a `results` array', function(done) {
    request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
      var parsedBody = JSON.parse(body);
      expect(parsedBody).to.be.an('object');
      expect(parsedBody.results).to.be.an('array');
      done();
    });
  });

  it('should accept POST requests to /classes/messages', function(done) {
    var requestParams = {method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Jono',
        message: 'Do my bidding!'}
    };

    request(requestParams, function(error, response, body) {
      expect(response.statusCode).to.equal(201);
      done();
    });
  });

  it('should respond with messages that were previously posted', function(done) {
    var requestParams = {method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Jono',
        message: 'Do my bidding!'}
    };

    request(requestParams, function(error, response, body) {
      // Now if we request the log, that message we posted should be there:
      request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
        var messages = JSON.parse(body).results;
        expect(messages[0].username).to.equal('Jono');
        expect(messages[0].message).to.equal('Do my bidding!');
        done();
      });
    });
  });

  it('Should 404 when asked for a nonexistent endpoint', function(done) {
    request('http://127.0.0.1:3000/arglebargle', function(error, response, body) {
      expect(response.statusCode).to.equal(404);
      done();
    });
  });
  
  it('Should reverse order of createdAt in GET request when option requests it', function(done) {
    var requestParams1 = {method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'FirstPoster',
        message: 'First!'}
    };
    var requestParams2 = {method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'SecondPoster',
        message: 'First! edit:nm'}
    };
    
    request(requestParams1, function(error, response, body) {
      request(requestParams2, function(error, response, body) {
        request('http://127.0.0.1:3000/classes/messages?order=createdAt', function(error, response, body) {
          var messages = JSON.parse(body).results;
          expect(messages[0].username).to.equal('SecondPoster');
          expect(messages[0].message).to.equal('First! edit:nm');
          expect(messages[1].username).to.equal('FirstPoster');
          expect(messages[1].message).to.equal('First!');
          done();
        });
      });
    });
  });
  
  it('Should get server headers when request type is OPTIONS', function(done) {
    var requestParams = {
      method: 'OPTIONS',
      uri: 'http://127.0.0.1:3000/classes/messages'
    };
    
    request(requestParams, function(error, response, body) {
      var returnedOptions = JSON.parse(body);
      expect(returnedOptions['access-control-allow-headers']).to.not.equal(undefined);
      expect(returnedOptions['access-control-allow-methods']).to.not.equal(undefined);
      expect(returnedOptions['access-control-allow-origin']).to.not.equal(undefined);
      expect(returnedOptions['access-control-max-age']).to.not.equal(undefined);

      done();
    });
  });
  
  it('Should have unique object ids for all message objects', function(done) {
    request('http://127.0.0.1:3000/classes/messages?order=createdAt', function(error, response, body) {
      var messages = JSON.parse(body).results;
      expect(messages[0].objectId).to.not.equal(messages[1].objectId);
      done();
    });
  });


});
