"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
var $n = Object.defineProperty;
var wn = (n, e, t) => e in n ? $n(n, e, { enumerable: true, configurable: true, writable: true, value: t }) : n[e] = t;
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
  return e && e.host ? e : n.ownerDocument;
}
function kn(n) {
  const e = $("style");
  return e.textContent = "/* empty */", In(zt(n), e), e.sheet;
}
function In(n, e) {
  return b(
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
  e = "" + e, n.data !== e && (n.data = e);
}
function Ie(n, e) {
  n.value = e != null ? e : "";
}
function Yt(n, e, t, i) {
  t == null ? n.style.removeProperty(e) : n.style.setProperty(e, t, i ? "important" : "");
}
function Gt(n, e, { bubbles: t = false, cancelable: i = false } = {}) {
  return new CustomEvent(n, { detail: e, bubbles: t, cancelable: i });
}
function On(n) {
  const e = {};
  return n.childNodes.forEach(
    (t) => {
      e[t.slot || "default"] = true;
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
  c[_] || (c[_] = true, h.insertRule(`@keyframes ${_} ${u}`, h.cssRules.length));
  const y = n.style.animation || "";
  return n.style.animation = `${y ? `${y}, ` : ""}${_} ${i}ms linear ${s}ms 1 both`, Ve += 1, _;
}
function Wt(n, e) {
  const t = (n.style.animation || "").split(", "), i = t.filter(
    e ? (a) => a.indexOf(e) < 0 : (a) => a.indexOf("__svelte") === -1
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
    start: o = Ft() + a,
    end: d = o + l,
    tick: u = K,
    css: _
  } = t(n, { from: e, to: s }, i);
  let f = true, h = false, c;
  function y() {
    _ && (c = Ye(n, 0, 1, l, a, r, _)), a || (h = true);
  }
  function p() {
    _ && Wt(n, c), f = false;
  }
  return Jt((v) => {
    if (!h && v >= o && (h = true), h && v >= d && (u(1, 0), p()), !f)
      return false;
    if (h) {
      const C = v - o, m = 0 + 1 * r(C / l);
      u(m, 1 - m);
    }
    return true;
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
  return (e, t, { cancelable: i = false } = {}) => {
    const s = n.$$.callbacks[e];
    if (s) {
      const a = Gt(
        e,
        t,
        { cancelable: i }
      );
      return s.slice().forEach((l) => {
        l.call(n, a);
      }), !a.defaultPrevented;
    }
    return true;
  };
}
function me(n, e) {
  const t = n.$$.callbacks[e.type];
  t && t.slice().forEach((i) => i.call(this, e));
}
const we = [], ne = [];
let ke = [];
const Ge = [], An = /* @__PURE__ */ Promise.resolve();
let We = false;
function Rn() {
  We || (We = true, An.then(E));
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
  We = false, qe.clear(), Ce(n);
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
    const p = c.b - l;
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
    c || (S.group = ce, ce.r += 1), "inert" in n && (c ? u !== void 0 && (n.inert = u) : (u = n.inert, n.inert = true)), r || o ? o = S : (m && (_(), d = Ye(n, l, c, p, y, v, m)), c && C(0, 1), r = f(S, p), ie(() => Je(n, c, "start")), Jt((D) => {
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
    props: a,
    update: K,
    not_equal: s,
    bound: lt(),
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(e.context || (o ? o.$$.context : [])),
    callbacks: lt(),
    dirty: r,
    skip_bound: false,
    root: e.target || o.$$.root
  };
  l && l(d.root);
  let u = false;
  if (d.ctx = t ? t(n, e.props || {}, (_, f, ...h) => {
    const c = h.length ? h[0] : f;
    return d.ctx && s(d.ctx[_], d.ctx[_] = c) && (!d.skip_bound && d.bound[_] && d.bound[_](c), u && Hn(n, _)), f;
  }) : [], d.update(), u = true, Y(d.before_update), d.fragment = i ? i(d.ctx) : false, e.target) {
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
    L(this, "$$ctor");
    L(this, "$$s");
    L(this, "$$c");
    L(this, "$$cn", false);
    L(this, "$$d", {});
    L(this, "$$r", false);
    L(this, "$$p_d", {});
    L(this, "$$l", {});
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
    if (this.$$cn = true, !this.$$c) {
      let e = function(a) {
        return () => {
          let l;
          return {
            c: function() {
              l = $("slot"), a !== "default" && g(l, "name", a);
            },
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
        this.$$r = true;
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
        this.$$r = false;
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
  attributeChangedCallback(e, t, i) {
    var s;
    this.$$r || (e = this.$$g_p(e), this.$$d[e] = Ne(e, i, this.$$p_d, "toProp"), (s = this.$$c) == null || s.$set({ [e]: this.$$d[e] }));
  }
  disconnectedCallback() {
    this.$$cn = false, Promise.resolve().then(() => {
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
        return e != null ? e : null;
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
  }), a && (l = a(l)), n.element = l, l;
}
class oe {
  constructor() {
    L(this, "$$");
    L(this, "$$set");
  }
  $destroy() {
    Q(this, 1), this.$destroy = K;
  }
  $on(e, t) {
    if (!Pe(t))
      return K;
    const i = this.$$.callbacks[e] || (this.$$.callbacks[e] = []);
    return i.push(t), () => {
      const s = i.indexOf(t);
      s !== -1 && i.splice(s, 1);
    };
  }
  $set(e) {
    this.$$set && !Dn(e) && (this.$$.skip_bound = true, this.$$set(e), this.$$.skip_bound = false);
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
  let e, t = (n[0] == null ? n[2] : n[0]) + "", i, s, a, l, r, o;
  return {
    c() {
      var _a, _b, _c;
      e = $("div"), i = G(t), g(e, "class", "GrobSelectLabel effect"), g(e, "data-isdisabled", s = (_a = n[3]) != null ? _a : false), g(e, "data-iserror", a = (_b = n[4]) != null ? _b : false), g(e, "data-selected", l = (_c = n[0]) != null ? _c : false), g(e, "tabindex", "-1");
    },
    m(d, u) {
      B(d, e, u), b(e, i), n[17](e), r || (o = [
        U(
          e,
          "focus",
          n[13]
        ),
        U(
          e,
          "blur",
          n[14]
        )
      ], r = true);
    },
    p(d, u) {
      var _a, _b, _c;
      u & 5 && t !== (t = (d[0] == null ? d[2] : d[0]) + "") && de(i, t), u & 8 && s !== (s = (_a = d[3]) != null ? _a : false) && g(e, "data-isdisabled", s), u & 16 && a !== (a = (_b = d[4]) != null ? _b : false) && g(e, "data-iserror", a), u & 1 && l !== (l = (_c = d[0]) != null ? _c : false) && g(e, "data-selected", l);
    },
    d(d) {
      d && N(e), n[17](null), r = false, Y(o);
    }
  };
}
function ht(n) {
  let e, t, i, s, a, l = [], r = /* @__PURE__ */ new Map(), o, d, u, _, f, h, c = se(
    n[1]
  );
  const y = (v) => v[23];
  for (let v = 0; v < c.length; v += 1) {
    let C = ft(n, c, v), m = y(C);
    r.set(m, l[v] = gt(m, C));
  }
  let p = n[1].length == 0 && _t();
  return {
    c() {
      var _a, _b, _c, _d;
      var v, C, m, S;
      e = $("div"), t = $("div"), i = $("div"), a = j();
      for (let D = 0; D < l.length; D += 1)
        l[D].c();
      o = j(), p && p.c(), d = j(), u = $("div"), g(i, "class", "Arrow"), g(i, "style", s = `left:${n[12]}px`), g(t, "class", "ArrowContainer "), g(u, "class", "selectEndTracker"), g(e, "class", "SelectPopUp"), g(e, "style", _ = "width:" + ((_a = (v = n[7]) == null ? void 0 : v.width) != null ? _a : 100) + "px;left: " + ((_b = (C = n[7]) == null ? void 0 : C.x) != null ? _b : 0) + "px;top: " + (((_c = (m = n[7]) == null ? void 0 : m.y) != null ? _c : 0) + ((_d = (S = n[7]) == null ? void 0 : S.height) != null ? _d : 0) + 8) + "px;max-height:" + n[11] + "px");
    },
    m(v, C) {
      B(v, e, C), b(e, t), b(t, i), n[18](t), b(e, a);
      for (let m = 0; m < l.length; m += 1)
        l[m] && l[m].m(e, null);
      b(e, o), p && p.m(e, null), b(e, d), b(e, u), n[19](u), h = true;
    },
    p(v, C) {
      var _a, _b, _c, _d;
      var m, S, D, A;
      (!h || C & 4096 && s !== (s = `left:${v[12]}px`)) && g(i, "style", s), C & 32771 && (c = se(
        v[1]
      ), l = Ke(l, C, y, 1, v, c, r, e, Un, gt, o, ft)), v[1].length == 0 ? p || (p = _t(), p.c(), p.m(e, d)) : p && (p.d(1), p = null), (!h || C & 2176 && _ !== (_ = "width:" + ((_a = (m = v[7]) == null ? void 0 : m.width) != null ? _a : 100) + "px;left: " + ((_b = (S = v[7]) == null ? void 0 : S.x) != null ? _b : 0) + "px;top: " + (((_c = (D = v[7]) == null ? void 0 : D.y) != null ? _c : 0) + ((_d = (A = v[7]) == null ? void 0 : A.height) != null ? _d : 0) + 8) + "px;max-height:" + v[11] + "px")) && g(e, "style", _);
    },
    i(v) {
      h || (v && ie(() => {
        h && (f || (f = z(e, ae, {}, true)), f.run(1));
      }), h = true);
    },
    o(v) {
      v && (f || (f = z(e, ae, {}, false)), f.run(0)), h = false;
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
  let t, i = e[23] + "", s, a, l, r, o;
  return {
    key: n,
    first: null,
    c() {
      t = $("div"), s = G(i), g(t, "class", "GrobSelectOption"), g(t, "data-selected", a = e[0] == e[23]), g(t, "data-value", l = e[23]), this.first = t;
    },
    m(d, u) {
      B(d, t, u), b(t, s), r || (o = [
        U(
          t,
          "click",
          e[15]
        ),
        U(
          t,
          "keydown",
          e[15]
        )
      ], r = true);
    },
    p(d, u) {
      e = d, u & 2 && i !== (i = e[23] + "") && de(s, i), u & 3 && a !== (a = e[0] == e[23]) && g(t, "data-selected", a), u & 2 && l !== (l = e[23]) && g(t, "data-value", l);
    },
    d(d) {
      d && N(t), r = false, Y(o);
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
  let e, t = n[0], i, s, a = ct(n), l = (n[8] || n[5]) && ht(n);
  return {
    c() {
      e = $("div"), a.c(), i = j(), s = $("div"), l && l.c(), g(e, "class", "GrobSelect");
    },
    m(r, o) {
      B(r, e, o), a.m(e, null), b(e, i), b(e, s), l && l.m(s, null);
    },
    p(r, [o]) {
      o & 1 && te(t, t = r[0]) ? (a.d(1), a = ct(r), a.c(), a.m(e, i)) : a.p(r, o), r[8] || r[5] ? l ? (l.p(r, o), o & 288 && R(l, 1)) : (l = ht(r), l.c(), R(l, 1), l.m(s, null)) : l && (ue(), P(l, 1, 1, () => {
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
  let i = nt(), { options: s } = e, { selected: a = null } = e, { unSelectedplaceholder: l = "None Selected" } = e, { disabled: r = false } = e, { isError: o = false } = e, { forceOpen: d = false } = e, { maxHeight: u = 500 } = e, _, f, h = false, c, y, p = u, v = 0;
  function C() {
    const w = _.getBoundingClientRect();
    t(7, f = w), t(8, h = true), A(), setTimeout(D, zn);
  }
  function m() {
    setTimeout(
      () => {
        t(8, h = false);
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
re(Xt, { options: {}, selected: {}, unSelectedplaceholder: {}, disabled: { type: "Boolean" }, isError: { type: "Boolean" }, forceOpen: { type: "Boolean" }, maxHeight: {} }, [], [], true);
function Gn(n) {
  let e, t, i, s, a;
  return s = new Xt({
    props: {
      options: n[1],
      selected: n[2],
      unSelectedplaceholder: !n[0].type || n[0].type == "NONE" ? "Select View Type" : "Select a new Type "
    }
  }), s.$on(
    "onSelect",
    n[3]
  ), {
    c() {
      e = $("div"), t = $("div"), i = $("div"), X(s.$$.fragment), g(i, "class", "ItemOptionBtn "), g(t, "class", "ItemOptions"), g(e, "class", "ItemOptionsContainer");
    },
    m(l, r) {
      B(l, e, r), b(e, t), b(t, i), W(s, i, null), a = true;
    },
    p(l, [r]) {
      const o = {};
      r & 1 && (o.unSelectedplaceholder = !l[0].type || l[0].type == "NONE" ? "Select View Type" : "Select a new Type "), s.$set(o);
    },
    i(l) {
      a || (R(s.$$.fragment, l), a = true);
    },
    o(l) {
      P(s.$$.fragment, l), a = false;
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
re(Zt, { data: {}, editMode: {} }, [], [], true);
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
    return p[0] ? Zn : p[1] ? Xn : Qn;
  }
  let c = h(n), y = c(n);
  return {
    c() {
      e = $("div"), t = $("div"), t.textContent = "Hit Points", i = j(), s = $("input"), l = j(), r = $("div"), r.textContent = "temporary Hit Points", o = j(), d = $("input"), u = j(), y.c(), g(s, "type", "number"), s.disabled = a = !n[0], g(d, "type", "number");
    },
    m(p, v) {
      B(p, e, v), b(e, t), b(e, i), b(e, s), Ie(
        s,
        n[2]
      ), b(e, l), b(e, r), b(e, o), b(e, d), b(e, u), y.m(e, null), _ || (f = [
        U(
          s,
          "input",
          n[6]
        ),
        U(
          s,
          "change",
          n[3]
        )
      ], _ = true);
    },
    p(p, [v]) {
      v & 1 && a !== (a = !p[0]) && (s.disabled = a), v & 4 && He(s.value) !== p[2] && Ie(
        s,
        p[2]
      ), c !== (c = h(p)) && (y.d(1), y = c(p), y && (y.c(), y.m(e, null)));
    },
    i: K,
    o: K,
    d(p) {
      p && N(e), y.d(), _ = false, Y(f);
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
re(xt, { sys: {}, editMode: {}, playMode: {}, data: {} }, [], [], true);
function ti(n) {
  let e, t, i, s, a, l, r;
  return {
    c() {
      e = $("div"), t = $("div"), t.textContent = "Proficiency Bonus", i = j(), s = $("input"), g(s, "type", "number"), s.disabled = a = !n[0], g(e, "class", "ProficiencyBonus");
    },
    m(o, d) {
      B(o, e, d), b(e, t), b(e, i), b(e, s), Ie(
        s,
        n[1]
      ), l || (r = [
        U(
          s,
          "input",
          n[5]
        ),
        U(
          s,
          "change",
          n[2]
        )
      ], l = true);
    },
    p(o, [d]) {
      d & 1 && a !== (a = !o[0]) && (s.disabled = a), d & 2 && He(s.value) !== o[1] && Ie(
        s,
        o[1]
      );
    },
    i: K,
    o: K,
    d(o) {
      o && N(e), l = false, Y(r);
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
re(en, { sys: {}, editMode: {}, data: {} }, [], [], true);
function ii(n) {
  let e, t, i, s, a, l, r, o, d, u, _, f, h;
  return {
    c() {
      e = $("div"), t = $("div"), i = $("div"), s = j(), a = $("div"), l = $("p"), r = G(
        n[1]
      ), o = j(), d = $("div"), u = $("p"), _ = G(
        n[3]
      ), g(i, "class", "skillproficiencyMark"), g(
        i,
        "data-level",
        n[2]
      ), g(t, "class", "skillproficiencyMarkParent"), g(a, "class", "skillproficiencyMarkName"), g(d, "class", "skillproficiencyMarkValue"), g(e, "class", "skillproficiencyContainer"), g(
        e,
        "data-edit",
        n[0]
      );
    },
    m(c, y) {
      B(c, e, y), b(e, t), b(t, i), b(e, s), b(e, a), b(a, l), b(l, r), b(e, o), b(e, d), b(d, u), b(u, _), f || (h = [
        U(
          i,
          "keyup",
          n[6]
        ),
        U(
          i,
          "click",
          n[4]
        )
      ], f = true);
    },
    p(c, [y]) {
      y & 4 && g(
        i,
        "data-level",
        c[2]
      ), y & 2 && de(
        r,
        c[1]
      ), y & 8 && de(
        _,
        c[3]
      ), y & 1 && g(
        e,
        "data-edit",
        c[0]
      );
    },
    i: K,
    o: K,
    d(c) {
      c && N(e), f = false, Y(h);
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
re(tn, { edit: {}, name: {}, sys: {} }, [], [], true);
function mt(n, e, t) {
  const i = n.slice();
  return i[4] = e[t], i;
}
function pt(n) {
  let e, t;
  return e = new tn({
    props: {
      edit: n[0],
      name: n[4],
      sys: n[1]
    }
  }), {
    c() {
      X(e.$$.fragment);
    },
    m(i, s) {
      W(e, i, s), t = true;
    },
    p(i, s) {
      const a = {};
      s & 1 && (a.edit = i[0]), s & 2 && (a.sys = i[1]), e.$set(a);
    },
    i(i) {
      t || (R(e.$$.fragment, i), t = true);
    },
    o(i) {
      P(e.$$.fragment, i), t = false;
    },
    d(i) {
      Q(e, i);
    }
  };
}
function ai(n) {
  let e, t, i = se(
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
        n[0]
      );
    },
    m(l, r) {
      B(l, e, r);
      for (let o = 0; o < s.length; o += 1)
        s[o] && s[o].m(e, null);
      t = true;
    },
    p(l, [r]) {
      if (r & 7) {
        i = se(
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
      (!t || r & 1) && g(
        e,
        "data-edit",
        l[0]
      );
    },
    i(l) {
      if (!t) {
        for (let r = 0; r < i.length; r += 1)
          R(s[r]);
        t = true;
      }
    },
    o(l) {
      s = s.filter(Boolean);
      for (let r = 0; r < s.length; r += 1)
        P(s[r]);
      t = false;
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
re(nn, { edit: {}, sys: {}, data: {} }, [], [], true);
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
        n[6]
      ), i = true);
    },
    p(r, o) {
      if (o & 5) {
        a = se(Object.keys(
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
      r && N(e), Ze(l, r), n[8](null), i = false, s();
    }
  };
}
function yt(n) {
  let e, t = n[16] + "", i, s, a, l;
  return {
    c() {
      e = $("option"), i = G(t), s = j(), e.__value = a = n[16], Ie(e, e.__value), e.selected = l = n[16] == n[2];
    },
    m(r, o) {
      B(r, e, o), b(e, i), b(e, s);
    },
    p(r, o) {
      o & 1 && t !== (t = r[16] + "") && de(i, t), o & 1 && a !== (a = r[16]) && (e.__value = a, Ie(e, e.__value)), o & 5 && l !== (l = r[16] == r[2]) && (e.selected = l);
    },
    d(r) {
      r && N(e);
    }
  };
}
function di(n) {
  let e, t, i, s, a, l, r, o, d, u, _, f, h, c, y, p, v;
  function C(D, A) {
    return D[1] ? oi : ri;
  }
  let m = C(n), S = m(n);
  return {
    c() {
      e = $("div"), S.c(), t = j(), i = $("div"), s = $("div"), a = G(
        n[2]
      ), l = j(), r = $("div"), o = $("div"), o.textContent = "Spell DC", d = j(), u = $("div"), _ = G(
        n[3]
      ), f = j(), h = $("div"), c = $("div"), c.textContent = "Spell Bonus", y = j(), p = $("div"), v = G(
        n[4]
      ), g(i, "class", "spellDCContainer");
    },
    m(D, A) {
      B(D, e, A), S.m(e, null), b(e, t), b(e, i), b(i, s), b(s, a), b(i, l), b(i, r), b(r, o), b(r, d), b(r, u), b(u, _), b(i, f), b(i, h), b(h, c), b(h, y), b(h, p), b(p, v);
    },
    p(D, [A]) {
      m === (m = C(D)) && S ? S.p(D, A) : (S.d(1), S = m(D), S && (S.c(), S.m(e, t))), A & 4 && de(
        a,
        D[2]
      ), A & 8 && de(
        _,
        D[3]
      ), A & 16 && de(
        v,
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
re(sn, { sys: {}, edit: {}, data: {} }, [], [], true);
function fi(n) {
  let e, t, i, s, a, l, r, o, d, u, _, f, h;
  return {
    c() {
      e = $("div"), t = $("div"), i = G(
        n[0]
      ), s = j(), a = $("div"), l = $("input"), o = j(), d = $("div"), u = $("div"), _ = G(
        n[3]
      ), g(l, "class", "BoxValue"), g(
        l,
        "data-editmode",
        n[1]
      ), l.disabled = r = !n[1], l.value = n[2], g(l, "type", "number"), g(l, "min", "0"), g(l, "max", "100"), g(a, "class", "LargeValue"), g(u, "class", "BoxValue"), g(d, "class", "SmallValue"), g(e, "class", "StatValue");
    },
    m(c, y) {
      B(c, e, y), b(e, t), b(t, i), b(e, s), b(e, a), b(a, l), n[8](l), b(e, o), b(e, d), b(d, u), b(u, _), f || (h = U(
        l,
        "change",
        n[5]
      ), f = true);
    },
    p(c, [y]) {
      y & 1 && de(
        i,
        c[0]
      ), y & 2 && g(
        l,
        "data-editmode",
        c[1]
      ), y & 2 && r !== (r = !c[1]) && (l.disabled = r), y & 4 && l.value !== c[2] && (l.value = c[2]), y & 8 && de(
        _,
        c[3]
      );
    },
    i: K,
    o: K,
    d(c) {
      c && N(e), n[8](null), f = false, h();
    }
  };
}
function ci(n, e, t) {
  let { name: i } = e, { statNode: s } = e, { modNode: a } = e, { editmode: l = false } = e, r = s.getValue(), o = a.getValue();
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
re(an, { name: {}, statNode: {}, modNode: {}, editmode: { type: "Boolean" } }, [], [], true);
function bt(n, e, t) {
  const i = n.slice();
  i[4] = e[t];
  const s = i[2][i[4]];
  i[5] = s;
  const a = i[0].derived.modifiers[i[4]];
  return i[6] = a, i;
}
function $t(n) {
  let e, t;
  return e = new an({
    props: {
      name: n[4],
      statNode: n[5],
      modNode: n[6],
      editmode: n[1]
    }
  }), {
    c() {
      X(e.$$.fragment);
    },
    m(i, s) {
      W(e, i, s), t = true;
    },
    p(i, s) {
      const a = {};
      s & 1 && (a.modNode = i[6]), s & 2 && (a.editmode = i[1]), e.$set(a);
    },
    i(i) {
      t || (R(e.$$.fragment, i), t = true);
    },
    o(i) {
      P(e.$$.fragment, i), t = false;
    },
    d(i) {
      Q(e, i);
    }
  };
}
function hi(n) {
  let e, t, i = se(Object.keys(
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
      t = true;
    },
    p(l, [r]) {
      if (r & 7) {
        i = se(Object.keys(
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
        t = true;
      }
    },
    o(l) {
      s = s.filter(Boolean);
      for (let r = 0; r < s.length; r += 1)
        P(s[r]);
      t = false;
    },
    d(l) {
      l && N(e), Ze(s, l);
    }
  };
}
function gi(n, e, t) {
  let { sys: i } = e, { data: s } = e, { edit: a = false } = e, l = i.fixed.stats;
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
re(ln, { sys: {}, data: {}, edit: { type: "Boolean" } }, [], [], true);
function wt(n) {
  let e, t, i = n[1] && Dt(n), s = n[2] && kt(n);
  return {
    c() {
      e = $("div"), i && i.c(), t = j(), s && s.c(), g(e, "class", "ItemManouverOptions");
    },
    m(a, l) {
      B(a, e, l), i && i.m(e, null), b(e, t), s && s.m(e, null);
    },
    p(a, l) {
      a[1] ? i ? i.p(a, l) : (i = Dt(a), i.c(), i.m(e, t)) : i && (i.d(1), i = null), a[2] ? s ? s.p(a, l) : (s = kt(a), s.c(), s.m(e, null)) : s && (s.d(1), s = null);
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
          n[7]
        ),
        U(
          e,
          "click",
          n[3]
        )
      ], t = true);
    },
    p: K,
    d(s) {
      s && N(e), t = false, Y(i);
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
          n[6]
        ),
        U(
          e,
          "click",
          n[4]
        )
      ], t = true);
    },
    p: K,
    d(s) {
      s && N(e), t = false, Y(i);
    }
  };
}
function _i(n) {
  let e, t = n[0] && wt(n);
  return {
    c() {
      e = $("div"), t && t.c(), g(e, "class", "ItemManouverContainer");
    },
    m(i, s) {
      B(i, e, s), t && t.m(e, null);
    },
    p(i, [s]) {
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
re(rn, { data: {}, editMode: {}, hasUp: {}, hasDown: {} }, [], [], true);
function It(n) {
  let e, t, i;
  function s(l) {
    n[7](l);
  }
  let a = { editMode: true };
  return n[0] !== void 0 && (a.data = n[0]), e = new Zt({ props: a }), ne.push(() => ye(e, "data", s)), e.$on(
    "optionSelected",
    n[6]
  ), {
    c() {
      X(e.$$.fragment);
    },
    m(l, r) {
      W(e, l, r), i = true;
    },
    p(l, r) {
      const o = {};
      !t && r & 1 && (t = true, o.data = l[0], ve(() => t = false)), e.$set(o);
    },
    i(l) {
      i || (R(e.$$.fragment, l), i = true);
    },
    o(l) {
      P(e.$$.fragment, l), i = false;
    },
    d(l) {
      Q(e, l);
    }
  };
}
function St(n) {
  let e, t, i;
  function s(l) {
    n[8](l);
  }
  let a = {
    editMode: n[5],
    hasDown: n[4] != n[3] - 1,
    hasUp: n[4] != 0
  };
  return n[0] !== void 0 && (a.data = n[0]), e = new rn({ props: a }), ne.push(() => ye(e, "data", s)), e.$on(
    "moveUp",
    n[9]
  ), e.$on(
    "moveDown",
    n[10]
  ), {
    c() {
      X(e.$$.fragment);
    },
    m(l, r) {
      W(e, l, r), i = true;
    },
    p(l, r) {
      const o = {};
      r & 32 && (o.editMode = l[5]), r & 24 && (o.hasDown = l[4] != l[3] - 1), r & 16 && (o.hasUp = l[4] != 0), !t && r & 1 && (t = true, o.data = l[0], ve(() => t = false)), e.$set(o);
    },
    i(l) {
      i || (R(e.$$.fragment, l), i = true);
    },
    o(l) {
      P(e.$$.fragment, l), i = false;
    },
    d(l) {
      Q(e, l);
    }
  };
}
function pi(n) {
  let e, t, i, s, a;
  function l(o) {
    n[15](o);
  }
  let r = {
    edit: n[1],
    sys: n[2]
  };
  return n[0] !== void 0 && (r.data = n[0]), t = new ln({ props: r }), ne.push(() => ye(t, "data", l)), t.$on(
    "optionSelected",
    n[6]
  ), {
    c() {
      e = $("div"), X(t.$$.fragment);
    },
    m(o, d) {
      B(o, e, d), W(t, e, null), a = true;
    },
    p(o, d) {
      const u = {};
      d & 2 && (u.edit = o[1]), d & 4 && (u.sys = o[2]), !i && d & 1 && (i = true, u.data = o[0], ve(() => i = false)), t.$set(u);
    },
    i(o) {
      a || (R(t.$$.fragment, o), o && ie(() => {
        a && (s || (s = z(e, ae, {}, true)), s.run(1));
      }), a = true);
    },
    o(o) {
      P(t.$$.fragment, o), o && (s || (s = z(e, ae, {}, false)), s.run(0)), a = false;
    },
    d(o) {
      o && N(e), Q(t), o && s && s.end();
    }
  };
}
function vi(n) {
  let e, t, i, s, a;
  function l(o) {
    n[14](o);
  }
  let r = {
    edit: n[1],
    sys: n[2]
  };
  return n[0] !== void 0 && (r.data = n[0]), t = new sn({ props: r }), ne.push(() => ye(t, "data", l)), t.$on(
    "optionSelected",
    n[6]
  ), {
    c() {
      e = $("div"), X(t.$$.fragment);
    },
    m(o, d) {
      B(o, e, d), W(t, e, null), a = true;
    },
    p(o, d) {
      const u = {};
      d & 2 && (u.edit = o[1]), d & 4 && (u.sys = o[2]), !i && d & 1 && (i = true, u.data = o[0], ve(() => i = false)), t.$set(u);
    },
    i(o) {
      a || (R(t.$$.fragment, o), o && ie(() => {
        a && (s || (s = z(e, ae, {}, true)), s.run(1));
      }), a = true);
    },
    o(o) {
      P(t.$$.fragment, o), o && (s || (s = z(e, ae, {}, false)), s.run(0)), a = false;
    },
    d(o) {
      o && N(e), Q(t), o && s && s.end();
    }
  };
}
function yi(n) {
  let e, t, i, s, a;
  function l(o) {
    n[13](o);
  }
  let r = {
    edit: n[1],
    sys: n[2]
  };
  return n[0] !== void 0 && (r.data = n[0]), t = new nn({ props: r }), ne.push(() => ye(t, "data", l)), t.$on(
    "optionSelected",
    n[6]
  ), {
    c() {
      e = $("div"), X(t.$$.fragment);
    },
    m(o, d) {
      B(o, e, d), W(t, e, null), a = true;
    },
    p(o, d) {
      const u = {};
      d & 2 && (u.edit = o[1]), d & 4 && (u.sys = o[2]), !i && d & 1 && (i = true, u.data = o[0], ve(() => i = false)), t.$set(u);
    },
    i(o) {
      a || (R(t.$$.fragment, o), o && ie(() => {
        a && (s || (s = z(e, ae, {}, true)), s.run(1));
      }), a = true);
    },
    o(o) {
      P(t.$$.fragment, o), o && (s || (s = z(e, ae, {}, false)), s.run(0)), a = false;
    },
    d(o) {
      o && N(e), Q(t), o && s && s.end();
    }
  };
}
function bi(n) {
  let e, t, i, s, a;
  function l(o) {
    n[12](o);
  }
  let r = {
    sys: n[2],
    editMode: n[1]
  };
  return n[0] !== void 0 && (r.data = n[0]), t = new en({ props: r }), ne.push(() => ye(t, "data", l)), t.$on(
    "optionSelected",
    n[6]
  ), {
    c() {
      e = $("div"), X(t.$$.fragment);
    },
    m(o, d) {
      B(o, e, d), W(t, e, null), a = true;
    },
    p(o, d) {
      const u = {};
      d & 4 && (u.sys = o[2]), d & 2 && (u.editMode = o[1]), !i && d & 1 && (i = true, u.data = o[0], ve(() => i = false)), t.$set(u);
    },
    i(o) {
      a || (R(t.$$.fragment, o), o && ie(() => {
        a && (s || (s = z(e, ae, {}, true)), s.run(1));
      }), a = true);
    },
    o(o) {
      P(t.$$.fragment, o), o && (s || (s = z(e, ae, {}, false)), s.run(0)), a = false;
    },
    d(o) {
      o && N(e), Q(t), o && s && s.end();
    }
  };
}
function $i(n) {
  let e, t, i, s, a;
  function l(o) {
    n[11](o);
  }
  let r = {
    sys: n[2],
    editMode: n[1],
    playMode: false
  };
  return n[0] !== void 0 && (r.data = n[0]), t = new xt({ props: r }), ne.push(() => ye(t, "data", l)), t.$on(
    "optionSelected",
    n[6]
  ), {
    c() {
      e = $("div"), X(t.$$.fragment);
    },
    m(o, d) {
      B(o, e, d), W(t, e, null), a = true;
    },
    p(o, d) {
      const u = {};
      d & 4 && (u.sys = o[2]), d & 2 && (u.editMode = o[1]), !i && d & 1 && (i = true, u.data = o[0], ve(() => i = false)), t.$set(u);
    },
    i(o) {
      a || (R(t.$$.fragment, o), o && ie(() => {
        a && (s || (s = z(e, ae, {}, true)), s.run(1));
      }), a = true);
    },
    o(o) {
      P(t.$$.fragment, o), o && (s || (s = z(e, ae, {}, false)), s.run(0)), a = false;
    },
    d(o) {
      o && N(e), Q(t), o && s && s.end();
    }
  };
}
function wi(n) {
  let e, t, i, s, a, l, r = n[1] && It(n), o = n[3] != 1 && St(n);
  const d = [
    $i,
    bi,
    yi,
    vi,
    pi
  ], u = [];
  function _(f, h) {
    return f[0].type == _e.HitPoints ? 0 : f[0].type == _e.ProficiencyBonus ? 1 : f[0].type == _e.SkillProficiencies ? 2 : f[0].type == _e.SpellInfo ? 3 : f[0].type == _e.Stats ? 4 : -1;
  }
  return ~(s = _(n)) && (a = u[s] = d[s](n)), {
    c() {
      e = $("div"), r && r.c(), t = j(), o && o.c(), i = j(), a && a.c();
    },
    m(f, h) {
      B(f, e, h), r && r.m(e, null), b(e, t), o && o.m(e, null), b(e, i), ~s && u[s].m(e, null), l = true;
    },
    p(f, [h]) {
      f[1] ? r ? (r.p(f, h), h & 2 && R(r, 1)) : (r = It(f), r.c(), R(r, 1), r.m(e, t)) : r && (ue(), P(r, 1, 1, () => {
        r = null;
      }), fe()), f[3] != 1 ? o ? (o.p(f, h), h & 8 && R(o, 1)) : (o = St(f), o.c(), R(o, 1), o.m(e, i)) : o && (ue(), P(o, 1, 1, () => {
        o = null;
      }), fe());
      let c = s;
      s = _(f), s === c ? ~s && u[s].p(f, h) : (a && (ue(), P(u[c], 1, 1, () => {
        u[c] = null;
      }), fe()), ~s ? (a = u[s], a ? a.p(f, h) : (a = u[s] = d[s](f), a.c()), R(a, 1), a.m(e, null)) : a = null);
    },
    i(f) {
      l || (R(r), R(o), R(a), l = true);
    },
    o(f) {
      P(r), P(o), P(a), l = false;
    },
    d(f) {
      f && N(e), r && r.d(), o && o.d(), ~s && u[s].d();
    }
  };
}
function Di(n, e, t) {
  let { data: i } = e, { editMode: s } = e, { sys: a } = e, { length: l } = e, { index: r } = e, { layoutMode: o = false } = e;
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
re(on, { data: {}, editMode: {}, sys: {}, length: {}, index: {}, layoutMode: { type: "Boolean" } }, [], [], true);
function at(n, e, t) {
  return n.style.animation && (n.style = null), qn(n, e, t != null ? t : { duration: 500 });
}
function Mt(n) {
  let e, t, i, s, a = n[4] && Ot(n), l = n[3] && Ct(n);
  return {
    c() {
      e = $("div"), a && a.c(), t = j(), l && l.c(), g(e, "class", "RowColumnOptions"), g(
        e,
        "style",
        n[5]
      );
    },
    m(r, o) {
      B(r, e, o), a && a.m(e, null), b(e, t), l && l.m(e, null), s = true;
    },
    p(r, o) {
      r[4] ? a ? a.p(r, o) : (a = Ot(r), a.c(), a.m(e, t)) : a && (a.d(1), a = null), r[3] ? l ? l.p(r, o) : (l = Ct(r), l.c(), l.m(e, null)) : l && (l.d(1), l = null);
    },
    i(r) {
      s || (r && ie(() => {
        s && (i || (i = z(e, ae, {}, true)), i.run(1));
      }), s = true);
    },
    o(r) {
      r && (i || (i = z(e, ae, {}, false)), i.run(0)), s = false;
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
        n[1]
      ), g(e, "class", "itemOption");
    },
    m(a, l) {
      B(a, e, l), b(e, t), i || (s = [
        U(
          e,
          "keyup",
          n[10]
        ),
        U(
          e,
          "click",
          n[11]
        )
      ], i = true);
    },
    p(a, l) {
      l & 2 && de(
        t,
        a[1]
      );
    },
    d(a) {
      a && N(e), i = false, Y(s);
    }
  };
}
function Ct(n) {
  let e, t, i, s;
  return {
    c() {
      e = $("div"), t = G(
        n[2]
      ), g(e, "class", "itemOption rem");
    },
    m(a, l) {
      B(a, e, l), b(e, t), i || (s = [
        U(
          e,
          "keyup",
          n[9]
        ),
        U(
          e,
          "click",
          n[12]
        )
      ], i = true);
    },
    p(a, l) {
      l & 4 && de(
        t,
        a[2]
      );
    },
    d(a) {
      a && N(e), i = false, Y(s);
    }
  };
}
function ki(n) {
  let e, t = n[0] && Mt(n);
  return {
    c() {
      t && t.c(), e = Sn();
    },
    m(i, s) {
      t && t.m(i, s), B(i, e, s);
    },
    p(i, [s]) {
      i[0] ? t ? (t.p(i, s), s & 1 && R(t, 1)) : (t = Mt(i), t.c(), R(t, 1), t.m(e.parentNode, e)) : t && (ue(), P(t, 1, 1, () => {
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
re(pe, { active: {}, addText: {}, remText: {}, offset: {}, side: {}, verti: {}, onRemove: {}, onAdd: {} }, [], [], true);
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
    return n[22](
      n[43],
      n[46]
    );
  }
  return e = new pe({
    props: {
      offset: 15,
      active: n[3],
      remText: "remove this column",
      onRemove: i
    }
  }), {
    c() {
      X(e.$$.fragment);
    },
    m(s, a) {
      W(e, s, a), t = true;
    },
    p(s, a) {
      n = s;
      const l = {};
      a[0] & 8 && (l.active = n[3]), a[0] & 32 && (l.onRemove = i), e.$set(l);
    },
    i(s) {
      t || (R(e.$$.fragment, s), t = true);
    },
    o(s) {
      P(e.$$.fragment, s), t = false;
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
    return e[24](
      e[46],
      e[49]
    );
  }
  i = new pe({
    props: {
      offset: 15,
      active: e[4],
      addText: "remove",
      onRemove: y
    }
  }), a = new on({
    props: {
      data: e[49],
      editMode: e[1],
      layoutMode: e[4],
      sys: e[0],
      length: e[46].data.length,
      index: e[51]
    }
  }), a.$on(
    "moveUp",
    e[25]
  ), a.$on(
    "moveDown",
    e[26]
  );
  function p(...S) {
    return e[27](
      e[49],
      ...S
    );
  }
  function v(...S) {
    return e[28](
      e[49],
      ...S
    );
  }
  function C(...S) {
    return e[29](
      e[49],
      ...S
    );
  }
  function m(...S) {
    return e[30](
      e[49],
      ...S
    );
  }
  return {
    key: n,
    first: null,
    c() {
      t = $("div"), X(i.$$.fragment), s = j(), X(a.$$.fragment), g(t, "class", "Item"), g(t, "data-edit", l = e[1] || e[4] || e[3]), g(t, "data-itemid", r = e[49].id), g(
        t,
        "data-edit-active",
        e[4]
      ), g(t, "data-dragging", o = e[14].isBeingDragged(
        e[49].id
      )), g(
        t,
        "draggable",
        e[4]
      ), this.first = t;
    },
    m(S, D) {
      B(S, t, D), W(i, t, null), b(t, s), W(a, t, null), f = true, h || (c = [
        U(t, "dragstart", p),
        U(t, "dragend", v),
        U(t, "drop", C),
        U(t, "dragleave", m),
        U(t, "dragover", Ei)
      ], h = true);
    },
    p(S, D) {
      e = S;
      const A = {};
      D[0] & 16 && (A.active = e[4]), D[0] & 32 && (A.onRemove = y), i.$set(A);
      const H = {};
      D[0] & 32 && (H.data = e[49]), D[0] & 2 && (H.editMode = e[1]), D[0] & 16 && (H.layoutMode = e[4]), D[0] & 1 && (H.sys = e[0]), D[0] & 32 && (H.length = e[46].data.length), D[0] & 32 && (H.index = e[51]), a.$set(H), (!f || D[0] & 26 && l !== (l = e[1] || e[4] || e[3])) && g(t, "data-edit", l), (!f || D[0] & 32 && r !== (r = e[49].id)) && g(t, "data-itemid", r), (!f || D[0] & 16) && g(
        t,
        "data-edit-active",
        e[4]
      ), (!f || D[0] & 32 && o !== (o = e[14].isBeingDragged(
        e[49].id
      ))) && g(t, "data-dragging", o), (!f || D[0] & 16) && g(
        t,
        "draggable",
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
        f && (d || (d = z(t, Te, { duration: he }, true)), d.run(1));
      }), f = true);
    },
    o(S) {
      P(i.$$.fragment, S), P(a.$$.fragment, S), S && (d || (d = z(t, Te, { duration: he }, false)), d.run(0)), f = false;
    },
    d(S) {
      S && N(t), Q(i), Q(a), S && d && d.end(), h = false, Y(c);
    }
  };
}
function Vt(n, e) {
  let t, i, s, a, l, r = [], o = /* @__PURE__ */ new Map(), d, u, _, f, h, c, y = K, p, v, C, m = e[43].data.length > 1 && Rt(e);
  function S() {
    return e[23](
      e[46]
    );
  }
  s = new pe({
    props: {
      offset: 15,
      active: e[4],
      addText: "add a new Item",
      onAdd: S
    }
  });
  let D = (e[4] || e[3]) && Nt(), A = se(
    e[46].data
  );
  const H = (O) => O[49].id;
  for (let O = 0; O < A.length; O += 1) {
    let k = At(e, A, O), T = H(k);
    o.set(T, r[O] = Bt(T, k));
  }
  function J(...O) {
    return e[31](
      e[46],
      ...O
    );
  }
  function M(...O) {
    return e[32](
      e[46],
      ...O
    );
  }
  function w(...O) {
    return e[33](
      e[46],
      ...O
    );
  }
  function F(...O) {
    return e[34](
      e[46],
      ...O
    );
  }
  function Z(...O) {
    return e[35](
      e[46],
      ...O
    );
  }
  function x(...O) {
    return e[36](
      e[46],
      ...O
    );
  }
  return {
    key: n,
    first: null,
    c() {
      t = $("div"), m && m.c(), i = j(), X(s.$$.fragment), a = j(), D && D.c(), l = j();
      for (let O = 0; O < r.length; O += 1)
        r[O].c();
      g(t, "class", "Column"), g(t, "data-edit", d = e[3] || e[2]), g(
        t,
        "data-editpreview",
        e[4]
      ), g(t, "data-itemid", u = e[46].id), g(
        t,
        "data-edit-active",
        e[3]
      ), g(t, "data-dragging", _ = e[13].isBeingDragged(
        e[46].id
      )), g(t, "style", f = `
						${e[3] || e[2] ? "margin-bottom:60px" : ""}
					`), g(
        t,
        "draggable",
        e[3]
      ), this.first = t;
    },
    m(O, k) {
      B(O, t, k), m && m.m(t, null), b(t, i), W(s, t, null), b(t, a), D && D.m(t, null), b(t, l);
      for (let T = 0; T < r.length; T += 1)
        r[T] && r[T].m(t, null);
      p = true, v || (C = [
        U(t, "dragstart", J),
        U(t, "dragenter", M),
        U(t, "dragend", w),
        U(t, "drop", F),
        U(t, "dragleave", Z),
        U(t, "dragover", x)
      ], v = true);
    },
    p(O, k) {
      e = O, e[43].data.length > 1 ? m ? (m.p(e, k), k[0] & 32 && R(m, 1)) : (m = Rt(e), m.c(), R(m, 1), m.m(t, i)) : m && (ue(), P(m, 1, 1, () => {
        m = null;
      }), fe());
      const T = {};
      if (k[0] & 16 && (T.active = e[4]), k[0] & 32 && (T.onAdd = S), s.$set(T), e[4] || e[3] ? D || (D = Nt(), D.c(), D.m(t, l)) : D && (D.d(1), D = null), k[0] & 19515) {
        A = se(
          e[46].data
        ), ue();
        for (let q = 0; q < r.length; q += 1)
          r[q].r();
        r = Ke(r, k, H, 1, e, A, o, t, it, Bt, null, At);
        for (let q = 0; q < r.length; q += 1)
          r[q].a();
        fe();
      }
      (!p || k[0] & 12 && d !== (d = e[3] || e[2])) && g(t, "data-edit", d), (!p || k[0] & 16) && g(
        t,
        "data-editpreview",
        e[4]
      ), (!p || k[0] & 32 && u !== (u = e[46].id)) && g(t, "data-itemid", u), (!p || k[0] & 8) && g(
        t,
        "data-edit-active",
        e[3]
      ), (!p || k[0] & 32 && _ !== (_ = e[13].isBeingDragged(
        e[46].id
      ))) && g(t, "data-dragging", _), (!p || k[0] & 12 && f !== (f = `
						${e[3] || e[2] ? "margin-bottom:60px" : ""}
					`)) && g(t, "style", f), (!p || k[0] & 8) && g(
        t,
        "draggable",
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
          p && (h || (h = z(t, Te, { duration: he }, true)), h.run(1));
        }), p = true;
      }
    },
    o(O) {
      P(m), P(s.$$.fragment, O);
      for (let k = 0; k < r.length; k += 1)
        P(r[k]);
      O && (h || (h = z(t, Te, { duration: he }, false)), h.run(0)), p = false;
    },
    d(O) {
      O && N(t), m && m.d(), Q(s), D && D.d();
      for (let k = 0; k < r.length; k += 1)
        r[k].d();
      O && h && h.end(), v = false, Y(C);
    }
  };
}
function Tt(n, e) {
  let t, i, s, a, l, r = [], o = /* @__PURE__ */ new Map(), d, u, _, f, h = K, c, y, p;
  function v() {
    return e[20](
      e[43]
    );
  }
  i = new pe({
    props: {
      active: e[3],
      onAdd: v,
      addText: "add Column"
    }
  });
  function C() {
    return e[21](
      e[43]
    );
  }
  a = new pe({
    props: {
      active: e[2],
      onRemove: C,
      remText: "remove this line"
    }
  });
  let m = se(
    e[43].data
  );
  const S = (M) => M[46].id;
  for (let M = 0; M < m.length; M += 1) {
    let w = Et(e, m, M), F = S(w);
    o.set(F, r[M] = Vt(F, w));
  }
  function D(...M) {
    return e[37](
      e[43],
      ...M
    );
  }
  function A(...M) {
    return e[38](
      e[43],
      ...M
    );
  }
  function H(...M) {
    return e[39](
      e[43],
      ...M
    );
  }
  function J(...M) {
    return e[40](
      e[43],
      ...M
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
        e[2]
      ), g(
        t,
        "data-edit-active",
        e[2]
      ), g(
        t,
        "data-editpreview",
        e[3]
      ), g(t, "style", d = `grid-template-columns:${Pt(
        e[43].data.length,
        "1fr"
      )}`), g(t, "data-rowid", u = e[43].id), g(
        t,
        "draggable",
        e[2]
      ), this.first = t;
    },
    m(M, w) {
      B(M, t, w), W(i, t, null), b(t, s), W(a, t, null), b(t, l);
      for (let F = 0; F < r.length; F += 1)
        r[F] && r[F].m(t, null);
      c = true, y || (p = [
        U(t, "dragstart", D),
        U(t, "dragenter", A),
        U(t, "dragend", H),
        U(t, "dragover", J)
      ], y = true);
    },
    p(M, w) {
      e = M;
      const F = {};
      w[0] & 8 && (F.active = e[3]), w[0] & 32 && (F.onAdd = v), i.$set(F);
      const Z = {};
      if (w[0] & 4 && (Z.active = e[2]), w[0] & 32 && (Z.onRemove = C), a.$set(Z), w[0] & 27711) {
        m = se(
          e[43].data
        ), ue();
        for (let x = 0; x < r.length; x += 1)
          r[x].r();
        r = Ke(r, w, S, 1, e, m, o, t, it, Vt, null, Et);
        for (let x = 0; x < r.length; x += 1)
          r[x].a();
        fe();
      }
      (!c || w[0] & 4) && g(
        t,
        "data-edit",
        e[2]
      ), (!c || w[0] & 4) && g(
        t,
        "data-edit-active",
        e[2]
      ), (!c || w[0] & 8) && g(
        t,
        "data-editpreview",
        e[3]
      ), (!c || w[0] & 32 && d !== (d = `grid-template-columns:${Pt(
        e[43].data.length,
        "1fr"
      )}`)) && g(t, "style", d), (!c || w[0] & 32 && u !== (u = e[43].id)) && g(t, "data-rowid", u), (!c || w[0] & 4) && g(
        t,
        "draggable",
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
          c && (_ || (_ = z(t, ut, { duration: he, y: 100 }, true)), _.run(1));
        }), c = true;
      }
    },
    o(M) {
      P(i.$$.fragment, M), P(a.$$.fragment, M);
      for (let w = 0; w < r.length; w += 1)
        P(r[w]);
      M && (_ || (_ = z(t, ut, { duration: he, y: 100 }, false)), _.run(0)), c = false;
    },
    d(M) {
      M && N(t), Q(i), Q(a);
      for (let w = 0; w < r.length; w += 1)
        r[w].d();
      M && _ && _.end(), y = false, Y(p);
    }
  };
}
function Ut(n) {
  let e, t, i;
  return t = new pe({
    props: {
      active: n[2],
      onAdd: n[41],
      offset: 15,
      addText: "add Line"
    }
  }), {
    c() {
      e = $("div"), X(t.$$.fragment), g(e, "class", "Row"), Yt(e, "height", "100px");
    },
    m(s, a) {
      B(s, e, a), W(t, e, null), i = true;
    },
    p(s, a) {
      const l = {};
      a[0] & 4 && (l.active = s[2]), a[0] & 32 && (l.onAdd = s[41]), t.$set(l);
    },
    i(s) {
      i || (R(t.$$.fragment, s), i = true);
    },
    o(s) {
      P(t.$$.fragment, s), i = false;
    },
    d(s) {
      s && N(e), Q(t);
    }
  };
}
function Si(n) {
  let e, t, i, s, a, l = "Stop Edit	", r, o, d, u = "Layout Row	", _, f, h, c = "Layout Col	", y, p, v, C = "Layout Items", m, S, D, A = [], H = /* @__PURE__ */ new Map(), J, M, w, F, Z = se(
    n[5].data
  );
  const x = (k) => k[43].id;
  for (let k = 0; k < Z.length; k += 1) {
    let T = Lt(n, Z, k), q = x(T);
    H.set(q, A[k] = Tt(q, T));
  }
  let O = n[2] && Ut(n);
  return {
    c() {
      e = $("div"), t = $("div"), i = $("div"), s = $("div"), a = $("button"), r = G(l), o = j(), d = $("button"), _ = G(u), f = j(), h = $("button"), y = G(c), p = j(), v = $("button"), m = G(C), D = j();
      for (let k = 0; k < A.length; k += 1)
        A[k].c();
      J = j(), O && O.c(), g(
        a,
        "data-active",
        n[1]
      ), g(
        d,
        "data-active",
        n[2]
      ), g(
        h,
        "data-active",
        n[3]
      ), g(
        v,
        "data-active",
        n[4]
      ), g(s, "class", "SheetEditorMenu"), g(s, "data-isopen", S = n[1] || n[2] || n[3] || n[4]), g(i, "class", "SheetEditorMenuContainer"), g(t, "class", "Sheet "), g(e, "class", "theme-light obsidianBody");
    },
    m(k, T) {
      B(k, e, T), b(e, t), b(t, i), b(i, s), b(s, a), b(a, r), b(s, o), b(s, d), b(d, _), b(s, f), b(s, h), b(h, y), b(s, p), b(s, v), b(v, m), b(t, D);
      for (let q = 0; q < A.length; q += 1)
        A[q] && A[q].m(t, null);
      b(t, J), O && O.m(t, null), M = true, w || (F = [
        U(
          a,
          "click",
          n[16]
        ),
        U(
          d,
          "click",
          n[17]
        ),
        U(
          h,
          "click",
          n[18]
        ),
        U(
          v,
          "click",
          n[19]
        )
      ], w = true);
    },
    p(k, T) {
      if ((!M || T[0] & 2) && g(
        a,
        "data-active",
        k[1]
      ), (!M || T[0] & 4) && g(
        d,
        "data-active",
        k[2]
      ), (!M || T[0] & 8) && g(
        h,
        "data-active",
        k[3]
      ), (!M || T[0] & 16) && g(
        v,
        "data-active",
        k[4]
      ), (!M || T[0] & 30 && S !== (S = k[1] || k[2] || k[3] || k[4])) && g(s, "data-isopen", S), T[0] & 31807) {
        Z = se(
          k[5].data
        ), ue();
        for (let q = 0; q < A.length; q += 1)
          A[q].r();
        A = Ke(A, T, x, 1, k, Z, H, t, it, Tt, J, Lt);
        for (let q = 0; q < A.length; q += 1)
          A[q].a();
        fe();
      }
      k[2] ? O ? (O.p(k, T), T[0] & 4 && R(O, 1)) : (O = Ut(k), O.c(), R(O, 1), O.m(t, null)) : O && (ue(), P(O, 1, 1, () => {
        O = null;
      }), fe());
    },
    i(k) {
      if (!M) {
        for (let T = 0; T < Z.length; T += 1)
          R(A[T]);
        R(O), M = true;
      }
    },
    o(k) {
      for (let T = 0; T < A.length; T += 1)
        P(A[T]);
      P(O), M = false;
    },
    d(k) {
      k && N(e);
      for (let T = 0; T < A.length; T += 1)
        A[T].d();
      O && O.d(), w = false, Y(F);
    }
  };
}
const Ue = 220, he = 100;
class Mi {
  constructor(e, t) {
    L(this, "data");
    L(this, "state");
    L(this, "layerActive");
    L(this, "isDragging", false);
    L(this, "pauseDragg", false);
    L(this, "dragID");
    L(this, "targetID");
    this.data = e, this.state = t, this.layerActive = t.editLayout_01;
  }
  moveRow() {
    this.isDragging && (!this.dragID || !this.targetID || this.targetID == this.dragID || this.data.update((e) => {
      let t = this.findIndexOfID(this.dragID), i = this.findIndexOfID(this.targetID);
      const s = e.data[t];
      return this.pauseDragg = true, setTimeout(
        () => {
          this.pauseDragg = false;
        },
        Ue
      ), e.data[t] = e.data[i], e.data[i] = s, e;
    }));
  }
  onDragStart(e, t) {
    if (!ee(this.layerActive))
      return;
    const i = e.target;
    i.classList.contains("Row") && (this.isDragging = true, this.dragID = t, i.setAttribute("data-dragging", "true"));
  }
  onDragOver(e, t) {
    ee(this.layerActive) && (!this.isDragging || this.pauseDragg || (this.targetID = t, this.moveRow()));
  }
  onDragEnd(e, t) {
    if (!ee(this.layerActive))
      return;
    this.isDragging = false, this.dragID = null, this.targetID = null, e.target.setAttribute("data-dragging", "false");
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
    L(this, "isDragging", false);
    L(this, "pauseDragg", false);
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
    this.isDragging && (!this.dragID || this.targetID == this.dragID || this.data.update((e) => this.dragID == this.lastDragId && this.targetID == this.lasttargId ? (this.innerMoveItem(e, this.lasttargId, this.lastDragId), e) : (this.lastDragId && this.lasttargId && this.innerMoveItem(e, this.lastDragId, this.lasttargId), this.targetID && this.innerMoveItem(e, this.dragID, this.targetID), this.lastDragId = this.dragID, this.lasttargId = this.targetID, this.pauseDragg = true, setTimeout(
      () => {
        this.pauseDragg = false;
      },
      Ue
    ), e)));
  }
  onDragStart(e, t) {
    if (!ee(this.layerActive))
      return;
    const i = e.target;
    i.classList.contains("Column") && (this.dragTargetElement = i, this.isDragging = true, this.dragID = t, this.lastDragId = null, this.lasttargId = null, i.setAttribute("data-dragging", "true"));
  }
  onDragOver(e, t) {
    var i;
    ee(this.layerActive) && (!this.isDragging || this.pauseDragg || (this.targetID = t, this.moveRowItem(), (i = this.dragTargetElement) == null || i.setAttribute("data-dragging", "true")));
  }
  onDragEnd(e, t) {
    var i;
    ee(this.layerActive) && (this.isDragging = false, this.dragID = null, this.targetID = null, e.target.setAttribute("data-dragging", "false"), (i = this.dragTargetElement) == null || i.setAttribute("data-dragging", "false"));
  }
  onLeave(e, t) {
    this.targetID = null;
  }
  findRowIndexOfID(e) {
    let t = -1;
    return [ee(this.data).data.findIndex((s) => {
      let a = s.data.findIndex((l) => l.id == e);
      return a != -1 ? (t = a, true) : false;
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
    L(this, "isDragging", false);
    L(this, "pauseDragg", false);
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
    this.isDragging && (!this.dragID || this.targetID == this.dragID || this.targetRowId && this.data.update((e) => (this.targetRowId && this.innerMoveItem(e, this.dragID, this.targetRowId), this.lastDragId = this.dragID, this.lasttargId = this.targetID, this.lasttargRowId = null, this.pauseDragg = true, setTimeout(
      () => {
        this.pauseDragg = false;
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
      return i.data[s].data[a].data.splice(r, 0, o), this.pauseDragg = true, setTimeout(
        () => {
          this.pauseDragg = false;
        },
        Ue
      ), i;
    });
  }
  onDragStart(e, t) {
    if (!ee(this.layerActive))
      return;
    const i = e.target;
    i.classList.contains("Item") && (this.dragTargetElement = i, this.isDragging = true, this.dragID = t, this.lastDragId = null, this.lasttargId = null, i.setAttribute("data-dragging", "true"));
  }
  onDragOverColumn(e, t) {
    var i;
    ee(this.layerActive) && (!this.isDragging || this.pauseDragg || (this.targetID = null, this.targetRowId = t, this.moveRowItem(), (i = this.dragTargetElement) == null || i.setAttribute("data-dragging", "true")));
  }
  onDragEnd(e, t) {
    var i;
    ee(this.layerActive) && (this.isDragging = false, this.dragID = null, this.targetID = null, e.target.setAttribute("data-dragging", "false"), (i = this.dragTargetElement) == null || i.setAttribute("data-dragging", "false"));
  }
  onLeave(e, t) {
    this.targetID = null;
  }
  findIndexsOfID(e) {
    let t = -1, i = -1, s = -1;
    return s = ee(this.data).data.findIndex((l) => {
      let r = l.data.findIndex((o) => {
        let d = o.data.findIndex((u) => u.id == e);
        return d != -1 ? (t = d, true) : false;
      });
      return r != -1 ? (i = r, true) : false;
    }), [s, i, t];
  }
  findColumnIndexsOfID(e) {
    let t = -1, i = -1;
    return i = ee(this.data).data.findIndex((a) => {
      let l = a.data.findIndex((r) => r.id == e);
      return l != -1 ? (t = l, true) : false;
    }), [i, t];
  }
  isBeingDragged(e) {
    return this.dragID == e;
  }
}
class Li {
  constructor() {
    L(this, "editMode", Oe(false));
    L(this, "editLayout_01", Oe(false));
    L(this, "editLayout_02", Oe(false));
    L(this, "editLayout_03", Oe(false));
    this.editMode.subscribe((e) => {
      e && (this.editLayout_01.set(false), this.editLayout_02.set(false), this.editLayout_03.set(false));
    }), this.editLayout_01.subscribe((e) => {
      e && (this.editLayout_02.set(false), this.editLayout_03.set(false), this.editMode.set(false));
    }), this.editLayout_02.subscribe((e) => {
      e && (this.editLayout_01.set(false), this.editLayout_03.set(false), this.editMode.set(false));
    }), this.editLayout_03.subscribe((e) => {
      e && (this.editLayout_01.set(false), this.editLayout_02.set(false), this.editMode.set(false));
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
re(Ri, { textData: {}, sys: {} }, [], [], true);
exports.default = Ri;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50cy40ODc1MWQ2NC5janMiLCJzb3VyY2VzIjpbIlN5c3RlbXMvZ3JvYmF4MS9VSUxheW91dHMvZGVmYXVsdC9jb21wb25lbnRzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciAkbiA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcbnZhciB3biA9IChuLCBlLCB0KSA9PiBlIGluIG4gPyAkbihuLCBlLCB7IGVudW1lcmFibGU6ICEwLCBjb25maWd1cmFibGU6ICEwLCB3cml0YWJsZTogITAsIHZhbHVlOiB0IH0pIDogbltlXSA9IHQ7XG52YXIgTCA9IChuLCBlLCB0KSA9PiAod24obiwgdHlwZW9mIGUgIT0gXCJzeW1ib2xcIiA/IGUgKyBcIlwiIDogZSwgdCksIHQpO1xuZnVuY3Rpb24gSygpIHtcbn1cbmNvbnN0IFFlID0gKG4pID0+IG47XG5mdW5jdGlvbiBIdChuKSB7XG4gIHJldHVybiBuKCk7XG59XG5mdW5jdGlvbiBsdCgpIHtcbiAgcmV0dXJuIC8qIEBfX1BVUkVfXyAqLyBPYmplY3QuY3JlYXRlKG51bGwpO1xufVxuZnVuY3Rpb24gWShuKSB7XG4gIG4uZm9yRWFjaChIdCk7XG59XG5mdW5jdGlvbiBQZShuKSB7XG4gIHJldHVybiB0eXBlb2YgbiA9PSBcImZ1bmN0aW9uXCI7XG59XG5mdW5jdGlvbiB0ZShuLCBlKSB7XG4gIHJldHVybiBuICE9IG4gPyBlID09IGUgOiBuICE9PSBlIHx8IG4gJiYgdHlwZW9mIG4gPT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgbiA9PSBcImZ1bmN0aW9uXCI7XG59XG5mdW5jdGlvbiBEbihuKSB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhuKS5sZW5ndGggPT09IDA7XG59XG5mdW5jdGlvbiBqdChuLCAuLi5lKSB7XG4gIGlmIChuID09IG51bGwpIHtcbiAgICBmb3IgKGNvbnN0IGkgb2YgZSlcbiAgICAgIGkodm9pZCAwKTtcbiAgICByZXR1cm4gSztcbiAgfVxuICBjb25zdCB0ID0gbi5zdWJzY3JpYmUoLi4uZSk7XG4gIHJldHVybiB0LnVuc3Vic2NyaWJlID8gKCkgPT4gdC51bnN1YnNjcmliZSgpIDogdDtcbn1cbmZ1bmN0aW9uIGVlKG4pIHtcbiAgbGV0IGU7XG4gIHJldHVybiBqdChuLCAodCkgPT4gZSA9IHQpKCksIGU7XG59XG5mdW5jdGlvbiBTZShuLCBlLCB0KSB7XG4gIG4uJCQub25fZGVzdHJveS5wdXNoKGp0KGUsIHQpKTtcbn1cbmZ1bmN0aW9uIHJ0KG4pIHtcbiAgY29uc3QgZSA9IHR5cGVvZiBuID09IFwic3RyaW5nXCIgJiYgbi5tYXRjaCgvXlxccyooLT9bXFxkLl0rKShbXlxcc10qKVxccyokLyk7XG4gIHJldHVybiBlID8gW3BhcnNlRmxvYXQoZVsxXSksIGVbMl0gfHwgXCJweFwiXSA6IFtcbiAgICAvKiogQHR5cGUge251bWJlcn0gKi9cbiAgICBuLFxuICAgIFwicHhcIlxuICBdO1xufVxuY29uc3QgS3QgPSB0eXBlb2Ygd2luZG93IDwgXCJ1XCI7XG5sZXQgRnQgPSBLdCA/ICgpID0+IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKSA6ICgpID0+IERhdGUubm93KCksIFhlID0gS3QgPyAobikgPT4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKG4pIDogSztcbmNvbnN0IERlID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTtcbmZ1bmN0aW9uIHF0KG4pIHtcbiAgRGUuZm9yRWFjaCgoZSkgPT4ge1xuICAgIGUuYyhuKSB8fCAoRGUuZGVsZXRlKGUpLCBlLmYoKSk7XG4gIH0pLCBEZS5zaXplICE9PSAwICYmIFhlKHF0KTtcbn1cbmZ1bmN0aW9uIEp0KG4pIHtcbiAgbGV0IGU7XG4gIHJldHVybiBEZS5zaXplID09PSAwICYmIFhlKHF0KSwge1xuICAgIHByb21pc2U6IG5ldyBQcm9taXNlKCh0KSA9PiB7XG4gICAgICBEZS5hZGQoZSA9IHsgYzogbiwgZjogdCB9KTtcbiAgICB9KSxcbiAgICBhYm9ydCgpIHtcbiAgICAgIERlLmRlbGV0ZShlKTtcbiAgICB9XG4gIH07XG59XG5mdW5jdGlvbiBiKG4sIGUpIHtcbiAgbi5hcHBlbmRDaGlsZChlKTtcbn1cbmZ1bmN0aW9uIHp0KG4pIHtcbiAgaWYgKCFuKVxuICAgIHJldHVybiBkb2N1bWVudDtcbiAgY29uc3QgZSA9IG4uZ2V0Um9vdE5vZGUgPyBuLmdldFJvb3ROb2RlKCkgOiBuLm93bmVyRG9jdW1lbnQ7XG4gIHJldHVybiBlICYmIC8qKiBAdHlwZSB7U2hhZG93Um9vdH0gKi9cbiAgZS5ob3N0ID8gKFxuICAgIC8qKiBAdHlwZSB7U2hhZG93Um9vdH0gKi9cbiAgICBlXG4gICkgOiBuLm93bmVyRG9jdW1lbnQ7XG59XG5mdW5jdGlvbiBrbihuKSB7XG4gIGNvbnN0IGUgPSAkKFwic3R5bGVcIik7XG4gIHJldHVybiBlLnRleHRDb250ZW50ID0gXCIvKiBlbXB0eSAqL1wiLCBJbih6dChuKSwgZSksIGUuc2hlZXQ7XG59XG5mdW5jdGlvbiBJbihuLCBlKSB7XG4gIHJldHVybiBiKFxuICAgIC8qKiBAdHlwZSB7RG9jdW1lbnR9ICovXG4gICAgbi5oZWFkIHx8IG4sXG4gICAgZVxuICApLCBlLnNoZWV0O1xufVxuZnVuY3Rpb24gQihuLCBlLCB0KSB7XG4gIG4uaW5zZXJ0QmVmb3JlKGUsIHQgfHwgbnVsbCk7XG59XG5mdW5jdGlvbiBOKG4pIHtcbiAgbi5wYXJlbnROb2RlICYmIG4ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChuKTtcbn1cbmZ1bmN0aW9uIFplKG4sIGUpIHtcbiAgZm9yIChsZXQgdCA9IDA7IHQgPCBuLmxlbmd0aDsgdCArPSAxKVxuICAgIG5bdF0gJiYgblt0XS5kKGUpO1xufVxuZnVuY3Rpb24gJChuKSB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG4pO1xufVxuZnVuY3Rpb24gRyhuKSB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShuKTtcbn1cbmZ1bmN0aW9uIGooKSB7XG4gIHJldHVybiBHKFwiIFwiKTtcbn1cbmZ1bmN0aW9uIFNuKCkge1xuICByZXR1cm4gRyhcIlwiKTtcbn1cbmZ1bmN0aW9uIFUobiwgZSwgdCwgaSkge1xuICByZXR1cm4gbi5hZGRFdmVudExpc3RlbmVyKGUsIHQsIGkpLCAoKSA9PiBuLnJlbW92ZUV2ZW50TGlzdGVuZXIoZSwgdCwgaSk7XG59XG5mdW5jdGlvbiBnKG4sIGUsIHQpIHtcbiAgdCA9PSBudWxsID8gbi5yZW1vdmVBdHRyaWJ1dGUoZSkgOiBuLmdldEF0dHJpYnV0ZShlKSAhPT0gdCAmJiBuLnNldEF0dHJpYnV0ZShlLCB0KTtcbn1cbmZ1bmN0aW9uIEhlKG4pIHtcbiAgcmV0dXJuIG4gPT09IFwiXCIgPyBudWxsIDogK247XG59XG5mdW5jdGlvbiBNbihuKSB7XG4gIHJldHVybiBBcnJheS5mcm9tKG4uY2hpbGROb2Rlcyk7XG59XG5mdW5jdGlvbiBkZShuLCBlKSB7XG4gIGUgPSBcIlwiICsgZSwgbi5kYXRhICE9PSBlICYmIChuLmRhdGEgPSAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgZSk7XG59XG5mdW5jdGlvbiBJZShuLCBlKSB7XG4gIG4udmFsdWUgPSBlID8/IFwiXCI7XG59XG5mdW5jdGlvbiBZdChuLCBlLCB0LCBpKSB7XG4gIHQgPT0gbnVsbCA/IG4uc3R5bGUucmVtb3ZlUHJvcGVydHkoZSkgOiBuLnN0eWxlLnNldFByb3BlcnR5KGUsIHQsIGkgPyBcImltcG9ydGFudFwiIDogXCJcIik7XG59XG5mdW5jdGlvbiBHdChuLCBlLCB7IGJ1YmJsZXM6IHQgPSAhMSwgY2FuY2VsYWJsZTogaSA9ICExIH0gPSB7fSkge1xuICByZXR1cm4gbmV3IEN1c3RvbUV2ZW50KG4sIHsgZGV0YWlsOiBlLCBidWJibGVzOiB0LCBjYW5jZWxhYmxlOiBpIH0pO1xufVxuZnVuY3Rpb24gT24obikge1xuICBjb25zdCBlID0ge307XG4gIHJldHVybiBuLmNoaWxkTm9kZXMuZm9yRWFjaChcbiAgICAvKiogQHBhcmFtIHtFbGVtZW50fSBub2RlICovXG4gICAgKHQpID0+IHtcbiAgICAgIGVbdC5zbG90IHx8IFwiZGVmYXVsdFwiXSA9ICEwO1xuICAgIH1cbiAgKSwgZTtcbn1cbmNvbnN0IEJlID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKTtcbmxldCBWZSA9IDA7XG5mdW5jdGlvbiBDbihuKSB7XG4gIGxldCBlID0gNTM4MSwgdCA9IG4ubGVuZ3RoO1xuICBmb3IgKDsgdC0tOyApXG4gICAgZSA9IChlIDw8IDUpIC0gZSBeIG4uY2hhckNvZGVBdCh0KTtcbiAgcmV0dXJuIGUgPj4+IDA7XG59XG5mdW5jdGlvbiBMbihuLCBlKSB7XG4gIGNvbnN0IHQgPSB7IHN0eWxlc2hlZXQ6IGtuKGUpLCBydWxlczoge30gfTtcbiAgcmV0dXJuIEJlLnNldChuLCB0KSwgdDtcbn1cbmZ1bmN0aW9uIFllKG4sIGUsIHQsIGksIHMsIGEsIGwsIHIgPSAwKSB7XG4gIGNvbnN0IG8gPSAxNi42NjYgLyBpO1xuICBsZXQgZCA9IGB7XG5gO1xuICBmb3IgKGxldCBwID0gMDsgcCA8PSAxOyBwICs9IG8pIHtcbiAgICBjb25zdCB2ID0gZSArICh0IC0gZSkgKiBhKHApO1xuICAgIGQgKz0gcCAqIDEwMCArIGAleyR7bCh2LCAxIC0gdil9fVxuYDtcbiAgfVxuICBjb25zdCB1ID0gZCArIGAxMDAlIHske2wodCwgMSAtIHQpfX1cbn1gLCBfID0gYF9fc3ZlbHRlXyR7Q24odSl9XyR7cn1gLCBmID0genQobiksIHsgc3R5bGVzaGVldDogaCwgcnVsZXM6IGMgfSA9IEJlLmdldChmKSB8fCBMbihmLCBuKTtcbiAgY1tfXSB8fCAoY1tfXSA9ICEwLCBoLmluc2VydFJ1bGUoYEBrZXlmcmFtZXMgJHtffSAke3V9YCwgaC5jc3NSdWxlcy5sZW5ndGgpKTtcbiAgY29uc3QgeSA9IG4uc3R5bGUuYW5pbWF0aW9uIHx8IFwiXCI7XG4gIHJldHVybiBuLnN0eWxlLmFuaW1hdGlvbiA9IGAke3kgPyBgJHt5fSwgYCA6IFwiXCJ9JHtffSAke2l9bXMgbGluZWFyICR7c31tcyAxIGJvdGhgLCBWZSArPSAxLCBfO1xufVxuZnVuY3Rpb24gV3QobiwgZSkge1xuICBjb25zdCB0ID0gKG4uc3R5bGUuYW5pbWF0aW9uIHx8IFwiXCIpLnNwbGl0KFwiLCBcIiksIGkgPSB0LmZpbHRlcihcbiAgICBlID8gKGEpID0+IGEuaW5kZXhPZihlKSA8IDAgOiAoYSkgPT4gYS5pbmRleE9mKFwiX19zdmVsdGVcIikgPT09IC0xXG4gICAgLy8gcmVtb3ZlIGFsbCBTdmVsdGUgYW5pbWF0aW9uc1xuICApLCBzID0gdC5sZW5ndGggLSBpLmxlbmd0aDtcbiAgcyAmJiAobi5zdHlsZS5hbmltYXRpb24gPSBpLmpvaW4oXCIsIFwiKSwgVmUgLT0gcywgVmUgfHwgRW4oKSk7XG59XG5mdW5jdGlvbiBFbigpIHtcbiAgWGUoKCkgPT4ge1xuICAgIFZlIHx8IChCZS5mb3JFYWNoKChuKSA9PiB7XG4gICAgICBjb25zdCB7IG93bmVyTm9kZTogZSB9ID0gbi5zdHlsZXNoZWV0O1xuICAgICAgZSAmJiBOKGUpO1xuICAgIH0pLCBCZS5jbGVhcigpKTtcbiAgfSk7XG59XG5mdW5jdGlvbiB4ZShuLCBlLCB0LCBpKSB7XG4gIGlmICghZSlcbiAgICByZXR1cm4gSztcbiAgY29uc3QgcyA9IG4uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIGlmIChlLmxlZnQgPT09IHMubGVmdCAmJiBlLnJpZ2h0ID09PSBzLnJpZ2h0ICYmIGUudG9wID09PSBzLnRvcCAmJiBlLmJvdHRvbSA9PT0gcy5ib3R0b20pXG4gICAgcmV0dXJuIEs7XG4gIGNvbnN0IHtcbiAgICBkZWxheTogYSA9IDAsXG4gICAgZHVyYXRpb246IGwgPSAzMDAsXG4gICAgZWFzaW5nOiByID0gUWUsXG4gICAgLy8gQHRzLWlnbm9yZSB0b2RvOiBzaG91bGQgdGhpcyBiZSBzZXBhcmF0ZWQgZnJvbSBkZXN0cnVjdHVyaW5nPyBPciBzdGFydC9lbmQgYWRkZWQgdG8gcHVibGljIGFwaSBhbmQgZG9jdW1lbnRhdGlvbj9cbiAgICBzdGFydDogbyA9IEZ0KCkgKyBhLFxuICAgIC8vIEB0cy1pZ25vcmUgdG9kbzpcbiAgICBlbmQ6IGQgPSBvICsgbCxcbiAgICB0aWNrOiB1ID0gSyxcbiAgICBjc3M6IF9cbiAgfSA9IHQobiwgeyBmcm9tOiBlLCB0bzogcyB9LCBpKTtcbiAgbGV0IGYgPSAhMCwgaCA9ICExLCBjO1xuICBmdW5jdGlvbiB5KCkge1xuICAgIF8gJiYgKGMgPSBZZShuLCAwLCAxLCBsLCBhLCByLCBfKSksIGEgfHwgKGggPSAhMCk7XG4gIH1cbiAgZnVuY3Rpb24gcCgpIHtcbiAgICBfICYmIFd0KG4sIGMpLCBmID0gITE7XG4gIH1cbiAgcmV0dXJuIEp0KCh2KSA9PiB7XG4gICAgaWYgKCFoICYmIHYgPj0gbyAmJiAoaCA9ICEwKSwgaCAmJiB2ID49IGQgJiYgKHUoMSwgMCksIHAoKSksICFmKVxuICAgICAgcmV0dXJuICExO1xuICAgIGlmIChoKSB7XG4gICAgICBjb25zdCBDID0gdiAtIG8sIG0gPSAwICsgMSAqIHIoQyAvIGwpO1xuICAgICAgdShtLCAxIC0gbSk7XG4gICAgfVxuICAgIHJldHVybiAhMDtcbiAgfSksIHkoKSwgdSgwLCAxKSwgcDtcbn1cbmZ1bmN0aW9uIGV0KG4pIHtcbiAgY29uc3QgZSA9IGdldENvbXB1dGVkU3R5bGUobik7XG4gIGlmIChlLnBvc2l0aW9uICE9PSBcImFic29sdXRlXCIgJiYgZS5wb3NpdGlvbiAhPT0gXCJmaXhlZFwiKSB7XG4gICAgY29uc3QgeyB3aWR0aDogdCwgaGVpZ2h0OiBpIH0gPSBlLCBzID0gbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBuLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiLCBuLnN0eWxlLndpZHRoID0gdCwgbi5zdHlsZS5oZWlnaHQgPSBpLCBqZShuLCBzKTtcbiAgfVxufVxuZnVuY3Rpb24gamUobiwgZSkge1xuICBjb25zdCB0ID0gbi5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgaWYgKGUubGVmdCAhPT0gdC5sZWZ0IHx8IGUudG9wICE9PSB0LnRvcCkge1xuICAgIGNvbnN0IGkgPSBnZXRDb21wdXRlZFN0eWxlKG4pLCBzID0gaS50cmFuc2Zvcm0gPT09IFwibm9uZVwiID8gXCJcIiA6IGkudHJhbnNmb3JtO1xuICAgIG4uc3R5bGUudHJhbnNmb3JtID0gYCR7c30gdHJhbnNsYXRlKCR7ZS5sZWZ0IC0gdC5sZWZ0fXB4LCAke2UudG9wIC0gdC50b3B9cHgpYDtcbiAgfVxufVxubGV0IExlO1xuZnVuY3Rpb24gQ2Uobikge1xuICBMZSA9IG47XG59XG5mdW5jdGlvbiB0dCgpIHtcbiAgaWYgKCFMZSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJGdW5jdGlvbiBjYWxsZWQgb3V0c2lkZSBjb21wb25lbnQgaW5pdGlhbGl6YXRpb25cIik7XG4gIHJldHVybiBMZTtcbn1cbmZ1bmN0aW9uIEVlKG4pIHtcbiAgdHQoKS4kJC5vbl9tb3VudC5wdXNoKG4pO1xufVxuZnVuY3Rpb24gQWUobikge1xuICB0dCgpLiQkLm9uX2Rlc3Ryb3kucHVzaChuKTtcbn1cbmZ1bmN0aW9uIG50KCkge1xuICBjb25zdCBuID0gdHQoKTtcbiAgcmV0dXJuIChlLCB0LCB7IGNhbmNlbGFibGU6IGkgPSAhMSB9ID0ge30pID0+IHtcbiAgICBjb25zdCBzID0gbi4kJC5jYWxsYmFja3NbZV07XG4gICAgaWYgKHMpIHtcbiAgICAgIGNvbnN0IGEgPSBHdChcbiAgICAgICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgICAgIGUsXG4gICAgICAgIHQsXG4gICAgICAgIHsgY2FuY2VsYWJsZTogaSB9XG4gICAgICApO1xuICAgICAgcmV0dXJuIHMuc2xpY2UoKS5mb3JFYWNoKChsKSA9PiB7XG4gICAgICAgIGwuY2FsbChuLCBhKTtcbiAgICAgIH0pLCAhYS5kZWZhdWx0UHJldmVudGVkO1xuICAgIH1cbiAgICByZXR1cm4gITA7XG4gIH07XG59XG5mdW5jdGlvbiBtZShuLCBlKSB7XG4gIGNvbnN0IHQgPSBuLiQkLmNhbGxiYWNrc1tlLnR5cGVdO1xuICB0ICYmIHQuc2xpY2UoKS5mb3JFYWNoKChpKSA9PiBpLmNhbGwodGhpcywgZSkpO1xufVxuY29uc3Qgd2UgPSBbXSwgbmUgPSBbXTtcbmxldCBrZSA9IFtdO1xuY29uc3QgR2UgPSBbXSwgQW4gPSAvKiBAX19QVVJFX18gKi8gUHJvbWlzZS5yZXNvbHZlKCk7XG5sZXQgV2UgPSAhMTtcbmZ1bmN0aW9uIFJuKCkge1xuICBXZSB8fCAoV2UgPSAhMCwgQW4udGhlbihFKSk7XG59XG5mdW5jdGlvbiBpZShuKSB7XG4gIGtlLnB1c2gobik7XG59XG5mdW5jdGlvbiB2ZShuKSB7XG4gIEdlLnB1c2gobik7XG59XG5jb25zdCBxZSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG5sZXQgYmUgPSAwO1xuZnVuY3Rpb24gRSgpIHtcbiAgaWYgKGJlICE9PSAwKVxuICAgIHJldHVybjtcbiAgY29uc3QgbiA9IExlO1xuICBkbyB7XG4gICAgdHJ5IHtcbiAgICAgIGZvciAoOyBiZSA8IHdlLmxlbmd0aDsgKSB7XG4gICAgICAgIGNvbnN0IGUgPSB3ZVtiZV07XG4gICAgICAgIGJlKyssIENlKGUpLCBObihlLiQkKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyB3ZS5sZW5ndGggPSAwLCBiZSA9IDAsIGU7XG4gICAgfVxuICAgIGZvciAoQ2UobnVsbCksIHdlLmxlbmd0aCA9IDAsIGJlID0gMDsgbmUubGVuZ3RoOyApXG4gICAgICBuZS5wb3AoKSgpO1xuICAgIGZvciAobGV0IGUgPSAwOyBlIDwga2UubGVuZ3RoOyBlICs9IDEpIHtcbiAgICAgIGNvbnN0IHQgPSBrZVtlXTtcbiAgICAgIHFlLmhhcyh0KSB8fCAocWUuYWRkKHQpLCB0KCkpO1xuICAgIH1cbiAgICBrZS5sZW5ndGggPSAwO1xuICB9IHdoaWxlICh3ZS5sZW5ndGgpO1xuICBmb3IgKDsgR2UubGVuZ3RoOyApXG4gICAgR2UucG9wKCkoKTtcbiAgV2UgPSAhMSwgcWUuY2xlYXIoKSwgQ2Uobik7XG59XG5mdW5jdGlvbiBObihuKSB7XG4gIGlmIChuLmZyYWdtZW50ICE9PSBudWxsKSB7XG4gICAgbi51cGRhdGUoKSwgWShuLmJlZm9yZV91cGRhdGUpO1xuICAgIGNvbnN0IGUgPSBuLmRpcnR5O1xuICAgIG4uZGlydHkgPSBbLTFdLCBuLmZyYWdtZW50ICYmIG4uZnJhZ21lbnQucChuLmN0eCwgZSksIG4uYWZ0ZXJfdXBkYXRlLmZvckVhY2goaWUpO1xuICB9XG59XG5mdW5jdGlvbiBCbihuKSB7XG4gIGNvbnN0IGUgPSBbXSwgdCA9IFtdO1xuICBrZS5mb3JFYWNoKChpKSA9PiBuLmluZGV4T2YoaSkgPT09IC0xID8gZS5wdXNoKGkpIDogdC5wdXNoKGkpKSwgdC5mb3JFYWNoKChpKSA9PiBpKCkpLCBrZSA9IGU7XG59XG5sZXQgTWU7XG5mdW5jdGlvbiBWbigpIHtcbiAgcmV0dXJuIE1lIHx8IChNZSA9IFByb21pc2UucmVzb2x2ZSgpLCBNZS50aGVuKCgpID0+IHtcbiAgICBNZSA9IG51bGw7XG4gIH0pKSwgTWU7XG59XG5mdW5jdGlvbiBKZShuLCBlLCB0KSB7XG4gIG4uZGlzcGF0Y2hFdmVudChHdChgJHtlID8gXCJpbnRyb1wiIDogXCJvdXRyb1wifSR7dH1gKSk7XG59XG5jb25zdCBSZSA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG5sZXQgY2U7XG5mdW5jdGlvbiB1ZSgpIHtcbiAgY2UgPSB7XG4gICAgcjogMCxcbiAgICBjOiBbXSxcbiAgICBwOiBjZVxuICAgIC8vIHBhcmVudCBncm91cFxuICB9O1xufVxuZnVuY3Rpb24gZmUoKSB7XG4gIGNlLnIgfHwgWShjZS5jKSwgY2UgPSBjZS5wO1xufVxuZnVuY3Rpb24gUihuLCBlKSB7XG4gIG4gJiYgbi5pICYmIChSZS5kZWxldGUobiksIG4uaShlKSk7XG59XG5mdW5jdGlvbiBQKG4sIGUsIHQsIGkpIHtcbiAgaWYgKG4gJiYgbi5vKSB7XG4gICAgaWYgKFJlLmhhcyhuKSlcbiAgICAgIHJldHVybjtcbiAgICBSZS5hZGQobiksIGNlLmMucHVzaCgoKSA9PiB7XG4gICAgICBSZS5kZWxldGUobiksIGkgJiYgKHQgJiYgbi5kKDEpLCBpKCkpO1xuICAgIH0pLCBuLm8oZSk7XG4gIH0gZWxzZVxuICAgIGkgJiYgaSgpO1xufVxuY29uc3QgVG4gPSB7IGR1cmF0aW9uOiAwIH07XG5mdW5jdGlvbiB6KG4sIGUsIHQsIGkpIHtcbiAgbGV0IGEgPSBlKG4sIHQsIHsgZGlyZWN0aW9uOiBcImJvdGhcIiB9KSwgbCA9IGkgPyAwIDogMSwgciA9IG51bGwsIG8gPSBudWxsLCBkID0gbnVsbCwgdTtcbiAgZnVuY3Rpb24gXygpIHtcbiAgICBkICYmIFd0KG4sIGQpO1xuICB9XG4gIGZ1bmN0aW9uIGYoYywgeSkge1xuICAgIGNvbnN0IHAgPSAoXG4gICAgICAvKiogQHR5cGUge1Byb2dyYW1bJ2QnXX0gKi9cbiAgICAgIGMuYiAtIGxcbiAgICApO1xuICAgIHJldHVybiB5ICo9IE1hdGguYWJzKHApLCB7XG4gICAgICBhOiBsLFxuICAgICAgYjogYy5iLFxuICAgICAgZDogcCxcbiAgICAgIGR1cmF0aW9uOiB5LFxuICAgICAgc3RhcnQ6IGMuc3RhcnQsXG4gICAgICBlbmQ6IGMuc3RhcnQgKyB5LFxuICAgICAgZ3JvdXA6IGMuZ3JvdXBcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGgoYykge1xuICAgIGNvbnN0IHtcbiAgICAgIGRlbGF5OiB5ID0gMCxcbiAgICAgIGR1cmF0aW9uOiBwID0gMzAwLFxuICAgICAgZWFzaW5nOiB2ID0gUWUsXG4gICAgICB0aWNrOiBDID0gSyxcbiAgICAgIGNzczogbVxuICAgIH0gPSBhIHx8IFRuLCBTID0ge1xuICAgICAgc3RhcnQ6IEZ0KCkgKyB5LFxuICAgICAgYjogY1xuICAgIH07XG4gICAgYyB8fCAoUy5ncm91cCA9IGNlLCBjZS5yICs9IDEpLCBcImluZXJ0XCIgaW4gbiAmJiAoYyA/IHUgIT09IHZvaWQgMCAmJiAobi5pbmVydCA9IHUpIDogKHUgPSAvKiogQHR5cGUge0hUTUxFbGVtZW50fSAqL1xuICAgIG4uaW5lcnQsIG4uaW5lcnQgPSAhMCkpLCByIHx8IG8gPyBvID0gUyA6IChtICYmIChfKCksIGQgPSBZZShuLCBsLCBjLCBwLCB5LCB2LCBtKSksIGMgJiYgQygwLCAxKSwgciA9IGYoUywgcCksIGllKCgpID0+IEplKG4sIGMsIFwic3RhcnRcIikpLCBKdCgoRCkgPT4ge1xuICAgICAgaWYgKG8gJiYgRCA+IG8uc3RhcnQgJiYgKHIgPSBmKG8sIHApLCBvID0gbnVsbCwgSmUobiwgci5iLCBcInN0YXJ0XCIpLCBtICYmIChfKCksIGQgPSBZZShcbiAgICAgICAgbixcbiAgICAgICAgbCxcbiAgICAgICAgci5iLFxuICAgICAgICByLmR1cmF0aW9uLFxuICAgICAgICAwLFxuICAgICAgICB2LFxuICAgICAgICBhLmNzc1xuICAgICAgKSkpLCByKSB7XG4gICAgICAgIGlmIChEID49IHIuZW5kKVxuICAgICAgICAgIEMobCA9IHIuYiwgMSAtIGwpLCBKZShuLCByLmIsIFwiZW5kXCIpLCBvIHx8IChyLmIgPyBfKCkgOiAtLXIuZ3JvdXAuciB8fCBZKHIuZ3JvdXAuYykpLCByID0gbnVsbDtcbiAgICAgICAgZWxzZSBpZiAoRCA+PSByLnN0YXJ0KSB7XG4gICAgICAgICAgY29uc3QgQSA9IEQgLSByLnN0YXJ0O1xuICAgICAgICAgIGwgPSByLmEgKyByLmQgKiB2KEEgLyByLmR1cmF0aW9uKSwgQyhsLCAxIC0gbCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAhIShyIHx8IG8pO1xuICAgIH0pKTtcbiAgfVxuICByZXR1cm4ge1xuICAgIHJ1bihjKSB7XG4gICAgICBQZShhKSA/IFZuKCkudGhlbigoKSA9PiB7XG4gICAgICAgIGEgPSBhKHsgZGlyZWN0aW9uOiBjID8gXCJpblwiIDogXCJvdXRcIiB9KSwgaChjKTtcbiAgICAgIH0pIDogaChjKTtcbiAgICB9LFxuICAgIGVuZCgpIHtcbiAgICAgIF8oKSwgciA9IG8gPSBudWxsO1xuICAgIH1cbiAgfTtcbn1cbmZ1bmN0aW9uIHNlKG4pIHtcbiAgcmV0dXJuIChuID09IG51bGwgPyB2b2lkIDAgOiBuLmxlbmd0aCkgIT09IHZvaWQgMCA/IG4gOiBBcnJheS5mcm9tKG4pO1xufVxuZnVuY3Rpb24gVW4obiwgZSkge1xuICBuLmQoMSksIGUuZGVsZXRlKG4ua2V5KTtcbn1cbmZ1bmN0aW9uIFBuKG4sIGUpIHtcbiAgUChuLCAxLCAxLCAoKSA9PiB7XG4gICAgZS5kZWxldGUobi5rZXkpO1xuICB9KTtcbn1cbmZ1bmN0aW9uIGl0KG4sIGUpIHtcbiAgbi5mKCksIFBuKG4sIGUpO1xufVxuZnVuY3Rpb24gS2UobiwgZSwgdCwgaSwgcywgYSwgbCwgciwgbywgZCwgdSwgXykge1xuICBsZXQgZiA9IG4ubGVuZ3RoLCBoID0gYS5sZW5ndGgsIGMgPSBmO1xuICBjb25zdCB5ID0ge307XG4gIGZvciAoOyBjLS07IClcbiAgICB5W25bY10ua2V5XSA9IGM7XG4gIGNvbnN0IHAgPSBbXSwgdiA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIEMgPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBtID0gW107XG4gIGZvciAoYyA9IGg7IGMtLTsgKSB7XG4gICAgY29uc3QgSCA9IF8ocywgYSwgYyksIEogPSB0KEgpO1xuICAgIGxldCBNID0gbC5nZXQoSik7XG4gICAgTSA/IGkgJiYgbS5wdXNoKCgpID0+IE0ucChILCBlKSkgOiAoTSA9IGQoSiwgSCksIE0uYygpKSwgdi5zZXQoSiwgcFtjXSA9IE0pLCBKIGluIHkgJiYgQy5zZXQoSiwgTWF0aC5hYnMoYyAtIHlbSl0pKTtcbiAgfVxuICBjb25zdCBTID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKSwgRCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCk7XG4gIGZ1bmN0aW9uIEEoSCkge1xuICAgIFIoSCwgMSksIEgubShyLCB1KSwgbC5zZXQoSC5rZXksIEgpLCB1ID0gSC5maXJzdCwgaC0tO1xuICB9XG4gIGZvciAoOyBmICYmIGg7ICkge1xuICAgIGNvbnN0IEggPSBwW2ggLSAxXSwgSiA9IG5bZiAtIDFdLCBNID0gSC5rZXksIHcgPSBKLmtleTtcbiAgICBIID09PSBKID8gKHUgPSBILmZpcnN0LCBmLS0sIGgtLSkgOiB2Lmhhcyh3KSA/ICFsLmhhcyhNKSB8fCBTLmhhcyhNKSA/IEEoSCkgOiBELmhhcyh3KSA/IGYtLSA6IEMuZ2V0KE0pID4gQy5nZXQodykgPyAoRC5hZGQoTSksIEEoSCkpIDogKFMuYWRkKHcpLCBmLS0pIDogKG8oSiwgbCksIGYtLSk7XG4gIH1cbiAgZm9yICg7IGYtLTsgKSB7XG4gICAgY29uc3QgSCA9IG5bZl07XG4gICAgdi5oYXMoSC5rZXkpIHx8IG8oSCwgbCk7XG4gIH1cbiAgZm9yICg7IGg7IClcbiAgICBBKHBbaCAtIDFdKTtcbiAgcmV0dXJuIFkobSksIHA7XG59XG5mdW5jdGlvbiB5ZShuLCBlLCB0KSB7XG4gIGNvbnN0IGkgPSBuLiQkLnByb3BzW2VdO1xuICBpICE9PSB2b2lkIDAgJiYgKG4uJCQuYm91bmRbaV0gPSB0LCB0KG4uJCQuY3R4W2ldKSk7XG59XG5mdW5jdGlvbiBYKG4pIHtcbiAgbiAmJiBuLmMoKTtcbn1cbmZ1bmN0aW9uIFcobiwgZSwgdCkge1xuICBjb25zdCB7IGZyYWdtZW50OiBpLCBhZnRlcl91cGRhdGU6IHMgfSA9IG4uJCQ7XG4gIGkgJiYgaS5tKGUsIHQpLCBpZSgoKSA9PiB7XG4gICAgY29uc3QgYSA9IG4uJCQub25fbW91bnQubWFwKEh0KS5maWx0ZXIoUGUpO1xuICAgIG4uJCQub25fZGVzdHJveSA/IG4uJCQub25fZGVzdHJveS5wdXNoKC4uLmEpIDogWShhKSwgbi4kJC5vbl9tb3VudCA9IFtdO1xuICB9KSwgcy5mb3JFYWNoKGllKTtcbn1cbmZ1bmN0aW9uIFEobiwgZSkge1xuICBjb25zdCB0ID0gbi4kJDtcbiAgdC5mcmFnbWVudCAhPT0gbnVsbCAmJiAoQm4odC5hZnRlcl91cGRhdGUpLCBZKHQub25fZGVzdHJveSksIHQuZnJhZ21lbnQgJiYgdC5mcmFnbWVudC5kKGUpLCB0Lm9uX2Rlc3Ryb3kgPSB0LmZyYWdtZW50ID0gbnVsbCwgdC5jdHggPSBbXSk7XG59XG5mdW5jdGlvbiBIbihuLCBlKSB7XG4gIG4uJCQuZGlydHlbMF0gPT09IC0xICYmICh3ZS5wdXNoKG4pLCBSbigpLCBuLiQkLmRpcnR5LmZpbGwoMCkpLCBuLiQkLmRpcnR5W2UgLyAzMSB8IDBdIHw9IDEgPDwgZSAlIDMxO1xufVxuZnVuY3Rpb24gbGUobiwgZSwgdCwgaSwgcywgYSwgbCA9IG51bGwsIHIgPSBbLTFdKSB7XG4gIGNvbnN0IG8gPSBMZTtcbiAgQ2Uobik7XG4gIGNvbnN0IGQgPSBuLiQkID0ge1xuICAgIGZyYWdtZW50OiBudWxsLFxuICAgIGN0eDogW10sXG4gICAgLy8gc3RhdGVcbiAgICBwcm9wczogYSxcbiAgICB1cGRhdGU6IEssXG4gICAgbm90X2VxdWFsOiBzLFxuICAgIGJvdW5kOiBsdCgpLFxuICAgIC8vIGxpZmVjeWNsZVxuICAgIG9uX21vdW50OiBbXSxcbiAgICBvbl9kZXN0cm95OiBbXSxcbiAgICBvbl9kaXNjb25uZWN0OiBbXSxcbiAgICBiZWZvcmVfdXBkYXRlOiBbXSxcbiAgICBhZnRlcl91cGRhdGU6IFtdLFxuICAgIGNvbnRleHQ6IG5ldyBNYXAoZS5jb250ZXh0IHx8IChvID8gby4kJC5jb250ZXh0IDogW10pKSxcbiAgICAvLyBldmVyeXRoaW5nIGVsc2VcbiAgICBjYWxsYmFja3M6IGx0KCksXG4gICAgZGlydHk6IHIsXG4gICAgc2tpcF9ib3VuZDogITEsXG4gICAgcm9vdDogZS50YXJnZXQgfHwgby4kJC5yb290XG4gIH07XG4gIGwgJiYgbChkLnJvb3QpO1xuICBsZXQgdSA9ICExO1xuICBpZiAoZC5jdHggPSB0ID8gdChuLCBlLnByb3BzIHx8IHt9LCAoXywgZiwgLi4uaCkgPT4ge1xuICAgIGNvbnN0IGMgPSBoLmxlbmd0aCA/IGhbMF0gOiBmO1xuICAgIHJldHVybiBkLmN0eCAmJiBzKGQuY3R4W19dLCBkLmN0eFtfXSA9IGMpICYmICghZC5za2lwX2JvdW5kICYmIGQuYm91bmRbX10gJiYgZC5ib3VuZFtfXShjKSwgdSAmJiBIbihuLCBfKSksIGY7XG4gIH0pIDogW10sIGQudXBkYXRlKCksIHUgPSAhMCwgWShkLmJlZm9yZV91cGRhdGUpLCBkLmZyYWdtZW50ID0gaSA/IGkoZC5jdHgpIDogITEsIGUudGFyZ2V0KSB7XG4gICAgaWYgKGUuaHlkcmF0ZSkge1xuICAgICAgY29uc3QgXyA9IE1uKGUudGFyZ2V0KTtcbiAgICAgIGQuZnJhZ21lbnQgJiYgZC5mcmFnbWVudC5sKF8pLCBfLmZvckVhY2goTik7XG4gICAgfSBlbHNlXG4gICAgICBkLmZyYWdtZW50ICYmIGQuZnJhZ21lbnQuYygpO1xuICAgIGUuaW50cm8gJiYgUihuLiQkLmZyYWdtZW50KSwgVyhuLCBlLnRhcmdldCwgZS5hbmNob3IpLCBFKCk7XG4gIH1cbiAgQ2Uobyk7XG59XG5sZXQgUXQ7XG50eXBlb2YgSFRNTEVsZW1lbnQgPT0gXCJmdW5jdGlvblwiICYmIChRdCA9IGNsYXNzIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICBjb25zdHJ1Y3RvcihlLCB0LCBpKSB7XG4gICAgc3VwZXIoKTtcbiAgICAvKiogVGhlIFN2ZWx0ZSBjb21wb25lbnQgY29uc3RydWN0b3IgKi9cbiAgICBMKHRoaXMsIFwiJCRjdG9yXCIpO1xuICAgIC8qKiBTbG90cyAqL1xuICAgIEwodGhpcywgXCIkJHNcIik7XG4gICAgLyoqIFRoZSBTdmVsdGUgY29tcG9uZW50IGluc3RhbmNlICovXG4gICAgTCh0aGlzLCBcIiQkY1wiKTtcbiAgICAvKiogV2hldGhlciBvciBub3QgdGhlIGN1c3RvbSBlbGVtZW50IGlzIGNvbm5lY3RlZCAqL1xuICAgIEwodGhpcywgXCIkJGNuXCIsICExKTtcbiAgICAvKiogQ29tcG9uZW50IHByb3BzIGRhdGEgKi9cbiAgICBMKHRoaXMsIFwiJCRkXCIsIHt9KTtcbiAgICAvKiogYHRydWVgIGlmIGN1cnJlbnRseSBpbiB0aGUgcHJvY2VzcyBvZiByZWZsZWN0aW5nIGNvbXBvbmVudCBwcm9wcyBiYWNrIHRvIGF0dHJpYnV0ZXMgKi9cbiAgICBMKHRoaXMsIFwiJCRyXCIsICExKTtcbiAgICAvKiogQHR5cGUge1JlY29yZDxzdHJpbmcsIEN1c3RvbUVsZW1lbnRQcm9wRGVmaW5pdGlvbj59IFByb3BzIGRlZmluaXRpb24gKG5hbWUsIHJlZmxlY3RlZCwgdHlwZSBldGMpICovXG4gICAgTCh0aGlzLCBcIiQkcF9kXCIsIHt9KTtcbiAgICAvKiogQHR5cGUge1JlY29yZDxzdHJpbmcsIEZ1bmN0aW9uW10+fSBFdmVudCBsaXN0ZW5lcnMgKi9cbiAgICBMKHRoaXMsIFwiJCRsXCIsIHt9KTtcbiAgICAvKiogQHR5cGUge01hcDxGdW5jdGlvbiwgRnVuY3Rpb24+fSBFdmVudCBsaXN0ZW5lciB1bnN1YnNjcmliZSBmdW5jdGlvbnMgKi9cbiAgICBMKHRoaXMsIFwiJCRsX3VcIiwgLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSk7XG4gICAgdGhpcy4kJGN0b3IgPSBlLCB0aGlzLiQkcyA9IHQsIGkgJiYgdGhpcy5hdHRhY2hTaGFkb3coeyBtb2RlOiBcIm9wZW5cIiB9KTtcbiAgfVxuICBhZGRFdmVudExpc3RlbmVyKGUsIHQsIGkpIHtcbiAgICBpZiAodGhpcy4kJGxbZV0gPSB0aGlzLiQkbFtlXSB8fCBbXSwgdGhpcy4kJGxbZV0ucHVzaCh0KSwgdGhpcy4kJGMpIHtcbiAgICAgIGNvbnN0IHMgPSB0aGlzLiQkYy4kb24oZSwgdCk7XG4gICAgICB0aGlzLiQkbF91LnNldCh0LCBzKTtcbiAgICB9XG4gICAgc3VwZXIuYWRkRXZlbnRMaXN0ZW5lcihlLCB0LCBpKTtcbiAgfVxuICByZW1vdmVFdmVudExpc3RlbmVyKGUsIHQsIGkpIHtcbiAgICBpZiAoc3VwZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLCB0LCBpKSwgdGhpcy4kJGMpIHtcbiAgICAgIGNvbnN0IHMgPSB0aGlzLiQkbF91LmdldCh0KTtcbiAgICAgIHMgJiYgKHMoKSwgdGhpcy4kJGxfdS5kZWxldGUodCkpO1xuICAgIH1cbiAgfVxuICBhc3luYyBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICBpZiAodGhpcy4kJGNuID0gITAsICF0aGlzLiQkYykge1xuICAgICAgbGV0IGUgPSBmdW5jdGlvbihhKSB7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgbGV0IGw7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBsID0gJChcInNsb3RcIiksIGEgIT09IFwiZGVmYXVsdFwiICYmIGcobCwgXCJuYW1lXCIsIGEpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogQHBhcmFtIHtIVE1MRWxlbWVudH0gdGFyZ2V0XG4gICAgICAgICAgICAgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBbYW5jaG9yXVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBtOiBmdW5jdGlvbihkLCB1KSB7XG4gICAgICAgICAgICAgIEIoZCwgbCwgdSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZDogZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgICBkICYmIE4obCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgICBpZiAoYXdhaXQgUHJvbWlzZS5yZXNvbHZlKCksICF0aGlzLiQkY24gfHwgdGhpcy4kJGMpXG4gICAgICAgIHJldHVybjtcbiAgICAgIGNvbnN0IHQgPSB7fSwgaSA9IE9uKHRoaXMpO1xuICAgICAgZm9yIChjb25zdCBhIG9mIHRoaXMuJCRzKVxuICAgICAgICBhIGluIGkgJiYgKHRbYV0gPSBbZShhKV0pO1xuICAgICAgZm9yIChjb25zdCBhIG9mIHRoaXMuYXR0cmlidXRlcykge1xuICAgICAgICBjb25zdCBsID0gdGhpcy4kJGdfcChhLm5hbWUpO1xuICAgICAgICBsIGluIHRoaXMuJCRkIHx8ICh0aGlzLiQkZFtsXSA9IE5lKGwsIGEudmFsdWUsIHRoaXMuJCRwX2QsIFwidG9Qcm9wXCIpKTtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgYSBpbiB0aGlzLiQkcF9kKVxuICAgICAgICAhKGEgaW4gdGhpcy4kJGQpICYmIHRoaXNbYV0gIT09IHZvaWQgMCAmJiAodGhpcy4kJGRbYV0gPSB0aGlzW2FdLCBkZWxldGUgdGhpc1thXSk7XG4gICAgICB0aGlzLiQkYyA9IG5ldyB0aGlzLiQkY3Rvcih7XG4gICAgICAgIHRhcmdldDogdGhpcy5zaGFkb3dSb290IHx8IHRoaXMsXG4gICAgICAgIHByb3BzOiB7XG4gICAgICAgICAgLi4udGhpcy4kJGQsXG4gICAgICAgICAgJCRzbG90czogdCxcbiAgICAgICAgICAkJHNjb3BlOiB7XG4gICAgICAgICAgICBjdHg6IFtdXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHMgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuJCRyID0gITA7XG4gICAgICAgIGZvciAoY29uc3QgYSBpbiB0aGlzLiQkcF9kKVxuICAgICAgICAgIGlmICh0aGlzLiQkZFthXSA9IHRoaXMuJCRjLiQkLmN0eFt0aGlzLiQkYy4kJC5wcm9wc1thXV0sIHRoaXMuJCRwX2RbYV0ucmVmbGVjdCkge1xuICAgICAgICAgICAgY29uc3QgbCA9IE5lKFxuICAgICAgICAgICAgICBhLFxuICAgICAgICAgICAgICB0aGlzLiQkZFthXSxcbiAgICAgICAgICAgICAgdGhpcy4kJHBfZCxcbiAgICAgICAgICAgICAgXCJ0b0F0dHJpYnV0ZVwiXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgbCA9PSBudWxsID8gdGhpcy5yZW1vdmVBdHRyaWJ1dGUodGhpcy4kJHBfZFthXS5hdHRyaWJ1dGUgfHwgYSkgOiB0aGlzLnNldEF0dHJpYnV0ZSh0aGlzLiQkcF9kW2FdLmF0dHJpYnV0ZSB8fCBhLCBsKTtcbiAgICAgICAgICB9XG4gICAgICAgIHRoaXMuJCRyID0gITE7XG4gICAgICB9O1xuICAgICAgdGhpcy4kJGMuJCQuYWZ0ZXJfdXBkYXRlLnB1c2gocyksIHMoKTtcbiAgICAgIGZvciAoY29uc3QgYSBpbiB0aGlzLiQkbClcbiAgICAgICAgZm9yIChjb25zdCBsIG9mIHRoaXMuJCRsW2FdKSB7XG4gICAgICAgICAgY29uc3QgciA9IHRoaXMuJCRjLiRvbihhLCBsKTtcbiAgICAgICAgICB0aGlzLiQkbF91LnNldChsLCByKTtcbiAgICAgICAgfVxuICAgICAgdGhpcy4kJGwgPSB7fTtcbiAgICB9XG4gIH1cbiAgLy8gV2UgZG9uJ3QgbmVlZCB0aGlzIHdoZW4gd29ya2luZyB3aXRoaW4gU3ZlbHRlIGNvZGUsIGJ1dCBmb3IgY29tcGF0aWJpbGl0eSBvZiBwZW9wbGUgdXNpbmcgdGhpcyBvdXRzaWRlIG9mIFN2ZWx0ZVxuICAvLyBhbmQgc2V0dGluZyBhdHRyaWJ1dGVzIHRocm91Z2ggc2V0QXR0cmlidXRlIGV0YywgdGhpcyBpcyBoZWxwZnVsXG4gIGF0dHJpYnV0ZUNoYW5nZWRDYWxsYmFjayhlLCB0LCBpKSB7XG4gICAgdmFyIHM7XG4gICAgdGhpcy4kJHIgfHwgKGUgPSB0aGlzLiQkZ19wKGUpLCB0aGlzLiQkZFtlXSA9IE5lKGUsIGksIHRoaXMuJCRwX2QsIFwidG9Qcm9wXCIpLCAocyA9IHRoaXMuJCRjKSA9PSBudWxsIHx8IHMuJHNldCh7IFtlXTogdGhpcy4kJGRbZV0gfSkpO1xuICB9XG4gIGRpc2Nvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgIHRoaXMuJCRjbiA9ICExLCBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgICF0aGlzLiQkY24gJiYgdGhpcy4kJGMgJiYgKHRoaXMuJCRjLiRkZXN0cm95KCksIHRoaXMuJCRjID0gdm9pZCAwKTtcbiAgICB9KTtcbiAgfVxuICAkJGdfcChlKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMuJCRwX2QpLmZpbmQoXG4gICAgICAodCkgPT4gdGhpcy4kJHBfZFt0XS5hdHRyaWJ1dGUgPT09IGUgfHwgIXRoaXMuJCRwX2RbdF0uYXR0cmlidXRlICYmIHQudG9Mb3dlckNhc2UoKSA9PT0gZVxuICAgICkgfHwgZTtcbiAgfVxufSk7XG5mdW5jdGlvbiBOZShuLCBlLCB0LCBpKSB7XG4gIHZhciBhO1xuICBjb25zdCBzID0gKGEgPSB0W25dKSA9PSBudWxsID8gdm9pZCAwIDogYS50eXBlO1xuICBpZiAoZSA9IHMgPT09IFwiQm9vbGVhblwiICYmIHR5cGVvZiBlICE9IFwiYm9vbGVhblwiID8gZSAhPSBudWxsIDogZSwgIWkgfHwgIXRbbl0pXG4gICAgcmV0dXJuIGU7XG4gIGlmIChpID09PSBcInRvQXR0cmlidXRlXCIpXG4gICAgc3dpdGNoIChzKSB7XG4gICAgICBjYXNlIFwiT2JqZWN0XCI6XG4gICAgICBjYXNlIFwiQXJyYXlcIjpcbiAgICAgICAgcmV0dXJuIGUgPT0gbnVsbCA/IG51bGwgOiBKU09OLnN0cmluZ2lmeShlKTtcbiAgICAgIGNhc2UgXCJCb29sZWFuXCI6XG4gICAgICAgIHJldHVybiBlID8gXCJcIiA6IG51bGw7XG4gICAgICBjYXNlIFwiTnVtYmVyXCI6XG4gICAgICAgIHJldHVybiBlID8/IG51bGw7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZTtcbiAgICB9XG4gIGVsc2VcbiAgICBzd2l0Y2ggKHMpIHtcbiAgICAgIGNhc2UgXCJPYmplY3RcIjpcbiAgICAgIGNhc2UgXCJBcnJheVwiOlxuICAgICAgICByZXR1cm4gZSAmJiBKU09OLnBhcnNlKGUpO1xuICAgICAgY2FzZSBcIkJvb2xlYW5cIjpcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICBjYXNlIFwiTnVtYmVyXCI6XG4gICAgICAgIHJldHVybiBlICE9IG51bGwgPyArZSA6IGU7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4gZTtcbiAgICB9XG59XG5mdW5jdGlvbiByZShuLCBlLCB0LCBpLCBzLCBhKSB7XG4gIGxldCBsID0gY2xhc3MgZXh0ZW5kcyBRdCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICBzdXBlcihuLCB0LCBzKSwgdGhpcy4kJHBfZCA9IGU7XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgb2JzZXJ2ZWRBdHRyaWJ1dGVzKCkge1xuICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGUpLm1hcChcbiAgICAgICAgKHIpID0+IChlW3JdLmF0dHJpYnV0ZSB8fCByKS50b0xvd2VyQ2FzZSgpXG4gICAgICApO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKGUpLmZvckVhY2goKHIpID0+IHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobC5wcm90b3R5cGUsIHIsIHtcbiAgICAgIGdldCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJCRjICYmIHIgaW4gdGhpcy4kJGMgPyB0aGlzLiQkY1tyXSA6IHRoaXMuJCRkW3JdO1xuICAgICAgfSxcbiAgICAgIHNldChvKSB7XG4gICAgICAgIHZhciBkO1xuICAgICAgICBvID0gTmUociwgbywgZSksIHRoaXMuJCRkW3JdID0gbywgKGQgPSB0aGlzLiQkYykgPT0gbnVsbCB8fCBkLiRzZXQoeyBbcl06IG8gfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pLCBpLmZvckVhY2goKHIpID0+IHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobC5wcm90b3R5cGUsIHIsIHtcbiAgICAgIGdldCgpIHtcbiAgICAgICAgdmFyIG87XG4gICAgICAgIHJldHVybiAobyA9IHRoaXMuJCRjKSA9PSBudWxsID8gdm9pZCAwIDogb1tyXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSksIGEgJiYgKGwgPSBhKGwpKSwgbi5lbGVtZW50ID0gLyoqIEB0eXBlIHthbnl9ICovXG4gIGwsIGw7XG59XG5jbGFzcyBvZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8qKlxuICAgICAqICMjIyBQUklWQVRFIEFQSVxuICAgICAqXG4gICAgICogRG8gbm90IHVzZSwgbWF5IGNoYW5nZSBhdCBhbnkgdGltZVxuICAgICAqXG4gICAgICogQHR5cGUge2FueX1cbiAgICAgKi9cbiAgICBMKHRoaXMsIFwiJCRcIik7XG4gICAgLyoqXG4gICAgICogIyMjIFBSSVZBVEUgQVBJXG4gICAgICpcbiAgICAgKiBEbyBub3QgdXNlLCBtYXkgY2hhbmdlIGF0IGFueSB0aW1lXG4gICAgICpcbiAgICAgKiBAdHlwZSB7YW55fVxuICAgICAqL1xuICAgIEwodGhpcywgXCIkJHNldFwiKTtcbiAgfVxuICAvKiogQHJldHVybnMge3ZvaWR9ICovXG4gICRkZXN0cm95KCkge1xuICAgIFEodGhpcywgMSksIHRoaXMuJGRlc3Ryb3kgPSBLO1xuICB9XG4gIC8qKlxuICAgKiBAdGVtcGxhdGUge0V4dHJhY3Q8a2V5b2YgRXZlbnRzLCBzdHJpbmc+fSBLXG4gICAqIEBwYXJhbSB7S30gdHlwZVxuICAgKiBAcGFyYW0geygoZTogRXZlbnRzW0tdKSA9PiB2b2lkKSB8IG51bGwgfCB1bmRlZmluZWR9IGNhbGxiYWNrXG4gICAqIEByZXR1cm5zIHsoKSA9PiB2b2lkfVxuICAgKi9cbiAgJG9uKGUsIHQpIHtcbiAgICBpZiAoIVBlKHQpKVxuICAgICAgcmV0dXJuIEs7XG4gICAgY29uc3QgaSA9IHRoaXMuJCQuY2FsbGJhY2tzW2VdIHx8ICh0aGlzLiQkLmNhbGxiYWNrc1tlXSA9IFtdKTtcbiAgICByZXR1cm4gaS5wdXNoKHQpLCAoKSA9PiB7XG4gICAgICBjb25zdCBzID0gaS5pbmRleE9mKHQpO1xuICAgICAgcyAhPT0gLTEgJiYgaS5zcGxpY2UocywgMSk7XG4gICAgfTtcbiAgfVxuICAvKipcbiAgICogQHBhcmFtIHtQYXJ0aWFsPFByb3BzPn0gcHJvcHNcbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICAkc2V0KGUpIHtcbiAgICB0aGlzLiQkc2V0ICYmICFEbihlKSAmJiAodGhpcy4kJC5za2lwX2JvdW5kID0gITAsIHRoaXMuJCRzZXQoZSksIHRoaXMuJCQuc2tpcF9ib3VuZCA9ICExKTtcbiAgfVxufVxuY29uc3Qgam4gPSBcIjRcIjtcbnR5cGVvZiB3aW5kb3cgPCBcInVcIiAmJiAod2luZG93Ll9fc3ZlbHRlIHx8ICh3aW5kb3cuX19zdmVsdGUgPSB7IHY6IC8qIEBfX1BVUkVfXyAqLyBuZXcgU2V0KCkgfSkpLnYuYWRkKGpuKTtcbmNsYXNzIEtuIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgTCh0aGlzLCBcImtleUNvdW50ZXJcIiwgMCk7XG4gIH1cbiAgZ2V0TmV3S2V5KCkge1xuICAgIHJldHVybiAodGhpcy5rZXlDb3VudGVyKyspLnRvU3RyaW5nKDE2KTtcbiAgfVxufVxudmFyIGdlID0gbmV3IEtuKCk7XG5jbGFzcyB6ZSB7XG4gIGNvbnN0cnVjdG9yKGUgPSBcIk5PTkVcIiwgdCA9IFwie31cIikge1xuICAgIEwodGhpcywgXCJpZFwiKTtcbiAgICBMKHRoaXMsIFwidHlwZVwiKTtcbiAgICBMKHRoaXMsIFwiZGF0YVwiKTtcbiAgICB0aGlzLmlkID0gZ2UuZ2V0TmV3S2V5KCksIHRoaXMudHlwZSA9IGUsIHRoaXMuZGF0YSA9IEpTT04ucGFyc2UodCk7XG4gIH1cbn1cbmNsYXNzIG90IHtcbiAgY29uc3RydWN0b3IoZSA9IFtdKSB7XG4gICAgTCh0aGlzLCBcImlkXCIpO1xuICAgIEwodGhpcywgXCJkYXRhXCIsIFtdKTtcbiAgICB0aGlzLmlkID0gZ2UuZ2V0TmV3S2V5KCksIHRoaXMuZGF0YSA9IFtdLCBlLmZvckVhY2goKHQpID0+IHtcbiAgICAgIHQgIT0gbnVsbCAmJiB0LmRhdGEgJiYgdC50eXBlID8gdGhpcy5kYXRhLnB1c2gobmV3IHplKHQudHlwZSwgdC5kYXRhKSkgOiB0aGlzLmRhdGEucHVzaChuZXcgemUoKSk7XG4gICAgfSk7XG4gIH1cbiAgYWRkSXRlbSgpIHtcbiAgICB0aGlzLmRhdGEucHVzaChuZXcgemUoKSk7XG4gIH1cbiAgcmVtSXRlbShlKSB7XG4gICAgbGV0IHQgPSB0aGlzLmRhdGEuZmluZEluZGV4KChpKSA9PiBpLmlkID09IGUpO1xuICAgIGlmICh0ID09IC0xKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiY2FudCByZW1vdmUgY29sdW1uLCBzaW5jZSBpZCBpcyBub3QgcHJlc2VudCBpbiBkYXRhXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmRhdGEuc3BsaWNlKHQsIDEpO1xuICB9XG59XG5jbGFzcyBkdCB7XG4gIGNvbnN0cnVjdG9yKGUgPSBbXSkge1xuICAgIEwodGhpcywgXCJpZFwiKTtcbiAgICBMKHRoaXMsIFwiZGF0YVwiLCBbXSk7XG4gICAgdGhpcy5pZCA9IGdlLmdldE5ld0tleSgpLCB0aGlzLmRhdGEgPSBbXSwgZS5mb3JFYWNoKCh0KSA9PiB7XG4gICAgICB0aGlzLmRhdGEucHVzaChuZXcgb3QodC5kYXRhKSk7XG4gICAgfSk7XG4gIH1cbiAgYWRkQ29sdW1uKCkge1xuICAgIHRoaXMuZGF0YS5wdXNoKG5ldyBvdCgpKTtcbiAgfVxuICByZW1Db2x1bW4oZSkge1xuICAgIGxldCB0ID0gdGhpcy5kYXRhLmZpbmRJbmRleCgoaSkgPT4gaS5pZCA9PSBlKTtcbiAgICBpZiAodCA9PSAtMSkge1xuICAgICAgY29uc29sZS5lcnJvcihcImNhbnQgcmVtb3ZlIGNvbHVtbiwgc2luY2UgaWQgaXMgbm90IHByZXNlbnQgaW4gZGF0YVwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5kYXRhLnNwbGljZSh0LCAxKTtcbiAgfVxufVxuY2xhc3MgRm4ge1xuICBjb25zdHJ1Y3RvcihlKSB7XG4gICAgTCh0aGlzLCBcImlkXCIpO1xuICAgIEwodGhpcywgXCJkYXRhXCIsIFtdKTtcbiAgICB0aGlzLmlkID0gZ2UuZ2V0TmV3S2V5KCksIHRoaXMuZGF0YSA9IFtdLCBlLmZvckVhY2goKHQpID0+IHtcbiAgICAgIHQuZGF0YSAmJiB0aGlzLmRhdGEucHVzaChuZXcgZHQodC5kYXRhKSk7XG4gICAgfSk7XG4gIH1cbiAgYWRkUm93KCkge1xuICAgIHRoaXMuZGF0YS5wdXNoKG5ldyBkdCgpKTtcbiAgfVxuICByZW1Sb3coZSkge1xuICAgIGxldCB0ID0gdGhpcy5kYXRhLmZpbmRJbmRleCgoaSkgPT4gaS5pZCA9PSBlKTtcbiAgICBpZiAodCA9PSAtMSkge1xuICAgICAgY29uc29sZS5lcnJvcihcImNhbnQgcmVtb3ZlIFJvdywgc2luY2UgaWQgaXMgbm90IHByZXNlbnQgaW4gZGF0YVwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5kYXRhLnNwbGljZSh0LCAxKTtcbiAgfVxufVxuY29uc3QgJGUgPSBbXTtcbmZ1bmN0aW9uIE9lKG4sIGUgPSBLKSB7XG4gIGxldCB0O1xuICBjb25zdCBpID0gLyogQF9fUFVSRV9fICovIG5ldyBTZXQoKTtcbiAgZnVuY3Rpb24gcyhyKSB7XG4gICAgaWYgKHRlKG4sIHIpICYmIChuID0gciwgdCkpIHtcbiAgICAgIGNvbnN0IG8gPSAhJGUubGVuZ3RoO1xuICAgICAgZm9yIChjb25zdCBkIG9mIGkpXG4gICAgICAgIGRbMV0oKSwgJGUucHVzaChkLCBuKTtcbiAgICAgIGlmIChvKSB7XG4gICAgICAgIGZvciAobGV0IGQgPSAwOyBkIDwgJGUubGVuZ3RoOyBkICs9IDIpXG4gICAgICAgICAgJGVbZF1bMF0oJGVbZCArIDFdKTtcbiAgICAgICAgJGUubGVuZ3RoID0gMDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gYShyKSB7XG4gICAgcyhyKG4pKTtcbiAgfVxuICBmdW5jdGlvbiBsKHIsIG8gPSBLKSB7XG4gICAgY29uc3QgZCA9IFtyLCBvXTtcbiAgICByZXR1cm4gaS5hZGQoZCksIGkuc2l6ZSA9PT0gMSAmJiAodCA9IGUocywgYSkgfHwgSyksIHIobiksICgpID0+IHtcbiAgICAgIGkuZGVsZXRlKGQpLCBpLnNpemUgPT09IDAgJiYgdCAmJiAodCgpLCB0ID0gbnVsbCk7XG4gICAgfTtcbiAgfVxuICByZXR1cm4geyBzZXQ6IHMsIHVwZGF0ZTogYSwgc3Vic2NyaWJlOiBsIH07XG59XG5mdW5jdGlvbiBzdChuKSB7XG4gIGNvbnN0IGUgPSBuIC0gMTtcbiAgcmV0dXJuIGUgKiBlICogZSArIDE7XG59XG5mdW5jdGlvbiBUZShuLCB7IGRlbGF5OiBlID0gMCwgZHVyYXRpb246IHQgPSA0MDAsIGVhc2luZzogaSA9IFFlIH0gPSB7fSkge1xuICBjb25zdCBzID0gK2dldENvbXB1dGVkU3R5bGUobikub3BhY2l0eTtcbiAgcmV0dXJuIHtcbiAgICBkZWxheTogZSxcbiAgICBkdXJhdGlvbjogdCxcbiAgICBlYXNpbmc6IGksXG4gICAgY3NzOiAoYSkgPT4gYG9wYWNpdHk6ICR7YSAqIHN9YFxuICB9O1xufVxuZnVuY3Rpb24gdXQobiwgeyBkZWxheTogZSA9IDAsIGR1cmF0aW9uOiB0ID0gNDAwLCBlYXNpbmc6IGkgPSBzdCwgeDogcyA9IDAsIHk6IGEgPSAwLCBvcGFjaXR5OiBsID0gMCB9ID0ge30pIHtcbiAgY29uc3QgciA9IGdldENvbXB1dGVkU3R5bGUobiksIG8gPSArci5vcGFjaXR5LCBkID0gci50cmFuc2Zvcm0gPT09IFwibm9uZVwiID8gXCJcIiA6IHIudHJhbnNmb3JtLCB1ID0gbyAqICgxIC0gbCksIFtfLCBmXSA9IHJ0KHMpLCBbaCwgY10gPSBydChhKTtcbiAgcmV0dXJuIHtcbiAgICBkZWxheTogZSxcbiAgICBkdXJhdGlvbjogdCxcbiAgICBlYXNpbmc6IGksXG4gICAgY3NzOiAoeSwgcCkgPT4gYFxuXHRcdFx0dHJhbnNmb3JtOiAke2R9IHRyYW5zbGF0ZSgkeygxIC0geSkgKiBffSR7Zn0sICR7KDEgLSB5KSAqIGh9JHtjfSk7XG5cdFx0XHRvcGFjaXR5OiAke28gLSB1ICogcH1gXG4gIH07XG59XG5mdW5jdGlvbiBhZShuLCB7IGRlbGF5OiBlID0gMCwgZHVyYXRpb246IHQgPSA0MDAsIGVhc2luZzogaSA9IHN0LCBheGlzOiBzID0gXCJ5XCIgfSA9IHt9KSB7XG4gIGNvbnN0IGEgPSBnZXRDb21wdXRlZFN0eWxlKG4pLCBsID0gK2Eub3BhY2l0eSwgciA9IHMgPT09IFwieVwiID8gXCJoZWlnaHRcIiA6IFwid2lkdGhcIiwgbyA9IHBhcnNlRmxvYXQoYVtyXSksIGQgPSBzID09PSBcInlcIiA/IFtcInRvcFwiLCBcImJvdHRvbVwiXSA6IFtcImxlZnRcIiwgXCJyaWdodFwiXSwgdSA9IGQubWFwKFxuICAgICh2KSA9PiBgJHt2WzBdLnRvVXBwZXJDYXNlKCl9JHt2LnNsaWNlKDEpfWBcbiAgKSwgXyA9IHBhcnNlRmxvYXQoYVtgcGFkZGluZyR7dVswXX1gXSksIGYgPSBwYXJzZUZsb2F0KGFbYHBhZGRpbmcke3VbMV19YF0pLCBoID0gcGFyc2VGbG9hdChhW2BtYXJnaW4ke3VbMF19YF0pLCBjID0gcGFyc2VGbG9hdChhW2BtYXJnaW4ke3VbMV19YF0pLCB5ID0gcGFyc2VGbG9hdChcbiAgICBhW2Bib3JkZXIke3VbMF19V2lkdGhgXVxuICApLCBwID0gcGFyc2VGbG9hdChcbiAgICBhW2Bib3JkZXIke3VbMV19V2lkdGhgXVxuICApO1xuICByZXR1cm4ge1xuICAgIGRlbGF5OiBlLFxuICAgIGR1cmF0aW9uOiB0LFxuICAgIGVhc2luZzogaSxcbiAgICBjc3M6ICh2KSA9PiBgb3ZlcmZsb3c6IGhpZGRlbjtvcGFjaXR5OiAke01hdGgubWluKHYgKiAyMCwgMSkgKiBsfTske3J9OiAke3YgKiBvfXB4O3BhZGRpbmctJHtkWzBdfTogJHt2ICogX31weDtwYWRkaW5nLSR7ZFsxXX06ICR7diAqIGZ9cHg7bWFyZ2luLSR7ZFswXX06ICR7diAqIGh9cHg7bWFyZ2luLSR7ZFsxXX06ICR7diAqIGN9cHg7Ym9yZGVyLSR7ZFswXX0td2lkdGg6ICR7diAqIHl9cHg7Ym9yZGVyLSR7ZFsxXX0td2lkdGg6ICR7diAqIHB9cHg7YFxuICB9O1xufVxuZnVuY3Rpb24gcW4obiwgeyBmcm9tOiBlLCB0bzogdCB9LCBpID0ge30pIHtcbiAgY29uc3QgcyA9IGdldENvbXB1dGVkU3R5bGUobiksIGEgPSBzLnRyYW5zZm9ybSA9PT0gXCJub25lXCIgPyBcIlwiIDogcy50cmFuc2Zvcm0sIFtsLCByXSA9IHMudHJhbnNmb3JtT3JpZ2luLnNwbGl0KFwiIFwiKS5tYXAocGFyc2VGbG9hdCksIG8gPSBlLmxlZnQgKyBlLndpZHRoICogbCAvIHQud2lkdGggLSAodC5sZWZ0ICsgbCksIGQgPSBlLnRvcCArIGUuaGVpZ2h0ICogciAvIHQuaGVpZ2h0IC0gKHQudG9wICsgciksIHsgZGVsYXk6IHUgPSAwLCBkdXJhdGlvbjogXyA9IChoKSA9PiBNYXRoLnNxcnQoaCkgKiAxMjAsIGVhc2luZzogZiA9IHN0IH0gPSBpO1xuICByZXR1cm4ge1xuICAgIGRlbGF5OiB1LFxuICAgIGR1cmF0aW9uOiBQZShfKSA/IF8oTWF0aC5zcXJ0KG8gKiBvICsgZCAqIGQpKSA6IF8sXG4gICAgZWFzaW5nOiBmLFxuICAgIGNzczogKGgsIGMpID0+IHtcbiAgICAgIGNvbnN0IHkgPSBjICogbywgcCA9IGMgKiBkLCB2ID0gaCArIGMgKiBlLndpZHRoIC8gdC53aWR0aCwgQyA9IGggKyBjICogZS5oZWlnaHQgLyB0LmhlaWdodDtcbiAgICAgIHJldHVybiBgdHJhbnNmb3JtOiAke2F9IHRyYW5zbGF0ZSgke3l9cHgsICR7cH1weCkgc2NhbGUoJHt2fSwgJHtDfSk7YDtcbiAgICB9XG4gIH07XG59XG52YXIgX2UgPSAvKiBAX19QVVJFX18gKi8gKChuKSA9PiAobi5IaXRQb2ludHMgPSBcIkhpdFBvaW50c1wiLCBuLlByb2ZpY2llbmN5Qm9udXMgPSBcIlByb2ZpY2llbmN5Qm9udXNcIiwgbi5Ta2lsbFByb2ZpY2llbmNpZXMgPSBcIlNraWxsUHJvZmljaWVuY2llc1wiLCBuLlNwZWxsSW5mbyA9IFwiU3BlbGxJbmZvXCIsIG4uU3RhdHMgPSBcIlN0YXRzXCIsIG4pKShfZSB8fCB7fSk7XG5mdW5jdGlvbiBmdChuLCBlLCB0KSB7XG4gIGNvbnN0IGkgPSBuLnNsaWNlKCk7XG4gIHJldHVybiBpWzIzXSA9IGVbdF0sIGk7XG59XG5mdW5jdGlvbiBjdChuKSB7XG4gIGxldCBlLCB0ID0gKFxuICAgIC8qc2VsZWN0ZWQqL1xuICAgIChuWzBdID09IG51bGwgPyAoXG4gICAgICAvKnVuU2VsZWN0ZWRwbGFjZWhvbGRlciovXG4gICAgICBuWzJdXG4gICAgKSA6IChcbiAgICAgIC8qc2VsZWN0ZWQqL1xuICAgICAgblswXVxuICAgICkpICsgXCJcIlxuICApLCBpLCBzLCBhLCBsLCByLCBvO1xuICByZXR1cm4ge1xuICAgIGMoKSB7XG4gICAgICBlID0gJChcImRpdlwiKSwgaSA9IEcodCksIGcoZSwgXCJjbGFzc1wiLCBcIkdyb2JTZWxlY3RMYWJlbCBlZmZlY3RcIiksIGcoZSwgXCJkYXRhLWlzZGlzYWJsZWRcIiwgcyA9IC8qZGlzYWJsZWQqL1xuICAgICAgblszXSA/PyAhMSksIGcoZSwgXCJkYXRhLWlzZXJyb3JcIiwgYSA9IC8qaXNFcnJvciovXG4gICAgICBuWzRdID8/ICExKSwgZyhlLCBcImRhdGEtc2VsZWN0ZWRcIiwgbCA9IC8qc2VsZWN0ZWQqL1xuICAgICAgblswXSA/PyAhMSksIGcoZSwgXCJ0YWJpbmRleFwiLCBcIi0xXCIpO1xuICAgIH0sXG4gICAgbShkLCB1KSB7XG4gICAgICBCKGQsIGUsIHUpLCBiKGUsIGkpLCBuWzE3XShlKSwgciB8fCAobyA9IFtcbiAgICAgICAgVShcbiAgICAgICAgICBlLFxuICAgICAgICAgIFwiZm9jdXNcIixcbiAgICAgICAgICAvKm9uRm9jdXMqL1xuICAgICAgICAgIG5bMTNdXG4gICAgICAgICksXG4gICAgICAgIFUoXG4gICAgICAgICAgZSxcbiAgICAgICAgICBcImJsdXJcIixcbiAgICAgICAgICAvKm9uYmx1ciovXG4gICAgICAgICAgblsxNF1cbiAgICAgICAgKVxuICAgICAgXSwgciA9ICEwKTtcbiAgICB9LFxuICAgIHAoZCwgdSkge1xuICAgICAgdSAmIC8qc2VsZWN0ZWQsIHVuU2VsZWN0ZWRwbGFjZWhvbGRlciovXG4gICAgICA1ICYmIHQgIT09ICh0ID0gLypzZWxlY3RlZCovXG4gICAgICAoZFswXSA9PSBudWxsID8gKFxuICAgICAgICAvKnVuU2VsZWN0ZWRwbGFjZWhvbGRlciovXG4gICAgICAgIGRbMl1cbiAgICAgICkgOiAoXG4gICAgICAgIC8qc2VsZWN0ZWQqL1xuICAgICAgICBkWzBdXG4gICAgICApKSArIFwiXCIpICYmIGRlKGksIHQpLCB1ICYgLypkaXNhYmxlZCovXG4gICAgICA4ICYmIHMgIT09IChzID0gLypkaXNhYmxlZCovXG4gICAgICBkWzNdID8/ICExKSAmJiBnKGUsIFwiZGF0YS1pc2Rpc2FibGVkXCIsIHMpLCB1ICYgLyppc0Vycm9yKi9cbiAgICAgIDE2ICYmIGEgIT09IChhID0gLyppc0Vycm9yKi9cbiAgICAgIGRbNF0gPz8gITEpICYmIGcoZSwgXCJkYXRhLWlzZXJyb3JcIiwgYSksIHUgJiAvKnNlbGVjdGVkKi9cbiAgICAgIDEgJiYgbCAhPT0gKGwgPSAvKnNlbGVjdGVkKi9cbiAgICAgIGRbMF0gPz8gITEpICYmIGcoZSwgXCJkYXRhLXNlbGVjdGVkXCIsIGwpO1xuICAgIH0sXG4gICAgZChkKSB7XG4gICAgICBkICYmIE4oZSksIG5bMTddKG51bGwpLCByID0gITEsIFkobyk7XG4gICAgfVxuICB9O1xufVxuZnVuY3Rpb24gaHQobikge1xuICBsZXQgZSwgdCwgaSwgcywgYSwgbCA9IFtdLCByID0gLyogQF9fUFVSRV9fICovIG5ldyBNYXAoKSwgbywgZCwgdSwgXywgZiwgaCwgYyA9IHNlKFxuICAgIC8qb3B0aW9ucyovXG4gICAgblsxXVxuICApO1xuICBjb25zdCB5ID0gKHYpID0+IChcbiAgICAvKm9wdCovXG4gICAgdlsyM11cbiAgKTtcbiAgZm9yIChsZXQgdiA9IDA7IHYgPCBjLmxlbmd0aDsgdiArPSAxKSB7XG4gICAgbGV0IEMgPSBmdChuLCBjLCB2KSwgbSA9IHkoQyk7XG4gICAgci5zZXQobSwgbFt2XSA9IGd0KG0sIEMpKTtcbiAgfVxuICBsZXQgcCA9IChcbiAgICAvKm9wdGlvbnMqL1xuICAgIG5bMV0ubGVuZ3RoID09IDAgJiYgX3QoKVxuICApO1xuICByZXR1cm4ge1xuICAgIGMoKSB7XG4gICAgICB2YXIgdiwgQywgbSwgUztcbiAgICAgIGUgPSAkKFwiZGl2XCIpLCB0ID0gJChcImRpdlwiKSwgaSA9ICQoXCJkaXZcIiksIGEgPSBqKCk7XG4gICAgICBmb3IgKGxldCBEID0gMDsgRCA8IGwubGVuZ3RoOyBEICs9IDEpXG4gICAgICAgIGxbRF0uYygpO1xuICAgICAgbyA9IGooKSwgcCAmJiBwLmMoKSwgZCA9IGooKSwgdSA9ICQoXCJkaXZcIiksIGcoaSwgXCJjbGFzc1wiLCBcIkFycm93XCIpLCBnKGksIFwic3R5bGVcIiwgcyA9IGBsZWZ0OiR7LyphcnJvd09mZnNldExlZnQqL1xuICAgICAgblsxMl19cHhgKSwgZyh0LCBcImNsYXNzXCIsIFwiQXJyb3dDb250YWluZXIgXCIpLCBnKHUsIFwiY2xhc3NcIiwgXCJzZWxlY3RFbmRUcmFja2VyXCIpLCBnKGUsIFwiY2xhc3NcIiwgXCJTZWxlY3RQb3BVcFwiKSwgZyhlLCBcInN0eWxlXCIsIF8gPSBcIndpZHRoOlwiICsgLypsYWJlbFJlY3QqL1xuICAgICAgKCgodiA9IG5bN10pID09IG51bGwgPyB2b2lkIDAgOiB2LndpZHRoKSA/PyAxMDApICsgXCJweDtsZWZ0OiBcIiArIC8qbGFiZWxSZWN0Ki9cbiAgICAgICgoKEMgPSBuWzddKSA9PSBudWxsID8gdm9pZCAwIDogQy54KSA/PyAwKSArIFwicHg7dG9wOiBcIiArIC8qbGFiZWxSZWN0Ki9cbiAgICAgICgoKChtID0gbls3XSkgPT0gbnVsbCA/IHZvaWQgMCA6IG0ueSkgPz8gMCkgKyAvKmxhYmVsUmVjdCovXG4gICAgICAoKChTID0gbls3XSkgPT0gbnVsbCA/IHZvaWQgMCA6IFMuaGVpZ2h0KSA/PyAwKSArIDgpICsgXCJweDttYXgtaGVpZ2h0OlwiICsgLypvdmVycmlkZV9tYXhIZWlnaHQqL1xuICAgICAgblsxMV0gKyBcInB4XCIpO1xuICAgIH0sXG4gICAgbSh2LCBDKSB7XG4gICAgICBCKHYsIGUsIEMpLCBiKGUsIHQpLCBiKHQsIGkpLCBuWzE4XSh0KSwgYihlLCBhKTtcbiAgICAgIGZvciAobGV0IG0gPSAwOyBtIDwgbC5sZW5ndGg7IG0gKz0gMSlcbiAgICAgICAgbFttXSAmJiBsW21dLm0oZSwgbnVsbCk7XG4gICAgICBiKGUsIG8pLCBwICYmIHAubShlLCBudWxsKSwgYihlLCBkKSwgYihlLCB1KSwgblsxOV0odSksIGggPSAhMDtcbiAgICB9LFxuICAgIHAodiwgQykge1xuICAgICAgdmFyIG0sIFMsIEQsIEE7XG4gICAgICAoIWggfHwgQyAmIC8qYXJyb3dPZmZzZXRMZWZ0Ki9cbiAgICAgIDQwOTYgJiYgcyAhPT0gKHMgPSBgbGVmdDokey8qYXJyb3dPZmZzZXRMZWZ0Ki9cbiAgICAgIHZbMTJdfXB4YCkpICYmIGcoaSwgXCJzdHlsZVwiLCBzKSwgQyAmIC8qc2VsZWN0ZWQsIG9wdGlvbnMsIGNsaWNrT3B0aW9uKi9cbiAgICAgIDMyNzcxICYmIChjID0gc2UoXG4gICAgICAgIC8qb3B0aW9ucyovXG4gICAgICAgIHZbMV1cbiAgICAgICksIGwgPSBLZShsLCBDLCB5LCAxLCB2LCBjLCByLCBlLCBVbiwgZ3QsIG8sIGZ0KSksIC8qb3B0aW9ucyovXG4gICAgICB2WzFdLmxlbmd0aCA9PSAwID8gcCB8fCAocCA9IF90KCksIHAuYygpLCBwLm0oZSwgZCkpIDogcCAmJiAocC5kKDEpLCBwID0gbnVsbCksICghaCB8fCBDICYgLypsYWJlbFJlY3QsIG92ZXJyaWRlX21heEhlaWdodCovXG4gICAgICAyMTc2ICYmIF8gIT09IChfID0gXCJ3aWR0aDpcIiArIC8qbGFiZWxSZWN0Ki9cbiAgICAgICgoKG0gPSB2WzddKSA9PSBudWxsID8gdm9pZCAwIDogbS53aWR0aCkgPz8gMTAwKSArIFwicHg7bGVmdDogXCIgKyAvKmxhYmVsUmVjdCovXG4gICAgICAoKChTID0gdls3XSkgPT0gbnVsbCA/IHZvaWQgMCA6IFMueCkgPz8gMCkgKyBcInB4O3RvcDogXCIgKyAvKmxhYmVsUmVjdCovXG4gICAgICAoKCgoRCA9IHZbN10pID09IG51bGwgPyB2b2lkIDAgOiBELnkpID8/IDApICsgLypsYWJlbFJlY3QqL1xuICAgICAgKCgoQSA9IHZbN10pID09IG51bGwgPyB2b2lkIDAgOiBBLmhlaWdodCkgPz8gMCkgKyA4KSArIFwicHg7bWF4LWhlaWdodDpcIiArIC8qb3ZlcnJpZGVfbWF4SGVpZ2h0Ki9cbiAgICAgIHZbMTFdICsgXCJweFwiKSkgJiYgZyhlLCBcInN0eWxlXCIsIF8pO1xuICAgIH0sXG4gICAgaSh2KSB7XG4gICAgICBoIHx8ICh2ICYmIGllKCgpID0+IHtcbiAgICAgICAgaCAmJiAoZiB8fCAoZiA9IHooZSwgYWUsIHt9LCAhMCkpLCBmLnJ1bigxKSk7XG4gICAgICB9KSwgaCA9ICEwKTtcbiAgICB9LFxuICAgIG8odikge1xuICAgICAgdiAmJiAoZiB8fCAoZiA9IHooZSwgYWUsIHt9LCAhMSkpLCBmLnJ1bigwKSksIGggPSAhMTtcbiAgICB9LFxuICAgIGQodikge1xuICAgICAgdiAmJiBOKGUpLCBuWzE4XShudWxsKTtcbiAgICAgIGZvciAobGV0IEMgPSAwOyBDIDwgbC5sZW5ndGg7IEMgKz0gMSlcbiAgICAgICAgbFtDXS5kKCk7XG4gICAgICBwICYmIHAuZCgpLCBuWzE5XShudWxsKSwgdiAmJiBmICYmIGYuZW5kKCk7XG4gICAgfVxuICB9O1xufVxuZnVuY3Rpb24gZ3QobiwgZSkge1xuICBsZXQgdCwgaSA9IChcbiAgICAvKm9wdCovXG4gICAgZVsyM10gKyBcIlwiXG4gICksIHMsIGEsIGwsIHIsIG87XG4gIHJldHVybiB7XG4gICAga2V5OiBuLFxuICAgIGZpcnN0OiBudWxsLFxuICAgIGMoKSB7XG4gICAgICB0ID0gJChcImRpdlwiKSwgcyA9IEcoaSksIGcodCwgXCJjbGFzc1wiLCBcIkdyb2JTZWxlY3RPcHRpb25cIiksIGcodCwgXCJkYXRhLXNlbGVjdGVkXCIsIGEgPSAvKnNlbGVjdGVkKi9cbiAgICAgIGVbMF0gPT0gLypvcHQqL1xuICAgICAgZVsyM10pLCBnKHQsIFwiZGF0YS12YWx1ZVwiLCBsID0gLypvcHQqL1xuICAgICAgZVsyM10pLCB0aGlzLmZpcnN0ID0gdDtcbiAgICB9LFxuICAgIG0oZCwgdSkge1xuICAgICAgQihkLCB0LCB1KSwgYih0LCBzKSwgciB8fCAobyA9IFtcbiAgICAgICAgVShcbiAgICAgICAgICB0LFxuICAgICAgICAgIFwiY2xpY2tcIixcbiAgICAgICAgICAvKmNsaWNrT3B0aW9uKi9cbiAgICAgICAgICBlWzE1XVxuICAgICAgICApLFxuICAgICAgICBVKFxuICAgICAgICAgIHQsXG4gICAgICAgICAgXCJrZXlkb3duXCIsXG4gICAgICAgICAgLypjbGlja09wdGlvbiovXG4gICAgICAgICAgZVsxNV1cbiAgICAgICAgKVxuICAgICAgXSwgciA9ICEwKTtcbiAgICB9LFxuICAgIHAoZCwgdSkge1xuICAgICAgZSA9IGQsIHUgJiAvKm9wdGlvbnMqL1xuICAgICAgMiAmJiBpICE9PSAoaSA9IC8qb3B0Ki9cbiAgICAgIGVbMjNdICsgXCJcIikgJiYgZGUocywgaSksIHUgJiAvKnNlbGVjdGVkLCBvcHRpb25zKi9cbiAgICAgIDMgJiYgYSAhPT0gKGEgPSAvKnNlbGVjdGVkKi9cbiAgICAgIGVbMF0gPT0gLypvcHQqL1xuICAgICAgZVsyM10pICYmIGcodCwgXCJkYXRhLXNlbGVjdGVkXCIsIGEpLCB1ICYgLypvcHRpb25zKi9cbiAgICAgIDIgJiYgbCAhPT0gKGwgPSAvKm9wdCovXG4gICAgICBlWzIzXSkgJiYgZyh0LCBcImRhdGEtdmFsdWVcIiwgbCk7XG4gICAgfSxcbiAgICBkKGQpIHtcbiAgICAgIGQgJiYgTih0KSwgciA9ICExLCBZKG8pO1xuICAgIH1cbiAgfTtcbn1cbmZ1bmN0aW9uIF90KG4pIHtcbiAgbGV0IGU7XG4gIHJldHVybiB7XG4gICAgYygpIHtcbiAgICAgIGUgPSAkKFwiaVwiKSwgZS50ZXh0Q29udGVudCA9IFwiTm8gT3B0aW9uc1wiLCBnKGUsIFwiY2xhc3NcIiwgXCJHcm9iU2VsZWN0SW5mb1wiKTtcbiAgICB9LFxuICAgIG0odCwgaSkge1xuICAgICAgQih0LCBlLCBpKTtcbiAgICB9LFxuICAgIGQodCkge1xuICAgICAgdCAmJiBOKGUpO1xuICAgIH1cbiAgfTtcbn1cbmZ1bmN0aW9uIEpuKG4pIHtcbiAgbGV0IGUsIHQgPSAoXG4gICAgLypzZWxlY3RlZCovXG4gICAgblswXVxuICApLCBpLCBzLCBhID0gY3QobiksIGwgPSAoXG4gICAgLyppc0ZvY3Vzc2VkKi9cbiAgICAobls4XSB8fCAvKmZvcmNlT3BlbiovXG4gICAgbls1XSkgJiYgaHQobilcbiAgKTtcbiAgcmV0dXJuIHtcbiAgICBjKCkge1xuICAgICAgZSA9ICQoXCJkaXZcIiksIGEuYygpLCBpID0gaigpLCBzID0gJChcImRpdlwiKSwgbCAmJiBsLmMoKSwgZyhlLCBcImNsYXNzXCIsIFwiR3JvYlNlbGVjdFwiKTtcbiAgICB9LFxuICAgIG0ociwgbykge1xuICAgICAgQihyLCBlLCBvKSwgYS5tKGUsIG51bGwpLCBiKGUsIGkpLCBiKGUsIHMpLCBsICYmIGwubShzLCBudWxsKTtcbiAgICB9LFxuICAgIHAociwgW29dKSB7XG4gICAgICBvICYgLypzZWxlY3RlZCovXG4gICAgICAxICYmIHRlKHQsIHQgPSAvKnNlbGVjdGVkKi9cbiAgICAgIHJbMF0pID8gKGEuZCgxKSwgYSA9IGN0KHIpLCBhLmMoKSwgYS5tKGUsIGkpKSA6IGEucChyLCBvKSwgLyppc0ZvY3Vzc2VkKi9cbiAgICAgIHJbOF0gfHwgLypmb3JjZU9wZW4qL1xuICAgICAgcls1XSA/IGwgPyAobC5wKHIsIG8pLCBvICYgLyppc0ZvY3Vzc2VkLCBmb3JjZU9wZW4qL1xuICAgICAgMjg4ICYmIFIobCwgMSkpIDogKGwgPSBodChyKSwgbC5jKCksIFIobCwgMSksIGwubShzLCBudWxsKSkgOiBsICYmICh1ZSgpLCBQKGwsIDEsIDEsICgpID0+IHtcbiAgICAgICAgbCA9IG51bGw7XG4gICAgICB9KSwgZmUoKSk7XG4gICAgfSxcbiAgICBpKHIpIHtcbiAgICAgIFIobCk7XG4gICAgfSxcbiAgICBvKHIpIHtcbiAgICAgIFAobCk7XG4gICAgfSxcbiAgICBkKHIpIHtcbiAgICAgIHIgJiYgTihlKSwgYS5kKHIpLCBsICYmIGwuZCgpO1xuICAgIH1cbiAgfTtcbn1cbmNvbnN0IHpuID0gMTAwO1xuZnVuY3Rpb24gWW4obiwgZSwgdCkge1xuICBsZXQgaSA9IG50KCksIHsgb3B0aW9uczogcyB9ID0gZSwgeyBzZWxlY3RlZDogYSA9IG51bGwgfSA9IGUsIHsgdW5TZWxlY3RlZHBsYWNlaG9sZGVyOiBsID0gXCJOb25lIFNlbGVjdGVkXCIgfSA9IGUsIHsgZGlzYWJsZWQ6IHIgPSAhMSB9ID0gZSwgeyBpc0Vycm9yOiBvID0gITEgfSA9IGUsIHsgZm9yY2VPcGVuOiBkID0gITEgfSA9IGUsIHsgbWF4SGVpZ2h0OiB1ID0gNTAwIH0gPSBlLCBfLCBmLCBoID0gITEsIGMsIHksIHAgPSB1LCB2ID0gMDtcbiAgZnVuY3Rpb24gQygpIHtcbiAgICBjb25zdCB3ID0gXy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB0KDcsIGYgPSB3KSwgdCg4LCBoID0gITApLCBBKCksIHNldFRpbWVvdXQoRCwgem4pO1xuICB9XG4gIGZ1bmN0aW9uIG0oKSB7XG4gICAgc2V0VGltZW91dChcbiAgICAgICgpID0+IHtcbiAgICAgICAgdCg4LCBoID0gITEpO1xuICAgICAgfSxcbiAgICAgIDIwMFxuICAgICk7XG4gIH1cbiAgZnVuY3Rpb24gUyh3KSB7XG4gICAgbGV0IEYgPSB3LnRhcmdldC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXZhbHVlXCIpO1xuICAgIGEgPT0gRiA/ICh0KDAsIGEgPSBudWxsKSwgaShcIm9uRGVzZWxlY3RcIikpIDogKHQoMCwgYSA9IEYpLCBpKFwib25TZWxlY3RcIiwgYSkpO1xuICB9XG4gIGZ1bmN0aW9uIEQoKSB7XG4gICAgbGV0IHcgPSB5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmJvdHRvbSwgRiA9IGMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuYm90dG9tLCBaID0gd2luZG93LmRvY3VtZW50LmJvZHkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgIGlmIChGID4gWikge1xuICAgICAgbGV0IHggPSBGIC0gWiwgayA9IEYgLSB3IC0geDtcbiAgICAgIGsgPCBwICYmIHQoMTEsIHAgPSBrKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gQSgpIHtcbiAgICBsZXQgdyA9IF8uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgdCgxMiwgdiA9IHcgLyAyKTtcbiAgfVxuICBmdW5jdGlvbiBIKHcpIHtcbiAgICBuZVt3ID8gXCJ1bnNoaWZ0XCIgOiBcInB1c2hcIl0oKCkgPT4ge1xuICAgICAgXyA9IHcsIHQoNiwgXyk7XG4gICAgfSk7XG4gIH1cbiAgZnVuY3Rpb24gSih3KSB7XG4gICAgbmVbdyA/IFwidW5zaGlmdFwiIDogXCJwdXNoXCJdKCgpID0+IHtcbiAgICAgIHkgPSB3LCB0KDEwLCB5KTtcbiAgICB9KTtcbiAgfVxuICBmdW5jdGlvbiBNKHcpIHtcbiAgICBuZVt3ID8gXCJ1bnNoaWZ0XCIgOiBcInB1c2hcIl0oKCkgPT4ge1xuICAgICAgYyA9IHcsIHQoOSwgYyk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIG4uJCRzZXQgPSAodykgPT4ge1xuICAgIFwib3B0aW9uc1wiIGluIHcgJiYgdCgxLCBzID0gdy5vcHRpb25zKSwgXCJzZWxlY3RlZFwiIGluIHcgJiYgdCgwLCBhID0gdy5zZWxlY3RlZCksIFwidW5TZWxlY3RlZHBsYWNlaG9sZGVyXCIgaW4gdyAmJiB0KDIsIGwgPSB3LnVuU2VsZWN0ZWRwbGFjZWhvbGRlciksIFwiZGlzYWJsZWRcIiBpbiB3ICYmIHQoMywgciA9IHcuZGlzYWJsZWQpLCBcImlzRXJyb3JcIiBpbiB3ICYmIHQoNCwgbyA9IHcuaXNFcnJvciksIFwiZm9yY2VPcGVuXCIgaW4gdyAmJiB0KDUsIGQgPSB3LmZvcmNlT3BlbiksIFwibWF4SGVpZ2h0XCIgaW4gdyAmJiB0KDE2LCB1ID0gdy5tYXhIZWlnaHQpO1xuICB9LCBbXG4gICAgYSxcbiAgICBzLFxuICAgIGwsXG4gICAgcixcbiAgICBvLFxuICAgIGQsXG4gICAgXyxcbiAgICBmLFxuICAgIGgsXG4gICAgYyxcbiAgICB5LFxuICAgIHAsXG4gICAgdixcbiAgICBDLFxuICAgIG0sXG4gICAgUyxcbiAgICB1LFxuICAgIEgsXG4gICAgSixcbiAgICBNXG4gIF07XG59XG5jbGFzcyBYdCBleHRlbmRzIG9lIHtcbiAgY29uc3RydWN0b3IoZSkge1xuICAgIHN1cGVyKCksIGxlKHRoaXMsIGUsIFluLCBKbiwgdGUsIHtcbiAgICAgIG9wdGlvbnM6IDEsXG4gICAgICBzZWxlY3RlZDogMCxcbiAgICAgIHVuU2VsZWN0ZWRwbGFjZWhvbGRlcjogMixcbiAgICAgIGRpc2FibGVkOiAzLFxuICAgICAgaXNFcnJvcjogNCxcbiAgICAgIGZvcmNlT3BlbjogNSxcbiAgICAgIG1heEhlaWdodDogMTZcbiAgICB9KTtcbiAgfVxuICBnZXQgb3B0aW9ucygpIHtcbiAgICByZXR1cm4gdGhpcy4kJC5jdHhbMV07XG4gIH1cbiAgc2V0IG9wdGlvbnMoZSkge1xuICAgIHRoaXMuJCRzZXQoeyBvcHRpb25zOiBlIH0pLCBFKCk7XG4gIH1cbiAgZ2V0IHNlbGVjdGVkKCkge1xuICAgIHJldHVybiB0aGlzLiQkLmN0eFswXTtcbiAgfVxuICBzZXQgc2VsZWN0ZWQoZSkge1xuICAgIHRoaXMuJCRzZXQoeyBzZWxlY3RlZDogZSB9KSwgRSgpO1xuICB9XG4gIGdldCB1blNlbGVjdGVkcGxhY2Vob2xkZXIoKSB7XG4gICAgcmV0dXJuIHRoaXMuJCQuY3R4WzJdO1xuICB9XG4gIHNldCB1blNlbGVjdGVkcGxhY2Vob2xkZXIoZSkge1xuICAgIHRoaXMuJCRzZXQoeyB1blNlbGVjdGVkcGxhY2Vob2xkZXI6IGUgfSksIEUoKTtcbiAgfVxuICBnZXQgZGlzYWJsZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuJCQuY3R4WzNdO1xuICB9XG4gIHNldCBkaXNhYmxlZChlKSB7XG4gICAgdGhpcy4kJHNldCh7IGRpc2FibGVkOiBlIH0pLCBFKCk7XG4gIH1cbiAgZ2V0IGlzRXJyb3IoKSB7XG4gICAgcmV0dXJuIHRoaXMuJCQuY3R4WzRdO1xuICB9XG4gIHNldCBpc0Vycm9yKGUpIHtcbiAgICB0aGlzLiQkc2V0KHsgaXNFcnJvcjogZSB9KSwgRSgpO1xuICB9XG4gIGdldCBmb3JjZU9wZW4oKSB7XG4gICAgcmV0dXJuIHRoaXMuJCQuY3R4WzVdO1xuICB9XG4gIHNldCBmb3JjZU9wZW4oZSkge1xuICAgIHRoaXMuJCRzZXQoeyBmb3JjZU9wZW46IGUgfSksIEUoKTtcbiAgfVxuICBnZXQgbWF4SGVpZ2h0KCkge1xuICAgIHJldHVybiB0aGlzLiQkLmN0eFsxNl07XG4gIH1cbiAgc2V0IG1heEhlaWdodChlKSB7XG4gICAgdGhpcy4kJHNldCh7IG1heEhlaWdodDogZSB9KSwgRSgpO1xuICB9XG59XG5yZShYdCwgeyBvcHRpb25zOiB7fSwgc2VsZWN0ZWQ6IHt9LCB1blNlbGVjdGVkcGxhY2Vob2xkZXI6IHt9LCBkaXNhYmxlZDogeyB0eXBlOiBcIkJvb2xlYW5cIiB9LCBpc0Vycm9yOiB7IHR5cGU6IFwiQm9vbGVhblwiIH0sIGZvcmNlT3BlbjogeyB0eXBlOiBcIkJvb2xlYW5cIiB9LCBtYXhIZWlnaHQ6IHt9IH0sIFtdLCBbXSwgITApO1xuZnVuY3Rpb24gR24obikge1xuICBsZXQgZSwgdCwgaSwgcywgYTtcbiAgcmV0dXJuIHMgPSBuZXcgWHQoe1xuICAgIHByb3BzOiB7XG4gICAgICBvcHRpb25zOiAoXG4gICAgICAgIC8qb3B0aW9ucyovXG4gICAgICAgIG5bMV1cbiAgICAgICksXG4gICAgICBzZWxlY3RlZDogKFxuICAgICAgICAvKnNlbGVjdGVkKi9cbiAgICAgICAgblsyXVxuICAgICAgKSxcbiAgICAgIHVuU2VsZWN0ZWRwbGFjZWhvbGRlcjogIS8qZGF0YSovXG4gICAgICBuWzBdLnR5cGUgfHwgLypkYXRhKi9cbiAgICAgIG5bMF0udHlwZSA9PSBcIk5PTkVcIiA/IFwiU2VsZWN0IFZpZXcgVHlwZVwiIDogXCJTZWxlY3QgYSBuZXcgVHlwZSBcIlxuICAgIH1cbiAgfSksIHMuJG9uKFxuICAgIFwib25TZWxlY3RcIixcbiAgICAvKnNlbGVjdE9wdGlvbiovXG4gICAgblszXVxuICApLCB7XG4gICAgYygpIHtcbiAgICAgIGUgPSAkKFwiZGl2XCIpLCB0ID0gJChcImRpdlwiKSwgaSA9ICQoXCJkaXZcIiksIFgocy4kJC5mcmFnbWVudCksIGcoaSwgXCJjbGFzc1wiLCBcIkl0ZW1PcHRpb25CdG4gXCIpLCBnKHQsIFwiY2xhc3NcIiwgXCJJdGVtT3B0aW9uc1wiKSwgZyhlLCBcImNsYXNzXCIsIFwiSXRlbU9wdGlvbnNDb250YWluZXJcIik7XG4gICAgfSxcbiAgICBtKGwsIHIpIHtcbiAgICAgIEIobCwgZSwgciksIGIoZSwgdCksIGIodCwgaSksIFcocywgaSwgbnVsbCksIGEgPSAhMDtcbiAgICB9LFxuICAgIHAobCwgW3JdKSB7XG4gICAgICBjb25zdCBvID0ge307XG4gICAgICByICYgLypkYXRhKi9cbiAgICAgIDEgJiYgKG8udW5TZWxlY3RlZHBsYWNlaG9sZGVyID0gIS8qZGF0YSovXG4gICAgICBsWzBdLnR5cGUgfHwgLypkYXRhKi9cbiAgICAgIGxbMF0udHlwZSA9PSBcIk5PTkVcIiA/IFwiU2VsZWN0IFZpZXcgVHlwZVwiIDogXCJTZWxlY3QgYSBuZXcgVHlwZSBcIiksIHMuJHNldChvKTtcbiAgICB9LFxuICAgIGkobCkge1xuICAgICAgYSB8fCAoUihzLiQkLmZyYWdtZW50LCBsKSwgYSA9ICEwKTtcbiAgICB9LFxuICAgIG8obCkge1xuICAgICAgUChzLiQkLmZyYWdtZW50LCBsKSwgYSA9ICExO1xuICAgIH0sXG4gICAgZChsKSB7XG4gICAgICBsICYmIE4oZSksIFEocyk7XG4gICAgfVxuICB9O1xufVxuZnVuY3Rpb24gV24obiwgZSwgdCkge1xuICBsZXQgaSA9IG50KCksIHsgZGF0YTogcyB9ID0gZSwgeyBlZGl0TW9kZTogYSB9ID0gZSwgbCA9IE9iamVjdC5rZXlzKF9lKSwgciA9IHMudHlwZTtcbiAgZnVuY3Rpb24gbyhkKSB7XG4gICAgbGV0IHUgPSBkLmRldGFpbDtcbiAgICB0KDAsIHMudHlwZSA9IHUsIHMpLCBpKFwib3B0aW9uU2VsZWN0ZWRcIiksIGNvbnNvbGUubG9nKFwib3B0aW9uU2VsZWN0ZWRcIiArIHUpO1xuICB9XG4gIHJldHVybiBuLiQkc2V0ID0gKGQpID0+IHtcbiAgICBcImRhdGFcIiBpbiBkICYmIHQoMCwgcyA9IGQuZGF0YSksIFwiZWRpdE1vZGVcIiBpbiBkICYmIHQoNCwgYSA9IGQuZWRpdE1vZGUpO1xuICB9LCBbcywgbCwgciwgbywgYV07XG59XG5jbGFzcyBadCBleHRlbmRzIG9lIHtcbiAgY29uc3RydWN0b3IoZSkge1xuICAgIHN1cGVyKCksIGxlKHRoaXMsIGUsIFduLCBHbiwgdGUsIHsgZGF0YTogMCwgZWRpdE1vZGU6IDQgfSk7XG4gIH1cbiAgZ2V0IGRhdGEoKSB7XG4gICAgcmV0dXJuIHRoaXMuJCQuY3R4WzBdO1xuICB9XG4gIHNldCBkYXRhKGUpIHtcbiAgICB0aGlzLiQkc2V0KHsgZGF0YTogZSB9KSwgRSgpO1xuICB9XG4gIGdldCBlZGl0TW9kZSgpIHtcbiAgICByZXR1cm4gdGhpcy4kJC5jdHhbNF07XG4gIH1cbiAgc2V0IGVkaXRNb2RlKGUpIHtcbiAgICB0aGlzLiQkc2V0KHsgZWRpdE1vZGU6IGUgfSksIEUoKTtcbiAgfVxufVxucmUoWnQsIHsgZGF0YToge30sIGVkaXRNb2RlOiB7fSB9LCBbXSwgW10sICEwKTtcbmZ1bmN0aW9uIFFuKG4pIHtcbiAgbGV0IGUsIHQsIGk7XG4gIHJldHVybiB7XG4gICAgYygpIHtcbiAgICAgIGUgPSAkKFwiZGl2XCIpLCBlLnRleHRDb250ZW50ID0gXCJIaXQgUG9pbnQgTWF4aW11bVwiLCB0ID0gaigpLCBpID0gJChcImlucHV0XCIpLCBnKGksIFwidHlwZVwiLCBcIm51bWJlclwiKTtcbiAgICB9LFxuICAgIG0ocywgYSkge1xuICAgICAgQihzLCBlLCBhKSwgQihzLCB0LCBhKSwgQihzLCBpLCBhKTtcbiAgICB9LFxuICAgIGQocykge1xuICAgICAgcyAmJiAoTihlKSwgTih0KSwgTihpKSk7XG4gICAgfVxuICB9O1xufVxuZnVuY3Rpb24gWG4obikge1xuICBsZXQgZSwgdCwgaTtcbiAgcmV0dXJuIHtcbiAgICBjKCkge1xuICAgICAgZSA9ICQoXCJkaXZcIiksIGUudGV4dENvbnRlbnQgPSBcIkhpdCBQb2ludCBNYXhpbXVtXCIsIHQgPSBqKCksIGkgPSAkKFwiaW5wdXRcIiksIGcoaSwgXCJ0eXBlXCIsIFwibnVtYmVyXCIpO1xuICAgIH0sXG4gICAgbShzLCBhKSB7XG4gICAgICBCKHMsIGUsIGEpLCBCKHMsIHQsIGEpLCBCKHMsIGksIGEpO1xuICAgIH0sXG4gICAgZChzKSB7XG4gICAgICBzICYmIChOKGUpLCBOKHQpLCBOKGkpKTtcbiAgICB9XG4gIH07XG59XG5mdW5jdGlvbiBabihuKSB7XG4gIGxldCBlLCB0LCBpO1xuICByZXR1cm4ge1xuICAgIGMoKSB7XG4gICAgICBlID0gJChcImRpdlwiKSwgZS50ZXh0Q29udGVudCA9IFwiSGl0IFBvaW50IE1heGltdW1cIiwgdCA9IGooKSwgaSA9ICQoXCJpbnB1dFwiKSwgZyhpLCBcInR5cGVcIiwgXCJudW1iZXJcIik7XG4gICAgfSxcbiAgICBtKHMsIGEpIHtcbiAgICAgIEIocywgZSwgYSksIEIocywgdCwgYSksIEIocywgaSwgYSk7XG4gICAgfSxcbiAgICBkKHMpIHtcbiAgICAgIHMgJiYgKE4oZSksIE4odCksIE4oaSkpO1xuICAgIH1cbiAgfTtcbn1cbmZ1bmN0aW9uIHhuKG4pIHtcbiAgbGV0IGUsIHQsIGksIHMsIGEsIGwsIHIsIG8sIGQsIHUsIF8sIGY7XG4gIGZ1bmN0aW9uIGgocCwgdikge1xuICAgIHJldHVybiAoXG4gICAgICAvKmVkaXRNb2RlKi9cbiAgICAgIHBbMF0gPyBabiA6IChcbiAgICAgICAgLypwbGF5TW9kZSovXG4gICAgICAgIHBbMV0gPyBYbiA6IFFuXG4gICAgICApXG4gICAgKTtcbiAgfVxuICBsZXQgYyA9IGgobiksIHkgPSBjKG4pO1xuICByZXR1cm4ge1xuICAgIGMoKSB7XG4gICAgICBlID0gJChcImRpdlwiKSwgdCA9ICQoXCJkaXZcIiksIHQudGV4dENvbnRlbnQgPSBcIkhpdCBQb2ludHNcIiwgaSA9IGooKSwgcyA9ICQoXCJpbnB1dFwiKSwgbCA9IGooKSwgciA9ICQoXCJkaXZcIiksIHIudGV4dENvbnRlbnQgPSBcInRlbXBvcmFyeSBIaXQgUG9pbnRzXCIsIG8gPSBqKCksIGQgPSAkKFwiaW5wdXRcIiksIHUgPSBqKCksIHkuYygpLCBnKHMsIFwidHlwZVwiLCBcIm51bWJlclwiKSwgcy5kaXNhYmxlZCA9IGEgPSAhLyplZGl0TW9kZSovXG4gICAgICBuWzBdLCBnKGQsIFwidHlwZVwiLCBcIm51bWJlclwiKTtcbiAgICB9LFxuICAgIG0ocCwgdikge1xuICAgICAgQihwLCBlLCB2KSwgYihlLCB0KSwgYihlLCBpKSwgYihlLCBzKSwgSWUoXG4gICAgICAgIHMsXG4gICAgICAgIC8qdiovXG4gICAgICAgIG5bMl1cbiAgICAgICksIGIoZSwgbCksIGIoZSwgciksIGIoZSwgbyksIGIoZSwgZCksIGIoZSwgdSksIHkubShlLCBudWxsKSwgXyB8fCAoZiA9IFtcbiAgICAgICAgVShcbiAgICAgICAgICBzLFxuICAgICAgICAgIFwiaW5wdXRcIixcbiAgICAgICAgICAvKmlucHV0MF9pbnB1dF9oYW5kbGVyKi9cbiAgICAgICAgICBuWzZdXG4gICAgICAgICksXG4gICAgICAgIFUoXG4gICAgICAgICAgcyxcbiAgICAgICAgICBcImNoYW5nZVwiLFxuICAgICAgICAgIC8qaXRlcmF0ZVZhbHVlKi9cbiAgICAgICAgICBuWzNdXG4gICAgICAgIClcbiAgICAgIF0sIF8gPSAhMCk7XG4gICAgfSxcbiAgICBwKHAsIFt2XSkge1xuICAgICAgdiAmIC8qZWRpdE1vZGUqL1xuICAgICAgMSAmJiBhICE9PSAoYSA9ICEvKmVkaXRNb2RlKi9cbiAgICAgIHBbMF0pICYmIChzLmRpc2FibGVkID0gYSksIHYgJiAvKnYqL1xuICAgICAgNCAmJiBIZShzLnZhbHVlKSAhPT0gLyp2Ki9cbiAgICAgIHBbMl0gJiYgSWUoXG4gICAgICAgIHMsXG4gICAgICAgIC8qdiovXG4gICAgICAgIHBbMl1cbiAgICAgICksIGMgIT09IChjID0gaChwKSkgJiYgKHkuZCgxKSwgeSA9IGMocCksIHkgJiYgKHkuYygpLCB5Lm0oZSwgbnVsbCkpKTtcbiAgICB9LFxuICAgIGk6IEssXG4gICAgbzogSyxcbiAgICBkKHApIHtcbiAgICAgIHAgJiYgTihlKSwgeS5kKCksIF8gPSAhMSwgWShmKTtcbiAgICB9XG4gIH07XG59XG5mdW5jdGlvbiBlaShuLCBlLCB0KSB7XG4gIGxldCB7IHN5czogaSB9ID0gZSwgeyBlZGl0TW9kZTogcyB9ID0gZSwgeyBwbGF5TW9kZTogYSB9ID0gZSwgeyBkYXRhOiBsIH0gPSBlLCByID0gaS5maXhlZC5nZW5lcmljW1wiSGl0IFBvaW50c1wiXSwgbyA9IHIuZ2V0VmFsdWUoKTtcbiAgY29uc3QgZCA9IGdlLmdldE5ld0tleSgpO1xuICBFZSgoKSA9PiB7XG4gICAgci5hZGRVcGRhdGVMaXN0ZW5lcihuYW1lICsgZCArIFwiU3ZlbHRlVmlld1wiLCAoKSA9PiB7XG4gICAgICB0KDIsIG8gPSByLmdldFZhbHVlKCkpO1xuICAgIH0pO1xuICB9KSwgQWUoKCkgPT4ge1xuICAgIHIucmVtb3ZlVXBkYXRlTGlzdGVuZXIobmFtZSArIGQgKyBcIlN2ZWx0ZVZpZXdcIik7XG4gIH0pO1xuICBmdW5jdGlvbiB1KCkge1xuICAgIHJldHVybiByLnNldFZhbHVlKG8pLCBudWxsO1xuICB9XG4gIGZ1bmN0aW9uIF8oKSB7XG4gICAgbyA9IEhlKHRoaXMudmFsdWUpLCB0KDIsIG8pO1xuICB9XG4gIHJldHVybiBuLiQkc2V0ID0gKGYpID0+IHtcbiAgICBcInN5c1wiIGluIGYgJiYgdCg0LCBpID0gZi5zeXMpLCBcImVkaXRNb2RlXCIgaW4gZiAmJiB0KDAsIHMgPSBmLmVkaXRNb2RlKSwgXCJwbGF5TW9kZVwiIGluIGYgJiYgdCgxLCBhID0gZi5wbGF5TW9kZSksIFwiZGF0YVwiIGluIGYgJiYgdCg1LCBsID0gZi5kYXRhKTtcbiAgfSwgW3MsIGEsIG8sIHUsIGksIGwsIF9dO1xufVxuY2xhc3MgeHQgZXh0ZW5kcyBvZSB7XG4gIGNvbnN0cnVjdG9yKGUpIHtcbiAgICBzdXBlcigpLCBsZSh0aGlzLCBlLCBlaSwgeG4sIHRlLCB7XG4gICAgICBzeXM6IDQsXG4gICAgICBlZGl0TW9kZTogMCxcbiAgICAgIHBsYXlNb2RlOiAxLFxuICAgICAgZGF0YTogNVxuICAgIH0pO1xuICB9XG4gIGdldCBzeXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuJCQuY3R4WzRdO1xuICB9XG4gIHNldCBzeXMoZSkge1xuICAgIHRoaXMuJCRzZXQoeyBzeXM6IGUgfSksIEUoKTtcbiAgfVxuICBnZXQgZWRpdE1vZGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuJCQuY3R4WzBdO1xuICB9XG4gIHNldCBlZGl0TW9kZShlKSB7XG4gICAgdGhpcy4kJHNldCh7IGVkaXRNb2RlOiBlIH0pLCBFKCk7XG4gIH1cbiAgZ2V0IHBsYXlNb2RlKCkge1xuICAgIHJldHVybiB0aGlzLiQkLmN0eFsxXTtcbiAgfVxuICBzZXQgcGxheU1vZGUoZSkge1xuICAgIHRoaXMuJCRzZXQoeyBwbGF5TW9kZTogZSB9KSwgRSgpO1xuICB9XG4gIGdldCBkYXRhKCkge1xuICAgIHJldHVybiB0aGlzLiQkLmN0eFs1XTtcbiAgfVxuICBzZXQgZGF0YShlKSB7XG4gICAgdGhpcy4kJHNldCh7IGRhdGE6IGUgfSksIEUoKTtcbiAgfVxufVxucmUoeHQsIHsgc3lzOiB7fSwgZWRpdE1vZGU6IHt9LCBwbGF5TW9kZToge30sIGRhdGE6IHt9IH0sIFtdLCBbXSwgITApO1xuZnVuY3Rpb24gdGkobikge1xuICBsZXQgZSwgdCwgaSwgcywgYSwgbCwgcjtcbiAgcmV0dXJuIHtcbiAgICBjKCkge1xuICAgICAgZSA9ICQoXCJkaXZcIiksIHQgPSAkKFwiZGl2XCIpLCB0LnRleHRDb250ZW50ID0gXCJQcm9maWNpZW5jeSBCb251c1wiLCBpID0gaigpLCBzID0gJChcImlucHV0XCIpLCBnKHMsIFwidHlwZVwiLCBcIm51bWJlclwiKSwgcy5kaXNhYmxlZCA9IGEgPSAhLyplZGl0TW9kZSovXG4gICAgICBuWzBdLCBnKGUsIFwiY2xhc3NcIiwgXCJQcm9maWNpZW5jeUJvbnVzXCIpO1xuICAgIH0sXG4gICAgbShvLCBkKSB7XG4gICAgICBCKG8sIGUsIGQpLCBiKGUsIHQpLCBiKGUsIGkpLCBiKGUsIHMpLCBJZShcbiAgICAgICAgcyxcbiAgICAgICAgLyp2Ki9cbiAgICAgICAgblsxXVxuICAgICAgKSwgbCB8fCAociA9IFtcbiAgICAgICAgVShcbiAgICAgICAgICBzLFxuICAgICAgICAgIFwiaW5wdXRcIixcbiAgICAgICAgICAvKmlucHV0X2lucHV0X2hhbmRsZXIqL1xuICAgICAgICAgIG5bNV1cbiAgICAgICAgKSxcbiAgICAgICAgVShcbiAgICAgICAgICBzLFxuICAgICAgICAgIFwiY2hhbmdlXCIsXG4gICAgICAgICAgLyppdGVyYXRlVmFsdWUqL1xuICAgICAgICAgIG5bMl1cbiAgICAgICAgKVxuICAgICAgXSwgbCA9ICEwKTtcbiAgICB9LFxuICAgIHAobywgW2RdKSB7XG4gICAgICBkICYgLyplZGl0TW9kZSovXG4gICAgICAxICYmIGEgIT09IChhID0gIS8qZWRpdE1vZGUqL1xuICAgICAgb1swXSkgJiYgKHMuZGlzYWJsZWQgPSBhKSwgZCAmIC8qdiovXG4gICAgICAyICYmIEhlKHMudmFsdWUpICE9PSAvKnYqL1xuICAgICAgb1sxXSAmJiBJZShcbiAgICAgICAgcyxcbiAgICAgICAgLyp2Ki9cbiAgICAgICAgb1sxXVxuICAgICAgKTtcbiAgICB9LFxuICAgIGk6IEssXG4gICAgbzogSyxcbiAgICBkKG8pIHtcbiAgICAgIG8gJiYgTihlKSwgbCA9ICExLCBZKHIpO1xuICAgIH1cbiAgfTtcbn1cbmZ1bmN0aW9uIG5pKG4sIGUsIHQpIHtcbiAgbGV0IHsgc3lzOiBpIH0gPSBlLCB7IGVkaXRNb2RlOiBzIH0gPSBlLCB7IGRhdGE6IGEgfSA9IGUsIGwgPSBpLmZpeGVkLmdlbmVyaWNbXCJQcm9maWNpZW5jeSBCb251c1wiXSwgciA9IGwuZ2V0VmFsdWUoKTtcbiAgY29uc3QgbyA9IGdlLmdldE5ld0tleSgpO1xuICBFZSgoKSA9PiB7XG4gICAgbC5hZGRVcGRhdGVMaXN0ZW5lcihuYW1lICsgbyArIFwiU3ZlbHRlVmlld1wiLCAoKSA9PiB7XG4gICAgICB0KDEsIHIgPSBsLmdldFZhbHVlKCkpO1xuICAgIH0pO1xuICB9KSwgQWUoKCkgPT4ge1xuICAgIGwucmVtb3ZlVXBkYXRlTGlzdGVuZXIobmFtZSArIG8gKyBcIlN2ZWx0ZVZpZXdcIik7XG4gIH0pO1xuICBmdW5jdGlvbiBkKCkge1xuICAgIHJldHVybiBsLnNldFZhbHVlKHIpLCBudWxsO1xuICB9XG4gIGZ1bmN0aW9uIHUoKSB7XG4gICAgciA9IEhlKHRoaXMudmFsdWUpLCB0KDEsIHIpO1xuICB9XG4gIHJldHVybiBuLiQkc2V0ID0gKF8pID0+IHtcbiAgICBcInN5c1wiIGluIF8gJiYgdCgzLCBpID0gXy5zeXMpLCBcImVkaXRNb2RlXCIgaW4gXyAmJiB0KDAsIHMgPSBfLmVkaXRNb2RlKSwgXCJkYXRhXCIgaW4gXyAmJiB0KDQsIGEgPSBfLmRhdGEpO1xuICB9LCBbcywgciwgZCwgaSwgYSwgdV07XG59XG5jbGFzcyBlbiBleHRlbmRzIG9lIHtcbiAgY29uc3RydWN0b3IoZSkge1xuICAgIHN1cGVyKCksIGxlKHRoaXMsIGUsIG5pLCB0aSwgdGUsIHsgc3lzOiAzLCBlZGl0TW9kZTogMCwgZGF0YTogNCB9KTtcbiAgfVxuICBnZXQgc3lzKCkge1xuICAgIHJldHVybiB0aGlzLiQkLmN0eFszXTtcbiAgfVxuICBzZXQgc3lzKGUpIHtcbiAgICB0aGlzLiQkc2V0KHsgc3lzOiBlIH0pLCBFKCk7XG4gIH1cbiAgZ2V0IGVkaXRNb2RlKCkge1xuICAgIHJldHVybiB0aGlzLiQkLmN0eFswXTtcbiAgfVxuICBzZXQgZWRpdE1vZGUoZSkge1xuICAgIHRoaXMuJCRzZXQoeyBlZGl0TW9kZTogZSB9KSwgRSgpO1xuICB9XG4gIGdldCBkYXRhKCkge1xuICAgIHJldHVybiB0aGlzLiQkLmN0eFs0XTtcbiAgfVxuICBzZXQgZGF0YShlKSB7XG4gICAgdGhpcy4kJHNldCh7IGRhdGE6IGUgfSksIEUoKTtcbiAgfVxufVxucmUoZW4sIHsgc3lzOiB7fSwgZWRpdE1vZGU6IHt9LCBkYXRhOiB7fSB9LCBbXSwgW10sICEwKTtcbmZ1bmN0aW9uIGlpKG4pIHtcbiAgbGV0IGUsIHQsIGksIHMsIGEsIGwsIHIsIG8sIGQsIHUsIF8sIGYsIGg7XG4gIHJldHVybiB7XG4gICAgYygpIHtcbiAgICAgIGUgPSAkKFwiZGl2XCIpLCB0ID0gJChcImRpdlwiKSwgaSA9ICQoXCJkaXZcIiksIHMgPSBqKCksIGEgPSAkKFwiZGl2XCIpLCBsID0gJChcInBcIiksIHIgPSBHKFxuICAgICAgICAvKm5hbWUqL1xuICAgICAgICBuWzFdXG4gICAgICApLCBvID0gaigpLCBkID0gJChcImRpdlwiKSwgdSA9ICQoXCJwXCIpLCBfID0gRyhcbiAgICAgICAgLypib251cyovXG4gICAgICAgIG5bM11cbiAgICAgICksIGcoaSwgXCJjbGFzc1wiLCBcInNraWxscHJvZmljaWVuY3lNYXJrXCIpLCBnKFxuICAgICAgICBpLFxuICAgICAgICBcImRhdGEtbGV2ZWxcIixcbiAgICAgICAgLyp2YWx1ZSovXG4gICAgICAgIG5bMl1cbiAgICAgICksIGcodCwgXCJjbGFzc1wiLCBcInNraWxscHJvZmljaWVuY3lNYXJrUGFyZW50XCIpLCBnKGEsIFwiY2xhc3NcIiwgXCJza2lsbHByb2ZpY2llbmN5TWFya05hbWVcIiksIGcoZCwgXCJjbGFzc1wiLCBcInNraWxscHJvZmljaWVuY3lNYXJrVmFsdWVcIiksIGcoZSwgXCJjbGFzc1wiLCBcInNraWxscHJvZmljaWVuY3lDb250YWluZXJcIiksIGcoXG4gICAgICAgIGUsXG4gICAgICAgIFwiZGF0YS1lZGl0XCIsXG4gICAgICAgIC8qZWRpdCovXG4gICAgICAgIG5bMF1cbiAgICAgICk7XG4gICAgfSxcbiAgICBtKGMsIHkpIHtcbiAgICAgIEIoYywgZSwgeSksIGIoZSwgdCksIGIodCwgaSksIGIoZSwgcyksIGIoZSwgYSksIGIoYSwgbCksIGIobCwgciksIGIoZSwgbyksIGIoZSwgZCksIGIoZCwgdSksIGIodSwgXyksIGYgfHwgKGggPSBbXG4gICAgICAgIFUoXG4gICAgICAgICAgaSxcbiAgICAgICAgICBcImtleXVwXCIsXG4gICAgICAgICAgLyprZXl1cF9oYW5kbGVyKi9cbiAgICAgICAgICBuWzZdXG4gICAgICAgICksXG4gICAgICAgIFUoXG4gICAgICAgICAgaSxcbiAgICAgICAgICBcImNsaWNrXCIsXG4gICAgICAgICAgLyppdGVyYXRlVmFsdWUqL1xuICAgICAgICAgIG5bNF1cbiAgICAgICAgKVxuICAgICAgXSwgZiA9ICEwKTtcbiAgICB9LFxuICAgIHAoYywgW3ldKSB7XG4gICAgICB5ICYgLyp2YWx1ZSovXG4gICAgICA0ICYmIGcoXG4gICAgICAgIGksXG4gICAgICAgIFwiZGF0YS1sZXZlbFwiLFxuICAgICAgICAvKnZhbHVlKi9cbiAgICAgICAgY1syXVxuICAgICAgKSwgeSAmIC8qbmFtZSovXG4gICAgICAyICYmIGRlKFxuICAgICAgICByLFxuICAgICAgICAvKm5hbWUqL1xuICAgICAgICBjWzFdXG4gICAgICApLCB5ICYgLypib251cyovXG4gICAgICA4ICYmIGRlKFxuICAgICAgICBfLFxuICAgICAgICAvKmJvbnVzKi9cbiAgICAgICAgY1szXVxuICAgICAgKSwgeSAmIC8qZWRpdCovXG4gICAgICAxICYmIGcoXG4gICAgICAgIGUsXG4gICAgICAgIFwiZGF0YS1lZGl0XCIsXG4gICAgICAgIC8qZWRpdCovXG4gICAgICAgIGNbMF1cbiAgICAgICk7XG4gICAgfSxcbiAgICBpOiBLLFxuICAgIG86IEssXG4gICAgZChjKSB7XG4gICAgICBjICYmIE4oZSksIGYgPSAhMSwgWShoKTtcbiAgICB9XG4gIH07XG59XG5mdW5jdGlvbiBzaShuLCBlLCB0KSB7XG4gIGxldCB7IGVkaXQ6IGkgfSA9IGUsIHsgbmFtZTogcyB9ID0gZSwgeyBzeXM6IGEgfSA9IGUsIGwgPSBhLmZpeGVkLlNraWxsUHJvZmljaWVuY2llc1tzXSwgciA9IGEuZGVyaXZlZC5za2lsbHByb2ZpY2llbmN5Qm9udXNbc10sIG8gPSBsLmdldFZhbHVlKCksIGQgPSByLmdldFZhbHVlKCk7XG4gIGNvbnN0IHUgPSBnZS5nZXROZXdLZXkoKTtcbiAgRWUoKCkgPT4ge1xuICAgIGwuYWRkVXBkYXRlTGlzdGVuZXIocyArIHUgKyBcIlN2ZWx0ZVZpZXdcIiwgKCkgPT4ge1xuICAgICAgdCgyLCBvID0gbC5nZXRWYWx1ZSgpKTtcbiAgICB9KSwgci5hZGRVcGRhdGVMaXN0ZW5lcihzICsgdSArIFwiU3ZlbHRlVmlld1wiLCAoKSA9PiB7XG4gICAgICB0KDMsIGQgPSByLmdldFZhbHVlKCkpO1xuICAgIH0pO1xuICB9KSwgQWUoKCkgPT4ge1xuICAgIGwucmVtb3ZlVXBkYXRlTGlzdGVuZXIocyArIFwiU3ZlbHRlVmlld1wiKSwgci5yZW1vdmVVcGRhdGVMaXN0ZW5lcihzICsgXCJTdmVsdGVWaWV3XCIpO1xuICB9KTtcbiAgZnVuY3Rpb24gXygpIHtcbiAgICBpZiAoIWkpXG4gICAgICByZXR1cm47XG4gICAgbGV0IGggPSBsLmdldFZhbHVlKCk7XG4gICAgcmV0dXJuIGggPSAoaCArIDEpICUgMywgbC5zZXRWYWx1ZShoKSwgbnVsbDtcbiAgfVxuICBmdW5jdGlvbiBmKGgpIHtcbiAgICBtZS5jYWxsKHRoaXMsIG4sIGgpO1xuICB9XG4gIHJldHVybiBuLiQkc2V0ID0gKGgpID0+IHtcbiAgICBcImVkaXRcIiBpbiBoICYmIHQoMCwgaSA9IGguZWRpdCksIFwibmFtZVwiIGluIGggJiYgdCgxLCBzID0gaC5uYW1lKSwgXCJzeXNcIiBpbiBoICYmIHQoNSwgYSA9IGguc3lzKTtcbiAgfSwgW2ksIHMsIG8sIGQsIF8sIGEsIGZdO1xufVxuY2xhc3MgdG4gZXh0ZW5kcyBvZSB7XG4gIGNvbnN0cnVjdG9yKGUpIHtcbiAgICBzdXBlcigpLCBsZSh0aGlzLCBlLCBzaSwgaWksIHRlLCB7IGVkaXQ6IDAsIG5hbWU6IDEsIHN5czogNSB9KTtcbiAgfVxuICBnZXQgZWRpdCgpIHtcbiAgICByZXR1cm4gdGhpcy4kJC5jdHhbMF07XG4gIH1cbiAgc2V0IGVkaXQoZSkge1xuICAgIHRoaXMuJCRzZXQoeyBlZGl0OiBlIH0pLCBFKCk7XG4gIH1cbiAgZ2V0IG5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuJCQuY3R4WzFdO1xuICB9XG4gIHNldCBuYW1lKGUpIHtcbiAgICB0aGlzLiQkc2V0KHsgbmFtZTogZSB9KSwgRSgpO1xuICB9XG4gIGdldCBzeXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuJCQuY3R4WzVdO1xuICB9XG4gIHNldCBzeXMoZSkge1xuICAgIHRoaXMuJCRzZXQoeyBzeXM6IGUgfSksIEUoKTtcbiAgfVxufVxucmUodG4sIHsgZWRpdDoge30sIG5hbWU6IHt9LCBzeXM6IHt9IH0sIFtdLCBbXSwgITApO1xuZnVuY3Rpb24gbXQobiwgZSwgdCkge1xuICBjb25zdCBpID0gbi5zbGljZSgpO1xuICByZXR1cm4gaVs0XSA9IGVbdF0sIGk7XG59XG5mdW5jdGlvbiBwdChuKSB7XG4gIGxldCBlLCB0O1xuICByZXR1cm4gZSA9IG5ldyB0bih7XG4gICAgcHJvcHM6IHtcbiAgICAgIGVkaXQ6IChcbiAgICAgICAgLyplZGl0Ki9cbiAgICAgICAgblswXVxuICAgICAgKSxcbiAgICAgIG5hbWU6IChcbiAgICAgICAgLypuYW1lKi9cbiAgICAgICAgbls0XVxuICAgICAgKSxcbiAgICAgIHN5czogKFxuICAgICAgICAvKnN5cyovXG4gICAgICAgIG5bMV1cbiAgICAgIClcbiAgICB9XG4gIH0pLCB7XG4gICAgYygpIHtcbiAgICAgIFgoZS4kJC5mcmFnbWVudCk7XG4gICAgfSxcbiAgICBtKGksIHMpIHtcbiAgICAgIFcoZSwgaSwgcyksIHQgPSAhMDtcbiAgICB9LFxuICAgIHAoaSwgcykge1xuICAgICAgY29uc3QgYSA9IHt9O1xuICAgICAgcyAmIC8qZWRpdCovXG4gICAgICAxICYmIChhLmVkaXQgPSAvKmVkaXQqL1xuICAgICAgaVswXSksIHMgJiAvKnN5cyovXG4gICAgICAyICYmIChhLnN5cyA9IC8qc3lzKi9cbiAgICAgIGlbMV0pLCBlLiRzZXQoYSk7XG4gICAgfSxcbiAgICBpKGkpIHtcbiAgICAgIHQgfHwgKFIoZS4kJC5mcmFnbWVudCwgaSksIHQgPSAhMCk7XG4gICAgfSxcbiAgICBvKGkpIHtcbiAgICAgIFAoZS4kJC5mcmFnbWVudCwgaSksIHQgPSAhMTtcbiAgICB9LFxuICAgIGQoaSkge1xuICAgICAgUShlLCBpKTtcbiAgICB9XG4gIH07XG59XG5mdW5jdGlvbiBhaShuKSB7XG4gIGxldCBlLCB0LCBpID0gc2UoXG4gICAgLypuYW1lcyovXG4gICAgblsyXVxuICApLCBzID0gW107XG4gIGZvciAobGV0IGwgPSAwOyBsIDwgaS5sZW5ndGg7IGwgKz0gMSlcbiAgICBzW2xdID0gcHQobXQobiwgaSwgbCkpO1xuICBjb25zdCBhID0gKGwpID0+IFAoc1tsXSwgMSwgMSwgKCkgPT4ge1xuICAgIHNbbF0gPSBudWxsO1xuICB9KTtcbiAgcmV0dXJuIHtcbiAgICBjKCkge1xuICAgICAgZSA9ICQoXCJkaXZcIik7XG4gICAgICBmb3IgKGxldCBsID0gMDsgbCA8IHMubGVuZ3RoOyBsICs9IDEpXG4gICAgICAgIHNbbF0uYygpO1xuICAgICAgZyhlLCBcImNsYXNzXCIsIFwic2tpbGxwcm9maWNpZW5jeUNvbGxlY3Rpb25cIiksIGcoXG4gICAgICAgIGUsXG4gICAgICAgIFwiZGF0YS1lZGl0XCIsXG4gICAgICAgIC8qZWRpdCovXG4gICAgICAgIG5bMF1cbiAgICAgICk7XG4gICAgfSxcbiAgICBtKGwsIHIpIHtcbiAgICAgIEIobCwgZSwgcik7XG4gICAgICBmb3IgKGxldCBvID0gMDsgbyA8IHMubGVuZ3RoOyBvICs9IDEpXG4gICAgICAgIHNbb10gJiYgc1tvXS5tKGUsIG51bGwpO1xuICAgICAgdCA9ICEwO1xuICAgIH0sXG4gICAgcChsLCBbcl0pIHtcbiAgICAgIGlmIChyICYgLyplZGl0LCBuYW1lcywgc3lzKi9cbiAgICAgIDcpIHtcbiAgICAgICAgaSA9IHNlKFxuICAgICAgICAgIC8qbmFtZXMqL1xuICAgICAgICAgIGxbMl1cbiAgICAgICAgKTtcbiAgICAgICAgbGV0IG87XG4gICAgICAgIGZvciAobyA9IDA7IG8gPCBpLmxlbmd0aDsgbyArPSAxKSB7XG4gICAgICAgICAgY29uc3QgZCA9IG10KGwsIGksIG8pO1xuICAgICAgICAgIHNbb10gPyAoc1tvXS5wKGQsIHIpLCBSKHNbb10sIDEpKSA6IChzW29dID0gcHQoZCksIHNbb10uYygpLCBSKHNbb10sIDEpLCBzW29dLm0oZSwgbnVsbCkpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodWUoKSwgbyA9IGkubGVuZ3RoOyBvIDwgcy5sZW5ndGg7IG8gKz0gMSlcbiAgICAgICAgICBhKG8pO1xuICAgICAgICBmZSgpO1xuICAgICAgfVxuICAgICAgKCF0IHx8IHIgJiAvKmVkaXQqL1xuICAgICAgMSkgJiYgZyhcbiAgICAgICAgZSxcbiAgICAgICAgXCJkYXRhLWVkaXRcIixcbiAgICAgICAgLyplZGl0Ki9cbiAgICAgICAgbFswXVxuICAgICAgKTtcbiAgICB9LFxuICAgIGkobCkge1xuICAgICAgaWYgKCF0KSB7XG4gICAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgaS5sZW5ndGg7IHIgKz0gMSlcbiAgICAgICAgICBSKHNbcl0pO1xuICAgICAgICB0ID0gITA7XG4gICAgICB9XG4gICAgfSxcbiAgICBvKGwpIHtcbiAgICAgIHMgPSBzLmZpbHRlcihCb29sZWFuKTtcbiAgICAgIGZvciAobGV0IHIgPSAwOyByIDwgcy5sZW5ndGg7IHIgKz0gMSlcbiAgICAgICAgUChzW3JdKTtcbiAgICAgIHQgPSAhMTtcbiAgICB9LFxuICAgIGQobCkge1xuICAgICAgbCAmJiBOKGUpLCBaZShzLCBsKTtcbiAgICB9XG4gIH07XG59XG5mdW5jdGlvbiBsaShuLCBlLCB0KSB7XG4gIGxldCB7IGVkaXQ6IGkgfSA9IGUsIHsgc3lzOiBzIH0gPSBlLCB7IGRhdGE6IGEgfSA9IGUsIGwgPSBPYmplY3Qua2V5cyhzLmZpeGVkLlNraWxsUHJvZmljaWVuY2llcyk7XG4gIHJldHVybiBuLiQkc2V0ID0gKHIpID0+IHtcbiAgICBcImVkaXRcIiBpbiByICYmIHQoMCwgaSA9IHIuZWRpdCksIFwic3lzXCIgaW4gciAmJiB0KDEsIHMgPSByLnN5cyksIFwiZGF0YVwiIGluIHIgJiYgdCgzLCBhID0gci5kYXRhKTtcbiAgfSwgW2ksIHMsIGwsIGFdO1xufVxuY2xhc3Mgbm4gZXh0ZW5kcyBvZSB7XG4gIGNvbnN0cnVjdG9yKGUpIHtcbiAgICBzdXBlcigpLCBsZSh0aGlzLCBlLCBsaSwgYWksIHRlLCB7IGVkaXQ6IDAsIHN5czogMSwgZGF0YTogMyB9KTtcbiAgfVxuICBnZXQgZWRpdCgpIHtcbiAgICByZXR1cm4gdGhpcy4kJC5jdHhbMF07XG4gIH1cbiAgc2V0IGVkaXQoZSkge1xuICAgIHRoaXMuJCRzZXQoeyBlZGl0OiBlIH0pLCBFKCk7XG4gIH1cbiAgZ2V0IHN5cygpIHtcbiAgICByZXR1cm4gdGhpcy4kJC5jdHhbMV07XG4gIH1cbiAgc2V0IHN5cyhlKSB7XG4gICAgdGhpcy4kJHNldCh7IHN5czogZSB9KSwgRSgpO1xuICB9XG4gIGdldCBkYXRhKCkge1xuICAgIHJldHVybiB0aGlzLiQkLmN0eFszXTtcbiAgfVxuICBzZXQgZGF0YShlKSB7XG4gICAgdGhpcy4kJHNldCh7IGRhdGE6IGUgfSksIEUoKTtcbiAgfVxufVxucmUobm4sIHsgZWRpdDoge30sIHN5czoge30sIGRhdGE6IHt9IH0sIFtdLCBbXSwgITApO1xuZnVuY3Rpb24gdnQobiwgZSwgdCkge1xuICBjb25zdCBpID0gbi5zbGljZSgpO1xuICByZXR1cm4gaVsxNl0gPSBlW3RdLCBpO1xufVxuZnVuY3Rpb24gcmkobikge1xuICBsZXQgZTtcbiAgcmV0dXJuIHtcbiAgICBjKCkge1xuICAgICAgZSA9ICQoXCJkaXZcIiksIGUuaW5uZXJIVE1MID0gXCJcIjtcbiAgICB9LFxuICAgIG0odCwgaSkge1xuICAgICAgQih0LCBlLCBpKTtcbiAgICB9LFxuICAgIHA6IEssXG4gICAgZCh0KSB7XG4gICAgICB0ICYmIE4oZSk7XG4gICAgfVxuICB9O1xufVxuZnVuY3Rpb24gb2kobikge1xuICBsZXQgZSwgdCwgaSwgcywgYSA9IHNlKE9iamVjdC5rZXlzKFxuICAgIC8qc3lzKi9cbiAgICBuWzBdLmRlcml2ZWRbXCJTcGVsbCBCb251c1wiXVxuICApKSwgbCA9IFtdO1xuICBmb3IgKGxldCByID0gMDsgciA8IGEubGVuZ3RoOyByICs9IDEpXG4gICAgbFtyXSA9IHl0KHZ0KG4sIGEsIHIpKTtcbiAgcmV0dXJuIHtcbiAgICBjKCkge1xuICAgICAgZSA9ICQoXCJkaXZcIiksIHQgPSAkKFwic2VsZWN0XCIpO1xuICAgICAgZm9yIChsZXQgciA9IDA7IHIgPCBsLmxlbmd0aDsgciArPSAxKVxuICAgICAgICBsW3JdLmMoKTtcbiAgICB9LFxuICAgIG0ociwgbykge1xuICAgICAgQihyLCBlLCBvKSwgYihlLCB0KTtcbiAgICAgIGZvciAobGV0IGQgPSAwOyBkIDwgbC5sZW5ndGg7IGQgKz0gMSlcbiAgICAgICAgbFtkXSAmJiBsW2RdLm0odCwgbnVsbCk7XG4gICAgICBuWzhdKHQpLCBpIHx8IChzID0gVShcbiAgICAgICAgdCxcbiAgICAgICAgXCJjaGFuZ2VcIixcbiAgICAgICAgLypjaGFuZ2VTb3J0Ki9cbiAgICAgICAgbls2XVxuICAgICAgKSwgaSA9ICEwKTtcbiAgICB9LFxuICAgIHAociwgbykge1xuICAgICAgaWYgKG8gJiAvKk9iamVjdCwgc3lzLCBzaG93U3RhdCovXG4gICAgICA1KSB7XG4gICAgICAgIGEgPSBzZShPYmplY3Qua2V5cyhcbiAgICAgICAgICAvKnN5cyovXG4gICAgICAgICAgclswXS5kZXJpdmVkW1wiU3BlbGwgQm9udXNcIl1cbiAgICAgICAgKSk7XG4gICAgICAgIGxldCBkO1xuICAgICAgICBmb3IgKGQgPSAwOyBkIDwgYS5sZW5ndGg7IGQgKz0gMSkge1xuICAgICAgICAgIGNvbnN0IHUgPSB2dChyLCBhLCBkKTtcbiAgICAgICAgICBsW2RdID8gbFtkXS5wKHUsIG8pIDogKGxbZF0gPSB5dCh1KSwgbFtkXS5jKCksIGxbZF0ubSh0LCBudWxsKSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICg7IGQgPCBsLmxlbmd0aDsgZCArPSAxKVxuICAgICAgICAgIGxbZF0uZCgxKTtcbiAgICAgICAgbC5sZW5ndGggPSBhLmxlbmd0aDtcbiAgICAgIH1cbiAgICB9LFxuICAgIGQocikge1xuICAgICAgciAmJiBOKGUpLCBaZShsLCByKSwgbls4XShudWxsKSwgaSA9ICExLCBzKCk7XG4gICAgfVxuICB9O1xufVxuZnVuY3Rpb24geXQobikge1xuICBsZXQgZSwgdCA9IChcbiAgICAvKmtleSovXG4gICAgblsxNl0gKyBcIlwiXG4gICksIGksIHMsIGEsIGw7XG4gIHJldHVybiB7XG4gICAgYygpIHtcbiAgICAgIGUgPSAkKFwib3B0aW9uXCIpLCBpID0gRyh0KSwgcyA9IGooKSwgZS5fX3ZhbHVlID0gYSA9IC8qa2V5Ki9cbiAgICAgIG5bMTZdLCBJZShlLCBlLl9fdmFsdWUpLCBlLnNlbGVjdGVkID0gbCA9IC8qa2V5Ki9cbiAgICAgIG5bMTZdID09IC8qc2hvd1N0YXQqL1xuICAgICAgblsyXTtcbiAgICB9LFxuICAgIG0ociwgbykge1xuICAgICAgQihyLCBlLCBvKSwgYihlLCBpKSwgYihlLCBzKTtcbiAgICB9LFxuICAgIHAociwgbykge1xuICAgICAgbyAmIC8qc3lzKi9cbiAgICAgIDEgJiYgdCAhPT0gKHQgPSAvKmtleSovXG4gICAgICByWzE2XSArIFwiXCIpICYmIGRlKGksIHQpLCBvICYgLypzeXMqL1xuICAgICAgMSAmJiBhICE9PSAoYSA9IC8qa2V5Ki9cbiAgICAgIHJbMTZdKSAmJiAoZS5fX3ZhbHVlID0gYSwgSWUoZSwgZS5fX3ZhbHVlKSksIG8gJiAvKnN5cywgc2hvd1N0YXQqL1xuICAgICAgNSAmJiBsICE9PSAobCA9IC8qa2V5Ki9cbiAgICAgIHJbMTZdID09IC8qc2hvd1N0YXQqL1xuICAgICAgclsyXSkgJiYgKGUuc2VsZWN0ZWQgPSBsKTtcbiAgICB9LFxuICAgIGQocikge1xuICAgICAgciAmJiBOKGUpO1xuICAgIH1cbiAgfTtcbn1cbmZ1bmN0aW9uIGRpKG4pIHtcbiAgbGV0IGUsIHQsIGksIHMsIGEsIGwsIHIsIG8sIGQsIHUsIF8sIGYsIGgsIGMsIHksIHAsIHY7XG4gIGZ1bmN0aW9uIEMoRCwgQSkge1xuICAgIHJldHVybiAoXG4gICAgICAvKmVkaXQqL1xuICAgICAgRFsxXSA/IG9pIDogcmlcbiAgICApO1xuICB9XG4gIGxldCBtID0gQyhuKSwgUyA9IG0obik7XG4gIHJldHVybiB7XG4gICAgYygpIHtcbiAgICAgIGUgPSAkKFwiZGl2XCIpLCBTLmMoKSwgdCA9IGooKSwgaSA9ICQoXCJkaXZcIiksIHMgPSAkKFwiZGl2XCIpLCBhID0gRyhcbiAgICAgICAgLypzaG93U3RhdCovXG4gICAgICAgIG5bMl1cbiAgICAgICksIGwgPSBqKCksIHIgPSAkKFwiZGl2XCIpLCBvID0gJChcImRpdlwiKSwgby50ZXh0Q29udGVudCA9IFwiU3BlbGwgRENcIiwgZCA9IGooKSwgdSA9ICQoXCJkaXZcIiksIF8gPSBHKFxuICAgICAgICAvKmNob3Nlbl9EQyovXG4gICAgICAgIG5bM11cbiAgICAgICksIGYgPSBqKCksIGggPSAkKFwiZGl2XCIpLCBjID0gJChcImRpdlwiKSwgYy50ZXh0Q29udGVudCA9IFwiU3BlbGwgQm9udXNcIiwgeSA9IGooKSwgcCA9ICQoXCJkaXZcIiksIHYgPSBHKFxuICAgICAgICAvKmNob3Nlbl9CT05VUyovXG4gICAgICAgIG5bNF1cbiAgICAgICksIGcoaSwgXCJjbGFzc1wiLCBcInNwZWxsRENDb250YWluZXJcIik7XG4gICAgfSxcbiAgICBtKEQsIEEpIHtcbiAgICAgIEIoRCwgZSwgQSksIFMubShlLCBudWxsKSwgYihlLCB0KSwgYihlLCBpKSwgYihpLCBzKSwgYihzLCBhKSwgYihpLCBsKSwgYihpLCByKSwgYihyLCBvKSwgYihyLCBkKSwgYihyLCB1KSwgYih1LCBfKSwgYihpLCBmKSwgYihpLCBoKSwgYihoLCBjKSwgYihoLCB5KSwgYihoLCBwKSwgYihwLCB2KTtcbiAgICB9LFxuICAgIHAoRCwgW0FdKSB7XG4gICAgICBtID09PSAobSA9IEMoRCkpICYmIFMgPyBTLnAoRCwgQSkgOiAoUy5kKDEpLCBTID0gbShEKSwgUyAmJiAoUy5jKCksIFMubShlLCB0KSkpLCBBICYgLypzaG93U3RhdCovXG4gICAgICA0ICYmIGRlKFxuICAgICAgICBhLFxuICAgICAgICAvKnNob3dTdGF0Ki9cbiAgICAgICAgRFsyXVxuICAgICAgKSwgQSAmIC8qY2hvc2VuX0RDKi9cbiAgICAgIDggJiYgZGUoXG4gICAgICAgIF8sXG4gICAgICAgIC8qY2hvc2VuX0RDKi9cbiAgICAgICAgRFszXVxuICAgICAgKSwgQSAmIC8qY2hvc2VuX0JPTlVTKi9cbiAgICAgIDE2ICYmIGRlKFxuICAgICAgICB2LFxuICAgICAgICAvKmNob3Nlbl9CT05VUyovXG4gICAgICAgIERbNF1cbiAgICAgICk7XG4gICAgfSxcbiAgICBpOiBLLFxuICAgIG86IEssXG4gICAgZChEKSB7XG4gICAgICBEICYmIE4oZSksIFMuZCgpO1xuICAgIH1cbiAgfTtcbn1cbmZ1bmN0aW9uIHVpKG4sIGUsIHQpIHtcbiAgbGV0IHsgc3lzOiBpIH0gPSBlLCB7IGVkaXQ6IHMgfSA9IGUsIHsgZGF0YTogYSB9ID0gZTtcbiAgY29uc3QgbCA9IGdlLmdldE5ld0tleSgpO1xuICBsZXQgciA9IGEuZGF0YTtcbiAgSlNPTi5zdHJpbmdpZnkocikgPT09IEpTT04uc3RyaW5naWZ5KHt9KSAmJiAoci5zaG93U3RhdCA9IE9iamVjdC5rZXlzKGkuZGVyaXZlZFtcIlNwZWxsIEJvbnVzXCJdKVswXSk7XG4gIGxldCBvID0gci5zaG93U3RhdCwgZCA9IGkuZGVyaXZlZFtcIlNwZWxsIEJvbnVzXCJdW29dLCB1ID0gaS5kZXJpdmVkW1wiU3BlbGwgRENcIl1bb10sIF8gPSBkLmdldFZhbHVlKCksIGYgPSB1LmdldFZhbHVlKCksIGg7XG4gIGZ1bmN0aW9uIGMoKSB7XG4gICAgbGV0IG0gPSBoLnZhbHVlO1xuICAgIHQoMiwgbyA9IG0pLCBkID0gaS5kZXJpdmVkW1wiU3BlbGwgQm9udXNcIl1bb10sIHUgPSBpLmRlcml2ZWRbXCJTcGVsbCBEQ1wiXVtvXSwgdCgzLCBfID0gZC5nZXRWYWx1ZSgpKSwgdCg0LCBmID0gdS5nZXRWYWx1ZSgpKTtcbiAgfVxuICBmdW5jdGlvbiB5KCkge1xuICAgIHQoMywgXyA9IGQuZ2V0VmFsdWUoKSksIHQoNCwgZiA9IHUuZ2V0VmFsdWUoKSk7XG4gIH1cbiAgZnVuY3Rpb24gcCgpIHtcbiAgICBkLmFkZFVwZGF0ZUxpc3RlbmVyKG5hbWUgKyBcIlNwZWxsSW5mb1ZpZXdcIiArIGwsICgpID0+IHtcbiAgICAgIHkoKTtcbiAgICB9KSwgdS5hZGRVcGRhdGVMaXN0ZW5lcihuYW1lICsgXCJTcGVsbEluZm9WaWV3XCIgKyBsLCAoKSA9PiB7XG4gICAgICB5KCk7XG4gICAgfSk7XG4gIH1cbiAgRWUoKCkgPT4ge1xuICAgIHAoKTtcbiAgfSk7XG4gIGZ1bmN0aW9uIHYoKSB7XG4gICAgZC5yZW1vdmVVcGRhdGVMaXN0ZW5lcihuYW1lICsgXCJTcGVsbEluZm9WaWV3XCIgKyBsKSwgdS5yZW1vdmVVcGRhdGVMaXN0ZW5lcihuYW1lICsgXCJTcGVsbEluZm9WaWV3XCIgKyBsKTtcbiAgfVxuICBBZSgoKSA9PiB7XG4gICAgdigpO1xuICB9KTtcbiAgZnVuY3Rpb24gQyhtKSB7XG4gICAgbmVbbSA/IFwidW5zaGlmdFwiIDogXCJwdXNoXCJdKCgpID0+IHtcbiAgICAgIGggPSBtLCB0KDUsIGgpLCB0KDAsIGkpO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBuLiQkc2V0ID0gKG0pID0+IHtcbiAgICBcInN5c1wiIGluIG0gJiYgdCgwLCBpID0gbS5zeXMpLCBcImVkaXRcIiBpbiBtICYmIHQoMSwgcyA9IG0uZWRpdCksIFwiZGF0YVwiIGluIG0gJiYgdCg3LCBhID0gbS5kYXRhKTtcbiAgfSwgW1xuICAgIGksXG4gICAgcyxcbiAgICBvLFxuICAgIF8sXG4gICAgZixcbiAgICBoLFxuICAgIGMsXG4gICAgYSxcbiAgICBDXG4gIF07XG59XG5jbGFzcyBzbiBleHRlbmRzIG9lIHtcbiAgY29uc3RydWN0b3IoZSkge1xuICAgIHN1cGVyKCksIGxlKHRoaXMsIGUsIHVpLCBkaSwgdGUsIHsgc3lzOiAwLCBlZGl0OiAxLCBkYXRhOiA3IH0pO1xuICB9XG4gIGdldCBzeXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuJCQuY3R4WzBdO1xuICB9XG4gIHNldCBzeXMoZSkge1xuICAgIHRoaXMuJCRzZXQoeyBzeXM6IGUgfSksIEUoKTtcbiAgfVxuICBnZXQgZWRpdCgpIHtcbiAgICByZXR1cm4gdGhpcy4kJC5jdHhbMV07XG4gIH1cbiAgc2V0IGVkaXQoZSkge1xuICAgIHRoaXMuJCRzZXQoeyBlZGl0OiBlIH0pLCBFKCk7XG4gIH1cbiAgZ2V0IGRhdGEoKSB7XG4gICAgcmV0dXJuIHRoaXMuJCQuY3R4WzddO1xuICB9XG4gIHNldCBkYXRhKGUpIHtcbiAgICB0aGlzLiQkc2V0KHsgZGF0YTogZSB9KSwgRSgpO1xuICB9XG59XG5yZShzbiwgeyBzeXM6IHt9LCBlZGl0OiB7fSwgZGF0YToge30gfSwgW10sIFtdLCAhMCk7XG5mdW5jdGlvbiBmaShuKSB7XG4gIGxldCBlLCB0LCBpLCBzLCBhLCBsLCByLCBvLCBkLCB1LCBfLCBmLCBoO1xuICByZXR1cm4ge1xuICAgIGMoKSB7XG4gICAgICBlID0gJChcImRpdlwiKSwgdCA9ICQoXCJkaXZcIiksIGkgPSBHKFxuICAgICAgICAvKm5hbWUqL1xuICAgICAgICBuWzBdXG4gICAgICApLCBzID0gaigpLCBhID0gJChcImRpdlwiKSwgbCA9ICQoXCJpbnB1dFwiKSwgbyA9IGooKSwgZCA9ICQoXCJkaXZcIiksIHUgPSAkKFwiZGl2XCIpLCBfID0gRyhcbiAgICAgICAgLyptb2ROb2RlVmFsdWUqL1xuICAgICAgICBuWzNdXG4gICAgICApLCBnKGwsIFwiY2xhc3NcIiwgXCJCb3hWYWx1ZVwiKSwgZyhcbiAgICAgICAgbCxcbiAgICAgICAgXCJkYXRhLWVkaXRtb2RlXCIsXG4gICAgICAgIC8qZWRpdG1vZGUqL1xuICAgICAgICBuWzFdXG4gICAgICApLCBsLmRpc2FibGVkID0gciA9ICEvKmVkaXRtb2RlKi9cbiAgICAgIG5bMV0sIGwudmFsdWUgPSAvKm5vZGVWYWx1ZSovXG4gICAgICBuWzJdLCBnKGwsIFwidHlwZVwiLCBcIm51bWJlclwiKSwgZyhsLCBcIm1pblwiLCBcIjBcIiksIGcobCwgXCJtYXhcIiwgXCIxMDBcIiksIGcoYSwgXCJjbGFzc1wiLCBcIkxhcmdlVmFsdWVcIiksIGcodSwgXCJjbGFzc1wiLCBcIkJveFZhbHVlXCIpLCBnKGQsIFwiY2xhc3NcIiwgXCJTbWFsbFZhbHVlXCIpLCBnKGUsIFwiY2xhc3NcIiwgXCJTdGF0VmFsdWVcIik7XG4gICAgfSxcbiAgICBtKGMsIHkpIHtcbiAgICAgIEIoYywgZSwgeSksIGIoZSwgdCksIGIodCwgaSksIGIoZSwgcyksIGIoZSwgYSksIGIoYSwgbCksIG5bOF0obCksIGIoZSwgbyksIGIoZSwgZCksIGIoZCwgdSksIGIodSwgXyksIGYgfHwgKGggPSBVKFxuICAgICAgICBsLFxuICAgICAgICBcImNoYW5nZVwiLFxuICAgICAgICAvKm9uQ2hhbmdlKi9cbiAgICAgICAgbls1XVxuICAgICAgKSwgZiA9ICEwKTtcbiAgICB9LFxuICAgIHAoYywgW3ldKSB7XG4gICAgICB5ICYgLypuYW1lKi9cbiAgICAgIDEgJiYgZGUoXG4gICAgICAgIGksXG4gICAgICAgIC8qbmFtZSovXG4gICAgICAgIGNbMF1cbiAgICAgICksIHkgJiAvKmVkaXRtb2RlKi9cbiAgICAgIDIgJiYgZyhcbiAgICAgICAgbCxcbiAgICAgICAgXCJkYXRhLWVkaXRtb2RlXCIsXG4gICAgICAgIC8qZWRpdG1vZGUqL1xuICAgICAgICBjWzFdXG4gICAgICApLCB5ICYgLyplZGl0bW9kZSovXG4gICAgICAyICYmIHIgIT09IChyID0gIS8qZWRpdG1vZGUqL1xuICAgICAgY1sxXSkgJiYgKGwuZGlzYWJsZWQgPSByKSwgeSAmIC8qbm9kZVZhbHVlKi9cbiAgICAgIDQgJiYgbC52YWx1ZSAhPT0gLypub2RlVmFsdWUqL1xuICAgICAgY1syXSAmJiAobC52YWx1ZSA9IC8qbm9kZVZhbHVlKi9cbiAgICAgIGNbMl0pLCB5ICYgLyptb2ROb2RlVmFsdWUqL1xuICAgICAgOCAmJiBkZShcbiAgICAgICAgXyxcbiAgICAgICAgLyptb2ROb2RlVmFsdWUqL1xuICAgICAgICBjWzNdXG4gICAgICApO1xuICAgIH0sXG4gICAgaTogSyxcbiAgICBvOiBLLFxuICAgIGQoYykge1xuICAgICAgYyAmJiBOKGUpLCBuWzhdKG51bGwpLCBmID0gITEsIGgoKTtcbiAgICB9XG4gIH07XG59XG5mdW5jdGlvbiBjaShuLCBlLCB0KSB7XG4gIGxldCB7IG5hbWU6IGkgfSA9IGUsIHsgc3RhdE5vZGU6IHMgfSA9IGUsIHsgbW9kTm9kZTogYSB9ID0gZSwgeyBlZGl0bW9kZTogbCA9ICExIH0gPSBlLCByID0gcy5nZXRWYWx1ZSgpLCBvID0gYS5nZXRWYWx1ZSgpO1xuICBjb25zdCBkID0gZ2UuZ2V0TmV3S2V5KCk7XG4gIEVlKCgpID0+IHtcbiAgICBzLmFkZFVwZGF0ZUxpc3RlbmVyKFwib25EZXJpdmVkTm9kZVVwZGF0ZVwiICsgZCwgdSksIGEuYWRkVXBkYXRlTGlzdGVuZXIoXCJvbkRlcml2ZWROb2RlVXBkYXRlXCIgKyBkLCB1KTtcbiAgfSksIEFlKCgpID0+IHtcbiAgICBzLnJlbW92ZVVwZGF0ZUxpc3RlbmVyKFwib25EZXJpdmVkTm9kZVVwZGF0ZVwiICsgZCksIGEucmVtb3ZlVXBkYXRlTGlzdGVuZXIoXCJvbkRlcml2ZWROb2RlVXBkYXRlXCIgKyBkKTtcbiAgfSk7XG4gIGZ1bmN0aW9uIHUoKSB7XG4gICAgdCgyLCByID0gcy5nZXRWYWx1ZSgpKSwgdCgzLCBvID0gYS5nZXRWYWx1ZSgpKTtcbiAgfVxuICBmdW5jdGlvbiBfKCkge1xuICAgIGxldCBjID0gcGFyc2VJbnQoZi52YWx1ZSk7XG4gICAgcy5zZXRWYWx1ZShjKTtcbiAgfVxuICBsZXQgZjtcbiAgZnVuY3Rpb24gaChjKSB7XG4gICAgbmVbYyA/IFwidW5zaGlmdFwiIDogXCJwdXNoXCJdKCgpID0+IHtcbiAgICAgIGYgPSBjLCB0KDQsIGYpO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBuLiQkc2V0ID0gKGMpID0+IHtcbiAgICBcIm5hbWVcIiBpbiBjICYmIHQoMCwgaSA9IGMubmFtZSksIFwic3RhdE5vZGVcIiBpbiBjICYmIHQoNiwgcyA9IGMuc3RhdE5vZGUpLCBcIm1vZE5vZGVcIiBpbiBjICYmIHQoNywgYSA9IGMubW9kTm9kZSksIFwiZWRpdG1vZGVcIiBpbiBjICYmIHQoMSwgbCA9IGMuZWRpdG1vZGUpO1xuICB9LCBbXG4gICAgaSxcbiAgICBsLFxuICAgIHIsXG4gICAgbyxcbiAgICBmLFxuICAgIF8sXG4gICAgcyxcbiAgICBhLFxuICAgIGhcbiAgXTtcbn1cbmNsYXNzIGFuIGV4dGVuZHMgb2Uge1xuICBjb25zdHJ1Y3RvcihlKSB7XG4gICAgc3VwZXIoKSwgbGUodGhpcywgZSwgY2ksIGZpLCB0ZSwge1xuICAgICAgbmFtZTogMCxcbiAgICAgIHN0YXROb2RlOiA2LFxuICAgICAgbW9kTm9kZTogNyxcbiAgICAgIGVkaXRtb2RlOiAxXG4gICAgfSk7XG4gIH1cbiAgZ2V0IG5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuJCQuY3R4WzBdO1xuICB9XG4gIHNldCBuYW1lKGUpIHtcbiAgICB0aGlzLiQkc2V0KHsgbmFtZTogZSB9KSwgRSgpO1xuICB9XG4gIGdldCBzdGF0Tm9kZSgpIHtcbiAgICByZXR1cm4gdGhpcy4kJC5jdHhbNl07XG4gIH1cbiAgc2V0IHN0YXROb2RlKGUpIHtcbiAgICB0aGlzLiQkc2V0KHsgc3RhdE5vZGU6IGUgfSksIEUoKTtcbiAgfVxuICBnZXQgbW9kTm9kZSgpIHtcbiAgICByZXR1cm4gdGhpcy4kJC5jdHhbN107XG4gIH1cbiAgc2V0IG1vZE5vZGUoZSkge1xuICAgIHRoaXMuJCRzZXQoeyBtb2ROb2RlOiBlIH0pLCBFKCk7XG4gIH1cbiAgZ2V0IGVkaXRtb2RlKCkge1xuICAgIHJldHVybiB0aGlzLiQkLmN0eFsxXTtcbiAgfVxuICBzZXQgZWRpdG1vZGUoZSkge1xuICAgIHRoaXMuJCRzZXQoeyBlZGl0bW9kZTogZSB9KSwgRSgpO1xuICB9XG59XG5yZShhbiwgeyBuYW1lOiB7fSwgc3RhdE5vZGU6IHt9LCBtb2ROb2RlOiB7fSwgZWRpdG1vZGU6IHsgdHlwZTogXCJCb29sZWFuXCIgfSB9LCBbXSwgW10sICEwKTtcbmZ1bmN0aW9uIGJ0KG4sIGUsIHQpIHtcbiAgY29uc3QgaSA9IG4uc2xpY2UoKTtcbiAgaVs0XSA9IGVbdF07XG4gIGNvbnN0IHMgPSAoXG4gICAgLypzdGF0cyovXG4gICAgaVsyXVtcbiAgICAgIC8qa2V5Ki9cbiAgICAgIGlbNF1cbiAgICBdXG4gICk7XG4gIGlbNV0gPSBzO1xuICBjb25zdCBhID0gKFxuICAgIC8qc3lzKi9cbiAgICBpWzBdLmRlcml2ZWQubW9kaWZpZXJzW1xuICAgICAgLyprZXkqL1xuICAgICAgaVs0XVxuICAgIF1cbiAgKTtcbiAgcmV0dXJuIGlbNl0gPSBhLCBpO1xufVxuZnVuY3Rpb24gJHQobikge1xuICBsZXQgZSwgdDtcbiAgcmV0dXJuIGUgPSBuZXcgYW4oe1xuICAgIHByb3BzOiB7XG4gICAgICBuYW1lOiAoXG4gICAgICAgIC8qa2V5Ki9cbiAgICAgICAgbls0XVxuICAgICAgKSxcbiAgICAgIHN0YXROb2RlOiAoXG4gICAgICAgIC8qbm9kZSovXG4gICAgICAgIG5bNV1cbiAgICAgICksXG4gICAgICBtb2ROb2RlOiAoXG4gICAgICAgIC8qbW9kTm9kZSovXG4gICAgICAgIG5bNl1cbiAgICAgICksXG4gICAgICBlZGl0bW9kZTogKFxuICAgICAgICAvKmVkaXQqL1xuICAgICAgICBuWzFdXG4gICAgICApXG4gICAgfVxuICB9KSwge1xuICAgIGMoKSB7XG4gICAgICBYKGUuJCQuZnJhZ21lbnQpO1xuICAgIH0sXG4gICAgbShpLCBzKSB7XG4gICAgICBXKGUsIGksIHMpLCB0ID0gITA7XG4gICAgfSxcbiAgICBwKGksIHMpIHtcbiAgICAgIGNvbnN0IGEgPSB7fTtcbiAgICAgIHMgJiAvKnN5cyovXG4gICAgICAxICYmIChhLm1vZE5vZGUgPSAvKm1vZE5vZGUqL1xuICAgICAgaVs2XSksIHMgJiAvKmVkaXQqL1xuICAgICAgMiAmJiAoYS5lZGl0bW9kZSA9IC8qZWRpdCovXG4gICAgICBpWzFdKSwgZS4kc2V0KGEpO1xuICAgIH0sXG4gICAgaShpKSB7XG4gICAgICB0IHx8IChSKGUuJCQuZnJhZ21lbnQsIGkpLCB0ID0gITApO1xuICAgIH0sXG4gICAgbyhpKSB7XG4gICAgICBQKGUuJCQuZnJhZ21lbnQsIGkpLCB0ID0gITE7XG4gICAgfSxcbiAgICBkKGkpIHtcbiAgICAgIFEoZSwgaSk7XG4gICAgfVxuICB9O1xufVxuZnVuY3Rpb24gaGkobikge1xuICBsZXQgZSwgdCwgaSA9IHNlKE9iamVjdC5rZXlzKFxuICAgIC8qc3RhdHMqL1xuICAgIG5bMl1cbiAgKSksIHMgPSBbXTtcbiAgZm9yIChsZXQgbCA9IDA7IGwgPCBpLmxlbmd0aDsgbCArPSAxKVxuICAgIHNbbF0gPSAkdChidChuLCBpLCBsKSk7XG4gIGNvbnN0IGEgPSAobCkgPT4gUChzW2xdLCAxLCAxLCAoKSA9PiB7XG4gICAgc1tsXSA9IG51bGw7XG4gIH0pO1xuICByZXR1cm4ge1xuICAgIGMoKSB7XG4gICAgICBlID0gJChcImRpdlwiKTtcbiAgICAgIGZvciAobGV0IGwgPSAwOyBsIDwgcy5sZW5ndGg7IGwgKz0gMSlcbiAgICAgICAgc1tsXS5jKCk7XG4gICAgICBnKGUsIFwiY2xhc3NcIiwgXCJTdGF0c1Jvd1wiKTtcbiAgICB9LFxuICAgIG0obCwgcikge1xuICAgICAgQihsLCBlLCByKTtcbiAgICAgIGZvciAobGV0IG8gPSAwOyBvIDwgcy5sZW5ndGg7IG8gKz0gMSlcbiAgICAgICAgc1tvXSAmJiBzW29dLm0oZSwgbnVsbCk7XG4gICAgICB0ID0gITA7XG4gICAgfSxcbiAgICBwKGwsIFtyXSkge1xuICAgICAgaWYgKHIgJiAvKk9iamVjdCwgc3RhdHMsIHN5cywgZWRpdCovXG4gICAgICA3KSB7XG4gICAgICAgIGkgPSBzZShPYmplY3Qua2V5cyhcbiAgICAgICAgICAvKnN0YXRzKi9cbiAgICAgICAgICBsWzJdXG4gICAgICAgICkpO1xuICAgICAgICBsZXQgbztcbiAgICAgICAgZm9yIChvID0gMDsgbyA8IGkubGVuZ3RoOyBvICs9IDEpIHtcbiAgICAgICAgICBjb25zdCBkID0gYnQobCwgaSwgbyk7XG4gICAgICAgICAgc1tvXSA/IChzW29dLnAoZCwgciksIFIoc1tvXSwgMSkpIDogKHNbb10gPSAkdChkKSwgc1tvXS5jKCksIFIoc1tvXSwgMSksIHNbb10ubShlLCBudWxsKSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh1ZSgpLCBvID0gaS5sZW5ndGg7IG8gPCBzLmxlbmd0aDsgbyArPSAxKVxuICAgICAgICAgIGEobyk7XG4gICAgICAgIGZlKCk7XG4gICAgICB9XG4gICAgfSxcbiAgICBpKGwpIHtcbiAgICAgIGlmICghdCkge1xuICAgICAgICBmb3IgKGxldCByID0gMDsgciA8IGkubGVuZ3RoOyByICs9IDEpXG4gICAgICAgICAgUihzW3JdKTtcbiAgICAgICAgdCA9ICEwO1xuICAgICAgfVxuICAgIH0sXG4gICAgbyhsKSB7XG4gICAgICBzID0gcy5maWx0ZXIoQm9vbGVhbik7XG4gICAgICBmb3IgKGxldCByID0gMDsgciA8IHMubGVuZ3RoOyByICs9IDEpXG4gICAgICAgIFAoc1tyXSk7XG4gICAgICB0ID0gITE7XG4gICAgfSxcbiAgICBkKGwpIHtcbiAgICAgIGwgJiYgTihlKSwgWmUocywgbCk7XG4gICAgfVxuICB9O1xufVxuZnVuY3Rpb24gZ2kobiwgZSwgdCkge1xuICBsZXQgeyBzeXM6IGkgfSA9IGUsIHsgZGF0YTogcyB9ID0gZSwgeyBlZGl0OiBhID0gITEgfSA9IGUsIGwgPSBpLmZpeGVkLnN0YXRzO1xuICByZXR1cm4gbi4kJHNldCA9IChyKSA9PiB7XG4gICAgXCJzeXNcIiBpbiByICYmIHQoMCwgaSA9IHIuc3lzKSwgXCJkYXRhXCIgaW4gciAmJiB0KDMsIHMgPSByLmRhdGEpLCBcImVkaXRcIiBpbiByICYmIHQoMSwgYSA9IHIuZWRpdCk7XG4gIH0sIFtpLCBhLCBsLCBzXTtcbn1cbmNsYXNzIGxuIGV4dGVuZHMgb2Uge1xuICBjb25zdHJ1Y3RvcihlKSB7XG4gICAgc3VwZXIoKSwgbGUodGhpcywgZSwgZ2ksIGhpLCB0ZSwgeyBzeXM6IDAsIGRhdGE6IDMsIGVkaXQ6IDEgfSk7XG4gIH1cbiAgZ2V0IHN5cygpIHtcbiAgICByZXR1cm4gdGhpcy4kJC5jdHhbMF07XG4gIH1cbiAgc2V0IHN5cyhlKSB7XG4gICAgdGhpcy4kJHNldCh7IHN5czogZSB9KSwgRSgpO1xuICB9XG4gIGdldCBkYXRhKCkge1xuICAgIHJldHVybiB0aGlzLiQkLmN0eFszXTtcbiAgfVxuICBzZXQgZGF0YShlKSB7XG4gICAgdGhpcy4kJHNldCh7IGRhdGE6IGUgfSksIEUoKTtcbiAgfVxuICBnZXQgZWRpdCgpIHtcbiAgICByZXR1cm4gdGhpcy4kJC5jdHhbMV07XG4gIH1cbiAgc2V0IGVkaXQoZSkge1xuICAgIHRoaXMuJCRzZXQoeyBlZGl0OiBlIH0pLCBFKCk7XG4gIH1cbn1cbnJlKGxuLCB7IHN5czoge30sIGRhdGE6IHt9LCBlZGl0OiB7IHR5cGU6IFwiQm9vbGVhblwiIH0gfSwgW10sIFtdLCAhMCk7XG5mdW5jdGlvbiB3dChuKSB7XG4gIGxldCBlLCB0LCBpID0gKFxuICAgIC8qaGFzVXAqL1xuICAgIG5bMV0gJiYgRHQobilcbiAgKSwgcyA9IChcbiAgICAvKmhhc0Rvd24qL1xuICAgIG5bMl0gJiYga3QobilcbiAgKTtcbiAgcmV0dXJuIHtcbiAgICBjKCkge1xuICAgICAgZSA9ICQoXCJkaXZcIiksIGkgJiYgaS5jKCksIHQgPSBqKCksIHMgJiYgcy5jKCksIGcoZSwgXCJjbGFzc1wiLCBcIkl0ZW1NYW5vdXZlck9wdGlvbnNcIik7XG4gICAgfSxcbiAgICBtKGEsIGwpIHtcbiAgICAgIEIoYSwgZSwgbCksIGkgJiYgaS5tKGUsIG51bGwpLCBiKGUsIHQpLCBzICYmIHMubShlLCBudWxsKTtcbiAgICB9LFxuICAgIHAoYSwgbCkge1xuICAgICAgLypoYXNVcCovXG4gICAgICBhWzFdID8gaSA/IGkucChhLCBsKSA6IChpID0gRHQoYSksIGkuYygpLCBpLm0oZSwgdCkpIDogaSAmJiAoaS5kKDEpLCBpID0gbnVsbCksIC8qaGFzRG93biovXG4gICAgICBhWzJdID8gcyA/IHMucChhLCBsKSA6IChzID0ga3QoYSksIHMuYygpLCBzLm0oZSwgbnVsbCkpIDogcyAmJiAocy5kKDEpLCBzID0gbnVsbCk7XG4gICAgfSxcbiAgICBkKGEpIHtcbiAgICAgIGEgJiYgTihlKSwgaSAmJiBpLmQoKSwgcyAmJiBzLmQoKTtcbiAgICB9XG4gIH07XG59XG5mdW5jdGlvbiBEdChuKSB7XG4gIGxldCBlLCB0LCBpO1xuICByZXR1cm4ge1xuICAgIGMoKSB7XG4gICAgICBlID0gJChcImRpdlwiKSwgZS50ZXh0Q29udGVudCA9IFwiVXBcIiwgZyhlLCBcImNsYXNzXCIsIFwiSXRlbU1hbm91dmVyT3B0aW9uXCIpO1xuICAgIH0sXG4gICAgbShzLCBhKSB7XG4gICAgICBCKHMsIGUsIGEpLCB0IHx8IChpID0gW1xuICAgICAgICBVKFxuICAgICAgICAgIGUsXG4gICAgICAgICAgXCJrZXl1cFwiLFxuICAgICAgICAgIC8qa2V5dXBfaGFuZGxlciovXG4gICAgICAgICAgbls3XVxuICAgICAgICApLFxuICAgICAgICBVKFxuICAgICAgICAgIGUsXG4gICAgICAgICAgXCJjbGlja1wiLFxuICAgICAgICAgIC8qbW92ZVVwKi9cbiAgICAgICAgICBuWzNdXG4gICAgICAgIClcbiAgICAgIF0sIHQgPSAhMCk7XG4gICAgfSxcbiAgICBwOiBLLFxuICAgIGQocykge1xuICAgICAgcyAmJiBOKGUpLCB0ID0gITEsIFkoaSk7XG4gICAgfVxuICB9O1xufVxuZnVuY3Rpb24ga3Qobikge1xuICBsZXQgZSwgdCwgaTtcbiAgcmV0dXJuIHtcbiAgICBjKCkge1xuICAgICAgZSA9ICQoXCJkaXZcIiksIGUudGV4dENvbnRlbnQgPSBcIkRvd25cIiwgZyhlLCBcImNsYXNzXCIsIFwiSXRlbU1hbm91dmVyT3B0aW9uXCIpO1xuICAgIH0sXG4gICAgbShzLCBhKSB7XG4gICAgICBCKHMsIGUsIGEpLCB0IHx8IChpID0gW1xuICAgICAgICBVKFxuICAgICAgICAgIGUsXG4gICAgICAgICAgXCJrZXl1cFwiLFxuICAgICAgICAgIC8qa2V5dXBfaGFuZGxlcl8xKi9cbiAgICAgICAgICBuWzZdXG4gICAgICAgICksXG4gICAgICAgIFUoXG4gICAgICAgICAgZSxcbiAgICAgICAgICBcImNsaWNrXCIsXG4gICAgICAgICAgLyptb3ZlRG93biovXG4gICAgICAgICAgbls0XVxuICAgICAgICApXG4gICAgICBdLCB0ID0gITApO1xuICAgIH0sXG4gICAgcDogSyxcbiAgICBkKHMpIHtcbiAgICAgIHMgJiYgTihlKSwgdCA9ICExLCBZKGkpO1xuICAgIH1cbiAgfTtcbn1cbmZ1bmN0aW9uIF9pKG4pIHtcbiAgbGV0IGUsIHQgPSAoXG4gICAgLyplZGl0TW9kZSovXG4gICAgblswXSAmJiB3dChuKVxuICApO1xuICByZXR1cm4ge1xuICAgIGMoKSB7XG4gICAgICBlID0gJChcImRpdlwiKSwgdCAmJiB0LmMoKSwgZyhlLCBcImNsYXNzXCIsIFwiSXRlbU1hbm91dmVyQ29udGFpbmVyXCIpO1xuICAgIH0sXG4gICAgbShpLCBzKSB7XG4gICAgICBCKGksIGUsIHMpLCB0ICYmIHQubShlLCBudWxsKTtcbiAgICB9LFxuICAgIHAoaSwgW3NdKSB7XG4gICAgICAvKmVkaXRNb2RlKi9cbiAgICAgIGlbMF0gPyB0ID8gdC5wKGksIHMpIDogKHQgPSB3dChpKSwgdC5jKCksIHQubShlLCBudWxsKSkgOiB0ICYmICh0LmQoMSksIHQgPSBudWxsKTtcbiAgICB9LFxuICAgIGk6IEssXG4gICAgbzogSyxcbiAgICBkKGkpIHtcbiAgICAgIGkgJiYgTihlKSwgdCAmJiB0LmQoKTtcbiAgICB9XG4gIH07XG59XG5mdW5jdGlvbiBtaShuLCBlLCB0KSB7XG4gIGxldCBpID0gbnQoKSwgeyBkYXRhOiBzIH0gPSBlLCB7IGVkaXRNb2RlOiBhIH0gPSBlLCB7IGhhc1VwOiBsIH0gPSBlLCB7IGhhc0Rvd246IHIgfSA9IGU7XG4gIGZ1bmN0aW9uIG8oKSB7XG4gICAgaShcIm1vdmVVcFwiLCBzLmlkKTtcbiAgfVxuICBmdW5jdGlvbiBkKCkge1xuICAgIGkoXCJtb3ZlRG93blwiLCBzLmlkKTtcbiAgfVxuICBmdW5jdGlvbiB1KGYpIHtcbiAgICBtZS5jYWxsKHRoaXMsIG4sIGYpO1xuICB9XG4gIGZ1bmN0aW9uIF8oZikge1xuICAgIG1lLmNhbGwodGhpcywgbiwgZik7XG4gIH1cbiAgcmV0dXJuIG4uJCRzZXQgPSAoZikgPT4ge1xuICAgIFwiZGF0YVwiIGluIGYgJiYgdCg1LCBzID0gZi5kYXRhKSwgXCJlZGl0TW9kZVwiIGluIGYgJiYgdCgwLCBhID0gZi5lZGl0TW9kZSksIFwiaGFzVXBcIiBpbiBmICYmIHQoMSwgbCA9IGYuaGFzVXApLCBcImhhc0Rvd25cIiBpbiBmICYmIHQoMiwgciA9IGYuaGFzRG93bik7XG4gIH0sIFtcbiAgICBhLFxuICAgIGwsXG4gICAgcixcbiAgICBvLFxuICAgIGQsXG4gICAgcyxcbiAgICB1LFxuICAgIF9cbiAgXTtcbn1cbmNsYXNzIHJuIGV4dGVuZHMgb2Uge1xuICBjb25zdHJ1Y3RvcihlKSB7XG4gICAgc3VwZXIoKSwgbGUodGhpcywgZSwgbWksIF9pLCB0ZSwge1xuICAgICAgZGF0YTogNSxcbiAgICAgIGVkaXRNb2RlOiAwLFxuICAgICAgaGFzVXA6IDEsXG4gICAgICBoYXNEb3duOiAyXG4gICAgfSk7XG4gIH1cbiAgZ2V0IGRhdGEoKSB7XG4gICAgcmV0dXJuIHRoaXMuJCQuY3R4WzVdO1xuICB9XG4gIHNldCBkYXRhKGUpIHtcbiAgICB0aGlzLiQkc2V0KHsgZGF0YTogZSB9KSwgRSgpO1xuICB9XG4gIGdldCBlZGl0TW9kZSgpIHtcbiAgICByZXR1cm4gdGhpcy4kJC5jdHhbMF07XG4gIH1cbiAgc2V0IGVkaXRNb2RlKGUpIHtcbiAgICB0aGlzLiQkc2V0KHsgZWRpdE1vZGU6IGUgfSksIEUoKTtcbiAgfVxuICBnZXQgaGFzVXAoKSB7XG4gICAgcmV0dXJuIHRoaXMuJCQuY3R4WzFdO1xuICB9XG4gIHNldCBoYXNVcChlKSB7XG4gICAgdGhpcy4kJHNldCh7IGhhc1VwOiBlIH0pLCBFKCk7XG4gIH1cbiAgZ2V0IGhhc0Rvd24oKSB7XG4gICAgcmV0dXJuIHRoaXMuJCQuY3R4WzJdO1xuICB9XG4gIHNldCBoYXNEb3duKGUpIHtcbiAgICB0aGlzLiQkc2V0KHsgaGFzRG93bjogZSB9KSwgRSgpO1xuICB9XG59XG5yZShybiwgeyBkYXRhOiB7fSwgZWRpdE1vZGU6IHt9LCBoYXNVcDoge30sIGhhc0Rvd246IHt9IH0sIFtdLCBbXSwgITApO1xuZnVuY3Rpb24gSXQobikge1xuICBsZXQgZSwgdCwgaTtcbiAgZnVuY3Rpb24gcyhsKSB7XG4gICAgbls3XShsKTtcbiAgfVxuICBsZXQgYSA9IHsgZWRpdE1vZGU6ICEwIH07XG4gIHJldHVybiAoXG4gICAgLypkYXRhKi9cbiAgICBuWzBdICE9PSB2b2lkIDAgJiYgKGEuZGF0YSA9IC8qZGF0YSovXG4gICAgblswXSksIGUgPSBuZXcgWnQoeyBwcm9wczogYSB9KSwgbmUucHVzaCgoKSA9PiB5ZShlLCBcImRhdGFcIiwgcykpLCBlLiRvbihcbiAgICAgIFwib3B0aW9uU2VsZWN0ZWRcIixcbiAgICAgIC8qdXBkYXRlRGF0YSovXG4gICAgICBuWzZdXG4gICAgKSwge1xuICAgICAgYygpIHtcbiAgICAgICAgWChlLiQkLmZyYWdtZW50KTtcbiAgICAgIH0sXG4gICAgICBtKGwsIHIpIHtcbiAgICAgICAgVyhlLCBsLCByKSwgaSA9ICEwO1xuICAgICAgfSxcbiAgICAgIHAobCwgcikge1xuICAgICAgICBjb25zdCBvID0ge307XG4gICAgICAgICF0ICYmIHIgJiAvKmRhdGEqL1xuICAgICAgICAxICYmICh0ID0gITAsIG8uZGF0YSA9IC8qZGF0YSovXG4gICAgICAgIGxbMF0sIHZlKCgpID0+IHQgPSAhMSkpLCBlLiRzZXQobyk7XG4gICAgICB9LFxuICAgICAgaShsKSB7XG4gICAgICAgIGkgfHwgKFIoZS4kJC5mcmFnbWVudCwgbCksIGkgPSAhMCk7XG4gICAgICB9LFxuICAgICAgbyhsKSB7XG4gICAgICAgIFAoZS4kJC5mcmFnbWVudCwgbCksIGkgPSAhMTtcbiAgICAgIH0sXG4gICAgICBkKGwpIHtcbiAgICAgICAgUShlLCBsKTtcbiAgICAgIH1cbiAgICB9XG4gICk7XG59XG5mdW5jdGlvbiBTdChuKSB7XG4gIGxldCBlLCB0LCBpO1xuICBmdW5jdGlvbiBzKGwpIHtcbiAgICBuWzhdKGwpO1xuICB9XG4gIGxldCBhID0ge1xuICAgIGVkaXRNb2RlOiAoXG4gICAgICAvKmxheW91dE1vZGUqL1xuICAgICAgbls1XVxuICAgICksXG4gICAgaGFzRG93bjogKFxuICAgICAgLyppbmRleCovXG4gICAgICBuWzRdICE9IC8qbGVuZ3RoKi9cbiAgICAgIG5bM10gLSAxXG4gICAgKSxcbiAgICBoYXNVcDogKFxuICAgICAgLyppbmRleCovXG4gICAgICBuWzRdICE9IDBcbiAgICApXG4gIH07XG4gIHJldHVybiAoXG4gICAgLypkYXRhKi9cbiAgICBuWzBdICE9PSB2b2lkIDAgJiYgKGEuZGF0YSA9IC8qZGF0YSovXG4gICAgblswXSksIGUgPSBuZXcgcm4oeyBwcm9wczogYSB9KSwgbmUucHVzaCgoKSA9PiB5ZShlLCBcImRhdGFcIiwgcykpLCBlLiRvbihcbiAgICAgIFwibW92ZVVwXCIsXG4gICAgICAvKm1vdmVVcF9oYW5kbGVyKi9cbiAgICAgIG5bOV1cbiAgICApLCBlLiRvbihcbiAgICAgIFwibW92ZURvd25cIixcbiAgICAgIC8qbW92ZURvd25faGFuZGxlciovXG4gICAgICBuWzEwXVxuICAgICksIHtcbiAgICAgIGMoKSB7XG4gICAgICAgIFgoZS4kJC5mcmFnbWVudCk7XG4gICAgICB9LFxuICAgICAgbShsLCByKSB7XG4gICAgICAgIFcoZSwgbCwgciksIGkgPSAhMDtcbiAgICAgIH0sXG4gICAgICBwKGwsIHIpIHtcbiAgICAgICAgY29uc3QgbyA9IHt9O1xuICAgICAgICByICYgLypsYXlvdXRNb2RlKi9cbiAgICAgICAgMzIgJiYgKG8uZWRpdE1vZGUgPSAvKmxheW91dE1vZGUqL1xuICAgICAgICBsWzVdKSwgciAmIC8qaW5kZXgsIGxlbmd0aCovXG4gICAgICAgIDI0ICYmIChvLmhhc0Rvd24gPSAvKmluZGV4Ki9cbiAgICAgICAgbFs0XSAhPSAvKmxlbmd0aCovXG4gICAgICAgIGxbM10gLSAxKSwgciAmIC8qaW5kZXgqL1xuICAgICAgICAxNiAmJiAoby5oYXNVcCA9IC8qaW5kZXgqL1xuICAgICAgICBsWzRdICE9IDApLCAhdCAmJiByICYgLypkYXRhKi9cbiAgICAgICAgMSAmJiAodCA9ICEwLCBvLmRhdGEgPSAvKmRhdGEqL1xuICAgICAgICBsWzBdLCB2ZSgoKSA9PiB0ID0gITEpKSwgZS4kc2V0KG8pO1xuICAgICAgfSxcbiAgICAgIGkobCkge1xuICAgICAgICBpIHx8IChSKGUuJCQuZnJhZ21lbnQsIGwpLCBpID0gITApO1xuICAgICAgfSxcbiAgICAgIG8obCkge1xuICAgICAgICBQKGUuJCQuZnJhZ21lbnQsIGwpLCBpID0gITE7XG4gICAgICB9LFxuICAgICAgZChsKSB7XG4gICAgICAgIFEoZSwgbCk7XG4gICAgICB9XG4gICAgfVxuICApO1xufVxuZnVuY3Rpb24gcGkobikge1xuICBsZXQgZSwgdCwgaSwgcywgYTtcbiAgZnVuY3Rpb24gbChvKSB7XG4gICAgblsxNV0obyk7XG4gIH1cbiAgbGV0IHIgPSB7XG4gICAgZWRpdDogKFxuICAgICAgLyplZGl0TW9kZSovXG4gICAgICBuWzFdXG4gICAgKSxcbiAgICBzeXM6IChcbiAgICAgIC8qc3lzKi9cbiAgICAgIG5bMl1cbiAgICApXG4gIH07XG4gIHJldHVybiAoXG4gICAgLypkYXRhKi9cbiAgICBuWzBdICE9PSB2b2lkIDAgJiYgKHIuZGF0YSA9IC8qZGF0YSovXG4gICAgblswXSksIHQgPSBuZXcgbG4oeyBwcm9wczogciB9KSwgbmUucHVzaCgoKSA9PiB5ZSh0LCBcImRhdGFcIiwgbCkpLCB0LiRvbihcbiAgICAgIFwib3B0aW9uU2VsZWN0ZWRcIixcbiAgICAgIC8qdXBkYXRlRGF0YSovXG4gICAgICBuWzZdXG4gICAgKSwge1xuICAgICAgYygpIHtcbiAgICAgICAgZSA9ICQoXCJkaXZcIiksIFgodC4kJC5mcmFnbWVudCk7XG4gICAgICB9LFxuICAgICAgbShvLCBkKSB7XG4gICAgICAgIEIobywgZSwgZCksIFcodCwgZSwgbnVsbCksIGEgPSAhMDtcbiAgICAgIH0sXG4gICAgICBwKG8sIGQpIHtcbiAgICAgICAgY29uc3QgdSA9IHt9O1xuICAgICAgICBkICYgLyplZGl0TW9kZSovXG4gICAgICAgIDIgJiYgKHUuZWRpdCA9IC8qZWRpdE1vZGUqL1xuICAgICAgICBvWzFdKSwgZCAmIC8qc3lzKi9cbiAgICAgICAgNCAmJiAodS5zeXMgPSAvKnN5cyovXG4gICAgICAgIG9bMl0pLCAhaSAmJiBkICYgLypkYXRhKi9cbiAgICAgICAgMSAmJiAoaSA9ICEwLCB1LmRhdGEgPSAvKmRhdGEqL1xuICAgICAgICBvWzBdLCB2ZSgoKSA9PiBpID0gITEpKSwgdC4kc2V0KHUpO1xuICAgICAgfSxcbiAgICAgIGkobykge1xuICAgICAgICBhIHx8IChSKHQuJCQuZnJhZ21lbnQsIG8pLCBvICYmIGllKCgpID0+IHtcbiAgICAgICAgICBhICYmIChzIHx8IChzID0geihlLCBhZSwge30sICEwKSksIHMucnVuKDEpKTtcbiAgICAgICAgfSksIGEgPSAhMCk7XG4gICAgICB9LFxuICAgICAgbyhvKSB7XG4gICAgICAgIFAodC4kJC5mcmFnbWVudCwgbyksIG8gJiYgKHMgfHwgKHMgPSB6KGUsIGFlLCB7fSwgITEpKSwgcy5ydW4oMCkpLCBhID0gITE7XG4gICAgICB9LFxuICAgICAgZChvKSB7XG4gICAgICAgIG8gJiYgTihlKSwgUSh0KSwgbyAmJiBzICYmIHMuZW5kKCk7XG4gICAgICB9XG4gICAgfVxuICApO1xufVxuZnVuY3Rpb24gdmkobikge1xuICBsZXQgZSwgdCwgaSwgcywgYTtcbiAgZnVuY3Rpb24gbChvKSB7XG4gICAgblsxNF0obyk7XG4gIH1cbiAgbGV0IHIgPSB7XG4gICAgZWRpdDogKFxuICAgICAgLyplZGl0TW9kZSovXG4gICAgICBuWzFdXG4gICAgKSxcbiAgICBzeXM6IChcbiAgICAgIC8qc3lzKi9cbiAgICAgIG5bMl1cbiAgICApXG4gIH07XG4gIHJldHVybiAoXG4gICAgLypkYXRhKi9cbiAgICBuWzBdICE9PSB2b2lkIDAgJiYgKHIuZGF0YSA9IC8qZGF0YSovXG4gICAgblswXSksIHQgPSBuZXcgc24oeyBwcm9wczogciB9KSwgbmUucHVzaCgoKSA9PiB5ZSh0LCBcImRhdGFcIiwgbCkpLCB0LiRvbihcbiAgICAgIFwib3B0aW9uU2VsZWN0ZWRcIixcbiAgICAgIC8qdXBkYXRlRGF0YSovXG4gICAgICBuWzZdXG4gICAgKSwge1xuICAgICAgYygpIHtcbiAgICAgICAgZSA9ICQoXCJkaXZcIiksIFgodC4kJC5mcmFnbWVudCk7XG4gICAgICB9LFxuICAgICAgbShvLCBkKSB7XG4gICAgICAgIEIobywgZSwgZCksIFcodCwgZSwgbnVsbCksIGEgPSAhMDtcbiAgICAgIH0sXG4gICAgICBwKG8sIGQpIHtcbiAgICAgICAgY29uc3QgdSA9IHt9O1xuICAgICAgICBkICYgLyplZGl0TW9kZSovXG4gICAgICAgIDIgJiYgKHUuZWRpdCA9IC8qZWRpdE1vZGUqL1xuICAgICAgICBvWzFdKSwgZCAmIC8qc3lzKi9cbiAgICAgICAgNCAmJiAodS5zeXMgPSAvKnN5cyovXG4gICAgICAgIG9bMl0pLCAhaSAmJiBkICYgLypkYXRhKi9cbiAgICAgICAgMSAmJiAoaSA9ICEwLCB1LmRhdGEgPSAvKmRhdGEqL1xuICAgICAgICBvWzBdLCB2ZSgoKSA9PiBpID0gITEpKSwgdC4kc2V0KHUpO1xuICAgICAgfSxcbiAgICAgIGkobykge1xuICAgICAgICBhIHx8IChSKHQuJCQuZnJhZ21lbnQsIG8pLCBvICYmIGllKCgpID0+IHtcbiAgICAgICAgICBhICYmIChzIHx8IChzID0geihlLCBhZSwge30sICEwKSksIHMucnVuKDEpKTtcbiAgICAgICAgfSksIGEgPSAhMCk7XG4gICAgICB9LFxuICAgICAgbyhvKSB7XG4gICAgICAgIFAodC4kJC5mcmFnbWVudCwgbyksIG8gJiYgKHMgfHwgKHMgPSB6KGUsIGFlLCB7fSwgITEpKSwgcy5ydW4oMCkpLCBhID0gITE7XG4gICAgICB9LFxuICAgICAgZChvKSB7XG4gICAgICAgIG8gJiYgTihlKSwgUSh0KSwgbyAmJiBzICYmIHMuZW5kKCk7XG4gICAgICB9XG4gICAgfVxuICApO1xufVxuZnVuY3Rpb24geWkobikge1xuICBsZXQgZSwgdCwgaSwgcywgYTtcbiAgZnVuY3Rpb24gbChvKSB7XG4gICAgblsxM10obyk7XG4gIH1cbiAgbGV0IHIgPSB7XG4gICAgZWRpdDogKFxuICAgICAgLyplZGl0TW9kZSovXG4gICAgICBuWzFdXG4gICAgKSxcbiAgICBzeXM6IChcbiAgICAgIC8qc3lzKi9cbiAgICAgIG5bMl1cbiAgICApXG4gIH07XG4gIHJldHVybiAoXG4gICAgLypkYXRhKi9cbiAgICBuWzBdICE9PSB2b2lkIDAgJiYgKHIuZGF0YSA9IC8qZGF0YSovXG4gICAgblswXSksIHQgPSBuZXcgbm4oeyBwcm9wczogciB9KSwgbmUucHVzaCgoKSA9PiB5ZSh0LCBcImRhdGFcIiwgbCkpLCB0LiRvbihcbiAgICAgIFwib3B0aW9uU2VsZWN0ZWRcIixcbiAgICAgIC8qdXBkYXRlRGF0YSovXG4gICAgICBuWzZdXG4gICAgKSwge1xuICAgICAgYygpIHtcbiAgICAgICAgZSA9ICQoXCJkaXZcIiksIFgodC4kJC5mcmFnbWVudCk7XG4gICAgICB9LFxuICAgICAgbShvLCBkKSB7XG4gICAgICAgIEIobywgZSwgZCksIFcodCwgZSwgbnVsbCksIGEgPSAhMDtcbiAgICAgIH0sXG4gICAgICBwKG8sIGQpIHtcbiAgICAgICAgY29uc3QgdSA9IHt9O1xuICAgICAgICBkICYgLyplZGl0TW9kZSovXG4gICAgICAgIDIgJiYgKHUuZWRpdCA9IC8qZWRpdE1vZGUqL1xuICAgICAgICBvWzFdKSwgZCAmIC8qc3lzKi9cbiAgICAgICAgNCAmJiAodS5zeXMgPSAvKnN5cyovXG4gICAgICAgIG9bMl0pLCAhaSAmJiBkICYgLypkYXRhKi9cbiAgICAgICAgMSAmJiAoaSA9ICEwLCB1LmRhdGEgPSAvKmRhdGEqL1xuICAgICAgICBvWzBdLCB2ZSgoKSA9PiBpID0gITEpKSwgdC4kc2V0KHUpO1xuICAgICAgfSxcbiAgICAgIGkobykge1xuICAgICAgICBhIHx8IChSKHQuJCQuZnJhZ21lbnQsIG8pLCBvICYmIGllKCgpID0+IHtcbiAgICAgICAgICBhICYmIChzIHx8IChzID0geihlLCBhZSwge30sICEwKSksIHMucnVuKDEpKTtcbiAgICAgICAgfSksIGEgPSAhMCk7XG4gICAgICB9LFxuICAgICAgbyhvKSB7XG4gICAgICAgIFAodC4kJC5mcmFnbWVudCwgbyksIG8gJiYgKHMgfHwgKHMgPSB6KGUsIGFlLCB7fSwgITEpKSwgcy5ydW4oMCkpLCBhID0gITE7XG4gICAgICB9LFxuICAgICAgZChvKSB7XG4gICAgICAgIG8gJiYgTihlKSwgUSh0KSwgbyAmJiBzICYmIHMuZW5kKCk7XG4gICAgICB9XG4gICAgfVxuICApO1xufVxuZnVuY3Rpb24gYmkobikge1xuICBsZXQgZSwgdCwgaSwgcywgYTtcbiAgZnVuY3Rpb24gbChvKSB7XG4gICAgblsxMl0obyk7XG4gIH1cbiAgbGV0IHIgPSB7XG4gICAgc3lzOiAoXG4gICAgICAvKnN5cyovXG4gICAgICBuWzJdXG4gICAgKSxcbiAgICBlZGl0TW9kZTogKFxuICAgICAgLyplZGl0TW9kZSovXG4gICAgICBuWzFdXG4gICAgKVxuICB9O1xuICByZXR1cm4gKFxuICAgIC8qZGF0YSovXG4gICAgblswXSAhPT0gdm9pZCAwICYmIChyLmRhdGEgPSAvKmRhdGEqL1xuICAgIG5bMF0pLCB0ID0gbmV3IGVuKHsgcHJvcHM6IHIgfSksIG5lLnB1c2goKCkgPT4geWUodCwgXCJkYXRhXCIsIGwpKSwgdC4kb24oXG4gICAgICBcIm9wdGlvblNlbGVjdGVkXCIsXG4gICAgICAvKnVwZGF0ZURhdGEqL1xuICAgICAgbls2XVxuICAgICksIHtcbiAgICAgIGMoKSB7XG4gICAgICAgIGUgPSAkKFwiZGl2XCIpLCBYKHQuJCQuZnJhZ21lbnQpO1xuICAgICAgfSxcbiAgICAgIG0obywgZCkge1xuICAgICAgICBCKG8sIGUsIGQpLCBXKHQsIGUsIG51bGwpLCBhID0gITA7XG4gICAgICB9LFxuICAgICAgcChvLCBkKSB7XG4gICAgICAgIGNvbnN0IHUgPSB7fTtcbiAgICAgICAgZCAmIC8qc3lzKi9cbiAgICAgICAgNCAmJiAodS5zeXMgPSAvKnN5cyovXG4gICAgICAgIG9bMl0pLCBkICYgLyplZGl0TW9kZSovXG4gICAgICAgIDIgJiYgKHUuZWRpdE1vZGUgPSAvKmVkaXRNb2RlKi9cbiAgICAgICAgb1sxXSksICFpICYmIGQgJiAvKmRhdGEqL1xuICAgICAgICAxICYmIChpID0gITAsIHUuZGF0YSA9IC8qZGF0YSovXG4gICAgICAgIG9bMF0sIHZlKCgpID0+IGkgPSAhMSkpLCB0LiRzZXQodSk7XG4gICAgICB9LFxuICAgICAgaShvKSB7XG4gICAgICAgIGEgfHwgKFIodC4kJC5mcmFnbWVudCwgbyksIG8gJiYgaWUoKCkgPT4ge1xuICAgICAgICAgIGEgJiYgKHMgfHwgKHMgPSB6KGUsIGFlLCB7fSwgITApKSwgcy5ydW4oMSkpO1xuICAgICAgICB9KSwgYSA9ICEwKTtcbiAgICAgIH0sXG4gICAgICBvKG8pIHtcbiAgICAgICAgUCh0LiQkLmZyYWdtZW50LCBvKSwgbyAmJiAocyB8fCAocyA9IHooZSwgYWUsIHt9LCAhMSkpLCBzLnJ1bigwKSksIGEgPSAhMTtcbiAgICAgIH0sXG4gICAgICBkKG8pIHtcbiAgICAgICAgbyAmJiBOKGUpLCBRKHQpLCBvICYmIHMgJiYgcy5lbmQoKTtcbiAgICAgIH1cbiAgICB9XG4gICk7XG59XG5mdW5jdGlvbiAkaShuKSB7XG4gIGxldCBlLCB0LCBpLCBzLCBhO1xuICBmdW5jdGlvbiBsKG8pIHtcbiAgICBuWzExXShvKTtcbiAgfVxuICBsZXQgciA9IHtcbiAgICBzeXM6IChcbiAgICAgIC8qc3lzKi9cbiAgICAgIG5bMl1cbiAgICApLFxuICAgIGVkaXRNb2RlOiAoXG4gICAgICAvKmVkaXRNb2RlKi9cbiAgICAgIG5bMV1cbiAgICApLFxuICAgIHBsYXlNb2RlOiAhMVxuICB9O1xuICByZXR1cm4gKFxuICAgIC8qZGF0YSovXG4gICAgblswXSAhPT0gdm9pZCAwICYmIChyLmRhdGEgPSAvKmRhdGEqL1xuICAgIG5bMF0pLCB0ID0gbmV3IHh0KHsgcHJvcHM6IHIgfSksIG5lLnB1c2goKCkgPT4geWUodCwgXCJkYXRhXCIsIGwpKSwgdC4kb24oXG4gICAgICBcIm9wdGlvblNlbGVjdGVkXCIsXG4gICAgICAvKnVwZGF0ZURhdGEqL1xuICAgICAgbls2XVxuICAgICksIHtcbiAgICAgIGMoKSB7XG4gICAgICAgIGUgPSAkKFwiZGl2XCIpLCBYKHQuJCQuZnJhZ21lbnQpO1xuICAgICAgfSxcbiAgICAgIG0obywgZCkge1xuICAgICAgICBCKG8sIGUsIGQpLCBXKHQsIGUsIG51bGwpLCBhID0gITA7XG4gICAgICB9LFxuICAgICAgcChvLCBkKSB7XG4gICAgICAgIGNvbnN0IHUgPSB7fTtcbiAgICAgICAgZCAmIC8qc3lzKi9cbiAgICAgICAgNCAmJiAodS5zeXMgPSAvKnN5cyovXG4gICAgICAgIG9bMl0pLCBkICYgLyplZGl0TW9kZSovXG4gICAgICAgIDIgJiYgKHUuZWRpdE1vZGUgPSAvKmVkaXRNb2RlKi9cbiAgICAgICAgb1sxXSksICFpICYmIGQgJiAvKmRhdGEqL1xuICAgICAgICAxICYmIChpID0gITAsIHUuZGF0YSA9IC8qZGF0YSovXG4gICAgICAgIG9bMF0sIHZlKCgpID0+IGkgPSAhMSkpLCB0LiRzZXQodSk7XG4gICAgICB9LFxuICAgICAgaShvKSB7XG4gICAgICAgIGEgfHwgKFIodC4kJC5mcmFnbWVudCwgbyksIG8gJiYgaWUoKCkgPT4ge1xuICAgICAgICAgIGEgJiYgKHMgfHwgKHMgPSB6KGUsIGFlLCB7fSwgITApKSwgcy5ydW4oMSkpO1xuICAgICAgICB9KSwgYSA9ICEwKTtcbiAgICAgIH0sXG4gICAgICBvKG8pIHtcbiAgICAgICAgUCh0LiQkLmZyYWdtZW50LCBvKSwgbyAmJiAocyB8fCAocyA9IHooZSwgYWUsIHt9LCAhMSkpLCBzLnJ1bigwKSksIGEgPSAhMTtcbiAgICAgIH0sXG4gICAgICBkKG8pIHtcbiAgICAgICAgbyAmJiBOKGUpLCBRKHQpLCBvICYmIHMgJiYgcy5lbmQoKTtcbiAgICAgIH1cbiAgICB9XG4gICk7XG59XG5mdW5jdGlvbiB3aShuKSB7XG4gIGxldCBlLCB0LCBpLCBzLCBhLCBsLCByID0gKFxuICAgIC8qZWRpdE1vZGUqL1xuICAgIG5bMV0gJiYgSXQobilcbiAgKSwgbyA9IChcbiAgICAvKmxlbmd0aCovXG4gICAgblszXSAhPSAxICYmIFN0KG4pXG4gICk7XG4gIGNvbnN0IGQgPSBbXG4gICAgJGksXG4gICAgYmksXG4gICAgeWksXG4gICAgdmksXG4gICAgcGlcbiAgXSwgdSA9IFtdO1xuICBmdW5jdGlvbiBfKGYsIGgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgLypkYXRhKi9cbiAgICAgIGZbMF0udHlwZSA9PSBfZS5IaXRQb2ludHMgPyAwIDogKFxuICAgICAgICAvKmRhdGEqL1xuICAgICAgICBmWzBdLnR5cGUgPT0gX2UuUHJvZmljaWVuY3lCb251cyA/IDEgOiAoXG4gICAgICAgICAgLypkYXRhKi9cbiAgICAgICAgICBmWzBdLnR5cGUgPT0gX2UuU2tpbGxQcm9maWNpZW5jaWVzID8gMiA6IChcbiAgICAgICAgICAgIC8qZGF0YSovXG4gICAgICAgICAgICBmWzBdLnR5cGUgPT0gX2UuU3BlbGxJbmZvID8gMyA6IChcbiAgICAgICAgICAgICAgLypkYXRhKi9cbiAgICAgICAgICAgICAgZlswXS50eXBlID09IF9lLlN0YXRzID8gNCA6IC0xXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgKTtcbiAgfVxuICByZXR1cm4gfihzID0gXyhuKSkgJiYgKGEgPSB1W3NdID0gZFtzXShuKSksIHtcbiAgICBjKCkge1xuICAgICAgZSA9ICQoXCJkaXZcIiksIHIgJiYgci5jKCksIHQgPSBqKCksIG8gJiYgby5jKCksIGkgPSBqKCksIGEgJiYgYS5jKCk7XG4gICAgfSxcbiAgICBtKGYsIGgpIHtcbiAgICAgIEIoZiwgZSwgaCksIHIgJiYgci5tKGUsIG51bGwpLCBiKGUsIHQpLCBvICYmIG8ubShlLCBudWxsKSwgYihlLCBpKSwgfnMgJiYgdVtzXS5tKGUsIG51bGwpLCBsID0gITA7XG4gICAgfSxcbiAgICBwKGYsIFtoXSkge1xuICAgICAgLyplZGl0TW9kZSovXG4gICAgICBmWzFdID8gciA/IChyLnAoZiwgaCksIGggJiAvKmVkaXRNb2RlKi9cbiAgICAgIDIgJiYgUihyLCAxKSkgOiAociA9IEl0KGYpLCByLmMoKSwgUihyLCAxKSwgci5tKGUsIHQpKSA6IHIgJiYgKHVlKCksIFAociwgMSwgMSwgKCkgPT4ge1xuICAgICAgICByID0gbnVsbDtcbiAgICAgIH0pLCBmZSgpKSwgLypsZW5ndGgqL1xuICAgICAgZlszXSAhPSAxID8gbyA/IChvLnAoZiwgaCksIGggJiAvKmxlbmd0aCovXG4gICAgICA4ICYmIFIobywgMSkpIDogKG8gPSBTdChmKSwgby5jKCksIFIobywgMSksIG8ubShlLCBpKSkgOiBvICYmICh1ZSgpLCBQKG8sIDEsIDEsICgpID0+IHtcbiAgICAgICAgbyA9IG51bGw7XG4gICAgICB9KSwgZmUoKSk7XG4gICAgICBsZXQgYyA9IHM7XG4gICAgICBzID0gXyhmKSwgcyA9PT0gYyA/IH5zICYmIHVbc10ucChmLCBoKSA6IChhICYmICh1ZSgpLCBQKHVbY10sIDEsIDEsICgpID0+IHtcbiAgICAgICAgdVtjXSA9IG51bGw7XG4gICAgICB9KSwgZmUoKSksIH5zID8gKGEgPSB1W3NdLCBhID8gYS5wKGYsIGgpIDogKGEgPSB1W3NdID0gZFtzXShmKSwgYS5jKCkpLCBSKGEsIDEpLCBhLm0oZSwgbnVsbCkpIDogYSA9IG51bGwpO1xuICAgIH0sXG4gICAgaShmKSB7XG4gICAgICBsIHx8IChSKHIpLCBSKG8pLCBSKGEpLCBsID0gITApO1xuICAgIH0sXG4gICAgbyhmKSB7XG4gICAgICBQKHIpLCBQKG8pLCBQKGEpLCBsID0gITE7XG4gICAgfSxcbiAgICBkKGYpIHtcbiAgICAgIGYgJiYgTihlKSwgciAmJiByLmQoKSwgbyAmJiBvLmQoKSwgfnMgJiYgdVtzXS5kKCk7XG4gICAgfVxuICB9O1xufVxuZnVuY3Rpb24gRGkobiwgZSwgdCkge1xuICBsZXQgeyBkYXRhOiBpIH0gPSBlLCB7IGVkaXRNb2RlOiBzIH0gPSBlLCB7IHN5czogYSB9ID0gZSwgeyBsZW5ndGg6IGwgfSA9IGUsIHsgaW5kZXg6IHIgfSA9IGUsIHsgbGF5b3V0TW9kZTogbyA9ICExIH0gPSBlO1xuICBmdW5jdGlvbiBkKCkge1xuICAgIHQoMCwgaSk7XG4gIH1cbiAgZnVuY3Rpb24gdShtKSB7XG4gICAgaSA9IG0sIHQoMCwgaSk7XG4gIH1cbiAgZnVuY3Rpb24gXyhtKSB7XG4gICAgaSA9IG0sIHQoMCwgaSk7XG4gIH1cbiAgZnVuY3Rpb24gZihtKSB7XG4gICAgbWUuY2FsbCh0aGlzLCBuLCBtKTtcbiAgfVxuICBmdW5jdGlvbiBoKG0pIHtcbiAgICBtZS5jYWxsKHRoaXMsIG4sIG0pO1xuICB9XG4gIGZ1bmN0aW9uIGMobSkge1xuICAgIGkgPSBtLCB0KDAsIGkpO1xuICB9XG4gIGZ1bmN0aW9uIHkobSkge1xuICAgIGkgPSBtLCB0KDAsIGkpO1xuICB9XG4gIGZ1bmN0aW9uIHAobSkge1xuICAgIGkgPSBtLCB0KDAsIGkpO1xuICB9XG4gIGZ1bmN0aW9uIHYobSkge1xuICAgIGkgPSBtLCB0KDAsIGkpO1xuICB9XG4gIGZ1bmN0aW9uIEMobSkge1xuICAgIGkgPSBtLCB0KDAsIGkpO1xuICB9XG4gIHJldHVybiBuLiQkc2V0ID0gKG0pID0+IHtcbiAgICBcImRhdGFcIiBpbiBtICYmIHQoMCwgaSA9IG0uZGF0YSksIFwiZWRpdE1vZGVcIiBpbiBtICYmIHQoMSwgcyA9IG0uZWRpdE1vZGUpLCBcInN5c1wiIGluIG0gJiYgdCgyLCBhID0gbS5zeXMpLCBcImxlbmd0aFwiIGluIG0gJiYgdCgzLCBsID0gbS5sZW5ndGgpLCBcImluZGV4XCIgaW4gbSAmJiB0KDQsIHIgPSBtLmluZGV4KSwgXCJsYXlvdXRNb2RlXCIgaW4gbSAmJiB0KDUsIG8gPSBtLmxheW91dE1vZGUpO1xuICB9LCBbXG4gICAgaSxcbiAgICBzLFxuICAgIGEsXG4gICAgbCxcbiAgICByLFxuICAgIG8sXG4gICAgZCxcbiAgICB1LFxuICAgIF8sXG4gICAgZixcbiAgICBoLFxuICAgIGMsXG4gICAgeSxcbiAgICBwLFxuICAgIHYsXG4gICAgQ1xuICBdO1xufVxuY2xhc3Mgb24gZXh0ZW5kcyBvZSB7XG4gIGNvbnN0cnVjdG9yKGUpIHtcbiAgICBzdXBlcigpLCBsZSh0aGlzLCBlLCBEaSwgd2ksIHRlLCB7XG4gICAgICBkYXRhOiAwLFxuICAgICAgZWRpdE1vZGU6IDEsXG4gICAgICBzeXM6IDIsXG4gICAgICBsZW5ndGg6IDMsXG4gICAgICBpbmRleDogNCxcbiAgICAgIGxheW91dE1vZGU6IDVcbiAgICB9KTtcbiAgfVxuICBnZXQgZGF0YSgpIHtcbiAgICByZXR1cm4gdGhpcy4kJC5jdHhbMF07XG4gIH1cbiAgc2V0IGRhdGEoZSkge1xuICAgIHRoaXMuJCRzZXQoeyBkYXRhOiBlIH0pLCBFKCk7XG4gIH1cbiAgZ2V0IGVkaXRNb2RlKCkge1xuICAgIHJldHVybiB0aGlzLiQkLmN0eFsxXTtcbiAgfVxuICBzZXQgZWRpdE1vZGUoZSkge1xuICAgIHRoaXMuJCRzZXQoeyBlZGl0TW9kZTogZSB9KSwgRSgpO1xuICB9XG4gIGdldCBzeXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuJCQuY3R4WzJdO1xuICB9XG4gIHNldCBzeXMoZSkge1xuICAgIHRoaXMuJCRzZXQoeyBzeXM6IGUgfSksIEUoKTtcbiAgfVxuICBnZXQgbGVuZ3RoKCkge1xuICAgIHJldHVybiB0aGlzLiQkLmN0eFszXTtcbiAgfVxuICBzZXQgbGVuZ3RoKGUpIHtcbiAgICB0aGlzLiQkc2V0KHsgbGVuZ3RoOiBlIH0pLCBFKCk7XG4gIH1cbiAgZ2V0IGluZGV4KCkge1xuICAgIHJldHVybiB0aGlzLiQkLmN0eFs0XTtcbiAgfVxuICBzZXQgaW5kZXgoZSkge1xuICAgIHRoaXMuJCRzZXQoeyBpbmRleDogZSB9KSwgRSgpO1xuICB9XG4gIGdldCBsYXlvdXRNb2RlKCkge1xuICAgIHJldHVybiB0aGlzLiQkLmN0eFs1XTtcbiAgfVxuICBzZXQgbGF5b3V0TW9kZShlKSB7XG4gICAgdGhpcy4kJHNldCh7IGxheW91dE1vZGU6IGUgfSksIEUoKTtcbiAgfVxufVxucmUob24sIHsgZGF0YToge30sIGVkaXRNb2RlOiB7fSwgc3lzOiB7fSwgbGVuZ3RoOiB7fSwgaW5kZXg6IHt9LCBsYXlvdXRNb2RlOiB7IHR5cGU6IFwiQm9vbGVhblwiIH0gfSwgW10sIFtdLCAhMCk7XG5mdW5jdGlvbiBhdChuLCBlLCB0KSB7XG4gIHJldHVybiBuLnN0eWxlLmFuaW1hdGlvbiAmJiAobi5zdHlsZSA9IG51bGwpLCBxbihuLCBlLCB0ID8/IHsgZHVyYXRpb246IDUwMCB9KTtcbn1cbmZ1bmN0aW9uIE10KG4pIHtcbiAgbGV0IGUsIHQsIGksIHMsIGEgPSAoXG4gICAgLypvbkFkZCovXG4gICAgbls0XSAmJiBPdChuKVxuICApLCBsID0gKFxuICAgIC8qb25SZW1vdmUqL1xuICAgIG5bM10gJiYgQ3QobilcbiAgKTtcbiAgcmV0dXJuIHtcbiAgICBjKCkge1xuICAgICAgZSA9ICQoXCJkaXZcIiksIGEgJiYgYS5jKCksIHQgPSBqKCksIGwgJiYgbC5jKCksIGcoZSwgXCJjbGFzc1wiLCBcIlJvd0NvbHVtbk9wdGlvbnNcIiksIGcoXG4gICAgICAgIGUsXG4gICAgICAgIFwic3R5bGVcIixcbiAgICAgICAgLypjc3NTdHlsZSovXG4gICAgICAgIG5bNV1cbiAgICAgICk7XG4gICAgfSxcbiAgICBtKHIsIG8pIHtcbiAgICAgIEIociwgZSwgbyksIGEgJiYgYS5tKGUsIG51bGwpLCBiKGUsIHQpLCBsICYmIGwubShlLCBudWxsKSwgcyA9ICEwO1xuICAgIH0sXG4gICAgcChyLCBvKSB7XG4gICAgICAvKm9uQWRkKi9cbiAgICAgIHJbNF0gPyBhID8gYS5wKHIsIG8pIDogKGEgPSBPdChyKSwgYS5jKCksIGEubShlLCB0KSkgOiBhICYmIChhLmQoMSksIGEgPSBudWxsKSwgLypvblJlbW92ZSovXG4gICAgICByWzNdID8gbCA/IGwucChyLCBvKSA6IChsID0gQ3QociksIGwuYygpLCBsLm0oZSwgbnVsbCkpIDogbCAmJiAobC5kKDEpLCBsID0gbnVsbCk7XG4gICAgfSxcbiAgICBpKHIpIHtcbiAgICAgIHMgfHwgKHIgJiYgaWUoKCkgPT4ge1xuICAgICAgICBzICYmIChpIHx8IChpID0geihlLCBhZSwge30sICEwKSksIGkucnVuKDEpKTtcbiAgICAgIH0pLCBzID0gITApO1xuICAgIH0sXG4gICAgbyhyKSB7XG4gICAgICByICYmIChpIHx8IChpID0geihlLCBhZSwge30sICExKSksIGkucnVuKDApKSwgcyA9ICExO1xuICAgIH0sXG4gICAgZChyKSB7XG4gICAgICByICYmIE4oZSksIGEgJiYgYS5kKCksIGwgJiYgbC5kKCksIHIgJiYgaSAmJiBpLmVuZCgpO1xuICAgIH1cbiAgfTtcbn1cbmZ1bmN0aW9uIE90KG4pIHtcbiAgbGV0IGUsIHQsIGksIHM7XG4gIHJldHVybiB7XG4gICAgYygpIHtcbiAgICAgIGUgPSAkKFwiZGl2XCIpLCB0ID0gRyhcbiAgICAgICAgLyphZGRUZXh0Ki9cbiAgICAgICAgblsxXVxuICAgICAgKSwgZyhlLCBcImNsYXNzXCIsIFwiaXRlbU9wdGlvblwiKTtcbiAgICB9LFxuICAgIG0oYSwgbCkge1xuICAgICAgQihhLCBlLCBsKSwgYihlLCB0KSwgaSB8fCAocyA9IFtcbiAgICAgICAgVShcbiAgICAgICAgICBlLFxuICAgICAgICAgIFwia2V5dXBcIixcbiAgICAgICAgICAvKmtleXVwX2hhbmRsZXIqL1xuICAgICAgICAgIG5bMTBdXG4gICAgICAgICksXG4gICAgICAgIFUoXG4gICAgICAgICAgZSxcbiAgICAgICAgICBcImNsaWNrXCIsXG4gICAgICAgICAgLypjbGlja19oYW5kbGVyKi9cbiAgICAgICAgICBuWzExXVxuICAgICAgICApXG4gICAgICBdLCBpID0gITApO1xuICAgIH0sXG4gICAgcChhLCBsKSB7XG4gICAgICBsICYgLyphZGRUZXh0Ki9cbiAgICAgIDIgJiYgZGUoXG4gICAgICAgIHQsXG4gICAgICAgIC8qYWRkVGV4dCovXG4gICAgICAgIGFbMV1cbiAgICAgICk7XG4gICAgfSxcbiAgICBkKGEpIHtcbiAgICAgIGEgJiYgTihlKSwgaSA9ICExLCBZKHMpO1xuICAgIH1cbiAgfTtcbn1cbmZ1bmN0aW9uIEN0KG4pIHtcbiAgbGV0IGUsIHQsIGksIHM7XG4gIHJldHVybiB7XG4gICAgYygpIHtcbiAgICAgIGUgPSAkKFwiZGl2XCIpLCB0ID0gRyhcbiAgICAgICAgLypyZW1UZXh0Ki9cbiAgICAgICAgblsyXVxuICAgICAgKSwgZyhlLCBcImNsYXNzXCIsIFwiaXRlbU9wdGlvbiByZW1cIik7XG4gICAgfSxcbiAgICBtKGEsIGwpIHtcbiAgICAgIEIoYSwgZSwgbCksIGIoZSwgdCksIGkgfHwgKHMgPSBbXG4gICAgICAgIFUoXG4gICAgICAgICAgZSxcbiAgICAgICAgICBcImtleXVwXCIsXG4gICAgICAgICAgLyprZXl1cF9oYW5kbGVyXzEqL1xuICAgICAgICAgIG5bOV1cbiAgICAgICAgKSxcbiAgICAgICAgVShcbiAgICAgICAgICBlLFxuICAgICAgICAgIFwiY2xpY2tcIixcbiAgICAgICAgICAvKmNsaWNrX2hhbmRsZXJfMSovXG4gICAgICAgICAgblsxMl1cbiAgICAgICAgKVxuICAgICAgXSwgaSA9ICEwKTtcbiAgICB9LFxuICAgIHAoYSwgbCkge1xuICAgICAgbCAmIC8qcmVtVGV4dCovXG4gICAgICA0ICYmIGRlKFxuICAgICAgICB0LFxuICAgICAgICAvKnJlbVRleHQqL1xuICAgICAgICBhWzJdXG4gICAgICApO1xuICAgIH0sXG4gICAgZChhKSB7XG4gICAgICBhICYmIE4oZSksIGkgPSAhMSwgWShzKTtcbiAgICB9XG4gIH07XG59XG5mdW5jdGlvbiBraShuKSB7XG4gIGxldCBlLCB0ID0gKFxuICAgIC8qYWN0aXZlKi9cbiAgICBuWzBdICYmIE10KG4pXG4gICk7XG4gIHJldHVybiB7XG4gICAgYygpIHtcbiAgICAgIHQgJiYgdC5jKCksIGUgPSBTbigpO1xuICAgIH0sXG4gICAgbShpLCBzKSB7XG4gICAgICB0ICYmIHQubShpLCBzKSwgQihpLCBlLCBzKTtcbiAgICB9LFxuICAgIHAoaSwgW3NdKSB7XG4gICAgICAvKmFjdGl2ZSovXG4gICAgICBpWzBdID8gdCA/ICh0LnAoaSwgcyksIHMgJiAvKmFjdGl2ZSovXG4gICAgICAxICYmIFIodCwgMSkpIDogKHQgPSBNdChpKSwgdC5jKCksIFIodCwgMSksIHQubShlLnBhcmVudE5vZGUsIGUpKSA6IHQgJiYgKHVlKCksIFAodCwgMSwgMSwgKCkgPT4ge1xuICAgICAgICB0ID0gbnVsbDtcbiAgICAgIH0pLCBmZSgpKTtcbiAgICB9LFxuICAgIGkoaSkge1xuICAgICAgUih0KTtcbiAgICB9LFxuICAgIG8oaSkge1xuICAgICAgUCh0KTtcbiAgICB9LFxuICAgIGQoaSkge1xuICAgICAgaSAmJiBOKGUpLCB0ICYmIHQuZChpKTtcbiAgICB9XG4gIH07XG59XG5mdW5jdGlvbiBJaShuLCBlLCB0KSB7XG4gIGxldCB7IGFjdGl2ZTogaSB9ID0gZSwgeyBhZGRUZXh0OiBzID0gXCJBZGQgSXRlbVwiIH0gPSBlLCB7IHJlbVRleHQ6IGEgPSBcIlJlbW92ZSBUaGlzIEl0ZW1cIiB9ID0gZSwgeyBvZmZzZXQ6IGwgPSAwIH0gPSBlLCB7IHNpZGU6IHIgPSBcImxlZnRcIiB9ID0gZSwgeyB2ZXJ0aTogbyA9IFwiYm90dG9tXCIgfSA9IGUsIHsgb25SZW1vdmU6IGQgPSBudWxsIH0gPSBlLCB7IG9uQWRkOiB1ID0gbnVsbCB9ID0gZSwgXyA9IHIgKyBcIjpcIiArIGwgKyBcIjtcIiArIG8gKyBcIjpcIiArIGwgKyBcIjtcIjtcbiAgZnVuY3Rpb24gZihwKSB7XG4gICAgbWUuY2FsbCh0aGlzLCBuLCBwKTtcbiAgfVxuICBmdW5jdGlvbiBoKHApIHtcbiAgICBtZS5jYWxsKHRoaXMsIG4sIHApO1xuICB9XG4gIGNvbnN0IGMgPSAoKSA9PiB1KCksIHkgPSAoKSA9PiBkKCk7XG4gIHJldHVybiBuLiQkc2V0ID0gKHApID0+IHtcbiAgICBcImFjdGl2ZVwiIGluIHAgJiYgdCgwLCBpID0gcC5hY3RpdmUpLCBcImFkZFRleHRcIiBpbiBwICYmIHQoMSwgcyA9IHAuYWRkVGV4dCksIFwicmVtVGV4dFwiIGluIHAgJiYgdCgyLCBhID0gcC5yZW1UZXh0KSwgXCJvZmZzZXRcIiBpbiBwICYmIHQoNiwgbCA9IHAub2Zmc2V0KSwgXCJzaWRlXCIgaW4gcCAmJiB0KDcsIHIgPSBwLnNpZGUpLCBcInZlcnRpXCIgaW4gcCAmJiB0KDgsIG8gPSBwLnZlcnRpKSwgXCJvblJlbW92ZVwiIGluIHAgJiYgdCgzLCBkID0gcC5vblJlbW92ZSksIFwib25BZGRcIiBpbiBwICYmIHQoNCwgdSA9IHAub25BZGQpO1xuICB9LCBbXG4gICAgaSxcbiAgICBzLFxuICAgIGEsXG4gICAgZCxcbiAgICB1LFxuICAgIF8sXG4gICAgbCxcbiAgICByLFxuICAgIG8sXG4gICAgZixcbiAgICBoLFxuICAgIGMsXG4gICAgeVxuICBdO1xufVxuY2xhc3MgcGUgZXh0ZW5kcyBvZSB7XG4gIGNvbnN0cnVjdG9yKGUpIHtcbiAgICBzdXBlcigpLCBsZSh0aGlzLCBlLCBJaSwga2ksIHRlLCB7XG4gICAgICBhY3RpdmU6IDAsXG4gICAgICBhZGRUZXh0OiAxLFxuICAgICAgcmVtVGV4dDogMixcbiAgICAgIG9mZnNldDogNixcbiAgICAgIHNpZGU6IDcsXG4gICAgICB2ZXJ0aTogOCxcbiAgICAgIG9uUmVtb3ZlOiAzLFxuICAgICAgb25BZGQ6IDRcbiAgICB9KTtcbiAgfVxuICBnZXQgYWN0aXZlKCkge1xuICAgIHJldHVybiB0aGlzLiQkLmN0eFswXTtcbiAgfVxuICBzZXQgYWN0aXZlKGUpIHtcbiAgICB0aGlzLiQkc2V0KHsgYWN0aXZlOiBlIH0pLCBFKCk7XG4gIH1cbiAgZ2V0IGFkZFRleHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuJCQuY3R4WzFdO1xuICB9XG4gIHNldCBhZGRUZXh0KGUpIHtcbiAgICB0aGlzLiQkc2V0KHsgYWRkVGV4dDogZSB9KSwgRSgpO1xuICB9XG4gIGdldCByZW1UZXh0KCkge1xuICAgIHJldHVybiB0aGlzLiQkLmN0eFsyXTtcbiAgfVxuICBzZXQgcmVtVGV4dChlKSB7XG4gICAgdGhpcy4kJHNldCh7IHJlbVRleHQ6IGUgfSksIEUoKTtcbiAgfVxuICBnZXQgb2Zmc2V0KCkge1xuICAgIHJldHVybiB0aGlzLiQkLmN0eFs2XTtcbiAgfVxuICBzZXQgb2Zmc2V0KGUpIHtcbiAgICB0aGlzLiQkc2V0KHsgb2Zmc2V0OiBlIH0pLCBFKCk7XG4gIH1cbiAgZ2V0IHNpZGUoKSB7XG4gICAgcmV0dXJuIHRoaXMuJCQuY3R4WzddO1xuICB9XG4gIHNldCBzaWRlKGUpIHtcbiAgICB0aGlzLiQkc2V0KHsgc2lkZTogZSB9KSwgRSgpO1xuICB9XG4gIGdldCB2ZXJ0aSgpIHtcbiAgICByZXR1cm4gdGhpcy4kJC5jdHhbOF07XG4gIH1cbiAgc2V0IHZlcnRpKGUpIHtcbiAgICB0aGlzLiQkc2V0KHsgdmVydGk6IGUgfSksIEUoKTtcbiAgfVxuICBnZXQgb25SZW1vdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuJCQuY3R4WzNdO1xuICB9XG4gIHNldCBvblJlbW92ZShlKSB7XG4gICAgdGhpcy4kJHNldCh7IG9uUmVtb3ZlOiBlIH0pLCBFKCk7XG4gIH1cbiAgZ2V0IG9uQWRkKCkge1xuICAgIHJldHVybiB0aGlzLiQkLmN0eFs0XTtcbiAgfVxuICBzZXQgb25BZGQoZSkge1xuICAgIHRoaXMuJCRzZXQoeyBvbkFkZDogZSB9KSwgRSgpO1xuICB9XG59XG5yZShwZSwgeyBhY3RpdmU6IHt9LCBhZGRUZXh0OiB7fSwgcmVtVGV4dDoge30sIG9mZnNldDoge30sIHNpZGU6IHt9LCB2ZXJ0aToge30sIG9uUmVtb3ZlOiB7fSwgb25BZGQ6IHt9IH0sIFtdLCBbXSwgITApO1xuZnVuY3Rpb24gTHQobiwgZSwgdCkge1xuICBjb25zdCBpID0gbi5zbGljZSgpO1xuICByZXR1cm4gaVs0M10gPSBlW3RdLCBpWzQ1XSA9IHQsIGk7XG59XG5mdW5jdGlvbiBFdChuLCBlLCB0KSB7XG4gIGNvbnN0IGkgPSBuLnNsaWNlKCk7XG4gIHJldHVybiBpWzQ2XSA9IGVbdF0sIGlbNDhdID0gdCwgaTtcbn1cbmZ1bmN0aW9uIEF0KG4sIGUsIHQpIHtcbiAgY29uc3QgaSA9IG4uc2xpY2UoKTtcbiAgcmV0dXJuIGlbNDldID0gZVt0XSwgaVs1MV0gPSB0LCBpO1xufVxuZnVuY3Rpb24gUnQobikge1xuICBsZXQgZSwgdDtcbiAgZnVuY3Rpb24gaSgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgLypmdW5jXzIqL1xuICAgICAgblsyMl0oXG4gICAgICAgIC8qcm93Ki9cbiAgICAgICAgbls0M10sXG4gICAgICAgIC8qY29sdW1uKi9cbiAgICAgICAgbls0Nl1cbiAgICAgIClcbiAgICApO1xuICB9XG4gIHJldHVybiBlID0gbmV3IHBlKHtcbiAgICBwcm9wczoge1xuICAgICAgb2Zmc2V0OiAxNSxcbiAgICAgIGFjdGl2ZTogKFxuICAgICAgICAvKiRlZGl0TGF5b3V0XzAyKi9cbiAgICAgICAgblszXVxuICAgICAgKSxcbiAgICAgIHJlbVRleHQ6IFwicmVtb3ZlIHRoaXMgY29sdW1uXCIsXG4gICAgICBvblJlbW92ZTogaVxuICAgIH1cbiAgfSksIHtcbiAgICBjKCkge1xuICAgICAgWChlLiQkLmZyYWdtZW50KTtcbiAgICB9LFxuICAgIG0ocywgYSkge1xuICAgICAgVyhlLCBzLCBhKSwgdCA9ICEwO1xuICAgIH0sXG4gICAgcChzLCBhKSB7XG4gICAgICBuID0gcztcbiAgICAgIGNvbnN0IGwgPSB7fTtcbiAgICAgIGFbMF0gJiAvKiRlZGl0TGF5b3V0XzAyKi9cbiAgICAgIDggJiYgKGwuYWN0aXZlID0gLyokZWRpdExheW91dF8wMiovXG4gICAgICBuWzNdKSwgYVswXSAmIC8qJE9CSiovXG4gICAgICAzMiAmJiAobC5vblJlbW92ZSA9IGkpLCBlLiRzZXQobCk7XG4gICAgfSxcbiAgICBpKHMpIHtcbiAgICAgIHQgfHwgKFIoZS4kJC5mcmFnbWVudCwgcyksIHQgPSAhMCk7XG4gICAgfSxcbiAgICBvKHMpIHtcbiAgICAgIFAoZS4kJC5mcmFnbWVudCwgcyksIHQgPSAhMTtcbiAgICB9LFxuICAgIGQocykge1xuICAgICAgUShlLCBzKTtcbiAgICB9XG4gIH07XG59XG5mdW5jdGlvbiBOdChuKSB7XG4gIGxldCBlO1xuICByZXR1cm4ge1xuICAgIGMoKSB7XG4gICAgICBlID0gJChcImRpdlwiKSwgZS5pbm5lckhUTUwgPSBcIlwiLCBZdChlLCBcImhlaWdodFwiLCBcIjUwcHhcIik7XG4gICAgfSxcbiAgICBtKHQsIGkpIHtcbiAgICAgIEIodCwgZSwgaSk7XG4gICAgfSxcbiAgICBkKHQpIHtcbiAgICAgIHQgJiYgTihlKTtcbiAgICB9XG4gIH07XG59XG5mdW5jdGlvbiBCdChuLCBlKSB7XG4gIGxldCB0LCBpLCBzLCBhLCBsLCByLCBvLCBkLCB1LCBfID0gSywgZiwgaCwgYztcbiAgZnVuY3Rpb24geSgpIHtcbiAgICByZXR1cm4gKFxuICAgICAgLypmdW5jXzQqL1xuICAgICAgZVsyNF0oXG4gICAgICAgIC8qY29sdW1uKi9cbiAgICAgICAgZVs0Nl0sXG4gICAgICAgIC8qaXRlbSovXG4gICAgICAgIGVbNDldXG4gICAgICApXG4gICAgKTtcbiAgfVxuICBpID0gbmV3IHBlKHtcbiAgICBwcm9wczoge1xuICAgICAgb2Zmc2V0OiAxNSxcbiAgICAgIGFjdGl2ZTogKFxuICAgICAgICAvKiRlZGl0TGF5b3V0XzAzKi9cbiAgICAgICAgZVs0XVxuICAgICAgKSxcbiAgICAgIGFkZFRleHQ6IFwicmVtb3ZlXCIsXG4gICAgICBvblJlbW92ZTogeVxuICAgIH1cbiAgfSksIGEgPSBuZXcgb24oe1xuICAgIHByb3BzOiB7XG4gICAgICBkYXRhOiAoXG4gICAgICAgIC8qaXRlbSovXG4gICAgICAgIGVbNDldXG4gICAgICApLFxuICAgICAgZWRpdE1vZGU6IChcbiAgICAgICAgLyokZWRpdE1vZGUqL1xuICAgICAgICBlWzFdXG4gICAgICApLFxuICAgICAgbGF5b3V0TW9kZTogKFxuICAgICAgICAvKiRlZGl0TGF5b3V0XzAzKi9cbiAgICAgICAgZVs0XVxuICAgICAgKSxcbiAgICAgIHN5czogKFxuICAgICAgICAvKnN5cyovXG4gICAgICAgIGVbMF1cbiAgICAgICksXG4gICAgICBsZW5ndGg6IChcbiAgICAgICAgLypjb2x1bW4qL1xuICAgICAgICBlWzQ2XS5kYXRhLmxlbmd0aFxuICAgICAgKSxcbiAgICAgIGluZGV4OiAoXG4gICAgICAgIC8qayovXG4gICAgICAgIGVbNTFdXG4gICAgICApXG4gICAgfVxuICB9KSwgYS4kb24oXG4gICAgXCJtb3ZlVXBcIixcbiAgICAvKm1vdmVVcF9oYW5kbGVyKi9cbiAgICBlWzI1XVxuICApLCBhLiRvbihcbiAgICBcIm1vdmVEb3duXCIsXG4gICAgLyptb3ZlRG93bl9oYW5kbGVyKi9cbiAgICBlWzI2XVxuICApO1xuICBmdW5jdGlvbiBwKC4uLlMpIHtcbiAgICByZXR1cm4gKFxuICAgICAgLypkcmFnc3RhcnRfaGFuZGxlciovXG4gICAgICBlWzI3XShcbiAgICAgICAgLyppdGVtKi9cbiAgICAgICAgZVs0OV0sXG4gICAgICAgIC4uLlNcbiAgICAgIClcbiAgICApO1xuICB9XG4gIGZ1bmN0aW9uIHYoLi4uUykge1xuICAgIHJldHVybiAoXG4gICAgICAvKmRyYWdlbmRfaGFuZGxlciovXG4gICAgICBlWzI4XShcbiAgICAgICAgLyppdGVtKi9cbiAgICAgICAgZVs0OV0sXG4gICAgICAgIC4uLlNcbiAgICAgIClcbiAgICApO1xuICB9XG4gIGZ1bmN0aW9uIEMoLi4uUykge1xuICAgIHJldHVybiAoXG4gICAgICAvKmRyb3BfaGFuZGxlciovXG4gICAgICBlWzI5XShcbiAgICAgICAgLyppdGVtKi9cbiAgICAgICAgZVs0OV0sXG4gICAgICAgIC4uLlNcbiAgICAgIClcbiAgICApO1xuICB9XG4gIGZ1bmN0aW9uIG0oLi4uUykge1xuICAgIHJldHVybiAoXG4gICAgICAvKmRyYWdsZWF2ZV9oYW5kbGVyKi9cbiAgICAgIGVbMzBdKFxuICAgICAgICAvKml0ZW0qL1xuICAgICAgICBlWzQ5XSxcbiAgICAgICAgLi4uU1xuICAgICAgKVxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBrZXk6IG4sXG4gICAgZmlyc3Q6IG51bGwsXG4gICAgYygpIHtcbiAgICAgIHQgPSAkKFwiZGl2XCIpLCBYKGkuJCQuZnJhZ21lbnQpLCBzID0gaigpLCBYKGEuJCQuZnJhZ21lbnQpLCBnKHQsIFwiY2xhc3NcIiwgXCJJdGVtXCIpLCBnKHQsIFwiZGF0YS1lZGl0XCIsIGwgPSAvKiRlZGl0TW9kZSovXG4gICAgICBlWzFdIHx8IC8qJGVkaXRMYXlvdXRfMDMqL1xuICAgICAgZVs0XSB8fCAvKiRlZGl0TGF5b3V0XzAyKi9cbiAgICAgIGVbM10pLCBnKHQsIFwiZGF0YS1pdGVtaWRcIiwgciA9IC8qaXRlbSovXG4gICAgICBlWzQ5XS5pZCksIGcoXG4gICAgICAgIHQsXG4gICAgICAgIFwiZGF0YS1lZGl0LWFjdGl2ZVwiLFxuICAgICAgICAvKiRlZGl0TGF5b3V0XzAzKi9cbiAgICAgICAgZVs0XVxuICAgICAgKSwgZyh0LCBcImRhdGEtZHJhZ2dpbmdcIiwgbyA9IC8qRHJhZ0l0ZW1IYW5kbGVyKi9cbiAgICAgIGVbMTRdLmlzQmVpbmdEcmFnZ2VkKFxuICAgICAgICAvKml0ZW0qL1xuICAgICAgICBlWzQ5XS5pZFxuICAgICAgKSksIGcoXG4gICAgICAgIHQsXG4gICAgICAgIFwiZHJhZ2dhYmxlXCIsXG4gICAgICAgIC8qJGVkaXRMYXlvdXRfMDMqL1xuICAgICAgICBlWzRdXG4gICAgICApLCB0aGlzLmZpcnN0ID0gdDtcbiAgICB9LFxuICAgIG0oUywgRCkge1xuICAgICAgQihTLCB0LCBEKSwgVyhpLCB0LCBudWxsKSwgYih0LCBzKSwgVyhhLCB0LCBudWxsKSwgZiA9ICEwLCBoIHx8IChjID0gW1xuICAgICAgICBVKHQsIFwiZHJhZ3N0YXJ0XCIsIHApLFxuICAgICAgICBVKHQsIFwiZHJhZ2VuZFwiLCB2KSxcbiAgICAgICAgVSh0LCBcImRyb3BcIiwgQyksXG4gICAgICAgIFUodCwgXCJkcmFnbGVhdmVcIiwgbSksXG4gICAgICAgIFUodCwgXCJkcmFnb3ZlclwiLCBFaSlcbiAgICAgIF0sIGggPSAhMCk7XG4gICAgfSxcbiAgICBwKFMsIEQpIHtcbiAgICAgIGUgPSBTO1xuICAgICAgY29uc3QgQSA9IHt9O1xuICAgICAgRFswXSAmIC8qJGVkaXRMYXlvdXRfMDMqL1xuICAgICAgMTYgJiYgKEEuYWN0aXZlID0gLyokZWRpdExheW91dF8wMyovXG4gICAgICBlWzRdKSwgRFswXSAmIC8qJE9CSiovXG4gICAgICAzMiAmJiAoQS5vblJlbW92ZSA9IHkpLCBpLiRzZXQoQSk7XG4gICAgICBjb25zdCBIID0ge307XG4gICAgICBEWzBdICYgLyokT0JKKi9cbiAgICAgIDMyICYmIChILmRhdGEgPSAvKml0ZW0qL1xuICAgICAgZVs0OV0pLCBEWzBdICYgLyokZWRpdE1vZGUqL1xuICAgICAgMiAmJiAoSC5lZGl0TW9kZSA9IC8qJGVkaXRNb2RlKi9cbiAgICAgIGVbMV0pLCBEWzBdICYgLyokZWRpdExheW91dF8wMyovXG4gICAgICAxNiAmJiAoSC5sYXlvdXRNb2RlID0gLyokZWRpdExheW91dF8wMyovXG4gICAgICBlWzRdKSwgRFswXSAmIC8qc3lzKi9cbiAgICAgIDEgJiYgKEguc3lzID0gLypzeXMqL1xuICAgICAgZVswXSksIERbMF0gJiAvKiRPQkoqL1xuICAgICAgMzIgJiYgKEgubGVuZ3RoID0gLypjb2x1bW4qL1xuICAgICAgZVs0Nl0uZGF0YS5sZW5ndGgpLCBEWzBdICYgLyokT0JKKi9cbiAgICAgIDMyICYmIChILmluZGV4ID0gLyprKi9cbiAgICAgIGVbNTFdKSwgYS4kc2V0KEgpLCAoIWYgfHwgRFswXSAmIC8qJGVkaXRNb2RlLCAkZWRpdExheW91dF8wMywgJGVkaXRMYXlvdXRfMDIqL1xuICAgICAgMjYgJiYgbCAhPT0gKGwgPSAvKiRlZGl0TW9kZSovXG4gICAgICBlWzFdIHx8IC8qJGVkaXRMYXlvdXRfMDMqL1xuICAgICAgZVs0XSB8fCAvKiRlZGl0TGF5b3V0XzAyKi9cbiAgICAgIGVbM10pKSAmJiBnKHQsIFwiZGF0YS1lZGl0XCIsIGwpLCAoIWYgfHwgRFswXSAmIC8qJE9CSiovXG4gICAgICAzMiAmJiByICE9PSAociA9IC8qaXRlbSovXG4gICAgICBlWzQ5XS5pZCkpICYmIGcodCwgXCJkYXRhLWl0ZW1pZFwiLCByKSwgKCFmIHx8IERbMF0gJiAvKiRlZGl0TGF5b3V0XzAzKi9cbiAgICAgIDE2KSAmJiBnKFxuICAgICAgICB0LFxuICAgICAgICBcImRhdGEtZWRpdC1hY3RpdmVcIixcbiAgICAgICAgLyokZWRpdExheW91dF8wMyovXG4gICAgICAgIGVbNF1cbiAgICAgICksICghZiB8fCBEWzBdICYgLyokT0JKKi9cbiAgICAgIDMyICYmIG8gIT09IChvID0gLypEcmFnSXRlbUhhbmRsZXIqL1xuICAgICAgZVsxNF0uaXNCZWluZ0RyYWdnZWQoXG4gICAgICAgIC8qaXRlbSovXG4gICAgICAgIGVbNDldLmlkXG4gICAgICApKSkgJiYgZyh0LCBcImRhdGEtZHJhZ2dpbmdcIiwgbyksICghZiB8fCBEWzBdICYgLyokZWRpdExheW91dF8wMyovXG4gICAgICAxNikgJiYgZyhcbiAgICAgICAgdCxcbiAgICAgICAgXCJkcmFnZ2FibGVcIixcbiAgICAgICAgLyokZWRpdExheW91dF8wMyovXG4gICAgICAgIGVbNF1cbiAgICAgICk7XG4gICAgfSxcbiAgICByKCkge1xuICAgICAgdSA9IHQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgfSxcbiAgICBmKCkge1xuICAgICAgZXQodCksIF8oKSwgamUodCwgdSk7XG4gICAgfSxcbiAgICBhKCkge1xuICAgICAgXygpLCBfID0geGUodCwgdSwgYXQsIHsgZHVyYXRpb246IGhlIH0pO1xuICAgIH0sXG4gICAgaShTKSB7XG4gICAgICBmIHx8IChSKGkuJCQuZnJhZ21lbnQsIFMpLCBSKGEuJCQuZnJhZ21lbnQsIFMpLCBTICYmIGllKCgpID0+IHtcbiAgICAgICAgZiAmJiAoZCB8fCAoZCA9IHoodCwgVGUsIHsgZHVyYXRpb246IGhlIH0sICEwKSksIGQucnVuKDEpKTtcbiAgICAgIH0pLCBmID0gITApO1xuICAgIH0sXG4gICAgbyhTKSB7XG4gICAgICBQKGkuJCQuZnJhZ21lbnQsIFMpLCBQKGEuJCQuZnJhZ21lbnQsIFMpLCBTICYmIChkIHx8IChkID0geih0LCBUZSwgeyBkdXJhdGlvbjogaGUgfSwgITEpKSwgZC5ydW4oMCkpLCBmID0gITE7XG4gICAgfSxcbiAgICBkKFMpIHtcbiAgICAgIFMgJiYgTih0KSwgUShpKSwgUShhKSwgUyAmJiBkICYmIGQuZW5kKCksIGggPSAhMSwgWShjKTtcbiAgICB9XG4gIH07XG59XG5mdW5jdGlvbiBWdChuLCBlKSB7XG4gIGxldCB0LCBpLCBzLCBhLCBsLCByID0gW10sIG8gPSAvKiBAX19QVVJFX18gKi8gbmV3IE1hcCgpLCBkLCB1LCBfLCBmLCBoLCBjLCB5ID0gSywgcCwgdiwgQywgbSA9IChcbiAgICAvKnJvdyovXG4gICAgZVs0M10uZGF0YS5sZW5ndGggPiAxICYmIFJ0KGUpXG4gICk7XG4gIGZ1bmN0aW9uIFMoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIC8qZnVuY18zKi9cbiAgICAgIGVbMjNdKFxuICAgICAgICAvKmNvbHVtbiovXG4gICAgICAgIGVbNDZdXG4gICAgICApXG4gICAgKTtcbiAgfVxuICBzID0gbmV3IHBlKHtcbiAgICBwcm9wczoge1xuICAgICAgb2Zmc2V0OiAxNSxcbiAgICAgIGFjdGl2ZTogKFxuICAgICAgICAvKiRlZGl0TGF5b3V0XzAzKi9cbiAgICAgICAgZVs0XVxuICAgICAgKSxcbiAgICAgIGFkZFRleHQ6IFwiYWRkIGEgbmV3IEl0ZW1cIixcbiAgICAgIG9uQWRkOiBTXG4gICAgfVxuICB9KTtcbiAgbGV0IEQgPSAoXG4gICAgLyokZWRpdExheW91dF8wMyovXG4gICAgKGVbNF0gfHwgLyokZWRpdExheW91dF8wMiovXG4gICAgZVszXSkgJiYgTnQoKVxuICApLCBBID0gc2UoXG4gICAgLypjb2x1bW4qL1xuICAgIGVbNDZdLmRhdGFcbiAgKTtcbiAgY29uc3QgSCA9IChPKSA9PiAoXG4gICAgLyppdGVtKi9cbiAgICBPWzQ5XS5pZFxuICApO1xuICBmb3IgKGxldCBPID0gMDsgTyA8IEEubGVuZ3RoOyBPICs9IDEpIHtcbiAgICBsZXQgayA9IEF0KGUsIEEsIE8pLCBUID0gSChrKTtcbiAgICBvLnNldChULCByW09dID0gQnQoVCwgaykpO1xuICB9XG4gIGZ1bmN0aW9uIEooLi4uTykge1xuICAgIHJldHVybiAoXG4gICAgICAvKmRyYWdzdGFydF9oYW5kbGVyXzEqL1xuICAgICAgZVszMV0oXG4gICAgICAgIC8qY29sdW1uKi9cbiAgICAgICAgZVs0Nl0sXG4gICAgICAgIC4uLk9cbiAgICAgIClcbiAgICApO1xuICB9XG4gIGZ1bmN0aW9uIE0oLi4uTykge1xuICAgIHJldHVybiAoXG4gICAgICAvKmRyYWdlbnRlcl9oYW5kbGVyKi9cbiAgICAgIGVbMzJdKFxuICAgICAgICAvKmNvbHVtbiovXG4gICAgICAgIGVbNDZdLFxuICAgICAgICAuLi5PXG4gICAgICApXG4gICAgKTtcbiAgfVxuICBmdW5jdGlvbiB3KC4uLk8pIHtcbiAgICByZXR1cm4gKFxuICAgICAgLypkcmFnZW5kX2hhbmRsZXJfMSovXG4gICAgICBlWzMzXShcbiAgICAgICAgLypjb2x1bW4qL1xuICAgICAgICBlWzQ2XSxcbiAgICAgICAgLi4uT1xuICAgICAgKVxuICAgICk7XG4gIH1cbiAgZnVuY3Rpb24gRiguLi5PKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIC8qZHJvcF9oYW5kbGVyXzEqL1xuICAgICAgZVszNF0oXG4gICAgICAgIC8qY29sdW1uKi9cbiAgICAgICAgZVs0Nl0sXG4gICAgICAgIC4uLk9cbiAgICAgIClcbiAgICApO1xuICB9XG4gIGZ1bmN0aW9uIFooLi4uTykge1xuICAgIHJldHVybiAoXG4gICAgICAvKmRyYWdsZWF2ZV9oYW5kbGVyXzEqL1xuICAgICAgZVszNV0oXG4gICAgICAgIC8qY29sdW1uKi9cbiAgICAgICAgZVs0Nl0sXG4gICAgICAgIC4uLk9cbiAgICAgIClcbiAgICApO1xuICB9XG4gIGZ1bmN0aW9uIHgoLi4uTykge1xuICAgIHJldHVybiAoXG4gICAgICAvKmRyYWdvdmVyX2hhbmRsZXJfMSovXG4gICAgICBlWzM2XShcbiAgICAgICAgLypjb2x1bW4qL1xuICAgICAgICBlWzQ2XSxcbiAgICAgICAgLi4uT1xuICAgICAgKVxuICAgICk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBrZXk6IG4sXG4gICAgZmlyc3Q6IG51bGwsXG4gICAgYygpIHtcbiAgICAgIHQgPSAkKFwiZGl2XCIpLCBtICYmIG0uYygpLCBpID0gaigpLCBYKHMuJCQuZnJhZ21lbnQpLCBhID0gaigpLCBEICYmIEQuYygpLCBsID0gaigpO1xuICAgICAgZm9yIChsZXQgTyA9IDA7IE8gPCByLmxlbmd0aDsgTyArPSAxKVxuICAgICAgICByW09dLmMoKTtcbiAgICAgIGcodCwgXCJjbGFzc1wiLCBcIkNvbHVtblwiKSwgZyh0LCBcImRhdGEtZWRpdFwiLCBkID0gLyokZWRpdExheW91dF8wMiovXG4gICAgICBlWzNdIHx8IC8qJGVkaXRMYXlvdXRfMDEqL1xuICAgICAgZVsyXSksIGcoXG4gICAgICAgIHQsXG4gICAgICAgIFwiZGF0YS1lZGl0cHJldmlld1wiLFxuICAgICAgICAvKiRlZGl0TGF5b3V0XzAzKi9cbiAgICAgICAgZVs0XVxuICAgICAgKSwgZyh0LCBcImRhdGEtaXRlbWlkXCIsIHUgPSAvKmNvbHVtbiovXG4gICAgICBlWzQ2XS5pZCksIGcoXG4gICAgICAgIHQsXG4gICAgICAgIFwiZGF0YS1lZGl0LWFjdGl2ZVwiLFxuICAgICAgICAvKiRlZGl0TGF5b3V0XzAyKi9cbiAgICAgICAgZVszXVxuICAgICAgKSwgZyh0LCBcImRhdGEtZHJhZ2dpbmdcIiwgXyA9IC8qRHJhZ0NvbHVtbkhhbmRsZXIqL1xuICAgICAgZVsxM10uaXNCZWluZ0RyYWdnZWQoXG4gICAgICAgIC8qY29sdW1uKi9cbiAgICAgICAgZVs0Nl0uaWRcbiAgICAgICkpLCBnKHQsIFwic3R5bGVcIiwgZiA9IGBcblx0XHRcdFx0XHRcdCR7LyokZWRpdExheW91dF8wMiovXG4gICAgICBlWzNdIHx8IC8qJGVkaXRMYXlvdXRfMDEqL1xuICAgICAgZVsyXSA/IFwibWFyZ2luLWJvdHRvbTo2MHB4XCIgOiBcIlwifVxuXHRcdFx0XHRcdGApLCBnKFxuICAgICAgICB0LFxuICAgICAgICBcImRyYWdnYWJsZVwiLFxuICAgICAgICAvKiRlZGl0TGF5b3V0XzAyKi9cbiAgICAgICAgZVszXVxuICAgICAgKSwgdGhpcy5maXJzdCA9IHQ7XG4gICAgfSxcbiAgICBtKE8sIGspIHtcbiAgICAgIEIoTywgdCwgayksIG0gJiYgbS5tKHQsIG51bGwpLCBiKHQsIGkpLCBXKHMsIHQsIG51bGwpLCBiKHQsIGEpLCBEICYmIEQubSh0LCBudWxsKSwgYih0LCBsKTtcbiAgICAgIGZvciAobGV0IFQgPSAwOyBUIDwgci5sZW5ndGg7IFQgKz0gMSlcbiAgICAgICAgcltUXSAmJiByW1RdLm0odCwgbnVsbCk7XG4gICAgICBwID0gITAsIHYgfHwgKEMgPSBbXG4gICAgICAgIFUodCwgXCJkcmFnc3RhcnRcIiwgSiksXG4gICAgICAgIFUodCwgXCJkcmFnZW50ZXJcIiwgTSksXG4gICAgICAgIFUodCwgXCJkcmFnZW5kXCIsIHcpLFxuICAgICAgICBVKHQsIFwiZHJvcFwiLCBGKSxcbiAgICAgICAgVSh0LCBcImRyYWdsZWF2ZVwiLCBaKSxcbiAgICAgICAgVSh0LCBcImRyYWdvdmVyXCIsIHgpXG4gICAgICBdLCB2ID0gITApO1xuICAgIH0sXG4gICAgcChPLCBrKSB7XG4gICAgICBlID0gTywgLypyb3cqL1xuICAgICAgZVs0M10uZGF0YS5sZW5ndGggPiAxID8gbSA/IChtLnAoZSwgayksIGtbMF0gJiAvKiRPQkoqL1xuICAgICAgMzIgJiYgUihtLCAxKSkgOiAobSA9IFJ0KGUpLCBtLmMoKSwgUihtLCAxKSwgbS5tKHQsIGkpKSA6IG0gJiYgKHVlKCksIFAobSwgMSwgMSwgKCkgPT4ge1xuICAgICAgICBtID0gbnVsbDtcbiAgICAgIH0pLCBmZSgpKTtcbiAgICAgIGNvbnN0IFQgPSB7fTtcbiAgICAgIGlmIChrWzBdICYgLyokZWRpdExheW91dF8wMyovXG4gICAgICAxNiAmJiAoVC5hY3RpdmUgPSAvKiRlZGl0TGF5b3V0XzAzKi9cbiAgICAgIGVbNF0pLCBrWzBdICYgLyokT0JKKi9cbiAgICAgIDMyICYmIChULm9uQWRkID0gUyksIHMuJHNldChUKSwgLyokZWRpdExheW91dF8wMyovXG4gICAgICBlWzRdIHx8IC8qJGVkaXRMYXlvdXRfMDIqL1xuICAgICAgZVszXSA/IEQgfHwgKEQgPSBOdCgpLCBELmMoKSwgRC5tKHQsIGwpKSA6IEQgJiYgKEQuZCgxKSwgRCA9IG51bGwpLCBrWzBdICYgLyokZWRpdE1vZGUsICRlZGl0TGF5b3V0XzAzLCAkZWRpdExheW91dF8wMiwgJE9CSiwgRHJhZ0l0ZW1IYW5kbGVyLCBzeXMsIGl0ZW1SZXF1ZXN0TW92ZSwgT0JKKi9cbiAgICAgIDE5NTE1KSB7XG4gICAgICAgIEEgPSBzZShcbiAgICAgICAgICAvKmNvbHVtbiovXG4gICAgICAgICAgZVs0Nl0uZGF0YVxuICAgICAgICApLCB1ZSgpO1xuICAgICAgICBmb3IgKGxldCBxID0gMDsgcSA8IHIubGVuZ3RoOyBxICs9IDEpXG4gICAgICAgICAgcltxXS5yKCk7XG4gICAgICAgIHIgPSBLZShyLCBrLCBILCAxLCBlLCBBLCBvLCB0LCBpdCwgQnQsIG51bGwsIEF0KTtcbiAgICAgICAgZm9yIChsZXQgcSA9IDA7IHEgPCByLmxlbmd0aDsgcSArPSAxKVxuICAgICAgICAgIHJbcV0uYSgpO1xuICAgICAgICBmZSgpO1xuICAgICAgfVxuICAgICAgKCFwIHx8IGtbMF0gJiAvKiRlZGl0TGF5b3V0XzAyLCAkZWRpdExheW91dF8wMSovXG4gICAgICAxMiAmJiBkICE9PSAoZCA9IC8qJGVkaXRMYXlvdXRfMDIqL1xuICAgICAgZVszXSB8fCAvKiRlZGl0TGF5b3V0XzAxKi9cbiAgICAgIGVbMl0pKSAmJiBnKHQsIFwiZGF0YS1lZGl0XCIsIGQpLCAoIXAgfHwga1swXSAmIC8qJGVkaXRMYXlvdXRfMDMqL1xuICAgICAgMTYpICYmIGcoXG4gICAgICAgIHQsXG4gICAgICAgIFwiZGF0YS1lZGl0cHJldmlld1wiLFxuICAgICAgICAvKiRlZGl0TGF5b3V0XzAzKi9cbiAgICAgICAgZVs0XVxuICAgICAgKSwgKCFwIHx8IGtbMF0gJiAvKiRPQkoqL1xuICAgICAgMzIgJiYgdSAhPT0gKHUgPSAvKmNvbHVtbiovXG4gICAgICBlWzQ2XS5pZCkpICYmIGcodCwgXCJkYXRhLWl0ZW1pZFwiLCB1KSwgKCFwIHx8IGtbMF0gJiAvKiRlZGl0TGF5b3V0XzAyKi9cbiAgICAgIDgpICYmIGcoXG4gICAgICAgIHQsXG4gICAgICAgIFwiZGF0YS1lZGl0LWFjdGl2ZVwiLFxuICAgICAgICAvKiRlZGl0TGF5b3V0XzAyKi9cbiAgICAgICAgZVszXVxuICAgICAgKSwgKCFwIHx8IGtbMF0gJiAvKiRPQkoqL1xuICAgICAgMzIgJiYgXyAhPT0gKF8gPSAvKkRyYWdDb2x1bW5IYW5kbGVyKi9cbiAgICAgIGVbMTNdLmlzQmVpbmdEcmFnZ2VkKFxuICAgICAgICAvKmNvbHVtbiovXG4gICAgICAgIGVbNDZdLmlkXG4gICAgICApKSkgJiYgZyh0LCBcImRhdGEtZHJhZ2dpbmdcIiwgXyksICghcCB8fCBrWzBdICYgLyokZWRpdExheW91dF8wMiwgJGVkaXRMYXlvdXRfMDEqL1xuICAgICAgMTIgJiYgZiAhPT0gKGYgPSBgXG5cdFx0XHRcdFx0XHQkey8qJGVkaXRMYXlvdXRfMDIqL1xuICAgICAgZVszXSB8fCAvKiRlZGl0TGF5b3V0XzAxKi9cbiAgICAgIGVbMl0gPyBcIm1hcmdpbi1ib3R0b206NjBweFwiIDogXCJcIn1cblx0XHRcdFx0XHRgKSkgJiYgZyh0LCBcInN0eWxlXCIsIGYpLCAoIXAgfHwga1swXSAmIC8qJGVkaXRMYXlvdXRfMDIqL1xuICAgICAgOCkgJiYgZyhcbiAgICAgICAgdCxcbiAgICAgICAgXCJkcmFnZ2FibGVcIixcbiAgICAgICAgLyokZWRpdExheW91dF8wMiovXG4gICAgICAgIGVbM11cbiAgICAgICk7XG4gICAgfSxcbiAgICByKCkge1xuICAgICAgYyA9IHQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgfSxcbiAgICBmKCkge1xuICAgICAgZXQodCksIHkoKSwgamUodCwgYyk7XG4gICAgfSxcbiAgICBhKCkge1xuICAgICAgeSgpLCB5ID0geGUodCwgYywgYXQsIHsgZHVyYXRpb246IGhlIH0pO1xuICAgIH0sXG4gICAgaShPKSB7XG4gICAgICBpZiAoIXApIHtcbiAgICAgICAgUihtKSwgUihzLiQkLmZyYWdtZW50LCBPKTtcbiAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBBLmxlbmd0aDsgayArPSAxKVxuICAgICAgICAgIFIocltrXSk7XG4gICAgICAgIE8gJiYgaWUoKCkgPT4ge1xuICAgICAgICAgIHAgJiYgKGggfHwgKGggPSB6KHQsIFRlLCB7IGR1cmF0aW9uOiBoZSB9LCAhMCkpLCBoLnJ1bigxKSk7XG4gICAgICAgIH0pLCBwID0gITA7XG4gICAgICB9XG4gICAgfSxcbiAgICBvKE8pIHtcbiAgICAgIFAobSksIFAocy4kJC5mcmFnbWVudCwgTyk7XG4gICAgICBmb3IgKGxldCBrID0gMDsgayA8IHIubGVuZ3RoOyBrICs9IDEpXG4gICAgICAgIFAocltrXSk7XG4gICAgICBPICYmIChoIHx8IChoID0geih0LCBUZSwgeyBkdXJhdGlvbjogaGUgfSwgITEpKSwgaC5ydW4oMCkpLCBwID0gITE7XG4gICAgfSxcbiAgICBkKE8pIHtcbiAgICAgIE8gJiYgTih0KSwgbSAmJiBtLmQoKSwgUShzKSwgRCAmJiBELmQoKTtcbiAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgci5sZW5ndGg7IGsgKz0gMSlcbiAgICAgICAgcltrXS5kKCk7XG4gICAgICBPICYmIGggJiYgaC5lbmQoKSwgdiA9ICExLCBZKEMpO1xuICAgIH1cbiAgfTtcbn1cbmZ1bmN0aW9uIFR0KG4sIGUpIHtcbiAgbGV0IHQsIGksIHMsIGEsIGwsIHIgPSBbXSwgbyA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIGQsIHUsIF8sIGYsIGggPSBLLCBjLCB5LCBwO1xuICBmdW5jdGlvbiB2KCkge1xuICAgIHJldHVybiAoXG4gICAgICAvKmZ1bmMqL1xuICAgICAgZVsyMF0oXG4gICAgICAgIC8qcm93Ki9cbiAgICAgICAgZVs0M11cbiAgICAgIClcbiAgICApO1xuICB9XG4gIGkgPSBuZXcgcGUoe1xuICAgIHByb3BzOiB7XG4gICAgICBhY3RpdmU6IChcbiAgICAgICAgLyokZWRpdExheW91dF8wMiovXG4gICAgICAgIGVbM11cbiAgICAgICksXG4gICAgICBvbkFkZDogdixcbiAgICAgIGFkZFRleHQ6IFwiYWRkIENvbHVtblwiXG4gICAgfVxuICB9KTtcbiAgZnVuY3Rpb24gQygpIHtcbiAgICByZXR1cm4gKFxuICAgICAgLypmdW5jXzEqL1xuICAgICAgZVsyMV0oXG4gICAgICAgIC8qcm93Ki9cbiAgICAgICAgZVs0M11cbiAgICAgIClcbiAgICApO1xuICB9XG4gIGEgPSBuZXcgcGUoe1xuICAgIHByb3BzOiB7XG4gICAgICBhY3RpdmU6IChcbiAgICAgICAgLyokZWRpdExheW91dF8wMSovXG4gICAgICAgIGVbMl1cbiAgICAgICksXG4gICAgICBvblJlbW92ZTogQyxcbiAgICAgIHJlbVRleHQ6IFwicmVtb3ZlIHRoaXMgbGluZVwiXG4gICAgfVxuICB9KTtcbiAgbGV0IG0gPSBzZShcbiAgICAvKnJvdyovXG4gICAgZVs0M10uZGF0YVxuICApO1xuICBjb25zdCBTID0gKE0pID0+IChcbiAgICAvKmNvbHVtbiovXG4gICAgTVs0Nl0uaWRcbiAgKTtcbiAgZm9yIChsZXQgTSA9IDA7IE0gPCBtLmxlbmd0aDsgTSArPSAxKSB7XG4gICAgbGV0IHcgPSBFdChlLCBtLCBNKSwgRiA9IFModyk7XG4gICAgby5zZXQoRiwgcltNXSA9IFZ0KEYsIHcpKTtcbiAgfVxuICBmdW5jdGlvbiBEKC4uLk0pIHtcbiAgICByZXR1cm4gKFxuICAgICAgLypkcmFnc3RhcnRfaGFuZGxlcl8yKi9cbiAgICAgIGVbMzddKFxuICAgICAgICAvKnJvdyovXG4gICAgICAgIGVbNDNdLFxuICAgICAgICAuLi5NXG4gICAgICApXG4gICAgKTtcbiAgfVxuICBmdW5jdGlvbiBBKC4uLk0pIHtcbiAgICByZXR1cm4gKFxuICAgICAgLypkcmFnZW50ZXJfaGFuZGxlcl8xKi9cbiAgICAgIGVbMzhdKFxuICAgICAgICAvKnJvdyovXG4gICAgICAgIGVbNDNdLFxuICAgICAgICAuLi5NXG4gICAgICApXG4gICAgKTtcbiAgfVxuICBmdW5jdGlvbiBIKC4uLk0pIHtcbiAgICByZXR1cm4gKFxuICAgICAgLypkcmFnZW5kX2hhbmRsZXJfMiovXG4gICAgICBlWzM5XShcbiAgICAgICAgLypyb3cqL1xuICAgICAgICBlWzQzXSxcbiAgICAgICAgLi4uTVxuICAgICAgKVxuICAgICk7XG4gIH1cbiAgZnVuY3Rpb24gSiguLi5NKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIC8qZHJhZ292ZXJfaGFuZGxlcl8yKi9cbiAgICAgIGVbNDBdKFxuICAgICAgICAvKnJvdyovXG4gICAgICAgIGVbNDNdLFxuICAgICAgICAuLi5NXG4gICAgICApXG4gICAgKTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGtleTogbixcbiAgICBmaXJzdDogbnVsbCxcbiAgICBjKCkge1xuICAgICAgdCA9ICQoXCJkaXZcIiksIFgoaS4kJC5mcmFnbWVudCksIHMgPSBqKCksIFgoYS4kJC5mcmFnbWVudCksIGwgPSBqKCk7XG4gICAgICBmb3IgKGxldCBNID0gMDsgTSA8IHIubGVuZ3RoOyBNICs9IDEpXG4gICAgICAgIHJbTV0uYygpO1xuICAgICAgZyh0LCBcImNsYXNzXCIsIFwiUm93XCIpLCBnKFxuICAgICAgICB0LFxuICAgICAgICBcImRhdGEtZWRpdFwiLFxuICAgICAgICAvKiRlZGl0TGF5b3V0XzAxKi9cbiAgICAgICAgZVsyXVxuICAgICAgKSwgZyhcbiAgICAgICAgdCxcbiAgICAgICAgXCJkYXRhLWVkaXQtYWN0aXZlXCIsXG4gICAgICAgIC8qJGVkaXRMYXlvdXRfMDEqL1xuICAgICAgICBlWzJdXG4gICAgICApLCBnKFxuICAgICAgICB0LFxuICAgICAgICBcImRhdGEtZWRpdHByZXZpZXdcIixcbiAgICAgICAgLyokZWRpdExheW91dF8wMiovXG4gICAgICAgIGVbM11cbiAgICAgICksIGcodCwgXCJzdHlsZVwiLCBkID0gYGdyaWQtdGVtcGxhdGUtY29sdW1uczoke1B0KFxuICAgICAgICAvKnJvdyovXG4gICAgICAgIGVbNDNdLmRhdGEubGVuZ3RoLFxuICAgICAgICBcIjFmclwiXG4gICAgICApfWApLCBnKHQsIFwiZGF0YS1yb3dpZFwiLCB1ID0gLypyb3cqL1xuICAgICAgZVs0M10uaWQpLCBnKFxuICAgICAgICB0LFxuICAgICAgICBcImRyYWdnYWJsZVwiLFxuICAgICAgICAvKiRlZGl0TGF5b3V0XzAxKi9cbiAgICAgICAgZVsyXVxuICAgICAgKSwgdGhpcy5maXJzdCA9IHQ7XG4gICAgfSxcbiAgICBtKE0sIHcpIHtcbiAgICAgIEIoTSwgdCwgdyksIFcoaSwgdCwgbnVsbCksIGIodCwgcyksIFcoYSwgdCwgbnVsbCksIGIodCwgbCk7XG4gICAgICBmb3IgKGxldCBGID0gMDsgRiA8IHIubGVuZ3RoOyBGICs9IDEpXG4gICAgICAgIHJbRl0gJiYgcltGXS5tKHQsIG51bGwpO1xuICAgICAgYyA9ICEwLCB5IHx8IChwID0gW1xuICAgICAgICBVKHQsIFwiZHJhZ3N0YXJ0XCIsIEQpLFxuICAgICAgICBVKHQsIFwiZHJhZ2VudGVyXCIsIEEpLFxuICAgICAgICBVKHQsIFwiZHJhZ2VuZFwiLCBIKSxcbiAgICAgICAgVSh0LCBcImRyYWdvdmVyXCIsIEopXG4gICAgICBdLCB5ID0gITApO1xuICAgIH0sXG4gICAgcChNLCB3KSB7XG4gICAgICBlID0gTTtcbiAgICAgIGNvbnN0IEYgPSB7fTtcbiAgICAgIHdbMF0gJiAvKiRlZGl0TGF5b3V0XzAyKi9cbiAgICAgIDggJiYgKEYuYWN0aXZlID0gLyokZWRpdExheW91dF8wMiovXG4gICAgICBlWzNdKSwgd1swXSAmIC8qJE9CSiovXG4gICAgICAzMiAmJiAoRi5vbkFkZCA9IHYpLCBpLiRzZXQoRik7XG4gICAgICBjb25zdCBaID0ge307XG4gICAgICBpZiAod1swXSAmIC8qJGVkaXRMYXlvdXRfMDEqL1xuICAgICAgNCAmJiAoWi5hY3RpdmUgPSAvKiRlZGl0TGF5b3V0XzAxKi9cbiAgICAgIGVbMl0pLCB3WzBdICYgLyokT0JKKi9cbiAgICAgIDMyICYmIChaLm9uUmVtb3ZlID0gQyksIGEuJHNldChaKSwgd1swXSAmIC8qJGVkaXRMYXlvdXRfMDIsICRlZGl0TGF5b3V0XzAxLCAkZWRpdExheW91dF8wMywgJE9CSiwgRHJhZ0NvbHVtbkhhbmRsZXIsIERyYWdJdGVtSGFuZGxlciwgJGVkaXRNb2RlLCBzeXMsIGl0ZW1SZXF1ZXN0TW92ZSwgT0JKKi9cbiAgICAgIDI3NzExKSB7XG4gICAgICAgIG0gPSBzZShcbiAgICAgICAgICAvKnJvdyovXG4gICAgICAgICAgZVs0M10uZGF0YVxuICAgICAgICApLCB1ZSgpO1xuICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHIubGVuZ3RoOyB4ICs9IDEpXG4gICAgICAgICAgclt4XS5yKCk7XG4gICAgICAgIHIgPSBLZShyLCB3LCBTLCAxLCBlLCBtLCBvLCB0LCBpdCwgVnQsIG51bGwsIEV0KTtcbiAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCByLmxlbmd0aDsgeCArPSAxKVxuICAgICAgICAgIHJbeF0uYSgpO1xuICAgICAgICBmZSgpO1xuICAgICAgfVxuICAgICAgKCFjIHx8IHdbMF0gJiAvKiRlZGl0TGF5b3V0XzAxKi9cbiAgICAgIDQpICYmIGcoXG4gICAgICAgIHQsXG4gICAgICAgIFwiZGF0YS1lZGl0XCIsXG4gICAgICAgIC8qJGVkaXRMYXlvdXRfMDEqL1xuICAgICAgICBlWzJdXG4gICAgICApLCAoIWMgfHwgd1swXSAmIC8qJGVkaXRMYXlvdXRfMDEqL1xuICAgICAgNCkgJiYgZyhcbiAgICAgICAgdCxcbiAgICAgICAgXCJkYXRhLWVkaXQtYWN0aXZlXCIsXG4gICAgICAgIC8qJGVkaXRMYXlvdXRfMDEqL1xuICAgICAgICBlWzJdXG4gICAgICApLCAoIWMgfHwgd1swXSAmIC8qJGVkaXRMYXlvdXRfMDIqL1xuICAgICAgOCkgJiYgZyhcbiAgICAgICAgdCxcbiAgICAgICAgXCJkYXRhLWVkaXRwcmV2aWV3XCIsXG4gICAgICAgIC8qJGVkaXRMYXlvdXRfMDIqL1xuICAgICAgICBlWzNdXG4gICAgICApLCAoIWMgfHwgd1swXSAmIC8qJE9CSiovXG4gICAgICAzMiAmJiBkICE9PSAoZCA9IGBncmlkLXRlbXBsYXRlLWNvbHVtbnM6JHtQdChcbiAgICAgICAgLypyb3cqL1xuICAgICAgICBlWzQzXS5kYXRhLmxlbmd0aCxcbiAgICAgICAgXCIxZnJcIlxuICAgICAgKX1gKSkgJiYgZyh0LCBcInN0eWxlXCIsIGQpLCAoIWMgfHwgd1swXSAmIC8qJE9CSiovXG4gICAgICAzMiAmJiB1ICE9PSAodSA9IC8qcm93Ki9cbiAgICAgIGVbNDNdLmlkKSkgJiYgZyh0LCBcImRhdGEtcm93aWRcIiwgdSksICghYyB8fCB3WzBdICYgLyokZWRpdExheW91dF8wMSovXG4gICAgICA0KSAmJiBnKFxuICAgICAgICB0LFxuICAgICAgICBcImRyYWdnYWJsZVwiLFxuICAgICAgICAvKiRlZGl0TGF5b3V0XzAxKi9cbiAgICAgICAgZVsyXVxuICAgICAgKTtcbiAgICB9LFxuICAgIHIoKSB7XG4gICAgICBmID0gdC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICB9LFxuICAgIGYoKSB7XG4gICAgICBldCh0KSwgaCgpLCBqZSh0LCBmKTtcbiAgICB9LFxuICAgIGEoKSB7XG4gICAgICBoKCksIGggPSB4ZSh0LCBmLCBhdCwgeyBkdXJhdGlvbjogaGUgfSk7XG4gICAgfSxcbiAgICBpKE0pIHtcbiAgICAgIGlmICghYykge1xuICAgICAgICBSKGkuJCQuZnJhZ21lbnQsIE0pLCBSKGEuJCQuZnJhZ21lbnQsIE0pO1xuICAgICAgICBmb3IgKGxldCB3ID0gMDsgdyA8IG0ubGVuZ3RoOyB3ICs9IDEpXG4gICAgICAgICAgUihyW3ddKTtcbiAgICAgICAgTSAmJiBpZSgoKSA9PiB7XG4gICAgICAgICAgYyAmJiAoXyB8fCAoXyA9IHoodCwgdXQsIHsgZHVyYXRpb246IGhlLCB5OiAxMDAgfSwgITApKSwgXy5ydW4oMSkpO1xuICAgICAgICB9KSwgYyA9ICEwO1xuICAgICAgfVxuICAgIH0sXG4gICAgbyhNKSB7XG4gICAgICBQKGkuJCQuZnJhZ21lbnQsIE0pLCBQKGEuJCQuZnJhZ21lbnQsIE0pO1xuICAgICAgZm9yIChsZXQgdyA9IDA7IHcgPCByLmxlbmd0aDsgdyArPSAxKVxuICAgICAgICBQKHJbd10pO1xuICAgICAgTSAmJiAoXyB8fCAoXyA9IHoodCwgdXQsIHsgZHVyYXRpb246IGhlLCB5OiAxMDAgfSwgITEpKSwgXy5ydW4oMCkpLCBjID0gITE7XG4gICAgfSxcbiAgICBkKE0pIHtcbiAgICAgIE0gJiYgTih0KSwgUShpKSwgUShhKTtcbiAgICAgIGZvciAobGV0IHcgPSAwOyB3IDwgci5sZW5ndGg7IHcgKz0gMSlcbiAgICAgICAgclt3XS5kKCk7XG4gICAgICBNICYmIF8gJiYgXy5lbmQoKSwgeSA9ICExLCBZKHApO1xuICAgIH1cbiAgfTtcbn1cbmZ1bmN0aW9uIFV0KG4pIHtcbiAgbGV0IGUsIHQsIGk7XG4gIHJldHVybiB0ID0gbmV3IHBlKHtcbiAgICBwcm9wczoge1xuICAgICAgYWN0aXZlOiAoXG4gICAgICAgIC8qJGVkaXRMYXlvdXRfMDEqL1xuICAgICAgICBuWzJdXG4gICAgICApLFxuICAgICAgb25BZGQ6IChcbiAgICAgICAgLypmdW5jXzUqL1xuICAgICAgICBuWzQxXVxuICAgICAgKSxcbiAgICAgIG9mZnNldDogMTUsXG4gICAgICBhZGRUZXh0OiBcImFkZCBMaW5lXCJcbiAgICB9XG4gIH0pLCB7XG4gICAgYygpIHtcbiAgICAgIGUgPSAkKFwiZGl2XCIpLCBYKHQuJCQuZnJhZ21lbnQpLCBnKGUsIFwiY2xhc3NcIiwgXCJSb3dcIiksIFl0KGUsIFwiaGVpZ2h0XCIsIFwiMTAwcHhcIik7XG4gICAgfSxcbiAgICBtKHMsIGEpIHtcbiAgICAgIEIocywgZSwgYSksIFcodCwgZSwgbnVsbCksIGkgPSAhMDtcbiAgICB9LFxuICAgIHAocywgYSkge1xuICAgICAgY29uc3QgbCA9IHt9O1xuICAgICAgYVswXSAmIC8qJGVkaXRMYXlvdXRfMDEqL1xuICAgICAgNCAmJiAobC5hY3RpdmUgPSAvKiRlZGl0TGF5b3V0XzAxKi9cbiAgICAgIHNbMl0pLCBhWzBdICYgLyokT0JKKi9cbiAgICAgIDMyICYmIChsLm9uQWRkID0gLypmdW5jXzUqL1xuICAgICAgc1s0MV0pLCB0LiRzZXQobCk7XG4gICAgfSxcbiAgICBpKHMpIHtcbiAgICAgIGkgfHwgKFIodC4kJC5mcmFnbWVudCwgcyksIGkgPSAhMCk7XG4gICAgfSxcbiAgICBvKHMpIHtcbiAgICAgIFAodC4kJC5mcmFnbWVudCwgcyksIGkgPSAhMTtcbiAgICB9LFxuICAgIGQocykge1xuICAgICAgcyAmJiBOKGUpLCBRKHQpO1xuICAgIH1cbiAgfTtcbn1cbmZ1bmN0aW9uIFNpKG4pIHtcbiAgbGV0IGUsIHQsIGksIHMsIGEsIGwgPSBcIlN0b3AgRWRpdFx0XCIsIHIsIG8sIGQsIHUgPSBcIkxheW91dCBSb3dcdFwiLCBfLCBmLCBoLCBjID0gXCJMYXlvdXQgQ29sXHRcIiwgeSwgcCwgdiwgQyA9IFwiTGF5b3V0IEl0ZW1zXCIsIG0sIFMsIEQsIEEgPSBbXSwgSCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCksIEosIE0sIHcsIEYsIFogPSBzZShcbiAgICAvKiRPQkoqL1xuICAgIG5bNV0uZGF0YVxuICApO1xuICBjb25zdCB4ID0gKGspID0+IChcbiAgICAvKnJvdyovXG4gICAga1s0M10uaWRcbiAgKTtcbiAgZm9yIChsZXQgayA9IDA7IGsgPCBaLmxlbmd0aDsgayArPSAxKSB7XG4gICAgbGV0IFQgPSBMdChuLCBaLCBrKSwgcSA9IHgoVCk7XG4gICAgSC5zZXQocSwgQVtrXSA9IFR0KHEsIFQpKTtcbiAgfVxuICBsZXQgTyA9IChcbiAgICAvKiRlZGl0TGF5b3V0XzAxKi9cbiAgICBuWzJdICYmIFV0KG4pXG4gICk7XG4gIHJldHVybiB7XG4gICAgYygpIHtcbiAgICAgIGUgPSAkKFwiZGl2XCIpLCB0ID0gJChcImRpdlwiKSwgaSA9ICQoXCJkaXZcIiksIHMgPSAkKFwiZGl2XCIpLCBhID0gJChcImJ1dHRvblwiKSwgciA9IEcobCksIG8gPSBqKCksIGQgPSAkKFwiYnV0dG9uXCIpLCBfID0gRyh1KSwgZiA9IGooKSwgaCA9ICQoXCJidXR0b25cIiksIHkgPSBHKGMpLCBwID0gaigpLCB2ID0gJChcImJ1dHRvblwiKSwgbSA9IEcoQyksIEQgPSBqKCk7XG4gICAgICBmb3IgKGxldCBrID0gMDsgayA8IEEubGVuZ3RoOyBrICs9IDEpXG4gICAgICAgIEFba10uYygpO1xuICAgICAgSiA9IGooKSwgTyAmJiBPLmMoKSwgZyhcbiAgICAgICAgYSxcbiAgICAgICAgXCJkYXRhLWFjdGl2ZVwiLFxuICAgICAgICAvKiRlZGl0TW9kZSovXG4gICAgICAgIG5bMV1cbiAgICAgICksIGcoXG4gICAgICAgIGQsXG4gICAgICAgIFwiZGF0YS1hY3RpdmVcIixcbiAgICAgICAgLyokZWRpdExheW91dF8wMSovXG4gICAgICAgIG5bMl1cbiAgICAgICksIGcoXG4gICAgICAgIGgsXG4gICAgICAgIFwiZGF0YS1hY3RpdmVcIixcbiAgICAgICAgLyokZWRpdExheW91dF8wMiovXG4gICAgICAgIG5bM11cbiAgICAgICksIGcoXG4gICAgICAgIHYsXG4gICAgICAgIFwiZGF0YS1hY3RpdmVcIixcbiAgICAgICAgLyokZWRpdExheW91dF8wMyovXG4gICAgICAgIG5bNF1cbiAgICAgICksIGcocywgXCJjbGFzc1wiLCBcIlNoZWV0RWRpdG9yTWVudVwiKSwgZyhzLCBcImRhdGEtaXNvcGVuXCIsIFMgPSAvKiRlZGl0TW9kZSovXG4gICAgICBuWzFdIHx8IC8qJGVkaXRMYXlvdXRfMDEqL1xuICAgICAgblsyXSB8fCAvKiRlZGl0TGF5b3V0XzAyKi9cbiAgICAgIG5bM10gfHwgLyokZWRpdExheW91dF8wMyovXG4gICAgICBuWzRdKSwgZyhpLCBcImNsYXNzXCIsIFwiU2hlZXRFZGl0b3JNZW51Q29udGFpbmVyXCIpLCBnKHQsIFwiY2xhc3NcIiwgXCJTaGVldCBcIiksIGcoZSwgXCJjbGFzc1wiLCBcInRoZW1lLWxpZ2h0IG9ic2lkaWFuQm9keVwiKTtcbiAgICB9LFxuICAgIG0oaywgVCkge1xuICAgICAgQihrLCBlLCBUKSwgYihlLCB0KSwgYih0LCBpKSwgYihpLCBzKSwgYihzLCBhKSwgYihhLCByKSwgYihzLCBvKSwgYihzLCBkKSwgYihkLCBfKSwgYihzLCBmKSwgYihzLCBoKSwgYihoLCB5KSwgYihzLCBwKSwgYihzLCB2KSwgYih2LCBtKSwgYih0LCBEKTtcbiAgICAgIGZvciAobGV0IHEgPSAwOyBxIDwgQS5sZW5ndGg7IHEgKz0gMSlcbiAgICAgICAgQVtxXSAmJiBBW3FdLm0odCwgbnVsbCk7XG4gICAgICBiKHQsIEopLCBPICYmIE8ubSh0LCBudWxsKSwgTSA9ICEwLCB3IHx8IChGID0gW1xuICAgICAgICBVKFxuICAgICAgICAgIGEsXG4gICAgICAgICAgXCJjbGlja1wiLFxuICAgICAgICAgIC8qY2xpY2tfaGFuZGxlciovXG4gICAgICAgICAgblsxNl1cbiAgICAgICAgKSxcbiAgICAgICAgVShcbiAgICAgICAgICBkLFxuICAgICAgICAgIFwiY2xpY2tcIixcbiAgICAgICAgICAvKmNsaWNrX2hhbmRsZXJfMSovXG4gICAgICAgICAgblsxN11cbiAgICAgICAgKSxcbiAgICAgICAgVShcbiAgICAgICAgICBoLFxuICAgICAgICAgIFwiY2xpY2tcIixcbiAgICAgICAgICAvKmNsaWNrX2hhbmRsZXJfMiovXG4gICAgICAgICAgblsxOF1cbiAgICAgICAgKSxcbiAgICAgICAgVShcbiAgICAgICAgICB2LFxuICAgICAgICAgIFwiY2xpY2tcIixcbiAgICAgICAgICAvKmNsaWNrX2hhbmRsZXJfMyovXG4gICAgICAgICAgblsxOV1cbiAgICAgICAgKVxuICAgICAgXSwgdyA9ICEwKTtcbiAgICB9LFxuICAgIHAoaywgVCkge1xuICAgICAgaWYgKCghTSB8fCBUWzBdICYgLyokZWRpdE1vZGUqL1xuICAgICAgMikgJiYgZyhcbiAgICAgICAgYSxcbiAgICAgICAgXCJkYXRhLWFjdGl2ZVwiLFxuICAgICAgICAvKiRlZGl0TW9kZSovXG4gICAgICAgIGtbMV1cbiAgICAgICksICghTSB8fCBUWzBdICYgLyokZWRpdExheW91dF8wMSovXG4gICAgICA0KSAmJiBnKFxuICAgICAgICBkLFxuICAgICAgICBcImRhdGEtYWN0aXZlXCIsXG4gICAgICAgIC8qJGVkaXRMYXlvdXRfMDEqL1xuICAgICAgICBrWzJdXG4gICAgICApLCAoIU0gfHwgVFswXSAmIC8qJGVkaXRMYXlvdXRfMDIqL1xuICAgICAgOCkgJiYgZyhcbiAgICAgICAgaCxcbiAgICAgICAgXCJkYXRhLWFjdGl2ZVwiLFxuICAgICAgICAvKiRlZGl0TGF5b3V0XzAyKi9cbiAgICAgICAga1szXVxuICAgICAgKSwgKCFNIHx8IFRbMF0gJiAvKiRlZGl0TGF5b3V0XzAzKi9cbiAgICAgIDE2KSAmJiBnKFxuICAgICAgICB2LFxuICAgICAgICBcImRhdGEtYWN0aXZlXCIsXG4gICAgICAgIC8qJGVkaXRMYXlvdXRfMDMqL1xuICAgICAgICBrWzRdXG4gICAgICApLCAoIU0gfHwgVFswXSAmIC8qJGVkaXRNb2RlLCAkZWRpdExheW91dF8wMSwgJGVkaXRMYXlvdXRfMDIsICRlZGl0TGF5b3V0XzAzKi9cbiAgICAgIDMwICYmIFMgIT09IChTID0gLyokZWRpdE1vZGUqL1xuICAgICAga1sxXSB8fCAvKiRlZGl0TGF5b3V0XzAxKi9cbiAgICAgIGtbMl0gfHwgLyokZWRpdExheW91dF8wMiovXG4gICAgICBrWzNdIHx8IC8qJGVkaXRMYXlvdXRfMDMqL1xuICAgICAga1s0XSkpICYmIGcocywgXCJkYXRhLWlzb3BlblwiLCBTKSwgVFswXSAmIC8qJGVkaXRMYXlvdXRfMDEsICRlZGl0TGF5b3V0XzAyLCAkT0JKLCBEcmFnUm93SGFuZGxlciwgJGVkaXRMYXlvdXRfMDMsIERyYWdDb2x1bW5IYW5kbGVyLCBEcmFnSXRlbUhhbmRsZXIsICRlZGl0TW9kZSwgc3lzLCBpdGVtUmVxdWVzdE1vdmUsIE9CSiovXG4gICAgICAzMTgwNykge1xuICAgICAgICBaID0gc2UoXG4gICAgICAgICAgLyokT0JKKi9cbiAgICAgICAgICBrWzVdLmRhdGFcbiAgICAgICAgKSwgdWUoKTtcbiAgICAgICAgZm9yIChsZXQgcSA9IDA7IHEgPCBBLmxlbmd0aDsgcSArPSAxKVxuICAgICAgICAgIEFbcV0ucigpO1xuICAgICAgICBBID0gS2UoQSwgVCwgeCwgMSwgaywgWiwgSCwgdCwgaXQsIFR0LCBKLCBMdCk7XG4gICAgICAgIGZvciAobGV0IHEgPSAwOyBxIDwgQS5sZW5ndGg7IHEgKz0gMSlcbiAgICAgICAgICBBW3FdLmEoKTtcbiAgICAgICAgZmUoKTtcbiAgICAgIH1cbiAgICAgIC8qJGVkaXRMYXlvdXRfMDEqL1xuICAgICAga1syXSA/IE8gPyAoTy5wKGssIFQpLCBUWzBdICYgLyokZWRpdExheW91dF8wMSovXG4gICAgICA0ICYmIFIoTywgMSkpIDogKE8gPSBVdChrKSwgTy5jKCksIFIoTywgMSksIE8ubSh0LCBudWxsKSkgOiBPICYmICh1ZSgpLCBQKE8sIDEsIDEsICgpID0+IHtcbiAgICAgICAgTyA9IG51bGw7XG4gICAgICB9KSwgZmUoKSk7XG4gICAgfSxcbiAgICBpKGspIHtcbiAgICAgIGlmICghTSkge1xuICAgICAgICBmb3IgKGxldCBUID0gMDsgVCA8IFoubGVuZ3RoOyBUICs9IDEpXG4gICAgICAgICAgUihBW1RdKTtcbiAgICAgICAgUihPKSwgTSA9ICEwO1xuICAgICAgfVxuICAgIH0sXG4gICAgbyhrKSB7XG4gICAgICBmb3IgKGxldCBUID0gMDsgVCA8IEEubGVuZ3RoOyBUICs9IDEpXG4gICAgICAgIFAoQVtUXSk7XG4gICAgICBQKE8pLCBNID0gITE7XG4gICAgfSxcbiAgICBkKGspIHtcbiAgICAgIGsgJiYgTihlKTtcbiAgICAgIGZvciAobGV0IFQgPSAwOyBUIDwgQS5sZW5ndGg7IFQgKz0gMSlcbiAgICAgICAgQVtUXS5kKCk7XG4gICAgICBPICYmIE8uZCgpLCB3ID0gITEsIFkoRik7XG4gICAgfVxuICB9O1xufVxuY29uc3QgVWUgPSAyMjAsIGhlID0gMTAwO1xuY2xhc3MgTWkge1xuICBjb25zdHJ1Y3RvcihlLCB0KSB7XG4gICAgTCh0aGlzLCBcImRhdGFcIik7XG4gICAgTCh0aGlzLCBcInN0YXRlXCIpO1xuICAgIEwodGhpcywgXCJsYXllckFjdGl2ZVwiKTtcbiAgICBMKHRoaXMsIFwiaXNEcmFnZ2luZ1wiLCAhMSk7XG4gICAgTCh0aGlzLCBcInBhdXNlRHJhZ2dcIiwgITEpO1xuICAgIEwodGhpcywgXCJkcmFnSURcIik7XG4gICAgTCh0aGlzLCBcInRhcmdldElEXCIpO1xuICAgIHRoaXMuZGF0YSA9IGUsIHRoaXMuc3RhdGUgPSB0LCB0aGlzLmxheWVyQWN0aXZlID0gdC5lZGl0TGF5b3V0XzAxO1xuICB9XG4gIG1vdmVSb3coKSB7XG4gICAgdGhpcy5pc0RyYWdnaW5nICYmICghdGhpcy5kcmFnSUQgfHwgIXRoaXMudGFyZ2V0SUQgfHwgdGhpcy50YXJnZXRJRCA9PSB0aGlzLmRyYWdJRCB8fCB0aGlzLmRhdGEudXBkYXRlKChlKSA9PiB7XG4gICAgICBsZXQgdCA9IHRoaXMuZmluZEluZGV4T2ZJRCh0aGlzLmRyYWdJRCksIGkgPSB0aGlzLmZpbmRJbmRleE9mSUQodGhpcy50YXJnZXRJRCk7XG4gICAgICBjb25zdCBzID0gZS5kYXRhW3RdO1xuICAgICAgcmV0dXJuIHRoaXMucGF1c2VEcmFnZyA9ICEwLCBzZXRUaW1lb3V0KFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5wYXVzZURyYWdnID0gITE7XG4gICAgICAgIH0sXG4gICAgICAgIFVlXG4gICAgICApLCBlLmRhdGFbdF0gPSBlLmRhdGFbaV0sIGUuZGF0YVtpXSA9IHMsIGU7XG4gICAgfSkpO1xuICB9XG4gIG9uRHJhZ1N0YXJ0KGUsIHQpIHtcbiAgICBpZiAoIWVlKHRoaXMubGF5ZXJBY3RpdmUpKVxuICAgICAgcmV0dXJuO1xuICAgIGNvbnN0IGkgPSBlLnRhcmdldDtcbiAgICBpLmNsYXNzTGlzdC5jb250YWlucyhcIlJvd1wiKSAmJiAodGhpcy5pc0RyYWdnaW5nID0gITAsIHRoaXMuZHJhZ0lEID0gdCwgaS5zZXRBdHRyaWJ1dGUoXCJkYXRhLWRyYWdnaW5nXCIsIFwidHJ1ZVwiKSk7XG4gIH1cbiAgb25EcmFnT3ZlcihlLCB0KSB7XG4gICAgZWUodGhpcy5sYXllckFjdGl2ZSkgJiYgKCF0aGlzLmlzRHJhZ2dpbmcgfHwgdGhpcy5wYXVzZURyYWdnIHx8ICh0aGlzLnRhcmdldElEID0gdCwgdGhpcy5tb3ZlUm93KCkpKTtcbiAgfVxuICBvbkRyYWdFbmQoZSwgdCkge1xuICAgIGlmICghZWUodGhpcy5sYXllckFjdGl2ZSkpXG4gICAgICByZXR1cm47XG4gICAgdGhpcy5pc0RyYWdnaW5nID0gITEsIHRoaXMuZHJhZ0lEID0gbnVsbCwgdGhpcy50YXJnZXRJRCA9IG51bGwsIGUudGFyZ2V0LnNldEF0dHJpYnV0ZShcImRhdGEtZHJhZ2dpbmdcIiwgXCJmYWxzZVwiKTtcbiAgfVxuICBmaW5kSW5kZXhPZklEKGUpIHtcbiAgICByZXR1cm4gZWUodGhpcy5kYXRhKS5kYXRhLmZpbmRJbmRleCgodCkgPT4gdC5pZCA9PSBlKTtcbiAgfVxufVxuY2xhc3MgT2kge1xuICBjb25zdHJ1Y3RvcihlLCB0KSB7XG4gICAgTCh0aGlzLCBcImRhdGFcIik7XG4gICAgTCh0aGlzLCBcInN0YXRlXCIpO1xuICAgIEwodGhpcywgXCJsYXllckFjdGl2ZVwiKTtcbiAgICBMKHRoaXMsIFwiaXNEcmFnZ2luZ1wiLCAhMSk7XG4gICAgTCh0aGlzLCBcInBhdXNlRHJhZ2dcIiwgITEpO1xuICAgIEwodGhpcywgXCJkcmFnVGFyZ2V0RWxlbWVudFwiKTtcbiAgICBMKHRoaXMsIFwiZHJhZ0lEXCIpO1xuICAgIEwodGhpcywgXCJ0YXJnZXRJRFwiKTtcbiAgICBMKHRoaXMsIFwibGFzdERyYWdJZFwiKTtcbiAgICBMKHRoaXMsIFwibGFzdHRhcmdJZFwiKTtcbiAgICB0aGlzLmRhdGEgPSBlLCB0aGlzLnN0YXRlID0gdCwgdGhpcy5sYXllckFjdGl2ZSA9IHQuZWRpdExheW91dF8wMjtcbiAgfVxuICBpbm5lck1vdmVJdGVtKGUsIHQsIGkpIHtcbiAgICBsZXQgcywgYSwgbCwgcjtcbiAgICBpZiAoW3MsIGFdID0gdGhpcy5maW5kUm93SW5kZXhPZklEKHQpLCBbbCwgcl0gPSB0aGlzLmZpbmRSb3dJbmRleE9mSUQoaSksIHMgPT0gLTEgfHwgbCA9PSAtMSlcbiAgICAgIHJldHVybjtcbiAgICBjb25zdCBvID0gZS5kYXRhW3NdLmRhdGFbYV0sIGQgPSBlLmRhdGFbbF0uZGF0YVtyXTtcbiAgICBlLmRhdGFbc10uZGF0YVthXSA9IGQsIGUuZGF0YVtsXS5kYXRhW3JdID0gbztcbiAgfVxuICBtb3ZlUm93SXRlbSgpIHtcbiAgICB0aGlzLmlzRHJhZ2dpbmcgJiYgKCF0aGlzLmRyYWdJRCB8fCB0aGlzLnRhcmdldElEID09IHRoaXMuZHJhZ0lEIHx8IHRoaXMuZGF0YS51cGRhdGUoKGUpID0+IHRoaXMuZHJhZ0lEID09IHRoaXMubGFzdERyYWdJZCAmJiB0aGlzLnRhcmdldElEID09IHRoaXMubGFzdHRhcmdJZCA/ICh0aGlzLmlubmVyTW92ZUl0ZW0oZSwgdGhpcy5sYXN0dGFyZ0lkLCB0aGlzLmxhc3REcmFnSWQpLCBlKSA6ICh0aGlzLmxhc3REcmFnSWQgJiYgdGhpcy5sYXN0dGFyZ0lkICYmIHRoaXMuaW5uZXJNb3ZlSXRlbShlLCB0aGlzLmxhc3REcmFnSWQsIHRoaXMubGFzdHRhcmdJZCksIHRoaXMudGFyZ2V0SUQgJiYgdGhpcy5pbm5lck1vdmVJdGVtKGUsIHRoaXMuZHJhZ0lELCB0aGlzLnRhcmdldElEKSwgdGhpcy5sYXN0RHJhZ0lkID0gdGhpcy5kcmFnSUQsIHRoaXMubGFzdHRhcmdJZCA9IHRoaXMudGFyZ2V0SUQsIHRoaXMucGF1c2VEcmFnZyA9ICEwLCBzZXRUaW1lb3V0KFxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLnBhdXNlRHJhZ2cgPSAhMTtcbiAgICAgIH0sXG4gICAgICBVZVxuICAgICksIGUpKSk7XG4gIH1cbiAgb25EcmFnU3RhcnQoZSwgdCkge1xuICAgIGlmICghZWUodGhpcy5sYXllckFjdGl2ZSkpXG4gICAgICByZXR1cm47XG4gICAgY29uc3QgaSA9IGUudGFyZ2V0O1xuICAgIGkuY2xhc3NMaXN0LmNvbnRhaW5zKFwiQ29sdW1uXCIpICYmICh0aGlzLmRyYWdUYXJnZXRFbGVtZW50ID0gaSwgdGhpcy5pc0RyYWdnaW5nID0gITAsIHRoaXMuZHJhZ0lEID0gdCwgdGhpcy5sYXN0RHJhZ0lkID0gbnVsbCwgdGhpcy5sYXN0dGFyZ0lkID0gbnVsbCwgaS5zZXRBdHRyaWJ1dGUoXCJkYXRhLWRyYWdnaW5nXCIsIFwidHJ1ZVwiKSk7XG4gIH1cbiAgb25EcmFnT3ZlcihlLCB0KSB7XG4gICAgdmFyIGk7XG4gICAgZWUodGhpcy5sYXllckFjdGl2ZSkgJiYgKCF0aGlzLmlzRHJhZ2dpbmcgfHwgdGhpcy5wYXVzZURyYWdnIHx8ICh0aGlzLnRhcmdldElEID0gdCwgdGhpcy5tb3ZlUm93SXRlbSgpLCAoaSA9IHRoaXMuZHJhZ1RhcmdldEVsZW1lbnQpID09IG51bGwgfHwgaS5zZXRBdHRyaWJ1dGUoXCJkYXRhLWRyYWdnaW5nXCIsIFwidHJ1ZVwiKSkpO1xuICB9XG4gIG9uRHJhZ0VuZChlLCB0KSB7XG4gICAgdmFyIGk7XG4gICAgZWUodGhpcy5sYXllckFjdGl2ZSkgJiYgKHRoaXMuaXNEcmFnZ2luZyA9ICExLCB0aGlzLmRyYWdJRCA9IG51bGwsIHRoaXMudGFyZ2V0SUQgPSBudWxsLCBlLnRhcmdldC5zZXRBdHRyaWJ1dGUoXCJkYXRhLWRyYWdnaW5nXCIsIFwiZmFsc2VcIiksIChpID0gdGhpcy5kcmFnVGFyZ2V0RWxlbWVudCkgPT0gbnVsbCB8fCBpLnNldEF0dHJpYnV0ZShcImRhdGEtZHJhZ2dpbmdcIiwgXCJmYWxzZVwiKSk7XG4gIH1cbiAgb25MZWF2ZShlLCB0KSB7XG4gICAgdGhpcy50YXJnZXRJRCA9IG51bGw7XG4gIH1cbiAgZmluZFJvd0luZGV4T2ZJRChlKSB7XG4gICAgbGV0IHQgPSAtMTtcbiAgICByZXR1cm4gW2VlKHRoaXMuZGF0YSkuZGF0YS5maW5kSW5kZXgoKHMpID0+IHtcbiAgICAgIGxldCBhID0gcy5kYXRhLmZpbmRJbmRleCgobCkgPT4gbC5pZCA9PSBlKTtcbiAgICAgIHJldHVybiBhICE9IC0xID8gKHQgPSBhLCAhMCkgOiAhMTtcbiAgICB9KSwgdF07XG4gIH1cbiAgaXNCZWluZ0RyYWdnZWQoZSkge1xuICAgIHJldHVybiB0aGlzLmRyYWdJRCA9PSBlO1xuICB9XG59XG5jbGFzcyBDaSB7XG4gIGNvbnN0cnVjdG9yKGUsIHQpIHtcbiAgICBMKHRoaXMsIFwiZGF0YVwiKTtcbiAgICBMKHRoaXMsIFwic3RhdGVcIik7XG4gICAgTCh0aGlzLCBcImxheWVyQWN0aXZlXCIpO1xuICAgIEwodGhpcywgXCJpc0RyYWdnaW5nXCIsICExKTtcbiAgICBMKHRoaXMsIFwicGF1c2VEcmFnZ1wiLCAhMSk7XG4gICAgTCh0aGlzLCBcImRyYWdUYXJnZXRFbGVtZW50XCIpO1xuICAgIEwodGhpcywgXCJkcmFnSURcIik7XG4gICAgTCh0aGlzLCBcInRhcmdldElEXCIpO1xuICAgIEwodGhpcywgXCJ0YXJnZXRSb3dJZFwiKTtcbiAgICBMKHRoaXMsIFwibGFzdERyYWdJZFwiKTtcbiAgICBMKHRoaXMsIFwibGFzdHRhcmdJZFwiKTtcbiAgICBMKHRoaXMsIFwibGFzdHRhcmdSb3dJZFwiKTtcbiAgICB0aGlzLmRhdGEgPSBlLCB0aGlzLnN0YXRlID0gdCwgdGhpcy5sYXllckFjdGl2ZSA9IHQuZWRpdExheW91dF8wMztcbiAgfVxuICBpbm5lclN3aXRjaEl0ZW0oZSwgdCwgaSkge1xuICAgIGxldCBzLCBhLCBsLCByLCBvLCBkO1xuICAgIGlmIChbcywgYSwgbF0gPSB0aGlzLmZpbmRJbmRleHNPZklEKHQpLCBbciwgbywgZF0gPSB0aGlzLmZpbmRJbmRleHNPZklEKGkpLCBzID09IC0xIHx8IHIgPT0gLTEgfHwgYSA9PSAtMSB8fCBvID09IC0xIHx8IGwgPT0gLTEgfHwgZCA9PSAtMSlcbiAgICAgIHJldHVybjtcbiAgICBjb25zdCB1ID0gZS5kYXRhW3NdLmRhdGFbYV0uZGF0YVtsXSwgXyA9IGUuZGF0YVtyXS5kYXRhW29dLmRhdGFbZF07XG4gICAgZS5kYXRhW3NdLmRhdGFbYV0uZGF0YVtsXSA9IF8sIGUuZGF0YVtyXS5kYXRhW29dLmRhdGFbZF0gPSB1O1xuICB9XG4gIGlubmVyTW92ZUl0ZW0oZSwgdCwgaSkge1xuICAgIGxldCBzLCBhLCBsLCByLCBvO1xuICAgIGlmIChbcywgYSwgbF0gPSB0aGlzLmZpbmRJbmRleHNPZklEKHQpLCBbciwgb10gPSB0aGlzLmZpbmRDb2x1bW5JbmRleHNPZklEKGkpLCBzID09IC0xIHx8IHIgPT0gLTEgfHwgYSA9PSAtMSB8fCBvID09IC0xIHx8IGwgPT0gLTEgfHwgcyA9PSByICYmIGEgPT0gbylcbiAgICAgIHJldHVybjtcbiAgICBsZXQgZCA9IGUuZGF0YVtzXS5kYXRhW2FdLmRhdGEuc3BsaWNlKGwsIDEpWzBdO1xuICAgIGUuZGF0YVtyXS5kYXRhW29dLmRhdGEucHVzaChkKTtcbiAgfVxuICBtb3ZlUm93SXRlbSgpIHtcbiAgICB0aGlzLmlzRHJhZ2dpbmcgJiYgKCF0aGlzLmRyYWdJRCB8fCB0aGlzLnRhcmdldElEID09IHRoaXMuZHJhZ0lEIHx8IHRoaXMudGFyZ2V0Um93SWQgJiYgdGhpcy5kYXRhLnVwZGF0ZSgoZSkgPT4gKHRoaXMudGFyZ2V0Um93SWQgJiYgdGhpcy5pbm5lck1vdmVJdGVtKGUsIHRoaXMuZHJhZ0lELCB0aGlzLnRhcmdldFJvd0lkKSwgdGhpcy5sYXN0RHJhZ0lkID0gdGhpcy5kcmFnSUQsIHRoaXMubGFzdHRhcmdJZCA9IHRoaXMudGFyZ2V0SUQsIHRoaXMubGFzdHRhcmdSb3dJZCA9IG51bGwsIHRoaXMucGF1c2VEcmFnZyA9ICEwLCBzZXRUaW1lb3V0KFxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLnBhdXNlRHJhZ2cgPSAhMTtcbiAgICAgIH0sXG4gICAgICBVZVxuICAgICksIGUpKSk7XG4gIH1cbiAgcmVxdWVzdE1vdmVJdGVtVXBEb3duKGUsIHQpIHtcbiAgICB0aGlzLmRhdGEudXBkYXRlKChpKSA9PiB7XG4gICAgICBsZXQgcywgYSwgbDtcbiAgICAgIFtzLCBhLCBsXSA9IHRoaXMuZmluZEluZGV4c09mSUQodCk7XG4gICAgICBsZXQgciA9IGwgKyBlO1xuICAgICAgaWYgKHIgPCAwKVxuICAgICAgICByZXR1cm47XG4gICAgICBpZiAoaS5kYXRhW3NdLmRhdGFbYV0uZGF0YS5sZW5ndGggLSAxIDwgcilcbiAgICAgICAgcmV0dXJuIGNvbnNvbGUuZXJyb3IoXCJPdXQgb2YgQm91bmRzIG1vdmUsIHNvIGRpZCBub3QgYXR0ZW1wdFwiKSwgaTtcbiAgICAgIGNvbnN0IG8gPSBpLmRhdGFbc10uZGF0YVthXS5kYXRhLnNwbGljZShsLCAxKVswXTtcbiAgICAgIHJldHVybiBpLmRhdGFbc10uZGF0YVthXS5kYXRhLnNwbGljZShyLCAwLCBvKSwgdGhpcy5wYXVzZURyYWdnID0gITAsIHNldFRpbWVvdXQoXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICB0aGlzLnBhdXNlRHJhZ2cgPSAhMTtcbiAgICAgICAgfSxcbiAgICAgICAgVWVcbiAgICAgICksIGk7XG4gICAgfSk7XG4gIH1cbiAgb25EcmFnU3RhcnQoZSwgdCkge1xuICAgIGlmICghZWUodGhpcy5sYXllckFjdGl2ZSkpXG4gICAgICByZXR1cm47XG4gICAgY29uc3QgaSA9IGUudGFyZ2V0O1xuICAgIGkuY2xhc3NMaXN0LmNvbnRhaW5zKFwiSXRlbVwiKSAmJiAodGhpcy5kcmFnVGFyZ2V0RWxlbWVudCA9IGksIHRoaXMuaXNEcmFnZ2luZyA9ICEwLCB0aGlzLmRyYWdJRCA9IHQsIHRoaXMubGFzdERyYWdJZCA9IG51bGwsIHRoaXMubGFzdHRhcmdJZCA9IG51bGwsIGkuc2V0QXR0cmlidXRlKFwiZGF0YS1kcmFnZ2luZ1wiLCBcInRydWVcIikpO1xuICB9XG4gIG9uRHJhZ092ZXJDb2x1bW4oZSwgdCkge1xuICAgIHZhciBpO1xuICAgIGVlKHRoaXMubGF5ZXJBY3RpdmUpICYmICghdGhpcy5pc0RyYWdnaW5nIHx8IHRoaXMucGF1c2VEcmFnZyB8fCAodGhpcy50YXJnZXRJRCA9IG51bGwsIHRoaXMudGFyZ2V0Um93SWQgPSB0LCB0aGlzLm1vdmVSb3dJdGVtKCksIChpID0gdGhpcy5kcmFnVGFyZ2V0RWxlbWVudCkgPT0gbnVsbCB8fCBpLnNldEF0dHJpYnV0ZShcImRhdGEtZHJhZ2dpbmdcIiwgXCJ0cnVlXCIpKSk7XG4gIH1cbiAgb25EcmFnRW5kKGUsIHQpIHtcbiAgICB2YXIgaTtcbiAgICBlZSh0aGlzLmxheWVyQWN0aXZlKSAmJiAodGhpcy5pc0RyYWdnaW5nID0gITEsIHRoaXMuZHJhZ0lEID0gbnVsbCwgdGhpcy50YXJnZXRJRCA9IG51bGwsIGUudGFyZ2V0LnNldEF0dHJpYnV0ZShcImRhdGEtZHJhZ2dpbmdcIiwgXCJmYWxzZVwiKSwgKGkgPSB0aGlzLmRyYWdUYXJnZXRFbGVtZW50KSA9PSBudWxsIHx8IGkuc2V0QXR0cmlidXRlKFwiZGF0YS1kcmFnZ2luZ1wiLCBcImZhbHNlXCIpKTtcbiAgfVxuICBvbkxlYXZlKGUsIHQpIHtcbiAgICB0aGlzLnRhcmdldElEID0gbnVsbDtcbiAgfVxuICBmaW5kSW5kZXhzT2ZJRChlKSB7XG4gICAgbGV0IHQgPSAtMSwgaSA9IC0xLCBzID0gLTE7XG4gICAgcmV0dXJuIHMgPSBlZSh0aGlzLmRhdGEpLmRhdGEuZmluZEluZGV4KChsKSA9PiB7XG4gICAgICBsZXQgciA9IGwuZGF0YS5maW5kSW5kZXgoKG8pID0+IHtcbiAgICAgICAgbGV0IGQgPSBvLmRhdGEuZmluZEluZGV4KCh1KSA9PiB1LmlkID09IGUpO1xuICAgICAgICByZXR1cm4gZCAhPSAtMSA/ICh0ID0gZCwgITApIDogITE7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByICE9IC0xID8gKGkgPSByLCAhMCkgOiAhMTtcbiAgICB9KSwgW3MsIGksIHRdO1xuICB9XG4gIGZpbmRDb2x1bW5JbmRleHNPZklEKGUpIHtcbiAgICBsZXQgdCA9IC0xLCBpID0gLTE7XG4gICAgcmV0dXJuIGkgPSBlZSh0aGlzLmRhdGEpLmRhdGEuZmluZEluZGV4KChhKSA9PiB7XG4gICAgICBsZXQgbCA9IGEuZGF0YS5maW5kSW5kZXgoKHIpID0+IHIuaWQgPT0gZSk7XG4gICAgICByZXR1cm4gbCAhPSAtMSA/ICh0ID0gbCwgITApIDogITE7XG4gICAgfSksIFtpLCB0XTtcbiAgfVxuICBpc0JlaW5nRHJhZ2dlZChlKSB7XG4gICAgcmV0dXJuIHRoaXMuZHJhZ0lEID09IGU7XG4gIH1cbn1cbmNsYXNzIExpIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgTCh0aGlzLCBcImVkaXRNb2RlXCIsIE9lKCExKSk7XG4gICAgTCh0aGlzLCBcImVkaXRMYXlvdXRfMDFcIiwgT2UoITEpKTtcbiAgICBMKHRoaXMsIFwiZWRpdExheW91dF8wMlwiLCBPZSghMSkpO1xuICAgIEwodGhpcywgXCJlZGl0TGF5b3V0XzAzXCIsIE9lKCExKSk7XG4gICAgdGhpcy5lZGl0TW9kZS5zdWJzY3JpYmUoKGUpID0+IHtcbiAgICAgIGUgJiYgKHRoaXMuZWRpdExheW91dF8wMS5zZXQoITEpLCB0aGlzLmVkaXRMYXlvdXRfMDIuc2V0KCExKSwgdGhpcy5lZGl0TGF5b3V0XzAzLnNldCghMSkpO1xuICAgIH0pLCB0aGlzLmVkaXRMYXlvdXRfMDEuc3Vic2NyaWJlKChlKSA9PiB7XG4gICAgICBlICYmICh0aGlzLmVkaXRMYXlvdXRfMDIuc2V0KCExKSwgdGhpcy5lZGl0TGF5b3V0XzAzLnNldCghMSksIHRoaXMuZWRpdE1vZGUuc2V0KCExKSk7XG4gICAgfSksIHRoaXMuZWRpdExheW91dF8wMi5zdWJzY3JpYmUoKGUpID0+IHtcbiAgICAgIGUgJiYgKHRoaXMuZWRpdExheW91dF8wMS5zZXQoITEpLCB0aGlzLmVkaXRMYXlvdXRfMDMuc2V0KCExKSwgdGhpcy5lZGl0TW9kZS5zZXQoITEpKTtcbiAgICB9KSwgdGhpcy5lZGl0TGF5b3V0XzAzLnN1YnNjcmliZSgoZSkgPT4ge1xuICAgICAgZSAmJiAodGhpcy5lZGl0TGF5b3V0XzAxLnNldCghMSksIHRoaXMuZWRpdExheW91dF8wMi5zZXQoITEpLCB0aGlzLmVkaXRNb2RlLnNldCghMSkpO1xuICAgIH0pO1xuICB9XG59XG5mdW5jdGlvbiBQdChuLCBlLCB0ID0gXCIgXCIpIHtcbiAgbGV0IGkgPSBlO1xuICBmb3IgKGxldCBzID0gMDsgcyA8IG4gLSAxOyBzKyspXG4gICAgaSArPSB0LCBpICs9IGU7XG4gIHJldHVybiBpO1xufVxuY29uc3QgRWkgPSAobikgPT4ge1xuICBuLnByZXZlbnREZWZhdWx0KCk7XG59O1xuZnVuY3Rpb24gQWkobiwgZSwgdCkge1xuICBsZXQgaSwgcywgYSwgbCwgciwgbyA9IG5ldyBMaSgpLCBkID0gby5lZGl0TW9kZTtcbiAgU2UobiwgZCwgKEkpID0+IHQoMSwgaSA9IEkpKTtcbiAgbGV0IHUgPSBvLmVkaXRMYXlvdXRfMDE7XG4gIFNlKG4sIHUsIChJKSA9PiB0KDIsIHMgPSBJKSk7XG4gIGxldCBfID0gby5lZGl0TGF5b3V0XzAyO1xuICBTZShuLCBfLCAoSSkgPT4gdCgzLCBhID0gSSkpO1xuICBsZXQgZiA9IG8uZWRpdExheW91dF8wMztcbiAgU2UobiwgZiwgKEkpID0+IHQoNCwgbCA9IEkpKTtcbiAgbGV0IHsgdGV4dERhdGE6IGggfSA9IGUsIHsgc3lzOiBjIH0gPSBlLCB5ID0gT2UobmV3IEZuKEpTT04ucGFyc2UoaCkuZGF0YSkpO1xuICBTZShuLCB5LCAoSSkgPT4gdCg1LCByID0gSSkpO1xuICBmdW5jdGlvbiBwKEksIFYpIHtcbiAgICBtLnJlcXVlc3RNb3ZlSXRlbVVwRG93bihJLCBWKTtcbiAgfVxuICBsZXQgdiA9IG5ldyBNaSh5LCBvKSwgQyA9IG5ldyBPaSh5LCBvKSwgbSA9IG5ldyBDaSh5LCBvKTtcbiAgY29uc3QgUyA9ICgpID0+IGQuc2V0KCFpKSwgRCA9ICgpID0+IHUuc2V0KCFlZSh1KSksIEEgPSAoKSA9PiBfLnNldCghZWUoXykpLCBIID0gKCkgPT4gZi5zZXQoIWVlKGYpKSwgSiA9IChJKSA9PiB7XG4gICAgSS5hZGRDb2x1bW4oKSwgeS51cGRhdGUoKFYpID0+IFYpO1xuICB9LCBNID0gKEkpID0+IHtcbiAgICB5LnVwZGF0ZSgoVikgPT4gKFYucmVtUm93KEkuaWQpLCBWKSk7XG4gIH0sIHcgPSAoSSwgVikgPT4ge1xuICAgIEkucmVtQ29sdW1uKFYuaWQpLCB5LnVwZGF0ZSgoRmUpID0+IEZlKTtcbiAgfSwgRiA9IChJKSA9PiB7XG4gICAgSS5hZGRJdGVtKCksIHkudXBkYXRlKChWKSA9PiBWKTtcbiAgfSwgWiA9IChJLCBWKSA9PiB7XG4gICAgSS5yZW1JdGVtKFYuaWQpLCB5LnVwZGF0ZSgoRmUpID0+IEZlKTtcbiAgfSwgeCA9IChJKSA9PiB7XG4gICAgcCgtMSwgSS5kZXRhaWwpO1xuICB9LCBPID0gKEkpID0+IHtcbiAgICBwKDEsIEkuZGV0YWlsKTtcbiAgfSwgayA9IChJLCBWKSA9PiB7XG4gICAgbS5vbkRyYWdTdGFydChWLCBJLmlkKTtcbiAgfSwgVCA9IChJLCBWKSA9PiB7XG4gICAgbS5vbkRyYWdFbmQoViwgSS5pZCk7XG4gIH0sIHEgPSAoSSwgVikgPT4ge1xuICAgIG0ub25EcmFnRW5kKFYsIEkuaWQpO1xuICB9LCBkbiA9IChJLCBWKSA9PiB7XG4gICAgbS5vbkxlYXZlKFYsIEkuaWQpO1xuICB9LCB1biA9IChJLCBWKSA9PiB7XG4gICAgQy5vbkRyYWdTdGFydChWLCBJLmlkKTtcbiAgfSwgZm4gPSAoSSwgVikgPT4ge1xuICAgIEMub25EcmFnT3ZlcihWLCBJLmlkKSwgbS5vbkRyYWdPdmVyQ29sdW1uKFYsIEkuaWQpO1xuICB9LCBjbiA9IChJLCBWKSA9PiB7XG4gICAgQy5vbkRyYWdFbmQoViwgSS5pZCk7XG4gIH0sIGhuID0gKEksIFYpID0+IHtcbiAgICBDLm9uRHJhZ0VuZChWLCBJLmlkKTtcbiAgfSwgZ24gPSAoSSwgVikgPT4ge1xuICAgIEMub25MZWF2ZShWLCBJLmlkKTtcbiAgfSwgX24gPSAoSSwgVikgPT4ge1xuICAgIEMub25EcmFnT3ZlcihWLCBJLmlkKSwgbS5vbkRyYWdPdmVyQ29sdW1uKFYsIEkuaWQpLCBWLnByZXZlbnREZWZhdWx0KCk7XG4gIH0sIG1uID0gKEksIFYpID0+IHYub25EcmFnU3RhcnQoViwgSS5pZCksIHBuID0gKEksIFYpID0+IHYub25EcmFnT3ZlcihWLCBJLmlkKSwgdm4gPSAoSSwgVikgPT4gdi5vbkRyYWdFbmQoViwgSS5pZCksIHluID0gKEksIFYpID0+IHtcbiAgICB2Lm9uRHJhZ092ZXIoViwgSS5pZCksIFYucHJldmVudERlZmF1bHQoKTtcbiAgfSwgYm4gPSAoKSA9PiB7XG4gICAgeS51cGRhdGUoKEkpID0+IChJLmFkZFJvdygpLCBJLmRhdGFbci5kYXRhLmxlbmd0aCAtIDFdLmFkZENvbHVtbigpLCBJKSk7XG4gIH07XG4gIHJldHVybiBuLiQkc2V0ID0gKEkpID0+IHtcbiAgICBcInRleHREYXRhXCIgaW4gSSAmJiB0KDE1LCBoID0gSS50ZXh0RGF0YSksIFwic3lzXCIgaW4gSSAmJiB0KDAsIGMgPSBJLnN5cyk7XG4gIH0sIFtcbiAgICBjLFxuICAgIGksXG4gICAgcyxcbiAgICBhLFxuICAgIGwsXG4gICAgcixcbiAgICBkLFxuICAgIHUsXG4gICAgXyxcbiAgICBmLFxuICAgIHksXG4gICAgcCxcbiAgICB2LFxuICAgIEMsXG4gICAgbSxcbiAgICBoLFxuICAgIFMsXG4gICAgRCxcbiAgICBBLFxuICAgIEgsXG4gICAgSixcbiAgICBNLFxuICAgIHcsXG4gICAgRixcbiAgICBaLFxuICAgIHgsXG4gICAgTyxcbiAgICBrLFxuICAgIFQsXG4gICAgcSxcbiAgICBkbixcbiAgICB1bixcbiAgICBmbixcbiAgICBjbixcbiAgICBobixcbiAgICBnbixcbiAgICBfbixcbiAgICBtbixcbiAgICBwbixcbiAgICB2bixcbiAgICB5bixcbiAgICBiblxuICBdO1xufVxuY2xhc3MgUmkgZXh0ZW5kcyBvZSB7XG4gIGNvbnN0cnVjdG9yKGUpIHtcbiAgICBzdXBlcigpLCBsZSh0aGlzLCBlLCBBaSwgU2ksIHRlLCB7IHRleHREYXRhOiAxNSwgc3lzOiAwIH0sIG51bGwsIFstMSwgLTFdKTtcbiAgfVxuICBnZXQgdGV4dERhdGEoKSB7XG4gICAgcmV0dXJuIHRoaXMuJCQuY3R4WzE1XTtcbiAgfVxuICBzZXQgdGV4dERhdGEoZSkge1xuICAgIHRoaXMuJCRzZXQoeyB0ZXh0RGF0YTogZSB9KSwgRSgpO1xuICB9XG4gIGdldCBzeXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuJCQuY3R4WzBdO1xuICB9XG4gIHNldCBzeXMoZSkge1xuICAgIHRoaXMuJCRzZXQoeyBzeXM6IGUgfSksIEUoKTtcbiAgfVxufVxucmUoUmksIHsgdGV4dERhdGE6IHt9LCBzeXM6IHt9IH0sIFtdLCBbXSwgITApO1xuZXhwb3J0IHtcbiAgUmkgYXMgZGVmYXVsdFxufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWNvbXBvbmVudHMuanMubWFwXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJLEtBQUssT0FBTztBQUNoQixJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUcsTUFBTSxLQUFLLElBQUksR0FBRyxHQUFHLEdBQUcsRUFBRSxZQUFZLE1BQUksY0FBYyxNQUFJLFVBQVUsTUFBSSxPQUFPLEVBQUMsQ0FBRSxJQUFJLEVBQUUsS0FBSztBQUMvRyxJQUFJLElBQUksQ0FBQyxHQUFHLEdBQUcsT0FBTyxHQUFHLEdBQUcsT0FBTyxLQUFLLFdBQVcsSUFBSSxLQUFLLEdBQUcsQ0FBQyxHQUFHO0FBQ25FLFNBQVMsSUFBSTtBQUNiO0FBQ0EsTUFBTSxLQUFLLENBQUMsTUFBTTtBQUNsQixTQUFTLEdBQUcsR0FBRztBQUNiLFNBQU8sRUFBQztBQUNWO0FBQ0EsU0FBUyxLQUFLO0FBQ1osU0FBdUIsdUJBQU8sT0FBTyxJQUFJO0FBQzNDO0FBQ0EsU0FBUyxFQUFFLEdBQUc7QUFDWixJQUFFLFFBQVEsRUFBRTtBQUNkO0FBQ0EsU0FBUyxHQUFHLEdBQUc7QUFDYixTQUFPLE9BQU8sS0FBSztBQUNyQjtBQUNBLFNBQVMsR0FBRyxHQUFHLEdBQUc7QUFDaEIsU0FBTyxLQUFLLElBQUksS0FBSyxJQUFJLE1BQU0sS0FBSyxLQUFLLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSztBQUMvRTtBQUNBLFNBQVMsR0FBRyxHQUFHO0FBQ2IsU0FBTyxPQUFPLEtBQUssQ0FBQyxFQUFFLFdBQVc7QUFDbkM7QUFDQSxTQUFTLEdB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QUksRUFBQyxHQUFJLEtBQUssRUFBRTtJQUNoRTtBQUFBLElBQ0QsRUFBRSxHQUFHLEdBQUc7QUFDTixRQUFFLEdBQUcsR0FBRyxDQUFDLEdBQUcsS0FBSyxFQUFFLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxLQUFLLEVBQUUsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxJQUFJO0FBQUEsSUFDaEc7QUFBQSxJQUNELEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRztBQUVSLFFBQUUsS0FBSyxLQUFLLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxJQUN2QixLQUFLLEVBQUUsR0FBRyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUcsR0FBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLENBQUMsS0FBSyxNQUFNLEdBQUUsR0FBSSxFQUFFLEdBQUcsR0FBRyxHQUFHLE1BQU07QUFDcEYsWUFBSTtBQUFBLE1BQ1osQ0FBTyxHQUFHLEdBQUUsSUFDTixFQUFFLE1BQU0sSUFBSSxLQUFLLEVBQUUsRUFBRSxHQUFHLENBQUMsR0FBRyxJQUM1QixLQUFLLEVBQUUsR0FBRyxDQUFDLE1BQU0sSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUcsR0FBRSxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLENBQUMsS0FBSyxNQUFNLEdBQUUsR0FBSSxFQUFFLEdBQUcsR0FBRyxHQUFHLE1BQU07QUFDcEYsWUFBSTtBQUFBLE1BQ1osQ0FBTyxHQUFHLEdBQUU7QUFDTixVQUFJLElBQUk7QUFDUixVQUFJLEVBQUUsQ0FBQyxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEtBQUssTUFBTSxNQUFNLEVBQUUsRUFBRSxJQUFJLEdBQUcsR0FBRyxNQUFNO0FBQ3hFLFVBQUUsS0FBSztBQUFBLE1BQ2YsQ0FBTyxHQUFHLEdBQUUsSUFBSyxDQUFDLEtBQUssSUFBSSxFQUFFLElBQUksSUFBSSxFQUFFLEVBQUUsR0FBRyxDQUFDLEtBQUssSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUcsSUFBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxHQUFHLElBQUksS0FBSyxJQUFJO0FBQUEsSUFDdEc7QUFBQSxJQUNELEVBQUUsR0FBRztBQUNILFlBQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsSUFBSTtBQUFBLElBQzdCO0FBQUEsSUFDRCxFQUFFLEdBQUc7QUFDSCxRQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxJQUFJO0FBQUEsSUFDdkI7QUFBQSxJQUNELEVBQUUsR0FBRztBQUNILFdBQUssRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLEtBQUssS0FBSyxFQUFFLEVBQUcsR0FBRSxDQUFDLEtBQUssRUFBRSxHQUFHO0lBQy9DO0FBQUEsRUFDTDtBQUNBO0FBQ0EsU0FBUyxHQUFHLEdBQUcsR0FBRyxHQUFHO0FBQ25CLE1BQUksRUFBRSxNQUFNLEVBQUcsSUFBRyxHQUFHLEVBQUUsVUFBVSxFQUFDLElBQUssR0FBRyxFQUFFLEtBQUssRUFBRyxJQUFHLEdBQUcsRUFBRSxRQUFRLEVBQUMsSUFBSyxHQUFHLEVBQUUsT0FBTyxFQUFHLElBQUcsR0FBRyxFQUFFLFlBQVksSUFBSSxNQUFFLElBQUs7QUFDeEgsV0FBUyxJQUFJO0FBQ1gsTUFBRSxHQUFHLENBQUM7QUFBQSxFQUNQO0FBQ0QsV0FBUyxFQUFFLEdBQUc7QUFDWixRQUFJLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFBQSxFQUNkO0FBQ0QsV0FBUyxFQUFFLEdBQUc7QUFDWixRQUFJLEdBQUcsRUFBRSxHQUFHLENBQUM7QUFBQSxFQUNkO0FBQ0QsV0FBUyxFQUFFLEdBQUc7QUFDWixPQUFHLEtBQUssTUFBTSxHQUFHLENBQUM7QUFBQSxFQUNu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
