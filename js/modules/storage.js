// This module is a thin wrapper around jStorage.
(function() {

var storage = function($, utils) {
    var storage = {};

    // Module body.
    storage.get = function(key) {
        var value = $.jStorage.get(key);
        utils.log("storage.get:", '"' + key + '"', '->', value);

        return value;
    };

    storage.set = function(key, value) {
        utils.log("storage.set:", '"' + key + '"', '->', value);
        $.jStorage.set(key, value);
    };

    return storage;
};

var dependencies = ['vendor/jquery', 'modules/utils', 'vendor/jstorage'];

define(dependencies, storage);

}());

