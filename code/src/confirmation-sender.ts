import * as nodemailer from 'nodemailer'

export interface ConfirmationSender {
  sendConfirmation(params : {email : string, code : string, userdata : any}) : Promise<any>
}


export class MemoryConfirmationSender implements ConfirmationSender {
  public confirmationsSent = []

  async sendConfirmation(params : {email : string, code : string, userdata : any}) {
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

  async sendConfirmation(params : {email : string, code : string, userdata : any}) {
    const html = this.htmlGenerator(params)
    const text = this.textGenerator(params)
    const subject = this.subjectGenerator(params)

    this.transporter.sendMail({
      from: this.fromEmail,
      to: params.email,
      subject: subject,
      text: text,
      html: html
    })
  }
}
