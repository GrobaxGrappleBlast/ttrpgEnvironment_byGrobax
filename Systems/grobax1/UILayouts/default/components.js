var In = Object.defineProperty;
var kn = (n, e, t) => e in n ? In(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var N = (n, e, t) => kn(n, typeof e != "symbol" ? e + "" : e, t);
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
function ne(n, e) {
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
const we = /* @__PURE__ */ new Set();
function zt(n) {
  we.forEach((e) => {
    e.c(n) || (we.delete(e), e.f());
  }), we.size !== 0 && Ze(zt);
}
function Yt(n) {
  let e;
  return we.size === 0 && Ze(zt), {
    promise: new Promise((t) => {
      we.add(e = { c: n, f: t });
    }),
    abort() {
      we.delete(e);
    }
  };
}
function v(n, e) {
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
  const e = b("style");
  return e.textContent = "/* empty */", Cn(Gt(n), e), e.sheet;
}
function Cn(n, e) {
  return v(
    /** @type {Document} */
    n.head || n,
    e
  ), e.sheet;
}
function B(n, e, t) {
  n.insertBefore(e, t || null);
}
function A(n) {
  n.parentNode && n.parentNode.removeChild(n);
}
function He(n, e) {
  for (let t = 0; t < n.length; t += 1)
    n[t] && n[t].d(e);
}
function b(n) {
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
function g(n, e, t) {
  t == null ? n.removeAttribute(e) : n.getAttribute(e) !== t && n.setAttribute(e, t);
}
function je(n) {
  return n === "" ? null : +n;
}
function Nn(n) {
  return Array.from(n.childNodes);
}
function fe(n, e) {
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
function Ln(n) {
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
function En(n) {
  let e = 5381, t = n.length;
  for (; t--; ) e = (e << 5) - e ^ n.charCodeAt(t);
  return e >>> 0;
}
function An(n, e) {
  const t = { stylesheet: Sn(e), rules: {} };
  return Be.set(n, t), t;
}
function Ge(n, e, t, i, s, a, l, r = 0) {
  const o = 16.666 / i;
  let d = `{
`;
  for (let m = 0; m <= 1; m += o) {
    const p = e + (t - e) * a(m);
    d += m * 100 + `%{${l(p, 1 - p)}}
`;
  }
  const u = d + `100% {${l(t, 1 - t)}}
}`, h = `__svelte_${En(u)}_${r}`, f = Gt(n), { stylesheet: _, rules: c } = Be.get(f) || An(f, n);
  c[h] || (c[h] = !0, _.insertRule(`@keyframes ${h} ${u}`, _.cssRules.length));
  const y = n.style.animation || "";
  return n.style.animation = `${y ? `${y}, ` : ""}${h} ${i}ms linear ${s}ms 1 both`, Ve += 1, h;
}
function Xt(n, e) {
  const t = (n.style.animation || "").split(", "), i = t.filter(
    e ? (a) => a.indexOf(e) < 0 : (a) => a.indexOf("__svelte") === -1
    // remove all Svelte animations
  ), s = t.length - i.length;
  s && (n.style.animation = i.join(", "), Ve -= s, Ve || Rn());
}
function Rn() {
  Ze(() => {
    Ve || (Be.forEach((n) => {
      const { ownerNode: e } = n.stylesheet;
      e && A(e);
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
  let f = !0, _ = !1, c;
  function y() {
    h && (c = Ge(n, 0, 1, l, a, r, h)), a || (_ = !0);
  }
  function m() {
    h && Xt(n, c), f = !1;
  }
  return Yt((p) => {
    if (!_ && p >= o && (_ = !0), _ && p >= d && (u(1, 0), m()), !f)
      return !1;
    if (_) {
      const $ = p - o, k = 0 + 1 * r($ / l);
      u(k, 1 - k);
    }
    return !0;
  }), y(), u(0, 1), m;
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
let Le;
function Ne(n) {
  Le = n;
}
function tt() {
  if (!Le) throw new Error("Function called outside component initialization");
  return Le;
}
function Ie(n) {
  tt().$$.on_mount.push(n);
}
function Ee(n) {
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
const $e = [], ie = [];
let De = [];
const We = [], Bn = /* @__PURE__ */ Promise.resolve();
let Qe = !1;
function Vn() {
  Qe || (Qe = !0, Bn.then(L));
}
function se(n) {
  De.push(n);
}
function ke(n) {
  We.push(n);
}
const Je = /* @__PURE__ */ new Set();
let be = 0;
function L() {
  if (be !== 0)
    return;
  const n = Le;
  do {
    try {
      for (; be < $e.length; ) {
        const e = $e[be];
        be++, Ne(e), Tn(e.$$);
      }
    } catch (e) {
      throw $e.length = 0, be = 0, e;
    }
    for (Ne(null), $e.length = 0, be = 0; ie.length; ) ie.pop()();
    for (let e = 0; e < De.length; e += 1) {
      const t = De[e];
      Je.has(t) || (Je.add(t), t());
    }
    De.length = 0;
  } while ($e.length);
  for (; We.length; )
    We.pop()();
  Qe = !1, Je.clear(), Ne(n);
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
  De.forEach((i) => n.indexOf(i) === -1 ? e.push(i) : t.push(i)), t.forEach((i) => i()), De = e;
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
const Ae = /* @__PURE__ */ new Set();
let ce;
function de() {
  ce = {
    r: 0,
    c: [],
    p: ce
    // parent group
  };
}
function ue() {
  ce.r || Y(ce.c), ce = ce.p;
}
function R(n, e) {
  n && n.i && (Ae.delete(n), n.i(e));
}
function H(n, e, t, i) {
  if (n && n.o) {
    if (Ae.has(n)) return;
    Ae.add(n), ce.c.push(() => {
      Ae.delete(n), i && (t && n.d(1), i());
    }), n.o(e);
  } else i && i();
}
const Hn = { duration: 0 };
function z(n, e, t, i) {
  let a = e(n, t, { direction: "both" }), l = i ? 0 : 1, r = null, o = null, d = null, u;
  function h() {
    d && Xt(n, d);
  }
  function f(c, y) {
    const m = (
      /** @type {Program['d']} */
      c.b - l
    );
    return y *= Math.abs(m), {
      a: l,
      b: c.b,
      d: m,
      duration: y,
      start: c.start,
      end: c.start + y,
      group: c.group
    };
  }
  function _(c) {
    const {
      delay: y = 0,
      duration: m = 300,
      easing: p = Xe,
      tick: $ = K,
      css: k
    } = a || Hn, w = {
      start: Jt() + y,
      b: c
    };
    c || (w.group = ce, ce.r += 1), "inert" in n && (c ? u !== void 0 && (n.inert = u) : (u = /** @type {HTMLElement} */
    n.inert, n.inert = !0)), r || o ? o = w : (k && (h(), d = Ge(n, l, c, m, y, p, k)), c && $(0, 1), r = f(w, m), se(() => ze(n, c, "start")), Yt((I) => {
      if (o && I > o.start && (r = f(o, m), o = null, ze(n, r.b, "start"), k && (h(), d = Ge(
        n,
        l,
        r.b,
        r.duration,
        0,
        p,
        a.css
      ))), r) {
        if (I >= r.end)
          $(l = r.b, 1 - l), ze(n, r.b, "end"), o || (r.b ? h() : --r.group.r || Y(r.group.c)), r = null;
        else if (I >= r.start) {
          const E = I - r.start;
          l = r.a + r.d * p(E / r.duration), $(l, 1 - l);
        }
      }
      return !!(r || o);
    }));
  }
  return {
    run(c) {
      Pe(a) ? Pn().then(() => {
        a = a({ direction: c ? "in" : "out" }), _(c);
      }) : _(c);
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
  let f = n.length, _ = a.length, c = f;
  const y = {};
  for (; c--; ) y[n[c].key] = c;
  const m = [], p = /* @__PURE__ */ new Map(), $ = /* @__PURE__ */ new Map(), k = [];
  for (c = _; c--; ) {
    const P = h(s, a, c), J = t(P);
    let C = l.get(J);
    C ? k.push(() => C.p(P, e)) : (C = d(J, P), C.c()), p.set(J, m[c] = C), J in y && $.set(J, Math.abs(c - y[J]));
  }
  const w = /* @__PURE__ */ new Set(), I = /* @__PURE__ */ new Set();
  function E(P) {
    R(P, 1), P.m(r, u), l.set(P.key, P), u = P.first, _--;
  }
  for (; f && _; ) {
    const P = m[_ - 1], J = n[f - 1], C = P.key, D = J.key;
    P === J ? (u = P.first, f--, _--) : p.has(D) ? !l.has(C) || w.has(C) ? E(P) : I.has(D) ? f-- : $.get(C) > $.get(D) ? (I.add(C), E(P)) : (w.add(D), f--) : (o(J, l), f--);
  }
  for (; f--; ) {
    const P = n[f];
    p.has(P.key) || o(P, l);
  }
  for (; _; ) E(m[_ - 1]);
  return Y(k), m;
}
function Me(n, e, t) {
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
  n.$$.dirty[0] === -1 && ($e.push(n), Vn(), n.$$.dirty.fill(0)), n.$$.dirty[e / 31 | 0] |= 1 << e % 31;
}
function le(n, e, t, i, s, a, l = null, r = [-1]) {
  const o = Le;
  Ne(n);
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
    const c = _.length ? _[0] : f;
    return d.ctx && s(d.ctx[h], d.ctx[h] = c) && (!d.skip_bound && d.bound[h] && d.bound[h](c), u && Fn(n, h)), f;
  }) : [], d.update(), u = !0, Y(d.before_update), d.fragment = i ? i(d.ctx) : !1, e.target) {
    if (e.hydrate) {
      const h = Nn(e.target);
      d.fragment && d.fragment.l(h), h.forEach(A);
    } else
      d.fragment && d.fragment.c();
    e.intro && R(n.$$.fragment), W(n, e.target, e.anchor), L();
  }
  Ne(o);
}
let Zt;
typeof HTMLElement == "function" && (Zt = class extends HTMLElement {
  constructor(e, t, i) {
    super();
    /** The Svelte component constructor */
    N(this, "$$ctor");
    /** Slots */
    N(this, "$$s");
    /** The Svelte component instance */
    N(this, "$$c");
    /** Whether or not the custom element is connected */
    N(this, "$$cn", !1);
    /** Component props data */
    N(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    N(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    N(this, "$$p_d", {});
    /** @type {Record<string, Function[]>} Event listeners */
    N(this, "$$l", {});
    /** @type {Map<Function, Function>} Event listener unsubscribe functions */
    N(this, "$$l_u", /* @__PURE__ */ new Map());
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
              l = b("slot"), a !== "default" && g(l, "name", a);
            },
            /**
             * @param {HTMLElement} target
             * @param {HTMLElement} [anchor]
             */
            m: function(d, u) {
              B(d, l, u);
            },
            d: function(d) {
              d && A(l);
            }
          };
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const t = {}, i = Ln(this);
      for (const a of this.$$s)
        a in i && (t[a] = [e(a)]);
      for (const a of this.attributes) {
        const l = this.$$g_p(a.name);
        l in this.$$d || (this.$$d[l] = Re(l, a.value, this.$$p_d, "toProp"));
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
            const l = Re(
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
    this.$$r || (e = this.$$g_p(e), this.$$d[e] = Re(e, i, this.$$p_d, "toProp"), (s = this.$$c) == null || s.$set({ [e]: this.$$d[e] }));
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
function Re(n, e, t, i) {
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
        o = Re(r, o, e), this.$$d[r] = o, (d = this.$$c) == null || d.$set({ [r]: o });
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
    N(this, "$$");
    /**
     * ### PRIVATE API
     *
     * Do not use, may change at any time
     *
     * @type {any}
     */
    N(this, "$$set");
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
    N(this, "keyCounter", 0);
  }
  getNewKey() {
    return (this.keyCounter++).toString(16);
  }
}
var ge = new Jn();
class Ye {
  constructor(e = "NONE", t = "{}") {
    N(this, "id");
    N(this, "type");
    N(this, "data");
    this.id = ge.getNewKey(), this.type = e, this.data = JSON.parse(t);
  }
}
class ot {
  constructor(e = []) {
    N(this, "id");
    N(this, "data", []);
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
    N(this, "id");
    N(this, "data", []);
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
    N(this, "id");
    N(this, "data", []);
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
const ye = [];
function Oe(n, e = K) {
  let t;
  const i = /* @__PURE__ */ new Set();
  function s(r) {
    if (ne(n, r) && (n = r, t)) {
      const o = !ye.length;
      for (const d of i)
        d[1](), ye.push(d, n);
      if (o) {
        for (let d = 0; d < ye.length; d += 2)
          ye[d][0](ye[d + 1]);
        ye.length = 0;
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
  const r = getComputedStyle(n), o = +r.opacity, d = r.transform === "none" ? "" : r.transform, u = o * (1 - l), [h, f] = rt(s), [_, c] = rt(a);
  return {
    delay: e,
    duration: t,
    easing: i,
    css: (y, m) => `
			transform: ${d} translate(${(1 - y) * h}${f}, ${(1 - y) * _}${c});
			opacity: ${o - u * m}`
  };
}
function ae(n, { delay: e = 0, duration: t = 400, easing: i = st, axis: s = "y" } = {}) {
  const a = getComputedStyle(n), l = +a.opacity, r = s === "y" ? "height" : "width", o = parseFloat(a[r]), d = s === "y" ? ["top", "bottom"] : ["left", "right"], u = d.map(
    (p) => `${p[0].toUpperCase()}${p.slice(1)}`
  ), h = parseFloat(a[`padding${u[0]}`]), f = parseFloat(a[`padding${u[1]}`]), _ = parseFloat(a[`margin${u[0]}`]), c = parseFloat(a[`margin${u[1]}`]), y = parseFloat(
    a[`border${u[0]}Width`]
  ), m = parseFloat(
    a[`border${u[1]}Width`]
  );
  return {
    delay: e,
    duration: t,
    easing: i,
    css: (p) => `overflow: hidden;opacity: ${Math.min(p * 20, 1) * l};${r}: ${p * o}px;padding-${d[0]}: ${p * h}px;padding-${d[1]}: ${p * f}px;margin-${d[0]}: ${p * _}px;margin-${d[1]}: ${p * c}px;border-${d[0]}-width: ${p * y}px;border-${d[1]}-width: ${p * m}px;`
  };
}
function Yn(n) {
  let e, t, i;
  return {
    c() {
      e = b("div"), e.textContent = "Hit Point Maximum", t = j(), i = b("input"), g(i, "type", "number");
    },
    m(s, a) {
      B(s, e, a), B(s, t, a), B(s, i, a);
    },
    d(s) {
      s && (A(e), A(t), A(i));
    }
  };
}
function Gn(n) {
  let e, t, i;
  return {
    c() {
      e = b("div"), e.textContent = "Hit Point Maximum", t = j(), i = b("input"), g(i, "type", "number");
    },
    m(s, a) {
      B(s, e, a), B(s, t, a), B(s, i, a);
    },
    d(s) {
      s && (A(e), A(t), A(i));
    }
  };
}
function Wn(n) {
  let e, t, i;
  return {
    c() {
      e = b("div"), e.textContent = "Hit Point Maximum", t = j(), i = b("input"), g(i, "type", "number");
    },
    m(s, a) {
      B(s, e, a), B(s, t, a), B(s, i, a);
    },
    d(s) {
      s && (A(e), A(t), A(i));
    }
  };
}
function Qn(n) {
  let e, t, i, s, a, l, r, o, d, u, h, f;
  function _(m, p) {
    return (
      /*editMode*/
      m[0] ? Wn : (
        /*playMode*/
        m[1] ? Gn : Yn
      )
    );
  }
  let c = _(n), y = c(n);
  return {
    c() {
      e = b("div"), t = b("div"), t.textContent = "Hit Points", i = j(), s = b("input"), l = j(), r = b("div"), r.textContent = "temporary Hit Points", o = j(), d = b("input"), u = j(), y.c(), g(s, "type", "number"), s.disabled = a = !/*editMode*/
      n[0], g(d, "type", "number");
    },
    m(m, p) {
      B(m, e, p), v(e, t), v(e, i), v(e, s), me(
        s,
        /*v*/
        n[2]
      ), v(e, l), v(e, r), v(e, o), v(e, d), v(e, u), y.m(e, null), h || (f = [
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
    p(m, [p]) {
      p & /*editMode*/
      1 && a !== (a = !/*editMode*/
      m[0]) && (s.disabled = a), p & /*v*/
      4 && je(s.value) !== /*v*/
      m[2] && me(
        s,
        /*v*/
        m[2]
      ), c !== (c = _(m)) && (y.d(1), y = c(m), y && (y.c(), y.m(e, null)));
    },
    i: K,
    o: K,
    d(m) {
      m && A(e), y.d(), h = !1, Y(f);
    }
  };
}
function Xn(n, e, t) {
  let { sys: i } = e, { editMode: s } = e, { playMode: a } = e, { data: l } = e, r = i.getNode("fixed", "generic", "Hit Points"), o = r.getValue();
  const d = ge.getNewKey();
  Ie(() => {
    r.addUpdateListener(name + d + "SvelteView", () => {
      t(2, o = r.getValue());
    });
  }), Ee(() => {
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
class xt extends oe {
  constructor(e) {
    super(), le(this, e, Xn, Qn, ne, {
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
re(xt, { sys: {}, editMode: {}, playMode: {}, data: {} }, [], [], !0);
var _e = /* @__PURE__ */ ((n) => (n.HitPoints = "HitPoints", n.ProficiencyBonus = "ProficiencyBonus", n.SkillProficiencies = "SkillProficiencies", n.SpellInfo = "SpellInfo", n.Stats = "Stats", n))(_e || {});
function Zn(n, { from: e, to: t }, i = {}) {
  const s = getComputedStyle(n), a = s.transform === "none" ? "" : s.transform, [l, r] = s.transformOrigin.split(" ").map(parseFloat), o = e.left + e.width * l / t.width - (t.left + l), d = e.top + e.height * r / t.height - (t.top + r), { delay: u = 0, duration: h = (_) => Math.sqrt(_) * 120, easing: f = st } = i;
  return {
    delay: u,
    duration: Pe(h) ? h(Math.sqrt(o * o + d * d)) : h,
    easing: f,
    css: (_, c) => {
      const y = c * o, m = c * d, p = _ + c * e.width / t.width, $ = _ + c * e.height / t.height;
      return `transform: ${a} translate(${y}px, ${m}px) scale(${p}, ${$});`;
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
      e = b("div"), i = G(t), g(e, "class", "GrobSelectLabel effect"), g(e, "data-isdisabled", s = /*disabled*/
      n[3] ?? !1), g(e, "data-iserror", a = /*isError*/
      n[4] ?? !1), g(e, "data-selected", l = /*selected*/
      n[0] ?? !1), g(e, "tabindex", "-1");
    },
    m(d, u) {
      B(d, e, u), v(e, i), n[17](e), r || (o = [
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
      )) + "") && fe(i, t), u & /*disabled*/
      8 && s !== (s = /*disabled*/
      d[3] ?? !1) && g(e, "data-isdisabled", s), u & /*isError*/
      16 && a !== (a = /*isError*/
      d[4] ?? !1) && g(e, "data-iserror", a), u & /*selected*/
      1 && l !== (l = /*selected*/
      d[0] ?? !1) && g(e, "data-selected", l);
    },
    d(d) {
      d && A(e), n[17](null), r = !1, Y(o);
    }
  };
}
function ht(n) {
  let e, t, i, s, a, l = [], r = /* @__PURE__ */ new Map(), o, d, u, h, f, _, c = ee(
    /*options*/
    n[1]
  );
  const y = (p) => (
    /*opt*/
    p[23]
  );
  for (let p = 0; p < c.length; p += 1) {
    let $ = ft(n, c, p), k = y($);
    r.set(k, l[p] = gt(k, $));
  }
  let m = (
    /*options*/
    n[1].length == 0 && _t()
  );
  return {
    c() {
      var p, $, k, w;
      e = b("div"), t = b("div"), i = b("div"), a = j();
      for (let I = 0; I < l.length; I += 1)
        l[I].c();
      o = j(), m && m.c(), d = j(), u = b("div"), g(i, "class", "Arrow"), g(i, "style", s = `left:${/*arrowOffsetLeft*/
      n[12]}px`), g(t, "class", "ArrowContainer"), g(u, "class", "selectEndTracker"), g(e, "class", "SelectPopUp"), g(e, "style", h = "width:" + /*labelRect*/
      (((p = n[7]) == null ? void 0 : p.width) ?? 100) + "px;left: " + /*labelRect*/
      ((($ = n[7]) == null ? void 0 : $.x) ?? 0) + "px;top: " + /*labelRect*/
      ((((k = n[7]) == null ? void 0 : k.y) ?? 0) + /*labelRect*/
      (((w = n[7]) == null ? void 0 : w.height) ?? 0) + 8) + "px;max-height:" + /*override_maxHeight*/
      n[11] + "px");
    },
    m(p, $) {
      B(p, e, $), v(e, t), v(t, i), n[18](t), v(e, a);
      for (let k = 0; k < l.length; k += 1)
        l[k] && l[k].m(e, null);
      v(e, o), m && m.m(e, null), v(e, d), v(e, u), n[19](u), _ = !0;
    },
    p(p, $) {
      var k, w, I, E;
      (!_ || $ & /*arrowOffsetLeft*/
      4096 && s !== (s = `left:${/*arrowOffsetLeft*/
      p[12]}px`)) && g(i, "style", s), $ & /*selected, options, clickOption*/
      32771 && (c = ee(
        /*options*/
        p[1]
      ), l = Fe(l, $, y, 1, p, c, r, e, jn, gt, o, ft)), /*options*/
      p[1].length == 0 ? m || (m = _t(), m.c(), m.m(e, d)) : m && (m.d(1), m = null), (!_ || $ & /*labelRect, override_maxHeight*/
      2176 && h !== (h = "width:" + /*labelRect*/
      (((k = p[7]) == null ? void 0 : k.width) ?? 100) + "px;left: " + /*labelRect*/
      (((w = p[7]) == null ? void 0 : w.x) ?? 0) + "px;top: " + /*labelRect*/
      ((((I = p[7]) == null ? void 0 : I.y) ?? 0) + /*labelRect*/
      (((E = p[7]) == null ? void 0 : E.height) ?? 0) + 8) + "px;max-height:" + /*override_maxHeight*/
      p[11] + "px")) && g(e, "style", h);
    },
    i(p) {
      _ || (p && se(() => {
        _ && (f || (f = z(e, ae, {}, !0)), f.run(1));
      }), _ = !0);
    },
    o(p) {
      p && (f || (f = z(e, ae, {}, !1)), f.run(0)), _ = !1;
    },
    d(p) {
      p && A(e), n[18](null);
      for (let $ = 0; $ < l.length; $ += 1)
        l[$].d();
      m && m.d(), n[19](null), p && f && f.end();
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
      t = b("div"), s = G(i), g(t, "role", "none"), g(t, "class", "GrobSelectOption"), g(t, "data-selected", a = /*selected*/
      e[0] == /*opt*/
      e[23]), g(t, "data-value", l = /*opt*/
      e[23]), this.first = t;
    },
    m(d, u) {
      B(d, t, u), v(t, s), r || (o = [
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
      e[23] + "") && fe(s, i), u & /*selected, options*/
      3 && a !== (a = /*selected*/
      e[0] == /*opt*/
      e[23]) && g(t, "data-selected", a), u & /*options*/
      2 && l !== (l = /*opt*/
      e[23]) && g(t, "data-value", l);
    },
    d(d) {
      d && A(t), r = !1, Y(o);
    }
  };
}
function _t(n) {
  let e;
  return {
    c() {
      e = b("i"), e.textContent = "No Options", g(e, "class", "GrobSelectInfo");
    },
    m(t, i) {
      B(t, e, i);
    },
    d(t) {
      t && A(e);
    }
  };
}
function xn(n) {
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
      e = b("div"), a.c(), i = j(), s = b("div"), l && l.c(), g(e, "class", "GrobSelect");
    },
    m(r, o) {
      B(r, e, o), a.m(e, null), v(e, i), v(e, s), l && l.m(s, null);
    },
    p(r, [o]) {
      o & /*selected*/
      1 && ne(t, t = /*selected*/
      r[0]) ? (a.d(1), a = ct(r), a.c(), a.m(e, i)) : a.p(r, o), /*isFocussed*/
      r[8] || /*forceOpen*/
      r[5] ? l ? (l.p(r, o), o & /*isFocussed, forceOpen*/
      288 && R(l, 1)) : (l = ht(r), l.c(), R(l, 1), l.m(s, null)) : l && (de(), H(l, 1, 1, () => {
        l = null;
      }), ue());
    },
    i(r) {
      R(l);
    },
    o(r) {
      H(l);
    },
    d(r) {
      r && A(e), a.d(r), l && l.d();
    }
  };
}
const ei = 100;
function ti(n, e, t) {
  let i = nt(), { options: s } = e, { selected: a = null } = e, { unSelectedplaceholder: l = "None Selected" } = e, { disabled: r = !1 } = e, { isError: o = !1 } = e, { forceOpen: d = !1 } = e, { maxHeight: u = 500 } = e, h, f, _ = !1, c, y, m = u, p = 0;
  function $() {
    const D = h.getBoundingClientRect();
    t(7, f = D), t(8, _ = !0), E(), setTimeout(I, ei);
  }
  function k() {
    setTimeout(
      () => {
        t(8, _ = !1);
      },
      200
    );
  }
  function w(D) {
    let F = D.target.getAttribute("data-value");
    a == F ? (t(0, a = null), i("onDeselect")) : (t(0, a = F), i("onSelect", a));
  }
  function I() {
    let D = y.getBoundingClientRect().bottom, F = c.getBoundingClientRect().bottom, X = window.document.body.getBoundingClientRect().height;
    if (F > X) {
      let Z = F - X, M = F - D - Z;
      M < m && t(11, m = M);
    }
  }
  function E() {
    let D = h.getBoundingClientRect().width;
    t(12, p = D / 2);
  }
  function P(D) {
    ie[D ? "unshift" : "push"](() => {
      h = D, t(6, h);
    });
  }
  function J(D) {
    ie[D ? "unshift" : "push"](() => {
      y = D, t(10, y);
    });
  }
  function C(D) {
    ie[D ? "unshift" : "push"](() => {
      c = D, t(9, c);
    });
  }
  return n.$$set = (D) => {
    "options" in D && t(1, s = D.options), "selected" in D && t(0, a = D.selected), "unSelectedplaceholder" in D && t(2, l = D.unSelectedplaceholder), "disabled" in D && t(3, r = D.disabled), "isError" in D && t(4, o = D.isError), "forceOpen" in D && t(5, d = D.forceOpen), "maxHeight" in D && t(16, u = D.maxHeight);
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
    c,
    y,
    m,
    p,
    $,
    k,
    w,
    u,
    P,
    J,
    C
  ];
}
class ni extends oe {
  constructor(e) {
    super(), le(this, e, ti, xn, ne, {
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
re(ni, { options: {}, selected: {}, unSelectedplaceholder: {}, disabled: { type: "Boolean" }, isError: { type: "Boolean" }, forceOpen: { type: "Boolean" }, maxHeight: {} }, [], [], !0);
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
      e = b("option"), i = G(t), s = j(), e.__value = /*opt*/
      n[8], me(e, e.__value), e.selected = /*selected*/
      n[2] == /*opt*/
      n[8];
    },
    m(a, l) {
      B(a, e, l), v(e, i), v(e, s);
    },
    p: K,
    d(a) {
      a && A(e);
    }
  };
}
function ii(n) {
  let e, t, i, s, a, l, r, o = ee(
    /*options*/
    n[1]
  ), d = [];
  for (let u = 0; u < o.length; u += 1)
    d[u] = pt(mt(n, o, u));
  return {
    c() {
      e = b("div"), t = b("div"), i = b("div"), s = b("select"), a = b("option"), a.textContent = "choose component ";
      for (let u = 0; u < d.length; u += 1)
        d[u].c();
      a.__value = null, me(a, a.__value), g(i, "class", "ItemOptionBtn "), g(t, "class", "ItemOptions"), g(e, "class", "ItemOptionsContainer");
    },
    m(u, h) {
      B(u, e, h), v(e, t), v(t, i), v(i, s), v(s, a);
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
      u && A(e), He(d, u), n[6](null), l = !1, r();
    }
  };
}
function si(n, e, t) {
  let i = nt(), { data: s } = e, { editMode: a } = e, l = Object.keys(_e), r = s.type, o;
  function d() {
    let h = o.value;
    t(4, s.type = h, s), i("optionSelected");
  }
  function u(h) {
    ie[h ? "unshift" : "push"](() => {
      o = h, t(0, o), t(1, l);
    });
  }
  return n.$$set = (h) => {
    "data" in h && t(4, s = h.data), "editMode" in h && t(5, a = h.editMode);
  }, [o, l, r, d, s, a, u];
}
class en extends oe {
  constructor(e) {
    super(), le(this, e, si, ii, ne, { data: 4, editMode: 5 });
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
re(en, { data: {}, editMode: {} }, [], [], !0);
function ai(n) {
  let e, t, i, s, a, l, r;
  return {
    c() {
      e = b("div"), t = b("div"), t.textContent = "Proficiency Bonus", i = j(), s = b("input"), g(s, "type", "number"), s.disabled = a = !/*editMode*/
      n[0], g(e, "class", "ProficiencyBonus");
    },
    m(o, d) {
      B(o, e, d), v(e, t), v(e, i), v(e, s), me(
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
      o && A(e), l = !1, Y(r);
    }
  };
}
function li(n, e, t) {
  let { sys: i } = e, { editMode: s } = e, { data: a } = e, l = i.getNode("fixed", "generic", "Proficiency Bonus"), r = l.getValue();
  const o = ge.getNewKey();
  Ie(() => {
    l.addUpdateListener(name + o + "SvelteView", () => {
      t(1, r = l.getValue());
    });
  }), Ee(() => {
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
    super(), le(this, e, li, ai, ne, { sys: 3, editMode: 0, data: 4 });
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
      e = b("div"), t = b("div"), i = b("div"), s = j(), a = b("div"), l = b("p"), r = G(
        /*name*/
        n[1]
      ), o = j(), d = b("div"), u = b("p"), h = G(
        /*bonus*/
        n[3]
      ), g(i, "class", "skillproficiencyMark"), g(
        i,
        "data-level",
        /*value*/
        n[2]
      ), g(i, "role", "none"), g(t, "class", "skillproficiencyMarkParent"), g(a, "class", "skillproficiencyMarkName"), g(d, "class", "skillproficiencyMarkValue"), g(e, "class", "skillproficiencyContainer"), g(
        e,
        "data-edit",
        /*edit*/
        n[0]
      );
    },
    m(c, y) {
      B(c, e, y), v(e, t), v(t, i), v(e, s), v(e, a), v(a, l), v(l, r), v(e, o), v(e, d), v(d, u), v(u, h), f || (_ = [
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
    p(c, [y]) {
      y & /*value*/
      4 && g(
        i,
        "data-level",
        /*value*/
        c[2]
      ), y & /*name*/
      2 && fe(
        r,
        /*name*/
        c[1]
      ), y & /*bonus*/
      8 && fe(
        h,
        /*bonus*/
        c[3]
      ), y & /*edit*/
      1 && g(
        e,
        "data-edit",
        /*edit*/
        c[0]
      );
    },
    i: K,
    o: K,
    d(c) {
      c && A(e), f = !1, Y(_);
    }
  };
}
function oi(n, e, t) {
  let { edit: i } = e, { name: s } = e, { sys: a } = e, l = a.getNode("fixed", "SkillProficiencies", s), r = a.getNode("derived", "skillproficiencyBonus", s), o = l.getValue(), d = r.getValue();
  const u = ge.getNewKey();
  Ie(() => {
    l.addUpdateListener(s + u + "SvelteView", () => {
      t(2, o = l.getValue());
    }), r.addUpdateListener(s + u + "SvelteView", () => {
      t(3, d = r.getValue());
    });
  }), Ee(() => {
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
    super(), le(this, e, oi, ri, ne, { edit: 0, name: 1, sys: 5 });
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
      t || (R(e.$$.fragment, i), t = !0);
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
      e = b("div");
      for (let l = 0; l < s.length; l += 1)
        s[l].c();
      g(e, "class", "skillproficiencyCollection"), g(
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
          s[o] ? (s[o].p(d, r), R(s[o], 1)) : (s[o] = bt(d), s[o].c(), R(s[o], 1), s[o].m(e, null));
        }
        for (de(), o = i.length; o < s.length; o += 1)
          a(o);
        ue();
      }
      (!t || r & /*edit*/
      1) && g(
        e,
        "data-edit",
        /*edit*/
        l[0]
      );
    },
    i(l) {
      if (!t) {
        for (let r = 0; r < i.length; r += 1)
          R(s[r]);
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
      l && A(e), He(s, l);
    }
  };
}
function ui(n, e, t) {
  let { edit: i } = e, { sys: s } = e, { data: a } = e, l = s.getNodeNames("fixed", "SkillProficiencies");
  return n.$$set = (r) => {
    "edit" in r && t(0, i = r.edit), "sys" in r && t(1, s = r.sys), "data" in r && t(3, a = r.data);
  }, [i, s, l, a];
}
class sn extends oe {
  constructor(e) {
    super(), le(this, e, ui, di, ne, { edit: 0, sys: 1, data: 3 });
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
  return i[17] = e[t], i;
}
function fi(n) {
  let e;
  return {
    c() {
      e = b("div");
    },
    m(t, i) {
      B(t, e, i);
    },
    p: K,
    d(t) {
      t && A(e);
    }
  };
}
function ci(n) {
  let e, t, i, s, a = ee(
    /*spellBonusChoices*/
    n[5]
  ), l = [];
  for (let r = 0; r < a.length; r += 1)
    l[r] = $t(yt(n, a, r));
  return {
    c() {
      e = b("div"), t = b("select");
      for (let r = 0; r < l.length; r += 1)
        l[r].c();
    },
    m(r, o) {
      B(r, e, o), v(e, t);
      for (let d = 0; d < l.length; d += 1)
        l[d] && l[d].m(t, null);
      n[9](t), i || (s = U(
        t,
        "change",
        /*changeSort*/
        n[6]
      ), i = !0);
    },
    p(r, o) {
      if (o & /*spellBonusChoices, showStat*/
      34) {
        a = ee(
          /*spellBonusChoices*/
          r[5]
        );
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
      r && A(e), He(l, r), n[9](null), i = !1, s();
    }
  };
}
function $t(n) {
  let e, t = (
    /*key*/
    n[17] + ""
  ), i, s, a;
  return {
    c() {
      e = b("option"), i = G(t), s = j(), e.__value = /*key*/
      n[17], me(e, e.__value), e.selected = a = /*key*/
      n[17] == /*showStat*/
      n[1];
    },
    m(l, r) {
      B(l, e, r), v(e, i), v(e, s);
    },
    p(l, r) {
      r & /*showStat*/
      2 && a !== (a = /*key*/
      l[17] == /*showStat*/
      l[1]) && (e.selected = a);
    },
    d(l) {
      l && A(e);
    }
  };
}
function hi(n) {
  let e, t, i, s, a, l, r, o, d, u, h, f, _, c, y, m, p;
  function $(I, E) {
    return (
      /*edit*/
      I[0] ? ci : fi
    );
  }
  let k = $(n), w = k(n);
  return {
    c() {
      e = b("div"), w.c(), t = j(), i = b("div"), s = b("div"), a = G(
        /*showStat*/
        n[1]
      ), l = j(), r = b("div"), o = b("div"), o.textContent = "Spell DC", d = j(), u = b("div"), h = G(
        /*chosen_DC*/
        n[2]
      ), f = j(), _ = b("div"), c = b("div"), c.textContent = "Spell Bonus", y = j(), m = b("div"), p = G(
        /*chosen_BONUS*/
        n[3]
      ), g(i, "class", "spellDCContainer");
    },
    m(I, E) {
      B(I, e, E), w.m(e, null), v(e, t), v(e, i), v(i, s), v(s, a), v(i, l), v(i, r), v(r, o), v(r, d), v(r, u), v(u, h), v(i, f), v(i, _), v(_, c), v(_, y), v(_, m), v(m, p);
    },
    p(I, [E]) {
      k === (k = $(I)) && w ? w.p(I, E) : (w.d(1), w = k(I), w && (w.c(), w.m(e, t))), E & /*showStat*/
      2 && fe(
        a,
        /*showStat*/
        I[1]
      ), E & /*chosen_DC*/
      4 && fe(
        h,
        /*chosen_DC*/
        I[2]
      ), E & /*chosen_BONUS*/
      8 && fe(
        p,
        /*chosen_BONUS*/
        I[3]
      );
    },
    i: K,
    o: K,
    d(I) {
      I && A(e), w.d();
    }
  };
}
function gi(n, e, t) {
  let { sys: i } = e, { edit: s } = e, { data: a } = e;
  const l = ge.getNewKey();
  let r = a.data, o = i.getNodeNames("derived", "Spell Bonus");
  JSON.stringify(r) === JSON.stringify({}) && (r.showStat = o[0]);
  let d = r.showStat, u = i.getNode("derived", "Spell Bonus", d), h = i.getNode("derived", "Spell DC", d), f = u.getValue(), _ = h.getValue(), c;
  function y() {
    let w = c.value;
    t(1, d = w), u = i.getNode("derived", "Spell Bonus", d), h = i.getNode("derived", "Spell DC", d), t(2, f = u.getValue()), t(3, _ = h.getValue());
  }
  function m() {
    t(2, f = u.getValue()), t(3, _ = h.getValue());
  }
  function p() {
    u.addUpdateListener(name + "SpellInfoView" + l, () => {
      m();
    }), h.addUpdateListener(name + "SpellInfoView" + l, () => {
      m();
    });
  }
  Ie(() => {
    p();
  });
  function $() {
    u.removeUpdateListener(name + "SpellInfoView" + l), h.removeUpdateListener(name + "SpellInfoView" + l);
  }
  Ee(() => {
    $();
  });
  function k(w) {
    ie[w ? "unshift" : "push"](() => {
      c = w, t(4, c), t(5, o);
    });
  }
  return n.$$set = (w) => {
    "sys" in w && t(7, i = w.sys), "edit" in w && t(0, s = w.edit), "data" in w && t(8, a = w.data);
  }, [
    s,
    d,
    f,
    _,
    c,
    o,
    y,
    i,
    a,
    k
  ];
}
class an extends oe {
  constructor(e) {
    super(), le(this, e, gi, hi, ne, { sys: 7, edit: 0, data: 8 });
  }
  get sys() {
    return this.$$.ctx[7];
  }
  set sys(e) {
    this.$$set({ sys: e }), L();
  }
  get edit() {
    return this.$$.ctx[0];
  }
  set edit(e) {
    this.$$set({ edit: e }), L();
  }
  get data() {
    return this.$$.ctx[8];
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
      e = b("div"), t = b("div"), i = G(
        /*name*/
        n[0]
      ), s = j(), a = b("div"), l = b("input"), o = j(), d = b("div"), u = b("div"), h = G(
        /*modNodeValue*/
        n[3]
      ), g(t, "class", "statTitle"), g(l, "class", "BoxValue"), g(
        l,
        "data-editmode",
        /*editmode*/
        n[1]
      ), l.disabled = r = !/*editmode*/
      n[1], l.value = /*nodeValue*/
      n[2], g(l, "type", "number"), g(l, "min", "0"), g(l, "max", "100"), g(a, "class", "LargeValue"), g(u, "class", "BoxValue"), g(d, "class", "SmallValue"), g(e, "class", "StatValue");
    },
    m(c, y) {
      B(c, e, y), v(e, t), v(t, i), v(e, s), v(e, a), v(a, l), n[8](l), v(e, o), v(e, d), v(d, u), v(u, h), f || (_ = U(
        l,
        "change",
        /*onChange*/
        n[5]
      ), f = !0);
    },
    p(c, [y]) {
      y & /*name*/
      1 && fe(
        i,
        /*name*/
        c[0]
      ), y & /*editmode*/
      2 && g(
        l,
        "data-editmode",
        /*editmode*/
        c[1]
      ), y & /*editmode*/
      2 && r !== (r = !/*editmode*/
      c[1]) && (l.disabled = r), y & /*nodeValue*/
      4 && l.value !== /*nodeValue*/
      c[2] && (l.value = /*nodeValue*/
      c[2]), y & /*modNodeValue*/
      8 && fe(
        h,
        /*modNodeValue*/
        c[3]
      );
    },
    i: K,
    o: K,
    d(c) {
      c && A(e), n[8](null), f = !1, _();
    }
  };
}
function mi(n, e, t) {
  let { name: i } = e, { statNode: s } = e, { modNode: a } = e, { editmode: l = !1 } = e, r = s.getValue(), o = a.getValue();
  const d = ge.getNewKey();
  Ie(() => {
    s.addUpdateListener("onDerivedNodeUpdate" + d, u), a.addUpdateListener("onDerivedNodeUpdate" + d, u);
  }), Ee(() => {
    s.removeUpdateListener("onDerivedNodeUpdate" + d), a.removeUpdateListener("onDerivedNodeUpdate" + d);
  });
  function u() {
    t(2, r = s.getValue()), t(3, o = a.getValue());
  }
  function h() {
    let c = parseInt(f.value);
    s.setValue(c);
  }
  let f;
  function _(c) {
    ie[c ? "unshift" : "push"](() => {
      f = c, t(4, f);
    });
  }
  return n.$$set = (c) => {
    "name" in c && t(0, i = c.name), "statNode" in c && t(6, s = c.statNode), "modNode" in c && t(7, a = c.modNode), "editmode" in c && t(1, l = c.editmode);
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
    super(), le(this, e, mi, _i, ne, {
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
  i[3] = e[t];
  const s = (
    /*sys*/
    i[0].getNode(
      "fixed",
      "stats",
      /*key*/
      i[3]
    )
  );
  i[4] = s;
  const a = (
    /*sys*/
    i[0].getNode(
      "derived",
      "modifiers",
      /*key*/
      i[3]
    )
  );
  return i[5] = a, i;
}
function Dt(n) {
  let e, t;
  return e = new ln({
    props: {
      name: (
        /*key*/
        n[3]
      ),
      statNode: (
        /*node*/
        n[4]
      ),
      modNode: (
        /*modNode*/
        n[5]
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
      1 && (a.statNode = /*node*/
      i[4]), s & /*sys*/
      1 && (a.modNode = /*modNode*/
      i[5]), s & /*edit*/
      2 && (a.editmode = /*edit*/
      i[1]), e.$set(a);
    },
    i(i) {
      t || (R(e.$$.fragment, i), t = !0);
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
  let e, t, i = ee(
    /*stats*/
    n[2]
  ), s = [];
  for (let l = 0; l < i.length; l += 1)
    s[l] = Dt(wt(n, i, l));
  const a = (l) => H(s[l], 1, 1, () => {
    s[l] = null;
  });
  return {
    c() {
      e = b("div");
      for (let l = 0; l < s.length; l += 1)
        s[l].c();
      g(e, "class", "StatsRow");
    },
    m(l, r) {
      B(l, e, r);
      for (let o = 0; o < s.length; o += 1)
        s[o] && s[o].m(e, null);
      t = !0;
    },
    p(l, [r]) {
      if (r & /*stats, sys, edit*/
      7) {
        i = ee(
          /*stats*/
          l[2]
        );
        let o;
        for (o = 0; o < i.length; o += 1) {
          const d = wt(l, i, o);
          s[o] ? (s[o].p(d, r), R(s[o], 1)) : (s[o] = Dt(d), s[o].c(), R(s[o], 1), s[o].m(e, null));
        }
        for (de(), o = i.length; o < s.length; o += 1)
          a(o);
        ue();
      }
    },
    i(l) {
      if (!t) {
        for (let r = 0; r < i.length; r += 1)
          R(s[r]);
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
      l && A(e), He(s, l);
    }
  };
}
function vi(n, e, t) {
  let { sys: i } = e, { edit: s = !1 } = e, a = i.getNodeNames("fixed", "stats");
  return n.$$set = (l) => {
    "sys" in l && t(0, i = l.sys), "edit" in l && t(1, s = l.edit);
  }, [i, s, a];
}
class rn extends oe {
  constructor(e) {
    super(), le(this, e, vi, pi, ne, { sys: 0, edit: 1 });
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
}
re(rn, { sys: {}, edit: { type: "Boolean" } }, [], [], !0);
function It(n) {
  let e, t, i = (
    /*hasUp*/
    n[1] && kt(n)
  ), s = (
    /*hasDown*/
    n[2] && Mt(n)
  );
  return {
    c() {
      e = b("div"), i && i.c(), t = j(), s && s.c(), g(e, "class", "ItemManouverOptions");
    },
    m(a, l) {
      B(a, e, l), i && i.m(e, null), v(e, t), s && s.m(e, null);
    },
    p(a, l) {
      /*hasUp*/
      a[1] ? i ? i.p(a, l) : (i = kt(a), i.c(), i.m(e, t)) : i && (i.d(1), i = null), /*hasDown*/
      a[2] ? s ? s.p(a, l) : (s = Mt(a), s.c(), s.m(e, null)) : s && (s.d(1), s = null);
    },
    d(a) {
      a && A(e), i && i.d(), s && s.d();
    }
  };
}
function kt(n) {
  let e, t, i;
  return {
    c() {
      e = b("div"), e.textContent = "Up", g(e, "class", "ItemManouverOption"), g(e, "role", "none");
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
      s && A(e), t = !1, Y(i);
    }
  };
}
function Mt(n) {
  let e, t, i;
  return {
    c() {
      e = b("div"), e.textContent = "Down", g(e, "class", "ItemManouverOption"), g(e, "role", "none");
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
      s && A(e), t = !1, Y(i);
    }
  };
}
function bi(n) {
  let e, t = (
    /*editMode*/
    n[0] && It(n)
  );
  return {
    c() {
      e = b("div"), t && t.c(), g(e, "class", "ItemManouverContainer");
    },
    m(i, s) {
      B(i, e, s), t && t.m(e, null);
    },
    p(i, [s]) {
      /*editMode*/
      i[0] ? t ? t.p(i, s) : (t = It(i), t.c(), t.m(e, null)) : t && (t.d(1), t = null);
    },
    i: K,
    o: K,
    d(i) {
      i && A(e), t && t.d();
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
    super(), le(this, e, yi, bi, ne, {
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
    n[0]), e = new en({ props: a }), ie.push(() => Me(e, "data", s)), e.$on(
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
        l[0], ke(() => t = !1)), e.$set(o);
      },
      i(l) {
        i || (R(e.$$.fragment, l), i = !0);
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
    n[0]), e = new on({ props: a }), ie.push(() => Me(e, "data", s)), e.$on(
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
        l[0], ke(() => t = !1)), e.$set(o);
      },
      i(l) {
        i || (R(e.$$.fragment, l), i = !0);
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
  let e, t, i, s;
  return t = new rn({
    props: {
      edit: (
        /*editMode*/
        n[1]
      ),
      sys: (
        /*sys*/
        n[2]
      )
    }
  }), t.$on(
    "optionSelected",
    /*updateData*/
    n[6]
  ), {
    c() {
      e = b("div"), te(t.$$.fragment);
    },
    m(a, l) {
      B(a, e, l), W(t, e, null), s = !0;
    },
    p(a, l) {
      const r = {};
      l & /*editMode*/
      2 && (r.edit = /*editMode*/
      a[1]), l & /*sys*/
      4 && (r.sys = /*sys*/
      a[2]), t.$set(r);
    },
    i(a) {
      s || (R(t.$$.fragment, a), a && se(() => {
        s && (i || (i = z(e, ae, {}, !0)), i.run(1));
      }), s = !0);
    },
    o(a) {
      H(t.$$.fragment, a), a && (i || (i = z(e, ae, {}, !1)), i.run(0)), s = !1;
    },
    d(a) {
      a && A(e), Q(t), a && i && i.end();
    }
  };
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
    n[0]), t = new an({ props: r }), ie.push(() => Me(t, "data", l)), t.$on(
      "optionSelected",
      /*updateData*/
      n[6]
    ), {
      c() {
        e = b("div"), te(t.$$.fragment);
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
        o[0], ke(() => i = !1)), t.$set(u);
      },
      i(o) {
        a || (R(t.$$.fragment, o), o && se(() => {
          a && (s || (s = z(e, ae, {}, !0)), s.run(1));
        }), a = !0);
      },
      o(o) {
        H(t.$$.fragment, o), o && (s || (s = z(e, ae, {}, !1)), s.run(0)), a = !1;
      },
      d(o) {
        o && A(e), Q(t), o && s && s.end();
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
    n[0]), t = new sn({ props: r }), ie.push(() => Me(t, "data", l)), t.$on(
      "optionSelected",
      /*updateData*/
      n[6]
    ), {
      c() {
        e = b("div"), te(t.$$.fragment);
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
        o[0], ke(() => i = !1)), t.$set(u);
      },
      i(o) {
        a || (R(t.$$.fragment, o), o && se(() => {
          a && (s || (s = z(e, ae, {}, !0)), s.run(1));
        }), a = !0);
      },
      o(o) {
        H(t.$$.fragment, o), o && (s || (s = z(e, ae, {}, !1)), s.run(0)), a = !1;
      },
      d(o) {
        o && A(e), Q(t), o && s && s.end();
      }
    }
  );
}
function Ii(n) {
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
    n[0]), t = new tn({ props: r }), ie.push(() => Me(t, "data", l)), t.$on(
      "optionSelected",
      /*updateData*/
      n[6]
    ), {
      c() {
        e = b("div"), te(t.$$.fragment);
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
        o[0], ke(() => i = !1)), t.$set(u);
      },
      i(o) {
        a || (R(t.$$.fragment, o), o && se(() => {
          a && (s || (s = z(e, ae, {}, !0)), s.run(1));
        }), a = !0);
      },
      o(o) {
        H(t.$$.fragment, o), o && (s || (s = z(e, ae, {}, !1)), s.run(0)), a = !1;
      },
      d(o) {
        o && A(e), Q(t), o && s && s.end();
      }
    }
  );
}
function ki(n) {
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
    n[0]), t = new xt({ props: r }), ie.push(() => Me(t, "data", l)), t.$on(
      "optionSelected",
      /*updateData*/
      n[6]
    ), {
      c() {
        e = b("div"), te(t.$$.fragment);
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
        o[0], ke(() => i = !1)), t.$set(u);
      },
      i(o) {
        a || (R(t.$$.fragment, o), o && se(() => {
          a && (s || (s = z(e, ae, {}, !0)), s.run(1));
        }), a = !0);
      },
      o(o) {
        H(t.$$.fragment, o), o && (s || (s = z(e, ae, {}, !1)), s.run(0)), a = !1;
      },
      d(o) {
        o && A(e), Q(t), o && s && s.end();
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
    ki,
    Ii,
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
      e = b("div"), r && r.c(), t = j(), o && o.c(), i = j(), a && a.c(), g(e, "data-name", "ItemDestributor"), g(e, "class", "itemDestributer");
    },
    m(f, _) {
      B(f, e, _), r && r.m(e, null), v(e, t), o && o.m(e, null), v(e, i), ~s && u[s].m(e, null), l = !0;
    },
    p(f, [_]) {
      /*editMode*/
      f[1] ? r ? (r.p(f, _), _ & /*editMode*/
      2 && R(r, 1)) : (r = St(f), r.c(), R(r, 1), r.m(e, t)) : r && (de(), H(r, 1, 1, () => {
        r = null;
      }), ue()), /*length*/
      f[3] != 1 ? o ? (o.p(f, _), _ & /*length*/
      8 && R(o, 1)) : (o = Ct(f), o.c(), R(o, 1), o.m(e, i)) : o && (de(), H(o, 1, 1, () => {
        o = null;
      }), ue());
      let c = s;
      s = h(f), s === c ? ~s && u[s].p(f, _) : (a && (de(), H(u[c], 1, 1, () => {
        u[c] = null;
      }), ue()), ~s ? (a = u[s], a ? a.p(f, _) : (a = u[s] = d[s](f), a.c()), R(a, 1), a.m(e, null)) : a = null);
    },
    i(f) {
      l || (R(r), R(o), R(a), l = !0);
    },
    o(f) {
      H(r), H(o), H(a), l = !1;
    },
    d(f) {
      f && A(e), r && r.d(), o && o.d(), ~s && u[s].d();
    }
  };
}
function Si(n, e, t) {
  let { data: i } = e, { editMode: s } = e, { sys: a } = e, { length: l } = e, { index: r } = e, { layoutMode: o = !1 } = e;
  function d($) {
    console.log(i), t(0, i);
  }
  function u($) {
    i = $, t(0, i);
  }
  function h($) {
    i = $, t(0, i);
  }
  function f($) {
    pe.call(this, n, $);
  }
  function _($) {
    pe.call(this, n, $);
  }
  function c($) {
    i = $, t(0, i);
  }
  function y($) {
    i = $, t(0, i);
  }
  function m($) {
    i = $, t(0, i);
  }
  function p($) {
    i = $, t(0, i);
  }
  return n.$$set = ($) => {
    "data" in $ && t(0, i = $.data), "editMode" in $ && t(1, s = $.editMode), "sys" in $ && t(2, a = $.sys), "length" in $ && t(3, l = $.length), "index" in $ && t(4, r = $.index), "layoutMode" in $ && t(5, o = $.layoutMode);
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
    c,
    y,
    m,
    p
  ];
}
class dn extends oe {
  constructor(e) {
    super(), le(this, e, Si, Mi, ne, {
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
  return n.style.animation && (n.style = null), Zn(n, e, t ?? { duration: 500 });
}
function Ot(n) {
  let e, t, i, s, a = (
    /*onAdd*/
    n[4] && Nt(n)
  ), l = (
    /*onRemove*/
    n[3] && Lt(n)
  );
  return {
    c() {
      e = b("div"), a && a.c(), t = j(), l && l.c(), g(e, "class", "RowColumnOptions"), g(
        e,
        "style",
        /*cssStyle*/
        n[5]
      );
    },
    m(r, o) {
      B(r, e, o), a && a.m(e, null), v(e, t), l && l.m(e, null), s = !0;
    },
    p(r, o) {
      /*onAdd*/
      r[4] ? a ? a.p(r, o) : (a = Nt(r), a.c(), a.m(e, t)) : a && (a.d(1), a = null), /*onRemove*/
      r[3] ? l ? l.p(r, o) : (l = Lt(r), l.c(), l.m(e, null)) : l && (l.d(1), l = null);
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
      r && A(e), a && a.d(), l && l.d(), r && i && i.end();
    }
  };
}
function Nt(n) {
  let e, t, i, s;
  return {
    c() {
      e = b("div"), t = G(
        /*addText*/
        n[1]
      ), g(e, "class", "itemOption"), g(e, "role", "none");
    },
    m(a, l) {
      B(a, e, l), v(e, t), i || (s = [
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
      2 && fe(
        t,
        /*addText*/
        a[1]
      );
    },
    d(a) {
      a && A(e), i = !1, Y(s);
    }
  };
}
function Lt(n) {
  let e, t, i, s;
  return {
    c() {
      e = b("div"), t = G(
        /*remText*/
        n[2]
      ), g(e, "class", "itemOption rem"), g(e, "role", "none");
    },
    m(a, l) {
      B(a, e, l), v(e, t), i || (s = [
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
      4 && fe(
        t,
        /*remText*/
        a[2]
      );
    },
    d(a) {
      a && A(e), i = !1, Y(s);
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
      1 && R(t, 1)) : (t = Ot(i), t.c(), R(t, 1), t.m(e.parentNode, e)) : t && (de(), H(t, 1, 1, () => {
        t = null;
      }), ue());
    },
    i(i) {
      R(t);
    },
    o(i) {
      H(t);
    },
    d(i) {
      i && A(e), t && t.d(i);
    }
  };
}
function Oi(n, e, t) {
  let { active: i } = e, { addText: s = "Add Item" } = e, { remText: a = "Remove This Item" } = e, { offset: l = 0 } = e, { side: r = "left" } = e, { verti: o = "bottom" } = e, { onRemove: d = null } = e, { onAdd: u = null } = e, h = r + ":" + l + ";" + o + ":" + l + ";";
  function f(m) {
    pe.call(this, n, m);
  }
  function _(m) {
    pe.call(this, n, m);
  }
  const c = () => u(), y = () => d();
  return n.$$set = (m) => {
    "active" in m && t(0, i = m.active), "addText" in m && t(1, s = m.addText), "remText" in m && t(2, a = m.remText), "offset" in m && t(6, l = m.offset), "side" in m && t(7, r = m.side), "verti" in m && t(8, o = m.verti), "onRemove" in m && t(3, d = m.onRemove), "onAdd" in m && t(4, u = m.onAdd);
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
    c,
    y
  ];
}
class ve extends oe {
  constructor(e) {
    super(), le(this, e, Oi, Ci, ne, {
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
function Et(n, e, t) {
  const i = n.slice();
  return i[45] = e[t], i[47] = t, i;
}
function At(n, e, t) {
  const i = n.slice();
  return i[48] = e[t], i[50] = t, i;
}
function Rt(n, e, t) {
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
      t || (R(e.$$.fragment, s), t = !0);
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
      e = b("div"), Wt(e, "height", "50px");
    },
    m(t, i) {
      B(t, e, i);
    },
    d(t) {
      t && A(e);
    }
  };
}
function Tt(n, e) {
  let t, i, s, a, l, r, o, d, u, h = K, f, _, c;
  function y() {
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
      onRemove: y
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
  function m(...w) {
    return (
      /*dragstart_handler*/
      e[27](
        /*item*/
        e[51],
        ...w
      )
    );
  }
  function p(...w) {
    return (
      /*dragend_handler*/
      e[28](
        /*item*/
        e[51],
        ...w
      )
    );
  }
  function $(...w) {
    return (
      /*drop_handler*/
      e[29](
        /*item*/
        e[51],
        ...w
      )
    );
  }
  function k(...w) {
    return (
      /*dragleave_handler*/
      e[30](
        /*item*/
        e[51],
        ...w
      )
    );
  }
  return {
    key: n,
    first: null,
    c() {
      t = b("div"), te(i.$$.fragment), s = j(), te(a.$$.fragment), g(t, "class", "Item"), g(t, "data-edit", l = /*$editMode*/
      e[1] || /*$editLayout_03*/
      e[4] || /*$editLayout_02*/
      e[3]), g(t, "data-itemid", r = /*item*/
      e[51].id), g(
        t,
        "data-edit-active",
        /*$editLayout_03*/
        e[4]
      ), g(t, "data-dragging", o = /*DragItemHandler*/
      e[14].isBeingDragged(
        /*item*/
        e[51].id
      )), g(t, "role", "none"), g(
        t,
        "draggable",
        /*$editLayout_03*/
        e[4]
      ), this.first = t;
    },
    m(w, I) {
      B(w, t, I), W(i, t, null), v(t, s), W(a, t, null), f = !0, _ || (c = [
        U(t, "dragstart", m),
        U(t, "dragend", p),
        U(t, "drop", $),
        U(t, "dragleave", k),
        U(t, "dragover", Bi)
      ], _ = !0);
    },
    p(w, I) {
      e = w;
      const E = {};
      I[0] & /*$editLayout_03*/
      16 && (E.active = /*$editLayout_03*/
      e[4]), I[0] & /*$OBJ*/
      32 && (E.onRemove = y), i.$set(E);
      const P = {};
      I[0] & /*$OBJ*/
      32 && (P.data = /*item*/
      e[51]), I[0] & /*$editMode*/
      2 && (P.editMode = /*$editMode*/
      e[1]), I[0] & /*$editLayout_03*/
      16 && (P.layoutMode = /*$editLayout_03*/
      e[4]), I[0] & /*sys*/
      1 && (P.sys = /*sys*/
      e[0]), I[0] & /*$OBJ*/
      32 && (P.length = /*column*/
      e[48].data.length), I[0] & /*$OBJ*/
      32 && (P.index = /*k*/
      e[53]), a.$set(P), (!f || I[0] & /*$editMode, $editLayout_03, $editLayout_02*/
      26 && l !== (l = /*$editMode*/
      e[1] || /*$editLayout_03*/
      e[4] || /*$editLayout_02*/
      e[3])) && g(t, "data-edit", l), (!f || I[0] & /*$OBJ*/
      32 && r !== (r = /*item*/
      e[51].id)) && g(t, "data-itemid", r), (!f || I[0] & /*$editLayout_03*/
      16) && g(
        t,
        "data-edit-active",
        /*$editLayout_03*/
        e[4]
      ), (!f || I[0] & /*$OBJ*/
      32 && o !== (o = /*DragItemHandler*/
      e[14].isBeingDragged(
        /*item*/
        e[51].id
      ))) && g(t, "data-dragging", o), (!f || I[0] & /*$editLayout_03*/
      16) && g(
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
    i(w) {
      f || (R(i.$$.fragment, w), R(a.$$.fragment, w), w && se(() => {
        f && (d || (d = z(t, Te, { duration: he }, !0)), d.run(1));
      }), f = !0);
    },
    o(w) {
      H(i.$$.fragment, w), H(a.$$.fragment, w), w && (d || (d = z(t, Te, { duration: he }, !1)), d.run(0)), f = !1;
    },
    d(w) {
      w && A(t), Q(i), Q(a), w && d && d.end(), _ = !1, Y(c);
    }
  };
}
function Ut(n, e) {
  let t, i, s, a, l, r = [], o = /* @__PURE__ */ new Map(), d, u, h, f, _, c, y = K, m, p, $, k = (
    /*row*/
    e[45].data.length > 1 && Bt(e)
  );
  function w() {
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
      onAdd: w
    }
  });
  let I = (
    /*$editLayout_03*/
    (e[4] || /*$editLayout_02*/
    e[3]) && Vt()
  ), E = ee(
    /*column*/
    e[48].data
  );
  const P = (O) => (
    /*item*/
    O[51].id
  );
  for (let O = 0; O < E.length; O += 1) {
    let M = Rt(e, E, O), T = P(M);
    o.set(T, r[O] = Tt(T, M));
  }
  function J(...O) {
    return (
      /*dragstart_handler_1*/
      e[31](
        /*column*/
        e[48],
        ...O
      )
    );
  }
  function C(...O) {
    return (
      /*dragenter_handler*/
      e[32](
        /*column*/
        e[48],
        ...O
      )
    );
  }
  function D(...O) {
    return (
      /*dragend_handler_1*/
      e[33](
        /*column*/
        e[48],
        ...O
      )
    );
  }
  function F(...O) {
    return (
      /*drop_handler_1*/
      e[34](
        /*column*/
        e[48],
        ...O
      )
    );
  }
  function X(...O) {
    return (
      /*dragleave_handler_1*/
      e[35](
        /*column*/
        e[48],
        ...O
      )
    );
  }
  function Z(...O) {
    return (
      /*dragover_handler_1*/
      e[36](
        /*column*/
        e[48],
        ...O
      )
    );
  }
  return {
    key: n,
    first: null,
    c() {
      t = b("div"), k && k.c(), i = j(), te(s.$$.fragment), a = j(), I && I.c(), l = j();
      for (let O = 0; O < r.length; O += 1)
        r[O].c();
      g(t, "class", "Column"), g(t, "data-edit", d = /*$editLayout_02*/
      e[3] || /*$editLayout_01*/
      e[2]), g(
        t,
        "data-editpreview",
        /*$editLayout_03*/
        e[4]
      ), g(t, "data-itemid", u = /*column*/
      e[48].id), g(
        t,
        "data-edit-active",
        /*$editLayout_02*/
        e[3]
      ), g(t, "data-dragging", h = /*DragColumnHandler*/
      e[13].isBeingDragged(
        /*column*/
        e[48].id
      )), g(t, "role", "none"), g(t, "style", f = `
						${/*$editLayout_02*/
      e[3] || /*$editLayout_01*/
      e[2] ? "margin-bottom:30px" : ""}
					`), g(
        t,
        "draggable",
        /*$editLayout_02*/
        e[3]
      ), this.first = t;
    },
    m(O, M) {
      B(O, t, M), k && k.m(t, null), v(t, i), W(s, t, null), v(t, a), I && I.m(t, null), v(t, l);
      for (let T = 0; T < r.length; T += 1)
        r[T] && r[T].m(t, null);
      m = !0, p || ($ = [
        U(t, "dragstart", J),
        U(t, "dragenter", C),
        U(t, "dragend", D),
        U(t, "drop", F),
        U(t, "dragleave", X),
        U(t, "dragover", Z)
      ], p = !0);
    },
    p(O, M) {
      e = O, /*row*/
      e[45].data.length > 1 ? k ? (k.p(e, M), M[0] & /*$OBJ*/
      32 && R(k, 1)) : (k = Bt(e), k.c(), R(k, 1), k.m(t, i)) : k && (de(), H(k, 1, 1, () => {
        k = null;
      }), ue());
      const T = {};
      if (M[0] & /*$editLayout_03*/
      16 && (T.active = /*$editLayout_03*/
      e[4]), M[0] & /*$OBJ*/
      32 && (T.onAdd = w), s.$set(T), /*$editLayout_03*/
      e[4] || /*$editLayout_02*/
      e[3] ? I || (I = Vt(), I.c(), I.m(t, l)) : I && (I.d(1), I = null), M[0] & /*$editMode, $editLayout_03, $editLayout_02, $OBJ, DragItemHandler, sys, itemRequestMove, OBJ*/
      19515) {
        E = ee(
          /*column*/
          e[48].data
        ), de();
        for (let q = 0; q < r.length; q += 1) r[q].r();
        r = Fe(r, M, P, 1, e, E, o, t, it, Tt, null, Rt);
        for (let q = 0; q < r.length; q += 1) r[q].a();
        ue();
      }
      (!m || M[0] & /*$editLayout_02, $editLayout_01*/
      12 && d !== (d = /*$editLayout_02*/
      e[3] || /*$editLayout_01*/
      e[2])) && g(t, "data-edit", d), (!m || M[0] & /*$editLayout_03*/
      16) && g(
        t,
        "data-editpreview",
        /*$editLayout_03*/
        e[4]
      ), (!m || M[0] & /*$OBJ*/
      32 && u !== (u = /*column*/
      e[48].id)) && g(t, "data-itemid", u), (!m || M[0] & /*$editLayout_02*/
      8) && g(
        t,
        "data-edit-active",
        /*$editLayout_02*/
        e[3]
      ), (!m || M[0] & /*$OBJ*/
      32 && h !== (h = /*DragColumnHandler*/
      e[13].isBeingDragged(
        /*column*/
        e[48].id
      ))) && g(t, "data-dragging", h), (!m || M[0] & /*$editLayout_02, $editLayout_01*/
      12 && f !== (f = `
						${/*$editLayout_02*/
      e[3] || /*$editLayout_01*/
      e[2] ? "margin-bottom:30px" : ""}
					`)) && g(t, "style", f), (!m || M[0] & /*$editLayout_02*/
      8) && g(
        t,
        "draggable",
        /*$editLayout_02*/
        e[3]
      );
    },
    r() {
      c = t.getBoundingClientRect();
    },
    f() {
      et(t), y(), Ke(t, c);
    },
    a() {
      y(), y = xe(t, c, at, { duration: he });
    },
    i(O) {
      if (!m) {
        R(k), R(s.$$.fragment, O);
        for (let M = 0; M < E.length; M += 1)
          R(r[M]);
        O && se(() => {
          m && (_ || (_ = z(t, Te, { duration: he }, !0)), _.run(1));
        }), m = !0;
      }
    },
    o(O) {
      H(k), H(s.$$.fragment, O);
      for (let M = 0; M < r.length; M += 1)
        H(r[M]);
      O && (_ || (_ = z(t, Te, { duration: he }, !1)), _.run(0)), m = !1;
    },
    d(O) {
      O && A(t), k && k.d(), Q(s), I && I.d();
      for (let M = 0; M < r.length; M += 1)
        r[M].d();
      O && _ && _.end(), p = !1, Y($);
    }
  };
}
function Pt(n, e) {
  let t, i, s, a, l, r = [], o = /* @__PURE__ */ new Map(), d, u, h, f, _ = K, c, y, m;
  function p() {
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
      onAdd: p,
      addText: "add Column"
    }
  });
  function $() {
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
      onRemove: $,
      remText: "remove this line"
    }
  });
  let k = ee(
    /*row*/
    e[45].data
  );
  const w = (C) => (
    /*column*/
    C[48].id
  );
  for (let C = 0; C < k.length; C += 1) {
    let D = At(e, k, C), F = w(D);
    o.set(F, r[C] = Ut(F, D));
  }
  function I(...C) {
    return (
      /*dragstart_handler_2*/
      e[37](
        /*row*/
        e[45],
        ...C
      )
    );
  }
  function E(...C) {
    return (
      /*dragenter_handler_1*/
      e[38](
        /*row*/
        e[45],
        ...C
      )
    );
  }
  function P(...C) {
    return (
      /*dragend_handler_2*/
      e[39](
        /*row*/
        e[45],
        ...C
      )
    );
  }
  function J(...C) {
    return (
      /*dragover_handler_2*/
      e[40](
        /*row*/
        e[45],
        ...C
      )
    );
  }
  return {
    key: n,
    first: null,
    c() {
      t = b("div"), te(i.$$.fragment), s = j(), te(a.$$.fragment), l = j();
      for (let C = 0; C < r.length; C += 1)
        r[C].c();
      g(t, "class", "Row"), g(
        t,
        "data-edit",
        /*$editLayout_01*/
        e[2]
      ), g(
        t,
        "data-edit-active",
        /*$editLayout_01*/
        e[2]
      ), g(
        t,
        "data-editpreview",
        /*$editLayout_02*/
        e[3]
      ), g(t, "role", "none"), g(t, "style", d = `grid-template-columns:${jt(
        /*row*/
        e[45].data.length,
        "1fr"
      )}`), g(t, "data-rowid", u = /*row*/
      e[45].id), g(
        t,
        "draggable",
        /*$editLayout_01*/
        e[2]
      ), this.first = t;
    },
    m(C, D) {
      B(C, t, D), W(i, t, null), v(t, s), W(a, t, null), v(t, l);
      for (let F = 0; F < r.length; F += 1)
        r[F] && r[F].m(t, null);
      c = !0, y || (m = [
        U(t, "dragstart", I),
        U(t, "dragenter", E),
        U(t, "dragend", P),
        U(t, "dragover", J)
      ], y = !0);
    },
    p(C, D) {
      e = C;
      const F = {};
      D[0] & /*$editLayout_02*/
      8 && (F.active = /*$editLayout_02*/
      e[3]), D[0] & /*$OBJ*/
      32 && (F.onAdd = p), i.$set(F);
      const X = {};
      if (D[0] & /*$editLayout_01*/
      4 && (X.active = /*$editLayout_01*/
      e[2]), D[0] & /*$OBJ*/
      32 && (X.onRemove = $), a.$set(X), D[0] & /*$editLayout_02, $editLayout_01, $editLayout_03, $OBJ, DragColumnHandler, DragItemHandler, $editMode, sys, itemRequestMove, OBJ*/
      27711) {
        k = ee(
          /*row*/
          e[45].data
        ), de();
        for (let Z = 0; Z < r.length; Z += 1) r[Z].r();
        r = Fe(r, D, w, 1, e, k, o, t, it, Ut, null, At);
        for (let Z = 0; Z < r.length; Z += 1) r[Z].a();
        ue();
      }
      (!c || D[0] & /*$editLayout_01*/
      4) && g(
        t,
        "data-edit",
        /*$editLayout_01*/
        e[2]
      ), (!c || D[0] & /*$editLayout_01*/
      4) && g(
        t,
        "data-edit-active",
        /*$editLayout_01*/
        e[2]
      ), (!c || D[0] & /*$editLayout_02*/
      8) && g(
        t,
        "data-editpreview",
        /*$editLayout_02*/
        e[3]
      ), (!c || D[0] & /*$OBJ*/
      32 && d !== (d = `grid-template-columns:${jt(
        /*row*/
        e[45].data.length,
        "1fr"
      )}`)) && g(t, "style", d), (!c || D[0] & /*$OBJ*/
      32 && u !== (u = /*row*/
      e[45].id)) && g(t, "data-rowid", u), (!c || D[0] & /*$editLayout_01*/
      4) && g(
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
    i(C) {
      if (!c) {
        R(i.$$.fragment, C), R(a.$$.fragment, C);
        for (let D = 0; D < k.length; D += 1)
          R(r[D]);
        C && se(() => {
          c && (h || (h = z(t, ut, { duration: he, y: 100 }, !0)), h.run(1));
        }), c = !0;
      }
    },
    o(C) {
      H(i.$$.fragment, C), H(a.$$.fragment, C);
      for (let D = 0; D < r.length; D += 1)
        H(r[D]);
      C && (h || (h = z(t, ut, { duration: he, y: 100 }, !1)), h.run(0)), c = !1;
    },
    d(C) {
      C && A(t), Q(i), Q(a);
      for (let D = 0; D < r.length; D += 1)
        r[D].d();
      C && h && h.end(), y = !1, Y(m);
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
      e = b("div"), te(t.$$.fragment), g(e, "class", "Row"), Wt(e, "height", "100px");
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
      i || (R(t.$$.fragment, s), i = !0);
    },
    o(s) {
      H(t.$$.fragment, s), i = !1;
    },
    d(s) {
      s && A(e), Q(t);
    }
  };
}
function Ni(n) {
  let e, t, i, s, a, l = "Stop Edit	", r, o, d, u = "Layout Row	", h, f, _, c = "Layout Col	", y, m, p, $ = "Layout Items", k, w, I, E = [], P = /* @__PURE__ */ new Map(), J, C, D, F, X = ee(
    /*$OBJ*/
    n[5].data
  );
  const Z = (M) => (
    /*row*/
    M[45].id
  );
  for (let M = 0; M < X.length; M += 1) {
    let T = Et(n, X, M), q = Z(T);
    P.set(q, E[M] = Pt(q, T));
  }
  let O = (
    /*$editLayout_01*/
    n[2] && Ht(n)
  );
  return {
    c() {
      e = b("div"), t = b("div"), i = b("div"), s = b("div"), a = b("button"), r = G(l), o = j(), d = b("button"), h = G(u), f = j(), _ = b("button"), y = G(c), m = j(), p = b("button"), k = G($), I = j();
      for (let M = 0; M < E.length; M += 1)
        E[M].c();
      J = j(), O && O.c(), g(
        a,
        "data-active",
        /*$editMode*/
        n[1]
      ), g(
        d,
        "data-active",
        /*$editLayout_01*/
        n[2]
      ), g(
        _,
        "data-active",
        /*$editLayout_02*/
        n[3]
      ), g(
        p,
        "data-active",
        /*$editLayout_03*/
        n[4]
      ), g(s, "class", "SheetEditorMenu"), g(s, "data-isopen", w = /*$editMode*/
      n[1] || /*$editLayout_01*/
      n[2] || /*$editLayout_02*/
      n[3] || /*$editLayout_03*/
      n[4]), g(i, "class", "SheetEditorMenuContainer"), g(t, "class", "Sheet"), g(e, "class", "theme-light obsidianBody");
    },
    m(M, T) {
      B(M, e, T), v(e, t), v(t, i), v(i, s), v(s, a), v(a, r), v(s, o), v(s, d), v(d, h), v(s, f), v(s, _), v(_, y), v(s, m), v(s, p), v(p, k), v(t, I);
      for (let q = 0; q < E.length; q += 1)
        E[q] && E[q].m(t, null);
      v(t, J), O && O.m(t, null), C = !0, D || (F = [
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
          p,
          "click",
          /*click_handler_3*/
          n[19]
        )
      ], D = !0);
    },
    p(M, T) {
      if ((!C || T[0] & /*$editMode*/
      2) && g(
        a,
        "data-active",
        /*$editMode*/
        M[1]
      ), (!C || T[0] & /*$editLayout_01*/
      4) && g(
        d,
        "data-active",
        /*$editLayout_01*/
        M[2]
      ), (!C || T[0] & /*$editLayout_02*/
      8) && g(
        _,
        "data-active",
        /*$editLayout_02*/
        M[3]
      ), (!C || T[0] & /*$editLayout_03*/
      16) && g(
        p,
        "data-active",
        /*$editLayout_03*/
        M[4]
      ), (!C || T[0] & /*$editMode, $editLayout_01, $editLayout_02, $editLayout_03*/
      30 && w !== (w = /*$editMode*/
      M[1] || /*$editLayout_01*/
      M[2] || /*$editLayout_02*/
      M[3] || /*$editLayout_03*/
      M[4])) && g(s, "data-isopen", w), T[0] & /*$editLayout_01, $editLayout_02, $OBJ, DragRowHandler, $editLayout_03, DragColumnHandler, DragItemHandler, $editMode, sys, itemRequestMove, OBJ*/
      31807) {
        X = ee(
          /*$OBJ*/
          M[5].data
        ), de();
        for (let q = 0; q < E.length; q += 1) E[q].r();
        E = Fe(E, T, Z, 1, M, X, P, t, it, Pt, J, Et);
        for (let q = 0; q < E.length; q += 1) E[q].a();
        ue();
      }
      /*$editLayout_01*/
      M[2] ? O ? (O.p(M, T), T[0] & /*$editLayout_01*/
      4 && R(O, 1)) : (O = Ht(M), O.c(), R(O, 1), O.m(t, null)) : O && (de(), H(O, 1, 1, () => {
        O = null;
      }), ue());
    },
    i(M) {
      if (!C) {
        for (let T = 0; T < X.length; T += 1)
          R(E[T]);
        R(O), C = !0;
      }
    },
    o(M) {
      for (let T = 0; T < E.length; T += 1)
        H(E[T]);
      H(O), C = !1;
    },
    d(M) {
      M && A(e);
      for (let T = 0; T < E.length; T += 1)
        E[T].d();
      O && O.d(), D = !1, Y(F);
    }
  };
}
const Ue = 220, he = 100;
class Li {
  constructor(e, t) {
    N(this, "data");
    N(this, "state");
    N(this, "layerActive");
    N(this, "isDragging", !1);
    N(this, "pauseDragg", !1);
    N(this, "dragID");
    N(this, "targetID");
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
class Ei {
  constructor(e, t) {
    N(this, "data");
    N(this, "state");
    N(this, "layerActive");
    N(this, "isDragging", !1);
    N(this, "pauseDragg", !1);
    N(this, "dragTargetElement");
    N(this, "dragID");
    N(this, "targetID");
    N(this, "lastDragId");
    N(this, "lasttargId");
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
class Ai {
  constructor(e, t) {
    N(this, "data");
    N(this, "state");
    N(this, "layerActive");
    N(this, "isDragging", !1);
    N(this, "pauseDragg", !1);
    N(this, "dragTargetElement");
    N(this, "dragID");
    N(this, "targetID");
    N(this, "targetRowId");
    N(this, "lastDragId");
    N(this, "lasttargId");
    N(this, "lasttargRowId");
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
class Ri {
  constructor() {
    N(this, "editMode", Oe(!1));
    N(this, "editLayout_01", Oe(!1));
    N(this, "editLayout_02", Oe(!1));
    N(this, "editLayout_03", Oe(!1));
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
  let i, s, a, l, r, o = new Ri(), d = o.editMode;
  Se(n, d, (S) => t(1, i = S));
  let u = o.editLayout_01;
  Se(n, u, (S) => t(2, s = S));
  let h = o.editLayout_02;
  Se(n, h, (S) => t(3, a = S));
  let f = o.editLayout_03;
  Se(n, f, (S) => t(4, l = S));
  let { textData: _ } = e, { sys: c } = e, y = JSON.parse(_), m = new zn(y), p = Oe(m);
  Se(n, p, (S) => t(5, r = S));
  function $(S, V) {
    I.requestMoveItemUpDown(S, V);
  }
  Ie(() => {
  });
  let k = new Li(p, o), w = new Ei(p, o), I = new Ai(p, o);
  const E = () => d.set(!i), P = () => u.set(!x(u)), J = () => h.set(!x(h)), C = () => f.set(!x(f)), D = (S) => {
    S.addColumn(), p.update((V) => V);
  }, F = (S) => {
    p.update((V) => (V.remRow(S.id), V));
  }, X = (S, V) => {
    S.remColumn(V.id), p.update((qe) => qe);
  }, Z = (S) => {
    S.addItem(), p.update((V) => V);
  }, O = (S, V) => {
    S.remItem(V.id), p.update((qe) => qe);
  }, M = (S) => {
    $(-1, S.detail);
  }, T = (S) => {
    $(1, S.detail);
  }, q = (S, V) => {
    I.onDragStart(V, S.id);
  }, un = (S, V) => {
    I.onDragEnd(V, S.id);
  }, fn = (S, V) => {
    I.onDragEnd(V, S.id);
  }, cn = (S, V) => {
    I.onLeave(V, S.id);
  }, hn = (S, V) => {
    w.onDragStart(V, S.id);
  }, gn = (S, V) => {
    w.onDragOver(V, S.id), I.onDragOverColumn(V, S.id);
  }, _n = (S, V) => {
    w.onDragEnd(V, S.id);
  }, mn = (S, V) => {
    w.onDragEnd(V, S.id);
  }, pn = (S, V) => {
    w.onLeave(V, S.id);
  }, vn = (S, V) => {
    w.onDragOver(V, S.id), I.onDragOverColumn(V, S.id), V.preventDefault();
  }, bn = (S, V) => k.onDragStart(V, S.id), yn = (S, V) => k.onDragOver(V, S.id), $n = (S, V) => k.onDragEnd(V, S.id), wn = (S, V) => {
    k.onDragOver(V, S.id), V.preventDefault();
  }, Dn = () => {
    p.update((S) => (S.addRow(), S.data[r.data.length - 1].addColumn(), S));
  };
  return n.$$set = (S) => {
    "textData" in S && t(15, _ = S.textData), "sys" in S && t(0, c = S.sys);
  }, [
    c,
    i,
    s,
    a,
    l,
    r,
    d,
    u,
    h,
    f,
    p,
    $,
    k,
    w,
    I,
    _,
    E,
    P,
    J,
    C,
    D,
    F,
    X,
    Z,
    O,
    M,
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
    super(), le(this, e, Vi, Ni, ne, { textData: 15, sys: 0 }, null, [-1, -1]);
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
