var moment = require('moment')
moment.locale('zh_CN')

export function fromNow(value){
  return moment(value).fromNow()
}
