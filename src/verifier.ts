import { CodeGenerator } from './code-generator';
import { VerificationStorage } from './verification-storage'
import { ConfirmationSender } from './confirmation-sender'
import * as moment from 'moment'
import { AttributeType } from './types'

export interface VerifierOptions {
  codeGenerator : CodeGenerator
  verification : VerificationStorage
  confirmationSender : ConfirmationSender,
  attrType : AttributeType,
  accountEntropy: string,
  jolocomLib: any
}

export class Verifier {
  public codeGenerator : CodeGenerator
  public verification : VerificationStorage
  public confirmationSender : ConfirmationSender
  public attrType : AttributeType
  private accountEntropy : string
  private jolocomLib

  constructor(params : VerifierOptions) {
    this.codeGenerator = params.codeGenerator
    this.verification = params.verification
    this.confirmationSender = params.confirmationSender
    this.attrType = params.attrType,
    this.accountEntropy = params.accountEntropy
    this.jolocomLib = params.jolocomLib
  }

  async startVerification({
    claim
  } : {
    claim: any
  }) : Promise<void> {
    const code = this.codeGenerator.generateCode()
    const id = claim.credential.claim.id
    const value = claim.credential.claim[this.attrType]

    await this.verification.storeCode({
      identity: id,
      value,
      attrType: this.attrType,
      code
    })

    await this.confirmationSender.sendConfirmation({
      receiver: value,
      code, 
    })
  }

  async verify({
    identity,
    attrType,
    code
  } : {
    identity : string,
    attrType : string,
    code : string
  }) : Promise<any> {
    const valid = await this.verification.validateCode({
      identity,
      attrType: this.attrType,
      code
    })

    if (!valid) {
      throw new Error('Invalid code')
    }

    const record = JSON.parse(await this.verification.retrieveCode({
      identity,
      attrType: this.attrType
    }))

    const serviceIdentity = this.jolocomLib.identity.create(this.accountEntropy)

    const expires = moment.utc().add(1, 'year').format().toString()
    const claim =  this.jolocomLib.claims.createVerifiedCredential(
      {
        issuer: serviceIdentity.didDocument.id,
        credentialType: ['Credential', this.attrType],
        claim: {id: identity, [this.attrType]: record.value},
        privateKeyWIF: serviceIdentity.genericSigningKeyWIF,
        expires: expires
      }
    )

    await this.verification.deleteCode({ identity, attrType: this.attrType })
    return claim
  }
}
