import * as chai from 'chai'
import { expect } from 'chai'
const chaiHttp = require('chai-http')
chai.use(chaiHttp)
import { stub } from './test-utils'
import { createApp } from './app'

describe('Express server', () => {
  it('should dispatch start verification correctly', async function() {
    const emailVerifier : any = {
      startVerification: stub()
    }

    await chai['request'](createApp({emailVerifier}))
      .post('/email/start-verification')
      .send({
        webID: 'my-web-id',
        email: 'my@email.com'
      })
    
    expect(emailVerifier.startVerification.calls).to.deep.equal([{args: [{
      userID: 'my-web-id',
      email: 'my@email.com',
    }]}])
  })

  it('should dispatch verify correctly', async function() {
    const emailVerifier : any = {
      verify: stub()
    }

    await chai['request'](createApp({emailVerifier}))
      .post('/email/verify')
      .send({
        webID: 'my-web-id',
        email: 'my@email.com',
        code: '1234'
      })
    
    expect(emailVerifier.verify.calls).to.deep.equal([{args: [{
      userID: 'my-web-id',
      email: 'my@email.com',
      code: '1234',
    }]}])
  })
})
