(function() {

var MAINTAIN_RATIO = 1,
    STRETCH_TILES = 2,
    STRETCH_MARGINS = 4;

var tilelayout = function(utils) {
    var tilelayout = {};

    /**
     * This class automates tile layouts.
     *
     * @constructor
     * @param {Integer} A combination of style bit flags.
     */
    function TileLayout(style) {
        this.style = style;

        this._tile_container = null;
        this.tile_width = null;
        this.tile_height = null;
        this.tile_margin = 0;
    }

    utils.subclass(TileLayout, utils.Layout);

    // Property: 'tile_container'.
    utils.define_property(TileLayout, 'tile_container', {
        'get': function() {
            return this._tile_container;
        },
        'set': function(tile_container) {
            this._tile_container = tile_container;

            if($('.tc_inner_wrapper', tile_container).length < 1) {
                tile_container.wrapInner(
                    $('<div>')
                    .addClass('tc_inner_wrapper')
                    .css({
                        'overflow-x': 'hidden'
                    })
                );
                $('.tc_inner_wrapper > *', tile_container).addClass('tile');
            }

            this.update();
        }
    });

    TileLayout.prototype.update = function() {
        if(this.tile_container === null) {
            return;
        }

        var tile_width = this.tile_width;
        var tile_height = this.tile_height;
        var tile_margin = this.tile_margin;

        var tile_margin_x = tile_margin;

        var container_width = this.tile_container.innerWidth();
        var tiles_per_row = Math.floor(
            (container_width - tile_margin) / (tile_width + tile_margin)
        );

        // Should the tile margins stretch?
        if(this.style & STRETCH_MARGINS) {
            var tile_margin_x = (
                (container_width - (tile_width * tiles_per_row)) /
                (tiles_per_row + 1)
            );
        }

        // Or should the tiles themselves stretch?
        else if(this.style & STRETCH_TILES) {
            var new_tile_width = (
                (container_width - (tile_margin * (tiles_per_row + 1))) /
                tiles_per_row
            );
            var stretch_ratio = new_tile_width / tile_width;

            // Should the tiles maintain aspect ratio?
            if(this.style & MAINTAIN_RATIO) {
                tile_height = tile_height * stretch_ratio;
            }

            tile_width = new_tile_width;
        }

        $('.tile', this.tile_container).each(function(i, tile) {
            $(tile).css({
                'display': 'block',
                'float': 'left',
                'width': tile_width,
                'height': tile_height,
                'margin-top': tile_margin,
                'margin-left': tile_margin_x
            });
        });

        $('.tc_inner_wrapper', this.tile_container).css({
            'margin-right': -(tile_width / 2)
        });
        this.tile_container.css({'padding-bottom': tile_margin});
    };

    // Exposing public values.
    tilelayout.MAINTAIN_RATIO = MAINTAIN_RATIO;
    tilelayout.STRETCH_TILES = STRETCH_TILES;
    tilelayout.STRETCH_MARGINS = STRETCH_MARGINS;
    tilelayout.TileLayout = TileLayout;
    return tilelayout;
};

var dependencies = ['modules/utils'];

define(dependencies, tilelayout);

}());
