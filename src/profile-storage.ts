import { AttributeType } from './types'


export interface ProfileStorage {
  getContractID(params : {userID : string}) : Promise<string>
  storeClaimID(params : {userID : string, attrType : AttributeType, claimID : string}) : Promise<any>
}

interface MemoryContractIDMap {
  [userID : string] : string
}

export class MemoryProfileStorage implements ProfileStorage {
  public claimIDs = {}

  constructor(public contractIDs : MemoryContractIDMap) {
  }

  async getContractID({userID} : {userID : string}) : Promise<string> {
    return this.contractIDs[userID]
  }

  async storeClaimID({userID, attrType, claimID} : 
    {userID : string, attrType : AttributeType, claimID : string
  }) : Promise<any>
  {
    if (!this.claimIDs[userID]) {
      this.claimIDs[userID] = {}
    }
    if (!this.claimIDs[userID][attrType]) {
      this.claimIDs[userID][attrType] = []
    }
    this.claimIDs[userID][attrType].push(claimID)
  }
}
