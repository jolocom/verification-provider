require('source-map-support').install()
import * as http from 'http'
import * as redis from 'redis'
import * as bluebird from 'bluebird'
import { MemoryProfileStorage } from './profile-storage'
import { RandomCodeGenerator } from './code-generator'
import { 
  MemoryConfirmationSender, EmailConfirmationSender, SmsConfirmationSender,
  mustacheTemplateGenerator, loadTemplate, jolocomEmailLinkGenerator
} from './confirmation-sender'
import { RedisVerificationStorage } from './verification-storage'
import { MemoryClaimsStorage, EthereumClaimStorage } from './claims-storage'
import { Verifier } from './verifier'
import { createApp } from './app'

const DEVELOPMENT_MODE = process.env.NODE_ENV === 'dev';


export async function main() : Promise<any> { 
  const redisClient = redis.createClient()
  bluebird.promisifyAll(redisClient)

  // const ethereumConfig = require('../ethereum.json')
  // const ethClaimStorage = await (new EthereumClaimStorage(ethereumConfig)).initialize()
  
  try {
    const app = createApp({
      emailVerifier: new Verifier({
        attrType: 'email',
        // claims: ethClaimStorage,
        claims: new MemoryClaimsStorage(),
        verification: new RedisVerificationStorage(redisClient, {
          codeLongevityMs: 1000 * 60 * 60 * 2
        }),
        confirmationSender: new EmailConfirmationSender({
          transport: {
            sendmail: true,
            newline: 'unix',
            path: '/usr/sbin/sendmail'
          },
          fromEmail: 'no-reply@jolocom.com',
          subjectGenerator: mustacheTemplateGenerator('Verify your e-mail in your SmartWallet'),
          linkGenerator: jolocomEmailLinkGenerator,
          htmlGenerator: loadTemplate('verification-email.html', mustacheTemplateGenerator),
          textGenerator: loadTemplate('verification-email.txt', mustacheTemplateGenerator)
        }),
        codeGenerator: new RandomCodeGenerator({
            codeLength: 16
        }),
        profile: new MemoryProfileStorage({testUser: 'testContract'})
      }),
      phoneVerifier: new Verifier({
        attrType: 'phone',
        claims: new EthereumClaimStorage(ethereumConfig),
        verification: new RedisVerificationStorage(redisClient, {
          codeLongevityMs: 1000 * 60 * 60 * 2
        }),
        confirmationSender: new SmsConfirmationSender({
          textGenerator: mustacheTemplateGenerator(
            'Your SmartWallet verification code: {code}'
          )
        }),
        codeGenerator: new RandomCodeGenerator({
            codeLength: 6
        }),
        profile: new MemoryProfileStorage({testUser: 'testContract'})
      })
    })
  
    const server = http.createServer(app)
    return await new Promise((resolve, reject) => {
      server.listen(4567, (err) => {
        if (err) { return reject(err) }
        resolve(server)
      })
    })

  } catch (e) {
    console.error(e)
    console.trace()
  }
}


if(require.main === module){
  main();
}
