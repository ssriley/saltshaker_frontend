<template>
    <div>
        <common-table
                :cColumns="cColumns"
                :apiService="apiService"
                @getProductEvent="getProductEvent"
                @getRowEvent="getRowEvent"
                :productShow="true"
                ref="childrenMethods">
            <Button slot="create" type="primary" @click="sync()">Sync Host</Button>
            <Button slot="create" type="primary" @click="add('formValidate')" v-show="false">Create host</Button>
            <Modal slot="option" v-model="formView"  :title="optionTypeName">
                <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="70" inline>
                    <FormItem label="label">
                        <Tag v-for="item in formValidate.tag" :key="item.name" :name="item.name" :color="item.color" closable @on-close="handleTagDel">{{item.name}}</Tag>
                    </FormItem>
                    <FormItem label="add tag" prop="tagName">
                        <Input size="small" v-model="formValidate.tagName" style="width:220px"></Input>
                        <Select size="small" v-model="tagColor" style="width:80px">
                            <Option value="default" key="default">default</Option>
                            <Option value="green" key="green">green</Option>
                            <Option value="red" key="red">red</Option>
                            <Option value="yellow" key="yellow">yellow</Option>
                        </Select>
                        <Button icon="ios-plus-empty" type="dashed" size="small" @click="handleTagAdd('formValidate')">add tag</Button>
                    </FormItem>
                </Form>
                <div slot="footer">
                    <Button type="ghost" @click="handleCancel()" style="margin-left: 8px">cancel</Button>
                </div>
            </Modal>
            <Modal slot="option" v-model="syncHost" title="Sync Host">
                <div style="text-align:center">
                    This function will synchronize the host information according to the Minion status to ensure data consistency
                    <Button type="success" size="small" @click="handleSync()">Synchronize</Button>
                    <Progress v-show="progress" :percent="percent" status="active"></Progress>
                </div>
                <div slot="footer">
                    <Button type="ghost" @click="handleCancel()" style="margin-left: 8px">cancel</Button>
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
                apiService: 'host',
                productData: [],
                productId: '',
                // delete data
                delId: '',
                delIndex: '',
                // Edit data
                formView: false,
                buttonShow: false,
                syncHost: false,
                progress: false,
                percent: 0,
                count: [],
                id: '',
                optionType: '',
                optionTypeName: '',
                index: 1,
                // tag
                tagName: '',
                tagColor: 'default',
                minionId: '',
                cColumns: [
                    {
                        title: 'Minion',
                        key: 'minion_id',
                        sortable: true,
                        render: (h, params) => {
                            return h('div', [
                                h('Tooltip', {
                                    props: {
                                        content: params.row.id,
                                        transfer: true,
                                        placement: 'top-start'
                                    }
                                }, params.row.minion_id)
                            ]);
                        }
                    },
                    {
                        title: 'Grouping',
                        key: 'groups',
                        sortable: true,
                        render: (h, params) => {
                            return h('ul', params.row.groups.map(item => {
                                return h('li', {
                                    style: {
                                        textAlign: 'left',
                                        padding: '0px'
                                    }
                                }, item);
                            })
                            );
                        }
                    },
                    {
                        title: 'label',
                        key: 'tag',
                        sortable: true,
                        render: (h, params) => {
                            return h('div', params.row.tag.map(item => {
                                return h('Tag', {
                                    props: {
                                        color: item['color'],
                                        name: item['name']
                                    },
                                }, item['name']);
                            })
                            );
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
                                            this.optionType = 'edit';
                                            this.optionTypeName = 'edit';
                                            this.id = params.row.id;
                                            this.minionId = params.row.minion_id;
                                            this.formValidate.tagName = '';
                                            this.formValidate.tag = params.row.tag;
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
                                            size: 'small',
                                            disabled: true
                                        }
                                    }, 'delete')
                                ])
                            ]);
                        }
                    }
                ],
                // form Validation
                formValidate: {
                    tagName: '',
                    tag: []
                },
                ruleValidate: {
                    tagName: [
                        { required: true, message: 'Label cannot be empty', trigger: 'blur' }
                    ]
                }
            };
        },
        methods: {
            getProductEvent: function (productData, productId) {
                this.productData = productData;
                this.productId = productId;
            },
            getRowEvent: function (rowData) {
                this.rowData = rowData;
                if (this.rowData.length > 0) {
                    this.buttonShow = true;
                } else {
                    this.buttonShow = false;
                }
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
            },
            // form mention
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
            // Form reset
            handleReset (name) {
                this.$refs[name].resetFields();
            },
            handleCancel () {
                this.formView = false;
                this.syncHost = false;
                this.percent = 0;
            },
            handleRemove (index) {
                this.formDynamic.items[index].status = 0;
            },
            handleTagAdd (name) {
                for (var i = 0; i < this.formValidate.tag.length; i++) {
                    if (this.formValidate.tag[i]['name'] === this.formValidate.tagName) {
                        this.$Message.error('Labels cannot be repeated');
                        return;
                    }
                }
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.formValidate.tag.push({'name': this.formValidate.tagName, 'color': this.tagColor});
                        let postData = {
                            'tag': this.formValidate.tag,
                            'minion_id': this.minionId,
                            'product_id': this.productId
                        };
                        this.axios.put(this.Global.serverSrc + this.apiService + '/' + this.id, postData).then(
                            res => {
                                if (res.data['status'] === true) {
                                    this.$Message.success('add tosuccess！');
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
                    } else {
                        this.$Message.error('Please check the form data！');
                    }
                });
            },
            handleTagDel (event, name) {
                // Delete tag
                this.formValidate.tag.splice(this.formValidate.tag.findIndex(item => item.name === name), 1);
                let postData = {
                    'tag': this.formValidate.tag,
                    'minion_id': this.minionId,
                    'product_id': this.productId
                };
                this.axios.put(this.Global.serverSrc + this.apiService + '/' + this.id, postData).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.$Message.success('删除success！');
                        } else {
                            this.nError('Delete Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Delete Failure', errInfo);
                    });
            },
            sync () {
                this.syncHost = true;
                this.progress = false;
            },
            handleSync () {
                this.progress = true;
                this.axios.get(this.Global.serverSrc + this.apiService + '/sync?product_id=' + this.productId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.percent = 100;
                            this.tableList();
                        } else {
                            this.loading = false;
                            this.nError('Sync Host Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.loading = false;
                        this.nError('Get Host Failure', errInfo);
                    });
            }
        }
    };
</script>