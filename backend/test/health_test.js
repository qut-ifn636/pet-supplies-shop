const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const { expect } = chai;

chai.use(chaiHttp);

describe('GET /api/health', () => {
  after(() => chai.request(app).close());

  it('returns 200 with status ok', async () => {
    const res = await chai.request(app).get('/api/health');
    expect(res).to.have.status(200);
    expect(res.body).to.have.property('status', 'ok');
  });

  it('returns an instance identifier string', async () => {
    const res = await chai.request(app).get('/api/health');
    expect(res.body).to.have.property('instance');
    expect(res.body.instance).to.be.a('string').and.not.empty;
  });
});
