# Streamcore technical specifications.

## Overview.

Streamcore will make use of the following technologies:

  - [Nginx][0]: For receiving the server requests, serving static content and
    relaying certain requests to the underlying WSGI server.
  - [Python][1]: For all server-side logic. Currently no server side logic is
    planned, but future versions of Streamcore.tv will certainly require it.
  - [Gevent][2]: For hosting the Python WSGI application.
  - HTML5: To bootstrap the client side application.
  - JavaScript + [require.js][2]: For the client side application.
  - [LESS][3]: For the client side stylesheets.

 [0]: http://nginx.org/
 [1]: http://python.org/
 [2]: http://www.gevent.org/
 [3]: http://requirejs.org/
 [4]: http://lesscss.org/

## The server.

At the time of writing, the server of Streamcore.tv will be nothing more than an
nginx instance serving the client side application. Future features will require
logic that will be delivered by a Python WSGI application hosted by a Gevent
server.

## The client.

### The router.

The Router class (`modules/router.Router`) is an event emitter that manages a
combination of paths and controllers. 

Events:

  - "route": When the route changes (`Router.route()`) this event is emitted.
    Handlers of this event must accept two arguments: The controller that the
    path is tied to, and a list of arguments found in the route. If the route
    changes but still points to the same controller, no event is emitted and
    instead the existing controller is updated with the arguments found in the
    route.

  - "404": When the path is changed to a path that matches no routes, this event
    is emitted. Handlers are passed the path as the only argument.

### The data provider.

The data provider module (`modules/dataprovider`) manages external resources and
caching. It is an event emitter with a simple external interface.

#### Events.

  - "games": When the list of games from the Twitch.tv API is updated. Handlers
    of this event receives an array of `utils.Game` objects.

  - "streams:{game name}": When the list of streams for a specific game has been
    updated. Example of event name: "streams:Dota 2" or "stream:Heroes of
    Newerth". Handlers of this event will receive a list of `utils.Stream`
    objects.

When an event handler is attached to the data provider, the data provider starts
an interval to update the relevant data as often as is specified by the
resource. When a resource no longer has any event handlers related to it, it
stops updating the data. If up-to-date cached data is available when a new event
handler is added, the event handler is called immediately with the cached data.

The event emitter function `on` has been overloaded on the data provider to
return a number:

  - 0: No cached data is available. New data will be fetched now.
  - 1: Cached data is available, but outdated. The handler will be called with
    the cached data immediately, then shortly after with fresh data.
  - 2: Cached data is fresh. The handler will be called with the cached data
    immediately.

This allows controllers to draw "loading" graphics only if data actually has to
be loaded.

#### Fetch.

The data provider also has a function called {@code fetch}. This function
accepts the same resource identifiers as the event system, plus a callback that
will be called once with the resulting data. This function also honours the
cache. If the cache is outdated, it will take a while before the callback is
executes since the data is being updated. Otherwise it will be executed
immediately.

