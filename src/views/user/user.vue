<template>
    <div>
        <common-table :cColumns="cColumns" :apiService="apiService" :productShow="false" ref="childrenMethods">
            <Button slot="create" type="primary" @click="add('formValidate')" v-show="access">Create user</Button>
            <Modal slot="option" v-model="formView"  :title="optionTypeName" width="650px">
                <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="60">
                    <FormItem label="username" prop="username" v-show="access">
                        <Input v-model="formValidate.username" placeholder="Enter your user name"></Input>
                    </FormItem>
                    <FormItem label="email" prop="mail" v-show="access">
                        <Input v-model="formValidate.mail" placeholder="enter email"></Input>
                    </FormItem>
                    <FormItem label="Role" prop="role" v-show="access">
                        <CheckboxGroup v-model="formValidate.role">
                            <Checkbox v-for="item in userInfo.role" :key="item.id" :label="item.id" v-if="item.tag != 1">{{item.name}}</Checkbox>
                        </CheckboxGroup>
                    </FormItem>
                    <FormItem label="product line">
                        <CheckboxGroup v-model="formValidate.product">
                            <Checkbox v-for="item in userInfo.product" :key="item.id" :label="item.id" @click.prevent.native="handleCheckProduct(item.id)">{{item.name}}</Checkbox>
                        </CheckboxGroup>
                    </FormItem>
                    <FormItem label="group" prop="groups">
                        <Transfer
                            :data="originGroup"
                            :target-keys="targetGroup"
                            :list-style="listStyleGroup"
                            :render-format="rendersGroup"
                            :titles = "titlesGroup"
                            filterable
                            @on-change="handleChangeGroup">
                        </Transfer>
                    </FormItem>
                    <FormItem label="ACL" prop="acl">
                        <Transfer
                            :data="originACL"
                            :target-keys="targetACL"
                            :list-style="listStyleACL"
                            :render-format="rendersACL"
                            :titles = "titlesACL"
                            filterable
                            @on-change="handleChangeACL">
                        </Transfer>
                        <CheckboxGroup v-model="formValidate.acl">
                            <Checkbox v-for="item in userInfo.acl" :key="item.id" :label="item.id">{{item.name}}</Checkbox>
                        </CheckboxGroup>
                    </FormItem>
                </Form>
                <div slot="footer">
                    <Button type="ghost" @click="handleReset('formValidate')" style="margin-left: 8px">Reset</Button>
                    <Button type="primary" @click="handleSubmit('formValidate')">submit</Button>
                </div>
            </Modal>
        </common-table>
    </div>
</template>

<script>
    import CommonTable from '../common-components/table/table.vue';
    export default {
        components: {
            CommonTable
        },
        data () {
            return {
                apiService: 'user',
                // delete data
                delId: '',
                delIndex: '',
                // Edit data
                formView: false,
                id: '',
                optionType: '',
                optionTypeName: '',
                readonly: true,
                productId: [],
                userInfo: {
                    product: this.productList(),
                    groups: [],
                    role: this.roleList(),
                    acl: []
                },
                userInfoAll: {
                    groups: [],
                    acl: []
                },
                cColumns: [
                    {
                        title: 'user',
                        key: 'username',
                        sortable: true,
                        render: (h, params) => {
                            return h('div', [
                                h('Tooltip', {
                                    props: {
                                        content: params.row.id,
                                        transfer: true,
                                        placement: 'top-start'
                                    }
                                }, params.row.username)
                            ]);
                        }
                    },
                    {
                        title: 'email',
                        key: 'mail',
                        sortable: true
                    },
                    {
                        title: 'product line',
                        key: 'product',
                        sortable: true,
                        render: (h, params) => {
                            return h('ul', params.row.product.map(item => {
                                return h('li', {
                                    style: {
                                        textAlign: 'left',
                                        padding: '0px'
                                    }
                                }, item.name);
                            })
                            );
                        }
                    },
                    {
                        title: 'Role',
                        key: 'role',
                        sortable: true,
                        render: (h, params) => {
                            return h('ul', params.row.role.map(item => {
                                return h('li', {
                                    style: {
                                        textAlign: 'left',
                                        padding: '0px'
                                    }
                                }, item.name);
                            })
                            );
                        }
                    },
                    {
                        title: 'ACL',
                        key: 'acl',
                        sortable: true,
                        render: (h, params) => {
                            return h('Poptip', {
                                props: {
                                    trigger: 'hover',
                                    placement: 'bottom'
                                }
                            }, [
                                h('Tag', params.row.acl.length),
                                h('div', {
                                    slot: 'content'
                                }, [
                                    h('ul', params.row.acl.map(item => {
                                        return h('li', {
                                            style: {
                                                textAlign: 'center',
                                                padding: '0px'
                                            }
                                        }, item.name);
                                    }))
                                ])
                            ]);
                        }
                    },
                    {
                        title: 'group',
                        key: 'groups',
                        sortable: true,
                        render: (h, params) => {
                            return h('Poptip', {
                                props: {
                                    trigger: 'hover',
                                    placement: 'bottom'
                                }
                            }, [
                                h('Tag', params.row.groups.length),
                                h('div', {
                                    slot: 'content'
                                }, [
                                    h('ul', params.row.groups.map(item => {
                                        return h('li', {
                                            style: {
                                                textAlign: 'center',
                                                padding: '0px'
                                            }
                                        }, item.name);
                                    }))
                                ])
                            ]);
                        }
                    },
                    {
                        title: 'Action',
                        key: 'action',
                        width: 193,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            this.formView = true;
                                            this.optionType = 'edit';
                                            this.optionTypeName = 'edit';
                                            this.id = params.row.id;
                                            this.formValidate.username = params.row.username;
                                            this.formValidate.mail = params.row.mail;
                                            this.originGroup = [];
                                            this.originACL = [];
                                            this.formValidate.product = params.row.product.map(item => {
                                                this.getOriginGroup(item.id);
                                                this.getOriginACL(item.id);
                                                return item.id;
                                            });
                                            this.formValidate.role = params.row.role.map(item => { return item.id; });
                                            this.targetGroup = params.row.groups.map(item => { return item.id; });
                                            this.targetACL = params.row.acl.map(item => { return item.id; });
                                        }
                                    }
                                }, 'edit'),
                                h('Poptip', {
                                    props: {
                                        confirm: true,
                                        title: 'Are you sure you want to delete ' + params.row.username + ' ?',
                                        transfer: true,
                                        placement: 'top-end'
                                    },
                                    on: {
                                        'on-ok': () => {
                                            this.delModal = true;
                                            this.delId = params.row.id;
                                            this.delIndex = params.index;
                                            this.del();
                                        }
                                    }
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'error',
                                            size: 'small'
                                        },
                                        style: {
                                            marginRight: '5px'
                                        }
                                    }, 'delete')
                                ]),
                                h('Poptip', {
                                    props: {
                                        confirm: true,
                                        title: 'Are you sure you want to reset ' + params.row.username + ' Password?',
                                        transfer: true,
                                        placement: 'top-end'
                                    },
                                    on: {
                                        'on-ok': () => {
                                            this.handleResetPassword(params.row.id)
                                        }
                                    }
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'default',
                                            size: 'small'
                                        }
                                    }, 'reset Password')
                                ])
                            ]);
                        }
                    }
                ],
                // form Validation
                formValidate: {
                    username: '',
                    mail: '',
                    product: [],
                    role: []
                },
                ruleValidate: {
                    username: [
                        { required: true, message: 'username cannot be empty', trigger: 'blur' }
                    ],
                    mail: [
                        { required: true, message: 'E-mail can not be empty', trigger: 'blur' },
                        { type: 'email', message: 'Invalid email format', trigger: 'blur' }
                    ],
                    product: [
                        { required: true, type: 'array', min: 1, message: 'Choose at least one', trigger: 'change' }
                    ]
                },
                // Shuttle frame
                originGroup: [],
                targetGroup: [],
                titlesGroup: ['Group to be added', 'Current group'],
                listStyleGroup: {
                    width: '250px',
                    height: '200px'
                },
                originACL: [],
                targetACL: [],
                titlesACL: ['ACL to be added', 'Current ACL'],
                listStyleACL: {
                    width: '250px',
                    height: '200px'
                },
                access: localStorage.menu.includes(101)
            };
        },
        methods: {
            // Call subcomponent to delete
            del () {
                this.$refs.childrenMethods.del(this.delId);
            },
            // Call subcomponent to refresh data
            tableList () {
                this.$refs.childrenMethods.tableList();
            },
            // Call sub-component message notification
            nError (title, info) {
                this.$refs.childrenMethods.nError(title, info);
            },
            // Add impression
            add (name) {
                this.handleReset(name);
                this.optionType = 'add';
                this.optionTypeName = 'add to';
                this.formView = true;
                this.originGroup = [];
                this.targetGroup = [];
                this.originACL = [];
                this.targetACL = [];
            },
            productList () {
                this.axios.get(this.Global.serverSrc + 'product').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.productData = res.data['data'];
                            this.userInfo.product = res.data['data'];
                        } else {
                            this.nError('Get User Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Get Product Failure', errInfo);
                    });
            },
            roleList () {
                this.axios.get(this.Global.serverSrc + 'role').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.userInfo.role = res.data['data'];
                        } else {
                            this.nError('Get Role Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Get Role Failure', errInfo);
                    });
            },
            // form mention
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        // edit
                        let postData = {
                            username: this.formValidate.username,
                            mail: this.formValidate.mail,
                            product: this.formValidate.product,
                            role: this.formValidate.role,
                            groups: this.targetGroup,
                            acl: this.targetACL
                        };
                        if (this.optionType === 'edit') {
                            this.axios.put(this.Global.serverSrc + this.apiService + '/' + this.id,
                                postData).then(
                                res => {
                                    if (res.data['status'] === true) {
                                        this.formView = false;
                                        this.$Message.success('success！');
                                        this.tableList();
                                    } else {
                                        this.nError('Edit Failure', res.data['message']);
                                    }
                                },
                                err => {
                                    let errInfo = '';
                                    try {
                                        errInfo = err.response.data['message'];
                                    } catch (error) {
                                        errInfo = err;
                                    }
                                    this.nError('Edit Failure', errInfo);
                                });
                        } else {
                            // add to
                            this.axios.post(this.Global.serverSrc + this.apiService,
                                postData).then(
                                res => {
                                    if (res.data['status'] === true) {
                                        this.formView = false;
                                        this.$Message.success('success！');
                                        this.tableList();
                                    } else {
                                        this.nError('Add Failure', res.data['message']);
                                    }
                                },
                                err => {
                                    let errInfo = '';
                                    try {
                                        errInfo = err.response.data['message'];
                                    } catch (error) {
                                        errInfo = err;
                                    }
                                    this.nError('Add Failure', errInfo);
                                });
                        }
                    } else {
                        this.$Message.error('Please check the form data！');
                    }
                });
            },
            handleResetPassword (id) {
                this.axios.get(this.Global.serverSrc + this.apiService + '/reset/' + id).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.$Message.success('success！');
                        } else {
                            this.nError('Reset Password Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Reset Password Failure', errInfo);
                    });
            },
            // Form reset
            handleReset (name) {
                this.$refs[name].resetFields();
            },
            // Shuttle frame to get group information of corresponding product line
            getOriginGroup (product) {
                this.axios.get(this.Global.serverSrc + 'groups?product_id=' + product).then(
                    res => {
                        if (res.data['status'] === true) {
                            for (var i = 0; i < res.data['data'].length; i++) {
                                this.originGroup.push({
                                    key: res.data['data'][i]['id'],
                                    label: res.data['data'][i]['name'],
                                    // Used to delete the group corresponding to the product line
                                    product: product
                                });
                            }
                        } else {
                            this.nError('Get Info Failure', res.data['message']);
                        };
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                            if (err.response.status === 404) {
                                this.originGroup = [];
                            } else {
                                this.nError('Get Info Failure', errInfo);
                            }
                        } catch (error) {
                            errInfo = err;
                            this.nError('Get Info Failure', errInfo);
                        }
                    });
            },
            // Shuttle frame to get ACL information of corresponding product line
            getOriginACL (product) {
                this.axios.get(this.Global.serverSrc + 'acl?product_id=' + product).then(
                    res => {
                        if (res.data['status'] === true) {
                            for (var i = 0; i < res.data['data'].length; i++) {
                                this.originACL.push({
                                    key: res.data['data'][i]['id'],
                                    label: res.data['data'][i]['name'],
                                    product: product
                                });
                            }
                        } else {
                            this.nError('Get ACL Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Get ACL Failure', errInfo);
                    });
            },
            // Handling shuttle frame
            handleChangeGroup (newTargetGroup) {
                this.targetGroup = newTargetGroup;
            },
            rendersGroup (item) {
                return item.label;
            },
            handleChangeACL (newTargetACL) {
                this.targetACL = newTargetACL;
            },
            rendersACL (item) {
                return item.label;
            },
            // When selecting different product lines, the corresponding group ACL changes accordingly
            handleCheckProduct (product) {
                // Uncheck
                if (this.formValidate.product.includes(product)) {
                    this.formValidate.product.splice(this.formValidate.product.indexOf(product), 1);
                    // Group operations
                    for (let i = this.originGroup.length - 1; i >= 0; i--) {
                        if (this.originGroup[i]['product'] === product) {
                            // Right group delete
                            if (this.targetGroup.includes(this.originGroup[i]['key'])) {
                                this.targetGroup.splice(this.targetGroup.indexOf(this.originGroup[i]['key']), 1);
                            }
                            // Left group delete
                            this.originGroup.splice(i, 1);
                        }
                    }
                    // ACL Operation
                    for (let i = this.originACL.length - 1; i >= 0; i--) {
                        if (this.originACL[i]['product'] === product) {
                            // Right ACL delete
                            if (this.targetACL.includes(this.originACL[i]['key'])) {
                                this.targetACL.splice(this.targetACL.indexOf(this.originACL[i]['key']), 1);
                            }
                            // Left ACL delete
                            this.originACL.splice(i, 1);
                        }
                    }
                } else {
                    this.formValidate.product.push(product);
                    this.getOriginGroup(product);
                    this.getOriginACL(product);
                }
            }
        }
    };
</script>