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
  profile : ProfileStorage
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
    this.profile = params.profile
    this.confirmationSender = params.confirmationSender
    this.attrType = params.attrType
  }

  async startVerification({userID, attrValue} : {userID : string, attrValue : string}) : Promise<any> {
    const code = this.codeGenerator.generateCode()
    await this.verification.storeCode({userID, attrType: this.attrType, value: attrValue, code})
    await this.confirmationSender.sendConfirmation({receiver: attrValue, code, userdata: null})
  }

  async verify({userID, attrValue, code}) : Promise<boolean> {
    const valid = await this.verification.validateCode({userID, attrType: this.attrType, value: attrValue, code})
    if (!valid) {
      return false
    }
    const contractID = await this.profile.getContractID({userID})
    const {claimID} = await this.claims.verifyAttribute({contractID, attrType: this.attrType, value: attrValue})
    await this.profile.storeClaimID({userID, attrType: this.attrType, claimID})
    await this.verification.deleteCode({userID, attrType: this.attrType, value: attrValue, code})
    return true
  }
}
