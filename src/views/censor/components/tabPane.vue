<template>

  <div>

    <div class="flex vert-center" style="height:60px;">
      <div class="f1">
        <el-input :placeholder="type" v-model="listQuery.title" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>
        <el-select v-model="listQuery.censor_status" placeholder="status" clearable class="filter-item" style="width: 130px">
          <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name+'('+item.key+')'" :value="item.key"/>
        </el-select>
        <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">search</el-button>

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
        <innerPane :scope="scope" @innerView="onView" @innerSelect="onInnerSelect" @innerPass="onInnerPass" @innerUnSelect="onInnerUnSelect" @innerReject="onInnerReject"/>
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
          <span v-else>{{ scope.row.brief.substring(0,80) }}</span>

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
        </div>
        <div style="display:flex;">
            <el-button size="mini" type="primary" @click="onPass(scope.row.id, scope.$index)">Pass</el-button>
            <el-button size="mini" type="warning" @click="onReject(scope.row.id, scope.$index)">Reject</el-button>
        </div>
      </template>
    </el-table-column>

  </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="date" prop="timestamp">
          <el-input v-model="temp.timestamp"/>
        </el-form-item>

        <el-form-item label="author" prop="author">
          <el-input v-model="temp.author_id"/>
        </el-form-item>

        <el-form-item label="title" prop="title">
          <el-input v-model="temp.title"/>
        </el-form-item>
        <el-form-item label="content">
          <el-input type="textarea" v-model="temp.content"/>
        </el-form-item>
        
        <el-form-item label="status">
          <el-select v-model="temp.censor_status" class="filter-item" placeholder="Please select">
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">cancel</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">confirm </el-button>
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
            {{ temp.created_at | fromNow }}
          </div>
        </div>

        <div class="content-wrap">
          <div v-if="temp.content!=null" class="content-plain">{{ temp.content }}</div>
          <div v-else v-for="(con,idx) in temp.content_json.data" :key="idx">
            <div v-if="con.t=='text'" class="content-text">{{ con.text }}</div>
            <img  v-else-if="con.t=='img'" :src="con.url" >
          </div>
        </div>

      </div>

      <div slot="footer" class="dialog-footer" style="margin-top:5px;">
        <el-button @click="dialogViewVisible = false">cancel</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">confirm </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getAnswers, getList,Reject,Pass,Select,UnSelect } from '@/api/censor'
import {fromNow} from '@/utils/moment'
import innerPane from './innnerPane'
import {setContentBrief, setBrief} from '@/utils'

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
  data() {
    return {
      calendarTypeOptions,
      expand_list: [],
      list: null,
      listQuery: {
        page: 0,
        limit: 5,
        type: this.type,
        censor_status: null,
        sort: '+id'
      },
      total:0,
      loading: false,

      statusOptions: ['published', 'draft', 'deleted'],
      temp: {
        id: undefined,
        author:{},
        created_at: new Date(),
        title: '',
        content:'',
        content_json:{v:"0",data:[]},
        censor_status: 'published'
      },
      dialogFormVisible: false,
      dialogViewVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create',
        view: 'View'
      },
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },


    }
  },
  created() {
    this.getList()
  },
  methods: {
    handleCreate() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },

    onView(row, idx){
      this.dialogStatus = 'view'
      this.dialogViewVisible = true
      this.temp = row
    },

    onExpand(row, rows){
      // console.log(row)
      // console.log(rows)
      // console.log(this.list.indexOf(row))
      var idx = this.list.indexOf(row)
      if (rows.indexOf(row) != -1) {
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
        console.log("open")
      } else {
        // this.expand_list.splice(this.expand_list.indexOf(res.question.id), 1)
        console.log("close")
      }

    },
    handleFilter() {
      this.listQuery.page = 0
      this.getList()
    },

    onInnerSelect(param){
      var {id,idx,oIdx} = param
      console.log(id)
      console.log(idx)
      console.log(oIdx)
      Select(id, 'answer')
        .then(res=>{
          if (this.type=="question") {
            var ans = setBrief(res.answer)
            this.list[oIdx].answers.results.splice(idx, 1, ans)
          }
        })
    },
    onInnerUnSelect(param){
      var {id,idx,oIdx} = param
      console.log(id)
      console.log(idx)
      console.log(oIdx)
      UnSelect(id, 'answer')
        .then(res=>{
          if (this.type=="question") {
            var ans = setBrief(res.answer)
            this.list[oIdx].answers.results.splice(idx, 1, ans)
          }
        })
    },

    onInnerPass(param){
      var {id,idx,oIdx} = param
      console.log(id)
      console.log(idx)
      console.log(oIdx)
      Pass(id, 'answer')
        .then(res=>{
          if (this.type=="question") {
            var ans = setBrief(res.answer)
            this.list[oIdx].answers.results.splice(idx, 1, ans)
          }

        })
    },

    onInnerReject(param){
      var {id,idx,oIdx} = param
      Reject(id, 'answer')
        .then(res=>{
          if (this.type=="question") {
            var ans = setBrief(res.answer)
            this.list[oIdx].answers.results.splice(idx, 1, ans)
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
    }
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

</style>
