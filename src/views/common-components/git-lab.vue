<style lang="less">
    @import '../../styles/common.less';
</style>

<template>
    <div>
        <Row class="margin-top-10">
            <Col span="24">
                <Card dis-hover>
                    <Row>
                        <Select style="width:200px" v-model="productId" v-show="productShow">
                            <Option v-for="item in productData" :value="item.id" :key="item.id">{{ item.name }}</Option>
                        </Select>
                        <div style="float: right;" >
                            <slot name="create"></slot>
                            <slot name="downMenu"></slot>
                            <Button type="primary" @click="refresh()">Refresh</Button>
                        </div>
                    </Row>
                    <Row>
                        <hr class="hr-margin" color="#e3e8ee" size="0.5">
                    </Row>
                    <Row :gutter="5">
                        <Col span="6">
                            <Card dis-hover :padding="5">
                                <div style="margin-bottom: -10px;">
                                <Select v-model="branchName">
                                    <Option v-for="item in branchData" :value="item" :key="item">{{ item }}</Option>
                                </Select>
                                </div>
                                <br>
                                <Tree :data="fileTree" :load-data="loadData" @on-select-change="handleContent"></Tree>
                            </Card>
                        </Col>
                        <Col span="18">
                            <Card dis-hover>
                                <Form ref="formValidate" :model="formValidate" :rules="ruleValidate" :label-width="46">
                                    <FormItem label="file" prop="fileDir">
                                        <Input v-model="formValidate.fileDir" :disabled="inputDisabled" placeholder="Click the tree structure on the left to get the directory, enter the file name or path, such as: a / b / top.sls, the directory does not exist automatically created" ></Input>
                                    </FormItem>
                                    <FormItem label="content" prop="code">
                                        <Tabs v-model="tab" :style="[h]">
                                            <TabPane  label="Create from text input box" name="text">
                                                <MonacoEditor
                                                    height="500"
                                                    width="100%"
                                                    language="yaml"
                                                    srcPath="dist"
                                                    :code="fileContent"
                                                    :options="options"
                                                    :highlighted="highlightLines"
                                                    :changeThrottle="100"
                                                    theme="vs-dark"
                                                    @mounted="onMounted"
                                                    @codeChange="onCodeChange"
                                                    ref="vscode"
                                                    >
                                                </MonacoEditor>
                                                <br>
                                                <Button type="primary" @click="handleCreate('formValidate')" :disabled="createDisabled">Create</Button>
                                                <Button type="primary" @click="handleEdit('formValidate')" :disabled="editDisabled">Update</Button>
                                                <Poptip
                                                    confirm
                                                    :title="title"
                                                    @on-popper-show="PopperShow()"
                                                    @on-ok="handleDelete('formValidate')">
                                                    <Button type="error" :disabled="deleteDisabled">Delete</Button>
                                                </Poptip>
                                            </TabPane>
                                            <TabPane label="PackageSLS" name="sls">
                                                <Row :gutter="0">
                                                    <Col span="3">
                                                        <p><Button type="primary" shape="circle" size="small" @click="handleAddStep('file_managed')">Document management</Button></p>
                                                        <p><Button type="primary" shape="circle" size="small" @click="handleAddStep('file_directory')">Directory management</Button></p>
                                                        <p><Button type="primary" shape="circle" size="small" @click="handleAddStep('cmd_run')">CMD_Run</Button></p>
                                                        <p><Button type="primary" shape="circle" size="small" @click="handleAddStep('pkg_installed')">Install packages</Button></p>
                                                    </Col>
                                                    <Col span="1">
                                                        <hr style="border:1px dashed #eee; height: 620px; width: 0px;"></hr>
                                                    </Col>
                                                    <Col span="20">
                                                        <Timeline>
                                                            <TimelineItem color="blue">
                                                                <p class="time">Start</p>
                                                                <li v-for="(item, index) in steps">
                                                                    <Tag v-if="item.id !== ''" closable color="blue" :name="item.id" @on-close="handleDelStep"><a @click="handleSLS(item.id, item.state_name, index)">{{ item.show_name }}</a></Tag>
                                                                    <Tag v-if="item.id === ''" closable color="yellow" :name="item.id" @on-close="handleDelStep"><a @click="handleSLS(item.id, item.state_name, index)">{{ item.show_name }}</a></Tag>
                                                                </li>
                                                            </TimelineItem>
                                                            <TimelineItem color="green">End</TimelineItem>
                                                        </Timeline>
                                                        <Button type="primary" @click="handleSLSCreate('formValidate')" :disabled="createDisabled">Create</Button>
                                                        <Button type="primary" @click="handleEdit('formValidate')" :disabled="editDisabled">Update</Button>
                                                        <Poptip
                                                            confirm
                                                            :title="title"
                                                            @on-popper-show="PopperShow()"
                                                            @on-ok="handleDelete('formValidate')">
                                                            <Button type="error" :disabled="deleteDisabled">Delete</Button>
                                                        </Poptip>
                                                    </Col>
                                                </Row>
                                            </TabPane>
                                            <TabPane label="Create from file" name="upload" :disabled="uploadDisabled">
                                                <div style="padding: 1px">
                                                <Upload
                                                    multiple
                                                    type="drag"
                                                    :action="action"
                                                    :data="uploadParameter"
                                                    :with-credentials="true"
                                                    :on-success="UploadSuccess"
                                                    :on-error="UploadError"
                                                    :before-upload="beforeUpdate">
                                                    <div style="padding: 10px 0px">
                                                        <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
                                                        <p>Click or drag to upload</p>
                                                    </div>
                                                </Upload>
                                                    </div>
                                            </TabPane>
                                        </Tabs>
                                    </FormItem>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
        <Modal v-model="fileManagedFormView"  title="Package file management">
            <Form ref="fileManagedFormValidate" :model="fileManagedFormValidate" :rules="fileManagedRuleValidate" :label-width="70">
                <FormItem label="name" prop="name">
                    <Input v-model="fileManagedFormValidate.name" placeholder="Enter a Name"></Input>
                </FormItem>
                <FormItem label="Source File" prop="source">
                    <Input v-model="fileManagedFormValidate.source" placeholder="Input Source File"></Input>
                </FormItem>
                <FormItem label="Target File" prop="destination">
                    <Input v-model="fileManagedFormValidate.destination" placeholder="Enter Target File"></Input>
                </FormItem>
                <FormItem label="user" prop="user">
                    <Input v-model="fileManagedFormValidate.user" placeholder="Enter User"></Input>
                </FormItem>
                <FormItem label="group" prop="group">
                    <Input v-model="fileManagedFormValidate.group" placeholder="Enter a group"></Input>
                </FormItem>
                <FormItem label="authority bit" prop="mode">
                    <Input v-model="fileManagedFormValidate.mode" placeholder="Enter the permission bit, such as: 644"></Input>
                </FormItem>
                <FormItem label="template">
                    <Input v-model="fileManagedFormValidate.template" placeholder="Input template, such as: jinja"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="ghost" @click="handleReset('fileManagedFormValidate')" style="margin-left: 8px">Reset</Button>
                <Button type="primary" @click="handleFileManagedSubmit('fileManagedFormValidate')">Add to</Button>
            </div>
        </Modal>
        <Modal v-model="fileDirectoryFormView"  title="Package directory management">
            <Form ref="fileDirectoryFormValidate" :model="fileDirectoryFormValidate" :rules="fileDirectoryRuleValidate" :label-width="80">
                <FormItem label="name" prop="name">
                    <Input v-model="fileDirectoryFormValidate.name" placeholder="Enter Name"></Input>
                </FormItem>
                <FormItem label="Target file" prop="destination">
                    <Input v-model="fileDirectoryFormValidate.destination" placeholder="Enter Target File"></Input>
                </FormItem>
                <FormItem label="user" prop="user">
                    <Input v-model="fileDirectoryFormValidate.user" placeholder="Enter user"></Input>
                </FormItem>
                <FormItem label="group" prop="group">
                    <Input v-model="fileDirectoryFormValidate.group" placeholder="Enter group"></Input>
                </FormItem>
                <FormItem label="authority bit" prop="mode">
                    <Input v-model="fileDirectoryFormValidate.mode" placeholder="Enter the permission bit, such as: 644"></Input>
                </FormItem>
                <FormItem label="Create parent directory">
                    <RadioGroup v-model="fileDirectoryFormValidate.makedirs">
                        <Radio label="True">Yes</Radio>
                        <Radio label="False">No</Radio>
                    </RadioGroup>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="ghost" @click="handleReset('fileDirectoryFormValidate')" style="margin-left: 8px">Reset</Button>
                <Button type="primary" @click="handleFileDirectorySubmit('fileDirectoryFormValidate')">Add to</Button>
            </div>
        </Modal>
        <Modal v-model="cmdRunFormView"  title="Package execution command">
            <Form ref="cmdRunFormValidate" :model="cmdRunFormValidate" :rules="cmdRunRuleValidate" :label-width="70">
                <FormItem label="name" prop="name">
                    <Input v-model="cmdRunFormValidate.name" placeholder="Enter Name"></Input>
                </FormItem>
                <FormItem label="command" prop="cmd">
                    <Input v-model="cmdRunFormValidate.cmd" type="textarea" :autosize="true" placeholder="Enter Command"></Input>
                </FormItem>
                <FormItem label="Environment variables" prop="env">
                    <Input v-model="cmdRunFormValidate.env" type="textarea" :autosize="true"  placeholder="Enter the target environment variable"></Input>
                </FormItem>
                <FormItem label="unless">
                    <Input v-model="cmdRunFormValidate.unless" type="textarea" :autosize="true" placeholder="Enter the target environment variable"></Input>
                </FormItem>
                <FormItem label="rely">
                    <Input v-model="cmdRunFormValidate.require" placeholder="Input dependency"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="ghost" @click="handleReset('cmdRunFormValidate')" style="margin-left: 8px">Reset</Button>
                <Button type="primary" @click="handleCmdRunSubmit('cmdRunFormValidate')">Add to</Button>
            </div>
        </Modal>
        <Modal v-model="pkgInstalledFormView"  title="Package installation package">
            <Form ref="pkgInstalledFormValidate" :model="pkgInstalledFormValidate" :rules="pkgInstalledRuleValidate" :label-width="70">
                <FormItem label="name" prop="name">
                    <Input v-model="pkgInstalledFormValidate.name" placeholder="Enter Name"></Input>
                </FormItem>
                <FormItem label="Package names" prop="pkgs">
                    <Input v-model="pkgInstalledFormValidate.pkgs" type="textarea" :autosize="{minRows: 5}" placeholder="Enter the package name, please wrap for multiple packages"></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="ghost" @click="handleReset('pkgInstalledFormValidate')" style="margin-left: 8px">Reset</Button>
                <Button type="primary" @click="handlePkgInstalledSubmit('pkgInstalledFormValidate')">Add to</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
    import MonacoEditor from 'vue-monaco-editor';
    function nCopy (data) {
        return JSON.parse(JSON.stringify(data));
    };
    export default {
        components: {
            MonacoEditor
        },
        name: 'GitLab',
        data () {
            const validateName = (rule, value, callback) => {
                if (value === '') {
                    callback(new Error('Name is required'));
                } else {
                    // Perform Chinese verification
                    if (/[\u4E00-\u9FA5]/i.test(value)) {
                        callback(new Error('The name cannot be Chinese'));
                    }
                    let status = true;
                    this.steps.map(item => {
                        if (value === item.id) {
                            callback(new Error('The same SLS file, the name cannot be repeated'));
                            status = false;
                        }
                    });
                    if (status) {
                        callback();
                    }
                }
            };
            return {
                productData: this.productList(),
                productId: '',
                productStateProject: '',
                branchData: [],
                branchName: '',
                fileTreeData: [],
                fileTree: [],
                fileListPathData: [],
                deleteDisabled: true,
                editDisabled: true,
                createDisabled: false,
                inputDisabled: false,
                uploadDisabled: false,
                fileContent: '',
                path: '',
                filePath: [''],
                code: '',
                options: {
                    selectOnLineNumbers: false,
                    // Enabling the editor will install an interval to check whether the size of its container dom node has changed, enabling this feature may have a serious impact on performance
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
                ],
                formValidate: {
                    path: '',
                    fileDir: '',
                    code: ''
                },
                ruleValidate: {
                    path: [
                        { required: true, message: 'Please choose to execute SLS', trigger: 'blur' }
                    ],
                    fileDir: [
                        { required: true, message: 'Click on the tree structure on the left to get the directory, please enter the file name for creation, and the file path for upload', trigger: 'blur' }
                    ]
                },
                steps: [],
                stepIndex: 0,
                fileManagedFormValidate: {
                    name: '',
                    source: '',
                    destination: '',
                    user: '',
                    group: '',
                    mode: '',
                    template: 'jinja'
                },
                fileManagedRuleValidate: {
                    name: [
                        { required: true, validator: validateName, trigger: 'blur' }
                    ],
                    source: [
                        { required: true, message: 'Source file cannot be empty', trigger: 'blur' }
                    ],
                    destination: [
                        { required: true, message: 'The target file cannot be empty', trigger: 'blur' }
                    ],
                    user: [
                        { required: true, message: 'User cannot be empty', trigger: 'blur' }
                    ],
                    group: [
                        { required: true, message: 'Group cannot be empty', trigger: 'blur' }
                    ],
                    mode: [
                        { required: true, message: 'Permission bit cannot be empty', trigger: 'blur' }
                    ]
                },
                fileDirectoryFormValidate: {
                    name: '',
                    destination: '',
                    user: '',
                    group: '',
                    mode: '',
                    makedirs: 'True'
                },
                fileDirectoryRuleValidate: {
                    name: [
                        { required: true, validator: validateName, trigger: 'blur' }
                    ],
                    destination: [
                        { required: true, message: 'Directory address cannot be empty', trigger: 'blur' }
                    ],
                    user: [
                        { required: true, message: 'User cannot be empty', trigger: 'blur' }
                    ],
                    group: [
                        { required: true, message: 'Group cannot be empty', trigger: 'blur' }
                    ],
                    mode: [
                        { required: true, message: 'Permission bit cannot be empty', trigger: 'blur' }
                    ]
                },
                cmdRunFormValidate: {
                    name: '',
                    cmd: '',
                    env: '',
                    unless: '',
                    require: ''
                },
                cmdRunRuleValidate: {
                    name: [
                        { required: true, validator: validateName, trigger: 'blur' }
                    ],
                    cmd: [
                        { required: true, message: 'Command cannot be empty', trigger: 'blur' }
                    ]
                },
                pkgInstalledFormValidate: {
                    name: '',
                    pkgs: ''
                },
                pkgInstalledRuleValidate: {
                    name: [
                        { required: true, validator: validateName, trigger: 'blur' }
                    ],
                    pkgs: [
                        { required: true, message: 'Package cannot be empty', trigger: 'blur' }
                    ]
                },
                title: '',
                tab: 'text',
                h: {
                    height: '620px'
                },
                fileManaged: [],
                cmdRun: [],
                fileDirectory: [],
                pkgInstalled: [],
                fileManagedFormView: false,
                cmdRunFormView: false,
                fileDirectoryFormView: false,
                pkgInstalledFormView: false
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
            projectType: {
                type: String,
                required: true
            },
            slsURI: {
                type: String,
                required: true
            }
        },
        computed: {
            // Additional parameters attached to the file upload
            uploadParameter: function () {
                let postData = {
                    'path': this.formValidate.fileDir,
                    'project_type': this.projectType,
                    'branch': this.branchName,
                    'action': 'upload'
                };
                return postData;
            },
            // Uploaded address
            action: function () {
                return this.Global.serverSrc + 'gitlab/upload?product_id=' + this.productId;
            }
        },
        watch: {
            // Monitor product line changes
            productId () {
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
            },
            fileContent () {
                if (this.fileContent !== '') {
                    this.editDisabled = false;
                }
                // Reload MonacoEditor
                this.reload();
            },
            filePath () {
                if (this.filePath.length !== 0) {
                    if (this.filePath[0].type !== 'tree') {
                        this.deleteDisabled = false;
                        this.editDisabled = false;
                        this.createDisabled = true;
                        this.inputDisabled = true;
                        this.uploadDisabled = true;
                    } else {
                        this.deleteDisabled = true;
                        this.editDisabled = true;
                        this.createDisabled = false;
                        this.inputDisabled = false;
                        this.uploadDisabled = false;
                        this.code = '';
                        this.fileContent = '';
                    }
                } else {
                    this.deleteDisabled = true;
                    this.editDisabled = true;
                    this.createDisabled = false;
                    this.inputDisabled = false;
                    this.uploadDisabled = false;
                }
            },
            tab () {
                if (this.tab === 'text') {
                    this.h.height = '620px';
                } else if (this.tab === 'sls') {
                    this.h.height = '620px';
                }
            }
        },
        methods: {
            productList () {
                this.axios.get(this.Global.serverSrc + 'product').then(
                    res => {
                        if (res.data['status'] === true) {
                            this.productData = res.data['data'];
                            if (this.productData.length > 0) {
                                this.productId = this.productData[0].id;
                                this.productStateProject = this.productData[0].state_project;
                            }
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
            branch () {
                this.branchData = [];
                this.branchName = '';
                this.fileTree = [];
                this.fileContent = '';
                this.axios.get(this.Global.serverSrc + this.apiService + '/branch?product_id=' + this.productId + '&project_type=' + this.projectType).then(
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
                this.axios.get(this.Global.serverSrc + this.apiService + '/file?product_id=' + this.productId + '&project_type=' + this.projectType + '&path=/&branch=' + this.branchName).then(
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
            // Pass in the path to get gitlab corresponding data
            fileListPath (path) {
                this.fileContent = '';
                this.axios.get(this.Global.serverSrc + this.apiService + '/file?product_id=' + this.productId + '&project_type=' + this.projectType + '&path=' + path + '&branch=' + this.branchName).then(
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
                this.filePath = filePath;
                if (filePath.length !== 0) {
                    this.formValidate.fileDir = filePath[0].path;
                }
                if (filePath.length !== 0 && filePath[0]['type'] !== 'tree') {
                    // If you click on the file, switch back to Tab as text
                    this.tab = 'text';
                    this.fileContent = '';
                    this.path = filePath[0]['path'];
                    this.axios.get(this.Global.serverSrc + this.apiService + '/content?product_id=' + this.productId + '&project_type=' + this.projectType + '&branch=' + this.branchName + '&path=' + this.path).then(
                        res => {
                            if (res.data['status'] === true) {
                                this.fileContent = res.data['data'];
                            } else {
                                this.nError('Get File Content Failure', res.data['message']);
                            }
                        },
                        err => {
                            let errInfo = '';
                            try {
                                errInfo = err.response.data['message'];
                            } catch (error) {
                                errInfo = err;
                            }
                            this.nError('Get File Content Failure', errInfo);
                        });
                }
            },
            // Expand the tree structure to get gitlab data
            loadData (item, callback) {
                this.fileListPath(item['path']);
                // fileListPath is an asynchronous method, waiting for 300ms
                setTimeout(() => {
                    callback(this.fileListPathData);
                }, 300);
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
                this.fileList();
                // Call hook to update
                this.handleHook();
            },
            handleEdit () {
                let postData = {
                    'path': this.path,
                    'project_type': this.projectType,
                    'branch': this.branchName,
                    'action': 'update',
                    'content': this.code
                };
                this.axios.post(this.Global.serverSrc + 'gitlab/commit?product_id=' + this.productId, postData).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.result = res.data['data'];
                            this.edit = false;
                            this.$Message.success('update completed！');
                            // Call hook to update
                            this.handleHook();
                            // this.fileList();
                        } else {
                            this.nError('Update Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Update Failure', errInfo);
                    });
            },
            // Delete prompt
            PopperShow () {
                this.title = 'Are you sure to delete ' + this.formValidate.fileDir + ' This file?';
            },
            handleDelete () {
                let postData = {
                    'path': this.formValidate.fileDir,
                    'project_type': this.projectType,
                    'branch': this.branchName,
                    'action': 'delete'
                };
                this.axios.post(this.Global.serverSrc + 'gitlab/commit?product_id=' + this.productId, postData).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.result = res.data['data'];
                            this.edit = false;
                            this.$Message.success('successfully deleted！');
                            // Refresh gitlab file list
                            this.fileList();
                            this.filePath = [];
                            this.formValidate.fileDir = '';
                            this.fileContent = '';
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
            handleCreate (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        let postData = {
                            'path': this.formValidate.fileDir,
                            'project_type': this.projectType,
                            'branch': this.branchName,
                            'action': 'create',
                            'content': this.code
                        };
                        this.axios.post(this.Global.serverSrc + 'gitlab/commit?product_id=' + this.productId, postData).then(
                            res => {
                                if (res.data['status'] === true) {
                                    this.result = res.data['data'];
                                    this.edit = false;
                                    this.$Message.success('Created successfully！');
                                    // Refresh gitlab file list
                                    this.fileList();
                                    this.filePath = [];
                                    this.formValidate.fileDir = '';
                                    this.reload();
                                } else {
                                    this.nError('Create Failure', res.data['message']);
                                }
                            },
                            err => {
                                let errInfo = '';
                                try {
                                    errInfo = err.response.data['message'];
                                } catch (error) {
                                    errInfo = err;
                                }
                                this.nError('Create Failure', errInfo);
                            });
                    } else {
                        this.$Message.error('Please check the form data！');
                    }
                });
            },
            handleHook () {
                let postData = {
                    'tag': 'gitfs/update'
                };
                this.axios.post(this.Global.serverSrc + 'hook?product_id=' + this.productId, postData).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.result = res.data['data'];
                        } else {
                            this.nError('Web Hook Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Web Hook Failure', errInfo);
                    });
            },
            onMounted (editor) {
                this.editor = editor;
            },
            onCodeChange (editor) {
                this.code = this.editor.getValue();
            },
            // Reload edit box
            reload () {
                clearTimeout(time);
                let time = setTimeout(() => {
                    this.$refs.vscode.destroyMonaco();
                    this.$refs.vscode.createMonaco();
                }, 1);
            },
            // Uploaded successfully
            UploadSuccess () {
                this.$Message.success('Uploaded successfully！');
                this.fileList();
            },
            // upload failed
            UploadError () {
                this.nError('Upload Failure', 'The file path is incorrect or file formats are not supported');
            },
            // Check the form before uploading
            beforeUpdate () {
                let form = false;
                this.$refs['formValidate'].validate((valid) => {
                    if (valid) {
                        form = true;
                    } else {
                        form = false;
                    }
                });
                return form;
            },
            // Form reset
            handleReset (name) {
                this.$refs[name].resetFields();
            },
            handleSLS (id, item, index) {
                if (item === 'file_managed') {
                    // id A blank description is a new step, no content has been added yet
                    if (id === '') {
                        // Clear the data in the fileManagedFormValidate form
                        this.handleReset('fileManagedFormValidate');
                    } else {
                        // Explain that it already exists in the fileManaged list to find the corresponding fileManagedFormValidate and assign it to the current fileManagedFormValidate
                        this.fileManaged.map(item => {
                            if (item.name === id) {
                                this.fileManagedFormValidate = item;
                            }
                        });
                    }
                    this.fileManagedFormView = true;
                    this.stepIndex = index;
                } else if (item === 'file_directory') {
                    if (id === '') {
                        this.handleReset('fileManagedFormValidate');
                    } else {
                        this.fileManaged.map(item => {
                            if (item.name === id) {
                                this.fileDirectoryFormValidate = item;
                            }
                        });
                    }
                    this.fileDirectoryFormView = true;
                    this.stepIndex = index;
                } else if (item === 'cmd_run') {
                    if (id === '') {
                        this.handleReset('fileManagedFormValidate');
                    } else {
                        this.fileManaged.map(item => {
                            if (item.name === id) {
                                this.cmdRunFormValidate = item;
                            }
                        });
                    }
                    this.cmdRunFormView = true;
                    this.stepIndex = index;
                } else if (item === 'pkg_installed') {
                    if (id === '') {
                        this.handleReset('fileManagedFormValidate');
                    } else {
                        this.fileManaged.map(item => {
                            if (item.name === id) {
                                this.pkgInstalledFormValidate = item;
                            }
                        });
                    }
                    this.pkgInstalledFormView = true;
                    this.stepIndex = index;
                }
            },
            handleAddStep (state) {
                let step = {
                    'state_name': '',
                    'id': '',
                    'show_name': ''
                };
                if (state === 'file_managed') {
                    step = {
                        'state_name': 'file_managed',
                        'another_name': 'Document management',
                        'id': '',
                        'show_name': 'Document management'
                    };
                } else if (state === 'file_directory') {
                    step = {
                        'state_name': 'file_directory',
                        'another_name': 'Directory management',
                        'id': '',
                        'show_name': 'Directory management'
                    };
                } else if (state === 'cmd_run') {
                    step = {
                        'state_name': 'cmd_run',
                        'another_name': 'Excuting an order',
                        'id': '',
                        'show_name': 'Excuting an order'
                    };
                } else if (state === 'pkg_installed') {
                    step = {
                        'state_name': 'pkg_installed',
                        'another_name': 'Install packages',
                        'id': '',
                        'show_name': 'Install packages'
                    };
                }
                this.steps.push(step);
            },
            handleDelStep (event, id) {
                // Delete in the process
                this.steps.map((item, index) => {
                    if (item.id === id) {
                        this.steps.splice(index, 1);
                    }
                });
                // Delete the corresponding module value in the post
                this.fileManaged.map((item, index) => {
                    if (item.name === id) {
                        this.fileManaged.splice(index, 1);
                    }
                });
                this.cmdRun.map((items, index) => {
                    if (items.name === id) {
                        this.cmdRun.splice(index, 1);
                    }
                });
                this.pkgInstalled.map((items, index) => {
                    if (items.name === id) {
                        this.pkgInstalled.splice(index, 1);
                    }
                });
                this.fileDirectory.map((items, index) => {
                    if (items.name === id) {
                        this.fileDirectory.splice(index, 1);
                    }
                });
            },
            handleFileManagedSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.steps[this.stepIndex].show_name = this.steps[this.stepIndex].another_name + '：' + this.fileManagedFormValidate.name;
                        this.steps[this.stepIndex].id = this.fileManagedFormValidate.name;
                        this.fileManagedFormView = false;
                        // After the addition is complete, add a file management
                        let tmp = nCopy(this.fileManagedFormValidate);
                        // If it exists, edit it again and modify the content directly
                        let status = true;
                        this.fileManaged.map((item, index) => {
                            if (item.name === tmp.name) {
                                this.fileManaged[index] = tmp;
                                status = false;
                            }
                        });
                        // status Description first added
                        if (status) {
                            this.fileManaged.push(tmp);
                        }
                    }
                });
            },
            handleCmdRunSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.steps[this.stepIndex].show_name = this.steps[this.stepIndex].another_name + '：' + this.cmdRunFormValidate.name;
                        this.steps[this.stepIndex].id = this.cmdRunFormValidate.name;
                        this.cmdRunFormView = false;
                        let tmp = nCopy(this.cmdRunFormValidate);
                        let status = true;
                        this.cmdRun.map((item, index) => {
                            if (item.name === tmp.name) {
                                this.cmdRun[index] = tmp;
                                status = false;
                            }
                        });
                        // status Description first added
                        if (status) {
                            this.cmdRun.push(tmp);
                        }
                    }
                });
            },
            handlePkgInstalledSubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.steps[this.stepIndex].show_name = this.steps[this.stepIndex].another_name + '：' + this.pkgInstalledFormValidate.name;
                        this.steps[this.stepIndex].id = this.pkgInstalledFormValidate.name;
                        this.pkgInstalledFormView = false;
                        let tmp = nCopy(this.pkgInstalledFormValidate);
                        let status = true;
                        this.pkgInstalled.map((item, index) => {
                            if (item.name === tmp.name) {
                                this.pkgInstalled[index] = tmp;
                                status = false;
                            }
                        });
                        // status Description first added
                        if (status) {
                            this.pkgInstalled.push(tmp);
                        }
                    }
                });
            },
            handleFileDirectorySubmit (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        this.steps[this.stepIndex].show_name = this.steps[this.stepIndex].another_name + '：' + this.fileDirectoryFormValidate.name;
                        this.steps[this.stepIndex].id = this.fileDirectoryFormValidate.name;
                        this.fileDirectoryFormView = false;
                        let tmp = nCopy(this.fileDirectoryFormValidate);
                        let status = true;
                        this.fileDirectory.map((item, index) => {
                            if (item.name === tmp.name) {
                                this.fileDirectory[index] = tmp;
                                status = false;
                            }
                        });
                        // status Description first added
                        if (status) {
                            this.fileDirectory.push(tmp);
                        }
                    }
                });
            },
            handleSLSCreate (name) {
                this.$refs[name].validate((valid) => {
                    if (valid) {
                        let postData = {
                            'path': this.formValidate.fileDir,
                            'project_type': this.projectType,
                            'branch': this.branchName,
                            'action': 'create',
                            'steps': this.steps,
                            'file_managed': this.fileManaged,
                            'file_directory': this.fileDirectory,
                            'cmd_run': this.cmdRun,
                            'pkg_installed': this.pkgInstalled
                        };
                        this.axios.post(this.Global.serverSrc + 'sls/create?product_id=' + this.productId, postData).then(
                            res => {
                                if (res.data['status'] === true) {
                                    this.result = res.data['data'];
                                    this.$Message.success('Created successfully！');
                                    // Refresh gitlab file list
                                    this.fileList();
                                    this.filePath = [];
                                    this.formValidate.fileDir = '';
                                    this.steps = [];
                                    this.handleReset('fileManagedFormValidate');
                                    this.handleReset('fileDirectoryFormValidate');
                                    this.handleReset('cmdRunFormValidate');
                                    this.handleReset('pkgInstalledFormValidate');
                                } else {
                                    this.nError('Create Failure', res.data['message']);
                                }
                            },
                            err => {
                                let errInfo = '';
                                try {
                                    errInfo = err.response.data['message'];
                                } catch (error) {
                                    errInfo = err;
                                }
                                this.nError('Create Failure', errInfo);
                            });
                    } else {
                        this.$Message.error('Please check the form data！');
                    }
                });
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