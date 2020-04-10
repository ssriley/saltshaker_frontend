<style lang="less">
    @import './login.less';
</style>

<template>
    <div class="login" @keydown.enter="handleSubmit">
        <div class="login-con">
            <Card :bordered="false">
                <p slot="title">
                    <Icon type="log-in"></Icon>
                    welcome
                </p>
                <div class="form-con">
                    <Tabs v-model="tab" :style="[h]">
                        <TabPane label="log in" name="login">
                            <Form ref="loginForm" :model="form" :rules="rules">
                                <FormItem prop="userName">
                                    <Input v-model="form.userName" placeholder="Enter your user name">
                                        <span slot="prepend">
                                            <Icon :size="16" type="person"></Icon>
                                        </span>
                                    </Input>
                                </FormItem>
                                <FormItem prop="password">
                                    <Input type="password" v-model="form.password" placeholder="Please enter the password">
                                        <span slot="prepend">
                                            <Icon :size="16" type="locked"></Icon>
                                        </span>
                                    </Input>
                                </FormItem>
                                <FormItem>
                                    <Button @click="handleSubmit" type="primary" long>log in</Button>
                                </FormItem>
                            </Form>
                        </TabPane>
                        <TabPane label="Sign Up" name="register">
                            <Form ref="registerForm" :model="registerForm" :rules="registerRules">
                                <FormItem prop="userName">
                                    <Input v-model="registerForm.userName" placeholder="Enter your user name">
                                        <span slot="prepend">
                                            <Icon :size="16" type="person"></Icon>
                                        </span>
                                    </Input>
                                </FormItem>
                                 <FormItem prop="mail">
                                     <Input v-model="registerForm.mail" placeholder="Enter your email">
                                        <span slot="prepend">
                                            <Icon :size="16" type="email"></Icon>
                                        </span>
                                     </Input>
                                </FormItem>
                                <FormItem prop="password">
                                    <Input type="password" v-model="registerForm.password" placeholder="Please enter the password，At least 6 characters" >
                                        <span slot="prepend">
                                            <Icon :size="16" type="locked"></Icon>
                                        </span>
                                    </Input>
                                </FormItem>
                                <FormItem prop="rePassword">
                                    <Input type="password" v-model="registerForm.rePassword" placeholder="Please enter the password again" >
                                        <span slot="prepend">
                                            <Icon :size="16" type="unlocked"></Icon>
                                        </span>
                                    </Input>
                                </FormItem>
                                <FormItem>
                                    <Button @click="handleRegister" type="primary" long>register</Button>
                                </FormItem>
                            </Form>
                        </TabPane>
                    </Tabs>
                </div>
            </Card>
        </div>
    </div>
</template>

<script>
import Cookies from 'js-cookie';
import jsEncrypt from 'jsencrypt/bin/jsencrypt';
export default {
    data () {
        const valideRePassword = (rule, value, callback) => {
            if (value !== this.registerForm.password) {
                callback(new Error('Two passwords are inconsistent'));
            } else {
                callback();
            }
        };
        return {
            token: '',
            publicKey: this.RSA(),
            tab: 'login',
            h: {
                height: '209px'
            },
            form: {
                userName: '',
                password: ''
            },
            rules: {
                userName: [
                    { required: true, message: 'Username can not be empty', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: 'Password can not be empty', trigger: 'blur' }
                ]
            },
            registerForm: {
                userName: '',
                password: '',
                mail: ''
            },
            registerRules: {
                userName: [
                    { required: true, message: 'Username can not be empty', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: 'Please enter the password', trigger: 'blur' },
                    { min: 6, message: 'Please enter at least 6 characters', trigger: 'blur' }
                ],
                rePassword: [
                    { required: true, message: 'Please enter the password again', trigger: 'blur' },
                    { validator: valideRePassword, trigger: 'blur' }
                ],
                mail: [
                    { required: true, message: 'E-mail can not be empty', trigger: 'blur' },
                    { type: 'email', message: 'Invalid email format', trigger: 'blur' }
                ]
            }
        };
    },
    watch: {
        tab () {
            if (this.tab === 'login') {
                this.h.height = '209px';
            } else {
                this.h.height = '320px';
            }
        }
    },
    methods: {
        handleSubmit () {
            this.$refs.loginForm.validate((valid) => {
                if (valid) {
                    // Use rsa to encrypt the password
                    let jse = new jsEncrypt();
                    jse.setPublicKey(this.publicKey);
                    let passwordRsa = jse.encrypt(this.form.password);
                    this.$store.commit('setAvator', 'https://avatars2.githubusercontent.com/u/13944988?s=40&v=4');
                    let postData = {
                        'username': this.form.userName,
                        'password': passwordRsa
                    };
                    this.axios.post(this.Global.serverSrc + 'login', postData).then(
                        res => {
                            if (res.data['status'] === true) {
                                let info = res.data['data'];
                                Cookies.set('user', this.form.userName);
                                // The backend returns the expiration time, which is converted into days in seconds
                                let expireDays = info['token']['expires'] / 60 / 60 / 24;
                                Cookies.set(info['token']['key'], info['token']['value'], { expires: expireDays });
                                Cookies.set('tag', info['token']['key']);
                                // Cookies.set('access', 0);
                                // 设置UID
                                this.$store.commit('setUserId', info['user']['uid']);
                                // Stored in localStorage solves the problem that the value of vuex disappears when refreshing the page
                                localStorage.user = info['user']['uid'];
                                // Store menu information
                                localStorage.menu = info['user']['menu'];
                                // this.$store.commit('setUsername', this.form.userName);
                                // localStorage.username = this.form.userName;
                                this.$router.push({
                                    name: 'home_index'
                                });
                            } else {
                                this.nError('Login failed:', res.data['message']);
                            }
                        },
                        err => {
                            let errInfo = '';
                            try {
                                errInfo = err.response.data['message'];
                            } catch (error) {
                                errInfo = err;
                            }
                            this.nError('Login failed:', errInfo);
                        });
                }
            });
        },
        handleRegister () {
            this.$refs.registerForm.validate((valid) => {
                if (valid) {
                    // Use rsa to encrypt the password
                    let jse = new jsEncrypt();
                    jse.setPublicKey(this.publicKey);
                    let passwordRsa = jse.encrypt(this.registerForm.password);
                    let postData = {
                        'username': this.registerForm.userName,
                        'password': passwordRsa,
                        'mail': this.registerForm.mail
                    };
                    this.axios.post(this.Global.serverSrc + 'user/register', postData).then(
                        res => {
                            if (res.data['status'] === true) {
                                this.$Message.success('registration success！');
                                this.tab = 'login';
                                this.$refs['registerForm'].resetFields();
                            } else {
                                this.nError('registration failed:', res.data['message']);
                            }
                        },
                        err => {
                            let errInfo = '';
                            try {
                                errInfo = err.response.data['message'];
                            } catch (error) {
                                errInfo = err;
                            }
                            this.nError('registration failed:', errInfo);
                        });
                }
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
    }
};
</script>
