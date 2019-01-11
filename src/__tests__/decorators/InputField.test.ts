import 'jest'

import {getInputFieldConfig} from '../../metadata'
import {resolveThunk} from '../../utils/thunk'
import {InputField} from '../InputField'

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
