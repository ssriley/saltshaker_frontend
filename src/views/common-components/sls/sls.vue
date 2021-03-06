<style lang="less">
    @import '../../../styles/common.less';
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
                            <common-execute
                                    :apiService="apiService"
                                    :productShow="true"
                                    :productId="productId"
                                    :slsCommand="path"
                                    :slsURI = "slsURI"
                                    ref="childrenMethods">
                                <FormItem label="SLS" prop="command" slot="command">
                                    <highlight-code lang="yaml" style="overflow:auto">
                                    {{fileContent}}
                                    </highlight-code>
                                </FormItem>
                                <Button type="dashed" :disabled="editDisabled" @click="handleEdit()" slot="commitButton">Edit</Button>
                            </common-execute>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
        <Modal width="750px" v-model="edit" title="Edit">
            <MonacoEditor
                height="300"
                width="100%"
                language="yaml"
                srcPath="dist"
                :code="fileContent"
                :options="options"
                :highlighted="highlightLines"
                :changeThrottle="700"
                theme="vs-dark"
                @mounted="onMounted"
                @codeChange="onCodeChange"
                ref="vscode"
                >
            </MonacoEditor>
            <div slot="footer">
                <Button type="text" @click="handleCancel">Cancel</Button>
                <Button type="success" @click="handleCommit">Submit</Button>
            </div>
        </Modal>

    </div>
</template>

<script>
    import commonExecute from '../../common-components/execute/common-execute.vue';
    import MonacoEditor from 'vue-monaco-editor';
    export default {
        components: {
            commonExecute,
            MonacoEditor
        },
        name: 'CommonSLS',
        data () {
            return {
                productData: this.productList(),
                productId: '',
                productStateProject: '',
                branchData: [],
                branchName: '',
                fileTreeData: [],
                fileTree: [],
                fileListPathData: [],
                // Edit
                edit: false,
                editDisabled: true,
                filePath: '',
                fileContent: '',
                path: '',
                apiHistory: '',
                code: '',
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
                this.reload();
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
                if (filePath.length !== 0 && filePath[0]['type'] !== 'tree') {
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
                // fileListPath is an asynchronous method, waiting for 500ms
                setTimeout(() => {
                    callback(this.fileListPathData);
                }, 500);
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
                this.editDisabled = true;
            },
            handleCancel () {
                // Request the content of the file again after canceling the editing in order to restore the content of the file
                // Temporarily closed
                // this.handleContent(this.filePath);
                this.edit = false;
            },
            handleEdit () {
                this.edit = true;
                this.code = this.fileContent;
            },
            handleCommit () {
                let postData = {
                    'path': this.path,
                    'project_type': this.projectType,
                    'branch': this.branchName,
                    'action': 'update',
                    'content': this.code
                };
                this.fileContent = this.code;
                this.axios.post(this.Global.serverSrc + 'gitlab/commit?product_id=' + this.productId, postData).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.result = res.data['data'];
                            this.edit = false;
                            this.$Message.success('success！');
                            // Call hook to update
                            this.handleHook();
                        } else {
                            this.nError('Commit Failure', res.data['message']);
                        }
                    },
                    err => {
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError('Commit Failure', errInfo);
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
                console.log(this.editor.getValue());
                this.code = this.editor.getValue();
            },
            // Reload edit box
            reload () {
                clearTimeout(time);
                let time = setTimeout(() => {
                    this.$refs.vscode.destroyMonaco();
                    this.$refs.vscode.createMonaco();
                }, 2);
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
