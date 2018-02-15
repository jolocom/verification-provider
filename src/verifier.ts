import JolocomLib from 'jolocom-lib'
import { CodeGenerator } from './code-generator';
import { VerificationStorage } from './verification-storage'
import { ConfirmationSender } from './confirmation-sender'
import { AttributeType } from './types'

export interface VerifierOptions {
  codeGenerator : CodeGenerator
  verification : VerificationStorage
  confirmationSender : ConfirmationSender,
  attrType : AttributeType,
  accountEntropy: string
}

export class Verifier {
  public codeGenerator : CodeGenerator
  public verification : VerificationStorage
  public confirmationSender : ConfirmationSender
  public attrType : AttributeType
  private accountEntropy : string

  constructor(params : VerifierOptions) {
    this.codeGenerator = params.codeGenerator
    this.verification = params.verification
    this.confirmationSender = params.confirmationSender
    this.attrType = params.attrType,
    this.accountEntropy = params.accountEntropy
  }

  async startVerification({
    claim
  } : {
    claim: any
  }) : Promise<void> {
    const code = this.codeGenerator.generateCode()
    const {id, phone} = claim.credential.claim

    await this.verification.storeCode({
      identity: id,
      value: phone,
      attrType: this.attrType,
      code
    })

    await this.confirmationSender.sendConfirmation({
      receiver: phone,
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

    // TODO CONFIG
    const jolocomLib = new JolocomLib({
      identity: {
        providerUrl: '',
        contractAddress: ''
      },
      ipfs: {
        host: '',
        port: 0,
        protocol: ''
      }
    })

    const record = JSON.parse(await this.verification.retrieveCode({
      identity,
      attrType: this.attrType
    }))

    const serviceIdentity = jolocomLib.identity.create(this.accountEntropy)
    const claim =  jolocomLib.claims.createVerifiedCredential(
      serviceIdentity.didDocument.id,
      ['phone'],
      {id: identity, phone: record.phone},
      serviceIdentity.genericSigningKeyWIF
    )

    await this.verification.deleteCode({ identity, attrType: this.attrType })

    return claim
  }
}
