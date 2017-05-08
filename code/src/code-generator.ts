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
      const max = this.calculateMax(codeLength)
      const min = this.calculateMin(codeLength)
      this.randomCode = (Math.floor(Math.random() * (max - min)) + min).toString()
    } else {
      this.randomCode = randtoken.generate(codeLength)
    }
  }

  calculateMax(codeLength : number) : number {
    if (codeLength === 0) return 0
    let max = 1
    for (let i = 0; i < codeLength; i++) max *= 10
    return max - 1
  }

  calculateMin(codeLength : number) : number {
    if (codeLength < 1) return 0
    let min = 1
    for (let i = 0; i < codeLength - 1; i++) min *= 10
    return min
  }

  generateCode() : string {
    return this.randomCode
  }
}
