import { CodeGenerator } from './code-generator';
import { VerificationStorage } from './verification-storage'
import { ClaimsStorage } from './claims-storage'
import { ProfileStorage } from './profile-storage'
import { ConfirmationSender } from './confirmation-sender'
import { AttributeType } from './types'


export interface VerifierOptions {
  codeGenerator : CodeGenerator
  verification : VerificationStorage
  claims : ClaimsStorage
  confirmationSender : ConfirmationSender,
  attrType : AttributeType
}


export class Verifier {
  public codeGenerator : CodeGenerator
  public verification : VerificationStorage
  public claims : ClaimsStorage
  public profile : ProfileStorage
  public confirmationSender : ConfirmationSender
  public attrType : AttributeType

  constructor(params : VerifierOptions) {
    this.codeGenerator = params.codeGenerator
    this.verification = params.verification
    this.claims = params.claims
    this.confirmationSender = params.confirmationSender
    this.attrType = params.attrType
  }

  async startVerification({identity, attrId, attrValue} :
                          {identity, attrId, attrValue : string}) : Promise<any>
  {
    const code = this.codeGenerator.generateCode()
    await this.verification.storeCode({
      identity, attrType: this.attrType, attrId, value: attrValue, code
    })
    await this.confirmationSender.sendConfirmation({receiver: attrValue, code, userdata: null})
  }

  async verify({identity, attrId, attrValue, code} :
               {identity : string, attrId : string, attrValue : string,
                code : string}) : Promise<boolean>
  {
    const valid = await this.verification.validateCode({
      identity, attrType: this.attrType, attrId, value: attrValue, code
    })
    if (!valid) {
      return false
    }
    await this.claims.verifyAttribute({
      identity, attrType: this.attrType, attrId, value: attrValue
    })
    await this.verification.deleteCode({
      identity, attrType: this.attrType, attrId, value: attrValue, code
    })
    return true
  }
}
