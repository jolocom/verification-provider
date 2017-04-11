require('source-map-support').install()
import * as redis from 'redis'
import * as bluebird from 'bluebird'
import { MemoryProfileStorage } from './profile-storage'
import { SingleCodeGenerator } from './code-generator'
import { MemoryConfirmationSender } from './confirmation-sender'
import { RedisVerificationStorage } from './verification-storage'
import { MemoryClaimsStorage } from './claims-storage'
import { EmailVerifier } from './email-verifier'
import { createServer } from './server'

const DEVELOPMENT_MODE = process.env.NODE_ENV === 'dev';


function main(){
  const redisClient = redis.createClient()
  bluebird.promisifyAll(redisClient)
  createServer({emailVerifier: new EmailVerifier({
    claims: new MemoryClaimsStorage(),
    verification: new RedisVerificationStorage(redisClient, {
      codeLongevityMs: 1000 * 60 * 60 * 2
    }),
    confirmationSender: new MemoryConfirmationSender(),
    codeGenerator: new SingleCodeGenerator('1234'),
    profile: new MemoryProfileStorage({testUser: 'testContract'})
  })}).listen(4567)
}


if(require.main === module){
  main();
}
