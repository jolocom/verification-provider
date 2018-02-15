require('source-map-support').install()
import * as redis from 'redis'
import * as bluebird from 'bluebird'
import { RandomCodeGenerator } from './code-generator'
import { 
  EmailConfirmationSender,
  SmsConfirmationSender,
  mustacheTemplateGenerator,
  loadTemplate,
  jolocomEmailLinkGenerator
} from './confirmation-sender'
import { RedisVerificationStorage } from './verification-storage'
import { Verifier } from './verifier'
import { createApp } from './app'

const redisClient = redis.createClient()
bluebird.promisifyAll(redisClient)
const config = require('../config.json')

const configureVerifiers = () => {
  const codeLongevityMs = 1000 * 60 * 60 * 2

  const phoneVerifier = new Verifier({
    attrType: 'phone',
    verification: new RedisVerificationStorage(redisClient, {codeLongevityMs}),
    confirmationSender: new SmsConfirmationSender({
      key: config.messageBirdKey,
      textGenerator: mustacheTemplateGenerator(
        'Your SmartWallet verification code: {{code}}'
      )
    }),
    accountEntropy: config.accountEntropy,
    codeGenerator: new RandomCodeGenerator({
      codeLength: 6,
      digitOnly: true
    })
  })

  const emailVerifier = new Verifier({
    attrType: 'email',
    verification: new RedisVerificationStorage(redisClient, {codeLongevityMs}),
    accountEntropy: config.accountEntropy,
    confirmationSender: new EmailConfirmationSender({
      transport: {
        sendmail: true,
        newline: 'unix',
        path: '/usr/sbin/sendmail'
      },
      fromEmail: 'no-reply@mail.jolocom.com',
      subjectGenerator: mustacheTemplateGenerator('Verify your e-mail in your SmartWallet'),
      linkGenerator: jolocomEmailLinkGenerator,
      htmlGenerator: loadTemplate('verification-email.html', mustacheTemplateGenerator),
      textGenerator: loadTemplate('verification-email.txt', mustacheTemplateGenerator)
    }),
    codeGenerator: new RandomCodeGenerator({
      codeLength: 16,
      digitOnly: true
    })
  })

  return {emailVerifier, phoneVerifier}
}

createApp(configureVerifiers()).listen(4567, () => {
  console.log('Started')
})