"use strict";
var __defProp2 = Object.defineProperty;
var __defNormalProp = (obj, key, value2) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value: value2 }) : obj[key] = value2;
var __publicField = (obj, key, value2) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value2);
  return value2;
};
const obsidian = require("obsidian");
require("events");
const path = require("path");
const _interopDefaultLegacy = (e) => e && typeof e === "object" && "default" in e ? e : { default: e };
const path__default = /* @__PURE__ */ _interopDefaultLegacy(path);
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
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
function is_empty(obj) {
  return Object.keys(obj).length === 0;
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function component_subscribe(component, store, callback) {
  component.$$.on_destroy.push(subscribe(store, callback));
}
function split_css_unit(value2) {
  const split = typeof value2 === "string" && value2.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/);
  return split ? [parseFloat(split[1]), split[2] || "px"] : [value2, "px"];
}
const contenteditable_truthy_values = ["", true, 1, "true", "contenteditable"];
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
let is_hydrating = false;
function start_hydrating() {
  is_hydrating = true;
}
function end_hydrating() {
  is_hydrating = false;
}
function upper_bound(low, high, key, value2) {
  while (low < high) {
    const mid = low + (high - low >> 1);
    if (key(mid) <= value2) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
}
function init_hydrate(target) {
  if (target.hydrate_init)
    return;
  target.hydrate_init = true;
  let children2 = target.childNodes;
  if (target.nodeName === "HEAD") {
    const myChildren = [];
    for (let i = 0; i < children2.length; i++) {
      const node = children2[i];
      if (node.claim_order !== void 0) {
        myChildren.push(node);
      }
    }
    children2 = myChildren;
  }
  const m = new Int32Array(children2.length + 1);
  const p = new Int32Array(children2.length);
  m[0] = -1;
  let longest = 0;
  for (let i = 0; i < children2.length; i++) {
    const current = children2[i].claim_order;
    const seqLen = (longest > 0 && children2[m[longest]].claim_order <= current ? longest + 1 : upper_bound(1, longest, (idx) => children2[m[idx]].claim_order, current)) - 1;
    p[i] = m[seqLen] + 1;
    const newLen = seqLen + 1;
    m[newLen] = i;
    longest = Math.max(newLen, longest);
  }
  const lis = [];
  const toMove = [];
  let last = children2.length - 1;
  for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
    lis.push(children2[cur - 1]);
    for (; last >= cur; last--) {
      toMove.push(children2[last]);
    }
    last--;
  }
  for (; last >= 0; last--) {
    toMove.push(children2[last]);
  }
  lis.reverse();
  toMove.sort((a, b) => a.claim_order - b.claim_order);
  for (let i = 0, j = 0; i < toMove.length; i++) {
    while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
      j++;
    }
    const anchor = j < lis.length ? lis[j] : null;
    target.insertBefore(toMove[i], anchor);
  }
}
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
function append_hydration(target, node) {
  if (is_hydrating) {
    init_hydrate(target);
    if (target.actual_end_child === void 0 || target.actual_end_child !== null && target.actual_end_child.parentNode !== target) {
      target.actual_end_child = target.firstChild;
    }
    while (target.actual_end_child !== null && target.actual_end_child.claim_order === void 0) {
      target.actual_end_child = target.actual_end_child.nextSibling;
    }
    if (node !== target.actual_end_child) {
      if (node.claim_order !== void 0 || node.parentNode !== target) {
        target.insertBefore(node, target.actual_end_child);
      }
    } else {
      target.actual_end_child = node.nextSibling;
    }
  } else if (node.parentNode !== target || node.nextSibling !== null) {
    target.appendChild(node);
  }
}
function insert_hydration(target, node, anchor) {
  if (is_hydrating && !anchor) {
    append_hydration(target, node);
  } else if (node.parentNode !== target || node.nextSibling != anchor) {
    target.insertBefore(node, anchor || null);
  }
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
function element(name) {
  return document.createElement(name);
}
function svg_element(name) {
  return document.createElementNS("http://www.w3.org/2000/svg", name);
}
function text(data) {
  return document.createTextNode(data);
}
function space() {
  return text(" ");
}
function listen(node, event, handler, options) {
  node.addEventListener(event, handler, options);
  return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value2) {
  if (value2 == null)
    node.removeAttribute(attribute);
  else if (node.getAttribute(attribute) !== value2)
    node.setAttribute(attribute, value2);
}
function children(element2) {
  return Array.from(element2.childNodes);
}
function init_claim_info(nodes) {
  if (nodes.claim_info === void 0) {
    nodes.claim_info = { last_index: 0, total_claimed: 0 };
  }
}
function claim_node(nodes, predicate, processNode, createNode, dontUpdateLastIndex = false) {
  init_claim_info(nodes);
  const resultNode = (() => {
    for (let i = nodes.claim_info.last_index; i < nodes.length; i++) {
      const node = nodes[i];
      if (predicate(node)) {
        const replacement = processNode(node);
        if (replacement === void 0) {
          nodes.splice(i, 1);
        } else {
          nodes[i] = replacement;
        }
        if (!dontUpdateLastIndex) {
          nodes.claim_info.last_index = i;
        }
        return node;
      }
    }
    for (let i = nodes.claim_info.last_index - 1; i >= 0; i--) {
      const node = nodes[i];
      if (predicate(node)) {
        const replacement = processNode(node);
        if (replacement === void 0) {
          nodes.splice(i, 1);
        } else {
          nodes[i] = replacement;
        }
        if (!dontUpdateLastIndex) {
          nodes.claim_info.last_index = i;
        } else if (replacement === void 0) {
          nodes.claim_info.last_index--;
        }
        return node;
      }
    }
    return createNode();
  })();
  resultNode.claim_order = nodes.claim_info.total_claimed;
  nodes.claim_info.total_claimed += 1;
  return resultNode;
}
function claim_element_base(nodes, name, attributes, create_element) {
  return claim_node(nodes, (node) => node.nodeName === name, (node) => {
    const remove = [];
    for (let j = 0; j < node.attributes.length; j++) {
      const attribute = node.attributes[j];
      if (!attributes[attribute.name]) {
        remove.push(attribute.name);
      }
    }
    remove.forEach((v) => node.removeAttribute(v));
    return void 0;
  }, () => create_element(name));
}
function claim_element(nodes, name, attributes) {
  return claim_element_base(nodes, name, attributes, element);
}
function claim_svg_element(nodes, name, attributes) {
  return claim_element_base(nodes, name, attributes, svg_element);
}
function claim_text(nodes, data) {
  return claim_node(
    nodes,
    (node) => node.nodeType === 3,
    (node) => {
      const dataStr = "" + data;
      if (node.data.startsWith(dataStr)) {
        if (node.data.length !== dataStr.length) {
          return node.splitText(dataStr.length);
        }
      } else {
        node.data = dataStr;
      }
    },
    () => text(data),
    true
  );
}
function claim_space(nodes) {
  return claim_text(nodes, " ");
}
function set_data(text2, data) {
  data = "" + data;
  if (text2.data === data)
    return;
  text2.data = data;
}
function set_data_contenteditable(text2, data) {
  data = "" + data;
  if (text2.wholeText === data)
    return;
  text2.data = data;
}
function set_data_maybe_contenteditable(text2, data, attr_value) {
  if (~contenteditable_truthy_values.indexOf(attr_value)) {
    set_data_contenteditable(text2, data);
  } else {
    set_data(text2, data);
  }
}
function set_style(node, key, value2, important) {
  if (value2 == null) {
    node.style.removeProperty(key);
  } else {
    node.style.setProperty(key, value2, important ? "important" : "");
  }
}
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
  const e = document.createEvent("CustomEvent");
  e.initCustomEvent(type, bubbles, cancelable, detail);
  return e;
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
  const name = `__svelte_${hash(rule)}_${uid}`;
  const doc = get_root_for_style(node);
  const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
  if (!rules[name]) {
    rules[name] = true;
    stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
  }
  const animation = node.style.animation || "";
  node.style.animation = `${animation ? `${animation}, ` : ""}${name} ${duration}ms linear ${delay}ms 1 both`;
  active += 1;
  return name;
}
function delete_rule(node, name) {
  const previous = (node.style.animation || "").split(", ");
  const next = previous.filter(
    name ? (anim) => anim.indexOf(name) < 0 : (anim) => anim.indexOf("__svelte") === -1
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
  let name;
  function start() {
    if (css) {
      name = create_rule(node, 0, 1, duration, delay, easing, css);
    }
    if (!delay) {
      started = true;
    }
  }
  function stop() {
    if (css)
      delete_rule(node, name);
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
function create_in_transition(node, fn, params) {
  const options = { direction: "in" };
  let config = fn(node, params, options);
  let running = false;
  let animation_name;
  let task;
  let uid = 0;
  function cleanup() {
    if (animation_name)
      delete_rule(node, animation_name);
  }
  function go() {
    const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
    if (css)
      animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
    tick(0, 1);
    const start_time = now() + delay;
    const end_time = start_time + duration;
    if (task)
      task.abort();
    running = true;
    add_render_callback(() => dispatch(node, true, "start"));
    task = loop((now2) => {
      if (running) {
        if (now2 >= end_time) {
          tick(1, 0);
          dispatch(node, true, "end");
          cleanup();
          return running = false;
        }
        if (now2 >= start_time) {
          const t = easing((now2 - start_time) / duration);
          tick(t, 1 - t);
        }
      }
      return running;
    });
  }
  let started = false;
  return {
    start() {
      if (started)
        return;
      started = true;
      delete_rule(node);
      if (is_function(config)) {
        config = config(options);
        wait().then(go);
      } else {
        go();
      }
    },
    invalidate() {
      started = false;
    },
    end() {
      if (running) {
        cleanup();
        running = false;
      }
    }
  };
}
function create_out_transition(node, fn, params) {
  const options = { direction: "out" };
  let config = fn(node, params, options);
  let running = true;
  let animation_name;
  const group = outros;
  group.r += 1;
  function go() {
    const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
    if (css)
      animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
    const start_time = now() + delay;
    const end_time = start_time + duration;
    add_render_callback(() => dispatch(node, false, "start"));
    loop((now2) => {
      if (running) {
        if (now2 >= end_time) {
          tick(0, 1);
          dispatch(node, false, "end");
          if (!--group.r) {
            run_all(group.c);
          }
          return false;
        }
        if (now2 >= start_time) {
          const t = easing((now2 - start_time) / duration);
          tick(1 - t, t);
        }
      }
      return running;
    });
  }
  if (is_function(config)) {
    wait().then(() => {
      config = config(options);
      go();
    });
  } else {
    go();
  }
  return {
    end(reset) {
      if (reset && config.tick) {
        config.tick(1, 0);
      }
      if (running) {
        if (animation_name)
          delete_rule(node, animation_name);
        running = false;
      }
    }
  };
}
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
  function insert(block) {
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
      insert(new_block);
    } else if (did_move.has(old_key)) {
      o--;
    } else if (deltas.get(new_key) > deltas.get(old_key)) {
      did_move.add(new_key);
      insert(new_block);
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
    insert(new_blocks[n - 1]);
  run_all(updates);
  return new_blocks;
}
function create_component(block) {
  block && block.c();
}
function claim_component(block, parent_nodes) {
  block && block.l(parent_nodes);
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
    const value2 = rest.length ? rest[0] : ret;
    if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value2)) {
      if (!$$.skip_bound && $$.bound[i])
        $$.bound[i](value2);
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
      start_hydrating();
      const nodes = children(options.target);
      $$.fragment && $$.fragment.l(nodes);
      nodes.forEach(detach);
    } else {
      $$.fragment && $$.fragment.c();
    }
    if (options.intro)
      transition_in(component.$$.fragment);
    mount_component(component, options.target, options.anchor, options.customElement);
    end_hydrating();
    flush();
  }
  set_current_component(parent_component);
}
class SvelteComponent {
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
const ObsidianStandard = "";
const app = "";
function create_fragment$8(ctx) {
  let div2;
  let div0;
  let t0;
  let t1;
  let div1;
  let h4;
  let t2;
  let t3;
  let p;
  let t4;
  let div2_class_value;
  let mounted;
  let dispose;
  return {
    c() {
      div2 = element("div");
      div0 = element("div");
      t0 = text("X2");
      t1 = space();
      div1 = element("div");
      h4 = element("h4");
      t2 = text("Home");
      t3 = space();
      p = element("p");
      t4 = text("Basic information and settings");
      this.h();
    },
    l(nodes) {
      div2 = claim_element(nodes, "DIV", { class: true, "data-active": true });
      var div2_nodes = children(div2);
      div0 = claim_element(div2_nodes, "DIV", { class: true });
      var div0_nodes = children(div0);
      t0 = claim_text(div0_nodes, "X2");
      div0_nodes.forEach(detach);
      t1 = claim_space(div2_nodes);
      div1 = claim_element(div2_nodes, "DIV", { class: true });
      var div1_nodes = children(div1);
      h4 = claim_element(div1_nodes, "H4", {});
      var h4_nodes = children(h4);
      t2 = claim_text(h4_nodes, "Home");
      h4_nodes.forEach(detach);
      t3 = claim_space(div1_nodes);
      p = claim_element(div1_nodes, "P", {});
      var p_nodes = children(p);
      t4 = claim_text(p_nodes, "Basic information and settings");
      p_nodes.forEach(detach);
      div1_nodes.forEach(detach);
      div2_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div0, "class", "MenuBtnIcon");
      attr(div1, "class", "MenuBtnText");
      attr(div2, "class", div2_class_value = ctx[0] ? "MenuSBtn" : "MenuBtn");
      attr(div2, "data-active", ctx[1]);
    },
    m(target, anchor) {
      insert_hydration(target, div2, anchor);
      append_hydration(div2, div0);
      append_hydration(div0, t0);
      append_hydration(div2, t1);
      append_hydration(div2, div1);
      append_hydration(div1, h4);
      append_hydration(h4, t2);
      append_hydration(div1, t3);
      append_hydration(div1, p);
      append_hydration(p, t4);
      if (!mounted) {
        dispose = [
          listen(div2, "click", ctx[2]),
          listen(div2, "keypress", ctx[4])
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 1 && div2_class_value !== (div2_class_value = ctx2[0] ? "MenuSBtn" : "MenuBtn")) {
        attr(div2, "class", div2_class_value);
      }
      if (dirty & 2) {
        attr(div2, "data-active", ctx2[1]);
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div2);
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$7($$self, $$props, $$invalidate) {
  let { special = false } = $$props;
  let active2;
  function setActive(to) {
    $$invalidate(1, active2 = to);
  }
  let dispatch2 = createEventDispatcher();
  function onClick() {
    console.log("clickyy");
    dispatch2("click");
  }
  function keypress_handler(event) {
    bubble.call(this, $$self, event);
  }
  $$self.$$set = ($$props2) => {
    if ("special" in $$props2)
      $$invalidate(0, special = $$props2.special);
  };
  return [special, active2, onClick, setActive, keypress_handler];
}
class MenuBtn extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$7, create_fragment$8, safe_not_equal, { special: 0, setActive: 3 });
  }
  get setActive() {
    return this.$$.ctx[3];
  }
}
function get_each_context$3(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[10] = list[i];
  child_ctx[11] = list;
  child_ctx[12] = i;
  return child_ctx;
}
function create_each_block$3(ctx) {
  let menubtn;
  let i = ctx[12];
  let current;
  const assign_menubtn = () => ctx[6](menubtn, i);
  const unassign_menubtn = () => ctx[6](null, i);
  function click_handler() {
    return ctx[7](ctx[12]);
  }
  let menubtn_props = {
    special: ctx[0].includes(ctx[10])
  };
  menubtn = new MenuBtn({ props: menubtn_props });
  assign_menubtn();
  menubtn.$on("click", click_handler);
  return {
    c() {
      create_component(menubtn.$$.fragment);
    },
    l(nodes) {
      claim_component(menubtn.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(menubtn, target, anchor);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (i !== ctx[12]) {
        unassign_menubtn();
        i = ctx[12];
        assign_menubtn();
      }
      const menubtn_changes = {};
      if (dirty & 5)
        menubtn_changes.special = ctx[0].includes(ctx[10]);
      menubtn.$set(menubtn_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(menubtn.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(menubtn.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      unassign_menubtn();
      destroy_component(menubtn, detaching);
    }
  };
}
function create_fragment$7(ctx) {
  let div1;
  let div0;
  let t0;
  let t1;
  let section;
  let current;
  let each_value = ctx[2];
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
  }
  const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  });
  return {
    c() {
      div1 = element("div");
      div0 = element("div");
      t0 = text("TTRPG Page Menu");
      t1 = space();
      section = element("section");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      this.h();
    },
    l(nodes) {
      div1 = claim_element(nodes, "DIV", { class: true });
      var div1_nodes = children(div1);
      div0 = claim_element(div1_nodes, "DIV", { class: true });
      var div0_nodes = children(div0);
      t0 = claim_text(div0_nodes, "TTRPG Page Menu");
      div0_nodes.forEach(detach);
      t1 = claim_space(div1_nodes);
      section = claim_element(div1_nodes, "SECTION", { class: true });
      var section_nodes = children(section);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].l(section_nodes);
      }
      section_nodes.forEach(detach);
      div1_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div0, "class", "MenuTitle");
      attr(section, "class", "MenuBtnContainer");
      attr(div1, "class", "Menu");
    },
    m(target, anchor) {
      insert_hydration(target, div1, anchor);
      append_hydration(div1, div0);
      append_hydration(div0, t0);
      append_hydration(div1, t1);
      append_hydration(div1, section);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(section, null);
        }
      }
      current = true;
    },
    p(ctx2, [dirty]) {
      if (dirty & 15) {
        each_value = ctx2[2];
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
            each_blocks[i].m(section, null);
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
      if (current)
        return;
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
      if (detaching)
        detach(div1);
      destroy_each(each_blocks, detaching);
    }
  };
}
function instance$6($$self, $$props, $$invalidate) {
  let options;
  let { regularOptions = [] } = $$props;
  let { specialOptions = [] } = $$props;
  let { startChosen = "" } = $$props;
  let dispatch2 = createEventDispatcher();
  let btnArr = [];
  let chosen = null;
  function onBtnClick(i) {
    const btn = btnArr[i];
    if (btn == chosen) {
      return;
    }
    if (chosen)
      chosen.setActive(false);
    btn.setActive(true);
    chosen = btn;
    dispatch2("changePage", options[i]);
  }
  onMount(() => {
    let i = options.findIndex((p) => p == startChosen);
    if (i != -1) {
      onBtnClick(i);
    }
  });
  function menubtn_binding($$value, i) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      btnArr[i] = $$value;
      $$invalidate(1, btnArr);
    });
  }
  const click_handler = (i) => onBtnClick(i);
  $$self.$$set = ($$props2) => {
    if ("regularOptions" in $$props2)
      $$invalidate(4, regularOptions = $$props2.regularOptions);
    if ("specialOptions" in $$props2)
      $$invalidate(0, specialOptions = $$props2.specialOptions);
    if ("startChosen" in $$props2)
      $$invalidate(5, startChosen = $$props2.startChosen);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 17) {
      $$invalidate(2, options = regularOptions.concat(...specialOptions));
    }
  };
  return [
    specialOptions,
    btnArr,
    options,
    onBtnClick,
    regularOptions,
    startChosen,
    menubtn_binding,
    click_handler
  ];
}
class Menu extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$6, create_fragment$7, safe_not_equal, {
      regularOptions: 4,
      specialOptions: 0,
      startChosen: 5
    });
  }
}
function create_fragment$6(ctx) {
  let div13;
  let section0;
  let div0;
  let pre;
  let t0;
  let t1;
  let div2;
  let div1;
  let t2;
  let t3;
  let section1;
  let div12;
  let div5;
  let div3;
  let t4;
  let t5;
  let div4;
  let input0;
  let t6;
  let select;
  let option0;
  let t7;
  let option1;
  let t8;
  let option2;
  let t9;
  let t10;
  let div8;
  let div6;
  let t11;
  let t12;
  let div7;
  let input1;
  let t13;
  let div11;
  let div9;
  let t14;
  let t15;
  let div10;
  let input2;
  return {
    c() {
      div13 = element("div");
      section0 = element("section");
      div0 = element("div");
      pre = element("pre");
      t0 = text("				Grobax' TTRPG.\r\n				Make a ```TTRPG ``` block in an article. then you get to setup your block.\r\n				choosing a system, and then a UI for that system.\r\n\r\n				There are a standard Layouts, but you are able to use editing systems to change the layout,\r\n				You can use the Edit button to change single view settings.\r\n				The layout is made up of rows, then columns, then items in rows.\r\n				You can use edit rows to add, delete and switch the placing of these rows along with their contents.\r\n\r\n				You can use edit columns to add, delete and switch places of columns and their items. \r\n\r\n				You can use edit Items to add, delete items in the columns, you can also asign an item a view, as well as drag them into other columns. \r\n				in this mode you are also given access to buttons to manouver the item's position in that column.\r\n			");
      t1 = space();
      div2 = element("div");
      div1 = element("div");
      t2 = text("IMAGE");
      t3 = space();
      section1 = element("section");
      div12 = element("div");
      div5 = element("div");
      div3 = element("div");
      t4 = text("Setting 1");
      t5 = space();
      div4 = element("div");
      input0 = element("input");
      t6 = space();
      select = element("select");
      option0 = element("option");
      t7 = text("px");
      option1 = element("option");
      t8 = text("em");
      option2 = element("option");
      t9 = text("%");
      t10 = space();
      div8 = element("div");
      div6 = element("div");
      t11 = text("Setting 2");
      t12 = space();
      div7 = element("div");
      input1 = element("input");
      t13 = space();
      div11 = element("div");
      div9 = element("div");
      t14 = text("Setting 3");
      t15 = space();
      div10 = element("div");
      input2 = element("input");
      this.h();
    },
    l(nodes) {
      div13 = claim_element(nodes, "DIV", { class: true });
      var div13_nodes = children(div13);
      section0 = claim_element(div13_nodes, "SECTION", { class: true });
      var section0_nodes = children(section0);
      div0 = claim_element(section0_nodes, "DIV", {});
      var div0_nodes = children(div0);
      pre = claim_element(div0_nodes, "PRE", {});
      var pre_nodes = children(pre);
      t0 = claim_text(pre_nodes, "				Grobax' TTRPG.\r\n				Make a ```TTRPG ``` block in an article. then you get to setup your block.\r\n				choosing a system, and then a UI for that system.\r\n\r\n				There are a standard Layouts, but you are able to use editing systems to change the layout,\r\n				You can use the Edit button to change single view settings.\r\n				The layout is made up of rows, then columns, then items in rows.\r\n				You can use edit rows to add, delete and switch the placing of these rows along with their contents.\r\n\r\n				You can use edit columns to add, delete and switch places of columns and their items. \r\n\r\n				You can use edit Items to add, delete items in the columns, you can also asign an item a view, as well as drag them into other columns. \r\n				in this mode you are also given access to buttons to manouver the item's position in that column.\r\n			");
      pre_nodes.forEach(detach);
      div0_nodes.forEach(detach);
      t1 = claim_space(section0_nodes);
      div2 = claim_element(section0_nodes, "DIV", {});
      var div2_nodes = children(div2);
      div1 = claim_element(div2_nodes, "DIV", { class: true });
      var div1_nodes = children(div1);
      t2 = claim_text(div1_nodes, "IMAGE");
      div1_nodes.forEach(detach);
      div2_nodes.forEach(detach);
      section0_nodes.forEach(detach);
      t3 = claim_space(div13_nodes);
      section1 = claim_element(div13_nodes, "SECTION", {});
      var section1_nodes = children(section1);
      div12 = claim_element(section1_nodes, "DIV", { class: true });
      var div12_nodes = children(div12);
      div5 = claim_element(div12_nodes, "DIV", { class: true });
      var div5_nodes = children(div5);
      div3 = claim_element(div5_nodes, "DIV", { class: true, style: true });
      var div3_nodes = children(div3);
      t4 = claim_text(div3_nodes, "Setting 1");
      div3_nodes.forEach(detach);
      t5 = claim_space(div5_nodes);
      div4 = claim_element(div5_nodes, "DIV", { class: true, style: true });
      var div4_nodes = children(div4);
      input0 = claim_element(div4_nodes, "INPUT", { type: true });
      t6 = claim_space(div4_nodes);
      select = claim_element(div4_nodes, "SELECT", {});
      var select_nodes = children(select);
      option0 = claim_element(select_nodes, "OPTION", {});
      var option0_nodes = children(option0);
      t7 = claim_text(option0_nodes, "px");
      option0_nodes.forEach(detach);
      option1 = claim_element(select_nodes, "OPTION", {});
      var option1_nodes = children(option1);
      t8 = claim_text(option1_nodes, "em");
      option1_nodes.forEach(detach);
      option2 = claim_element(select_nodes, "OPTION", {});
      var option2_nodes = children(option2);
      t9 = claim_text(option2_nodes, "%");
      option2_nodes.forEach(detach);
      select_nodes.forEach(detach);
      div4_nodes.forEach(detach);
      div5_nodes.forEach(detach);
      t10 = claim_space(div12_nodes);
      div8 = claim_element(div12_nodes, "DIV", { class: true });
      var div8_nodes = children(div8);
      div6 = claim_element(div8_nodes, "DIV", { class: true, style: true });
      var div6_nodes = children(div6);
      t11 = claim_text(div6_nodes, "Setting 2");
      div6_nodes.forEach(detach);
      t12 = claim_space(div8_nodes);
      div7 = claim_element(div8_nodes, "DIV", { class: true, style: true });
      var div7_nodes = children(div7);
      input1 = claim_element(div7_nodes, "INPUT", { type: true });
      div7_nodes.forEach(detach);
      div8_nodes.forEach(detach);
      t13 = claim_space(div12_nodes);
      div11 = claim_element(div12_nodes, "DIV", { class: true });
      var div11_nodes = children(div11);
      div9 = claim_element(div11_nodes, "DIV", { class: true, style: true });
      var div9_nodes = children(div9);
      t14 = claim_text(div9_nodes, "Setting 3");
      div9_nodes.forEach(detach);
      t15 = claim_space(div11_nodes);
      div10 = claim_element(div11_nodes, "DIV", { class: true, style: true });
      var div10_nodes = children(div10);
      input2 = claim_element(div10_nodes, "INPUT", { type: true });
      div10_nodes.forEach(detach);
      div11_nodes.forEach(detach);
      div12_nodes.forEach(detach);
      section1_nodes.forEach(detach);
      div13_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div1, "class", "MainAppContainerPageTextImageSectionImage");
      attr(section0, "class", "MainAppContainerPageTextImageSection");
      attr(div3, "class", "tableRowColumn");
      set_style(div3, "float", "left");
      attr(input0, "type", "number");
      input0.value = "12";
      option0.__value = "px";
      option0.value = option0.__value;
      option0.selected = true;
      option1.__value = "em";
      option1.value = option1.__value;
      option2.__value = "%";
      option2.value = option2.__value;
      attr(div4, "class", "tableRowColumn");
      set_style(div4, "float", "right");
      attr(div5, "class", "tableRow");
      attr(div6, "class", "tableRowColumn");
      set_style(div6, "float", "left");
      attr(input1, "type", "checkbox");
      attr(div7, "class", "tableRowColumn");
      set_style(div7, "float", "right");
      attr(div8, "class", "tableRow");
      attr(div9, "class", "tableRowColumn");
      set_style(div9, "float", "left");
      attr(input2, "type", "checkbox");
      attr(div10, "class", "tableRowColumn");
      set_style(div10, "float", "right");
      attr(div11, "class", "tableRow");
      attr(div12, "class", "table ");
      attr(div13, "class", "MainAppContainerPage");
    },
    m(target, anchor) {
      insert_hydration(target, div13, anchor);
      append_hydration(div13, section0);
      append_hydration(section0, div0);
      append_hydration(div0, pre);
      append_hydration(pre, t0);
      append_hydration(section0, t1);
      append_hydration(section0, div2);
      append_hydration(div2, div1);
      append_hydration(div1, t2);
      append_hydration(div13, t3);
      append_hydration(div13, section1);
      append_hydration(section1, div12);
      append_hydration(div12, div5);
      append_hydration(div5, div3);
      append_hydration(div3, t4);
      append_hydration(div5, t5);
      append_hydration(div5, div4);
      append_hydration(div4, input0);
      append_hydration(div4, t6);
      append_hydration(div4, select);
      append_hydration(select, option0);
      append_hydration(option0, t7);
      append_hydration(select, option1);
      append_hydration(option1, t8);
      append_hydration(select, option2);
      append_hydration(option2, t9);
      append_hydration(div12, t10);
      append_hydration(div12, div8);
      append_hydration(div8, div6);
      append_hydration(div6, t11);
      append_hydration(div8, t12);
      append_hydration(div8, div7);
      append_hydration(div7, input1);
      append_hydration(div12, t13);
      append_hydration(div12, div11);
      append_hydration(div11, div9);
      append_hydration(div9, t14);
      append_hydration(div11, t15);
      append_hydration(div11, div10);
      append_hydration(div10, input2);
    },
    p: noop,
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div13);
    }
  };
}
class HomePage extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, null, create_fragment$6, safe_not_equal, {});
  }
}
var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
    d2.__proto__ = b2;
  } || function(d2, b2) {
    for (var p in b2)
      if (Object.prototype.hasOwnProperty.call(b2, p))
        d2[p] = b2[p];
  };
  return extendStatics(d, b);
};
function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
    throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() {
    this.constructor = d;
  }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var __assign = function() {
  __assign = Object.assign || function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
function __rest(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
}
function __decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function __param(paramIndex, decorator) {
  return function(target, key) {
    decorator(target, key, paramIndex);
  };
}
function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) {
    if (f !== void 0 && typeof f !== "function")
      throw new TypeError("Function expected");
    return f;
  }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
    var context = {};
    for (var p in contextIn)
      context[p] = p === "access" ? {} : contextIn[p];
    for (var p in contextIn.access)
      context.access[p] = contextIn.access[p];
    context.addInitializer = function(f) {
      if (done)
        throw new TypeError("Cannot add initializers after decoration has completed");
      extraInitializers.push(accept(f || null));
    };
    var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
    if (kind === "accessor") {
      if (result === void 0)
        continue;
      if (result === null || typeof result !== "object")
        throw new TypeError("Object expected");
      if (_ = accept(result.get))
        descriptor.get = _;
      if (_ = accept(result.set))
        descriptor.set = _;
      if (_ = accept(result.init))
        initializers.unshift(_);
    } else if (_ = accept(result)) {
      if (kind === "field")
        initializers.unshift(_);
      else
        descriptor[key] = _;
    }
  }
  if (target)
    Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
}
function __runInitializers(thisArg, initializers, value2) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
    value2 = useValue ? initializers[i].call(thisArg, value2) : initializers[i].call(thisArg);
  }
  return useValue ? value2 : void 0;
}
function __propKey(x) {
  return typeof x === "symbol" ? x : "".concat(x);
}
function __setFunctionName(f, name, prefix) {
  if (typeof name === "symbol")
    name = name.description ? "[".concat(name.description, "]") : "";
  return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
}
function __metadata(metadataKey, metadataValue) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
    return Reflect.metadata(metadataKey, metadataValue);
}
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value2) {
    return value2 instanceof P ? value2 : new P(function(resolve) {
      resolve(value2);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value2) {
      try {
        step(generator.next(value2));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value2) {
      try {
        step(generator["throw"](value2));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function __generator(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1)
      throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
  return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f)
      throw new TypeError("Generator is already executing.");
    while (g && (g = 0, op[0] && (_ = 0)), _)
      try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t)
          op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2])
              _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
    if (op[0] & 5)
      throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
}
var __createBinding = Object.create ? function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = { enumerable: true, get: function() {
      return m[k];
    } };
  }
  Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  o[k2] = m[k];
};
function __exportStar(m, o) {
  for (var p in m)
    if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
      __createBinding(o, m, p);
}
function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m)
    return m.call(o);
  if (o && typeof o.length === "number")
    return {
      next: function() {
        if (o && i >= o.length)
          o = void 0;
        return { value: o && o[i++], done: !o };
      }
    };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m)
    return o;
  var i = m.call(o), r, ar = [], e;
  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
      ar.push(r.value);
  } catch (error) {
    e = { error };
  } finally {
    try {
      if (r && !r.done && (m = i["return"]))
        m.call(i);
    } finally {
      if (e)
        throw e.error;
    }
  }
  return ar;
}
function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++)
    ar = ar.concat(__read(arguments[i]));
  return ar;
}
function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++)
    s += arguments[i].length;
  for (var r = Array(s), k = 0, i = 0; i < il; i++)
    for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
      r[k] = a[j];
  return r;
}
function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2)
    for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar)
          ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
  return to.concat(ar || Array.prototype.slice.call(from));
}
function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator)
    throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
    return this;
  }, i;
  function awaitReturn(f) {
    return function(v) {
      return Promise.resolve(v).then(f, reject);
    };
  }
  function verb(n, f) {
    if (g[n]) {
      i[n] = function(v) {
        return new Promise(function(a, b) {
          q.push([n, v, a, b]) > 1 || resume(n, v);
        });
      };
      if (f)
        i[n] = f(i[n]);
    }
  }
  function resume(n, v) {
    try {
      step(g[n](v));
    } catch (e) {
      settle(q[0][3], e);
    }
  }
  function step(r) {
    r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
  }
  function fulfill(value2) {
    resume("next", value2);
  }
  function reject(value2) {
    resume("throw", value2);
  }
  function settle(f, v) {
    if (f(v), q.shift(), q.length)
      resume(q[0][0], q[0][1]);
  }
}
function __asyncDelegator(o) {
  var i, p;
  return i = {}, verb("next"), verb("throw", function(e) {
    throw e;
  }), verb("return"), i[Symbol.iterator] = function() {
    return this;
  }, i;
  function verb(n, f) {
    i[n] = o[n] ? function(v) {
      return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v;
    } : f;
  }
}
function __asyncValues(o) {
  if (!Symbol.asyncIterator)
    throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
    return this;
  }, i);
  function verb(n) {
    i[n] = o[n] && function(v) {
      return new Promise(function(resolve, reject) {
        v = o[n](v), settle(resolve, reject, v.done, v.value);
      });
    };
  }
  function settle(resolve, reject, d, v) {
    Promise.resolve(v).then(function(v2) {
      resolve({ value: v2, done: d });
    }, reject);
  }
}
function __makeTemplateObject(cooked, raw) {
  if (Object.defineProperty) {
    Object.defineProperty(cooked, "raw", { value: raw });
  } else {
    cooked.raw = raw;
  }
  return cooked;
}
var __setModuleDefault = Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
};
function __importStar(mod) {
  if (mod && mod.__esModule)
    return mod;
  var result = {};
  if (mod != null) {
    for (var k in mod)
      if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
        __createBinding(result, mod, k);
  }
  __setModuleDefault(result, mod);
  return result;
}
function __importDefault(mod) {
  return mod && mod.__esModule ? mod : { default: mod };
}
function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function __classPrivateFieldSet(receiver, state, value2, kind, f) {
  if (kind === "m")
    throw new TypeError("Private method is not writable");
  if (kind === "a" && !f)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value2) : f ? f.value = value2 : state.set(receiver, value2), value2;
}
function __classPrivateFieldIn(state, receiver) {
  if (receiver === null || typeof receiver !== "object" && typeof receiver !== "function")
    throw new TypeError("Cannot use 'in' operator on non-object");
  return typeof state === "function" ? receiver === state : state.has(receiver);
}
function __addDisposableResource(env, value2, async) {
  if (value2 !== null && value2 !== void 0) {
    if (typeof value2 !== "object" && typeof value2 !== "function")
      throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose)
        throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value2[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose)
        throw new TypeError("Symbol.dispose is not defined.");
      dispose = value2[Symbol.dispose];
      if (async)
        inner = dispose;
    }
    if (typeof dispose !== "function")
      throw new TypeError("Object not disposable.");
    if (inner)
      dispose = function() {
        try {
          inner.call(this);
        } catch (e) {
          return Promise.reject(e);
        }
      };
    env.stack.push({ value: value2, dispose, async });
  } else if (async) {
    env.stack.push({ async: true });
  }
  return value2;
}
var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
function __disposeResources(env) {
  function fail(e) {
    env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
    env.hasError = true;
  }
  var r, s = 0;
  function next() {
    while (r = env.stack.pop()) {
      try {
        if (!r.async && s === 1)
          return s = 0, env.stack.push(r), Promise.resolve().then(next);
        if (r.dispose) {
          var result = r.dispose.call(r.value);
          if (r.async)
            return s |= 2, Promise.resolve(result).then(next, function(e) {
              fail(e);
              return next();
            });
        } else
          s |= 1;
      } catch (e) {
        fail(e);
      }
    }
    if (s === 1)
      return env.hasError ? Promise.reject(env.error) : Promise.resolve();
    if (env.hasError)
      throw env.error;
  }
  return next();
}
const tslib_es6 = {
  __extends,
  __assign,
  __rest,
  __decorate,
  __param,
  __metadata,
  __awaiter,
  __generator,
  __createBinding,
  __exportStar,
  __values,
  __read,
  __spread,
  __spreadArrays,
  __spreadArray,
  __await,
  __asyncGenerator,
  __asyncDelegator,
  __asyncValues,
  __makeTemplateObject,
  __importStar,
  __importDefault,
  __classPrivateFieldGet,
  __classPrivateFieldSet,
  __classPrivateFieldIn,
  __addDisposableResource,
  __disposeResources
};
const tslib_es6$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  __extends,
  get __assign() {
    return __assign;
  },
  __rest,
  __decorate,
  __param,
  __esDecorate,
  __runInitializers,
  __propKey,
  __setFunctionName,
  __metadata,
  __awaiter,
  __generator,
  __createBinding,
  __exportStar,
  __values,
  __read,
  __spread,
  __spreadArrays,
  __spreadArray,
  __await,
  __asyncGenerator,
  __asyncDelegator,
  __asyncValues,
  __makeTemplateObject,
  __importStar,
  __importDefault,
  __classPrivateFieldGet,
  __classPrivateFieldSet,
  __classPrivateFieldIn,
  __addDisposableResource,
  __disposeResources,
  default: tslib_es6
}, Symbol.toStringTag, { value: "Module" }));
function create_fragment$5(ctx) {
  let svg;
  let circle;
  let line0;
  let line1;
  return {
    c() {
      svg = svg_element("svg");
      circle = svg_element("circle");
      line0 = svg_element("line");
      line1 = svg_element("line");
      this.h();
    },
    l(nodes) {
      svg = claim_svg_element(nodes, "svg", {
        xmlns: true,
        width: true,
        height: true,
        viewBox: true,
        fill: true,
        stroke: true,
        "stroke-width": true,
        "stroke-linecap": true,
        "stroke-linejoin": true,
        class: true
      });
      var svg_nodes = children(svg);
      circle = claim_svg_element(svg_nodes, "circle", { cx: true, cy: true, r: true });
      var circle_nodes = children(circle);
      circle_nodes.forEach(detach);
      line0 = claim_svg_element(svg_nodes, "line", { x1: true, y1: true, x2: true, y2: true });
      var line0_nodes = children(line0);
      line0_nodes.forEach(detach);
      line1 = claim_svg_element(svg_nodes, "line", { x1: true, y1: true, x2: true, y2: true });
      var line1_nodes = children(line1);
      line1_nodes.forEach(detach);
      svg_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(circle, "cx", "12");
      attr(circle, "cy", "12");
      attr(circle, "r", "10");
      attr(line0, "x1", "12");
      attr(line0, "y1", "8");
      attr(line0, "x2", "12");
      attr(line0, "y2", "16");
      attr(line1, "x1", "8");
      attr(line1, "y1", "12");
      attr(line1, "x2", "16");
      attr(line1, "y2", "12");
      attr(svg, "xmlns", "http://www.w3.org/2000/svg");
      attr(svg, "width", "100%");
      attr(svg, "height", "100%");
      attr(svg, "viewBox", "0 0 24 24");
      attr(svg, "fill", "none");
      attr(svg, "stroke", ctx[0]);
      attr(svg, "stroke-width", "2");
      attr(svg, "stroke-linecap", "round");
      attr(svg, "stroke-linejoin", "round");
      attr(svg, "class", "svg-icon lucide-plus-circle");
    },
    m(target, anchor) {
      insert_hydration(target, svg, anchor);
      append_hydration(svg, circle);
      append_hydration(svg, line0);
      append_hydration(svg, line1);
    },
    p(ctx2, [dirty]) {
      if (dirty & 1) {
        attr(svg, "stroke", ctx2[0]);
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(svg);
    }
  };
}
function instance$5($$self, $$props, $$invalidate) {
  let { color = "black" } = $$props;
  $$self.$$set = ($$props2) => {
    if ("color" in $$props2)
      $$invalidate(0, color = $$props2.color);
  };
  return [color];
}
class Plus extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$5, create_fragment$5, safe_not_equal, { color: 0 });
  }
}
function get_each_context$2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[16] = list[i];
  child_ctx[17] = list;
  child_ctx[18] = i;
  return child_ctx;
}
function create_each_block$2(key_1, ctx) {
  let div1;
  let div0;
  let t_value = ctx[16].name + "";
  let t;
  let div1_data_selected_value;
  let div1_transition;
  let current;
  let mounted;
  let dispose;
  function div0_input_handler() {
    ctx[10].call(div0, ctx[17], ctx[18]);
  }
  function click_handler() {
    return ctx[11](ctx[16]);
  }
  return {
    key: key_1,
    first: null,
    c() {
      div1 = element("div");
      div0 = element("div");
      t = text(t_value);
      this.h();
    },
    l(nodes) {
      div1 = claim_element(nodes, "DIV", {
        class: true,
        "data-selected": true,
        "data-can-hover": true
      });
      var div1_nodes = children(div1);
      div0 = claim_element(div1_nodes, "DIV", {
        tabindex: true,
        class: true,
        contenteditable: true
      });
      var div0_nodes = children(div0);
      t = claim_text(div0_nodes, t_value);
      div0_nodes.forEach(detach);
      div1_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div0, "tabindex", "-1");
      attr(div0, "class", "Editable_column");
      attr(div0, "contenteditable", "false");
      if (ctx[16].name === void 0)
        add_render_callback(div0_input_handler);
      attr(div1, "class", "Editable_row");
      attr(div1, "data-selected", div1_data_selected_value = ctx[16].isSelected);
      attr(div1, "data-can-hover", true);
      this.first = div1;
    },
    m(target, anchor) {
      insert_hydration(target, div1, anchor);
      append_hydration(div1, div0);
      append_hydration(div0, t);
      if (ctx[16].name !== void 0) {
        div0.textContent = ctx[16].name;
      }
      current = true;
      if (!mounted) {
        dispose = [
          listen(div0, "input", div0_input_handler),
          listen(div0, "click", click_handler),
          listen(div0, "keyup", ctx[9])
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if ((!current || dirty & 4) && t_value !== (t_value = ctx[16].name + ""))
        set_data_maybe_contenteditable(t, t_value, "false");
      if (dirty & 4 && ctx[16].name !== div0.textContent) {
        div0.textContent = ctx[16].name;
      }
      if (!current || dirty & 4 && div1_data_selected_value !== (div1_data_selected_value = ctx[16].isSelected)) {
        attr(div1, "data-selected", div1_data_selected_value);
      }
    },
    i(local) {
      if (current)
        return;
      add_render_callback(() => {
        if (!current)
          return;
        if (!div1_transition)
          div1_transition = create_bidirectional_transition(div1, slide, {}, true);
        div1_transition.run(1);
      });
      current = true;
    },
    o(local) {
      if (!div1_transition)
        div1_transition = create_bidirectional_transition(div1, slide, {}, false);
      div1_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div1);
      if (detaching && div1_transition)
        div1_transition.end();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block$3(ctx) {
  let div1;
  let div0;
  let image_plus;
  let div1_transition;
  let current;
  let mounted;
  let dispose;
  image_plus = new Plus({ props: { color: "#fff" } });
  return {
    c() {
      div1 = element("div");
      div0 = element("div");
      create_component(image_plus.$$.fragment);
      this.h();
    },
    l(nodes) {
      div1 = claim_element(nodes, "DIV", {
        class: true,
        "data-selected": true,
        "data-can-hover": true,
        style: true
      });
      var div1_nodes = children(div1);
      div0 = claim_element(div1_nodes, "DIV", {
        tabindex: true,
        class: true,
        contenteditable: true
      });
      var div0_nodes = children(div0);
      claim_component(image_plus.$$.fragment, div0_nodes);
      div0_nodes.forEach(detach);
      div1_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div0, "tabindex", "-1");
      attr(div0, "class", "Editable_Icon");
      attr(div0, "contenteditable", "false");
      attr(div1, "class", "Editable_row Editable_rowPlusButton");
      attr(div1, "data-selected", false);
      attr(div1, "data-can-hover", true);
      set_style(div1, "display", "flex");
      set_style(div1, "justify-content", "center");
    },
    m(target, anchor) {
      insert_hydration(target, div1, anchor);
      append_hydration(div1, div0);
      mount_component(image_plus, div0, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen(div1, "click", ctx[12]),
          listen(div1, "keyup", ctx[13])
        ];
        mounted = true;
      }
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(image_plus.$$.fragment, local);
      add_render_callback(() => {
        if (!current)
          return;
        if (!div1_transition)
          div1_transition = create_bidirectional_transition(div1, slide, {}, true);
        div1_transition.run(1);
      });
      current = true;
    },
    o(local) {
      transition_out(image_plus.$$.fragment, local);
      if (!div1_transition)
        div1_transition = create_bidirectional_transition(div1, slide, {}, false);
      div1_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div1);
      destroy_component(image_plus);
      if (detaching && div1_transition)
        div1_transition.end();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_fragment$4(ctx) {
  let div;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t;
  let div_class_value;
  let current;
  let each_value = ctx[2];
  const get_key = (ctx2) => ctx2[16].key;
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$2(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
  }
  let if_block = ctx[1] != null && create_if_block$3(ctx);
  return {
    c() {
      div = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t = space();
      if (if_block)
        if_block.c();
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].l(div_nodes);
      }
      t = claim_space(div_nodes);
      if (if_block)
        if_block.l(div_nodes);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div, "class", div_class_value = ctx[0] ? "GrobsInteractiveContainer editableTable" : "editableTable");
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div, null);
        }
      }
      append_hydration(div, t);
      if (if_block)
        if_block.m(div, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (dirty & 12) {
        each_value = ctx2[2];
        group_outros();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$2, t, get_each_context$2);
        check_outros();
      }
      if (ctx2[1] != null) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & 2) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$3(ctx2);
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
      if (!current || dirty & 1 && div_class_value !== (div_class_value = ctx2[0] ? "GrobsInteractiveContainer editableTable" : "editableTable")) {
        attr(div, "class", div_class_value);
      }
    },
    i(local) {
      if (current)
        return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      transition_in(if_block);
      current = true;
    },
    o(local) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      if (if_block)
        if_block.d();
    }
  };
}
function instance$4($$self, $$props, $$invalidate) {
  let _collection;
  let { isEditableContainer = true } = $$props;
  let { collection } = $$props;
  let { onSelect } = $$props;
  let { onAdd = null } = $$props;
  const dispatch2 = createEventDispatcher();
  let selected = null;
  function deselect() {
    if (!selected)
      return;
    let i = _collection.findIndex((p) => p.isSelected);
    if (i != -1)
      $$invalidate(2, _collection[i].isSelected = false, _collection);
    selected = null;
    dispatch2("onDeSelect");
  }
  function select(key) {
    let item = _collection.find((p) => p.key == key);
    if (item) {
      _onSelect(item);
    }
  }
  function _onSelect(item) {
    let i = _collection.findIndex((p) => p.isSelected);
    if (i != -1 && _collection[i].key == item.key) {
      $$invalidate(2, _collection[i].isSelected = false, _collection);
      selected = null;
      dispatch2("onDeSelect");
      return;
    }
    if (i != -1)
      $$invalidate(2, _collection[i].isSelected = false, _collection);
    i = _collection.findIndex((p) => p.key == item.key);
    const isSelected = onSelect(_collection[i].key);
    if (isSelected) {
      selected = _collection[i];
    } else {
      selected = null;
    }
    $$invalidate(2, _collection[i].isSelected = isSelected, _collection);
  }
  function _onAdd() {
    if (!onAdd)
      return;
    deselect();
    onAdd();
  }
  function keyup_handler(event) {
    bubble.call(this, $$self, event);
  }
  function div0_input_handler(each_value, e_index) {
    each_value[e_index].name = this.textContent;
    $$invalidate(2, _collection), $$invalidate(5, collection);
  }
  const click_handler = (e) => _onSelect(e);
  const click_handler_1 = () => _onAdd();
  const keyup_handler_1 = () => _onAdd();
  $$self.$$set = ($$props2) => {
    if ("isEditableContainer" in $$props2)
      $$invalidate(0, isEditableContainer = $$props2.isEditableContainer);
    if ("collection" in $$props2)
      $$invalidate(5, collection = $$props2.collection);
    if ("onSelect" in $$props2)
      $$invalidate(6, onSelect = $$props2.onSelect);
    if ("onAdd" in $$props2)
      $$invalidate(1, onAdd = $$props2.onAdd);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 32) {
      $$invalidate(2, _collection = collection.map((p) => {
        var _a;
        if (p.key && p.value) {
          return {
            key: p.key,
            name: p.value,
            isSelected: (_a = p.isSelected) !== null && _a !== void 0 ? _a : false,
            nameEdit: p.value
          };
        } else {
          return {
            key: p,
            name: p,
            isSelected: false,
            nameEdit: p
          };
        }
      }));
    }
  };
  return [
    isEditableContainer,
    onAdd,
    _collection,
    _onSelect,
    _onAdd,
    collection,
    onSelect,
    deselect,
    select,
    keyup_handler,
    div0_input_handler,
    click_handler,
    click_handler_1,
    keyup_handler_1
  ];
}
class EditAbleList extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$4, create_fragment$4, safe_not_equal, {
      isEditableContainer: 0,
      collection: 5,
      onSelect: 6,
      onAdd: 1,
      deselect: 7,
      select: 8
    });
  }
  get deselect() {
    return this.$$.ctx[7];
  }
  get select() {
    return this.$$.ctx[8];
  }
}
const StaticMessageHandler$1 = "";
const subscriber_queue = [];
function writable(value2, start = noop) {
  let stop;
  const subscribers = /* @__PURE__ */ new Set();
  function set(new_value) {
    if (safe_not_equal(value2, new_value)) {
      value2 = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value2);
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
    set(fn(value2));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop;
    }
    run2(value2);
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
function get_each_context$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[12] = list[i][0];
  child_ctx[13] = list[i][1];
  const constants_0 = child_ctx[13].msg.replace("\n", "<br />");
  child_ctx[14] = constants_0;
  return child_ctx;
}
function create_if_block$2(ctx) {
  let div;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let div_transition;
  let current;
  let each_value = ctx[2];
  const get_key = (ctx2) => ctx2[12];
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$1(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
  }
  return {
    c() {
      div = element("div");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].l(div_nodes);
      }
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div, "class", "ErrorHandlerSignage");
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div, null);
        }
      }
      current = true;
    },
    p(ctx2, dirty) {
      if (dirty & 13) {
        each_value = ctx2[2];
        group_outros();
        for (let i = 0; i < each_blocks.length; i += 1)
          each_blocks[i].r();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div, fix_and_outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
        for (let i = 0; i < each_blocks.length; i += 1)
          each_blocks[i].a();
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      if (local) {
        add_render_callback(() => {
          if (!current)
            return;
          if (!div_transition)
            div_transition = create_bidirectional_transition(div, slide, {}, true);
          div_transition.run(1);
        });
      }
      current = true;
    },
    o(local) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      if (local) {
        if (!div_transition)
          div_transition = create_bidirectional_transition(div, slide, {}, false);
        div_transition.run(0);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
      if (detaching && div_transition)
        div_transition.end();
    }
  };
}
function create_if_block_1$2(ctx) {
  let i;
  let t;
  return {
    c() {
      i = element("i");
      t = text(ctx[0]);
    },
    l(nodes) {
      i = claim_element(nodes, "I", {});
      var i_nodes = children(i);
      t = claim_text(i_nodes, ctx[0]);
      i_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, i, anchor);
      append_hydration(i, t);
    },
    p(ctx2, dirty) {
      if (dirty & 1)
        set_data(t, ctx2[0]);
    },
    d(detaching) {
      if (detaching)
        detach(i);
    }
  };
}
function create_each_block$1(key_1, ctx) {
  let div;
  let p;
  let raw_value = ctx[14] + "";
  let t0;
  let t1;
  let div_class_value;
  let div_transition;
  let rect;
  let stop_animation = noop;
  let current;
  let mounted;
  let dispose;
  let if_block = ctx[0] && ctx[13].type == MessageTypes.error && create_if_block_1$2(ctx);
  function keydown_handler() {
    return ctx[9](ctx[13], ctx[12]);
  }
  function click_handler() {
    return ctx[10](ctx[13], ctx[12]);
  }
  return {
    key: key_1,
    first: null,
    c() {
      div = element("div");
      p = element("p");
      t0 = space();
      if (if_block)
        if_block.c();
      t1 = space();
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { role: true, class: true });
      var div_nodes = children(div);
      p = claim_element(div_nodes, "P", {});
      var p_nodes = children(p);
      p_nodes.forEach(detach);
      t0 = claim_space(div_nodes);
      if (if_block)
        if_block.l(div_nodes);
      t1 = claim_space(div_nodes);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div, "role", "none");
      attr(div, "class", div_class_value = ctx[13].type == MessageTypes.error ? "ErrorHandlerSign" : ctx[13].type == MessageTypes.verbose ? "VerboseHandlerSign" : ctx[13].type == MessageTypes.good ? "OKHandlerSign" : "");
      this.first = div;
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      append_hydration(div, p);
      p.innerHTML = raw_value;
      append_hydration(div, t0);
      if (if_block)
        if_block.m(div, null);
      append_hydration(div, t1);
      current = true;
      if (!mounted) {
        dispose = [
          listen(div, "keydown", keydown_handler),
          listen(div, "click", click_handler)
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if ((!current || dirty & 4) && raw_value !== (raw_value = ctx[14] + ""))
        p.innerHTML = raw_value;
      if (ctx[0] && ctx[13].type == MessageTypes.error) {
        if (if_block) {
          if_block.p(ctx, dirty);
        } else {
          if_block = create_if_block_1$2(ctx);
          if_block.c();
          if_block.m(div, t1);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (!current || dirty & 4 && div_class_value !== (div_class_value = ctx[13].type == MessageTypes.error ? "ErrorHandlerSign" : ctx[13].type == MessageTypes.verbose ? "VerboseHandlerSign" : ctx[13].type == MessageTypes.good ? "OKHandlerSign" : "")) {
        attr(div, "class", div_class_value);
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
      stop_animation = create_animation(div, rect, flip, {});
    },
    i(local) {
      if (current)
        return;
      if (local) {
        add_render_callback(() => {
          if (!current)
            return;
          if (!div_transition)
            div_transition = create_bidirectional_transition(div, slide, {}, true);
          div_transition.run(1);
        });
      }
      current = true;
    },
    o(local) {
      if (local) {
        if (!div_transition)
          div_transition = create_bidirectional_transition(div, slide, {}, false);
        div_transition.run(0);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      if (if_block)
        if_block.d();
      if (detaching && div_transition)
        div_transition.end();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_fragment$3(ctx) {
  let div;
  let current;
  let if_block = ctx[1] != 0 && create_if_block$2(ctx);
  return {
    c() {
      div = element("div");
      if (if_block)
        if_block.c();
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      if (if_block)
        if_block.l(div_nodes);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div, "class", "ErrorHandlerSignageContainer");
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      if (if_block)
        if_block.m(div, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (ctx2[1] != 0) {
        if (if_block) {
          if_block.p(ctx2, dirty);
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
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      if (if_block)
        if_block.d();
    }
  };
}
const MessageTypes = {
  error: "error",
  verbose: "verbose",
  good: "good"
};
function instance$3($$self, $$props, $$invalidate) {
  let messages = writable({});
  let messagesLength = Object.entries(messages).length;
  let entries = [];
  let { overrideClick = null } = $$props;
  let { overrideClickTextError = null } = $$props;
  messages.subscribe((p) => {
    $$invalidate(2, entries = Object.entries(p));
    $$invalidate(1, messagesLength = entries.length);
  });
  function addMessage(key, msg) {
    if (!msg)
      return;
    if (!msg.type)
      msg.type = "error";
    messages.update((r) => {
      r[key] = msg;
      return r;
    });
  }
  function addMessageManual(key, msg, type = "error") {
    messages.update((r) => {
      r[key] = { msg, type };
      return r;
    });
  }
  function removeError(key) {
    messages.update((r) => {
      if (!r[key])
        return r;
      delete r[key];
      return r;
    });
  }
  function removeAllMessages() {
    messages.update(() => {
      return {};
    });
  }
  function onclick(type, key) {
    let a = true;
    if (overrideClick)
      a = overrideClick(type, key);
    if (a) {
      removeError(key);
    }
  }
  const keydown_handler = (obj, key) => {
    onclick(obj.type, key);
  };
  const click_handler = (obj, key) => {
    onclick(obj.type, key);
  };
  $$self.$$set = ($$props2) => {
    if ("overrideClick" in $$props2)
      $$invalidate(4, overrideClick = $$props2.overrideClick);
    if ("overrideClickTextError" in $$props2)
      $$invalidate(0, overrideClickTextError = $$props2.overrideClickTextError);
  };
  return [
    overrideClickTextError,
    messagesLength,
    entries,
    onclick,
    overrideClick,
    addMessage,
    addMessageManual,
    removeError,
    removeAllMessages,
    keydown_handler,
    click_handler
  ];
}
class StaticMessageHandler extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$3, create_fragment$3, safe_not_equal, {
      overrideClick: 4,
      overrideClickTextError: 0,
      addMessage: 5,
      addMessageManual: 6,
      removeError: 7,
      removeAllMessages: 8
    });
  }
  get addMessage() {
    return this.$$.ctx[5];
  }
  get addMessageManual() {
    return this.$$.ctx[6];
  }
  get removeError() {
    return this.$$.ctx[7];
  }
  get removeAllMessages() {
    return this.$$.ctx[8];
  }
}
class StringFunctions {
  static isValidWindowsFileString(str) {
    if (!str)
      return false;
    const invalidCharsRegex = /[<>:"/\\|?*\x00-\x1F]/g;
    return !invalidCharsRegex.test(str) && !/^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i.test(str) && str.length <= 255;
  }
  static isValidSystemCodeName(str) {
    if (!str)
      return false;
    const regex = /[^a-zA-Z0-9]/;
    return !regex.test(str);
  }
  static ConvertToValidWindowsFileString(str) {
    const invalidCharsRegex = /[<>:"/\\|?*\x00-\x1F]/g;
    const validStr = str.replace(invalidCharsRegex, "_");
    return validStr.slice(0, 255);
  }
  static uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  static uuidShort() {
    return "xxxxxxxx".replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
}
var E_CANCELED = new Error("request for lock canceled");
var Semaphore = function() {
  function Semaphore2(_value, _cancelError) {
    if (_cancelError === void 0) {
      _cancelError = E_CANCELED;
    }
    this._value = _value;
    this._cancelError = _cancelError;
    this._queue = [];
    this._weightedWaiters = [];
  }
  Semaphore2.prototype.acquire = function(weight, priority) {
    var _this = this;
    if (weight === void 0) {
      weight = 1;
    }
    if (priority === void 0) {
      priority = 0;
    }
    if (weight <= 0)
      throw new Error("invalid weight ".concat(weight, ": must be positive"));
    return new Promise(function(resolve, reject) {
      var task = { resolve, reject, weight, priority };
      var i = findIndexFromEnd(_this._queue, function(other) {
        return priority <= other.priority;
      });
      if (i === -1 && weight <= _this._value) {
        _this._dispatchItem(task);
      } else {
        _this._queue.splice(i + 1, 0, task);
      }
    });
  };
  Semaphore2.prototype.runExclusive = function(callback_1) {
    return __awaiter(this, arguments, void 0, function(callback, weight, priority) {
      var _a, value2, release;
      if (weight === void 0) {
        weight = 1;
      }
      if (priority === void 0) {
        priority = 0;
      }
      return __generator(this, function(_b) {
        switch (_b.label) {
          case 0:
            return [4, this.acquire(weight, priority)];
          case 1:
            _a = _b.sent(), value2 = _a[0], release = _a[1];
            _b.label = 2;
          case 2:
            _b.trys.push([2, , 4, 5]);
            return [4, callback(value2)];
          case 3:
            return [2, _b.sent()];
          case 4:
            release();
            return [7];
          case 5:
            return [2];
        }
      });
    });
  };
  Semaphore2.prototype.waitForUnlock = function(weight, priority) {
    var _this = this;
    if (weight === void 0) {
      weight = 1;
    }
    if (priority === void 0) {
      priority = 0;
    }
    if (weight <= 0)
      throw new Error("invalid weight ".concat(weight, ": must be positive"));
    if (this._couldLockImmediately(weight, priority)) {
      return Promise.resolve();
    } else {
      return new Promise(function(resolve) {
        if (!_this._weightedWaiters[weight - 1])
          _this._weightedWaiters[weight - 1] = [];
        insertSorted(_this._weightedWaiters[weight - 1], { resolve, priority });
      });
    }
  };
  Semaphore2.prototype.isLocked = function() {
    return this._value <= 0;
  };
  Semaphore2.prototype.getValue = function() {
    return this._value;
  };
  Semaphore2.prototype.setValue = function(value2) {
    this._value = value2;
    this._dispatchQueue();
  };
  Semaphore2.prototype.release = function(weight) {
    if (weight === void 0) {
      weight = 1;
    }
    if (weight <= 0)
      throw new Error("invalid weight ".concat(weight, ": must be positive"));
    this._value += weight;
    this._dispatchQueue();
  };
  Semaphore2.prototype.cancel = function() {
    var _this = this;
    this._queue.forEach(function(entry) {
      return entry.reject(_this._cancelError);
    });
    this._queue = [];
  };
  Semaphore2.prototype._dispatchQueue = function() {
    this._drainUnlockWaiters();
    while (this._queue.length > 0 && this._queue[0].weight <= this._value) {
      this._dispatchItem(this._queue.shift());
      this._drainUnlockWaiters();
    }
  };
  Semaphore2.prototype._dispatchItem = function(item) {
    var previousValue = this._value;
    this._value -= item.weight;
    item.resolve([previousValue, this._newReleaser(item.weight)]);
  };
  Semaphore2.prototype._newReleaser = function(weight) {
    var _this = this;
    var called = false;
    return function() {
      if (called)
        return;
      called = true;
      _this.release(weight);
    };
  };
  Semaphore2.prototype._drainUnlockWaiters = function() {
    if (this._queue.length === 0) {
      for (var weight = this._value; weight > 0; weight--) {
        var waiters = this._weightedWaiters[weight - 1];
        if (!waiters)
          continue;
        waiters.forEach(function(waiter) {
          return waiter.resolve();
        });
        this._weightedWaiters[weight - 1] = [];
      }
    } else {
      var queuedPriority_1 = this._queue[0].priority;
      for (var weight = this._value; weight > 0; weight--) {
        var waiters = this._weightedWaiters[weight - 1];
        if (!waiters)
          continue;
        var i = waiters.findIndex(function(waiter) {
          return waiter.priority <= queuedPriority_1;
        });
        (i === -1 ? waiters : waiters.splice(0, i)).forEach(function(waiter) {
          return waiter.resolve();
        });
      }
    }
  };
  Semaphore2.prototype._couldLockImmediately = function(weight, priority) {
    return (this._queue.length === 0 || this._queue[0].priority < priority) && weight <= this._value;
  };
  return Semaphore2;
}();
function insertSorted(a, v) {
  var i = findIndexFromEnd(a, function(other) {
    return v.priority <= other.priority;
  });
  a.splice(i + 1, 0, v);
}
function findIndexFromEnd(a, predicate) {
  for (var i = a.length - 1; i >= 0; i--) {
    if (predicate(a[i])) {
      return i;
    }
  }
  return -1;
}
var Mutex = function() {
  function Mutex2(cancelError) {
    this._semaphore = new Semaphore(1, cancelError);
  }
  Mutex2.prototype.acquire = function() {
    return __awaiter(this, arguments, void 0, function(priority) {
      var _a, releaser;
      if (priority === void 0) {
        priority = 0;
      }
      return __generator(this, function(_b) {
        switch (_b.label) {
          case 0:
            return [4, this._semaphore.acquire(1, priority)];
          case 1:
            _a = _b.sent(), releaser = _a[1];
            return [2, releaser];
        }
      });
    });
  };
  Mutex2.prototype.runExclusive = function(callback, priority) {
    if (priority === void 0) {
      priority = 0;
    }
    return this._semaphore.runExclusive(function() {
      return callback();
    }, 1, priority);
  };
  Mutex2.prototype.isLocked = function() {
    return this._semaphore.isLocked();
  };
  Mutex2.prototype.waitForUnlock = function(priority) {
    if (priority === void 0) {
      priority = 0;
    }
    return this._semaphore.waitForUnlock(1, priority);
  };
  Mutex2.prototype.release = function() {
    if (this._semaphore.isLocked())
      this._semaphore.release();
  };
  Mutex2.prototype.cancel = function() {
    return this._semaphore.cancel();
  };
  return Mutex2;
}();
const _FileHandler = class {
  constructor() {
    if (_FileHandler._instance == null) {
      _FileHandler._instance = new _FileHandler();
    }
    return _FileHandler._instance;
  }
  static async mkdir(path2) {
    return await PluginHandler.App.vault.adapter.mkdir(path2);
  }
  static async rmdir(path2) {
    return await PluginHandler.App.vault.adapter.rmdir(path2, true);
  }
  static async lsdir(path2) {
    return await PluginHandler.App.vault.adapter.list(path2);
  }
  static async exists(path2) {
    return await PluginHandler.App.vault.adapter.exists(path2, false);
  }
  static async saveFile(path2, fileContent) {
    return await PluginHandler.App.vault.adapter.write(path2, fileContent);
  }
  static async readFile(path2) {
    return await PluginHandler.App.vault.adapter.read(path2);
  }
  static async rm(path2) {
    return await PluginHandler.App.vault.adapter.remove(path2);
  }
  static async copy(path2, newPath) {
    return await PluginHandler.App.vault.adapter.copy(path2, newPath);
  }
};
let FileHandler = _FileHandler;
__publicField(FileHandler, "_instance");
var BASE_SCHEME = "_base";
var NoOutput = {
  outError: function(msg) {
  },
  outLog: function(msg) {
  }
};
var JSON_TAGS;
(function(JSON_TAGS2) {
  JSON_TAGS2["JSON_PROPERTY"] = "JSON_PROPERTY";
  JSON_TAGS2["JSON_PROPERTY_TYPED"] = "JSON_PROPERTY_TYPED";
  JSON_TAGS2["JSON_PROPERTY_TYPED_SKIP_FORCED"] = "JSON_PROPERTY_TYPED_SKIP_FORCED";
  JSON_TAGS2["JSON_PROPERTY_NAME_MAP_IN"] = "JSON_PROPERTY_NAME_MAP_IN";
  JSON_TAGS2["JSON_PROPERTY_NAME_MAP_OUT"] = "JSON_PROPERTY_NAME_MAP_OUT";
  JSON_TAGS2["JSON_PROPERTY_FUNC_MAP_IN"] = "JSON_PROPERTY_FUNC_MAP_IN";
  JSON_TAGS2["JSON_PROPERTY_FUNC_MAP_OUT"] = "JSON_PROPERTY_FUNC_MAP_OUT";
  JSON_TAGS2["JSON_PROPERTY_FORCE_BASE_TYPE"] = "JSON_PROPERTY_FORCE_BASE_TYPE";
  JSON_TAGS2["JSON_PROPERTY_FORCE_ARRAY"] = "JSON_PROPERTY_FORCE_ARRAY";
  JSON_TAGS2["JSON_OBJECT_ON_AFTER_DE_SERIALIZATION"] = "JSON_OBJECT_ON_AFTER_DE_SERIALIZATION";
  JSON_TAGS2["JSON_OBJECT_ON_AFTER_SERIALIZATION_BEFORE_STRING"] = "JSON_OBJECT_ON_AFTER_SERIALIZATION_BEFORE_STRING";
  JSON_TAGS2["JSON_OBJECT_ON_AFTER_SERIALIZATION"] = "JSON_OBJECT_ON_AFTER_SERIALIZATION";
  JSON_TAGS2["JSON_OBJECT_ON_BEFORE_SERIALIZATION"] = "JSON_OBJECT_ON_BEFORE_SERIALIZATION";
  JSON_TAGS2["JSON_OBJECT_ON_BEFORE_DE_SERIALIZATION"] = "JSON_OBJECT_ON_BEFORE_DE_SERIALIZATION";
})(JSON_TAGS || (JSON_TAGS = {}));
var JSON_BASETYPES;
(function(JSON_BASETYPES2) {
  JSON_BASETYPES2["string"] = "string";
  JSON_BASETYPES2["bool"] = "bool";
  JSON_BASETYPES2["number"] = "number";
})(JSON_BASETYPES || (JSON_BASETYPES = {}));
function createGuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
var selfKey = createGuid() + "SELF";
var Reflect$1 = function() {
  function Reflect2() {
  }
  Reflect2.getPrototype = function(obj) {
    var a;
    if (typeof obj == "function") {
      a = obj.prototype;
    } else {
      a = obj.constructor.prototype;
    }
    return a;
  };
  Reflect2.setPrototype = function(obj, prototype) {
    if (typeof obj == "function") {
      throw new Error("Not Implemented Error, please report the scenario to me");
    } else {
      Object.setPrototypeOf(obj, prototype);
    }
  };
  Reflect2.getOrCreateAllMetaData = function(obj, create) {
    if (create === void 0) {
      create = false;
    }
    var prototype = Reflect2.getPrototype(obj);
    if (prototype === Object.prototype) {
      return null;
    }
    if (prototype == null)
      return null;
    var a = prototype;
    if (!a["gjmd"]) {
      if (!create)
        return null;
      a["gjmd"] = {};
    }
    a = a["gjmd"];
    if (!a[prototype.constructor.name]) {
      if (!create)
        return null;
      a[prototype.constructor.name] = {};
    }
    a = a[prototype.constructor.name];
    return a;
  };
  Reflect2.getOrCreateDefinedMetaData = function(obj, scheme, create) {
    if (create === void 0) {
      create = false;
    }
    var a = Reflect2.getOrCreateAllMetaData(obj, create);
    if (!a)
      return null;
    if (!a[scheme]) {
      if (!create)
        return null;
      a[scheme] = {};
    }
    return a[scheme];
  };
  Reflect2.getMetadataKeys = function(obj, key, scheme) {
    if (scheme === void 0) {
      scheme = BASE_SCHEME;
    }
    var a = Reflect2.getOrCreateDefinedMetaData(obj, scheme);
    if (!a || !a[key]) {
      return [];
    }
    return Object.keys(a[key]);
  };
  Reflect2.getOwnMetaDataKeys = function(obj, scheme) {
    if (scheme === void 0) {
      scheme = BASE_SCHEME;
    }
    return Reflect2.getMetadataKeys(obj, selfKey, scheme);
  };
  Reflect2.getMetadata = function(metaTag, target, propertyKey, scheme) {
    var _a;
    if (scheme === void 0) {
      scheme = BASE_SCHEME;
    }
    var a = Reflect2.getOrCreateDefinedMetaData(target, scheme);
    if (!a[propertyKey])
      return null;
    return (_a = a[propertyKey][metaTag]) !== null && _a !== void 0 ? _a : null;
  };
  Reflect2.getOwnMetaData = function(metaTag, target, scheme) {
    if (scheme === void 0) {
      scheme = BASE_SCHEME;
    }
    return Reflect2.getMetadata(metaTag, target, selfKey, scheme);
  };
  Reflect2.defineMetaData = function(metaTag, data, target, propertyKey, scheme) {
    if (scheme === void 0) {
      scheme = BASE_SCHEME;
    }
    var a = Reflect2.getOrCreateDefinedMetaData(target, scheme, true);
    if (!a[propertyKey])
      a[propertyKey] = {};
    a[propertyKey][metaTag] = data;
  };
  Reflect2.defineOwnMetaData = function(metaTag, data, target, scheme) {
    if (scheme === void 0) {
      scheme = BASE_SCHEME;
    }
    return Reflect2.defineMetaData(metaTag, data, target, selfKey, scheme);
  };
  Reflect2.hasMetaData = function(metaTag, target, key, scheme) {
    var _a;
    if (scheme === void 0) {
      scheme = BASE_SCHEME;
    }
    var a = Reflect2.getOrCreateDefinedMetaData(target, scheme);
    if (a == null)
      return false;
    if (!a[key])
      return false;
    return (_a = a[key][metaTag]) !== null && _a !== void 0 ? _a : false;
  };
  Reflect2.hasOwnMetaData = function(metaTag, target, scheme) {
    if (scheme === void 0) {
      scheme = BASE_SCHEME;
    }
    return Reflect2.hasMetaData(metaTag, target, selfKey, scheme);
  };
  Reflect2.getAllMeta = function(obj, scheme) {
    if (scheme) {
      return Reflect2.getOrCreateDefinedMetaData(obj, scheme);
    } else {
      return Reflect2.getOrCreateAllMetaData(obj, true);
    }
  };
  return Reflect2;
}();
function getMetadata(metaTag, target, propertyKey, scheme) {
  if (scheme === void 0) {
    scheme = BASE_SCHEME;
  }
  return Reflect$1.getMetadata(metaTag, target, propertyKey, scheme);
}
function getOwnMetaData(metaTag, target, scheme) {
  if (scheme === void 0) {
    scheme = BASE_SCHEME;
  }
  return Reflect$1.getOwnMetaData(metaTag, target, scheme);
}
function setMetadata(metaTag, value2, target, propertyKey, scheme) {
  if (scheme === void 0) {
    scheme = BASE_SCHEME;
  }
  Reflect$1.defineMetaData(metaTag, value2, target, propertyKey, scheme);
}
function setOwnMetaData(metaTag, target, value2, scheme) {
  if (scheme === void 0) {
    scheme = BASE_SCHEME;
  }
  Reflect$1.defineOwnMetaData(metaTag, value2, target, scheme);
}
function getOwnMetaDataKeys(target, scheme) {
  if (scheme === void 0) {
    scheme = BASE_SCHEME;
  }
  var keys = Reflect$1.getOwnMetaDataKeys(target, scheme);
  return keys;
}
function getMetaDataKeys(target, key, scheme) {
  if (scheme === void 0) {
    scheme = BASE_SCHEME;
  }
  var keys = Reflect$1.getMetadataKeys(target, key, scheme);
  return keys;
}
function hasMetaData(target, scheme) {
  var a = Reflect$1.getAllMeta(target, scheme);
  if (!a)
    return false;
  return true;
}
function getPrototype(obj) {
  return Reflect$1.getPrototype(obj);
}
function setPrototype(obj, prototype) {
  Reflect$1.setPrototype(obj, prototype);
  return Reflect$1.getPrototype(obj) == prototype;
}
function cleanNonAccesibleSettings(option) {
  if (!option)
    return {};
  if (!option.scheme || option.scheme.length == 0)
    option.scheme = [BASE_SCHEME];
  option.mappingFunctions = null;
  option.type = null;
  option.isArray = null;
  option.forceBaseType = null;
  return option;
}
function JsonProperty(option) {
  return function(target, propertyKey) {
    var schemes;
    if (!(option === null || option === void 0 ? void 0 : option.scheme)) {
      schemes = [BASE_SCHEME];
    } else if (Array.isArray(option.scheme)) {
      if (option.scheme.length == 0) {
        schemes = [BASE_SCHEME];
      } else {
        schemes = option.scheme;
      }
    } else {
      schemes = [option.scheme];
    }
    for (var i = 0; i < schemes.length; i++) {
      var scheme = schemes[i];
      setMetadata(JSON_TAGS.JSON_PROPERTY, true, target, propertyKey, scheme);
      if (!option) {
        return;
      }
      if (option.forceBaseType) {
        switch (option.forceBaseType) {
          case JSON_BASETYPES.string:
          case JSON_BASETYPES.number:
          case JSON_BASETYPES.bool:
            setMetadata(JSON_TAGS.JSON_PROPERTY_FORCE_BASE_TYPE, option.forceBaseType, target, propertyKey, scheme);
        }
      }
      if (option.isArray) {
        setMetadata(JSON_TAGS.JSON_PROPERTY_FORCE_ARRAY, true, target, propertyKey, scheme);
      }
      if (option.name) {
        setMetadata(JSON_TAGS.JSON_PROPERTY_NAME_MAP_IN, propertyKey, target, option.name, scheme);
        setMetadata(JSON_TAGS.JSON_PROPERTY_NAME_MAP_OUT, option.name, target, propertyKey, scheme);
      }
      if (option.mappingFunctions) {
        setMetadata(JSON_TAGS.JSON_PROPERTY_FUNC_MAP_IN, option.mappingFunctions.in, target, propertyKey, scheme);
        setMetadata(JSON_TAGS.JSON_PROPERTY_FUNC_MAP_OUT, option.mappingFunctions.out, target, propertyKey, scheme);
      }
      if (option.type) {
        setMetadata(JSON_TAGS.JSON_PROPERTY_TYPED, option.type, target, propertyKey, scheme);
      }
      if (option.skipForceType) {
        setMetadata(JSON_TAGS.JSON_PROPERTY_TYPED_SKIP_FORCED, true, target, propertyKey, scheme);
      }
    }
  };
}
function JsonNumber(option) {
  option = cleanNonAccesibleSettings(option);
  option.forceBaseType = JSON_BASETYPES.number;
  return JsonProperty(option);
}
function JsonString(option) {
  option = cleanNonAccesibleSettings(option);
  option.forceBaseType = JSON_BASETYPES.string;
  return JsonProperty(option);
}
function JsonBoolean(option) {
  option = cleanNonAccesibleSettings(option);
  option.forceBaseType = JSON_BASETYPES.bool;
  return JsonProperty(option);
}
function JsonClassTyped(type, option) {
  option = cleanNonAccesibleSettings(option);
  option.type = type;
  return JsonProperty(option);
}
function JsonArrayClassTyped(type, option) {
  option = cleanNonAccesibleSettings(option);
  option.isArray = true;
  option.type = type;
  return JsonProperty(option);
}
function JsonMappingRecordInArrayOut(option) {
  var type = option.type;
  option = cleanNonAccesibleSettings(option !== null && option !== void 0 ? option : {});
  var outfunc = function(col, s) {
    return Object.values(col).map(function(p) {
      return s(p);
    });
  };
  var infunc = function(col, d) {
    var r = {};
    col.map(function(p) {
      var o = d(p);
      var v = o[option.KeyPropertyName];
      if (typeof v == "function") {
        try {
          v = o[option.KeyPropertyName]();
          if (v === null || v === void 0) {
            throw new Error("after calling function ".concat(option.KeyPropertyName, " key value was '").concat(v, "' "));
          }
        } catch (e) {
          var messageAddon = v.length > 0 ? ", Note that message must have 0 Arguments, that arent either optional or have default values" : "";
          var message = "Something went wrong with callign method '".concat(option.KeyPropertyName, "'").concat(messageAddon);
          throw new Error(message);
        }
      }
      r[v] = o;
    });
    return r;
  };
  if (type) {
    option.type = type;
  }
  option.mappingFunctions = {
    out: outfunc,
    in: infunc
  };
  return JsonProperty(option);
}
function cleanObjectOptions(option) {
  if (!option)
    option = {};
  if (!option.onAfterDeSerialization) {
    option.onAfterDeSerialization = function(o) {
    };
  }
  if (!option.scheme || option.scheme.length == 0)
    option.scheme = [BASE_SCHEME];
  return option;
}
function JsonObject(option) {
  option = cleanObjectOptions(option);
  return function(target) {
    var schemes = option === null || option === void 0 ? void 0 : option.scheme;
    if (!schemes || schemes.length == 0)
      schemes = [BASE_SCHEME];
    for (var i = 0; i < schemes.length; i++) {
      var scheme = schemes[i];
      if (option.onAfterDeSerialization)
        setOwnMetaData(JSON_TAGS.JSON_OBJECT_ON_AFTER_DE_SERIALIZATION, target, option.onAfterDeSerialization, scheme);
      if (option.onAfterSerialization_beforeString)
        setOwnMetaData(JSON_TAGS.JSON_OBJECT_ON_AFTER_SERIALIZATION_BEFORE_STRING, target, option.onAfterSerialization_beforeString, scheme);
      if (option.onAfterSerialization)
        setOwnMetaData(JSON_TAGS.JSON_OBJECT_ON_AFTER_SERIALIZATION, target, option.onAfterSerialization, scheme);
      if (option.onBeforeSerialization)
        setOwnMetaData(JSON_TAGS.JSON_OBJECT_ON_BEFORE_SERIALIZATION, target, option.onBeforeSerialization, scheme);
      if (option.onBeforeDeSerialization)
        setOwnMetaData(JSON_TAGS.JSON_OBJECT_ON_BEFORE_DE_SERIALIZATION, target, option.onBeforeDeSerialization, scheme);
    }
  };
}
var JSONHandler = function() {
  function JSONHandler2() {
  }
  JSONHandler2.serialize = function(obj, scheme) {
    if (scheme === void 0) {
      scheme = BASE_SCHEME;
    }
    var o = JSONHandler2.serializeRaw(obj, scheme);
    var str = JSON.stringify(o);
    var ObjectMeta = getOwnMetaDataKeys(obj);
    if (ObjectMeta.includes(JSON_TAGS.JSON_OBJECT_ON_AFTER_SERIALIZATION)) {
      var f = getOwnMetaData(JSON_TAGS.JSON_OBJECT_ON_AFTER_SERIALIZATION, obj, scheme);
      if (f)
        str = f(str);
    }
    return str;
  };
  JSONHandler2.serializeRaw = function(obj, scheme, parentName) {
    if (scheme === void 0) {
      scheme = BASE_SCHEME;
    }
    if (parentName === void 0) {
      parentName = "FIRST";
    }
    if (!obj) {
      return obj;
    }
    var type = typeof obj;
    switch (type) {
      case "string":
        return JSONHandler2.deserializeAndForceSimple("string", obj, scheme);
      case "boolean":
      case "number":
        return obj;
    }
    if (!hasMetaData(obj, scheme)) {
      try {
        return obj;
      } catch (e) {
        return {};
      }
    }
    var result = {};
    var ObjectMeta = getOwnMetaDataKeys(obj);
    if (ObjectMeta.includes(JSON_TAGS.JSON_OBJECT_ON_BEFORE_SERIALIZATION)) {
      var f = getOwnMetaData(JSON_TAGS.JSON_OBJECT_ON_BEFORE_SERIALIZATION, obj, scheme);
      if (f)
        f(obj);
    }
    var propertyNames;
    propertyNames = Object.getOwnPropertyNames(obj);
    var _loop_1 = function(i2) {
      var key = propertyNames[i2];
      var meta = getMetaDataKeys(obj, key, scheme);
      if (!meta.includes(JSON_TAGS.JSON_PROPERTY)) {
        return "continue";
      }
      var PropertyName = key;
      if (meta.includes(JSON_TAGS.JSON_PROPERTY_NAME_MAP_OUT)) {
        PropertyName = getMetadata(JSON_TAGS.JSON_PROPERTY_NAME_MAP_OUT, obj, key, scheme);
      }
      var typedconversion = function(v, ser) {
        return v;
      };
      var skipForceType = false;
      if (meta.includes(JSON_TAGS.JSON_PROPERTY_TYPED_SKIP_FORCED)) {
        skipForceType = getMetadata(JSON_TAGS.JSON_PROPERTY_TYPED_SKIP_FORCED, obj, key, scheme);
      }
      if (meta.includes(JSON_TAGS.JSON_PROPERTY_TYPED) && !skipForceType) {
        typedconversion = function(v, ser) {
          var during = getMetadata(JSON_TAGS.JSON_PROPERTY_TYPED, obj, key, scheme).prototype;
          var before = getPrototype(v);
          setPrototype(v, during);
          var r = ser(v);
          setPrototype(v, before);
          return r;
        };
      }
      var out = null;
      if (meta.includes(JSON_TAGS.JSON_PROPERTY_FUNC_MAP_OUT)) {
        var outFunction_1 = getMetadata(JSON_TAGS.JSON_PROPERTY_FUNC_MAP_OUT, obj, key, scheme);
        var _outF = function(o1) {
          return outFunction_1(o1, function(o2) {
            return typedconversion(o2, function(o3) {
              return JSONHandler2.serializeRaw(o3, scheme, parentName + ":" + key);
            });
          });
        };
        out = _outF(obj[key]);
      } else if (meta.includes(JSON_TAGS.JSON_PROPERTY_FORCE_ARRAY)) {
        out = [];
        if (obj[key]) {
          if (Array.isArray(obj[key])) {
            var _loop_2 = function(j2) {
              var e = typedconversion(obj[key][j2], function(o) {
                return JSONHandler2.serializeRaw(o, scheme, parentName + ":[" + j2 + "]:" + key);
              });
              out.push(e);
            };
            for (var j = 0; j < obj[key].length; j++) {
              _loop_2(j);
            }
          } else {
            out.push(typedconversion(obj[key], function(o) {
              return JSONHandler2.serializeRaw(o, scheme, parentName + ":" + key);
            }));
          }
        }
      } else {
        out = typedconversion(obj[key], function(o) {
          return JSONHandler2.serializeRaw(o, scheme, parentName + ":" + key);
        });
      }
      if (meta.includes(JSON_TAGS.JSON_PROPERTY_FORCE_BASE_TYPE)) {
        var typekey_1 = getMetadata(JSON_TAGS.JSON_PROPERTY_FORCE_BASE_TYPE, obj, key, scheme);
        var convFunc = function(e) {
          return JSONHandler2.deserializeAndForceSimple(typekey_1, e, scheme);
        };
        if (meta.includes(JSON_TAGS.JSON_PROPERTY_FORCE_ARRAY)) {
          var temp = out;
          var newout = [];
          for (var i_1 = 0; i_1 < temp.length; i_1++) {
            newout.push(convFunc(temp[i_1]));
          }
          out = newout;
        } else {
          out = convFunc(obj[key]);
        }
      }
      result[PropertyName] = out;
    };
    for (var i = 0; i < propertyNames.length; i++) {
      _loop_1(i);
    }
    if (ObjectMeta.includes(JSON_TAGS.JSON_OBJECT_ON_AFTER_SERIALIZATION_BEFORE_STRING)) {
      var f = getOwnMetaData(JSON_TAGS.JSON_OBJECT_ON_AFTER_SERIALIZATION_BEFORE_STRING, obj, scheme);
      if (f)
        f(result);
    }
    return result;
  };
  JSONHandler2.deserialize = function(target, json, scheme, writeOut) {
    if (scheme === void 0) {
      scheme = BASE_SCHEME;
    }
    if (!writeOut) {
      writeOut = NoOutput;
    }
    var type = typeof json;
    if (type == "string") {
      json = JSON.parse(json);
    }
    switch (type) {
      case "boolean":
      case "number":
        writeOut.outError("Cannot derserialize type of " + type);
        return;
    }
    if (Array.isArray(json)) {
      var arr = [];
      for (var i = 0; i < json.length; i++) {
        arr.push(this.deserializeRaw(target, json[i], scheme));
      }
      return arr;
    } else {
      return this.deserializeRaw(target, json, scheme);
    }
  };
  JSONHandler2.deserializeAndForceSimple = function(typekey, obj, scheme) {
    if (scheme === void 0) {
      scheme = BASE_SCHEME;
    }
    var out = obj;
    var convFunc = function(e) {
      return e;
    };
    switch (typekey) {
      case JSON_BASETYPES.bool:
        convFunc = function(input) {
          return Boolean(input);
        };
        break;
      case JSON_BASETYPES.string:
        if (obj == null)
          return "";
        if (typeof obj == "string") {
          return obj;
        } else if (Array.isArray(obj)) {
          var str = JSON.stringify(obj);
          return str;
        } else if (typeof obj == "object") {
          if (hasMetaData(obj, scheme)) {
            return JSONHandler2.serialize(obj, scheme);
          } else {
            return JSON.stringify(obj);
          }
        }
        convFunc = function(input) {
          return String(input);
        };
        break;
      case JSON_BASETYPES.number:
        if (obj == null) {
          return 0;
        }
        if (typeof obj == "object") {
          return 1;
        }
        convFunc = function(e) {
          var numberValue = Number(e);
          return isNaN(numberValue) ? 0 : numberValue;
        };
        break;
    }
    out = convFunc(out);
    return out;
  };
  JSONHandler2.deserializeRaw = function(target, obj, scheme, parentName) {
    if (scheme === void 0) {
      scheme = BASE_SCHEME;
    }
    if (!obj) {
      return obj;
    }
    var result = new target();
    var prototype = target.prototype;
    var ObjectMeta = getOwnMetaDataKeys(target);
    if (ObjectMeta.includes(JSON_TAGS.JSON_OBJECT_ON_BEFORE_DE_SERIALIZATION)) {
      var f = getOwnMetaData(JSON_TAGS.JSON_OBJECT_ON_BEFORE_DE_SERIALIZATION, result, scheme);
      if (f)
        result = f(result, obj);
      if (!JSONHandler2.areSamePrototypes(result, target)) {
        target = getPrototype(result).constructor;
      }
    }
    var propertyNames = Object.getOwnPropertyNames(obj);
    var _loop_3 = function(i2) {
      var key = propertyNames[i2];
      var inKey = key;
      var meta = getMetaDataKeys(target, key, scheme);
      var PropertyName = key;
      if (meta.length == 0) {
        return "continue";
      }
      if (meta.includes(JSON_TAGS.JSON_PROPERTY_NAME_MAP_IN)) {
        key = getMetadata(JSON_TAGS.JSON_PROPERTY_NAME_MAP_IN, prototype, key, scheme);
        meta = getMetaDataKeys(target, key, scheme);
        PropertyName = key;
      }
      var out = null;
      var constr = getMetadata(JSON_TAGS.JSON_PROPERTY_TYPED, prototype, key, scheme);
      if (meta.includes(JSON_TAGS.JSON_PROPERTY_FUNC_MAP_IN)) {
        var inFunction = getMetadata(JSON_TAGS.JSON_PROPERTY_FUNC_MAP_IN, prototype, key, scheme);
        if (constr) {
          out = inFunction(obj[inKey], function(obj2) {
            var res2 = JSONHandler2.deserializeRaw(constr, obj2, scheme, key);
            return res2;
          });
        } else {
          out = inFunction(obj[inKey], function(obj2) {
            return obj2;
          });
        }
      } else if (meta.includes(JSON_TAGS.JSON_PROPERTY_FORCE_ARRAY)) {
        var convert_1 = function(e2) {
          return e2;
        };
        if (constr) {
          convert_1 = function(e2) {
            return JSONHandler2.deserializeRaw(constr, e2, scheme, key);
          };
        }
        var convert2 = function(e2, typekey2) {
          return convert_1(e2);
        };
        if (meta.includes(JSON_TAGS.JSON_PROPERTY_FORCE_BASE_TYPE)) {
          convert2 = function(e2, typekey2) {
            return JSONHandler2.deserializeAndForceSimple(typekey2, e2);
          };
        }
        out = [];
        var typekey = getMetadata(JSON_TAGS.JSON_PROPERTY_FORCE_BASE_TYPE, prototype, key, scheme);
        for (var j = 0; j < obj[inKey].length; j++) {
          var e = obj[inKey][j];
          var r = convert2(e, typekey);
          out.push(r);
        }
      } else {
        if (constr) {
          out = JSONHandler2.deserializeRaw(constr, obj[inKey], scheme, key);
        } else if (meta.includes(JSON_TAGS.JSON_PROPERTY_FORCE_BASE_TYPE)) {
          var typeKey = getMetadata(JSON_TAGS.JSON_PROPERTY_FORCE_BASE_TYPE, target, key, scheme);
          out = JSONHandler2.deserializeAndForceSimple(typeKey, obj[inKey]);
        } else {
          out = obj[inKey];
        }
      }
      result[PropertyName] = out;
    };
    for (var i = 0; i < propertyNames.length; i++) {
      _loop_3(i);
    }
    ObjectMeta = getOwnMetaDataKeys(result);
    if (ObjectMeta.includes(JSON_TAGS.JSON_OBJECT_ON_AFTER_DE_SERIALIZATION)) {
      var f = getOwnMetaData(JSON_TAGS.JSON_OBJECT_ON_AFTER_DE_SERIALIZATION, result, scheme);
      if (f)
        f(result);
    }
    return result;
  };
  JSONHandler2.changePrototype = function(target, source) {
    var prototype = getPrototype(source);
    setPrototype(target, prototype);
  };
  JSONHandler2.areSamePrototypes = function(target, source) {
    var prototype1 = getPrototype(source);
    var prototype2 = getPrototype(target);
    return prototype1 == prototype2;
  };
  return JSONHandler2;
}();
function getAugmentedNamespace(n) {
  var f = n.default;
  if (typeof f == "function") {
    var a = function() {
      return f.apply(this, arguments);
    };
    a.prototype = f.prototype;
  } else
    a = {};
  Object.defineProperty(a, "__esModule", { value: true });
  Object.keys(n).forEach(function(k) {
    var d = Object.getOwnPropertyDescriptor(n, k);
    Object.defineProperty(a, k, d.get ? d : {
      enumerable: true,
      get: function() {
        return n[k];
      }
    });
  });
  return a;
}
var dist = {};
var KeyManager$1 = {};
Object.defineProperty(KeyManager$1, "__esModule", { value: true });
KeyManager$1.keyManagerInstance = KeyManager$1.KeyManager = void 0;
var KeyManager = function() {
  function KeyManager2() {
    this.keyCounter = 0;
  }
  KeyManager2.prototype.getNewKey = function() {
    var num = this.keyCounter++;
    return num.toString(16);
  };
  return KeyManager2;
}();
KeyManager$1.KeyManager = KeyManager;
KeyManager$1.keyManagerInstance = new KeyManager();
var TTRPGSystemGraphModel$1 = {};
const require$$0 = /* @__PURE__ */ getAugmentedNamespace(tslib_es6$1);
var IOutputHandler = {};
Object.defineProperty(IOutputHandler, "__esModule", { value: true });
IOutputHandler.newOutputHandler = void 0;
function newOutputHandler() {
  var a = {
    outError: function(msg) {
      console.error(msg);
    },
    outLog: function(msg) {
      console.log(msg);
    }
  };
  return a;
}
IOutputHandler.newOutputHandler = newOutputHandler;
var GrobNodte = {};
var AGraphItem$1 = {};
Object.defineProperty(AGraphItem$1, "__esModule", { value: true });
AGraphItem$1.AGraphItem = void 0;
var KeyManager_1 = KeyManager$1;
var keyManager = new KeyManager_1.KeyManager();
var AGraphItem = function() {
  function AGraphItem2(name, key) {
    if (name === void 0) {
      name = "";
    }
    if (key === void 0) {
      key = "";
    }
    this.name = name;
    this._key = key + keyManager.getNewKey();
  }
  AGraphItem2.prototype.getName = function() {
    return this.name;
  };
  AGraphItem2.prototype.setName = function(name) {
    this.name = name;
  };
  AGraphItem2.prototype.getKey = function() {
    return this._key;
  };
  return AGraphItem2;
}();
AGraphItem$1.AGraphItem = AGraphItem;
Object.defineProperty(GrobNodte, "__esModule", { value: true });
GrobNodte.GrobDerivedNode = GrobNodte.GrobFixedNode = GrobNodte.GrobNode = GrobNodte.GrobDerivedOrigin = void 0;
var tslib_1$3 = require$$0;
var AGraphItem_1$2 = AGraphItem$1;
var grobDerivedSymbolRegex = /@[a-zA-Z]/g;
var GrobDerivedOrigin = function() {
  function GrobDerivedOrigin2() {
    this.standardValue = 1;
  }
  GrobDerivedOrigin2.UnkownLocationKey = "unknown.unknown.unknown";
  return GrobDerivedOrigin2;
}();
GrobNodte.GrobDerivedOrigin = GrobDerivedOrigin;
var GrobNode = function(_super2) {
  tslib_1$3.__extends(GrobNode2, _super2);
  function GrobNode2(name, keystart, parent) {
    var _this = _super2.call(this, name, keystart) || this;
    _this.dependencies = {};
    _this.dependents = {};
    _this.updateListeners = {};
    if (parent)
      _this.parent = parent;
    return _this;
  }
  GrobNode2.getTypeString = function() {
    return "Nodte<T extends Nodte<T>>";
  };
  GrobNode2.prototype.addDependent = function(node) {
    var key = node.getKey();
    if (this.dependents[key]) {
      return true;
    }
    this.dependents[key] = node;
    return true;
  };
  GrobNode2.prototype.removeDependent = function(node) {
    delete this.dependents[node.getKey()];
    return this.dependents[node.getKey()] == null;
  };
  GrobNode2.prototype.getDependents = function() {
    var _a;
    return (_a = Object.values(this.dependents)) !== null && _a !== void 0 ? _a : [];
  };
  GrobNode2.prototype.getDependencies = function() {
    var _a;
    return (_a = Object.values(this.dependencies)) !== null && _a !== void 0 ? _a : [];
  };
  GrobNode2.prototype.getLocationKey = function() {
    var segs = this.getLocationKeySegments();
    return segs.join(".");
  };
  GrobNode2.prototype.getLocationKeySegments = function() {
    var _a, _b, _c, _d, _e, _f;
    var seg = ["", "", ""];
    seg[0] = (_c = (_b = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.getName()) !== null && _c !== void 0 ? _c : "unknown";
    seg[1] = (_e = (_d = this.parent) === null || _d === void 0 ? void 0 : _d.getName()) !== null && _e !== void 0 ? _e : "unknown";
    seg[2] = (_f = this.getName()) !== null && _f !== void 0 ? _f : "unknown";
    return seg;
  };
  GrobNode2.prototype.update = function() {
    var _this = this;
    this._update();
    Object.keys(this.updateListeners).forEach(function(key) {
      _this.updateListeners[key]();
    });
    return true;
  };
  GrobNode2.prototype.dispose = function() {
    for (var key in this.dependencies) {
      var curr = this.dependencies[key];
      curr.removeDependent(this);
    }
    for (var key in this.dependents) {
      var curr = this.dependents[key];
      curr.nullifyDependency(this);
    }
    this.parent = null;
    this.name = null;
  };
  GrobNode2.prototype.setName = function(name) {
    var oldname = this.getName();
    _super2.prototype.setName.call(this, name);
    this.parent.update_node_name(oldname, name);
    this.updateLocation(this.parent);
  };
  GrobNode2.prototype.updateLocation = function(parent) {
    this.parent = parent;
    for (var key in this.dependents) {
      var dep = this.dependents[key];
      dep.updateDependecysLocation(this);
    }
  };
  GrobNode2.prototype.updateDependecysLocation = function(dependency) {
  };
  GrobNode2.prototype.isValid = function() {
    return true;
  };
  GrobNode2.prototype.addUpdateListener = function(key, listener) {
    if (this.updateListeners[key] != void 0) {
      console.error("tried to add updatelistener to node with key:" + key + ". but there was already a listener using that key");
      return false;
    }
    this.updateListeners[key] = listener;
  };
  GrobNode2.prototype.removeUpdateListener = function(key) {
    delete this.updateListeners[key];
  };
  GrobNode2.prototype.removeAllUpdateListeners = function() {
    this.updateListeners = {};
  };
  return GrobNode2;
}(AGraphItem_1$2.AGraphItem);
GrobNodte.GrobNode = GrobNode;
var GrobFixedNode = function(_super2) {
  tslib_1$3.__extends(GrobFixedNode2, _super2);
  function GrobFixedNode2(name, parent) {
    var _this = _super2.call(this, name, "NF", parent) || this;
    _this.___value = 1;
    return _this;
  }
  GrobFixedNode2.prototype.getValue = function() {
    return this.___value;
  };
  GrobFixedNode2.prototype.setValue = function(value2) {
    this.___value = value2;
    for (var key in this.dependents) {
      var curr = this.dependents[key];
      curr.update();
    }
  };
  GrobFixedNode2.getTypeString = function() {
    return "fixedNode";
  };
  GrobFixedNode2.prototype.getTypeString = function() {
    return GrobFixedNode2.getTypeString();
  };
  GrobFixedNode2.prototype.addDependency = function(node) {
    return false;
  };
  GrobFixedNode2.prototype.removeDependency = function(node) {
    return false;
  };
  GrobFixedNode2.prototype.nullifyDependency = function(node) {
    return false;
  };
  GrobFixedNode2.prototype._update = function() {
  };
  return GrobFixedNode2;
}(GrobNode);
GrobNodte.GrobFixedNode = GrobFixedNode;
var GrobDerivedNode = function(_super) {
  tslib_1$3.__extends(GrobDerivedNode, _super);
  function GrobDerivedNode(name, parent) {
    var _this = _super.call(this, name, "ND", parent) || this;
    _this.calc = "@a";
    _this.origins = [];
    _this._value = NaN;
    return _this;
  }
  GrobDerivedNode.prototype.getValue = function() {
    return this._value;
  };
  GrobDerivedNode.prototype.setValue = function(value2) {
    this._value = value2;
  };
  GrobDerivedNode.getTypeString = function() {
    return "derivedNode";
  };
  GrobDerivedNode.prototype.getTypeString = function() {
    return GrobDerivedNode.getTypeString();
  };
  GrobDerivedNode.prototype.addDependency = function(node) {
    var key = node.getKey();
    this.dependencies[key] = node;
    node.addDependent(this);
    return true;
  };
  GrobDerivedNode.prototype.removeDependency = function(node) {
    var key = node.getKey();
    if (this.dependencies[key]) {
      delete this.dependencies[key];
      node.removeDependent(this);
    }
    for (var i = 0; i < this.origins.length; i++) {
      var orig = this.origins[i];
      if (orig.origin != null && orig.origin.getKey() == key) {
        orig.origin = null;
      }
    }
    return this.dependencies[key] == null;
  };
  GrobDerivedNode.prototype.nullifyDependency = function(node) {
    var key = node.getKey();
    var orig = this.origins.find(function(p) {
      var _a;
      return ((_a = p.origin) === null || _a === void 0 ? void 0 : _a.getKey()) == key;
    });
    if (orig) {
      orig.origin = null;
      orig.originKey = GrobDerivedOrigin.UnkownLocationKey;
    }
    return this.removeDependency(node);
  };
  GrobDerivedNode.prototype.setOrigin = function(symbol, node, standardValue) {
    var _a, _b;
    if (standardValue === void 0) {
      standardValue = null;
    }
    var origin = this.origins.find(function(p) {
      return p.symbol == symbol;
    });
    if (!origin) {
      return false;
    }
    if (origin.origin) {
      this.removeDependency(origin.origin);
    }
    var nodeKey = (_a = node === null || node === void 0 ? void 0 : node.getTypeString()) !== null && _a !== void 0 ? _a : "";
    if (!["derivedNode", "fixedNode"].find(function(p) {
      return p == nodeKey;
    })) {
      node = null;
    }
    if (node) {
      this.addDependency(node);
    }
    origin.origin = node;
    origin.standardValue = (_b = standardValue !== null && standardValue !== void 0 ? standardValue : origin.standardValue) !== null && _b !== void 0 ? _b : 1;
    if (origin.origin)
      origin.originKey = origin.origin.getLocationKey();
    if (this.isValid()) {
      this.recalculate(false);
    }
    return true;
  };
  GrobDerivedNode.prototype.isValid = function() {
    var hadNullOrigin = false;
    this.origins.forEach(function(o) {
      if (!o.origin) {
        hadNullOrigin = true;
      }
    });
    if (hadNullOrigin) {
      return false;
    }
    var originsWithLinks = this.origins.filter(function(p) {
      return p.origin != null;
    });
    if (originsWithLinks.length != this.getDependencies().length) {
      return false;
    }
    return true;
  };
  GrobDerivedNode.prototype.updateOrigins = function() {
    var originRes = this.parseCalculationToOrigins(this.calc);
    if (originRes) {
      var symbolsToRem_1 = originRes.symbolsToRem;
      var symbolsToAdd = originRes.symbolsToAdd;
      if (symbolsToRem_1.length != 0) {
        this.origins = this.origins.filter(function(p) {
          return !symbolsToRem_1.includes(p.symbol);
        });
      }
      if (symbolsToAdd.length != 0) {
        for (var i = 0; i < symbolsToAdd.length; i++) {
          var orig = new GrobDerivedOrigin();
          orig.symbol = symbolsToAdd[i];
          orig.standardValue = 1;
          orig.origin = null;
          orig.originKey = GrobDerivedOrigin.UnkownLocationKey;
          this.origins.push(orig);
        }
      }
      var oldDependencies_1 = {};
      this.getDependencies().forEach(function(p) {
        return oldDependencies_1[p.getName()] = p;
      });
      var newDependencies_1 = {};
      this.origins.forEach(function(p) {
        var _a;
        if (p.origin != null) {
          newDependencies_1[(_a = p.origin) === null || _a === void 0 ? void 0 : _a.getName()] = p.origin;
        }
      });
      for (var key in oldDependencies_1) {
        if (!newDependencies_1[key]) {
          this.removeDependency(oldDependencies_1[key]);
        }
      }
      return { added: symbolsToAdd, removed: symbolsToRem_1.length };
    } else {
      return { added: 0, removed: 0 };
    }
  };
  GrobDerivedNode.prototype.setCalc = function(calc, updateOrigins) {
    if (updateOrigins === void 0) {
      updateOrigins = true;
    }
    this._value = NaN;
    var testCalc = this.testCalculate(calc);
    if (testCalc == null || !testCalc.success) {
      return false;
    }
    this.calc = calc;
    if (updateOrigins) {
      this.updateOrigins();
    }
    if (this.isValid()) {
      this.recalculate(false);
    }
    return true;
  };
  GrobDerivedNode.prototype.parseCalculationToOrigins = function(calc) {
    var _a;
    var calcValue = calc;
    var symbols2 = (_a = calcValue.match(grobDerivedSymbolRegex)) !== null && _a !== void 0 ? _a : [];
    symbols2 = Array.from(new Set(symbols2));
    var existingKeysArray = this.origins.map(function(p) {
      return p.symbol;
    });
    var symbolsToAdd = symbols2.filter(function(p) {
      return !existingKeysArray.includes(p);
    });
    var symbolsToRem = existingKeysArray.filter(function(p) {
      return !symbols2.includes(p);
    });
    return { symbolsToRem, symbolsToAdd, totalSymbols: symbols2 };
  };
  GrobDerivedNode.staticParseCalculationToOrigins = function(calc) {
    var _a;
    var calcValue = calc;
    var symbols2 = (_a = calcValue.match(grobDerivedSymbolRegex)) !== null && _a !== void 0 ? _a : [];
    symbols2 = Array.from(new Set(symbols2));
    return symbols2;
  };
  GrobDerivedNode.prototype.recalculate = function(useTempValues) {
    if (useTempValues === void 0) {
      useTempValues = false;
    }
    var rec2 = useTempValues ? Object.fromEntries(this.origins.map(function(p) {
      return [p.symbol, p.standardValue];
    })) : Object.fromEntries(this.origins.map(function(p) {
      var _a;
      return [p.symbol, (_a = p.origin) === null || _a === void 0 ? void 0 : _a.getValue()];
    }));
    var statement2 = this.calc;
    var res2 = this._recalculate(rec2, statement2);
    this._value = res2.value;
    return res2.success;
  };
  GrobDerivedNode.prototype._recalculate = function(rec2, statement2) {
    if (rec2 === void 0) {
      rec2 = {};
    }
    return GrobDerivedNode.recalculate(rec2, statement2);
  };
  GrobDerivedNode.recalculate = function(rec, statement) {
    if (rec === void 0) {
      rec = {};
    }
    var symbols = statement.match(grobDerivedSymbolRegex);
    var _statement = statement;
    symbols === null || symbols === void 0 ? void 0 : symbols.forEach(function(key) {
      var v = rec[key];
      _statement = _statement.replace(key, v + "");
    });
    var recalcSuccess = false;
    var value = 0;
    try {
      var res = eval(_statement);
      if (typeof res === "number") {
        recalcSuccess = true;
        value = res;
      } else {
        recalcSuccess = false;
        value = NaN;
      }
    } catch (e) {
      recalcSuccess = false;
      value = NaN;
    }
    return { success: recalcSuccess, value };
  };
  GrobDerivedNode.prototype.testCalculate = function(statement2) {
    var symbols2 = statement2.match(grobDerivedSymbolRegex);
    var rec2 = symbols2 ? Object.fromEntries(symbols2.map(function(s) {
      return [s, 1];
    })) : {};
    var res2 = this._recalculate(rec2, statement2);
    return res2;
  };
  GrobDerivedNode.testCalculate = function(statement2, symbolsToValue) {
    if (symbolsToValue === void 0) {
      symbolsToValue = {};
    }
    var symbols2 = statement2.match(grobDerivedSymbolRegex);
    function mapValueToSymbol(s, m) {
      if (m[s]) {
        return m[s];
      }
      return 1;
    }
    var rec2 = symbols2 ? Object.fromEntries(symbols2.map(function(s) {
      return [s, mapValueToSymbol(s, symbolsToValue)];
    })) : {};
    var res2 = GrobDerivedNode.recalculate(rec2, statement2);
    return res2;
  };
  GrobDerivedNode.prototype._update = function() {
    if (!this.isValid()) {
      console.error("Node isent Valid ".concat(this.getName(), " ").concat(this.getLocationKey(), " Stopping update"));
      return false;
    }
    this.recalculate();
    var success = true;
    for (var k in this.dependents) {
      var dep = this.dependents[k];
      success = success && dep.update();
    }
    return success;
  };
  GrobDerivedNode.prototype.updateDependecysLocation = function(dependency) {
    var orig = this.origins.find(function(p) {
      var _a;
      return ((_a = p.origin) === null || _a === void 0 ? void 0 : _a.getName()) == dependency.getName();
    });
    if (!orig)
      return;
    orig.originKey = dependency.getLocationKey();
  };
  return GrobDerivedNode;
}(GrobNode);
GrobNodte.GrobDerivedNode = GrobDerivedNode;
var TTRPGSystemGraphAbstractModel$1 = {};
var GrobCollection$1 = {};
Object.defineProperty(GrobCollection$1, "__esModule", { value: true });
GrobCollection$1.GrobCollection = void 0;
var tslib_1$2 = require$$0;
var AGraphItem_1$1 = AGraphItem$1;
var GrobCollection = function(_super2) {
  tslib_1$2.__extends(GrobCollection2, _super2);
  function GrobCollection2(name, parent) {
    var _this = _super2.call(this, name, "C") || this;
    _this.nodes_names = {};
    return _this;
  }
  GrobCollection2.prototype.getNodeNames = function() {
    return Object.keys(this.nodes_names);
  };
  GrobCollection2.prototype.getNodes = function() {
    return Object.values(this.nodes_names);
  };
  GrobCollection2.prototype.hasNode = function(name) {
    return this.nodes_names[name] ? true : false;
  };
  GrobCollection2.prototype.getNode = function(name) {
    var _a;
    return (_a = this.nodes_names[name]) !== null && _a !== void 0 ? _a : null;
  };
  GrobCollection2.prototype.addNode = function(node) {
    node.parent = this;
    this.nodes_names[node.getName()] = node;
    return true;
  };
  GrobCollection2.prototype.removeNode = function(node) {
    if (!node) {
      console.error('attempted to delete node "Null" ');
      return false;
    }
    var name = node.getName();
    var n = this.nodes_names[name];
    if (!n)
      return false;
    n.dispose();
    delete this.nodes_names[name];
    return this.nodes_names[name] == null;
  };
  GrobCollection2.prototype.update_node_name = function(oldName, newName) {
    if (oldName == newName)
      return;
    this.nodes_names[newName] = this.nodes_names[oldName];
    delete this.nodes_names[oldName];
  };
  GrobCollection2.prototype.setName = function(name) {
    var oldname = this.getName();
    if (oldname == name) {
      return;
    }
    _super2.prototype.setName.call(this, name);
    this.parent.update_collection_name(oldname, name);
    this.updateLocation(this.parent);
  };
  GrobCollection2.prototype.updateLocation = function(parent) {
    this.parent = parent;
    for (var name in this.nodes_names) {
      var curr = this.nodes_names[name];
      curr.updateLocation(this);
    }
  };
  GrobCollection2.prototype.dispose = function() {
    for (var name in this.nodes_names) {
      var curr = this.nodes_names[name];
      curr.dispose();
      delete this.nodes_names[name];
    }
    this.parent = null;
    this.name = null;
  };
  return GrobCollection2;
}(AGraphItem_1$1.AGraphItem);
GrobCollection$1.GrobCollection = GrobCollection;
var GrobGroup$1 = {};
Object.defineProperty(GrobGroup$1, "__esModule", { value: true });
GrobGroup$1.GrobGroup = void 0;
var tslib_1$1 = require$$0;
var AGraphItem_1 = AGraphItem$1;
var GrobGroup = function(_super2) {
  tslib_1$1.__extends(GrobGroup2, _super2);
  function GrobGroup2(name, parent) {
    var _this = _super2.call(this, name, "G") || this;
    _this.collections_names = {};
    return _this;
  }
  GrobGroup2.prototype.getCollectionsNames = function() {
    return Object.keys(this.collections_names);
  };
  GrobGroup2.prototype.hasCollection = function(name) {
    return this.collections_names[name] ? true : false;
  };
  GrobGroup2.prototype.getCollection = function(name) {
    return this.collections_names[name];
  };
  GrobGroup2.prototype.addCollection = function(collection) {
    collection.parent = this;
    this.collections_names[collection.getName()] = collection;
    return true;
  };
  GrobGroup2.prototype.removeCollection = function(collection) {
    var name = collection.getName();
    var c = this.collections_names[name];
    if (!c)
      return false;
    collection.dispose();
    delete this.collections_names[name];
    return this.collections_names[name] == null;
  };
  GrobGroup2.prototype.update_collection_name = function(oldName, newName) {
    this.collections_names[newName] = this.collections_names[oldName];
    delete this.collections_names[oldName];
  };
  GrobGroup2.prototype.setName = function(name) {
    _super2.prototype.setName.call(this, name);
    for (var name_1 in this.collections_names) {
      var curr = this.collections_names[name_1];
      curr.updateLocation(this);
    }
  };
  GrobGroup2.prototype.dispose = function() {
    for (var name in this.collections_names) {
      var curr = this.collections_names[name];
      curr.dispose();
      delete this.collections_names[name];
    }
    this.name = null;
  };
  return GrobGroup2;
}(AGraphItem_1.AGraphItem);
GrobGroup$1.GrobGroup = GrobGroup;
Object.defineProperty(TTRPGSystemGraphAbstractModel$1, "__esModule", { value: true });
TTRPGSystemGraphAbstractModel$1.TTRPGSystemGraphAbstractModel = void 0;
var GrobCollection_1 = GrobCollection$1;
var GrobGroup_1 = GrobGroup$1;
var IOutputHandler_1$1 = IOutputHandler;
var TTRPGSystemGraphAbstractModel = function() {
  function TTRPGSystemGraphAbstractModel2() {
    this.data = {};
  }
  TTRPGSystemGraphAbstractModel2.prototype.setOut = function(out) {
    this.out = out ? out : (0, IOutputHandler_1$1.newOutputHandler)();
  };
  TTRPGSystemGraphAbstractModel2.prototype._deleteGroup = function(group) {
    if (typeof group == "string") {
      var g_1 = this._getGroup(group);
      if (!g_1)
        return false;
      group = g_1;
    }
    var key = group.getName();
    var g = this.data[key];
    if (!g) {
      this.out.outError("tried to delete non existant group");
      return false;
    }
    group.dispose();
    delete this.data[key];
  };
  TTRPGSystemGraphAbstractModel2.prototype._createGroup = function(name) {
    if (this._hasGroup(name)) {
      this.out.outError("attempted to add new group, however group already existed");
      return null;
    }
    var gp = new GrobGroup_1.GrobGroup(name, this);
    this.data[gp.getName()] = gp;
    return gp;
  };
  TTRPGSystemGraphAbstractModel2.prototype._hasGroup = function(name) {
    for (var key in this.data) {
      if (this.data[key].getName() == name) {
        return true;
      }
    }
    return false;
  };
  TTRPGSystemGraphAbstractModel2.prototype._getGroup_key = function(key) {
    return this.data[key];
  };
  TTRPGSystemGraphAbstractModel2.prototype._getGroup = function(name) {
    for (var key in this.data) {
      if (this.data[key].getName() == name) {
        return this.data[key];
      }
    }
    return null;
  };
  TTRPGSystemGraphAbstractModel2.prototype._deleteCollection = function(collection) {
    if (!collection) {
      this.out.outError("tried to delete collection, but supplied collection was invalid");
    }
    var group = collection.parent;
    return group.removeCollection(collection);
  };
  TTRPGSystemGraphAbstractModel2.prototype._createCollection = function(group, name) {
    if (!group) {
      this.out.outError("tried to create collection, but supplied group was invalid");
    }
    if (group.hasCollection(name)) {
      this.out.outError("Collection by that name already existed in '".concat(group.getName(), "'"));
      return null;
    }
    var collection = new GrobCollection_1.GrobCollection(name, group);
    group.addCollection(collection);
    return collection;
  };
  TTRPGSystemGraphAbstractModel2.prototype._AddNode = function(collection, node) {
    if (!collection) {
      this.out.outError("tried to add node, but supplied collection was invalid");
    }
    return collection.addNode(node);
  };
  TTRPGSystemGraphAbstractModel2.prototype._deleteNode = function(node) {
    var col = node.parent;
    var r = col.removeNode(node);
    node.dispose();
    return r;
  };
  TTRPGSystemGraphAbstractModel2.prototype._addNodeDependency = function(node, dep) {
    var o1 = node.addDependency(dep);
    var o2 = dep.addDependent(node);
    if (!(o1 && o2)) {
      if (!o1) {
        this.out.outError("Could not add dependency ".concat(dep.getName(), ", on node ").concat(node.getName()));
      }
      if (!o2) {
        this.out.outError("Could not add dependent ".concat(node.getName(), ", on node ").concat(dep.getName()));
      }
      return false;
    }
    return true;
  };
  TTRPGSystemGraphAbstractModel2.prototype._removeNodeDependency = function(node, dep) {
    var o1 = node.removeDependency(dep);
    var o2 = dep.removeDependent(node);
    if (!(o1 && o2)) {
      if (!o1) {
        this.out.outError("Could not remove dependency ".concat(dep.getName(), ", on node ").concat(node.getName()));
      }
      if (!o2) {
        this.out.outError("Could not remove dependent ".concat(node.getName(), ", on node ").concat(dep.getName()));
      }
      return false;
    }
    return true;
  };
  return TTRPGSystemGraphAbstractModel2;
}();
TTRPGSystemGraphAbstractModel$1.TTRPGSystemGraphAbstractModel = TTRPGSystemGraphAbstractModel;
Object.defineProperty(TTRPGSystemGraphModel$1, "__esModule", { value: true });
TTRPGSystemGraphModel$1.TTRPGSystemGraphModel = void 0;
var tslib_1 = require$$0;
var IOutputHandler_1 = IOutputHandler;
var GrobNodte_1 = GrobNodte;
var TTRPGSystemGraphAbstractModel_1 = TTRPGSystemGraphAbstractModel$1;
var derived = "derived";
var fixed = "fixed";
var TTRPGSystemGraphModel = function(_super2) {
  tslib_1.__extends(TTRPGSystemGraphModel2, _super2);
  function TTRPGSystemGraphModel2() {
    var _this = _super2.call(this) || this;
    _this.setOut((0, IOutputHandler_1.newOutputHandler)());
    return _this;
  }
  TTRPGSystemGraphModel2.prototype.initAsNew = function() {
    this._createGroup("fixed");
    this._createGroup("derived");
  };
  TTRPGSystemGraphModel2.prototype.createCollection = function(group, name) {
    if (!this._hasGroup(group)) {
      this.out.outError("No group existed by name ".concat(group));
    }
    var grp = this._getGroup(group);
    if (!grp)
      return null;
    return this._createCollection(grp, name);
  };
  TTRPGSystemGraphModel2.prototype.createDerivedCollection = function(name) {
    return this.createCollection(derived, name);
  };
  TTRPGSystemGraphModel2.prototype.createFixedCollection = function(name) {
    return this.createCollection(fixed, name);
  };
  TTRPGSystemGraphModel2.prototype.createNode = function(group, col, name) {
    if (!this._hasGroup(group)) {
      this.out.outError("No group existed by name ".concat(group));
      return null;
    }
    if (this.hasNode(group, col, name)) {
      this.out.outError("Node by this name already existed ".concat(group));
      return null;
    }
    if (group == "fixed") {
      return this.createFixedNode(col, name);
    } else if (group == "derived") {
      return this.createDerivedNode(col, name);
    }
    return null;
  };
  TTRPGSystemGraphModel2.prototype.createDerivedNode = function(col, name) {
    var colName = col;
    if (typeof col == "string") {
      var grp = this._getGroup(derived);
      if (!grp)
        return null;
      col = grp.getCollection(col);
    } else {
      colName = col.getName();
    }
    if (!col) {
      this.out.outError("No Derived collection found by name: ".concat(colName, " "));
      return null;
    }
    var node = new GrobNodte_1.GrobDerivedNode(name, col);
    col.addNode(node);
    return node;
  };
  TTRPGSystemGraphModel2.prototype.createFixedNode = function(col, name) {
    var grp = this._getGroup(fixed);
    if (!grp)
      return null;
    var colName = col;
    if (typeof col !== "string") {
      colName = col.getName();
    } else {
      col = grp.getCollection(colName);
    }
    if (!col) {
      this.out.outError("No Fixed collection found by name: ".concat(colName, " "));
      return null;
    }
    var node = new GrobNodte_1.GrobFixedNode(name, col);
    col.addNode(node);
    return node;
  };
  TTRPGSystemGraphModel2.prototype.hasCollection = function(group, name) {
    var grp = this._getGroup(group);
    if (!grp) {
      this.out.outError("No group existed by name ".concat(group));
      return false;
    }
    return grp.hasCollection(name);
  };
  TTRPGSystemGraphModel2.prototype.hasDerivedCollection = function(name) {
    return this.hasCollection(derived, name);
  };
  TTRPGSystemGraphModel2.prototype.hasFixedCollection = function(name) {
    return this.hasCollection(fixed, name);
  };
  TTRPGSystemGraphModel2.prototype.hasNode = function(group, col, name) {
    var grp = this._getGroup(group);
    if (!grp) {
      this.out.outError("No group existed by name ".concat(group));
      return false;
    }
    var _col = col;
    if (typeof col === "string") {
      _col = this.getCollection(grp, col);
      if (!_col) {
        this.out.outError("attempted to get ".concat(group, " collection ").concat(name, ", but no collection existed by that name"));
        return false;
      }
    }
    return _col.hasNode(name);
  };
  TTRPGSystemGraphModel2.prototype.hasDerivedNode = function(col, name) {
    return this.hasNode(derived, col, name);
  };
  TTRPGSystemGraphModel2.prototype.hasFixedNode = function(col, name) {
    return this.hasNode(fixed, col, name);
  };
  TTRPGSystemGraphModel2.prototype.getCollectionNames = function(group) {
    var grp;
    if (typeof group == "string") {
      grp = this._getGroup(group);
    } else {
      grp = group;
    }
    if (!grp) {
      this.out.outError("No group existed by name ".concat(group));
      return [];
    }
    return grp.getCollectionsNames();
  };
  TTRPGSystemGraphModel2.prototype.getCollection = function(group, name) {
    var grp;
    if (typeof group == "string") {
      grp = this._getGroup(group);
    } else {
      grp = group;
    }
    if (!grp) {
      this.out.outError("No group existed by name ".concat(group));
      return null;
    }
    var col = grp.getCollection(name);
    if (!col) {
      this.out.outError("attempted to get ".concat(group, " collection ").concat(name, ", but no collection existed by that name"));
      return null;
    }
    return col;
  };
  TTRPGSystemGraphModel2.prototype.getDerivedCollection = function(name) {
    return this.getCollection(derived, name);
  };
  TTRPGSystemGraphModel2.prototype.getFixedCollection = function(name) {
    return this.getCollection(fixed, name);
  };
  TTRPGSystemGraphModel2.prototype.getNode = function(group, col, name) {
    var grp = this._getGroup(group);
    if (!grp) {
      this.out.outError("No group existed by name ".concat(group));
      return null;
    }
    var node;
    if (typeof col !== "string") {
      node = col.getNode(name);
    } else {
      var colName = col;
      col = grp.getCollection(col);
      if (!col) {
        this.out.outError("attempted to get ".concat(group, " collection ").concat(colName, ", but did not exist"));
        return null;
      }
      node = col.getNode(name);
    }
    if (!node) {
      this.out.outError("attempted to get ".concat(group, ".").concat(col.getName(), " Node ").concat(name, ", but did not exist"));
      return null;
    }
    return node;
  };
  TTRPGSystemGraphModel2.prototype.getDerivedNode = function(col, name) {
    return this.getNode(derived, col, name);
  };
  TTRPGSystemGraphModel2.prototype.getFixedNode = function(col, name) {
    return this.getNode(fixed, col, name);
  };
  TTRPGSystemGraphModel2.prototype.getNodeNames = function(group, col) {
    var grp = this._getGroup(group);
    if (!grp) {
      this.out.outError("No group existed by name ".concat(group));
      return null;
    }
    var _col;
    if (typeof col === "string") {
      _col = grp.getCollection(col);
    } else {
      _col = col;
    }
    return _col.getNodeNames();
  };
  TTRPGSystemGraphModel2.prototype._deleteGroup = function(group) {
    if (typeof group == "string") {
      var name = group;
      group = this._getGroup(group);
      if (!group) {
        this.out.outError("No Collection by name " + name);
        return false;
      }
    }
    _super2.prototype._deleteGroup.call(this, group);
  };
  TTRPGSystemGraphModel2.prototype.deleteCollection = function(group, col) {
    var grp = this._getGroup(group);
    if (!grp) {
      this.out.outError("No group existed by name ".concat(group));
      return false;
    }
    if (typeof col === "string") {
      col = col = grp.getCollection(col);
      if (!col)
        return false;
    }
    return this._deleteCollection(col);
  };
  TTRPGSystemGraphModel2.prototype.deleteDerivedCollection = function(col) {
    return this.deleteCollection(derived, col);
  };
  TTRPGSystemGraphModel2.prototype.deleteFixedCollection = function(col) {
    return this.deleteCollection(fixed, col);
  };
  TTRPGSystemGraphModel2.prototype.deleteNode = function(group, col, name) {
    var grp = this._getGroup(group);
    if (!grp) {
      this.out.outError("No group existed by name ".concat(group));
      return false;
    }
    if (typeof col === "string") {
      col = grp.getCollection(col);
    }
    if (!col) {
      this.out.outError("attempted to get ".concat(group, " collection ").concat(name, ", but no collection existed by that name"));
      return false;
    }
    var node = col.getNode(name);
    return col.removeNode(node);
  };
  TTRPGSystemGraphModel2.prototype.deleteDerivedNode = function(col, name) {
    return this.deleteNode(derived, col, name);
  };
  TTRPGSystemGraphModel2.prototype.deleteFixedNode = function(col, name) {
    return this.deleteNode(fixed, col, name);
  };
  TTRPGSystemGraphModel2.prototype.renameCollection = function(group, col, newName) {
    var grp;
    var grpName;
    if (typeof group == "string") {
      grpName = group;
      grp = this._getGroup(group);
    } else {
      grpName = group.getName();
      grp = group;
    }
    if (!grp) {
      this.out.outError("No group existed by name ".concat(grpName));
      return null;
    }
    var colName = col;
    if (typeof col == "string") {
      colName = col;
      col = grp.getCollection(col);
    } else {
      colName = col.getName();
    }
    if (!col) {
      this.out.outError("No Collection existed by name ".concat(colName, " in ").concat(grpName));
      return null;
    }
    return grp.update_collection_name(colName, newName);
  };
  TTRPGSystemGraphModel2.prototype.renameItem = function(group, col, oldName, newName) {
    var grp;
    var grpName;
    if (typeof group == "string") {
      grpName = group;
      grp = this._getGroup(group);
    } else {
      grpName = group.getName();
      grp = group;
    }
    if (!grp) {
      this.out.outError("No group existed by name ".concat(grpName));
      return null;
    }
    var colName = col;
    if (typeof col == "string") {
      colName = col;
      col = grp.getCollection(col);
    } else {
      colName = col.getName();
    }
    if (!col) {
      this.out.outError("No Collection existed by name ".concat(colName, " in ").concat(grpName));
      return null;
    }
    if (!col.hasNode(oldName)) {
      this.out.outError("No Item existed by name ".concat(oldName, " in ").concat(grpName, ".").concat(colName));
      return null;
    }
    return col.update_node_name(oldName, newName);
  };
  TTRPGSystemGraphModel2.prototype.isValid = function(errorMessages) {
    if (errorMessages === void 0) {
      errorMessages = [];
    }
    var key_group, key_collection, key_node;
    var collectionNames, nodeNames;
    var group, collection, node;
    var isValid;
    for (key_group in this.data) {
      group = this.data[key_group];
      collectionNames = group.getCollectionsNames();
      for (var colIndex in group.getCollectionsNames()) {
        key_collection = collectionNames[colIndex];
        collection = group.getCollection(key_collection);
        nodeNames = collection.getNodeNames();
        for (var nodeIndex in nodeNames) {
          key_node = nodeNames[nodeIndex];
          node = collection.getNode(key_node);
          isValid = node.isValid();
          if (!isValid) {
            var msg = "".concat(key_group, ".").concat(key_collection, ".").concat(key_node, " was invalid");
            var keys = [key_group, key_collection, key_node];
            errorMessages.push({ msg, key: keys });
          }
        }
      }
    }
    return errorMessages.length == 0;
  };
  TTRPGSystemGraphModel2.prototype._getGroup = function(name) {
    var grp = this.data[name];
    return grp !== null && grp !== void 0 ? grp : null;
  };
  TTRPGSystemGraphModel2.prototype.addNodeDependency = function(node, dep) {
    this._addNodeDependency(node, dep);
  };
  TTRPGSystemGraphModel2.prototype.removeNodeDependency = function(node, dep) {
    this._removeNodeDependency(node, dep);
  };
  return TTRPGSystemGraphModel2;
}(TTRPGSystemGraphAbstractModel_1.TTRPGSystemGraphAbstractModel);
TTRPGSystemGraphModel$1.TTRPGSystemGraphModel = TTRPGSystemGraphModel;
(function(exports2) {
  Object.defineProperty(exports2, "__esModule", { value: true });
  exports2.uuidv4 = exports2.TTRPGSystem = exports2.GrobGroup = exports2.GrobCollection = exports2.GrobDerivedNode = exports2.GrobDerivedOrigin = exports2.GrobFixedNode = exports2.keyManagerInstance = void 0;
  var KeyManager_12 = KeyManager$1;
  Object.defineProperty(exports2, "keyManagerInstance", { enumerable: true, get: function() {
    return KeyManager_12.keyManagerInstance;
  } });
  var TTRPGSystemGraphModel_1 = TTRPGSystemGraphModel$1;
  Object.defineProperty(exports2, "TTRPGSystem", { enumerable: true, get: function() {
    return TTRPGSystemGraphModel_1.TTRPGSystemGraphModel;
  } });
  var GrobCollection_12 = GrobCollection$1;
  Object.defineProperty(exports2, "GrobCollection", { enumerable: true, get: function() {
    return GrobCollection_12.GrobCollection;
  } });
  var GrobGroup_12 = GrobGroup$1;
  Object.defineProperty(exports2, "GrobGroup", { enumerable: true, get: function() {
    return GrobGroup_12.GrobGroup;
  } });
  var GrobNodte_12 = GrobNodte;
  Object.defineProperty(exports2, "GrobDerivedNode", { enumerable: true, get: function() {
    return GrobNodte_12.GrobDerivedNode;
  } });
  Object.defineProperty(exports2, "GrobDerivedOrigin", { enumerable: true, get: function() {
    return GrobNodte_12.GrobDerivedOrigin;
  } });
  Object.defineProperty(exports2, "GrobFixedNode", { enumerable: true, get: function() {
    return GrobNodte_12.GrobFixedNode;
  } });
  function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  exports2.uuidv4 = uuidv4;
})(dist);
var __defProp$3 = Object.defineProperty;
var __getOwnPropDesc$3 = Object.getOwnPropertyDescriptor;
var __decorateClass$3 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$3(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp$3(target, key, result);
  return result;
};
class GrobJDerivedOrigin extends dist.GrobDerivedOrigin {
  constructor() {
    super(...arguments);
    __publicField(this, "symbol");
    __publicField(this, "originKey");
  }
}
__decorateClass$3([
  JsonString()
], GrobJDerivedOrigin.prototype, "symbol", 2);
__decorateClass$3([
  JsonString()
], GrobJDerivedOrigin.prototype, "originKey", 2);
class GrobJDerivedNode extends dist.GrobDerivedNode {
  constructor() {
    super(...arguments);
    __publicField(this, "name");
    __publicField(this, "calc");
    __publicField(this, "origins");
  }
}
__decorateClass$3([
  JsonString()
], GrobJDerivedNode.prototype, "name", 2);
__decorateClass$3([
  JsonString({ name: "calculationString" })
], GrobJDerivedNode.prototype, "calc", 2);
__decorateClass$3([
  JsonArrayClassTyped(GrobJDerivedOrigin, { name: "calcOrigins" })
], GrobJDerivedNode.prototype, "origins", 2);
class GrobJFixedNode extends dist.GrobFixedNode {
  constructor() {
    super(...arguments);
    __publicField(this, "name");
    __publicField(this, "___value");
  }
}
__decorateClass$3([
  JsonString()
], GrobJFixedNode.prototype, "name", 2);
__decorateClass$3([
  JsonNumber({ name: "standardValue" })
], GrobJFixedNode.prototype, "___value", 2);
class GrobCollectionDerived extends dist.GrobCollection {
  constructor() {
    super(...arguments);
    __publicField(this, "name");
    __publicField(this, "nodes_names", {});
  }
}
__decorateClass$3([
  JsonString()
], GrobCollectionDerived.prototype, "name", 2);
__decorateClass$3([
  JsonMappingRecordInArrayOut({ KeyPropertyName: "getName", name: "data", type: GrobJDerivedNode })
], GrobCollectionDerived.prototype, "nodes_names", 2);
class GrobCollectionFixed extends dist.GrobCollection {
  constructor() {
    super(...arguments);
    __publicField(this, "name");
    __publicField(this, "nodes_names", {});
  }
}
__decorateClass$3([
  JsonString()
], GrobCollectionFixed.prototype, "name", 2);
__decorateClass$3([
  JsonMappingRecordInArrayOut({ KeyPropertyName: "getName", name: "data", type: GrobJFixedNode })
], GrobCollectionFixed.prototype, "nodes_names", 2);
class GrobGroupDerived extends dist.GrobGroup {
  constructor() {
    super(...arguments);
    __publicField(this, "name");
    __publicField(this, "collections_names", {});
  }
}
__decorateClass$3([
  JsonString()
], GrobGroupDerived.prototype, "name", 2);
__decorateClass$3([
  JsonMappingRecordInArrayOut({ KeyPropertyName: "getName", name: "data", type: GrobCollectionDerived })
], GrobGroupDerived.prototype, "collections_names", 2);
class GrobGroupFixed extends dist.GrobGroup {
  constructor() {
    super(...arguments);
    __publicField(this, "name");
    __publicField(this, "collections_names", {});
  }
}
__decorateClass$3([
  JsonString()
], GrobGroupFixed.prototype, "name", 2);
__decorateClass$3([
  JsonMappingRecordInArrayOut({ KeyPropertyName: "getName", name: "data", type: GrobCollectionFixed })
], GrobGroupFixed.prototype, "collections_names", 2);
class TTRPG_SCHEMES {
}
__publicField(TTRPG_SCHEMES, "PREVIEW", "mini");
let TTRPGSystemJSONFormatting = class extends dist.TTRPGSystem {
  constructor() {
    super();
    __publicField(this, "fixed");
    __publicField(this, "derived");
    __publicField(this, "author", "");
    __publicField(this, "version", "");
    __publicField(this, "systemCodeName", dist.uuidv4());
    __publicField(this, "systemName", "");
  }
  setDefaultValues(defualtValues) {
    const colKeys = Object.keys(this.derived.collections_names);
    for (let c = 0; c < Object.keys(this.derived.collections_names).length; c++) {
      const colKey = colKeys[c];
      const collection = this.derived.collections_names[colKey];
      const nodeKeys = Object.keys(collection.nodes_names);
      for (let i = 0; i < nodeKeys.length; i++) {
        const nodeKey = nodeKeys[i];
        collection.nodes_names[nodeKey];
      }
    }
  }
};
__decorateClass$3([
  JsonClassTyped(GrobGroupFixed)
], TTRPGSystemJSONFormatting.prototype, "fixed", 2);
__decorateClass$3([
  JsonClassTyped(GrobGroupDerived)
], TTRPGSystemJSONFormatting.prototype, "derived", 2);
__decorateClass$3([
  JsonString(),
  JsonString({ scheme: [BASE_SCHEME, TTRPG_SCHEMES.PREVIEW] })
], TTRPGSystemJSONFormatting.prototype, "author", 2);
__decorateClass$3([
  JsonString(),
  JsonString({ scheme: [BASE_SCHEME, TTRPG_SCHEMES.PREVIEW] })
], TTRPGSystemJSONFormatting.prototype, "version", 2);
__decorateClass$3([
  JsonString(),
  JsonString({ scheme: [BASE_SCHEME, TTRPG_SCHEMES.PREVIEW] })
], TTRPGSystemJSONFormatting.prototype, "systemCodeName", 2);
__decorateClass$3([
  JsonString(),
  JsonString({ scheme: [BASE_SCHEME, TTRPG_SCHEMES.PREVIEW] })
], TTRPGSystemJSONFormatting.prototype, "systemName", 2);
TTRPGSystemJSONFormatting = __decorateClass$3([
  JsonObject({
    onBeforeSerialization: (self) => {
    },
    onAfterDeSerialization: (self, ...args) => {
      var _a;
      if (!self.fixed) {
        self._createGroup("fixed");
        self.fixed = self._getGroup("fixed");
      } else {
        self.data["fixed"] = self.fixed;
      }
      if (!self.derived) {
        self._createGroup("derived");
        self.derived = self._getGroup("derived");
      } else {
        self.data["derived"] = self.derived;
      }
      for (const group_key in self.data) {
        const group = self.data[group_key];
        group.parent = self;
        for (const col_key in group.collections_names) {
          const collection = group.collections_names[col_key];
          collection.parent = group;
          group.collections_names[collection.getName()] = collection;
          for (const node_key in collection.nodes_names) {
            const node = collection.nodes_names[node_key];
            node.parent = collection;
            collection.nodes_names[node.getName()] = node;
            const origins = (_a = node.origins) != null ? _a : [];
            origins.forEach((origin) => {
              let keys = origin.originKey.split(".");
              const target = self.getNode(keys[0], keys[1], keys[2]);
              origin.origin = target;
              node.addDependency(target);
            });
          }
        }
      }
      Object.values(self.data);
    }
  })
], TTRPGSystemJSONFormatting);
var __defProp$2 = Object.defineProperty;
var __getOwnPropDesc$2 = Object.getOwnPropertyDescriptor;
var __decorateClass$2 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$2(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp$2(target, key, result);
  return result;
};
class SystemPreviewSchemes {
}
__publicField(SystemPreviewSchemes, "BASE", BASE_SCHEME);
__publicField(SystemPreviewSchemes, "PAGE", "PAGE");
let SystemPreview = class {
  constructor() {
    __publicField(this, "id", dist.keyManagerInstance.getNewKey());
    __publicField(this, "filePath");
    __publicField(this, "isEditable", true);
    __publicField(this, "author");
    __publicField(this, "version");
    __publicField(this, "code");
    __publicField(this, "name");
    __publicField(this, "folderPath");
    __publicField(this, "folderName");
  }
  init() {
    this.author = "grobax";
    this.version = "0.0.1";
    this.code = "grobdnd";
    this.name = "Grobax' DnD TTPRPG";
  }
};
__decorateClass$2([
  JsonBoolean({ scheme: [SystemPreviewSchemes.BASE] })
], SystemPreview.prototype, "isEditable", 2);
__decorateClass$2([
  JsonString({ scheme: [SystemPreviewSchemes.BASE] })
], SystemPreview.prototype, "author", 2);
__decorateClass$2([
  JsonString({ scheme: [SystemPreviewSchemes.BASE, SystemPreviewSchemes.PAGE] })
], SystemPreview.prototype, "version", 2);
__decorateClass$2([
  JsonString({ scheme: [SystemPreviewSchemes.BASE, SystemPreviewSchemes.PAGE] })
], SystemPreview.prototype, "code", 2);
__decorateClass$2([
  JsonString({ scheme: [SystemPreviewSchemes.BASE, SystemPreviewSchemes.PAGE] })
], SystemPreview.prototype, "name", 2);
SystemPreview = __decorateClass$2([
  JsonObject({
    onAfterDeSerialization: (self, ...args) => {
      self.id = dist.keyManagerInstance.getNewKey();
    }
  })
], SystemPreview);
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __decorateClass$1 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$1(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp$1(target, key, result);
  return result;
};
class UILayoutModelSchemes {
}
__publicField(UILayoutModelSchemes, "BASE", BASE_SCHEME);
__publicField(UILayoutModelSchemes, "PAGE", "PAGE");
class UILayoutModel {
  constructor() {
    __publicField(this, "id", dist.keyManagerInstance.getNewKey());
    __publicField(this, "guid", PluginHandler.uuidv4());
    __publicField(this, "author");
    __publicField(this, "version");
    __publicField(this, "name");
    __publicField(this, "mainStyle");
    __publicField(this, "componentJs");
    __publicField(this, "folderSrc");
    __publicField(this, "valid", true);
    __publicField(this, "errors", []);
  }
  async isValid() {
    let errors = [];
    if (!this.folderSrc) {
      errors.push(`UILayoutModel for ${this.name} by ${this.author}, did not have a folderSrc`);
      return;
    }
    let valid = true;
    let src = this.folderSrc + "/" + this.componentJs;
    let _ = await FileHandler.exists(src);
    if (!_) {
      errors.push(`UILayoutModel for ${this.name} by ${this.author}, Pointed to a missing file ${src}`);
      valid = false;
    }
    src = this.folderSrc + "/" + this.mainStyle;
    _ = await FileHandler.exists(src);
    if (!_) {
      errors.push(`UILayoutModel for ${this.name} by ${this.author}, Pointed to a missing file ${src}`);
      valid = false;
    }
    this.valid = valid;
    return valid;
  }
  async loadfile(file, errors = []) {
    const src = this.folderSrc + "/" + file;
    let _ = await FileHandler.exists(src);
    if (!_) {
      errors.push(`file at ${src} did not exists`);
      return null;
    }
    let f = await FileHandler.readFile(src);
    return f;
  }
}
__decorateClass$1([
  JsonString({ scheme: [UILayoutModelSchemes.BASE, UILayoutModelSchemes.PAGE] })
], UILayoutModel.prototype, "guid", 2);
__decorateClass$1([
  JsonString({ scheme: [UILayoutModelSchemes.BASE] })
], UILayoutModel.prototype, "author", 2);
__decorateClass$1([
  JsonString({ scheme: [UILayoutModelSchemes.BASE] })
], UILayoutModel.prototype, "version", 2);
__decorateClass$1([
  JsonString({ scheme: [UILayoutModelSchemes.BASE, UILayoutModelSchemes.PAGE] })
], UILayoutModel.prototype, "name", 2);
__decorateClass$1([
  JsonString({ scheme: [UILayoutModelSchemes.BASE] })
], UILayoutModel.prototype, "mainStyle", 2);
__decorateClass$1([
  JsonString({ scheme: [UILayoutModelSchemes.BASE] })
], UILayoutModel.prototype, "componentJs", 2);
__decorateClass$1([
  JsonString({ scheme: [UILayoutModelSchemes.BASE] })
], UILayoutModel.prototype, "folderSrc", 2);
const _FileContext = class {
  constructor() {
    __publicField(this, "path");
    __publicField(this, "loadedSystem");
    __publicField(this, "foldersWithNoIndex");
    __publicField(this, "availableSystems");
    this.path = PluginHandler.PLUGIN_ROOT + "/" + PluginHandler.SYSTEMS_FOLDER_NAME;
  }
  static getInstance() {
    if (!_FileContext.instance) {
      _FileContext.instance = new _FileContext();
    }
    return _FileContext.instance;
  }
  async initSystemsStructure() {
    if (await FileHandler.exists(this.path))
      return;
    FileHandler.mkdir(this.path);
  }
  async loadPreviewAndfolder(folderPath) {
    const indexPath = folderPath + "/index.json";
    const folderName = folderPath.split("/").last();
    let exists = await FileHandler.exists(indexPath);
    if (exists) {
      const content = await FileHandler.readFile(indexPath);
      const systemPreview = JSONHandler.deserialize(SystemPreview, content);
      systemPreview.folderName = folderName;
      systemPreview.folderPath = folderPath;
      systemPreview.filePath = indexPath;
      return [systemPreview, folderName];
    }
    return [null, folderName];
  }
  async loadPreview(folderPath) {
    return (await this.loadPreviewAndfolder(folderPath))[0];
  }
  static async loadAllAvailableFiles() {
    let instance2 = _FileContext.getInstance();
    return instance2.loadAllAvailableFiles();
  }
  async loadAllAvailableFiles(messages = {}) {
    let release = await _FileContext.mutex.acquire();
    let lsDir = await FileHandler.lsdir(this.path);
    let systems = await Promise.all(lsDir.folders.map(async (folderPath) => {
      return await this.loadPreviewAndfolder(folderPath);
    }));
    this.foldersWithNoIndex = [];
    this.availableSystems = [];
    systems.forEach((p) => {
      if (p[0]) {
        this.availableSystems.push(p[0]);
      } else {
        this.foldersWithNoIndex.push(p[1]);
      }
    });
    release();
  }
  static async createSystemDefinition(system, messages = {}) {
    let instance2 = _FileContext.getInstance();
    return instance2.createSystemDefinition(system, messages);
  }
  async createSystemDefinition(system, messages = {}) {
    let release = await _FileContext.mutex.acquire();
    this.initSystemsStructure();
    let folderPath = this.path + "/" + system.folderName;
    if (!await FileHandler.exists(folderPath)) {
      await FileHandler.mkdir(folderPath);
    } else {
      if (await FileHandler.exists(folderPath + "/index.json")) {
        messages["createSystem"] = { msg: `folder '${system.folderName}' already existed, and contained a system. 
Either delete the old system, or choose another foldername`, type: "error" };
        release();
        return null;
      }
    }
    let filepath = folderPath + "/index.json";
    await FileHandler.saveFile(filepath, JSONHandler.serialize(system));
    if (!await FileHandler.exists(filepath)) {
      messages["createSystem"] = { msg: `tried to save index.json at '${filepath} 
 but something went wrong.`, type: "error" };
      release();
      return null;
    }
    let systemReloaded = await this.loadPreview(folderPath);
    release();
    return systemReloaded;
  }
  static async copySystemDefinition(system, systemNew, messages = {}) {
    let instance2 = _FileContext.getInstance();
    return instance2.copySystemDefinition(system, systemNew, messages);
  }
  async copySystemDefinition(system, systemNew, messages = {}) {
    let copiedSystem = await this.createSystemDefinition(systemNew, messages);
    if (!copiedSystem) {
      return null;
    }
    async function DFSCopyAllFolders(path2, newPath) {
      let ls = await FileHandler.lsdir(path2);
      await Promise.all(ls.folders.map(async (folderPath) => {
        let foldername = folderPath.split("/").last();
        let newFolderPath = newPath + "/" + foldername;
        FileHandler.mkdir(newFolderPath);
        await DFSCopyAllFolders(folderPath, newFolderPath);
      }));
    }
    async function BFSCopyAllFiles(path2, newPath) {
      let ls = await FileHandler.lsdir(path2);
      await Promise.all(ls.files.map(async (filePath) => {
        let file = await FileHandler.readFile(filePath);
        let fileName = filePath.split("/").last();
        await FileHandler.saveFile(newPath + "/" + fileName, file);
      }));
      await Promise.all(ls.folders.map(async (folderPath) => {
        let segmentsPath = folderPath.split("/");
        let foldername = segmentsPath.pop();
        let newFolderPath = newPath + "/" + foldername;
        await BFSCopyAllFiles(folderPath, newFolderPath);
      }));
    }
    await DFSCopyAllFolders(system.folderPath, copiedSystem.folderPath);
    await BFSCopyAllFiles(system.folderPath, copiedSystem.folderPath);
    await FileHandler.saveFile(copiedSystem.filePath, JSONHandler.serialize(copiedSystem));
    return copiedSystem;
  }
  static async systemDefinitionExistsInFolder(folder2) {
    let instance2 = _FileContext.getInstance();
    return instance2.systemDefinitionExistsInFolder(folder2);
  }
  async systemDefinitionExistsInFolder(folder2) {
    let folderPath = this.path + "/" + folder2;
    if (!await FileHandler.exists(folderPath)) {
      return false;
    } else {
      if (await FileHandler.exists(folderPath + "/index.json")) {
        return true;
      }
    }
    return false;
  }
  static async getOrCreateSystemsDesigns(folder2) {
    return _FileContext.getInstance().systemDefinitionExistsInFolder(folder2);
  }
  async getOrCreateSystemsDesigns(folder2) {
    if (!await FileHandler.exists(folder2)) {
      return null;
    }
    if (!await FileHandler.exists(folder2)) {
      return null;
    }
    let filepath = folder2 + "/designer.json";
    if (!await FileHandler.exists(filepath)) {
      let designer = new TTRPGSystemJSONFormatting();
      designer.initAsNew();
      await FileHandler.saveFile(filepath, JSONHandler.serialize(designer));
      return designer;
    }
    let file = await FileHandler.readFile(filepath);
    let loaded = JSONHandler.deserialize(TTRPGSystemJSONFormatting, file);
    return loaded;
  }
  async saveSystemsDesigns(folder2, designer) {
    if (!await FileHandler.exists(folder2)) {
      return null;
    }
    if (!await FileHandler.exists(folder2)) {
      return null;
    }
    let filepath = folder2 + "/designer.json";
    await FileHandler.saveFile(filepath, JSONHandler.serialize(designer));
    return true;
  }
  async loadFolderAndFilesRecursice(folderPath) {
    let c = [];
    const content = await FileHandler.lsdir(folderPath);
    let map = await Promise.all(content.files.map(async (f) => {
      return await this.loadFileAndCreateCommand(f);
    }));
    map.forEach((p) => {
      c.push(p);
    });
    let map2 = await Promise.all(content.folders.map(async (f) => {
      return await this.loadFolderAndFilesRecursice(f);
    }));
    map2.forEach((p) => {
      p.forEach((q) => {
        c.push(q);
      });
    });
    return c;
  }
  async loadFileAndCreateCommand(filepath) {
    let data = await FileHandler.readFile(filepath);
    return {
      command: "file",
      path: filepath,
      content: data
    };
  }
  async loadBlockUITemplate() {
    const path2 = PluginHandler.PLUGIN_ROOT + "/" + PluginHandler.BUILTIN_UIS_FOLDER_NAME + "/";
    let commands = [];
    let exists = await FileHandler.exists(path2);
    if (!exists) {
      throw new Error("File for BlockUI have been deleted. this feature longer works as a result");
    }
    const content = await FileHandler.lsdir(path2);
    let map = await Promise.all(content.files.map(async (f) => {
      return await this.loadFileAndCreateCommand(f);
    }));
    map.forEach((p) => {
      var _a;
      if (!p.path.endsWith("/declaration.ts")) {
        let n = (_a = p.path.split("BlockUIDev/").last()) != null ? _a : "";
        p.path = "src/" + n;
        commands.push(p);
      }
    });
    let pathsrc = path2 + "/src/";
    let map2 = await this.loadFolderAndFilesRecursice(pathsrc);
    map2.forEach((p) => {
      var _a;
      let n = (_a = p.path.split("BlockUIDev/").last()) != null ? _a : "";
      p.path = n;
      if (n != "/src/") {
        commands.push(p);
      }
    });
    return commands;
  }
  async loadUILayout(foldersrc, errors = []) {
    const src = foldersrc + "/" + PluginHandler.SYSTEM_UI_LAYOUTFILENAME;
    const exists = await FileHandler.exists(src);
    if (!exists)
      return null;
    const file = await FileHandler.readFile(src);
    let model;
    try {
      model = JSONHandler.deserialize(UILayoutModel, file);
    } catch (e) {
      errors.push(e.message);
      return null;
    }
    model.folderSrc = foldersrc;
    await model.isValid();
    return model;
  }
  async getAllBlockUIAvailablePreview(sys) {
    const UIFolderpath = sys.folderPath + "/" + PluginHandler.SYSTEM_UI_CONTAINER_FOLDER_NAME;
    const exists = await FileHandler.exists(UIFolderpath);
    let layouts = [];
    if (exists) {
      let folders = (await FileHandler.lsdir(UIFolderpath)).folders;
      for (let i = 0; i < folders.length; i++) {
        const folder2 = folders[i];
        let layout = await this.loadUILayout(folder2);
        if (layout)
          layouts.push(layout);
      }
    }
    return layouts;
  }
};
let FileContext = _FileContext;
__publicField(FileContext, "mutex", new Mutex());
__publicField(FileContext, "instance");
function createResponse(code, model, message) {
  return {
    responseCode: code,
    messages: message,
    response: model
  };
}
function createMessage(key, msg, type) {
  let list = {};
  list[key] = { msg, type };
  return list;
}
const _ObsidianUICoreAPI = class {
  constructor() {
    __publicField(this, "systemDefinition", new SystemDefinitionManagement());
    __publicField(this, "systemFactory", new SystemFactory());
    __publicField(this, "UIImportExport", new UIImporterExpoter());
    __publicField(this, "tests", new Test());
  }
  static getInstance() {
    if (!_ObsidianUICoreAPI.instance) {
      _ObsidianUICoreAPI.instance = new _ObsidianUICoreAPI();
    }
    return _ObsidianUICoreAPI.instance;
  }
};
let ObsidianUICoreAPI = _ObsidianUICoreAPI;
__publicField(ObsidianUICoreAPI, "instance");
class SystemDefinitionManagement {
  async recursiveFindNewFolderName(depth = 0, maxDepth = 5) {
    if (depth == maxDepth) {
      return null;
    }
    let uuid = StringFunctions.uuidShort();
    if (await FileContext.systemDefinitionExistsInFolder(uuid)) {
      return this.recursiveFindNewFolderName(depth + 1);
    }
    return uuid;
  }
  async isValidSystemPreview(sys, invalidMessages = {}) {
    let isValid = true;
    const systemPreviewValidationCode = "spv";
    if (!sys.author) {
      invalidMessages[systemPreviewValidationCode + "1"] = { msg: "a author is not required but helpfull to users", type: MessageTypes.verbose };
    }
    if (!sys.version) {
      invalidMessages[systemPreviewValidationCode + "2"] = { msg: "a version is not required but helpfull to users", type: MessageTypes.verbose };
    }
    if (!sys.systemCodeName) {
      isValid = false;
      invalidMessages[systemPreviewValidationCode + "3"] = { msg: "Did not have a systemCodeName.\n can only contain regular letter and numbers, no special characters or whitespace", type: MessageTypes.error };
    } else if (!StringFunctions.isValidSystemCodeName(sys.systemCodeName)) {
      isValid = false;
      invalidMessages[systemPreviewValidationCode + "4"] = { msg: "Did not have a valid systemCodeName.\n can only contain regular letter and numbers, no special characters or whitespace", type: MessageTypes.error };
    } else if (FileContext.getInstance().availableSystems.findIndex((p) => p.systemCodeName == sys.systemCodeName) != -1) {
      isValid = false;
      invalidMessages[systemPreviewValidationCode + "d1"] = { msg: "shares Codename with another system", type: MessageTypes.error };
    }
    if (!sys.systemName) {
      isValid = false;
      invalidMessages[systemPreviewValidationCode + "5"] = { msg: "Did not have a system name.", type: MessageTypes.error };
    } else if (!StringFunctions.isValidWindowsFileString(sys.systemName)) {
      isValid = false;
      invalidMessages[systemPreviewValidationCode + "6"] = { msg: "Did not have a valid system name.", type: MessageTypes.error };
    } else if (FileContext.getInstance().availableSystems.findIndex((p) => p.systemName == sys.systemName) != -1) {
      isValid = false;
      invalidMessages[systemPreviewValidationCode + "d2"] = { msg: "shares name with another system", type: MessageTypes.error };
    }
    if (!sys.folderName) {
      let newFoldername = await this.recursiveFindNewFolderName(0, 5);
      if (!newFoldername) {
        invalidMessages[systemPreviewValidationCode + "7"] = { msg: "A new folder name is required, Must be unique.", type: MessageTypes.error };
      } else {
        sys.folderName = newFoldername;
        invalidMessages[systemPreviewValidationCode + "8"] = { msg: "Did not have a folder name so created one.", type: MessageTypes.verbose };
      }
    } else if (!StringFunctions.isValidWindowsFileString(sys.folderName)) {
      isValid = false;
      invalidMessages[systemPreviewValidationCode + "9"] = { msg: "folder name was not valid windows folder name.", type: MessageTypes.error };
    } else if (FileContext.getInstance().availableSystems.findIndex((p) => p.folderPath.endsWith("/" + sys.folderName)) != -1) {
      isValid = false;
      invalidMessages[systemPreviewValidationCode + "d3"] = { msg: "folder name was already used, you must use another, or use an overwrite feature.", type: MessageTypes.error };
    }
    if (isValid) {
      invalidMessages[systemPreviewValidationCode + "OK"] = { msg: "All is Good.", type: MessageTypes.good };
    }
    return isValid;
  }
  async validateSystem(sys) {
    let messages = {};
    try {
      if (!await this.isValidSystemPreview(sys, messages)) {
        return createResponse(406, false, messages);
      }
      return createResponse(200, true, messages);
    } catch (e) {
      messages["exception"] = { msg: e.message, type: "error" };
      return createResponse(500, null, messages);
    }
  }
  async CreateNewSystem(sys) {
    let messages = {};
    try {
      if (!await this.isValidSystemPreview(sys, messages)) {
        return createResponse(406, null, messages);
      }
      let createdAndReloaded = await FileContext.createSystemDefinition(sys);
      if (createdAndReloaded) {
        return createResponse(200, createdAndReloaded, messages);
      }
      return createResponse(406, null, messages);
    } catch (e) {
      messages["exception"] = { msg: e.message, type: "error" };
      return createResponse(500, null, messages);
    }
  }
  async CopySystem(from, to) {
    let messages = {};
    try {
      if (!await this.isValidSystemPreview(to, messages)) {
        return createResponse(406, null, messages);
      }
      let savedAndReloaded = await FileContext.copySystemDefinition(from, to);
      if (savedAndReloaded) {
        return createResponse(200, savedAndReloaded, messages);
      }
      return createResponse(406, null, messages);
    } catch (e) {
      messages["exception"] = { msg: e.message, type: "error" };
      return createResponse(500, null, messages);
    }
  }
  async Deletesystem(sys) {
    return createResponse(501, false, {});
  }
  async EditSystem(sys) {
    return createResponse(501, null, {});
  }
  async getAllSystems() {
    var _a;
    let messages = {};
    try {
      let fileContext = FileContext.getInstance();
      await fileContext.loadAllAvailableFiles(messages);
      let previews = (_a = fileContext.availableSystems) != null ? _a : [];
      return createResponse(200, previews, messages);
    } catch (e) {
      messages["exception"] = { msg: e.message, type: "error" };
      return createResponse(500, null, messages);
    }
  }
}
class SystemFactory {
  async getOrCreateSystemFactory(preview) {
    if (!preview.folderPath) {
      return createResponse(406, null, createMessage("getOrCreateSystemFactory1", "systemPreview was invalid", "error"));
    }
    let fileContent = FileContext.getInstance();
    let designer = await fileContent.getOrCreateSystemsDesigns(preview.folderPath);
    if (designer) {
      return createResponse(200, designer, createMessage("getOrCreateSystemFactory", "System Designer Loaded", "good"));
    }
    return createResponse(500, null, createMessage("getOrCreateSystemFactory", "Something went wrong loading the file", "error"));
  }
  async saveSystemDesigner(preview, designer) {
    if (!preview.folderPath) {
      return createResponse(406, null, createMessage("saveSystemFactory1", "systemPreview was invalid", "error"));
    }
    if (!designer.isValid()) {
      return createResponse(406, null, createMessage("saveSystemFactory1", "system Designer validated to invalid. ", "error"));
    }
    let fileContent = FileContext.getInstance();
    if (await fileContent.saveSystemsDesigns(preview.folderPath, designer)) {
      return createResponse(200, null, createMessage("saveSystemFactory1", "saved designer", "good"));
    }
    return createResponse(500, null, createMessage("saveSystemFactory1", "Something went wrong loading the file", "error"));
  }
  async deleteSystemFactory() {
  }
}
class UIImporterExpoter {
  async loadBlockUIForExport() {
    let messages = {};
    try {
      let blockUIFilesResponse = await FileContext.getInstance().loadBlockUITemplate();
      ;
      return createResponse(200, blockUIFilesResponse, {});
    } catch (e) {
      messages["Error"] = { msg: e.message, type: "error" };
      return createResponse(300, [], messages);
    }
  }
  async getAllAvailableUIsForSystem(sys) {
    let messages = {};
    try {
      let fileContext = FileContext.getInstance();
      let layouts = await fileContext.getAllBlockUIAvailablePreview(sys);
      return createResponse(200, layouts, messages);
    } catch (e) {
      messages["exception"] = { msg: e.message, type: "error" };
      return createResponse(500, null, messages);
    }
  }
}
class Test {
  async CallTestError(errorCode = 300) {
    let messages = {};
    messages["Error0"] = { msg: "Test Message 1", type: "error" };
    messages["Error1"] = { msg: "Test Message 2", type: "verbose" };
    messages["Error2"] = { msg: "Test Message 3", type: "good" };
    return createResponse(errorCode, [], messages);
  }
}
function create_fragment$2(ctx) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
  let div20;
  let section;
  let div18;
  let div2;
  let div0;
  let t0;
  let t1;
  let div1;
  let t2_value = ((_b = (_a = ctx[0]) == null ? void 0 : _a.author) != null ? _b : unknownString) + "";
  let t2;
  let t3;
  let div5;
  let div3;
  let t4;
  let t5;
  let div4;
  let t6_value = ((_d = (_c = ctx[0]) == null ? void 0 : _c.version) != null ? _d : unknownString) + "";
  let t6;
  let t7;
  let div8;
  let div6;
  let t8;
  let t9;
  let div7;
  let t10_value = ((_f = (_e = ctx[0]) == null ? void 0 : _e.systemCodeName) != null ? _f : unknownString) + "";
  let t10;
  let t11;
  let div11;
  let div9;
  let t12;
  let t13;
  let div10;
  let t14_value = ((_h = (_g = ctx[0]) == null ? void 0 : _g.isEditable) != null ? _h : unknownString) + "";
  let t14;
  let t15;
  let div14;
  let div12;
  let t16;
  let t17;
  let div13;
  let t18_value = ((_j = (_i = ctx[0]) == null ? void 0 : _i.systemName) != null ? _j : unknownString) + "";
  let t18;
  let t19;
  let div17;
  let div15;
  let t20;
  let t21;
  let div16;
  let t22_value = ((_l = (_k = ctx[0]) == null ? void 0 : _k.folderName) != null ? _l : unknownString) + "";
  let t22;
  let div18_transition;
  let t23;
  let br;
  let t24;
  let div19;
  let editablelist;
  let current;
  editablelist = new EditAbleList({
    props: {
      isEditableContainer: false,
      collection: (_n = (_m = ctx[1]) == null ? void 0 : _m.map(func)) != null ? _n : [],
      onSelect: ctx[4]
    }
  });
  editablelist.$on("onDeSelect", ctx[3]);
  return {
    c() {
      div20 = element("div");
      section = element("section");
      div18 = element("div");
      div2 = element("div");
      div0 = element("div");
      t0 = text("Author");
      t1 = space();
      div1 = element("div");
      t2 = text(t2_value);
      t3 = space();
      div5 = element("div");
      div3 = element("div");
      t4 = text("Version");
      t5 = space();
      div4 = element("div");
      t6 = text(t6_value);
      t7 = space();
      div8 = element("div");
      div6 = element("div");
      t8 = text("SystemCodeName");
      t9 = space();
      div7 = element("div");
      t10 = text(t10_value);
      t11 = space();
      div11 = element("div");
      div9 = element("div");
      t12 = text("editable");
      t13 = space();
      div10 = element("div");
      t14 = text(t14_value);
      t15 = space();
      div14 = element("div");
      div12 = element("div");
      t16 = text("SystemName");
      t17 = space();
      div13 = element("div");
      t18 = text(t18_value);
      t19 = space();
      div17 = element("div");
      div15 = element("div");
      t20 = text("folder name");
      t21 = space();
      div16 = element("div");
      t22 = text(t22_value);
      t23 = space();
      br = element("br");
      t24 = space();
      div19 = element("div");
      create_component(editablelist.$$.fragment);
      this.h();
    },
    l(nodes) {
      div20 = claim_element(nodes, "DIV", { class: true });
      var div20_nodes = children(div20);
      section = claim_element(div20_nodes, "SECTION", {});
      var section_nodes = children(section);
      div18 = claim_element(section_nodes, "DIV", { class: true, "data-is-edit": true });
      var div18_nodes = children(div18);
      div2 = claim_element(div18_nodes, "DIV", { class: true });
      var div2_nodes = children(div2);
      div0 = claim_element(div2_nodes, "DIV", { class: true });
      var div0_nodes = children(div0);
      t0 = claim_text(div0_nodes, "Author");
      div0_nodes.forEach(detach);
      t1 = claim_space(div2_nodes);
      div1 = claim_element(div2_nodes, "DIV", { class: true });
      var div1_nodes = children(div1);
      t2 = claim_text(div1_nodes, t2_value);
      div1_nodes.forEach(detach);
      div2_nodes.forEach(detach);
      t3 = claim_space(div18_nodes);
      div5 = claim_element(div18_nodes, "DIV", { class: true });
      var div5_nodes = children(div5);
      div3 = claim_element(div5_nodes, "DIV", { class: true });
      var div3_nodes = children(div3);
      t4 = claim_text(div3_nodes, "Version");
      div3_nodes.forEach(detach);
      t5 = claim_space(div5_nodes);
      div4 = claim_element(div5_nodes, "DIV", { class: true });
      var div4_nodes = children(div4);
      t6 = claim_text(div4_nodes, t6_value);
      div4_nodes.forEach(detach);
      div5_nodes.forEach(detach);
      t7 = claim_space(div18_nodes);
      div8 = claim_element(div18_nodes, "DIV", { class: true });
      var div8_nodes = children(div8);
      div6 = claim_element(div8_nodes, "DIV", { class: true });
      var div6_nodes = children(div6);
      t8 = claim_text(div6_nodes, "SystemCodeName");
      div6_nodes.forEach(detach);
      t9 = claim_space(div8_nodes);
      div7 = claim_element(div8_nodes, "DIV", { class: true });
      var div7_nodes = children(div7);
      t10 = claim_text(div7_nodes, t10_value);
      div7_nodes.forEach(detach);
      div8_nodes.forEach(detach);
      t11 = claim_space(div18_nodes);
      div11 = claim_element(div18_nodes, "DIV", { class: true });
      var div11_nodes = children(div11);
      div9 = claim_element(div11_nodes, "DIV", { class: true });
      var div9_nodes = children(div9);
      t12 = claim_text(div9_nodes, "editable");
      div9_nodes.forEach(detach);
      t13 = claim_space(div11_nodes);
      div10 = claim_element(div11_nodes, "DIV", { class: true });
      var div10_nodes = children(div10);
      t14 = claim_text(div10_nodes, t14_value);
      div10_nodes.forEach(detach);
      div11_nodes.forEach(detach);
      t15 = claim_space(div18_nodes);
      div14 = claim_element(div18_nodes, "DIV", { class: true });
      var div14_nodes = children(div14);
      div12 = claim_element(div14_nodes, "DIV", { class: true });
      var div12_nodes = children(div12);
      t16 = claim_text(div12_nodes, "SystemName");
      div12_nodes.forEach(detach);
      t17 = claim_space(div14_nodes);
      div13 = claim_element(div14_nodes, "DIV", { class: true });
      var div13_nodes = children(div13);
      t18 = claim_text(div13_nodes, t18_value);
      div13_nodes.forEach(detach);
      div14_nodes.forEach(detach);
      t19 = claim_space(div18_nodes);
      div17 = claim_element(div18_nodes, "DIV", { class: true });
      var div17_nodes = children(div17);
      div15 = claim_element(div17_nodes, "DIV", { class: true });
      var div15_nodes = children(div15);
      t20 = claim_text(div15_nodes, "folder name");
      div15_nodes.forEach(detach);
      t21 = claim_space(div17_nodes);
      div16 = claim_element(div17_nodes, "DIV", { class: true });
      var div16_nodes = children(div16);
      t22 = claim_text(div16_nodes, t22_value);
      div16_nodes.forEach(detach);
      div17_nodes.forEach(detach);
      div18_nodes.forEach(detach);
      t23 = claim_space(section_nodes);
      br = claim_element(section_nodes, "BR", {});
      t24 = claim_space(section_nodes);
      div19 = claim_element(section_nodes, "DIV", { class: true });
      var div19_nodes = children(div19);
      claim_component(editablelist.$$.fragment, div19_nodes);
      div19_nodes.forEach(detach);
      section_nodes.forEach(detach);
      div20_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div0, "class", "tableRowColumn");
      attr(div1, "class", "tableRowColumn");
      attr(div2, "class", "tableRow");
      attr(div3, "class", "tableRowColumn");
      attr(div4, "class", "tableRowColumn");
      attr(div5, "class", "tableRow");
      attr(div6, "class", "tableRowColumn");
      attr(div7, "class", "tableRowColumn");
      attr(div8, "class", "tableRow");
      attr(div9, "class", "tableRowColumn");
      attr(div10, "class", "tableRowColumn");
      attr(div11, "class", "tableRow");
      attr(div12, "class", "tableRowColumn");
      attr(div13, "class", "tableRowColumn");
      attr(div14, "class", "tableRow");
      attr(div15, "class", "tableRowColumn");
      attr(div16, "class", "tableRowColumn");
      attr(div17, "class", "tableRow");
      attr(div18, "class", "table SystemPreviewer");
      attr(div18, "data-is-edit", false);
      attr(div19, "class", "PageSystemList");
      attr(div20, "class", "MainAppContainerPage MainAppContainerPageSystem");
    },
    m(target, anchor) {
      insert_hydration(target, div20, anchor);
      append_hydration(div20, section);
      append_hydration(section, div18);
      append_hydration(div18, div2);
      append_hydration(div2, div0);
      append_hydration(div0, t0);
      append_hydration(div2, t1);
      append_hydration(div2, div1);
      append_hydration(div1, t2);
      append_hydration(div18, t3);
      append_hydration(div18, div5);
      append_hydration(div5, div3);
      append_hydration(div3, t4);
      append_hydration(div5, t5);
      append_hydration(div5, div4);
      append_hydration(div4, t6);
      append_hydration(div18, t7);
      append_hydration(div18, div8);
      append_hydration(div8, div6);
      append_hydration(div6, t8);
      append_hydration(div8, t9);
      append_hydration(div8, div7);
      append_hydration(div7, t10);
      append_hydration(div18, t11);
      append_hydration(div18, div11);
      append_hydration(div11, div9);
      append_hydration(div9, t12);
      append_hydration(div11, t13);
      append_hydration(div11, div10);
      append_hydration(div10, t14);
      append_hydration(div18, t15);
      append_hydration(div18, div14);
      append_hydration(div14, div12);
      append_hydration(div12, t16);
      append_hydration(div14, t17);
      append_hydration(div14, div13);
      append_hydration(div13, t18);
      append_hydration(div18, t19);
      append_hydration(div18, div17);
      append_hydration(div17, div15);
      append_hydration(div15, t20);
      append_hydration(div17, t21);
      append_hydration(div17, div16);
      append_hydration(div16, t22);
      append_hydration(section, t23);
      append_hydration(section, br);
      append_hydration(section, t24);
      append_hydration(section, div19);
      mount_component(editablelist, div19, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j2, _k2, _l2, _m2, _n2;
      if ((!current || dirty & 1) && t2_value !== (t2_value = ((_b2 = (_a2 = ctx2[0]) == null ? void 0 : _a2.author) != null ? _b2 : unknownString) + ""))
        set_data(t2, t2_value);
      if ((!current || dirty & 1) && t6_value !== (t6_value = ((_d2 = (_c2 = ctx2[0]) == null ? void 0 : _c2.version) != null ? _d2 : unknownString) + ""))
        set_data(t6, t6_value);
      if ((!current || dirty & 1) && t10_value !== (t10_value = ((_f2 = (_e2 = ctx2[0]) == null ? void 0 : _e2.systemCodeName) != null ? _f2 : unknownString) + ""))
        set_data(t10, t10_value);
      if ((!current || dirty & 1) && t14_value !== (t14_value = ((_h2 = (_g2 = ctx2[0]) == null ? void 0 : _g2.isEditable) != null ? _h2 : unknownString) + ""))
        set_data(t14, t14_value);
      if ((!current || dirty & 1) && t18_value !== (t18_value = ((_j2 = (_i2 = ctx2[0]) == null ? void 0 : _i2.systemName) != null ? _j2 : unknownString) + ""))
        set_data(t18, t18_value);
      if ((!current || dirty & 1) && t22_value !== (t22_value = ((_l2 = (_k2 = ctx2[0]) == null ? void 0 : _k2.folderName) != null ? _l2 : unknownString) + ""))
        set_data(t22, t22_value);
      const editablelist_changes = {};
      if (dirty & 2)
        editablelist_changes.collection = (_n2 = (_m2 = ctx2[1]) == null ? void 0 : _m2.map(func)) != null ? _n2 : [];
      editablelist.$set(editablelist_changes);
    },
    i(local) {
      if (current)
        return;
      add_render_callback(() => {
        if (!current)
          return;
        if (!div18_transition)
          div18_transition = create_bidirectional_transition(div18, fade, {}, true);
        div18_transition.run(1);
      });
      transition_in(editablelist.$$.fragment, local);
      current = true;
    },
    o(local) {
      if (!div18_transition)
        div18_transition = create_bidirectional_transition(div18, fade, {}, false);
      div18_transition.run(0);
      transition_out(editablelist.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div20);
      if (detaching && div18_transition)
        div18_transition.end();
      destroy_component(editablelist);
    }
  };
}
let unknownString = "unknown";
const func = (p) => {
  return {
    key: p.systemCodeName,
    value: p.systemName
  };
};
function instance$2($$self, $$props, $$invalidate) {
  let $availSystems;
  let { activeSystem = new TTRPGSystemJSONFormatting() } = $$props;
  let availSystems = writable([]);
  component_subscribe($$self, availSystems, (value2) => $$invalidate(1, $availSystems = value2));
  const nullpreview = new SystemPreview();
  let activePreview = nullpreview;
  onMount(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let req = yield ObsidianUICoreAPI.getInstance().systemDefinition.getAllSystems();
    if (req.responseCode != 200) {
      Object.keys(req.messages).forEach((key) => {
        req.messages[key];
      });
      return;
    }
    availSystems.set((_a = req.response) !== null && _a !== void 0 ? _a : []);
    console.log($availSystems);
  }));
  function loadPreview(preview) {
    $$invalidate(0, activePreview = preview);
  }
  function unloadPreview() {
    $$invalidate(0, activePreview = nullpreview);
  }
  function onSelectSystem(d) {
    const pre = $availSystems.find((p) => p.systemCodeName == d);
    console.log(pre);
    if (activePreview == pre) {
      $$invalidate(0, activePreview = nullpreview);
      return false;
    }
    loadPreview(pre);
    return true;
  }
  nullpreview.isEditable = null;
  $$self.$$set = ($$props2) => {
    if ("activeSystem" in $$props2)
      $$invalidate(5, activeSystem = $$props2.activeSystem);
  };
  return [
    activePreview,
    $availSystems,
    availSystems,
    unloadPreview,
    onSelectSystem,
    activeSystem
  ];
}
class SystemPage extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$2, create_fragment$2, safe_not_equal, { activeSystem: 5 });
  }
}
function create_if_block_4(ctx) {
  let p;
  let t;
  return {
    c() {
      p = element("p");
      t = text("1");
    },
    l(nodes) {
      p = claim_element(nodes, "P", {});
      var p_nodes = children(p);
      t = claim_text(p_nodes, "1");
      p_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, p, anchor);
      append_hydration(p, t);
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(p);
    }
  };
}
function create_if_block_3(ctx) {
  let p;
  let t;
  return {
    c() {
      p = element("p");
      t = text("1");
    },
    l(nodes) {
      p = claim_element(nodes, "P", {});
      var p_nodes = children(p);
      t = claim_text(p_nodes, "1");
      p_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, p, anchor);
      append_hydration(p, t);
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(p);
    }
  };
}
function create_if_block_2(ctx) {
  let p;
  let t;
  return {
    c() {
      p = element("p");
      t = text("1");
    },
    l(nodes) {
      p = claim_element(nodes, "P", {});
      var p_nodes = children(p);
      t = claim_text(p_nodes, "1");
      p_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, p, anchor);
      append_hydration(p, t);
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(p);
    }
  };
}
function create_if_block_1$1(ctx) {
  let div;
  let systempage;
  let div_intro;
  let div_outro;
  let current;
  systempage = new SystemPage({});
  return {
    c() {
      div = element("div");
      create_component(systempage.$$.fragment);
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", {});
      var div_nodes = children(div);
      claim_component(systempage.$$.fragment, div_nodes);
      div_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      mount_component(systempage, div, null);
      current = true;
    },
    i(local) {
      if (current)
        return;
      transition_in(systempage.$$.fragment, local);
      add_render_callback(() => {
        if (!current)
          return;
        if (div_outro)
          div_outro.end(1);
        div_intro = create_in_transition(div, fly, { x: 100 });
        div_intro.start();
      });
      current = true;
    },
    o(local) {
      transition_out(systempage.$$.fragment, local);
      if (div_intro)
        div_intro.invalidate();
      div_outro = create_out_transition(div, fly, { x: -100 });
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_component(systempage);
      if (detaching && div_outro)
        div_outro.end();
    }
  };
}
function create_if_block$1(ctx) {
  let div;
  let homepage;
  let div_intro;
  let div_outro;
  let current;
  homepage = new HomePage({});
  return {
    c() {
      div = element("div");
      create_component(homepage.$$.fragment);
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", {});
      var div_nodes = children(div);
      claim_component(homepage.$$.fragment, div_nodes);
      div_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      mount_component(homepage, div, null);
      current = true;
    },
    i(local) {
      if (current)
        return;
      transition_in(homepage.$$.fragment, local);
      add_render_callback(() => {
        if (!current)
          return;
        if (div_outro)
          div_outro.end(1);
        div_intro = create_in_transition(div, fly, { x: 100 });
        div_intro.start();
      });
      current = true;
    },
    o(local) {
      transition_out(homepage.$$.fragment, local);
      if (div_intro)
        div_intro.invalidate();
      div_outro = create_out_transition(div, fly, { x: -100 });
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_component(homepage);
      if (detaching && div_outro)
        div_outro.end();
    }
  };
}
function create_fragment$1(ctx) {
  let div;
  let menu;
  let t;
  let section;
  let current_block_type_index;
  let if_block;
  let current;
  menu = new Menu({
    props: {
      regularOptions: ["home", "system"],
      startChosen: ctx[0]
    }
  });
  menu.$on("changePage", ctx[2]);
  const if_block_creators = [
    create_if_block$1,
    create_if_block_1$1,
    create_if_block_2,
    create_if_block_3,
    create_if_block_4
  ];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (ctx2[0] == "home")
      return 0;
    if (ctx2[0] == "system")
      return 1;
    if (ctx2[0] == "home1")
      return 2;
    if (ctx2[0] == "home2")
      return 3;
    if (ctx2[0] == "home3")
      return 4;
    return -1;
  }
  if (~(current_block_type_index = select_block_type(ctx))) {
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  }
  return {
    c() {
      div = element("div");
      create_component(menu.$$.fragment);
      t = space();
      section = element("section");
      if (if_block)
        if_block.c();
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      claim_component(menu.$$.fragment, div_nodes);
      t = claim_space(div_nodes);
      section = claim_element(div_nodes, "SECTION", { class: true });
      var section_nodes = children(section);
      if (if_block)
        if_block.l(section_nodes);
      section_nodes.forEach(detach);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(section, "class", "MainAppContainerPages");
      attr(div, "class", "MainAppContainer");
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      mount_component(menu, div, null);
      append_hydration(div, t);
      append_hydration(div, section);
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].m(section, null);
      }
      current = true;
    },
    p(ctx2, [dirty]) {
      const menu_changes = {};
      if (dirty & 1)
        menu_changes.startChosen = ctx2[0];
      menu.$set(menu_changes);
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
          if_block.m(section, null);
        } else {
          if_block = null;
        }
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(menu.$$.fragment, local);
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(menu.$$.fragment, local);
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_component(menu);
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].d();
      }
    }
  };
}
function instance$1($$self, $$props, $$invalidate) {
  let $page;
  let page = writable("system");
  component_subscribe($$self, page, (value2) => $$invalidate(0, $page = value2));
  function changePage(event) {
    page.set(event.detail);
    console.log("changePage " + page);
  }
  return [$page, page, changePage];
}
class App extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
  }
}
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
class BlockDataSchemes {
}
__publicField(BlockDataSchemes, "BASE", BASE_SCHEME);
__publicField(BlockDataSchemes, "PAGE", "PAGE");
class CNode$1 {
  constructor() {
    __publicField(this, "id");
    __publicField(this, "type");
    __publicField(this, "data");
  }
}
__decorateClass([
  JsonString({ scheme: [BlockDataSchemes.BASE, BlockDataSchemes.PAGE] })
], CNode$1.prototype, "id", 2);
__decorateClass([
  JsonString({ scheme: [BlockDataSchemes.BASE, BlockDataSchemes.PAGE] })
], CNode$1.prototype, "type", 2);
__decorateClass([
  JsonString({ scheme: [BlockDataSchemes.BASE, BlockDataSchemes.PAGE] })
], CNode$1.prototype, "data", 2);
class SheetColumn$1 {
  constructor() {
    __publicField(this, "id");
    __publicField(this, "data", []);
  }
}
__decorateClass([
  JsonString({ scheme: [BlockDataSchemes.BASE, BlockDataSchemes.PAGE] })
], SheetColumn$1.prototype, "id", 2);
__decorateClass([
  JsonArrayClassTyped(CNode$1, { scheme: [BlockDataSchemes.BASE, BlockDataSchemes.PAGE] })
], SheetColumn$1.prototype, "data", 2);
class SheetRow$1 {
  constructor() {
    __publicField(this, "id");
    __publicField(this, "data", []);
  }
}
__decorateClass([
  JsonProperty({ scheme: [BlockDataSchemes.BASE, BlockDataSchemes.PAGE] })
], SheetRow$1.prototype, "id", 2);
__decorateClass([
  JsonArrayClassTyped(SheetColumn$1, { scheme: [BlockDataSchemes.BASE, BlockDataSchemes.PAGE] })
], SheetRow$1.prototype, "data", 2);
class SheetData$1 {
  constructor() {
    __publicField(this, "id");
    __publicField(this, "data", []);
  }
}
__decorateClass([
  JsonProperty({ scheme: [BlockDataSchemes.BASE, BlockDataSchemes.PAGE] })
], SheetData$1.prototype, "id", 2);
__decorateClass([
  JsonArrayClassTyped(SheetRow$1, { scheme: [BlockDataSchemes.BASE, BlockDataSchemes.PAGE] })
], SheetData$1.prototype, "data", 2);
class BlockData {
  constructor() {
    __publicField(this, "BlockUUID", PluginHandler.uuidv4());
    __publicField(this, "systemDataInFrontMatter", false);
    __publicField(this, "systemDataInFrontMatter_key", "");
    __publicField(this, "systemChosen");
    __publicField(this, "LayoutChosen");
    __publicField(this, "characterValues", {});
    __publicField(this, "layout");
  }
}
__publicField(BlockData, "schemes", BlockDataSchemes);
__decorateClass([
  JsonString({ scheme: [BlockDataSchemes.BASE, BlockDataSchemes.PAGE] })
], BlockData.prototype, "BlockUUID", 2);
__decorateClass([
  JsonBoolean({ scheme: [BlockDataSchemes.BASE, BlockDataSchemes.PAGE] })
], BlockData.prototype, "systemDataInFrontMatter", 2);
__decorateClass([
  JsonString({ scheme: [BlockDataSchemes.BASE, BlockDataSchemes.PAGE] })
], BlockData.prototype, "systemDataInFrontMatter_key", 2);
__decorateClass([
  JsonProperty({ type: SystemPreview, scheme: [BlockDataSchemes.BASE, BlockDataSchemes.PAGE] })
], BlockData.prototype, "systemChosen", 2);
__decorateClass([
  JsonProperty({ type: UILayoutModel, scheme: [BlockDataSchemes.BASE, BlockDataSchemes.PAGE] })
], BlockData.prototype, "LayoutChosen", 2);
__decorateClass([
  JsonProperty({ scheme: [BlockDataSchemes.BASE, BlockDataSchemes.PAGE] })
], BlockData.prototype, "characterValues", 2);
__decorateClass([
  JsonClassTyped(SheetData$1, { scheme: [BlockDataSchemes.BASE, BlockDataSchemes.PAGE] })
], BlockData.prototype, "layout", 2);
const BlockStarter$1 = "";
class CNode {
  constructor(type = "NONE", data = "{}") {
    __publicField(this, "id");
    __publicField(this, "type");
    __publicField(this, "data");
    this.id = dist.keyManagerInstance.getNewKey();
    this.type = type;
    this.data = JSON.parse(data);
  }
}
class SheetColumn {
  constructor(data = []) {
    __publicField(this, "id");
    __publicField(this, "data", []);
    this.id = dist.keyManagerInstance.getNewKey();
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
    let i = this.data.findIndex((p) => (p == null ? void 0 : p.id) == id);
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
    this.id = dist.keyManagerInstance.getNewKey();
    this.data = [];
    data.forEach((d) => {
      this.data.push(new SheetColumn(d.data));
    });
  }
  addColumn() {
    this.data.push(new SheetColumn());
  }
  remColumn(id) {
    let i = this.data.findIndex((p) => (p == null ? void 0 : p.id) == id);
    if (i == -1) {
      console.error("cant remove column, since id is not present in data");
      return;
    }
    this.data.splice(i, 1);
  }
}
class SheetData {
  constructor(data) {
    __publicField(this, "id");
    __publicField(this, "data", []);
    this.id = dist.keyManagerInstance.getNewKey();
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
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[16] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[19] = list[i];
  return child_ctx;
}
function create_each_block_1(ctx) {
  let option;
  let t_value = ctx[19].systemName + "";
  let t;
  let option_value_value;
  return {
    c() {
      option = element("option");
      t = text(t_value);
      this.h();
    },
    l(nodes) {
      option = claim_element(nodes, "OPTION", {});
      var option_nodes = children(option);
      t = claim_text(option_nodes, t_value);
      option_nodes.forEach(detach);
      this.h();
    },
    h() {
      option.__value = option_value_value = ctx[19].id;
      option.value = option.__value;
    },
    m(target, anchor) {
      insert_hydration(target, option, anchor);
      append_hydration(option, t);
    },
    p(ctx2, dirty) {
      if (dirty & 2 && t_value !== (t_value = ctx2[19].systemName + ""))
        set_data(t, t_value);
      if (dirty & 2 && option_value_value !== (option_value_value = ctx2[19].id)) {
        option.__value = option_value_value;
        option.value = option.__value;
      }
    },
    d(detaching) {
      if (detaching)
        detach(option);
    }
  };
}
function create_if_block_1(ctx) {
  let select;
  let option;
  let t;
  let select_transition;
  let current;
  let mounted;
  let dispose;
  let each_value = ctx[3];
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  return {
    c() {
      select = element("select");
      option = element("option");
      t = text("Select a Layout ");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      this.h();
    },
    l(nodes) {
      select = claim_element(nodes, "SELECT", {});
      var select_nodes = children(select);
      option = claim_element(select_nodes, "OPTION", {});
      var option_nodes = children(option);
      t = claim_text(option_nodes, "Select a Layout ");
      option_nodes.forEach(detach);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].l(select_nodes);
      }
      select_nodes.forEach(detach);
      this.h();
    },
    h() {
      option.__value = "-1";
      option.value = option.__value;
    },
    m(target, anchor) {
      insert_hydration(target, select, anchor);
      append_hydration(select, option);
      append_hydration(option, t);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(select, null);
        }
      }
      current = true;
      if (!mounted) {
        dispose = listen(select, "change", ctx[6]);
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & 8) {
        each_value = ctx2[3];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
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
    i(local) {
      if (current)
        return;
      add_render_callback(() => {
        if (!current)
          return;
        if (!select_transition)
          select_transition = create_bidirectional_transition(select, slide, {}, true);
        select_transition.run(1);
      });
      current = true;
    },
    o(local) {
      if (!select_transition)
        select_transition = create_bidirectional_transition(select, slide, {}, false);
      select_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(select);
      destroy_each(each_blocks, detaching);
      if (detaching && select_transition)
        select_transition.end();
      mounted = false;
      dispose();
    }
  };
}
function create_each_block(ctx) {
  let option;
  let t_value = ctx[16].name + "";
  let t;
  let option_value_value;
  return {
    c() {
      option = element("option");
      t = text(t_value);
      this.h();
    },
    l(nodes) {
      option = claim_element(nodes, "OPTION", {});
      var option_nodes = children(option);
      t = claim_text(option_nodes, t_value);
      option_nodes.forEach(detach);
      this.h();
    },
    h() {
      option.__value = option_value_value = ctx[16].id;
      option.value = option.__value;
    },
    m(target, anchor) {
      insert_hydration(target, option, anchor);
      append_hydration(option, t);
    },
    p(ctx2, dirty) {
      if (dirty & 8 && t_value !== (t_value = ctx2[16].name + ""))
        set_data(t, t_value);
      if (dirty & 8 && option_value_value !== (option_value_value = ctx2[16].id)) {
        option.__value = option_value_value;
        option.value = option.__value;
      }
    },
    d(detaching) {
      if (detaching)
        detach(option);
    }
  };
}
function create_if_block(ctx) {
  let div;
  let button;
  let t;
  let div_transition;
  let current;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      button = element("button");
      t = text("Save , Write And Load");
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", {});
      var div_nodes = children(div);
      button = claim_element(div_nodes, "BUTTON", { class: true, "data-color": true });
      var button_nodes = children(button);
      t = claim_text(button_nodes, "Save , Write And Load");
      button_nodes.forEach(detach);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(button, "class", "ColoredInteractive");
      attr(button, "data-color", "green");
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      append_hydration(div, button);
      append_hydration(button, t);
      current = true;
      if (!mounted) {
        dispose = listen(button, "click", ctx[10]);
        mounted = true;
      }
    },
    p: noop,
    i(local) {
      if (current)
        return;
      add_render_callback(() => {
        if (!current)
          return;
        if (!div_transition)
          div_transition = create_bidirectional_transition(div, slide, {}, true);
        div_transition.run(1);
      });
      current = true;
    },
    o(local) {
      if (!div_transition)
        div_transition = create_bidirectional_transition(div, slide, {}, false);
      div_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      if (detaching && div_transition)
        div_transition.end();
      mounted = false;
      dispose();
    }
  };
}
function create_fragment(ctx) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  let div15;
  let staticmessagehandler;
  let t0;
  let div0;
  let t1;
  let div14;
  let section;
  let b;
  let t2;
  let t3;
  let p;
  let t4;
  let t5;
  let div11;
  let div5;
  let div1;
  let t6;
  let t7;
  let div2;
  let select;
  let option;
  let t8;
  let t9;
  let div3;
  let t10;
  let t11_value = ((_b = (_a = ctx[2]) == null ? void 0 : _a.author) != null ? _b : "-") + "";
  let t11;
  let t12;
  let div4;
  let t13;
  let t14_value = ((_d = (_c = ctx[2]) == null ? void 0 : _c.version) != null ? _d : "-") + "";
  let t14;
  let t15;
  let div10;
  let div6;
  let t16;
  let t17;
  let div7;
  let t18;
  let div8;
  let t19;
  let t20_value = ((_f = (_e = ctx[4]) == null ? void 0 : _e.author) != null ? _f : "-") + "";
  let t20;
  let t21;
  let div9;
  let t22;
  let t23_value = ((_h = (_g = ctx[4]) == null ? void 0 : _g.version) != null ? _h : "-") + "";
  let t23;
  let div11_transition;
  let t24;
  let div12;
  let t25;
  let t26;
  let div13;
  let t27;
  let pre;
  let t28;
  let t29;
  let t30;
  let current;
  let mounted;
  let dispose;
  let staticmessagehandler_props = {};
  staticmessagehandler = new StaticMessageHandler({ props: staticmessagehandler_props });
  ctx[9](staticmessagehandler);
  let each_value_1 = ctx[1];
  let each_blocks = [];
  for (let i = 0; i < each_value_1.length; i += 1) {
    each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
  }
  let if_block0 = ctx[2] && ctx[3] && create_if_block_1(ctx);
  let if_block1 = ctx[4] && create_if_block(ctx);
  return {
    c() {
      div15 = element("div");
      create_component(staticmessagehandler.$$.fragment);
      t0 = space();
      div0 = element("div");
      t1 = space();
      div14 = element("div");
      section = element("section");
      b = element("b");
      t2 = text("Select Presets To Use");
      t3 = space();
      p = element("p");
      t4 = text("To Use this Addon, you must choose a system to use, and a UI for that system to use.\r\n				first select your system, and then select your layout");
      t5 = space();
      div11 = element("div");
      div5 = element("div");
      div1 = element("div");
      t6 = text("Chosen System");
      t7 = space();
      div2 = element("div");
      select = element("select");
      option = element("option");
      t8 = text("Select a System ");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      t9 = space();
      div3 = element("div");
      t10 = text("Author: ");
      t11 = text(t11_value);
      t12 = space();
      div4 = element("div");
      t13 = text("version: ");
      t14 = text(t14_value);
      t15 = space();
      div10 = element("div");
      div6 = element("div");
      t16 = text("Chosen Layout");
      t17 = space();
      div7 = element("div");
      if (if_block0)
        if_block0.c();
      t18 = space();
      div8 = element("div");
      t19 = text("Author: ");
      t20 = text(t20_value);
      t21 = space();
      div9 = element("div");
      t22 = text("version: ");
      t23 = text(t23_value);
      t24 = space();
      div12 = element("div");
      t25 = space();
      if (if_block1)
        if_block1.c();
      t26 = space();
      div13 = element("div");
      t27 = space();
      pre = element("pre");
      t28 = text("		");
      t29 = text(PREJSON);
      t30 = text("\r\n	");
      this.h();
    },
    l(nodes) {
      div15 = claim_element(nodes, "DIV", { class: true });
      var div15_nodes = children(div15);
      claim_component(staticmessagehandler.$$.fragment, div15_nodes);
      t0 = claim_space(div15_nodes);
      div0 = claim_element(div15_nodes, "DIV", { style: true });
      var div0_nodes = children(div0);
      div0_nodes.forEach(detach);
      t1 = claim_space(div15_nodes);
      div14 = claim_element(div15_nodes, "DIV", { class: true });
      var div14_nodes = children(div14);
      section = claim_element(div14_nodes, "SECTION", {});
      var section_nodes = children(section);
      b = claim_element(section_nodes, "B", {});
      var b_nodes = children(b);
      t2 = claim_text(b_nodes, "Select Presets To Use");
      b_nodes.forEach(detach);
      t3 = claim_space(section_nodes);
      p = claim_element(section_nodes, "P", {});
      var p_nodes = children(p);
      t4 = claim_text(p_nodes, "To Use this Addon, you must choose a system to use, and a UI for that system to use.\r\n				first select your system, and then select your layout");
      p_nodes.forEach(detach);
      section_nodes.forEach(detach);
      t5 = claim_space(div14_nodes);
      div11 = claim_element(div14_nodes, "DIV", { class: true });
      var div11_nodes = children(div11);
      div5 = claim_element(div11_nodes, "DIV", { class: true });
      var div5_nodes = children(div5);
      div1 = claim_element(div5_nodes, "DIV", { style: true });
      var div1_nodes = children(div1);
      t6 = claim_text(div1_nodes, "Chosen System");
      div1_nodes.forEach(detach);
      t7 = claim_space(div5_nodes);
      div2 = claim_element(div5_nodes, "DIV", {});
      var div2_nodes = children(div2);
      select = claim_element(div2_nodes, "SELECT", {});
      var select_nodes = children(select);
      option = claim_element(select_nodes, "OPTION", {});
      var option_nodes = children(option);
      t8 = claim_text(option_nodes, "Select a System ");
      option_nodes.forEach(detach);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].l(select_nodes);
      }
      select_nodes.forEach(detach);
      div2_nodes.forEach(detach);
      t9 = claim_space(div5_nodes);
      div3 = claim_element(div5_nodes, "DIV", {});
      var div3_nodes = children(div3);
      t10 = claim_text(div3_nodes, "Author: ");
      t11 = claim_text(div3_nodes, t11_value);
      div3_nodes.forEach(detach);
      t12 = claim_space(div5_nodes);
      div4 = claim_element(div5_nodes, "DIV", {});
      var div4_nodes = children(div4);
      t13 = claim_text(div4_nodes, "version: ");
      t14 = claim_text(div4_nodes, t14_value);
      div4_nodes.forEach(detach);
      div5_nodes.forEach(detach);
      t15 = claim_space(div11_nodes);
      div10 = claim_element(div11_nodes, "DIV", { class: true });
      var div10_nodes = children(div10);
      div6 = claim_element(div10_nodes, "DIV", { style: true });
      var div6_nodes = children(div6);
      t16 = claim_text(div6_nodes, "Chosen Layout");
      div6_nodes.forEach(detach);
      t17 = claim_space(div10_nodes);
      div7 = claim_element(div10_nodes, "DIV", {});
      var div7_nodes = children(div7);
      if (if_block0)
        if_block0.l(div7_nodes);
      div7_nodes.forEach(detach);
      t18 = claim_space(div10_nodes);
      div8 = claim_element(div10_nodes, "DIV", {});
      var div8_nodes = children(div8);
      t19 = claim_text(div8_nodes, "Author: ");
      t20 = claim_text(div8_nodes, t20_value);
      div8_nodes.forEach(detach);
      t21 = claim_space(div10_nodes);
      div9 = claim_element(div10_nodes, "DIV", {});
      var div9_nodes = children(div9);
      t22 = claim_text(div9_nodes, "version: ");
      t23 = claim_text(div9_nodes, t23_value);
      div9_nodes.forEach(detach);
      div10_nodes.forEach(detach);
      div11_nodes.forEach(detach);
      t24 = claim_space(div14_nodes);
      div12 = claim_element(div14_nodes, "DIV", { style: true });
      children(div12).forEach(detach);
      t25 = claim_space(div14_nodes);
      if (if_block1)
        if_block1.l(div14_nodes);
      t26 = claim_space(div14_nodes);
      div13 = claim_element(div14_nodes, "DIV", { style: true });
      children(div13).forEach(detach);
      div14_nodes.forEach(detach);
      t27 = claim_space(div15_nodes);
      pre = claim_element(div15_nodes, "PRE", {});
      var pre_nodes = children(pre);
      t28 = claim_text(pre_nodes, "		");
      t29 = claim_text(pre_nodes, PREJSON);
      t30 = claim_text(pre_nodes, "\r\n	");
      pre_nodes.forEach(detach);
      div15_nodes.forEach(detach);
      this.h();
    },
    h() {
      set_style(div0, "height", "20px");
      set_style(div1, "width", "100px");
      option.__value = "-1";
      option.value = option.__value;
      attr(div5, "class", "SystemTableRow SelectRow");
      set_style(div6, "width", "100px");
      attr(div10, "class", "SystemTableRow SelectRow");
      attr(div11, "class", "BlocksStarterInteractiveContainer SystemTable");
      set_style(div12, "height", "10px");
      set_style(div13, "height", "20px");
      attr(div14, "class", "SystemSelectStage ");
      attr(div15, "class", "BlockStarter");
    },
    m(target, anchor) {
      insert_hydration(target, div15, anchor);
      mount_component(staticmessagehandler, div15, null);
      append_hydration(div15, t0);
      append_hydration(div15, div0);
      append_hydration(div15, t1);
      append_hydration(div15, div14);
      append_hydration(div14, section);
      append_hydration(section, b);
      append_hydration(b, t2);
      append_hydration(section, t3);
      append_hydration(section, p);
      append_hydration(p, t4);
      append_hydration(div14, t5);
      append_hydration(div14, div11);
      append_hydration(div11, div5);
      append_hydration(div5, div1);
      append_hydration(div1, t6);
      append_hydration(div5, t7);
      append_hydration(div5, div2);
      append_hydration(div2, select);
      append_hydration(select, option);
      append_hydration(option, t8);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(select, null);
        }
      }
      append_hydration(div5, t9);
      append_hydration(div5, div3);
      append_hydration(div3, t10);
      append_hydration(div3, t11);
      append_hydration(div5, t12);
      append_hydration(div5, div4);
      append_hydration(div4, t13);
      append_hydration(div4, t14);
      append_hydration(div11, t15);
      append_hydration(div11, div10);
      append_hydration(div10, div6);
      append_hydration(div6, t16);
      append_hydration(div10, t17);
      append_hydration(div10, div7);
      if (if_block0)
        if_block0.m(div7, null);
      append_hydration(div10, t18);
      append_hydration(div10, div8);
      append_hydration(div8, t19);
      append_hydration(div8, t20);
      append_hydration(div10, t21);
      append_hydration(div10, div9);
      append_hydration(div9, t22);
      append_hydration(div9, t23);
      append_hydration(div14, t24);
      append_hydration(div14, div12);
      append_hydration(div14, t25);
      if (if_block1)
        if_block1.m(div14, null);
      append_hydration(div14, t26);
      append_hydration(div14, div13);
      append_hydration(div15, t27);
      append_hydration(div15, pre);
      append_hydration(pre, t28);
      append_hydration(pre, t29);
      append_hydration(pre, t30);
      current = true;
      if (!mounted) {
        dispose = listen(select, "change", ctx[5]);
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2;
      const staticmessagehandler_changes = {};
      staticmessagehandler.$set(staticmessagehandler_changes);
      if (dirty & 2) {
        each_value_1 = ctx2[1];
        let i;
        for (i = 0; i < each_value_1.length; i += 1) {
          const child_ctx = get_each_context_1(ctx2, each_value_1, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
          } else {
            each_blocks[i] = create_each_block_1(child_ctx);
            each_blocks[i].c();
            each_blocks[i].m(select, null);
          }
        }
        for (; i < each_blocks.length; i += 1) {
          each_blocks[i].d(1);
        }
        each_blocks.length = each_value_1.length;
      }
      if ((!current || dirty & 4) && t11_value !== (t11_value = ((_b2 = (_a2 = ctx2[2]) == null ? void 0 : _a2.author) != null ? _b2 : "-") + ""))
        set_data(t11, t11_value);
      if ((!current || dirty & 4) && t14_value !== (t14_value = ((_d2 = (_c2 = ctx2[2]) == null ? void 0 : _c2.version) != null ? _d2 : "-") + ""))
        set_data(t14, t14_value);
      if (ctx2[2] && ctx2[3]) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty & 12) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_1(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(div7, null);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      if ((!current || dirty & 16) && t20_value !== (t20_value = ((_f2 = (_e2 = ctx2[4]) == null ? void 0 : _e2.author) != null ? _f2 : "-") + ""))
        set_data(t20, t20_value);
      if ((!current || dirty & 16) && t23_value !== (t23_value = ((_h2 = (_g2 = ctx2[4]) == null ? void 0 : _g2.version) != null ? _h2 : "-") + ""))
        set_data(t23, t23_value);
      if (ctx2[4]) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & 16) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div14, t26);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(staticmessagehandler.$$.fragment, local);
      transition_in(if_block0);
      add_render_callback(() => {
        if (!current)
          return;
        if (!div11_transition)
          div11_transition = create_bidirectional_transition(div11, slide, {}, true);
        div11_transition.run(1);
      });
      transition_in(if_block1);
      current = true;
    },
    o(local) {
      transition_out(staticmessagehandler.$$.fragment, local);
      transition_out(if_block0);
      if (!div11_transition)
        div11_transition = create_bidirectional_transition(div11, slide, {}, false);
      div11_transition.run(0);
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div15);
      ctx[9](null);
      destroy_component(staticmessagehandler);
      destroy_each(each_blocks, detaching);
      if (if_block0)
        if_block0.d();
      if (detaching && div11_transition)
        div11_transition.end();
      if (if_block1)
        if_block1.d();
      mounted = false;
      dispose();
    }
  };
}
let PREJSON = "";
function instance($$self, $$props, $$invalidate) {
  let { WriteDown } = $$props;
  let api = ObsidianUICoreAPI.getInstance();
  let msgHandler;
  let systems = [];
  let selected_system = null;
  let layouts = null;
  let selectedLayout = null;
  function LoadSystemOptions() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
      let resp = yield api.systemDefinition.getAllSystems();
      if (resp.responseCode != 200) {
        let k = Object.keys(resp.messages);
        for (let i = 0; i < k.length; i++) {
          const key = k[i];
          const msg = resp.messages[key];
          msgHandler.addMessage(key, msg);
        }
        return;
      }
      $$invalidate(1, systems = (_a = resp.response) !== null && _a !== void 0 ? _a : []);
    });
  }
  onMount(() => {
    LoadSystemOptions();
  });
  function onChangeSelectSystem(event) {
    const targ = event.target;
    if (targ.value == "-1") {
      $$invalidate(2, selected_system = null);
      $$invalidate(4, selectedLayout = null);
      $$invalidate(3, layouts = null);
      return;
    }
    const sys = systems.find((p) => p.id == targ.value);
    if (sys)
      selectSystem(sys);
  }
  function selectSystem(system) {
    $$invalidate(4, selectedLayout = null);
    $$invalidate(3, layouts = null);
    if (selected_system == system) {
      $$invalidate(2, selected_system = null);
      return;
    } else {
      $$invalidate(2, selected_system = system);
      LoadSystemUIOptions();
    }
  }
  function LoadSystemUIOptions() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
      if (!selected_system) {
        return;
      }
      let resp = yield api.UIImportExport.getAllAvailableUIsForSystem(selected_system);
      if (resp.responseCode != 200) {
        const keys = Object.keys(resp.messages);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const msg = resp.messages[key];
          msgHandler.addMessageManual(key, msg.msg, msg.type);
        }
      } else {
        $$invalidate(3, layouts = (_a = resp.response) !== null && _a !== void 0 ? _a : []);
      }
    });
  }
  function onChangeSelectLayout(event) {
    const targ = event.target;
    if (targ.value == "-1") {
      $$invalidate(4, selectedLayout = null);
      $$invalidate(3, layouts = null);
      return;
    }
    if (!layouts)
      return;
    const lay = layouts.find((p) => p.id == targ.value);
    if (lay)
      selectLayout(lay);
  }
  function selectLayout(layout) {
    if (selectedLayout == layout) {
      $$invalidate(4, selectedLayout = null);
      return;
    }
    $$invalidate(4, selectedLayout = layout);
  }
  function saveAndLoad() {
    return __awaiter(this, void 0, void 0, function* () {
      if (!(selected_system && selectedLayout)) {
        return;
      }
      let S = yield api.systemFactory.getOrCreateSystemFactory(selected_system);
      if (S.responseCode != 200) {
        const keys = Object.keys(S.messages);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const msg = S.messages[key];
          msgHandler.addMessageManual(key, msg.msg, msg.type);
        }
        return;
      }
      let systemObj = S.response;
      let FixedCommands = {};
      Object.keys(systemObj.fixed.collections_names).forEach((col_key) => {
        const col = systemObj.fixed.collections_names[col_key];
        Object.keys(col.nodes_names).forEach((node_key) => {
          const node = col.nodes_names[node_key];
          FixedCommands["fixed." + col_key + "." + node_key] = node.getValue();
        });
      });
      let out = new BlockData();
      out.characterValues = FixedCommands;
      out.layout = new SheetData([]);
      out.layout.addRow();
      out.layout.data[0].addColumn();
      out.layout.data[0].data[0].addItem();
      out.systemChosen = JSONHandler.deserialize(SystemPreview, JSONHandler.serialize(systemObj, TTRPG_SCHEMES.PREVIEW));
      out.LayoutChosen = selectedLayout;
      WriteDown(JSONHandler.serialize(out, BlockDataSchemes.PAGE));
    });
  }
  function staticmessagehandler_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      msgHandler = $$value;
      $$invalidate(0, msgHandler);
    });
  }
  const click_handler = () => saveAndLoad();
  $$self.$$set = ($$props2) => {
    if ("WriteDown" in $$props2)
      $$invalidate(8, WriteDown = $$props2.WriteDown);
  };
  return [
    msgHandler,
    systems,
    selected_system,
    layouts,
    selectedLayout,
    onChangeSelectSystem,
    onChangeSelectLayout,
    saveAndLoad,
    WriteDown,
    staticmessagehandler_binding,
    click_handler
  ];
}
class BlockStarter extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, { WriteDown: 8 });
  }
}
class BlockRenderer {
  constructor(textContent, element2, context) {
    __publicField(this, "text");
    __publicField(this, "element");
    __publicField(this, "context");
    __publicField(this, "blockData");
    this.text = textContent != null ? textContent : "";
    this.element = element2;
    this.context = context;
  }
  findBlockAndPasteInto(filetext, content) {
    let blockHead = "```" + PluginHandler.SYSTEM_LAYOUT_BLOCKNAME;
    let pieces = filetext.split(blockHead);
    if (pieces.length == 2) {
      let afterblock_index = pieces[1].indexOf("```");
      pieces[1].substring(0, afterblock_index);
      let afterblock = pieces[1].split("```", 2)[1];
      let page = pieces[0] + blockHead + "\n" + content + "\n```" + afterblock;
      return page;
    }
    return "";
  }
  async writeBlock(txt) {
    const app2 = PluginHandler.self.app;
    const vault = app2.vault;
    let file = vault.getFileByPath(this.context.sourcePath);
    if (!file) {
      return "";
    }
    const fileContent = await app2.vault.read(file);
    let page = this.findBlockAndPasteInto(fileContent, txt);
    vault.modify(file, page);
  }
  async getSystem(tag, blockData) {
    var _a;
    let resp = await ObsidianUICoreAPI.getInstance().systemDefinition.getAllSystems();
    if (resp.responseCode != 200) {
      tag.innerHTML = "<div>TTPRPG - Could Not Load Available Systems</div>";
      return null;
    }
    let chosenSystem = (_a = resp.response) == null ? void 0 : _a.find((p) => p.systemCodeName == blockData.systemChosen.systemCodeName);
    if (!chosenSystem) {
      tag.innerHTML = "<div>The Chosen TTRPG did not apear in Available Systems </div>";
      return null;
    }
    let resp2 = await ObsidianUICoreAPI.getInstance().systemFactory.getOrCreateSystemFactory(chosenSystem);
    if (resp2.responseCode != 200) {
      tag.innerHTML = "<div>SOMETHING WENT WRONG 2</div>";
      return null;
    }
    let sys = resp2.response;
    return sys;
  }
  setSystemValuesFromBlockData(sys, blockData) {
    var _a, _b;
    let commandDict = {};
    const group_key = "fixed";
    const col_keys = Object.keys(sys.fixed.collections_names);
    for (let c = 0; c < col_keys.length; c++) {
      const col_key = col_keys[c];
      const col = sys.fixed.collections_names[col_key];
      const node_keys = Object.keys(col.nodes_names);
      for (let n = 0; n < node_keys.length; n++) {
        const node_key = node_keys[n];
        const node = col.nodes_names[node_key];
        commandDict[group_key + "." + col_key + "." + node_key] = (_a = node.getValue()) != null ? _a : 0;
      }
    }
    let blockCommands = Object.keys(blockData.characterValues);
    for (let c = 0; c < blockCommands.length; c++) {
      const cmd = blockCommands[c];
      commandDict[cmd] = blockData.characterValues[cmd];
    }
    const commands = Object.keys(commandDict);
    for (let c = 0; c < commands.length; c++) {
      const cmd = commands[c];
      const seg = cmd.split(".");
      (_b = sys.getNode(seg[0], seg[1], seg[2])) == null ? void 0 : _b.setValue(commandDict[cmd]);
    }
  }
  static getSystemValuesForBlockData(sys) {
    let commandDict = {};
    const group_key = "fixed";
    const col_keys = Object.keys(sys.fixed.collections_names);
    for (let c = 0; c < col_keys.length; c++) {
      const col_key = col_keys[c];
      const col = sys.fixed.collections_names[col_key];
      const node_keys = Object.keys(col.nodes_names);
      for (let n = 0; n < node_keys.length; n++) {
        const node_key = node_keys[n];
        const node = col.nodes_names[node_key];
        if (node.getValue() != 0) {
          commandDict[group_key + "." + col_key + "." + node_key] = node.getValue();
        }
      }
    }
    return commandDict;
  }
  async render() {
    let text2 = this.text;
    text2.trim();
    if (text2 == "") {
      this.writeBlock(PluginHandler.uuidv4());
      return;
    }
    function isValidBlockText(self) {
      try {
        let t = self.text;
        t.trim();
        if (t == "") {
          return null;
        }
        let blockData2 = JSONHandler.deserialize(BlockData, t, BlockData.schemes.PAGE);
        return blockData2;
      } catch (e) {
        return null;
      }
    }
    let blockData = isValidBlockText(this);
    if (blockData) {
      let systemPath = path__default.default.join(PluginHandler.SYSTEMS_FOLDER_NAME, "grobax1", PluginHandler.SYSTEM_UI_CONTAINER_FOLDER_NAME, "default");
      let obsidianPath = path__default.default.join(PluginHandler.self.manifest.dir, systemPath);
      let CSS = await FileHandler.readFile(obsidianPath + "/style.css");
      if (window["GrobaxTTRPGGlobalVariable"][blockData.BlockUUID]) {
        return;
      }
      let container = this.element.createEl("div");
      container.setAttr("data-hasViewActive", "true");
      let style = container.createEl("style");
      style.innerHTML = CSS;
      let AppContainer = container.createEl("div");
      AppContainer.id = blockData.BlockUUID;
      let script = container.createEl("script");
      script.setAttribute("type", "module");
      let sys = await this.getSystem(AppContainer, blockData);
      if (!sys) {
        return;
      }
      this.setSystemValuesFromBlockData(sys, blockData);
      window["GrobaxTTRPGGlobalVariable"][blockData.BlockUUID] = {};
      window["GrobaxTTRPGGlobalVariable"][blockData.BlockUUID]["sys"] = sys;
      window["GrobaxTTRPGGlobalVariable"][blockData.BlockUUID]["func"] = (layoutChange, system) => {
        blockData.layout = layoutChange;
        blockData.characterValues = BlockRenderer.getSystemValuesForBlockData(system);
        const txt = JSONHandler.serialize(blockData, BlockDataSchemes.PAGE);
        window["GrobaxTTRPGGlobalVariable"][blockData.BlockUUID] = void 0;
        this.writeBlock(txt);
      };
      let path_JS = PluginHandler.App.vault.adapter.getResourcePath(obsidianPath + "/components.js");
      const textData = JSON.stringify(blockData.layout).replaceAll('"', '\\"');
      script.innerHTML = ` 
				import App from '${path_JS}';	
				let key = '${blockData.BlockUUID}';
				const sys = window['GrobaxTTRPGGlobalVariable']['${blockData.BlockUUID}']['sys'];
				
				const element = document.getElementById('${blockData.BlockUUID}');
				const textData= '` + textData + `';
				 
				const app = new App({
					target:element,
					props: {
						textData:textData,
						sys:sys,
						writeBlock:window['GrobaxTTRPGGlobalVariable']['${blockData.BlockUUID}']['func']
					}
				});  
			`;
    } else {
      new BlockStarter({
        target: this.element,
        props: {
          WriteDown: (txt) => this.writeBlock(txt)
        }
      });
    }
  }
}
const VIEW_TYPE = "svelte-view";
const DEFAULT_SETTINGS = {
  mySetting: "default"
};
const _PluginHandler = class extends obsidian.Plugin {
  constructor() {
    super(...arguments);
    __publicField(this, "settings");
  }
  static uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  async onload() {
    await this.loadSettings();
    _PluginHandler.self = this;
    _PluginHandler.App = this.app;
    _PluginHandler.ROOT = _PluginHandler.App.vault.configDir;
    _PluginHandler.PLUGIN_ROOT = this.manifest.dir;
    _PluginHandler.SYSTEMS_FOLDER_NAME = "Systems";
    _PluginHandler.BUILTIN_UIS_FOLDER_NAME = "subProjects/BlockUIDev";
    _PluginHandler.SYSTEM_UI_CONTAINER_FOLDER_NAME = "UILayouts";
    _PluginHandler.SYSTEM_UI_LAYOUTFILENAME = "UIPreview.json";
    _PluginHandler.GLOBAL_SYSTEM_PASSER = "GrobaxTTRPGGlobalVariable";
    _PluginHandler.SYSTEM_LAYOUT_BLOCKNAME = "TTRPG";
    this.addRibbonIcon("dice", "Hanss' Plugin", (evt) => {
      new ModalMount(this.app, this).open();
    });
    this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
    this.addSettingTab(new SampleSettingTab(this.app, this));
    this.registerMarkdownCodeBlockProcessor(_PluginHandler.SYSTEM_LAYOUT_BLOCKNAME, (source, el, ctx) => {
      const renderer = new BlockRenderer(source, el, ctx);
      renderer.render();
    });
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => {
        if (leaf) {
          window[_PluginHandler.GLOBAL_SYSTEM_PASSER] = {};
        }
      })
    );
  }
  onLayoutReady() {
    var _a;
    if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length) {
      return;
    }
    (_a = this.app.workspace.getRightLeaf(false)) == null ? void 0 : _a.setViewState({
      type: VIEW_TYPE
    });
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
};
let PluginHandler = _PluginHandler;
__publicField(PluginHandler, "App");
__publicField(PluginHandler, "ROOT");
__publicField(PluginHandler, "PLUGIN_ROOT");
__publicField(PluginHandler, "SYSTEMS_FOLDER_NAME");
__publicField(PluginHandler, "BUILTIN_UIS_FOLDER_NAME");
__publicField(PluginHandler, "SYSTEM_UI_CONTAINER_FOLDER_NAME");
__publicField(PluginHandler, "SYSTEM_UI_LAYOUTFILENAME");
__publicField(PluginHandler, "SYSTEM_LAYOUT_BLOCKNAME");
__publicField(PluginHandler, "GLOBAL_SYSTEM_PASSER");
__publicField(PluginHandler, "self");
class SampleSettingTab extends obsidian.PluginSettingTab {
  constructor(app2, plugin) {
    super(app2, plugin);
    __publicField(this, "plugin");
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new App({
      target: this.containerEl,
      props: {
        plugin: this.plugin
      }
    });
  }
}
class ModalMount extends obsidian.Modal {
  constructor(app2, plugin) {
    super(app2);
    __publicField(this, "plugin");
    this.plugin = plugin;
  }
  onOpen() {
    new App({
      target: this.contentEl,
      props: {
        plugin: this.plugin
      }
    });
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
module.exports = PluginHandler;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiVFNGcm9udEVuZC9ub2RlX21vZHVsZXMvc3ZlbHRlL2ludGVybmFsL2luZGV4Lm1qcyIsIlRTRnJvbnRFbmQvbm9kZV9tb2R1bGVzL3N2ZWx0ZS9lYXNpbmcvaW5kZXgubWpzIiwiVFNGcm9udEVuZC9ub2RlX21vZHVsZXMvc3ZlbHRlL3RyYW5zaXRpb24vaW5kZXgubWpzIiwiVFNGcm9udEVuZC9zcmMvTW9kdWxlcy9PYnNpZGlhblVJL1VJSW50ZXJmYWNlcy9EZXNpZ25lcjAyL1ZpZXdzL01lbnUvTWVudUJ0bi5zdmVsdGUiLCJUU0Zyb250RW5kL3NyYy9Nb2R1bGVzL09ic2lkaWFuVUkvVUlJbnRlcmZhY2VzL0Rlc2lnbmVyMDIvVmlld3MvTWVudS9NZW51LnN2ZWx0ZSIsIlRTRnJvbnRFbmQvc3JjL01vZHVsZXMvT2JzaWRpYW5VSS9VSUludGVyZmFjZXMvRGVzaWduZXIwMi9WaWV3cy9QYWdlL0hvbWVQYWdlLnN2ZWx0ZSIsIlRTRnJvbnRFbmQvbm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIlRTRnJvbnRFbmQvc3JjL01vZHVsZXMvT2JzaWRpYW5VSS9VSUludGVyZmFjZXMvRGVzaWduZXIwMi9Db21wb25lbnRzL2J1dHRvbnMvcGx1cy5zdmVsdGUiLCJUU0Zyb250RW5kL3NyYy9Nb2R1bGVzL09ic2lkaWFuVUkvVUlJbnRlcmZhY2VzL0Rlc2lnbmVyMDIvQ29tcG9uZW50cy9lZGl0QWJsZUxpc3QvRWRpdEFibGVMaXN0LnN2ZWx0ZSIsIlRTRnJvbnRFbmQvbm9kZV9tb2R1bGVzL3N2ZWx0ZS9zdG9yZS9pbmRleC5tanMiLCJUU0Zyb250RW5kL25vZGVfbW9kdWxlcy9zdmVsdGUvYW5pbWF0ZS9pbmRleC5tanMiLCJUU0Zyb250RW5kL3NyYy9Nb2R1bGVzL09ic2lkaWFuVUkvVUlJbnRlcmZhY2VzL0Rlc2lnbmVyMDEvQmFzZUNvbXBvbmVudHMvTWVzc2FnZXMvU3RhdGljTWVzc2FnZUhhbmRsZXIuc3ZlbHRlIiwiVFNGcm9udEVuZC9zcmMvTW9kdWxlcy9PYnNpZGlhblVJL1VJSW50ZXJmYWNlcy9EZXNpZ25lcjAxL0Jhc2VGdW5jdGlvbnMvc3RyaW5nZnVuY3Rpb25zLnRzIiwiVFNGcm9udEVuZC9ub2RlX21vZHVsZXMvYXN5bmMtbXV0ZXgvZXM2L2Vycm9ycy5qcyIsIlRTRnJvbnRFbmQvbm9kZV9tb2R1bGVzL2FzeW5jLW11dGV4L2VzNi9TZW1hcGhvcmUuanMiLCJUU0Zyb250RW5kL25vZGVfbW9kdWxlcy9hc3luYy1tdXRleC9lczYvTXV0ZXguanMiLCJUU0Zyb250RW5kL3NyYy9Nb2R1bGVzL09ic2lkaWFuVUlDb3JlL2ZpbGVIYW5kbGVyLnRzIiwiVFNGcm9udEVuZC9ub2RlX21vZHVsZXMvZ3JvYmF4LWpzb24taGFuZGxlci9kaXN0L0pzb25Nb2R1bGVDb25zdGFudHMuanMiLCJUU0Zyb250RW5kL25vZGVfbW9kdWxlcy9ncm9iYXgtanNvbi1oYW5kbGVyL2Rpc3QvUmVmbGVjdC5qcyIsIlRTRnJvbnRFbmQvbm9kZV9tb2R1bGVzL2dyb2JheC1qc29uLWhhbmRsZXIvZGlzdC9Kc29uTW9kdWxlQmFzZUZ1bmN0aW9uLmpzIiwiVFNGcm9udEVuZC9ub2RlX21vZHVsZXMvZ3JvYmF4LWpzb24taGFuZGxlci9kaXN0L0RlY29yYXRvcnMuanMiLCJUU0Zyb250RW5kL25vZGVfbW9kdWxlcy9ncm9iYXgtanNvbi1oYW5kbGVyL2Rpc3QvSnNvbkhhbmRsZXIuanMiLCJUU0Zyb250RW5kL25vZGVfbW9kdWxlcy90dHJwZy1zeXN0ZW0tZ3JhcGgvZGlzdC9BYnN0cmFjdGlvbnMvS2V5TWFuYWdlci5qcyIsIlRTRnJvbnRFbmQvbm9kZV9tb2R1bGVzL3R0cnBnLXN5c3RlbS1ncmFwaC9kaXN0L0Fic3RyYWN0aW9ucy9JT3V0cHV0SGFuZGxlci5qcyIsIlRTRnJvbnRFbmQvbm9kZV9tb2R1bGVzL3R0cnBnLXN5c3RlbS1ncmFwaC9kaXN0L0Fic3RyYWN0aW9ucy9BR3JhcGhJdGVtLmpzIiwiVFNGcm9udEVuZC9ub2RlX21vZHVsZXMvdHRycGctc3lzdGVtLWdyYXBoL2Rpc3QvR3JvYk5vZHRlLmpzIiwiVFNGcm9udEVuZC9ub2RlX21vZHVsZXMvdHRycGctc3lzdGVtLWdyYXBoL2Rpc3QvR3JvYkNvbGxlY3Rpb24uanMiLCJUU0Zyb250RW5kL25vZGVfbW9kdWxlcy90dHJwZy1zeXN0ZW0tZ3JhcGgvZGlzdC9Hcm9iR3JvdXAuanMiLCJUU0Zyb250RW5kL25vZGVfbW9kdWxlcy90dHJwZy1zeXN0ZW0tZ3JhcGgvZGlzdC9HcmFwaC9UVFJQR1N5c3RlbUdyYXBoQWJzdHJhY3RNb2RlbC5qcyIsIlRTRnJvbnRFbmQvbm9kZV9tb2R1bGVzL3R0cnBnLXN5c3RlbS1ncmFwaC9kaXN0L0dyYXBoL1RUUlBHU3lzdGVtR3JhcGhNb2RlbC5qcyIsIlRTRnJvbnRFbmQvbm9kZV9tb2R1bGVzL3R0cnBnLXN5c3RlbS1ncmFwaC9kaXN0L2luZGV4LmpzIiwiVFNGcm9udEVuZC9zcmMvTW9kdWxlcy9EZXNpZ25lci9pbmRleC50cyIsIlRTRnJvbnRFbmQvc3JjL01vZHVsZXMvT2JzaWRpYW5VSUNvcmUvbW9kZWwvc3lzdGVtUHJldmlldy50cyIsIlRTRnJvbnRFbmQvc3JjL01vZHVsZXMvT2JzaWRpYW5VSUNvcmUvbW9kZWwvVUlMYXlvdXRNb2RlbC50cyIsIlRTRnJvbnRFbmQvc3JjL01vZHVsZXMvT2JzaWRpYW5VSUNvcmUvZmlsZUNvbnRleHQudHMiLCJUU0Zyb250RW5kL3NyYy9Nb2R1bGVzL09ic2lkaWFuVUlDb3JlL0FQSS50cyIsIlRTRnJvbnRFbmQvc3JjL01vZHVsZXMvT2JzaWRpYW5VSS9VSUludGVyZmFjZXMvRGVzaWduZXIwMi9WaWV3cy9QYWdlL1N5c3RlbVBhZ2Uuc3ZlbHRlIiwiVFNGcm9udEVuZC9zcmMvTW9kdWxlcy9PYnNpZGlhblVJL1VJSW50ZXJmYWNlcy9EZXNpZ25lcjAyL2FwcC5zdmVsdGUiLCJUU0Zyb250RW5kL3NyYy9Nb2R1bGVzL09ic2lkaWFuVUkvQmxvY2tSZW5kZXJlci9CbG9ja0RhdGEudHMiLCJUU0Zyb250RW5kL3NyYy9Nb2R1bGVzL09ic2lkaWFuVUkvQmxvY2tSZW5kZXJlci9Db21wb25lbnROb2RlLnRzIiwiVFNGcm9udEVuZC9zcmMvTW9kdWxlcy9PYnNpZGlhblVJL1VJSW50ZXJmYWNlcy9CbG9ja1N0YXJ0ZXIvQmxvY2tTdGFydGVyLnN2ZWx0ZSIsIlRTRnJvbnRFbmQvc3JjL01vZHVsZXMvT2JzaWRpYW5VSS9CbG9ja1JlbmRlcmVyL0Jsb2NrUmVuZGVyZXIudHMiLCJUU0Zyb250RW5kL3NyYy9Nb2R1bGVzL09ic2lkaWFuVUkvYXBwLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImZ1bmN0aW9uIG5vb3AoKSB7IH1cbmNvbnN0IGlkZW50aXR5ID0geCA9PiB4O1xuZnVuY3Rpb24gYXNzaWduKHRhciwgc3JjKSB7XG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIGZvciAoY29uc3QgayBpbiBzcmMpXG4gICAgICAgIHRhcltrXSA9IHNyY1trXTtcbiAgICByZXR1cm4gdGFyO1xufVxuLy8gQWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS90aGVuL2lzLXByb21pc2UvYmxvYi9tYXN0ZXIvaW5kZXguanNcbi8vIERpc3RyaWJ1dGVkIHVuZGVyIE1JVCBMaWNlbnNlIGh0dHBzOi8vZ2l0aHViLmNvbS90aGVuL2lzLXByb21pc2UvYmxvYi9tYXN0ZXIvTElDRU5TRVxuZnVuY3Rpb24gaXNfcHJvbWlzZSh2YWx1ZSkge1xuICAgIHJldHVybiAhIXZhbHVlICYmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT09ICdmdW5jdGlvbic7XG59XG5mdW5jdGlvbiBhZGRfbG9jYXRpb24oZWxlbWVudCwgZmlsZSwgbGluZSwgY29sdW1uLCBjaGFyKSB7XG4gICAgZWxlbWVudC5fX3N2ZWx0ZV9tZXRhID0ge1xuICAgICAgICBsb2M6IHsgZmlsZSwgbGluZSwgY29sdW1uLCBjaGFyIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gcnVuKGZuKSB7XG4gICAgcmV0dXJuIGZuKCk7XG59XG5mdW5jdGlvbiBibGFua19vYmplY3QoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5jcmVhdGUobnVsbCk7XG59XG5mdW5jdGlvbiBydW5fYWxsKGZucykge1xuICAgIGZucy5mb3JFYWNoKHJ1bik7XG59XG5mdW5jdGlvbiBpc19mdW5jdGlvbih0aGluZykge1xuICAgIHJldHVybiB0eXBlb2YgdGhpbmcgPT09ICdmdW5jdGlvbic7XG59XG5mdW5jdGlvbiBzYWZlX25vdF9lcXVhbChhLCBiKSB7XG4gICAgcmV0dXJuIGEgIT0gYSA/IGIgPT0gYiA6IGEgIT09IGIgfHwgKChhICYmIHR5cGVvZiBhID09PSAnb2JqZWN0JykgfHwgdHlwZW9mIGEgPT09ICdmdW5jdGlvbicpO1xufVxubGV0IHNyY191cmxfZXF1YWxfYW5jaG9yO1xuZnVuY3Rpb24gc3JjX3VybF9lcXVhbChlbGVtZW50X3NyYywgdXJsKSB7XG4gICAgaWYgKCFzcmNfdXJsX2VxdWFsX2FuY2hvcikge1xuICAgICAgICBzcmNfdXJsX2VxdWFsX2FuY2hvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICB9XG4gICAgc3JjX3VybF9lcXVhbF9hbmNob3IuaHJlZiA9IHVybDtcbiAgICByZXR1cm4gZWxlbWVudF9zcmMgPT09IHNyY191cmxfZXF1YWxfYW5jaG9yLmhyZWY7XG59XG5mdW5jdGlvbiBub3RfZXF1YWwoYSwgYikge1xuICAgIHJldHVybiBhICE9IGEgPyBiID09IGIgOiBhICE9PSBiO1xufVxuZnVuY3Rpb24gaXNfZW1wdHkob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09PSAwO1xufVxuZnVuY3Rpb24gdmFsaWRhdGVfc3RvcmUoc3RvcmUsIG5hbWUpIHtcbiAgICBpZiAoc3RvcmUgIT0gbnVsbCAmJiB0eXBlb2Ygc3RvcmUuc3Vic2NyaWJlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7bmFtZX0nIGlzIG5vdCBhIHN0b3JlIHdpdGggYSAnc3Vic2NyaWJlJyBtZXRob2RgKTtcbiAgICB9XG59XG5mdW5jdGlvbiBzdWJzY3JpYmUoc3RvcmUsIC4uLmNhbGxiYWNrcykge1xuICAgIGlmIChzdG9yZSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBub29wO1xuICAgIH1cbiAgICBjb25zdCB1bnN1YiA9IHN0b3JlLnN1YnNjcmliZSguLi5jYWxsYmFja3MpO1xuICAgIHJldHVybiB1bnN1Yi51bnN1YnNjcmliZSA/ICgpID0+IHVuc3ViLnVuc3Vic2NyaWJlKCkgOiB1bnN1Yjtcbn1cbmZ1bmN0aW9uIGdldF9zdG9yZV92YWx1ZShzdG9yZSkge1xuICAgIGxldCB2YWx1ZTtcbiAgICBzdWJzY3JpYmUoc3RvcmUsIF8gPT4gdmFsdWUgPSBfKSgpO1xuICAgIHJldHVybiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIGNvbXBvbmVudF9zdWJzY3JpYmUoY29tcG9uZW50LCBzdG9yZSwgY2FsbGJhY2spIHtcbiAgICBjb21wb25lbnQuJCQub25fZGVzdHJveS5wdXNoKHN1YnNjcmliZShzdG9yZSwgY2FsbGJhY2spKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZV9zbG90KGRlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZm4pIHtcbiAgICBpZiAoZGVmaW5pdGlvbikge1xuICAgICAgICBjb25zdCBzbG90X2N0eCA9IGdldF9zbG90X2NvbnRleHQoZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBmbik7XG4gICAgICAgIHJldHVybiBkZWZpbml0aW9uWzBdKHNsb3RfY3R4KTtcbiAgICB9XG59XG5mdW5jdGlvbiBnZXRfc2xvdF9jb250ZXh0KGRlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZm4pIHtcbiAgICByZXR1cm4gZGVmaW5pdGlvblsxXSAmJiBmblxuICAgICAgICA/IGFzc2lnbigkJHNjb3BlLmN0eC5zbGljZSgpLCBkZWZpbml0aW9uWzFdKGZuKGN0eCkpKVxuICAgICAgICA6ICQkc2NvcGUuY3R4O1xufVxuZnVuY3Rpb24gZ2V0X3Nsb3RfY2hhbmdlcyhkZWZpbml0aW9uLCAkJHNjb3BlLCBkaXJ0eSwgZm4pIHtcbiAgICBpZiAoZGVmaW5pdGlvblsyXSAmJiBmbikge1xuICAgICAgICBjb25zdCBsZXRzID0gZGVmaW5pdGlvblsyXShmbihkaXJ0eSkpO1xuICAgICAgICBpZiAoJCRzY29wZS5kaXJ0eSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gbGV0cztcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGxldHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBjb25zdCBtZXJnZWQgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGxlbiA9IE1hdGgubWF4KCQkc2NvcGUuZGlydHkubGVuZ3RoLCBsZXRzLmxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgbWVyZ2VkW2ldID0gJCRzY29wZS5kaXJ0eVtpXSB8IGxldHNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWVyZ2VkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAkJHNjb3BlLmRpcnR5IHwgbGV0cztcbiAgICB9XG4gICAgcmV0dXJuICQkc2NvcGUuZGlydHk7XG59XG5mdW5jdGlvbiB1cGRhdGVfc2xvdF9iYXNlKHNsb3QsIHNsb3RfZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBzbG90X2NoYW5nZXMsIGdldF9zbG90X2NvbnRleHRfZm4pIHtcbiAgICBpZiAoc2xvdF9jaGFuZ2VzKSB7XG4gICAgICAgIGNvbnN0IHNsb3RfY29udGV4dCA9IGdldF9zbG90X2NvbnRleHQoc2xvdF9kZWZpbml0aW9uLCBjdHgsICQkc2NvcGUsIGdldF9zbG90X2NvbnRleHRfZm4pO1xuICAgICAgICBzbG90LnAoc2xvdF9jb250ZXh0LCBzbG90X2NoYW5nZXMpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHVwZGF0ZV9zbG90KHNsb3QsIHNsb3RfZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBkaXJ0eSwgZ2V0X3Nsb3RfY2hhbmdlc19mbiwgZ2V0X3Nsb3RfY29udGV4dF9mbikge1xuICAgIGNvbnN0IHNsb3RfY2hhbmdlcyA9IGdldF9zbG90X2NoYW5nZXMoc2xvdF9kZWZpbml0aW9uLCAkJHNjb3BlLCBkaXJ0eSwgZ2V0X3Nsb3RfY2hhbmdlc19mbik7XG4gICAgdXBkYXRlX3Nsb3RfYmFzZShzbG90LCBzbG90X2RlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgc2xvdF9jaGFuZ2VzLCBnZXRfc2xvdF9jb250ZXh0X2ZuKTtcbn1cbmZ1bmN0aW9uIGdldF9hbGxfZGlydHlfZnJvbV9zY29wZSgkJHNjb3BlKSB7XG4gICAgaWYgKCQkc2NvcGUuY3R4Lmxlbmd0aCA+IDMyKSB7XG4gICAgICAgIGNvbnN0IGRpcnR5ID0gW107XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9ICQkc2NvcGUuY3R4Lmxlbmd0aCAvIDMyO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBkaXJ0eVtpXSA9IC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkaXJ0eTtcbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufVxuZnVuY3Rpb24gZXhjbHVkZV9pbnRlcm5hbF9wcm9wcyhwcm9wcykge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGZvciAoY29uc3QgayBpbiBwcm9wcylcbiAgICAgICAgaWYgKGtbMF0gIT09ICckJylcbiAgICAgICAgICAgIHJlc3VsdFtrXSA9IHByb3BzW2tdO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBjb21wdXRlX3Jlc3RfcHJvcHMocHJvcHMsIGtleXMpIHtcbiAgICBjb25zdCByZXN0ID0ge307XG4gICAga2V5cyA9IG5ldyBTZXQoa2V5cyk7XG4gICAgZm9yIChjb25zdCBrIGluIHByb3BzKVxuICAgICAgICBpZiAoIWtleXMuaGFzKGspICYmIGtbMF0gIT09ICckJylcbiAgICAgICAgICAgIHJlc3Rba10gPSBwcm9wc1trXTtcbiAgICByZXR1cm4gcmVzdDtcbn1cbmZ1bmN0aW9uIGNvbXB1dGVfc2xvdHMoc2xvdHMpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBzbG90cykge1xuICAgICAgICByZXN1bHRba2V5XSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBvbmNlKGZuKSB7XG4gICAgbGV0IHJhbiA9IGZhbHNlO1xuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICBpZiAocmFuKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICByYW4gPSB0cnVlO1xuICAgICAgICBmbi5jYWxsKHRoaXMsIC4uLmFyZ3MpO1xuICAgIH07XG59XG5mdW5jdGlvbiBudWxsX3RvX2VtcHR5KHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09IG51bGwgPyAnJyA6IHZhbHVlO1xufVxuZnVuY3Rpb24gc2V0X3N0b3JlX3ZhbHVlKHN0b3JlLCByZXQsIHZhbHVlKSB7XG4gICAgc3RvcmUuc2V0KHZhbHVlKTtcbiAgICByZXR1cm4gcmV0O1xufVxuY29uc3QgaGFzX3Byb3AgPSAob2JqLCBwcm9wKSA9PiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbmZ1bmN0aW9uIGFjdGlvbl9kZXN0cm95ZXIoYWN0aW9uX3Jlc3VsdCkge1xuICAgIHJldHVybiBhY3Rpb25fcmVzdWx0ICYmIGlzX2Z1bmN0aW9uKGFjdGlvbl9yZXN1bHQuZGVzdHJveSkgPyBhY3Rpb25fcmVzdWx0LmRlc3Ryb3kgOiBub29wO1xufVxuZnVuY3Rpb24gc3BsaXRfY3NzX3VuaXQodmFsdWUpIHtcbiAgICBjb25zdCBzcGxpdCA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUubWF0Y2goL15cXHMqKC0/W1xcZC5dKykoW15cXHNdKilcXHMqJC8pO1xuICAgIHJldHVybiBzcGxpdCA/IFtwYXJzZUZsb2F0KHNwbGl0WzFdKSwgc3BsaXRbMl0gfHwgJ3B4J10gOiBbdmFsdWUsICdweCddO1xufVxuY29uc3QgY29udGVudGVkaXRhYmxlX3RydXRoeV92YWx1ZXMgPSBbJycsIHRydWUsIDEsICd0cnVlJywgJ2NvbnRlbnRlZGl0YWJsZSddO1xuXG5jb25zdCBpc19jbGllbnQgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJztcbmxldCBub3cgPSBpc19jbGllbnRcbiAgICA/ICgpID0+IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKVxuICAgIDogKCkgPT4gRGF0ZS5ub3coKTtcbmxldCByYWYgPSBpc19jbGllbnQgPyBjYiA9PiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2IpIDogbm9vcDtcbi8vIHVzZWQgaW50ZXJuYWxseSBmb3IgdGVzdGluZ1xuZnVuY3Rpb24gc2V0X25vdyhmbikge1xuICAgIG5vdyA9IGZuO1xufVxuZnVuY3Rpb24gc2V0X3JhZihmbikge1xuICAgIHJhZiA9IGZuO1xufVxuXG5jb25zdCB0YXNrcyA9IG5ldyBTZXQoKTtcbmZ1bmN0aW9uIHJ1bl90YXNrcyhub3cpIHtcbiAgICB0YXNrcy5mb3JFYWNoKHRhc2sgPT4ge1xuICAgICAgICBpZiAoIXRhc2suYyhub3cpKSB7XG4gICAgICAgICAgICB0YXNrcy5kZWxldGUodGFzayk7XG4gICAgICAgICAgICB0YXNrLmYoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlmICh0YXNrcy5zaXplICE9PSAwKVxuICAgICAgICByYWYocnVuX3Rhc2tzKTtcbn1cbi8qKlxuICogRm9yIHRlc3RpbmcgcHVycG9zZXMgb25seSFcbiAqL1xuZnVuY3Rpb24gY2xlYXJfbG9vcHMoKSB7XG4gICAgdGFza3MuY2xlYXIoKTtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB0YXNrIHRoYXQgcnVucyBvbiBlYWNoIHJhZiBmcmFtZVxuICogdW50aWwgaXQgcmV0dXJucyBhIGZhbHN5IHZhbHVlIG9yIGlzIGFib3J0ZWRcbiAqL1xuZnVuY3Rpb24gbG9vcChjYWxsYmFjaykge1xuICAgIGxldCB0YXNrO1xuICAgIGlmICh0YXNrcy5zaXplID09PSAwKVxuICAgICAgICByYWYocnVuX3Rhc2tzKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBwcm9taXNlOiBuZXcgUHJvbWlzZShmdWxmaWxsID0+IHtcbiAgICAgICAgICAgIHRhc2tzLmFkZCh0YXNrID0geyBjOiBjYWxsYmFjaywgZjogZnVsZmlsbCB9KTtcbiAgICAgICAgfSksXG4gICAgICAgIGFib3J0KCkge1xuICAgICAgICAgICAgdGFza3MuZGVsZXRlKHRhc2spO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuY29uc3QgZ2xvYmFscyA9ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgID8gd2luZG93XG4gICAgOiB0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgICAgPyBnbG9iYWxUaGlzXG4gICAgICAgIDogZ2xvYmFsKTtcblxuLyoqXG4gKiBSZXNpemUgb2JzZXJ2ZXIgc2luZ2xldG9uLlxuICogT25lIGxpc3RlbmVyIHBlciBlbGVtZW50IG9ubHkhXG4gKiBodHRwczovL2dyb3Vwcy5nb29nbGUuY29tL2EvY2hyb21pdW0ub3JnL2cvYmxpbmstZGV2L2MvejZpZW5PTlViNUEvbS9GNS1WY1VadEJBQUpcbiAqL1xuY2xhc3MgUmVzaXplT2JzZXJ2ZXJTaW5nbGV0b24ge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgdGhpcy5fbGlzdGVuZXJzID0gJ1dlYWtNYXAnIGluIGdsb2JhbHMgPyBuZXcgV2Vha01hcCgpIDogdW5kZWZpbmVkO1xuICAgIH1cbiAgICBvYnNlcnZlKGVsZW1lbnQsIGxpc3RlbmVyKSB7XG4gICAgICAgIHRoaXMuX2xpc3RlbmVycy5zZXQoZWxlbWVudCwgbGlzdGVuZXIpO1xuICAgICAgICB0aGlzLl9nZXRPYnNlcnZlcigpLm9ic2VydmUoZWxlbWVudCwgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2xpc3RlbmVycy5kZWxldGUoZWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLl9vYnNlcnZlci51bm9ic2VydmUoZWxlbWVudCk7IC8vIHRoaXMgbGluZSBjYW4gcHJvYmFibHkgYmUgcmVtb3ZlZFxuICAgICAgICB9O1xuICAgIH1cbiAgICBfZ2V0T2JzZXJ2ZXIoKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgcmV0dXJuIChfYSA9IHRoaXMuX29ic2VydmVyKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiAodGhpcy5fb2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoKGVudHJpZXMpID0+IHtcbiAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZW50cmllcykge1xuICAgICAgICAgICAgICAgIFJlc2l6ZU9ic2VydmVyU2luZ2xldG9uLmVudHJpZXMuc2V0KGVudHJ5LnRhcmdldCwgZW50cnkpO1xuICAgICAgICAgICAgICAgIChfYSA9IHRoaXMuX2xpc3RlbmVycy5nZXQoZW50cnkudGFyZ2V0KSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hKGVudHJ5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuICAgIH1cbn1cbi8vIE5lZWRzIHRvIGJlIHdyaXR0ZW4gbGlrZSB0aGlzIHRvIHBhc3MgdGhlIHRyZWUtc2hha2UtdGVzdFxuUmVzaXplT2JzZXJ2ZXJTaW5nbGV0b24uZW50cmllcyA9ICdXZWFrTWFwJyBpbiBnbG9iYWxzID8gbmV3IFdlYWtNYXAoKSA6IHVuZGVmaW5lZDtcblxuLy8gVHJhY2sgd2hpY2ggbm9kZXMgYXJlIGNsYWltZWQgZHVyaW5nIGh5ZHJhdGlvbi4gVW5jbGFpbWVkIG5vZGVzIGNhbiB0aGVuIGJlIHJlbW92ZWQgZnJvbSB0aGUgRE9NXG4vLyBhdCB0aGUgZW5kIG9mIGh5ZHJhdGlvbiB3aXRob3V0IHRvdWNoaW5nIHRoZSByZW1haW5pbmcgbm9kZXMuXG5sZXQgaXNfaHlkcmF0aW5nID0gZmFsc2U7XG5mdW5jdGlvbiBzdGFydF9oeWRyYXRpbmcoKSB7XG4gICAgaXNfaHlkcmF0aW5nID0gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGVuZF9oeWRyYXRpbmcoKSB7XG4gICAgaXNfaHlkcmF0aW5nID0gZmFsc2U7XG59XG5mdW5jdGlvbiB1cHBlcl9ib3VuZChsb3csIGhpZ2gsIGtleSwgdmFsdWUpIHtcbiAgICAvLyBSZXR1cm4gZmlyc3QgaW5kZXggb2YgdmFsdWUgbGFyZ2VyIHRoYW4gaW5wdXQgdmFsdWUgaW4gdGhlIHJhbmdlIFtsb3csIGhpZ2gpXG4gICAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcbiAgICAgICAgY29uc3QgbWlkID0gbG93ICsgKChoaWdoIC0gbG93KSA+PiAxKTtcbiAgICAgICAgaWYgKGtleShtaWQpIDw9IHZhbHVlKSB7XG4gICAgICAgICAgICBsb3cgPSBtaWQgKyAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaGlnaCA9IG1pZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbG93O1xufVxuZnVuY3Rpb24gaW5pdF9oeWRyYXRlKHRhcmdldCkge1xuICAgIGlmICh0YXJnZXQuaHlkcmF0ZV9pbml0KVxuICAgICAgICByZXR1cm47XG4gICAgdGFyZ2V0Lmh5ZHJhdGVfaW5pdCA9IHRydWU7XG4gICAgLy8gV2Uga25vdyB0aGF0IGFsbCBjaGlsZHJlbiBoYXZlIGNsYWltX29yZGVyIHZhbHVlcyBzaW5jZSB0aGUgdW5jbGFpbWVkIGhhdmUgYmVlbiBkZXRhY2hlZCBpZiB0YXJnZXQgaXMgbm90IDxoZWFkPlxuICAgIGxldCBjaGlsZHJlbiA9IHRhcmdldC5jaGlsZE5vZGVzO1xuICAgIC8vIElmIHRhcmdldCBpcyA8aGVhZD4sIHRoZXJlIG1heSBiZSBjaGlsZHJlbiB3aXRob3V0IGNsYWltX29yZGVyXG4gICAgaWYgKHRhcmdldC5ub2RlTmFtZSA9PT0gJ0hFQUQnKSB7XG4gICAgICAgIGNvbnN0IG15Q2hpbGRyZW4gPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgaWYgKG5vZGUuY2xhaW1fb3JkZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG15Q2hpbGRyZW4ucHVzaChub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjaGlsZHJlbiA9IG15Q2hpbGRyZW47XG4gICAgfVxuICAgIC8qXG4gICAgKiBSZW9yZGVyIGNsYWltZWQgY2hpbGRyZW4gb3B0aW1hbGx5LlxuICAgICogV2UgY2FuIHJlb3JkZXIgY2xhaW1lZCBjaGlsZHJlbiBvcHRpbWFsbHkgYnkgZmluZGluZyB0aGUgbG9uZ2VzdCBzdWJzZXF1ZW5jZSBvZlxuICAgICogbm9kZXMgdGhhdCBhcmUgYWxyZWFkeSBjbGFpbWVkIGluIG9yZGVyIGFuZCBvbmx5IG1vdmluZyB0aGUgcmVzdC4gVGhlIGxvbmdlc3RcbiAgICAqIHN1YnNlcXVlbmNlIG9mIG5vZGVzIHRoYXQgYXJlIGNsYWltZWQgaW4gb3JkZXIgY2FuIGJlIGZvdW5kIGJ5XG4gICAgKiBjb21wdXRpbmcgdGhlIGxvbmdlc3QgaW5jcmVhc2luZyBzdWJzZXF1ZW5jZSBvZiAuY2xhaW1fb3JkZXIgdmFsdWVzLlxuICAgICpcbiAgICAqIFRoaXMgYWxnb3JpdGhtIGlzIG9wdGltYWwgaW4gZ2VuZXJhdGluZyB0aGUgbGVhc3QgYW1vdW50IG9mIHJlb3JkZXIgb3BlcmF0aW9uc1xuICAgICogcG9zc2libGUuXG4gICAgKlxuICAgICogUHJvb2Y6XG4gICAgKiBXZSBrbm93IHRoYXQsIGdpdmVuIGEgc2V0IG9mIHJlb3JkZXJpbmcgb3BlcmF0aW9ucywgdGhlIG5vZGVzIHRoYXQgZG8gbm90IG1vdmVcbiAgICAqIGFsd2F5cyBmb3JtIGFuIGluY3JlYXNpbmcgc3Vic2VxdWVuY2UsIHNpbmNlIHRoZXkgZG8gbm90IG1vdmUgYW1vbmcgZWFjaCBvdGhlclxuICAgICogbWVhbmluZyB0aGF0IHRoZXkgbXVzdCBiZSBhbHJlYWR5IG9yZGVyZWQgYW1vbmcgZWFjaCBvdGhlci4gVGh1cywgdGhlIG1heGltYWxcbiAgICAqIHNldCBvZiBub2RlcyB0aGF0IGRvIG5vdCBtb3ZlIGZvcm0gYSBsb25nZXN0IGluY3JlYXNpbmcgc3Vic2VxdWVuY2UuXG4gICAgKi9cbiAgICAvLyBDb21wdXRlIGxvbmdlc3QgaW5jcmVhc2luZyBzdWJzZXF1ZW5jZVxuICAgIC8vIG06IHN1YnNlcXVlbmNlIGxlbmd0aCBqID0+IGluZGV4IGsgb2Ygc21hbGxlc3QgdmFsdWUgdGhhdCBlbmRzIGFuIGluY3JlYXNpbmcgc3Vic2VxdWVuY2Ugb2YgbGVuZ3RoIGpcbiAgICBjb25zdCBtID0gbmV3IEludDMyQXJyYXkoY2hpbGRyZW4ubGVuZ3RoICsgMSk7XG4gICAgLy8gUHJlZGVjZXNzb3IgaW5kaWNlcyArIDFcbiAgICBjb25zdCBwID0gbmV3IEludDMyQXJyYXkoY2hpbGRyZW4ubGVuZ3RoKTtcbiAgICBtWzBdID0gLTE7XG4gICAgbGV0IGxvbmdlc3QgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IGNoaWxkcmVuW2ldLmNsYWltX29yZGVyO1xuICAgICAgICAvLyBGaW5kIHRoZSBsYXJnZXN0IHN1YnNlcXVlbmNlIGxlbmd0aCBzdWNoIHRoYXQgaXQgZW5kcyBpbiBhIHZhbHVlIGxlc3MgdGhhbiBvdXIgY3VycmVudCB2YWx1ZVxuICAgICAgICAvLyB1cHBlcl9ib3VuZCByZXR1cm5zIGZpcnN0IGdyZWF0ZXIgdmFsdWUsIHNvIHdlIHN1YnRyYWN0IG9uZVxuICAgICAgICAvLyB3aXRoIGZhc3QgcGF0aCBmb3Igd2hlbiB3ZSBhcmUgb24gdGhlIGN1cnJlbnQgbG9uZ2VzdCBzdWJzZXF1ZW5jZVxuICAgICAgICBjb25zdCBzZXFMZW4gPSAoKGxvbmdlc3QgPiAwICYmIGNoaWxkcmVuW21bbG9uZ2VzdF1dLmNsYWltX29yZGVyIDw9IGN1cnJlbnQpID8gbG9uZ2VzdCArIDEgOiB1cHBlcl9ib3VuZCgxLCBsb25nZXN0LCBpZHggPT4gY2hpbGRyZW5bbVtpZHhdXS5jbGFpbV9vcmRlciwgY3VycmVudCkpIC0gMTtcbiAgICAgICAgcFtpXSA9IG1bc2VxTGVuXSArIDE7XG4gICAgICAgIGNvbnN0IG5ld0xlbiA9IHNlcUxlbiArIDE7XG4gICAgICAgIC8vIFdlIGNhbiBndWFyYW50ZWUgdGhhdCBjdXJyZW50IGlzIHRoZSBzbWFsbGVzdCB2YWx1ZS4gT3RoZXJ3aXNlLCB3ZSB3b3VsZCBoYXZlIGdlbmVyYXRlZCBhIGxvbmdlciBzZXF1ZW5jZS5cbiAgICAgICAgbVtuZXdMZW5dID0gaTtcbiAgICAgICAgbG9uZ2VzdCA9IE1hdGgubWF4KG5ld0xlbiwgbG9uZ2VzdCk7XG4gICAgfVxuICAgIC8vIFRoZSBsb25nZXN0IGluY3JlYXNpbmcgc3Vic2VxdWVuY2Ugb2Ygbm9kZXMgKGluaXRpYWxseSByZXZlcnNlZClcbiAgICBjb25zdCBsaXMgPSBbXTtcbiAgICAvLyBUaGUgcmVzdCBvZiB0aGUgbm9kZXMsIG5vZGVzIHRoYXQgd2lsbCBiZSBtb3ZlZFxuICAgIGNvbnN0IHRvTW92ZSA9IFtdO1xuICAgIGxldCBsYXN0ID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTtcbiAgICBmb3IgKGxldCBjdXIgPSBtW2xvbmdlc3RdICsgMTsgY3VyICE9IDA7IGN1ciA9IHBbY3VyIC0gMV0pIHtcbiAgICAgICAgbGlzLnB1c2goY2hpbGRyZW5bY3VyIC0gMV0pO1xuICAgICAgICBmb3IgKDsgbGFzdCA+PSBjdXI7IGxhc3QtLSkge1xuICAgICAgICAgICAgdG9Nb3ZlLnB1c2goY2hpbGRyZW5bbGFzdF0pO1xuICAgICAgICB9XG4gICAgICAgIGxhc3QtLTtcbiAgICB9XG4gICAgZm9yICg7IGxhc3QgPj0gMDsgbGFzdC0tKSB7XG4gICAgICAgIHRvTW92ZS5wdXNoKGNoaWxkcmVuW2xhc3RdKTtcbiAgICB9XG4gICAgbGlzLnJldmVyc2UoKTtcbiAgICAvLyBXZSBzb3J0IHRoZSBub2RlcyBiZWluZyBtb3ZlZCB0byBndWFyYW50ZWUgdGhhdCB0aGVpciBpbnNlcnRpb24gb3JkZXIgbWF0Y2hlcyB0aGUgY2xhaW0gb3JkZXJcbiAgICB0b01vdmUuc29ydCgoYSwgYikgPT4gYS5jbGFpbV9vcmRlciAtIGIuY2xhaW1fb3JkZXIpO1xuICAgIC8vIEZpbmFsbHksIHdlIG1vdmUgdGhlIG5vZGVzXG4gICAgZm9yIChsZXQgaSA9IDAsIGogPSAwOyBpIDwgdG9Nb3ZlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHdoaWxlIChqIDwgbGlzLmxlbmd0aCAmJiB0b01vdmVbaV0uY2xhaW1fb3JkZXIgPj0gbGlzW2pdLmNsYWltX29yZGVyKSB7XG4gICAgICAgICAgICBqKys7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYW5jaG9yID0gaiA8IGxpcy5sZW5ndGggPyBsaXNbal0gOiBudWxsO1xuICAgICAgICB0YXJnZXQuaW5zZXJ0QmVmb3JlKHRvTW92ZVtpXSwgYW5jaG9yKTtcbiAgICB9XG59XG5mdW5jdGlvbiBhcHBlbmQodGFyZ2V0LCBub2RlKSB7XG4gICAgdGFyZ2V0LmFwcGVuZENoaWxkKG5vZGUpO1xufVxuZnVuY3Rpb24gYXBwZW5kX3N0eWxlcyh0YXJnZXQsIHN0eWxlX3NoZWV0X2lkLCBzdHlsZXMpIHtcbiAgICBjb25zdCBhcHBlbmRfc3R5bGVzX3RvID0gZ2V0X3Jvb3RfZm9yX3N0eWxlKHRhcmdldCk7XG4gICAgaWYgKCFhcHBlbmRfc3R5bGVzX3RvLmdldEVsZW1lbnRCeUlkKHN0eWxlX3NoZWV0X2lkKSkge1xuICAgICAgICBjb25zdCBzdHlsZSA9IGVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICAgIHN0eWxlLmlkID0gc3R5bGVfc2hlZXRfaWQ7XG4gICAgICAgIHN0eWxlLnRleHRDb250ZW50ID0gc3R5bGVzO1xuICAgICAgICBhcHBlbmRfc3R5bGVzaGVldChhcHBlbmRfc3R5bGVzX3RvLCBzdHlsZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gZ2V0X3Jvb3RfZm9yX3N0eWxlKG5vZGUpIHtcbiAgICBpZiAoIW5vZGUpXG4gICAgICAgIHJldHVybiBkb2N1bWVudDtcbiAgICBjb25zdCByb290ID0gbm9kZS5nZXRSb290Tm9kZSA/IG5vZGUuZ2V0Um9vdE5vZGUoKSA6IG5vZGUub3duZXJEb2N1bWVudDtcbiAgICBpZiAocm9vdCAmJiByb290Lmhvc3QpIHtcbiAgICAgICAgcmV0dXJuIHJvb3Q7XG4gICAgfVxuICAgIHJldHVybiBub2RlLm93bmVyRG9jdW1lbnQ7XG59XG5mdW5jdGlvbiBhcHBlbmRfZW1wdHlfc3R5bGVzaGVldChub2RlKSB7XG4gICAgY29uc3Qgc3R5bGVfZWxlbWVudCA9IGVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgYXBwZW5kX3N0eWxlc2hlZXQoZ2V0X3Jvb3RfZm9yX3N0eWxlKG5vZGUpLCBzdHlsZV9lbGVtZW50KTtcbiAgICByZXR1cm4gc3R5bGVfZWxlbWVudC5zaGVldDtcbn1cbmZ1bmN0aW9uIGFwcGVuZF9zdHlsZXNoZWV0KG5vZGUsIHN0eWxlKSB7XG4gICAgYXBwZW5kKG5vZGUuaGVhZCB8fCBub2RlLCBzdHlsZSk7XG4gICAgcmV0dXJuIHN0eWxlLnNoZWV0O1xufVxuZnVuY3Rpb24gYXBwZW5kX2h5ZHJhdGlvbih0YXJnZXQsIG5vZGUpIHtcbiAgICBpZiAoaXNfaHlkcmF0aW5nKSB7XG4gICAgICAgIGluaXRfaHlkcmF0ZSh0YXJnZXQpO1xuICAgICAgICBpZiAoKHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkID09PSB1bmRlZmluZWQpIHx8ICgodGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQgIT09IG51bGwpICYmICh0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZC5wYXJlbnROb2RlICE9PSB0YXJnZXQpKSkge1xuICAgICAgICAgICAgdGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQgPSB0YXJnZXQuZmlyc3RDaGlsZDtcbiAgICAgICAgfVxuICAgICAgICAvLyBTa2lwIG5vZGVzIG9mIHVuZGVmaW5lZCBvcmRlcmluZ1xuICAgICAgICB3aGlsZSAoKHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkICE9PSBudWxsKSAmJiAodGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQuY2xhaW1fb3JkZXIgPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICAgIHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkID0gdGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQubmV4dFNpYmxpbmc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vZGUgIT09IHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkKSB7XG4gICAgICAgICAgICAvLyBXZSBvbmx5IGluc2VydCBpZiB0aGUgb3JkZXJpbmcgb2YgdGhpcyBub2RlIHNob3VsZCBiZSBtb2RpZmllZCBvciB0aGUgcGFyZW50IG5vZGUgaXMgbm90IHRhcmdldFxuICAgICAgICAgICAgaWYgKG5vZGUuY2xhaW1fb3JkZXIgIT09IHVuZGVmaW5lZCB8fCBub2RlLnBhcmVudE5vZGUgIT09IHRhcmdldCkge1xuICAgICAgICAgICAgICAgIHRhcmdldC5pbnNlcnRCZWZvcmUobm9kZSwgdGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQgPSBub2RlLm5leHRTaWJsaW5nO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKG5vZGUucGFyZW50Tm9kZSAhPT0gdGFyZ2V0IHx8IG5vZGUubmV4dFNpYmxpbmcgIT09IG51bGwpIHtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKG5vZGUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGluc2VydCh0YXJnZXQsIG5vZGUsIGFuY2hvcikge1xuICAgIHRhcmdldC5pbnNlcnRCZWZvcmUobm9kZSwgYW5jaG9yIHx8IG51bGwpO1xufVxuZnVuY3Rpb24gaW5zZXJ0X2h5ZHJhdGlvbih0YXJnZXQsIG5vZGUsIGFuY2hvcikge1xuICAgIGlmIChpc19oeWRyYXRpbmcgJiYgIWFuY2hvcikge1xuICAgICAgICBhcHBlbmRfaHlkcmF0aW9uKHRhcmdldCwgbm9kZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKG5vZGUucGFyZW50Tm9kZSAhPT0gdGFyZ2V0IHx8IG5vZGUubmV4dFNpYmxpbmcgIT0gYW5jaG9yKSB7XG4gICAgICAgIHRhcmdldC5pbnNlcnRCZWZvcmUobm9kZSwgYW5jaG9yIHx8IG51bGwpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGRldGFjaChub2RlKSB7XG4gICAgaWYgKG5vZGUucGFyZW50Tm9kZSkge1xuICAgICAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gZGVzdHJveV9lYWNoKGl0ZXJhdGlvbnMsIGRldGFjaGluZykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlcmF0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAoaXRlcmF0aW9uc1tpXSlcbiAgICAgICAgICAgIGl0ZXJhdGlvbnNbaV0uZChkZXRhY2hpbmcpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGVsZW1lbnQobmFtZSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5hbWUpO1xufVxuZnVuY3Rpb24gZWxlbWVudF9pcyhuYW1lLCBpcykge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG5hbWUsIHsgaXMgfSk7XG59XG5mdW5jdGlvbiBvYmplY3Rfd2l0aG91dF9wcm9wZXJ0aWVzKG9iaiwgZXhjbHVkZSkge1xuICAgIGNvbnN0IHRhcmdldCA9IHt9O1xuICAgIGZvciAoY29uc3QgayBpbiBvYmopIHtcbiAgICAgICAgaWYgKGhhc19wcm9wKG9iaiwgaylcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICYmIGV4Y2x1ZGUuaW5kZXhPZihrKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIHRhcmdldFtrXSA9IG9ialtrXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGFyZ2V0O1xufVxuZnVuY3Rpb24gc3ZnX2VsZW1lbnQobmFtZSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgbmFtZSk7XG59XG5mdW5jdGlvbiB0ZXh0KGRhdGEpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YSk7XG59XG5mdW5jdGlvbiBzcGFjZSgpIHtcbiAgICByZXR1cm4gdGV4dCgnICcpO1xufVxuZnVuY3Rpb24gZW1wdHkoKSB7XG4gICAgcmV0dXJuIHRleHQoJycpO1xufVxuZnVuY3Rpb24gY29tbWVudChjb250ZW50KSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoY29udGVudCk7XG59XG5mdW5jdGlvbiBsaXN0ZW4obm9kZSwgZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpIHtcbiAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xuICAgIHJldHVybiAoKSA9PiBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xufVxuZnVuY3Rpb24gcHJldmVudF9kZWZhdWx0KGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICB9O1xufVxuZnVuY3Rpb24gc3RvcF9wcm9wYWdhdGlvbihmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywgZXZlbnQpO1xuICAgIH07XG59XG5mdW5jdGlvbiBzdG9wX2ltbWVkaWF0ZV9wcm9wYWdhdGlvbihmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywgZXZlbnQpO1xuICAgIH07XG59XG5mdW5jdGlvbiBzZWxmKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IHRoaXMpXG4gICAgICAgICAgICBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICB9O1xufVxuZnVuY3Rpb24gdHJ1c3RlZChmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBpZiAoZXZlbnQuaXNUcnVzdGVkKVxuICAgICAgICAgICAgZm4uY2FsbCh0aGlzLCBldmVudCk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGF0dHIobm9kZSwgYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKVxuICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICAgIGVsc2UgaWYgKG5vZGUuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkgIT09IHZhbHVlKVxuICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIHZhbHVlKTtcbn1cbi8qKlxuICogTGlzdCBvZiBhdHRyaWJ1dGVzIHRoYXQgc2hvdWxkIGFsd2F5cyBiZSBzZXQgdGhyb3VnaCB0aGUgYXR0ciBtZXRob2QsXG4gKiBiZWNhdXNlIHVwZGF0aW5nIHRoZW0gdGhyb3VnaCB0aGUgcHJvcGVydHkgc2V0dGVyIGRvZXNuJ3Qgd29yayByZWxpYWJseS5cbiAqIEluIHRoZSBleGFtcGxlIG9mIGB3aWR0aGAvYGhlaWdodGAsIHRoZSBwcm9ibGVtIGlzIHRoYXQgdGhlIHNldHRlciBvbmx5XG4gKiBhY2NlcHRzIG51bWVyaWMgdmFsdWVzLCBidXQgdGhlIGF0dHJpYnV0ZSBjYW4gYWxzbyBiZSBzZXQgdG8gYSBzdHJpbmcgbGlrZSBgNTAlYC5cbiAqIElmIHRoaXMgbGlzdCBiZWNvbWVzIHRvbyBiaWcsIHJldGhpbmsgdGhpcyBhcHByb2FjaC5cbiAqL1xuY29uc3QgYWx3YXlzX3NldF90aHJvdWdoX3NldF9hdHRyaWJ1dGUgPSBbJ3dpZHRoJywgJ2hlaWdodCddO1xuZnVuY3Rpb24gc2V0X2F0dHJpYnV0ZXMobm9kZSwgYXR0cmlidXRlcykge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBjb25zdCBkZXNjcmlwdG9ycyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JzKG5vZGUuX19wcm90b19fKTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIGlmIChhdHRyaWJ1dGVzW2tleV0gPT0gbnVsbCkge1xuICAgICAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChrZXkgPT09ICdzdHlsZScpIHtcbiAgICAgICAgICAgIG5vZGUuc3R5bGUuY3NzVGV4dCA9IGF0dHJpYnV0ZXNba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChrZXkgPT09ICdfX3ZhbHVlJykge1xuICAgICAgICAgICAgbm9kZS52YWx1ZSA9IG5vZGVba2V5XSA9IGF0dHJpYnV0ZXNba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkZXNjcmlwdG9yc1trZXldICYmIGRlc2NyaXB0b3JzW2tleV0uc2V0ICYmIGFsd2F5c19zZXRfdGhyb3VnaF9zZXRfYXR0cmlidXRlLmluZGV4T2Yoa2V5KSA9PT0gLTEpIHtcbiAgICAgICAgICAgIG5vZGVba2V5XSA9IGF0dHJpYnV0ZXNba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGF0dHIobm9kZSwga2V5LCBhdHRyaWJ1dGVzW2tleV0pO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gc2V0X3N2Z19hdHRyaWJ1dGVzKG5vZGUsIGF0dHJpYnV0ZXMpIHtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIGF0dHIobm9kZSwga2V5LCBhdHRyaWJ1dGVzW2tleV0pO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNldF9jdXN0b21fZWxlbWVudF9kYXRhX21hcChub2RlLCBkYXRhX21hcCkge1xuICAgIE9iamVjdC5rZXlzKGRhdGFfbWFwKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgc2V0X2N1c3RvbV9lbGVtZW50X2RhdGEobm9kZSwga2V5LCBkYXRhX21hcFtrZXldKTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIHNldF9jdXN0b21fZWxlbWVudF9kYXRhKG5vZGUsIHByb3AsIHZhbHVlKSB7XG4gICAgaWYgKHByb3AgaW4gbm9kZSkge1xuICAgICAgICBub2RlW3Byb3BdID0gdHlwZW9mIG5vZGVbcHJvcF0gPT09ICdib29sZWFuJyAmJiB2YWx1ZSA9PT0gJycgPyB0cnVlIDogdmFsdWU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBhdHRyKG5vZGUsIHByb3AsIHZhbHVlKTtcbiAgICB9XG59XG5mdW5jdGlvbiBzZXRfZHluYW1pY19lbGVtZW50X2RhdGEodGFnKSB7XG4gICAgcmV0dXJuICgvLS8udGVzdCh0YWcpKSA/IHNldF9jdXN0b21fZWxlbWVudF9kYXRhX21hcCA6IHNldF9hdHRyaWJ1dGVzO1xufVxuZnVuY3Rpb24geGxpbmtfYXR0cihub2RlLCBhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gICAgbm9kZS5zZXRBdHRyaWJ1dGVOUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaycsIGF0dHJpYnV0ZSwgdmFsdWUpO1xufVxuZnVuY3Rpb24gZ2V0X2JpbmRpbmdfZ3JvdXBfdmFsdWUoZ3JvdXAsIF9fdmFsdWUsIGNoZWNrZWQpIHtcbiAgICBjb25zdCB2YWx1ZSA9IG5ldyBTZXQoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGdyb3VwLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGlmIChncm91cFtpXS5jaGVja2VkKVxuICAgICAgICAgICAgdmFsdWUuYWRkKGdyb3VwW2ldLl9fdmFsdWUpO1xuICAgIH1cbiAgICBpZiAoIWNoZWNrZWQpIHtcbiAgICAgICAgdmFsdWUuZGVsZXRlKF9fdmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gQXJyYXkuZnJvbSh2YWx1ZSk7XG59XG5mdW5jdGlvbiBpbml0X2JpbmRpbmdfZ3JvdXAoZ3JvdXApIHtcbiAgICBsZXQgX2lucHV0cztcbiAgICByZXR1cm4ge1xuICAgICAgICAvKiBwdXNoICovIHAoLi4uaW5wdXRzKSB7XG4gICAgICAgICAgICBfaW5wdXRzID0gaW5wdXRzO1xuICAgICAgICAgICAgX2lucHV0cy5mb3JFYWNoKGlucHV0ID0+IGdyb3VwLnB1c2goaW5wdXQpKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyogcmVtb3ZlICovIHIoKSB7XG4gICAgICAgICAgICBfaW5wdXRzLmZvckVhY2goaW5wdXQgPT4gZ3JvdXAuc3BsaWNlKGdyb3VwLmluZGV4T2YoaW5wdXQpLCAxKSk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gaW5pdF9iaW5kaW5nX2dyb3VwX2R5bmFtaWMoZ3JvdXAsIGluZGV4ZXMpIHtcbiAgICBsZXQgX2dyb3VwID0gZ2V0X2JpbmRpbmdfZ3JvdXAoZ3JvdXApO1xuICAgIGxldCBfaW5wdXRzO1xuICAgIGZ1bmN0aW9uIGdldF9iaW5kaW5nX2dyb3VwKGdyb3VwKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5kZXhlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZ3JvdXAgPSBncm91cFtpbmRleGVzW2ldXSA9IGdyb3VwW2luZGV4ZXNbaV1dIHx8IFtdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBncm91cDtcbiAgICB9XG4gICAgZnVuY3Rpb24gcHVzaCgpIHtcbiAgICAgICAgX2lucHV0cy5mb3JFYWNoKGlucHV0ID0+IF9ncm91cC5wdXNoKGlucHV0KSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgX2lucHV0cy5mb3JFYWNoKGlucHV0ID0+IF9ncm91cC5zcGxpY2UoX2dyb3VwLmluZGV4T2YoaW5wdXQpLCAxKSk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIC8qIHVwZGF0ZSAqLyB1KG5ld19pbmRleGVzKSB7XG4gICAgICAgICAgICBpbmRleGVzID0gbmV3X2luZGV4ZXM7XG4gICAgICAgICAgICBjb25zdCBuZXdfZ3JvdXAgPSBnZXRfYmluZGluZ19ncm91cChncm91cCk7XG4gICAgICAgICAgICBpZiAobmV3X2dyb3VwICE9PSBfZ3JvdXApIHtcbiAgICAgICAgICAgICAgICByZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBfZ3JvdXAgPSBuZXdfZ3JvdXA7XG4gICAgICAgICAgICAgICAgcHVzaCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvKiBwdXNoICovIHAoLi4uaW5wdXRzKSB7XG4gICAgICAgICAgICBfaW5wdXRzID0gaW5wdXRzO1xuICAgICAgICAgICAgcHVzaCgpO1xuICAgICAgICB9LFxuICAgICAgICAvKiByZW1vdmUgKi8gcjogcmVtb3ZlXG4gICAgfTtcbn1cbmZ1bmN0aW9uIHRvX251bWJlcih2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gJycgPyBudWxsIDogK3ZhbHVlO1xufVxuZnVuY3Rpb24gdGltZV9yYW5nZXNfdG9fYXJyYXkocmFuZ2VzKSB7XG4gICAgY29uc3QgYXJyYXkgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJhbmdlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBhcnJheS5wdXNoKHsgc3RhcnQ6IHJhbmdlcy5zdGFydChpKSwgZW5kOiByYW5nZXMuZW5kKGkpIH0pO1xuICAgIH1cbiAgICByZXR1cm4gYXJyYXk7XG59XG5mdW5jdGlvbiBjaGlsZHJlbihlbGVtZW50KSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oZWxlbWVudC5jaGlsZE5vZGVzKTtcbn1cbmZ1bmN0aW9uIGluaXRfY2xhaW1faW5mbyhub2Rlcykge1xuICAgIGlmIChub2Rlcy5jbGFpbV9pbmZvID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbm9kZXMuY2xhaW1faW5mbyA9IHsgbGFzdF9pbmRleDogMCwgdG90YWxfY2xhaW1lZDogMCB9O1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNsYWltX25vZGUobm9kZXMsIHByZWRpY2F0ZSwgcHJvY2Vzc05vZGUsIGNyZWF0ZU5vZGUsIGRvbnRVcGRhdGVMYXN0SW5kZXggPSBmYWxzZSkge1xuICAgIC8vIFRyeSB0byBmaW5kIG5vZGVzIGluIGFuIG9yZGVyIHN1Y2ggdGhhdCB3ZSBsZW5ndGhlbiB0aGUgbG9uZ2VzdCBpbmNyZWFzaW5nIHN1YnNlcXVlbmNlXG4gICAgaW5pdF9jbGFpbV9pbmZvKG5vZGVzKTtcbiAgICBjb25zdCByZXN1bHROb2RlID0gKCgpID0+IHtcbiAgICAgICAgLy8gV2UgZmlyc3QgdHJ5IHRvIGZpbmQgYW4gZWxlbWVudCBhZnRlciB0aGUgcHJldmlvdXMgb25lXG4gICAgICAgIGZvciAobGV0IGkgPSBub2Rlcy5jbGFpbV9pbmZvLmxhc3RfaW5kZXg7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgICAgICAgaWYgKHByZWRpY2F0ZShub2RlKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VtZW50ID0gcHJvY2Vzc05vZGUobm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlcGxhY2VtZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0gPSByZXBsYWNlbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFkb250VXBkYXRlTGFzdEluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLmNsYWltX2luZm8ubGFzdF9pbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE90aGVyd2lzZSwgd2UgdHJ5IHRvIGZpbmQgb25lIGJlZm9yZVxuICAgICAgICAvLyBXZSBpdGVyYXRlIGluIHJldmVyc2Ugc28gdGhhdCB3ZSBkb24ndCBnbyB0b28gZmFyIGJhY2tcbiAgICAgICAgZm9yIChsZXQgaSA9IG5vZGVzLmNsYWltX2luZm8ubGFzdF9pbmRleCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XG4gICAgICAgICAgICBpZiAocHJlZGljYXRlKG5vZGUpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVwbGFjZW1lbnQgPSBwcm9jZXNzTm9kZShub2RlKTtcbiAgICAgICAgICAgICAgICBpZiAocmVwbGFjZW1lbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBub2Rlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBub2Rlc1tpXSA9IHJlcGxhY2VtZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWRvbnRVcGRhdGVMYXN0SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZXMuY2xhaW1faW5mby5sYXN0X2luZGV4ID0gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAocmVwbGFjZW1lbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBTaW5jZSB3ZSBzcGxpY2VkIGJlZm9yZSB0aGUgbGFzdF9pbmRleCwgd2UgZGVjcmVhc2UgaXRcbiAgICAgICAgICAgICAgICAgICAgbm9kZXMuY2xhaW1faW5mby5sYXN0X2luZGV4LS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIElmIHdlIGNhbid0IGZpbmQgYW55IG1hdGNoaW5nIG5vZGUsIHdlIGNyZWF0ZSBhIG5ldyBvbmVcbiAgICAgICAgcmV0dXJuIGNyZWF0ZU5vZGUoKTtcbiAgICB9KSgpO1xuICAgIHJlc3VsdE5vZGUuY2xhaW1fb3JkZXIgPSBub2Rlcy5jbGFpbV9pbmZvLnRvdGFsX2NsYWltZWQ7XG4gICAgbm9kZXMuY2xhaW1faW5mby50b3RhbF9jbGFpbWVkICs9IDE7XG4gICAgcmV0dXJuIHJlc3VsdE5vZGU7XG59XG5mdW5jdGlvbiBjbGFpbV9lbGVtZW50X2Jhc2Uobm9kZXMsIG5hbWUsIGF0dHJpYnV0ZXMsIGNyZWF0ZV9lbGVtZW50KSB7XG4gICAgcmV0dXJuIGNsYWltX25vZGUobm9kZXMsIChub2RlKSA9PiBub2RlLm5vZGVOYW1lID09PSBuYW1lLCAobm9kZSkgPT4ge1xuICAgICAgICBjb25zdCByZW1vdmUgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBub2RlLmF0dHJpYnV0ZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IG5vZGUuYXR0cmlidXRlc1tqXTtcbiAgICAgICAgICAgIGlmICghYXR0cmlidXRlc1thdHRyaWJ1dGUubmFtZV0pIHtcbiAgICAgICAgICAgICAgICByZW1vdmUucHVzaChhdHRyaWJ1dGUubmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVtb3ZlLmZvckVhY2godiA9PiBub2RlLnJlbW92ZUF0dHJpYnV0ZSh2KSk7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSwgKCkgPT4gY3JlYXRlX2VsZW1lbnQobmFtZSkpO1xufVxuZnVuY3Rpb24gY2xhaW1fZWxlbWVudChub2RlcywgbmFtZSwgYXR0cmlidXRlcykge1xuICAgIHJldHVybiBjbGFpbV9lbGVtZW50X2Jhc2Uobm9kZXMsIG5hbWUsIGF0dHJpYnV0ZXMsIGVsZW1lbnQpO1xufVxuZnVuY3Rpb24gY2xhaW1fc3ZnX2VsZW1lbnQobm9kZXMsIG5hbWUsIGF0dHJpYnV0ZXMpIHtcbiAgICByZXR1cm4gY2xhaW1fZWxlbWVudF9iYXNlKG5vZGVzLCBuYW1lLCBhdHRyaWJ1dGVzLCBzdmdfZWxlbWVudCk7XG59XG5mdW5jdGlvbiBjbGFpbV90ZXh0KG5vZGVzLCBkYXRhKSB7XG4gICAgcmV0dXJuIGNsYWltX25vZGUobm9kZXMsIChub2RlKSA9PiBub2RlLm5vZGVUeXBlID09PSAzLCAobm9kZSkgPT4ge1xuICAgICAgICBjb25zdCBkYXRhU3RyID0gJycgKyBkYXRhO1xuICAgICAgICBpZiAobm9kZS5kYXRhLnN0YXJ0c1dpdGgoZGF0YVN0cikpIHtcbiAgICAgICAgICAgIGlmIChub2RlLmRhdGEubGVuZ3RoICE9PSBkYXRhU3RyLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBub2RlLnNwbGl0VGV4dChkYXRhU3RyLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBub2RlLmRhdGEgPSBkYXRhU3RyO1xuICAgICAgICB9XG4gICAgfSwgKCkgPT4gdGV4dChkYXRhKSwgdHJ1ZSAvLyBUZXh0IG5vZGVzIHNob3VsZCBub3QgdXBkYXRlIGxhc3QgaW5kZXggc2luY2UgaXQgaXMgbGlrZWx5IG5vdCB3b3J0aCBpdCB0byBlbGltaW5hdGUgYW4gaW5jcmVhc2luZyBzdWJzZXF1ZW5jZSBvZiBhY3R1YWwgZWxlbWVudHNcbiAgICApO1xufVxuZnVuY3Rpb24gY2xhaW1fc3BhY2Uobm9kZXMpIHtcbiAgICByZXR1cm4gY2xhaW1fdGV4dChub2RlcywgJyAnKTtcbn1cbmZ1bmN0aW9uIGNsYWltX2NvbW1lbnQobm9kZXMsIGRhdGEpIHtcbiAgICByZXR1cm4gY2xhaW1fbm9kZShub2RlcywgKG5vZGUpID0+IG5vZGUubm9kZVR5cGUgPT09IDgsIChub2RlKSA9PiB7XG4gICAgICAgIG5vZGUuZGF0YSA9ICcnICsgZGF0YTtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9LCAoKSA9PiBjb21tZW50KGRhdGEpLCB0cnVlKTtcbn1cbmZ1bmN0aW9uIGZpbmRfY29tbWVudChub2RlcywgdGV4dCwgc3RhcnQpIHtcbiAgICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBub2Rlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XG4gICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSA4IC8qIGNvbW1lbnQgbm9kZSAqLyAmJiBub2RlLnRleHRDb250ZW50LnRyaW0oKSA9PT0gdGV4dCkge1xuICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5vZGVzLmxlbmd0aDtcbn1cbmZ1bmN0aW9uIGNsYWltX2h0bWxfdGFnKG5vZGVzLCBpc19zdmcpIHtcbiAgICAvLyBmaW5kIGh0bWwgb3BlbmluZyB0YWdcbiAgICBjb25zdCBzdGFydF9pbmRleCA9IGZpbmRfY29tbWVudChub2RlcywgJ0hUTUxfVEFHX1NUQVJUJywgMCk7XG4gICAgY29uc3QgZW5kX2luZGV4ID0gZmluZF9jb21tZW50KG5vZGVzLCAnSFRNTF9UQUdfRU5EJywgc3RhcnRfaW5kZXgpO1xuICAgIGlmIChzdGFydF9pbmRleCA9PT0gZW5kX2luZGV4KSB7XG4gICAgICAgIHJldHVybiBuZXcgSHRtbFRhZ0h5ZHJhdGlvbih1bmRlZmluZWQsIGlzX3N2Zyk7XG4gICAgfVxuICAgIGluaXRfY2xhaW1faW5mbyhub2Rlcyk7XG4gICAgY29uc3QgaHRtbF90YWdfbm9kZXMgPSBub2Rlcy5zcGxpY2Uoc3RhcnRfaW5kZXgsIGVuZF9pbmRleCAtIHN0YXJ0X2luZGV4ICsgMSk7XG4gICAgZGV0YWNoKGh0bWxfdGFnX25vZGVzWzBdKTtcbiAgICBkZXRhY2goaHRtbF90YWdfbm9kZXNbaHRtbF90YWdfbm9kZXMubGVuZ3RoIC0gMV0pO1xuICAgIGNvbnN0IGNsYWltZWRfbm9kZXMgPSBodG1sX3RhZ19ub2Rlcy5zbGljZSgxLCBodG1sX3RhZ19ub2Rlcy5sZW5ndGggLSAxKTtcbiAgICBmb3IgKGNvbnN0IG4gb2YgY2xhaW1lZF9ub2Rlcykge1xuICAgICAgICBuLmNsYWltX29yZGVyID0gbm9kZXMuY2xhaW1faW5mby50b3RhbF9jbGFpbWVkO1xuICAgICAgICBub2Rlcy5jbGFpbV9pbmZvLnRvdGFsX2NsYWltZWQgKz0gMTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBIdG1sVGFnSHlkcmF0aW9uKGNsYWltZWRfbm9kZXMsIGlzX3N2Zyk7XG59XG5mdW5jdGlvbiBzZXRfZGF0YSh0ZXh0LCBkYXRhKSB7XG4gICAgZGF0YSA9ICcnICsgZGF0YTtcbiAgICBpZiAodGV4dC5kYXRhID09PSBkYXRhKVxuICAgICAgICByZXR1cm47XG4gICAgdGV4dC5kYXRhID0gZGF0YTtcbn1cbmZ1bmN0aW9uIHNldF9kYXRhX2NvbnRlbnRlZGl0YWJsZSh0ZXh0LCBkYXRhKSB7XG4gICAgZGF0YSA9ICcnICsgZGF0YTtcbiAgICBpZiAodGV4dC53aG9sZVRleHQgPT09IGRhdGEpXG4gICAgICAgIHJldHVybjtcbiAgICB0ZXh0LmRhdGEgPSBkYXRhO1xufVxuZnVuY3Rpb24gc2V0X2RhdGFfbWF5YmVfY29udGVudGVkaXRhYmxlKHRleHQsIGRhdGEsIGF0dHJfdmFsdWUpIHtcbiAgICBpZiAofmNvbnRlbnRlZGl0YWJsZV90cnV0aHlfdmFsdWVzLmluZGV4T2YoYXR0cl92YWx1ZSkpIHtcbiAgICAgICAgc2V0X2RhdGFfY29udGVudGVkaXRhYmxlKHRleHQsIGRhdGEpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgc2V0X2RhdGEodGV4dCwgZGF0YSk7XG4gICAgfVxufVxuZnVuY3Rpb24gc2V0X2lucHV0X3ZhbHVlKGlucHV0LCB2YWx1ZSkge1xuICAgIGlucHV0LnZhbHVlID0gdmFsdWUgPT0gbnVsbCA/ICcnIDogdmFsdWU7XG59XG5mdW5jdGlvbiBzZXRfaW5wdXRfdHlwZShpbnB1dCwgdHlwZSkge1xuICAgIHRyeSB7XG4gICAgICAgIGlucHV0LnR5cGUgPSB0eXBlO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgfVxufVxuZnVuY3Rpb24gc2V0X3N0eWxlKG5vZGUsIGtleSwgdmFsdWUsIGltcG9ydGFudCkge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICAgIG5vZGUuc3R5bGUucmVtb3ZlUHJvcGVydHkoa2V5KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG5vZGUuc3R5bGUuc2V0UHJvcGVydHkoa2V5LCB2YWx1ZSwgaW1wb3J0YW50ID8gJ2ltcG9ydGFudCcgOiAnJyk7XG4gICAgfVxufVxuZnVuY3Rpb24gc2VsZWN0X29wdGlvbihzZWxlY3QsIHZhbHVlLCBtb3VudGluZykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZWN0Lm9wdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gc2VsZWN0Lm9wdGlvbnNbaV07XG4gICAgICAgIGlmIChvcHRpb24uX192YWx1ZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFtb3VudGluZyB8fCB2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHNlbGVjdC5zZWxlY3RlZEluZGV4ID0gLTE7IC8vIG5vIG9wdGlvbiBzaG91bGQgYmUgc2VsZWN0ZWRcbiAgICB9XG59XG5mdW5jdGlvbiBzZWxlY3Rfb3B0aW9ucyhzZWxlY3QsIHZhbHVlKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Qub3B0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBjb25zdCBvcHRpb24gPSBzZWxlY3Qub3B0aW9uc1tpXTtcbiAgICAgICAgb3B0aW9uLnNlbGVjdGVkID0gfnZhbHVlLmluZGV4T2Yob3B0aW9uLl9fdmFsdWUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNlbGVjdF92YWx1ZShzZWxlY3QpIHtcbiAgICBjb25zdCBzZWxlY3RlZF9vcHRpb24gPSBzZWxlY3QucXVlcnlTZWxlY3RvcignOmNoZWNrZWQnKTtcbiAgICByZXR1cm4gc2VsZWN0ZWRfb3B0aW9uICYmIHNlbGVjdGVkX29wdGlvbi5fX3ZhbHVlO1xufVxuZnVuY3Rpb24gc2VsZWN0X211bHRpcGxlX3ZhbHVlKHNlbGVjdCkge1xuICAgIHJldHVybiBbXS5tYXAuY2FsbChzZWxlY3QucXVlcnlTZWxlY3RvckFsbCgnOmNoZWNrZWQnKSwgb3B0aW9uID0+IG9wdGlvbi5fX3ZhbHVlKTtcbn1cbi8vIHVuZm9ydHVuYXRlbHkgdGhpcyBjYW4ndCBiZSBhIGNvbnN0YW50IGFzIHRoYXQgd291bGRuJ3QgYmUgdHJlZS1zaGFrZWFibGVcbi8vIHNvIHdlIGNhY2hlIHRoZSByZXN1bHQgaW5zdGVhZFxubGV0IGNyb3Nzb3JpZ2luO1xuZnVuY3Rpb24gaXNfY3Jvc3NvcmlnaW4oKSB7XG4gICAgaWYgKGNyb3Nzb3JpZ2luID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY3Jvc3NvcmlnaW4gPSBmYWxzZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucGFyZW50KSB7XG4gICAgICAgICAgICAgICAgdm9pZCB3aW5kb3cucGFyZW50LmRvY3VtZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY3Jvc3NvcmlnaW4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjcm9zc29yaWdpbjtcbn1cbmZ1bmN0aW9uIGFkZF9pZnJhbWVfcmVzaXplX2xpc3RlbmVyKG5vZGUsIGZuKSB7XG4gICAgY29uc3QgY29tcHV0ZWRfc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUpO1xuICAgIGlmIChjb21wdXRlZF9zdHlsZS5wb3NpdGlvbiA9PT0gJ3N0YXRpYycpIHtcbiAgICAgICAgbm9kZS5zdHlsZS5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7XG4gICAgfVxuICAgIGNvbnN0IGlmcmFtZSA9IGVsZW1lbnQoJ2lmcmFtZScpO1xuICAgIGlmcmFtZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ2Rpc3BsYXk6IGJsb2NrOyBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogMDsgbGVmdDogMDsgd2lkdGg6IDEwMCU7IGhlaWdodDogMTAwJTsgJyArXG4gICAgICAgICdvdmVyZmxvdzogaGlkZGVuOyBib3JkZXI6IDA7IG9wYWNpdHk6IDA7IHBvaW50ZXItZXZlbnRzOiBub25lOyB6LWluZGV4OiAtMTsnKTtcbiAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgaWZyYW1lLnRhYkluZGV4ID0gLTE7XG4gICAgY29uc3QgY3Jvc3NvcmlnaW4gPSBpc19jcm9zc29yaWdpbigpO1xuICAgIGxldCB1bnN1YnNjcmliZTtcbiAgICBpZiAoY3Jvc3NvcmlnaW4pIHtcbiAgICAgICAgaWZyYW1lLnNyYyA9IFwiZGF0YTp0ZXh0L2h0bWwsPHNjcmlwdD5vbnJlc2l6ZT1mdW5jdGlvbigpe3BhcmVudC5wb3N0TWVzc2FnZSgwLCcqJyl9PC9zY3JpcHQ+XCI7XG4gICAgICAgIHVuc3Vic2NyaWJlID0gbGlzdGVuKHdpbmRvdywgJ21lc3NhZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5zb3VyY2UgPT09IGlmcmFtZS5jb250ZW50V2luZG93KVxuICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWZyYW1lLnNyYyA9ICdhYm91dDpibGFuayc7XG4gICAgICAgIGlmcmFtZS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICB1bnN1YnNjcmliZSA9IGxpc3RlbihpZnJhbWUuY29udGVudFdpbmRvdywgJ3Jlc2l6ZScsIGZuKTtcbiAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSBhbiBpbml0aWFsIHJlc2l6ZSBldmVudCBpcyBmaXJlZCBfYWZ0ZXJfIHRoZSBpZnJhbWUgaXMgbG9hZGVkICh3aGljaCBpcyBhc3luY2hyb25vdXMpXG4gICAgICAgICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3N2ZWx0ZWpzL3N2ZWx0ZS9pc3N1ZXMvNDIzM1xuICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgYXBwZW5kKG5vZGUsIGlmcmFtZSk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgaWYgKGNyb3Nzb3JpZ2luKSB7XG4gICAgICAgICAgICB1bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHVuc3Vic2NyaWJlICYmIGlmcmFtZS5jb250ZW50V2luZG93KSB7XG4gICAgICAgICAgICB1bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgICAgIGRldGFjaChpZnJhbWUpO1xuICAgIH07XG59XG5jb25zdCByZXNpemVfb2JzZXJ2ZXJfY29udGVudF9ib3ggPSAvKiBAX19QVVJFX18gKi8gbmV3IFJlc2l6ZU9ic2VydmVyU2luZ2xldG9uKHsgYm94OiAnY29udGVudC1ib3gnIH0pO1xuY29uc3QgcmVzaXplX29ic2VydmVyX2JvcmRlcl9ib3ggPSAvKiBAX19QVVJFX18gKi8gbmV3IFJlc2l6ZU9ic2VydmVyU2luZ2xldG9uKHsgYm94OiAnYm9yZGVyLWJveCcgfSk7XG5jb25zdCByZXNpemVfb2JzZXJ2ZXJfZGV2aWNlX3BpeGVsX2NvbnRlbnRfYm94ID0gLyogQF9fUFVSRV9fICovIG5ldyBSZXNpemVPYnNlcnZlclNpbmdsZXRvbih7IGJveDogJ2RldmljZS1waXhlbC1jb250ZW50LWJveCcgfSk7XG5mdW5jdGlvbiB0b2dnbGVfY2xhc3MoZWxlbWVudCwgbmFtZSwgdG9nZ2xlKSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3RbdG9nZ2xlID8gJ2FkZCcgOiAncmVtb3ZlJ10obmFtZSk7XG59XG5mdW5jdGlvbiBjdXN0b21fZXZlbnQodHlwZSwgZGV0YWlsLCB7IGJ1YmJsZXMgPSBmYWxzZSwgY2FuY2VsYWJsZSA9IGZhbHNlIH0gPSB7fSkge1xuICAgIGNvbnN0IGUgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnQ3VzdG9tRXZlbnQnKTtcbiAgICBlLmluaXRDdXN0b21FdmVudCh0eXBlLCBidWJibGVzLCBjYW5jZWxhYmxlLCBkZXRhaWwpO1xuICAgIHJldHVybiBlO1xufVxuZnVuY3Rpb24gcXVlcnlfc2VsZWN0b3JfYWxsKHNlbGVjdG9yLCBwYXJlbnQgPSBkb2N1bWVudC5ib2R5KSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20ocGFyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKTtcbn1cbmZ1bmN0aW9uIGhlYWRfc2VsZWN0b3Iobm9kZUlkLCBoZWFkKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgbGV0IHN0YXJ0ZWQgPSAwO1xuICAgIGZvciAoY29uc3Qgbm9kZSBvZiBoZWFkLmNoaWxkTm9kZXMpIHtcbiAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDggLyogY29tbWVudCBub2RlICovKSB7XG4gICAgICAgICAgICBjb25zdCBjb21tZW50ID0gbm9kZS50ZXh0Q29udGVudC50cmltKCk7XG4gICAgICAgICAgICBpZiAoY29tbWVudCA9PT0gYEhFQURfJHtub2RlSWR9X0VORGApIHtcbiAgICAgICAgICAgICAgICBzdGFydGVkIC09IDE7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gobm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChjb21tZW50ID09PSBgSEVBRF8ke25vZGVJZH1fU1RBUlRgKSB7XG4gICAgICAgICAgICAgICAgc3RhcnRlZCArPSAxO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHN0YXJ0ZWQgPiAwKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChub2RlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuY2xhc3MgSHRtbFRhZyB7XG4gICAgY29uc3RydWN0b3IoaXNfc3ZnID0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5pc19zdmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc19zdmcgPSBpc19zdmc7XG4gICAgICAgIHRoaXMuZSA9IHRoaXMubiA9IG51bGw7XG4gICAgfVxuICAgIGMoaHRtbCkge1xuICAgICAgICB0aGlzLmgoaHRtbCk7XG4gICAgfVxuICAgIG0oaHRtbCwgdGFyZ2V0LCBhbmNob3IgPSBudWxsKSB7XG4gICAgICAgIGlmICghdGhpcy5lKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc19zdmcpXG4gICAgICAgICAgICAgICAgdGhpcy5lID0gc3ZnX2VsZW1lbnQodGFyZ2V0Lm5vZGVOYW1lKTtcbiAgICAgICAgICAgIC8qKiAjNzM2NCAgdGFyZ2V0IGZvciA8dGVtcGxhdGU+IG1heSBiZSBwcm92aWRlZCBhcyAjZG9jdW1lbnQtZnJhZ21lbnQoMTEpICovXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5lID0gZWxlbWVudCgodGFyZ2V0Lm5vZGVUeXBlID09PSAxMSA/ICdURU1QTEFURScgOiB0YXJnZXQubm9kZU5hbWUpKTtcbiAgICAgICAgICAgIHRoaXMudCA9IHRhcmdldC50YWdOYW1lICE9PSAnVEVNUExBVEUnID8gdGFyZ2V0IDogdGFyZ2V0LmNvbnRlbnQ7XG4gICAgICAgICAgICB0aGlzLmMoaHRtbCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pKGFuY2hvcik7XG4gICAgfVxuICAgIGgoaHRtbCkge1xuICAgICAgICB0aGlzLmUuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgdGhpcy5uID0gQXJyYXkuZnJvbSh0aGlzLmUubm9kZU5hbWUgPT09ICdURU1QTEFURScgPyB0aGlzLmUuY29udGVudC5jaGlsZE5vZGVzIDogdGhpcy5lLmNoaWxkTm9kZXMpO1xuICAgIH1cbiAgICBpKGFuY2hvcikge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubi5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgaW5zZXJ0KHRoaXMudCwgdGhpcy5uW2ldLCBhbmNob3IpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHAoaHRtbCkge1xuICAgICAgICB0aGlzLmQoKTtcbiAgICAgICAgdGhpcy5oKGh0bWwpO1xuICAgICAgICB0aGlzLmkodGhpcy5hKTtcbiAgICB9XG4gICAgZCgpIHtcbiAgICAgICAgdGhpcy5uLmZvckVhY2goZGV0YWNoKTtcbiAgICB9XG59XG5jbGFzcyBIdG1sVGFnSHlkcmF0aW9uIGV4dGVuZHMgSHRtbFRhZyB7XG4gICAgY29uc3RydWN0b3IoY2xhaW1lZF9ub2RlcywgaXNfc3ZnID0gZmFsc2UpIHtcbiAgICAgICAgc3VwZXIoaXNfc3ZnKTtcbiAgICAgICAgdGhpcy5lID0gdGhpcy5uID0gbnVsbDtcbiAgICAgICAgdGhpcy5sID0gY2xhaW1lZF9ub2RlcztcbiAgICB9XG4gICAgYyhodG1sKSB7XG4gICAgICAgIGlmICh0aGlzLmwpIHtcbiAgICAgICAgICAgIHRoaXMubiA9IHRoaXMubDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLmMoaHRtbCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaShhbmNob3IpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm4ubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGluc2VydF9oeWRyYXRpb24odGhpcy50LCB0aGlzLm5baV0sIGFuY2hvcik7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBhdHRyaWJ1dGVfdG9fb2JqZWN0KGF0dHJpYnV0ZXMpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZSBvZiBhdHRyaWJ1dGVzKSB7XG4gICAgICAgIHJlc3VsdFthdHRyaWJ1dGUubmFtZV0gPSBhdHRyaWJ1dGUudmFsdWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBnZXRfY3VzdG9tX2VsZW1lbnRzX3Nsb3RzKGVsZW1lbnQpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBlbGVtZW50LmNoaWxkTm9kZXMuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgICByZXN1bHRbbm9kZS5zbG90IHx8ICdkZWZhdWx0J10gPSB0cnVlO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBjb25zdHJ1Y3Rfc3ZlbHRlX2NvbXBvbmVudChjb21wb25lbnQsIHByb3BzKSB7XG4gICAgcmV0dXJuIG5ldyBjb21wb25lbnQocHJvcHMpO1xufVxuXG4vLyB3ZSBuZWVkIHRvIHN0b3JlIHRoZSBpbmZvcm1hdGlvbiBmb3IgbXVsdGlwbGUgZG9jdW1lbnRzIGJlY2F1c2UgYSBTdmVsdGUgYXBwbGljYXRpb24gY291bGQgYWxzbyBjb250YWluIGlmcmFtZXNcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9zdmVsdGVqcy9zdmVsdGUvaXNzdWVzLzM2MjRcbmNvbnN0IG1hbmFnZWRfc3R5bGVzID0gbmV3IE1hcCgpO1xubGV0IGFjdGl2ZSA9IDA7XG4vLyBodHRwczovL2dpdGh1Yi5jb20vZGFya3NreWFwcC9zdHJpbmctaGFzaC9ibG9iL21hc3Rlci9pbmRleC5qc1xuZnVuY3Rpb24gaGFzaChzdHIpIHtcbiAgICBsZXQgaGFzaCA9IDUzODE7XG4gICAgbGV0IGkgPSBzdHIubGVuZ3RoO1xuICAgIHdoaWxlIChpLS0pXG4gICAgICAgIGhhc2ggPSAoKGhhc2ggPDwgNSkgLSBoYXNoKSBeIHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgIHJldHVybiBoYXNoID4+PiAwO1xufVxuZnVuY3Rpb24gY3JlYXRlX3N0eWxlX2luZm9ybWF0aW9uKGRvYywgbm9kZSkge1xuICAgIGNvbnN0IGluZm8gPSB7IHN0eWxlc2hlZXQ6IGFwcGVuZF9lbXB0eV9zdHlsZXNoZWV0KG5vZGUpLCBydWxlczoge30gfTtcbiAgICBtYW5hZ2VkX3N0eWxlcy5zZXQoZG9jLCBpbmZvKTtcbiAgICByZXR1cm4gaW5mbztcbn1cbmZ1bmN0aW9uIGNyZWF0ZV9ydWxlKG5vZGUsIGEsIGIsIGR1cmF0aW9uLCBkZWxheSwgZWFzZSwgZm4sIHVpZCA9IDApIHtcbiAgICBjb25zdCBzdGVwID0gMTYuNjY2IC8gZHVyYXRpb247XG4gICAgbGV0IGtleWZyYW1lcyA9ICd7XFxuJztcbiAgICBmb3IgKGxldCBwID0gMDsgcCA8PSAxOyBwICs9IHN0ZXApIHtcbiAgICAgICAgY29uc3QgdCA9IGEgKyAoYiAtIGEpICogZWFzZShwKTtcbiAgICAgICAga2V5ZnJhbWVzICs9IHAgKiAxMDAgKyBgJXske2ZuKHQsIDEgLSB0KX19XFxuYDtcbiAgICB9XG4gICAgY29uc3QgcnVsZSA9IGtleWZyYW1lcyArIGAxMDAlIHske2ZuKGIsIDEgLSBiKX19XFxufWA7XG4gICAgY29uc3QgbmFtZSA9IGBfX3N2ZWx0ZV8ke2hhc2gocnVsZSl9XyR7dWlkfWA7XG4gICAgY29uc3QgZG9jID0gZ2V0X3Jvb3RfZm9yX3N0eWxlKG5vZGUpO1xuICAgIGNvbnN0IHsgc3R5bGVzaGVldCwgcnVsZXMgfSA9IG1hbmFnZWRfc3R5bGVzLmdldChkb2MpIHx8IGNyZWF0ZV9zdHlsZV9pbmZvcm1hdGlvbihkb2MsIG5vZGUpO1xuICAgIGlmICghcnVsZXNbbmFtZV0pIHtcbiAgICAgICAgcnVsZXNbbmFtZV0gPSB0cnVlO1xuICAgICAgICBzdHlsZXNoZWV0Lmluc2VydFJ1bGUoYEBrZXlmcmFtZXMgJHtuYW1lfSAke3J1bGV9YCwgc3R5bGVzaGVldC5jc3NSdWxlcy5sZW5ndGgpO1xuICAgIH1cbiAgICBjb25zdCBhbmltYXRpb24gPSBub2RlLnN0eWxlLmFuaW1hdGlvbiB8fCAnJztcbiAgICBub2RlLnN0eWxlLmFuaW1hdGlvbiA9IGAke2FuaW1hdGlvbiA/IGAke2FuaW1hdGlvbn0sIGAgOiAnJ30ke25hbWV9ICR7ZHVyYXRpb259bXMgbGluZWFyICR7ZGVsYXl9bXMgMSBib3RoYDtcbiAgICBhY3RpdmUgKz0gMTtcbiAgICByZXR1cm4gbmFtZTtcbn1cbmZ1bmN0aW9uIGRlbGV0ZV9ydWxlKG5vZGUsIG5hbWUpIHtcbiAgICBjb25zdCBwcmV2aW91cyA9IChub2RlLnN0eWxlLmFuaW1hdGlvbiB8fCAnJykuc3BsaXQoJywgJyk7XG4gICAgY29uc3QgbmV4dCA9IHByZXZpb3VzLmZpbHRlcihuYW1lXG4gICAgICAgID8gYW5pbSA9PiBhbmltLmluZGV4T2YobmFtZSkgPCAwIC8vIHJlbW92ZSBzcGVjaWZpYyBhbmltYXRpb25cbiAgICAgICAgOiBhbmltID0+IGFuaW0uaW5kZXhPZignX19zdmVsdGUnKSA9PT0gLTEgLy8gcmVtb3ZlIGFsbCBTdmVsdGUgYW5pbWF0aW9uc1xuICAgICk7XG4gICAgY29uc3QgZGVsZXRlZCA9IHByZXZpb3VzLmxlbmd0aCAtIG5leHQubGVuZ3RoO1xuICAgIGlmIChkZWxldGVkKSB7XG4gICAgICAgIG5vZGUuc3R5bGUuYW5pbWF0aW9uID0gbmV4dC5qb2luKCcsICcpO1xuICAgICAgICBhY3RpdmUgLT0gZGVsZXRlZDtcbiAgICAgICAgaWYgKCFhY3RpdmUpXG4gICAgICAgICAgICBjbGVhcl9ydWxlcygpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNsZWFyX3J1bGVzKCkge1xuICAgIHJhZigoKSA9PiB7XG4gICAgICAgIGlmIChhY3RpdmUpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIG1hbmFnZWRfc3R5bGVzLmZvckVhY2goaW5mbyA9PiB7XG4gICAgICAgICAgICBjb25zdCB7IG93bmVyTm9kZSB9ID0gaW5mby5zdHlsZXNoZWV0O1xuICAgICAgICAgICAgLy8gdGhlcmUgaXMgbm8gb3duZXJOb2RlIGlmIGl0IHJ1bnMgb24ganNkb20uXG4gICAgICAgICAgICBpZiAob3duZXJOb2RlKVxuICAgICAgICAgICAgICAgIGRldGFjaChvd25lck5vZGUpO1xuICAgICAgICB9KTtcbiAgICAgICAgbWFuYWdlZF9zdHlsZXMuY2xlYXIoKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlX2FuaW1hdGlvbihub2RlLCBmcm9tLCBmbiwgcGFyYW1zKSB7XG4gICAgaWYgKCFmcm9tKVxuICAgICAgICByZXR1cm4gbm9vcDtcbiAgICBjb25zdCB0byA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgaWYgKGZyb20ubGVmdCA9PT0gdG8ubGVmdCAmJiBmcm9tLnJpZ2h0ID09PSB0by5yaWdodCAmJiBmcm9tLnRvcCA9PT0gdG8udG9wICYmIGZyb20uYm90dG9tID09PSB0by5ib3R0b20pXG4gICAgICAgIHJldHVybiBub29wO1xuICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDMwMCwgZWFzaW5nID0gaWRlbnRpdHksIFxuICAgIC8vIEB0cy1pZ25vcmUgdG9kbzogc2hvdWxkIHRoaXMgYmUgc2VwYXJhdGVkIGZyb20gZGVzdHJ1Y3R1cmluZz8gT3Igc3RhcnQvZW5kIGFkZGVkIHRvIHB1YmxpYyBhcGkgYW5kIGRvY3VtZW50YXRpb24/XG4gICAgc3RhcnQ6IHN0YXJ0X3RpbWUgPSBub3coKSArIGRlbGF5LCBcbiAgICAvLyBAdHMtaWdub3JlIHRvZG86XG4gICAgZW5kID0gc3RhcnRfdGltZSArIGR1cmF0aW9uLCB0aWNrID0gbm9vcCwgY3NzIH0gPSBmbihub2RlLCB7IGZyb20sIHRvIH0sIHBhcmFtcyk7XG4gICAgbGV0IHJ1bm5pbmcgPSB0cnVlO1xuICAgIGxldCBzdGFydGVkID0gZmFsc2U7XG4gICAgbGV0IG5hbWU7XG4gICAgZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgICAgIGlmIChjc3MpIHtcbiAgICAgICAgICAgIG5hbWUgPSBjcmVhdGVfcnVsZShub2RlLCAwLCAxLCBkdXJhdGlvbiwgZGVsYXksIGVhc2luZywgY3NzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWRlbGF5KSB7XG4gICAgICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBzdG9wKCkge1xuICAgICAgICBpZiAoY3NzKVxuICAgICAgICAgICAgZGVsZXRlX3J1bGUobm9kZSwgbmFtZSk7XG4gICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICB9XG4gICAgbG9vcChub3cgPT4ge1xuICAgICAgICBpZiAoIXN0YXJ0ZWQgJiYgbm93ID49IHN0YXJ0X3RpbWUpIHtcbiAgICAgICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGFydGVkICYmIG5vdyA+PSBlbmQpIHtcbiAgICAgICAgICAgIHRpY2soMSwgMCk7XG4gICAgICAgICAgICBzdG9wKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFydW5uaW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXJ0ZWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHAgPSBub3cgLSBzdGFydF90aW1lO1xuICAgICAgICAgICAgY29uc3QgdCA9IDAgKyAxICogZWFzaW5nKHAgLyBkdXJhdGlvbik7XG4gICAgICAgICAgICB0aWNrKHQsIDEgLSB0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgICBzdGFydCgpO1xuICAgIHRpY2soMCwgMSk7XG4gICAgcmV0dXJuIHN0b3A7XG59XG5mdW5jdGlvbiBmaXhfcG9zaXRpb24obm9kZSkge1xuICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICBpZiAoc3R5bGUucG9zaXRpb24gIT09ICdhYnNvbHV0ZScgJiYgc3R5bGUucG9zaXRpb24gIT09ICdmaXhlZCcpIHtcbiAgICAgICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSBzdHlsZTtcbiAgICAgICAgY29uc3QgYSA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIG5vZGUuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICBub2RlLnN0eWxlLndpZHRoID0gd2lkdGg7XG4gICAgICAgIG5vZGUuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICBhZGRfdHJhbnNmb3JtKG5vZGUsIGEpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGFkZF90cmFuc2Zvcm0obm9kZSwgYSkge1xuICAgIGNvbnN0IGIgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGlmIChhLmxlZnQgIT09IGIubGVmdCB8fCBhLnRvcCAhPT0gYi50b3ApIHtcbiAgICAgICAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUpO1xuICAgICAgICBjb25zdCB0cmFuc2Zvcm0gPSBzdHlsZS50cmFuc2Zvcm0gPT09ICdub25lJyA/ICcnIDogc3R5bGUudHJhbnNmb3JtO1xuICAgICAgICBub2RlLnN0eWxlLnRyYW5zZm9ybSA9IGAke3RyYW5zZm9ybX0gdHJhbnNsYXRlKCR7YS5sZWZ0IC0gYi5sZWZ0fXB4LCAke2EudG9wIC0gYi50b3B9cHgpYDtcbiAgICB9XG59XG5cbmxldCBjdXJyZW50X2NvbXBvbmVudDtcbmZ1bmN0aW9uIHNldF9jdXJyZW50X2NvbXBvbmVudChjb21wb25lbnQpIHtcbiAgICBjdXJyZW50X2NvbXBvbmVudCA9IGNvbXBvbmVudDtcbn1cbmZ1bmN0aW9uIGdldF9jdXJyZW50X2NvbXBvbmVudCgpIHtcbiAgICBpZiAoIWN1cnJlbnRfY29tcG9uZW50KVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Z1bmN0aW9uIGNhbGxlZCBvdXRzaWRlIGNvbXBvbmVudCBpbml0aWFsaXphdGlvbicpO1xuICAgIHJldHVybiBjdXJyZW50X2NvbXBvbmVudDtcbn1cbi8qKlxuICogU2NoZWR1bGVzIGEgY2FsbGJhY2sgdG8gcnVuIGltbWVkaWF0ZWx5IGJlZm9yZSB0aGUgY29tcG9uZW50IGlzIHVwZGF0ZWQgYWZ0ZXIgYW55IHN0YXRlIGNoYW5nZS5cbiAqXG4gKiBUaGUgZmlyc3QgdGltZSB0aGUgY2FsbGJhY2sgcnVucyB3aWxsIGJlIGJlZm9yZSB0aGUgaW5pdGlhbCBgb25Nb3VudGBcbiAqXG4gKiBodHRwczovL3N2ZWx0ZS5kZXYvZG9jcyNydW4tdGltZS1zdmVsdGUtYmVmb3JldXBkYXRlXG4gKi9cbmZ1bmN0aW9uIGJlZm9yZVVwZGF0ZShmbikge1xuICAgIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLmJlZm9yZV91cGRhdGUucHVzaChmbik7XG59XG4vKipcbiAqIFRoZSBgb25Nb3VudGAgZnVuY3Rpb24gc2NoZWR1bGVzIGEgY2FsbGJhY2sgdG8gcnVuIGFzIHNvb24gYXMgdGhlIGNvbXBvbmVudCBoYXMgYmVlbiBtb3VudGVkIHRvIHRoZSBET00uXG4gKiBJdCBtdXN0IGJlIGNhbGxlZCBkdXJpbmcgdGhlIGNvbXBvbmVudCdzIGluaXRpYWxpc2F0aW9uIChidXQgZG9lc24ndCBuZWVkIHRvIGxpdmUgKmluc2lkZSogdGhlIGNvbXBvbmVudDtcbiAqIGl0IGNhbiBiZSBjYWxsZWQgZnJvbSBhbiBleHRlcm5hbCBtb2R1bGUpLlxuICpcbiAqIGBvbk1vdW50YCBkb2VzIG5vdCBydW4gaW5zaWRlIGEgW3NlcnZlci1zaWRlIGNvbXBvbmVudF0oL2RvY3MjcnVuLXRpbWUtc2VydmVyLXNpZGUtY29tcG9uZW50LWFwaSkuXG4gKlxuICogaHR0cHM6Ly9zdmVsdGUuZGV2L2RvY3MjcnVuLXRpbWUtc3ZlbHRlLW9ubW91bnRcbiAqL1xuZnVuY3Rpb24gb25Nb3VudChmbikge1xuICAgIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLm9uX21vdW50LnB1c2goZm4pO1xufVxuLyoqXG4gKiBTY2hlZHVsZXMgYSBjYWxsYmFjayB0byBydW4gaW1tZWRpYXRlbHkgYWZ0ZXIgdGhlIGNvbXBvbmVudCBoYXMgYmVlbiB1cGRhdGVkLlxuICpcbiAqIFRoZSBmaXJzdCB0aW1lIHRoZSBjYWxsYmFjayBydW5zIHdpbGwgYmUgYWZ0ZXIgdGhlIGluaXRpYWwgYG9uTW91bnRgXG4gKi9cbmZ1bmN0aW9uIGFmdGVyVXBkYXRlKGZuKSB7XG4gICAgZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQuYWZ0ZXJfdXBkYXRlLnB1c2goZm4pO1xufVxuLyoqXG4gKiBTY2hlZHVsZXMgYSBjYWxsYmFjayB0byBydW4gaW1tZWRpYXRlbHkgYmVmb3JlIHRoZSBjb21wb25lbnQgaXMgdW5tb3VudGVkLlxuICpcbiAqIE91dCBvZiBgb25Nb3VudGAsIGBiZWZvcmVVcGRhdGVgLCBgYWZ0ZXJVcGRhdGVgIGFuZCBgb25EZXN0cm95YCwgdGhpcyBpcyB0aGVcbiAqIG9ubHkgb25lIHRoYXQgcnVucyBpbnNpZGUgYSBzZXJ2ZXItc2lkZSBjb21wb25lbnQuXG4gKlxuICogaHR0cHM6Ly9zdmVsdGUuZGV2L2RvY3MjcnVuLXRpbWUtc3ZlbHRlLW9uZGVzdHJveVxuICovXG5mdW5jdGlvbiBvbkRlc3Ryb3koZm4pIHtcbiAgICBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5vbl9kZXN0cm95LnB1c2goZm4pO1xufVxuLyoqXG4gKiBDcmVhdGVzIGFuIGV2ZW50IGRpc3BhdGNoZXIgdGhhdCBjYW4gYmUgdXNlZCB0byBkaXNwYXRjaCBbY29tcG9uZW50IGV2ZW50c10oL2RvY3MjdGVtcGxhdGUtc3ludGF4LWNvbXBvbmVudC1kaXJlY3RpdmVzLW9uLWV2ZW50bmFtZSkuXG4gKiBFdmVudCBkaXNwYXRjaGVycyBhcmUgZnVuY3Rpb25zIHRoYXQgY2FuIHRha2UgdHdvIGFyZ3VtZW50czogYG5hbWVgIGFuZCBgZGV0YWlsYC5cbiAqXG4gKiBDb21wb25lbnQgZXZlbnRzIGNyZWF0ZWQgd2l0aCBgY3JlYXRlRXZlbnREaXNwYXRjaGVyYCBjcmVhdGUgYVxuICogW0N1c3RvbUV2ZW50XShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ3VzdG9tRXZlbnQpLlxuICogVGhlc2UgZXZlbnRzIGRvIG5vdCBbYnViYmxlXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL0xlYXJuL0phdmFTY3JpcHQvQnVpbGRpbmdfYmxvY2tzL0V2ZW50cyNFdmVudF9idWJibGluZ19hbmRfY2FwdHVyZSkuXG4gKiBUaGUgYGRldGFpbGAgYXJndW1lbnQgY29ycmVzcG9uZHMgdG8gdGhlIFtDdXN0b21FdmVudC5kZXRhaWxdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DdXN0b21FdmVudC9kZXRhaWwpXG4gKiBwcm9wZXJ0eSBhbmQgY2FuIGNvbnRhaW4gYW55IHR5cGUgb2YgZGF0YS5cbiAqXG4gKiBodHRwczovL3N2ZWx0ZS5kZXYvZG9jcyNydW4tdGltZS1zdmVsdGUtY3JlYXRlZXZlbnRkaXNwYXRjaGVyXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUV2ZW50RGlzcGF0Y2hlcigpIHtcbiAgICBjb25zdCBjb21wb25lbnQgPSBnZXRfY3VycmVudF9jb21wb25lbnQoKTtcbiAgICByZXR1cm4gKHR5cGUsIGRldGFpbCwgeyBjYW5jZWxhYmxlID0gZmFsc2UgfSA9IHt9KSA9PiB7XG4gICAgICAgIGNvbnN0IGNhbGxiYWNrcyA9IGNvbXBvbmVudC4kJC5jYWxsYmFja3NbdHlwZV07XG4gICAgICAgIGlmIChjYWxsYmFja3MpIHtcbiAgICAgICAgICAgIC8vIFRPRE8gYXJlIHRoZXJlIHNpdHVhdGlvbnMgd2hlcmUgZXZlbnRzIGNvdWxkIGJlIGRpc3BhdGNoZWRcbiAgICAgICAgICAgIC8vIGluIGEgc2VydmVyIChub24tRE9NKSBlbnZpcm9ubWVudD9cbiAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gY3VzdG9tX2V2ZW50KHR5cGUsIGRldGFpbCwgeyBjYW5jZWxhYmxlIH0pO1xuICAgICAgICAgICAgY2FsbGJhY2tzLnNsaWNlKCkuZm9yRWFjaChmbiA9PiB7XG4gICAgICAgICAgICAgICAgZm4uY2FsbChjb21wb25lbnQsIGV2ZW50KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuICFldmVudC5kZWZhdWx0UHJldmVudGVkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG59XG4vKipcbiAqIEFzc29jaWF0ZXMgYW4gYXJiaXRyYXJ5IGBjb250ZXh0YCBvYmplY3Qgd2l0aCB0aGUgY3VycmVudCBjb21wb25lbnQgYW5kIHRoZSBzcGVjaWZpZWQgYGtleWBcbiAqIGFuZCByZXR1cm5zIHRoYXQgb2JqZWN0LiBUaGUgY29udGV4dCBpcyB0aGVuIGF2YWlsYWJsZSB0byBjaGlsZHJlbiBvZiB0aGUgY29tcG9uZW50XG4gKiAoaW5jbHVkaW5nIHNsb3R0ZWQgY29udGVudCkgd2l0aCBgZ2V0Q29udGV4dGAuXG4gKlxuICogTGlrZSBsaWZlY3ljbGUgZnVuY3Rpb25zLCB0aGlzIG11c3QgYmUgY2FsbGVkIGR1cmluZyBjb21wb25lbnQgaW5pdGlhbGlzYXRpb24uXG4gKlxuICogaHR0cHM6Ly9zdmVsdGUuZGV2L2RvY3MjcnVuLXRpbWUtc3ZlbHRlLXNldGNvbnRleHRcbiAqL1xuZnVuY3Rpb24gc2V0Q29udGV4dChrZXksIGNvbnRleHQpIHtcbiAgICBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5jb250ZXh0LnNldChrZXksIGNvbnRleHQpO1xuICAgIHJldHVybiBjb250ZXh0O1xufVxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGNvbnRleHQgdGhhdCBiZWxvbmdzIHRvIHRoZSBjbG9zZXN0IHBhcmVudCBjb21wb25lbnQgd2l0aCB0aGUgc3BlY2lmaWVkIGBrZXlgLlxuICogTXVzdCBiZSBjYWxsZWQgZHVyaW5nIGNvbXBvbmVudCBpbml0aWFsaXNhdGlvbi5cbiAqXG4gKiBodHRwczovL3N2ZWx0ZS5kZXYvZG9jcyNydW4tdGltZS1zdmVsdGUtZ2V0Y29udGV4dFxuICovXG5mdW5jdGlvbiBnZXRDb250ZXh0KGtleSkge1xuICAgIHJldHVybiBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5jb250ZXh0LmdldChrZXkpO1xufVxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIHdob2xlIGNvbnRleHQgbWFwIHRoYXQgYmVsb25ncyB0byB0aGUgY2xvc2VzdCBwYXJlbnQgY29tcG9uZW50LlxuICogTXVzdCBiZSBjYWxsZWQgZHVyaW5nIGNvbXBvbmVudCBpbml0aWFsaXNhdGlvbi4gVXNlZnVsLCBmb3IgZXhhbXBsZSwgaWYgeW91XG4gKiBwcm9ncmFtbWF0aWNhbGx5IGNyZWF0ZSBhIGNvbXBvbmVudCBhbmQgd2FudCB0byBwYXNzIHRoZSBleGlzdGluZyBjb250ZXh0IHRvIGl0LlxuICpcbiAqIGh0dHBzOi8vc3ZlbHRlLmRldi9kb2NzI3J1bi10aW1lLXN2ZWx0ZS1nZXRhbGxjb250ZXh0c1xuICovXG5mdW5jdGlvbiBnZXRBbGxDb250ZXh0cygpIHtcbiAgICByZXR1cm4gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQuY29udGV4dDtcbn1cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYSBnaXZlbiBga2V5YCBoYXMgYmVlbiBzZXQgaW4gdGhlIGNvbnRleHQgb2YgYSBwYXJlbnQgY29tcG9uZW50LlxuICogTXVzdCBiZSBjYWxsZWQgZHVyaW5nIGNvbXBvbmVudCBpbml0aWFsaXNhdGlvbi5cbiAqXG4gKiBodHRwczovL3N2ZWx0ZS5kZXYvZG9jcyNydW4tdGltZS1zdmVsdGUtaGFzY29udGV4dFxuICovXG5mdW5jdGlvbiBoYXNDb250ZXh0KGtleSkge1xuICAgIHJldHVybiBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5jb250ZXh0LmhhcyhrZXkpO1xufVxuLy8gVE9ETyBmaWd1cmUgb3V0IGlmIHdlIHN0aWxsIHdhbnQgdG8gc3VwcG9ydFxuLy8gc2hvcnRoYW5kIGV2ZW50cywgb3IgaWYgd2Ugd2FudCB0byBpbXBsZW1lbnRcbi8vIGEgcmVhbCBidWJibGluZyBtZWNoYW5pc21cbmZ1bmN0aW9uIGJ1YmJsZShjb21wb25lbnQsIGV2ZW50KSB7XG4gICAgY29uc3QgY2FsbGJhY2tzID0gY29tcG9uZW50LiQkLmNhbGxiYWNrc1tldmVudC50eXBlXTtcbiAgICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgY2FsbGJhY2tzLnNsaWNlKCkuZm9yRWFjaChmbiA9PiBmbi5jYWxsKHRoaXMsIGV2ZW50KSk7XG4gICAgfVxufVxuXG5jb25zdCBkaXJ0eV9jb21wb25lbnRzID0gW107XG5jb25zdCBpbnRyb3MgPSB7IGVuYWJsZWQ6IGZhbHNlIH07XG5jb25zdCBiaW5kaW5nX2NhbGxiYWNrcyA9IFtdO1xubGV0IHJlbmRlcl9jYWxsYmFja3MgPSBbXTtcbmNvbnN0IGZsdXNoX2NhbGxiYWNrcyA9IFtdO1xuY29uc3QgcmVzb2x2ZWRfcHJvbWlzZSA9IC8qIEBfX1BVUkVfXyAqLyBQcm9taXNlLnJlc29sdmUoKTtcbmxldCB1cGRhdGVfc2NoZWR1bGVkID0gZmFsc2U7XG5mdW5jdGlvbiBzY2hlZHVsZV91cGRhdGUoKSB7XG4gICAgaWYgKCF1cGRhdGVfc2NoZWR1bGVkKSB7XG4gICAgICAgIHVwZGF0ZV9zY2hlZHVsZWQgPSB0cnVlO1xuICAgICAgICByZXNvbHZlZF9wcm9taXNlLnRoZW4oZmx1c2gpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHRpY2soKSB7XG4gICAgc2NoZWR1bGVfdXBkYXRlKCk7XG4gICAgcmV0dXJuIHJlc29sdmVkX3Byb21pc2U7XG59XG5mdW5jdGlvbiBhZGRfcmVuZGVyX2NhbGxiYWNrKGZuKSB7XG4gICAgcmVuZGVyX2NhbGxiYWNrcy5wdXNoKGZuKTtcbn1cbmZ1bmN0aW9uIGFkZF9mbHVzaF9jYWxsYmFjayhmbikge1xuICAgIGZsdXNoX2NhbGxiYWNrcy5wdXNoKGZuKTtcbn1cbi8vIGZsdXNoKCkgY2FsbHMgY2FsbGJhY2tzIGluIHRoaXMgb3JkZXI6XG4vLyAxLiBBbGwgYmVmb3JlVXBkYXRlIGNhbGxiYWNrcywgaW4gb3JkZXI6IHBhcmVudHMgYmVmb3JlIGNoaWxkcmVuXG4vLyAyLiBBbGwgYmluZDp0aGlzIGNhbGxiYWNrcywgaW4gcmV2ZXJzZSBvcmRlcjogY2hpbGRyZW4gYmVmb3JlIHBhcmVudHMuXG4vLyAzLiBBbGwgYWZ0ZXJVcGRhdGUgY2FsbGJhY2tzLCBpbiBvcmRlcjogcGFyZW50cyBiZWZvcmUgY2hpbGRyZW4uIEVYQ0VQVFxuLy8gICAgZm9yIGFmdGVyVXBkYXRlcyBjYWxsZWQgZHVyaW5nIHRoZSBpbml0aWFsIG9uTW91bnQsIHdoaWNoIGFyZSBjYWxsZWQgaW5cbi8vICAgIHJldmVyc2Ugb3JkZXI6IGNoaWxkcmVuIGJlZm9yZSBwYXJlbnRzLlxuLy8gU2luY2UgY2FsbGJhY2tzIG1pZ2h0IHVwZGF0ZSBjb21wb25lbnQgdmFsdWVzLCB3aGljaCBjb3VsZCB0cmlnZ2VyIGFub3RoZXJcbi8vIGNhbGwgdG8gZmx1c2goKSwgdGhlIGZvbGxvd2luZyBzdGVwcyBndWFyZCBhZ2FpbnN0IHRoaXM6XG4vLyAxLiBEdXJpbmcgYmVmb3JlVXBkYXRlLCBhbnkgdXBkYXRlZCBjb21wb25lbnRzIHdpbGwgYmUgYWRkZWQgdG8gdGhlXG4vLyAgICBkaXJ0eV9jb21wb25lbnRzIGFycmF5IGFuZCB3aWxsIGNhdXNlIGEgcmVlbnRyYW50IGNhbGwgdG8gZmx1c2goKS4gQmVjYXVzZVxuLy8gICAgdGhlIGZsdXNoIGluZGV4IGlzIGtlcHQgb3V0c2lkZSB0aGUgZnVuY3Rpb24sIHRoZSByZWVudHJhbnQgY2FsbCB3aWxsIHBpY2tcbi8vICAgIHVwIHdoZXJlIHRoZSBlYXJsaWVyIGNhbGwgbGVmdCBvZmYgYW5kIGdvIHRocm91Z2ggYWxsIGRpcnR5IGNvbXBvbmVudHMuIFRoZVxuLy8gICAgY3VycmVudF9jb21wb25lbnQgdmFsdWUgaXMgc2F2ZWQgYW5kIHJlc3RvcmVkIHNvIHRoYXQgdGhlIHJlZW50cmFudCBjYWxsIHdpbGxcbi8vICAgIG5vdCBpbnRlcmZlcmUgd2l0aCB0aGUgXCJwYXJlbnRcIiBmbHVzaCgpIGNhbGwuXG4vLyAyLiBiaW5kOnRoaXMgY2FsbGJhY2tzIGNhbm5vdCB0cmlnZ2VyIG5ldyBmbHVzaCgpIGNhbGxzLlxuLy8gMy4gRHVyaW5nIGFmdGVyVXBkYXRlLCBhbnkgdXBkYXRlZCBjb21wb25lbnRzIHdpbGwgTk9UIGhhdmUgdGhlaXIgYWZ0ZXJVcGRhdGVcbi8vICAgIGNhbGxiYWNrIGNhbGxlZCBhIHNlY29uZCB0aW1lOyB0aGUgc2Vlbl9jYWxsYmFja3Mgc2V0LCBvdXRzaWRlIHRoZSBmbHVzaCgpXG4vLyAgICBmdW5jdGlvbiwgZ3VhcmFudGVlcyB0aGlzIGJlaGF2aW9yLlxuY29uc3Qgc2Vlbl9jYWxsYmFja3MgPSBuZXcgU2V0KCk7XG5sZXQgZmx1c2hpZHggPSAwOyAvLyBEbyAqbm90KiBtb3ZlIHRoaXMgaW5zaWRlIHRoZSBmbHVzaCgpIGZ1bmN0aW9uXG5mdW5jdGlvbiBmbHVzaCgpIHtcbiAgICAvLyBEbyBub3QgcmVlbnRlciBmbHVzaCB3aGlsZSBkaXJ0eSBjb21wb25lbnRzIGFyZSB1cGRhdGVkLCBhcyB0aGlzIGNhblxuICAgIC8vIHJlc3VsdCBpbiBhbiBpbmZpbml0ZSBsb29wLiBJbnN0ZWFkLCBsZXQgdGhlIGlubmVyIGZsdXNoIGhhbmRsZSBpdC5cbiAgICAvLyBSZWVudHJhbmN5IGlzIG9rIGFmdGVyd2FyZHMgZm9yIGJpbmRpbmdzIGV0Yy5cbiAgICBpZiAoZmx1c2hpZHggIT09IDApIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBzYXZlZF9jb21wb25lbnQgPSBjdXJyZW50X2NvbXBvbmVudDtcbiAgICBkbyB7XG4gICAgICAgIC8vIGZpcnN0LCBjYWxsIGJlZm9yZVVwZGF0ZSBmdW5jdGlvbnNcbiAgICAgICAgLy8gYW5kIHVwZGF0ZSBjb21wb25lbnRzXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB3aGlsZSAoZmx1c2hpZHggPCBkaXJ0eV9jb21wb25lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IGRpcnR5X2NvbXBvbmVudHNbZmx1c2hpZHhdO1xuICAgICAgICAgICAgICAgIGZsdXNoaWR4Kys7XG4gICAgICAgICAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KGNvbXBvbmVudCk7XG4gICAgICAgICAgICAgICAgdXBkYXRlKGNvbXBvbmVudC4kJCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIHJlc2V0IGRpcnR5IHN0YXRlIHRvIG5vdCBlbmQgdXAgaW4gYSBkZWFkbG9ja2VkIHN0YXRlIGFuZCB0aGVuIHJldGhyb3dcbiAgICAgICAgICAgIGRpcnR5X2NvbXBvbmVudHMubGVuZ3RoID0gMDtcbiAgICAgICAgICAgIGZsdXNoaWR4ID0gMDtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KG51bGwpO1xuICAgICAgICBkaXJ0eV9jb21wb25lbnRzLmxlbmd0aCA9IDA7XG4gICAgICAgIGZsdXNoaWR4ID0gMDtcbiAgICAgICAgd2hpbGUgKGJpbmRpbmdfY2FsbGJhY2tzLmxlbmd0aClcbiAgICAgICAgICAgIGJpbmRpbmdfY2FsbGJhY2tzLnBvcCgpKCk7XG4gICAgICAgIC8vIHRoZW4sIG9uY2UgY29tcG9uZW50cyBhcmUgdXBkYXRlZCwgY2FsbFxuICAgICAgICAvLyBhZnRlclVwZGF0ZSBmdW5jdGlvbnMuIFRoaXMgbWF5IGNhdXNlXG4gICAgICAgIC8vIHN1YnNlcXVlbnQgdXBkYXRlcy4uLlxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbmRlcl9jYWxsYmFja3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gcmVuZGVyX2NhbGxiYWNrc1tpXTtcbiAgICAgICAgICAgIGlmICghc2Vlbl9jYWxsYmFja3MuaGFzKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIC8vIC4uLnNvIGd1YXJkIGFnYWluc3QgaW5maW5pdGUgbG9vcHNcbiAgICAgICAgICAgICAgICBzZWVuX2NhbGxiYWNrcy5hZGQoY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVuZGVyX2NhbGxiYWNrcy5sZW5ndGggPSAwO1xuICAgIH0gd2hpbGUgKGRpcnR5X2NvbXBvbmVudHMubGVuZ3RoKTtcbiAgICB3aGlsZSAoZmx1c2hfY2FsbGJhY2tzLmxlbmd0aCkge1xuICAgICAgICBmbHVzaF9jYWxsYmFja3MucG9wKCkoKTtcbiAgICB9XG4gICAgdXBkYXRlX3NjaGVkdWxlZCA9IGZhbHNlO1xuICAgIHNlZW5fY2FsbGJhY2tzLmNsZWFyKCk7XG4gICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KHNhdmVkX2NvbXBvbmVudCk7XG59XG5mdW5jdGlvbiB1cGRhdGUoJCQpIHtcbiAgICBpZiAoJCQuZnJhZ21lbnQgIT09IG51bGwpIHtcbiAgICAgICAgJCQudXBkYXRlKCk7XG4gICAgICAgIHJ1bl9hbGwoJCQuYmVmb3JlX3VwZGF0ZSk7XG4gICAgICAgIGNvbnN0IGRpcnR5ID0gJCQuZGlydHk7XG4gICAgICAgICQkLmRpcnR5ID0gWy0xXTtcbiAgICAgICAgJCQuZnJhZ21lbnQgJiYgJCQuZnJhZ21lbnQucCgkJC5jdHgsIGRpcnR5KTtcbiAgICAgICAgJCQuYWZ0ZXJfdXBkYXRlLmZvckVhY2goYWRkX3JlbmRlcl9jYWxsYmFjayk7XG4gICAgfVxufVxuLyoqXG4gKiBVc2VmdWwgZm9yIGV4YW1wbGUgdG8gZXhlY3V0ZSByZW1haW5pbmcgYGFmdGVyVXBkYXRlYCBjYWxsYmFja3MgYmVmb3JlIGV4ZWN1dGluZyBgZGVzdHJveWAuXG4gKi9cbmZ1bmN0aW9uIGZsdXNoX3JlbmRlcl9jYWxsYmFja3MoZm5zKSB7XG4gICAgY29uc3QgZmlsdGVyZWQgPSBbXTtcbiAgICBjb25zdCB0YXJnZXRzID0gW107XG4gICAgcmVuZGVyX2NhbGxiYWNrcy5mb3JFYWNoKChjKSA9PiBmbnMuaW5kZXhPZihjKSA9PT0gLTEgPyBmaWx0ZXJlZC5wdXNoKGMpIDogdGFyZ2V0cy5wdXNoKGMpKTtcbiAgICB0YXJnZXRzLmZvckVhY2goKGMpID0+IGMoKSk7XG4gICAgcmVuZGVyX2NhbGxiYWNrcyA9IGZpbHRlcmVkO1xufVxuXG5sZXQgcHJvbWlzZTtcbmZ1bmN0aW9uIHdhaXQoKSB7XG4gICAgaWYgKCFwcm9taXNlKSB7XG4gICAgICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgcHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHByb21pc2UgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5mdW5jdGlvbiBkaXNwYXRjaChub2RlLCBkaXJlY3Rpb24sIGtpbmQpIHtcbiAgICBub2RlLmRpc3BhdGNoRXZlbnQoY3VzdG9tX2V2ZW50KGAke2RpcmVjdGlvbiA/ICdpbnRybycgOiAnb3V0cm8nfSR7a2luZH1gKSk7XG59XG5jb25zdCBvdXRyb2luZyA9IG5ldyBTZXQoKTtcbmxldCBvdXRyb3M7XG5mdW5jdGlvbiBncm91cF9vdXRyb3MoKSB7XG4gICAgb3V0cm9zID0ge1xuICAgICAgICByOiAwLFxuICAgICAgICBjOiBbXSxcbiAgICAgICAgcDogb3V0cm9zIC8vIHBhcmVudCBncm91cFxuICAgIH07XG59XG5mdW5jdGlvbiBjaGVja19vdXRyb3MoKSB7XG4gICAgaWYgKCFvdXRyb3Mucikge1xuICAgICAgICBydW5fYWxsKG91dHJvcy5jKTtcbiAgICB9XG4gICAgb3V0cm9zID0gb3V0cm9zLnA7XG59XG5mdW5jdGlvbiB0cmFuc2l0aW9uX2luKGJsb2NrLCBsb2NhbCkge1xuICAgIGlmIChibG9jayAmJiBibG9jay5pKSB7XG4gICAgICAgIG91dHJvaW5nLmRlbGV0ZShibG9jayk7XG4gICAgICAgIGJsb2NrLmkobG9jYWwpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHRyYW5zaXRpb25fb3V0KGJsb2NrLCBsb2NhbCwgZGV0YWNoLCBjYWxsYmFjaykge1xuICAgIGlmIChibG9jayAmJiBibG9jay5vKSB7XG4gICAgICAgIGlmIChvdXRyb2luZy5oYXMoYmxvY2spKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBvdXRyb2luZy5hZGQoYmxvY2spO1xuICAgICAgICBvdXRyb3MuYy5wdXNoKCgpID0+IHtcbiAgICAgICAgICAgIG91dHJvaW5nLmRlbGV0ZShibG9jayk7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoZGV0YWNoKVxuICAgICAgICAgICAgICAgICAgICBibG9jay5kKDEpO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBibG9jay5vKGxvY2FsKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG59XG5jb25zdCBudWxsX3RyYW5zaXRpb24gPSB7IGR1cmF0aW9uOiAwIH07XG5mdW5jdGlvbiBjcmVhdGVfaW5fdHJhbnNpdGlvbihub2RlLCBmbiwgcGFyYW1zKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHsgZGlyZWN0aW9uOiAnaW4nIH07XG4gICAgbGV0IGNvbmZpZyA9IGZuKG5vZGUsIHBhcmFtcywgb3B0aW9ucyk7XG4gICAgbGV0IHJ1bm5pbmcgPSBmYWxzZTtcbiAgICBsZXQgYW5pbWF0aW9uX25hbWU7XG4gICAgbGV0IHRhc2s7XG4gICAgbGV0IHVpZCA9IDA7XG4gICAgZnVuY3Rpb24gY2xlYW51cCgpIHtcbiAgICAgICAgaWYgKGFuaW1hdGlvbl9uYW1lKVxuICAgICAgICAgICAgZGVsZXRlX3J1bGUobm9kZSwgYW5pbWF0aW9uX25hbWUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnbygpIHtcbiAgICAgICAgY29uc3QgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gMzAwLCBlYXNpbmcgPSBpZGVudGl0eSwgdGljayA9IG5vb3AsIGNzcyB9ID0gY29uZmlnIHx8IG51bGxfdHJhbnNpdGlvbjtcbiAgICAgICAgaWYgKGNzcylcbiAgICAgICAgICAgIGFuaW1hdGlvbl9uYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgMCwgMSwgZHVyYXRpb24sIGRlbGF5LCBlYXNpbmcsIGNzcywgdWlkKyspO1xuICAgICAgICB0aWNrKDAsIDEpO1xuICAgICAgICBjb25zdCBzdGFydF90aW1lID0gbm93KCkgKyBkZWxheTtcbiAgICAgICAgY29uc3QgZW5kX3RpbWUgPSBzdGFydF90aW1lICsgZHVyYXRpb247XG4gICAgICAgIGlmICh0YXNrKVxuICAgICAgICAgICAgdGFzay5hYm9ydCgpO1xuICAgICAgICBydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgYWRkX3JlbmRlcl9jYWxsYmFjaygoKSA9PiBkaXNwYXRjaChub2RlLCB0cnVlLCAnc3RhcnQnKSk7XG4gICAgICAgIHRhc2sgPSBsb29wKG5vdyA9PiB7XG4gICAgICAgICAgICBpZiAocnVubmluZykge1xuICAgICAgICAgICAgICAgIGlmIChub3cgPj0gZW5kX3RpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGljaygxLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2gobm9kZSwgdHJ1ZSwgJ2VuZCcpO1xuICAgICAgICAgICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub3cgPj0gc3RhcnRfdGltZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0ID0gZWFzaW5nKChub3cgLSBzdGFydF90aW1lKSAvIGR1cmF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgdGljayh0LCAxIC0gdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJ1bm5pbmc7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBsZXQgc3RhcnRlZCA9IGZhbHNlO1xuICAgIHJldHVybiB7XG4gICAgICAgIHN0YXJ0KCkge1xuICAgICAgICAgICAgaWYgKHN0YXJ0ZWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICBkZWxldGVfcnVsZShub2RlKTtcbiAgICAgICAgICAgIGlmIChpc19mdW5jdGlvbihjb25maWcpKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnID0gY29uZmlnKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIHdhaXQoKS50aGVuKGdvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGdvKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGludmFsaWRhdGUoKSB7XG4gICAgICAgICAgICBzdGFydGVkID0gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIGVuZCgpIHtcbiAgICAgICAgICAgIGlmIChydW5uaW5nKSB7XG4gICAgICAgICAgICAgICAgY2xlYW51cCgpO1xuICAgICAgICAgICAgICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59XG5mdW5jdGlvbiBjcmVhdGVfb3V0X3RyYW5zaXRpb24obm9kZSwgZm4sIHBhcmFtcykge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IGRpcmVjdGlvbjogJ291dCcgfTtcbiAgICBsZXQgY29uZmlnID0gZm4obm9kZSwgcGFyYW1zLCBvcHRpb25zKTtcbiAgICBsZXQgcnVubmluZyA9IHRydWU7XG4gICAgbGV0IGFuaW1hdGlvbl9uYW1lO1xuICAgIGNvbnN0IGdyb3VwID0gb3V0cm9zO1xuICAgIGdyb3VwLnIgKz0gMTtcbiAgICBmdW5jdGlvbiBnbygpIHtcbiAgICAgICAgY29uc3QgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gMzAwLCBlYXNpbmcgPSBpZGVudGl0eSwgdGljayA9IG5vb3AsIGNzcyB9ID0gY29uZmlnIHx8IG51bGxfdHJhbnNpdGlvbjtcbiAgICAgICAgaWYgKGNzcylcbiAgICAgICAgICAgIGFuaW1hdGlvbl9uYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgMSwgMCwgZHVyYXRpb24sIGRlbGF5LCBlYXNpbmcsIGNzcyk7XG4gICAgICAgIGNvbnN0IHN0YXJ0X3RpbWUgPSBub3coKSArIGRlbGF5O1xuICAgICAgICBjb25zdCBlbmRfdGltZSA9IHN0YXJ0X3RpbWUgKyBkdXJhdGlvbjtcbiAgICAgICAgYWRkX3JlbmRlcl9jYWxsYmFjaygoKSA9PiBkaXNwYXRjaChub2RlLCBmYWxzZSwgJ3N0YXJ0JykpO1xuICAgICAgICBsb29wKG5vdyA9PiB7XG4gICAgICAgICAgICBpZiAocnVubmluZykge1xuICAgICAgICAgICAgICAgIGlmIChub3cgPj0gZW5kX3RpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGljaygwLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2gobm9kZSwgZmFsc2UsICdlbmQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEtLWdyb3VwLnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgd2lsbCByZXN1bHQgaW4gYGVuZCgpYCBiZWluZyBjYWxsZWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzbyB3ZSBkb24ndCBuZWVkIHRvIGNsZWFuIHVwIGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bl9hbGwoZ3JvdXAuYyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm93ID49IHN0YXJ0X3RpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdCA9IGVhc2luZygobm93IC0gc3RhcnRfdGltZSkgLyBkdXJhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHRpY2soMSAtIHQsIHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBydW5uaW5nO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGlzX2Z1bmN0aW9uKGNvbmZpZykpIHtcbiAgICAgICAgd2FpdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgY29uZmlnID0gY29uZmlnKG9wdGlvbnMpO1xuICAgICAgICAgICAgZ28oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBnbygpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBlbmQocmVzZXQpIHtcbiAgICAgICAgICAgIGlmIChyZXNldCAmJiBjb25maWcudGljaykge1xuICAgICAgICAgICAgICAgIGNvbmZpZy50aWNrKDEsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAoYW5pbWF0aW9uX25hbWUpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZV9ydWxlKG5vZGUsIGFuaW1hdGlvbl9uYW1lKTtcbiAgICAgICAgICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gY3JlYXRlX2JpZGlyZWN0aW9uYWxfdHJhbnNpdGlvbihub2RlLCBmbiwgcGFyYW1zLCBpbnRybykge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IGRpcmVjdGlvbjogJ2JvdGgnIH07XG4gICAgbGV0IGNvbmZpZyA9IGZuKG5vZGUsIHBhcmFtcywgb3B0aW9ucyk7XG4gICAgbGV0IHQgPSBpbnRybyA/IDAgOiAxO1xuICAgIGxldCBydW5uaW5nX3Byb2dyYW0gPSBudWxsO1xuICAgIGxldCBwZW5kaW5nX3Byb2dyYW0gPSBudWxsO1xuICAgIGxldCBhbmltYXRpb25fbmFtZSA9IG51bGw7XG4gICAgZnVuY3Rpb24gY2xlYXJfYW5pbWF0aW9uKCkge1xuICAgICAgICBpZiAoYW5pbWF0aW9uX25hbWUpXG4gICAgICAgICAgICBkZWxldGVfcnVsZShub2RlLCBhbmltYXRpb25fbmFtZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGluaXQocHJvZ3JhbSwgZHVyYXRpb24pIHtcbiAgICAgICAgY29uc3QgZCA9IChwcm9ncmFtLmIgLSB0KTtcbiAgICAgICAgZHVyYXRpb24gKj0gTWF0aC5hYnMoZCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBhOiB0LFxuICAgICAgICAgICAgYjogcHJvZ3JhbS5iLFxuICAgICAgICAgICAgZCxcbiAgICAgICAgICAgIGR1cmF0aW9uLFxuICAgICAgICAgICAgc3RhcnQ6IHByb2dyYW0uc3RhcnQsXG4gICAgICAgICAgICBlbmQ6IHByb2dyYW0uc3RhcnQgKyBkdXJhdGlvbixcbiAgICAgICAgICAgIGdyb3VwOiBwcm9ncmFtLmdyb3VwXG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdvKGIpIHtcbiAgICAgICAgY29uc3QgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gMzAwLCBlYXNpbmcgPSBpZGVudGl0eSwgdGljayA9IG5vb3AsIGNzcyB9ID0gY29uZmlnIHx8IG51bGxfdHJhbnNpdGlvbjtcbiAgICAgICAgY29uc3QgcHJvZ3JhbSA9IHtcbiAgICAgICAgICAgIHN0YXJ0OiBub3coKSArIGRlbGF5LFxuICAgICAgICAgICAgYlxuICAgICAgICB9O1xuICAgICAgICBpZiAoIWIpIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgdG9kbzogaW1wcm92ZSB0eXBpbmdzXG4gICAgICAgICAgICBwcm9ncmFtLmdyb3VwID0gb3V0cm9zO1xuICAgICAgICAgICAgb3V0cm9zLnIgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocnVubmluZ19wcm9ncmFtIHx8IHBlbmRpbmdfcHJvZ3JhbSkge1xuICAgICAgICAgICAgcGVuZGluZ19wcm9ncmFtID0gcHJvZ3JhbTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGlmIHRoaXMgaXMgYW4gaW50cm8sIGFuZCB0aGVyZSdzIGEgZGVsYXksIHdlIG5lZWQgdG8gZG9cbiAgICAgICAgICAgIC8vIGFuIGluaXRpYWwgdGljayBhbmQvb3IgYXBwbHkgQ1NTIGFuaW1hdGlvbiBpbW1lZGlhdGVseVxuICAgICAgICAgICAgaWYgKGNzcykge1xuICAgICAgICAgICAgICAgIGNsZWFyX2FuaW1hdGlvbigpO1xuICAgICAgICAgICAgICAgIGFuaW1hdGlvbl9uYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgdCwgYiwgZHVyYXRpb24sIGRlbGF5LCBlYXNpbmcsIGNzcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYilcbiAgICAgICAgICAgICAgICB0aWNrKDAsIDEpO1xuICAgICAgICAgICAgcnVubmluZ19wcm9ncmFtID0gaW5pdChwcm9ncmFtLCBkdXJhdGlvbik7XG4gICAgICAgICAgICBhZGRfcmVuZGVyX2NhbGxiYWNrKCgpID0+IGRpc3BhdGNoKG5vZGUsIGIsICdzdGFydCcpKTtcbiAgICAgICAgICAgIGxvb3Aobm93ID0+IHtcbiAgICAgICAgICAgICAgICBpZiAocGVuZGluZ19wcm9ncmFtICYmIG5vdyA+IHBlbmRpbmdfcHJvZ3JhbS5zdGFydCkge1xuICAgICAgICAgICAgICAgICAgICBydW5uaW5nX3Byb2dyYW0gPSBpbml0KHBlbmRpbmdfcHJvZ3JhbSwgZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICBwZW5kaW5nX3Byb2dyYW0gPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBkaXNwYXRjaChub2RlLCBydW5uaW5nX3Byb2dyYW0uYiwgJ3N0YXJ0Jyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyX2FuaW1hdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uX25hbWUgPSBjcmVhdGVfcnVsZShub2RlLCB0LCBydW5uaW5nX3Byb2dyYW0uYiwgcnVubmluZ19wcm9ncmFtLmR1cmF0aW9uLCAwLCBlYXNpbmcsIGNvbmZpZy5jc3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChydW5uaW5nX3Byb2dyYW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vdyA+PSBydW5uaW5nX3Byb2dyYW0uZW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrKHQgPSBydW5uaW5nX3Byb2dyYW0uYiwgMSAtIHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2gobm9kZSwgcnVubmluZ19wcm9ncmFtLmIsICdlbmQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcGVuZGluZ19wcm9ncmFtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2UncmUgZG9uZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChydW5uaW5nX3Byb2dyYW0uYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpbnRybyDigJQgd2UgY2FuIHRpZHkgdXAgaW1tZWRpYXRlbHlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJfYW5pbWF0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvdXRybyDigJQgbmVlZHMgdG8gYmUgY29vcmRpbmF0ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEtLXJ1bm5pbmdfcHJvZ3JhbS5ncm91cC5yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVuX2FsbChydW5uaW5nX3Byb2dyYW0uZ3JvdXAuYyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcnVubmluZ19wcm9ncmFtID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChub3cgPj0gcnVubmluZ19wcm9ncmFtLnN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwID0gbm93IC0gcnVubmluZ19wcm9ncmFtLnN0YXJ0O1xuICAgICAgICAgICAgICAgICAgICAgICAgdCA9IHJ1bm5pbmdfcHJvZ3JhbS5hICsgcnVubmluZ19wcm9ncmFtLmQgKiBlYXNpbmcocCAvIHJ1bm5pbmdfcHJvZ3JhbS5kdXJhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aWNrKHQsIDEgLSB0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gISEocnVubmluZ19wcm9ncmFtIHx8IHBlbmRpbmdfcHJvZ3JhbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBydW4oYikge1xuICAgICAgICAgICAgaWYgKGlzX2Z1bmN0aW9uKGNvbmZpZykpIHtcbiAgICAgICAgICAgICAgICB3YWl0KCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnID0gY29uZmlnKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICBnbyhiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGdvKGIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlbmQoKSB7XG4gICAgICAgICAgICBjbGVhcl9hbmltYXRpb24oKTtcbiAgICAgICAgICAgIHJ1bm5pbmdfcHJvZ3JhbSA9IHBlbmRpbmdfcHJvZ3JhbSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5mdW5jdGlvbiBoYW5kbGVfcHJvbWlzZShwcm9taXNlLCBpbmZvKSB7XG4gICAgY29uc3QgdG9rZW4gPSBpbmZvLnRva2VuID0ge307XG4gICAgZnVuY3Rpb24gdXBkYXRlKHR5cGUsIGluZGV4LCBrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmIChpbmZvLnRva2VuICE9PSB0b2tlbilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgaW5mby5yZXNvbHZlZCA9IHZhbHVlO1xuICAgICAgICBsZXQgY2hpbGRfY3R4ID0gaW5mby5jdHg7XG4gICAgICAgIGlmIChrZXkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY2hpbGRfY3R4ID0gY2hpbGRfY3R4LnNsaWNlKCk7XG4gICAgICAgICAgICBjaGlsZF9jdHhba2V5XSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJsb2NrID0gdHlwZSAmJiAoaW5mby5jdXJyZW50ID0gdHlwZSkoY2hpbGRfY3R4KTtcbiAgICAgICAgbGV0IG5lZWRzX2ZsdXNoID0gZmFsc2U7XG4gICAgICAgIGlmIChpbmZvLmJsb2NrKSB7XG4gICAgICAgICAgICBpZiAoaW5mby5ibG9ja3MpIHtcbiAgICAgICAgICAgICAgICBpbmZvLmJsb2Nrcy5mb3JFYWNoKChibG9jaywgaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPT0gaW5kZXggJiYgYmxvY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwX291dHJvcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbl9vdXQoYmxvY2ssIDEsIDEsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5mby5ibG9ja3NbaV0gPT09IGJsb2NrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8uYmxvY2tzW2ldID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrX291dHJvcygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbmZvLmJsb2NrLmQoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBibG9jay5jKCk7XG4gICAgICAgICAgICB0cmFuc2l0aW9uX2luKGJsb2NrLCAxKTtcbiAgICAgICAgICAgIGJsb2NrLm0oaW5mby5tb3VudCgpLCBpbmZvLmFuY2hvcik7XG4gICAgICAgICAgICBuZWVkc19mbHVzaCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaW5mby5ibG9jayA9IGJsb2NrO1xuICAgICAgICBpZiAoaW5mby5ibG9ja3MpXG4gICAgICAgICAgICBpbmZvLmJsb2Nrc1tpbmRleF0gPSBibG9jaztcbiAgICAgICAgaWYgKG5lZWRzX2ZsdXNoKSB7XG4gICAgICAgICAgICBmbHVzaCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChpc19wcm9taXNlKHByb21pc2UpKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRfY29tcG9uZW50ID0gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCk7XG4gICAgICAgIHByb21pc2UudGhlbih2YWx1ZSA9PiB7XG4gICAgICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQoY3VycmVudF9jb21wb25lbnQpO1xuICAgICAgICAgICAgdXBkYXRlKGluZm8udGhlbiwgMSwgaW5mby52YWx1ZSwgdmFsdWUpO1xuICAgICAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KG51bGwpO1xuICAgICAgICB9LCBlcnJvciA9PiB7XG4gICAgICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQoY3VycmVudF9jb21wb25lbnQpO1xuICAgICAgICAgICAgdXBkYXRlKGluZm8uY2F0Y2gsIDIsIGluZm8uZXJyb3IsIGVycm9yKTtcbiAgICAgICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChudWxsKTtcbiAgICAgICAgICAgIGlmICghaW5mby5oYXNDYXRjaCkge1xuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gaWYgd2UgcHJldmlvdXNseSBoYWQgYSB0aGVuL2NhdGNoIGJsb2NrLCBkZXN0cm95IGl0XG4gICAgICAgIGlmIChpbmZvLmN1cnJlbnQgIT09IGluZm8ucGVuZGluZykge1xuICAgICAgICAgICAgdXBkYXRlKGluZm8ucGVuZGluZywgMCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKGluZm8uY3VycmVudCAhPT0gaW5mby50aGVuKSB7XG4gICAgICAgICAgICB1cGRhdGUoaW5mby50aGVuLCAxLCBpbmZvLnZhbHVlLCBwcm9taXNlKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGluZm8ucmVzb2x2ZWQgPSBwcm9taXNlO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHVwZGF0ZV9hd2FpdF9ibG9ja19icmFuY2goaW5mbywgY3R4LCBkaXJ0eSkge1xuICAgIGNvbnN0IGNoaWxkX2N0eCA9IGN0eC5zbGljZSgpO1xuICAgIGNvbnN0IHsgcmVzb2x2ZWQgfSA9IGluZm87XG4gICAgaWYgKGluZm8uY3VycmVudCA9PT0gaW5mby50aGVuKSB7XG4gICAgICAgIGNoaWxkX2N0eFtpbmZvLnZhbHVlXSA9IHJlc29sdmVkO1xuICAgIH1cbiAgICBpZiAoaW5mby5jdXJyZW50ID09PSBpbmZvLmNhdGNoKSB7XG4gICAgICAgIGNoaWxkX2N0eFtpbmZvLmVycm9yXSA9IHJlc29sdmVkO1xuICAgIH1cbiAgICBpbmZvLmJsb2NrLnAoY2hpbGRfY3R4LCBkaXJ0eSk7XG59XG5cbmZ1bmN0aW9uIGRlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCkge1xuICAgIGJsb2NrLmQoMSk7XG4gICAgbG9va3VwLmRlbGV0ZShibG9jay5rZXkpO1xufVxuZnVuY3Rpb24gb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCkge1xuICAgIHRyYW5zaXRpb25fb3V0KGJsb2NrLCAxLCAxLCAoKSA9PiB7XG4gICAgICAgIGxvb2t1cC5kZWxldGUoYmxvY2sua2V5KTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGZpeF9hbmRfZGVzdHJveV9ibG9jayhibG9jaywgbG9va3VwKSB7XG4gICAgYmxvY2suZigpO1xuICAgIGRlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCk7XG59XG5mdW5jdGlvbiBmaXhfYW5kX291dHJvX2FuZF9kZXN0cm95X2Jsb2NrKGJsb2NrLCBsb29rdXApIHtcbiAgICBibG9jay5mKCk7XG4gICAgb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCk7XG59XG5mdW5jdGlvbiB1cGRhdGVfa2V5ZWRfZWFjaChvbGRfYmxvY2tzLCBkaXJ0eSwgZ2V0X2tleSwgZHluYW1pYywgY3R4LCBsaXN0LCBsb29rdXAsIG5vZGUsIGRlc3Ryb3ksIGNyZWF0ZV9lYWNoX2Jsb2NrLCBuZXh0LCBnZXRfY29udGV4dCkge1xuICAgIGxldCBvID0gb2xkX2Jsb2Nrcy5sZW5ndGg7XG4gICAgbGV0IG4gPSBsaXN0Lmxlbmd0aDtcbiAgICBsZXQgaSA9IG87XG4gICAgY29uc3Qgb2xkX2luZGV4ZXMgPSB7fTtcbiAgICB3aGlsZSAoaS0tKVxuICAgICAgICBvbGRfaW5kZXhlc1tvbGRfYmxvY2tzW2ldLmtleV0gPSBpO1xuICAgIGNvbnN0IG5ld19ibG9ja3MgPSBbXTtcbiAgICBjb25zdCBuZXdfbG9va3VwID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IGRlbHRhcyA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCB1cGRhdGVzID0gW107XG4gICAgaSA9IG47XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgICBjb25zdCBjaGlsZF9jdHggPSBnZXRfY29udGV4dChjdHgsIGxpc3QsIGkpO1xuICAgICAgICBjb25zdCBrZXkgPSBnZXRfa2V5KGNoaWxkX2N0eCk7XG4gICAgICAgIGxldCBibG9jayA9IGxvb2t1cC5nZXQoa2V5KTtcbiAgICAgICAgaWYgKCFibG9jaykge1xuICAgICAgICAgICAgYmxvY2sgPSBjcmVhdGVfZWFjaF9ibG9jayhrZXksIGNoaWxkX2N0eCk7XG4gICAgICAgICAgICBibG9jay5jKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZHluYW1pYykge1xuICAgICAgICAgICAgLy8gZGVmZXIgdXBkYXRlcyB1bnRpbCBhbGwgdGhlIERPTSBzaHVmZmxpbmcgaXMgZG9uZVxuICAgICAgICAgICAgdXBkYXRlcy5wdXNoKCgpID0+IGJsb2NrLnAoY2hpbGRfY3R4LCBkaXJ0eSkpO1xuICAgICAgICB9XG4gICAgICAgIG5ld19sb29rdXAuc2V0KGtleSwgbmV3X2Jsb2Nrc1tpXSA9IGJsb2NrKTtcbiAgICAgICAgaWYgKGtleSBpbiBvbGRfaW5kZXhlcylcbiAgICAgICAgICAgIGRlbHRhcy5zZXQoa2V5LCBNYXRoLmFicyhpIC0gb2xkX2luZGV4ZXNba2V5XSkpO1xuICAgIH1cbiAgICBjb25zdCB3aWxsX21vdmUgPSBuZXcgU2V0KCk7XG4gICAgY29uc3QgZGlkX21vdmUgPSBuZXcgU2V0KCk7XG4gICAgZnVuY3Rpb24gaW5zZXJ0KGJsb2NrKSB7XG4gICAgICAgIHRyYW5zaXRpb25faW4oYmxvY2ssIDEpO1xuICAgICAgICBibG9jay5tKG5vZGUsIG5leHQpO1xuICAgICAgICBsb29rdXAuc2V0KGJsb2NrLmtleSwgYmxvY2spO1xuICAgICAgICBuZXh0ID0gYmxvY2suZmlyc3Q7XG4gICAgICAgIG4tLTtcbiAgICB9XG4gICAgd2hpbGUgKG8gJiYgbikge1xuICAgICAgICBjb25zdCBuZXdfYmxvY2sgPSBuZXdfYmxvY2tzW24gLSAxXTtcbiAgICAgICAgY29uc3Qgb2xkX2Jsb2NrID0gb2xkX2Jsb2Nrc1tvIC0gMV07XG4gICAgICAgIGNvbnN0IG5ld19rZXkgPSBuZXdfYmxvY2sua2V5O1xuICAgICAgICBjb25zdCBvbGRfa2V5ID0gb2xkX2Jsb2NrLmtleTtcbiAgICAgICAgaWYgKG5ld19ibG9jayA9PT0gb2xkX2Jsb2NrKSB7XG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgICAgICBuZXh0ID0gbmV3X2Jsb2NrLmZpcnN0O1xuICAgICAgICAgICAgby0tO1xuICAgICAgICAgICAgbi0tO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFuZXdfbG9va3VwLmhhcyhvbGRfa2V5KSkge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIG9sZCBibG9ja1xuICAgICAgICAgICAgZGVzdHJveShvbGRfYmxvY2ssIGxvb2t1cCk7XG4gICAgICAgICAgICBvLS07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIWxvb2t1cC5oYXMobmV3X2tleSkgfHwgd2lsbF9tb3ZlLmhhcyhuZXdfa2V5KSkge1xuICAgICAgICAgICAgaW5zZXJ0KG5ld19ibG9jayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGlkX21vdmUuaGFzKG9sZF9rZXkpKSB7XG4gICAgICAgICAgICBvLS07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGVsdGFzLmdldChuZXdfa2V5KSA+IGRlbHRhcy5nZXQob2xkX2tleSkpIHtcbiAgICAgICAgICAgIGRpZF9tb3ZlLmFkZChuZXdfa2V5KTtcbiAgICAgICAgICAgIGluc2VydChuZXdfYmxvY2spO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd2lsbF9tb3ZlLmFkZChvbGRfa2V5KTtcbiAgICAgICAgICAgIG8tLTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB3aGlsZSAoby0tKSB7XG4gICAgICAgIGNvbnN0IG9sZF9ibG9jayA9IG9sZF9ibG9ja3Nbb107XG4gICAgICAgIGlmICghbmV3X2xvb2t1cC5oYXMob2xkX2Jsb2NrLmtleSkpXG4gICAgICAgICAgICBkZXN0cm95KG9sZF9ibG9jaywgbG9va3VwKTtcbiAgICB9XG4gICAgd2hpbGUgKG4pXG4gICAgICAgIGluc2VydChuZXdfYmxvY2tzW24gLSAxXSk7XG4gICAgcnVuX2FsbCh1cGRhdGVzKTtcbiAgICByZXR1cm4gbmV3X2Jsb2Nrcztcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlX2VhY2hfa2V5cyhjdHgsIGxpc3QsIGdldF9jb250ZXh0LCBnZXRfa2V5KSB7XG4gICAgY29uc3Qga2V5cyA9IG5ldyBTZXQoKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3Qga2V5ID0gZ2V0X2tleShnZXRfY29udGV4dChjdHgsIGxpc3QsIGkpKTtcbiAgICAgICAgaWYgKGtleXMuaGFzKGtleSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGhhdmUgZHVwbGljYXRlIGtleXMgaW4gYSBrZXllZCBlYWNoJyk7XG4gICAgICAgIH1cbiAgICAgICAga2V5cy5hZGQoa2V5KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGdldF9zcHJlYWRfdXBkYXRlKGxldmVscywgdXBkYXRlcykge1xuICAgIGNvbnN0IHVwZGF0ZSA9IHt9O1xuICAgIGNvbnN0IHRvX251bGxfb3V0ID0ge307XG4gICAgY29uc3QgYWNjb3VudGVkX2ZvciA9IHsgJCRzY29wZTogMSB9O1xuICAgIGxldCBpID0gbGV2ZWxzLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGNvbnN0IG8gPSBsZXZlbHNbaV07XG4gICAgICAgIGNvbnN0IG4gPSB1cGRhdGVzW2ldO1xuICAgICAgICBpZiAobikge1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbykge1xuICAgICAgICAgICAgICAgIGlmICghKGtleSBpbiBuKSlcbiAgICAgICAgICAgICAgICAgICAgdG9fbnVsbF9vdXRba2V5XSA9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBuKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhY2NvdW50ZWRfZm9yW2tleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlW2tleV0gPSBuW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGFjY291bnRlZF9mb3Jba2V5XSA9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV2ZWxzW2ldID0gbjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIG8pIHtcbiAgICAgICAgICAgICAgICBhY2NvdW50ZWRfZm9yW2tleV0gPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3Qga2V5IGluIHRvX251bGxfb3V0KSB7XG4gICAgICAgIGlmICghKGtleSBpbiB1cGRhdGUpKVxuICAgICAgICAgICAgdXBkYXRlW2tleV0gPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiB1cGRhdGU7XG59XG5mdW5jdGlvbiBnZXRfc3ByZWFkX29iamVjdChzcHJlYWRfcHJvcHMpIHtcbiAgICByZXR1cm4gdHlwZW9mIHNwcmVhZF9wcm9wcyA9PT0gJ29iamVjdCcgJiYgc3ByZWFkX3Byb3BzICE9PSBudWxsID8gc3ByZWFkX3Byb3BzIDoge307XG59XG5cbmNvbnN0IF9ib29sZWFuX2F0dHJpYnV0ZXMgPSBbXG4gICAgJ2FsbG93ZnVsbHNjcmVlbicsXG4gICAgJ2FsbG93cGF5bWVudHJlcXVlc3QnLFxuICAgICdhc3luYycsXG4gICAgJ2F1dG9mb2N1cycsXG4gICAgJ2F1dG9wbGF5JyxcbiAgICAnY2hlY2tlZCcsXG4gICAgJ2NvbnRyb2xzJyxcbiAgICAnZGVmYXVsdCcsXG4gICAgJ2RlZmVyJyxcbiAgICAnZGlzYWJsZWQnLFxuICAgICdmb3Jtbm92YWxpZGF0ZScsXG4gICAgJ2hpZGRlbicsXG4gICAgJ2luZXJ0JyxcbiAgICAnaXNtYXAnLFxuICAgICdsb29wJyxcbiAgICAnbXVsdGlwbGUnLFxuICAgICdtdXRlZCcsXG4gICAgJ25vbW9kdWxlJyxcbiAgICAnbm92YWxpZGF0ZScsXG4gICAgJ29wZW4nLFxuICAgICdwbGF5c2lubGluZScsXG4gICAgJ3JlYWRvbmx5JyxcbiAgICAncmVxdWlyZWQnLFxuICAgICdyZXZlcnNlZCcsXG4gICAgJ3NlbGVjdGVkJ1xuXTtcbi8qKlxuICogTGlzdCBvZiBIVE1MIGJvb2xlYW4gYXR0cmlidXRlcyAoZS5nLiBgPGlucHV0IGRpc2FibGVkPmApLlxuICogU291cmNlOiBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9pbmRpY2VzLmh0bWxcbiAqL1xuY29uc3QgYm9vbGVhbl9hdHRyaWJ1dGVzID0gbmV3IFNldChbLi4uX2Jvb2xlYW5fYXR0cmlidXRlc10pO1xuXG4vKiogcmVnZXggb2YgYWxsIGh0bWwgdm9pZCBlbGVtZW50IG5hbWVzICovXG5jb25zdCB2b2lkX2VsZW1lbnRfbmFtZXMgPSAvXig/OmFyZWF8YmFzZXxicnxjb2x8Y29tbWFuZHxlbWJlZHxocnxpbWd8aW5wdXR8a2V5Z2VufGxpbmt8bWV0YXxwYXJhbXxzb3VyY2V8dHJhY2t8d2JyKSQvO1xuZnVuY3Rpb24gaXNfdm9pZChuYW1lKSB7XG4gICAgcmV0dXJuIHZvaWRfZWxlbWVudF9uYW1lcy50ZXN0KG5hbWUpIHx8IG5hbWUudG9Mb3dlckNhc2UoKSA9PT0gJyFkb2N0eXBlJztcbn1cblxuY29uc3QgaW52YWxpZF9hdHRyaWJ1dGVfbmFtZV9jaGFyYWN0ZXIgPSAvW1xccydcIj4vPVxcdXtGREQwfS1cXHV7RkRFRn1cXHV7RkZGRX1cXHV7RkZGRn1cXHV7MUZGRkV9XFx1ezFGRkZGfVxcdXsyRkZGRX1cXHV7MkZGRkZ9XFx1ezNGRkZFfVxcdXszRkZGRn1cXHV7NEZGRkV9XFx1ezRGRkZGfVxcdXs1RkZGRX1cXHV7NUZGRkZ9XFx1ezZGRkZFfVxcdXs2RkZGRn1cXHV7N0ZGRkV9XFx1ezdGRkZGfVxcdXs4RkZGRX1cXHV7OEZGRkZ9XFx1ezlGRkZFfVxcdXs5RkZGRn1cXHV7QUZGRkV9XFx1e0FGRkZGfVxcdXtCRkZGRX1cXHV7QkZGRkZ9XFx1e0NGRkZFfVxcdXtDRkZGRn1cXHV7REZGRkV9XFx1e0RGRkZGfVxcdXtFRkZGRX1cXHV7RUZGRkZ9XFx1e0ZGRkZFfVxcdXtGRkZGRn1cXHV7MTBGRkZFfVxcdXsxMEZGRkZ9XS91O1xuLy8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjYXR0cmlidXRlcy0yXG4vLyBodHRwczovL2luZnJhLnNwZWMud2hhdHdnLm9yZy8jbm9uY2hhcmFjdGVyXG5mdW5jdGlvbiBzcHJlYWQoYXJncywgYXR0cnNfdG9fYWRkKSB7XG4gICAgY29uc3QgYXR0cmlidXRlcyA9IE9iamVjdC5hc3NpZ24oe30sIC4uLmFyZ3MpO1xuICAgIGlmIChhdHRyc190b19hZGQpIHtcbiAgICAgICAgY29uc3QgY2xhc3Nlc190b19hZGQgPSBhdHRyc190b19hZGQuY2xhc3NlcztcbiAgICAgICAgY29uc3Qgc3R5bGVzX3RvX2FkZCA9IGF0dHJzX3RvX2FkZC5zdHlsZXM7XG4gICAgICAgIGlmIChjbGFzc2VzX3RvX2FkZCkge1xuICAgICAgICAgICAgaWYgKGF0dHJpYnV0ZXMuY2xhc3MgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMuY2xhc3MgPSBjbGFzc2VzX3RvX2FkZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMuY2xhc3MgKz0gJyAnICsgY2xhc3Nlc190b19hZGQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0eWxlc190b19hZGQpIHtcbiAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVzLnN0eWxlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLnN0eWxlID0gc3R5bGVfb2JqZWN0X3RvX3N0cmluZyhzdHlsZXNfdG9fYWRkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMuc3R5bGUgPSBzdHlsZV9vYmplY3RfdG9fc3RyaW5nKG1lcmdlX3Nzcl9zdHlsZXMoYXR0cmlidXRlcy5zdHlsZSwgc3R5bGVzX3RvX2FkZCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGxldCBzdHIgPSAnJztcbiAgICBPYmplY3Qua2V5cyhhdHRyaWJ1dGVzKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgICBpZiAoaW52YWxpZF9hdHRyaWJ1dGVfbmFtZV9jaGFyYWN0ZXIudGVzdChuYW1lKSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBhdHRyaWJ1dGVzW25hbWVdO1xuICAgICAgICBpZiAodmFsdWUgPT09IHRydWUpXG4gICAgICAgICAgICBzdHIgKz0gJyAnICsgbmFtZTtcbiAgICAgICAgZWxzZSBpZiAoYm9vbGVhbl9hdHRyaWJ1dGVzLmhhcyhuYW1lLnRvTG93ZXJDYXNlKCkpKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUpXG4gICAgICAgICAgICAgICAgc3RyICs9ICcgJyArIG5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgICAgc3RyICs9IGAgJHtuYW1lfT1cIiR7dmFsdWV9XCJgO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHN0cjtcbn1cbmZ1bmN0aW9uIG1lcmdlX3Nzcl9zdHlsZXMoc3R5bGVfYXR0cmlidXRlLCBzdHlsZV9kaXJlY3RpdmUpIHtcbiAgICBjb25zdCBzdHlsZV9vYmplY3QgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGluZGl2aWR1YWxfc3R5bGUgb2Ygc3R5bGVfYXR0cmlidXRlLnNwbGl0KCc7JykpIHtcbiAgICAgICAgY29uc3QgY29sb25faW5kZXggPSBpbmRpdmlkdWFsX3N0eWxlLmluZGV4T2YoJzonKTtcbiAgICAgICAgY29uc3QgbmFtZSA9IGluZGl2aWR1YWxfc3R5bGUuc2xpY2UoMCwgY29sb25faW5kZXgpLnRyaW0oKTtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBpbmRpdmlkdWFsX3N0eWxlLnNsaWNlKGNvbG9uX2luZGV4ICsgMSkudHJpbSgpO1xuICAgICAgICBpZiAoIW5hbWUpXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgc3R5bGVfb2JqZWN0W25hbWVdID0gdmFsdWU7XG4gICAgfVxuICAgIGZvciAoY29uc3QgbmFtZSBpbiBzdHlsZV9kaXJlY3RpdmUpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBzdHlsZV9kaXJlY3RpdmVbbmFtZV07XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgc3R5bGVfb2JqZWN0W25hbWVdID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkZWxldGUgc3R5bGVfb2JqZWN0W25hbWVdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBzdHlsZV9vYmplY3Q7XG59XG5jb25zdCBBVFRSX1JFR0VYID0gL1smXCJdL2c7XG5jb25zdCBDT05URU5UX1JFR0VYID0gL1smPF0vZztcbi8qKlxuICogTm90ZTogdGhpcyBtZXRob2QgaXMgcGVyZm9ybWFuY2Ugc2Vuc2l0aXZlIGFuZCBoYXMgYmVlbiBvcHRpbWl6ZWRcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9zdmVsdGVqcy9zdmVsdGUvcHVsbC81NzAxXG4gKi9cbmZ1bmN0aW9uIGVzY2FwZSh2YWx1ZSwgaXNfYXR0ciA9IGZhbHNlKSB7XG4gICAgY29uc3Qgc3RyID0gU3RyaW5nKHZhbHVlKTtcbiAgICBjb25zdCBwYXR0ZXJuID0gaXNfYXR0ciA/IEFUVFJfUkVHRVggOiBDT05URU5UX1JFR0VYO1xuICAgIHBhdHRlcm4ubGFzdEluZGV4ID0gMDtcbiAgICBsZXQgZXNjYXBlZCA9ICcnO1xuICAgIGxldCBsYXN0ID0gMDtcbiAgICB3aGlsZSAocGF0dGVybi50ZXN0KHN0cikpIHtcbiAgICAgICAgY29uc3QgaSA9IHBhdHRlcm4ubGFzdEluZGV4IC0gMTtcbiAgICAgICAgY29uc3QgY2ggPSBzdHJbaV07XG4gICAgICAgIGVzY2FwZWQgKz0gc3RyLnN1YnN0cmluZyhsYXN0LCBpKSArIChjaCA9PT0gJyYnID8gJyZhbXA7JyA6IChjaCA9PT0gJ1wiJyA/ICcmcXVvdDsnIDogJyZsdDsnKSk7XG4gICAgICAgIGxhc3QgPSBpICsgMTtcbiAgICB9XG4gICAgcmV0dXJuIGVzY2FwZWQgKyBzdHIuc3Vic3RyaW5nKGxhc3QpO1xufVxuZnVuY3Rpb24gZXNjYXBlX2F0dHJpYnV0ZV92YWx1ZSh2YWx1ZSkge1xuICAgIC8vIGtlZXAgYm9vbGVhbnMsIG51bGwsIGFuZCB1bmRlZmluZWQgZm9yIHRoZSBzYWtlIG9mIGBzcHJlYWRgXG4gICAgY29uc3Qgc2hvdWxkX2VzY2FwZSA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHwgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpO1xuICAgIHJldHVybiBzaG91bGRfZXNjYXBlID8gZXNjYXBlKHZhbHVlLCB0cnVlKSA6IHZhbHVlO1xufVxuZnVuY3Rpb24gZXNjYXBlX29iamVjdChvYmopIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBvYmopIHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSBlc2NhcGVfYXR0cmlidXRlX3ZhbHVlKG9ialtrZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmZ1bmN0aW9uIGVhY2goaXRlbXMsIGZuKSB7XG4gICAgbGV0IHN0ciA9ICcnO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlbXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgc3RyICs9IGZuKGl0ZW1zW2ldLCBpKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0cjtcbn1cbmNvbnN0IG1pc3NpbmdfY29tcG9uZW50ID0ge1xuICAgICQkcmVuZGVyOiAoKSA9PiAnJ1xufTtcbmZ1bmN0aW9uIHZhbGlkYXRlX2NvbXBvbmVudChjb21wb25lbnQsIG5hbWUpIHtcbiAgICBpZiAoIWNvbXBvbmVudCB8fCAhY29tcG9uZW50LiQkcmVuZGVyKSB7XG4gICAgICAgIGlmIChuYW1lID09PSAnc3ZlbHRlOmNvbXBvbmVudCcpXG4gICAgICAgICAgICBuYW1lICs9ICcgdGhpcz17Li4ufSc7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgPCR7bmFtZX0+IGlzIG5vdCBhIHZhbGlkIFNTUiBjb21wb25lbnQuIFlvdSBtYXkgbmVlZCB0byByZXZpZXcgeW91ciBidWlsZCBjb25maWcgdG8gZW5zdXJlIHRoYXQgZGVwZW5kZW5jaWVzIGFyZSBjb21waWxlZCwgcmF0aGVyIHRoYW4gaW1wb3J0ZWQgYXMgcHJlLWNvbXBpbGVkIG1vZHVsZXMuIE90aGVyd2lzZSB5b3UgbWF5IG5lZWQgdG8gZml4IGEgPCR7bmFtZX0+LmApO1xuICAgIH1cbiAgICByZXR1cm4gY29tcG9uZW50O1xufVxuZnVuY3Rpb24gZGVidWcoZmlsZSwgbGluZSwgY29sdW1uLCB2YWx1ZXMpIHtcbiAgICBjb25zb2xlLmxvZyhge0BkZWJ1Z30gJHtmaWxlID8gZmlsZSArICcgJyA6ICcnfSgke2xpbmV9OiR7Y29sdW1ufSlgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgY29uc29sZS5sb2codmFsdWVzKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgcmV0dXJuICcnO1xufVxubGV0IG9uX2Rlc3Ryb3k7XG5mdW5jdGlvbiBjcmVhdGVfc3NyX2NvbXBvbmVudChmbikge1xuICAgIGZ1bmN0aW9uICQkcmVuZGVyKHJlc3VsdCwgcHJvcHMsIGJpbmRpbmdzLCBzbG90cywgY29udGV4dCkge1xuICAgICAgICBjb25zdCBwYXJlbnRfY29tcG9uZW50ID0gY3VycmVudF9jb21wb25lbnQ7XG4gICAgICAgIGNvbnN0ICQkID0ge1xuICAgICAgICAgICAgb25fZGVzdHJveSxcbiAgICAgICAgICAgIGNvbnRleHQ6IG5ldyBNYXAoY29udGV4dCB8fCAocGFyZW50X2NvbXBvbmVudCA/IHBhcmVudF9jb21wb25lbnQuJCQuY29udGV4dCA6IFtdKSksXG4gICAgICAgICAgICAvLyB0aGVzZSB3aWxsIGJlIGltbWVkaWF0ZWx5IGRpc2NhcmRlZFxuICAgICAgICAgICAgb25fbW91bnQ6IFtdLFxuICAgICAgICAgICAgYmVmb3JlX3VwZGF0ZTogW10sXG4gICAgICAgICAgICBhZnRlcl91cGRhdGU6IFtdLFxuICAgICAgICAgICAgY2FsbGJhY2tzOiBibGFua19vYmplY3QoKVxuICAgICAgICB9O1xuICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQoeyAkJCB9KTtcbiAgICAgICAgY29uc3QgaHRtbCA9IGZuKHJlc3VsdCwgcHJvcHMsIGJpbmRpbmdzLCBzbG90cyk7XG4gICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChwYXJlbnRfY29tcG9uZW50KTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHJlbmRlcjogKHByb3BzID0ge30sIHsgJCRzbG90cyA9IHt9LCBjb250ZXh0ID0gbmV3IE1hcCgpIH0gPSB7fSkgPT4ge1xuICAgICAgICAgICAgb25fZGVzdHJveSA9IFtdO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0geyB0aXRsZTogJycsIGhlYWQ6ICcnLCBjc3M6IG5ldyBTZXQoKSB9O1xuICAgICAgICAgICAgY29uc3QgaHRtbCA9ICQkcmVuZGVyKHJlc3VsdCwgcHJvcHMsIHt9LCAkJHNsb3RzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIHJ1bl9hbGwob25fZGVzdHJveSk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGh0bWwsXG4gICAgICAgICAgICAgICAgY3NzOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IEFycmF5LmZyb20ocmVzdWx0LmNzcykubWFwKGNzcyA9PiBjc3MuY29kZSkuam9pbignXFxuJyksXG4gICAgICAgICAgICAgICAgICAgIG1hcDogbnVsbCAvLyBUT0RPXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBoZWFkOiByZXN1bHQudGl0bGUgKyByZXN1bHQuaGVhZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgJCRyZW5kZXJcbiAgICB9O1xufVxuZnVuY3Rpb24gYWRkX2F0dHJpYnV0ZShuYW1lLCB2YWx1ZSwgYm9vbGVhbikge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsIHx8IChib29sZWFuICYmICF2YWx1ZSkpXG4gICAgICAgIHJldHVybiAnJztcbiAgICBjb25zdCBhc3NpZ25tZW50ID0gKGJvb2xlYW4gJiYgdmFsdWUgPT09IHRydWUpID8gJycgOiBgPVwiJHtlc2NhcGUodmFsdWUsIHRydWUpfVwiYDtcbiAgICByZXR1cm4gYCAke25hbWV9JHthc3NpZ25tZW50fWA7XG59XG5mdW5jdGlvbiBhZGRfY2xhc3NlcyhjbGFzc2VzKSB7XG4gICAgcmV0dXJuIGNsYXNzZXMgPyBgIGNsYXNzPVwiJHtjbGFzc2VzfVwiYCA6ICcnO1xufVxuZnVuY3Rpb24gc3R5bGVfb2JqZWN0X3RvX3N0cmluZyhzdHlsZV9vYmplY3QpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXMoc3R5bGVfb2JqZWN0KVxuICAgICAgICAuZmlsdGVyKGtleSA9PiBzdHlsZV9vYmplY3Rba2V5XSlcbiAgICAgICAgLm1hcChrZXkgPT4gYCR7a2V5fTogJHtlc2NhcGVfYXR0cmlidXRlX3ZhbHVlKHN0eWxlX29iamVjdFtrZXldKX07YClcbiAgICAgICAgLmpvaW4oJyAnKTtcbn1cbmZ1bmN0aW9uIGFkZF9zdHlsZXMoc3R5bGVfb2JqZWN0KSB7XG4gICAgY29uc3Qgc3R5bGVzID0gc3R5bGVfb2JqZWN0X3RvX3N0cmluZyhzdHlsZV9vYmplY3QpO1xuICAgIHJldHVybiBzdHlsZXMgPyBgIHN0eWxlPVwiJHtzdHlsZXN9XCJgIDogJyc7XG59XG5cbmZ1bmN0aW9uIGJpbmQoY29tcG9uZW50LCBuYW1lLCBjYWxsYmFjaykge1xuICAgIGNvbnN0IGluZGV4ID0gY29tcG9uZW50LiQkLnByb3BzW25hbWVdO1xuICAgIGlmIChpbmRleCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbXBvbmVudC4kJC5ib3VuZFtpbmRleF0gPSBjYWxsYmFjaztcbiAgICAgICAgY2FsbGJhY2soY29tcG9uZW50LiQkLmN0eFtpbmRleF0pO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNyZWF0ZV9jb21wb25lbnQoYmxvY2spIHtcbiAgICBibG9jayAmJiBibG9jay5jKCk7XG59XG5mdW5jdGlvbiBjbGFpbV9jb21wb25lbnQoYmxvY2ssIHBhcmVudF9ub2Rlcykge1xuICAgIGJsb2NrICYmIGJsb2NrLmwocGFyZW50X25vZGVzKTtcbn1cbmZ1bmN0aW9uIG1vdW50X2NvbXBvbmVudChjb21wb25lbnQsIHRhcmdldCwgYW5jaG9yLCBjdXN0b21FbGVtZW50KSB7XG4gICAgY29uc3QgeyBmcmFnbWVudCwgYWZ0ZXJfdXBkYXRlIH0gPSBjb21wb25lbnQuJCQ7XG4gICAgZnJhZ21lbnQgJiYgZnJhZ21lbnQubSh0YXJnZXQsIGFuY2hvcik7XG4gICAgaWYgKCFjdXN0b21FbGVtZW50KSB7XG4gICAgICAgIC8vIG9uTW91bnQgaGFwcGVucyBiZWZvcmUgdGhlIGluaXRpYWwgYWZ0ZXJVcGRhdGVcbiAgICAgICAgYWRkX3JlbmRlcl9jYWxsYmFjaygoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdfb25fZGVzdHJveSA9IGNvbXBvbmVudC4kJC5vbl9tb3VudC5tYXAocnVuKS5maWx0ZXIoaXNfZnVuY3Rpb24pO1xuICAgICAgICAgICAgLy8gaWYgdGhlIGNvbXBvbmVudCB3YXMgZGVzdHJveWVkIGltbWVkaWF0ZWx5XG4gICAgICAgICAgICAvLyBpdCB3aWxsIHVwZGF0ZSB0aGUgYCQkLm9uX2Rlc3Ryb3lgIHJlZmVyZW5jZSB0byBgbnVsbGAuXG4gICAgICAgICAgICAvLyB0aGUgZGVzdHJ1Y3R1cmVkIG9uX2Rlc3Ryb3kgbWF5IHN0aWxsIHJlZmVyZW5jZSB0byB0aGUgb2xkIGFycmF5XG4gICAgICAgICAgICBpZiAoY29tcG9uZW50LiQkLm9uX2Rlc3Ryb3kpIHtcbiAgICAgICAgICAgICAgICBjb21wb25lbnQuJCQub25fZGVzdHJveS5wdXNoKC4uLm5ld19vbl9kZXN0cm95KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEVkZ2UgY2FzZSAtIGNvbXBvbmVudCB3YXMgZGVzdHJveWVkIGltbWVkaWF0ZWx5LFxuICAgICAgICAgICAgICAgIC8vIG1vc3QgbGlrZWx5IGFzIGEgcmVzdWx0IG9mIGEgYmluZGluZyBpbml0aWFsaXNpbmdcbiAgICAgICAgICAgICAgICBydW5fYWxsKG5ld19vbl9kZXN0cm95KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbXBvbmVudC4kJC5vbl9tb3VudCA9IFtdO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgYWZ0ZXJfdXBkYXRlLmZvckVhY2goYWRkX3JlbmRlcl9jYWxsYmFjayk7XG59XG5mdW5jdGlvbiBkZXN0cm95X2NvbXBvbmVudChjb21wb25lbnQsIGRldGFjaGluZykge1xuICAgIGNvbnN0ICQkID0gY29tcG9uZW50LiQkO1xuICAgIGlmICgkJC5mcmFnbWVudCAhPT0gbnVsbCkge1xuICAgICAgICBmbHVzaF9yZW5kZXJfY2FsbGJhY2tzKCQkLmFmdGVyX3VwZGF0ZSk7XG4gICAgICAgIHJ1bl9hbGwoJCQub25fZGVzdHJveSk7XG4gICAgICAgICQkLmZyYWdtZW50ICYmICQkLmZyYWdtZW50LmQoZGV0YWNoaW5nKTtcbiAgICAgICAgLy8gVE9ETyBudWxsIG91dCBvdGhlciByZWZzLCBpbmNsdWRpbmcgY29tcG9uZW50LiQkIChidXQgbmVlZCB0b1xuICAgICAgICAvLyBwcmVzZXJ2ZSBmaW5hbCBzdGF0ZT8pXG4gICAgICAgICQkLm9uX2Rlc3Ryb3kgPSAkJC5mcmFnbWVudCA9IG51bGw7XG4gICAgICAgICQkLmN0eCA9IFtdO1xuICAgIH1cbn1cbmZ1bmN0aW9uIG1ha2VfZGlydHkoY29tcG9uZW50LCBpKSB7XG4gICAgaWYgKGNvbXBvbmVudC4kJC5kaXJ0eVswXSA9PT0gLTEpIHtcbiAgICAgICAgZGlydHlfY29tcG9uZW50cy5wdXNoKGNvbXBvbmVudCk7XG4gICAgICAgIHNjaGVkdWxlX3VwZGF0ZSgpO1xuICAgICAgICBjb21wb25lbnQuJCQuZGlydHkuZmlsbCgwKTtcbiAgICB9XG4gICAgY29tcG9uZW50LiQkLmRpcnR5WyhpIC8gMzEpIHwgMF0gfD0gKDEgPDwgKGkgJSAzMSkpO1xufVxuZnVuY3Rpb24gaW5pdChjb21wb25lbnQsIG9wdGlvbnMsIGluc3RhbmNlLCBjcmVhdGVfZnJhZ21lbnQsIG5vdF9lcXVhbCwgcHJvcHMsIGFwcGVuZF9zdHlsZXMsIGRpcnR5ID0gWy0xXSkge1xuICAgIGNvbnN0IHBhcmVudF9jb21wb25lbnQgPSBjdXJyZW50X2NvbXBvbmVudDtcbiAgICBzZXRfY3VycmVudF9jb21wb25lbnQoY29tcG9uZW50KTtcbiAgICBjb25zdCAkJCA9IGNvbXBvbmVudC4kJCA9IHtcbiAgICAgICAgZnJhZ21lbnQ6IG51bGwsXG4gICAgICAgIGN0eDogW10sXG4gICAgICAgIC8vIHN0YXRlXG4gICAgICAgIHByb3BzLFxuICAgICAgICB1cGRhdGU6IG5vb3AsXG4gICAgICAgIG5vdF9lcXVhbCxcbiAgICAgICAgYm91bmQ6IGJsYW5rX29iamVjdCgpLFxuICAgICAgICAvLyBsaWZlY3ljbGVcbiAgICAgICAgb25fbW91bnQ6IFtdLFxuICAgICAgICBvbl9kZXN0cm95OiBbXSxcbiAgICAgICAgb25fZGlzY29ubmVjdDogW10sXG4gICAgICAgIGJlZm9yZV91cGRhdGU6IFtdLFxuICAgICAgICBhZnRlcl91cGRhdGU6IFtdLFxuICAgICAgICBjb250ZXh0OiBuZXcgTWFwKG9wdGlvbnMuY29udGV4dCB8fCAocGFyZW50X2NvbXBvbmVudCA/IHBhcmVudF9jb21wb25lbnQuJCQuY29udGV4dCA6IFtdKSksXG4gICAgICAgIC8vIGV2ZXJ5dGhpbmcgZWxzZVxuICAgICAgICBjYWxsYmFja3M6IGJsYW5rX29iamVjdCgpLFxuICAgICAgICBkaXJ0eSxcbiAgICAgICAgc2tpcF9ib3VuZDogZmFsc2UsXG4gICAgICAgIHJvb3Q6IG9wdGlvbnMudGFyZ2V0IHx8IHBhcmVudF9jb21wb25lbnQuJCQucm9vdFxuICAgIH07XG4gICAgYXBwZW5kX3N0eWxlcyAmJiBhcHBlbmRfc3R5bGVzKCQkLnJvb3QpO1xuICAgIGxldCByZWFkeSA9IGZhbHNlO1xuICAgICQkLmN0eCA9IGluc3RhbmNlXG4gICAgICAgID8gaW5zdGFuY2UoY29tcG9uZW50LCBvcHRpb25zLnByb3BzIHx8IHt9LCAoaSwgcmV0LCAuLi5yZXN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHJlc3QubGVuZ3RoID8gcmVzdFswXSA6IHJldDtcbiAgICAgICAgICAgIGlmICgkJC5jdHggJiYgbm90X2VxdWFsKCQkLmN0eFtpXSwgJCQuY3R4W2ldID0gdmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEkJC5za2lwX2JvdW5kICYmICQkLmJvdW5kW2ldKVxuICAgICAgICAgICAgICAgICAgICAkJC5ib3VuZFtpXSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlYWR5KVxuICAgICAgICAgICAgICAgICAgICBtYWtlX2RpcnR5KGNvbXBvbmVudCwgaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICB9KVxuICAgICAgICA6IFtdO1xuICAgICQkLnVwZGF0ZSgpO1xuICAgIHJlYWR5ID0gdHJ1ZTtcbiAgICBydW5fYWxsKCQkLmJlZm9yZV91cGRhdGUpO1xuICAgIC8vIGBmYWxzZWAgYXMgYSBzcGVjaWFsIGNhc2Ugb2Ygbm8gRE9NIGNvbXBvbmVudFxuICAgICQkLmZyYWdtZW50ID0gY3JlYXRlX2ZyYWdtZW50ID8gY3JlYXRlX2ZyYWdtZW50KCQkLmN0eCkgOiBmYWxzZTtcbiAgICBpZiAob3B0aW9ucy50YXJnZXQpIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuaHlkcmF0ZSkge1xuICAgICAgICAgICAgc3RhcnRfaHlkcmF0aW5nKCk7XG4gICAgICAgICAgICBjb25zdCBub2RlcyA9IGNoaWxkcmVuKG9wdGlvbnMudGFyZ2V0KTtcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uXG4gICAgICAgICAgICAkJC5mcmFnbWVudCAmJiAkJC5mcmFnbWVudC5sKG5vZGVzKTtcbiAgICAgICAgICAgIG5vZGVzLmZvckVhY2goZGV0YWNoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tbm9uLW51bGwtYXNzZXJ0aW9uXG4gICAgICAgICAgICAkJC5mcmFnbWVudCAmJiAkJC5mcmFnbWVudC5jKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMuaW50cm8pXG4gICAgICAgICAgICB0cmFuc2l0aW9uX2luKGNvbXBvbmVudC4kJC5mcmFnbWVudCk7XG4gICAgICAgIG1vdW50X2NvbXBvbmVudChjb21wb25lbnQsIG9wdGlvbnMudGFyZ2V0LCBvcHRpb25zLmFuY2hvciwgb3B0aW9ucy5jdXN0b21FbGVtZW50KTtcbiAgICAgICAgZW5kX2h5ZHJhdGluZygpO1xuICAgICAgICBmbHVzaCgpO1xuICAgIH1cbiAgICBzZXRfY3VycmVudF9jb21wb25lbnQocGFyZW50X2NvbXBvbmVudCk7XG59XG5sZXQgU3ZlbHRlRWxlbWVudDtcbmlmICh0eXBlb2YgSFRNTEVsZW1lbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBTdmVsdGVFbGVtZW50ID0gY2xhc3MgZXh0ZW5kcyBIVE1MRWxlbWVudCB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgICAgIHRoaXMuYXR0YWNoU2hhZG93KHsgbW9kZTogJ29wZW4nIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICAgICAgY29uc3QgeyBvbl9tb3VudCB9ID0gdGhpcy4kJDtcbiAgICAgICAgICAgIHRoaXMuJCQub25fZGlzY29ubmVjdCA9IG9uX21vdW50Lm1hcChydW4pLmZpbHRlcihpc19mdW5jdGlvbik7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIHRvZG86IGltcHJvdmUgdHlwaW5nc1xuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gdGhpcy4kJC5zbG90dGVkKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSB0b2RvOiBpbXByb3ZlIHR5cGluZ3NcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGVuZENoaWxkKHRoaXMuJCQuc2xvdHRlZFtrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhdHRyaWJ1dGVDaGFuZ2VkQ2FsbGJhY2soYXR0ciwgX29sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICAgICAgICAgICAgdGhpc1thdHRyXSA9IG5ld1ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGRpc2Nvbm5lY3RlZENhbGxiYWNrKCkge1xuICAgICAgICAgICAgcnVuX2FsbCh0aGlzLiQkLm9uX2Rpc2Nvbm5lY3QpO1xuICAgICAgICB9XG4gICAgICAgICRkZXN0cm95KCkge1xuICAgICAgICAgICAgZGVzdHJveV9jb21wb25lbnQodGhpcywgMSk7XG4gICAgICAgICAgICB0aGlzLiRkZXN0cm95ID0gbm9vcDtcbiAgICAgICAgfVxuICAgICAgICAkb24odHlwZSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIC8vIFRPRE8gc2hvdWxkIHRoaXMgZGVsZWdhdGUgdG8gYWRkRXZlbnRMaXN0ZW5lcj9cbiAgICAgICAgICAgIGlmICghaXNfZnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vb3A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBjYWxsYmFja3MgPSAodGhpcy4kJC5jYWxsYmFja3NbdHlwZV0gfHwgKHRoaXMuJCQuY2FsbGJhY2tzW3R5cGVdID0gW10pKTtcbiAgICAgICAgICAgIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBjYWxsYmFja3MuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgICRzZXQoJCRwcm9wcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuJCRzZXQgJiYgIWlzX2VtcHR5KCQkcHJvcHMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kJC5za2lwX2JvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLiQkc2V0KCQkcHJvcHMpO1xuICAgICAgICAgICAgICAgIHRoaXMuJCQuc2tpcF9ib3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn1cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgU3ZlbHRlIGNvbXBvbmVudHMuIFVzZWQgd2hlbiBkZXY9ZmFsc2UuXG4gKi9cbmNsYXNzIFN2ZWx0ZUNvbXBvbmVudCB7XG4gICAgJGRlc3Ryb3koKSB7XG4gICAgICAgIGRlc3Ryb3lfY29tcG9uZW50KHRoaXMsIDEpO1xuICAgICAgICB0aGlzLiRkZXN0cm95ID0gbm9vcDtcbiAgICB9XG4gICAgJG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICghaXNfZnVuY3Rpb24oY2FsbGJhY2spKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9vcDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjYWxsYmFja3MgPSAodGhpcy4kJC5jYWxsYmFja3NbdHlwZV0gfHwgKHRoaXMuJCQuY2FsbGJhY2tzW3R5cGVdID0gW10pKTtcbiAgICAgICAgY2FsbGJhY2tzLnB1c2goY2FsbGJhY2spO1xuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBjYWxsYmFja3MuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICAkc2V0KCQkcHJvcHMpIHtcbiAgICAgICAgaWYgKHRoaXMuJCRzZXQgJiYgIWlzX2VtcHR5KCQkcHJvcHMpKSB7XG4gICAgICAgICAgICB0aGlzLiQkLnNraXBfYm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy4kJHNldCgkJHByb3BzKTtcbiAgICAgICAgICAgIHRoaXMuJCQuc2tpcF9ib3VuZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkaXNwYXRjaF9kZXYodHlwZSwgZGV0YWlsKSB7XG4gICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChjdXN0b21fZXZlbnQodHlwZSwgT2JqZWN0LmFzc2lnbih7IHZlcnNpb246ICczLjU5LjInIH0sIGRldGFpbCksIHsgYnViYmxlczogdHJ1ZSB9KSk7XG59XG5mdW5jdGlvbiBhcHBlbmRfZGV2KHRhcmdldCwgbm9kZSkge1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NSW5zZXJ0JywgeyB0YXJnZXQsIG5vZGUgfSk7XG4gICAgYXBwZW5kKHRhcmdldCwgbm9kZSk7XG59XG5mdW5jdGlvbiBhcHBlbmRfaHlkcmF0aW9uX2Rldih0YXJnZXQsIG5vZGUpIHtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTUluc2VydCcsIHsgdGFyZ2V0LCBub2RlIH0pO1xuICAgIGFwcGVuZF9oeWRyYXRpb24odGFyZ2V0LCBub2RlKTtcbn1cbmZ1bmN0aW9uIGluc2VydF9kZXYodGFyZ2V0LCBub2RlLCBhbmNob3IpIHtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTUluc2VydCcsIHsgdGFyZ2V0LCBub2RlLCBhbmNob3IgfSk7XG4gICAgaW5zZXJ0KHRhcmdldCwgbm9kZSwgYW5jaG9yKTtcbn1cbmZ1bmN0aW9uIGluc2VydF9oeWRyYXRpb25fZGV2KHRhcmdldCwgbm9kZSwgYW5jaG9yKSB7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01JbnNlcnQnLCB7IHRhcmdldCwgbm9kZSwgYW5jaG9yIH0pO1xuICAgIGluc2VydF9oeWRyYXRpb24odGFyZ2V0LCBub2RlLCBhbmNob3IpO1xufVxuZnVuY3Rpb24gZGV0YWNoX2Rldihub2RlKSB7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01SZW1vdmUnLCB7IG5vZGUgfSk7XG4gICAgZGV0YWNoKG5vZGUpO1xufVxuZnVuY3Rpb24gZGV0YWNoX2JldHdlZW5fZGV2KGJlZm9yZSwgYWZ0ZXIpIHtcbiAgICB3aGlsZSAoYmVmb3JlLm5leHRTaWJsaW5nICYmIGJlZm9yZS5uZXh0U2libGluZyAhPT0gYWZ0ZXIpIHtcbiAgICAgICAgZGV0YWNoX2RldihiZWZvcmUubmV4dFNpYmxpbmcpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGRldGFjaF9iZWZvcmVfZGV2KGFmdGVyKSB7XG4gICAgd2hpbGUgKGFmdGVyLnByZXZpb3VzU2libGluZykge1xuICAgICAgICBkZXRhY2hfZGV2KGFmdGVyLnByZXZpb3VzU2libGluZyk7XG4gICAgfVxufVxuZnVuY3Rpb24gZGV0YWNoX2FmdGVyX2RldihiZWZvcmUpIHtcbiAgICB3aGlsZSAoYmVmb3JlLm5leHRTaWJsaW5nKSB7XG4gICAgICAgIGRldGFjaF9kZXYoYmVmb3JlLm5leHRTaWJsaW5nKTtcbiAgICB9XG59XG5mdW5jdGlvbiBsaXN0ZW5fZGV2KG5vZGUsIGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zLCBoYXNfcHJldmVudF9kZWZhdWx0LCBoYXNfc3RvcF9wcm9wYWdhdGlvbiwgaGFzX3N0b3BfaW1tZWRpYXRlX3Byb3BhZ2F0aW9uKSB7XG4gICAgY29uc3QgbW9kaWZpZXJzID0gb3B0aW9ucyA9PT0gdHJ1ZSA/IFsnY2FwdHVyZSddIDogb3B0aW9ucyA/IEFycmF5LmZyb20oT2JqZWN0LmtleXMob3B0aW9ucykpIDogW107XG4gICAgaWYgKGhhc19wcmV2ZW50X2RlZmF1bHQpXG4gICAgICAgIG1vZGlmaWVycy5wdXNoKCdwcmV2ZW50RGVmYXVsdCcpO1xuICAgIGlmIChoYXNfc3RvcF9wcm9wYWdhdGlvbilcbiAgICAgICAgbW9kaWZpZXJzLnB1c2goJ3N0b3BQcm9wYWdhdGlvbicpO1xuICAgIGlmIChoYXNfc3RvcF9pbW1lZGlhdGVfcHJvcGFnYXRpb24pXG4gICAgICAgIG1vZGlmaWVycy5wdXNoKCdzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24nKTtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTUFkZEV2ZW50TGlzdGVuZXInLCB7IG5vZGUsIGV2ZW50LCBoYW5kbGVyLCBtb2RpZmllcnMgfSk7XG4gICAgY29uc3QgZGlzcG9zZSA9IGxpc3Rlbihub2RlLCBldmVudCwgaGFuZGxlciwgb3B0aW9ucyk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01SZW1vdmVFdmVudExpc3RlbmVyJywgeyBub2RlLCBldmVudCwgaGFuZGxlciwgbW9kaWZpZXJzIH0pO1xuICAgICAgICBkaXNwb3NlKCk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGF0dHJfZGV2KG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICBhdHRyKG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUpO1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKVxuICAgICAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVJlbW92ZUF0dHJpYnV0ZScsIHsgbm9kZSwgYXR0cmlidXRlIH0pO1xuICAgIGVsc2VcbiAgICAgICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01TZXRBdHRyaWJ1dGUnLCB7IG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUgfSk7XG59XG5mdW5jdGlvbiBwcm9wX2Rldihub2RlLCBwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICBub2RlW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NU2V0UHJvcGVydHknLCB7IG5vZGUsIHByb3BlcnR5LCB2YWx1ZSB9KTtcbn1cbmZ1bmN0aW9uIGRhdGFzZXRfZGV2KG5vZGUsIHByb3BlcnR5LCB2YWx1ZSkge1xuICAgIG5vZGUuZGF0YXNldFtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVNldERhdGFzZXQnLCB7IG5vZGUsIHByb3BlcnR5LCB2YWx1ZSB9KTtcbn1cbmZ1bmN0aW9uIHNldF9kYXRhX2Rldih0ZXh0LCBkYXRhKSB7XG4gICAgZGF0YSA9ICcnICsgZGF0YTtcbiAgICBpZiAodGV4dC5kYXRhID09PSBkYXRhKVxuICAgICAgICByZXR1cm47XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01TZXREYXRhJywgeyBub2RlOiB0ZXh0LCBkYXRhIH0pO1xuICAgIHRleHQuZGF0YSA9IGRhdGE7XG59XG5mdW5jdGlvbiBzZXRfZGF0YV9jb250ZW50ZWRpdGFibGVfZGV2KHRleHQsIGRhdGEpIHtcbiAgICBkYXRhID0gJycgKyBkYXRhO1xuICAgIGlmICh0ZXh0Lndob2xlVGV4dCA9PT0gZGF0YSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NU2V0RGF0YScsIHsgbm9kZTogdGV4dCwgZGF0YSB9KTtcbiAgICB0ZXh0LmRhdGEgPSBkYXRhO1xufVxuZnVuY3Rpb24gc2V0X2RhdGFfbWF5YmVfY29udGVudGVkaXRhYmxlX2Rldih0ZXh0LCBkYXRhLCBhdHRyX3ZhbHVlKSB7XG4gICAgaWYgKH5jb250ZW50ZWRpdGFibGVfdHJ1dGh5X3ZhbHVlcy5pbmRleE9mKGF0dHJfdmFsdWUpKSB7XG4gICAgICAgIHNldF9kYXRhX2NvbnRlbnRlZGl0YWJsZV9kZXYodGV4dCwgZGF0YSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzZXRfZGF0YV9kZXYodGV4dCwgZGF0YSk7XG4gICAgfVxufVxuZnVuY3Rpb24gdmFsaWRhdGVfZWFjaF9hcmd1bWVudChhcmcpIHtcbiAgICBpZiAodHlwZW9mIGFyZyAhPT0gJ3N0cmluZycgJiYgIShhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgJ2xlbmd0aCcgaW4gYXJnKSkge1xuICAgICAgICBsZXQgbXNnID0gJ3sjZWFjaH0gb25seSBpdGVyYXRlcyBvdmVyIGFycmF5LWxpa2Ugb2JqZWN0cy4nO1xuICAgICAgICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiBhcmcgJiYgU3ltYm9sLml0ZXJhdG9yIGluIGFyZykge1xuICAgICAgICAgICAgbXNnICs9ICcgWW91IGNhbiB1c2UgYSBzcHJlYWQgdG8gY29udmVydCB0aGlzIGl0ZXJhYmxlIGludG8gYW4gYXJyYXkuJztcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnKTtcbiAgICB9XG59XG5mdW5jdGlvbiB2YWxpZGF0ZV9zbG90cyhuYW1lLCBzbG90LCBrZXlzKSB7XG4gICAgZm9yIChjb25zdCBzbG90X2tleSBvZiBPYmplY3Qua2V5cyhzbG90KSkge1xuICAgICAgICBpZiAoIX5rZXlzLmluZGV4T2Yoc2xvdF9rZXkpKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYDwke25hbWV9PiByZWNlaXZlZCBhbiB1bmV4cGVjdGVkIHNsb3QgXCIke3Nsb3Rfa2V5fVwiLmApO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gdmFsaWRhdGVfZHluYW1pY19lbGVtZW50KHRhZykge1xuICAgIGNvbnN0IGlzX3N0cmluZyA9IHR5cGVvZiB0YWcgPT09ICdzdHJpbmcnO1xuICAgIGlmICh0YWcgJiYgIWlzX3N0cmluZykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJzxzdmVsdGU6ZWxlbWVudD4gZXhwZWN0cyBcInRoaXNcIiBhdHRyaWJ1dGUgdG8gYmUgYSBzdHJpbmcuJyk7XG4gICAgfVxufVxuZnVuY3Rpb24gdmFsaWRhdGVfdm9pZF9keW5hbWljX2VsZW1lbnQodGFnKSB7XG4gICAgaWYgKHRhZyAmJiBpc192b2lkKHRhZykpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGA8c3ZlbHRlOmVsZW1lbnQgdGhpcz1cIiR7dGFnfVwiPiBpcyBzZWxmLWNsb3NpbmcgYW5kIGNhbm5vdCBoYXZlIGNvbnRlbnQuYCk7XG4gICAgfVxufVxuZnVuY3Rpb24gY29uc3RydWN0X3N2ZWx0ZV9jb21wb25lbnRfZGV2KGNvbXBvbmVudCwgcHJvcHMpIHtcbiAgICBjb25zdCBlcnJvcl9tZXNzYWdlID0gJ3RoaXM9ey4uLn0gb2YgPHN2ZWx0ZTpjb21wb25lbnQ+IHNob3VsZCBzcGVjaWZ5IGEgU3ZlbHRlIGNvbXBvbmVudC4nO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IGNvbXBvbmVudChwcm9wcyk7XG4gICAgICAgIGlmICghaW5zdGFuY2UuJCQgfHwgIWluc3RhbmNlLiRzZXQgfHwgIWluc3RhbmNlLiRvbiB8fCAhaW5zdGFuY2UuJGRlc3Ryb3kpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvcl9tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgfVxuICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgeyBtZXNzYWdlIH0gPSBlcnI7XG4gICAgICAgIGlmICh0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycgJiYgbWVzc2FnZS5pbmRleE9mKCdpcyBub3QgYSBjb25zdHJ1Y3RvcicpICE9PSAtMSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yX21lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgfVxufVxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBTdmVsdGUgY29tcG9uZW50cyB3aXRoIHNvbWUgbWlub3IgZGV2LWVuaGFuY2VtZW50cy4gVXNlZCB3aGVuIGRldj10cnVlLlxuICovXG5jbGFzcyBTdmVsdGVDb21wb25lbnREZXYgZXh0ZW5kcyBTdmVsdGVDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKCFvcHRpb25zIHx8ICghb3B0aW9ucy50YXJnZXQgJiYgIW9wdGlvbnMuJCRpbmxpbmUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIndGFyZ2V0JyBpcyBhIHJlcXVpcmVkIG9wdGlvblwiKTtcbiAgICAgICAgfVxuICAgICAgICBzdXBlcigpO1xuICAgIH1cbiAgICAkZGVzdHJveSgpIHtcbiAgICAgICAgc3VwZXIuJGRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy4kZGVzdHJveSA9ICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignQ29tcG9uZW50IHdhcyBhbHJlYWR5IGRlc3Ryb3llZCcpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgfTtcbiAgICB9XG4gICAgJGNhcHR1cmVfc3RhdGUoKSB7IH1cbiAgICAkaW5qZWN0X3N0YXRlKCkgeyB9XG59XG4vKipcbiAqIEJhc2UgY2xhc3MgdG8gY3JlYXRlIHN0cm9uZ2x5IHR5cGVkIFN2ZWx0ZSBjb21wb25lbnRzLlxuICogVGhpcyBvbmx5IGV4aXN0cyBmb3IgdHlwaW5nIHB1cnBvc2VzIGFuZCBzaG91bGQgYmUgdXNlZCBpbiBgLmQudHNgIGZpbGVzLlxuICpcbiAqICMjIyBFeGFtcGxlOlxuICpcbiAqIFlvdSBoYXZlIGNvbXBvbmVudCBsaWJyYXJ5IG9uIG5wbSBjYWxsZWQgYGNvbXBvbmVudC1saWJyYXJ5YCwgZnJvbSB3aGljaFxuICogeW91IGV4cG9ydCBhIGNvbXBvbmVudCBjYWxsZWQgYE15Q29tcG9uZW50YC4gRm9yIFN2ZWx0ZStUeXBlU2NyaXB0IHVzZXJzLFxuICogeW91IHdhbnQgdG8gcHJvdmlkZSB0eXBpbmdzLiBUaGVyZWZvcmUgeW91IGNyZWF0ZSBhIGBpbmRleC5kLnRzYDpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBTdmVsdGVDb21wb25lbnRUeXBlZCB9IGZyb20gXCJzdmVsdGVcIjtcbiAqIGV4cG9ydCBjbGFzcyBNeUNvbXBvbmVudCBleHRlbmRzIFN2ZWx0ZUNvbXBvbmVudFR5cGVkPHtmb286IHN0cmluZ30+IHt9XG4gKiBgYGBcbiAqIFR5cGluZyB0aGlzIG1ha2VzIGl0IHBvc3NpYmxlIGZvciBJREVzIGxpa2UgVlMgQ29kZSB3aXRoIHRoZSBTdmVsdGUgZXh0ZW5zaW9uXG4gKiB0byBwcm92aWRlIGludGVsbGlzZW5zZSBhbmQgdG8gdXNlIHRoZSBjb21wb25lbnQgbGlrZSB0aGlzIGluIGEgU3ZlbHRlIGZpbGVcbiAqIHdpdGggVHlwZVNjcmlwdDpcbiAqIGBgYHN2ZWx0ZVxuICogPHNjcmlwdCBsYW5nPVwidHNcIj5cbiAqIFx0aW1wb3J0IHsgTXlDb21wb25lbnQgfSBmcm9tIFwiY29tcG9uZW50LWxpYnJhcnlcIjtcbiAqIDwvc2NyaXB0PlxuICogPE15Q29tcG9uZW50IGZvbz17J2Jhcid9IC8+XG4gKiBgYGBcbiAqXG4gKiAjIyMjIFdoeSBub3QgbWFrZSB0aGlzIHBhcnQgb2YgYFN2ZWx0ZUNvbXBvbmVudChEZXYpYD9cbiAqIEJlY2F1c2VcbiAqIGBgYHRzXG4gKiBjbGFzcyBBU3ViY2xhc3NPZlN2ZWx0ZUNvbXBvbmVudCBleHRlbmRzIFN2ZWx0ZUNvbXBvbmVudDx7Zm9vOiBzdHJpbmd9PiB7fVxuICogY29uc3QgY29tcG9uZW50OiB0eXBlb2YgU3ZlbHRlQ29tcG9uZW50ID0gQVN1YmNsYXNzT2ZTdmVsdGVDb21wb25lbnQ7XG4gKiBgYGBcbiAqIHdpbGwgdGhyb3cgYSB0eXBlIGVycm9yLCBzbyB3ZSBuZWVkIHRvIHNlcGFyYXRlIHRoZSBtb3JlIHN0cmljdGx5IHR5cGVkIGNsYXNzLlxuICovXG5jbGFzcyBTdmVsdGVDb21wb25lbnRUeXBlZCBleHRlbmRzIFN2ZWx0ZUNvbXBvbmVudERldiB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICBzdXBlcihvcHRpb25zKTtcbiAgICB9XG59XG5mdW5jdGlvbiBsb29wX2d1YXJkKHRpbWVvdXQpIHtcbiAgICBjb25zdCBzdGFydCA9IERhdGUubm93KCk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgaWYgKERhdGUubm93KCkgLSBzdGFydCA+IHRpbWVvdXQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW5maW5pdGUgbG9vcCBkZXRlY3RlZCcpO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZXhwb3J0IHsgSHRtbFRhZywgSHRtbFRhZ0h5ZHJhdGlvbiwgUmVzaXplT2JzZXJ2ZXJTaW5nbGV0b24sIFN2ZWx0ZUNvbXBvbmVudCwgU3ZlbHRlQ29tcG9uZW50RGV2LCBTdmVsdGVDb21wb25lbnRUeXBlZCwgU3ZlbHRlRWxlbWVudCwgYWN0aW9uX2Rlc3Ryb3llciwgYWRkX2F0dHJpYnV0ZSwgYWRkX2NsYXNzZXMsIGFkZF9mbHVzaF9jYWxsYmFjaywgYWRkX2lmcmFtZV9yZXNpemVfbGlzdGVuZXIsIGFkZF9sb2NhdGlvbiwgYWRkX3JlbmRlcl9jYWxsYmFjaywgYWRkX3N0eWxlcywgYWRkX3RyYW5zZm9ybSwgYWZ0ZXJVcGRhdGUsIGFwcGVuZCwgYXBwZW5kX2RldiwgYXBwZW5kX2VtcHR5X3N0eWxlc2hlZXQsIGFwcGVuZF9oeWRyYXRpb24sIGFwcGVuZF9oeWRyYXRpb25fZGV2LCBhcHBlbmRfc3R5bGVzLCBhc3NpZ24sIGF0dHIsIGF0dHJfZGV2LCBhdHRyaWJ1dGVfdG9fb2JqZWN0LCBiZWZvcmVVcGRhdGUsIGJpbmQsIGJpbmRpbmdfY2FsbGJhY2tzLCBibGFua19vYmplY3QsIGJ1YmJsZSwgY2hlY2tfb3V0cm9zLCBjaGlsZHJlbiwgY2xhaW1fY29tbWVudCwgY2xhaW1fY29tcG9uZW50LCBjbGFpbV9lbGVtZW50LCBjbGFpbV9odG1sX3RhZywgY2xhaW1fc3BhY2UsIGNsYWltX3N2Z19lbGVtZW50LCBjbGFpbV90ZXh0LCBjbGVhcl9sb29wcywgY29tbWVudCwgY29tcG9uZW50X3N1YnNjcmliZSwgY29tcHV0ZV9yZXN0X3Byb3BzLCBjb21wdXRlX3Nsb3RzLCBjb25zdHJ1Y3Rfc3ZlbHRlX2NvbXBvbmVudCwgY29uc3RydWN0X3N2ZWx0ZV9jb21wb25lbnRfZGV2LCBjb250ZW50ZWRpdGFibGVfdHJ1dGh5X3ZhbHVlcywgY3JlYXRlRXZlbnREaXNwYXRjaGVyLCBjcmVhdGVfYW5pbWF0aW9uLCBjcmVhdGVfYmlkaXJlY3Rpb25hbF90cmFuc2l0aW9uLCBjcmVhdGVfY29tcG9uZW50LCBjcmVhdGVfaW5fdHJhbnNpdGlvbiwgY3JlYXRlX291dF90cmFuc2l0aW9uLCBjcmVhdGVfc2xvdCwgY3JlYXRlX3Nzcl9jb21wb25lbnQsIGN1cnJlbnRfY29tcG9uZW50LCBjdXN0b21fZXZlbnQsIGRhdGFzZXRfZGV2LCBkZWJ1ZywgZGVzdHJveV9ibG9jaywgZGVzdHJveV9jb21wb25lbnQsIGRlc3Ryb3lfZWFjaCwgZGV0YWNoLCBkZXRhY2hfYWZ0ZXJfZGV2LCBkZXRhY2hfYmVmb3JlX2RldiwgZGV0YWNoX2JldHdlZW5fZGV2LCBkZXRhY2hfZGV2LCBkaXJ0eV9jb21wb25lbnRzLCBkaXNwYXRjaF9kZXYsIGVhY2gsIGVsZW1lbnQsIGVsZW1lbnRfaXMsIGVtcHR5LCBlbmRfaHlkcmF0aW5nLCBlc2NhcGUsIGVzY2FwZV9hdHRyaWJ1dGVfdmFsdWUsIGVzY2FwZV9vYmplY3QsIGV4Y2x1ZGVfaW50ZXJuYWxfcHJvcHMsIGZpeF9hbmRfZGVzdHJveV9ibG9jaywgZml4X2FuZF9vdXRyb19hbmRfZGVzdHJveV9ibG9jaywgZml4X3Bvc2l0aW9uLCBmbHVzaCwgZmx1c2hfcmVuZGVyX2NhbGxiYWNrcywgZ2V0QWxsQ29udGV4dHMsIGdldENvbnRleHQsIGdldF9hbGxfZGlydHlfZnJvbV9zY29wZSwgZ2V0X2JpbmRpbmdfZ3JvdXBfdmFsdWUsIGdldF9jdXJyZW50X2NvbXBvbmVudCwgZ2V0X2N1c3RvbV9lbGVtZW50c19zbG90cywgZ2V0X3Jvb3RfZm9yX3N0eWxlLCBnZXRfc2xvdF9jaGFuZ2VzLCBnZXRfc3ByZWFkX29iamVjdCwgZ2V0X3NwcmVhZF91cGRhdGUsIGdldF9zdG9yZV92YWx1ZSwgZ2xvYmFscywgZ3JvdXBfb3V0cm9zLCBoYW5kbGVfcHJvbWlzZSwgaGFzQ29udGV4dCwgaGFzX3Byb3AsIGhlYWRfc2VsZWN0b3IsIGlkZW50aXR5LCBpbml0LCBpbml0X2JpbmRpbmdfZ3JvdXAsIGluaXRfYmluZGluZ19ncm91cF9keW5hbWljLCBpbnNlcnQsIGluc2VydF9kZXYsIGluc2VydF9oeWRyYXRpb24sIGluc2VydF9oeWRyYXRpb25fZGV2LCBpbnRyb3MsIGludmFsaWRfYXR0cmlidXRlX25hbWVfY2hhcmFjdGVyLCBpc19jbGllbnQsIGlzX2Nyb3Nzb3JpZ2luLCBpc19lbXB0eSwgaXNfZnVuY3Rpb24sIGlzX3Byb21pc2UsIGlzX3ZvaWQsIGxpc3RlbiwgbGlzdGVuX2RldiwgbG9vcCwgbG9vcF9ndWFyZCwgbWVyZ2Vfc3NyX3N0eWxlcywgbWlzc2luZ19jb21wb25lbnQsIG1vdW50X2NvbXBvbmVudCwgbm9vcCwgbm90X2VxdWFsLCBub3csIG51bGxfdG9fZW1wdHksIG9iamVjdF93aXRob3V0X3Byb3BlcnRpZXMsIG9uRGVzdHJveSwgb25Nb3VudCwgb25jZSwgb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2ssIHByZXZlbnRfZGVmYXVsdCwgcHJvcF9kZXYsIHF1ZXJ5X3NlbGVjdG9yX2FsbCwgcmFmLCByZXNpemVfb2JzZXJ2ZXJfYm9yZGVyX2JveCwgcmVzaXplX29ic2VydmVyX2NvbnRlbnRfYm94LCByZXNpemVfb2JzZXJ2ZXJfZGV2aWNlX3BpeGVsX2NvbnRlbnRfYm94LCBydW4sIHJ1bl9hbGwsIHNhZmVfbm90X2VxdWFsLCBzY2hlZHVsZV91cGRhdGUsIHNlbGVjdF9tdWx0aXBsZV92YWx1ZSwgc2VsZWN0X29wdGlvbiwgc2VsZWN0X29wdGlvbnMsIHNlbGVjdF92YWx1ZSwgc2VsZiwgc2V0Q29udGV4dCwgc2V0X2F0dHJpYnV0ZXMsIHNldF9jdXJyZW50X2NvbXBvbmVudCwgc2V0X2N1c3RvbV9lbGVtZW50X2RhdGEsIHNldF9jdXN0b21fZWxlbWVudF9kYXRhX21hcCwgc2V0X2RhdGEsIHNldF9kYXRhX2NvbnRlbnRlZGl0YWJsZSwgc2V0X2RhdGFfY29udGVudGVkaXRhYmxlX2Rldiwgc2V0X2RhdGFfZGV2LCBzZXRfZGF0YV9tYXliZV9jb250ZW50ZWRpdGFibGUsIHNldF9kYXRhX21heWJlX2NvbnRlbnRlZGl0YWJsZV9kZXYsIHNldF9keW5hbWljX2VsZW1lbnRfZGF0YSwgc2V0X2lucHV0X3R5cGUsIHNldF9pbnB1dF92YWx1ZSwgc2V0X25vdywgc2V0X3JhZiwgc2V0X3N0b3JlX3ZhbHVlLCBzZXRfc3R5bGUsIHNldF9zdmdfYXR0cmlidXRlcywgc3BhY2UsIHNwbGl0X2Nzc191bml0LCBzcHJlYWQsIHNyY191cmxfZXF1YWwsIHN0YXJ0X2h5ZHJhdGluZywgc3RvcF9pbW1lZGlhdGVfcHJvcGFnYXRpb24sIHN0b3BfcHJvcGFnYXRpb24sIHN1YnNjcmliZSwgc3ZnX2VsZW1lbnQsIHRleHQsIHRpY2ssIHRpbWVfcmFuZ2VzX3RvX2FycmF5LCB0b19udW1iZXIsIHRvZ2dsZV9jbGFzcywgdHJhbnNpdGlvbl9pbiwgdHJhbnNpdGlvbl9vdXQsIHRydXN0ZWQsIHVwZGF0ZV9hd2FpdF9ibG9ja19icmFuY2gsIHVwZGF0ZV9rZXllZF9lYWNoLCB1cGRhdGVfc2xvdCwgdXBkYXRlX3Nsb3RfYmFzZSwgdmFsaWRhdGVfY29tcG9uZW50LCB2YWxpZGF0ZV9keW5hbWljX2VsZW1lbnQsIHZhbGlkYXRlX2VhY2hfYXJndW1lbnQsIHZhbGlkYXRlX2VhY2hfa2V5cywgdmFsaWRhdGVfc2xvdHMsIHZhbGlkYXRlX3N0b3JlLCB2YWxpZGF0ZV92b2lkX2R5bmFtaWNfZWxlbWVudCwgeGxpbmtfYXR0ciB9O1xuIiwiZXhwb3J0IHsgaWRlbnRpdHkgYXMgbGluZWFyIH0gZnJvbSAnLi4vaW50ZXJuYWwvaW5kZXgubWpzJztcblxuLypcbkFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbWF0dGRlc2xcbkRpc3RyaWJ1dGVkIHVuZGVyIE1JVCBMaWNlbnNlIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXR0ZGVzbC9lYXNlcy9ibG9iL21hc3Rlci9MSUNFTlNFLm1kXG4qL1xuZnVuY3Rpb24gYmFja0luT3V0KHQpIHtcbiAgICBjb25zdCBzID0gMS43MDE1OCAqIDEuNTI1O1xuICAgIGlmICgodCAqPSAyKSA8IDEpXG4gICAgICAgIHJldHVybiAwLjUgKiAodCAqIHQgKiAoKHMgKyAxKSAqIHQgLSBzKSk7XG4gICAgcmV0dXJuIDAuNSAqICgodCAtPSAyKSAqIHQgKiAoKHMgKyAxKSAqIHQgKyBzKSArIDIpO1xufVxuZnVuY3Rpb24gYmFja0luKHQpIHtcbiAgICBjb25zdCBzID0gMS43MDE1ODtcbiAgICByZXR1cm4gdCAqIHQgKiAoKHMgKyAxKSAqIHQgLSBzKTtcbn1cbmZ1bmN0aW9uIGJhY2tPdXQodCkge1xuICAgIGNvbnN0IHMgPSAxLjcwMTU4O1xuICAgIHJldHVybiAtLXQgKiB0ICogKChzICsgMSkgKiB0ICsgcykgKyAxO1xufVxuZnVuY3Rpb24gYm91bmNlT3V0KHQpIHtcbiAgICBjb25zdCBhID0gNC4wIC8gMTEuMDtcbiAgICBjb25zdCBiID0gOC4wIC8gMTEuMDtcbiAgICBjb25zdCBjID0gOS4wIC8gMTAuMDtcbiAgICBjb25zdCBjYSA9IDQzNTYuMCAvIDM2MS4wO1xuICAgIGNvbnN0IGNiID0gMzU0NDIuMCAvIDE4MDUuMDtcbiAgICBjb25zdCBjYyA9IDE2MDYxLjAgLyAxODA1LjA7XG4gICAgY29uc3QgdDIgPSB0ICogdDtcbiAgICByZXR1cm4gdCA8IGFcbiAgICAgICAgPyA3LjU2MjUgKiB0MlxuICAgICAgICA6IHQgPCBiXG4gICAgICAgICAgICA/IDkuMDc1ICogdDIgLSA5LjkgKiB0ICsgMy40XG4gICAgICAgICAgICA6IHQgPCBjXG4gICAgICAgICAgICAgICAgPyBjYSAqIHQyIC0gY2IgKiB0ICsgY2NcbiAgICAgICAgICAgICAgICA6IDEwLjggKiB0ICogdCAtIDIwLjUyICogdCArIDEwLjcyO1xufVxuZnVuY3Rpb24gYm91bmNlSW5PdXQodCkge1xuICAgIHJldHVybiB0IDwgMC41XG4gICAgICAgID8gMC41ICogKDEuMCAtIGJvdW5jZU91dCgxLjAgLSB0ICogMi4wKSlcbiAgICAgICAgOiAwLjUgKiBib3VuY2VPdXQodCAqIDIuMCAtIDEuMCkgKyAwLjU7XG59XG5mdW5jdGlvbiBib3VuY2VJbih0KSB7XG4gICAgcmV0dXJuIDEuMCAtIGJvdW5jZU91dCgxLjAgLSB0KTtcbn1cbmZ1bmN0aW9uIGNpcmNJbk91dCh0KSB7XG4gICAgaWYgKCh0ICo9IDIpIDwgMSlcbiAgICAgICAgcmV0dXJuIC0wLjUgKiAoTWF0aC5zcXJ0KDEgLSB0ICogdCkgLSAxKTtcbiAgICByZXR1cm4gMC41ICogKE1hdGguc3FydCgxIC0gKHQgLT0gMikgKiB0KSArIDEpO1xufVxuZnVuY3Rpb24gY2lyY0luKHQpIHtcbiAgICByZXR1cm4gMS4wIC0gTWF0aC5zcXJ0KDEuMCAtIHQgKiB0KTtcbn1cbmZ1bmN0aW9uIGNpcmNPdXQodCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQoMSAtIC0tdCAqIHQpO1xufVxuZnVuY3Rpb24gY3ViaWNJbk91dCh0KSB7XG4gICAgcmV0dXJuIHQgPCAwLjUgPyA0LjAgKiB0ICogdCAqIHQgOiAwLjUgKiBNYXRoLnBvdygyLjAgKiB0IC0gMi4wLCAzLjApICsgMS4wO1xufVxuZnVuY3Rpb24gY3ViaWNJbih0KSB7XG4gICAgcmV0dXJuIHQgKiB0ICogdDtcbn1cbmZ1bmN0aW9uIGN1YmljT3V0KHQpIHtcbiAgICBjb25zdCBmID0gdCAtIDEuMDtcbiAgICByZXR1cm4gZiAqIGYgKiBmICsgMS4wO1xufVxuZnVuY3Rpb24gZWxhc3RpY0luT3V0KHQpIHtcbiAgICByZXR1cm4gdCA8IDAuNVxuICAgICAgICA/IDAuNSAqXG4gICAgICAgICAgICBNYXRoLnNpbigoKCsxMy4wICogTWF0aC5QSSkgLyAyKSAqIDIuMCAqIHQpICpcbiAgICAgICAgICAgIE1hdGgucG93KDIuMCwgMTAuMCAqICgyLjAgKiB0IC0gMS4wKSlcbiAgICAgICAgOiAwLjUgKlxuICAgICAgICAgICAgTWF0aC5zaW4oKCgtMTMuMCAqIE1hdGguUEkpIC8gMikgKiAoMi4wICogdCAtIDEuMCArIDEuMCkpICpcbiAgICAgICAgICAgIE1hdGgucG93KDIuMCwgLTEwLjAgKiAoMi4wICogdCAtIDEuMCkpICtcbiAgICAgICAgICAgIDEuMDtcbn1cbmZ1bmN0aW9uIGVsYXN0aWNJbih0KSB7XG4gICAgcmV0dXJuIE1hdGguc2luKCgxMy4wICogdCAqIE1hdGguUEkpIC8gMikgKiBNYXRoLnBvdygyLjAsIDEwLjAgKiAodCAtIDEuMCkpO1xufVxuZnVuY3Rpb24gZWxhc3RpY091dCh0KSB7XG4gICAgcmV0dXJuIChNYXRoLnNpbigoLTEzLjAgKiAodCArIDEuMCkgKiBNYXRoLlBJKSAvIDIpICogTWF0aC5wb3coMi4wLCAtMTAuMCAqIHQpICsgMS4wKTtcbn1cbmZ1bmN0aW9uIGV4cG9Jbk91dCh0KSB7XG4gICAgcmV0dXJuIHQgPT09IDAuMCB8fCB0ID09PSAxLjBcbiAgICAgICAgPyB0XG4gICAgICAgIDogdCA8IDAuNVxuICAgICAgICAgICAgPyArMC41ICogTWF0aC5wb3coMi4wLCAyMC4wICogdCAtIDEwLjApXG4gICAgICAgICAgICA6IC0wLjUgKiBNYXRoLnBvdygyLjAsIDEwLjAgLSB0ICogMjAuMCkgKyAxLjA7XG59XG5mdW5jdGlvbiBleHBvSW4odCkge1xuICAgIHJldHVybiB0ID09PSAwLjAgPyB0IDogTWF0aC5wb3coMi4wLCAxMC4wICogKHQgLSAxLjApKTtcbn1cbmZ1bmN0aW9uIGV4cG9PdXQodCkge1xuICAgIHJldHVybiB0ID09PSAxLjAgPyB0IDogMS4wIC0gTWF0aC5wb3coMi4wLCAtMTAuMCAqIHQpO1xufVxuZnVuY3Rpb24gcXVhZEluT3V0KHQpIHtcbiAgICB0IC89IDAuNTtcbiAgICBpZiAodCA8IDEpXG4gICAgICAgIHJldHVybiAwLjUgKiB0ICogdDtcbiAgICB0LS07XG4gICAgcmV0dXJuIC0wLjUgKiAodCAqICh0IC0gMikgLSAxKTtcbn1cbmZ1bmN0aW9uIHF1YWRJbih0KSB7XG4gICAgcmV0dXJuIHQgKiB0O1xufVxuZnVuY3Rpb24gcXVhZE91dCh0KSB7XG4gICAgcmV0dXJuIC10ICogKHQgLSAyLjApO1xufVxuZnVuY3Rpb24gcXVhcnRJbk91dCh0KSB7XG4gICAgcmV0dXJuIHQgPCAwLjVcbiAgICAgICAgPyArOC4wICogTWF0aC5wb3codCwgNC4wKVxuICAgICAgICA6IC04LjAgKiBNYXRoLnBvdyh0IC0gMS4wLCA0LjApICsgMS4wO1xufVxuZnVuY3Rpb24gcXVhcnRJbih0KSB7XG4gICAgcmV0dXJuIE1hdGgucG93KHQsIDQuMCk7XG59XG5mdW5jdGlvbiBxdWFydE91dCh0KSB7XG4gICAgcmV0dXJuIE1hdGgucG93KHQgLSAxLjAsIDMuMCkgKiAoMS4wIC0gdCkgKyAxLjA7XG59XG5mdW5jdGlvbiBxdWludEluT3V0KHQpIHtcbiAgICBpZiAoKHQgKj0gMikgPCAxKVxuICAgICAgICByZXR1cm4gMC41ICogdCAqIHQgKiB0ICogdCAqIHQ7XG4gICAgcmV0dXJuIDAuNSAqICgodCAtPSAyKSAqIHQgKiB0ICogdCAqIHQgKyAyKTtcbn1cbmZ1bmN0aW9uIHF1aW50SW4odCkge1xuICAgIHJldHVybiB0ICogdCAqIHQgKiB0ICogdDtcbn1cbmZ1bmN0aW9uIHF1aW50T3V0KHQpIHtcbiAgICByZXR1cm4gLS10ICogdCAqIHQgKiB0ICogdCArIDE7XG59XG5mdW5jdGlvbiBzaW5lSW5PdXQodCkge1xuICAgIHJldHVybiAtMC41ICogKE1hdGguY29zKE1hdGguUEkgKiB0KSAtIDEpO1xufVxuZnVuY3Rpb24gc2luZUluKHQpIHtcbiAgICBjb25zdCB2ID0gTWF0aC5jb3ModCAqIE1hdGguUEkgKiAwLjUpO1xuICAgIGlmIChNYXRoLmFicyh2KSA8IDFlLTE0KVxuICAgICAgICByZXR1cm4gMTtcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiAxIC0gdjtcbn1cbmZ1bmN0aW9uIHNpbmVPdXQodCkge1xuICAgIHJldHVybiBNYXRoLnNpbigodCAqIE1hdGguUEkpIC8gMik7XG59XG5cbmV4cG9ydCB7IGJhY2tJbiwgYmFja0luT3V0LCBiYWNrT3V0LCBib3VuY2VJbiwgYm91bmNlSW5PdXQsIGJvdW5jZU91dCwgY2lyY0luLCBjaXJjSW5PdXQsIGNpcmNPdXQsIGN1YmljSW4sIGN1YmljSW5PdXQsIGN1YmljT3V0LCBlbGFzdGljSW4sIGVsYXN0aWNJbk91dCwgZWxhc3RpY091dCwgZXhwb0luLCBleHBvSW5PdXQsIGV4cG9PdXQsIHF1YWRJbiwgcXVhZEluT3V0LCBxdWFkT3V0LCBxdWFydEluLCBxdWFydEluT3V0LCBxdWFydE91dCwgcXVpbnRJbiwgcXVpbnRJbk91dCwgcXVpbnRPdXQsIHNpbmVJbiwgc2luZUluT3V0LCBzaW5lT3V0IH07XG4iLCJpbXBvcnQgeyBjdWJpY0luT3V0LCBsaW5lYXIsIGN1YmljT3V0IH0gZnJvbSAnLi4vZWFzaW5nL2luZGV4Lm1qcyc7XG5pbXBvcnQgeyBzcGxpdF9jc3NfdW5pdCwgaXNfZnVuY3Rpb24sIGFzc2lnbiB9IGZyb20gJy4uL2ludGVybmFsL2luZGV4Lm1qcyc7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcclxuQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXHJcblxyXG5QZXJtaXNzaW9uIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBhbmQvb3IgZGlzdHJpYnV0ZSB0aGlzIHNvZnR3YXJlIGZvciBhbnlcclxucHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLlxyXG5cclxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiBBTkQgVEhFIEFVVEhPUiBESVNDTEFJTVMgQUxMIFdBUlJBTlRJRVMgV0lUSFxyXG5SRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFlcclxuQU5EIEZJVE5FU1MuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1IgQkUgTElBQkxFIEZPUiBBTlkgU1BFQ0lBTCwgRElSRUNULFxyXG5JTkRJUkVDVCwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIE9SIEFOWSBEQU1BR0VTIFdIQVRTT0VWRVIgUkVTVUxUSU5HIEZST01cclxuTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1JcclxuT1RIRVIgVE9SVElPVVMgQUNUSU9OLCBBUklTSU5HIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFVTRSBPUlxyXG5QRVJGT1JNQU5DRSBPRiBUSElTIFNPRlRXQVJFLlxyXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL1xyXG5cclxuZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XG5cbmZ1bmN0aW9uIGJsdXIobm9kZSwgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gNDAwLCBlYXNpbmcgPSBjdWJpY0luT3V0LCBhbW91bnQgPSA1LCBvcGFjaXR5ID0gMCB9ID0ge30pIHtcbiAgICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgY29uc3QgdGFyZ2V0X29wYWNpdHkgPSArc3R5bGUub3BhY2l0eTtcbiAgICBjb25zdCBmID0gc3R5bGUuZmlsdGVyID09PSAnbm9uZScgPyAnJyA6IHN0eWxlLmZpbHRlcjtcbiAgICBjb25zdCBvZCA9IHRhcmdldF9vcGFjaXR5ICogKDEgLSBvcGFjaXR5KTtcbiAgICBjb25zdCBbdmFsdWUsIHVuaXRdID0gc3BsaXRfY3NzX3VuaXQoYW1vdW50KTtcbiAgICByZXR1cm4ge1xuICAgICAgICBkZWxheSxcbiAgICAgICAgZHVyYXRpb24sXG4gICAgICAgIGVhc2luZyxcbiAgICAgICAgY3NzOiAoX3QsIHUpID0+IGBvcGFjaXR5OiAke3RhcmdldF9vcGFjaXR5IC0gKG9kICogdSl9OyBmaWx0ZXI6ICR7Zn0gYmx1cigke3UgKiB2YWx1ZX0ke3VuaXR9KTtgXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGZhZGUobm9kZSwgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gNDAwLCBlYXNpbmcgPSBsaW5lYXIgfSA9IHt9KSB7XG4gICAgY29uc3QgbyA9ICtnZXRDb21wdXRlZFN0eWxlKG5vZGUpLm9wYWNpdHk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVsYXksXG4gICAgICAgIGR1cmF0aW9uLFxuICAgICAgICBlYXNpbmcsXG4gICAgICAgIGNzczogdCA9PiBgb3BhY2l0eTogJHt0ICogb31gXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGZseShub2RlLCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSA0MDAsIGVhc2luZyA9IGN1YmljT3V0LCB4ID0gMCwgeSA9IDAsIG9wYWNpdHkgPSAwIH0gPSB7fSkge1xuICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICBjb25zdCB0YXJnZXRfb3BhY2l0eSA9ICtzdHlsZS5vcGFjaXR5O1xuICAgIGNvbnN0IHRyYW5zZm9ybSA9IHN0eWxlLnRyYW5zZm9ybSA9PT0gJ25vbmUnID8gJycgOiBzdHlsZS50cmFuc2Zvcm07XG4gICAgY29uc3Qgb2QgPSB0YXJnZXRfb3BhY2l0eSAqICgxIC0gb3BhY2l0eSk7XG4gICAgY29uc3QgW3hWYWx1ZSwgeFVuaXRdID0gc3BsaXRfY3NzX3VuaXQoeCk7XG4gICAgY29uc3QgW3lWYWx1ZSwgeVVuaXRdID0gc3BsaXRfY3NzX3VuaXQoeSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVsYXksXG4gICAgICAgIGR1cmF0aW9uLFxuICAgICAgICBlYXNpbmcsXG4gICAgICAgIGNzczogKHQsIHUpID0+IGBcblx0XHRcdHRyYW5zZm9ybTogJHt0cmFuc2Zvcm19IHRyYW5zbGF0ZSgkeygxIC0gdCkgKiB4VmFsdWV9JHt4VW5pdH0sICR7KDEgLSB0KSAqIHlWYWx1ZX0ke3lVbml0fSk7XG5cdFx0XHRvcGFjaXR5OiAke3RhcmdldF9vcGFjaXR5IC0gKG9kICogdSl9YFxuICAgIH07XG59XG5mdW5jdGlvbiBzbGlkZShub2RlLCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSA0MDAsIGVhc2luZyA9IGN1YmljT3V0LCBheGlzID0gJ3knIH0gPSB7fSkge1xuICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICBjb25zdCBvcGFjaXR5ID0gK3N0eWxlLm9wYWNpdHk7XG4gICAgY29uc3QgcHJpbWFyeV9wcm9wZXJ0eSA9IGF4aXMgPT09ICd5JyA/ICdoZWlnaHQnIDogJ3dpZHRoJztcbiAgICBjb25zdCBwcmltYXJ5X3Byb3BlcnR5X3ZhbHVlID0gcGFyc2VGbG9hdChzdHlsZVtwcmltYXJ5X3Byb3BlcnR5XSk7XG4gICAgY29uc3Qgc2Vjb25kYXJ5X3Byb3BlcnRpZXMgPSBheGlzID09PSAneScgPyBbJ3RvcCcsICdib3R0b20nXSA6IFsnbGVmdCcsICdyaWdodCddO1xuICAgIGNvbnN0IGNhcGl0YWxpemVkX3NlY29uZGFyeV9wcm9wZXJ0aWVzID0gc2Vjb25kYXJ5X3Byb3BlcnRpZXMubWFwKChlKSA9PiBgJHtlWzBdLnRvVXBwZXJDYXNlKCl9JHtlLnNsaWNlKDEpfWApO1xuICAgIGNvbnN0IHBhZGRpbmdfc3RhcnRfdmFsdWUgPSBwYXJzZUZsb2F0KHN0eWxlW2BwYWRkaW5nJHtjYXBpdGFsaXplZF9zZWNvbmRhcnlfcHJvcGVydGllc1swXX1gXSk7XG4gICAgY29uc3QgcGFkZGluZ19lbmRfdmFsdWUgPSBwYXJzZUZsb2F0KHN0eWxlW2BwYWRkaW5nJHtjYXBpdGFsaXplZF9zZWNvbmRhcnlfcHJvcGVydGllc1sxXX1gXSk7XG4gICAgY29uc3QgbWFyZ2luX3N0YXJ0X3ZhbHVlID0gcGFyc2VGbG9hdChzdHlsZVtgbWFyZ2luJHtjYXBpdGFsaXplZF9zZWNvbmRhcnlfcHJvcGVydGllc1swXX1gXSk7XG4gICAgY29uc3QgbWFyZ2luX2VuZF92YWx1ZSA9IHBhcnNlRmxvYXQoc3R5bGVbYG1hcmdpbiR7Y2FwaXRhbGl6ZWRfc2Vjb25kYXJ5X3Byb3BlcnRpZXNbMV19YF0pO1xuICAgIGNvbnN0IGJvcmRlcl93aWR0aF9zdGFydF92YWx1ZSA9IHBhcnNlRmxvYXQoc3R5bGVbYGJvcmRlciR7Y2FwaXRhbGl6ZWRfc2Vjb25kYXJ5X3Byb3BlcnRpZXNbMF19V2lkdGhgXSk7XG4gICAgY29uc3QgYm9yZGVyX3dpZHRoX2VuZF92YWx1ZSA9IHBhcnNlRmxvYXQoc3R5bGVbYGJvcmRlciR7Y2FwaXRhbGl6ZWRfc2Vjb25kYXJ5X3Byb3BlcnRpZXNbMV19V2lkdGhgXSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVsYXksXG4gICAgICAgIGR1cmF0aW9uLFxuICAgICAgICBlYXNpbmcsXG4gICAgICAgIGNzczogdCA9PiAnb3ZlcmZsb3c6IGhpZGRlbjsnICtcbiAgICAgICAgICAgIGBvcGFjaXR5OiAke01hdGgubWluKHQgKiAyMCwgMSkgKiBvcGFjaXR5fTtgICtcbiAgICAgICAgICAgIGAke3ByaW1hcnlfcHJvcGVydHl9OiAke3QgKiBwcmltYXJ5X3Byb3BlcnR5X3ZhbHVlfXB4O2AgK1xuICAgICAgICAgICAgYHBhZGRpbmctJHtzZWNvbmRhcnlfcHJvcGVydGllc1swXX06ICR7dCAqIHBhZGRpbmdfc3RhcnRfdmFsdWV9cHg7YCArXG4gICAgICAgICAgICBgcGFkZGluZy0ke3NlY29uZGFyeV9wcm9wZXJ0aWVzWzFdfTogJHt0ICogcGFkZGluZ19lbmRfdmFsdWV9cHg7YCArXG4gICAgICAgICAgICBgbWFyZ2luLSR7c2Vjb25kYXJ5X3Byb3BlcnRpZXNbMF19OiAke3QgKiBtYXJnaW5fc3RhcnRfdmFsdWV9cHg7YCArXG4gICAgICAgICAgICBgbWFyZ2luLSR7c2Vjb25kYXJ5X3Byb3BlcnRpZXNbMV19OiAke3QgKiBtYXJnaW5fZW5kX3ZhbHVlfXB4O2AgK1xuICAgICAgICAgICAgYGJvcmRlci0ke3NlY29uZGFyeV9wcm9wZXJ0aWVzWzBdfS13aWR0aDogJHt0ICogYm9yZGVyX3dpZHRoX3N0YXJ0X3ZhbHVlfXB4O2AgK1xuICAgICAgICAgICAgYGJvcmRlci0ke3NlY29uZGFyeV9wcm9wZXJ0aWVzWzFdfS13aWR0aDogJHt0ICogYm9yZGVyX3dpZHRoX2VuZF92YWx1ZX1weDtgXG4gICAgfTtcbn1cbmZ1bmN0aW9uIHNjYWxlKG5vZGUsIHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDQwMCwgZWFzaW5nID0gY3ViaWNPdXQsIHN0YXJ0ID0gMCwgb3BhY2l0eSA9IDAgfSA9IHt9KSB7XG4gICAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUpO1xuICAgIGNvbnN0IHRhcmdldF9vcGFjaXR5ID0gK3N0eWxlLm9wYWNpdHk7XG4gICAgY29uc3QgdHJhbnNmb3JtID0gc3R5bGUudHJhbnNmb3JtID09PSAnbm9uZScgPyAnJyA6IHN0eWxlLnRyYW5zZm9ybTtcbiAgICBjb25zdCBzZCA9IDEgLSBzdGFydDtcbiAgICBjb25zdCBvZCA9IHRhcmdldF9vcGFjaXR5ICogKDEgLSBvcGFjaXR5KTtcbiAgICByZXR1cm4ge1xuICAgICAgICBkZWxheSxcbiAgICAgICAgZHVyYXRpb24sXG4gICAgICAgIGVhc2luZyxcbiAgICAgICAgY3NzOiAoX3QsIHUpID0+IGBcblx0XHRcdHRyYW5zZm9ybTogJHt0cmFuc2Zvcm19IHNjYWxlKCR7MSAtIChzZCAqIHUpfSk7XG5cdFx0XHRvcGFjaXR5OiAke3RhcmdldF9vcGFjaXR5IC0gKG9kICogdSl9XG5cdFx0YFxuICAgIH07XG59XG5mdW5jdGlvbiBkcmF3KG5vZGUsIHsgZGVsYXkgPSAwLCBzcGVlZCwgZHVyYXRpb24sIGVhc2luZyA9IGN1YmljSW5PdXQgfSA9IHt9KSB7XG4gICAgbGV0IGxlbiA9IG5vZGUuZ2V0VG90YWxMZW5ndGgoKTtcbiAgICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgaWYgKHN0eWxlLnN0cm9rZUxpbmVjYXAgIT09ICdidXR0Jykge1xuICAgICAgICBsZW4gKz0gcGFyc2VJbnQoc3R5bGUuc3Ryb2tlV2lkdGgpO1xuICAgIH1cbiAgICBpZiAoZHVyYXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoc3BlZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZHVyYXRpb24gPSA4MDA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkdXJhdGlvbiA9IGxlbiAvIHNwZWVkO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGVvZiBkdXJhdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBkdXJhdGlvbiA9IGR1cmF0aW9uKGxlbik7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGRlbGF5LFxuICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgZWFzaW5nLFxuICAgICAgICBjc3M6IChfLCB1KSA9PiBgXG5cdFx0XHRzdHJva2UtZGFzaGFycmF5OiAke2xlbn07XG5cdFx0XHRzdHJva2UtZGFzaG9mZnNldDogJHt1ICogbGVufTtcblx0XHRgXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGNyb3NzZmFkZShfYSkge1xuICAgIHZhciB7IGZhbGxiYWNrIH0gPSBfYSwgZGVmYXVsdHMgPSBfX3Jlc3QoX2EsIFtcImZhbGxiYWNrXCJdKTtcbiAgICBjb25zdCB0b19yZWNlaXZlID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IHRvX3NlbmQgPSBuZXcgTWFwKCk7XG4gICAgZnVuY3Rpb24gY3Jvc3NmYWRlKGZyb21fbm9kZSwgbm9kZSwgcGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IGQgPT4gTWF0aC5zcXJ0KGQpICogMzAsIGVhc2luZyA9IGN1YmljT3V0IH0gPSBhc3NpZ24oYXNzaWduKHt9LCBkZWZhdWx0cyksIHBhcmFtcyk7XG4gICAgICAgIGNvbnN0IGZyb20gPSBmcm9tX25vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IHRvID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgY29uc3QgZHggPSBmcm9tLmxlZnQgLSB0by5sZWZ0O1xuICAgICAgICBjb25zdCBkeSA9IGZyb20udG9wIC0gdG8udG9wO1xuICAgICAgICBjb25zdCBkdyA9IGZyb20ud2lkdGggLyB0by53aWR0aDtcbiAgICAgICAgY29uc3QgZGggPSBmcm9tLmhlaWdodCAvIHRvLmhlaWdodDtcbiAgICAgICAgY29uc3QgZCA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gICAgICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICAgICAgY29uc3QgdHJhbnNmb3JtID0gc3R5bGUudHJhbnNmb3JtID09PSAnbm9uZScgPyAnJyA6IHN0eWxlLnRyYW5zZm9ybTtcbiAgICAgICAgY29uc3Qgb3BhY2l0eSA9ICtzdHlsZS5vcGFjaXR5O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVsYXksXG4gICAgICAgICAgICBkdXJhdGlvbjogaXNfZnVuY3Rpb24oZHVyYXRpb24pID8gZHVyYXRpb24oZCkgOiBkdXJhdGlvbixcbiAgICAgICAgICAgIGVhc2luZyxcbiAgICAgICAgICAgIGNzczogKHQsIHUpID0+IGBcblx0XHRcdFx0b3BhY2l0eTogJHt0ICogb3BhY2l0eX07XG5cdFx0XHRcdHRyYW5zZm9ybS1vcmlnaW46IHRvcCBsZWZ0O1xuXHRcdFx0XHR0cmFuc2Zvcm06ICR7dHJhbnNmb3JtfSB0cmFuc2xhdGUoJHt1ICogZHh9cHgsJHt1ICogZHl9cHgpIHNjYWxlKCR7dCArICgxIC0gdCkgKiBkd30sICR7dCArICgxIC0gdCkgKiBkaH0pO1xuXHRcdFx0YFxuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiB0cmFuc2l0aW9uKGl0ZW1zLCBjb3VudGVycGFydHMsIGludHJvKSB7XG4gICAgICAgIHJldHVybiAobm9kZSwgcGFyYW1zKSA9PiB7XG4gICAgICAgICAgICBpdGVtcy5zZXQocGFyYW1zLmtleSwgbm9kZSk7XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjb3VudGVycGFydHMuaGFzKHBhcmFtcy5rZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG90aGVyX25vZGUgPSBjb3VudGVycGFydHMuZ2V0KHBhcmFtcy5rZXkpO1xuICAgICAgICAgICAgICAgICAgICBjb3VudGVycGFydHMuZGVsZXRlKHBhcmFtcy5rZXkpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3Jvc3NmYWRlKG90aGVyX25vZGUsIG5vZGUsIHBhcmFtcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGlmIHRoZSBub2RlIGlzIGRpc2FwcGVhcmluZyBhbHRvZ2V0aGVyXG4gICAgICAgICAgICAgICAgLy8gKGkuZS4gd2Fzbid0IGNsYWltZWQgYnkgdGhlIG90aGVyIGxpc3QpXG4gICAgICAgICAgICAgICAgLy8gdGhlbiB3ZSBuZWVkIHRvIHN1cHBseSBhbiBvdXRyb1xuICAgICAgICAgICAgICAgIGl0ZW1zLmRlbGV0ZShwYXJhbXMua2V5KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsbGJhY2sgJiYgZmFsbGJhY2sobm9kZSwgcGFyYW1zLCBpbnRybyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gW1xuICAgICAgICB0cmFuc2l0aW9uKHRvX3NlbmQsIHRvX3JlY2VpdmUsIGZhbHNlKSxcbiAgICAgICAgdHJhbnNpdGlvbih0b19yZWNlaXZlLCB0b19zZW5kLCB0cnVlKVxuICAgIF07XG59XG5cbmV4cG9ydCB7IGJsdXIsIGNyb3NzZmFkZSwgZHJhdywgZmFkZSwgZmx5LCBzY2FsZSwgc2xpZGUgfTtcbiIsIjxzY3JpcHQgbGFuZz1cInRzXCI+XHJcbiAgICBpbXBvcnQgeyBjcmVhdGVFdmVudERpc3BhdGNoZXIgfSBmcm9tIFwic3ZlbHRlXCI7XHJcblxyXG5cdGV4cG9ydCBsZXQgc3BlY2lhbCA9IGZhbHNlO1xyXG5cdGxldCBhY3RpdmU7XHJcblx0ZXhwb3J0IGZ1bmN0aW9uIHNldEFjdGl2ZSggdG8gOiBib29sZWFuKXtcclxuXHRcdGFjdGl2ZSA9IHRvO1xyXG5cdH1cclxuXHRsZXQgZGlzcGF0Y2ggPSBjcmVhdGVFdmVudERpc3BhdGNoZXIoKTtcclxuXHRcclxuXHRmdW5jdGlvbiBvbkNsaWNrKCl7XHJcblx0XHRjb25zb2xlLmxvZygnY2xpY2t5eScpXHJcblx0XHRkaXNwYXRjaCgnY2xpY2snKVxyXG5cdH1cclxuPC9zY3JpcHQ+XHJcbjxkaXYgY2xhc3M9eyBzcGVjaWFsID8gXCJNZW51U0J0blwiIDogXCJNZW51QnRuXCJ9IG9uOmNsaWNrPXtvbkNsaWNrfSBvbjprZXlwcmVzcyBkYXRhLWFjdGl2ZT17YWN0aXZlfSA+XHJcblx0PGRpdiBjbGFzcz1cIk1lbnVCdG5JY29uXCI+XHJcblx0XHRYMlxyXG5cdDwvZGl2PlxyXG5cdDxkaXYgY2xhc3M9XCJNZW51QnRuVGV4dFwiPlxyXG5cdFx0PGg0PkhvbWU8L2g0PlxyXG5cdFx0PHA+QmFzaWMgaW5mb3JtYXRpb24gYW5kIHNldHRpbmdzPC9wPlxyXG5cdDwvZGl2PlxyXG48L2Rpdj4iLCI8c2NyaXB0IGxhbmc9XCJ0c1wiPlxyXG4gICAgaW1wb3J0IHsgY3JlYXRlRXZlbnREaXNwYXRjaGVyLCBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xyXG4gICAgaW1wb3J0IE1lbnVCdG4gZnJvbSBcIi4vTWVudUJ0bi5zdmVsdGVcIjtcclxuICAgIGltcG9ydCB7IG9uIH0gZnJvbSBcImV2ZW50c1wiO1xyXG5cclxuXHRleHBvcnQgbGV0IHJlZ3VsYXJPcHRpb25zIDogc3RyaW5nW10gPSBbXVxyXG5cdGV4cG9ydCBsZXQgc3BlY2lhbE9wdGlvbnMgOiBzdHJpbmdbXSA9IFtdO1xyXG5cdGV4cG9ydCBsZXQgc3RhcnRDaG9zZW4gOiBzdHJpbmcgPSBcIlwiO1xyXG5cdCQ6IG9wdGlvbnMgPSByZWd1bGFyT3B0aW9ucy5jb25jYXQoLi4uc3BlY2lhbE9wdGlvbnMpO1xyXG5cdGxldCBkaXNwYXRjaCA9IGNyZWF0ZUV2ZW50RGlzcGF0Y2hlcigpO1xyXG5cdFxyXG5cdFxyXG5cdGxldCBidG5BcnIgOiBNZW51QnRuW10gPSBbXTtcclxuXHRsZXQgY2hvc2VuIDogTWVudUJ0biB8IG51bGwgPSBudWxsO1xyXG5cdGZ1bmN0aW9uIG9uQnRuQ2xpY2soIGkgKXtcclxuXHRcdGNvbnN0IGJ0biA9IGJ0bkFycltpXTtcclxuXHRcdGlmKGJ0biA9PSBjaG9zZW4pe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0aWYoY2hvc2VuKVxyXG5cdFx0Y2hvc2VuLnNldEFjdGl2ZShmYWxzZSlcclxuXHRcdGJ0bi5zZXRBY3RpdmUodHJ1ZSk7XHJcblx0XHRjaG9zZW4gPSBidG47XHJcblx0XHRkaXNwYXRjaCgnY2hhbmdlUGFnZScsIG9wdGlvbnNbaV0pO1xyXG5cdH1cclxuIFxyXG5cdG9uTW91bnQoKCk9PntcclxuXHRcdGxldCBpID0gb3B0aW9ucy5maW5kSW5kZXgoIHAgPT4gcCA9PSBzdGFydENob3NlbiApO1xyXG5cdFx0aWYoaSAhPSAtMSl7XHJcblx0XHRcdG9uQnRuQ2xpY2soaSk7XHJcblx0XHR9XHJcblx0fSlcclxuPC9zY3JpcHQ+XHJcbjxkaXYgY2xhc3M9XCJNZW51XCIgPlxyXG5cdDxkaXYgY2xhc3M9XCJNZW51VGl0bGVcIj5cclxuXHRcdFRUUlBHIFBhZ2UgTWVudVxyXG5cdDwvZGl2PlxyXG5cdDxzZWN0aW9uIGNsYXNzPVwiTWVudUJ0bkNvbnRhaW5lclwiID5cclxuXHRcdHsjZWFjaCBvcHRpb25zIGFzIG9wdCxpIH1cclxuXHRcdFx0PE1lbnVCdG4gXHJcblx0XHRcdFx0c3BlY2lhbD17c3BlY2lhbE9wdGlvbnMuaW5jbHVkZXMob3B0KX1cclxuXHRcdFx0XHRiaW5kOnRoaXM9e2J0bkFycltpXX1cclxuXHRcdFx0XHRvbjpjbGljaz17KCkgPT4gb25CdG5DbGljayhpKX1cclxuXHRcdFx0Lz5cdFxyXG5cdFx0ey9lYWNofVxyXG5cdDwvc2VjdGlvbj5cclxuPC9kaXY+IiwiPGRpdiBjbGFzcz1cIk1haW5BcHBDb250YWluZXJQYWdlXCI+XHJcblx0PHNlY3Rpb24gY2xhc3M9XCJNYWluQXBwQ29udGFpbmVyUGFnZVRleHRJbWFnZVNlY3Rpb25cIj5cclxuXHRcdDxkaXY+XHJcblx0XHRcdDxwcmU+XHJcblx0XHRcdFx0R3JvYmF4JyBUVFJQRy5cclxuXHRcdFx0XHRNYWtlIGEgYGBgVFRSUEcgYGBgIGJsb2NrIGluIGFuIGFydGljbGUuIHRoZW4geW91IGdldCB0byBzZXR1cCB5b3VyIGJsb2NrLlxyXG5cdFx0XHRcdGNob29zaW5nIGEgc3lzdGVtLCBhbmQgdGhlbiBhIFVJIGZvciB0aGF0IHN5c3RlbS5cclxuXHJcblx0XHRcdFx0VGhlcmUgYXJlIGEgc3RhbmRhcmQgTGF5b3V0cywgYnV0IHlvdSBhcmUgYWJsZSB0byB1c2UgZWRpdGluZyBzeXN0ZW1zIHRvIGNoYW5nZSB0aGUgbGF5b3V0LFxyXG5cdFx0XHRcdFlvdSBjYW4gdXNlIHRoZSBFZGl0IGJ1dHRvbiB0byBjaGFuZ2Ugc2luZ2xlIHZpZXcgc2V0dGluZ3MuXHJcblx0XHRcdFx0VGhlIGxheW91dCBpcyBtYWRlIHVwIG9mIHJvd3MsIHRoZW4gY29sdW1ucywgdGhlbiBpdGVtcyBpbiByb3dzLlxyXG5cdFx0XHRcdFlvdSBjYW4gdXNlIGVkaXQgcm93cyB0byBhZGQsIGRlbGV0ZSBhbmQgc3dpdGNoIHRoZSBwbGFjaW5nIG9mIHRoZXNlIHJvd3MgYWxvbmcgd2l0aCB0aGVpciBjb250ZW50cy5cclxuXHJcblx0XHRcdFx0WW91IGNhbiB1c2UgZWRpdCBjb2x1bW5zIHRvIGFkZCwgZGVsZXRlIGFuZCBzd2l0Y2ggcGxhY2VzIG9mIGNvbHVtbnMgYW5kIHRoZWlyIGl0ZW1zLiBcclxuXHJcblx0XHRcdFx0WW91IGNhbiB1c2UgZWRpdCBJdGVtcyB0byBhZGQsIGRlbGV0ZSBpdGVtcyBpbiB0aGUgY29sdW1ucywgeW91IGNhbiBhbHNvIGFzaWduIGFuIGl0ZW0gYSB2aWV3LCBhcyB3ZWxsIGFzIGRyYWcgdGhlbSBpbnRvIG90aGVyIGNvbHVtbnMuIFxyXG5cdFx0XHRcdGluIHRoaXMgbW9kZSB5b3UgYXJlIGFsc28gZ2l2ZW4gYWNjZXNzIHRvIGJ1dHRvbnMgdG8gbWFub3V2ZXIgdGhlIGl0ZW0ncyBwb3NpdGlvbiBpbiB0aGF0IGNvbHVtbi5cclxuXHRcdFx0PC9wcmU+XHJcblx0XHQ8L2Rpdj5cclxuXHRcdDxkaXYgPlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwiTWFpbkFwcENvbnRhaW5lclBhZ2VUZXh0SW1hZ2VTZWN0aW9uSW1hZ2VcIiA+XHJcblx0XHRcdFx0SU1BR0VcclxuXHRcdFx0PC9kaXY+XHJcblx0XHQ8L2Rpdj5cclxuXHQ8L3NlY3Rpb24+XHJcblx0PHNlY3Rpb24+XHJcblx0XHQ8ZGl2IGNsYXNzPVwidGFibGUgXCI+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJ0YWJsZVJvd1wiPlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJ0YWJsZVJvd0NvbHVtblwiIHN0eWxlPVwiZmxvYXQ6bGVmdDtcIlx0PiBTZXR0aW5nIDEgPC9kaXY+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInRhYmxlUm93Q29sdW1uXCIgc3R5bGU9XCJmbG9hdDpyaWdodDtcIj5cclxuXHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwibnVtYmVyXCIgdmFsdWU9XCIxMlwiIC8+XHJcblx0XHRcdFx0XHQ8c2VsZWN0PlxyXG5cdFx0XHRcdFx0XHQ8b3B0aW9uIHZhbHVlPVwicHhcIiBzZWxlY3RlZD5weDwvb3B0aW9uPlxyXG5cdFx0XHRcdFx0XHQ8b3B0aW9uIHZhbHVlPVwiZW1cIj5lbTwvb3B0aW9uPlxyXG5cdFx0XHRcdFx0XHQ8b3B0aW9uIHZhbHVlPVwiJVwiPiU8L29wdGlvbj5cdFx0XHJcblx0XHRcdFx0XHQ8L3NlbGVjdD5cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJ0YWJsZVJvd1wiPlxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJ0YWJsZVJvd0NvbHVtblwiIHN0eWxlPVwiZmxvYXQ6bGVmdDtcIlx0PiBTZXR0aW5nIDI8L2Rpdj5cclxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwidGFibGVSb3dDb2x1bW5cIiBzdHlsZT1cImZsb2F0OnJpZ2h0O1wiPlxyXG5cdFx0XHRcdFx0PGlucHV0IHR5cGU9XCJjaGVja2JveFwiIC8+XHJcblx0XHRcdFx0PC9kaXY+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwidGFibGVSb3dcIj5cclxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwidGFibGVSb3dDb2x1bW5cIiBzdHlsZT1cImZsb2F0OmxlZnQ7XCJcdD4gU2V0dGluZyAzPC9kaXY+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInRhYmxlUm93Q29sdW1uXCIgc3R5bGU9XCJmbG9hdDpyaWdodDtcIj5cclxuXHRcdFx0XHRcdDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiAvPlxyXG5cdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdDwvZGl2PlxyXG5cdDwvc2VjdGlvbj5cclxuPC9kaXY+IiwiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlLCBTdXBwcmVzc2VkRXJyb3IsIFN5bWJvbCwgSXRlcmF0b3IgKi9cclxuXHJcbnZhciBleHRlbmRTdGF0aWNzID0gZnVuY3Rpb24oZCwgYikge1xyXG4gICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICh7IF9fcHJvdG9fXzogW10gfSBpbnN0YW5jZW9mIEFycmF5ICYmIGZ1bmN0aW9uIChkLCBiKSB7IGQuX19wcm90b19fID0gYjsgfSkgfHxcclxuICAgICAgICBmdW5jdGlvbiAoZCwgYikgeyBmb3IgKHZhciBwIGluIGIpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoYiwgcCkpIGRbcF0gPSBiW3BdOyB9O1xyXG4gICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHRlbmRzKGQsIGIpIHtcclxuICAgIGlmICh0eXBlb2YgYiAhPT0gXCJmdW5jdGlvblwiICYmIGIgIT09IG51bGwpXHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xyXG4gICAgZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxyXG4gICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fYXNzaWduID0gZnVuY3Rpb24oKSB7XHJcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gX19hc3NpZ24odCkge1xyXG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpIHRbcF0gPSBzW3BdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdDtcclxuICAgIH1cclxuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZXN0KHMsIGUpIHtcclxuICAgIHZhciB0ID0ge307XHJcbiAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkgJiYgZS5pbmRleE9mKHApIDwgMClcclxuICAgICAgICB0W3BdID0gc1twXTtcclxuICAgIGlmIChzICE9IG51bGwgJiYgdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPT09IFwiZnVuY3Rpb25cIilcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgcCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMocyk7IGkgPCBwLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlLmluZGV4T2YocFtpXSkgPCAwICYmIE9iamVjdC5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChzLCBwW2ldKSlcclxuICAgICAgICAgICAgICAgIHRbcFtpXV0gPSBzW3BbaV1dO1xyXG4gICAgICAgIH1cclxuICAgIHJldHVybiB0O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYykge1xyXG4gICAgdmFyIGMgPSBhcmd1bWVudHMubGVuZ3RoLCByID0gYyA8IDMgPyB0YXJnZXQgOiBkZXNjID09PSBudWxsID8gZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpIDogZGVzYywgZDtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5kZWNvcmF0ZSA9PT0gXCJmdW5jdGlvblwiKSByID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzLCB0YXJnZXQsIGtleSwgZGVzYyk7XHJcbiAgICBlbHNlIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSBpZiAoZCA9IGRlY29yYXRvcnNbaV0pIHIgPSAoYyA8IDMgPyBkKHIpIDogYyA+IDMgPyBkKHRhcmdldCwga2V5LCByKSA6IGQodGFyZ2V0LCBrZXkpKSB8fCByO1xyXG4gICAgcmV0dXJuIGMgPiAzICYmIHIgJiYgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCByKSwgcjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcGFyYW0ocGFyYW1JbmRleCwgZGVjb3JhdG9yKSB7XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHRhcmdldCwga2V5KSB7IGRlY29yYXRvcih0YXJnZXQsIGtleSwgcGFyYW1JbmRleCk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXNEZWNvcmF0ZShjdG9yLCBkZXNjcmlwdG9ySW4sIGRlY29yYXRvcnMsIGNvbnRleHRJbiwgaW5pdGlhbGl6ZXJzLCBleHRyYUluaXRpYWxpemVycykge1xyXG4gICAgZnVuY3Rpb24gYWNjZXB0KGYpIHsgaWYgKGYgIT09IHZvaWQgMCAmJiB0eXBlb2YgZiAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRnVuY3Rpb24gZXhwZWN0ZWRcIik7IHJldHVybiBmOyB9XHJcbiAgICB2YXIga2luZCA9IGNvbnRleHRJbi5raW5kLCBrZXkgPSBraW5kID09PSBcImdldHRlclwiID8gXCJnZXRcIiA6IGtpbmQgPT09IFwic2V0dGVyXCIgPyBcInNldFwiIDogXCJ2YWx1ZVwiO1xyXG4gICAgdmFyIHRhcmdldCA9ICFkZXNjcmlwdG9ySW4gJiYgY3RvciA/IGNvbnRleHRJbltcInN0YXRpY1wiXSA/IGN0b3IgOiBjdG9yLnByb3RvdHlwZSA6IG51bGw7XHJcbiAgICB2YXIgZGVzY3JpcHRvciA9IGRlc2NyaXB0b3JJbiB8fCAodGFyZ2V0ID8gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGNvbnRleHRJbi5uYW1lKSA6IHt9KTtcclxuICAgIHZhciBfLCBkb25lID0gZmFsc2U7XHJcbiAgICBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgIHZhciBjb250ZXh0ID0ge307XHJcbiAgICAgICAgZm9yICh2YXIgcCBpbiBjb250ZXh0SW4pIGNvbnRleHRbcF0gPSBwID09PSBcImFjY2Vzc1wiID8ge30gOiBjb250ZXh0SW5bcF07XHJcbiAgICAgICAgZm9yICh2YXIgcCBpbiBjb250ZXh0SW4uYWNjZXNzKSBjb250ZXh0LmFjY2Vzc1twXSA9IGNvbnRleHRJbi5hY2Nlc3NbcF07XHJcbiAgICAgICAgY29udGV4dC5hZGRJbml0aWFsaXplciA9IGZ1bmN0aW9uIChmKSB7IGlmIChkb25lKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGFkZCBpbml0aWFsaXplcnMgYWZ0ZXIgZGVjb3JhdGlvbiBoYXMgY29tcGxldGVkXCIpOyBleHRyYUluaXRpYWxpemVycy5wdXNoKGFjY2VwdChmIHx8IG51bGwpKTsgfTtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gKDAsIGRlY29yYXRvcnNbaV0pKGtpbmQgPT09IFwiYWNjZXNzb3JcIiA/IHsgZ2V0OiBkZXNjcmlwdG9yLmdldCwgc2V0OiBkZXNjcmlwdG9yLnNldCB9IDogZGVzY3JpcHRvcltrZXldLCBjb250ZXh0KTtcclxuICAgICAgICBpZiAoa2luZCA9PT0gXCJhY2Nlc3NvclwiKSB7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IHZvaWQgMCkgY29udGludWU7XHJcbiAgICAgICAgICAgIGlmIChyZXN1bHQgPT09IG51bGwgfHwgdHlwZW9mIHJlc3VsdCAhPT0gXCJvYmplY3RcIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdCBleHBlY3RlZFwiKTtcclxuICAgICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LmdldCkpIGRlc2NyaXB0b3IuZ2V0ID0gXztcclxuICAgICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LnNldCkpIGRlc2NyaXB0b3Iuc2V0ID0gXztcclxuICAgICAgICAgICAgaWYgKF8gPSBhY2NlcHQocmVzdWx0LmluaXQpKSBpbml0aWFsaXplcnMudW5zaGlmdChfKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoXyA9IGFjY2VwdChyZXN1bHQpKSB7XHJcbiAgICAgICAgICAgIGlmIChraW5kID09PSBcImZpZWxkXCIpIGluaXRpYWxpemVycy51bnNoaWZ0KF8pO1xyXG4gICAgICAgICAgICBlbHNlIGRlc2NyaXB0b3Jba2V5XSA9IF87XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKHRhcmdldCkgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgY29udGV4dEluLm5hbWUsIGRlc2NyaXB0b3IpO1xyXG4gICAgZG9uZSA9IHRydWU7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19ydW5Jbml0aWFsaXplcnModGhpc0FyZywgaW5pdGlhbGl6ZXJzLCB2YWx1ZSkge1xyXG4gICAgdmFyIHVzZVZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA+IDI7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluaXRpYWxpemVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhbHVlID0gdXNlVmFsdWUgPyBpbml0aWFsaXplcnNbaV0uY2FsbCh0aGlzQXJnLCB2YWx1ZSkgOiBpbml0aWFsaXplcnNbaV0uY2FsbCh0aGlzQXJnKTtcclxuICAgIH1cclxuICAgIHJldHVybiB1c2VWYWx1ZSA/IHZhbHVlIDogdm9pZCAwO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcHJvcEtleSh4KSB7XHJcbiAgICByZXR1cm4gdHlwZW9mIHggPT09IFwic3ltYm9sXCIgPyB4IDogXCJcIi5jb25jYXQoeCk7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zZXRGdW5jdGlvbk5hbWUoZiwgbmFtZSwgcHJlZml4KSB7XHJcbiAgICBpZiAodHlwZW9mIG5hbWUgPT09IFwic3ltYm9sXCIpIG5hbWUgPSBuYW1lLmRlc2NyaXB0aW9uID8gXCJbXCIuY29uY2F0KG5hbWUuZGVzY3JpcHRpb24sIFwiXVwiKSA6IFwiXCI7XHJcbiAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KGYsIFwibmFtZVwiLCB7IGNvbmZpZ3VyYWJsZTogdHJ1ZSwgdmFsdWU6IHByZWZpeCA/IFwiXCIuY29uY2F0KHByZWZpeCwgXCIgXCIsIG5hbWUpIDogbmFtZSB9KTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGcgPSBPYmplY3QuY3JlYXRlKCh0eXBlb2YgSXRlcmF0b3IgPT09IFwiZnVuY3Rpb25cIiA/IEl0ZXJhdG9yIDogT2JqZWN0KS5wcm90b3R5cGUpO1xyXG4gICAgcmV0dXJuIGcubmV4dCA9IHZlcmIoMCksIGdbXCJ0aHJvd1wiXSA9IHZlcmIoMSksIGdbXCJyZXR1cm5cIl0gPSB2ZXJiKDIpLCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcclxuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XHJcbiAgICAgICAgd2hpbGUgKGcgJiYgKGcgPSAwLCBvcFswXSAmJiAoXyA9IDApKSwgXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fY3JlYXRlQmluZGluZyA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XHJcbiAgICBpZiAoIWRlc2MgfHwgKFwiZ2V0XCIgaW4gZGVzYyA/ICFtLl9fZXNNb2R1bGUgOiBkZXNjLndyaXRhYmxlIHx8IGRlc2MuY29uZmlndXJhYmxlKSkge1xyXG4gICAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XHJcbiAgICB9XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIGRlc2MpO1xyXG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIG9bazJdID0gbVtrXTtcclxufSk7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19leHBvcnRTdGFyKG0sIG8pIHtcclxuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKHAgIT09IFwiZGVmYXVsdFwiICYmICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwobywgcCkpIF9fY3JlYXRlQmluZGluZyhvLCBtLCBwKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fdmFsdWVzKG8pIHtcclxuICAgIHZhciBzID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5pdGVyYXRvciwgbSA9IHMgJiYgb1tzXSwgaSA9IDA7XHJcbiAgICBpZiAobSkgcmV0dXJuIG0uY2FsbChvKTtcclxuICAgIGlmIChvICYmIHR5cGVvZiBvLmxlbmd0aCA9PT0gXCJudW1iZXJcIikgcmV0dXJuIHtcclxuICAgICAgICBuZXh0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGlmIChvICYmIGkgPj0gby5sZW5ndGgpIG8gPSB2b2lkIDA7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiBvICYmIG9baSsrXSwgZG9uZTogIW8gfTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihzID8gXCJPYmplY3QgaXMgbm90IGl0ZXJhYmxlLlwiIDogXCJTeW1ib2wuaXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19yZWFkKG8sIG4pIHtcclxuICAgIHZhciBtID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9bU3ltYm9sLml0ZXJhdG9yXTtcclxuICAgIGlmICghbSkgcmV0dXJuIG87XHJcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XHJcbiAgICB9XHJcbiAgICBjYXRjaCAoZXJyb3IpIHsgZSA9IHsgZXJyb3I6IGVycm9yIH07IH1cclxuICAgIGZpbmFsbHkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGlmIChyICYmICFyLmRvbmUgJiYgKG0gPSBpW1wicmV0dXJuXCJdKSkgbS5jYWxsKGkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cclxuICAgIH1cclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuLyoqIEBkZXByZWNhdGVkICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZCgpIHtcclxuICAgIGZvciAodmFyIGFyID0gW10sIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKVxyXG4gICAgICAgIGFyID0gYXIuY29uY2F0KF9fcmVhZChhcmd1bWVudHNbaV0pKTtcclxuICAgIHJldHVybiBhcjtcclxufVxyXG5cclxuLyoqIEBkZXByZWNhdGVkICovXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5cygpIHtcclxuICAgIGZvciAodmFyIHMgPSAwLCBpID0gMCwgaWwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgaWw7IGkrKykgcyArPSBhcmd1bWVudHNbaV0ubGVuZ3RoO1xyXG4gICAgZm9yICh2YXIgciA9IEFycmF5KHMpLCBrID0gMCwgaSA9IDA7IGkgPCBpbDsgaSsrKVxyXG4gICAgICAgIGZvciAodmFyIGEgPSBhcmd1bWVudHNbaV0sIGogPSAwLCBqbCA9IGEubGVuZ3RoOyBqIDwgamw7IGorKywgaysrKVxyXG4gICAgICAgICAgICByW2tdID0gYVtqXTtcclxuICAgIHJldHVybiByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19zcHJlYWRBcnJheSh0bywgZnJvbSwgcGFjaykge1xyXG4gICAgaWYgKHBhY2sgfHwgYXJndW1lbnRzLmxlbmd0aCA9PT0gMikgZm9yICh2YXIgaSA9IDAsIGwgPSBmcm9tLmxlbmd0aCwgYXI7IGkgPCBsOyBpKyspIHtcclxuICAgICAgICBpZiAoYXIgfHwgIShpIGluIGZyb20pKSB7XHJcbiAgICAgICAgICAgIGlmICghYXIpIGFyID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSwgMCwgaSk7XHJcbiAgICAgICAgICAgIGFyW2ldID0gZnJvbVtpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdG8uY29uY2F0KGFyIHx8IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGZyb20pKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXdhaXQodikge1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBfX2F3YWl0ID8gKHRoaXMudiA9IHYsIHRoaXMpIDogbmV3IF9fYXdhaXQodik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jR2VuZXJhdG9yKHRoaXNBcmcsIF9hcmd1bWVudHMsIGdlbmVyYXRvcikge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBnID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pLCBpLCBxID0gW107XHJcbiAgICByZXR1cm4gaSA9IE9iamVjdC5jcmVhdGUoKHR5cGVvZiBBc3luY0l0ZXJhdG9yID09PSBcImZ1bmN0aW9uXCIgPyBBc3luY0l0ZXJhdG9yIDogT2JqZWN0KS5wcm90b3R5cGUpLCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIsIGF3YWl0UmV0dXJuKSwgaVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gYXdhaXRSZXR1cm4oZikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGYsIHJlamVjdCk7IH07IH1cclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpZiAoZ1tuXSkgeyBpW25dID0gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7IHEucHVzaChbbiwgdiwgYSwgYl0pID4gMSB8fCByZXN1bWUobiwgdik7IH0pOyB9OyBpZiAoZikgaVtuXSA9IGYoaVtuXSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IGZhbHNlIH0gOiBmID8gZih2KSA6IHY7IH0gOiBmOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jVmFsdWVzKG8pIHtcclxuICAgIGlmICghU3ltYm9sLmFzeW5jSXRlcmF0b3IpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNJdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICB2YXIgbSA9IG9bU3ltYm9sLmFzeW5jSXRlcmF0b3JdLCBpO1xyXG4gICAgcmV0dXJuIG0gPyBtLmNhbGwobykgOiAobyA9IHR5cGVvZiBfX3ZhbHVlcyA9PT0gXCJmdW5jdGlvblwiID8gX192YWx1ZXMobykgOiBvW1N5bWJvbC5pdGVyYXRvcl0oKSwgaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIpLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGkpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IGlbbl0gPSBvW25dICYmIGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHYgPSBvW25dKHYpLCBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCB2LmRvbmUsIHYudmFsdWUpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc2V0dGxlKHJlc29sdmUsIHJlamVjdCwgZCwgdikgeyBQcm9taXNlLnJlc29sdmUodikudGhlbihmdW5jdGlvbih2KSB7IHJlc29sdmUoeyB2YWx1ZTogdiwgZG9uZTogZCB9KTsgfSwgcmVqZWN0KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19tYWtlVGVtcGxhdGVPYmplY3QoY29va2VkLCByYXcpIHtcclxuICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHsgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNvb2tlZCwgXCJyYXdcIiwgeyB2YWx1ZTogcmF3IH0pOyB9IGVsc2UgeyBjb29rZWQucmF3ID0gcmF3OyB9XHJcbiAgICByZXR1cm4gY29va2VkO1xyXG59O1xyXG5cclxudmFyIF9fc2V0TW9kdWxlRGVmYXVsdCA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgdikge1xyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG8sIFwiZGVmYXVsdFwiLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2IH0pO1xyXG59KSA6IGZ1bmN0aW9uKG8sIHYpIHtcclxuICAgIG9bXCJkZWZhdWx0XCJdID0gdjtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydFN0YXIobW9kKSB7XHJcbiAgICBpZiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSByZXR1cm4gbW9kO1xyXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgaWYgKG1vZCAhPSBudWxsKSBmb3IgKHZhciBrIGluIG1vZCkgaWYgKGsgIT09IFwiZGVmYXVsdFwiICYmIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChtb2QsIGspKSBfX2NyZWF0ZUJpbmRpbmcocmVzdWx0LCBtb2QsIGspO1xyXG4gICAgX19zZXRNb2R1bGVEZWZhdWx0KHJlc3VsdCwgbW9kKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2ltcG9ydERlZmF1bHQobW9kKSB7XHJcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IGRlZmF1bHQ6IG1vZCB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZEdldChyZWNlaXZlciwgc3RhdGUsIGtpbmQsIGYpIHtcclxuICAgIGlmIChraW5kID09PSBcImFcIiAmJiAhZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlByaXZhdGUgYWNjZXNzb3Igd2FzIGRlZmluZWQgd2l0aG91dCBhIGdldHRlclwiKTtcclxuICAgIGlmICh0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyICE9PSBzdGF0ZSB8fCAhZiA6ICFzdGF0ZS5oYXMocmVjZWl2ZXIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHJlYWQgcHJpdmF0ZSBtZW1iZXIgZnJvbSBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xyXG4gICAgcmV0dXJuIGtpbmQgPT09IFwibVwiID8gZiA6IGtpbmQgPT09IFwiYVwiID8gZi5jYWxsKHJlY2VpdmVyKSA6IGYgPyBmLnZhbHVlIDogc3RhdGUuZ2V0KHJlY2VpdmVyKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fY2xhc3NQcml2YXRlRmllbGRTZXQocmVjZWl2ZXIsIHN0YXRlLCB2YWx1ZSwga2luZCwgZikge1xyXG4gICAgaWYgKGtpbmQgPT09IFwibVwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBtZXRob2QgaXMgbm90IHdyaXRhYmxlXCIpO1xyXG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgc2V0dGVyXCIpO1xyXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgIT09IHN0YXRlIHx8ICFmIDogIXN0YXRlLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3Qgd3JpdGUgcHJpdmF0ZSBtZW1iZXIgdG8gYW4gb2JqZWN0IHdob3NlIGNsYXNzIGRpZCBub3QgZGVjbGFyZSBpdFwiKTtcclxuICAgIHJldHVybiAoa2luZCA9PT0gXCJhXCIgPyBmLmNhbGwocmVjZWl2ZXIsIHZhbHVlKSA6IGYgPyBmLnZhbHVlID0gdmFsdWUgOiBzdGF0ZS5zZXQocmVjZWl2ZXIsIHZhbHVlKSksIHZhbHVlO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZEluKHN0YXRlLCByZWNlaXZlcikge1xyXG4gICAgaWYgKHJlY2VpdmVyID09PSBudWxsIHx8ICh0eXBlb2YgcmVjZWl2ZXIgIT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHJlY2VpdmVyICE9PSBcImZ1bmN0aW9uXCIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IHVzZSAnaW4nIG9wZXJhdG9yIG9uIG5vbi1vYmplY3RcIik7XHJcbiAgICByZXR1cm4gdHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciA9PT0gc3RhdGUgOiBzdGF0ZS5oYXMocmVjZWl2ZXIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hZGREaXNwb3NhYmxlUmVzb3VyY2UoZW52LCB2YWx1ZSwgYXN5bmMpIHtcclxuICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdm9pZCAwKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdCBleHBlY3RlZC5cIik7XHJcbiAgICAgICAgdmFyIGRpc3Bvc2UsIGlubmVyO1xyXG4gICAgICAgIGlmIChhc3luYykge1xyXG4gICAgICAgICAgICBpZiAoIVN5bWJvbC5hc3luY0Rpc3Bvc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuYXN5bmNEaXNwb3NlIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgICAgICAgICAgZGlzcG9zZSA9IHZhbHVlW1N5bWJvbC5hc3luY0Rpc3Bvc2VdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGlzcG9zZSA9PT0gdm9pZCAwKSB7XHJcbiAgICAgICAgICAgIGlmICghU3ltYm9sLmRpc3Bvc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTeW1ib2wuZGlzcG9zZSBpcyBub3QgZGVmaW5lZC5cIik7XHJcbiAgICAgICAgICAgIGRpc3Bvc2UgPSB2YWx1ZVtTeW1ib2wuZGlzcG9zZV07XHJcbiAgICAgICAgICAgIGlmIChhc3luYykgaW5uZXIgPSBkaXNwb3NlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIGRpc3Bvc2UgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk9iamVjdCBub3QgZGlzcG9zYWJsZS5cIik7XHJcbiAgICAgICAgaWYgKGlubmVyKSBkaXNwb3NlID0gZnVuY3Rpb24oKSB7IHRyeSB7IGlubmVyLmNhbGwodGhpcyk7IH0gY2F0Y2ggKGUpIHsgcmV0dXJuIFByb21pc2UucmVqZWN0KGUpOyB9IH07XHJcbiAgICAgICAgZW52LnN0YWNrLnB1c2goeyB2YWx1ZTogdmFsdWUsIGRpc3Bvc2U6IGRpc3Bvc2UsIGFzeW5jOiBhc3luYyB9KTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKGFzeW5jKSB7XHJcbiAgICAgICAgZW52LnN0YWNrLnB1c2goeyBhc3luYzogdHJ1ZSB9KTtcclxuICAgIH1cclxuICAgIHJldHVybiB2YWx1ZTtcclxuXHJcbn1cclxuXHJcbnZhciBfU3VwcHJlc3NlZEVycm9yID0gdHlwZW9mIFN1cHByZXNzZWRFcnJvciA9PT0gXCJmdW5jdGlvblwiID8gU3VwcHJlc3NlZEVycm9yIDogZnVuY3Rpb24gKGVycm9yLCBzdXBwcmVzc2VkLCBtZXNzYWdlKSB7XHJcbiAgICB2YXIgZSA9IG5ldyBFcnJvcihtZXNzYWdlKTtcclxuICAgIHJldHVybiBlLm5hbWUgPSBcIlN1cHByZXNzZWRFcnJvclwiLCBlLmVycm9yID0gZXJyb3IsIGUuc3VwcHJlc3NlZCA9IHN1cHByZXNzZWQsIGU7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19kaXNwb3NlUmVzb3VyY2VzKGVudikge1xyXG4gICAgZnVuY3Rpb24gZmFpbChlKSB7XHJcbiAgICAgICAgZW52LmVycm9yID0gZW52Lmhhc0Vycm9yID8gbmV3IF9TdXBwcmVzc2VkRXJyb3IoZSwgZW52LmVycm9yLCBcIkFuIGVycm9yIHdhcyBzdXBwcmVzc2VkIGR1cmluZyBkaXNwb3NhbC5cIikgOiBlO1xyXG4gICAgICAgIGVudi5oYXNFcnJvciA9IHRydWU7XHJcbiAgICB9XHJcbiAgICB2YXIgciwgcyA9IDA7XHJcbiAgICBmdW5jdGlvbiBuZXh0KCkge1xyXG4gICAgICAgIHdoaWxlIChyID0gZW52LnN0YWNrLnBvcCgpKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXIuYXN5bmMgJiYgcyA9PT0gMSkgcmV0dXJuIHMgPSAwLCBlbnYuc3RhY2sucHVzaChyKSwgUHJvbWlzZS5yZXNvbHZlKCkudGhlbihuZXh0KTtcclxuICAgICAgICAgICAgICAgIGlmIChyLmRpc3Bvc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gci5kaXNwb3NlLmNhbGwoci52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHIuYXN5bmMpIHJldHVybiBzIHw9IDIsIFByb21pc2UucmVzb2x2ZShyZXN1bHQpLnRoZW4obmV4dCwgZnVuY3Rpb24oZSkgeyBmYWlsKGUpOyByZXR1cm4gbmV4dCgpOyB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgcyB8PSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBmYWlsKGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzID09PSAxKSByZXR1cm4gZW52Lmhhc0Vycm9yID8gUHJvbWlzZS5yZWplY3QoZW52LmVycm9yKSA6IFByb21pc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgIGlmIChlbnYuaGFzRXJyb3IpIHRocm93IGVudi5lcnJvcjtcclxuICAgIH1cclxuICAgIHJldHVybiBuZXh0KCk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IHtcclxuICAgIF9fZXh0ZW5kczogX19leHRlbmRzLFxyXG4gICAgX19hc3NpZ246IF9fYXNzaWduLFxyXG4gICAgX19yZXN0OiBfX3Jlc3QsXHJcbiAgICBfX2RlY29yYXRlOiBfX2RlY29yYXRlLFxyXG4gICAgX19wYXJhbTogX19wYXJhbSxcclxuICAgIF9fbWV0YWRhdGE6IF9fbWV0YWRhdGEsXHJcbiAgICBfX2F3YWl0ZXI6IF9fYXdhaXRlcixcclxuICAgIF9fZ2VuZXJhdG9yOiBfX2dlbmVyYXRvcixcclxuICAgIF9fY3JlYXRlQmluZGluZzogX19jcmVhdGVCaW5kaW5nLFxyXG4gICAgX19leHBvcnRTdGFyOiBfX2V4cG9ydFN0YXIsXHJcbiAgICBfX3ZhbHVlczogX192YWx1ZXMsXHJcbiAgICBfX3JlYWQ6IF9fcmVhZCxcclxuICAgIF9fc3ByZWFkOiBfX3NwcmVhZCxcclxuICAgIF9fc3ByZWFkQXJyYXlzOiBfX3NwcmVhZEFycmF5cyxcclxuICAgIF9fc3ByZWFkQXJyYXk6IF9fc3ByZWFkQXJyYXksXHJcbiAgICBfX2F3YWl0OiBfX2F3YWl0LFxyXG4gICAgX19hc3luY0dlbmVyYXRvcjogX19hc3luY0dlbmVyYXRvcixcclxuICAgIF9fYXN5bmNEZWxlZ2F0b3I6IF9fYXN5bmNEZWxlZ2F0b3IsXHJcbiAgICBfX2FzeW5jVmFsdWVzOiBfX2FzeW5jVmFsdWVzLFxyXG4gICAgX19tYWtlVGVtcGxhdGVPYmplY3Q6IF9fbWFrZVRlbXBsYXRlT2JqZWN0LFxyXG4gICAgX19pbXBvcnRTdGFyOiBfX2ltcG9ydFN0YXIsXHJcbiAgICBfX2ltcG9ydERlZmF1bHQ6IF9faW1wb3J0RGVmYXVsdCxcclxuICAgIF9fY2xhc3NQcml2YXRlRmllbGRHZXQ6IF9fY2xhc3NQcml2YXRlRmllbGRHZXQsXHJcbiAgICBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0OiBfX2NsYXNzUHJpdmF0ZUZpZWxkU2V0LFxyXG4gICAgX19jbGFzc1ByaXZhdGVGaWVsZEluOiBfX2NsYXNzUHJpdmF0ZUZpZWxkSW4sXHJcbiAgICBfX2FkZERpc3Bvc2FibGVSZXNvdXJjZTogX19hZGREaXNwb3NhYmxlUmVzb3VyY2UsXHJcbiAgICBfX2Rpc3Bvc2VSZXNvdXJjZXM6IF9fZGlzcG9zZVJlc291cmNlcyxcclxufTtcclxuIiwiPHNjcmlwdCBsYW5nPVwidHNcIj5cclxuICAgZXhwb3J0IGxldCBjb2xvcjogc3RyaW5nID0gXCJibGFja1wiIDsgXHJcbjwvc2NyaXB0PlxyXG4gIDxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9e2NvbG9yfSBzdHJva2Utd2lkdGg9XCIyXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCIgY2xhc3M9XCJzdmctaWNvbiBsdWNpZGUtcGx1cy1jaXJjbGVcIj5cclxuICAgICAgICA8Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjEwXCI+XHJcbiAgICAgICAgPC9jaXJjbGU+XHJcbiAgICAgICAgPGxpbmUgeDE9XCIxMlwiIHkxPVwiOFwiIHgyPVwiMTJcIiB5Mj1cIjE2XCI+XHJcbiAgICAgICAgPC9saW5lPlxyXG4gICAgICAgIDxsaW5lIHgxPVwiOFwiIHkxPVwiMTJcIiB4Mj1cIjE2XCIgeTI9XCIxMlwiPlxyXG4gICAgICAgIDwvbGluZT5cclxuICAgIDwvc3ZnPiIsIjxzY3JpcHQgbGFuZz1cInRzXCI+XHJcblxyXG5cclxuXHRpbXBvcnQgSW1hZ2VfcGx1cyBmcm9tIFwiLi4vYnV0dG9ucy9wbHVzLnN2ZWx0ZVwiOyBcclxuICAgIGltcG9ydCB7ICAgc2xpZGUgfSBmcm9tIFwic3ZlbHRlL3RyYW5zaXRpb25cIjtcclxuICAgIGltcG9ydCB7IGNyZWF0ZUV2ZW50RGlzcGF0Y2hlciwgb25Nb3VudCB9IGZyb20gXCJzdmVsdGVcIjsgIFxyXG4gXHJcblxyXG5cdGV4cG9ydCBsZXQgaXNFZGl0YWJsZUNvbnRhaW5lcjpib29sZWFuID0gdHJ1ZTtcclxuICAgIGV4cG9ydCBsZXQgY29sbGVjdGlvbjogc3RyaW5nW10gfCB7a2V5OnN0cmluZywgdmFsdWU6c3RyaW5nLCBpc1NlbGVjdGVkPzpib29sZWFuIH1bXTsgXHJcblx0JDogX2NvbGxlY3Rpb24gPSBjb2xsZWN0aW9uLm1hcCggcCA9PiB7IFxyXG5cdFx0aWYgKCBwLmtleSAmJiBwLnZhbHVlICl7XHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0a2V5XHRcdFx0OnAua2V5LFxyXG5cdFx0XHRcdG5hbWVcdFx0OnAudmFsdWUsXHJcblx0XHRcdFx0aXNTZWxlY3RlZFx0OnAuaXNTZWxlY3RlZCA/PyBmYWxzZSxcclxuXHRcdFx0XHRuYW1lRWRpdFx0OnAudmFsdWUsXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0a2V5XHRcdFx0OnAgYXMgc3RyaW5nLFxyXG5cdFx0XHRcdG5hbWVcdFx0OnAgYXMgc3RyaW5nLFxyXG5cdFx0XHRcdGlzU2VsZWN0ZWRcdDpmYWxzZSxcclxuXHRcdFx0XHRuYW1lRWRpdFx0OnAgYXMgc3RyaW5nLFxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fSlcclxuXHJcblx0ZXhwb3J0IGxldCBvblNlbGVjdFx0XHQ6ICggZDogYW55ICkgPT4gYm9vbGVhbjtcclxuXHRleHBvcnQgbGV0IG9uQWRkXHRcdDogKCgpID0+IGFueSkgfCBudWxsID0gbnVsbDsgXHJcblx0Y29uc3QgZGlzcGF0Y2ggPSBjcmVhdGVFdmVudERpc3BhdGNoZXIoKTtcclxuXHJcblx0aW50ZXJmYWNlIElWaWV3RWxlbWVudHtcclxuXHRcdGtleTpzdHJpbmc7XHJcblx0XHRuYW1lOnN0cmluZztcclxuXHRcdGlzU2VsZWN0ZWQ6Ym9vbGVhbjtcclxuXHRcdG5hbWVFZGl0OnN0cmluZzsgXHJcblx0fVxyXG5cclxuXHRsZXQgc2VsZWN0ZWQgOiBJVmlld0VsZW1lbnQgfCBudWxsID0gbnVsbDtcclxuXHRcclxuXHRleHBvcnQgZnVuY3Rpb24gZGVzZWxlY3QoKXtcclxuXHRcdGlmKCFzZWxlY3RlZClcclxuXHRcdFx0cmV0dXJuO1xyXG4gXHJcblx0XHRsZXQgaSA9IF9jb2xsZWN0aW9uLmZpbmRJbmRleCggcCA9PiBwLmlzU2VsZWN0ZWQgKTsgXHJcblx0XHRpZiggaSAhPSAtMSApXHJcblx0XHRcdF9jb2xsZWN0aW9uW2ldLmlzU2VsZWN0ZWQgPSBmYWxzZTtcclxuXHJcblx0XHRzZWxlY3RlZCA9IG51bGw7XHJcblx0XHRkaXNwYXRjaCgnb25EZVNlbGVjdCcpXHJcblx0fVxyXG5cclxuXHRleHBvcnQgZnVuY3Rpb24gc2VsZWN0KCBrZXkgOiBzdHJpbmcgKXtcclxuXHRcdGxldCBpdGVtID0gX2NvbGxlY3Rpb24uZmluZCggcCA9PiBwLmtleSA9PSBrZXkgKTtcclxuXHRcdGlmICggaXRlbSApe1xyXG5cdFx0XHRfb25TZWxlY3QoIGl0ZW0gKTtcclxuXHRcdH1cclxuXHR9XHJcblx0IFxyXG5cdGZ1bmN0aW9uIF9vblNlbGVjdChpdGVtIDogSVZpZXdFbGVtZW50KXsgXHJcblxyXG5cdFx0Ly8gZ2V0IGxhc3Qgc2VsZWN0ZWQgXHJcblx0XHRsZXQgaSA9IF9jb2xsZWN0aW9uLmZpbmRJbmRleCggcCA9PiBwLmlzU2VsZWN0ZWQgKTsgXHJcblx0XHJcblx0XHQvLyBlbnN1cmUgdGhhdCBhIENsaWNrIG9uIHRoZSBzYW1lIGl0ZW0gaXMgYSBkZXNlbGVjdFxyXG5cdFx0aWYgKCBpICE9IC0xICYmIF9jb2xsZWN0aW9uW2ldLmtleSA9PSBpdGVtLmtleSApe1xyXG5cdFx0XHRfY29sbGVjdGlvbltpXS5pc1NlbGVjdGVkID0gZmFsc2U7IFxyXG5cdFx0XHRzZWxlY3RlZCA9IG51bGw7XHJcblx0XHRcdGRpc3BhdGNoKCdvbkRlU2VsZWN0JylcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGRlc2VsZWN0XHJcblx0XHRpZiAoIGkgIT0gLTEgKVxyXG5cdFx0XHRfY29sbGVjdGlvbltpXS5pc1NlbGVjdGVkID0gZmFsc2U7XHJcblxyXG5cdFx0aSA9IF9jb2xsZWN0aW9uLmZpbmRJbmRleCggcCA9PiBwLmtleSA9PSBpdGVtLmtleSApOyAgXHJcblx0XHRjb25zdCBpc1NlbGVjdGVkID0gb25TZWxlY3QoX2NvbGxlY3Rpb25baV0ua2V5KTsgXHJcblx0XHRpZiAoaXNTZWxlY3RlZCl7XHJcblx0XHRcdHNlbGVjdGVkID0gX2NvbGxlY3Rpb25baV07XHJcblx0XHR9IGVsc2V7XHJcblx0XHRcdHNlbGVjdGVkID0gbnVsbDtcclxuXHRcdH1cclxuIFxyXG5cdFx0X2NvbGxlY3Rpb25baV0uaXNTZWxlY3RlZCA9IGlzU2VsZWN0ZWQ7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfb25BZGQoKXtcclxuXHRcdGlmKCFvbkFkZClcclxuXHRcdFx0cmV0dXJuO1x0XHJcbiBcclxuXHRcdGRlc2VsZWN0KCk7XHJcblx0XHRvbkFkZCgpO1xyXG5cdH1cclxuXHJcbjwvc2NyaXB0PlxyXG5cclxuXHJcbiAgICA8ZGl2IGNsYXNzPXsgaXNFZGl0YWJsZUNvbnRhaW5lciA/IFwiR3JvYnNJbnRlcmFjdGl2ZUNvbnRhaW5lciBlZGl0YWJsZVRhYmxlXCIgOiBcImVkaXRhYmxlVGFibGVcIn0gPlxyXG5cdFx0XHR7I2VhY2ggX2NvbGxlY3Rpb24gYXMgZSAoIGUua2V5ICkgfVxyXG5cdFx0XHRcdDxkaXZcclxuXHRcdFx0XHRcdGNsYXNzPVwiRWRpdGFibGVfcm93XCIgXHJcblx0XHRcdFx0XHRkYXRhLXNlbGVjdGVkPXsgZS5pc1NlbGVjdGVkIH1cclxuXHRcdFx0XHRcdHRyYW5zaXRpb246c2xpZGUgXHJcblx0XHRcdFx0XHRkYXRhLWNhbi1ob3Zlcj17dHJ1ZX1cclxuXHRcdFx0XHQ+XHJcblx0XHRcdFx0XHQ8ZGl2XHJcblx0XHRcdFx0XHRcdHRhYmluZGV4PVwiLTFcIlxyXG5cdFx0XHRcdFx0XHRjbGFzcz1cIkVkaXRhYmxlX2NvbHVtblwiXHJcblx0XHRcdFx0XHRcdGNvbnRlbnRlZGl0YWJsZT1cImZhbHNlXCJcclxuXHRcdFx0XHRcdFx0YmluZDp0ZXh0Q29udGVudD17ZS5uYW1lfSBcclxuXHRcdFx0XHRcdFx0b246Y2xpY2s9eyAoKSA9PiBfb25TZWxlY3QoZSkgfVxyXG5cdFx0XHRcdFx0XHRvbjprZXl1cFxyXG5cdFx0XHRcdFx0PiBcclxuXHRcdFx0XHRcdFx0e2UubmFtZX1cclxuXHRcdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHR7L2VhY2h9XHJcblx0XHRcdHsjaWYgb25BZGQgIT0gbnVsbCB9XHJcblx0XHRcdFx0PGRpdlxyXG5cdFx0XHRcdFx0Y2xhc3M9XCJFZGl0YWJsZV9yb3cgRWRpdGFibGVfcm93UGx1c0J1dHRvblwiXHJcblx0XHRcdFx0XHRkYXRhLXNlbGVjdGVkPXsgZmFsc2UgfVxyXG5cdFx0XHRcdFx0dHJhbnNpdGlvbjpzbGlkZVxyXG5cdFx0XHRcdFx0ZGF0YS1jYW4taG92ZXI9e3RydWV9XHJcblx0XHRcdFx0XHRzdHlsZT1cImRpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcIlxyXG5cdFx0XHRcdFx0b246Y2xpY2s9eyAoKSA9PiBfb25BZGQoKSB9XHJcblx0XHRcdFx0XHRvbjprZXl1cD17ICgpID0+IF9vbkFkZCgpIH1cclxuXHRcdFx0XHQ+XHJcblx0XHRcdFx0XHQ8ZGl2IFxyXG5cdFx0XHRcdFx0XHR0YWJpbmRleD1cIi0xXCJcclxuXHRcdFx0XHRcdFx0Y2xhc3M9XCJFZGl0YWJsZV9JY29uXCJcclxuXHRcdFx0XHRcdFx0Y29udGVudGVkaXRhYmxlPVwiZmFsc2VcIiBcclxuXHRcdFx0XHRcdD4gIFxyXG5cdFx0XHRcdFx0XHQ8SW1hZ2VfcGx1cyBjb2xvcj17JyNmZmYnfS8+XHJcblx0XHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHQ8L2Rpdj5cdFxyXG5cdFx0XHR7L2lmfVxyXG5cdDwvZGl2PlxyXG5cclxuICIsImltcG9ydCB7IG5vb3AsIHNhZmVfbm90X2VxdWFsLCBzdWJzY3JpYmUsIHJ1bl9hbGwsIGlzX2Z1bmN0aW9uIH0gZnJvbSAnLi4vaW50ZXJuYWwvaW5kZXgubWpzJztcbmV4cG9ydCB7IGdldF9zdG9yZV92YWx1ZSBhcyBnZXQgfSBmcm9tICcuLi9pbnRlcm5hbC9pbmRleC5tanMnO1xuXG5jb25zdCBzdWJzY3JpYmVyX3F1ZXVlID0gW107XG4vKipcbiAqIENyZWF0ZXMgYSBgUmVhZGFibGVgIHN0b3JlIHRoYXQgYWxsb3dzIHJlYWRpbmcgYnkgc3Vic2NyaXB0aW9uLlxuICogQHBhcmFtIHZhbHVlIGluaXRpYWwgdmFsdWVcbiAqIEBwYXJhbSB7U3RhcnRTdG9wTm90aWZpZXJ9IFtzdGFydF1cbiAqL1xuZnVuY3Rpb24gcmVhZGFibGUodmFsdWUsIHN0YXJ0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3Vic2NyaWJlOiB3cml0YWJsZSh2YWx1ZSwgc3RhcnQpLnN1YnNjcmliZVxuICAgIH07XG59XG4vKipcbiAqIENyZWF0ZSBhIGBXcml0YWJsZWAgc3RvcmUgdGhhdCBhbGxvd3MgYm90aCB1cGRhdGluZyBhbmQgcmVhZGluZyBieSBzdWJzY3JpcHRpb24uXG4gKiBAcGFyYW0geyo9fXZhbHVlIGluaXRpYWwgdmFsdWVcbiAqIEBwYXJhbSB7U3RhcnRTdG9wTm90aWZpZXI9fSBzdGFydFxuICovXG5mdW5jdGlvbiB3cml0YWJsZSh2YWx1ZSwgc3RhcnQgPSBub29wKSB7XG4gICAgbGV0IHN0b3A7XG4gICAgY29uc3Qgc3Vic2NyaWJlcnMgPSBuZXcgU2V0KCk7XG4gICAgZnVuY3Rpb24gc2V0KG5ld192YWx1ZSkge1xuICAgICAgICBpZiAoc2FmZV9ub3RfZXF1YWwodmFsdWUsIG5ld192YWx1ZSkpIHtcbiAgICAgICAgICAgIHZhbHVlID0gbmV3X3ZhbHVlO1xuICAgICAgICAgICAgaWYgKHN0b3ApIHsgLy8gc3RvcmUgaXMgcmVhZHlcbiAgICAgICAgICAgICAgICBjb25zdCBydW5fcXVldWUgPSAhc3Vic2NyaWJlcl9xdWV1ZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdWJzY3JpYmVyIG9mIHN1YnNjcmliZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXJbMV0oKTtcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlcl9xdWV1ZS5wdXNoKHN1YnNjcmliZXIsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJ1bl9xdWV1ZSkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN1YnNjcmliZXJfcXVldWUubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXJfcXVldWVbaV1bMF0oc3Vic2NyaWJlcl9xdWV1ZVtpICsgMV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXJfcXVldWUubGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gdXBkYXRlKGZuKSB7XG4gICAgICAgIHNldChmbih2YWx1ZSkpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzdWJzY3JpYmUocnVuLCBpbnZhbGlkYXRlID0gbm9vcCkge1xuICAgICAgICBjb25zdCBzdWJzY3JpYmVyID0gW3J1biwgaW52YWxpZGF0ZV07XG4gICAgICAgIHN1YnNjcmliZXJzLmFkZChzdWJzY3JpYmVyKTtcbiAgICAgICAgaWYgKHN1YnNjcmliZXJzLnNpemUgPT09IDEpIHtcbiAgICAgICAgICAgIHN0b3AgPSBzdGFydChzZXQpIHx8IG5vb3A7XG4gICAgICAgIH1cbiAgICAgICAgcnVuKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHN1YnNjcmliZXJzLmRlbGV0ZShzdWJzY3JpYmVyKTtcbiAgICAgICAgICAgIGlmIChzdWJzY3JpYmVycy5zaXplID09PSAwICYmIHN0b3ApIHtcbiAgICAgICAgICAgICAgICBzdG9wKCk7XG4gICAgICAgICAgICAgICAgc3RvcCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7IHNldCwgdXBkYXRlLCBzdWJzY3JpYmUgfTtcbn1cbmZ1bmN0aW9uIGRlcml2ZWQoc3RvcmVzLCBmbiwgaW5pdGlhbF92YWx1ZSkge1xuICAgIGNvbnN0IHNpbmdsZSA9ICFBcnJheS5pc0FycmF5KHN0b3Jlcyk7XG4gICAgY29uc3Qgc3RvcmVzX2FycmF5ID0gc2luZ2xlXG4gICAgICAgID8gW3N0b3Jlc11cbiAgICAgICAgOiBzdG9yZXM7XG4gICAgY29uc3QgYXV0byA9IGZuLmxlbmd0aCA8IDI7XG4gICAgcmV0dXJuIHJlYWRhYmxlKGluaXRpYWxfdmFsdWUsIChzZXQpID0+IHtcbiAgICAgICAgbGV0IHN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgdmFsdWVzID0gW107XG4gICAgICAgIGxldCBwZW5kaW5nID0gMDtcbiAgICAgICAgbGV0IGNsZWFudXAgPSBub29wO1xuICAgICAgICBjb25zdCBzeW5jID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHBlbmRpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBmbihzaW5nbGUgPyB2YWx1ZXNbMF0gOiB2YWx1ZXMsIHNldCk7XG4gICAgICAgICAgICBpZiAoYXV0bykge1xuICAgICAgICAgICAgICAgIHNldChyZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY2xlYW51cCA9IGlzX2Z1bmN0aW9uKHJlc3VsdCkgPyByZXN1bHQgOiBub29wO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB1bnN1YnNjcmliZXJzID0gc3RvcmVzX2FycmF5Lm1hcCgoc3RvcmUsIGkpID0+IHN1YnNjcmliZShzdG9yZSwgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB2YWx1ZXNbaV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIHBlbmRpbmcgJj0gfigxIDw8IGkpO1xuICAgICAgICAgICAgaWYgKHN0YXJ0ZWQpIHtcbiAgICAgICAgICAgICAgICBzeW5jKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgIHBlbmRpbmcgfD0gKDEgPDwgaSk7XG4gICAgICAgIH0pKTtcbiAgICAgICAgc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIHN5bmMoKTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICAgICAgICBydW5fYWxsKHVuc3Vic2NyaWJlcnMpO1xuICAgICAgICAgICAgY2xlYW51cCgpO1xuICAgICAgICAgICAgLy8gV2UgbmVlZCB0byBzZXQgdGhpcyB0byBmYWxzZSBiZWNhdXNlIGNhbGxiYWNrcyBjYW4gc3RpbGwgaGFwcGVuIGRlc3BpdGUgaGF2aW5nIHVuc3Vic2NyaWJlZDpcbiAgICAgICAgICAgIC8vIENhbGxiYWNrcyBtaWdodCBhbHJlYWR5IGJlIHBsYWNlZCBpbiB0aGUgcXVldWUgd2hpY2ggZG9lc24ndCBrbm93IGl0IHNob3VsZCBubyBsb25nZXJcbiAgICAgICAgICAgIC8vIGludm9rZSB0aGlzIGRlcml2ZWQgc3RvcmUuXG4gICAgICAgICAgICBzdGFydGVkID0gZmFsc2U7XG4gICAgICAgIH07XG4gICAgfSk7XG59XG4vKipcbiAqIFRha2VzIGEgc3RvcmUgYW5kIHJldHVybnMgYSBuZXcgb25lIGRlcml2ZWQgZnJvbSB0aGUgb2xkIG9uZSB0aGF0IGlzIHJlYWRhYmxlLlxuICpcbiAqIEBwYXJhbSBzdG9yZSAtIHN0b3JlIHRvIG1ha2UgcmVhZG9ubHlcbiAqL1xuZnVuY3Rpb24gcmVhZG9ubHkoc3RvcmUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzdWJzY3JpYmU6IHN0b3JlLnN1YnNjcmliZS5iaW5kKHN0b3JlKVxuICAgIH07XG59XG5cbmV4cG9ydCB7IGRlcml2ZWQsIHJlYWRhYmxlLCByZWFkb25seSwgd3JpdGFibGUgfTtcbiIsImltcG9ydCB7IGN1YmljT3V0IH0gZnJvbSAnLi4vZWFzaW5nL2luZGV4Lm1qcyc7XG5pbXBvcnQgeyBpc19mdW5jdGlvbiB9IGZyb20gJy4uL2ludGVybmFsL2luZGV4Lm1qcyc7XG5cbmZ1bmN0aW9uIGZsaXAobm9kZSwgeyBmcm9tLCB0byB9LCBwYXJhbXMgPSB7fSkge1xuICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICBjb25zdCB0cmFuc2Zvcm0gPSBzdHlsZS50cmFuc2Zvcm0gPT09ICdub25lJyA/ICcnIDogc3R5bGUudHJhbnNmb3JtO1xuICAgIGNvbnN0IFtveCwgb3ldID0gc3R5bGUudHJhbnNmb3JtT3JpZ2luLnNwbGl0KCcgJykubWFwKHBhcnNlRmxvYXQpO1xuICAgIGNvbnN0IGR4ID0gKGZyb20ubGVmdCArIGZyb20ud2lkdGggKiBveCAvIHRvLndpZHRoKSAtICh0by5sZWZ0ICsgb3gpO1xuICAgIGNvbnN0IGR5ID0gKGZyb20udG9wICsgZnJvbS5oZWlnaHQgKiBveSAvIHRvLmhlaWdodCkgLSAodG8udG9wICsgb3kpO1xuICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IChkKSA9PiBNYXRoLnNxcnQoZCkgKiAxMjAsIGVhc2luZyA9IGN1YmljT3V0IH0gPSBwYXJhbXM7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVsYXksXG4gICAgICAgIGR1cmF0aW9uOiBpc19mdW5jdGlvbihkdXJhdGlvbikgPyBkdXJhdGlvbihNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpKSA6IGR1cmF0aW9uLFxuICAgICAgICBlYXNpbmcsXG4gICAgICAgIGNzczogKHQsIHUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHggPSB1ICogZHg7XG4gICAgICAgICAgICBjb25zdCB5ID0gdSAqIGR5O1xuICAgICAgICAgICAgY29uc3Qgc3ggPSB0ICsgdSAqIGZyb20ud2lkdGggLyB0by53aWR0aDtcbiAgICAgICAgICAgIGNvbnN0IHN5ID0gdCArIHUgKiBmcm9tLmhlaWdodCAvIHRvLmhlaWdodDtcbiAgICAgICAgICAgIHJldHVybiBgdHJhbnNmb3JtOiAke3RyYW5zZm9ybX0gdHJhbnNsYXRlKCR7eH1weCwgJHt5fXB4KSBzY2FsZSgke3N4fSwgJHtzeX0pO2A7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5leHBvcnQgeyBmbGlwIH07XG4iLCI8c2NyaXB0IGNvbnRleHQ9XCJtb2R1bGVcIiBsYW5nPVwidHNcIj5cclxuXHRleHBvcnQgXHRjb25zdCBNZXNzYWdlVHlwZXMgPSB7XHJcblx0XHRlcnJvclx0OlwiZXJyb3JcIixcclxuXHRcdHZlcmJvc2VcdDpcInZlcmJvc2VcIiwgXHJcblx0XHRnb29kXHQ6XCJnb29kXCJcclxuXHR9XHJcblx0ZXhwb3J0IHR5cGUgTWVzc2FnZVR5cGVUeXBlcyA9IGtleW9mIHR5cGVvZiBNZXNzYWdlVHlwZXM7XHJcbjwvc2NyaXB0PiBcclxuPHNjcmlwdCBsYW5nPVwidHNcIj5cclxuIFxyXG5cdGltcG9ydCAnLi9TdGF0aWNNZXNzYWdlSGFuZGxlci5zY3NzJzsgIFxyXG5cdGltcG9ydCB7IHNsaWRlIH0gZnJvbSBcInN2ZWx0ZS90cmFuc2l0aW9uXCI7IFxyXG4gICAgaW1wb3J0IHsgd3JpdGFibGUgLCB0eXBlICBXcml0YWJsZSB9IGZyb20gJ3N2ZWx0ZS9zdG9yZSc7XHJcbiAgICBpbXBvcnQgeyBmbGlwIH0gZnJvbSAnc3ZlbHRlL2FuaW1hdGUnO1xyXG5cclxuXHRsZXQgbWVzc2FnZXMgOiBXcml0YWJsZTxSZWNvcmQ8YW55LHttc2c6c3RyaW5nLCB0eXBlIDogTWVzc2FnZVR5cGVUeXBlc30+PiA9IHdyaXRhYmxlKHt9KTtcclxuXHRsZXQgbWVzc2FnZXNMZW5ndGggPSAgT2JqZWN0LmVudHJpZXMobWVzc2FnZXMpLmxlbmd0aDtcclxuXHRsZXQgZW50cmllcyA6IFthbnkse21zZzpzdHJpbmcsIHR5cGUgOiBNZXNzYWdlVHlwZVR5cGVzfV0gW10gPSBbXTtcclxuXHRleHBvcnQgbGV0IG92ZXJyaWRlQ2xpY2sgOiAoKCB0eXBlOnN0cmluZyAsa2V5IDogYW55ICkgPT4gYW55ICkgfCBudWxsID0gbnVsbCA7XHJcblx0ZXhwb3J0IGxldCBvdmVycmlkZUNsaWNrVGV4dEVycm9yIDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcblx0XHJcblxyXG5cdG1lc3NhZ2VzLnN1YnNjcmliZSggcCA9PiB7IFxyXG5cdFx0ZW50cmllcyA9ICBPYmplY3QuZW50cmllcyhwKTtcclxuXHRcdG1lc3NhZ2VzTGVuZ3RoID0gZW50cmllcy5sZW5ndGg7IFxyXG5cdH0pXHJcblxyXG5cdGV4cG9ydCBmdW5jdGlvbiBhZGRNZXNzYWdlKCBrZXk6IGFueSAsIG1zZyA6IHttc2c6c3RyaW5nLCB0eXBlIDogTWVzc2FnZVR5cGVUeXBlcyB9ICl7ICBcclxuXHRcdFxyXG5cdFx0aWYoIW1zZylcclxuXHRcdFx0cmV0dXJuO1xyXG5cclxuXHRcdGlmKCFtc2cudHlwZSlcclxuXHRcdFx0bXNnLnR5cGUgPSAnZXJyb3InO1xyXG5cdFx0XHJcblx0XHRtZXNzYWdlcy51cGRhdGUoIHIgPT4ge1xyXG5cdFx0XHRyW2tleV0gPSBtc2cgXHJcblx0XHRcdHJldHVybiByO1xyXG5cdFx0fSlcclxuXHR9XHJcblx0ZXhwb3J0IGZ1bmN0aW9uIGFkZE1lc3NhZ2VNYW51YWwoIGtleTogYW55ICwgbXNnIDogc3RyaW5nICwgdHlwZSA6IE1lc3NhZ2VUeXBlVHlwZXMgPSAnZXJyb3InICl7ICBcclxuXHRcdG1lc3NhZ2VzLnVwZGF0ZSggciA9PiB7XHJcblx0XHRcdHJba2V5XSA9IHttc2c6bXNnLHR5cGU6dHlwZX07IFxyXG5cdFx0XHRyZXR1cm4gcjtcclxuXHRcdH0pXHJcblx0fVxyXG5cdGV4cG9ydCBmdW5jdGlvbiByZW1vdmVFcnJvcigga2V5IDogYW55ICl7ICBcclxuXHRcdG1lc3NhZ2VzLnVwZGF0ZSggciA9PiB7XHJcblxyXG5cdFx0XHRpZighcltrZXldKVxyXG5cdFx0XHRcdHJldHVybiByO1xyXG5cclxuXHRcdFx0ZGVsZXRlIHJba2V5XTsgXHJcblx0XHRcdHJldHVybiByO1xyXG5cdFx0fSkgXHJcblx0fVxyXG5cdGV4cG9ydCBmdW5jdGlvbiByZW1vdmVBbGxNZXNzYWdlcyggICl7IFxyXG5cdFx0bWVzc2FnZXMudXBkYXRlKCAoKSA9PiB7XHJcblx0XHRcdHJldHVybiB7fTtcclxuXHRcdH0pXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBvbmNsaWNrKHR5cGU6YW55LGtleTphbnkpeyBcclxuXHRcdFxyXG5cdFx0bGV0IGEgPSB0cnVlO1xyXG5cdFx0aWYgKG92ZXJyaWRlQ2xpY2spXHJcblx0XHRcdGEgPSBvdmVycmlkZUNsaWNrKHR5cGUsIGtleSApXHJcblx0XHRcclxuXHRcdGlmIChhKXtcclxuXHRcdFx0cmVtb3ZlRXJyb3IoIGtleSApO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuPC9zY3JpcHQ+XHJcblxyXG48ZGl2IGNsYXNzPVwiRXJyb3JIYW5kbGVyU2lnbmFnZUNvbnRhaW5lclwiID5cclxuXHR7I2lmIG1lc3NhZ2VzTGVuZ3RoICE9IDB9IFxyXG5cdFx0PGRpdiBjbGFzcz1cIkVycm9ySGFuZGxlclNpZ25hZ2VcIiB0cmFuc2l0aW9uOnNsaWRlfGxvY2FsID5cclxuXHRcdFx0eyNlYWNoIGVudHJpZXMgYXMgW2tleSwgb2JqXSAoa2V5KSB9IFxyXG5cdFx0XHRcdHtAY29uc3QgbXNnVHJhbnNmb3JtZWQgPSBvYmoubXNnLnJlcGxhY2UoJ1xcbicsJzxiciAvPicpfVxyXG5cdFx0XHRcdDxkaXYgXHJcblx0XHRcdFx0dHJhbnNpdGlvbjpzbGlkZXxsb2NhbFxyXG5cdFx0XHRcdGFuaW1hdGU6ZmxpcFxyXG5cdFx0XHRcdHJvbGU9XCJub25lXCJcclxuXHRcdFx0XHRjbGFzcz17IFxyXG5cdFx0XHRcdFx0KG9iai50eXBlID09IE1lc3NhZ2VUeXBlcy5lcnJvcikgPyBcIkVycm9ySGFuZGxlclNpZ25cIiA6IFxyXG5cdFx0XHRcdFx0KG9iai50eXBlID09IE1lc3NhZ2VUeXBlcy52ZXJib3NlKSA/ICBcIlZlcmJvc2VIYW5kbGVyU2lnblwiIDogXHJcblx0XHRcdFx0XHQob2JqLnR5cGUgPT0gTWVzc2FnZVR5cGVzLmdvb2QpID8gIFwiT0tIYW5kbGVyU2lnblwiIDogXHJcblx0XHRcdFx0XHQnJ1xyXG5cdFx0XHRcdH0gXHJcblx0XHRcdFx0b246a2V5ZG93bj17ICgpID0+XHR7IG9uY2xpY2sob2JqLnR5cGUsa2V5KX0gfVxyXG5cdFx0XHRcdG9uOmNsaWNrPXsgKCkgPT5cdHsgb25jbGljayhvYmoudHlwZSxrZXkpfSB9XHJcblx0XHRcdFx0PiBcclxuXHRcdFx0XHRcdFxyXG5cdFx0XHRcdFx0PHA+e0BodG1sIG1zZ1RyYW5zZm9ybWVkIH08L3A+XHJcblx0XHRcdFx0XHR7I2lmIG92ZXJyaWRlQ2xpY2tUZXh0RXJyb3IgJiYgb2JqLnR5cGUgPT0gTWVzc2FnZVR5cGVzLmVycm9yIH1cclxuXHRcdFx0XHRcdFx0PGk+e292ZXJyaWRlQ2xpY2tUZXh0RXJyb3J9PC9pPlxyXG5cdFx0XHRcdFx0ey9pZn1cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0ey9lYWNofVxyXG5cdFx0PC9kaXY+IFxyXG5cdHsvaWZ9XHJcbjwvZGl2PiIsIlxyXG5leHBvcnQgY2xhc3MgU3RyaW5nRnVuY3Rpb25ze1xyXG5cclxuXHRwdWJsaWMgc3RhdGljIGlzVmFsaWRXaW5kb3dzRmlsZVN0cmluZyggc3RyIDogc3RyaW5nICl7XHJcblxyXG5cdFx0aWYoIXN0cilcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cclxuXHRcdC8vIFJlZ3VsYXIgZXhwcmVzc2lvbiB0byBtYXRjaCBpbnZhbGlkIGNoYXJhY3RlcnMgaW4gYSBXaW5kb3dzIGZpbGUgbmFtZVxyXG5cdFx0Y29uc3QgaW52YWxpZENoYXJzUmVnZXggPSAvWzw+OlwiL1xcXFx8PypcXHgwMC1cXHgxRl0vZztcclxuXHRcdFxyXG5cdFx0Ly8gQ2hlY2sgaWYgdGhlIHN0cmluZyBjb250YWlucyBhbnkgaW52YWxpZCBjaGFyYWN0ZXJzIG9yIHJlc2VydmVkIG5hbWVzXHJcblx0XHRyZXR1cm4gIWludmFsaWRDaGFyc1JlZ2V4LnRlc3Qoc3RyKSAmJiAhL14oY29ufHBybnxhdXh8bnVsfGNvbVswLTldfGxwdFswLTldKSQvaS50ZXN0KHN0cikgJiYgc3RyLmxlbmd0aCA8PSAyNTU7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3RhdGljIGlzVmFsaWRTeXN0ZW1Db2RlTmFtZSggc3RyIDogc3RyaW5nICl7XHJcblxyXG5cdFx0aWYoIXN0cilcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHJcblx0XHRjb25zdCByZWdleCA9IC9bXmEtekEtWjAtOV0vO1xyXG5cdFx0cmV0dXJuICFyZWdleC50ZXN0KHN0cik7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3RhdGljIENvbnZlcnRUb1ZhbGlkV2luZG93c0ZpbGVTdHJpbmcoIHN0ciA6IHN0cmluZyApe1xyXG5cdFx0Ly92YXIgb3V0ID0gKHN0ci5yZXBsYWNlKC9bICZcXC9cXFxcIywrKCkkfiUuJ1wiOio/PD57fV0vZywgXCJcIikpO1xyXG5cdFx0Ly9yZXR1cm4gb3V0OyBcclxuXHRcdC8vIFJlZ3VsYXIgZXhwcmVzc2lvbiB0byBtYXRjaCBpbnZhbGlkIGNoYXJhY3RlcnMgaW4gYSBXaW5kb3dzIGZpbGUgbmFtZVxyXG5cdFx0Y29uc3QgaW52YWxpZENoYXJzUmVnZXggPSAvWzw+OlwiL1xcXFx8PypcXHgwMC1cXHgxRl0vZztcclxuXHJcblx0XHQvLyBSZXBsYWNlIGludmFsaWQgY2hhcmFjdGVycyB3aXRoIGFuIHVuZGVyc2NvcmVcclxuXHRcdGNvbnN0IHZhbGlkU3RyID0gc3RyLnJlcGxhY2UoaW52YWxpZENoYXJzUmVnZXgsIFwiX1wiKTtcclxuXHJcblx0XHQvLyBFbnN1cmUgdGhlIHN0cmluZyBpcyBub3QgbG9uZ2VyIHRoYW4gMjU1IGNoYXJhY3RlcnNcclxuXHRcdHJldHVybiB2YWxpZFN0ci5zbGljZSgwLCAyNTUpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXRpYyAgdXVpZHY0KCkge1xyXG5cdFx0cmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnXHJcblx0XHQucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbiAoYykge1xyXG5cdFx0XHRjb25zdCByID0gTWF0aC5yYW5kb20oKSAqIDE2IHwgMCwgXHJcblx0XHRcdFx0diA9IGMgPT0gJ3gnID8gciA6IChyICYgMHgzIHwgMHg4KTtcclxuXHRcdFx0cmV0dXJuIHYudG9TdHJpbmcoMTYpO1xyXG5cdFx0fSk7XHJcblx0fVxyXG4gXHJcblx0cHVibGljIHN0YXRpYyAgdXVpZFNob3J0KCkge1xyXG5cdFx0cmV0dXJuICd4eHh4eHh4eCdcclxuXHRcdC5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uIChjKSB7XHJcblx0XHRcdGNvbnN0IHIgPSBNYXRoLnJhbmRvbSgpICogMTYgfCAwLCBcclxuXHRcdFx0XHR2ID0gYyA9PSAneCcgPyByIDogKHIgJiAweDMgfCAweDgpO1xyXG5cdFx0XHRyZXR1cm4gdi50b1N0cmluZygxNik7XHJcblx0XHR9KTtcclxuXHR9XHJcbn0iLCJleHBvcnQgdmFyIEVfVElNRU9VVCA9IG5ldyBFcnJvcigndGltZW91dCB3aGlsZSB3YWl0aW5nIGZvciBtdXRleCB0byBiZWNvbWUgYXZhaWxhYmxlJyk7XG5leHBvcnQgdmFyIEVfQUxSRUFEWV9MT0NLRUQgPSBuZXcgRXJyb3IoJ211dGV4IGFscmVhZHkgbG9ja2VkJyk7XG5leHBvcnQgdmFyIEVfQ0FOQ0VMRUQgPSBuZXcgRXJyb3IoJ3JlcXVlc3QgZm9yIGxvY2sgY2FuY2VsZWQnKTtcbiIsImltcG9ydCB7IF9fYXdhaXRlciwgX19nZW5lcmF0b3IgfSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCB7IEVfQ0FOQ0VMRUQgfSBmcm9tICcuL2Vycm9ycyc7XG52YXIgU2VtYXBob3JlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFNlbWFwaG9yZShfdmFsdWUsIF9jYW5jZWxFcnJvcikge1xuICAgICAgICBpZiAoX2NhbmNlbEVycm9yID09PSB2b2lkIDApIHsgX2NhbmNlbEVycm9yID0gRV9DQU5DRUxFRDsgfVxuICAgICAgICB0aGlzLl92YWx1ZSA9IF92YWx1ZTtcbiAgICAgICAgdGhpcy5fY2FuY2VsRXJyb3IgPSBfY2FuY2VsRXJyb3I7XG4gICAgICAgIHRoaXMuX3F1ZXVlID0gW107XG4gICAgICAgIHRoaXMuX3dlaWdodGVkV2FpdGVycyA9IFtdO1xuICAgIH1cbiAgICBTZW1hcGhvcmUucHJvdG90eXBlLmFjcXVpcmUgPSBmdW5jdGlvbiAod2VpZ2h0LCBwcmlvcml0eSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBpZiAod2VpZ2h0ID09PSB2b2lkIDApIHsgd2VpZ2h0ID0gMTsgfVxuICAgICAgICBpZiAocHJpb3JpdHkgPT09IHZvaWQgMCkgeyBwcmlvcml0eSA9IDA7IH1cbiAgICAgICAgaWYgKHdlaWdodCA8PSAwKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCB3ZWlnaHQgXCIuY29uY2F0KHdlaWdodCwgXCI6IG11c3QgYmUgcG9zaXRpdmVcIikpO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgdmFyIHRhc2sgPSB7IHJlc29sdmU6IHJlc29sdmUsIHJlamVjdDogcmVqZWN0LCB3ZWlnaHQ6IHdlaWdodCwgcHJpb3JpdHk6IHByaW9yaXR5IH07XG4gICAgICAgICAgICB2YXIgaSA9IGZpbmRJbmRleEZyb21FbmQoX3RoaXMuX3F1ZXVlLCBmdW5jdGlvbiAob3RoZXIpIHsgcmV0dXJuIHByaW9yaXR5IDw9IG90aGVyLnByaW9yaXR5OyB9KTtcbiAgICAgICAgICAgIGlmIChpID09PSAtMSAmJiB3ZWlnaHQgPD0gX3RoaXMuX3ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgLy8gTmVlZHMgaW1tZWRpYXRlIGRpc3BhdGNoLCBza2lwIHRoZSBxdWV1ZVxuICAgICAgICAgICAgICAgIF90aGlzLl9kaXNwYXRjaEl0ZW0odGFzayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBfdGhpcy5fcXVldWUuc3BsaWNlKGkgKyAxLCAwLCB0YXNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBTZW1hcGhvcmUucHJvdG90eXBlLnJ1bkV4Y2x1c2l2ZSA9IGZ1bmN0aW9uIChjYWxsYmFja18xKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgYXJndW1lbnRzLCB2b2lkIDAsIGZ1bmN0aW9uIChjYWxsYmFjaywgd2VpZ2h0LCBwcmlvcml0eSkge1xuICAgICAgICAgICAgdmFyIF9hLCB2YWx1ZSwgcmVsZWFzZTtcbiAgICAgICAgICAgIGlmICh3ZWlnaHQgPT09IHZvaWQgMCkgeyB3ZWlnaHQgPSAxOyB9XG4gICAgICAgICAgICBpZiAocHJpb3JpdHkgPT09IHZvaWQgMCkgeyBwcmlvcml0eSA9IDA7IH1cbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2IpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKF9iLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDogcmV0dXJuIFs0IC8qeWllbGQqLywgdGhpcy5hY3F1aXJlKHdlaWdodCwgcHJpb3JpdHkpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgX2EgPSBfYi5zZW50KCksIHZhbHVlID0gX2FbMF0sIHJlbGVhc2UgPSBfYVsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9iLmxhYmVsID0gMjtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgX2IudHJ5cy5wdXNoKFsyLCAsIDQsIDVdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIGNhbGxiYWNrKHZhbHVlKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzogcmV0dXJuIFsyIC8qcmV0dXJuKi8sIF9iLnNlbnQoKV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbGVhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNyAvKmVuZGZpbmFsbHkqL107XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgNTogcmV0dXJuIFsyIC8qcmV0dXJuKi9dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIFNlbWFwaG9yZS5wcm90b3R5cGUud2FpdEZvclVubG9jayA9IGZ1bmN0aW9uICh3ZWlnaHQsIHByaW9yaXR5KSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGlmICh3ZWlnaHQgPT09IHZvaWQgMCkgeyB3ZWlnaHQgPSAxOyB9XG4gICAgICAgIGlmIChwcmlvcml0eSA9PT0gdm9pZCAwKSB7IHByaW9yaXR5ID0gMDsgfVxuICAgICAgICBpZiAod2VpZ2h0IDw9IDApXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIHdlaWdodCBcIi5jb25jYXQod2VpZ2h0LCBcIjogbXVzdCBiZSBwb3NpdGl2ZVwiKSk7XG4gICAgICAgIGlmICh0aGlzLl9jb3VsZExvY2tJbW1lZGlhdGVseSh3ZWlnaHQsIHByaW9yaXR5KSkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5fd2VpZ2h0ZWRXYWl0ZXJzW3dlaWdodCAtIDFdKVxuICAgICAgICAgICAgICAgICAgICBfdGhpcy5fd2VpZ2h0ZWRXYWl0ZXJzW3dlaWdodCAtIDFdID0gW107XG4gICAgICAgICAgICAgICAgaW5zZXJ0U29ydGVkKF90aGlzLl93ZWlnaHRlZFdhaXRlcnNbd2VpZ2h0IC0gMV0sIHsgcmVzb2x2ZTogcmVzb2x2ZSwgcHJpb3JpdHk6IHByaW9yaXR5IH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFNlbWFwaG9yZS5wcm90b3R5cGUuaXNMb2NrZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl92YWx1ZSA8PSAwO1xuICAgIH07XG4gICAgU2VtYXBob3JlLnByb3RvdHlwZS5nZXRWYWx1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICAgIH07XG4gICAgU2VtYXBob3JlLnByb3RvdHlwZS5zZXRWYWx1ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgICAgICB0aGlzLl9kaXNwYXRjaFF1ZXVlKCk7XG4gICAgfTtcbiAgICBTZW1hcGhvcmUucHJvdG90eXBlLnJlbGVhc2UgPSBmdW5jdGlvbiAod2VpZ2h0KSB7XG4gICAgICAgIGlmICh3ZWlnaHQgPT09IHZvaWQgMCkgeyB3ZWlnaHQgPSAxOyB9XG4gICAgICAgIGlmICh3ZWlnaHQgPD0gMClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgd2VpZ2h0IFwiLmNvbmNhdCh3ZWlnaHQsIFwiOiBtdXN0IGJlIHBvc2l0aXZlXCIpKTtcbiAgICAgICAgdGhpcy5fdmFsdWUgKz0gd2VpZ2h0O1xuICAgICAgICB0aGlzLl9kaXNwYXRjaFF1ZXVlKCk7XG4gICAgfTtcbiAgICBTZW1hcGhvcmUucHJvdG90eXBlLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdGhpcy5fcXVldWUuZm9yRWFjaChmdW5jdGlvbiAoZW50cnkpIHsgcmV0dXJuIGVudHJ5LnJlamVjdChfdGhpcy5fY2FuY2VsRXJyb3IpOyB9KTtcbiAgICAgICAgdGhpcy5fcXVldWUgPSBbXTtcbiAgICB9O1xuICAgIFNlbWFwaG9yZS5wcm90b3R5cGUuX2Rpc3BhdGNoUXVldWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2RyYWluVW5sb2NrV2FpdGVycygpO1xuICAgICAgICB3aGlsZSAodGhpcy5fcXVldWUubGVuZ3RoID4gMCAmJiB0aGlzLl9xdWV1ZVswXS53ZWlnaHQgPD0gdGhpcy5fdmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuX2Rpc3BhdGNoSXRlbSh0aGlzLl9xdWV1ZS5zaGlmdCgpKTtcbiAgICAgICAgICAgIHRoaXMuX2RyYWluVW5sb2NrV2FpdGVycygpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBTZW1hcGhvcmUucHJvdG90eXBlLl9kaXNwYXRjaEl0ZW0gPSBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICB2YXIgcHJldmlvdXNWYWx1ZSA9IHRoaXMuX3ZhbHVlO1xuICAgICAgICB0aGlzLl92YWx1ZSAtPSBpdGVtLndlaWdodDtcbiAgICAgICAgaXRlbS5yZXNvbHZlKFtwcmV2aW91c1ZhbHVlLCB0aGlzLl9uZXdSZWxlYXNlcihpdGVtLndlaWdodCldKTtcbiAgICB9O1xuICAgIFNlbWFwaG9yZS5wcm90b3R5cGUuX25ld1JlbGVhc2VyID0gZnVuY3Rpb24gKHdlaWdodCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgY2FsbGVkID0gZmFsc2U7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGVkKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIGNhbGxlZCA9IHRydWU7XG4gICAgICAgICAgICBfdGhpcy5yZWxlYXNlKHdlaWdodCk7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICBTZW1hcGhvcmUucHJvdG90eXBlLl9kcmFpblVubG9ja1dhaXRlcnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl9xdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGZvciAodmFyIHdlaWdodCA9IHRoaXMuX3ZhbHVlOyB3ZWlnaHQgPiAwOyB3ZWlnaHQtLSkge1xuICAgICAgICAgICAgICAgIHZhciB3YWl0ZXJzID0gdGhpcy5fd2VpZ2h0ZWRXYWl0ZXJzW3dlaWdodCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmICghd2FpdGVycylcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgd2FpdGVycy5mb3JFYWNoKGZ1bmN0aW9uICh3YWl0ZXIpIHsgcmV0dXJuIHdhaXRlci5yZXNvbHZlKCk7IH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuX3dlaWdodGVkV2FpdGVyc1t3ZWlnaHQgLSAxXSA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIHF1ZXVlZFByaW9yaXR5XzEgPSB0aGlzLl9xdWV1ZVswXS5wcmlvcml0eTtcbiAgICAgICAgICAgIGZvciAodmFyIHdlaWdodCA9IHRoaXMuX3ZhbHVlOyB3ZWlnaHQgPiAwOyB3ZWlnaHQtLSkge1xuICAgICAgICAgICAgICAgIHZhciB3YWl0ZXJzID0gdGhpcy5fd2VpZ2h0ZWRXYWl0ZXJzW3dlaWdodCAtIDFdO1xuICAgICAgICAgICAgICAgIGlmICghd2FpdGVycylcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgdmFyIGkgPSB3YWl0ZXJzLmZpbmRJbmRleChmdW5jdGlvbiAod2FpdGVyKSB7IHJldHVybiB3YWl0ZXIucHJpb3JpdHkgPD0gcXVldWVkUHJpb3JpdHlfMTsgfSk7XG4gICAgICAgICAgICAgICAgKGkgPT09IC0xID8gd2FpdGVycyA6IHdhaXRlcnMuc3BsaWNlKDAsIGkpKVxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaCgoZnVuY3Rpb24gKHdhaXRlcikgeyByZXR1cm4gd2FpdGVyLnJlc29sdmUoKTsgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBTZW1hcGhvcmUucHJvdG90eXBlLl9jb3VsZExvY2tJbW1lZGlhdGVseSA9IGZ1bmN0aW9uICh3ZWlnaHQsIHByaW9yaXR5KSB7XG4gICAgICAgIHJldHVybiAodGhpcy5fcXVldWUubGVuZ3RoID09PSAwIHx8IHRoaXMuX3F1ZXVlWzBdLnByaW9yaXR5IDwgcHJpb3JpdHkpICYmXG4gICAgICAgICAgICB3ZWlnaHQgPD0gdGhpcy5fdmFsdWU7XG4gICAgfTtcbiAgICByZXR1cm4gU2VtYXBob3JlO1xufSgpKTtcbmZ1bmN0aW9uIGluc2VydFNvcnRlZChhLCB2KSB7XG4gICAgdmFyIGkgPSBmaW5kSW5kZXhGcm9tRW5kKGEsIGZ1bmN0aW9uIChvdGhlcikgeyByZXR1cm4gdi5wcmlvcml0eSA8PSBvdGhlci5wcmlvcml0eTsgfSk7XG4gICAgYS5zcGxpY2UoaSArIDEsIDAsIHYpO1xufVxuZnVuY3Rpb24gZmluZEluZGV4RnJvbUVuZChhLCBwcmVkaWNhdGUpIHtcbiAgICBmb3IgKHZhciBpID0gYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBpZiAocHJlZGljYXRlKGFbaV0pKSB7XG4gICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG59XG5leHBvcnQgZGVmYXVsdCBTZW1hcGhvcmU7XG4iLCJpbXBvcnQgeyBfX2F3YWl0ZXIsIF9fZ2VuZXJhdG9yIH0gZnJvbSBcInRzbGliXCI7XG5pbXBvcnQgU2VtYXBob3JlIGZyb20gJy4vU2VtYXBob3JlJztcbnZhciBNdXRleCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBNdXRleChjYW5jZWxFcnJvcikge1xuICAgICAgICB0aGlzLl9zZW1hcGhvcmUgPSBuZXcgU2VtYXBob3JlKDEsIGNhbmNlbEVycm9yKTtcbiAgICB9XG4gICAgTXV0ZXgucHJvdG90eXBlLmFjcXVpcmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgYXJndW1lbnRzLCB2b2lkIDAsIGZ1bmN0aW9uIChwcmlvcml0eSkge1xuICAgICAgICAgICAgdmFyIF9hLCByZWxlYXNlcjtcbiAgICAgICAgICAgIGlmIChwcmlvcml0eSA9PT0gdm9pZCAwKSB7IHByaW9yaXR5ID0gMDsgfVxuICAgICAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYikge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoX2IubGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAwOiByZXR1cm4gWzQgLyp5aWVsZCovLCB0aGlzLl9zZW1hcGhvcmUuYWNxdWlyZSgxLCBwcmlvcml0eSldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICBfYSA9IF9iLnNlbnQoKSwgcmVsZWFzZXIgPSBfYVsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovLCByZWxlYXNlcl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgTXV0ZXgucHJvdG90eXBlLnJ1bkV4Y2x1c2l2ZSA9IGZ1bmN0aW9uIChjYWxsYmFjaywgcHJpb3JpdHkpIHtcbiAgICAgICAgaWYgKHByaW9yaXR5ID09PSB2b2lkIDApIHsgcHJpb3JpdHkgPSAwOyB9XG4gICAgICAgIHJldHVybiB0aGlzLl9zZW1hcGhvcmUucnVuRXhjbHVzaXZlKGZ1bmN0aW9uICgpIHsgcmV0dXJuIGNhbGxiYWNrKCk7IH0sIDEsIHByaW9yaXR5KTtcbiAgICB9O1xuICAgIE11dGV4LnByb3RvdHlwZS5pc0xvY2tlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbWFwaG9yZS5pc0xvY2tlZCgpO1xuICAgIH07XG4gICAgTXV0ZXgucHJvdG90eXBlLndhaXRGb3JVbmxvY2sgPSBmdW5jdGlvbiAocHJpb3JpdHkpIHtcbiAgICAgICAgaWYgKHByaW9yaXR5ID09PSB2b2lkIDApIHsgcHJpb3JpdHkgPSAwOyB9XG4gICAgICAgIHJldHVybiB0aGlzLl9zZW1hcGhvcmUud2FpdEZvclVubG9jaygxLCBwcmlvcml0eSk7XG4gICAgfTtcbiAgICBNdXRleC5wcm90b3R5cGUucmVsZWFzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NlbWFwaG9yZS5pc0xvY2tlZCgpKVxuICAgICAgICAgICAgdGhpcy5fc2VtYXBob3JlLnJlbGVhc2UoKTtcbiAgICB9O1xuICAgIE11dGV4LnByb3RvdHlwZS5jYW5jZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZW1hcGhvcmUuY2FuY2VsKCk7XG4gICAgfTtcbiAgICByZXR1cm4gTXV0ZXg7XG59KCkpO1xuZXhwb3J0IGRlZmF1bHQgTXV0ZXg7XG4iLCJpbXBvcnQgUGx1Z2luSGFuZGxlciBmcm9tIFwiLi4vT2JzaWRpYW5VSS9hcHBcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBGaWxlSGFuZGxlcntcclxuXHJcblx0cHJpdmF0ZSBzdGF0aWMgX2luc3RhbmNlIDogRmlsZUhhbmRsZXI7ICBcclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKXtcclxuXHRcdGlmKEZpbGVIYW5kbGVyLl9pbnN0YW5jZSA9PSBudWxsICl7XHJcblx0XHRcdEZpbGVIYW5kbGVyLl9pbnN0YW5jZSAgPSBuZXcgRmlsZUhhbmRsZXIoKTsgXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gRmlsZUhhbmRsZXIuX2luc3RhbmNlO1xyXG5cdH1cclxuXHJcblxyXG5cdC8vIEZvbGRlciBIYW5kbGluZ1xyXG5cdHB1YmxpYyBzdGF0aWMgYXN5bmMgbWtkaXIgKCBwYXRoICl7XHJcblx0XHRyZXR1cm4gYXdhaXQgUGx1Z2luSGFuZGxlci5BcHAudmF1bHQuYWRhcHRlci5ta2RpciggcGF0aCApO1xyXG5cdH1cclxuXHRwdWJsaWMgc3RhdGljIGFzeW5jIHJtZGlyKHBhdGg6c3RyaW5nKXsgXHJcblx0XHRyZXR1cm4gYXdhaXQgUGx1Z2luSGFuZGxlci5BcHAudmF1bHQuYWRhcHRlci5ybWRpcihwYXRoLHRydWUpO1xyXG5cdH1cclxuXHJcblxyXG5cdC8vIFBhdGggY29tbWFuZHNcclxuXHRwdWJsaWMgc3RhdGljIGFzeW5jIGxzZGlyKCBwYXRoIDogc3RyaW5nICl7XHJcblx0XHRyZXR1cm4gYXdhaXQgUGx1Z2luSGFuZGxlci5BcHAudmF1bHQuYWRhcHRlci5saXN0KHBhdGgpO1xyXG5cdH1cclxuXHRwdWJsaWMgc3RhdGljIGFzeW5jIGV4aXN0cyggcGF0aCA6IHN0cmluZyApIDogUHJvbWlzZTxib29sZWFuPiB7XHJcblx0XHRyZXR1cm4gYXdhaXQgUGx1Z2luSGFuZGxlci5BcHAudmF1bHQuYWRhcHRlci5leGlzdHMoIHBhdGggLCBmYWxzZSApO1xyXG5cdH1cclxuXHJcblxyXG5cdC8vIEZpbGUgQ29tbWFuZHMgXHJcblx0cHVibGljIHN0YXRpYyBhc3luYyBzYXZlRmlsZSggcGF0aCA6IHN0cmluZyAsIGZpbGVDb250ZW50OnN0cmluZyApeyBcclxuXHRcdHJldHVybiBhd2FpdCBQbHVnaW5IYW5kbGVyLkFwcC52YXVsdC5hZGFwdGVyLndyaXRlKHBhdGgsZmlsZUNvbnRlbnQpO1xyXG5cdH1cdFxyXG5cdHB1YmxpYyBzdGF0aWMgYXN5bmMgcmVhZEZpbGUocGF0aDpzdHJpbmcpeyBcclxuXHRcdHJldHVybiBhd2FpdCBQbHVnaW5IYW5kbGVyLkFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XHJcblx0fVxyXG4gXHJcblx0cHVibGljIHN0YXRpYyBhc3luYyBybShwYXRoOnN0cmluZyl7IFxyXG5cdFx0cmV0dXJuIGF3YWl0IFBsdWdpbkhhbmRsZXIuQXBwLnZhdWx0LmFkYXB0ZXIucmVtb3ZlKHBhdGgpO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXRpYyBhc3luYyBjb3B5KHBhdGg6c3RyaW5nLCBuZXdQYXRoOnN0cmluZyApeyBcclxuXHRcdHJldHVybiBhd2FpdCBQbHVnaW5IYW5kbGVyLkFwcC52YXVsdC5hZGFwdGVyLmNvcHkocGF0aCxuZXdQYXRoKTtcclxuXHR9XHJcblxyXG59XHJcbiIsImV4cG9ydCB2YXIgQkFTRV9TQ0hFTUUgPSAnX2Jhc2UnO1xuZXhwb3J0IHZhciBOb091dHB1dCA9IHtcbiAgICBvdXRFcnJvcjogZnVuY3Rpb24gKG1zZykgeyB9LFxuICAgIG91dExvZzogZnVuY3Rpb24gKG1zZykgeyB9XG59O1xuZXhwb3J0IHZhciBKU09OX1RBR1M7XG4oZnVuY3Rpb24gKEpTT05fVEFHUykge1xuICAgIEpTT05fVEFHU1tcIkpTT05fUFJPUEVSVFlcIl0gPSBcIkpTT05fUFJPUEVSVFlcIjtcbiAgICBKU09OX1RBR1NbXCJKU09OX1BST1BFUlRZX1RZUEVEXCJdID0gXCJKU09OX1BST1BFUlRZX1RZUEVEXCI7XG4gICAgSlNPTl9UQUdTW1wiSlNPTl9QUk9QRVJUWV9UWVBFRF9TS0lQX0ZPUkNFRFwiXSA9IFwiSlNPTl9QUk9QRVJUWV9UWVBFRF9TS0lQX0ZPUkNFRFwiO1xuICAgIEpTT05fVEFHU1tcIkpTT05fUFJPUEVSVFlfTkFNRV9NQVBfSU5cIl0gPSBcIkpTT05fUFJPUEVSVFlfTkFNRV9NQVBfSU5cIjtcbiAgICBKU09OX1RBR1NbXCJKU09OX1BST1BFUlRZX05BTUVfTUFQX09VVFwiXSA9IFwiSlNPTl9QUk9QRVJUWV9OQU1FX01BUF9PVVRcIjtcbiAgICBKU09OX1RBR1NbXCJKU09OX1BST1BFUlRZX0ZVTkNfTUFQX0lOXCJdID0gXCJKU09OX1BST1BFUlRZX0ZVTkNfTUFQX0lOXCI7XG4gICAgSlNPTl9UQUdTW1wiSlNPTl9QUk9QRVJUWV9GVU5DX01BUF9PVVRcIl0gPSBcIkpTT05fUFJPUEVSVFlfRlVOQ19NQVBfT1VUXCI7XG4gICAgSlNPTl9UQUdTW1wiSlNPTl9QUk9QRVJUWV9GT1JDRV9CQVNFX1RZUEVcIl0gPSBcIkpTT05fUFJPUEVSVFlfRk9SQ0VfQkFTRV9UWVBFXCI7XG4gICAgSlNPTl9UQUdTW1wiSlNPTl9QUk9QRVJUWV9GT1JDRV9BUlJBWVwiXSA9IFwiSlNPTl9QUk9QRVJUWV9GT1JDRV9BUlJBWVwiO1xuICAgIEpTT05fVEFHU1tcIkpTT05fT0JKRUNUX09OX0FGVEVSX0RFX1NFUklBTElaQVRJT05cIl0gPSBcIkpTT05fT0JKRUNUX09OX0FGVEVSX0RFX1NFUklBTElaQVRJT05cIjtcbiAgICBKU09OX1RBR1NbXCJKU09OX09CSkVDVF9PTl9BRlRFUl9TRVJJQUxJWkFUSU9OX0JFRk9SRV9TVFJJTkdcIl0gPSBcIkpTT05fT0JKRUNUX09OX0FGVEVSX1NFUklBTElaQVRJT05fQkVGT1JFX1NUUklOR1wiO1xuICAgIEpTT05fVEFHU1tcIkpTT05fT0JKRUNUX09OX0FGVEVSX1NFUklBTElaQVRJT05cIl0gPSBcIkpTT05fT0JKRUNUX09OX0FGVEVSX1NFUklBTElaQVRJT05cIjtcbiAgICBKU09OX1RBR1NbXCJKU09OX09CSkVDVF9PTl9CRUZPUkVfU0VSSUFMSVpBVElPTlwiXSA9IFwiSlNPTl9PQkpFQ1RfT05fQkVGT1JFX1NFUklBTElaQVRJT05cIjtcbiAgICBKU09OX1RBR1NbXCJKU09OX09CSkVDVF9PTl9CRUZPUkVfREVfU0VSSUFMSVpBVElPTlwiXSA9IFwiSlNPTl9PQkpFQ1RfT05fQkVGT1JFX0RFX1NFUklBTElaQVRJT05cIjtcbn0pKEpTT05fVEFHUyB8fCAoSlNPTl9UQUdTID0ge30pKTtcbmV4cG9ydCB2YXIgSlNPTl9CQVNFVFlQRVM7XG4oZnVuY3Rpb24gKEpTT05fQkFTRVRZUEVTKSB7XG4gICAgSlNPTl9CQVNFVFlQRVNbXCJzdHJpbmdcIl0gPSBcInN0cmluZ1wiO1xuICAgIEpTT05fQkFTRVRZUEVTW1wiYm9vbFwiXSA9IFwiYm9vbFwiO1xuICAgIEpTT05fQkFTRVRZUEVTW1wibnVtYmVyXCJdID0gXCJudW1iZXJcIjtcbn0pKEpTT05fQkFTRVRZUEVTIHx8IChKU09OX0JBU0VUWVBFUyA9IHt9KSk7XG4iLCJpbXBvcnQgeyBCQVNFX1NDSEVNRSB9IGZyb20gXCIuL0pzb25Nb2R1bGVDb25zdGFudHNcIjtcbmZ1bmN0aW9uIGNyZWF0ZUd1aWQoKSB7XG4gICAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnXG4gICAgICAgIC5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uIChjKSB7XG4gICAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKSAqIDE2IHwgMCwgdiA9IGMgPT0gJ3gnID8gciA6IChyICYgMHgzIHwgMHg4KTtcbiAgICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgIH0pO1xufVxudmFyIHNlbGZLZXkgPSBjcmVhdGVHdWlkKCkgKyBcIlNFTEZcIjtcbnZhciBNZXRhRGF0YVRhZ05hbWUgPSAnZ2ptZCc7IC8vIEdyb2JheCBKc29uIE1ldGEgRGF0YTtcbnZhciBSZWZsZWN0ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFJlZmxlY3QoKSB7XG4gICAgfVxuICAgIFJlZmxlY3QuZ2V0UHJvdG90eXBlID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICB2YXIgYTtcbiAgICAgICAgaWYgKHR5cGVvZiBvYmogPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgYSA9IG9iai5wcm90b3R5cGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhID0gb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYTtcbiAgICB9O1xuICAgIFJlZmxlY3Quc2V0UHJvdG90eXBlID0gZnVuY3Rpb24gKG9iaiwgcHJvdG90eXBlKSB7XG4gICAgICAgIC8vT2JqZWN0LnNldFByb3RvdHlwZU9mKCBvYmogLCBwcm90b3R5cGUgKVxuICAgICAgICBpZiAodHlwZW9mIG9iaiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBJbXBsZW1lbnRlZCBFcnJvciwgcGxlYXNlIHJlcG9ydCB0aGUgc2NlbmFyaW8gdG8gbWUnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihvYmosIHByb3RvdHlwZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFJlZmxlY3QuZ2V0T3JDcmVhdGVBbGxNZXRhRGF0YSA9IGZ1bmN0aW9uIChvYmosIGNyZWF0ZSkge1xuICAgICAgICBpZiAoY3JlYXRlID09PSB2b2lkIDApIHsgY3JlYXRlID0gZmFsc2U7IH1cbiAgICAgICAgdmFyIHByb3RvdHlwZSA9IFJlZmxlY3QuZ2V0UHJvdG90eXBlKG9iaik7XG4gICAgICAgIGlmIChwcm90b3R5cGUgPT09IE9iamVjdC5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcm90b3R5cGUgPT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB2YXIgYSA9IHByb3RvdHlwZTtcbiAgICAgICAgaWYgKCEoYVsnZ2ptZCddKSkge1xuICAgICAgICAgICAgaWYgKCFjcmVhdGUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBhWydnam1kJ10gPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBhID0gYVsnZ2ptZCddO1xuICAgICAgICBpZiAoIWFbcHJvdG90eXBlLmNvbnN0cnVjdG9yLm5hbWVdKSB7XG4gICAgICAgICAgICBpZiAoIWNyZWF0ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGFbcHJvdG90eXBlLmNvbnN0cnVjdG9yLm5hbWVdID0ge307XG4gICAgICAgIH1cbiAgICAgICAgYSA9IGFbcHJvdG90eXBlLmNvbnN0cnVjdG9yLm5hbWVdO1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9O1xuICAgIFJlZmxlY3QuZ2V0T3JDcmVhdGVEZWZpbmVkTWV0YURhdGEgPSBmdW5jdGlvbiAob2JqLCBzY2hlbWUsIGNyZWF0ZSkge1xuICAgICAgICBpZiAoY3JlYXRlID09PSB2b2lkIDApIHsgY3JlYXRlID0gZmFsc2U7IH1cbiAgICAgICAgdmFyIGEgPSBSZWZsZWN0LmdldE9yQ3JlYXRlQWxsTWV0YURhdGEob2JqLCBjcmVhdGUpO1xuICAgICAgICBpZiAoIWEpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgaWYgKCEoYVtzY2hlbWVdKSkge1xuICAgICAgICAgICAgaWYgKCFjcmVhdGUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBhW3NjaGVtZV0gPSB7fTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYVtzY2hlbWVdO1xuICAgIH07XG4gICAgLy8gS0VZUyAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLVxuICAgIFJlZmxlY3QuZ2V0TWV0YWRhdGFLZXlzID0gZnVuY3Rpb24gKG9iaiwga2V5LCBzY2hlbWUpIHtcbiAgICAgICAgaWYgKHNjaGVtZSA9PT0gdm9pZCAwKSB7IHNjaGVtZSA9IEJBU0VfU0NIRU1FOyB9XG4gICAgICAgIHZhciBhID0gUmVmbGVjdC5nZXRPckNyZWF0ZURlZmluZWRNZXRhRGF0YShvYmosIHNjaGVtZSk7XG4gICAgICAgIGlmICghYSB8fCAhYVtrZXldKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGFba2V5XSk7XG4gICAgfTtcbiAgICBSZWZsZWN0LmdldE93bk1ldGFEYXRhS2V5cyA9IGZ1bmN0aW9uIChvYmosIHNjaGVtZSkge1xuICAgICAgICBpZiAoc2NoZW1lID09PSB2b2lkIDApIHsgc2NoZW1lID0gQkFTRV9TQ0hFTUU7IH1cbiAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0TWV0YWRhdGFLZXlzKG9iaiwgc2VsZktleSwgc2NoZW1lKTtcbiAgICB9O1xuICAgIC8vIEdFVCAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLVxuICAgIFJlZmxlY3QuZ2V0TWV0YWRhdGEgPSBmdW5jdGlvbiAobWV0YVRhZywgdGFyZ2V0LCBwcm9wZXJ0eUtleSwgc2NoZW1lKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgaWYgKHNjaGVtZSA9PT0gdm9pZCAwKSB7IHNjaGVtZSA9IEJBU0VfU0NIRU1FOyB9XG4gICAgICAgIHZhciBhID0gUmVmbGVjdC5nZXRPckNyZWF0ZURlZmluZWRNZXRhRGF0YSh0YXJnZXQsIHNjaGVtZSk7XG4gICAgICAgIGlmICghYVtwcm9wZXJ0eUtleV0pXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIChfYSA9IGFbcHJvcGVydHlLZXldW21ldGFUYWddKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBudWxsO1xuICAgIH07XG4gICAgUmVmbGVjdC5nZXRPd25NZXRhRGF0YSA9IGZ1bmN0aW9uIChtZXRhVGFnLCB0YXJnZXQsIHNjaGVtZSkge1xuICAgICAgICBpZiAoc2NoZW1lID09PSB2b2lkIDApIHsgc2NoZW1lID0gQkFTRV9TQ0hFTUU7IH1cbiAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0TWV0YWRhdGEobWV0YVRhZywgdGFyZ2V0LCBzZWxmS2V5LCBzY2hlbWUpO1xuICAgIH07XG4gICAgLy8gREVGSU5FIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tXG4gICAgUmVmbGVjdC5kZWZpbmVNZXRhRGF0YSA9IGZ1bmN0aW9uIChtZXRhVGFnLCBkYXRhLCB0YXJnZXQsIHByb3BlcnR5S2V5LCBzY2hlbWUpIHtcbiAgICAgICAgaWYgKHNjaGVtZSA9PT0gdm9pZCAwKSB7IHNjaGVtZSA9IEJBU0VfU0NIRU1FOyB9XG4gICAgICAgIHZhciBhID0gUmVmbGVjdC5nZXRPckNyZWF0ZURlZmluZWRNZXRhRGF0YSh0YXJnZXQsIHNjaGVtZSwgdHJ1ZSk7XG4gICAgICAgIGlmICghYVtwcm9wZXJ0eUtleV0pXG4gICAgICAgICAgICBhW3Byb3BlcnR5S2V5XSA9IHt9O1xuICAgICAgICBhW3Byb3BlcnR5S2V5XVttZXRhVGFnXSA9IGRhdGE7XG4gICAgfTtcbiAgICBSZWZsZWN0LmRlZmluZU93bk1ldGFEYXRhID0gZnVuY3Rpb24gKG1ldGFUYWcsIGRhdGEsIHRhcmdldCwgc2NoZW1lKSB7XG4gICAgICAgIGlmIChzY2hlbWUgPT09IHZvaWQgMCkgeyBzY2hlbWUgPSBCQVNFX1NDSEVNRTsgfVxuICAgICAgICByZXR1cm4gUmVmbGVjdC5kZWZpbmVNZXRhRGF0YShtZXRhVGFnLCBkYXRhLCB0YXJnZXQsIHNlbGZLZXksIHNjaGVtZSk7XG4gICAgfTtcbiAgICAvLyBoYXMgLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS1cbiAgICBSZWZsZWN0Lmhhc01ldGFEYXRhID0gZnVuY3Rpb24gKG1ldGFUYWcsIHRhcmdldCwga2V5LCBzY2hlbWUpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICBpZiAoc2NoZW1lID09PSB2b2lkIDApIHsgc2NoZW1lID0gQkFTRV9TQ0hFTUU7IH1cbiAgICAgICAgdmFyIGEgPSBSZWZsZWN0LmdldE9yQ3JlYXRlRGVmaW5lZE1ldGFEYXRhKHRhcmdldCwgc2NoZW1lKTtcbiAgICAgICAgaWYgKGEgPT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKCEoYVtrZXldKSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIChfYSA9IGFba2V5XVttZXRhVGFnXSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogZmFsc2U7XG4gICAgfTtcbiAgICBSZWZsZWN0Lmhhc093bk1ldGFEYXRhID0gZnVuY3Rpb24gKG1ldGFUYWcsIHRhcmdldCwgc2NoZW1lKSB7XG4gICAgICAgIGlmIChzY2hlbWUgPT09IHZvaWQgMCkgeyBzY2hlbWUgPSBCQVNFX1NDSEVNRTsgfVxuICAgICAgICByZXR1cm4gUmVmbGVjdC5oYXNNZXRhRGF0YShtZXRhVGFnLCB0YXJnZXQsIHNlbGZLZXksIHNjaGVtZSk7XG4gICAgfTtcbiAgICBSZWZsZWN0LmdldEFsbE1ldGEgPSBmdW5jdGlvbiAob2JqLCBzY2hlbWUpIHtcbiAgICAgICAgaWYgKHNjaGVtZSkge1xuICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0T3JDcmVhdGVEZWZpbmVkTWV0YURhdGEob2JqLCBzY2hlbWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0T3JDcmVhdGVBbGxNZXRhRGF0YShvYmosIHRydWUpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gUmVmbGVjdDtcbn0oKSk7XG5leHBvcnQgeyBSZWZsZWN0IH07XG4iLCJpbXBvcnQgeyBCQVNFX1NDSEVNRSB9IGZyb20gXCIuL0pzb25Nb2R1bGVDb25zdGFudHNcIjtcbmltcG9ydCB7IFJlZmxlY3QgfSBmcm9tIFwiLi9SZWZsZWN0XCI7XG5leHBvcnQgZnVuY3Rpb24gaGFzTWV0YURhdGFJblNjaGVtZShtZXRhVGFnLCB0YXJnZXQsIHByb3BlcnR5S2V5LCBzY2hlbWUpIHtcbiAgICB0cnkge1xuICAgICAgICB2YXIgZGF0YSA9IFJlZmxlY3QuZ2V0TWV0YWRhdGEobWV0YVRhZywgdGFyZ2V0LCBwcm9wZXJ0eUtleSk7XG4gICAgICAgIGlmIChkYXRhW3NjaGVtZV0gIT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbi8vIEdFVCAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLVxuZXhwb3J0IGZ1bmN0aW9uIGdldE1ldGFkYXRhKG1ldGFUYWcsIHRhcmdldCwgcHJvcGVydHlLZXksIHNjaGVtZSkge1xuICAgIGlmIChzY2hlbWUgPT09IHZvaWQgMCkgeyBzY2hlbWUgPSBCQVNFX1NDSEVNRTsgfVxuICAgIHJldHVybiBSZWZsZWN0LmdldE1ldGFkYXRhKG1ldGFUYWcsIHRhcmdldCwgcHJvcGVydHlLZXksIHNjaGVtZSk7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0T3duTWV0YURhdGEobWV0YVRhZywgdGFyZ2V0LCBzY2hlbWUpIHtcbiAgICBpZiAoc2NoZW1lID09PSB2b2lkIDApIHsgc2NoZW1lID0gQkFTRV9TQ0hFTUU7IH1cbiAgICByZXR1cm4gUmVmbGVjdC5nZXRPd25NZXRhRGF0YShtZXRhVGFnLCB0YXJnZXQsIHNjaGVtZSk7XG59XG4vLyBERUZJTkUgLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS1cbmV4cG9ydCBmdW5jdGlvbiBzZXRNZXRhZGF0YShtZXRhVGFnLCB2YWx1ZSwgdGFyZ2V0LCBwcm9wZXJ0eUtleSwgc2NoZW1lKSB7XG4gICAgaWYgKHNjaGVtZSA9PT0gdm9pZCAwKSB7IHNjaGVtZSA9IEJBU0VfU0NIRU1FOyB9XG4gICAgUmVmbGVjdC5kZWZpbmVNZXRhRGF0YShtZXRhVGFnLCB2YWx1ZSwgdGFyZ2V0LCBwcm9wZXJ0eUtleSwgc2NoZW1lKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXRPd25NZXRhRGF0YShtZXRhVGFnLCB0YXJnZXQsIHZhbHVlLCBzY2hlbWUpIHtcbiAgICBpZiAoc2NoZW1lID09PSB2b2lkIDApIHsgc2NoZW1lID0gQkFTRV9TQ0hFTUU7IH1cbiAgICBSZWZsZWN0LmRlZmluZU93bk1ldGFEYXRhKG1ldGFUYWcsIHZhbHVlLCB0YXJnZXQsIHNjaGVtZSk7XG59XG4vLyBLRVlTIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3duTWV0YURhdGFLZXlzKHRhcmdldCwgc2NoZW1lKSB7XG4gICAgaWYgKHNjaGVtZSA9PT0gdm9pZCAwKSB7IHNjaGVtZSA9IEJBU0VfU0NIRU1FOyB9XG4gICAgdmFyIGtleXMgPSBSZWZsZWN0LmdldE93bk1ldGFEYXRhS2V5cyh0YXJnZXQsIHNjaGVtZSk7XG4gICAgcmV0dXJuIGtleXM7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0TWV0YURhdGFLZXlzKHRhcmdldCwga2V5LCBzY2hlbWUpIHtcbiAgICBpZiAoc2NoZW1lID09PSB2b2lkIDApIHsgc2NoZW1lID0gQkFTRV9TQ0hFTUU7IH1cbiAgICB2YXIga2V5cyA9IFJlZmxlY3QuZ2V0TWV0YWRhdGFLZXlzKHRhcmdldCwga2V5LCBzY2hlbWUpO1xuICAgIHJldHVybiBrZXlzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGhhc01ldGFEYXRhKHRhcmdldCwgc2NoZW1lKSB7XG4gICAgdmFyIGEgPSBSZWZsZWN0LmdldEFsbE1ldGEodGFyZ2V0LCBzY2hlbWUpO1xuICAgIGlmICghYSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFByb3RvdHlwZShvYmopIHtcbiAgICByZXR1cm4gUmVmbGVjdC5nZXRQcm90b3R5cGUob2JqKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXRQcm90b3R5cGUob2JqLCBwcm90b3R5cGUpIHtcbiAgICBSZWZsZWN0LnNldFByb3RvdHlwZShvYmosIHByb3RvdHlwZSk7XG4gICAgcmV0dXJuIFJlZmxlY3QuZ2V0UHJvdG90eXBlKG9iaikgPT0gcHJvdG90eXBlO1xufVxuIiwiaW1wb3J0IHsgQkFTRV9TQ0hFTUUsIEpTT05fQkFTRVRZUEVTLCBKU09OX1RBR1MgfSBmcm9tIFwiLi9Kc29uTW9kdWxlQ29uc3RhbnRzXCI7XG5pbXBvcnQgeyBzZXRNZXRhZGF0YSwgc2V0T3duTWV0YURhdGEgfSBmcm9tIFwiLi9Kc29uTW9kdWxlQmFzZUZ1bmN0aW9uXCI7XG5mdW5jdGlvbiBjbGVhbk5vbkFjY2VzaWJsZVNldHRpbmdzKG9wdGlvbikge1xuICAgIGlmICghb3B0aW9uKVxuICAgICAgICByZXR1cm4ge307XG4gICAgaWYgKCFvcHRpb24uc2NoZW1lIHx8IG9wdGlvbi5zY2hlbWUubGVuZ3RoID09IDApXG4gICAgICAgIG9wdGlvbi5zY2hlbWUgPSBbQkFTRV9TQ0hFTUVdO1xuICAgIG9wdGlvbi5tYXBwaW5nRnVuY3Rpb25zID0gbnVsbDtcbiAgICBvcHRpb24udHlwZSA9IG51bGw7XG4gICAgb3B0aW9uLmlzQXJyYXkgPSBudWxsO1xuICAgIG9wdGlvbi5mb3JjZUJhc2VUeXBlID0gbnVsbDtcbiAgICByZXR1cm4gb3B0aW9uO1xufVxuLyoqXG4gKiBUaGlzIGlzIHRoZSBiYXNlIHByb3BlcnR5LCB0aGlzIGlzIHRoZSBwcm9wZXJ0eSB0aGF0IG90aGVyIHByb3BlcnRpZXMgdXNlLlxuICogaXQgaXMgcmVjb21tZW5kZWQgdGhhdCB5b3UgdXNlIHRoZSBtb3JlIHNwZWNpZmlrIHByb3BlcnRpZXMgd2hlbiBwb3NzaWJsZVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBKc29uUHJvcGVydHkob3B0aW9uKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIHByb3BlcnR5S2V5KSB7XG4gICAgICAgIHZhciBzY2hlbWVzO1xuICAgICAgICBpZiAoIShvcHRpb24gPT09IG51bGwgfHwgb3B0aW9uID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRpb24uc2NoZW1lKSkge1xuICAgICAgICAgICAgc2NoZW1lcyA9IFtCQVNFX1NDSEVNRV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvcHRpb24uc2NoZW1lKSkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbi5zY2hlbWUubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgICAgICBzY2hlbWVzID0gW0JBU0VfU0NIRU1FXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNjaGVtZXMgPSBvcHRpb24uc2NoZW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc2NoZW1lcyA9IFtvcHRpb24uc2NoZW1lXTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNjaGVtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzY2hlbWUgPSBzY2hlbWVzW2ldO1xuICAgICAgICAgICAgc2V0TWV0YWRhdGEoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFksIHRydWUsIHRhcmdldCwgcHJvcGVydHlLZXksIHNjaGVtZSk7XG4gICAgICAgICAgICBpZiAoIW9wdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvcHRpb24uZm9yY2VCYXNlVHlwZSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAob3B0aW9uLmZvcmNlQmFzZVR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBKU09OX0JBU0VUWVBFUy5zdHJpbmc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgSlNPTl9CQVNFVFlQRVMubnVtYmVyOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIEpTT05fQkFTRVRZUEVTLmJvb2w6XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRNZXRhZGF0YShKU09OX1RBR1MuSlNPTl9QUk9QRVJUWV9GT1JDRV9CQVNFX1RZUEUsIG9wdGlvbi5mb3JjZUJhc2VUeXBlLCB0YXJnZXQsIHByb3BlcnR5S2V5LCBzY2hlbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvcHRpb24uaXNBcnJheSkge1xuICAgICAgICAgICAgICAgIHNldE1ldGFkYXRhKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX0ZPUkNFX0FSUkFZLCB0cnVlLCB0YXJnZXQsIHByb3BlcnR5S2V5LCBzY2hlbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9wdGlvbi5uYW1lKSB7XG4gICAgICAgICAgICAgICAgc2V0TWV0YWRhdGEoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfTkFNRV9NQVBfSU4sIHByb3BlcnR5S2V5LCB0YXJnZXQsIG9wdGlvbi5uYW1lLCBzY2hlbWUpO1xuICAgICAgICAgICAgICAgIHNldE1ldGFkYXRhKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX05BTUVfTUFQX09VVCwgb3B0aW9uLm5hbWUsIHRhcmdldCwgcHJvcGVydHlLZXksIHNjaGVtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3B0aW9uLm1hcHBpbmdGdW5jdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBzZXRNZXRhZGF0YShKU09OX1RBR1MuSlNPTl9QUk9QRVJUWV9GVU5DX01BUF9JTiwgb3B0aW9uLm1hcHBpbmdGdW5jdGlvbnMuaW4sIHRhcmdldCwgcHJvcGVydHlLZXksIHNjaGVtZSk7XG4gICAgICAgICAgICAgICAgc2V0TWV0YWRhdGEoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfRlVOQ19NQVBfT1VULCBvcHRpb24ubWFwcGluZ0Z1bmN0aW9ucy5vdXQsIHRhcmdldCwgcHJvcGVydHlLZXksIHNjaGVtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3B0aW9uLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBzZXRNZXRhZGF0YShKU09OX1RBR1MuSlNPTl9QUk9QRVJUWV9UWVBFRCwgb3B0aW9uLnR5cGUsIHRhcmdldCwgcHJvcGVydHlLZXksIHNjaGVtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3B0aW9uLnNraXBGb3JjZVR5cGUpIHtcbiAgICAgICAgICAgICAgICBzZXRNZXRhZGF0YShKU09OX1RBR1MuSlNPTl9QUk9QRVJUWV9UWVBFRF9TS0lQX0ZPUkNFRCwgdHJ1ZSwgdGFyZ2V0LCBwcm9wZXJ0eUtleSwgc2NoZW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59XG4vKipcbiAqIFRoaXMgaXMgdGhlIGJhc2UgcHJvcGVydHksIHRoYXQgZW5zdXJlIHdoYXQgZXZlciBpcyBkZXNlcmlhbGl6ZWR8c2VyaWFsaXplZCBpcyBhbiBhcnJheVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBKc29uQXJyYXlQcm9wZXJ0eShvcHRpb24pIHtcbiAgICBvcHRpb24gPSBjbGVhbk5vbkFjY2VzaWJsZVNldHRpbmdzKG9wdGlvbik7XG4gICAgb3B0aW9uLmlzQXJyYXkgPSB0cnVlO1xuICAgIHJldHVybiBKc29uUHJvcGVydHkob3B0aW9uKTtcbn1cbi8qKlxuICogVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgY29udmVydHMgdG8gYSBudW1iZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEpzb25OdW1iZXIob3B0aW9uKSB7XG4gICAgb3B0aW9uID0gY2xlYW5Ob25BY2Nlc2libGVTZXR0aW5ncyhvcHRpb24pO1xuICAgIG9wdGlvbi5mb3JjZUJhc2VUeXBlID0gSlNPTl9CQVNFVFlQRVMubnVtYmVyO1xuICAgIHJldHVybiBKc29uUHJvcGVydHkob3B0aW9uKTtcbn1cbi8qKlxuICogVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgY29udmVydHMgdG8gYSBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEpzb25TdHJpbmcob3B0aW9uKSB7XG4gICAgb3B0aW9uID0gY2xlYW5Ob25BY2Nlc2libGVTZXR0aW5ncyhvcHRpb24pO1xuICAgIG9wdGlvbi5mb3JjZUJhc2VUeXBlID0gSlNPTl9CQVNFVFlQRVMuc3RyaW5nO1xuICAgIHJldHVybiBKc29uUHJvcGVydHkob3B0aW9uKTtcbn1cbi8qKlxuICogVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgY29udmVydHMgdG8gYSBib29sZWFuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBKc29uQm9vbGVhbihvcHRpb24pIHtcbiAgICBvcHRpb24gPSBjbGVhbk5vbkFjY2VzaWJsZVNldHRpbmdzKG9wdGlvbik7XG4gICAgb3B0aW9uLmZvcmNlQmFzZVR5cGUgPSBKU09OX0JBU0VUWVBFUy5ib29sO1xuICAgIHJldHVybiBKc29uUHJvcGVydHkob3B0aW9uKTtcbn1cbi8qKlxuICogVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgY29udmVydHMgdG8gYSBjbGFzcyBpbnN0YW5jZSxcbiAqIHdoZW4gZGVzZXJpbGl6aW5nIGl0IHdpbGwgYmUgY3JlYXRlZCB0aHJvdWdoIHRoZSBjb25zdHJ1Y3Rvci5cbiAqIHdoZW4gc2VyaWFsaXppZ24gaXQgd2lsbCBmb3JjZSBpdCB0aHJvdWdoIHRoZSBwcm90b3R5cGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBKc29uQ2xhc3NUeXBlZCh0eXBlLCBvcHRpb24pIHtcbiAgICBvcHRpb24gPSBjbGVhbk5vbkFjY2VzaWJsZVNldHRpbmdzKG9wdGlvbik7XG4gICAgb3B0aW9uLnR5cGUgPSB0eXBlO1xuICAgIHJldHVybiBKc29uUHJvcGVydHkob3B0aW9uKTtcbn1cbi8qKlxuICogVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgY29udmVydHMgdG8gYSBudW1iZXIgYXJyYXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEpzb25BcnJheU51bWJlcihvcHRpb24pIHtcbiAgICBvcHRpb24gPSBjbGVhbk5vbkFjY2VzaWJsZVNldHRpbmdzKG9wdGlvbik7XG4gICAgb3B0aW9uLmZvcmNlQmFzZVR5cGUgPSBKU09OX0JBU0VUWVBFUy5udW1iZXI7XG4gICAgb3B0aW9uLmlzQXJyYXkgPSB0cnVlO1xuICAgIHJldHVybiBKc29uUHJvcGVydHkob3B0aW9uKTtcbn1cbi8qKlxuICogVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgY29udmVydHMgdG8gYSBzdHJpbmcgYXJyYXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEpzb25BcnJheVN0cmluZyhvcHRpb24pIHtcbiAgICBvcHRpb24gPSBjbGVhbk5vbkFjY2VzaWJsZVNldHRpbmdzKG9wdGlvbik7XG4gICAgb3B0aW9uLmZvcmNlQmFzZVR5cGUgPSBKU09OX0JBU0VUWVBFUy5zdHJpbmc7XG4gICAgb3B0aW9uLmlzQXJyYXkgPSB0cnVlO1xuICAgIHJldHVybiBKc29uUHJvcGVydHkob3B0aW9uKTtcbn1cbi8qKlxuICogVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgY29udmVydHMgdG8gYSBib29sZWFuIGFycmF5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBKc29uQXJyYXlCb29sZWFuKG9wdGlvbikge1xuICAgIG9wdGlvbiA9IGNsZWFuTm9uQWNjZXNpYmxlU2V0dGluZ3Mob3B0aW9uKTtcbiAgICBvcHRpb24uZm9yY2VCYXNlVHlwZSA9IEpTT05fQkFTRVRZUEVTLmJvb2w7XG4gICAgb3B0aW9uLmlzQXJyYXkgPSB0cnVlO1xuICAgIHJldHVybiBKc29uUHJvcGVydHkob3B0aW9uKTtcbn1cbi8qKlxuICogVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgY29udmVydHMgdG8gYSBjbGFzc2luc3RhbmNlIGFycmF5XG4gKiB3aGVuIGRlc2VyaWxpemluZyBpdCB3aWxsIGJlIGNyZWF0ZWQgdGhyb3VnaCB0aGUgY29uc3RydWN0b3IuXG4gKiB3aGVuIHNlcmlhbGl6aWduIGl0IHdpbGwgZm9yY2UgaXQgdGhyb3VnaCB0aGUgcHJvdG90eXBlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSnNvbkFycmF5Q2xhc3NUeXBlZCh0eXBlLCBvcHRpb24pIHtcbiAgICBvcHRpb24gPSBjbGVhbk5vbkFjY2VzaWJsZVNldHRpbmdzKG9wdGlvbik7XG4gICAgb3B0aW9uLmlzQXJyYXkgPSB0cnVlO1xuICAgIG9wdGlvbi50eXBlID0gdHlwZTtcbiAgICByZXR1cm4gSnNvblByb3BlcnR5KG9wdGlvbik7XG59XG4vKipcbiAqIFRoaXMgaXMgYSBwcm9wZXJ0eSB0aGF0IGhlbHBzIGVhc2UgbWFwcGluZyBzb21ldGhpbmcgaW4gYW5kIG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gSnNvbk1hcHBpbmcocGFyYW1zKSB7XG4gICAgdmFyIF9hO1xuICAgIC8vIGNsZWFuIHRoZSBpbnB1dC5cbiAgICB2YXIgb3B0aW9uID0gY2xlYW5Ob25BY2Nlc2libGVTZXR0aW5ncygoX2EgPSBwYXJhbXMub3B0aW9uKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiB7fSk7XG4gICAgLy8gc2V0IHRoZSB0eXBlXG4gICAgaWYgKHBhcmFtcy50eXBlKVxuICAgICAgICBvcHRpb24udHlwZSA9IHBhcmFtcy50eXBlO1xuICAgIC8vIFNldCBtYXBwaW5nIGZ1bmN0aW9ucyBcbiAgICBvcHRpb24ubWFwcGluZ0Z1bmN0aW9ucyA9IHtcbiAgICAgICAgb3V0OiBwYXJhbXMub3V0RnVuY3Rpb24sXG4gICAgICAgIGluOiBwYXJhbXMuaW5GdW5jdGlvbixcbiAgICB9O1xuICAgIHJldHVybiBKc29uUHJvcGVydHkob3B0aW9uKTtcbn1cbi8qKlxuICogVGhpcyBpcyBhIHByb3BlcnR5IHRvIGVhc2UgdGhlIGFjdGlvbiBvZiBoYXZpbmcgYSByZWNvcmQgaW4gdGhlIHN5c3RlbSBidXQgYW4gYXJyYXkgaW4gdGhlIGpzb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEpzb25NYXBwaW5nUmVjb3JkSW5BcnJheU91dChvcHRpb24pIHtcbiAgICAvLyBjbGVhbiB0aGUgaW5wdXQuXG4gICAgdmFyIHR5cGUgPSBvcHRpb24udHlwZTtcbiAgICBvcHRpb24gPSBjbGVhbk5vbkFjY2VzaWJsZVNldHRpbmdzKG9wdGlvbiAhPT0gbnVsbCAmJiBvcHRpb24gIT09IHZvaWQgMCA/IG9wdGlvbiA6IHt9KTtcbiAgICB2YXIgb3V0ZnVuYyA9IGZ1bmN0aW9uIChjb2wsIHMpIHsgcmV0dXJuIE9iamVjdC52YWx1ZXMoY29sKS5tYXAoZnVuY3Rpb24gKHApIHsgcmV0dXJuIHMocCk7IH0pOyB9O1xuICAgIHZhciBpbmZ1bmMgPSBmdW5jdGlvbiAoY29sLCBkKSB7XG4gICAgICAgIHZhciByID0ge307XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgY29sLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgdmFyIG8gPSBkKHApO1xuICAgICAgICAgICAgdmFyIHYgPSBvW29wdGlvbi5LZXlQcm9wZXJ0eU5hbWVdO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2ID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB2ID0gb1tvcHRpb24uS2V5UHJvcGVydHlOYW1lXSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodiA9PT0gbnVsbCB8fCB2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImFmdGVyIGNhbGxpbmcgZnVuY3Rpb24gXCIuY29uY2F0KG9wdGlvbi5LZXlQcm9wZXJ0eU5hbWUsIFwiIGtleSB2YWx1ZSB3YXMgJ1wiKS5jb25jYXQodiwgXCInIFwiKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2VBZGRvbiA9IHYubGVuZ3RoID4gMCA/ICcsIE5vdGUgdGhhdCBtZXNzYWdlIG11c3QgaGF2ZSAwIEFyZ3VtZW50cywgdGhhdCBhcmVudCBlaXRoZXIgb3B0aW9uYWwgb3IgaGF2ZSBkZWZhdWx0IHZhbHVlcycgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIlNvbWV0aGluZyB3ZW50IHdyb25nIHdpdGggY2FsbGlnbiBtZXRob2QgJ1wiLmNvbmNhdChvcHRpb24uS2V5UHJvcGVydHlOYW1lLCBcIidcIikuY29uY2F0KG1lc3NhZ2VBZGRvbik7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByW3ZdID0gbztcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByO1xuICAgIH07XG4gICAgaWYgKHR5cGUpIHtcbiAgICAgICAgb3B0aW9uLnR5cGUgPSB0eXBlO1xuICAgIH1cbiAgICAvLyBTZXQgbWFwcGluZyBmdW5jdGlvbnMgXG4gICAgb3B0aW9uLm1hcHBpbmdGdW5jdGlvbnMgPSB7XG4gICAgICAgIG91dDogb3V0ZnVuYyxcbiAgICAgICAgaW46IGluZnVuYyxcbiAgICB9O1xuICAgIHJldHVybiBKc29uUHJvcGVydHkob3B0aW9uKTtcbn1cbmZ1bmN0aW9uIGNsZWFuT2JqZWN0T3B0aW9ucyhvcHRpb24pIHtcbiAgICBpZiAoIW9wdGlvbilcbiAgICAgICAgb3B0aW9uID0ge307XG4gICAgaWYgKCFvcHRpb24ub25BZnRlckRlU2VyaWFsaXphdGlvbikge1xuICAgICAgICBvcHRpb24ub25BZnRlckRlU2VyaWFsaXphdGlvbiA9IGZ1bmN0aW9uIChvKSB7IH07XG4gICAgfVxuICAgIGlmICghb3B0aW9uLnNjaGVtZSB8fCBvcHRpb24uc2NoZW1lLmxlbmd0aCA9PSAwKVxuICAgICAgICBvcHRpb24uc2NoZW1lID0gW0JBU0VfU0NIRU1FXTtcbiAgICByZXR1cm4gb3B0aW9uO1xufVxuZXhwb3J0IGZ1bmN0aW9uIEpzb25PYmplY3Qob3B0aW9uKSB7XG4gICAgb3B0aW9uID0gY2xlYW5PYmplY3RPcHRpb25zKG9wdGlvbik7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgdmFyIHNjaGVtZXMgPSBvcHRpb24gPT09IG51bGwgfHwgb3B0aW9uID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRpb24uc2NoZW1lO1xuICAgICAgICBpZiAoIXNjaGVtZXMgfHwgc2NoZW1lcy5sZW5ndGggPT0gMClcbiAgICAgICAgICAgIHNjaGVtZXMgPSBbQkFTRV9TQ0hFTUVdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNjaGVtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzY2hlbWUgPSBzY2hlbWVzW2ldO1xuICAgICAgICAgICAgLy8gU0VSSUFMSVpBVElPTiBcbiAgICAgICAgICAgIGlmIChvcHRpb24ub25BZnRlckRlU2VyaWFsaXphdGlvbilcbiAgICAgICAgICAgICAgICBzZXRPd25NZXRhRGF0YShKU09OX1RBR1MuSlNPTl9PQkpFQ1RfT05fQUZURVJfREVfU0VSSUFMSVpBVElPTiwgdGFyZ2V0LCBvcHRpb24ub25BZnRlckRlU2VyaWFsaXphdGlvbiwgc2NoZW1lKTtcbiAgICAgICAgICAgIGlmIChvcHRpb24ub25BZnRlclNlcmlhbGl6YXRpb25fYmVmb3JlU3RyaW5nKVxuICAgICAgICAgICAgICAgIHNldE93bk1ldGFEYXRhKEpTT05fVEFHUy5KU09OX09CSkVDVF9PTl9BRlRFUl9TRVJJQUxJWkFUSU9OX0JFRk9SRV9TVFJJTkcsIHRhcmdldCwgb3B0aW9uLm9uQWZ0ZXJTZXJpYWxpemF0aW9uX2JlZm9yZVN0cmluZywgc2NoZW1lKTtcbiAgICAgICAgICAgIGlmIChvcHRpb24ub25BZnRlclNlcmlhbGl6YXRpb24pXG4gICAgICAgICAgICAgICAgc2V0T3duTWV0YURhdGEoSlNPTl9UQUdTLkpTT05fT0JKRUNUX09OX0FGVEVSX1NFUklBTElaQVRJT04sIHRhcmdldCwgb3B0aW9uLm9uQWZ0ZXJTZXJpYWxpemF0aW9uLCBzY2hlbWUpO1xuICAgICAgICAgICAgLy8gREUgU0VSSUFMSVpBVElPTiBcbiAgICAgICAgICAgIGlmIChvcHRpb24ub25CZWZvcmVTZXJpYWxpemF0aW9uKVxuICAgICAgICAgICAgICAgIHNldE93bk1ldGFEYXRhKEpTT05fVEFHUy5KU09OX09CSkVDVF9PTl9CRUZPUkVfU0VSSUFMSVpBVElPTiwgdGFyZ2V0LCBvcHRpb24ub25CZWZvcmVTZXJpYWxpemF0aW9uLCBzY2hlbWUpO1xuICAgICAgICAgICAgaWYgKG9wdGlvbi5vbkJlZm9yZURlU2VyaWFsaXphdGlvbilcbiAgICAgICAgICAgICAgICBzZXRPd25NZXRhRGF0YShKU09OX1RBR1MuSlNPTl9PQkpFQ1RfT05fQkVGT1JFX0RFX1NFUklBTElaQVRJT04sIHRhcmdldCwgb3B0aW9uLm9uQmVmb3JlRGVTZXJpYWxpemF0aW9uLCBzY2hlbWUpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbiIsImltcG9ydCB7IGdldE1ldGFkYXRhLCBnZXRPd25NZXRhRGF0YSwgZ2V0T3duTWV0YURhdGFLZXlzLCBnZXRNZXRhRGF0YUtleXMsIGhhc01ldGFEYXRhLCBnZXRQcm90b3R5cGUsIHNldFByb3RvdHlwZSB9IGZyb20gXCIuL0pzb25Nb2R1bGVCYXNlRnVuY3Rpb25cIjtcbmltcG9ydCB7IEJBU0VfU0NIRU1FLCBKU09OX0JBU0VUWVBFUywgSlNPTl9UQUdTLCBOb091dHB1dCB9IGZyb20gXCIuL0pzb25Nb2R1bGVDb25zdGFudHNcIjtcbnZhciBKU09OSGFuZGxlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBKU09OSGFuZGxlcigpIHtcbiAgICB9XG4gICAgSlNPTkhhbmRsZXIuc2VyaWFsaXplID0gZnVuY3Rpb24gKG9iaiwgc2NoZW1lKSB7XG4gICAgICAgIGlmIChzY2hlbWUgPT09IHZvaWQgMCkgeyBzY2hlbWUgPSBCQVNFX1NDSEVNRTsgfVxuICAgICAgICB2YXIgbyA9IEpTT05IYW5kbGVyLnNlcmlhbGl6ZVJhdyhvYmosIHNjaGVtZSk7XG4gICAgICAgIHZhciBzdHIgPSBKU09OLnN0cmluZ2lmeShvKTtcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gQWZ0ZXIgc2VyaWFsaXplIGZ1bmN0aW9uIGdldCBpdCBhbmQgcnVuIGl0LiBcbiAgICAgICAgdmFyIE9iamVjdE1ldGEgPSBnZXRPd25NZXRhRGF0YUtleXMob2JqKTtcbiAgICAgICAgaWYgKE9iamVjdE1ldGEuaW5jbHVkZXMoSlNPTl9UQUdTLkpTT05fT0JKRUNUX09OX0FGVEVSX1NFUklBTElaQVRJT04pKSB7XG4gICAgICAgICAgICB2YXIgZiA9IGdldE93bk1ldGFEYXRhKEpTT05fVEFHUy5KU09OX09CSkVDVF9PTl9BRlRFUl9TRVJJQUxJWkFUSU9OLCBvYmosIHNjaGVtZSk7XG4gICAgICAgICAgICBpZiAoZilcbiAgICAgICAgICAgICAgICBzdHIgPSBmKHN0cik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9O1xuICAgIEpTT05IYW5kbGVyLnNlcmlhbGl6ZVJhdyA9IGZ1bmN0aW9uIChvYmosIHNjaGVtZSwgcGFyZW50TmFtZSkge1xuICAgICAgICBpZiAoc2NoZW1lID09PSB2b2lkIDApIHsgc2NoZW1lID0gQkFTRV9TQ0hFTUU7IH1cbiAgICAgICAgaWYgKHBhcmVudE5hbWUgPT09IHZvaWQgMCkgeyBwYXJlbnROYW1lID0gJ0ZJUlNUJzsgfVxuICAgICAgICBpZiAoIW9iaikge1xuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZiB0aGlzIGlzIGEgYmFzZSB0eXBlIGp1c3QgcmV0dXJuXG4gICAgICAgIHZhciB0eXBlID0gdHlwZW9mIG9iajtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgICAgIHJldHVybiBKU09OSGFuZGxlci5kZXNlcmlhbGl6ZUFuZEZvcmNlU2ltcGxlKCdzdHJpbmcnLCBvYmosIHNjaGVtZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuICAgICAgICAvLyBpbiBjYXNlIHRoaXMgaXMgYSByZWd1bGFyIG9iamVjdCB3aXRoIG5vIGRlY29yYXRvcnMgXG4gICAgICAgIGlmICghaGFzTWV0YURhdGEob2JqLCBzY2hlbWUpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiAob2JqKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIHNlcmlhbGl6ZWRPYmplY3QgaXMgYSBuZXcgb2JqZWN0LCB3aXRob3V0IG5vbiBKc29ucHJvcGVydGllc1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgIC8vIEVWRU5UIEJGT1JFIFNFUklBTElaQVRJT05cbiAgICAgICAgdmFyIE9iamVjdE1ldGEgPSBnZXRPd25NZXRhRGF0YUtleXMob2JqKTtcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gQWZ0ZXIgc2VyaWFsaXplIGZ1bmN0aW9uIGdldCBpdCBhbmQgcnVuIGl0LiBcbiAgICAgICAgaWYgKE9iamVjdE1ldGEuaW5jbHVkZXMoSlNPTl9UQUdTLkpTT05fT0JKRUNUX09OX0JFRk9SRV9TRVJJQUxJWkFUSU9OKSkge1xuICAgICAgICAgICAgLy8gZ2V0IG1ldGEgZGF0YSBmdW5jdGlvbiBhbmQgcnVuIGl0IG9uIHRoZSByZXN1bHRpbmcgb2JqZWN0XG4gICAgICAgICAgICB2YXIgZiA9IGdldE93bk1ldGFEYXRhKEpTT05fVEFHUy5KU09OX09CSkVDVF9PTl9CRUZPUkVfU0VSSUFMSVpBVElPTiwgb2JqLCBzY2hlbWUpO1xuICAgICAgICAgICAgaWYgKGYpXG4gICAgICAgICAgICAgICAgZihvYmopO1xuICAgICAgICB9XG4gICAgICAgIC8vIGdldCBwcm9wZXJ0eW5hbWVzIGFuZCBsb29wIHRocm91Z2ggXG4gICAgICAgIHZhciBwcm9wZXJ0eU5hbWVzO1xuICAgICAgICBwcm9wZXJ0eU5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqKTtcbiAgICAgICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgLy8gZ2V0IGJhc2ljIHByb3BlcnRpZXNcbiAgICAgICAgICAgIHZhciBrZXkgPSBwcm9wZXJ0eU5hbWVzW2ldO1xuICAgICAgICAgICAgdmFyIG1ldGEgPSBnZXRNZXRhRGF0YUtleXMob2JqLCBrZXksIHNjaGVtZSk7XG4gICAgICAgICAgICAvLyBjaGVjayBpZiB0aGUgc2NoZW1lIHdlIGFyZSBhYm91dCB0byBleHBvcnQgaGF2ZSBUaGUgUHJvcGVydHkgaW4gaXRcbiAgICAgICAgICAgIGlmICghbWV0YS5pbmNsdWRlcyhKU09OX1RBR1MuSlNPTl9QUk9QRVJUWSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJjb250aW51ZVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSwgYnV0IGlmIHRoZXJlIGlzIGEgbWFwcGVkIG91dCBuYW1lLCBnZXQgdGhhdCBpbnN0ZWFkXG4gICAgICAgICAgICB2YXIgUHJvcGVydHlOYW1lID0ga2V5O1xuICAgICAgICAgICAgaWYgKG1ldGEuaW5jbHVkZXMoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfTkFNRV9NQVBfT1VUKSkge1xuICAgICAgICAgICAgICAgIFByb3BlcnR5TmFtZSA9IGdldE1ldGFkYXRhKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX05BTUVfTUFQX09VVCwgb2JqLCBrZXksIHNjaGVtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiB0aGUgaXRlbSBpcyB0eXBlZCwgdGhlbiB3ZSBleGNhbmdlIHRoZSBwcm90b3R5cGVzIGZvciBlYWNoIG9iamVjdCBhcyB3ZSBkZXNlcmlhbGl6ZS4gXG4gICAgICAgICAgICAvLyB3ZSBkbyB0aGlzIGluIGEgZnVuY2l0b24gdG8gbWluaW1pemUgaWYgc3RhdGVtZW50IGNoYW9zO1xuICAgICAgICAgICAgdmFyIHR5cGVkY29udmVyc2lvbiA9IGZ1bmN0aW9uICh2LCBzZXIpIHsgcmV0dXJuIHY7IH07XG4gICAgICAgICAgICB2YXIgc2tpcEZvcmNlVHlwZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKG1ldGEuaW5jbHVkZXMoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfVFlQRURfU0tJUF9GT1JDRUQpKSB7XG4gICAgICAgICAgICAgICAgc2tpcEZvcmNlVHlwZSA9IGdldE1ldGFkYXRhKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX1RZUEVEX1NLSVBfRk9SQ0VELCBvYmosIGtleSwgc2NoZW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtZXRhLmluY2x1ZGVzKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX1RZUEVEKSAmJiAhc2tpcEZvcmNlVHlwZSkge1xuICAgICAgICAgICAgICAgIHR5cGVkY29udmVyc2lvbiA9IGZ1bmN0aW9uICh2LCBzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IHByb3RvdHlwZXM7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkdXJpbmcgPSAoZ2V0TWV0YWRhdGEoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfVFlQRUQsIG9iaiwga2V5LCBzY2hlbWUpKS5wcm90b3R5cGU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiZWZvcmUgPSBnZXRQcm90b3R5cGUodik7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNldCBwcm90b3R5cGUgc2VyaWFsaXplIHRoZW4gc2V0IHByb3RvdHlwZSBiYWNrIFxuICAgICAgICAgICAgICAgICAgICBzZXRQcm90b3R5cGUodiwgZHVyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHIgPSBzZXIodik7XG4gICAgICAgICAgICAgICAgICAgIHNldFByb3RvdHlwZSh2LCBiZWZvcmUpO1xuICAgICAgICAgICAgICAgICAgICAvLyBkb25lXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBhIG1hcHBpbmcgZnVuY3Rpb25cbiAgICAgICAgICAgIHZhciBvdXQgPSBudWxsO1xuICAgICAgICAgICAgaWYgKG1ldGEuaW5jbHVkZXMoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfRlVOQ19NQVBfT1VUKSkge1xuICAgICAgICAgICAgICAgIHZhciBvdXRGdW5jdGlvbl8xID0gZ2V0TWV0YWRhdGEoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfRlVOQ19NQVBfT1VULCBvYmosIGtleSwgc2NoZW1lKTtcbiAgICAgICAgICAgICAgICB2YXIgX291dEYgPSBmdW5jdGlvbiAobzEpIHsgcmV0dXJuIG91dEZ1bmN0aW9uXzEobzEsIGZ1bmN0aW9uIChvMikgeyByZXR1cm4gdHlwZWRjb252ZXJzaW9uKG8yLCBmdW5jdGlvbiAobzMpIHsgcmV0dXJuIEpTT05IYW5kbGVyLnNlcmlhbGl6ZVJhdyhvMywgc2NoZW1lLCBwYXJlbnROYW1lICsgJzonICsga2V5KTsgfSk7IH0pOyB9O1xuICAgICAgICAgICAgICAgIG91dCA9IF9vdXRGKG9ialtrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG1ldGEuaW5jbHVkZXMoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfRk9SQ0VfQVJSQVkpKSB7XG4gICAgICAgICAgICAgICAgb3V0ID0gW107XG4gICAgICAgICAgICAgICAgaWYgKG9ialtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KG9ialtrZXldKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIF9sb29wXzIgPSBmdW5jdGlvbiAoaikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlID0gdHlwZWRjb252ZXJzaW9uKG9ialtrZXldW2pdLCBmdW5jdGlvbiAobykgeyByZXR1cm4gSlNPTkhhbmRsZXIuc2VyaWFsaXplUmF3KG8sIHNjaGVtZSwgcGFyZW50TmFtZSArICc6WycgKyBqICsgJ106JyArIGtleSk7IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dC5wdXNoKGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgb2JqW2tleV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfbG9vcF8yKGopO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0LnB1c2godHlwZWRjb252ZXJzaW9uKG9ialtrZXldLCBmdW5jdGlvbiAobykgeyByZXR1cm4gSlNPTkhhbmRsZXIuc2VyaWFsaXplUmF3KG8sIHNjaGVtZSwgcGFyZW50TmFtZSArICc6JyArIGtleSk7IH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG91dCA9IHR5cGVkY29udmVyc2lvbihvYmpba2V5XSwgZnVuY3Rpb24gKG8pIHsgcmV0dXJuIEpTT05IYW5kbGVyLnNlcmlhbGl6ZVJhdyhvLCBzY2hlbWUsIHBhcmVudE5hbWUgKyAnOicgKyBrZXkpOyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEhBTkRMRSBGb3JjZSBUeXBpbmdcbiAgICAgICAgICAgIGlmIChtZXRhLmluY2x1ZGVzKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX0ZPUkNFX0JBU0VfVFlQRSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdHlwZWtleV8xID0gZ2V0TWV0YWRhdGEoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfRk9SQ0VfQkFTRV9UWVBFLCBvYmosIGtleSwgc2NoZW1lKTtcbiAgICAgICAgICAgICAgICB2YXIgY29udkZ1bmMgPSBmdW5jdGlvbiAoZSkgeyByZXR1cm4gSlNPTkhhbmRsZXIuZGVzZXJpYWxpemVBbmRGb3JjZVNpbXBsZSh0eXBla2V5XzEsIGUsIHNjaGVtZSk7IH07XG4gICAgICAgICAgICAgICAgaWYgKG1ldGEuaW5jbHVkZXMoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfRk9SQ0VfQVJSQVkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wID0gb3V0O1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3b3V0ID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGlfMSA9IDA7IGlfMSA8IHRlbXAubGVuZ3RoOyBpXzErKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3b3V0LnB1c2goY29udkZ1bmModGVtcFtpXzFdKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb3V0ID0gbmV3b3V0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ID0gY29udkZ1bmMob2JqW2tleV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdFtQcm9wZXJ0eU5hbWVdID0gb3V0O1xuICAgICAgICB9O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BlcnR5TmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIF9sb29wXzEoaSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gQWZ0ZXIgc2VyaWFsaXplIGZ1bmN0aW9uIGdldCBpdCBhbmQgcnVuIGl0LiBcbiAgICAgICAgaWYgKE9iamVjdE1ldGEuaW5jbHVkZXMoSlNPTl9UQUdTLkpTT05fT0JKRUNUX09OX0FGVEVSX1NFUklBTElaQVRJT05fQkVGT1JFX1NUUklORykpIHtcbiAgICAgICAgICAgIHZhciBmID0gZ2V0T3duTWV0YURhdGEoSlNPTl9UQUdTLkpTT05fT0JKRUNUX09OX0FGVEVSX1NFUklBTElaQVRJT05fQkVGT1JFX1NUUklORywgb2JqLCBzY2hlbWUpO1xuICAgICAgICAgICAgaWYgKGYpXG4gICAgICAgICAgICAgICAgZihyZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICBKU09OSGFuZGxlci5kZXNlcmlhbGl6ZSA9IGZ1bmN0aW9uICh0YXJnZXQsIGpzb24sIHNjaGVtZSwgd3JpdGVPdXQpIHtcbiAgICAgICAgaWYgKHNjaGVtZSA9PT0gdm9pZCAwKSB7IHNjaGVtZSA9IEJBU0VfU0NIRU1FOyB9XG4gICAgICAgIGlmICghd3JpdGVPdXQpIHtcbiAgICAgICAgICAgIHdyaXRlT3V0ID0gTm9PdXRwdXQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YganNvbjtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGpzb24gPSBKU09OLnBhcnNlKGpzb24pO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICAgICAgICAgIHdyaXRlT3V0Lm91dEVycm9yKCdDYW5ub3QgZGVyc2VyaWFsaXplIHR5cGUgb2YgJyArIHR5cGUpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShqc29uKSkge1xuICAgICAgICAgICAgdmFyIGFyciA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBqc29uLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgYXJyLnB1c2godGhpcy5kZXNlcmlhbGl6ZVJhdyh0YXJnZXQsIGpzb25baV0sIHNjaGVtZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFycjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRlc2VyaWFsaXplUmF3KHRhcmdldCwganNvbiwgc2NoZW1lKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgSlNPTkhhbmRsZXIuZGVzZXJpYWxpemVBbmRGb3JjZVNpbXBsZSA9IGZ1bmN0aW9uICh0eXBla2V5LCBvYmosIHNjaGVtZSkge1xuICAgICAgICBpZiAoc2NoZW1lID09PSB2b2lkIDApIHsgc2NoZW1lID0gQkFTRV9TQ0hFTUU7IH1cbiAgICAgICAgdmFyIG91dCA9IG9iajtcbiAgICAgICAgdmFyIGNvbnZGdW5jID0gZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGU7IH07XG4gICAgICAgIHN3aXRjaCAodHlwZWtleSkge1xuICAgICAgICAgICAgY2FzZSBKU09OX0JBU0VUWVBFUy5ib29sOlxuICAgICAgICAgICAgICAgIGNvbnZGdW5jID0gZnVuY3Rpb24gKGlucHV0KSB7IHJldHVybiBCb29sZWFuKGlucHV0KTsgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgSlNPTl9CQVNFVFlQRVMuc3RyaW5nOlxuICAgICAgICAgICAgICAgIGlmIChvYmogPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmogPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zdCBzdHIgPSBvYmoucmVwbGFjZUFsbChcIjw8ZHA+PlwiLCdcXFxcXCInKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHIgPSBKU09OLnN0cmluZ2lmeShvYmopO1xuICAgICAgICAgICAgICAgICAgICAvL3N0ciA9IHN0ci5yZXBsYWNlQWxsKFwiPDxkcD4+XCIsJ1xcXFxcIicpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlb2Ygb2JqID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChoYXNNZXRhRGF0YShvYmosIHNjaGVtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBKU09OSGFuZGxlci5zZXJpYWxpemUob2JqLCBzY2hlbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9sZXQgc3RyID0gSlNPTi5zdHJpbmdpZnkob2JqKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc3RyID0gc3RyLnJlcGxhY2VBbGwoJ1xcXFxcIicsXCI8PGRwPj5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JldHVybiBzdHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmopO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnZGdW5jID0gZnVuY3Rpb24gKGlucHV0KSB7IHJldHVybiBTdHJpbmcoaW5wdXQpOyB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBKU09OX0JBU0VUWVBFUy5udW1iZXI6XG4gICAgICAgICAgICAgICAgaWYgKG9iaiA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG9iaiA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29udkZ1bmMgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbnVtYmVyVmFsdWUgPSBOdW1iZXIoZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpc05hTihudW1iZXJWYWx1ZSkgPyAwIDogbnVtYmVyVmFsdWU7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBvdXQgPSBjb252RnVuYyhvdXQpO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH07XG4gICAgSlNPTkhhbmRsZXIuZGVzZXJpYWxpemVSYXcgPSBmdW5jdGlvbiAodGFyZ2V0LCBvYmosIHNjaGVtZSwgcGFyZW50TmFtZSkge1xuICAgICAgICBpZiAoc2NoZW1lID09PSB2b2lkIDApIHsgc2NoZW1lID0gQkFTRV9TQ0hFTUU7IH1cbiAgICAgICAgaWYgKHBhcmVudE5hbWUgPT09IHZvaWQgMCkgeyBwYXJlbnROYW1lID0gJ0ZJUlNUJzsgfVxuICAgICAgICBpZiAoIW9iaikge1xuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuICAgICAgICAvLyBzZXJpYWxpemVkT2JqZWN0IGlzIGEgbmV3IG9iamVjdCwgd2l0aG91dCBub24gSnNvbnByb3BlcnRpZXNcbiAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyB0YXJnZXQoKTtcbiAgICAgICAgdmFyIHByb3RvdHlwZSA9IHRhcmdldC5wcm90b3R5cGU7XG4gICAgICAgIC8vIEVWRU5UIE9OIEFGVEVSIERFU0VSSUFMSVpFXG4gICAgICAgIHZhciBPYmplY3RNZXRhID0gZ2V0T3duTWV0YURhdGFLZXlzKHRhcmdldCk7XG4gICAgICAgIGlmIChPYmplY3RNZXRhLmluY2x1ZGVzKEpTT05fVEFHUy5KU09OX09CSkVDVF9PTl9CRUZPUkVfREVfU0VSSUFMSVpBVElPTikpIHtcbiAgICAgICAgICAgIC8vIGdldCBtZXRhIGRhdGEgZnVuY3Rpb24gYW5kIHJ1biBpdCBvbiB0aGUgcmVzdWx0aW5nIG9iamVjdFxuICAgICAgICAgICAgdmFyIGYgPSBnZXRPd25NZXRhRGF0YShKU09OX1RBR1MuSlNPTl9PQkpFQ1RfT05fQkVGT1JFX0RFX1NFUklBTElaQVRJT04sIHJlc3VsdCwgc2NoZW1lKTtcbiAgICAgICAgICAgIGlmIChmKVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGYocmVzdWx0LCBvYmopO1xuICAgICAgICAgICAgLy8gaW5jYXNlIHRoZSBCZWZvcmUgaGFzIGNoYW5nZWQgdGhlIHR5cGUgXG4gICAgICAgICAgICBpZiAoIUpTT05IYW5kbGVyLmFyZVNhbWVQcm90b3R5cGVzKHJlc3VsdCwgdGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIHRhcmdldCA9IGdldFByb3RvdHlwZShyZXN1bHQpLmNvbnN0cnVjdG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGdldCBwcm9wZXJ0eW5hbWVzIGFuZCBsb29wIHRocm91Z2ggXG4gICAgICAgIHZhciBwcm9wZXJ0eU5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqKTtcbiAgICAgICAgdmFyIF9sb29wXzMgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgLy8gZ2V0IGJhc2ljIHByb3BlcnRpZXNcbiAgICAgICAgICAgIHZhciBrZXkgPSBwcm9wZXJ0eU5hbWVzW2ldO1xuICAgICAgICAgICAgdmFyIGluS2V5ID0ga2V5O1xuICAgICAgICAgICAgdmFyIG1ldGEgPSBnZXRNZXRhRGF0YUtleXModGFyZ2V0LCBrZXksIHNjaGVtZSk7XG4gICAgICAgICAgICB2YXIgUHJvcGVydHlOYW1lID0ga2V5O1xuICAgICAgICAgICAgaWYgKG1ldGEubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJjb250aW51ZVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaWYgdGhpcyBpcyBhbiBPdXQga2V5LCBjb252ZXJ0IGl0IHRvIGFuIElOIEtleSwgc28gd2UgY2FuIGdldCB0aGUgcmlnaHQgbWV0YSBkYXRhLiBcbiAgICAgICAgICAgIGlmIChtZXRhLmluY2x1ZGVzKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX05BTUVfTUFQX0lOKSkge1xuICAgICAgICAgICAgICAgIC8vIGdldCBvdXQga2V5IGZyb20gdGhlIGluIEtleVxuICAgICAgICAgICAgICAgIGtleSA9IGdldE1ldGFkYXRhKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX05BTUVfTUFQX0lOLCBwcm90b3R5cGUsIGtleSwgc2NoZW1lKTtcbiAgICAgICAgICAgICAgICAvLyBpbiBjYXNlIHRoYXQgYSBrZXkgYmVsb25nZWQgdG8gYW5vdGhlciBzY2hlbWUsIHRoZW4gdGhlIGtleSBpcyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAvL1x0aWYoa2V5PT11bmRlZmluZWQpe1xuICAgICAgICAgICAgICAgIC8vXHRcdGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIC8vXHR9IFxuICAgICAgICAgICAgICAgIG1ldGEgPSBnZXRNZXRhRGF0YUtleXModGFyZ2V0LCBrZXksIHNjaGVtZSk7XG4gICAgICAgICAgICAgICAgUHJvcGVydHlOYW1lID0ga2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gR2V0IHRoZSBjb25zdHJ1Y3RvciBpZiB0aGVyZSBpcyBhbnksIEdlbmVyaWNzIHRha2UgcHJpb3JpdHlcbiAgICAgICAgICAgIHZhciBvdXQgPSBudWxsO1xuICAgICAgICAgICAgdmFyIGNvbnN0ciA9IGdldE1ldGFkYXRhKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX1RZUEVELCBwcm90b3R5cGUsIGtleSwgc2NoZW1lKTtcbiAgICAgICAgICAgIGlmIChtZXRhLmluY2x1ZGVzKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX0ZVTkNfTUFQX0lOKSkge1xuICAgICAgICAgICAgICAgIHZhciBpbkZ1bmN0aW9uID0gZ2V0TWV0YWRhdGEoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfRlVOQ19NQVBfSU4sIHByb3RvdHlwZSwga2V5LCBzY2hlbWUpO1xuICAgICAgICAgICAgICAgIGlmIChjb25zdHIpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ID0gaW5GdW5jdGlvbihvYmpbaW5LZXldLCBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzID0gSlNPTkhhbmRsZXIuZGVzZXJpYWxpemVSYXcoY29uc3RyLCBvYmosIHNjaGVtZSwga2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ID0gaW5GdW5jdGlvbihvYmpbaW5LZXldLCBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmo7IH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG1ldGEuaW5jbHVkZXMoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfRk9SQ0VfQVJSQVkpKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgaXQgbmVlZHMgZGVzZXJpYWxpemluZ1xuICAgICAgICAgICAgICAgIHZhciBjb252ZXJ0XzEgPSBmdW5jdGlvbiAoZSkgeyByZXR1cm4gZTsgfTtcbiAgICAgICAgICAgICAgICBpZiAoY29uc3RyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnZlcnRfMSA9IGZ1bmN0aW9uIChlKSB7IHJldHVybiBKU09OSGFuZGxlci5kZXNlcmlhbGl6ZVJhdyhjb25zdHIsIGUsIHNjaGVtZSwga2V5KTsgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGFzIHN0YXRlZCBhYm92ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBpZiBpdCBuZWVkcyB0byBiZSBjb252ZXJ0ZWQgdG8gYSBzaW1wbGUgdHlwZS4gRVZFTiBhZnRlciBkZXNlcmlhbGl6aW5nXG4gICAgICAgICAgICAgICAgdmFyIGNvbnZlcnQyID0gZnVuY3Rpb24gKGUsIHR5cGVrZXkpIHsgcmV0dXJuIGNvbnZlcnRfMShlKTsgfTtcbiAgICAgICAgICAgICAgICBpZiAobWV0YS5pbmNsdWRlcyhKU09OX1RBR1MuSlNPTl9QUk9QRVJUWV9GT1JDRV9CQVNFX1RZUEUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnZlcnQyID0gZnVuY3Rpb24gKGUsIHR5cGVrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBKU09OSGFuZGxlci5kZXNlcmlhbGl6ZUFuZEZvcmNlU2ltcGxlKHR5cGVrZXksIGUpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gYXMgc3RhdGVkIGFib3ZlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG91dCA9IFtdO1xuICAgICAgICAgICAgICAgIHZhciB0eXBla2V5ID0gZ2V0TWV0YWRhdGEoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfRk9SQ0VfQkFTRV9UWVBFLCBwcm90b3R5cGUsIGtleSwgc2NoZW1lKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG9ialtpbktleV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGUgPSBvYmpbaW5LZXldW2pdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgciA9IGNvbnZlcnQyKGUsIHR5cGVrZXkpO1xuICAgICAgICAgICAgICAgICAgICBvdXQucHVzaChyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoY29uc3RyKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dCA9IEpTT05IYW5kbGVyLmRlc2VyaWFsaXplUmF3KGNvbnN0ciwgb2JqW2luS2V5XSwgc2NoZW1lLCBrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXRhLmluY2x1ZGVzKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX0ZPUkNFX0JBU0VfVFlQRSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHR5cGVLZXkgPSBnZXRNZXRhZGF0YShKU09OX1RBR1MuSlNPTl9QUk9QRVJUWV9GT1JDRV9CQVNFX1RZUEUsIHRhcmdldCwga2V5LCBzY2hlbWUpO1xuICAgICAgICAgICAgICAgICAgICBvdXQgPSBKU09OSGFuZGxlci5kZXNlcmlhbGl6ZUFuZEZvcmNlU2ltcGxlKHR5cGVLZXksIG9ialtpbktleV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ID0gb2JqW2luS2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRbUHJvcGVydHlOYW1lXSA9IG91dDtcbiAgICAgICAgfTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wZXJ0eU5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBfbG9vcF8zKGkpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEVWRU5UIE9OIEFGVEVSIERFU0VSSUFMSVpFXG4gICAgICAgIE9iamVjdE1ldGEgPSBnZXRPd25NZXRhRGF0YUtleXMocmVzdWx0KTtcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gQWZ0ZXIgc2VyaWFsaXplIGZ1bmN0aW9uIGdldCBpdCBhbmQgcnVuIGl0LiBcbiAgICAgICAgaWYgKE9iamVjdE1ldGEuaW5jbHVkZXMoSlNPTl9UQUdTLkpTT05fT0JKRUNUX09OX0FGVEVSX0RFX1NFUklBTElaQVRJT04pKSB7XG4gICAgICAgICAgICAvLyBnZXQgbWV0YSBkYXRhIGZ1bmN0aW9uIGFuZCBydW4gaXQgb24gdGhlIHJlc3VsdGluZyBvYmplY3RcbiAgICAgICAgICAgIHZhciBmID0gZ2V0T3duTWV0YURhdGEoSlNPTl9UQUdTLkpTT05fT0JKRUNUX09OX0FGVEVSX0RFX1NFUklBTElaQVRJT04sIHJlc3VsdCwgc2NoZW1lKTtcbiAgICAgICAgICAgIGlmIChmKVxuICAgICAgICAgICAgICAgIGYocmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgSlNPTkhhbmRsZXIuY2hhbmdlUHJvdG90eXBlID0gZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG4gICAgICAgIHZhciBwcm90b3R5cGUgPSBnZXRQcm90b3R5cGUoc291cmNlKTtcbiAgICAgICAgc2V0UHJvdG90eXBlKHRhcmdldCwgcHJvdG90eXBlKTtcbiAgICB9O1xuICAgIEpTT05IYW5kbGVyLmFyZVNhbWVQcm90b3R5cGVzID0gZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG4gICAgICAgIHZhciBwcm90b3R5cGUxID0gZ2V0UHJvdG90eXBlKHNvdXJjZSk7XG4gICAgICAgIHZhciBwcm90b3R5cGUyID0gZ2V0UHJvdG90eXBlKHRhcmdldCk7XG4gICAgICAgIHJldHVybiBwcm90b3R5cGUxID09IHByb3RvdHlwZTI7XG4gICAgfTtcbiAgICByZXR1cm4gSlNPTkhhbmRsZXI7XG59KCkpO1xuZXhwb3J0IHsgSlNPTkhhbmRsZXIgfTtcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMua2V5TWFuYWdlckluc3RhbmNlID0gZXhwb3J0cy5LZXlNYW5hZ2VyID0gdm9pZCAwO1xyXG52YXIgS2V5TWFuYWdlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcclxuICAgIGZ1bmN0aW9uIEtleU1hbmFnZXIoKSB7XHJcbiAgICAgICAgdGhpcy5rZXlDb3VudGVyID0gMDtcclxuICAgIH1cclxuICAgIEtleU1hbmFnZXIucHJvdG90eXBlLmdldE5ld0tleSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgbnVtID0gdGhpcy5rZXlDb3VudGVyKys7XHJcbiAgICAgICAgcmV0dXJuIG51bS50b1N0cmluZygxNik7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIEtleU1hbmFnZXI7XHJcbn0oKSk7XHJcbmV4cG9ydHMuS2V5TWFuYWdlciA9IEtleU1hbmFnZXI7XHJcbmV4cG9ydHMua2V5TWFuYWdlckluc3RhbmNlID0gbmV3IEtleU1hbmFnZXIoKTtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5uZXdPdXRwdXRIYW5kbGVyID0gdm9pZCAwO1xyXG5mdW5jdGlvbiBuZXdPdXRwdXRIYW5kbGVyKCkge1xyXG4gICAgdmFyIGEgPSB7XHJcbiAgICAgICAgb3V0RXJyb3I6IGZ1bmN0aW9uIChtc2cpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb3V0TG9nOiBmdW5jdGlvbiAobXNnKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG1zZyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIHJldHVybiBhO1xyXG59XHJcbmV4cG9ydHMubmV3T3V0cHV0SGFuZGxlciA9IG5ld091dHB1dEhhbmRsZXI7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuQUdyYXBoSXRlbSA9IHZvaWQgMDtcclxudmFyIEtleU1hbmFnZXJfMSA9IHJlcXVpcmUoXCIuL0tleU1hbmFnZXJcIik7XHJcbnZhciBrZXlNYW5hZ2VyID0gbmV3IEtleU1hbmFnZXJfMS5LZXlNYW5hZ2VyKCk7XHJcbnZhciBBR3JhcGhJdGVtID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gQUdyYXBoSXRlbShuYW1lLCBrZXkpIHtcclxuICAgICAgICBpZiAobmFtZSA9PT0gdm9pZCAwKSB7IG5hbWUgPSAnJzsgfVxyXG4gICAgICAgIGlmIChrZXkgPT09IHZvaWQgMCkgeyBrZXkgPSAnJzsgfVxyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5fa2V5ID0ga2V5ICsga2V5TWFuYWdlci5nZXROZXdLZXkoKTtcclxuICAgIH1cclxuICAgIEFHcmFwaEl0ZW0ucHJvdG90eXBlLmdldE5hbWUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZTtcclxuICAgIH07XHJcbiAgICBBR3JhcGhJdGVtLnByb3RvdHlwZS5zZXROYW1lID0gZnVuY3Rpb24gKG5hbWUpIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgfTtcclxuICAgIEFHcmFwaEl0ZW0ucHJvdG90eXBlLmdldEtleSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fa2V5O1xyXG4gICAgfTtcclxuICAgIHJldHVybiBBR3JhcGhJdGVtO1xyXG59KCkpO1xyXG5leHBvcnRzLkFHcmFwaEl0ZW0gPSBBR3JhcGhJdGVtO1xyXG4iLCJcInVzZSBzdHJpY3RcIjtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xyXG5leHBvcnRzLkdyb2JEZXJpdmVkTm9kZSA9IGV4cG9ydHMuR3JvYkZpeGVkTm9kZSA9IGV4cG9ydHMuR3JvYk5vZGUgPSBleHBvcnRzLkdyb2JEZXJpdmVkT3JpZ2luID0gdm9pZCAwO1xyXG52YXIgdHNsaWJfMSA9IHJlcXVpcmUoXCJ0c2xpYlwiKTtcclxudmFyIEFHcmFwaEl0ZW1fMSA9IHJlcXVpcmUoXCIuL0Fic3RyYWN0aW9ucy9BR3JhcGhJdGVtXCIpO1xyXG52YXIgZ3JvYkRlcml2ZWRTeW1ib2xSZWdleCA9IC9AW2EtekEtWl0vZztcclxudmFyIEdyb2JEZXJpdmVkT3JpZ2luID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xyXG4gICAgZnVuY3Rpb24gR3JvYkRlcml2ZWRPcmlnaW4oKSB7XHJcbiAgICAgICAgdGhpcy5zdGFuZGFyZFZhbHVlID0gMTtcclxuICAgIH1cclxuICAgIEdyb2JEZXJpdmVkT3JpZ2luLlVua293bkxvY2F0aW9uS2V5ID0gJ3Vua25vd24udW5rbm93bi51bmtub3duJztcclxuICAgIHJldHVybiBHcm9iRGVyaXZlZE9yaWdpbjtcclxufSgpKTtcclxuZXhwb3J0cy5Hcm9iRGVyaXZlZE9yaWdpbiA9IEdyb2JEZXJpdmVkT3JpZ2luO1xyXG52YXIgR3JvYk5vZGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XHJcbiAgICB0c2xpYl8xLl9fZXh0ZW5kcyhHcm9iTm9kZSwgX3N1cGVyKTtcclxuICAgIGZ1bmN0aW9uIEdyb2JOb2RlKG5hbWUsIGtleXN0YXJ0LCBwYXJlbnQpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBuYW1lLCBrZXlzdGFydCkgfHwgdGhpcztcclxuICAgICAgICBfdGhpcy5kZXBlbmRlbmNpZXMgPSB7fTtcclxuICAgICAgICBfdGhpcy5kZXBlbmRlbnRzID0ge307XHJcbiAgICAgICAgX3RoaXMudXBkYXRlTGlzdGVuZXJzID0ge307XHJcbiAgICAgICAgaWYgKHBhcmVudClcclxuICAgICAgICAgICAgX3RoaXMucGFyZW50ID0gcGFyZW50O1xyXG4gICAgICAgIHJldHVybiBfdGhpcztcclxuICAgIH1cclxuICAgIEdyb2JOb2RlLmdldFR5cGVTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuICdOb2R0ZTxUIGV4dGVuZHMgTm9kdGU8VD4+JztcclxuICAgIH07XHJcbiAgICBHcm9iTm9kZS5wcm90b3R5cGUuYWRkRGVwZW5kZW50ID0gZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgICAgICB2YXIga2V5ID0gbm9kZS5nZXRLZXkoKTtcclxuICAgICAgICBpZiAodGhpcy5kZXBlbmRlbnRzW2tleV0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZGVwZW5kZW50c1trZXldID0gbm9kZTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH07XHJcbiAgICBHcm9iTm9kZS5wcm90b3R5cGUucmVtb3ZlRGVwZW5kZW50ID0gZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgICAgICBkZWxldGUgdGhpcy5kZXBlbmRlbnRzW25vZGUuZ2V0S2V5KCldO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRlcGVuZGVudHNbbm9kZS5nZXRLZXkoKV0gPT0gbnVsbDtcclxuICAgIH07XHJcbiAgICBHcm9iTm9kZS5wcm90b3R5cGUuZ2V0RGVwZW5kZW50cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX2E7XHJcbiAgICAgICAgLy9AdHMtaWdub3JlXHJcbiAgICAgICAgcmV0dXJuIChfYSA9IE9iamVjdC52YWx1ZXModGhpcy5kZXBlbmRlbnRzKSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogW107XHJcbiAgICB9O1xyXG4gICAgR3JvYk5vZGUucHJvdG90eXBlLmdldERlcGVuZGVuY2llcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgX2E7XHJcbiAgICAgICAgLy9AdHMtaWdub3JlXHJcbiAgICAgICAgcmV0dXJuIChfYSA9IE9iamVjdC52YWx1ZXModGhpcy5kZXBlbmRlbmNpZXMpKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBbXTtcclxuICAgIH07XHJcbiAgICBHcm9iTm9kZS5wcm90b3R5cGUuZ2V0TG9jYXRpb25LZXkgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNlZ3MgPSB0aGlzLmdldExvY2F0aW9uS2V5U2VnbWVudHMoKTtcclxuICAgICAgICByZXR1cm4gc2Vncy5qb2luKCcuJyk7XHJcbiAgICB9O1xyXG4gICAgR3JvYk5vZGUucHJvdG90eXBlLmdldExvY2F0aW9uS2V5U2VnbWVudHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF9hLCBfYiwgX2MsIF9kLCBfZSwgX2Y7XHJcbiAgICAgICAgdmFyIHNlZyA9IFsnJywgJycsICcnXTtcclxuICAgICAgICBzZWdbMF0gPSAoX2MgPSAoX2IgPSAoX2EgPSB0aGlzLnBhcmVudCkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnBhcmVudCkgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmdldE5hbWUoKSkgIT09IG51bGwgJiYgX2MgIT09IHZvaWQgMCA/IF9jIDogJ3Vua25vd24nO1xyXG4gICAgICAgIHNlZ1sxXSA9IChfZSA9IChfZCA9IHRoaXMucGFyZW50KSA9PT0gbnVsbCB8fCBfZCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2QuZ2V0TmFtZSgpKSAhPT0gbnVsbCAmJiBfZSAhPT0gdm9pZCAwID8gX2UgOiAndW5rbm93bic7XHJcbiAgICAgICAgc2VnWzJdID0gKF9mID0gdGhpcy5nZXROYW1lKCkpICE9PSBudWxsICYmIF9mICE9PSB2b2lkIDAgPyBfZiA6ICd1bmtub3duJztcclxuICAgICAgICByZXR1cm4gc2VnO1xyXG4gICAgfTtcclxuICAgIEdyb2JOb2RlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcclxuICAgICAgICB0aGlzLl91cGRhdGUoKTtcclxuICAgICAgICAoT2JqZWN0LmtleXModGhpcy51cGRhdGVMaXN0ZW5lcnMpKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgX3RoaXMudXBkYXRlTGlzdGVuZXJzW2tleV0oKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH07XHJcbiAgICBHcm9iTm9kZS5wcm90b3R5cGUuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBkZWxldGUgcmVmZXJlbmNlcyBhbGxcclxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5kZXBlbmRlbmNpZXMpIHtcclxuICAgICAgICAgICAgdmFyIGN1cnIgPSB0aGlzLmRlcGVuZGVuY2llc1trZXldO1xyXG4gICAgICAgICAgICBjdXJyLnJlbW92ZURlcGVuZGVudCh0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuZGVwZW5kZW50cykge1xyXG4gICAgICAgICAgICB2YXIgY3VyciA9IHRoaXMuZGVwZW5kZW50c1trZXldO1xyXG4gICAgICAgICAgICBjdXJyLm51bGxpZnlEZXBlbmRlbmN5KHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL0B0cy1pZ25vcmVcclxuICAgICAgICB0aGlzLnBhcmVudCA9IG51bGw7XHJcbiAgICAgICAgLy9AdHMtaWdub3JlXHJcbiAgICAgICAgdGhpcy5uYW1lID0gbnVsbDtcclxuICAgIH07XHJcbiAgICBHcm9iTm9kZS5wcm90b3R5cGUuc2V0TmFtZSA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgdmFyIG9sZG5hbWUgPSB0aGlzLmdldE5hbWUoKTtcclxuICAgICAgICBfc3VwZXIucHJvdG90eXBlLnNldE5hbWUuY2FsbCh0aGlzLCBuYW1lKTtcclxuICAgICAgICB0aGlzLnBhcmVudC51cGRhdGVfbm9kZV9uYW1lKG9sZG5hbWUsIG5hbWUpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlTG9jYXRpb24odGhpcy5wYXJlbnQpO1xyXG4gICAgfTtcclxuICAgIEdyb2JOb2RlLnByb3RvdHlwZS51cGRhdGVMb2NhdGlvbiA9IGZ1bmN0aW9uIChwYXJlbnQpIHtcclxuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcclxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5kZXBlbmRlbnRzKSB7XHJcbiAgICAgICAgICAgIHZhciBkZXAgPSB0aGlzLmRlcGVuZGVudHNba2V5XTtcclxuICAgICAgICAgICAgZGVwLnVwZGF0ZURlcGVuZGVjeXNMb2NhdGlvbih0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgR3JvYk5vZGUucHJvdG90eXBlLnVwZGF0ZURlcGVuZGVjeXNMb2NhdGlvbiA9IGZ1bmN0aW9uIChkZXBlbmRlbmN5KSB7IH07XHJcbiAgICBHcm9iTm9kZS5wcm90b3R5cGUuaXNWYWxpZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH07XHJcbiAgICBHcm9iTm9kZS5wcm90b3R5cGUuYWRkVXBkYXRlTGlzdGVuZXIgPSBmdW5jdGlvbiAoa2V5LCBsaXN0ZW5lcikge1xyXG4gICAgICAgIGlmICh0aGlzLnVwZGF0ZUxpc3RlbmVyc1trZXldICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCd0cmllZCB0byBhZGQgdXBkYXRlbGlzdGVuZXIgdG8gbm9kZSB3aXRoIGtleTonICsga2V5ICsgJy4gYnV0IHRoZXJlIHdhcyBhbHJlYWR5IGEgbGlzdGVuZXIgdXNpbmcgdGhhdCBrZXknKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVwZGF0ZUxpc3RlbmVyc1trZXldID0gbGlzdGVuZXI7XHJcbiAgICB9O1xyXG4gICAgR3JvYk5vZGUucHJvdG90eXBlLnJlbW92ZVVwZGF0ZUxpc3RlbmVyID0gZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLnVwZGF0ZUxpc3RlbmVyc1trZXldO1xyXG4gICAgfTtcclxuICAgIEdyb2JOb2RlLnByb3RvdHlwZS5yZW1vdmVBbGxVcGRhdGVMaXN0ZW5lcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVMaXN0ZW5lcnMgPSB7fTtcclxuICAgIH07XHJcbiAgICByZXR1cm4gR3JvYk5vZGU7XHJcbn0oQUdyYXBoSXRlbV8xLkFHcmFwaEl0ZW0pKTtcclxuZXhwb3J0cy5Hcm9iTm9kZSA9IEdyb2JOb2RlO1xyXG52YXIgR3JvYkZpeGVkTm9kZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIHRzbGliXzEuX19leHRlbmRzKEdyb2JGaXhlZE5vZGUsIF9zdXBlcik7XHJcbiAgICBmdW5jdGlvbiBHcm9iRml4ZWROb2RlKG5hbWUsIHBhcmVudCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIG5hbWUsICdORicsIHBhcmVudCkgfHwgdGhpcztcclxuICAgICAgICBfdGhpcy5fX192YWx1ZSA9IDE7XHJcbiAgICAgICAgcmV0dXJuIF90aGlzO1xyXG4gICAgfVxyXG4gICAgR3JvYkZpeGVkTm9kZS5wcm90b3R5cGUuZ2V0VmFsdWUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX19fdmFsdWU7XHJcbiAgICB9O1xyXG4gICAgR3JvYkZpeGVkTm9kZS5wcm90b3R5cGUuc2V0VmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICB0aGlzLl9fX3ZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuZGVwZW5kZW50cykge1xyXG4gICAgICAgICAgICB2YXIgY3VyciA9IHRoaXMuZGVwZW5kZW50c1trZXldO1xyXG4gICAgICAgICAgICBjdXJyLnVwZGF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBHcm9iRml4ZWROb2RlLmdldFR5cGVTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuICdmaXhlZE5vZGUnO1xyXG4gICAgfTtcclxuICAgIEdyb2JGaXhlZE5vZGUucHJvdG90eXBlLmdldFR5cGVTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIEdyb2JGaXhlZE5vZGUuZ2V0VHlwZVN0cmluZygpO1xyXG4gICAgfTtcclxuICAgIEdyb2JGaXhlZE5vZGUucHJvdG90eXBlLmFkZERlcGVuZGVuY3kgPSBmdW5jdGlvbiAobm9kZSkgeyByZXR1cm4gZmFsc2U7IH07XHJcbiAgICBHcm9iRml4ZWROb2RlLnByb3RvdHlwZS5yZW1vdmVEZXBlbmRlbmN5ID0gZnVuY3Rpb24gKG5vZGUpIHsgcmV0dXJuIGZhbHNlOyB9O1xyXG4gICAgR3JvYkZpeGVkTm9kZS5wcm90b3R5cGUubnVsbGlmeURlcGVuZGVuY3kgPSBmdW5jdGlvbiAobm9kZSkgeyByZXR1cm4gZmFsc2U7IH07XHJcbiAgICBHcm9iRml4ZWROb2RlLnByb3RvdHlwZS5fdXBkYXRlID0gZnVuY3Rpb24gKCkgeyB9O1xyXG4gICAgcmV0dXJuIEdyb2JGaXhlZE5vZGU7XHJcbn0oR3JvYk5vZGUpKTtcclxuZXhwb3J0cy5Hcm9iRml4ZWROb2RlID0gR3JvYkZpeGVkTm9kZTtcclxudmFyIEdyb2JEZXJpdmVkTm9kZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIHRzbGliXzEuX19leHRlbmRzKEdyb2JEZXJpdmVkTm9kZSwgX3N1cGVyKTtcclxuICAgIGZ1bmN0aW9uIEdyb2JEZXJpdmVkTm9kZShuYW1lLCBwYXJlbnQpIHtcclxuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBuYW1lLCAnTkQnLCBwYXJlbnQpIHx8IHRoaXM7XHJcbiAgICAgICAgX3RoaXMuY2FsYyA9ICdAYSc7XHJcbiAgICAgICAgX3RoaXMub3JpZ2lucyA9IFtdO1xyXG4gICAgICAgIF90aGlzLl92YWx1ZSA9IE5hTjtcclxuICAgICAgICByZXR1cm4gX3RoaXM7XHJcbiAgICB9XHJcbiAgICBHcm9iRGVyaXZlZE5vZGUucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl92YWx1ZTtcclxuICAgIH07XHJcbiAgICBHcm9iRGVyaXZlZE5vZGUucHJvdG90eXBlLnNldFZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcclxuICAgIH07XHJcbiAgICBHcm9iRGVyaXZlZE5vZGUuZ2V0VHlwZVN0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gJ2Rlcml2ZWROb2RlJztcclxuICAgIH07XHJcbiAgICBHcm9iRGVyaXZlZE5vZGUucHJvdG90eXBlLmdldFR5cGVTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIEdyb2JEZXJpdmVkTm9kZS5nZXRUeXBlU3RyaW5nKCk7XHJcbiAgICB9O1xyXG4gICAgR3JvYkRlcml2ZWROb2RlLnByb3RvdHlwZS5hZGREZXBlbmRlbmN5ID0gZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgICAgICB2YXIga2V5ID0gbm9kZS5nZXRLZXkoKTtcclxuICAgICAgICB0aGlzLmRlcGVuZGVuY2llc1trZXldID0gbm9kZTtcclxuICAgICAgICBub2RlLmFkZERlcGVuZGVudCh0aGlzKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH07XHJcbiAgICBHcm9iRGVyaXZlZE5vZGUucHJvdG90eXBlLnJlbW92ZURlcGVuZGVuY3kgPSBmdW5jdGlvbiAobm9kZSkge1xyXG4gICAgICAgIC8vIGRlbGV0ZSB0aGUgZGVwZW5kZW5jeVxyXG4gICAgICAgIHZhciBrZXkgPSBub2RlLmdldEtleSgpO1xyXG4gICAgICAgIGlmICh0aGlzLmRlcGVuZGVuY2llc1trZXldKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmRlcGVuZGVuY2llc1trZXldO1xyXG4gICAgICAgICAgICBub2RlLnJlbW92ZURlcGVuZGVudCh0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gcmVtb3ZlIG9yaWdpbiBkZXBlbmRlbmN5IFxyXG4gICAgICAgIC8vIHdlIGZpbmQgdGhlIG9yaWdpbiwgd2l0aCB0aGUga2V5IHZhbHVlLCBhbmQgcmVtb3ZlIGl0LlxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vcmlnaW5zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBvcmlnID0gdGhpcy5vcmlnaW5zW2ldO1xyXG4gICAgICAgICAgICBpZiAob3JpZy5vcmlnaW4gIT0gbnVsbCAmJiBvcmlnLm9yaWdpbi5nZXRLZXkoKSA9PSBrZXkpIHtcclxuICAgICAgICAgICAgICAgIG9yaWcub3JpZ2luID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5kZXBlbmRlbmNpZXNba2V5XSA9PSBudWxsO1xyXG4gICAgfTtcclxuICAgIEdyb2JEZXJpdmVkTm9kZS5wcm90b3R5cGUubnVsbGlmeURlcGVuZGVuY3kgPSBmdW5jdGlvbiAobm9kZSkge1xyXG4gICAgICAgIC8vIGZpcnN0IEVtcHR5IHRoZSBvcmlnaW4uXHJcbiAgICAgICAgdmFyIGtleSA9IG5vZGUuZ2V0S2V5KCk7XHJcbiAgICAgICAgdmFyIG9yaWcgPSB0aGlzLm9yaWdpbnMuZmluZChmdW5jdGlvbiAocCkgeyB2YXIgX2E7IHJldHVybiAoKF9hID0gcC5vcmlnaW4pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5nZXRLZXkoKSkgPT0ga2V5OyB9KTtcclxuICAgICAgICBpZiAob3JpZykge1xyXG4gICAgICAgICAgICBvcmlnLm9yaWdpbiA9IG51bGw7XHJcbiAgICAgICAgICAgIG9yaWcub3JpZ2luS2V5ID0gR3JvYkRlcml2ZWRPcmlnaW4uVW5rb3duTG9jYXRpb25LZXk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHRoZW4gbnVsaWZ5IHRoZSBkZXBlbmRlbmN5XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucmVtb3ZlRGVwZW5kZW5jeShub2RlKTtcclxuICAgIH07XHJcbiAgICBHcm9iRGVyaXZlZE5vZGUucHJvdG90eXBlLnNldE9yaWdpbiA9IGZ1bmN0aW9uIChzeW1ib2wsIG5vZGUsIHN0YW5kYXJkVmFsdWUpIHtcclxuICAgICAgICB2YXIgX2EsIF9iO1xyXG4gICAgICAgIGlmIChzdGFuZGFyZFZhbHVlID09PSB2b2lkIDApIHsgc3RhbmRhcmRWYWx1ZSA9IG51bGw7IH1cclxuICAgICAgICB2YXIgb3JpZ2luID0gdGhpcy5vcmlnaW5zLmZpbmQoZnVuY3Rpb24gKHApIHsgcmV0dXJuIHAuc3ltYm9sID09IHN5bWJvbDsgfSk7XHJcbiAgICAgICAgaWYgKCFvcmlnaW4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob3JpZ2luLm9yaWdpbikge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZURlcGVuZGVuY3kob3JpZ2luLm9yaWdpbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGVuc3VyZSB0aGF0IHRoaXMgaXMgdGhlIHJpZ2h0IHR5cGUgb2Ygb2JqZWN0LlxyXG4gICAgICAgIHZhciBub2RlS2V5ID0gKF9hID0gbm9kZSA9PT0gbnVsbCB8fCBub2RlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBub2RlLmdldFR5cGVTdHJpbmcoKSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogJyc7XHJcbiAgICAgICAgaWYgKCFbJ2Rlcml2ZWROb2RlJywgJ2ZpeGVkTm9kZSddLmZpbmQoZnVuY3Rpb24gKHApIHsgcmV0dXJuIHAgPT0gbm9kZUtleTsgfSkpIHtcclxuICAgICAgICAgICAgLy9AdHMtaWdub3JlXHJcbiAgICAgICAgICAgIG5vZGUgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobm9kZSkge1xyXG4gICAgICAgICAgICB0aGlzLmFkZERlcGVuZGVuY3kobm9kZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9yaWdpbi5vcmlnaW4gPSBub2RlO1xyXG4gICAgICAgIG9yaWdpbi5zdGFuZGFyZFZhbHVlID0gKF9iID0gKHN0YW5kYXJkVmFsdWUgIT09IG51bGwgJiYgc3RhbmRhcmRWYWx1ZSAhPT0gdm9pZCAwID8gc3RhbmRhcmRWYWx1ZSA6IG9yaWdpbi5zdGFuZGFyZFZhbHVlKSkgIT09IG51bGwgJiYgX2IgIT09IHZvaWQgMCA/IF9iIDogMTtcclxuICAgICAgICBpZiAob3JpZ2luLm9yaWdpbilcclxuICAgICAgICAgICAgb3JpZ2luLm9yaWdpbktleSA9IG9yaWdpbi5vcmlnaW4uZ2V0TG9jYXRpb25LZXkoKTtcclxuICAgICAgICBpZiAodGhpcy5pc1ZhbGlkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZShmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfTtcclxuICAgIEdyb2JEZXJpdmVkTm9kZS5wcm90b3R5cGUuaXNWYWxpZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgaGFkTnVsbE9yaWdpbiA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMub3JpZ2lucy5mb3JFYWNoKGZ1bmN0aW9uIChvKSB7XHJcbiAgICAgICAgICAgIGlmICghby5vcmlnaW4pIHtcclxuICAgICAgICAgICAgICAgIGhhZE51bGxPcmlnaW4gPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKGhhZE51bGxPcmlnaW4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgb3JpZ2luc1dpdGhMaW5rcyA9IHRoaXMub3JpZ2lucy5maWx0ZXIoZnVuY3Rpb24gKHApIHsgcmV0dXJuIHAub3JpZ2luICE9IG51bGw7IH0pO1xyXG4gICAgICAgIGlmIChvcmlnaW5zV2l0aExpbmtzLmxlbmd0aCAhPSB0aGlzLmdldERlcGVuZGVuY2llcygpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfTtcclxuICAgIEdyb2JEZXJpdmVkTm9kZS5wcm90b3R5cGUudXBkYXRlT3JpZ2lucyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgb3JpZ2luUmVzID0gdGhpcy5wYXJzZUNhbGN1bGF0aW9uVG9PcmlnaW5zKHRoaXMuY2FsYyk7XHJcbiAgICAgICAgaWYgKG9yaWdpblJlcykge1xyXG4gICAgICAgICAgICB2YXIgc3ltYm9sc1RvUmVtXzEgPSBvcmlnaW5SZXMuc3ltYm9sc1RvUmVtO1xyXG4gICAgICAgICAgICB2YXIgc3ltYm9sc1RvQWRkID0gb3JpZ2luUmVzLnN5bWJvbHNUb0FkZDtcclxuICAgICAgICAgICAgLy8gcmVtb3ZlIHN5bWJvbHMgXHJcbiAgICAgICAgICAgIGlmIChzeW1ib2xzVG9SZW1fMS5sZW5ndGggIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcmlnaW5zID0gdGhpcy5vcmlnaW5zLmZpbHRlcihmdW5jdGlvbiAocCkgeyByZXR1cm4gIXN5bWJvbHNUb1JlbV8xLmluY2x1ZGVzKHAuc3ltYm9sKTsgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gYWRkIGl0ZW1zIGlmIHRoZXJlIGlzIGFueXRoaW5nIHRvIGFkZC4gIFxyXG4gICAgICAgICAgICBpZiAoc3ltYm9sc1RvQWRkLmxlbmd0aCAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN5bWJvbHNUb0FkZC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBvcmlnID0gbmV3IEdyb2JEZXJpdmVkT3JpZ2luKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgb3JpZy5zeW1ib2wgPSBzeW1ib2xzVG9BZGRbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgb3JpZy5zdGFuZGFyZFZhbHVlID0gMTtcclxuICAgICAgICAgICAgICAgICAgICBvcmlnLm9yaWdpbiA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgb3JpZy5vcmlnaW5LZXkgPSBHcm9iRGVyaXZlZE9yaWdpbi5Vbmtvd25Mb2NhdGlvbktleTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9yaWdpbnMucHVzaChvcmlnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBoYW5kbGUgRGVwZW5kZW5jaWVzIFxyXG4gICAgICAgICAgICB2YXIgb2xkRGVwZW5kZW5jaWVzXzEgPSB7fTtcclxuICAgICAgICAgICAgdGhpcy5nZXREZXBlbmRlbmNpZXMoKS5mb3JFYWNoKGZ1bmN0aW9uIChwKSB7IHJldHVybiBvbGREZXBlbmRlbmNpZXNfMVtwLmdldE5hbWUoKV0gPSBwOyB9KTtcclxuICAgICAgICAgICAgdmFyIG5ld0RlcGVuZGVuY2llc18xID0ge307XHJcbiAgICAgICAgICAgIHRoaXMub3JpZ2lucy5mb3JFYWNoKGZ1bmN0aW9uIChwKSB7IHZhciBfYTsgaWYgKHAub3JpZ2luICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIG5ld0RlcGVuZGVuY2llc18xWyhfYSA9IHAub3JpZ2luKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuZ2V0TmFtZSgpXSA9IHAub3JpZ2luO1xyXG4gICAgICAgICAgICB9IH0pO1xyXG4gICAgICAgICAgICAvLyByZW1vdmUgb2xkIERlcGVuZGVuY2llcyBcclxuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIG9sZERlcGVuZGVuY2llc18xKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIW5ld0RlcGVuZGVuY2llc18xW2tleV0pIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZURlcGVuZGVuY3kob2xkRGVwZW5kZW5jaWVzXzFba2V5XSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHsgYWRkZWQ6IHN5bWJvbHNUb0FkZCwgcmVtb3ZlZDogc3ltYm9sc1RvUmVtXzEubGVuZ3RoIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4geyBhZGRlZDogMCwgcmVtb3ZlZDogMCB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICBHcm9iRGVyaXZlZE5vZGUucHJvdG90eXBlLnNldENhbGMgPSBmdW5jdGlvbiAoY2FsYywgdXBkYXRlT3JpZ2lucykge1xyXG4gICAgICAgIGlmICh1cGRhdGVPcmlnaW5zID09PSB2b2lkIDApIHsgdXBkYXRlT3JpZ2lucyA9IHRydWU7IH1cclxuICAgICAgICAvLyByZXNldCBUaGlzJyBWYWx1ZTtcclxuICAgICAgICB0aGlzLl92YWx1ZSA9IE5hTjtcclxuICAgICAgICAvLyB0ZXN0IGlmIGl0IGlzIGNhbGN1bGF0ZWFibGVcclxuICAgICAgICB2YXIgdGVzdENhbGMgPSB0aGlzLnRlc3RDYWxjdWxhdGUoY2FsYyk7XHJcbiAgICAgICAgaWYgKHRlc3RDYWxjID09IG51bGwgfHwgIXRlc3RDYWxjLnN1Y2Nlc3MpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNhbGMgPSBjYWxjO1xyXG4gICAgICAgIC8vIHVwZGF0ZSBvcmlnaW5zLlxyXG4gICAgICAgIGlmICh1cGRhdGVPcmlnaW5zKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlT3JpZ2lucygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5pc1ZhbGlkKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZShmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogUGFyc2VzIGNhbGN1bGF0aW9uIFRvIGEgTnVtYmVyIG9mIE9yaWdpbnMuXHJcbiAgICAgKiBAcmV0dXJuc1xyXG4gICAgICovXHJcbiAgICBHcm9iRGVyaXZlZE5vZGUucHJvdG90eXBlLnBhcnNlQ2FsY3VsYXRpb25Ub09yaWdpbnMgPSBmdW5jdGlvbiAoY2FsYykge1xyXG4gICAgICAgIHZhciBfYTtcclxuICAgICAgICB2YXIgY2FsY1ZhbHVlID0gY2FsYztcclxuICAgICAgICAvLyBnZXQgc3ltYm9scyBmcm9tIHRoZSBjYWxjLiBhbmQgdHVybiBpdCBpbnRvIGFuIGFycmF5LiBpbXBvcnRhbnQsIHRoZSBhcnJheSBpcyBhbiBhcnJheSBvZiB1bmlxdWUga2V5cy5cclxuICAgICAgICB2YXIgc3ltYm9scyA9IChfYSA9IGNhbGNWYWx1ZS5tYXRjaChncm9iRGVyaXZlZFN5bWJvbFJlZ2V4KSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogW107XHJcbiAgICAgICAgc3ltYm9scyA9IEFycmF5LmZyb20obmV3IFNldChzeW1ib2xzKSk7XHJcbiAgICAgICAgLy8gZ2V0IHRoZSBrZXlzIHRoYXQgYXJlIGFscmVhZHkgdGhlcmUuXHJcbiAgICAgICAgdmFyIGV4aXN0aW5nS2V5c0FycmF5ID0gdGhpcy5vcmlnaW5zLm1hcChmdW5jdGlvbiAocCkgeyByZXR1cm4gcC5zeW1ib2w7IH0pO1xyXG4gICAgICAgIC8vIGdldCBhIGxpc3Qgb2Ygc3ltYm9scyB0byBhZGQgYW5kIHJlbW92ZS5cclxuICAgICAgICB2YXIgc3ltYm9sc1RvQWRkID0gc3ltYm9scy5maWx0ZXIoZnVuY3Rpb24gKHApIHsgcmV0dXJuICFleGlzdGluZ0tleXNBcnJheS5pbmNsdWRlcyhwKTsgfSk7XHJcbiAgICAgICAgdmFyIHN5bWJvbHNUb1JlbSA9IGV4aXN0aW5nS2V5c0FycmF5LmZpbHRlcihmdW5jdGlvbiAocCkgeyByZXR1cm4gIXN5bWJvbHMuaW5jbHVkZXMocCk7IH0pO1xyXG4gICAgICAgIHJldHVybiB7IHN5bWJvbHNUb1JlbTogc3ltYm9sc1RvUmVtLCBzeW1ib2xzVG9BZGQ6IHN5bWJvbHNUb0FkZCwgdG90YWxTeW1ib2xzOiBzeW1ib2xzIH07XHJcbiAgICB9O1xyXG4gICAgR3JvYkRlcml2ZWROb2RlLnN0YXRpY1BhcnNlQ2FsY3VsYXRpb25Ub09yaWdpbnMgPSBmdW5jdGlvbiAoY2FsYykge1xyXG4gICAgICAgIHZhciBfYTtcclxuICAgICAgICB2YXIgY2FsY1ZhbHVlID0gY2FsYztcclxuICAgICAgICAvLyBnZXQgc3ltYm9scyBmcm9tIHRoZSBjYWxjLiBhbmQgdHVybiBpdCBpbnRvIGFuIGFycmF5LiBpbXBvcnRhbnQsIHRoZSBhcnJheSBpcyBhbiBhcnJheSBvZiB1bmlxdWUga2V5cy5cclxuICAgICAgICB2YXIgc3ltYm9scyA9IChfYSA9IGNhbGNWYWx1ZS5tYXRjaChncm9iRGVyaXZlZFN5bWJvbFJlZ2V4KSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogW107XHJcbiAgICAgICAgc3ltYm9scyA9IEFycmF5LmZyb20obmV3IFNldChzeW1ib2xzKSk7XHJcbiAgICAgICAgcmV0dXJuIHN5bWJvbHM7XHJcbiAgICB9O1xyXG4gICAgR3JvYkRlcml2ZWROb2RlLnByb3RvdHlwZS5yZWNhbGN1bGF0ZSA9IGZ1bmN0aW9uICh1c2VUZW1wVmFsdWVzKSB7XHJcbiAgICAgICAgaWYgKHVzZVRlbXBWYWx1ZXMgPT09IHZvaWQgMCkgeyB1c2VUZW1wVmFsdWVzID0gZmFsc2U7IH1cclxuICAgICAgICAvL2NvbnN0IHN5bWJvbHMgPSB0aGlzLmNhbGMubWF0Y2goIGdyb2JEZXJpdmVkU3ltYm9sUmVnZXggKTsgIFxyXG4gICAgICAgIHZhciByZWMgPSB1c2VUZW1wVmFsdWVzID9cclxuICAgICAgICAgICAgT2JqZWN0LmZyb21FbnRyaWVzKHRoaXMub3JpZ2lucy5tYXAoZnVuY3Rpb24gKHApIHsgcmV0dXJuIFtwLnN5bWJvbCwgcC5zdGFuZGFyZFZhbHVlXTsgfSkpIDpcclxuICAgICAgICAgICAgT2JqZWN0LmZyb21FbnRyaWVzKHRoaXMub3JpZ2lucy5tYXAoZnVuY3Rpb24gKHApIHsgdmFyIF9hOyByZXR1cm4gW3Auc3ltYm9sLCAoX2EgPSBwLm9yaWdpbikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmdldFZhbHVlKCldOyB9KSk7XHJcbiAgICAgICAgdmFyIHN0YXRlbWVudCA9IHRoaXMuY2FsYztcclxuICAgICAgICB2YXIgcmVzID0gdGhpcy5fcmVjYWxjdWxhdGUocmVjLCBzdGF0ZW1lbnQpO1xyXG4gICAgICAgIHRoaXMuX3ZhbHVlID0gcmVzLnZhbHVlO1xyXG4gICAgICAgIHJldHVybiByZXMuc3VjY2VzcztcclxuICAgIH07XHJcbiAgICBHcm9iRGVyaXZlZE5vZGUucHJvdG90eXBlLl9yZWNhbGN1bGF0ZSA9IGZ1bmN0aW9uIChyZWMsIHN0YXRlbWVudCkge1xyXG4gICAgICAgIGlmIChyZWMgPT09IHZvaWQgMCkgeyByZWMgPSB7fTsgfVxyXG4gICAgICAgIHJldHVybiBHcm9iRGVyaXZlZE5vZGUucmVjYWxjdWxhdGUocmVjLCBzdGF0ZW1lbnQpO1xyXG4gICAgfTtcclxuICAgIEdyb2JEZXJpdmVkTm9kZS5yZWNhbGN1bGF0ZSA9IGZ1bmN0aW9uIChyZWMsIHN0YXRlbWVudCkge1xyXG4gICAgICAgIGlmIChyZWMgPT09IHZvaWQgMCkgeyByZWMgPSB7fTsgfVxyXG4gICAgICAgIHZhciBzeW1ib2xzID0gc3RhdGVtZW50Lm1hdGNoKGdyb2JEZXJpdmVkU3ltYm9sUmVnZXgpO1xyXG4gICAgICAgIC8vbGV0IHJlYyA9IFxyXG4gICAgICAgIC8vXHR1c2VUZW1wVmFsdWVzID9cclxuICAgICAgICAvL1x0T2JqZWN0LmZyb21FbnRyaWVzKCBvcmlnaW5zLm1hcChwID0+IFsgcC5zeW1ib2wsIHAuc3RhbmRhcmRWYWx1ZV0pKTpcdFxyXG4gICAgICAgIC8vXHRPYmplY3QuZnJvbUVudHJpZXMoIG9yaWdpbnMubWFwKHAgPT4gWyBwLnN5bWJvbCwgcC5vcmlnaW4/LmdldFZhbHVlKCkgXSkpO1xyXG4gICAgICAgIHZhciBfc3RhdGVtZW50ID0gc3RhdGVtZW50O1xyXG4gICAgICAgIHN5bWJvbHMgPT09IG51bGwgfHwgc3ltYm9scyA9PT0gdm9pZCAwID8gdm9pZCAwIDogc3ltYm9scy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgdmFyIHYgPSByZWNba2V5XTtcclxuICAgICAgICAgICAgX3N0YXRlbWVudCA9IF9zdGF0ZW1lbnQucmVwbGFjZShrZXksIHYgKyBcIlwiKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgcmVjYWxjU3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IDA7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdmFyIHJlcyA9IGV2YWwoX3N0YXRlbWVudCk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICAgICAgcmVjYWxjU3VjY2VzcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHJlcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlY2FsY1N1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gTmFOO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJlY2FsY1N1Y2Nlc3MgPSBmYWxzZTtcclxuICAgICAgICAgICAgdmFsdWUgPSBOYU47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IHJlY2FsY1N1Y2Nlc3MsIHZhbHVlOiB2YWx1ZSB9O1xyXG4gICAgfTtcclxuICAgIEdyb2JEZXJpdmVkTm9kZS5wcm90b3R5cGUudGVzdENhbGN1bGF0ZSA9IGZ1bmN0aW9uIChzdGF0ZW1lbnQpIHtcclxuICAgICAgICB2YXIgc3ltYm9scyA9IHN0YXRlbWVudC5tYXRjaChncm9iRGVyaXZlZFN5bWJvbFJlZ2V4KTtcclxuICAgICAgICB2YXIgcmVjID0gc3ltYm9scyA/IE9iamVjdC5mcm9tRW50cmllcyhzeW1ib2xzLm1hcChmdW5jdGlvbiAocykgeyByZXR1cm4gW3MsIDFdOyB9KSkgOiB7fTtcclxuICAgICAgICB2YXIgcmVzID0gdGhpcy5fcmVjYWxjdWxhdGUocmVjLCBzdGF0ZW1lbnQpO1xyXG4gICAgICAgIHJldHVybiByZXM7XHJcbiAgICB9O1xyXG4gICAgR3JvYkRlcml2ZWROb2RlLnRlc3RDYWxjdWxhdGUgPSBmdW5jdGlvbiAoc3RhdGVtZW50LCBzeW1ib2xzVG9WYWx1ZSkge1xyXG4gICAgICAgIGlmIChzeW1ib2xzVG9WYWx1ZSA9PT0gdm9pZCAwKSB7IHN5bWJvbHNUb1ZhbHVlID0ge307IH1cclxuICAgICAgICB2YXIgc3ltYm9scyA9IHN0YXRlbWVudC5tYXRjaChncm9iRGVyaXZlZFN5bWJvbFJlZ2V4KTtcclxuICAgICAgICBmdW5jdGlvbiBtYXBWYWx1ZVRvU3ltYm9sKHMsIG0pIHtcclxuICAgICAgICAgICAgaWYgKG1bc10pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBtW3NdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcmVjID0gc3ltYm9scyA/IE9iamVjdC5mcm9tRW50cmllcyhzeW1ib2xzLm1hcChmdW5jdGlvbiAocykgeyByZXR1cm4gW3MsIG1hcFZhbHVlVG9TeW1ib2wocywgc3ltYm9sc1RvVmFsdWUpXTsgfSkpIDoge307XHJcbiAgICAgICAgdmFyIHJlcyA9IEdyb2JEZXJpdmVkTm9kZS5yZWNhbGN1bGF0ZShyZWMsIHN0YXRlbWVudCk7XHJcbiAgICAgICAgcmV0dXJuIHJlcztcclxuICAgIH07XHJcbiAgICBHcm9iRGVyaXZlZE5vZGUucHJvdG90eXBlLl91cGRhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzVmFsaWQoKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiTm9kZSBpc2VudCBWYWxpZCBcIi5jb25jYXQodGhpcy5nZXROYW1lKCksIFwiIFwiKS5jb25jYXQodGhpcy5nZXRMb2NhdGlvbktleSgpLCBcIiBTdG9wcGluZyB1cGRhdGVcIikpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGZpcnN0IHJlY2FsY3VsYXRlXHJcbiAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZSgpO1xyXG4gICAgICAgIC8vIHRoZW4gY2FsbCB1cGRhdGUgZm9yIGFsbCBkZXBlbmRlbnRzIFxyXG4gICAgICAgIHZhciBzdWNjZXNzID0gdHJ1ZTtcclxuICAgICAgICBmb3IgKHZhciBrIGluIHRoaXMuZGVwZW5kZW50cykge1xyXG4gICAgICAgICAgICB2YXIgZGVwID0gdGhpcy5kZXBlbmRlbnRzW2tdO1xyXG4gICAgICAgICAgICBzdWNjZXNzID0gc3VjY2VzcyAmJiBkZXAudXBkYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdWNjZXNzO1xyXG4gICAgfTtcclxuICAgIEdyb2JEZXJpdmVkTm9kZS5wcm90b3R5cGUudXBkYXRlRGVwZW5kZWN5c0xvY2F0aW9uID0gZnVuY3Rpb24gKGRlcGVuZGVuY3kpIHtcclxuICAgICAgICB2YXIgb3JpZyA9IHRoaXMub3JpZ2lucy5maW5kKGZ1bmN0aW9uIChwKSB7IHZhciBfYTsgcmV0dXJuICgoX2EgPSBwLm9yaWdpbikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmdldE5hbWUoKSkgPT0gZGVwZW5kZW5jeS5nZXROYW1lKCk7IH0pO1xyXG4gICAgICAgIGlmICghb3JpZylcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIG9yaWcub3JpZ2luS2V5ID0gZGVwZW5kZW5jeS5nZXRMb2NhdGlvbktleSgpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBHcm9iRGVyaXZlZE5vZGU7XHJcbn0oR3JvYk5vZGUpKTtcclxuZXhwb3J0cy5Hcm9iRGVyaXZlZE5vZGUgPSBHcm9iRGVyaXZlZE5vZGU7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuR3JvYkNvbGxlY3Rpb24gPSB2b2lkIDA7XHJcbnZhciB0c2xpYl8xID0gcmVxdWlyZShcInRzbGliXCIpO1xyXG52YXIgQUdyYXBoSXRlbV8xID0gcmVxdWlyZShcIi4vQWJzdHJhY3Rpb25zL0FHcmFwaEl0ZW1cIik7XHJcbnZhciBHcm9iQ29sbGVjdGlvbiA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcclxuICAgIHRzbGliXzEuX19leHRlbmRzKEdyb2JDb2xsZWN0aW9uLCBfc3VwZXIpO1xyXG4gICAgZnVuY3Rpb24gR3JvYkNvbGxlY3Rpb24obmFtZSwgcGFyZW50KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgbmFtZSwgJ0MnKSB8fCB0aGlzO1xyXG4gICAgICAgIF90aGlzLm5vZGVzX25hbWVzID0ge307XHJcbiAgICAgICAgcmV0dXJuIF90aGlzO1xyXG4gICAgfVxyXG4gICAgR3JvYkNvbGxlY3Rpb24ucHJvdG90eXBlLmdldE5vZGVOYW1lcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5ub2Rlc19uYW1lcyk7XHJcbiAgICB9O1xyXG4gICAgR3JvYkNvbGxlY3Rpb24ucHJvdG90eXBlLmdldE5vZGVzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMubm9kZXNfbmFtZXMpO1xyXG4gICAgfTtcclxuICAgIEdyb2JDb2xsZWN0aW9uLnByb3RvdHlwZS5oYXNOb2RlID0gZnVuY3Rpb24gKG5hbWUpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5ub2Rlc19uYW1lc1tuYW1lXSA/IHRydWUgOiBmYWxzZTtcclxuICAgIH07XHJcbiAgICBHcm9iQ29sbGVjdGlvbi5wcm90b3R5cGUuZ2V0Tm9kZSA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgdmFyIF9hO1xyXG4gICAgICAgIHJldHVybiAoX2EgPSB0aGlzLm5vZGVzX25hbWVzW25hbWVdKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBudWxsO1xyXG4gICAgfTtcclxuICAgIEdyb2JDb2xsZWN0aW9uLnByb3RvdHlwZS5hZGROb2RlID0gZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgICAgICAvL0B0cy1pZ25vcmVcclxuICAgICAgICBub2RlLnBhcmVudCA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5ub2Rlc19uYW1lc1tub2RlLmdldE5hbWUoKV0gPSBub2RlO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfTtcclxuICAgIEdyb2JDb2xsZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVOb2RlID0gZnVuY3Rpb24gKG5vZGUpIHtcclxuICAgICAgICBpZiAoIW5vZGUpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcignYXR0ZW1wdGVkIHRvIGRlbGV0ZSBub2RlIFwiTnVsbFwiICcpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBuYW1lID0gbm9kZS5nZXROYW1lKCk7XHJcbiAgICAgICAgdmFyIG4gPSB0aGlzLm5vZGVzX25hbWVzW25hbWVdO1xyXG4gICAgICAgIGlmICghbilcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIG4uZGlzcG9zZSgpO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLm5vZGVzX25hbWVzW25hbWVdO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5vZGVzX25hbWVzW25hbWVdID09IG51bGw7XHJcbiAgICB9O1xyXG4gICAgR3JvYkNvbGxlY3Rpb24ucHJvdG90eXBlLnVwZGF0ZV9ub2RlX25hbWUgPSBmdW5jdGlvbiAob2xkTmFtZSwgbmV3TmFtZSkge1xyXG4gICAgICAgIGlmIChvbGROYW1lID09IG5ld05hbWUpXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB0aGlzLm5vZGVzX25hbWVzW25ld05hbWVdID0gdGhpcy5ub2Rlc19uYW1lc1tvbGROYW1lXTtcclxuICAgICAgICBkZWxldGUgdGhpcy5ub2Rlc19uYW1lc1tvbGROYW1lXTtcclxuICAgIH07XHJcbiAgICBHcm9iQ29sbGVjdGlvbi5wcm90b3R5cGUuc2V0TmFtZSA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgdmFyIG9sZG5hbWUgPSB0aGlzLmdldE5hbWUoKTtcclxuICAgICAgICBpZiAob2xkbmFtZSA9PSBuYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgX3N1cGVyLnByb3RvdHlwZS5zZXROYW1lLmNhbGwodGhpcywgbmFtZSk7XHJcbiAgICAgICAgdGhpcy5wYXJlbnQudXBkYXRlX2NvbGxlY3Rpb25fbmFtZShvbGRuYW1lLCBuYW1lKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZUxvY2F0aW9uKHRoaXMucGFyZW50KTtcclxuICAgIH07XHJcbiAgICBHcm9iQ29sbGVjdGlvbi5wcm90b3R5cGUudXBkYXRlTG9jYXRpb24gPSBmdW5jdGlvbiAocGFyZW50KSB7XHJcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XHJcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLm5vZGVzX25hbWVzKSB7XHJcbiAgICAgICAgICAgIHZhciBjdXJyID0gdGhpcy5ub2Rlc19uYW1lc1tuYW1lXTtcclxuICAgICAgICAgICAgY3Vyci51cGRhdGVMb2NhdGlvbih0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgR3JvYkNvbGxlY3Rpb24ucHJvdG90eXBlLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLm5vZGVzX25hbWVzKSB7XHJcbiAgICAgICAgICAgIHZhciBjdXJyID0gdGhpcy5ub2Rlc19uYW1lc1tuYW1lXTtcclxuICAgICAgICAgICAgY3Vyci5kaXNwb3NlKCk7XHJcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLm5vZGVzX25hbWVzW25hbWVdO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBudWxsO1xyXG4gICAgICAgIC8vQHRzLWlnbm9yZVxyXG4gICAgICAgIHRoaXMubmFtZSA9IG51bGw7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIEdyb2JDb2xsZWN0aW9uO1xyXG59KEFHcmFwaEl0ZW1fMS5BR3JhcGhJdGVtKSk7XHJcbmV4cG9ydHMuR3JvYkNvbGxlY3Rpb24gPSBHcm9iQ29sbGVjdGlvbjtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5Hcm9iR3JvdXAgPSB2b2lkIDA7XHJcbnZhciB0c2xpYl8xID0gcmVxdWlyZShcInRzbGliXCIpO1xyXG52YXIgQUdyYXBoSXRlbV8xID0gcmVxdWlyZShcIi4vQWJzdHJhY3Rpb25zL0FHcmFwaEl0ZW1cIik7XHJcbnZhciBHcm9iR3JvdXAgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XHJcbiAgICB0c2xpYl8xLl9fZXh0ZW5kcyhHcm9iR3JvdXAsIF9zdXBlcik7XHJcbiAgICBmdW5jdGlvbiBHcm9iR3JvdXAobmFtZSwgcGFyZW50KSB7XHJcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgbmFtZSwgJ0cnKSB8fCB0aGlzO1xyXG4gICAgICAgIF90aGlzLmNvbGxlY3Rpb25zX25hbWVzID0ge307XHJcbiAgICAgICAgcmV0dXJuIF90aGlzO1xyXG4gICAgfVxyXG4gICAgR3JvYkdyb3VwLnByb3RvdHlwZS5nZXRDb2xsZWN0aW9uc05hbWVzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLmNvbGxlY3Rpb25zX25hbWVzKTtcclxuICAgIH07XHJcbiAgICBHcm9iR3JvdXAucHJvdG90eXBlLmhhc0NvbGxlY3Rpb24gPSBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb25zX25hbWVzW25hbWVdID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgfTtcclxuICAgIEdyb2JHcm91cC5wcm90b3R5cGUuZ2V0Q29sbGVjdGlvbiA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbnNfbmFtZXNbbmFtZV07XHJcbiAgICB9O1xyXG4gICAgR3JvYkdyb3VwLnByb3RvdHlwZS5hZGRDb2xsZWN0aW9uID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24pIHtcclxuICAgICAgICBjb2xsZWN0aW9uLnBhcmVudCA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5jb2xsZWN0aW9uc19uYW1lc1tjb2xsZWN0aW9uLmdldE5hbWUoKV0gPSBjb2xsZWN0aW9uO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfTtcclxuICAgIEdyb2JHcm91cC5wcm90b3R5cGUucmVtb3ZlQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uKSB7XHJcbiAgICAgICAgdmFyIG5hbWUgPSBjb2xsZWN0aW9uLmdldE5hbWUoKTtcclxuICAgICAgICB2YXIgYyA9IHRoaXMuY29sbGVjdGlvbnNfbmFtZXNbbmFtZV07XHJcbiAgICAgICAgaWYgKCFjKVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgY29sbGVjdGlvbi5kaXNwb3NlKCk7XHJcbiAgICAgICAgZGVsZXRlIHRoaXMuY29sbGVjdGlvbnNfbmFtZXNbbmFtZV07XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sbGVjdGlvbnNfbmFtZXNbbmFtZV0gPT0gbnVsbDtcclxuICAgIH07XHJcbiAgICBHcm9iR3JvdXAucHJvdG90eXBlLnVwZGF0ZV9jb2xsZWN0aW9uX25hbWUgPSBmdW5jdGlvbiAob2xkTmFtZSwgbmV3TmFtZSkge1xyXG4gICAgICAgIHRoaXMuY29sbGVjdGlvbnNfbmFtZXNbbmV3TmFtZV0gPSB0aGlzLmNvbGxlY3Rpb25zX25hbWVzW29sZE5hbWVdO1xyXG4gICAgICAgIGRlbGV0ZSB0aGlzLmNvbGxlY3Rpb25zX25hbWVzW29sZE5hbWVdO1xyXG4gICAgfTtcclxuICAgIEdyb2JHcm91cC5wcm90b3R5cGUuc2V0TmFtZSA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgX3N1cGVyLnByb3RvdHlwZS5zZXROYW1lLmNhbGwodGhpcywgbmFtZSk7XHJcbiAgICAgICAgZm9yICh2YXIgbmFtZV8xIGluIHRoaXMuY29sbGVjdGlvbnNfbmFtZXMpIHtcclxuICAgICAgICAgICAgdmFyIGN1cnIgPSB0aGlzLmNvbGxlY3Rpb25zX25hbWVzW25hbWVfMV07XHJcbiAgICAgICAgICAgIGN1cnIudXBkYXRlTG9jYXRpb24odGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuICAgIEdyb2JHcm91cC5wcm90b3R5cGUuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMuY29sbGVjdGlvbnNfbmFtZXMpIHtcclxuICAgICAgICAgICAgdmFyIGN1cnIgPSB0aGlzLmNvbGxlY3Rpb25zX25hbWVzW25hbWVdO1xyXG4gICAgICAgICAgICBjdXJyLmRpc3Bvc2UoKTtcclxuICAgICAgICAgICAgZGVsZXRlIHRoaXMuY29sbGVjdGlvbnNfbmFtZXNbbmFtZV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vQHRzLWlnbm9yZVxyXG4gICAgICAgIHRoaXMubmFtZSA9IG51bGw7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIEdyb2JHcm91cDtcclxufShBR3JhcGhJdGVtXzEuQUdyYXBoSXRlbSkpO1xyXG5leHBvcnRzLkdyb2JHcm91cCA9IEdyb2JHcm91cDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy5UVFJQR1N5c3RlbUdyYXBoQWJzdHJhY3RNb2RlbCA9IHZvaWQgMDtcclxudmFyIEdyb2JDb2xsZWN0aW9uXzEgPSByZXF1aXJlKFwiLi4vR3JvYkNvbGxlY3Rpb25cIik7XHJcbnZhciBHcm9iR3JvdXBfMSA9IHJlcXVpcmUoXCIuLi9Hcm9iR3JvdXBcIik7XHJcbnZhciBJT3V0cHV0SGFuZGxlcl8xID0gcmVxdWlyZShcIi4uL0Fic3RyYWN0aW9ucy9JT3V0cHV0SGFuZGxlclwiKTtcclxuLyoqXHJcbiogYSBnZW5lcmFsIGFuZCBmbGV4aWJsZSBpbXBsZW1lbnRhdGlvbiBvZiBUVFJQRyBzeXN0ZW0uIGl0IGZvY3Vzc2VzIG9uIG5vdCBkaXNrcmltaW5hdGlvbiBvciBzb3J0aW5nIGRhdGEuXHJcbiogc2ltcGx5IGhhdmluZyBsb2dpYyB0aGF0IGlzIHRoZSBzYW1lIGZvciBldmVyeXRoaW5nLlxyXG4qL1xyXG52YXIgVFRSUEdTeXN0ZW1HcmFwaEFic3RyYWN0TW9kZWwgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XHJcbiAgICBmdW5jdGlvbiBUVFJQR1N5c3RlbUdyYXBoQWJzdHJhY3RNb2RlbCgpIHtcclxuICAgICAgICB0aGlzLmRhdGEgPSB7fTtcclxuICAgIH1cclxuICAgIFRUUlBHU3lzdGVtR3JhcGhBYnN0cmFjdE1vZGVsLnByb3RvdHlwZS5zZXRPdXQgPSBmdW5jdGlvbiAob3V0KSB7XHJcbiAgICAgICAgdGhpcy5vdXQgPSBvdXQgPyBvdXQgOiAoMCwgSU91dHB1dEhhbmRsZXJfMS5uZXdPdXRwdXRIYW5kbGVyKSgpO1xyXG4gICAgfTtcclxuICAgIFRUUlBHU3lzdGVtR3JhcGhBYnN0cmFjdE1vZGVsLnByb3RvdHlwZS5fZGVsZXRlR3JvdXAgPSBmdW5jdGlvbiAoZ3JvdXApIHtcclxuICAgICAgICBpZiAodHlwZW9mIGdyb3VwID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHZhciBnXzEgPSB0aGlzLl9nZXRHcm91cChncm91cCk7XHJcbiAgICAgICAgICAgIGlmICghZ18xKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICBncm91cCA9IGdfMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGtleSA9IGdyb3VwLmdldE5hbWUoKTtcclxuICAgICAgICB2YXIgZyA9IHRoaXMuZGF0YVtrZXldO1xyXG4gICAgICAgIGlmICghZykge1xyXG4gICAgICAgICAgICB0aGlzLm91dC5vdXRFcnJvcigndHJpZWQgdG8gZGVsZXRlIG5vbiBleGlzdGFudCBncm91cCcpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdyb3VwLmRpc3Bvc2UoKTtcclxuICAgICAgICBkZWxldGUgdGhpcy5kYXRhW2tleV07XHJcbiAgICB9O1xyXG4gICAgVFRSUEdTeXN0ZW1HcmFwaEFic3RyYWN0TW9kZWwucHJvdG90eXBlLl9jcmVhdGVHcm91cCA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hhc0dyb3VwKG5hbWUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKCdhdHRlbXB0ZWQgdG8gYWRkIG5ldyBncm91cCwgaG93ZXZlciBncm91cCBhbHJlYWR5IGV4aXN0ZWQnKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBncCA9IG5ldyBHcm9iR3JvdXBfMS5Hcm9iR3JvdXAobmFtZSwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5kYXRhW2dwLmdldE5hbWUoKV0gPSBncDtcclxuICAgICAgICByZXR1cm4gZ3A7XHJcbiAgICB9O1xyXG4gICAgVFRSUEdTeXN0ZW1HcmFwaEFic3RyYWN0TW9kZWwucHJvdG90eXBlLl9oYXNHcm91cCA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuZGF0YSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhW2tleV0uZ2V0TmFtZSgpID09IG5hbWUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH07XHJcbiAgICBUVFJQR1N5c3RlbUdyYXBoQWJzdHJhY3RNb2RlbC5wcm90b3R5cGUuX2dldEdyb3VwX2tleSA9IGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kYXRhW2tleV07XHJcbiAgICB9O1xyXG4gICAgVFRSUEdTeXN0ZW1HcmFwaEFic3RyYWN0TW9kZWwucHJvdG90eXBlLl9nZXRHcm91cCA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuZGF0YSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhW2tleV0uZ2V0TmFtZSgpID09IG5hbWUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmRhdGFba2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH07XHJcbiAgICBUVFJQR1N5c3RlbUdyYXBoQWJzdHJhY3RNb2RlbC5wcm90b3R5cGUuX2RlbGV0ZUNvbGxlY3Rpb24gPSBmdW5jdGlvbiAoY29sbGVjdGlvbikge1xyXG4gICAgICAgIGlmICghY29sbGVjdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLm91dC5vdXRFcnJvcihcInRyaWVkIHRvIGRlbGV0ZSBjb2xsZWN0aW9uLCBidXQgc3VwcGxpZWQgY29sbGVjdGlvbiB3YXMgaW52YWxpZFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGdyb3VwID0gY29sbGVjdGlvbi5wYXJlbnQ7XHJcbiAgICAgICAgcmV0dXJuIGdyb3VwLnJlbW92ZUNvbGxlY3Rpb24oY29sbGVjdGlvbik7XHJcbiAgICB9O1xyXG4gICAgVFRSUEdTeXN0ZW1HcmFwaEFic3RyYWN0TW9kZWwucHJvdG90eXBlLl9jcmVhdGVDb2xsZWN0aW9uID0gZnVuY3Rpb24gKGdyb3VwLCBuYW1lKSB7XHJcbiAgICAgICAgaWYgKCFncm91cCkge1xyXG4gICAgICAgICAgICB0aGlzLm91dC5vdXRFcnJvcihcInRyaWVkIHRvIGNyZWF0ZSBjb2xsZWN0aW9uLCBidXQgc3VwcGxpZWQgZ3JvdXAgd2FzIGludmFsaWRcIik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChncm91cC5oYXNDb2xsZWN0aW9uKG5hbWUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwiQ29sbGVjdGlvbiBieSB0aGF0IG5hbWUgYWxyZWFkeSBleGlzdGVkIGluICdcIi5jb25jYXQoZ3JvdXAuZ2V0TmFtZSgpLCBcIidcIikpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBuZXcgR3JvYkNvbGxlY3Rpb25fMS5Hcm9iQ29sbGVjdGlvbihuYW1lLCBncm91cCk7XHJcbiAgICAgICAgZ3JvdXAuYWRkQ29sbGVjdGlvbihjb2xsZWN0aW9uKTtcclxuICAgICAgICByZXR1cm4gY29sbGVjdGlvbjtcclxuICAgIH07XHJcbiAgICBUVFJQR1N5c3RlbUdyYXBoQWJzdHJhY3RNb2RlbC5wcm90b3R5cGUuX0FkZE5vZGUgPSBmdW5jdGlvbiAoY29sbGVjdGlvbiwgbm9kZSkge1xyXG4gICAgICAgIGlmICghY29sbGVjdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLm91dC5vdXRFcnJvcihcInRyaWVkIHRvIGFkZCBub2RlLCBidXQgc3VwcGxpZWQgY29sbGVjdGlvbiB3YXMgaW52YWxpZFwiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uYWRkTm9kZShub2RlKTtcclxuICAgIH07XHJcbiAgICBUVFJQR1N5c3RlbUdyYXBoQWJzdHJhY3RNb2RlbC5wcm90b3R5cGUuX2RlbGV0ZU5vZGUgPSBmdW5jdGlvbiAobm9kZSkge1xyXG4gICAgICAgIHZhciBjb2wgPSBub2RlLnBhcmVudDtcclxuICAgICAgICB2YXIgciA9IGNvbC5yZW1vdmVOb2RlKG5vZGUpO1xyXG4gICAgICAgIG5vZGUuZGlzcG9zZSgpO1xyXG4gICAgICAgIHJldHVybiByO1xyXG4gICAgfTtcclxuICAgIFRUUlBHU3lzdGVtR3JhcGhBYnN0cmFjdE1vZGVsLnByb3RvdHlwZS5fYWRkTm9kZURlcGVuZGVuY3kgPSBmdW5jdGlvbiAobm9kZSwgZGVwKSB7XHJcbiAgICAgICAgdmFyIG8xID0gbm9kZS5hZGREZXBlbmRlbmN5KGRlcCk7XHJcbiAgICAgICAgdmFyIG8yID0gZGVwLmFkZERlcGVuZGVudChub2RlKTtcclxuICAgICAgICBpZiAoIShvMSAmJiBvMikpIHtcclxuICAgICAgICAgICAgaWYgKCFvMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJDb3VsZCBub3QgYWRkIGRlcGVuZGVuY3kgXCIuY29uY2F0KGRlcC5nZXROYW1lKCksIFwiLCBvbiBub2RlIFwiKS5jb25jYXQobm9kZS5nZXROYW1lKCkpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIW8yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm91dC5vdXRFcnJvcihcIkNvdWxkIG5vdCBhZGQgZGVwZW5kZW50IFwiLmNvbmNhdChub2RlLmdldE5hbWUoKSwgXCIsIG9uIG5vZGUgXCIpLmNvbmNhdChkZXAuZ2V0TmFtZSgpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH07XHJcbiAgICBUVFJQR1N5c3RlbUdyYXBoQWJzdHJhY3RNb2RlbC5wcm90b3R5cGUuX3JlbW92ZU5vZGVEZXBlbmRlbmN5ID0gZnVuY3Rpb24gKG5vZGUsIGRlcCkge1xyXG4gICAgICAgIHZhciBvMSA9IG5vZGUucmVtb3ZlRGVwZW5kZW5jeShkZXApO1xyXG4gICAgICAgIHZhciBvMiA9IGRlcC5yZW1vdmVEZXBlbmRlbnQobm9kZSk7XHJcbiAgICAgICAgaWYgKCEobzEgJiYgbzIpKSB7XHJcbiAgICAgICAgICAgIGlmICghbzEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwiQ291bGQgbm90IHJlbW92ZSBkZXBlbmRlbmN5IFwiLmNvbmNhdChkZXAuZ2V0TmFtZSgpLCBcIiwgb24gbm9kZSBcIikuY29uY2F0KG5vZGUuZ2V0TmFtZSgpKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCFvMikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJDb3VsZCBub3QgcmVtb3ZlIGRlcGVuZGVudCBcIi5jb25jYXQobm9kZS5nZXROYW1lKCksIFwiLCBvbiBub2RlIFwiKS5jb25jYXQoZGVwLmdldE5hbWUoKSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9O1xyXG4gICAgcmV0dXJuIFRUUlBHU3lzdGVtR3JhcGhBYnN0cmFjdE1vZGVsO1xyXG59KCkpO1xyXG5leHBvcnRzLlRUUlBHU3lzdGVtR3JhcGhBYnN0cmFjdE1vZGVsID0gVFRSUEdTeXN0ZW1HcmFwaEFic3RyYWN0TW9kZWw7XHJcbiIsIlwidXNlIHN0cmljdFwiO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XHJcbmV4cG9ydHMuVFRSUEdTeXN0ZW1HcmFwaE1vZGVsID0gdm9pZCAwO1xyXG52YXIgdHNsaWJfMSA9IHJlcXVpcmUoXCJ0c2xpYlwiKTtcclxudmFyIElPdXRwdXRIYW5kbGVyXzEgPSByZXF1aXJlKFwiLi4vQWJzdHJhY3Rpb25zL0lPdXRwdXRIYW5kbGVyXCIpO1xyXG52YXIgR3JvYk5vZHRlXzEgPSByZXF1aXJlKFwiLi4vR3JvYk5vZHRlXCIpO1xyXG52YXIgVFRSUEdTeXN0ZW1HcmFwaEFic3RyYWN0TW9kZWxfMSA9IHJlcXVpcmUoXCIuL1RUUlBHU3lzdGVtR3JhcGhBYnN0cmFjdE1vZGVsXCIpO1xyXG52YXIgZGVyaXZlZCA9ICdkZXJpdmVkJztcclxudmFyIGZpeGVkID0gJ2ZpeGVkJztcclxuLyoqXHJcbiAqICBoYW5kbGVzIE1vZGVsIG9wZXJhdGlvbnMgYW5kIERhdGEgQ29udGFpbm1lbnQsXHJcbiAqIEVuc3VyZXMgdGhhdCBkYXRhIGlzIG1haW50YWluZWQsIGFzIHdlbGwgYXMgZ3JhcGhsaW5rc1xyXG4qL1xyXG52YXIgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xyXG4gICAgdHNsaWJfMS5fX2V4dGVuZHMoVFRSUEdTeXN0ZW1HcmFwaE1vZGVsLCBfc3VwZXIpO1xyXG4gICAgZnVuY3Rpb24gVFRSUEdTeXN0ZW1HcmFwaE1vZGVsKCkge1xyXG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XHJcbiAgICAgICAgX3RoaXMuc2V0T3V0KCgwLCBJT3V0cHV0SGFuZGxlcl8xLm5ld091dHB1dEhhbmRsZXIpKCkpO1xyXG4gICAgICAgIHJldHVybiBfdGhpcztcclxuICAgIH1cclxuICAgIC8vVE9ETyA6IGZpbmQgYmV0dGVyIHNvbHV0aW9uIHRoYW4gdGhpcy5cclxuICAgIC8vIHIgXHJcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmluaXRBc05ldyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl9jcmVhdGVHcm91cCgnZml4ZWQnKTtcclxuICAgICAgICB0aGlzLl9jcmVhdGVHcm91cCgnZGVyaXZlZCcpO1xyXG4gICAgfTtcclxuICAgIC8vLyBDcmVhdGUgU3RhdGVtZW50cyBcclxuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuY3JlYXRlQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIChncm91cCwgbmFtZSkge1xyXG4gICAgICAgIC8vIGVuc3VyZSB0aGF0IGdyb3VwIGV4aXN0cywgc2FtZSB3YXkgYXMgdGhlIG90aGVyc1xyXG4gICAgICAgIGlmICghdGhpcy5faGFzR3JvdXAoZ3JvdXApKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwiTm8gZ3JvdXAgZXhpc3RlZCBieSBuYW1lIFwiLmNvbmNhdChncm91cCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZ3JwID0gdGhpcy5fZ2V0R3JvdXAoZ3JvdXApO1xyXG4gICAgICAgIGlmICghZ3JwKVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY3JlYXRlQ29sbGVjdGlvbihncnAsIG5hbWUpO1xyXG4gICAgfTtcclxuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuY3JlYXRlRGVyaXZlZENvbGxlY3Rpb24gPSBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUNvbGxlY3Rpb24oZGVyaXZlZCwgbmFtZSk7XHJcbiAgICB9O1xyXG4gICAgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsLnByb3RvdHlwZS5jcmVhdGVGaXhlZENvbGxlY3Rpb24gPSBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUNvbGxlY3Rpb24oZml4ZWQsIG5hbWUpO1xyXG4gICAgfTtcclxuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuY3JlYXRlTm9kZSA9IGZ1bmN0aW9uIChncm91cCwgY29sLCBuYW1lKSB7XHJcbiAgICAgICAgLy8gZW5zdXJlIHRoYXQgZ3JvdXAgZXhpc3RzLCBzYW1lIHdheSBhcyB0aGUgb3RoZXJzXHJcbiAgICAgICAgaWYgKCF0aGlzLl9oYXNHcm91cChncm91cCkpIHtcclxuICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJObyBncm91cCBleGlzdGVkIGJ5IG5hbWUgXCIuY29uY2F0KGdyb3VwKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5oYXNOb2RlKGdyb3VwLCBjb2wsIG5hbWUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwiTm9kZSBieSB0aGlzIG5hbWUgYWxyZWFkeSBleGlzdGVkIFwiLmNvbmNhdChncm91cCkpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGdyb3VwID09ICdmaXhlZCcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlRml4ZWROb2RlKGNvbCwgbmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGdyb3VwID09ICdkZXJpdmVkJykge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVEZXJpdmVkTm9kZShjb2wsIG5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH07XHJcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmNyZWF0ZURlcml2ZWROb2RlID0gZnVuY3Rpb24gKGNvbCwgbmFtZSkge1xyXG4gICAgICAgIHZhciBjb2xOYW1lID0gY29sO1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29sID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHZhciBncnAgPSB0aGlzLl9nZXRHcm91cChkZXJpdmVkKTtcclxuICAgICAgICAgICAgaWYgKCFncnApXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgY29sID0gZ3JwLmdldENvbGxlY3Rpb24oY29sKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbE5hbWUgPSBjb2wuZ2V0TmFtZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWNvbCkge1xyXG4gICAgICAgICAgICB0aGlzLm91dC5vdXRFcnJvcihcIk5vIERlcml2ZWQgY29sbGVjdGlvbiBmb3VuZCBieSBuYW1lOiBcIi5jb25jYXQoY29sTmFtZSwgXCIgXCIpKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBub2RlID0gbmV3IEdyb2JOb2R0ZV8xLkdyb2JEZXJpdmVkTm9kZShuYW1lLCBjb2wpO1xyXG4gICAgICAgIGNvbC5hZGROb2RlKG5vZGUpO1xyXG4gICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgfTtcclxuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuY3JlYXRlRml4ZWROb2RlID0gZnVuY3Rpb24gKGNvbCwgbmFtZSkge1xyXG4gICAgICAgIHZhciBncnAgPSB0aGlzLl9nZXRHcm91cChmaXhlZCk7XHJcbiAgICAgICAgaWYgKCFncnApXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIHZhciBjb2xOYW1lID0gY29sO1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29sICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgICAgIGNvbE5hbWUgPSBjb2wuZ2V0TmFtZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29sID0gZ3JwLmdldENvbGxlY3Rpb24oY29sTmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghY29sKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwiTm8gRml4ZWQgY29sbGVjdGlvbiBmb3VuZCBieSBuYW1lOiBcIi5jb25jYXQoY29sTmFtZSwgXCIgXCIpKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBub2RlID0gbmV3IEdyb2JOb2R0ZV8xLkdyb2JGaXhlZE5vZGUobmFtZSwgY29sKTtcclxuICAgICAgICBjb2wuYWRkTm9kZShub2RlKTtcclxuICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgIH07XHJcbiAgICAvLyBoYXMgU3RhdGVtZW50cyBcclxuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuaGFzQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIChncm91cCwgbmFtZSkge1xyXG4gICAgICAgIHZhciBncnAgPSB0aGlzLl9nZXRHcm91cChncm91cCk7XHJcbiAgICAgICAgaWYgKCFncnApIHtcclxuICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJObyBncm91cCBleGlzdGVkIGJ5IG5hbWUgXCIuY29uY2F0KGdyb3VwKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGdycC5oYXNDb2xsZWN0aW9uKG5hbWUpO1xyXG4gICAgfTtcclxuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuaGFzRGVyaXZlZENvbGxlY3Rpb24gPSBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmhhc0NvbGxlY3Rpb24oZGVyaXZlZCwgbmFtZSk7XHJcbiAgICB9O1xyXG4gICAgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsLnByb3RvdHlwZS5oYXNGaXhlZENvbGxlY3Rpb24gPSBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmhhc0NvbGxlY3Rpb24oZml4ZWQsIG5hbWUpO1xyXG4gICAgfTtcclxuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuaGFzTm9kZSA9IGZ1bmN0aW9uIChncm91cCwgY29sLCBuYW1lKSB7XHJcbiAgICAgICAgdmFyIGdycCA9IHRoaXMuX2dldEdyb3VwKGdyb3VwKTtcclxuICAgICAgICBpZiAoIWdycCkge1xyXG4gICAgICAgICAgICB0aGlzLm91dC5vdXRFcnJvcihcIk5vIGdyb3VwIGV4aXN0ZWQgYnkgbmFtZSBcIi5jb25jYXQoZ3JvdXApKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgX2NvbCA9IGNvbDtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICBfY29sID0gdGhpcy5nZXRDb2xsZWN0aW9uKGdycCwgY29sKTtcclxuICAgICAgICAgICAgaWYgKCFfY29sKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm91dC5vdXRFcnJvcihcImF0dGVtcHRlZCB0byBnZXQgXCIuY29uY2F0KGdyb3VwLCBcIiBjb2xsZWN0aW9uIFwiKS5jb25jYXQobmFtZSwgXCIsIGJ1dCBubyBjb2xsZWN0aW9uIGV4aXN0ZWQgYnkgdGhhdCBuYW1lXCIpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gX2NvbC5oYXNOb2RlKG5hbWUpO1xyXG4gICAgfTtcclxuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuaGFzRGVyaXZlZE5vZGUgPSBmdW5jdGlvbiAoY29sLCBuYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzTm9kZShkZXJpdmVkLCBjb2wsIG5hbWUpO1xyXG4gICAgfTtcclxuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuaGFzRml4ZWROb2RlID0gZnVuY3Rpb24gKGNvbCwgbmFtZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmhhc05vZGUoZml4ZWQsIGNvbCwgbmFtZSk7XHJcbiAgICB9O1xyXG4gICAgLy8gZ2V0IFN0YXRlbWVudHMgXHJcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmdldENvbGxlY3Rpb25OYW1lcyA9IGZ1bmN0aW9uIChncm91cCkge1xyXG4gICAgICAgIHZhciBncnA7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBncm91cCA9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBncnAgPSB0aGlzLl9nZXRHcm91cChncm91cCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBncnAgPSBncm91cDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFncnApIHtcclxuICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJObyBncm91cCBleGlzdGVkIGJ5IG5hbWUgXCIuY29uY2F0KGdyb3VwKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGdycC5nZXRDb2xsZWN0aW9uc05hbWVzKCk7XHJcbiAgICB9O1xyXG4gICAgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsLnByb3RvdHlwZS5nZXRDb2xsZWN0aW9uID0gZnVuY3Rpb24gKGdyb3VwLCBuYW1lKSB7XHJcbiAgICAgICAgdmFyIGdycDtcclxuICAgICAgICBpZiAodHlwZW9mIGdyb3VwID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGdycCA9IHRoaXMuX2dldEdyb3VwKGdyb3VwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGdycCA9IGdyb3VwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWdycCkge1xyXG4gICAgICAgICAgICB0aGlzLm91dC5vdXRFcnJvcihcIk5vIGdyb3VwIGV4aXN0ZWQgYnkgbmFtZSBcIi5jb25jYXQoZ3JvdXApKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBjb2wgPSBncnAuZ2V0Q29sbGVjdGlvbihuYW1lKTtcclxuICAgICAgICBpZiAoIWNvbCkge1xyXG4gICAgICAgICAgICB0aGlzLm91dC5vdXRFcnJvcihcImF0dGVtcHRlZCB0byBnZXQgXCIuY29uY2F0KGdyb3VwLCBcIiBjb2xsZWN0aW9uIFwiKS5jb25jYXQobmFtZSwgXCIsIGJ1dCBubyBjb2xsZWN0aW9uIGV4aXN0ZWQgYnkgdGhhdCBuYW1lXCIpKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjb2w7XHJcbiAgICB9O1xyXG4gICAgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsLnByb3RvdHlwZS5nZXREZXJpdmVkQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29sbGVjdGlvbihkZXJpdmVkLCBuYW1lKTtcclxuICAgIH07XHJcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmdldEZpeGVkQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29sbGVjdGlvbihmaXhlZCwgbmFtZSk7XHJcbiAgICB9O1xyXG4gICAgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsLnByb3RvdHlwZS5nZXROb2RlID0gZnVuY3Rpb24gKGdyb3VwLCBjb2wsIG5hbWUpIHtcclxuICAgICAgICB2YXIgZ3JwID0gdGhpcy5fZ2V0R3JvdXAoZ3JvdXApO1xyXG4gICAgICAgIGlmICghZ3JwKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwiTm8gZ3JvdXAgZXhpc3RlZCBieSBuYW1lIFwiLmNvbmNhdChncm91cCkpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZGVmaW5lIG91dHB1dFxyXG4gICAgICAgIHZhciBub2RlO1xyXG4gICAgICAgIC8vIGlmIHRoaXMgaXMgYSBjb2xsZWN0aW9uLCBqdXN0IGdldCB0aGUgbm9kZS5cclxuICAgICAgICBpZiAodHlwZW9mIGNvbCAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgbm9kZSA9IGNvbC5nZXROb2RlKG5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBpZiBjb2wgaXMgYSBzdHJpbmcsIHRoZW4gbGV0IGl0IGJlIHNlZW4gYXMgdGhlIG5hbWUgb2YgdGhlIGNvbGxlY3Rpb24sIGFuZCBmZXRjaCBpdC5cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gZ2V0IGRhdGFcclxuICAgICAgICAgICAgdmFyIGNvbE5hbWUgPSBjb2w7XHJcbiAgICAgICAgICAgIGNvbCA9IGdycC5nZXRDb2xsZWN0aW9uKGNvbCk7XHJcbiAgICAgICAgICAgIC8vIGVycm9yIGhhbmRsaW5nLlxyXG4gICAgICAgICAgICBpZiAoIWNvbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJhdHRlbXB0ZWQgdG8gZ2V0IFwiLmNvbmNhdChncm91cCwgXCIgY29sbGVjdGlvbiBcIikuY29uY2F0KGNvbE5hbWUsIFwiLCBidXQgZGlkIG5vdCBleGlzdFwiKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBkZWZpbmVkIG91dHB1dFxyXG4gICAgICAgICAgICBub2RlID0gY29sLmdldE5vZGUobmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGVycm9yIGhhbmRsaW5nXHJcbiAgICAgICAgaWYgKCFub2RlKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwiYXR0ZW1wdGVkIHRvIGdldCBcIi5jb25jYXQoZ3JvdXAsIFwiLlwiKS5jb25jYXQoY29sLmdldE5hbWUoKSwgXCIgTm9kZSBcIikuY29uY2F0KG5hbWUsIFwiLCBidXQgZGlkIG5vdCBleGlzdFwiKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbm9kZTtcclxuICAgIH07XHJcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmdldERlcml2ZWROb2RlID0gZnVuY3Rpb24gKGNvbCwgbmFtZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldE5vZGUoZGVyaXZlZCwgY29sLCBuYW1lKTtcclxuICAgIH07XHJcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmdldEZpeGVkTm9kZSA9IGZ1bmN0aW9uIChjb2wsIG5hbWUpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXROb2RlKGZpeGVkLCBjb2wsIG5hbWUpO1xyXG4gICAgfTtcclxuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuZ2V0Tm9kZU5hbWVzID0gZnVuY3Rpb24gKGdyb3VwLCBjb2wpIHtcclxuICAgICAgICB2YXIgZ3JwID0gdGhpcy5fZ2V0R3JvdXAoZ3JvdXApO1xyXG4gICAgICAgIGlmICghZ3JwKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwiTm8gZ3JvdXAgZXhpc3RlZCBieSBuYW1lIFwiLmNvbmNhdChncm91cCkpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIF9jb2w7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBjb2wgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIF9jb2wgPSBncnAuZ2V0Q29sbGVjdGlvbihjb2wpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgX2NvbCA9IGNvbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIF9jb2wuZ2V0Tm9kZU5hbWVzKCk7XHJcbiAgICB9O1xyXG4gICAgLy8gZGVsZXRlIFN0YXRlbWVudHMgXHJcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLl9kZWxldGVHcm91cCA9IGZ1bmN0aW9uIChncm91cCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgZ3JvdXAgPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdmFyIG5hbWUgPSBncm91cDtcclxuICAgICAgICAgICAgZ3JvdXAgPSB0aGlzLl9nZXRHcm91cChncm91cCk7XHJcbiAgICAgICAgICAgIGlmICghZ3JvdXApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKCdObyBDb2xsZWN0aW9uIGJ5IG5hbWUgJyArIG5hbWUpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIF9zdXBlci5wcm90b3R5cGUuX2RlbGV0ZUdyb3VwLmNhbGwodGhpcywgZ3JvdXApO1xyXG4gICAgfTtcclxuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuZGVsZXRlQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIChncm91cCwgY29sKSB7XHJcbiAgICAgICAgdmFyIGdycCA9IHRoaXMuX2dldEdyb3VwKGdyb3VwKTtcclxuICAgICAgICBpZiAoIWdycCkge1xyXG4gICAgICAgICAgICB0aGlzLm91dC5vdXRFcnJvcihcIk5vIGdyb3VwIGV4aXN0ZWQgYnkgbmFtZSBcIi5jb25jYXQoZ3JvdXApKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIGNvbCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgY29sID1cclxuICAgICAgICAgICAgICAgIGNvbCA9IGdycC5nZXRDb2xsZWN0aW9uKGNvbCk7XHJcbiAgICAgICAgICAgIGlmICghY29sKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5fZGVsZXRlQ29sbGVjdGlvbihjb2wpO1xyXG4gICAgfTtcclxuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuZGVsZXRlRGVyaXZlZENvbGxlY3Rpb24gPSBmdW5jdGlvbiAoY29sKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVsZXRlQ29sbGVjdGlvbihkZXJpdmVkLCBjb2wpO1xyXG4gICAgfTtcclxuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuZGVsZXRlRml4ZWRDb2xsZWN0aW9uID0gZnVuY3Rpb24gKGNvbCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRlbGV0ZUNvbGxlY3Rpb24oZml4ZWQsIGNvbCk7XHJcbiAgICB9O1xyXG4gICAgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsLnByb3RvdHlwZS5kZWxldGVOb2RlID0gZnVuY3Rpb24gKGdyb3VwLCBjb2wsIG5hbWUpIHtcclxuICAgICAgICB2YXIgZ3JwID0gdGhpcy5fZ2V0R3JvdXAoZ3JvdXApO1xyXG4gICAgICAgIGlmICghZ3JwKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwiTm8gZ3JvdXAgZXhpc3RlZCBieSBuYW1lIFwiLmNvbmNhdChncm91cCkpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgY29sID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBjb2wgPSBncnAuZ2V0Q29sbGVjdGlvbihjb2wpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIWNvbCkge1xyXG4gICAgICAgICAgICB0aGlzLm91dC5vdXRFcnJvcihcImF0dGVtcHRlZCB0byBnZXQgXCIuY29uY2F0KGdyb3VwLCBcIiBjb2xsZWN0aW9uIFwiKS5jb25jYXQobmFtZSwgXCIsIGJ1dCBubyBjb2xsZWN0aW9uIGV4aXN0ZWQgYnkgdGhhdCBuYW1lXCIpKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbm9kZSA9IGNvbC5nZXROb2RlKG5hbWUpO1xyXG4gICAgICAgIHJldHVybiBjb2wucmVtb3ZlTm9kZShub2RlKTtcclxuICAgIH07XHJcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmRlbGV0ZURlcml2ZWROb2RlID0gZnVuY3Rpb24gKGNvbCwgbmFtZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRlbGV0ZU5vZGUoZGVyaXZlZCwgY29sLCBuYW1lKTtcclxuICAgIH07XHJcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmRlbGV0ZUZpeGVkTm9kZSA9IGZ1bmN0aW9uIChjb2wsIG5hbWUpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kZWxldGVOb2RlKGZpeGVkLCBjb2wsIG5hbWUpO1xyXG4gICAgfTtcclxuICAgIC8vIFJlbmFtaW5nIGZ1bmN0aW9uc1xyXG4gICAgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsLnByb3RvdHlwZS5yZW5hbWVDb2xsZWN0aW9uID0gZnVuY3Rpb24gKGdyb3VwLCBjb2wsIG5ld05hbWUpIHtcclxuICAgICAgICAvLyBjaGVjayB0aGF0IGdyb3VwIGV4aXN0cywgYW5kIGdldCB0aGUgdmFsdWVzLiBcclxuICAgICAgICB2YXIgZ3JwO1xyXG4gICAgICAgIHZhciBncnBOYW1lO1xyXG4gICAgICAgIGlmICh0eXBlb2YgZ3JvdXAgPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgZ3JwTmFtZSA9IGdyb3VwO1xyXG4gICAgICAgICAgICBncnAgPSB0aGlzLl9nZXRHcm91cChncm91cCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBncnBOYW1lID0gZ3JvdXAuZ2V0TmFtZSgpO1xyXG4gICAgICAgICAgICBncnAgPSBncm91cDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFncnApIHtcclxuICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJObyBncm91cCBleGlzdGVkIGJ5IG5hbWUgXCIuY29uY2F0KGdycE5hbWUpKTtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIENoZWNrIHRoYXQgQ29sbGVjdGlvbiBleGlzdHMgYW5kIGdldCB0aGUgdmFsdWVzIFxyXG4gICAgICAgIHZhciBjb2xOYW1lID0gY29sO1xyXG4gICAgICAgIGlmICh0eXBlb2YgY29sID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGNvbE5hbWUgPSBjb2w7XHJcbiAgICAgICAgICAgIGNvbCA9IGdycC5nZXRDb2xsZWN0aW9uKGNvbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb2xOYW1lID0gY29sLmdldE5hbWUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFjb2wpIHtcclxuICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJObyBDb2xsZWN0aW9uIGV4aXN0ZWQgYnkgbmFtZSBcIi5jb25jYXQoY29sTmFtZSwgXCIgaW4gXCIpLmNvbmNhdChncnBOYW1lKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB1cGRhdGUgXHJcbiAgICAgICAgcmV0dXJuIGdycC51cGRhdGVfY29sbGVjdGlvbl9uYW1lKGNvbE5hbWUsIG5ld05hbWUpO1xyXG4gICAgfTtcclxuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUucmVuYW1lSXRlbSA9IGZ1bmN0aW9uIChncm91cCwgY29sLCBvbGROYW1lLCBuZXdOYW1lKSB7XHJcbiAgICAgICAgLy8gY2hlY2sgdGhhdCBncm91cCBleGlzdHMsIGFuZCBnZXQgdGhlIHZhbHVlcy4gXHJcbiAgICAgICAgdmFyIGdycDtcclxuICAgICAgICB2YXIgZ3JwTmFtZTtcclxuICAgICAgICBpZiAodHlwZW9mIGdyb3VwID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGdycE5hbWUgPSBncm91cDtcclxuICAgICAgICAgICAgZ3JwID0gdGhpcy5fZ2V0R3JvdXAoZ3JvdXApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZ3JwTmFtZSA9IGdyb3VwLmdldE5hbWUoKTtcclxuICAgICAgICAgICAgZ3JwID0gZ3JvdXA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghZ3JwKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwiTm8gZ3JvdXAgZXhpc3RlZCBieSBuYW1lIFwiLmNvbmNhdChncnBOYW1lKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBDaGVjayB0aGF0IENvbGxlY3Rpb24gZXhpc3RzIGFuZCBnZXQgdGhlIHZhbHVlcyBcclxuICAgICAgICB2YXIgY29sTmFtZSA9IGNvbDtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbCA9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICBjb2xOYW1lID0gY29sO1xyXG4gICAgICAgICAgICBjb2wgPSBncnAuZ2V0Q29sbGVjdGlvbihjb2wpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgY29sTmFtZSA9IGNvbC5nZXROYW1lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghY29sKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwiTm8gQ29sbGVjdGlvbiBleGlzdGVkIGJ5IG5hbWUgXCIuY29uY2F0KGNvbE5hbWUsIFwiIGluIFwiKS5jb25jYXQoZ3JwTmFtZSkpO1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gY2hlY2sgdGhhdCB0aGUgTm9kZSBleGlzdHNcclxuICAgICAgICBpZiAoIWNvbC5oYXNOb2RlKG9sZE5hbWUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwiTm8gSXRlbSBleGlzdGVkIGJ5IG5hbWUgXCIuY29uY2F0KG9sZE5hbWUsIFwiIGluIFwiKS5jb25jYXQoZ3JwTmFtZSwgXCIuXCIpLmNvbmNhdChjb2xOYW1lKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB1cGRhdGUgXHJcbiAgICAgICAgcmV0dXJuIGNvbC51cGRhdGVfbm9kZV9uYW1lKG9sZE5hbWUsIG5ld05hbWUpO1xyXG4gICAgfTtcclxuICAgIC8vIFZhbGlkYXRpb24gRnVuY3Rpb25zXHJcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmlzVmFsaWQgPSBmdW5jdGlvbiAoZXJyb3JNZXNzYWdlcykge1xyXG4gICAgICAgIGlmIChlcnJvck1lc3NhZ2VzID09PSB2b2lkIDApIHsgZXJyb3JNZXNzYWdlcyA9IFtdOyB9XHJcbiAgICAgICAgdmFyIGtleV9ncm91cCwga2V5X2NvbGxlY3Rpb24sIGtleV9ub2RlO1xyXG4gICAgICAgIHZhciBjb2xsZWN0aW9uTmFtZXMsIG5vZGVOYW1lcztcclxuICAgICAgICB2YXIgZ3JvdXAsIGNvbGxlY3Rpb24sIG5vZGU7XHJcbiAgICAgICAgdmFyIGlzVmFsaWQ7XHJcbiAgICAgICAgLy8gZm9yZWFjaCBncm91cCwgZ2V0IGRvIHRoaXMgZm9yIGFsbCBjb2xsZWN0aW9ucy5cclxuICAgICAgICBmb3IgKGtleV9ncm91cCBpbiB0aGlzLmRhdGEpIHtcclxuICAgICAgICAgICAgZ3JvdXAgPSB0aGlzLmRhdGFba2V5X2dyb3VwXTtcclxuICAgICAgICAgICAgY29sbGVjdGlvbk5hbWVzID0gZ3JvdXAuZ2V0Q29sbGVjdGlvbnNOYW1lcygpO1xyXG4gICAgICAgICAgICAvLyBmb3JhY2ggY29sbGVjdGlvbiBkbyB0aGlzIGZvciBhbGwgbm9kZXMgXHJcbiAgICAgICAgICAgIGZvciAodmFyIGNvbEluZGV4IGluIGdyb3VwLmdldENvbGxlY3Rpb25zTmFtZXMoKSkge1xyXG4gICAgICAgICAgICAgICAga2V5X2NvbGxlY3Rpb24gPSBjb2xsZWN0aW9uTmFtZXNbY29sSW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbiA9IGdyb3VwLmdldENvbGxlY3Rpb24oa2V5X2NvbGxlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgbm9kZU5hbWVzID0gY29sbGVjdGlvbi5nZXROb2RlTmFtZXMoKTtcclxuICAgICAgICAgICAgICAgIC8vIGRvIHRoaXMgZm9yIGVhY2ggbm9kZS4gXHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBub2RlSW5kZXggaW4gbm9kZU5hbWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5X25vZGUgPSBub2RlTmFtZXNbbm9kZUluZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICBub2RlID0gY29sbGVjdGlvbi5nZXROb2RlKGtleV9ub2RlKTtcclxuICAgICAgICAgICAgICAgICAgICBpc1ZhbGlkID0gbm9kZS5pc1ZhbGlkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtc2cgPSBcIlwiLmNvbmNhdChrZXlfZ3JvdXAsIFwiLlwiKS5jb25jYXQoa2V5X2NvbGxlY3Rpb24sIFwiLlwiKS5jb25jYXQoa2V5X25vZGUsIFwiIHdhcyBpbnZhbGlkXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2V5cyA9IFtrZXlfZ3JvdXAsIGtleV9jb2xsZWN0aW9uLCBrZXlfbm9kZV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZXMucHVzaCh7IG1zZzogbXNnLCBrZXk6IGtleXMgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBlcnJvck1lc3NhZ2VzLmxlbmd0aCA9PSAwO1xyXG4gICAgfTtcclxuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuX2dldEdyb3VwID0gZnVuY3Rpb24gKG5hbWUpIHtcclxuICAgICAgICB2YXIgZ3JwID0gdGhpcy5kYXRhW25hbWVdO1xyXG4gICAgICAgIHJldHVybiBncnAgIT09IG51bGwgJiYgZ3JwICE9PSB2b2lkIDAgPyBncnAgOiBudWxsO1xyXG4gICAgfTtcclxuICAgIC8vIGFkZCBkZXBlbmRlbmN5XHJcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmFkZE5vZGVEZXBlbmRlbmN5ID0gZnVuY3Rpb24gKG5vZGUsIGRlcCkge1xyXG4gICAgICAgIHRoaXMuX2FkZE5vZGVEZXBlbmRlbmN5KG5vZGUsIGRlcCk7XHJcbiAgICB9O1xyXG4gICAgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsLnByb3RvdHlwZS5yZW1vdmVOb2RlRGVwZW5kZW5jeSA9IGZ1bmN0aW9uIChub2RlLCBkZXApIHtcclxuICAgICAgICB0aGlzLl9yZW1vdmVOb2RlRGVwZW5kZW5jeShub2RlLCBkZXApO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBUVFJQR1N5c3RlbUdyYXBoTW9kZWw7XHJcbn0oVFRSUEdTeXN0ZW1HcmFwaEFic3RyYWN0TW9kZWxfMS5UVFJQR1N5c3RlbUdyYXBoQWJzdHJhY3RNb2RlbCkpO1xyXG5leHBvcnRzLlRUUlBHU3lzdGVtR3JhcGhNb2RlbCA9IFRUUlBHU3lzdGVtR3JhcGhNb2RlbDtcclxuIiwiXCJ1c2Ugc3RyaWN0XCI7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcclxuZXhwb3J0cy51dWlkdjQgPSBleHBvcnRzLlRUUlBHU3lzdGVtID0gZXhwb3J0cy5Hcm9iR3JvdXAgPSBleHBvcnRzLkdyb2JDb2xsZWN0aW9uID0gZXhwb3J0cy5Hcm9iRGVyaXZlZE5vZGUgPSBleHBvcnRzLkdyb2JEZXJpdmVkT3JpZ2luID0gZXhwb3J0cy5Hcm9iRml4ZWROb2RlID0gZXhwb3J0cy5rZXlNYW5hZ2VySW5zdGFuY2UgPSB2b2lkIDA7XHJcbnZhciBLZXlNYW5hZ2VyXzEgPSByZXF1aXJlKFwiLi9BYnN0cmFjdGlvbnMvS2V5TWFuYWdlclwiKTtcclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwia2V5TWFuYWdlckluc3RhbmNlXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBLZXlNYW5hZ2VyXzEua2V5TWFuYWdlckluc3RhbmNlOyB9IH0pO1xyXG52YXIgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsXzEgPSByZXF1aXJlKFwiLi9HcmFwaC9UVFJQR1N5c3RlbUdyYXBoTW9kZWxcIik7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIlRUUlBHU3lzdGVtXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBUVFJQR1N5c3RlbUdyYXBoTW9kZWxfMS5UVFJQR1N5c3RlbUdyYXBoTW9kZWw7IH0gfSk7XHJcbnZhciBHcm9iQ29sbGVjdGlvbl8xID0gcmVxdWlyZShcIi4vR3JvYkNvbGxlY3Rpb25cIik7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIkdyb2JDb2xsZWN0aW9uXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBHcm9iQ29sbGVjdGlvbl8xLkdyb2JDb2xsZWN0aW9uOyB9IH0pO1xyXG52YXIgR3JvYkdyb3VwXzEgPSByZXF1aXJlKFwiLi9Hcm9iR3JvdXBcIik7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIkdyb2JHcm91cFwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gR3JvYkdyb3VwXzEuR3JvYkdyb3VwOyB9IH0pO1xyXG52YXIgR3JvYk5vZHRlXzEgPSByZXF1aXJlKFwiLi9Hcm9iTm9kdGVcIik7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIkdyb2JEZXJpdmVkTm9kZVwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gR3JvYk5vZHRlXzEuR3JvYkRlcml2ZWROb2RlOyB9IH0pO1xyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJHcm9iRGVyaXZlZE9yaWdpblwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gR3JvYk5vZHRlXzEuR3JvYkRlcml2ZWRPcmlnaW47IH0gfSk7XHJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIkdyb2JGaXhlZE5vZGVcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIEdyb2JOb2R0ZV8xLkdyb2JGaXhlZE5vZGU7IH0gfSk7XHJcbmZ1bmN0aW9uIHV1aWR2NCgpIHtcclxuICAgIHJldHVybiAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4J1xyXG4gICAgICAgIC5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uIChjKSB7XHJcbiAgICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpICogMTYgfCAwLCB2ID0gYyA9PSAneCcgPyByIDogKHIgJiAweDMgfCAweDgpO1xyXG4gICAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcclxuICAgIH0pO1xyXG59XHJcbmV4cG9ydHMudXVpZHY0ID0gdXVpZHY0O1xyXG4iLCIgXHJcbmltcG9ydCB7IEdyb2JDb2xsZWN0aW9uICwgR3JvYkdyb3VwICwgdHlwZSBHcm9iTm9kZVR5cGUgLCBHcm9iRGVyaXZlZE5vZGUsIEdyb2JEZXJpdmVkT3JpZ2luLCBHcm9iRml4ZWROb2RlLCBUVFJQR1N5c3RlbSAsIHV1aWR2NCB9IGZyb20gXCJ0dHJwZy1zeXN0ZW0tZ3JhcGhcIjtcclxuaW1wb3J0IHsgSnNvbk9iamVjdCwgSnNvbk1hcHBpbmdSZWNvcmRJbkFycmF5T3V0LCBKc29uQ2xhc3NUeXBlZCwgSnNvblN0cmluZywgSnNvbk51bWJlciwgSnNvbkFycmF5Q2xhc3NUeXBlZCB9IGZyb20gXCJncm9iYXgtanNvbi1oYW5kbGVyXCI7XHJcbmltcG9ydCB7IEJBU0VfU0NIRU1FIH0gZnJvbSBcImdyb2JheC1qc29uLWhhbmRsZXJcIjtcclxuIFxyXG5cclxuLy8gaWYgc29tZXRoaW5nIGlzIEFHcmFwaEl0ZW0gXHJcbi8qXHJcbkBKc29uU3RyaW5nKCkgXHJcbnB1YmxpYyBuYW1lIDtcclxuKi9cclxuLy8gb3JpZ2luc1xyXG5leHBvcnQgY2xhc3MgR3JvYkpEZXJpdmVkT3JpZ2luIGV4dGVuZHMgR3JvYkRlcml2ZWRPcmlnaW4geyBcclxuXHRASnNvblN0cmluZygpXHJcblx0cHVibGljIHN5bWJvbDogc3RyaW5nOyBcclxuXHRcclxuXHRASnNvblN0cmluZygpXHJcblx0cHVibGljIG9yaWdpbktleTogc3RyaW5nIDtcclxufVxyXG5cclxuIFxyXG4vLyBOT0RFUyAgXHJcbmV4cG9ydCBjbGFzcyBHcm9iSkRlcml2ZWROb2RlIGV4dGVuZHMgR3JvYkRlcml2ZWROb2RlIHtcclxuXHRASnNvblN0cmluZygpIFxyXG5cdHB1YmxpYyBuYW1lIDtcclxuXHJcblx0QEpzb25TdHJpbmcoe25hbWUgOiAnY2FsY3VsYXRpb25TdHJpbmcnfSlcclxuXHRwdWJsaWMgY2FsYzpzdHJpbmc7XHJcblxyXG5cdEBKc29uQXJyYXlDbGFzc1R5cGVkKEdyb2JKRGVyaXZlZE9yaWdpbix7bmFtZTonY2FsY09yaWdpbnMnfSlcclxuXHRwdWJsaWMgb3JpZ2lucyA6IEdyb2JKRGVyaXZlZE9yaWdpbltdO1xyXG59IFxyXG5leHBvcnQgY2xhc3MgR3JvYkpGaXhlZE5vZGUgZXh0ZW5kcyBHcm9iRml4ZWROb2RlIHtcclxuXHJcblx0QEpzb25TdHJpbmcoKSBcclxuXHRwdWJsaWMgbmFtZSA7XHJcblxyXG5cdEBKc29uTnVtYmVyKHtuYW1lIDogJ3N0YW5kYXJkVmFsdWUnfSlcclxuXHRwdWJsaWMgX19fdmFsdWU6bnVtYmVyXHJcbn1cclxuZXhwb3J0IHR5cGUgR3JvYkpOb2RlVHlwZSA9IEdyb2JKRGVyaXZlZE5vZGUgfCBHcm9iSkZpeGVkTm9kZTtcclxuXHJcbiBcclxuXHJcbi8vICBDT0xMRUNUSU9OUyBcclxuZXhwb3J0IGNsYXNzIEdyb2JDb2xsZWN0aW9uRGVyaXZlZCBleHRlbmRzIEdyb2JDb2xsZWN0aW9uPEdyb2JKRGVyaXZlZE5vZGU+eyBcclxuXHRASnNvblN0cmluZygpIFxyXG5cdHB1YmxpYyBuYW1lIDtcclxuXHRcclxuXHRASnNvbk1hcHBpbmdSZWNvcmRJbkFycmF5T3V0KHtLZXlQcm9wZXJ0eU5hbWU6J2dldE5hbWUnLCBuYW1lOidkYXRhJyx0eXBlOkdyb2JKRGVyaXZlZE5vZGUgfSlcclxuXHRub2Rlc19uYW1lczogUmVjb3JkPHN0cmluZywgR3JvYkpEZXJpdmVkTm9kZT4gPSB7fVxyXG59IFxyXG5leHBvcnQgY2xhc3MgR3JvYkNvbGxlY3Rpb25GaXhlZCBleHRlbmRzIEdyb2JDb2xsZWN0aW9uPEdyb2JKRml4ZWROb2RlPntcclxuXHJcblx0QEpzb25TdHJpbmcoKSBcclxuXHRwdWJsaWMgbmFtZSA7XHJcblxyXG5cdEBKc29uTWFwcGluZ1JlY29yZEluQXJyYXlPdXQoe0tleVByb3BlcnR5TmFtZTonZ2V0TmFtZScsIG5hbWU6J2RhdGEnLHR5cGU6R3JvYkpGaXhlZE5vZGUgIH0pXHJcblx0bm9kZXNfbmFtZXM6IFJlY29yZDxzdHJpbmcsIEdyb2JKRml4ZWROb2RlPiA9IHt9XHJcbn1cclxuXHJcblxyXG5cclxuXHJcblxyXG4vLyAgR1JPVVBTIFxyXG5leHBvcnQgY2xhc3MgR3JvYkdyb3VwRGVyaXZlZCBleHRlbmRzIEdyb2JHcm91cDxHcm9iRGVyaXZlZE5vZGU+e1xyXG5cdFxyXG5cdEBKc29uU3RyaW5nKCkgXHJcblx0cHVibGljIG5hbWUgO1xyXG5cclxuXHRASnNvbk1hcHBpbmdSZWNvcmRJbkFycmF5T3V0KHtLZXlQcm9wZXJ0eU5hbWU6J2dldE5hbWUnLCBuYW1lOidkYXRhJyx0eXBlIDpHcm9iQ29sbGVjdGlvbkRlcml2ZWQgIH0pXHJcblx0Y29sbGVjdGlvbnNfbmFtZXM6IFJlY29yZDxzdHJpbmcsIEdyb2JDb2xsZWN0aW9uRGVyaXZlZCA+ID0ge307XHJcblxyXG59IFxyXG5leHBvcnQgY2xhc3MgR3JvYkdyb3VwRml4ZWQgZXh0ZW5kcyBHcm9iR3JvdXA8R3JvYkZpeGVkTm9kZT57XHJcblx0XHJcblx0QEpzb25TdHJpbmcoKSBcclxuXHRwdWJsaWMgbmFtZSA7XHJcblxyXG5cdEBKc29uTWFwcGluZ1JlY29yZEluQXJyYXlPdXQoe0tleVByb3BlcnR5TmFtZTonZ2V0TmFtZScsIG5hbWU6J2RhdGEnLCB0eXBlIDpHcm9iQ29sbGVjdGlvbkZpeGVkICB9KVxyXG5cdGNvbGxlY3Rpb25zX25hbWVzOiBSZWNvcmQ8c3RyaW5nLEdyb2JDb2xsZWN0aW9uRml4ZWQ+ID0ge307XHJcblxyXG59XHJcblxyXG5cclxuXHJcblxyXG5cclxuIFxyXG5leHBvcnQgY2xhc3MgVFRSUEdfU0NIRU1FUyB7IFxyXG5cdHN0YXRpYyBQUkVWSUVXID0nbWluaSc7XHJcbn0gXHJcblxyXG4vKipcclxuICogIGhhbmRsZXMgTW9kZWwgb3BlcmF0aW9ucyBhbmQgRGF0YSBDb250YWlubWVudCwgXHJcbiAqIEVuc3VyZXMgdGhhdCBkYXRhIGlzIG1haW50YWluZWQsIGFzIHdlbGwgYXMgZ3JhcGhsaW5rc1xyXG4qL1xyXG5ASnNvbk9iamVjdCh7XHJcblx0b25CZWZvcmVTZXJpYWxpemF0aW9uOihzZWxmOlRUUlBHU3lzdGVtSlNPTkZvcm1hdHRpbmcpID0+IHt9LFxyXG5cdG9uQWZ0ZXJEZVNlcmlhbGl6YXRpb246KHNlbGY6VFRSUEdTeXN0ZW1KU09ORm9ybWF0dGluZywgLi4uYXJncyApID0+IHtcclxuXHRcdFxyXG5cdFx0Ly8gYWRkIGRlcml2ZWQgYW5kIGZpeGVkIHRvIGdyb3VwcyBcclxuXHRcdGlmICggIXNlbGYuZml4ZWRcdCApe1xyXG5cdFx0XHRzZWxmLl9jcmVhdGVHcm91cCgnZml4ZWQnKTtcclxuXHRcdFx0c2VsZi5maXhlZFx0ID0gc2VsZi5fZ2V0R3JvdXAoJ2ZpeGVkJylcdCBhcyBHcm9iR3JvdXBGaXhlZFx0O1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHNlbGYuZGF0YVsnZml4ZWQnXSA9IHNlbGYuZml4ZWQ7XHJcblx0XHR9XHJcblx0XHRpZiAoICFzZWxmLmRlcml2ZWQgKXtcclxuXHRcdFx0c2VsZi5fY3JlYXRlR3JvdXAoJ2Rlcml2ZWQnKTtcclxuXHRcdFx0c2VsZi5kZXJpdmVkID0gc2VsZi5fZ2V0R3JvdXAoJ2Rlcml2ZWQnKSBhcyBHcm9iR3JvdXBEZXJpdmVkO1x0XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0c2VsZi5kYXRhWydkZXJpdmVkJ10gPSBzZWxmLmRlcml2ZWQ7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gRm9yIGFsbCBncm91cHMgXHJcblx0XHRmb3IoY29uc3QgZ3JvdXBfa2V5IGluIChzZWxmIGFzIGFueSkuZGF0YSApe1xyXG5cdFx0XHRjb25zdCBncm91cCA9IChzZWxmIGFzIGFueSkuZGF0YVtncm91cF9rZXldO1xyXG5cdFx0XHRncm91cC5wYXJlbnQgPSBzZWxmO1xyXG5cclxuXHRcdFx0Zm9yKGNvbnN0IGNvbF9rZXkgaW4gKGdyb3VwIGFzIGFueSkuY29sbGVjdGlvbnNfbmFtZXMgKXtcclxuXHRcdFx0XHRjb25zdCBjb2xsZWN0aW9uIDogR3JvYkNvbGxlY3Rpb248R3JvYk5vZGVUeXBlPiA9IGdyb3VwLmNvbGxlY3Rpb25zX25hbWVzW2NvbF9rZXldO1xyXG5cdFx0XHRcdGNvbGxlY3Rpb24ucGFyZW50ID0gZ3JvdXA7XHJcblx0XHRcdFx0Z3JvdXAuY29sbGVjdGlvbnNfbmFtZXNbY29sbGVjdGlvbi5nZXROYW1lKCldID0gY29sbGVjdGlvbjtcclxuXHJcblx0XHRcdFx0Zm9yKCBjb25zdCBub2RlX2tleSBpbiAoY29sbGVjdGlvbiBhcyBhbnkpLm5vZGVzX25hbWVzICl7XHJcblx0XHRcdFx0XHRjb25zdCBub2RlID0gKGNvbGxlY3Rpb24gYXMgYW55KS5ub2Rlc19uYW1lc1tub2RlX2tleV07XHJcblx0XHRcdFx0XHRub2RlLnBhcmVudCA9IGNvbGxlY3Rpb247XHJcblx0XHRcdFx0XHRjb2xsZWN0aW9uLm5vZGVzX25hbWVzW25vZGUuZ2V0TmFtZSgpXSA9IG5vZGU7XHJcblxyXG5cdFx0XHRcdFx0Y29uc3Qgb3JpZ2lucyA6IEdyb2JEZXJpdmVkT3JpZ2luW10gPSBub2RlLm9yaWdpbnMgPz8gW107XHJcblx0XHRcdFx0XHRvcmlnaW5zLmZvckVhY2goIG9yaWdpbiAgPT4ge1xyXG5cdFx0XHRcdFx0XHRsZXQga2V5cyA9IG9yaWdpbi5vcmlnaW5LZXkuc3BsaXQoJy4nKTtcclxuXHRcdFx0XHRcdFx0Y29uc3QgdGFyZ2V0ID0gc2VsZi5nZXROb2RlKGtleXNbMF0gYXMgYW55LGtleXNbMV0sa2V5c1syXSlcclxuXHRcdFx0XHRcdFx0b3JpZ2luLm9yaWdpbiA9IHRhcmdldDtcclxuXHJcblx0XHRcdFx0XHRcdG5vZGUuYWRkRGVwZW5kZW5jeSh0YXJnZXQpXHJcblx0XHRcdFx0XHR9KVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0Y29uc3QgZ3JvdXBzID0gT2JqZWN0LnZhbHVlcygoc2VsZiBhcyBhbnkpLmRhdGEpOyBcclxuXHR9XHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBUVFJQR1N5c3RlbUpTT05Gb3JtYXR0aW5nIGV4dGVuZHMgVFRSUEdTeXN0ZW0ge1xyXG5cdCAgXHJcblx0QEpzb25DbGFzc1R5cGVkICggR3JvYkdyb3VwRml4ZWQgKVxyXG5cdHB1YmxpYyBmaXhlZCBcdDogR3JvYkdyb3VwRml4ZWRcdDtcclxuXHJcblx0QEpzb25DbGFzc1R5cGVkICggR3JvYkdyb3VwRGVyaXZlZCApXHJcblx0cHVibGljIGRlcml2ZWQgXHQ6IEdyb2JHcm91cERlcml2ZWRcdDtcclxuXHJcblx0QEpzb25TdHJpbmcoKVxyXG5cdEBKc29uU3RyaW5nKHtzY2hlbWU6W0JBU0VfU0NIRU1FLFRUUlBHX1NDSEVNRVMuUFJFVklFV119KVxyXG5cdHB1YmxpYyBhdXRob3IgOiBzdHJpbmcgPSBcIlwiO1xyXG5cclxuXHRASnNvblN0cmluZygpXHJcblx0QEpzb25TdHJpbmcoe3NjaGVtZTpbQkFTRV9TQ0hFTUUsVFRSUEdfU0NIRU1FUy5QUkVWSUVXXX0pXHJcblx0cHVibGljIHZlcnNpb246IHN0cmluZyA9IFwiXCI7XHJcblx0XHJcblx0QEpzb25TdHJpbmcoKVxyXG5cdEBKc29uU3RyaW5nKHtzY2hlbWU6W0JBU0VfU0NIRU1FLFRUUlBHX1NDSEVNRVMuUFJFVklFV119KVxyXG5cdHB1YmxpYyBzeXN0ZW1Db2RlTmFtZTpzdHJpbmcgPSB1dWlkdjQoKTtcclxuXHRcclxuXHRASnNvblN0cmluZygpXHJcblx0QEpzb25TdHJpbmcoe3NjaGVtZTpbQkFTRV9TQ0hFTUUsVFRSUEdfU0NIRU1FUy5QUkVWSUVXXX0pXHJcblx0cHVibGljIHN5c3RlbU5hbWU6c3RyaW5nID0gXCJcIjtcclxuXHRcclxuXHRwdWJsaWMgY29uc3RydWN0b3IoKXtcclxuXHRcdHN1cGVyKCk7IFxyXG5cdH1cclxuXHJcblxyXG5cdHNldERlZmF1bHRWYWx1ZXMoIGRlZnVhbHRWYWx1ZXMgOiB7Z3JvdXA6c3RyaW5nLCBjb2w6c3RyaW5nICwga2V5OnN0cmluZyAsIHZhbHVlfVtdICl7XHJcblxyXG5cdFx0bGV0IG9iaiA9IHt9O1xyXG5cdFx0Y29uc3QgZ3JvdXBLZXkgPSAnZGVyaXZlZCc7XHJcblx0XHRjb25zdCBjb2xLZXlzID0gT2JqZWN0LmtleXModGhpcy5kZXJpdmVkLmNvbGxlY3Rpb25zX25hbWVzKTtcclxuXHRcdGZvciAobGV0IGMgPSAwOyBjIDwgT2JqZWN0LmtleXModGhpcy5kZXJpdmVkLmNvbGxlY3Rpb25zX25hbWVzKS5sZW5ndGg7IGMrKykge1xyXG5cdFx0XHRjb25zdCBjb2xLZXkgPSBjb2xLZXlzW2NdO1xyXG5cdFx0XHRjb25zdCBjb2xsZWN0aW9uID0gdGhpcy5kZXJpdmVkLmNvbGxlY3Rpb25zX25hbWVzW2NvbEtleV07XHJcblxyXG5cdFx0XHRjb25zdCBub2RlS2V5cyA9IE9iamVjdC5rZXlzKGNvbGxlY3Rpb24ubm9kZXNfbmFtZXMpO1xyXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVLZXlzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0Y29uc3Qgbm9kZUtleSA9IG5vZGVLZXlzW2ldO1xyXG5cdFx0XHRcdGNvbnN0IG5vZGUgPSBjb2xsZWN0aW9uLm5vZGVzX25hbWVzW25vZGVLZXldO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdG9ialtncm91cEtleSArJy4nKyBjb2xLZXkgKycuJysgbm9kZUtleV0gPSAoKSA9PiBub2RlLnNldFZhbHVlKCBub2RlLmdldFZhbHVlKCkgPz8gMCApXHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHJcblx0fVxyXG59XHJcblxyXG5cclxuIiwiaW1wb3J0IHsgQkFTRV9TQ0hFTUUgfSBmcm9tIFwiZ3JvYmF4LWpzb24taGFuZGxlclwiO1xyXG5pbXBvcnQgeyBrZXlNYW5hZ2VySW5zdGFuY2UgfSBmcm9tIFwidHRycGctc3lzdGVtLWdyYXBoXCI7XHJcbmltcG9ydCB7IEpzb25Cb29sZWFuLCBKc29uT2JqZWN0LCBKc29uUHJvcGVydHksIEpzb25TdHJpbmcgfSBmcm9tIFwiZ3JvYmF4LWpzb24taGFuZGxlclwiO1xyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBTeXN0ZW1QcmV2aWV3U2NoZW1lc3sgXHJcblx0c3RhdGljIEJBU0UgPSBCQVNFX1NDSEVNRTtcclxuXHRzdGF0aWMgUEFHRSBcdD0gJ1BBR0UnOyBcclxufVxyXG5cclxuQEpzb25PYmplY3Qoe1xyXG5cdG9uQWZ0ZXJEZVNlcmlhbGl6YXRpb246KHNlbGY6U3lzdGVtUHJldmlldywgLi4uYXJncyApPT57XHJcblx0XHRzZWxmLmlkID0ga2V5TWFuYWdlckluc3RhbmNlLmdldE5ld0tleSgpO1xyXG5cdH1cclxufSlcclxuZXhwb3J0IGNsYXNzIFN5c3RlbVByZXZpZXcge1xyXG5cclxuXHRwdWJsaWMgaWQgOiBzdHJpbmcgPSBrZXlNYW5hZ2VySW5zdGFuY2UuZ2V0TmV3S2V5KCk7XHJcblx0cHVibGljIGZpbGVQYXRoOnN0cmluZyA7XHJcblxyXG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0XHJcblx0fVxyXG5cdHB1YmxpYyBpbml0KCl7XHJcblx0XHR0aGlzLmF1dGhvciA9IFwiZ3JvYmF4XCI7XHJcblx0XHR0aGlzLnZlcnNpb24gPSBcIjAuMC4xXCI7XHJcblx0XHR0aGlzLmNvZGUgPSBcImdyb2JkbmRcIjtcclxuXHRcdHRoaXMubmFtZSA9IFwiR3JvYmF4JyBEbkQgVFRQUlBHXCI7XHJcblx0fVxyXG5cclxuXHRASnNvbkJvb2xlYW4oe3NjaGVtZTpbU3lzdGVtUHJldmlld1NjaGVtZXMuQkFTRV19KVxyXG5cdHB1YmxpYyBpc0VkaXRhYmxlXHRcdDogYm9vbGVhbiA9IHRydWUgO1xyXG5cclxuXHRASnNvblN0cmluZyh7c2NoZW1lOltTeXN0ZW1QcmV2aWV3U2NoZW1lcy5CQVNFXX0pXHJcblx0cHVibGljIGF1dGhvclx0XHRcdDogc3RyaW5nIDtcclxuXHRcclxuXHRASnNvblN0cmluZyh7c2NoZW1lOltTeXN0ZW1QcmV2aWV3U2NoZW1lcy5CQVNFLFN5c3RlbVByZXZpZXdTY2hlbWVzLlBBR0VdfSlcclxuXHRwdWJsaWMgdmVyc2lvblx0XHRcdDogc3RyaW5nIDtcclxuXHRcclxuXHRASnNvblN0cmluZyh7c2NoZW1lOltTeXN0ZW1QcmV2aWV3U2NoZW1lcy5CQVNFLFN5c3RlbVByZXZpZXdTY2hlbWVzLlBBR0VdfSlcclxuXHRwdWJsaWMgY29kZVx0OiBzdHJpbmcgO1x0XHJcblxyXG5cdEBKc29uU3RyaW5nKHtzY2hlbWU6W1N5c3RlbVByZXZpZXdTY2hlbWVzLkJBU0UsU3lzdGVtUHJldmlld1NjaGVtZXMuUEFHRV19KVxyXG5cdHB1YmxpYyBuYW1lXHRcdDogc3RyaW5nIDtcclxuXHRcclxuXHRwdWJsaWMgZm9sZGVyUGF0aFx0XHQ6IHN0cmluZyA7XHJcblx0cHVibGljIGZvbGRlck5hbWVcdFx0OiBzdHJpbmcgO1xyXG5cdFxyXG59XHJcblxyXG5cclxuZXhwb3J0IGNsYXNzIEZpbGxlZFN5c3RlbVByZXZpZXcgIGV4dGVuZHMgU3lzdGVtUHJldmlldyAge1xyXG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0c3VwZXIoKTtcclxuXHRcdHRoaXMuYXV0aG9yID0gXCJncm9iYXhcIjtcclxuXHRcdHRoaXMudmVyc2lvbiA9IFwiMC4wLjFcIjtcclxuXHRcdHRoaXMuY29kZSA9IFwiZ3JvYmRuZFwiO1xyXG5cdFx0dGhpcy5uYW1lID0gXCJHcm9iYXgnIERuRCBUVFBSUEdcIjtcclxuXHR9XHJcbn0iLCJpbXBvcnQgeyBKc29uQXJyYXlTdHJpbmcsIEpzb25Cb29sZWFuLCBKc29uUHJvcGVydHksIEpzb25TdHJpbmcgfSBmcm9tIFwiZ3JvYmF4LWpzb24taGFuZGxlclwiOyBcclxuaW1wb3J0IHsgRmlsZUhhbmRsZXIgfSBmcm9tIFwiLi4vZmlsZUhhbmRsZXJcIjtcclxuaW1wb3J0IHsga2V5TWFuYWdlckluc3RhbmNlIH0gZnJvbSBcInR0cnBnLXN5c3RlbS1ncmFwaFwiO1xyXG5pbXBvcnQgUGx1Z2luSGFuZGxlciBmcm9tIFwiLi4vLi4vLi4vLi4vc3JjL01vZHVsZXMvT2JzaWRpYW5VSS9hcHBcIjtcclxuaW1wb3J0IHsgQkFTRV9TQ0hFTUUgfSBmcm9tIFwiZ3JvYmF4LWpzb24taGFuZGxlclwiO1xyXG4gXHJcbmV4cG9ydCBjbGFzcyBVSUxheW91dE1vZGVsU2NoZW1lc3sgXHJcblx0c3RhdGljIEJBU0UgXHQ9IEJBU0VfU0NIRU1FIDtcclxuXHRzdGF0aWMgUEFHRSBcdD0nUEFHRSc7IFxyXG59XHJcbmV4cG9ydCBjbGFzcyBVSUxheW91dE1vZGVsIHtcclxuXHJcblx0cHVibGljIGlkIDogc3RyaW5nID0ga2V5TWFuYWdlckluc3RhbmNlLmdldE5ld0tleSgpO1xyXG5cclxuXHRASnNvblN0cmluZyh7c2NoZW1lOltVSUxheW91dE1vZGVsU2NoZW1lcy5CQVNFLFVJTGF5b3V0TW9kZWxTY2hlbWVzLlBBR0VdfSlcclxuXHRndWlkXHQ6c3RyaW5nID0gUGx1Z2luSGFuZGxlci51dWlkdjQoKTtcclxuXHJcblx0QEpzb25TdHJpbmcoe3NjaGVtZTpbVUlMYXlvdXRNb2RlbFNjaGVtZXMuQkFTRV19KVxyXG5cdGF1dGhvclx0OnN0cmluZztcclxuXHRcclxuXHRASnNvblN0cmluZyh7c2NoZW1lOltVSUxheW91dE1vZGVsU2NoZW1lcy5CQVNFXX0pXHJcblx0dmVyc2lvbjpzdHJpbmc7XHJcblxyXG5cdEBKc29uU3RyaW5nKHtzY2hlbWU6W1VJTGF5b3V0TW9kZWxTY2hlbWVzLkJBU0UsVUlMYXlvdXRNb2RlbFNjaGVtZXMuUEFHRV19KVxyXG5cdG5hbWVcdDpzdHJpbmc7XHJcblx0XHJcblx0QEpzb25TdHJpbmcoe3NjaGVtZTpbVUlMYXlvdXRNb2RlbFNjaGVtZXMuQkFTRV19KVxyXG5cdG1haW5TdHlsZSA6IHN0cmluZztcclxuXHRcclxuXHRASnNvblN0cmluZyh7c2NoZW1lOltVSUxheW91dE1vZGVsU2NoZW1lcy5CQVNFXX0pXHJcblx0Y29tcG9uZW50SnNcdDogc3RyaW5nO1xyXG5cclxuXHRASnNvblN0cmluZyh7c2NoZW1lOltVSUxheW91dE1vZGVsU2NoZW1lcy5CQVNFXX0pXHJcblx0Zm9sZGVyU3JjOlN0cmluZztcclxuXHR2YWxpZCA6IGJvb2xlYW4gPSB0cnVlO1xyXG5cdGVycm9ycyA6IHN0cmluZ1tdID0gW107XHJcblx0XHJcblx0cHVibGljIGFzeW5jIGlzVmFsaWQoICApe1xyXG5cdFx0bGV0IGVycm9ycyA6IHN0cmluZyBbXSA9W107XHJcblx0XHRcclxuXHRcdGlmICghdGhpcy5mb2xkZXJTcmMpe1xyXG5cdFx0XHRlcnJvcnMucHVzaChgVUlMYXlvdXRNb2RlbCBmb3IgJHt0aGlzLm5hbWV9IGJ5ICR7dGhpcy5hdXRob3J9LCBkaWQgbm90IGhhdmUgYSBmb2xkZXJTcmNgKTtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCB2YWxpZCA9IHRydWU7XHJcblxyXG5cdFx0Ly8gc2VlIGlmIHRoZSBKYXZhc2NyaXB0IGV4aXN0c1xyXG5cdFx0bGV0IHNyYyA9IHRoaXMuZm9sZGVyU3JjICsnLycrdGhpcy5jb21wb25lbnRKcztcclxuXHRcdGxldCBfID0gYXdhaXQgRmlsZUhhbmRsZXIuZXhpc3RzKCBzcmMgKTtcclxuXHRcdGlmICggIV8gKXtcclxuXHRcdFx0ZXJyb3JzLnB1c2goYFVJTGF5b3V0TW9kZWwgZm9yICR7dGhpcy5uYW1lfSBieSAke3RoaXMuYXV0aG9yfSwgUG9pbnRlZCB0byBhIG1pc3NpbmcgZmlsZSAke3NyY31gKTtcclxuXHRcdFx0dmFsaWQgPSBmYWxzZTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBzZWUgaWYgdGhlIGNzcyBleGlzdHMgXHJcblx0XHRzcmMgPSB0aGlzLmZvbGRlclNyYyArJy8nK3RoaXMubWFpblN0eWxlO1xyXG5cdFx0XyA9IGF3YWl0IEZpbGVIYW5kbGVyLmV4aXN0cyggc3JjICk7XHJcblx0XHRpZiAoICFfICl7XHJcblx0XHRcdGVycm9ycy5wdXNoKGBVSUxheW91dE1vZGVsIGZvciAke3RoaXMubmFtZX0gYnkgJHt0aGlzLmF1dGhvcn0sIFBvaW50ZWQgdG8gYSBtaXNzaW5nIGZpbGUgJHtzcmN9YCk7XHJcblx0XHRcdHZhbGlkID0gZmFsc2U7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy52YWxpZCA9IHZhbGlkO1xyXG5cdFx0cmV0dXJuIHZhbGlkO1xyXG5cdH1cclxuXHJcblx0cHVibGljIGFzeW5jIGxvYWRmaWxlKGZpbGUgLCBlcnJvcnMgOiBzdHJpbmcgW10gPSBbXSApe1xyXG5cdFx0Y29uc3Qgc3JjID0gdGhpcy5mb2xkZXJTcmMgKycvJytmaWxlO1xyXG5cdFx0bGV0IF8gPSBhd2FpdCBGaWxlSGFuZGxlci5leGlzdHMoIHNyYyApO1xyXG5cdFx0aWYgKCAhXyApe1xyXG5cdFx0XHRlcnJvcnMucHVzaChgZmlsZSBhdCAke3NyY30gZGlkIG5vdCBleGlzdHNgKTtcclxuXHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHR9XHJcblxyXG5cdFx0bGV0IGYgPSBhd2FpdCBGaWxlSGFuZGxlci5yZWFkRmlsZShzcmMpO1xyXG5cdFx0cmV0dXJuIGY7XHJcblx0fVxyXG59XHJcbiIsImltcG9ydCB7IE11dGV4IH0gZnJvbSBcImFzeW5jLW11dGV4XCI7XHJcbmltcG9ydCB7IEZpbGVIYW5kbGVyIH0gZnJvbSBcIi4vZmlsZUhhbmRsZXJcIjtcclxuaW1wb3J0IHsgSlNPTkhhbmRsZXIgfSBmcm9tICdncm9iYXgtanNvbi1oYW5kbGVyJztcclxuaW1wb3J0IHsgVFRSUEdTeXN0ZW1KU09ORm9ybWF0dGluZywgVFRSUEdfU0NIRU1FUyB9IGZyb20gXCIuLi9EZXNpZ25lci9pbmRleFwiO1xyXG5pbXBvcnQgeyBTeXN0ZW1QcmV2aWV3IH0gZnJvbSBcIi4vbW9kZWwvc3lzdGVtUHJldmlld1wiO1xyXG5pbXBvcnQgdHlwZSB7IE1lc3NhZ2UsIG1lc3NhZ2VMaXN0IH0gZnJvbSBcIi4uL09ic2lkaWFuVUkvVUlJbnRlcmZhY2VzL0Rlc2lnbmVyMDEvQmFzZUNvbXBvbmVudHMvTWVzc2FnZXMvbWVzc2FnZVwiO1xyXG5pbXBvcnQgUGx1Z2luSGFuZGxlciBmcm9tIFwiLi4vT2JzaWRpYW5VSS9hcHBcIjtcclxuaW1wb3J0IHsgZm9sZGVyIH0gZnJvbSBcImpzemlwXCI7XHJcbmltcG9ydCB7IFVJTGF5b3V0TW9kZWwgfSBmcm9tIFwiLi9tb2RlbC9VSUxheW91dE1vZGVsXCI7XHJcblxyXG50eXBlIGNvbW1hbmQgPSB7IGNvbW1hbmQ6J2ZpbGUnfCdmb2xkZXInICwgcGF0aDpzdHJpbmcsIGNvbnRlbnQ6c3RyaW5nIH1cclxuZXhwb3J0IGNsYXNzIEZpbGVDb250ZXh0IHtcclxuXHJcblx0cHJpdmF0ZSBzdGF0aWMgbXV0ZXg6TXV0ZXggPSBuZXcgTXV0ZXgoKTtcclxuXHRwcml2YXRlIHBhdGggOiBzdHJpbmcgOyBcclxuXHJcblx0Ly8gc2luZ2xldG9uIGltcGxlbWVudGF0aW9uXHJcblx0cHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2U6RmlsZUNvbnRleHQ7XHJcblx0cHJpdmF0ZSBjb25zdHJ1Y3Rvcigpe1xyXG5cdFx0dGhpcy5wYXRoID0gUGx1Z2luSGFuZGxlci5QTFVHSU5fUk9PVCArICcvJyArXHJcblx0XHRcdFx0XHRQbHVnaW5IYW5kbGVyLlNZU1RFTVNfRk9MREVSX05BTUU7ICsgJy8nIDtcclxuXHR9XHJcblx0cHVibGljIHN0YXRpYyBnZXRJbnN0YW5jZSgpeyBcclxuXHRcdGlmKCFGaWxlQ29udGV4dC5pbnN0YW5jZSl7XHJcblx0XHRcdEZpbGVDb250ZXh0Lmluc3RhbmNlID0gbmV3IEZpbGVDb250ZXh0KCk7XHJcblx0XHR9IFxyXG5cdFx0cmV0dXJuIEZpbGVDb250ZXh0Lmluc3RhbmNlOyBcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBsb2FkZWRTeXN0ZW0gOiBzdHJpbmc7IFxyXG5cdHB1YmxpYyBmb2xkZXJzV2l0aE5vSW5kZXg6IHN0cmluZ1tdO1xyXG5cdHB1YmxpYyBhdmFpbGFibGVTeXN0ZW1zOiBTeXN0ZW1QcmV2aWV3W107IFxyXG5cclxuXHRwcml2YXRlIGFzeW5jIGluaXRTeXN0ZW1zU3RydWN0dXJlKCl7IFxyXG5cdFx0aWYgKCggYXdhaXQgRmlsZUhhbmRsZXIuZXhpc3RzKHRoaXMucGF0aCkpIClcclxuXHRcdFx0cmV0dXJuOyBcclxuXHRcdEZpbGVIYW5kbGVyLm1rZGlyKHRoaXMucGF0aCk7IFxyXG5cdH1cclxuXHJcblxyXG5cdHByaXZhdGUgYXN5bmMgbG9hZFByZXZpZXdBbmRmb2xkZXIoZm9sZGVyUGF0aDpzdHJpbmcpe1xyXG5cdFx0Y29uc3QgaW5kZXhQYXRoID0gZm9sZGVyUGF0aCArICcvaW5kZXguanNvbic7XHJcblx0XHRjb25zdCBmb2xkZXJOYW1lID0gZm9sZGVyUGF0aC5zcGxpdCgnLycpLmxhc3QoKTtcclxuXHRcdGxldCBleGlzdHMgPSBhd2FpdCBGaWxlSGFuZGxlci5leGlzdHMoaW5kZXhQYXRoKVxyXG5cdFx0aWYoIGV4aXN0cyApe1xyXG5cdFx0XHRjb25zdCBjb250ZW50ID0gYXdhaXQgRmlsZUhhbmRsZXIucmVhZEZpbGUoaW5kZXhQYXRoKTsgXHJcblx0XHRcdGNvbnN0IHN5c3RlbVByZXZpZXcgPSBKU09OSGFuZGxlci5kZXNlcmlhbGl6ZShTeXN0ZW1QcmV2aWV3LGNvbnRlbnQpO1xyXG5cdFx0XHRzeXN0ZW1QcmV2aWV3LmZvbGRlck5hbWVcdD0gZm9sZGVyTmFtZTtcclxuXHRcdFx0c3lzdGVtUHJldmlldy5mb2xkZXJQYXRoXHQ9IGZvbGRlclBhdGg7XHJcblx0XHRcdHN5c3RlbVByZXZpZXcuZmlsZVBhdGhcdFx0PSBpbmRleFBhdGg7IFxyXG5cdFx0XHRyZXR1cm4gW3N5c3RlbVByZXZpZXcsZm9sZGVyTmFtZV1cclxuXHRcdH1cclxuXHRcdHJldHVybiBbbnVsbCxmb2xkZXJOYW1lXTtcclxuXHR9XHJcblx0cHJpdmF0ZSBhc3luYyBsb2FkUHJldmlldyhmb2xkZXJQYXRoOnN0cmluZyl7XHJcblx0XHRyZXR1cm4gKGF3YWl0IHRoaXMubG9hZFByZXZpZXdBbmRmb2xkZXIoZm9sZGVyUGF0aCkpWzBdO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXRpYyBhc3luYyBsb2FkQWxsQXZhaWxhYmxlRmlsZXMoICl7XHJcblx0XHRsZXQgaW5zdGFuY2UgPSBGaWxlQ29udGV4dC5nZXRJbnN0YW5jZSgpO1xyXG5cdFx0cmV0dXJuIGluc3RhbmNlLmxvYWRBbGxBdmFpbGFibGVGaWxlcygpO1xyXG5cdH1cclxuXHRwdWJsaWMgYXN5bmMgbG9hZEFsbEF2YWlsYWJsZUZpbGVzKCBtZXNzYWdlcyA6IG1lc3NhZ2VMaXN0ID0ge30gKXsgXHJcblx0XHRsZXQgcmVsZWFzZSA9IGF3YWl0IEZpbGVDb250ZXh0Lm11dGV4LmFjcXVpcmUoKTsgXHJcblxyXG5cdFx0XHQvLyBmaW5kIGFsbCBmb2xkZXJzLCB0aGF0IGNvdWxkIGNvbnRhaW4gYSBzeXN0ZW0uIFxyXG5cdFx0XHRsZXQgbHNEaXIgPSBhd2FpdCBGaWxlSGFuZGxlci5sc2Rpcih0aGlzLnBhdGgpO1xyXG5cdFx0XHRsZXQgc3lzdGVtcyA9IGF3YWl0IFByb21pc2UuYWxsKCBsc0Rpci5mb2xkZXJzLm1hcChhc3luYyAoIGZvbGRlclBhdGggKSA9PiB7XHJcblx0XHRcdFx0cmV0dXJuIGF3YWl0IHRoaXMubG9hZFByZXZpZXdBbmRmb2xkZXIoZm9sZGVyUGF0aCk7XHJcblx0XHRcdH0pKSBcclxuXHJcblx0XHRcdHRoaXMuZm9sZGVyc1dpdGhOb0luZGV4ID0gW107XHJcblx0XHRcdHRoaXMuYXZhaWxhYmxlU3lzdGVtcyA9IFtdO1xyXG5cclxuXHRcdFx0Ly8gU29ydCBpbnRvIGZvdW5kIGFuZCB1bmZvdW5kXHJcblx0XHRcdHN5c3RlbXMuZm9yRWFjaCggcCA9PiB7XHJcblx0XHRcdFx0aWYocFswXSl7XHJcblx0XHRcdFx0XHR0aGlzLmF2YWlsYWJsZVN5c3RlbXNcdC5wdXNoKHBbMF0pO1xyXG5cdFx0XHRcdH1lbHNle1xyXG5cdFx0XHRcdFx0dGhpcy5mb2xkZXJzV2l0aE5vSW5kZXggLnB1c2gocFsxXSk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KSBcclxuXHRcdHJlbGVhc2UoKTtcclxuXHR9XHJcbiBcclxuXHRwdWJsaWMgc3RhdGljIGFzeW5jIGNyZWF0ZVN5c3RlbURlZmluaXRpb24oIHN5c3RlbSA6IFN5c3RlbVByZXZpZXcgLCBtZXNzYWdlcyA6IG1lc3NhZ2VMaXN0ID0ge30gKSA6IFByb21pc2U8U3lzdGVtUHJldmlldyB8IG51bGw+IHtcclxuXHRcdGxldCBpbnN0YW5jZSA9IEZpbGVDb250ZXh0LmdldEluc3RhbmNlKCk7XHJcblx0XHRyZXR1cm4gaW5zdGFuY2UuY3JlYXRlU3lzdGVtRGVmaW5pdGlvbihzeXN0ZW0sIG1lc3NhZ2VzICk7XHJcblx0fVxyXG5cdHB1YmxpYyBhc3luYyBjcmVhdGVTeXN0ZW1EZWZpbml0aW9uKCBzeXN0ZW0gOiBTeXN0ZW1QcmV2aWV3ICwgbWVzc2FnZXMgOiBtZXNzYWdlTGlzdCA9IHt9KSA6IFByb21pc2U8U3lzdGVtUHJldmlldyB8IG51bGw+ICB7XHJcblx0XHRsZXQgcmVsZWFzZSA9IGF3YWl0IEZpbGVDb250ZXh0Lm11dGV4LmFjcXVpcmUoKTsgXHJcblxyXG5cdFx0IFx0dGhpcy5pbml0U3lzdGVtc1N0cnVjdHVyZSgpO1xyXG5cclxuXHRcdFx0Ly8gY3JlYXRlIGZvbGRlciBpZiBub3QgZXhpc3RzLiBcclxuXHRcdFx0bGV0IGZvbGRlclBhdGggPSB0aGlzLnBhdGggKyAnLycgKyBzeXN0ZW0uZm9sZGVyTmFtZTtcclxuXHRcdFx0aWYgKCEgYXdhaXQgRmlsZUhhbmRsZXIuZXhpc3RzKGZvbGRlclBhdGgpKXtcclxuXHRcdFx0XHRhd2FpdCBGaWxlSGFuZGxlci5ta2Rpcihmb2xkZXJQYXRoKVxyXG5cdFx0XHR9XHJcblx0XHRcdGVsc2Uge1xyXG5cdFx0XHRcdGlmIChhd2FpdCBGaWxlSGFuZGxlci5leGlzdHMoZm9sZGVyUGF0aCArICcvaW5kZXguanNvbicpKXtcclxuXHRcdFx0XHRcdG1lc3NhZ2VzWydjcmVhdGVTeXN0ZW0nXSA9IHttc2c6YGZvbGRlciAnJHtzeXN0ZW0uZm9sZGVyTmFtZX0nIGFscmVhZHkgZXhpc3RlZCwgYW5kIGNvbnRhaW5lZCBhIHN5c3RlbS4gXFxuRWl0aGVyIGRlbGV0ZSB0aGUgb2xkIHN5c3RlbSwgb3IgY2hvb3NlIGFub3RoZXIgZm9sZGVybmFtZWAsIHR5cGU6J2Vycm9yJ307XHJcblx0XHRcdFx0XHRyZWxlYXNlKCk7XHJcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdC8vLyBjcmVhdGUgdGhlIHN5c3RlbS4nXHJcblx0XHRcdGxldCBmaWxlcGF0aCA9IGZvbGRlclBhdGgrJy9pbmRleC5qc29uJztcclxuXHRcdFx0YXdhaXQgRmlsZUhhbmRsZXIuc2F2ZUZpbGUoIGZpbGVwYXRoICwgSlNPTkhhbmRsZXIuc2VyaWFsaXplKHN5c3RlbSkgKVxyXG5cdFx0XHRpZiAoISBhd2FpdCBGaWxlSGFuZGxlci5leGlzdHMoZmlsZXBhdGgpKXtcclxuXHRcdFx0XHRtZXNzYWdlc1snY3JlYXRlU3lzdGVtJ10gPSB7bXNnOmB0cmllZCB0byBzYXZlIGluZGV4Lmpzb24gYXQgJyR7ZmlsZXBhdGh9IFxcbiBidXQgc29tZXRoaW5nIHdlbnQgd3JvbmcuYCwgdHlwZTonZXJyb3InfTtcclxuXHRcdFx0XHRyZWxlYXNlKCk7XHJcblx0XHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHRcdH1cclxuXHRcdFx0XHJcblx0XHRcdFxyXG5cdFx0XHRsZXQgc3lzdGVtUmVsb2FkZWQgPSBhd2FpdCB0aGlzLmxvYWRQcmV2aWV3KGZvbGRlclBhdGgpO1xyXG5cdFx0cmVsZWFzZSgpO1xyXG5cdFx0cmV0dXJuIHN5c3RlbVJlbG9hZGVkO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN0YXRpYyBhc3luYyBjb3B5U3lzdGVtRGVmaW5pdGlvbiggc3lzdGVtIDogU3lzdGVtUHJldmlldyAsIHN5c3RlbU5ldyA6IFN5c3RlbVByZXZpZXcgLCBtZXNzYWdlcyA6IG1lc3NhZ2VMaXN0ID0ge30gKSA6IFByb21pc2U8U3lzdGVtUHJldmlldyB8IG51bGw+ICAge1xyXG5cdFx0bGV0IGluc3RhbmNlID0gRmlsZUNvbnRleHQuZ2V0SW5zdGFuY2UoKTtcclxuXHRcdHJldHVybiBpbnN0YW5jZS5jb3B5U3lzdGVtRGVmaW5pdGlvbihzeXN0ZW0sc3lzdGVtTmV3LG1lc3NhZ2VzKTtcclxuXHR9XHJcblx0cHVibGljIGFzeW5jIGNvcHlTeXN0ZW1EZWZpbml0aW9uKCBzeXN0ZW0gOiBTeXN0ZW1QcmV2aWV3ICwgc3lzdGVtTmV3IDogU3lzdGVtUHJldmlldyAsIG1lc3NhZ2VzIDogbWVzc2FnZUxpc3QgPSB7fSkgOiBQcm9taXNlPFN5c3RlbVByZXZpZXcgfCBudWxsPiAge1xyXG5cdFx0XHJcblx0XHRsZXQgY29waWVkU3lzdGVtID0gYXdhaXQgdGhpcy5jcmVhdGVTeXN0ZW1EZWZpbml0aW9uKHN5c3RlbU5ldywgbWVzc2FnZXMpO1xyXG5cdFx0aWYgKCFjb3BpZWRTeXN0ZW0pe1xyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0YXN5bmMgZnVuY3Rpb24gREZTQ29weUFsbEZvbGRlcnMoIHBhdGg6c3RyaW5nICwgbmV3UGF0aDpzdHJpbmcpe1xyXG5cdFx0XHRsZXQgbHMgPSBhd2FpdCBGaWxlSGFuZGxlci5sc2RpcihwYXRoKTtcclxuXHRcdFx0YXdhaXQgUHJvbWlzZS5hbGwoIGxzLmZvbGRlcnMubWFwKGFzeW5jICggZm9sZGVyUGF0aCApID0+IHtcclxuXHRcdFx0XHRsZXQgZm9sZGVybmFtZSA9IGZvbGRlclBhdGguc3BsaXQoJy8nKS5sYXN0KCk7XHJcblx0XHRcdFx0bGV0IG5ld0ZvbGRlclBhdGggPSBuZXdQYXRoICsgJy8nICsgZm9sZGVybmFtZTtcclxuXHRcdFx0XHRGaWxlSGFuZGxlci5ta2RpcihuZXdGb2xkZXJQYXRoKTtcclxuXHRcdFx0XHRhd2FpdCBERlNDb3B5QWxsRm9sZGVycyhmb2xkZXJQYXRoLG5ld0ZvbGRlclBhdGgpO1xyXG5cdFx0XHR9KSk7XHJcblx0XHR9XHJcblxyXG5cdFx0YXN5bmMgZnVuY3Rpb24gQkZTQ29weUFsbEZpbGVzKCBwYXRoOnN0cmluZyAsIG5ld1BhdGg6c3RyaW5nKXtcclxuXHJcblxyXG5cdFx0XHRsZXQgbHMgPSBhd2FpdCBGaWxlSGFuZGxlci5sc2RpcihwYXRoKTtcclxuXHRcdFx0YXdhaXQgUHJvbWlzZS5hbGwoIGxzLmZpbGVzLm1hcChhc3luYyAoIGZpbGVQYXRoICkgPT4geyBcclxuXHRcdFx0XHRsZXQgZmlsZSA9IGF3YWl0IEZpbGVIYW5kbGVyLnJlYWRGaWxlKGZpbGVQYXRoKTtcclxuXHRcdFx0XHRsZXQgZmlsZU5hbWUgPSBmaWxlUGF0aC5zcGxpdCgnLycpLmxhc3QoKTtcclxuXHRcdFx0XHRhd2FpdCBGaWxlSGFuZGxlci5zYXZlRmlsZShuZXdQYXRoICsgJy8nKyBmaWxlTmFtZSAsZmlsZSk7XHJcblx0XHRcdH0pKTtcclxuIFxyXG5cdFx0XHRhd2FpdCBQcm9taXNlLmFsbCggbHMuZm9sZGVycy5tYXAoYXN5bmMgKCBmb2xkZXJQYXRoICkgPT4geyBcclxuXHRcdFx0XHRsZXQgc2VnbWVudHNQYXRoID0gZm9sZGVyUGF0aC5zcGxpdCgnLycpOyBcclxuXHRcdFx0XHRsZXQgZm9sZGVybmFtZSA9IHNlZ21lbnRzUGF0aC5wb3AoKTtcclxuXHRcdFx0XHRsZXQgbmV3Rm9sZGVyUGF0aCA9IG5ld1BhdGggKyAnLycgKyBmb2xkZXJuYW1lO1xyXG5cdFx0XHRcdGF3YWl0IEJGU0NvcHlBbGxGaWxlcyhmb2xkZXJQYXRoLG5ld0ZvbGRlclBhdGgpO1xyXG5cdFx0XHR9KSk7XHJcblx0XHR9XHJcblxyXG5cdFx0YXdhaXQgREZTQ29weUFsbEZvbGRlcnMoc3lzdGVtLmZvbGRlclBhdGgsIGNvcGllZFN5c3RlbS5mb2xkZXJQYXRoKTtcclxuXHRcdGF3YWl0IEJGU0NvcHlBbGxGaWxlcyhzeXN0ZW0uZm9sZGVyUGF0aCwgY29waWVkU3lzdGVtLmZvbGRlclBhdGgpOyBcclxuXHRcdGF3YWl0IEZpbGVIYW5kbGVyLnNhdmVGaWxlKGNvcGllZFN5c3RlbS5maWxlUGF0aCwgSlNPTkhhbmRsZXIuc2VyaWFsaXplKGNvcGllZFN5c3RlbSkgKVxyXG5cdFx0cmV0dXJuIGNvcGllZFN5c3RlbTtcclxuXHJcblx0fVxyXG5cclxuXHRwdWJsaWMgc3RhdGljIGFzeW5jIHN5c3RlbURlZmluaXRpb25FeGlzdHNJbkZvbGRlciggZm9sZGVyOnN0cmluZyl7XHJcblx0XHRsZXQgaW5zdGFuY2UgPSBGaWxlQ29udGV4dC5nZXRJbnN0YW5jZSgpO1xyXG5cdFx0cmV0dXJuIGluc3RhbmNlLnN5c3RlbURlZmluaXRpb25FeGlzdHNJbkZvbGRlcihmb2xkZXIpO1xyXG5cdH1cclxuXHRwdWJsaWMgYXN5bmMgc3lzdGVtRGVmaW5pdGlvbkV4aXN0c0luRm9sZGVyKCBmb2xkZXI6c3RyaW5nICl7XHJcblx0XHRsZXQgZm9sZGVyUGF0aCA9IHRoaXMucGF0aCArICcvJyArIGZvbGRlcjtcclxuXHRcdGlmICghIGF3YWl0IEZpbGVIYW5kbGVyLmV4aXN0cyhmb2xkZXJQYXRoKSl7XHJcblx0XHRcdCByZXR1cm4gZmFsc2U7XHJcblx0XHR9XHJcblx0XHRlbHNlIHsgXHJcblx0XHRcdGlmIChhd2FpdCBGaWxlSGFuZGxlci5leGlzdHMoZm9sZGVyUGF0aCArICcvaW5kZXguanNvbicpKXsgXHJcblx0XHRcdFx0cmV0dXJuIHRydWU7XHJcblx0XHRcdH0gXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gZmFsc2U7XHJcblx0fVxyXG5cclxuXHJcblx0cHVibGljIHN0YXRpYyBhc3luYyBnZXRPckNyZWF0ZVN5c3RlbXNEZXNpZ25zKCBmb2xkZXI6c3RyaW5nKXtcclxuXHRcdHJldHVybiBGaWxlQ29udGV4dC5nZXRJbnN0YW5jZSgpLnN5c3RlbURlZmluaXRpb25FeGlzdHNJbkZvbGRlcihmb2xkZXIpO1xyXG5cdH1cclxuXHRwdWJsaWMgYXN5bmMgZ2V0T3JDcmVhdGVTeXN0ZW1zRGVzaWducyggZm9sZGVyOnN0cmluZyApe1xyXG4gXHJcblx0XHQvLyBpZiB0aGUgZm9sZGVyIGRvZXMgbm90IGV4aXN0LiByZXR1cm4gZmFsc2UgXHJcblx0XHRpZiAoISBhd2FpdCBGaWxlSGFuZGxlci5leGlzdHMoZm9sZGVyKSl7XHJcblx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGlmIHRoZSBmb2xkZXIgZG9lcyBub3QgZXhpc3QuIHJldHVybiBmYWxzZSBcclxuXHRcdGlmICghIGF3YWl0IEZpbGVIYW5kbGVyLmV4aXN0cyhmb2xkZXIpKXtcclxuXHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU2VlIGlmIHRoZSBmaWxlIGV4aXN0cy4gXHJcblx0XHRsZXQgZmlsZXBhdGggPSBmb2xkZXIgKyAnL2Rlc2lnbmVyLmpzb24nO1xyXG5cdFx0aWYgKCFhd2FpdCBGaWxlSGFuZGxlci5leGlzdHMoZmlsZXBhdGgpKXtcclxuXHJcblx0XHRcdC8vIENyZWF0ZSB0aGUgZmlsZS4gXHJcblx0XHRcdGxldCBkZXNpZ25lciA9IG5ldyBUVFJQR1N5c3RlbUpTT05Gb3JtYXR0aW5nKCk7XHJcblx0XHRcdGRlc2lnbmVyLmluaXRBc05ldygpO1xyXG5cdFx0XHRhd2FpdCBGaWxlSGFuZGxlci5zYXZlRmlsZSggZmlsZXBhdGggLCBKU09OSGFuZGxlci5zZXJpYWxpemUoZGVzaWduZXIpICk7XHJcblxyXG5cdFx0XHRyZXR1cm4gZGVzaWduZXI7XHJcblx0XHR9XHJcblx0XHRcclxuXHRcdGxldCBmaWxlID0gYXdhaXQgRmlsZUhhbmRsZXIucmVhZEZpbGUoZmlsZXBhdGgpO1xyXG5cdFx0bGV0IGxvYWRlZCA9IEpTT05IYW5kbGVyLmRlc2VyaWFsaXplPFRUUlBHU3lzdGVtSlNPTkZvcm1hdHRpbmc+KCBUVFJQR1N5c3RlbUpTT05Gb3JtYXR0aW5nLCBmaWxlICk7XHJcblx0XHRyZXR1cm4gbG9hZGVkIGFzIFRUUlBHU3lzdGVtSlNPTkZvcm1hdHRpbmc7XHJcblx0fVxyXG5cdHB1YmxpYyBhc3luYyBzYXZlU3lzdGVtc0Rlc2lnbnMoIGZvbGRlcjpzdHJpbmcgLCBkZXNpZ25lcjogVFRSUEdTeXN0ZW1KU09ORm9ybWF0dGluZyApe1xyXG5cclxuXHRcdC8vIGlmIHRoZSBmb2xkZXIgZG9lcyBub3QgZXhpc3QuIHJldHVybiBmYWxzZSBcclxuXHRcdGlmICghIGF3YWl0IEZpbGVIYW5kbGVyLmV4aXN0cyhmb2xkZXIpKXtcclxuXHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gaWYgdGhlIGZvbGRlciBkb2VzIG5vdCBleGlzdC4gcmV0dXJuIGZhbHNlIFxyXG5cdFx0aWYgKCEgYXdhaXQgRmlsZUhhbmRsZXIuZXhpc3RzKGZvbGRlcikpe1xyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBTZWUgaWYgdGhlIGZpbGUgZXhpc3RzLiBcclxuXHRcdGxldCBmaWxlcGF0aCA9IGZvbGRlciArICcvZGVzaWduZXIuanNvbic7XHJcblx0XHRhd2FpdCBGaWxlSGFuZGxlci5zYXZlRmlsZSggZmlsZXBhdGggLCBKU09OSGFuZGxlci5zZXJpYWxpemUoZGVzaWduZXIpICk7IFxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG4gXHJcblx0cHJpdmF0ZSBhc3luYyBsb2FkRm9sZGVyQW5kRmlsZXNSZWN1cnNpY2UoZm9sZGVyUGF0aCk6IFByb21pc2U8Y29tbWFuZFtdPntcclxuXHRcdFxyXG5cdFx0Ly8gZmlyc3QgY3JlYXRlIHRoaXMgZm9sZGVyXHJcblx0XHRsZXQgYyA6IGNvbW1hbmRbXSA9IFtdOyBcclxuXHJcblx0XHQvLyBsb2FkIGFsbCBmaWxlcyBpbiB0aGUgRm9sZGVyXHJcblx0XHRjb25zdCBjb250ZW50ID0gYXdhaXQgRmlsZUhhbmRsZXIubHNkaXIoZm9sZGVyUGF0aCk7XHJcblx0XHRsZXQgbWFwID0gYXdhaXQgUHJvbWlzZS5hbGwoIGNvbnRlbnQuZmlsZXMubWFwKGFzeW5jICggZiApID0+IHtcclxuXHRcdFx0cmV0dXJuIGF3YWl0IHRoaXMubG9hZEZpbGVBbmRDcmVhdGVDb21tYW5kKGYpO1xyXG5cdFx0fSkpIFx0XHJcblx0XHRtYXAuZm9yRWFjaCggcCA9PiB7XHJcblx0XHRcdGMucHVzaChwKTtcclxuXHRcdH0pXHJcblxyXG5cdFx0Ly8gbG9hZCBhbGwgZm9sZGVycyBpbiB0aGUgZm9sZGVyIFxyXG5cdFx0bGV0IG1hcDIgPSBhd2FpdCBQcm9taXNlLmFsbCggY29udGVudC5mb2xkZXJzLm1hcChhc3luYyAoIGYgKSA9PiB7XHJcblx0XHRcdHJldHVybiBhd2FpdCB0aGlzLmxvYWRGb2xkZXJBbmRGaWxlc1JlY3Vyc2ljZShmKTtcclxuXHRcdH0pKSBcdFxyXG5cdFx0bWFwMi5mb3JFYWNoKCBwID0+IHtcclxuXHRcdFx0cC5mb3JFYWNoKHEgPT4ge1xyXG5cdFx0XHRcdGMucHVzaChxKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KVxyXG5cdFx0XHJcblxyXG5cdFx0cmV0dXJuIGM7XHJcblx0fVxyXG5cdHByaXZhdGUgYXN5bmMgbG9hZEZpbGVBbmRDcmVhdGVDb21tYW5kKCBmaWxlcGF0aCApIDogUHJvbWlzZTxjb21tYW5kPntcclxuXHRcdGxldCBkYXRhID0gYXdhaXQgRmlsZUhhbmRsZXIucmVhZEZpbGUoZmlsZXBhdGgpO1xyXG5cdFx0cmV0dXJuIHsgXHJcblx0XHRcdGNvbW1hbmQ6J2ZpbGUnLFxyXG5cdFx0XHRwYXRoOmZpbGVwYXRoLFxyXG5cdFx0XHRjb250ZW50OmRhdGFcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cclxuXHRwdWJsaWMgYXN5bmMgbG9hZEJsb2NrVUlUZW1wbGF0ZSggKXtcclxuXHRcdFxyXG5cdFx0Y29uc3QgcGF0aCA9ICBQbHVnaW5IYW5kbGVyLlBMVUdJTl9ST09UICsgJy8nICsgUGx1Z2luSGFuZGxlci5CVUlMVElOX1VJU19GT0xERVJfTkFNRSArICcvJzsgXHJcblx0XHRsZXQgY29tbWFuZHMgOmNvbW1hbmRbXSA9IFtdO1xyXG5cclxuXHRcdC8vIGZpcnN0IHdlIGdldCB0aGUgdXBwZXIgZmlsZXMgaW4gdGhlIGZvbGRlciBcclxuXHRcdGxldCBleGlzdHMgPSBhd2FpdCBGaWxlSGFuZGxlci5leGlzdHMocGF0aClcclxuXHRcdGlmKCAhZXhpc3RzICl7XHJcblx0XHRcdHRocm93IG5ldyBFcnJvcignRmlsZSBmb3IgQmxvY2tVSSBoYXZlIGJlZW4gZGVsZXRlZC4gdGhpcyBmZWF0dXJlIGxvbmdlciB3b3JrcyBhcyBhIHJlc3VsdCcpXHJcblx0XHR9XHJcblx0XHQgIFxyXG5cdFx0Ly8gRklMRVMgQUREIFRPIENPTU1BTkRTIFxyXG5cdFx0Y29uc3QgY29udGVudCA9IGF3YWl0IEZpbGVIYW5kbGVyLmxzZGlyKHBhdGgpO1xyXG5cdFx0bGV0IG1hcCA9IGF3YWl0IFByb21pc2UuYWxsKCBjb250ZW50LmZpbGVzLm1hcChhc3luYyAoIGYgKSA9PiB7XHJcblx0XHRcdHJldHVybiBhd2FpdCB0aGlzLmxvYWRGaWxlQW5kQ3JlYXRlQ29tbWFuZChmKTtcclxuXHRcdH0pKSBcdCBcclxuXHRcdG1hcC5mb3JFYWNoKCBwID0+IHtcclxuXHRcdFx0aWYoIXAucGF0aC5lbmRzV2l0aChcIi9kZWNsYXJhdGlvbi50c1wiKSl7XHJcblx0XHRcdFx0bGV0IG4gOiBzdHJpbmcgPSAocC5wYXRoLnNwbGl0KCdCbG9ja1VJRGV2LycpLmxhc3QoKSApPz8gJyc7XHJcblx0XHRcdFx0cC5wYXRoID0gXCJzcmMvXCIgKyBuOyBcclxuXHRcdFx0XHRjb21tYW5kcy5wdXNoKHApO1xyXG5cdFx0XHR9XHJcblx0XHR9KSBcclxuXHRcdFxyXG5cdFx0Ly8gdGhlbiB3ZSBsb2FkIHNwZWNpZmlrIEZvbGRlcnMuIFxyXG5cdFx0bGV0IHBhdGhzcmMgPSBwYXRoICsgJy8nICsgJ3NyYy8nO1xyXG5cdFx0bGV0IG1hcDIgPSBhd2FpdCB0aGlzLmxvYWRGb2xkZXJBbmRGaWxlc1JlY3Vyc2ljZShwYXRoc3JjKTtcclxuXHRcdG1hcDIuZm9yRWFjaChwPT57IFxyXG5cdFx0XHRsZXQgbiA9IHAucGF0aC5zcGxpdCgnQmxvY2tVSURldi8nKS5sYXN0KCkgPz8gJyc7XHJcblx0XHRcdHAucGF0aCA9IG47XHJcblx0XHRcdGlmKG4gIT0gXCIvc3JjL1wiKXtcclxuXHRcdFx0XHRjb21tYW5kcy5wdXNoKHApO1xyXG5cdFx0XHR9XHJcblx0XHR9KSBcclxuXHRcdCBcclxuXHRcdHJldHVybiBjb21tYW5kcztcclxuXHR9XHJcblxyXG5cdHByaXZhdGUgYXN5bmMgbG9hZFVJTGF5b3V0KCBmb2xkZXJzcmMgOiBzdHJpbmcgLCBlcnJvcnMgOiBzdHJpbmdbXSA9IFtdKXtcclxuXHRcdGNvbnN0IHNyYyA9IGZvbGRlcnNyYyArICcvJyArIFBsdWdpbkhhbmRsZXIuU1lTVEVNX1VJX0xBWU9VVEZJTEVOQU1FIDtcclxuXHRcdGNvbnN0IGV4aXN0c1x0PSBhd2FpdCBGaWxlSGFuZGxlci5leGlzdHMoIHNyYyApO1xyXG5cdFx0aWYoIWV4aXN0cylcclxuXHRcdFx0cmV0dXJuIG51bGw7XHJcblxyXG5cdFx0Y29uc3QgZmlsZSA9IGF3YWl0IEZpbGVIYW5kbGVyLnJlYWRGaWxlKHNyYyk7XHJcblx0XHRsZXQgbW9kZWwgOiBVSUxheW91dE1vZGVsO1xyXG5cdFx0dHJ5IHtcclxuXHRcdFx0bW9kZWwgPSBKU09OSGFuZGxlci5kZXNlcmlhbGl6ZShVSUxheW91dE1vZGVsLGZpbGUpO1xyXG5cdFx0fWNhdGNoKGUpe1xyXG5cdFx0XHRlcnJvcnMucHVzaChlLm1lc3NhZ2UpO1xyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH1cclxuXHJcblx0XHRtb2RlbC5mb2xkZXJTcmMgPSBmb2xkZXJzcmM7XHJcblx0XHRhd2FpdCBtb2RlbC5pc1ZhbGlkKCk7XHJcblx0XHRyZXR1cm4gbW9kZWw7XHJcblx0fVxyXG5cdHB1YmxpYyBhc3luYyBnZXRBbGxCbG9ja1VJQXZhaWxhYmxlUHJldmlldyggc3lzIDogU3lzdGVtUHJldmlldyApe1xyXG5cdFx0Y29uc3QgVUlGb2xkZXJwYXRoID0gc3lzLmZvbGRlclBhdGggKyAnLycgKyBQbHVnaW5IYW5kbGVyLlNZU1RFTV9VSV9DT05UQUlORVJfRk9MREVSX05BTUU7XHJcblx0XHRjb25zdCBleGlzdHMgPSBhd2FpdCBGaWxlSGFuZGxlci5leGlzdHMoVUlGb2xkZXJwYXRoKVxyXG5cdFx0XHJcblx0XHRsZXQgbGF5b3V0cyA6IFVJTGF5b3V0TW9kZWxbXT1bXTtcclxuXHRcdGlmKCBleGlzdHMgKXtcclxuXHRcdFx0bGV0IGZvbGRlcnMgPSAoYXdhaXQgRmlsZUhhbmRsZXIubHNkaXIoVUlGb2xkZXJwYXRoKSkuZm9sZGVycztcclxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBmb2xkZXJzLmxlbmd0aDsgaSsrKSB7XHJcblx0XHRcdFx0Y29uc3QgZm9sZGVyID0gZm9sZGVyc1tpXTtcclxuXHRcdFx0XHRsZXQgbGF5b3V0ID0gYXdhaXQgdGhpcy5sb2FkVUlMYXlvdXQoZm9sZGVyKTtcclxuXHRcdFx0XHRpZihsYXlvdXQpXHJcblx0XHRcdFx0XHRsYXlvdXRzLnB1c2gobGF5b3V0KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGxheW91dHM7XHJcblx0fVxyXG5cclxuXHJcblxyXG5cclxuXHRcclxufSIsIlxyXG5pbXBvcnQgeyBNZXNzYWdlVHlwZXMsIHR5cGUgTWVzc2FnZVR5cGVUeXBlcyB9IGZyb20gXCIuLi9PYnNpZGlhblVJL1VJSW50ZXJmYWNlcy9EZXNpZ25lcjAxL0Jhc2VDb21wb25lbnRzL01lc3NhZ2VzL1N0YXRpY01lc3NhZ2VIYW5kbGVyLnN2ZWx0ZVwiO1xyXG5pbXBvcnQgdHlwZSB7IG1lc3NhZ2VMaXN0IH0gZnJvbSBcIi4uL09ic2lkaWFuVUkvVUlJbnRlcmZhY2VzL0Rlc2lnbmVyMDEvQmFzZUNvbXBvbmVudHMvTWVzc2FnZXMvbWVzc2FnZVwiO1xyXG5pbXBvcnQgeyBTdHJpbmdGdW5jdGlvbnMgfSBmcm9tIFwiLi4vT2JzaWRpYW5VSS9VSUludGVyZmFjZXMvRGVzaWduZXIwMS9CYXNlRnVuY3Rpb25zL3N0cmluZ2Z1bmN0aW9uc1wiO1xyXG5pbXBvcnQgdHlwZSB7IEFQSVJldHVybk1vZGVsIH0gZnJvbSBcIi4vQVBJUmV0dXJuTW9kZWxcIjsgXHJcbmltcG9ydCB7IFN5c3RlbVByZXZpZXcgfSBmcm9tIFwiLi9tb2RlbC9zeXN0ZW1QcmV2aWV3XCI7XHJcbmltcG9ydCB7IEZpbGVDb250ZXh0IH0gZnJvbSAnLi4vLi4vLi4vc3JjL01vZHVsZXMvT2JzaWRpYW5VSUNvcmUvZmlsZUNvbnRleHQnO1xyXG5pbXBvcnQgeyBUVFJQR1N5c3RlbUpTT05Gb3JtYXR0aW5nIH0gZnJvbSBcIi4uL0Rlc2lnbmVyL2luZGV4XCI7XHJcblxyXG5cclxuLy8gdG9kbyBhZGQgY29udmVydCBjb2RlIHRvIG1lc3NhZ2VcclxuZnVuY3Rpb24gY3JlYXRlUmVzcG9uc2U8VD4oIGNvZGUgOiBudW1iZXIgLCBtb2RlbDpUICwgbWVzc2FnZSA6IG1lc3NhZ2VMaXN0ICl7XHJcblx0cmV0dXJuIHtcclxuXHRcdHJlc3BvbnNlQ29kZTpjb2RlLFxyXG5cdFx0bWVzc2FnZXM6bWVzc2FnZSxcclxuXHRcdHJlc3BvbnNlOm1vZGVsLFxyXG5cdH0gYXMgQVBJUmV0dXJuTW9kZWw8VD47XHJcbn1cclxuZnVuY3Rpb24gY3JlYXRlTWVzc2FnZShrZXk6c3RyaW5nICxtc2c6c3RyaW5nLCB0eXBlOk1lc3NhZ2VUeXBlVHlwZXMpe1xyXG5cdGxldCBsaXN0ID0ge31cclxuXHRsaXN0W2tleV0gPSB7bXNnOm1zZywgdHlwZTp0eXBlfTtcclxuXHRyZXR1cm4gbGlzdDtcclxufVxyXG5cclxuXHJcbmV4cG9ydCBjbGFzcyBPYnNpZGlhblVJQ29yZUFQSSB7XHJcblxyXG5cdHByaXZhdGUgY29uc3RydWN0b3IoKXt9XHJcblx0cHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2UgOiBPYnNpZGlhblVJQ29yZUFQSTtcclxuXHRwdWJsaWMgc3RhdGljIGdldEluc3RhbmNlKCl7XHJcblx0XHRpZiAoIU9ic2lkaWFuVUlDb3JlQVBJLmluc3RhbmNlKXtcclxuXHRcdFx0T2JzaWRpYW5VSUNvcmVBUEkuaW5zdGFuY2UgPSBuZXcgT2JzaWRpYW5VSUNvcmVBUEkoKTtcclxuXHRcdH1cdFxyXG5cdFx0cmV0dXJuIE9ic2lkaWFuVUlDb3JlQVBJLmluc3RhbmNlO1xyXG5cdH1cclxuXHJcblx0cHVibGljIHN5c3RlbURlZmluaXRpb24gPSBuZXcgU3lzdGVtRGVmaW5pdGlvbk1hbmFnZW1lbnQoKTtcclxuXHRwdWJsaWMgc3lzdGVtRmFjdG9yeVx0PSBuZXcgU3lzdGVtRmFjdG9yeSgpO1xyXG5cdHB1YmxpYyBVSUltcG9ydEV4cG9ydCBcdD0gbmV3IFVJSW1wb3J0ZXJFeHBvdGVyKCk7XHJcblx0cHVibGljIHRlc3RzIFx0XHRcdD0gbmV3IFRlc3QoKTtcclxufVxyXG5cclxuXHJcblxyXG5cclxuY2xhc3MgU3lzdGVtRGVmaW5pdGlvbk1hbmFnZW1lbnR7XHJcblxyXG5cdHByaXZhdGUgYXN5bmMgcmVjdXJzaXZlRmluZE5ld0ZvbGRlck5hbWUoIGRlcHRoID0gMCwgbWF4RGVwdGggPSA1KSA6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4gIHtcclxuXHJcblx0XHRpZiAoZGVwdGggPT0gbWF4RGVwdGgpe1xyXG5cdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdH1cclxuXHJcblx0XHRsZXQgdXVpZCA9IFN0cmluZ0Z1bmN0aW9ucy51dWlkU2hvcnQoKTtcclxuXHRcdGlmIChhd2FpdCBGaWxlQ29udGV4dC5zeXN0ZW1EZWZpbml0aW9uRXhpc3RzSW5Gb2xkZXIodXVpZCkpe1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5yZWN1cnNpdmVGaW5kTmV3Rm9sZGVyTmFtZShkZXB0aCArIDEpO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHV1aWQ7XHJcblx0fVxyXG5cclxuXHRwcml2YXRlIGFzeW5jIGlzVmFsaWRTeXN0ZW1QcmV2aWV3KCBzeXMgOiBTeXN0ZW1QcmV2aWV3LCBpbnZhbGlkTWVzc2FnZXMgOiBtZXNzYWdlTGlzdCA9IHt9ICkgOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuXHRcdGxldCBpc1ZhbGlkID0gdHJ1ZTtcclxuXHRcdGNvbnN0IHN5c3RlbVByZXZpZXdWYWxpZGF0aW9uQ29kZSA9ICdzcHYnO1xyXG5cclxuXHRcdGxldCBfID0gJyc7IFxyXG5cdFx0Ly8gQXV0aG9yIFxyXG5cdFx0aWYgKCAhc3lzLmF1dGhvciAgKXtcdFxyXG5cdFx0XHRpbnZhbGlkTWVzc2FnZXNbc3lzdGVtUHJldmlld1ZhbGlkYXRpb25Db2RlKycxJ10gPSB7bXNnOidhIGF1dGhvciBpcyBub3QgcmVxdWlyZWQgYnV0IGhlbHBmdWxsIHRvIHVzZXJzJywgdHlwZTogIE1lc3NhZ2VUeXBlcy52ZXJib3NlIGFzIGFueSAgfSBcclxuXHRcdH1cclxuXHJcblx0XHQvLyBWZXJzaW9uIFxyXG5cdFx0aWYgKCAhc3lzLnZlcnNpb24gICl7XHRcclxuXHRcdFx0aW52YWxpZE1lc3NhZ2VzW3N5c3RlbVByZXZpZXdWYWxpZGF0aW9uQ29kZSsnMiddID0ge21zZzonYSB2ZXJzaW9uIGlzIG5vdCByZXF1aXJlZCBidXQgaGVscGZ1bGwgdG8gdXNlcnMnLCB0eXBlOiAgTWVzc2FnZVR5cGVzLnZlcmJvc2UgYXMgYW55ICB9ICBcclxuXHRcdH1cclxuXHJcblx0XHQvLyBTeXN0ZW1Db2RlTmFtZSBcclxuXHRcdGlmICggIXN5cy5zeXN0ZW1Db2RlTmFtZSAgKXtcdFxyXG5cdFx0XHRpc1ZhbGlkID0gZmFsc2U7ICBcclxuXHRcdFx0aW52YWxpZE1lc3NhZ2VzW3N5c3RlbVByZXZpZXdWYWxpZGF0aW9uQ29kZSsnMyddID0ge21zZzonRGlkIG5vdCBoYXZlIGEgc3lzdGVtQ29kZU5hbWUuXFxuIGNhbiBvbmx5IGNvbnRhaW4gcmVndWxhciBsZXR0ZXIgYW5kIG51bWJlcnMsIG5vIHNwZWNpYWwgY2hhcmFjdGVycyBvciB3aGl0ZXNwYWNlJywgdHlwZTogIE1lc3NhZ2VUeXBlcy5lcnJvciBhcyBhbnkgIH0gIFxyXG5cdFx0fWVsc2UgaWYgKCFTdHJpbmdGdW5jdGlvbnMuaXNWYWxpZFN5c3RlbUNvZGVOYW1lKHN5cy5zeXN0ZW1Db2RlTmFtZSkpe1xyXG5cdFx0XHRpc1ZhbGlkID0gZmFsc2U7ICBcclxuXHRcdFx0aW52YWxpZE1lc3NhZ2VzW3N5c3RlbVByZXZpZXdWYWxpZGF0aW9uQ29kZSsnNCddID0ge21zZzonRGlkIG5vdCBoYXZlIGEgdmFsaWQgc3lzdGVtQ29kZU5hbWUuXFxuIGNhbiBvbmx5IGNvbnRhaW4gcmVndWxhciBsZXR0ZXIgYW5kIG51bWJlcnMsIG5vIHNwZWNpYWwgY2hhcmFjdGVycyBvciB3aGl0ZXNwYWNlJywgdHlwZTogIE1lc3NhZ2VUeXBlcy5lcnJvciBhcyBhbnkgIH0gXHJcblx0XHR9XHJcblx0XHRlbHNlIGlmIChcclxuXHRcdFx0KEZpbGVDb250ZXh0LmdldEluc3RhbmNlKCkuYXZhaWxhYmxlU3lzdGVtcy5maW5kSW5kZXgoIHAgPT4gcC5zeXN0ZW1Db2RlTmFtZSA9PSBzeXMuc3lzdGVtQ29kZU5hbWUpKVxyXG5cdFx0XHQhPSBcclxuXHRcdFx0LTFcclxuXHRcdCl7XHJcblx0XHRcdGlzVmFsaWQgPSBmYWxzZTsgXHJcblx0XHRcdGludmFsaWRNZXNzYWdlc1tzeXN0ZW1QcmV2aWV3VmFsaWRhdGlvbkNvZGUrJ2QxJ10gPSB7bXNnOidzaGFyZXMgQ29kZW5hbWUgd2l0aCBhbm90aGVyIHN5c3RlbScsIHR5cGU6ICBNZXNzYWdlVHlwZXMuZXJyb3IgYXMgYW55ICB9XHJcblx0XHR9XHJcblxyXG5cdFx0Ly8gU3lzdGVtTmFtZSBObyBcXG4gY2hhcmFjdGVycy5cclxuXHRcdGlmICggIXN5cy5zeXN0ZW1OYW1lICApe1x0XHJcblx0XHRcdGlzVmFsaWQgPSBmYWxzZTsgIFxyXG5cdFx0XHRpbnZhbGlkTWVzc2FnZXNbc3lzdGVtUHJldmlld1ZhbGlkYXRpb25Db2RlKyc1J10gPSB7bXNnOidEaWQgbm90IGhhdmUgYSBzeXN0ZW0gbmFtZS4nLCB0eXBlOiAgTWVzc2FnZVR5cGVzLmVycm9yIGFzIGFueSAgfSAgXHJcblx0XHR9ZWxzZSBpZiAoIVN0cmluZ0Z1bmN0aW9ucy5pc1ZhbGlkV2luZG93c0ZpbGVTdHJpbmcoc3lzLnN5c3RlbU5hbWUpKXtcclxuXHRcdFx0aXNWYWxpZCA9IGZhbHNlOyAgXHJcblx0XHRcdGludmFsaWRNZXNzYWdlc1tzeXN0ZW1QcmV2aWV3VmFsaWRhdGlvbkNvZGUrJzYnXSA9IHttc2c6J0RpZCBub3QgaGF2ZSBhIHZhbGlkIHN5c3RlbSBuYW1lLicsIHR5cGU6ICBNZXNzYWdlVHlwZXMuZXJyb3IgYXMgYW55ICB9ICBcclxuXHRcdH1cclxuXHRcdGVsc2UgaWYgKFxyXG5cdFx0XHQoRmlsZUNvbnRleHQuZ2V0SW5zdGFuY2UoKS5hdmFpbGFibGVTeXN0ZW1zLmZpbmRJbmRleCggcCA9PiBwLnN5c3RlbU5hbWUgPT0gc3lzLnN5c3RlbU5hbWUpKVxyXG5cdFx0XHQhPSBcclxuXHRcdFx0LTFcclxuXHRcdCl7XHJcblx0XHRcdGlzVmFsaWQgPSBmYWxzZTsgXHJcblx0XHRcdGludmFsaWRNZXNzYWdlc1tzeXN0ZW1QcmV2aWV3VmFsaWRhdGlvbkNvZGUrJ2QyJ10gPSB7bXNnOidzaGFyZXMgbmFtZSB3aXRoIGFub3RoZXIgc3lzdGVtJywgdHlwZTogIE1lc3NhZ2VUeXBlcy5lcnJvciBhcyBhbnkgIH1cclxuXHRcdH1cclxuXHJcblx0XHQvLyBmb2xkZXIgb25seSBhbGxvdyB3aW5kb3dzIGZvbGRlciBuYW1lIGFjY2VwdGVkIGZvbGRlciBuYW1lcy5cclxuXHRcdGlmICggIXN5cy5mb2xkZXJOYW1lICApe1x0XHJcblxyXG5cdFx0XHRsZXQgbmV3Rm9sZGVybmFtZSA9IGF3YWl0IHRoaXMucmVjdXJzaXZlRmluZE5ld0ZvbGRlck5hbWUoMCw1KTtcclxuXHRcdFx0aWYgKCFuZXdGb2xkZXJuYW1lKXtcclxuXHRcdFx0XHRpbnZhbGlkTWVzc2FnZXNbc3lzdGVtUHJldmlld1ZhbGlkYXRpb25Db2RlKyc3J10gPSB7bXNnOidBIG5ldyBmb2xkZXIgbmFtZSBpcyByZXF1aXJlZCwgTXVzdCBiZSB1bmlxdWUuJywgdHlwZTogIE1lc3NhZ2VUeXBlcy5lcnJvciBhcyBhbnkgIH0gICBcclxuXHRcdFx0fWVsc2V7XHJcblx0XHRcdFx0c3lzLmZvbGRlck5hbWUgPSBuZXdGb2xkZXJuYW1lLy9cclxuXHRcdFx0XHRpbnZhbGlkTWVzc2FnZXNbc3lzdGVtUHJldmlld1ZhbGlkYXRpb25Db2RlKyc4J10gPSB7bXNnOidEaWQgbm90IGhhdmUgYSBmb2xkZXIgbmFtZSBzbyBjcmVhdGVkIG9uZS4nLCB0eXBlOiAgTWVzc2FnZVR5cGVzLnZlcmJvc2UgYXMgYW55ICB9ICAgXHJcblx0XHRcdH1cclxuXHRcdH0gXHJcblx0XHRlbHNlIGlmICghU3RyaW5nRnVuY3Rpb25zLmlzVmFsaWRXaW5kb3dzRmlsZVN0cmluZyhzeXMuZm9sZGVyTmFtZSkpeyBcclxuXHRcdFx0aXNWYWxpZCA9IGZhbHNlOyAgXHJcblx0XHRcdGludmFsaWRNZXNzYWdlc1tzeXN0ZW1QcmV2aWV3VmFsaWRhdGlvbkNvZGUrJzknXSA9IHttc2c6J2ZvbGRlciBuYW1lIHdhcyBub3QgdmFsaWQgd2luZG93cyBmb2xkZXIgbmFtZS4nLCB0eXBlOiAgTWVzc2FnZVR5cGVzLmVycm9yIGFzIGFueSAgfSAgIFxyXG5cdFx0fSBcclxuXHRcdGVsc2UgaWYgKFxyXG5cdFx0XHQoRmlsZUNvbnRleHQuZ2V0SW5zdGFuY2UoKS5hdmFpbGFibGVTeXN0ZW1zLmZpbmRJbmRleCggcCA9PiBwLmZvbGRlclBhdGguZW5kc1dpdGgoJy8nICsgc3lzLmZvbGRlck5hbWUpKSlcclxuXHRcdFx0IT0gXHJcblx0XHRcdC0xXHJcblx0XHQpe1xyXG5cdFx0XHRpc1ZhbGlkID0gZmFsc2U7ICBcclxuXHRcdFx0aW52YWxpZE1lc3NhZ2VzW3N5c3RlbVByZXZpZXdWYWxpZGF0aW9uQ29kZSsnZDMnXSA9IHttc2c6J2ZvbGRlciBuYW1lIHdhcyBhbHJlYWR5IHVzZWQsIHlvdSBtdXN0IHVzZSBhbm90aGVyLCBvciB1c2UgYW4gb3ZlcndyaXRlIGZlYXR1cmUuJywgdHlwZTogIE1lc3NhZ2VUeXBlcy5lcnJvciBhcyBhbnkgIH1cclxuXHRcdH1cclxuXHJcblx0XHRpZiAoaXNWYWxpZCl7XHJcblx0XHRcdGludmFsaWRNZXNzYWdlc1tzeXN0ZW1QcmV2aWV3VmFsaWRhdGlvbkNvZGUrJ09LJ10gPSB7bXNnOidBbGwgaXMgR29vZC4nLCB0eXBlOiAgTWVzc2FnZVR5cGVzLmdvb2QgYXMgYW55ICB9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gaXNWYWxpZDtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBhc3luYyB2YWxpZGF0ZVN5c3RlbSggc3lzIDogU3lzdGVtUHJldmlldyApe1xyXG5cdFx0bGV0IG1lc3NhZ2VzIDogbWVzc2FnZUxpc3QgPSB7fTtcclxuXHRcdHRyeXtcclxuXHRcdFx0aWYgKCAhYXdhaXQgdGhpcy5pc1ZhbGlkU3lzdGVtUHJldmlldyhzeXMsIG1lc3NhZ2VzKSApe1xyXG5cdFx0XHRcdHJldHVybiBjcmVhdGVSZXNwb25zZSg0MDYsZmFsc2UsbWVzc2FnZXMgKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gY3JlYXRlUmVzcG9uc2UoMjAwLHRydWUsbWVzc2FnZXMgKTtcclxuXHRcdH1cclxuXHRcdGNhdGNoIChlKXtcclxuXHRcdFx0bWVzc2FnZXNbJ2V4Y2VwdGlvbiddID0ge21zZzplLm1lc3NhZ2UgLCB0eXBlOidlcnJvcid9O1xyXG5cdFx0XHRyZXR1cm4gY3JlYXRlUmVzcG9uc2UoNTAwLG51bGwsbWVzc2FnZXMgKTtcclxuXHRcdH0gXHJcblx0fVxyXG5cclxuXHRwdWJsaWMgYXN5bmMgQ3JlYXRlTmV3U3lzdGVtKCBzeXMgOiBTeXN0ZW1QcmV2aWV3ICkgOiBQcm9taXNlPEFQSVJldHVybk1vZGVsPFN5c3RlbVByZXZpZXd8bnVsbD4+IHtcclxuXHRcdGxldCBtZXNzYWdlcyA6IG1lc3NhZ2VMaXN0ID0ge307XHJcblx0XHR0cnl7XHJcblx0XHRcdGlmICggIWF3YWl0IHRoaXMuaXNWYWxpZFN5c3RlbVByZXZpZXcoc3lzLCBtZXNzYWdlcykgKXtcclxuXHRcdFx0XHRyZXR1cm4gY3JlYXRlUmVzcG9uc2UoNDA2LG51bGwsbWVzc2FnZXMgKTtcclxuXHRcdFx0fVxyXG5cdFx0XHJcblx0XHRcdGxldCBjcmVhdGVkQW5kUmVsb2FkZWQgPSBhd2FpdCBGaWxlQ29udGV4dC5jcmVhdGVTeXN0ZW1EZWZpbml0aW9uKCBzeXMgKTtcclxuXHRcdFx0aWYgKGNyZWF0ZWRBbmRSZWxvYWRlZCl7XHJcblx0XHRcdFx0cmV0dXJuIGNyZWF0ZVJlc3BvbnNlKDIwMCxjcmVhdGVkQW5kUmVsb2FkZWQsbWVzc2FnZXMgKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gY3JlYXRlUmVzcG9uc2UoNDA2LG51bGwsbWVzc2FnZXMgKTtcclxuXHRcdH1cclxuXHRcdGNhdGNoIChlKXtcclxuXHRcdFx0bWVzc2FnZXNbJ2V4Y2VwdGlvbiddID0ge21zZzplLm1lc3NhZ2UgLCB0eXBlOidlcnJvcid9O1xyXG5cdFx0XHRyZXR1cm4gY3JlYXRlUmVzcG9uc2UoNTAwLG51bGwsbWVzc2FnZXMgKTtcclxuXHRcdH0gXHJcblx0fVxyXG5cclxuXHRwdWJsaWMgYXN5bmMgQ29weVN5c3RlbSggZnJvbSA6IFN5c3RlbVByZXZpZXcsIHRvIDogU3lzdGVtUHJldmlldykgOiBQcm9taXNlPEFQSVJldHVybk1vZGVsPFN5c3RlbVByZXZpZXd8bnVsbD4+IHtcclxuXHRcdGxldCBtZXNzYWdlcyA6IG1lc3NhZ2VMaXN0ID0ge307XHJcblx0XHR0cnl7XHJcblx0XHRcdGlmICggIWF3YWl0IHRoaXMuaXNWYWxpZFN5c3RlbVByZXZpZXcodG8sIG1lc3NhZ2VzKSApe1xyXG5cdFx0XHRcdHJldHVybiBjcmVhdGVSZXNwb25zZSg0MDYsbnVsbCxtZXNzYWdlcyApO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRsZXQgc2F2ZWRBbmRSZWxvYWRlZCA9IGF3YWl0IEZpbGVDb250ZXh0LmNvcHlTeXN0ZW1EZWZpbml0aW9uKCBmcm9tICwgdG8gKTtcclxuXHRcdFx0aWYgKHNhdmVkQW5kUmVsb2FkZWQpe1xyXG5cdFx0XHRcdHJldHVybiBjcmVhdGVSZXNwb25zZSgyMDAsc2F2ZWRBbmRSZWxvYWRlZCxtZXNzYWdlcyApO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBjcmVhdGVSZXNwb25zZSg0MDYsbnVsbCxtZXNzYWdlcyApO1xyXG5cdFx0fVxyXG5cdFx0Y2F0Y2ggKGUpe1xyXG5cdFx0XHRtZXNzYWdlc1snZXhjZXB0aW9uJ10gPSB7bXNnOmUubWVzc2FnZSAsIHR5cGU6J2Vycm9yJ307XHJcblx0XHRcdHJldHVybiBjcmVhdGVSZXNwb25zZSg1MDAsbnVsbCxtZXNzYWdlcyApO1xyXG5cdFx0fSBcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBhc3luYyBEZWxldGVzeXN0ZW0oIHN5cyA6IFN5c3RlbVByZXZpZXcgKSA6IFByb21pc2U8QVBJUmV0dXJuTW9kZWw8Ym9vbGVhbj4+IHtcclxuXHRcdHJldHVybiBjcmVhdGVSZXNwb25zZSg1MDEsZmFsc2Use30gKTtcclxuXHR9XHJcblxyXG5cdHB1YmxpYyBhc3luYyBFZGl0U3lzdGVtKCBzeXMgOiBTeXN0ZW1QcmV2aWV3ICkgOiBQcm9taXNlPEFQSVJldHVybk1vZGVsPFN5c3RlbVByZXZpZXd8bnVsbD4+e1xyXG5cdFx0cmV0dXJuIGNyZWF0ZVJlc3BvbnNlKDUwMSxudWxsLHt9ICk7XHJcblx0fVxyXG5cclxuXHRwdWJsaWMgYXN5bmMgZ2V0QWxsU3lzdGVtcygpIDogUHJvbWlzZTxBUElSZXR1cm5Nb2RlbDxTeXN0ZW1QcmV2aWV3W118bnVsbD4+e1xyXG5cdFx0bGV0IG1lc3NhZ2VzIDogbWVzc2FnZUxpc3QgPSB7fTtcclxuXHRcdHRyeXtcclxuXHRcdFx0bGV0IGZpbGVDb250ZXh0ID0gRmlsZUNvbnRleHQuZ2V0SW5zdGFuY2UoKTtcclxuXHRcdFx0YXdhaXQgZmlsZUNvbnRleHQubG9hZEFsbEF2YWlsYWJsZUZpbGVzKCBtZXNzYWdlcyApOyBcclxuXHRcdFx0bGV0IHByZXZpZXdzID0gZmlsZUNvbnRleHQuYXZhaWxhYmxlU3lzdGVtcyA/PyBbXTtcdFxyXG5cdFx0XHRyZXR1cm4gY3JlYXRlUmVzcG9uc2UoMjAwLHByZXZpZXdzLG1lc3NhZ2VzICk7XHJcblx0XHR9XHJcblx0XHRjYXRjaCAoZSl7XHJcblx0XHRcdG1lc3NhZ2VzWydleGNlcHRpb24nXSA9IHttc2c6ZS5tZXNzYWdlICwgdHlwZTonZXJyb3InfTtcclxuXHRcdFx0cmV0dXJuIGNyZWF0ZVJlc3BvbnNlKDUwMCxudWxsLG1lc3NhZ2VzICk7XHJcblx0XHR9IFxyXG5cdH1cclxufVxyXG5cclxuY2xhc3MgU3lzdGVtRmFjdG9yeXtcclxuXHRwdWJsaWMgYXN5bmMgZ2V0T3JDcmVhdGVTeXN0ZW1GYWN0b3J5KCBwcmV2aWV3IDogU3lzdGVtUHJldmlldyApIDogUHJvbWlzZTxBUElSZXR1cm5Nb2RlbDxUVFJQR1N5c3RlbUpTT05Gb3JtYXR0aW5nfG51bGw+PiB7XHJcblx0XHRcclxuXHRcdGlmICghcHJldmlldy5mb2xkZXJQYXRoKXtcclxuXHRcdFx0cmV0dXJuIGNyZWF0ZVJlc3BvbnNlKDQwNixudWxsLGNyZWF0ZU1lc3NhZ2UoJ2dldE9yQ3JlYXRlU3lzdGVtRmFjdG9yeTEnLCdzeXN0ZW1QcmV2aWV3IHdhcyBpbnZhbGlkJywgJ2Vycm9yJykpO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBmaWxlQ29udGVudCA9IEZpbGVDb250ZXh0LmdldEluc3RhbmNlKCk7XHJcblx0XHRsZXQgZGVzaWduZXIgPSBhd2FpdCBmaWxlQ29udGVudC5nZXRPckNyZWF0ZVN5c3RlbXNEZXNpZ25zKCBwcmV2aWV3LmZvbGRlclBhdGggKTtcclxuXHRcdGlmIChkZXNpZ25lcil7XHJcblx0XHRcdHJldHVybiAgY3JlYXRlUmVzcG9uc2UoMjAwLCBkZXNpZ25lciwgY3JlYXRlTWVzc2FnZSgnZ2V0T3JDcmVhdGVTeXN0ZW1GYWN0b3J5JywnU3lzdGVtIERlc2lnbmVyIExvYWRlZCcsJ2dvb2QnKSApO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIGNyZWF0ZVJlc3BvbnNlKDUwMCwgbnVsbCAsIGNyZWF0ZU1lc3NhZ2UoJ2dldE9yQ3JlYXRlU3lzdGVtRmFjdG9yeScsJ1NvbWV0aGluZyB3ZW50IHdyb25nIGxvYWRpbmcgdGhlIGZpbGUnLCdlcnJvcicpICk7XHJcblx0fVxyXG5cdHB1YmxpYyBhc3luYyBzYXZlU3lzdGVtRGVzaWduZXIoIHByZXZpZXcgOiBTeXN0ZW1QcmV2aWV3ICwgZGVzaWduZXIgOiBUVFJQR1N5c3RlbUpTT05Gb3JtYXR0aW5nICl7XHJcblxyXG5cdFx0aWYgKCFwcmV2aWV3LmZvbGRlclBhdGgpe1xyXG5cdFx0XHRyZXR1cm4gY3JlYXRlUmVzcG9uc2UoNDA2LG51bGwsY3JlYXRlTWVzc2FnZSgnc2F2ZVN5c3RlbUZhY3RvcnkxJywnc3lzdGVtUHJldmlldyB3YXMgaW52YWxpZCcsICdlcnJvcicpKTtcclxuXHRcdH1cclxuXHJcblx0XHRpZiAoICFkZXNpZ25lci5pc1ZhbGlkKCkgKXtcclxuXHRcdFx0cmV0dXJuIGNyZWF0ZVJlc3BvbnNlKDQwNixudWxsLGNyZWF0ZU1lc3NhZ2UoJ3NhdmVTeXN0ZW1GYWN0b3J5MScsJ3N5c3RlbSBEZXNpZ25lciB2YWxpZGF0ZWQgdG8gaW52YWxpZC4gJywgJ2Vycm9yJykpO1xyXG5cdFx0fVxyXG5cclxuXHJcblx0XHRsZXQgZmlsZUNvbnRlbnQgPSBGaWxlQ29udGV4dC5nZXRJbnN0YW5jZSgpO1xyXG5cdFx0aWYgKGF3YWl0IGZpbGVDb250ZW50LnNhdmVTeXN0ZW1zRGVzaWducyggcHJldmlldy5mb2xkZXJQYXRoLCBkZXNpZ25lciApKXtcclxuXHRcdFx0cmV0dXJuIGNyZWF0ZVJlc3BvbnNlKDIwMCwgbnVsbCAsIGNyZWF0ZU1lc3NhZ2UoJ3NhdmVTeXN0ZW1GYWN0b3J5MScsJ3NhdmVkIGRlc2lnbmVyJywnZ29vZCcpICk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gY3JlYXRlUmVzcG9uc2UoNTAwLCBudWxsICwgY3JlYXRlTWVzc2FnZSgnc2F2ZVN5c3RlbUZhY3RvcnkxJywnU29tZXRoaW5nIHdlbnQgd3JvbmcgbG9hZGluZyB0aGUgZmlsZScsJ2Vycm9yJykgKTtcclxuXHR9XHJcblx0cHVibGljIGFzeW5jIGRlbGV0ZVN5c3RlbUZhY3RvcnkoKXt9XHJcbn1cclxuXHJcblxyXG5cclxuY2xhc3MgVUlJbXBvcnRlckV4cG90ZXJ7XHJcblx0cHVibGljIGFzeW5jIGxvYWRCbG9ja1VJRm9yRXhwb3J0KCl7XHJcblxyXG5cdFx0bGV0IG1lc3NhZ2VzIDogbWVzc2FnZUxpc3QgPSB7fTtcclxuXHRcdHRyeXsgIFxyXG5cdFx0XHRsZXQgYmxvY2tVSUZpbGVzUmVzcG9uc2UgPSBhd2FpdCBGaWxlQ29udGV4dC5nZXRJbnN0YW5jZSgpLmxvYWRCbG9ja1VJVGVtcGxhdGUoKTs7XHJcblx0XHRcdHJldHVybiBjcmVhdGVSZXNwb25zZSgyMDAsYmxvY2tVSUZpbGVzUmVzcG9uc2UsIHt9ICk7XHJcblx0XHR9XHJcblx0XHRjYXRjaCAoZSl7XHJcblx0XHRcdG1lc3NhZ2VzWydFcnJvciddPSh7bXNnOmUubWVzc2FnZSAsIHR5cGU6J2Vycm9yJ30pO1xyXG5cdFx0XHRyZXR1cm4gY3JlYXRlUmVzcG9uc2UoMzAwLFtdLG1lc3NhZ2VzICk7XHJcblx0XHR9IFxyXG5cdH1cclxuXHRcclxuXHRwdWJsaWMgYXN5bmMgZ2V0QWxsQXZhaWxhYmxlVUlzRm9yU3lzdGVtKCBzeXMgOiBTeXN0ZW1QcmV2aWV3ICl7XHJcblx0XHRsZXQgbWVzc2FnZXMgOiBtZXNzYWdlTGlzdCA9IHt9O1xyXG5cdFx0dHJ5e1xyXG5cdFx0XHRsZXQgZmlsZUNvbnRleHQgPSBGaWxlQ29udGV4dC5nZXRJbnN0YW5jZSgpO1xyXG5cdFx0XHRsZXQgbGF5b3V0cyA9IGF3YWl0IGZpbGVDb250ZXh0LmdldEFsbEJsb2NrVUlBdmFpbGFibGVQcmV2aWV3KCBzeXMgKTtcclxuXHRcdFx0cmV0dXJuIGNyZWF0ZVJlc3BvbnNlKDIwMCxsYXlvdXRzLG1lc3NhZ2VzICk7XHJcblx0XHR9XHJcblx0XHRjYXRjaCAoZSl7XHJcblx0XHRcdG1lc3NhZ2VzWydleGNlcHRpb24nXSA9IHttc2c6ZS5tZXNzYWdlICwgdHlwZTonZXJyb3InfTtcclxuXHRcdFx0cmV0dXJuIGNyZWF0ZVJlc3BvbnNlKDUwMCxudWxsLG1lc3NhZ2VzICk7XHJcblx0XHR9IFxyXG5cdH0gXHJcbn1cclxuXHJcblxyXG5cclxuY2xhc3MgVGVzdHtcclxuXHJcblx0cHVibGljIGFzeW5jIENhbGxUZXN0RXJyb3IoIGVycm9yQ29kZSA9IDMwMCAgKXtcclxuXHRcdFxyXG5cdFx0bGV0IG1lc3NhZ2VzIDogbWVzc2FnZUxpc3QgPSB7fTtcclxuXHRcdG1lc3NhZ2VzWydFcnJvcjAnXT0oe21zZzonVGVzdCBNZXNzYWdlIDEnLCB0eXBlOidlcnJvcid9KTtcclxuXHRcdG1lc3NhZ2VzWydFcnJvcjEnXT0oe21zZzonVGVzdCBNZXNzYWdlIDInLCB0eXBlOid2ZXJib3NlJ30pO1xyXG5cdFx0bWVzc2FnZXNbJ0Vycm9yMiddPSh7bXNnOidUZXN0IE1lc3NhZ2UgMycsIHR5cGU6J2dvb2QnfSk7XHJcblxyXG5cclxuXHRcdHJldHVybiBjcmVhdGVSZXNwb25zZShlcnJvckNvZGUsW10sbWVzc2FnZXMgKTtcclxuXHR9XHJcbn0iLCI8c2NyaXB0IGxhbmc9XCJ0c1wiPlxyXG4gICAgaW1wb3J0IHsgb25Nb3VudCB9IGZyb20gXCJzdmVsdGVcIjtcclxuXHJcblxyXG5cdGltcG9ydCBFZGl0QWJsZUxpc3QgZnJvbSBcIi4uLy4uL0NvbXBvbmVudHMvZWRpdEFibGVMaXN0L0VkaXRBYmxlTGlzdC5zdmVsdGVcIjtcclxuICAgIGltcG9ydCB7IE9ic2lkaWFuVUlDb3JlQVBJIH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9Nb2R1bGVzL09ic2lkaWFuVUlDb3JlL0FQSVwiO1xyXG4gICAgaW1wb3J0IFN0YXRpY01lc3NhZ2VIYW5kbGVyIGZyb20gXCIuLi8uLi9Db21wb25lbnRzL01lc3NhZ2VzL1N0YXRpY01lc3NhZ2VIYW5kbGVyLnN2ZWx0ZVwiO1xyXG4gICAgaW1wb3J0IHsgU3lzdGVtUHJldmlldyB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvTW9kdWxlcy9PYnNpZGlhblVJQ29yZS9tb2RlbC9zeXN0ZW1QcmV2aWV3XCI7XHJcbiAgICBpbXBvcnQgeyBXcml0YWJsZSwgd3JpdGFibGUgfSBmcm9tIFwic3ZlbHRlL3N0b3JlXCI7XHJcbiAgICBpbXBvcnQgeyBUVFJQR1N5c3RlbUpTT05Gb3JtYXR0aW5nIH0gZnJvbSBcIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9Nb2R1bGVzL0Rlc2lnbmVyXCI7XHJcbiAgICBpbXBvcnQgeyBmYWRlLCBzbGlkZSB9IGZyb20gXCJzdmVsdGUvdHJhbnNpdGlvblwiO1xyXG5cclxuXHQvL2xldCBtZXNzYWdlSGFuZGxlciA6IFN0YXRpY01lc3NhZ2VIYW5kbGVyO1xyXG5cdGV4cG9ydCBsZXQgYWN0aXZlU3lzdGVtIDogVFRSUEdTeXN0ZW1KU09ORm9ybWF0dGluZyA9IG5ldyBUVFJQR1N5c3RlbUpTT05Gb3JtYXR0aW5nKCk7XHJcblx0bGV0IGF2YWlsU3lzdGVtcyA6IFdyaXRhYmxlPFN5c3RlbVByZXZpZXdbXT4gPSB3cml0YWJsZShbXSk7XHJcblx0Y29uc3QgbnVsbHByZXZpZXcgPSBuZXcgU3lzdGVtUHJldmlldygpO1xyXG5cdGxldCBhY3RpdmVQcmV2aWV3OiBTeXN0ZW1QcmV2aWV3ID0gbnVsbHByZXZpZXc7XHJcblx0bGV0IHVua25vd25TdHJpbmcgPSAndW5rbm93bic7XHJcblxyXG4gXHJcblx0b25Nb3VudCggYXN5bmMgKCkgPT4ge1xyXG5cdFx0bGV0IHJlcSA9IGF3YWl0IE9ic2lkaWFuVUlDb3JlQVBJLmdldEluc3RhbmNlKCkuc3lzdGVtRGVmaW5pdGlvbi5nZXRBbGxTeXN0ZW1zKCk7XHJcblx0XHRpZihyZXEucmVzcG9uc2VDb2RlICE9IDIwMCl7XHJcblx0XHRcdE9iamVjdC5rZXlzKHJlcS5tZXNzYWdlcykuZm9yRWFjaCgga2V5ICA9PiB7XHJcblx0XHRcdFx0Y29uc3QgbXNnID0gcmVxLm1lc3NhZ2VzW2tleV07XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRhdmFpbFN5c3RlbXMuc2V0KHJlcS5yZXNwb25zZSA/PyBbXSApO1xyXG5cdFx0Y29uc29sZS5sb2coJGF2YWlsU3lzdGVtcylcclxuXHR9KVxyXG5cclxuXHRhc3luYyBmdW5jdGlvbiBsb2Fkc3lzdGVtKHByZXZpZXcpeyBcclxuXHRcdGxldCByZXEgPSBhd2FpdCBPYnNpZGlhblVJQ29yZUFQSS5nZXRJbnN0YW5jZSgpLnN5c3RlbUZhY3RvcnkuZ2V0T3JDcmVhdGVTeXN0ZW1GYWN0b3J5KHByZXZpZXcpO1xyXG5cdFx0aWYocmVxLnJlc3BvbnNlQ29kZSAhPSAyMDAgfHwgIXJlcS5yZXNwb25zZSl7XHJcblx0XHRcdE9iamVjdC5rZXlzKHJlcS5tZXNzYWdlcykuZm9yRWFjaCgga2V5ICA9PiB7XHJcblx0XHRcdFx0Y29uc3QgbXNnID0gcmVxLm1lc3NhZ2VzW2tleV07XHJcblx0XHRcdH0pO1xyXG5cdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHR9IFxyXG5cdFx0YWN0aXZlU3lzdGVtID0gcmVxLnJlc3BvbnNlOyBcclxuXHR9XHJcblx0ZnVuY3Rpb24gbG9hZFByZXZpZXcocHJldmlldyl7XHJcblx0XHRhY3RpdmVQcmV2aWV3ID0gcHJldmlld1xyXG5cdH1cclxuXHRmdW5jdGlvbiB1bmxvYWRQcmV2aWV3KCl7XHJcblx0XHRhY3RpdmVQcmV2aWV3ID0gbnVsbHByZXZpZXdcclxuXHR9XHJcblx0ZnVuY3Rpb24gb25TZWxlY3RTeXN0ZW0oIGQgKXtcclxuXHJcblx0XHRjb25zdCBwcmUgPSAkYXZhaWxTeXN0ZW1zLmZpbmQoIHAgPT4gcC5zeXN0ZW1Db2RlTmFtZSA9PSBkKTtcclxuXHRcdGNvbnNvbGUubG9nKHByZSk7XHJcblx0XHRpZihhY3RpdmVQcmV2aWV3ID09IHByZSl7XHJcblx0XHRcdGFjdGl2ZVByZXZpZXcgPSBudWxscHJldmlldztcclxuXHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxvYWRQcmV2aWV3KHByZSk7XHJcblx0XHRyZXR1cm4gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdC8vQHRzLWlnbm9yZSBUaGlzIGlzIGZvciByZW5kZXJpbmcgdGhlIHVua25vd24gc3RybmlnXHJcblx0bnVsbHByZXZpZXcuaXNFZGl0YWJsZSA9IG51bGw7XHJcblxyXG48L3NjcmlwdD5cclxuXHJcbjxkaXYgY2xhc3M9XCJNYWluQXBwQ29udGFpbmVyUGFnZSBNYWluQXBwQ29udGFpbmVyUGFnZVN5c3RlbVwiPlxyXG5cdCBcclxuXHQ8c2VjdGlvbj5cclxuXHRcdDxkaXYgY2xhc3M9XCJ0YWJsZSBTeXN0ZW1QcmV2aWV3ZXJcIiBkYXRhLWlzLWVkaXQ9eyBmYWxzZSB9IHRyYW5zaXRpb246ZmFkZT5cclxuXHRcdFx0PGRpdiBjbGFzcz1cInRhYmxlUm93XCI+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInRhYmxlUm93Q29sdW1uXCI+QXV0aG9yPC9kaXY+IFxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJ0YWJsZVJvd0NvbHVtblwiID57YWN0aXZlUHJldmlldz8uYXV0aG9yID8/IHVua25vd25TdHJpbmd9PC9kaXY+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwidGFibGVSb3dcIj5cclxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwidGFibGVSb3dDb2x1bW5cIj5WZXJzaW9uPC9kaXY+IFxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJ0YWJsZVJvd0NvbHVtblwiID57YWN0aXZlUHJldmlldz8udmVyc2lvbiA/PyB1bmtub3duU3RyaW5nfTwvZGl2PlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cInRhYmxlUm93XCI+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInRhYmxlUm93Q29sdW1uXCI+U3lzdGVtQ29kZU5hbWU8L2Rpdj4gXHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInRhYmxlUm93Q29sdW1uXCIgPnthY3RpdmVQcmV2aWV3Py5zeXN0ZW1Db2RlTmFtZSA/PyB1bmtub3duU3RyaW5nfTwvZGl2PlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cInRhYmxlUm93XCI+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInRhYmxlUm93Q29sdW1uXCI+ZWRpdGFibGU8L2Rpdj4gXHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInRhYmxlUm93Q29sdW1uXCIgPnthY3RpdmVQcmV2aWV3Py5pc0VkaXRhYmxlID8/IHVua25vd25TdHJpbmd9PC9kaXY+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0XHQ8ZGl2IGNsYXNzPVwidGFibGVSb3dcIj5cclxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwidGFibGVSb3dDb2x1bW5cIj5TeXN0ZW1OYW1lPC9kaXY+IFxyXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJ0YWJsZVJvd0NvbHVtblwiID57YWN0aXZlUHJldmlldz8uc3lzdGVtTmFtZSA/PyB1bmtub3duU3RyaW5nfTwvZGl2PlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cInRhYmxlUm93XCI+XHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInRhYmxlUm93Q29sdW1uXCI+Zm9sZGVyIG5hbWU8L2Rpdj4gXHJcblx0XHRcdFx0PGRpdiBjbGFzcz1cInRhYmxlUm93Q29sdW1uXCIgPnthY3RpdmVQcmV2aWV3Py5mb2xkZXJOYW1lID8/IHVua25vd25TdHJpbmd9PC9kaXY+XHJcblx0XHRcdDwvZGl2PlxyXG5cdFx0PC9kaXY+XHJcblxyXG5cdFx0PGJyPlxyXG5cdFx0PCEtLSBTeXN0ZW0gU2VsZWN0b3IgLS0+XHJcblx0XHQ8ZGl2IGNsYXNzPVwiUGFnZVN5c3RlbUxpc3RcIiA+XHRcclxuXHRcdFx0PEVkaXRBYmxlTGlzdCBcclxuXHRcdFx0XHRpc0VkaXRhYmxlQ29udGFpbmVyPXtmYWxzZX1cclxuXHRcdFx0XHRjb2xsZWN0aW9uPSB7ICRhdmFpbFN5c3RlbXM/Lm1hcCggcCA9PiB7cmV0dXJuIHsga2V5IDogcC5zeXN0ZW1Db2RlTmFtZSAsIHZhbHVlIDogcC5zeXN0ZW1OYW1lfX0pID8/IFtdIH1cclxuXHRcdFx0XHRvblNlbGVjdD17IG9uU2VsZWN0U3lzdGVtIH0gXHJcblx0XHRcdFx0b246b25EZVNlbGVjdD17IHVubG9hZFByZXZpZXcgfVxyXG5cdFx0XHQvPiBcclxuXHRcdDwvZGl2PiBcclxuXHQ8L3NlY3Rpb24+XHJcbjwvZGl2PiIsIjxzY3JpcHQgbGFuZz1cInRzXCI+IFxyXG5cdGltcG9ydCB7IGZseSwgc2xpZGUgfSBmcm9tICdzdmVsdGUvdHJhbnNpdGlvbic7XHJcblx0aW1wb3J0ICcuL09ic2lkaWFuU3RhbmRhcmQuc2NzcycgXHJcbiAgICBpbXBvcnQgJy4vYXBwLnNjc3MnIFxyXG4gICAgaW1wb3J0IE1lbnUgZnJvbSAnLi4vRGVzaWduZXIwMi9WaWV3cy9NZW51L01lbnUuc3ZlbHRlJzsvLycuLi9WaWV3cy9NZW51L01lbnUuc3ZlbHRlJztcclxuICAgIGltcG9ydCBIb21lUGFnZSBmcm9tICcuL1ZpZXdzL1BhZ2UvSG9tZVBhZ2Uuc3ZlbHRlJztcclxuICAgIGltcG9ydCBTeXN0ZW1QYWdlIGZyb20gJy4vVmlld3MvUGFnZS9TeXN0ZW1QYWdlLnN2ZWx0ZSc7XHJcbiAgICBpbXBvcnQgeyBUVFJQR1N5c3RlbUpTT05Gb3JtYXR0aW5nIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc3JjL01vZHVsZXMvRGVzaWduZXInO1xyXG4gICAgaW1wb3J0IHsgU3lzdGVtUHJldmlldyB9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NyYy9Nb2R1bGVzL09ic2lkaWFuVUlDb3JlL21vZGVsL3N5c3RlbVByZXZpZXcnO1xyXG4gICAgaW1wb3J0IHsgd3JpdGFibGUgfSBmcm9tICdzdmVsdGUvc3RvcmUnO1xyXG5cclxuXHRsZXQgcGFnZSA9IHdyaXRhYmxlKCAnc3lzdGVtJyk7XHJcblx0XHJcblx0bGV0IGFjdGl2ZV9zeXN0ZW1cdDogVFRSUEdTeXN0ZW1KU09ORm9ybWF0dGluZztcclxuXHRsZXQgYWN0aXZlX3ByZXZpZXdcdDogU3lzdGVtUHJldmlldztcclxuXHRcclxuXHRmdW5jdGlvbiBjaGFuZ2VQYWdlKCBldmVudCApe1xyXG5cdFx0cGFnZS5zZXQoZXZlbnQuZGV0YWlsKTsgXHJcblx0XHRjb25zb2xlLmxvZygnY2hhbmdlUGFnZSAnICsgcGFnZSk7XHJcblx0fVxyXG5cclxuIDwvc2NyaXB0PlxyXG48ZGl2IGNsYXNzPVwiTWFpbkFwcENvbnRhaW5lclwiID5cclxuXHRcclxuXHQ8IS0tIE1lbnUgLS0+XHJcblx0PE1lbnUgXHJcblx0XHRyZWd1bGFyT3B0aW9ucz17Wydob21lJywnc3lzdGVtJ119XHJcblx0XHRvbjpjaGFuZ2VQYWdlPXtjaGFuZ2VQYWdlfVxyXG5cdFx0c3RhcnRDaG9zZW49eyRwYWdlfVx0XHJcblx0Lz5cclxuXHQ8c2VjdGlvbiBjbGFzcz1cIk1haW5BcHBDb250YWluZXJQYWdlc1wiPlxyXG5cdFx0eyNpZiBcdFx0JHBhZ2UgPT0gJ2hvbWUnfVxyXG5cdFx0XHQ8ZGl2IGluOmZseT17e3g6MTAwfX0gb3V0OmZseT17e3g6LTEwMH19ID5cclxuXHRcdFx0XHQ8SG9tZVBhZ2UgLz5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHR7OmVsc2UgaWZcdCRwYWdlID09ICdzeXN0ZW0nfVxyXG5cdFx0XHQ8ZGl2IGluOmZseT17e3g6MTAwfX0gb3V0OmZseT17e3g6LTEwMH19ID5cclxuXHRcdFx0XHQ8U3lzdGVtUGFnZSAvPlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdHs6ZWxzZSBpZlx0JHBhZ2UgPT0gJ2hvbWUxJ31cclxuXHRcdFx0PHA+MTwvcD5cclxuXHRcdHs6ZWxzZSBpZlx0JHBhZ2UgPT0gJ2hvbWUyJ31cclxuXHRcdFx0PHA+MTwvcD5cclxuXHRcdHs6ZWxzZSBpZlx0JHBhZ2UgPT0gJ2hvbWUzJ31cclxuXHRcdFx0PHA+MTwvcD5cclxuXHRcdHsvaWZ9XHJcblx0PC9zZWN0aW9uPlxyXG48L2Rpdj5cclxuICIsImltcG9ydCB7IFN5c3RlbVByZXZpZXcgfSBmcm9tIFwiLi4vLi4vLi4vLi4vc3JjL01vZHVsZXMvT2JzaWRpYW5VSUNvcmUvbW9kZWwvc3lzdGVtUHJldmlld1wiO1xyXG5pbXBvcnQgeyBKc29uQXJyYXlDbGFzc1R5cGVkLCBKc29uQm9vbGVhbiwgSnNvbkNsYXNzVHlwZWQsIEpzb25Qcm9wZXJ0eSwgSnNvblN0cmluZyB9IGZyb20gXCJncm9iYXgtanNvbi1oYW5kbGVyXCI7XHJcbmltcG9ydCBQbHVnaW5IYW5kbGVyIGZyb20gXCIuLi9hcHBcIjtcclxuaW1wb3J0IHsgVUlMYXlvdXRNb2RlbCB9IGZyb20gXCIuLi8uLi8uLi8uLi9zcmMvTW9kdWxlcy9PYnNpZGlhblVJQ29yZS9tb2RlbC9VSUxheW91dE1vZGVsXCI7XHJcbmltcG9ydCB7IEJBU0VfU0NIRU1FIH0gZnJvbSBcImdyb2JheC1qc29uLWhhbmRsZXJcIjtcclxuXHJcbmV4cG9ydCBjbGFzcyBCbG9ja0RhdGFTY2hlbWVzeyBcclxuXHRzdGF0aWMgQkFTRSA9IEJBU0VfU0NIRU1FO1xyXG5cdHN0YXRpYyBQQUdFIFx0PSAnUEFHRSc7IFxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgQ05vZGUgeyBcclxuXHRcclxuXHRASnNvblN0cmluZyh7c2NoZW1lOltCbG9ja0RhdGFTY2hlbWVzLkJBU0UsQmxvY2tEYXRhU2NoZW1lcy5QQUdFXX0pXHJcblx0aWQ6c3RyaW5nO1xyXG5cdFxyXG5cdEBKc29uU3RyaW5nKHtzY2hlbWU6W0Jsb2NrRGF0YVNjaGVtZXMuQkFTRSxCbG9ja0RhdGFTY2hlbWVzLlBBR0VdfSlcclxuXHR0eXBlOnN0cmluZztcclxuXHJcblx0QEpzb25TdHJpbmcoe3NjaGVtZTpbQmxvY2tEYXRhU2NoZW1lcy5CQVNFLEJsb2NrRGF0YVNjaGVtZXMuUEFHRV19KVxyXG5cdGRhdGE6YW55O1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU2hlZXRDb2x1bW57IFxyXG5cdFxyXG5cdEBKc29uU3RyaW5nKHtzY2hlbWU6W0Jsb2NrRGF0YVNjaGVtZXMuQkFTRSxCbG9ja0RhdGFTY2hlbWVzLlBBR0VdfSlcclxuXHRpZCA6IHN0cmluZzsgXHJcblx0XHJcblx0QEpzb25BcnJheUNsYXNzVHlwZWQoIENOb2RlICx7c2NoZW1lOltCbG9ja0RhdGFTY2hlbWVzLkJBU0UsQmxvY2tEYXRhU2NoZW1lcy5QQUdFXX0pXHJcblx0ZGF0YSA6IChDTm9kZXxudWxsKVtdID0gW107IFxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgU2hlZXRSb3d7IFxyXG5cdFxyXG5cdEBKc29uUHJvcGVydHkoe3NjaGVtZTpbQmxvY2tEYXRhU2NoZW1lcy5CQVNFLEJsb2NrRGF0YVNjaGVtZXMuUEFHRV19KVxyXG5cdGlkIDogc3RyaW5nOyBcclxuXHRcclxuXHRASnNvbkFycmF5Q2xhc3NUeXBlZChTaGVldENvbHVtbiAse3NjaGVtZTpbQmxvY2tEYXRhU2NoZW1lcy5CQVNFLEJsb2NrRGF0YVNjaGVtZXMuUEFHRV19KVxyXG5cdGRhdGEgOiAoU2hlZXRDb2x1bW58bnVsbClbXSA9IFtdOyBcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFNoZWV0RGF0YSB7XHJcblxyXG5cdEBKc29uUHJvcGVydHkoe3NjaGVtZTpbQmxvY2tEYXRhU2NoZW1lcy5CQVNFLEJsb2NrRGF0YVNjaGVtZXMuUEFHRV19KVxyXG5cdGlkIDogc3RyaW5nO1xyXG5cdFxyXG5cdEBKc29uQXJyYXlDbGFzc1R5cGVkKCBTaGVldFJvdyAse3NjaGVtZTpbQmxvY2tEYXRhU2NoZW1lcy5CQVNFLEJsb2NrRGF0YVNjaGVtZXMuUEFHRV19KVxyXG5cdGRhdGEgOiBTaGVldFJvd1tdID0gW107XHQgXHJcblxyXG59XHJcbmV4cG9ydCBjbGFzcyBCbG9ja0RhdGF7XHJcblxyXG5cdHB1YmxpYyBzdGF0aWMgc2NoZW1lcyA9IEJsb2NrRGF0YVNjaGVtZXM7XHJcblxyXG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcigpe31cclxuXHJcblx0QEpzb25TdHJpbmcoe3NjaGVtZTpbQmxvY2tEYXRhU2NoZW1lcy5CQVNFLEJsb2NrRGF0YVNjaGVtZXMuUEFHRV19KVxyXG5cdHB1YmxpYyBCbG9ja1VVSUQ6c3RyaW5nID0gUGx1Z2luSGFuZGxlci51dWlkdjQoKTtcclxuXHJcblx0QEpzb25Cb29sZWFuKHtzY2hlbWU6W0Jsb2NrRGF0YVNjaGVtZXMuQkFTRSxCbG9ja0RhdGFTY2hlbWVzLlBBR0VdfSlcclxuXHRwdWJsaWMgc3lzdGVtRGF0YUluRnJvbnRNYXR0ZXI6Ym9vbGVhbiA9IGZhbHNlO1xyXG5cclxuXHRASnNvblN0cmluZyh7c2NoZW1lOltCbG9ja0RhdGFTY2hlbWVzLkJBU0UsQmxvY2tEYXRhU2NoZW1lcy5QQUdFXX0pXHJcblx0cHVibGljIHN5c3RlbURhdGFJbkZyb250TWF0dGVyX2tleTpzdHJpbmcgPSAnJztcclxuXHJcblx0QEpzb25Qcm9wZXJ0eSh7dHlwZTpTeXN0ZW1QcmV2aWV3ICxzY2hlbWU6W0Jsb2NrRGF0YVNjaGVtZXMuQkFTRSxCbG9ja0RhdGFTY2hlbWVzLlBBR0VdfSlcclxuXHRwdWJsaWMgc3lzdGVtQ2hvc2VuOlN5c3RlbVByZXZpZXcgO1xyXG5cdFxyXG5cdEBKc29uUHJvcGVydHkoe3R5cGU6VUlMYXlvdXRNb2RlbCxzY2hlbWU6W0Jsb2NrRGF0YVNjaGVtZXMuQkFTRSxCbG9ja0RhdGFTY2hlbWVzLlBBR0VdfSlcclxuXHRwdWJsaWMgTGF5b3V0Q2hvc2VuOlVJTGF5b3V0TW9kZWwgO1xyXG5cclxuXHRASnNvblByb3BlcnR5KHtzY2hlbWU6W0Jsb2NrRGF0YVNjaGVtZXMuQkFTRSxCbG9ja0RhdGFTY2hlbWVzLlBBR0VdfSlcclxuXHRwdWJsaWMgY2hhcmFjdGVyVmFsdWVzOiBSZWNvcmQ8c3RyaW5nLG51bWJlcj4gPXt9XHJcblxyXG5cdEBKc29uQ2xhc3NUeXBlZChTaGVldERhdGEse3NjaGVtZTpbQmxvY2tEYXRhU2NoZW1lcy5CQVNFLEJsb2NrRGF0YVNjaGVtZXMuUEFHRV19KVxyXG5cdHB1YmxpYyBsYXlvdXQ6IFNoZWV0RGF0YTtcclxufVxyXG5cclxuIiwiaW1wb3J0IHsga2V5TWFuYWdlckluc3RhbmNlIH0gZnJvbSBcInR0cnBnLXN5c3RlbS1ncmFwaFwiO1xyXG5cclxuIFxyXG4gXHJcbmV4cG9ydCBjbGFzcyBDTm9kZSB7XHJcblx0cHVibGljIGNvbnN0cnVjdG9yKCB0eXBlOnN0cmluZyA9ICdOT05FJywgZGF0YTpzdHJpbmcgPSAne30nICl7XHJcblx0XHR0aGlzLmlkID0ga2V5TWFuYWdlckluc3RhbmNlLmdldE5ld0tleSgpO1xyXG5cdFx0dGhpcy50eXBlID0gdHlwZTtcclxuXHRcdHRoaXMuZGF0YSA9IEpTT04ucGFyc2UoZGF0YSk7XHJcblx0fVxyXG5cdGlkOnN0cmluZztcclxuXHR0eXBlOnN0cmluZztcclxuXHRkYXRhOmFueTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFNoZWV0Q29sdW1ue1xyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvciggZGF0YTphbnlbXSA9IFtdICl7XHJcblx0XHR0aGlzLmlkID0ga2V5TWFuYWdlckluc3RhbmNlLmdldE5ld0tleSgpO1xyXG5cdFx0dGhpcy5kYXRhID0gW107XHJcblx0XHRkYXRhLmZvckVhY2goIGQgID0+IHtcclxuXHRcdFx0aWYgKCBkICE9IG51bGwgJiYgZC5kYXRhICYmIGQudHlwZSl7XHJcblx0XHRcdFx0dGhpcy5kYXRhLnB1c2goIG5ldyBDTm9kZSggZC50eXBlICxkLmRhdGEgKSlcclxuXHRcdFx0fVxyXG5cdFx0XHRlbHNle1xyXG5cdFx0XHRcdHRoaXMuZGF0YS5wdXNoKG5ldyBDTm9kZSggKSlcclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdGlkIDogc3RyaW5nOyBcclxuXHRkYXRhIDogKENOb2RlfG51bGwpW10gPSBbXTtcclxuXHRwdWJsaWMgYWRkSXRlbSgpe1xyXG5cdFx0dGhpcy5kYXRhLnB1c2gobmV3IENOb2RlKCkpXHJcblx0fVxyXG5cdHB1YmxpYyByZW1JdGVtKCBpZCApe1xyXG5cclxuXHRcdGxldCBpID0gdGhpcy5kYXRhLmZpbmRJbmRleCggcD0+IHA/LmlkID09IGlkKTtcclxuXHRcdGlmIChpPT0tMSl7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ2NhbnQgcmVtb3ZlIGNvbHVtbiwgc2luY2UgaWQgaXMgbm90IHByZXNlbnQgaW4gZGF0YScpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5kYXRhLnNwbGljZShpLDEpO1xyXG5cdH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFNoZWV0Um93e1xyXG5cdHB1YmxpYyBjb25zdHJ1Y3RvciggZGF0YTphbnlbXSA9IFtdICl7XHJcblx0XHR0aGlzLmlkID0ga2V5TWFuYWdlckluc3RhbmNlLmdldE5ld0tleSgpO1xyXG5cdFx0dGhpcy5kYXRhID0gW107XHJcblx0XHRkYXRhLmZvckVhY2goIGQgID0+IHtcclxuXHRcdFx0dGhpcy5kYXRhLnB1c2goIG5ldyBTaGVldENvbHVtbihkLmRhdGEpICk7XHJcblx0XHR9KTtcclxuXHR9XHJcblx0aWQgOiBzdHJpbmc7IFxyXG5cdGRhdGEgOiAoU2hlZXRDb2x1bW58bnVsbClbXSA9IFtdO1xyXG5cdHB1YmxpYyBhZGRDb2x1bW4oKXtcclxuXHRcdHRoaXMuZGF0YS5wdXNoKG5ldyBTaGVldENvbHVtbigpKVxyXG5cdH1cclxuXHRwdWJsaWMgcmVtQ29sdW1uKCBpZCApe1xyXG5cclxuXHRcdGxldCBpID0gdGhpcy5kYXRhLmZpbmRJbmRleCggcD0+IHA/LmlkID09IGlkKTtcclxuXHRcdGlmIChpPT0tMSl7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ2NhbnQgcmVtb3ZlIGNvbHVtbiwgc2luY2UgaWQgaXMgbm90IHByZXNlbnQgaW4gZGF0YScpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5kYXRhLnNwbGljZShpLDEpO1xyXG5cdH1cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBTaGVldERhdGEge1xyXG5cclxuXHRwdWJsaWMgY29uc3RydWN0b3IoIGRhdGE6IGFueVtdICl7XHJcblx0XHR0aGlzLmlkID0ga2V5TWFuYWdlckluc3RhbmNlLmdldE5ld0tleSgpO1xyXG5cdFx0dGhpcy5kYXRhID0gW107XHJcblx0XHRkYXRhLmZvckVhY2goIGQgID0+IHtcclxuXHRcdFx0aWYgKGQuZGF0YSlcclxuXHRcdFx0dGhpcy5kYXRhLnB1c2goIG5ldyBTaGVldFJvdyggZC5kYXRhICkpXHJcblx0XHR9KTtcclxuXHR9XHJcblx0aWQgOiBzdHJpbmc7XHJcblx0ZGF0YSA6IFNoZWV0Um93W10gPSBbXTtcdCBcclxuXHRwdWJsaWMgYWRkUm93KCl7XHJcblx0XHR0aGlzLmRhdGEucHVzaChuZXcgU2hlZXRSb3coKSlcclxuXHR9XHJcblx0cHVibGljIHJlbVJvdyggaWQgKXtcclxuXHJcblx0XHRsZXQgaSA9IHRoaXMuZGF0YS5maW5kSW5kZXgoIHA9PiBwLmlkID09IGlkKTtcclxuXHRcdGlmIChpPT0tMSl7XHJcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ2NhbnQgcmVtb3ZlIFJvdywgc2luY2UgaWQgaXMgbm90IHByZXNlbnQgaW4gZGF0YScpO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy5kYXRhLnNwbGljZShpLDEpO1xyXG5cdH1cclxufSIsIjxzY3JpcHQgbGFuZz1cInRzXCI+XHJcblx0aW1wb3J0IHsgQmxvY2tEYXRhLCBCbG9ja0RhdGFTY2hlbWVzIH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc3JjL01vZHVsZXMvT2JzaWRpYW5VSS9CbG9ja1JlbmRlcmVyL0Jsb2NrRGF0YSc7XHJcblx0aW1wb3J0IHsgZmx5LCBzbGlkZSB9IGZyb20gJ3N2ZWx0ZS90cmFuc2l0aW9uJztcclxuXHRpbXBvcnQgeyBKU09OSGFuZGxlciB9IGZyb20gJ2dyb2JheC1qc29uLWhhbmRsZXInO1xyXG5cdGltcG9ydCB7IFVJTGF5b3V0TW9kZWwgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zcmMvTW9kdWxlcy9PYnNpZGlhblVJQ29yZS9tb2RlbC9VSUxheW91dE1vZGVsJztcclxuXHRpbXBvcnQgeyBvbk1vdW50IH0gZnJvbSAnc3ZlbHRlJztcclxuXHRpbXBvcnQgeyBTeXN0ZW1QcmV2aWV3IH0gZnJvbSAnLi4vLi4vLi4vLi4vLi4vc3JjL01vZHVsZXMvT2JzaWRpYW5VSUNvcmUvbW9kZWwvc3lzdGVtUHJldmlldyc7XHJcblx0aW1wb3J0IFN0YXRpY01lc3NhZ2VIYW5kbGVyIGZyb20gJy4vLi4vRGVzaWduZXIwMS9CYXNlQ29tcG9uZW50cy9NZXNzYWdlcy9TdGF0aWNNZXNzYWdlSGFuZGxlci5zdmVsdGUnO1xyXG4gICAgaW1wb3J0IHsgT2JzaWRpYW5VSUNvcmVBUEkgfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vc3JjL01vZHVsZXMvT2JzaWRpYW5VSUNvcmUvQVBJXCI7XHJcblx0aW1wb3J0ICcuL0Jsb2NrU3RhcnRlci5zY3NzJ1xyXG5cdGltcG9ydCB7VFRSUEdfU0NIRU1FUyAsIFRUUlBHU3lzdGVtSlNPTkZvcm1hdHRpbmd9IGZyb20gJy4uLy4uLy4uLy4uLy4uL3NyYy9Nb2R1bGVzL0Rlc2lnbmVyL2luZGV4JztcclxuICAgIGltcG9ydCB7IFNoZWV0RGF0YSB9IGZyb20gJy4uLy4uL0Jsb2NrUmVuZGVyZXIvQ29tcG9uZW50Tm9kZSc7XHJcblx0XHJcblx0ZXhwb3J0IGxldCBXcml0ZURvd24gOiAodHh0IDogc3RyaW5nKSA9PiBhbnk7XHJcblx0bGV0IGFwaSA9IE9ic2lkaWFuVUlDb3JlQVBJLmdldEluc3RhbmNlKCk7XHJcblx0bGV0IG1zZ0hhbmRsZXIgOiBTdGF0aWNNZXNzYWdlSGFuZGxlcjtcclxuXHJcblx0bGV0IHN5c3RlbXM6IFN5c3RlbVByZXZpZXdbXSA9IFtdO1xyXG5cdGxldCBzZWxlY3RlZF9zeXN0ZW06IFN5c3RlbVByZXZpZXd8bnVsbCA9IG51bGwgO1xyXG5cclxuXHRsZXQgbGF5b3V0cyA6IFVJTGF5b3V0TW9kZWxbXSB8IG51bGwgPSBudWxsIDtcclxuXHRsZXQgc2VsZWN0ZWRMYXlvdXQgOiBVSUxheW91dE1vZGVsfG51bGwgPSBudWxsO1xyXG5cdGFzeW5jIGZ1bmN0aW9uIExvYWRTeXN0ZW1PcHRpb25zKCl7XHJcblx0XHRsZXQgcmVzcCA9IGF3YWl0IGFwaS5zeXN0ZW1EZWZpbml0aW9uLmdldEFsbFN5c3RlbXMoKTtcclxuXHRcdGlmIChyZXNwLnJlc3BvbnNlQ29kZSAhPSAyMDApe1xyXG5cdFx0XHRsZXQgayA9T2JqZWN0LmtleXMocmVzcC5tZXNzYWdlcyk7XHJcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgay5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGNvbnN0IGtleSA9IGtbaV07XHJcblx0XHRcdFx0Y29uc3QgbXNnID0gcmVzcC5tZXNzYWdlc1trZXldO1xyXG5cdFx0XHRcdG1zZ0hhbmRsZXIuYWRkTWVzc2FnZShrZXksIG1zZyk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0c3lzdGVtcyA9IHJlc3AucmVzcG9uc2UgPz8gW107XHRcdFxyXG5cdH1cclxuXHRcclxuXHRvbk1vdW50KCgpPT57XHJcblx0XHRMb2FkU3lzdGVtT3B0aW9ucygpO1xyXG5cdH0pXHJcblx0XHJcblx0XHJcblx0ZnVuY3Rpb24gb25DaGFuZ2VTZWxlY3RTeXN0ZW0oIGV2ZW50ICl7XHJcblx0XHRjb25zdCB0YXJnID0gZXZlbnQudGFyZ2V0O1xyXG5cdFx0aWYodGFyZy52YWx1ZSA9PSAnLTEnKXtcclxuXHRcdFx0c2VsZWN0ZWRfc3lzdGVtID0gbnVsbDtcclxuXHRcdFx0c2VsZWN0ZWRMYXlvdXQ9bnVsbDtcclxuXHRcdFx0bGF5b3V0cz1udWxsO1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3Qgc3lzID0gc3lzdGVtcy5maW5kKHA9PnAuaWQgPT0gdGFyZy52YWx1ZSk7XHJcblx0XHRpZihzeXMpXHJcblx0XHRcdHNlbGVjdFN5c3RlbShzeXMpO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBzZWxlY3RTeXN0ZW0oIHN5c3RlbSApe1xyXG5cdFx0c2VsZWN0ZWRMYXlvdXQgPSBudWxsO1xyXG5cdFx0bGF5b3V0cz1udWxsO1xyXG5cdFx0aWYgKCBzZWxlY3RlZF9zeXN0ZW0gPT0gc3lzdGVtKXtcclxuXHRcdFx0c2VsZWN0ZWRfc3lzdGVtID0gbnVsbDtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fWVsc2V7XHJcblx0XHRcdHNlbGVjdGVkX3N5c3RlbSA9IHN5c3RlbTtcclxuXHRcdFx0TG9hZFN5c3RlbVVJT3B0aW9ucygpO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0fVxyXG5cdGFzeW5jIGZ1bmN0aW9uIExvYWRTeXN0ZW1VSU9wdGlvbnMoKXtcclxuXHRcdGlmKCFzZWxlY3RlZF9zeXN0ZW0pe1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRsZXQgcmVzcCA9IGF3YWl0IGFwaS5VSUltcG9ydEV4cG9ydC5nZXRBbGxBdmFpbGFibGVVSXNGb3JTeXN0ZW0oIHNlbGVjdGVkX3N5c3RlbSApO1xyXG5cdFx0aWYocmVzcC5yZXNwb25zZUNvZGUgIT0gMjAwKXtcclxuXHRcdFx0Y29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHJlc3AubWVzc2FnZXMpO1xyXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRjb25zdCBrZXkgPSBrZXlzW2ldO1xyXG5cdFx0XHRcdGNvbnN0IG1zZyA9IHJlc3AubWVzc2FnZXNba2V5XTtcclxuXHRcdFx0XHRtc2dIYW5kbGVyLmFkZE1lc3NhZ2VNYW51YWwoa2V5LG1zZy5tc2csbXNnLnR5cGUpO1xyXG5cdFx0XHR9XHJcblx0XHR9ZWxzZXtcclxuXHRcdFx0bGF5b3V0cyA9IHJlc3AucmVzcG9uc2UgPz8gW107XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHJcblx0ZnVuY3Rpb24gb25DaGFuZ2VTZWxlY3RMYXlvdXQoIGV2ZW50ICl7XHJcblx0XHRjb25zdCB0YXJnID0gZXZlbnQudGFyZ2V0O1xyXG5cdFx0aWYodGFyZy52YWx1ZSA9PSAnLTEnKXsgXHJcblx0XHRcdHNlbGVjdGVkTGF5b3V0PW51bGw7XHJcblx0XHRcdGxheW91dHM9bnVsbDtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmKCFsYXlvdXRzKVxyXG5cdFx0XHRyZXR1cm47XHJcblx0XHRcclxuXHJcblx0XHRjb25zdCBsYXkgPSBsYXlvdXRzLmZpbmQocD0+cC5pZCA9PSB0YXJnLnZhbHVlKTtcclxuXHRcdGlmKGxheSlcclxuXHRcdFx0c2VsZWN0TGF5b3V0KGxheSk7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIHNlbGVjdExheW91dCggbGF5b3V0ICl7XHJcblx0XHRpZiAoIHNlbGVjdGVkTGF5b3V0ID09IGxheW91dCl7XHJcblx0XHRcdHNlbGVjdGVkTGF5b3V0ID0gbnVsbDtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0c2VsZWN0ZWRMYXlvdXQgPSBsYXlvdXQ7XHJcblx0fVxyXG5cdGFzeW5jIGZ1bmN0aW9uIHNhdmVBbmRMb2FkKCl7XHJcblx0XHQgXHJcblx0XHRpZiAoIShzZWxlY3RlZF9zeXN0ZW0gJiYgc2VsZWN0ZWRMYXlvdXQpKXtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cdFx0XHJcblx0XHQvLyBTeXN0ZW0gTG9hZGluZ1xyXG5cdFx0bGV0IFMgPSBhd2FpdCBhcGkuc3lzdGVtRmFjdG9yeS5nZXRPckNyZWF0ZVN5c3RlbUZhY3Rvcnkoc2VsZWN0ZWRfc3lzdGVtKTtcclxuXHRcdGlmIChTLnJlc3BvbnNlQ29kZSAhPSAyMDApe1xyXG5cdFx0XHRjb25zdCBrZXlzID0gT2JqZWN0LmtleXMoIFMubWVzc2FnZXMpO1xyXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRjb25zdCBrZXkgPSBrZXlzW2ldO1xyXG5cdFx0XHRcdGNvbnN0IG1zZyA9IFMubWVzc2FnZXNba2V5XTtcclxuXHRcdFx0XHRtc2dIYW5kbGVyLmFkZE1lc3NhZ2VNYW51YWwoa2V5LG1zZy5tc2csbXNnLnR5cGUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBcclxuXHRcdH1cclxuXHRcdFxyXG5cdFx0Ly8gU3lzdGVtIFdyaXRpbmdcclxuXHRcdGxldCBzeXN0ZW1PYmogPSBTLnJlc3BvbnNlIGFzIFRUUlBHU3lzdGVtSlNPTkZvcm1hdHRpbmc7XHJcblx0XHRsZXQgRml4ZWRDb21tYW5kcyA9IHt9O1xyXG5cdFx0T2JqZWN0LmtleXMoc3lzdGVtT2JqLmZpeGVkLmNvbGxlY3Rpb25zX25hbWVzKS5mb3JFYWNoKCBjb2xfa2V5ID0+IHtcclxuXHRcdFx0Y29uc3QgY29sID0gc3lzdGVtT2JqLmZpeGVkLmNvbGxlY3Rpb25zX25hbWVzW2NvbF9rZXldO1xyXG5cdFx0XHRPYmplY3Qua2V5cyhjb2wubm9kZXNfbmFtZXMpLmZvckVhY2goIG5vZGVfa2V5ID0+e1xyXG5cdFx0XHRcdGNvbnN0IG5vZGUgPSBjb2wubm9kZXNfbmFtZXNbbm9kZV9rZXldO1xyXG5cdFx0XHRcdEZpeGVkQ29tbWFuZHNbJ2ZpeGVkLicgKyBjb2xfa2V5ICsnLicrbm9kZV9rZXkgXSA9IG5vZGUuZ2V0VmFsdWUoKTtcclxuXHRcdFx0fSlcclxuXHRcdH0pO1xyXG5cclxuXHJcblx0XHRsZXQgb3V0IDogQmxvY2tEYXRhID0gbmV3IEJsb2NrRGF0YSgpO1xyXG5cdFx0b3V0LmNoYXJhY3RlclZhbHVlcyA9IEZpeGVkQ29tbWFuZHM7XHJcblx0XHRvdXQubGF5b3V0XHRcdFx0PSBuZXcgU2hlZXREYXRhKFtdKTtcclxuXHRcdG91dC5sYXlvdXQuYWRkUm93KCk7XHJcblx0XHRvdXQubGF5b3V0LmRhdGFbMF0uYWRkQ29sdW1uKCk7XHJcblx0XHRvdXQubGF5b3V0LmRhdGFbMF0uZGF0YVswXS5hZGRJdGVtKCk7XHJcblx0XHRvdXQuc3lzdGVtQ2hvc2VuID0gSlNPTkhhbmRsZXIuZGVzZXJpYWxpemUoU3lzdGVtUHJldmlldywgKEpTT05IYW5kbGVyLnNlcmlhbGl6ZShzeXN0ZW1PYmosVFRSUEdfU0NIRU1FUy5QUkVWSUVXKSkpO1xyXG5cdFx0b3V0LkxheW91dENob3NlbiA9IHNlbGVjdGVkTGF5b3V0O1xyXG5cdFx0IFxyXG5cdFx0V3JpdGVEb3duKCBKU09OSGFuZGxlci5zZXJpYWxpemUob3V0ICwgQmxvY2tEYXRhU2NoZW1lcy5QQUdFICkgKTtcclxuXHR9XHJcblx0bGV0IFBSRUpTT04gPSBcIlwiO1xyXG48L3NjcmlwdD5cclxuPGRpdiBjbGFzcz1cIkJsb2NrU3RhcnRlclwiID5cclxuXHQ8U3RhdGljTWVzc2FnZUhhbmRsZXIgXHJcblx0XHRiaW5kOnRoaXM9e21zZ0hhbmRsZXJ9XHJcblxyXG5cdC8+XHJcblx0PGRpdiBzdHlsZT1cImhlaWdodDoyMHB4XCI+XHJcblxyXG5cdDwvZGl2PlxyXG5cdDxkaXYgY2xhc3M9XCJTeXN0ZW1TZWxlY3RTdGFnZSBcIj5cclxuXHRcdDxzZWN0aW9uPlxyXG5cdFx0XHQ8Yj5TZWxlY3QgUHJlc2V0cyBUbyBVc2U8L2I+XHJcblx0XHRcdDxwPlxyXG5cdFx0XHRcdFRvIFVzZSB0aGlzIEFkZG9uLCB5b3UgbXVzdCBjaG9vc2UgYSBzeXN0ZW0gdG8gdXNlLCBhbmQgYSBVSSBmb3IgdGhhdCBzeXN0ZW0gdG8gdXNlLlxyXG5cdFx0XHRcdGZpcnN0IHNlbGVjdCB5b3VyIHN5c3RlbSwgYW5kIHRoZW4gc2VsZWN0IHlvdXIgbGF5b3V0IFxyXG5cdFx0XHQ8L3A+XHJcblx0XHQ8L3NlY3Rpb24+XHJcblx0XHQ8ZGl2IGNsYXNzPVwiQmxvY2tzU3RhcnRlckludGVyYWN0aXZlQ29udGFpbmVyIFN5c3RlbVRhYmxlXCIgdHJhbnNpdGlvbjpzbGlkZSA+XHJcblx0XHRcdDxkaXYgY2xhc3M9XCJTeXN0ZW1UYWJsZVJvdyBTZWxlY3RSb3dcIiA+XHJcblx0XHRcdFx0PGRpdiBzdHlsZT1cIndpZHRoOjEwMHB4O1wiID5cclxuXHRcdFx0XHRcdENob3NlbiBTeXN0ZW1cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHQ8ZGl2PlxyXG5cdFx0XHRcdFx0PHNlbGVjdCBvbjpjaGFuZ2U9eyBvbkNoYW5nZVNlbGVjdFN5c3RlbSB9PlxyXG5cdFx0XHRcdFx0XHQ8b3B0aW9uIHZhbHVlPVwiLTFcIj4gU2VsZWN0IGEgU3lzdGVtIDwvb3B0aW9uPlxyXG5cdFx0XHRcdFx0XHR7I2VhY2ggc3lzdGVtcyBhcyBzeXMgfVxyXG5cdFx0XHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9e3N5cy5pZH0gPnsgc3lzLnN5c3RlbU5hbWUgfTwvb3B0aW9uPlxyXG5cdFx0XHRcdFx0XHR7L2VhY2h9XHJcblx0XHRcdFx0XHQ8L3NlbGVjdD5cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHQ8ZGl2PlxyXG5cdFx0XHRcdFx0QXV0aG9yOiB7IHNlbGVjdGVkX3N5c3RlbT8uYXV0aG9yID8/ICctJ31cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0XHQ8ZGl2PlxyXG5cdFx0XHRcdFx0dmVyc2lvbjogeyBzZWxlY3RlZF9zeXN0ZW0/LnZlcnNpb24gPz8gJy0nfVxyXG5cdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PGRpdiBjbGFzcz1cIlN5c3RlbVRhYmxlUm93IFNlbGVjdFJvd1wiID5cclxuXHRcdFx0XHQ8ZGl2IHN0eWxlPVwid2lkdGg6MTAwcHg7XCIgPlxyXG5cdFx0XHRcdFx0Q2hvc2VuIExheW91dFxyXG5cdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdDxkaXY+XHJcblx0XHRcdFx0XHR7I2lmIHNlbGVjdGVkX3N5c3RlbSAmJiBsYXlvdXRzIH1cclxuXHRcdFx0XHRcdFx0PHNlbGVjdCB0cmFuc2l0aW9uOnNsaWRlICBvbjpjaGFuZ2U9eyBvbkNoYW5nZVNlbGVjdExheW91dCB9PlxyXG5cdFx0XHRcdFx0XHRcdDxvcHRpb24gdmFsdWU9XCItMVwiPiBTZWxlY3QgYSBMYXlvdXQgPC9vcHRpb24+XHJcblx0XHRcdFx0XHRcdFx0XHR7I2VhY2ggbGF5b3V0cyBhcyBsYXkgfVxyXG5cdFx0XHRcdFx0XHRcdFx0XHQ8b3B0aW9uIHZhbHVlPXtsYXkuaWR9ID57IGxheS5uYW1lIH08L29wdGlvbj5cclxuXHRcdFx0XHRcdFx0XHRcdHsvZWFjaH1cclxuXHRcdFx0XHRcdFx0PC9zZWxlY3Q+XHJcblx0XHRcdFx0XHR7L2lmfVxyXG5cdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdDxkaXY+XHJcblx0XHRcdFx0XHRBdXRob3I6IHsgc2VsZWN0ZWRMYXlvdXQ/LmF1dGhvciAgPz8gJy0nfVxyXG5cdFx0XHRcdDwvZGl2PlxyXG5cdFx0XHRcdDxkaXY+XHJcblx0XHRcdFx0XHR2ZXJzaW9uOiB7IHNlbGVjdGVkTGF5b3V0Py52ZXJzaW9uID8/ICctJ31cclxuXHRcdFx0XHQ8L2Rpdj5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHQ8L2Rpdj5cdFxyXG5cdFx0PGRpdiBzdHlsZT1cImhlaWdodDoxMHB4O1wiID48L2Rpdj5cclxuXHRcdHsjaWYgc2VsZWN0ZWRMYXlvdXQgfVxyXG5cdFx0XHQ8ZGl2IHRyYW5zaXRpb246c2xpZGU+XHJcblx0XHRcdFx0PGJ1dHRvblxyXG5cdFx0XHRcdGNsYXNzPVwiQ29sb3JlZEludGVyYWN0aXZlXCIgZGF0YS1jb2xvcj1cImdyZWVuXCJcclxuXHRcdFx0XHRvbjpjbGljaz17ICgpID0+IHNhdmVBbmRMb2FkKCkgfT5TYXZlICwgV3JpdGUgQW5kIExvYWQ8L2J1dHRvbj5cclxuXHRcdFx0PC9kaXY+XHJcblx0XHR7L2lmfVxyXG5cdFx0PGRpdiBzdHlsZT1cImhlaWdodDoyMHB4O1wiID48L2Rpdj5cclxuXHQ8L2Rpdj5cclxuXHQ8cHJlPlxyXG5cdFx0e1BSRUpTT059XHJcblx0PC9wcmU+XHJcblx0XHJcblxyXG48L2Rpdj5cclxuPHN0eWxlID5cclxuXHRcclxuPC9zdHlsZT4iLCJcclxuXHJcbmltcG9ydCB7IEpTT05IYW5kbGVyIH0gZnJvbSAnZ3JvYmF4LWpzb24taGFuZGxlcic7XHJcbmltcG9ydCBQbHVnaW5IYW5kbGVyIGZyb20gXCIuLi9hcHBcIjtcclxuaW1wb3J0IEJsb2NrU3RhcnRlciBmcm9tIFwiLi4vVUlJbnRlcmZhY2VzL0Jsb2NrU3RhcnRlci9CbG9ja1N0YXJ0ZXIuc3ZlbHRlXCI7XHJcbmltcG9ydCB7IEJsb2NrRGF0YSwgQmxvY2tEYXRhU2NoZW1lcyB9IGZyb20gXCIuL0Jsb2NrRGF0YVwiO1xyXG5pbXBvcnQgeyBGaWxlSGFuZGxlciB9IGZyb20gXCIuLi8uLi8uLi8uLi9zcmMvTW9kdWxlcy9PYnNpZGlhblVJQ29yZS9maWxlSGFuZGxlclwiO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJzsgXHJcbmltcG9ydCB7IE9ic2lkaWFuVUlDb3JlQVBJIH0gZnJvbSAnLi4vLi4vLi4vLi4vc3JjL01vZHVsZXMvT2JzaWRpYW5VSUNvcmUvQVBJJzsgXHJcbmltcG9ydCB7IFRUUlBHU3lzdGVtSlNPTkZvcm1hdHRpbmcgfSBmcm9tICcuLi8uLi8uLi8uLi9zcmMvTW9kdWxlcy9EZXNpZ25lcic7XHJcbmltcG9ydCB7IFNoZWV0RGF0YSB9IGZyb20gJy4vQ29tcG9uZW50Tm9kZSc7XHJcblxyXG5leHBvcnQgY2xhc3MgQmxvY2tSZW5kZXJlcntcclxuXHJcblx0cHVibGljIHRleHQ6c3RyaW5nO1xyXG5cdHB1YmxpYyBlbGVtZW50OkhUTUxFbGVtZW50O1xyXG5cdHB1YmxpYyBjb250ZXh0OmFueTtcclxuXHJcblx0cHVibGljIGJsb2NrRGF0YSA6IEJsb2NrRGF0YTtcclxuXHJcblx0Y29uc3RydWN0b3IodGV4dENvbnRlbnQgOiBzdHJpbmcgLCBlbGVtZW50IDogSFRNTEVsZW1lbnQsIGNvbnRleHQgOiBhbnkpe1xyXG5cdFx0dGhpcy50ZXh0IFx0XHQ9IHRleHRDb250ZW50ID8/ICcnOyBcclxuXHRcdHRoaXMuZWxlbWVudFx0PSBlbGVtZW50OyBcclxuXHRcdHRoaXMuY29udGV4dFx0PSBjb250ZXh0O1xyXG5cdH1cclxuXHRcclxuXHRwcml2YXRlIGZpbmRCbG9ja0FuZFBhc3RlSW50byhmaWxldGV4dDpzdHJpbmcsIGNvbnRlbnQ6c3RyaW5nICl7XHJcblx0XHRcclxuXHRcdGxldCBibG9ja0hlYWQ9ICdgYGAnK1BsdWdpbkhhbmRsZXIuU1lTVEVNX0xBWU9VVF9CTE9DS05BTUU7XHJcblx0XHRsZXQgcGllY2VzID0gZmlsZXRleHQuc3BsaXQoYmxvY2tIZWFkKTtcclxuXHRcdC8vIG9ubHkgYSBzaW5nbGUgYmxvY2sgaXMgb24gdGhlIHBhZ2VcclxuXHRcdGlmKHBpZWNlcy5sZW5ndGggPT0gMil7XHJcblx0XHRcdFxyXG5cdFx0XHRsZXQgYWZ0ZXJibG9ja19pbmRleCA9IHBpZWNlc1sxXS5pbmRleE9mKCdgYGAnKTtcclxuXHRcdFx0bGV0IGJsb2NrID0gcGllY2VzWzFdLnN1YnN0cmluZygwLGFmdGVyYmxvY2tfaW5kZXgpXHJcblx0XHRcdGxldCBhZnRlcmJsb2NrID0gcGllY2VzWzFdLnNwbGl0KCdgYGAnLDIpWzFdO1xyXG4gXHJcblx0XHRcdGxldCBwYWdlIDpzdHJpbmcgPSBwaWVjZXNbMF0gKyBibG9ja0hlYWQgKyBcIlxcblwiICsgY29udGVudCArIFwiXFxuYGBgXCIgKyBhZnRlcmJsb2NrO1xyXG5cdFx0XHRyZXR1cm4gcGFnZTtcclxuXHRcdH1cclxuXHRcdHJldHVybiAnJ1xyXG5cclxuXHR9XHJcblx0cHVibGljIGFzeW5jIHdyaXRlQmxvY2sodHh0KXsgXHJcblx0XHRjb25zdCBhcHAgPSBQbHVnaW5IYW5kbGVyLnNlbGYuYXBwOyBcclxuXHRcdGNvbnN0IHZhdWx0ID0gYXBwLnZhdWx0OyBcclxuXHRcdGxldCBmaWxlICA9IHZhdWx0LmdldEZpbGVCeVBhdGgodGhpcy5jb250ZXh0LnNvdXJjZVBhdGgpXHJcblx0XHRpZighZmlsZSl7IFxyXG5cdFx0XHRyZXR1cm4gJyc7XHJcblx0XHR9XHJcblxyXG5cdFx0Y29uc3QgZmlsZUNvbnRlbnQgPSBhd2FpdCBhcHAudmF1bHQucmVhZChmaWxlKTtcclxuXHRcdGxldCBwYWdlID0gdGhpcy5maW5kQmxvY2tBbmRQYXN0ZUludG8oZmlsZUNvbnRlbnQsIHR4dCApXHJcblx0XHR2YXVsdC5tb2RpZnkoZmlsZSxwYWdlKTtcclxuXHR9IFxyXG5cclxuXHJcblx0cHJpdmF0ZSBhc3luYyBnZXRTeXN0ZW0oIHRhZywgYmxvY2tEYXRhICl7XHJcblx0XHQvLyBnZXQgdGhlIHJpZ2h0IFN5c3RlbSBQcmV2aWV3XHJcblx0XHRsZXQgcmVzcCA9IGF3YWl0IE9ic2lkaWFuVUlDb3JlQVBJLmdldEluc3RhbmNlKCkuc3lzdGVtRGVmaW5pdGlvbi5nZXRBbGxTeXN0ZW1zKCk7XHJcblx0XHRpZiAocmVzcC5yZXNwb25zZUNvZGUgIT0gMjAwICl7XHJcblx0XHRcdC8vVE9ETzogYWxzbyBnZXQgb3V0IHRoZSBtZXNzYWdlc1xyXG5cdFx0XHR0YWcuaW5uZXJIVE1MPVwiPGRpdj5UVFBSUEcgLSBDb3VsZCBOb3QgTG9hZCBBdmFpbGFibGUgU3lzdGVtczwvZGl2PlwiXHJcblx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0fVxyXG5cdFx0bGV0IGNob3NlblN5c3RlbSA9IHJlc3AucmVzcG9uc2U/LmZpbmQoIHAgPT4gcC5zeXN0ZW1Db2RlTmFtZSA9PSBibG9ja0RhdGEuc3lzdGVtQ2hvc2VuLnN5c3RlbUNvZGVOYW1lICk7XHJcblxyXG5cdFx0Ly8gZW5zdXJlIGl0IGV4aXRzXHJcblx0XHRpZighY2hvc2VuU3lzdGVtKXtcclxuXHRcdFx0dGFnLmlubmVySFRNTD1cIjxkaXY+VGhlIENob3NlbiBUVFJQRyBkaWQgbm90IGFwZWFyIGluIEF2YWlsYWJsZSBTeXN0ZW1zIDwvZGl2PlwiXHJcblx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0fVxyXG5cclxuXHRcdC8vIGdldCB0aGUgc3lzdGVtIGZhY3RvcnkuXHJcblx0XHRsZXQgcmVzcDIgPSBhd2FpdCBPYnNpZGlhblVJQ29yZUFQSS5nZXRJbnN0YW5jZSgpLnN5c3RlbUZhY3RvcnkuZ2V0T3JDcmVhdGVTeXN0ZW1GYWN0b3J5KGNob3NlblN5c3RlbSk7XHJcblx0XHRpZiAocmVzcDIucmVzcG9uc2VDb2RlICE9IDIwMCApe1xyXG5cdFx0XHQvL1RPRE86IGFsc28gZ2V0IG91dCB0aGUgbWVzc2FnZXNcclxuXHRcdFx0dGFnLmlubmVySFRNTD1cIjxkaXY+U09NRVRISU5HIFdFTlQgV1JPTkcgMjwvZGl2PlwiXHJcblx0XHRcdHJldHVybiBudWxsO1xyXG5cdFx0fVxyXG5cdFx0bGV0IHN5cyA9IHJlc3AyLnJlc3BvbnNlIGFzIFRUUlBHU3lzdGVtSlNPTkZvcm1hdHRpbmc7XHJcblx0XHRyZXR1cm4gc3lzO1xyXG5cdH1cclxuXHRwcml2YXRlIHNldFN5c3RlbVZhbHVlc0Zyb21CbG9ja0RhdGEoIHN5cyA6IFRUUlBHU3lzdGVtSlNPTkZvcm1hdHRpbmcgLCBibG9ja0RhdGEgOiBCbG9ja0RhdGEpeyBcclxuXHRcdFxyXG5cclxuXHRcdGxldCBjb21tYW5kRGljdCA9IHt9O1xyXG5cclxuXHRcdC8vIENyZWF0ZSBjb21tYW5kcyBmb3IgYWxsIGZpeGVkIHN0YXRzLCBhbGwgc3RhbmRhcmQgdmFsdWVzIFxyXG5cdFx0Y29uc3QgZ3JvdXBfa2V5ID0gJ2ZpeGVkJzsgXHJcblx0XHRjb25zdCBjb2xfa2V5cyA9IE9iamVjdC5rZXlzKHN5cy5maXhlZC5jb2xsZWN0aW9uc19uYW1lcylcclxuXHRcdGZvciAobGV0IGMgPSAwOyBjIDwgY29sX2tleXMubGVuZ3RoOyBjKyspIHtcclxuXHRcdFx0Y29uc3QgY29sX2tleSA9IGNvbF9rZXlzW2NdO1xyXG5cdFx0XHRjb25zdCBjb2wgPSBzeXMuZml4ZWQuY29sbGVjdGlvbnNfbmFtZXNbY29sX2tleV07IFxyXG5cdFx0XHRjb25zdCBub2RlX2tleXMgPSBPYmplY3Qua2V5cyhjb2wubm9kZXNfbmFtZXMpO1xyXG5cdFx0XHRmb3IgKGxldCBuID0gMDsgbiA8IG5vZGVfa2V5cy5sZW5ndGg7IG4rKykge1xyXG5cdFx0XHRcdGNvbnN0IG5vZGVfa2V5ID0gbm9kZV9rZXlzW25dO1xyXG5cdFx0XHRcdGNvbnN0IG5vZGUgPSBjb2wubm9kZXNfbmFtZXNbbm9kZV9rZXldO1xyXG5cclxuXHRcdFx0XHRjb21tYW5kRGljdFtncm91cF9rZXkrJy4nK2NvbF9rZXkrJy4nK25vZGVfa2V5XSA9IG5vZGUuZ2V0VmFsdWUoKSA/PyAwO1xyXG5cdFx0XHR9XHJcblx0XHR9IFxyXG5cclxuXHRcdC8vIGluc2VydCBWYWx1ZXMgZm9yIGFsbCBzcGVjaWZpZWQgdmFsdWVzLiBcclxuXHRcdGxldCBibG9ja0NvbW1hbmRzID0gT2JqZWN0LmtleXMoYmxvY2tEYXRhLmNoYXJhY3RlclZhbHVlcyk7XHJcblx0XHRmb3IgKGxldCBjID0gMDsgYyA8IGJsb2NrQ29tbWFuZHMubGVuZ3RoOyBjKyspIHtcclxuXHRcdFx0Y29uc3QgY21kID0gYmxvY2tDb21tYW5kc1tjXTtcclxuXHRcdFx0Y29tbWFuZERpY3RbY21kXSA9IGJsb2NrRGF0YS5jaGFyYWN0ZXJWYWx1ZXNbY21kXTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBSdW4gdXBkYXRlcztcclxuXHRcdGNvbnN0IGNvbW1hbmRzID0gT2JqZWN0LmtleXMoY29tbWFuZERpY3QpO1xyXG5cdFx0Zm9yIChsZXQgYyA9IDA7IGMgPCBjb21tYW5kcy5sZW5ndGg7IGMrKykge1xyXG5cdFx0XHRjb25zdCBjbWQgPSBjb21tYW5kc1tjXTtcclxuXHRcdFx0Y29uc3Qgc2VnID0gY21kLnNwbGl0KCcuJykgYXMgYW55W107XHJcblx0XHRcdHN5cy5nZXROb2RlKHNlZ1swXSxzZWdbMV0sc2VnWzJdKT8uc2V0VmFsdWUoY29tbWFuZERpY3RbY21kXSk7XHJcblx0XHR9XHRcdCAgXHJcblx0fVxyXG5cdHByaXZhdGUgc3RhdGljIGdldFN5c3RlbVZhbHVlc0ZvckJsb2NrRGF0YSggc3lzIDogVFRSUEdTeXN0ZW1KU09ORm9ybWF0dGluZyAgKXsgXHJcblx0XHRcclxuXHJcblx0XHRsZXQgY29tbWFuZERpY3QgPSB7fTtcclxuXHJcblx0XHQvLyBDcmVhdGUgY29tbWFuZHMgZm9yIGFsbCBmaXhlZCBzdGF0cywgYWxsIHN0YW5kYXJkIHZhbHVlcyBcclxuXHRcdGNvbnN0IGdyb3VwX2tleSA9ICdmaXhlZCc7IFxyXG5cdFx0Y29uc3QgY29sX2tleXMgPSBPYmplY3Qua2V5cyhzeXMuZml4ZWQuY29sbGVjdGlvbnNfbmFtZXMpXHJcblx0XHRmb3IgKGxldCBjID0gMDsgYyA8IGNvbF9rZXlzLmxlbmd0aDsgYysrKSB7XHJcblx0XHRcdGNvbnN0IGNvbF9rZXkgPSBjb2xfa2V5c1tjXTtcclxuXHRcdFx0Y29uc3QgY29sID0gc3lzLmZpeGVkLmNvbGxlY3Rpb25zX25hbWVzW2NvbF9rZXldOyBcclxuXHRcdFx0Y29uc3Qgbm9kZV9rZXlzID0gT2JqZWN0LmtleXMoY29sLm5vZGVzX25hbWVzKTtcclxuXHRcdFx0Zm9yIChsZXQgbiA9IDA7IG4gPCBub2RlX2tleXMubGVuZ3RoOyBuKyspIHtcclxuXHRcdFx0XHRjb25zdCBub2RlX2tleSA9IG5vZGVfa2V5c1tuXTtcclxuXHRcdFx0XHRjb25zdCBub2RlID0gY29sLm5vZGVzX25hbWVzW25vZGVfa2V5XTtcclxuXHJcblx0XHRcdFx0Ly8gVE9ETzogaW1wbGVtZW50IHRoaXMgd2l0aCBzdGFuZGFyZCB2YWx1ZXMgXHJcblx0XHRcdFx0aWYobm9kZS5nZXRWYWx1ZSgpICE9IDApe1xyXG5cdFx0XHRcdFx0Y29tbWFuZERpY3RbZ3JvdXBfa2V5KycuJytjb2xfa2V5KycuJytub2RlX2tleV0gPSBub2RlLmdldFZhbHVlKCk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHR9IFxyXG5cdFx0cmV0dXJuIGNvbW1hbmREaWN0O1xyXG5cdFx0IFxyXG5cdH1cclxuXHRwdWJsaWMgYXN5bmMgcmVuZGVyKCl7XHJcbiBcclxuXHRcdC8vIGlmIHRoZSBibG9jayBpcyBicmFuZCBuZXcsIGp1c3QgZ2l2ZSBpdCBhIGd1aWQsIHNvIHdlIGNhbiBkaXN0aW5ndWlzaCBibG9ja3MgZnJvbSBlYWNob3RoZXIuXHJcblx0XHRsZXQgdGV4dCA9IHRoaXMudGV4dDtcclxuXHRcdHRleHQudHJpbSgpO1xyXG5cdFx0aWYgKHRleHQ9PScnKXtcclxuXHRcdFx0dGhpcy53cml0ZUJsb2NrKCBQbHVnaW5IYW5kbGVyLnV1aWR2NCgpIClcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGZ1bmN0aW9uIGlzVmFsaWRCbG9ja1RleHQoIHNlbGYgOkJsb2NrUmVuZGVyZXIgKXtcclxuXHRcdFx0dHJ5e1xyXG5cdFx0XHRcdGxldCB0ID0gc2VsZi50ZXh0O1xyXG5cdFx0XHRcdHQudHJpbSgpO1xyXG5cdFx0XHRcdGlmICggdCA9PSAnJyl7XHJcblx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0bGV0IGJsb2NrRGF0YSA9IEpTT05IYW5kbGVyLmRlc2VyaWFsaXplPEJsb2NrRGF0YT4oQmxvY2tEYXRhICwgdCwgQmxvY2tEYXRhLnNjaGVtZXMuUEFHRSApO1xyXG5cdFx0XHRcdHJldHVybiBibG9ja0RhdGE7XHJcblx0XHRcdH1jYXRjaChlKXtcclxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcclxuXHRcdFx0fVxyXG5cdFx0fSBcclxuXHRcdGxldCBibG9ja0RhdGEgOkJsb2NrRGF0YSB8IG51bGwgPSBpc1ZhbGlkQmxvY2tUZXh0KHRoaXMpO1xyXG5cdFx0XHJcblx0XHRcclxuXHRcdGlmICggYmxvY2tEYXRhICl7XHJcblx0XHQgIFxyXG5cdFx0XHRsZXQgc3lzdGVtUGF0aCA9IHBhdGguam9pbihQbHVnaW5IYW5kbGVyLlNZU1RFTVNfRk9MREVSX05BTUUsICdncm9iYXgxJywgUGx1Z2luSGFuZGxlci5TWVNURU1fVUlfQ09OVEFJTkVSX0ZPTERFUl9OQU1FLCAnZGVmYXVsdCcpO1xyXG5cdFx0XHRsZXQgb2JzaWRpYW5QYXRoID0gcGF0aC5qb2luKFBsdWdpbkhhbmRsZXIuc2VsZi5tYW5pZmVzdC5kaXIgYXMgc3RyaW5nLCBzeXN0ZW1QYXRoKTtcclxuXHRcdFxyXG5cdFx0XHRsZXQgQ1NTID0gYXdhaXQgRmlsZUhhbmRsZXIucmVhZEZpbGUob2JzaWRpYW5QYXRoICsgJy8nICsnc3R5bGUuY3NzJyk7XHJcblxyXG5cdFx0XHQgXHJcblx0XHRcdC8vIENyZWF0ZSBIVE1MIGVsZW1lbnRzIGZvciB0aGUgYmxvY2suXHJcblx0XHRcdGlmKCB3aW5kb3dbJ0dyb2JheFRUUlBHR2xvYmFsVmFyaWFibGUnXVtibG9ja0RhdGEuQmxvY2tVVUlEXSApe1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fSAgXHJcblx0XHRcdGxldCBjb250YWluZXIgPSB0aGlzLmVsZW1lbnQuY3JlYXRlRWwoJ2RpdicpO1xyXG5cdFx0XHRcdGNvbnRhaW5lci5zZXRBdHRyKCdkYXRhLWhhc1ZpZXdBY3RpdmUnLCd0cnVlJyk7XHJcblx0XHRcdGxldCBzdHlsZVx0XHQ9IGNvbnRhaW5lci5jcmVhdGVFbCgnc3R5bGUnKTtcclxuXHRcdFx0XHRzdHlsZS5pbm5lckhUTUwgPSBDU1M7IFxyXG5cdFx0XHRsZXQgQXBwQ29udGFpbmVyPSBjb250YWluZXIuY3JlYXRlRWwoJ2RpdicpO1xyXG5cdFx0XHRcdEFwcENvbnRhaW5lci5pZCA9IGJsb2NrRGF0YS5CbG9ja1VVSUQ7IFxyXG5cdFx0XHRsZXQgc2NyaXB0XHRcdD0gY29udGFpbmVyLmNyZWF0ZUVsKCdzY3JpcHQnKTtcclxuXHRcdFx0c2NyaXB0LnNldEF0dHJpYnV0ZSgndHlwZScsJ21vZHVsZScpOyBcclxuXHRcdCAgXHJcblx0XHRcdC8vIGdldCB0aGUgcmlnaHQgU3lzdGVtIFByZXZpZXcgXHJcblx0XHRcdGxldCBzeXMgPSBhd2FpdCB0aGlzLmdldFN5c3RlbShBcHBDb250YWluZXIsIGJsb2NrRGF0YSkgYXMgVFRSUEdTeXN0ZW1KU09ORm9ybWF0dGluZztcclxuXHRcdFx0aWYoIXN5cyl7XHJcblx0XHRcdFx0cmV0dXJuO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHQvLyBTZXQgU3lzdGVtVmFsdWVzIFxyXG5cdFx0XHR0aGlzLnNldFN5c3RlbVZhbHVlc0Zyb21CbG9ja0RhdGEoc3lzLGJsb2NrRGF0YSk7XHJcbiAgXHJcblx0XHRcdC8vIEFERCBBbEwgVUlcclxuXHRcdFx0d2luZG93WydHcm9iYXhUVFJQR0dsb2JhbFZhcmlhYmxlJ11bYmxvY2tEYXRhLkJsb2NrVVVJRF0gPXt9O1xyXG5cdFx0XHR3aW5kb3dbJ0dyb2JheFRUUlBHR2xvYmFsVmFyaWFibGUnXVtibG9ja0RhdGEuQmxvY2tVVUlEXVsnc3lzJ10gPSBzeXM7IFxyXG5cdFx0XHR3aW5kb3dbJ0dyb2JheFRUUlBHR2xvYmFsVmFyaWFibGUnXVtibG9ja0RhdGEuQmxvY2tVVUlEXVsnZnVuYyddID0gXHJcblx0XHRcdCggbGF5b3V0Q2hhbmdlICwgc3lzdGVtICkgPT4ge1xyXG5cdFx0XHRcdGJsb2NrRGF0YS5sYXlvdXQgPSBsYXlvdXRDaGFuZ2U7XHJcblx0XHRcdFx0YmxvY2tEYXRhLmNoYXJhY3RlclZhbHVlcyA9IEJsb2NrUmVuZGVyZXIuZ2V0U3lzdGVtVmFsdWVzRm9yQmxvY2tEYXRhKHN5c3RlbSk7IFxyXG5cdFx0XHRcdGNvbnN0IHR4dCA9IEpTT05IYW5kbGVyLnNlcmlhbGl6ZShibG9ja0RhdGEgLCBCbG9ja0RhdGFTY2hlbWVzLlBBR0UgKTsgXHJcblx0XHRcdFx0d2luZG93WydHcm9iYXhUVFJQR0dsb2JhbFZhcmlhYmxlJ11bYmxvY2tEYXRhLkJsb2NrVVVJRF0gPSB1bmRlZmluZWQ7XHJcblx0XHRcdFx0dGhpcy53cml0ZUJsb2NrKHR4dCk7XHJcblxyXG5cdFx0XHRcclxuXHRcdFx0fTsgXHJcblx0XHRcdGxldCBwYXRoX0pTID0gUGx1Z2luSGFuZGxlci5BcHAudmF1bHQuYWRhcHRlci5nZXRSZXNvdXJjZVBhdGgob2JzaWRpYW5QYXRoICsgJy8nICsnY29tcG9uZW50cy5qcycpOyBcclxuXHRcdFx0XHJcblx0XHRcdC8vIEEgSGFjayAtIGJlY2F1c2UgcGFzdGluZyB0aGUgc3RyaW5nIHJlbW92ZXMgdGhlIHJpZ2h0IFxcIHN5bWJvbHMsIHNvIHdlIGp1c3QgYWRkIGFuIGV4dHJhIHdoZXJlIGl0IGlzIG5lZWRlZC5cclxuXHRcdFx0Y29uc3QgdGV4dERhdGEgPSBKU09OLnN0cmluZ2lmeShibG9ja0RhdGEubGF5b3V0KS5yZXBsYWNlQWxsKCdcXFwiJywnXFxcXFwiJyk7XHJcblx0XHRcdHNjcmlwdC5pbm5lckhUTUwgPSBgIFxyXG5cdFx0XHRcdGltcG9ydCBBcHAgZnJvbSAnJHtwYXRoX0pTfSc7XHRcclxuXHRcdFx0XHRsZXQga2V5ID0gJyR7YmxvY2tEYXRhLkJsb2NrVVVJRH0nO1xyXG5cdFx0XHRcdGNvbnN0IHN5cyA9IHdpbmRvd1snR3JvYmF4VFRSUEdHbG9iYWxWYXJpYWJsZSddWycke2Jsb2NrRGF0YS5CbG9ja1VVSUR9J11bJ3N5cyddO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHRcdGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnJHtibG9ja0RhdGEuQmxvY2tVVUlEfScpO1xyXG5cdFx0XHRcdGNvbnN0IHRleHREYXRhPSAnYCt0ZXh0RGF0YStgJztcclxuXHRcdFx0XHQgXHJcblx0XHRcdFx0Y29uc3QgYXBwID0gbmV3IEFwcCh7XHJcblx0XHRcdFx0XHR0YXJnZXQ6ZWxlbWVudCxcclxuXHRcdFx0XHRcdHByb3BzOiB7XHJcblx0XHRcdFx0XHRcdHRleHREYXRhOnRleHREYXRhLFxyXG5cdFx0XHRcdFx0XHRzeXM6c3lzLFxyXG5cdFx0XHRcdFx0XHR3cml0ZUJsb2NrOndpbmRvd1snR3JvYmF4VFRSUEdHbG9iYWxWYXJpYWJsZSddWycke2Jsb2NrRGF0YS5CbG9ja1VVSUR9J11bJ2Z1bmMnXVxyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdH0pOyAgXHJcblx0XHRcdGA7XHJcbiBcclxuXHRcdFx0IFxyXG5cdFx0fWVsc2V7XHJcblx0XHRcdG5ldyBCbG9ja1N0YXJ0ZXIoe1xyXG5cdFx0XHRcdHRhcmdldDp0aGlzLmVsZW1lbnQsXHJcblx0XHRcdFx0cHJvcHM6e1xyXG5cdFx0XHRcdFx0V3JpdGVEb3duOiAodHh0KSA9PnRoaXMud3JpdGVCbG9jayh0eHQpXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9KTtcclxuXHRcdH0gXHJcblx0fVxyXG59IiwiaW1wb3J0IHsgQXBwLCBJdGVtVmlldywgTW9kYWwsIFBsYXRmb3JtLCBQbHVnaW4sIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcsIFRGaWxlLCBXb3Jrc3BhY2VMZWFmLCBwYXJzZVlhbWwgfSBmcm9tICdvYnNpZGlhbic7XHJcbmltcG9ydCAgU3ZlbHRlQXBwIGZyb20gJy4vVUlJbnRlcmZhY2VzL0Rlc2lnbmVyMDIvYXBwLnN2ZWx0ZSc7XHJcbmltcG9ydCB7IEJsb2NrUmVuZGVyZXIgfSBmcm9tICcuL0Jsb2NrUmVuZGVyZXIvQmxvY2tSZW5kZXJlcic7XHJcbiBcclxuXHJcbmNvbnN0IFZJRVdfVFlQRSA9IFwic3ZlbHRlLXZpZXdcIjsgICAgXHJcbmludGVyZmFjZSBNeVBsdWdpblNldHRpbmdzIHtcclxuXHRteVNldHRpbmc6IHN0cmluZztcclxuIFxyXG59XHJcblxyXG5jb25zdCBERUZBVUxUX1NFVFRJTkdTOiBNeVBsdWdpblNldHRpbmdzID0ge1xyXG5cdG15U2V0dGluZzogJ2RlZmF1bHQnXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsdWdpbkhhbmRsZXIgZXh0ZW5kcyBQbHVnaW4geyBcclxuXHJcblx0cHVibGljIHN0YXRpYyBBcHAgOiBBcHA7IFxyXG5cdHB1YmxpYyBzdGF0aWMgUk9PVFx0XHQgIFx0OiBzdHJpbmc7XHRcclxuXHRwdWJsaWMgc3RhdGljIFBMVUdJTl9ST09UXHQ6IHN0cmluZztcclxuXHRwdWJsaWMgc3RhdGljIFNZU1RFTVNfRk9MREVSX05BTUVcdDogc3RyaW5nO1xyXG5cdHB1YmxpYyBzdGF0aWMgQlVJTFRJTl9VSVNfRk9MREVSX05BTUVcdDogc3RyaW5nO1xyXG5cdHB1YmxpYyBzdGF0aWMgU1lTVEVNX1VJX0NPTlRBSU5FUl9GT0xERVJfTkFNRVx0OiBzdHJpbmc7XHJcblx0cHVibGljIHN0YXRpYyBTWVNURU1fVUlfTEFZT1VURklMRU5BTUVcdDogc3RyaW5nO1xyXG5cdHB1YmxpYyBzdGF0aWMgU1lTVEVNX0xBWU9VVF9CTE9DS05BTUUgOnN0cmluZztcclxuXHRwdWJsaWMgc3RhdGljIEdMT0JBTF9TWVNURU1fUEFTU0VSIDpzdHJpbmc7XHJcblxyXG5cdHB1YmxpYyBzdGF0aWMgc2VsZlx0XHRcdDogUGx1Z2luSGFuZGxlcjsgXHJcblx0XHJcblx0Ly9AdHMtaWdub3JlXHJcblx0c2V0dGluZ3M6IE15UGx1Z2luU2V0dGluZ3M7ICBcclxuXHJcblx0cHVibGljIHN0YXRpYyB1dWlkdjQoKSB7XHJcblx0XHRyZXR1cm4gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCdcclxuXHRcdC5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uIChjKSB7XHJcblx0XHRcdGNvbnN0IHIgPSBNYXRoLnJhbmRvbSgpICogMTYgfCAwLCBcclxuXHRcdFx0XHR2ID0gYyA9PSAneCcgPyByIDogKHIgJiAweDMgfCAweDgpO1xyXG5cdFx0XHRyZXR1cm4gdi50b1N0cmluZygxNik7XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGFzeW5jIG9ubG9hZCgpIHtcclxuXHJcblx0XHRhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpOyBcclxuXHRcdFBsdWdpbkhhbmRsZXIuc2VsZiA9IHRoaXM7XHJcblx0XHRQbHVnaW5IYW5kbGVyLkFwcCAgPSB0aGlzLmFwcDsgIFxyXG5cdFx0UGx1Z2luSGFuZGxlci5ST09UID0gUGx1Z2luSGFuZGxlci5BcHAudmF1bHQuY29uZmlnRGlyOyBcclxuXHRcdFBsdWdpbkhhbmRsZXIuUExVR0lOX1JPT1QgPSB0aGlzLm1hbmlmZXN0LmRpciBhcyBzdHJpbmc7IFxyXG5cdFx0XHJcblx0XHQvLyBGT0xERVJTIFxyXG5cdFx0UGx1Z2luSGFuZGxlci5TWVNURU1TX0ZPTERFUl9OQU1FIFx0XHRcdFx0PSBcIlN5c3RlbXNcIlxyXG5cdFx0UGx1Z2luSGFuZGxlci5CVUlMVElOX1VJU19GT0xERVJfTkFNRSBcdFx0XHQ9IFwic3ViUHJvamVjdHMvQmxvY2tVSURldlwiO1xyXG5cdFx0UGx1Z2luSGFuZGxlci5TWVNURU1fVUlfQ09OVEFJTkVSX0ZPTERFUl9OQU1FIFx0PSAnVUlMYXlvdXRzJztcclxuXHRcdFBsdWdpbkhhbmRsZXIuU1lTVEVNX1VJX0xBWU9VVEZJTEVOQU1FIFx0XHRcdD0gXCJVSVByZXZpZXcuanNvblwiXHJcblxyXG5cdFx0Ly8gU3RyaW5ncyB1c2VkIGZvciBnbG9iYWwgdmFyaWFibGVzIFxyXG5cdFx0UGx1Z2luSGFuZGxlci5HTE9CQUxfU1lTVEVNX1BBU1NFUlx0XHRcdFx0PSAnR3JvYmF4VFRSUEdHbG9iYWxWYXJpYWJsZSc7XHJcblx0XHRcclxuXHJcblx0XHRQbHVnaW5IYW5kbGVyLlNZU1RFTV9MQVlPVVRfQkxPQ0tOQU1FIFx0XHRcdD0gXCJUVFJQR1wiO1x0XHJcblx0XHQgXHJcblx0XHQvLyBhZGQgUmliYm9uIEljb25zLCB0aGVzZSBhcmUgdGhlIGljb25zIGluIHRoZSBsZWZ0IGJhciBvZiB0aGUgd2luZG93XHJcblx0XHR0aGlzLmFkZFJpYmJvbkljb24oJ2RpY2UnLCAnSGFuc3NcXCcgUGx1Z2luJywgKGV2dDogTW91c2VFdmVudCkgPT4ge1xyXG5cdFx0XHRuZXcgTW9kYWxNb3VudCh0aGlzLmFwcCwgdGhpcyApLm9wZW4oKTsgXHJcblx0XHR9KTtcclxuXHRcdHRoaXMuYXBwLndvcmtzcGFjZS5vbkxheW91dFJlYWR5KHRoaXMub25MYXlvdXRSZWFkeS5iaW5kKHRoaXMpKTtcclxuXHRcdCBcclxuXHRcdC8vIEFkZGluZiB0aGUgdGFiIGluIHNldHRpbmdzLiBcclxuXHRcdHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgU2FtcGxlU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xyXG5cclxuXHRcdHRoaXMucmVnaXN0ZXJNYXJrZG93bkNvZGVCbG9ja1Byb2Nlc3NvcihQbHVnaW5IYW5kbGVyLlNZU1RFTV9MQVlPVVRfQkxPQ0tOQU1FLCAoc291cmNlLCBlbCwgY3R4KSA9PiB7XHJcblx0XHRcdGNvbnN0IHJlbmRlcmVyID0gbmV3IEJsb2NrUmVuZGVyZXIoc291cmNlLGVsLGN0eCk7XHJcblx0XHRcdHJlbmRlcmVyLnJlbmRlcigpOyBcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMucmVnaXN0ZXJFdmVudChcclxuXHRcdFx0dGhpcy5hcHAud29ya3NwYWNlLm9uKCdhY3RpdmUtbGVhZi1jaGFuZ2UnLCAobGVhZikgPT4ge1xyXG5cdFx0XHRcdGlmIChsZWFmKSB7XHJcblx0XHRcdFx0XHR3aW5kb3dbUGx1Z2luSGFuZGxlci5HTE9CQUxfU1lTVEVNX1BBU1NFUl0gPSB7fTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0pXHJcblx0XHQpO1xyXG5cdCAgXHJcblx0XHRcclxuXHR9IFxyXG5cdG9uTGF5b3V0UmVhZHkoKTogdm9pZCB7XHJcblx0XHRpZiAodGhpcy5hcHAud29ya3NwYWNlLmdldExlYXZlc09mVHlwZShWSUVXX1RZUEUpLmxlbmd0aCkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHR0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0UmlnaHRMZWFmKGZhbHNlKT8uc2V0Vmlld1N0YXRlKHtcclxuXHRcdFx0dHlwZTogVklFV19UWVBFLFxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRhc3luYyBsb2FkU2V0dGluZ3MoKSB7XHJcblx0XHR0aGlzLnNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwgREVGQVVMVF9TRVRUSU5HUywgYXdhaXQgdGhpcy5sb2FkRGF0YSgpKTtcclxuXHR9XHJcblxyXG59XHJcblxyXG5jbGFzcyBTYW1wbGVTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XHJcblx0cGx1Z2luOiBQbHVnaW5IYW5kbGVyO1xyXG5cdFxyXG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IFBsdWdpbkhhbmRsZXIpIHtcclxuXHRcdHN1cGVyKGFwcCwgcGx1Z2luKTtcclxuXHRcdHRoaXMucGx1Z2luID0gcGx1Z2luO1xyXG5cdH0gXHJcblxyXG5cdGRpc3BsYXkoKTogdm9pZCB7XHJcblx0XHRjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzOyBcclxuXHRcdGNvbnRhaW5lckVsLmVtcHR5KCk7ICAgIFxyXG5cdFx0bmV3IFN2ZWx0ZUFwcCh7XHJcblx0XHRcdHRhcmdldDp0aGlzLmNvbnRhaW5lckVsLFxyXG5cdFx0XHRwcm9wczp7XHJcblx0XHRcdFx0Ly9AdHMtaWdub3JlXHJcblx0XHRcdFx0cGx1Z2luOiB0aGlzLnBsdWdpblxyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG59XHJcbmNsYXNzIE1vZGFsTW91bnQgZXh0ZW5kcyBNb2RhbCB7ICBcclxuXHRwbHVnaW46ICBQbHVnaW5IYW5kbGVyOyBcclxuXHJcblx0Y29uc3RydWN0b3IoYXBwOiBBcHAgLCBwbHVnaW46IFBsdWdpbkhhbmRsZXIpIHtcclxuXHRcdHN1cGVyKGFwcCk7XHJcblx0XHR0aGlzLnBsdWdpbiA9IHBsdWdpbjsgXHJcblx0fSBcclxuXHJcblx0b25PcGVuKCkge1xyXG5cdFx0bmV3IFN2ZWx0ZUFwcCh7XHJcblx0XHRcdHRhcmdldDp0aGlzLmNvbnRlbnRFbCxcclxuXHRcdFx0cHJvcHM6e1xyXG5cdFx0XHRcdC8vQHRzLWlnbm9yZVxyXG5cdFx0XHRcdHBsdWdpbjogdGhpcy5wbHVnaW5cclxuXHRcdFx0fVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRvbkNsb3NlKCkge1xyXG5cdFx0Y29uc3Qge2NvbnRlbnRFbH0gPSB0aGlzO1xyXG5cdFx0Y29udGVudEVsLmVtcHR5KCk7XHJcblx0fVxyXG59Il0sIm5hbWVzIjpbInZhbHVlIiwibm93IiwiY2hpbGRyZW4iLCJlbGVtZW50IiwidGV4dCIsImhhc2giLCJkZXRhY2giLCJpbml0IiwiY3JlYXRlX2VhY2hfYmxvY2siLCJpbnN0YW5jZSIsImNyZWF0ZV9mcmFnbWVudCIsImxpbmVhciIsImN0eCIsImFjdGl2ZSIsImRpc3BhdGNoIiwiZCIsImIiLCJfX2Fzc2lnbiIsInYiLCJjcmVhdGVfaWZfYmxvY2siLCJ1cGRhdGUiLCJzdWJzY3JpYmUiLCJydW4iLCJjcmVhdGVfaWZfYmxvY2tfMSIsIlNlbWFwaG9yZSIsIk11dGV4IiwicGF0aCIsIkpTT05fVEFHUyIsIkpTT05fQkFTRVRZUEVTIiwiUmVmbGVjdCIsIkpTT05IYW5kbGVyIiwiaSIsImoiLCJvYmoiLCJyZXMiLCJlIiwidHlwZWtleSIsIktleU1hbmFnZXJfMSIsIktleU1hbmFnZXIiLCJBR3JhcGhJdGVtXzEiLCJyZXF1aXJlJCQwIiwiQUdyYXBoSXRlbSIsInRzbGliXzEiLCJyZXF1aXJlJCQxIiwiR3JvYkRlcml2ZWRPcmlnaW4iLCJfc3VwZXIiLCJHcm9iTm9kZSIsIkdyb2JGaXhlZE5vZGUiLCJzeW1ib2xzIiwicmVjIiwic3RhdGVtZW50IiwiR3JvYkNvbGxlY3Rpb25fMSIsIkdyb2JDb2xsZWN0aW9uIiwiR3JvYkdyb3VwXzEiLCJHcm9iR3JvdXAiLCJUVFJQR1N5c3RlbUdyYXBoQWJzdHJhY3RNb2RlbF8xIiwiSU91dHB1dEhhbmRsZXJfMSIsInJlcXVpcmUkJDIiLCJUVFJQR1N5c3RlbUdyYXBoQWJzdHJhY3RNb2RlbCIsIlRUUlBHU3lzdGVtR3JhcGhNb2RlbF8xIiwicmVxdWlyZSQkMyIsIlRUUlBHU3lzdGVtR3JhcGhNb2RlbCIsImV4cG9ydHMiLCJHcm9iTm9kdGVfMSIsInJlcXVpcmUkJDQiLCJfX2RlY29yYXRlQ2xhc3MiLCJHcm9iRGVyaXZlZE5vZGUiLCJUVFJQR1N5c3RlbSIsInV1aWR2NCIsImtleU1hbmFnZXJJbnN0YW5jZSIsImZvbGRlciIsIl9iIiwiX2EiLCJfZCIsIl9jIiwiX2YiLCJfZSIsIl9oIiwiX2ciLCJfaiIsIl9pIiwiX2wiLCJfayIsIl9uIiwiX20iLCJDTm9kZSIsIlNoZWV0Q29sdW1uIiwiU2hlZXRSb3ciLCJTaGVldERhdGEiLCJhcHAiLCJibG9ja0RhdGEiLCJQbHVnaW4iLCJQbHVnaW5TZXR0aW5nVGFiIiwiU3ZlbHRlQXBwIiwiTW9kYWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLFNBQVMsT0FBTztBQUFHO0FBQ25CLE1BQU0sV0FBVyxPQUFLO0FBaUJ0QixTQUFTLElBQUksSUFBSTtBQUNiLFNBQU8sR0FBRTtBQUNiO0FBQ0EsU0FBUyxlQUFlO0FBQ3BCLFNBQU8sdUJBQU8sT0FBTyxJQUFJO0FBQzdCO0FBQ0EsU0FBUyxRQUFRLEtBQUs7QUFDbEIsTUFBSSxRQUFRLEdBQUc7QUFDbkI7QUFDQSxTQUFTLFlBQVksT0FBTztBQUN4QixTQUFPLE9BQU8sVUFBVTtBQUM1QjtBQUNBLFNBQVMsZUFBZSxHQUFHLEdBQUc7QUFDMUIsU0FBTyxLQUFLLElBQUksS0FBSyxJQUFJLE1BQU0sTUFBTyxLQUFLLE9BQU8sTUFBTSxZQUFhLE9BQU8sTUFBTTtBQUN0RjtBQVlBLFNBQVMsU0FBUyxLQUFLO0FBQ25CLFNBQU8sT0FBTyxLQUFLLEdBQUcsRUFBRSxXQUFXO0FBQ3ZDO0FBTUEsU0FBUyxVQUFVLFVBQVUsV0FBVztBQUNwQyxNQUFJLFNBQVMsTUFBTTtBQUNmLFdBQU87QUFBQSxFQUNWO0FBQ0QsUUFBTSxRQUFRLE1BQU0sVUFBVSxHQUFHLFNBQVM7QUFDMUMsU0FBTyxNQUFNLGNBQWMsTUFBTSxNQUFNLFlBQVcsSUFBSztBQUMzRDtBQU1BLFNBQVMsb0JBQW9CLFdBQVcsT0FBTyxVQUFVO0FBQ3JELFlBQVUsR0FBRyxXQUFXLEtBQUssVUFBVSxPQUFPLFFBQVEsQ0FBQztBQUMzRDtBQTZGQSxTQUFTLGVBQWVBLFFBQU87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
