import request from '@/utils/request'

export function getFeedbacks(params) {
  return request({
    url: '/censor/feedback',
    method: 'get',
    params
  })
}

export function createFeedBack(params) {
  return request({
    url: '/feedback/',
    method: 'post',
    data: params
  })
}

export function readFeedBack(id) {
  return request({
    url: `/censor/feedback/${id}/read`,
    method: 'post',
  })
}
