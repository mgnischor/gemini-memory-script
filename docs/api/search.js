window.pdocSearch = (function () {
    /** elasticlunr - http://weixsong.github.io * Copyright (C) 2017 Oliver Nightingale * Copyright (C) 2017 Wei Song * MIT Licensed */ !(function () {
        function e(e) {
            if (null === e || "object" != typeof e) return e;
            var t = e.constructor();
            for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
            return t;
        }
        var t = function (e) {
            var n = new t.Index();
            return (n.pipeline.add(t.trimmer, t.stopWordFilter, t.stemmer), e && e.call(n, n), n);
        };
        ((t.version = "0.9.5"),
            (lunr = t),
            (t.utils = {}),
            (t.utils.warn = (function (e) {
                return function (t) {
                    e.console && console.warn && console.warn(t);
                };
            })(this)),
            (t.utils.toString = function (e) {
                return void 0 === e || null === e ? "" : e.toString();
            }),
            (t.EventEmitter = function () {
                this.events = {};
            }),
            (t.EventEmitter.prototype.addListener = function () {
                var e = Array.prototype.slice.call(arguments),
                    t = e.pop(),
                    n = e;
                if ("function" != typeof t) throw new TypeError("last argument must be a function");
                n.forEach(function (e) {
                    (this.hasHandler(e) || (this.events[e] = []), this.events[e].push(t));
                }, this);
            }),
            (t.EventEmitter.prototype.removeListener = function (e, t) {
                if (this.hasHandler(e)) {
                    var n = this.events[e].indexOf(t);
                    -1 !== n && (this.events[e].splice(n, 1), 0 == this.events[e].length && delete this.events[e]);
                }
            }),
            (t.EventEmitter.prototype.emit = function (e) {
                if (this.hasHandler(e)) {
                    var t = Array.prototype.slice.call(arguments, 1);
                    this.events[e].forEach(function (e) {
                        e.apply(void 0, t);
                    }, this);
                }
            }),
            (t.EventEmitter.prototype.hasHandler = function (e) {
                return e in this.events;
            }),
            (t.tokenizer = function (e) {
                if (!arguments.length || null === e || void 0 === e) return [];
                if (Array.isArray(e)) {
                    var n = e.filter(function (e) {
                        return null === e || void 0 === e ? !1 : !0;
                    });
                    n = n.map(function (e) {
                        return t.utils.toString(e).toLowerCase();
                    });
                    var i = [];
                    return (
                        n.forEach(function (e) {
                            var n = e.split(t.tokenizer.seperator);
                            i = i.concat(n);
                        }, this),
                        i
                    );
                }
                return e.toString().trim().toLowerCase().split(t.tokenizer.seperator);
            }),
            (t.tokenizer.defaultSeperator = /[\s\-]+/),
            (t.tokenizer.seperator = t.tokenizer.defaultSeperator),
            (t.tokenizer.setSeperator = function (e) {
                null !== e && void 0 !== e && "object" == typeof e && (t.tokenizer.seperator = e);
            }),
            (t.tokenizer.resetSeperator = function () {
                t.tokenizer.seperator = t.tokenizer.defaultSeperator;
            }),
            (t.tokenizer.getSeperator = function () {
                return t.tokenizer.seperator;
            }),
            (t.Pipeline = function () {
                this._queue = [];
            }),
            (t.Pipeline.registeredFunctions = {}),
            (t.Pipeline.registerFunction = function (e, n) {
                (n in t.Pipeline.registeredFunctions && t.utils.warn("Overwriting existing registered function: " + n),
                    (e.label = n),
                    (t.Pipeline.registeredFunctions[n] = e));
            }),
            (t.Pipeline.getRegisteredFunction = function (e) {
                return e in t.Pipeline.registeredFunctions != !0 ? null : t.Pipeline.registeredFunctions[e];
            }),
            (t.Pipeline.warnIfFunctionNotRegistered = function (e) {
                var n = e.label && e.label in this.registeredFunctions;
                n ||
                    t.utils.warn(
                        "Function is not registered with pipeline. This may cause problems when serialising the index.\n",
                        e
                    );
            }),
            (t.Pipeline.load = function (e) {
                var n = new t.Pipeline();
                return (
                    e.forEach(function (e) {
                        var i = t.Pipeline.getRegisteredFunction(e);
                        if (!i) throw new Error("Cannot load un-registered function: " + e);
                        n.add(i);
                    }),
                    n
                );
            }),
            (t.Pipeline.prototype.add = function () {
                var e = Array.prototype.slice.call(arguments);
                e.forEach(function (e) {
                    (t.Pipeline.warnIfFunctionNotRegistered(e), this._queue.push(e));
                }, this);
            }),
            (t.Pipeline.prototype.after = function (e, n) {
                t.Pipeline.warnIfFunctionNotRegistered(n);
                var i = this._queue.indexOf(e);
                if (-1 === i) throw new Error("Cannot find existingFn");
                this._queue.splice(i + 1, 0, n);
            }),
            (t.Pipeline.prototype.before = function (e, n) {
                t.Pipeline.warnIfFunctionNotRegistered(n);
                var i = this._queue.indexOf(e);
                if (-1 === i) throw new Error("Cannot find existingFn");
                this._queue.splice(i, 0, n);
            }),
            (t.Pipeline.prototype.remove = function (e) {
                var t = this._queue.indexOf(e);
                -1 !== t && this._queue.splice(t, 1);
            }),
            (t.Pipeline.prototype.run = function (e) {
                for (var t = [], n = e.length, i = this._queue.length, o = 0; n > o; o++) {
                    for (
                        var r = e[o], s = 0;
                        i > s && ((r = this._queue[s](r, o, e)), void 0 !== r && null !== r);
                        s++
                    );
                    void 0 !== r && null !== r && t.push(r);
                }
                return t;
            }),
            (t.Pipeline.prototype.reset = function () {
                this._queue = [];
            }),
            (t.Pipeline.prototype.get = function () {
                return this._queue;
            }),
            (t.Pipeline.prototype.toJSON = function () {
                return this._queue.map(function (e) {
                    return (t.Pipeline.warnIfFunctionNotRegistered(e), e.label);
                });
            }),
            (t.Index = function () {
                ((this._fields = []),
                    (this._ref = "id"),
                    (this.pipeline = new t.Pipeline()),
                    (this.documentStore = new t.DocumentStore()),
                    (this.index = {}),
                    (this.eventEmitter = new t.EventEmitter()),
                    (this._idfCache = {}),
                    this.on(
                        "add",
                        "remove",
                        "update",
                        function () {
                            this._idfCache = {};
                        }.bind(this)
                    ));
            }),
            (t.Index.prototype.on = function () {
                var e = Array.prototype.slice.call(arguments);
                return this.eventEmitter.addListener.apply(this.eventEmitter, e);
            }),
            (t.Index.prototype.off = function (e, t) {
                return this.eventEmitter.removeListener(e, t);
            }),
            (t.Index.load = function (e) {
                e.version !== t.version &&
                    t.utils.warn("version mismatch: current " + t.version + " importing " + e.version);
                var n = new this();
                ((n._fields = e.fields),
                    (n._ref = e.ref),
                    (n.documentStore = t.DocumentStore.load(e.documentStore)),
                    (n.pipeline = t.Pipeline.load(e.pipeline)),
                    (n.index = {}));
                for (var i in e.index) n.index[i] = t.InvertedIndex.load(e.index[i]);
                return n;
            }),
            (t.Index.prototype.addField = function (e) {
                return (this._fields.push(e), (this.index[e] = new t.InvertedIndex()), this);
            }),
            (t.Index.prototype.setRef = function (e) {
                return ((this._ref = e), this);
            }),
            (t.Index.prototype.saveDocument = function (e) {
                return ((this.documentStore = new t.DocumentStore(e)), this);
            }),
            (t.Index.prototype.addDoc = function (e, n) {
                if (e) {
                    var n = void 0 === n ? !0 : n,
                        i = e[this._ref];
                    (this.documentStore.addDoc(i, e),
                        this._fields.forEach(function (n) {
                            var o = this.pipeline.run(t.tokenizer(e[n]));
                            this.documentStore.addFieldLength(i, n, o.length);
                            var r = {};
                            o.forEach(function (e) {
                                e in r ? (r[e] += 1) : (r[e] = 1);
                            }, this);
                            for (var s in r) {
                                var u = r[s];
                                ((u = Math.sqrt(u)), this.index[n].addToken(s, { ref: i, tf: u }));
                            }
                        }, this),
                        n && this.eventEmitter.emit("add", e, this));
                }
            }),
            (t.Index.prototype.removeDocByRef = function (e) {
                if (e && this.documentStore.isDocStored() !== !1 && this.documentStore.hasDoc(e)) {
                    var t = this.documentStore.getDoc(e);
                    this.removeDoc(t, !1);
                }
            }),
            (t.Index.prototype.removeDoc = function (e, n) {
                if (e) {
                    var n = void 0 === n ? !0 : n,
                        i = e[this._ref];
                    this.documentStore.hasDoc(i) &&
                        (this.documentStore.removeDoc(i),
                        this._fields.forEach(function (n) {
                            var o = this.pipeline.run(t.tokenizer(e[n]));
                            o.forEach(function (e) {
                                this.index[n].removeToken(e, i);
                            }, this);
                        }, this),
                        n && this.eventEmitter.emit("remove", e, this));
                }
            }),
            (t.Index.prototype.updateDoc = function (e, t) {
                var t = void 0 === t ? !0 : t;
                (this.removeDocByRef(e[this._ref], !1),
                    this.addDoc(e, !1),
                    t && this.eventEmitter.emit("update", e, this));
            }),
            (t.Index.prototype.idf = function (e, t) {
                var n = "@" + t + "/" + e;
                if (Object.prototype.hasOwnProperty.call(this._idfCache, n)) return this._idfCache[n];
                var i = this.index[t].getDocFreq(e),
                    o = 1 + Math.log(this.documentStore.length / (i + 1));
                return ((this._idfCache[n] = o), o);
            }),
            (t.Index.prototype.getFields = function () {
                return this._fields.slice();
            }),
            (t.Index.prototype.search = function (e, n) {
                if (!e) return [];
                e = "string" == typeof e ? { any: e } : JSON.parse(JSON.stringify(e));
                var i = null;
                null != n && (i = JSON.stringify(n));
                for (
                    var o = new t.Configuration(i, this.getFields()).get(), r = {}, s = Object.keys(e), u = 0;
                    u < s.length;
                    u++
                ) {
                    var a = s[u];
                    r[a] = this.pipeline.run(t.tokenizer(e[a]));
                }
                var l = {};
                for (var c in o) {
                    var d = r[c] || r.any;
                    if (d) {
                        var f = this.fieldSearch(d, c, o),
                            h = o[c].boost;
                        for (var p in f) f[p] = f[p] * h;
                        for (var p in f) p in l ? (l[p] += f[p]) : (l[p] = f[p]);
                    }
                }
                var v,
                    g = [];
                for (var p in l)
                    ((v = { ref: p, score: l[p] }),
                        this.documentStore.hasDoc(p) && (v.doc = this.documentStore.getDoc(p)),
                        g.push(v));
                return (
                    g.sort(function (e, t) {
                        return t.score - e.score;
                    }),
                    g
                );
            }),
            (t.Index.prototype.fieldSearch = function (e, t, n) {
                var i = n[t].bool,
                    o = n[t].expand,
                    r = n[t].boost,
                    s = null,
                    u = {};
                return 0 !== r
                    ? (e.forEach(function (e) {
                          var n = [e];
                          1 == o && (n = this.index[t].expandToken(e));
                          var r = {};
                          (n.forEach(function (n) {
                              var o = this.index[t].getDocs(n),
                                  a = this.idf(n, t);
                              if (s && "AND" == i) {
                                  var l = {};
                                  for (var c in s) c in o && (l[c] = o[c]);
                                  o = l;
                              }
                              n == e && this.fieldSearchStats(u, n, o);
                              for (var c in o) {
                                  var d = this.index[t].getTermFrequency(n, c),
                                      f = this.documentStore.getFieldLength(c, t),
                                      h = 1;
                                  0 != f && (h = 1 / Math.sqrt(f));
                                  var p = 1;
                                  n != e && (p = 0.15 * (1 - (n.length - e.length) / n.length));
                                  var v = d * a * h * p;
                                  c in r ? (r[c] += v) : (r[c] = v);
                              }
                          }, this),
                              (s = this.mergeScores(s, r, i)));
                      }, this),
                      (s = this.coordNorm(s, u, e.length)))
                    : void 0;
            }),
            (t.Index.prototype.mergeScores = function (e, t, n) {
                if (!e) return t;
                if ("AND" == n) {
                    var i = {};
                    for (var o in t) o in e && (i[o] = e[o] + t[o]);
                    return i;
                }
                for (var o in t) o in e ? (e[o] += t[o]) : (e[o] = t[o]);
                return e;
            }),
            (t.Index.prototype.fieldSearchStats = function (e, t, n) {
                for (var i in n) i in e ? e[i].push(t) : (e[i] = [t]);
            }),
            (t.Index.prototype.coordNorm = function (e, t, n) {
                for (var i in e)
                    if (i in t) {
                        var o = t[i].length;
                        e[i] = (e[i] * o) / n;
                    }
                return e;
            }),
            (t.Index.prototype.toJSON = function () {
                var e = {};
                return (
                    this._fields.forEach(function (t) {
                        e[t] = this.index[t].toJSON();
                    }, this),
                    {
                        version: t.version,
                        fields: this._fields,
                        ref: this._ref,
                        documentStore: this.documentStore.toJSON(),
                        index: e,
                        pipeline: this.pipeline.toJSON(),
                    }
                );
            }),
            (t.Index.prototype.use = function (e) {
                var t = Array.prototype.slice.call(arguments, 1);
                (t.unshift(this), e.apply(this, t));
            }),
            (t.DocumentStore = function (e) {
                ((this._save = null === e || void 0 === e ? !0 : e),
                    (this.docs = {}),
                    (this.docInfo = {}),
                    (this.length = 0));
            }),
            (t.DocumentStore.load = function (e) {
                var t = new this();
                return ((t.length = e.length), (t.docs = e.docs), (t.docInfo = e.docInfo), (t._save = e.save), t);
            }),
            (t.DocumentStore.prototype.isDocStored = function () {
                return this._save;
            }),
            (t.DocumentStore.prototype.addDoc = function (t, n) {
                (this.hasDoc(t) || this.length++, (this.docs[t] = this._save === !0 ? e(n) : null));
            }),
            (t.DocumentStore.prototype.getDoc = function (e) {
                return this.hasDoc(e) === !1 ? null : this.docs[e];
            }),
            (t.DocumentStore.prototype.hasDoc = function (e) {
                return e in this.docs;
            }),
            (t.DocumentStore.prototype.removeDoc = function (e) {
                this.hasDoc(e) && (delete this.docs[e], delete this.docInfo[e], this.length--);
            }),
            (t.DocumentStore.prototype.addFieldLength = function (e, t, n) {
                null !== e &&
                    void 0 !== e &&
                    0 != this.hasDoc(e) &&
                    (this.docInfo[e] || (this.docInfo[e] = {}), (this.docInfo[e][t] = n));
            }),
            (t.DocumentStore.prototype.updateFieldLength = function (e, t, n) {
                null !== e && void 0 !== e && 0 != this.hasDoc(e) && this.addFieldLength(e, t, n);
            }),
            (t.DocumentStore.prototype.getFieldLength = function (e, t) {
                return null === e || void 0 === e ? 0 : e in this.docs && t in this.docInfo[e] ? this.docInfo[e][t] : 0;
            }),
            (t.DocumentStore.prototype.toJSON = function () {
                return { docs: this.docs, docInfo: this.docInfo, length: this.length, save: this._save };
            }),
            (t.stemmer = (function () {
                var e = {
                        ational: "ate",
                        tional: "tion",
                        enci: "ence",
                        anci: "ance",
                        izer: "ize",
                        bli: "ble",
                        alli: "al",
                        entli: "ent",
                        eli: "e",
                        ousli: "ous",
                        ization: "ize",
                        ation: "ate",
                        ator: "ate",
                        alism: "al",
                        iveness: "ive",
                        fulness: "ful",
                        ousness: "ous",
                        aliti: "al",
                        iviti: "ive",
                        biliti: "ble",
                        logi: "log",
                    },
                    t = { icate: "ic", ative: "", alize: "al", iciti: "ic", ical: "ic", ful: "", ness: "" },
                    n = "[^aeiou]",
                    i = "[aeiouy]",
                    o = n + "[^aeiouy]*",
                    r = i + "[aeiou]*",
                    s = "^(" + o + ")?" + r + o,
                    u = "^(" + o + ")?" + r + o + "(" + r + ")?$",
                    a = "^(" + o + ")?" + r + o + r + o,
                    l = "^(" + o + ")?" + i,
                    c = new RegExp(s),
                    d = new RegExp(a),
                    f = new RegExp(u),
                    h = new RegExp(l),
                    p = /^(.+?)(ss|i)es$/,
                    v = /^(.+?)([^s])s$/,
                    g = /^(.+?)eed$/,
                    m = /^(.+?)(ed|ing)$/,
                    y = /.$/,
                    S = /(at|bl|iz)$/,
                    x = new RegExp("([^aeiouylsz])\\1$"),
                    w = new RegExp("^" + o + i + "[^aeiouwxy]$"),
                    I = /^(.+?[^aeiou])y$/,
                    b =
                        /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/,
                    E = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/,
                    D = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/,
                    F = /^(.+?)(s|t)(ion)$/,
                    _ = /^(.+?)e$/,
                    P = /ll$/,
                    k = new RegExp("^" + o + i + "[^aeiouwxy]$"),
                    z = function (n) {
                        var i, o, r, s, u, a, l;
                        if (n.length < 3) return n;
                        if (
                            ((r = n.substr(0, 1)),
                            "y" == r && (n = r.toUpperCase() + n.substr(1)),
                            (s = p),
                            (u = v),
                            s.test(n) ? (n = n.replace(s, "$1$2")) : u.test(n) && (n = n.replace(u, "$1$2")),
                            (s = g),
                            (u = m),
                            s.test(n))
                        ) {
                            var z = s.exec(n);
                            ((s = c), s.test(z[1]) && ((s = y), (n = n.replace(s, ""))));
                        } else if (u.test(n)) {
                            var z = u.exec(n);
                            ((i = z[1]),
                                (u = h),
                                u.test(i) &&
                                    ((n = i),
                                    (u = S),
                                    (a = x),
                                    (l = w),
                                    u.test(n)
                                        ? (n += "e")
                                        : a.test(n)
                                          ? ((s = y), (n = n.replace(s, "")))
                                          : l.test(n) && (n += "e")));
                        }
                        if (((s = I), s.test(n))) {
                            var z = s.exec(n);
                            ((i = z[1]), (n = i + "i"));
                        }
                        if (((s = b), s.test(n))) {
                            var z = s.exec(n);
                            ((i = z[1]), (o = z[2]), (s = c), s.test(i) && (n = i + e[o]));
                        }
                        if (((s = E), s.test(n))) {
                            var z = s.exec(n);
                            ((i = z[1]), (o = z[2]), (s = c), s.test(i) && (n = i + t[o]));
                        }
                        if (((s = D), (u = F), s.test(n))) {
                            var z = s.exec(n);
                            ((i = z[1]), (s = d), s.test(i) && (n = i));
                        } else if (u.test(n)) {
                            var z = u.exec(n);
                            ((i = z[1] + z[2]), (u = d), u.test(i) && (n = i));
                        }
                        if (((s = _), s.test(n))) {
                            var z = s.exec(n);
                            ((i = z[1]),
                                (s = d),
                                (u = f),
                                (a = k),
                                (s.test(i) || (u.test(i) && !a.test(i))) && (n = i));
                        }
                        return (
                            (s = P),
                            (u = d),
                            s.test(n) && u.test(n) && ((s = y), (n = n.replace(s, ""))),
                            "y" == r && (n = r.toLowerCase() + n.substr(1)),
                            n
                        );
                    };
                return z;
            })()),
            t.Pipeline.registerFunction(t.stemmer, "stemmer"),
            (t.stopWordFilter = function (e) {
                return e && t.stopWordFilter.stopWords[e] !== !0 ? e : void 0;
            }),
            (t.clearStopWords = function () {
                t.stopWordFilter.stopWords = {};
            }),
            (t.addStopWords = function (e) {
                null != e &&
                    Array.isArray(e) !== !1 &&
                    e.forEach(function (e) {
                        t.stopWordFilter.stopWords[e] = !0;
                    }, this);
            }),
            (t.resetStopWords = function () {
                t.stopWordFilter.stopWords = t.defaultStopWords;
            }),
            (t.defaultStopWords = {
                "": !0,
                a: !0,
                able: !0,
                about: !0,
                across: !0,
                after: !0,
                all: !0,
                almost: !0,
                also: !0,
                am: !0,
                among: !0,
                an: !0,
                and: !0,
                any: !0,
                are: !0,
                as: !0,
                at: !0,
                be: !0,
                because: !0,
                been: !0,
                but: !0,
                by: !0,
                can: !0,
                cannot: !0,
                could: !0,
                dear: !0,
                did: !0,
                do: !0,
                does: !0,
                either: !0,
                else: !0,
                ever: !0,
                every: !0,
                for: !0,
                from: !0,
                get: !0,
                got: !0,
                had: !0,
                has: !0,
                have: !0,
                he: !0,
                her: !0,
                hers: !0,
                him: !0,
                his: !0,
                how: !0,
                however: !0,
                i: !0,
                if: !0,
                in: !0,
                into: !0,
                is: !0,
                it: !0,
                its: !0,
                just: !0,
                least: !0,
                let: !0,
                like: !0,
                likely: !0,
                may: !0,
                me: !0,
                might: !0,
                most: !0,
                must: !0,
                my: !0,
                neither: !0,
                no: !0,
                nor: !0,
                not: !0,
                of: !0,
                off: !0,
                often: !0,
                on: !0,
                only: !0,
                or: !0,
                other: !0,
                our: !0,
                own: !0,
                rather: !0,
                said: !0,
                say: !0,
                says: !0,
                she: !0,
                should: !0,
                since: !0,
                so: !0,
                some: !0,
                than: !0,
                that: !0,
                the: !0,
                their: !0,
                them: !0,
                then: !0,
                there: !0,
                these: !0,
                they: !0,
                this: !0,
                tis: !0,
                to: !0,
                too: !0,
                twas: !0,
                us: !0,
                wants: !0,
                was: !0,
                we: !0,
                were: !0,
                what: !0,
                when: !0,
                where: !0,
                which: !0,
                while: !0,
                who: !0,
                whom: !0,
                why: !0,
                will: !0,
                with: !0,
                would: !0,
                yet: !0,
                you: !0,
                your: !0,
            }),
            (t.stopWordFilter.stopWords = t.defaultStopWords),
            t.Pipeline.registerFunction(t.stopWordFilter, "stopWordFilter"),
            (t.trimmer = function (e) {
                if (null === e || void 0 === e) throw new Error("token should not be undefined");
                return e.replace(/^\W+/, "").replace(/\W+$/, "");
            }),
            t.Pipeline.registerFunction(t.trimmer, "trimmer"),
            (t.InvertedIndex = function () {
                this.root = { docs: {}, df: 0 };
            }),
            (t.InvertedIndex.load = function (e) {
                var t = new this();
                return ((t.root = e.root), t);
            }),
            (t.InvertedIndex.prototype.addToken = function (e, t, n) {
                for (var n = n || this.root, i = 0; i <= e.length - 1; ) {
                    var o = e[i];
                    (o in n || (n[o] = { docs: {}, df: 0 }), (i += 1), (n = n[o]));
                }
                var r = t.ref;
                n.docs[r] ? (n.docs[r] = { tf: t.tf }) : ((n.docs[r] = { tf: t.tf }), (n.df += 1));
            }),
            (t.InvertedIndex.prototype.hasToken = function (e) {
                if (!e) return !1;
                for (var t = this.root, n = 0; n < e.length; n++) {
                    if (!t[e[n]]) return !1;
                    t = t[e[n]];
                }
                return !0;
            }),
            (t.InvertedIndex.prototype.getNode = function (e) {
                if (!e) return null;
                for (var t = this.root, n = 0; n < e.length; n++) {
                    if (!t[e[n]]) return null;
                    t = t[e[n]];
                }
                return t;
            }),
            (t.InvertedIndex.prototype.getDocs = function (e) {
                var t = this.getNode(e);
                return null == t ? {} : t.docs;
            }),
            (t.InvertedIndex.prototype.getTermFrequency = function (e, t) {
                var n = this.getNode(e);
                return null == n ? 0 : t in n.docs ? n.docs[t].tf : 0;
            }),
            (t.InvertedIndex.prototype.getDocFreq = function (e) {
                var t = this.getNode(e);
                return null == t ? 0 : t.df;
            }),
            (t.InvertedIndex.prototype.removeToken = function (e, t) {
                if (e) {
                    var n = this.getNode(e);
                    null != n && t in n.docs && (delete n.docs[t], (n.df -= 1));
                }
            }),
            (t.InvertedIndex.prototype.expandToken = function (e, t, n) {
                if (null == e || "" == e) return [];
                var t = t || [];
                if (void 0 == n && ((n = this.getNode(e)), null == n)) return t;
                n.df > 0 && t.push(e);
                for (var i in n) "docs" !== i && "df" !== i && this.expandToken(e + i, t, n[i]);
                return t;
            }),
            (t.InvertedIndex.prototype.toJSON = function () {
                return { root: this.root };
            }),
            (t.Configuration = function (e, n) {
                var e = e || "";
                if (void 0 == n || null == n) throw new Error("fields should not be null");
                this.config = {};
                var i;
                try {
                    ((i = JSON.parse(e)), this.buildUserConfig(i, n));
                } catch (o) {
                    (t.utils.warn("user configuration parse failed, will use default configuration"),
                        this.buildDefaultConfig(n));
                }
            }),
            (t.Configuration.prototype.buildDefaultConfig = function (e) {
                (this.reset(),
                    e.forEach(function (e) {
                        this.config[e] = { boost: 1, bool: "OR", expand: !1 };
                    }, this));
            }),
            (t.Configuration.prototype.buildUserConfig = function (e, n) {
                var i = "OR",
                    o = !1;
                if (
                    (this.reset(),
                    "bool" in e && (i = e.bool || i),
                    "expand" in e && (o = e.expand || o),
                    "fields" in e)
                )
                    for (var r in e.fields)
                        if (n.indexOf(r) > -1) {
                            var s = e.fields[r],
                                u = o;
                            (void 0 != s.expand && (u = s.expand),
                                (this.config[r] = {
                                    boost: s.boost || 0 === s.boost ? s.boost : 1,
                                    bool: s.bool || i,
                                    expand: u,
                                }));
                        } else t.utils.warn("field name in user configuration not found in index instance fields");
                else this.addAllFields2UserConfig(i, o, n);
            }),
            (t.Configuration.prototype.addAllFields2UserConfig = function (e, t, n) {
                n.forEach(function (n) {
                    this.config[n] = { boost: 1, bool: e, expand: t };
                }, this);
            }),
            (t.Configuration.prototype.get = function () {
                return this.config;
            }),
            (t.Configuration.prototype.reset = function () {
                this.config = {};
            }),
            (lunr.SortedSet = function () {
                ((this.length = 0), (this.elements = []));
            }),
            (lunr.SortedSet.load = function (e) {
                var t = new this();
                return ((t.elements = e), (t.length = e.length), t);
            }),
            (lunr.SortedSet.prototype.add = function () {
                var e, t;
                for (e = 0; e < arguments.length; e++)
                    ((t = arguments[e]), ~this.indexOf(t) || this.elements.splice(this.locationFor(t), 0, t));
                this.length = this.elements.length;
            }),
            (lunr.SortedSet.prototype.toArray = function () {
                return this.elements.slice();
            }),
            (lunr.SortedSet.prototype.map = function (e, t) {
                return this.elements.map(e, t);
            }),
            (lunr.SortedSet.prototype.forEach = function (e, t) {
                return this.elements.forEach(e, t);
            }),
            (lunr.SortedSet.prototype.indexOf = function (e) {
                for (
                    var t = 0, n = this.elements.length, i = n - t, o = t + Math.floor(i / 2), r = this.elements[o];
                    i > 1;
                ) {
                    if (r === e) return o;
                    (e > r && (t = o),
                        r > e && (n = o),
                        (i = n - t),
                        (o = t + Math.floor(i / 2)),
                        (r = this.elements[o]));
                }
                return r === e ? o : -1;
            }),
            (lunr.SortedSet.prototype.locationFor = function (e) {
                for (
                    var t = 0, n = this.elements.length, i = n - t, o = t + Math.floor(i / 2), r = this.elements[o];
                    i > 1;
                )
                    (e > r && (t = o),
                        r > e && (n = o),
                        (i = n - t),
                        (o = t + Math.floor(i / 2)),
                        (r = this.elements[o]));
                return r > e ? o : e > r ? o + 1 : void 0;
            }),
            (lunr.SortedSet.prototype.intersect = function (e) {
                for (
                    var t = new lunr.SortedSet(),
                        n = 0,
                        i = 0,
                        o = this.length,
                        r = e.length,
                        s = this.elements,
                        u = e.elements;
                    ;
                ) {
                    if (n > o - 1 || i > r - 1) break;
                    s[n] !== u[i] ? (s[n] < u[i] ? n++ : s[n] > u[i] && i++) : (t.add(s[n]), n++, i++);
                }
                return t;
            }),
            (lunr.SortedSet.prototype.clone = function () {
                var e = new lunr.SortedSet();
                return ((e.elements = this.toArray()), (e.length = e.elements.length), e);
            }),
            (lunr.SortedSet.prototype.union = function (e) {
                var t, n, i;
                (this.length >= e.length ? ((t = this), (n = e)) : ((t = e), (n = this)), (i = t.clone()));
                for (var o = 0, r = n.toArray(); o < r.length; o++) i.add(r[o]);
                return i;
            }),
            (lunr.SortedSet.prototype.toJSON = function () {
                return this.toArray();
            }),
            (function (e, t) {
                "function" == typeof define && define.amd
                    ? define(t)
                    : "object" == typeof exports
                      ? (module.exports = t())
                      : (e.elasticlunr = t());
            })(this, function () {
                return t;
            }));
    })();
    /** pdoc search index */ const docs = {
        version: "0.9.5",
        fields: ["qualname", "fullname", "annotation", "default_value", "signature", "bases", "doc"],
        ref: "fullname",
        documentStore: {
            docs: {
                run: { fullname: "run", modulename: "run", kind: "module", doc: "<p></p>\n" },
                "run.BASE_DIR": {
                    fullname: "run.BASE_DIR",
                    modulename: "run",
                    qualname: "BASE_DIR",
                    kind: "variable",
                    doc: "<p></p>\n",
                    default_value: "WindowsPath(&#x27;C:/GITHUB/gemini-memory-script&#x27;)",
                },
                "run.DATABASE_DIR": {
                    fullname: "run.DATABASE_DIR",
                    modulename: "run",
                    qualname: "DATABASE_DIR",
                    kind: "variable",
                    doc: "<p></p>\n",
                    default_value: "WindowsPath(&#x27;C:/GITHUB/gemini-memory-script/database&#x27;)",
                },
                "run.DATABASE_PATH": {
                    fullname: "run.DATABASE_PATH",
                    modulename: "run",
                    qualname: "DATABASE_PATH",
                    kind: "variable",
                    doc: "<p></p>\n",
                    default_value: "WindowsPath(&#x27;C:/GITHUB/gemini-memory-script/database/chat_history.db&#x27;)",
                },
                "run.EXPORTS_DIR": {
                    fullname: "run.EXPORTS_DIR",
                    modulename: "run",
                    qualname: "EXPORTS_DIR",
                    kind: "variable",
                    doc: "<p></p>\n",
                    default_value: "WindowsPath(&#x27;C:/GITHUB/gemini-memory-script/exports&#x27;)",
                },
                "run.ENV_PATH": {
                    fullname: "run.ENV_PATH",
                    modulename: "run",
                    qualname: "ENV_PATH",
                    kind: "variable",
                    doc: "<p></p>\n",
                    default_value: "WindowsPath(&#x27;C:/GITHUB/gemini-memory-script/.env&#x27;)",
                },
                "run.load_api_key": {
                    fullname: "run.load_api_key",
                    modulename: "run",
                    qualname: "load_api_key",
                    kind: "function",
                    doc: "<p>Load the Gemini API key from the environment.</p>\n\n<p>Reads the .env file located at the project root using python-dotenv,\nthen retrieves the value of the GEMINI_API_KEY environment variable.</p>\n\n<p>Returns:\n    The API key string read from the environment.</p>\n\n<p>Raises:\n    EnvironmentError: If GEMINI_API_KEY is not set or is empty.</p>\n",
                    signature:
                        '<span class="signature pdoc-code condensed">(<span class="return-annotation">) -> <span class="nb">str</span>:</span></span>',
                    funcdef: "def",
                },
                "run.ensure_database_directory": {
                    fullname: "run.ensure_database_directory",
                    modulename: "run",
                    qualname: "ensure_database_directory",
                    kind: "function",
                    doc: "<p>Create the database directory if it does not already exist.</p>\n\n<p>Uses pathlib.Path.mkdir with parents=True and exist_ok=True so the call\nis safe to make multiple times and works even when intermediate parent\ndirectories are missing.</p>\n",
                    signature:
                        '<span class="signature pdoc-code condensed">(<span class="return-annotation">) -> <span class="kc">None</span>:</span></span>',
                    funcdef: "def",
                },
                "run.get_connection": {
                    fullname: "run.get_connection",
                    modulename: "run",
                    qualname: "get_connection",
                    kind: "function",
                    doc: "<p>Open and return a connection to the SQLite database.</p>\n\n<p>The connection uses sqlite3.Row as the row factory so that query results\ncan be accessed both by column index and by column name.</p>\n\n<p>Returns:\n    An open sqlite3.Connection pointed at DATABASE_PATH.</p>\n",
                    signature:
                        '<span class="signature pdoc-code condensed">(<span class="return-annotation">) -> <span class="n">sqlite3</span><span class="o">.</span><span class="n">Connection</span>:</span></span>',
                    funcdef: "def",
                },
                "run.initialize_database": {
                    fullname: "run.initialize_database",
                    modulename: "run",
                    qualname: "initialize_database",
                    kind: "function",
                    doc: "<p>Ensure the database schema exists, creating tables when necessary.</p>\n\n<p>Calls ensure_database_directory() before attempting to open the database\nso the parent directory is always present.  Both CREATE TABLE statements\nuse IF NOT EXISTS, making this function idempotent \u2014 safe to call on\nevery application startup without data loss.</p>\n\n<p>Tables created:\n    sessions: One row per chat session, identified by a UUID primary key.\n    messages: One row per user or model message, linked to a session via\n        a foreign key on session_id.</p>\n",
                    signature:
                        '<span class="signature pdoc-code condensed">(<span class="return-annotation">) -> <span class="kc">None</span>:</span></span>',
                    funcdef: "def",
                },
                "run.create_session": {
                    fullname: "run.create_session",
                    modulename: "run",
                    qualname: "create_session",
                    kind: "function",
                    doc: "<p>Create a new chat session record in the database.</p>\n\n<p>Generates a UUID v4 to uniquely identify the session and records the\ncreation time as a UTC ISO 8601 timestamp.</p>\n\n<p>Returns:\n    The UUID string of the newly created session.</p>\n",
                    signature:
                        '<span class="signature pdoc-code condensed">(<span class="return-annotation">) -> <span class="nb">str</span>:</span></span>',
                    funcdef: "def",
                },
                "run.save_message": {
                    fullname: "run.save_message",
                    modulename: "run",
                    qualname: "save_message",
                    kind: "function",
                    doc: '<p>Persist a single chat message to the database.</p>\n\n<p>Inserts a new row into the messages table with the current UTC time as\nthe creation timestamp.  This function is called twice per exchange: once\nbefore sending the user input to the API, and once after receiving the\nmodel response.</p>\n\n<p>Args:\n    session_id: The UUID of the session this message belongs to.\n    role: The author of the message. Must be either <code>"user"</code> or\n        <code>"model"</code> to match the values expected by the Gemini SDK.\n    content: The full text content of the message.</p>\n',
                    signature:
                        '<span class="signature pdoc-code condensed">(<span class="param"><span class="n">session_id</span><span class="p">:</span> <span class="nb">str</span>, </span><span class="param"><span class="n">role</span><span class="p">:</span> <span class="nb">str</span>, </span><span class="param"><span class="n">content</span><span class="p">:</span> <span class="nb">str</span></span><span class="return-annotation">) -> <span class="kc">None</span>:</span></span>',
                    funcdef: "def",
                },
                "run.get_session_history": {
                    fullname: "run.get_session_history",
                    modulename: "run",
                    qualname: "get_session_history",
                    kind: "function",
                    doc: "<p>Retrieve all messages for a given session ordered by insertion time.</p>\n\n<p>Queries the messages table for every row whose session_id matches the\nsupplied argument, returning results in ascending order of the auto-\nincremented primary key so the conversation sequence is preserved.</p>\n\n<p>Args:\n    session_id: The UUID of the session whose history is requested.</p>\n\n<p>Returns:\n    A list of dictionaries, each containing the keys <code>role</code>,\n    <code>content</code>, and <code>created_at</code> for one message.</p>\n",
                    signature:
                        '<span class="signature pdoc-code condensed">(<span class="param"><span class="n">session_id</span><span class="p">:</span> <span class="nb">str</span></span><span class="return-annotation">) -> <span class="nb">list</span><span class="p">[</span><span class="nb">dict</span><span class="p">]</span>:</span></span>',
                    funcdef: "def",
                },
                "run.get_all_sessions": {
                    fullname: "run.get_all_sessions",
                    modulename: "run",
                    qualname: "get_all_sessions",
                    kind: "function",
                    doc: "<p>Retrieve all sessions stored in the database ordered by creation time.</p>\n\n<p>Returns:\n    A list of dictionaries, each containing the keys <code>id</code> and\n    <code>created_at</code> for one session, ordered oldest-first.</p>\n",
                    signature:
                        '<span class="signature pdoc-code condensed">(<span class="return-annotation">) -> <span class="nb">list</span><span class="p">[</span><span class="nb">dict</span><span class="p">]</span>:</span></span>',
                    funcdef: "def",
                },
                "run.export_database_to_markdown": {
                    fullname: "run.export_database_to_markdown",
                    modulename: "run",
                    qualname: "export_database_to_markdown",
                    kind: "function",
                    doc: "<p>Export the entire chat database to a Markdown file.</p>\n\n<p>Iterates over every session and its messages, formats them as a readable\nMarkdown document, and writes the result to a timestamped file inside the\n<code>exports/</code> directory at the project root.  The directory is created\nautomatically if it does not exist.</p>\n\n<p>The output file is named <code>export_&lt;UTC-timestamp&gt;.md</code> where the timestamp\nuses the format <code>YYYYMMDD_HHMMSS</code> so files sort chronologically by name.</p>\n\n<p>Returns:\n    The <code>pathlib.Path</code> of the generated Markdown file.</p>\n",
                    signature:
                        '<span class="signature pdoc-code condensed">(<span class="return-annotation">) -> <span class="n">pathlib</span><span class="o">.</span><span class="n">Path</span>:</span></span>',
                    funcdef: "def",
                },
                "run.build_gemini_history": {
                    fullname: "run.build_gemini_history",
                    modulename: "run",
                    qualname: "build_gemini_history",
                    kind: "function",
                    doc: "<p>Convert stored messages into the history format required by the Gemini SDK.</p>\n\n<p>The Gemini SDK expects history as a list of content objects where each\nobject has a <code>role</code> key and a <code>parts</code> list whose elements are\ndictionaries with a <code>text</code> key.  This function translates the flat\ndatabase records into that nested structure.</p>\n\n<p>Args:\n    session_id: The UUID of the session whose history should be converted.</p>\n\n<p>Returns:\n    A list of dicts formatted as Gemini SDK content objects, ready to be\n    passed to <code>client.chats.create(history=...)</code>.</p>\n",
                    signature:
                        '<span class="signature pdoc-code condensed">(<span class="param"><span class="n">session_id</span><span class="p">:</span> <span class="nb">str</span></span><span class="return-annotation">) -> <span class="nb">list</span><span class="p">[</span><span class="nb">dict</span><span class="p">]</span>:</span></span>',
                    funcdef: "def",
                },
                "run.start_chat_session": {
                    fullname: "run.start_chat_session",
                    modulename: "run",
                    qualname: "start_chat_session",
                    kind: "function",
                    doc: "<p>Create a Gemini chat session pre-loaded with the stored conversation history.</p>\n\n<p>Fetches the persisted history from the database, converts it to the SDK\nformat, and passes it to the Gemini client so the model has full context\nof prior exchanges when generating new responses.</p>\n\n<p>Args:\n    client: An authenticated <code>genai.Client</code> instance.\n    session_id: The UUID of the session whose history should be injected\n        into the new chat.</p>\n\n<p>Returns:\n    A <code>genai.chats.Chat</code> object ready to send and receive messages.</p>\n",
                    signature:
                        '<span class="signature pdoc-code multiline">(<span class="param">\t<span class="n">client</span><span class="p">:</span> <span class="n">google</span><span class="o">.</span><span class="n">genai</span><span class="o">.</span><span class="n">client</span><span class="o">.</span><span class="n">Client</span>,</span><span class="param">\t<span class="n">session_id</span><span class="p">:</span> <span class="nb">str</span></span><span class="return-annotation">) -> <span class="n">google</span><span class="o">.</span><span class="n">genai</span><span class="o">.</span><span class="n">chats</span><span class="o">.</span><span class="n">Chat</span>:</span></span>',
                    funcdef: "def",
                },
                "run.print_banner": {
                    fullname: "run.print_banner",
                    modulename: "run",
                    qualname: "print_banner",
                    kind: "function",
                    doc: "<p>Print the application welcome banner and list of available commands.</p>\n",
                    signature:
                        '<span class="signature pdoc-code condensed">(<span class="return-annotation">) -> <span class="kc">None</span>:</span></span>',
                    funcdef: "def",
                },
                "run.print_history": {
                    fullname: "run.print_history",
                    modulename: "run",
                    qualname: "print_history",
                    kind: "function",
                    doc: "<p>Print the full message history of the current session to stdout.</p>\n\n<p>Retrieves all stored messages for the given session and prints each one\nwith its UTC timestamp and a human-readable author label (<code>You</code> for\nuser messages, <code>Gemini</code> for model responses).  If no messages exist\nyet a short notice is printed instead.</p>\n\n<p>Args:\n    session_id: The UUID of the session whose history should be displayed.</p>\n",
                    signature:
                        '<span class="signature pdoc-code condensed">(<span class="param"><span class="n">session_id</span><span class="p">:</span> <span class="nb">str</span></span><span class="return-annotation">) -> <span class="kc">None</span>:</span></span>',
                    funcdef: "def",
                },
                "run.run_chat": {
                    fullname: "run.run_chat",
                    modulename: "run",
                    qualname: "run_chat",
                    kind: "function",
                    doc: "<p>Run the interactive chat loop until the user exits.</p>\n\n<p>Reads user input from stdin in a continuous loop, handles built-in\ncommands (<code>exit</code>, <code>quit</code>, <code>history</code>), persists every user message\nbefore sending it to the Gemini API, persists every model reply after\nreceiving it, and prints the reply to stdout.</p>\n\n<p>Error handling per message:\n    - HTTP 429 (ResourceExhausted / quota exceeded): prints a friendly\n      rate-limit message and allows the user to retry.\n    - Other <code>ClientError</code> subclasses: prints the raw error and continues.\n    - Any unexpected exception: prints the error and continues so a single\n      failure does not terminate the entire session.</p>\n\n<p>The loop terminates when the user types <code>exit</code> or <code>quit</code>, or when a\n<code>KeyboardInterrupt</code> / <code>EOFError</code> is raised (e.g. Ctrl+C or Ctrl+D).</p>\n\n<p>Built-in commands:\n    - <code>exit</code> / <code>quit</code>: end the session gracefully.\n    - <code>history</code>: print all messages in the current session.\n    - <code>/export</code>: export the full database to a Markdown file in\n      the <code>exports/</code> directory.</p>\n\n<p>Args:\n    chat: An active <code>genai.chats.Chat</code> session.\n    session_id: The UUID of the current session, used to persist messages.</p>\n",
                    signature:
                        '<span class="signature pdoc-code condensed">(<span class="param"><span class="n">chat</span><span class="p">:</span> <span class="n">google</span><span class="o">.</span><span class="n">genai</span><span class="o">.</span><span class="n">chats</span><span class="o">.</span><span class="n">Chat</span>, </span><span class="param"><span class="n">session_id</span><span class="p">:</span> <span class="nb">str</span></span><span class="return-annotation">) -> <span class="kc">None</span>:</span></span>',
                    funcdef: "def",
                },
                "run.main": {
                    fullname: "run.main",
                    modulename: "run",
                    qualname: "main",
                    kind: "function",
                    doc: "<p>Application entry point.</p>\n\n<p>Orchestrates the full startup sequence:</p>\n\n<ol>\n<li>Load the Gemini API key from the .env file.</li>\n<li>Initialise the SQLite database and ensure the schema exists.</li>\n<li>Configure and instantiate the Gemini client.</li>\n<li>Create a new session record in the database.</li>\n<li>Print the welcome banner.</li>\n<li>Start a Gemini chat session pre-loaded with any existing history.</li>\n<li>Enter the interactive chat loop.</li>\n</ol>\n",
                    signature:
                        '<span class="signature pdoc-code condensed">(<span class="return-annotation">) -> <span class="kc">None</span>:</span></span>',
                    funcdef: "def",
                },
            },
            docInfo: {
                run: { qualname: 0, fullname: 1, annotation: 0, default_value: 0, signature: 0, bases: 0, doc: 3 },
                "run.BASE_DIR": {
                    qualname: 2,
                    fullname: 3,
                    annotation: 0,
                    default_value: 7,
                    signature: 0,
                    bases: 0,
                    doc: 3,
                },
                "run.DATABASE_DIR": {
                    qualname: 2,
                    fullname: 3,
                    annotation: 0,
                    default_value: 7,
                    signature: 0,
                    bases: 0,
                    doc: 3,
                },
                "run.DATABASE_PATH": {
                    qualname: 2,
                    fullname: 3,
                    annotation: 0,
                    default_value: 9,
                    signature: 0,
                    bases: 0,
                    doc: 3,
                },
                "run.EXPORTS_DIR": {
                    qualname: 2,
                    fullname: 3,
                    annotation: 0,
                    default_value: 7,
                    signature: 0,
                    bases: 0,
                    doc: 3,
                },
                "run.ENV_PATH": {
                    qualname: 2,
                    fullname: 3,
                    annotation: 0,
                    default_value: 8,
                    signature: 0,
                    bases: 0,
                    doc: 3,
                },
                "run.load_api_key": {
                    qualname: 3,
                    fullname: 4,
                    annotation: 0,
                    default_value: 0,
                    signature: 10,
                    bases: 0,
                    doc: 64,
                },
                "run.ensure_database_directory": {
                    qualname: 3,
                    fullname: 4,
                    annotation: 0,
                    default_value: 0,
                    signature: 10,
                    bases: 0,
                    doc: 45,
                },
                "run.get_connection": {
                    qualname: 2,
                    fullname: 3,
                    annotation: 0,
                    default_value: 0,
                    signature: 15,
                    bases: 0,
                    doc: 51,
                },
                "run.initialize_database": {
                    qualname: 2,
                    fullname: 3,
                    annotation: 0,
                    default_value: 0,
                    signature: 10,
                    bases: 0,
                    doc: 91,
                },
                "run.create_session": {
                    qualname: 2,
                    fullname: 3,
                    annotation: 0,
                    default_value: 0,
                    signature: 10,
                    bases: 0,
                    doc: 47,
                },
                "run.save_message": {
                    qualname: 2,
                    fullname: 3,
                    annotation: 0,
                    default_value: 0,
                    signature: 40,
                    bases: 0,
                    doc: 106,
                },
                "run.get_session_history": {
                    qualname: 3,
                    fullname: 4,
                    annotation: 0,
                    default_value: 0,
                    signature: 26,
                    bases: 0,
                    doc: 89,
                },
                "run.get_all_sessions": {
                    qualname: 3,
                    fullname: 4,
                    annotation: 0,
                    default_value: 0,
                    signature: 16,
                    bases: 0,
                    doc: 40,
                },
                "run.export_database_to_markdown": {
                    qualname: 4,
                    fullname: 5,
                    annotation: 0,
                    default_value: 0,
                    signature: 15,
                    bases: 0,
                    doc: 103,
                },
                "run.build_gemini_history": {
                    qualname: 3,
                    fullname: 4,
                    annotation: 0,
                    default_value: 0,
                    signature: 26,
                    bases: 0,
                    doc: 107,
                },
                "run.start_chat_session": {
                    qualname: 3,
                    fullname: 4,
                    annotation: 0,
                    default_value: 0,
                    signature: 62,
                    bases: 0,
                    doc: 96,
                },
                "run.print_banner": {
                    qualname: 2,
                    fullname: 3,
                    annotation: 0,
                    default_value: 0,
                    signature: 10,
                    bases: 0,
                    doc: 13,
                },
                "run.print_history": {
                    qualname: 2,
                    fullname: 3,
                    annotation: 0,
                    default_value: 0,
                    signature: 20,
                    bases: 0,
                    doc: 78,
                },
                "run.run_chat": {
                    qualname: 2,
                    fullname: 3,
                    annotation: 0,
                    default_value: 0,
                    signature: 45,
                    bases: 0,
                    doc: 219,
                },
                "run.main": {
                    qualname: 1,
                    fullname: 2,
                    annotation: 0,
                    default_value: 0,
                    signature: 10,
                    bases: 0,
                    doc: 90,
                },
            },
            length: 21,
            save: true,
        },
        index: {
            qualname: {
                root: {
                    docs: {},
                    df: 0,
                    b: {
                        docs: {},
                        df: 0,
                        a: {
                            docs: {},
                            df: 0,
                            s: { docs: {}, df: 0, e: { docs: { "run.BASE_DIR": { tf: 1 } }, df: 1 } },
                            n: {
                                docs: {},
                                df: 0,
                                n: {
                                    docs: {},
                                    df: 0,
                                    e: { docs: {}, df: 0, r: { docs: { "run.print_banner": { tf: 1 } }, df: 1 } },
                                },
                            },
                        },
                        u: {
                            docs: {},
                            df: 0,
                            i: {
                                docs: {},
                                df: 0,
                                l: { docs: {}, df: 0, d: { docs: { "run.build_gemini_history": { tf: 1 } }, df: 1 } },
                            },
                        },
                    },
                    d: {
                        docs: {},
                        df: 0,
                        i: {
                            docs: {},
                            df: 0,
                            r: {
                                docs: {
                                    "run.BASE_DIR": { tf: 1 },
                                    "run.DATABASE_DIR": { tf: 1 },
                                    "run.EXPORTS_DIR": { tf: 1 },
                                },
                                df: 3,
                                e: {
                                    docs: {},
                                    df: 0,
                                    c: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                            docs: {},
                                            df: 0,
                                            o: {
                                                docs: {},
                                                df: 0,
                                                r: {
                                                    docs: {},
                                                    df: 0,
                                                    y: { docs: { "run.ensure_database_directory": { tf: 1 } }, df: 1 },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        a: {
                            docs: {},
                            df: 0,
                            t: {
                                docs: {},
                                df: 0,
                                a: {
                                    docs: {},
                                    df: 0,
                                    b: {
                                        docs: {},
                                        df: 0,
                                        a: {
                                            docs: {},
                                            df: 0,
                                            s: {
                                                docs: {},
                                                df: 0,
                                                e: {
                                                    docs: {
                                                        "run.DATABASE_DIR": { tf: 1 },
                                                        "run.DATABASE_PATH": { tf: 1 },
                                                        "run.ensure_database_directory": { tf: 1 },
                                                        "run.initialize_database": { tf: 1 },
                                                        "run.export_database_to_markdown": { tf: 1 },
                                                    },
                                                    df: 5,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    p: {
                        docs: {},
                        df: 0,
                        a: {
                            docs: {},
                            df: 0,
                            t: {
                                docs: {},
                                df: 0,
                                h: { docs: { "run.DATABASE_PATH": { tf: 1 }, "run.ENV_PATH": { tf: 1 } }, df: 2 },
                            },
                        },
                        r: {
                            docs: {},
                            df: 0,
                            i: {
                                docs: {},
                                df: 0,
                                n: {
                                    docs: {},
                                    df: 0,
                                    t: {
                                        docs: { "run.print_banner": { tf: 1 }, "run.print_history": { tf: 1 } },
                                        df: 2,
                                    },
                                },
                            },
                        },
                    },
                    e: {
                        docs: {},
                        df: 0,
                        x: {
                            docs: {},
                            df: 0,
                            p: {
                                docs: {},
                                df: 0,
                                o: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                            docs: { "run.export_database_to_markdown": { tf: 1 } },
                                            df: 1,
                                            s: { docs: { "run.EXPORTS_DIR": { tf: 1 } }, df: 1 },
                                        },
                                    },
                                },
                            },
                        },
                        n: {
                            docs: {},
                            df: 0,
                            v: { docs: { "run.ENV_PATH": { tf: 1 } }, df: 1 },
                            s: {
                                docs: {},
                                df: 0,
                                u: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                        docs: {},
                                        df: 0,
                                        e: { docs: { "run.ensure_database_directory": { tf: 1 } }, df: 1 },
                                    },
                                },
                            },
                        },
                    },
                    l: {
                        docs: {},
                        df: 0,
                        o: {
                            docs: {},
                            df: 0,
                            a: { docs: {}, df: 0, d: { docs: { "run.load_api_key": { tf: 1 } }, df: 1 } },
                        },
                    },
                    a: {
                        docs: {},
                        df: 0,
                        p: { docs: {}, df: 0, i: { docs: { "run.load_api_key": { tf: 1 } }, df: 1 } },
                        l: { docs: {}, df: 0, l: { docs: { "run.get_all_sessions": { tf: 1 } }, df: 1 } },
                    },
                    k: {
                        docs: {},
                        df: 0,
                        e: { docs: {}, df: 0, y: { docs: { "run.load_api_key": { tf: 1 } }, df: 1 } },
                    },
                    g: {
                        docs: {},
                        df: 0,
                        e: {
                            docs: {},
                            df: 0,
                            t: {
                                docs: {
                                    "run.get_connection": { tf: 1 },
                                    "run.get_session_history": { tf: 1 },
                                    "run.get_all_sessions": { tf: 1 },
                                },
                                df: 3,
                            },
                            m: {
                                docs: {},
                                df: 0,
                                i: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                        docs: {},
                                        df: 0,
                                        i: { docs: { "run.build_gemini_history": { tf: 1 } }, df: 1 },
                                    },
                                },
                            },
                        },
                    },
                    c: {
                        docs: {},
                        df: 0,
                        o: {
                            docs: {},
                            df: 0,
                            n: {
                                docs: {},
                                df: 0,
                                n: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        c: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                                docs: {},
                                                df: 0,
                                                i: {
                                                    docs: {},
                                                    df: 0,
                                                    o: {
                                                        docs: {},
                                                        df: 0,
                                                        n: { docs: { "run.get_connection": { tf: 1 } }, df: 1 },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        r: {
                            docs: {},
                            df: 0,
                            e: {
                                docs: {},
                                df: 0,
                                a: {
                                    docs: {},
                                    df: 0,
                                    t: { docs: {}, df: 0, e: { docs: { "run.create_session": { tf: 1 } }, df: 1 } },
                                },
                            },
                        },
                        h: {
                            docs: {},
                            df: 0,
                            a: {
                                docs: {},
                                df: 0,
                                t: { docs: { "run.start_chat_session": { tf: 1 }, "run.run_chat": { tf: 1 } }, df: 2 },
                            },
                        },
                    },
                    i: {
                        docs: {},
                        df: 0,
                        n: {
                            docs: {},
                            df: 0,
                            i: {
                                docs: {},
                                df: 0,
                                t: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                        docs: {},
                                        df: 0,
                                        a: {
                                            docs: {},
                                            df: 0,
                                            l: {
                                                docs: {},
                                                df: 0,
                                                i: {
                                                    docs: {},
                                                    df: 0,
                                                    z: {
                                                        docs: {},
                                                        df: 0,
                                                        e: { docs: { "run.initialize_database": { tf: 1 } }, df: 1 },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    s: {
                        docs: {},
                        df: 0,
                        e: {
                            docs: {},
                            df: 0,
                            s: {
                                docs: {},
                                df: 0,
                                s: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                        docs: {},
                                        df: 0,
                                        o: {
                                            docs: {},
                                            df: 0,
                                            n: {
                                                docs: {
                                                    "run.create_session": { tf: 1 },
                                                    "run.get_session_history": { tf: 1 },
                                                    "run.start_chat_session": { tf: 1 },
                                                },
                                                df: 3,
                                                s: { docs: { "run.get_all_sessions": { tf: 1 } }, df: 1 },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        a: {
                            docs: {},
                            df: 0,
                            v: { docs: {}, df: 0, e: { docs: { "run.save_message": { tf: 1 } }, df: 1 } },
                        },
                        t: {
                            docs: {},
                            df: 0,
                            a: {
                                docs: {},
                                df: 0,
                                r: { docs: {}, df: 0, t: { docs: { "run.start_chat_session": { tf: 1 } }, df: 1 } },
                            },
                        },
                    },
                    m: {
                        docs: {},
                        df: 0,
                        e: {
                            docs: {},
                            df: 0,
                            s: {
                                docs: {},
                                df: 0,
                                s: {
                                    docs: {},
                                    df: 0,
                                    a: {
                                        docs: {},
                                        df: 0,
                                        g: { docs: {}, df: 0, e: { docs: { "run.save_message": { tf: 1 } }, df: 1 } },
                                    },
                                },
                            },
                        },
                        a: {
                            docs: {},
                            df: 0,
                            r: {
                                docs: {},
                                df: 0,
                                k: {
                                    docs: {},
                                    df: 0,
                                    d: {
                                        docs: {},
                                        df: 0,
                                        o: {
                                            docs: {},
                                            df: 0,
                                            w: {
                                                docs: {},
                                                df: 0,
                                                n: { docs: { "run.export_database_to_markdown": { tf: 1 } }, df: 1 },
                                            },
                                        },
                                    },
                                },
                            },
                            i: { docs: {}, df: 0, n: { docs: { "run.main": { tf: 1 } }, df: 1 } },
                        },
                    },
                    h: {
                        docs: {},
                        df: 0,
                        i: {
                            docs: {},
                            df: 0,
                            s: {
                                docs: {},
                                df: 0,
                                t: {
                                    docs: {},
                                    df: 0,
                                    o: {
                                        docs: {},
                                        df: 0,
                                        r: {
                                            docs: {},
                                            df: 0,
                                            y: {
                                                docs: {
                                                    "run.get_session_history": { tf: 1 },
                                                    "run.build_gemini_history": { tf: 1 },
                                                    "run.print_history": { tf: 1 },
                                                },
                                                df: 3,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    t: { docs: {}, df: 0, o: { docs: { "run.export_database_to_markdown": { tf: 1 } }, df: 1 } },
                    r: { docs: {}, df: 0, u: { docs: {}, df: 0, n: { docs: { "run.run_chat": { tf: 1 } }, df: 1 } } },
                },
            },
            fullname: {
                root: {
                    docs: {},
                    df: 0,
                    r: {
                        docs: {},
                        df: 0,
                        u: {
                            docs: {},
                            df: 0,
                            n: {
                                docs: {
                                    run: { tf: 1 },
                                    "run.BASE_DIR": { tf: 1 },
                                    "run.DATABASE_DIR": { tf: 1 },
                                    "run.DATABASE_PATH": { tf: 1 },
                                    "run.EXPORTS_DIR": { tf: 1 },
                                    "run.ENV_PATH": { tf: 1 },
                                    "run.load_api_key": { tf: 1 },
                                    "run.ensure_database_directory": { tf: 1 },
                                    "run.get_connection": { tf: 1 },
                                    "run.initialize_database": { tf: 1 },
                                    "run.create_session": { tf: 1 },
                                    "run.save_message": { tf: 1 },
                                    "run.get_session_history": { tf: 1 },
                                    "run.get_all_sessions": { tf: 1 },
                                    "run.export_database_to_markdown": { tf: 1 },
                                    "run.build_gemini_history": { tf: 1 },
                                    "run.start_chat_session": { tf: 1 },
                                    "run.print_banner": { tf: 1 },
                                    "run.print_history": { tf: 1 },
                                    "run.run_chat": { tf: 1.4142135623730951 },
                                    "run.main": { tf: 1 },
                                },
                                df: 21,
                            },
                        },
                    },
                    b: {
                        docs: {},
                        df: 0,
                        a: {
                            docs: {},
                            df: 0,
                            s: { docs: {}, df: 0, e: { docs: { "run.BASE_DIR": { tf: 1 } }, df: 1 } },
                            n: {
                                docs: {},
                                df: 0,
                                n: {
                                    docs: {},
                                    df: 0,
                                    e: { docs: {}, df: 0, r: { docs: { "run.print_banner": { tf: 1 } }, df: 1 } },
                                },
                            },
                        },
                        u: {
                            docs: {},
                            df: 0,
                            i: {
                                docs: {},
                                df: 0,
                                l: { docs: {}, df: 0, d: { docs: { "run.build_gemini_history": { tf: 1 } }, df: 1 } },
                            },
                        },
                    },
                    d: {
                        docs: {},
                        df: 0,
                        i: {
                            docs: {},
                            df: 0,
                            r: {
                                docs: {
                                    "run.BASE_DIR": { tf: 1 },
                                    "run.DATABASE_DIR": { tf: 1 },
                                    "run.EXPORTS_DIR": { tf: 1 },
                                },
                                df: 3,
                                e: {
                                    docs: {},
                                    df: 0,
                                    c: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                            docs: {},
                                            df: 0,
                                            o: {
                                                docs: {},
                                                df: 0,
                                                r: {
                                                    docs: {},
                                                    df: 0,
                                                    y: { docs: { "run.ensure_database_directory": { tf: 1 } }, df: 1 },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        a: {
                            docs: {},
                            df: 0,
                            t: {
                                docs: {},
                                df: 0,
                                a: {
                                    docs: {},
                                    df: 0,
                                    b: {
                                        docs: {},
                                        df: 0,
                                        a: {
                                            docs: {},
                                            df: 0,
                                            s: {
                                                docs: {},
                                                df: 0,
                                                e: {
                                                    docs: {
                                                        "run.DATABASE_DIR": { tf: 1 },
                                                        "run.DATABASE_PATH": { tf: 1 },
                                                        "run.ensure_database_directory": { tf: 1 },
                                                        "run.initialize_database": { tf: 1 },
                                                        "run.export_database_to_markdown": { tf: 1 },
                                                    },
                                                    df: 5,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    p: {
                        docs: {},
                        df: 0,
                        a: {
                            docs: {},
                            df: 0,
                            t: {
                                docs: {},
                                df: 0,
                                h: { docs: { "run.DATABASE_PATH": { tf: 1 }, "run.ENV_PATH": { tf: 1 } }, df: 2 },
                            },
                        },
                        r: {
                            docs: {},
                            df: 0,
                            i: {
                                docs: {},
                                df: 0,
                                n: {
                                    docs: {},
                                    df: 0,
                                    t: {
                                        docs: { "run.print_banner": { tf: 1 }, "run.print_history": { tf: 1 } },
                                        df: 2,
                                    },
                                },
                            },
                        },
                    },
                    e: {
                        docs: {},
                        df: 0,
                        x: {
                            docs: {},
                            df: 0,
                            p: {
                                docs: {},
                                df: 0,
                                o: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                            docs: { "run.export_database_to_markdown": { tf: 1 } },
                                            df: 1,
                                            s: { docs: { "run.EXPORTS_DIR": { tf: 1 } }, df: 1 },
                                        },
                                    },
                                },
                            },
                        },
                        n: {
                            docs: {},
                            df: 0,
                            v: { docs: { "run.ENV_PATH": { tf: 1 } }, df: 1 },
                            s: {
                                docs: {},
                                df: 0,
                                u: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                        docs: {},
                                        df: 0,
                                        e: { docs: { "run.ensure_database_directory": { tf: 1 } }, df: 1 },
                                    },
                                },
                            },
                        },
                    },
                    l: {
                        docs: {},
                        df: 0,
                        o: {
                            docs: {},
                            df: 0,
                            a: { docs: {}, df: 0, d: { docs: { "run.load_api_key": { tf: 1 } }, df: 1 } },
                        },
                    },
                    a: {
                        docs: {},
                        df: 0,
                        p: { docs: {}, df: 0, i: { docs: { "run.load_api_key": { tf: 1 } }, df: 1 } },
                        l: { docs: {}, df: 0, l: { docs: { "run.get_all_sessions": { tf: 1 } }, df: 1 } },
                    },
                    k: {
                        docs: {},
                        df: 0,
                        e: { docs: {}, df: 0, y: { docs: { "run.load_api_key": { tf: 1 } }, df: 1 } },
                    },
                    g: {
                        docs: {},
                        df: 0,
                        e: {
                            docs: {},
                            df: 0,
                            t: {
                                docs: {
                                    "run.get_connection": { tf: 1 },
                                    "run.get_session_history": { tf: 1 },
                                    "run.get_all_sessions": { tf: 1 },
                                },
                                df: 3,
                            },
                            m: {
                                docs: {},
                                df: 0,
                                i: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                        docs: {},
                                        df: 0,
                                        i: { docs: { "run.build_gemini_history": { tf: 1 } }, df: 1 },
                                    },
                                },
                            },
                        },
                    },
                    c: {
                        docs: {},
                        df: 0,
                        o: {
                            docs: {},
                            df: 0,
                            n: {
                                docs: {},
                                df: 0,
                                n: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        c: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                                docs: {},
                                                df: 0,
                                                i: {
                                                    docs: {},
                                                    df: 0,
                                                    o: {
                                                        docs: {},
                                                        df: 0,
                                                        n: { docs: { "run.get_connection": { tf: 1 } }, df: 1 },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        r: {
                            docs: {},
                            df: 0,
                            e: {
                                docs: {},
                                df: 0,
                                a: {
                                    docs: {},
                                    df: 0,
                                    t: { docs: {}, df: 0, e: { docs: { "run.create_session": { tf: 1 } }, df: 1 } },
                                },
                            },
                        },
                        h: {
                            docs: {},
                            df: 0,
                            a: {
                                docs: {},
                                df: 0,
                                t: { docs: { "run.start_chat_session": { tf: 1 }, "run.run_chat": { tf: 1 } }, df: 2 },
                            },
                        },
                    },
                    i: {
                        docs: {},
                        df: 0,
                        n: {
                            docs: {},
                            df: 0,
                            i: {
                                docs: {},
                                df: 0,
                                t: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                        docs: {},
                                        df: 0,
                                        a: {
                                            docs: {},
                                            df: 0,
                                            l: {
                                                docs: {},
                                                df: 0,
                                                i: {
                                                    docs: {},
                                                    df: 0,
                                                    z: {
                                                        docs: {},
                                                        df: 0,
                                                        e: { docs: { "run.initialize_database": { tf: 1 } }, df: 1 },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    s: {
                        docs: {},
                        df: 0,
                        e: {
                            docs: {},
                            df: 0,
                            s: {
                                docs: {},
                                df: 0,
                                s: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                        docs: {},
                                        df: 0,
                                        o: {
                                            docs: {},
                                            df: 0,
                                            n: {
                                                docs: {
                                                    "run.create_session": { tf: 1 },
                                                    "run.get_session_history": { tf: 1 },
                                                    "run.start_chat_session": { tf: 1 },
                                                },
                                                df: 3,
                                                s: { docs: { "run.get_all_sessions": { tf: 1 } }, df: 1 },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        a: {
                            docs: {},
                            df: 0,
                            v: { docs: {}, df: 0, e: { docs: { "run.save_message": { tf: 1 } }, df: 1 } },
                        },
                        t: {
                            docs: {},
                            df: 0,
                            a: {
                                docs: {},
                                df: 0,
                                r: { docs: {}, df: 0, t: { docs: { "run.start_chat_session": { tf: 1 } }, df: 1 } },
                            },
                        },
                    },
                    m: {
                        docs: {},
                        df: 0,
                        e: {
                            docs: {},
                            df: 0,
                            s: {
                                docs: {},
                                df: 0,
                                s: {
                                    docs: {},
                                    df: 0,
                                    a: {
                                        docs: {},
                                        df: 0,
                                        g: { docs: {}, df: 0, e: { docs: { "run.save_message": { tf: 1 } }, df: 1 } },
                                    },
                                },
                            },
                        },
                        a: {
                            docs: {},
                            df: 0,
                            r: {
                                docs: {},
                                df: 0,
                                k: {
                                    docs: {},
                                    df: 0,
                                    d: {
                                        docs: {},
                                        df: 0,
                                        o: {
                                            docs: {},
                                            df: 0,
                                            w: {
                                                docs: {},
                                                df: 0,
                                                n: { docs: { "run.export_database_to_markdown": { tf: 1 } }, df: 1 },
                                            },
                                        },
                                    },
                                },
                            },
                            i: { docs: {}, df: 0, n: { docs: { "run.main": { tf: 1 } }, df: 1 } },
                        },
                    },
                    h: {
                        docs: {},
                        df: 0,
                        i: {
                            docs: {},
                            df: 0,
                            s: {
                                docs: {},
                                df: 0,
                                t: {
                                    docs: {},
                                    df: 0,
                                    o: {
                                        docs: {},
                                        df: 0,
                                        r: {
                                            docs: {},
                                            df: 0,
                                            y: {
                                                docs: {
                                                    "run.get_session_history": { tf: 1 },
                                                    "run.build_gemini_history": { tf: 1 },
                                                    "run.print_history": { tf: 1 },
                                                },
                                                df: 3,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    t: { docs: {}, df: 0, o: { docs: { "run.export_database_to_markdown": { tf: 1 } }, df: 1 } },
                },
            },
            annotation: { root: { docs: {}, df: 0 } },
            default_value: {
                root: {
                    docs: {
                        "run.BASE_DIR": { tf: 1 },
                        "run.DATABASE_DIR": { tf: 1 },
                        "run.DATABASE_PATH": { tf: 1 },
                        "run.EXPORTS_DIR": { tf: 1 },
                        "run.ENV_PATH": { tf: 1 },
                    },
                    df: 5,
                    w: {
                        docs: {},
                        df: 0,
                        i: {
                            docs: {},
                            df: 0,
                            n: {
                                docs: {},
                                df: 0,
                                d: {
                                    docs: {},
                                    df: 0,
                                    o: {
                                        docs: {},
                                        df: 0,
                                        w: {
                                            docs: {},
                                            df: 0,
                                            s: {
                                                docs: {},
                                                df: 0,
                                                p: {
                                                    docs: {},
                                                    df: 0,
                                                    a: {
                                                        docs: {},
                                                        df: 0,
                                                        t: {
                                                            docs: {},
                                                            df: 0,
                                                            h: {
                                                                docs: {
                                                                    "run.BASE_DIR": { tf: 1 },
                                                                    "run.DATABASE_DIR": { tf: 1 },
                                                                    "run.DATABASE_PATH": { tf: 1 },
                                                                    "run.EXPORTS_DIR": { tf: 1 },
                                                                    "run.ENV_PATH": { tf: 1 },
                                                                },
                                                                df: 5,
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    x: {
                        2: {
                            7: {
                                docs: {
                                    "run.BASE_DIR": { tf: 1.4142135623730951 },
                                    "run.DATABASE_DIR": { tf: 1.4142135623730951 },
                                    "run.DATABASE_PATH": { tf: 1.4142135623730951 },
                                    "run.EXPORTS_DIR": { tf: 1.4142135623730951 },
                                    "run.ENV_PATH": { tf: 1.4142135623730951 },
                                },
                                df: 5,
                            },
                            docs: {},
                            df: 0,
                        },
                        docs: {},
                        df: 0,
                    },
                    c: {
                        docs: {},
                        df: 0,
                        ":": {
                            docs: {},
                            df: 0,
                            "/": {
                                docs: {},
                                df: 0,
                                g: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                            docs: {},
                                            df: 0,
                                            h: {
                                                docs: {},
                                                df: 0,
                                                u: {
                                                    docs: {},
                                                    df: 0,
                                                    b: {
                                                        docs: {},
                                                        df: 0,
                                                        "/": {
                                                            docs: {},
                                                            df: 0,
                                                            g: {
                                                                docs: {},
                                                                df: 0,
                                                                e: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    m: {
                                                                        docs: {},
                                                                        df: 0,
                                                                        i: {
                                                                            docs: {},
                                                                            df: 0,
                                                                            n: {
                                                                                docs: {},
                                                                                df: 0,
                                                                                i: {
                                                                                    docs: {
                                                                                        "run.BASE_DIR": { tf: 1 },
                                                                                        "run.DATABASE_DIR": { tf: 1 },
                                                                                        "run.DATABASE_PATH": { tf: 1 },
                                                                                        "run.EXPORTS_DIR": { tf: 1 },
                                                                                        "run.ENV_PATH": { tf: 1 },
                                                                                    },
                                                                                    df: 5,
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    m: {
                        docs: {},
                        df: 0,
                        e: {
                            docs: {},
                            df: 0,
                            m: {
                                docs: {},
                                df: 0,
                                o: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                        docs: {},
                                        df: 0,
                                        y: {
                                            docs: {
                                                "run.BASE_DIR": { tf: 1 },
                                                "run.DATABASE_DIR": { tf: 1 },
                                                "run.DATABASE_PATH": { tf: 1 },
                                                "run.EXPORTS_DIR": { tf: 1 },
                                                "run.ENV_PATH": { tf: 1 },
                                            },
                                            df: 5,
                                        },
                                    },
                                },
                            },
                        },
                    },
                    s: {
                        docs: {},
                        df: 0,
                        c: {
                            docs: {},
                            df: 0,
                            r: {
                                docs: {},
                                df: 0,
                                i: {
                                    docs: {},
                                    df: 0,
                                    p: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                            docs: { "run.BASE_DIR": { tf: 1 }, "run.ENV_PATH": { tf: 1 } },
                                            df: 2,
                                            "/": {
                                                docs: {},
                                                df: 0,
                                                d: {
                                                    docs: {},
                                                    df: 0,
                                                    a: {
                                                        docs: {},
                                                        df: 0,
                                                        t: {
                                                            docs: {},
                                                            df: 0,
                                                            a: {
                                                                docs: {},
                                                                df: 0,
                                                                b: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    a: {
                                                                        docs: {},
                                                                        df: 0,
                                                                        s: {
                                                                            docs: {},
                                                                            df: 0,
                                                                            e: {
                                                                                docs: { "run.DATABASE_DIR": { tf: 1 } },
                                                                                df: 1,
                                                                                "/": {
                                                                                    docs: {},
                                                                                    df: 0,
                                                                                    c: {
                                                                                        docs: {},
                                                                                        df: 0,
                                                                                        h: {
                                                                                            docs: {},
                                                                                            df: 0,
                                                                                            a: {
                                                                                                docs: {},
                                                                                                df: 0,
                                                                                                t: {
                                                                                                    docs: {
                                                                                                        "run.DATABASE_PATH":
                                                                                                            { tf: 1 },
                                                                                                    },
                                                                                                    df: 1,
                                                                                                },
                                                                                            },
                                                                                        },
                                                                                    },
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                                e: {
                                                    docs: {},
                                                    df: 0,
                                                    x: {
                                                        docs: {},
                                                        df: 0,
                                                        p: {
                                                            docs: {},
                                                            df: 0,
                                                            o: {
                                                                docs: {},
                                                                df: 0,
                                                                r: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    t: {
                                                                        docs: {},
                                                                        df: 0,
                                                                        s: {
                                                                            docs: { "run.EXPORTS_DIR": { tf: 1 } },
                                                                            df: 1,
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    h: {
                        docs: {},
                        df: 0,
                        i: {
                            docs: {},
                            df: 0,
                            s: {
                                docs: {},
                                df: 0,
                                t: {
                                    docs: {},
                                    df: 0,
                                    o: {
                                        docs: {},
                                        df: 0,
                                        r: { docs: {}, df: 0, y: { docs: { "run.DATABASE_PATH": { tf: 1 } }, df: 1 } },
                                    },
                                },
                            },
                        },
                    },
                    d: { docs: {}, df: 0, b: { docs: { "run.DATABASE_PATH": { tf: 1 } }, df: 1 } },
                    e: { docs: {}, df: 0, n: { docs: {}, df: 0, v: { docs: { "run.ENV_PATH": { tf: 1 } }, df: 1 } } },
                },
            },
            signature: {
                root: {
                    docs: {
                        "run.load_api_key": { tf: 3 },
                        "run.ensure_database_directory": { tf: 3 },
                        "run.get_connection": { tf: 3.605551275463989 },
                        "run.initialize_database": { tf: 3 },
                        "run.create_session": { tf: 3 },
                        "run.save_message": { tf: 5.656854249492381 },
                        "run.get_session_history": { tf: 4.58257569495584 },
                        "run.get_all_sessions": { tf: 3.7416573867739413 },
                        "run.export_database_to_markdown": { tf: 3.605551275463989 },
                        "run.build_gemini_history": { tf: 4.58257569495584 },
                        "run.start_chat_session": { tf: 7.0710678118654755 },
                        "run.print_banner": { tf: 3 },
                        "run.print_history": { tf: 4 },
                        "run.run_chat": { tf: 6 },
                        "run.main": { tf: 3 },
                    },
                    df: 15,
                    s: {
                        docs: {},
                        df: 0,
                        t: {
                            docs: {},
                            df: 0,
                            r: {
                                docs: {
                                    "run.load_api_key": { tf: 1 },
                                    "run.create_session": { tf: 1 },
                                    "run.save_message": { tf: 1.7320508075688772 },
                                    "run.get_session_history": { tf: 1 },
                                    "run.build_gemini_history": { tf: 1 },
                                    "run.start_chat_session": { tf: 1 },
                                    "run.print_history": { tf: 1 },
                                    "run.run_chat": { tf: 1 },
                                },
                                df: 8,
                            },
                        },
                        q: {
                            docs: {},
                            df: 0,
                            l: {
                                docs: {},
                                df: 0,
                                i: {
                                    docs: {},
                                    df: 0,
                                    t: {
                                        docs: {},
                                        df: 0,
                                        e: { 3: { docs: { "run.get_connection": { tf: 1 } }, df: 1 }, docs: {}, df: 0 },
                                    },
                                },
                            },
                        },
                        e: {
                            docs: {},
                            df: 0,
                            s: {
                                docs: {},
                                df: 0,
                                s: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                        docs: {},
                                        df: 0,
                                        o: {
                                            docs: {},
                                            df: 0,
                                            n: {
                                                docs: {
                                                    "run.save_message": { tf: 1 },
                                                    "run.get_session_history": { tf: 1 },
                                                    "run.build_gemini_history": { tf: 1 },
                                                    "run.start_chat_session": { tf: 1 },
                                                    "run.print_history": { tf: 1 },
                                                    "run.run_chat": { tf: 1 },
                                                },
                                                df: 6,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    n: {
                        docs: {},
                        df: 0,
                        o: {
                            docs: {},
                            df: 0,
                            n: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {
                                        "run.ensure_database_directory": { tf: 1 },
                                        "run.initialize_database": { tf: 1 },
                                        "run.save_message": { tf: 1 },
                                        "run.print_banner": { tf: 1 },
                                        "run.print_history": { tf: 1 },
                                        "run.run_chat": { tf: 1 },
                                        "run.main": { tf: 1 },
                                    },
                                    df: 7,
                                },
                            },
                        },
                    },
                    c: {
                        docs: {},
                        df: 0,
                        o: {
                            docs: {},
                            df: 0,
                            n: {
                                docs: {},
                                df: 0,
                                n: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        c: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                                docs: {},
                                                df: 0,
                                                i: {
                                                    docs: {},
                                                    df: 0,
                                                    o: {
                                                        docs: {},
                                                        df: 0,
                                                        n: { docs: { "run.get_connection": { tf: 1 } }, df: 1 },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                                t: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        n: { docs: {}, df: 0, t: { docs: { "run.save_message": { tf: 1 } }, df: 1 } },
                                    },
                                },
                            },
                        },
                        l: {
                            docs: {},
                            df: 0,
                            i: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                        docs: {},
                                        df: 0,
                                        t: { docs: { "run.start_chat_session": { tf: 1.7320508075688772 } }, df: 1 },
                                    },
                                },
                            },
                        },
                        h: {
                            docs: {},
                            df: 0,
                            a: {
                                docs: {},
                                df: 0,
                                t: {
                                    docs: {
                                        "run.start_chat_session": { tf: 1 },
                                        "run.run_chat": { tf: 1.4142135623730951 },
                                    },
                                    df: 2,
                                    s: {
                                        docs: { "run.start_chat_session": { tf: 1 }, "run.run_chat": { tf: 1 } },
                                        df: 2,
                                    },
                                },
                            },
                        },
                    },
                    i: {
                        docs: {},
                        df: 0,
                        d: {
                            docs: {
                                "run.save_message": { tf: 1 },
                                "run.get_session_history": { tf: 1 },
                                "run.build_gemini_history": { tf: 1 },
                                "run.start_chat_session": { tf: 1 },
                                "run.print_history": { tf: 1 },
                                "run.run_chat": { tf: 1 },
                            },
                            df: 6,
                        },
                    },
                    r: {
                        docs: {},
                        df: 0,
                        o: {
                            docs: {},
                            df: 0,
                            l: { docs: {}, df: 0, e: { docs: { "run.save_message": { tf: 1 } }, df: 1 } },
                        },
                    },
                    l: {
                        docs: {},
                        df: 0,
                        i: {
                            docs: {},
                            df: 0,
                            s: {
                                docs: {},
                                df: 0,
                                t: {
                                    docs: {
                                        "run.get_session_history": { tf: 1 },
                                        "run.get_all_sessions": { tf: 1 },
                                        "run.build_gemini_history": { tf: 1 },
                                    },
                                    df: 3,
                                },
                            },
                        },
                    },
                    d: {
                        docs: {},
                        df: 0,
                        i: {
                            docs: {},
                            df: 0,
                            c: {
                                docs: {},
                                df: 0,
                                t: {
                                    docs: {
                                        "run.get_session_history": { tf: 1 },
                                        "run.get_all_sessions": { tf: 1 },
                                        "run.build_gemini_history": { tf: 1 },
                                    },
                                    df: 3,
                                },
                            },
                        },
                    },
                    p: {
                        docs: {},
                        df: 0,
                        a: {
                            docs: {},
                            df: 0,
                            t: {
                                docs: {},
                                df: 0,
                                h: {
                                    docs: { "run.export_database_to_markdown": { tf: 1 } },
                                    df: 1,
                                    l: {
                                        docs: {},
                                        df: 0,
                                        i: {
                                            docs: {},
                                            df: 0,
                                            b: { docs: { "run.export_database_to_markdown": { tf: 1 } }, df: 1 },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    g: {
                        docs: {},
                        df: 0,
                        o: {
                            docs: {},
                            df: 0,
                            o: {
                                docs: {},
                                df: 0,
                                g: {
                                    docs: {},
                                    df: 0,
                                    l: {
                                        docs: {},
                                        df: 0,
                                        e: {
                                            docs: {
                                                "run.start_chat_session": { tf: 1.4142135623730951 },
                                                "run.run_chat": { tf: 1 },
                                            },
                                            df: 2,
                                        },
                                    },
                                },
                            },
                        },
                        e: {
                            docs: {},
                            df: 0,
                            n: {
                                docs: {},
                                df: 0,
                                a: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                        docs: {
                                            "run.start_chat_session": { tf: 1.4142135623730951 },
                                            "run.run_chat": { tf: 1 },
                                        },
                                        df: 2,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            bases: { root: { docs: {}, df: 0 } },
            doc: {
                root: {
                    4: { 2: { 9: { docs: { "run.run_chat": { tf: 1 } }, df: 1 }, docs: {}, df: 0 }, docs: {}, df: 0 },
                    8: {
                        6: {
                            0: { 1: { docs: { "run.create_session": { tf: 1 } }, df: 1 }, docs: {}, df: 0 },
                            docs: {},
                            df: 0,
                        },
                        docs: {},
                        df: 0,
                    },
                    docs: {
                        run: { tf: 1.7320508075688772 },
                        "run.BASE_DIR": { tf: 1.7320508075688772 },
                        "run.DATABASE_DIR": { tf: 1.7320508075688772 },
                        "run.DATABASE_PATH": { tf: 1.7320508075688772 },
                        "run.EXPORTS_DIR": { tf: 1.7320508075688772 },
                        "run.ENV_PATH": { tf: 1.7320508075688772 },
                        "run.load_api_key": { tf: 3.4641016151377544 },
                        "run.ensure_database_directory": { tf: 2.449489742783178 },
                        "run.get_connection": { tf: 3 },
                        "run.initialize_database": { tf: 3.1622776601683795 },
                        "run.create_session": { tf: 3 },
                        "run.save_message": { tf: 4.123105625617661 },
                        "run.get_session_history": { tf: 4.242640687119285 },
                        "run.get_all_sessions": { tf: 3.1622776601683795 },
                        "run.export_database_to_markdown": { tf: 4.47213595499958 },
                        "run.build_gemini_history": { tf: 4.58257569495584 },
                        "run.start_chat_session": { tf: 4 },
                        "run.print_banner": { tf: 1.7320508075688772 },
                        "run.print_history": { tf: 3.605551275463989 },
                        "run.run_chat": { tf: 7.0710678118654755 },
                        "run.main": { tf: 5.477225575051661 },
                    },
                    df: 21,
                    l: {
                        docs: {},
                        df: 0,
                        o: {
                            docs: {},
                            df: 0,
                            a: {
                                docs: {},
                                df: 0,
                                d: {
                                    docs: { "run.load_api_key": { tf: 1 }, "run.main": { tf: 1 } },
                                    df: 2,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        d: {
                                            docs: { "run.start_chat_session": { tf: 1 }, "run.main": { tf: 1 } },
                                            df: 2,
                                        },
                                    },
                                },
                            },
                            c: {
                                docs: {},
                                df: 0,
                                a: {
                                    docs: {},
                                    df: 0,
                                    t: {
                                        docs: {},
                                        df: 0,
                                        e: { docs: {}, df: 0, d: { docs: { "run.load_api_key": { tf: 1 } }, df: 1 } },
                                    },
                                },
                            },
                            s: { docs: {}, df: 0, s: { docs: { "run.initialize_database": { tf: 1 } }, df: 1 } },
                            o: {
                                docs: {},
                                df: 0,
                                p: {
                                    docs: { "run.run_chat": { tf: 1.7320508075688772 }, "run.main": { tf: 1 } },
                                    df: 2,
                                },
                            },
                        },
                        i: {
                            docs: {},
                            df: 0,
                            n: {
                                docs: {},
                                df: 0,
                                k: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        d: { docs: { "run.initialize_database": { tf: 1 } }, df: 1 },
                                    },
                                },
                            },
                            s: {
                                docs: {},
                                df: 0,
                                t: {
                                    docs: {
                                        "run.get_session_history": { tf: 1 },
                                        "run.get_all_sessions": { tf: 1 },
                                        "run.build_gemini_history": { tf: 1.7320508075688772 },
                                        "run.print_banner": { tf: 1 },
                                    },
                                    df: 4,
                                },
                            },
                            m: {
                                docs: {},
                                df: 0,
                                i: { docs: {}, df: 0, t: { docs: { "run.run_chat": { tf: 1 } }, df: 1 } },
                            },
                        },
                        t: { docs: { "run.export_database_to_markdown": { tf: 1 } }, df: 1 },
                        a: {
                            docs: {},
                            df: 0,
                            b: {
                                docs: {},
                                df: 0,
                                e: { docs: {}, df: 0, l: { docs: { "run.print_history": { tf: 1 } }, df: 1 } },
                            },
                        },
                    },
                    t: {
                        docs: {},
                        df: 0,
                        h: {
                            docs: {},
                            df: 0,
                            e: {
                                docs: {
                                    "run.load_api_key": { tf: 2.8284271247461903 },
                                    "run.ensure_database_directory": { tf: 1.4142135623730951 },
                                    "run.get_connection": { tf: 1.7320508075688772 },
                                    "run.initialize_database": { tf: 1.7320508075688772 },
                                    "run.create_session": { tf: 2.23606797749979 },
                                    "run.save_message": { tf: 3.872983346207417 },
                                    "run.get_session_history": { tf: 2.6457513110645907 },
                                    "run.get_all_sessions": { tf: 1.4142135623730951 },
                                    "run.export_database_to_markdown": { tf: 3.1622776601683795 },
                                    "run.build_gemini_history": { tf: 2.449489742783178 },
                                    "run.start_chat_session": { tf: 3 },
                                    "run.print_banner": { tf: 1 },
                                    "run.print_history": { tf: 2.23606797749979 },
                                    "run.run_chat": { tf: 4 },
                                    "run.main": { tf: 3 },
                                },
                                df: 15,
                                n: { docs: { "run.load_api_key": { tf: 1 } }, df: 1 },
                                m: { docs: { "run.export_database_to_markdown": { tf: 1 } }, df: 1 },
                            },
                            a: {
                                docs: {},
                                df: 0,
                                t: {
                                    docs: { "run.get_connection": { tf: 1 }, "run.build_gemini_history": { tf: 1 } },
                                    df: 2,
                                },
                            },
                            i: {
                                docs: {},
                                df: 0,
                                s: {
                                    docs: {
                                        "run.initialize_database": { tf: 1 },
                                        "run.save_message": { tf: 1.4142135623730951 },
                                        "run.build_gemini_history": { tf: 1 },
                                    },
                                    df: 3,
                                },
                            },
                        },
                        r: {
                            docs: {},
                            df: 0,
                            u: {
                                docs: {},
                                df: 0,
                                e: { docs: { "run.ensure_database_directory": { tf: 1.4142135623730951 } }, df: 1 },
                            },
                            a: {
                                docs: {},
                                df: 0,
                                n: {
                                    docs: {},
                                    df: 0,
                                    s: {
                                        docs: {},
                                        df: 0,
                                        l: {
                                            docs: {},
                                            df: 0,
                                            a: {
                                                docs: {},
                                                df: 0,
                                                t: {
                                                    docs: {},
                                                    df: 0,
                                                    e: {
                                                        docs: {},
                                                        df: 0,
                                                        s: { docs: { "run.build_gemini_history": { tf: 1 } }, df: 1 },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        o: {
                            docs: {
                                "run.ensure_database_directory": { tf: 1 },
                                "run.get_connection": { tf: 1 },
                                "run.initialize_database": { tf: 1.7320508075688772 },
                                "run.create_session": { tf: 1 },
                                "run.save_message": { tf: 2 },
                                "run.export_database_to_markdown": { tf: 1.4142135623730951 },
                                "run.build_gemini_history": { tf: 1.4142135623730951 },
                                "run.start_chat_session": { tf: 1.7320508075688772 },
                                "run.print_history": { tf: 1 },
                                "run.run_chat": { tf: 2.23606797749979 },
                            },
                            df: 10,
                        },
                        i: {
                            docs: {},
                            df: 0,
                            m: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {
                                        "run.create_session": { tf: 1 },
                                        "run.save_message": { tf: 1 },
                                        "run.get_session_history": { tf: 1 },
                                        "run.get_all_sessions": { tf: 1 },
                                    },
                                    df: 4,
                                    s: {
                                        docs: { "run.ensure_database_directory": { tf: 1 } },
                                        df: 1,
                                        t: {
                                            docs: {},
                                            df: 0,
                                            a: {
                                                docs: {},
                                                df: 0,
                                                m: {
                                                    docs: {},
                                                    df: 0,
                                                    p: {
                                                        docs: {
                                                            "run.create_session": { tf: 1 },
                                                            "run.save_message": { tf: 1 },
                                                            "run.export_database_to_markdown": {
                                                                tf: 1.4142135623730951,
                                                            },
                                                            "run.print_history": { tf: 1 },
                                                        },
                                                        df: 4,
                                                        e: {
                                                            docs: {},
                                                            df: 0,
                                                            d: {
                                                                docs: { "run.export_database_to_markdown": { tf: 1 } },
                                                                df: 1,
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        a: {
                            docs: {},
                            df: 0,
                            b: {
                                docs: {},
                                df: 0,
                                l: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {
                                            "run.initialize_database": { tf: 1 },
                                            "run.save_message": { tf: 1 },
                                            "run.get_session_history": { tf: 1 },
                                        },
                                        df: 3,
                                        s: { docs: { "run.initialize_database": { tf: 1.4142135623730951 } }, df: 1 },
                                    },
                                },
                            },
                        },
                        w: {
                            docs: {},
                            df: 0,
                            i: {
                                docs: {},
                                df: 0,
                                c: { docs: {}, df: 0, e: { docs: { "run.save_message": { tf: 1 } }, df: 1 } },
                            },
                        },
                        e: {
                            docs: {},
                            df: 0,
                            x: {
                                docs: {},
                                df: 0,
                                t: {
                                    docs: { "run.save_message": { tf: 1 }, "run.build_gemini_history": { tf: 1 } },
                                    df: 2,
                                },
                            },
                            r: {
                                docs: {},
                                df: 0,
                                m: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                        docs: {},
                                        df: 0,
                                        n: {
                                            docs: {},
                                            df: 0,
                                            a: {
                                                docs: {},
                                                df: 0,
                                                t: {
                                                    docs: {},
                                                    df: 0,
                                                    e: {
                                                        docs: { "run.run_chat": { tf: 1 } },
                                                        df: 1,
                                                        s: { docs: { "run.run_chat": { tf: 1 } }, df: 1 },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        y: {
                            docs: {},
                            df: 0,
                            p: {
                                docs: {},
                                df: 0,
                                e: { docs: {}, df: 0, s: { docs: { "run.run_chat": { tf: 1 } }, df: 1 } },
                            },
                        },
                    },
                    g: {
                        docs: { "run.run_chat": { tf: 1 } },
                        df: 1,
                        e: {
                            docs: {},
                            df: 0,
                            m: {
                                docs: {},
                                df: 0,
                                i: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                        docs: {},
                                        df: 0,
                                        i: {
                                            docs: {
                                                "run.load_api_key": { tf: 1.7320508075688772 },
                                                "run.save_message": { tf: 1 },
                                                "run.build_gemini_history": { tf: 1.7320508075688772 },
                                                "run.start_chat_session": { tf: 1.4142135623730951 },
                                                "run.print_history": { tf: 1 },
                                                "run.run_chat": { tf: 1 },
                                                "run.main": { tf: 1.7320508075688772 },
                                            },
                                            df: 7,
                                        },
                                    },
                                },
                            },
                            n: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                        docs: {},
                                        df: 0,
                                        a: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                                docs: {},
                                                df: 0,
                                                e: {
                                                    docs: {},
                                                    df: 0,
                                                    s: { docs: { "run.create_session": { tf: 1 } }, df: 1 },
                                                    d: {
                                                        docs: { "run.export_database_to_markdown": { tf: 1 } },
                                                        df: 1,
                                                    },
                                                },
                                                i: {
                                                    docs: {},
                                                    df: 0,
                                                    n: {
                                                        docs: {},
                                                        df: 0,
                                                        g: { docs: { "run.start_chat_session": { tf: 1 } }, df: 1 },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                                a: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                        docs: {
                                            "run.start_chat_session": { tf: 1.4142135623730951 },
                                            "run.run_chat": { tf: 1 },
                                        },
                                        df: 2,
                                    },
                                },
                            },
                        },
                        i: {
                            docs: {},
                            df: 0,
                            v: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                        docs: { "run.get_session_history": { tf: 1 }, "run.print_history": { tf: 1 } },
                                        df: 2,
                                    },
                                },
                            },
                        },
                        t: { docs: { "run.export_database_to_markdown": { tf: 1 } }, df: 1 },
                        r: {
                            docs: {},
                            df: 0,
                            a: {
                                docs: {},
                                df: 0,
                                c: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        f: {
                                            docs: {},
                                            df: 0,
                                            u: {
                                                docs: {},
                                                df: 0,
                                                l: {
                                                    docs: {},
                                                    df: 0,
                                                    l: {
                                                        docs: {},
                                                        df: 0,
                                                        y: { docs: { "run.run_chat": { tf: 1 } }, df: 1 },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    a: {
                        docs: {
                            "run.get_connection": { tf: 1 },
                            "run.initialize_database": { tf: 1.7320508075688772 },
                            "run.create_session": { tf: 1.7320508075688772 },
                            "run.save_message": { tf: 1.4142135623730951 },
                            "run.get_session_history": { tf: 1.4142135623730951 },
                            "run.get_all_sessions": { tf: 1 },
                            "run.export_database_to_markdown": { tf: 1.7320508075688772 },
                            "run.build_gemini_history": { tf: 2.23606797749979 },
                            "run.start_chat_session": { tf: 1.4142135623730951 },
                            "run.print_history": { tf: 1.4142135623730951 },
                            "run.run_chat": { tf: 2.23606797749979 },
                            "run.main": { tf: 1.4142135623730951 },
                        },
                        df: 12,
                        p: {
                            docs: {},
                            df: 0,
                            i: {
                                docs: {
                                    "run.load_api_key": { tf: 2 },
                                    "run.save_message": { tf: 1 },
                                    "run.run_chat": { tf: 1 },
                                    "run.main": { tf: 1 },
                                },
                                df: 4,
                            },
                            p: {
                                docs: {},
                                df: 0,
                                l: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                        docs: {},
                                        df: 0,
                                        c: {
                                            docs: {},
                                            df: 0,
                                            a: {
                                                docs: {},
                                                df: 0,
                                                t: {
                                                    docs: {},
                                                    df: 0,
                                                    i: {
                                                        docs: {},
                                                        df: 0,
                                                        o: {
                                                            docs: {},
                                                            df: 0,
                                                            n: {
                                                                docs: {
                                                                    "run.initialize_database": { tf: 1 },
                                                                    "run.print_banner": { tf: 1 },
                                                                    "run.main": { tf: 1 },
                                                                },
                                                                df: 3,
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        t: {
                            docs: {
                                "run.load_api_key": { tf: 1 },
                                "run.get_connection": { tf: 1 },
                                "run.get_session_history": { tf: 1 },
                                "run.get_all_sessions": { tf: 1 },
                                "run.export_database_to_markdown": { tf: 1 },
                            },
                            df: 5,
                            t: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    m: {
                                        docs: {},
                                        df: 0,
                                        p: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                                docs: {},
                                                df: 0,
                                                i: {
                                                    docs: {},
                                                    df: 0,
                                                    n: {
                                                        docs: {},
                                                        df: 0,
                                                        g: { docs: { "run.initialize_database": { tf: 1 } }, df: 1 },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        l: {
                            docs: {},
                            df: 0,
                            r: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    a: {
                                        docs: {},
                                        df: 0,
                                        d: {
                                            docs: {},
                                            df: 0,
                                            y: { docs: { "run.ensure_database_directory": { tf: 1 } }, df: 1 },
                                        },
                                    },
                                },
                            },
                            w: {
                                docs: {},
                                df: 0,
                                a: {
                                    docs: {},
                                    df: 0,
                                    y: {
                                        docs: {},
                                        df: 0,
                                        s: { docs: { "run.initialize_database": { tf: 1 } }, df: 1 },
                                    },
                                },
                            },
                            l: {
                                docs: {
                                    "run.get_session_history": { tf: 1 },
                                    "run.get_all_sessions": { tf: 1 },
                                    "run.print_history": { tf: 1 },
                                    "run.run_chat": { tf: 1 },
                                },
                                df: 4,
                                o: {
                                    docs: {},
                                    df: 0,
                                    w: { docs: {}, df: 0, s: { docs: { "run.run_chat": { tf: 1 } }, df: 1 } },
                                },
                            },
                        },
                        n: {
                            docs: {
                                "run.get_connection": { tf: 1 },
                                "run.start_chat_session": { tf: 1 },
                                "run.run_chat": { tf: 1 },
                            },
                            df: 3,
                            d: {
                                docs: {
                                    "run.ensure_database_directory": { tf: 1.4142135623730951 },
                                    "run.get_connection": { tf: 1.4142135623730951 },
                                    "run.create_session": { tf: 1 },
                                    "run.save_message": { tf: 1 },
                                    "run.get_session_history": { tf: 1 },
                                    "run.get_all_sessions": { tf: 1 },
                                    "run.export_database_to_markdown": { tf: 1.4142135623730951 },
                                    "run.build_gemini_history": { tf: 1 },
                                    "run.start_chat_session": { tf: 1.4142135623730951 },
                                    "run.print_banner": { tf: 1 },
                                    "run.print_history": { tf: 1.4142135623730951 },
                                    "run.run_chat": { tf: 2 },
                                    "run.main": { tf: 1.4142135623730951 },
                                },
                                df: 13,
                            },
                            y: { docs: { "run.run_chat": { tf: 1 }, "run.main": { tf: 1 } }, df: 2 },
                        },
                        r: {
                            docs: {},
                            df: 0,
                            e: {
                                docs: {
                                    "run.ensure_database_directory": { tf: 1 },
                                    "run.build_gemini_history": { tf: 1 },
                                },
                                df: 2,
                            },
                            g: {
                                docs: {},
                                df: 0,
                                s: {
                                    docs: {
                                        "run.save_message": { tf: 1 },
                                        "run.get_session_history": { tf: 1 },
                                        "run.build_gemini_history": { tf: 1 },
                                        "run.start_chat_session": { tf: 1 },
                                        "run.print_history": { tf: 1 },
                                        "run.run_chat": { tf: 1 },
                                    },
                                    df: 6,
                                },
                                u: {
                                    docs: {},
                                    df: 0,
                                    m: {
                                        docs: {},
                                        df: 0,
                                        e: {
                                            docs: {},
                                            df: 0,
                                            n: {
                                                docs: {},
                                                df: 0,
                                                t: { docs: { "run.get_session_history": { tf: 1 } }, df: 1 },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        s: {
                            docs: {
                                "run.get_connection": { tf: 1 },
                                "run.create_session": { tf: 1 },
                                "run.save_message": { tf: 1 },
                                "run.export_database_to_markdown": { tf: 1 },
                                "run.build_gemini_history": { tf: 1.4142135623730951 },
                            },
                            df: 5,
                            c: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                        docs: {},
                                        df: 0,
                                        d: {
                                            docs: {},
                                            df: 0,
                                            i: {
                                                docs: {},
                                                df: 0,
                                                n: {
                                                    docs: {},
                                                    df: 0,
                                                    g: { docs: { "run.get_session_history": { tf: 1 } }, df: 1 },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        c: {
                            docs: {},
                            df: 0,
                            c: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    s: {
                                        docs: {},
                                        df: 0,
                                        s: {
                                            docs: {},
                                            df: 0,
                                            e: {
                                                docs: {},
                                                df: 0,
                                                d: { docs: { "run.get_connection": { tf: 1 } }, df: 1 },
                                            },
                                        },
                                    },
                                },
                            },
                            t: {
                                docs: {},
                                df: 0,
                                i: {
                                    docs: {},
                                    df: 0,
                                    v: { docs: {}, df: 0, e: { docs: { "run.run_chat": { tf: 1 } }, df: 1 } },
                                },
                            },
                        },
                        f: {
                            docs: {},
                            df: 0,
                            t: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    r: { docs: { "run.save_message": { tf: 1 }, "run.run_chat": { tf: 1 } }, df: 2 },
                                },
                            },
                        },
                        u: {
                            docs: {},
                            df: 0,
                            t: {
                                docs: {},
                                df: 0,
                                h: {
                                    docs: {},
                                    df: 0,
                                    o: {
                                        docs: {},
                                        df: 0,
                                        r: {
                                            docs: { "run.save_message": { tf: 1 }, "run.print_history": { tf: 1 } },
                                            df: 2,
                                        },
                                    },
                                    e: {
                                        docs: {},
                                        df: 0,
                                        n: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                                docs: {},
                                                df: 0,
                                                i: {
                                                    docs: {},
                                                    df: 0,
                                                    c: {
                                                        docs: {},
                                                        df: 0,
                                                        a: {
                                                            docs: {},
                                                            df: 0,
                                                            t: {
                                                                docs: {},
                                                                df: 0,
                                                                e: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    d: {
                                                                        docs: { "run.start_chat_session": { tf: 1 } },
                                                                        df: 1,
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                                o: {
                                    docs: { "run.get_session_history": { tf: 1 } },
                                    df: 1,
                                    m: {
                                        docs: {},
                                        df: 0,
                                        a: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                                docs: {},
                                                df: 0,
                                                i: {
                                                    docs: {},
                                                    df: 0,
                                                    c: {
                                                        docs: {},
                                                        df: 0,
                                                        a: {
                                                            docs: {},
                                                            df: 0,
                                                            l: {
                                                                docs: {},
                                                                df: 0,
                                                                l: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    y: {
                                                                        docs: {
                                                                            "run.export_database_to_markdown": {
                                                                                tf: 1,
                                                                            },
                                                                        },
                                                                        df: 1,
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        v: {
                            docs: {},
                            df: 0,
                            a: {
                                docs: {},
                                df: 0,
                                i: {
                                    docs: {},
                                    df: 0,
                                    l: {
                                        docs: {},
                                        df: 0,
                                        a: {
                                            docs: {},
                                            df: 0,
                                            b: {
                                                docs: {},
                                                df: 0,
                                                l: {
                                                    docs: {},
                                                    df: 0,
                                                    e: { docs: { "run.print_banner": { tf: 1 } }, df: 1 },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    k: {
                        docs: {},
                        df: 0,
                        e: {
                            docs: {},
                            df: 0,
                            y: {
                                docs: {
                                    "run.load_api_key": { tf: 2 },
                                    "run.initialize_database": { tf: 1.4142135623730951 },
                                    "run.get_session_history": { tf: 1 },
                                    "run.build_gemini_history": { tf: 1.4142135623730951 },
                                    "run.main": { tf: 1 },
                                },
                                df: 5,
                                s: {
                                    docs: { "run.get_session_history": { tf: 1 }, "run.get_all_sessions": { tf: 1 } },
                                    df: 2,
                                },
                                b: {
                                    docs: {},
                                    df: 0,
                                    o: {
                                        docs: {},
                                        df: 0,
                                        a: {
                                            docs: {},
                                            df: 0,
                                            r: {
                                                docs: {},
                                                df: 0,
                                                d: {
                                                    docs: {},
                                                    df: 0,
                                                    i: {
                                                        docs: {},
                                                        df: 0,
                                                        n: {
                                                            docs: {},
                                                            df: 0,
                                                            t: {
                                                                docs: {},
                                                                df: 0,
                                                                e: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    r: {
                                                                        docs: {},
                                                                        df: 0,
                                                                        r: {
                                                                            docs: {},
                                                                            df: 0,
                                                                            u: {
                                                                                docs: {},
                                                                                df: 0,
                                                                                p: {
                                                                                    docs: {},
                                                                                    df: 0,
                                                                                    t: {
                                                                                        docs: {
                                                                                            "run.run_chat": { tf: 1 },
                                                                                        },
                                                                                        df: 1,
                                                                                    },
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    f: {
                        docs: {},
                        df: 0,
                        r: {
                            docs: {},
                            df: 0,
                            o: {
                                docs: {},
                                df: 0,
                                m: {
                                    docs: {
                                        "run.load_api_key": { tf: 1.4142135623730951 },
                                        "run.start_chat_session": { tf: 1 },
                                        "run.run_chat": { tf: 1 },
                                        "run.main": { tf: 1 },
                                    },
                                    df: 4,
                                },
                            },
                            i: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                        docs: {},
                                        df: 0,
                                        d: {
                                            docs: {},
                                            df: 0,
                                            l: { docs: {}, df: 0, y: { docs: { "run.run_chat": { tf: 1 } }, df: 1 } },
                                        },
                                    },
                                },
                            },
                        },
                        i: {
                            docs: {},
                            df: 0,
                            l: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {
                                        "run.load_api_key": { tf: 1 },
                                        "run.export_database_to_markdown": { tf: 2 },
                                        "run.run_chat": { tf: 1 },
                                        "run.main": { tf: 1 },
                                    },
                                    df: 4,
                                    s: { docs: { "run.export_database_to_markdown": { tf: 1 } }, df: 1 },
                                },
                            },
                            r: {
                                docs: {},
                                df: 0,
                                s: { docs: {}, df: 0, t: { docs: { "run.get_all_sessions": { tf: 1 } }, df: 1 } },
                            },
                        },
                        a: {
                            docs: {},
                            df: 0,
                            c: {
                                docs: {},
                                df: 0,
                                t: {
                                    docs: {},
                                    df: 0,
                                    o: {
                                        docs: {},
                                        df: 0,
                                        r: { docs: {}, df: 0, y: { docs: { "run.get_connection": { tf: 1 } }, df: 1 } },
                                    },
                                },
                            },
                            i: {
                                docs: {},
                                df: 0,
                                l: {
                                    docs: {},
                                    df: 0,
                                    u: {
                                        docs: {},
                                        df: 0,
                                        r: { docs: {}, df: 0, e: { docs: { "run.run_chat": { tf: 1 } }, df: 1 } },
                                    },
                                },
                            },
                        },
                        u: {
                            docs: {},
                            df: 0,
                            n: {
                                docs: {},
                                df: 0,
                                c: {
                                    docs: {},
                                    df: 0,
                                    t: {
                                        docs: {},
                                        df: 0,
                                        i: {
                                            docs: {},
                                            df: 0,
                                            o: {
                                                docs: {},
                                                df: 0,
                                                n: {
                                                    docs: {
                                                        "run.initialize_database": { tf: 1 },
                                                        "run.save_message": { tf: 1 },
                                                        "run.build_gemini_history": { tf: 1 },
                                                    },
                                                    df: 3,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            l: {
                                docs: {},
                                df: 0,
                                l: {
                                    docs: {
                                        "run.save_message": { tf: 1 },
                                        "run.start_chat_session": { tf: 1 },
                                        "run.print_history": { tf: 1 },
                                        "run.run_chat": { tf: 1 },
                                        "run.main": { tf: 1 },
                                    },
                                    df: 5,
                                },
                            },
                        },
                        o: {
                            docs: {},
                            df: 0,
                            r: {
                                docs: {
                                    "run.get_session_history": { tf: 1.7320508075688772 },
                                    "run.get_all_sessions": { tf: 1 },
                                    "run.print_history": { tf: 1.7320508075688772 },
                                },
                                df: 3,
                                e: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                        docs: {},
                                        df: 0,
                                        g: {
                                            docs: {},
                                            df: 0,
                                            n: { docs: { "run.initialize_database": { tf: 1 } }, df: 1 },
                                        },
                                    },
                                },
                                m: {
                                    docs: {},
                                    df: 0,
                                    a: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                            docs: {
                                                "run.export_database_to_markdown": { tf: 1 },
                                                "run.build_gemini_history": { tf: 1 },
                                                "run.start_chat_session": { tf: 1 },
                                            },
                                            df: 3,
                                            s: { docs: { "run.export_database_to_markdown": { tf: 1 } }, df: 1 },
                                            t: {
                                                docs: {},
                                                df: 0,
                                                e: {
                                                    docs: {},
                                                    df: 0,
                                                    d: { docs: { "run.build_gemini_history": { tf: 1 } }, df: 1 },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        l: {
                            docs: {},
                            df: 0,
                            a: { docs: {}, df: 0, t: { docs: { "run.build_gemini_history": { tf: 1 } }, df: 1 } },
                        },
                        e: {
                            docs: {},
                            df: 0,
                            t: {
                                docs: {},
                                df: 0,
                                c: {
                                    docs: {},
                                    df: 0,
                                    h: {
                                        docs: {},
                                        df: 0,
                                        e: {
                                            docs: {},
                                            df: 0,
                                            s: { docs: { "run.start_chat_session": { tf: 1 } }, df: 1 },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    e: {
                        docs: { "run.run_chat": { tf: 1 } },
                        df: 1,
                        n: {
                            docs: {},
                            df: 0,
                            v: {
                                docs: { "run.load_api_key": { tf: 1 }, "run.main": { tf: 1 } },
                                df: 2,
                                i: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                        docs: {},
                                        df: 0,
                                        o: {
                                            docs: {},
                                            df: 0,
                                            n: {
                                                docs: {},
                                                df: 0,
                                                m: {
                                                    docs: {},
                                                    df: 0,
                                                    e: {
                                                        docs: {},
                                                        df: 0,
                                                        n: {
                                                            docs: {},
                                                            df: 0,
                                                            t: {
                                                                docs: {
                                                                    "run.load_api_key": { tf: 1.7320508075688772 },
                                                                },
                                                                df: 1,
                                                                e: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    r: {
                                                                        docs: {},
                                                                        df: 0,
                                                                        r: {
                                                                            docs: {},
                                                                            df: 0,
                                                                            o: {
                                                                                docs: {},
                                                                                df: 0,
                                                                                r: {
                                                                                    docs: {
                                                                                        "run.load_api_key": { tf: 1 },
                                                                                    },
                                                                                    df: 1,
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            s: {
                                docs: {},
                                df: 0,
                                u: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                        docs: {},
                                        df: 0,
                                        e: {
                                            docs: {
                                                "run.initialize_database": { tf: 1.4142135623730951 },
                                                "run.main": { tf: 1 },
                                            },
                                            df: 2,
                                        },
                                    },
                                },
                            },
                            t: {
                                docs: {},
                                df: 0,
                                i: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                        docs: {},
                                        df: 0,
                                        e: {
                                            docs: {
                                                "run.export_database_to_markdown": { tf: 1 },
                                                "run.run_chat": { tf: 1 },
                                            },
                                            df: 2,
                                        },
                                    },
                                },
                                r: { docs: {}, df: 0, y: { docs: { "run.main": { tf: 1 } }, df: 1 } },
                                e: { docs: {}, df: 0, r: { docs: { "run.main": { tf: 1 } }, df: 1 } },
                            },
                            d: { docs: { "run.run_chat": { tf: 1 } }, df: 1 },
                        },
                        m: {
                            docs: {},
                            df: 0,
                            p: {
                                docs: {},
                                df: 0,
                                t: { docs: {}, df: 0, y: { docs: { "run.load_api_key": { tf: 1 } }, df: 1 } },
                            },
                        },
                        x: {
                            docs: {},
                            df: 0,
                            i: {
                                docs: {},
                                df: 0,
                                s: {
                                    docs: {},
                                    df: 0,
                                    t: {
                                        docs: {
                                            "run.ensure_database_directory": { tf: 1.4142135623730951 },
                                            "run.export_database_to_markdown": { tf: 1 },
                                            "run.print_history": { tf: 1 },
                                        },
                                        df: 3,
                                        s: {
                                            docs: {
                                                "run.initialize_database": { tf: 1.4142135623730951 },
                                                "run.main": { tf: 1 },
                                            },
                                            df: 2,
                                        },
                                        i: {
                                            docs: {},
                                            df: 0,
                                            n: { docs: {}, df: 0, g: { docs: { "run.main": { tf: 1 } }, df: 1 } },
                                        },
                                    },
                                },
                                t: {
                                    docs: { "run.run_chat": { tf: 1.7320508075688772 } },
                                    df: 1,
                                    s: { docs: { "run.run_chat": { tf: 1 } }, df: 1 },
                                },
                            },
                            c: {
                                docs: {},
                                df: 0,
                                h: {
                                    docs: {},
                                    df: 0,
                                    a: {
                                        docs: {},
                                        df: 0,
                                        n: {
                                            docs: {},
                                            df: 0,
                                            g: {
                                                docs: {},
                                                df: 0,
                                                e: {
                                                    docs: { "run.save_message": { tf: 1 } },
                                                    df: 1,
                                                    s: { docs: { "run.start_chat_session": { tf: 1 } }, df: 1 },
                                                },
                                            },
                                        },
                                    },
                                },
                                e: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        d: {
                                            docs: {},
                                            df: 0,
                                            e: { docs: {}, df: 0, d: { docs: { "run.run_chat": { tf: 1 } }, df: 1 } },
                                        },
                                    },
                                    p: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                            docs: {},
                                            df: 0,
                                            i: {
                                                docs: {},
                                                df: 0,
                                                o: {
                                                    docs: {},
                                                    df: 0,
                                                    n: { docs: { "run.run_chat": { tf: 1 } }, df: 1 },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            p: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    c: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                            docs: {},
                                            df: 0,
                                            e: {
                                                docs: {},
                                                df: 0,
                                                d: { docs: { "run.save_message": { tf: 1 } }, df: 1 },
                                            },
                                            s: { docs: { "run.build_gemini_history": { tf: 1 } }, df: 1 },
                                        },
                                    },
                                },
                                o: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                            docs: {
                                                "run.export_database_to_markdown": { tf: 1.4142135623730951 },
                                                "run.run_chat": { tf: 1.4142135623730951 },
                                            },
                                            df: 2,
                                            s: {
                                                docs: {
                                                    "run.export_database_to_markdown": { tf: 1 },
                                                    "run.run_chat": { tf: 1 },
                                                },
                                                df: 2,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        v: {
                            docs: {},
                            df: 0,
                            e: {
                                docs: {},
                                df: 0,
                                n: { docs: { "run.ensure_database_directory": { tf: 1 } }, df: 1 },
                                r: {
                                    docs: {},
                                    df: 0,
                                    y: {
                                        docs: {
                                            "run.initialize_database": { tf: 1 },
                                            "run.get_session_history": { tf: 1 },
                                            "run.export_database_to_markdown": { tf: 1 },
                                            "run.run_chat": { tf: 1.4142135623730951 },
                                        },
                                        df: 4,
                                    },
                                },
                            },
                        },
                        i: {
                            docs: {},
                            df: 0,
                            t: {
                                docs: {},
                                df: 0,
                                h: {
                                    docs: {},
                                    df: 0,
                                    e: { docs: {}, df: 0, r: { docs: { "run.save_message": { tf: 1 } }, df: 1 } },
                                },
                            },
                        },
                        a: {
                            docs: {},
                            df: 0,
                            c: {
                                docs: {},
                                df: 0,
                                h: {
                                    docs: {
                                        "run.get_session_history": { tf: 1 },
                                        "run.get_all_sessions": { tf: 1 },
                                        "run.build_gemini_history": { tf: 1 },
                                        "run.print_history": { tf: 1 },
                                    },
                                    df: 4,
                                },
                            },
                        },
                        l: {
                            docs: {},
                            df: 0,
                            e: {
                                docs: {},
                                df: 0,
                                m: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        n: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                                docs: {},
                                                df: 0,
                                                s: { docs: { "run.build_gemini_history": { tf: 1 } }, df: 1 },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        r: {
                            docs: {},
                            df: 0,
                            r: {
                                docs: {},
                                df: 0,
                                o: {
                                    docs: {},
                                    df: 0,
                                    r: { docs: { "run.run_chat": { tf: 1.7320508075688772 } }, df: 1 },
                                },
                            },
                        },
                        o: {
                            docs: {},
                            df: 0,
                            f: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                        docs: {},
                                        df: 0,
                                        r: {
                                            docs: {},
                                            df: 0,
                                            o: { docs: {}, df: 0, r: { docs: { "run.run_chat": { tf: 1 } }, df: 1 } },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    r: {
                        docs: {},
                        df: 0,
                        e: {
                            docs: {},
                            df: 0,
                            a: {
                                docs: {},
                                df: 0,
                                d: {
                                    docs: { "run.load_api_key": { tf: 1 } },
                                    df: 1,
                                    s: { docs: { "run.load_api_key": { tf: 1 }, "run.run_chat": { tf: 1 } }, df: 2 },
                                    a: {
                                        docs: {},
                                        df: 0,
                                        b: {
                                            docs: {},
                                            df: 0,
                                            l: {
                                                docs: {},
                                                df: 0,
                                                e: {
                                                    docs: {
                                                        "run.export_database_to_markdown": { tf: 1 },
                                                        "run.print_history": { tf: 1 },
                                                    },
                                                    df: 2,
                                                },
                                            },
                                        },
                                    },
                                    y: {
                                        docs: {
                                            "run.build_gemini_history": { tf: 1 },
                                            "run.start_chat_session": { tf: 1 },
                                        },
                                        df: 2,
                                    },
                                },
                            },
                            t: {
                                docs: {},
                                df: 0,
                                r: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                        docs: {},
                                        df: 0,
                                        e: {
                                            docs: {},
                                            df: 0,
                                            v: {
                                                docs: {},
                                                df: 0,
                                                e: {
                                                    docs: {
                                                        "run.get_session_history": { tf: 1 },
                                                        "run.get_all_sessions": { tf: 1 },
                                                    },
                                                    df: 2,
                                                    s: {
                                                        docs: {
                                                            "run.load_api_key": { tf: 1 },
                                                            "run.print_history": { tf: 1 },
                                                        },
                                                        df: 2,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    y: { docs: { "run.run_chat": { tf: 1 } }, df: 1 },
                                },
                                u: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                        docs: {},
                                        df: 0,
                                        n: {
                                            docs: { "run.get_connection": { tf: 1 } },
                                            df: 1,
                                            s: {
                                                docs: {
                                                    "run.load_api_key": { tf: 1 },
                                                    "run.get_connection": { tf: 1 },
                                                    "run.create_session": { tf: 1 },
                                                    "run.get_session_history": { tf: 1 },
                                                    "run.get_all_sessions": { tf: 1 },
                                                    "run.export_database_to_markdown": { tf: 1 },
                                                    "run.build_gemini_history": { tf: 1 },
                                                    "run.start_chat_session": { tf: 1 },
                                                },
                                                df: 8,
                                            },
                                            i: {
                                                docs: {},
                                                df: 0,
                                                n: {
                                                    docs: {},
                                                    df: 0,
                                                    g: { docs: { "run.get_session_history": { tf: 1 } }, df: 1 },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            s: {
                                docs: {},
                                df: 0,
                                u: {
                                    docs: {},
                                    df: 0,
                                    l: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                            docs: { "run.export_database_to_markdown": { tf: 1 } },
                                            df: 1,
                                            s: {
                                                docs: {
                                                    "run.get_connection": { tf: 1 },
                                                    "run.get_session_history": { tf: 1 },
                                                },
                                                df: 2,
                                            },
                                        },
                                    },
                                },
                                p: {
                                    docs: {},
                                    df: 0,
                                    o: {
                                        docs: {},
                                        df: 0,
                                        n: {
                                            docs: {},
                                            df: 0,
                                            s: {
                                                docs: {},
                                                df: 0,
                                                e: {
                                                    docs: { "run.save_message": { tf: 1 } },
                                                    df: 1,
                                                    s: {
                                                        docs: {
                                                            "run.start_chat_session": { tf: 1 },
                                                            "run.print_history": { tf: 1 },
                                                        },
                                                        df: 2,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                                o: {
                                    docs: {},
                                    df: 0,
                                    u: {
                                        docs: {},
                                        df: 0,
                                        r: {
                                            docs: {},
                                            df: 0,
                                            c: {
                                                docs: {},
                                                df: 0,
                                                e: {
                                                    docs: {},
                                                    df: 0,
                                                    e: {
                                                        docs: {},
                                                        df: 0,
                                                        x: {
                                                            docs: {},
                                                            df: 0,
                                                            h: {
                                                                docs: {},
                                                                df: 0,
                                                                a: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    u: {
                                                                        docs: {},
                                                                        df: 0,
                                                                        s: {
                                                                            docs: {},
                                                                            df: 0,
                                                                            t: {
                                                                                docs: {},
                                                                                df: 0,
                                                                                e: {
                                                                                    docs: {},
                                                                                    df: 0,
                                                                                    d: {
                                                                                        docs: {
                                                                                            "run.run_chat": { tf: 1 },
                                                                                        },
                                                                                        df: 1,
                                                                                    },
                                                                                },
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            c: {
                                docs: {},
                                df: 0,
                                o: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                        docs: {},
                                        df: 0,
                                        d: {
                                            docs: { "run.create_session": { tf: 1 }, "run.main": { tf: 1 } },
                                            df: 2,
                                            s: {
                                                docs: {
                                                    "run.create_session": { tf: 1 },
                                                    "run.build_gemini_history": { tf: 1 },
                                                },
                                                df: 2,
                                            },
                                        },
                                    },
                                },
                                e: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                        docs: {},
                                        df: 0,
                                        v: {
                                            docs: {},
                                            df: 0,
                                            i: {
                                                docs: {},
                                                df: 0,
                                                n: {
                                                    docs: {},
                                                    df: 0,
                                                    g: {
                                                        docs: {
                                                            "run.save_message": { tf: 1 },
                                                            "run.run_chat": { tf: 1 },
                                                        },
                                                        df: 2,
                                                    },
                                                },
                                            },
                                            e: { docs: { "run.start_chat_session": { tf: 1 } }, df: 1 },
                                        },
                                    },
                                },
                            },
                            q: {
                                docs: {},
                                df: 0,
                                u: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        s: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                                docs: {},
                                                df: 0,
                                                e: {
                                                    docs: {},
                                                    df: 0,
                                                    d: { docs: { "run.get_session_history": { tf: 1 } }, df: 1 },
                                                },
                                            },
                                        },
                                    },
                                    i: {
                                        docs: {},
                                        df: 0,
                                        r: {
                                            docs: {},
                                            df: 0,
                                            e: {
                                                docs: {},
                                                df: 0,
                                                d: { docs: { "run.build_gemini_history": { tf: 1 } }, df: 1 },
                                            },
                                        },
                                    },
                                },
                            },
                            p: {
                                docs: {},
                                df: 0,
                                l: {
                                    docs: {},
                                    df: 0,
                                    y: { docs: { "run.run_chat": { tf: 1.4142135623730951 } }, df: 1 },
                                },
                            },
                        },
                        o: {
                            docs: {},
                            df: 0,
                            o: {
                                docs: {},
                                df: 0,
                                t: {
                                    docs: {
                                        "run.load_api_key": { tf: 1 },
                                        "run.export_database_to_markdown": { tf: 1 },
                                    },
                                    df: 2,
                                },
                            },
                            w: {
                                docs: {
                                    "run.get_connection": { tf: 1.4142135623730951 },
                                    "run.initialize_database": { tf: 1.4142135623730951 },
                                    "run.save_message": { tf: 1 },
                                    "run.get_session_history": { tf: 1 },
                                },
                                df: 4,
                            },
                            l: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {
                                        "run.save_message": { tf: 1 },
                                        "run.get_session_history": { tf: 1 },
                                        "run.build_gemini_history": { tf: 1 },
                                    },
                                    df: 3,
                                },
                            },
                        },
                        a: {
                            docs: {},
                            df: 0,
                            i: {
                                docs: {},
                                df: 0,
                                s: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        s: { docs: { "run.load_api_key": { tf: 1 } }, df: 1 },
                                        d: { docs: { "run.run_chat": { tf: 1 } }, df: 1 },
                                    },
                                },
                            },
                            t: { docs: {}, df: 0, e: { docs: { "run.run_chat": { tf: 1 } }, df: 1 } },
                            w: { docs: { "run.run_chat": { tf: 1 } }, df: 1 },
                        },
                        u: { docs: {}, df: 0, n: { docs: { "run.run_chat": { tf: 1 } }, df: 1 } },
                    },
                    p: {
                        docs: {},
                        df: 0,
                        r: {
                            docs: {},
                            df: 0,
                            o: {
                                docs: {},
                                df: 0,
                                j: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        c: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                                docs: {
                                                    "run.load_api_key": { tf: 1 },
                                                    "run.export_database_to_markdown": { tf: 1 },
                                                },
                                                df: 2,
                                            },
                                        },
                                    },
                                },
                            },
                            e: {
                                docs: { "run.start_chat_session": { tf: 1 }, "run.main": { tf: 1 } },
                                df: 2,
                                s: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        n: {
                                            docs: {},
                                            df: 0,
                                            t: { docs: { "run.initialize_database": { tf: 1 } }, df: 1 },
                                        },
                                        r: {
                                            docs: {},
                                            df: 0,
                                            v: {
                                                docs: {},
                                                df: 0,
                                                e: {
                                                    docs: {},
                                                    df: 0,
                                                    d: { docs: { "run.get_session_history": { tf: 1 } }, df: 1 },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            i: {
                                docs: {},
                                df: 0,
                                m: {
                                    docs: {},
                                    df: 0,
                                    a: {
                                        docs: {},
                                        df: 0,
                                        r: {
                                            docs: {},
                                            df: 0,
                                            y: {
                                                docs: {
                                                    "run.initialize_database": { tf: 1 },
                                                    "run.get_session_history": { tf: 1 },
                                                },
                                                df: 2,
                                            },
                                        },
                                    },
                                },
                                o: { docs: {}, df: 0, r: { docs: { "run.start_chat_session": { tf: 1 } }, df: 1 } },
                                n: {
                                    docs: {},
                                    df: 0,
                                    t: {
                                        docs: {
                                            "run.print_banner": { tf: 1 },
                                            "run.print_history": { tf: 1 },
                                            "run.run_chat": { tf: 1 },
                                            "run.main": { tf: 1 },
                                        },
                                        df: 4,
                                        s: {
                                            docs: { "run.print_history": { tf: 1 }, "run.run_chat": { tf: 2 } },
                                            df: 2,
                                        },
                                        e: { docs: {}, df: 0, d: { docs: { "run.print_history": { tf: 1 } }, df: 1 } },
                                    },
                                },
                            },
                        },
                        y: {
                            docs: {},
                            df: 0,
                            t: {
                                docs: {},
                                df: 0,
                                h: {
                                    docs: {},
                                    df: 0,
                                    o: { docs: {}, df: 0, n: { docs: { "run.load_api_key": { tf: 1 } }, df: 1 } },
                                },
                            },
                        },
                        a: {
                            docs: {},
                            df: 0,
                            t: {
                                docs: {},
                                df: 0,
                                h: {
                                    docs: {
                                        "run.ensure_database_directory": { tf: 1 },
                                        "run.get_connection": { tf: 1 },
                                        "run.export_database_to_markdown": { tf: 1 },
                                    },
                                    df: 3,
                                    l: {
                                        docs: {},
                                        df: 0,
                                        i: {
                                            docs: {},
                                            df: 0,
                                            b: {
                                                docs: {
                                                    "run.ensure_database_directory": { tf: 1 },
                                                    "run.export_database_to_markdown": { tf: 1 },
                                                },
                                                df: 2,
                                            },
                                        },
                                    },
                                },
                            },
                            r: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                            docs: {
                                                "run.ensure_database_directory": { tf: 1 },
                                                "run.initialize_database": { tf: 1 },
                                            },
                                            df: 2,
                                            s: { docs: { "run.ensure_database_directory": { tf: 1 } }, df: 1 },
                                        },
                                    },
                                },
                                t: { docs: {}, df: 0, s: { docs: { "run.build_gemini_history": { tf: 1 } }, df: 1 } },
                            },
                            s: {
                                docs: {},
                                df: 0,
                                s: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        d: { docs: { "run.build_gemini_history": { tf: 1 } }, df: 1 },
                                        s: { docs: { "run.start_chat_session": { tf: 1 } }, df: 1 },
                                    },
                                },
                            },
                        },
                        o: {
                            docs: {},
                            df: 0,
                            i: {
                                docs: {},
                                df: 0,
                                n: {
                                    docs: {},
                                    df: 0,
                                    t: {
                                        docs: { "run.main": { tf: 1 } },
                                        df: 1,
                                        e: { docs: {}, df: 0, d: { docs: { "run.get_connection": { tf: 1 } }, df: 1 } },
                                    },
                                },
                            },
                        },
                        e: {
                            docs: {},
                            df: 0,
                            r: {
                                docs: {
                                    "run.initialize_database": { tf: 1.4142135623730951 },
                                    "run.save_message": { tf: 1 },
                                    "run.run_chat": { tf: 1 },
                                },
                                df: 3,
                                s: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                        docs: {},
                                        df: 0,
                                        s: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                                docs: { "run.save_message": { tf: 1 }, "run.run_chat": { tf: 1 } },
                                                df: 2,
                                                e: {
                                                    docs: {},
                                                    df: 0,
                                                    d: { docs: { "run.start_chat_session": { tf: 1 } }, df: 1 },
                                                },
                                                s: { docs: { "run.run_chat": { tf: 1.4142135623730951 } }, df: 1 },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    u: {
                        docs: {},
                        df: 0,
                        s: {
                            docs: {},
                            df: 0,
                            i: {
                                docs: {},
                                df: 0,
                                n: { docs: {}, df: 0, g: { docs: { "run.load_api_key": { tf: 1 } }, df: 1 } },
                            },
                            e: {
                                docs: { "run.initialize_database": { tf: 1 } },
                                df: 1,
                                s: {
                                    docs: {
                                        "run.ensure_database_directory": { tf: 1 },
                                        "run.get_connection": { tf: 1 },
                                        "run.export_database_to_markdown": { tf: 1 },
                                    },
                                    df: 3,
                                },
                                r: {
                                    docs: {
                                        "run.initialize_database": { tf: 1 },
                                        "run.save_message": { tf: 1.4142135623730951 },
                                        "run.print_history": { tf: 1 },
                                        "run.run_chat": { tf: 2.23606797749979 },
                                    },
                                    df: 4,
                                },
                                d: { docs: { "run.run_chat": { tf: 1 } }, df: 1 },
                            },
                        },
                        u: {
                            docs: {},
                            df: 0,
                            i: {
                                docs: {},
                                df: 0,
                                d: {
                                    docs: {
                                        "run.initialize_database": { tf: 1 },
                                        "run.create_session": { tf: 1.4142135623730951 },
                                        "run.save_message": { tf: 1 },
                                        "run.get_session_history": { tf: 1 },
                                        "run.build_gemini_history": { tf: 1 },
                                        "run.start_chat_session": { tf: 1 },
                                        "run.print_history": { tf: 1 },
                                        "run.run_chat": { tf: 1 },
                                    },
                                    df: 8,
                                },
                            },
                        },
                        n: {
                            docs: {},
                            df: 0,
                            i: {
                                docs: {},
                                df: 0,
                                q: {
                                    docs: {},
                                    df: 0,
                                    u: {
                                        docs: {},
                                        df: 0,
                                        e: {
                                            docs: {},
                                            df: 0,
                                            l: {
                                                docs: {},
                                                df: 0,
                                                y: { docs: { "run.create_session": { tf: 1 } }, df: 1 },
                                            },
                                        },
                                    },
                                },
                            },
                            t: {
                                docs: {},
                                df: 0,
                                i: { docs: {}, df: 0, l: { docs: { "run.run_chat": { tf: 1 } }, df: 1 } },
                            },
                            e: {
                                docs: {},
                                df: 0,
                                x: {
                                    docs: {},
                                    df: 0,
                                    p: {
                                        docs: {},
                                        df: 0,
                                        e: {
                                            docs: {},
                                            df: 0,
                                            c: {
                                                docs: {},
                                                df: 0,
                                                t: {
                                                    docs: {},
                                                    df: 0,
                                                    e: {
                                                        docs: {},
                                                        df: 0,
                                                        d: { docs: { "run.run_chat": { tf: 1 } }, df: 1 },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        t: {
                            docs: {},
                            df: 0,
                            c: {
                                docs: {
                                    "run.create_session": { tf: 1 },
                                    "run.save_message": { tf: 1 },
                                    "run.export_database_to_markdown": { tf: 1 },
                                    "run.print_history": { tf: 1 },
                                },
                                df: 4,
                            },
                        },
                    },
                    d: {
                        docs: {},
                        df: 0,
                        o: {
                            docs: {},
                            df: 0,
                            t: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    n: { docs: {}, df: 0, v: { docs: { "run.load_api_key": { tf: 1 } }, df: 1 } },
                                },
                            },
                            e: {
                                docs: {},
                                df: 0,
                                s: {
                                    docs: {
                                        "run.ensure_database_directory": { tf: 1 },
                                        "run.export_database_to_markdown": { tf: 1 },
                                        "run.run_chat": { tf: 1 },
                                    },
                                    df: 3,
                                },
                            },
                            c: {
                                docs: {},
                                df: 0,
                                u: {
                                    docs: {},
                                    df: 0,
                                    m: {
                                        docs: {},
                                        df: 0,
                                        e: {
                                            docs: {},
                                            df: 0,
                                            n: {
                                                docs: {},
                                                df: 0,
                                                t: { docs: { "run.export_database_to_markdown": { tf: 1 } }, df: 1 },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        a: {
                            docs: {},
                            df: 0,
                            t: {
                                docs: {},
                                df: 0,
                                a: {
                                    docs: { "run.initialize_database": { tf: 1 } },
                                    df: 1,
                                    b: {
                                        docs: {},
                                        df: 0,
                                        a: {
                                            docs: {},
                                            df: 0,
                                            s: {
                                                docs: {},
                                                df: 0,
                                                e: {
                                                    docs: {
                                                        "run.ensure_database_directory": { tf: 1 },
                                                        "run.get_connection": { tf: 1.4142135623730951 },
                                                        "run.initialize_database": { tf: 1.7320508075688772 },
                                                        "run.create_session": { tf: 1 },
                                                        "run.save_message": { tf: 1 },
                                                        "run.get_all_sessions": { tf: 1 },
                                                        "run.export_database_to_markdown": { tf: 1 },
                                                        "run.build_gemini_history": { tf: 1 },
                                                        "run.start_chat_session": { tf: 1 },
                                                        "run.run_chat": { tf: 1 },
                                                        "run.main": { tf: 1.4142135623730951 },
                                                    },
                                                    df: 11,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        i: {
                            docs: {},
                            df: 0,
                            r: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    c: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                            docs: {},
                                            df: 0,
                                            o: {
                                                docs: {},
                                                df: 0,
                                                r: {
                                                    docs: {},
                                                    df: 0,
                                                    y: {
                                                        docs: {
                                                            "run.ensure_database_directory": { tf: 1 },
                                                            "run.initialize_database": { tf: 1.4142135623730951 },
                                                            "run.export_database_to_markdown": {
                                                                tf: 1.4142135623730951,
                                                            },
                                                            "run.run_chat": { tf: 1 },
                                                        },
                                                        df: 4,
                                                    },
                                                    i: {
                                                        docs: {},
                                                        df: 0,
                                                        e: {
                                                            docs: {},
                                                            df: 0,
                                                            s: {
                                                                docs: { "run.ensure_database_directory": { tf: 1 } },
                                                                df: 1,
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            c: {
                                docs: {},
                                df: 0,
                                t: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                        docs: {},
                                        df: 0,
                                        o: {
                                            docs: {},
                                            df: 0,
                                            n: {
                                                docs: {},
                                                df: 0,
                                                a: {
                                                    docs: {},
                                                    df: 0,
                                                    r: {
                                                        docs: {},
                                                        df: 0,
                                                        i: {
                                                            docs: {},
                                                            df: 0,
                                                            e: {
                                                                docs: {},
                                                                df: 0,
                                                                s: {
                                                                    docs: {
                                                                        "run.get_session_history": { tf: 1 },
                                                                        "run.get_all_sessions": { tf: 1 },
                                                                        "run.build_gemini_history": { tf: 1 },
                                                                    },
                                                                    df: 3,
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    s: { docs: { "run.build_gemini_history": { tf: 1 } }, df: 1 },
                                },
                            },
                            s: {
                                docs: {},
                                df: 0,
                                p: {
                                    docs: {},
                                    df: 0,
                                    l: {
                                        docs: {},
                                        df: 0,
                                        a: {
                                            docs: {},
                                            df: 0,
                                            y: {
                                                docs: {},
                                                df: 0,
                                                e: {
                                                    docs: {},
                                                    df: 0,
                                                    d: { docs: { "run.print_history": { tf: 1 } }, df: 1 },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    v: {
                        4: { docs: { "run.create_session": { tf: 1 } }, df: 1 },
                        docs: {},
                        df: 0,
                        a: {
                            docs: {},
                            df: 0,
                            l: {
                                docs: {},
                                df: 0,
                                u: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: { "run.load_api_key": { tf: 1 } },
                                        df: 1,
                                        s: { docs: { "run.save_message": { tf: 1 } }, df: 1 },
                                    },
                                },
                            },
                            r: {
                                docs: {},
                                df: 0,
                                i: {
                                    docs: {},
                                    df: 0,
                                    a: {
                                        docs: {},
                                        df: 0,
                                        b: {
                                            docs: {},
                                            df: 0,
                                            l: {
                                                docs: {},
                                                df: 0,
                                                e: { docs: { "run.load_api_key": { tf: 1 } }, df: 1 },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        i: { docs: {}, df: 0, a: { docs: { "run.initialize_database": { tf: 1 } }, df: 1 } },
                    },
                    o: {
                        docs: {},
                        df: 0,
                        f: {
                            docs: {
                                "run.load_api_key": { tf: 1 },
                                "run.create_session": { tf: 1 },
                                "run.save_message": { tf: 1.7320508075688772 },
                                "run.get_session_history": { tf: 1.7320508075688772 },
                                "run.get_all_sessions": { tf: 1 },
                                "run.export_database_to_markdown": { tf: 1 },
                                "run.build_gemini_history": { tf: 1.7320508075688772 },
                                "run.start_chat_session": { tf: 1.4142135623730951 },
                                "run.print_banner": { tf: 1 },
                                "run.print_history": { tf: 1.4142135623730951 },
                                "run.run_chat": { tf: 1 },
                            },
                            df: 11,
                        },
                        r: {
                            docs: {
                                "run.load_api_key": { tf: 1 },
                                "run.initialize_database": { tf: 1 },
                                "run.save_message": { tf: 1 },
                                "run.run_chat": { tf: 1.7320508075688772 },
                            },
                            df: 4,
                            d: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                        docs: { "run.get_session_history": { tf: 1 } },
                                        df: 1,
                                        e: {
                                            docs: {},
                                            df: 0,
                                            d: {
                                                docs: {
                                                    "run.get_session_history": { tf: 1 },
                                                    "run.get_all_sessions": { tf: 1.4142135623730951 },
                                                },
                                                df: 2,
                                            },
                                        },
                                    },
                                },
                            },
                            c: {
                                docs: {},
                                df: 0,
                                h: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        s: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                                docs: {},
                                                df: 0,
                                                r: {
                                                    docs: {},
                                                    df: 0,
                                                    a: {
                                                        docs: {},
                                                        df: 0,
                                                        t: {
                                                            docs: {},
                                                            df: 0,
                                                            e: {
                                                                docs: {},
                                                                df: 0,
                                                                s: { docs: { "run.main": { tf: 1 } }, df: 1 },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        k: { docs: { "run.ensure_database_directory": { tf: 1 } }, df: 1 },
                        p: {
                            docs: {},
                            df: 0,
                            e: {
                                docs: {},
                                df: 0,
                                n: {
                                    docs: {
                                        "run.get_connection": { tf: 1.4142135623730951 },
                                        "run.initialize_database": { tf: 1 },
                                    },
                                    df: 2,
                                },
                            },
                        },
                        n: {
                            docs: { "run.initialize_database": { tf: 1.4142135623730951 } },
                            df: 1,
                            e: {
                                docs: {
                                    "run.initialize_database": { tf: 1.4142135623730951 },
                                    "run.get_session_history": { tf: 1 },
                                    "run.get_all_sessions": { tf: 1 },
                                    "run.print_history": { tf: 1 },
                                },
                                df: 4,
                            },
                            c: {
                                docs: {},
                                df: 0,
                                e: { docs: { "run.save_message": { tf: 1.4142135623730951 } }, df: 1 },
                            },
                        },
                        l: {
                            docs: {},
                            df: 0,
                            d: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    s: { docs: {}, df: 0, t: { docs: { "run.get_all_sessions": { tf: 1 } }, df: 1 } },
                                },
                            },
                        },
                        v: {
                            docs: {},
                            df: 0,
                            e: {
                                docs: {},
                                df: 0,
                                r: { docs: { "run.export_database_to_markdown": { tf: 1 } }, df: 1 },
                            },
                        },
                        u: {
                            docs: {},
                            df: 0,
                            t: {
                                docs: {},
                                df: 0,
                                p: {
                                    docs: {},
                                    df: 0,
                                    u: {
                                        docs: {},
                                        df: 0,
                                        t: { docs: { "run.export_database_to_markdown": { tf: 1 } }, df: 1 },
                                    },
                                },
                            },
                        },
                        b: {
                            docs: {},
                            df: 0,
                            j: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    c: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                            docs: {
                                                "run.build_gemini_history": { tf: 1 },
                                                "run.start_chat_session": { tf: 1 },
                                            },
                                            df: 2,
                                            s: {
                                                docs: { "run.build_gemini_history": { tf: 1.4142135623730951 } },
                                                df: 1,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        t: {
                            docs: {},
                            df: 0,
                            h: {
                                docs: {},
                                df: 0,
                                e: { docs: {}, df: 0, r: { docs: { "run.run_chat": { tf: 1 } }, df: 1 } },
                            },
                        },
                    },
                    s: {
                        docs: {},
                        df: 0,
                        t: {
                            docs: {},
                            df: 0,
                            r: {
                                docs: {},
                                df: 0,
                                i: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                        docs: {},
                                        df: 0,
                                        g: {
                                            docs: { "run.load_api_key": { tf: 1 }, "run.create_session": { tf: 1 } },
                                            df: 2,
                                        },
                                    },
                                },
                                u: {
                                    docs: {},
                                    df: 0,
                                    c: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                            docs: {},
                                            df: 0,
                                            u: {
                                                docs: {},
                                                df: 0,
                                                r: {
                                                    docs: {},
                                                    df: 0,
                                                    e: { docs: { "run.build_gemini_history": { tf: 1 } }, df: 1 },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            a: {
                                docs: {},
                                df: 0,
                                t: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        m: {
                                            docs: {},
                                            df: 0,
                                            e: {
                                                docs: {},
                                                df: 0,
                                                n: {
                                                    docs: {},
                                                    df: 0,
                                                    t: {
                                                        docs: {},
                                                        df: 0,
                                                        s: { docs: { "run.initialize_database": { tf: 1 } }, df: 1 },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                                r: {
                                    docs: {},
                                    df: 0,
                                    t: {
                                        docs: { "run.main": { tf: 1 } },
                                        df: 1,
                                        u: {
                                            docs: {},
                                            df: 0,
                                            p: {
                                                docs: { "run.initialize_database": { tf: 1 }, "run.main": { tf: 1 } },
                                                df: 2,
                                            },
                                        },
                                    },
                                },
                            },
                            o: {
                                docs: {},
                                df: 0,
                                r: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        d: {
                                            docs: {
                                                "run.get_all_sessions": { tf: 1 },
                                                "run.build_gemini_history": { tf: 1 },
                                                "run.start_chat_session": { tf: 1 },
                                                "run.print_history": { tf: 1 },
                                            },
                                            df: 4,
                                        },
                                    },
                                },
                            },
                            d: {
                                docs: {},
                                df: 0,
                                o: {
                                    docs: {},
                                    df: 0,
                                    u: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                            docs: { "run.print_history": { tf: 1 }, "run.run_chat": { tf: 1 } },
                                            df: 2,
                                        },
                                    },
                                },
                                i: { docs: {}, df: 0, n: { docs: { "run.run_chat": { tf: 1 } }, df: 1 } },
                            },
                        },
                        e: {
                            docs: {},
                            df: 0,
                            t: { docs: { "run.load_api_key": { tf: 1 } }, df: 1 },
                            s: {
                                docs: {},
                                df: 0,
                                s: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                        docs: {},
                                        df: 0,
                                        o: {
                                            docs: {},
                                            df: 0,
                                            n: {
                                                docs: {
                                                    "run.initialize_database": { tf: 1.7320508075688772 },
                                                    "run.create_session": { tf: 1.7320508075688772 },
                                                    "run.save_message": { tf: 1.4142135623730951 },
                                                    "run.get_session_history": { tf: 2 },
                                                    "run.get_all_sessions": { tf: 1 },
                                                    "run.export_database_to_markdown": { tf: 1 },
                                                    "run.build_gemini_history": { tf: 1.4142135623730951 },
                                                    "run.start_chat_session": { tf: 1.7320508075688772 },
                                                    "run.print_history": { tf: 2 },
                                                    "run.run_chat": { tf: 2.449489742783178 },
                                                    "run.main": { tf: 1.4142135623730951 },
                                                },
                                                df: 11,
                                                s: {
                                                    docs: {
                                                        "run.initialize_database": { tf: 1 },
                                                        "run.get_all_sessions": { tf: 1 },
                                                    },
                                                    df: 2,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            n: {
                                docs: {},
                                df: 0,
                                d: {
                                    docs: { "run.start_chat_session": { tf: 1 } },
                                    df: 1,
                                    i: {
                                        docs: {},
                                        df: 0,
                                        n: {
                                            docs: {},
                                            df: 0,
                                            g: {
                                                docs: { "run.save_message": { tf: 1 }, "run.run_chat": { tf: 1 } },
                                                df: 2,
                                            },
                                        },
                                    },
                                },
                            },
                            q: {
                                docs: {},
                                df: 0,
                                u: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        n: {
                                            docs: {},
                                            df: 0,
                                            c: {
                                                docs: {},
                                                df: 0,
                                                e: {
                                                    docs: {
                                                        "run.get_session_history": { tf: 1 },
                                                        "run.main": { tf: 1 },
                                                    },
                                                    df: 2,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        o: {
                            docs: {
                                "run.ensure_database_directory": { tf: 1 },
                                "run.get_connection": { tf: 1 },
                                "run.initialize_database": { tf: 1 },
                                "run.get_session_history": { tf: 1 },
                                "run.export_database_to_markdown": { tf: 1 },
                                "run.start_chat_session": { tf: 1 },
                                "run.run_chat": { tf: 1 },
                            },
                            df: 7,
                            r: {
                                docs: {},
                                df: 0,
                                t: { docs: { "run.export_database_to_markdown": { tf: 1 } }, df: 1 },
                            },
                        },
                        a: {
                            docs: {},
                            df: 0,
                            f: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {
                                        "run.ensure_database_directory": { tf: 1 },
                                        "run.initialize_database": { tf: 1 },
                                    },
                                    df: 2,
                                },
                            },
                        },
                        q: {
                            docs: {},
                            df: 0,
                            l: {
                                docs: {},
                                df: 0,
                                i: {
                                    docs: {},
                                    df: 0,
                                    t: {
                                        docs: {},
                                        df: 0,
                                        e: {
                                            3: { docs: { "run.get_connection": { tf: 1.4142135623730951 } }, df: 1 },
                                            docs: { "run.get_connection": { tf: 1 }, "run.main": { tf: 1 } },
                                            df: 2,
                                        },
                                    },
                                },
                            },
                        },
                        c: {
                            docs: {},
                            df: 0,
                            h: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    m: {
                                        docs: {},
                                        df: 0,
                                        a: {
                                            docs: { "run.initialize_database": { tf: 1 }, "run.main": { tf: 1 } },
                                            df: 2,
                                        },
                                    },
                                },
                            },
                        },
                        i: {
                            docs: {},
                            df: 0,
                            n: {
                                docs: {},
                                df: 0,
                                g: {
                                    docs: {},
                                    df: 0,
                                    l: {
                                        docs: {},
                                        df: 0,
                                        e: {
                                            docs: { "run.save_message": { tf: 1 }, "run.run_chat": { tf: 1 } },
                                            df: 2,
                                        },
                                    },
                                },
                            },
                        },
                        d: {
                            docs: {},
                            df: 0,
                            k: {
                                docs: {
                                    "run.save_message": { tf: 1 },
                                    "run.build_gemini_history": { tf: 1.7320508075688772 },
                                    "run.start_chat_session": { tf: 1 },
                                },
                                df: 3,
                            },
                        },
                        u: {
                            docs: {},
                            df: 0,
                            p: {
                                docs: {},
                                df: 0,
                                p: {
                                    docs: {},
                                    df: 0,
                                    l: {
                                        docs: {},
                                        df: 0,
                                        i: {
                                            docs: {},
                                            df: 0,
                                            e: {
                                                docs: {},
                                                df: 0,
                                                d: { docs: { "run.get_session_history": { tf: 1 } }, df: 1 },
                                            },
                                        },
                                    },
                                },
                            },
                            b: {
                                docs: {},
                                df: 0,
                                c: {
                                    docs: {},
                                    df: 0,
                                    l: {
                                        docs: {},
                                        df: 0,
                                        a: {
                                            docs: {},
                                            df: 0,
                                            s: {
                                                docs: {},
                                                df: 0,
                                                s: {
                                                    docs: {},
                                                    df: 0,
                                                    e: {
                                                        docs: {},
                                                        df: 0,
                                                        s: { docs: { "run.run_chat": { tf: 1 } }, df: 1 },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        h: {
                            docs: {},
                            df: 0,
                            o: {
                                docs: {},
                                df: 0,
                                u: {
                                    docs: {},
                                    df: 0,
                                    l: {
                                        docs: {},
                                        df: 0,
                                        d: {
                                            docs: {
                                                "run.build_gemini_history": { tf: 1 },
                                                "run.start_chat_session": { tf: 1 },
                                                "run.print_history": { tf: 1 },
                                            },
                                            df: 3,
                                        },
                                    },
                                },
                                r: { docs: {}, df: 0, t: { docs: { "run.print_history": { tf: 1 } }, df: 1 } },
                            },
                        },
                    },
                    i: {
                        docs: {},
                        df: 0,
                        f: {
                            docs: {
                                "run.load_api_key": { tf: 1 },
                                "run.ensure_database_directory": { tf: 1 },
                                "run.initialize_database": { tf: 1 },
                                "run.export_database_to_markdown": { tf: 1 },
                                "run.print_history": { tf: 1 },
                            },
                            df: 5,
                        },
                        s: {
                            docs: {
                                "run.load_api_key": { tf: 1.4142135623730951 },
                                "run.ensure_database_directory": { tf: 1 },
                                "run.initialize_database": { tf: 1 },
                                "run.save_message": { tf: 1 },
                                "run.get_session_history": { tf: 1.4142135623730951 },
                                "run.export_database_to_markdown": { tf: 1.4142135623730951 },
                                "run.print_history": { tf: 1 },
                                "run.run_chat": { tf: 1 },
                            },
                            df: 8,
                            o: { docs: { "run.create_session": { tf: 1 } }, df: 1 },
                        },
                        t: {
                            docs: {
                                "run.ensure_database_directory": { tf: 1 },
                                "run.export_database_to_markdown": { tf: 1 },
                                "run.start_chat_session": { tf: 1.4142135623730951 },
                                "run.run_chat": { tf: 1.4142135623730951 },
                            },
                            df: 4,
                            e: {
                                docs: {},
                                df: 0,
                                r: {
                                    docs: {},
                                    df: 0,
                                    a: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                            docs: {},
                                            df: 0,
                                            e: {
                                                docs: {},
                                                df: 0,
                                                s: { docs: { "run.export_database_to_markdown": { tf: 1 } }, df: 1 },
                                            },
                                        },
                                    },
                                },
                            },
                            s: {
                                docs: { "run.export_database_to_markdown": { tf: 1 }, "run.print_history": { tf: 1 } },
                                df: 2,
                            },
                        },
                        n: {
                            docs: {
                                "run.create_session": { tf: 1 },
                                "run.get_session_history": { tf: 1 },
                                "run.get_all_sessions": { tf: 1 },
                                "run.run_chat": { tf: 2.23606797749979 },
                                "run.main": { tf: 1 },
                            },
                            df: 5,
                            t: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                        docs: {},
                                        df: 0,
                                        m: {
                                            docs: {},
                                            df: 0,
                                            e: {
                                                docs: {},
                                                df: 0,
                                                d: {
                                                    docs: {},
                                                    df: 0,
                                                    i: {
                                                        docs: {},
                                                        df: 0,
                                                        a: {
                                                            docs: {},
                                                            df: 0,
                                                            t: {
                                                                docs: {},
                                                                df: 0,
                                                                e: {
                                                                    docs: {
                                                                        "run.ensure_database_directory": { tf: 1 },
                                                                    },
                                                                    df: 1,
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                        a: {
                                            docs: {},
                                            df: 0,
                                            c: {
                                                docs: {},
                                                df: 0,
                                                t: {
                                                    docs: {},
                                                    df: 0,
                                                    i: {
                                                        docs: {},
                                                        df: 0,
                                                        v: {
                                                            docs: {},
                                                            df: 0,
                                                            e: {
                                                                docs: {
                                                                    "run.run_chat": { tf: 1 },
                                                                    "run.main": { tf: 1 },
                                                                },
                                                                df: 2,
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                                o: {
                                    docs: {
                                        "run.save_message": { tf: 1 },
                                        "run.build_gemini_history": { tf: 1.4142135623730951 },
                                        "run.start_chat_session": { tf: 1 },
                                    },
                                    df: 3,
                                },
                            },
                            d: {
                                docs: {},
                                df: 0,
                                e: { docs: {}, df: 0, x: { docs: { "run.get_connection": { tf: 1 } }, df: 1 } },
                            },
                            s: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                            docs: {},
                                            df: 0,
                                            s: { docs: { "run.save_message": { tf: 1 } }, df: 1 },
                                            i: {
                                                docs: {},
                                                df: 0,
                                                o: {
                                                    docs: {},
                                                    df: 0,
                                                    n: { docs: { "run.get_session_history": { tf: 1 } }, df: 1 },
                                                },
                                            },
                                        },
                                    },
                                },
                                i: {
                                    docs: {},
                                    df: 0,
                                    d: {
                                        docs: {},
                                        df: 0,
                                        e: { docs: { "run.export_database_to_markdown": { tf: 1 } }, df: 1 },
                                    },
                                },
                                t: {
                                    docs: {},
                                    df: 0,
                                    a: {
                                        docs: {},
                                        df: 0,
                                        n: {
                                            docs: {},
                                            df: 0,
                                            c: {
                                                docs: {},
                                                df: 0,
                                                e: { docs: { "run.start_chat_session": { tf: 1 } }, df: 1 },
                                            },
                                            t: {
                                                docs: {},
                                                df: 0,
                                                i: {
                                                    docs: {},
                                                    df: 0,
                                                    a: {
                                                        docs: {},
                                                        df: 0,
                                                        t: {
                                                            docs: {},
                                                            df: 0,
                                                            e: { docs: { "run.main": { tf: 1 } }, df: 1 },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    e: {
                                        docs: {},
                                        df: 0,
                                        a: { docs: {}, df: 0, d: { docs: { "run.print_history": { tf: 1 } }, df: 1 } },
                                    },
                                },
                            },
                            p: {
                                docs: {},
                                df: 0,
                                u: {
                                    docs: {},
                                    df: 0,
                                    t: { docs: { "run.save_message": { tf: 1 }, "run.run_chat": { tf: 1 } }, df: 2 },
                                },
                            },
                            c: {
                                docs: {},
                                df: 0,
                                r: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        m: {
                                            docs: {},
                                            df: 0,
                                            e: {
                                                docs: {},
                                                df: 0,
                                                n: {
                                                    docs: {},
                                                    df: 0,
                                                    t: {
                                                        docs: {},
                                                        df: 0,
                                                        e: {
                                                            docs: {},
                                                            df: 0,
                                                            d: {
                                                                docs: { "run.get_session_history": { tf: 1 } },
                                                                df: 1,
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            j: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    c: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                            docs: {},
                                            df: 0,
                                            e: {
                                                docs: {},
                                                df: 0,
                                                d: { docs: { "run.start_chat_session": { tf: 1 } }, df: 1 },
                                            },
                                        },
                                    },
                                },
                            },
                            i: {
                                docs: {},
                                df: 0,
                                t: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                        docs: {},
                                        df: 0,
                                        a: {
                                            docs: {},
                                            df: 0,
                                            l: {
                                                docs: {},
                                                df: 0,
                                                i: {
                                                    docs: {},
                                                    df: 0,
                                                    s: {
                                                        docs: {},
                                                        df: 0,
                                                        e: { docs: { "run.main": { tf: 1 } }, df: 1 },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        d: {
                            docs: {
                                "run.initialize_database": { tf: 1 },
                                "run.save_message": { tf: 1 },
                                "run.get_session_history": { tf: 1.4142135623730951 },
                                "run.get_all_sessions": { tf: 1 },
                                "run.build_gemini_history": { tf: 1 },
                                "run.start_chat_session": { tf: 1 },
                                "run.print_history": { tf: 1 },
                                "run.run_chat": { tf: 1 },
                            },
                            df: 8,
                            e: {
                                docs: {},
                                df: 0,
                                m: {
                                    docs: {},
                                    df: 0,
                                    p: {
                                        docs: {},
                                        df: 0,
                                        o: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                                docs: {},
                                                df: 0,
                                                e: {
                                                    docs: {},
                                                    df: 0,
                                                    n: {
                                                        docs: {},
                                                        df: 0,
                                                        t: { docs: { "run.initialize_database": { tf: 1 } }, df: 1 },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                                n: {
                                    docs: {},
                                    df: 0,
                                    t: {
                                        docs: {},
                                        df: 0,
                                        i: {
                                            docs: {},
                                            df: 0,
                                            f: {
                                                docs: {},
                                                df: 0,
                                                i: {
                                                    docs: {},
                                                    df: 0,
                                                    e: {
                                                        docs: {},
                                                        df: 0,
                                                        d: { docs: { "run.initialize_database": { tf: 1 } }, df: 1 },
                                                    },
                                                },
                                                y: { docs: { "run.create_session": { tf: 1 } }, df: 1 },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    n: {
                        docs: {},
                        df: 0,
                        o: {
                            docs: { "run.print_history": { tf: 1 } },
                            df: 1,
                            t: {
                                docs: {
                                    "run.load_api_key": { tf: 1 },
                                    "run.ensure_database_directory": { tf: 1 },
                                    "run.initialize_database": { tf: 1 },
                                    "run.export_database_to_markdown": { tf: 1 },
                                    "run.run_chat": { tf: 1 },
                                },
                                df: 5,
                                i: {
                                    docs: {},
                                    df: 0,
                                    c: { docs: {}, df: 0, e: { docs: { "run.print_history": { tf: 1 } }, df: 1 } },
                                },
                            },
                        },
                        a: {
                            docs: {},
                            df: 0,
                            m: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {
                                        "run.get_connection": { tf: 1 },
                                        "run.export_database_to_markdown": { tf: 1 },
                                    },
                                    df: 2,
                                    d: { docs: { "run.export_database_to_markdown": { tf: 1 } }, df: 1 },
                                },
                            },
                        },
                        e: {
                            docs: {},
                            df: 0,
                            c: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    s: {
                                        docs: {},
                                        df: 0,
                                        s: {
                                            docs: {},
                                            df: 0,
                                            a: {
                                                docs: {},
                                                df: 0,
                                                r: {
                                                    docs: {},
                                                    df: 0,
                                                    y: { docs: { "run.initialize_database": { tf: 1 } }, df: 1 },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            w: {
                                docs: {
                                    "run.create_session": { tf: 1 },
                                    "run.save_message": { tf: 1 },
                                    "run.start_chat_session": { tf: 1.4142135623730951 },
                                    "run.main": { tf: 1 },
                                },
                                df: 4,
                                l: { docs: {}, df: 0, y: { docs: { "run.create_session": { tf: 1 } }, df: 1 } },
                            },
                            s: {
                                docs: {},
                                df: 0,
                                t: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        d: { docs: { "run.build_gemini_history": { tf: 1 } }, df: 1 },
                                    },
                                },
                            },
                        },
                    },
                    c: {
                        docs: {},
                        df: 0,
                        r: {
                            docs: {},
                            df: 0,
                            e: {
                                docs: {},
                                df: 0,
                                a: {
                                    docs: {},
                                    df: 0,
                                    t: {
                                        docs: {},
                                        df: 0,
                                        e: {
                                            docs: {
                                                "run.ensure_database_directory": { tf: 1 },
                                                "run.initialize_database": { tf: 1 },
                                                "run.create_session": { tf: 1 },
                                                "run.build_gemini_history": { tf: 1 },
                                                "run.start_chat_session": { tf: 1 },
                                                "run.main": { tf: 1 },
                                            },
                                            df: 6,
                                            d: {
                                                docs: {
                                                    "run.initialize_database": { tf: 1 },
                                                    "run.create_session": { tf: 1 },
                                                    "run.get_session_history": { tf: 1 },
                                                    "run.get_all_sessions": { tf: 1 },
                                                    "run.export_database_to_markdown": { tf: 1 },
                                                },
                                                df: 5,
                                            },
                                        },
                                        i: {
                                            docs: {},
                                            df: 0,
                                            n: {
                                                docs: {},
                                                df: 0,
                                                g: { docs: { "run.initialize_database": { tf: 1 } }, df: 1 },
                                            },
                                            o: {
                                                docs: {},
                                                df: 0,
                                                n: {
                                                    docs: {
                                                        "run.create_session": { tf: 1 },
                                                        "run.save_message": { tf: 1 },
                                                        "run.get_all_sessions": { tf: 1 },
                                                    },
                                                    df: 3,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        a: {
                            docs: {},
                            df: 0,
                            l: {
                                docs: {},
                                df: 0,
                                l: {
                                    docs: {
                                        "run.ensure_database_directory": { tf: 1 },
                                        "run.initialize_database": { tf: 1 },
                                    },
                                    df: 2,
                                    s: { docs: { "run.initialize_database": { tf: 1 } }, df: 1 },
                                    e: { docs: {}, df: 0, d: { docs: { "run.save_message": { tf: 1 } }, df: 1 } },
                                },
                            },
                            n: { docs: { "run.get_connection": { tf: 1 } }, df: 1 },
                        },
                        o: {
                            docs: {},
                            df: 0,
                            n: {
                                docs: {},
                                df: 0,
                                n: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        c: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                                docs: {},
                                                df: 0,
                                                i: {
                                                    docs: {},
                                                    df: 0,
                                                    o: {
                                                        docs: {},
                                                        df: 0,
                                                        n: {
                                                            docs: { "run.get_connection": { tf: 1.7320508075688772 } },
                                                            df: 1,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                                t: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        n: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                                docs: {
                                                    "run.save_message": { tf: 1.4142135623730951 },
                                                    "run.get_session_history": { tf: 1 },
                                                    "run.build_gemini_history": { tf: 1.4142135623730951 },
                                                },
                                                df: 3,
                                            },
                                        },
                                        x: {
                                            docs: {},
                                            df: 0,
                                            t: { docs: { "run.start_chat_session": { tf: 1 } }, df: 1 },
                                        },
                                    },
                                    a: {
                                        docs: {},
                                        df: 0,
                                        i: {
                                            docs: {},
                                            df: 0,
                                            n: {
                                                docs: {},
                                                df: 0,
                                                i: {
                                                    docs: {},
                                                    df: 0,
                                                    n: {
                                                        docs: {},
                                                        df: 0,
                                                        g: {
                                                            docs: {
                                                                "run.get_session_history": { tf: 1 },
                                                                "run.get_all_sessions": { tf: 1 },
                                                            },
                                                            df: 2,
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    i: {
                                        docs: {},
                                        df: 0,
                                        n: {
                                            docs: {},
                                            df: 0,
                                            u: {
                                                docs: {},
                                                df: 0,
                                                o: {
                                                    docs: {},
                                                    df: 0,
                                                    u: {
                                                        docs: {},
                                                        df: 0,
                                                        s: { docs: { "run.run_chat": { tf: 1 } }, df: 1 },
                                                    },
                                                },
                                                e: {
                                                    docs: {},
                                                    df: 0,
                                                    s: { docs: { "run.run_chat": { tf: 1.4142135623730951 } }, df: 1 },
                                                },
                                            },
                                        },
                                    },
                                },
                                v: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        r: {
                                            docs: {},
                                            df: 0,
                                            s: {
                                                docs: {},
                                                df: 0,
                                                a: {
                                                    docs: {},
                                                    df: 0,
                                                    t: {
                                                        docs: {},
                                                        df: 0,
                                                        i: {
                                                            docs: {},
                                                            df: 0,
                                                            o: {
                                                                docs: {},
                                                                df: 0,
                                                                n: {
                                                                    docs: {
                                                                        "run.get_session_history": { tf: 1 },
                                                                        "run.start_chat_session": { tf: 1 },
                                                                    },
                                                                    df: 2,
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                            t: {
                                                docs: { "run.build_gemini_history": { tf: 1 } },
                                                df: 1,
                                                e: {
                                                    docs: {},
                                                    df: 0,
                                                    d: { docs: { "run.build_gemini_history": { tf: 1 } }, df: 1 },
                                                },
                                                s: { docs: { "run.start_chat_session": { tf: 1 } }, df: 1 },
                                            },
                                        },
                                    },
                                },
                                f: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                        docs: {},
                                        df: 0,
                                        g: {
                                            docs: {},
                                            df: 0,
                                            u: {
                                                docs: {},
                                                df: 0,
                                                r: { docs: {}, df: 0, e: { docs: { "run.main": { tf: 1 } }, df: 1 } },
                                            },
                                        },
                                    },
                                },
                            },
                            l: {
                                docs: {},
                                df: 0,
                                u: {
                                    docs: {},
                                    df: 0,
                                    m: {
                                        docs: {},
                                        df: 0,
                                        n: { docs: { "run.get_connection": { tf: 1.4142135623730951 } }, df: 1 },
                                    },
                                },
                            },
                            m: {
                                docs: {},
                                df: 0,
                                m: {
                                    docs: {},
                                    df: 0,
                                    a: {
                                        docs: {},
                                        df: 0,
                                        n: {
                                            docs: {},
                                            df: 0,
                                            d: {
                                                docs: {},
                                                df: 0,
                                                s: {
                                                    docs: {
                                                        "run.print_banner": { tf: 1 },
                                                        "run.run_chat": { tf: 1.4142135623730951 },
                                                    },
                                                    df: 2,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        h: {
                            docs: {},
                            df: 0,
                            a: {
                                docs: {},
                                df: 0,
                                t: {
                                    docs: {
                                        "run.initialize_database": { tf: 1 },
                                        "run.create_session": { tf: 1 },
                                        "run.save_message": { tf: 1 },
                                        "run.export_database_to_markdown": { tf: 1 },
                                        "run.start_chat_session": { tf: 1.7320508075688772 },
                                        "run.run_chat": { tf: 1.7320508075688772 },
                                        "run.main": { tf: 1.4142135623730951 },
                                    },
                                    df: 7,
                                    s: {
                                        docs: {
                                            "run.build_gemini_history": { tf: 1 },
                                            "run.start_chat_session": { tf: 1 },
                                            "run.run_chat": { tf: 1 },
                                        },
                                        df: 3,
                                    },
                                },
                            },
                            r: {
                                docs: {},
                                df: 0,
                                o: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                        docs: {},
                                        df: 0,
                                        o: {
                                            docs: {},
                                            df: 0,
                                            l: {
                                                docs: {},
                                                df: 0,
                                                o: {
                                                    docs: {},
                                                    df: 0,
                                                    g: {
                                                        docs: {},
                                                        df: 0,
                                                        i: {
                                                            docs: {},
                                                            df: 0,
                                                            c: {
                                                                docs: {},
                                                                df: 0,
                                                                a: {
                                                                    docs: {},
                                                                    df: 0,
                                                                    l: {
                                                                        docs: {},
                                                                        df: 0,
                                                                        l: {
                                                                            docs: {},
                                                                            df: 0,
                                                                            y: {
                                                                                docs: {
                                                                                    "run.export_database_to_markdown": {
                                                                                        tf: 1,
                                                                                    },
                                                                                },
                                                                                df: 1,
                                                                            },
                                                                        },
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        u: {
                            docs: {},
                            df: 0,
                            r: {
                                docs: {},
                                df: 0,
                                r: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        n: {
                                            docs: {},
                                            df: 0,
                                            t: {
                                                docs: {
                                                    "run.save_message": { tf: 1 },
                                                    "run.print_history": { tf: 1 },
                                                    "run.run_chat": { tf: 1.4142135623730951 },
                                                },
                                                df: 3,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        l: {
                            docs: {},
                            df: 0,
                            i: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                        docs: {},
                                        df: 0,
                                        t: {
                                            docs: {
                                                "run.build_gemini_history": { tf: 1 },
                                                "run.start_chat_session": { tf: 1.7320508075688772 },
                                                "run.main": { tf: 1 },
                                            },
                                            df: 3,
                                            e: {
                                                docs: {},
                                                df: 0,
                                                r: {
                                                    docs: {},
                                                    df: 0,
                                                    r: {
                                                        docs: {},
                                                        df: 0,
                                                        o: {
                                                            docs: {},
                                                            df: 0,
                                                            r: { docs: { "run.run_chat": { tf: 1 } }, df: 1 },
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        t: {
                            docs: {},
                            df: 0,
                            r: {
                                docs: {},
                                df: 0,
                                l: {
                                    docs: {},
                                    df: 0,
                                    "+": {
                                        docs: {},
                                        df: 0,
                                        c: { docs: { "run.run_chat": { tf: 1 } }, df: 1 },
                                        d: { docs: { "run.run_chat": { tf: 1 } }, df: 1 },
                                    },
                                },
                            },
                        },
                    },
                    m: {
                        docs: {},
                        df: 0,
                        k: {
                            docs: {},
                            df: 0,
                            d: {
                                docs: {},
                                df: 0,
                                i: {
                                    docs: {},
                                    df: 0,
                                    r: { docs: { "run.ensure_database_directory": { tf: 1 } }, df: 1 },
                                },
                            },
                        },
                        a: {
                            docs: {},
                            df: 0,
                            k: {
                                docs: {},
                                df: 0,
                                e: { docs: { "run.ensure_database_directory": { tf: 1 } }, df: 1 },
                                i: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                        docs: {},
                                        df: 0,
                                        g: { docs: { "run.initialize_database": { tf: 1 } }, df: 1 },
                                    },
                                },
                            },
                            t: {
                                docs: {},
                                df: 0,
                                c: {
                                    docs: {},
                                    df: 0,
                                    h: {
                                        docs: { "run.save_message": { tf: 1 } },
                                        df: 1,
                                        e: {
                                            docs: {},
                                            df: 0,
                                            s: { docs: { "run.get_session_history": { tf: 1 } }, df: 1 },
                                        },
                                    },
                                },
                            },
                            r: {
                                docs: {},
                                df: 0,
                                k: {
                                    docs: {},
                                    df: 0,
                                    d: {
                                        docs: {},
                                        df: 0,
                                        o: {
                                            docs: {},
                                            df: 0,
                                            w: {
                                                docs: {},
                                                df: 0,
                                                n: {
                                                    docs: {
                                                        "run.export_database_to_markdown": { tf: 1.7320508075688772 },
                                                        "run.run_chat": { tf: 1 },
                                                    },
                                                    df: 2,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        u: {
                            docs: {},
                            df: 0,
                            l: {
                                docs: {},
                                df: 0,
                                t: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                        docs: {},
                                        df: 0,
                                        p: {
                                            docs: {},
                                            df: 0,
                                            l: {
                                                docs: {},
                                                df: 0,
                                                e: { docs: { "run.ensure_database_directory": { tf: 1 } }, df: 1 },
                                            },
                                        },
                                    },
                                },
                            },
                            s: { docs: {}, df: 0, t: { docs: { "run.save_message": { tf: 1 } }, df: 1 } },
                        },
                        i: {
                            docs: {},
                            df: 0,
                            s: {
                                docs: {},
                                df: 0,
                                s: {
                                    docs: {},
                                    df: 0,
                                    i: {
                                        docs: {},
                                        df: 0,
                                        n: {
                                            docs: {},
                                            df: 0,
                                            g: { docs: { "run.ensure_database_directory": { tf: 1 } }, df: 1 },
                                        },
                                    },
                                },
                            },
                        },
                        e: {
                            docs: {},
                            df: 0,
                            s: {
                                docs: {},
                                df: 0,
                                s: {
                                    docs: {},
                                    df: 0,
                                    a: {
                                        docs: {},
                                        df: 0,
                                        g: {
                                            docs: {},
                                            df: 0,
                                            e: {
                                                docs: {
                                                    "run.initialize_database": { tf: 1 },
                                                    "run.save_message": { tf: 2 },
                                                    "run.get_session_history": { tf: 1 },
                                                    "run.print_history": { tf: 1 },
                                                    "run.run_chat": { tf: 1.7320508075688772 },
                                                },
                                                df: 5,
                                                s: {
                                                    docs: {
                                                        "run.initialize_database": { tf: 1 },
                                                        "run.save_message": { tf: 1 },
                                                        "run.get_session_history": { tf: 1.4142135623730951 },
                                                        "run.export_database_to_markdown": { tf: 1 },
                                                        "run.build_gemini_history": { tf: 1 },
                                                        "run.start_chat_session": { tf: 1 },
                                                        "run.print_history": { tf: 1.7320508075688772 },
                                                        "run.run_chat": { tf: 1.4142135623730951 },
                                                    },
                                                    df: 8,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        o: {
                            docs: {},
                            df: 0,
                            d: {
                                docs: {},
                                df: 0,
                                e: {
                                    docs: {},
                                    df: 0,
                                    l: {
                                        docs: {
                                            "run.initialize_database": { tf: 1 },
                                            "run.save_message": { tf: 1.4142135623730951 },
                                            "run.start_chat_session": { tf: 1 },
                                            "run.print_history": { tf: 1 },
                                            "run.run_chat": { tf: 1 },
                                        },
                                        df: 5,
                                    },
                                },
                            },
                        },
                        d: { docs: { "run.export_database_to_markdown": { tf: 1 } }, df: 1 },
                    },
                    w: {
                        docs: {},
                        df: 0,
                        i: {
                            docs: {},
                            df: 0,
                            t: {
                                docs: {},
                                df: 0,
                                h: {
                                    docs: {
                                        "run.ensure_database_directory": { tf: 1 },
                                        "run.save_message": { tf: 1 },
                                        "run.build_gemini_history": { tf: 1 },
                                        "run.start_chat_session": { tf: 1 },
                                        "run.print_history": { tf: 1 },
                                        "run.main": { tf: 1 },
                                    },
                                    df: 6,
                                    o: {
                                        docs: {},
                                        df: 0,
                                        u: {
                                            docs: {},
                                            df: 0,
                                            t: { docs: { "run.initialize_database": { tf: 1 } }, df: 1 },
                                        },
                                    },
                                },
                            },
                        },
                        o: {
                            docs: {},
                            df: 0,
                            r: {
                                docs: {},
                                df: 0,
                                k: {
                                    docs: {},
                                    df: 0,
                                    s: { docs: { "run.ensure_database_directory": { tf: 1 } }, df: 1 },
                                },
                            },
                        },
                        h: {
                            docs: {},
                            df: 0,
                            e: {
                                docs: {},
                                df: 0,
                                n: {
                                    docs: {
                                        "run.ensure_database_directory": { tf: 1 },
                                        "run.initialize_database": { tf: 1 },
                                        "run.start_chat_session": { tf: 1 },
                                        "run.run_chat": { tf: 1.4142135623730951 },
                                    },
                                    df: 4,
                                },
                                r: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {
                                            "run.export_database_to_markdown": { tf: 1 },
                                            "run.build_gemini_history": { tf: 1 },
                                        },
                                        df: 2,
                                    },
                                },
                            },
                            o: {
                                docs: {},
                                df: 0,
                                s: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {
                                            "run.get_session_history": { tf: 1.4142135623730951 },
                                            "run.build_gemini_history": { tf: 1.4142135623730951 },
                                            "run.start_chat_session": { tf: 1 },
                                            "run.print_history": { tf: 1 },
                                        },
                                        df: 4,
                                    },
                                },
                            },
                        },
                        r: {
                            docs: {},
                            df: 0,
                            i: {
                                docs: {},
                                df: 0,
                                t: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        s: { docs: { "run.export_database_to_markdown": { tf: 1 } }, df: 1 },
                                    },
                                },
                            },
                        },
                        e: {
                            docs: {},
                            df: 0,
                            l: {
                                docs: {},
                                df: 0,
                                c: {
                                    docs: {},
                                    df: 0,
                                    o: {
                                        docs: {},
                                        df: 0,
                                        m: {
                                            docs: {},
                                            df: 0,
                                            e: {
                                                docs: { "run.print_banner": { tf: 1 }, "run.main": { tf: 1 } },
                                                df: 2,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    q: {
                        docs: {},
                        df: 0,
                        u: {
                            docs: {},
                            df: 0,
                            e: {
                                docs: {},
                                df: 0,
                                r: {
                                    docs: {},
                                    df: 0,
                                    y: { docs: { "run.get_connection": { tf: 1 } }, df: 1 },
                                    i: {
                                        docs: {},
                                        df: 0,
                                        e: {
                                            docs: {},
                                            df: 0,
                                            s: { docs: { "run.get_session_history": { tf: 1 } }, df: 1 },
                                        },
                                    },
                                },
                            },
                            i: { docs: {}, df: 0, t: { docs: { "run.run_chat": { tf: 1.7320508075688772 } }, df: 1 } },
                            o: {
                                docs: {},
                                df: 0,
                                t: { docs: {}, df: 0, a: { docs: { "run.run_chat": { tf: 1 } }, df: 1 } },
                            },
                        },
                    },
                    b: {
                        docs: {},
                        df: 0,
                        e: {
                            docs: {
                                "run.get_connection": { tf: 1 },
                                "run.save_message": { tf: 1 },
                                "run.build_gemini_history": { tf: 1.4142135623730951 },
                                "run.start_chat_session": { tf: 1 },
                                "run.print_history": { tf: 1 },
                            },
                            df: 5,
                            f: {
                                docs: {},
                                df: 0,
                                o: {
                                    docs: {},
                                    df: 0,
                                    r: {
                                        docs: {},
                                        df: 0,
                                        e: {
                                            docs: {
                                                "run.initialize_database": { tf: 1 },
                                                "run.save_message": { tf: 1 },
                                                "run.run_chat": { tf: 1 },
                                            },
                                            df: 3,
                                        },
                                    },
                                },
                            },
                            l: {
                                docs: {},
                                df: 0,
                                o: {
                                    docs: {},
                                    df: 0,
                                    n: {
                                        docs: {},
                                        df: 0,
                                        g: { docs: {}, df: 0, s: { docs: { "run.save_message": { tf: 1 } }, df: 1 } },
                                    },
                                },
                            },
                        },
                        o: {
                            docs: {},
                            df: 0,
                            t: {
                                docs: {},
                                df: 0,
                                h: {
                                    docs: { "run.get_connection": { tf: 1 }, "run.initialize_database": { tf: 1 } },
                                    df: 2,
                                },
                            },
                        },
                        y: {
                            docs: {
                                "run.get_connection": { tf: 1.4142135623730951 },
                                "run.initialize_database": { tf: 1 },
                                "run.save_message": { tf: 1 },
                                "run.get_session_history": { tf: 1 },
                                "run.get_all_sessions": { tf: 1 },
                                "run.export_database_to_markdown": { tf: 1 },
                                "run.build_gemini_history": { tf: 1 },
                            },
                            df: 7,
                        },
                        a: {
                            docs: {},
                            df: 0,
                            n: {
                                docs: {},
                                df: 0,
                                n: {
                                    docs: {},
                                    df: 0,
                                    e: {
                                        docs: {},
                                        df: 0,
                                        r: { docs: { "run.print_banner": { tf: 1 }, "run.main": { tf: 1 } }, df: 2 },
                                    },
                                },
                            },
                        },
                        u: {
                            docs: {},
                            df: 0,
                            i: {
                                docs: {},
                                df: 0,
                                l: {
                                    docs: {},
                                    df: 0,
                                    t: { docs: { "run.run_chat": { tf: 1.4142135623730951 } }, df: 1 },
                                },
                            },
                        },
                    },
                    h: {
                        docs: {},
                        df: 0,
                        i: {
                            docs: {},
                            df: 0,
                            s: {
                                docs: {},
                                df: 0,
                                t: {
                                    docs: {},
                                    df: 0,
                                    o: {
                                        docs: {},
                                        df: 0,
                                        r: {
                                            docs: {},
                                            df: 0,
                                            y: {
                                                docs: {
                                                    "run.get_session_history": { tf: 1 },
                                                    "run.build_gemini_history": { tf: 2 },
                                                    "run.start_chat_session": { tf: 1.7320508075688772 },
                                                    "run.print_history": { tf: 1.4142135623730951 },
                                                    "run.run_chat": { tf: 1.4142135623730951 },
                                                    "run.main": { tf: 1 },
                                                },
                                                df: 6,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        h: {
                            docs: {},
                            df: 0,
                            m: {
                                docs: {},
                                df: 0,
                                m: {
                                    docs: {},
                                    df: 0,
                                    s: {
                                        docs: {},
                                        df: 0,
                                        s: { docs: { "run.export_database_to_markdown": { tf: 1 } }, df: 1 },
                                    },
                                },
                            },
                        },
                        a: {
                            docs: {},
                            df: 0,
                            s: {
                                docs: { "run.build_gemini_history": { tf: 1 }, "run.start_chat_session": { tf: 1 } },
                                df: 2,
                            },
                            n: {
                                docs: {},
                                df: 0,
                                d: {
                                    docs: {},
                                    df: 0,
                                    l: {
                                        docs: {},
                                        df: 0,
                                        e: { docs: {}, df: 0, s: { docs: { "run.run_chat": { tf: 1 } }, df: 1 } },
                                        i: {
                                            docs: {},
                                            df: 0,
                                            n: { docs: {}, df: 0, g: { docs: { "run.run_chat": { tf: 1 } }, df: 1 } },
                                        },
                                    },
                                },
                            },
                        },
                        u: {
                            docs: {},
                            df: 0,
                            m: {
                                docs: {},
                                df: 0,
                                a: { docs: {}, df: 0, n: { docs: { "run.print_history": { tf: 1 } }, df: 1 } },
                            },
                        },
                        t: {
                            docs: {},
                            df: 0,
                            t: { docs: {}, df: 0, p: { docs: { "run.run_chat": { tf: 1 } }, df: 1 } },
                        },
                    },
                    y: {
                        docs: {},
                        df: 0,
                        y: {
                            docs: {},
                            df: 0,
                            y: {
                                docs: {},
                                df: 0,
                                y: {
                                    docs: {},
                                    df: 0,
                                    m: {
                                        docs: {},
                                        df: 0,
                                        m: {
                                            docs: {},
                                            df: 0,
                                            d: {
                                                docs: {},
                                                df: 0,
                                                d: { docs: { "run.export_database_to_markdown": { tf: 1 } }, df: 1 },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        o: { docs: {}, df: 0, u: { docs: { "run.print_history": { tf: 1 } }, df: 1 } },
                        e: { docs: {}, df: 0, t: { docs: { "run.print_history": { tf: 1 } }, df: 1 } },
                    },
                },
            },
        },
        pipeline: ["trimmer"],
        _isPrebuiltIndex: true,
    };

    // mirrored in build-search-index.js (part 1)
    // Also split on html tags. this is a cheap heuristic, but good enough.
    elasticlunr.tokenizer.setSeperator(/[\s\-.;&_'"=,()]+|<[^>]*>/);

    let searchIndex;
    if (docs._isPrebuiltIndex) {
        console.info("using precompiled search index");
        searchIndex = elasticlunr.Index.load(docs);
    } else {
        console.time("building search index");
        // mirrored in build-search-index.js (part 2)
        searchIndex = elasticlunr(function () {
            this.pipeline.remove(elasticlunr.stemmer);
            this.pipeline.remove(elasticlunr.stopWordFilter);
            this.addField("qualname");
            this.addField("fullname");
            this.addField("annotation");
            this.addField("default_value");
            this.addField("signature");
            this.addField("bases");
            this.addField("doc");
            this.setRef("fullname");
        });
        for (let doc of docs) {
            searchIndex.addDoc(doc);
        }
        console.timeEnd("building search index");
    }

    return (term) =>
        searchIndex.search(term, {
            fields: {
                qualname: { boost: 4 },
                fullname: { boost: 2 },
                annotation: { boost: 2 },
                default_value: { boost: 2 },
                signature: { boost: 2 },
                bases: { boost: 2 },
                doc: { boost: 1 },
            },
            expand: true,
        });
})();
