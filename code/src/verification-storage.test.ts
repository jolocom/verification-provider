import { expect } from 'chai'
// const redis = require('redis')
import * as redis from 'redis'
import * as bluebird from 'bluebird'
import {
  VerificationStorage, MemoryVerificationStorage, RedisVerificationStorage
} from './verification-storage'

function testVerificationStorage(storageCreator : () => Promise<VerificationStorage>) {
  it('should correctly store and validate correct verification codes', async () => {
    const storage = await storageCreator()
    await storage.storeCode({
      contractID: 'testuser',
      attrType: 'email',
      value: 'test@test.com',
      code: '1234'
    })
    expect(await storage.validateCode({
      contractID: 'testuser',
      attrType: 'email',
      value: 'test@test.com',
      code: '1234'
    })).to.equal(true)
  })

  it('should correctly store and validate incorrect verification codes', async () => {
    const storage = await storageCreator()
    await storage.storeCode({
      contractID: 'testuser',
      attrType: 'email',
      value: 'test@test.com',
      code: '1234'
    })
    expect(await storage.validateCode({
      contractID: 'testuser',
      attrType: 'email',
      value: 'test@test.com',
      code: '14'
    })).to.equal(false)
  })

  it('should correctly delete verification codes', async () => {
    const storage = await storageCreator()
    await storage.storeCode({
      contractID: 'testuser',
      attrType: 'email',
      value: 'test@test.com',
      code: '1234'
    })
    await storage.deleteCode({
      contractID: 'testuser',
      attrType: 'email',
      value: 'test@test.com',
      code: '1234'
    })
    expect(await storage.validateCode({
      contractID: 'testuser',
      attrType: 'email',
      value: 'test@test.com',
      code: '1234'
    })).to.equal(false)
  })
}

describe('MemoryVerificationStorage', () => {
  testVerificationStorage(async () => new MemoryVerificationStorage())
})

describe('RedisVerificationStorage', () => {
  const redisClient = redis.createClient()
  bluebird.promisifyAll(redisClient)

  // beforeEach(async () => {
  //   await redisClient.delAsync('jolocom-verification-codes')
  //   await redisClient.delAsync('jolocom-verification-codes-expire')
  // })

  testVerificationStorage(async () => new RedisVerificationStorage(redisClient, {codeLongevityMs: 2000}))
})
