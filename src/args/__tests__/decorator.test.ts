import 'jest'

import {getArgsConfig} from 'revali/args'
import {InputField} from 'revali/inputField'
import {resolveThunk} from 'revali/utils'

class ArgTest {
  @InputField()
  public foo: string = 'bar'
}

describe('Args', () => {
  it('sets default value from property initializer', () => {
    const config = getArgsConfig(ArgTest)
    expect(config).toHaveProperty('foo')
    expect(resolveThunk(config!.foo).defaultValue).toEqual('bar')
  })
})
