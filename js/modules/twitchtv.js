(function() {

var API_ROOT = 'https://api.twitch.tv/kraken/';
var API_GAMES = 'games/top?limit=100';

var twitchtv = function(utils) {
    var twitchtv = {};

    /**
     * Fetches the top 100 games from the Twitch.tv API.
     *
     * @param {function(Array)} callback
     */
    twitchtv.fetch_games = function(callback) {
        $.ajax(API_ROOT + API_GAMES, {
            'dataType': 'jsonp',
            'data': {
                'limit': 100
            },
            'complete': function(request, text_status) {
                if(text_status !== 'success') {
                    throw new Error("Request failed");
                }
            },
            'success': function(data, text_status, request) {
                callback(create_game_array(data));
            }
        });
    };

    /**
     * Converts the raw data from the Twitch.tv API to a neat and more compact
     * array of {@code utils.Game} objects.
     *
     * @param {Object} raw_data The data from Twitch.tv.
     * @returns {Array.<Game>}
     */
    function create_game_array(raw_data) {
        var array = [];

        for(var i in raw_data['top']) {
            var raw_game = raw_data['top'][i];

            array.push(new utils.Game({
                'name': raw_game['game']['name'],
                'channels': raw_game['channels'],
                'viewers': raw_game['viewers'],
                'logo_url': raw_game['game']['logo']['template'],
                'box_url': raw_game['game']['box']['template']
            }));
        }

        return array;
    }

    return twitchtv;
};

var dependencies = ['modules/utils'];

define(dependencies, twitchtv);

}());
