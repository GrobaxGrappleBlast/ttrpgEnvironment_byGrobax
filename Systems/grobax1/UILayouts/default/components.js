var $n = Object.defineProperty;
var wn = (n, e, t) => e in n ? $n(n, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : n[e] = t;
var L = (n, e, t) => (wn(n, typeof e != "symbol" ? e + "" : e, t), t);
function K() {
}
const Qe = (n) => n;
function Ht(n) {
  return n();
}
function lt() {
  return /* @__PURE__ */ Object.create(null);
}
function Y(n) {
  n.forEach(Ht);
}
function Pe(n) {
  return typeof n == "function";
}
function te(n, e) {
  return n != n ? e == e : n !== e || n && typeof n == "object" || typeof n == "function";
}
function Dn(n) {
  return Object.keys(n).length === 0;
}
function jt(n, ...e) {
  if (n == null) {
    for (const i of e)
      i(void 0);
    return K;
  }
  const t = n.subscribe(...e);
  return t.unsubscribe ? () => t.unsubscribe() : t;
}
function ee(n) {
  let e;
  return jt(n, (t) => e = t)(), e;
}
function Se(n, e, t) {
  n.$$.on_destroy.push(jt(e, t));
}
function rt(n) {
  const e = typeof n == "string" && n.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
  return e ? [parseFloat(e[1]), e[2] || "px"] : [
    /** @type {number} */
    n,
    "px"
  ];
}
const Kt = typeof window < "u";
let Ft = Kt ? () => window.performance.now() : () => Date.now(), Xe = Kt ? (n) => requestAnimationFrame(n) : K;
const De = /* @__PURE__ */ new Set();
function qt(n) {
  De.forEach((e) => {
    e.c(n) || (De.delete(e), e.f());
  }), De.size !== 0 && Xe(qt);
}
function Jt(n) {
  let e;
  return De.size === 0 && Xe(qt), {
    promise: new Promise((t) => {
      De.add(e = { c: n, f: t });
    }),
    abort() {
      De.delete(e);
    }
  };
}
function b(n, e) {
  n.appendChild(e);
}
function zt(n) {
  if (!n)
    return document;
  const e = n.getRootNode ? n.getRootNode() : n.ownerDocument;
  return e && /** @type {ShadowRoot} */
  e.host ? (
    /** @type {ShadowRoot} */
    e
  ) : n.ownerDocument;
}
function kn(n) {
  const e = $("style");
  return e.textContent = "/* empty */", In(zt(n), e), e.sheet;
}
function In(n, e) {
  return b(
    /** @type {Document} */
    n.head || n,
    e
  ), e.sheet;
}
function B(n, e, t) {
  n.insertBefore(e, t || null);
}
function N(n) {
  n.parentNode && n.parentNode.removeChild(n);
}
function Ze(n, e) {
  for (let t = 0; t < n.length; t += 1)
    n[t] && n[t].d(e);
}
function $(n) {
  return document.createElement(n);
}
function G(n) {
  return document.createTextNode(n);
}
function j() {
  return G(" ");
}
function Sn() {
  return G("");
}
function U(n, e, t, i) {
  return n.addEventListener(e, t, i), () => n.removeEventListener(e, t, i);
}
function g(n, e, t) {
  t == null ? n.removeAttribute(e) : n.getAttribute(e) !== t && n.setAttribute(e, t);
}
function He(n) {
  return n === "" ? null : +n;
}
function Mn(n) {
  return Array.from(n.childNodes);
}
function de(n, e) {
  e = "" + e, n.data !== e && (n.data = /** @type {string} */
  e);
}
function Ie(n, e) {
  n.value = e ?? "";
}
function Yt(n, e, t, i) {
  t == null ? n.style.removeProperty(e) : n.style.setProperty(e, t, i ? "important" : "");
}
function Gt(n, e, { bubbles: t = !1, cancelable: i = !1 } = {}) {
  return new CustomEvent(n, { detail: e, bubbles: t, cancelable: i });
}
function On(n) {
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
function Cn(n) {
  let e = 5381, t = n.length;
  for (; t--; )
    e = (e << 5) - e ^ n.charCodeAt(t);
  return e >>> 0;
}
function Ln(n, e) {
  const t = { stylesheet: kn(e), rules: {} };
  return Be.set(n, t), t;
}
function Ye(n, e, t, i, s, a, l, r = 0) {
  const o = 16.666 / i;
  let d = `{
`;
  for (let p = 0; p <= 1; p += o) {
    const v = e + (t - e) * a(p);
    d += p * 100 + `%{${l(v, 1 - v)}}
`;
  }
  const u = d + `100% {${l(t, 1 - t)}}
}`, _ = `__svelte_${Cn(u)}_${r}`, f = zt(n), { stylesheet: h, rules: c } = Be.get(f) || Ln(f, n);
  c[_] || (c[_] = !0, h.insertRule(`@keyframes ${_} ${u}`, h.cssRules.length));
  const y = n.style.animation || "";
  return n.style.animation = `${y ? `${y}, ` : ""}${_} ${i}ms linear ${s}ms 1 both`, Ve += 1, _;
}
function Wt(n, e) {
  const t = (n.style.animation || "").split(", "), i = t.filter(
    e ? (a) => a.indexOf(e) < 0 : (a) => a.indexOf("__svelte") === -1
    // remove all Svelte animations
  ), s = t.length - i.length;
  s && (n.style.animation = i.join(", "), Ve -= s, Ve || En());
}
function En() {
  Xe(() => {
    Ve || (Be.forEach((n) => {
      const { ownerNode: e } = n.stylesheet;
      e && N(e);
    }), Be.clear());
  });
}
function xe(n, e, t, i) {
  if (!e)
    return K;
  const s = n.getBoundingClientRect();
  if (e.left === s.left && e.right === s.right && e.top === s.top && e.bottom === s.bottom)
    return K;
  const {
    delay: a = 0,
    duration: l = 300,
    easing: r = Qe,
    // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
    start: o = Ft() + a,
    // @ts-ignore todo:
    end: d = o + l,
    tick: u = K,
    css: _
  } = t(n, { from: e, to: s }, i);
  let f = !0, h = !1, c;
  function y() {
    _ && (c = Ye(n, 0, 1, l, a, r, _)), a || (h = !0);
  }
  function p() {
    _ && Wt(n, c), f = !1;
  }
  return Jt((v) => {
    if (!h && v >= o && (h = !0), h && v >= d && (u(1, 0), p()), !f)
      return !1;
    if (h) {
      const C = v - o, m = 0 + 1 * r(C / l);
      u(m, 1 - m);
    }
    return !0;
  }), y(), u(0, 1), p;
}
function et(n) {
  const e = getComputedStyle(n);
  if (e.position !== "absolute" && e.position !== "fixed") {
    const { width: t, height: i } = e, s = n.getBoundingClientRect();
    n.style.position = "absolute", n.style.width = t, n.style.height = i, je(n, s);
  }
}
function je(n, e) {
  const t = n.getBoundingClientRect();
  if (e.left !== t.left || e.top !== t.top) {
    const i = getComputedStyle(n), s = i.transform === "none" ? "" : i.transform;
    n.style.transform = `${s} translate(${e.left - t.left}px, ${e.top - t.top}px)`;
  }
}
let Le;
function Ce(n) {
  Le = n;
}
function tt() {
  if (!Le)
    throw new Error("Function called outside component initialization");
  return Le;
}
function Ee(n) {
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
      const a = Gt(
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
function me(n, e) {
  const t = n.$$.callbacks[e.type];
  t && t.slice().forEach((i) => i.call(this, e));
}
const we = [], ne = [];
let ke = [];
const Ge = [], An = /* @__PURE__ */ Promise.resolve();
let We = !1;
function Rn() {
  We || (We = !0, An.then(E));
}
function ie(n) {
  ke.push(n);
}
function ve(n) {
  Ge.push(n);
}
const qe = /* @__PURE__ */ new Set();
let be = 0;
function E() {
  if (be !== 0)
    return;
  const n = Le;
  do {
    try {
      for (; be < we.length; ) {
        const e = we[be];
        be++, Ce(e), Nn(e.$$);
      }
    } catch (e) {
      throw we.length = 0, be = 0, e;
    }
    for (Ce(null), we.length = 0, be = 0; ne.length; )
      ne.pop()();
    for (let e = 0; e < ke.length; e += 1) {
      const t = ke[e];
      qe.has(t) || (qe.add(t), t());
    }
    ke.length = 0;
  } while (we.length);
  for (; Ge.length; )
    Ge.pop()();
  We = !1, qe.clear(), Ce(n);
}
function Nn(n) {
  if (n.fragment !== null) {
    n.update(), Y(n.before_update);
    const e = n.dirty;
    n.dirty = [-1], n.fragment && n.fragment.p(n.ctx, e), n.after_update.forEach(ie);
  }
}
function Bn(n) {
  const e = [], t = [];
  ke.forEach((i) => n.indexOf(i) === -1 ? e.push(i) : t.push(i)), t.forEach((i) => i()), ke = e;
}
let Me;
function Vn() {
  return Me || (Me = Promise.resolve(), Me.then(() => {
    Me = null;
  })), Me;
}
function Je(n, e, t) {
  n.dispatchEvent(Gt(`${e ? "intro" : "outro"}${t}`));
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
function R(n, e) {
  n && n.i && (Re.delete(n), n.i(e));
}
function P(n, e, t, i) {
  if (n && n.o) {
    if (Re.has(n))
      return;
    Re.add(n), ce.c.push(() => {
      Re.delete(n), i && (t && n.d(1), i());
    }), n.o(e);
  } else
    i && i();
}
const Tn = { duration: 0 };
function z(n, e, t, i) {
  let a = e(n, t, { direction: "both" }), l = i ? 0 : 1, r = null, o = null, d = null, u;
  function _() {
    d && Wt(n, d);
  }
  function f(c, y) {
    const p = (
      /** @type {Program['d']} */
      c.b - l
    );
    return y *= Math.abs(p), {
      a: l,
      b: c.b,
      d: p,
      duration: y,
      start: c.start,
      end: c.start + y,
      group: c.group
    };
  }
  function h(c) {
    const {
      delay: y = 0,
      duration: p = 300,
      easing: v = Qe,
      tick: C = K,
      css: m
    } = a || Tn, S = {
      start: Ft() + y,
      b: c
    };
    c || (S.group = ce, ce.r += 1), "inert" in n && (c ? u !== void 0 && (n.inert = u) : (u = /** @type {HTMLElement} */
    n.inert, n.inert = !0)), r || o ? o = S : (m && (_(), d = Ye(n, l, c, p, y, v, m)), c && C(0, 1), r = f(S, p), ie(() => Je(n, c, "start")), Jt((D) => {
      if (o && D > o.start && (r = f(o, p), o = null, Je(n, r.b, "start"), m && (_(), d = Ye(
        n,
        l,
        r.b,
        r.duration,
        0,
        v,
        a.css
      ))), r) {
        if (D >= r.end)
          C(l = r.b, 1 - l), Je(n, r.b, "end"), o || (r.b ? _() : --r.group.r || Y(r.group.c)), r = null;
        else if (D >= r.start) {
          const A = D - r.start;
          l = r.a + r.d * v(A / r.duration), C(l, 1 - l);
        }
      }
      return !!(r || o);
    }));
  }
  return {
    run(c) {
      Pe(a) ? Vn().then(() => {
        a = a({ direction: c ? "in" : "out" }), h(c);
      }) : h(c);
    },
    end() {
      _(), r = o = null;
    }
  };
}
function se(n) {
  return (n == null ? void 0 : n.length) !== void 0 ? n : Array.from(n);
}
function Un(n, e) {
  n.d(1), e.delete(n.key);
}
function Pn(n, e) {
  P(n, 1, 1, () => {
    e.delete(n.key);
  });
}
function it(n, e) {
  n.f(), Pn(n, e);
}
function Ke(n, e, t, i, s, a, l, r, o, d, u, _) {
  let f = n.length, h = a.length, c = f;
  const y = {};
  for (; c--; )
    y[n[c].key] = c;
  const p = [], v = /* @__PURE__ */ new Map(), C = /* @__PURE__ */ new Map(), m = [];
  for (c = h; c--; ) {
    const H = _(s, a, c), J = t(H);
    let M = l.get(J);
    M ? i && m.push(() => M.p(H, e)) : (M = d(J, H), M.c()), v.set(J, p[c] = M), J in y && C.set(J, Math.abs(c - y[J]));
  }
  const S = /* @__PURE__ */ new Set(), D = /* @__PURE__ */ new Set();
  function A(H) {
    R(H, 1), H.m(r, u), l.set(H.key, H), u = H.first, h--;
  }
  for (; f && h; ) {
    const H = p[h - 1], J = n[f - 1], M = H.key, w = J.key;
    H === J ? (u = H.first, f--, h--) : v.has(w) ? !l.has(M) || S.has(M) ? A(H) : D.has(w) ? f-- : C.get(M) > C.get(w) ? (D.add(M), A(H)) : (S.add(w), f--) : (o(J, l), f--);
  }
  for (; f--; ) {
    const H = n[f];
    v.has(H.key) || o(H, l);
  }
  for (; h; )
    A(p[h - 1]);
  return Y(m), p;
}
function ye(n, e, t) {
  const i = n.$$.props[e];
  i !== void 0 && (n.$$.bound[i] = t, t(n.$$.ctx[i]));
}
function X(n) {
  n && n.c();
}
function W(n, e, t) {
  const { fragment: i, after_update: s } = n.$$;
  i && i.m(e, t), ie(() => {
    const a = n.$$.on_mount.map(Ht).filter(Pe);
    n.$$.on_destroy ? n.$$.on_destroy.push(...a) : Y(a), n.$$.on_mount = [];
  }), s.forEach(ie);
}
function Q(n, e) {
  const t = n.$$;
  t.fragment !== null && (Bn(t.after_update), Y(t.on_destroy), t.fragment && t.fragment.d(e), t.on_destroy = t.fragment = null, t.ctx = []);
}
function Hn(n, e) {
  n.$$.dirty[0] === -1 && (we.push(n), Rn(), n.$$.dirty.fill(0)), n.$$.dirty[e / 31 | 0] |= 1 << e % 31;
}
function le(n, e, t, i, s, a, l = null, r = [-1]) {
  const o = Le;
  Ce(n);
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
  if (d.ctx = t ? t(n, e.props || {}, (_, f, ...h) => {
    const c = h.length ? h[0] : f;
    return d.ctx && s(d.ctx[_], d.ctx[_] = c) && (!d.skip_bound && d.bound[_] && d.bound[_](c), u && Hn(n, _)), f;
  }) : [], d.update(), u = !0, Y(d.before_update), d.fragment = i ? i(d.ctx) : !1, e.target) {
    if (e.hydrate) {
      const _ = Mn(e.target);
      d.fragment && d.fragment.l(_), _.forEach(N);
    } else
      d.fragment && d.fragment.c();
    e.intro && R(n.$$.fragment), W(n, e.target, e.anchor), E();
  }
  Ce(o);
}
let Qt;
typeof HTMLElement == "function" && (Qt = class extends HTMLElement {
  constructor(e, t, i) {
    super();
    /** The Svelte component constructor */
    L(this, "$$ctor");
    /** Slots */
    L(this, "$$s");
    /** The Svelte component instance */
    L(this, "$$c");
    /** Whether or not the custom element is connected */
    L(this, "$$cn", !1);
    /** Component props data */
    L(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    L(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    L(this, "$$p_d", {});
    /** @type {Record<string, Function[]>} Event listeners */
    L(this, "$$l", {});
    /** @type {Map<Function, Function>} Event listener unsubscribe functions */
    L(this, "$$l_u", /* @__PURE__ */ new Map());
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
              l = $("slot"), a !== "default" && g(l, "name", a);
            },
            /**
             * @param {HTMLElement} target
             * @param {HTMLElement} [anchor]
             */
            m: function(d, u) {
              B(d, l, u);
            },
            d: function(d) {
              d && N(l);
            }
          };
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const t = {}, i = On(this);
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
  let l = class extends Qt {
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
  }), a && (l = a(l)), n.element = /** @type {any} */
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
    L(this, "$$");
    /**
     * ### PRIVATE API
     *
     * Do not use, may change at any time
     *
     * @type {any}
     */
    L(this, "$$set");
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
    this.$$set && !Dn(e) && (this.$$.skip_bound = !0, this.$$set(e), this.$$.skip_bound = !1);
  }
}
const jn = "4";
typeof window < "u" && (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(jn);
class Kn {
  constructor() {
    L(this, "keyCounter", 0);
  }
  getNewKey() {
    return (this.keyCounter++).toString(16);
  }
}
var ge = new Kn();
class ze {
  constructor(e = "NONE", t = "{}") {
    L(this, "id");
    L(this, "type");
    L(this, "data");
    this.id = ge.getNewKey(), this.type = e, this.data = JSON.parse(t);
  }
}
class ot {
  constructor(e = []) {
    L(this, "id");
    L(this, "data", []);
    this.id = ge.getNewKey(), this.data = [], e.forEach((t) => {
      t != null && t.data && t.type ? this.data.push(new ze(t.type, t.data)) : this.data.push(new ze());
    });
  }
  addItem() {
    this.data.push(new ze());
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
    L(this, "id");
    L(this, "data", []);
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
class Fn {
  constructor(e) {
    L(this, "id");
    L(this, "data", []);
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
const $e = [];
function Oe(n, e = K) {
  let t;
  const i = /* @__PURE__ */ new Set();
  function s(r) {
    if (te(n, r) && (n = r, t)) {
      const o = !$e.length;
      for (const d of i)
        d[1](), $e.push(d, n);
      if (o) {
        for (let d = 0; d < $e.length; d += 2)
          $e[d][0]($e[d + 1]);
        $e.length = 0;
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
function Te(n, { delay: e = 0, duration: t = 400, easing: i = Qe } = {}) {
  const s = +getComputedStyle(n).opacity;
  return {
    delay: e,
    duration: t,
    easing: i,
    css: (a) => `opacity: ${a * s}`
  };
}
function ut(n, { delay: e = 0, duration: t = 400, easing: i = st, x: s = 0, y: a = 0, opacity: l = 0 } = {}) {
  const r = getComputedStyle(n), o = +r.opacity, d = r.transform === "none" ? "" : r.transform, u = o * (1 - l), [_, f] = rt(s), [h, c] = rt(a);
  return {
    delay: e,
    duration: t,
    easing: i,
    css: (y, p) => `
			transform: ${d} translate(${(1 - y) * _}${f}, ${(1 - y) * h}${c});
			opacity: ${o - u * p}`
  };
}
function ae(n, { delay: e = 0, duration: t = 400, easing: i = st, axis: s = "y" } = {}) {
  const a = getComputedStyle(n), l = +a.opacity, r = s === "y" ? "height" : "width", o = parseFloat(a[r]), d = s === "y" ? ["top", "bottom"] : ["left", "right"], u = d.map(
    (v) => `${v[0].toUpperCase()}${v.slice(1)}`
  ), _ = parseFloat(a[`padding${u[0]}`]), f = parseFloat(a[`padding${u[1]}`]), h = parseFloat(a[`margin${u[0]}`]), c = parseFloat(a[`margin${u[1]}`]), y = parseFloat(
    a[`border${u[0]}Width`]
  ), p = parseFloat(
    a[`border${u[1]}Width`]
  );
  return {
    delay: e,
    duration: t,
    easing: i,
    css: (v) => `overflow: hidden;opacity: ${Math.min(v * 20, 1) * l};${r}: ${v * o}px;padding-${d[0]}: ${v * _}px;padding-${d[1]}: ${v * f}px;margin-${d[0]}: ${v * h}px;margin-${d[1]}: ${v * c}px;border-${d[0]}-width: ${v * y}px;border-${d[1]}-width: ${v * p}px;`
  };
}
function qn(n, { from: e, to: t }, i = {}) {
  const s = getComputedStyle(n), a = s.transform === "none" ? "" : s.transform, [l, r] = s.transformOrigin.split(" ").map(parseFloat), o = e.left + e.width * l / t.width - (t.left + l), d = e.top + e.height * r / t.height - (t.top + r), { delay: u = 0, duration: _ = (h) => Math.sqrt(h) * 120, easing: f = st } = i;
  return {
    delay: u,
    duration: Pe(_) ? _(Math.sqrt(o * o + d * d)) : _,
    easing: f,
    css: (h, c) => {
      const y = c * o, p = c * d, v = h + c * e.width / t.width, C = h + c * e.height / t.height;
      return `transform: ${a} translate(${y}px, ${p}px) scale(${v}, ${C});`;
    }
  };
}
var _e = /* @__PURE__ */ ((n) => (n.HitPoints = "HitPoints", n.ProficiencyBonus = "ProficiencyBonus", n.SkillProficiencies = "SkillProficiencies", n.SpellInfo = "SpellInfo", n.Stats = "Stats", n))(_e || {});
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
      e = $("div"), i = G(t), g(e, "class", "GrobSelectLabel effect"), g(e, "data-isdisabled", s = /*disabled*/
      n[3] ?? !1), g(e, "data-iserror", a = /*isError*/
      n[4] ?? !1), g(e, "data-selected", l = /*selected*/
      n[0] ?? !1), g(e, "tabindex", "-1");
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
      d[3] ?? !1) && g(e, "data-isdisabled", s), u & /*isError*/
      16 && a !== (a = /*isError*/
      d[4] ?? !1) && g(e, "data-iserror", a), u & /*selected*/
      1 && l !== (l = /*selected*/
      d[0] ?? !1) && g(e, "data-selected", l);
    },
    d(d) {
      d && N(e), n[17](null), r = !1, Y(o);
    }
  };
}
function ht(n) {
  let e, t, i, s, a, l = [], r = /* @__PURE__ */ new Map(), o, d, u, _, f, h, c = se(
    /*options*/
    n[1]
  );
  const y = (v) => (
    /*opt*/
    v[23]
  );
  for (let v = 0; v < c.length; v += 1) {
    let C = ft(n, c, v), m = y(C);
    r.set(m, l[v] = gt(m, C));
  }
  let p = (
    /*options*/
    n[1].length == 0 && _t()
  );
  return {
    c() {
      var v, C, m, S;
      e = $("div"), t = $("div"), i = $("div"), a = j();
      for (let D = 0; D < l.length; D += 1)
        l[D].c();
      o = j(), p && p.c(), d = j(), u = $("div"), g(i, "class", "Arrow"), g(i, "style", s = `left:${/*arrowOffsetLeft*/
      n[12]}px`), g(t, "class", "ArrowContainer "), g(u, "class", "selectEndTracker"), g(e, "class", "SelectPopUp"), g(e, "style", _ = "width:" + /*labelRect*/
      (((v = n[7]) == null ? void 0 : v.width) ?? 100) + "px;left: " + /*labelRect*/
      (((C = n[7]) == null ? void 0 : C.x) ?? 0) + "px;top: " + /*labelRect*/
      ((((m = n[7]) == null ? void 0 : m.y) ?? 0) + /*labelRect*/
      (((S = n[7]) == null ? void 0 : S.height) ?? 0) + 8) + "px;max-height:" + /*override_maxHeight*/
      n[11] + "px");
    },
    m(v, C) {
      B(v, e, C), b(e, t), b(t, i), n[18](t), b(e, a);
      for (let m = 0; m < l.length; m += 1)
        l[m] && l[m].m(e, null);
      b(e, o), p && p.m(e, null), b(e, d), b(e, u), n[19](u), h = !0;
    },
    p(v, C) {
      var m, S, D, A;
      (!h || C & /*arrowOffsetLeft*/
      4096 && s !== (s = `left:${/*arrowOffsetLeft*/
      v[12]}px`)) && g(i, "style", s), C & /*selected, options, clickOption*/
      32771 && (c = se(
        /*options*/
        v[1]
      ), l = Ke(l, C, y, 1, v, c, r, e, Un, gt, o, ft)), /*options*/
      v[1].length == 0 ? p || (p = _t(), p.c(), p.m(e, d)) : p && (p.d(1), p = null), (!h || C & /*labelRect, override_maxHeight*/
      2176 && _ !== (_ = "width:" + /*labelRect*/
      (((m = v[7]) == null ? void 0 : m.width) ?? 100) + "px;left: " + /*labelRect*/
      (((S = v[7]) == null ? void 0 : S.x) ?? 0) + "px;top: " + /*labelRect*/
      ((((D = v[7]) == null ? void 0 : D.y) ?? 0) + /*labelRect*/
      (((A = v[7]) == null ? void 0 : A.height) ?? 0) + 8) + "px;max-height:" + /*override_maxHeight*/
      v[11] + "px")) && g(e, "style", _);
    },
    i(v) {
      h || (v && ie(() => {
        h && (f || (f = z(e, ae, {}, !0)), f.run(1));
      }), h = !0);
    },
    o(v) {
      v && (f || (f = z(e, ae, {}, !1)), f.run(0)), h = !1;
    },
    d(v) {
      v && N(e), n[18](null);
      for (let C = 0; C < l.length; C += 1)
        l[C].d();
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
      t = $("div"), s = G(i), g(t, "class", "GrobSelectOption"), g(t, "data-selected", a = /*selected*/
      e[0] == /*opt*/
      e[23]), g(t, "data-value", l = /*opt*/
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
      e[23]) && g(t, "data-selected", a), u & /*options*/
      2 && l !== (l = /*opt*/
      e[23]) && g(t, "data-value", l);
    },
    d(d) {
      d && N(t), r = !1, Y(o);
    }
  };
}
function _t(n) {
  let e;
  return {
    c() {
      e = $("i"), e.textContent = "No Options", g(e, "class", "GrobSelectInfo");
    },
    m(t, i) {
      B(t, e, i);
    },
    d(t) {
      t && N(e);
    }
  };
}
function Jn(n) {
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
      e = $("div"), a.c(), i = j(), s = $("div"), l && l.c(), g(e, "class", "GrobSelect");
    },
    m(r, o) {
      B(r, e, o), a.m(e, null), b(e, i), b(e, s), l && l.m(s, null);
    },
    p(r, [o]) {
      o & /*selected*/
      1 && te(t, t = /*selected*/
      r[0]) ? (a.d(1), a = ct(r), a.c(), a.m(e, i)) : a.p(r, o), /*isFocussed*/
      r[8] || /*forceOpen*/
      r[5] ? l ? (l.p(r, o), o & /*isFocussed, forceOpen*/
      288 && R(l, 1)) : (l = ht(r), l.c(), R(l, 1), l.m(s, null)) : l && (ue(), P(l, 1, 1, () => {
        l = null;
      }), fe());
    },
    i(r) {
      R(l);
    },
    o(r) {
      P(l);
    },
    d(r) {
      r && N(e), a.d(r), l && l.d();
    }
  };
}
const zn = 100;
function Yn(n, e, t) {
  let i = nt(), { options: s } = e, { selected: a = null } = e, { unSelectedplaceholder: l = "None Selected" } = e, { disabled: r = !1 } = e, { isError: o = !1 } = e, { forceOpen: d = !1 } = e, { maxHeight: u = 500 } = e, _, f, h = !1, c, y, p = u, v = 0;
  function C() {
    const w = _.getBoundingClientRect();
    t(7, f = w), t(8, h = !0), A(), setTimeout(D, zn);
  }
  function m() {
    setTimeout(
      () => {
        t(8, h = !1);
      },
      200
    );
  }
  function S(w) {
    let F = w.target.getAttribute("data-value");
    a == F ? (t(0, a = null), i("onDeselect")) : (t(0, a = F), i("onSelect", a));
  }
  function D() {
    let w = y.getBoundingClientRect().bottom, F = c.getBoundingClientRect().bottom, Z = window.document.body.getBoundingClientRect().height;
    if (F > Z) {
      let x = F - Z, k = F - w - x;
      k < p && t(11, p = k);
    }
  }
  function A() {
    let w = _.getBoundingClientRect().width;
    t(12, v = w / 2);
  }
  function H(w) {
    ne[w ? "unshift" : "push"](() => {
      _ = w, t(6, _);
    });
  }
  function J(w) {
    ne[w ? "unshift" : "push"](() => {
      y = w, t(10, y);
    });
  }
  function M(w) {
    ne[w ? "unshift" : "push"](() => {
      c = w, t(9, c);
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
    _,
    f,
    h,
    c,
    y,
    p,
    v,
    C,
    m,
    S,
    u,
    H,
    J,
    M
  ];
}
class Xt extends oe {
  constructor(e) {
    super(), le(this, e, Yn, Jn, te, {
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
    this.$$set({ options: e }), E();
  }
  get selected() {
    return this.$$.ctx[0];
  }
  set selected(e) {
    this.$$set({ selected: e }), E();
  }
  get unSelectedplaceholder() {
    return this.$$.ctx[2];
  }
  set unSelectedplaceholder(e) {
    this.$$set({ unSelectedplaceholder: e }), E();
  }
  get disabled() {
    return this.$$.ctx[3];
  }
  set disabled(e) {
    this.$$set({ disabled: e }), E();
  }
  get isError() {
    return this.$$.ctx[4];
  }
  set isError(e) {
    this.$$set({ isError: e }), E();
  }
  get forceOpen() {
    return this.$$.ctx[5];
  }
  set forceOpen(e) {
    this.$$set({ forceOpen: e }), E();
  }
  get maxHeight() {
    return this.$$.ctx[16];
  }
  set maxHeight(e) {
    this.$$set({ maxHeight: e }), E();
  }
}
re(Xt, { options: {}, selected: {}, unSelectedplaceholder: {}, disabled: { type: "Boolean" }, isError: { type: "Boolean" }, forceOpen: { type: "Boolean" }, maxHeight: {} }, [], [], !0);
function Gn(n) {
  let e, t, i, s, a;
  return s = new Xt({
    props: {
      options: (
        /*options*/
        n[1]
      ),
      selected: (
        /*selected*/
        n[2]
      ),
      unSelectedplaceholder: !/*data*/
      n[0].type || /*data*/
      n[0].type == "NONE" ? "Select View Type" : "Select a new Type "
    }
  }), s.$on(
    "onSelect",
    /*selectOption*/
    n[3]
  ), {
    c() {
      e = $("div"), t = $("div"), i = $("div"), X(s.$$.fragment), g(i, "class", "ItemOptionBtn "), g(t, "class", "ItemOptions"), g(e, "class", "ItemOptionsContainer");
    },
    m(l, r) {
      B(l, e, r), b(e, t), b(t, i), W(s, i, null), a = !0;
    },
    p(l, [r]) {
      const o = {};
      r & /*data*/
      1 && (o.unSelectedplaceholder = !/*data*/
      l[0].type || /*data*/
      l[0].type == "NONE" ? "Select View Type" : "Select a new Type "), s.$set(o);
    },
    i(l) {
      a || (R(s.$$.fragment, l), a = !0);
    },
    o(l) {
      P(s.$$.fragment, l), a = !1;
    },
    d(l) {
      l && N(e), Q(s);
    }
  };
}
function Wn(n, e, t) {
  let i = nt(), { data: s } = e, { editMode: a } = e, l = Object.keys(_e), r = s.type;
  function o(d) {
    let u = d.detail;
    t(0, s.type = u, s), i("optionSelected"), console.log("optionSelected" + u);
  }
  return n.$$set = (d) => {
    "data" in d && t(0, s = d.data), "editMode" in d && t(4, a = d.editMode);
  }, [s, l, r, o, a];
}
class Zt extends oe {
  constructor(e) {
    super(), le(this, e, Wn, Gn, te, { data: 0, editMode: 4 });
  }
  get data() {
    return this.$$.ctx[0];
  }
  set data(e) {
    this.$$set({ data: e }), E();
  }
  get editMode() {
    return this.$$.ctx[4];
  }
  set editMode(e) {
    this.$$set({ editMode: e }), E();
  }
}
re(Zt, { data: {}, editMode: {} }, [], [], !0);
function Qn(n) {
  let e, t, i;
  return {
    c() {
      e = $("div"), e.textContent = "Hit Point Maximum", t = j(), i = $("input"), g(i, "type", "number");
    },
    m(s, a) {
      B(s, e, a), B(s, t, a), B(s, i, a);
    },
    d(s) {
      s && (N(e), N(t), N(i));
    }
  };
}
function Xn(n) {
  let e, t, i;
  return {
    c() {
      e = $("div"), e.textContent = "Hit Point Maximum", t = j(), i = $("input"), g(i, "type", "number");
    },
    m(s, a) {
      B(s, e, a), B(s, t, a), B(s, i, a);
    },
    d(s) {
      s && (N(e), N(t), N(i));
    }
  };
}
function Zn(n) {
  let e, t, i;
  return {
    c() {
      e = $("div"), e.textContent = "Hit Point Maximum", t = j(), i = $("input"), g(i, "type", "number");
    },
    m(s, a) {
      B(s, e, a), B(s, t, a), B(s, i, a);
    },
    d(s) {
      s && (N(e), N(t), N(i));
    }
  };
}
function xn(n) {
  let e, t, i, s, a, l, r, o, d, u, _, f;
  function h(p, v) {
    return (
      /*editMode*/
      p[0] ? Zn : (
        /*playMode*/
        p[1] ? Xn : Qn
      )
    );
  }
  let c = h(n), y = c(n);
  return {
    c() {
      e = $("div"), t = $("div"), t.textContent = "Hit Points", i = j(), s = $("input"), l = j(), r = $("div"), r.textContent = "temporary Hit Points", o = j(), d = $("input"), u = j(), y.c(), g(s, "type", "number"), s.disabled = a = !/*editMode*/
      n[0], g(d, "type", "number");
    },
    m(p, v) {
      B(p, e, v), b(e, t), b(e, i), b(e, s), Ie(
        s,
        /*v*/
        n[2]
      ), b(e, l), b(e, r), b(e, o), b(e, d), b(e, u), y.m(e, null), _ || (f = [
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
      ], _ = !0);
    },
    p(p, [v]) {
      v & /*editMode*/
      1 && a !== (a = !/*editMode*/
      p[0]) && (s.disabled = a), v & /*v*/
      4 && He(s.value) !== /*v*/
      p[2] && Ie(
        s,
        /*v*/
        p[2]
      ), c !== (c = h(p)) && (y.d(1), y = c(p), y && (y.c(), y.m(e, null)));
    },
    i: K,
    o: K,
    d(p) {
      p && N(e), y.d(), _ = !1, Y(f);
    }
  };
}
function ei(n, e, t) {
  let { sys: i } = e, { editMode: s } = e, { playMode: a } = e, { data: l } = e, r = i.fixed.generic["Hit Points"], o = r.getValue();
  const d = ge.getNewKey();
  Ee(() => {
    r.addUpdateListener(name + d + "SvelteView", () => {
      t(2, o = r.getValue());
    });
  }), Ae(() => {
    r.removeUpdateListener(name + d + "SvelteView");
  });
  function u() {
    return r.setValue(o), null;
  }
  function _() {
    o = He(this.value), t(2, o);
  }
  return n.$$set = (f) => {
    "sys" in f && t(4, i = f.sys), "editMode" in f && t(0, s = f.editMode), "playMode" in f && t(1, a = f.playMode), "data" in f && t(5, l = f.data);
  }, [s, a, o, u, i, l, _];
}
class xt extends oe {
  constructor(e) {
    super(), le(this, e, ei, xn, te, {
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
    this.$$set({ sys: e }), E();
  }
  get editMode() {
    return this.$$.ctx[0];
  }
  set editMode(e) {
    this.$$set({ editMode: e }), E();
  }
  get playMode() {
    return this.$$.ctx[1];
  }
  set playMode(e) {
    this.$$set({ playMode: e }), E();
  }
  get data() {
    return this.$$.ctx[5];
  }
  set data(e) {
    this.$$set({ data: e }), E();
  }
}
re(xt, { sys: {}, editMode: {}, playMode: {}, data: {} }, [], [], !0);
function ti(n) {
  let e, t, i, s, a, l, r;
  return {
    c() {
      e = $("div"), t = $("div"), t.textContent = "Proficiency Bonus", i = j(), s = $("input"), g(s, "type", "number"), s.disabled = a = !/*editMode*/
      n[0], g(e, "class", "ProficiencyBonus");
    },
    m(o, d) {
      B(o, e, d), b(e, t), b(e, i), b(e, s), Ie(
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
      2 && He(s.value) !== /*v*/
      o[1] && Ie(
        s,
        /*v*/
        o[1]
      );
    },
    i: K,
    o: K,
    d(o) {
      o && N(e), l = !1, Y(r);
    }
  };
}
function ni(n, e, t) {
  let { sys: i } = e, { editMode: s } = e, { data: a } = e, l = i.fixed.generic["Proficiency Bonus"], r = l.getValue();
  const o = ge.getNewKey();
  Ee(() => {
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
    r = He(this.value), t(1, r);
  }
  return n.$$set = (_) => {
    "sys" in _ && t(3, i = _.sys), "editMode" in _ && t(0, s = _.editMode), "data" in _ && t(4, a = _.data);
  }, [s, r, d, i, a, u];
}
class en extends oe {
  constructor(e) {
    super(), le(this, e, ni, ti, te, { sys: 3, editMode: 0, data: 4 });
  }
  get sys() {
    return this.$$.ctx[3];
  }
  set sys(e) {
    this.$$set({ sys: e }), E();
  }
  get editMode() {
    return this.$$.ctx[0];
  }
  set editMode(e) {
    this.$$set({ editMode: e }), E();
  }
  get data() {
    return this.$$.ctx[4];
  }
  set data(e) {
    this.$$set({ data: e }), E();
  }
}
re(en, { sys: {}, editMode: {}, data: {} }, [], [], !0);
function ii(n) {
  let e, t, i, s, a, l, r, o, d, u, _, f, h;
  return {
    c() {
      e = $("div"), t = $("div"), i = $("div"), s = j(), a = $("div"), l = $("p"), r = G(
        /*name*/
        n[1]
      ), o = j(), d = $("div"), u = $("p"), _ = G(
        /*bonus*/
        n[3]
      ), g(i, "class", "skillproficiencyMark"), g(
        i,
        "data-level",
        /*value*/
        n[2]
      ), g(t, "class", "skillproficiencyMarkParent"), g(a, "class", "skillproficiencyMarkName"), g(d, "class", "skillproficiencyMarkValue"), g(e, "class", "skillproficiencyContainer"), g(
        e,
        "data-edit",
        /*edit*/
        n[0]
      );
    },
    m(c, y) {
      B(c, e, y), b(e, t), b(t, i), b(e, s), b(e, a), b(a, l), b(l, r), b(e, o), b(e, d), b(d, u), b(u, _), f || (h = [
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
      2 && de(
        r,
        /*name*/
        c[1]
      ), y & /*bonus*/
      8 && de(
        _,
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
      c && N(e), f = !1, Y(h);
    }
  };
}
function si(n, e, t) {
  let { edit: i } = e, { name: s } = e, { sys: a } = e, l = a.fixed.SkillProficiencies[s], r = a.derived.skillproficiencyBonus[s], o = l.getValue(), d = r.getValue();
  const u = ge.getNewKey();
  Ee(() => {
    l.addUpdateListener(s + u + "SvelteView", () => {
      t(2, o = l.getValue());
    }), r.addUpdateListener(s + u + "SvelteView", () => {
      t(3, d = r.getValue());
    });
  }), Ae(() => {
    l.removeUpdateListener(s + "SvelteView"), r.removeUpdateListener(s + "SvelteView");
  });
  function _() {
    if (!i)
      return;
    let h = l.getValue();
    return h = (h + 1) % 3, l.setValue(h), null;
  }
  function f(h) {
    me.call(this, n, h);
  }
  return n.$$set = (h) => {
    "edit" in h && t(0, i = h.edit), "name" in h && t(1, s = h.name), "sys" in h && t(5, a = h.sys);
  }, [i, s, o, d, _, a, f];
}
class tn extends oe {
  constructor(e) {
    super(), le(this, e, si, ii, te, { edit: 0, name: 1, sys: 5 });
  }
  get edit() {
    return this.$$.ctx[0];
  }
  set edit(e) {
    this.$$set({ edit: e }), E();
  }
  get name() {
    return this.$$.ctx[1];
  }
  set name(e) {
    this.$$set({ name: e }), E();
  }
  get sys() {
    return this.$$.ctx[5];
  }
  set sys(e) {
    this.$$set({ sys: e }), E();
  }
}
re(tn, { edit: {}, name: {}, sys: {} }, [], [], !0);
function mt(n, e, t) {
  const i = n.slice();
  return i[4] = e[t], i;
}
function pt(n) {
  let e, t;
  return e = new tn({
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
      X(e.$$.fragment);
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
      P(e.$$.fragment, i), t = !1;
    },
    d(i) {
      Q(e, i);
    }
  };
}
function ai(n) {
  let e, t, i = se(
    /*names*/
    n[2]
  ), s = [];
  for (let l = 0; l < i.length; l += 1)
    s[l] = pt(mt(n, i, l));
  const a = (l) => P(s[l], 1, 1, () => {
    s[l] = null;
  });
  return {
    c() {
      e = $("div");
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
        i = se(
          /*names*/
          l[2]
        );
        let o;
        for (o = 0; o < i.length; o += 1) {
          const d = mt(l, i, o);
          s[o] ? (s[o].p(d, r), R(s[o], 1)) : (s[o] = pt(d), s[o].c(), R(s[o], 1), s[o].m(e, null));
        }
        for (ue(), o = i.length; o < s.length; o += 1)
          a(o);
        fe();
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
        P(s[r]);
      t = !1;
    },
    d(l) {
      l && N(e), Ze(s, l);
    }
  };
}
function li(n, e, t) {
  let { edit: i } = e, { sys: s } = e, { data: a } = e, l = Object.keys(s.fixed.SkillProficiencies);
  return n.$$set = (r) => {
    "edit" in r && t(0, i = r.edit), "sys" in r && t(1, s = r.sys), "data" in r && t(3, a = r.data);
  }, [i, s, l, a];
}
class nn extends oe {
  constructor(e) {
    super(), le(this, e, li, ai, te, { edit: 0, sys: 1, data: 3 });
  }
  get edit() {
    return this.$$.ctx[0];
  }
  set edit(e) {
    this.$$set({ edit: e }), E();
  }
  get sys() {
    return this.$$.ctx[1];
  }
  set sys(e) {
    this.$$set({ sys: e }), E();
  }
  get data() {
    return this.$$.ctx[3];
  }
  set data(e) {
    this.$$set({ data: e }), E();
  }
}
re(nn, { edit: {}, sys: {}, data: {} }, [], [], !0);
function vt(n, e, t) {
  const i = n.slice();
  return i[16] = e[t], i;
}
function ri(n) {
  let e;
  return {
    c() {
      e = $("div"), e.innerHTML = "";
    },
    m(t, i) {
      B(t, e, i);
    },
    p: K,
    d(t) {
      t && N(e);
    }
  };
}
function oi(n) {
  let e, t, i, s, a = se(Object.keys(
    /*sys*/
    n[0].derived["Spell Bonus"]
  )), l = [];
  for (let r = 0; r < a.length; r += 1)
    l[r] = yt(vt(n, a, r));
  return {
    c() {
      e = $("div"), t = $("select");
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
        a = se(Object.keys(
          /*sys*/
          r[0].derived["Spell Bonus"]
        ));
        let d;
        for (d = 0; d < a.length; d += 1) {
          const u = vt(r, a, d);
          l[d] ? l[d].p(u, o) : (l[d] = yt(u), l[d].c(), l[d].m(t, null));
        }
        for (; d < l.length; d += 1)
          l[d].d(1);
        l.length = a.length;
      }
    },
    d(r) {
      r && N(e), Ze(l, r), n[8](null), i = !1, s();
    }
  };
}
function yt(n) {
  let e, t = (
    /*key*/
    n[16] + ""
  ), i, s, a, l;
  return {
    c() {
      e = $("option"), i = G(t), s = j(), e.__value = a = /*key*/
      n[16], Ie(e, e.__value), e.selected = l = /*key*/
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
      r[16]) && (e.__value = a, Ie(e, e.__value)), o & /*sys, showStat*/
      5 && l !== (l = /*key*/
      r[16] == /*showStat*/
      r[2]) && (e.selected = l);
    },
    d(r) {
      r && N(e);
    }
  };
}
function di(n) {
  let e, t, i, s, a, l, r, o, d, u, _, f, h, c, y, p, v;
  function C(D, A) {
    return (
      /*edit*/
      D[1] ? oi : ri
    );
  }
  let m = C(n), S = m(n);
  return {
    c() {
      e = $("div"), S.c(), t = j(), i = $("div"), s = $("div"), a = G(
        /*showStat*/
        n[2]
      ), l = j(), r = $("div"), o = $("div"), o.textContent = "Spell DC", d = j(), u = $("div"), _ = G(
        /*chosen_DC*/
        n[3]
      ), f = j(), h = $("div"), c = $("div"), c.textContent = "Spell Bonus", y = j(), p = $("div"), v = G(
        /*chosen_BONUS*/
        n[4]
      ), g(i, "class", "spellDCContainer");
    },
    m(D, A) {
      B(D, e, A), S.m(e, null), b(e, t), b(e, i), b(i, s), b(s, a), b(i, l), b(i, r), b(r, o), b(r, d), b(r, u), b(u, _), b(i, f), b(i, h), b(h, c), b(h, y), b(h, p), b(p, v);
    },
    p(D, [A]) {
      m === (m = C(D)) && S ? S.p(D, A) : (S.d(1), S = m(D), S && (S.c(), S.m(e, t))), A & /*showStat*/
      4 && de(
        a,
        /*showStat*/
        D[2]
      ), A & /*chosen_DC*/
      8 && de(
        _,
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
      D && N(e), S.d();
    }
  };
}
function ui(n, e, t) {
  let { sys: i } = e, { edit: s } = e, { data: a } = e;
  const l = ge.getNewKey();
  let r = a.data;
  JSON.stringify(r) === JSON.stringify({}) && (r.showStat = Object.keys(i.derived["Spell Bonus"])[0]);
  let o = r.showStat, d = i.derived["Spell Bonus"][o], u = i.derived["Spell DC"][o], _ = d.getValue(), f = u.getValue(), h;
  function c() {
    let m = h.value;
    t(2, o = m), d = i.derived["Spell Bonus"][o], u = i.derived["Spell DC"][o], t(3, _ = d.getValue()), t(4, f = u.getValue());
  }
  function y() {
    t(3, _ = d.getValue()), t(4, f = u.getValue());
  }
  function p() {
    d.addUpdateListener(name + "SpellInfoView" + l, () => {
      y();
    }), u.addUpdateListener(name + "SpellInfoView" + l, () => {
      y();
    });
  }
  Ee(() => {
    p();
  });
  function v() {
    d.removeUpdateListener(name + "SpellInfoView" + l), u.removeUpdateListener(name + "SpellInfoView" + l);
  }
  Ae(() => {
    v();
  });
  function C(m) {
    ne[m ? "unshift" : "push"](() => {
      h = m, t(5, h), t(0, i);
    });
  }
  return n.$$set = (m) => {
    "sys" in m && t(0, i = m.sys), "edit" in m && t(1, s = m.edit), "data" in m && t(7, a = m.data);
  }, [
    i,
    s,
    o,
    _,
    f,
    h,
    c,
    a,
    C
  ];
}
class sn extends oe {
  constructor(e) {
    super(), le(this, e, ui, di, te, { sys: 0, edit: 1, data: 7 });
  }
  get sys() {
    return this.$$.ctx[0];
  }
  set sys(e) {
    this.$$set({ sys: e }), E();
  }
  get edit() {
    return this.$$.ctx[1];
  }
  set edit(e) {
    this.$$set({ edit: e }), E();
  }
  get data() {
    return this.$$.ctx[7];
  }
  set data(e) {
    this.$$set({ data: e }), E();
  }
}
re(sn, { sys: {}, edit: {}, data: {} }, [], [], !0);
function fi(n) {
  let e, t, i, s, a, l, r, o, d, u, _, f, h;
  return {
    c() {
      e = $("div"), t = $("div"), i = G(
        /*name*/
        n[0]
      ), s = j(), a = $("div"), l = $("input"), o = j(), d = $("div"), u = $("div"), _ = G(
        /*modNodeValue*/
        n[3]
      ), g(l, "class", "BoxValue"), g(
        l,
        "data-editmode",
        /*editmode*/
        n[1]
      ), l.disabled = r = !/*editmode*/
      n[1], l.value = /*nodeValue*/
      n[2], g(l, "type", "number"), g(l, "min", "0"), g(l, "max", "100"), g(a, "class", "LargeValue"), g(u, "class", "BoxValue"), g(d, "class", "SmallValue"), g(e, "class", "StatValue");
    },
    m(c, y) {
      B(c, e, y), b(e, t), b(t, i), b(e, s), b(e, a), b(a, l), n[8](l), b(e, o), b(e, d), b(d, u), b(u, _), f || (h = U(
        l,
        "change",
        /*onChange*/
        n[5]
      ), f = !0);
    },
    p(c, [y]) {
      y & /*name*/
      1 && de(
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
      8 && de(
        _,
        /*modNodeValue*/
        c[3]
      );
    },
    i: K,
    o: K,
    d(c) {
      c && N(e), n[8](null), f = !1, h();
    }
  };
}
function ci(n, e, t) {
  let { name: i } = e, { statNode: s } = e, { modNode: a } = e, { editmode: l = !1 } = e, r = s.getValue(), o = a.getValue();
  const d = ge.getNewKey();
  Ee(() => {
    s.addUpdateListener("onDerivedNodeUpdate" + d, u), a.addUpdateListener("onDerivedNodeUpdate" + d, u);
  }), Ae(() => {
    s.removeUpdateListener("onDerivedNodeUpdate" + d), a.removeUpdateListener("onDerivedNodeUpdate" + d);
  });
  function u() {
    t(2, r = s.getValue()), t(3, o = a.getValue());
  }
  function _() {
    let c = parseInt(f.value);
    s.setValue(c);
  }
  let f;
  function h(c) {
    ne[c ? "unshift" : "push"](() => {
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
    _,
    s,
    a,
    h
  ];
}
class an extends oe {
  constructor(e) {
    super(), le(this, e, ci, fi, te, {
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
    this.$$set({ name: e }), E();
  }
  get statNode() {
    return this.$$.ctx[6];
  }
  set statNode(e) {
    this.$$set({ statNode: e }), E();
  }
  get modNode() {
    return this.$$.ctx[7];
  }
  set modNode(e) {
    this.$$set({ modNode: e }), E();
  }
  get editmode() {
    return this.$$.ctx[1];
  }
  set editmode(e) {
    this.$$set({ editmode: e }), E();
  }
}
re(an, { name: {}, statNode: {}, modNode: {}, editmode: { type: "Boolean" } }, [], [], !0);
function bt(n, e, t) {
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
function $t(n) {
  let e, t;
  return e = new an({
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
      X(e.$$.fragment);
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
      t || (R(e.$$.fragment, i), t = !0);
    },
    o(i) {
      P(e.$$.fragment, i), t = !1;
    },
    d(i) {
      Q(e, i);
    }
  };
}
function hi(n) {
  let e, t, i = se(Object.keys(
    /*stats*/
    n[2]
  )), s = [];
  for (let l = 0; l < i.length; l += 1)
    s[l] = $t(bt(n, i, l));
  const a = (l) => P(s[l], 1, 1, () => {
    s[l] = null;
  });
  return {
    c() {
      e = $("div");
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
      if (r & /*Object, stats, sys, edit*/
      7) {
        i = se(Object.keys(
          /*stats*/
          l[2]
        ));
        let o;
        for (o = 0; o < i.length; o += 1) {
          const d = bt(l, i, o);
          s[o] ? (s[o].p(d, r), R(s[o], 1)) : (s[o] = $t(d), s[o].c(), R(s[o], 1), s[o].m(e, null));
        }
        for (ue(), o = i.length; o < s.length; o += 1)
          a(o);
        fe();
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
        P(s[r]);
      t = !1;
    },
    d(l) {
      l && N(e), Ze(s, l);
    }
  };
}
function gi(n, e, t) {
  let { sys: i } = e, { data: s } = e, { edit: a = !1 } = e, l = i.fixed.stats;
  return n.$$set = (r) => {
    "sys" in r && t(0, i = r.sys), "data" in r && t(3, s = r.data), "edit" in r && t(1, a = r.edit);
  }, [i, a, l, s];
}
class ln extends oe {
  constructor(e) {
    super(), le(this, e, gi, hi, te, { sys: 0, data: 3, edit: 1 });
  }
  get sys() {
    return this.$$.ctx[0];
  }
  set sys(e) {
    this.$$set({ sys: e }), E();
  }
  get data() {
    return this.$$.ctx[3];
  }
  set data(e) {
    this.$$set({ data: e }), E();
  }
  get edit() {
    return this.$$.ctx[1];
  }
  set edit(e) {
    this.$$set({ edit: e }), E();
  }
}
re(ln, { sys: {}, data: {}, edit: { type: "Boolean" } }, [], [], !0);
function wt(n) {
  let e, t, i = (
    /*hasUp*/
    n[1] && Dt(n)
  ), s = (
    /*hasDown*/
    n[2] && kt(n)
  );
  return {
    c() {
      e = $("div"), i && i.c(), t = j(), s && s.c(), g(e, "class", "ItemManouverOptions");
    },
    m(a, l) {
      B(a, e, l), i && i.m(e, null), b(e, t), s && s.m(e, null);
    },
    p(a, l) {
      /*hasUp*/
      a[1] ? i ? i.p(a, l) : (i = Dt(a), i.c(), i.m(e, t)) : i && (i.d(1), i = null), /*hasDown*/
      a[2] ? s ? s.p(a, l) : (s = kt(a), s.c(), s.m(e, null)) : s && (s.d(1), s = null);
    },
    d(a) {
      a && N(e), i && i.d(), s && s.d();
    }
  };
}
function Dt(n) {
  let e, t, i;
  return {
    c() {
      e = $("div"), e.textContent = "Up", g(e, "class", "ItemManouverOption");
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
      s && N(e), t = !1, Y(i);
    }
  };
}
function kt(n) {
  let e, t, i;
  return {
    c() {
      e = $("div"), e.textContent = "Down", g(e, "class", "ItemManouverOption");
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
      s && N(e), t = !1, Y(i);
    }
  };
}
function _i(n) {
  let e, t = (
    /*editMode*/
    n[0] && wt(n)
  );
  return {
    c() {
      e = $("div"), t && t.c(), g(e, "class", "ItemManouverContainer");
    },
    m(i, s) {
      B(i, e, s), t && t.m(e, null);
    },
    p(i, [s]) {
      /*editMode*/
      i[0] ? t ? t.p(i, s) : (t = wt(i), t.c(), t.m(e, null)) : t && (t.d(1), t = null);
    },
    i: K,
    o: K,
    d(i) {
      i && N(e), t && t.d();
    }
  };
}
function mi(n, e, t) {
  let i = nt(), { data: s } = e, { editMode: a } = e, { hasUp: l } = e, { hasDown: r } = e;
  function o() {
    i("moveUp", s.id);
  }
  function d() {
    i("moveDown", s.id);
  }
  function u(f) {
    me.call(this, n, f);
  }
  function _(f) {
    me.call(this, n, f);
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
    _
  ];
}
class rn extends oe {
  constructor(e) {
    super(), le(this, e, mi, _i, te, {
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
    this.$$set({ data: e }), E();
  }
  get editMode() {
    return this.$$.ctx[0];
  }
  set editMode(e) {
    this.$$set({ editMode: e }), E();
  }
  get hasUp() {
    return this.$$.ctx[1];
  }
  set hasUp(e) {
    this.$$set({ hasUp: e }), E();
  }
  get hasDown() {
    return this.$$.ctx[2];
  }
  set hasDown(e) {
    this.$$set({ hasDown: e }), E();
  }
}
re(rn, { data: {}, editMode: {}, hasUp: {}, hasDown: {} }, [], [], !0);
function It(n) {
  let e, t, i;
  function s(l) {
    n[7](l);
  }
  let a = { editMode: !0 };
  return (
    /*data*/
    n[0] !== void 0 && (a.data = /*data*/
    n[0]), e = new Zt({ props: a }), ne.push(() => ye(e, "data", s)), e.$on(
      "optionSelected",
      /*updateData*/
      n[6]
    ), {
      c() {
        X(e.$$.fragment);
      },
      m(l, r) {
        W(e, l, r), i = !0;
      },
      p(l, r) {
        const o = {};
        !t && r & /*data*/
        1 && (t = !0, o.data = /*data*/
        l[0], ve(() => t = !1)), e.$set(o);
      },
      i(l) {
        i || (R(e.$$.fragment, l), i = !0);
      },
      o(l) {
        P(e.$$.fragment, l), i = !1;
      },
      d(l) {
        Q(e, l);
      }
    }
  );
}
function St(n) {
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
    n[0]), e = new rn({ props: a }), ne.push(() => ye(e, "data", s)), e.$on(
      "moveUp",
      /*moveUp_handler*/
      n[9]
    ), e.$on(
      "moveDown",
      /*moveDown_handler*/
      n[10]
    ), {
      c() {
        X(e.$$.fragment);
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
        l[0], ve(() => t = !1)), e.$set(o);
      },
      i(l) {
        i || (R(e.$$.fragment, l), i = !0);
      },
      o(l) {
        P(e.$$.fragment, l), i = !1;
      },
      d(l) {
        Q(e, l);
      }
    }
  );
}
function pi(n) {
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
    n[0]), t = new ln({ props: r }), ne.push(() => ye(t, "data", l)), t.$on(
      "optionSelected",
      /*updateData*/
      n[6]
    ), {
      c() {
        e = $("div"), X(t.$$.fragment);
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
        o[0], ve(() => i = !1)), t.$set(u);
      },
      i(o) {
        a || (R(t.$$.fragment, o), o && ie(() => {
          a && (s || (s = z(e, ae, {}, !0)), s.run(1));
        }), a = !0);
      },
      o(o) {
        P(t.$$.fragment, o), o && (s || (s = z(e, ae, {}, !1)), s.run(0)), a = !1;
      },
      d(o) {
        o && N(e), Q(t), o && s && s.end();
      }
    }
  );
}
function vi(n) {
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
    n[0]), t = new sn({ props: r }), ne.push(() => ye(t, "data", l)), t.$on(
      "optionSelected",
      /*updateData*/
      n[6]
    ), {
      c() {
        e = $("div"), X(t.$$.fragment);
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
        o[0], ve(() => i = !1)), t.$set(u);
      },
      i(o) {
        a || (R(t.$$.fragment, o), o && ie(() => {
          a && (s || (s = z(e, ae, {}, !0)), s.run(1));
        }), a = !0);
      },
      o(o) {
        P(t.$$.fragment, o), o && (s || (s = z(e, ae, {}, !1)), s.run(0)), a = !1;
      },
      d(o) {
        o && N(e), Q(t), o && s && s.end();
      }
    }
  );
}
function yi(n) {
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
    n[0]), t = new nn({ props: r }), ne.push(() => ye(t, "data", l)), t.$on(
      "optionSelected",
      /*updateData*/
      n[6]
    ), {
      c() {
        e = $("div"), X(t.$$.fragment);
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
        o[0], ve(() => i = !1)), t.$set(u);
      },
      i(o) {
        a || (R(t.$$.fragment, o), o && ie(() => {
          a && (s || (s = z(e, ae, {}, !0)), s.run(1));
        }), a = !0);
      },
      o(o) {
        P(t.$$.fragment, o), o && (s || (s = z(e, ae, {}, !1)), s.run(0)), a = !1;
      },
      d(o) {
        o && N(e), Q(t), o && s && s.end();
      }
    }
  );
}
function bi(n) {
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
    n[0]), t = new en({ props: r }), ne.push(() => ye(t, "data", l)), t.$on(
      "optionSelected",
      /*updateData*/
      n[6]
    ), {
      c() {
        e = $("div"), X(t.$$.fragment);
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
        o[0], ve(() => i = !1)), t.$set(u);
      },
      i(o) {
        a || (R(t.$$.fragment, o), o && ie(() => {
          a && (s || (s = z(e, ae, {}, !0)), s.run(1));
        }), a = !0);
      },
      o(o) {
        P(t.$$.fragment, o), o && (s || (s = z(e, ae, {}, !1)), s.run(0)), a = !1;
      },
      d(o) {
        o && N(e), Q(t), o && s && s.end();
      }
    }
  );
}
function $i(n) {
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
    n[0]), t = new xt({ props: r }), ne.push(() => ye(t, "data", l)), t.$on(
      "optionSelected",
      /*updateData*/
      n[6]
    ), {
      c() {
        e = $("div"), X(t.$$.fragment);
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
        o[0], ve(() => i = !1)), t.$set(u);
      },
      i(o) {
        a || (R(t.$$.fragment, o), o && ie(() => {
          a && (s || (s = z(e, ae, {}, !0)), s.run(1));
        }), a = !0);
      },
      o(o) {
        P(t.$$.fragment, o), o && (s || (s = z(e, ae, {}, !1)), s.run(0)), a = !1;
      },
      d(o) {
        o && N(e), Q(t), o && s && s.end();
      }
    }
  );
}
function wi(n) {
  let e, t, i, s, a, l, r = (
    /*editMode*/
    n[1] && It(n)
  ), o = (
    /*length*/
    n[3] != 1 && St(n)
  );
  const d = [
    $i,
    bi,
    yi,
    vi,
    pi
  ], u = [];
  function _(f, h) {
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
  return ~(s = _(n)) && (a = u[s] = d[s](n)), {
    c() {
      e = $("div"), r && r.c(), t = j(), o && o.c(), i = j(), a && a.c();
    },
    m(f, h) {
      B(f, e, h), r && r.m(e, null), b(e, t), o && o.m(e, null), b(e, i), ~s && u[s].m(e, null), l = !0;
    },
    p(f, [h]) {
      /*editMode*/
      f[1] ? r ? (r.p(f, h), h & /*editMode*/
      2 && R(r, 1)) : (r = It(f), r.c(), R(r, 1), r.m(e, t)) : r && (ue(), P(r, 1, 1, () => {
        r = null;
      }), fe()), /*length*/
      f[3] != 1 ? o ? (o.p(f, h), h & /*length*/
      8 && R(o, 1)) : (o = St(f), o.c(), R(o, 1), o.m(e, i)) : o && (ue(), P(o, 1, 1, () => {
        o = null;
      }), fe());
      let c = s;
      s = _(f), s === c ? ~s && u[s].p(f, h) : (a && (ue(), P(u[c], 1, 1, () => {
        u[c] = null;
      }), fe()), ~s ? (a = u[s], a ? a.p(f, h) : (a = u[s] = d[s](f), a.c()), R(a, 1), a.m(e, null)) : a = null);
    },
    i(f) {
      l || (R(r), R(o), R(a), l = !0);
    },
    o(f) {
      P(r), P(o), P(a), l = !1;
    },
    d(f) {
      f && N(e), r && r.d(), o && o.d(), ~s && u[s].d();
    }
  };
}
function Di(n, e, t) {
  let { data: i } = e, { editMode: s } = e, { sys: a } = e, { length: l } = e, { index: r } = e, { layoutMode: o = !1 } = e;
  function d() {
    t(0, i);
  }
  function u(m) {
    i = m, t(0, i);
  }
  function _(m) {
    i = m, t(0, i);
  }
  function f(m) {
    me.call(this, n, m);
  }
  function h(m) {
    me.call(this, n, m);
  }
  function c(m) {
    i = m, t(0, i);
  }
  function y(m) {
    i = m, t(0, i);
  }
  function p(m) {
    i = m, t(0, i);
  }
  function v(m) {
    i = m, t(0, i);
  }
  function C(m) {
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
    _,
    f,
    h,
    c,
    y,
    p,
    v,
    C
  ];
}
class on extends oe {
  constructor(e) {
    super(), le(this, e, Di, wi, te, {
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
    this.$$set({ data: e }), E();
  }
  get editMode() {
    return this.$$.ctx[1];
  }
  set editMode(e) {
    this.$$set({ editMode: e }), E();
  }
  get sys() {
    return this.$$.ctx[2];
  }
  set sys(e) {
    this.$$set({ sys: e }), E();
  }
  get length() {
    return this.$$.ctx[3];
  }
  set length(e) {
    this.$$set({ length: e }), E();
  }
  get index() {
    return this.$$.ctx[4];
  }
  set index(e) {
    this.$$set({ index: e }), E();
  }
  get layoutMode() {
    return this.$$.ctx[5];
  }
  set layoutMode(e) {
    this.$$set({ layoutMode: e }), E();
  }
}
re(on, { data: {}, editMode: {}, sys: {}, length: {}, index: {}, layoutMode: { type: "Boolean" } }, [], [], !0);
function at(n, e, t) {
  return n.style.animation && (n.style = null), qn(n, e, t ?? { duration: 500 });
}
function Mt(n) {
  let e, t, i, s, a = (
    /*onAdd*/
    n[4] && Ot(n)
  ), l = (
    /*onRemove*/
    n[3] && Ct(n)
  );
  return {
    c() {
      e = $("div"), a && a.c(), t = j(), l && l.c(), g(e, "class", "RowColumnOptions"), g(
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
      r[4] ? a ? a.p(r, o) : (a = Ot(r), a.c(), a.m(e, t)) : a && (a.d(1), a = null), /*onRemove*/
      r[3] ? l ? l.p(r, o) : (l = Ct(r), l.c(), l.m(e, null)) : l && (l.d(1), l = null);
    },
    i(r) {
      s || (r && ie(() => {
        s && (i || (i = z(e, ae, {}, !0)), i.run(1));
      }), s = !0);
    },
    o(r) {
      r && (i || (i = z(e, ae, {}, !1)), i.run(0)), s = !1;
    },
    d(r) {
      r && N(e), a && a.d(), l && l.d(), r && i && i.end();
    }
  };
}
function Ot(n) {
  let e, t, i, s;
  return {
    c() {
      e = $("div"), t = G(
        /*addText*/
        n[1]
      ), g(e, "class", "itemOption");
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
      a && N(e), i = !1, Y(s);
    }
  };
}
function Ct(n) {
  let e, t, i, s;
  return {
    c() {
      e = $("div"), t = G(
        /*remText*/
        n[2]
      ), g(e, "class", "itemOption rem");
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
      a && N(e), i = !1, Y(s);
    }
  };
}
function ki(n) {
  let e, t = (
    /*active*/
    n[0] && Mt(n)
  );
  return {
    c() {
      t && t.c(), e = Sn();
    },
    m(i, s) {
      t && t.m(i, s), B(i, e, s);
    },
    p(i, [s]) {
      /*active*/
      i[0] ? t ? (t.p(i, s), s & /*active*/
      1 && R(t, 1)) : (t = Mt(i), t.c(), R(t, 1), t.m(e.parentNode, e)) : t && (ue(), P(t, 1, 1, () => {
        t = null;
      }), fe());
    },
    i(i) {
      R(t);
    },
    o(i) {
      P(t);
    },
    d(i) {
      i && N(e), t && t.d(i);
    }
  };
}
function Ii(n, e, t) {
  let { active: i } = e, { addText: s = "Add Item" } = e, { remText: a = "Remove This Item" } = e, { offset: l = 0 } = e, { side: r = "left" } = e, { verti: o = "bottom" } = e, { onRemove: d = null } = e, { onAdd: u = null } = e, _ = r + ":" + l + ";" + o + ":" + l + ";";
  function f(p) {
    me.call(this, n, p);
  }
  function h(p) {
    me.call(this, n, p);
  }
  const c = () => u(), y = () => d();
  return n.$$set = (p) => {
    "active" in p && t(0, i = p.active), "addText" in p && t(1, s = p.addText), "remText" in p && t(2, a = p.remText), "offset" in p && t(6, l = p.offset), "side" in p && t(7, r = p.side), "verti" in p && t(8, o = p.verti), "onRemove" in p && t(3, d = p.onRemove), "onAdd" in p && t(4, u = p.onAdd);
  }, [
    i,
    s,
    a,
    d,
    u,
    _,
    l,
    r,
    o,
    f,
    h,
    c,
    y
  ];
}
class pe extends oe {
  constructor(e) {
    super(), le(this, e, Ii, ki, te, {
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
    this.$$set({ active: e }), E();
  }
  get addText() {
    return this.$$.ctx[1];
  }
  set addText(e) {
    this.$$set({ addText: e }), E();
  }
  get remText() {
    return this.$$.ctx[2];
  }
  set remText(e) {
    this.$$set({ remText: e }), E();
  }
  get offset() {
    return this.$$.ctx[6];
  }
  set offset(e) {
    this.$$set({ offset: e }), E();
  }
  get side() {
    return this.$$.ctx[7];
  }
  set side(e) {
    this.$$set({ side: e }), E();
  }
  get verti() {
    return this.$$.ctx[8];
  }
  set verti(e) {
    this.$$set({ verti: e }), E();
  }
  get onRemove() {
    return this.$$.ctx[3];
  }
  set onRemove(e) {
    this.$$set({ onRemove: e }), E();
  }
  get onAdd() {
    return this.$$.ctx[4];
  }
  set onAdd(e) {
    this.$$set({ onAdd: e }), E();
  }
}
re(pe, { active: {}, addText: {}, remText: {}, offset: {}, side: {}, verti: {}, onRemove: {}, onAdd: {} }, [], [], !0);
function Lt(n, e, t) {
  const i = n.slice();
  return i[43] = e[t], i[45] = t, i;
}
function Et(n, e, t) {
  const i = n.slice();
  return i[46] = e[t], i[48] = t, i;
}
function At(n, e, t) {
  const i = n.slice();
  return i[49] = e[t], i[51] = t, i;
}
function Rt(n) {
  let e, t;
  function i() {
    return (
      /*func_2*/
      n[22](
        /*row*/
        n[43],
        /*column*/
        n[46]
      )
    );
  }
  return e = new pe({
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
      X(e.$$.fragment);
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
      P(e.$$.fragment, s), t = !1;
    },
    d(s) {
      Q(e, s);
    }
  };
}
function Nt(n) {
  let e;
  return {
    c() {
      e = $("div"), e.innerHTML = "", Yt(e, "height", "50px");
    },
    m(t, i) {
      B(t, e, i);
    },
    d(t) {
      t && N(e);
    }
  };
}
function Bt(n, e) {
  let t, i, s, a, l, r, o, d, u, _ = K, f, h, c;
  function y() {
    return (
      /*func_4*/
      e[24](
        /*column*/
        e[46],
        /*item*/
        e[49]
      )
    );
  }
  i = new pe({
    props: {
      offset: 15,
      active: (
        /*$editLayout_03*/
        e[4]
      ),
      addText: "remove",
      onRemove: y
    }
  }), a = new on({
    props: {
      data: (
        /*item*/
        e[49]
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
        e[46].data.length
      ),
      index: (
        /*k*/
        e[51]
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
  function p(...S) {
    return (
      /*dragstart_handler*/
      e[27](
        /*item*/
        e[49],
        ...S
      )
    );
  }
  function v(...S) {
    return (
      /*dragend_handler*/
      e[28](
        /*item*/
        e[49],
        ...S
      )
    );
  }
  function C(...S) {
    return (
      /*drop_handler*/
      e[29](
        /*item*/
        e[49],
        ...S
      )
    );
  }
  function m(...S) {
    return (
      /*dragleave_handler*/
      e[30](
        /*item*/
        e[49],
        ...S
      )
    );
  }
  return {
    key: n,
    first: null,
    c() {
      t = $("div"), X(i.$$.fragment), s = j(), X(a.$$.fragment), g(t, "class", "Item"), g(t, "data-edit", l = /*$editMode*/
      e[1] || /*$editLayout_03*/
      e[4] || /*$editLayout_02*/
      e[3]), g(t, "data-itemid", r = /*item*/
      e[49].id), g(
        t,
        "data-edit-active",
        /*$editLayout_03*/
        e[4]
      ), g(t, "data-dragging", o = /*DragItemHandler*/
      e[14].isBeingDragged(
        /*item*/
        e[49].id
      )), g(
        t,
        "draggable",
        /*$editLayout_03*/
        e[4]
      ), this.first = t;
    },
    m(S, D) {
      B(S, t, D), W(i, t, null), b(t, s), W(a, t, null), f = !0, h || (c = [
        U(t, "dragstart", p),
        U(t, "dragend", v),
        U(t, "drop", C),
        U(t, "dragleave", m),
        U(t, "dragover", Ei)
      ], h = !0);
    },
    p(S, D) {
      e = S;
      const A = {};
      D[0] & /*$editLayout_03*/
      16 && (A.active = /*$editLayout_03*/
      e[4]), D[0] & /*$OBJ*/
      32 && (A.onRemove = y), i.$set(A);
      const H = {};
      D[0] & /*$OBJ*/
      32 && (H.data = /*item*/
      e[49]), D[0] & /*$editMode*/
      2 && (H.editMode = /*$editMode*/
      e[1]), D[0] & /*$editLayout_03*/
      16 && (H.layoutMode = /*$editLayout_03*/
      e[4]), D[0] & /*sys*/
      1 && (H.sys = /*sys*/
      e[0]), D[0] & /*$OBJ*/
      32 && (H.length = /*column*/
      e[46].data.length), D[0] & /*$OBJ*/
      32 && (H.index = /*k*/
      e[51]), a.$set(H), (!f || D[0] & /*$editMode, $editLayout_03, $editLayout_02*/
      26 && l !== (l = /*$editMode*/
      e[1] || /*$editLayout_03*/
      e[4] || /*$editLayout_02*/
      e[3])) && g(t, "data-edit", l), (!f || D[0] & /*$OBJ*/
      32 && r !== (r = /*item*/
      e[49].id)) && g(t, "data-itemid", r), (!f || D[0] & /*$editLayout_03*/
      16) && g(
        t,
        "data-edit-active",
        /*$editLayout_03*/
        e[4]
      ), (!f || D[0] & /*$OBJ*/
      32 && o !== (o = /*DragItemHandler*/
      e[14].isBeingDragged(
        /*item*/
        e[49].id
      ))) && g(t, "data-dragging", o), (!f || D[0] & /*$editLayout_03*/
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
      et(t), _(), je(t, u);
    },
    a() {
      _(), _ = xe(t, u, at, { duration: he });
    },
    i(S) {
      f || (R(i.$$.fragment, S), R(a.$$.fragment, S), S && ie(() => {
        f && (d || (d = z(t, Te, { duration: he }, !0)), d.run(1));
      }), f = !0);
    },
    o(S) {
      P(i.$$.fragment, S), P(a.$$.fragment, S), S && (d || (d = z(t, Te, { duration: he }, !1)), d.run(0)), f = !1;
    },
    d(S) {
      S && N(t), Q(i), Q(a), S && d && d.end(), h = !1, Y(c);
    }
  };
}
function Vt(n, e) {
  let t, i, s, a, l, r = [], o = /* @__PURE__ */ new Map(), d, u, _, f, h, c, y = K, p, v, C, m = (
    /*row*/
    e[43].data.length > 1 && Rt(e)
  );
  function S() {
    return (
      /*func_3*/
      e[23](
        /*column*/
        e[46]
      )
    );
  }
  s = new pe({
    props: {
      offset: 15,
      active: (
        /*$editLayout_03*/
        e[4]
      ),
      addText: "add a new Item",
      onAdd: S
    }
  });
  let D = (
    /*$editLayout_03*/
    (e[4] || /*$editLayout_02*/
    e[3]) && Nt()
  ), A = se(
    /*column*/
    e[46].data
  );
  const H = (O) => (
    /*item*/
    O[49].id
  );
  for (let O = 0; O < A.length; O += 1) {
    let k = At(e, A, O), T = H(k);
    o.set(T, r[O] = Bt(T, k));
  }
  function J(...O) {
    return (
      /*dragstart_handler_1*/
      e[31](
        /*column*/
        e[46],
        ...O
      )
    );
  }
  function M(...O) {
    return (
      /*dragenter_handler*/
      e[32](
        /*column*/
        e[46],
        ...O
      )
    );
  }
  function w(...O) {
    return (
      /*dragend_handler_1*/
      e[33](
        /*column*/
        e[46],
        ...O
      )
    );
  }
  function F(...O) {
    return (
      /*drop_handler_1*/
      e[34](
        /*column*/
        e[46],
        ...O
      )
    );
  }
  function Z(...O) {
    return (
      /*dragleave_handler_1*/
      e[35](
        /*column*/
        e[46],
        ...O
      )
    );
  }
  function x(...O) {
    return (
      /*dragover_handler_1*/
      e[36](
        /*column*/
        e[46],
        ...O
      )
    );
  }
  return {
    key: n,
    first: null,
    c() {
      t = $("div"), m && m.c(), i = j(), X(s.$$.fragment), a = j(), D && D.c(), l = j();
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
      e[46].id), g(
        t,
        "data-edit-active",
        /*$editLayout_02*/
        e[3]
      ), g(t, "data-dragging", _ = /*DragColumnHandler*/
      e[13].isBeingDragged(
        /*column*/
        e[46].id
      )), g(t, "style", f = `
						${/*$editLayout_02*/
      e[3] || /*$editLayout_01*/
      e[2] ? "margin-bottom:60px" : ""}
					`), g(
        t,
        "draggable",
        /*$editLayout_02*/
        e[3]
      ), this.first = t;
    },
    m(O, k) {
      B(O, t, k), m && m.m(t, null), b(t, i), W(s, t, null), b(t, a), D && D.m(t, null), b(t, l);
      for (let T = 0; T < r.length; T += 1)
        r[T] && r[T].m(t, null);
      p = !0, v || (C = [
        U(t, "dragstart", J),
        U(t, "dragenter", M),
        U(t, "dragend", w),
        U(t, "drop", F),
        U(t, "dragleave", Z),
        U(t, "dragover", x)
      ], v = !0);
    },
    p(O, k) {
      e = O, /*row*/
      e[43].data.length > 1 ? m ? (m.p(e, k), k[0] & /*$OBJ*/
      32 && R(m, 1)) : (m = Rt(e), m.c(), R(m, 1), m.m(t, i)) : m && (ue(), P(m, 1, 1, () => {
        m = null;
      }), fe());
      const T = {};
      if (k[0] & /*$editLayout_03*/
      16 && (T.active = /*$editLayout_03*/
      e[4]), k[0] & /*$OBJ*/
      32 && (T.onAdd = S), s.$set(T), /*$editLayout_03*/
      e[4] || /*$editLayout_02*/
      e[3] ? D || (D = Nt(), D.c(), D.m(t, l)) : D && (D.d(1), D = null), k[0] & /*$editMode, $editLayout_03, $editLayout_02, $OBJ, DragItemHandler, sys, itemRequestMove, OBJ*/
      19515) {
        A = se(
          /*column*/
          e[46].data
        ), ue();
        for (let q = 0; q < r.length; q += 1)
          r[q].r();
        r = Ke(r, k, H, 1, e, A, o, t, it, Bt, null, At);
        for (let q = 0; q < r.length; q += 1)
          r[q].a();
        fe();
      }
      (!p || k[0] & /*$editLayout_02, $editLayout_01*/
      12 && d !== (d = /*$editLayout_02*/
      e[3] || /*$editLayout_01*/
      e[2])) && g(t, "data-edit", d), (!p || k[0] & /*$editLayout_03*/
      16) && g(
        t,
        "data-editpreview",
        /*$editLayout_03*/
        e[4]
      ), (!p || k[0] & /*$OBJ*/
      32 && u !== (u = /*column*/
      e[46].id)) && g(t, "data-itemid", u), (!p || k[0] & /*$editLayout_02*/
      8) && g(
        t,
        "data-edit-active",
        /*$editLayout_02*/
        e[3]
      ), (!p || k[0] & /*$OBJ*/
      32 && _ !== (_ = /*DragColumnHandler*/
      e[13].isBeingDragged(
        /*column*/
        e[46].id
      ))) && g(t, "data-dragging", _), (!p || k[0] & /*$editLayout_02, $editLayout_01*/
      12 && f !== (f = `
						${/*$editLayout_02*/
      e[3] || /*$editLayout_01*/
      e[2] ? "margin-bottom:60px" : ""}
					`)) && g(t, "style", f), (!p || k[0] & /*$editLayout_02*/
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
      et(t), y(), je(t, c);
    },
    a() {
      y(), y = xe(t, c, at, { duration: he });
    },
    i(O) {
      if (!p) {
        R(m), R(s.$$.fragment, O);
        for (let k = 0; k < A.length; k += 1)
          R(r[k]);
        O && ie(() => {
          p && (h || (h = z(t, Te, { duration: he }, !0)), h.run(1));
        }), p = !0;
      }
    },
    o(O) {
      P(m), P(s.$$.fragment, O);
      for (let k = 0; k < r.length; k += 1)
        P(r[k]);
      O && (h || (h = z(t, Te, { duration: he }, !1)), h.run(0)), p = !1;
    },
    d(O) {
      O && N(t), m && m.d(), Q(s), D && D.d();
      for (let k = 0; k < r.length; k += 1)
        r[k].d();
      O && h && h.end(), v = !1, Y(C);
    }
  };
}
function Tt(n, e) {
  let t, i, s, a, l, r = [], o = /* @__PURE__ */ new Map(), d, u, _, f, h = K, c, y, p;
  function v() {
    return (
      /*func*/
      e[20](
        /*row*/
        e[43]
      )
    );
  }
  i = new pe({
    props: {
      active: (
        /*$editLayout_02*/
        e[3]
      ),
      onAdd: v,
      addText: "add Column"
    }
  });
  function C() {
    return (
      /*func_1*/
      e[21](
        /*row*/
        e[43]
      )
    );
  }
  a = new pe({
    props: {
      active: (
        /*$editLayout_01*/
        e[2]
      ),
      onRemove: C,
      remText: "remove this line"
    }
  });
  let m = se(
    /*row*/
    e[43].data
  );
  const S = (M) => (
    /*column*/
    M[46].id
  );
  for (let M = 0; M < m.length; M += 1) {
    let w = Et(e, m, M), F = S(w);
    o.set(F, r[M] = Vt(F, w));
  }
  function D(...M) {
    return (
      /*dragstart_handler_2*/
      e[37](
        /*row*/
        e[43],
        ...M
      )
    );
  }
  function A(...M) {
    return (
      /*dragenter_handler_1*/
      e[38](
        /*row*/
        e[43],
        ...M
      )
    );
  }
  function H(...M) {
    return (
      /*dragend_handler_2*/
      e[39](
        /*row*/
        e[43],
        ...M
      )
    );
  }
  function J(...M) {
    return (
      /*dragover_handler_2*/
      e[40](
        /*row*/
        e[43],
        ...M
      )
    );
  }
  return {
    key: n,
    first: null,
    c() {
      t = $("div"), X(i.$$.fragment), s = j(), X(a.$$.fragment), l = j();
      for (let M = 0; M < r.length; M += 1)
        r[M].c();
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
      ), g(t, "style", d = `grid-template-columns:${Pt(
        /*row*/
        e[43].data.length,
        "1fr"
      )}`), g(t, "data-rowid", u = /*row*/
      e[43].id), g(
        t,
        "draggable",
        /*$editLayout_01*/
        e[2]
      ), this.first = t;
    },
    m(M, w) {
      B(M, t, w), W(i, t, null), b(t, s), W(a, t, null), b(t, l);
      for (let F = 0; F < r.length; F += 1)
        r[F] && r[F].m(t, null);
      c = !0, y || (p = [
        U(t, "dragstart", D),
        U(t, "dragenter", A),
        U(t, "dragend", H),
        U(t, "dragover", J)
      ], y = !0);
    },
    p(M, w) {
      e = M;
      const F = {};
      w[0] & /*$editLayout_02*/
      8 && (F.active = /*$editLayout_02*/
      e[3]), w[0] & /*$OBJ*/
      32 && (F.onAdd = v), i.$set(F);
      const Z = {};
      if (w[0] & /*$editLayout_01*/
      4 && (Z.active = /*$editLayout_01*/
      e[2]), w[0] & /*$OBJ*/
      32 && (Z.onRemove = C), a.$set(Z), w[0] & /*$editLayout_02, $editLayout_01, $editLayout_03, $OBJ, DragColumnHandler, DragItemHandler, $editMode, sys, itemRequestMove, OBJ*/
      27711) {
        m = se(
          /*row*/
          e[43].data
        ), ue();
        for (let x = 0; x < r.length; x += 1)
          r[x].r();
        r = Ke(r, w, S, 1, e, m, o, t, it, Vt, null, Et);
        for (let x = 0; x < r.length; x += 1)
          r[x].a();
        fe();
      }
      (!c || w[0] & /*$editLayout_01*/
      4) && g(
        t,
        "data-edit",
        /*$editLayout_01*/
        e[2]
      ), (!c || w[0] & /*$editLayout_01*/
      4) && g(
        t,
        "data-edit-active",
        /*$editLayout_01*/
        e[2]
      ), (!c || w[0] & /*$editLayout_02*/
      8) && g(
        t,
        "data-editpreview",
        /*$editLayout_02*/
        e[3]
      ), (!c || w[0] & /*$OBJ*/
      32 && d !== (d = `grid-template-columns:${Pt(
        /*row*/
        e[43].data.length,
        "1fr"
      )}`)) && g(t, "style", d), (!c || w[0] & /*$OBJ*/
      32 && u !== (u = /*row*/
      e[43].id)) && g(t, "data-rowid", u), (!c || w[0] & /*$editLayout_01*/
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
      et(t), h(), je(t, f);
    },
    a() {
      h(), h = xe(t, f, at, { duration: he });
    },
    i(M) {
      if (!c) {
        R(i.$$.fragment, M), R(a.$$.fragment, M);
        for (let w = 0; w < m.length; w += 1)
          R(r[w]);
        M && ie(() => {
          c && (_ || (_ = z(t, ut, { duration: he, y: 100 }, !0)), _.run(1));
        }), c = !0;
      }
    },
    o(M) {
      P(i.$$.fragment, M), P(a.$$.fragment, M);
      for (let w = 0; w < r.length; w += 1)
        P(r[w]);
      M && (_ || (_ = z(t, ut, { duration: he, y: 100 }, !1)), _.run(0)), c = !1;
    },
    d(M) {
      M && N(t), Q(i), Q(a);
      for (let w = 0; w < r.length; w += 1)
        r[w].d();
      M && _ && _.end(), y = !1, Y(p);
    }
  };
}
function Ut(n) {
  let e, t, i;
  return t = new pe({
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
      e = $("div"), X(t.$$.fragment), g(e, "class", "Row"), Yt(e, "height", "100px");
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
      P(t.$$.fragment, s), i = !1;
    },
    d(s) {
      s && N(e), Q(t);
    }
  };
}
function Si(n) {
  let e, t, i, s, a, l = "Stop Edit	", r, o, d, u = "Layout Row	", _, f, h, c = "Layout Col	", y, p, v, C = "Layout Items", m, S, D, A = [], H = /* @__PURE__ */ new Map(), J, M, w, F, Z = se(
    /*$OBJ*/
    n[5].data
  );
  const x = (k) => (
    /*row*/
    k[43].id
  );
  for (let k = 0; k < Z.length; k += 1) {
    let T = Lt(n, Z, k), q = x(T);
    H.set(q, A[k] = Tt(q, T));
  }
  let O = (
    /*$editLayout_01*/
    n[2] && Ut(n)
  );
  return {
    c() {
      e = $("div"), t = $("div"), i = $("div"), s = $("div"), a = $("button"), r = G(l), o = j(), d = $("button"), _ = G(u), f = j(), h = $("button"), y = G(c), p = j(), v = $("button"), m = G(C), D = j();
      for (let k = 0; k < A.length; k += 1)
        A[k].c();
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
        h,
        "data-active",
        /*$editLayout_02*/
        n[3]
      ), g(
        v,
        "data-active",
        /*$editLayout_03*/
        n[4]
      ), g(s, "class", "SheetEditorMenu"), g(s, "data-isopen", S = /*$editMode*/
      n[1] || /*$editLayout_01*/
      n[2] || /*$editLayout_02*/
      n[3] || /*$editLayout_03*/
      n[4]), g(i, "class", "SheetEditorMenuContainer"), g(t, "class", "Sheet "), g(e, "class", "theme-light obsidianBody");
    },
    m(k, T) {
      B(k, e, T), b(e, t), b(t, i), b(i, s), b(s, a), b(a, r), b(s, o), b(s, d), b(d, _), b(s, f), b(s, h), b(h, y), b(s, p), b(s, v), b(v, m), b(t, D);
      for (let q = 0; q < A.length; q += 1)
        A[q] && A[q].m(t, null);
      b(t, J), O && O.m(t, null), M = !0, w || (F = [
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
          h,
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
    p(k, T) {
      if ((!M || T[0] & /*$editMode*/
      2) && g(
        a,
        "data-active",
        /*$editMode*/
        k[1]
      ), (!M || T[0] & /*$editLayout_01*/
      4) && g(
        d,
        "data-active",
        /*$editLayout_01*/
        k[2]
      ), (!M || T[0] & /*$editLayout_02*/
      8) && g(
        h,
        "data-active",
        /*$editLayout_02*/
        k[3]
      ), (!M || T[0] & /*$editLayout_03*/
      16) && g(
        v,
        "data-active",
        /*$editLayout_03*/
        k[4]
      ), (!M || T[0] & /*$editMode, $editLayout_01, $editLayout_02, $editLayout_03*/
      30 && S !== (S = /*$editMode*/
      k[1] || /*$editLayout_01*/
      k[2] || /*$editLayout_02*/
      k[3] || /*$editLayout_03*/
      k[4])) && g(s, "data-isopen", S), T[0] & /*$editLayout_01, $editLayout_02, $OBJ, DragRowHandler, $editLayout_03, DragColumnHandler, DragItemHandler, $editMode, sys, itemRequestMove, OBJ*/
      31807) {
        Z = se(
          /*$OBJ*/
          k[5].data
        ), ue();
        for (let q = 0; q < A.length; q += 1)
          A[q].r();
        A = Ke(A, T, x, 1, k, Z, H, t, it, Tt, J, Lt);
        for (let q = 0; q < A.length; q += 1)
          A[q].a();
        fe();
      }
      /*$editLayout_01*/
      k[2] ? O ? (O.p(k, T), T[0] & /*$editLayout_01*/
      4 && R(O, 1)) : (O = Ut(k), O.c(), R(O, 1), O.m(t, null)) : O && (ue(), P(O, 1, 1, () => {
        O = null;
      }), fe());
    },
    i(k) {
      if (!M) {
        for (let T = 0; T < Z.length; T += 1)
          R(A[T]);
        R(O), M = !0;
      }
    },
    o(k) {
      for (let T = 0; T < A.length; T += 1)
        P(A[T]);
      P(O), M = !1;
    },
    d(k) {
      k && N(e);
      for (let T = 0; T < A.length; T += 1)
        A[T].d();
      O && O.d(), w = !1, Y(F);
    }
  };
}
const Ue = 220, he = 100;
class Mi {
  constructor(e, t) {
    L(this, "data");
    L(this, "state");
    L(this, "layerActive");
    L(this, "isDragging", !1);
    L(this, "pauseDragg", !1);
    L(this, "dragID");
    L(this, "targetID");
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
    if (!ee(this.layerActive))
      return;
    const i = e.target;
    i.classList.contains("Row") && (this.isDragging = !0, this.dragID = t, i.setAttribute("data-dragging", "true"));
  }
  onDragOver(e, t) {
    ee(this.layerActive) && (!this.isDragging || this.pauseDragg || (this.targetID = t, this.moveRow()));
  }
  onDragEnd(e, t) {
    if (!ee(this.layerActive))
      return;
    this.isDragging = !1, this.dragID = null, this.targetID = null, e.target.setAttribute("data-dragging", "false");
  }
  findIndexOfID(e) {
    return ee(this.data).data.findIndex((t) => t.id == e);
  }
}
class Oi {
  constructor(e, t) {
    L(this, "data");
    L(this, "state");
    L(this, "layerActive");
    L(this, "isDragging", !1);
    L(this, "pauseDragg", !1);
    L(this, "dragTargetElement");
    L(this, "dragID");
    L(this, "targetID");
    L(this, "lastDragId");
    L(this, "lasttargId");
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
    if (!ee(this.layerActive))
      return;
    const i = e.target;
    i.classList.contains("Column") && (this.dragTargetElement = i, this.isDragging = !0, this.dragID = t, this.lastDragId = null, this.lasttargId = null, i.setAttribute("data-dragging", "true"));
  }
  onDragOver(e, t) {
    var i;
    ee(this.layerActive) && (!this.isDragging || this.pauseDragg || (this.targetID = t, this.moveRowItem(), (i = this.dragTargetElement) == null || i.setAttribute("data-dragging", "true")));
  }
  onDragEnd(e, t) {
    var i;
    ee(this.layerActive) && (this.isDragging = !1, this.dragID = null, this.targetID = null, e.target.setAttribute("data-dragging", "false"), (i = this.dragTargetElement) == null || i.setAttribute("data-dragging", "false"));
  }
  onLeave(e, t) {
    this.targetID = null;
  }
  findRowIndexOfID(e) {
    let t = -1;
    return [ee(this.data).data.findIndex((s) => {
      let a = s.data.findIndex((l) => l.id == e);
      return a != -1 ? (t = a, !0) : !1;
    }), t];
  }
  isBeingDragged(e) {
    return this.dragID == e;
  }
}
class Ci {
  constructor(e, t) {
    L(this, "data");
    L(this, "state");
    L(this, "layerActive");
    L(this, "isDragging", !1);
    L(this, "pauseDragg", !1);
    L(this, "dragTargetElement");
    L(this, "dragID");
    L(this, "targetID");
    L(this, "targetRowId");
    L(this, "lastDragId");
    L(this, "lasttargId");
    L(this, "lasttargRowId");
    this.data = e, this.state = t, this.layerActive = t.editLayout_03;
  }
  innerSwitchItem(e, t, i) {
    let s, a, l, r, o, d;
    if ([s, a, l] = this.findIndexsOfID(t), [r, o, d] = this.findIndexsOfID(i), s == -1 || r == -1 || a == -1 || o == -1 || l == -1 || d == -1)
      return;
    const u = e.data[s].data[a].data[l], _ = e.data[r].data[o].data[d];
    e.data[s].data[a].data[l] = _, e.data[r].data[o].data[d] = u;
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
    if (!ee(this.layerActive))
      return;
    const i = e.target;
    i.classList.contains("Item") && (this.dragTargetElement = i, this.isDragging = !0, this.dragID = t, this.lastDragId = null, this.lasttargId = null, i.setAttribute("data-dragging", "true"));
  }
  onDragOverColumn(e, t) {
    var i;
    ee(this.layerActive) && (!this.isDragging || this.pauseDragg || (this.targetID = null, this.targetRowId = t, this.moveRowItem(), (i = this.dragTargetElement) == null || i.setAttribute("data-dragging", "true")));
  }
  onDragEnd(e, t) {
    var i;
    ee(this.layerActive) && (this.isDragging = !1, this.dragID = null, this.targetID = null, e.target.setAttribute("data-dragging", "false"), (i = this.dragTargetElement) == null || i.setAttribute("data-dragging", "false"));
  }
  onLeave(e, t) {
    this.targetID = null;
  }
  findIndexsOfID(e) {
    let t = -1, i = -1, s = -1;
    return s = ee(this.data).data.findIndex((l) => {
      let r = l.data.findIndex((o) => {
        let d = o.data.findIndex((u) => u.id == e);
        return d != -1 ? (t = d, !0) : !1;
      });
      return r != -1 ? (i = r, !0) : !1;
    }), [s, i, t];
  }
  findColumnIndexsOfID(e) {
    let t = -1, i = -1;
    return i = ee(this.data).data.findIndex((a) => {
      let l = a.data.findIndex((r) => r.id == e);
      return l != -1 ? (t = l, !0) : !1;
    }), [i, t];
  }
  isBeingDragged(e) {
    return this.dragID == e;
  }
}
class Li {
  constructor() {
    L(this, "editMode", Oe(!1));
    L(this, "editLayout_01", Oe(!1));
    L(this, "editLayout_02", Oe(!1));
    L(this, "editLayout_03", Oe(!1));
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
function Pt(n, e, t = " ") {
  let i = e;
  for (let s = 0; s < n - 1; s++)
    i += t, i += e;
  return i;
}
const Ei = (n) => {
  n.preventDefault();
};
function Ai(n, e, t) {
  let i, s, a, l, r, o = new Li(), d = o.editMode;
  Se(n, d, (I) => t(1, i = I));
  let u = o.editLayout_01;
  Se(n, u, (I) => t(2, s = I));
  let _ = o.editLayout_02;
  Se(n, _, (I) => t(3, a = I));
  let f = o.editLayout_03;
  Se(n, f, (I) => t(4, l = I));
  let { textData: h } = e, { sys: c } = e, y = Oe(new Fn(JSON.parse(h).data));
  Se(n, y, (I) => t(5, r = I));
  function p(I, V) {
    m.requestMoveItemUpDown(I, V);
  }
  let v = new Mi(y, o), C = new Oi(y, o), m = new Ci(y, o);
  const S = () => d.set(!i), D = () => u.set(!ee(u)), A = () => _.set(!ee(_)), H = () => f.set(!ee(f)), J = (I) => {
    I.addColumn(), y.update((V) => V);
  }, M = (I) => {
    y.update((V) => (V.remRow(I.id), V));
  }, w = (I, V) => {
    I.remColumn(V.id), y.update((Fe) => Fe);
  }, F = (I) => {
    I.addItem(), y.update((V) => V);
  }, Z = (I, V) => {
    I.remItem(V.id), y.update((Fe) => Fe);
  }, x = (I) => {
    p(-1, I.detail);
  }, O = (I) => {
    p(1, I.detail);
  }, k = (I, V) => {
    m.onDragStart(V, I.id);
  }, T = (I, V) => {
    m.onDragEnd(V, I.id);
  }, q = (I, V) => {
    m.onDragEnd(V, I.id);
  }, dn = (I, V) => {
    m.onLeave(V, I.id);
  }, un = (I, V) => {
    C.onDragStart(V, I.id);
  }, fn = (I, V) => {
    C.onDragOver(V, I.id), m.onDragOverColumn(V, I.id);
  }, cn = (I, V) => {
    C.onDragEnd(V, I.id);
  }, hn = (I, V) => {
    C.onDragEnd(V, I.id);
  }, gn = (I, V) => {
    C.onLeave(V, I.id);
  }, _n = (I, V) => {
    C.onDragOver(V, I.id), m.onDragOverColumn(V, I.id), V.preventDefault();
  }, mn = (I, V) => v.onDragStart(V, I.id), pn = (I, V) => v.onDragOver(V, I.id), vn = (I, V) => v.onDragEnd(V, I.id), yn = (I, V) => {
    v.onDragOver(V, I.id), V.preventDefault();
  }, bn = () => {
    y.update((I) => (I.addRow(), I.data[r.data.length - 1].addColumn(), I));
  };
  return n.$$set = (I) => {
    "textData" in I && t(15, h = I.textData), "sys" in I && t(0, c = I.sys);
  }, [
    c,
    i,
    s,
    a,
    l,
    r,
    d,
    u,
    _,
    f,
    y,
    p,
    v,
    C,
    m,
    h,
    S,
    D,
    A,
    H,
    J,
    M,
    w,
    F,
    Z,
    x,
    O,
    k,
    T,
    q,
    dn,
    un,
    fn,
    cn,
    hn,
    gn,
    _n,
    mn,
    pn,
    vn,
    yn,
    bn
  ];
}
class Ri extends oe {
  constructor(e) {
    super(), le(this, e, Ai, Si, te, { textData: 15, sys: 0 }, null, [-1, -1]);
  }
  get textData() {
    return this.$$.ctx[15];
  }
  set textData(e) {
    this.$$set({ textData: e }), E();
  }
  get sys() {
    return this.$$.ctx[0];
  }
  set sys(e) {
    this.$$set({ sys: e }), E();
  }
}
re(Ri, { textData: {}, sys: {} }, [], [], !0);
export {
  Ri as default
};
//# sourceMappingURL=components.js.map
