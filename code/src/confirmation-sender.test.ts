import { expect } from 'chai'
import { stub } from './test-utils'
import * as mockTransport from 'nodemailer-mock-transport'
import { EmailConfirmationSender, SmsConfirmationSender } from './confirmation-sender'

describe('EmailConfirmationSender', () => {
  it('should be able to send a confirmation mail', async () => {
    const transport = mockTransport({})
    const sender = new EmailConfirmationSender({
      transport: transport,
      fromEmail: 'from@test.com',
      subjectGenerator: ({receiver, code, userdata}) =>
        ['subject', receiver, code, userdata].join(' '),
      htmlGenerator: ({receiver, code, userdata}) =>
        ['html', receiver, code, userdata].join(' '),
      textGenerator: ({receiver, code, userdata}) =>
        ['text', receiver, code, userdata].join(' '),
      linkGenerator: () => ''
    })
    await sender.sendConfirmation({
      receiver: 'test@test.com',
      id: 'id1',
      code: '1234',
      userdata: 'usrdata'
    })

    expect(transport.sentMail.length).to.equal(1)
    const mail = transport.sentMail[0]
    expect(mail.data.from).to.equal('from@test.com')
    expect(mail.data.to).to.equal('test@test.com')
    expect(mail.data.subject).to.equal(
      'subject test@test.com 1234 usrdata'
    )
    expect(mail.data.text).to.equal(
      'text test@test.com 1234 usrdata'
    )
    expect(mail.data.html).to.equal(
      'html test@test.com 1234 usrdata'
    )
  })
})

describe('SmsConfirmationSender', () => {
  it('should work', async () => {
    const textGenerator = stub()
    const sms = new SmsConfirmationSender({
      key: 'iNjYHCR0NK0YPp5xnBQPs1nb2',
      textGenerator: () => 'test',
      storeResponse: true
    })

    await sms.sendConfirmation({
      receiver: '+49 176 273 437 48',
      code: 'test',
      userdata: {}
    })

    expect(sms.lastResponse.body).to.equal('test')
    expect(sms.lastResponse.recipients.totalSentCount).to.equal(1)
  })
})