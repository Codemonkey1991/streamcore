(function() {

var game_list = function(utils, dataprovider, template, tilelayout) {
    var game_list = {};
    //var GAME_MIN_WIDTH = 450;
    var GAME_MIN_WIDTH = 136;
    var GAME_HEIGHT = 72;
    var GAME_SPACING = 20;

    function GameList(type) {
        utils.Controller.call(this);
        utils.mixin(this, utils.EventEmitter);

        this.type = type;

        this.first_render = true;
        this.el = $('<div>').prop('class', 'game_list');

        // The window is rendered every time new game data arrives.
        this.games = [];
        this.games_status = dataprovider.on(
            'games', this._on_games_updated.bind(this)
        );

        // The games are organized using the tile layout.
        this.layout = new tilelayout.TileLayout(tilelayout.STRETCH_MARGINS);
        this.layout.tile_width = 136;
        this.layout.tile_height = 275;
        this.layout.tile_margin = 20;

        // The layout is updated when the window is resized.
        utils.on('resize', this._on_resize.bind(this));
    }

    utils.subclass(GameList, utils.Controller);

    GameList.prototype._on_games_updated = function(games) {
        this.games = games;
        this.games_status = 2;
        this.render();
    };

    GameList.prototype._on_resize = function() {
        this.layout.update();
    };

    GameList.prototype.render = function() {
        var html = template.render('game_list', {
            'no_games_cache': this.games_status === 0,
            'old_games_cache': this.games_status === 1,
            'new_data': this.games_status === 2,
            'games': this.games
        });

        // If the HTML has changed then the game list fades out, the content is
        // replaced and the list fades back in.
        if(this.html !== html) {
            var fadeout = this.first_render ? 0 : 300;

            this.el.animate({'opacity': 0}, fadeout, 'easeOutQuad', function() {
                this.el.html(html);
                this.html = html;

                this.layout.tile_container = $('.games', this.el);

                this.el.animate({'opacity': 1}, 300, 'easeOutQuad');
            }.bind(this));

            this.first_render = false;
        }

        this.el.mCustomScrollbar('update');
    };

    GameList.prototype.dispose = function() {
        dataprovider.remove_handler('games', this.on_game_list_updated);
        utils.remove_handler('resize', this._on_resize);
    };

    game_list.GameList = GameList;
    return game_list;
};

var dependencies = [
    'modules/utils',
    'modules/dataprovider',
    'modules/template',
    'modules/tilelayout',
    'vendor/jquery.mCustomScrollbar.min',
    'vendor/jquery-easing'
];

define(dependencies, game_list);

}());

