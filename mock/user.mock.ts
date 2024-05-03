import mock from 'mockjs'
import { defineMock } from 'vite-plugin-mock-dev-server'

const data = {
  userid: mock.mock('@id()'),
  username: mock.mock('@cname()'),
  email: mock.mock('@email()'),
  phone: mock.mock(/^1((38[0-8])|(8\d{2})|(([35][0-35-9]|4[579]|66|7[35678]|9[1389])\d{1}))\d{7}$/),
  last_login_at: 0,
  ...mock.mock({ 'age|1-100': 100 })
}

export default defineMock([
  {
    url: '/api/user/login',
    method: 'POST',
    response(req, res, next) {
      // const { query, body, params, headers } = req
      const { username, password } = req.body

      if (username === 'admin' && password === 'admin') {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(mock.mock('@guid()')))
      } else {
        res.statusCode = 422
        res.setHeader('Content-Type', 'application/json')
        res.end(
          JSON.stringify({
            msg: '用户名密码错误'
          })
        )
      }
    }
  },
  {
    url: '/api/user/info',
    method: 'GET',
    // response(req, res, next) {
    //   res.statusCode = 401
    //   res.setHeader('Content-Type', 'application/json')
    //   res.end(JSON.stringify(mock.mock('@guid()')))
    // }
    body: data
  },
  {
    url: '/api/user/change_password/',
    method: 'PUT',
    body: 'success'
  },
  {
    url: '/api/user/logout/',
    method: 'POST',
    body: 'success'
  },
  {
    url: '/api/allow-get-and-post',
    method: ['GET', 'POST'],
    body: {
      message: 'Allow get and post request methods'
    }
  }
])
