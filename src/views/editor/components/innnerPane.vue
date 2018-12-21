<template>
  <div>
    <div class="flex info-line horz-center">
      <el-button class="filter-item" style="margin-left: 10px;" size="mini" type="primary" icon="el-icon-edit" @click="addAnswer(scope.row)">add</el-button>
    </div>

    <el-table v-if="scope.row.answers.results && scope.row.answers.results.length" :data="scope ? scope.row.answers.results: []" border fit highlight-current-row style="width: 100%">
    <template >
        <el-table-column
          align="center"
          label="ID"
          width="65" >
          <template slot-scope="innerScope">
            <span>{{ innerScope.row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column width="110px" align="center" label="Author">
          <template slot-scope="innerScope">
            <!-- {{ innerScope.row.author }} -->
            <span>{{ innerScope.row.author && innerScope.row.author.name }}</span>
          </template>
        </el-table-column>

        <el-table-column width="80px" align="center" label="Date">
          <template slot-scope="innerScope">
            <span>{{ innerScope.row.created_at|fromNow }}</span>
          </template>
        </el-table-column>
        <el-table-column  label="Content">
          <template slot-scope="innerScope">
            <span>{{ innerScope.row.content.substring(0,40) }}</span>
          </template>
        </el-table-column>
        
      <el-table-column class-name="status-col" label="Status" width="80">
        <template slot-scope="innerScope">
          <el-tag :type="innerScope.row.censor_status | statusFilter ">{{ innerScope.row.censor_status }}</el-tag>

        </template>
      </el-table-column>
        <el-table-column class-name="status-col" label="Action" width="160">
          <template slot-scope="innerScope">
        <div class="flex horz-center" style="padding:6px 0;">
              <el-button size="mini"  @click="onView(innerScope.row, innerScope.$index)">View</el-button>
              <el-button size="mini" v-if="innerScope.row.author && innerScope.row.author.r_type==1" @click="onEdit(innerScope.row, innerScope.$index)">Edit</el-button>
            </div>
            <div style="display:flex;">
            </div>
          </template>
        </el-table-column>
    </template>
    
  </el-table>
  </div>

</template>
<script>
import {fromNow} from '@/utils/moment'
import { getAnswers, getList,Reject,Pass } from '@/api/censor'
export default {
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
    scope: {}
  },
  methods:{
    onInnerPass(id, idx, oIdx){
      this.$emit('innerPass', {id,idx,oIdx})
    },
    onInnerReject(id, idx, oIdx){
      this.$emit('innerReject', {id,idx,oIdx})
    },
    onView(row, idx){
      this.$emit('innerView', row)
    },
    onEdit(row, idx){
      this.$emit('innerEdit', row, idx)
    },
    addAnswer(row) {
      console.log(row.id)
      this.$emit('addAnswer', row.id)
    }
  }
}
</script>
<style lang="scss">
.info-line {
  height:40px;
  padding: 6px 0;
}
</style>
