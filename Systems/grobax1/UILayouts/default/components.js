var kn = Object.defineProperty;
var In = (n, e, t) => e in n ? kn(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var O = (n, e, t) => In(n, typeof e != "symbol" ? e + "" : e, t);
function K() {
}
const Xe = (n) => n;
function Kt(n) {
  return n();
}
function lt() {
  return /* @__PURE__ */ Object.create(null);
}
function Y(n) {
  n.forEach(Kt);
}
function Pe(n) {
  return typeof n == "function";
}
function ie(n, e) {
  return n != n ? e == e : n !== e || n && typeof n == "object" || typeof n == "function";
}
function Mn(n) {
  return Object.keys(n).length === 0;
}
function Ft(n, ...e) {
  if (n == null) {
    for (const i of e)
      i(void 0);
    return K;
  }
  const t = n.subscribe(...e);
  return t.unsubscribe ? () => t.unsubscribe() : t;
}
function x(n) {
  let e;
  return Ft(n, (t) => e = t)(), e;
}
function Se(n, e, t) {
  n.$$.on_destroy.push(Ft(e, t));
}
function rt(n) {
  const e = typeof n == "string" && n.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
  return e ? [parseFloat(e[1]), e[2] || "px"] : [
    /** @type {number} */
    n,
    "px"
  ];
}
const qt = typeof window < "u";
let Jt = qt ? () => window.performance.now() : () => Date.now(), Ze = qt ? (n) => requestAnimationFrame(n) : K;
const ke = /* @__PURE__ */ new Set();
function zt(n) {
  ke.forEach((e) => {
    e.c(n) || (ke.delete(e), e.f());
  }), ke.size !== 0 && Ze(zt);
}
function Yt(n) {
  let e;
  return ke.size === 0 && Ze(zt), {
    promise: new Promise((t) => {
      ke.add(e = { c: n, f: t });
    }),
    abort() {
      ke.delete(e);
    }
  };
}
function b(n, e) {
  n.appendChild(e);
}
function Gt(n) {
  if (!n) return document;
  const e = n.getRootNode ? n.getRootNode() : n.ownerDocument;
  return e && /** @type {ShadowRoot} */
  e.host ? (
    /** @type {ShadowRoot} */
    e
  ) : n.ownerDocument;
}
function Sn(n) {
  const e = y("style");
  return e.textContent = "/* empty */", Cn(Gt(n), e), e.sheet;
}
function Cn(n, e) {
  return b(
    /** @type {Document} */
    n.head || n,
    e
  ), e.sheet;
}
function B(n, e, t) {
  n.insertBefore(e, t || null);
}
function R(n) {
  n.parentNode && n.parentNode.removeChild(n);
}
function He(n, e) {
  for (let t = 0; t < n.length; t += 1)
    n[t] && n[t].d(e);
}
function y(n) {
  return document.createElement(n);
}
function G(n) {
  return document.createTextNode(n);
}
function j() {
  return G(" ");
}
function On() {
  return G("");
}
function U(n, e, t, i) {
  return n.addEventListener(e, t, i), () => n.removeEventListener(e, t, i);
}
function c(n, e, t) {
  t == null ? n.removeAttribute(e) : n.getAttribute(e) !== t && n.setAttribute(e, t);
}
function je(n) {
  return n === "" ? null : +n;
}
function Ln(n) {
  return Array.from(n.childNodes);
}
function de(n, e) {
  e = "" + e, n.data !== e && (n.data = /** @type {string} */
  e);
}
function me(n, e) {
  n.value = e ?? "";
}
function Wt(n, e, t, i) {
  t == null ? n.style.removeProperty(e) : n.style.setProperty(e, t, "");
}
function Qt(n, e, { bubbles: t = !1, cancelable: i = !1 } = {}) {
  return new CustomEvent(n, { detail: e, bubbles: t, cancelable: i });
}
function En(n) {
  const e = {};
  return n.childNodes.forEach(
    /** @param {Element} node */
    (t) => {
      e[t.slot || "default"] = !0;
    }
  ), e;
}
const Be = /* @__PURE__ */ new Map();
let Ve = 0;
function An(n) {
  let e = 5381, t = n.length;
  for (; t--; ) e = (e << 5) - e ^ n.charCodeAt(t);
  return e >>> 0;
}
function Rn(n, e) {
  const t = { stylesheet: Sn(e), rules: {} };
  return Be.set(n, t), t;
}
function Ge(n, e, t, i, s, a, l, r = 0) {
  const o = 16.666 / i;
  let d = `{
`;
  for (let p = 0; p <= 1; p += o) {
    const v = e + (t - e) * a(p);
    d += p * 100 + `%{${l(v, 1 - v)}}
`;
  }
  const u = d + `100% {${l(t, 1 - t)}}
}`, h = `__svelte_${An(u)}_${r}`, f = Gt(n), { stylesheet: _, rules: g } = Be.get(f) || Rn(f, n);
  g[h] || (g[h] = !0, _.insertRule(`@keyframes ${h} ${u}`, _.cssRules.length));
  const $ = n.style.animation || "";
  return n.style.animation = `${$ ? `${$}, ` : ""}${h} ${i}ms linear ${s}ms 1 both`, Ve += 1, h;
}
function Xt(n, e) {
  const t = (n.style.animation || "").split(", "), i = t.filter(
    e ? (a) => a.indexOf(e) < 0 : (a) => a.indexOf("__svelte") === -1
    // remove all Svelte animations
  ), s = t.length - i.length;
  s && (n.style.animation = i.join(", "), Ve -= s, Ve || Nn());
}
function Nn() {
  Ze(() => {
    Ve || (Be.forEach((n) => {
      const { ownerNode: e } = n.stylesheet;
      e && R(e);
    }), Be.clear());
  });
}
function xe(n, e, t, i) {
  if (!e) return K;
  const s = n.getBoundingClientRect();
  if (e.left === s.left && e.right === s.right && e.top === s.top && e.bottom === s.bottom)
    return K;
  const {
    delay: a = 0,
    duration: l = 300,
    easing: r = Xe,
    // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
    start: o = Jt() + a,
    // @ts-ignore todo:
    end: d = o + l,
    tick: u = K,
    css: h
  } = t(n, { from: e, to: s }, i);
  let f = !0, _ = !1, g;
  function $() {
    h && (g = Ge(n, 0, 1, l, a, r, h)), a || (_ = !0);
  }
  function p() {
    h && Xt(n, g), f = !1;
  }
  return Yt((v) => {
    if (!_ && v >= o && (_ = !0), _ && v >= d && (u(1, 0), p()), !f)
      return !1;
    if (_) {
      const E = v - o, m = 0 + 1 * r(E / l);
      u(m, 1 - m);
    }
    return !0;
  }), $(), u(0, 1), p;
}
function et(n) {
  const e = getComputedStyle(n);
  if (e.position !== "absolute" && e.position !== "fixed") {
    const { width: t, height: i } = e, s = n.getBoundingClientRect();
    n.style.position = "absolute", n.style.width = t, n.style.height = i, Ke(n, s);
  }
}
function Ke(n, e) {
  const t = n.getBoundingClientRect();
  if (e.left !== t.left || e.top !== t.top) {
    const i = getComputedStyle(n), s = i.transform === "none" ? "" : i.transform;
    n.style.transform = `${s} translate(${e.left - t.left}px, ${e.top - t.top}px)`;
  }
}
let Ee;
function Le(n) {
  Ee = n;
}
function tt() {
  if (!Ee) throw new Error("Function called outside component initialization");
  return Ee;
}
function Me(n) {
  tt().$$.on_mount.push(n);
}
function Ae(n) {
  tt().$$.on_destroy.push(n);
}
function nt() {
  const n = tt();
  return (e, t, { cancelable: i = !1 } = {}) => {
    const s = n.$$.callbacks[e];
    if (s) {
      const a = Qt(
        /** @type {string} */
        e,
        t,
        { cancelable: i }
      );
      return s.slice().forEach((l) => {
        l.call(n, a);
      }), !a.defaultPrevented;
    }
    return !0;
  };
}
function pe(n, e) {
  const t = n.$$.callbacks[e.type];
  t && t.slice().forEach((i) => i.call(this, e));
}
const De = [], ne = [];
let Ie = [];
const We = [], Bn = /* @__PURE__ */ Promise.resolve();
let Qe = !1;
function Vn() {
  Qe || (Qe = !0, Bn.then(L));
}
function se(n) {
  Ie.push(n);
}
function be(n) {
  We.push(n);
}
const Je = /* @__PURE__ */ new Set();
let $e = 0;
function L() {
  if ($e !== 0)
    return;
  const n = Ee;
  do {
    try {
      for (; $e < De.length; ) {
        const e = De[$e];
        $e++, Le(e), Tn(e.$$);
      }
    } catch (e) {
      throw De.length = 0, $e = 0, e;
    }
    for (Le(null), De.length = 0, $e = 0; ne.length; ) ne.pop()();
    for (let e = 0; e < Ie.length; e += 1) {
      const t = Ie[e];
      Je.has(t) || (Je.add(t), t());
    }
    Ie.length = 0;
  } while (De.length);
  for (; We.length; )
    We.pop()();
  Qe = !1, Je.clear(), Le(n);
}
function Tn(n) {
  if (n.fragment !== null) {
    n.update(), Y(n.before_update);
    const e = n.dirty;
    n.dirty = [-1], n.fragment && n.fragment.p(n.ctx, e), n.after_update.forEach(se);
  }
}
function Un(n) {
  const e = [], t = [];
  Ie.forEach((i) => n.indexOf(i) === -1 ? e.push(i) : t.push(i)), t.forEach((i) => i()), Ie = e;
}
let Ce;
function Pn() {
  return Ce || (Ce = Promise.resolve(), Ce.then(() => {
    Ce = null;
  })), Ce;
}
function ze(n, e, t) {
  n.dispatchEvent(Qt(`${e ? "intro" : "outro"}${t}`));
}
const Re = /* @__PURE__ */ new Set();
let ce;
function ue() {
  ce = {
    r: 0,
    c: [],
    p: ce
    // parent group
  };
}
function fe() {
  ce.r || Y(ce.c), ce = ce.p;
}
function N(n, e) {
  n && n.i && (Re.delete(n), n.i(e));
}
function H(n, e, t, i) {
  if (n && n.o) {
    if (Re.has(n)) return;
    Re.add(n), ce.c.push(() => {
      Re.delete(n), i && (t && n.d(1), i());
    }), n.o(e);
  } else i && i();
}
const Hn = { duration: 0 };
function z(n, e, t, i) {
  let a = e(n, t, { direction: "both" }), l = i ? 0 : 1, r = null, o = null, d = null, u;
  function h() {
    d && Xt(n, d);
  }
  function f(g, $) {
    const p = (
      /** @type {Program['d']} */
      g.b - l
    );
    return $ *= Math.abs(p), {
      a: l,
      b: g.b,
      d: p,
      duration: $,
      start: g.start,
      end: g.start + $,
      group: g.group
    };
  }
  function _(g) {
    const {
      delay: $ = 0,
      duration: p = 300,
      easing: v = Xe,
      tick: E = K,
      css: m
    } = a || Hn, k = {
      start: Jt() + $,
      b: g
    };
    g || (k.group = ce, ce.r += 1), "inert" in n && (g ? u !== void 0 && (n.inert = u) : (u = /** @type {HTMLElement} */
    n.inert, n.inert = !0)), r || o ? o = k : (m && (h(), d = Ge(n, l, g, p, $, v, m)), g && E(0, 1), r = f(k, p), se(() => ze(n, g, "start")), Yt((D) => {
      if (o && D > o.start && (r = f(o, p), o = null, ze(n, r.b, "start"), m && (h(), d = Ge(
        n,
        l,
        r.b,
        r.duration,
        0,
        v,
        a.css
      ))), r) {
        if (D >= r.end)
          E(l = r.b, 1 - l), ze(n, r.b, "end"), o || (r.b ? h() : --r.group.r || Y(r.group.c)), r = null;
        else if (D >= r.start) {
          const A = D - r.start;
          l = r.a + r.d * v(A / r.duration), E(l, 1 - l);
        }
      }
      return !!(r || o);
    }));
  }
  return {
    run(g) {
      Pe(a) ? Pn().then(() => {
        a = a({ direction: g ? "in" : "out" }), _(g);
      }) : _(g);
    },
    end() {
      h(), r = o = null;
    }
  };
}
function ee(n) {
  return (n == null ? void 0 : n.length) !== void 0 ? n : Array.from(n);
}
function jn(n, e) {
  n.d(1), e.delete(n.key);
}
function Kn(n, e) {
  H(n, 1, 1, () => {
    e.delete(n.key);
  });
}
function it(n, e) {
  n.f(), Kn(n, e);
}
function Fe(n, e, t, i, s, a, l, r, o, d, u, h) {
  let f = n.length, _ = a.length, g = f;
  const $ = {};
  for (; g--; ) $[n[g].key] = g;
  const p = [], v = /* @__PURE__ */ new Map(), E = /* @__PURE__ */ new Map(), m = [];
  for (g = _; g--; ) {
    const P = h(s, a, g), J = t(P);
    let S = l.get(J);
    S ? m.push(() => S.p(P, e)) : (S = d(J, P), S.c()), v.set(J, p[g] = S), J in $ && E.set(J, Math.abs(g - $[J]));
  }
  const k = /* @__PURE__ */ new Set(), D = /* @__PURE__ */ new Set();
  function A(P) {
    N(P, 1), P.m(r, u), l.set(P.key, P), u = P.first, _--;
  }
  for (; f && _; ) {
    const P = p[_ - 1], J = n[f - 1], S = P.key, w = J.key;
    P === J ? (u = P.first, f--, _--) : v.has(w) ? !l.has(S) || k.has(S) ? A(P) : D.has(w) ? f-- : E.get(S) > E.get(w) ? (D.add(S), A(P)) : (k.add(w), f--) : (o(J, l), f--);
  }
  for (; f--; ) {
    const P = n[f];
    v.has(P.key) || o(P, l);
  }
  for (; _; ) A(p[_ - 1]);
  return Y(m), p;
}
function ye(n, e, t) {
  const i = n.$$.props[e];
  i !== void 0 && (n.$$.bound[i] = t, t(n.$$.ctx[i]));
}
function te(n) {
  n && n.c();
}
function W(n, e, t) {
  const { fragment: i, after_update: s } = n.$$;
  i && i.m(e, t), se(() => {
    const a = n.$$.on_mount.map(Kt).filter(Pe);
    n.$$.on_destroy ? n.$$.on_destroy.push(...a) : Y(a), n.$$.on_mount = [];
  }), s.forEach(se);
}
function Q(n, e) {
  const t = n.$$;
  t.fragment !== null && (Un(t.after_update), Y(t.on_destroy), t.fragment && t.fragment.d(e), t.on_destroy = t.fragment = null, t.ctx = []);
}
function Fn(n, e) {
  n.$$.dirty[0] === -1 && (De.push(n), Vn(), n.$$.dirty.fill(0)), n.$$.dirty[e / 31 | 0] |= 1 << e % 31;
}
function le(n, e, t, i, s, a, l = null, r = [-1]) {
  const o = Ee;
  Le(n);
  const d = n.$$ = {
    fragment: null,
    ctx: [],
    // state
    props: a,
    update: K,
    not_equal: s,
    bound: lt(),
    // lifecycle
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(e.context || (o ? o.$$.context : [])),
    // everything else
    callbacks: lt(),
    dirty: r,
    skip_bound: !1,
    root: e.target || o.$$.root
  };
  l && l(d.root);
  let u = !1;
  if (d.ctx = t ? t(n, e.props || {}, (h, f, ..._) => {
    const g = _.length ? _[0] : f;
    return d.ctx && s(d.ctx[h], d.ctx[h] = g) && (!d.skip_bound && d.bound[h] && d.bound[h](g), u && Fn(n, h)), f;
  }) : [], d.update(), u = !0, Y(d.before_update), d.fragment = i ? i(d.ctx) : !1, e.target) {
    if (e.hydrate) {
      const h = Ln(e.target);
      d.fragment && d.fragment.l(h), h.forEach(R);
    } else
      d.fragment && d.fragment.c();
    e.intro && N(n.$$.fragment), W(n, e.target, e.anchor), L();
  }
  Le(o);
}
let Zt;
typeof HTMLElement == "function" && (Zt = class extends HTMLElement {
  constructor(e, t, i) {
    super();
    /** The Svelte component constructor */
    O(this, "$$ctor");
    /** Slots */
    O(this, "$$s");
    /** The Svelte component instance */
    O(this, "$$c");
    /** Whether or not the custom element is connected */
    O(this, "$$cn", !1);
    /** Component props data */
    O(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    O(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    O(this, "$$p_d", {});
    /** @type {Record<string, Function[]>} Event listeners */
    O(this, "$$l", {});
    /** @type {Map<Function, Function>} Event listener unsubscribe functions */
    O(this, "$$l_u", /* @__PURE__ */ new Map());
    this.$$ctor = e, this.$$s = t, i && this.attachShadow({ mode: "open" });
  }
  addEventListener(e, t, i) {
    if (this.$$l[e] = this.$$l[e] || [], this.$$l[e].push(t), this.$$c) {
      const s = this.$$c.$on(e, t);
      this.$$l_u.set(t, s);
    }
    super.addEventListener(e, t, i);
  }
  removeEventListener(e, t, i) {
    if (super.removeEventListener(e, t, i), this.$$c) {
      const s = this.$$l_u.get(t);
      s && (s(), this.$$l_u.delete(t));
    }
  }
  async connectedCallback() {
    if (this.$$cn = !0, !this.$$c) {
      let e = function(a) {
        return () => {
          let l;
          return {
            c: function() {
              l = y("slot"), a !== "default" && c(l, "name", a);
            },
            /**
             * @param {HTMLElement} target
             * @param {HTMLElement} [anchor]
             */
            m: function(d, u) {
              B(d, l, u);
            },
            d: function(d) {
              d && R(l);
            }
          };
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const t = {}, i = En(this);
      for (const a of this.$$s)
        a in i && (t[a] = [e(a)]);
      for (const a of this.attributes) {
        const l = this.$$g_p(a.name);
        l in this.$$d || (this.$$d[l] = Ne(l, a.value, this.$$p_d, "toProp"));
      }
      for (const a in this.$$p_d)
        !(a in this.$$d) && this[a] !== void 0 && (this.$$d[a] = this[a], delete this[a]);
      this.$$c = new this.$$ctor({
        target: this.shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: t,
          $$scope: {
            ctx: []
          }
        }
      });
      const s = () => {
        this.$$r = !0;
        for (const a in this.$$p_d)
          if (this.$$d[a] = this.$$c.$$.ctx[this.$$c.$$.props[a]], this.$$p_d[a].reflect) {
            const l = Ne(
              a,
              this.$$d[a],
              this.$$p_d,
              "toAttribute"
            );
            l == null ? this.removeAttribute(this.$$p_d[a].attribute || a) : this.setAttribute(this.$$p_d[a].attribute || a, l);
          }
        this.$$r = !1;
      };
      this.$$c.$$.after_update.push(s), s();
      for (const a in this.$$l)
        for (const l of this.$$l[a]) {
          const r = this.$$c.$on(a, l);
          this.$$l_u.set(l, r);
        }
      this.$$l = {};
    }
  }
  // We don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
  // and setting attributes through setAttribute etc, this is helpful
  attributeChangedCallback(e, t, i) {
    var s;
    this.$$r || (e = this.$$g_p(e), this.$$d[e] = Ne(e, i, this.$$p_d, "toProp"), (s = this.$$c) == null || s.$set({ [e]: this.$$d[e] }));
  }
  disconnectedCallback() {
    this.$$cn = !1, Promise.resolve().then(() => {
      !this.$$cn && this.$$c && (this.$$c.$destroy(), this.$$c = void 0);
    });
  }
  $$g_p(e) {
    return Object.keys(this.$$p_d).find(
      (t) => this.$$p_d[t].attribute === e || !this.$$p_d[t].attribute && t.toLowerCase() === e
    ) || e;
  }
});
function Ne(n, e, t, i) {
  var a;
  const s = (a = t[n]) == null ? void 0 : a.type;
  if (e = s === "Boolean" && typeof e != "boolean" ? e != null : e, !i || !t[n])
    return e;
  if (i === "toAttribute")
    switch (s) {
      case "Object":
      case "Array":
        return e == null ? null : JSON.stringify(e);
      case "Boolean":
        return e ? "" : null;
      case "Number":
        return e ?? null;
      default:
        return e;
    }
  else
    switch (s) {
      case "Object":
      case "Array":
        return e && JSON.parse(e);
      case "Boolean":
        return e;
      case "Number":
        return e != null ? +e : e;
      default:
        return e;
    }
}
function re(n, e, t, i, s, a) {
  let l = class extends Zt {
    constructor() {
      super(n, t, s), this.$$p_d = e;
    }
    static get observedAttributes() {
      return Object.keys(e).map(
        (r) => (e[r].attribute || r).toLowerCase()
      );
    }
  };
  return Object.keys(e).forEach((r) => {
    Object.defineProperty(l.prototype, r, {
      get() {
        return this.$$c && r in this.$$c ? this.$$c[r] : this.$$d[r];
      },
      set(o) {
        var d;
        o = Ne(r, o, e), this.$$d[r] = o, (d = this.$$c) == null || d.$set({ [r]: o });
      }
    });
  }), i.forEach((r) => {
    Object.defineProperty(l.prototype, r, {
      get() {
        var o;
        return (o = this.$$c) == null ? void 0 : o[r];
      }
    });
  }), n.element = /** @type {any} */
  l, l;
}
class oe {
  constructor() {
    /**
     * ### PRIVATE API
     *
     * Do not use, may change at any time
     *
     * @type {any}
     */
    O(this, "$$");
    /**
     * ### PRIVATE API
     *
     * Do not use, may change at any time
     *
     * @type {any}
     */
    O(this, "$$set");
  }
  /** @returns {void} */
  $destroy() {
    Q(this, 1), this.$destroy = K;
  }
  /**
   * @template {Extract<keyof Events, string>} K
   * @param {K} type
   * @param {((e: Events[K]) => void) | null | undefined} callback
   * @returns {() => void}
   */
  $on(e, t) {
    if (!Pe(t))
      return K;
    const i = this.$$.callbacks[e] || (this.$$.callbacks[e] = []);
    return i.push(t), () => {
      const s = i.indexOf(t);
      s !== -1 && i.splice(s, 1);
    };
  }
  /**
   * @param {Partial<Props>} props
   * @returns {void}
   */
  $set(e) {
    this.$$set && !Mn(e) && (this.$$.skip_bound = !0, this.$$set(e), this.$$.skip_bound = !1);
  }
}
const qn = "4";
typeof window < "u" && (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(qn);
class Jn {
  constructor() {
    O(this, "keyCounter", 0);
  }
  getNewKey() {
    return (this.keyCounter++).toString(16);
  }
}
var ge = new Jn();
class Ye {
  constructor(e = "NONE", t = "{}") {
    O(this, "id");
    O(this, "type");
    O(this, "data");
    this.id = ge.getNewKey(), this.type = e, this.data = JSON.parse(t);
  }
}
class ot {
  constructor(e = []) {
    O(this, "id");
    O(this, "data", []);
    this.id = ge.getNewKey(), this.data = [], e.forEach((t) => {
      t != null && t.data && t.type ? this.data.push(new Ye(t.type, t.data)) : this.data.push(new Ye());
    });
  }
  addItem() {
    this.data.push(new Ye());
  }
  remItem(e) {
    let t = this.data.findIndex((i) => i.id == e);
    if (t == -1) {
      console.error("cant remove column, since id is not present in data");
      return;
    }
    this.data.splice(t, 1);
  }
}
class dt {
  constructor(e = []) {
    O(this, "id");
    O(this, "data", []);
    this.id = ge.getNewKey(), this.data = [], e.forEach((t) => {
      this.data.push(new ot(t.data));
    });
  }
  addColumn() {
    this.data.push(new ot());
  }
  remColumn(e) {
    let t = this.data.findIndex((i) => i.id == e);
    if (t == -1) {
      console.error("cant remove column, since id is not present in data");
      return;
    }
    this.data.splice(t, 1);
  }
}
class zn {
  constructor(e) {
    O(this, "id");
    O(this, "data", []);
    this.id = ge.getNewKey(), this.data = [], e.forEach((t) => {
      t.data && this.data.push(new dt(t.data));
    });
  }
  addRow() {
    this.data.push(new dt());
  }
  remRow(e) {
    let t = this.data.findIndex((i) => i.id == e);
    if (t == -1) {
      console.error("cant remove Row, since id is not present in data");
      return;
    }
    this.data.splice(t, 1);
  }
}
const we = [];
function Oe(n, e = K) {
  let t;
  const i = /* @__PURE__ */ new Set();
  function s(r) {
    if (ie(n, r) && (n = r, t)) {
      const o = !we.length;
      for (const d of i)
        d[1](), we.push(d, n);
      if (o) {
        for (let d = 0; d < we.length; d += 2)
          we[d][0](we[d + 1]);
        we.length = 0;
      }
    }
  }
  function a(r) {
    s(r(n));
  }
  function l(r, o = K) {
    const d = [r, o];
    return i.add(d), i.size === 1 && (t = e(s, a) || K), r(n), () => {
      i.delete(d), i.size === 0 && t && (t(), t = null);
    };
  }
  return { set: s, update: a, subscribe: l };
}
function st(n) {
  const e = n - 1;
  return e * e * e + 1;
}
function Te(n, { delay: e = 0, duration: t = 400, easing: i = Xe } = {}) {
  const s = +getComputedStyle(n).opacity;
  return {
    delay: e,
    duration: t,
    easing: i,
    css: (a) => `opacity: ${a * s}`
  };
}
function ut(n, { delay: e = 0, duration: t = 400, easing: i = st, x: s = 0, y: a = 0, opacity: l = 0 } = {}) {
  const r = getComputedStyle(n), o = +r.opacity, d = r.transform === "none" ? "" : r.transform, u = o * (1 - l), [h, f] = rt(s), [_, g] = rt(a);
  return {
    delay: e,
    duration: t,
    easing: i,
    css: ($, p) => `
			transform: ${d} translate(${(1 - $) * h}${f}, ${(1 - $) * _}${g});
			opacity: ${o - u * p}`
  };
}
function ae(n, { delay: e = 0, duration: t = 400, easing: i = st, axis: s = "y" } = {}) {
  const a = getComputedStyle(n), l = +a.opacity, r = s === "y" ? "height" : "width", o = parseFloat(a[r]), d = s === "y" ? ["top", "bottom"] : ["left", "right"], u = d.map(
    (v) => `${v[0].toUpperCase()}${v.slice(1)}`
  ), h = parseFloat(a[`padding${u[0]}`]), f = parseFloat(a[`padding${u[1]}`]), _ = parseFloat(a[`margin${u[0]}`]), g = parseFloat(a[`margin${u[1]}`]), $ = parseFloat(
    a[`border${u[0]}Width`]
  ), p = parseFloat(
    a[`border${u[1]}Width`]
  );
  return {
    delay: e,
    duration: t,
    easing: i,
    css: (v) => `overflow: hidden;opacity: ${Math.min(v * 20, 1) * l};${r}: ${v * o}px;padding-${d[0]}: ${v * h}px;padding-${d[1]}: ${v * f}px;margin-${d[0]}: ${v * _}px;margin-${d[1]}: ${v * g}px;border-${d[0]}-width: ${v * $}px;border-${d[1]}-width: ${v * p}px;`
  };
}
var _e = /* @__PURE__ */ ((n) => (n.HitPoints = "HitPoints", n.ProficiencyBonus = "ProficiencyBonus", n.SkillProficiencies = "SkillProficiencies", n.SpellInfo = "SpellInfo", n.Stats = "Stats", n))(_e || {});
function Yn(n, { from: e, to: t }, i = {}) {
  const s = getComputedStyle(n), a = s.transform === "none" ? "" : s.transform, [l, r] = s.transformOrigin.split(" ").map(parseFloat), o = e.left + e.width * l / t.width - (t.left + l), d = e.top + e.height * r / t.height - (t.top + r), { delay: u = 0, duration: h = (_) => Math.sqrt(_) * 120, easing: f = st } = i;
  return {
    delay: u,
    duration: Pe(h) ? h(Math.sqrt(o * o + d * d)) : h,
    easing: f,
    css: (_, g) => {
      const $ = g * o, p = g * d, v = _ + g * e.width / t.width, E = _ + g * e.height / t.height;
      return `transform: ${a} translate(${$}px, ${p}px) scale(${v}, ${E});`;
    }
  };
}
function ft(n, e, t) {
  const i = n.slice();
  return i[23] = e[t], i;
}
function ct(n) {
  let e, t = (
    /*selected*/
    (n[0] == null ? (
      /*unSelectedplaceholder*/
      n[2]
    ) : (
      /*selected*/
      n[0]
    )) + ""
  ), i, s, a, l, r, o;
  return {
    c() {
      e = y("div"), i = G(t), c(e, "class", "GrobSelectLabel effect"), c(e, "data-isdisabled", s = /*disabled*/
      n[3] ?? !1), c(e, "data-iserror", a = /*isError*/
      n[4] ?? !1), c(e, "data-selected", l = /*selected*/
      n[0] ?? !1), c(e, "tabindex", "-1");
    },
    m(d, u) {
      B(d, e, u), b(e, i), n[17](e), r || (o = [
        U(
          e,
          "focus",
          /*onFocus*/
          n[13]
        ),
        U(
          e,
          "blur",
          /*onblur*/
          n[14]
        )
      ], r = !0);
    },
    p(d, u) {
      u & /*selected, unSelectedplaceholder*/
      5 && t !== (t = /*selected*/
      (d[0] == null ? (
        /*unSelectedplaceholder*/
        d[2]
      ) : (
        /*selected*/
        d[0]
      )) + "") && de(i, t), u & /*disabled*/
      8 && s !== (s = /*disabled*/
      d[3] ?? !1) && c(e, "data-isdisabled", s), u & /*isError*/
      16 && a !== (a = /*isError*/
      d[4] ?? !1) && c(e, "data-iserror", a), u & /*selected*/
      1 && l !== (l = /*selected*/
      d[0] ?? !1) && c(e, "data-selected", l);
    },
    d(d) {
      d && R(e), n[17](null), r = !1, Y(o);
    }
  };
}
function ht(n) {
  let e, t, i, s, a, l = [], r = /* @__PURE__ */ new Map(), o, d, u, h, f, _, g = ee(
    /*options*/
    n[1]
  );
  const $ = (v) => (
    /*opt*/
    v[23]
  );
  for (let v = 0; v < g.length; v += 1) {
    let E = ft(n, g, v), m = $(E);
    r.set(m, l[v] = gt(m, E));
  }
  let p = (
    /*options*/
    n[1].length == 0 && _t()
  );
  return {
    c() {
      var v, E, m, k;
      e = y("div"), t = y("div"), i = y("div"), a = j();
      for (let D = 0; D < l.length; D += 1)
        l[D].c();
      o = j(), p && p.c(), d = j(), u = y("div"), c(i, "class", "Arrow"), c(i, "style", s = `left:${/*arrowOffsetLeft*/
      n[12]}px`), c(t, "class", "ArrowContainer"), c(u, "class", "selectEndTracker"), c(e, "class", "SelectPopUp"), c(e, "style", h = "width:" + /*labelRect*/
      (((v = n[7]) == null ? void 0 : v.width) ?? 100) + "px;left: " + /*labelRect*/
      (((E = n[7]) == null ? void 0 : E.x) ?? 0) + "px;top: " + /*labelRect*/
      ((((m = n[7]) == null ? void 0 : m.y) ?? 0) + /*labelRect*/
      (((k = n[7]) == null ? void 0 : k.height) ?? 0) + 8) + "px;max-height:" + /*override_maxHeight*/
      n[11] + "px");
    },
    m(v, E) {
      B(v, e, E), b(e, t), b(t, i), n[18](t), b(e, a);
      for (let m = 0; m < l.length; m += 1)
        l[m] && l[m].m(e, null);
      b(e, o), p && p.m(e, null), b(e, d), b(e, u), n[19](u), _ = !0;
    },
    p(v, E) {
      var m, k, D, A;
      (!_ || E & /*arrowOffsetLeft*/
      4096 && s !== (s = `left:${/*arrowOffsetLeft*/
      v[12]}px`)) && c(i, "style", s), E & /*selected, options, clickOption*/
      32771 && (g = ee(
        /*options*/
        v[1]
      ), l = Fe(l, E, $, 1, v, g, r, e, jn, gt, o, ft)), /*options*/
      v[1].length == 0 ? p || (p = _t(), p.c(), p.m(e, d)) : p && (p.d(1), p = null), (!_ || E & /*labelRect, override_maxHeight*/
      2176 && h !== (h = "width:" + /*labelRect*/
      (((m = v[7]) == null ? void 0 : m.width) ?? 100) + "px;left: " + /*labelRect*/
      (((k = v[7]) == null ? void 0 : k.x) ?? 0) + "px;top: " + /*labelRect*/
      ((((D = v[7]) == null ? void 0 : D.y) ?? 0) + /*labelRect*/
      (((A = v[7]) == null ? void 0 : A.height) ?? 0) + 8) + "px;max-height:" + /*override_maxHeight*/
      v[11] + "px")) && c(e, "style", h);
    },
    i(v) {
      _ || (v && se(() => {
        _ && (f || (f = z(e, ae, {}, !0)), f.run(1));
      }), _ = !0);
    },
    o(v) {
      v && (f || (f = z(e, ae, {}, !1)), f.run(0)), _ = !1;
    },
    d(v) {
      v && R(e), n[18](null);
      for (let E = 0; E < l.length; E += 1)
        l[E].d();
      p && p.d(), n[19](null), v && f && f.end();
    }
  };
}
function gt(n, e) {
  let t, i = (
    /*opt*/
    e[23] + ""
  ), s, a, l, r, o;
  return {
    key: n,
    first: null,
    c() {
      t = y("div"), s = G(i), c(t, "role", "none"), c(t, "class", "GrobSelectOption"), c(t, "data-selected", a = /*selected*/
      e[0] == /*opt*/
      e[23]), c(t, "data-value", l = /*opt*/
      e[23]), this.first = t;
    },
    m(d, u) {
      B(d, t, u), b(t, s), r || (o = [
        U(
          t,
          "click",
          /*clickOption*/
          e[15]
        ),
        U(
          t,
          "keydown",
          /*clickOption*/
          e[15]
        )
      ], r = !0);
    },
    p(d, u) {
      e = d, u & /*options*/
      2 && i !== (i = /*opt*/
      e[23] + "") && de(s, i), u & /*selected, options*/
      3 && a !== (a = /*selected*/
      e[0] == /*opt*/
      e[23]) && c(t, "data-selected", a), u & /*options*/
      2 && l !== (l = /*opt*/
      e[23]) && c(t, "data-value", l);
    },
    d(d) {
      d && R(t), r = !1, Y(o);
    }
  };
}
function _t(n) {
  let e;
  return {
    c() {
      e = y("i"), e.textContent = "No Options", c(e, "class", "GrobSelectInfo");
    },
    m(t, i) {
      B(t, e, i);
    },
    d(t) {
      t && R(e);
    }
  };
}
function Gn(n) {
  let e, t = (
    /*selected*/
    n[0]
  ), i, s, a = ct(n), l = (
    /*isFocussed*/
    (n[8] || /*forceOpen*/
    n[5]) && ht(n)
  );
  return {
    c() {
      e = y("div"), a.c(), i = j(), s = y("div"), l && l.c(), c(e, "class", "GrobSelect");
    },
    m(r, o) {
      B(r, e, o), a.m(e, null), b(e, i), b(e, s), l && l.m(s, null);
    },
    p(r, [o]) {
      o & /*selected*/
      1 && ie(t, t = /*selected*/
      r[0]) ? (a.d(1), a = ct(r), a.c(), a.m(e, i)) : a.p(r, o), /*isFocussed*/
      r[8] || /*forceOpen*/
      r[5] ? l ? (l.p(r, o), o & /*isFocussed, forceOpen*/
      288 && N(l, 1)) : (l = ht(r), l.c(), N(l, 1), l.m(s, null)) : l && (ue(), H(l, 1, 1, () => {
        l = null;
      }), fe());
    },
    i(r) {
      N(l);
    },
    o(r) {
      H(l);
    },
    d(r) {
      r && R(e), a.d(r), l && l.d();
    }
  };
}
const Wn = 100;
function Qn(n, e, t) {
  let i = nt(), { options: s } = e, { selected: a = null } = e, { unSelectedplaceholder: l = "None Selected" } = e, { disabled: r = !1 } = e, { isError: o = !1 } = e, { forceOpen: d = !1 } = e, { maxHeight: u = 500 } = e, h, f, _ = !1, g, $, p = u, v = 0;
  function E() {
    const w = h.getBoundingClientRect();
    t(7, f = w), t(8, _ = !0), A(), setTimeout(D, Wn);
  }
  function m() {
    setTimeout(
      () => {
        t(8, _ = !1);
      },
      200
    );
  }
  function k(w) {
    let F = w.target.getAttribute("data-value");
    a == F ? (t(0, a = null), i("onDeselect")) : (t(0, a = F), i("onSelect", a));
  }
  function D() {
    let w = $.getBoundingClientRect().bottom, F = g.getBoundingClientRect().bottom, X = window.document.body.getBoundingClientRect().height;
    if (F > X) {
      let Z = F - X, I = F - w - Z;
      I < p && t(11, p = I);
    }
  }
  function A() {
    let w = h.getBoundingClientRect().width;
    t(12, v = w / 2);
  }
  function P(w) {
    ne[w ? "unshift" : "push"](() => {
      h = w, t(6, h);
    });
  }
  function J(w) {
    ne[w ? "unshift" : "push"](() => {
      $ = w, t(10, $);
    });
  }
  function S(w) {
    ne[w ? "unshift" : "push"](() => {
      g = w, t(9, g);
    });
  }
  return n.$$set = (w) => {
    "options" in w && t(1, s = w.options), "selected" in w && t(0, a = w.selected), "unSelectedplaceholder" in w && t(2, l = w.unSelectedplaceholder), "disabled" in w && t(3, r = w.disabled), "isError" in w && t(4, o = w.isError), "forceOpen" in w && t(5, d = w.forceOpen), "maxHeight" in w && t(16, u = w.maxHeight);
  }, [
    a,
    s,
    l,
    r,
    o,
    d,
    h,
    f,
    _,
    g,
    $,
    p,
    v,
    E,
    m,
    k,
    u,
    P,
    J,
    S
  ];
}
class Xn extends oe {
  constructor(e) {
    super(), le(this, e, Qn, Gn, ie, {
      options: 1,
      selected: 0,
      unSelectedplaceholder: 2,
      disabled: 3,
      isError: 4,
      forceOpen: 5,
      maxHeight: 16
    });
  }
  get options() {
    return this.$$.ctx[1];
  }
  set options(e) {
    this.$$set({ options: e }), L();
  }
  get selected() {
    return this.$$.ctx[0];
  }
  set selected(e) {
    this.$$set({ selected: e }), L();
  }
  get unSelectedplaceholder() {
    return this.$$.ctx[2];
  }
  set unSelectedplaceholder(e) {
    this.$$set({ unSelectedplaceholder: e }), L();
  }
  get disabled() {
    return this.$$.ctx[3];
  }
  set disabled(e) {
    this.$$set({ disabled: e }), L();
  }
  get isError() {
    return this.$$.ctx[4];
  }
  set isError(e) {
    this.$$set({ isError: e }), L();
  }
  get forceOpen() {
    return this.$$.ctx[5];
  }
  set forceOpen(e) {
    this.$$set({ forceOpen: e }), L();
  }
  get maxHeight() {
    return this.$$.ctx[16];
  }
  set maxHeight(e) {
    this.$$set({ maxHeight: e }), L();
  }
}
re(Xn, { options: {}, selected: {}, unSelectedplaceholder: {}, disabled: { type: "Boolean" }, isError: { type: "Boolean" }, forceOpen: { type: "Boolean" }, maxHeight: {} }, [], [], !0);
function mt(n, e, t) {
  const i = n.slice();
  return i[8] = e[t], i;
}
function pt(n) {
  let e, t = (
    /*opt*/
    n[8] + ""
  ), i, s;
  return {
    c() {
      e = y("option"), i = G(t), s = j(), e.__value = /*opt*/
      n[8], me(e, e.__value), e.selected = /*selected*/
      n[2] == /*opt*/
      n[8];
    },
    m(a, l) {
      B(a, e, l), b(e, i), b(e, s);
    },
    p: K,
    d(a) {
      a && R(e);
    }
  };
}
function Zn(n) {
  let e, t, i, s, a, l, r, o = ee(
    /*options*/
    n[1]
  ), d = [];
  for (let u = 0; u < o.length; u += 1)
    d[u] = pt(mt(n, o, u));
  return {
    c() {
      e = y("div"), t = y("div"), i = y("div"), s = y("select"), a = y("option"), a.textContent = "choose component ";
      for (let u = 0; u < d.length; u += 1)
        d[u].c();
      a.__value = null, me(a, a.__value), c(i, "class", "ItemOptionBtn "), c(t, "class", "ItemOptions"), c(e, "class", "ItemOptionsContainer");
    },
    m(u, h) {
      B(u, e, h), b(e, t), b(t, i), b(i, s), b(s, a);
      for (let f = 0; f < d.length; f += 1)
        d[f] && d[f].m(s, null);
      n[6](s), l || (r = U(
        s,
        "change",
        /*selectOption*/
        n[3]
      ), l = !0);
    },
    p(u, [h]) {
      if (h & /*options, selected*/
      6) {
        o = ee(
          /*options*/
          u[1]
        );
        let f;
        for (f = 0; f < o.length; f += 1) {
          const _ = mt(u, o, f);
          d[f] ? d[f].p(_, h) : (d[f] = pt(_), d[f].c(), d[f].m(s, null));
        }
        for (; f < d.length; f += 1)
          d[f].d(1);
        d.length = o.length;
      }
    },
    i: K,
    o: K,
    d(u) {
      u && R(e), He(d, u), n[6](null), l = !1, r();
    }
  };
}
function xn(n, e, t) {
  let i = nt(), { data: s } = e, { editMode: a } = e, l = Object.keys(_e), r = s.type, o;
  function d() {
    let h = o.value;
    t(4, s.type = h, s), i("optionSelected"), console.log("optionSelected", h);
  }
  function u(h) {
    ne[h ? "unshift" : "push"](() => {
      o = h, t(0, o), t(1, l);
    });
  }
  return n.$$set = (h) => {
    "data" in h && t(4, s = h.data), "editMode" in h && t(5, a = h.editMode);
  }, [o, l, r, d, s, a, u];
}
class xt extends oe {
  constructor(e) {
    super(), le(this, e, xn, Zn, ie, { data: 4, editMode: 5 });
  }
  get data() {
    return this.$$.ctx[4];
  }
  set data(e) {
    this.$$set({ data: e }), L();
  }
  get editMode() {
    return this.$$.ctx[5];
  }
  set editMode(e) {
    this.$$set({ editMode: e }), L();
  }
}
re(xt, { data: {}, editMode: {} }, [], [], !0);
function ei(n) {
  let e, t, i;
  return {
    c() {
      e = y("div"), e.textContent = "Hit Point Maximum", t = j(), i = y("input"), c(i, "type", "number");
    },
    m(s, a) {
      B(s, e, a), B(s, t, a), B(s, i, a);
    },
    d(s) {
      s && (R(e), R(t), R(i));
    }
  };
}
function ti(n) {
  let e, t, i;
  return {
    c() {
      e = y("div"), e.textContent = "Hit Point Maximum", t = j(), i = y("input"), c(i, "type", "number");
    },
    m(s, a) {
      B(s, e, a), B(s, t, a), B(s, i, a);
    },
    d(s) {
      s && (R(e), R(t), R(i));
    }
  };
}
function ni(n) {
  let e, t, i;
  return {
    c() {
      e = y("div"), e.textContent = "Hit Point Maximum", t = j(), i = y("input"), c(i, "type", "number");
    },
    m(s, a) {
      B(s, e, a), B(s, t, a), B(s, i, a);
    },
    d(s) {
      s && (R(e), R(t), R(i));
    }
  };
}
function ii(n) {
  let e, t, i, s, a, l, r, o, d, u, h, f;
  function _(p, v) {
    return (
      /*editMode*/
      p[0] ? ni : (
        /*playMode*/
        p[1] ? ti : ei
      )
    );
  }
  let g = _(n), $ = g(n);
  return {
    c() {
      e = y("div"), t = y("div"), t.textContent = "Hit Points", i = j(), s = y("input"), l = j(), r = y("div"), r.textContent = "temporary Hit Points", o = j(), d = y("input"), u = j(), $.c(), c(s, "type", "number"), s.disabled = a = !/*editMode*/
      n[0], c(d, "type", "number");
    },
    m(p, v) {
      B(p, e, v), b(e, t), b(e, i), b(e, s), me(
        s,
        /*v*/
        n[2]
      ), b(e, l), b(e, r), b(e, o), b(e, d), b(e, u), $.m(e, null), h || (f = [
        U(
          s,
          "input",
          /*input0_input_handler*/
          n[6]
        ),
        U(
          s,
          "change",
          /*iterateValue*/
          n[3]
        )
      ], h = !0);
    },
    p(p, [v]) {
      v & /*editMode*/
      1 && a !== (a = !/*editMode*/
      p[0]) && (s.disabled = a), v & /*v*/
      4 && je(s.value) !== /*v*/
      p[2] && me(
        s,
        /*v*/
        p[2]
      ), g !== (g = _(p)) && ($.d(1), $ = g(p), $ && ($.c(), $.m(e, null)));
    },
    i: K,
    o: K,
    d(p) {
      p && R(e), $.d(), h = !1, Y(f);
    }
  };
}
function si(n, e, t) {
  let { sys: i } = e, { editMode: s } = e, { playMode: a } = e, { data: l } = e, r = i.fixed.generic["Hit Points"], o = r.getValue();
  const d = ge.getNewKey();
  Me(() => {
    r.addUpdateListener(name + d + "SvelteView", () => {
      t(2, o = r.getValue());
    });
  }), Ae(() => {
    r.removeUpdateListener(name + d + "SvelteView");
  });
  function u() {
    return r.setValue(o), null;
  }
  function h() {
    o = je(this.value), t(2, o);
  }
  return n.$$set = (f) => {
    "sys" in f && t(4, i = f.sys), "editMode" in f && t(0, s = f.editMode), "playMode" in f && t(1, a = f.playMode), "data" in f && t(5, l = f.data);
  }, [s, a, o, u, i, l, h];
}
class en extends oe {
  constructor(e) {
    super(), le(this, e, si, ii, ie, {
      sys: 4,
      editMode: 0,
      playMode: 1,
      data: 5
    });
  }
  get sys() {
    return this.$$.ctx[4];
  }
  set sys(e) {
    this.$$set({ sys: e }), L();
  }
  get editMode() {
    return this.$$.ctx[0];
  }
  set editMode(e) {
    this.$$set({ editMode: e }), L();
  }
  get playMode() {
    return this.$$.ctx[1];
  }
  set playMode(e) {
    this.$$set({ playMode: e }), L();
  }
  get data() {
    return this.$$.ctx[5];
  }
  set data(e) {
    this.$$set({ data: e }), L();
  }
}
re(en, { sys: {}, editMode: {}, playMode: {}, data: {} }, [], [], !0);
function ai(n) {
  let e, t, i, s, a, l, r;
  return {
    c() {
      e = y("div"), t = y("div"), t.textContent = "Proficiency Bonus", i = j(), s = y("input"), c(s, "type", "number"), s.disabled = a = !/*editMode*/
      n[0], c(e, "class", "ProficiencyBonus");
    },
    m(o, d) {
      B(o, e, d), b(e, t), b(e, i), b(e, s), me(
        s,
        /*v*/
        n[1]
      ), l || (r = [
        U(
          s,
          "input",
          /*input_input_handler*/
          n[5]
        ),
        U(
          s,
          "change",
          /*iterateValue*/
          n[2]
        )
      ], l = !0);
    },
    p(o, [d]) {
      d & /*editMode*/
      1 && a !== (a = !/*editMode*/
      o[0]) && (s.disabled = a), d & /*v*/
      2 && je(s.value) !== /*v*/
      o[1] && me(
        s,
        /*v*/
        o[1]
      );
    },
    i: K,
    o: K,
    d(o) {
      o && R(e), l = !1, Y(r);
    }
  };
}
function li(n, e, t) {
  let { sys: i } = e, { editMode: s } = e, { data: a } = e, l = i.fixed.generic["Proficiency Bonus"], r = l.getValue();
  const o = ge.getNewKey();
  Me(() => {
    l.addUpdateListener(name + o + "SvelteView", () => {
      t(1, r = l.getValue());
    });
  }), Ae(() => {
    l.removeUpdateListener(name + o + "SvelteView");
  });
  function d() {
    return l.setValue(r), null;
  }
  function u() {
    r = je(this.value), t(1, r);
  }
  return n.$$set = (h) => {
    "sys" in h && t(3, i = h.sys), "editMode" in h && t(0, s = h.editMode), "data" in h && t(4, a = h.data);
  }, [s, r, d, i, a, u];
}
class tn extends oe {
  constructor(e) {
    super(), le(this, e, li, ai, ie, { sys: 3, editMode: 0, data: 4 });
  }
  get sys() {
    return this.$$.ctx[3];
  }
  set sys(e) {
    this.$$set({ sys: e }), L();
  }
  get editMode() {
    return this.$$.ctx[0];
  }
  set editMode(e) {
    this.$$set({ editMode: e }), L();
  }
  get data() {
    return this.$$.ctx[4];
  }
  set data(e) {
    this.$$set({ data: e }), L();
  }
}
re(tn, { sys: {}, editMode: {}, data: {} }, [], [], !0);
function ri(n) {
  let e, t, i, s, a, l, r, o, d, u, h, f, _;
  return {
    c() {
      e = y("div"), t = y("div"), i = y("div"), s = j(), a = y("div"), l = y("p"), r = G(
        /*name*/
        n[1]
      ), o = j(), d = y("div"), u = y("p"), h = G(
        /*bonus*/
        n[3]
      ), c(i, "class", "skillproficiencyMark"), c(
        i,
        "data-level",
        /*value*/
        n[2]
      ), c(i, "role", "none"), c(t, "class", "skillproficiencyMarkParent"), c(a, "class", "skillproficiencyMarkName"), c(d, "class", "skillproficiencyMarkValue"), c(e, "class", "skillproficiencyContainer"), c(
        e,
        "data-edit",
        /*edit*/
        n[0]
      );
    },
    m(g, $) {
      B(g, e, $), b(e, t), b(t, i), b(e, s), b(e, a), b(a, l), b(l, r), b(e, o), b(e, d), b(d, u), b(u, h), f || (_ = [
        U(
          i,
          "keyup",
          /*keyup_handler*/
          n[6]
        ),
        U(
          i,
          "click",
          /*iterateValue*/
          n[4]
        )
      ], f = !0);
    },
    p(g, [$]) {
      $ & /*value*/
      4 && c(
        i,
        "data-level",
        /*value*/
        g[2]
      ), $ & /*name*/
      2 && de(
        r,
        /*name*/
        g[1]
      ), $ & /*bonus*/
      8 && de(
        h,
        /*bonus*/
        g[3]
      ), $ & /*edit*/
      1 && c(
        e,
        "data-edit",
        /*edit*/
        g[0]
      );
    },
    i: K,
    o: K,
    d(g) {
      g && R(e), f = !1, Y(_);
    }
  };
}
function oi(n, e, t) {
  let { edit: i } = e, { name: s } = e, { sys: a } = e, l = a.fixed.SkillProficiencies[s], r = a.derived.skillproficiencyBonus[s], o = l.getValue(), d = r.getValue();
  const u = ge.getNewKey();
  Me(() => {
    l.addUpdateListener(s + u + "SvelteView", () => {
      t(2, o = l.getValue());
    }), r.addUpdateListener(s + u + "SvelteView", () => {
      t(3, d = r.getValue());
    });
  }), Ae(() => {
    l.removeUpdateListener(s + "SvelteView"), r.removeUpdateListener(s + "SvelteView");
  });
  function h() {
    if (!i)
      return;
    let _ = l.getValue();
    return _ = (_ + 1) % 3, l.setValue(_), null;
  }
  function f(_) {
    pe.call(this, n, _);
  }
  return n.$$set = (_) => {
    "edit" in _ && t(0, i = _.edit), "name" in _ && t(1, s = _.name), "sys" in _ && t(5, a = _.sys);
  }, [i, s, o, d, h, a, f];
}
class nn extends oe {
  constructor(e) {
    super(), le(this, e, oi, ri, ie, { edit: 0, name: 1, sys: 5 });
  }
  get edit() {
    return this.$$.ctx[0];
  }
  set edit(e) {
    this.$$set({ edit: e }), L();
  }
  get name() {
    return this.$$.ctx[1];
  }
  set name(e) {
    this.$$set({ name: e }), L();
  }
  get sys() {
    return this.$$.ctx[5];
  }
  set sys(e) {
    this.$$set({ sys: e }), L();
  }
}
re(nn, { edit: {}, name: {}, sys: {} }, [], [], !0);
function vt(n, e, t) {
  const i = n.slice();
  return i[4] = e[t], i;
}
function bt(n) {
  let e, t;
  return e = new nn({
    props: {
      edit: (
        /*edit*/
        n[0]
      ),
      name: (
        /*name*/
        n[4]
      ),
      sys: (
        /*sys*/
        n[1]
      )
    }
  }), {
    c() {
      te(e.$$.fragment);
    },
    m(i, s) {
      W(e, i, s), t = !0;
    },
    p(i, s) {
      const a = {};
      s & /*edit*/
      1 && (a.edit = /*edit*/
      i[0]), s & /*sys*/
      2 && (a.sys = /*sys*/
      i[1]), e.$set(a);
    },
    i(i) {
      t || (N(e.$$.fragment, i), t = !0);
    },
    o(i) {
      H(e.$$.fragment, i), t = !1;
    },
    d(i) {
      Q(e, i);
    }
  };
}
function di(n) {
  let e, t, i = ee(
    /*names*/
    n[2]
  ), s = [];
  for (let l = 0; l < i.length; l += 1)
    s[l] = bt(vt(n, i, l));
  const a = (l) => H(s[l], 1, 1, () => {
    s[l] = null;
  });
  return {
    c() {
      e = y("div");
      for (let l = 0; l < s.length; l += 1)
        s[l].c();
      c(e, "class", "skillproficiencyCollection"), c(
        e,
        "data-edit",
        /*edit*/
        n[0]
      );
    },
    m(l, r) {
      B(l, e, r);
      for (let o = 0; o < s.length; o += 1)
        s[o] && s[o].m(e, null);
      t = !0;
    },
    p(l, [r]) {
      if (r & /*edit, names, sys*/
      7) {
        i = ee(
          /*names*/
          l[2]
        );
        let o;
        for (o = 0; o < i.length; o += 1) {
          const d = vt(l, i, o);
          s[o] ? (s[o].p(d, r), N(s[o], 1)) : (s[o] = bt(d), s[o].c(), N(s[o], 1), s[o].m(e, null));
        }
        for (ue(), o = i.length; o < s.length; o += 1)
          a(o);
        fe();
      }
      (!t || r & /*edit*/
      1) && c(
        e,
        "data-edit",
        /*edit*/
        l[0]
      );
    },
    i(l) {
      if (!t) {
        for (let r = 0; r < i.length; r += 1)
          N(s[r]);
        t = !0;
      }
    },
    o(l) {
      s = s.filter(Boolean);
      for (let r = 0; r < s.length; r += 1)
        H(s[r]);
      t = !1;
    },
    d(l) {
      l && R(e), He(s, l);
    }
  };
}
function ui(n, e, t) {
  let { edit: i } = e, { sys: s } = e, { data: a } = e, l = Object.keys(s.fixed.SkillProficiencies);
  return n.$$set = (r) => {
    "edit" in r && t(0, i = r.edit), "sys" in r && t(1, s = r.sys), "data" in r && t(3, a = r.data);
  }, [i, s, l, a];
}
class sn extends oe {
  constructor(e) {
    super(), le(this, e, ui, di, ie, { edit: 0, sys: 1, data: 3 });
  }
  get edit() {
    return this.$$.ctx[0];
  }
  set edit(e) {
    this.$$set({ edit: e }), L();
  }
  get sys() {
    return this.$$.ctx[1];
  }
  set sys(e) {
    this.$$set({ sys: e }), L();
  }
  get data() {
    return this.$$.ctx[3];
  }
  set data(e) {
    this.$$set({ data: e }), L();
  }
}
re(sn, { edit: {}, sys: {}, data: {} }, [], [], !0);
function yt(n, e, t) {
  const i = n.slice();
  return i[16] = e[t], i;
}
function fi(n) {
  let e;
  return {
    c() {
      e = y("div");
    },
    m(t, i) {
      B(t, e, i);
    },
    p: K,
    d(t) {
      t && R(e);
    }
  };
}
function ci(n) {
  let e, t, i, s, a = ee(Object.keys(
    /*sys*/
    n[0].derived["Spell Bonus"]
  )), l = [];
  for (let r = 0; r < a.length; r += 1)
    l[r] = $t(yt(n, a, r));
  return {
    c() {
      e = y("div"), t = y("select");
      for (let r = 0; r < l.length; r += 1)
        l[r].c();
    },
    m(r, o) {
      B(r, e, o), b(e, t);
      for (let d = 0; d < l.length; d += 1)
        l[d] && l[d].m(t, null);
      n[8](t), i || (s = U(
        t,
        "change",
        /*changeSort*/
        n[6]
      ), i = !0);
    },
    p(r, o) {
      if (o & /*Object, sys, showStat*/
      5) {
        a = ee(Object.keys(
          /*sys*/
          r[0].derived["Spell Bonus"]
        ));
        let d;
        for (d = 0; d < a.length; d += 1) {
          const u = yt(r, a, d);
          l[d] ? l[d].p(u, o) : (l[d] = $t(u), l[d].c(), l[d].m(t, null));
        }
        for (; d < l.length; d += 1)
          l[d].d(1);
        l.length = a.length;
      }
    },
    d(r) {
      r && R(e), He(l, r), n[8](null), i = !1, s();
    }
  };
}
function $t(n) {
  let e, t = (
    /*key*/
    n[16] + ""
  ), i, s, a, l;
  return {
    c() {
      e = y("option"), i = G(t), s = j(), e.__value = a = /*key*/
      n[16], me(e, e.__value), e.selected = l = /*key*/
      n[16] == /*showStat*/
      n[2];
    },
    m(r, o) {
      B(r, e, o), b(e, i), b(e, s);
    },
    p(r, o) {
      o & /*sys*/
      1 && t !== (t = /*key*/
      r[16] + "") && de(i, t), o & /*sys*/
      1 && a !== (a = /*key*/
      r[16]) && (e.__value = a, me(e, e.__value)), o & /*sys, showStat*/
      5 && l !== (l = /*key*/
      r[16] == /*showStat*/
      r[2]) && (e.selected = l);
    },
    d(r) {
      r && R(e);
    }
  };
}
function hi(n) {
  let e, t, i, s, a, l, r, o, d, u, h, f, _, g, $, p, v;
  function E(D, A) {
    return (
      /*edit*/
      D[1] ? ci : fi
    );
  }
  let m = E(n), k = m(n);
  return {
    c() {
      e = y("div"), k.c(), t = j(), i = y("div"), s = y("div"), a = G(
        /*showStat*/
        n[2]
      ), l = j(), r = y("div"), o = y("div"), o.textContent = "Spell DC", d = j(), u = y("div"), h = G(
        /*chosen_DC*/
        n[3]
      ), f = j(), _ = y("div"), g = y("div"), g.textContent = "Spell Bonus", $ = j(), p = y("div"), v = G(
        /*chosen_BONUS*/
        n[4]
      ), c(i, "class", "spellDCContainer");
    },
    m(D, A) {
      B(D, e, A), k.m(e, null), b(e, t), b(e, i), b(i, s), b(s, a), b(i, l), b(i, r), b(r, o), b(r, d), b(r, u), b(u, h), b(i, f), b(i, _), b(_, g), b(_, $), b(_, p), b(p, v);
    },
    p(D, [A]) {
      m === (m = E(D)) && k ? k.p(D, A) : (k.d(1), k = m(D), k && (k.c(), k.m(e, t))), A & /*showStat*/
      4 && de(
        a,
        /*showStat*/
        D[2]
      ), A & /*chosen_DC*/
      8 && de(
        h,
        /*chosen_DC*/
        D[3]
      ), A & /*chosen_BONUS*/
      16 && de(
        v,
        /*chosen_BONUS*/
        D[4]
      );
    },
    i: K,
    o: K,
    d(D) {
      D && R(e), k.d();
    }
  };
}
function gi(n, e, t) {
  let { sys: i } = e, { edit: s } = e, { data: a } = e;
  const l = ge.getNewKey();
  let r = a.data;
  JSON.stringify(r) === JSON.stringify({}) && (r.showStat = Object.keys(i.derived["Spell Bonus"])[0]);
  let o = r.showStat, d = i.derived["Spell Bonus"][o], u = i.derived["Spell DC"][o], h = d.getValue(), f = u.getValue(), _;
  function g() {
    let m = _.value;
    t(2, o = m), d = i.derived["Spell Bonus"][o], u = i.derived["Spell DC"][o], t(3, h = d.getValue()), t(4, f = u.getValue());
  }
  function $() {
    t(3, h = d.getValue()), t(4, f = u.getValue());
  }
  function p() {
    d.addUpdateListener(name + "SpellInfoView" + l, () => {
      $();
    }), u.addUpdateListener(name + "SpellInfoView" + l, () => {
      $();
    });
  }
  Me(() => {
    p();
  });
  function v() {
    d.removeUpdateListener(name + "SpellInfoView" + l), u.removeUpdateListener(name + "SpellInfoView" + l);
  }
  Ae(() => {
    v();
  });
  function E(m) {
    ne[m ? "unshift" : "push"](() => {
      _ = m, t(5, _), t(0, i);
    });
  }
  return n.$$set = (m) => {
    "sys" in m && t(0, i = m.sys), "edit" in m && t(1, s = m.edit), "data" in m && t(7, a = m.data);
  }, [
    i,
    s,
    o,
    h,
    f,
    _,
    g,
    a,
    E
  ];
}
class an extends oe {
  constructor(e) {
    super(), le(this, e, gi, hi, ie, { sys: 0, edit: 1, data: 7 });
  }
  get sys() {
    return this.$$.ctx[0];
  }
  set sys(e) {
    this.$$set({ sys: e }), L();
  }
  get edit() {
    return this.$$.ctx[1];
  }
  set edit(e) {
    this.$$set({ edit: e }), L();
  }
  get data() {
    return this.$$.ctx[7];
  }
  set data(e) {
    this.$$set({ data: e }), L();
  }
}
re(an, { sys: {}, edit: {}, data: {} }, [], [], !0);
function _i(n) {
  let e, t, i, s, a, l, r, o, d, u, h, f, _;
  return {
    c() {
      e = y("div"), t = y("div"), i = G(
        /*name*/
        n[0]
      ), s = j(), a = y("div"), l = y("input"), o = j(), d = y("div"), u = y("div"), h = G(
        /*modNodeValue*/
        n[3]
      ), c(l, "class", "BoxValue"), c(
        l,
        "data-editmode",
        /*editmode*/
        n[1]
      ), l.disabled = r = !/*editmode*/
      n[1], l.value = /*nodeValue*/
      n[2], c(l, "type", "number"), c(l, "min", "0"), c(l, "max", "100"), c(a, "class", "LargeValue"), c(u, "class", "BoxValue"), c(d, "class", "SmallValue"), c(e, "class", "StatValue");
    },
    m(g, $) {
      B(g, e, $), b(e, t), b(t, i), b(e, s), b(e, a), b(a, l), n[8](l), b(e, o), b(e, d), b(d, u), b(u, h), f || (_ = U(
        l,
        "change",
        /*onChange*/
        n[5]
      ), f = !0);
    },
    p(g, [$]) {
      $ & /*name*/
      1 && de(
        i,
        /*name*/
        g[0]
      ), $ & /*editmode*/
      2 && c(
        l,
        "data-editmode",
        /*editmode*/
        g[1]
      ), $ & /*editmode*/
      2 && r !== (r = !/*editmode*/
      g[1]) && (l.disabled = r), $ & /*nodeValue*/
      4 && l.value !== /*nodeValue*/
      g[2] && (l.value = /*nodeValue*/
      g[2]), $ & /*modNodeValue*/
      8 && de(
        h,
        /*modNodeValue*/
        g[3]
      );
    },
    i: K,
    o: K,
    d(g) {
      g && R(e), n[8](null), f = !1, _();
    }
  };
}
function mi(n, e, t) {
  let { name: i } = e, { statNode: s } = e, { modNode: a } = e, { editmode: l = !1 } = e, r = s.getValue(), o = a.getValue();
  const d = ge.getNewKey();
  Me(() => {
    s.addUpdateListener("onDerivedNodeUpdate" + d, u), a.addUpdateListener("onDerivedNodeUpdate" + d, u);
  }), Ae(() => {
    s.removeUpdateListener("onDerivedNodeUpdate" + d), a.removeUpdateListener("onDerivedNodeUpdate" + d);
  });
  function u() {
    t(2, r = s.getValue()), t(3, o = a.getValue());
  }
  function h() {
    let g = parseInt(f.value);
    s.setValue(g);
  }
  let f;
  function _(g) {
    ne[g ? "unshift" : "push"](() => {
      f = g, t(4, f);
    });
  }
  return n.$$set = (g) => {
    "name" in g && t(0, i = g.name), "statNode" in g && t(6, s = g.statNode), "modNode" in g && t(7, a = g.modNode), "editmode" in g && t(1, l = g.editmode);
  }, [
    i,
    l,
    r,
    o,
    f,
    h,
    s,
    a,
    _
  ];
}
class ln extends oe {
  constructor(e) {
    super(), le(this, e, mi, _i, ie, {
      name: 0,
      statNode: 6,
      modNode: 7,
      editmode: 1
    });
  }
  get name() {
    return this.$$.ctx[0];
  }
  set name(e) {
    this.$$set({ name: e }), L();
  }
  get statNode() {
    return this.$$.ctx[6];
  }
  set statNode(e) {
    this.$$set({ statNode: e }), L();
  }
  get modNode() {
    return this.$$.ctx[7];
  }
  set modNode(e) {
    this.$$set({ modNode: e }), L();
  }
  get editmode() {
    return this.$$.ctx[1];
  }
  set editmode(e) {
    this.$$set({ editmode: e }), L();
  }
}
re(ln, { name: {}, statNode: {}, modNode: {}, editmode: { type: "Boolean" } }, [], [], !0);
function wt(n, e, t) {
  const i = n.slice();
  i[4] = e[t];
  const s = (
    /*stats*/
    i[2][
      /*key*/
      i[4]
    ]
  );
  i[5] = s;
  const a = (
    /*sys*/
    i[0].derived.modifiers[
      /*key*/
      i[4]
    ]
  );
  return i[6] = a, i;
}
function Dt(n) {
  let e, t;
  return e = new ln({
    props: {
      name: (
        /*key*/
        n[4]
      ),
      statNode: (
        /*node*/
        n[5]
      ),
      modNode: (
        /*modNode*/
        n[6]
      ),
      editmode: (
        /*edit*/
        n[1]
      )
    }
  }), {
    c() {
      te(e.$$.fragment);
    },
    m(i, s) {
      W(e, i, s), t = !0;
    },
    p(i, s) {
      const a = {};
      s & /*sys*/
      1 && (a.modNode = /*modNode*/
      i[6]), s & /*edit*/
      2 && (a.editmode = /*edit*/
      i[1]), e.$set(a);
    },
    i(i) {
      t || (N(e.$$.fragment, i), t = !0);
    },
    o(i) {
      H(e.$$.fragment, i), t = !1;
    },
    d(i) {
      Q(e, i);
    }
  };
}
function pi(n) {
  let e, t, i = ee(Object.keys(
    /*stats*/
    n[2]
  )), s = [];
  for (let l = 0; l < i.length; l += 1)
    s[l] = Dt(wt(n, i, l));
  const a = (l) => H(s[l], 1, 1, () => {
    s[l] = null;
  });
  return {
    c() {
      e = y("div");
      for (let l = 0; l < s.length; l += 1)
        s[l].c();
      c(e, "class", "StatsRow");
    },
    m(l, r) {
      B(l, e, r);
      for (let o = 0; o < s.length; o += 1)
        s[o] && s[o].m(e, null);
      t = !0;
    },
    p(l, [r]) {
      if (r & /*Object, stats, sys, edit*/
      7) {
        i = ee(Object.keys(
          /*stats*/
          l[2]
        ));
        let o;
        for (o = 0; o < i.length; o += 1) {
          const d = wt(l, i, o);
          s[o] ? (s[o].p(d, r), N(s[o], 1)) : (s[o] = Dt(d), s[o].c(), N(s[o], 1), s[o].m(e, null));
        }
        for (ue(), o = i.length; o < s.length; o += 1)
          a(o);
        fe();
      }
    },
    i(l) {
      if (!t) {
        for (let r = 0; r < i.length; r += 1)
          N(s[r]);
        t = !0;
      }
    },
    o(l) {
      s = s.filter(Boolean);
      for (let r = 0; r < s.length; r += 1)
        H(s[r]);
      t = !1;
    },
    d(l) {
      l && R(e), He(s, l);
    }
  };
}
function vi(n, e, t) {
  let { sys: i } = e, { data: s } = e, { edit: a = !1 } = e;
  console.log(i);
  let l = i.fixed.stats;
  return n.$$set = (r) => {
    "sys" in r && t(0, i = r.sys), "data" in r && t(3, s = r.data), "edit" in r && t(1, a = r.edit);
  }, [i, a, l, s];
}
class rn extends oe {
  constructor(e) {
    super(), le(this, e, vi, pi, ie, { sys: 0, data: 3, edit: 1 });
  }
  get sys() {
    return this.$$.ctx[0];
  }
  set sys(e) {
    this.$$set({ sys: e }), L();
  }
  get data() {
    return this.$$.ctx[3];
  }
  set data(e) {
    this.$$set({ data: e }), L();
  }
  get edit() {
    return this.$$.ctx[1];
  }
  set edit(e) {
    this.$$set({ edit: e }), L();
  }
}
re(rn, { sys: {}, data: {}, edit: { type: "Boolean" } }, [], [], !0);
function kt(n) {
  let e, t, i = (
    /*hasUp*/
    n[1] && It(n)
  ), s = (
    /*hasDown*/
    n[2] && Mt(n)
  );
  return {
    c() {
      e = y("div"), i && i.c(), t = j(), s && s.c(), c(e, "class", "ItemManouverOptions");
    },
    m(a, l) {
      B(a, e, l), i && i.m(e, null), b(e, t), s && s.m(e, null);
    },
    p(a, l) {
      /*hasUp*/
      a[1] ? i ? i.p(a, l) : (i = It(a), i.c(), i.m(e, t)) : i && (i.d(1), i = null), /*hasDown*/
      a[2] ? s ? s.p(a, l) : (s = Mt(a), s.c(), s.m(e, null)) : s && (s.d(1), s = null);
    },
    d(a) {
      a && R(e), i && i.d(), s && s.d();
    }
  };
}
function It(n) {
  let e, t, i;
  return {
    c() {
      e = y("div"), e.textContent = "Up", c(e, "class", "ItemManouverOption"), c(e, "role", "none");
    },
    m(s, a) {
      B(s, e, a), t || (i = [
        U(
          e,
          "keyup",
          /*keyup_handler*/
          n[7]
        ),
        U(
          e,
          "click",
          /*moveUp*/
          n[3]
        )
      ], t = !0);
    },
    p: K,
    d(s) {
      s && R(e), t = !1, Y(i);
    }
  };
}
function Mt(n) {
  let e, t, i;
  return {
    c() {
      e = y("div"), e.textContent = "Down", c(e, "class", "ItemManouverOption"), c(e, "role", "none");
    },
    m(s, a) {
      B(s, e, a), t || (i = [
        U(
          e,
          "keyup",
          /*keyup_handler_1*/
          n[6]
        ),
        U(
          e,
          "click",
          /*moveDown*/
          n[4]
        )
      ], t = !0);
    },
    p: K,
    d(s) {
      s && R(e), t = !1, Y(i);
    }
  };
}
function bi(n) {
  let e, t = (
    /*editMode*/
    n[0] && kt(n)
  );
  return {
    c() {
      e = y("div"), t && t.c(), c(e, "class", "ItemManouverContainer");
    },
    m(i, s) {
      B(i, e, s), t && t.m(e, null);
    },
    p(i, [s]) {
      /*editMode*/
      i[0] ? t ? t.p(i, s) : (t = kt(i), t.c(), t.m(e, null)) : t && (t.d(1), t = null);
    },
    i: K,
    o: K,
    d(i) {
      i && R(e), t && t.d();
    }
  };
}
function yi(n, e, t) {
  let i = nt(), { data: s } = e, { editMode: a } = e, { hasUp: l } = e, { hasDown: r } = e;
  function o() {
    i("moveUp", s.id);
  }
  function d() {
    i("moveDown", s.id);
  }
  function u(f) {
    pe.call(this, n, f);
  }
  function h(f) {
    pe.call(this, n, f);
  }
  return n.$$set = (f) => {
    "data" in f && t(5, s = f.data), "editMode" in f && t(0, a = f.editMode), "hasUp" in f && t(1, l = f.hasUp), "hasDown" in f && t(2, r = f.hasDown);
  }, [
    a,
    l,
    r,
    o,
    d,
    s,
    u,
    h
  ];
}
class on extends oe {
  constructor(e) {
    super(), le(this, e, yi, bi, ie, {
      data: 5,
      editMode: 0,
      hasUp: 1,
      hasDown: 2
    });
  }
  get data() {
    return this.$$.ctx[5];
  }
  set data(e) {
    this.$$set({ data: e }), L();
  }
  get editMode() {
    return this.$$.ctx[0];
  }
  set editMode(e) {
    this.$$set({ editMode: e }), L();
  }
  get hasUp() {
    return this.$$.ctx[1];
  }
  set hasUp(e) {
    this.$$set({ hasUp: e }), L();
  }
  get hasDown() {
    return this.$$.ctx[2];
  }
  set hasDown(e) {
    this.$$set({ hasDown: e }), L();
  }
}
re(on, { data: {}, editMode: {}, hasUp: {}, hasDown: {} }, [], [], !0);
function St(n) {
  let e, t, i;
  function s(l) {
    n[7](l);
  }
  let a = { editMode: !0 };
  return (
    /*data*/
    n[0] !== void 0 && (a.data = /*data*/
    n[0]), e = new xt({ props: a }), ne.push(() => ye(e, "data", s)), e.$on(
      "optionSelected",
      /*updateData*/
      n[6]
    ), {
      c() {
        te(e.$$.fragment);
      },
      m(l, r) {
        W(e, l, r), i = !0;
      },
      p(l, r) {
        const o = {};
        !t && r & /*data*/
        1 && (t = !0, o.data = /*data*/
        l[0], be(() => t = !1)), e.$set(o);
      },
      i(l) {
        i || (N(e.$$.fragment, l), i = !0);
      },
      o(l) {
        H(e.$$.fragment, l), i = !1;
      },
      d(l) {
        Q(e, l);
      }
    }
  );
}
function Ct(n) {
  let e, t, i;
  function s(l) {
    n[8](l);
  }
  let a = {
    editMode: (
      /*layoutMode*/
      n[5]
    ),
    hasDown: (
      /*index*/
      n[4] != /*length*/
      n[3] - 1
    ),
    hasUp: (
      /*index*/
      n[4] != 0
    )
  };
  return (
    /*data*/
    n[0] !== void 0 && (a.data = /*data*/
    n[0]), e = new on({ props: a }), ne.push(() => ye(e, "data", s)), e.$on(
      "moveUp",
      /*moveUp_handler*/
      n[9]
    ), e.$on(
      "moveDown",
      /*moveDown_handler*/
      n[10]
    ), {
      c() {
        te(e.$$.fragment);
      },
      m(l, r) {
        W(e, l, r), i = !0;
      },
      p(l, r) {
        const o = {};
        r & /*layoutMode*/
        32 && (o.editMode = /*layoutMode*/
        l[5]), r & /*index, length*/
        24 && (o.hasDown = /*index*/
        l[4] != /*length*/
        l[3] - 1), r & /*index*/
        16 && (o.hasUp = /*index*/
        l[4] != 0), !t && r & /*data*/
        1 && (t = !0, o.data = /*data*/
        l[0], be(() => t = !1)), e.$set(o);
      },
      i(l) {
        i || (N(e.$$.fragment, l), i = !0);
      },
      o(l) {
        H(e.$$.fragment, l), i = !1;
      },
      d(l) {
        Q(e, l);
      }
    }
  );
}
function $i(n) {
  let e, t, i, s, a;
  function l(o) {
    n[15](o);
  }
  let r = {
    edit: (
      /*editMode*/
      n[1]
    ),
    sys: (
      /*sys*/
      n[2]
    )
  };
  return (
    /*data*/
    n[0] !== void 0 && (r.data = /*data*/
    n[0]), t = new rn({ props: r }), ne.push(() => ye(t, "data", l)), t.$on(
      "optionSelected",
      /*updateData*/
      n[6]
    ), {
      c() {
        e = y("div"), te(t.$$.fragment);
      },
      m(o, d) {
        B(o, e, d), W(t, e, null), a = !0;
      },
      p(o, d) {
        const u = {};
        d & /*editMode*/
        2 && (u.edit = /*editMode*/
        o[1]), d & /*sys*/
        4 && (u.sys = /*sys*/
        o[2]), !i && d & /*data*/
        1 && (i = !0, u.data = /*data*/
        o[0], be(() => i = !1)), t.$set(u);
      },
      i(o) {
        a || (N(t.$$.fragment, o), o && se(() => {
          a && (s || (s = z(e, ae, {}, !0)), s.run(1));
        }), a = !0);
      },
      o(o) {
        H(t.$$.fragment, o), o && (s || (s = z(e, ae, {}, !1)), s.run(0)), a = !1;
      },
      d(o) {
        o && R(e), Q(t), o && s && s.end();
      }
    }
  );
}
function wi(n) {
  let e, t, i, s, a;
  function l(o) {
    n[14](o);
  }
  let r = {
    edit: (
      /*editMode*/
      n[1]
    ),
    sys: (
      /*sys*/
      n[2]
    )
  };
  return (
    /*data*/
    n[0] !== void 0 && (r.data = /*data*/
    n[0]), t = new an({ props: r }), ne.push(() => ye(t, "data", l)), t.$on(
      "optionSelected",
      /*updateData*/
      n[6]
    ), {
      c() {
        e = y("div"), te(t.$$.fragment);
      },
      m(o, d) {
        B(o, e, d), W(t, e, null), a = !0;
      },
      p(o, d) {
        const u = {};
        d & /*editMode*/
        2 && (u.edit = /*editMode*/
        o[1]), d & /*sys*/
        4 && (u.sys = /*sys*/
        o[2]), !i && d & /*data*/
        1 && (i = !0, u.data = /*data*/
        o[0], be(() => i = !1)), t.$set(u);
      },
      i(o) {
        a || (N(t.$$.fragment, o), o && se(() => {
          a && (s || (s = z(e, ae, {}, !0)), s.run(1));
        }), a = !0);
      },
      o(o) {
        H(t.$$.fragment, o), o && (s || (s = z(e, ae, {}, !1)), s.run(0)), a = !1;
      },
      d(o) {
        o && R(e), Q(t), o && s && s.end();
      }
    }
  );
}
function Di(n) {
  let e, t, i, s, a;
  function l(o) {
    n[13](o);
  }
  let r = {
    edit: (
      /*editMode*/
      n[1]
    ),
    sys: (
      /*sys*/
      n[2]
    )
  };
  return (
    /*data*/
    n[0] !== void 0 && (r.data = /*data*/
    n[0]), t = new sn({ props: r }), ne.push(() => ye(t, "data", l)), t.$on(
      "optionSelected",
      /*updateData*/
      n[6]
    ), {
      c() {
        e = y("div"), te(t.$$.fragment);
      },
      m(o, d) {
        B(o, e, d), W(t, e, null), a = !0;
      },
      p(o, d) {
        const u = {};
        d & /*editMode*/
        2 && (u.edit = /*editMode*/
        o[1]), d & /*sys*/
        4 && (u.sys = /*sys*/
        o[2]), !i && d & /*data*/
        1 && (i = !0, u.data = /*data*/
        o[0], be(() => i = !1)), t.$set(u);
      },
      i(o) {
        a || (N(t.$$.fragment, o), o && se(() => {
          a && (s || (s = z(e, ae, {}, !0)), s.run(1));
        }), a = !0);
      },
      o(o) {
        H(t.$$.fragment, o), o && (s || (s = z(e, ae, {}, !1)), s.run(0)), a = !1;
      },
      d(o) {
        o && R(e), Q(t), o && s && s.end();
      }
    }
  );
}
function ki(n) {
  let e, t, i, s, a;
  function l(o) {
    n[12](o);
  }
  let r = {
    sys: (
      /*sys*/
      n[2]
    ),
    editMode: (
      /*editMode*/
      n[1]
    )
  };
  return (
    /*data*/
    n[0] !== void 0 && (r.data = /*data*/
    n[0]), t = new tn({ props: r }), ne.push(() => ye(t, "data", l)), t.$on(
      "optionSelected",
      /*updateData*/
      n[6]
    ), {
      c() {
        e = y("div"), te(t.$$.fragment);
      },
      m(o, d) {
        B(o, e, d), W(t, e, null), a = !0;
      },
      p(o, d) {
        const u = {};
        d & /*sys*/
        4 && (u.sys = /*sys*/
        o[2]), d & /*editMode*/
        2 && (u.editMode = /*editMode*/
        o[1]), !i && d & /*data*/
        1 && (i = !0, u.data = /*data*/
        o[0], be(() => i = !1)), t.$set(u);
      },
      i(o) {
        a || (N(t.$$.fragment, o), o && se(() => {
          a && (s || (s = z(e, ae, {}, !0)), s.run(1));
        }), a = !0);
      },
      o(o) {
        H(t.$$.fragment, o), o && (s || (s = z(e, ae, {}, !1)), s.run(0)), a = !1;
      },
      d(o) {
        o && R(e), Q(t), o && s && s.end();
      }
    }
  );
}
function Ii(n) {
  let e, t, i, s, a;
  function l(o) {
    n[11](o);
  }
  let r = {
    sys: (
      /*sys*/
      n[2]
    ),
    editMode: (
      /*editMode*/
      n[1]
    ),
    playMode: !1
  };
  return (
    /*data*/
    n[0] !== void 0 && (r.data = /*data*/
    n[0]), t = new en({ props: r }), ne.push(() => ye(t, "data", l)), t.$on(
      "optionSelected",
      /*updateData*/
      n[6]
    ), {
      c() {
        e = y("div"), te(t.$$.fragment);
      },
      m(o, d) {
        B(o, e, d), W(t, e, null), a = !0;
      },
      p(o, d) {
        const u = {};
        d & /*sys*/
        4 && (u.sys = /*sys*/
        o[2]), d & /*editMode*/
        2 && (u.editMode = /*editMode*/
        o[1]), !i && d & /*data*/
        1 && (i = !0, u.data = /*data*/
        o[0], be(() => i = !1)), t.$set(u);
      },
      i(o) {
        a || (N(t.$$.fragment, o), o && se(() => {
          a && (s || (s = z(e, ae, {}, !0)), s.run(1));
        }), a = !0);
      },
      o(o) {
        H(t.$$.fragment, o), o && (s || (s = z(e, ae, {}, !1)), s.run(0)), a = !1;
      },
      d(o) {
        o && R(e), Q(t), o && s && s.end();
      }
    }
  );
}
function Mi(n) {
  let e, t, i, s, a, l, r = (
    /*editMode*/
    n[1] && St(n)
  ), o = (
    /*length*/
    n[3] != 1 && Ct(n)
  );
  const d = [
    Ii,
    ki,
    Di,
    wi,
    $i
  ], u = [];
  function h(f, _) {
    return (
      /*data*/
      f[0].type == _e.HitPoints ? 0 : (
        /*data*/
        f[0].type == _e.ProficiencyBonus ? 1 : (
          /*data*/
          f[0].type == _e.SkillProficiencies ? 2 : (
            /*data*/
            f[0].type == _e.SpellInfo ? 3 : (
              /*data*/
              f[0].type == _e.Stats ? 4 : -1
            )
          )
        )
      )
    );
  }
  return ~(s = h(n)) && (a = u[s] = d[s](n)), {
    c() {
      e = y("div"), r && r.c(), t = j(), o && o.c(), i = j(), a && a.c(), c(e, "data-name", "ItemDestributor"), c(e, "class", "itemDestributer");
    },
    m(f, _) {
      B(f, e, _), r && r.m(e, null), b(e, t), o && o.m(e, null), b(e, i), ~s && u[s].m(e, null), l = !0;
    },
    p(f, [_]) {
      /*editMode*/
      f[1] ? r ? (r.p(f, _), _ & /*editMode*/
      2 && N(r, 1)) : (r = St(f), r.c(), N(r, 1), r.m(e, t)) : r && (ue(), H(r, 1, 1, () => {
        r = null;
      }), fe()), /*length*/
      f[3] != 1 ? o ? (o.p(f, _), _ & /*length*/
      8 && N(o, 1)) : (o = Ct(f), o.c(), N(o, 1), o.m(e, i)) : o && (ue(), H(o, 1, 1, () => {
        o = null;
      }), fe());
      let g = s;
      s = h(f), s === g ? ~s && u[s].p(f, _) : (a && (ue(), H(u[g], 1, 1, () => {
        u[g] = null;
      }), fe()), ~s ? (a = u[s], a ? a.p(f, _) : (a = u[s] = d[s](f), a.c()), N(a, 1), a.m(e, null)) : a = null);
    },
    i(f) {
      l || (N(r), N(o), N(a), l = !0);
    },
    o(f) {
      H(r), H(o), H(a), l = !1;
    },
    d(f) {
      f && R(e), r && r.d(), o && o.d(), ~s && u[s].d();
    }
  };
}
function Si(n, e, t) {
  let { data: i } = e, { editMode: s } = e, { sys: a } = e, { length: l } = e, { index: r } = e, { layoutMode: o = !1 } = e;
  function d(m) {
    console.log(i), console.log(Object.keys(_e)), t(0, i);
  }
  function u(m) {
    i = m, t(0, i);
  }
  function h(m) {
    i = m, t(0, i);
  }
  function f(m) {
    pe.call(this, n, m);
  }
  function _(m) {
    pe.call(this, n, m);
  }
  function g(m) {
    i = m, t(0, i);
  }
  function $(m) {
    i = m, t(0, i);
  }
  function p(m) {
    i = m, t(0, i);
  }
  function v(m) {
    i = m, t(0, i);
  }
  function E(m) {
    i = m, t(0, i);
  }
  return n.$$set = (m) => {
    "data" in m && t(0, i = m.data), "editMode" in m && t(1, s = m.editMode), "sys" in m && t(2, a = m.sys), "length" in m && t(3, l = m.length), "index" in m && t(4, r = m.index), "layoutMode" in m && t(5, o = m.layoutMode);
  }, [
    i,
    s,
    a,
    l,
    r,
    o,
    d,
    u,
    h,
    f,
    _,
    g,
    $,
    p,
    v,
    E
  ];
}
class dn extends oe {
  constructor(e) {
    super(), le(this, e, Si, Mi, ie, {
      data: 0,
      editMode: 1,
      sys: 2,
      length: 3,
      index: 4,
      layoutMode: 5
    });
  }
  get data() {
    return this.$$.ctx[0];
  }
  set data(e) {
    this.$$set({ data: e }), L();
  }
  get editMode() {
    return this.$$.ctx[1];
  }
  set editMode(e) {
    this.$$set({ editMode: e }), L();
  }
  get sys() {
    return this.$$.ctx[2];
  }
  set sys(e) {
    this.$$set({ sys: e }), L();
  }
  get length() {
    return this.$$.ctx[3];
  }
  set length(e) {
    this.$$set({ length: e }), L();
  }
  get index() {
    return this.$$.ctx[4];
  }
  set index(e) {
    this.$$set({ index: e }), L();
  }
  get layoutMode() {
    return this.$$.ctx[5];
  }
  set layoutMode(e) {
    this.$$set({ layoutMode: e }), L();
  }
}
re(dn, { data: {}, editMode: {}, sys: {}, length: {}, index: {}, layoutMode: { type: "Boolean" } }, [], [], !0);
function at(n, e, t) {
  return n.style.animation && (n.style = null), Yn(n, e, t ?? { duration: 500 });
}
function Ot(n) {
  let e, t, i, s, a = (
    /*onAdd*/
    n[4] && Lt(n)
  ), l = (
    /*onRemove*/
    n[3] && Et(n)
  );
  return {
    c() {
      e = y("div"), a && a.c(), t = j(), l && l.c(), c(e, "class", "RowColumnOptions"), c(
        e,
        "style",
        /*cssStyle*/
        n[5]
      );
    },
    m(r, o) {
      B(r, e, o), a && a.m(e, null), b(e, t), l && l.m(e, null), s = !0;
    },
    p(r, o) {
      /*onAdd*/
      r[4] ? a ? a.p(r, o) : (a = Lt(r), a.c(), a.m(e, t)) : a && (a.d(1), a = null), /*onRemove*/
      r[3] ? l ? l.p(r, o) : (l = Et(r), l.c(), l.m(e, null)) : l && (l.d(1), l = null);
    },
    i(r) {
      s || (r && se(() => {
        s && (i || (i = z(e, ae, {}, !0)), i.run(1));
      }), s = !0);
    },
    o(r) {
      r && (i || (i = z(e, ae, {}, !1)), i.run(0)), s = !1;
    },
    d(r) {
      r && R(e), a && a.d(), l && l.d(), r && i && i.end();
    }
  };
}
function Lt(n) {
  let e, t, i, s;
  return {
    c() {
      e = y("div"), t = G(
        /*addText*/
        n[1]
      ), c(e, "class", "itemOption"), c(e, "role", "none");
    },
    m(a, l) {
      B(a, e, l), b(e, t), i || (s = [
        U(
          e,
          "keyup",
          /*keyup_handler*/
          n[10]
        ),
        U(
          e,
          "click",
          /*click_handler*/
          n[11]
        )
      ], i = !0);
    },
    p(a, l) {
      l & /*addText*/
      2 && de(
        t,
        /*addText*/
        a[1]
      );
    },
    d(a) {
      a && R(e), i = !1, Y(s);
    }
  };
}
function Et(n) {
  let e, t, i, s;
  return {
    c() {
      e = y("div"), t = G(
        /*remText*/
        n[2]
      ), c(e, "class", "itemOption rem"), c(e, "role", "none");
    },
    m(a, l) {
      B(a, e, l), b(e, t), i || (s = [
        U(
          e,
          "keyup",
          /*keyup_handler_1*/
          n[9]
        ),
        U(
          e,
          "click",
          /*click_handler_1*/
          n[12]
        )
      ], i = !0);
    },
    p(a, l) {
      l & /*remText*/
      4 && de(
        t,
        /*remText*/
        a[2]
      );
    },
    d(a) {
      a && R(e), i = !1, Y(s);
    }
  };
}
function Ci(n) {
  let e, t = (
    /*active*/
    n[0] && Ot(n)
  );
  return {
    c() {
      t && t.c(), e = On();
    },
    m(i, s) {
      t && t.m(i, s), B(i, e, s);
    },
    p(i, [s]) {
      /*active*/
      i[0] ? t ? (t.p(i, s), s & /*active*/
      1 && N(t, 1)) : (t = Ot(i), t.c(), N(t, 1), t.m(e.parentNode, e)) : t && (ue(), H(t, 1, 1, () => {
        t = null;
      }), fe());
    },
    i(i) {
      N(t);
    },
    o(i) {
      H(t);
    },
    d(i) {
      i && R(e), t && t.d(i);
    }
  };
}
function Oi(n, e, t) {
  let { active: i } = e, { addText: s = "Add Item" } = e, { remText: a = "Remove This Item" } = e, { offset: l = 0 } = e, { side: r = "left" } = e, { verti: o = "bottom" } = e, { onRemove: d = null } = e, { onAdd: u = null } = e, h = r + ":" + l + ";" + o + ":" + l + ";";
  function f(p) {
    pe.call(this, n, p);
  }
  function _(p) {
    pe.call(this, n, p);
  }
  const g = () => u(), $ = () => d();
  return n.$$set = (p) => {
    "active" in p && t(0, i = p.active), "addText" in p && t(1, s = p.addText), "remText" in p && t(2, a = p.remText), "offset" in p && t(6, l = p.offset), "side" in p && t(7, r = p.side), "verti" in p && t(8, o = p.verti), "onRemove" in p && t(3, d = p.onRemove), "onAdd" in p && t(4, u = p.onAdd);
  }, [
    i,
    s,
    a,
    d,
    u,
    h,
    l,
    r,
    o,
    f,
    _,
    g,
    $
  ];
}
class ve extends oe {
  constructor(e) {
    super(), le(this, e, Oi, Ci, ie, {
      active: 0,
      addText: 1,
      remText: 2,
      offset: 6,
      side: 7,
      verti: 8,
      onRemove: 3,
      onAdd: 4
    });
  }
  get active() {
    return this.$$.ctx[0];
  }
  set active(e) {
    this.$$set({ active: e }), L();
  }
  get addText() {
    return this.$$.ctx[1];
  }
  set addText(e) {
    this.$$set({ addText: e }), L();
  }
  get remText() {
    return this.$$.ctx[2];
  }
  set remText(e) {
    this.$$set({ remText: e }), L();
  }
  get offset() {
    return this.$$.ctx[6];
  }
  set offset(e) {
    this.$$set({ offset: e }), L();
  }
  get side() {
    return this.$$.ctx[7];
  }
  set side(e) {
    this.$$set({ side: e }), L();
  }
  get verti() {
    return this.$$.ctx[8];
  }
  set verti(e) {
    this.$$set({ verti: e }), L();
  }
  get onRemove() {
    return this.$$.ctx[3];
  }
  set onRemove(e) {
    this.$$set({ onRemove: e }), L();
  }
  get onAdd() {
    return this.$$.ctx[4];
  }
  set onAdd(e) {
    this.$$set({ onAdd: e }), L();
  }
}
re(ve, { active: {}, addText: {}, remText: {}, offset: {}, side: {}, verti: {}, onRemove: {}, onAdd: {} }, [], [], !0);
function At(n, e, t) {
  const i = n.slice();
  return i[45] = e[t], i[47] = t, i;
}
function Rt(n, e, t) {
  const i = n.slice();
  return i[48] = e[t], i[50] = t, i;
}
function Nt(n, e, t) {
  const i = n.slice();
  return i[51] = e[t], i[53] = t, i;
}
function Bt(n) {
  let e, t;
  function i() {
    return (
      /*func_2*/
      n[22](
        /*row*/
        n[45],
        /*column*/
        n[48]
      )
    );
  }
  return e = new ve({
    props: {
      offset: 15,
      active: (
        /*$editLayout_02*/
        n[3]
      ),
      remText: "remove this column",
      onRemove: i
    }
  }), {
    c() {
      te(e.$$.fragment);
    },
    m(s, a) {
      W(e, s, a), t = !0;
    },
    p(s, a) {
      n = s;
      const l = {};
      a[0] & /*$editLayout_02*/
      8 && (l.active = /*$editLayout_02*/
      n[3]), a[0] & /*$OBJ*/
      32 && (l.onRemove = i), e.$set(l);
    },
    i(s) {
      t || (N(e.$$.fragment, s), t = !0);
    },
    o(s) {
      H(e.$$.fragment, s), t = !1;
    },
    d(s) {
      Q(e, s);
    }
  };
}
function Vt(n) {
  let e;
  return {
    c() {
      e = y("div"), Wt(e, "height", "50px");
    },
    m(t, i) {
      B(t, e, i);
    },
    d(t) {
      t && R(e);
    }
  };
}
function Tt(n, e) {
  let t, i, s, a, l, r, o, d, u, h = K, f, _, g;
  function $() {
    return (
      /*func_4*/
      e[24](
        /*column*/
        e[48],
        /*item*/
        e[51]
      )
    );
  }
  i = new ve({
    props: {
      offset: 15,
      active: (
        /*$editLayout_03*/
        e[4]
      ),
      addText: "remove",
      onRemove: $
    }
  }), a = new dn({
    props: {
      data: (
        /*item*/
        e[51]
      ),
      editMode: (
        /*$editMode*/
        e[1]
      ),
      layoutMode: (
        /*$editLayout_03*/
        e[4]
      ),
      sys: (
        /*sys*/
        e[0]
      ),
      length: (
        /*column*/
        e[48].data.length
      ),
      index: (
        /*k*/
        e[53]
      )
    }
  }), a.$on(
    "moveUp",
    /*moveUp_handler*/
    e[25]
  ), a.$on(
    "moveDown",
    /*moveDown_handler*/
    e[26]
  );
  function p(...k) {
    return (
      /*dragstart_handler*/
      e[27](
        /*item*/
        e[51],
        ...k
      )
    );
  }
  function v(...k) {
    return (
      /*dragend_handler*/
      e[28](
        /*item*/
        e[51],
        ...k
      )
    );
  }
  function E(...k) {
    return (
      /*drop_handler*/
      e[29](
        /*item*/
        e[51],
        ...k
      )
    );
  }
  function m(...k) {
    return (
      /*dragleave_handler*/
      e[30](
        /*item*/
        e[51],
        ...k
      )
    );
  }
  return {
    key: n,
    first: null,
    c() {
      t = y("div"), te(i.$$.fragment), s = j(), te(a.$$.fragment), c(t, "class", "Item"), c(t, "data-edit", l = /*$editMode*/
      e[1] || /*$editLayout_03*/
      e[4] || /*$editLayout_02*/
      e[3]), c(t, "data-itemid", r = /*item*/
      e[51].id), c(
        t,
        "data-edit-active",
        /*$editLayout_03*/
        e[4]
      ), c(t, "data-dragging", o = /*DragItemHandler*/
      e[14].isBeingDragged(
        /*item*/
        e[51].id
      )), c(t, "role", "none"), c(
        t,
        "draggable",
        /*$editLayout_03*/
        e[4]
      ), this.first = t;
    },
    m(k, D) {
      B(k, t, D), W(i, t, null), b(t, s), W(a, t, null), f = !0, _ || (g = [
        U(t, "dragstart", p),
        U(t, "dragend", v),
        U(t, "drop", E),
        U(t, "dragleave", m),
        U(t, "dragover", Bi)
      ], _ = !0);
    },
    p(k, D) {
      e = k;
      const A = {};
      D[0] & /*$editLayout_03*/
      16 && (A.active = /*$editLayout_03*/
      e[4]), D[0] & /*$OBJ*/
      32 && (A.onRemove = $), i.$set(A);
      const P = {};
      D[0] & /*$OBJ*/
      32 && (P.data = /*item*/
      e[51]), D[0] & /*$editMode*/
      2 && (P.editMode = /*$editMode*/
      e[1]), D[0] & /*$editLayout_03*/
      16 && (P.layoutMode = /*$editLayout_03*/
      e[4]), D[0] & /*sys*/
      1 && (P.sys = /*sys*/
      e[0]), D[0] & /*$OBJ*/
      32 && (P.length = /*column*/
      e[48].data.length), D[0] & /*$OBJ*/
      32 && (P.index = /*k*/
      e[53]), a.$set(P), (!f || D[0] & /*$editMode, $editLayout_03, $editLayout_02*/
      26 && l !== (l = /*$editMode*/
      e[1] || /*$editLayout_03*/
      e[4] || /*$editLayout_02*/
      e[3])) && c(t, "data-edit", l), (!f || D[0] & /*$OBJ*/
      32 && r !== (r = /*item*/
      e[51].id)) && c(t, "data-itemid", r), (!f || D[0] & /*$editLayout_03*/
      16) && c(
        t,
        "data-edit-active",
        /*$editLayout_03*/
        e[4]
      ), (!f || D[0] & /*$OBJ*/
      32 && o !== (o = /*DragItemHandler*/
      e[14].isBeingDragged(
        /*item*/
        e[51].id
      ))) && c(t, "data-dragging", o), (!f || D[0] & /*$editLayout_03*/
      16) && c(
        t,
        "draggable",
        /*$editLayout_03*/
        e[4]
      );
    },
    r() {
      u = t.getBoundingClientRect();
    },
    f() {
      et(t), h(), Ke(t, u);
    },
    a() {
      h(), h = xe(t, u, at, { duration: he });
    },
    i(k) {
      f || (N(i.$$.fragment, k), N(a.$$.fragment, k), k && se(() => {
        f && (d || (d = z(t, Te, { duration: he }, !0)), d.run(1));
      }), f = !0);
    },
    o(k) {
      H(i.$$.fragment, k), H(a.$$.fragment, k), k && (d || (d = z(t, Te, { duration: he }, !1)), d.run(0)), f = !1;
    },
    d(k) {
      k && R(t), Q(i), Q(a), k && d && d.end(), _ = !1, Y(g);
    }
  };
}
function Ut(n, e) {
  let t, i, s, a, l, r = [], o = /* @__PURE__ */ new Map(), d, u, h, f, _, g, $ = K, p, v, E, m = (
    /*row*/
    e[45].data.length > 1 && Bt(e)
  );
  function k() {
    return (
      /*func_3*/
      e[23](
        /*column*/
        e[48]
      )
    );
  }
  s = new ve({
    props: {
      offset: 15,
      active: (
        /*$editLayout_03*/
        e[4]
      ),
      addText: "add a new Item",
      onAdd: k
    }
  });
  let D = (
    /*$editLayout_03*/
    (e[4] || /*$editLayout_02*/
    e[3]) && Vt()
  ), A = ee(
    /*column*/
    e[48].data
  );
  const P = (C) => (
    /*item*/
    C[51].id
  );
  for (let C = 0; C < A.length; C += 1) {
    let I = Nt(e, A, C), T = P(I);
    o.set(T, r[C] = Tt(T, I));
  }
  function J(...C) {
    return (
      /*dragstart_handler_1*/
      e[31](
        /*column*/
        e[48],
        ...C
      )
    );
  }
  function S(...C) {
    return (
      /*dragenter_handler*/
      e[32](
        /*column*/
        e[48],
        ...C
      )
    );
  }
  function w(...C) {
    return (
      /*dragend_handler_1*/
      e[33](
        /*column*/
        e[48],
        ...C
      )
    );
  }
  function F(...C) {
    return (
      /*drop_handler_1*/
      e[34](
        /*column*/
        e[48],
        ...C
      )
    );
  }
  function X(...C) {
    return (
      /*dragleave_handler_1*/
      e[35](
        /*column*/
        e[48],
        ...C
      )
    );
  }
  function Z(...C) {
    return (
      /*dragover_handler_1*/
      e[36](
        /*column*/
        e[48],
        ...C
      )
    );
  }
  return {
    key: n,
    first: null,
    c() {
      t = y("div"), m && m.c(), i = j(), te(s.$$.fragment), a = j(), D && D.c(), l = j();
      for (let C = 0; C < r.length; C += 1)
        r[C].c();
      c(t, "class", "Column"), c(t, "data-edit", d = /*$editLayout_02*/
      e[3] || /*$editLayout_01*/
      e[2]), c(
        t,
        "data-editpreview",
        /*$editLayout_03*/
        e[4]
      ), c(t, "data-itemid", u = /*column*/
      e[48].id), c(
        t,
        "data-edit-active",
        /*$editLayout_02*/
        e[3]
      ), c(t, "data-dragging", h = /*DragColumnHandler*/
      e[13].isBeingDragged(
        /*column*/
        e[48].id
      )), c(t, "role", "none"), c(t, "style", f = `
						${/*$editLayout_02*/
      e[3] || /*$editLayout_01*/
      e[2] ? "margin-bottom:60px" : ""}
					`), c(
        t,
        "draggable",
        /*$editLayout_02*/
        e[3]
      ), this.first = t;
    },
    m(C, I) {
      B(C, t, I), m && m.m(t, null), b(t, i), W(s, t, null), b(t, a), D && D.m(t, null), b(t, l);
      for (let T = 0; T < r.length; T += 1)
        r[T] && r[T].m(t, null);
      p = !0, v || (E = [
        U(t, "dragstart", J),
        U(t, "dragenter", S),
        U(t, "dragend", w),
        U(t, "drop", F),
        U(t, "dragleave", X),
        U(t, "dragover", Z)
      ], v = !0);
    },
    p(C, I) {
      e = C, /*row*/
      e[45].data.length > 1 ? m ? (m.p(e, I), I[0] & /*$OBJ*/
      32 && N(m, 1)) : (m = Bt(e), m.c(), N(m, 1), m.m(t, i)) : m && (ue(), H(m, 1, 1, () => {
        m = null;
      }), fe());
      const T = {};
      if (I[0] & /*$editLayout_03*/
      16 && (T.active = /*$editLayout_03*/
      e[4]), I[0] & /*$OBJ*/
      32 && (T.onAdd = k), s.$set(T), /*$editLayout_03*/
      e[4] || /*$editLayout_02*/
      e[3] ? D || (D = Vt(), D.c(), D.m(t, l)) : D && (D.d(1), D = null), I[0] & /*$editMode, $editLayout_03, $editLayout_02, $OBJ, DragItemHandler, sys, itemRequestMove, OBJ*/
      19515) {
        A = ee(
          /*column*/
          e[48].data
        ), ue();
        for (let q = 0; q < r.length; q += 1) r[q].r();
        r = Fe(r, I, P, 1, e, A, o, t, it, Tt, null, Nt);
        for (let q = 0; q < r.length; q += 1) r[q].a();
        fe();
      }
      (!p || I[0] & /*$editLayout_02, $editLayout_01*/
      12 && d !== (d = /*$editLayout_02*/
      e[3] || /*$editLayout_01*/
      e[2])) && c(t, "data-edit", d), (!p || I[0] & /*$editLayout_03*/
      16) && c(
        t,
        "data-editpreview",
        /*$editLayout_03*/
        e[4]
      ), (!p || I[0] & /*$OBJ*/
      32 && u !== (u = /*column*/
      e[48].id)) && c(t, "data-itemid", u), (!p || I[0] & /*$editLayout_02*/
      8) && c(
        t,
        "data-edit-active",
        /*$editLayout_02*/
        e[3]
      ), (!p || I[0] & /*$OBJ*/
      32 && h !== (h = /*DragColumnHandler*/
      e[13].isBeingDragged(
        /*column*/
        e[48].id
      ))) && c(t, "data-dragging", h), (!p || I[0] & /*$editLayout_02, $editLayout_01*/
      12 && f !== (f = `
						${/*$editLayout_02*/
      e[3] || /*$editLayout_01*/
      e[2] ? "margin-bottom:60px" : ""}
					`)) && c(t, "style", f), (!p || I[0] & /*$editLayout_02*/
      8) && c(
        t,
        "draggable",
        /*$editLayout_02*/
        e[3]
      );
    },
    r() {
      g = t.getBoundingClientRect();
    },
    f() {
      et(t), $(), Ke(t, g);
    },
    a() {
      $(), $ = xe(t, g, at, { duration: he });
    },
    i(C) {
      if (!p) {
        N(m), N(s.$$.fragment, C);
        for (let I = 0; I < A.length; I += 1)
          N(r[I]);
        C && se(() => {
          p && (_ || (_ = z(t, Te, { duration: he }, !0)), _.run(1));
        }), p = !0;
      }
    },
    o(C) {
      H(m), H(s.$$.fragment, C);
      for (let I = 0; I < r.length; I += 1)
        H(r[I]);
      C && (_ || (_ = z(t, Te, { duration: he }, !1)), _.run(0)), p = !1;
    },
    d(C) {
      C && R(t), m && m.d(), Q(s), D && D.d();
      for (let I = 0; I < r.length; I += 1)
        r[I].d();
      C && _ && _.end(), v = !1, Y(E);
    }
  };
}
function Pt(n, e) {
  let t, i, s, a, l, r = [], o = /* @__PURE__ */ new Map(), d, u, h, f, _ = K, g, $, p;
  function v() {
    return (
      /*func*/
      e[20](
        /*row*/
        e[45]
      )
    );
  }
  i = new ve({
    props: {
      active: (
        /*$editLayout_02*/
        e[3]
      ),
      onAdd: v,
      addText: "add Column"
    }
  });
  function E() {
    return (
      /*func_1*/
      e[21](
        /*row*/
        e[45]
      )
    );
  }
  a = new ve({
    props: {
      active: (
        /*$editLayout_01*/
        e[2]
      ),
      onRemove: E,
      remText: "remove this line"
    }
  });
  let m = ee(
    /*row*/
    e[45].data
  );
  const k = (S) => (
    /*column*/
    S[48].id
  );
  for (let S = 0; S < m.length; S += 1) {
    let w = Rt(e, m, S), F = k(w);
    o.set(F, r[S] = Ut(F, w));
  }
  function D(...S) {
    return (
      /*dragstart_handler_2*/
      e[37](
        /*row*/
        e[45],
        ...S
      )
    );
  }
  function A(...S) {
    return (
      /*dragenter_handler_1*/
      e[38](
        /*row*/
        e[45],
        ...S
      )
    );
  }
  function P(...S) {
    return (
      /*dragend_handler_2*/
      e[39](
        /*row*/
        e[45],
        ...S
      )
    );
  }
  function J(...S) {
    return (
      /*dragover_handler_2*/
      e[40](
        /*row*/
        e[45],
        ...S
      )
    );
  }
  return {
    key: n,
    first: null,
    c() {
      t = y("div"), te(i.$$.fragment), s = j(), te(a.$$.fragment), l = j();
      for (let S = 0; S < r.length; S += 1)
        r[S].c();
      c(t, "class", "Row"), c(
        t,
        "data-edit",
        /*$editLayout_01*/
        e[2]
      ), c(
        t,
        "data-edit-active",
        /*$editLayout_01*/
        e[2]
      ), c(
        t,
        "data-editpreview",
        /*$editLayout_02*/
        e[3]
      ), c(t, "role", "none"), c(t, "style", d = `grid-template-columns:${jt(
        /*row*/
        e[45].data.length,
        "1fr"
      )}`), c(t, "data-rowid", u = /*row*/
      e[45].id), c(
        t,
        "draggable",
        /*$editLayout_01*/
        e[2]
      ), this.first = t;
    },
    m(S, w) {
      B(S, t, w), W(i, t, null), b(t, s), W(a, t, null), b(t, l);
      for (let F = 0; F < r.length; F += 1)
        r[F] && r[F].m(t, null);
      g = !0, $ || (p = [
        U(t, "dragstart", D),
        U(t, "dragenter", A),
        U(t, "dragend", P),
        U(t, "dragover", J)
      ], $ = !0);
    },
    p(S, w) {
      e = S;
      const F = {};
      w[0] & /*$editLayout_02*/
      8 && (F.active = /*$editLayout_02*/
      e[3]), w[0] & /*$OBJ*/
      32 && (F.onAdd = v), i.$set(F);
      const X = {};
      if (w[0] & /*$editLayout_01*/
      4 && (X.active = /*$editLayout_01*/
      e[2]), w[0] & /*$OBJ*/
      32 && (X.onRemove = E), a.$set(X), w[0] & /*$editLayout_02, $editLayout_01, $editLayout_03, $OBJ, DragColumnHandler, DragItemHandler, $editMode, sys, itemRequestMove, OBJ*/
      27711) {
        m = ee(
          /*row*/
          e[45].data
        ), ue();
        for (let Z = 0; Z < r.length; Z += 1) r[Z].r();
        r = Fe(r, w, k, 1, e, m, o, t, it, Ut, null, Rt);
        for (let Z = 0; Z < r.length; Z += 1) r[Z].a();
        fe();
      }
      (!g || w[0] & /*$editLayout_01*/
      4) && c(
        t,
        "data-edit",
        /*$editLayout_01*/
        e[2]
      ), (!g || w[0] & /*$editLayout_01*/
      4) && c(
        t,
        "data-edit-active",
        /*$editLayout_01*/
        e[2]
      ), (!g || w[0] & /*$editLayout_02*/
      8) && c(
        t,
        "data-editpreview",
        /*$editLayout_02*/
        e[3]
      ), (!g || w[0] & /*$OBJ*/
      32 && d !== (d = `grid-template-columns:${jt(
        /*row*/
        e[45].data.length,
        "1fr"
      )}`)) && c(t, "style", d), (!g || w[0] & /*$OBJ*/
      32 && u !== (u = /*row*/
      e[45].id)) && c(t, "data-rowid", u), (!g || w[0] & /*$editLayout_01*/
      4) && c(
        t,
        "draggable",
        /*$editLayout_01*/
        e[2]
      );
    },
    r() {
      f = t.getBoundingClientRect();
    },
    f() {
      et(t), _(), Ke(t, f);
    },
    a() {
      _(), _ = xe(t, f, at, { duration: he });
    },
    i(S) {
      if (!g) {
        N(i.$$.fragment, S), N(a.$$.fragment, S);
        for (let w = 0; w < m.length; w += 1)
          N(r[w]);
        S && se(() => {
          g && (h || (h = z(t, ut, { duration: he, y: 100 }, !0)), h.run(1));
        }), g = !0;
      }
    },
    o(S) {
      H(i.$$.fragment, S), H(a.$$.fragment, S);
      for (let w = 0; w < r.length; w += 1)
        H(r[w]);
      S && (h || (h = z(t, ut, { duration: he, y: 100 }, !1)), h.run(0)), g = !1;
    },
    d(S) {
      S && R(t), Q(i), Q(a);
      for (let w = 0; w < r.length; w += 1)
        r[w].d();
      S && h && h.end(), $ = !1, Y(p);
    }
  };
}
function Ht(n) {
  let e, t, i;
  return t = new ve({
    props: {
      active: (
        /*$editLayout_01*/
        n[2]
      ),
      onAdd: (
        /*func_5*/
        n[41]
      ),
      offset: 15,
      addText: "add Line"
    }
  }), {
    c() {
      e = y("div"), te(t.$$.fragment), c(e, "class", "Row"), Wt(e, "height", "100px");
    },
    m(s, a) {
      B(s, e, a), W(t, e, null), i = !0;
    },
    p(s, a) {
      const l = {};
      a[0] & /*$editLayout_01*/
      4 && (l.active = /*$editLayout_01*/
      s[2]), a[0] & /*$OBJ*/
      32 && (l.onAdd = /*func_5*/
      s[41]), t.$set(l);
    },
    i(s) {
      i || (N(t.$$.fragment, s), i = !0);
    },
    o(s) {
      H(t.$$.fragment, s), i = !1;
    },
    d(s) {
      s && R(e), Q(t);
    }
  };
}
function Li(n) {
  let e, t, i, s, a, l = "Stop Edit	", r, o, d, u = "Layout Row	", h, f, _, g = "Layout Col	", $, p, v, E = "Layout Items", m, k, D, A = [], P = /* @__PURE__ */ new Map(), J, S, w, F, X = ee(
    /*$OBJ*/
    n[5].data
  );
  const Z = (I) => (
    /*row*/
    I[45].id
  );
  for (let I = 0; I < X.length; I += 1) {
    let T = At(n, X, I), q = Z(T);
    P.set(q, A[I] = Pt(q, T));
  }
  let C = (
    /*$editLayout_01*/
    n[2] && Ht(n)
  );
  return {
    c() {
      e = y("div"), t = y("div"), i = y("div"), s = y("div"), a = y("button"), r = G(l), o = j(), d = y("button"), h = G(u), f = j(), _ = y("button"), $ = G(g), p = j(), v = y("button"), m = G(E), D = j();
      for (let I = 0; I < A.length; I += 1)
        A[I].c();
      J = j(), C && C.c(), c(
        a,
        "data-active",
        /*$editMode*/
        n[1]
      ), c(
        d,
        "data-active",
        /*$editLayout_01*/
        n[2]
      ), c(
        _,
        "data-active",
        /*$editLayout_02*/
        n[3]
      ), c(
        v,
        "data-active",
        /*$editLayout_03*/
        n[4]
      ), c(s, "class", "SheetEditorMenu"), c(s, "data-isopen", k = /*$editMode*/
      n[1] || /*$editLayout_01*/
      n[2] || /*$editLayout_02*/
      n[3] || /*$editLayout_03*/
      n[4]), c(i, "class", "SheetEditorMenuContainer"), c(t, "class", "Sheet"), c(e, "class", "theme-light obsidianBody");
    },
    m(I, T) {
      B(I, e, T), b(e, t), b(t, i), b(i, s), b(s, a), b(a, r), b(s, o), b(s, d), b(d, h), b(s, f), b(s, _), b(_, $), b(s, p), b(s, v), b(v, m), b(t, D);
      for (let q = 0; q < A.length; q += 1)
        A[q] && A[q].m(t, null);
      b(t, J), C && C.m(t, null), S = !0, w || (F = [
        U(
          a,
          "click",
          /*click_handler*/
          n[16]
        ),
        U(
          d,
          "click",
          /*click_handler_1*/
          n[17]
        ),
        U(
          _,
          "click",
          /*click_handler_2*/
          n[18]
        ),
        U(
          v,
          "click",
          /*click_handler_3*/
          n[19]
        )
      ], w = !0);
    },
    p(I, T) {
      if ((!S || T[0] & /*$editMode*/
      2) && c(
        a,
        "data-active",
        /*$editMode*/
        I[1]
      ), (!S || T[0] & /*$editLayout_01*/
      4) && c(
        d,
        "data-active",
        /*$editLayout_01*/
        I[2]
      ), (!S || T[0] & /*$editLayout_02*/
      8) && c(
        _,
        "data-active",
        /*$editLayout_02*/
        I[3]
      ), (!S || T[0] & /*$editLayout_03*/
      16) && c(
        v,
        "data-active",
        /*$editLayout_03*/
        I[4]
      ), (!S || T[0] & /*$editMode, $editLayout_01, $editLayout_02, $editLayout_03*/
      30 && k !== (k = /*$editMode*/
      I[1] || /*$editLayout_01*/
      I[2] || /*$editLayout_02*/
      I[3] || /*$editLayout_03*/
      I[4])) && c(s, "data-isopen", k), T[0] & /*$editLayout_01, $editLayout_02, $OBJ, DragRowHandler, $editLayout_03, DragColumnHandler, DragItemHandler, $editMode, sys, itemRequestMove, OBJ*/
      31807) {
        X = ee(
          /*$OBJ*/
          I[5].data
        ), ue();
        for (let q = 0; q < A.length; q += 1) A[q].r();
        A = Fe(A, T, Z, 1, I, X, P, t, it, Pt, J, At);
        for (let q = 0; q < A.length; q += 1) A[q].a();
        fe();
      }
      /*$editLayout_01*/
      I[2] ? C ? (C.p(I, T), T[0] & /*$editLayout_01*/
      4 && N(C, 1)) : (C = Ht(I), C.c(), N(C, 1), C.m(t, null)) : C && (ue(), H(C, 1, 1, () => {
        C = null;
      }), fe());
    },
    i(I) {
      if (!S) {
        for (let T = 0; T < X.length; T += 1)
          N(A[T]);
        N(C), S = !0;
      }
    },
    o(I) {
      for (let T = 0; T < A.length; T += 1)
        H(A[T]);
      H(C), S = !1;
    },
    d(I) {
      I && R(e);
      for (let T = 0; T < A.length; T += 1)
        A[T].d();
      C && C.d(), w = !1, Y(F);
    }
  };
}
const Ue = 220, he = 100;
class Ei {
  constructor(e, t) {
    O(this, "data");
    O(this, "state");
    O(this, "layerActive");
    O(this, "isDragging", !1);
    O(this, "pauseDragg", !1);
    O(this, "dragID");
    O(this, "targetID");
    this.data = e, this.state = t, this.layerActive = t.editLayout_01;
  }
  moveRow() {
    this.isDragging && (!this.dragID || !this.targetID || this.targetID == this.dragID || this.data.update((e) => {
      let t = this.findIndexOfID(this.dragID), i = this.findIndexOfID(this.targetID);
      const s = e.data[t];
      return this.pauseDragg = !0, setTimeout(
        () => {
          this.pauseDragg = !1;
        },
        Ue
      ), e.data[t] = e.data[i], e.data[i] = s, e;
    }));
  }
  onDragStart(e, t) {
    if (!x(this.layerActive))
      return;
    const i = e.target;
    i.classList.contains("Row") && (this.isDragging = !0, this.dragID = t, i.setAttribute("data-dragging", "true"));
  }
  onDragOver(e, t) {
    x(this.layerActive) && (!this.isDragging || this.pauseDragg || (this.targetID = t, this.moveRow()));
  }
  onDragEnd(e, t) {
    if (!x(this.layerActive))
      return;
    this.isDragging = !1, this.dragID = null, this.targetID = null, e.target.setAttribute("data-dragging", "false");
  }
  findIndexOfID(e) {
    return x(this.data).data.findIndex((t) => t.id == e);
  }
}
class Ai {
  constructor(e, t) {
    O(this, "data");
    O(this, "state");
    O(this, "layerActive");
    O(this, "isDragging", !1);
    O(this, "pauseDragg", !1);
    O(this, "dragTargetElement");
    O(this, "dragID");
    O(this, "targetID");
    O(this, "lastDragId");
    O(this, "lasttargId");
    this.data = e, this.state = t, this.layerActive = t.editLayout_02;
  }
  innerMoveItem(e, t, i) {
    let s, a, l, r;
    if ([s, a] = this.findRowIndexOfID(t), [l, r] = this.findRowIndexOfID(i), s == -1 || l == -1)
      return;
    const o = e.data[s].data[a], d = e.data[l].data[r];
    e.data[s].data[a] = d, e.data[l].data[r] = o;
  }
  moveRowItem() {
    this.isDragging && (!this.dragID || this.targetID == this.dragID || this.data.update((e) => this.dragID == this.lastDragId && this.targetID == this.lasttargId ? (this.innerMoveItem(e, this.lasttargId, this.lastDragId), e) : (this.lastDragId && this.lasttargId && this.innerMoveItem(e, this.lastDragId, this.lasttargId), this.targetID && this.innerMoveItem(e, this.dragID, this.targetID), this.lastDragId = this.dragID, this.lasttargId = this.targetID, this.pauseDragg = !0, setTimeout(
      () => {
        this.pauseDragg = !1;
      },
      Ue
    ), e)));
  }
  onDragStart(e, t) {
    if (!x(this.layerActive))
      return;
    const i = e.target;
    i.classList.contains("Column") && (this.dragTargetElement = i, this.isDragging = !0, this.dragID = t, this.lastDragId = null, this.lasttargId = null, i.setAttribute("data-dragging", "true"));
  }
  onDragOver(e, t) {
    var i;
    x(this.layerActive) && (!this.isDragging || this.pauseDragg || (this.targetID = t, this.moveRowItem(), (i = this.dragTargetElement) == null || i.setAttribute("data-dragging", "true")));
  }
  onDragEnd(e, t) {
    var i;
    x(this.layerActive) && (this.isDragging = !1, this.dragID = null, this.targetID = null, e.target.setAttribute("data-dragging", "false"), (i = this.dragTargetElement) == null || i.setAttribute("data-dragging", "false"));
  }
  onLeave(e, t) {
    this.targetID = null;
  }
  findRowIndexOfID(e) {
    let t = -1;
    return [x(this.data).data.findIndex((s) => {
      let a = s.data.findIndex((l) => l.id == e);
      return a != -1 ? (t = a, !0) : !1;
    }), t];
  }
  isBeingDragged(e) {
    return this.dragID == e;
  }
}
class Ri {
  constructor(e, t) {
    O(this, "data");
    O(this, "state");
    O(this, "layerActive");
    O(this, "isDragging", !1);
    O(this, "pauseDragg", !1);
    O(this, "dragTargetElement");
    O(this, "dragID");
    O(this, "targetID");
    O(this, "targetRowId");
    O(this, "lastDragId");
    O(this, "lasttargId");
    O(this, "lasttargRowId");
    this.data = e, this.state = t, this.layerActive = t.editLayout_03;
  }
  innerSwitchItem(e, t, i) {
    let s, a, l, r, o, d;
    if ([s, a, l] = this.findIndexsOfID(t), [r, o, d] = this.findIndexsOfID(i), s == -1 || r == -1 || a == -1 || o == -1 || l == -1 || d == -1)
      return;
    const u = e.data[s].data[a].data[l], h = e.data[r].data[o].data[d];
    e.data[s].data[a].data[l] = h, e.data[r].data[o].data[d] = u;
  }
  innerMoveItem(e, t, i) {
    let s, a, l, r, o;
    if ([s, a, l] = this.findIndexsOfID(t), [r, o] = this.findColumnIndexsOfID(i), s == -1 || r == -1 || a == -1 || o == -1 || l == -1 || s == r && a == o)
      return;
    let d = e.data[s].data[a].data.splice(l, 1)[0];
    e.data[r].data[o].data.push(d);
  }
  moveRowItem() {
    this.isDragging && (!this.dragID || this.targetID == this.dragID || this.targetRowId && this.data.update((e) => (this.targetRowId && this.innerMoveItem(e, this.dragID, this.targetRowId), this.lastDragId = this.dragID, this.lasttargId = this.targetID, this.lasttargRowId = null, this.pauseDragg = !0, setTimeout(
      () => {
        this.pauseDragg = !1;
      },
      Ue
    ), e)));
  }
  requestMoveItemUpDown(e, t) {
    this.data.update((i) => {
      let s, a, l;
      [s, a, l] = this.findIndexsOfID(t);
      let r = l + e;
      if (r < 0)
        return;
      if (i.data[s].data[a].data.length - 1 < r)
        return console.error("Out of Bounds move, so did not attempt"), i;
      const o = i.data[s].data[a].data.splice(l, 1)[0];
      return i.data[s].data[a].data.splice(r, 0, o), this.pauseDragg = !0, setTimeout(
        () => {
          this.pauseDragg = !1;
        },
        Ue
      ), i;
    });
  }
  onDragStart(e, t) {
    if (!x(this.layerActive))
      return;
    const i = e.target;
    i.classList.contains("Item") && (this.dragTargetElement = i, this.isDragging = !0, this.dragID = t, this.lastDragId = null, this.lasttargId = null, i.setAttribute("data-dragging", "true"));
  }
  onDragOverColumn(e, t) {
    var i;
    x(this.layerActive) && (!this.isDragging || this.pauseDragg || (this.targetID = null, this.targetRowId = t, this.moveRowItem(), (i = this.dragTargetElement) == null || i.setAttribute("data-dragging", "true")));
  }
  onDragEnd(e, t) {
    var i;
    x(this.layerActive) && (this.isDragging = !1, this.dragID = null, this.targetID = null, e.target.setAttribute("data-dragging", "false"), (i = this.dragTargetElement) == null || i.setAttribute("data-dragging", "false"));
  }
  onLeave(e, t) {
    this.targetID = null;
  }
  findIndexsOfID(e) {
    let t = -1, i = -1, s = -1;
    return s = x(this.data).data.findIndex((l) => {
      let r = l.data.findIndex((o) => {
        let d = o.data.findIndex((u) => u.id == e);
        return d != -1 ? (t = d, !0) : !1;
      });
      return r != -1 ? (i = r, !0) : !1;
    }), [s, i, t];
  }
  findColumnIndexsOfID(e) {
    let t = -1, i = -1;
    return i = x(this.data).data.findIndex((a) => {
      let l = a.data.findIndex((r) => r.id == e);
      return l != -1 ? (t = l, !0) : !1;
    }), [i, t];
  }
  isBeingDragged(e) {
    return this.dragID == e;
  }
}
class Ni {
  constructor() {
    O(this, "editMode", Oe(!1));
    O(this, "editLayout_01", Oe(!1));
    O(this, "editLayout_02", Oe(!1));
    O(this, "editLayout_03", Oe(!1));
    this.editMode.subscribe((e) => {
      e && (this.editLayout_01.set(!1), this.editLayout_02.set(!1), this.editLayout_03.set(!1));
    }), this.editLayout_01.subscribe((e) => {
      e && (this.editLayout_02.set(!1), this.editLayout_03.set(!1), this.editMode.set(!1));
    }), this.editLayout_02.subscribe((e) => {
      e && (this.editLayout_01.set(!1), this.editLayout_03.set(!1), this.editMode.set(!1));
    }), this.editLayout_03.subscribe((e) => {
      e && (this.editLayout_01.set(!1), this.editLayout_02.set(!1), this.editMode.set(!1));
    });
  }
}
function jt(n, e, t = " ") {
  let i = e;
  for (let s = 0; s < n - 1; s++)
    i += t, i += e;
  return i;
}
const Bi = (n) => {
  n.preventDefault();
};
function Vi(n, e, t) {
  let i, s, a, l, r, o = new Ni(), d = o.editMode;
  Se(n, d, (M) => t(1, i = M));
  let u = o.editLayout_01;
  Se(n, u, (M) => t(2, s = M));
  let h = o.editLayout_02;
  Se(n, h, (M) => t(3, a = M));
  let f = o.editLayout_03;
  Se(n, f, (M) => t(4, l = M));
  let { textData: _ } = e, { sys: g } = e, $ = JSON.parse(_), p = new zn($), v = Oe(p);
  Se(n, v, (M) => t(5, r = M));
  function E(M, V) {
    D.requestMoveItemUpDown(M, V);
  }
  Me(() => {
  });
  let m = new Ei(v, o), k = new Ai(v, o), D = new Ri(v, o);
  const A = () => d.set(!i), P = () => u.set(!x(u)), J = () => h.set(!x(h)), S = () => f.set(!x(f)), w = (M) => {
    M.addColumn(), v.update((V) => V);
  }, F = (M) => {
    v.update((V) => (V.remRow(M.id), V));
  }, X = (M, V) => {
    M.remColumn(V.id), v.update((qe) => qe);
  }, Z = (M) => {
    M.addItem(), v.update((V) => V);
  }, C = (M, V) => {
    M.remItem(V.id), v.update((qe) => qe);
  }, I = (M) => {
    E(-1, M.detail);
  }, T = (M) => {
    E(1, M.detail);
  }, q = (M, V) => {
    D.onDragStart(V, M.id);
  }, un = (M, V) => {
    D.onDragEnd(V, M.id);
  }, fn = (M, V) => {
    D.onDragEnd(V, M.id);
  }, cn = (M, V) => {
    D.onLeave(V, M.id);
  }, hn = (M, V) => {
    k.onDragStart(V, M.id);
  }, gn = (M, V) => {
    k.onDragOver(V, M.id), D.onDragOverColumn(V, M.id);
  }, _n = (M, V) => {
    k.onDragEnd(V, M.id);
  }, mn = (M, V) => {
    k.onDragEnd(V, M.id);
  }, pn = (M, V) => {
    k.onLeave(V, M.id);
  }, vn = (M, V) => {
    k.onDragOver(V, M.id), D.onDragOverColumn(V, M.id), V.preventDefault();
  }, bn = (M, V) => m.onDragStart(V, M.id), yn = (M, V) => m.onDragOver(V, M.id), $n = (M, V) => m.onDragEnd(V, M.id), wn = (M, V) => {
    m.onDragOver(V, M.id), V.preventDefault();
  }, Dn = () => {
    v.update((M) => (M.addRow(), M.data[r.data.length - 1].addColumn(), M));
  };
  return n.$$set = (M) => {
    "textData" in M && t(15, _ = M.textData), "sys" in M && t(0, g = M.sys);
  }, [
    g,
    i,
    s,
    a,
    l,
    r,
    d,
    u,
    h,
    f,
    v,
    E,
    m,
    k,
    D,
    _,
    A,
    P,
    J,
    S,
    w,
    F,
    X,
    Z,
    C,
    I,
    T,
    q,
    un,
    fn,
    cn,
    hn,
    gn,
    _n,
    mn,
    pn,
    vn,
    bn,
    yn,
    $n,
    wn,
    Dn
  ];
}
class Ti extends oe {
  constructor(e) {
    super(), le(this, e, Vi, Li, ie, { textData: 15, sys: 0 }, null, [-1, -1]);
  }
  get textData() {
    return this.$$.ctx[15];
  }
  set textData(e) {
    this.$$set({ textData: e }), L();
  }
  get sys() {
    return this.$$.ctx[0];
  }
  set sys(e) {
    this.$$set({ sys: e }), L();
  }
}
re(Ti, { textData: {}, sys: {} }, [], [], !0);
export {
  Ti as default
};
//# sourceMappingURL=components.js.map
