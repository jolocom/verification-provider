import { CodeGenerator } from './code-generator';
import { VerificationStorage } from './verification-storage'
import { ClaimsStorage } from './claims-storage'
import { ProfileStorage } from './profile-storage'
import { ConfirmationSender } from './confirmation-sender'


export interface EmailVerifierOptions {
  codeGenerator : CodeGenerator
  verification : VerificationStorage
  claims : ClaimsStorage
  profile : ProfileStorage
  confirmationSender : ConfirmationSender
}


export class EmailVerifier {
  public codeGenerator : CodeGenerator
  public verification : VerificationStorage
  public claims : ClaimsStorage
  public profile : ProfileStorage
  public confirmationSender : ConfirmationSender

  constructor(params : EmailVerifierOptions) {
    this.codeGenerator = params.codeGenerator
    this.verification = params.verification
    this.claims = params.claims
    this.profile = params.profile
    this.confirmationSender = params.confirmationSender
  }

  async startVerification({userID, email} : {userID : string, email : string}) : Promise<any> {
    const code = this.codeGenerator.generateCode()
    await this.verification.storeCode({userID, attrType: 'email', value: email, code})
    await this.confirmationSender.sendConfirmation({email, code, userdata: null})
  }

  async verify({userID, email, code}) : Promise<any> {
    const valid = this.verification.validateCode({userID, attrType: 'email', value: email, code})
    if (!valid) {
      throw new Error("Invalid verification code")
    }
    const contractID = await this.profile.getContractID({userID})
    const {claimID} = await this.claims.verifyAttribute({contractID, attrType: 'email', value: email})
    await this.profile.storeClaimID({userID, attrType: 'email', claimID})
    await this.verification.deleteCode({userID, attrType: 'email', value: email, code})
  }
}
