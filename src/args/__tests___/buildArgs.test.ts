import 'jest'

import {Args, buildArgs} from 'revali/args'
import {InputField} from 'revali/inputField'
import {resolveThunk} from 'revali/utils'

class WithoutDecorator {
  @InputField()
  public foo!: string
}

@Args()
class WithDecorator {
  @InputField()
  public foo!: string
}

@Args()
class NoArg {
  public foo!: string
}

describe('buildArgs', () => {
  it('should throw on class without Args decorator', () => {
    expect(() => buildArgs(WithoutDecorator)).toThrow()
  })

  it('should throw if no Arg decorators', () => {
    expect(() => buildArgs(NoArg)).toThrow()
  })

  it('should get args for class with Args decorator', () => {
    const args = resolveThunk(buildArgs(WithDecorator))
    expect(args).toBeTruthy()
    expect(args).toHaveProperty('foo')
  })
})
