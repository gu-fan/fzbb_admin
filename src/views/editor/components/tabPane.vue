<template>
  <div>

    <div class="flex vert-center" style="height:60px;">
      <div class="f1">
        <el-input :placeholder="type" v-model="listQuery.title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
        <el-select v-model="listQuery.censor_status" placeholder="status" clearable class="filter-item" style="width: 130px">
          <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name+'('+item.key+')'" :value="item.key"/>
        </el-select>
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">search</el-button>

      <el-button class="filter-item" style="margin-left: 10px;"  @click="handleCreate" type="primary" icon="el-icon-edit" >add </el-button>

      </div>
      <div>
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
  <el-table :data="list" border fit highlight-current-row style="width: 100%" @expand-change="onExpand" ref="main" >

    <el-table-column type="expand" v-if="type=='question'">
      <template slot-scope="scope">
        
        <innerPane  :scope="scope" @innerView="onView" @innerPass="onInnerPass" @innerReject="onInnerReject" @innerEdit="onInnerEdit" @addAnswer="addAnswer"/>
      </template>
    </el-table-column>

    <el-table-column
      v-loading="loading"
      align="center"
      label="ID"
      width="65"
      element-loading-text="请给我点时间！">
      <template slot-scope="scope">
        <span>{{ scope.row.id }}</span>
      </template>
    </el-table-column>

    <template v-if="type=='question'">
      <el-table-column width="140px" label="Title">
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
    </template>
    <template v-if="type=='answer'">
      <el-table-column width="140px" label="Question">
        <template slot-scope="scope">
          <span>{{ scope.row.question.title }}</span>
        </template>
      </el-table-column>
    </template>

    <el-table-column width="80px" align="center" label="Date">
      <template slot-scope="scope">
        <span>{{ scope.row.created_at|fromNow }}</span>
      </template>
    </el-table-column>

    <el-table-column width="110px" align="center" label="Author">
      <template slot-scope="scope">
        <span>{{ scope.row.author && scope.row.author.name }}</span>
      </template>
    </el-table-column>

    <el-table-column align="center" label="Content" min-width="95">
      <template slot-scope="scope">
          <span v-if="scope.row.content_json==null">{{ scope.row.content.substring(0,80) }}</span>
          <span v-else>{{ scope.row.content_json.brief.substring(0,80) }}</span>
      </template>
    </el-table-column>

    <el-table-column class-name="status-col" label="Status" width="80">
      <template slot-scope="scope">
        <el-tag :type="scope.row.censor_status | statusFilter ">{{ scope.row.censor_status }}</el-tag>

      </template>
    </el-table-column>

    <el-table-column class-name="status-col" label="Action" width="160">
      <template slot-scope="scope">
        <div class="flex horz-center" style="padding:6px 0;">
            <el-button size="mini"  @click="onView(scope.row, scope.$index)">View</el-button>
            <el-button size="mini" v-if="scope.row.author && scope.row.author.r_type==1" @click="onEdit(scope.row, scope.$index)">Edit</el-button>
        </div>
        <div style="display:flex;">
        </div>
      </template>
    </el-table-column>

  </el-table>

    <el-dialog class="content-form" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :rules="rules" :model="temp" label-position="left" label-width="70px" style="min-width: 400px; margin-left:50px;" ref="dialogForm">

        <el-form-item v-if="/edit/i.test(dialogStatus)" label="name" prop="name">
          {{ temp.author.name}}
        </el-form-item>
        <el-form-item v-else label="作者" class="postInfo-container-item" prop="author_id">
          <el-select v-model="temp.author_id" :remote-method="getRemoteUserList" filterable remote placeholder="搜索作者" @focus="getRemoteUserList">
            <el-option v-for="(item,index) in userListOptions" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>

        <div v-if="temp.author && temp.author.r_type==0">
          not editable
          <el-form-item v-if="/question/i.test(dialogStatus)" label="问题标题" prop="title">
            {{ temp.title }}
          </el-form-item>
          <el-form-item label="问题内容" prop="content">
            {{ temp.content }}
          </el-form-item>
        </el-form-item>
        </div>

        <div v-else>

         {{ focus_item }}

          <el-form-item v-if="/question/i.test(dialogStatus)" label="问题标题" prop="title">
            <el-input v-model="temp.title"/>
          </el-form-item>
          <el-form-item label="问题内容" prop="content">
             <el-input v-if="temp.content_json==null"
                :rows="5"
               type="textarea" v-model="temp.content"/>

          <div v-else class="content-wrap" >
            <div v-for="(con,idx) in temp.content_json.data" :key="idx">
              <el-input type="textarea"  v-if="con.t=='text'" class="content-text" v-model="con.text" rows=5 maxlength=-1 placeholder="  " cursor-spacing=20  @focus.stop="focusText(idx, $event)" autosize />
              <img v-else-if="con.t=='img'" :src="con.url" alt="" mode="widthFix"  @click.stop="focusImg(idx, $event)">
              <div class="img-del-btn" :class='focus_img == idx ? "show" : "hide"'  @click="delImage(idx)"  v-if="con.t=='img'">删除图片</div>
            </div>
          </div>
          
          <input id="file-selector" type="file" v-show="false" @change="onChange" ref="upload">

        <div class="img-box">
          <img :src="temp.avatar" alt="" ref="img" class="avatar">
        </div>
          <el-button 
            :loading="upload_loading" 
            @click="addImage">{{ confirm_or_progress }}</el-button>

          </el-form-item>
        </el-form-item>

        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">cancel</el-button>
        <el-button type="primary" @click="dialogConfirm">confirm </el-button>
      </div>
    </el-dialog>

    <el-dialog title="View" :visible.sync="dialogViewVisible">
      <div>
        <div class="flex">
        <div class="f1" style="font-size:18px;font-weight:bold;padding:5px 0;">
          <span v-if="temp.title">
            {{ temp.title }}
          </span>
          <span v-else>
            回答： {{ temp.question && temp.question.title }}
          </span>
        </div>
          <div >
            <el-tag size="small" :type="temp.censor_status | statusFilter ">{{ temp.censor_status }}</el-tag>
          </div>
        </div>
        <div class="flex">
          <div v-if="temp.author" class="f1">
            from {{ temp.author.name }}
          </div>
        <div>
            {{ temp.created_at|fromNow }}
          </div>
        </div>

        <div class="content-wrap">
          <div v-if="temp.content_json==null" class="content-plain">{{ temp.content }}</div>
          <div v-else v-for="(con,idx) in temp.content_json.data" :key="idx">
            <div v-if="con.t=='text'" class="content-text">{{ con.text }}</div>
            <img  v-else-if="con.t=='img'" :src="con.url" >
          </div>
        </div>

      </div>

      <div slot="footer" class="dialog-footer" style="margin-top:5px;">
        <el-button @click="dialogViewVisible = false">cancel</el-button>
        <el-button type="primary" @click="dialogViewVisible = false">confirm </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getAnswers, getList,Reject,Pass } from '@/api/censor'
import {fromNow} from '@/utils/moment'
import innerPane from './innnerPane'
import { getUsers, getUsersByName } from '@/api/user'
import { editQuestion, editAnswer, createAnswer, createQuestion } from '@/api/censor'

import {setContentBrief, setBrief, genUID} from '@/utils'

import request from '@/utils/request'
import { cos, Bucket, Region } from '@/utils/upload'
import data2blob from '@/utils/data2blob'

const calendarTypeOptions = [
  { key: 'all', display_name: 'All' },
  { key: 'waiting', display_name: 'Waiting' },
  { key: 'pass', display_name: 'Pass' },
  { key: 'reject', display_name: 'Reject' },
  { key: 'reject_review', display_name: 'Review' },
]


export default {
  components: { innerPane },
  filters: {
    fromNow,
    statusFilter(status) {
      const statusMap = {
        pass: 'success',
        reject: 'danger',
      }
      return statusMap[status]
    }
  },
  props: {
    type: {
      type: String,
      default: 'question'
    }
  },
  computed: {
    confirm_or_progress(){
      if (this.upload_loading) {
        return (this.progress * 100) + "%"
      } else {
        return "upload"
      }
    },
  },
  data() {
    return {
      calendarTypeOptions,
      expand_list: [],
      list: null,
      listQuery: {
        page: 0,
        author_type: 1,
        limit: 5,
        type: this.type,
        censor_status: null,
        sort: '+id'
      },
      total:0,
      loading: false,

      progress: 0,
      upload_loading: false,

      focus_item: -1,
      focus_img: -1,

      userListOptions: [],

      statusOptions: ['published', 'draft', 'deleted'],
      temp: {
        id: undefined,
        author_id:'',
        title: '',
        content:'',
        content_json: {v:"0",data:[{text:"",t:"text"}]}
      },
      dialogFormVisible: false,
      dialogViewVisible: false,
      dialogStatus: '',

      textMap: {
        question: 'question',
        editQuestion: 'editQuestion',
        answer: 'answer'
      },
      rules: {
        content_json: {required:true},
        title: {required:true},
        author_id: {required:true},
      },


    }
  },
  created() {
    this.getList()
  },
  methods: {

    onView(row, idx){

      this.dialogStatus = 'view'
      this.dialogViewVisible = true
      this.temp = row

    },
    onInnerEdit(row, idx){
        this.dialogStatus = 'editAnswer'
        this.dialogFormVisible = true
        this.temp = row
    },
    onEdit(row, idx) {

      if (this.type=='question') {
        this.dialogStatus = 'editQuestion'
      } else {
        this.dialogStatus = 'editAnswer'
      }

      this.dialogFormVisible = true
      this.temp = row
    },

    onExpand(row, rows){

      var idx = this.list.indexOf(row)
      if (rows.indexOf(row) != -1) {    // we are open expanding
        console.log("open")
        if (this.type == 'question') {
          getAnswers(row.id)
            .then(res=>{

              var answers = res.answers
              answers.page = 0

              answers.results = setContentBrief(answers.results)
              this.$set(this.list[idx], 'answers', answers)
              console.log(answers)

              // double expansion
              // this.$refs.main.toggleRowExpansion(this.list[idx], true)
              // this.expand_list.push(res.question.id)
            })
        }
      } else {
        // this.expand_list.splice(this.expand_list.indexOf(res.question.id), 1)
        console.log("close")
      }

    },

    handleFilter() {
      this.listQuery.page = 0
      this.getList()
    },

    onInnerPass(param){
      var {id,idx,oIdx} = param
      Pass(id, 'answer')
        .then(res=>{
          if (this.type=="question") {
            this.list[oIdx].answers.results.splice(idx, 1, res.answer)
          }
        })
    },

    onInnerReject(param){
      var {id,idx,oIdx} = param
      Reject(id, 'answer')
        .then(res=>{
          if (this.type=="question") {
            this.list[oIdx].answers.results.splice(idx, 1, res.answer)
          }
        })
    },
    
    onPass(id, idx){
      Pass(id, this.type)
        .then(res=>{
          if (this.type=="question") {
            this.list.splice(idx, 1, res.question)
          } else {
            this.list.splice(idx, 1, res.answer)
          }
        })
    },
    onReject(id, idx){
      Reject(id, this.type)
        .then(res=>{
          if (this.type=="question") {
            this.list.splice(idx, 1, res.question)
          } else {
            this.list.splice(idx, 1, res.answer)
          }
        })
    },
    getList() {
      this.loading = true
      this.$emit('create')  // for test
      getList(this.listQuery).then(data=> {
        if (this.type == 'question') {
          this.total = data.questions.total 

          var list = data.questions.results
          // make answers reactive since first get it
          this.list = list.map(item=>{
            item.answers = []
            return item
          })

        } else {
          this.total = data.answers.total
          
          this.list = setContentBrief(data.answers.results)
        }
        this.loading = false
        console.log(this.total)
      })
    },

    handleCurrentChange(val) {
      this.listQuery.page = parseInt(val) -1
      this.getList()
    },

    getRemoteUserList(name) {
      if (typeof name == 'object') {
        name = ''
      }
      getUsers({name, r_type:1}).then(res=> {
        if (!res.users) return
        this.userListOptions = res.users.results
      })
    },

    handleCreate() {
      this.dialogStatus = 'question'
      this.dialogFormVisible = true
      this.temp= {
        id: undefined,
        author_id:'',
        title: '',
        content:'',
      }
    },
    createQuestion() {
      createQuestion(this.temp)
        .then(res=>{
          console.log(res)
          this.dialogFormVisible = false
        })
    },
    addAnswer(id){
      this.temp = {
        question_id:id,
        author_id:null,
        content:'',
        content_json: {v:"0",data:[
          {text:"",t:"text"},
        ]}
      }
      this.dialogStatus = 'answer'
      this.dialogFormVisible = true
      
    },
    createAnswer() {

      createAnswer(this.temp)
        .then(res=>{
          console.log(res)
          var idx=-1
          this.list.some((item,_idx)=>{
            if (item.id == this.temp.question_id ) {
              idx = _idx
              return true
            } else {
              return false
            }
          })
          console.log(this.temp.question_id)
          console.log(idx)
          var answer = setBrief(res.answer)
          this.list[idx].answers.results.splice(0, 0, res.answer)
          this.dialogFormVisible = false
        })

    },

    editQuestion(){
      editQuestion(this.temp)
        .then(res=>{
          console.log(res)
          this.dialogFormVisible = false
        })
    },
    editAnswer(){
      editAnswer(this.temp)
        .then(res=>{
          console.log(res)
          this.dialogFormVisible = false
        })
    },

    dialogConfirm(){
      this.$refs.dialogForm.validate(valid => {
        if (valid) {
          if (this.dialogStatus == 'question'){
            this.createQuestion()
          } else if (this.dialogStatus == "answer"){
            this.createAnswer()
          } else if (this.dialogStatus == "editQuestion"){
            this.editQuestion()
          } else if (this.dialogStatus == "editAnswer"){
            this.editAnswer()
          }
        }
      })
      
    },
    addImage(){
      console.log("add image")
      this.$refs.upload.click()
    },

    onChange(e){

        var file = this.$refs.upload.files[0];
        if (!file) return;

          var fr = new FileReader()

          fr.onload = (e) =>{
            this.sourceImgUrl = fr.result
            var img = this.$refs.img
            img.src = this.sourceImgUrl
            var f = data2blob(this.sourceImgUrl, 'image/png')
            this.filename = file.name
            this.file = f
            console.log('loaded')
            this.uploadFile()
        }

        fr.readAsDataURL(file);

    },

    uploadFile(){
      if (this.upload_loading) {
        console.log("loading")
        return
      }
      if (!this.file) {
        console.log("file empty")
        return
      }
      
      var that = this
      this.upload_loading = true

      var ext = this.filename.split('.').slice(-1).pop()
      var key = 'p/' + genUID() + '/' + genUID() + '.' + ext

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
      }, (err, data)=> {
        console.log(data)

        that.upload_loading = false

        if (err) {
          console.log(err)
          return
        }

        // fzbb-1257828075.file.myqcloud.com
        // http://fzbb-1257828075.cos.ap-shanghai.myqcloud.com/IMG_0054.JPG

        var cdn = data.Location.replace("cos.ap-shanghai", "file")
        var cdn_url = "http://" + cdn

        if (this.isFirstLineEmptyText()){
          this.removeFirstLine()
        }

        if (this.focus_item==this.temp.content_json.data.length-1 || this.focus_item == -1) {
          console.log("add empty")

          if (this.isLastLineEmptyText()){
            this.removeLastLine()
          }
          this.temp.content_json.data.push(
              {t:'img',url:cdn_url, loading:true}
          )
          if (this.focus_item != -1) {
            this.focus_item++
          } else {
            this.focus_item = this.temp.content_json.data.length-2
          }
        } else {
          this.temp.content_json.data.splice(this.focus_item+1, 0,
              {t:'img',url:cdn_url, loading:true}
          )
          this.focus_item++
        }
        if (this.isLastLineImage()){
          this.addEmptyTextLine()
        }

       this.$refs.upload.value = ''

      });
    },
    addEmptyTextLine(){
      this.temp.content_json.data.push(
          {t:'text', text:''},
      )
    },
    isFirstLineEmptyText(){
      var len = this.temp.content_json.data.length
      if (len==0)  return false
      if (this.temp.content_json.data[0].t == 'text' && this.temp.content_json.data[0].text == '') {
        return true
      } else {
        return false
      }
    },
    removeFirstLine(){
        this.temp.content_json.data.splice(0,1);
    },
    removeLastLine(){
        this.temp.content_json.data.splice(-1,1);
    },
    isLastLineImage(){
      var len = this.temp.content_json.data.length
      if (len==0)  return true
      if (this.temp.content_json.data[len-1].t == 'img') {
        return true
      } else {
        return false
      }
    },
    isLastLineEmptyText(){
      var len = this.temp.content_json.data.length
      if (len==0)  return true
      if (this.temp.content_json.data[len-1].t == 'text' && this.temp.content_json.data[len-1].text == '') {
        return true
      } else {
        return false
      }
    },
    combineTextLines(){
      var arr = []
      this.temp.content_json.data.reduce((a,b)=>{
        var len = a.length
        if (len>=1) {
          if (a[len-1].t=="text" && b.t=="text") {
            a[len-1].text += "\n" +b.text
          } else {
            arr.push(b)
          }
        } else {
            arr.push(b)
        }
        return arr
      }, arr)

      this.temp.content_json.data = arr
    },
    focusText(idx,e){
      console.log("text")
      this.focus_img = -1
      this.focus_item = idx
    },
    focusImg(idx,e){
      this.focus_img = idx
      this.focus_item = idx
    },
    delImage(idx){
        this.focus_img = -1
        this.focus_item = idx > 0 ? idx-1: 0
        this.temp.content_json.data.splice(idx,1);
        this.combineTextLines()
    },

  }
}
</script>
<style>
.content-wrap {
  background-color:#FFF;
  min-height:200px;
  padding: 15px 0 25px;

}
.content-text {
  white-space:pre-wrap;
}
.content-wrap > div{
  padding:0;
  margin:0;
  position:relative;
}
.content-wrap img {
  width: 100%;
  height: auto;
  display:block;
  margin:0;
}
.content-plain {
  margin-top:12px;padding:12px 0;border-bottom:1px solid #F1F1F1;border-top:1px solid #F1F1F1;
  white-space:pre-wrap;
}
.img-box img {
  width: 20px;
  height:auto;
}
.hide {
  display:none;
}
.img-del-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255,255,255,0.8);
  border-radius: 5px;
  padding: 6px;
  font-size:14px;
  color: #666;
}

.content-form .el-dialog {
  width: 80%;
}
.content-form .el-textarea__inner {
  border-radius: 0;
}
</style>

