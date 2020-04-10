<style lang="less">
    @import '../../styles/common.less';
    @import './error-page.less';
</style>

<template>
    <div class="error-page">
        <Row>
            <Card>
                <p slot="title">
                    <Icon :size="14" type="ios-navigate-outline"></Icon>
                    404-Page does not exist
                </p>
                <Row>
                    <Col span="10">
                        <Card dis-hover>
                            <Row>
                                <div class="error-page-show">
                                    <error404></error404>
                                </div>
                                <div class="error-page-cover"></div>
                            </Row>
                        </Card>
                    </Col>
                    <Col span="14" class="padding-left-10">
                        <Row type="flex" align="middle" class="error-page-intro-con">
                            <p>When the accessed page does not exist, it will jump to the 404 page. You can modify the url to a non-existent path in the browser address bar to experience the effect</p>
                        </Row>
                    </Col>
                </Row>
            </Card>
        </Row>
        <Row class="margin-top-10">
            <Card>
                <p slot="title">
                    <Icon :size="14" type="android-lock"></Icon>
                    403-Insufficient permissions
                </p>
                <Row>
                    <Col span="10">
                        <Card dis-hover>
                            <Row>
                                <div class="error-page-show">
                                    <error403></error403>
                                </div>
                                <div class="error-page-cover"></div>
                            </Row>
                        </Card>
                    </Col>
                    <Col span="14" class="padding-left-10">
                        <Row type="flex" align="middle" class="error-page-intro-con">
                            <p>Jump to this page when the currently logged-in user does not have permission to perform the current operation</p>
                        </Row>
                    </Col>
                </Row>
            </Card>
        </Row>
        <Row class="margin-top-10">
            <Card>
                <p slot="title">
                    <Icon :size="14" type="social-freebsd-devil"></Icon>
                    500-Server error
                </p>
                <Row>
                    <Col span="10">
                        <Card dis-hover>
                            <Row>
                                <div class="error-page-show">
                                    <error500></error500>
                                </div>
                                <div class="error-page-cover"></div>
                            </Row>
                        </Card>
                    </Col>
                    <Col span="14" class="padding-left-10">
                        <Row type="flex" align="middle" class="error-page-intro-con">
                            <p>Jump to the page when a server error occurs after the request, you can jump to the page when the returned status code is 500 in the ajax request method</p>
                        </Row>
                    </Col>
                </Row>
            </Card>
        </Row>
    </div>
</template>

<script>
import Error404 from './404.vue';
import Error500 from './500.vue';
import Error403 from './403.vue';
export default {
    components: {
        Error404,
        Error500,
        Error403
    }
};
</script>
