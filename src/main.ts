require('source-map-support').install()
import * as redis from 'redis'
import * as bluebird from 'bluebird'
import JolocomLib from 'jolocom-lib'

import { RandomCodeGenerator } from './code-generator'
import { 
  EmailConfirmationSender,
  SmsConfirmationSender,
  mustacheTemplateGenerator,
  loadTemplate,
} from './confirmation-sender'
import { RedisVerificationStorage } from './verification-storage'
import { Verifier } from './verifier'
import { createApp } from './app'

const redisClient = redis.createClient()
bluebird.promisifyAll(redisClient)

const config = require('../config.json')
const jolocomLib = new JolocomLib(config.libOptions)

const configureVerifiers = () => {
  const codeLongevityMs = 1000 * 60 * 60 * 2
  const verificationStorage = new RedisVerificationStorage(redisClient, codeLongevityMs)
  const codeGenerator = new RandomCodeGenerator({
    codeLength: 6,
    digitOnly: true
  })

  const phoneVerifier = new Verifier({
    jolocomLib,
    attrType: 'phone',
    verification: verificationStorage,
    confirmationSender: new SmsConfirmationSender({
      key: config.messageBirdKey,
      textGenerator: mustacheTemplateGenerator(
        'Your SmartWallet verification code: {{code}}'
      )
    }),
    accountEntropy: config.accountEntropy,
    codeGenerator
  })

  const emailVerifier = new Verifier({
    jolocomLib,
    attrType: 'email',
    verification: verificationStorage,
    accountEntropy: config.accountEntropy,
    confirmationSender: new EmailConfirmationSender({
      transport: config.emailSettings,
      fromEmail: 'no-reply@mail.jolocom.com',
      subjectGenerator: mustacheTemplateGenerator('Verify your e-mail in your SmartWallet'),
      htmlGenerator: loadTemplate('verification-email.html', mustacheTemplateGenerator),
      textGenerator: loadTemplate('verification-email.txt', mustacheTemplateGenerator)
    }),
    codeGenerator
  })

  return {emailVerifier, phoneVerifier}
}

createApp(configureVerifiers()).listen(4567, () => {
  console.log('Started')
})