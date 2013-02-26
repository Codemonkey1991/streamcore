(function() {

var frontpage = function(utils, template, dataprovider, header) {
    var frontpage = {};

    /**
     * The controller for the front page of Streamcore.tv.
     *
     * @constructor
     */
    function FrontPage() {
        utils.Controller.call(this);

        this.games = null;
        var header_controller = new header.Header();
        header_controller.append_to(this);

        this.layout = new FrontPageLayout();
        this.layout.header = header_controller;
        this.layout.update();
    }

    utils.subclass(FrontPage, utils.Controller);

    /**
     * Renders the controller.
     */
    FrontPage.prototype.render = function() { };

    /**
     * Updates the controller with new arguments.
     */
    FrontPage.prototype.update = function(args) {};

    function FrontPageLayout() {
        this.header = null;
    }

    FrontPageLayout.prototype.update = function() {
        if(this.header) {
            this.header.el.css({
                'top': 0,
                'right': 0,
                'left': 0,
                'height': 200
            });
        }
    };

    frontpage.FrontPage = FrontPage;
    return frontpage;
};

var dependencies = [
    'modules/utils',
    'modules/template',
    'modules/dataprovider',
    'controllers/header'
];

define(dependencies, frontpage);

}());

