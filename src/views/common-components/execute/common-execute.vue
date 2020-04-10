<style lang="less">
    @import '../../../styles/common.less';
</style>

<template>
    <div>
        <Row>
            <Col span="24">
                <Row>
                    <Col span="24">
                        <Card dis-hover>
                            <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="47">
                                <FormItem label="target" prop="target">
                                    <CheckboxGroup v-model="formValidate.target">
                                        <Table size="small" width="100%" border :columns="columnsTarget" :data="targetData"></Table>
                                    </CheckboxGroup>
                                </FormItem>
                                <slot name="command"></slot>
                                <FormItem>
                                    <Button type="primary" @click="handleSubmit('formValidate')">Submit</Button>
                                    <Button type="ghost" @click="handleReset('formValidate')">Reset</Button>
                                    <slot name="commitButton"></slot>
                                    <div style="float: right">
                                        <Poptip placement="top-end" width="700">
                                            <Button type="ghost" @click="handleHistory">History</Button>
                                            <div class="api" slot="content">
                                                <div style="padding-bottom: 5px">
                                                    <Input v-model="searchConName" icon="search" @on-change="handleSearch" placeholder="Please Enter History Command" style="width: 200px" />
                                                </div>
                                                <Table size="small" width="100%" height="190" border :columns="columnsHistory" :data="historyData"></Table>
                                            </div>
                                         </Poptip>
                                    </div>
                                </FormItem>
                                <FormItem label="Results">
                                    <Spin size="large" fix v-if="spinShow"></Spin>
                                    <Alert :type="summaryType">
                                        <ul>
                                            <li>
                                                Total： {{result.total}}
                                            </li>
                                            <li>
                                                Succeed： {{result.succeed}}
                                            </li>
                                            <li>
                                                Failure： {{result.failure}}
                                            </li>
                                            <li>
                                                Target_Host： {{result.failure_minion}}
                                            </li>
                                            <li>
                                                Command_Name： {{result.command}}
                                            </li>
                                        </ul>
                                    </Alert>
                                    <highlight-code lang="yaml" v-show="resultShow" style="overflow:auto"　v-for="(item, minion) in result.result" :key="item.minion">
Minion: {{minion}}
{{item}}
                                    </highlight-code>
                                </FormItem>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </Col>
        </Row>
    </div>
</template>

<script>
    export default {
        name: 'commonExecute',
        data () {
            return {
                productData: this.productList(),
                // Exectution Command Return Data
                result: '',
                searchConName: '',
                formValidate: {
                    command: '',
                    target: []
                },
                // Results are not shown by default
                resultShow: false,
                // Summary Information Style
                summaryType: 'success',
                // Wait for the Result
                spinShow: false,
                // Select All
                target: [],
                ruleValidate: {
                    command: [
                        { required: true, message: 'Please Choose SLS to Execute', trigger: 'blur' }
                    ],
                    target: [
                        { required: true, type: 'array', message: 'Please Select a Host or Group', trigger: 'change' }
                    ]
                },
                columnsTarget: [
                    {
                        title: 'Grouping',
                        key: 'name',
                        width: 200,
                        render: (h, params) => {
                            return h('CheckboxGroup', [
                                h('Checkbox', {
                                    props: {
                                        label: params.row.name
                                    },
                                    nativeOn: {
                                        click: () => {
                                            // Click to remove minion
                                            if (this.formValidate.target.includes(params.row.name)) {
                                                this.formValidate.target.splice(this.formValidate.target.indexOf(params.row.name), 1);
                                                // The index position changes, and a reverse loop is used to achieve the purpose of the array removing another array element
                                                for (let i = this.formValidate.target.length - 1; i >= 0; i--) {
                                                    for (let m = params.row.minion.length - 1; m >= 0; m--) {
                                                        if (this.formValidate.target[i] === params.row.minion[m]) {
                                                            this.formValidate.target.splice(i, 1);
                                                        }
                                                    }
                                                }
                                            } else {
                                                // Click the unchecked group, check the upper group and the corresponding minion
                                                this.formValidate.target.push(params.row.name);
                                                this.formValidate.target = this.formValidate.target.concat(params.row.minion);
                                            }
                                        }
                                    }
                                }, params.row.name)
                            ]);
                        }
                    },
                    {
                        title: 'host',
                        key: 'minion',
                        render: (h, params) => {
                            return h('div', params.row.minion.map(item => {
                                return h('Checkbox', {
                                    props: {
                                        label: item
                                    }
                                }, item);
                            })
                            );
                        }
                    }
                ],
                targetData: [],
                columnsHistory: [
                    {
                        title: 'Command',
                        key: 'command'
                    },
                    {
                        title: 'Username',
                        key: 'username',
                        width: 180
                    },
                    {
                        title: 'Time',
                        key: 'time',
                        width: 160
                    }
                ],
                historyData: [],
                initHistoryData: []
            };
        },
        props: {
            apiService: {
                type: String,
                required: true
            },
            productShow: {
                type: Boolean
            },
            productId: {
                type: String,
                required: true
            },
            slsCommand: {
                type: String,
                required: true
            },
            slsURI: {
                type: String,
                required: true
            }
        },
        watch: {
            // Monitor product line changes
            productId () {
                // Get group information again
                this.getGroups();
                // Clear target form data
                this.formValidate.command = '';
                // Clear summary information
                this.formValidate.target = [];
                // Clear result information
                this.resultShow = false;
                // Clear summary information
                this.result = '';
                // stop loading
                this.spinShow = false;
                // Retrieve history commands
                this.getHistory();
                // Clear search
                this.searchConName = '';
            },
            // Monitor sls file name changes
            slsCommand () {
                this.formValidate.command = this.slsCommand;
                // Clear result information
                this.resultShow = false;
                // Clear summary information
                this.result = '';
            }
        },
        methods: {
            // Get product lines owned by users
            productList () {
                this.axios.get(this.Global.serverSrc + 'product').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.productData = res.data['data'];
                            if (this.productData.length > 0) {
                                this.productId = this.productData[0].id;
                            }
                            // Load history command after loading product line
                            this.getHistory();
                        } else {
                            this.nError('Get Product Failure', res.data['message']);
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
            // Redefine the error message
            nError (title, info) {
                this.$Notice.error({
                    title: title,
                    desc: info,
                    duration: 10
                });
            },
            refresh () {
                this.getGroups();
                this.getHistory();
            },
            //  handle selected minion
            handleTarget () {
                // 去重
                this.target = [...new Set(this.formValidate.target)];
                // Get all group names
                let group = this.targetData.map(item => {
                    return item['name'];
                });
                // Remove the group name in minion
                for (let i = this.target.length - 1; i >= 0; i--) {
                    for (let m = group.length - 1; m >= 0; m--) {
                        if (this.target[i] === group[m]) {
                            this.target.splice(i, 1);
                        }
                    }
                }
            },
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.spinShow = true;
                        this.handleTarget();
                        let postData = {
                            'minion_id': this.target,
                            'sls': this.formValidate.command
                        };
                        this.axios.post(this.Global.serverSrc + this.slsURI + '?product_id=' + this.productId, postData).then(
                            res => {
                                if (res.data['status'] === true) {
                                    this.result = res.data['data'];
                                    this.resultShow = true;
                                    this.spinShow = false;
                                    // Show different colors after errors
                                    if (this.result['failure'] !== '0') {
                                        this.summaryType = 'error';
                                    } else {
                                        this.summaryType = 'success';
                                    }
                                } else {
                                    this.result = '';
                                    this.resultShow = false;
                                    this.spinShow = false;
                                    this.nError('Execute Failure', res.data['message']);
                                }
                            },
                            err => {
                                let errInfo = '';
                                try {
                                    errInfo = err.response.data['message'];
                                } catch (error) {
                                    errInfo = err;
                                }
                                this.result = '';
                                this.resultShow = false;
                                this.spinShow = false;
                                this.nError('Execute Failure', errInfo);
                            });
                    } else {
                        this.$Message.error('Please check the form data');
                    }
                });
            },
            handleReset (name) {
                this.$refs[name].resetFields();
            },
            getHistory () {
                this.axios.get(this.Global.serverSrc + 'history?type=sls&product_id=' + this.productId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.historyData = res.data['data'];
                            this.initHistoryData = this.historyData;
                        } else {
                            this.nError('Get Info Failure', res.data['message']);
                        }
                        ;
                        this.loading = false;
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                            if (err.response.status === 404) {
                                this.historyData = [];
                            } else {
                                this.nError('Get Info Failure', errInfo);
                            }
                        } catch (error) {
                            errInfo = err;
                            this.nError('Get Info Failure', errInfo);
                        }
                        this.loading = false;
                    });
            },
            getGroups () {
                this.axios.get(this.Global.serverSrc + 'execute/groups?product_id=' + this.productId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.targetData = res.data['data'];
                        } else {
                            this.nError('Get Info Failure', res.data['message']);
                        }
                        ;
                        this.loading = false;
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                            if (err.response.status === 404) {
                                this.targetData = [];
                            } else {
                                this.nError('Get Info Failure', errInfo);
                            }
                        } catch (error) {
                            errInfo = err;
                            this.nError('Get Info Failure', errInfo);
                        }
                        this.loading = false;
                    });
            },
            search (data, argumentObj) {
                let res = data;
                let dataClone = data;
                for (let argu in argumentObj) {
                    if (argumentObj[argu].length > 0) {
                        res = dataClone.filter(d => {
                            return d[argu].indexOf(argumentObj[argu]) > -1;
                        });
                        dataClone = res;
                    }
                }
                return res;
            },
            handleSearch () {
                this.historyData = this.initHistoryData;
                this.historyData = this.search(this.historyData, {command: this.searchConName});
            },
            handleHistory () {
                this.searchConName = '';
                this.getHistory();
            }
        }
    };
</script>
<style scoped>
.hr-margin{
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>