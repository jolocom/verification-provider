require('source-map-support').install()
import * as http from 'http'
import * as redis from 'redis'
import * as bluebird from 'bluebird'
import { MemoryProfileStorage } from './profile-storage'
import { RandomCodeGenerator } from './code-generator'
import { MemoryConfirmationSender } from './confirmation-sender'
import { RedisVerificationStorage } from './verification-storage'
import { MemoryClaimsStorage } from './claims-storage'
import { EmailVerifier } from './email-verifier'
import { createApp } from './app'

const DEVELOPMENT_MODE = process.env.NODE_ENV === 'dev';


export function main() : Promise<any> {
  const redisClient = redis.createClient()
  bluebird.promisifyAll(redisClient)
  const app = createApp({emailVerifier: new EmailVerifier({
    claims: new MemoryClaimsStorage(),
    verification: new RedisVerificationStorage(redisClient, {
      codeLongevityMs: 1000 * 60 * 60 * 2
    }),
    confirmationSender: new MemoryConfirmationSender(),
    codeGenerator: new RandomCodeGenerator({
        codeLength: 16
    }),
    profile: new MemoryProfileStorage({testUser: 'testContract'})
  })})
  
  const server = http.createServer(app)
  return new Promise((resolve, reject) => {
    server.listen(4567, (err) => {
      if (err) { return reject(err) }
      resolve(server)
    })
  })
}


if(require.main === module){
  main();
}
