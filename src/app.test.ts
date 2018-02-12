import * as chai from 'chai'
import { expect } from 'chai'
const chaiHttp = require('chai-http')
chai.use(chaiHttp)
import { stub } from './test-utils'
import { createApp } from './app'

describe('Express server', () => {
  it('should dispatch start e-mail verification correctly', async function() {
    const emailVerifier : any = {
      attrType: 'email',
      startVerification: stub()
    }

    await chai['request'](createApp({emailVerifier, phoneVerifier: <any>{}}))
      .post('/email/start-verification')
      .send({
        identity: 'https://identity.jolocom.com/verifiyee',
        id: 'primary',
        email: 'my@email.com'
      })
    
    expect(emailVerifier.startVerification.calls).to.deep.equal([{args: [{
      identity: 'https://identity.jolocom.com/verifiyee',
      attrId: 'primary',
      attrValue: 'my@email.com',
    }]}])
  })

  it('should dispatch e-mail verify correctly', async function() {
    const emailVerifier : any = {
      attrType: 'email',
      verify: stub()
    }

    await chai['request'](createApp({emailVerifier, phoneVerifier: <any>{}}))
      .post('/email/verify')
      .send({
        identity: 'https://identity.jolocom.com/verifiyee',
        id: 'primary',
        email: 'my@email.com',
        code: '1234'
      })
    
    expect(emailVerifier.verify.calls).to.deep.equal([{args: [{
      identity: 'https://identity.jolocom.com/verifiyee',
      attrId: 'primary',
      attrValue: 'my@email.com',
      code: '1234',
    }]}])
  })
})
