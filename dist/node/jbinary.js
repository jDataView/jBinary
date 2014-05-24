!function(factory) {
    var global = this;
    module.exports = factory(global, require("jdataview"));
}(function(global, jDataView) {
    "use strict";
    function is(obj, Ctor) {
        return Ctor && obj instanceof Ctor;
    }
    function extend(obj) {
        for (var i = 1, length = arguments.length; length > i; ++i) {
            var source = arguments[i];
            for (var prop in source) void 0 !== source[prop] && (obj[prop] = source[prop]);
        }
        return obj;
    }
    function inherit(obj) {
        return arguments[0] = _inherit(obj), extend.apply(null, arguments);
    }
    function toValue(obj, binary, value) {
        return is(value, Function) ? value.call(obj, binary.contexts[0]) : value;
    }
    function promising(func) {
        return function() {
            var args = arguments, lastArgsIndex = args.length - 1, lastFuncIndex = func.length - 1, callback = args[lastArgsIndex];
            if (args.length = lastFuncIndex + 1, !is(callback, Function)) {
                var self = this;
                return new Promise(function(resolveFn, rejectFn) {
                    args[lastFuncIndex] = function(err, res) {
                        return err ? rejectFn(err) : resolveFn(res);
                    }, func.apply(self, args);
                });
            }
            args[lastArgsIndex] = void 0, args[lastFuncIndex] = callback, func.apply(this, args);
        };
    }
    function jBinary(view, typeSet) {
        return is(view, jBinary) ? view.as(typeSet) : (is(view, jDataView) || (view = new jDataView(view, void 0, void 0, typeSet ? typeSet["jBinary.littleEndian"] : void 0)), 
        is(this, jBinary) ? (this.view = view, this.view.seek(0), this.contexts = [], this.as(typeSet, !0)) : new jBinary(view, typeSet));
    }
    function Type(config) {
        return inherit(Type.prototype, config);
    }
    function Template(config) {
        return inherit(Template.prototype, config, {
            createProperty: function() {
                var property = (config.createProperty || Template.prototype.createProperty).apply(this, arguments);
                return property.getBaseType && (property.baseType = property.binary.getType(property.getBaseType(property.binary.contexts[0]))), 
                property;
            }
        });
    }
    "atob" in global && "btoa" in global || !function() {
        function b(l) {
            var g, j, e, k, h, f;
            for (e = l.length, j = 0, g = ""; e > j; ) {
                if (k = 255 & l.charCodeAt(j++), j == e) {
                    g += a.charAt(k >> 2), g += a.charAt((3 & k) << 4), g += "==";
                    break;
                }
                if (h = l.charCodeAt(j++), j == e) {
                    g += a.charAt(k >> 2), g += a.charAt((3 & k) << 4 | (240 & h) >> 4), g += a.charAt((15 & h) << 2), 
                    g += "=";
                    break;
                }
                f = l.charCodeAt(j++), g += a.charAt(k >> 2), g += a.charAt((3 & k) << 4 | (240 & h) >> 4), 
                g += a.charAt((15 & h) << 2 | (192 & f) >> 6), g += a.charAt(63 & f);
            }
            return g;
        }
        function c(m) {
            var l, k, h, f, j, e, g;
            for (e = m.length, j = 0, g = ""; e > j; ) {
                do l = d[255 & m.charCodeAt(j++)]; while (e > j && -1 == l);
                if (-1 == l) break;
                do k = d[255 & m.charCodeAt(j++)]; while (e > j && -1 == k);
                if (-1 == k) break;
                g += String.fromCharCode(l << 2 | (48 & k) >> 4);
                do {
                    if (h = 255 & m.charCodeAt(j++), 61 == h) return g;
                    h = d[h];
                } while (e > j && -1 == h);
                if (-1 == h) break;
                g += String.fromCharCode((15 & k) << 4 | (60 & h) >> 2);
                do {
                    if (f = 255 & m.charCodeAt(j++), 61 == f) return g;
                    f = d[f];
                } while (e > j && -1 == f);
                if (-1 == f) break;
                g += String.fromCharCode((3 & h) << 6 | f);
            }
            return g;
        }
        var a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", d = [ -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1 ];
        global.btoa || (global.btoa = b), global.atob || (global.atob = c);
    }();
    var Promise = global.Promise || require("es6-promise").Promise, _inherit = Object.create, proto = jBinary.prototype, defaultTypeSet = proto.typeSet = {};
    proto.toValue = function(value) {
        return toValue(this, this, value);
    }, proto._named = function(func, name, offset) {
        return func.displayName = name + " @ " + (void 0 !== offset ? offset : this.view.tell()), 
        func;
    };
    var defineProperty = Object.defineProperty, cacheKey = "jBinary.Cache", cacheId = 0;
    proto._getCached = function(obj, valueAccessor, allowVisible) {
        if (obj.hasOwnProperty(this.cacheKey)) return obj[this.cacheKey];
        var value = valueAccessor.call(this, obj);
        return defineProperty(obj, this.cacheKey, {
            value: value
        }, allowVisible), value;
    }, proto.getContext = function(filter) {
        switch (typeof filter) {
          case "undefined":
            filter = 0;

          case "number":
            return this.contexts[filter];

          case "string":
            return this.getContext(function(context) {
                return filter in context;
            });

          case "function":
            for (var i = 0, length = this.contexts.length; length > i; i++) {
                var context = this.contexts[i];
                if (filter.call(this, context)) return context;
            }
        }
    }, proto.inContext = function(newContext, callback) {
        this.contexts.unshift(newContext);
        var result = callback.call(this);
        return this.contexts.shift(), result;
    }, Type.prototype = {
        inherit: function(args, getType) {
            function withProp(name, callback) {
                var value = _type[name];
                value && (type || (type = inherit(_type)), callback.call(type, value), type[name] = null);
            }
            var type, _type = this;
            return withProp("params", function(params) {
                for (var i = 0, length = params.length; length > i; i++) this[params[i]] = args[i];
            }), withProp("setParams", function(setParams) {
                setParams.apply(this, args);
            }), withProp("typeParams", function(typeParams) {
                for (var i = 0, length = typeParams.length; length > i; i++) {
                    var param = typeParams[i], descriptor = this[param];
                    descriptor && (this[param] = getType(descriptor));
                }
            }), withProp("resolve", function(resolve) {
                resolve.call(this, getType);
            }), type || _type;
        },
        createProperty: function(binary) {
            return inherit(this, {
                binary: binary,
                view: binary.view
            });
        },
        toValue: function(val, allowResolve) {
            return allowResolve !== !1 && "string" == typeof val ? this.binary.getContext(val)[val] : toValue(this, this.binary, val);
        }
    }, jBinary.Type = Type, Template.prototype = inherit(Type.prototype, {
        setParams: function() {
            this.baseType && (this.typeParams = [ "baseType" ].concat(this.typeParams || []));
        },
        baseRead: function() {
            return this.binary.read(this.baseType);
        },
        baseWrite: function(value) {
            return this.binary.write(this.baseType, value);
        }
    }), extend(Template.prototype, {
        read: Template.prototype.baseRead,
        write: Template.prototype.baseWrite
    }), jBinary.Template = Template, proto.as = function(typeSet, modifyOriginal) {
        var binary = modifyOriginal ? this : inherit(this);
        return typeSet = typeSet || defaultTypeSet, binary.typeSet = typeSet === defaultTypeSet || defaultTypeSet.isPrototypeOf(typeSet) ? typeSet : inherit(defaultTypeSet, typeSet), 
        binary.cacheKey = cacheKey, binary.cacheKey = binary._getCached(typeSet, function() {
            return cacheKey + "." + ++cacheId;
        }, !0), binary;
    }, proto.seek = function(position, callback) {
        if (position = this.toValue(position), void 0 !== callback) {
            var oldPos = this.view.tell();
            this.view.seek(position);
            var result = callback.call(this);
            return this.view.seek(oldPos), result;
        }
        return this.view.seek(position);
    }, proto.tell = function() {
        return this.view.tell();
    }, proto.skip = function(offset, callback) {
        return this.seek(this.tell() + this.toValue(offset), callback);
    }, proto.slice = function(start, end, forceCopy) {
        return new jBinary(this.view.slice(start, end, forceCopy), this.typeSet);
    }, proto._getType = function(type, args) {
        switch (typeof type) {
          case "string":
            if (!(type in this.typeSet)) throw new ReferenceError("Unknown type: " + type);
            return this._getType(this.typeSet[type], args);

          case "number":
            return this._getType(defaultTypeSet.bitfield, [ type ]);

          case "object":
            if (is(type, Type)) {
                var binary = this;
                return type.inherit(args || [], function(type) {
                    return binary.getType(type);
                });
            }
            return is(type, Array) ? this._getCached(type, function(type) {
                return this.getType(type[0], type.slice(1));
            }, !0) : this._getCached(type, function(structure) {
                return this.getType(defaultTypeSet.object, [ structure ]);
            }, !1);
        }
    }, proto.getType = function(type, args) {
        var resolvedType = this._getType(type, args);
        return resolvedType && !is(type, Type) && (resolvedType.name = "object" == typeof type ? is(type, Array) ? type[0] + "(" + type.slice(1).join(", ") + ")" : "object" : String(type)), 
        resolvedType;
    }, proto._action = function(type, offset, _callback) {
        if (void 0 !== type) {
            type = this.getType(type);
            var callback = this._named(function() {
                return _callback.call(this, type.createProperty(this), this.contexts[0]);
            }, "[" + type.name + "]", offset);
            return void 0 !== offset ? this.seek(offset, callback) : callback.call(this);
        }
    }, proto.read = function(type, offset) {
        return this._action(type, offset, function(prop, context) {
            return prop.read(context);
        });
    }, proto.readAll = function() {
        return this.read("jBinary.all", 0);
    }, proto.write = function(type, data, offset) {
        return this._action(type, offset, function(prop, context) {
            var start = this.tell();
            return prop.write(data, context), this.tell() - start;
        });
    }, proto.writeAll = function(data) {
        return this.write("jBinary.all", data, 0);
    }, function(simpleType, dataTypes) {
        for (var i = 0, length = dataTypes.length; length > i; i++) {
            var dataType = dataTypes[i];
            defaultTypeSet[dataType.toLowerCase()] = inherit(simpleType, {
                dataType: dataType
            });
        }
    }(Type({
        params: [ "littleEndian" ],
        read: function() {
            return this.view["get" + this.dataType](void 0, this.littleEndian);
        },
        write: function(value) {
            this.view["write" + this.dataType](value, this.littleEndian);
        }
    }), [ "Uint8", "Uint16", "Uint32", "Uint64", "Int8", "Int16", "Int32", "Int64", "Float32", "Float64", "Char" ]), 
    extend(defaultTypeSet, {
        "byte": defaultTypeSet.uint8,
        "float": defaultTypeSet.float32,
        "double": defaultTypeSet.float64
    }), defaultTypeSet.array = Template({
        params: [ "baseType", "length" ],
        read: function() {
            var length = this.toValue(this.length);
            if (this.baseType === defaultTypeSet.uint8) return this.view.getBytes(length, void 0, !0, !0);
            var results;
            if (void 0 !== length) {
                results = new Array(length);
                for (var i = 0; length > i; i++) results[i] = this.baseRead();
            } else {
                var end = this.view.byteLength;
                for (results = []; this.binary.tell() < end; ) results.push(this.baseRead());
            }
            return results;
        },
        write: function(values) {
            if (this.baseType === defaultTypeSet.uint8) return this.view.writeBytes(values);
            for (var i = 0, length = values.length; length > i; i++) this.baseWrite(values[i]);
        }
    }), defaultTypeSet.binary = Template({
        params: [ "length", "typeSet" ],
        read: function() {
            var startPos = this.binary.tell(), endPos = this.binary.skip(this.toValue(this.length)), view = this.view.slice(startPos, endPos);
            return new jBinary(view, this.typeSet);
        },
        write: function(binary) {
            this.binary.write("blob", binary.read("blob", 0));
        }
    }), defaultTypeSet.bitfield = Type({
        params: [ "bitSize" ],
        read: function() {
            return this.view.getUnsigned(this.bitSize);
        },
        write: function(value) {
            this.view.writeUnsigned(value, this.bitSize);
        }
    }), defaultTypeSet.blob = Type({
        params: [ "length" ],
        read: function() {
            return this.view.getBytes(this.toValue(this.length));
        },
        write: function(bytes) {
            this.view.writeBytes(bytes, !0);
        }
    }), defaultTypeSet["const"] = Template({
        params: [ "baseType", "value", "strict" ],
        read: function() {
            var value = this.baseRead();
            if (this.strict && value !== this.value) {
                if (is(this.strict, Function)) return this.strict(value);
                throw new TypeError("Unexpected value (" + value + " !== " + this.value + ").");
            }
            return value;
        },
        write: function(value) {
            this.baseWrite(this.strict || void 0 === value ? this.value : value);
        }
    }), defaultTypeSet["enum"] = Template({
        params: [ "baseType", "matches" ],
        setParams: function(baseType, matches) {
            this.backMatches = {};
            for (var key in matches) this.backMatches[matches[key]] = key;
        },
        read: function() {
            var value = this.baseRead();
            return value in this.matches ? this.matches[value] : value;
        },
        write: function(value) {
            this.baseWrite(value in this.backMatches ? this.backMatches[value] : value);
        }
    }), defaultTypeSet.extend = Type({
        setParams: function() {
            this.parts = arguments;
        },
        resolve: function(getType) {
            for (var parts = this.parts, length = parts.length, partTypes = new Array(length), i = 0; length > i; i++) partTypes[i] = getType(parts[i]);
            this.parts = partTypes;
        },
        read: function() {
            var parts = this.parts, obj = this.binary.read(parts[0]);
            return this.binary.inContext(obj, function() {
                for (var i = 1, length = parts.length; length > i; i++) extend(obj, this.read(parts[i]));
            }), obj;
        },
        write: function(obj) {
            var parts = this.parts;
            this.binary.inContext(obj, function() {
                for (var i = 0, length = parts.length; length > i; i++) this.write(parts[i], obj);
            });
        }
    }), defaultTypeSet["if"] = Template({
        params: [ "condition", "trueType", "falseType" ],
        typeParams: [ "trueType", "falseType" ],
        getBaseType: function() {
            return this.toValue(this.condition) ? this.trueType : this.falseType;
        }
    }), defaultTypeSet.if_not = defaultTypeSet.ifNot = Template({
        setParams: function(condition, falseType, trueType) {
            this.baseType = [ "if", condition, trueType, falseType ];
        }
    }), defaultTypeSet.lazy = Template({
        marker: "jBinary.Lazy",
        params: [ "innerType", "length" ],
        getBaseType: function() {
            return [ "binary", this.length, this.binary.typeSet ];
        },
        read: function() {
            var accessor = function(newValue) {
                return 0 === arguments.length ? "value" in accessor ? accessor.value : accessor.value = accessor.binary.read(accessor.innerType) : extend(accessor, {
                    wasChanged: !0,
                    value: newValue
                }).value;
            };
            return accessor[this.marker] = !0, extend(accessor, {
                binary: extend(this.baseRead(), {
                    contexts: this.binary.contexts.slice()
                }),
                innerType: this.innerType
            });
        },
        write: function(accessor) {
            accessor.wasChanged || !accessor[this.marker] ? this.binary.write(this.innerType, accessor()) : this.baseWrite(accessor.binary);
        }
    }), defaultTypeSet.object = Type({
        params: [ "structure", "proto" ],
        resolve: function(getType) {
            var structure = {};
            for (var key in this.structure) structure[key] = is(this.structure[key], Function) ? this.structure[key] : getType(this.structure[key]);
            this.structure = structure;
        },
        read: function() {
            var self = this, structure = this.structure, output = this.proto ? inherit(this.proto) : {};
            return this.binary.inContext(output, function() {
                for (var key in structure) this._named(function() {
                    var value = is(structure[key], Function) ? structure[key].call(self, output) : this.read(structure[key]);
                    void 0 !== value && (output[key] = value);
                }, key).call(this);
            }), output;
        },
        write: function(data) {
            var self = this, structure = this.structure;
            this.binary.inContext(data, function() {
                for (var key in structure) this._named(function() {
                    is(structure[key], Function) ? data[key] = structure[key].call(self, data) : this.write(structure[key], data[key]);
                }, key).call(this);
            });
        }
    }), defaultTypeSet.skip = Type({
        params: [ "length" ],
        read: function() {
            this.view.skip(this.toValue(this.length));
        },
        write: function() {
            this.read();
        }
    }), defaultTypeSet.string = Template({
        params: [ "length", "encoding" ],
        read: function() {
            return this.view.getString(this.toValue(this.length), void 0, this.encoding);
        },
        write: function(value) {
            this.view.writeString(value, this.encoding);
        }
    }), defaultTypeSet.string0 = Type({
        params: [ "length", "encoding" ],
        read: function() {
            var view = this.view, maxLength = this.length;
            if (void 0 === maxLength) {
                var code, startPos = view.tell(), length = 0;
                for (maxLength = view.byteLength - startPos; maxLength > length && (code = view.getUint8()); ) length++;
                var string = view.getString(length, startPos, this.encoding);
                return maxLength > length && view.skip(1), string;
            }
            return view.getString(maxLength, void 0, this.encoding).replace(/\0.*$/, "");
        },
        write: function(value) {
            var view = this.view, zeroLength = void 0 === this.length ? 1 : this.length - value.length;
            view.writeString(value, void 0, this.encoding), zeroLength > 0 && (view.writeUint8(0), 
            view.skip(zeroLength - 1));
        }
    });
    var ReadableStream = !0 && require("stream").Readable;
    jBinary.loadData = promising(function(source, callback) {
        var dataParts;
        if (is(source, ReadableStream)) {
            var buffers = [];
            source.on("readable", function() {
                buffers.push(this.read());
            }).on("end", function() {
                callback(null, Buffer.concat(buffers));
            }).on("error", callback);
        } else if ("string" != typeof source) callback(new TypeError("Unsupported source type.")); else if (dataParts = source.match(/^data:(.+?)(;base64)?,(.*)$/)) try {
            var isBase64 = dataParts[2], content = dataParts[3];
            callback(null, isBase64 && jDataView.prototype.compatibility.NodeBuffer ? new Buffer(content, "base64") : (isBase64 ? atob : decodeURIComponent)(content));
        } catch (e) {
            callback(e);
        } else {
            /^(https?):\/\//.test(source) ? require("request").get({
                uri: source,
                encoding: null
            }, function(error, response, body) {
                if (!error && 200 !== response.statusCode) {
                    var statusText = require("http").STATUS_CODES[response.statusCode];
                    error = new Error("HTTP Error #" + response.statusCode + ": " + statusText);
                }
                callback(error, body);
            }) : require("fs").readFile(source, callback);
        }
    }), jBinary.load = promising(function(source, typeSet, callback) {
        var whenData = jBinary.loadData(source);
        jBinary.load.getTypeSet(source, typeSet, function(typeSet) {
            whenData.then(function(data) {
                callback(null, new jBinary(data, typeSet));
            }, callback);
        });
    }), jBinary.load.getTypeSet = function(source, typeSet, callback) {
        callback(typeSet);
    }, proto._toURI = function(type) {
        var string = this.seek(0, function() {
            return this.view.getString(void 0, void 0, this.view._isNodeBuffer ? "base64" : "binary");
        });
        return "data:" + type + ";base64," + (this.view._isNodeBuffer ? string : btoa(string));
    }, proto._mimeType = function(mimeType) {
        return mimeType || this.typeSet["jBinary.mimeType"] || "application/octet-stream";
    }, proto.toURI = function(mimeType) {
        return this._toURI(this._mimeType(mimeType));
    };
    var WritableStream = !0 && require("stream").Writable;
    return proto.saveAs = promising(function(dest, mimeType, callback) {
        if ("string" == typeof dest) {
            var buffer = this.read("blob", 0);
            is(buffer, Buffer) || (buffer = new Buffer(buffer)), require("fs").writeFile(dest, buffer, callback);
        } else is(dest, WritableStream) ? dest.write(this.read("blob", 0), callback) : callback(new TypeError("Unsupported storage type."));
    }), jBinary;
});