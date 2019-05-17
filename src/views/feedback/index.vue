<template>
  <div class="dashboard-container">
    <h1>Feedback</h1>
    <!-- <el-button type="primary" size="small" icon="el-icon-edit" @click="createFeedBack">New</el-button> -->
    

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
          {{ scope.$index }}
        </template>
      </el-table-column>

      <el-table-column label="from" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.from.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="content" >
        <template slot-scope="scope">
          {{ scope.row.content }}
        </template>
      </el-table-column>

      <el-table-column label="is_read" width="100"  align="center">
        <template slot-scope="scope">
          <span >{{ scope.row.is_read }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" prop="created_at" label="created_at" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time"/>
          <span>{{ scope.row.created_at }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="120">
        <template slot-scope="scope">
          <el-button v-if="!scope.row.is_read" type="primary" size="small" icon="el-icon-edit" @click="readFeedBack(scope.row.id,scope.$index)">Read</el-button>
        </template>
      </el-table-column>

    </el-table>
  </div>
  
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getFeedbacks,createFeedBack,readFeedBack } from '@/api/feedback'

export default {
  name: 'Feedback',
  data() {
    return {
      list: null,
      listLoading: true
    }
  },
  methods:{
    createFeedBack(){
      createFeedBack({
        content:'aaaa',
        from_id: 'v5ysfkw700reiq',

      })
    },
    getFeedbacks(){
      getFeedbacks().then(res=>{
        var items = res.feedbacks.results
        this.list = items
        this.listLoading = false
      })
    },
    readFeedBack(id, idx){
      readFeedBack(id).then(res=>{
        console.log(res)
        this.list.splice(idx, 1, res.feedback)
      })

    },
  },
  created(){
    this.getFeedbacks()
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
</style>
