! function(e) {
    if ("object" == typeof exports && "undefined" != typeof module) module.exports = e();
    else if ("function" == typeof define && define.amd) define([], e);
    else {
        ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).geojsonPathFinder = e()
    }
}(function() {
    return function() {
        return function e(t, r, n) {
            function o(a, s) {
                if (!r[a]) {
                    if (!t[a]) {
                        var u = "function" == typeof require && require;
                        if (!s && u) return u(a, !0);
                        if (i) return i(a, !0);
                        var c = new Error("Cannot find module '" + a + "'");
                        throw c.code = "MODULE_NOT_FOUND", c
                    }
                    var d = r[a] = {
                        exports: {}
                    };
                    t[a][0].call(d.exports, function(e) {
                        return o(t[a][1][e] || e)
                    }, d, d.exports, e, t, r, n)
                }
                return r[a].exports
            }
            for (var i = "function" == typeof require && require, a = 0; a < n.length; a++) o(n[a]);
            return o
        }
    }()({
        1: [function(e, t, r) {
            "use strict";

            function n(e, t, r, n, o, i, a) {
                a = a || {};
                var s = t[e];
                return Object.keys(s).reduce(function(s, u) {
                    var c = function(e, t, r, n, o, i, a, s) {
                            var u = r[e][t],
                                c = r[t][e],
                                d = [],
                                f = [],
                                l = s.edgeDataSeed;
                            for (s.edgeDataReduceFn && (l = s.edgeDataReduceFn(l, i[t][e])); !n[t];) {
                                var g = r[t];
                                if (!g) break;
                                var h = Object.keys(g).filter(function(t) {
                                    return t !== e
                                })[0];
                                if (u += g[h], a) {
                                    if (c += r[h][t], f.indexOf(t) >= 0) {
                                        n[t] = r[t];
                                        break
                                    }
                                    f.push(t)
                                }
                                s.edgeDataReduceFn && (l = s.edgeDataReduceFn(l, i[t][h])), d.push(o[t]), e = t, t = h
                            }
                            return {
                                vertex: t,
                                weight: u,
                                reverseWeight: c,
                                coordinates: d,
                                reducedEdge: l
                            }
                        }(e, u, t, r, n, o, i, a),
                        d = c.weight,
                        f = c.reverseWeight;
                    if (c.vertex !== e && ((!s.edges[c.vertex] || s.edges[c.vertex] > d) && (s.edges[c.vertex] = d, s.coordinates[c.vertex] = [n[e]].concat(c.coordinates), s.reducedEdges[c.vertex] = c.reducedEdge), i && !isNaN(f) && (!s.incomingEdges[c.vertex] || s.incomingEdges[c.vertex] > f))) {
                        s.incomingEdges[c.vertex] = f;
                        var l = [n[e]].concat(c.coordinates);
                        l.reverse(), s.incomingCoordinates[c.vertex] = l
                    }
                    return s
                }, {
                    edges: {},
                    incomingEdges: {},
                    coordinates: {},
                    incomingCoordinates: {},
                    reducedEdges: {}
                })
            }
            t.exports = {
                compactNode: n,
                compactGraph: function(e, t, r, o) {
                    var i = (o = o || {}).progress,
                        a = Object.keys(e).reduce(function(t, r, n, a) {
                            var s, u = e[r],
                                c = Object.keys(u),
                                d = c.length;
                            if (void 0 === o.compact || o.compact)
                                if (1 === d) {
                                    var f = e[c[0]];
                                    s = !f[r]
                                } else s = 2 === d && c.filter(function(t) {
                                    return e[t][r]
                                }).length === d;
                            else s = !1;
                            return s || (t[r] = u), n % 1e3 == 0 && i && i("compact:ends", n, a.length), t
                        }, {});
                    return Object.keys(a).reduce(function(s, u, c, d) {
                        var f = n(u, e, a, t, r, !1, o);
                        return s.graph[u] = f.edges, s.coordinates[u] = f.coordinates, o.edgeDataReduceFn && (s.reducedEdges[u] = f.reducedEdges), c % 1e3 == 0 && i && i("compact:nodes", c, d.length), s
                    }, {
                        graph: {},
                        coordinates: {},
                        reducedEdges: {}
                    })
                }
            }
        }, {}],
        2: [function(e, t, r) {
            var n = e("tinyqueue");
            t.exports = function(e, t, r) {
                var o = {};
                o[t] = 0;
                for (var i = new n([
                        [0, [t], t]
                    ], function(e, t) {
                        return e[0] - t[0]
                    }); i.length;) {
                    var a = i.pop(),
                        s = a[0],
                        u = a[2];
                    if (u === r) return a.slice(0, 2);
                    var c = e[u];
                    Object.keys(c).forEach(function(e) {
                        var t = s + c[e];
                        if (!(e in o) || t < o[e]) {
                            o[e] = t;
                            var r = [t, a[1].concat([e]), e];
                            i.push(r)
                        }
                    })
                }
                return null
            }
        }, {
            tinyqueue: 9
        }],
        3: [function(e, t, r) {
            "use strict";
            var n = e("./dijkstra"),
                o = e("./preprocessor"),
                i = e("./compactor"),
                a = e("./round-coord");

            function s(e, t) {
                if (t = t || {}, e.compactedVertices || (e = o(e, t)), this._graph = e, this._keyFn = t.keyFn || function(e) {
                        return e.join(",")
                    }, this._precision = t.precision || 1e-5, this._options = t, 0 === Object.keys(this._graph.compactedVertices).filter(function(e) {
                        return "edgeData" !== e
                    }).length) throw new Error("Compacted graph contains no forks (topology has no intersections).")
            }
            t.exports = s, s.prototype = {
                findPath: function(e, t) {
                    var r = this._keyFn(a(e.geometry.coordinates, this._precision)),
                        o = this._keyFn(a(t.geometry.coordinates, this._precision));
                    if (!this._graph.vertices[r] || !this._graph.vertices[o]) return null;
                    this._createPhantom(r), this._createPhantom(o);
                    var i = n(this._graph.compactedVertices, r, o);
                    if (i) {
                        var s = i[0];
                        return {
                            path: (i = i[1]).reduce(function(e, t, r, n) {
                                return r > 0 && (e = e.concat(this._graph.compactedCoordinates[n[r - 1]][t])), e
                            }.bind(this), []).concat([this._graph.sourceVertices[o]]),
                            weight: s,
                            edgeDatas: this._graph.compactedEdges ? i.reduce(function(e, t, r, n) {
                                return r > 0 && e.push({
                                    reducedEdge: this._graph.compactedEdges[n[r - 1]][t]
                                }), e
                            }.bind(this), []) : void 0
                        }
                    }
                    return null
                },
                serialize: function() {
                    return this._graph
                },
                _createPhantom: function(e) {
                    if (this._graph.compactedVertices[e]) return null;
                    var t = i.compactNode(e, this._graph.vertices, this._graph.compactedVertices, this._graph.sourceVertices, this._graph.edgeData, !0, this._options);
                    return this._graph.compactedVertices[e] = t.edges, this._graph.compactedCoordinates[e] = t.coordinates, this._graph.compactedEdges && (this._graph.compactedEdges[e] = t.reducedEdges), Object.keys(t.incomingEdges).forEach(function(r) {
                        this._graph.compactedVertices[r][e] = t.incomingEdges[r], this._graph.compactedCoordinates[r][e] = [this._graph.sourceVertices[r]].concat(t.incomingCoordinates[r].slice(0, -1)), this._graph.compactedEdges && (this._graph.compactedEdges[r][e] = t.reducedEdges[r])
                    }.bind(this)), e
                },
                _removePhantom: function(e) {
                    e && (Object.keys(this._graph.compactedVertices[e]).forEach(function(t) {
                        delete this._graph.compactedVertices[t][e]
                    }.bind(this)), Object.keys(this._graph.compactedCoordinates[e]).forEach(function(t) {
                        delete this._graph.compactedCoordinates[t][e]
                    }.bind(this)), this._graph.compactedEdges && Object.keys(this._graph.compactedEdges[e]).forEach(function(t) {
                        delete this._graph.compactedEdges[t][e]
                    }.bind(this)), delete this._graph.compactedVertices[e], delete this._graph.compactedCoordinates[e], this._graph.compactedEdges && delete this._graph.compactedEdges[e])
                }
            }
        }, {
            "./compactor": 1,
            "./dijkstra": 2,
            "./preprocessor": 10,
            "./round-coord": 11
        }],
        4: [function(e, t, r) {
            "use strict";
            Object.defineProperty(r, "__esModule", {
                value: !0
            });
            var n = e("@turf/invariant"),
                o = e("@turf/helpers");
            r.default = function(e, t, r) {
                void 0 === r && (r = {});
                var i = n.getCoord(e),
                    a = n.getCoord(t),
                    s = o.degreesToRadians(a[1] - i[1]),
                    u = o.degreesToRadians(a[0] - i[0]),
                    c = o.degreesToRadians(i[1]),
                    d = o.degreesToRadians(a[1]),
                    f = Math.pow(Math.sin(s / 2), 2) + Math.pow(Math.sin(u / 2), 2) * Math.cos(c) * Math.cos(d);
                return o.radiansToLength(2 * Math.atan2(Math.sqrt(f), Math.sqrt(1 - f)), r.units)
            }
        }, {
            "@turf/helpers": 6,
            "@turf/invariant": 7
        }],
        5: [function(e, t, r) {
            "use strict";
            var n = e("@turf/meta"),
                o = e("@turf/helpers");
            t.exports = function(e) {
                var t = [];
                return "FeatureCollection" === e.type ? n.featureEach(e, function(e) {
                    n.coordEach(e, function(r) {
                        t.push(o.point(r, e.properties))
                    })
                }) : n.coordEach(e, function(r) {
                    t.push(o.point(r, e.properties))
                }), o.featureCollection(t)
            }
        }, {
            "@turf/helpers": 6,
            "@turf/meta": 8
        }],
        6: [function(e, t, r) {
            "use strict";

            function n(e, t, r) {
                void 0 === r && (r = {});
                var n = {
                    type: "Feature"
                };
                return (0 === r.id || r.id) && (n.id = r.id), r.bbox && (n.bbox = r.bbox), n.properties = t || {}, n.geometry = e, n
            }

            function o(e, t, r) {
                if (void 0 === r && (r = {}), !e) throw new Error("coordinates is required");
                if (!Array.isArray(e)) throw new Error("coordinates must be an Array");
                if (e.length < 2) throw new Error("coordinates must be at least 2 numbers long");
                if (!h(e[0]) || !h(e[1])) throw new Error("coordinates must contain numbers");
                return n({
                    type: "Point",
                    coordinates: e
                }, t, r)
            }

            function i(e, t, r) {
                void 0 === r && (r = {});
                for (var o = 0, i = e; o < i.length; o++) {
                    var a = i[o];
                    if (a.length < 4) throw new Error("Each LinearRing of a Polygon must have 4 or more Positions.");
                    for (var s = 0; s < a[a.length - 1].length; s++)
                        if (a[a.length - 1][s] !== a[0][s]) throw new Error("First and last Position are not equivalent.")
                }
                return n({
                    type: "Polygon",
                    coordinates: e
                }, t, r)
            }

            function a(e, t, r) {
                if (void 0 === r && (r = {}), e.length < 2) throw new Error("coordinates must be an array of two or more positions");
                return n({
                    type: "LineString",
                    coordinates: e
                }, t, r)
            }

            function s(e, t) {
                void 0 === t && (t = {});
                var r = {
                    type: "FeatureCollection"
                };
                return t.id && (r.id = t.id), t.bbox && (r.bbox = t.bbox), r.features = e, r
            }

            function u(e, t, r) {
                return void 0 === r && (r = {}), n({
                    type: "MultiLineString",
                    coordinates: e
                }, t, r)
            }

            function c(e, t, r) {
                return void 0 === r && (r = {}), n({
                    type: "MultiPoint",
                    coordinates: e
                }, t, r)
            }

            function d(e, t, r) {
                return void 0 === r && (r = {}), n({
                    type: "MultiPolygon",
                    coordinates: e
                }, t, r)
            }

            function f(e, t) {
                void 0 === t && (t = "kilometers");
                var n = r.factors[t];
                if (!n) throw new Error(t + " units is invalid");
                return e * n
            }

            function l(e, t) {
                void 0 === t && (t = "kilometers");
                var n = r.factors[t];
                if (!n) throw new Error(t + " units is invalid");
                return e / n
            }

            function g(e) {
                return 180 * (e % (2 * Math.PI)) / Math.PI
            }

            function h(e) {
                return !isNaN(e) && null !== e && !Array.isArray(e)
            }
            Object.defineProperty(r, "__esModule", {
                value: !0
            }), r.earthRadius = 6371008.8, r.factors = {
                centimeters: 100 * r.earthRadius,
                centimetres: 100 * r.earthRadius,
                degrees: r.earthRadius / 111325,
                feet: 3.28084 * r.earthRadius,
                inches: 39.37 * r.earthRadius,
                kilometers: r.earthRadius / 1e3,
                kilometres: r.earthRadius / 1e3,
                meters: r.earthRadius,
                metres: r.earthRadius,
                miles: r.earthRadius / 1609.344,
                millimeters: 1e3 * r.earthRadius,
                millimetres: 1e3 * r.earthRadius,
                nauticalmiles: r.earthRadius / 1852,
                radians: 1,
                yards: 1.0936 * r.earthRadius
            }, r.unitsFactors = {
                centimeters: 100,
                centimetres: 100,
                degrees: 1 / 111325,
                feet: 3.28084,
                inches: 39.37,
                kilometers: .001,
                kilometres: .001,
                meters: 1,
                metres: 1,
                miles: 1 / 1609.344,
                millimeters: 1e3,
                millimetres: 1e3,
                nauticalmiles: 1 / 1852,
                radians: 1 / r.earthRadius,
                yards: 1.0936133
            }, r.areaFactors = {
                acres: 247105e-9,
                centimeters: 1e4,
                centimetres: 1e4,
                feet: 10.763910417,
                hectares: 1e-4,
                inches: 1550.003100006,
                kilometers: 1e-6,
                kilometres: 1e-6,
                meters: 1,
                metres: 1,
                miles: 3.86e-7,
                millimeters: 1e6,
                millimetres: 1e6,
                yards: 1.195990046
            }, r.feature = n, r.geometry = function(e, t, r) {
                switch (void 0 === r && (r = {}), e) {
                    case "Point":
                        return o(t).geometry;
                    case "LineString":
                        return a(t).geometry;
                    case "Polygon":
                        return i(t).geometry;
                    case "MultiPoint":
                        return c(t).geometry;
                    case "MultiLineString":
                        return u(t).geometry;
                    case "MultiPolygon":
                        return d(t).geometry;
                    default:
                        throw new Error(e + " is invalid")
                }
            }, r.point = o, r.points = function(e, t, r) {
                return void 0 === r && (r = {}), s(e.map(function(e) {
                    return o(e, t)
                }), r)
            }, r.polygon = i, r.polygons = function(e, t, r) {
                return void 0 === r && (r = {}), s(e.map(function(e) {
                    return i(e, t)
                }), r)
            }, r.lineString = a, r.lineStrings = function(e, t, r) {
                return void 0 === r && (r = {}), s(e.map(function(e) {
                    return a(e, t)
                }), r)
            }, r.featureCollection = s, r.multiLineString = u, r.multiPoint = c, r.multiPolygon = d, r.geometryCollection = function(e, t, r) {
                return void 0 === r && (r = {}), n({
                    type: "GeometryCollection",
                    geometries: e
                }, t, r)
            }, r.round = function(e, t) {
                if (void 0 === t && (t = 0), t && !(t >= 0)) throw new Error("precision must be a positive number");
                var r = Math.pow(10, t || 0);
                return Math.round(e * r) / r
            }, r.radiansToLength = f, r.lengthToRadians = l, r.lengthToDegrees = function(e, t) {
                return g(l(e, t))
            }, r.bearingToAzimuth = function(e) {
                var t = e % 360;
                return t < 0 && (t += 360), t
            }, r.radiansToDegrees = g, r.degreesToRadians = function(e) {
                return e % 360 * Math.PI / 180
            }, r.convertLength = function(e, t, r) {
                if (void 0 === t && (t = "kilometers"), void 0 === r && (r = "kilometers"), !(e >= 0)) throw new Error("length must be a positive number");
                return f(l(e, t), r)
            }, r.convertArea = function(e, t, n) {
                if (void 0 === t && (t = "meters"), void 0 === n && (n = "kilometers"), !(e >= 0)) throw new Error("area must be a positive number");
                var o = r.areaFactors[t];
                if (!o) throw new Error("invalid original units");
                var i = r.areaFactors[n];
                if (!i) throw new Error("invalid final units");
                return e / o * i
            }, r.isNumber = h, r.isObject = function(e) {
                return !!e && e.constructor === Object
            }, r.validateBBox = function(e) {
                if (!e) throw new Error("bbox is required");
                if (!Array.isArray(e)) throw new Error("bbox must be an Array");
                if (4 !== e.length && 6 !== e.length) throw new Error("bbox must be an Array of 4 or 6 numbers");
                e.forEach(function(e) {
                    if (!h(e)) throw new Error("bbox must only contain numbers")
                })
            }, r.validateId = function(e) {
                if (!e) throw new Error("id is required");
                if (-1 === ["string", "number"].indexOf(typeof e)) throw new Error("id must be a number or a string")
            }
        }, {}],
        7: [function(e, t, r) {
            "use strict";
            Object.defineProperty(r, "__esModule", {
                value: !0
            });
            var n = e("@turf/helpers");
            r.getCoord = function(e) {
                if (!e) throw new Error("coord is required");
                if (!Array.isArray(e)) {
                    if ("Feature" === e.type && null !== e.geometry && "Point" === e.geometry.type) return e.geometry.coordinates;
                    if ("Point" === e.type) return e.coordinates
                }
                if (Array.isArray(e) && e.length >= 2 && !Array.isArray(e[0]) && !Array.isArray(e[1])) return e;
                throw new Error("coord must be GeoJSON Point or an Array of numbers")
            }, r.getCoords = function(e) {
                if (Array.isArray(e)) return e;
                if ("Feature" === e.type) {
                    if (null !== e.geometry) return e.geometry.coordinates
                } else if (e.coordinates) return e.coordinates;
                throw new Error("coords must be GeoJSON Feature, Geometry Object or an Array")
            }, r.containsNumber = function e(t) {
                if (t.length > 1 && n.isNumber(t[0]) && n.isNumber(t[1])) return !0;
                if (Array.isArray(t[0]) && t[0].length) return e(t[0]);
                throw new Error("coordinates must only contain numbers")
            }, r.geojsonType = function(e, t, r) {
                if (!t || !r) throw new Error("type and name required");
                if (!e || e.type !== t) throw new Error("Invalid input to " + r + ": must be a " + t + ", given " + e.type)
            }, r.featureOf = function(e, t, r) {
                if (!e) throw new Error("No feature passed");
                if (!r) throw new Error(".featureOf() requires a name");
                if (!e || "Feature" !== e.type || !e.geometry) throw new Error("Invalid input to " + r + ", Feature with geometry required");
                if (!e.geometry || e.geometry.type !== t) throw new Error("Invalid input to " + r + ": must be a " + t + ", given " + e.geometry.type)
            }, r.collectionOf = function(e, t, r) {
                if (!e) throw new Error("No featureCollection passed");
                if (!r) throw new Error(".collectionOf() requires a name");
                if (!e || "FeatureCollection" !== e.type) throw new Error("Invalid input to " + r + ", FeatureCollection required");
                for (var n = 0, o = e.features; n < o.length; n++) {
                    var i = o[n];
                    if (!i || "Feature" !== i.type || !i.geometry) throw new Error("Invalid input to " + r + ", Feature with geometry required");
                    if (!i.geometry || i.geometry.type !== t) throw new Error("Invalid input to " + r + ": must be a " + t + ", given " + i.geometry.type)
                }
            }, r.getGeom = function(e) {
                return "Feature" === e.type ? e.geometry : e
            }, r.getType = function(e, t) {
                return "FeatureCollection" === e.type ? "FeatureCollection" : "GeometryCollection" === e.type ? "GeometryCollection" : "Feature" === e.type && null !== e.geometry ? e.geometry.type : e.type
            }
        }, {
            "@turf/helpers": 6
        }],
        8: [function(e, t, r) {
            "use strict";
            Object.defineProperty(r, "__esModule", {
                value: !0
            });
            var n = e("@turf/helpers");

            function o(e, t, r) {
                if (null !== e)
                    for (var n, i, a, s, u, c, d, f, l = 0, g = 0, h = e.type, p = "FeatureCollection" === h, m = "Feature" === h, y = p ? e.features.length : 1, v = 0; v < y; v++) {
                        u = (f = !!(d = p ? e.features[v].geometry : m ? e.geometry : e) && "GeometryCollection" === d.type) ? d.geometries.length : 1;
                        for (var w = 0; w < u; w++) {
                            var b = 0,
                                E = 0;
                            if (null !== (s = f ? d.geometries[w] : d)) {
                                c = s.coordinates;
                                var P = s.type;
                                switch (l = !r || "Polygon" !== P && "MultiPolygon" !== P ? 0 : 1, P) {
                                    case null:
                                        break;
                                    case "Point":
                                        if (!1 === t(c, g, v, b, E)) return !1;
                                        g++, b++;
                                        break;
                                    case "LineString":
                                    case "MultiPoint":
                                        for (n = 0; n < c.length; n++) {
                                            if (!1 === t(c[n], g, v, b, E)) return !1;
                                            g++, "MultiPoint" === P && b++
                                        }
                                        "LineString" === P && b++;
                                        break;
                                    case "Polygon":
                                    case "MultiLineString":
                                        for (n = 0; n < c.length; n++) {
                                            for (i = 0; i < c[n].length - l; i++) {
                                                if (!1 === t(c[n][i], g, v, b, E)) return !1;
                                                g++
                                            }
                                            "MultiLineString" === P && b++, "Polygon" === P && E++
                                        }
                                        "Polygon" === P && b++;
                                        break;
                                    case "MultiPolygon":
                                        for (n = 0; n < c.length; n++) {
                                            for (E = 0, i = 0; i < c[n].length; i++) {
                                                for (a = 0; a < c[n][i].length - l; a++) {
                                                    if (!1 === t(c[n][i][a], g, v, b, E)) return !1;
                                                    g++
                                                }
                                                E++
                                            }
                                            b++
                                        }
                                        break;
                                    case "GeometryCollection":
                                        for (n = 0; n < s.geometries.length; n++)
                                            if (!1 === o(s.geometries[n], t, r)) return !1;
                                        break;
                                    default:
                                        throw new Error("Unknown Geometry Type")
                                }
                            }
                        }
                    }
            }

            function i(e, t) {
                var r;
                switch (e.type) {
                    case "FeatureCollection":
                        for (r = 0; r < e.features.length && !1 !== t(e.features[r].properties, r); r++);
                        break;
                    case "Feature":
                        t(e.properties, 0)
                }
            }

            function a(e, t) {
                if ("Feature" === e.type) t(e, 0);
                else if ("FeatureCollection" === e.type)
                    for (var r = 0; r < e.features.length && !1 !== t(e.features[r], r); r++);
            }

            function s(e, t) {
                var r, n, o, i, a, s, u, c, d, f, l = 0,
                    g = "FeatureCollection" === e.type,
                    h = "Feature" === e.type,
                    p = g ? e.features.length : 1;
                for (r = 0; r < p; r++) {
                    for (s = g ? e.features[r].geometry : h ? e.geometry : e, c = g ? e.features[r].properties : h ? e.properties : {}, d = g ? e.features[r].bbox : h ? e.bbox : void 0, f = g ? e.features[r].id : h ? e.id : void 0, a = (u = !!s && "GeometryCollection" === s.type) ? s.geometries.length : 1, o = 0; o < a; o++)
                        if (null !== (i = u ? s.geometries[o] : s)) switch (i.type) {
                            case "Point":
                            case "LineString":
                            case "MultiPoint":
                            case "Polygon":
                            case "MultiLineString":
                            case "MultiPolygon":
                                if (!1 === t(i, l, c, d, f)) return !1;
                                break;
                            case "GeometryCollection":
                                for (n = 0; n < i.geometries.length; n++)
                                    if (!1 === t(i.geometries[n], l, c, d, f)) return !1;
                                break;
                            default:
                                throw new Error("Unknown Geometry Type")
                        } else if (!1 === t(null, l, c, d, f)) return !1;
                    l++
                }
            }

            function u(e, t) {
                s(e, function(e, r, o, i, a) {
                    var s, u = null === e ? null : e.type;
                    switch (u) {
                        case null:
                        case "Point":
                        case "LineString":
                        case "Polygon":
                            return !1 !== t(n.feature(e, o, {
                                bbox: i,
                                id: a
                            }), r, 0) && void 0
                    }
                    switch (u) {
                        case "MultiPoint":
                            s = "Point";
                            break;
                        case "MultiLineString":
                            s = "LineString";
                            break;
                        case "MultiPolygon":
                            s = "Polygon"
                    }
                    for (var c = 0; c < e.coordinates.length; c++) {
                        var d = {
                            type: s,
                            coordinates: e.coordinates[c]
                        };
                        if (!1 === t(n.feature(d, o), r, c)) return !1
                    }
                })
            }

            function c(e, t) {
                u(e, function(e, r, i) {
                    var a = 0;
                    if (e.geometry) {
                        var s = e.geometry.type;
                        if ("Point" !== s && "MultiPoint" !== s) {
                            var u, c = 0,
                                d = 0,
                                f = 0;
                            return !1 !== o(e, function(o, s, l, g, h) {
                                if (void 0 === u || r > c || g > d || h > f) return u = o, c = r, d = g, f = h, void(a = 0);
                                var p = n.lineString([u, o], e.properties);
                                if (!1 === t(p, r, i, h, a)) return !1;
                                a++, u = o
                            }) && void 0
                        }
                    }
                })
            }

            function d(e, t) {
                if (!e) throw new Error("geojson is required");
                u(e, function(e, r, o) {
                    if (null !== e.geometry) {
                        var i = e.geometry.type,
                            a = e.geometry.coordinates;
                        switch (i) {
                            case "LineString":
                                if (!1 === t(e, r, o, 0, 0)) return !1;
                                break;
                            case "Polygon":
                                for (var s = 0; s < a.length; s++)
                                    if (!1 === t(n.lineString(a[s], e.properties), r, o, s)) return !1
                        }
                    }
                })
            }
            r.coordEach = o, r.coordReduce = function(e, t, r, n) {
                var i = r;
                return o(e, function(e, n, o, a, s) {
                    i = 0 === n && void 0 === r ? e : t(i, e, n, o, a, s)
                }, n), i
            }, r.propEach = i, r.propReduce = function(e, t, r) {
                var n = r;
                return i(e, function(e, o) {
                    n = 0 === o && void 0 === r ? e : t(n, e, o)
                }), n
            }, r.featureEach = a, r.featureReduce = function(e, t, r) {
                var n = r;
                return a(e, function(e, o) {
                    n = 0 === o && void 0 === r ? e : t(n, e, o)
                }), n
            }, r.coordAll = function(e) {
                var t = [];
                return o(e, function(e) {
                    t.push(e)
                }), t
            }, r.geomEach = s, r.geomReduce = function(e, t, r) {
                var n = r;
                return s(e, function(e, o, i, a, s) {
                    n = 0 === o && void 0 === r ? e : t(n, e, o, i, a, s)
                }), n
            }, r.flattenEach = u, r.flattenReduce = function(e, t, r) {
                var n = r;
                return u(e, function(e, o, i) {
                    n = 0 === o && 0 === i && void 0 === r ? e : t(n, e, o, i)
                }), n
            }, r.segmentEach = c, r.segmentReduce = function(e, t, r) {
                var n = r,
                    o = !1;
                return c(e, function(e, i, a, s, u) {
                    n = !1 === o && void 0 === r ? e : t(n, e, i, a, s, u), o = !0
                }), n
            }, r.lineEach = d, r.lineReduce = function(e, t, r) {
                var n = r;
                return d(e, function(e, o, i, a) {
                    n = 0 === o && void 0 === r ? e : t(n, e, o, i, a)
                }), n
            }, r.findSegment = function(e, t) {
                if (t = t || {}, !n.isObject(t)) throw new Error("options is invalid");
                var r, o = t.featureIndex || 0,
                    i = t.multiFeatureIndex || 0,
                    a = t.geometryIndex || 0,
                    s = t.segmentIndex || 0,
                    u = t.properties;
                switch (e.type) {
                    case "FeatureCollection":
                        o < 0 && (o = e.features.length + o), u = u || e.features[o].properties, r = e.features[o].geometry;
                        break;
                    case "Feature":
                        u = u || e.properties, r = e.geometry;
                        break;
                    case "Point":
                    case "MultiPoint":
                        return null;
                    case "LineString":
                    case "Polygon":
                    case "MultiLineString":
                    case "MultiPolygon":
                        r = e;
                        break;
                    default:
                        throw new Error("geojson is invalid")
                }
                if (null === r) return null;
                var c = r.coordinates;
                switch (r.type) {
                    case "Point":
                    case "MultiPoint":
                        return null;
                    case "LineString":
                        return s < 0 && (s = c.length + s - 1), n.lineString([c[s], c[s + 1]], u, t);
                    case "Polygon":
                        return a < 0 && (a = c.length + a), s < 0 && (s = c[a].length + s - 1), n.lineString([c[a][s], c[a][s + 1]], u, t);
                    case "MultiLineString":
                        return i < 0 && (i = c.length + i), s < 0 && (s = c[i].length + s - 1), n.lineString([c[i][s], c[i][s + 1]], u, t);
                    case "MultiPolygon":
                        return i < 0 && (i = c.length + i), a < 0 && (a = c[i].length + a), s < 0 && (s = c[i][a].length - s - 1), n.lineString([c[i][a][s], c[i][a][s + 1]], u, t)
                }
                throw new Error("geojson is invalid")
            }, r.findPoint = function(e, t) {
                if (t = t || {}, !n.isObject(t)) throw new Error("options is invalid");
                var r, o = t.featureIndex || 0,
                    i = t.multiFeatureIndex || 0,
                    a = t.geometryIndex || 0,
                    s = t.coordIndex || 0,
                    u = t.properties;
                switch (e.type) {
                    case "FeatureCollection":
                        o < 0 && (o = e.features.length + o), u = u || e.features[o].properties, r = e.features[o].geometry;
                        break;
                    case "Feature":
                        u = u || e.properties, r = e.geometry;
                        break;
                    case "Point":
                    case "MultiPoint":
                        return null;
                    case "LineString":
                    case "Polygon":
                    case "MultiLineString":
                    case "MultiPolygon":
                        r = e;
                        break;
                    default:
                        throw new Error("geojson is invalid")
                }
                if (null === r) return null;
                var c = r.coordinates;
                switch (r.type) {
                    case "Point":
                        return n.point(c, u, t);
                    case "MultiPoint":
                        return i < 0 && (i = c.length + i), n.point(c[i], u, t);
                    case "LineString":
                        return s < 0 && (s = c.length + s), n.point(c[s], u, t);
                    case "Polygon":
                        return a < 0 && (a = c.length + a), s < 0 && (s = c[a].length + s), n.point(c[a][s], u, t);
                    case "MultiLineString":
                        return i < 0 && (i = c.length + i), s < 0 && (s = c[i].length + s), n.point(c[i][s], u, t);
                    case "MultiPolygon":
                        return i < 0 && (i = c.length + i), a < 0 && (a = c[i].length + a), s < 0 && (s = c[i][a].length - s), n.point(c[i][a][s], u, t)
                }
                throw new Error("geojson is invalid")
            }
        }, {
            "@turf/helpers": 6
        }],
        9: [function(e, t, r) {
            var n, o;
            n = this, o = function() {
                "use strict";
                var e = function(e, r) {
                    if (void 0 === e && (e = []), void 0 === r && (r = t), this.data = e, this.length = this.data.length, this.compare = r, this.length > 0)
                        for (var n = (this.length >> 1) - 1; n >= 0; n--) this._down(n)
                };

                function t(e, t) {
                    return e < t ? -1 : e > t ? 1 : 0
                }
                return e.prototype.push = function(e) {
                    this.data.push(e), this.length++, this._up(this.length - 1)
                }, e.prototype.pop = function() {
                    if (0 !== this.length) {
                        var e = this.data[0],
                            t = this.data.pop();
                        return this.length--, this.length > 0 && (this.data[0] = t, this._down(0)), e
                    }
                }, e.prototype.peek = function() {
                    return this.data[0]
                }, e.prototype._up = function(e) {
                    for (var t = this.data, r = this.compare, n = t[e]; e > 0;) {
                        var o = e - 1 >> 1,
                            i = t[o];
                        if (r(n, i) >= 0) break;
                        t[e] = i, e = o
                    }
                    t[e] = n
                }, e.prototype._down = function(e) {
                    for (var t = this.data, r = this.compare, n = this.length >> 1, o = t[e]; e < n;) {
                        var i = 1 + (e << 1),
                            a = t[i],
                            s = i + 1;
                        if (s < this.length && r(t[s], a) < 0 && (i = s, a = t[s]), r(a, o) >= 0) break;
                        t[e] = a, e = i
                    }
                    t[e] = o
                }, e
            }, "object" == typeof r && void 0 !== t ? t.exports = o() : (n = n || self).TinyQueue = o()
        }, {}],
        10: [function(e, t, r) {
            "use strict";
            var n = e("./topology"),
                o = e("./compactor"),
                i = e("@turf/distance").default,
                {
                    point: a
                } = e("@turf/helpers");
            t.exports = function(e, t) {
                var r, s = (t = t || {}).weightFn || function(e, t) {
                    return i(a(e), a(t))
                };
                "FeatureCollection" === e.type ? r = n(e, t) : e.edges && (r = e);
                e = r.edges.reduce(function(e, n, o, i) {
                    var a = n[0],
                        u = n[1],
                        c = n[2],
                        d = s(r.vertices[a], r.vertices[u], c),
                        f = function(r) {
                            e.vertices[r] || (e.vertices[r] = {}, t.edgeDataReduceFn && (e.edgeData[r] = {}))
                        },
                        l = function(r, n, o) {
                            e.vertices[r][n] = o, t.edgeDataReduceFn && (e.edgeData[r][n] = t.edgeDataReduceFn(t.edgeDataSeed, c))
                        };
                    return d && (f(a), f(u), d instanceof Object ? (d.forward && l(a, u, d.forward), d.backward && l(u, a, d.backward)) : (l(a, u, d), l(u, a, d))), o % 1e3 == 0 && t.progress && t.progress("edgeweights", o, i.length), e
                }, {
                    edgeData: {},
                    vertices: {}
                });
                var u = o.compactGraph(e.vertices, r.vertices, e.edgeData, t);
                return {
                    vertices: e.vertices,
                    edgeData: e.edgeData,
                    sourceVertices: r.vertices,
                    compactedVertices: u.graph,
                    compactedCoordinates: u.coordinates,
                    compactedEdges: t.edgeDataReduceFn ? u.reducedEdges : null
                }
            }
        }, {
            "./compactor": 1,
            "./topology": 12,
            "@turf/distance": 4,
            "@turf/helpers": 6
        }],
        11: [function(e, t, r) {
            t.exports = function(e, t) {
                return [Math.round(e[0] / t) * t, Math.round(e[1] / t) * t]
            }
        }, {}],
        12: [function(e, t, r) {
            "use strict";
            var n = e("@turf/explode"),
                o = e("./round-coord");

            function i(e) {
                return "LineString" === e.geometry.type
            }
            t.exports = function(e, t) {
                var r = (t = t || {}).keyFn || function(e) {
                        return e.join(",")
                    },
                    a = t.precision || 1e-5,
                    s = function(e, t) {
                        var r = [];
                        "FeatureCollection" === e.type && (r = r.concat(e.features.filter(t)));
                        return {
                            type: "FeatureCollection",
                            features: r
                        }
                    }(e, i),
                    u = n(s).features.reduce(function(e, n, i, s) {
                        var u = o(n.geometry.coordinates, a);
                        return e[r(u)] = n.geometry.coordinates, i % 1e3 == 0 && t.progress && t.progress("topo:vertices", i, s.length), e
                    }, {}),
                    c = function e(t, r, n) {
                        return "FeatureCollection" === t.type ? t.features.reduce(function(t, n) {
                            return e(n, r, t)
                        }, n) : r(n, t)
                    }(s, function(e, n, i, s) {
                        return n.geometry.coordinates.forEach(function(t, i, s) {
                            if (i > 0) {
                                var u = r(o(s[i - 1], a)),
                                    c = r(o(t, a));
                                e.push([u, c, n.properties])
                            }
                        }), i % 1e3 == 0 && t.progress && t.progress("topo:edges", i, s.length), e
                    }, []);
                return {
                    vertices: u,
                    edges: c
                }
            }
        }, {
            "./round-coord": 11,
            "@turf/explode": 5
        }]
    }, {}, [3])(3)
});
