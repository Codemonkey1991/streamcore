(function() {

var dataprovider = function(utils, storage, twitchtv, justintv) {
    var dataprovider = {
        'resource_update_intervals': {}
    };
    var resources = {
        'games': {
            'update_interval': 1000 * 60 * 10,   // Every ten minutes.
            'fetch_function': twitchtv.fetch_games,
            // This function converts the array of raw objects from the cache
            // into Game objects.
            'parse_args': function(args) {
                var out = [];
                for(var i in args[0]) {
                    out.push(new utils.Game(args[0][i]));
                }
                return [out];
            }
        },
        'streams:(.*)': {
            'update_interval': 1000 * 60,   // Every minute.
            'fetch_function': justintv.fetch_streams,
            'parse_args': function(args) {
                var out = [];
                for(var i in args[0]) {
                    out.push(new utils.Stream(args[0][i]));
                }
                return [out];
            }
        }
    };

    // An object for status information redarding resources.
    var resource_statuses = {};

    // The data provider cache is created here if it doesn't already exist.
    var cache = storage.get('dataprovider_cache');

    if(cache === null) {
        cache = {};
        storage.set('dataprovider_cache', cache);
    }

    // dataprovider is an EventEmitter.
    utils.mixin(dataprovider, utils.EventEmitter);

    /**
     * Override of {@code EventEmitter.on}.
     *
     * This function is overridden to return the status of the requested
     * resource, as well as to start updating the requested resource as long as
     * it has event handlers.
     */
    dataprovider.on = function(event_name, handler) {
        utils.EventEmitter.prototype.on.call(dataprovider, event_name, handler);

        var data_status = dataprovider.fetch(event_name);

        // If the requested data has cache available, call the handler
        // immediately with that data.
        if(data_status === 1 || data_status === 2) {
            dataprovider.fetch(event_name, handler);
        }

        utils.logf('dataprovider: Event handler added for "%s"', event_name);
        utils.logf('dataprovider: Total event handlers for "%s": %d',
                   event_name, this.events[event_name].length);

        return data_status;
    };

    /**
     * Override of {@code EventEmitter.remove_handler} for logging purposes.
     */
    dataprovider.remove_handler = function(event_name, handler) {
        utils.EventEmitter.prototype.remove_handler.call(
            dataprovider, event_name, handler
        );

        utils.logf('dataprovider: Event handler removed for "%s"', event_name);
        utils.logf('dataprovider: Total event handlers for "%s": %d',
                   event_name, this.events[event_name].length);
    };

    /**
     * Fetches data based on the resource identifier.
     *
     * @param {string} identifier E.g. "streams:Dota 2".
     * @param {function(*)} callback The callback arguments depend on the
     *     resource fetched.
     * @returns {number} 0 if there was no cache. 1 if the cache was outdated.
     *     2 if the cache was up to date.
     */
    dataprovider.fetch = function(identifier, callback) {
        var resource = get_resource(identifier);
        var args = get_resource_args(identifier);

        // The status object for this resource identifier / argument combination
        // is added to the local scope.
        if(!resource_statuses[identifier]) {
            resource_statuses[identifier] = {};
        }
        var resource_status = resource_statuses[identifier];

        var cached_resource = cache[identifier] || null;
        var cache_outdated = (
            cached_resource &&
            (
                cached_resource.timestamp <
                Number(new Date()) - resource.update_interval
            )
        );

        // If no_listeners is true, that means that nobody is actually
        // interested in the fetched data. This means that even if there is no
        // cache for this resource or if the cache is outdated, nothing will be
        // fetched. The return values will still be correct though.
        var has_listeners = (
            Boolean(callback) ||
            !utils.is_empty(dataprovider.events[identifier])
        );

        // Schedules this resource to be updated after it expires.
        var schedule_update = function() {
            resource_status.update_scheduled = true;

            // Calculate the update delay based on the age of the cache.
            var cache_age = Number(new Date()) - cache[identifier].timestamp;
            var update_delay = resource.update_interval - cache_age;

            if(update_delay < 0) update_delay = 0;

            setTimeout(function() {
                dataprovider.fetch(identifier);
            }, update_delay);
        };

        // If a callback was passed, this function will execute the callback
        // with the cached data.
        var callback_with_cache = function() {
            if(callback) {
                setTimeout(function() {
                    var parse = resource.parse_args || utils.identity;
                    callback.apply(null, parse(cached_resource.data));
                }, 0);
            }
        };

        var fetch_resource = function(callback) {
            // If an update of this resource is already in progress, do nothing.
            // Unless, of course, a callback has been specified, in which case
            // the callback will be executed once the current update is
            // finished.
            if(resource_status.update_in_progress) {
                if(callback) {
                    dataprovider.once(identifier, callback);
                }
                return;
            }

            resource_status.update_in_progress = true;

            // The resource fetch function is called with the arguments in the
            // resource identifier (e.g. the "Dota 2" part of "streams:Dota 2"),
            // plus a callback that handles caching.
            fn_args = utils.extend([], args);
            fn_args.push(function() {
                a = utils.arguments_to_array(arguments);

                resource_status.update_in_progress = false;

                // Cache the result.
                cache[identifier] = {
                    'data': a,
                    'timestamp': Number(new Date())
                };
                save_cache();

                // The input callback is called with the same data as the
                // resource fetch function's callback.
                if(callback) {
                    callback.apply(null, a);
                }

                // Alert any event listeners that fresh data has arrived.
                evt_args = utils.extend([], a);
                evt_args.splice(0, 0, identifier);
                dataprovider.trigger.apply(dataprovider, evt_args);

                // The fetched data is scheduled to be updated again after the
                // cache expires. This will only happen if there are event
                // handlers interested in the result, though.
                schedule_update();
            });

            resource.fetch_function.apply(null, fn_args);
        };

        // If the resource isn't in the cache then it is fetched.
        if(cached_resource === null) {
            if(has_listeners) {
                fetch_resource(callback);
            }
            else {
                resource_status.update_scheduled = false;
            }

            return 0;
        }
        // If the cache is outdated then the resource is updated, but the
        // callback is called with the outdated data first.
        else if(cache_outdated) {
            if(has_listeners) {
                fetch_resource();
            }
            else {
                resource_status.update_scheduled = false;
            }

            callback_with_cache();
            return 1;
        }
        // If the cache is fresh then the callback is called immediately with
        // the requested data.
        else {
            if(has_listeners && !resource.update_scheduled) {
                schedule_update();
            }

            callback_with_cache();
            return 2;
        }
    }

    /**
     * Saves the cache.
     */
    function save_cache() {
        storage.set('dataprovider_cache', cache);
    }

    /**
     * This function initiates the updating of a resource.
     *
     * @param {string} event_name The name of the event that this resource
     *     triggers. E.g. "streams:Dota 2". Only one update interval can be
     *     running for each event name.
     * @param {Object.<string, *>} resource One of the {@code resources}.
     */
    function start_updating_resource(event_name, resource) {
        var intervals = dataprovider.resource_update_intervals;
        var event_args = get_resource_args(event_name);

        if(intervals[event_name] !== undefined) {
            throw new Error("Requested to start updating a resource twice");
        }

        intervals[event_name] = setInterval(function() {
            dataprovider.fetch(event_name, function() {
                a = utils.arguments_to_array(arguments);
                a.splice(0, 0, event_name);
                dataprovider.trigger.apply(dataprovider, a);
            });
        }, resource.update_interval);
    }

    /**
     * Returns a resource based on an identifier.
     * 
     * @param {string} identifier The resource identifier.
     * @returns {Object.<string, *>}
     */
    function get_resource(identifier) {
        for(var key in resources) {
            var reg = new RegExp(key);

            if(!reg.test(identifier)) continue;

            return resources[key];
        }

        throw new Error("Invalid resource identifier: " + identifier);
    }

    /**
     * Returns an array of strings based on an identifier.
     *
     * For example, if called with the identifier "streams:Heroes of Newerth"
     * then the return value would be ["Heroes of Newerth"].
     *
     * @param {string} identified
     * @returns {Array.<string>} Can be an empty array.
     */
    function get_resource_args(identifier) {
        for(var key in resources) {
            var reg = new RegExp(key);
            var match = reg.exec(identifier);

            if(match === null) continue;

            return match.splice(1);
        }

        throw new Error("Invalid resource identifier: " + identifier);
    }

    return dataprovider;
};

var dependencies = [
    'modules/utils',
    'modules/storage',
    'modules/twitchtv',
    'modules/justintv'
];

define(dependencies, dataprovider);

}());
