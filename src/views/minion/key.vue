<template>
    <div>
        <common-table
                :cColumns="cColumns"
                :apiService="apiService"
                @getProductEvent="getProductEvent"
                @getRowEvent="getRowEvent"
                :productShow="true" ref="childrenMethods">
            <Modal slot="option" v-model="key" :title="title" @on-ok="handleSubmit">
                <div style="text-align:center">
                    <p v-for="item in rowData">{{item.minions_id}}</p>
                </div>
            </Modal>
            <Button v-show="buttonShow" slot="accept" @click="handleSelectAll('Accept all','accept')">'Accept all'</Button>
            <Button v-show="buttonShow" slot="reject" @click="handleSelectAll('Reject all','reject')">Reject all</Button>
            <Button v-show="buttonShow" slot="delete" @click="handleSelectAll('Delete all','delete')">Delete all</Button>
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
                apiService: 'minions/key',
                productData: [],
                productId: '',
                showInfo: false,
                key: false,
                title: '',
                minion: [],
                rowData: [],
                action: '',
                buttonShow: false,
                // delete data
                delId: '',
                delIndex: '',
                result: '',
                cColumns: [
                    {
                        type: 'selection',
                        width: 60,
                        align: 'center'
                    },
                    {
                        title: 'Minions',
                        key: 'minions_id',
                        sortable: true
                    },
                    {
                        title: 'Status',
                        key: 'minions_status',
                        sortable: true,
                        render: (h, params) => {
                            let tagColor = 'red';
                            if (params.row.minions_status === 'Accepted') {
                                tagColor = 'green';
                            }
                            if (params.row.minions_status === 'Unaccepted') {
                                tagColor = 'yellow';
                            }
                            return h('div', [
                                h('Tag', {
                                    props: {
                                        'color': tagColor
                                    }
                                }, params.row.minions_status)
                            ]);
                        }
                    },
                    {
                        title: 'accept Key',
                        sortable: true,
                        align: 'center',
                        render: (h, params) => {
                            let buttonDisabled = true;
                            if (params.row.minions_status === 'Unaccepted') {
                                buttonDisabled = false;
                            }
                            return h('div', [
                                h('Poptip', {
                                    props: {
                                        confirm: true,
                                        title: 'Sure to accept ' + params.row.minions_id + ' ?',
                                        transfer: true,
                                        placement: 'top-end'
                                    },
                                    on: {
                                        'on-ok': () => {
                                            this.delId = params.row.minions_id;
                                            this.delIndex = params.index;
                                            this.minion = [params.row.minions_id];
                                            this.keyManage('accept');
                                        }
                                    }
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'success',
                                            disabled: buttonDisabled,
                                            size: 'small'
                                        }
                                    }, 'accept')
                                ])
                            ]);
                        }
                    },
                    {
                        title: 'Refuse Key',
                        sortable: true,
                        align: 'center',
                        render: (h, params) => {
                            let buttonDisabled = true;
                            if (params.row.minions_status === 'Unaccepted') {
                                buttonDisabled = false;
                            }
                            return h('div', [
                                h('Poptip', {
                                    props: {
                                        confirm: true,
                                        title: 'Are you sure to reject' + params.row.minions_id + ' ?',
                                        transfer: true,
                                        placement: 'top-end'
                                    },
                                    on: {
                                        'on-ok': () => {
                                            this.delId = params.row.minions_id;
                                            this.delIndex = params.index;
                                            this.minion = [params.row.minions_id];
                                            this.keyManage('reject');
                                        }
                                    }
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'warning',
                                            disabled: buttonDisabled,
                                            size: 'small'
                                        }
                                    }, 'Refuse')
                                ])
                            ]);
                        }
                    },
                    {
                        title: 'delete Key',
                        sortable: true,
                        align: 'center',
                        render: (h, params) => {
                            return h('div', [
                                h('Poptip', {
                                    props: {
                                        confirm: true,
                                        title: 'Are you sure you want to delete ' + params.row.minions_id + ' ?',
                                        transfer: true,
                                        placement: 'top-end'
                                    },
                                    on: {
                                        'on-ok': () => {
                                            this.delId = params.row.minions_id;
                                            this.delIndex = params.index;
                                            this.minion = [params.row.minions_id];
                                            this.keyManage('delete');
                                        }
                                    }
                                }, [
                                    h('Button', {
                                        props: {
                                            type: 'error',
                                            disabled: false,
                                            size: 'small'
                                        }
                                    }, 'delete')
                                ])
                            ]);
                        }
                    },
                ]
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
            // Call sub-component message notification
            nError (title, info) {
                this.$refs.childrenMethods.nError(title, info);
            },
            // Call subcomponent to refresh data
            tableList () {
                this.$refs.childrenMethods.tableList();
            },
            handleSelectAll (title, action) {
                this.key = true;
                this.title = title;
                this.action = action;
                // Obtain minion id
                this.minion = [];
                for (var i = 0; i < this.rowData.length; i++) {
                    this.minion.push(this.rowData[i]['minions_id']);
                }
            },
            // Processing OK
            handleSubmit () {
                this.keyManage(this.action);
                this.action = '';
            },
            // key management
            keyManage (action) {
                let postData = {
                    'minion_id': this.minion
                };
                this.axios.post(this.Global.serverSrc + this.apiService + '?product_id=' + this.productId + '&action=' + action,
                    postData).then(
                    res => {
                        this.buttonShow = false;
                        if (res.data['status'] === true) {
                            this.formView = false;
                            this.$Message.success('success！');
                            this.tableList();
                        } else {
                            this.nError(action.substring(0, 1).toUpperCase() + action.substring(1) + ' Failure', res.data['message']);
                        };
                    },
                    err => {
                        this.buttonShow = false;
                        let errInfo = '';
                        try {
                            errInfo = err.response.data['message'];
                        } catch (error) {
                            errInfo = err;
                        }
                        this.nError(action.substring(0, 1).toUpperCase() + action.substring(1) + ' Failure', errInfo);
                    });
            }
        }
    };
</script>