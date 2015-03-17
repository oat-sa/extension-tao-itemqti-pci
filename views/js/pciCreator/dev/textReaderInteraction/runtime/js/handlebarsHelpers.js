/*global define*/
define(
    [], function ($, Handlebars, Tabs) {
        'use strict';
        var templateOptions = {
            helpers : {
                inc : function (value) {
                    return parseInt(value, 10) + 1;
                },
                x : function (expression, options) {
                    var fn = function(){}, result;
                    try {
                        fn = Function.apply(this, ["window", "return " + expression + " ;"]);
                    } catch (e) {
                        console.warn("{{x " + expression + "}} has invalid javascript", e);
                    }

                    try {
                        result = fn.call(this, window);
                    } catch (e) {
                        console.warn("{{x " + expression + "}} hit a runtime error", e);
                    }
                    return result;
                },
                xif : function (expression, options) {
                    return templateOptions.helpers.x.apply(this, [expression, options]) ? options.fn(this) : options.inverse(this);
                },
                zif : function () {
                    var options = arguments[arguments.length - 1];
                    delete arguments[arguments.length - 1];
                    return templateOptions.helpers.x.apply(this, [Array.prototype.slice.call(arguments, 0).join(''), options]) ? options.fn(this) : options.inverse(this);
                },
                math : function(lvalue, operator, rvalue, options) {
                    lvalue = parseFloat(lvalue);
                    rvalue = parseFloat(rvalue);

                    return {
                        "+": lvalue + rvalue,
                        "-": lvalue - rvalue,
                        "*": lvalue * rvalue,
                        "/": lvalue / rvalue,
                        "%": lvalue % rvalue
                    }[operator];
                }
            }
        };
        
        return templateOptions;
    }
);