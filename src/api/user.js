import request from '@/utils/request'

export function getUsers(params) {
  return request({
    url: '/censor/users',
    method: 'get',
    params
  })
}

export function getUsersByName(name) {
  return request({
    url: '/censor/users',
    method: 'get',
    params: {
      name
    }
  })
}

export function setUser(params) {
  if (params.id) {
    return request({
      url: '/censor/user/'+ params.id,
      method: 'patch',
      data: params,
    })
  } else {
    return request({
      url: '/censor/user',
      method: 'post',
      data: params,
    })
  }
}
