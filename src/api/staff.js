import request from '@/utils/request'

export function getStaffs(params) {
  return request({
    url: '/sas/all',
    method: 'get',
    params
  })
}

export function setPermission(id, permission) {
  return request({
    url: '/sas/set_permission',
    method: 'post',
    data: {
      id,
      permission
    }
  })
}
