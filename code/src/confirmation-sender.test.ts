import { expect } from 'chai'
import * as mockTransport from 'nodemailer-mock-transport'
import { EmailConfirmationSender } from './confirmation-sender';

describe('EmailConfirmationSender', () => {
  it('should be able to send a confirmation mail', async () => {
    const transport = mockTransport({})
    const sender = new EmailConfirmationSender({
      transport: transport,
      fromEmail: 'from@test.com',
      subjectGenerator: ({email, code, userdata}) =>
        ['subject', email, code, userdata].join(' '),
      htmlGenerator: ({email, code, userdata}) =>
        ['html', email, code, userdata].join(' '),
      textGenerator: ({email, code, userdata}) =>
        ['text', email, code, userdata].join(' ')
    })
    await sender.sendConfirmation({
      email: 'test@test.com',
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
