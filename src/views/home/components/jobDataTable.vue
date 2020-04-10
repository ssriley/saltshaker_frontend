<template>
    <div :style="styleObj">
        <Table :height="height" :columns="columns" :data="jobData" border></Table>
    </div>
</template>

<script>
export default {
    name: 'jobDataTable',
    data () {
        return {
            jobData: this.tableList(),
            columns: [
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
                    render: (h, params) => {
                        if (params.row.scheduler === 'once') {
                            return 'once';
                        } else if (params.row.scheduler === 'period') {
                            return 'cycle';
                        } else {
                            return 'Scheduled Tasks';
                        }
                    }
                },
                {
                    title: 'cycle',
                    key: 'period',
                    sortable: true,
                    render: (h, params) => {
                        return params.row.period.interval + '/' + params.row.period.type[0];
                    }
                },
                {
                    title: 'Update time',
                    key: 'timestamp',
                    sortable: true,
                    width: 160,
                    render: (h, params) => {
                        return params.row.audit.map(item => {
                            return this.formatTime(item.result.timestamp);
                        });
                    }
                },
                {
                    title: 'status',
                    key: 'status',
                    sortable: true,
                    width: 120,
                    render: (h, params) => {
                        let tagColor = 'green';
                        if (params.row.status.id === 4) {
                            tagColor = 'red';
                        }
                        return h('div', [
                            h('Tag', {
                                props: {
                                    'color': tagColor
                                }
                            }, params.row.status.name)
                        ]);
                    }
                }
            ]
        };
    },
    props: {
        styleObj: Object,
        height: String,
        productId: {
            type: String,
            required: true
        }
    },
    watch: {
        productId () {
            this.tableList();
        }
    },
    methods: {
        tableList () {
            this.axios.get(this.Global.serverSrc + 'period' + '?product_id=' + this.productId + '&scheduler_type=once').then(
                res => {
                    if (res.data['status'] === true) {
                        this.jobData = res.data['data'];
                    } else {
                        this.nError('Get Info Failure', res.data['message']);
                    };
                },
                err => {
                    let errInfo = '';
                    try {
                        errInfo = err.response.data['message'];
                        if (err.response.status === 404) {
                            this.jobData = [];
                        } else {
                            this.nError('Get Info Failure', errInfo);
                        }
                    } catch (error) {
                        errInfo = err;
                        this.nError('Get Info Failure', errInfo);
                    }
                    this.jobData = [];
                });
        },
        nError (title, info) {
            this.$Notice.error({
                title: title,
                // Replace <> to avoid being parsed as html tags
                desc: info.toString().replace(/<|>/g, ''),
                duration: 10
            });
        },
        formatTime (time) {
            let unixtime = time;
            let unixTimestamp = new Date(unixtime * 1000);
            let Y = unixTimestamp.getFullYear();
            let M = ((unixTimestamp.getMonth() + 1) > 10 ? (unixTimestamp.getMonth() + 1) : '0' + (unixTimestamp.getMonth() + 1));
            let D = (unixTimestamp.getDate() >= 10 ? unixTimestamp.getDate() : '0' + unixTimestamp.getDate());
            let h = (unixTimestamp.getHours() >= 10 ? unixTimestamp.getHours() : '0' + unixTimestamp.getHours());
            let m = (unixTimestamp.getMinutes() >= 10 ? unixTimestamp.getMinutes() : '0' + unixTimestamp.getMinutes());
            let s = (unixTimestamp.getSeconds() >= 10 ? unixTimestamp.getSeconds() : '0' + unixTimestamp.getSeconds());
            let toDay = Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s;
            return toDay;
        }
    }
};
</script>
