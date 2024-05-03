import mock from 'mockjs'
import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  {
    url: '/api/scenes/',
    method: 'GET',
    body: [
      {
        id: 1,
        name: '咨询',
        stype: 'consultation',
        description: '咨询类介绍',
        guidelines: [
          '问题1问题1问题1问题1',
          '问题2问题2问题2问题2问题2',
          '问题3问题3问题3问题3问题3问题3问题3问题3问题3问题3问题3'
        ]
      },
      {
        id: 2,
        name: '合同生成',
        stype: 'generation',
        description: '生成类介绍生成类介绍生成类介绍生成类介绍',
        guidelines: [
          '问题1问题1问题1问题1',
          '问题2问题2问题2问题2问题2',
          '问题3问题3问题3问题3问题3问题3问题3问题3问题3问题3问题3'
        ]
      }
    ]
  }
])
