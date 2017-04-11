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

  constructor({codeLength} : {codeLength : number}) {
    this.codeLength = codeLength
  }

  generateCode() : string {
    return randtoken.generate(16)
  }
}
