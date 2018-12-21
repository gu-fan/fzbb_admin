import request from '@/utils/request'

export function getList(params) {
  if ( params.type == 'question' ) {
      return request({
        url: '/censor/questions',
        method: 'get',
        params
      })
  } else {
      return request({
        url: '/censor/answers',
        method: 'get',
        params
      })
  }
}


export function getAnswers(id) {
  return request({
    url: '/censor/q/'+id+'/answers',
    method: 'get',
  })
}

export function Reject(id, type) {
  if ( type == 'question' ) {
      return request({
        url: '/censor/q/'+id,
        method: 'post',
        data: {action:'reject', reason:'from dashboard'}
      })
  } else {
      return request({
        url: '/censor/a/'+ id,
        method: 'post',
        data: {action:'reject', reason:'from dashboard'}
      })
  }
}

export function Pass(id, type) {
  if ( type == 'question' ) {
      return request({
        url: '/censor/q/'+id,
        method: 'post',
        data: {action:'pass', reason:'from dashboard'}
      })
  } else {
      return request({
        url: '/censor/a/'+ id,
        method: 'post',
        data: {action:'pass', reason:'from dashboard'}
      })
  }
}

export function createQuestion(params) {
    return request({
      url: '/censor/q',
      method: 'post',
      data: params,
    })
}

export function createAnswer(params) {
    return request({
      url: '/censor/a',
      method: 'post',
      data: params,
    })
}

export function editQuestion(params) {
    return request({
      url: '/censor/q',
      method: 'patch',
      data: params,
    })
}

export function editAnswer(params) {
    return request({
      url: '/censor/a',
      method: 'patch',
      data: params,
    })
}
