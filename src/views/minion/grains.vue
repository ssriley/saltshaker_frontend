<template>
    <div>
        <common-table
            :cColumns="cColumns"
            :apiService="apiService"
            @getProductEvent="getProductEvent"
            :productShow="true"
            ref="childrenMethods">
            <Button slot="create" type="primary" @click="sync()">Synchronize Grains</Button>
        </common-table>
        <Modal width="650px" v-model="showInfo" title="Details" :styles="{top: '20px'}">
            <highlight-code lang="json" style="overflow:auto" v-if="result">
                {{result}}
            </highlight-code>
            <div slot="footer"></div>
        </Modal>
        <Modal slot="option" v-model="syncHost" title="Sync Host">
            <div style="text-align:center">
                This function will synchronize Grains information according to Minion status to ensure data consistency
                <Button type="success" size="small" @click="handleSync()">Synchronize</Button>
                <Progress v-show="progress" :percent="percent" status="active"></Progress>
            </div>
            <div slot="footer">
                <Button type="ghost" @click="handleCancel()" style="margin-left: 8px">cancel</Button>
            </div>
        </Modal>
</div>

</template>

<script>
    import CommonTable from '../common-components/table/grain_table.vue';
    export default {
        components: {
            CommonTable
        },
        data () {
            return {
                apiService: 'minions/grain?minion=*',
                showInfo: false,
                result: '',
                productId: '',
                syncHost: false,
                progress: false,
                minion: [],
                rowData: [],
                productData: [],
                percent: 0,
                cColumns: [
                    {
                        title: 'id',
                        key: 'id',
                        sortable: true,
                        width: 160,
                        fixed: 'left',
                        render: (h, params) => {
                            return h('div', [
                                h('div', {
                                    props: {
                                        type: 'text',
                                        size: 'small'
                                    },
                                    on: {
                                        click: () => {
                                            this.grains(params.row.id);
                                        }
                                    }
                                }, params.row.id)
                            ]);
                        }
                    },
                    {
                        title: 'fqdn',
                        key: 'fqdn',
                        width: 160,
                        sortable: true
                    },
                    {
                        title: 'ipv4',
                        key: 'ipv4',
                        width: 130,
                        sortable: true,
                        render: (h, params) => {
                            if (params.row.ipv4 === undefined) {
                                return '';
                            }
                            return h('ul', params.row.ipv4.map(item => {
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
                        title: 'os',
                        key: 'os',
                        sortable: true,
                        width: 140
                    },
                    {
                        title: 'osrelease',
                        key: 'osrelease',
                        sortable: true,
                        width: 140
                    },
                    {
                        title: 'cpu',
                        key: 'num_cpus',
                        width: 80,
                        sortable: true
                    },
                    {
                        title: 'cpu_model',
                        key: 'cpu_model',
                        width: 190,
                        sortable: true
                    },
                    {
                        title: 'mem_total',
                        key: 'mem_total',
                        width: 130,
                        sortable: true
                    },
                    {
                        title: 'gpu',
                        key: 'num_gpus',
                        width: 80,
                        sortable: true
                    },
                    {
                        title: 'kernelrelease',
                        key: 'kernelrelease',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: 'cpuarch',
                        key: 'cpuarch',
                        width: 110,
                        sortable: true
                    },
                    {
                        title: 'nameservers',
                        key: 'nameservers',
                        width: 130,
                        sortable: true,
                        render: (h, params) => {
                            if (params.row.dns === undefined) {
                                return '';
                            }
                            return h('ul', params.row.dns.nameservers.map(item => {
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
                        title: 'selinux',
                        key: 'selinux',
                        width: 145,
                        sortable: true,
                        render: (h, params) => {
                            if (params.row.selinux === undefined) {
                                return '';
                            }
                            let selinux = [];
                            for (let k in params.row.selinux) {
                                selinux.push(k + ' : ' + params.row.selinux[k]);
                            }
                            return h('ul', selinux.map(item => {
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
                        title: 'locale_info',
                        key: 'locale_info',
                        width: 190,
                        sortable: true,
                        render: (h, params) => {
                            if (params.row.locale_info === undefined) {
                                return '';
                            }
                            let localeInfo = [];
                            for (let k in params.row.locale_info) {
                                localeInfo.push(k + ' : ' + params.row.locale_info[k]);
                            }
                            return h('ul', localeInfo.map(item => {
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
                        title: 'pythonversion',
                        key: 'pythonversion',
                        width: 140,
                        sortable: true,
                        render: (h, params) => {
                            return h('div', params.row.pythonversion.join('.'));
                        }
                    },
                    {
                        title: 'saltversion',
                        key: 'saltversion',
                        width: 120,
                        sortable: true
                    },
                    {
                        title: 'zmqversion',
                        key: 'zmqversion',
                        width: 130,
                        sortable: true
                    },
                    {
                        title: 'manufacturer',
                        key: 'manufacturer',
                        width: 140,
                        sortable: true
                    },
                    {
                        title: 'WhoAmI',
                        key: 'whoami',
                        width: 140,
                        sortable: true
                    },
                    {
                        title: 'Nebula Groups',
                        key: 'nebula',
                        width: 130,
                        sortable: true,
                        render: (h, params) => {
                            if (params.row.nebula === undefined) {
                                return '';
                            }
                            return h('ul', params.row.nebula.map(item => {
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
                        title: 'productname',
                        key: 'productname',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: 'biosversion',
                        key: 'biosversion',
                        width: 130,
                        sortable: true
                    },
                    {
                        title: 'serialnumber',
                        key: 'serialnumber',
                        width: 150,
                        sortable: true
                    },
                    {
                        title: 'biosreleasedate',
                        key: 'biosreleasedate',
                        width: 150,
                        sortable: true
                    }
                ]
            };
        },
        methods: {
            getProductEvent: function (productData, productId) {
                this.productData = productData;
                this.productId = productId;
            },
            // Call subcomponent to refresh data
            tableList () {
                this.$refs.childrenMethods.tableList();
            },
            // Call sub-component message notification
            nError (title, info) {
                this.$refs.childrenMethods.nError(title, info);
            },
            grains (id) {
                this.axios.get(this.Global.serverSrc + 'minions/grain?minion=' + id + '&product_id=' + this.productId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.result = res.data['data'];
                            this.showInfo = true;
                            this.loading = true;
                        } else {
                            this.result = '';
                            this.loading = false;
                            this.nError('Get Grains Failure', res.data['message']);
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
                        this.loading = false;
                        this.nError('Get Grains Failure', errInfo);
                    });
            },
            handleCancel () {
                this.formView = false;
                this.syncHost = false;
            },
            sync () {
                this.syncHost = true;
                this.progress = false;
                this.percent = 0;
            },
            handleSync () {
                this.progress = true;
                this.axios.get(this.Global.serverSrc + 'grains/sync?product_id=' + this.productId).then(
                    res => {
                        if (res.data['status'] === true) {
                            this.percent = 100;
                            this.tableList();
                        } else {
                            this.loading = false;
                            this.nError('Sync Grains Failure', res.data['message']);
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
                        this.nError('Get Grains Failure', errInfo);
                    });
            }
        }
    };
</script>