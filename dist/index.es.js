var GraphQLType;
(function (GraphQLType) {
    GraphQLType[GraphQLType["SCALAR"] = 0] = "SCALAR";
    GraphQLType[GraphQLType["INLINE_FRAGMENT"] = 1] = "INLINE_FRAGMENT";
    GraphQLType[GraphQLType["FRAGMENT"] = 2] = "FRAGMENT";
})(GraphQLType || (GraphQLType = {}));
var typeSymbol = Symbol('GraphQL Type');
var paramsSymbol = Symbol('GraphQL Params');
function isInlineFragmentObject(value) {
    return (typeof value === 'object' &&
        value !== null &&
        value[typeSymbol] === GraphQLType.INLINE_FRAGMENT);
}
function isFragmentObject(value) {
    return (typeof value === 'object' &&
        value !== null &&
        value[typeSymbol] === GraphQLType.FRAGMENT);
}
function isScalarObject(value) {
    return (typeof value === 'object' && value !== null && value[typeSymbol] === GraphQLType.SCALAR);
}
function renderName(name) {
    return name === undefined ? '' : name;
}
function renderParams(params, brackets) {
    if (brackets === void 0) { brackets = true; }
    if (!params) {
        return '';
    }
    var builder = [];
    for (var _i = 0, _a = Object.entries(params); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        var params_1 = void 0;
        if (typeof value === 'object') {
            params_1 = "{" + renderParams(value, false) + "}";
        }
        else if (typeof value === 'string') {
            params_1 = "\"" + value + "\"";
        }
        else {
            params_1 = "" + value;
        }
        builder.push(key + ":" + params_1);
    }
    var built = builder.join(',');
    if (brackets) {
        built = "(" + built + ")";
    }
    return built;
}
function renderScalar(name, params) {
    return renderName(name) + renderParams(params);
}
function renderInlineFragment(fragment, context) {
    return "...on " + fragment.typeName + renderObject(undefined, fragment.internal, context);
}
function renderFragment(fragment, context) {
    return "fragment " + fragment.name + " on " + fragment.typeName + renderObject(undefined, fragment.internal, context);
}
function renderArray(name, arr, context) {
    var first = arr[0];
    if (first === undefined || first === null) {
        throw new Error('Cannot render array with no first value');
    }
    first[paramsSymbol] = arr[paramsSymbol];
    return renderType(name, first, context);
}
function renderType(name, value, context) {
    switch (typeof value) {
        case 'bigint':
        case 'boolean':
        case 'number':
        case 'string':
            throw new Error("Rendering type " + typeof value + " directly is disallowed");
        case 'object':
            if (value === null) {
                throw new Error('Cannot render null');
            }
            if (isScalarObject(value)) {
                return renderScalar(name, value[paramsSymbol]) + " ";
            }
            else if (Array.isArray(value)) {
                return renderArray(name, value, context);
            }
            else {
                return renderObject(name, value, context);
            }
        case 'undefined':
            return '';
        default:
            throw new Error("Cannot render type " + typeof value);
    }
}
function renderObject(name, obj, context) {
    var fields = [];
    for (var _i = 0, _a = Object.entries(obj); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        fields.push(renderType(key, value, context));
    }
    for (var _c = 0, _d = Object.getOwnPropertySymbols(obj); _c < _d.length; _c++) {
        var sym = _d[_c];
        var value = obj[sym];
        if (isInlineFragmentObject(value)) {
            fields.push(renderInlineFragment(value, context));
        }
        else if (isFragmentObject(value)) {
            context.fragments.set(sym, value);
            fields.push("..." + value.name);
        }
    }
    if (fields.length === 0) {
        throw new Error('Object cannot have no fields');
    }
    return "" + renderName(name) + renderParams(obj[paramsSymbol]) + "{" + fields.join('').trim() + "}";
}
function render(value) {
    var context = {
        fragments: new Map(),
    };
    var rend = renderObject(undefined, value, context);
    var rendered = new Map();
    var executingContext = context;
    var currentContext = {
        fragments: new Map(),
    };
    while (executingContext.fragments.size > 0) {
        for (var _i = 0, _a = Array.from(executingContext.fragments.entries()); _i < _a.length; _i++) {
            var _b = _a[_i], sym = _b[0], fragment = _b[1];
            if (!rendered.has(sym)) {
                rendered.set(sym, renderFragment(fragment, currentContext));
            }
        }
        executingContext = currentContext;
        currentContext = {
            fragments: new Map(),
        };
    }
    return rend + Array.from(rendered.values()).join('');
}

function createOperate(operateType) {
    function operate(opNameOrQueryObject, queryObject) {
        if (typeof opNameOrQueryObject === 'string') {
            if (!queryObject) {
                throw new Error('queryObject is not set');
            }
            return operateType + " " + opNameOrQueryObject + render(queryObject);
        }
        return "" + operateType + render(opNameOrQueryObject);
    }
    return operate;
}
var query = createOperate('query');
var mutation = createOperate('mutation');
var subscription = createOperate('subscription');
function params(params, input) {
    if (typeof params !== 'object') {
        throw new Error('Params have to be an object');
    }
    if (typeof input !== 'object') {
        throw new Error("Cannot apply params to JS " + typeof params);
    }
    input[paramsSymbol] = params;
    return input;
}
function alias(alias, target) {
    return alias + ":" + target;
}
function fragment(name, typeName, input) {
    var _a, _b;
    var fragment = (_a = {},
        _a[typeSymbol] = GraphQLType.FRAGMENT,
        _a.name = name,
        _a.typeName = typeName,
        _a.internal = input,
        _a);
    return _b = {}, _b[Symbol("Fragment(" + name + " on " + typeName + ")")] = fragment, _b;
}
function rawString(input) {
    return JSON.stringify(input);
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function optional(obj) {
    return obj;
}
function on(typeName, internal) {
    var _a, _b;
    var fragment = (_a = {},
        _a[typeSymbol] = GraphQLType.INLINE_FRAGMENT,
        _a.typeName = typeName,
        _a.internal = internal,
        _a);
    return _b = {}, _b[Symbol("InlineFragment(" + typeName + ")")] = fragment, _b;
}
function onUnion(types) {
    var fragments = {};
    for (var _i = 0, _a = Object.entries(types); _i < _a.length; _i++) {
        var _b = _a[_i], typeName = _b[0], internal = _b[1];
        fragments = __assign(__assign({}, fragments), on(typeName, internal));
    }
    return fragments;
}
function scalarType() {
    var _a;
    var scalar = (_a = {},
        _a[typeSymbol] = GraphQLType.SCALAR,
        _a);
    return scalar;
}
var types = (function () {
    function types() {
    }
    Object.defineProperty(types, "number", {
        get: function () {
            return scalarType();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(types, "string", {
        get: function () {
            return scalarType();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(types, "boolean", {
        get: function () {
            return scalarType();
        },
        enumerable: true,
        configurable: true
    });
    types.constant = function (_c) {
        return scalarType();
    };
    types.oneOf = function (_e) {
        return scalarType();
    };
    types.custom = function () {
        return scalarType();
    };
    types.optional = types;
    return types;
}());

export { fragment, params, query, mutation, subscription, alias, rawString, types, optional, on, onUnion };
//# sourceMappingURL=index.es.js.map
