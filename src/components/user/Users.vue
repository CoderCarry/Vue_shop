<template>
  <div>
    <!--面包屑导航-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList()">
            <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
          </el-input>
        </el-col>
        <el-col :span="7">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userlist" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <!-- 修改按钮 -->
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)">
            </el-button>
            <!-- 设置按钮 -->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>

      <!-- 添加用户弹出的对话框 -->
      <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
        <!-- 内容主体区域 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser()">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改用户弹出的对话框 -->
      <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
  export default {
    data() {
      // 验证邮箱规则
      var checkEmail = (rule, value, cb) => {
        // 验证邮箱的正则表达式
        const regEmail = /^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/

        if (regEmail.test(value)) {
          // 合法的邮箱
          return cb()
        }

        cb(new Error('请输入合法的邮箱'))
      }
      // 验证手机号码规则
      var checkMobile = (rules, value, cb) => {
        //  验证手机号码的正则表达式
        const regMobile =
          /^[1](([3][0-9])|([4][5-9])|([5][0-3,5-9])|([6][5,6])|([7][0-8])|([8][0-9])|([9][1,8,9]))[0-9]{8}$/

        if (regMobile.test(value)) {
          return cb()
        }

        cb(new Error('请输入合法的手机号码'))
      }

      return {
        // 获取用户列表的参数对象
        queryInfo: {
          // 搜索关键字
          query: '',
          // 当前的页数
          pagenum: 1,
          // 当前每页显示多少条数据
          pagesize: 2
        },
        // 保存的数据
        userlist: [],
        total: 0,
        // 控制用户对话框的显示与隐藏
        addDialogVisible: false,
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        addFormRules: {
          username: [{
            required: true,
            message: "请输入用户名",
            trigger: 'blur'
          }, {
            min: 3,
            max: 10,
            message: '用户名的长度在3-10之间',
            trigger: 'blur'
          }],
          password: [{
            required: true,
            message: "请输入密码",
            trigger: 'blur'
          }, {
            min: 6,
            max: 15,
            message: '密码的长度在6-15之间',
            trigger: 'blur'
          }],
          email: [{
            required: true,
            message: "请输入邮箱",
            trigger: 'blur'
          }, {
            validator: checkEmail,
            trigger: 'blur'
          }],
          mobile: [{
              required: true,
              message: "请输入手机号码",
              trigger: 'blur'
            },
            {
              validator: checkMobile,
              trigger: 'blur'
            }
          ]
        },
        // 控制修改用户对话框的显示与否
        editDialogVisible: false,
        // 查询到的用户信息对象
        editForm: {},
        editFormRules: {
          email: [{
            required: true,
            message: "请输入邮箱",
            trigger: 'blur'
          }, {
            validator: checkEmail,
            trigger: 'blur'
          }],
          mobile: [{
              required: true,
              message: "请输入手机号码",
              trigger: 'blur'
            },
            {
              validator: checkMobile,
              trigger: 'blur'
            }
          ]
        }
      }
    },
    created() {
      this.getUserList()
    },
    methods: {
      async getUserList() {
        // 发送ajax请求
        const {
          data: res
        } = await this.$http.get('users', {
          params: this.queryInfo
        })
        // 失败信息
        if (res.meta.status !== 200) {
          return this.$message.error('获取用户列表失败')
        }
        // 赋值
        this.userlist = res.data.users
        this.total = res.data.total
        console.log(res)
      },

      // 监听 pagesize 改变的事件
      handleSizeChange(newSize) {
        // console.log(newSize);
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },

      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        // console.log(newPage);
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },

      // 监听switch开关状态的改变
      async userStateChange(userInfo) {
        // console.log(userInfo);
        // 把监听到的信息 发送到服务器中存储起来
        const {
          data: res
        } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        if (res.meta.status !== 200) {
          userInfo.mg_state = !userInfo.mg_state
          return this.$message.error('更新用户状态失败！')
        }
        this.$message.success('更新用户状态成功！')
      },

      // 监听添加用户对话框的关闭事件
      addDialogClosed() {
        // 关闭后会重置表单
        this.$refs.addFormRef.resetFields()
      },

      // 点击按钮，添加新用户
      addUser() {
        // 预校验
        this.$refs.addFormRef.validate(async vaild => {
          // console.log(vaild)
          if (!vaild) return
          // 可以发起添加用户的网络请求了
          const {
            data: res
          } = await this.$http.post('users', this.addForm)

          if (res.meta.status !== 201) {
            return this.$message.error('添加用户失败！')
          }
          this.$message.success('添加用户成功！')
          // 隐藏添加用户的对话框
          this.addDialogVisible = false
          // 重新获取用户列表数据
          this.getUserList()
        })
      },

      // 展示编辑用户的对话框
      async showEditDialog(id) {
        // console.log(id);
        const {
          data: res
        } = await this.$http.get('users/' + id)

        if (res.meta.status !== 200) {
          this.$message.error("查询信息失败")
        }

        this.editForm = res.data
        this.editDialogVisible = true
      },
      editDialogClose() {
        this.$refs.editFormRef.resetFields()
      },
      editUserInfo() {
        this.$refs.editFormRef.validate(async valid => {
          // console.log(valid);  //打印布尔值
          if (!valid) return
          // 发起修改用户信息的请求
          const {
            data: res
          } = await this.$http.put('users/' + this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          })

          if (res.meta.status !== 200) {
            return this.$message.error('更新用户信息失败')
          }

          // 关闭对话框
          this.editDialogVisible = false
          // 重新获取列表
          this.getUserList()
          // 提示修改成功
          this.$message.success('更新用户信息成功')

        })
      },
      // 根据id删除对应的用户信息
      async removeUserById(id) {
        // 弹框询问是否删除用户信息
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        // 如果用户确认删除，返回的就是字符串 confirm
        // 如果用户取消了删除，则返回字符串 cancel
        // console.log(confirmResult);
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消了删除')
        }

        const {
          data: res
        } = await this.$http.delete('users/' + id)

        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败！')
        }

        this.$message.success('删除用户成功！')
        this.getUserList()
      }
    }
  };
</script>

<style lang="less" scoped>
</style>