(function() {

var header = function(utils, template) {
    var header = {};
    var SIZES = ['small', 'big'];

    function Header(size) {
        utils.Controller.call(this);

        if(size === undefined) {
            size = 'big';
        }

        if(SIZES.indexOf(size) < 0) {
            throw new Error('Invalid size: ' + size);
        }

        this.size = size;

        var html = template.render('header', {
            'size': this.size,
            'big': this.size === 'big'
        });
        this.el = $(html);
    }

    Header.prototype.render = function() { };

    utils.subclass(Header, utils.Controller);

    header.Header = Header;
    return header;
};

var dependencies = ['modules/utils', 'modules/template'];

define(dependencies, header);

}());
