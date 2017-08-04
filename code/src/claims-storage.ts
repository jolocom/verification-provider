import * as _ from 'lodash'
import * as contracts from 'smartwallet-contracts'
import { AttributeType } from './types'

export interface ClaimsStorage {
  verifyAttribute({identity, attrType, attrId, value} :
                  {identity : string, attrType : AttributeType, attrId : string, value : string}
                  ) : Promise<any>
}

export class MemoryClaimsStorage implements ClaimsStorage {
  public claims = []

  async verifyAttribute({identity, attrType, attrId, value} :
                        {identity : string, attrType : AttributeType, attrId : string, value : string}
                       ) : Promise<any>
  {
    this.claims.push({identity, attrType, attrId, value})
  }
}

export type GatewaySessionCreator = () => Promise<any>

export class GatewayClaimStorage implements ClaimsStorage {
  private _createGatewaySession : GatewaySessionCreator
  private _seedPhrase : string
  private _identityURL : string

  constructor({createGatewaySession, seedPhrase, identityURL} :
              {createGatewaySession : GatewaySessionCreator,
               identityURL : string,
               seedPhrase : string})
  {
    this._createGatewaySession = createGatewaySession
    this._seedPhrase = seedPhrase
    this._identityURL = identityURL
  }

  async verifyAttribute({identity, attrType, attrId, value} :
                        {identity : string, attrType : AttributeType, attrId : string, value : string}
                        ) : Promise<any>
  {
    const session = await this._createGatewaySession()
    const res = await session.post(`${this._identityURL}/verify`, {
      form: {
        seedPhrase: this._seedPhrase,
        identity,
        attributeType: attrType,
        attributeId: attrId,
        attributeValue: value
      }
    })
  }
}
