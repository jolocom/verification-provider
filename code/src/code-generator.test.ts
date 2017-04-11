import { expect } from 'chai';
import { RandomCodeGenerator } from './code-generator';

describe('RandomCodeGenerator', () => {
  it('should be able to generate random codes of a given length', async () => {
    const generator = new RandomCodeGenerator({codeLength: 16})
    expect(generator.generateCode()).to.have.lengthOf(16)
  })
})
