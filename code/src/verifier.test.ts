import { SingleCodeGenerator } from './code-generator';
import { MemoryConfirmationSender } from './confirmation-sender';
import { MemoryProfileStorage } from './profile-storage';
import { MemoryClaimsStorage } from './claims-storage';
import { expect } from 'chai'
import { MemoryVerificationStorage } from './verification-storage'
import { Verifier } from './verifier'

describe('Verifier', () => {
  it('should be able to start the verification process', async () => {
    const verifier = new Verifier({
      attrType: 'email',
      verification: new MemoryVerificationStorage(),
      claims: new MemoryClaimsStorage(),
      confirmationSender: new MemoryConfirmationSender(),
      codeGenerator: new SingleCodeGenerator('1234'),
    })
    await verifier.startVerification({
      txHash: 'testUser',
      attrValue: 'test@test.com'
    })
    expect((<MemoryConfirmationSender>verifier.confirmationSender).confirmationsSent)
      .to.deep.equal([{receiver: 'test@test.com', code: '1234', userdata: null}])
    expect(await verifier.verification.validateCode({
      txHash: 'testUser', attrType: 'email', value: 'test@test.com',
      code: '1234'
    })).to.equal(true)
  })

  it('should be able to verify an e-mail with a correct code', async () => {
    const verifier = new Verifier({
      attrType: 'email',
      verification: new MemoryVerificationStorage(),
      claims: new MemoryClaimsStorage(),
      confirmationSender: new MemoryConfirmationSender(),
      codeGenerator: new SingleCodeGenerator('1234'),
    })
    await verifier.startVerification({
      txHash: 'testUser',
      attrValue: 'test@test.com'
    })
    const result = await verifier.verify({
      txHash: 'testUser',
      attrValue: 'test@test.com',
      salt: 'testsalt',
      code: '1234'
    })
    expect(result).to.be.true
    expect((<MemoryClaimsStorage>verifier.claims).claims).to.deep.equal([{
      attrType: 'email',
      txHash: 'testUser',
      value: 'test@test.com'
    }])
    expect(await verifier.verification.validateCode({
      txHash: 'testUser', attrType: 'email', value: 'test@test.com',
      code: '1234'
    })).to.equal(false)
  })

  it('should return false when trying to verifiy with an incorrect code', async () => {
    const verifier = new Verifier({
      attrType: 'email',
      verification: new MemoryVerificationStorage(),
      claims: new MemoryClaimsStorage(),
      confirmationSender: new MemoryConfirmationSender(),
      codeGenerator: new SingleCodeGenerator('1234'),
    })
    await verifier.startVerification({
      txHash: 'testUser',
      attrValue: 'test@test.com'
    })
    const result = await verifier.verify({
      txHash: 'testUser',
      attrValue: 'test@test.com',
      salt: 'testsalt',
      code: '123'
    })
    expect(result).to.equal(false)
  })
})
