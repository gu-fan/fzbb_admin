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

        <!-- <el-form-item label="password" prop="password"> -->
        <!--   <el-input v-model="temp.password"/> -->
        <!-- </el-form-item> -->

        <!-- <el-form-item label="phone" prop="phone"> -->
        <!--   <el-input v-model="temp.phone"/> -->
        <!-- </el-form-item> -->

        <!-- <el-form-item label="permission" prop="permission"> -->
        <!--   <el-input v-model="temp.permission"/> -->
        <!-- </el-form-item> -->

        <input id="file-selector" type="file" v-show="false" @change="onChange" ref="upload">

        <div class="img-box">
          <img :src="temp.avatar" alt="" ref="img" class="avatar" >
          <el-button @click="selectFile" >
             改变头像
          </el-button>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">cancel</el-button>
        <el-button type="primary" 
          :loading="loading" 
           @click="uploadAndSet">{{ confirm_or_progress }}</el-button>
      </div>
    </el-dialog>

    <el-dialog title="verify" :visible.sync="verifyFormVisible">
      <el-form ref="dataForm" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">

        <el-form-item label="名字" prop="name">
          {{ temp.name }}
        </el-form-item>
        <el-form-item label="认证状态" prop="is_verified">
        <el-checkbox v-model="temp.is_verified">是否认证</el-checkbox>
        </el-form-item>
        <el-form-item label="认证标语" prop="phone">
          <el-input v-model="temp.verify_quote"/>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="verifyFormVisible = false">取消</el-button>
        <el-button type="primary" 
           @click="VerifyConfirm">完成</el-button>
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
          <img :src="scope.row.avatar" alt="" class="avatar"  :class="scope.row.avatar ? '' : 'no-src' ">
          
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
      <el-table-column align="center" prop="is_verified" label="认证情况" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.is_verified }}</span>
          <div>{{ scope.row.verify_quote }}</div>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="220">
        <template slot-scope="scope">
          <el-button type="warning" size="small" icon="el-icon-edit" @click="Verify(scope.row)">认证</el-button>
          <el-button v-if="scope.row.edit" type="success" size="small" icon="el-icon-circle-check-outline" @click="confirmEdit(scope.row)">Ok</el-button>
          <el-button v-else type="primary" size="small" icon="el-icon-edit" @click="Edit(scope.row)">编辑</el-button>
        </template>
      </el-table-column>

    </el-table>
  </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getUsers,setUser,verifyUser } from '@/api/user'
import { fromNow } from '@/utils/moment'
import { Message, MessageBox } from 'element-ui'

import { cos, Bucket, Region } from '@/utils/upload'
import data2blob from '@/utils/data2blob'
import request from '@/utils/request'
import {genUID} from '@/utils'

const calendarTypeOptions = [
  { key: 0, display_name: 'wechat' },
  { key: 1, display_name: 'dashboard' },
]

console.log(cos)

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

      
     verifyFormVisible :false,

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
      this.temp = Object.assign(row, {})
      
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

      var ext = this.filename.split('.').slice(-1).pop()
      var key = 'u/' + genUID() + '/' + genUID() + '.' + ext

      cos.sliceUploadFile({
          Bucket: Bucket,
          Region: Region,
          Key: key,
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
    Verify(row){
      this.temp = Object.assign(row, {})
      this.temp.is_verified = this.temp.is_verified ? true : false
      this.verifyFormVisible = true
    },
    VerifyConfirm(){
      this.temp.is_verified = this.temp.is_verified ? 1 : 0
      verifyUser(this.temp)
        .then(res=>{
          Message({
            message: res.msg,
            duration: 3 * 1000
          })
          this.verifyFormVisible = false
          this.getUsers()
        })
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
  width: auto;
  height: auto;
  display:flex;

  justify-content: flex-start;

  img {
    width: 200px;
    height: auto;
  }

}
img.no-src { content:url("data:image/gif;base64,R0lGODlhAQABAPAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="); }
img.avatar {
  width: 48px;
  height: 48px;
  border: 1px solid #EEE;
  background-color: #EEE;
  border-radius:10px;
}

</style>

