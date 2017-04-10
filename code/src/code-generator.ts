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
