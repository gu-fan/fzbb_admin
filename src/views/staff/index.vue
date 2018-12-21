<template>
  <div class="dashboard-container">
    <h1>Staff</h1>
    <div class="dashboard-text">roles:<span v-for="role in roles" :key="role">{{ role }}</span></div>

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

      <el-table-column label="avatar" width="110" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.avatar }}</span>
        </template>
      </el-table-column>

      <el-table-column label="username" width="100">
        <template slot-scope="scope">
          {{ scope.row.username }}
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
          <span>{{ scope.row.created_at }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="120">
        <template slot-scope="scope">
          <el-button v-if="scope.row.edit" type="success" size="small" icon="el-icon-circle-check-outline" @click="confirmEdit(scope.row)">Ok</el-button>
          <el-button v-else type="primary" size="small" icon="el-icon-edit" @click="scope.row.edit=!scope.row.edit">Edit</el-button>
        </template>
      </el-table-column>

    </el-table>
  </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getStaffs,setPermission } from '@/api/staff'

export default {
  name: 'Staff',
  computed: {
    ...mapGetters([
      'name',
      'roles'
    ])
  },
  data() {
    return {
      list: null,
      listLoading: true
    }
  },
  methods:{
    getStaffs(){
      getStaffs().then(res=>{
        var items = res.staffs.results
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

    }
  },
  created(){
    this.getStaffs()
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
