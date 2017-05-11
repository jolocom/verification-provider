import * as contracts from 'smartwallet-contracts'
import { AttributeType } from './types'

interface ClaimStoreReturnValue {
  claimID : string
}

export interface ClaimsStorage {
  verifyAttribute(params : {
    contractID : string, attrType : AttributeType, value : string
  }) : Promise<ClaimStoreReturnValue>
}

export class MemoryClaimsStorage implements ClaimsStorage {
  public claims = []

  async verifyAttribute(params : {
    contractID : string, attrType : AttributeType, value : string
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
    contractID : string, attrType : AttributeType, value : string
  }) : Promise<ClaimStoreReturnValue> {
    const definitionUrl = {
      email: '',
      phone: ''
    }[params.attrType]

    await this._wallet.addAttributeHashAndWait(
      params.attrType,
      params.value,
      definitionUrl,
      this._config.password,
      params.contractID
    )

    return {claimID: 'dummy'}
  }
}
