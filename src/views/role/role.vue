<template>
    <div>
        <common-table :cColumns="cColumns" :apiService="apiService" @getProductEvent="getProductEvent" :productShow="false" ref="childrenMethods">
            <Button slot="create" type="primary" @click="add('formValidate')">Create a Role</Button>
            <Modal slot="option" v-model="formView"  :title="optionTypeName">
                <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="60">
                    <FormItem label="Role Name" prop="name">
                        <Input v-model="formValidate.name" placeholder="Enter your user name"></Input>
                    </FormItem>
                    <FormItem label="description" prop="description">
                        <Input v-model="formValidate.description" placeholder="Enter description"></Input>
                    </FormItem>
                    <FormItem label="Logo" prop="tag">
                        <InputNumber v-model="formValidate.tag" :readonly="readonly" :min="20"></InputNumber>
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
                apiService: 'role',
                // delete data
                delId: '',
                delIndex: '',
                // Edit data
                formView: false,
                id: '',
                optionType: '',
                optionTypeName: '',
                readonly: true,
                cColumns: [
                    {
                        title: 'Role Name',
                        key: 'name',
                        sortable: true,
                        render: (h, params) => {
                            return h('div', [
                                h('Tooltip', {
                                    props: {
                                        content: params.row.id,
                                        transfer: true,
                                        placement: 'top-start'
                                    }
                                }, params.row.name)
                            ]);
                        }
                    },
                    {
                        title: 'description',
                        key: 'description',
                        sortable: true
                    },
                    {
                        title: 'Logo',
                        key: 'tag',
                        sortable: true
                    },
                    {
                        title: 'Action',
                        key: 'action',
                        width: 123,
                        align: 'center',
                        render: (h, params) => {
                            let buttonDisabled = false;
                            // The default role cannot be edited and deleted
                            if ([0, 1, 2, 3, 4].indexOf(params.row.tag) > -1) {
                                buttonDisabled = true;
                            }
                            return h('div', [
                                h('Button', {
                                    props: {
                                        type: 'primary',
                                        disabled: buttonDisabled,
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
                                            this.formValidate = params.row;
                                            this.readonly = true;
                                        }
                                    }
                                }, 'edit'),
                                h('Poptip', {
                                    props: {
                                        confirm: true,
                                        title: 'Are you sure you want to delete ' + params.row.name + ' ?',
                                        transfer: true,
                                        placement: 'top-end'
                                    },
                                    on: {
                                        'on-ok': () => {
                                            this.delId = params.row.id;
                                            this.delIndex = params.index;
                                            this.del();
                                        }
                                    }
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'error',
                                            disabled: buttonDisabled,
                                            size: 'small'
                                        }
                                    }, 'delete')
                                ])
                            ]);
                        }
                    }
                ],
                // form Validation
                formValidate: {
                    name: '',
                    description: '',
                    tag: 20
                },
                ruleValidate: {
                    name: [
                        { required: true, message: 'Role name cannot be empty', trigger: 'blur' }
                    ],
                    description: [
                        { required: true, message: 'Description cannot be empty', trigger: 'blur' }
                    ]
                }
            };
        },
        methods: {
            getProductEvent: function (productData, productId) {
                this.productData = productData;
                this.productId = productId;
            },
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
                this.readonly = false;
            },
            // form mention
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        // edit
                        if (this.optionType === 'edit') {
                            this.axios.put(this.Global.serverSrc + this.apiService + '/' + this.id,
                                this.formValidate).then(
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
                                this.formValidate).then(
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
            // Form reset
            handleReset (name) {
                this.$refs[name].resetFields();
            }
        }
    };
</script>