<template>
    <div>
        <Row class="margin-top-10">
            <Card dis-hover>
                <p slot="title">
                    Task detail
                </p>
                <Table :columns="columns" :data="task" :show-header="false" :border="true"></Table>
            </Card>
        </Row>
    </div>
</template>

<script>
export default {
    data () {
        return {
            period: '',
            // Turn off cleanup timer refresh
            timer: null,
            columns: [
                {
                    title: '',
                    key: 'key',
                    // className: 'demo-table-info-column',
                    width: 150
                },
                {
                    title: '',
                    key: 'value',
                    render: (h, params) => {
                        if (params.row.key === 'Target group') {
                            return h('ul', params.row.value.map(item => {
                                return h('li', {
                                    style: {
                                        textAlign: 'left',
                                        padding: '0px'
                                    }
                                }, item.name);
                            })
                            );
                        } else if (params.row.key === 'result') {
                            return h('ul', params.row.value.map(item => {
                                return h('li', [
                                    h('Tag', item.option),
                                    h('Tag', {
                                        props: {
                                            'color': 'green'
                                        }
                                    }, this.formatTime(item.time)),
                                    h('div', Object.keys(item.result).map(k => {
                                        // When SLS is executed, an object is returned
                                        if (typeof item.result[k] === 'object') {
                                            return h('highlight-code', {
                                                props: {
                                                    'lang': 'yaml',
                                                    'style': 'overflow:auto'
                                                }
                                            }, 'Minion: ' + k + '\n' + JSON.stringify(item.result[k]).replace(/,/g, ',\n  ').replace(/{/g, '{\n  ').replace(/}/g, '}\n  '));
                                        } else {
                                            return h('highlight-code', {
                                                props: {
                                                    'lang': 'yaml',
                                                    'style': 'overflow:auto'
                                                }
                                            }, 'Minion: ' + k + '\n' + item.result[k]);
                                        }
                                    }))
                                ]);
                            }));
                        } else if (params.row.key === 'ID') {
                            return h('div', [
                                h('Tag', {
                                    props: {
                                        'color': 'green'
                                    }
                                }, params.row.value)
                            ]);
                        } else if (params.row.key === 'Shell') {
                            return h('highlight-code', {
                                props: {
                                    'lang': 'yaml',
                                    'style': 'overflow:auto'
                                }
                            }, params.row.value);
                        } else if (params.row.key === 'Scheduling') {
                            if (params.row.value === 'once') {
                                return 'once';
                            } else {
                                return 'cycle';
                            }
                        } else if (params.row.key === 'audit') {
                            return h('ul', params.row.value.map(item => {
                                if (item.timestamp === '') {
                                    return '.........';
                                } else {
                                    return h('li', [
                                        h('Tag', {
                                            props: {
                                                'color': 'yellow'
                                            }
                                        }, this.formatTime(item.timestamp)),
                                        h('Tag', {
                                            props: {
                                                'color': 'green'
                                            }
                                        }, item.user),
                                        h('Tag', {}, item.option)
                                    ]);
                                }
                            }));
                        } else {
                            return params.row.value;
                        }
                    }
                }
            ],
            task: []
        };
    },
    methods: {
        init () {
            this.getPeriod();
        },
        getPeriod () {
            this.axios.get(this.Global.serverSrc + 'period/' + this.$route.query.id.toString()).then(
                res => {
                    if (res.data['status'] === true) {
                        this.period = res.data['data'];
                        this.task = [];
                        let timing = '';
                        let period = '';
                        if (this.period['scheduler'] !== 'once') {
                            timing = '';
                            period = this.period['period']['interval'] + '/' + this.period['period']['type'][0];
                        } else {
                            if (this.period['once']['type'] === 'now') {
                                timing = 'immediately';
                            } else {
                                timing = this.period['once']['date'].split(' ')[0] + ' ' + this.period['once']['time'];
                            }
                            period = '';
                        }
                        this.task.push(
                            {
                                key: 'ID',
                                value: this.period['id']
                            },
                            {
                                key: 'Job name',
                                value: this.period['name']
                            },
                            {
                                key: 'description',
                                value: this.period['description']
                            },
                            {
                                key: 'product',
                                value: this.period['product_id']
                            },
                            {
                                key: 'Scheduling',
                                value: this.period['scheduler']
                            },
                            {
                                key: 'Timing',
                                value: timing
                            },
                            {
                                key: 'cycle',
                                value: period
                            },
                            {
                                key: 'parallel',
                                value: this.period['concurrent']
                            },
                            {
                                key: 'Parallel interval',
                                value: this.period['interval'] + 's'
                            },
                            {
                                key: 'Types of',
                                value: this.period['execute']
                            }
                        );
                        if (this.period['execute'] === 'shell') {
                            this.task.push(
                                {
                                    key: 'Shell',
                                    value: this.period['shell']
                                }
                            );
                        } else {
                            this.task.push(
                                {
                                    key: 'SLS',
                                    value: this.period['sls']
                                }
                            );
                        }
                        this.task.push(
                            {
                                key: 'Target group',
                                value: this.period['target']
                            },
                            {
                                key: 'audit',
                                value: this.period['audit']
                            },
                            {
                                key: 'result',
                                value: this.period['result']
                            }
                        );
                    } else {
                        this.nError('Get Task Failure', res.data['message']);
                    }
                },
                err => {
                    let errInfo = '';
                    try {
                        errInfo = err.response.data['message'];
                    } catch (error) {
                        errInfo = err;
                    }
                    this.nError('Get Task Failure', errInfo);
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
    },
    mounted () {
        this.init();
        this.timer = setInterval(this.getPeriod, 5000);
    },
    watch: {
        '$route' () {
            this.init();
        }
    },
    // Close destruction
    beforeDestroy () {
        clearInterval(this.timer);
    }
};
</script>