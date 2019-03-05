<template>
  <div>
    <div class="flex info-line horz-center">
    </div>

  <el-table v-if="scope.row.answers" :data="scope ? scope.row.answers.results: []" border fit highlight-current-row style="width: 100%">
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
            <span v-if="innerScope.row.content_json==null">{{ innerScope.row.content.substring(0,80) }}</span>
            <span v-else>{{ innerScope.row.content_json.brief.substring(0,80) }}</span>

          </template>
        </el-table-column>
      <el-table-column class-name="select-col" label="Select" width="80">
        <template slot-scope="innerScope">
          <el-tag >{{ innerScope.row.is_selected }}</el-tag>

              <el-button size="mini" v-if="!innerScope.row.is_selected" @click="onSelect(innerScope.row.id, innerScope.$index, scope.$index)">精华</el-button>
              <el-button size="mini" v-else @click="onUnSelect(innerScope.row.id, innerScope.$index, scope.$index)">取消精华</el-button>
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
            </div>
            <div style="display:flex;">
                <el-button size="mini" type="primary" @click="onInnerPass(innerScope.row.id, innerScope.$index, scope.$index)">Pass</el-button>
                <el-button size="mini" type="warning" @click="onInnerReject(innerScope.row.id, innerScope.$index, scope.$index)">Reject</el-button>
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
    onSelect(id, idx, oIdx){
      this.$emit('innerSelect', {id,idx,oIdx})
    },
    onUnSelect(id, idx, oIdx){
      this.$emit('innerUnSelect', {id,idx,oIdx})
    },
    
  }
}
</script>
<style lang="scss">
.info-line {
  height:40px;
  padding: 6px 0;
}
</style>
