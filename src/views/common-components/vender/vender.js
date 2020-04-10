let vender = {};

vender.nError = function (title, info) {
    this.$Notice.error({
        title: title,
        // Replace <> to avoid being parsed as html tags
        desc: info.toString().replace(/<|>/g, ''),
        duration: 10
    });
};

export default vender;
