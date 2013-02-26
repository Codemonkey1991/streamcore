/**
 * This module exists only for testing purposes.
 *
 * When new controllers are created, this module serves as a workbench and
 * testing grounds. The contents of this module will probably change between
 * pretty much every commit so don't pay it any mind.
 */
(function() {

var debug_page = function(utils, tilelayout, header, stream_list) {
    var debug_page = {};

    function DebugPage() {
        utils.Controller.call(this);

        // The header control.
        this.header = new header.Header('small');
        this.header.append_to(this);
        this.header.el.css({'top': 0, 'right': 0, 'left': 0, 'height': 50});

        // A container full of divs for testing the tile layout class.
        this.tile_container = $('<div>').css({
            'position': 'absolute',
            'top': 60,
            'left': 50,
            'right': 400,
            'border': '1px solid red'
        });
        for(var i = 0; i < 50; i++) {
            this.tile_container.append(
                $('<div>')
                .html(i)
                .css({
                    'padding': 10,
                    'box-sizing': 'border-box',
                    'background-color': '#004488'
                })
            );
        }
        this.el.append(this.tile_container);

        var layout = this.tilelayout = new tilelayout.TileLayout(
            tilelayout.STRETCH_MARGINS
        );
        layout.tile_container = this.tile_container;
        layout.tile_width = 100;
        layout.tile_height = 100;
        layout.tile_margin = 10;

        setTimeout(function() {
            layout.update();
        }, 100);

        utils.on('resize', function() {
            layout.update();
        });
    }

    DebugPage.prototype.render = function() { };

    DebugPage.prototype.dispose = function() {
        this.header.dispose();
    };

    utils.subclass(DebugPage, utils.Controller);

    debug_page.DebugPage = DebugPage;
    return debug_page;
};

var dependencies = [
    'modules/utils',
    'modules/tilelayout',
    'controllers/header',
    'controllers/stream_list'
];

define(dependencies, debug_page);

}());

