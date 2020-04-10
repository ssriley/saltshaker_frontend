<template>
    <div>
        <common-table :cColumns="cColumns" :apiService="apiService" @getProductEvent="getProductEvent" :productShow="true" ref="childrenMethods">
            <Button slot="create" type="primary" @click="add('formValidate')">Create ACL</Button>
            <Modal slot="option" v-model="formView"  :title="optionTypeName">
                <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="60">
                    <FormItem label="ACL Name" prop="name">
                        <Input v-model="formValidate.name" placeholder="Enter Name"></Input>
                    </FormItem>
                    <FormItem label="Description" prop="description">
                        <Input v-model="formValidate.description" placeholder="Enter Description"></Input>
                    </FormItem>
                    <FormItem label="Product ID" prop="productId">
                        <Select v-model="formValidate.productId" placeholder="Enter Product ID">
                            <Option v-for="item in productData" :value="item.id" :key="item.id">{{ item.name }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="Allow" prop="allow">
                        <Input v-model.trim="formValidate.allow" type="textarea" :autosize="{minRows: 2,maxRows: 5}"  placeholder="输入允许信息"></Input>
                    </FormItem>
                    <FormItem label="Deny" prop="deny">
                        <Input v-model.trim="formValidate.deny" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="输入拒绝信息"></Input>
                    </FormItem>
                </Form>
                <div slot="footer">
                    <Button type="ghost" @click="handleReset('formValidate')" style="margin-left: 8px">Reset</Button>
                    <Button type="primary" @click="handleSubmit('formValidate')">Submit</Button>
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
                apiService: 'acl',
                productData: [],
                productId: '',
                // Delete Data
                delId: '',
                delIndex: '',
                // Edit Data
                formView: false,
                id: '',
                optionType: '',
                optionTypeName: '',
                cColumns: [
                    {
                        title: 'ACL Name',
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
                        title: 'Description',
                        key: 'description',
                        sortable: true
                    },
                    {
                        title: 'Allow',
                        key: 'allow',
                        sortable: true,
                        render: (h, params) => {
                            return h('Poptip', {
                                props: {
                                    trigger: 'hover',
                                    title: 'Allow List',
                                    placement: 'bottom'
                                }
                            }, [
                                h('Tag', params.row.allow.length),
                                h('div', {
                                    slot: 'content'
                                }, [
                                    h('ul', params.row.allow.map(item => {
                                        return h('li', {
                                            style: {
                                                textAlign: 'left',
                                                padding: '0px'
                                            }
                                        }, item);
                                    }))
                                ])
                            ]);
                        }
                    },
                    {
                        title: 'Refuse',
                        key: 'deny',
                        sortable: true,
                        render: (h, params) => {
                            return h('Poptip', {
                                props: {
                                    trigger: 'hover',
                                    title: 'Deny List',
                                    placement: 'bottom'
                                }
                            }, [
                                h('Tag', params.row.deny.length),
                                h('div', {
                                    slot: 'content'
                                }, [
                                    h('ul', params.row.deny.map(item => {
                                        return h('li', {
                                            style: {
                                                textAlign: 'left',
                                                padding: '0px'
                                            }
                                        }, item);
                                    }))
                                ])
                            ]);
                        }
                    },
                    {
                        title: 'Action',
                        key: 'action',
                        width: 123,
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
                                            this.handleReset('formValidate');
                                            this.optionType = 'edit';
                                            this.optionTypeName = 'Edit';
                                            this.id = params.row.id;
                                            this.formValidate.name = params.row.name;
                                            this.formValidate.description = params.row.description;
                                            this.formValidate.productId = params.row.product_id;
                                            this.formValidate.allow = params.row.allow.join('\n');
                                            this.formValidate.deny = params.row.deny.join('\n');
                                        }
                                    }
                                }, 'Edit'),
                                h('Poptip', {
                                    props: {
                                        confirm: true,
                                        title: 'Are you sure you want to delete? ' + params.row.name + ' ?',
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
                                            size: 'small'
                                        }
                                    }, 'Delete')
                                ])
                            ]);
                        }
                    }
                ],
                // Form Validation
                formValidate: {
                    name: '',
                    description: '',
                    productId: '',
                    allow: '',
                    deny: ''
                },
                ruleValidate: {
                    name: [
                        { required: true, message: 'ACL Name Cannot Be Empty', trigger: 'blur' }
                    ],
                    description: [
                        { required: true, message: 'Description Cannot Be Empty', trigger: 'blur' }
                    ],
                    productId: [
                        { required: true, message: 'Product Name Cannot be Empty', trigger: 'change' }
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
            // Call subcomponent message notification
            nError (title, info) {
                this.$refs.childrenMethods.nError(title, info);
            },
            // Add impression
            add (name) {
                this.handleReset(name);
                this.optionType = 'add';
                this.optionTypeName = 'add to';
                this.formView = true;
            },
            // Form Mention
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        // edit
                        let postData = {
                            'name': this.formValidate.name,
                            'description': this.formValidate.description,
                            'product_id': this.formValidate.productId,
                            'allow': this.formValidate.allow.split('\n'),
                            'deny': this.formValidate.deny.split('\n')
                        };
                        if (this.optionType === 'edit') {
                            this.axios.put(this.Global.serverSrc + this.apiService + '/' + this.id,
                                postData).then(
                                res => {
                                    if (res.data['status'] === true) {
                                        this.formView = false;
                                        this.$Message.success('Success！');
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
                            // Add to
                            this.axios.post(this.Global.serverSrc + this.apiService,
                                postData).then(
                                res => {
                                    if (res.data['status'] === true) {
                                        this.formView = false;
                                        this.$Message.success('Success！');
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
                        this.$Message.error('Please Check the Form！');
                    }
                });
            },
            // Form Reset
            handleReset (name) {
                this.$refs[name].resetFields();
            }
        }
    };
</script>