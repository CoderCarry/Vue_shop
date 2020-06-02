<template>
    <div>
        <!--面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>角色管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片区域 -->
        <el-card>
            <!-- 添加角色按钮区域 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="roleDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>

            <!-- 角色列表区域 -->
            <el-table :data="rolelist" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <pre>
                            {{scope.row}}
                        </pre>
                    </template>
                </el-table-column>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit" @click="editRoleById(scope.row.id)">编辑
                        </el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete"
                            @click="removeRoleById(scope.row.id)">删除</el-button>
                        <el-button size="mini" type="warning" icon="el-icon-setting">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 添加角色卡片区域 -->
            <el-dialog title="添加角色" :visible.sync="roleDialogVisible" width="50%" @close="roleDialogClosed">
                <el-form :model="roleRuleForm" :rules="roleRules" ref="roleFormRef" label-width="100px">
                    <el-form-item label="角色名称" prop="roleName">
                        <el-input v-model="roleRuleForm.roleName"></el-input>
                    </el-form-item>
                    <el-form-item label="角色描述" prop="roleDesc">
                        <el-input v-model="roleRuleForm.roleDesc"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="roleDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addRole()">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 编辑角色弹出的对话框 -->
            <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClose">
                <el-form :model="editRoleForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                    <el-form-item label="角色名称">
                        <el-input v-model="editRoleForm.roleName" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="角色描述" prop="roleDesc">
                        <el-input v-model="editRoleForm.roleDesc"></el-input>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editRoleInfo">确 定</el-button>
                </span>
            </el-dialog>

        </el-card>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                // 所有角色列表
                rolelist: [],
                // 控制角色对话框的显示与隐藏
                roleDialogVisible: false,
                roleRuleForm: {
                    roleName: '',
                    roleDesc: ''
                },
                roleRules: {
                    roleName: [{
                        required: true,
                        message: "请输入角色名称",
                        trigger: 'blur'
                    }, {
                        min: 3,
                        max: 10,
                        message: '用户名的长度在3-10之间',
                        trigger: 'blur'
                    }],
                    roleDesc: [{
                        required: true,
                        message: "请输入角色描述",
                        trigger: 'blur'
                    }, {
                        min: 3,
                        max: 10,
                        message: '角色描述的长度在5-10之间',
                        trigger: 'blur'
                    }]
                },
                // 控制编辑角色对话框的显示与隐藏
                editDialogVisible: false,
                // 获取到的角色数据存在这
                editRoleForm: {},
                editFormRules: {
                    roleDesc: [{
                        required: true,
                        message: "请输入角色描述",
                        trigger: 'blur'
                    }, {
                        min: 3,
                        max: 10,
                        message: '角色描述的长度在5-10之间',
                        trigger: 'blur'
                    }]
                },
            }
        },
        created() {
            this.getRoleList()
        },
        methods: {
            // 获取所有用户列表
            async getRoleList() {
                const {
                    data: res
                } = await this.$http.get('roles')

                // 失败的情况
                if (res.meta.status !== 200) {
                    this.$message.error('获取用户列表失败')
                }
                // 成功的情况
                this.rolelist = res.data
            },
            // 关闭后会重置表单
            roleDialogClosed() {
                this.$refs.roleFormRef.resetFields()
            },

            // 点击按钮添加角色
            addRole() {
                // 预校验
                this.$refs.roleFormRef.validate(async valid => {
                    // console.log(valid);
                    if (!valid) return

                    const {
                        data: res
                    } = await this.$http.post('roles', this.roleRuleForm)

                    if (res.meta.status !== 201) {
                        return this.$message.error('添加角色失败！')
                    }

                    this.$message.success('添加角色成功！')
                    this.roleDialogVisible = false
                    this.getRoleList()
                })

            },

            // 点击按钮删除角色
            async removeRoleById(id) {
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
                } = await this.$http.delete('roles/' + id)

                if (res.meta.status !== 200) {
                    return this.$message.error('删除用户失败！')
                }

                this.$message.success('删除用户成功！')
                this.getRoleList()
            },

            // 展示编辑角色对话框
            async editRoleById(id) {
                // console.log(id);
                const {
                    data: res
                } = await this.$http.get('roles/' + id)

                if (res.meta.status !== 200) {
                    this.$message.error("查询信息失败")
                }

                this.editRoleForm = res.data
                this.editDialogVisible = true
            },

            editDialogClose() {
                this.$refs.editFormRef.resetFields()
            },

            // 点击按钮编辑角色列表
            editRoleInfo() {
                // 预验证
                this.$refs.editFormRef.validate(async valid => {
                    // console.log(valid);
                    if (!valid) return

                    const {
                        data: res
                    } = await this.$http.put('roles/' + this.editRoleForm.roleId, {
                        roleName: this.editRoleForm.roleName,
                        roleDesc: this.editRoleForm.roleDesc
                    })

                    console.log(res);

                    if (res.meta.status !== 200) {
                        return this.$message.error('更新用户信息失败')
                    }

                    this.editDialogVisible = false
                    this.getRoleList()
                    // 提示修改成功
                    this.$message.success('更新用户信息成功')
                })
            }
        },
    }
</script>

<style lang="less" scoped>

</style>