import { expect } from 'chai';
import { RandomCodeGenerator } from './code-generator';

describe('RandomCodeGenerator', () => {
  it('should be able to generate random codes of a given length', async () => {
    let generator = new RandomCodeGenerator({codeLength: 6, digitOnly: true})
    expect(generator.generateCode()).to.have.lengthOf(6)
    generator = new RandomCodeGenerator({codeLength: 16, digitOnly: false})
    expect(generator.generateCode()).to.have.lengthOf(16)


  })
  it('should generate a new code different form the previvious one', () => {
    const generator = new RandomCodeGenerator({codeLength: 16, digitOnly: false})
    expect(generator.generateCode()).to.not.equal(generator.generateCode())
    expect(generator.generateCode()).to.not.equal(generator.generateCode())
    expect(generator.generateCode()).to.not.equal(generator.generateCode())
    expect(generator.generateCode()).to.not.equal(generator.generateCode())
  })
  it('should generate a numeric code if digitOnly is true', () => {
    const generator = new RandomCodeGenerator({codeLength: 16, digitOnly: true})
    expect(/^[0-9]*$/.test(generator.generateCode())).to.be.true
    expect(/^[0-9]*$/.test(generator.generateCode())).to.be.true
    expect(/^[0-9]*$/.test(generator.generateCode())).to.be.true
    expect(/^[0-9]*$/.test(generator.generateCode())).to.be.true
    expect(/^[0-9]*$/.test(generator.generateCode())).to.be.true
    expect(/^[0-9]*$/.test(generator.generateCode())).to.be.true
  })
  it('should generate a random alphanumeric code', () => {
    const generator = new RandomCodeGenerator({codeLength: 16, digitOnly: false})
    expect(/^[0-9]*$/.test(generator.generateCode())).to.be.false
    expect(/^[a-z]*$/.test(generator.generateCode())).to.be.false
    expect(/^[A-Z]*$/.test(generator.generateCode())).to.be.false
    expect(/^[a-z0-9]+$/i.test(generator.generateCode())).to.be.true

  })
})
