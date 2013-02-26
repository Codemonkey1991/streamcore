(function() {

var stream_list = function(utils, dataprovider, template) {
    var stream_list = {};

    function StreamList(settings) {
        utils.Controller.call(this);
        this.el.addClass('stream_list');

        this.streams = [];

        if(settings && settings['game']) {
            this.game = settings['game'];
        }
    }

    utils.subclass(StreamList, utils.Controller);

    StreamList.prototype.render = function() {
        this.el.html(template.render('stream_list', {
            'game': this.game,
            'streams': this.streams,
            'updating_streams': (this.streams_status === 0 ||
                                 this.streams_status === 1),
            'streams_are_fresh': this.streams_status === 2
        }));
    };

    StreamList.prototype.set_game_obj = function(game) {
        // Event handlers for previous games are removed.
        if(this.stream_listener) {
            dataprovider.remove_handler(
                'streams:' + this.game.name, this.on_streams_updated
            );
        }
        else {
            this.stream_listener = true;
        }

        this._game = game;

        this.streams_status = dataprovider.on(
            'streams:' + game.name, this._on_streams_updated.bind(this)
        );

        this.render();
    };

    StreamList.prototype._on_streams_updated = function(streams) {
        this.streams = streams;
        this.streams_status = 2;
        this.render();
    };

    // Property: 'game'
    utils.define_property(StreamList, 'game', {
        'get': function() {
            return this._game;
        },
        'set': function(game) {
            if(utils.is_string(game)) {
                dataprovider.fetch('games', function(games) {
                    var game_obj = null;

                    for(var i in games) {
                        if(games[i].name === game) {
                            game_obj = games[i];
                            break;
                        }
                    }

                    if(game_obj === null) {
                        utils.error('Game not found:', game);
                    }
                    this.set_game_obj(game_obj);
                }.bind(this));
            }
            else {
                this.set_game_obj(game);
            }
        }
    });

    stream_list.StreamList = StreamList;
    return stream_list;
};

var dependencies = [
    'modules/utils',
    'modules/dataprovider',
    'modules/template'
];

define(dependencies, stream_list);

}());
