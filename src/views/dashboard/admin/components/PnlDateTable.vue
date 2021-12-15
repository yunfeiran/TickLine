<template>
  <div class="pnl-container">
    <el-table
      :data="tableData"
      height="100%"
      :default-sort = "{prop: 'date', order: 'descending'}"
      style="width: 100%">
      <el-table-column
        prop="date"
        label="日期"
        sortable
        width="120">
      </el-table-column>
      <el-table-column
        prop="pnl"
        label="PNL"
        sortable
        width="120">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getDatePnl} from '@/api/tick'

export default {
  props:{
    stock: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    }
  },
  watch: {
    stock: {
      handler(val) {
        this.param.stock = val
        this.getDatePnlData(this.param)
      }
    },
    date: {
      handler(val) {
        this.param.date = val
        this.getDatePnlData(this.param)
      }
    }
  },
  data() {
    return {
      tableData: [],
      param: {
        stock: '',
        date: ''
      }
    }
  },
  created() {
    this.param.stock = this.stock
    this.param.date = this.date
    this.getDatePnlData(this.param)
  },
  methods: {
    getDatePnlData(param) {
      getDatePnl(param).then((res) => {
        if (res.code === 20000 && res.csvdata) {
          this.tableData = res.csvdata.map(item => {
            item.pnl = parseFloat(item.pnl)
            return item
          })
        }else {
          this.tableData = []
        }
      })
    }
  }
}
</script>
<style lang="scss">
  .pnl-container{
    height: 100%;
  }
</style>
