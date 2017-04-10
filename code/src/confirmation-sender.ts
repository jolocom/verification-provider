export interface ConfirmationSender {
  sendConfirmation(params : {email : string, code : string, userdata : any}) : Promise<any>
}


export class MemoryConfirmationSender implements ConfirmationSender {
  public confirmationsSent = []

  async sendConfirmation(params : {email : string, code : string, userdata : any}) {
    this.confirmationsSent.push(params)
  }
}
