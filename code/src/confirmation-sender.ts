import * as nodemailer from 'nodemailer'
import * as messagebird from 'messagebird'

export interface ConfirmationSender {
  sendConfirmation(params : {receiver : string, code : string, userdata : any}) : Promise<any>
}


export class MemoryConfirmationSender implements ConfirmationSender {
  public confirmationsSent = []

  async sendConfirmation(params : {receiver : string, code : string, userdata : any}) {
    this.confirmationsSent.push(params)
  }
}

export class EmailConfirmationSender implements ConfirmationSender {
  private transporter
  private htmlGenerator
  private textGenerator
  private subjectGenerator
  private fromEmail

  constructor({transport, fromEmail, subjectGenerator, htmlGenerator, textGenerator} :
              {transport : nodemailer.Transport,
               fromEmail : string,
               subjectGenerator : Function,
               htmlGenerator : Function,
               textGenerator : Function
              }
  ) {
    this.transporter = nodemailer.createTransport(transport)
    this.subjectGenerator = subjectGenerator
    this.htmlGenerator = htmlGenerator
    this.textGenerator = textGenerator
    this.fromEmail = fromEmail
  }

  async sendConfirmation(params : {receiver : string, code : string, userdata : any}) {
    const html = this.htmlGenerator(params)
    const text = this.textGenerator(params)
    const subject = this.subjectGenerator(params)

    this.transporter.sendMail({
      from: this.fromEmail,
      to: params.receiver,
      subject: subject,
      text: text,
      html: html
    })
  }
}

export class SmsConfirmationSender implements ConfirmationSender {
  private textGenerator
  private storeResponse
  public lastResponse

  constructor({textGenerator, storeResponse = false} :
              {textGenerator : Function, storeResponse : boolean})
  {
    this.textGenerator = textGenerator
    this.storeResponse = storeResponse
    this.lastResponse = null
  }

  async sendConfirmation(params : {receiver : string, code : string, userdata : any}) {
    const bird = messagebird(require('../messagebird.json').key)
    const message = {
      'originator': 'SmartWallet',
      'recipients': [
        params.receiver
      ],
      'body': this.textGenerator(params)
    }

    const respone = await new Promise((resolve, reject) => {
      bird.messages.create(message, (err, response) => {
        if (err) return reject(err)
        resolve(response)
      })
    })
    if (this.storeResponse) {
      this.lastResponse = respone
    }
  }
}
