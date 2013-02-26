(function() {

var router = function(utils) {
    /**
     * Class for managing routes and controllers.
     * @param {Object.<string, Controller>} routes
     * @constructor
     * @extends {utils.EventEmitter}
     */
    function Router(routes) {
        if(routes === undefined) {
            routes = {};
        }
        this.routes = routes;

        this.current_path = null;
        this.current_controller = null;

        utils.mixin(this, utils.EventEmitter);
    };

    utils.subclass(Router, utils.Class);

    /**
     * This function changes the current route and triggers all related events.
     * @param {string} path The new route.
     */
    Router.prototype.route = function(path) {
        // Empty paths means root ("/").
        if(path === '') {
            path = '/';
        }

        // Unchanged path.
        if(path == this.current_path) {
            utils.log("Router.route: Got unchanged path.");
            return;
        }

        var resolved_path = this.resolve_path(path);

        // 404 error.
        if(resolved_path === null) {
            this.trigger('404', path);
            return;
        }

        var controller = resolved_path.controller;
        var args = resolved_path.args;

        this.trigger('route', controller, args);
    };

    /**
     * @param {string} path The path to resolve.
     * @returns {Object} An object with the attributes "controller" and "args".
     *     Can also return {@code null} if the path didn't match any routes.
     */
    Router.prototype.resolve_path = function(path) {
        for(var route in this.routes) {
            var reg = this.route_to_regex(route);
            var match = reg.exec(path);

            if(match === null) {
                continue;
            }

            var resolved_path = {
                'controller': this.routes[route],
                'args': match.slice(1)
            };

            return resolved_path;
        }

        return null;
    }

    /**
     * Converts the input route to a {@code RegExp} object.
     * @param {string} route
     * @returns {RegExp}
     */
    Router.prototype.route_to_regex = function(route) {
        // {segment} is replaced with a regular expression group matching
        // everything except for forward slashes.
        route = route.replace(/\{segment\}/g, '([^/]+)');

        // All forward slashes are escaped.
        route = route.replace(/\//g, '\\/');

        return RegExp('^' + route + '$', 'i');
    };

    return {
        'Router': Router
    }
};

var dependencies = ['modules/utils'];

define(dependencies, router);

}());
