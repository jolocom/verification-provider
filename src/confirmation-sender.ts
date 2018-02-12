import * as fs from 'fs'
import * as path from 'path'
import * as nodemailer from 'nodemailer'
import * as messagebird from 'messagebird'
import * as mustache from 'mustache'

export interface ConfirmationSender {
  sendConfirmation(params : {receiver : string, id : string, code : string, userdata : any}) : Promise<any>
}

export class MemoryConfirmationSender implements ConfirmationSender {
  public confirmationsSent = []

  async sendConfirmation(params : {receiver : string, code : string, userdata : any}) {
    this.confirmationsSent.push(params)
  }
}

export class EmailConfirmationSender implements ConfirmationSender {
  private transporter
  private linkGenerator
  private htmlGenerator
  private textGenerator
  private subjectGenerator
  private fromEmail

  constructor({
    transport, 
    fromEmail, 
    subjectGenerator, 
    linkGenerator, 
    htmlGenerator, 
    textGenerator
  } : {
    transport : nodemailer.Transport,
    fromEmail : string,
    subjectGenerator : Function,
    linkGenerator : Function,
    htmlGenerator : Function,
    textGenerator : Function
  }) {
    this.transporter = nodemailer.createTransport(transport)
    this.subjectGenerator = subjectGenerator
    this.linkGenerator = linkGenerator
    this.htmlGenerator = htmlGenerator
    this.textGenerator = textGenerator
    this.fromEmail = fromEmail
  }

  async sendConfirmation(params : {receiver : string, id : string, code : string, userdata : any}) {
    const link = this.linkGenerator(params)
    const html = this.htmlGenerator({...params, link})
    const text = this.textGenerator({...params, link})
    const subject = this.subjectGenerator(params)

    await this.transporter.sendMail({
      from: this.fromEmail,
      to: params.receiver,
      subject: subject,
      text: text,
      html: html
    })
  }
}

export class SmsConfirmationSender implements ConfirmationSender {
  private key
  private textGenerator
  private storeResponse
  public lastResponse

  constructor({
    key, 
    textGenerator, 
    storeResponse = false
  } : {
    key : string, 
    textGenerator : Function, 
    storeResponse? : boolean
  }) {
    this.key = key
    this.textGenerator = textGenerator
    this.storeResponse = storeResponse
    this.lastResponse = null
  }

  async sendConfirmation(params : {
    receiver : string,
    code : string,
    userdata : any
  }) {
    const bird = messagebird(this.key)
    console.log(params.receiver)
    console.log(params.receiver)
    console.log(params.receiver)
    const message = {
      'originator': 'SmartWallet',
      'recipients': [
        params.receiver
      ],
      'body': this.textGenerator(params)
    }

    const response = await new Promise((resolve, reject) => {
      bird.messages.create(message, (err, response) => {
        if (err) return reject(err)
        resolve(response)
      })
    })

    if (this.storeResponse) {
      this.lastResponse = response
    }
  }
}

export function mustacheTemplateGenerator(template : string) {
  return context => {
    return mustache.render(template, context)
  }
}

export function loadTemplate(name, engine : (template : string) => ((context : object) => string)) {
  const filePath = path.join(__dirname, '..', 'templates', name)
  const template = fs.readFileSync(filePath).toString()
  return engine(template)
}

export function jolocomEmailLinkGenerator({
  receiver, 
  id, 
  code
} : {
  receiver : string, 
  id : string, 
  code : string
}) : string {
  return [
    'https://staging.wallet.jolocom.com/#/verify-email?email=',
    encodeURIComponent(receiver),
    '&id=',
    encodeURIComponent(id),
    '&code=',
    encodeURIComponent(code)
  ].join('')
}
