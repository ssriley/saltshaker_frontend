<template>
    <div>
        <common-table
                :cColumns="cColumns"
                :apiService="apiService"
                @getProductEvent="getProductEvent"
                ref="childrenMethods"
                :productShow="true">
            <Button slot="create" type="primary" @click="add('formValidate')">Create Job</Button>
            <Modal slot="option" v-model="formView"  :title="optionTypeName" width="600px">
                <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="65">
                    <FormItem label="Job name" prop="name">
                        <Input v-model="formValidate.name" placeholder="Enter Job Name"></Input>
                    </FormItem>
                    <FormItem label="description" prop="description">
                        <Input v-model="formValidate.description" placeholder="Enter a Description"></Input>
                    </FormItem>
                    <FormItem label="Target" prop="target">
                        <Select v-model="formValidate.target" multiple>
                            <Option v-for="item in targetData" :value="item.id" :key="item.id" placeholder="Choose a Target">{{ item.name }}</Option>
                        </Select>
                    </FormItem>
                    <FormItem label="Parallel number">
                         <Row>
                            <Col span="10">
                                <InputNumber :min="0" v-model="formValidate.concurrent"></InputNumber>
                            </Col>
                            <Col span="4" style="text-align: right; padding-right: 13px">Parallel interval</Col>
                            <Col span="10">
                                <InputNumber :min="0" v-model="formValidate.interval" placeholder="Unit seconds, default 60s"></InputNumber>
                            </Col>
                         </Row>
                    </FormItem>
                    <FormItem label="Scheduling">
                        <RadioGroup v-model="formValidate.scheduler">
                            <Radio label="once">once</Radio>
                            <Radio label="period">Periodic</Radio>
                            <Radio label="crontab" disabled>Scheduled Task</Radio>
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="time" v-show="formValidate.scheduler === 'once'">
                        <Row>
                            <Col span="6">
                                <RadioGroup v-model="formValidate.once.type">
                                    <Radio label="now">immediately</Radio>
                                    <Radio label="timing">timing</Radio>
                                </RadioGroup>
                            </Col>
                            <Col span="8" v-if="formValidate.once.type === 'timing'">
                                <FormItem prop="date">
                                    <DatePicker type="date" :options="optionsDate" placeholder="Select date" v-model="formValidate.once.date"></DatePicker>
                                </FormItem>
                            </Col>
                            <Col span="1" style="text-align: center" v-show="formValidate.once.type === 'timing'">-</Col>
                            <Col span="9" v-if="formValidate.once.type === 'timing'">
                                <FormItem prop="time">
                                    <TimePicker type="time" placeholder="Select time" v-model="formValidate.once.time"></TimePicker>
                                </FormItem>
                            </Col>
                        </Row>
                    </FormItem>
                    <FormItem label="cycle" v-show="formValidate.scheduler === 'period'">
                        <Col span="1">
                            each
                        </Col>
                        <Col span="10" style="padding-right: 20px">
                            <InputNumber :min="1" v-model="formValidate.period.interval"></InputNumber>
                        </Col>
                        <Col span="13">
                            <RadioGroup v-model="formValidate.period.type">
                                <Radio label="second">second</Radio>
                                <Radio label="minute">minute</Radio>
                                <Radio label="hour">hour</Radio>
                                <Radio label="day">day</Radio>
                                <Radio label="week">week</Radio>
                            </RadioGroup>
                        </Col>
                    </FormItem>
                    <FormItem label="Scheduled Task" v-show="formValidate.scheduler === 'crontab'">
                        <Col span="4">
                            <span style="padding-right: 3px">second</span>
                            <Select v-model="formValidate.crontab.second" style="width:50px">
                                <Option v-for="item in second" :value="item" :key="item">{{item}}</Option>
                            </Select>
                        </Col>
                        <Col span="4">
                            <span style="padding-right: 3px">minute</span>
                            <Select v-model="formValidate.crontab.minute" style="width:50px">
                                <Option v-for="item in minute" :value="item" :key="item">{{item}}</Option>
                            </Select>
                        </Col>
                        <Col span="4">
                            <span style="padding-right: 3px">hour</span>
                            <Select v-model="formValidate.crontab.hour" style="width:50px">
                                <Option v-for="item in hour" :value="item" :key="item">{{item}}</Option>
                            </Select>
                        </Col>
                        <Col span="4">
                            <span style="padding-right: 3px">day</span>
                            <Select v-model="formValidate.crontab.day" style="width:50px">
                                <Option v-for="item in day" :value="item" :key="item">{{item}}</Option>
                            </Select>
                        </Col>
                        <Col span="4">
                            <span style="padding-right: 3px">week</span>
                            <Select v-model="formValidate.crontab.week" style="width:50px">
                                <Option v-for="item in week" :value="item" :key="item">{{item}}</Option>
                            </Select>
                        </Col>
                        <Col span="4">
                            <span style="padding-right: 3px">month</span>
                            <Select v-model="formValidate.crontab.month" style="width:50px">
                                <Option v-for="item in month" :value="item" :key="item">{{item}}</Option>
                            </Select>
                        </Col>
                    </FormItem>
                    <FormItem label="Types of">
                        <RadioGroup v-model="formValidate.execute">
                            <span @click="handleSLS()"><Radio label="sls">SLS</Radio></span>
                            <span @click="handleShell()"><Radio label="shell">Shell</Radio></span>
                            <!--<span @click="handleModule()"><Radio label="module">Module</Radio></span>-->
                        </RadioGroup>
                    </FormItem>
                    <FormItem label="SLS" prop="sls" v-if="slsShow">
                        <Input v-model="formValidate.sls" disabled placeholder="Click on the tree structure below to get the SLS file"></Input>
                    </FormItem>
                    <FormItem label="Git branch" prop="" v-if="slsShow">
                        <Select v-model="branchName">
                            <Option v-for="item in branchData" :value="item" :key="item">{{ item }}</Option>
                        </Select>
                        <Tree :data="fileTree" :load-data="loadData" @on-select-change="handleContent"></Tree>
                    </FormItem>
                    <FormItem label="Shell" prop="shell" v-if="shellShow">
                        <MonacoEditor
                            height="400"
                            whith="100%"
                            language="yaml"
                            srcPath="dist"
                            :code="formValidate.shell"
                            :options="options"
                            :highlighted="highlightLines"
                            :changeThrottle="100"
                            theme="vs-dark"
                            @mounted="onMounted"
                            @codeChange="onCodeChange"
                            ref="vscode"
                            >
                        </MonacoEditor>
                    </FormItem>
                    <!--<FormItem label="Module" prop="module" v-if="moduleShow">-->
                        <!--<Select v-model="branchName">-->
                            <!--<Option v-for="item in branchData" :value="item" :key="item">{{ item }}</Option>-->
                        <!--</Select>-->
                        <!--<Tree :data="fileTree" :load-data="loadData" @on-select-change="handleContent"></Tree>-->
                    <!--</FormItem>-->
                </Form>
                <div slot="footer">
                    <!--<Button type="ghost" @click="handleReset('formValidate')" style="margin-left: 8px">Reset</Button>-->
                    <Button type="text" @click="handleCancel()" style="margin-left: 8px">Cancel</Button>
                    <!--<Button type="text" @click="previous()" style="margin-left: 8px" v-show="previousShow">Previous</Button>-->
                    <!--<Button type="primary" @click="next()">Next Step</Button>-->
                    <Button type="primary" @click="handleSubmit('formValidate')">Submit</Button>
                </div>
            </Modal>
            <Modal slot="option" v-model="job" title="delete Job" @on-ok="del()">
                <div style="text-align:center">
                    <p>confirm delete <span style="color: red">{{jobName}}</span> ?</p>
                </div>
            </Modal>
        </common-table>
</div>
</template>

<script>
    import CommonTable from '../common-components/table/table.vue';
    import MonacoEditor from 'vue-monaco-editor';
    export default {
        components: {
            CommonTable,
            MonacoEditor
        },
        data () {
            return {
                apiService: 'period',
                productData: [],
                productId: '',
                // delete data
                delId: '',
                delIndex: '',
                // Edit data
                formView: false,
                id: '',
                job: false,
                jobName: '',
                optionType: '',
                optionTypeName: '',
                targetData: [],
                productStateProject: '',
                branchData: [],
                branchName: '',
                fileTreeData: [],
                fileTree: [],
                fileListPathData: [],
                projectType: 'state_project',
                filePath: '',
                path: '',
                current: 0,
                slsShow: true,
                shellShow: false,
                moduleShow: false,
                // Turn off cleanup timer refresh
                timer: null,
                cColumns: [
                    {
                        title: 'Job Name',
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
                        title: 'Target',
                        key: 'target',
                        sortable: true,
                        render: (h, params) => {
                            return h('ul', params.row.target.map(item => {
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
                        title: 'Scheduling',
                        key: 'scheduler',
                        sortable: true,
                        width: 100,
                        render: (h, params) => {
                            if (params.row.scheduler === 'once') {
                                return 'once';
                            } else if (params.row.scheduler === 'period') {
                                return 'cycle';
                            } else {
                                return 'Scheduled Task';
                            }
                        }
                    },
                    {
                        title: 'Creation Time',
                        key: 'timestamp',
                        sortable: true,
                        render: (h, params) => {
                            return this.formatTime(params.row.timestamp);
                        }
                    },
                    {
                        title: 'Update Time',
                        key: 'audit',
                        sortable: true,
                        render: (h, params) => {
                            return params.row.audit.map(item => {
                                return this.formatTime(item.result.timestamp);
                            });
                        }
                    },
                    {
                        title: 'Status',
                        key: 'status',
                        sortable: true,
                        width: 140,
                        render: (h, params) => {
                            let tagColor = 'green';
                            if (params.row.status.id === 0) {
                                tagColor = 'red';
                            } else if (params.row.status.id === 11) {
                                tagColor = 'yellow';
                            }
                            if (params.row.action === 'concurrent_pause') {
                                return h('div', [
                                    h('Tag', {
                                        props: {
                                            'color': tagColor
                                        }
                                    }, params.row.status.name),
                                    h('Tag', {
                                        props: {
                                            'color': 'yellow'
                                        }
                                    }, 'Parallel pause')
//                                    h('Icon', {
//                                        props: {
//                                            'type': 'arrow-right-b',
//                                            'size': 30,
//                                            'color': '#ff9900'
//                                        }
//                                    })
                                ]);
                            } else {
                                return h('div', [
                                    h('Tag', {
                                        props: {
                                            'color': tagColor
                                        }
                                    }, params.row.status.name)
                                ]);
                            }
                        }
                    },
                    {
                        title: 'Action',
                        key: 'action',
                        width: 170,
                        align: 'center',
                        render: (h, params) => {
                            let concurrentPause = true;
                            let concurrentPlay = true;
                            let schedulerPause = true;
                            let schedulerResume = true;
                            let reopen = true;
                            if (params.row.concurrent !== 0 && params.row.status.id !== 3) {
                                if (params.row.action === 'concurrent_play') {
                                    concurrentPause = false;
                                } else if (params.row.scheduler !== 'period') {
                                    concurrentPlay = false;
                                }
                            }
                            if (params.row.scheduler !== 'once') {
                                if (params.row.action === 'scheduler_resume') {
                                    schedulerPause = false;
                                } else if (params.row.action === 'scheduler_pause') {
                                    schedulerResume = false;
                                }
                            }
                            if (params.row.scheduler === 'once' && params.row.once.type === 'now' && params.row.status.id === 3) {
                                reopen = false;
                            }
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
                                            this.formValidate.name = params.row.name;
                                            this.formValidate.description = params.row.description;
                                            this.formValidate.once.type = params.row.once.type;
                                            if (this.formValidate.once.type === 'now') {
                                                this.formValidate.once.date = '';
                                                this.formValidate.once.time = '';
                                            } else {
                                                // Convert string to time format
                                                this.formValidate.once.date = new Date(params.row.once.date);
                                                this.formValidate.once.time = params.row.once.time;
                                            }
                                            this.formValidate.scheduler = params.row.scheduler;
                                            this.formValidate.crontab.second = params.row.crontab.second;
                                            this.formValidate.crontab.minute = params.row.crontab.minute;
                                            this.formValidate.crontab.hour = params.row.crontab.hour;
                                            this.formValidate.crontab.day = params.row.crontab.day;
                                            this.formValidate.crontab.week = params.row.crontab.week;
                                            this.formValidate.crontab.month = params.row.crontab.month;
                                            this.formValidate.concurrent = params.row.concurrent;
                                            this.formValidate.interval = params.row.interval;
                                            this.formValidate.period.interval = params.row.period.interval;
                                            this.formValidate.period.type = params.row.period.type;
                                            this.formValidate.execute = params.row.execute;
                                            if (params.row.execute === 'sls') {
                                                this.handleSLS();
                                            } else {
                                                this.handleShell();
                                                this.reload();
                                            }
                                            this.formValidate.sls = params.row.sls;
                                            this.formValidate.shell = params.row.shell;
                                            this.formValidate.target = params.row.target.map(item => {
                                                return item.id;
                                            });
                                            this.formView = true;
                                        }
                                    }
                                }, 'edit'),
                                h('Button', {
                                    props: {
                                        type: 'default',
                                        size: 'small'
                                    },
                                    style: {
                                        marginRight: '5px'
                                    },
                                    on: {
                                        click: () => {
                                            let query = {id: params.row.id};
                                            this.$router.push({
                                                name: 'task',
                                                query: query
                                            });
                                        }
                                    }
                                }, 'Details'),
                                h('Dropdown', {
                                    props: {
                                        placement: 'bottom-end',
                                        transfer: true
                                    }
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'default',
                                            size: 'small'
                                        }
                                    }, 'More'),
                                    h('DropdownMenu', {
                                        slot: 'list'
                                    }, [
                                        h('DropdownItem', {
                                            props: {
                                                disabled: reopen
                                            },
                                            nativeOn: {
                                                click: () => {
                                                    this.id = params.row.id;
                                                    this.handleReopen();
                                                }
                                            }
                                        }, 'Reopen'),
                                        h('DropdownItem', {
                                            props: {
                                                disabled: concurrentPause
                                            },
                                            nativeOn: {
                                                click: () => {
                                                    this.id = params.row.id;
                                                    this.handlePause();
                                                }
                                            }
                                        }, 'Pause Parrallel'),
                                        h('DropdownItem', {
                                            props: {
                                                disabled: concurrentPlay
                                            },
                                            nativeOn: {
                                                click: () => {
                                                    this.id = params.row.id;
                                                    this.handlePlay();
                                                }
                                            }
                                        }, 'Continue in parallel'),
                                        h('DropdownItem', {
                                            props: {
                                                disabled: schedulerPause
                                            },
                                            nativeOn: {
                                                click: () => {
                                                    this.id = params.row.id;
                                                    this.handleSchedulerPause();
                                                }
                                            }
                                        }, 'Pause cycle'),
                                        h('DropdownItem', {
                                            props: {
                                                disabled: schedulerResume
                                            },
                                            nativeOn: {
                                                click: () => {
                                                    this.id = params.row.id;
                                                    this.handleSchedulerResume();
                                                }
                                            }
                                        }, 'Continue cycle'),
                                        h('DropdownItem', {
                                            props: {
                                                divided: true
                                            },
                                            nativeOn: {
                                                click: () => {
                                                    this.delId = params.row.id;
                                                    this.delIndex = params.index;
                                                    this.jobName = params.row.name;
                                                    this.job = true;
                                                }
                                            }
                                        }, 'delete')
                                    ])
                                ])
                            ]);
                        }
                    }
                ],
                optionsDate: {
                    disabledDate (date) {
                        return date && date.valueOf() < Date.now() - 86400000;
                    }
                },
                // form Validation
                formValidate: {
                    name: '',
                    description: '',
                    target: [],
                    sls: '',
                    shell: '',
                    concurrent: 0,
                    interval: 60,
                    scheduler: 'period',
                    once: {
                        type: 'now',
                        time: '',
                        date: ''
                    },
                    period: {
                        type: 'minute',
                        interval: 1
                    },
                    crontab: {
                        type: '',
                        second: 0,
                        minute: 0,
                        hour: 0,
                        day: 0,
                        week: 0,
                        month: 0
                    },
                    execute: 'sls'
                },
                ruleValidate: {
                    name: [
                        { required: true, message: 'Job name cannot be empty', trigger: 'blur' }
                    ],
                    description: [
                        { required: true, message: 'Description cannot be empty', trigger: 'blur' }
                    ],
                    target: [
                        { required: true, type: 'array', min: 1, message: 'Please Select a Target', trigger: 'change' }
                    ],
                    sls: [
                        { required: true, type: 'string', message: 'State SLS can Not be Empty', trigger: 'blur' }
                    ],
                    once: {
                        date: [
                            { required: true, type: 'date', message: 'Please select a date', trigger: 'change' }
                        ],
                        time: [
                            { required: true, type: 'string', message: 'Please select a time', trigger: 'change' }
                        ]
                    },
                    period: {
                        type: [
                            { required: true, type: 'string', message: 'Please select a time period', trigger: 'change' }
                        ]
                    },
                    shell: [
                        { required: true, type: 'string', message: 'Shell Code cannot be empty', trigger: 'blur' }
                    ]
                },
                options: {
                    selectOnLineNumbers: false,
                    automaticLayout: true
                },
                highlightLines: [
                    {
                        number: 0,
                        class: 'primary-highlighted-line'
                    },
                    {
                        number: 0,
                        class: 'secondary-highlighted-line'
                    }
                ]
            };
        },
        computed: {
            second: function () {
                let s = [...Array(60).keys()];
                return s;
            },
            minute: function () {
                let s = [...Array(60).keys()];
                return s;
            },
            hour: function () {
                let s = [...Array(25).keys()];
                return s;
            },
            day: function () {
                let s = [...Array(32).keys()];
                return s;
            },
            week: function () {
                let s = [...Array(9).keys()];
                return s;
            },
            month: function () {
                let s = [...Array(13).keys()];
                return s;
            }
        },
        watch: {
            // Monitor product line changes
            productId () {
                // Get group information again
                this.getGroups();
                this.branch();
            },
            branchName () {
                if (this.branchName !== '') {
                    // Get first-level GitLab data
                    this.fileList();
                } else {
                    this.fileTreeData = [];
                    this.fileTree = [];
                    this.fileListPathData = [];
                    this.path = '';
                }
            }
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
                this.optionTypeName = '创建';
                this.formView = true;
                this.formValidate.once.date = '';
                this.formValidate.once.time = '';
                this.formValidate.concurrent = 0;
                this.formValidate.interval = 60;
                this.formValidate.once.type = 'now';
                this.formValidate.scheduler = 'period';
                this.formValidate.execute = 'sls';
                this.slsShow = true;
                this.shellShow = false;
                // If you open the editor, clear the contents of the edit box after adding
                if (this.editor !== undefined) {
                    this.reload();
                }
            },
            handleCancel () {
                this.formView = false;
                this.handleReset('formValidate');
            },
            // form mention
            handleSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        // edit
                        if (this.optionType === 'edit') {
                            this.axios.put(this.Global.serverSrc + 'period/' + this.id + '?product_id=' + this.productId,
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
                            this.axios.post(this.Global.serverSrc + 'period?product_id=' + this.productId,
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
            handleReset (name) {
                this.$refs[name].resetFields();
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
            branch () {
                this.branchData = [];
                this.branchName = '';
                this.fileTree = [];
                this.fileContent = '';
                this.axios.get(this.Global.serverSrc + 'gitlab/branch?product_id=' + this.productId + '&project_type=' + this.projectType).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.branchData = res.data['data'];
                            this.branchName = this.branchData[0];
                        } else {
                            this.nError('Get Branch Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Get Branch Failure', errInfo);
                    });
            },
            fileList () {
                this.fileContent = '';
                this.path = '';
                this.axios.get(this.Global.serverSrc + 'gitlab/file?product_id=' + this.productId + '&project_type=' + this.projectType + '&path=/&branch=' + this.branchName).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.fileTree = res.data['data'];
                        } else {
                            this.fileTree = [];
                            this.nError('Get File Tree Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.fileTree = [];
                        this.nError('Get File Tree Failure', errInfo);
                    });
            },
            handleReopen () {
                this.axios.put(this.Global.serverSrc + 'period/reopen/' + this.id + '?product_id=' + this.productId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.$Message.success('success！');
                            this.tableList();
                        } else {
                            this.nError('Reopen Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Reopen Failure', errInfo);
                    });
            },
            handlePause () {
                this.axios.put(this.Global.serverSrc + 'period/concurrent/pause/' + this.id + '?product_id=' + this.productId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.$Message.success('success！');
                            this.tableList();
                        } else {
                            this.nError('Pause Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Pause Failure', errInfo);
                    });
            },
            handlePlay () {
                this.axios.put(this.Global.serverSrc + 'period/concurrent/play/' + this.id + '?product_id=' + this.productId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.$Message.success('success！');
                            this.tableList();
                        } else {
                            this.nError('Play Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Play Failure', errInfo);
                    });
            },
            handleSchedulerPause () {
                this.axios.put(this.Global.serverSrc + 'period/scheduler/pause/' + this.id + '?product_id=' + this.productId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.$Message.success('success！');
                            this.tableList();
                        } else {
                            this.nError('Scheduler Pause Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Play Failure', errInfo);
                    });
            },
            handleSchedulerResume () {
                this.axios.put(this.Global.serverSrc + 'period/scheduler/resume/' + this.id + '?product_id=' + this.productId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.$Message.success('success！');
                            this.tableList();
                        } else {
                            this.nError('Scheduler Resume Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Play Failure', errInfo);
                    });
            },
            // Pass in the path to get gitlab corresponding data
            fileListPath (path) {
                this.fileContent = '';
                this.axios.get(this.Global.serverSrc + 'gitlab/file?product_id=' + this.productId + '&project_type=' + this.projectType + '&path=' + path + '&branch=' + this.branchName).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.fileListPathData = res.data['data'];
                        } else {
                            this.fileListPathData = [];
                            this.nError('Get File Tree Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.fileListPathData = [];
                        this.nError('Get File Tree Failure', errInfo);
                    });
            },
            handleContent (filePath) {
                if (filePath.length !== 0 && filePath[0]['type'] !== 'tree') {
                    this.filePath = filePath[0]['path'];
                    this.formValidate.sls = filePath[0]['path'];
                } else {
                    this.formValidate.sls = '';
                }
            },
            // Expand the tree structure to get gitlab data
            loadData (item, callback) {
                this.fileListPath(item['path']);
                // fileListPath为异步方法,等待300ms
                setTimeout(() => {
                    callback(this.fileListPathData);
                }, 300);
            },
            handleSLS () {
                this.slsShow = true;
                this.shellShow = false;
                this.moduleShow = false;
            },
            handleShell () {
                this.slsShow = false;
                this.shellShow = true;
                this.moduleShow = false;
            },
            handleModule () {
                this.slsShow = false;
                this.shellShow = false;
                this.moduleShow = true;
            },
            onMounted (editor) {
                this.editor = editor;
            },
            onCodeChange (editor) {
                this.formValidate.shell = this.editor.getValue();
            },
            // Reload edit box
            reload () {
                clearTimeout(time);
                let time = setTimeout(() => {
                    this.$refs.vscode.destroyMonaco();
                    this.$refs.vscode.createMonaco();
                }, 1);
            },
            formatTime (time) {
                let unixtime = time;
                let unixTimestamp = new Date(unixtime * 1000);
                let Y = unixTimestamp.getFullYear();
                let M = ((unixTimestamp.getMonth() + 1) >= 10 ? (unixTimestamp.getMonth() + 1) : '0' + (unixTimestamp.getMonth() + 1));
                let D = (unixTimestamp.getDate() >= 10 ? unixTimestamp.getDate() : '0' + unixTimestamp.getDate());
                let h = (unixTimestamp.getHours() >= 10 ? unixTimestamp.getHours() : '0' + unixTimestamp.getHours());
                let m = (unixTimestamp.getMinutes() >= 10 ? unixTimestamp.getMinutes() : '0' + unixTimestamp.getMinutes());
                let s = (unixTimestamp.getSeconds() >= 10 ? unixTimestamp.getSeconds() : '0' + unixTimestamp.getSeconds());
                let toDay = Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s;
                return toDay;
            }
        },
        // Regular refresh
        mounted () {
            this.timer = setInterval(this.$refs.childrenMethods.tableList, 5000);
        },
        // Close destruction
        beforeDestroy () {
            clearInterval(this.timer);
        }
    };
</script>