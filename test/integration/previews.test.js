/* eslint-disable global-require, no-console */
const supertest = require('supertest');

describe('Previews controller', () => {
  let server;

  beforeEach((done) => {
    process.env.DATA_DIR = './acedata/';
    const app = require('../../server');
    server = app.listen(0, done);
  });

  afterEach(() => {
    server.close();
    server = null;
    delete process.env.DATA_DIR;
  });

  afterEach(function logFailures() {
    if (this.currentTest.state === 'failed') {
      const logger = require('../../app/util/logger');
      console.log(logger.transports.memory.errorOutput);
      logger.transports.memory.clearLogs();
    }
  });

  it('Returns a list from the root', (done) => {
    supertest(server)
      .get('/previews/')
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        res.status.should.equal(200);
        res.body.should.have.length(4);
        res.body.should.eql(['332', '331', '330', '100']);
        done();
      });
  });

  it('Returns the latest', (done) => {
    supertest(server)
      .get('/previews/latest')
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        res.status.should.equal(200);
        res.headers['content-type'].should.match(/application\/json/);
        res.body.file.should.eql('ecmail332');
        res.body.contents.should.have.length(2680);
        done();
      });
  });

  it('Defaults to JSON format if no accept header set', (done) => {
    supertest(server)
      .get('/previews/latest')
      .expect(200)
      .end((err, res) => {
        res.status.should.equal(200);
        res.headers['content-type'].should.match(/application\/json/);
        res.body.file.should.eql('ecmail332');
        res.body.contents.should.have.length(2680);
        done();
      });
  });

  it('Allows CSV format request via suffix', (done) => {
    supertest(server)
      .get('/previews/latest.csv')
      .expect(200)
      .end((err, res) => {
        res.status.should.equal(200);
        res.headers['content-type'].should.match(/text\/csv/);
        res.headers['content-disposition'].should.equal('attachment; filename=ecmail332.csv');
        done();
      });
  });

  it('Allows JSON format request via suffix', (done) => {
    supertest(server)
      .get('/previews/latest')
      .expect(200)
      .end((err, res) => {
        res.status.should.equal(200);
        res.headers['content-type'].should.match(/application\/json/);
        res.body.file.should.eql('ecmail332');
        res.body.contents.should.have.length(2680);
        done();
      });
  });


  it('Allows retrieving by issue number', (done) => {
    supertest(server)
      .get('/previews/330')
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        res.status.should.equal(200);
        res.headers['content-type'].should.match(/application\/json/);
        res.body.file.should.eql('ecmail330');
        res.body.contents.should.have.length(2413);
        done();
      });
  });

  it('Allows retrieving by issue number as CSV', (done) => {
    supertest(server)
      .get('/previews/330.csv')
      .expect(200)
      .end((err, res) => {
        res.headers['content-type'].should.match(/text\/csv/);
        done();
      });
  });

  it('Does not allow POST requests to root', (done) => {
    // Should be a 405
    supertest(server)
      .post('/previews')
      .set('Accept', 'application/json')
      .expect(404)
      .end((err, res) => {
        res.status.should.equal(404);
        done();
      });
  });

  it('Does not allow POST requests to issue handler', (done) => {
    // Should be a 405
    supertest(server)
      .post('/previews/332')
      .set('Accept', 'application/json')
      .expect(404, done);
  });

  it('Returns a 500 for an unreadable file', (done) => {
    supertest(server)
      .get('/previews/100')
      .expect(500)
      .end((err, res) => {
        res.status.should.equal(500);
        done();
      });
  });
});
