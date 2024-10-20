var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
(function(global2, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : (global2 = typeof globalThis !== "undefined" ? globalThis : global2 || self, global2["<<name>>"] = factory());
})(this, function() {
  "use strict";
  function noop() {
  }
  const identity = (x) => x;
  function add_location(element2, file2, line, column, char) {
    element2.__svelte_meta = {
      loc: { file: file2, line, column, char }
    };
  }
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
    return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
  }
  function is_empty(obj) {
    return Object.keys(obj).length === 0;
  }
  function validate_store(store, name2) {
    if (store != null && typeof store.subscribe !== "function") {
      throw new Error(`'${name2}' is not a store with a 'subscribe' method`);
    }
  }
  function subscribe(store, ...callbacks) {
    if (store == null) {
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
  function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
  }
  function split_css_unit(value) {
    const split = typeof value === "string" && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
    return split ? [parseFloat(split[1]), split[2] || "px"] : [value, "px"];
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
    if (tasks.size !== 0)
      raf(run_tasks);
  }
  function loop(callback) {
    let task;
    if (tasks.size === 0)
      raf(run_tasks);
    return {
      promise: new Promise((fulfill) => {
        tasks.add(task = { c: callback, f: fulfill });
      }),
      abort() {
        tasks.delete(task);
      }
    };
  }
  const globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : global;
  function append(target, node) {
    target.appendChild(node);
  }
  function get_root_for_style(node) {
    if (!node)
      return document;
    const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
    if (root && root.host) {
      return root;
    }
    return node.ownerDocument;
  }
  function append_empty_stylesheet(node) {
    const style_element = element("style");
    append_stylesheet(get_root_for_style(node), style_element);
    return style_element.sheet;
  }
  function append_stylesheet(node, style) {
    append(node.head || node, style);
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
      if (iterations[i])
        iterations[i].d(detaching);
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
    if (value == null)
      node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
      node.setAttribute(attribute, value);
  }
  function to_number(value) {
    return value === "" ? null : +value;
  }
  function children(element2) {
    return Array.from(element2.childNodes);
  }
  function set_input_value(input, value) {
    input.value = value == null ? "" : value;
  }
  function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
    const e = document.createEvent("CustomEvent");
    e.initCustomEvent(type, bubbles, cancelable, detail);
    return e;
  }
  function attribute_to_object(attributes) {
    const result = {};
    for (const attribute of attributes) {
      result[attribute.name] = attribute.value;
    }
    return result;
  }
  const managed_styles = /* @__PURE__ */ new Map();
  let active = 0;
  function hash(str) {
    let hash2 = 5381;
    let i = str.length;
    while (i--)
      hash2 = (hash2 << 5) - hash2 ^ str.charCodeAt(i);
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
    );
    const deleted = previous.length - next.length;
    if (deleted) {
      node.style.animation = next.join(", ");
      active -= deleted;
      if (!active)
        clear_rules();
    }
  }
  function clear_rules() {
    raf(() => {
      if (active)
        return;
      managed_styles.forEach((info) => {
        const { ownerNode } = info.stylesheet;
        if (ownerNode)
          detach(ownerNode);
      });
      managed_styles.clear();
    });
  }
  function create_animation(node, from, fn, params) {
    if (!from)
      return noop;
    const to = node.getBoundingClientRect();
    if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
      return noop;
    const {
      delay = 0,
      duration = 300,
      easing = identity,
      start: start_time = now() + delay,
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
      if (css)
        delete_rule(node, name2);
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
    if (!current_component)
      throw new Error("Function called outside component initialization");
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
        const event = custom_event(type, detail, { cancelable });
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
      while (binding_callbacks.length)
        binding_callbacks.pop()();
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
      if (outroing.has(block))
        return;
      outroing.add(block);
      outros.c.push(() => {
        outroing.delete(block);
        if (callback) {
          if (detach2)
            block.d(1);
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
    function clear_animation() {
      if (animation_name)
        delete_rule(node, animation_name);
    }
    function init2(program, duration) {
      const d = program.b - t;
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
      const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
      const program = {
        start: now() + delay,
        b
      };
      if (!b) {
        program.group = outros;
        outros.r += 1;
      }
      if (running_program || pending_program) {
        pending_program = program;
      } else {
        if (css) {
          clear_animation();
          animation_name = create_rule(node, t, b, duration, delay, easing, css);
        }
        if (b)
          tick(0, 1);
        running_program = init2(program, duration);
        add_render_callback(() => dispatch(node, b, "start"));
        loop((now2) => {
          if (pending_program && now2 > pending_program.start) {
            running_program = init2(pending_program, duration);
            pending_program = null;
            dispatch(node, running_program.b, "start");
            if (css) {
              clear_animation();
              animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
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
                  if (!--running_program.group.r)
                    run_all(running_program.group.c);
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
            config = config(options);
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
    while (i--)
      old_indexes[old_blocks[i].key] = i;
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
      } else if (dynamic) {
        updates.push(() => block.p(child_ctx, dirty));
      }
      new_lookup.set(key, new_blocks[i] = block);
      if (key in old_indexes)
        deltas.set(key, Math.abs(i - old_indexes[key]));
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
      if (!new_lookup.has(old_block.key))
        destroy(old_block, lookup);
    }
    while (n)
      insert2(new_blocks[n - 1]);
    run_all(updates);
    return new_blocks;
  }
  function validate_each_keys(ctx, list, get_context, get_key) {
    const keys = /* @__PURE__ */ new Set();
    for (let i = 0; i < list.length; i++) {
      const key = get_key(get_context(ctx, list, i));
      if (keys.has(key)) {
        throw new Error("Cannot have duplicate keys in a keyed each");
      }
      keys.add(key);
    }
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
  function mount_component(component, target, anchor, customElement) {
    const { fragment, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
      add_render_callback(() => {
        const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
        if (component.$$.on_destroy) {
          component.$$.on_destroy.push(...new_on_destroy);
        } else {
          run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
      });
    }
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
  function init(component, options, instance2, create_fragment2, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
      fragment: null,
      ctx: [],
      props,
      update: noop,
      not_equal,
      bound: blank_object(),
      on_mount: [],
      on_destroy: [],
      on_disconnect: [],
      before_update: [],
      after_update: [],
      context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
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
        if (!$$.skip_bound && $$.bound[i])
          $$.bound[i](value);
        if (ready)
          make_dirty(component, i);
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
      if (options.intro)
        transition_in(component.$$.fragment);
      mount_component(component, options.target, options.anchor, options.customElement);
      flush();
    }
    set_current_component(parent_component);
  }
  let SvelteElement;
  if (typeof HTMLElement === "function") {
    SvelteElement = class extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: "open" });
      }
      connectedCallback() {
        const { on_mount } = this.$$;
        this.$$.on_disconnect = on_mount.map(run).filter(is_function);
        for (const key in this.$$.slotted) {
          this.appendChild(this.$$.slotted[key]);
        }
      }
      attributeChangedCallback(attr2, _oldValue, newValue) {
        this[attr2] = newValue;
      }
      disconnectedCallback() {
        run_all(this.$$.on_disconnect);
      }
      $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
      }
      $on(type, callback) {
        if (!is_function(callback)) {
          return noop;
        }
        const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
        callbacks.push(callback);
        return () => {
          const index = callbacks.indexOf(callback);
          if (index !== -1)
            callbacks.splice(index, 1);
        };
      }
      $set($$props) {
        if (this.$$set && !is_empty($$props)) {
          this.$$.skip_bound = true;
          this.$$set($$props);
          this.$$.skip_bound = false;
        }
      }
    };
  }
  function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, Object.assign({ version: "3.59.2" }, detail), { bubbles: true }));
  }
  function append_dev(target, node) {
    dispatch_dev("SvelteDOMInsert", { target, node });
    append(target, node);
  }
  function insert_dev(target, node, anchor) {
    dispatch_dev("SvelteDOMInsert", { target, node, anchor });
    insert(target, node, anchor);
  }
  function detach_dev(node) {
    dispatch_dev("SvelteDOMRemove", { node });
    detach(node);
  }
  function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
    const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
    if (has_prevent_default)
      modifiers.push("preventDefault");
    if (has_stop_propagation)
      modifiers.push("stopPropagation");
    if (has_stop_immediate_propagation)
      modifiers.push("stopImmediatePropagation");
    dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
    const dispose = listen(node, event, handler, options);
    return () => {
      dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
      dispose();
    };
  }
  function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null)
      dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
    else
      dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
  }
  function prop_dev(node, property, value) {
    node[property] = value;
    dispatch_dev("SvelteDOMSetProperty", { node, property, value });
  }
  function set_data_dev(text2, data) {
    data = "" + data;
    if (text2.data === data)
      return;
    dispatch_dev("SvelteDOMSetData", { node: text2, data });
    text2.data = data;
  }
  function validate_each_argument(arg) {
    if (typeof arg !== "string" && !(arg && typeof arg === "object" && "length" in arg)) {
      let msg = "{#each} only iterates over array-like objects.";
      if (typeof Symbol === "function" && arg && Symbol.iterator in arg) {
        msg += " You can use a spread to convert this iterable into an array.";
      }
      throw new Error(msg);
    }
  }
  function validate_slots(name2, slot, keys) {
    for (const slot_key of Object.keys(slot)) {
      if (!~keys.indexOf(slot_key)) {
        console.warn(`<${name2}> received an unexpected slot "${slot_key}".`);
      }
    }
  }
  const app = "";
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
      var _a;
      if (typeof json == "string") {
        json = JSON.parse(json);
      }
      let data = (_a = json.data) != null ? _a : [];
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
        stop = start(set) || noop;
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
  function cubicInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 0.5 * Math.pow(2 * t - 2, 3) + 1;
  }
  function cubicOut(t) {
    const f = t - 1;
    return f * f * f + 1;
  }
  function blur(node, { delay = 0, duration = 400, easing = cubicInOut, amount = 5, opacity = 0 } = {}) {
    const style = getComputedStyle(node);
    const target_opacity = +style.opacity;
    const f = style.filter === "none" ? "" : style.filter;
    const od = target_opacity * (1 - opacity);
    const [value, unit] = split_css_unit(amount);
    return {
      delay,
      duration,
      easing,
      css: (_t, u) => `opacity: ${target_opacity - od * u}; filter: ${f} blur(${u * value}${unit});`
    };
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
    const capitalized_secondary_properties = secondary_properties.map((e) => `${e[0].toUpperCase()}${e.slice(1)}`);
    const padding_start_value = parseFloat(style[`padding${capitalized_secondary_properties[0]}`]);
    const padding_end_value = parseFloat(style[`padding${capitalized_secondary_properties[1]}`]);
    const margin_start_value = parseFloat(style[`margin${capitalized_secondary_properties[0]}`]);
    const margin_end_value = parseFloat(style[`margin${capitalized_secondary_properties[1]}`]);
    const border_width_start_value = parseFloat(style[`border${capitalized_secondary_properties[0]}Width`]);
    const border_width_end_value = parseFloat(style[`border${capitalized_secondary_properties[1]}Width`]);
    return {
      delay,
      duration,
      easing,
      css: (t) => `overflow: hidden;opacity: ${Math.min(t * 20, 1) * opacity};${primary_property}: ${t * primary_property_value}px;padding-${secondary_properties[0]}: ${t * padding_start_value}px;padding-${secondary_properties[1]}: ${t * padding_end_value}px;margin-${secondary_properties[0]}: ${t * margin_start_value}px;margin-${secondary_properties[1]}: ${t * margin_end_value}px;border-${secondary_properties[0]}-width: ${t * border_width_start_value}px;border-${secondary_properties[1]}-width: ${t * border_width_end_value}px;`
    };
  }
  class TNode {
    constructor(basevalue, calc) {
      __publicField(this, "baseValue", 0);
      __publicField(this, "value", 0);
      __publicField(this, "dependencies", {});
      __publicField(this, "dependents", []);
      __publicField(this, "calc");
      __publicField(this, "updateListeners", {});
      this.baseValue = basevalue;
      this.calc = calc != null ? calc : "";
    }
    getValue() {
      var _a;
      return (_a = this.value) != null ? _a : this.baseValue;
    }
    setValue(value) {
      this.value = value;
      this.update();
      return;
    }
    addDependency(symbol, node) {
      this.dependencies[symbol] = node;
      node.dependents.push(this);
    }
    update() {
      if (this.calc != "") {
        let calcStr = this.calc;
        let symbols = Object.keys(this.dependencies);
        for (let i = 0; i < symbols.length; i++) {
          const s = symbols[i];
          const v = this.dependencies[s].getValue();
          calcStr = calcStr.replace(s, v + "");
        }
        this.value = eval(calcStr);
      }
      Object.keys(this.updateListeners).forEach((key) => {
        this.updateListeners[key]();
      });
      for (let i = 0; i < this.dependents.length; i++) {
        const dep = this.dependents[i];
        dep.update();
      }
    }
    addUpdateListener(key, listener) {
      this.updateListeners[key] = listener;
    }
    removeUpdateListener(key) {
      delete this.updateListeners[key];
    }
    removeAllUpdateListeners() {
      this.updateListeners = {};
    }
  }
  class system {
    constructor() {
      __publicField(this, "data", {
        fixed: {
          collections_names: {
            stats: {
              nodes_names: {
                strength: new TNode(1, ""),
                dexterity: new TNode(1, ""),
                constitution: new TNode(1, ""),
                wisdom: new TNode(1, ""),
                intelligence: new TNode(1, ""),
                charisma: new TNode(1, "")
              }
            },
            SkillProficiencies: {
              nodes_names: {
                Athletics: new TNode(0, ""),
                Acrobatics: new TNode(0, ""),
                "Sleight of Hand": new TNode(0, ""),
                Arcana: new TNode(0, ""),
                History: new TNode(0, ""),
                Investigation: new TNode(0, ""),
                Nature: new TNode(0, ""),
                Religion: new TNode(0, ""),
                "Animal Handling": new TNode(0, ""),
                Insight: new TNode(0, ""),
                Medicine: new TNode(0, ""),
                Perception: new TNode(0, ""),
                Survival: new TNode(0, ""),
                Deception: new TNode(0, ""),
                Intimidation: new TNode(0, ""),
                Performance: new TNode(0, ""),
                Persuasion: new TNode(0, "")
              }
            },
            generic: {
              nodes_names: {
                "Proficiency Bonus": new TNode(1, ""),
                "Hit Points": new TNode(1, "")
              }
            }
          }
        },
        derived: {
          collections_names: {
            modifiers: {
              nodes_names: {
                strength: new TNode(NaN, "Math.floor((@a-10)/2)"),
                dexterity: new TNode(NaN, "Math.floor((@a-10)/2)"),
                constitution: new TNode(NaN, "Math.floor((@a-10)/2)"),
                wisdom: new TNode(NaN, "Math.floor((@a-10)/2)"),
                intelligence: new TNode(NaN, "Math.floor((@a-10)/2)"),
                charisma: new TNode(NaN, "Math.floor((@a-10)/2)")
              }
            },
            skillproficiencyBonus: {
              nodes_names: {
                Athletics: new TNode(NaN, "@a * @c + @d"),
                Acrobatics: new TNode(NaN, "@a * @c + @d"),
                "Sleight of Hand": new TNode(NaN, "@a * @c + @d"),
                Arcana: new TNode(NaN, "@a * @c + @d"),
                History: new TNode(NaN, "@a * @c + @d"),
                Investigation: new TNode(NaN, "@a * @c + @d"),
                Nature: new TNode(NaN, "@a * @c + @d"),
                Religion: new TNode(NaN, "@a * @c + @d"),
                "Animal Handling": new TNode(NaN, "@a * @c + @d"),
                Insight: new TNode(NaN, "@a * @c + @d"),
                Medicine: new TNode(NaN, "@a * @c + @d"),
                Perception: new TNode(NaN, "@a * @c + @d"),
                Survival: new TNode(NaN, "@a * @c + @d"),
                Deception: new TNode(NaN, "@a * @c + @d"),
                Intimidation: new TNode(NaN, "@a * @c + @d"),
                Performance: new TNode(NaN, "@a * @c + @d"),
                Persuasion: new TNode(NaN, "@a * @c + @d")
              }
            },
            "Spell Bonus": {
              nodes_names: {
                strength: new TNode(NaN, "@a + @b"),
                dexterity: new TNode(NaN, "@a + @b"),
                constitution: new TNode(NaN, "@a + @b"),
                wisdom: new TNode(NaN, "@a + @b"),
                intelligence: new TNode(NaN, "@a + @b"),
                charisma: new TNode(NaN, "@a + @b")
              }
            },
            "Spell DC": {
              nodes_names: {
                strength: new TNode(NaN, "8 + @a + @b"),
                dexterity: new TNode(NaN, "8 + @a + @b"),
                constitution: new TNode(NaN, "8 + @a + @b"),
                wisdom: new TNode(NaN, "8 + @a + @b"),
                intelligence: new TNode(NaN, "8 + @a + @b"),
                charisma: new TNode(NaN, "8 + @a + @b")
              }
            },
            generic: {
              nodes_names: {
                "armor class": new TNode(NaN, "12 + @d")
              }
            }
          }
        }
      });
      this.init();
    }
    getNode(group, collection, item) {
      if (!this.data[group] || !this.data[group].collections_names[collection] || !this.data[group].collections_names[collection].nodes_names[item]) {
        return null;
      }
      return this.data[group].collections_names[collection].nodes_names[item];
    }
    getNodeNames(group, collection) {
      if (!this.data[group] || !this.data[group].collections_names[collection]) {
        return [];
      }
      return Object.keys(this.data[group].collections_names[collection].nodes_names);
    }
    hasNode(group, collection, item) {
      if (!this.data[group] || !this.data[group].collections_names[collection] || !this.data[group].collections_names[collection].nodes_names[item]) {
        return false;
      }
      return true;
    }
    getCollectionNames(group) {
      if (!this.data[group]) {
        return [];
      }
      return Object.keys(this.data[group].collections_names);
    }
    hasCollection(group, collection) {
      if (!this.data[group] || !this.data[group].collections_names[collection]) {
        return false;
      }
      return true;
    }
    declareDependency(Parentgroup, Parentcollection, Parentitem, symbol, Depgroup, depcollection, depitem) {
      let parent = this.getNode(Parentgroup, Parentcollection, Parentitem);
      let dep = this.getNode(Depgroup, depcollection, depitem);
      if (!dep || !parent) {
        console.error(`
				Error at declareDependency
				${Parentgroup}, ${Parentcollection}, ${Parentitem}, ${symbol}, ${Depgroup}, ${depcollection}, ${depitem}
				`);
        return;
      }
      parent.addDependency(symbol, dep);
    }
    init() {
      this.declareDependency("derived", "modifiers", "strength", "@a", "fixed", "stats", "strength");
      this.declareDependency("derived", "modifiers", "dexterity", "@a", "fixed", "stats", "dexterity");
      this.declareDependency("derived", "modifiers", "constitution", "@a", "fixed", "stats", "constitution");
      this.declareDependency("derived", "modifiers", "wisdom", "@a", "fixed", "stats", "wisdom");
      this.declareDependency("derived", "modifiers", "intelligence", "@a", "fixed", "stats", "intelligence");
      this.declareDependency("derived", "modifiers", "charisma", "@a", "fixed", "stats", "charisma");
      this.declareDependency("derived", "skillproficiencyBonus", "Athletics", "@a", "fixed", "SkillProficiencies", "Athletics");
      this.declareDependency("derived", "skillproficiencyBonus", "Athletics", "@c", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "skillproficiencyBonus", "Athletics", "@d", "derived", "modifiers", "strength");
      this.declareDependency("derived", "skillproficiencyBonus", "Acrobatics", "@a", "fixed", "SkillProficiencies", "Acrobatics");
      this.declareDependency("derived", "skillproficiencyBonus", "Acrobatics", "@c", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "skillproficiencyBonus", "Acrobatics", "@d", "derived", "modifiers", "dexterity");
      this.declareDependency("derived", "skillproficiencyBonus", "Sleight of Hand", "@a", "fixed", "SkillProficiencies", "Sleight of Hand");
      this.declareDependency("derived", "skillproficiencyBonus", "Sleight of Hand", "@c", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "skillproficiencyBonus", "Sleight of Hand", "@d", "derived", "modifiers", "dexterity");
      this.declareDependency("derived", "skillproficiencyBonus", "Arcana", "@a", "fixed", "SkillProficiencies", "Arcana");
      this.declareDependency("derived", "skillproficiencyBonus", "Arcana", "@c", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "skillproficiencyBonus", "Arcana", "@d", "derived", "modifiers", "intelligence");
      this.declareDependency("derived", "skillproficiencyBonus", "History", "@a", "fixed", "SkillProficiencies", "History");
      this.declareDependency("derived", "skillproficiencyBonus", "History", "@c", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "skillproficiencyBonus", "History", "@d", "derived", "modifiers", "intelligence");
      this.declareDependency("derived", "skillproficiencyBonus", "Investigation", "@a", "fixed", "SkillProficiencies", "Investigation");
      this.declareDependency("derived", "skillproficiencyBonus", "Investigation", "@c", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "skillproficiencyBonus", "Investigation", "@d", "derived", "modifiers", "intelligence");
      this.declareDependency("derived", "skillproficiencyBonus", "Nature", "@a", "fixed", "SkillProficiencies", "Nature");
      this.declareDependency("derived", "skillproficiencyBonus", "Nature", "@c", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "skillproficiencyBonus", "Nature", "@d", "derived", "modifiers", "intelligence");
      this.declareDependency("derived", "skillproficiencyBonus", "Religion", "@a", "fixed", "SkillProficiencies", "Religion");
      this.declareDependency("derived", "skillproficiencyBonus", "Religion", "@c", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "skillproficiencyBonus", "Religion", "@d", "derived", "modifiers", "intelligence");
      this.declareDependency("derived", "skillproficiencyBonus", "Animal Handling", "@a", "fixed", "SkillProficiencies", "Animal Handling");
      this.declareDependency("derived", "skillproficiencyBonus", "Animal Handling", "@c", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "skillproficiencyBonus", "Animal Handling", "@d", "derived", "modifiers", "wisdom");
      this.declareDependency("derived", "skillproficiencyBonus", "Insight", "@a", "fixed", "SkillProficiencies", "Insight");
      this.declareDependency("derived", "skillproficiencyBonus", "Insight", "@c", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "skillproficiencyBonus", "Insight", "@d", "derived", "modifiers", "wisdom");
      this.declareDependency("derived", "skillproficiencyBonus", "Medicine", "@a", "fixed", "SkillProficiencies", "Medicine");
      this.declareDependency("derived", "skillproficiencyBonus", "Medicine", "@c", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "skillproficiencyBonus", "Medicine", "@d", "derived", "modifiers", "wisdom");
      this.declareDependency("derived", "skillproficiencyBonus", "Perception", "@a", "fixed", "SkillProficiencies", "Perception");
      this.declareDependency("derived", "skillproficiencyBonus", "Perception", "@c", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "skillproficiencyBonus", "Perception", "@d", "derived", "modifiers", "wisdom");
      this.declareDependency("derived", "skillproficiencyBonus", "Survival", "@a", "fixed", "SkillProficiencies", "Survival");
      this.declareDependency("derived", "skillproficiencyBonus", "Survival", "@c", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "skillproficiencyBonus", "Survival", "@d", "derived", "modifiers", "wisdom");
      this.declareDependency("derived", "skillproficiencyBonus", "Deception", "@a", "fixed", "SkillProficiencies", "Deception");
      this.declareDependency("derived", "skillproficiencyBonus", "Deception", "@c", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "skillproficiencyBonus", "Deception", "@d", "derived", "modifiers", "charisma");
      this.declareDependency("derived", "skillproficiencyBonus", "Intimidation", "@a", "fixed", "SkillProficiencies", "Intimidation");
      this.declareDependency("derived", "skillproficiencyBonus", "Intimidation", "@c", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "skillproficiencyBonus", "Intimidation", "@d", "derived", "modifiers", "charisma");
      this.declareDependency("derived", "skillproficiencyBonus", "Performance", "@a", "fixed", "SkillProficiencies", "Performance");
      this.declareDependency("derived", "skillproficiencyBonus", "Performance", "@c", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "skillproficiencyBonus", "Performance", "@d", "derived", "modifiers", "charisma");
      this.declareDependency("derived", "skillproficiencyBonus", "Persuasion", "@a", "fixed", "SkillProficiencies", "Persuasion");
      this.declareDependency("derived", "skillproficiencyBonus", "Persuasion", "@c", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "skillproficiencyBonus", "Persuasion", "@d", "derived", "modifiers", "charisma");
      this.declareDependency("derived", "Spell Bonus", "strength", "@a", "derived", "modifiers", "strength");
      this.declareDependency("derived", "Spell Bonus", "strength", "@b", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "Spell Bonus", "dexterity", "@a", "derived", "modifiers", "dexterity");
      this.declareDependency("derived", "Spell Bonus", "dexterity", "@b", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "Spell Bonus", "constitution", "@a", "derived", "modifiers", "constitution");
      this.declareDependency("derived", "Spell Bonus", "constitution", "@b", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "Spell Bonus", "wisdom", "@a", "derived", "modifiers", "wisdom");
      this.declareDependency("derived", "Spell Bonus", "wisdom", "@b", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "Spell Bonus", "intelligence", "@a", "derived", "modifiers", "intelligence");
      this.declareDependency("derived", "Spell Bonus", "intelligence", "@b", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "Spell Bonus", "charisma", "@a", "derived", "modifiers", "charisma");
      this.declareDependency("derived", "Spell Bonus", "charisma", "@b", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "Spell DC", "strength", "@a", "derived", "modifiers", "strength");
      this.declareDependency("derived", "Spell DC", "strength", "@b", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "Spell DC", "dexterity", "@a", "derived", "modifiers", "dexterity");
      this.declareDependency("derived", "Spell DC", "dexterity", "@b", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "Spell DC", "constitution", "@a", "derived", "modifiers", "constitution");
      this.declareDependency("derived", "Spell DC", "constitution", "@b", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "Spell DC", "wisdom", "@a", "derived", "modifiers", "wisdom");
      this.declareDependency("derived", "Spell DC", "wisdom", "@b", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "Spell DC", "intelligence", "@a", "derived", "modifiers", "intelligence");
      this.declareDependency("derived", "Spell DC", "intelligence", "@b", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "Spell DC", "charisma", "@a", "derived", "modifiers", "charisma");
      this.declareDependency("derived", "Spell DC", "charisma", "@b", "fixed", "generic", "Proficiency Bonus");
      this.declareDependency("derived", "generic", "armor class", "@d", "derived", "modifiers", "dexterity");
    }
  }
  const file$e = "src/Components/HitPoints.svelte";
  function create_else_block$1(ctx) {
    let div;
    let t1;
    let input;
    const block = {
      c: function create() {
        div = element("div");
        div.textContent = "Hit Point Maximum";
        t1 = space();
        input = element("input");
        add_location(div, file$e, 41, 2, 1216);
        attr_dev(input, "type", "number");
        add_location(input, file$e, 42, 2, 1247);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        insert_dev(target, t1, anchor);
        insert_dev(target, input, anchor);
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        if (detaching)
          detach_dev(t1);
        if (detaching)
          detach_dev(input);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_else_block$1.name,
      type: "else",
      source: "(40:1) {:else}",
      ctx
    });
    return block;
  }
  function create_if_block_1$5(ctx) {
    let div;
    let t1;
    let input;
    const block = {
      c: function create() {
        div = element("div");
        div.textContent = "Hit Point Maximum";
        t1 = space();
        input = element("input");
        add_location(div, file$e, 37, 2, 1076);
        attr_dev(input, "type", "number");
        add_location(input, file$e, 38, 2, 1107);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        insert_dev(target, t1, anchor);
        insert_dev(target, input, anchor);
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        if (detaching)
          detach_dev(t1);
        if (detaching)
          detach_dev(input);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_1$5.name,
      type: "if",
      source: "(36:20) ",
      ctx
    });
    return block;
  }
  function create_if_block$8(ctx) {
    let div;
    let t1;
    let input;
    const block = {
      c: function create() {
        div = element("div");
        div.textContent = "Hit Point Maximum";
        t1 = space();
        input = element("input");
        add_location(div, file$e, 33, 2, 925);
        attr_dev(input, "type", "number");
        add_location(input, file$e, 34, 2, 956);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        insert_dev(target, t1, anchor);
        insert_dev(target, input, anchor);
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        if (detaching)
          detach_dev(t1);
        if (detaching)
          detach_dev(input);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block$8.name,
      type: "if",
      source: "(32:1) {#if editMode}",
      ctx
    });
    return block;
  }
  function create_fragment$e(ctx) {
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
      if (ctx2[0])
        return create_if_block$8;
      if (ctx2[1])
        return create_if_block_1$5;
      return create_else_block$1;
    }
    let current_block_type = select_block_type(ctx);
    let if_block = current_block_type(ctx);
    const block = {
      c: function create() {
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
        this.c = noop;
        add_location(div0, file$e, 25, 1, 682);
        attr_dev(input0, "type", "number");
        input0.disabled = input0_disabled_value = !ctx[0];
        add_location(input0, file$e, 26, 1, 705);
        add_location(div1, file$e, 28, 1, 790);
        attr_dev(input1, "type", "number");
        add_location(input1, file$e, 29, 1, 823);
        add_location(div2, file$e, 24, 0, 675);
      },
      l: function claim(nodes) {
        throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
      },
      m: function mount(target, anchor) {
        insert_dev(target, div2, anchor);
        append_dev(div2, div0);
        append_dev(div2, t1);
        append_dev(div2, input0);
        set_input_value(input0, ctx[2]);
        append_dev(div2, t2);
        append_dev(div2, div1);
        append_dev(div2, t4);
        append_dev(div2, input1);
        append_dev(div2, t5);
        if_block.m(div2, null);
        if (!mounted) {
          dispose = [
            listen_dev(input0, "input", ctx[6]),
            listen_dev(input0, "change", ctx[3], false, false, false, false)
          ];
          mounted = true;
        }
      },
      p: function update2(ctx2, [dirty]) {
        if (dirty & 1 && input0_disabled_value !== (input0_disabled_value = !ctx2[0])) {
          prop_dev(input0, "disabled", input0_disabled_value);
        }
        if (dirty & 4 && to_number(input0.value) !== ctx2[2]) {
          set_input_value(input0, ctx2[2]);
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
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div2);
        if_block.d();
        mounted = false;
        run_all(dispose);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$e.name,
      type: "component",
      source: "",
      ctx
    });
    return block;
  }
  function instance$e($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    validate_slots("undefined", slots, []);
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
    $$self.$$.on_mount.push(function() {
      if (sys === void 0 && !("sys" in $$props || $$self.$$.bound[$$self.$$.props["sys"]])) {
        console.warn("<undefined> was created without expected prop 'sys'");
      }
      if (editMode === void 0 && !("editMode" in $$props || $$self.$$.bound[$$self.$$.props["editMode"]])) {
        console.warn("<undefined> was created without expected prop 'editMode'");
      }
      if (playMode === void 0 && !("playMode" in $$props || $$self.$$.bound[$$self.$$.props["playMode"]])) {
        console.warn("<undefined> was created without expected prop 'playMode'");
      }
      if (data === void 0 && !("data" in $$props || $$self.$$.bound[$$self.$$.props["data"]])) {
        console.warn("<undefined> was created without expected prop 'data'");
      }
    });
    const writable_props = ["sys", "editMode", "playMode", "data"];
    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
        console.warn(`<undefined> was created with unknown prop '${key}'`);
    });
    function input0_input_handler() {
      v = to_number(this.value);
      $$invalidate(2, v);
    }
    $$self.$$set = ($$props2) => {
      if ("sys" in $$props2)
        $$invalidate(4, sys = $$props2.sys);
      if ("editMode" in $$props2)
        $$invalidate(0, editMode = $$props2.editMode);
      if ("playMode" in $$props2)
        $$invalidate(1, playMode = $$props2.playMode);
      if ("data" in $$props2)
        $$invalidate(5, data = $$props2.data);
    };
    $$self.$capture_state = () => ({
      onDestroy,
      onMount,
      system,
      TNode,
      CNode,
      keyManager,
      sys,
      editMode,
      playMode,
      data,
      node,
      v,
      KEY,
      iterateValue
    });
    $$self.$inject_state = ($$props2) => {
      if ("sys" in $$props2)
        $$invalidate(4, sys = $$props2.sys);
      if ("editMode" in $$props2)
        $$invalidate(0, editMode = $$props2.editMode);
      if ("playMode" in $$props2)
        $$invalidate(1, playMode = $$props2.playMode);
      if ("data" in $$props2)
        $$invalidate(5, data = $$props2.data);
      if ("node" in $$props2)
        node = $$props2.node;
      if ("v" in $$props2)
        $$invalidate(2, v = $$props2.v);
    };
    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }
    return [editMode, playMode, v, iterateValue, sys, data, input0_input_handler];
  }
  class HitPoints extends SvelteElement {
    constructor(options) {
      super();
      init(
        this,
        {
          target: this.shadowRoot,
          props: attribute_to_object(this.attributes),
          customElement: true
        },
        instance$e,
        create_fragment$e,
        safe_not_equal,
        {
          sys: 4,
          editMode: 0,
          playMode: 1,
          data: 5
        },
        null
      );
      if (options) {
        if (options.target) {
          insert_dev(options.target, this, options.anchor);
        }
        if (options.props) {
          this.$set(options.props);
          flush();
        }
      }
    }
    static get observedAttributes() {
      return ["sys", "editMode", "playMode", "data"];
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
  const CustomSelect$1 = "";
  const file$d = "src/importedComponents/CustomSelect/CustomSelect.svelte";
  function get_each_context$5(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[23] = list[i];
    return child_ctx;
  }
  function create_key_block(ctx) {
    let div;
    let t_value = (ctx[0] == null ? ctx[2] : ctx[0]) + "";
    let t;
    let div_data_isdisabled_value;
    let div_data_iserror_value;
    let div_data_selected_value;
    let mounted;
    let dispose;
    const block = {
      c: function create() {
        var _a, _b, _c;
        div = element("div");
        t = text(t_value);
        attr_dev(div, "class", "GrobSelectLabel effect");
        attr_dev(div, "data-isdisabled", div_data_isdisabled_value = (_a = ctx[3]) != null ? _a : false);
        attr_dev(div, "data-iserror", div_data_iserror_value = (_b = ctx[4]) != null ? _b : false);
        attr_dev(div, "data-selected", div_data_selected_value = (_c = ctx[0]) != null ? _c : false);
        attr_dev(div, "tabindex", "-1");
        add_location(div, file$d, 73, 8, 2111);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        append_dev(div, t);
        ctx[17](div);
        if (!mounted) {
          dispose = [
            listen_dev(div, "focus", ctx[13], false, false, false, false),
            listen_dev(div, "blur", ctx[14], false, false, false, false)
          ];
          mounted = true;
        }
      },
      p: function update2(ctx2, dirty) {
        var _a, _b, _c;
        if (dirty & 5 && t_value !== (t_value = (ctx2[0] == null ? ctx2[2] : ctx2[0]) + ""))
          set_data_dev(t, t_value);
        if (dirty & 8 && div_data_isdisabled_value !== (div_data_isdisabled_value = (_a = ctx2[3]) != null ? _a : false)) {
          attr_dev(div, "data-isdisabled", div_data_isdisabled_value);
        }
        if (dirty & 16 && div_data_iserror_value !== (div_data_iserror_value = (_b = ctx2[4]) != null ? _b : false)) {
          attr_dev(div, "data-iserror", div_data_iserror_value);
        }
        if (dirty & 1 && div_data_selected_value !== (div_data_selected_value = (_c = ctx2[0]) != null ? _c : false)) {
          attr_dev(div, "data-selected", div_data_selected_value);
        }
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        ctx[17](null);
        mounted = false;
        run_all(dispose);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_key_block.name,
      type: "key",
      source: "(73:4) {#key selected}",
      ctx
    });
    return block;
  }
  function create_if_block$7(ctx) {
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
    let each_value = ctx[1];
    validate_each_argument(each_value);
    const get_key = (ctx2) => ctx2[23];
    validate_each_keys(ctx, each_value, get_each_context$5, get_key);
    for (let i = 0; i < each_value.length; i += 1) {
      let child_ctx = get_each_context$5(ctx, each_value, i);
      let key = get_key(child_ctx);
      each_1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
    }
    let if_block = ctx[1].length == 0 && create_if_block_1$4(ctx);
    const block = {
      c: function create() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        div3 = element("div");
        div1 = element("div");
        div0 = element("div");
        t0 = space();
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t1 = space();
        if (if_block)
          if_block.c();
        t2 = space();
        div2 = element("div");
        attr_dev(div0, "class", "Arrow");
        attr_dev(div0, "style", div0_style_value = `left:${ctx[12]}px`);
        add_location(div0, file$d, 106, 20, 3247);
        attr_dev(div1, "class", "ArrowContainer");
        add_location(div1, file$d, 105, 16, 3175);
        attr_dev(div2, "class", "selectEndTracker");
        add_location(div2, file$d, 126, 16, 3993);
        attr_dev(div3, "class", "SelectPopUp");
        attr_dev(div3, "style", div3_style_value = "width:" + ((_b = (_a = ctx[7]) == null ? void 0 : _a.width) != null ? _b : 100) + "px;left: " + ((_d = (_c = ctx[7]) == null ? void 0 : _c.x) != null ? _d : 0) + "px;top: " + (((_f = (_e = ctx[7]) == null ? void 0 : _e.y) != null ? _f : 0) + ((_h = (_g = ctx[7]) == null ? void 0 : _g.height) != null ? _h : 0) + 8) + "px;max-height:" + ctx[11] + "px");
        add_location(div3, file$d, 89, 12, 2624);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div3, anchor);
        append_dev(div3, div1);
        append_dev(div1, div0);
        ctx[18](div1);
        append_dev(div3, t0);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(div3, null);
          }
        }
        append_dev(div3, t1);
        if (if_block)
          if_block.m(div3, null);
        append_dev(div3, t2);
        append_dev(div3, div2);
        ctx[19](div2);
        current = true;
      },
      p: function update2(ctx2, dirty) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!current || dirty & 4096 && div0_style_value !== (div0_style_value = `left:${ctx2[12]}px`)) {
          attr_dev(div0, "style", div0_style_value);
        }
        if (dirty & 32771) {
          each_value = ctx2[1];
          validate_each_argument(each_value);
          validate_each_keys(ctx2, each_value, get_each_context$5, get_key);
          each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div3, destroy_block, create_each_block$5, t1, get_each_context$5);
        }
        if (ctx2[1].length == 0) {
          if (if_block)
            ;
          else {
            if_block = create_if_block_1$4(ctx2);
            if_block.c();
            if_block.m(div3, t2);
          }
        } else if (if_block) {
          if_block.d(1);
          if_block = null;
        }
        if (!current || dirty & 2176 && div3_style_value !== (div3_style_value = "width:" + ((_b = (_a = ctx2[7]) == null ? void 0 : _a.width) != null ? _b : 100) + "px;left: " + ((_d = (_c = ctx2[7]) == null ? void 0 : _c.x) != null ? _d : 0) + "px;top: " + (((_f = (_e = ctx2[7]) == null ? void 0 : _e.y) != null ? _f : 0) + ((_h = (_g = ctx2[7]) == null ? void 0 : _g.height) != null ? _h : 0) + 8) + "px;max-height:" + ctx2[11] + "px")) {
          attr_dev(div3, "style", div3_style_value);
        }
      },
      i: function intro(local) {
        if (current)
          return;
        add_render_callback(() => {
          if (!current)
            return;
          if (!div3_transition)
            div3_transition = create_bidirectional_transition(div3, slide, {}, true);
          div3_transition.run(1);
        });
        current = true;
      },
      o: function outro(local) {
        if (!div3_transition)
          div3_transition = create_bidirectional_transition(div3, slide, {}, false);
        div3_transition.run(0);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div3);
        ctx[18](null);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].d();
        }
        if (if_block)
          if_block.d();
        ctx[19](null);
        if (detaching && div3_transition)
          div3_transition.end();
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block$7.name,
      type: "if",
      source: "(89:8) {#if isFocussed || forceOpen}",
      ctx
    });
    return block;
  }
  function create_each_block$5(key_1, ctx) {
    let div;
    let t_value = ctx[23] + "";
    let t;
    let div_data_selected_value;
    let div_data_value_value;
    let mounted;
    let dispose;
    const block = {
      key: key_1,
      first: null,
      c: function create() {
        div = element("div");
        t = text(t_value);
        attr_dev(div, "role", "none");
        attr_dev(div, "class", "GrobSelectOption");
        attr_dev(div, "data-selected", div_data_selected_value = ctx[0] == ctx[23]);
        attr_dev(div, "data-value", div_data_value_value = ctx[23]);
        add_location(div, file$d, 112, 20, 3466);
        this.first = div;
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        append_dev(div, t);
        if (!mounted) {
          dispose = [
            listen_dev(div, "click", ctx[15], false, false, false, false),
            listen_dev(div, "keydown", ctx[15], false, false, false, false)
          ];
          mounted = true;
        }
      },
      p: function update2(new_ctx, dirty) {
        ctx = new_ctx;
        if (dirty & 2 && t_value !== (t_value = ctx[23] + ""))
          set_data_dev(t, t_value);
        if (dirty & 3 && div_data_selected_value !== (div_data_selected_value = ctx[0] == ctx[23])) {
          attr_dev(div, "data-selected", div_data_selected_value);
        }
        if (dirty & 2 && div_data_value_value !== (div_data_value_value = ctx[23])) {
          attr_dev(div, "data-value", div_data_value_value);
        }
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        mounted = false;
        run_all(dispose);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_each_block$5.name,
      type: "each",
      source: "(112:16) {#each options as opt (opt)}",
      ctx
    });
    return block;
  }
  function create_if_block_1$4(ctx) {
    let i;
    const block = {
      c: function create() {
        i = element("i");
        i.textContent = "No Options";
        attr_dev(i, "class", "GrobSelectInfo");
        add_location(i, file$d, 124, 20, 3914);
      },
      m: function mount(target, anchor) {
        insert_dev(target, i, anchor);
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(i);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_1$4.name,
      type: "if",
      source: "(124:16) {#if options.length == 0}",
      ctx
    });
    return block;
  }
  function create_fragment$d(ctx) {
    let div1;
    let previous_key = ctx[0];
    let t;
    let div0;
    let current;
    let key_block = create_key_block(ctx);
    let if_block = (ctx[8] || ctx[5]) && create_if_block$7(ctx);
    const block = {
      c: function create() {
        div1 = element("div");
        key_block.c();
        t = space();
        div0 = element("div");
        if (if_block)
          if_block.c();
        this.c = noop;
        add_location(div0, file$d, 87, 4, 2568);
        attr_dev(div1, "class", "GrobSelect");
        add_location(div1, file$d, 71, 0, 2058);
      },
      l: function claim(nodes) {
        throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
      },
      m: function mount(target, anchor) {
        insert_dev(target, div1, anchor);
        key_block.m(div1, null);
        append_dev(div1, t);
        append_dev(div1, div0);
        if (if_block)
          if_block.m(div0, null);
        current = true;
      },
      p: function update2(ctx2, [dirty]) {
        if (dirty & 1 && safe_not_equal(previous_key, previous_key = ctx2[0])) {
          key_block.d(1);
          key_block = create_key_block(ctx2);
          key_block.c();
          key_block.m(div1, t);
        } else {
          key_block.p(ctx2, dirty);
        }
        if (ctx2[8] || ctx2[5]) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & 288) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block$7(ctx2);
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
      i: function intro(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o: function outro(local) {
        transition_out(if_block);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div1);
        key_block.d(detaching);
        if (if_block)
          if_block.d();
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$d.name,
      type: "component",
      source: "",
      ctx
    });
    return block;
  }
  const svelteStandardAnimTime = 100;
  function instance$d($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    validate_slots("undefined", slots, []);
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
    $$self.$$.on_mount.push(function() {
      if (options === void 0 && !("options" in $$props || $$self.$$.bound[$$self.$$.props["options"]])) {
        console.warn("<undefined> was created without expected prop 'options'");
      }
    });
    const writable_props = [
      "options",
      "selected",
      "unSelectedplaceholder",
      "disabled",
      "isError",
      "forceOpen",
      "maxHeight"
    ];
    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
        console.warn(`<undefined> was created with unknown prop '${key}'`);
    });
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
      if ("options" in $$props2)
        $$invalidate(1, options = $$props2.options);
      if ("selected" in $$props2)
        $$invalidate(0, selected = $$props2.selected);
      if ("unSelectedplaceholder" in $$props2)
        $$invalidate(2, unSelectedplaceholder = $$props2.unSelectedplaceholder);
      if ("disabled" in $$props2)
        $$invalidate(3, disabled = $$props2.disabled);
      if ("isError" in $$props2)
        $$invalidate(4, isError = $$props2.isError);
      if ("forceOpen" in $$props2)
        $$invalidate(5, forceOpen = $$props2.forceOpen);
      if ("maxHeight" in $$props2)
        $$invalidate(16, maxHeight = $$props2.maxHeight);
    };
    $$self.$capture_state = () => ({
      fade,
      flip,
      createEventDispatcher,
      onMount,
      slide,
      svelteStandardAnimTime,
      dispatch: dispatch2,
      options,
      selected,
      unSelectedplaceholder,
      disabled,
      isError,
      forceOpen,
      maxHeight,
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
      recalculateHeight,
      recalculateWidth
    });
    $$self.$inject_state = ($$props2) => {
      if ("dispatch" in $$props2)
        dispatch2 = $$props2.dispatch;
      if ("options" in $$props2)
        $$invalidate(1, options = $$props2.options);
      if ("selected" in $$props2)
        $$invalidate(0, selected = $$props2.selected);
      if ("unSelectedplaceholder" in $$props2)
        $$invalidate(2, unSelectedplaceholder = $$props2.unSelectedplaceholder);
      if ("disabled" in $$props2)
        $$invalidate(3, disabled = $$props2.disabled);
      if ("isError" in $$props2)
        $$invalidate(4, isError = $$props2.isError);
      if ("forceOpen" in $$props2)
        $$invalidate(5, forceOpen = $$props2.forceOpen);
      if ("maxHeight" in $$props2)
        $$invalidate(16, maxHeight = $$props2.maxHeight);
      if ("label" in $$props2)
        $$invalidate(6, label = $$props2.label);
      if ("labelRect" in $$props2)
        $$invalidate(7, labelRect = $$props2.labelRect);
      if ("isFocussed" in $$props2)
        $$invalidate(8, isFocussed = $$props2.isFocussed);
      if ("endTracker" in $$props2)
        $$invalidate(9, endTracker = $$props2.endTracker);
      if ("topTracker" in $$props2)
        $$invalidate(10, topTracker = $$props2.topTracker);
      if ("override_maxHeight" in $$props2)
        $$invalidate(11, override_maxHeight = $$props2.override_maxHeight);
      if ("arrowOffsetLeft" in $$props2)
        $$invalidate(12, arrowOffsetLeft = $$props2.arrowOffsetLeft);
    };
    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }
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
  class CustomSelect extends SvelteElement {
    constructor(options) {
      super();
      init(
        this,
        {
          target: this.shadowRoot,
          props: attribute_to_object(this.attributes),
          customElement: true
        },
        instance$d,
        create_fragment$d,
        safe_not_equal,
        {
          options: 1,
          selected: 0,
          unSelectedplaceholder: 2,
          disabled: 3,
          isError: 4,
          forceOpen: 5,
          maxHeight: 16
        },
        null
      );
      if (options) {
        if (options.target) {
          insert_dev(options.target, this, options.anchor);
        }
        if (options.props) {
          this.$set(options.props);
          flush();
        }
      }
    }
    static get observedAttributes() {
      return [
        "options",
        "selected",
        "unSelectedplaceholder",
        "disabled",
        "isError",
        "forceOpen",
        "maxHeight"
      ];
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
  const { Object: Object_1 } = globals;
  const file$c = "src/Structure/ItemOptions.svelte";
  function get_each_context$4(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[8] = list[i];
    return child_ctx;
  }
  function create_each_block$4(ctx) {
    let option;
    let t0_value = ctx[8] + "";
    let t0;
    let t1;
    const block = {
      c: function create() {
        option = element("option");
        t0 = text(t0_value);
        t1 = space();
        option.__value = ctx[8];
        option.value = option.__value;
        option.selected = ctx[2] == ctx[8];
        add_location(option, file$c, 28, 5, 944);
      },
      m: function mount(target, anchor) {
        insert_dev(target, option, anchor);
        append_dev(option, t0);
        append_dev(option, t1);
      },
      p: noop,
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(option);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_each_block$4.name,
      type: "each",
      source: "(28:4) {#each options as opt}",
      ctx
    });
    return block;
  }
  function create_fragment$c(ctx) {
    let div2;
    let div1;
    let div0;
    let select;
    let option;
    let mounted;
    let dispose;
    let each_value = ctx[1];
    validate_each_argument(each_value);
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    }
    const block = {
      c: function create() {
        div2 = element("div");
        div1 = element("div");
        div0 = element("div");
        select = element("select");
        option = element("option");
        option.textContent = "choose component ";
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        this.c = noop;
        option.__value = null;
        option.value = option.__value;
        add_location(option, file$c, 26, 4, 860);
        add_location(select, file$c, 25, 3, 805);
        attr_dev(div0, "class", "ItemOptionBtn ");
        add_location(div0, file$c, 24, 2, 772);
        attr_dev(div1, "class", "ItemOptions");
        add_location(div1, file$c, 23, 1, 743);
        attr_dev(div2, "class", "ItemOptionsContainer");
        add_location(div2, file$c, 16, 0, 499);
      },
      l: function claim(nodes) {
        throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
      },
      m: function mount(target, anchor) {
        insert_dev(target, div2, anchor);
        append_dev(div2, div1);
        append_dev(div1, div0);
        append_dev(div0, select);
        append_dev(select, option);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(select, null);
          }
        }
        ctx[6](select);
        if (!mounted) {
          dispose = listen_dev(select, "change", ctx[3], false, false, false, false);
          mounted = true;
        }
      },
      p: function update2(ctx2, [dirty]) {
        if (dirty & 6) {
          each_value = ctx2[1];
          validate_each_argument(each_value);
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
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div2);
        destroy_each(each_blocks, detaching);
        ctx[6](null);
        mounted = false;
        dispose();
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$c.name,
      type: "component",
      source: "",
      ctx
    });
    return block;
  }
  function instance$c($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    validate_slots("undefined", slots, []);
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
    $$self.$$.on_mount.push(function() {
      if (data === void 0 && !("data" in $$props || $$self.$$.bound[$$self.$$.props["data"]])) {
        console.warn("<undefined> was created without expected prop 'data'");
      }
      if (editMode === void 0 && !("editMode" in $$props || $$self.$$.bound[$$self.$$.props["editMode"]])) {
        console.warn("<undefined> was created without expected prop 'editMode'");
      }
    });
    const writable_props = ["data", "editMode"];
    Object_1.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
        console.warn(`<undefined> was created with unknown prop '${key}'`);
    });
    function select_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        tab = $$value;
        $$invalidate(0, tab);
        $$invalidate(1, options);
      });
    }
    $$self.$$set = ($$props2) => {
      if ("data" in $$props2)
        $$invalidate(4, data = $$props2.data);
      if ("editMode" in $$props2)
        $$invalidate(5, editMode = $$props2.editMode);
    };
    $$self.$capture_state = () => ({
      createEventDispatcher,
      viewNameIndex,
      CustomSelect,
      dispatch: dispatch2,
      data,
      editMode,
      options,
      selected,
      tab,
      selectOption
    });
    $$self.$inject_state = ($$props2) => {
      if ("dispatch" in $$props2)
        dispatch2 = $$props2.dispatch;
      if ("data" in $$props2)
        $$invalidate(4, data = $$props2.data);
      if ("editMode" in $$props2)
        $$invalidate(5, editMode = $$props2.editMode);
      if ("options" in $$props2)
        $$invalidate(1, options = $$props2.options);
      if ("selected" in $$props2)
        $$invalidate(2, selected = $$props2.selected);
      if ("tab" in $$props2)
        $$invalidate(0, tab = $$props2.tab);
    };
    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }
    return [tab, options, selected, selectOption, data, editMode, select_binding];
  }
  class ItemOptions extends SvelteElement {
    constructor(options) {
      super();
      init(
        this,
        {
          target: this.shadowRoot,
          props: attribute_to_object(this.attributes),
          customElement: true
        },
        instance$c,
        create_fragment$c,
        safe_not_equal,
        { data: 4, editMode: 5 },
        null
      );
      if (options) {
        if (options.target) {
          insert_dev(options.target, this, options.anchor);
        }
        if (options.props) {
          this.$set(options.props);
          flush();
        }
      }
    }
    static get observedAttributes() {
      return ["data", "editMode"];
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
  const file$b = "src/Components/ProficiencyBonus.svelte";
  function create_fragment$b(ctx) {
    let div1;
    let div0;
    let t1;
    let input;
    let input_disabled_value;
    let mounted;
    let dispose;
    const block = {
      c: function create() {
        div1 = element("div");
        div0 = element("div");
        div0.textContent = "Proficiency Bonus";
        t1 = space();
        input = element("input");
        this.c = noop;
        add_location(div0, file$b, 24, 1, 726);
        attr_dev(input, "type", "number");
        input.disabled = input_disabled_value = !ctx[0];
        add_location(input, file$b, 25, 1, 756);
        attr_dev(div1, "class", "ProficiencyBonus");
        add_location(div1, file$b, 23, 0, 693);
      },
      l: function claim(nodes) {
        throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
      },
      m: function mount(target, anchor) {
        insert_dev(target, div1, anchor);
        append_dev(div1, div0);
        append_dev(div1, t1);
        append_dev(div1, input);
        set_input_value(input, ctx[1]);
        if (!mounted) {
          dispose = [
            listen_dev(input, "input", ctx[5]),
            listen_dev(input, "change", ctx[2], false, false, false, false)
          ];
          mounted = true;
        }
      },
      p: function update2(ctx2, [dirty]) {
        if (dirty & 1 && input_disabled_value !== (input_disabled_value = !ctx2[0])) {
          prop_dev(input, "disabled", input_disabled_value);
        }
        if (dirty & 2 && to_number(input.value) !== ctx2[1]) {
          set_input_value(input, ctx2[1]);
        }
      },
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div1);
        mounted = false;
        run_all(dispose);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$b.name,
      type: "component",
      source: "",
      ctx
    });
    return block;
  }
  function instance$b($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    validate_slots("undefined", slots, []);
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
    $$self.$$.on_mount.push(function() {
      if (sys === void 0 && !("sys" in $$props || $$self.$$.bound[$$self.$$.props["sys"]])) {
        console.warn("<undefined> was created without expected prop 'sys'");
      }
      if (editMode === void 0 && !("editMode" in $$props || $$self.$$.bound[$$self.$$.props["editMode"]])) {
        console.warn("<undefined> was created without expected prop 'editMode'");
      }
      if (data === void 0 && !("data" in $$props || $$self.$$.bound[$$self.$$.props["data"]])) {
        console.warn("<undefined> was created without expected prop 'data'");
      }
    });
    const writable_props = ["sys", "editMode", "data"];
    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
        console.warn(`<undefined> was created with unknown prop '${key}'`);
    });
    function input_input_handler() {
      v = to_number(this.value);
      $$invalidate(1, v);
    }
    $$self.$$set = ($$props2) => {
      if ("sys" in $$props2)
        $$invalidate(3, sys = $$props2.sys);
      if ("editMode" in $$props2)
        $$invalidate(0, editMode = $$props2.editMode);
      if ("data" in $$props2)
        $$invalidate(4, data = $$props2.data);
    };
    $$self.$capture_state = () => ({
      onDestroy,
      onMount,
      system,
      TNode,
      CNode,
      keyManager,
      ItemOptions,
      sys,
      editMode,
      data,
      node,
      v,
      KEY,
      iterateValue
    });
    $$self.$inject_state = ($$props2) => {
      if ("sys" in $$props2)
        $$invalidate(3, sys = $$props2.sys);
      if ("editMode" in $$props2)
        $$invalidate(0, editMode = $$props2.editMode);
      if ("data" in $$props2)
        $$invalidate(4, data = $$props2.data);
      if ("node" in $$props2)
        node = $$props2.node;
      if ("v" in $$props2)
        $$invalidate(1, v = $$props2.v);
    };
    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }
    return [editMode, v, iterateValue, sys, data, input_input_handler];
  }
  class ProficiencyBonus extends SvelteElement {
    constructor(options) {
      super();
      init(
        this,
        {
          target: this.shadowRoot,
          props: attribute_to_object(this.attributes),
          customElement: true
        },
        instance$b,
        create_fragment$b,
        safe_not_equal,
        { sys: 3, editMode: 0, data: 4 },
        null
      );
      if (options) {
        if (options.target) {
          insert_dev(options.target, this, options.anchor);
        }
        if (options.props) {
          this.$set(options.props);
          flush();
        }
      }
    }
    static get observedAttributes() {
      return ["sys", "editMode", "data"];
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
  const file$a = "src/Components/SkillProficiency.svelte";
  function create_fragment$a(ctx) {
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
    const block = {
      c: function create() {
        div4 = element("div");
        div1 = element("div");
        div0 = element("div");
        t0 = space();
        div2 = element("div");
        p0 = element("p");
        t1 = text(ctx[1]);
        t2 = space();
        div3 = element("div");
        p1 = element("p");
        t3 = text(ctx[3]);
        this.c = noop;
        attr_dev(div0, "class", "skillproficiencyMark");
        attr_dev(div0, "data-level", ctx[2]);
        attr_dev(div0, "role", "none");
        add_location(div0, file$a, 36, 8, 1166);
        attr_dev(div1, "class", "skillproficiencyMarkParent");
        add_location(div1, file$a, 35, 4, 1117);
        add_location(p0, file$a, 45, 8, 1402);
        attr_dev(div2, "class", "skillproficiencyMarkName");
        add_location(div2, file$a, 44, 4, 1355);
        add_location(p1, file$a, 48, 8, 1479);
        attr_dev(div3, "class", "skillproficiencyMarkValue");
        add_location(div3, file$a, 47, 4, 1431);
        attr_dev(div4, "class", "skillproficiencyContainer");
        attr_dev(div4, "data-edit", ctx[0]);
        add_location(div4, file$a, 34, 0, 1056);
      },
      l: function claim(nodes) {
        throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
      },
      m: function mount(target, anchor) {
        insert_dev(target, div4, anchor);
        append_dev(div4, div1);
        append_dev(div1, div0);
        append_dev(div4, t0);
        append_dev(div4, div2);
        append_dev(div2, p0);
        append_dev(p0, t1);
        append_dev(div4, t2);
        append_dev(div4, div3);
        append_dev(div3, p1);
        append_dev(p1, t3);
        if (!mounted) {
          dispose = [
            listen_dev(div0, "keyup", ctx[6], false, false, false, false),
            listen_dev(div0, "click", ctx[4], false, false, false, false)
          ];
          mounted = true;
        }
      },
      p: function update2(ctx2, [dirty]) {
        if (dirty & 4) {
          attr_dev(div0, "data-level", ctx2[2]);
        }
        if (dirty & 2)
          set_data_dev(t1, ctx2[1]);
        if (dirty & 8)
          set_data_dev(t3, ctx2[3]);
        if (dirty & 1) {
          attr_dev(div4, "data-edit", ctx2[0]);
        }
      },
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div4);
        mounted = false;
        run_all(dispose);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$a.name,
      type: "component",
      source: "",
      ctx
    });
    return block;
  }
  function instance$a($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    validate_slots("undefined", slots, []);
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
    $$self.$$.on_mount.push(function() {
      if (edit === void 0 && !("edit" in $$props || $$self.$$.bound[$$self.$$.props["edit"]])) {
        console.warn("<undefined> was created without expected prop 'edit'");
      }
      if (name2 === void 0 && !("name" in $$props || $$self.$$.bound[$$self.$$.props["name"]])) {
        console.warn("<undefined> was created without expected prop 'name'");
      }
      if (sys === void 0 && !("sys" in $$props || $$self.$$.bound[$$self.$$.props["sys"]])) {
        console.warn("<undefined> was created without expected prop 'sys'");
      }
    });
    const writable_props = ["edit", "name", "sys"];
    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
        console.warn(`<undefined> was created with unknown prop '${key}'`);
    });
    function keyup_handler(event) {
      bubble.call(this, $$self, event);
    }
    $$self.$$set = ($$props2) => {
      if ("edit" in $$props2)
        $$invalidate(0, edit = $$props2.edit);
      if ("name" in $$props2)
        $$invalidate(1, name2 = $$props2.name);
      if ("sys" in $$props2)
        $$invalidate(5, sys = $$props2.sys);
    };
    $$self.$capture_state = () => ({
      system,
      TNode,
      onDestroy,
      onMount,
      CNode,
      keyManager,
      edit,
      name: name2,
      sys,
      node_skill,
      node_bonus,
      value,
      bonus,
      KEY,
      iterateValue
    });
    $$self.$inject_state = ($$props2) => {
      if ("edit" in $$props2)
        $$invalidate(0, edit = $$props2.edit);
      if ("name" in $$props2)
        $$invalidate(1, name2 = $$props2.name);
      if ("sys" in $$props2)
        $$invalidate(5, sys = $$props2.sys);
      if ("node_skill" in $$props2)
        node_skill = $$props2.node_skill;
      if ("node_bonus" in $$props2)
        node_bonus = $$props2.node_bonus;
      if ("value" in $$props2)
        $$invalidate(2, value = $$props2.value);
      if ("bonus" in $$props2)
        $$invalidate(3, bonus = $$props2.bonus);
    };
    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }
    return [edit, name2, value, bonus, iterateValue, sys, keyup_handler];
  }
  class SkillProficiency extends SvelteElement {
    constructor(options) {
      super();
      init(
        this,
        {
          target: this.shadowRoot,
          props: attribute_to_object(this.attributes),
          customElement: true
        },
        instance$a,
        create_fragment$a,
        safe_not_equal,
        { edit: 0, name: 1, sys: 5 },
        null
      );
      if (options) {
        if (options.target) {
          insert_dev(options.target, this, options.anchor);
        }
        if (options.props) {
          this.$set(options.props);
          flush();
        }
      }
    }
    static get observedAttributes() {
      return ["edit", "name", "sys"];
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
  const file$9 = "src/Components/SkillProficiencyCollection.svelte";
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
        edit: ctx[0],
        name: ctx[4],
        sys: ctx[1]
      },
      $$inline: true
    });
    const block = {
      c: function create() {
        create_component(skillproficiency.$$.fragment);
      },
      m: function mount(target, anchor) {
        mount_component(skillproficiency, target, anchor);
        current = true;
      },
      p: function update2(ctx2, dirty) {
        const skillproficiency_changes = {};
        if (dirty & 1)
          skillproficiency_changes.edit = ctx2[0];
        if (dirty & 2)
          skillproficiency_changes.sys = ctx2[1];
        skillproficiency.$set(skillproficiency_changes);
      },
      i: function intro(local) {
        if (current)
          return;
        transition_in(skillproficiency.$$.fragment, local);
        current = true;
      },
      o: function outro(local) {
        transition_out(skillproficiency.$$.fragment, local);
        current = false;
      },
      d: function destroy(detaching) {
        destroy_component(skillproficiency, detaching);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_each_block$3.name,
      type: "each",
      source: "(14:1) {#each names as name }",
      ctx
    });
    return block;
  }
  function create_fragment$9(ctx) {
    let div;
    let current;
    let each_value = ctx[2];
    validate_each_argument(each_value);
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    const block = {
      c: function create() {
        div = element("div");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        this.c = noop;
        attr_dev(div, "class", "skillproficiencyCollection");
        attr_dev(div, "data-edit", ctx[0]);
        add_location(div, file$9, 12, 0, 362);
      },
      l: function claim(nodes) {
        throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(div, null);
          }
        }
        current = true;
      },
      p: function update2(ctx2, [dirty]) {
        if (dirty & 7) {
          each_value = ctx2[2];
          validate_each_argument(each_value);
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
        if (!current || dirty & 1) {
          attr_dev(div, "data-edit", ctx2[0]);
        }
      },
      i: function intro(local) {
        if (current)
          return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o: function outro(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        destroy_each(each_blocks, detaching);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$9.name,
      type: "component",
      source: "",
      ctx
    });
    return block;
  }
  function instance$9($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    validate_slots("undefined", slots, []);
    let { edit } = $$props;
    let { sys } = $$props;
    let { data } = $$props;
    let names = sys.getNodeNames("fixed", "SkillProficiencies");
    $$self.$$.on_mount.push(function() {
      if (edit === void 0 && !("edit" in $$props || $$self.$$.bound[$$self.$$.props["edit"]])) {
        console.warn("<undefined> was created without expected prop 'edit'");
      }
      if (sys === void 0 && !("sys" in $$props || $$self.$$.bound[$$self.$$.props["sys"]])) {
        console.warn("<undefined> was created without expected prop 'sys'");
      }
      if (data === void 0 && !("data" in $$props || $$self.$$.bound[$$self.$$.props["data"]])) {
        console.warn("<undefined> was created without expected prop 'data'");
      }
    });
    const writable_props = ["edit", "sys", "data"];
    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
        console.warn(`<undefined> was created with unknown prop '${key}'`);
    });
    $$self.$$set = ($$props2) => {
      if ("edit" in $$props2)
        $$invalidate(0, edit = $$props2.edit);
      if ("sys" in $$props2)
        $$invalidate(1, sys = $$props2.sys);
      if ("data" in $$props2)
        $$invalidate(3, data = $$props2.data);
    };
    $$self.$capture_state = () => ({
      SkillProficiency,
      system,
      TNode,
      CNode,
      ItemOptions,
      edit,
      sys,
      data,
      names
    });
    $$self.$inject_state = ($$props2) => {
      if ("edit" in $$props2)
        $$invalidate(0, edit = $$props2.edit);
      if ("sys" in $$props2)
        $$invalidate(1, sys = $$props2.sys);
      if ("data" in $$props2)
        $$invalidate(3, data = $$props2.data);
      if ("names" in $$props2)
        $$invalidate(2, names = $$props2.names);
    };
    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }
    return [edit, sys, names, data];
  }
  class SkillProficiencyCollection extends SvelteElement {
    constructor(options) {
      super();
      init(
        this,
        {
          target: this.shadowRoot,
          props: attribute_to_object(this.attributes),
          customElement: true
        },
        instance$9,
        create_fragment$9,
        safe_not_equal,
        { edit: 0, sys: 1, data: 3 },
        null
      );
      if (options) {
        if (options.target) {
          insert_dev(options.target, this, options.anchor);
        }
        if (options.props) {
          this.$set(options.props);
          flush();
        }
      }
    }
    static get observedAttributes() {
      return ["edit", "sys", "data"];
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
  const file$8 = "src/Components/SpellInfo.svelte";
  function get_each_context$2(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[17] = list[i];
    return child_ctx;
  }
  function create_else_block(ctx) {
    let div;
    const block = {
      c: function create() {
        div = element("div");
        add_location(div, file$8, 71, 8, 2071);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
      },
      p: noop,
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_else_block.name,
      type: "else",
      source: "(71:4) {:else}",
      ctx
    });
    return block;
  }
  function create_if_block$6(ctx) {
    let div;
    let select;
    let mounted;
    let dispose;
    let each_value = ctx[5];
    validate_each_argument(each_value);
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    }
    const block = {
      c: function create() {
        div = element("div");
        select = element("select");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        add_location(select, file$8, 62, 12, 1758);
        add_location(div, file$8, 61, 8, 1740);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        append_dev(div, select);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(select, null);
          }
        }
        ctx[9](select);
        if (!mounted) {
          dispose = listen_dev(select, "change", ctx[6], false, false, false, false);
          mounted = true;
        }
      },
      p: function update2(ctx2, dirty) {
        if (dirty & 34) {
          each_value = ctx2[5];
          validate_each_argument(each_value);
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
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        destroy_each(each_blocks, detaching);
        ctx[9](null);
        mounted = false;
        dispose();
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block$6.name,
      type: "if",
      source: "(61:4) {#if edit}",
      ctx
    });
    return block;
  }
  function create_each_block$2(ctx) {
    let option;
    let t0_value = ctx[17] + "";
    let t0;
    let t1;
    let option_selected_value;
    const block = {
      c: function create() {
        option = element("option");
        t0 = text(t0_value);
        t1 = space();
        option.__value = ctx[17];
        option.value = option.__value;
        option.selected = option_selected_value = ctx[17] == ctx[1];
        add_location(option, file$8, 64, 20, 1882);
      },
      m: function mount(target, anchor) {
        insert_dev(target, option, anchor);
        append_dev(option, t0);
        append_dev(option, t1);
      },
      p: function update2(ctx2, dirty) {
        if (dirty & 2 && option_selected_value !== (option_selected_value = ctx2[17] == ctx2[1])) {
          prop_dev(option, "selected", option_selected_value);
        }
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(option);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_each_block$2.name,
      type: "each",
      source: "(64:16) {#each spellBonusChoices as key}",
      ctx
    });
    return block;
  }
  function create_fragment$8(ctx) {
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
      if (ctx2[0])
        return create_if_block$6;
      return create_else_block;
    }
    let current_block_type = select_block_type(ctx);
    let if_block = current_block_type(ctx);
    const block = {
      c: function create() {
        div8 = element("div");
        if_block.c();
        t0 = space();
        div7 = element("div");
        div0 = element("div");
        t1 = text(ctx[1]);
        t2 = space();
        div3 = element("div");
        div1 = element("div");
        div1.textContent = "Spell DC";
        t4 = space();
        div2 = element("div");
        t5 = text(ctx[2]);
        t6 = space();
        div6 = element("div");
        div4 = element("div");
        div4.textContent = "Spell Bonus";
        t8 = space();
        div5 = element("div");
        t9 = text(ctx[3]);
        this.c = noop;
        add_location(div0, file$8, 75, 8, 2137);
        add_location(div1, file$8, 77, 12, 2185);
        add_location(div2, file$8, 78, 12, 2217);
        add_location(div3, file$8, 76, 8, 2167);
        add_location(div4, file$8, 82, 12, 2282);
        add_location(div5, file$8, 83, 12, 2317);
        add_location(div6, file$8, 81, 8, 2264);
        attr_dev(div7, "class", "spellDCContainer");
        add_location(div7, file$8, 74, 4, 2098);
        add_location(div8, file$8, 59, 0, 1711);
      },
      l: function claim(nodes) {
        throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
      },
      m: function mount(target, anchor) {
        insert_dev(target, div8, anchor);
        if_block.m(div8, null);
        append_dev(div8, t0);
        append_dev(div8, div7);
        append_dev(div7, div0);
        append_dev(div0, t1);
        append_dev(div7, t2);
        append_dev(div7, div3);
        append_dev(div3, div1);
        append_dev(div3, t4);
        append_dev(div3, div2);
        append_dev(div2, t5);
        append_dev(div7, t6);
        append_dev(div7, div6);
        append_dev(div6, div4);
        append_dev(div6, t8);
        append_dev(div6, div5);
        append_dev(div5, t9);
      },
      p: function update2(ctx2, [dirty]) {
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
        if (dirty & 2)
          set_data_dev(t1, ctx2[1]);
        if (dirty & 4)
          set_data_dev(t5, ctx2[2]);
        if (dirty & 8)
          set_data_dev(t9, ctx2[3]);
      },
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div8);
        if_block.d();
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$8.name,
      type: "component",
      source: "",
      ctx
    });
    return block;
  }
  class SpellInfoData {
    constructor() {
      __publicField(this, "showStat", "");
    }
  }
  function instance$8($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    validate_slots("undefined", slots, []);
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
    $$self.$$.on_mount.push(function() {
      if (sys === void 0 && !("sys" in $$props || $$self.$$.bound[$$self.$$.props["sys"]])) {
        console.warn("<undefined> was created without expected prop 'sys'");
      }
      if (edit === void 0 && !("edit" in $$props || $$self.$$.bound[$$self.$$.props["edit"]])) {
        console.warn("<undefined> was created without expected prop 'edit'");
      }
      if (data === void 0 && !("data" in $$props || $$self.$$.bound[$$self.$$.props["data"]])) {
        console.warn("<undefined> was created without expected prop 'data'");
      }
    });
    const writable_props = ["sys", "edit", "data"];
    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
        console.warn(`<undefined> was created with unknown prop '${key}'`);
    });
    function select_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        sortSelect = $$value;
        $$invalidate(4, sortSelect);
        $$invalidate(5, spellBonusChoices);
      });
    }
    $$self.$$set = ($$props2) => {
      if ("sys" in $$props2)
        $$invalidate(7, sys = $$props2.sys);
      if ("edit" in $$props2)
        $$invalidate(0, edit = $$props2.edit);
      if ("data" in $$props2)
        $$invalidate(8, data = $$props2.data);
    };
    $$self.$capture_state = () => ({
      SpellInfoData,
      onDestroy,
      onMount,
      system,
      TNode,
      CNode,
      keyManager,
      sys,
      edit,
      data,
      KEY,
      dataData,
      spellBonusChoices,
      showStat,
      nodeDC,
      nodeBonus,
      chosen_DC,
      chosen_BONUS,
      sortSelect,
      changeSort,
      update: update2,
      addListeners,
      removeListener
    });
    $$self.$inject_state = ($$props2) => {
      if ("sys" in $$props2)
        $$invalidate(7, sys = $$props2.sys);
      if ("edit" in $$props2)
        $$invalidate(0, edit = $$props2.edit);
      if ("data" in $$props2)
        $$invalidate(8, data = $$props2.data);
      if ("dataData" in $$props2)
        dataData = $$props2.dataData;
      if ("spellBonusChoices" in $$props2)
        $$invalidate(5, spellBonusChoices = $$props2.spellBonusChoices);
      if ("showStat" in $$props2)
        $$invalidate(1, showStat = $$props2.showStat);
      if ("nodeDC" in $$props2)
        nodeDC = $$props2.nodeDC;
      if ("nodeBonus" in $$props2)
        nodeBonus = $$props2.nodeBonus;
      if ("chosen_DC" in $$props2)
        $$invalidate(2, chosen_DC = $$props2.chosen_DC);
      if ("chosen_BONUS" in $$props2)
        $$invalidate(3, chosen_BONUS = $$props2.chosen_BONUS);
      if ("sortSelect" in $$props2)
        $$invalidate(4, sortSelect = $$props2.sortSelect);
    };
    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }
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
  class SpellInfo extends SvelteElement {
    constructor(options) {
      super();
      init(
        this,
        {
          target: this.shadowRoot,
          props: attribute_to_object(this.attributes),
          customElement: true
        },
        instance$8,
        create_fragment$8,
        safe_not_equal,
        { sys: 7, edit: 0, data: 8 },
        null
      );
      if (options) {
        if (options.target) {
          insert_dev(options.target, this, options.anchor);
        }
        if (options.props) {
          this.$set(options.props);
          flush();
        }
      }
    }
    static get observedAttributes() {
      return ["sys", "edit", "data"];
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
  const file$7 = "src/Components/StatValue.svelte";
  function create_fragment$7(ctx) {
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
    const block = {
      c: function create() {
        div4 = element("div");
        div0 = element("div");
        t0 = text(ctx[0]);
        t1 = space();
        div1 = element("div");
        input = element("input");
        t2 = space();
        div3 = element("div");
        div2 = element("div");
        t3 = text(ctx[3]);
        this.c = noop;
        attr_dev(div0, "class", "statTitle");
        add_location(div0, file$7, 32, 1, 983);
        attr_dev(input, "class", "BoxValue");
        attr_dev(input, "data-editmode", ctx[1]);
        input.disabled = input_disabled_value = !ctx[1];
        input.value = ctx[2];
        attr_dev(input, "type", "number");
        attr_dev(input, "min", "0");
        attr_dev(input, "max", "100");
        add_location(input, file$7, 37, 2, 1057);
        attr_dev(div1, "class", "LargeValue");
        add_location(div1, file$7, 36, 1, 1029);
        attr_dev(div2, "class", "BoxValue");
        add_location(div2, file$7, 51, 2, 1303);
        attr_dev(div3, "class", "SmallValue");
        add_location(div3, file$7, 50, 1, 1276);
        attr_dev(div4, "class", "StatValue");
        add_location(div4, file$7, 30, 0, 956);
      },
      l: function claim(nodes) {
        throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
      },
      m: function mount(target, anchor) {
        insert_dev(target, div4, anchor);
        append_dev(div4, div0);
        append_dev(div0, t0);
        append_dev(div4, t1);
        append_dev(div4, div1);
        append_dev(div1, input);
        ctx[8](input);
        append_dev(div4, t2);
        append_dev(div4, div3);
        append_dev(div3, div2);
        append_dev(div2, t3);
        if (!mounted) {
          dispose = listen_dev(input, "change", ctx[5], false, false, false, false);
          mounted = true;
        }
      },
      p: function update2(ctx2, [dirty]) {
        if (dirty & 1)
          set_data_dev(t0, ctx2[0]);
        if (dirty & 2) {
          attr_dev(input, "data-editmode", ctx2[1]);
        }
        if (dirty & 2 && input_disabled_value !== (input_disabled_value = !ctx2[1])) {
          prop_dev(input, "disabled", input_disabled_value);
        }
        if (dirty & 4 && input.value !== ctx2[2]) {
          prop_dev(input, "value", ctx2[2]);
        }
        if (dirty & 8)
          set_data_dev(t3, ctx2[3]);
      },
      i: noop,
      o: noop,
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div4);
        ctx[8](null);
        mounted = false;
        dispose();
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$7.name,
      type: "component",
      source: "",
      ctx
    });
    return block;
  }
  function instance$7($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    validate_slots("undefined", slots, []);
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
    $$self.$$.on_mount.push(function() {
      if (name2 === void 0 && !("name" in $$props || $$self.$$.bound[$$self.$$.props["name"]])) {
        console.warn("<undefined> was created without expected prop 'name'");
      }
      if (statNode === void 0 && !("statNode" in $$props || $$self.$$.bound[$$self.$$.props["statNode"]])) {
        console.warn("<undefined> was created without expected prop 'statNode'");
      }
      if (modNode === void 0 && !("modNode" in $$props || $$self.$$.bound[$$self.$$.props["modNode"]])) {
        console.warn("<undefined> was created without expected prop 'modNode'");
      }
    });
    const writable_props = ["name", "statNode", "modNode", "editmode"];
    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
        console.warn(`<undefined> was created with unknown prop '${key}'`);
    });
    function input_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        statValueDiv = $$value;
        $$invalidate(4, statValueDiv);
      });
    }
    $$self.$$set = ($$props2) => {
      if ("name" in $$props2)
        $$invalidate(0, name2 = $$props2.name);
      if ("statNode" in $$props2)
        $$invalidate(6, statNode = $$props2.statNode);
      if ("modNode" in $$props2)
        $$invalidate(7, modNode = $$props2.modNode);
      if ("editmode" in $$props2)
        $$invalidate(1, editmode = $$props2.editmode);
    };
    $$self.$capture_state = () => ({
      onDestroy,
      onMount,
      TNode,
      keyManager,
      name: name2,
      statNode,
      modNode,
      editmode,
      nodeValue,
      modNodeValue,
      KEY,
      onDerivedOrFixedNodeUpdate,
      onChange,
      statValueDiv
    });
    $$self.$inject_state = ($$props2) => {
      if ("name" in $$props2)
        $$invalidate(0, name2 = $$props2.name);
      if ("statNode" in $$props2)
        $$invalidate(6, statNode = $$props2.statNode);
      if ("modNode" in $$props2)
        $$invalidate(7, modNode = $$props2.modNode);
      if ("editmode" in $$props2)
        $$invalidate(1, editmode = $$props2.editmode);
      if ("nodeValue" in $$props2)
        $$invalidate(2, nodeValue = $$props2.nodeValue);
      if ("modNodeValue" in $$props2)
        $$invalidate(3, modNodeValue = $$props2.modNodeValue);
      if ("statValueDiv" in $$props2)
        $$invalidate(4, statValueDiv = $$props2.statValueDiv);
    };
    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }
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
  class StatValue extends SvelteElement {
    constructor(options) {
      super();
      init(
        this,
        {
          target: this.shadowRoot,
          props: attribute_to_object(this.attributes),
          customElement: true
        },
        instance$7,
        create_fragment$7,
        safe_not_equal,
        {
          name: 0,
          statNode: 6,
          modNode: 7,
          editmode: 1
        },
        null
      );
      if (options) {
        if (options.target) {
          insert_dev(options.target, this, options.anchor);
        }
        if (options.props) {
          this.$set(options.props);
          flush();
        }
      }
    }
    static get observedAttributes() {
      return ["name", "statNode", "modNode", "editmode"];
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
  const file$6 = "src/Components/Stats.svelte";
  function get_each_context$1(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[3] = list[i];
    const constants_0 = child_ctx[0].getNode("fixed", "stats", child_ctx[3]);
    child_ctx[4] = constants_0;
    const constants_1 = child_ctx[0].getNode("derived", "modifiers", child_ctx[3]);
    child_ctx[5] = constants_1;
    return child_ctx;
  }
  function create_each_block$1(ctx) {
    let staticvalue;
    let current;
    staticvalue = new StatValue({
      props: {
        name: ctx[3],
        statNode: ctx[4],
        modNode: ctx[5],
        editmode: ctx[1]
      },
      $$inline: true
    });
    const block = {
      c: function create() {
        create_component(staticvalue.$$.fragment);
      },
      m: function mount(target, anchor) {
        mount_component(staticvalue, target, anchor);
        current = true;
      },
      p: function update2(ctx2, dirty) {
        const staticvalue_changes = {};
        if (dirty & 1)
          staticvalue_changes.statNode = ctx2[4];
        if (dirty & 1)
          staticvalue_changes.modNode = ctx2[5];
        if (dirty & 2)
          staticvalue_changes.editmode = ctx2[1];
        staticvalue.$set(staticvalue_changes);
      },
      i: function intro(local) {
        if (current)
          return;
        transition_in(staticvalue.$$.fragment, local);
        current = true;
      },
      o: function outro(local) {
        transition_out(staticvalue.$$.fragment, local);
        current = false;
      },
      d: function destroy(detaching) {
        destroy_component(staticvalue, detaching);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_each_block$1.name,
      type: "each",
      source: "(8:1) {#each stats as key}",
      ctx
    });
    return block;
  }
  function create_fragment$6(ctx) {
    let div;
    let current;
    let each_value = ctx[2];
    validate_each_argument(each_value);
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    const block = {
      c: function create() {
        div = element("div");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        this.c = noop;
        attr_dev(div, "class", "StatsRow");
        add_location(div, file$6, 6, 0, 207);
      },
      l: function claim(nodes) {
        throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(div, null);
          }
        }
        current = true;
      },
      p: function update2(ctx2, [dirty]) {
        if (dirty & 7) {
          each_value = ctx2[2];
          validate_each_argument(each_value);
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
      i: function intro(local) {
        if (current)
          return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o: function outro(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        destroy_each(each_blocks, detaching);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$6.name,
      type: "component",
      source: "",
      ctx
    });
    return block;
  }
  function instance$6($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    validate_slots("undefined", slots, []);
    let { sys } = $$props;
    let { edit = false } = $$props;
    let stats = sys.getNodeNames("fixed", "stats");
    $$self.$$.on_mount.push(function() {
      if (sys === void 0 && !("sys" in $$props || $$self.$$.bound[$$self.$$.props["sys"]])) {
        console.warn("<undefined> was created without expected prop 'sys'");
      }
    });
    const writable_props = ["sys", "edit"];
    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
        console.warn(`<undefined> was created with unknown prop '${key}'`);
    });
    $$self.$$set = ($$props2) => {
      if ("sys" in $$props2)
        $$invalidate(0, sys = $$props2.sys);
      if ("edit" in $$props2)
        $$invalidate(1, edit = $$props2.edit);
    };
    $$self.$capture_state = () => ({ system, StaticValue: StatValue, sys, edit, stats });
    $$self.$inject_state = ($$props2) => {
      if ("sys" in $$props2)
        $$invalidate(0, sys = $$props2.sys);
      if ("edit" in $$props2)
        $$invalidate(1, edit = $$props2.edit);
      if ("stats" in $$props2)
        $$invalidate(2, stats = $$props2.stats);
    };
    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }
    return [sys, edit, stats];
  }
  class Stats extends SvelteElement {
    constructor(options) {
      super();
      init(
        this,
        {
          target: this.shadowRoot,
          props: attribute_to_object(this.attributes),
          customElement: true
        },
        instance$6,
        create_fragment$6,
        safe_not_equal,
        { sys: 0, edit: 1 },
        null
      );
      if (options) {
        if (options.target) {
          insert_dev(options.target, this, options.anchor);
        }
        if (options.props) {
          this.$set(options.props);
          flush();
        }
      }
    }
    static get observedAttributes() {
      return ["sys", "edit"];
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
  const file$5 = "src/Structure/ItemManouver.svelte";
  function create_if_block_1$3(ctx) {
    let div;
    let mounted;
    let dispose;
    const block = {
      c: function create() {
        div = element("div");
        attr_dev(div, "class", "ItemManouverOption Up");
        attr_dev(div, "role", "none");
        add_location(div, file$5, 15, 12, 344);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        if (!mounted) {
          dispose = [
            listen_dev(div, "keyup", ctx[6], false, false, false, false),
            listen_dev(div, "click", ctx[2], false, false, false, false)
          ];
          mounted = true;
        }
      },
      p: noop,
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        mounted = false;
        run_all(dispose);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_1$3.name,
      type: "if",
      source: "(16:0) {#if hasUp }",
      ctx
    });
    return block;
  }
  function create_if_block$5(ctx) {
    let div;
    let mounted;
    let dispose;
    const block = {
      c: function create() {
        div = element("div");
        attr_dev(div, "class", "ItemManouverOption Down");
        attr_dev(div, "role", "none");
        add_location(div, file$5, 16, 13, 446);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        if (!mounted) {
          dispose = [
            listen_dev(div, "keyup", ctx[5], false, false, false, false),
            listen_dev(div, "click", ctx[3], false, false, false, false)
          ];
          mounted = true;
        }
      },
      p: noop,
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        mounted = false;
        run_all(dispose);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block$5.name,
      type: "if",
      source: "(17:0) {#if hasDown}",
      ctx
    });
    return block;
  }
  function create_fragment$5(ctx) {
    let t;
    let if_block1_anchor;
    let if_block0 = ctx[0] && create_if_block_1$3(ctx);
    let if_block1 = ctx[1] && create_if_block$5(ctx);
    const block = {
      c: function create() {
        if (if_block0)
          if_block0.c();
        t = space();
        if (if_block1)
          if_block1.c();
        if_block1_anchor = empty();
        this.c = noop;
      },
      l: function claim(nodes) {
        throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
      },
      m: function mount(target, anchor) {
        if (if_block0)
          if_block0.m(target, anchor);
        insert_dev(target, t, anchor);
        if (if_block1)
          if_block1.m(target, anchor);
        insert_dev(target, if_block1_anchor, anchor);
      },
      p: function update2(ctx2, [dirty]) {
        if (ctx2[0]) {
          if (if_block0) {
            if_block0.p(ctx2, dirty);
          } else {
            if_block0 = create_if_block_1$3(ctx2);
            if_block0.c();
            if_block0.m(t.parentNode, t);
          }
        } else if (if_block0) {
          if_block0.d(1);
          if_block0 = null;
        }
        if (ctx2[1]) {
          if (if_block1) {
            if_block1.p(ctx2, dirty);
          } else {
            if_block1 = create_if_block$5(ctx2);
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
      d: function destroy(detaching) {
        if (if_block0)
          if_block0.d(detaching);
        if (detaching)
          detach_dev(t);
        if (if_block1)
          if_block1.d(detaching);
        if (detaching)
          detach_dev(if_block1_anchor);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$5.name,
      type: "component",
      source: "",
      ctx
    });
    return block;
  }
  function instance$5($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    validate_slots("undefined", slots, []);
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
    $$self.$$.on_mount.push(function() {
      if (data === void 0 && !("data" in $$props || $$self.$$.bound[$$self.$$.props["data"]])) {
        console.warn("<undefined> was created without expected prop 'data'");
      }
      if (hasUp === void 0 && !("hasUp" in $$props || $$self.$$.bound[$$self.$$.props["hasUp"]])) {
        console.warn("<undefined> was created without expected prop 'hasUp'");
      }
      if (hasDown === void 0 && !("hasDown" in $$props || $$self.$$.bound[$$self.$$.props["hasDown"]])) {
        console.warn("<undefined> was created without expected prop 'hasDown'");
      }
    });
    const writable_props = ["data", "hasUp", "hasDown"];
    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
        console.warn(`<undefined> was created with unknown prop '${key}'`);
    });
    function keyup_handler_1(event) {
      bubble.call(this, $$self, event);
    }
    function keyup_handler(event) {
      bubble.call(this, $$self, event);
    }
    $$self.$$set = ($$props2) => {
      if ("data" in $$props2)
        $$invalidate(4, data = $$props2.data);
      if ("hasUp" in $$props2)
        $$invalidate(0, hasUp = $$props2.hasUp);
      if ("hasDown" in $$props2)
        $$invalidate(1, hasDown = $$props2.hasDown);
    };
    $$self.$capture_state = () => ({
      slide,
      createEventDispatcher,
      dispatch: dispatch2,
      data,
      hasUp,
      hasDown,
      moveUp,
      moveDown
    });
    $$self.$inject_state = ($$props2) => {
      if ("dispatch" in $$props2)
        dispatch2 = $$props2.dispatch;
      if ("data" in $$props2)
        $$invalidate(4, data = $$props2.data);
      if ("hasUp" in $$props2)
        $$invalidate(0, hasUp = $$props2.hasUp);
      if ("hasDown" in $$props2)
        $$invalidate(1, hasDown = $$props2.hasDown);
    };
    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }
    return [hasUp, hasDown, moveUp, moveDown, data, keyup_handler_1, keyup_handler];
  }
  class ItemManouver extends SvelteElement {
    constructor(options) {
      super();
      init(
        this,
        {
          target: this.shadowRoot,
          props: attribute_to_object(this.attributes),
          customElement: true
        },
        instance$5,
        create_fragment$5,
        safe_not_equal,
        { data: 4, hasUp: 0, hasDown: 1 },
        null
      );
      if (options) {
        if (options.target) {
          insert_dev(options.target, this, options.anchor);
        }
        if (options.props) {
          this.$set(options.props);
          flush();
        }
      }
    }
    static get observedAttributes() {
      return ["data", "hasUp", "hasDown"];
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
  const { console: console_1$1 } = globals;
  const file$4 = "src/Structure/ItemDestributor.svelte";
  function create_if_block_5$1(ctx) {
    let itemoptions;
    let updating_data;
    let current;
    function itemoptions_data_binding(value) {
      ctx[5](value);
    }
    let itemoptions_props = { editMode: true };
    if (ctx[0] !== void 0) {
      itemoptions_props.data = ctx[0];
    }
    itemoptions = new ItemOptions({ props: itemoptions_props, $$inline: true });
    binding_callbacks.push(() => bind(itemoptions, "data", itemoptions_data_binding));
    itemoptions.$on("optionSelected", ctx[4]);
    const block = {
      c: function create() {
        create_component(itemoptions.$$.fragment);
      },
      m: function mount(target, anchor) {
        mount_component(itemoptions, target, anchor);
        current = true;
      },
      p: function update2(ctx2, dirty) {
        const itemoptions_changes = {};
        if (!updating_data && dirty & 1) {
          updating_data = true;
          itemoptions_changes.data = ctx2[0];
          add_flush_callback(() => updating_data = false);
        }
        itemoptions.$set(itemoptions_changes);
      },
      i: function intro(local) {
        if (current)
          return;
        transition_in(itemoptions.$$.fragment, local);
        current = true;
      },
      o: function outro(local) {
        transition_out(itemoptions.$$.fragment, local);
        current = false;
      },
      d: function destroy(detaching) {
        destroy_component(itemoptions, detaching);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_5$1.name,
      type: "if",
      source: "(25:2) {#if layoutMode}",
      ctx
    });
    return block;
  }
  function create_if_block_4$1(ctx) {
    let div;
    let stats;
    let div_transition;
    let current;
    stats = new Stats({
      props: {
        edit: ctx[1],
        sys: ctx[2]
      },
      $$inline: true
    });
    stats.$on("optionSelected", ctx[4]);
    const block = {
      c: function create() {
        div = element("div");
        create_component(stats.$$.fragment);
        add_location(div, file$4, 71, 3, 1961);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        mount_component(stats, div, null);
        current = true;
      },
      p: function update2(ctx2, dirty) {
        const stats_changes = {};
        if (dirty & 2)
          stats_changes.edit = ctx2[1];
        if (dirty & 4)
          stats_changes.sys = ctx2[2];
        stats.$set(stats_changes);
      },
      i: function intro(local) {
        if (current)
          return;
        transition_in(stats.$$.fragment, local);
        add_render_callback(() => {
          if (!current)
            return;
          if (!div_transition)
            div_transition = create_bidirectional_transition(div, slide, {}, true);
          div_transition.run(1);
        });
        current = true;
      },
      o: function outro(local) {
        transition_out(stats.$$.fragment, local);
        if (!div_transition)
          div_transition = create_bidirectional_transition(div, slide, {}, false);
        div_transition.run(0);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        destroy_component(stats);
        if (detaching && div_transition)
          div_transition.end();
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_4$1.name,
      type: "if",
      source: "(70:47) ",
      ctx
    });
    return block;
  }
  function create_if_block_3$1(ctx) {
    let div;
    let spellinfo;
    let updating_data;
    let div_transition;
    let current;
    function spellinfo_data_binding(value) {
      ctx[9](value);
    }
    let spellinfo_props = {
      edit: ctx[1],
      sys: ctx[2]
    };
    if (ctx[0] !== void 0) {
      spellinfo_props.data = ctx[0];
    }
    spellinfo = new SpellInfo({ props: spellinfo_props, $$inline: true });
    binding_callbacks.push(() => bind(spellinfo, "data", spellinfo_data_binding));
    spellinfo.$on("optionSelected", ctx[4]);
    const block = {
      c: function create() {
        div = element("div");
        create_component(spellinfo.$$.fragment);
        add_location(div, file$4, 61, 3, 1755);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        mount_component(spellinfo, div, null);
        current = true;
      },
      p: function update2(ctx2, dirty) {
        const spellinfo_changes = {};
        if (dirty & 2)
          spellinfo_changes.edit = ctx2[1];
        if (dirty & 4)
          spellinfo_changes.sys = ctx2[2];
        if (!updating_data && dirty & 1) {
          updating_data = true;
          spellinfo_changes.data = ctx2[0];
          add_flush_callback(() => updating_data = false);
        }
        spellinfo.$set(spellinfo_changes);
      },
      i: function intro(local) {
        if (current)
          return;
        transition_in(spellinfo.$$.fragment, local);
        add_render_callback(() => {
          if (!current)
            return;
          if (!div_transition)
            div_transition = create_bidirectional_transition(div, slide, {}, true);
          div_transition.run(1);
        });
        current = true;
      },
      o: function outro(local) {
        transition_out(spellinfo.$$.fragment, local);
        if (!div_transition)
          div_transition = create_bidirectional_transition(div, slide, {}, false);
        div_transition.run(0);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        destroy_component(spellinfo);
        if (detaching && div_transition)
          div_transition.end();
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_3$1.name,
      type: "if",
      source: "(61:51) ",
      ctx
    });
    return block;
  }
  function create_if_block_2$2(ctx) {
    let div;
    let skillproficiencycollection;
    let updating_data;
    let div_transition;
    let current;
    function skillproficiencycollection_data_binding(value) {
      ctx[8](value);
    }
    let skillproficiencycollection_props = {
      edit: ctx[1],
      sys: ctx[2]
    };
    if (ctx[0] !== void 0) {
      skillproficiencycollection_props.data = ctx[0];
    }
    skillproficiencycollection = new SkillProficiencyCollection({
      props: skillproficiencycollection_props,
      $$inline: true
    });
    binding_callbacks.push(() => bind(skillproficiencycollection, "data", skillproficiencycollection_data_binding));
    skillproficiencycollection.$on("optionSelected", ctx[4]);
    const block = {
      c: function create() {
        div = element("div");
        create_component(skillproficiencycollection.$$.fragment);
        add_location(div, file$4, 52, 3, 1529);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        mount_component(skillproficiencycollection, div, null);
        current = true;
      },
      p: function update2(ctx2, dirty) {
        const skillproficiencycollection_changes = {};
        if (dirty & 2)
          skillproficiencycollection_changes.edit = ctx2[1];
        if (dirty & 4)
          skillproficiencycollection_changes.sys = ctx2[2];
        if (!updating_data && dirty & 1) {
          updating_data = true;
          skillproficiencycollection_changes.data = ctx2[0];
          add_flush_callback(() => updating_data = false);
        }
        skillproficiencycollection.$set(skillproficiencycollection_changes);
      },
      i: function intro(local) {
        if (current)
          return;
        transition_in(skillproficiencycollection.$$.fragment, local);
        add_render_callback(() => {
          if (!current)
            return;
          if (!div_transition)
            div_transition = create_bidirectional_transition(div, slide, {}, true);
          div_transition.run(1);
        });
        current = true;
      },
      o: function outro(local) {
        transition_out(skillproficiencycollection.$$.fragment, local);
        if (!div_transition)
          div_transition = create_bidirectional_transition(div, slide, {}, false);
        div_transition.run(0);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        destroy_component(skillproficiencycollection);
        if (detaching && div_transition)
          div_transition.end();
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_2$2.name,
      type: "if",
      source: "(52:59) ",
      ctx
    });
    return block;
  }
  function create_if_block_1$2(ctx) {
    let div;
    let proficiencybonus;
    let updating_data;
    let div_transition;
    let current;
    function proficiencybonus_data_binding(value) {
      ctx[7](value);
    }
    let proficiencybonus_props = {
      sys: ctx[2],
      editMode: ctx[1]
    };
    if (ctx[0] !== void 0) {
      proficiencybonus_props.data = ctx[0];
    }
    proficiencybonus = new ProficiencyBonus({
      props: proficiencybonus_props,
      $$inline: true
    });
    binding_callbacks.push(() => bind(proficiencybonus, "data", proficiencybonus_data_binding));
    proficiencybonus.$on("optionSelected", ctx[4]);
    const block = {
      c: function create() {
        div = element("div");
        create_component(proficiencybonus.$$.fragment);
        add_location(div, file$4, 43, 3, 1301);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        mount_component(proficiencybonus, div, null);
        current = true;
      },
      p: function update2(ctx2, dirty) {
        const proficiencybonus_changes = {};
        if (dirty & 4)
          proficiencybonus_changes.sys = ctx2[2];
        if (dirty & 2)
          proficiencybonus_changes.editMode = ctx2[1];
        if (!updating_data && dirty & 1) {
          updating_data = true;
          proficiencybonus_changes.data = ctx2[0];
          add_flush_callback(() => updating_data = false);
        }
        proficiencybonus.$set(proficiencybonus_changes);
      },
      i: function intro(local) {
        if (current)
          return;
        transition_in(proficiencybonus.$$.fragment, local);
        add_render_callback(() => {
          if (!current)
            return;
          if (!div_transition)
            div_transition = create_bidirectional_transition(div, slide, {}, true);
          div_transition.run(1);
        });
        current = true;
      },
      o: function outro(local) {
        transition_out(proficiencybonus.$$.fragment, local);
        if (!div_transition)
          div_transition = create_bidirectional_transition(div, slide, {}, false);
        div_transition.run(0);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        destroy_component(proficiencybonus);
        if (detaching && div_transition)
          div_transition.end();
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_1$2.name,
      type: "if",
      source: "(43:57) ",
      ctx
    });
    return block;
  }
  function create_if_block$4(ctx) {
    let div;
    let hitpoints;
    let updating_data;
    let div_transition;
    let current;
    function hitpoints_data_binding(value) {
      ctx[6](value);
    }
    let hitpoints_props = {
      sys: ctx[2],
      editMode: ctx[1],
      playMode: false
    };
    if (ctx[0] !== void 0) {
      hitpoints_props.data = ctx[0];
    }
    hitpoints = new HitPoints({ props: hitpoints_props, $$inline: true });
    binding_callbacks.push(() => bind(hitpoints, "data", hitpoints_data_binding));
    hitpoints.$on("optionSelected", ctx[4]);
    const block = {
      c: function create() {
        div = element("div");
        create_component(hitpoints.$$.fragment);
        add_location(div, file$4, 33, 3, 1061);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        mount_component(hitpoints, div, null);
        current = true;
      },
      p: function update2(ctx2, dirty) {
        const hitpoints_changes = {};
        if (dirty & 4)
          hitpoints_changes.sys = ctx2[2];
        if (dirty & 2)
          hitpoints_changes.editMode = ctx2[1];
        if (!updating_data && dirty & 1) {
          updating_data = true;
          hitpoints_changes.data = ctx2[0];
          add_flush_callback(() => updating_data = false);
        }
        hitpoints.$set(hitpoints_changes);
      },
      i: function intro(local) {
        if (current)
          return;
        transition_in(hitpoints.$$.fragment, local);
        add_render_callback(() => {
          if (!current)
            return;
          if (!div_transition)
            div_transition = create_bidirectional_transition(div, slide, {}, true);
          div_transition.run(1);
        });
        current = true;
      },
      o: function outro(local) {
        transition_out(hitpoints.$$.fragment, local);
        if (!div_transition)
          div_transition = create_bidirectional_transition(div, slide, {}, false);
        div_transition.run(0);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        destroy_component(hitpoints);
        if (detaching && div_transition)
          div_transition.end();
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block$4.name,
      type: "if",
      source: "(33:2) {#if data.type == viewNameIndex.HitPoints  }",
      ctx
    });
    return block;
  }
  function create_fragment$4(ctx) {
    let div;
    let t;
    let current_block_type_index;
    let if_block1;
    let current;
    let if_block0 = ctx[3] && create_if_block_5$1(ctx);
    const if_block_creators = [
      create_if_block$4,
      create_if_block_1$2,
      create_if_block_2$2,
      create_if_block_3$1,
      create_if_block_4$1
    ];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (ctx2[0].type == viewNameIndex.HitPoints)
        return 0;
      if (ctx2[0].type == viewNameIndex.ProficiencyBonus)
        return 1;
      if (ctx2[0].type == viewNameIndex.SkillProficiencies)
        return 2;
      if (ctx2[0].type == viewNameIndex.SpellInfo)
        return 3;
      if (ctx2[0].type == viewNameIndex.Stats)
        return 4;
      return -1;
    }
    if (~(current_block_type_index = select_block_type(ctx))) {
      if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    }
    const block = {
      c: function create() {
        div = element("div");
        if (if_block0)
          if_block0.c();
        t = space();
        if (if_block1)
          if_block1.c();
        this.c = noop;
        attr_dev(div, "data-name", "ItemDestributor");
        attr_dev(div, "class", "itemDestributer");
        add_location(div, file$4, 22, 0, 820);
      },
      l: function claim(nodes) {
        throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        if (if_block0)
          if_block0.m(div, null);
        append_dev(div, t);
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].m(div, null);
        }
        current = true;
      },
      p: function update2(ctx2, [dirty]) {
        if (ctx2[3]) {
          if (if_block0) {
            if_block0.p(ctx2, dirty);
            if (dirty & 8) {
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
      i: function intro(local) {
        if (current)
          return;
        transition_in(if_block0);
        transition_in(if_block1);
        current = true;
      },
      o: function outro(local) {
        transition_out(if_block0);
        transition_out(if_block1);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        if (if_block0)
          if_block0.d();
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].d();
        }
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$4.name,
      type: "component",
      source: "",
      ctx
    });
    return block;
  }
  function instance$4($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    validate_slots("undefined", slots, []);
    let { data } = $$props;
    let { editMode } = $$props;
    let { sys } = $$props;
    let { layoutMode = false } = $$props;
    let redrawIndex = 0;
    function updateData(v) {
      console.log(data);
      $$invalidate(0, data);
      redrawIndex++;
    }
    $$self.$$.on_mount.push(function() {
      if (data === void 0 && !("data" in $$props || $$self.$$.bound[$$self.$$.props["data"]])) {
        console_1$1.warn("<undefined> was created without expected prop 'data'");
      }
      if (editMode === void 0 && !("editMode" in $$props || $$self.$$.bound[$$self.$$.props["editMode"]])) {
        console_1$1.warn("<undefined> was created without expected prop 'editMode'");
      }
      if (sys === void 0 && !("sys" in $$props || $$self.$$.bound[$$self.$$.props["sys"]])) {
        console_1$1.warn("<undefined> was created without expected prop 'sys'");
      }
    });
    const writable_props = ["data", "editMode", "sys", "layoutMode"];
    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
        console_1$1.warn(`<undefined> was created with unknown prop '${key}'`);
    });
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
      if ("data" in $$props2)
        $$invalidate(0, data = $$props2.data);
      if ("editMode" in $$props2)
        $$invalidate(1, editMode = $$props2.editMode);
      if ("sys" in $$props2)
        $$invalidate(2, sys = $$props2.sys);
      if ("layoutMode" in $$props2)
        $$invalidate(3, layoutMode = $$props2.layoutMode);
    };
    $$self.$capture_state = () => ({
      fly,
      slide,
      HitPoints,
      ProficiencyBonus,
      SkillProficiencyCollection,
      SpellInfo,
      Stats,
      system,
      CNode,
      ItemOptions,
      viewNameIndex,
      ItemManouver,
      data,
      editMode,
      sys,
      layoutMode,
      redrawIndex,
      updateData
    });
    $$self.$inject_state = ($$props2) => {
      if ("data" in $$props2)
        $$invalidate(0, data = $$props2.data);
      if ("editMode" in $$props2)
        $$invalidate(1, editMode = $$props2.editMode);
      if ("sys" in $$props2)
        $$invalidate(2, sys = $$props2.sys);
      if ("layoutMode" in $$props2)
        $$invalidate(3, layoutMode = $$props2.layoutMode);
      if ("redrawIndex" in $$props2)
        redrawIndex = $$props2.redrawIndex;
    };
    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }
    return [
      data,
      editMode,
      sys,
      layoutMode,
      updateData,
      itemoptions_data_binding,
      hitpoints_data_binding,
      proficiencybonus_data_binding,
      skillproficiencycollection_data_binding,
      spellinfo_data_binding
    ];
  }
  class ItemDestributor extends SvelteElement {
    constructor(options) {
      super();
      init(
        this,
        {
          target: this.shadowRoot,
          props: attribute_to_object(this.attributes),
          customElement: true
        },
        instance$4,
        create_fragment$4,
        safe_not_equal,
        {
          data: 0,
          editMode: 1,
          sys: 2,
          layoutMode: 3
        },
        null
      );
      if (options) {
        if (options.target) {
          insert_dev(options.target, this, options.anchor);
        }
        if (options.props) {
          this.$set(options.props);
          flush();
        }
      }
    }
    static get observedAttributes() {
      return ["data", "editMode", "sys", "layoutMode"];
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
    get layoutMode() {
      return this.$$.ctx[3];
    }
    set layoutMode(layoutMode) {
      this.$$set({ layoutMode });
      flush();
    }
  }
  function customFlip(node, fromTo, params) {
    if (node.style.animation)
      node.style = null;
    return flip(node, fromTo, params != null ? params : { duration: 500 });
  }
  const file$3 = "src/Structure/RowColumnOptions.svelte";
  function create_if_block$3(ctx) {
    let t;
    let if_block1_anchor;
    let if_block0 = ctx[3] && create_if_block_2$1(ctx);
    let if_block1 = ctx[2] && create_if_block_1$1(ctx);
    const block = {
      c: function create() {
        if (if_block0)
          if_block0.c();
        t = space();
        if (if_block1)
          if_block1.c();
        if_block1_anchor = empty();
      },
      m: function mount(target, anchor) {
        if (if_block0)
          if_block0.m(target, anchor);
        insert_dev(target, t, anchor);
        if (if_block1)
          if_block1.m(target, anchor);
        insert_dev(target, if_block1_anchor, anchor);
      },
      p: function update2(ctx2, dirty) {
        if (ctx2[3]) {
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
        if (ctx2[2]) {
          if (if_block1) {
            if_block1.p(ctx2, dirty);
          } else {
            if_block1 = create_if_block_1$1(ctx2);
            if_block1.c();
            if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
          }
        } else if (if_block1) {
          if_block1.d(1);
          if_block1 = null;
        }
      },
      d: function destroy(detaching) {
        if (if_block0)
          if_block0.d(detaching);
        if (detaching)
          detach_dev(t);
        if (if_block1)
          if_block1.d(detaching);
        if (detaching)
          detach_dev(if_block1_anchor);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block$3.name,
      type: "if",
      source: "(14:0) {#if active}",
      ctx
    });
    return block;
  }
  function create_if_block_2$1(ctx) {
    let div;
    let span;
    let t1;
    let mounted;
    let dispose;
    const block = {
      c: function create() {
        div = element("div");
        span = element("span");
        span.textContent = "+";
        t1 = text(ctx[1]);
        add_location(span, file$3, 21, 13, 626);
        attr_dev(div, "class", "itemOption add");
        attr_dev(div, "role", "none");
        add_location(div, file$3, 15, 3, 461);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        append_dev(div, span);
        append_dev(div, t1);
        if (!mounted) {
          dispose = [
            listen_dev(div, "keyup", ctx[9], false, false, false, false),
            listen_dev(div, "click", ctx[10], false, false, false, false)
          ];
          mounted = true;
        }
      },
      p: function update2(ctx2, dirty) {
        if (dirty & 2)
          set_data_dev(t1, ctx2[1]);
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        mounted = false;
        run_all(dispose);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_2$1.name,
      type: "if",
      source: "(15:8) {#if onAdd}",
      ctx
    });
    return block;
  }
  function create_if_block_1$1(ctx) {
    let div;
    let mounted;
    let dispose;
    const block = {
      c: function create() {
        div = element("div");
        div.textContent = "X";
        attr_dev(div, "class", "itemOption rem");
        attr_dev(div, "role", "none");
        add_location(div, file$3, 25, 3, 703);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        if (!mounted) {
          dispose = [
            listen_dev(div, "keyup", ctx[8], false, false, false, false),
            listen_dev(div, "click", ctx[11], false, false, false, false)
          ];
          mounted = true;
        }
      },
      p: noop,
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        mounted = false;
        run_all(dispose);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_1$1.name,
      type: "if",
      source: "(25:8) {#if onRemove}",
      ctx
    });
    return block;
  }
  function create_fragment$3(ctx) {
    let if_block_anchor;
    let if_block = ctx[0] && create_if_block$3(ctx);
    const block = {
      c: function create() {
        if (if_block)
          if_block.c();
        if_block_anchor = empty();
        this.c = noop;
      },
      l: function claim(nodes) {
        throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
      },
      m: function mount(target, anchor) {
        if (if_block)
          if_block.m(target, anchor);
        insert_dev(target, if_block_anchor, anchor);
      },
      p: function update2(ctx2, [dirty]) {
        if (ctx2[0]) {
          if (if_block) {
            if_block.p(ctx2, dirty);
          } else {
            if_block = create_if_block$3(ctx2);
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
      d: function destroy(detaching) {
        if (if_block)
          if_block.d(detaching);
        if (detaching)
          detach_dev(if_block_anchor);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$3.name,
      type: "component",
      source: "",
      ctx
    });
    return block;
  }
  function instance$3($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    validate_slots("undefined", slots, []);
    let { active: active2 } = $$props;
    let { addText = "Add Item" } = $$props;
    let { remText = "Remove This Item" } = $$props;
    let { offset = 0 } = $$props;
    let { side = "left" } = $$props;
    let { verti = "bottom" } = $$props;
    let { onRemove = null } = $$props;
    let { onAdd = null } = $$props;
    let cssStyle = side + ":" + offset + ";" + verti + ":" + offset + ";";
    $$self.$$.on_mount.push(function() {
      if (active2 === void 0 && !("active" in $$props || $$self.$$.bound[$$self.$$.props["active"]])) {
        console.warn("<undefined> was created without expected prop 'active'");
      }
    });
    const writable_props = ["active", "addText", "remText", "offset", "side", "verti", "onRemove", "onAdd"];
    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
        console.warn(`<undefined> was created with unknown prop '${key}'`);
    });
    function keyup_handler_1(event) {
      bubble.call(this, $$self, event);
    }
    function keyup_handler(event) {
      bubble.call(this, $$self, event);
    }
    const click_handler = () => onAdd();
    const click_handler_1 = () => onRemove();
    $$self.$$set = ($$props2) => {
      if ("active" in $$props2)
        $$invalidate(0, active2 = $$props2.active);
      if ("addText" in $$props2)
        $$invalidate(1, addText = $$props2.addText);
      if ("remText" in $$props2)
        $$invalidate(4, remText = $$props2.remText);
      if ("offset" in $$props2)
        $$invalidate(5, offset = $$props2.offset);
      if ("side" in $$props2)
        $$invalidate(6, side = $$props2.side);
      if ("verti" in $$props2)
        $$invalidate(7, verti = $$props2.verti);
      if ("onRemove" in $$props2)
        $$invalidate(2, onRemove = $$props2.onRemove);
      if ("onAdd" in $$props2)
        $$invalidate(3, onAdd = $$props2.onAdd);
    };
    $$self.$capture_state = () => ({
      createEventDispatcher,
      onMount,
      slide,
      active: active2,
      addText,
      remText,
      offset,
      side,
      verti,
      onRemove,
      onAdd,
      cssStyle
    });
    $$self.$inject_state = ($$props2) => {
      if ("active" in $$props2)
        $$invalidate(0, active2 = $$props2.active);
      if ("addText" in $$props2)
        $$invalidate(1, addText = $$props2.addText);
      if ("remText" in $$props2)
        $$invalidate(4, remText = $$props2.remText);
      if ("offset" in $$props2)
        $$invalidate(5, offset = $$props2.offset);
      if ("side" in $$props2)
        $$invalidate(6, side = $$props2.side);
      if ("verti" in $$props2)
        $$invalidate(7, verti = $$props2.verti);
      if ("onRemove" in $$props2)
        $$invalidate(2, onRemove = $$props2.onRemove);
      if ("onAdd" in $$props2)
        $$invalidate(3, onAdd = $$props2.onAdd);
      if ("cssStyle" in $$props2)
        cssStyle = $$props2.cssStyle;
    };
    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }
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
  class RowColumnOptions extends SvelteElement {
    constructor(options) {
      super();
      init(
        this,
        {
          target: this.shadowRoot,
          props: attribute_to_object(this.attributes),
          customElement: true
        },
        instance$3,
        create_fragment$3,
        safe_not_equal,
        {
          active: 0,
          addText: 1,
          remText: 4,
          offset: 5,
          side: 6,
          verti: 7,
          onRemove: 2,
          onAdd: 3
        },
        null
      );
      if (options) {
        if (options.target) {
          insert_dev(options.target, this, options.anchor);
        }
        if (options.props) {
          this.$set(options.props);
          flush();
        }
      }
    }
    static get observedAttributes() {
      return [
        "active",
        "addText",
        "remText",
        "offset",
        "side",
        "verti",
        "onRemove",
        "onAdd"
      ];
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
  const file$2 = "src/Structure/infoComponents/LoadingSpinner.svelte";
  function create_if_block$2(ctx) {
    let div1;
    let div0;
    let div1_transition;
    let current;
    const block = {
      c: function create() {
        div1 = element("div");
        div0 = element("div");
        div0.textContent = "Editing.. close editing to save..";
        add_location(div0, file$2, 6, 3, 208);
        attr_dev(div1, "class", "spinner");
        attr_dev(div1, "data-state", "ongoing");
        add_location(div1, file$2, 5, 2, 136);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div1, anchor);
        append_dev(div1, div0);
        current = true;
      },
      i: function intro(local) {
        if (current)
          return;
        add_render_callback(() => {
          if (!current)
            return;
          if (!div1_transition)
            div1_transition = create_bidirectional_transition(div1, fly, { x: 100 }, true);
          div1_transition.run(1);
        });
        current = true;
      },
      o: function outro(local) {
        if (!div1_transition)
          div1_transition = create_bidirectional_transition(div1, fly, { x: 100 }, false);
        div1_transition.run(0);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div1);
        if (detaching && div1_transition)
          div1_transition.end();
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block$2.name,
      type: "if",
      source: "(5:1) {#if $active}",
      ctx
    });
    return block;
  }
  function create_fragment$2(ctx) {
    let div;
    let current;
    let if_block = ctx[1] && create_if_block$2(ctx);
    const block = {
      c: function create() {
        div = element("div");
        if (if_block)
          if_block.c();
        this.c = noop;
        attr_dev(div, "class", "LoadingSpinner");
        add_location(div, file$2, 3, 0, 88);
      },
      l: function claim(nodes) {
        throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        if (if_block)
          if_block.m(div, null);
        current = true;
      },
      p: function update2(ctx2, [dirty]) {
        if (ctx2[1]) {
          if (if_block) {
            if (dirty & 2) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block$2(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(div, null);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
      },
      i: function intro(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o: function outro(local) {
        transition_out(if_block);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        if (if_block)
          if_block.d();
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$2.name,
      type: "component",
      source: "",
      ctx
    });
    return block;
  }
  function instance$2($$self, $$props, $$invalidate) {
    let $active, $$unsubscribe_active = noop, $$subscribe_active = () => ($$unsubscribe_active(), $$unsubscribe_active = subscribe(active2, ($$value) => $$invalidate(1, $active = $$value)), active2);
    $$self.$$.on_destroy.push(() => $$unsubscribe_active());
    let { $$slots: slots = {}, $$scope } = $$props;
    validate_slots("undefined", slots, []);
    let { active: active2 } = $$props;
    validate_store(active2, "active");
    $$subscribe_active();
    $$self.$$.on_mount.push(function() {
      if (active2 === void 0 && !("active" in $$props || $$self.$$.bound[$$self.$$.props["active"]])) {
        console.warn("<undefined> was created without expected prop 'active'");
      }
    });
    const writable_props = ["active"];
    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
        console.warn(`<undefined> was created with unknown prop '${key}'`);
    });
    $$self.$$set = ($$props2) => {
      if ("active" in $$props2)
        $$subscribe_active($$invalidate(0, active2 = $$props2.active));
    };
    $$self.$capture_state = () => ({ fly, active: active2, $active });
    $$self.$inject_state = ($$props2) => {
      if ("active" in $$props2)
        $$subscribe_active($$invalidate(0, active2 = $$props2.active));
    };
    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }
    return [active2, $active];
  }
  class LoadingSpinner extends SvelteElement {
    constructor(options) {
      super();
      init(
        this,
        {
          target: this.shadowRoot,
          props: attribute_to_object(this.attributes),
          customElement: true
        },
        instance$2,
        create_fragment$2,
        safe_not_equal,
        { active: 0 },
        null
      );
      if (options) {
        if (options.target) {
          insert_dev(options.target, this, options.anchor);
        }
        if (options.props) {
          this.$set(options.props);
          flush();
        }
      }
    }
    static get observedAttributes() {
      return ["active"];
    }
    get active() {
      return this.$$.ctx[0];
    }
    set active(active2) {
      this.$$set({ active: active2 });
      flush();
    }
  }
  const toolTip = "";
  const file$1 = "src/importedComponents/tooltip/toolTip.svelte";
  function create_if_block$1(ctx) {
    let div;
    let div_transition;
    let current;
    const block = {
      c: function create() {
        div = element("div");
        attr_dev(div, "class", "tooltipInnerBox");
        attr_dev(div, "data-type", ctx[3]);
        add_location(div, file$1, 15, 2, 340);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        div.innerHTML = ctx[0];
        current = true;
      },
      p: function update2(new_ctx, dirty) {
        ctx = new_ctx;
        if (!current || dirty & 1)
          div.innerHTML = ctx[0];
        if (!current || dirty & 8) {
          attr_dev(div, "data-type", ctx[3]);
        }
      },
      i: function intro(local) {
        if (current)
          return;
        add_render_callback(() => {
          if (!current)
            return;
          if (!div_transition)
            div_transition = create_bidirectional_transition(div, fly, { x: ctx[1], y: ctx[2] }, true);
          div_transition.run(1);
        });
        current = true;
      },
      o: function outro(local) {
        if (!div_transition)
          div_transition = create_bidirectional_transition(div, fly, { x: ctx[1], y: ctx[2] }, false);
        div_transition.run(0);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        if (detaching && div_transition)
          div_transition.end();
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block$1.name,
      type: "if",
      source: "(15:1) {#if mounted}",
      ctx
    });
    return block;
  }
  function create_fragment$1(ctx) {
    let div;
    let current;
    let if_block = ctx[4] && create_if_block$1(ctx);
    const block = {
      c: function create() {
        div = element("div");
        if (if_block)
          if_block.c();
        this.c = noop;
        add_location(div, file$1, 13, 0, 317);
      },
      l: function claim(nodes) {
        throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        if (if_block)
          if_block.m(div, null);
        current = true;
      },
      p: function update2(ctx2, [dirty]) {
        if (ctx2[4]) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty & 16) {
              transition_in(if_block, 1);
            }
          } else {
            if_block = create_if_block$1(ctx2);
            if_block.c();
            transition_in(if_block, 1);
            if_block.m(div, null);
          }
        } else if (if_block) {
          group_outros();
          transition_out(if_block, 1, 1, () => {
            if_block = null;
          });
          check_outros();
        }
      },
      i: function intro(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o: function outro(local) {
        transition_out(if_block);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        if (if_block)
          if_block.d();
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment$1.name,
      type: "component",
      source: "",
      ctx
    });
    return block;
  }
  function instance$1($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    validate_slots("undefined", slots, []);
    let { text: text2 } = $$props;
    let { animX = 20 } = $$props;
    let { animY = 0 } = $$props;
    let { type } = $$props;
    let mounted = false;
    onMount(() => {
      setTimeout(
        () => {
          $$invalidate(4, mounted = true);
        },
        100
      );
    });
    $$self.$$.on_mount.push(function() {
      if (text2 === void 0 && !("text" in $$props || $$self.$$.bound[$$self.$$.props["text"]])) {
        console.warn("<undefined> was created without expected prop 'text'");
      }
      if (type === void 0 && !("type" in $$props || $$self.$$.bound[$$self.$$.props["type"]])) {
        console.warn("<undefined> was created without expected prop 'type'");
      }
    });
    const writable_props = ["text", "animX", "animY", "type"];
    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
        console.warn(`<undefined> was created with unknown prop '${key}'`);
    });
    $$self.$$set = ($$props2) => {
      if ("text" in $$props2)
        $$invalidate(0, text2 = $$props2.text);
      if ("animX" in $$props2)
        $$invalidate(1, animX = $$props2.animX);
      if ("animY" in $$props2)
        $$invalidate(2, animY = $$props2.animY);
      if ("type" in $$props2)
        $$invalidate(3, type = $$props2.type);
    };
    $$self.$capture_state = () => ({
      onMount,
      fade,
      slide,
      blur,
      fly,
      text: text2,
      animX,
      animY,
      type,
      mounted
    });
    $$self.$inject_state = ($$props2) => {
      if ("text" in $$props2)
        $$invalidate(0, text2 = $$props2.text);
      if ("animX" in $$props2)
        $$invalidate(1, animX = $$props2.animX);
      if ("animY" in $$props2)
        $$invalidate(2, animY = $$props2.animY);
      if ("type" in $$props2)
        $$invalidate(3, type = $$props2.type);
      if ("mounted" in $$props2)
        $$invalidate(4, mounted = $$props2.mounted);
    };
    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }
    return [text2, animX, animY, type, mounted];
  }
  class ToolTip extends SvelteElement {
    constructor(options) {
      super();
      init(
        this,
        {
          target: this.shadowRoot,
          props: attribute_to_object(this.attributes),
          customElement: true
        },
        instance$1,
        create_fragment$1,
        safe_not_equal,
        { text: 0, animX: 1, animY: 2, type: 3 },
        null
      );
      if (options) {
        if (options.target) {
          insert_dev(options.target, this, options.anchor);
        }
        if (options.props) {
          this.$set(options.props);
          flush();
        }
      }
    }
    static get observedAttributes() {
      return ["text", "animX", "animY", "type"];
    }
    get text() {
      return this.$$.ctx[0];
    }
    set text(text2) {
      this.$$set({ text: text2 });
      flush();
    }
    get animX() {
      return this.$$.ctx[1];
    }
    set animX(animX) {
      this.$$set({ animX });
      flush();
    }
    get animY() {
      return this.$$.ctx[2];
    }
    set animY(animY) {
      this.$$set({ animY });
      flush();
    }
    get type() {
      return this.$$.ctx[3];
    }
    set type(type) {
      this.$$set({ type });
      flush();
    }
  }
  function tooltip(node, { text: text2, type = "none", animX = 20, animY = 0, Xoffset = 0, Yoffset = 0 }) {
    let tooltipElement;
    let tooltipComponent;
    function showTooltip() {
      tooltipElement = document.createElement("div");
      tooltipElement.style.position = "absolute";
      tooltipElement.style.zIndex = "2000";
      tooltipComponent = new ToolTip({
        target: tooltipElement,
        props: { text: text2, type, animX, animY }
      });
      document.body.appendChild(tooltipElement);
      const { top, left, width, height } = node.getBoundingClientRect();
      tooltipElement.style.top = `${top + height + window.scrollY + Yoffset}px`;
      tooltipElement.style.left = `${left + width / 2 - tooltipElement.offsetWidth / 2 + window.scrollX + Xoffset}px`;
    }
    function hideTooltip() {
      if (tooltipComponent) {
        tooltipComponent.$destroy();
        tooltipComponent = null;
      }
      if (tooltipElement) {
        tooltipElement.remove();
        tooltipElement = null;
      }
    }
    node.addEventListener("mouseenter", showTooltip);
    node.addEventListener("mouseleave", hideTooltip);
    return {
      update({ text: text3, type: type2 = "none", animX: animX2 = 20, animY: animY2 = 0, Xoffset: Xoffset2 = 0, Yoffset: Yoffset2 = 0 }) {
        if (tooltipComponent) {
          tooltipComponent.$set({ text: text3, type: type2, animX: animX2, animY: animY2 });
        }
      },
      destroy() {
        node.removeEventListener("mouseenter", showTooltip);
        node.removeEventListener("mouseleave", hideTooltip);
        if (tooltipComponent) {
          tooltipComponent.$destroy();
        }
      }
    };
  }
  const { console: console_1 } = globals;
  const file = "src/App.svelte";
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
      return ctx[28](ctx[56]);
    }
    const block = {
      c: function create() {
        div1 = element("div");
        div0 = element("div");
        attr_dev(div0, "class", "remRow");
        attr_dev(div0, "role", "none");
        add_location(div0, file, 553, 7, 16797);
        attr_dev(div1, "class", "manouverHeader");
        add_location(div1, file, 552, 6, 16760);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div1, anchor);
        append_dev(div1, div0);
        if (!mounted) {
          dispose = [
            listen_dev(div0, "keypress", ctx[23], false, false, false, false),
            listen_dev(div0, "click", click_handler_4, false, false, false, false)
          ];
          mounted = true;
        }
      },
      p: function update2(new_ctx, dirty) {
        ctx = new_ctx;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div1);
        mounted = false;
        run_all(dispose);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_5.name,
      type: "if",
      source: "(552:5) {#if $editLayout_01}",
      ctx
    });
    return block;
  }
  function create_if_block_4(ctx) {
    let div1;
    let div0;
    let mounted;
    let dispose;
    function click_handler_5() {
      return ctx[29](ctx[56], ctx[59]);
    }
    const block = {
      c: function create() {
        div1 = element("div");
        div0 = element("div");
        attr_dev(div0, "class", "remColumn");
        attr_dev(div0, "role", "none");
        add_location(div0, file, 608, 9, 18319);
        attr_dev(div1, "class", "manouverHeader");
        add_location(div1, file, 607, 8, 18280);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div1, anchor);
        append_dev(div1, div0);
        if (!mounted) {
          dispose = [
            listen_dev(div0, "keypress", ctx[22], false, false, false, false),
            listen_dev(div0, "click", click_handler_5, false, false, false, false)
          ];
          mounted = true;
        }
      },
      p: function update2(new_ctx, dirty) {
        ctx = new_ctx;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div1);
        mounted = false;
        run_all(dispose);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_4.name,
      type: "if",
      source: "(607:7) {#if $editLayout_02}",
      ctx
    });
    return block;
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
      return ctx[30](ctx[59], ctx[62]);
    }
    function itemmanouver_data_binding(value) {
      ctx[31](value, ctx[62], ctx[63], ctx[64]);
    }
    let itemmanouver_props = {
      hasDown: ctx[64] != ctx[59].data.length - 1,
      hasUp: ctx[64] != 0
    };
    if (ctx[62] !== void 0) {
      itemmanouver_props.data = ctx[62];
    }
    itemmanouver = new ItemManouver({
      props: itemmanouver_props,
      $$inline: true
    });
    binding_callbacks.push(() => bind(itemmanouver, "data", itemmanouver_data_binding));
    itemmanouver.$on("moveUp", ctx[32]);
    itemmanouver.$on("moveDown", ctx[33]);
    const block = {
      c: function create() {
        div1 = element("div");
        div0 = element("div");
        t = space();
        create_component(itemmanouver.$$.fragment);
        attr_dev(div0, "class", "remItem");
        attr_dev(div0, "role", "none");
        add_location(div0, file, 658, 11, 19636);
        attr_dev(div1, "class", "manouverHeader");
        add_location(div1, file, 657, 10, 19595);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div1, anchor);
        append_dev(div1, div0);
        append_dev(div1, t);
        mount_component(itemmanouver, div1, null);
        current = true;
        if (!mounted) {
          dispose = [
            listen_dev(div0, "click", click_handler_6, false, false, false, false),
            listen_dev(div0, "keypress", ctx[21], false, false, false, false)
          ];
          mounted = true;
        }
      },
      p: function update2(new_ctx, dirty) {
        ctx = new_ctx;
        const itemmanouver_changes = {};
        if (dirty[0] & 32)
          itemmanouver_changes.hasDown = ctx[64] != ctx[59].data.length - 1;
        if (dirty[0] & 32)
          itemmanouver_changes.hasUp = ctx[64] != 0;
        if (!updating_data && dirty[0] & 32) {
          updating_data = true;
          itemmanouver_changes.data = ctx[62];
          add_flush_callback(() => updating_data = false);
        }
        itemmanouver.$set(itemmanouver_changes);
      },
      i: function intro(local) {
        if (current)
          return;
        transition_in(itemmanouver.$$.fragment, local);
        current = true;
      },
      o: function outro(local) {
        transition_out(itemmanouver.$$.fragment, local);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div1);
        destroy_component(itemmanouver);
        mounted = false;
        run_all(dispose);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_3.name,
      type: "if",
      source: "(657:9) {#if $editLayout_03}",
      ctx
    });
    return block;
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
    let if_block = ctx[1] && create_if_block_3(ctx);
    itemdestributor = new ItemDestributor({
      props: {
        data: ctx[62],
        editMode: ctx[4],
        layoutMode: ctx[1],
        sys: ctx[0]
      },
      $$inline: true
    });
    itemdestributor.$on("moveUp", ctx[34]);
    itemdestributor.$on("moveDown", ctx[35]);
    function dragstart_handler(...args) {
      return ctx[36](ctx[62], ...args);
    }
    function dragend_handler(...args) {
      return ctx[37](ctx[62], ...args);
    }
    function drop_handler(...args) {
      return ctx[38](ctx[62], ...args);
    }
    function dragleave_handler(...args) {
      return ctx[39](ctx[62], ...args);
    }
    const block = {
      key: key_1,
      first: null,
      c: function create() {
        div = element("div");
        if (if_block)
          if_block.c();
        t = space();
        create_component(itemdestributor.$$.fragment);
        attr_dev(div, "class", "Item");
        attr_dev(div, "data-edit", div_data_edit_value = ctx[4] || ctx[1] || ctx[2]);
        attr_dev(div, "data-itemid", div_data_itemid_value = ctx[62].id);
        attr_dev(div, "data-edit-active", ctx[1]);
        attr_dev(div, "data-dragging", div_data_dragging_value = ctx[15].isBeingDragged(ctx[62].id));
        attr_dev(div, "role", "none");
        attr_dev(div, "draggable", ctx[1]);
        add_location(div, file, 623, 8, 18629);
        this.first = div;
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        if (if_block)
          if_block.m(div, null);
        append_dev(div, t);
        mount_component(itemdestributor, div, null);
        current = true;
        if (!mounted) {
          dispose = [
            listen_dev(div, "dragstart", dragstart_handler, false, false, false, false),
            listen_dev(div, "dragend", dragend_handler, false, false, false, false),
            listen_dev(div, "drop", drop_handler, false, false, false, false),
            listen_dev(div, "dragleave", dragleave_handler, false, false, false, false),
            listen_dev(div, "dragover", dragover_handler, false, false, false, false)
          ];
          mounted = true;
        }
      },
      p: function update2(new_ctx, dirty) {
        ctx = new_ctx;
        if (ctx[1]) {
          if (if_block) {
            if_block.p(ctx, dirty);
            if (dirty[0] & 2) {
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
        if (dirty[0] & 32)
          itemdestributor_changes.data = ctx[62];
        if (dirty[0] & 16)
          itemdestributor_changes.editMode = ctx[4];
        if (dirty[0] & 2)
          itemdestributor_changes.layoutMode = ctx[1];
        if (dirty[0] & 1)
          itemdestributor_changes.sys = ctx[0];
        itemdestributor.$set(itemdestributor_changes);
        if (!current || dirty[0] & 22 && div_data_edit_value !== (div_data_edit_value = ctx[4] || ctx[1] || ctx[2])) {
          attr_dev(div, "data-edit", div_data_edit_value);
        }
        if (!current || dirty[0] & 32 && div_data_itemid_value !== (div_data_itemid_value = ctx[62].id)) {
          attr_dev(div, "data-itemid", div_data_itemid_value);
        }
        if (!current || dirty[0] & 2) {
          attr_dev(div, "data-edit-active", ctx[1]);
        }
        if (!current || dirty[0] & 32 && div_data_dragging_value !== (div_data_dragging_value = ctx[15].isBeingDragged(ctx[62].id))) {
          attr_dev(div, "data-dragging", div_data_dragging_value);
        }
        if (!current || dirty[0] & 2) {
          attr_dev(div, "draggable", ctx[1]);
        }
      },
      r: function measure() {
        rect = div.getBoundingClientRect();
      },
      f: function fix() {
        fix_position(div);
        stop_animation();
        add_transform(div, rect);
      },
      a: function animate() {
        stop_animation();
        stop_animation = create_animation(div, rect, customFlip, { duration: ANIMATION_TIME });
      },
      i: function intro(local) {
        if (current)
          return;
        transition_in(if_block);
        transition_in(itemdestributor.$$.fragment, local);
        add_render_callback(() => {
          if (!current)
            return;
          if (!div_transition)
            div_transition = create_bidirectional_transition(div, fade, { duration: ANIMATION_TIME }, true);
          div_transition.run(1);
        });
        current = true;
      },
      o: function outro(local) {
        transition_out(if_block);
        transition_out(itemdestributor.$$.fragment, local);
        if (!div_transition)
          div_transition = create_bidirectional_transition(div, fade, { duration: ANIMATION_TIME }, false);
        div_transition.run(0);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        if (if_block)
          if_block.d();
        destroy_component(itemdestributor);
        if (detaching && div_transition)
          div_transition.end();
        mounted = false;
        run_all(dispose);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_each_block_2.name,
      type: "each",
      source: "(623:7) {#each column.data as item, k (item.id)}",
      ctx
    });
    return block;
  }
  function create_if_block_2(ctx) {
    let div;
    let span;
    let t1;
    let div_transition;
    let current;
    let mounted;
    let dispose;
    function click_handler_7() {
      return ctx[40](ctx[59]);
    }
    const block = {
      c: function create() {
        div = element("div");
        span = element("span");
        span.textContent = "+";
        t1 = text(" add item");
        add_location(span, file, 703, 9, 20853);
        attr_dev(div, "class", "AddItem");
        attr_dev(div, "data-edit", "true");
        attr_dev(div, "role", "none");
        add_location(div, file, 692, 8, 20571);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        append_dev(div, span);
        append_dev(div, t1);
        current = true;
        if (!mounted) {
          dispose = [
            listen_dev(div, "click", click_handler_7, false, false, false, false),
            listen_dev(div, "keypress", ctx[20], false, false, false, false)
          ];
          mounted = true;
        }
      },
      p: function update2(new_ctx, dirty) {
        ctx = new_ctx;
      },
      i: function intro(local) {
        if (current)
          return;
        add_render_callback(() => {
          if (!current)
            return;
          if (!div_transition)
            div_transition = create_bidirectional_transition(div, fly, { duration: ANIMATION_TIME, y: 100 }, true);
          div_transition.run(1);
        });
        current = true;
      },
      o: function outro(local) {
        if (!div_transition)
          div_transition = create_bidirectional_transition(div, fly, { duration: ANIMATION_TIME, y: 100 }, false);
        div_transition.run(0);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        if (detaching && div_transition)
          div_transition.end();
        mounted = false;
        run_all(dispose);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_2.name,
      type: "if",
      source: "(692:7) {#if $editLayout_03}",
      ctx
    });
    return block;
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
    let if_block0 = ctx[2] && create_if_block_4(ctx);
    let each_value_2 = ctx[59].data;
    validate_each_argument(each_value_2);
    const get_key = (ctx2) => ctx2[62].id;
    validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);
    for (let i = 0; i < each_value_2.length; i += 1) {
      let child_ctx = get_each_context_2(ctx, each_value_2, i);
      let key = get_key(child_ctx);
      each_1_lookup.set(key, each_blocks[i] = create_each_block_2(key, child_ctx));
    }
    let if_block1 = ctx[1] && create_if_block_2(ctx);
    function dragstart_handler_1(...args) {
      return ctx[41](ctx[59], ...args);
    }
    function dragenter_handler(...args) {
      return ctx[42](ctx[59], ...args);
    }
    function dragend_handler_1(...args) {
      return ctx[43](ctx[59], ...args);
    }
    function drop_handler_1(...args) {
      return ctx[44](ctx[59], ...args);
    }
    function dragleave_handler_1(...args) {
      return ctx[45](ctx[59], ...args);
    }
    function dragover_handler_1(...args) {
      return ctx[46](ctx[59], ...args);
    }
    const block = {
      key: key_1,
      first: null,
      c: function create() {
        div = element("div");
        if (if_block0)
          if_block0.c();
        t0 = space();
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t1 = space();
        if (if_block1)
          if_block1.c();
        attr_dev(div, "class", "Column");
        attr_dev(div, "data-edit", div_data_edit_value = ctx[2] || ctx[3]);
        attr_dev(div, "data-editpreview", ctx[1]);
        attr_dev(div, "data-itemid", div_data_itemid_value = ctx[59].id);
        attr_dev(div, "data-edit-active", ctx[2]);
        attr_dev(div, "data-dragging", div_data_dragging_value = ctx[14].isBeingDragged(ctx[59].id));
        attr_dev(div, "role", "none");
        attr_dev(div, "draggable", ctx[2]);
        add_location(div, file, 569, 6, 17100);
        this.first = div;
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        if (if_block0)
          if_block0.m(div, null);
        append_dev(div, t0);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(div, null);
          }
        }
        append_dev(div, t1);
        if (if_block1)
          if_block1.m(div, null);
        current = true;
        if (!mounted) {
          dispose = [
            listen_dev(div, "dragstart", dragstart_handler_1, false, false, false, false),
            listen_dev(div, "dragenter", dragenter_handler, false, false, false, false),
            listen_dev(div, "dragend", dragend_handler_1, false, false, false, false),
            listen_dev(div, "drop", drop_handler_1, false, false, false, false),
            listen_dev(div, "dragleave", dragleave_handler_1, false, false, false, false),
            listen_dev(div, "dragover", dragover_handler_1, false, false, false, false)
          ];
          mounted = true;
        }
      },
      p: function update2(new_ctx, dirty) {
        ctx = new_ctx;
        if (ctx[2]) {
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
        if (dirty[0] & 35895) {
          each_value_2 = ctx[59].data;
          validate_each_argument(each_value_2);
          group_outros();
          for (let i = 0; i < each_blocks.length; i += 1)
            each_blocks[i].r();
          validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);
          each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_2, each_1_lookup, div, fix_and_outro_and_destroy_block, create_each_block_2, t1, get_each_context_2);
          for (let i = 0; i < each_blocks.length; i += 1)
            each_blocks[i].a();
          check_outros();
        }
        if (ctx[1]) {
          if (if_block1) {
            if_block1.p(ctx, dirty);
            if (dirty[0] & 2) {
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
        if (!current || dirty[0] & 12 && div_data_edit_value !== (div_data_edit_value = ctx[2] || ctx[3])) {
          attr_dev(div, "data-edit", div_data_edit_value);
        }
        if (!current || dirty[0] & 2) {
          attr_dev(div, "data-editpreview", ctx[1]);
        }
        if (!current || dirty[0] & 32 && div_data_itemid_value !== (div_data_itemid_value = ctx[59].id)) {
          attr_dev(div, "data-itemid", div_data_itemid_value);
        }
        if (!current || dirty[0] & 4) {
          attr_dev(div, "data-edit-active", ctx[2]);
        }
        if (!current || dirty[0] & 32 && div_data_dragging_value !== (div_data_dragging_value = ctx[14].isBeingDragged(ctx[59].id))) {
          attr_dev(div, "data-dragging", div_data_dragging_value);
        }
        if (!current || dirty[0] & 4) {
          attr_dev(div, "draggable", ctx[2]);
        }
      },
      r: function measure() {
        rect = div.getBoundingClientRect();
      },
      f: function fix() {
        fix_position(div);
        stop_animation();
        add_transform(div, rect);
      },
      a: function animate() {
        stop_animation();
        stop_animation = create_animation(div, rect, customFlip, { duration: ANIMATION_TIME });
      },
      i: function intro(local) {
        if (current)
          return;
        for (let i = 0; i < each_value_2.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        transition_in(if_block1);
        add_render_callback(() => {
          if (!current)
            return;
          if (!div_transition)
            div_transition = create_bidirectional_transition(div, fade, { duration: ANIMATION_TIME }, true);
          div_transition.run(1);
        });
        current = true;
      },
      o: function outro(local) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        transition_out(if_block1);
        if (!div_transition)
          div_transition = create_bidirectional_transition(div, fade, { duration: ANIMATION_TIME }, false);
        div_transition.run(0);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        if (if_block0)
          if_block0.d();
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].d();
        }
        if (if_block1)
          if_block1.d();
        if (detaching && div_transition)
          div_transition.end();
        mounted = false;
        run_all(dispose);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_each_block_1.name,
      type: "each",
      source: "(569:5) {#each row.data as column, j (column.id)}",
      ctx
    });
    return block;
  }
  function create_if_block_1(ctx) {
    let div1;
    let div0;
    let p;
    let span;
    let div1_transition;
    let current;
    let mounted;
    let dispose;
    function click_handler_8() {
      return ctx[47](ctx[56]);
    }
    const block = {
      c: function create() {
        div1 = element("div");
        div0 = element("div");
        p = element("p");
        span = element("span");
        span.textContent = "+";
        add_location(span, file, 722, 43, 21297);
        add_location(p, file, 722, 40, 21294);
        attr_dev(div0, "data-name", "columnAddText");
        add_location(div0, file, 722, 7, 21261);
        attr_dev(div1, "class", "AddColumn");
        attr_dev(div1, "data-edit", "true");
        attr_dev(div1, "role", "none");
        add_location(div1, file, 709, 6, 20967);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div1, anchor);
        append_dev(div1, div0);
        append_dev(div0, p);
        append_dev(p, span);
        current = true;
        if (!mounted) {
          dispose = [
            listen_dev(div1, "click", click_handler_8, false, false, false, false),
            listen_dev(div1, "keypress", ctx[19], false, false, false, false)
          ];
          mounted = true;
        }
      },
      p: function update2(new_ctx, dirty) {
        ctx = new_ctx;
      },
      i: function intro(local) {
        if (current)
          return;
        add_render_callback(() => {
          if (!current)
            return;
          if (!div1_transition)
            div1_transition = create_bidirectional_transition(div1, fly, { duration: ANIMATION_TIME, y: 100 }, true);
          div1_transition.run(1);
        });
        current = true;
      },
      o: function outro(local) {
        if (!div1_transition)
          div1_transition = create_bidirectional_transition(div1, fly, { duration: ANIMATION_TIME, y: 100 }, false);
        div1_transition.run(0);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div1);
        if (detaching && div1_transition)
          div1_transition.end();
        mounted = false;
        run_all(dispose);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block_1.name,
      type: "if",
      source: "(709:5) {#if $editLayout_02}",
      ctx
    });
    return block;
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
    let if_block0 = ctx[3] && create_if_block_5(ctx);
    let each_value_1 = ctx[56].data;
    validate_each_argument(each_value_1);
    const get_key = (ctx2) => ctx2[59].id;
    validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    for (let i = 0; i < each_value_1.length; i += 1) {
      let child_ctx = get_each_context_1(ctx, each_value_1, i);
      let key = get_key(child_ctx);
      each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    }
    let if_block1 = ctx[2] && create_if_block_1(ctx);
    function dragstart_handler_2(...args) {
      return ctx[48](ctx[56], ...args);
    }
    function dragenter_handler_1(...args) {
      return ctx[49](ctx[56], ...args);
    }
    function dragend_handler_2(...args) {
      return ctx[50](ctx[56], ...args);
    }
    function dragover_handler_2(...args) {
      return ctx[51](ctx[56], ...args);
    }
    const block = {
      key: key_1,
      first: null,
      c: function create() {
        div = element("div");
        if (if_block0)
          if_block0.c();
        t0 = space();
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t1 = space();
        if (if_block1)
          if_block1.c();
        attr_dev(div, "class", "Row");
        attr_dev(div, "data-edit", ctx[3]);
        attr_dev(div, "data-edit-active", ctx[3]);
        attr_dev(div, "data-editpreview", ctx[2]);
        attr_dev(div, "role", "none");
        attr_dev(div, "style", div_style_value = `grid-template-columns: ${repeat(ctx[56].data.length, "1fr")} auto`);
        attr_dev(div, "data-rowid", div_data_rowid_value = ctx[56].id);
        attr_dev(div, "draggable", ctx[3]);
        add_location(div, file, 532, 4, 16025);
        this.first = div;
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        if (if_block0)
          if_block0.m(div, null);
        append_dev(div, t0);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(div, null);
          }
        }
        append_dev(div, t1);
        if (if_block1)
          if_block1.m(div, null);
        current = true;
        if (!mounted) {
          dispose = [
            listen_dev(div, "dragstart", dragstart_handler_2, false, false, false, false),
            listen_dev(div, "dragenter", dragenter_handler_1, false, false, false, false),
            listen_dev(div, "dragend", dragend_handler_2, false, false, false, false),
            listen_dev(div, "dragover", dragover_handler_2, false, false, false, false)
          ];
          mounted = true;
        }
      },
      p: function update2(new_ctx, dirty) {
        ctx = new_ctx;
        if (ctx[3]) {
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
        if (dirty[0] & 52287) {
          each_value_1 = ctx[56].data;
          validate_each_argument(each_value_1);
          group_outros();
          for (let i = 0; i < each_blocks.length; i += 1)
            each_blocks[i].r();
          validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
          each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, fix_and_outro_and_destroy_block, create_each_block_1, t1, get_each_context_1);
          for (let i = 0; i < each_blocks.length; i += 1)
            each_blocks[i].a();
          check_outros();
        }
        if (ctx[2]) {
          if (if_block1) {
            if_block1.p(ctx, dirty);
            if (dirty[0] & 4) {
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
        if (!current || dirty[0] & 8) {
          attr_dev(div, "data-edit", ctx[3]);
        }
        if (!current || dirty[0] & 8) {
          attr_dev(div, "data-edit-active", ctx[3]);
        }
        if (!current || dirty[0] & 4) {
          attr_dev(div, "data-editpreview", ctx[2]);
        }
        if (!current || dirty[0] & 32 && div_style_value !== (div_style_value = `grid-template-columns: ${repeat(ctx[56].data.length, "1fr")} auto`)) {
          attr_dev(div, "style", div_style_value);
        }
        if (!current || dirty[0] & 32 && div_data_rowid_value !== (div_data_rowid_value = ctx[56].id)) {
          attr_dev(div, "data-rowid", div_data_rowid_value);
        }
        if (!current || dirty[0] & 8) {
          attr_dev(div, "draggable", ctx[3]);
        }
      },
      r: function measure() {
        rect = div.getBoundingClientRect();
      },
      f: function fix() {
        fix_position(div);
        stop_animation();
        add_transform(div, rect);
      },
      a: function animate() {
        stop_animation();
        stop_animation = create_animation(div, rect, customFlip, { duration: ANIMATION_TIME });
      },
      i: function intro(local) {
        if (current)
          return;
        for (let i = 0; i < each_value_1.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        transition_in(if_block1);
        add_render_callback(() => {
          if (!current)
            return;
          if (!div_transition)
            div_transition = create_bidirectional_transition(div, fly, { duration: ANIMATION_TIME, y: 100 }, true);
          div_transition.run(1);
        });
        current = true;
      },
      o: function outro(local) {
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        transition_out(if_block1);
        if (!div_transition)
          div_transition = create_bidirectional_transition(div, fly, { duration: ANIMATION_TIME, y: 100 }, false);
        div_transition.run(0);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        if (if_block0)
          if_block0.d();
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].d();
        }
        if (if_block1)
          if_block1.d();
        if (detaching && div_transition)
          div_transition.end();
        mounted = false;
        run_all(dispose);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_each_block.name,
      type: "each",
      source: "(532:3) {#each $OBJ.data as row, i (row.id)}",
      ctx
    });
    return block;
  }
  function create_if_block(ctx) {
    let div;
    let span;
    let t1;
    let div_transition;
    let current;
    let mounted;
    let dispose;
    const block = {
      c: function create() {
        div = element("div");
        span = element("span");
        span.textContent = "+";
        t1 = text(" add Row");
        add_location(span, file, 742, 5, 21715);
        attr_dev(div, "class", "AddRow");
        attr_dev(div, "data-edit", "true");
        attr_dev(div, "role", "none");
        add_location(div, file, 728, 4, 21401);
      },
      m: function mount(target, anchor) {
        insert_dev(target, div, anchor);
        append_dev(div, span);
        append_dev(div, t1);
        current = true;
        if (!mounted) {
          dispose = [
            listen_dev(div, "click", ctx[52], false, false, false, false),
            listen_dev(div, "keypress", ctx[18], false, false, false, false)
          ];
          mounted = true;
        }
      },
      p: function update2(new_ctx, dirty) {
        ctx = new_ctx;
      },
      i: function intro(local) {
        if (current)
          return;
        add_render_callback(() => {
          if (!current)
            return;
          if (!div_transition)
            div_transition = create_bidirectional_transition(div, fly, { duration: ANIMATION_TIME, y: 100 }, true);
          div_transition.run(1);
        });
        current = true;
      },
      o: function outro(local) {
        if (!div_transition)
          div_transition = create_bidirectional_transition(div, fly, { duration: ANIMATION_TIME, y: 100 }, false);
        div_transition.run(0);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div);
        if (detaching && div_transition)
          div_transition.end();
        mounted = false;
        run_all(dispose);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_if_block.name,
      type: "if",
      source: "(728:3) {#if $editLayout_01}",
      ctx
    });
    return block;
  }
  function create_fragment(ctx) {
    let div4;
    let loadingspinner;
    let t0;
    let div3;
    let div1;
    let div0;
    let button0;
    let t1_value = "Stop Edit	";
    let t1;
    let t2;
    let button1;
    let t3_value = "Layout Row	";
    let t3;
    let t4;
    let button2;
    let t5_value = "Layout Col	";
    let t5;
    let t6;
    let button3;
    let t7_value = "Layout Items";
    let t7;
    let div0_data_isopen_value;
    let div1_data_isopen_value;
    let t8;
    let div2;
    let each_blocks = [];
    let each_1_lookup = /* @__PURE__ */ new Map();
    let t9;
    let div2_data_isediting_value;
    let current;
    let mounted;
    let dispose;
    loadingspinner = new LoadingSpinner({
      props: { active: ctx[12] },
      $$inline: true
    });
    let each_value = ctx[5].data;
    validate_each_argument(each_value);
    const get_key = (ctx2) => ctx2[56].id;
    validate_each_keys(ctx, each_value, get_each_context, get_key);
    for (let i = 0; i < each_value.length; i += 1) {
      let child_ctx = get_each_context(ctx, each_value, i);
      let key = get_key(child_ctx);
      each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    }
    let if_block = ctx[3] && create_if_block(ctx);
    const block = {
      c: function create() {
        div4 = element("div");
        create_component(loadingspinner.$$.fragment);
        t0 = space();
        div3 = element("div");
        div1 = element("div");
        div0 = element("div");
        button0 = element("button");
        t1 = text(t1_value);
        t2 = space();
        button1 = element("button");
        t3 = text(t3_value);
        t4 = space();
        button2 = element("button");
        t5 = text(t5_value);
        t6 = space();
        button3 = element("button");
        t7 = text(t7_value);
        t8 = space();
        div2 = element("div");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t9 = space();
        if (if_block)
          if_block.c();
        this.c = noop;
        attr_dev(button0, "data-active", ctx[4]);
        add_location(button0, file, 496, 4, 14555);
        attr_dev(button1, "data-active", ctx[3]);
        add_location(button1, file, 502, 4, 14784);
        attr_dev(button2, "data-active", ctx[2]);
        add_location(button2, file, 508, 4, 15087);
        attr_dev(button3, "data-active", ctx[1]);
        add_location(button3, file, 514, 4, 15407);
        attr_dev(div0, "class", "SheetEditorMenu");
        attr_dev(div0, "data-isopen", div0_data_isopen_value = ctx[4] || ctx[3] || ctx[2] || ctx[1]);
        add_location(div0, file, 489, 3, 14416);
        attr_dev(div1, "class", "SheetEditorMenuContainer");
        attr_dev(div1, "data-isopen", div1_data_isopen_value = ctx[4] || ctx[3] || ctx[2] || ctx[1]);
        add_location(div1, file, 483, 2, 14277);
        attr_dev(div2, "class", "SheetInnerWrap");
        attr_dev(div2, "data-editpreview", ctx[3]);
        attr_dev(div2, "data-isediting", div2_data_isediting_value = ctx[4] || ctx[3] || ctx[2] || ctx[1]);
        add_location(div2, file, 523, 2, 15811);
        attr_dev(div3, "class", "Sheet");
        add_location(div3, file, 482, 1, 14254);
        add_location(div4, file, 478, 0, 14199);
      },
      l: function claim(nodes) {
        throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
      },
      m: function mount(target, anchor) {
        insert_dev(target, div4, anchor);
        mount_component(loadingspinner, div4, null);
        append_dev(div4, t0);
        append_dev(div4, div3);
        append_dev(div3, div1);
        append_dev(div1, div0);
        append_dev(div0, button0);
        append_dev(button0, t1);
        append_dev(div0, t2);
        append_dev(div0, button1);
        append_dev(button1, t3);
        append_dev(div0, t4);
        append_dev(div0, button2);
        append_dev(button2, t5);
        append_dev(div0, t6);
        append_dev(div0, button3);
        append_dev(button3, t7);
        append_dev(div3, t8);
        append_dev(div3, div2);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(div2, null);
          }
        }
        append_dev(div2, t9);
        if (if_block)
          if_block.m(div2, null);
        current = true;
        if (!mounted) {
          dispose = [
            listen_dev(button0, "click", ctx[24], false, false, false, false),
            action_destroyer(tooltip.call(null, button0, {
              text: "Editmode, allows in View Edits",
              type: "verbose"
            })),
            listen_dev(button1, "click", ctx[25], false, false, false, false),
            action_destroyer(tooltip.call(null, button1, {
              text: "Create Rows that stack vertically<br> you can drag and drop them to switch places of Rows",
              type: "verbose"
            })),
            listen_dev(button2, "click", ctx[26], false, false, false, false),
            action_destroyer(tooltip.call(null, button2, {
              text: "Create Columns in your rows<br> Columns stack horizontally<br> you can drag and drop them to switch places",
              type: "verbose"
            })),
            listen_dev(button3, "click", ctx[27], false, false, false, false),
            action_destroyer(tooltip.call(null, button3, {
              text: "Create items in your Columns<br>Items Stack vertically in a Column<br> when you drag an item you change what Column they belong to<br> to change vertical order use buttons",
              type: "verbose"
            }))
          ];
          mounted = true;
        }
      },
      p: function update2(ctx2, dirty) {
        if (!current || dirty[0] & 16) {
          attr_dev(button0, "data-active", ctx2[4]);
        }
        if (!current || dirty[0] & 8) {
          attr_dev(button1, "data-active", ctx2[3]);
        }
        if (!current || dirty[0] & 4) {
          attr_dev(button2, "data-active", ctx2[2]);
        }
        if (!current || dirty[0] & 2) {
          attr_dev(button3, "data-active", ctx2[1]);
        }
        if (!current || dirty[0] & 30 && div0_data_isopen_value !== (div0_data_isopen_value = ctx2[4] || ctx2[3] || ctx2[2] || ctx2[1])) {
          attr_dev(div0, "data-isopen", div0_data_isopen_value);
        }
        if (!current || dirty[0] & 30 && div1_data_isopen_value !== (div1_data_isopen_value = ctx2[4] || ctx2[3] || ctx2[2] || ctx2[1])) {
          attr_dev(div1, "data-isopen", div1_data_isopen_value);
        }
        if (dirty[0] & 60479) {
          each_value = ctx2[5].data;
          validate_each_argument(each_value);
          group_outros();
          for (let i = 0; i < each_blocks.length; i += 1)
            each_blocks[i].r();
          validate_each_keys(ctx2, each_value, get_each_context, get_key);
          each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div2, fix_and_outro_and_destroy_block, create_each_block, t9, get_each_context);
          for (let i = 0; i < each_blocks.length; i += 1)
            each_blocks[i].a();
          check_outros();
        }
        if (ctx2[3]) {
          if (if_block) {
            if_block.p(ctx2, dirty);
            if (dirty[0] & 8) {
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
        if (!current || dirty[0] & 8) {
          attr_dev(div2, "data-editpreview", ctx2[3]);
        }
        if (!current || dirty[0] & 30 && div2_data_isediting_value !== (div2_data_isediting_value = ctx2[4] || ctx2[3] || ctx2[2] || ctx2[1])) {
          attr_dev(div2, "data-isediting", div2_data_isediting_value);
        }
      },
      i: function intro(local) {
        if (current)
          return;
        transition_in(loadingspinner.$$.fragment, local);
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        transition_in(if_block);
        current = true;
      },
      o: function outro(local) {
        transition_out(loadingspinner.$$.fragment, local);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        transition_out(if_block);
        current = false;
      },
      d: function destroy(detaching) {
        if (detaching)
          detach_dev(div4);
        destroy_component(loadingspinner);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].d();
        }
        if (if_block)
          if_block.d();
        mounted = false;
        run_all(dispose);
      }
    };
    dispatch_dev("SvelteRegisterBlock", {
      block,
      id: create_fragment.name,
      type: "component",
      source: "",
      ctx
    });
    return block;
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
    let { $$slots: slots = {}, $$scope } = $$props;
    validate_slots("undefined", slots, []);
    let state = new State();
    let editMode = state.editMode;
    validate_store(editMode, "editMode");
    component_subscribe($$self, editMode, (value) => $$invalidate(4, $editMode = value));
    let editLayout_01 = state.editLayout_01;
    validate_store(editLayout_01, "editLayout_01");
    component_subscribe($$self, editLayout_01, (value) => $$invalidate(3, $editLayout_01 = value));
    let editLayout_02 = state.editLayout_02;
    validate_store(editLayout_02, "editLayout_02");
    component_subscribe($$self, editLayout_02, (value) => $$invalidate(2, $editLayout_02 = value));
    let editLayout_03 = state.editLayout_03;
    validate_store(editLayout_03, "editLayout_03");
    component_subscribe($$self, editLayout_03, (value) => $$invalidate(1, $editLayout_03 = value));
    let { textData } = $$props;
    let { sys } = $$props;
    let { writeBlock } = $$props;
    let DATA = new SheetData(textData != null ? textData : "");
    let OBJ = writable(DATA);
    validate_store(OBJ, "OBJ");
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
    $$self.$$.on_mount.push(function() {
      if (textData === void 0 && !("textData" in $$props || $$self.$$.bound[$$self.$$.props["textData"]])) {
        console_1.warn("<undefined> was created without expected prop 'textData'");
      }
      if (sys === void 0 && !("sys" in $$props || $$self.$$.bound[$$self.$$.props["sys"]])) {
        console_1.warn("<undefined> was created without expected prop 'sys'");
      }
      if (writeBlock === void 0 && !("writeBlock" in $$props || $$self.$$.bound[$$self.$$.props["writeBlock"]])) {
        console_1.warn("<undefined> was created without expected prop 'writeBlock'");
      }
    });
    const writable_props = ["textData", "sys", "writeBlock"];
    Object.keys($$props).forEach((key) => {
      if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$" && key !== "slot")
        console_1.warn(`<undefined> was created with unknown prop '${key}'`);
    });
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
      if ("textData" in $$props2)
        $$invalidate(16, textData = $$props2.textData);
      if ("sys" in $$props2)
        $$invalidate(0, sys = $$props2.sys);
      if ("writeBlock" in $$props2)
        $$invalidate(17, writeBlock = $$props2.writeBlock);
    };
    $$self.$capture_state = () => ({
      ANIMATION_DELAY,
      ANIMATION_TIME,
      DragHandlerController,
      DragItemHandlerController2,
      DragItemHandlerController3,
      State,
      onMount,
      SheetData,
      get: get_store_value,
      writable,
      fade,
      fly,
      ItemDestributor,
      system,
      customFlip,
      RowColumnOptions,
      LoadingSpinner,
      ItemManouver,
      tooltip,
      state,
      editMode,
      editLayout_01,
      editLayout_02,
      editLayout_03,
      textData,
      sys,
      writeBlock,
      DATA,
      OBJ,
      repeat,
      itemRequestMove,
      editWasClicked,
      requestEvalSaveCondition,
      DragRowHandler,
      DragColumnHandler,
      DragItemHandler,
      $editLayout_03,
      $editLayout_02,
      $editLayout_01,
      $editMode,
      $OBJ
    });
    $$self.$inject_state = ($$props2) => {
      if ("state" in $$props2)
        state = $$props2.state;
      if ("editMode" in $$props2)
        $$invalidate(6, editMode = $$props2.editMode);
      if ("editLayout_01" in $$props2)
        $$invalidate(7, editLayout_01 = $$props2.editLayout_01);
      if ("editLayout_02" in $$props2)
        $$invalidate(8, editLayout_02 = $$props2.editLayout_02);
      if ("editLayout_03" in $$props2)
        $$invalidate(9, editLayout_03 = $$props2.editLayout_03);
      if ("textData" in $$props2)
        $$invalidate(16, textData = $$props2.textData);
      if ("sys" in $$props2)
        $$invalidate(0, sys = $$props2.sys);
      if ("writeBlock" in $$props2)
        $$invalidate(17, writeBlock = $$props2.writeBlock);
      if ("DATA" in $$props2)
        DATA = $$props2.DATA;
      if ("OBJ" in $$props2)
        $$invalidate(10, OBJ = $$props2.OBJ);
      if ("editWasClicked" in $$props2)
        $$invalidate(12, editWasClicked = $$props2.editWasClicked);
      if ("DragRowHandler" in $$props2)
        $$invalidate(13, DragRowHandler = $$props2.DragRowHandler);
      if ("DragColumnHandler" in $$props2)
        $$invalidate(14, DragColumnHandler = $$props2.DragColumnHandler);
      if ("DragItemHandler" in $$props2)
        $$invalidate(15, DragItemHandler = $$props2.DragItemHandler);
    };
    if ($$props && "$$inject" in $$props) {
      $$self.$inject_state($$props.$$inject);
    }
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
  class App extends SvelteElement {
    constructor(options) {
      super();
      init(
        this,
        {
          target: this.shadowRoot,
          props: attribute_to_object(this.attributes),
          customElement: true
        },
        instance,
        create_fragment,
        safe_not_equal,
        { textData: 16, sys: 0, writeBlock: 17 },
        null,
        [-1, -1, -1]
      );
      if (options) {
        if (options.target) {
          insert_dev(options.target, this, options.anchor);
        }
        if (options.props) {
          this.$set(options.props);
          flush();
        }
      }
    }
    static get observedAttributes() {
      return ["textData", "sys", "writeBlock"];
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
  return App;
});
//# sourceMappingURL=components.umd.cjs.map
