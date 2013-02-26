// This is the main script for streamcore
(function() {

// require.js shim config.
requirejs.config({
    'shim': {
        'vendor/jquery': {
            exports: 'jQuery'
        },
        'vendor/jquery.hashchange': ['vendor/jquery'],
        'vendor/jstorage': ['vendor/jquery'],
        'vendor/jquery.mousewheel.min': ['vendor/jquery'],
        'vendor/jquery-ui-1.9.1.custom.min': ['vendor/jquery'],
        'vendor/jquery.mCustomScrollbar.min': [
            'vendor/jquery',
            'vendor/jquery.mousewheel.min',
            'vendor/jquery-ui-1.9.1.custom.min'
        ]
    }
});

var module = function($, navigation, router, utils, front_page, games_page,
                      debug_page) {
    var ROUTES = {
        '/': front_page.FrontPage,
        '/games': games_page.GamesPage
    };

    if(utils.DEBUG) {
        utils.extend(ROUTES, {
            '/debug': debug_page.DebugPage
        });
    }

    $(function() {
        var root_element = $('body');
        var current_controller = null;
        var current_controller_class = null;
        var main_router = new router.Router(ROUTES);

        // Every time the address path changes, the main router is updated with
        // it.
        navigation.on('pathchange', function(path) {
            main_router.route(path);
        });

        // Event handler for when the address changes.
        main_router.on('route', function(controller_class, args) {
            if(current_controller !== null) {
                // If the new path leads to the same controller, update the
                // arguments of the controller.
                if(controller_class === current_controller_class) {
                    current_controller.update.apply(current_controller, args)
                }
                // Otherwise destroy the controller.
                else {
                    current_controller_class = null;
                    current_controller.dispose();
                    current_controller = null;
                    root_element.empty();
                }
            }

            if(current_controller === null) {
                current_controller_class = controller_class;
                current_controller = new controller_class();
                current_controller.update(args);

                root_element.append(current_controller.el);
            }
        });

        main_router.on('404', function(path) {
            alert("The page \"" + path + "\" has not been implemented yet.");

            if(navigation.history.length > 0) {
                navigation.back(true);
            }
            else {
                navigation.navigate('/');
            }
        });

        main_router.route(navigation.get_path());

        // Declare the application started
        utils.log('Streamcore initialized.');
    });
};

var dependencies = [
    'vendor/jquery',
    'modules/navigation',
    'modules/router',
    'modules/utils',
    'controllers/front_page',
    'controllers/games_page',
    'controllers/debug_page'
];

require(dependencies, module);

}());

