import 'jest'

import {Arg} from 'revali/decorators'
import {registrar} from 'revali/metadata'
import {resolveThunk} from 'revali/utils'

describe('Arg', () => {
  it('sets the config in the registrar', () => {
    class Test {
      public foo(@Arg('bar') bar: string): string {
        return ''
      }
    }

    const config = registrar.getArgMetadata(Test, 'foo')
    expect(config).toBeTruthy()
    expect(resolveThunk(config!).name).toEqual('bar')
  })

  it('allows only one arg per function', () => {
    expect(() => {
      class TestWithError {
        public topic(@Arg('id') id: string, @Arg('slug') slug: string): string {
          return ''
        }
      }
    }).toThrow()
  })
})
