import { expect } from 'chai'
import { VerificationStorage, MemoryVerificationStorage } from './verification-storage'

function testVerificationStorage(storageCreator : () => Promise<VerificationStorage>) {
  it('should correctly store and validate correct verification codes', async () => {
    const storage = await storageCreator()
    await storage.storeCode({
      userID: 'testuser',
      attrType: 'email',
      value: 'test@test.com',
      code: '1234'
    })
    expect(await storage.validateCode({
      userID: 'testuser',
      attrType: 'email',
      value: 'test@test.com',
      code: '1234'
    })).to.equal(true)
  })

  it('should correctly store and validate incorrect verification codes', async () => {
    const storage = await storageCreator()
    await storage.storeCode({
      userID: 'testuser',
      attrType: 'email',
      value: 'test@test.com',
      code: '1234'
    })
    expect(await storage.validateCode({
      userID: 'testuser',
      attrType: 'email',
      value: 'test@test.com',
      code: '14'
    })).to.equal(false)
  })

  it('should correctly delete verification codes', async () => {
    const storage = await storageCreator()
    await storage.storeCode({
      userID: 'testuser',
      attrType: 'email',
      value: 'test@test.com',
      code: '1234'
    })
    await storage.deleteCode({
      userID: 'testuser',
      attrType: 'email',
      value: 'test@test.com',
      code: '1234'
    })
    expect(await storage.validateCode({
      userID: 'testuser',
      attrType: 'email',
      value: 'test@test.com',
      code: '1234'
    })).to.equal(false)
  })
}

describe('MemoryVerificationStorage', () => {
  testVerificationStorage(async () => new MemoryVerificationStorage())
})
