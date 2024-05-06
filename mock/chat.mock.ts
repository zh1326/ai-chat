import mock from 'mockjs'
import { defineMock } from 'vite-plugin-mock-dev-server'

const list = new Array(25).fill(1).map((_, index) => {
  return {
    session_id: `${index + 1}`,
    name: mock.mock('@cTitle()'),
    scene_id: mock.mock('@id()'),
    scene_name: mock.mock('@title()'),
    scene_type: 'generation',
    conversations: [
      {
        id: mock.mock('@id()'),
        role: 'assistant',
        message: mock.mock('@cparagraph()'),
        date: Number(new Date()),
        template_id: mock.mock('@id()')
      },
      {
        id: mock.mock('@id()'),
        role: 'user',
        message: mock.mock('@cparagraph()'),
        date: Number(new Date()),
        template_id: mock.mock('@id()')
      }
    ],
    created_at: Number(new Date()),
    updated_at: Number(new Date())
  }
})

export default defineMock([
  {
    url: '/api/chats/sessions/',
    method: 'GET',
    response(req, res, next) {
      const { query, body, params, headers } = req
      const q = query.q

      let newList: typeof list = []
      if (q) {
        newList = list.filter((item) => item.name.includes(q))
      } else {
        newList = list
      }
      res.end(JSON.stringify(newList))
    }
  },
  {
    url: '/api/chats/sessions/:id/',
    method: 'GET',
    response(req, res, next) {
      const { params } = req
      const id = params.id
      const data = list.find((item) => item.session_id === id) || {}

      res.end(JSON.stringify(data))
    }
  },
  {
    url: '/api/chats/sessions/:id/',
    method: 'DELETE',
    response(req, res, next) {
      const { params } = req
      const id = params.id

      const index = list.findIndex((item) => item.session_id === id)
      if (index > -1) {
        list.splice(index, 1)
      }

      res.end(JSON.stringify('success'))
    }
  },
  {
    url: '/api/chats/sessions/:id/',
    method: 'PATCH',
    response(req, res, next) {
      const { params, body } = req
      const id = params.id
      const name = body.name

      const item = list.find((item) => item.session_id === id)
      item && (item.name = name)

      res.end(JSON.stringify('success'))
    }
  },
  {
    url: '/api/chats/:sceneId',
    method: 'POST',
    response(req, res, next) {
      const { params } = req
      const id = params.sceneId

      res.end(
        JSON.stringify({
          session_id: '1',
          name: mock.mock('@cTitle()'),
          scene_id: id,
          scene_name: '咨询类',
          scene_type: 'consultation',
          created_at: Number(new Date()),
          updated_at: Number(new Date())
        })
      )
    }
  },
  {
    url: '/api/chats/:sessionId/completion',
    method: 'GET',
    response(req, res, next) {
      const { params } = req
      const id = params.sessionId

      res.setHeader('Content-Type', 'text/event-stream')

      // data:{"code":200,"messageType":1,"end":1,"content":"服务器"}
      // id:5285eaa4-92ba-421e-b5b5-e9deed02a1d6
      // event:chat5897adabb6e74165bb56134772bb0fdb

      res.end(
        JSON.stringify({
          id: 1,
          delta: {
            role: 'user',
            message: '# 标题'
          }
        })
      )
    }
  },
  {
    url: '/api/chats/files/',
    method: 'POST',
    response(req, res, next) {
      // const { query, body, params, headers } = req
      const { params, body } = req

      res.end(
        JSON.stringify({
          file_id: mock.mock('@id()'),
          file_url: mock.mock('@url()'),
          purpose: body.purpose
        })
      )
    }
  },
  {
    url: '/api/chats/:sessionId/conversations/:convId/',
    method: 'PUT',
    response(req, res, next) {
      const { params, body } = req
      const sessionId = params.sessionId
      const convId = params.convId

      res.end(JSON.stringify('success'))
    }
  }
])
