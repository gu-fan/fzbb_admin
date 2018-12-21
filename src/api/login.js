import request from '@/utils/request'

export function login(username, password) {
  return request({
    url: '/sa/login',
    method: 'post',
    data: {
      username,
      password
    }
  })
}

export function getInfo() {
  return request({
    url: '/sas/.ping',
    method: 'get',
  })
}

export function logout() {
  return request({
    url: '/sas/logout',
    method: 'post'
  })
}
