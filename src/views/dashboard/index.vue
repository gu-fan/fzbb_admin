<template>
  <div class="dashboard-container">
    <template v-if="lineChartData">
    <panel-group :startCount='lastWeekCount' :endCount='thisWeekCount' @handleSetLineChartData="handleSetLineChartData"/>

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData[using]"/>
    </el-row>
    </template>
  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'

import { ping } from '@/api/dashboard'

import { mapGetters } from 'vuex'


export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name',
      'roles'
    ])
  },
  components: {
    PanelGroup,
    LineChart,
  },
  computed: {
    thisWeekCount(){
      var k = Object.keys(this.lineChartData).map(item=>{
        var it = this.lineChartData[item].thisWeekData.reduce((a,b)=>{
          return a + b
        }, 0)
        return it
      })
      console.log(k)

      return Object.keys(this.lineChartData).map(item=>{
        var it = this.lineChartData[item].thisWeekData.reduce((a,b)=>{
          return a + b
        }, 0)
        return it
      })

    },
    lastWeekCount(){

      var k = Object.keys(this.lineChartData).map(item=>{
        var it = this.lineChartData[item].lastWeekData.reduce((a,b)=>{
          return a + b
        }, 0)
        return it
      })
      console.log(k)

      return Object.keys(this.lineChartData).map(item=>{
        var it = this.lineChartData[item].lastWeekData.reduce((a,b)=>{
          return a + b
        }, 0)
        return it
      })
    }
  },
  data() {
    return {
      lineChartData:null ,
      using: 'UserNew',
    }
  },
  mounted(){
    ping()
      .then(res=>{
        console.log(res)
        this.lineChartData = res.ChartData
      })
  },
  methods: {
    handleSetLineChartData(type) {
      this.using = type
    }
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
