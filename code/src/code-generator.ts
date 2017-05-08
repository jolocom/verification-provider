import * as randtoken from 'rand-token'

export interface CodeGenerator {
  generateCode() : string
}

export class SingleCodeGenerator implements CodeGenerator {
  constructor(public code : string) {
  }

  generateCode() : string {
    return this.code
  }
}

export class RandomCodeGenerator implements CodeGenerator {
  private codeLength : number
  private randomCode : string
  constructor({codeLength, digitOnly} : {codeLength : number, digitOnly : boolean}) {
    this.codeLength = codeLength
    if (digitOnly) {
      const Random = require("random-js")
      const max = (codeLength === 0) ? 0 : (10 ** codeLength) - 1
      const min = (codeLength <= 1) ? 0 : 10 ** (codeLength - 1)
      this.randomCode = Random(Random.engines.mt19937().autoSeed()).integer(min, max).toString()
    } else {
      this.randomCode = randtoken.generate(codeLength)
    }
  }

  generateCode() : string {
    return this.randomCode
  }
}
