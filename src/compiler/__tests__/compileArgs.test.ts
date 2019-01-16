import 'jest'

import {Args, InputField} from 'revali/decorators'

import {compileArgs} from 'revali/compiler'
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

class SomeArgs {
  @InputField()
  public bar!: string
}

@Args()
class ExtendedArgs extends SomeArgs {
  @InputField()
  public foo!: string
}

describe('compileArgs', () => {
  it('should throw on class without Args decorator', () => {
    expect(() => compileArgs(WithoutDecorator)).toThrow()
  })

  it('should throw if no Arg decorators', () => {
    expect(() => compileArgs(NoArg)).toThrow()
  })

  it('should get args for class with Args decorator', () => {
    const args = resolveThunk(compileArgs(WithDecorator))
    expect(args).toBeTruthy()
    expect(args).toHaveProperty('foo')
  })

  it('should get superclass args', () => {
    const args = resolveThunk(compileArgs(ExtendedArgs))
    expect(args).toBeTruthy()
    expect(args).toHaveProperty('foo')
    expect(args).toHaveProperty('bar')
  })
})
