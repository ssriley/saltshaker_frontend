<style lang="less">
    @import './own-space.less';
</style>

<template>
    <div>
        <Card>
            <p slot="title">
                <Icon type="person"></Icon>
                Personal information
            </p>
            <div>
                <Form 
                    ref="userForm"
                    :model="userForm" 
                    :label-width="100" 
                    label-position="right"
                    :rules="infoValidate"
                >
                    <FormItem label="ID：">
                        <span>{{ userForm.id }}</span>
                    </FormItem>
                    <FormItem label="username：" prop="username">
                        <div style="display:inline-block;width:300px;">
                            <Input v-model="userForm.username" ></Input>
                        </div>
                    </FormItem>
                    <FormItem label="email：" prop="mail">
                        <div style="display:inline-block;width:300px;">
                            <Input v-model="userForm.mail" ></Input>
                        </div>
                    </FormItem>
                    <FormItem label="login password：">
                        <Button type="text" size="small" @click="showEditPassword">change Password</Button>
                    </FormItem>
                    <FormItem>
                        <Button type="primary" style="width: 300px;" @click="saveEdit">Save</Button>
                    </FormItem>
                </Form>
            </div>
        </Card>
        <Modal v-model="editPasswordModal" :closable='false' :mask-closable=false :width="500">
            <h3 slot="header">change Password</h3>
            <Form ref="editPasswordForm" :model="editPasswordForm" :label-width="82" label-position="right" :rules="passwordValidate">
                <FormItem label="old password" prop="oldPass" :error="oldPassError">
                    <Input type="password" v-model="editPasswordForm.oldPass" placeholder="Please enter the current password" ></Input>
                </FormItem>
                <FormItem label="new password" prop="newPass">
                    <Input type="password" v-model="editPasswordForm.newPass" placeholder="Please enter a new password, at least 6 characters" ></Input>
                </FormItem>
                <FormItem label="Confirm the new password" prop="rePass">
                    <Input type="password" v-model="editPasswordForm.rePass" placeholder="Please enter the new password again" ></Input>
                </FormItem>
            </Form>
            <div slot="footer">
                <Button type="text" @click="cancelEditPass">cancel</Button>
                <Button type="primary" @click="saveEditPass">Save</Button>
            </div>
        </Modal>
    </div>
</template>

<script>
import Cookies from 'js-cookie';
import jsEncrypt from 'jsencrypt/bin/jsencrypt';
export default {
    name: 'ownspace_index',
    data () {
        const valideRePassword = (rule, value, callback) => {
            if (value !== this.editPasswordForm.newPass) {
                callback(new Error('Two passwords are inconsistent'));
            } else {
                callback();
            }
        };
        return {
            editPasswordModal: false,
            userForm: {
                id: '',
                username: '',
                mail: ''
            },
            publicKey: '',
            oldPassError: '',
            infoValidate: {
                username: [
                    { required: true, message: 'Please type in your name', trigger: 'blur' }
                ],
                mail: [
                    { required: true, message: 'E-mail can not be empty', trigger: 'blur' },
                    { type: 'email', message: 'Invalid email format', trigger: 'blur' }
                ]
            },
            editPasswordForm: {
                oldPass: '',
                newPass: '',
                rePass: ''
            },
            passwordValidate: {
                oldPass: [
                    { required: true, message: 'Please enter the original password', trigger: 'blur' }
                ],
                newPass: [
                    { required: true, message: 'Please enter a new password', trigger: 'blur' },
                    { min: 6, message: '请Please enter at least 6 characters', trigger: 'blur' },
                    { max: 32, message: 'Enter up to 32 characters', trigger: 'blur' }
                ],
                rePass: [
                    { required: true, message: 'Please enter the new password again', trigger: 'blur' },
                    { validator: valideRePassword, trigger: 'blur' }
                ]
            }
        };
    },
    computed: {
        uid () {
            // Stored in localStorage solves the problem that the value of vuex disappears when refreshing the page
            if (this.$store.state.globalInfo.uid === '') {
                this.$store.commit('setUserId', localStorage.user);
            }
            return this.$store.state.globalInfo.uid;
        }
    },
    methods: {
        showEditPassword () {
            this.editPasswordModal = true;
            this.RSA();
        },
        cancelEditUserInfor () {
            this.$store.commit('removeTag', 'ownspace_index');
            localStorage.pageOpenedList = JSON.stringify(this.$store.state.app.pageOpenedList);
            let lastPageName = '';
            if (this.$store.state.app.pageOpenedList.length > 1) {
                lastPageName = this.$store.state.app.pageOpenedList[1].name;
            } else {
                lastPageName = this.$store.state.app.pageOpenedList[0].name;
            }
            this.$router.push({
                name: lastPageName
            });
        },
        saveEdit () {
            this.$refs['userForm'].validate((valid) => {
                if (valid) {
                    let postData = {
                        'username': this.userForm.username,
                        'mail': this.userForm.mail
                    };
                    this.axios.put(this.Global.serverSrc + 'user/change/' + this.uid, postData).then(
                        res => {
                            if (res.data['status'] === true) {
                                this.$Message.success('Successfully modified！');
//                                Cookies.set('user', this.userForm.username);
//                                localStorage.username = this.userForm.username;
                            } else {
                                this.nError('Change user info', res.data['message']);
                            }
                        },
                        err => {
                            let errInfo = '';
                            try {
                                errInfo = err.response.data['message'];
                            } catch (error) {
                                errInfo = err;
                            }
                            this.nError('Change user info', errInfo);
                        });
                }
            });
        },
        cancelEditPass () {
            this.editPasswordModal = false;
        },
        saveEditPass () {
            this.$refs['editPasswordForm'].validate((valid) => {
                if (valid) {
                    // Use rsa to encrypt the password
                    let jse = new jsEncrypt();
                    jse.setPublicKey(this.publicKey);
                    let postData = {
                        'username': Cookies.get('user'),
                        'old_password': jse.encrypt(this.editPasswordForm.oldPass),
                        'new_password': jse.encrypt(this.editPasswordForm.newPass)
                    };
                    this.axios.post(this.Global.serverSrc + 'user/reset/owner/' + this.uid, postData).then(
                        res => {
                            if (res.data['status'] === true) {
                                this.editPasswordModal = false;
                                this.$Message.success('Password reset succeeded！');
                            } else {
                                this.nError('Reset Password', res.data['message']);
                            }
                        },
                        err => {
                            let errInfo = '';
                            try {
                                errInfo = err.response.data['message'];
                            } catch (error) {
                                errInfo = err;
                            }
                            this.nError('Reset Password', errInfo);
                        });
                }
            });
        },
        init () {
            this.axios.get(this.Global.serverSrc + 'user/' + this.uid).then(
                res => {
                    if (res.data['status'] === true) {
                        this.userForm = res.data['data'];
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
                    this.nError('Get User Failure', errInfo);
                });
        },
        // Redefine the error message
        nError (title, info) {
            this.$Notice.error({
                title: title,
                // Replace <> to avoid being parsed as html tags
                desc: info.toString().replace(/<|>/g, ''),
                duration: 10
            });
        },
        // Get rsa public key
        RSA () {
            this.axios.get(this.Global.serverSrc + 'rsa').then(
                res => {
                    if (res.data['status'] === true) {
                        this.publicKey = res.data['data'];
                    } else {
                        this.nError('Encryption failed:', res.data['message']);
                    }
                },
                err => {
                    let errInfo = '';
                    try {
                        errInfo = err.response.data['message'];
                    } catch (error) {
                        errInfo = err;
                    }
                    this.nError('Encryption failed:', errInfo);
                });
        }
    },
    mounted () {
        this.init();
    }
};
</script>
