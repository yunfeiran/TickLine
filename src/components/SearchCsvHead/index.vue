<template>
  <div>
    <el-form :inline="true" v-show="!isShowUpload" :model="formInline" class="demo-form-inline">
        <el-form-item label="股票代码">
        <el-autocomplete
            v-model="formInline.stock"
            :fetch-suggestions="querySearchAsync"
            placeholder="请输入股票代码"
            @select="handleSelect"
        ></el-autocomplete>
        </el-form-item>
        <el-form-item label="日期">
        <el-date-picker
            v-model="formInline.date"
            @change="changeDate"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择日期">
        </el-date-picker>
        </el-form-item>
        <el-form-item>
        <!-- <el-button type="primary" @click="onSubmit">查询</el-button> -->
        </el-form-item>
    </el-form>
    <!-- <el-form :inline="true" v-show="isShowUpload" :model="formPath" class="demo-form-inline">
        <el-form-item label="股票tick路径">
        <el-input placeholder="输入新的tick路径" size="medium" style="width: 400px;" v-model="formPath.name"></el-input>
        </el-form-item>
        <el-form-item>
        <el-button type="primary" @click="onSubmit">提交</el-button>
        </el-form-item>
    </el-form>
    <el-switch
        v-model="isShowUpload"
        active-text="修改文件路径"
        @change="changeSearchType"
        inactive-text="按股票代码查询">
    </el-switch> -->
  </div>
</template>

<script>
import { getStockList, getPath, saveNewPath} from '@/api/tick'
export default {
  props: {
    date: {
      type: String,
      default: ''
    },
    stock: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      formPath: {
        name: '',
        trdurl: ''
      },
      formInline: {
        stock: '',
        date: ''
      },
      isShowUpload: false
    }
  },
  methods: {
    async goQuerySearch() {
      let searchStock = this.formInline.stock;
      const params = {
        querystr: searchStock.replace(/\s+/g,"")
      }
      const res = await getStockList(params)
      if (res.code === 20000 && res.stocks) {
        let stocks = res.stocks;
        let assiStocks = stocks.map(item=>{
          return {
            "value": item,
            "address": item.split(' ')[1]
          }
        })
        // return assiStocks;
        this.restaurants = assiStocks;
      } else {
        // return [];
        this.restaurants = [];
      }
    },
    async querySearchAsync(queryString, cb) {
      // var restaurants = await this.goQuerySearch();
      var results = queryString ? this.restaurants.filter(this.createStateFilter(queryString)) : this.restaurants;
      cb(results);
    },
    createStateFilter(queryString) {
      return (state) => {
        return (state.value.indexOf(queryString) >= 0);
      };
    },
    handleSelect() {
      this.parentGetData();
    },
    changeDate(){
      this.parentGetData();
    },
    changeSearchType(value){
      this.isShowUpload = value
    },
    getTickPath(){
      getPath().then((response) => {
        if (response.code === 20000) {
          let path = response.path.split("'")[1];
          let arr = path.split(";");
          this.formPath.name = arr[0].split('=')[1];
          this.formPath.trdurl = arr[1].split('=')[1];
        }
      })
    },
    onSubmit() {
      this.sendNewPath();
    },
    sendNewPath(){
      const params = {
        tickpath: this.formPath.name,
        trdpath: this.formPath.trdurl
      }
      saveNewPath(params).then((response) => {
        if (response.code === 20000) {
          this.$message({
            message: '修改地址成功',
            type: 'success',
            duration: 1000
          });
          this.changeSearchType(false);
          let path = response.newPath.split("'")[1];
          let arr = path.split(";");
          this.formPath.name = arr[0].split('=')[1];
          this.formPath.trdurl = arr[1].split('=')[1];
          setTimeout(()=>{
            // this.getData()
          },100)
          
        }
      })
    },
    parentGetData() {
      this.$emit('getTickData', this.formInline)
    }
  },
  created(){
    this.formInline.stock = this.stock
    this.formInline.date = this.date
  },
  mounted(){
    this.goQuerySearch();
    this.getTickPath();
  }
}
</script>

<style lang="scss" >

</style>
