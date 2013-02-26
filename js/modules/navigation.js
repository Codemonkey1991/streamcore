(function() {

// This module abstracts the address bar, handling paths and navigation etc.
var navigation = function(utils) {
    var navigation = {
        'history': []
    };
    var skip_next_pathchange = false;

    // Make the navigation module an EventEmitter.
    utils.mixin(navigation, utils.EventEmitter);

    /**
     * Fetches the current path.
     * @returns {string} The current path, e.g. "/pages/home".
     */
    navigation.get_path = function() {
        return window.location.hash.replace(/^#/, '');
    };

    /**
     * Navigate to the input path.
     * @param {string} path The path to navigate to, e.g. "/games/hon".
     */
    navigation.navigate = function(path) {
        window.location.hash = path;
    }

    /**
     * Undo the last navigation - go back.
     */
    navigation.back = function(silently) {
        // Go back without affecting objects listening for events?
        if(silently) {
            skip_next_pathchange = true;
        }

        var hlen = navigation.history.length;
        var previous_path = navigation.history[hlen - 2];
        navigation.history.splice(hlen - 1, 1);   // Removes the newest entry.

        navigation.navigate(previous_path);
    }

    /**
     * Triggers a "pathchange" event with the current path.
     */
    navigation.nudge = function() {
        navigation.trigger('pathchange', navigation.get_path());
    };

    // Fire an event every time the path changes.
    $(window).hashchange(function() {
        // Some situations call for manipulating the path without emitting an
        // event.
        if(skip_next_pathchange) {
            skip_next_pathchange = false;
            return;
        }

        navigation.history.push(navigation.get_path());
        navigation.trigger('pathchange', navigation.get_path());
    });

    navigation.history.push(navigation.get_path());

    return navigation;
};

var dependencies = [
    'modules/utils',
    'vendor/jquery',
    'vendor/jquery.hashchange'
];

define(dependencies, navigation);

}());
