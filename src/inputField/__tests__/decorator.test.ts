import 'jest'

import {getInputFieldConfig, InputField} from 'revali/inputField'
import {resolveThunk} from 'revali/utils'

class InputFieldTest {
  @InputField()
  public foo: string = 'bar'
}

describe('InputField', () => {
  it('sets default value from property initializer', () => {
    const config = getInputFieldConfig(InputFieldTest)
    expect(config).toHaveProperty('foo')
    expect(resolveThunk(config!.foo).defaultValue).toEqual('bar')
  })
})
