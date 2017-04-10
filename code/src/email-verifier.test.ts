import { SingleCodeGenerator } from './code-generator';
import { MemoryConfirmationSender } from './confirmation-sender';
import { MemoryProfileStorage } from './profile-storage';
import { MemoryClaimsStorage } from './claims-storage';
import { expect } from 'chai'
import { MemoryVerificationStorage } from './verification-storage'
import { EmailVerifier } from './email-verifier'

describe('EmailVerifier', () => {
  it('should be able to start the e-mail verification process', async () => {
    const verifier = new EmailVerifier({
      verification: new MemoryVerificationStorage(),
      claims: new MemoryClaimsStorage(),
      profile: new MemoryProfileStorage({testUser: 'testContract'}),
      confirmationSender: new MemoryConfirmationSender(),
      codeGenerator: new SingleCodeGenerator('1234'),
    })
    await verifier.startVerification({
      userID: 'testUser',
      email: 'test@test.com'
    })
    expect((<MemoryConfirmationSender>verifier.confirmationSender).confirmationsSent)
      .to.deep.equal([{email: 'test@test.com', code: '1234', userdata: null}])
    expect(await verifier.verification.validateCode({
      userID: 'testUser', attrType: 'email', value: 'test@test.com',
      code: '1234'
    })).to.equal(true)
  })

  it('should be able to verify an e-mail with a correct code', async () => {
    const verifier = new EmailVerifier({
      verification: new MemoryVerificationStorage(),
      claims: new MemoryClaimsStorage(),
      profile: new MemoryProfileStorage({testUser: 'testContract'}),
      confirmationSender: new MemoryConfirmationSender(),
      codeGenerator: new SingleCodeGenerator('1234'),
    })
    await verifier.startVerification({
      userID: 'testUser',
      email: 'test@test.com'
    })
    await verifier.verify({
      userID: 'testUser',
      email: 'test@test.com',
      code: '1234'
    })
    expect((<MemoryClaimsStorage>verifier.claims).claims).to.deep.equal([{
      attrType: 'email',
      contractID: 'testContract',
      value: 'test@test.com'
    }])
    expect((<MemoryProfileStorage>verifier.profile).claimIDs['testUser']).to.deep.equal({
      email: ['1']
    })
    expect(await verifier.verification.validateCode({
      userID: 'testUser', attrType: 'email', value: 'test@test.com',
      code: '1234'
    })).to.equal(false)
  })
})
