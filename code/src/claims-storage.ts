import * as _ from 'lodash'
import * as contracts from 'smartwallet-contracts'
import { AttributeType } from './types'

interface ClaimStoreReturnValue {
  claimID : string
}

export interface ClaimsStorage {
  verifyAttribute(params : {
    txHash : string, salt : string, attrType : AttributeType, value : string
  }) : Promise<ClaimStoreReturnValue>
}

export class MemoryClaimsStorage implements ClaimsStorage {
  public claims = []

  async verifyAttribute(params : {
    txHash : string, salt : string, attrType : AttributeType, value : string
  }) : Promise<ClaimStoreReturnValue> {
    this.claims.push(params)
    return {
      claimID: this.claims.length.toString()
    }
  }
}

export interface EthereumClaimStorageConfig {
  gethHost : string
  userName : string
  seedPhrase : string
  password : string
  lookupContractAddress : string
}

export class EthereumClaimStorage implements ClaimsStorage {
  private _config : EthereumClaimStorageConfig
  private _wallet

  constructor(config : EthereumClaimStorageConfig) {
    this._config = config
  }

  async initialize() {
    const manager = new contracts.WalletManager(this._config)
    this._wallet = await manager.loginWithSeedPhrase(this._config)
    return this
  }

  async verifyAttribute(params : {
    txHash : string, salt : string, attrType : AttributeType, value : string
  }) : Promise<ClaimStoreReturnValue> {
    const definitionUrl = {
      email: '',
      phone: ''
    }[params.attrType]

    const transaction = this._wallet.getTransaction(params.txHash)
    const walletAddress = transaction.from
    const identityAddress = this._wallet.getIdentityAddressFromLookupContract(walletAddress)
    const calculatedVerificationHash = this._wallet.walletCrypto.sha256(
      params.value + params.salt
    )
    if (transaction.data !== calculatedVerificationHash) {
      throw new Error("Hash does not match")
    }

    const existingHash = await this._wallet.getAttributeHash({
      attributeId: params.attrType,
      identityAddress
    })

    let forceAddVerification = false
    if (!existingHash) {
      forceAddVerification = true

      await this._wallet.addAttributeHashToTargetIdentityAndWait({
        targetIdentityAddress: identityAddress,
        attributeId: params.attrType,
        attribute: params.value,
        definitionUrl: '',
        pin: this._config.password,
      })
    }

    if (!forceAddVerification) {
      const verificationCount = await this._wallet.getNumberOfVerifications({
        attributeId: params.attrType,
        identityAddress
      })
      const verifications = await Promise.all(_.range(verificationCount).map(idx =>
        this._wallet.getVerification({
          attributeId: params.attrType,
          verificationIdx: idx,
          identityAddress
        })
      ))
      const calculatedHash = this._wallet.walletCrypto.calculateDataHash(params.value)
      const exists = _.some(verifications,
        verification => verification.hash === calculatedHash
      )
    }

    await this._wallet.addVerificationToTargetIdentity({
      targetIdentityAddress: identityAddress,
      attributeId: params.attrType,
      pin: this._config.password,
    })

    return {claimID: 'dummy'}
  }
}
