<template>
    <div>
        <common-table :cColumns="cColumns" :apiService="apiService" :productShow="true"></common-table>
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
                apiService: 'log',
                cColumns: [
                    {
                        title: 'User',
                        key: 'user',
                        sortable: true
                    },
                    {
                        title: 'ID',
                        key: 'id',
                        sortable: true
                    },
                    {
                        title: 'Operation Target',
                        key: 'action_object',
                        sortable: true
                    },
                    {
                        title: 'Action Performed',
                        key: 'action_type',
                        sortable: true
                    },
                    {
                        title: 'Time',
                        key: 'time',
                        sortable: true
                    }
                ]
            };
        }
    };
</script>