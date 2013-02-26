(function() {

var JUSTINTV_API_URL = 'http://api.justin.tv/api';
var JUSTINTV_API_STREAMS = '/stream/list.json';

var justintv = function(utils) {
    var justintv = {},
        Stream = utils.Stream;

    /**
     * Fetches the top 100 streams for a specific game from Justin.tv.
     *
     * @param {string} game For example "Dota 2".
     * @param {function(Array.<Stream>)} callback
     */
    justintv.fetch_streams = function(game, callback) {
        var url = JUSTINTV_API_URL + JUSTINTV_API_STREAMS;

        $.ajax(url, {
            'dataType': 'jsonp',
            'data': {
                'meta_game': game
            },
            'success': function(data, request, text_status) {
                callback(create_stream_array(data));
            }
        });
    };

    /**
     * Converts the raw data from the Justin.tv into an array of Stream objects.
     *
     * @returns {Array.<Stream>}
     */
    function create_stream_array(raw_data) {
        var out = [];

        for(var i in raw_data) {
            var s = raw_data[i];

            out.push(new Stream({
                'name': s['channel']['login'],
                'text_status': s['channel']['status'],
                'viewers': s['channel_count'],
                'embed_viewers': s['embed_count'],
                'uptime': s['up_time'],
                'screencap_small': s['channel']['screen_cap_url_small'],

                'featured': s['featured'],
                'video_width': s['video_width'],
                'video_height': s['video_height'],
                'embed_enabled': s['embed_enabled'],
                'geo': s['geo'],
                'language': s['channel']['language'],
                'timezone': s['channel']['timezone']
            }));
        }

        return out;
    }

    return justintv;
};

var dependencies = ['modules/utils'];

define(dependencies, justintv);

}());
