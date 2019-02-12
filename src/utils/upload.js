import COS from 'cos-js-sdk-v5'
import request from '@/utils/request'

export const Bucket = 'fzbb-1257828075';
export const Region = 'ap-shanghai';

export var cos = new COS({
          getAuthorization: function (options, callback) {
            request({
              url: '/kpass/cos',
              method: 'get',
            })
            .then(data=>{
                  callback({
                      TmpSecretId: data.credentials && data.credentials.tmpSecretId,
                      TmpSecretKey: data.credentials && data.credentials.tmpSecretKey,
                      XCosSecurityToken: data.credentials && data.credentials.sessionToken,
                      ExpiredTime: data.expiredTime,
                  });


            })
          }
      });



