import 'jest'

import {Arg} from '../../decorators/Arg'
import {Args} from '../../decorators/Args'
import {resolveThunk} from '../../utils/thunk'
import {buildArgs} from '../buildArgs'

class WithoutDecorator {
  @Arg()
  public foo!: string
}

@Args()
class WithDecorator {
  @Arg()
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
