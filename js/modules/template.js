(function() {

var TEMPLATES_BASE_URL = '/templates/';

var template = function($, utils, mustache) {
    var self = {};

    /**
     * The debug function for rendering a template.
     *
     * This function will fetch all templates using Ajax just before rendering.
     *
     * @param {string} name The name of the template. For instance, the
     *     template name "foo/bar" will match the template
     *     "templates/foo/bar.mustache".
     * @param {Object} obj The data that the template will be rendered with.
     * @param {Array.<string>} partial_names An optional array of template names
     *     that the rendered template will have access to.
     * @returns {string} The rendered template as a string.
     */
    self.render_debug = function(name, obj, partial_names) {
        var tmpl = fetch_template(name);
        var partials = {};

        if(!obj) {
            obj = {};
        }
        obj['DEBUG'] = utils.DEBUG;

        if(!utils.is_empty(partial_names)) {
            for(var i in partial_names) {
                partials[partial_names[i]] = fetch_template(partial_names[i]);
            }
        }

        return mustache.render(tmpl, obj, partials);
    };

    /**
     * Fetches a template using Ajax.
     *
     * @param {string} name The name of the template.
     * @returns {string} The template.
     */
    function fetch_template(name) {
        var template;

        $.ajax(TEMPLATES_BASE_URL + name + '.mustache', {
            'async': false,
            'dataType': 'text',
            'complete': function(request, text_status) {
                if(text_status != 'success') {
                    throw new Error('Template not found');
                }

                template = request.responseText;
            }
        });

        return template;
    }

    if(utils.DEBUG) {
        self.render = self.render_debug;
    }
    else {
        throw new Error("Not implemented");
    }

    return self;
}

// Define this module
define(['vendor/jquery', 'modules/utils', 'vendor/mustache'], template);

}());
