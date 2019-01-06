import request from '@/utils/request'

export function ping(params) {
    return request({
      url: '/dashboard/.ping',
      method: 'get',
      params
    })
}

