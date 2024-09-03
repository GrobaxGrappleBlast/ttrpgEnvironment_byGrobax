(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, global["<<name>>"] = factory());
})(this, function() {
  "use strict";var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  function noop() {
  }
  const identity = (x) => x;
  function run(fn) {
    return fn();
  }
  function blank_object() {
    return /* @__PURE__ */ Object.create(null);
  }
  function run_all(fns) {
    fns.forEach(run);
  }
  function is_function(thing) {
    return typeof thing === "function";
  }
  function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || a && typeof a === "object" || typeof a === "function";
  }
  function is_empty(obj) {
    return Object.keys(obj).length === 0;
  }
  function subscribe(store, ...callbacks) {
    if (store == null) {
      for (const callback of callbacks) {
        callback(void 0);
      }
      return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
  }
  function get_store_value(store) {
    let value;
    subscribe(store, (_) => value = _)();
    return value;
  }
  function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
  }
  function split_css_unit(value) {
    const split = typeof value === "string" && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
    return split ? [parseFloat(split[1]), split[2] || "px"] : [
      /** @type {number} */
      value,
      "px"
    ];
  }
  const is_client = typeof window !== "undefined";
  let now = is_client ? () => window.performance.now() : () => Date.now();
  let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;
  const tasks = /* @__PURE__ */ new Set();
  function run_tasks(now2) {
    tasks.forEach((task) => {
      if (!task.c(now2)) {
        tasks.delete(task);
        task.f();
      }
    });
    if (tasks.size !== 0) raf(run_tasks);
  }
  function loop(callback) {
    let task;
    if (tasks.size === 0) raf(run_tasks);
    return {
      promise: new Promise((fulfill) => {
        tasks.add(task = { c: callback, f: fulfill });
      }),
      abort() {
        tasks.delete(task);
      }
    };
  }
  function append(target, node) {
    target.appendChild(node);
  }
  function get_root_for_style(node) {
    if (!node) return document;
    const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
    if (root && /** @type {ShadowRoot} */
    root.host) {
      return (
        /** @type {ShadowRoot} */
        root
      );
    }
    return node.ownerDocument;
  }
  function append_empty_stylesheet(node) {
    const style_element = element("style");
    style_element.textContent = "/* empty */";
    append_stylesheet(get_root_for_style(node), style_element);
    return style_element.sheet;
  }
  function append_stylesheet(node, style) {
    append(
      /** @type {Document} */
      node.head || node,
      style
    );
    return style.sheet;
  }
  function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
  }
  function detach(node) {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }
  function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
      if (iterations[i]) iterations[i].d(detaching);
    }
  }
  function element(name2) {
    return document.createElement(name2);
  }
  function text(data) {
    return document.createTextNode(data);
  }
  function space() {
    return text(" ");
  }
  function empty() {
    return text("");
  }
  function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
  }
  function attr(node, attribute, value) {
    if (value == null) node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
  }
  function to_number(value) {
    return value === "" ? null : +value;
  }
  function children(element2) {
    return Array.from(element2.childNodes);
  }
  function set_data(text2, data) {
    data = "" + data;
    if (text2.data === data) return;
    text2.data = /** @type {string} */
    data;
  }
  function set_input_value(input, value) {
    input.value = value == null ? "" : value;
  }
  function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
    return new CustomEvent(type, { detail, bubbles, cancelable });
  }
  function get_custom_elements_slots(element2) {
    const result = {};
    element2.childNodes.forEach(
      /** @param {Element} node */
      (node) => {
        result[node.slot || "default"] = true;
      }
    );
    return result;
  }
  const managed_styles = /* @__PURE__ */ new Map();
  let active = 0;
  function hash(str) {
    let hash2 = 5381;
    let i = str.length;
    while (i--) hash2 = (hash2 << 5) - hash2 ^ str.charCodeAt(i);
    return hash2 >>> 0;
  }
  function create_style_information(doc, node) {
    const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
    managed_styles.set(doc, info);
    return info;
  }
  function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
    const step = 16.666 / duration;
    let keyframes = "{\n";
    for (let p = 0; p <= 1; p += step) {
      const t = a + (b - a) * ease(p);
      keyframes += p * 100 + `%{${fn(t, 1 - t)}}
`;
    }
    const rule = keyframes + `100% {${fn(b, 1 - b)}}
}`;
    const name2 = `__svelte_${hash(rule)}_${uid}`;
    const doc = get_root_for_style(node);
    const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
    if (!rules[name2]) {
      rules[name2] = true;
      stylesheet.insertRule(`@keyframes ${name2} ${rule}`, stylesheet.cssRules.length);
    }
    const animation = node.style.animation || "";
    node.style.animation = `${animation ? `${animation}, ` : ""}${name2} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name2;
  }
  function delete_rule(node, name2) {
    const previous = (node.style.animation || "").split(", ");
    const next = previous.filter(
      name2 ? (anim) => anim.indexOf(name2) < 0 : (anim) => anim.indexOf("__svelte") === -1
      // remove all Svelte animations
    );
    const deleted = previous.length - next.length;
    if (deleted) {
      node.style.animation = next.join(", ");
      active -= deleted;
      if (!active) clear_rules();
    }
  }
  function clear_rules() {
    raf(() => {
      if (active) return;
      managed_styles.forEach((info) => {
        const { ownerNode } = info.stylesheet;
        if (ownerNode) detach(ownerNode);
      });
      managed_styles.clear();
    });
  }
  function create_animation(node, from, fn, params) {
    if (!from) return noop;
    const to = node.getBoundingClientRect();
    if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
      return noop;
    const {
      delay = 0,
      duration = 300,
      easing = identity,
      // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
      start: start_time = now() + delay,
      // @ts-ignore todo:
      end = start_time + duration,
      tick = noop,
      css
    } = fn(node, { from, to }, params);
    let running = true;
    let started = false;
    let name2;
    function start() {
      if (css) {
        name2 = create_rule(node, 0, 1, duration, delay, easing, css);
      }
      if (!delay) {
        started = true;
      }
    }
    function stop() {
      if (css) delete_rule(node, name2);
      running = false;
    }
    loop((now2) => {
      if (!started && now2 >= start_time) {
        started = true;
      }
      if (started && now2 >= end) {
        tick(1, 0);
        stop();
      }
      if (!running) {
        return false;
      }
      if (started) {
        const p = now2 - start_time;
        const t = 0 + 1 * easing(p / duration);
        tick(t, 1 - t);
      }
      return true;
    });
    start();
    tick(0, 1);
    return stop;
  }
  function fix_position(node) {
    const style = getComputedStyle(node);
    if (style.position !== "absolute" && style.position !== "fixed") {
      const { width, height } = style;
      const a = node.getBoundingClientRect();
      node.style.position = "absolute";
      node.style.width = width;
      node.style.height = height;
      add_transform(node, a);
    }
  }
  function add_transform(node, a) {
    const b = node.getBoundingClientRect();
    if (a.left !== b.left || a.top !== b.top) {
      const style = getComputedStyle(node);
      const transform = style.transform === "none" ? "" : style.transform;
      node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
    }
  }
  let current_component;
  function set_current_component(component) {
    current_component = component;
  }
  function get_current_component() {
    if (!current_component) throw new Error("Function called outside component initialization");
    return current_component;
  }
  function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
  }
  function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
  }
  function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail, { cancelable = false } = {}) => {
      const callbacks = component.$$.callbacks[type];
      if (callbacks) {
        const event = custom_event(
          /** @type {string} */
          type,
          detail,
          { cancelable }
        );
        callbacks.slice().forEach((fn) => {
          fn.call(component, event);
        });
        return !event.defaultPrevented;
      }
      return true;
    };
  }
  function bubble(component, event) {
    const callbacks = component.$$.callbacks[event.type];
    if (callbacks) {
      callbacks.slice().forEach((fn) => fn.call(this, event));
    }
  }
  const dirty_components = [];
  const binding_callbacks = [];
  let render_callbacks = [];
  const flush_callbacks = [];
  const resolved_promise = /* @__PURE__ */ Promise.resolve();
  let update_scheduled = false;
  function schedule_update() {
    if (!update_scheduled) {
      update_scheduled = true;
      resolved_promise.then(flush);
    }
  }
  function add_render_callback(fn) {
    render_callbacks.push(fn);
  }
  function add_flush_callback(fn) {
    flush_callbacks.push(fn);
  }
  const seen_callbacks = /* @__PURE__ */ new Set();
  let flushidx = 0;
  function flush() {
    if (flushidx !== 0) {
      return;
    }
    const saved_component = current_component;
    do {
      try {
        while (flushidx < dirty_components.length) {
          const component = dirty_components[flushidx];
          flushidx++;
          set_current_component(component);
          update(component.$$);
        }
      } catch (e) {
        dirty_components.length = 0;
        flushidx = 0;
        throw e;
      }
      set_current_component(null);
      dirty_components.length = 0;
      flushidx = 0;
      while (binding_callbacks.length) binding_callbacks.pop()();
      for (let i = 0; i < render_callbacks.length; i += 1) {
        const callback = render_callbacks[i];
        if (!seen_callbacks.has(callback)) {
          seen_callbacks.add(callback);
          callback();
        }
      }
      render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
      flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
  }
  function update($$) {
    if ($$.fragment !== null) {
      $$.update();
      run_all($$.before_update);
      const dirty = $$.dirty;
      $$.dirty = [-1];
      $$.fragment && $$.fragment.p($$.ctx, dirty);
      $$.after_update.forEach(add_render_callback);
    }
  }
  function flush_render_callbacks(fns) {
    const filtered = [];
    const targets = [];
    render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
    targets.forEach((c) => c());
    render_callbacks = filtered;
  }
  let promise;
  function wait() {
    if (!promise) {
      promise = Promise.resolve();
      promise.then(() => {
        promise = null;
      });
    }
    return promise;
  }
  function dispatch(node, direction, kind) {
    node.dispatchEvent(custom_event(`${direction ? "intro" : "outro"}${kind}`));
  }
  const outroing = /* @__PURE__ */ new Set();
  let outros;
  function group_outros() {
    outros = {
      r: 0,
      c: [],
      p: outros
      // parent group
    };
  }
  function check_outros() {
    if (!outros.r) {
      run_all(outros.c);
    }
    outros = outros.p;
  }
  function transition_in(block, local) {
    if (block && block.i) {
      outroing.delete(block);
      block.i(local);
    }
  }
  function transition_out(block, local, detach2, callback) {
    if (block && block.o) {
      if (outroing.has(block)) return;
      outroing.add(block);
      outros.c.push(() => {
        outroing.delete(block);
        if (callback) {
          if (detach2) block.d(1);
          callback();
        }
      });
      block.o(local);
    } else if (callback) {
      callback();
    }
  }
  const null_transition = { duration: 0 };
  function create_bidirectional_transition(node, fn, params, intro) {
    const options = { direction: "both" };
    let config = fn(node, params, options);
    let t = intro ? 0 : 1;
    let running_program = null;
    let pending_program = null;
    let animation_name = null;
    let original_inert_value;
    function clear_animation() {
      if (animation_name) delete_rule(node, animation_name);
    }
    function init2(program, duration) {
      const d = (
        /** @type {Program['d']} */
        program.b - t
      );
      duration *= Math.abs(d);
      return {
        a: t,
        b: program.b,
        d,
        duration,
        start: program.start,
        end: program.start + duration,
        group: program.group
      };
    }
    function go(b) {
      const {
        delay = 0,
        duration = 300,
        easing = identity,
        tick = noop,
        css
      } = config || null_transition;
      const program = {
        start: now() + delay,
        b
      };
      if (!b) {
        program.group = outros;
        outros.r += 1;
      }
      if ("inert" in node) {
        if (b) {
          if (original_inert_value !== void 0) {
            node.inert = original_inert_value;
          }
        } else {
          original_inert_value = /** @type {HTMLElement} */
          node.inert;
          node.inert = true;
        }
      }
      if (running_program || pending_program) {
        pending_program = program;
      } else {
        if (css) {
          clear_animation();
          animation_name = create_rule(node, t, b, duration, delay, easing, css);
        }
        if (b) tick(0, 1);
        running_program = init2(program, duration);
        add_render_callback(() => dispatch(node, b, "start"));
        loop((now2) => {
          if (pending_program && now2 > pending_program.start) {
            running_program = init2(pending_program, duration);
            pending_program = null;
            dispatch(node, running_program.b, "start");
            if (css) {
              clear_animation();
              animation_name = create_rule(
                node,
                t,
                running_program.b,
                running_program.duration,
                0,
                easing,
                config.css
              );
            }
          }
          if (running_program) {
            if (now2 >= running_program.end) {
              tick(t = running_program.b, 1 - t);
              dispatch(node, running_program.b, "end");
              if (!pending_program) {
                if (running_program.b) {
                  clear_animation();
                } else {
                  if (!--running_program.group.r) run_all(running_program.group.c);
                }
              }
              running_program = null;
            } else if (now2 >= running_program.start) {
              const p = now2 - running_program.start;
              t = running_program.a + running_program.d * easing(p / running_program.duration);
              tick(t, 1 - t);
            }
          }
          return !!(running_program || pending_program);
        });
      }
    }
    return {
      run(b) {
        if (is_function(config)) {
          wait().then(() => {
            const opts = { direction: b ? "in" : "out" };
            config = config(opts);
            go(b);
          });
        } else {
          go(b);
        }
      },
      end() {
        clear_animation();
        running_program = pending_program = null;
      }
    };
  }
  function ensure_array_like(array_like_or_iterator) {
    return (array_like_or_iterator == null ? void 0 : array_like_or_iterator.length) !== void 0 ? array_like_or_iterator : Array.from(array_like_or_iterator);
  }
  function destroy_block(block, lookup) {
    block.d(1);
    lookup.delete(block.key);
  }
  function outro_and_destroy_block(block, lookup) {
    transition_out(block, 1, 1, () => {
      lookup.delete(block.key);
    });
  }
  function fix_and_outro_and_destroy_block(block, lookup) {
    block.f();
    outro_and_destroy_block(block, lookup);
  }
  function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block2, next, get_context) {
    let o = old_blocks.length;
    let n = list.length;
    let i = o;
    const old_indexes = {};
    while (i--) old_indexes[old_blocks[i].key] = i;
    const new_blocks = [];
    const new_lookup = /* @__PURE__ */ new Map();
    const deltas = /* @__PURE__ */ new Map();
    const updates = [];
    i = n;
    while (i--) {
      const child_ctx = get_context(ctx, list, i);
      const key = get_key(child_ctx);
      let block = lookup.get(key);
      if (!block) {
        block = create_each_block2(key, child_ctx);
        block.c();
      } else {
        updates.push(() => block.p(child_ctx, dirty));
      }
      new_lookup.set(key, new_blocks[i] = block);
      if (key in old_indexes) deltas.set(key, Math.abs(i - old_indexes[key]));
    }
    const will_move = /* @__PURE__ */ new Set();
    const did_move = /* @__PURE__ */ new Set();
    function insert2(block) {
      transition_in(block, 1);
      block.m(node, next);
      lookup.set(block.key, block);
      next = block.first;
      n--;
    }
    while (o && n) {
      const new_block = new_blocks[n - 1];
      const old_block = old_blocks[o - 1];
      const new_key = new_block.key;
      const old_key = old_block.key;
      if (new_block === old_block) {
        next = new_block.first;
        o--;
        n--;
      } else if (!new_lookup.has(old_key)) {
        destroy(old_block, lookup);
        o--;
      } else if (!lookup.has(new_key) || will_move.has(new_key)) {
        insert2(new_block);
      } else if (did_move.has(old_key)) {
        o--;
      } else if (deltas.get(new_key) > deltas.get(old_key)) {
        did_move.add(new_key);
        insert2(new_block);
      } else {
        will_move.add(old_key);
        o--;
      }
    }
    while (o--) {
      const old_block = old_blocks[o];
      if (!new_lookup.has(old_block.key)) destroy(old_block, lookup);
    }
    while (n) insert2(new_blocks[n - 1]);
    run_all(updates);
    return new_blocks;
  }
  function bind(component, name2, callback) {
    const index = component.$$.props[name2];
    if (index !== void 0) {
      component.$$.bound[index] = callback;
      callback(component.$$.ctx[index]);
    }
  }
  function create_component(block) {
    block && block.c();
  }
  function mount_component(component, target, anchor) {
    const { fragment, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    add_render_callback(() => {
      const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
      if (component.$$.on_destroy) {
        component.$$.on_destroy.push(...new_on_destroy);
      } else {
        run_all(new_on_destroy);
      }
      component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
  }
  function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
      flush_render_callbacks($$.after_update);
      run_all($$.on_destroy);
      $$.fragment && $$.fragment.d(detaching);
      $$.on_destroy = $$.fragment = null;
      $$.ctx = [];
    }
  }
  function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
      dirty_components.push(component);
      schedule_update();
      component.$$.dirty.fill(0);
    }
    component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
  }
  function init(component, options, instance2, create_fragment2, not_equal, props, append_styles = null, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
      fragment: null,
      ctx: [],
      // state
      props,
      update: noop,
      not_equal,
      bound: blank_object(),
      // lifecycle
      on_mount: [],
      on_destroy: [],
      on_disconnect: [],
      before_update: [],
      after_update: [],
      context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
      // everything else
      callbacks: blank_object(),
      dirty,
      skip_bound: false,
      root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance2 ? instance2(component, options.props || {}, (i, ret, ...rest) => {
      const value = rest.length ? rest[0] : ret;
      if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
        if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
        if (ready) make_dirty(component, i);
      }
      return ret;
    }) : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    $$.fragment = create_fragment2 ? create_fragment2($$.ctx) : false;
    if (options.target) {
      if (options.hydrate) {
        const nodes = children(options.target);
        $$.fragment && $$.fragment.l(nodes);
        nodes.forEach(detach);
      } else {
        $$.fragment && $$.fragment.c();
      }
      if (options.intro) transition_in(component.$$.fragment);
      mount_component(component, options.target, options.anchor);
      flush();
    }
    set_current_component(parent_component);
  }
  let SvelteElement;
  if (typeof HTMLElement === "function") {
    SvelteElement = class extends HTMLElement {
      constructor($$componentCtor, $$slots, use_shadow_dom) {
        super();
        /** The Svelte component constructor */
        __publicField(this, "$$ctor");
        /** Slots */
        __publicField(this, "$$s");
        /** The Svelte component instance */
        __publicField(this, "$$c");
        /** Whether or not the custom element is connected */
        __publicField(this, "$$cn", false);
        /** Component props data */
        __publicField(this, "$$d", {});
        /** `true` if currently in the process of reflecting component props back to attributes */
        __publicField(this, "$$r", false);
        /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
        __publicField(this, "$$p_d", {});
        /** @type {Record<string, Function[]>} Event listeners */
        __publicField(this, "$$l", {});
        /** @type {Map<Function, Function>} Event listener unsubscribe functions */
        __publicField(this, "$$l_u", /* @__PURE__ */ new Map());
        this.$$ctor = $$componentCtor;
        this.$$s = $$slots;
        if (use_shadow_dom) {
          this.attachShadow({ mode: "open" });
        }
      }
      addEventListener(type, listener, options) {
        this.$$l[type] = this.$$l[type] || [];
        this.$$l[type].push(listener);
        if (this.$$c) {
          const unsub = this.$$c.$on(type, listener);
          this.$$l_u.set(listener, unsub);
        }
        super.addEventListener(type, listener, options);
      }
      removeEventListener(type, listener, options) {
        super.removeEventListener(type, listener, options);
        if (this.$$c) {
          const unsub = this.$$l_u.get(listener);
          if (unsub) {
            unsub();
            this.$$l_u.delete(listener);
          }
        }
      }
      async connectedCallback() {
        this.$$cn = true;
        if (!this.$$c) {
          let create_slot = function(name2) {
            return () => {
              let node;
              const obj = {
                c: function create() {
                  node = element("slot");
                  if (name2 !== "default") {
                    attr(node, "name", name2);
                  }
                },
                /**
                 * @param {HTMLElement} target
                 * @param {HTMLElement} [anchor]
                 */
                m: function mount(target, anchor) {
                  insert(target, node, anchor);
                },
                d: function destroy(detaching) {
                  if (detaching) {
                    detach(node);
                  }
                }
              };
              return obj;
            };
          };
          await Promise.resolve();
          if (!this.$$cn || this.$$c) {
            return;
          }
          const $$slots = {};
          const existing_slots = get_custom_elements_slots(this);
          for (const name2 of this.$$s) {
            if (name2 in existing_slots) {
              $$slots[name2] = [create_slot(name2)];
            }
          }
          for (const attribute of this.attributes) {
            const name2 = this.$$g_p(attribute.name);
            if (!(name2 in this.$$d)) {
              this.$$d[name2] = get_custom_element_value(name2, attribute.value, this.$$p_d, "toProp");
            }
          }
          for (const key in this.$$p_d) {
            if (!(key in this.$$d) && this[key] !== void 0) {
              this.$$d[key] = this[key];
              delete this[key];
            }
          }
          this.$$c = new this.$$ctor({
            target: this.shadowRoot || this,
            props: {
              ...this.$$d,
              $$slots,
              $$scope: {
                ctx: []
              }
            }
          });
          const reflect_attributes = () => {
            this.$$r = true;
            for (const key in this.$$p_d) {
              this.$$d[key] = this.$$c.$$.ctx[this.$$c.$$.props[key]];
              if (this.$$p_d[key].reflect) {
                const attribute_value = get_custom_element_value(
                  key,
                  this.$$d[key],
                  this.$$p_d,
                  "toAttribute"
                );
                if (attribute_value == null) {
                  this.removeAttribute(this.$$p_d[key].attribute || key);
                } else {
                  this.setAttribute(this.$$p_d[key].attribute || key, attribute_value);
                }
              }
            }
            this.$$r = false;
          };
          this.$$c.$$.after_update.push(reflect_attributes);
          reflect_attributes();
          for (const type in this.$$l) {
            for (const listener of this.$$l[type]) {
              const unsub = this.$$c.$on(type, listener);
              this.$$l_u.set(listener, unsub);
            }
          }
          this.$$l = {};
        }
      }
      // We don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
      // and setting attributes through setAttribute etc, this is helpful
      attributeChangedCallback(attr2, _oldValue, newValue) {
        var _a;
        if (this.$$r) return;
        attr2 = this.$$g_p(attr2);
        this.$$d[attr2] = get_custom_element_value(attr2, newValue, this.$$p_d, "toProp");
        (_a = this.$$c) == null ? void 0 : _a.$set({ [attr2]: this.$$d[attr2] });
      }
      disconnectedCallback() {
        this.$$cn = false;
        Promise.resolve().then(() => {
          if (!this.$$cn && this.$$c) {
            this.$$c.$destroy();
            this.$$c = void 0;
          }
        });
      }
      $$g_p(attribute_name) {
        return Object.keys(this.$$p_d).find(
          (key) => this.$$p_d[key].attribute === attribute_name || !this.$$p_d[key].attribute && key.toLowerCase() === attribute_name
        ) || attribute_name;
      }
    };
  }
  function get_custom_element_value(prop, value, props_definition, transform) {
    var _a;
    const type = (_a = props_definition[prop]) == null ? void 0 : _a.type;
    value = type === "Boolean" && typeof value !== "boolean" ? value != null : value;
    if (!transform || !props_definition[prop]) {
      return value;
    } else if (transform === "toAttribute") {
      switch (type) {
        case "Object":
        case "Array":
          return value == null ? null : JSON.stringify(value);
        case "Boolean":
          return value ? "" : null;
        case "Number":
          return value == null ? null : value;
        default:
          return value;
      }
    } else {
      switch (type) {
        case "Object":
        case "Array":
          return value && JSON.parse(value);
        case "Boolean":
          return value;
        case "Number":
          return value != null ? +value : value;
        default:
          return value;
      }
    }
  }
  function create_custom_element(Component, props_definition, slots, accessors, use_shadow_dom, extend) {
    let Class = class extends SvelteElement {
      constructor() {
        super(Component, slots, use_shadow_dom);
        this.$$p_d = props_definition;
      }
      static get observedAttributes() {
        return Object.keys(props_definition).map(
          (key) => (props_definition[key].attribute || key).toLowerCase()
        );
      }
    };
    Object.keys(props_definition).forEach((prop) => {
      Object.defineProperty(Class.prototype, prop, {
        get() {
          return this.$$c && prop in this.$$c ? this.$$c[prop] : this.$$d[prop];
        },
        set(value) {
          var _a;
          value = get_custom_element_value(prop, value, props_definition);
          this.$$d[prop] = value;
          (_a = this.$$c) == null ? void 0 : _a.$set({ [prop]: value });
        }
      });
    });
    accessors.forEach((accessor) => {
      Object.defineProperty(Class.prototype, accessor, {
        get() {
          var _a;
          return (_a = this.$$c) == null ? void 0 : _a[accessor];
        }
      });
    });
    Component.element = /** @type {any} */
    Class;
    return Class;
  }
  class SvelteComponent {
    constructor() {
      /**
       * ### PRIVATE API
       *
       * Do not use, may change at any time
       *
       * @type {any}
       */
      __publicField(this, "$$");
      /**
       * ### PRIVATE API
       *
       * Do not use, may change at any time
       *
       * @type {any}
       */
      __publicField(this, "$$set");
    }
    /** @returns {void} */
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    /**
     * @template {Extract<keyof Events, string>} K
     * @param {K} type
     * @param {((e: Events[K]) => void) | null | undefined} callback
     * @returns {() => void}
     */
    $on(type, callback) {
      if (!is_function(callback)) {
        return noop;
      }
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1) callbacks.splice(index, 1);
      };
    }
    /**
     * @param {Partial<Props>} props
     * @returns {void}
     */
    $set(props) {
      if (this.$$set && !is_empty(props)) {
        this.$$.skip_bound = true;
        this.$$set(props);
        this.$$.skip_bound = false;
      }
    }
  }
  const PUBLIC_VERSION = "4";
  if (typeof window !== "undefined")
    (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(PUBLIC_VERSION);
  class KeyManager {
    constructor() {
      __publicField(this, "keyCounter", 0);
    }
    getNewKey() {
      let num = this.keyCounter++;
      return num.toString(16);
    }
  }
  var keyManager = new KeyManager();
  class CNode {
    constructor(type = "NONE", data = "{}") {
      __publicField(this, "id");
      __publicField(this, "type");
      __publicField(this, "data");
      this.id = keyManager.getNewKey();
      this.type = type;
      this.data = JSON.parse(data);
    }
  }
  class SheetColumn {
    constructor(data = []) {
      __publicField(this, "id");
      __publicField(this, "data", []);
      this.id = keyManager.getNewKey();
      this.data = [];
      data.forEach((d) => {
        if (d != null && d.data && d.type) {
          this.data.push(new CNode(d.type, d.data));
        } else {
          this.data.push(new CNode());
        }
      });
    }
    addItem() {
      this.data.push(new CNode());
    }
    remItem(id) {
      let i = this.data.findIndex((p) => p.id == id);
      if (i == -1) {
        console.error("cant remove column, since id is not present in data");
        return;
      }
      this.data.splice(i, 1);
    }
  }
  class SheetRow {
    constructor(data = []) {
      __publicField(this, "id");
      __publicField(this, "data", []);
      this.id = keyManager.getNewKey();
      this.data = [];
      data.forEach((d) => {
        this.data.push(new SheetColumn(d.data));
      });
    }
    addColumn() {
      this.data.push(new SheetColumn());
    }
    remColumn(id) {
      let i = this.data.findIndex((p) => p.id == id);
      if (i == -1) {
        console.error("cant remove column, since id is not present in data");
        return;
      }
      this.data.splice(i, 1);
    }
  }
  class SheetData {
    constructor(json) {
      __publicField(this, "id");
      __publicField(this, "data", []);
      if (typeof json == "string") {
        json = JSON.parse(json);
      }
      let data = json.data ?? [];
      this.id = keyManager.getNewKey();
      this.data = [];
      data.forEach((d) => {
        if (d.data)
          this.data.push(new SheetRow(d.data));
      });
    }
    addRow() {
      this.data.push(new SheetRow());
    }
    remRow(id) {
      let i = this.data.findIndex((p) => p.id == id);
      if (i == -1) {
        console.error("cant remove Row, since id is not present in data");
        return;
      }
      this.data.splice(i, 1);
    }
  }
  const subscriber_queue = [];
  function writable(value, start = noop) {
    let stop;
    const subscribers = /* @__PURE__ */ new Set();
    function set(new_value) {
      if (safe_not_equal(value, new_value)) {
        value = new_value;
        if (stop) {
          const run_queue = !subscriber_queue.length;
          for (const subscriber of subscribers) {
            subscriber[1]();
            subscriber_queue.push(subscriber, value);
          }
          if (run_queue) {
            for (let i = 0; i < subscriber_queue.length; i += 2) {
              subscriber_queue[i][0](subscriber_queue[i + 1]);
            }
            subscriber_queue.length = 0;
          }
        }
      }
    }
    function update2(fn) {
      set(fn(value));
    }
    function subscribe2(run2, invalidate = noop) {
      const subscriber = [run2, invalidate];
      subscribers.add(subscriber);
      if (subscribers.size === 1) {
        stop = start(set, update2) || noop;
      }
      run2(value);
      return () => {
        subscribers.delete(subscriber);
        if (subscribers.size === 0 && stop) {
          stop();
          stop = null;
        }
      };
    }
    return { set, update: update2, subscribe: subscribe2 };
  }
  function cubicOut(t) {
    const f = t - 1;
    return f * f * f + 1;
  }
  function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
    const o = +getComputedStyle(node).opacity;
    return {
      delay,
      duration,
      easing,
      css: (t) => `opacity: ${t * o}`
    };
  }
  function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
    const style = getComputedStyle(node);
    const target_opacity = +style.opacity;
    const transform = style.transform === "none" ? "" : style.transform;
    const od = target_opacity * (1 - opacity);
    const [xValue, xUnit] = split_css_unit(x);
    const [yValue, yUnit] = split_css_unit(y);
    return {
      delay,
      duration,
      easing,
      css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * xValue}${xUnit}, ${(1 - t) * yValue}${yUnit});
			opacity: ${target_opacity - od * u}`
    };
  }
  function slide(node, { delay = 0, duration = 400, easing = cubicOut, axis = "y" } = {}) {
    const style = getComputedStyle(node);
    const opacity = +style.opacity;
    const primary_property = axis === "y" ? "height" : "width";
    const primary_property_value = parseFloat(style[primary_property]);
    const secondary_properties = axis === "y" ? ["top", "bottom"] : ["left", "right"];
    const capitalized_secondary_properties = secondary_properties.map(
      (e) => `${e[0].toUpperCase()}${e.slice(1)}`
    );
    const padding_start_value = parseFloat(style[`padding${capitalized_secondary_properties[0]}`]);
    const padding_end_value = parseFloat(style[`padding${capitalized_secondary_properties[1]}`]);
    const margin_start_value = parseFloat(style[`margin${capitalized_secondary_properties[0]}`]);
    const margin_end_value = parseFloat(style[`margin${capitalized_secondary_properties[1]}`]);
    const border_width_start_value = parseFloat(
      style[`border${capitalized_secondary_properties[0]}Width`]
    );
    const border_width_end_value = parseFloat(
      style[`border${capitalized_secondary_properties[1]}Width`]
    );
    return {
      delay,
      duration,
      easing,
      css: (t) => `overflow: hidden;opacity: ${Math.min(t * 20, 1) * opacity};${primary_property}: ${t * primary_property_value}px;padding-${secondary_properties[0]}: ${t * padding_start_value}px;padding-${secondary_properties[1]}: ${t * padding_end_value}px;margin-${secondary_properties[0]}: ${t * margin_start_value}px;margin-${secondary_properties[1]}: ${t * margin_end_value}px;border-${secondary_properties[0]}-width: ${t * border_width_start_value}px;border-${secondary_properties[1]}-width: ${t * border_width_end_value}px;`
    };
  }
  function create_else_block$1(ctx) {
    let div;
    let t1;
    let input;
    return {
      c() {
        div = element("div");
        div.textContent = "Hit Point Maximum";
        t1 = space();
        input = element("input");
        attr(input, "type", "number");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        insert(target, t1, anchor);
        insert(target, input, anchor);
      },
      d(detaching) {
        if (detaching) {
          detach(div);
          detach(t1);
          detach(input);
        }
      }
    };
  }
  function create_if_block_1$6(ctx) {
    let div;
    let t1;
    let input;
    return {
      c() {
        div = element("div");
        div.textContent = "Hit Point Maximum";
        t1 = space();
        input = element("input");
        attr(input, "type", "number");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        insert(target, t1, anchor);
        insert(target, input, anchor);
      },
      d(detaching) {
        if (detaching) {
          detach(div);
          detach(t1);
          detach(input);
        }
      }
    };
  }
  function create_if_block$7(ctx) {
    let div;
    let t1;
    let input;
    return {
      c() {
        div = element("div");
        div.textContent = "Hit Point Maximum";
        t1 = space();
        input = element("input");
        attr(input, "type", "number");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        insert(target, t1, anchor);
        insert(target, input, anchor);
      },
      d(detaching) {
        if (detaching) {
          detach(div);
          detach(t1);
          detach(input);
        }
      }
    };
  }
  function create_fragment$d(ctx) {
    let div2;
    let div0;
    let t1;
    let input0;
    let input0_disabled_value;
    let t2;
    let div1;
    let t4;
    let input1;
    let t5;
    let mounted;
    let dispose;
    function select_block_type(ctx2, dirty) {
      if (
        /*editMode*/
        ctx2[0]
      ) return create_if_block$7;
      if (
        /*playMode*/
        ctx2[1]
      ) return create_if_block_1$6;
      return create_else_block$1;
    }
    let current_block_type = select_block_type(ctx);
    let if_block = current_block_type(ctx);
    return {
      c() {
        div2 = element("div");
        div0 = element("div");
        div0.textContent = "Hit Points";
        t1 = space();
        input0 = element("input");
        t2 = space();
        div1 = element("div");
        div1.textContent = "temporary Hit Points";
        t4 = space();
        input1 = element("input");
        t5 = space();
        if_block.c();
        attr(input0, "type", "number");
        input0.disabled = input0_disabled_value = !/*editMode*/
        ctx[0];
        attr(input1, "type", "number");
      },
      m(target, anchor) {
        insert(target, div2, anchor);
        append(div2, div0);
        append(div2, t1);
        append(div2, input0);
        set_input_value(
          input0,
          /*v*/
          ctx[2]
        );
        append(div2, t2);
        append(div2, div1);
        append(div2, t4);
        append(div2, input1);
        append(div2, t5);
        if_block.m(div2, null);
        if (!mounted) {
          dispose = [
            listen(
              input0,
              "input",
              /*input0_input_handler*/
              ctx[6]
            ),
            listen(
              input0,
              "change",
              /*iterateValue*/
              ctx[3]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        if (dirty & /*editMode*/
        1 && input0_disabled_value !== (input0_disabled_value = !/*editMode*/
        ctx2[0])) {
          input0.disabled = input0_disabled_value;
        }
        if (dirty & /*v*/
        4 && to_number(input0.value) !== /*v*/
        ctx2[2]) {
          set_input_value(
            input0,
            /*v*/
            ctx2[2]
          );
        }
        if (current_block_type !== (current_block_type = select_block_type(ctx2))) {
          if_block.d(1);
          if_block = current_block_type(ctx2);
          if (if_block) {
            if_block.c();
            if_block.m(div2, null);
          }
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching) {
          detach(div2);
        }
        if_block.d();
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function instance$d($$self, $$props, $$invalidate) {
    let { sys } = $$props;
    let { editMode } = $$props;
    let { playMode } = $$props;
    let { data } = $$props;
    let node = sys.getNode("fixed", "generic", "Hit Points");
    let v = node.getValue();
    const KEY = keyManager.getNewKey();
    onMount(() => {
      node.addUpdateListener(name + KEY + "SvelteView", () => {
        $$invalidate(2, v = node.getValue());
      });
    });
    onDestroy(() => {
      node.removeUpdateListener(name + KEY + "SvelteView");
    });
    function iterateValue() {
      node.setValue(v);
      return null;
    }
    function input0_input_handler() {
      v = to_number(this.value);
      $$invalidate(2, v);
    }
    $$self.$$set = ($$props2) => {
      if ("sys" in $$props2) $$invalidate(4, sys = $$props2.sys);
      if ("editMode" in $$props2) $$invalidate(0, editMode = $$props2.editMode);
      if ("playMode" in $$props2) $$invalidate(1, playMode = $$props2.playMode);
      if ("data" in $$props2) $$invalidate(5, data = $$props2.data);
    };
    return [editMode, playMode, v, iterateValue, sys, data, input0_input_handler];
  }
  class HitPoints extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$d, create_fragment$d, safe_not_equal, {
        sys: 4,
        editMode: 0,
        playMode: 1,
        data: 5
      });
    }
    get sys() {
      return this.$$.ctx[4];
    }
    set sys(sys) {
      this.$$set({ sys });
      flush();
    }
    get editMode() {
      return this.$$.ctx[0];
    }
    set editMode(editMode) {
      this.$$set({ editMode });
      flush();
    }
    get playMode() {
      return this.$$.ctx[1];
    }
    set playMode(playMode) {
      this.$$set({ playMode });
      flush();
    }
    get data() {
      return this.$$.ctx[5];
    }
    set data(data) {
      this.$$set({ data });
      flush();
    }
  }
  create_custom_element(HitPoints, { "sys": {}, "editMode": {}, "playMode": {}, "data": {} }, [], [], true);
  var viewNameIndex = /* @__PURE__ */ ((viewNameIndex2) => {
    viewNameIndex2["HitPoints"] = "HitPoints";
    viewNameIndex2["ProficiencyBonus"] = "ProficiencyBonus";
    viewNameIndex2["SkillProficiencies"] = "SkillProficiencies";
    viewNameIndex2["SpellInfo"] = "SpellInfo";
    viewNameIndex2["Stats"] = "Stats";
    return viewNameIndex2;
  })(viewNameIndex || {});
  function flip(node, { from, to }, params = {}) {
    const style = getComputedStyle(node);
    const transform = style.transform === "none" ? "" : style.transform;
    const [ox, oy] = style.transformOrigin.split(" ").map(parseFloat);
    const dx = from.left + from.width * ox / to.width - (to.left + ox);
    const dy = from.top + from.height * oy / to.height - (to.top + oy);
    const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
    return {
      delay,
      duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
      easing,
      css: (t, u) => {
        const x = u * dx;
        const y = u * dy;
        const sx = t + u * from.width / to.width;
        const sy = t + u * from.height / to.height;
        return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
      }
    };
  }
  function get_each_context$5(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[23] = list[i];
    return child_ctx;
  }
  function create_key_block(ctx) {
    let div;
    let t_value = (
      /*selected*/
      (ctx[0] == null ? (
        /*unSelectedplaceholder*/
        ctx[2]
      ) : (
        /*selected*/
        ctx[0]
      )) + ""
    );
    let t;
    let div_data_isdisabled_value;
    let div_data_iserror_value;
    let div_data_selected_value;
    let mounted;
    let dispose;
    return {
      c() {
        div = element("div");
        t = text(t_value);
        attr(div, "class", "GrobSelectLabel effect");
        attr(div, "data-isdisabled", div_data_isdisabled_value = /*disabled*/
        ctx[3] ?? false);
        attr(div, "data-iserror", div_data_iserror_value = /*isError*/
        ctx[4] ?? false);
        attr(div, "data-selected", div_data_selected_value = /*selected*/
        ctx[0] ?? false);
        attr(div, "tabindex", "-1");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        append(div, t);
        ctx[17](div);
        if (!mounted) {
          dispose = [
            listen(
              div,
              "focus",
              /*onFocus*/
              ctx[13]
            ),
            listen(
              div,
              "blur",
              /*onblur*/
              ctx[14]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty & /*selected, unSelectedplaceholder*/
        5 && t_value !== (t_value = /*selected*/
        (ctx2[0] == null ? (
          /*unSelectedplaceholder*/
          ctx2[2]
        ) : (
          /*selected*/
          ctx2[0]
        )) + "")) set_data(t, t_value);
        if (dirty & /*disabled*/
        8 && div_data_isdisabled_value !== (div_data_isdisabled_value = /*disabled*/
        ctx2[3] ?? false)) {
          attr(div, "data-isdisabled", div_data_isdisabled_value);
        }
        if (dirty & /*isError*/
        16 && div_data_iserror_value !== (div_data_iserror_value = /*isError*/
        ctx2[4] ?? false)) {
          attr(div, "data-iserror", div_data_iserror_value);
        }
        if (dirty & /*selected*/
        1 && div_data_selected_value !== (div_data_selected_value = /*selected*/
        ctx2[0] ?? false)) {
          attr(div, "data-selected", div_data_selected_value);
        }
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        ctx[17](null);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_if_block$6(ctx) {
    let div3;
    let div1;
    let div0;
    let div0_style_value;
    let t0;
    let each_blocks = [];
    let each_1_lookup = /* @__PURE__ */ new Map();
    let t1;
    let t2;
    let div2;
    let div3_style_value;
    let div3_transition;
    let current;
    let each_value = ensure_array_like(
      /*options*/
      ctx[1]
    );
    const get_key = (ctx2) => (
      /*opt*/
      ctx2[23]
    );
    for (let i = 0; i < each_value.length; i += 1) {
      let child_ctx = get_each_context$5(ctx, each_value, i);
      let key = get_key(child_ctx);
      each_1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
    }
    let if_block = (
      /*options*/
      ctx[1].length == 0 && create_if_block_1$5()
    );
    return {
      c() {
        var _a, _b, _c, _d;
        div3 = element("div");
        div1 = element("div");
        div0 = element("div");
        t0 = space();
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t1 = space();
        if (if_block) if_block.c();
        t2 = space();
        div2 = element("div");
        attr(div0, "class", "Arrow");
        attr(div0, "style", div0_style_value = `left:${/*arrowOffsetLeft*/
        ctx[12]}px`);
        attr(div1, "class", "ArrowContainer");
        attr(div2, "class", "selectEndTracker");
        attr(div3, "class", "SelectPopUp");
        attr(div3, "style", div3_style_value = "width:" + /*labelRect*/
        (((_a = ctx[7]) == null ? void 0 : _a.width) ?? 100) + "px;left: " + /*labelRect*/
        (((_b = ctx[7]) == null ? void 0 : _b.x) ?? 0) + "px;top: " + /*labelRect*/
        ((((_c = ctx[7]) == null ? void 0 : _c.y) ?? 0) + /*labelRect*/
        (((_d = ctx[7]) == null ? void 0 : _d.height) ?? 0) + 8) + "px;max-height:" + /*override_maxHeight*/
        ctx[11] + "px");
      },
      m(target, anchor) {
        insert(target, div3, anchor);
        append(div3, div1);
        append(div1, div0);
        ctx[18](div1);
        append(div3, t0);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(div3, null);
          }
        }
        append(div3, t1);
        if (if_block) if_block.m(div3, null);
        append(div3, t2);
        append(div3, div2);
        ctx[19](div2);
        current = true;
      },
      p(ctx2, dirty) {
        var _a, _b, _c, _d;
        if (!current || dirty & /*arrowOffsetLeft*/
        4096 && div0_style_value !== (div0_style_value = `left:${/*arrowOffsetLeft*/
        ctx2[12]}px`)) {
          attr(div0, "style", div0_style_value);
        }
        if (dirty & /*selected, options, clickOption*/
        32771) {
          each_value = ensure_array_like(
            /*options*/
            ctx2[1]
          );
          each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div3, destroy_block, create_each_block$5, t1, get_each_context$5);
        }
        if (
          /*options*/
          ctx2[1].length == 0
        ) {
          if (if_block) ;
          else {
            if_block = create_if_block_1$5();
            if_block.c();
            if_block.m(div3, t2);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
        if (!current || dirty & /*labelRect, override_maxHeight*/
        2176 && div3_style_value !== (div3_style_value = "width:" + /*labelRect*/
        (((_a = ctx2[7]) == null ? void 0 : _a.width) ?? 100) + "px;left: " + /*labelRect*/
        (((_b = ctx2[7]) == null ? void 0 : _b.x) ?? 0) + "px;top: " + /*labelRect*/
        ((((_c = ctx2[7]) == null ? void 0 : _c.y) ?? 0) + /*labelRect*/
        (((_d = ctx2[7]) == null ? void 0 : _d.height) ?? 0) + 8) + "px;max-height:" + /*override_maxHeight*/
        ctx2[11] + "px")) {
          attr(div3, "style", div3_style_value);
        }
      },
      i(local) {
        if (current) return;
        if (local) {
          add_render_callback(() => {
            if (!current) return;
            if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, true);
            div3_transition.run(1);
          });
        }
        current = true;
      },
      o(local) {
        if (local) {
          if (!div3_transition) div3_transition = create_bidirectional_transition(div3, slide, {}, false);
          div3_transition.run(0);
        }
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div3);
        }
        ctx[18](null);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].d();
        }
        if (if_block) if_block.d();
        ctx[19](null);
        if (detaching && div3_transition) div3_transition.end();
      }
    };
  }
  function create_each_block$5(key_1, ctx) {
    let div;
    let t_value = (
      /*opt*/
      ctx[23] + ""
    );
    let t;
    let div_data_selected_value;
    let div_data_value_value;
    let mounted;
    let dispose;
    return {
      key: key_1,
      first: null,
      c() {
        div = element("div");
        t = text(t_value);
        attr(div, "role", "none");
        attr(div, "class", "GrobSelectOption");
        attr(div, "data-selected", div_data_selected_value = /*selected*/
        ctx[0] == /*opt*/
        ctx[23]);
        attr(div, "data-value", div_data_value_value = /*opt*/
        ctx[23]);
        this.first = div;
      },
      m(target, anchor) {
        insert(target, div, anchor);
        append(div, t);
        if (!mounted) {
          dispose = [
            listen(
              div,
              "click",
              /*clickOption*/
              ctx[15]
            ),
            listen(
              div,
              "keydown",
              /*clickOption*/
              ctx[15]
            )
          ];
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        if (dirty & /*options*/
        2 && t_value !== (t_value = /*opt*/
        ctx[23] + "")) set_data(t, t_value);
        if (dirty & /*selected, options*/
        3 && div_data_selected_value !== (div_data_selected_value = /*selected*/
        ctx[0] == /*opt*/
        ctx[23])) {
          attr(div, "data-selected", div_data_selected_value);
        }
        if (dirty & /*options*/
        2 && div_data_value_value !== (div_data_value_value = /*opt*/
        ctx[23])) {
          attr(div, "data-value", div_data_value_value);
        }
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_if_block_1$5(ctx) {
    let i;
    return {
      c() {
        i = element("i");
        i.textContent = "No Options";
        attr(i, "class", "GrobSelectInfo");
      },
      m(target, anchor) {
        insert(target, i, anchor);
      },
      d(detaching) {
        if (detaching) {
          detach(i);
        }
      }
    };
  }
  function create_fragment$c(ctx) {
    let div1;
    let previous_key = (
      /*selected*/
      ctx[0]
    );
    let t;
    let div0;
    let key_block = create_key_block(ctx);
    let if_block = (
      /*isFocussed*/
      (ctx[8] || /*forceOpen*/
      ctx[5]) && create_if_block$6(ctx)
    );
    return {
      c() {
        div1 = element("div");
        key_block.c();
        t = space();
        div0 = element("div");
        if (if_block) if_block.c();
        attr(div1, "class", "GrobSelect");
      },
      m(target, anchor) {
        insert(target, div1, anchor);
        key_block.m(div1, null);
        append(div1, t);
        append(div1, div0);
        if (if_block) if_block.m(div0, null);
      },
      p(ctx2, [dirty]) {
        if (dirty & /*selected*/
        1 && safe_not_equal(previous_key, previous_key = /*selected*/
        ctx2[0])) {
          key_block.d(1);
          key_block = create_key_block(ctx2);
          key_block.c();
          key_block.m(div1, t);
        } else {
          key_block.p(ctx2, dirty);
        }
        if (
          /*isFocussed*/
          ctx2[8] || /*forceOpen*/
          ctx2[5]
        ) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & /*isFocussed, forceOpen*/
            288) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block$6(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(div0, null);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
      },
      i(local) {
        transition_in(if_block);
      },
      o(local) {
        transition_out(if_block);
      },
      d(detaching) {
        if (detaching) {
          detach(div1);
        }
        key_block.d(detaching);
        if (if_block) if_block.d();
      }
    };
  }
  const svelteStandardAnimTime = 100;
  function instance$c($$self, $$props, $$invalidate) {
    let dispatch2 = createEventDispatcher();
    let { options } = $$props;
    let { selected = null } = $$props;
    let { unSelectedplaceholder = "None Selected" } = $$props;
    let { disabled = false } = $$props;
    let { isError = false } = $$props;
    let { forceOpen = false } = $$props;
    let { maxHeight = 500 } = $$props;
    let label;
    let labelRect;
    let isFocussed = false;
    let endTracker;
    let topTracker;
    let override_maxHeight = maxHeight;
    let arrowOffsetLeft = 0;
    function onFocus() {
      const rect1 = label.getBoundingClientRect();
      $$invalidate(7, labelRect = rect1);
      $$invalidate(8, isFocussed = true);
      recalculateWidth();
      setTimeout(recalculateHeight, svelteStandardAnimTime);
    }
    function onblur() {
      setTimeout(
        () => {
          $$invalidate(8, isFocussed = false);
        },
        200
      );
    }
    function clickOption(event) {
      let value = event.target.getAttribute("data-value");
      if (selected == value) {
        $$invalidate(0, selected = null);
        dispatch2("onDeselect");
      } else {
        $$invalidate(0, selected = value);
        dispatch2("onSelect", selected);
      }
    }
    function recalculateHeight() {
      let itemTop = topTracker.getBoundingClientRect().bottom;
      let itemBottom = endTracker.getBoundingClientRect().bottom;
      let windowBottom = window.document.body.getBoundingClientRect().height;
      if (itemBottom > windowBottom) {
        let delta = itemBottom - windowBottom;
        let total = itemBottom - itemTop;
        let n = total - delta;
        if (n < override_maxHeight) {
          $$invalidate(11, override_maxHeight = n);
        }
      }
    }
    function recalculateWidth() {
      let width = label.getBoundingClientRect().width;
      $$invalidate(12, arrowOffsetLeft = width / 2);
    }
    function div_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        label = $$value;
        $$invalidate(6, label);
      });
    }
    function div1_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        topTracker = $$value;
        $$invalidate(10, topTracker);
      });
    }
    function div2_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        endTracker = $$value;
        $$invalidate(9, endTracker);
      });
    }
    $$self.$$set = ($$props2) => {
      if ("options" in $$props2) $$invalidate(1, options = $$props2.options);
      if ("selected" in $$props2) $$invalidate(0, selected = $$props2.selected);
      if ("unSelectedplaceholder" in $$props2) $$invalidate(2, unSelectedplaceholder = $$props2.unSelectedplaceholder);
      if ("disabled" in $$props2) $$invalidate(3, disabled = $$props2.disabled);
      if ("isError" in $$props2) $$invalidate(4, isError = $$props2.isError);
      if ("forceOpen" in $$props2) $$invalidate(5, forceOpen = $$props2.forceOpen);
      if ("maxHeight" in $$props2) $$invalidate(16, maxHeight = $$props2.maxHeight);
    };
    return [
      selected,
      options,
      unSelectedplaceholder,
      disabled,
      isError,
      forceOpen,
      label,
      labelRect,
      isFocussed,
      endTracker,
      topTracker,
      override_maxHeight,
      arrowOffsetLeft,
      onFocus,
      onblur,
      clickOption,
      maxHeight,
      div_binding,
      div1_binding,
      div2_binding
    ];
  }
  class CustomSelect extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$c, create_fragment$c, safe_not_equal, {
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
    set options(options) {
      this.$$set({ options });
      flush();
    }
    get selected() {
      return this.$$.ctx[0];
    }
    set selected(selected) {
      this.$$set({ selected });
      flush();
    }
    get unSelectedplaceholder() {
      return this.$$.ctx[2];
    }
    set unSelectedplaceholder(unSelectedplaceholder) {
      this.$$set({ unSelectedplaceholder });
      flush();
    }
    get disabled() {
      return this.$$.ctx[3];
    }
    set disabled(disabled) {
      this.$$set({ disabled });
      flush();
    }
    get isError() {
      return this.$$.ctx[4];
    }
    set isError(isError) {
      this.$$set({ isError });
      flush();
    }
    get forceOpen() {
      return this.$$.ctx[5];
    }
    set forceOpen(forceOpen) {
      this.$$set({ forceOpen });
      flush();
    }
    get maxHeight() {
      return this.$$.ctx[16];
    }
    set maxHeight(maxHeight) {
      this.$$set({ maxHeight });
      flush();
    }
  }
  create_custom_element(CustomSelect, { "options": {}, "selected": {}, "unSelectedplaceholder": {}, "disabled": { "type": "Boolean" }, "isError": { "type": "Boolean" }, "forceOpen": { "type": "Boolean" }, "maxHeight": {} }, [], [], true);
  function get_each_context$4(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[8] = list[i];
    return child_ctx;
  }
  function create_each_block$4(ctx) {
    let option;
    let t0_value = (
      /*opt*/
      ctx[8] + ""
    );
    let t0;
    let t1;
    return {
      c() {
        option = element("option");
        t0 = text(t0_value);
        t1 = space();
        option.__value = /*opt*/
        ctx[8];
        set_input_value(option, option.__value);
        option.selected = /*selected*/
        ctx[2] == /*opt*/
        ctx[8];
      },
      m(target, anchor) {
        insert(target, option, anchor);
        append(option, t0);
        append(option, t1);
      },
      p: noop,
      d(detaching) {
        if (detaching) {
          detach(option);
        }
      }
    };
  }
  function create_fragment$b(ctx) {
    let div2;
    let div1;
    let div0;
    let select;
    let option;
    let mounted;
    let dispose;
    let each_value = ensure_array_like(
      /*options*/
      ctx[1]
    );
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    }
    return {
      c() {
        div2 = element("div");
        div1 = element("div");
        div0 = element("div");
        select = element("select");
        option = element("option");
        option.textContent = "choose component ";
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        option.__value = null;
        set_input_value(option, option.__value);
        attr(div0, "class", "ItemOptionBtn ");
        attr(div1, "class", "ItemOptions");
        attr(div2, "class", "ItemOptionsContainer");
      },
      m(target, anchor) {
        insert(target, div2, anchor);
        append(div2, div1);
        append(div1, div0);
        append(div0, select);
        append(select, option);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(select, null);
          }
        }
        ctx[6](select);
        if (!mounted) {
          dispose = listen(
            select,
            "change",
            /*selectOption*/
            ctx[3]
          );
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        if (dirty & /*options, selected*/
        6) {
          each_value = ensure_array_like(
            /*options*/
            ctx2[1]
          );
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context$4(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block$4(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(select, null);
            }
          }
          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }
          each_blocks.length = each_value.length;
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching) {
          detach(div2);
        }
        destroy_each(each_blocks, detaching);
        ctx[6](null);
        mounted = false;
        dispose();
      }
    };
  }
  function instance$b($$self, $$props, $$invalidate) {
    let dispatch2 = createEventDispatcher();
    let { data } = $$props;
    let { editMode } = $$props;
    let options = Object.keys(viewNameIndex);
    let selected = data.type;
    let tab;
    function selectOption() {
      let v = tab.value;
      $$invalidate(4, data.type = v, data);
      dispatch2("optionSelected");
    }
    function select_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        tab = $$value;
        $$invalidate(0, tab);
        $$invalidate(1, options);
      });
    }
    $$self.$$set = ($$props2) => {
      if ("data" in $$props2) $$invalidate(4, data = $$props2.data);
      if ("editMode" in $$props2) $$invalidate(5, editMode = $$props2.editMode);
    };
    return [tab, options, selected, selectOption, data, editMode, select_binding];
  }
  class ItemOptions extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$b, create_fragment$b, safe_not_equal, { data: 4, editMode: 5 });
    }
    get data() {
      return this.$$.ctx[4];
    }
    set data(data) {
      this.$$set({ data });
      flush();
    }
    get editMode() {
      return this.$$.ctx[5];
    }
    set editMode(editMode) {
      this.$$set({ editMode });
      flush();
    }
  }
  create_custom_element(ItemOptions, { "data": {}, "editMode": {} }, [], [], true);
  function create_fragment$a(ctx) {
    let div1;
    let div0;
    let t1;
    let input;
    let input_disabled_value;
    let mounted;
    let dispose;
    return {
      c() {
        div1 = element("div");
        div0 = element("div");
        div0.textContent = "Proficiency Bonus";
        t1 = space();
        input = element("input");
        attr(input, "type", "number");
        input.disabled = input_disabled_value = !/*editMode*/
        ctx[0];
        attr(div1, "class", "ProficiencyBonus");
      },
      m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, div0);
        append(div1, t1);
        append(div1, input);
        set_input_value(
          input,
          /*v*/
          ctx[1]
        );
        if (!mounted) {
          dispose = [
            listen(
              input,
              "input",
              /*input_input_handler*/
              ctx[5]
            ),
            listen(
              input,
              "change",
              /*iterateValue*/
              ctx[2]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        if (dirty & /*editMode*/
        1 && input_disabled_value !== (input_disabled_value = !/*editMode*/
        ctx2[0])) {
          input.disabled = input_disabled_value;
        }
        if (dirty & /*v*/
        2 && to_number(input.value) !== /*v*/
        ctx2[1]) {
          set_input_value(
            input,
            /*v*/
            ctx2[1]
          );
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching) {
          detach(div1);
        }
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function instance$a($$self, $$props, $$invalidate) {
    let { sys } = $$props;
    let { editMode } = $$props;
    let { data } = $$props;
    let node = sys.getNode("fixed", "generic", "Proficiency Bonus");
    let v = node.getValue();
    const KEY = keyManager.getNewKey();
    onMount(() => {
      node.addUpdateListener(name + KEY + "SvelteView", () => {
        $$invalidate(1, v = node.getValue());
      });
    });
    onDestroy(() => {
      node.removeUpdateListener(name + KEY + "SvelteView");
    });
    function iterateValue() {
      node.setValue(v);
      return null;
    }
    function input_input_handler() {
      v = to_number(this.value);
      $$invalidate(1, v);
    }
    $$self.$$set = ($$props2) => {
      if ("sys" in $$props2) $$invalidate(3, sys = $$props2.sys);
      if ("editMode" in $$props2) $$invalidate(0, editMode = $$props2.editMode);
      if ("data" in $$props2) $$invalidate(4, data = $$props2.data);
    };
    return [editMode, v, iterateValue, sys, data, input_input_handler];
  }
  class ProficiencyBonus extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$a, create_fragment$a, safe_not_equal, { sys: 3, editMode: 0, data: 4 });
    }
    get sys() {
      return this.$$.ctx[3];
    }
    set sys(sys) {
      this.$$set({ sys });
      flush();
    }
    get editMode() {
      return this.$$.ctx[0];
    }
    set editMode(editMode) {
      this.$$set({ editMode });
      flush();
    }
    get data() {
      return this.$$.ctx[4];
    }
    set data(data) {
      this.$$set({ data });
      flush();
    }
  }
  create_custom_element(ProficiencyBonus, { "sys": {}, "editMode": {}, "data": {} }, [], [], true);
  function create_fragment$9(ctx) {
    let div4;
    let div1;
    let div0;
    let t0;
    let div2;
    let p0;
    let t1;
    let t2;
    let div3;
    let p1;
    let t3;
    let mounted;
    let dispose;
    return {
      c() {
        div4 = element("div");
        div1 = element("div");
        div0 = element("div");
        t0 = space();
        div2 = element("div");
        p0 = element("p");
        t1 = text(
          /*name*/
          ctx[1]
        );
        t2 = space();
        div3 = element("div");
        p1 = element("p");
        t3 = text(
          /*bonus*/
          ctx[3]
        );
        attr(div0, "class", "skillproficiencyMark");
        attr(
          div0,
          "data-level",
          /*value*/
          ctx[2]
        );
        attr(div0, "role", "none");
        attr(div1, "class", "skillproficiencyMarkParent");
        attr(div2, "class", "skillproficiencyMarkName");
        attr(div3, "class", "skillproficiencyMarkValue");
        attr(div4, "class", "skillproficiencyContainer");
        attr(
          div4,
          "data-edit",
          /*edit*/
          ctx[0]
        );
      },
      m(target, anchor) {
        insert(target, div4, anchor);
        append(div4, div1);
        append(div1, div0);
        append(div4, t0);
        append(div4, div2);
        append(div2, p0);
        append(p0, t1);
        append(div4, t2);
        append(div4, div3);
        append(div3, p1);
        append(p1, t3);
        if (!mounted) {
          dispose = [
            listen(
              div0,
              "keyup",
              /*keyup_handler*/
              ctx[6]
            ),
            listen(
              div0,
              "click",
              /*iterateValue*/
              ctx[4]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        if (dirty & /*value*/
        4) {
          attr(
            div0,
            "data-level",
            /*value*/
            ctx2[2]
          );
        }
        if (dirty & /*name*/
        2) set_data(
          t1,
          /*name*/
          ctx2[1]
        );
        if (dirty & /*bonus*/
        8) set_data(
          t3,
          /*bonus*/
          ctx2[3]
        );
        if (dirty & /*edit*/
        1) {
          attr(
            div4,
            "data-edit",
            /*edit*/
            ctx2[0]
          );
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching) {
          detach(div4);
        }
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function instance$9($$self, $$props, $$invalidate) {
    let { edit } = $$props;
    let { name: name2 } = $$props;
    let { sys } = $$props;
    let node_skill = sys.getNode("fixed", "SkillProficiencies", name2);
    let node_bonus = sys.getNode("derived", "skillproficiencyBonus", name2);
    let value = node_skill.getValue();
    let bonus = node_bonus.getValue();
    const KEY = keyManager.getNewKey();
    onMount(() => {
      node_skill.addUpdateListener(name2 + KEY + "SvelteView", () => {
        $$invalidate(2, value = node_skill.getValue());
      });
      node_bonus.addUpdateListener(name2 + KEY + "SvelteView", () => {
        $$invalidate(3, bonus = node_bonus.getValue());
      });
    });
    onDestroy(() => {
      node_skill.removeUpdateListener(name2 + "SvelteView");
      node_bonus.removeUpdateListener(name2 + "SvelteView");
    });
    function iterateValue() {
      if (!edit) {
        return;
      }
      let value2 = node_skill.getValue();
      value2 = (value2 + 1) % 3;
      node_skill.setValue(value2);
      return null;
    }
    function keyup_handler(event) {
      bubble.call(this, $$self, event);
    }
    $$self.$$set = ($$props2) => {
      if ("edit" in $$props2) $$invalidate(0, edit = $$props2.edit);
      if ("name" in $$props2) $$invalidate(1, name2 = $$props2.name);
      if ("sys" in $$props2) $$invalidate(5, sys = $$props2.sys);
    };
    return [edit, name2, value, bonus, iterateValue, sys, keyup_handler];
  }
  class SkillProficiency extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$9, create_fragment$9, safe_not_equal, { edit: 0, name: 1, sys: 5 });
    }
    get edit() {
      return this.$$.ctx[0];
    }
    set edit(edit) {
      this.$$set({ edit });
      flush();
    }
    get name() {
      return this.$$.ctx[1];
    }
    set name(name2) {
      this.$$set({ name: name2 });
      flush();
    }
    get sys() {
      return this.$$.ctx[5];
    }
    set sys(sys) {
      this.$$set({ sys });
      flush();
    }
  }
  create_custom_element(SkillProficiency, { "edit": {}, "name": {}, "sys": {} }, [], [], true);
  function get_each_context$3(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[4] = list[i];
    return child_ctx;
  }
  function create_each_block$3(ctx) {
    let skillproficiency;
    let current;
    skillproficiency = new SkillProficiency({
      props: {
        edit: (
          /*edit*/
          ctx[0]
        ),
        name: (
          /*name*/
          ctx[4]
        ),
        sys: (
          /*sys*/
          ctx[1]
        )
      }
    });
    return {
      c() {
        create_component(skillproficiency.$$.fragment);
      },
      m(target, anchor) {
        mount_component(skillproficiency, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const skillproficiency_changes = {};
        if (dirty & /*edit*/
        1) skillproficiency_changes.edit = /*edit*/
        ctx2[0];
        if (dirty & /*sys*/
        2) skillproficiency_changes.sys = /*sys*/
        ctx2[1];
        skillproficiency.$set(skillproficiency_changes);
      },
      i(local) {
        if (current) return;
        transition_in(skillproficiency.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(skillproficiency.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(skillproficiency, detaching);
      }
    };
  }
  function create_fragment$8(ctx) {
    let div;
    let current;
    let each_value = ensure_array_like(
      /*names*/
      ctx[2]
    );
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        div = element("div");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        attr(div, "class", "skillproficiencyCollection");
        attr(
          div,
          "data-edit",
          /*edit*/
          ctx[0]
        );
      },
      m(target, anchor) {
        insert(target, div, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(div, null);
          }
        }
        current = true;
      },
      p(ctx2, [dirty]) {
        if (dirty & /*edit, names, sys*/
        7) {
          each_value = ensure_array_like(
            /*names*/
            ctx2[2]
          );
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context$3(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block$3(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(div, null);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
        if (!current || dirty & /*edit*/
        1) {
          attr(
            div,
            "data-edit",
            /*edit*/
            ctx2[0]
          );
        }
      },
      i(local) {
        if (current) return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        destroy_each(each_blocks, detaching);
      }
    };
  }
  function instance$8($$self, $$props, $$invalidate) {
    let { edit } = $$props;
    let { sys } = $$props;
    let { data } = $$props;
    let names = sys.getNodeNames("fixed", "SkillProficiencies");
    $$self.$$set = ($$props2) => {
      if ("edit" in $$props2) $$invalidate(0, edit = $$props2.edit);
      if ("sys" in $$props2) $$invalidate(1, sys = $$props2.sys);
      if ("data" in $$props2) $$invalidate(3, data = $$props2.data);
    };
    return [edit, sys, names, data];
  }
  class SkillProficiencyCollection extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$8, create_fragment$8, safe_not_equal, { edit: 0, sys: 1, data: 3 });
    }
    get edit() {
      return this.$$.ctx[0];
    }
    set edit(edit) {
      this.$$set({ edit });
      flush();
    }
    get sys() {
      return this.$$.ctx[1];
    }
    set sys(sys) {
      this.$$set({ sys });
      flush();
    }
    get data() {
      return this.$$.ctx[3];
    }
    set data(data) {
      this.$$set({ data });
      flush();
    }
  }
  create_custom_element(SkillProficiencyCollection, { "edit": {}, "sys": {}, "data": {} }, [], [], true);
  function get_each_context$2(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[17] = list[i];
    return child_ctx;
  }
  function create_else_block(ctx) {
    let div;
    return {
      c() {
        div = element("div");
      },
      m(target, anchor) {
        insert(target, div, anchor);
      },
      p: noop,
      d(detaching) {
        if (detaching) {
          detach(div);
        }
      }
    };
  }
  function create_if_block$5(ctx) {
    let div;
    let select;
    let mounted;
    let dispose;
    let each_value = ensure_array_like(
      /*spellBonusChoices*/
      ctx[5]
    );
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    }
    return {
      c() {
        div = element("div");
        select = element("select");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
      },
      m(target, anchor) {
        insert(target, div, anchor);
        append(div, select);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(select, null);
          }
        }
        ctx[9](select);
        if (!mounted) {
          dispose = listen(
            select,
            "change",
            /*changeSort*/
            ctx[6]
          );
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty & /*spellBonusChoices, showStat*/
        34) {
          each_value = ensure_array_like(
            /*spellBonusChoices*/
            ctx2[5]
          );
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context$2(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block$2(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(select, null);
            }
          }
          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }
          each_blocks.length = each_value.length;
        }
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        destroy_each(each_blocks, detaching);
        ctx[9](null);
        mounted = false;
        dispose();
      }
    };
  }
  function create_each_block$2(ctx) {
    let option;
    let t0_value = (
      /*key*/
      ctx[17] + ""
    );
    let t0;
    let t1;
    let option_selected_value;
    return {
      c() {
        option = element("option");
        t0 = text(t0_value);
        t1 = space();
        option.__value = /*key*/
        ctx[17];
        set_input_value(option, option.__value);
        option.selected = option_selected_value = /*key*/
        ctx[17] == /*showStat*/
        ctx[1];
      },
      m(target, anchor) {
        insert(target, option, anchor);
        append(option, t0);
        append(option, t1);
      },
      p(ctx2, dirty) {
        if (dirty & /*showStat*/
        2 && option_selected_value !== (option_selected_value = /*key*/
        ctx2[17] == /*showStat*/
        ctx2[1])) {
          option.selected = option_selected_value;
        }
      },
      d(detaching) {
        if (detaching) {
          detach(option);
        }
      }
    };
  }
  function create_fragment$7(ctx) {
    let div8;
    let t0;
    let div7;
    let div0;
    let t1;
    let t2;
    let div3;
    let div1;
    let t4;
    let div2;
    let t5;
    let t6;
    let div6;
    let div4;
    let t8;
    let div5;
    let t9;
    function select_block_type(ctx2, dirty) {
      if (
        /*edit*/
        ctx2[0]
      ) return create_if_block$5;
      return create_else_block;
    }
    let current_block_type = select_block_type(ctx);
    let if_block = current_block_type(ctx);
    return {
      c() {
        div8 = element("div");
        if_block.c();
        t0 = space();
        div7 = element("div");
        div0 = element("div");
        t1 = text(
          /*showStat*/
          ctx[1]
        );
        t2 = space();
        div3 = element("div");
        div1 = element("div");
        div1.textContent = "Spell DC";
        t4 = space();
        div2 = element("div");
        t5 = text(
          /*chosen_DC*/
          ctx[2]
        );
        t6 = space();
        div6 = element("div");
        div4 = element("div");
        div4.textContent = "Spell Bonus";
        t8 = space();
        div5 = element("div");
        t9 = text(
          /*chosen_BONUS*/
          ctx[3]
        );
        attr(div7, "class", "spellDCContainer");
      },
      m(target, anchor) {
        insert(target, div8, anchor);
        if_block.m(div8, null);
        append(div8, t0);
        append(div8, div7);
        append(div7, div0);
        append(div0, t1);
        append(div7, t2);
        append(div7, div3);
        append(div3, div1);
        append(div3, t4);
        append(div3, div2);
        append(div2, t5);
        append(div7, t6);
        append(div7, div6);
        append(div6, div4);
        append(div6, t8);
        append(div6, div5);
        append(div5, t9);
      },
      p(ctx2, [dirty]) {
        if (current_block_type === (current_block_type = select_block_type(ctx2)) && if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block.d(1);
          if_block = current_block_type(ctx2);
          if (if_block) {
            if_block.c();
            if_block.m(div8, t0);
          }
        }
        if (dirty & /*showStat*/
        2) set_data(
          t1,
          /*showStat*/
          ctx2[1]
        );
        if (dirty & /*chosen_DC*/
        4) set_data(
          t5,
          /*chosen_DC*/
          ctx2[2]
        );
        if (dirty & /*chosen_BONUS*/
        8) set_data(
          t9,
          /*chosen_BONUS*/
          ctx2[3]
        );
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching) {
          detach(div8);
        }
        if_block.d();
      }
    };
  }
  function instance$7($$self, $$props, $$invalidate) {
    let { sys } = $$props;
    let { edit } = $$props;
    let { data } = $$props;
    const KEY = keyManager.getNewKey();
    let dataData = data.data;
    let spellBonusChoices = sys.getNodeNames("derived", "Spell Bonus");
    if (JSON.stringify(dataData) === JSON.stringify({})) {
      dataData.showStat = spellBonusChoices[0];
    }
    let showStat = dataData.showStat;
    let nodeDC = sys.getNode("derived", "Spell Bonus", showStat);
    let nodeBonus = sys.getNode("derived", "Spell DC", showStat);
    let chosen_DC = nodeDC.getValue();
    let chosen_BONUS = nodeBonus.getValue();
    let sortSelect;
    function changeSort() {
      let value = sortSelect.value;
      $$invalidate(1, showStat = value);
      nodeDC = sys.getNode("derived", "Spell Bonus", showStat);
      nodeBonus = sys.getNode("derived", "Spell DC", showStat);
      $$invalidate(2, chosen_DC = nodeDC.getValue());
      $$invalidate(3, chosen_BONUS = nodeBonus.getValue());
    }
    function update2() {
      $$invalidate(2, chosen_DC = nodeDC.getValue());
      $$invalidate(3, chosen_BONUS = nodeBonus.getValue());
    }
    function addListeners() {
      nodeDC.addUpdateListener(name + "SpellInfoView" + KEY, () => {
        update2();
      });
      nodeBonus.addUpdateListener(name + "SpellInfoView" + KEY, () => {
        update2();
      });
    }
    onMount(() => {
      addListeners();
    });
    function removeListener() {
      nodeDC.removeUpdateListener(name + "SpellInfoView" + KEY);
      nodeBonus.removeUpdateListener(name + "SpellInfoView" + KEY);
    }
    onDestroy(() => {
      removeListener();
    });
    function select_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        sortSelect = $$value;
        $$invalidate(4, sortSelect);
        $$invalidate(5, spellBonusChoices);
      });
    }
    $$self.$$set = ($$props2) => {
      if ("sys" in $$props2) $$invalidate(7, sys = $$props2.sys);
      if ("edit" in $$props2) $$invalidate(0, edit = $$props2.edit);
      if ("data" in $$props2) $$invalidate(8, data = $$props2.data);
    };
    return [
      edit,
      showStat,
      chosen_DC,
      chosen_BONUS,
      sortSelect,
      spellBonusChoices,
      changeSort,
      sys,
      data,
      select_binding
    ];
  }
  class SpellInfo extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$7, create_fragment$7, safe_not_equal, { sys: 7, edit: 0, data: 8 });
    }
    get sys() {
      return this.$$.ctx[7];
    }
    set sys(sys) {
      this.$$set({ sys });
      flush();
    }
    get edit() {
      return this.$$.ctx[0];
    }
    set edit(edit) {
      this.$$set({ edit });
      flush();
    }
    get data() {
      return this.$$.ctx[8];
    }
    set data(data) {
      this.$$set({ data });
      flush();
    }
  }
  create_custom_element(SpellInfo, { "sys": {}, "edit": {}, "data": {} }, [], [], true);
  function create_fragment$6(ctx) {
    let div4;
    let div0;
    let t0;
    let t1;
    let div1;
    let input;
    let input_disabled_value;
    let t2;
    let div3;
    let div2;
    let t3;
    let mounted;
    let dispose;
    return {
      c() {
        div4 = element("div");
        div0 = element("div");
        t0 = text(
          /*name*/
          ctx[0]
        );
        t1 = space();
        div1 = element("div");
        input = element("input");
        t2 = space();
        div3 = element("div");
        div2 = element("div");
        t3 = text(
          /*modNodeValue*/
          ctx[3]
        );
        attr(div0, "class", "statTitle");
        attr(input, "class", "BoxValue");
        attr(
          input,
          "data-editmode",
          /*editmode*/
          ctx[1]
        );
        input.disabled = input_disabled_value = !/*editmode*/
        ctx[1];
        input.value = /*nodeValue*/
        ctx[2];
        attr(input, "type", "number");
        attr(input, "min", "0");
        attr(input, "max", "100");
        attr(div1, "class", "LargeValue");
        attr(div2, "class", "BoxValue");
        attr(div3, "class", "SmallValue");
        attr(div4, "class", "StatValue");
      },
      m(target, anchor) {
        insert(target, div4, anchor);
        append(div4, div0);
        append(div0, t0);
        append(div4, t1);
        append(div4, div1);
        append(div1, input);
        ctx[8](input);
        append(div4, t2);
        append(div4, div3);
        append(div3, div2);
        append(div2, t3);
        if (!mounted) {
          dispose = listen(
            input,
            "change",
            /*onChange*/
            ctx[5]
          );
          mounted = true;
        }
      },
      p(ctx2, [dirty]) {
        if (dirty & /*name*/
        1) set_data(
          t0,
          /*name*/
          ctx2[0]
        );
        if (dirty & /*editmode*/
        2) {
          attr(
            input,
            "data-editmode",
            /*editmode*/
            ctx2[1]
          );
        }
        if (dirty & /*editmode*/
        2 && input_disabled_value !== (input_disabled_value = !/*editmode*/
        ctx2[1])) {
          input.disabled = input_disabled_value;
        }
        if (dirty & /*nodeValue*/
        4 && input.value !== /*nodeValue*/
        ctx2[2]) {
          input.value = /*nodeValue*/
          ctx2[2];
        }
        if (dirty & /*modNodeValue*/
        8) set_data(
          t3,
          /*modNodeValue*/
          ctx2[3]
        );
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching) {
          detach(div4);
        }
        ctx[8](null);
        mounted = false;
        dispose();
      }
    };
  }
  function instance$6($$self, $$props, $$invalidate) {
    let { name: name2 } = $$props;
    let { statNode } = $$props;
    let { modNode } = $$props;
    let { editmode = false } = $$props;
    let nodeValue = statNode.getValue();
    let modNodeValue = modNode.getValue();
    const KEY = keyManager.getNewKey();
    onMount(() => {
      statNode.addUpdateListener("onDerivedNodeUpdate" + KEY, onDerivedOrFixedNodeUpdate);
      modNode.addUpdateListener("onDerivedNodeUpdate" + KEY, onDerivedOrFixedNodeUpdate);
    });
    onDestroy(() => {
      statNode.removeUpdateListener("onDerivedNodeUpdate" + KEY);
      modNode.removeUpdateListener("onDerivedNodeUpdate" + KEY);
    });
    function onDerivedOrFixedNodeUpdate() {
      $$invalidate(2, nodeValue = statNode.getValue());
      $$invalidate(3, modNodeValue = modNode.getValue());
    }
    function onChange() {
      let value = parseInt(statValueDiv.value);
      statNode.setValue(value);
    }
    let statValueDiv;
    function input_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        statValueDiv = $$value;
        $$invalidate(4, statValueDiv);
      });
    }
    $$self.$$set = ($$props2) => {
      if ("name" in $$props2) $$invalidate(0, name2 = $$props2.name);
      if ("statNode" in $$props2) $$invalidate(6, statNode = $$props2.statNode);
      if ("modNode" in $$props2) $$invalidate(7, modNode = $$props2.modNode);
      if ("editmode" in $$props2) $$invalidate(1, editmode = $$props2.editmode);
    };
    return [
      name2,
      editmode,
      nodeValue,
      modNodeValue,
      statValueDiv,
      onChange,
      statNode,
      modNode,
      input_binding
    ];
  }
  class StatValue extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$6, create_fragment$6, safe_not_equal, {
        name: 0,
        statNode: 6,
        modNode: 7,
        editmode: 1
      });
    }
    get name() {
      return this.$$.ctx[0];
    }
    set name(name2) {
      this.$$set({ name: name2 });
      flush();
    }
    get statNode() {
      return this.$$.ctx[6];
    }
    set statNode(statNode) {
      this.$$set({ statNode });
      flush();
    }
    get modNode() {
      return this.$$.ctx[7];
    }
    set modNode(modNode) {
      this.$$set({ modNode });
      flush();
    }
    get editmode() {
      return this.$$.ctx[1];
    }
    set editmode(editmode) {
      this.$$set({ editmode });
      flush();
    }
  }
  create_custom_element(StatValue, { "name": {}, "statNode": {}, "modNode": {}, "editmode": { "type": "Boolean" } }, [], [], true);
  function get_each_context$1(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[3] = list[i];
    const constants_0 = (
      /*sys*/
      child_ctx[0].getNode(
        "fixed",
        "stats",
        /*key*/
        child_ctx[3]
      )
    );
    child_ctx[4] = constants_0;
    const constants_1 = (
      /*sys*/
      child_ctx[0].getNode(
        "derived",
        "modifiers",
        /*key*/
        child_ctx[3]
      )
    );
    child_ctx[5] = constants_1;
    return child_ctx;
  }
  function create_each_block$1(ctx) {
    let staticvalue;
    let current;
    staticvalue = new StatValue({
      props: {
        name: (
          /*key*/
          ctx[3]
        ),
        statNode: (
          /*node*/
          ctx[4]
        ),
        modNode: (
          /*modNode*/
          ctx[5]
        ),
        editmode: (
          /*edit*/
          ctx[1]
        )
      }
    });
    return {
      c() {
        create_component(staticvalue.$$.fragment);
      },
      m(target, anchor) {
        mount_component(staticvalue, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const staticvalue_changes = {};
        if (dirty & /*sys*/
        1) staticvalue_changes.statNode = /*node*/
        ctx2[4];
        if (dirty & /*sys*/
        1) staticvalue_changes.modNode = /*modNode*/
        ctx2[5];
        if (dirty & /*edit*/
        2) staticvalue_changes.editmode = /*edit*/
        ctx2[1];
        staticvalue.$set(staticvalue_changes);
      },
      i(local) {
        if (current) return;
        transition_in(staticvalue.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(staticvalue.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(staticvalue, detaching);
      }
    };
  }
  function create_fragment$5(ctx) {
    let div;
    let current;
    let each_value = ensure_array_like(
      /*stats*/
      ctx[2]
    );
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        div = element("div");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        attr(div, "class", "StatsRow");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(div, null);
          }
        }
        current = true;
      },
      p(ctx2, [dirty]) {
        if (dirty & /*stats, sys, edit*/
        7) {
          each_value = ensure_array_like(
            /*stats*/
            ctx2[2]
          );
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context$1(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block$1(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(div, null);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
      },
      i(local) {
        if (current) return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        destroy_each(each_blocks, detaching);
      }
    };
  }
  function instance$5($$self, $$props, $$invalidate) {
    let { sys } = $$props;
    let { edit = false } = $$props;
    let stats = sys.getNodeNames("fixed", "stats");
    $$self.$$set = ($$props2) => {
      if ("sys" in $$props2) $$invalidate(0, sys = $$props2.sys);
      if ("edit" in $$props2) $$invalidate(1, edit = $$props2.edit);
    };
    return [sys, edit, stats];
  }
  class Stats extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$5, create_fragment$5, safe_not_equal, { sys: 0, edit: 1 });
    }
    get sys() {
      return this.$$.ctx[0];
    }
    set sys(sys) {
      this.$$set({ sys });
      flush();
    }
    get edit() {
      return this.$$.ctx[1];
    }
    set edit(edit) {
      this.$$set({ edit });
      flush();
    }
  }
  create_custom_element(Stats, { "sys": {}, "edit": { "type": "Boolean" } }, [], [], true);
  function create_if_block_1$4(ctx) {
    let div;
    let mounted;
    let dispose;
    return {
      c() {
        div = element("div");
        div.innerHTML = ``;
        attr(div, "class", "ItemManouverOption Up");
        attr(div, "role", "none");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if (!mounted) {
          dispose = [
            listen(
              div,
              "keyup",
              /*keyup_handler*/
              ctx[6]
            ),
            listen(
              div,
              "click",
              /*moveUp*/
              ctx[2]
            )
          ];
          mounted = true;
        }
      },
      p: noop,
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_if_block$4(ctx) {
    let div;
    let mounted;
    let dispose;
    return {
      c() {
        div = element("div");
        div.innerHTML = ``;
        attr(div, "class", "ItemManouverOption Down");
        attr(div, "role", "none");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if (!mounted) {
          dispose = [
            listen(
              div,
              "keyup",
              /*keyup_handler_1*/
              ctx[5]
            ),
            listen(
              div,
              "click",
              /*moveDown*/
              ctx[3]
            )
          ];
          mounted = true;
        }
      },
      p: noop,
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_fragment$4(ctx) {
    let t;
    let if_block1_anchor;
    let if_block0 = (
      /*hasUp*/
      ctx[0] && create_if_block_1$4(ctx)
    );
    let if_block1 = (
      /*hasDown*/
      ctx[1] && create_if_block$4(ctx)
    );
    return {
      c() {
        if (if_block0) if_block0.c();
        t = space();
        if (if_block1) if_block1.c();
        if_block1_anchor = empty();
      },
      m(target, anchor) {
        if (if_block0) if_block0.m(target, anchor);
        insert(target, t, anchor);
        if (if_block1) if_block1.m(target, anchor);
        insert(target, if_block1_anchor, anchor);
      },
      p(ctx2, [dirty]) {
        if (
          /*hasUp*/
          ctx2[0]
        ) {
          if (if_block0) {
            if_block0.p(ctx2, dirty);
          } else {
            if_block0 = create_if_block_1$4(ctx2);
            if_block0.c();
            if_block0.m(t.parentNode, t);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }
        if (
          /*hasDown*/
          ctx2[1]
        ) {
          if (if_block1) {
            if_block1.p(ctx2, dirty);
          } else {
            if_block1 = create_if_block$4(ctx2);
            if_block1.c();
            if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching) {
          detach(t);
          detach(if_block1_anchor);
        }
        if (if_block0) if_block0.d(detaching);
        if (if_block1) if_block1.d(detaching);
      }
    };
  }
  function instance$4($$self, $$props, $$invalidate) {
    let dispatch2 = createEventDispatcher();
    let { data } = $$props;
    let { hasUp } = $$props;
    let { hasDown } = $$props;
    function moveUp() {
      dispatch2("moveUp", data.id);
    }
    function moveDown() {
      dispatch2("moveDown", data.id);
    }
    function keyup_handler_1(event) {
      bubble.call(this, $$self, event);
    }
    function keyup_handler(event) {
      bubble.call(this, $$self, event);
    }
    $$self.$$set = ($$props2) => {
      if ("data" in $$props2) $$invalidate(4, data = $$props2.data);
      if ("hasUp" in $$props2) $$invalidate(0, hasUp = $$props2.hasUp);
      if ("hasDown" in $$props2) $$invalidate(1, hasDown = $$props2.hasDown);
    };
    return [hasUp, hasDown, moveUp, moveDown, data, keyup_handler_1, keyup_handler];
  }
  class ItemManouver extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$4, create_fragment$4, safe_not_equal, { data: 4, hasUp: 0, hasDown: 1 });
    }
    get data() {
      return this.$$.ctx[4];
    }
    set data(data) {
      this.$$set({ data });
      flush();
    }
    get hasUp() {
      return this.$$.ctx[0];
    }
    set hasUp(hasUp) {
      this.$$set({ hasUp });
      flush();
    }
    get hasDown() {
      return this.$$.ctx[1];
    }
    set hasDown(hasDown) {
      this.$$set({ hasDown });
      flush();
    }
  }
  create_custom_element(ItemManouver, { "data": {}, "hasUp": {}, "hasDown": {} }, [], [], true);
  function create_if_block_5$1(ctx) {
    let itemoptions;
    let updating_data;
    let current;
    function itemoptions_data_binding(value) {
      ctx[7](value);
    }
    let itemoptions_props = { editMode: true };
    if (
      /*data*/
      ctx[0] !== void 0
    ) {
      itemoptions_props.data = /*data*/
      ctx[0];
    }
    itemoptions = new ItemOptions({ props: itemoptions_props });
    binding_callbacks.push(() => bind(itemoptions, "data", itemoptions_data_binding));
    itemoptions.$on(
      "optionSelected",
      /*updateData*/
      ctx[3]
    );
    return {
      c() {
        create_component(itemoptions.$$.fragment);
      },
      m(target, anchor) {
        mount_component(itemoptions, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const itemoptions_changes = {};
        if (!updating_data && dirty & /*data*/
        1) {
          updating_data = true;
          itemoptions_changes.data = /*data*/
          ctx2[0];
          add_flush_callback(() => updating_data = false);
        }
        itemoptions.$set(itemoptions_changes);
      },
      i(local) {
        if (current) return;
        transition_in(itemoptions.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(itemoptions.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(itemoptions, detaching);
      }
    };
  }
  function create_if_block_4$1(ctx) {
    let div;
    let stats;
    let div_transition;
    let current;
    stats = new Stats({
      props: {
        edit: (
          /*editMode*/
          ctx[1]
        ),
        sys: (
          /*sys*/
          ctx[2]
        )
      }
    });
    stats.$on(
      "optionSelected",
      /*updateData*/
      ctx[3]
    );
    return {
      c() {
        div = element("div");
        create_component(stats.$$.fragment);
      },
      m(target, anchor) {
        insert(target, div, anchor);
        mount_component(stats, div, null);
        current = true;
      },
      p(ctx2, dirty) {
        const stats_changes = {};
        if (dirty & /*editMode*/
        2) stats_changes.edit = /*editMode*/
        ctx2[1];
        if (dirty & /*sys*/
        4) stats_changes.sys = /*sys*/
        ctx2[2];
        stats.$set(stats_changes);
      },
      i(local) {
        if (current) return;
        transition_in(stats.$$.fragment, local);
        if (local) {
          add_render_callback(() => {
            if (!current) return;
            if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
            div_transition.run(1);
          });
        }
        current = true;
      },
      o(local) {
        transition_out(stats.$$.fragment, local);
        if (local) {
          if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
          div_transition.run(0);
        }
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        destroy_component(stats);
        if (detaching && div_transition) div_transition.end();
      }
    };
  }
  function create_if_block_3$1(ctx) {
    let div;
    let spellinfo;
    let updating_data;
    let div_transition;
    let current;
    function spellinfo_data_binding(value) {
      ctx[11](value);
    }
    let spellinfo_props = {
      edit: (
        /*editMode*/
        ctx[1]
      ),
      sys: (
        /*sys*/
        ctx[2]
      )
    };
    if (
      /*data*/
      ctx[0] !== void 0
    ) {
      spellinfo_props.data = /*data*/
      ctx[0];
    }
    spellinfo = new SpellInfo({ props: spellinfo_props });
    binding_callbacks.push(() => bind(spellinfo, "data", spellinfo_data_binding));
    spellinfo.$on(
      "optionSelected",
      /*updateData*/
      ctx[3]
    );
    return {
      c() {
        div = element("div");
        create_component(spellinfo.$$.fragment);
      },
      m(target, anchor) {
        insert(target, div, anchor);
        mount_component(spellinfo, div, null);
        current = true;
      },
      p(ctx2, dirty) {
        const spellinfo_changes = {};
        if (dirty & /*editMode*/
        2) spellinfo_changes.edit = /*editMode*/
        ctx2[1];
        if (dirty & /*sys*/
        4) spellinfo_changes.sys = /*sys*/
        ctx2[2];
        if (!updating_data && dirty & /*data*/
        1) {
          updating_data = true;
          spellinfo_changes.data = /*data*/
          ctx2[0];
          add_flush_callback(() => updating_data = false);
        }
        spellinfo.$set(spellinfo_changes);
      },
      i(local) {
        if (current) return;
        transition_in(spellinfo.$$.fragment, local);
        if (local) {
          add_render_callback(() => {
            if (!current) return;
            if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
            div_transition.run(1);
          });
        }
        current = true;
      },
      o(local) {
        transition_out(spellinfo.$$.fragment, local);
        if (local) {
          if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
          div_transition.run(0);
        }
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        destroy_component(spellinfo);
        if (detaching && div_transition) div_transition.end();
      }
    };
  }
  function create_if_block_2$2(ctx) {
    let div;
    let skillproficiencycollection;
    let updating_data;
    let div_transition;
    let current;
    function skillproficiencycollection_data_binding(value) {
      ctx[10](value);
    }
    let skillproficiencycollection_props = {
      edit: (
        /*editMode*/
        ctx[1]
      ),
      sys: (
        /*sys*/
        ctx[2]
      )
    };
    if (
      /*data*/
      ctx[0] !== void 0
    ) {
      skillproficiencycollection_props.data = /*data*/
      ctx[0];
    }
    skillproficiencycollection = new SkillProficiencyCollection({ props: skillproficiencycollection_props });
    binding_callbacks.push(() => bind(skillproficiencycollection, "data", skillproficiencycollection_data_binding));
    skillproficiencycollection.$on(
      "optionSelected",
      /*updateData*/
      ctx[3]
    );
    return {
      c() {
        div = element("div");
        create_component(skillproficiencycollection.$$.fragment);
      },
      m(target, anchor) {
        insert(target, div, anchor);
        mount_component(skillproficiencycollection, div, null);
        current = true;
      },
      p(ctx2, dirty) {
        const skillproficiencycollection_changes = {};
        if (dirty & /*editMode*/
        2) skillproficiencycollection_changes.edit = /*editMode*/
        ctx2[1];
        if (dirty & /*sys*/
        4) skillproficiencycollection_changes.sys = /*sys*/
        ctx2[2];
        if (!updating_data && dirty & /*data*/
        1) {
          updating_data = true;
          skillproficiencycollection_changes.data = /*data*/
          ctx2[0];
          add_flush_callback(() => updating_data = false);
        }
        skillproficiencycollection.$set(skillproficiencycollection_changes);
      },
      i(local) {
        if (current) return;
        transition_in(skillproficiencycollection.$$.fragment, local);
        if (local) {
          add_render_callback(() => {
            if (!current) return;
            if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
            div_transition.run(1);
          });
        }
        current = true;
      },
      o(local) {
        transition_out(skillproficiencycollection.$$.fragment, local);
        if (local) {
          if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
          div_transition.run(0);
        }
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        destroy_component(skillproficiencycollection);
        if (detaching && div_transition) div_transition.end();
      }
    };
  }
  function create_if_block_1$3(ctx) {
    let div;
    let proficiencybonus;
    let updating_data;
    let div_transition;
    let current;
    function proficiencybonus_data_binding(value) {
      ctx[9](value);
    }
    let proficiencybonus_props = {
      sys: (
        /*sys*/
        ctx[2]
      ),
      editMode: (
        /*editMode*/
        ctx[1]
      )
    };
    if (
      /*data*/
      ctx[0] !== void 0
    ) {
      proficiencybonus_props.data = /*data*/
      ctx[0];
    }
    proficiencybonus = new ProficiencyBonus({ props: proficiencybonus_props });
    binding_callbacks.push(() => bind(proficiencybonus, "data", proficiencybonus_data_binding));
    proficiencybonus.$on(
      "optionSelected",
      /*updateData*/
      ctx[3]
    );
    return {
      c() {
        div = element("div");
        create_component(proficiencybonus.$$.fragment);
      },
      m(target, anchor) {
        insert(target, div, anchor);
        mount_component(proficiencybonus, div, null);
        current = true;
      },
      p(ctx2, dirty) {
        const proficiencybonus_changes = {};
        if (dirty & /*sys*/
        4) proficiencybonus_changes.sys = /*sys*/
        ctx2[2];
        if (dirty & /*editMode*/
        2) proficiencybonus_changes.editMode = /*editMode*/
        ctx2[1];
        if (!updating_data && dirty & /*data*/
        1) {
          updating_data = true;
          proficiencybonus_changes.data = /*data*/
          ctx2[0];
          add_flush_callback(() => updating_data = false);
        }
        proficiencybonus.$set(proficiencybonus_changes);
      },
      i(local) {
        if (current) return;
        transition_in(proficiencybonus.$$.fragment, local);
        if (local) {
          add_render_callback(() => {
            if (!current) return;
            if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
            div_transition.run(1);
          });
        }
        current = true;
      },
      o(local) {
        transition_out(proficiencybonus.$$.fragment, local);
        if (local) {
          if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
          div_transition.run(0);
        }
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        destroy_component(proficiencybonus);
        if (detaching && div_transition) div_transition.end();
      }
    };
  }
  function create_if_block$3(ctx) {
    let div;
    let hitpoints;
    let updating_data;
    let div_transition;
    let current;
    function hitpoints_data_binding(value) {
      ctx[8](value);
    }
    let hitpoints_props = {
      sys: (
        /*sys*/
        ctx[2]
      ),
      editMode: (
        /*editMode*/
        ctx[1]
      ),
      playMode: false
    };
    if (
      /*data*/
      ctx[0] !== void 0
    ) {
      hitpoints_props.data = /*data*/
      ctx[0];
    }
    hitpoints = new HitPoints({ props: hitpoints_props });
    binding_callbacks.push(() => bind(hitpoints, "data", hitpoints_data_binding));
    hitpoints.$on(
      "optionSelected",
      /*updateData*/
      ctx[3]
    );
    return {
      c() {
        div = element("div");
        create_component(hitpoints.$$.fragment);
      },
      m(target, anchor) {
        insert(target, div, anchor);
        mount_component(hitpoints, div, null);
        current = true;
      },
      p(ctx2, dirty) {
        const hitpoints_changes = {};
        if (dirty & /*sys*/
        4) hitpoints_changes.sys = /*sys*/
        ctx2[2];
        if (dirty & /*editMode*/
        2) hitpoints_changes.editMode = /*editMode*/
        ctx2[1];
        if (!updating_data && dirty & /*data*/
        1) {
          updating_data = true;
          hitpoints_changes.data = /*data*/
          ctx2[0];
          add_flush_callback(() => updating_data = false);
        }
        hitpoints.$set(hitpoints_changes);
      },
      i(local) {
        if (current) return;
        transition_in(hitpoints.$$.fragment, local);
        if (local) {
          add_render_callback(() => {
            if (!current) return;
            if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
            div_transition.run(1);
          });
        }
        current = true;
      },
      o(local) {
        transition_out(hitpoints.$$.fragment, local);
        if (local) {
          if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
          div_transition.run(0);
        }
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        destroy_component(hitpoints);
        if (detaching && div_transition) div_transition.end();
      }
    };
  }
  function create_fragment$3(ctx) {
    let div;
    let t;
    let current_block_type_index;
    let if_block1;
    let current;
    let if_block0 = (
      /*editMode*/
      ctx[1] && create_if_block_5$1(ctx)
    );
    const if_block_creators = [
      create_if_block$3,
      create_if_block_1$3,
      create_if_block_2$2,
      create_if_block_3$1,
      create_if_block_4$1
    ];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (
        /*data*/
        ctx2[0].type == viewNameIndex.HitPoints
      ) return 0;
      if (
        /*data*/
        ctx2[0].type == viewNameIndex.ProficiencyBonus
      ) return 1;
      if (
        /*data*/
        ctx2[0].type == viewNameIndex.SkillProficiencies
      ) return 2;
      if (
        /*data*/
        ctx2[0].type == viewNameIndex.SpellInfo
      ) return 3;
      if (
        /*data*/
        ctx2[0].type == viewNameIndex.Stats
      ) return 4;
      return -1;
    }
    if (~(current_block_type_index = select_block_type(ctx))) {
      if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    }
    return {
      c() {
        div = element("div");
        if (if_block0) if_block0.c();
        t = space();
        if (if_block1) if_block1.c();
        attr(div, "data-name", "ItemDestributor");
        attr(div, "class", "itemDestributer");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if (if_block0) if_block0.m(div, null);
        append(div, t);
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].m(div, null);
        }
        current = true;
      },
      p(ctx2, [dirty]) {
        if (
          /*editMode*/
          ctx2[1]
        ) {
          if (if_block0) {
            if_block0.p(ctx2, dirty);
            if (dirty & /*editMode*/
            2) {
              transition_in(if_block0, 1);
            }
          } else {
            if_block0 = create_if_block_5$1(ctx2);
            if_block0.c();
            transition_in(if_block0, 1);
            if_block0.m(div, t);
          }
        } else if (if_block0) {
          group_outros();
          transition_out(if_block0, 1, 1, () => {
            if_block0 = null;
          });
          check_outros();
        }
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type(ctx2);
        if (current_block_type_index === previous_block_index) {
          if (~current_block_type_index) {
            if_blocks[current_block_type_index].p(ctx2, dirty);
          }
        } else {
          if (if_block1) {
            group_outros();
            transition_out(if_blocks[previous_block_index], 1, 1, () => {
              if_blocks[previous_block_index] = null;
            });
            check_outros();
          }
          if (~current_block_type_index) {
            if_block1 = if_blocks[current_block_type_index];
            if (!if_block1) {
              if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
              if_block1.c();
            } else {
              if_block1.p(ctx2, dirty);
            }
            transition_in(if_block1, 1);
            if_block1.m(div, null);
          } else {
            if_block1 = null;
          }
        }
      },
      i(local) {
        if (current) return;
        transition_in(if_block0);
        transition_in(if_block1);
        current = true;
      },
      o(local) {
        transition_out(if_block0);
        transition_out(if_block1);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if (if_block0) if_block0.d();
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].d();
        }
      }
    };
  }
  function instance$3($$self, $$props, $$invalidate) {
    let { data } = $$props;
    let { editMode } = $$props;
    let { sys } = $$props;
    let { length } = $$props;
    let { index } = $$props;
    let { layoutMode = false } = $$props;
    function updateData(v) {
      console.log(data);
      $$invalidate(0, data);
    }
    function itemoptions_data_binding(value) {
      data = value;
      $$invalidate(0, data);
    }
    function hitpoints_data_binding(value) {
      data = value;
      $$invalidate(0, data);
    }
    function proficiencybonus_data_binding(value) {
      data = value;
      $$invalidate(0, data);
    }
    function skillproficiencycollection_data_binding(value) {
      data = value;
      $$invalidate(0, data);
    }
    function spellinfo_data_binding(value) {
      data = value;
      $$invalidate(0, data);
    }
    $$self.$$set = ($$props2) => {
      if ("data" in $$props2) $$invalidate(0, data = $$props2.data);
      if ("editMode" in $$props2) $$invalidate(1, editMode = $$props2.editMode);
      if ("sys" in $$props2) $$invalidate(2, sys = $$props2.sys);
      if ("length" in $$props2) $$invalidate(4, length = $$props2.length);
      if ("index" in $$props2) $$invalidate(5, index = $$props2.index);
      if ("layoutMode" in $$props2) $$invalidate(6, layoutMode = $$props2.layoutMode);
    };
    return [
      data,
      editMode,
      sys,
      updateData,
      length,
      index,
      layoutMode,
      itemoptions_data_binding,
      hitpoints_data_binding,
      proficiencybonus_data_binding,
      skillproficiencycollection_data_binding,
      spellinfo_data_binding
    ];
  }
  class ItemDestributor extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$3, create_fragment$3, safe_not_equal, {
        data: 0,
        editMode: 1,
        sys: 2,
        length: 4,
        index: 5,
        layoutMode: 6
      });
    }
    get data() {
      return this.$$.ctx[0];
    }
    set data(data) {
      this.$$set({ data });
      flush();
    }
    get editMode() {
      return this.$$.ctx[1];
    }
    set editMode(editMode) {
      this.$$set({ editMode });
      flush();
    }
    get sys() {
      return this.$$.ctx[2];
    }
    set sys(sys) {
      this.$$set({ sys });
      flush();
    }
    get length() {
      return this.$$.ctx[4];
    }
    set length(length) {
      this.$$set({ length });
      flush();
    }
    get index() {
      return this.$$.ctx[5];
    }
    set index(index) {
      this.$$set({ index });
      flush();
    }
    get layoutMode() {
      return this.$$.ctx[6];
    }
    set layoutMode(layoutMode) {
      this.$$set({ layoutMode });
      flush();
    }
  }
  create_custom_element(ItemDestributor, { "data": {}, "editMode": {}, "sys": {}, "length": {}, "index": {}, "layoutMode": { "type": "Boolean" } }, [], [], true);
  function customFlip(node, fromTo, params) {
    if (node.style.animation) node.style = null;
    return flip(node, fromTo, params ?? { duration: 500 });
  }
  function create_if_block$2(ctx) {
    let t;
    let if_block1_anchor;
    let if_block0 = (
      /*onAdd*/
      ctx[3] && create_if_block_2$1(ctx)
    );
    let if_block1 = (
      /*onRemove*/
      ctx[2] && create_if_block_1$2(ctx)
    );
    return {
      c() {
        if (if_block0) if_block0.c();
        t = space();
        if (if_block1) if_block1.c();
        if_block1_anchor = empty();
      },
      m(target, anchor) {
        if (if_block0) if_block0.m(target, anchor);
        insert(target, t, anchor);
        if (if_block1) if_block1.m(target, anchor);
        insert(target, if_block1_anchor, anchor);
      },
      p(ctx2, dirty) {
        if (
          /*onAdd*/
          ctx2[3]
        ) {
          if (if_block0) {
            if_block0.p(ctx2, dirty);
          } else {
            if_block0 = create_if_block_2$1(ctx2);
            if_block0.c();
            if_block0.m(t.parentNode, t);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }
        if (
          /*onRemove*/
          ctx2[2]
        ) {
          if (if_block1) {
            if_block1.p(ctx2, dirty);
          } else {
            if_block1 = create_if_block_1$2(ctx2);
            if_block1.c();
            if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }
      },
      d(detaching) {
        if (detaching) {
          detach(t);
          detach(if_block1_anchor);
        }
        if (if_block0) if_block0.d(detaching);
        if (if_block1) if_block1.d(detaching);
      }
    };
  }
  function create_if_block_2$1(ctx) {
    let div;
    let span;
    let t1;
    let mounted;
    let dispose;
    return {
      c() {
        div = element("div");
        span = element("span");
        span.textContent = "+";
        t1 = text(
          /*addText*/
          ctx[1]
        );
        attr(div, "class", "itemOption add");
        attr(div, "role", "none");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        append(div, span);
        append(div, t1);
        if (!mounted) {
          dispose = [
            listen(
              div,
              "keyup",
              /*keyup_handler*/
              ctx[9]
            ),
            listen(
              div,
              "click",
              /*click_handler*/
              ctx[10]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (dirty & /*addText*/
        2) set_data(
          t1,
          /*addText*/
          ctx2[1]
        );
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_if_block_1$2(ctx) {
    let div;
    let mounted;
    let dispose;
    return {
      c() {
        div = element("div");
        div.textContent = "X";
        attr(div, "class", "itemOption rem");
        attr(div, "role", "none");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if (!mounted) {
          dispose = [
            listen(
              div,
              "keyup",
              /*keyup_handler_1*/
              ctx[8]
            ),
            listen(
              div,
              "click",
              /*click_handler_1*/
              ctx[11]
            )
          ];
          mounted = true;
        }
      },
      p: noop,
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_fragment$2(ctx) {
    let if_block_anchor;
    let if_block = (
      /*active*/
      ctx[0] && create_if_block$2(ctx)
    );
    return {
      c() {
        if (if_block) if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if (if_block) if_block.m(target, anchor);
        insert(target, if_block_anchor, anchor);
      },
      p(ctx2, [dirty]) {
        if (
          /*active*/
          ctx2[0]
        ) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block$2(ctx2);
            if_block.c();
            if_block.m(if_block_anchor.parentNode, if_block_anchor);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
      },
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching) {
          detach(if_block_anchor);
        }
        if (if_block) if_block.d(detaching);
      }
    };
  }
  function instance$2($$self, $$props, $$invalidate) {
    let { active: active2 } = $$props;
    let { addText = "Add Item" } = $$props;
    let { remText = "Remove This Item" } = $$props;
    let { offset = 0 } = $$props;
    let { side = "left" } = $$props;
    let { verti = "bottom" } = $$props;
    let { onRemove = null } = $$props;
    let { onAdd = null } = $$props;
    function keyup_handler_1(event) {
      bubble.call(this, $$self, event);
    }
    function keyup_handler(event) {
      bubble.call(this, $$self, event);
    }
    const click_handler = () => onAdd();
    const click_handler_1 = () => onRemove();
    $$self.$$set = ($$props2) => {
      if ("active" in $$props2) $$invalidate(0, active2 = $$props2.active);
      if ("addText" in $$props2) $$invalidate(1, addText = $$props2.addText);
      if ("remText" in $$props2) $$invalidate(4, remText = $$props2.remText);
      if ("offset" in $$props2) $$invalidate(5, offset = $$props2.offset);
      if ("side" in $$props2) $$invalidate(6, side = $$props2.side);
      if ("verti" in $$props2) $$invalidate(7, verti = $$props2.verti);
      if ("onRemove" in $$props2) $$invalidate(2, onRemove = $$props2.onRemove);
      if ("onAdd" in $$props2) $$invalidate(3, onAdd = $$props2.onAdd);
    };
    return [
      active2,
      addText,
      onRemove,
      onAdd,
      remText,
      offset,
      side,
      verti,
      keyup_handler_1,
      keyup_handler,
      click_handler,
      click_handler_1
    ];
  }
  class RowColumnOptions extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$2, create_fragment$2, safe_not_equal, {
        active: 0,
        addText: 1,
        remText: 4,
        offset: 5,
        side: 6,
        verti: 7,
        onRemove: 2,
        onAdd: 3
      });
    }
    get active() {
      return this.$$.ctx[0];
    }
    set active(active2) {
      this.$$set({ active: active2 });
      flush();
    }
    get addText() {
      return this.$$.ctx[1];
    }
    set addText(addText) {
      this.$$set({ addText });
      flush();
    }
    get remText() {
      return this.$$.ctx[4];
    }
    set remText(remText) {
      this.$$set({ remText });
      flush();
    }
    get offset() {
      return this.$$.ctx[5];
    }
    set offset(offset) {
      this.$$set({ offset });
      flush();
    }
    get side() {
      return this.$$.ctx[6];
    }
    set side(side) {
      this.$$set({ side });
      flush();
    }
    get verti() {
      return this.$$.ctx[7];
    }
    set verti(verti) {
      this.$$set({ verti });
      flush();
    }
    get onRemove() {
      return this.$$.ctx[2];
    }
    set onRemove(onRemove) {
      this.$$set({ onRemove });
      flush();
    }
    get onAdd() {
      return this.$$.ctx[3];
    }
    set onAdd(onAdd) {
      this.$$set({ onAdd });
      flush();
    }
  }
  create_custom_element(RowColumnOptions, { "active": {}, "addText": {}, "remText": {}, "offset": {}, "side": {}, "verti": {}, "onRemove": {}, "onAdd": {} }, [], [], true);
  function create_if_block_1$1(ctx) {
    let div;
    let div_transition;
    let current;
    return {
      c() {
        div = element("div");
        div.textContent = "Saving..";
        attr(div, "class", "spinner");
        attr(div, "data-state", "finished");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        current = true;
      },
      i(local) {
        if (current) return;
        if (local) {
          add_render_callback(() => {
            if (!current) return;
            if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { x: 100 }, true);
            div_transition.run(1);
          });
        }
        current = true;
      },
      o(local) {
        if (local) {
          if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { x: 100 }, false);
          div_transition.run(0);
        }
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if (detaching && div_transition) div_transition.end();
      }
    };
  }
  function create_if_block$1(ctx) {
    let div;
    let div_transition;
    let current;
    return {
      c() {
        div = element("div");
        div.textContent = "Editing..";
        attr(div, "class", "spinner");
        attr(div, "data-state", "ongoing");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        current = true;
      },
      i(local) {
        if (current) return;
        if (local) {
          add_render_callback(() => {
            if (!current) return;
            if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { x: 100 }, true);
            div_transition.run(1);
          });
        }
        current = true;
      },
      o(local) {
        if (local) {
          if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { x: 100 }, false);
          div_transition.run(0);
        }
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if (detaching && div_transition) div_transition.end();
      }
    };
  }
  function create_fragment$1(ctx) {
    let div;
    let current_block_type_index;
    let if_block;
    const if_block_creators = [create_if_block$1, create_if_block_1$1];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (
        /*_active*/
        ctx2[1]
      ) return 0;
      if (
        /*_subActive*/
        ctx2[2]
      ) return 1;
      return -1;
    }
    if (~(current_block_type_index = select_block_type(ctx))) {
      if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    }
    return {
      c() {
        div = element("div");
        if (if_block) if_block.c();
        attr(div, "class", "LoadingSpinner");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].m(div, null);
        }
      },
      p(ctx2, [dirty]) {
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type(ctx2);
        if (current_block_type_index !== previous_block_index) {
          if (if_block) {
            group_outros();
            transition_out(if_blocks[previous_block_index], 1, 1, () => {
              if_blocks[previous_block_index] = null;
            });
            check_outros();
          }
          if (~current_block_type_index) {
            if_block = if_blocks[current_block_type_index];
            if (!if_block) {
              if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
              if_block.c();
            }
            transition_in(if_block, 1);
            if_block.m(div, null);
          } else {
            if_block = null;
          }
        }
      },
      i(local) {
        transition_in(if_block);
      },
      o(local) {
        transition_out(if_block);
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].d();
        }
      }
    };
  }
  function instance$1($$self, $$props, $$invalidate) {
    let $active, $$unsubscribe_active = noop, $$subscribe_active = () => ($$unsubscribe_active(), $$unsubscribe_active = subscribe(active2, ($$value) => $$invalidate(3, $active = $$value)), active2);
    $$self.$$.on_destroy.push(() => $$unsubscribe_active());
    let { active: active2 } = $$props;
    $$subscribe_active();
    let _active;
    let _subActive;
    active2.subscribe((p) => {
      if (!p) {
        $$invalidate(1, _active = false);
        $$invalidate(2, _subActive = true);
        scheduleSubDeactivation();
      } else {
        $$invalidate(1, _active = true);
        $$invalidate(2, _subActive = true);
      }
    });
    function scheduleSubDeactivation() {
      setTimeout(
        () => {
          if (!$active) $$invalidate(2, _subActive = false);
        },
        1e3
      );
    }
    $$self.$$set = ($$props2) => {
      if ("active" in $$props2) $$subscribe_active($$invalidate(0, active2 = $$props2.active));
    };
    return [active2, _active, _subActive];
  }
  class LoadingSpinner extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance$1, create_fragment$1, safe_not_equal, { active: 0 });
    }
    get active() {
      return this.$$.ctx[0];
    }
    set active(active2) {
      this.$$set({ active: active2 });
      flush();
    }
  }
  create_custom_element(LoadingSpinner, { "active": {} }, [], [], true);
  function get_each_context(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[56] = list[i];
    child_ctx[58] = i;
    return child_ctx;
  }
  function get_each_context_1(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[59] = list[i];
    child_ctx[61] = i;
    return child_ctx;
  }
  function get_each_context_2(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[62] = list[i];
    child_ctx[63] = list;
    child_ctx[64] = i;
    return child_ctx;
  }
  function create_if_block_5(ctx) {
    let div1;
    let div0;
    let mounted;
    let dispose;
    function click_handler_4() {
      return (
        /*click_handler_4*/
        ctx[28](
          /*row*/
          ctx[56]
        )
      );
    }
    return {
      c() {
        div1 = element("div");
        div0 = element("div");
        div0.innerHTML = ``;
        attr(div0, "class", "remRow");
        attr(div0, "role", "none");
        attr(div1, "class", "manouverHeader");
      },
      m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, div0);
        if (!mounted) {
          dispose = [
            listen(
              div0,
              "keypress",
              /*keypress_handler*/
              ctx[23]
            ),
            listen(div0, "click", click_handler_4)
          ];
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
      },
      d(detaching) {
        if (detaching) {
          detach(div1);
        }
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_if_block_4(ctx) {
    let div1;
    let div0;
    let mounted;
    let dispose;
    function click_handler_5() {
      return (
        /*click_handler_5*/
        ctx[29](
          /*row*/
          ctx[56],
          /*column*/
          ctx[59]
        )
      );
    }
    return {
      c() {
        div1 = element("div");
        div0 = element("div");
        div0.innerHTML = ``;
        attr(div0, "class", "remRow");
        attr(div0, "role", "none");
        attr(div1, "class", "manouverHeader");
      },
      m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, div0);
        if (!mounted) {
          dispose = [
            listen(
              div0,
              "keypress",
              /*keypress_handler_1*/
              ctx[22]
            ),
            listen(div0, "click", click_handler_5)
          ];
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
      },
      d(detaching) {
        if (detaching) {
          detach(div1);
        }
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_if_block_3(ctx) {
    let div1;
    let div0;
    let t;
    let itemmanouver;
    let updating_data;
    let current;
    let mounted;
    let dispose;
    function click_handler_6() {
      return (
        /*click_handler_6*/
        ctx[30](
          /*column*/
          ctx[59],
          /*item*/
          ctx[62]
        )
      );
    }
    function itemmanouver_data_binding(value) {
      ctx[31](
        value,
        /*item*/
        ctx[62],
        /*each_value_2*/
        ctx[63],
        /*k*/
        ctx[64]
      );
    }
    let itemmanouver_props = {
      hasDown: (
        /*k*/
        ctx[64] != /*column*/
        ctx[59].data.length - 1
      ),
      hasUp: (
        /*k*/
        ctx[64] != 0
      )
    };
    if (
      /*item*/
      ctx[62] !== void 0
    ) {
      itemmanouver_props.data = /*item*/
      ctx[62];
    }
    itemmanouver = new ItemManouver({ props: itemmanouver_props });
    binding_callbacks.push(() => bind(itemmanouver, "data", itemmanouver_data_binding));
    itemmanouver.$on(
      "moveUp",
      /*moveUp_handler*/
      ctx[32]
    );
    itemmanouver.$on(
      "moveDown",
      /*moveDown_handler*/
      ctx[33]
    );
    return {
      c() {
        div1 = element("div");
        div0 = element("div");
        div0.innerHTML = ``;
        t = space();
        create_component(itemmanouver.$$.fragment);
        attr(div0, "class", "remItem");
        attr(div0, "role", "none");
        attr(div1, "class", "manouverHeader");
      },
      m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, div0);
        append(div1, t);
        mount_component(itemmanouver, div1, null);
        current = true;
        if (!mounted) {
          dispose = [
            listen(div0, "click", click_handler_6),
            listen(
              div0,
              "keypress",
              /*keypress_handler_2*/
              ctx[21]
            )
          ];
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        const itemmanouver_changes = {};
        if (dirty[0] & /*$OBJ*/
        32) itemmanouver_changes.hasDown = /*k*/
        ctx[64] != /*column*/
        ctx[59].data.length - 1;
        if (dirty[0] & /*$OBJ*/
        32) itemmanouver_changes.hasUp = /*k*/
        ctx[64] != 0;
        if (!updating_data && dirty[0] & /*$OBJ*/
        32) {
          updating_data = true;
          itemmanouver_changes.data = /*item*/
          ctx[62];
          add_flush_callback(() => updating_data = false);
        }
        itemmanouver.$set(itemmanouver_changes);
      },
      i(local) {
        if (current) return;
        transition_in(itemmanouver.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(itemmanouver.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div1);
        }
        destroy_component(itemmanouver);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_each_block_2(key_1, ctx) {
    let div;
    let t;
    let itemdestributor;
    let div_data_edit_value;
    let div_data_itemid_value;
    let div_data_dragging_value;
    let div_transition;
    let rect;
    let stop_animation = noop;
    let current;
    let mounted;
    let dispose;
    let if_block = (
      /*$editLayout_03*/
      ctx[1] && create_if_block_3(ctx)
    );
    itemdestributor = new ItemDestributor({
      props: {
        data: (
          /*item*/
          ctx[62]
        ),
        editMode: (
          /*$editMode*/
          ctx[4]
        ),
        layoutMode: (
          /*$editLayout_03*/
          ctx[1]
        ),
        sys: (
          /*sys*/
          ctx[0]
        ),
        length: (
          /*column*/
          ctx[59].data.length
        ),
        index: (
          /*k*/
          ctx[64]
        )
      }
    });
    itemdestributor.$on(
      "moveUp",
      /*moveUp_handler_1*/
      ctx[34]
    );
    itemdestributor.$on(
      "moveDown",
      /*moveDown_handler_1*/
      ctx[35]
    );
    function dragstart_handler(...args) {
      return (
        /*dragstart_handler*/
        ctx[36](
          /*item*/
          ctx[62],
          ...args
        )
      );
    }
    function dragend_handler(...args) {
      return (
        /*dragend_handler*/
        ctx[37](
          /*item*/
          ctx[62],
          ...args
        )
      );
    }
    function drop_handler(...args) {
      return (
        /*drop_handler*/
        ctx[38](
          /*item*/
          ctx[62],
          ...args
        )
      );
    }
    function dragleave_handler(...args) {
      return (
        /*dragleave_handler*/
        ctx[39](
          /*item*/
          ctx[62],
          ...args
        )
      );
    }
    return {
      key: key_1,
      first: null,
      c() {
        div = element("div");
        if (if_block) if_block.c();
        t = space();
        create_component(itemdestributor.$$.fragment);
        attr(div, "class", "Item");
        attr(div, "data-edit", div_data_edit_value = /*$editMode*/
        ctx[4] || /*$editLayout_03*/
        ctx[1] || /*$editLayout_02*/
        ctx[2]);
        attr(div, "data-itemid", div_data_itemid_value = /*item*/
        ctx[62].id);
        attr(
          div,
          "data-edit-active",
          /*$editLayout_03*/
          ctx[1]
        );
        attr(div, "data-dragging", div_data_dragging_value = /*DragItemHandler*/
        ctx[15].isBeingDragged(
          /*item*/
          ctx[62].id
        ));
        attr(div, "role", "none");
        attr(
          div,
          "draggable",
          /*$editLayout_03*/
          ctx[1]
        );
        this.first = div;
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if (if_block) if_block.m(div, null);
        append(div, t);
        mount_component(itemdestributor, div, null);
        current = true;
        if (!mounted) {
          dispose = [
            listen(div, "dragstart", dragstart_handler),
            listen(div, "dragend", dragend_handler),
            listen(div, "drop", drop_handler),
            listen(div, "dragleave", dragleave_handler),
            listen(div, "dragover", dragover_handler)
          ];
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        if (
          /*$editLayout_03*/
          ctx[1]
        ) {
          if (if_block) {
            if_block.p(ctx, dirty);
            if (dirty[0] & /*$editLayout_03*/
            2) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block_3(ctx);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(div, t);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
        const itemdestributor_changes = {};
        if (dirty[0] & /*$OBJ*/
        32) itemdestributor_changes.data = /*item*/
        ctx[62];
        if (dirty[0] & /*$editMode*/
        16) itemdestributor_changes.editMode = /*$editMode*/
        ctx[4];
        if (dirty[0] & /*$editLayout_03*/
        2) itemdestributor_changes.layoutMode = /*$editLayout_03*/
        ctx[1];
        if (dirty[0] & /*sys*/
        1) itemdestributor_changes.sys = /*sys*/
        ctx[0];
        if (dirty[0] & /*$OBJ*/
        32) itemdestributor_changes.length = /*column*/
        ctx[59].data.length;
        if (dirty[0] & /*$OBJ*/
        32) itemdestributor_changes.index = /*k*/
        ctx[64];
        itemdestributor.$set(itemdestributor_changes);
        if (!current || dirty[0] & /*$editMode, $editLayout_03, $editLayout_02*/
        22 && div_data_edit_value !== (div_data_edit_value = /*$editMode*/
        ctx[4] || /*$editLayout_03*/
        ctx[1] || /*$editLayout_02*/
        ctx[2])) {
          attr(div, "data-edit", div_data_edit_value);
        }
        if (!current || dirty[0] & /*$OBJ*/
        32 && div_data_itemid_value !== (div_data_itemid_value = /*item*/
        ctx[62].id)) {
          attr(div, "data-itemid", div_data_itemid_value);
        }
        if (!current || dirty[0] & /*$editLayout_03*/
        2) {
          attr(
            div,
            "data-edit-active",
            /*$editLayout_03*/
            ctx[1]
          );
        }
        if (!current || dirty[0] & /*$OBJ*/
        32 && div_data_dragging_value !== (div_data_dragging_value = /*DragItemHandler*/
        ctx[15].isBeingDragged(
          /*item*/
          ctx[62].id
        ))) {
          attr(div, "data-dragging", div_data_dragging_value);
        }
        if (!current || dirty[0] & /*$editLayout_03*/
        2) {
          attr(
            div,
            "draggable",
            /*$editLayout_03*/
            ctx[1]
          );
        }
      },
      r() {
        rect = div.getBoundingClientRect();
      },
      f() {
        fix_position(div);
        stop_animation();
        add_transform(div, rect);
      },
      a() {
        stop_animation();
        stop_animation = create_animation(div, rect, customFlip, { duration: ANIMATION_TIME });
      },
      i(local) {
        if (current) return;
        transition_in(if_block);
        transition_in(itemdestributor.$$.fragment, local);
        if (local) {
          add_render_callback(() => {
            if (!current) return;
            if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: ANIMATION_TIME }, true);
            div_transition.run(1);
          });
        }
        current = true;
      },
      o(local) {
        transition_out(if_block);
        transition_out(itemdestributor.$$.fragment, local);
        if (local) {
          if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: ANIMATION_TIME }, false);
          div_transition.run(0);
        }
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if (if_block) if_block.d();
        destroy_component(itemdestributor);
        if (detaching && div_transition) div_transition.end();
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_if_block_2(ctx) {
    let div;
    let div_transition;
    let current;
    let mounted;
    let dispose;
    function click_handler_7() {
      return (
        /*click_handler_7*/
        ctx[40](
          /*column*/
          ctx[59]
        )
      );
    }
    return {
      c() {
        div = element("div");
        div.innerHTML = `<span>+</span> add item`;
        attr(div, "class", "AddItem");
        attr(div, "data-edit", "true");
        attr(div, "role", "none");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        current = true;
        if (!mounted) {
          dispose = [
            listen(div, "click", click_handler_7),
            listen(
              div,
              "keypress",
              /*keypress_handler_3*/
              ctx[20]
            )
          ];
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
      },
      i(local) {
        if (current) return;
        if (local) {
          add_render_callback(() => {
            if (!current) return;
            if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { duration: ANIMATION_TIME, y: 100 }, true);
            div_transition.run(1);
          });
        }
        current = true;
      },
      o(local) {
        if (local) {
          if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { duration: ANIMATION_TIME, y: 100 }, false);
          div_transition.run(0);
        }
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if (detaching && div_transition) div_transition.end();
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_each_block_1(key_1, ctx) {
    let div;
    let t0;
    let each_blocks = [];
    let each_1_lookup = /* @__PURE__ */ new Map();
    let t1;
    let div_data_edit_value;
    let div_data_itemid_value;
    let div_data_dragging_value;
    let div_transition;
    let rect;
    let stop_animation = noop;
    let current;
    let mounted;
    let dispose;
    let if_block0 = (
      /*$editLayout_02*/
      ctx[2] && create_if_block_4(ctx)
    );
    let each_value_2 = ensure_array_like(
      /*column*/
      ctx[59].data
    );
    const get_key = (ctx2) => (
      /*item*/
      ctx2[62].id
    );
    for (let i = 0; i < each_value_2.length; i += 1) {
      let child_ctx = get_each_context_2(ctx, each_value_2, i);
      let key = get_key(child_ctx);
      each_1_lookup.set(key, each_blocks[i] = create_each_block_2(key, child_ctx));
    }
    let if_block1 = (
      /*$editLayout_03*/
      ctx[1] && create_if_block_2(ctx)
    );
    function dragstart_handler_1(...args) {
      return (
        /*dragstart_handler_1*/
        ctx[41](
          /*column*/
          ctx[59],
          ...args
        )
      );
    }
    function dragenter_handler(...args) {
      return (
        /*dragenter_handler*/
        ctx[42](
          /*column*/
          ctx[59],
          ...args
        )
      );
    }
    function dragend_handler_1(...args) {
      return (
        /*dragend_handler_1*/
        ctx[43](
          /*column*/
          ctx[59],
          ...args
        )
      );
    }
    function drop_handler_1(...args) {
      return (
        /*drop_handler_1*/
        ctx[44](
          /*column*/
          ctx[59],
          ...args
        )
      );
    }
    function dragleave_handler_1(...args) {
      return (
        /*dragleave_handler_1*/
        ctx[45](
          /*column*/
          ctx[59],
          ...args
        )
      );
    }
    function dragover_handler_1(...args) {
      return (
        /*dragover_handler_1*/
        ctx[46](
          /*column*/
          ctx[59],
          ...args
        )
      );
    }
    return {
      key: key_1,
      first: null,
      c() {
        div = element("div");
        if (if_block0) if_block0.c();
        t0 = space();
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t1 = space();
        if (if_block1) if_block1.c();
        attr(div, "class", "Column");
        attr(div, "data-edit", div_data_edit_value = /*$editLayout_02*/
        ctx[2] || /*$editLayout_01*/
        ctx[3]);
        attr(
          div,
          "data-editpreview",
          /*$editLayout_03*/
          ctx[1]
        );
        attr(div, "data-itemid", div_data_itemid_value = /*column*/
        ctx[59].id);
        attr(
          div,
          "data-edit-active",
          /*$editLayout_02*/
          ctx[2]
        );
        attr(div, "data-dragging", div_data_dragging_value = /*DragColumnHandler*/
        ctx[14].isBeingDragged(
          /*column*/
          ctx[59].id
        ));
        attr(div, "role", "none");
        attr(
          div,
          "draggable",
          /*$editLayout_02*/
          ctx[2]
        );
        this.first = div;
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if (if_block0) if_block0.m(div, null);
        append(div, t0);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(div, null);
          }
        }
        append(div, t1);
        if (if_block1) if_block1.m(div, null);
        current = true;
        if (!mounted) {
          dispose = [
            listen(div, "dragstart", dragstart_handler_1),
            listen(div, "dragenter", dragenter_handler),
            listen(div, "dragend", dragend_handler_1),
            listen(div, "drop", drop_handler_1),
            listen(div, "dragleave", dragleave_handler_1),
            listen(div, "dragover", dragover_handler_1)
          ];
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        if (
          /*$editLayout_02*/
          ctx[2]
        ) {
          if (if_block0) {
            if_block0.p(ctx, dirty);
          } else {
            if_block0 = create_if_block_4(ctx);
            if_block0.c();
            if_block0.m(div, t0);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }
        if (dirty[0] & /*$editMode, $editLayout_03, $editLayout_02, $OBJ, DragItemHandler, sys, itemRequestMove, OBJ*/
        35895) {
          each_value_2 = ensure_array_like(
            /*column*/
            ctx[59].data
          );
          group_outros();
          for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
          each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_2, each_1_lookup, div, fix_and_outro_and_destroy_block, create_each_block_2, t1, get_each_context_2);
          for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
          check_outros();
        }
        if (
          /*$editLayout_03*/
          ctx[1]
        ) {
          if (if_block1) {
            if_block1.p(ctx, dirty);
            if (dirty[0] & /*$editLayout_03*/
            2) {
              transition_in(if_block1, 1);
            }
          } else {
            if_block1 = create_if_block_2(ctx);
            if_block1.c();
            transition_in(if_block1, 1);
            if_block1.m(div, null);
          }
        } else if (if_block1) {
          group_outros();
          transition_out(if_block1, 1, 1, () => {
            if_block1 = null;
          });
          check_outros();
        }
        if (!current || dirty[0] & /*$editLayout_02, $editLayout_01*/
        12 && div_data_edit_value !== (div_data_edit_value = /*$editLayout_02*/
        ctx[2] || /*$editLayout_01*/
        ctx[3])) {
          attr(div, "data-edit", div_data_edit_value);
        }
        if (!current || dirty[0] & /*$editLayout_03*/
        2) {
          attr(
            div,
            "data-editpreview",
            /*$editLayout_03*/
            ctx[1]
          );
        }
        if (!current || dirty[0] & /*$OBJ*/
        32 && div_data_itemid_value !== (div_data_itemid_value = /*column*/
        ctx[59].id)) {
          attr(div, "data-itemid", div_data_itemid_value);
        }
        if (!current || dirty[0] & /*$editLayout_02*/
        4) {
          attr(
            div,
            "data-edit-active",
            /*$editLayout_02*/
            ctx[2]
          );
        }
        if (!current || dirty[0] & /*$OBJ*/
        32 && div_data_dragging_value !== (div_data_dragging_value = /*DragColumnHandler*/
        ctx[14].isBeingDragged(
          /*column*/
          ctx[59].id
        ))) {
          attr(div, "data-dragging", div_data_dragging_value);
        }
        if (!current || dirty[0] & /*$editLayout_02*/
        4) {
          attr(
            div,
            "draggable",
            /*$editLayout_02*/
            ctx[2]
          );
        }
      },
      r() {
        rect = div.getBoundingClientRect();
      },
      f() {
        fix_position(div);
        stop_animation();
        add_transform(div, rect);
      },
      a() {
        stop_animation();
        stop_animation = create_animation(div, rect, customFlip, { duration: ANIMATION_TIME });
      },
      i(local) {
        if (current) return;
        for (let i = 0; i < each_value_2.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        transition_in(if_block1);
        if (local) {
          add_render_callback(() => {
            if (!current) return;
            if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: ANIMATION_TIME }, true);
            div_transition.run(1);
          });
        }
        current = true;
      },
      o(local) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        transition_out(if_block1);
        if (local) {
          if (!div_transition) div_transition = create_bidirectional_transition(div, fade, { duration: ANIMATION_TIME }, false);
          div_transition.run(0);
        }
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if (if_block0) if_block0.d();
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].d();
        }
        if (if_block1) if_block1.d();
        if (detaching && div_transition) div_transition.end();
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_if_block_1(ctx) {
    let div;
    let div_transition;
    let current;
    let mounted;
    let dispose;
    function click_handler_8() {
      return (
        /*click_handler_8*/
        ctx[47](
          /*row*/
          ctx[56]
        )
      );
    }
    return {
      c() {
        div = element("div");
        div.innerHTML = `<span>+</span> add Column`;
        attr(div, "class", "AddColumn");
        attr(div, "data-edit", "true");
        attr(div, "role", "none");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        current = true;
        if (!mounted) {
          dispose = [
            listen(div, "click", click_handler_8),
            listen(
              div,
              "keypress",
              /*keypress_handler_4*/
              ctx[19]
            )
          ];
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
      },
      i(local) {
        if (current) return;
        if (local) {
          add_render_callback(() => {
            if (!current) return;
            if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { duration: ANIMATION_TIME, y: 100 }, true);
            div_transition.run(1);
          });
        }
        current = true;
      },
      o(local) {
        if (local) {
          if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { duration: ANIMATION_TIME, y: 100 }, false);
          div_transition.run(0);
        }
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if (detaching && div_transition) div_transition.end();
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_each_block(key_1, ctx) {
    let div;
    let t0;
    let each_blocks = [];
    let each_1_lookup = /* @__PURE__ */ new Map();
    let t1;
    let div_style_value;
    let div_data_rowid_value;
    let div_transition;
    let rect;
    let stop_animation = noop;
    let current;
    let mounted;
    let dispose;
    let if_block0 = (
      /*$editLayout_01*/
      ctx[3] && create_if_block_5(ctx)
    );
    let each_value_1 = ensure_array_like(
      /*row*/
      ctx[56].data
    );
    const get_key = (ctx2) => (
      /*column*/
      ctx2[59].id
    );
    for (let i = 0; i < each_value_1.length; i += 1) {
      let child_ctx = get_each_context_1(ctx, each_value_1, i);
      let key = get_key(child_ctx);
      each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    }
    let if_block1 = (
      /*$editLayout_02*/
      ctx[2] && create_if_block_1(ctx)
    );
    function dragstart_handler_2(...args) {
      return (
        /*dragstart_handler_2*/
        ctx[48](
          /*row*/
          ctx[56],
          ...args
        )
      );
    }
    function dragenter_handler_1(...args) {
      return (
        /*dragenter_handler_1*/
        ctx[49](
          /*row*/
          ctx[56],
          ...args
        )
      );
    }
    function dragend_handler_2(...args) {
      return (
        /*dragend_handler_2*/
        ctx[50](
          /*row*/
          ctx[56],
          ...args
        )
      );
    }
    function dragover_handler_2(...args) {
      return (
        /*dragover_handler_2*/
        ctx[51](
          /*row*/
          ctx[56],
          ...args
        )
      );
    }
    return {
      key: key_1,
      first: null,
      c() {
        div = element("div");
        if (if_block0) if_block0.c();
        t0 = space();
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t1 = space();
        if (if_block1) if_block1.c();
        attr(div, "class", "Row");
        attr(
          div,
          "data-edit",
          /*$editLayout_01*/
          ctx[3]
        );
        attr(
          div,
          "data-edit-active",
          /*$editLayout_01*/
          ctx[3]
        );
        attr(
          div,
          "data-editpreview",
          /*$editLayout_02*/
          ctx[2]
        );
        attr(div, "role", "none");
        attr(div, "style", div_style_value = `grid-template-columns: ${repeat(
          /*row*/
          ctx[56].data.length,
          "1fr"
        )} auto`);
        attr(div, "data-rowid", div_data_rowid_value = /*row*/
        ctx[56].id);
        attr(
          div,
          "draggable",
          /*$editLayout_01*/
          ctx[3]
        );
        this.first = div;
      },
      m(target, anchor) {
        insert(target, div, anchor);
        if (if_block0) if_block0.m(div, null);
        append(div, t0);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(div, null);
          }
        }
        append(div, t1);
        if (if_block1) if_block1.m(div, null);
        current = true;
        if (!mounted) {
          dispose = [
            listen(div, "dragstart", dragstart_handler_2),
            listen(div, "dragenter", dragenter_handler_1),
            listen(div, "dragend", dragend_handler_2),
            listen(div, "dragover", dragover_handler_2)
          ];
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        if (
          /*$editLayout_01*/
          ctx[3]
        ) {
          if (if_block0) {
            if_block0.p(ctx, dirty);
          } else {
            if_block0 = create_if_block_5(ctx);
            if_block0.c();
            if_block0.m(div, t0);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }
        if (dirty[0] & /*$editLayout_02, $editLayout_01, $editLayout_03, $OBJ, DragColumnHandler, DragItemHandler, OBJ, $editMode, sys, itemRequestMove*/
        52287) {
          each_value_1 = ensure_array_like(
            /*row*/
            ctx[56].data
          );
          group_outros();
          for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
          each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, fix_and_outro_and_destroy_block, create_each_block_1, t1, get_each_context_1);
          for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
          check_outros();
        }
        if (
          /*$editLayout_02*/
          ctx[2]
        ) {
          if (if_block1) {
            if_block1.p(ctx, dirty);
            if (dirty[0] & /*$editLayout_02*/
            4) {
              transition_in(if_block1, 1);
            }
          } else {
            if_block1 = create_if_block_1(ctx);
            if_block1.c();
            transition_in(if_block1, 1);
            if_block1.m(div, null);
          }
        } else if (if_block1) {
          group_outros();
          transition_out(if_block1, 1, 1, () => {
            if_block1 = null;
          });
          check_outros();
        }
        if (!current || dirty[0] & /*$editLayout_01*/
        8) {
          attr(
            div,
            "data-edit",
            /*$editLayout_01*/
            ctx[3]
          );
        }
        if (!current || dirty[0] & /*$editLayout_01*/
        8) {
          attr(
            div,
            "data-edit-active",
            /*$editLayout_01*/
            ctx[3]
          );
        }
        if (!current || dirty[0] & /*$editLayout_02*/
        4) {
          attr(
            div,
            "data-editpreview",
            /*$editLayout_02*/
            ctx[2]
          );
        }
        if (!current || dirty[0] & /*$OBJ*/
        32 && div_style_value !== (div_style_value = `grid-template-columns: ${repeat(
          /*row*/
          ctx[56].data.length,
          "1fr"
        )} auto`)) {
          attr(div, "style", div_style_value);
        }
        if (!current || dirty[0] & /*$OBJ*/
        32 && div_data_rowid_value !== (div_data_rowid_value = /*row*/
        ctx[56].id)) {
          attr(div, "data-rowid", div_data_rowid_value);
        }
        if (!current || dirty[0] & /*$editLayout_01*/
        8) {
          attr(
            div,
            "draggable",
            /*$editLayout_01*/
            ctx[3]
          );
        }
      },
      r() {
        rect = div.getBoundingClientRect();
      },
      f() {
        fix_position(div);
        stop_animation();
        add_transform(div, rect);
      },
      a() {
        stop_animation();
        stop_animation = create_animation(div, rect, customFlip, { duration: ANIMATION_TIME });
      },
      i(local) {
        if (current) return;
        for (let i = 0; i < each_value_1.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        transition_in(if_block1);
        if (local) {
          add_render_callback(() => {
            if (!current) return;
            if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { duration: ANIMATION_TIME, y: 100 }, true);
            div_transition.run(1);
          });
        }
        current = true;
      },
      o(local) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        transition_out(if_block1);
        if (local) {
          if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { duration: ANIMATION_TIME, y: 100 }, false);
          div_transition.run(0);
        }
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if (if_block0) if_block0.d();
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].d();
        }
        if (if_block1) if_block1.d();
        if (detaching && div_transition) div_transition.end();
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_if_block(ctx) {
    let div;
    let div_transition;
    let current;
    let mounted;
    let dispose;
    return {
      c() {
        div = element("div");
        div.innerHTML = `<span>+</span> add Row`;
        attr(div, "class", "AddRow");
        attr(div, "data-edit", "true");
        attr(div, "role", "none");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        current = true;
        if (!mounted) {
          dispose = [
            listen(
              div,
              "click",
              /*click_handler_9*/
              ctx[52]
            ),
            listen(
              div,
              "keypress",
              /*keypress_handler_5*/
              ctx[18]
            )
          ];
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
      },
      i(local) {
        if (current) return;
        if (local) {
          add_render_callback(() => {
            if (!current) return;
            if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { duration: ANIMATION_TIME, y: 100 }, true);
            div_transition.run(1);
          });
        }
        current = true;
      },
      o(local) {
        if (local) {
          if (!div_transition) div_transition = create_bidirectional_transition(div, fly, { duration: ANIMATION_TIME, y: 100 }, false);
          div_transition.run(0);
        }
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div);
        }
        if (detaching && div_transition) div_transition.end();
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_fragment(ctx) {
    let div4;
    let div3;
    let div1;
    let div0;
    let button0;
    let t0_value = "Stop Edit	";
    let t0;
    let t1;
    let button1;
    let t2_value = "Layout Row	";
    let t2;
    let t3;
    let button2;
    let t4_value = "Layout Col	";
    let t4;
    let t5;
    let button3;
    let t6_value = "Layout Items";
    let t6;
    let div0_data_isopen_value;
    let t7;
    let div2;
    let each_blocks = [];
    let each_1_lookup = /* @__PURE__ */ new Map();
    let t8;
    let div2_data_isediting_value;
    let t9;
    let loadingspinner;
    let current;
    let mounted;
    let dispose;
    let each_value = ensure_array_like(
      /*$OBJ*/
      ctx[5].data
    );
    const get_key = (ctx2) => (
      /*row*/
      ctx2[56].id
    );
    for (let i = 0; i < each_value.length; i += 1) {
      let child_ctx = get_each_context(ctx, each_value, i);
      let key = get_key(child_ctx);
      each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    }
    let if_block = (
      /*$editLayout_01*/
      ctx[3] && create_if_block(ctx)
    );
    loadingspinner = new LoadingSpinner({
      props: { active: (
        /*editWasClicked*/
        ctx[12]
      ) }
    });
    return {
      c() {
        div4 = element("div");
        div3 = element("div");
        div1 = element("div");
        div0 = element("div");
        button0 = element("button");
        t0 = text(t0_value);
        t1 = space();
        button1 = element("button");
        t2 = text(t2_value);
        t3 = space();
        button2 = element("button");
        t4 = text(t4_value);
        t5 = space();
        button3 = element("button");
        t6 = text(t6_value);
        t7 = space();
        div2 = element("div");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t8 = space();
        if (if_block) if_block.c();
        t9 = space();
        create_component(loadingspinner.$$.fragment);
        attr(
          button0,
          "data-active",
          /*$editMode*/
          ctx[4]
        );
        attr(
          button1,
          "data-active",
          /*$editLayout_01*/
          ctx[3]
        );
        attr(
          button2,
          "data-active",
          /*$editLayout_02*/
          ctx[2]
        );
        attr(
          button3,
          "data-active",
          /*$editLayout_03*/
          ctx[1]
        );
        attr(div0, "class", "SheetEditorMenu");
        attr(div0, "data-isopen", div0_data_isopen_value = /*$editMode*/
        ctx[4] || /*$editLayout_01*/
        ctx[3] || /*$editLayout_02*/
        ctx[2] || /*$editLayout_03*/
        ctx[1]);
        attr(div1, "class", "SheetEditorMenuContainer");
        attr(div2, "class", "SheetInnerWrap");
        attr(
          div2,
          "data-editpreview",
          /*$editLayout_01*/
          ctx[3]
        );
        attr(div2, "data-isediting", div2_data_isediting_value = /*$editMode*/
        ctx[4] || /*$editLayout_01*/
        ctx[3] || /*$editLayout_02*/
        ctx[2] || /*$editLayout_03*/
        ctx[1]);
        attr(div3, "class", "Sheet");
        attr(div4, "class", "theme-light obsidianBody");
      },
      m(target, anchor) {
        insert(target, div4, anchor);
        append(div4, div3);
        append(div3, div1);
        append(div1, div0);
        append(div0, button0);
        append(button0, t0);
        append(div0, t1);
        append(div0, button1);
        append(button1, t2);
        append(div0, t3);
        append(div0, button2);
        append(button2, t4);
        append(div0, t5);
        append(div0, button3);
        append(button3, t6);
        append(div3, t7);
        append(div3, div2);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(div2, null);
          }
        }
        append(div2, t8);
        if (if_block) if_block.m(div2, null);
        append(div4, t9);
        mount_component(loadingspinner, div4, null);
        current = true;
        if (!mounted) {
          dispose = [
            listen(
              button0,
              "click",
              /*click_handler*/
              ctx[24]
            ),
            listen(
              button1,
              "click",
              /*click_handler_1*/
              ctx[25]
            ),
            listen(
              button2,
              "click",
              /*click_handler_2*/
              ctx[26]
            ),
            listen(
              button3,
              "click",
              /*click_handler_3*/
              ctx[27]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        if (!current || dirty[0] & /*$editMode*/
        16) {
          attr(
            button0,
            "data-active",
            /*$editMode*/
            ctx2[4]
          );
        }
        if (!current || dirty[0] & /*$editLayout_01*/
        8) {
          attr(
            button1,
            "data-active",
            /*$editLayout_01*/
            ctx2[3]
          );
        }
        if (!current || dirty[0] & /*$editLayout_02*/
        4) {
          attr(
            button2,
            "data-active",
            /*$editLayout_02*/
            ctx2[2]
          );
        }
        if (!current || dirty[0] & /*$editLayout_03*/
        2) {
          attr(
            button3,
            "data-active",
            /*$editLayout_03*/
            ctx2[1]
          );
        }
        if (!current || dirty[0] & /*$editMode, $editLayout_01, $editLayout_02, $editLayout_03*/
        30 && div0_data_isopen_value !== (div0_data_isopen_value = /*$editMode*/
        ctx2[4] || /*$editLayout_01*/
        ctx2[3] || /*$editLayout_02*/
        ctx2[2] || /*$editLayout_03*/
        ctx2[1])) {
          attr(div0, "data-isopen", div0_data_isopen_value);
        }
        if (dirty[0] & /*$editLayout_01, $editLayout_02, $OBJ, DragRowHandler, OBJ, $editLayout_03, DragColumnHandler, DragItemHandler, $editMode, sys, itemRequestMove*/
        60479) {
          each_value = ensure_array_like(
            /*$OBJ*/
            ctx2[5].data
          );
          group_outros();
          for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
          each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div2, fix_and_outro_and_destroy_block, create_each_block, t8, get_each_context);
          for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
          check_outros();
        }
        if (
          /*$editLayout_01*/
          ctx2[3]
        ) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty[0] & /*$editLayout_01*/
            8) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(div2, null);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
        if (!current || dirty[0] & /*$editLayout_01*/
        8) {
          attr(
            div2,
            "data-editpreview",
            /*$editLayout_01*/
            ctx2[3]
          );
        }
        if (!current || dirty[0] & /*$editMode, $editLayout_01, $editLayout_02, $editLayout_03*/
        30 && div2_data_isediting_value !== (div2_data_isediting_value = /*$editMode*/
        ctx2[4] || /*$editLayout_01*/
        ctx2[3] || /*$editLayout_02*/
        ctx2[2] || /*$editLayout_03*/
        ctx2[1])) {
          attr(div2, "data-isediting", div2_data_isediting_value);
        }
      },
      i(local) {
        if (current) return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        transition_in(if_block);
        transition_in(loadingspinner.$$.fragment, local);
        current = true;
      },
      o(local) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        transition_out(if_block);
        transition_out(loadingspinner.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (detaching) {
          detach(div4);
        }
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].d();
        }
        if (if_block) if_block.d();
        destroy_component(loadingspinner);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  const ANIMATION_DELAY = 220;
  const ANIMATION_TIME = 100;
  class DragHandlerController {
    constructor(data, state) {
      __publicField(this, "data");
      __publicField(this, "state");
      __publicField(this, "layerActive");
      __publicField(this, "isDragging", false);
      __publicField(this, "pauseDragg", false);
      __publicField(this, "dragID");
      __publicField(this, "targetID");
      this.data = data;
      this.state = state;
      this.layerActive = state.editLayout_01;
    }
    moveRow() {
      if (!this.isDragging) {
        return;
      }
      if (!this.dragID || !this.targetID || this.targetID == this.dragID) {
        return;
      }
      this.data.update((list) => {
        let a = this.findIndexOfID(this.dragID);
        let b = this.findIndexOfID(this.targetID);
        const temp = list.data[a];
        this.pauseDragg = true;
        setTimeout(
          () => {
            this.pauseDragg = false;
          },
          ANIMATION_DELAY
        );
        list.data[a] = list.data[b];
        list.data[b] = temp;
        return list;
      });
    }
    onDragStart(e, id) {
      if (!get_store_value(this.layerActive)) {
        return;
      }
      const target = e.target;
      if (!target.classList.contains("Row")) {
        return;
      }
      this.isDragging = true;
      this.dragID = id;
      target.setAttribute("data-dragging", "true");
    }
    onDragOver(e, id) {
      if (!get_store_value(this.layerActive)) {
        return;
      }
      if (!this.isDragging || this.pauseDragg) {
        return;
      }
      this.targetID = id;
      this.moveRow();
    }
    onDragEnd(e, id) {
      if (!get_store_value(this.layerActive)) {
        return;
      }
      this.isDragging = false;
      this.dragID = null;
      this.targetID = null;
      const target = e.target;
      target.setAttribute("data-dragging", "false");
    }
    findIndexOfID(id) {
      return get_store_value(this.data).data.findIndex((p) => p.id == id);
    }
  }
  class DragItemHandlerController2 {
    constructor(data, state) {
      __publicField(this, "data");
      __publicField(this, "state");
      __publicField(this, "layerActive");
      __publicField(this, "isDragging", false);
      __publicField(this, "pauseDragg", false);
      __publicField(this, "dragTargetElement");
      __publicField(this, "dragID");
      __publicField(this, "targetID");
      __publicField(this, "lastDragId");
      __publicField(this, "lasttargId");
      this.data = data;
      this.state = state;
      this.layerActive = state.editLayout_02;
    }
    innerMoveItem(list, fromId, toID) {
      let row_a;
      let a;
      let row_b;
      let b;
      [row_a, a] = this.findRowIndexOfID(fromId);
      [row_b, b] = this.findRowIndexOfID(toID);
      if (row_a == -1 || row_b == -1) {
        return;
      }
      const oa = list.data[row_a].data[a];
      const ob = list.data[row_b].data[b];
      list.data[row_a].data[a] = ob;
      list.data[row_b].data[b] = oa;
    }
    moveRowItem() {
      if (!this.isDragging) {
        return;
      }
      if (!this.dragID || this.targetID == this.dragID) {
        return;
      }
      this.data.update((list) => {
        if (this.dragID == this.lastDragId && this.targetID == this.lasttargId) {
          this.innerMoveItem(list, this.lasttargId, this.lastDragId);
          return list;
        }
        if (this.lastDragId && this.lasttargId) {
          this.innerMoveItem(list, this.lastDragId, this.lasttargId);
        }
        if (this.targetID) {
          this.innerMoveItem(list, this.dragID, this.targetID);
        }
        this.lastDragId = this.dragID;
        this.lasttargId = this.targetID;
        this.pauseDragg = true;
        setTimeout(
          () => {
            this.pauseDragg = false;
          },
          ANIMATION_DELAY
        );
        return list;
      });
    }
    onDragStart(e, id) {
      if (!get_store_value(this.layerActive)) {
        return;
      }
      const target = e.target;
      if (!target.classList.contains("Column")) {
        return;
      }
      this.dragTargetElement = target;
      this.isDragging = true;
      this.dragID = id;
      this.lastDragId = null;
      this.lasttargId = null;
      target.setAttribute("data-dragging", "true");
    }
    onDragOver(e, id) {
      var _a;
      if (!get_store_value(this.layerActive)) {
        return;
      }
      if (!this.isDragging || this.pauseDragg) {
        return;
      }
      this.targetID = id;
      this.moveRowItem();
      (_a = this.dragTargetElement) == null ? void 0 : _a.setAttribute("data-dragging", "true");
    }
    onDragEnd(e, id) {
      var _a;
      if (!get_store_value(this.layerActive)) {
        return;
      }
      this.isDragging = false;
      this.dragID = null;
      this.targetID = null;
      e.target.setAttribute("data-dragging", "false");
      (_a = this.dragTargetElement) == null ? void 0 : _a.setAttribute("data-dragging", "false");
    }
    onLeave(e, id) {
      this.targetID = null;
    }
    findRowIndexOfID(id) {
      let itemId = -1;
      let rowId = get_store_value(this.data).data.findIndex((p) => {
        let i = p.data.findIndex((j) => j.id == id);
        if (i != -1) {
          itemId = i;
          return true;
        }
        return false;
      });
      return [rowId, itemId];
    }
    isBeingDragged(id) {
      return this.dragID == id;
    }
  }
  class DragItemHandlerController3 {
    constructor(data, state) {
      __publicField(this, "data");
      __publicField(this, "state");
      __publicField(this, "layerActive");
      __publicField(this, "isDragging", false);
      __publicField(this, "pauseDragg", false);
      __publicField(this, "dragTargetElement");
      __publicField(this, "dragID");
      __publicField(this, "targetID");
      __publicField(this, "targetRowId");
      __publicField(this, "lastDragId");
      __publicField(this, "lasttargId");
      __publicField(this, "lasttargRowId");
      this.data = data;
      this.state = state;
      this.layerActive = state.editLayout_03;
    }
    innerSwitchItem(list, fromId, toID) {
      let row_a;
      let col_a;
      let a;
      let row_b;
      let col_b;
      let b;
      [row_a, col_a, a] = this.findIndexsOfID(fromId);
      [row_b, col_b, b] = this.findIndexsOfID(toID);
      if (row_a == -1 || row_b == -1 || col_a == -1 || col_b == -1 || a == -1 || b == -1) {
        return;
      }
      const oa = list.data[row_a].data[col_a].data[a];
      const ob = list.data[row_b].data[col_b].data[b];
      list.data[row_a].data[col_a].data[a] = ob;
      list.data[row_b].data[col_b].data[b] = oa;
    }
    innerMoveItem(list, fromId, toID) {
      let row_a;
      let col_a;
      let a;
      let row_b;
      let col_b;
      [row_a, col_a, a] = this.findIndexsOfID(fromId);
      [row_b, col_b] = this.findColumnIndexsOfID(toID);
      if (row_a == -1 || row_b == -1 || col_a == -1 || col_b == -1 || a == -1) {
        return;
      }
      if (row_a == row_b && col_a == col_b) {
        return;
      }
      let item = list.data[row_a].data[col_a].data.splice(a, 1)[0];
      list.data[row_b].data[col_b].data.push(item);
    }
    moveRowItem() {
      if (!this.isDragging) {
        return;
      }
      if (!this.dragID || this.targetID == this.dragID) {
        return;
      }
      if (this.targetRowId) {
        this.data.update((list) => {
          if (this.targetRowId) {
            this.innerMoveItem(list, this.dragID, this.targetRowId);
          }
          this.lastDragId = this.dragID;
          this.lasttargId = this.targetID;
          this.lasttargRowId = null;
          this.pauseDragg = true;
          setTimeout(
            () => {
              this.pauseDragg = false;
            },
            ANIMATION_DELAY
          );
          return list;
        });
      }
    }
    requestMoveItemUpDown(direction, id) {
      this.data.update((list) => {
        let row;
        let col;
        let a;
        [row, col, a] = this.findIndexsOfID(id);
        let newID = a + direction;
        if (newID < 0) {
          return;
        }
        if (list.data[row].data[col].data.length - 1 < newID) {
          console.error("Out of Bounds move, so did not attempt");
          return list;
        }
        const item = list.data[row].data[col].data.splice(a, 1)[0];
        list.data[row].data[col].data.splice(newID, 0, item);
        this.pauseDragg = true;
        setTimeout(
          () => {
            this.pauseDragg = false;
          },
          ANIMATION_DELAY
        );
        return list;
      });
    }
    onDragStart(e, id) {
      if (!get_store_value(this.layerActive)) {
        return;
      }
      const target = e.target;
      if (!target.classList.contains("Item")) {
        return;
      }
      this.dragTargetElement = target;
      this.isDragging = true;
      this.dragID = id;
      this.lastDragId = null;
      this.lasttargId = null;
      target.setAttribute("data-dragging", "true");
    }
    onDragOverColumn(e, id) {
      var _a;
      if (!get_store_value(this.layerActive)) {
        return;
      }
      if (!this.isDragging || this.pauseDragg) {
        return;
      }
      this.targetID = null;
      this.targetRowId = id;
      this.moveRowItem();
      (_a = this.dragTargetElement) == null ? void 0 : _a.setAttribute("data-dragging", "true");
    }
    onDragEnd(e, id) {
      var _a;
      if (!get_store_value(this.layerActive)) {
        return;
      }
      this.isDragging = false;
      this.dragID = null;
      this.targetID = null;
      e.target.setAttribute("data-dragging", "false");
      (_a = this.dragTargetElement) == null ? void 0 : _a.setAttribute("data-dragging", "false");
    }
    onLeave(e, id) {
      this.targetID = null;
    }
    findIndexsOfID(id) {
      let itemId = -1;
      let columnId = -1;
      let rowId = -1;
      let obj = get_store_value(this.data);
      rowId = obj.data.findIndex((p) => {
        let resb = p.data.findIndex((q) => {
          let resc = q.data.findIndex((j) => j.id == id);
          if (resc != -1) {
            itemId = resc;
            return true;
          }
          return false;
        });
        if (resb != -1) {
          columnId = resb;
          return true;
        }
        return false;
      });
      return [rowId, columnId, itemId];
    }
    findColumnIndexsOfID(id) {
      let columnId = -1;
      let rowId = -1;
      let obj = get_store_value(this.data);
      rowId = obj.data.findIndex((p) => {
        let resb = p.data.findIndex((q) => q.id == id);
        if (resb != -1) {
          columnId = resb;
          return true;
        }
        return false;
      });
      return [rowId, columnId];
    }
    isBeingDragged(id) {
      return this.dragID == id;
    }
  }
  class State {
    constructor() {
      __publicField(this, "editMode", writable(false));
      __publicField(this, "editLayout_01", writable(false));
      __publicField(this, "editLayout_02", writable(false));
      __publicField(this, "editLayout_03", writable(false));
      this.editMode.subscribe((p) => {
        if (p) {
          this.editLayout_01.set(false);
          this.editLayout_02.set(false);
          this.editLayout_03.set(false);
        }
      });
      this.editLayout_01.subscribe((p) => {
        if (p) {
          this.editLayout_02.set(false);
          this.editLayout_03.set(false);
          this.editMode.set(false);
        }
      });
      this.editLayout_02.subscribe((p) => {
        if (p) {
          this.editLayout_01.set(false);
          this.editLayout_03.set(false);
          this.editMode.set(false);
        }
      });
      this.editLayout_03.subscribe((p) => {
        if (p) {
          this.editLayout_01.set(false);
          this.editLayout_02.set(false);
          this.editMode.set(false);
        }
      });
    }
  }
  function repeat(x, str, sep = " ") {
    let _ = str;
    for (let i = 0; i < x - 1; i++) {
      _ += sep;
      _ += str;
    }
    return _;
  }
  const dragover_handler = (e) => {
    e.preventDefault();
  };
  function instance($$self, $$props, $$invalidate) {
    let $editLayout_03;
    let $editLayout_02;
    let $editLayout_01;
    let $editMode;
    let $OBJ;
    let state = new State();
    let editMode = state.editMode;
    component_subscribe($$self, editMode, (value) => $$invalidate(4, $editMode = value));
    let editLayout_01 = state.editLayout_01;
    component_subscribe($$self, editLayout_01, (value) => $$invalidate(3, $editLayout_01 = value));
    let editLayout_02 = state.editLayout_02;
    component_subscribe($$self, editLayout_02, (value) => $$invalidate(2, $editLayout_02 = value));
    let editLayout_03 = state.editLayout_03;
    component_subscribe($$self, editLayout_03, (value) => $$invalidate(1, $editLayout_03 = value));
    let { textData } = $$props;
    let { sys } = $$props;
    let { writeBlock } = $$props;
    let DATA = new SheetData(textData ?? "");
    let OBJ = writable(DATA);
    component_subscribe($$self, OBJ, (value) => $$invalidate(5, $OBJ = value));
    function itemRequestMove(direction, id) {
      DragItemHandler.requestMoveItemUpDown(direction, id);
    }
    onMount(() => {
    });
    let editWasClicked = writable(false);
    function requestEvalSaveCondition() {
      const allDisabled = !$editMode && !$editLayout_01 && !$editLayout_02 && !$editLayout_03;
      if (editWasClicked && allDisabled) {
        writeBlock(DATA, sys);
        editWasClicked.set(false);
      }
    }
    editMode.subscribe(requestEvalSaveCondition);
    editLayout_01.subscribe(requestEvalSaveCondition);
    editLayout_02.subscribe(requestEvalSaveCondition);
    editLayout_03.subscribe(requestEvalSaveCondition);
    let DragRowHandler = new DragHandlerController(OBJ, state);
    let DragColumnHandler = new DragItemHandlerController2(OBJ, state);
    let DragItemHandler = new DragItemHandlerController3(OBJ, state);
    function keypress_handler_5(event) {
      bubble.call(this, $$self, event);
    }
    function keypress_handler_4(event) {
      bubble.call(this, $$self, event);
    }
    function keypress_handler_3(event) {
      bubble.call(this, $$self, event);
    }
    function keypress_handler_2(event) {
      bubble.call(this, $$self, event);
    }
    function keypress_handler_1(event) {
      bubble.call(this, $$self, event);
    }
    function keypress_handler(event) {
      bubble.call(this, $$self, event);
    }
    const click_handler = () => {
      editWasClicked.set(true);
      editMode.set(!$editMode);
    };
    const click_handler_1 = () => {
      editWasClicked.set(true);
      editLayout_01.set(!$editLayout_01);
    };
    const click_handler_2 = () => {
      editWasClicked.set(true);
      editLayout_02.set(!$editLayout_02);
    };
    const click_handler_3 = () => {
      editWasClicked.set(true);
      editLayout_03.set(!$editLayout_03);
    };
    const click_handler_4 = (row) => {
      OBJ.update((o) => {
        o.remRow(row.id);
        return o;
      });
    };
    const click_handler_5 = (row, column) => {
      row.remColumn(column.id);
      OBJ.update((o) => o);
    };
    const click_handler_6 = (column, item) => {
      column.remItem(item.id);
      OBJ.update((o) => o);
    };
    function itemmanouver_data_binding(value, item, each_value_2, k) {
      each_value_2[k] = value;
      OBJ.set($OBJ);
    }
    const moveUp_handler = (e) => {
      itemRequestMove(-1, e.detail);
    };
    const moveDown_handler = (e) => {
      itemRequestMove(1, e.detail);
    };
    const moveUp_handler_1 = (e) => {
      itemRequestMove(-1, e.detail);
    };
    const moveDown_handler_1 = (e) => {
      itemRequestMove(1, e.detail);
    };
    const dragstart_handler = (item, e) => {
      DragItemHandler.onDragStart(e, item.id);
    };
    const dragend_handler = (item, e) => {
      DragItemHandler.onDragEnd(e, item.id);
    };
    const drop_handler = (item, e) => {
      DragItemHandler.onDragEnd(e, item.id);
    };
    const dragleave_handler = (item, e) => {
      DragItemHandler.onLeave(e, item.id);
    };
    const click_handler_7 = (column) => {
      column.addItem();
      OBJ.update((o) => o);
    };
    const dragstart_handler_1 = (column, e) => {
      DragColumnHandler.onDragStart(e, column.id);
    };
    const dragenter_handler = (column, e) => {
      DragColumnHandler.onDragOver(e, column.id);
      DragItemHandler.onDragOverColumn(e, column.id);
    };
    const dragend_handler_1 = (column, e) => {
      DragColumnHandler.onDragEnd(e, column.id);
    };
    const drop_handler_1 = (column, e) => {
      DragColumnHandler.onDragEnd(e, column.id);
    };
    const dragleave_handler_1 = (column, e) => {
      DragColumnHandler.onLeave(e, column.id);
    };
    const dragover_handler_1 = (column, e) => {
      DragColumnHandler.onDragOver(e, column.id);
      DragItemHandler.onDragOverColumn(e, column.id);
      e.preventDefault();
    };
    const click_handler_8 = (row) => {
      row.addColumn();
      OBJ.update((obj) => {
        return obj;
      });
    };
    const dragstart_handler_2 = (row, e) => DragRowHandler.onDragStart(e, row.id);
    const dragenter_handler_1 = (row, e) => DragRowHandler.onDragOver(e, row.id);
    const dragend_handler_2 = (row, e) => DragRowHandler.onDragEnd(e, row.id);
    const dragover_handler_2 = (row, e) => {
      DragRowHandler.onDragOver(e, row.id);
      e.preventDefault();
    };
    const click_handler_9 = () => {
      OBJ.update((obj) => {
        obj.addRow();
        obj.data[$OBJ.data.length - 1].addColumn();
        return obj;
      });
    };
    $$self.$$set = ($$props2) => {
      if ("textData" in $$props2) $$invalidate(16, textData = $$props2.textData);
      if ("sys" in $$props2) $$invalidate(0, sys = $$props2.sys);
      if ("writeBlock" in $$props2) $$invalidate(17, writeBlock = $$props2.writeBlock);
    };
    return [
      sys,
      $editLayout_03,
      $editLayout_02,
      $editLayout_01,
      $editMode,
      $OBJ,
      editMode,
      editLayout_01,
      editLayout_02,
      editLayout_03,
      OBJ,
      itemRequestMove,
      editWasClicked,
      DragRowHandler,
      DragColumnHandler,
      DragItemHandler,
      textData,
      writeBlock,
      keypress_handler_5,
      keypress_handler_4,
      keypress_handler_3,
      keypress_handler_2,
      keypress_handler_1,
      keypress_handler,
      click_handler,
      click_handler_1,
      click_handler_2,
      click_handler_3,
      click_handler_4,
      click_handler_5,
      click_handler_6,
      itemmanouver_data_binding,
      moveUp_handler,
      moveDown_handler,
      moveUp_handler_1,
      moveDown_handler_1,
      dragstart_handler,
      dragend_handler,
      drop_handler,
      dragleave_handler,
      click_handler_7,
      dragstart_handler_1,
      dragenter_handler,
      dragend_handler_1,
      drop_handler_1,
      dragleave_handler_1,
      dragover_handler_1,
      click_handler_8,
      dragstart_handler_2,
      dragenter_handler_1,
      dragend_handler_2,
      dragover_handler_2,
      click_handler_9
    ];
  }
  class App extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance, create_fragment, safe_not_equal, { textData: 16, sys: 0, writeBlock: 17 }, null, [-1, -1, -1]);
    }
    get textData() {
      return this.$$.ctx[16];
    }
    set textData(textData) {
      this.$$set({ textData });
      flush();
    }
    get sys() {
      return this.$$.ctx[0];
    }
    set sys(sys) {
      this.$$set({ sys });
      flush();
    }
    get writeBlock() {
      return this.$$.ctx[17];
    }
    set writeBlock(writeBlock) {
      this.$$set({ writeBlock });
      flush();
    }
  }
  create_custom_element(App, { "textData": {}, "sys": {}, "writeBlock": {} }, [], [], true);
  return App;
});
//# sourceMappingURL=components.umd.cjs.map
