// This module is the toolbox of Streamcore, containing general classes and
// utilities.
(function() {
var utils_module = function($, sprintf_module) {

var utils = {},
    sprintf = sprintf_module.sprintf,
    vsprintf = sprintf_module.vsprintf;

// Debug?
if(window['STREAMCORE_DEBUG'] !== undefined) {
    utils.DEBUG = true;
}
else {
    utils.DEBUG = false;
}

// ########################
// ### Helper functions ###
// ########################

utils.identity = function(value) { return value; };

// Logging functions
utils.console = function(fn, args) {
    if(typeof console !== 'undefined' &&
       typeof console[fn] !== 'undefined' &&
       typeof console[fn]['apply'] !== 'undefined')
    {
        console[fn].apply(console, args);
    }
}
utils.log = function() { utils.console('log', arguments); };
utils.warn = function() { utils.console('warn', arguments); };
utils.error = function() { utils.console('error', arguments); };

/**
 * Log using sprintf.
 *
 * All arguments are passed directly to {@code vsprintf}.
 */
utils.logf = function() {
    utils.log(utils.format.apply(utils, utils.arguments_to_array(arguments)));
};

// Formats a Date object to a string like "23:59:59".
utils.format_time = function(date) {
    if(date === undefined) {
        date = new Date();
    }

    var time = {
        'hour': String(date.getHours()),
        'minute': String(date.getMinutes()),
        'second': String(date.getSeconds())
    };

    // Numbers are zero-padded.
    for(var key in time) {
        if(time[key].length < 2) {
            time[key] = '0' + time[key];
        }
    }

    return time.hour + ':' + time.minute + ':' + time.second;
}

utils.format = function() {
    return sprintf.apply(window, utils.arguments_to_array(arguments));
};

/*
    Returns:
        `false` if `obj` evaluates to `false` or if it's an empty array or an
        object with no keys.
*/
utils.is_empty = function(obj) {
    if(Boolean(obj) === false) {
        return true;
    }
    else if(typeof obj === 'object' && obj.length !== undefined) {
        return obj.length < 1;
    }
    else if(typeof obj === 'object') {
        return Object.keys(obj).length < 1;
    }

    return false;
};

/**
 * Returns true if `obj` is a string.
 */
utils.is_string = function(obj) {
    return typeof obj === 'string';
};

/*
    Extends an object with the properties of other objects. Should not be used
    for mixins. See function `mixin` instead.

    Note:
        This function works directly on the input object. To copy an object, run
        `extend({}, obj)`

    Args:
        obj: The object to extend.
        objects...: Any amount of additional objects to extend the first one
            with.
*/
utils.extend = function() {
    // Convert the arguments to an array
    arguments = utils.arguments_to_array(arguments);

    if(arguments.length < 2) {
        throw new Error('Too few arguments');
    }

    // Function for merging one object with another
    var ext = function(o1, o2) {
        // Transfer all properties from object 2 to object 1
        for(var key in o2)
        {
            if(!o2.hasOwnProperty(key)) continue;
            o1[key] = o2[key];
        }
    };

    // The object to be extended
    var extendee = arguments[0];

    // The rest of the objects
    var objects = arguments.splice(1, arguments.length);

    // Iterate through the objects and extend the extendee with them
    for(var i in objects) {
        ext(extendee, objects[i]);
    }

    return extendee;
};

/*
    Mixes a class into a class instance.

    This means that all members of the prototype of the classes are copied to
    the class instance and that their constructors are called with the class
    instance as the context.

    Args:
        instance: The class instance to extend.
        classes...: Any amount of classes that will be mixed into `instance`.
*/
utils.mixin = function() {
    // Convert the arguments to an array
    arguments = utils.arguments_to_array(arguments);

    if(arguments.length < 2) {
        return;
    }

    // The instance to be extended
    var instance = arguments[0];

    // The classes to mix into the instance
    var classes = arguments.splice(1, arguments.length);

    // Iterate through the classes and mix them into instance
    for(var i in classes) {
        // First mix in the prototype properties
        utils.extend(instance, classes[i].prototype);

        // Then call the constructor on the instance
        classes[i].call(instance);
    }

    return instance;
};

/*
    Makes a class a subclass of another class.

    Args:
        sub_class: The class.
        super_class: The super class.
*/
utils.subclass = function(sub_class, super_class) {
    sub_class.prototype.__proto__ = super_class.prototype;
}

utils.define_property = function(cls, name, getter_and_setter) {
    Object.defineProperty(cls.prototype, name, getter_and_setter);
}

/*
    Convert an Arguments object to an array

    Args:
        args: The Arguments object

    Returns:
        An array representation of the arguments
*/
utils.arguments_to_array = function(args) {
    var out = [];
    for(var i = 0; i < args.length; i++)
    {
        out[i] = args[i];
    }
    return out;
};

// #############
// ### Class ###
// #############

/**
 * This is the superclass of all Streamcore.tv classes.
 */
function Class() { }

Class.prototype.superclasses = [];

/**
 * Calls a function from a super class.
 *
 * @param {string} fn The name of the function.
 * @param {...} var_args Arguments for the function.
 */
Class.prototype.super = function(fn) {
    var args = utils.arguments_to_array(arguments).slice(1);
    var retval = null;

    var call_from_super = function(cls) {
        var super_class = cls.__proto__;

        if(super_class === null) {
            throw new ReferenceError("No superclass has function: " + fn);
        }

        if(typeof super_class[fn] === 'function') {
            retval = super_class[fn].apply(this, args);
        }
        else {
            call_from_super(super_class.__proto__);
        }
    }.bind(this);

    // TODO: Remove this.
    if(fn === 'constructor') debugger;

    call_from_super(this.__proto__);

    return retval;
};

utils.Class = Class;

// ##########################
// ### EventEmitter class ###
// ##########################

// Constructor.
function EventEmitter() {
    this.events = {};
}

utils.subclass(EventEmitter, Class);

/*
    This function is used to bind a function to an event.

    Args:
        event: A string with the event name.
        fn: A callback function that will be called when the event occurs.
*/
EventEmitter.prototype.on = function(event_name, fn) {
    this._add_event_handler(event_name, false, fn);
};

/*
    This function is used to bind a function to an event. It will be
    executed at most once.

    Args:
        event: A string with the event name.
        fn: A callback function that will be called when the event occurs.
*/
EventEmitter.prototype.once = function(event_name, fn) {
    this._add_event_handler(event_name, true, fn);
};

/*
    Trigger an event.

    Args:
        event_name: The name of the event to trigger.
        args...: Arguments that will be passed to the event handlers.
*/
EventEmitter.prototype.trigger = function() {
    var arguments = utils.arguments_to_array(arguments);

    // This function requires only one argument: the event name
    if(arguments.length < 1) {
        utils.error("EventEmitter.trigger: Called with no arguments.");
        return;
    }

    var event_name = arguments[0];
    var event_args = arguments.splice(1, arguments.length);
    var events = this.events;

    if(events[event_name]) {
        for(var i in events[event_name]) {
            var ev = events[event_name][i];

            // If the event has been set to null, ignore this index.
            if(!ev) continue;

            // If this event was set to trigger only once, simply set it's
            // index in the events array to null. This is the simplest
            // solution since it doesn't mess with the indexes.
            if(ev.once) {
                events[event_name][i] = null;
            }

            // Call the callback function with this object as the context
            ev.callback.apply(this, event_args);
        }
    }
};

/**
 * Removes an event handler from the emitter.
 */
EventEmitter.prototype.remove_handler = function(event_name, handler) {
    if(arguments.length < 2) {
        handler = event_name;
        event_name = null;
    }

    var remove_from_list = function(list) {
        // The list of event handler objects is iterated over backwards. All
        // objects with `handler` as `callback` is deleted.
        for(var i = list.length - 1; i > -1; i--) {
            if(list[i].callback === handler) {
                list.splice(i, 1);
            }
        }
    }

    if(event_name) {
        var events = this.events[event_name];
        if(events) {
            remove_from_list(events);
        }
    }
    else {
        var all_events = this.events;
        for(var event_name in all_events) {
            remove_from_list(all_events[event_name]);
        }
    }
};

// Function for adding event handlers to the event emitter
EventEmitter.prototype._add_event_handler = function(ename, once, fn) {
    var events = this.events;

    if(!events[ename]) {
        events[ename] = [];
    }

    events[ename].push({
        'once': once,
        'callback': fn
    });
};

utils.EventEmitter = EventEmitter;

// ########################
// ### Controller class ###
// ########################

function Controller() {
    // Create a div for the controller element and add the class name and ID
    // to it.
    this.el = $('<div>');
    this.html = '';

    if(this.element_class_name) {
        this.el.addClass(this.element_class_name);
    }
    if(this.element_id) {
        this.el.prop('id', this.element_id)
    }
};

utils.subclass(Controller, Class);

/**
 * Renders the controller.
 *
 * Code for rendering the controller should be put in this function since it
 * allows for specific behavior like automatically updating templates in debug
 * mode.
 */
Controller.prototype.render = function(html) {
    if(html !== this.html) {
        this.el.html(html);
        this.html = html;

        return true;
    }

    return false;
};

/**
 * Appends this controller to another controller.
 *
 * @param {Controller} obj
 * @returns {Controller} This controller.
 */
Controller.prototype.append_to = function(obj) {
    this.el.appendTo(obj.el);
}

/**
 * Removes this controller from the target controller.
 */
Controller.prototype.remove_from = function(obj) {
    this.el.detach();
};
 

/**
 * Updates the controller with new data.
 *
 * @param {Array} args New data.
 */
Controller.prototype.update = function(args) { };

/**
 * Called before the controller is destroyed.
 *
 * Allows the controller to remove event handlers, stop intervals and do other
 * tasks that must be done before removal.
 */
Controller.prototype.dispose = function() {
    if(utils.DEBUG) {
        clearInterval(this.debug_render_interval);
    }
};

utils.Controller = Controller;

// ####################
// ### Layout class ###
// ####################

function Layout() {
}

Layout.prototype.update = function() {
    throw new Error('Method not implemented');
};

utils.Layout = Layout;

// ####################
// ### Stream class ###
// ####################

/**
 * Class representing a Twitch.tv livestream.
 */
function Stream(args) {
    this.name = null;
    this.text_status = null;
    this.viewers = null;
    this.embed_viewers = null;
    this.uptime = null;
    this.screencap_small = null;

    this.featured = null;
    this.video_width = null;
    this.video_height = null;
    this.embed_enabled = null;
    this.geo = null;
    this.language = null;
    this.timezone = null;

    // Set args to utils.
    utils.extend(this, args);
}

utils.subclass(Stream, Class);

utils.Stream = Stream;

// ##################
// ### Game class ###
// ##################

var GAME_IMAGE_SIZES = {
    'logo': {
        'small': [60, 36],
        'medium': [120, 72],
        'large': [240, 144]
    },
    'box': {
        'small': [52, 72],
        'medium': [136, 190],
        'large': [272, 380]
    }
};

function Game(args) {
    this.name = null;
    this.channels = null;
    this.viewers = null;
    this.logo_url = null;
    this.box_url = null;

    utils.extend(this, args);
}

utils.subclass(Game, Class);

Game.prototype.get_image = function(type, size) {
    if(GAME_IMAGE_SIZES[type] === undefined) {
        throw new Error("Invalid image type");
    }
    if(GAME_IMAGE_SIZES[type][size] === undefined) {
        throw new Error("Invalid size");
    }

    if(type === 'logo') {
        url = this.logo_url;
    }
    else {
        url = this.box_url;
    }

    var size = GAME_IMAGE_SIZES[type][size];
    return url.replace('{width}', size[0]).replace('{height}', size[1]);
};

// The Game class has getters for the image urls. The getters use
// `Game.get_image`. "logo" returns the logo in the small size, "logo_medium"
// gets the medium size etc.
for(var image_type in GAME_IMAGE_SIZES) {
    for(var image_size in GAME_IMAGE_SIZES[image_type]) {
        (function(type, size) {
            var getter_name = type;

            if(image_size !== 'small') {
                getter_name += '_' + size;
            }

            utils.define_property(Game, getter_name, {
                'get': function() {
                    return this.get_image(type, size);
                }
            });
        }(image_type, image_size));
    }
}

utils.Game = Game;

// ######################
// ### Helpful events ###
// ######################

utils.mixin(utils, utils.EventEmitter);
utils.window_resize_timeout = null;

// On window resize with a 100 ms delay. Used by code that should trigger when
// the window has been resized, but can't be executed several times per second.
$(window).on('resize', function() {
    if(utils.window_resize_timeout) {
        clearTimeout(utils.window_resize_timeout);
    }

    utils.window_resize_timeout = setTimeout(function() {
        utils.trigger('stopresize');
    }, 100);
});

// On window resize.
$(window).on('resize', function() {
    utils.trigger('resize');
});

// ############################################
// ### Figure out the width of a scroll bar ###
// ############################################

var test_div = $('<div>').css({
    'position': 'absolute',
    'top': -9999,
    'width': 100,
    'height': 100,
    'overflow': 'scroll'
});

$('body').append(test_div);

utils.SCROLLBAR_WIDTH = test_div[0].offsetWidth - test_div[0].clientWidth;

test_div.remove();

return utils;
};

// Define the module
define(['vendor/jquery', 'vendor/sprintf'], utils_module);

}());
