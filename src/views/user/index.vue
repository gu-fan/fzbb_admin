<template>
  <div class="dashboard-container">
  <h1>User</h1>
  <div class="flex vert-center" style="height:60px;">
    <div class="f1">
      <el-input placeholder="name" v-model="listQuery.name" style="width: 150px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-input placeholder="id" v-model="listQuery.id" style="width: 100px;" class="filter-item" @keyup.enter.native="handleFilter"/>
      <el-select v-model="listQuery.r_type" placeholder="type" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name+'('+item.key+')'" :value="item.key"/>
      </el-select>
      <el-button plain class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">search</el-button>

    </div>
    <div class="flex">
      <div>
        <el-button @click="addUser" >
          Add User
        </el-button>
      </div>
      <div  class="f1">

        <el-pagination
          v-show="total>0"
          background
          layout="prev, pager, next"
          :current-page.sync="listQuery.page+1"
          @current-change="handleCurrentChange"
          :total="total">
        </el-pagination>
      </div>
  </div>
  </div>

    <el-dialog title="user" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">

        <el-form-item label="name" prop="name">
          <el-input v-model="temp.name"/>
        </el-form-item>

        <el-form-item label="password" prop="password">
          <el-input v-model="temp.password"/>
        </el-form-item>

        <el-form-item label="phone" prop="phone">
          <el-input v-model="temp.phone"/>
        </el-form-item>

        <el-form-item label="permission" prop="permission">
          <el-input v-model="temp.permission"/>
        </el-form-item>

        <input id="file-selector" type="file" v-show="false" @change="onChange" ref="upload">

        <div class="img-box">
          <img :src="temp.avatar" alt="" ref="img" class="avatar">
        </div>
        <el-button @click="selectFile" >
           change avatar
        </el-button>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">cancel</el-button>
        <el-button type="primary" 
          :loading="loading" 
           @click="uploadAndSet">{{ confirm_or_progress }}</el-button>
      </div>
    </el-dialog>

  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row>

      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>

      <el-table-column label="avatar" width="110" align="center">
        <template slot-scope="scope">
          <img :src="scope.row.avatar" alt="" class="avatar">
        </template>
      </el-table-column>

      <el-table-column label="username" width="100">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>

      <el-table-column label="type" width="50">
        <template slot-scope="scope">
          {{ scope.row.r_type }}
        </template>
      </el-table-column>

      <el-table-column label="permission"  align="center">
        <template slot-scope="scope">
          <template v-if="scope.row.edit">
            <el-input v-model="scope.row.permission" class="edit-input" size="small"/>
            <el-button class="cancel-btn" size="small" icon="el-icon-refresh" type="warning" @click="cancelEdit(scope.row)">cancel</el-button>
          </template>
          <span v-else>{{ scope.row.permission }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" prop="created_at" label="created_at" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time"/>
          <span>{{ scope.row.created_at|fromNow }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="120">
        <template slot-scope="scope">
          <el-button v-if="scope.row.edit" type="success" size="small" icon="el-icon-circle-check-outline" @click="confirmEdit(scope.row)">Ok</el-button>
          <el-button v-else type="primary" size="small" icon="el-icon-edit" @click="Edit(scope.row)">Edit</el-button>
        </template>
      </el-table-column>

    </el-table>
  </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getUsers,setUser } from '@/api/user'
import { fromNow } from '@/utils/moment'
import request from '@/utils/request'
import data2blob from './data2blob'
import { Message, MessageBox } from 'element-ui'

import COS from 'cos-js-sdk-v5'

const calendarTypeOptions = [
  { key: 0, display_name: 'wechat' },
  { key: 1, display_name: 'dashboard' },
]

var Bucket = 'fzbb-1257828075';
var Region = 'ap-shanghai';

var cos = new COS({
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

export default {
  name: 'User',
  filters: {
    fromNow,
  },
  
  computed: {
    ...mapGetters([
      'name',
      'roles'
    ]),
    confirm_or_progress(){
      if (this.loading) {
        return (this.progress * 100) + "%"
      } else {
        return "confirm"
      }
    },

  },
  data() {
    return {
      list: null,
      listLoading: true,
      calendarTypeOptions,

      total: 0,
      listQuery: {
        page: 0,
        name: null,
        r_type: null,
        id: null,
      },

      filename: '',
      file: null,
      loading: false,

      dialogFormVisible: false,
      progress: 0,

      
      temp: {
        id: undefined,
        created_at: new Date(),
        name: '',
        permission:'',
        avatar: '',
      },
      

    }
  },
  methods:{
    getUsers(){
      getUsers(this.listQuery).then(res=>{
        var items = res.users.results
        this.total = res.users.total
        
        console.log(res)
        this.list = items.map(v => {
          this.$set(v, 'edit', false) // https://vuejs.org/v2/guide/reactivity.html
          v.oPermission= v.permission //  will be used when user click the cancel botton
          return v
        })
        this.listLoading = false
      })
    },



    cancelEdit(row) {
      row.permission = row.oPermission
      row.edit = false
      this.$message({
        message: 'The permission has been restored to the original value',
        type: 'warning'
      })
    },
    confirmEdit(row) {
      setPermission(row.id, row.permission)
        .then(()=>{

          row.edit = false
          row.oPermission = row.permission
          this.$message({
            message: 'The permission has been edited',
            type: 'success'
          })
        })
        .catch(()=>{
          row.edit = false
        })

    },

    addUser(){
      this.temp =  {
        created_at: new Date(),
        name: '',
        permission:'',
        avatar: '',
        phone: '',
      }
      this.dialogFormVisible = true
    },


    Edit(row){
      this.temp = row
      this.dialogFormVisible = true
    },

    selectFile(){
      this.$refs.upload.click()
      this.temp.avatar_changed = true
    },

    uploadAndSet(){
      if (this.temp.avatar_changed) {
        this.uploadFile()
      } else {
        this.setUser()
      }
    },

    setUser(){
      Object.keys(this.temp).forEach((key) => {
        if (this.temp[key] == null || this.temp[key]== '') {
         delete this.temp[key]
        }
      });
        setUser(this.temp)
          .then(res=>{
            Message({
              message: res.msg,
              duration: 3 * 1000
            })
            this.dialogFormVisible = false
            this.getUsers()
          })
    },

    uploadFile(){
      if (this.loading) {
        console.log("loading")
        return
      }
      if (!this.file) {
        console.log("file empty")
        return
      }
      
      var that = this
      this.loading = true

      cos.sliceUploadFile({
          Bucket: Bucket,
          Region: Region,
          Key: this.filename,
          Body: this.file,
          onReady: function(res){
            console.log("ready")
          },
          onHashProgress: function (progressData) {
              console.log('校验中', JSON.stringify(progressData));

          },
          onProgress: function (progressData) {
              console.log('上传中', JSON.stringify(progressData));
              that.progress = progressData.percent
          },
      }, function (err, data) {
        console.log(data)

        that.loading = false
        // fzbb-1257828075.file.myqcloud.com
        // http://fzbb-1257828075.cos.ap-shanghai.myqcloud.com/IMG_0054.JPG
        var cdn = data.Location.replace("cos.ap-shanghai", "file")
        that.temp.avatar = "http://" + cdn
        that.setUser()

      });
    },

    onChange(e){

        var file =this.$refs.upload.files[0];
        if (!file) return;

        let that = this,
            fr = new FileReader()

        fr.onload = function(e) {
            that.sourceImgUrl = fr.result
            var img=that.$refs.img
            img.src = that.sourceImgUrl
            var f = data2blob(that.sourceImgUrl, 'image/png')
            that.filename = file.name
            that.file = f
        }

        fr.readAsDataURL(file);

    },
    handleCurrentChange(val) {
      this.listQuery.page = parseInt(val) -1
      this.getUsers()
    },
    handleFilter(){
      this.getUsers()
    }
  },
  created(){
    this.getUsers()
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
.img-box {
  width: 200px;
  height: auto;
  background-color:red;

  img {
    width: 200px;
    height: auto;
  }

}
img.avatar {
  width: 100px;
  height: 100px;
}

</style>

