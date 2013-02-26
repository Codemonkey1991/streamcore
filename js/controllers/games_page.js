(function() {

var games_page = function(utils, dataprovider, template, header, game_list,
                          stream_list) {
    var games_page = {},
        Header = header.Header,
        GameList = game_list.GameList,
        StreamList = stream_list.StreamList;

    /**
     * The controller for the "Games" page.
     *
     * @constructor
     */
    function GamesPage() {
        utils.Controller.call(this);
        this.el.prop('id', 'games_page');

        this.header = new Header('small');
        this.header.append_to(this);
        this.game_list = new GameList('tiles');
        this.game_list.append_to(this);

        this.layout = new GamesPageLayout();
        this.layout.header = this.header;
        this.layout.game_list = this.game_list;
        this.layout.update();
    }

    utils.subclass(GamesPage, utils.Controller);

    /**
     * Renders the controller.
     */
    GamesPage.prototype.render = function() {
        this.header.render();
        this.game_list.render();
    }; 

    /**
     * Disposes of the object's resources before deletion.
     */
    GamesPage.prototype.dispose = function() {
        this.header.dispose();
        this.game_list.dispose();
    };

    /**
     * The layout class for {@code GamesPage}.
     *
     * @constructor
     */
    function GamesPageLayout() {
        this.header = null;
        this.game_list = null;
        this.stream_list = null;
    }

    utils.subclass(GamesPageLayout, utils.Layout);

    GamesPageLayout.prototype.update = function() {
        if(this.header) {
            this.header.el.css({
                'top': 0,
                'right': 0,
                'left': 0,
                'height': 50
            });
        }
        if(this.game_list) {
            this.game_list.el.css({
                'top': 50,
                'right': 0,
                'bottom': 0,
                'left': 0
            });
        }
        if(this.stream_list) {
            this.stream_list.el.css({
                'top': 60,
                'bottom': 0,
                'left': 10,
                'width': 300
            });
            this.game_list.el.css({
                'left': 310
            });
        }

        this.game_list.layout.update();
    };

    games_page.GamesPage = GamesPage;
    return games_page;
};

var dependencies = [
    'modules/utils',
    'modules/dataprovider',
    'modules/template',
    'controllers/header',
    'controllers/game_list',
    'controllers/stream_list'
];

define(dependencies, games_page);

}());

