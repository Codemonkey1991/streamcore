(function() {

// This function runs all the tests
var unittests = function($, template, utils) {

    // Ready the layout of the page
    $('<div>').prop('id', 'unittests').appendTo('body');
    $('<h1>').text('Streamcore unit tests').appendTo('#unittests');
    $('<ul>').appendTo('#unittests');

    // Function for displaying the results of a test
    var assert = function(text, result) {
        // Skipped?
        if(result == null) {
            result = 'skipped';
        }
        else {
            result = result ? 'ok': 'fail';
        }

        $('ul').append(
            $('<li>').addClass(result).append(
                $('<span>').text(result),
                $('<span>').text(text)
            )
        );
    };

    // 'modules/utils.extend'
    (function() {
        var test1 = {'foo': 123, 'bar': 456};
        var test2 = {'bar': 789, 'hello': 'world'};
        var test3 = {'bar': 1, 'bye': 'cruel world'};

        var test4 = utils.extend({}, test1, test2, test3);

        assert(
            'modules/utils.extend - Extending objects',
            (
                typeof test4 === 'object' &&
                test4.foo === 123 &&
                test4.bar === 1 &&
                test4.hello === 'world' &&
                test4.bye === 'cruel world'
            )
        );
    }());

    // 'modules/utils.mixin'
    (function() {
        // Test class 1
        var TestClass1 = function() {
            this.foo = 123;

            utils.mixin(this, TestClass2, TestClass3);
        };

        TestClass1.prototype.test = function() {
            return this.foo;
        };

        // Test class 2
        var TestClass2 = function () {
            this.foo = 456;
        };

        TestClass2.prototype.another_test = function() {
            return 'success';
        };

        // Test class 3
        var TestClass3 = function() {
            this.bar = 987;
        };

        TestClass3.prototype.yet_another_test = function() {
            return this.bar;
        };

        // Assertions
        var instance = new TestClass1();

        assert(
            'modules/utils.mixin - Class mixins',
            (
                typeof instance.test == 'function' &&
                instance.test() === 456 &&
                typeof instance.another_test === 'function' &&
                instance.another_test() == 'success' &&
                typeof instance.yet_another_test === 'function' &&
                instance.yet_another_test() === 987
            )
        );
    }());

    // 'modules/utils.EventEmitter'
    (function() {
        var event_success = false;
        var event2_success = false;
        var once_success = null;
        var context_success = false;
        var args_success = false;

        // Functions that must be called with the event emitter for the test to
        // succeed
        var must_be_called = function() {
            event_success = true;
        };
        var must_also_be_called = function() {
            event2_success = true;
        };
        var must_be_called_just_once = function() {
            if(once_success === null) {
                once_success = true;
            }
            else if(once_success === true) {
                once_success = false;
            }
        };

        // EventEmitter instance
        var instance = new utils.EventEmitter();

        // Test the normal event handler function
        instance.on('normal_event', function() {
            if(this === instance) {
                context_success = true;
            }

            must_be_called();
        });

        instance.on('normal_event', function() {
            must_also_be_called();
        });

        // Test the 'once' event handler function
        instance.once('once_event', function() {
            must_be_called_just_once();
        });

        // Test that passing arguments works
        instance.on('event_with_args', function(a, b, c) {
            args_success = (
                a == 123 &&
                b == 'foo' &&
                c === null
            );
        });

        // Trigger the events
        instance.trigger('normal_event');
        instance.trigger('once_event');
        instance.trigger('once_event');
        instance.trigger('once_event');
        instance.trigger('event_with_args', 123, 'foo', null);

        // Assertions
        assert(
            'modules/utils.EventEmitter - The EventEmitter class',
            (
                event_success &&
                event2_success &&
                once_success &&
                context_success &&
                args_success
            )
        );
    }());

    // 'modules/template' - Test template partials
    (function() {
        var result = template.render('test_foo', {'name': 'Tomsan'});
        assert('modules/template - Template partials',
               result == 'User name: <b>Tomsan</b>');
    }());

};

require(['vendor/jquery', 'modules/template', 'modules/utils'], unittests);

}());
