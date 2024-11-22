"use strict";
var __defProp2 = Object.defineProperty;
var __defNormalProp = (obj, key, value2) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value: value2 }) : obj[key] = value2;
var __publicField = (obj, key, value2) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value2);
  return value2;
};
const obsidian = require("obsidian");
require("events");
require("console");
function noop() {
}
const identity = (x) => x;
function assign(tar, src) {
  for (const k in src)
    tar[k] = src[k];
  return tar;
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
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
  let value2;
  subscribe(store, (_) => value2 = _)();
  return value2;
}
function component_subscribe(component, store, callback) {
  component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, $$scope, fn) {
  if (definition) {
    const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
    return definition[0](slot_ctx);
  }
}
function get_slot_context(definition, ctx, $$scope, fn) {
  return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
  if (definition[2] && fn) {
    const lets = definition[2](fn(dirty));
    if ($$scope.dirty === void 0) {
      return lets;
    }
    if (typeof lets === "object") {
      const merged = [];
      const len = Math.max($$scope.dirty.length, lets.length);
      for (let i = 0; i < len; i += 1) {
        merged[i] = $$scope.dirty[i] | lets[i];
      }
      return merged;
    }
    return $$scope.dirty | lets;
  }
  return $$scope.dirty;
}
function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
  if (slot_changes) {
    const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
    slot.p(slot_context, slot_changes);
  }
}
function get_all_dirty_from_scope($$scope) {
  if ($$scope.ctx.length > 32) {
    const dirty = [];
    const length = $$scope.ctx.length / 32;
    for (let i = 0; i < length; i++) {
      dirty[i] = -1;
    }
    return dirty;
  }
  return -1;
}
function action_destroyer(action_result) {
  return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
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
function append_styles(target, style_sheet_id, styles) {
  const append_styles_to = get_root_for_style(target);
  if (!append_styles_to.getElementById(style_sheet_id)) {
    const style = element("style");
    style.id = style_sheet_id;
    style.textContent = styles;
    append_stylesheet(append_styles_to, style);
  }
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
function empty() {
  return text("");
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
function to_number(value2) {
  return value2 === "" ? null : +value2;
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
function set_input_value(input, value2) {
  input.value = value2 == null ? "" : value2;
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
function bind(component, name, callback) {
  const index = component.$$.props[name];
  if (index !== void 0) {
    component.$$.bound[index] = callback;
    callback(component.$$.ctx[index]);
  }
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
function init(component, options, instance2, create_fragment2, not_equal, props, append_styles2, dirty = [-1]) {
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
  append_styles2 && append_styles2($$.root);
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
const Designer$1 = "";
function create_fragment$n(ctx) {
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
      t0 = text("				Grobax' TTRPG.\n				Make a ```TTRPG ``` block in an article. then you get to setup your block.\n				choosing a system, and then a UI for that system.\n\n				There are a standard Layouts, but you are able to use editing systems to change the layout,\n				You can use the Edit button to change single view settings.\n				The layout is made up of rows, then columns, then items in rows.\n				You can use edit rows to add, delete and switch the placing of these rows along with their contents.\n\n				You can use edit columns to add, delete and switch places of columns and their items. \n\n				You can use edit Items to add, delete items in the columns, you can also asign an item a view, as well as drag them into other columns. \n				in this mode you are also given access to buttons to manouver the item's position in that column.\n			");
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
      t0 = claim_text(pre_nodes, "				Grobax' TTRPG.\n				Make a ```TTRPG ``` block in an article. then you get to setup your block.\n				choosing a system, and then a UI for that system.\n\n				There are a standard Layouts, but you are able to use editing systems to change the layout,\n				You can use the Edit button to change single view settings.\n				The layout is made up of rows, then columns, then items in rows.\n				You can use edit rows to add, delete and switch the placing of these rows along with their contents.\n\n				You can use edit columns to add, delete and switch places of columns and their items. \n\n				You can use edit Items to add, delete items in the columns, you can also asign an item a view, as well as drag them into other columns. \n				in this mode you are also given access to buttons to manouver the item's position in that column.\n			");
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
    init(this, options, null, create_fragment$n, safe_not_equal, {});
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
function create_fragment$m(ctx) {
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
function instance$m($$self, $$props, $$invalidate) {
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
    init(this, options, instance$m, create_fragment$m, safe_not_equal, { color: 0 });
  }
}
function get_each_context$6(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[16] = list[i];
  child_ctx[17] = list;
  child_ctx[18] = i;
  return child_ctx;
}
function create_each_block$6(key_1, ctx) {
  let button;
  let div;
  let t_value = ctx[16].name + "";
  let t;
  let button_data_selected_value;
  let button_transition;
  let current;
  let mounted;
  let dispose;
  function div_input_handler() {
    ctx[10].call(div, ctx[17], ctx[18]);
  }
  function click_handler() {
    return ctx[11](ctx[16]);
  }
  return {
    key: key_1,
    first: null,
    c() {
      button = element("button");
      div = element("div");
      t = text(t_value);
      this.h();
    },
    l(nodes) {
      button = claim_element(nodes, "BUTTON", {
        class: true,
        "data-selected": true,
        "data-can-hover": true
      });
      var button_nodes = children(button);
      div = claim_element(button_nodes, "DIV", {
        tabindex: true,
        class: true,
        contenteditable: true
      });
      var div_nodes = children(div);
      t = claim_text(div_nodes, t_value);
      div_nodes.forEach(detach);
      button_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div, "tabindex", "-1");
      attr(div, "class", "Editable_column");
      attr(div, "contenteditable", "false");
      if (ctx[16].name === void 0)
        add_render_callback(div_input_handler);
      attr(button, "class", "Editable_row");
      attr(button, "data-selected", button_data_selected_value = ctx[16].isSelected);
      attr(button, "data-can-hover", true);
      this.first = button;
    },
    m(target, anchor) {
      insert_hydration(target, button, anchor);
      append_hydration(button, div);
      append_hydration(div, t);
      if (ctx[16].name !== void 0) {
        div.textContent = ctx[16].name;
      }
      current = true;
      if (!mounted) {
        dispose = [
          listen(div, "input", div_input_handler),
          listen(div, "click", click_handler),
          listen(div, "keyup", ctx[9])
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if ((!current || dirty & 4) && t_value !== (t_value = ctx[16].name + ""))
        set_data_maybe_contenteditable(t, t_value, "false");
      if (dirty & 4 && ctx[16].name !== div.textContent) {
        div.textContent = ctx[16].name;
      }
      if (!current || dirty & 4 && button_data_selected_value !== (button_data_selected_value = ctx[16].isSelected)) {
        attr(button, "data-selected", button_data_selected_value);
      }
    },
    i(local) {
      if (current)
        return;
      add_render_callback(() => {
        if (!current)
          return;
        if (!button_transition)
          button_transition = create_bidirectional_transition(button, slide, {}, true);
        button_transition.run(1);
      });
      current = true;
    },
    o(local) {
      if (!button_transition)
        button_transition = create_bidirectional_transition(button, slide, {}, false);
      button_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(button);
      if (detaching && button_transition)
        button_transition.end();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block$e(ctx) {
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
function create_fragment$l(ctx) {
  let div;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let t;
  let div_class_value;
  let current;
  let each_value = ctx[2];
  const get_key = (ctx2) => ctx2[16].key;
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$6(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$6(key, child_ctx));
  }
  let if_block = ctx[1] != null && create_if_block$e(ctx);
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
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$6, t, get_each_context$6);
        check_outros();
      }
      if (ctx2[1] != null) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & 2) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$e(ctx2);
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
function instance$l($$self, $$props, $$invalidate) {
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
  function div_input_handler(each_value, e_index) {
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
    div_input_handler,
    click_handler,
    click_handler_1,
    keyup_handler_1
  ];
}
class EditAbleList extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$l, create_fragment$l, safe_not_equal, {
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
function get_each_context$5(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[12] = list[i][0];
  child_ctx[13] = list[i][1];
  const constants_0 = child_ctx[13].msg.replace("\n", "<br />");
  child_ctx[14] = constants_0;
  return child_ctx;
}
function create_if_block$d(ctx) {
  let div;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let div_transition;
  let current;
  let each_value = ctx[2];
  const get_key = (ctx2) => ctx2[12];
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$5(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
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
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div, fix_and_outro_and_destroy_block, create_each_block$5, null, get_each_context$5);
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
function create_if_block_1$9(ctx) {
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
function create_each_block$5(key_1, ctx) {
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
  let if_block = ctx[0] && ctx[13].type == MessageTypes.error && create_if_block_1$9(ctx);
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
          if_block = create_if_block_1$9(ctx);
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
function create_fragment$k(ctx) {
  let div;
  let current;
  let if_block = ctx[1] != 0 && create_if_block$d(ctx);
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
          if_block = create_if_block$d(ctx2);
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
function instance$k($$self, $$props, $$invalidate) {
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
    init(this, options, instance$k, create_fragment$k, safe_not_equal, {
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
class Layout01Context {
  constructor() {
    __publicField(this, "activeSystem");
    __publicField(this, "availablePreviews");
    __publicField(this, "API");
    __publicField(this, "mainAppContainer");
    __publicField(this, "uiSystem");
    __publicField(this, "uiGuid");
  }
}
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
var TTRPGSystemGraphModel = {};
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
var TTRPGSystemGraphAbstractModel$1 = {};
var GrobCollection$1 = {};
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
Object.defineProperty(GrobCollection$1, "__esModule", { value: true });
GrobCollection$1.GrobCollection = void 0;
var tslib_1$4 = require$$0;
var AGraphItem_1$2 = AGraphItem$1;
var GrobCollection = function(_super2) {
  tslib_1$4.__extends(GrobCollection2, _super2);
  function GrobCollection2(name, parent) {
    var _this = _super2.call(this, name, "C") || this;
    _this.nodes_names = {};
    _this.updateListeners = {};
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
    if (oldName == newName) {
      return;
    }
    if (!this.nodes_names[oldName]) {
      return;
    }
    this.nodes_names[oldName].setName(newName, true);
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
    this.getNodes().forEach(function(node) {
      node.update();
    });
    this.callUpdateListeners();
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
  GrobCollection2.prototype.getCollectionType = function() {
    return this.colType;
  };
  GrobCollection2.prototype.setCollectionType = function(colType) {
    if (this.colType != null && colType != colType) {
      throw new Error("tried to convert a group type after Setting. Denied Action");
    }
    this.colType = colType;
  };
  GrobCollection2.prototype.update = function() {
    this.callUpdateListeners();
  };
  GrobCollection2.prototype.callUpdateListeners = function() {
    var _this = this;
    Object.keys(this.updateListeners).forEach(function(key) {
      _this.updateListeners[key]();
    });
    return true;
  };
  GrobCollection2.prototype.addUpdateListener = function(key, listener) {
    if (this.updateListeners[key] != void 0) {
      console.error("tried to add updatelistener to node with key:" + key + ". but there was already a listener using that key");
      return false;
    }
    this.updateListeners[key] = listener;
  };
  GrobCollection2.prototype.removeUpdateListener = function(key) {
    delete this.updateListeners[key];
  };
  GrobCollection2.prototype.removeAllUpdateListeners = function() {
    this.updateListeners = {};
  };
  return GrobCollection2;
}(AGraphItem_1$2.AGraphItem);
GrobCollection$1.GrobCollection = GrobCollection;
var GrobGroup$1 = {};
Object.defineProperty(GrobGroup$1, "__esModule", { value: true });
GrobGroup$1.GrobGroup = void 0;
var tslib_1$3 = require$$0;
var AGraphItem_1$1 = AGraphItem$1;
var GrobGroup = function(_super2) {
  tslib_1$3.__extends(GrobGroup2, _super2);
  function GrobGroup2(name, parent) {
    var _this = _super2.call(this, name, "G") || this;
    _this.collections_names = {};
    _this.updateListeners = {};
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
    collection.setCollectionType(this.groupType);
    this.callUpdateListeners();
    return true;
  };
  GrobGroup2.prototype.removeCollection = function(collection) {
    var name = collection.getName();
    var c = this.collections_names[name];
    if (!c)
      return false;
    collection.dispose();
    delete this.collections_names[name];
    this.callUpdateListeners();
    return this.collections_names[name] == null;
  };
  GrobGroup2.prototype.update_collection_name = function(oldName, newName) {
    if (!this.collections_names[oldName])
      return;
    this.collections_names[newName] = this.collections_names[oldName];
    delete this.collections_names[oldName];
    this.collections_names[newName].setName(newName);
  };
  GrobGroup2.prototype.setName = function(name) {
    _super2.prototype.setName.call(this, name);
    for (var name_1 in this.collections_names) {
      var curr = this.collections_names[name_1];
      curr.updateLocation(this);
    }
    this.callUpdateListeners();
  };
  GrobGroup2.prototype.dispose = function() {
    for (var name in this.collections_names) {
      var curr = this.collections_names[name];
      curr.dispose();
      delete this.collections_names[name];
    }
    this.name = null;
  };
  GrobGroup2.prototype.getGroupType = function() {
    return this.groupType;
  };
  GrobGroup2.prototype.setGroupType = function(groupType) {
    if (this.groupType != null && groupType != groupType) {
      throw new Error("tried to convert a group type after Setting. Denied Action");
    }
    this.groupType = groupType;
    Object.values(this.collections_names).forEach(function(col) {
      col.setCollectionType(groupType);
    });
  };
  GrobGroup2.prototype.update = function() {
    this.callUpdateListeners();
  };
  GrobGroup2.prototype.callUpdateListeners = function() {
    var _this = this;
    Object.keys(this.updateListeners).forEach(function(key) {
      _this.updateListeners[key]();
    });
    return true;
  };
  GrobGroup2.prototype.addUpdateListener = function(key, listener) {
    if (this.updateListeners[key] != void 0) {
      console.error("tried to add updatelistener to node with key:" + key + ". but there was already a listener using that key");
      return false;
    }
    this.updateListeners[key] = listener;
  };
  GrobGroup2.prototype.removeUpdateListener = function(key) {
    delete this.updateListeners[key];
  };
  GrobGroup2.prototype.removeAllUpdateListeners = function() {
    this.updateListeners = {};
  };
  return GrobGroup2;
}(AGraphItem_1$1.AGraphItem);
GrobGroup$1.GrobGroup = GrobGroup;
Object.defineProperty(TTRPGSystemGraphAbstractModel$1, "__esModule", { value: true });
TTRPGSystemGraphAbstractModel$1.TTRPGSystemGraphAbstractModel = void 0;
var GrobCollection_1 = GrobCollection$1;
var GrobGroup_1 = GrobGroup$1;
var IOutputHandler_1 = IOutputHandler;
var TTRPGSystemGraphAbstractModel = function() {
  function TTRPGSystemGraphAbstractModel2() {
    this.data = {};
  }
  TTRPGSystemGraphAbstractModel2.prototype.setOut = function(out) {
    this.out = out ? out : (0, IOutputHandler_1.newOutputHandler)();
  };
  TTRPGSystemGraphAbstractModel2.prototype._deleteGroup = function(group) {
    if (typeof group == "string") {
      var g_1 = this.getGroup(group);
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
  TTRPGSystemGraphAbstractModel2.prototype.getGroup = function(name) {
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
    if (collection.getCollectionType() != "Node") {
      throw new Error("Tried to Add Node to Non Node Collecton");
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
  TTRPGSystemGraphAbstractModel2.prototype._addTable = function(collection, table) {
    if (!collection) {
      this.out.outError("tried to add node, but supplied collection was invalid");
      return;
    }
    if (collection.getCollectionType() != "Table") {
      this.out.outError("Tried to Add table to Non Table Collecton");
      return;
    }
    return collection.addNode(table);
  };
  return TTRPGSystemGraphAbstractModel2;
}();
TTRPGSystemGraphAbstractModel$1.TTRPGSystemGraphAbstractModel = TTRPGSystemGraphAbstractModel;
var hasRequiredTTRPGSystemGraphModel;
function requireTTRPGSystemGraphModel() {
  if (hasRequiredTTRPGSystemGraphModel)
    return TTRPGSystemGraphModel;
  hasRequiredTTRPGSystemGraphModel = 1;
  Object.defineProperty(TTRPGSystemGraphModel, "__esModule", { value: true });
  TTRPGSystemGraphModel.TTRPGSystemGraphModel = void 0;
  var tslib_12 = require$$0;
  var IOutputHandler_12 = IOutputHandler;
  var TTRPGSystemGraphAbstractModel_1 = TTRPGSystemGraphAbstractModel$1;
  var index_1 = requireDist();
  var index_2 = requireDist();
  var derived = "derived";
  var fixed = "fixed";
  var TTRPGSystemGraphModel$1 = function(_super2) {
    tslib_12.__extends(TTRPGSystemGraphModel2, _super2);
    function TTRPGSystemGraphModel2() {
      var _this = _super2.call(this) || this;
      _this.setOut((0, IOutputHandler_12.newOutputHandler)());
      return _this;
    }
    TTRPGSystemGraphModel2.prototype.initAsNew = function() {
      this._createGroup("fixed");
      this._createGroup("derived");
      this._createGroup("extra");
      this.data["fixed"].setGroupType("Node");
      this.data["derived"].setGroupType("Node");
      this.data["extra"].setGroupType("Table");
    };
    TTRPGSystemGraphModel2.prototype.createCollection = function(group, name) {
      if (!this._hasGroup(group)) {
        this.out.outError("No group existed by name ".concat(group));
      }
      var grp = this.getGroup(group);
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
        var grp = this.getGroup(derived);
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
      var node = new index_2.GrobDerivedNode(name, col);
      col.addNode(node);
      return node;
    };
    TTRPGSystemGraphModel2.prototype.createFixedNode = function(col, name) {
      var grp = this.getGroup(fixed);
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
      var node = new index_1.GrobFixedNode(name, col);
      col.addNode(node);
      return node;
    };
    TTRPGSystemGraphModel2.prototype.hasCollection = function(group, name) {
      var grp = this.getGroup(group);
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
      var grp = this.getGroup(group);
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
        grp = this.getGroup(group);
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
        grp = this.getGroup(group);
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
      var grp = this.getGroup(group);
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
      var grp = this.getGroup(group);
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
        group = this.getGroup(group);
        if (!group) {
          this.out.outError("No Collection by name " + name);
          return false;
        }
      }
      _super2.prototype._deleteGroup.call(this, group);
    };
    TTRPGSystemGraphModel2.prototype.deleteCollection = function(group, col) {
      var grp = this.getGroup(group);
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
      var grp = this.getGroup(group);
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
        grp = this.getGroup(group);
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
      if (grp.getCollection(newName)) {
        this.out.outError("Collection already existed by name ".concat(newName, " in ").concat(grpName));
        return null;
      }
      return col.setName(newName);
    };
    TTRPGSystemGraphModel2.prototype.renameItem = function(group, col, oldName, newName) {
      var grp;
      var grpName;
      if (typeof group == "string") {
        grpName = group;
        grp = this.getGroup(group);
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
        for (var c = 0; c < collectionNames.length; c++) {
          var colIndex = c;
          key_collection = collectionNames[colIndex];
          collection = group.getCollection(key_collection);
          nodeNames = collection.getNodeNames();
          for (var n = 0; n < nodeNames.length; n++) {
            var nodeIndex = n;
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
    TTRPGSystemGraphModel2.prototype.getGroup = function(name) {
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
  TTRPGSystemGraphModel.TTRPGSystemGraphModel = TTRPGSystemGraphModel$1;
  return TTRPGSystemGraphModel;
}
var TTRPGSystemBonusDesigner = {};
var GrobBonusNode = {};
var GrobDerivedNode$1 = {};
var AGrobNodte = {};
var TarjanNode = {};
Object.defineProperty(TarjanNode, "__esModule", { value: true });
TarjanNode.GrobAlgorithms = void 0;
var GrobAlgorithms = function() {
  function GrobAlgorithms2() {
  }
  GrobAlgorithms2.TarjAlgo = function(nodes, strongComponents) {
    if (strongComponents === void 0) {
      strongComponents = {};
    }
    var que = [];
    nodes.forEach(function(node) {
      que.push(node);
    });
    var algLevel = GrobAlgorithms2.algLevel++;
    var counter = 0;
    while (que.length > 0) {
      var curr = que.pop();
      if (curr.tarjanAlgorithmAlgorithmIndex != algLevel) {
        curr.linkValue = counter++;
        curr.LowLinkValue = Number.MAX_SAFE_INTEGER;
        curr.tarjanAlgorithmAlgorithmIndex = algLevel;
        que.push.apply(que, Object.values(curr.dependencies));
      }
    }
    que = [];
    nodes.forEach(function(node) {
      que.push(node);
    });
    algLevel = GrobAlgorithms2.algLevel++;
    while (que.length > 0) {
      var curr = que.pop();
      tarjanNodeVisit(algLevel, curr, strongComponents);
    }
    function tarjanNodeVisit(algLevel2, node, strongComponents2) {
      if (node.tarjanAlgorithmAlgorithmIndex == algLevel2) {
        return node.LowLinkValue;
      }
      var que2 = Object.values(node.dependencies);
      var lowLinkValue = node.LowLinkValue;
      node.tarjanAlgorithmAlgorithmIndex = algLevel2;
      while (que2.length > 0) {
        var curr2 = que2.pop();
        var lowLinkCandidate = tarjanNodeVisit(algLevel2, curr2, strongComponents2);
        if (curr2.LowLinkValue == lowLinkCandidate) {
          strongComponents2[curr2.getLocationKey()] = curr2;
        } else if (curr2.LowLinkValue < lowLinkCandidate) {
          lowLinkValue = lowLinkCandidate;
        }
      }
      node.LowLinkValue = lowLinkValue;
      return lowLinkValue;
    }
    return [Object.keys(strongComponents).length == 0, strongComponents];
  };
  GrobAlgorithms2.algLevel = 1;
  return GrobAlgorithms2;
}();
TarjanNode.GrobAlgorithms = GrobAlgorithms;
Object.defineProperty(AGrobNodte, "__esModule", { value: true });
AGrobNodte.AGrobNode = void 0;
var tslib_1$2 = require$$0;
var AGraphItem_1 = AGraphItem$1;
var TarjanNode_1 = TarjanNode;
var AGrobNode = function(_super2) {
  tslib_1$2.__extends(AGrobNode2, _super2);
  function AGrobNode2(name, keystart, parent) {
    var _this = _super2.call(this, name, keystart) || this;
    _this.dependencies = {};
    _this.dependents = {};
    _this.updateListeners = {};
    _this.bonuses = {};
    _this.tarjanAlgorithmAlgorithmIndex = 0;
    _this.LowLinkValue = 0;
    _this.linkValue = 0;
    if (parent)
      _this.parent = parent;
    return _this;
  }
  AGrobNode2.prototype.addBonus = function(bonusIndex, bonus, errors) {
    if (errors === void 0) {
      errors = [];
    }
    bonus.update();
    var preStrongComponents = {};
    var alreadyHadStrongComps = TarjanNode_1.GrobAlgorithms.TarjAlgo([this], preStrongComponents);
    if (alreadyHadStrongComps[0]) {
      errors.push({ key: "Pre-AddBonusError", msg: "this node already had circular dependencies, before adding another node. Added Bonus is therefore refused" });
      return false;
    }
    if (this.bonuses[bonusIndex]) {
      this.remBonus(bonusIndex);
    }
    this.bonuses[bonusIndex] = bonus;
    this.addDependency(bonus);
    var StrongComponents = {};
    var StrongComps = TarjanNode_1.GrobAlgorithms.TarjAlgo([this], StrongComponents);
    if (StrongComps[0]) {
      errors.push({ key: "Pre-AddBonusError", msg: "this node already had circular dependencies, before adding another node. Added Bonus is therefore refused" });
      this.remBonus(bonusIndex);
      return false;
    }
    return true;
  };
  AGrobNode2.prototype.remBonus = function(bonusIndex) {
    if (!this.bonuses[bonusIndex])
      return true;
    var node = this.bonuses[bonusIndex];
    delete this.bonuses[bonusIndex];
    this.removeDependency(node);
    return true;
  };
  AGrobNode2.getTypeString = function() {
    return "Nodte<T extends Nodte<T>>";
  };
  AGrobNode2.prototype.addDependent = function(node) {
    var key = node.getKey();
    if (this.dependents[key]) {
      return true;
    }
    this.dependents[key] = node;
    return true;
  };
  AGrobNode2.prototype.removeDependent = function(node) {
    delete this.dependents[node.getKey()];
    return this.dependents[node.getKey()] == null;
  };
  AGrobNode2.prototype.getDependents = function() {
    var _a;
    return (_a = Object.values(this.dependents)) !== null && _a !== void 0 ? _a : [];
  };
  AGrobNode2.prototype.addDependency = function(node) {
    return false;
  };
  AGrobNode2.prototype.removeDependency = function(node) {
    return false;
  };
  AGrobNode2.prototype.nullifyDependency = function(node) {
    return false;
  };
  AGrobNode2.prototype.getDependencies = function() {
    var _a;
    return (_a = Object.values(this.dependencies)) !== null && _a !== void 0 ? _a : [];
  };
  AGrobNode2.prototype.getValue = function() {
    var initialValue = this._getValue();
    for (var key in this.bonuses) {
      var bonus = this.bonuses[key];
      var value2 = bonus._getValue();
      initialValue += value2;
    }
    return initialValue;
  };
  AGrobNode2.prototype.getLocationKey = function() {
    var segs = this.getLocationKeySegments();
    return segs.join(".");
  };
  AGrobNode2.prototype.getLocationKeySegments = function() {
    var _a, _b, _c, _d, _e, _f;
    var seg = ["", "", ""];
    seg[0] = (_c = (_b = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.getName()) !== null && _c !== void 0 ? _c : "unknown";
    seg[1] = (_e = (_d = this.parent) === null || _d === void 0 ? void 0 : _d.getName()) !== null && _e !== void 0 ? _e : "unknown";
    seg[2] = (_f = this.getName()) !== null && _f !== void 0 ? _f : "unknown";
    return seg;
  };
  AGrobNode2.prototype.update = function() {
    var _this = this;
    this._update();
    Object.keys(this.updateListeners).forEach(function(key) {
      _this.updateListeners[key]();
    });
    return true;
  };
  AGrobNode2.prototype.dispose = function() {
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
  AGrobNode2.prototype.setName = function(name, parentCall) {
    if (parentCall === void 0) {
      parentCall = false;
    }
    var oldname = this.getName();
    _super2.prototype.setName.call(this, name);
    if (!parentCall) {
      this.parent.update_node_name(oldname, name);
    }
    this.updateLocation(this.parent);
  };
  AGrobNode2.prototype.updateLocation = function(parent) {
    this.parent = parent;
    for (var key in this.dependents) {
      var dep = this.dependents[key];
      dep.updateDependecysLocation(this);
    }
    this.update();
  };
  AGrobNode2.prototype.updateDependecysLocation = function(dependency) {
  };
  AGrobNode2.prototype.isValid = function() {
    return true;
  };
  AGrobNode2.prototype.addUpdateListener = function(key, listener) {
    if (this.updateListeners[key] != void 0) {
      console.error("tried to add updatelistener to node with key:" + key + ". but there was already a listener using that key");
      return false;
    }
    this.updateListeners[key] = listener;
  };
  AGrobNode2.prototype.removeUpdateListener = function(key) {
    delete this.updateListeners[key];
  };
  AGrobNode2.prototype.removeAllUpdateListeners = function() {
    this.updateListeners = {};
  };
  return AGrobNode2;
}(AGraphItem_1.AGraphItem);
AGrobNodte.AGrobNode = AGrobNode;
var TTRPGSystemsGraphDependencies = {};
Object.defineProperty(TTRPGSystemsGraphDependencies, "__esModule", { value: true });
TTRPGSystemsGraphDependencies.grobDerivedSymbolRegex = void 0;
TTRPGSystemsGraphDependencies.grobDerivedSymbolRegex = /@[a-zA-Z]/g;
var GrobOrigin$1 = {};
Object.defineProperty(GrobOrigin$1, "__esModule", { value: true });
GrobOrigin$1.GrobOrigin = void 0;
var GrobOrigin = function() {
  function GrobOrigin2() {
    this.standardValue = 1;
  }
  GrobOrigin2.UnkownLocationKey = "unknown.unknown.unknown";
  return GrobOrigin2;
}();
GrobOrigin$1.GrobOrigin = GrobOrigin;
Object.defineProperty(GrobDerivedNode$1, "__esModule", { value: true });
GrobDerivedNode$1.GrobDerivedNode = void 0;
var tslib_1$1 = require$$0;
var AGrobNodte_1$1 = AGrobNodte;
var TTRPGSystemsGraphDependencies_1 = TTRPGSystemsGraphDependencies;
var GrobOrigin_1 = GrobOrigin$1;
var GrobDerivedNode = function(_super) {
  tslib_1$1.__extends(GrobDerivedNode, _super);
  function GrobDerivedNode(name, parent) {
    var _this = _super.call(this, name, "ND", parent) || this;
    _this.calc = "@a";
    _this.origins = [];
    _this._value = NaN;
    return _this;
  }
  GrobDerivedNode.prototype._getValue = function() {
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
      orig.originKey = GrobOrigin_1.GrobOrigin.UnkownLocationKey;
    }
    return this.removeDependency(node);
  };
  GrobDerivedNode.prototype.setOrigin = function(symbol, node, standardValue) {
    var _a, _b;
    if (standardValue === void 0) {
      standardValue = null;
    }
    var origin2 = this.origins.find(function(p) {
      return p.symbol == symbol;
    });
    if (!origin2) {
      return false;
    }
    if (origin2.origin) {
      this.removeDependency(origin2.origin);
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
    origin2.origin = node;
    origin2.standardValue = (_b = standardValue !== null && standardValue !== void 0 ? standardValue : origin2.standardValue) !== null && _b !== void 0 ? _b : 1;
    if (origin2.origin)
      origin2.originKey = origin2.origin.getLocationKey();
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
          var orig = new GrobOrigin_1.GrobOrigin();
          orig.symbol = symbolsToAdd[i];
          orig.standardValue = 1;
          orig.origin = null;
          orig.originKey = GrobOrigin_1.GrobOrigin.UnkownLocationKey;
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
    var symbols2 = (_a = calcValue.match(TTRPGSystemsGraphDependencies_1.grobDerivedSymbolRegex)) !== null && _a !== void 0 ? _a : [];
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
    var symbols2 = (_a = calcValue.match(TTRPGSystemsGraphDependencies_1.grobDerivedSymbolRegex)) !== null && _a !== void 0 ? _a : [];
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
    var symbols = statement.match(TTRPGSystemsGraphDependencies_1.grobDerivedSymbolRegex);
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
    var symbols2 = statement2.match(TTRPGSystemsGraphDependencies_1.grobDerivedSymbolRegex);
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
    var symbols2 = statement2.match(TTRPGSystemsGraphDependencies_1.grobDerivedSymbolRegex);
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
}(AGrobNodte_1$1.AGrobNode);
GrobDerivedNode$1.GrobDerivedNode = GrobDerivedNode;
var hasRequiredGrobBonusNode;
function requireGrobBonusNode() {
  if (hasRequiredGrobBonusNode)
    return GrobBonusNode;
  hasRequiredGrobBonusNode = 1;
  Object.defineProperty(GrobBonusNode, "__esModule", { value: true });
  GrobBonusNode.GrobBonusNode = void 0;
  var tslib_12 = require$$0;
  var GrobDerivedNode_1 = GrobDerivedNode$1;
  var TTRPGSystemBonusDesigner_1 = requireTTRPGSystemBonusDesigner();
  var GrobBonusNode$1 = function(_super2) {
    tslib_12.__extends(GrobBonusNode2, _super2);
    function GrobBonusNode2(name, parent) {
      return _super2.call(this, name, parent) || this;
    }
    GrobBonusNode2.CreateNodeChain = function(sys, name) {
      return TTRPGSystemBonusDesigner_1.TTRPGSystemBonusDesigner.createBonusNodeChain(sys, name);
    };
    GrobBonusNode2.getTypeString = function() {
      return "bonusNode";
    };
    GrobBonusNode2.prototype.getTypeString = function() {
      return GrobBonusNode2.getTypeString();
    };
    return GrobBonusNode2;
  }(GrobDerivedNode_1.GrobDerivedNode);
  GrobBonusNode.GrobBonusNode = GrobBonusNode$1;
  return GrobBonusNode;
}
var hasRequiredTTRPGSystemBonusDesigner;
function requireTTRPGSystemBonusDesigner() {
  if (hasRequiredTTRPGSystemBonusDesigner)
    return TTRPGSystemBonusDesigner;
  hasRequiredTTRPGSystemBonusDesigner = 1;
  Object.defineProperty(TTRPGSystemBonusDesigner, "__esModule", { value: true });
  TTRPGSystemBonusDesigner.TTRPGSystemBonusDesigner = void 0;
  var GrobBonusNode_1 = requireGrobBonusNode();
  var TTRPGSystemBonusDesigner$1 = function() {
    function TTRPGSystemBonusDesigner2() {
    }
    TTRPGSystemBonusDesigner2.createBonusNodeChain = function(sys, name) {
      var instance2 = new TTRPGSystemBonusDesigner2();
      if (!sys.hasCollection("extra", "bonus")) {
        sys.createCollection("extra", "bonus");
      }
      var col = sys.getCollection("extra", "bonus");
      instance2.activeNode = instance2.createNewNode(name, col);
      return instance2;
    };
    TTRPGSystemBonusDesigner2.prototype.createNewNode = function(name, parent) {
      return new GrobBonusNode_1.GrobBonusNode(name, parent);
    };
    TTRPGSystemBonusDesigner2.prototype.addCalculation = function(calc) {
      this.activeNode.setCalc(calc);
      return this;
    };
    TTRPGSystemBonusDesigner2.prototype.addOrigin = function(symbol, node) {
      this.activeNode.setOrigin(symbol, node);
      return this;
    };
    TTRPGSystemBonusDesigner2.prototype.update = function() {
      this.activeNode.updateOrigins();
      return this;
    };
    TTRPGSystemBonusDesigner2.prototype.getNode = function() {
      return this.activeNode;
    };
    TTRPGSystemBonusDesigner2.prototype.getOriginStates = function() {
      return this.activeNode.parseCalculationToOrigins(this.activeNode.calc);
    };
    TTRPGSystemBonusDesigner2.prototype.isValidCalculation = function() {
      return this.activeNode.testCalculate(this.activeNode.calc);
    };
    TTRPGSystemBonusDesigner2.prototype.isValid = function() {
      return this.activeNode.isValid();
    };
    return TTRPGSystemBonusDesigner2;
  }();
  TTRPGSystemBonusDesigner.TTRPGSystemBonusDesigner = TTRPGSystemBonusDesigner$1;
  return TTRPGSystemBonusDesigner;
}
var GrobFixedNode$1 = {};
Object.defineProperty(GrobFixedNode$1, "__esModule", { value: true });
GrobFixedNode$1.GrobFixedNode = void 0;
var tslib_1 = require$$0;
var AGrobNodte_1 = AGrobNodte;
var GrobFixedNode = function(_super2) {
  tslib_1.__extends(GrobFixedNode2, _super2);
  function GrobFixedNode2(name, parent) {
    var _this = _super2.call(this, name, "NF", parent) || this;
    _this.___value = 1;
    return _this;
  }
  GrobFixedNode2.prototype._getValue = function() {
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
    for (var k in this.dependents) {
      var dep = this.dependents[k];
      dep.update();
    }
  };
  return GrobFixedNode2;
}(AGrobNodte_1.AGrobNode);
GrobFixedNode$1.GrobFixedNode = GrobFixedNode;
var DataTable = {};
Object.defineProperty(DataTable, "__esModule", { value: true });
DataTable.ADataRow = DataTable.ADataTable = void 0;
var ADataTable = function() {
  function ADataTable2() {
    this.data = {};
  }
  ADataTable2.prototype.setName = function(name) {
    throw new Error("Method not implemented.");
  };
  ADataTable2.prototype.getName = function() {
    throw new Error("Method not implemented.");
  };
  ADataTable2.prototype.dispose = function() {
    throw new Error("Method not implemented.");
  };
  ADataTable2.prototype.updateLocation = function() {
    throw new Error("Method not implemented.");
  };
  ADataTable2.prototype.getLocationKey = function() {
    var segs = this.getLocationKeySegments();
    return segs.join(".");
  };
  ADataTable2.prototype.getLocationKeySegments = function() {
    var _a, _b, _c, _d, _e, _f;
    var seg = ["", "", ""];
    seg[0] = (_c = (_b = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.getName()) !== null && _c !== void 0 ? _c : "unknown";
    seg[1] = (_e = (_d = this.parent) === null || _d === void 0 ? void 0 : _d.getName()) !== null && _e !== void 0 ? _e : "unknown";
    seg[2] = (_f = this.getName()) !== null && _f !== void 0 ? _f : "unknown";
    return seg;
  };
  ADataTable2.prototype.update = function() {
  };
  return ADataTable2;
}();
DataTable.ADataTable = ADataTable;
var ADataRow = function() {
  function ADataRow2() {
  }
  return ADataRow2;
}();
DataTable.ADataRow = ADataRow;
var hasRequiredDist;
function requireDist() {
  if (hasRequiredDist)
    return dist;
  hasRequiredDist = 1;
  (function(exports2) {
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.uuidv4 = exports2.TTRPGSystemHelper = exports2.TTRPGSystem = exports2.ADataTable = exports2.ADataRow = exports2.GrobGroup = exports2.GrobCollection = exports2.GrobBonusNode = exports2.GrobDerivedNode = exports2.GrobDerivedOrigin = exports2.GrobFixedNode = exports2.keyManagerInstance = void 0;
    var KeyManager_12 = KeyManager$1;
    Object.defineProperty(exports2, "keyManagerInstance", { enumerable: true, get: function() {
      return KeyManager_12.keyManagerInstance;
    } });
    var TTRPGSystemGraphModel_1 = requireTTRPGSystemGraphModel();
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
    var TTRPGSystemBonusDesigner_1 = requireTTRPGSystemBonusDesigner();
    Object.defineProperty(exports2, "TTRPGSystemHelper", { enumerable: true, get: function() {
      return TTRPGSystemBonusDesigner_1.TTRPGSystemBonusDesigner;
    } });
    var GrobBonusNode_1 = requireGrobBonusNode();
    Object.defineProperty(exports2, "GrobBonusNode", { enumerable: true, get: function() {
      return GrobBonusNode_1.GrobBonusNode;
    } });
    var GrobDerivedNode_1 = GrobDerivedNode$1;
    Object.defineProperty(exports2, "GrobDerivedNode", { enumerable: true, get: function() {
      return GrobDerivedNode_1.GrobDerivedNode;
    } });
    var GrobFixedNode_1 = GrobFixedNode$1;
    Object.defineProperty(exports2, "GrobFixedNode", { enumerable: true, get: function() {
      return GrobFixedNode_1.GrobFixedNode;
    } });
    var GrobOrigin_12 = GrobOrigin$1;
    Object.defineProperty(exports2, "GrobDerivedOrigin", { enumerable: true, get: function() {
      return GrobOrigin_12.GrobOrigin;
    } });
    var DataTable_1 = DataTable;
    Object.defineProperty(exports2, "ADataRow", { enumerable: true, get: function() {
      return DataTable_1.ADataRow;
    } });
    Object.defineProperty(exports2, "ADataTable", { enumerable: true, get: function() {
      return DataTable_1.ADataTable;
    } });
    function uuidv4() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == "x" ? r : r & 3 | 8;
        return v.toString(16);
      });
    }
    exports2.uuidv4 = uuidv4;
  })(dist);
  return dist;
}
var distExports = requireDist();
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
class GrobJDerivedOrigin extends distExports.GrobDerivedOrigin {
  constructor() {
    super(...arguments);
    __publicField(this, "symbol");
    __publicField(this, "originKey");
  }
}
__decorateClass$2([
  JsonString()
], GrobJDerivedOrigin.prototype, "symbol", 2);
__decorateClass$2([
  JsonString()
], GrobJDerivedOrigin.prototype, "originKey", 2);
class GrobJDerivedNode extends distExports.GrobDerivedNode {
  constructor() {
    super(...arguments);
    __publicField(this, "name");
    __publicField(this, "calc");
    __publicField(this, "origins");
  }
}
__decorateClass$2([
  JsonString()
], GrobJDerivedNode.prototype, "name", 2);
__decorateClass$2([
  JsonString({ name: "calculationString" })
], GrobJDerivedNode.prototype, "calc", 2);
__decorateClass$2([
  JsonArrayClassTyped(GrobJDerivedOrigin, { name: "calcOrigins" })
], GrobJDerivedNode.prototype, "origins", 2);
class GrobJFixedNode extends distExports.GrobFixedNode {
  constructor() {
    super(...arguments);
    __publicField(this, "name");
    __publicField(this, "___value");
  }
}
__decorateClass$2([
  JsonString()
], GrobJFixedNode.prototype, "name", 2);
__decorateClass$2([
  JsonNumber({ name: "standardValue" })
], GrobJFixedNode.prototype, "___value", 2);
class GrobCollectionDerived extends distExports.GrobCollection {
  constructor() {
    super(...arguments);
    __publicField(this, "name");
    __publicField(this, "nodes_names", {});
  }
}
__decorateClass$2([
  JsonString()
], GrobCollectionDerived.prototype, "name", 2);
__decorateClass$2([
  JsonMappingRecordInArrayOut({ KeyPropertyName: "getName", name: "data", type: GrobJDerivedNode })
], GrobCollectionDerived.prototype, "nodes_names", 2);
class GrobCollectionFixed extends distExports.GrobCollection {
  constructor() {
    super(...arguments);
    __publicField(this, "name");
    __publicField(this, "nodes_names", {});
  }
}
__decorateClass$2([
  JsonString()
], GrobCollectionFixed.prototype, "name", 2);
__decorateClass$2([
  JsonMappingRecordInArrayOut({ KeyPropertyName: "getName", name: "data", type: GrobJFixedNode })
], GrobCollectionFixed.prototype, "nodes_names", 2);
class GrobGroupDerived extends distExports.GrobGroup {
  constructor() {
    super(...arguments);
    __publicField(this, "name");
    __publicField(this, "collections_names", {});
  }
}
__decorateClass$2([
  JsonString()
], GrobGroupDerived.prototype, "name", 2);
__decorateClass$2([
  JsonMappingRecordInArrayOut({ KeyPropertyName: "getName", name: "data", type: GrobCollectionDerived })
], GrobGroupDerived.prototype, "collections_names", 2);
class GrobGroupFixed extends distExports.GrobGroup {
  constructor() {
    super(...arguments);
    __publicField(this, "name");
    __publicField(this, "collections_names", {});
  }
}
__decorateClass$2([
  JsonString()
], GrobGroupFixed.prototype, "name", 2);
__decorateClass$2([
  JsonMappingRecordInArrayOut({ KeyPropertyName: "getName", name: "data", type: GrobCollectionFixed })
], GrobGroupFixed.prototype, "collections_names", 2);
class TTRPG_SCHEMES {
}
__publicField(TTRPG_SCHEMES, "PREVIEW", "mini");
let TTRPGSystemJSONFormatting = class extends distExports.TTRPGSystem {
  constructor() {
    super();
    __publicField(this, "fixed");
    __publicField(this, "derived");
    __publicField(this, "author", "");
    __publicField(this, "version", "");
    __publicField(this, "systemCodeName", distExports.uuidv4());
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
__decorateClass$2([
  JsonClassTyped(GrobGroupFixed)
], TTRPGSystemJSONFormatting.prototype, "fixed", 2);
__decorateClass$2([
  JsonClassTyped(GrobGroupDerived)
], TTRPGSystemJSONFormatting.prototype, "derived", 2);
__decorateClass$2([
  JsonString(),
  JsonString({ scheme: [BASE_SCHEME, TTRPG_SCHEMES.PREVIEW] })
], TTRPGSystemJSONFormatting.prototype, "author", 2);
__decorateClass$2([
  JsonString(),
  JsonString({ scheme: [BASE_SCHEME, TTRPG_SCHEMES.PREVIEW] })
], TTRPGSystemJSONFormatting.prototype, "version", 2);
__decorateClass$2([
  JsonString(),
  JsonString({ scheme: [BASE_SCHEME, TTRPG_SCHEMES.PREVIEW] })
], TTRPGSystemJSONFormatting.prototype, "systemCodeName", 2);
__decorateClass$2([
  JsonString(),
  JsonString({ scheme: [BASE_SCHEME, TTRPG_SCHEMES.PREVIEW] })
], TTRPGSystemJSONFormatting.prototype, "systemName", 2);
TTRPGSystemJSONFormatting = __decorateClass$2([
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
            origins.forEach((origin2) => {
              let keys = origin2.originKey.split(".");
              const target = self.getNode(keys[0], keys[1], keys[2]);
              origin2.origin = target;
              node.addDependency(target);
            });
          }
        }
      }
      Object.values(self.data);
    }
  })
], TTRPGSystemJSONFormatting);
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
class SystemPreviewSchemes {
}
__publicField(SystemPreviewSchemes, "BASE", BASE_SCHEME);
__publicField(SystemPreviewSchemes, "PAGE", "PAGE");
let SystemPreview = class {
  constructor() {
    __publicField(this, "id");
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
__decorateClass$1([
  JsonNumber({ scheme: [SystemPreviewSchemes.BASE, SystemPreviewSchemes.PAGE] })
], SystemPreview.prototype, "id", 2);
__decorateClass$1([
  JsonBoolean({ scheme: [SystemPreviewSchemes.BASE] })
], SystemPreview.prototype, "isEditable", 2);
__decorateClass$1([
  JsonString({ scheme: [SystemPreviewSchemes.BASE] })
], SystemPreview.prototype, "author", 2);
__decorateClass$1([
  JsonString({ scheme: [SystemPreviewSchemes.BASE, SystemPreviewSchemes.PAGE] })
], SystemPreview.prototype, "version", 2);
__decorateClass$1([
  JsonString({ scheme: [SystemPreviewSchemes.BASE, SystemPreviewSchemes.PAGE] })
], SystemPreview.prototype, "code", 2);
__decorateClass$1([
  JsonString({ scheme: [SystemPreviewSchemes.BASE, SystemPreviewSchemes.PAGE] })
], SystemPreview.prototype, "name", 2);
SystemPreview = __decorateClass$1([
  JsonObject({})
], SystemPreview);
function create_fragment$j(ctx) {
  let div2;
  let div0;
  let t0;
  let t1;
  let div1;
  let p;
  let t2;
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
      p = element("p");
      t2 = text(ctx[1]);
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
      p = claim_element(div1_nodes, "P", {});
      var p_nodes = children(p);
      t2 = claim_text(p_nodes, ctx[1]);
      p_nodes.forEach(detach);
      div1_nodes.forEach(detach);
      div2_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div0, "class", "MenuBtnIcon");
      attr(div1, "class", "MenuBtnText");
      attr(div2, "class", div2_class_value = ctx[0] ? "MenuSBtn" : "MenuBtn");
      attr(div2, "data-active", ctx[2]);
    },
    m(target, anchor) {
      insert_hydration(target, div2, anchor);
      append_hydration(div2, div0);
      append_hydration(div0, t0);
      append_hydration(div2, t1);
      append_hydration(div2, div1);
      append_hydration(div1, p);
      append_hydration(p, t2);
      if (!mounted) {
        dispose = [
          listen(div2, "click", ctx[3]),
          listen(div2, "keypress", ctx[6])
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (dirty & 2)
        set_data(t2, ctx2[1]);
      if (dirty & 1 && div2_class_value !== (div2_class_value = ctx2[0] ? "MenuSBtn" : "MenuBtn")) {
        attr(div2, "class", div2_class_value);
      }
      if (dirty & 4) {
        attr(div2, "data-active", ctx2[2]);
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
function instance$j($$self, $$props, $$invalidate) {
  let { special = false } = $$props;
  let { text: text2 = "Basic information and settings" } = $$props;
  let { title = "Home" } = $$props;
  let active2;
  function setActive(to) {
    $$invalidate(2, active2 = to);
  }
  let dispatch2 = createEventDispatcher();
  function onClick() {
    dispatch2("click");
  }
  function keypress_handler(event) {
    bubble.call(this, $$self, event);
  }
  $$self.$$set = ($$props2) => {
    if ("special" in $$props2)
      $$invalidate(0, special = $$props2.special);
    if ("text" in $$props2)
      $$invalidate(4, text2 = $$props2.text);
    if ("title" in $$props2)
      $$invalidate(1, title = $$props2.title);
  };
  return [special, title, active2, onClick, text2, setActive, keypress_handler];
}
class MenuBtn extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$j, create_fragment$j, safe_not_equal, {
      special: 0,
      text: 4,
      title: 1,
      setActive: 5
    });
  }
  get setActive() {
    return this.$$.ctx[5];
  }
}
function get_each_context$4(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[11] = list[i];
  child_ctx[12] = list;
  child_ctx[13] = i;
  return child_ctx;
}
function create_if_block$c(ctx) {
  let div;
  let p;
  let t;
  return {
    c() {
      div = element("div");
      p = element("p");
      t = text(ctx[0]);
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      p = claim_element(div_nodes, "P", {});
      var p_nodes = children(p);
      t = claim_text(p_nodes, ctx[0]);
      p_nodes.forEach(detach);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div, "class", "MenuTitle");
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      append_hydration(div, p);
      append_hydration(p, t);
    },
    p(ctx2, dirty) {
      if (dirty & 1)
        set_data(t, ctx2[0]);
    },
    d(detaching) {
      if (detaching)
        detach(div);
    }
  };
}
function create_each_block$4(ctx) {
  let menubtn;
  let i = ctx[13];
  let current;
  const assign_menubtn = () => ctx[7](menubtn, i);
  const unassign_menubtn = () => ctx[7](null, i);
  function click_handler() {
    return ctx[8](ctx[13]);
  }
  let menubtn_props = {
    special: ctx[1].includes(ctx[11]),
    title: ctx[11]
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
      if (i !== ctx[13]) {
        unassign_menubtn();
        i = ctx[13];
        assign_menubtn();
      }
      const menubtn_changes = {};
      if (dirty & 10)
        menubtn_changes.special = ctx[1].includes(ctx[11]);
      if (dirty & 8)
        menubtn_changes.title = ctx[11];
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
function create_fragment$i(ctx) {
  let div;
  let t;
  let section;
  let current;
  let if_block = ctx[0] && create_if_block$c(ctx);
  let each_value = ctx[3];
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
  }
  const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  });
  return {
    c() {
      div = element("div");
      if (if_block)
        if_block.c();
      t = space();
      section = element("section");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      if (if_block)
        if_block.l(div_nodes);
      t = claim_space(div_nodes);
      section = claim_element(div_nodes, "SECTION", { class: true });
      var section_nodes = children(section);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].l(section_nodes);
      }
      section_nodes.forEach(detach);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(section, "class", "MenuBtnContainer");
      attr(div, "class", "Menu");
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      if (if_block)
        if_block.m(div, null);
      append_hydration(div, t);
      append_hydration(div, section);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(section, null);
        }
      }
      current = true;
    },
    p(ctx2, [dirty]) {
      if (ctx2[0]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
        } else {
          if_block = create_if_block$c(ctx2);
          if_block.c();
          if_block.m(div, t);
        }
      } else if (if_block) {
        if_block.d(1);
        if_block = null;
      }
      if (dirty & 30) {
        each_value = ctx2[3];
        let i;
        for (i = 0; i < each_value.length; i += 1) {
          const child_ctx = get_each_context$4(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block$4(child_ctx);
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
        detach(div);
      if (if_block)
        if_block.d();
      destroy_each(each_blocks, detaching);
    }
  };
}
function instance$i($$self, $$props, $$invalidate) {
  let options;
  let { title = null } = $$props;
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
      $$invalidate(2, btnArr);
    });
  }
  const click_handler = (i) => onBtnClick(i);
  $$self.$$set = ($$props2) => {
    if ("title" in $$props2)
      $$invalidate(0, title = $$props2.title);
    if ("regularOptions" in $$props2)
      $$invalidate(5, regularOptions = $$props2.regularOptions);
    if ("specialOptions" in $$props2)
      $$invalidate(1, specialOptions = $$props2.specialOptions);
    if ("startChosen" in $$props2)
      $$invalidate(6, startChosen = $$props2.startChosen);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 34) {
      $$invalidate(3, options = regularOptions.concat(...specialOptions));
    }
  };
  return [
    title,
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
    init(this, options, instance$i, create_fragment$i, safe_not_equal, {
      title: 0,
      regularOptions: 5,
      specialOptions: 1,
      startChosen: 6
    });
  }
}
function pageSlide(node, params) {
  const rect = node.getBoundingClientRect();
  const height = rect.height;
  const width = rect.width;
  const parent = params.parent;
  if (parent) {
    const origTransition = parent.style.transition;
    const origHeight = parent.style.height;
    parent.style.transition += " ease " + (params.duration || 400) / 1e3 + "s height";
    parent.style.height = height + "px";
    setTimeout(
      () => {
        parent.style.transition = origTransition;
        parent.style.height = origHeight;
      },
      params.duration || 400
    );
  }
  return {
    delay: params.delay || 0,
    duration: params.duration || 400,
    easing: params.easing || cubicOut,
    css: (t, u) => `
			height:${height}px;
			width:${width}px;
			position:absolute;
			transform-origin: top;
			transform: translateX(${u * width}px);
			`
  };
}
class AItemController {
  constructor() {
    __publicField(this, "uiNode");
    __publicField(this, "node");
    __publicField(this, "system");
    __publicField(this, "messageHandler", null);
    __publicField(this, "isValid", writable(true));
    __publicField(this, "name", writable(""));
    __publicField(this, "standardValue", writable(1));
    __publicField(this, "_outList", /* @__PURE__ */ new Set());
  }
  setControllerDeps(uiNode, system, out) {
    var _a, _b;
    this.uiNode = uiNode;
    this.node = uiNode.link;
    this.system = system;
    this.isValid.set(true);
    this.name.set((_b = (_a = this.uiNode) == null ? void 0 : _a.name) != null ? _b : "");
    this.standardValue.set(0);
  }
  validateName(name, out) {
    let isValid = true;
    if (name == "") {
      isValid = false;
      out("The name cannot be empty");
    } else if (name.includes(".")) {
      isValid = false;
      out('The name cannot contain "."');
    } else if (this.uiNode.parent.hasNode(name) && name != this.uiNode.name) {
      isValid = false;
      out("The name is already in use, in the same collection");
    }
    return isValid;
  }
  _checkIsValid(output = true) {
    var _a;
    if (!this.uiNode || !this.system) {
      return false;
    }
    let isValid = true;
    let _out = output ? (msg) => {
      this._outList.add(msg);
    } : (msg) => {
    };
    isValid = isValid && this.validateName((_a = get_store_value(this.name)) != null ? _a : "", _out);
    return isValid;
  }
  checkIsValid(output = true) {
    var _a;
    if (output) {
      (_a = this.messageHandler) == null ? void 0 : _a.removeAllMessages();
    }
    let valid = this._checkIsValid(output);
    this.isValid.set(valid);
    return valid;
  }
}
class FixedItemController extends AItemController {
  saveNodeChanges() {
    let success = this.checkIsValid(true);
    if (!success) {
      return false;
    }
    this.node.setValue(get_store_value(this.standardValue));
    this.node.setName(get_store_value(this.name));
    return true;
  }
}
class DerivedItemController extends AItemController {
  constructor() {
    super(...arguments);
    __publicField(this, "calc", writable(""));
    __publicField(this, "resultValue", writable(0));
    __publicField(this, "resultSuccess", writable(true));
    __publicField(this, "mappedOrigins", writable([]));
  }
  setControllerDeps(node, system, out) {
    var _a, _b;
    super.setControllerDeps(node, system, out);
    this.calc.set((_b = (_a = this.uiNode.link) == null ? void 0 : _a.calc) != null ? _b : "");
    this.resultValue.set(0);
    this.resultSuccess.set(true);
    this.updateMappedOrigins();
  }
  updateMappedOrigins() {
    var _a, _b, _c, _d;
    let m = (_d = (_c = (_b = (_a = this.uiNode) == null ? void 0 : _a.link) == null ? void 0 : _b.origins) == null ? void 0 : _c.map(
      (p) => {
        return {
          key: p.symbol,
          segments: p.originKey.split("."),
          active: get_store_value(this.calc).includes(p.symbol),
          testValue: p.standardValue,
          inCalc: get_store_value(this.calc).includes(p.symbol),
          target: p.origin,
          isSelectAllTarget: true
        };
      }
    )) != null ? _d : [];
    this.mappedOrigins.set(m);
  }
  validateOrigins(mappedOrigins, calc, out) {
    let isValid = true;
    mappedOrigins.forEach((obj) => {
      if (obj.inCalc && !obj.target) {
        out(`Cannot save until all dependencies used in the calc is defined 
 ${obj.key} Had no target 
`);
        isValid = false;
      }
    });
    if (!isValid) {
      return false;
    }
    let NMap = mappedOrigins.filter((p) => calc.includes(p.key));
    NMap.forEach((o) => {
      if (!o.segments) {
        out(`Contents of ${o.key}'s segments was Null!'`);
        isValid = false;
        return false;
      }
      let dep = this.system.getNode(o.segments[0], o.segments[1], o.segments[2]);
      if (!dep) {
        out(`Target of ${o.key} location ${o.segments[0] + "." + o.segments[1] + "." + o.segments[2]} was invalid!'`);
        isValid = false;
        return false;
      }
    });
    return isValid;
  }
  validateCalculation(calc, mappedOrigins, out) {
    let o = {};
    let mappedKeys = [];
    mappedOrigins.forEach((p) => {
      o[p.key] = p.testValue;
      mappedKeys.push(p.key);
    });
    let calcres = GrobJDerivedNode.testCalculate(calc, o);
    let succes = calcres.success;
    let value2 = calcres.value;
    if (!succes) {
      out(`Calculation is invalid, meaning it could not parse`);
    }
    this.resultValue.set(value2);
    this.resultSuccess.set(succes);
    return succes;
  }
  validateCalculationOrigins(calc, mappedOrigins, out) {
    let symbols2 = GrobJDerivedNode.staticParseCalculationToOrigins(calc);
    mappedOrigins.forEach((o) => {
      symbols2 = symbols2.filter((p) => p != o.key);
      out(o.key + "missing");
    });
    let isValid = true;
    symbols2.forEach((s) => {
      isValid = false;
      out(`symbol ${s} was missing from origins `);
    });
    return isValid;
  }
  _checkIsValid(output = true) {
    let _out = output ? (msg) => {
      this._outList.add(msg);
    } : (msg) => {
    };
    let isValid = super._checkIsValid(output);
    isValid = isValid && this.validateOrigins(get_store_value(this.mappedOrigins), get_store_value(this.calc), _out);
    isValid = isValid && this.validateCalculationOrigins(get_store_value(this.calc), get_store_value(this.mappedOrigins), _out);
    isValid = isValid && this.validateCalculation(get_store_value(this.calc), get_store_value(this.mappedOrigins), _out);
    return isValid;
  }
  checkIsValid(output = true) {
    var _a;
    if (output) {
      (_a = this.messageHandler) == null ? void 0 : _a.removeAllMessages();
    }
    let valid = this._checkIsValid(output);
    this.isValid.set(valid);
    return valid;
  }
  saveNodeChanges() {
    let success = this.checkIsValid(true);
    if (!success) {
      return false;
    }
    this.node.setValue(get_store_value(this.standardValue));
    this.node.setCalc(get_store_value(this.calc));
    let NMap = get_store_value(this.mappedOrigins).filter((p) => p.inCalc);
    NMap.forEach((o) => {
      var _a;
      let dep = this.system.sys.getNode(o.segments[0], o.segments[1], o.segments[2]);
      this.node.setOrigin(o.key, dep, (_a = o.testValue) != null ? _a : 0);
    });
    this.node.setName(get_store_value(this.name));
    this.uiNode.name = get_store_value(this.name);
    return true;
  }
  onKeyExchange(e) {
    this.mappedOrigins.update((mappedOrigins) => {
      const s0 = e.detail.old;
      const s1 = e.detail.new;
      let t0 = mappedOrigins.find((p) => p.key == s0);
      if (!t0)
        return mappedOrigins;
      let t1 = mappedOrigins.find((p) => p.key == s1);
      if (!t1)
        return mappedOrigins;
      t0.key = s1;
      t0.inCalc = get_store_value(this.calc).includes(s1);
      t1.key = s0;
      t1.inCalc = get_store_value(this.calc).includes(s0);
      return mappedOrigins;
    });
    return;
  }
  onKeyDelete(e) {
    this.mappedOrigins.update((mappedOrigins) => {
      const key = e.detail;
      let old = mappedOrigins.find((p) => p.key == key);
      if (!old)
        return mappedOrigins;
      if (!old.active || !old.inCalc) {
        mappedOrigins = mappedOrigins.filter((p) => p.key != old.key);
      } else {
        old.active = false;
        old.segments = new Array(3).fill(null);
      }
      return mappedOrigins;
    });
  }
  recalculateCalcAndOrigins() {
    let o = {};
    get_store_value(this.mappedOrigins).forEach((p) => {
      o[p.key] = p.testValue;
    });
    let calc = get_store_value(this.calc);
    let res2 = GrobJDerivedNode.testCalculate(calc, o);
    this.resultValue.set(res2.value);
    this.resultSuccess.set(res2.success);
    let symbols2 = GrobJDerivedNode.staticParseCalculationToOrigins(calc);
    this.mappedOrigins.update((mappedOrigins) => {
      mappedOrigins.forEach((d) => {
        let inCalc = symbols2.includes(d.key);
        if (inCalc) {
          symbols2 = symbols2.filter((p) => p != d.key);
          d.inCalc = true;
        } else {
          d.inCalc = false;
        }
      });
      symbols2.forEach((s) => {
        mappedOrigins.push({ key: s, segments: new Array(3).fill(null), active: false, testValue: 1, inCalc: true, target: null, isSelectAllTarget: true });
      });
      return mappedOrigins;
    });
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
  static recursiveFindNewName_LOOP(testName, counter, array, getName) {
    let i = array.findIndex((p) => getName(p) == testName + counter);
    if (i == -1)
      return testName + counter;
    return this.recursiveFindNewName_LOOP(testName, ++counter, array, getName);
  }
  static recursiveFindNewName(testName, array, getName) {
    let i = array.findIndex((p) => getName(p) == testName);
    if (i == -1)
      return testName;
    return this.recursiveFindNewName_LOOP(testName, 0, array, getName);
  }
}
class UpdateListener {
  constructor() {
    __publicField(this, "guid", StringFunctions.uuidv4());
    __publicField(this, "listenersKeyed", {});
    __publicField(this, "listenersEvents", {});
  }
  callUpdateListeners(event) {
    if (!this.listenersEvents[event]) {
      return;
    }
    const keys = Object.keys(this.listenersEvents[event]);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      this.listenersEvents[event][key].call();
    }
  }
  addEventListener(key, event, listener) {
    if (!this.listenersEvents[event]) {
      this.listenersEvents[event] = {};
    }
    if (!this.listenersKeyed[key]) {
      this.listenersKeyed[key] = {};
    }
    this.listenersKeyed[key][event] = listener;
    this.listenersEvents[event][key] = listener;
  }
  removeEventListener(key) {
    var _a;
    let events = Object.keys((_a = this.listenersKeyed[key]) != null ? _a : {});
    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      delete this.listenersEvents[e][key];
    }
    delete this.listenersKeyed[key];
  }
  removeAllEventListeners() {
    this.listenersKeyed = {};
    this.listenersEvents = {};
  }
}
var updateEvents = /* @__PURE__ */ ((updateEvents2) => {
  updateEvents2["validChange"] = "ValidUpdated";
  updateEvents2["update"] = "update";
  return updateEvents2;
})(updateEvents || {});
class UINode extends UpdateListener {
  constructor(system, node) {
    super();
    __publicField(this, "sys");
    __publicField(this, "link");
    __publicField(this, "key");
    __publicField(this, "name");
    __publicField(this, "nameEdit");
    __publicField(this, "valid");
    __publicField(this, "parent");
    __publicField(this, "_isConstructed", false);
    var names = Object.keys(node.updateListeners);
    if (names.includes(node.getKey())) {
      throw new Error("was was already created");
    }
    this.link = node;
    this.sys = system;
    this.key = node.getKey();
    this.name = node.getName();
    this.nameEdit = node.getName();
    this.valid = node.isValid();
    this.link.addUpdateListener(this.key, this.update.bind(this));
    this._isConstructed = true;
  }
  update() {
    if (!this._isConstructed) {
      return;
    }
    let validOrig = this.valid;
    this.key = this.link.getKey();
    this.name = this.link.getName();
    this.nameEdit = this.link.getName();
    this.valid = this.link.isValid();
    if (validOrig != this.valid) {
      this.callUpdateListeners(updateEvents.validChange);
    }
    this.callUpdateListeners(updateEvents.update);
  }
  dispose() {
    this.removeAllEventListeners();
    this.link.removeUpdateListener(this.key);
    this.link = null;
    this.sys = null;
    this.parent = null;
  }
}
class UICollection extends UpdateListener {
  constructor(system, col) {
    super();
    __publicField(this, "sys");
    __publicField(this, "link");
    __publicField(this, "derivedCol");
    __publicField(this, "nodes", []);
    __publicField(this, "key");
    __publicField(this, "name");
    __publicField(this, "nameEdit");
    __publicField(this, "valid");
    __publicField(this, "parent");
    __publicField(this, "_isConstructed", false);
    this.sys = system;
    this.link = col;
    this.key = col.getKey();
    this.name = col.getName();
    this.nameEdit = this.name;
    var isValid = true;
    var nodeNames = col.getNodeNames();
    for (let i = 0; i < nodeNames.length; i++) {
      const n = nodeNames[i];
      const node = col.getNode(n);
      if (!node)
        continue;
      const uinode = this._addNode(node, this.sys);
      isValid = isValid && uinode.valid;
    }
    this.valid = isValid;
    this._isConstructed = true;
  }
  isValidUpdate() {
    var orig = this.valid;
    var isValid = true;
    this.nodes.forEach((p) => {
      isValid = isValid && p.valid;
    });
    this.valid = isValid;
    if (orig != this.valid) {
      this.callUpdateListeners(updateEvents.validChange);
    }
  }
  update() {
    if (!this._isConstructed) {
      return;
    }
    this.key = this.link.getKey();
    this.name = this.link.getName();
    this.nameEdit = this.link.getName();
    const nodeNames = this.link.getNodeNames();
    for (let i = 0; i < nodeNames.length; i++) {
      const n = nodeNames[i];
      if (this._hasNode(n)) {
        continue;
      }
      const nod = this.link.getNode(n);
      if (!nod)
        continue;
      console.log(nod.getKey());
      this._addNode(nod, this.sys);
    }
    this.isValidUpdate();
    this.callUpdateListeners(updateEvents.update);
  }
  dispose() {
    this.link.removeUpdateListener(this.key);
    this.removeAllEventListeners();
    this.nodes.forEach((n) => n.dispose());
    this.link = null;
    this.sys = null;
    this.nodes = [];
    this.parent = null;
  }
  getNode(name) {
    return this.parent.parent.getNode(this.parent.name, this.name, name);
  }
  hasNode(name) {
    return this.parent.parent.hasNode(this.parent.name, this.name, name);
  }
  addNode(name) {
    return this.parent.parent.addNode(this.parent.name, this.name, name);
  }
  remNode(name) {
    return this.parent.parent.remNode(this.parent.name, this.name, name);
  }
  renameNode(name, rename) {
    return this.parent.parent.renameNode(this.parent.name, this.name, name, rename);
  }
  _getNode(name) {
    return this.nodes.find((p) => p.name == name);
  }
  _hasNode(name) {
    return !!this.nodes.find((p) => p.name == name);
  }
  _addNode(link, system) {
    let uNode = new UINode(system, link);
    this.nodes.push(uNode);
    uNode.addEventListener(this.key, updateEvents.validChange, this.isValidUpdate.bind(this));
    uNode.parent = this;
    this.update();
    return uNode;
  }
  _remNode(name) {
    let uNode = this.nodes.find((p) => p.name == name);
    this.nodes = this.nodes.filter((p) => p.name != name);
    uNode == null ? void 0 : uNode.removeEventListener(this.key);
    uNode == null ? void 0 : uNode.dispose();
    this.update();
  }
}
class UIGroup extends UpdateListener {
  constructor(system, group) {
    super();
    __publicField(this, "sys");
    __publicField(this, "link");
    __publicField(this, "collections", []);
    __publicField(this, "key");
    __publicField(this, "name");
    __publicField(this, "nameEdit");
    __publicField(this, "valid");
    __publicField(this, "parent");
    __publicField(this, "_isConstructed", false);
    this.sys = system;
    this.link = group;
    this.key = group.getKey();
    this.name = group.getName();
    this.nameEdit = this.name;
    var isValid = true;
    var colNames = group.getCollectionsNames();
    for (let i = 0; i < colNames.length; i++) {
      const n = colNames[i];
      const col = group.getCollection(n);
      if (!col)
        continue;
      const uicol = this._addCollection(this.sys, col);
      isValid = isValid && uicol.valid;
    }
    this.link.addUpdateListener(this.key, this.update.bind(this));
    this.valid = isValid;
    this._isConstructed = true;
  }
  isValidUpdate() {
    let orig = this.valid;
    var isValid = true;
    this.collections.forEach((p) => {
      isValid = isValid && p.valid;
    });
    this.valid = isValid;
    if (orig != this.valid) {
      this.callUpdateListeners(updateEvents.validChange);
    }
  }
  update() {
    if (!this._isConstructed) {
      return;
    }
    this.key = this.link.getKey();
    this.name = this.link.getName();
    this.nameEdit = this.link.getName();
    var colNames = this.link.getCollectionsNames();
    for (let i = 0; i < colNames.length; i++) {
      const n = colNames[i];
      if (this._hasCollection(n)) {
        continue;
      }
      const col = this.link.getCollection(n);
      if (!col)
        continue;
      this._addCollection(this.sys, col);
    }
    this.isValidUpdate();
    this.callUpdateListeners(updateEvents.update);
  }
  dispose() {
    this.removeAllEventListeners();
    this.collections.forEach((n) => n.dispose());
    this.link = null;
    this.sys = null;
    this.collections = [];
    this.parent = null;
  }
  getCollection(group, col) {
    this.parent.getCollection(group, col);
  }
  hasCollection(group, col) {
    this.parent.hasCollection(group, col);
  }
  addCollection(group, col) {
    this.parent.addCollection(group, col);
  }
  remCollection(group, col) {
    this.parent.remCollection(group, col);
  }
  _getCollection(col) {
    return this.collections.find((p) => p.name == col);
  }
  _hasCollection(col) {
    return !!this.collections.find((p) => p.name == col);
  }
  _addCollection(system, col) {
    let uCol = new UICollection(system, col);
    this.collections.push(uCol);
    uCol.addEventListener(this.key, updateEvents.validChange, this.isValidUpdate.bind(this));
    uCol.parent = this;
    return uCol;
  }
  _remCollection(col) {
    let uCol = this.collections.find((p) => p.name == col);
    this.collections = this.collections.filter((p) => p.name != col);
    uCol == null ? void 0 : uCol.removeEventListener(this.key);
    uCol == null ? void 0 : uCol.dispose();
    this.update();
  }
}
class UISystem extends UpdateListener {
  constructor(system) {
    super();
    __publicField(this, "sys");
    __publicField(this, "groups", []);
    __publicField(this, "valid", true);
    this.sys = system;
    this.valid = true;
    let groups = ["derived", "fixed"];
    for (let i = 0; i < groups.length; i++) {
      const grp = this.sys.data[groups[i]];
      const uigrp = new UIGroup(this, grp);
      this.groups.push(uigrp);
      this.valid = this.valid && uigrp.valid;
      uigrp.addEventListener(this.guid, updateEvents.validChange, this.update.bind(this));
      uigrp.parent = this;
    }
  }
  update() {
    let orig = this.valid;
    var isValid = true;
    this.groups.forEach((p) => {
      isValid = isValid && p.valid;
    });
    this.valid = isValid;
    if (orig != this.valid) {
      this.callUpdateListeners(updateEvents.validChange);
    }
    this.callUpdateListeners(updateEvents.update);
  }
  getGroup(name) {
    return this.groups.find((p) => p.name == name);
  }
  hasGroup(name) {
    return !!this.getGroup(name);
  }
  getCollection(group, col) {
    var _a;
    return (_a = this.getGroup(group)) == null ? void 0 : _a._getCollection(col);
  }
  hasCollection(group, col) {
    return !!this.getCollection(group, col);
  }
  addCollection(group, col) {
    if (!col) {
      const names = this.sys.getCollectionNames(group);
      col = StringFunctions.recursiveFindNewName("new Collection", names, (e) => e);
    }
    this.sys.createCollection(group, col);
  }
  remCollection(group, col) {
    var _a;
    (_a = this.getGroup(group)) == null ? void 0 : _a._remCollection(col);
  }
  renameCollection(group, col, rename) {
    this.sys.renameCollection(group, col, rename);
  }
  getNode(group, col, name) {
    var _a, _b;
    return (_b = (_a = this.getGroup(group)) == null ? void 0 : _a._getCollection(col)) == null ? void 0 : _b._getNode(name);
  }
  hasNode(group, col, name) {
    return !!this.getNode(group, col, name);
  }
  addNode(group, col, name) {
    var _a, _b, _c;
    if (!name) {
      const names = (_a = this.sys.getNodeNames(group, col)) != null ? _a : [];
      name = StringFunctions.recursiveFindNewName("new node", names, (e) => e);
    }
    this.sys.createNode(group, col, name);
    const node = this.sys.getNode(group, col, name);
    if (!node) {
      console.error("could not add new node");
      return;
    }
    (_c = (_b = this.getGroup(group)) == null ? void 0 : _b._getCollection(col)) == null ? void 0 : _c._addNode(node, this);
  }
  remNode(group, col, name) {
    var _a, _b;
    this.sys.deleteNode(group, col, name);
    (_b = (_a = this.getGroup(group)) == null ? void 0 : _a._getCollection(col)) == null ? void 0 : _b._remNode(name);
  }
  renameNode(group, col, name, rename) {
    this.sys.renameItem(group, col, name, rename);
  }
}
function create_fragment$h(ctx) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  let div7;
  let div0;
  let p;
  let t0;
  let t1;
  let div5;
  let div1;
  let t2;
  let t3;
  let input0;
  let t4;
  let div2;
  let t5;
  let t6;
  let div3;
  let t7_value = ((_d = (_c = (_b = (_a = ctx[0].link) == null ? void 0 : _a.parent) == null ? void 0 : _b.parent) == null ? void 0 : _c.name) != null ? _d : "unknown collection") + "." + ((_g = (_f = (_e = ctx[0].link) == null ? void 0 : _e.parent) == null ? void 0 : _f.name) != null ? _g : "unknown collection") + "." + ((_h = ctx[0]) == null ? void 0 : _h.name);
  let t7;
  let t8;
  let div4;
  let t9;
  let t10;
  let input1;
  let t11;
  let div6;
  let button0;
  let t12;
  let button0_disabled_value;
  let t13;
  let button1;
  let t14;
  let t15;
  let br0;
  let br1;
  let mounted;
  let dispose;
  return {
    c() {
      div7 = element("div");
      div0 = element("div");
      p = element("p");
      t0 = text("Editing node.\n			Here you can edit settings for this specific node. this edit is unique to this specific item.");
      t1 = space();
      div5 = element("div");
      div1 = element("div");
      t2 = text("Node Name");
      t3 = space();
      input0 = element("input");
      t4 = space();
      div2 = element("div");
      t5 = text("Node Location");
      t6 = space();
      div3 = element("div");
      t7 = text(t7_value);
      t8 = space();
      div4 = element("div");
      t9 = text("Standard Value");
      t10 = space();
      input1 = element("input");
      t11 = space();
      div6 = element("div");
      button0 = element("button");
      t12 = text("save changes");
      t13 = space();
      button1 = element("button");
      t14 = text("delete");
      t15 = space();
      br0 = element("br");
      br1 = element("br");
      this.h();
    },
    l(nodes) {
      div7 = claim_element(nodes, "DIV", { class: true });
      var div7_nodes = children(div7);
      div0 = claim_element(div7_nodes, "DIV", {});
      var div0_nodes = children(div0);
      p = claim_element(div0_nodes, "P", {});
      var p_nodes = children(p);
      t0 = claim_text(p_nodes, "Editing node.\n			Here you can edit settings for this specific node. this edit is unique to this specific item.");
      p_nodes.forEach(detach);
      div0_nodes.forEach(detach);
      t1 = claim_space(div7_nodes);
      div5 = claim_element(div7_nodes, "DIV", { class: true });
      var div5_nodes = children(div5);
      div1 = claim_element(div5_nodes, "DIV", {});
      var div1_nodes = children(div1);
      t2 = claim_text(div1_nodes, "Node Name");
      div1_nodes.forEach(detach);
      t3 = claim_space(div5_nodes);
      input0 = claim_element(div5_nodes, "INPUT", {
        type: true,
        class: true,
        contenteditable: true
      });
      t4 = claim_space(div5_nodes);
      div2 = claim_element(div5_nodes, "DIV", {});
      var div2_nodes = children(div2);
      t5 = claim_text(div2_nodes, "Node Location");
      div2_nodes.forEach(detach);
      t6 = claim_space(div5_nodes);
      div3 = claim_element(div5_nodes, "DIV", { class: true });
      var div3_nodes = children(div3);
      t7 = claim_text(div3_nodes, t7_value);
      div3_nodes.forEach(detach);
      t8 = claim_space(div5_nodes);
      div4 = claim_element(div5_nodes, "DIV", {});
      var div4_nodes = children(div4);
      t9 = claim_text(div4_nodes, "Standard Value");
      div4_nodes.forEach(detach);
      t10 = claim_space(div5_nodes);
      input1 = claim_element(div5_nodes, "INPUT", {
        type: true,
        class: true,
        contenteditable: true
      });
      div5_nodes.forEach(detach);
      t11 = claim_space(div7_nodes);
      div6 = claim_element(div7_nodes, "DIV", { class: true });
      var div6_nodes = children(div6);
      button0 = claim_element(div6_nodes, "BUTTON", {});
      var button0_nodes = children(button0);
      t12 = claim_text(button0_nodes, "save changes");
      button0_nodes.forEach(detach);
      t13 = claim_space(div6_nodes);
      button1 = claim_element(div6_nodes, "BUTTON", {});
      var button1_nodes = children(button1);
      t14 = claim_text(button1_nodes, "delete");
      button1_nodes.forEach(detach);
      div6_nodes.forEach(detach);
      t15 = claim_space(div7_nodes);
      br0 = claim_element(div7_nodes, "BR", {});
      br1 = claim_element(div7_nodes, "BR", {});
      div7_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(input0, "type", "text");
      attr(input0, "class", "ItemDesignerInput");
      attr(input0, "contenteditable", "");
      attr(div3, "class", "ItemDesignerInput");
      attr(input1, "type", "number");
      attr(input1, "class", "ItemDesignerInput");
      attr(input1, "contenteditable", "");
      attr(div5, "class", "ItemDesignerDataColumns");
      button0.disabled = button0_disabled_value = !ctx[6];
      attr(div6, "class", "ItemDesignerButtonRow");
      attr(div7, "class", "itemDesigner");
    },
    m(target, anchor) {
      insert_hydration(target, div7, anchor);
      append_hydration(div7, div0);
      append_hydration(div0, p);
      append_hydration(p, t0);
      append_hydration(div7, t1);
      append_hydration(div7, div5);
      append_hydration(div5, div1);
      append_hydration(div1, t2);
      append_hydration(div5, t3);
      append_hydration(div5, input0);
      set_input_value(input0, ctx[4]);
      append_hydration(div5, t4);
      append_hydration(div5, div2);
      append_hydration(div2, t5);
      append_hydration(div5, t6);
      append_hydration(div5, div3);
      append_hydration(div3, t7);
      append_hydration(div5, t8);
      append_hydration(div5, div4);
      append_hydration(div4, t9);
      append_hydration(div5, t10);
      append_hydration(div5, input1);
      set_input_value(input1, ctx[5]);
      append_hydration(div7, t11);
      append_hydration(div7, div6);
      append_hydration(div6, button0);
      append_hydration(button0, t12);
      append_hydration(div6, t13);
      append_hydration(div6, button1);
      append_hydration(button1, t14);
      append_hydration(div7, t15);
      append_hydration(div7, br0);
      append_hydration(div7, br1);
      if (!mounted) {
        dispose = [
          listen(input0, "input", ctx[7]),
          listen(input0, "input", ctx[17]),
          listen(input1, "input", ctx[8]),
          listen(input1, "input", ctx[18]),
          listen(button0, "click", ctx[9])
        ];
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2;
      if (dirty & 16 && input0.value !== ctx2[4]) {
        set_input_value(input0, ctx2[4]);
      }
      if (dirty & 1 && t7_value !== (t7_value = ((_d2 = (_c2 = (_b2 = (_a2 = ctx2[0].link) == null ? void 0 : _a2.parent) == null ? void 0 : _b2.parent) == null ? void 0 : _c2.name) != null ? _d2 : "unknown collection") + "." + ((_g2 = (_f2 = (_e2 = ctx2[0].link) == null ? void 0 : _e2.parent) == null ? void 0 : _f2.name) != null ? _g2 : "unknown collection") + "." + ((_h2 = ctx2[0]) == null ? void 0 : _h2.name)))
        set_data(t7, t7_value);
      if (dirty & 32 && to_number(input1.value) !== ctx2[5]) {
        set_input_value(input1, ctx2[5]);
      }
      if (dirty & 64 && button0_disabled_value !== (button0_disabled_value = !ctx2[6])) {
        button0.disabled = button0_disabled_value;
      }
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div7);
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$h($$self, $$props, $$invalidate) {
  let origName;
  let $controllerName, $$unsubscribe_controllerName = noop, $$subscribe_controllerName = () => ($$unsubscribe_controllerName(), $$unsubscribe_controllerName = subscribe(controllerName, ($$value) => $$invalidate(4, $controllerName = $$value)), controllerName);
  let $controllerValue, $$unsubscribe_controllerValue = noop, $$subscribe_controllerValue = () => ($$unsubscribe_controllerValue(), $$unsubscribe_controllerValue = subscribe(controllerValue, ($$value) => $$invalidate(5, $controllerValue = $$value)), controllerValue);
  let $controllerIsValid, $$unsubscribe_controllerIsValid = noop, $$subscribe_controllerIsValid = () => ($$unsubscribe_controllerIsValid(), $$unsubscribe_controllerIsValid = subscribe(controllerIsValid, ($$value) => $$invalidate(6, $controllerIsValid = $$value)), controllerIsValid);
  $$self.$$.on_destroy.push(() => $$unsubscribe_controllerName());
  $$self.$$.on_destroy.push(() => $$unsubscribe_controllerValue());
  $$self.$$.on_destroy.push(() => $$unsubscribe_controllerIsValid());
  var _a;
  let { node } = $$props;
  let { system } = $$props;
  let { secondSlideInReady = false } = $$props;
  let { goodTitle = "No Error" } = $$props;
  let { badTitle = "Error" } = $$props;
  let { messageHandler } = $$props;
  const dispatch2 = createEventDispatcher();
  let controller = new FixedItemController();
  let controllerName;
  let controllerValue;
  let controllerIsValid;
  function onNameInput(event) {
    let name = event.target.value;
    controller.name.set(name);
    controller.checkIsValid();
  }
  function onStandardValueInput(event) {
    let name = event.target.value;
    controller.name.set(name);
    controller.checkIsValid();
  }
  function onSave() {
    if (controller.saveNodeChanges()) {
      const oldName = origName;
      const newName = get_store_value(controller.name);
      dispatch2("save", { oldName, newName });
      origName = newName;
    }
  }
  onMount(mount);
  function mount() {
    controller.setControllerDeps(node, system, (msg) => {
    });
    controller.checkIsValid();
    $$subscribe_controllerName($$invalidate(1, controllerName = controller.name));
    origName = $controllerName;
    $$subscribe_controllerValue($$invalidate(2, controllerValue = controller.standardValue));
    $$subscribe_controllerIsValid($$invalidate(3, controllerIsValid = controller.isValid));
  }
  function forceUpdate() {
    mount();
  }
  function input0_input_handler() {
    $controllerName = this.value;
    controllerName.set($controllerName);
  }
  function input1_input_handler() {
    $controllerValue = to_number(this.value);
    controllerValue.set($controllerValue);
  }
  $$self.$$set = ($$props2) => {
    if ("node" in $$props2)
      $$invalidate(0, node = $$props2.node);
    if ("system" in $$props2)
      $$invalidate(10, system = $$props2.system);
    if ("secondSlideInReady" in $$props2)
      $$invalidate(11, secondSlideInReady = $$props2.secondSlideInReady);
    if ("goodTitle" in $$props2)
      $$invalidate(12, goodTitle = $$props2.goodTitle);
    if ("badTitle" in $$props2)
      $$invalidate(13, badTitle = $$props2.badTitle);
    if ("messageHandler" in $$props2)
      $$invalidate(14, messageHandler = $$props2.messageHandler);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 65537) {
      origName = $$invalidate(16, _a = node === null || node === void 0 ? void 0 : node.name) !== null && _a !== void 0 ? _a : "";
    }
  };
  return [
    node,
    controllerName,
    controllerValue,
    controllerIsValid,
    $controllerName,
    $controllerValue,
    $controllerIsValid,
    onNameInput,
    onStandardValueInput,
    onSave,
    system,
    secondSlideInReady,
    goodTitle,
    badTitle,
    messageHandler,
    forceUpdate,
    _a,
    input0_input_handler,
    input1_input_handler
  ];
}
class FixedItemDesigner extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$h, create_fragment$h, safe_not_equal, {
      node: 0,
      system: 10,
      secondSlideInReady: 11,
      goodTitle: 12,
      badTitle: 13,
      messageHandler: 14,
      forceUpdate: 15
    });
  }
  get forceUpdate() {
    return this.$$.ctx[15];
  }
}
function selectSlide(node, params, isInTransition = false) {
  var container = params.container;
  var button = params.button;
  const a = getComputedStyle(node).position == "fixed";
  if (a || !container) {
    node.style.transform = "";
    node.style.maxHeight = "";
    console.log("nospecial transition");
    return slide(node, params);
  }
  var existingTransform;
  var transformOrigin;
  if (isInTransition) {
    const mrect = container.getBoundingClientRect();
    const lrect = node.getBoundingClientRect();
    const measureBeneathBottom = lrect.bottom - mrect.bottom;
    const beneathBottom = measureBeneathBottom > 0;
    const measureAboveTop = -1 * (lrect.top - lrect.height) + mrect.top;
    const aboveTop = measureAboveTop > 0;
    var goUp;
    if (beneathBottom && aboveTop) {
      if (measureAboveTop < measureBeneathBottom) {
        goUp = true;
      } else {
        goUp = false;
      }
    } else if (beneathBottom) {
      goUp = true;
    } else {
      goUp = false;
    }
    var maxHeight;
    if (goUp) {
      maxHeight = measureAboveTop > 0 ? lrect.height - measureAboveTop : null;
    } else {
      maxHeight = measureBeneathBottom > 0 ? lrect.height - measureBeneathBottom : null;
    }
    if (maxHeight) {
      node.style.maxHeight = maxHeight;
    }
    if (maxHeight) {
      node.style.maxHeight = maxHeight;
    }
    var height = maxHeight != null ? maxHeight : lrect.height;
    height = goUp ? height * -1 : 0;
    const transform = `translateY(${height}px) translateY(${button.getBoundingClientRect().height * (goUp ? -1 : 0) - (goUp ? 20 : 0)}px) `;
    node.style.transform = transform;
    node.style.width = button.getBoundingClientRect().width + "px";
    node.style.maxHeight = maxHeight + "px";
    transformOrigin = goUp ? "bottom left" : "top left";
    existingTransform = getComputedStyle(node).transform.replace("none", "");
  } else {
    transformOrigin = getComputedStyle(node).transformOrigin;
    existingTransform = getComputedStyle(node).transform.replace("none", "");
  }
  return {
    delay: params.delay || 0,
    duration: params.duration || 400,
    easing: params.easing || cubicOut,
    css: (t, u) => `transform-origin: ${transformOrigin}; transform: ${existingTransform}  scaleY(${t}); opacity: ${t};`
  };
}
function get_each_context$3(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[23] = list[i];
  return child_ctx;
}
function create_key_block$2(ctx) {
  let div;
  let t_value = (ctx[0] == null ? ctx[2] : ctx[0]) + "";
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
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", {
        class: true,
        "data-isdisabled": true,
        "data-iserror": true,
        "data-selected": true,
        tabindex: true
      });
      var div_nodes = children(div);
      t = claim_text(div_nodes, t_value);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      var _a, _b, _c;
      attr(div, "class", "GrobSelectLabel effect");
      attr(div, "data-isdisabled", div_data_isdisabled_value = (_a = ctx[3]) != null ? _a : false);
      attr(div, "data-iserror", div_data_iserror_value = (_b = ctx[4]) != null ? _b : false);
      attr(div, "data-selected", div_data_selected_value = (_c = ctx[0]) != null ? _c : false);
      attr(div, "tabindex", "-1");
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      append_hydration(div, t);
      ctx[16](div);
      if (!mounted) {
        dispose = [
          listen(div, "focus", ctx[12]),
          listen(div, "blur", ctx[13])
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      var _a, _b, _c;
      if (dirty & 5 && t_value !== (t_value = (ctx2[0] == null ? ctx2[2] : ctx2[0]) + ""))
        set_data(t, t_value);
      if (dirty & 8 && div_data_isdisabled_value !== (div_data_isdisabled_value = (_a = ctx2[3]) != null ? _a : false)) {
        attr(div, "data-isdisabled", div_data_isdisabled_value);
      }
      if (dirty & 16 && div_data_iserror_value !== (div_data_iserror_value = (_b = ctx2[4]) != null ? _b : false)) {
        attr(div, "data-iserror", div_data_iserror_value);
      }
      if (dirty & 1 && div_data_selected_value !== (div_data_selected_value = (_c = ctx2[0]) != null ? _c : false)) {
        attr(div, "data-selected", div_data_selected_value);
      }
    },
    d(detaching) {
      if (detaching)
        detach(div);
      ctx[16](null);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block$b(ctx) {
  let div2;
  let div1;
  let t;
  let div0;
  let div2_transition;
  let current;
  function select_block_type(ctx2, dirty) {
    if (ctx2[1].length == 0)
      return create_if_block_1$8;
    return create_else_block$4;
  }
  let current_block_type = select_block_type(ctx);
  let if_block = current_block_type(ctx);
  return {
    c() {
      div2 = element("div");
      div1 = element("div");
      if_block.c();
      t = space();
      div0 = element("div");
      this.h();
    },
    l(nodes) {
      div2 = claim_element(nodes, "DIV", { class: true, "data-direction": true });
      var div2_nodes = children(div2);
      div1 = claim_element(div2_nodes, "DIV", {});
      var div1_nodes = children(div1);
      if_block.l(div1_nodes);
      t = claim_space(div1_nodes);
      div0 = claim_element(div1_nodes, "DIV", { class: true });
      var div0_nodes = children(div0);
      div0_nodes.forEach(detach);
      div1_nodes.forEach(detach);
      div2_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div0, "class", "selectEndTracker");
      attr(div2, "class", "SelectPopUp");
      attr(div2, "data-direction", "down");
    },
    m(target, anchor) {
      insert_hydration(target, div2, anchor);
      append_hydration(div2, div1);
      if_block.m(div1, null);
      append_hydration(div1, t);
      append_hydration(div1, div0);
      ctx[18](div0);
      ctx[19](div2);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
        if_block.p(ctx, dirty);
      } else {
        if_block.d(1);
        if_block = current_block_type(ctx);
        if (if_block) {
          if_block.c();
          if_block.m(div1, t);
        }
      }
    },
    i(local) {
      if (current)
        return;
      add_render_callback(() => {
        var _a;
        if (!current)
          return;
        if (!div2_transition)
          div2_transition = create_bidirectional_transition(
            div2,
            selectSlide,
            {
              container: (_a = ctx[6]) == null ? void 0 : _a.mainAppContainer,
              button: ctx[10]
            },
            true
          );
        div2_transition.run(1);
      });
      current = true;
    },
    o(local) {
      var _a;
      if (!div2_transition)
        div2_transition = create_bidirectional_transition(
          div2,
          selectSlide,
          {
            container: (_a = ctx[6]) == null ? void 0 : _a.mainAppContainer,
            button: ctx[10]
          },
          false
        );
      div2_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div2);
      if_block.d();
      ctx[18](null);
      ctx[19](null);
      if (detaching && div2_transition)
        div2_transition.end();
    }
  };
}
function create_else_block$4(ctx) {
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let each_1_anchor;
  let each_value = ctx[1];
  const get_key = (ctx2) => ctx2[23];
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$3(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
  }
  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    l(nodes) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].l(nodes);
      }
      each_1_anchor = empty();
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert_hydration(target, each_1_anchor, anchor);
    },
    p(ctx2, dirty) {
      if (dirty & 16387) {
        each_value = ctx2[1];
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$3, each_1_anchor, get_each_context$3);
      }
    },
    d(detaching) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d(detaching);
      }
      if (detaching)
        detach(each_1_anchor);
    }
  };
}
function create_if_block_1$8(ctx) {
  let i;
  let t;
  return {
    c() {
      i = element("i");
      t = text("No Options");
      this.h();
    },
    l(nodes) {
      i = claim_element(nodes, "I", { class: true });
      var i_nodes = children(i);
      t = claim_text(i_nodes, "No Options");
      i_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(i, "class", "GrobSelectInfo");
    },
    m(target, anchor) {
      insert_hydration(target, i, anchor);
      append_hydration(i, t);
    },
    p: noop,
    d(detaching) {
      if (detaching)
        detach(i);
    }
  };
}
function create_each_block$3(key_1, ctx) {
  let button;
  let t0_value = ctx[23] + "";
  let t0;
  let t1;
  let button_data_selected_value;
  let button_data_value_value;
  let mounted;
  let dispose;
  function focus_handler(...args) {
    return ctx[17](ctx[23], ...args);
  }
  return {
    key: key_1,
    first: null,
    c() {
      button = element("button");
      t0 = text(t0_value);
      t1 = space();
      this.h();
    },
    l(nodes) {
      button = claim_element(nodes, "BUTTON", {
        class: true,
        "data-selected": true,
        "data-value": true
      });
      var button_nodes = children(button);
      t0 = claim_text(button_nodes, t0_value);
      t1 = claim_space(button_nodes);
      button_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(button, "class", "GrobSelectOption");
      attr(button, "data-selected", button_data_selected_value = ctx[0] == ctx[23]);
      attr(button, "data-value", button_data_value_value = ctx[23]);
      this.first = button;
    },
    m(target, anchor) {
      insert_hydration(target, button, anchor);
      append_hydration(button, t0);
      append_hydration(button, t1);
      if (!mounted) {
        dispose = listen(button, "focus", focus_handler);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 2 && t0_value !== (t0_value = ctx[23] + ""))
        set_data(t0, t0_value);
      if (dirty & 3 && button_data_selected_value !== (button_data_selected_value = ctx[0] == ctx[23])) {
        attr(button, "data-selected", button_data_selected_value);
      }
      if (dirty & 2 && button_data_value_value !== (button_data_value_value = ctx[23])) {
        attr(button, "data-value", button_data_value_value);
      }
    },
    d(detaching) {
      if (detaching)
        detach(button);
      mounted = false;
      dispose();
    }
  };
}
function create_fragment$g(ctx) {
  let div1;
  let previous_key = ctx[0];
  let t;
  let div0;
  let current;
  let key_block = create_key_block$2(ctx);
  let if_block = (ctx[8] || ctx[5]) && create_if_block$b(ctx);
  return {
    c() {
      div1 = element("div");
      key_block.c();
      t = space();
      div0 = element("div");
      if (if_block)
        if_block.c();
      this.h();
    },
    l(nodes) {
      div1 = claim_element(nodes, "DIV", { class: true });
      var div1_nodes = children(div1);
      key_block.l(div1_nodes);
      t = claim_space(div1_nodes);
      div0 = claim_element(div1_nodes, "DIV", {});
      var div0_nodes = children(div0);
      if (if_block)
        if_block.l(div0_nodes);
      div0_nodes.forEach(detach);
      div1_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div1, "class", "GrobSelect");
    },
    m(target, anchor) {
      insert_hydration(target, div1, anchor);
      key_block.m(div1, null);
      append_hydration(div1, t);
      append_hydration(div1, div0);
      if (if_block)
        if_block.m(div0, null);
      ctx[20](div1);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (dirty & 1 && safe_not_equal(previous_key, previous_key = ctx2[0])) {
        key_block.d(1);
        key_block = create_key_block$2(ctx2);
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
          if_block = create_if_block$b(ctx2);
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
        detach(div1);
      key_block.d(detaching);
      if (if_block)
        if_block.d();
      ctx[20](null);
    }
  };
}
function instance$g($$self, $$props, $$invalidate) {
  let dispatch2 = createEventDispatcher();
  let { options } = $$props;
  let { selected = null } = $$props;
  let { unSelectedplaceholder = "None Selected" } = $$props;
  let { disabled = false } = $$props;
  let { isError = false } = $$props;
  let { forceOpen = false } = $$props;
  let { maxHeight = 500 } = $$props;
  let { context } = $$props;
  let label;
  let isFocussed = false;
  let endTracker;
  let self;
  let popUp;
  function onFocus() {
    return __awaiter(this, void 0, void 0, function* () {
      $$invalidate(8, isFocussed = true);
    });
  }
  function blur(e) {
    $$invalidate(8, isFocussed = false);
  }
  function clickOption(opt, ...params) {
    let value2 = opt;
    if (selected != value2) {
      $$invalidate(0, selected = value2);
      dispatch2("onSelect", selected);
    }
    $$invalidate(8, isFocussed = false);
  }
  function div_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      label = $$value;
      $$invalidate(7, label);
    });
  }
  const focus_handler = (opt, ...params) => clickOption(opt, ...params);
  function div0_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      endTracker = $$value;
      $$invalidate(9, endTracker);
    });
  }
  function div2_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      popUp = $$value;
      $$invalidate(11, popUp);
    });
  }
  function div1_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      self = $$value;
      $$invalidate(10, self);
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
      $$invalidate(15, maxHeight = $$props2.maxHeight);
    if ("context" in $$props2)
      $$invalidate(6, context = $$props2.context);
  };
  return [
    selected,
    options,
    unSelectedplaceholder,
    disabled,
    isError,
    forceOpen,
    context,
    label,
    isFocussed,
    endTracker,
    self,
    popUp,
    onFocus,
    blur,
    clickOption,
    maxHeight,
    div_binding,
    focus_handler,
    div0_binding,
    div2_binding,
    div1_binding
  ];
}
class CustomSelect extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$g, create_fragment$g, safe_not_equal, {
      options: 1,
      selected: 0,
      unSelectedplaceholder: 2,
      disabled: 3,
      isError: 4,
      forceOpen: 5,
      maxHeight: 15,
      context: 6
    });
  }
}
function create_fragment$f(ctx) {
  let svg;
  let path0;
  let path1;
  let path2;
  let line0;
  let line1;
  return {
    c() {
      svg = svg_element("svg");
      path0 = svg_element("path");
      path1 = svg_element("path");
      path2 = svg_element("path");
      line0 = svg_element("line");
      line1 = svg_element("line");
      this.h();
    },
    l(nodes) {
      svg = claim_svg_element(nodes, "svg", {
        xmlns: true,
        viewBox: true,
        fill: true,
        stroke: true,
        "stroke-width": true,
        "stroke-linecap": true,
        "stroke-linejoin": true,
        class: true
      });
      var svg_nodes = children(svg);
      path0 = claim_svg_element(svg_nodes, "path", { d: true });
      children(path0).forEach(detach);
      path1 = claim_svg_element(svg_nodes, "path", { d: true });
      children(path1).forEach(detach);
      path2 = claim_svg_element(svg_nodes, "path", { d: true });
      children(path2).forEach(detach);
      line0 = claim_svg_element(svg_nodes, "line", { x1: true, y1: true, x2: true, y2: true });
      children(line0).forEach(detach);
      line1 = claim_svg_element(svg_nodes, "line", { x1: true, y1: true, x2: true, y2: true });
      children(line1).forEach(detach);
      svg_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(path0, "d", "M3 6h18");
      attr(path1, "d", "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6");
      attr(path2, "d", "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2");
      attr(line0, "x1", "10");
      attr(line0, "y1", "11");
      attr(line0, "x2", "10");
      attr(line0, "y2", "17");
      attr(line1, "x1", "14");
      attr(line1, "y1", "11");
      attr(line1, "x2", "14");
      attr(line1, "y2", "17");
      attr(svg, "xmlns", "http://www.w3.org/2000/svg");
      attr(svg, "viewBox", "0 0 24 24");
      attr(svg, "fill", "none");
      attr(svg, "stroke", ctx[0]);
      attr(svg, "stroke-width", "2");
      attr(svg, "stroke-linecap", "round");
      attr(svg, "stroke-linejoin", "round");
      attr(svg, "class", "svg-icon lucide-trash-2");
    },
    m(target, anchor) {
      insert_hydration(target, svg, anchor);
      append_hydration(svg, path0);
      append_hydration(svg, path1);
      append_hydration(svg, path2);
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
function instance$f($$self, $$props, $$invalidate) {
  let { color = "black" } = $$props;
  $$self.$$set = ($$props2) => {
    if ("color" in $$props2)
      $$invalidate(0, color = $$props2.color);
  };
  return [color];
}
class Trash extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$f, create_fragment$f, safe_not_equal, { color: 0 });
  }
}
function create_else_block_1$1(ctx) {
  let div2;
  let div0;
  let t0_value = ctx[0].key + "";
  let t0;
  let t1;
  let div1;
  let t2;
  let t3;
  let div2_transition;
  let current;
  let mounted;
  let dispose;
  let if_block = !ctx[0].inCalc && create_if_block_2$6(ctx);
  return {
    c() {
      div2 = element("div");
      div0 = element("div");
      t0 = text(t0_value);
      t1 = space();
      div1 = element("div");
      t2 = text("Click To Add a Origin");
      t3 = space();
      if (if_block)
        if_block.c();
      this.h();
    },
    l(nodes) {
      div2 = claim_element(nodes, "DIV", {
        class: true,
        "data-styleactive": true,
        role: true
      });
      var div2_nodes = children(div2);
      div0 = claim_element(div2_nodes, "DIV", {});
      var div0_nodes = children(div0);
      t0 = claim_text(div0_nodes, t0_value);
      div0_nodes.forEach(detach);
      t1 = claim_space(div2_nodes);
      div1 = claim_element(div2_nodes, "DIV", {});
      var div1_nodes = children(div1);
      t2 = claim_text(div1_nodes, "Click To Add a Origin");
      div1_nodes.forEach(detach);
      t3 = claim_space(div2_nodes);
      if (if_block)
        if_block.l(div2_nodes);
      div2_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div2, "class", "derivedOriginRow");
      attr(div2, "data-styleactive", "false");
      attr(div2, "role", "none");
    },
    m(target, anchor) {
      insert_hydration(target, div2, anchor);
      append_hydration(div2, div0);
      append_hydration(div0, t0);
      append_hydration(div2, t1);
      append_hydration(div2, div1);
      append_hydration(div1, t2);
      append_hydration(div2, t3);
      if (if_block)
        if_block.m(div2, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen(div2, "click", ctx[11]),
          listen(div2, "keydown", ctx[11])
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if ((!current || dirty & 1) && t0_value !== (t0_value = ctx2[0].key + ""))
        set_data(t0, t0_value);
      if (!ctx2[0].inCalc) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & 1) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block_2$6(ctx2);
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
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      if (local) {
        add_render_callback(() => {
          if (!current)
            return;
          if (!div2_transition)
            div2_transition = create_bidirectional_transition(div2, slide, {}, true);
          div2_transition.run(1);
        });
      }
      current = true;
    },
    o(local) {
      transition_out(if_block);
      if (local) {
        if (!div2_transition)
          div2_transition = create_bidirectional_transition(div2, slide, {}, false);
        div2_transition.run(0);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div2);
      if (if_block)
        if_block.d();
      if (detaching && div2_transition)
        div2_transition.end();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block$a(ctx) {
  let div;
  let current_block_type_index;
  let if_block;
  let t0;
  let input;
  let t1;
  let customselect0;
  let updating_selected;
  let t2;
  let customselect1;
  let updating_selected_1;
  let t3;
  let customselect2;
  let updating_selected_2;
  let t4;
  let imagecontainer;
  let trash;
  let imagecontainer_data_color_value;
  let div_transition;
  let current;
  let mounted;
  let dispose;
  const if_block_creators = [create_if_block_1$7, create_else_block$3];
  const if_blocks = [];
  function select_block_type_1(ctx2, dirty) {
    if (ctx2[1].length == 0)
      return 0;
    return 1;
  }
  current_block_type_index = select_block_type_1(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  function customselect0_selected_binding(value2) {
    ctx[18](value2);
  }
  let customselect0_props = {
    options: ctx[6],
    context: ctx[2]
  };
  if (ctx[0].segments[0] !== void 0) {
    customselect0_props.selected = ctx[0].segments[0];
  }
  customselect0 = new CustomSelect({ props: customselect0_props });
  binding_callbacks.push(() => bind(customselect0, "selected", customselect0_selected_binding));
  customselect0.$on("onSelect", ctx[19]);
  customselect0.$on("onDeselect", ctx[20]);
  function customselect1_selected_binding(value2) {
    ctx[21](value2);
  }
  let customselect1_props = {
    options: ctx[3],
    disabled: !ctx[6],
    context: ctx[2]
  };
  if (ctx[0].segments[1] !== void 0) {
    customselect1_props.selected = ctx[0].segments[1];
  }
  customselect1 = new CustomSelect({ props: customselect1_props });
  binding_callbacks.push(() => bind(customselect1, "selected", customselect1_selected_binding));
  customselect1.$on("onSelect", ctx[22]);
  customselect1.$on("onDeselect", ctx[23]);
  function customselect2_selected_binding(value2) {
    ctx[24](value2);
  }
  let customselect2_props = {
    options: ctx[4],
    disabled: !ctx[3],
    context: ctx[2]
  };
  if (ctx[0].segments[2] !== void 0) {
    customselect2_props.selected = ctx[0].segments[2];
  }
  customselect2 = new CustomSelect({ props: customselect2_props });
  binding_callbacks.push(() => bind(customselect2, "selected", customselect2_selected_binding));
  customselect2.$on("onSelect", ctx[25]);
  customselect2.$on("onDeselect", ctx[26]);
  trash = new Trash({ props: { color: "white" } });
  return {
    c() {
      div = element("div");
      if_block.c();
      t0 = space();
      input = element("input");
      t1 = space();
      create_component(customselect0.$$.fragment);
      t2 = space();
      create_component(customselect1.$$.fragment);
      t3 = space();
      create_component(customselect2.$$.fragment);
      t4 = space();
      imagecontainer = element("imagecontainer");
      create_component(trash.$$.fragment);
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true, "data-styleactive": true });
      var div_nodes = children(div);
      if_block.l(div_nodes);
      t0 = claim_space(div_nodes);
      input = claim_element(div_nodes, "INPUT", { type: true, class: true });
      t1 = claim_space(div_nodes);
      claim_component(customselect0.$$.fragment, div_nodes);
      t2 = claim_space(div_nodes);
      claim_component(customselect1.$$.fragment, div_nodes);
      t3 = claim_space(div_nodes);
      claim_component(customselect2.$$.fragment, div_nodes);
      t4 = claim_space(div_nodes);
      imagecontainer = claim_element(div_nodes, "IMAGECONTAINER", {
        class: true,
        role: true,
        "data-color": true
      });
      var imagecontainer_nodes = children(imagecontainer);
      claim_component(trash.$$.fragment, imagecontainer_nodes);
      imagecontainer_nodes.forEach(detach);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(input, "type", "number");
      attr(input, "class", "derivedOriginRowInteractionField");
      attr(imagecontainer, "class", "derivedOriginRowInteractionField");
      attr(imagecontainer, "role", "none");
      attr(imagecontainer, "data-color", imagecontainer_data_color_value = ctx[0].inCalc ? "verbose" : "error");
      attr(div, "class", "derivedOriginRow");
      attr(div, "data-styleactive", "true");
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      if_blocks[current_block_type_index].m(div, null);
      append_hydration(div, t0);
      append_hydration(div, input);
      set_input_value(input, ctx[0].testValue);
      append_hydration(div, t1);
      mount_component(customselect0, div, null);
      append_hydration(div, t2);
      mount_component(customselect1, div, null);
      append_hydration(div, t3);
      mount_component(customselect2, div, null);
      append_hydration(div, t4);
      append_hydration(div, imagecontainer);
      mount_component(trash, imagecontainer, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen(input, "change", ctx[16]),
          listen(input, "input", ctx[17]),
          listen(imagecontainer, "click", ctx[9]),
          listen(imagecontainer, "keydown", ctx[9])
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type_1(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block.c();
        } else {
          if_block.p(ctx2, dirty);
        }
        transition_in(if_block, 1);
        if_block.m(div, t0);
      }
      if (dirty & 1 && to_number(input.value) !== ctx2[0].testValue) {
        set_input_value(input, ctx2[0].testValue);
      }
      const customselect0_changes = {};
      if (dirty & 4)
        customselect0_changes.context = ctx2[2];
      if (!updating_selected && dirty & 1) {
        updating_selected = true;
        customselect0_changes.selected = ctx2[0].segments[0];
        add_flush_callback(() => updating_selected = false);
      }
      customselect0.$set(customselect0_changes);
      const customselect1_changes = {};
      if (dirty & 8)
        customselect1_changes.options = ctx2[3];
      if (dirty & 4)
        customselect1_changes.context = ctx2[2];
      if (!updating_selected_1 && dirty & 1) {
        updating_selected_1 = true;
        customselect1_changes.selected = ctx2[0].segments[1];
        add_flush_callback(() => updating_selected_1 = false);
      }
      customselect1.$set(customselect1_changes);
      const customselect2_changes = {};
      if (dirty & 16)
        customselect2_changes.options = ctx2[4];
      if (dirty & 8)
        customselect2_changes.disabled = !ctx2[3];
      if (dirty & 4)
        customselect2_changes.context = ctx2[2];
      if (!updating_selected_2 && dirty & 1) {
        updating_selected_2 = true;
        customselect2_changes.selected = ctx2[0].segments[2];
        add_flush_callback(() => updating_selected_2 = false);
      }
      customselect2.$set(customselect2_changes);
      if (!current || dirty & 1 && imagecontainer_data_color_value !== (imagecontainer_data_color_value = ctx2[0].inCalc ? "verbose" : "error")) {
        attr(imagecontainer, "data-color", imagecontainer_data_color_value);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      transition_in(customselect0.$$.fragment, local);
      transition_in(customselect1.$$.fragment, local);
      transition_in(customselect2.$$.fragment, local);
      transition_in(trash.$$.fragment, local);
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
      transition_out(if_block);
      transition_out(customselect0.$$.fragment, local);
      transition_out(customselect1.$$.fragment, local);
      transition_out(customselect2.$$.fragment, local);
      transition_out(trash.$$.fragment, local);
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
      if_blocks[current_block_type_index].d();
      destroy_component(customselect0);
      destroy_component(customselect1);
      destroy_component(customselect2);
      destroy_component(trash);
      if (detaching && div_transition)
        div_transition.end();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block_2$6(ctx) {
  let imagecontainer;
  let trash;
  let imagecontainer_data_color_value;
  let current;
  let mounted;
  let dispose;
  trash = new Trash({ props: { color: "white" } });
  return {
    c() {
      imagecontainer = element("imagecontainer");
      create_component(trash.$$.fragment);
      this.h();
    },
    l(nodes) {
      imagecontainer = claim_element(nodes, "IMAGECONTAINER", {
        class: true,
        role: true,
        "data-color": true
      });
      var imagecontainer_nodes = children(imagecontainer);
      claim_component(trash.$$.fragment, imagecontainer_nodes);
      imagecontainer_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(imagecontainer, "class", "derivedOriginRowInteractionField");
      attr(imagecontainer, "role", "none");
      attr(imagecontainer, "data-color", imagecontainer_data_color_value = ctx[0].inCalc ? "verbose" : "error");
    },
    m(target, anchor) {
      insert_hydration(target, imagecontainer, anchor);
      mount_component(trash, imagecontainer, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen(imagecontainer, "click", ctx[9]),
          listen(imagecontainer, "keydown", ctx[9])
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (!current || dirty & 1 && imagecontainer_data_color_value !== (imagecontainer_data_color_value = ctx2[0].inCalc ? "verbose" : "error")) {
        attr(imagecontainer, "data-color", imagecontainer_data_color_value);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(trash.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(trash.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(imagecontainer);
      destroy_component(trash);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_else_block$3(ctx) {
  let customselect;
  let current;
  customselect = new CustomSelect({
    props: {
      context: ctx[2],
      selected: ctx[0].key,
      options: [...ctx[1], ctx[0].key]
    }
  });
  customselect.$on("onSelect", ctx[15]);
  return {
    c() {
      create_component(customselect.$$.fragment);
    },
    l(nodes) {
      claim_component(customselect.$$.fragment, nodes);
    },
    m(target, anchor) {
      mount_component(customselect, target, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      const customselect_changes = {};
      if (dirty & 4)
        customselect_changes.context = ctx2[2];
      if (dirty & 1)
        customselect_changes.selected = ctx2[0].key;
      if (dirty & 3)
        customselect_changes.options = [...ctx2[1], ctx2[0].key];
      customselect.$set(customselect_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(customselect.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(customselect.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      destroy_component(customselect, detaching);
    }
  };
}
function create_if_block_1$7(ctx) {
  let div;
  let t_value = ctx[0].key + "";
  let t;
  return {
    c() {
      div = element("div");
      t = text(t_value);
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      t = claim_text(div_nodes, t_value);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div, "class", "derivedOriginRowInteractionField");
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      append_hydration(div, t);
    },
    p(ctx2, dirty) {
      if (dirty & 1 && t_value !== (t_value = ctx2[0].key + ""))
        set_data(t, t_value);
    },
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(div);
    }
  };
}
function create_fragment$e(ctx) {
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block$a, create_else_block_1$1];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (ctx2[0].active)
      return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      if_block.c();
      if_block_anchor = empty();
    },
    l(nodes) {
      if_block.l(nodes);
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if_blocks[current_block_type_index].m(target, anchor);
      insert_hydration(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block.c();
        } else {
          if_block.p(ctx2, dirty);
        }
        transition_in(if_block, 1);
        if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
      if_blocks[current_block_type_index].d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function instance$e($$self, $$props, $$invalidate) {
  let { system } = $$props;
  let { rowData } = $$props;
  let { availableSymbols = [] } = $$props;
  let { allowSelectAll = false } = $$props;
  let { SelectAllText = "--Select All--" } = $$props;
  let { context } = $$props;
  let dispatch2 = createEventDispatcher();
  onMount(() => {
    var _a, _b;
    if (origin && rowData.segments) {
      if (!rowData.segments[0]) {
        return;
      }
      $$invalidate(3, options_level1 = (_a = system.data[rowData.segments[0]].getCollectionsNames()) !== null && _a !== void 0 ? _a : []);
      if (!rowData.segments[1]) {
        return;
      }
      $$invalidate(4, options_level2 = (_b = system.data[rowData.segments[0]].getCollection(rowData.segments[1]).getNodeNames()) !== null && _b !== void 0 ? _b : []);
    }
  });
  let options_level0 = ["fixed", "derived"];
  let options_level1 = [];
  let options_level2 = [];
  function onSelect(level, value2) {
    var _a;
    $$invalidate(0, rowData.isSelectAllTarget = false, rowData);
    switch (level) {
      case 0:
        $$invalidate(3, options_level1 = system.data[value2].getCollectionsNames());
        $$invalidate(0, rowData.segments[1] = null, rowData);
        $$invalidate(0, rowData.segments[2] = null, rowData);
        $$invalidate(4, options_level2 = []);
        if (origin) {
          dispatch2("deselectTargetNode");
        }
        $$invalidate(0, rowData.target = null, rowData);
        break;
      case 1:
        $$invalidate(4, options_level2 = (_a = system.getCollection(rowData.segments[0], value2)) === null || _a === void 0 ? void 0 : _a.getNodeNames());
        if (allowSelectAll && options_level2.length != 0) {
          $$invalidate(4, options_level2 = [SelectAllText, ...options_level2]);
        }
        $$invalidate(0, rowData.segments[2] = null, rowData);
        if (origin) {
          dispatch2("deselectTargetNode");
        }
        $$invalidate(0, rowData.target = null, rowData);
        break;
      case 2:
        if (allowSelectAll && value2 === SelectAllText) {
          $$invalidate(0, rowData.isSelectAllTarget = true, rowData);
          dispatch2("foundSelectAllTargetNode");
          return;
        }
        let targetNode2 = system.getNode(rowData.segments[0], rowData.segments[1], value2);
        $$invalidate(0, rowData.target = targetNode2, rowData);
        dispatch2("foundTargetNode", targetNode2);
        break;
    }
  }
  function onDeselect(level) {
    if (origin) {
      dispatch2("deselectTargetNode");
    }
    switch (level) {
      case 0:
        $$invalidate(3, options_level1 = []);
        $$invalidate(4, options_level2 = []);
        $$invalidate(0, rowData.target = null, rowData);
        $$invalidate(0, rowData.segments[1] = null, rowData);
        $$invalidate(0, rowData.segments[2] = null, rowData);
        break;
      case 1:
        $$invalidate(4, options_level2 = []);
        $$invalidate(0, rowData.segments[2] = null, rowData);
        $$invalidate(0, rowData.target = null, rowData);
        break;
      case 2:
        targetNode = null;
        break;
    }
  }
  function ondelete() {
    dispatch2("onDelete", rowData.key);
  }
  function onChangeSymbol(s) {
    dispatch2("onSymbolSelected", { old: rowData.key, new: s });
  }
  function fromPreOriginToOrigin() {
    console.log("asdasd");
    $$invalidate(0, rowData.active = true, rowData);
    $$invalidate(0, rowData.segments = new Array(3).fill(null), rowData);
  }
  const onSelect_handler = (e) => {
    onChangeSymbol(e.detail);
  };
  const change_handler = () => dispatch2("change");
  function input_input_handler() {
    rowData.testValue = to_number(this.value);
    $$invalidate(0, rowData);
  }
  function customselect0_selected_binding(value2) {
    if ($$self.$$.not_equal(rowData.segments[0], value2)) {
      rowData.segments[0] = value2;
      $$invalidate(0, rowData);
    }
  }
  const onSelect_handler_1 = (e) => onSelect(0, e.detail);
  const onDeselect_handler = () => onDeselect(0);
  function customselect1_selected_binding(value2) {
    if ($$self.$$.not_equal(rowData.segments[1], value2)) {
      rowData.segments[1] = value2;
      $$invalidate(0, rowData);
    }
  }
  const onSelect_handler_2 = (e) => onSelect(1, e.detail);
  const onDeselect_handler_1 = () => onDeselect(0);
  function customselect2_selected_binding(value2) {
    if ($$self.$$.not_equal(rowData.segments[2], value2)) {
      rowData.segments[2] = value2;
      $$invalidate(0, rowData);
    }
  }
  const onSelect_handler_3 = (e) => onSelect(2, e.detail);
  const onDeselect_handler_2 = () => onDeselect(0);
  $$self.$$set = ($$props2) => {
    if ("system" in $$props2)
      $$invalidate(12, system = $$props2.system);
    if ("rowData" in $$props2)
      $$invalidate(0, rowData = $$props2.rowData);
    if ("availableSymbols" in $$props2)
      $$invalidate(1, availableSymbols = $$props2.availableSymbols);
    if ("allowSelectAll" in $$props2)
      $$invalidate(13, allowSelectAll = $$props2.allowSelectAll);
    if ("SelectAllText" in $$props2)
      $$invalidate(14, SelectAllText = $$props2.SelectAllText);
    if ("context" in $$props2)
      $$invalidate(2, context = $$props2.context);
  };
  return [
    rowData,
    availableSymbols,
    context,
    options_level1,
    options_level2,
    dispatch2,
    options_level0,
    onSelect,
    onDeselect,
    ondelete,
    onChangeSymbol,
    fromPreOriginToOrigin,
    system,
    allowSelectAll,
    SelectAllText,
    onSelect_handler,
    change_handler,
    input_input_handler,
    customselect0_selected_binding,
    onSelect_handler_1,
    onDeselect_handler,
    customselect1_selected_binding,
    onSelect_handler_2,
    onDeselect_handler_1,
    customselect2_selected_binding,
    onSelect_handler_3,
    onDeselect_handler_2
  ];
}
class OriginRow extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$e, create_fragment$e, safe_not_equal, {
      system: 12,
      rowData: 0,
      availableSymbols: 1,
      allowSelectAll: 13,
      SelectAllText: 14,
      context: 2
    });
  }
}
function get_each_context$2(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[33] = list[i];
  child_ctx[34] = list;
  child_ctx[35] = i;
  return child_ctx;
}
function create_if_block$9(ctx) {
  let div1;
  let div0;
  let current;
  let if_block = ctx[15] && create_if_block_1$6(ctx);
  return {
    c() {
      div1 = element("div");
      div0 = element("div");
      if (if_block)
        if_block.c();
      this.h();
    },
    l(nodes) {
      div1 = claim_element(nodes, "DIV", {});
      var div1_nodes = children(div1);
      div0 = claim_element(div1_nodes, "DIV", { class: true });
      var div0_nodes = children(div0);
      if (if_block)
        if_block.l(div0_nodes);
      div0_nodes.forEach(detach);
      div1_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div0, "class", "derivedOriginRowsContainer");
    },
    m(target, anchor) {
      insert_hydration(target, div1, anchor);
      append_hydration(div1, div0);
      if (if_block)
        if_block.m(div0, null);
      current = true;
    },
    p(ctx2, dirty) {
      if (ctx2[15]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & 32768) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block_1$6(ctx2);
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
        detach(div1);
      if (if_block)
        if_block.d();
    }
  };
}
function create_if_block_1$6(ctx) {
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let each_1_anchor;
  let current;
  let each_value = ctx[15];
  const get_key = (ctx2) => (ctx2[33].key, ctx2[33].segments);
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$2(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
  }
  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    l(nodes) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].l(nodes);
      }
      each_1_anchor = empty();
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert_hydration(target, each_1_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (dirty[0] & 1868822) {
        each_value = ctx2[15];
        group_outros();
        for (let i = 0; i < each_blocks.length; i += 1)
          each_blocks[i].r();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, each_1_anchor.parentNode, fix_and_outro_and_destroy_block, create_each_block$2, each_1_anchor, get_each_context$2);
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
      current = true;
    },
    o(local) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d(detaching) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d(detaching);
      }
      if (detaching)
        detach(each_1_anchor);
    }
  };
}
function create_each_block$2(key_1, ctx) {
  let div;
  let originrow;
  let updating_rowData;
  let t;
  let div_transition;
  let rect;
  let stop_animation = noop;
  let current;
  function originrow_rowData_binding(value2) {
    ctx[28](value2, ctx[33], ctx[34], ctx[35]);
  }
  let originrow_props = {
    availableSymbols: ctx[10],
    system: ctx[1].sys,
    context: ctx[2]
  };
  if (ctx[33] !== void 0) {
    originrow_props.rowData = ctx[33];
  }
  originrow = new OriginRow({ props: originrow_props });
  binding_callbacks.push(() => bind(originrow, "rowData", originrow_rowData_binding));
  originrow.$on("change", ctx[18]);
  originrow.$on("onDelete", ctx[19]);
  originrow.$on("onSymbolSelected", ctx[20]);
  originrow.$on("foundTargetNode", ctx[29]);
  return {
    key: key_1,
    first: null,
    c() {
      div = element("div");
      create_component(originrow.$$.fragment);
      t = space();
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      claim_component(originrow.$$.fragment, div_nodes);
      t = claim_space(div_nodes);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div, "class", "derivedOriginRowContainer");
      this.first = div;
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      mount_component(originrow, div, null);
      append_hydration(div, t);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const originrow_changes = {};
      if (dirty[0] & 1024)
        originrow_changes.availableSymbols = ctx[10];
      if (dirty[0] & 2)
        originrow_changes.system = ctx[1].sys;
      if (dirty[0] & 4)
        originrow_changes.context = ctx[2];
      if (!updating_rowData && dirty[0] & 32768) {
        updating_rowData = true;
        originrow_changes.rowData = ctx[33];
        add_flush_callback(() => updating_rowData = false);
      }
      originrow.$set(originrow_changes);
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
      transition_in(originrow.$$.fragment, local);
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
      transition_out(originrow.$$.fragment, local);
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
      destroy_component(originrow);
      if (detaching && div_transition)
        div_transition.end();
    }
  };
}
function create_fragment$d(ctx) {
  var _a, _b, _c, _d, _e, _f, _g;
  let div10;
  let div0;
  let staticmessagehandler;
  let t0;
  let div1;
  let p;
  let t1;
  let t2;
  let div7;
  let div2;
  let t3;
  let t4;
  let input;
  let t5;
  let div3;
  let t6;
  let t7;
  let div4;
  let t8_value = ((_d = (_c = (_b = (_a = ctx[0]) == null ? void 0 : _a.parent) == null ? void 0 : _b.parent) == null ? void 0 : _c.name) != null ? _d : "unknown collection") + "." + ((_g = (_f = (_e = ctx[0]) == null ? void 0 : _e.parent) == null ? void 0 : _f.name) != null ? _g : "unknown collection") + "." + ctx[11];
  let t8;
  let t9;
  let div5;
  let t10;
  let t11;
  let textarea;
  let t12;
  let div6;
  let t13;
  let t14;
  let br0;
  let t15;
  let div8;
  let t16;
  let br1;
  let t17;
  let div9;
  let button;
  let t18;
  let t19;
  let br2;
  let br3;
  let current;
  let mounted;
  let dispose;
  let staticmessagehandler_props = {};
  staticmessagehandler = new StaticMessageHandler({ props: staticmessagehandler_props });
  ctx[25](staticmessagehandler);
  let if_block = ctx[0] && ctx[1] && create_if_block$9(ctx);
  return {
    c() {
      div10 = element("div");
      div0 = element("div");
      create_component(staticmessagehandler.$$.fragment);
      t0 = space();
      div1 = element("div");
      p = element("p");
      t1 = text("Editing node.\n			Here you can edit settings for this specific node. this edit is unique to this specific item.");
      t2 = space();
      div7 = element("div");
      div2 = element("div");
      t3 = text("Node Name");
      t4 = space();
      input = element("input");
      t5 = space();
      div3 = element("div");
      t6 = text("Node Location");
      t7 = space();
      div4 = element("div");
      t8 = text(t8_value);
      t9 = space();
      div5 = element("div");
      t10 = text("Calc");
      t11 = space();
      textarea = element("textarea");
      t12 = space();
      div6 = element("div");
      t13 = text(ctx[14]);
      t14 = space();
      br0 = element("br");
      t15 = space();
      div8 = element("div");
      if (if_block)
        if_block.c();
      t16 = space();
      br1 = element("br");
      t17 = space();
      div9 = element("div");
      button = element("button");
      t18 = text("save changes");
      t19 = space();
      br2 = element("br");
      br3 = element("br");
      this.h();
    },
    l(nodes) {
      div10 = claim_element(nodes, "DIV", {});
      var div10_nodes = children(div10);
      div0 = claim_element(div10_nodes, "DIV", {});
      var div0_nodes = children(div0);
      claim_component(staticmessagehandler.$$.fragment, div0_nodes);
      div0_nodes.forEach(detach);
      t0 = claim_space(div10_nodes);
      div1 = claim_element(div10_nodes, "DIV", {});
      var div1_nodes = children(div1);
      p = claim_element(div1_nodes, "P", {});
      var p_nodes = children(p);
      t1 = claim_text(p_nodes, "Editing node.\n			Here you can edit settings for this specific node. this edit is unique to this specific item.");
      p_nodes.forEach(detach);
      div1_nodes.forEach(detach);
      t2 = claim_space(div10_nodes);
      div7 = claim_element(div10_nodes, "DIV", { class: true });
      var div7_nodes = children(div7);
      div2 = claim_element(div7_nodes, "DIV", {});
      var div2_nodes = children(div2);
      t3 = claim_text(div2_nodes, "Node Name");
      div2_nodes.forEach(detach);
      t4 = claim_space(div7_nodes);
      input = claim_element(div7_nodes, "INPUT", {
        type: true,
        class: true,
        contenteditable: true
      });
      t5 = claim_space(div7_nodes);
      div3 = claim_element(div7_nodes, "DIV", {});
      var div3_nodes = children(div3);
      t6 = claim_text(div3_nodes, "Node Location");
      div3_nodes.forEach(detach);
      t7 = claim_space(div7_nodes);
      div4 = claim_element(div7_nodes, "DIV", { class: true });
      var div4_nodes = children(div4);
      t8 = claim_text(div4_nodes, t8_value);
      div4_nodes.forEach(detach);
      t9 = claim_space(div7_nodes);
      div5 = claim_element(div7_nodes, "DIV", {});
      var div5_nodes = children(div5);
      t10 = claim_text(div5_nodes, "Calc");
      div5_nodes.forEach(detach);
      t11 = claim_space(div7_nodes);
      textarea = claim_element(div7_nodes, "TEXTAREA", { class: true, placeholder: true });
      children(textarea).forEach(detach);
      t12 = claim_space(div7_nodes);
      div6 = claim_element(div7_nodes, "DIV", { class: true, "data-succes": true });
      var div6_nodes = children(div6);
      t13 = claim_text(div6_nodes, ctx[14]);
      div6_nodes.forEach(detach);
      div7_nodes.forEach(detach);
      t14 = claim_space(div10_nodes);
      br0 = claim_element(div10_nodes, "BR", {});
      t15 = claim_space(div10_nodes);
      div8 = claim_element(div10_nodes, "DIV", {});
      var div8_nodes = children(div8);
      if (if_block)
        if_block.l(div8_nodes);
      div8_nodes.forEach(detach);
      t16 = claim_space(div10_nodes);
      br1 = claim_element(div10_nodes, "BR", {});
      t17 = claim_space(div10_nodes);
      div9 = claim_element(div10_nodes, "DIV", { class: true });
      var div9_nodes = children(div9);
      button = claim_element(div9_nodes, "BUTTON", {});
      var button_nodes = children(button);
      t18 = claim_text(button_nodes, "save changes");
      button_nodes.forEach(detach);
      div9_nodes.forEach(detach);
      t19 = claim_space(div10_nodes);
      br2 = claim_element(div10_nodes, "BR", {});
      br3 = claim_element(div10_nodes, "BR", {});
      div10_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(input, "type", "text");
      attr(input, "class", "ItemDesignerInput");
      attr(input, "contenteditable", "");
      attr(div4, "class", "ItemDesignerInput");
      attr(textarea, "class", "calcInput");
      textarea.value = ctx[12];
      attr(textarea, "placeholder", "insert calcStatement here");
      attr(div6, "class", "derivedCalcStatementResult");
      attr(div6, "data-succes", ctx[13]);
      attr(div7, "class", "ItemDesignerDataColumns3");
      attr(div9, "class", "ItemDesignerButtonRow");
    },
    m(target, anchor) {
      insert_hydration(target, div10, anchor);
      append_hydration(div10, div0);
      mount_component(staticmessagehandler, div0, null);
      append_hydration(div10, t0);
      append_hydration(div10, div1);
      append_hydration(div1, p);
      append_hydration(p, t1);
      append_hydration(div10, t2);
      append_hydration(div10, div7);
      append_hydration(div7, div2);
      append_hydration(div2, t3);
      append_hydration(div7, t4);
      append_hydration(div7, input);
      set_input_value(input, ctx[11]);
      append_hydration(div7, t5);
      append_hydration(div7, div3);
      append_hydration(div3, t6);
      append_hydration(div7, t7);
      append_hydration(div7, div4);
      append_hydration(div4, t8);
      append_hydration(div7, t9);
      append_hydration(div7, div5);
      append_hydration(div5, t10);
      append_hydration(div7, t11);
      append_hydration(div7, textarea);
      append_hydration(div7, t12);
      append_hydration(div7, div6);
      append_hydration(div6, t13);
      append_hydration(div10, t14);
      append_hydration(div10, br0);
      append_hydration(div10, t15);
      append_hydration(div10, div8);
      if (if_block)
        if_block.m(div8, null);
      append_hydration(div10, t16);
      append_hydration(div10, br1);
      append_hydration(div10, t17);
      append_hydration(div10, div9);
      append_hydration(div9, button);
      append_hydration(button, t18);
      append_hydration(div10, t19);
      append_hydration(div10, br2);
      append_hydration(div10, br3);
      current = true;
      if (!mounted) {
        dispose = [
          listen(input, "input", ctx[26]),
          listen(input, "input", ctx[27]),
          listen(textarea, "input", ctx[17]),
          listen(button, "click", ctx[21])
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      var _a2, _b2, _c2, _d2, _e2, _f2, _g2;
      const staticmessagehandler_changes = {};
      staticmessagehandler.$set(staticmessagehandler_changes);
      if (dirty[0] & 2048 && input.value !== ctx2[11]) {
        set_input_value(input, ctx2[11]);
      }
      if ((!current || dirty[0] & 2049) && t8_value !== (t8_value = ((_d2 = (_c2 = (_b2 = (_a2 = ctx2[0]) == null ? void 0 : _a2.parent) == null ? void 0 : _b2.parent) == null ? void 0 : _c2.name) != null ? _d2 : "unknown collection") + "." + ((_g2 = (_f2 = (_e2 = ctx2[0]) == null ? void 0 : _e2.parent) == null ? void 0 : _f2.name) != null ? _g2 : "unknown collection") + "." + ctx2[11]))
        set_data(t8, t8_value);
      if (!current || dirty[0] & 4096) {
        textarea.value = ctx2[12];
      }
      if (!current || dirty[0] & 16384)
        set_data(t13, ctx2[14]);
      if (!current || dirty[0] & 8192) {
        attr(div6, "data-succes", ctx2[13]);
      }
      if (ctx2[0] && ctx2[1]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & 3) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$9(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(div8, null);
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
      transition_in(staticmessagehandler.$$.fragment, local);
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(staticmessagehandler.$$.fragment, local);
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div10);
      ctx[25](null);
      destroy_component(staticmessagehandler);
      if (if_block)
        if_block.d();
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$d($$self, $$props, $$invalidate) {
  let availableSymbols;
  let $controllerName, $$unsubscribe_controllerName = noop, $$subscribe_controllerName = () => ($$unsubscribe_controllerName(), $$unsubscribe_controllerName = subscribe(controllerName, ($$value) => $$invalidate(11, $controllerName = $$value)), controllerName);
  let $controllerCalc, $$unsubscribe_controllerCalc = noop, $$subscribe_controllerCalc = () => ($$unsubscribe_controllerCalc(), $$unsubscribe_controllerCalc = subscribe(controllerCalc, ($$value) => $$invalidate(12, $controllerCalc = $$value)), controllerCalc);
  let $controllerResultSucces, $$unsubscribe_controllerResultSucces = noop, $$subscribe_controllerResultSucces = () => ($$unsubscribe_controllerResultSucces(), $$unsubscribe_controllerResultSucces = subscribe(controllerResultSucces, ($$value) => $$invalidate(13, $controllerResultSucces = $$value)), controllerResultSucces);
  let $controllerResultValue, $$unsubscribe_controllerResultValue = noop, $$subscribe_controllerResultValue = () => ($$unsubscribe_controllerResultValue(), $$unsubscribe_controllerResultValue = subscribe(controllerResultValue, ($$value) => $$invalidate(14, $controllerResultValue = $$value)), controllerResultValue);
  let $controllerMappedOrigin, $$unsubscribe_controllerMappedOrigin = noop, $$subscribe_controllerMappedOrigin = () => ($$unsubscribe_controllerMappedOrigin(), $$unsubscribe_controllerMappedOrigin = subscribe(controllerMappedOrigin, ($$value) => $$invalidate(15, $controllerMappedOrigin = $$value)), controllerMappedOrigin);
  $$self.$$.on_destroy.push(() => $$unsubscribe_controllerName());
  $$self.$$.on_destroy.push(() => $$unsubscribe_controllerCalc());
  $$self.$$.on_destroy.push(() => $$unsubscribe_controllerResultSucces());
  $$self.$$.on_destroy.push(() => $$unsubscribe_controllerResultValue());
  $$self.$$.on_destroy.push(() => $$unsubscribe_controllerMappedOrigin());
  let { node } = $$props;
  let { system } = $$props;
  let { goodTitle = "No Error" } = $$props;
  let { badTitle = "Error" } = $$props;
  let { context } = $$props;
  let messageHandler;
  const dispatch2 = createEventDispatcher();
  let controller = new DerivedItemController();
  function forceUpdate() {
    controller.updateMappedOrigins();
  }
  let controllerMappedOrigin;
  let controllerResultValue;
  let controllerResultSucces;
  let controllerName;
  let controllerCalc;
  let origName;
  function onNameInput(event) {
    messageHandler === null || messageHandler === void 0 ? void 0 : messageHandler.removeError("save");
    let name = event.target.value;
    controller.name.set(name);
    controller.checkIsValid(false);
  }
  function onCalcInput(event) {
    let calc = event.target.value;
    controller.calc.set(calc);
    messageHandler === null || messageHandler === void 0 ? void 0 : messageHandler.removeError("save");
    controller.recalculateCalcAndOrigins();
    controller.checkIsValid(false);
  }
  function recalc() {
    controller.recalculateCalcAndOrigins();
    controller.checkIsValid(false);
  }
  function onDeleteClicked(e) {
    messageHandler === null || messageHandler === void 0 ? void 0 : messageHandler.removeError("save");
    controller.onKeyDelete(e);
    controller.checkIsValid(false);
  }
  function onKeyExchange(e) {
    messageHandler === null || messageHandler === void 0 ? void 0 : messageHandler.removeError("save");
    controller.onKeyExchange(e);
    controller.checkIsValid(false);
  }
  function onSave() {
    messageHandler === null || messageHandler === void 0 ? void 0 : messageHandler.removeError("save");
    if (controller.saveNodeChanges()) {
      const oldName = origName;
      const newName = get_store_value(controller.name);
      dispatch2("save", { oldName, newName });
      origName = newName;
    }
  }
  onMount(() => {
    controller.setControllerDeps(node, system, (msg) => {
    });
    controller.recalculateCalcAndOrigins();
    controller.checkIsValid();
    $$subscribe_controllerMappedOrigin($$invalidate(5, controllerMappedOrigin = controller.mappedOrigins));
    $$subscribe_controllerResultValue($$invalidate(6, controllerResultValue = controller.resultValue));
    $$subscribe_controllerResultSucces($$invalidate(7, controllerResultSucces = controller.resultSuccess));
    $$subscribe_controllerName($$invalidate(8, controllerName = controller.name));
    $$subscribe_controllerCalc($$invalidate(9, controllerCalc = controller.calc));
    controller.isValid;
    origName = get_store_value(controller.name);
  });
  function staticmessagehandler_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      messageHandler = $$value;
      $$invalidate(3, messageHandler);
    });
  }
  const input_handler = (e) => {
    onNameInput(e);
  };
  function input_input_handler() {
    $controllerName = this.value;
    controllerName.set($controllerName);
  }
  function originrow_rowData_binding(value2, origin2, each_value, origin_index) {
    each_value[origin_index] = value2;
    controllerMappedOrigin.set($controllerMappedOrigin);
  }
  const foundTargetNode_handler = (e) => {
    controller.checkIsValid(false);
  };
  $$self.$$set = ($$props2) => {
    if ("node" in $$props2)
      $$invalidate(0, node = $$props2.node);
    if ("system" in $$props2)
      $$invalidate(1, system = $$props2.system);
    if ("goodTitle" in $$props2)
      $$invalidate(22, goodTitle = $$props2.goodTitle);
    if ("badTitle" in $$props2)
      $$invalidate(23, badTitle = $$props2.badTitle);
    if ("context" in $$props2)
      $$invalidate(2, context = $$props2.context);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty[0] & 8) {
      $$invalidate(4, controller.messageHandler = messageHandler, controller);
    }
    if ($$self.$$.dirty[0] & 19) {
      controller.setControllerDeps(node, system, (msg) => {
      });
    }
    if ($$self.$$.dirty[0] & 16) {
      $$invalidate(10, availableSymbols = get_store_value(controller.mappedOrigins).filter((p) => !p.active).map((p) => p.key));
    }
  };
  return [
    node,
    system,
    context,
    messageHandler,
    controller,
    controllerMappedOrigin,
    controllerResultValue,
    controllerResultSucces,
    controllerName,
    controllerCalc,
    availableSymbols,
    $controllerName,
    $controllerCalc,
    $controllerResultSucces,
    $controllerResultValue,
    $controllerMappedOrigin,
    onNameInput,
    onCalcInput,
    recalc,
    onDeleteClicked,
    onKeyExchange,
    onSave,
    goodTitle,
    badTitle,
    forceUpdate,
    staticmessagehandler_binding,
    input_handler,
    input_input_handler,
    originrow_rowData_binding,
    foundTargetNode_handler
  ];
}
class DerivedItemDesigner extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance$d,
      create_fragment$d,
      safe_not_equal,
      {
        node: 0,
        system: 1,
        goodTitle: 22,
        badTitle: 23,
        context: 2,
        forceUpdate: 24
      },
      null,
      [-1, -1]
    );
  }
  get forceUpdate() {
    return this.$$.ctx[24];
  }
}
const selAllInCollectionString = "- - Select all - -";
class DerivedCollectionController {
  constructor() {
    __publicField(this, "system", null);
    __publicField(this, "messageHandler");
    __publicField(this, "name", writable(""));
    __publicField(this, "nameCalc", writable(""));
    __publicField(this, "tempValue", writable(1));
    __publicField(this, "calc", writable(""));
    __publicField(this, "resultValue", writable(0));
    __publicField(this, "resultSuccess", writable(true));
    __publicField(this, "resultNameValue", writable(""));
    __publicField(this, "resultNameSuccess", writable(true));
    __publicField(this, "isValid", writable(true));
    __publicField(this, "mappedOrigins", writable([]));
    __publicField(this, "generativeNameListData", writable([]));
  }
  setControllerDeps(system) {
    this.system = system;
    this.name.set("");
    this.nameCalc.set("");
    this.calc.set("");
    this.tempValue.set(0);
    this.resultSuccess.set(true);
    this.resultValue.set(0);
    this.resultNameSuccess.set(true);
    this.resultNameValue.set("");
    this.isValid.set(true);
    this.mappedOrigins.set([]);
  }
  validateName(name, messageHandler = null, output) {
    var _a, _b;
    let out = (key, msg, error) => {
      if (output) {
        messageHandler == null ? void 0 : messageHandler.addMessageManual(key, msg, error);
      }
    };
    let isValid = true;
    console.log(name);
    if (name == "") {
      isValid = false;
      out("name", "The name cannot be empty", "error");
    } else if (name.includes(".")) {
      isValid = false;
      out("name", 'The name cannot contain "."', "error");
    } else if (((_a = this.system) == null ? void 0 : _a.hasCollection("derived", name)) || ((_b = this.system) == null ? void 0 : _b.hasCollection("fixed", name))) {
      isValid = false;
      out("name", "The Collection name is already in use ", "error");
    } else {
      messageHandler == null ? void 0 : messageHandler.removeError("name");
    }
    return isValid;
  }
  validateItemName(nameCalc, calc, originData, messageHandler = null, output) {
    let out = (key, msg, error) => {
      if (output) {
        messageHandler == null ? void 0 : messageHandler.addMessageManual(key, msg, error);
      }
    };
    let symbolsCalc = GrobJDerivedNode.staticParseCalculationToOrigins(calc);
    let symbolsName = GrobJDerivedNode.staticParseCalculationToOrigins(nameCalc);
    symbolsName = symbolsName.filter((p) => symbolsCalc.includes(p));
    let symbolsMissing = symbolsCalc.filter((p) => !nameCalc.includes(p));
    let isValid = true;
    if (symbolsMissing.length != 0) {
      symbolsMissing.forEach((s) => {
        let isAllSetting = originData.findIndex((p) => p.isSelectAllTarget && p.key == s) != -1;
        if (isAllSetting) {
          out("NoSymbolName" + s, s + " was missing from name calculation \nAll Select All Settings must be in the name ", "error");
          isValid = false;
        }
      });
    }
    let nameRES = nameCalc;
    symbolsName.forEach((s) => {
      nameRES = nameRES.replace(s, "[" + s + "]");
    });
    this.resultNameSuccess.set(isValid);
    this.resultNameValue.set(nameRES);
    return isValid;
  }
  validateOrigins(mappedOrigins, calc, system, messageHandler = null, output) {
    let out = (key, msg, error) => {
      if (output) {
        messageHandler == null ? void 0 : messageHandler.addMessageManual(key, msg, error);
      }
    };
    let isValid = true;
    mappedOrigins.forEach((obj) => {
      if (obj.inCalc && !obj.target && !obj.isSelectAllTarget) {
        out(obj.key + "1", `Cannot save until all dependencies used in the calc is defined 
 ${obj.key} Had no target`, "error");
        isValid = false;
      } else {
        messageHandler == null ? void 0 : messageHandler.removeError(obj.key + "1");
      }
    });
    if (!isValid) {
      return false;
    }
    let NMap = mappedOrigins.filter((p) => calc.includes(p.key));
    NMap.forEach((o) => {
      if (!o.segments) {
        out(o.key, `Contents of ${o.key}'s segments was Null!'`, "error");
        isValid = false;
        return;
      }
      if (!o.isSelectAllTarget) {
        let dep = system.getNode(o.segments[0], o.segments[1], o.segments[2]);
        if (!dep) {
          out(o.key, `Target of ${o.key} location ${o.segments[0] + "." + o.segments[1] + "." + o.segments[2]} was invalid!'`, "error");
          isValid = false;
          return;
        }
      }
      messageHandler == null ? void 0 : messageHandler.removeError(o.key);
    });
    return isValid;
  }
  validateCalculation(calc, mappedOrigins, messageHandler = null, output) {
    let out = (key, msg, error) => {
      if (output) {
        messageHandler == null ? void 0 : messageHandler.addMessageManual(key, msg, error);
      }
    };
    if (calc.trim() == "") {
      out("calc", `Calculation cannot be empty`, "error");
      return false;
    }
    if (calc.trim() == "") {
      out("calc", `Calculation cannot be empty`, "error");
      return false;
    }
    let o = {};
    let mappedKeys = [];
    mappedOrigins.forEach((p) => {
      o[p.key] = p.testValue;
      mappedKeys.push(p.key);
    });
    let calcres = GrobJDerivedNode.testCalculate(calc, o);
    let succes = calcres.success;
    let value2 = calcres.value;
    if (!succes) {
      out("calc", `Calculation is invalid, meaning it could not parse`, "error");
    } else {
      messageHandler == null ? void 0 : messageHandler.removeError("calc");
    }
    this.resultValue.set(value2);
    this.resultSuccess.set(succes);
    return succes;
  }
  validateCalculationOrigins(calc, mappedOrigins, messageHandler = null, output) {
    let out = (key, msg, error) => {
      if (output) {
        messageHandler == null ? void 0 : messageHandler.addMessageManual(key, msg, error);
      }
    };
    let symbols2 = GrobJDerivedNode.staticParseCalculationToOrigins(calc);
    mappedOrigins.forEach((o) => {
      const index = symbols2.indexOf(o.key);
      if (index !== -1) {
        symbols2.splice(index, 1);
      }
      messageHandler == null ? void 0 : messageHandler.removeError(o.key + "missing");
    });
    let isValid = true;
    symbols2.forEach((s) => {
      isValid = false;
      out(s + "missing", `symbol ${s} was missing from origins `, "error");
    });
    return isValid;
  }
  _checkIsValid(output = true) {
    var _a;
    if (!this.system) {
      return false;
    }
    let isValid = true;
    isValid = isValid && this.validateName((_a = get_store_value(this.name)) != null ? _a : "", this.messageHandler, output);
    isValid = isValid && this.validateOrigins(get_store_value(this.mappedOrigins), get_store_value(this.calc), this.system.sys, this.messageHandler, output);
    isValid = isValid && this.validateCalculationOrigins(get_store_value(this.calc), get_store_value(this.mappedOrigins), this.messageHandler, output);
    let d = this.validateItemName(get_store_value(this.nameCalc), get_store_value(this.calc), get_store_value(this.mappedOrigins), this.messageHandler, output);
    isValid = isValid && d;
    isValid = isValid && this.validateCalculation(get_store_value(this.calc), get_store_value(this.mappedOrigins), this.messageHandler, output);
    return isValid;
  }
  checkIsValid(output = true) {
    var _a;
    (_a = this.messageHandler) == null ? void 0 : _a.removeAllMessages();
    let valid = this._checkIsValid(output);
    this.isValid.set(valid);
    return valid;
  }
  saveCollection() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    let success = this.checkIsValid(true);
    if (!success) {
      (_a = this.messageHandler) == null ? void 0 : _a.addMessageManual("save", "Was Not valid, so could not save", "error");
      return false;
    } else {
      try {
        debugger;
        let colName = get_store_value(this.name);
        (_b = this.system) == null ? void 0 : _b.addCollection("derived", colName);
        let nodesToCreate = (_c = this.generateNamePreview()) != null ? _c : [];
        nodesToCreate.forEach((node) => {
          var _a2, _b2, _c2;
          (_a2 = this.system) == null ? void 0 : _a2.addNode("derived", colName, node.name);
          let createdNode = (_c2 = (_b2 = this.system) == null ? void 0 : _b2.sys) == null ? void 0 : _c2.getNode("derived", colName, node.name);
          let calc = get_store_value(this.calc);
          createdNode == null ? void 0 : createdNode.setCalc(calc);
          if (createdNode) {
            Object.keys(node.deps).forEach((key) => {
              let dep = node.deps[key];
              createdNode.setOrigin(key, dep, 0);
            });
          }
        });
        (_e = (_d = this.system) == null ? void 0 : _d.getGroup("derived")) == null ? void 0 : _e.update();
        (_g = (_f = this.system) == null ? void 0 : _f.getCollection("derived", colName)) == null ? void 0 : _g.update();
      } catch (e) {
        success = false;
      }
    }
    if (success) {
      (_h = this.messageHandler) == null ? void 0 : _h.addMessageManual("save", "Saved Node", "good");
      return true;
    } else {
      (_i = this.messageHandler) == null ? void 0 : _i.addMessageManual("save", "Exception while trying to save Node in UI", "error");
      return false;
    }
  }
  onKeyExchange(e) {
    this.mappedOrigins.update((mappedOrigins) => {
      const s0 = e.detail.old;
      const s1 = e.detail.new;
      let t0 = mappedOrigins.find((p) => p.key == s0);
      if (!t0)
        return mappedOrigins;
      let t1 = mappedOrigins.find((p) => p.key == s1);
      if (!t1)
        return mappedOrigins;
      t0.key = s1;
      t0.inCalc = get_store_value(this.calc).includes(s1);
      t1.key = s0;
      t1.inCalc = get_store_value(this.calc).includes(s0);
      return mappedOrigins;
    });
    return;
  }
  onKeyDelete(e) {
    this.mappedOrigins.update((mappedOrigins) => {
      const key = e.detail;
      let old = mappedOrigins.find((p) => p.key == key);
      if (!old)
        return mappedOrigins;
      if (!old.active || !old.inCalc) {
        mappedOrigins.filter((p) => p.key != old.key);
      } else {
        old.active = false;
        old.segments = new Array(3).fill(null);
      }
      return mappedOrigins;
    });
  }
  recalculateCalcAndOrigins() {
    let o = {};
    get_store_value(this.mappedOrigins).forEach((p) => {
      o[p.key] = p.testValue;
    });
    let calc = get_store_value(this.calc);
    let res2 = GrobJDerivedNode.testCalculate(calc, o);
    this.resultValue.set(res2.value);
    this.resultSuccess.set(res2.success);
    let symbols2 = GrobJDerivedNode.staticParseCalculationToOrigins(calc);
    this.mappedOrigins.update((mappedOrigins) => {
      mappedOrigins.forEach((d) => {
        let inCalc = symbols2.includes(d.key);
        if (inCalc) {
          symbols2 = symbols2.filter((p) => p != d.key);
          d.inCalc = true;
        } else {
          d.inCalc = false;
        }
      });
      symbols2.forEach((s) => {
        mappedOrigins.push({ key: s, segments: new Array(3).fill(null), active: false, testValue: 1, inCalc: true, target: null, isSelectAllTarget: false });
      });
      return mappedOrigins;
    });
  }
  generateNamePreview() {
    if (!this.system) {
      this.generativeNameListData.set([]);
      return;
    }
    try {
      let recursiveNameFinder = function(self, nameCalc2, index = 0, arr, res22, deps) {
        var _a;
        let currentName = nameCalc2;
        let nodes;
        let curr = arr[index];
        if (!curr) {
          if (res22.data.findIndex((p) => p.name == currentName) != -1) {
            throw new Error("Double Name, in names generated Detected");
          }
          res22.data.push({ name: currentName, deps });
          return;
        }
        if (curr.segments[2] == selAllInCollectionString) {
          const sys = self.system.sys;
          let collection = sys.getCollection(curr.segments[0], curr.segments[1]);
          let n = (_a = collection == null ? void 0 : collection.getNodes()) != null ? _a : [];
          nodes = n;
        } else {
          const sys = self.system.sys;
          let collection = sys.getCollection(curr.segments[0], curr.segments[1]);
          let n = collection == null ? void 0 : collection.getNode(curr.segments[2]);
          nodes = n ? [n] : [];
        }
        nodes.forEach((node) => {
          let currNameCalc = currentName.replace(curr.key, node.getName());
          let _deps = Object.assign({}, deps);
          _deps[curr.key] = node;
          recursiveNameFinder(self, currNameCalc, index + 1, arr, res22, _deps);
        });
      };
      let origins = get_store_value(this.mappedOrigins);
      let nameCalc = get_store_value(this.nameCalc);
      let res2 = { data: [] };
      recursiveNameFinder(this, nameCalc, 0, origins, res2, {});
      this.generativeNameListData.set(res2.data.map((p) => p.name));
      return res2.data;
    } catch (e) {
      return null;
    }
  }
}
function create_if_block$8(ctx) {
  let div;
  let div_transition;
  let current;
  const default_slot_template = ctx[4].default;
  const default_slot = create_slot(default_slot_template, ctx, ctx[3], null);
  return {
    c() {
      div = element("div");
      if (default_slot)
        default_slot.c();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", {});
      var div_nodes = children(div);
      if (default_slot)
        default_slot.l(div_nodes);
      div_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      if (default_slot) {
        default_slot.m(div, null);
      }
      current = true;
    },
    p(ctx2, dirty) {
      if (default_slot) {
        if (default_slot.p && (!current || dirty & 8)) {
          update_slot_base(
            default_slot,
            default_slot_template,
            ctx2,
            ctx2[3],
            !current ? get_all_dirty_from_scope(ctx2[3]) : get_slot_changes(default_slot_template, ctx2[3], dirty, null),
            null
          );
        }
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(default_slot, local);
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
      transition_out(default_slot, local);
      if (!div_transition)
        div_transition = create_bidirectional_transition(div, slide, {}, false);
      div_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      if (default_slot)
        default_slot.d(detaching);
      if (detaching && div_transition)
        div_transition.end();
    }
  };
}
function create_fragment$c(ctx) {
  let div3;
  let div1;
  let p;
  let t0;
  let t1;
  let section;
  let t2;
  let t3;
  let div0;
  let t4;
  let div2;
  let current;
  let mounted;
  let dispose;
  let if_block = ctx[2] && create_if_block$8(ctx);
  return {
    c() {
      div3 = element("div");
      div1 = element("div");
      p = element("p");
      t0 = text(ctx[0]);
      t1 = space();
      section = element("section");
      t2 = text("\xA0");
      t3 = space();
      div0 = element("div");
      t4 = space();
      div2 = element("div");
      if (if_block)
        if_block.c();
      this.h();
    },
    l(nodes) {
      div3 = claim_element(nodes, "DIV", {});
      var div3_nodes = children(div3);
      div1 = claim_element(div3_nodes, "DIV", { class: true, "data-toogled": true });
      var div1_nodes = children(div1);
      p = claim_element(div1_nodes, "P", { style: true });
      var p_nodes = children(p);
      t0 = claim_text(p_nodes, ctx[0]);
      p_nodes.forEach(detach);
      t1 = claim_space(div1_nodes);
      section = claim_element(div1_nodes, "SECTION", { style: true, class: true });
      var section_nodes = children(section);
      t2 = claim_text(section_nodes, "\xA0");
      section_nodes.forEach(detach);
      t3 = claim_space(div1_nodes);
      div0 = claim_element(div1_nodes, "DIV", { style: true, class: true });
      children(div0).forEach(detach);
      div1_nodes.forEach(detach);
      t4 = claim_space(div3_nodes);
      div2 = claim_element(div3_nodes, "DIV", { class: true });
      var div2_nodes = children(div2);
      if (if_block)
        if_block.l(div2_nodes);
      div2_nodes.forEach(detach);
      div3_nodes.forEach(detach);
      this.h();
    },
    h() {
      set_style(p, "grid-area", "name");
      set_style(section, "grid-area", "icon");
      attr(section, "class", "toogleSectionIcon");
      set_style(div0, "grid-area", "line");
      attr(div0, "class", "toogleSectinLine");
      attr(div1, "class", "toogleSectionHeader");
      attr(div1, "data-toogled", ctx[2]);
      attr(div2, "class", "toogleSectionBody");
    },
    m(target, anchor) {
      insert_hydration(target, div3, anchor);
      append_hydration(div3, div1);
      append_hydration(div1, p);
      append_hydration(p, t0);
      append_hydration(div1, t1);
      append_hydration(div1, section);
      append_hydration(section, t2);
      append_hydration(div1, t3);
      append_hydration(div1, div0);
      append_hydration(div3, t4);
      append_hydration(div3, div2);
      if (if_block)
        if_block.m(div2, null);
      current = true;
      if (!mounted) {
        dispose = listen(div1, "click", ctx[5]);
        mounted = true;
      }
    },
    p(ctx2, [dirty]) {
      if (!current || dirty & 1)
        set_data(t0, ctx2[0]);
      if (!current || dirty & 4) {
        attr(div1, "data-toogled", ctx2[2]);
      }
      if (ctx2[2]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & 4) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$8(ctx2);
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
        detach(div3);
      if (if_block)
        if_block.d();
      mounted = false;
      dispose();
    }
  };
}
function instance$c($$self, $$props, $$invalidate) {
  let { $$slots: slots = {}, $$scope } = $$props;
  let { title } = $$props;
  let dispatch2 = createEventDispatcher();
  let toogled = false;
  function toogle(forceState = null) {
    let origState = toogled;
    if (forceState == null) {
      $$invalidate(2, toogled = !toogled);
    } else {
      $$invalidate(2, toogled = forceState);
    }
    if (toogled == origState)
      return;
    if (toogled) {
      dispatch2("close");
    } else {
      dispatch2("open");
    }
  }
  const click_handler = () => toogle();
  $$self.$$set = ($$props2) => {
    if ("title" in $$props2)
      $$invalidate(0, title = $$props2.title);
    if ("$$scope" in $$props2)
      $$invalidate(3, $$scope = $$props2.$$scope);
  };
  return [title, toogle, toogled, $$scope, slots, click_handler];
}
class ToogleSection extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$c, create_fragment$c, safe_not_equal, { title: 0, toogle: 1 });
  }
  get toogle() {
    return this.$$.ctx[1];
  }
}
function get_each_context$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[40] = list[i];
  return child_ctx;
}
function get_each_context_1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[43] = list[i];
  child_ctx[44] = list;
  child_ctx[45] = i;
  return child_ctx;
}
function create_if_block$7(ctx) {
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let each_1_anchor;
  let current;
  let each_value_1 = ctx[23];
  const get_key = (ctx2) => ctx2[43].key;
  for (let i = 0; i < each_value_1.length; i += 1) {
    let child_ctx = get_each_context_1(ctx, each_value_1, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
  }
  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    l(nodes) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].l(nodes);
      }
      each_1_anchor = empty();
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert_hydration(target, each_1_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (dirty[0] & 1619034161) {
        each_value_1 = ctx2[23];
        group_outros();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value_1, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block_1, each_1_anchor, get_each_context_1);
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      for (let i = 0; i < each_value_1.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o(local) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d(detaching) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d(detaching);
      }
      if (detaching)
        detach(each_1_anchor);
    }
  };
}
function create_each_block_1(key_1, ctx) {
  let div;
  let originrow;
  let updating_rowData;
  let t;
  let div_transition;
  let current;
  function originrow_rowData_binding(value2) {
    ctx[38](value2, ctx[43], ctx[44], ctx[45]);
  }
  let originrow_props = {
    availableSymbols: ctx[15],
    system: ctx[0].sys,
    context: ctx[4],
    allowSelectAll: true,
    SelectAllText: selAllInCollectionString
  };
  if (ctx[43] !== void 0) {
    originrow_props.rowData = ctx[43];
  }
  originrow = new OriginRow({ props: originrow_props });
  binding_callbacks.push(() => bind(originrow, "rowData", originrow_rowData_binding));
  originrow.$on("onDelete", ctx[29]);
  originrow.$on("onSymbolSelected", ctx[30]);
  originrow.$on("foundTargetNode", ctx[39]);
  return {
    key: key_1,
    first: null,
    c() {
      div = element("div");
      create_component(originrow.$$.fragment);
      t = space();
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      claim_component(originrow.$$.fragment, div_nodes);
      t = claim_space(div_nodes);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div, "class", "derivedOriginRowContainer");
      this.first = div;
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      mount_component(originrow, div, null);
      append_hydration(div, t);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const originrow_changes = {};
      if (dirty[0] & 32768)
        originrow_changes.availableSymbols = ctx[15];
      if (dirty[0] & 1)
        originrow_changes.system = ctx[0].sys;
      if (dirty[0] & 16)
        originrow_changes.context = ctx[4];
      if (!updating_rowData && dirty[0] & 8388608) {
        updating_rowData = true;
        originrow_changes.rowData = ctx[43];
        add_flush_callback(() => updating_rowData = false);
      }
      originrow.$set(originrow_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(originrow.$$.fragment, local);
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
      transition_out(originrow.$$.fragment, local);
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
      destroy_component(originrow);
      if (detaching && div_transition)
        div_transition.end();
    }
  };
}
function create_each_block$1(key_1, ctx) {
  let div;
  let t0_value = ctx[40] + "";
  let t0;
  let t1;
  let div_transition;
  let rect;
  let stop_animation = noop;
  let current;
  return {
    key: key_1,
    first: null,
    c() {
      div = element("div");
      t0 = text(t0_value);
      t1 = space();
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      t0 = claim_text(div_nodes, t0_value);
      t1 = claim_space(div_nodes);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div, "class", "derivedOriginRowContainer");
      this.first = div;
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      append_hydration(div, t0);
      append_hydration(div, t1);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if ((!current || dirty[0] & 16777216) && t0_value !== (t0_value = ctx[40] + ""))
        set_data(t0, t0_value);
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
      if (detaching && div_transition)
        div_transition.end();
    }
  };
}
function create_default_slot$1(ctx) {
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let each_1_anchor;
  let current;
  let each_value = ctx[24];
  const get_key = (ctx2) => ctx2[40];
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$1(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
  }
  return {
    c() {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      each_1_anchor = empty();
    },
    l(nodes) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].l(nodes);
      }
      each_1_anchor = empty();
    },
    m(target, anchor) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(target, anchor);
        }
      }
      insert_hydration(target, each_1_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      if (dirty[0] & 16777216) {
        each_value = ctx2[24];
        group_outros();
        for (let i = 0; i < each_blocks.length; i += 1)
          each_blocks[i].r();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, each_1_anchor.parentNode, fix_and_outro_and_destroy_block, create_each_block$1, each_1_anchor, get_each_context$1);
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
      current = true;
    },
    o(local) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d(detaching) {
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d(detaching);
      }
      if (detaching)
        detach(each_1_anchor);
    }
  };
}
function create_fragment$b(ctx) {
  let div14;
  let div0;
  let t0;
  let t1;
  let div1;
  let p;
  let t2;
  let t3;
  let div2;
  let t4;
  let div11;
  let div10;
  let div8;
  let div3;
  let t5;
  let t6;
  let textarea0;
  let t7;
  let div4;
  let t8;
  let t9;
  let textarea1;
  let t10;
  let div5;
  let t11;
  let t12;
  let div6;
  let t13;
  let t14;
  let textarea2;
  let t15;
  let div7;
  let t16;
  let t17;
  let div9;
  let t18;
  let br;
  let t19;
  let div12;
  let button0;
  let t20;
  let t21;
  let button1;
  let t22;
  let t23;
  let div13;
  let tooglesection;
  let div14_data_state_value;
  let div14_data_state_text_value;
  let current;
  let mounted;
  let dispose;
  let if_block = ctx[23] && ctx[1] && create_if_block$7(ctx);
  tooglesection = new ToogleSection({
    props: {
      title: "preview Names",
      $$slots: { default: [create_default_slot$1] },
      $$scope: { ctx }
    }
  });
  return {
    c() {
      div14 = element("div");
      div0 = element("div");
      t0 = text("X");
      t1 = space();
      div1 = element("div");
      p = element("p");
      t2 = text("Editing node.\n			Here you can edit settings for this specific node. this edit is unique to this specific item.");
      t3 = space();
      div2 = element("div");
      t4 = space();
      div11 = element("div");
      div10 = element("div");
      div8 = element("div");
      div3 = element("div");
      t5 = text("new Collection Name");
      t6 = space();
      textarea0 = element("textarea");
      t7 = space();
      div4 = element("div");
      t8 = text("Name");
      t9 = space();
      textarea1 = element("textarea");
      t10 = space();
      div5 = element("div");
      t11 = text(ctx[19]);
      t12 = space();
      div6 = element("div");
      t13 = text("Calc");
      t14 = space();
      textarea2 = element("textarea");
      t15 = space();
      div7 = element("div");
      t16 = text(ctx[22]);
      t17 = space();
      div9 = element("div");
      if (if_block)
        if_block.c();
      t18 = space();
      br = element("br");
      t19 = space();
      div12 = element("div");
      button0 = element("button");
      t20 = text("save changes");
      t21 = space();
      button1 = element("button");
      t22 = text("Generate Name Preview");
      t23 = space();
      div13 = element("div");
      create_component(tooglesection.$$.fragment);
      this.h();
    },
    l(nodes) {
      div14 = claim_element(nodes, "DIV", {
        class: true,
        "data-state": true,
        "data-state-text": true
      });
      var div14_nodes = children(div14);
      div0 = claim_element(div14_nodes, "DIV", { class: true });
      var div0_nodes = children(div0);
      t0 = claim_text(div0_nodes, "X");
      div0_nodes.forEach(detach);
      t1 = claim_space(div14_nodes);
      div1 = claim_element(div14_nodes, "DIV", {});
      var div1_nodes = children(div1);
      p = claim_element(div1_nodes, "P", {});
      var p_nodes = children(p);
      t2 = claim_text(p_nodes, "Editing node.\n			Here you can edit settings for this specific node. this edit is unique to this specific item.");
      p_nodes.forEach(detach);
      div1_nodes.forEach(detach);
      t3 = claim_space(div14_nodes);
      div2 = claim_element(div14_nodes, "DIV", { class: true });
      var div2_nodes = children(div2);
      div2_nodes.forEach(detach);
      t4 = claim_space(div14_nodes);
      div11 = claim_element(div14_nodes, "DIV", {});
      var div11_nodes = children(div11);
      div10 = claim_element(div11_nodes, "DIV", { class: true });
      var div10_nodes = children(div10);
      div8 = claim_element(div10_nodes, "DIV", { class: true });
      var div8_nodes = children(div8);
      div3 = claim_element(div8_nodes, "DIV", {});
      var div3_nodes = children(div3);
      t5 = claim_text(div3_nodes, "new Collection Name");
      div3_nodes.forEach(detach);
      t6 = claim_space(div8_nodes);
      textarea0 = claim_element(div8_nodes, "TEXTAREA", { class: true, contenteditable: true });
      children(textarea0).forEach(detach);
      t7 = claim_space(div8_nodes);
      div4 = claim_element(div8_nodes, "DIV", { "data-succes": true });
      var div4_nodes = children(div4);
      t8 = claim_text(div4_nodes, "Name");
      div4_nodes.forEach(detach);
      t9 = claim_space(div8_nodes);
      textarea1 = claim_element(div8_nodes, "TEXTAREA", { class: true, placeholder: true });
      children(textarea1).forEach(detach);
      t10 = claim_space(div8_nodes);
      div5 = claim_element(div8_nodes, "DIV", { class: true, "data-succes": true });
      var div5_nodes = children(div5);
      t11 = claim_text(div5_nodes, ctx[19]);
      div5_nodes.forEach(detach);
      t12 = claim_space(div8_nodes);
      div6 = claim_element(div8_nodes, "DIV", { "data-succes": true });
      var div6_nodes = children(div6);
      t13 = claim_text(div6_nodes, "Calc");
      div6_nodes.forEach(detach);
      t14 = claim_space(div8_nodes);
      textarea2 = claim_element(div8_nodes, "TEXTAREA", { class: true, placeholder: true });
      children(textarea2).forEach(detach);
      t15 = claim_space(div8_nodes);
      div7 = claim_element(div8_nodes, "DIV", { class: true, "data-succes": true });
      var div7_nodes = children(div7);
      t16 = claim_text(div7_nodes, ctx[22]);
      div7_nodes.forEach(detach);
      div8_nodes.forEach(detach);
      t17 = claim_space(div10_nodes);
      div9 = claim_element(div10_nodes, "DIV", { class: true });
      var div9_nodes = children(div9);
      if (if_block)
        if_block.l(div9_nodes);
      div9_nodes.forEach(detach);
      div10_nodes.forEach(detach);
      div11_nodes.forEach(detach);
      t18 = claim_space(div14_nodes);
      br = claim_element(div14_nodes, "BR", {});
      t19 = claim_space(div14_nodes);
      div12 = claim_element(div14_nodes, "DIV", { class: true });
      var div12_nodes = children(div12);
      button0 = claim_element(div12_nodes, "BUTTON", {});
      var button0_nodes = children(button0);
      t20 = claim_text(button0_nodes, "save changes");
      button0_nodes.forEach(detach);
      t21 = claim_space(div12_nodes);
      button1 = claim_element(div12_nodes, "BUTTON", {});
      var button1_nodes = children(button1);
      t22 = claim_text(button1_nodes, "Generate Name Preview");
      button1_nodes.forEach(detach);
      div12_nodes.forEach(detach);
      t23 = claim_space(div14_nodes);
      div13 = claim_element(div14_nodes, "DIV", {});
      var div13_nodes = children(div13);
      claim_component(tooglesection.$$.fragment, div13_nodes);
      div13_nodes.forEach(detach);
      div14_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div0, "class", "DerivedCollectionDesignerCloseBtn");
      attr(div2, "class", "ItemDesigner_TwoColumnData");
      attr(textarea0, "class", "calcInput ItemDesignerInput");
      attr(textarea0, "contenteditable", "");
      attr(div4, "data-succes", ctx[18]);
      attr(textarea1, "class", "calcInput");
      attr(textarea1, "placeholder", "insert Name Calc Statement here");
      attr(div5, "class", "derivedCalcStatementResult");
      attr(div5, "data-succes", ctx[18]);
      attr(div6, "data-succes", ctx[20]);
      attr(textarea2, "class", "calcInput");
      textarea2.value = ctx[21];
      attr(textarea2, "placeholder", "insert calcStatement here");
      attr(div7, "class", "derivedCalcStatementResult");
      attr(div7, "data-succes", ctx[20]);
      attr(div8, "class", "derivedCollectionCalcStatementMatrix");
      attr(div9, "class", "derivedOriginRowsContainer");
      attr(div10, "class", "OriginEditor");
      attr(div12, "class", "ItemDesignerButtonRow");
      attr(div14, "class", "DerivedCollectionDesigner");
      attr(div14, "data-state", div14_data_state_value = ctx[16] ? "good" : "error");
      attr(div14, "data-state-text", div14_data_state_text_value = ctx[16] ? ctx[2] : ctx[3]);
    },
    m(target, anchor) {
      insert_hydration(target, div14, anchor);
      append_hydration(div14, div0);
      append_hydration(div0, t0);
      append_hydration(div14, t1);
      append_hydration(div14, div1);
      append_hydration(div1, p);
      append_hydration(p, t2);
      append_hydration(div14, t3);
      append_hydration(div14, div2);
      append_hydration(div14, t4);
      append_hydration(div14, div11);
      append_hydration(div11, div10);
      append_hydration(div10, div8);
      append_hydration(div8, div3);
      append_hydration(div3, t5);
      append_hydration(div8, t6);
      append_hydration(div8, textarea0);
      set_input_value(textarea0, ctx[17]);
      append_hydration(div8, t7);
      append_hydration(div8, div4);
      append_hydration(div4, t8);
      append_hydration(div8, t9);
      append_hydration(div8, textarea1);
      append_hydration(div8, t10);
      append_hydration(div8, div5);
      append_hydration(div5, t11);
      append_hydration(div8, t12);
      append_hydration(div8, div6);
      append_hydration(div6, t13);
      append_hydration(div8, t14);
      append_hydration(div8, textarea2);
      append_hydration(div8, t15);
      append_hydration(div8, div7);
      append_hydration(div7, t16);
      append_hydration(div10, t17);
      append_hydration(div10, div9);
      if (if_block)
        if_block.m(div9, null);
      append_hydration(div14, t18);
      append_hydration(div14, br);
      append_hydration(div14, t19);
      append_hydration(div14, div12);
      append_hydration(div12, button0);
      append_hydration(button0, t20);
      append_hydration(div12, t21);
      append_hydration(div12, button1);
      append_hydration(button1, t22);
      append_hydration(div14, t23);
      append_hydration(div14, div13);
      mount_component(tooglesection, div13, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen(div0, "click", ctx[35]),
          listen(div0, "keypress", ctx[34]),
          listen(textarea0, "input", ctx[36]),
          listen(textarea0, "input", ctx[37]),
          listen(textarea1, "input", ctx[27]),
          listen(textarea2, "input", ctx[28]),
          listen(button0, "click", ctx[31]),
          listen(button1, "click", ctx[32])
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty[0] & 131072) {
        set_input_value(textarea0, ctx2[17]);
      }
      if (!current || dirty[0] & 262144) {
        attr(div4, "data-succes", ctx2[18]);
      }
      if (!current || dirty[0] & 524288)
        set_data(t11, ctx2[19]);
      if (!current || dirty[0] & 262144) {
        attr(div5, "data-succes", ctx2[18]);
      }
      if (!current || dirty[0] & 1048576) {
        attr(div6, "data-succes", ctx2[20]);
      }
      if (!current || dirty[0] & 2097152) {
        textarea2.value = ctx2[21];
      }
      if (!current || dirty[0] & 4194304)
        set_data(t16, ctx2[22]);
      if (!current || dirty[0] & 1048576) {
        attr(div7, "data-succes", ctx2[20]);
      }
      if (ctx2[23] && ctx2[1]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & 8388610) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$7(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(div9, null);
        }
      } else if (if_block) {
        group_outros();
        transition_out(if_block, 1, 1, () => {
          if_block = null;
        });
        check_outros();
      }
      const tooglesection_changes = {};
      if (dirty[0] & 16777216 | dirty[1] & 32768) {
        tooglesection_changes.$$scope = { dirty, ctx: ctx2 };
      }
      tooglesection.$set(tooglesection_changes);
      if (!current || dirty[0] & 65536 && div14_data_state_value !== (div14_data_state_value = ctx2[16] ? "good" : "error")) {
        attr(div14, "data-state", div14_data_state_value);
      }
      if (!current || dirty[0] & 65548 && div14_data_state_text_value !== (div14_data_state_text_value = ctx2[16] ? ctx2[2] : ctx2[3])) {
        attr(div14, "data-state-text", div14_data_state_text_value);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      transition_in(tooglesection.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(if_block);
      transition_out(tooglesection.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div14);
      if (if_block)
        if_block.d();
      destroy_component(tooglesection);
      mounted = false;
      run_all(dispose);
    }
  };
}
function instance$b($$self, $$props, $$invalidate) {
  let availableSymbols;
  let $controllerIsValid, $$unsubscribe_controllerIsValid = noop, $$subscribe_controllerIsValid = () => ($$unsubscribe_controllerIsValid(), $$unsubscribe_controllerIsValid = subscribe(controllerIsValid, ($$value) => $$invalidate(16, $controllerIsValid = $$value)), controllerIsValid);
  let $controllerName, $$unsubscribe_controllerName = noop, $$subscribe_controllerName = () => ($$unsubscribe_controllerName(), $$unsubscribe_controllerName = subscribe(controllerName, ($$value) => $$invalidate(17, $controllerName = $$value)), controllerName);
  let $controllerNameResultSucces, $$unsubscribe_controllerNameResultSucces = noop, $$subscribe_controllerNameResultSucces = () => ($$unsubscribe_controllerNameResultSucces(), $$unsubscribe_controllerNameResultSucces = subscribe(controllerNameResultSucces, ($$value) => $$invalidate(18, $controllerNameResultSucces = $$value)), controllerNameResultSucces);
  let $controllerNameResultValue, $$unsubscribe_controllerNameResultValue = noop, $$subscribe_controllerNameResultValue = () => ($$unsubscribe_controllerNameResultValue(), $$unsubscribe_controllerNameResultValue = subscribe(controllerNameResultValue, ($$value) => $$invalidate(19, $controllerNameResultValue = $$value)), controllerNameResultValue);
  let $controllerResultSucces, $$unsubscribe_controllerResultSucces = noop, $$subscribe_controllerResultSucces = () => ($$unsubscribe_controllerResultSucces(), $$unsubscribe_controllerResultSucces = subscribe(controllerResultSucces, ($$value) => $$invalidate(20, $controllerResultSucces = $$value)), controllerResultSucces);
  let $controllerCalc, $$unsubscribe_controllerCalc = noop, $$subscribe_controllerCalc = () => ($$unsubscribe_controllerCalc(), $$unsubscribe_controllerCalc = subscribe(controllerCalc, ($$value) => $$invalidate(21, $controllerCalc = $$value)), controllerCalc);
  let $controllerResultValue, $$unsubscribe_controllerResultValue = noop, $$subscribe_controllerResultValue = () => ($$unsubscribe_controllerResultValue(), $$unsubscribe_controllerResultValue = subscribe(controllerResultValue, ($$value) => $$invalidate(22, $controllerResultValue = $$value)), controllerResultValue);
  let $controllerMappedOrigin, $$unsubscribe_controllerMappedOrigin = noop, $$subscribe_controllerMappedOrigin = () => ($$unsubscribe_controllerMappedOrigin(), $$unsubscribe_controllerMappedOrigin = subscribe(controllerMappedOrigin, ($$value) => $$invalidate(23, $controllerMappedOrigin = $$value)), controllerMappedOrigin);
  let $generativeNameListData, $$unsubscribe_generativeNameListData = noop, $$subscribe_generativeNameListData = () => ($$unsubscribe_generativeNameListData(), $$unsubscribe_generativeNameListData = subscribe(generativeNameListData, ($$value) => $$invalidate(24, $generativeNameListData = $$value)), generativeNameListData);
  $$self.$$.on_destroy.push(() => $$unsubscribe_controllerIsValid());
  $$self.$$.on_destroy.push(() => $$unsubscribe_controllerName());
  $$self.$$.on_destroy.push(() => $$unsubscribe_controllerNameResultSucces());
  $$self.$$.on_destroy.push(() => $$unsubscribe_controllerNameResultValue());
  $$self.$$.on_destroy.push(() => $$unsubscribe_controllerResultSucces());
  $$self.$$.on_destroy.push(() => $$unsubscribe_controllerCalc());
  $$self.$$.on_destroy.push(() => $$unsubscribe_controllerResultValue());
  $$self.$$.on_destroy.push(() => $$unsubscribe_controllerMappedOrigin());
  $$self.$$.on_destroy.push(() => $$unsubscribe_generativeNameListData());
  const dispatch2 = createEventDispatcher();
  let { system } = $$props;
  let { secondSlideInReady = false } = $$props;
  let { goodTitle = "No Error" } = $$props;
  let { badTitle = "Error" } = $$props;
  let { context } = $$props;
  let { messageHandler } = $$props;
  let controller = new DerivedCollectionController();
  let controllerMappedOrigin;
  let controllerResultValue;
  let controllerResultSucces;
  let controllerNameResultSucces;
  let controllerNameResultValue;
  let controllerName;
  let controllerCalc;
  let controllerIsValid;
  let generativeNameListData;
  function onNameInput(event) {
    messageHandler === null || messageHandler === void 0 ? void 0 : messageHandler.removeError("save");
    let name = event.target.value;
    controller.name.set(name);
    controller.checkIsValid(false);
  }
  function onCalcNameInput(event) {
    messageHandler === null || messageHandler === void 0 ? void 0 : messageHandler.removeError("save");
    let nameCalc = event.target.value;
    controller.nameCalc.set(nameCalc);
    controller.checkIsValid(false);
  }
  function onCalcInput(event) {
    let calc = event.target.value;
    controller.calc.set(calc);
    messageHandler === null || messageHandler === void 0 ? void 0 : messageHandler.removeError("save");
    controller.recalculateCalcAndOrigins();
    controller.checkIsValid(false);
  }
  function onDeleteClicked(e) {
    messageHandler === null || messageHandler === void 0 ? void 0 : messageHandler.removeError("save");
    controller.onKeyDelete(e);
    controller.checkIsValid(false);
  }
  function onKeyExchange(e) {
    messageHandler === null || messageHandler === void 0 ? void 0 : messageHandler.removeError("save");
    controller.onKeyExchange(e);
    controller.checkIsValid(false);
  }
  function onSave() {
    messageHandler === null || messageHandler === void 0 ? void 0 : messageHandler.removeError("save");
    controller.saveCollection();
    dispatch2("save");
  }
  function onGenPreviewToogle() {
    controller.generateNamePreview();
  }
  onMount(() => {
    controller.setControllerDeps(system);
    controller.recalculateCalcAndOrigins();
    controller.checkIsValid();
    $$subscribe_controllerMappedOrigin($$invalidate(6, controllerMappedOrigin = controller.mappedOrigins));
    $$subscribe_controllerResultValue($$invalidate(7, controllerResultValue = controller.resultValue));
    $$subscribe_controllerResultSucces($$invalidate(8, controllerResultSucces = controller.resultSuccess));
    $$subscribe_controllerNameResultSucces($$invalidate(9, controllerNameResultSucces = controller.resultNameSuccess));
    $$subscribe_controllerNameResultValue($$invalidate(10, controllerNameResultValue = controller.resultNameValue));
    $$subscribe_controllerName($$invalidate(11, controllerName = controller.name));
    $$subscribe_controllerCalc($$invalidate(12, controllerCalc = controller.calc));
    $$subscribe_controllerIsValid($$invalidate(13, controllerIsValid = controller.isValid));
    $$subscribe_generativeNameListData($$invalidate(14, generativeNameListData = controller.generativeNameListData));
  });
  function keypress_handler(event) {
    bubble.call(this, $$self, event);
  }
  const click_handler = () => dispatch2("close");
  const input_handler = (e) => {
    onNameInput(e);
  };
  function textarea0_input_handler() {
    $controllerName = this.value;
    controllerName.set($controllerName);
  }
  function originrow_rowData_binding(value2, origin2, each_value_1, origin_index) {
    each_value_1[origin_index] = value2;
    controllerMappedOrigin.set($controllerMappedOrigin);
  }
  const foundTargetNode_handler = (e) => {
    controller.checkIsValid(false);
  };
  $$self.$$set = ($$props2) => {
    if ("system" in $$props2)
      $$invalidate(0, system = $$props2.system);
    if ("secondSlideInReady" in $$props2)
      $$invalidate(1, secondSlideInReady = $$props2.secondSlideInReady);
    if ("goodTitle" in $$props2)
      $$invalidate(2, goodTitle = $$props2.goodTitle);
    if ("badTitle" in $$props2)
      $$invalidate(3, badTitle = $$props2.badTitle);
    if ("context" in $$props2)
      $$invalidate(4, context = $$props2.context);
    if ("messageHandler" in $$props2)
      $$invalidate(33, messageHandler = $$props2.messageHandler);
  };
  $$self.$$.update = () => {
    if ($$self.$$.dirty[1] & 4) {
      $$invalidate(5, controller.messageHandler = messageHandler, controller);
    }
    if ($$self.$$.dirty[0] & 33) {
      controller.setControllerDeps(system);
    }
    if ($$self.$$.dirty[0] & 32) {
      $$invalidate(15, availableSymbols = get_store_value(controller.mappedOrigins).filter((p) => !p.active).map((p) => p.key));
    }
  };
  return [
    system,
    secondSlideInReady,
    goodTitle,
    badTitle,
    context,
    controller,
    controllerMappedOrigin,
    controllerResultValue,
    controllerResultSucces,
    controllerNameResultSucces,
    controllerNameResultValue,
    controllerName,
    controllerCalc,
    controllerIsValid,
    generativeNameListData,
    availableSymbols,
    $controllerIsValid,
    $controllerName,
    $controllerNameResultSucces,
    $controllerNameResultValue,
    $controllerResultSucces,
    $controllerCalc,
    $controllerResultValue,
    $controllerMappedOrigin,
    $generativeNameListData,
    dispatch2,
    onNameInput,
    onCalcNameInput,
    onCalcInput,
    onDeleteClicked,
    onKeyExchange,
    onSave,
    onGenPreviewToogle,
    messageHandler,
    keypress_handler,
    click_handler,
    input_handler,
    textarea0_input_handler,
    originrow_rowData_binding,
    foundTargetNode_handler
  ];
}
class DerivedCollectionDesigner extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance$b,
      create_fragment$b,
      safe_not_equal,
      {
        system: 0,
        secondSlideInReady: 1,
        goodTitle: 2,
        badTitle: 3,
        context: 4,
        messageHandler: 33
      },
      null,
      [-1, -1]
    );
  }
}
function create_fragment$a(ctx) {
  let svg;
  let circle;
  let line;
  return {
    c() {
      svg = svg_element("svg");
      circle = svg_element("circle");
      line = svg_element("line");
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
      line = claim_svg_element(svg_nodes, "line", { x1: true, y1: true, x2: true, y2: true });
      var line_nodes = children(line);
      line_nodes.forEach(detach);
      svg_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(circle, "cx", "12");
      attr(circle, "cy", "12");
      attr(circle, "r", "10");
      attr(line, "x1", "8");
      attr(line, "y1", "12");
      attr(line, "x2", "16");
      attr(line, "y2", "12");
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
      append_hydration(svg, line);
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
function instance$a($$self, $$props, $$invalidate) {
  let { color = "black" } = $$props;
  $$self.$$set = ($$props2) => {
    if ("color" in $$props2)
      $$invalidate(0, color = $$props2.color);
  };
  return [color];
}
class Minus extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$a, create_fragment$a, safe_not_equal, { color: 0 });
  }
}
function create_fragment$9(ctx) {
  let svg;
  let path0;
  let path1;
  return {
    c() {
      svg = svg_element("svg");
      path0 = svg_element("path");
      path1 = svg_element("path");
      this.h();
    },
    l(nodes) {
      svg = claim_svg_element(nodes, "svg", {
        xmlns: true,
        height: true,
        width: true,
        viewBox: true,
        fill: true,
        stroke: true,
        "stroke-width": true,
        "stroke-linecap": true,
        "stroke-linejoin": true,
        class: true
      });
      var svg_nodes = children(svg);
      path0 = claim_svg_element(svg_nodes, "path", { d: true });
      children(path0).forEach(detach);
      path1 = claim_svg_element(svg_nodes, "path", { d: true });
      children(path1).forEach(detach);
      svg_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(path0, "d", "M12 20h9");
      attr(path1, "d", "M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z");
      attr(svg, "xmlns", "http://www.w3.org/2000/svg");
      attr(svg, "height", "100%");
      attr(svg, "width", "100%");
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
      append_hydration(svg, path0);
      append_hydration(svg, path1);
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
function instance$9($$self, $$props, $$invalidate) {
  let { color = "black" } = $$props;
  $$self.$$set = ($$props2) => {
    if ("color" in $$props2)
      $$invalidate(0, color = $$props2.color);
  };
  return [color];
}
class Edit extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$9, create_fragment$9, safe_not_equal, { color: 0 });
  }
}
function create_fragment$8(ctx) {
  let svg;
  let path;
  let polyline;
  let line;
  return {
    c() {
      svg = svg_element("svg");
      path = svg_element("path");
      polyline = svg_element("polyline");
      line = svg_element("line");
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
      path = claim_svg_element(svg_nodes, "path", { d: true });
      children(path).forEach(detach);
      polyline = claim_svg_element(svg_nodes, "polyline", { points: true });
      children(polyline).forEach(detach);
      line = claim_svg_element(svg_nodes, "line", { x1: true, y1: true, x2: true, y2: true });
      children(line).forEach(detach);
      svg_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(path, "d", "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4");
      attr(polyline, "points", "7 10 12 15 17 10");
      attr(line, "x1", "12");
      attr(line, "y1", "15");
      attr(line, "x2", "12");
      attr(line, "y2", "3");
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
      append_hydration(svg, path);
      append_hydration(svg, polyline);
      append_hydration(svg, line);
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
function instance$8($$self, $$props, $$invalidate) {
  let { color = "black" } = $$props;
  $$self.$$set = ($$props2) => {
    if ("color" in $$props2)
      $$invalidate(0, color = $$props2.color);
  };
  return [color];
}
class Download extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$8, create_fragment$8, safe_not_equal, { color: 0 });
  }
}
const toolTip = "";
function create_if_block$6(ctx) {
  let div;
  let t;
  let div_transition;
  let current;
  return {
    c() {
      div = element("div");
      t = text(ctx[0]);
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true, "data-type": true });
      var div_nodes = children(div);
      t = claim_text(div_nodes, ctx[0]);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div, "class", "tooltipInnerBox");
      attr(div, "data-type", ctx[3]);
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      append_hydration(div, t);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (!current || dirty & 1)
        set_data(t, ctx[0]);
      if (!current || dirty & 8) {
        attr(div, "data-type", ctx[3]);
      }
    },
    i(local) {
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
    o(local) {
      if (!div_transition)
        div_transition = create_bidirectional_transition(div, fly, { x: ctx[1], y: ctx[2] }, false);
      div_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      if (detaching && div_transition)
        div_transition.end();
    }
  };
}
function create_fragment$7(ctx) {
  let div;
  let current;
  let if_block = ctx[4] && create_if_block$6(ctx);
  return {
    c() {
      div = element("div");
      if (if_block)
        if_block.c();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", {});
      var div_nodes = children(div);
      if (if_block)
        if_block.l(div_nodes);
      div_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      if (if_block)
        if_block.m(div, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (ctx2[4]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & 16) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$6(ctx2);
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
function instance$7($$self, $$props, $$invalidate) {
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
  return [text2, animX, animY, type, mounted];
}
class ToolTip extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$7, create_fragment$7, safe_not_equal, { text: 0, animX: 1, animY: 2, type: 3 });
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
      text3 = newText;
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
function create_else_block_1(ctx) {
  let div;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", {
        tabindex: true,
        role: true,
        contenteditable: true,
        autofocus: true
      });
      var div_nodes = children(div);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div, "tabindex", "1");
      attr(div, "role", "cell");
      attr(div, "contenteditable", "true");
      attr(div, "autofocus", true);
      if (ctx[0].nameEdit === void 0)
        add_render_callback(() => ctx[14].call(div));
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      if (ctx[0].nameEdit !== void 0) {
        div.textContent = ctx[0].nameEdit;
      }
      div.focus();
      if (!mounted) {
        dispose = [
          listen(div, "focus", function() {
            if (is_function(ctx[8]))
              ctx[8].apply(this, arguments);
          }),
          listen(div, "input", ctx[14])
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty & 1 && ctx[0].nameEdit !== div.textContent) {
        div.textContent = ctx[0].nameEdit;
      }
    },
    d(detaching) {
      if (detaching)
        detach(div);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block_2$5(ctx) {
  let div;
  let t_value = ctx[0].name + "";
  let t;
  let mounted;
  let dispose;
  return {
    c() {
      div = element("div");
      t = text(t_value);
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", {
        tabindex: true,
        contenteditable: true,
        role: true
      });
      var div_nodes = children(div);
      t = claim_text(div_nodes, t_value);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div, "tabindex", "-1");
      attr(div, "contenteditable", "false");
      attr(div, "role", "none");
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      append_hydration(div, t);
      if (!mounted) {
        dispose = [
          listen(div, "click", ctx[13]),
          listen(div, "keyup", ctx[12])
        ];
        mounted = true;
      }
    },
    p(ctx2, dirty) {
      if (dirty & 1 && t_value !== (t_value = ctx2[0].name + ""))
        set_data_maybe_contenteditable(t, t_value, "false");
    },
    d(detaching) {
      if (detaching)
        detach(div);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_else_block$2(ctx) {
  let imageContainer;
  return {
    c() {
      imageContainer = element("imageContainer");
    },
    l(nodes) {
      imageContainer = claim_element(nodes, "IMAGECONTAINER", {});
      var imageContainer_nodes = children(imageContainer);
      imageContainer_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, imageContainer, anchor);
    },
    p: noop,
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(imageContainer);
    }
  };
}
function create_if_block_1$5(ctx) {
  let imageContainer;
  let image_minus;
  let imageContainer_transition;
  let current;
  let mounted;
  let dispose;
  image_minus = new Minus({ props: { color: "white" } });
  return {
    c() {
      imageContainer = element("imageContainer");
      create_component(image_minus.$$.fragment);
      this.h();
    },
    l(nodes) {
      imageContainer = claim_element(nodes, "IMAGECONTAINER", { role: true });
      var imageContainer_nodes = children(imageContainer);
      claim_component(image_minus.$$.fragment, imageContainer_nodes);
      imageContainer_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(imageContainer, "role", "none");
    },
    m(target, anchor) {
      insert_hydration(target, imageContainer, anchor);
      mount_component(image_minus, imageContainer, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen(imageContainer, "click", ctx[16]),
          listen(imageContainer, "keyup", ctx[11]),
          action_destroyer(tooltip.call(null, imageContainer, { text: "Delete item", type: "verbose" }))
        ];
        mounted = true;
      }
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(image_minus.$$.fragment, local);
      if (local) {
        add_render_callback(() => {
          if (!current)
            return;
          if (!imageContainer_transition)
            imageContainer_transition = create_bidirectional_transition(imageContainer, slide, {}, true);
          imageContainer_transition.run(1);
        });
      }
      current = true;
    },
    o(local) {
      transition_out(image_minus.$$.fragment, local);
      if (local) {
        if (!imageContainer_transition)
          imageContainer_transition = create_bidirectional_transition(imageContainer, slide, {}, false);
        imageContainer_transition.run(0);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(imageContainer);
      destroy_component(image_minus);
      if (detaching && imageContainer_transition)
        imageContainer_transition.end();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block$5(ctx) {
  let imageContainer;
  let image_trash;
  let imageContainer_transition;
  let current;
  let mounted;
  let dispose;
  image_trash = new Trash({ props: { color: "white" } });
  return {
    c() {
      imageContainer = element("imageContainer");
      create_component(image_trash.$$.fragment);
      this.h();
    },
    l(nodes) {
      imageContainer = claim_element(nodes, "IMAGECONTAINER", { role: true });
      var imageContainer_nodes = children(imageContainer);
      claim_component(image_trash.$$.fragment, imageContainer_nodes);
      imageContainer_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(imageContainer, "role", "none");
    },
    m(target, anchor) {
      insert_hydration(target, imageContainer, anchor);
      mount_component(image_trash, imageContainer, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen(imageContainer, "click", ctx[15]),
          listen(imageContainer, "keyup", ctx[10]),
          action_destroyer(tooltip.call(null, imageContainer, { text: "Delete item", type: "verbose" }))
        ];
        mounted = true;
      }
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(image_trash.$$.fragment, local);
      if (local) {
        add_render_callback(() => {
          if (!current)
            return;
          if (!imageContainer_transition)
            imageContainer_transition = create_bidirectional_transition(imageContainer, slide, {}, true);
          imageContainer_transition.run(1);
        });
      }
      current = true;
    },
    o(local) {
      transition_out(image_trash.$$.fragment, local);
      if (local) {
        if (!imageContainer_transition)
          imageContainer_transition = create_bidirectional_transition(imageContainer, slide, {}, false);
        imageContainer_transition.run(0);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(imageContainer);
      destroy_component(image_trash);
      if (detaching && imageContainer_transition)
        imageContainer_transition.end();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_key_block$1(ctx) {
  let div1;
  let t;
  let div0;
  let current_block_type_index;
  let if_block1;
  let div1_data_selected_value;
  let div1_data_isedit_value;
  let current;
  function select_block_type(ctx2, dirty) {
    if (!ctx2[1])
      return create_if_block_2$5;
    return create_else_block_1;
  }
  let current_block_type = select_block_type(ctx);
  let if_block0 = current_block_type(ctx);
  const if_block_creators = [create_if_block$5, create_if_block_1$5, create_else_block$2];
  const if_blocks = [];
  function select_block_type_1(ctx2, dirty) {
    if (ctx2[3])
      return 0;
    if (ctx2[1] && ctx2[0].name != ctx2[0].nameEdit)
      return 1;
    return 2;
  }
  current_block_type_index = select_block_type_1(ctx);
  if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      div1 = element("div");
      if_block0.c();
      t = space();
      div0 = element("div");
      if_block1.c();
      this.h();
    },
    l(nodes) {
      div1 = claim_element(nodes, "DIV", {
        class: true,
        "data-selected": true,
        "data-can-hover": true,
        "data-isedit": true
      });
      var div1_nodes = children(div1);
      if_block0.l(div1_nodes);
      t = claim_space(div1_nodes);
      div0 = claim_element(div1_nodes, "DIV", {});
      var div0_nodes = children(div0);
      if_block1.l(div0_nodes);
      div0_nodes.forEach(detach);
      div1_nodes.forEach(detach);
      this.h();
    },
    h() {
      var _a;
      attr(div1, "class", "Editable_row");
      attr(div1, "data-selected", div1_data_selected_value = !ctx[1] && ctx[0].key == ((_a = ctx[2]) == null ? void 0 : _a.key));
      attr(div1, "data-can-hover", true);
      attr(div1, "data-isedit", div1_data_isedit_value = ctx[1] && ctx[0].name != ctx[0].nameEdit);
    },
    m(target, anchor) {
      insert_hydration(target, div1, anchor);
      if_block0.m(div1, null);
      append_hydration(div1, t);
      append_hydration(div1, div0);
      if_blocks[current_block_type_index].m(div0, null);
      current = true;
    },
    p(ctx2, dirty) {
      var _a;
      if (current_block_type === (current_block_type = select_block_type(ctx2)) && if_block0) {
        if_block0.p(ctx2, dirty);
      } else {
        if_block0.d(1);
        if_block0 = current_block_type(ctx2);
        if (if_block0) {
          if_block0.c();
          if_block0.m(div1, t);
        }
      }
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type_1(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block1 = if_blocks[current_block_type_index];
        if (!if_block1) {
          if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block1.c();
        } else {
          if_block1.p(ctx2, dirty);
        }
        transition_in(if_block1, 1);
        if_block1.m(div0, null);
      }
      if (!current || dirty & 7 && div1_data_selected_value !== (div1_data_selected_value = !ctx2[1] && ctx2[0].key == ((_a = ctx2[2]) == null ? void 0 : _a.key))) {
        attr(div1, "data-selected", div1_data_selected_value);
      }
      if (!current || dirty & 3 && div1_data_isedit_value !== (div1_data_isedit_value = ctx2[1] && ctx2[0].name != ctx2[0].nameEdit)) {
        attr(div1, "data-isedit", div1_data_isedit_value);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block1);
      current = true;
    },
    o(local) {
      transition_out(if_block1);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div1);
      if_block0.d();
      if_blocks[current_block_type_index].d();
    }
  };
}
function create_fragment$6(ctx) {
  let previous_key = ctx[9];
  let key_block_anchor;
  let current;
  let key_block = create_key_block$1(ctx);
  return {
    c() {
      key_block.c();
      key_block_anchor = empty();
    },
    l(nodes) {
      key_block.l(nodes);
      key_block_anchor = empty();
    },
    m(target, anchor) {
      key_block.m(target, anchor);
      insert_hydration(target, key_block_anchor, anchor);
      current = true;
    },
    p(ctx2, [dirty]) {
      if (dirty & 512 && safe_not_equal(previous_key, previous_key = ctx2[9])) {
        group_outros();
        transition_out(key_block, 1, 1, noop);
        check_outros();
        key_block = create_key_block$1(ctx2);
        key_block.c();
        transition_in(key_block, 1);
        key_block.m(key_block_anchor.parentNode, key_block_anchor);
      } else {
        key_block.p(ctx2, dirty);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(key_block);
      current = true;
    },
    o(local) {
      transition_out(key_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(key_block_anchor);
      key_block.d(detaching);
    }
  };
}
function instance$6($$self, $$props, $$invalidate) {
  let { editIsActive } = $$props;
  let { element: element2 } = $$props;
  let { selected } = $$props;
  let { deleteIsAllowed } = $$props;
  let { disabled } = $$props;
  let { onDelete } = $$props;
  let { onSelect } = $$props;
  let { onEditCancelSingle: onEditCancelSingle2 } = $$props;
  let { onEditFocus: onEditFocus2 } = $$props;
  let k = 0;
  let key = "editAbleRow" + StringFunctions.uuidv4();
  onMount(() => {
    element2.addEventListener(key, "update", update2);
  });
  onDestroy(() => {
    element2.removeEventListener(key);
  });
  function update2() {
    $$invalidate(9, k++, k);
  }
  function keyup_handler_1(event) {
    bubble.call(this, $$self, event);
  }
  function keyup_handler_2(event) {
    bubble.call(this, $$self, event);
  }
  function keyup_handler(event) {
    bubble.call(this, $$self, event);
  }
  const click_handler = () => {
    if (disabled) {
      return;
    }
    onSelect(element2);
  };
  function div_input_handler() {
    element2.nameEdit = this.textContent;
    $$invalidate(0, element2);
  }
  const click_handler_1 = () => onDelete(element2);
  const click_handler_2 = () => onEditCancelSingle2(element2);
  $$self.$$set = ($$props2) => {
    if ("editIsActive" in $$props2)
      $$invalidate(1, editIsActive = $$props2.editIsActive);
    if ("element" in $$props2)
      $$invalidate(0, element2 = $$props2.element);
    if ("selected" in $$props2)
      $$invalidate(2, selected = $$props2.selected);
    if ("deleteIsAllowed" in $$props2)
      $$invalidate(3, deleteIsAllowed = $$props2.deleteIsAllowed);
    if ("disabled" in $$props2)
      $$invalidate(4, disabled = $$props2.disabled);
    if ("onDelete" in $$props2)
      $$invalidate(5, onDelete = $$props2.onDelete);
    if ("onSelect" in $$props2)
      $$invalidate(6, onSelect = $$props2.onSelect);
    if ("onEditCancelSingle" in $$props2)
      $$invalidate(7, onEditCancelSingle2 = $$props2.onEditCancelSingle);
    if ("onEditFocus" in $$props2)
      $$invalidate(8, onEditFocus2 = $$props2.onEditFocus);
  };
  return [
    element2,
    editIsActive,
    selected,
    deleteIsAllowed,
    disabled,
    onDelete,
    onSelect,
    onEditCancelSingle2,
    onEditFocus2,
    k,
    keyup_handler_1,
    keyup_handler_2,
    keyup_handler,
    click_handler,
    div_input_handler,
    click_handler_1,
    click_handler_2
  ];
}
class EditAbleListRow extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$6, create_fragment$6, safe_not_equal, {
      editIsActive: 1,
      element: 0,
      selected: 2,
      deleteIsAllowed: 3,
      disabled: 4,
      onDelete: 5,
      onSelect: 6,
      onEditCancelSingle: 7,
      onEditFocus: 8
    });
  }
}
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[23] = list[i];
  child_ctx[25] = list;
  child_ctx[26] = i;
  const constants_0 = !child_ctx[6] && child_ctx[5] != null && !child_ctx[8];
  child_ctx[24] = constants_0;
  return child_ctx;
}
function create_if_block$4(ctx) {
  let div;
  let t0;
  let t1;
  let current;
  let if_block0 = ctx[4] != null && create_if_block_3$2(ctx);
  let if_block1 = ctx[2] != null && create_if_block_2$4(ctx);
  let if_block2 = ctx[3] != null && create_if_block_1$4(ctx);
  return {
    c() {
      div = element("div");
      if (if_block0)
        if_block0.c();
      t0 = space();
      if (if_block1)
        if_block1.c();
      t1 = space();
      if (if_block2)
        if_block2.c();
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true, "data-can-hover": true });
      var div_nodes = children(div);
      if (if_block0)
        if_block0.l(div_nodes);
      t0 = claim_space(div_nodes);
      if (if_block1)
        if_block1.l(div_nodes);
      t1 = claim_space(div_nodes);
      if (if_block2)
        if_block2.l(div_nodes);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div, "class", "Editable_rowHeader");
      attr(div, "data-can-hover", true);
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      if (if_block0)
        if_block0.m(div, null);
      append_hydration(div, t0);
      if (if_block1)
        if_block1.m(div, null);
      append_hydration(div, t1);
      if (if_block2)
        if_block2.m(div, null);
      current = true;
    },
    p(ctx2, dirty) {
      if (ctx2[4] != null) {
        if (if_block0) {
          if_block0.p(ctx2, dirty);
          if (dirty & 16) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_3$2(ctx2);
          if_block0.c();
          transition_in(if_block0, 1);
          if_block0.m(div, t0);
        }
      } else if (if_block0) {
        group_outros();
        transition_out(if_block0, 1, 1, () => {
          if_block0 = null;
        });
        check_outros();
      }
      if (ctx2[2] != null) {
        if (if_block1) {
          if_block1.p(ctx2, dirty);
          if (dirty & 4) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_2$4(ctx2);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div, t1);
        }
      } else if (if_block1) {
        group_outros();
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
        });
        check_outros();
      }
      if (ctx2[3] != null) {
        if (if_block2) {
          if_block2.p(ctx2, dirty);
          if (dirty & 8) {
            transition_in(if_block2, 1);
          }
        } else {
          if_block2 = create_if_block_1$4(ctx2);
          if_block2.c();
          transition_in(if_block2, 1);
          if_block2.m(div, null);
        }
      } else if (if_block2) {
        group_outros();
        transition_out(if_block2, 1, 1, () => {
          if_block2 = null;
        });
        check_outros();
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block0);
      transition_in(if_block1);
      transition_in(if_block2);
      current = true;
    },
    o(local) {
      transition_out(if_block0);
      transition_out(if_block1);
      transition_out(if_block2);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
      if (if_block2)
        if_block2.d();
    }
  };
}
function create_if_block_3$2(ctx) {
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block_4$1, create_else_block$1];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (!ctx2[8])
      return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      if_block.c();
      if_block_anchor = empty();
    },
    l(nodes) {
      if_block.l(nodes);
      if_block_anchor = empty();
    },
    m(target, anchor) {
      if_blocks[current_block_type_index].m(target, anchor);
      insert_hydration(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block.c();
        } else {
          if_block.p(ctx2, dirty);
        }
        transition_in(if_block, 1);
        if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
      if_blocks[current_block_type_index].d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function create_else_block$1(ctx) {
  let imageContainer0;
  let image_edit;
  let imageContainer0_transition;
  let t0;
  let imageContainer1;
  let image_save;
  let imageContainer1_transition;
  let t1;
  let imageContainer2;
  let image_minus;
  let imageContainer2_transition;
  let current;
  let mounted;
  let dispose;
  image_edit = new Edit({ props: { color: "white" } });
  image_save = new Download({ props: { color: "white" } });
  image_minus = new Minus({ props: { color: "white" } });
  return {
    c() {
      imageContainer0 = element("imageContainer");
      create_component(image_edit.$$.fragment);
      t0 = space();
      imageContainer1 = element("imageContainer");
      create_component(image_save.$$.fragment);
      t1 = space();
      imageContainer2 = element("imageContainer");
      create_component(image_minus.$$.fragment);
      this.h();
    },
    l(nodes) {
      imageContainer0 = claim_element(nodes, "IMAGECONTAINER", { role: true });
      var imageContainer0_nodes = children(imageContainer0);
      claim_component(image_edit.$$.fragment, imageContainer0_nodes);
      imageContainer0_nodes.forEach(detach);
      t0 = claim_space(nodes);
      imageContainer1 = claim_element(nodes, "IMAGECONTAINER", { role: true });
      var imageContainer1_nodes = children(imageContainer1);
      claim_component(image_save.$$.fragment, imageContainer1_nodes);
      imageContainer1_nodes.forEach(detach);
      t1 = claim_space(nodes);
      imageContainer2 = claim_element(nodes, "IMAGECONTAINER", { role: true });
      var imageContainer2_nodes = children(imageContainer2);
      claim_component(image_minus.$$.fragment, imageContainer2_nodes);
      imageContainer2_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(imageContainer0, "role", "none");
      attr(imageContainer1, "role", "none");
      attr(imageContainer2, "role", "none");
    },
    m(target, anchor) {
      insert_hydration(target, imageContainer0, anchor);
      mount_component(image_edit, imageContainer0, null);
      insert_hydration(target, t0, anchor);
      insert_hydration(target, imageContainer1, anchor);
      mount_component(image_save, imageContainer1, null);
      insert_hydration(target, t1, anchor);
      insert_hydration(target, imageContainer2, anchor);
      mount_component(image_minus, imageContainer2, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen(imageContainer0, "click", ctx[11]),
          listen(imageContainer0, "keyup", ctx[11]),
          action_destroyer(tooltip.call(null, imageContainer0, {
            text: "Turn off Edit mode",
            type: "verbose"
          })),
          listen(imageContainer1, "click", ctx[12]),
          listen(imageContainer1, "keyup", ctx[12]),
          action_destroyer(tooltip.call(null, imageContainer1, {
            text: "Save changes made",
            type: "verbose"
          })),
          listen(imageContainer2, "click", ctx[11]),
          listen(imageContainer2, "keyup", ctx[11]),
          action_destroyer(tooltip.call(null, imageContainer2, { text: "Discard Changes", type: "verbose" }))
        ];
        mounted = true;
      }
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(image_edit.$$.fragment, local);
      if (local) {
        add_render_callback(() => {
          if (!current)
            return;
          if (!imageContainer0_transition)
            imageContainer0_transition = create_bidirectional_transition(imageContainer0, slide, {}, true);
          imageContainer0_transition.run(1);
        });
      }
      transition_in(image_save.$$.fragment, local);
      if (local) {
        add_render_callback(() => {
          if (!current)
            return;
          if (!imageContainer1_transition)
            imageContainer1_transition = create_bidirectional_transition(imageContainer1, slide, {}, true);
          imageContainer1_transition.run(1);
        });
      }
      transition_in(image_minus.$$.fragment, local);
      if (local) {
        add_render_callback(() => {
          if (!current)
            return;
          if (!imageContainer2_transition)
            imageContainer2_transition = create_bidirectional_transition(imageContainer2, slide, {}, true);
          imageContainer2_transition.run(1);
        });
      }
      current = true;
    },
    o(local) {
      transition_out(image_edit.$$.fragment, local);
      if (local) {
        if (!imageContainer0_transition)
          imageContainer0_transition = create_bidirectional_transition(imageContainer0, slide, {}, false);
        imageContainer0_transition.run(0);
      }
      transition_out(image_save.$$.fragment, local);
      if (local) {
        if (!imageContainer1_transition)
          imageContainer1_transition = create_bidirectional_transition(imageContainer1, slide, {}, false);
        imageContainer1_transition.run(0);
      }
      transition_out(image_minus.$$.fragment, local);
      if (local) {
        if (!imageContainer2_transition)
          imageContainer2_transition = create_bidirectional_transition(imageContainer2, slide, {}, false);
        imageContainer2_transition.run(0);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(imageContainer0);
      destroy_component(image_edit);
      if (detaching && imageContainer0_transition)
        imageContainer0_transition.end();
      if (detaching)
        detach(t0);
      if (detaching)
        detach(imageContainer1);
      destroy_component(image_save);
      if (detaching && imageContainer1_transition)
        imageContainer1_transition.end();
      if (detaching)
        detach(t1);
      if (detaching)
        detach(imageContainer2);
      destroy_component(image_minus);
      if (detaching && imageContainer2_transition)
        imageContainer2_transition.end();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block_4$1(ctx) {
  let imageContainer;
  let image_edit;
  let imageContainer_transition;
  let current;
  let mounted;
  let dispose;
  image_edit = new Edit({ props: { color: "white" } });
  return {
    c() {
      imageContainer = element("imageContainer");
      create_component(image_edit.$$.fragment);
      this.h();
    },
    l(nodes) {
      imageContainer = claim_element(nodes, "IMAGECONTAINER", { role: true });
      var imageContainer_nodes = children(imageContainer);
      claim_component(image_edit.$$.fragment, imageContainer_nodes);
      imageContainer_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(imageContainer, "role", "none");
    },
    m(target, anchor) {
      insert_hydration(target, imageContainer, anchor);
      mount_component(image_edit, imageContainer, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen(imageContainer, "click", ctx[11]),
          listen(imageContainer, "keyup", ctx[11]),
          action_destroyer(tooltip.call(null, imageContainer, {
            text: "Turn on Edit mode",
            type: "verbose"
          }))
        ];
        mounted = true;
      }
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(image_edit.$$.fragment, local);
      if (local) {
        add_render_callback(() => {
          if (!current)
            return;
          if (!imageContainer_transition)
            imageContainer_transition = create_bidirectional_transition(imageContainer, slide, {}, true);
          imageContainer_transition.run(1);
        });
      }
      current = true;
    },
    o(local) {
      transition_out(image_edit.$$.fragment, local);
      if (local) {
        if (!imageContainer_transition)
          imageContainer_transition = create_bidirectional_transition(imageContainer, slide, {}, false);
        imageContainer_transition.run(0);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(imageContainer);
      destroy_component(image_edit);
      if (detaching && imageContainer_transition)
        imageContainer_transition.end();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block_2$4(ctx) {
  let imageContainer;
  let image_plus;
  let imageContainer_transition;
  let current;
  let mounted;
  let dispose;
  image_plus = new Plus({ props: { color: "white" } });
  return {
    c() {
      imageContainer = element("imageContainer");
      create_component(image_plus.$$.fragment);
      this.h();
    },
    l(nodes) {
      imageContainer = claim_element(nodes, "IMAGECONTAINER", { role: true });
      var imageContainer_nodes = children(imageContainer);
      claim_component(image_plus.$$.fragment, imageContainer_nodes);
      imageContainer_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(imageContainer, "role", "none");
    },
    m(target, anchor) {
      insert_hydration(target, imageContainer, anchor);
      mount_component(image_plus, imageContainer, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen(imageContainer, "click", ctx[19]),
          listen(imageContainer, "keyup", ctx[18]),
          action_destroyer(tooltip.call(null, imageContainer, { text: "Add To List", type: "verbose" }))
        ];
        mounted = true;
      }
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(image_plus.$$.fragment, local);
      if (local) {
        add_render_callback(() => {
          if (!current)
            return;
          if (!imageContainer_transition)
            imageContainer_transition = create_bidirectional_transition(imageContainer, slide, {}, true);
          imageContainer_transition.run(1);
        });
      }
      current = true;
    },
    o(local) {
      transition_out(image_plus.$$.fragment, local);
      if (local) {
        if (!imageContainer_transition)
          imageContainer_transition = create_bidirectional_transition(imageContainer, slide, {}, false);
        imageContainer_transition.run(0);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(imageContainer);
      destroy_component(image_plus);
      if (detaching && imageContainer_transition)
        imageContainer_transition.end();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block_1$4(ctx) {
  let imageContainer;
  let image_plus;
  let imageContainer_transition;
  let current;
  let mounted;
  let dispose;
  image_plus = new Plus({ props: { color: "yellow" } });
  return {
    c() {
      imageContainer = element("imageContainer");
      create_component(image_plus.$$.fragment);
      this.h();
    },
    l(nodes) {
      imageContainer = claim_element(nodes, "IMAGECONTAINER", { role: true });
      var imageContainer_nodes = children(imageContainer);
      claim_component(image_plus.$$.fragment, imageContainer_nodes);
      imageContainer_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(imageContainer, "role", "none");
    },
    m(target, anchor) {
      insert_hydration(target, imageContainer, anchor);
      mount_component(image_plus, imageContainer, null);
      current = true;
      if (!mounted) {
        dispose = [
          listen(imageContainer, "click", ctx[20]),
          listen(imageContainer, "keyup", ctx[17]),
          action_destroyer(tooltip.call(null, imageContainer, {
            text: "Add Entire collection",
            type: "verbose"
          }))
        ];
        mounted = true;
      }
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(image_plus.$$.fragment, local);
      if (local) {
        add_render_callback(() => {
          if (!current)
            return;
          if (!imageContainer_transition)
            imageContainer_transition = create_bidirectional_transition(imageContainer, slide, {}, true);
          imageContainer_transition.run(1);
        });
      }
      current = true;
    },
    o(local) {
      transition_out(image_plus.$$.fragment, local);
      if (local) {
        if (!imageContainer_transition)
          imageContainer_transition = create_bidirectional_transition(imageContainer, slide, {}, false);
        imageContainer_transition.run(0);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(imageContainer);
      destroy_component(image_plus);
      if (detaching && imageContainer_transition)
        imageContainer_transition.end();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_each_block(key_1, ctx) {
  let div;
  let editablelistrow;
  let updating_element;
  let t;
  let div_transition;
  let rect;
  let stop_animation = noop;
  let current;
  function editablelistrow_element_binding(value2) {
    ctx[21](value2, ctx[23], ctx[25], ctx[26]);
  }
  let editablelistrow_props = {
    editIsActive: ctx[8],
    selected: ctx[7],
    disabled: ctx[6],
    deleteIsAllowed: ctx[24],
    onDelete: ctx[13],
    onSelect: ctx[9],
    onEditCancelSingle,
    onEditFocus
  };
  if (ctx[23] !== void 0) {
    editablelistrow_props.element = ctx[23];
  }
  editablelistrow = new EditAbleListRow({ props: editablelistrow_props });
  binding_callbacks.push(() => bind(editablelistrow, "element", editablelistrow_element_binding));
  return {
    key: key_1,
    first: null,
    c() {
      div = element("div");
      create_component(editablelistrow.$$.fragment);
      t = space();
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", {});
      var div_nodes = children(div);
      claim_component(editablelistrow.$$.fragment, div_nodes);
      t = claim_space(div_nodes);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      this.first = div;
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      mount_component(editablelistrow, div, null);
      append_hydration(div, t);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const editablelistrow_changes = {};
      if (dirty & 256)
        editablelistrow_changes.editIsActive = ctx[8];
      if (dirty & 128)
        editablelistrow_changes.selected = ctx[7];
      if (dirty & 64)
        editablelistrow_changes.disabled = ctx[6];
      if (dirty & 352)
        editablelistrow_changes.deleteIsAllowed = ctx[24];
      if (!updating_element && dirty & 1) {
        updating_element = true;
        editablelistrow_changes.element = ctx[23];
        add_flush_callback(() => updating_element = false);
      }
      editablelistrow.$set(editablelistrow_changes);
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
      transition_in(editablelistrow.$$.fragment, local);
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
      transition_out(editablelistrow.$$.fragment, local);
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
      destroy_component(editablelistrow);
      if (detaching && div_transition)
        div_transition.end();
    }
  };
}
function create_fragment$5(ctx) {
  let div;
  let t;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let div_class_value;
  let current;
  let if_block = !ctx[6] && create_if_block$4(ctx);
  let each_value = ctx[0];
  const get_key = (ctx2) => ctx2[23].key;
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
  }
  return {
    c() {
      div = element("div");
      if (if_block)
        if_block.c();
      t = space();
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { class: true });
      var div_nodes = children(div);
      if (if_block)
        if_block.l(div_nodes);
      t = claim_space(div_nodes);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].l(div_nodes);
      }
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div, "class", div_class_value = ctx[1] ? "GrobsInteractiveContainer editableTable" : "editableTable");
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      if (if_block)
        if_block.m(div, null);
      append_hydration(div, t);
      for (let i = 0; i < each_blocks.length; i += 1) {
        if (each_blocks[i]) {
          each_blocks[i].m(div, null);
        }
      }
      current = true;
    },
    p(ctx2, [dirty]) {
      if (!ctx2[6]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & 64) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$4(ctx2);
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
      if (dirty & 9185) {
        each_value = ctx2[0];
        group_outros();
        for (let i = 0; i < each_blocks.length; i += 1)
          each_blocks[i].r();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div, fix_and_outro_and_destroy_block, create_each_block, null, get_each_context);
        for (let i = 0; i < each_blocks.length; i += 1)
          each_blocks[i].a();
        check_outros();
      }
      if (!current || dirty & 2 && div_class_value !== (div_class_value = ctx2[1] ? "GrobsInteractiveContainer editableTable" : "editableTable")) {
        attr(div, "class", div_class_value);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block);
      for (let i = 0; i < each_value.length; i += 1) {
        transition_in(each_blocks[i]);
      }
      current = true;
    },
    o(local) {
      transition_out(if_block);
      for (let i = 0; i < each_blocks.length; i += 1) {
        transition_out(each_blocks[i]);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      if (if_block)
        if_block.d();
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].d();
      }
    }
  };
}
function onEditCancelSingle(item) {
  item.nameEdit = item.name;
}
function onEditFocus(row) {
  const element2 = row.target;
  const range = document.createRange();
  const selection = window.getSelection();
  if (!range || !selection) {
    return;
  }
  range.selectNodeContents(element2);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}
function instance$5($$self, $$props, $$invalidate) {
  let { isEditableContainer = true } = $$props;
  let { collection = [] } = $$props;
  let { onSelect } = $$props;
  let { onAdd = null } = $$props;
  let { onSpecialAdd = null } = $$props;
  let { onUpdateItem } = $$props;
  let { onDeleteItem } = $$props;
  let { disabled = false } = $$props;
  const dispatch2 = createEventDispatcher();
  let selected = null;
  let editIsActive = false;
  onMount(() => {
  });
  onDestroy(() => {
  });
  function deselect() {
    if (!selected)
      return;
    $$invalidate(7, selected = null);
    dispatch2("onDeSelect");
  }
  function select(key) {
    let item = collection.find((p) => p.key == key);
    if ((item === null || item === void 0 ? void 0 : item.key) == (selected === null || selected === void 0 ? void 0 : selected.key)) {
      deselect();
      return;
    } else if (item) {
      _onSelect(item);
    }
  }
  function _onSelect(item) {
    if (item.key == (selected === null || selected === void 0 ? void 0 : selected.key)) {
      deselect();
      return;
    }
    const isSelected = onSelect(item);
    if (isSelected) {
      $$invalidate(7, selected = item);
    } else {
      $$invalidate(7, selected = null);
    }
  }
  function _onAdd() {
    if (!onAdd)
      return;
    onAdd();
  }
  function onEditClicked() {
    collection.forEach((item) => {
      item.nameEdit = item.name;
    });
    $$invalidate(8, editIsActive = !editIsActive);
  }
  function onEditSaved() {
    if (!onUpdateItem) {
      return;
    }
    onUpdateItem(collection);
    $$invalidate(8, editIsActive = !editIsActive);
  }
  function onDelete(item) {
    if (!onDeleteItem) {
      return;
    }
    onDeleteItem(item);
  }
  function keyup_handler_1(event) {
    bubble.call(this, $$self, event);
  }
  function keyup_handler(event) {
    bubble.call(this, $$self, event);
  }
  const click_handler = () => {
    if (_onAdd) {
      _onAdd();
    }
  };
  const click_handler_1 = () => {
    if (onSpecialAdd) {
      onSpecialAdd();
    }
  };
  function editablelistrow_element_binding(value2, element2, each_value, i) {
    each_value[i] = value2;
    $$invalidate(0, collection);
  }
  $$self.$$set = ($$props2) => {
    if ("isEditableContainer" in $$props2)
      $$invalidate(1, isEditableContainer = $$props2.isEditableContainer);
    if ("collection" in $$props2)
      $$invalidate(0, collection = $$props2.collection);
    if ("onSelect" in $$props2)
      $$invalidate(14, onSelect = $$props2.onSelect);
    if ("onAdd" in $$props2)
      $$invalidate(2, onAdd = $$props2.onAdd);
    if ("onSpecialAdd" in $$props2)
      $$invalidate(3, onSpecialAdd = $$props2.onSpecialAdd);
    if ("onUpdateItem" in $$props2)
      $$invalidate(4, onUpdateItem = $$props2.onUpdateItem);
    if ("onDeleteItem" in $$props2)
      $$invalidate(5, onDeleteItem = $$props2.onDeleteItem);
    if ("disabled" in $$props2)
      $$invalidate(6, disabled = $$props2.disabled);
  };
  return [
    collection,
    isEditableContainer,
    onAdd,
    onSpecialAdd,
    onUpdateItem,
    onDeleteItem,
    disabled,
    selected,
    editIsActive,
    _onSelect,
    _onAdd,
    onEditClicked,
    onEditSaved,
    onDelete,
    onSelect,
    deselect,
    select,
    keyup_handler_1,
    keyup_handler,
    click_handler,
    click_handler_1,
    editablelistrow_element_binding
  ];
}
class EditAbleList2 extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$5, create_fragment$5, safe_not_equal, {
      isEditableContainer: 1,
      collection: 0,
      onSelect: 14,
      onAdd: 2,
      onSpecialAdd: 3,
      onUpdateItem: 4,
      onDeleteItem: 5,
      disabled: 6,
      deselect: 15,
      select: 16
    });
  }
  get deselect() {
    return this.$$.ctx[15];
  }
  get select() {
    return this.$$.ctx[16];
  }
}
function create_else_block(ctx) {
  let div;
  let tooglesection0;
  let t;
  let tooglesection1;
  let div_transition;
  let current;
  tooglesection0 = new ToogleSection({
    props: {
      title: "fixed",
      $$slots: { default: [create_default_slot_1] },
      $$scope: { ctx }
    }
  });
  tooglesection1 = new ToogleSection({
    props: {
      title: "derived",
      $$slots: { default: [create_default_slot] },
      $$scope: { ctx }
    }
  });
  return {
    c() {
      div = element("div");
      create_component(tooglesection0.$$.fragment);
      t = space();
      create_component(tooglesection1.$$.fragment);
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", {});
      var div_nodes = children(div);
      claim_component(tooglesection0.$$.fragment, div_nodes);
      t = claim_space(div_nodes);
      claim_component(tooglesection1.$$.fragment, div_nodes);
      div_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      mount_component(tooglesection0, div, null);
      append_hydration(div, t);
      mount_component(tooglesection1, div, null);
      current = true;
    },
    p(ctx2, dirty) {
      const tooglesection0_changes = {};
      if (dirty[0] & 342 | dirty[1] & 16384) {
        tooglesection0_changes.$$scope = { dirty, ctx: ctx2 };
      }
      tooglesection0.$set(tooglesection0_changes);
      const tooglesection1_changes = {};
      if (dirty[0] & 171 | dirty[1] & 16384) {
        tooglesection1_changes.$$scope = { dirty, ctx: ctx2 };
      }
      tooglesection1.$set(tooglesection1_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(tooglesection0.$$.fragment, local);
      transition_in(tooglesection1.$$.fragment, local);
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
      transition_out(tooglesection0.$$.fragment, local);
      transition_out(tooglesection1.$$.fragment, local);
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
      destroy_component(tooglesection0);
      destroy_component(tooglesection1);
      if (detaching && div_transition)
        div_transition.end();
    }
  };
}
function create_if_block$3(ctx) {
  let div;
  let derivedcollectiondesigner;
  let current;
  derivedcollectiondesigner = new DerivedCollectionDesigner({
    props: {
      context: ctx[0],
      system: ctx[9],
      secondSlideInReady: true,
      messageHandler: ctx[8]
    }
  });
  derivedcollectiondesigner.$on("close", ctx[18]);
  return {
    c() {
      div = element("div");
      create_component(derivedcollectiondesigner.$$.fragment);
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", {});
      var div_nodes = children(div);
      claim_component(derivedcollectiondesigner.$$.fragment, div_nodes);
      div_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      mount_component(derivedcollectiondesigner, div, null);
      current = true;
    },
    p(ctx2, dirty) {
      const derivedcollectiondesigner_changes = {};
      if (dirty[0] & 1)
        derivedcollectiondesigner_changes.context = ctx2[0];
      if (dirty[0] & 256)
        derivedcollectiondesigner_changes.messageHandler = ctx2[8];
      derivedcollectiondesigner.$set(derivedcollectiondesigner_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(derivedcollectiondesigner.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(derivedcollectiondesigner.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_component(derivedcollectiondesigner);
    }
  };
}
function create_if_block_2$3(ctx) {
  var _a;
  let previous_key = (_a = ctx[4]) == null ? void 0 : _a.key;
  let key_block_anchor;
  let current;
  let key_block = create_key_block_1(ctx);
  return {
    c() {
      key_block.c();
      key_block_anchor = empty();
    },
    l(nodes) {
      key_block.l(nodes);
      key_block_anchor = empty();
    },
    m(target, anchor) {
      key_block.m(target, anchor);
      insert_hydration(target, key_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      var _a2;
      if (dirty[0] & 16 && safe_not_equal(previous_key, previous_key = (_a2 = ctx2[4]) == null ? void 0 : _a2.key)) {
        group_outros();
        transition_out(key_block, 1, 1, noop);
        check_outros();
        key_block = create_key_block_1(ctx2);
        key_block.c();
        transition_in(key_block, 1);
        key_block.m(key_block_anchor.parentNode, key_block_anchor);
      } else {
        key_block.p(ctx2, dirty);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(key_block);
      current = true;
    },
    o(local) {
      transition_out(key_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(key_block_anchor);
      key_block.d(detaching);
    }
  };
}
function create_key_block_1(ctx) {
  let div;
  let fixeditemdesigner;
  let div_transition;
  let current;
  let fixeditemdesigner_props = {
    node: ctx[4],
    system: ctx[9],
    messageHandler: ctx[8]
  };
  fixeditemdesigner = new FixedItemDesigner({ props: fixeditemdesigner_props });
  ctx[29](fixeditemdesigner);
  fixeditemdesigner.$on("save", save_handler);
  return {
    c() {
      div = element("div");
      create_component(fixeditemdesigner.$$.fragment);
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", {});
      var div_nodes = children(div);
      claim_component(fixeditemdesigner.$$.fragment, div_nodes);
      div_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      mount_component(fixeditemdesigner, div, null);
      current = true;
    },
    p(ctx2, dirty) {
      const fixeditemdesigner_changes = {};
      if (dirty[0] & 16)
        fixeditemdesigner_changes.node = ctx2[4];
      if (dirty[0] & 256)
        fixeditemdesigner_changes.messageHandler = ctx2[8];
      fixeditemdesigner.$set(fixeditemdesigner_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(fixeditemdesigner.$$.fragment, local);
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
      transition_out(fixeditemdesigner.$$.fragment, local);
      if (!div_transition)
        div_transition = create_bidirectional_transition(div, slide, {}, false);
      div_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      ctx[29](null);
      destroy_component(fixeditemdesigner);
      if (detaching && div_transition)
        div_transition.end();
    }
  };
}
function create_default_slot_1(ctx) {
  var _a, _b, _c, _d;
  let div0;
  let h1;
  let t0;
  let t1;
  let p;
  let t2;
  let t3;
  let div1;
  let editablelist20;
  let t4;
  let editablelist21;
  let t5;
  let if_block_anchor;
  let current;
  editablelist20 = new EditAbleList2({
    props: {
      collection: (_b = (_a = ctx[11]) == null ? void 0 : _a.collections) != null ? _b : [],
      onSelect: ctx[19],
      onAdd: ctx[20],
      onUpdateItem: ctx[21],
      onDeleteItem: ctx[22]
    }
  });
  editablelist20.$on("onDeSelect", ctx[23]);
  editablelist21 = new EditAbleList2({
    props: {
      disabled: ctx[2] == null,
      collection: (_d = (_c = ctx[2]) == null ? void 0 : _c.nodes) != null ? _d : [],
      onSelect: ctx[24],
      onAdd: ctx[25],
      onUpdateItem: ctx[26],
      onDeleteItem: ctx[27]
    }
  });
  editablelist21.$on("onDeSelect", ctx[28]);
  let if_block = ctx[4] && create_if_block_2$3(ctx);
  return {
    c() {
      div0 = element("div");
      h1 = element("h1");
      t0 = text("Fixed Item Design");
      t1 = space();
      p = element("p");
      t2 = text("Fixed properties are the properties that are defiend on each article's meta data.");
      t3 = space();
      div1 = element("div");
      create_component(editablelist20.$$.fragment);
      t4 = space();
      create_component(editablelist21.$$.fragment);
      t5 = space();
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
      this.h();
    },
    l(nodes) {
      div0 = claim_element(nodes, "DIV", {});
      var div0_nodes = children(div0);
      h1 = claim_element(div0_nodes, "H1", {});
      var h1_nodes = children(h1);
      t0 = claim_text(h1_nodes, "Fixed Item Design");
      h1_nodes.forEach(detach);
      t1 = claim_space(div0_nodes);
      p = claim_element(div0_nodes, "P", {});
      var p_nodes = children(p);
      t2 = claim_text(p_nodes, "Fixed properties are the properties that are defiend on each article's meta data.");
      p_nodes.forEach(detach);
      div0_nodes.forEach(detach);
      t3 = claim_space(nodes);
      div1 = claim_element(nodes, "DIV", { style: true });
      var div1_nodes = children(div1);
      claim_component(editablelist20.$$.fragment, div1_nodes);
      t4 = claim_space(div1_nodes);
      claim_component(editablelist21.$$.fragment, div1_nodes);
      div1_nodes.forEach(detach);
      t5 = claim_space(nodes);
      if (if_block)
        if_block.l(nodes);
      if_block_anchor = empty();
      this.h();
    },
    h() {
      set_style(div1, "display", "grid");
      set_style(div1, "grid-template-columns", "1fr 1fr");
      set_style(div1, "gap", "10px");
      set_style(div1, "align-items", "start");
    },
    m(target, anchor) {
      insert_hydration(target, div0, anchor);
      append_hydration(div0, h1);
      append_hydration(h1, t0);
      append_hydration(div0, t1);
      append_hydration(div0, p);
      append_hydration(p, t2);
      insert_hydration(target, t3, anchor);
      insert_hydration(target, div1, anchor);
      mount_component(editablelist20, div1, null);
      append_hydration(div1, t4);
      mount_component(editablelist21, div1, null);
      insert_hydration(target, t5, anchor);
      if (if_block)
        if_block.m(target, anchor);
      insert_hydration(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      var _a2, _b2;
      const editablelist20_changes = {};
      if (dirty[0] & 2)
        editablelist20_changes.onDeleteItem = ctx2[22];
      editablelist20.$set(editablelist20_changes);
      const editablelist21_changes = {};
      if (dirty[0] & 4)
        editablelist21_changes.disabled = ctx2[2] == null;
      if (dirty[0] & 4)
        editablelist21_changes.collection = (_b2 = (_a2 = ctx2[2]) == null ? void 0 : _a2.nodes) != null ? _b2 : [];
      if (dirty[0] & 4)
        editablelist21_changes.onAdd = ctx2[25];
      if (dirty[0] & 20)
        editablelist21_changes.onDeleteItem = ctx2[27];
      editablelist21.$set(editablelist21_changes);
      if (ctx2[4]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & 16) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block_2$3(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
      transition_in(editablelist20.$$.fragment, local);
      transition_in(editablelist21.$$.fragment, local);
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(editablelist20.$$.fragment, local);
      transition_out(editablelist21.$$.fragment, local);
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div0);
      if (detaching)
        detach(t3);
      if (detaching)
        detach(div1);
      destroy_component(editablelist20);
      destroy_component(editablelist21);
      if (detaching)
        detach(t5);
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function create_if_block_1$3(ctx) {
  var _a;
  let previous_key = (_a = ctx[3]) == null ? void 0 : _a.key;
  let key_block_anchor;
  let current;
  let key_block = create_key_block(ctx);
  return {
    c() {
      key_block.c();
      key_block_anchor = empty();
    },
    l(nodes) {
      key_block.l(nodes);
      key_block_anchor = empty();
    },
    m(target, anchor) {
      key_block.m(target, anchor);
      insert_hydration(target, key_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      var _a2;
      if (dirty[0] & 8 && safe_not_equal(previous_key, previous_key = (_a2 = ctx2[3]) == null ? void 0 : _a2.key)) {
        group_outros();
        transition_out(key_block, 1, 1, noop);
        check_outros();
        key_block = create_key_block(ctx2);
        key_block.c();
        transition_in(key_block, 1);
        key_block.m(key_block_anchor.parentNode, key_block_anchor);
      } else {
        key_block.p(ctx2, dirty);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(key_block);
      current = true;
    },
    o(local) {
      transition_out(key_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(key_block_anchor);
      key_block.d(detaching);
    }
  };
}
function create_key_block(ctx) {
  let div;
  let deriveditemdesigner;
  let div_transition;
  let current;
  let deriveditemdesigner_props = {
    node: ctx[3],
    system: ctx[9],
    context: ctx[0]
  };
  deriveditemdesigner = new DerivedItemDesigner({ props: deriveditemdesigner_props });
  ctx[40](deriveditemdesigner);
  return {
    c() {
      div = element("div");
      create_component(deriveditemdesigner.$$.fragment);
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", {});
      var div_nodes = children(div);
      claim_component(deriveditemdesigner.$$.fragment, div_nodes);
      div_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      mount_component(deriveditemdesigner, div, null);
      current = true;
    },
    p(ctx2, dirty) {
      const deriveditemdesigner_changes = {};
      if (dirty[0] & 8)
        deriveditemdesigner_changes.node = ctx2[3];
      if (dirty[0] & 1)
        deriveditemdesigner_changes.context = ctx2[0];
      deriveditemdesigner.$set(deriveditemdesigner_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(deriveditemdesigner.$$.fragment, local);
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
      transition_out(deriveditemdesigner.$$.fragment, local);
      if (!div_transition)
        div_transition = create_bidirectional_transition(div, slide, {}, false);
      div_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      ctx[40](null);
      destroy_component(deriveditemdesigner);
      if (detaching && div_transition)
        div_transition.end();
    }
  };
}
function create_default_slot(ctx) {
  var _a, _b, _c, _d;
  let div0;
  let h1;
  let t0;
  let t1;
  let p;
  let t2;
  let t3;
  let div1;
  let editablelist20;
  let t4;
  let editablelist21;
  let t5;
  let if_block_anchor;
  let current;
  editablelist20 = new EditAbleList2({
    props: {
      collection: (_b = (_a = ctx[10]) == null ? void 0 : _a.collections) != null ? _b : [],
      onSelect: ctx[30],
      onAdd: ctx[31],
      onUpdateItem: ctx[32],
      onDeleteItem: ctx[33],
      onSpecialAdd: ctx[34]
    }
  });
  editablelist20.$on("onDeSelect", ctx[35]);
  editablelist21 = new EditAbleList2({
    props: {
      disabled: ctx[1] == null,
      collection: (_d = (_c = ctx[1]) == null ? void 0 : _c.nodes) != null ? _d : [],
      onSelect: ctx[36],
      onAdd: ctx[37],
      onUpdateItem: ctx[38],
      onDeleteItem: ctx[39]
    }
  });
  editablelist21.$on("onDeSelect", onDeSelect_handler_3);
  let if_block = ctx[3] && create_if_block_1$3(ctx);
  return {
    c() {
      div0 = element("div");
      h1 = element("h1");
      t0 = text("Derived Item Design");
      t1 = space();
      p = element("p");
      t2 = text("Derived properties are the data, that are derived from fixedData");
      t3 = space();
      div1 = element("div");
      create_component(editablelist20.$$.fragment);
      t4 = space();
      create_component(editablelist21.$$.fragment);
      t5 = space();
      if (if_block)
        if_block.c();
      if_block_anchor = empty();
      this.h();
    },
    l(nodes) {
      div0 = claim_element(nodes, "DIV", {});
      var div0_nodes = children(div0);
      h1 = claim_element(div0_nodes, "H1", {});
      var h1_nodes = children(h1);
      t0 = claim_text(h1_nodes, "Derived Item Design");
      h1_nodes.forEach(detach);
      t1 = claim_space(div0_nodes);
      p = claim_element(div0_nodes, "P", {});
      var p_nodes = children(p);
      t2 = claim_text(p_nodes, "Derived properties are the data, that are derived from fixedData");
      p_nodes.forEach(detach);
      div0_nodes.forEach(detach);
      t3 = claim_space(nodes);
      div1 = claim_element(nodes, "DIV", { style: true });
      var div1_nodes = children(div1);
      claim_component(editablelist20.$$.fragment, div1_nodes);
      t4 = claim_space(div1_nodes);
      claim_component(editablelist21.$$.fragment, div1_nodes);
      div1_nodes.forEach(detach);
      t5 = claim_space(nodes);
      if (if_block)
        if_block.l(nodes);
      if_block_anchor = empty();
      this.h();
    },
    h() {
      set_style(div1, "display", "grid");
      set_style(div1, "grid-template-columns", "1fr 1fr");
      set_style(div1, "gap", "10px");
      set_style(div1, "align-items", "start");
    },
    m(target, anchor) {
      insert_hydration(target, div0, anchor);
      append_hydration(div0, h1);
      append_hydration(h1, t0);
      append_hydration(div0, t1);
      append_hydration(div0, p);
      append_hydration(p, t2);
      insert_hydration(target, t3, anchor);
      insert_hydration(target, div1, anchor);
      mount_component(editablelist20, div1, null);
      append_hydration(div1, t4);
      mount_component(editablelist21, div1, null);
      insert_hydration(target, t5, anchor);
      if (if_block)
        if_block.m(target, anchor);
      insert_hydration(target, if_block_anchor, anchor);
      current = true;
    },
    p(ctx2, dirty) {
      var _a2, _b2;
      const editablelist20_changes = {};
      if (dirty[0] & 2)
        editablelist20_changes.onDeleteItem = ctx2[33];
      if (dirty[0] & 32)
        editablelist20_changes.onSpecialAdd = ctx2[34];
      editablelist20.$set(editablelist20_changes);
      const editablelist21_changes = {};
      if (dirty[0] & 2)
        editablelist21_changes.disabled = ctx2[1] == null;
      if (dirty[0] & 2)
        editablelist21_changes.collection = (_b2 = (_a2 = ctx2[1]) == null ? void 0 : _a2.nodes) != null ? _b2 : [];
      if (dirty[0] & 2)
        editablelist21_changes.onAdd = ctx2[37];
      if (dirty[0] & 10)
        editablelist21_changes.onDeleteItem = ctx2[39];
      editablelist21.$set(editablelist21_changes);
      if (ctx2[3]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & 8) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block_1$3(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
      transition_in(editablelist20.$$.fragment, local);
      transition_in(editablelist21.$$.fragment, local);
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(editablelist20.$$.fragment, local);
      transition_out(editablelist21.$$.fragment, local);
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div0);
      if (detaching)
        detach(t3);
      if (detaching)
        detach(div1);
      destroy_component(editablelist20);
      destroy_component(editablelist21);
      if (detaching)
        detach(t5);
      if (if_block)
        if_block.d(detaching);
      if (detaching)
        detach(if_block_anchor);
    }
  };
}
function create_fragment$4(ctx) {
  let div;
  let staticmessagehandler;
  let t;
  let current_block_type_index;
  let if_block;
  let current;
  let staticmessagehandler_props = {};
  staticmessagehandler = new StaticMessageHandler({ props: staticmessagehandler_props });
  ctx[17](staticmessagehandler);
  const if_block_creators = [create_if_block$3, create_else_block];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (ctx2[5])
      return 0;
    return 1;
  }
  current_block_type_index = select_block_type(ctx);
  if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    c() {
      div = element("div");
      create_component(staticmessagehandler.$$.fragment);
      t = space();
      if_block.c();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", {});
      var div_nodes = children(div);
      claim_component(staticmessagehandler.$$.fragment, div_nodes);
      t = claim_space(div_nodes);
      if_block.l(div_nodes);
      div_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      mount_component(staticmessagehandler, div, null);
      append_hydration(div, t);
      if_blocks[current_block_type_index].m(div, null);
      current = true;
    },
    p(ctx2, dirty) {
      const staticmessagehandler_changes = {};
      staticmessagehandler.$set(staticmessagehandler_changes);
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx2, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block = if_blocks[current_block_type_index];
        if (!if_block) {
          if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
          if_block.c();
        } else {
          if_block.p(ctx2, dirty);
        }
        transition_in(if_block, 1);
        if_block.m(div, null);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(staticmessagehandler.$$.fragment, local);
      transition_in(if_block);
      current = true;
    },
    o(local) {
      transition_out(staticmessagehandler.$$.fragment, local);
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      ctx[17](null);
      destroy_component(staticmessagehandler);
      if_blocks[current_block_type_index].d();
    }
  };
}
const designerKey = "sysDesigner";
const save_handler = (e) => {
  e.detail;
};
const onDeSelect_handler_3 = () => {
};
function instance$4($$self, $$props, $$invalidate) {
  var _a, _b;
  let { context } = $$props;
  let { system } = $$props;
  let uiSystem = (_a = context.uiSystem) !== null && _a !== void 0 ? _a : new UISystem(system);
  let guidKey = (_b = context.uiGuid) !== null && _b !== void 0 ? _b : "designer" + StringFunctions.uuidv4();
  context.uiSystem = uiSystem;
  context.uiGuid = guidKey;
  let derivedGrp = uiSystem.groups.find((p) => p.name == "derived");
  let fixedGrp = uiSystem.groups.find((p) => p.name == "fixed");
  let derivedCol = null;
  let fixedCol = null;
  let derivedNod = null;
  let fixedNod = null;
  let specialOn = false;
  let designerFixed;
  let designerDerived;
  function designerUIUpdate() {
    designerDerived === null || designerDerived === void 0 ? void 0 : designerDerived.forceUpdate();
    designerFixed === null || designerFixed === void 0 ? void 0 : designerFixed.forceUpdate();
  }
  function _colSelect(grp, col) {
    _nodSelect(grp, null);
    if (grp == "derived") {
      if (derivedCol) {
        derivedCol === null || derivedCol === void 0 ? void 0 : derivedCol.removeEventListener(guidKey);
      }
      $$invalidate(1, derivedCol = col);
      derivedCol === null || derivedCol === void 0 ? void 0 : derivedCol.addEventListener(guidKey, "update", () => {
        $$invalidate(1, derivedCol);
      });
    } else {
      if (fixedCol) {
        fixedCol === null || fixedCol === void 0 ? void 0 : fixedCol.removeEventListener(guidKey);
      }
      $$invalidate(2, fixedCol = col);
      fixedCol === null || fixedCol === void 0 ? void 0 : fixedCol.addEventListener(guidKey, "update", () => {
        $$invalidate(2, fixedCol);
      });
    }
  }
  function _nodSelect(grp, nod) {
    if (grp == "derived") {
      derivedNod === null || derivedNod === void 0 ? void 0 : derivedNod.removeEventListener(guidKey);
      $$invalidate(3, derivedNod = nod);
      derivedNod === null || derivedNod === void 0 ? void 0 : derivedNod.addEventListener(guidKey, "update", () => {
        designerUIUpdate();
      });
    } else {
      fixedNod === null || fixedNod === void 0 ? void 0 : fixedNod.removeEventListener(guidKey);
      $$invalidate(4, fixedNod = nod);
      fixedNod === null || fixedNod === void 0 ? void 0 : fixedNod.addEventListener(guidKey, "update", () => {
        designerUIUpdate();
      });
    }
  }
  function _colUpdate(grp, colArr) {
    colArr.forEach((n) => {
      if (n.name != n.nameEdit) {
        uiSystem.renameCollection(grp, n.name, n.nameEdit);
      }
    });
  }
  function _nodUpdate(grp, nodArr) {
    let col = grp == "derived" ? derivedCol : fixedCol;
    if (!col)
      return;
    nodArr.forEach((n) => {
      if (n.name != n.nameEdit) {
        uiSystem.renameNode(grp, col.name, n.name, n.nameEdit);
      }
    });
  }
  onMount(() => {
    derivedGrp === null || derivedGrp === void 0 ? void 0 : derivedGrp.addEventListener(designerKey, "update", () => {
      _colSelect("derived", null);
    });
  });
  onDestroy(() => {
    derivedGrp === null || derivedGrp === void 0 ? void 0 : derivedGrp.removeEventListener(designerKey);
  });
  let messageHandler;
  function staticmessagehandler_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      messageHandler = $$value;
      $$invalidate(8, messageHandler);
    });
  }
  const close_handler = () => {
    $$invalidate(5, specialOn = false);
  };
  const func2 = (e) => {
    _colSelect("fixed", e);
    return true;
  };
  const func_1 = () => {
    uiSystem.addCollection("fixed");
  };
  const func_2 = (arr) => {
    _colUpdate("fixed", arr);
    return true;
  };
  const func_3 = (e) => {
    uiSystem.remCollection("fixed", e.name);
    if (e.key == (derivedCol == null ? void 0 : derivedCol.key)) {
      _colSelect("fixed", null);
    }
  };
  const onDeSelect_handler2 = () => {
    _colSelect("fixed", null);
  };
  const func_4 = (e) => {
    _nodSelect("fixed", e);
    return true;
  };
  const func_5 = () => {
    uiSystem.addNode("fixed", fixedCol == null ? void 0 : fixedCol.name);
  };
  const func_6 = (arr) => {
    _nodUpdate("fixed", arr);
    return true;
  };
  const func_7 = (e) => {
    var _a2;
    uiSystem.remNode("fixed", (_a2 = fixedCol == null ? void 0 : fixedCol.name) != null ? _a2 : "", e.name);
    if (e.key == (fixedNod == null ? void 0 : fixedNod.key)) {
      _nodSelect("fixed", null);
    }
  };
  const onDeSelect_handler_1 = () => {
    _nodSelect("fixed", null);
  };
  function fixeditemdesigner_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      designerFixed = $$value;
      $$invalidate(6, designerFixed);
    });
  }
  const func_8 = (e) => {
    _colSelect("derived", e);
    return true;
  };
  const func_9 = () => {
    uiSystem.addCollection("derived");
  };
  const func_10 = (arr) => {
    _colUpdate("derived", arr);
    return true;
  };
  const func_11 = (e) => {
    uiSystem.remCollection("derived", e.name);
    if (e.key == (derivedCol == null ? void 0 : derivedCol.key)) {
      _colSelect("derived", null);
    }
  };
  const func_12 = () => {
    $$invalidate(5, specialOn = !specialOn);
  };
  const onDeSelect_handler_2 = () => {
    _colSelect("derived", null);
  };
  const func_13 = (e) => {
    _nodSelect("derived", e);
    return true;
  };
  const func_14 = () => {
    uiSystem.addNode("derived", derivedCol == null ? void 0 : derivedCol.name);
  };
  const func_15 = (arr) => {
    _nodUpdate("derived", arr);
    return true;
  };
  const func_16 = (e) => {
    var _a2;
    uiSystem.remNode("derived", (_a2 = derivedCol == null ? void 0 : derivedCol.name) != null ? _a2 : "", e.name);
    if (e.key == (derivedNod == null ? void 0 : derivedNod.key)) {
      _nodSelect("derived", null);
    }
  };
  function deriveditemdesigner_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      designerDerived = $$value;
      $$invalidate(7, designerDerived);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("context" in $$props2)
      $$invalidate(0, context = $$props2.context);
    if ("system" in $$props2)
      $$invalidate(16, system = $$props2.system);
  };
  return [
    context,
    derivedCol,
    fixedCol,
    derivedNod,
    fixedNod,
    specialOn,
    designerFixed,
    designerDerived,
    messageHandler,
    uiSystem,
    derivedGrp,
    fixedGrp,
    _colSelect,
    _nodSelect,
    _colUpdate,
    _nodUpdate,
    system,
    staticmessagehandler_binding,
    close_handler,
    func2,
    func_1,
    func_2,
    func_3,
    onDeSelect_handler2,
    func_4,
    func_5,
    func_6,
    func_7,
    onDeSelect_handler_1,
    fixeditemdesigner_binding,
    func_8,
    func_9,
    func_10,
    func_11,
    func_12,
    onDeSelect_handler_2,
    func_13,
    func_14,
    func_15,
    func_16,
    deriveditemdesigner_binding
  ];
}
class SystemDesigner3Parts extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$4, create_fragment$4, safe_not_equal, { context: 0, system: 16 }, null, [-1, -1]);
  }
}
function create_if_block_2$2(ctx) {
  let div3;
  let section;
  let div0;
  let t0;
  let t1;
  let div2;
  let div1;
  let t2;
  let div3_transition;
  let current;
  let mounted;
  let dispose;
  return {
    c() {
      div3 = element("div");
      section = element("section");
      div0 = element("div");
      t0 = text("X");
      t1 = space();
      div2 = element("div");
      div1 = element("div");
      t2 = text("use this as a base for a ui theme that can be used for character sheets.");
      this.h();
    },
    l(nodes) {
      div3 = claim_element(nodes, "DIV", {});
      var div3_nodes = children(div3);
      section = claim_element(div3_nodes, "SECTION", {});
      var section_nodes = children(section);
      div0 = claim_element(section_nodes, "DIV", { class: true });
      var div0_nodes = children(div0);
      t0 = claim_text(div0_nodes, "X");
      div0_nodes.forEach(detach);
      t1 = claim_space(section_nodes);
      div2 = claim_element(section_nodes, "DIV", {});
      var div2_nodes = children(div2);
      div1 = claim_element(div2_nodes, "DIV", {});
      var div1_nodes = children(div1);
      t2 = claim_text(div1_nodes, "use this as a base for a ui theme that can be used for character sheets.");
      div1_nodes.forEach(detach);
      div2_nodes.forEach(detach);
      section_nodes.forEach(detach);
      div3_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div0, "class", "SystemExporterOptionsCloseBtn");
    },
    m(target, anchor) {
      insert_hydration(target, div3, anchor);
      append_hydration(div3, section);
      append_hydration(section, div0);
      append_hydration(div0, t0);
      append_hydration(section, t1);
      append_hydration(section, div2);
      append_hydration(div2, div1);
      append_hydration(div1, t2);
      current = true;
      if (!mounted) {
        dispose = [
          listen(div0, "click", ctx[10]),
          listen(div0, "keypress", ctx[6])
        ];
        mounted = true;
      }
    },
    p: noop,
    i(local) {
      if (current)
        return;
      if (local) {
        add_render_callback(() => {
          if (!current)
            return;
          if (!div3_transition)
            div3_transition = create_bidirectional_transition(div3, slide, {}, true);
          div3_transition.run(1);
        });
      }
      current = true;
    },
    o(local) {
      if (local) {
        if (!div3_transition)
          div3_transition = create_bidirectional_transition(div3, slide, {}, false);
        div3_transition.run(0);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div3);
      if (detaching && div3_transition)
        div3_transition.end();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block_1$2(ctx) {
  let div3;
  let section;
  let div0;
  let t0;
  let t1;
  let div2;
  let div1;
  let t2;
  let div3_transition;
  let current;
  let mounted;
  let dispose;
  return {
    c() {
      div3 = element("div");
      section = element("section");
      div0 = element("div");
      t0 = text("X");
      t1 = space();
      div2 = element("div");
      div1 = element("div");
      t2 = text("use this as a base for a ui theme that can be used for character sheets.");
      this.h();
    },
    l(nodes) {
      div3 = claim_element(nodes, "DIV", {});
      var div3_nodes = children(div3);
      section = claim_element(div3_nodes, "SECTION", {});
      var section_nodes = children(section);
      div0 = claim_element(section_nodes, "DIV", { class: true });
      var div0_nodes = children(div0);
      t0 = claim_text(div0_nodes, "X");
      div0_nodes.forEach(detach);
      t1 = claim_space(section_nodes);
      div2 = claim_element(section_nodes, "DIV", {});
      var div2_nodes = children(div2);
      div1 = claim_element(div2_nodes, "DIV", {});
      var div1_nodes = children(div1);
      t2 = claim_text(div1_nodes, "use this as a base for a ui theme that can be used for character sheets.");
      div1_nodes.forEach(detach);
      div2_nodes.forEach(detach);
      section_nodes.forEach(detach);
      div3_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div0, "class", "SystemExporterOptionsCloseBtn");
    },
    m(target, anchor) {
      insert_hydration(target, div3, anchor);
      append_hydration(div3, section);
      append_hydration(section, div0);
      append_hydration(div0, t0);
      append_hydration(section, t1);
      append_hydration(section, div2);
      append_hydration(div2, div1);
      append_hydration(div1, t2);
      current = true;
      if (!mounted) {
        dispose = [
          listen(div0, "click", ctx[9]),
          listen(div0, "keypress", ctx[5])
        ];
        mounted = true;
      }
    },
    p: noop,
    i(local) {
      if (current)
        return;
      if (local) {
        add_render_callback(() => {
          if (!current)
            return;
          if (!div3_transition)
            div3_transition = create_bidirectional_transition(div3, slide, {}, true);
          div3_transition.run(1);
        });
      }
      current = true;
    },
    o(local) {
      if (local) {
        if (!div3_transition)
          div3_transition = create_bidirectional_transition(div3, slide, {}, false);
        div3_transition.run(0);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div3);
      if (detaching && div3_transition)
        div3_transition.end();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block$2(ctx) {
  let div8;
  let section0;
  let br0;
  let t0;
  let div1;
  let b;
  let t1;
  let t2;
  let div0;
  let p0;
  let t3;
  let t4;
  let p1;
  let t5;
  let t6;
  let div2;
  let editablelist;
  let t7;
  let br1;
  let t8;
  let section1;
  let div4;
  let button0;
  let t9;
  let t10;
  let div3;
  let t11;
  let t12;
  let div6;
  let button1;
  let t13;
  let t14;
  let div5;
  let t15;
  let t16;
  let section2;
  let br2;
  let t17;
  let div7;
  let t18;
  let br3;
  let br4;
  let t19;
  let div8_transition;
  let current;
  let mounted;
  let dispose;
  editablelist = new EditAbleList({
    props: {
      isEditableContainer: false,
      collection: ["theme - A", "theme - B", "theme - C"],
      onSelect: func$1
    }
  });
  editablelist.$on("onDeSelect", onDeSelect_handler);
  return {
    c() {
      div8 = element("div");
      section0 = element("section");
      br0 = element("br");
      t0 = space();
      div1 = element("div");
      b = element("b");
      t1 = text("UI-theme's");
      t2 = space();
      div0 = element("div");
      p0 = element("p");
      t3 = text("author :");
      t4 = space();
      p1 = element("p");
      t5 = text("version :");
      t6 = space();
      div2 = element("div");
      create_component(editablelist.$$.fragment);
      t7 = space();
      br1 = element("br");
      t8 = space();
      section1 = element("section");
      div4 = element("div");
      button0 = element("button");
      t9 = text("Export New UI Project");
      t10 = space();
      div3 = element("div");
      t11 = text("use this as a base for a ui theme that can be used for character sheets.");
      t12 = space();
      div6 = element("div");
      button1 = element("button");
      t13 = text("Import a UI project");
      t14 = space();
      div5 = element("div");
      t15 = text("click her, to Open Importer.");
      t16 = space();
      section2 = element("section");
      br2 = element("br");
      t17 = space();
      div7 = element("div");
      t18 = text("click her, to Open Importer. details .... details .... details .... ");
      br3 = element("br");
      br4 = element("br");
      t19 = text("\n					details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details ....");
      this.h();
    },
    l(nodes) {
      div8 = claim_element(nodes, "DIV", {});
      var div8_nodes = children(div8);
      section0 = claim_element(div8_nodes, "SECTION", {});
      var section0_nodes = children(section0);
      br0 = claim_element(section0_nodes, "BR", {});
      t0 = claim_space(section0_nodes);
      div1 = claim_element(section0_nodes, "DIV", {});
      var div1_nodes = children(div1);
      b = claim_element(div1_nodes, "B", {});
      var b_nodes = children(b);
      t1 = claim_text(b_nodes, "UI-theme's");
      b_nodes.forEach(detach);
      t2 = claim_space(div1_nodes);
      div0 = claim_element(div1_nodes, "DIV", {});
      var div0_nodes = children(div0);
      p0 = claim_element(div0_nodes, "P", {});
      var p0_nodes = children(p0);
      t3 = claim_text(p0_nodes, "author :");
      p0_nodes.forEach(detach);
      t4 = claim_space(div0_nodes);
      p1 = claim_element(div0_nodes, "P", {});
      var p1_nodes = children(p1);
      t5 = claim_text(p1_nodes, "version :");
      p1_nodes.forEach(detach);
      div0_nodes.forEach(detach);
      div1_nodes.forEach(detach);
      t6 = claim_space(section0_nodes);
      div2 = claim_element(section0_nodes, "DIV", {});
      var div2_nodes = children(div2);
      claim_component(editablelist.$$.fragment, div2_nodes);
      div2_nodes.forEach(detach);
      section0_nodes.forEach(detach);
      t7 = claim_space(div8_nodes);
      br1 = claim_element(div8_nodes, "BR", {});
      t8 = claim_space(div8_nodes);
      section1 = claim_element(div8_nodes, "SECTION", { class: true });
      var section1_nodes = children(section1);
      div4 = claim_element(section1_nodes, "DIV", {});
      var div4_nodes = children(div4);
      button0 = claim_element(div4_nodes, "BUTTON", { class: true });
      var button0_nodes = children(button0);
      t9 = claim_text(button0_nodes, "Export New UI Project");
      button0_nodes.forEach(detach);
      t10 = claim_space(div4_nodes);
      div3 = claim_element(div4_nodes, "DIV", {});
      var div3_nodes = children(div3);
      t11 = claim_text(div3_nodes, "use this as a base for a ui theme that can be used for character sheets.");
      div3_nodes.forEach(detach);
      div4_nodes.forEach(detach);
      t12 = claim_space(section1_nodes);
      div6 = claim_element(section1_nodes, "DIV", {});
      var div6_nodes = children(div6);
      button1 = claim_element(div6_nodes, "BUTTON", { class: true });
      var button1_nodes = children(button1);
      t13 = claim_text(button1_nodes, "Import a UI project");
      button1_nodes.forEach(detach);
      t14 = claim_space(div6_nodes);
      div5 = claim_element(div6_nodes, "DIV", {});
      var div5_nodes = children(div5);
      t15 = claim_text(div5_nodes, "click her, to Open Importer.");
      div5_nodes.forEach(detach);
      div6_nodes.forEach(detach);
      section1_nodes.forEach(detach);
      t16 = claim_space(div8_nodes);
      section2 = claim_element(div8_nodes, "SECTION", {});
      var section2_nodes = children(section2);
      br2 = claim_element(section2_nodes, "BR", {});
      t17 = claim_space(section2_nodes);
      div7 = claim_element(section2_nodes, "DIV", {});
      var div7_nodes = children(div7);
      t18 = claim_text(div7_nodes, "click her, to Open Importer. details .... details .... details .... ");
      br3 = claim_element(div7_nodes, "BR", {});
      br4 = claim_element(div7_nodes, "BR", {});
      t19 = claim_text(div7_nodes, "\n					details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details .... details ....");
      div7_nodes.forEach(detach);
      section2_nodes.forEach(detach);
      div8_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(button0, "class", "SystemExporterButton");
      attr(button1, "class", "SystemExporterButton");
      attr(section1, "class", "SystemExporterOptions");
    },
    m(target, anchor) {
      insert_hydration(target, div8, anchor);
      append_hydration(div8, section0);
      append_hydration(section0, br0);
      append_hydration(section0, t0);
      append_hydration(section0, div1);
      append_hydration(div1, b);
      append_hydration(b, t1);
      append_hydration(div1, t2);
      append_hydration(div1, div0);
      append_hydration(div0, p0);
      append_hydration(p0, t3);
      append_hydration(div0, t4);
      append_hydration(div0, p1);
      append_hydration(p1, t5);
      append_hydration(section0, t6);
      append_hydration(section0, div2);
      mount_component(editablelist, div2, null);
      append_hydration(div8, t7);
      append_hydration(div8, br1);
      append_hydration(div8, t8);
      append_hydration(div8, section1);
      append_hydration(section1, div4);
      append_hydration(div4, button0);
      append_hydration(button0, t9);
      append_hydration(div4, t10);
      append_hydration(div4, div3);
      append_hydration(div3, t11);
      append_hydration(section1, t12);
      append_hydration(section1, div6);
      append_hydration(div6, button1);
      append_hydration(button1, t13);
      append_hydration(div6, t14);
      append_hydration(div6, div5);
      append_hydration(div5, t15);
      append_hydration(div8, t16);
      append_hydration(div8, section2);
      append_hydration(section2, br2);
      append_hydration(section2, t17);
      append_hydration(section2, div7);
      append_hydration(div7, t18);
      append_hydration(div7, br3);
      append_hydration(div7, br4);
      append_hydration(div7, t19);
      current = true;
      if (!mounted) {
        dispose = [
          listen(button0, "click", ctx[7]),
          listen(button0, "keypress", ctx[4]),
          listen(button1, "click", ctx[8]),
          listen(button1, "keypress", ctx[3])
        ];
        mounted = true;
      }
    },
    p: noop,
    i(local) {
      if (current)
        return;
      transition_in(editablelist.$$.fragment, local);
      if (local) {
        add_render_callback(() => {
          if (!current)
            return;
          if (!div8_transition)
            div8_transition = create_bidirectional_transition(div8, slide, {}, true);
          div8_transition.run(1);
        });
      }
      current = true;
    },
    o(local) {
      transition_out(editablelist.$$.fragment, local);
      if (local) {
        if (!div8_transition)
          div8_transition = create_bidirectional_transition(div8, slide, {}, false);
        div8_transition.run(0);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div8);
      destroy_component(editablelist);
      if (detaching && div8_transition)
        div8_transition.end();
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_fragment$3(ctx) {
  let div;
  let current_block_type_index;
  let if_block;
  let current;
  const if_block_creators = [create_if_block$2, create_if_block_1$2, create_if_block_2$2];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (ctx2[1] == "")
      return 0;
    if (ctx2[1] == ctx2[0].exporter)
      return 1;
    if (ctx2[1] == ctx2[0].importer)
      return 2;
    return -1;
  }
  if (~(current_block_type_index = select_block_type(ctx))) {
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  }
  return {
    c() {
      div = element("div");
      if (if_block)
        if_block.c();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", {});
      var div_nodes = children(div);
      if (if_block)
        if_block.l(div_nodes);
      div_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].m(div, null);
      }
      current = true;
    },
    p(ctx2, [dirty]) {
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].p(ctx2, dirty);
        }
      } else {
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
          } else {
            if_block.p(ctx2, dirty);
          }
          transition_in(if_block, 1);
          if_block.m(div, null);
        } else {
          if_block = null;
        }
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
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].d();
      }
    }
  };
}
const func$1 = (e) => {
  return true;
};
const onDeSelect_handler = () => {
};
function instance$3($$self, $$props, $$invalidate) {
  class subpages {
  }
  subpages.importer = "importer";
  subpages.exporter = "exporter";
  let subpage = "";
  function enableSubPage(_subpage) {
    $$invalidate(1, subpage = _subpage);
  }
  function keypress_handler_1(event) {
    bubble.call(this, $$self, event);
  }
  function keypress_handler(event) {
    bubble.call(this, $$self, event);
  }
  function keypress_handler_2(event) {
    bubble.call(this, $$self, event);
  }
  function keypress_handler_3(event) {
    bubble.call(this, $$self, event);
  }
  const click_handler = () => {
    enableSubPage(subpages.exporter);
  };
  const click_handler_1 = () => enableSubPage(subpages.importer);
  const click_handler_2 = () => enableSubPage("");
  const click_handler_3 = () => enableSubPage("");
  return [
    subpages,
    subpage,
    enableSubPage,
    keypress_handler_1,
    keypress_handler,
    keypress_handler_2,
    keypress_handler_3,
    click_handler,
    click_handler_1,
    click_handler_2,
    click_handler_3
  ];
}
class SystemExporter extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$3, create_fragment$3, safe_not_equal, {});
  }
}
function create_if_block$1(ctx) {
  let section;
  let menu;
  let t;
  let current_block_type_index;
  let if_block;
  let section_transition;
  let current;
  menu = new Menu({
    props: {
      regularOptions: ctx[9],
      startChosen: ctx[6]
    }
  });
  menu.$on("changePage", ctx[10]);
  const if_block_creators = [create_if_block_1$1, create_if_block_2$1, create_if_block_3$1];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (ctx2[6] == "designer")
      return 0;
    if (ctx2[6] == "UI-designer")
      return 1;
    if (ctx2[6] == "test")
      return 2;
    return -1;
  }
  if (~(current_block_type_index = select_block_type(ctx))) {
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  }
  return {
    c() {
      section = element("section");
      create_component(menu.$$.fragment);
      t = space();
      if (if_block)
        if_block.c();
    },
    l(nodes) {
      section = claim_element(nodes, "SECTION", {});
      var section_nodes = children(section);
      claim_component(menu.$$.fragment, section_nodes);
      t = claim_space(section_nodes);
      if (if_block)
        if_block.l(section_nodes);
      section_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, section, anchor);
      mount_component(menu, section, null);
      append_hydration(section, t);
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].m(section, null);
      }
      ctx[12](section);
      current = true;
    },
    p(ctx2, dirty) {
      const menu_changes = {};
      if (dirty & 64)
        menu_changes.startChosen = ctx2[6];
      menu.$set(menu_changes);
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].p(ctx2, dirty);
        }
      } else {
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
          } else {
            if_block.p(ctx2, dirty);
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
      add_render_callback(() => {
        if (!current)
          return;
        if (!section_transition)
          section_transition = create_bidirectional_transition(section, slide, {}, true);
        section_transition.run(1);
      });
      current = true;
    },
    o(local) {
      transition_out(menu.$$.fragment, local);
      transition_out(if_block);
      if (!section_transition)
        section_transition = create_bidirectional_transition(section, slide, {}, false);
      section_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(section);
      destroy_component(menu);
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].d();
      }
      ctx[12](null);
      if (detaching && section_transition)
        section_transition.end();
    }
  };
}
function create_if_block_3$1(ctx) {
  let div;
  let h1;
  let t;
  let div_transition;
  let current;
  return {
    c() {
      div = element("div");
      h1 = element("h1");
      t = text("asdadsadsasdadsasdauuuuh");
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", {});
      var div_nodes = children(div);
      h1 = claim_element(div_nodes, "H1", {});
      var h1_nodes = children(h1);
      t = claim_text(h1_nodes, "asdadsadsasdadsasdauuuuh");
      h1_nodes.forEach(detach);
      div_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      append_hydration(div, h1);
      append_hydration(h1, t);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
    },
    i(local) {
      if (current)
        return;
      add_render_callback(() => {
        if (!current)
          return;
        if (!div_transition)
          div_transition = create_bidirectional_transition(div, pageSlide, { parent: ctx[5] }, true);
        div_transition.run(1);
      });
      current = true;
    },
    o(local) {
      if (!div_transition)
        div_transition = create_bidirectional_transition(div, pageSlide, { parent: ctx[5] }, false);
      div_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      if (detaching && div_transition)
        div_transition.end();
    }
  };
}
function create_if_block_2$1(ctx) {
  let div;
  let systemexporter;
  let div_transition;
  let current;
  systemexporter = new SystemExporter({});
  return {
    c() {
      div = element("div");
      create_component(systemexporter.$$.fragment);
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", {});
      var div_nodes = children(div);
      claim_component(systemexporter.$$.fragment, div_nodes);
      div_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      mount_component(systemexporter, div, null);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
    },
    i(local) {
      if (current)
        return;
      transition_in(systemexporter.$$.fragment, local);
      add_render_callback(() => {
        if (!current)
          return;
        if (!div_transition)
          div_transition = create_bidirectional_transition(div, pageSlide, { parent: ctx[5] }, true);
        div_transition.run(1);
      });
      current = true;
    },
    o(local) {
      transition_out(systemexporter.$$.fragment, local);
      if (!div_transition)
        div_transition = create_bidirectional_transition(div, pageSlide, { parent: ctx[5] }, false);
      div_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_component(systemexporter);
      if (detaching && div_transition)
        div_transition.end();
    }
  };
}
function create_if_block_1$1(ctx) {
  let div;
  let systemdesigner3parts;
  let div_transition;
  let current;
  systemdesigner3parts = new SystemDesigner3Parts({
    props: {
      system: ctx[4],
      context: ctx[0]
    }
  });
  return {
    c() {
      div = element("div");
      create_component(systemdesigner3parts.$$.fragment);
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", {});
      var div_nodes = children(div);
      claim_component(systemdesigner3parts.$$.fragment, div_nodes);
      div_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      mount_component(systemdesigner3parts, div, null);
      current = true;
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const systemdesigner3parts_changes = {};
      if (dirty & 16)
        systemdesigner3parts_changes.system = ctx[4];
      if (dirty & 1)
        systemdesigner3parts_changes.context = ctx[0];
      systemdesigner3parts.$set(systemdesigner3parts_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(systemdesigner3parts.$$.fragment, local);
      add_render_callback(() => {
        if (!current)
          return;
        if (!div_transition)
          div_transition = create_bidirectional_transition(div, pageSlide, { parent: ctx[5] }, true);
        div_transition.run(1);
      });
      current = true;
    },
    o(local) {
      transition_out(systemdesigner3parts.$$.fragment, local);
      if (!div_transition)
        div_transition = create_bidirectional_transition(div, pageSlide, { parent: ctx[5] }, false);
      div_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_component(systemdesigner3parts);
      if (detaching && div_transition)
        div_transition.end();
    }
  };
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
  let t2_value = ((_b = (_a = ctx[3]) == null ? void 0 : _a.author) != null ? _b : unknownString) + "";
  let t2;
  let t3;
  let div5;
  let div3;
  let t4;
  let t5;
  let div4;
  let t6_value = ((_d = (_c = ctx[3]) == null ? void 0 : _c.version) != null ? _d : unknownString) + "";
  let t6;
  let t7;
  let div8;
  let div6;
  let t8;
  let t9;
  let div7;
  let t10_value = ((_f = (_e = ctx[3]) == null ? void 0 : _e.code) != null ? _f : unknownString) + "";
  let t10;
  let t11;
  let div11;
  let div9;
  let t12;
  let t13;
  let div10;
  let t14_value = ((_h = (_g = ctx[3]) == null ? void 0 : _g.isEditable) != null ? _h : unknownString) + "";
  let t14;
  let t15;
  let div14;
  let div12;
  let t16;
  let t17;
  let div13;
  let t18_value = ((_j = (_i = ctx[3]) == null ? void 0 : _i.name) != null ? _j : unknownString) + "";
  let t18;
  let t19;
  let div17;
  let div15;
  let t20;
  let t21;
  let div16;
  let t22_value = ((_l = (_k = ctx[3]) == null ? void 0 : _k.folderName) != null ? _l : unknownString) + "";
  let t22;
  let div18_transition;
  let t23;
  let br;
  let t24;
  let div19;
  let editablelist;
  let t25;
  let current;
  editablelist = new EditAbleList({
    props: {
      isEditableContainer: false,
      collection: (_n = (_m = ctx[1]) == null ? void 0 : _m.map(func)) != null ? _n : [],
      onSelect: ctx[11]
    }
  });
  editablelist.$on("onDeSelect", ctx[7]);
  let if_block = ctx[4] && ctx[3] != ctx[2] && create_if_block$1(ctx);
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
      t25 = space();
      if (if_block)
        if_block.c();
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
      t25 = claim_space(div20_nodes);
      if (if_block)
        if_block.l(div20_nodes);
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
      append_hydration(div20, t25);
      if (if_block)
        if_block.m(div20, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2, _i2, _j2, _k2, _l2, _m2, _n2;
      if ((!current || dirty & 8) && t2_value !== (t2_value = ((_b2 = (_a2 = ctx2[3]) == null ? void 0 : _a2.author) != null ? _b2 : unknownString) + ""))
        set_data(t2, t2_value);
      if ((!current || dirty & 8) && t6_value !== (t6_value = ((_d2 = (_c2 = ctx2[3]) == null ? void 0 : _c2.version) != null ? _d2 : unknownString) + ""))
        set_data(t6, t6_value);
      if ((!current || dirty & 8) && t10_value !== (t10_value = ((_f2 = (_e2 = ctx2[3]) == null ? void 0 : _e2.code) != null ? _f2 : unknownString) + ""))
        set_data(t10, t10_value);
      if ((!current || dirty & 8) && t14_value !== (t14_value = ((_h2 = (_g2 = ctx2[3]) == null ? void 0 : _g2.isEditable) != null ? _h2 : unknownString) + ""))
        set_data(t14, t14_value);
      if ((!current || dirty & 8) && t18_value !== (t18_value = ((_j2 = (_i2 = ctx2[3]) == null ? void 0 : _i2.name) != null ? _j2 : unknownString) + ""))
        set_data(t18, t18_value);
      if ((!current || dirty & 8) && t22_value !== (t22_value = ((_l2 = (_k2 = ctx2[3]) == null ? void 0 : _k2.folderName) != null ? _l2 : unknownString) + ""))
        set_data(t22, t22_value);
      const editablelist_changes = {};
      if (dirty & 2)
        editablelist_changes.collection = (_n2 = (_m2 = ctx2[1]) == null ? void 0 : _m2.map(func)) != null ? _n2 : [];
      editablelist.$set(editablelist_changes);
      if (ctx2[4] && ctx2[3] != ctx2[2]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & 28) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block$1(ctx2);
          if_block.c();
          transition_in(if_block, 1);
          if_block.m(div20, null);
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
      add_render_callback(() => {
        if (!current)
          return;
        if (!div18_transition)
          div18_transition = create_bidirectional_transition(div18, fade, {}, true);
        div18_transition.run(1);
      });
      transition_in(editablelist.$$.fragment, local);
      transition_in(if_block);
      current = true;
    },
    o(local) {
      if (!div18_transition)
        div18_transition = create_bidirectional_transition(div18, fade, {}, false);
      div18_transition.run(0);
      transition_out(editablelist.$$.fragment, local);
      transition_out(if_block);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div20);
      if (detaching && div18_transition)
        div18_transition.end();
      destroy_component(editablelist);
      if (if_block)
        if_block.d();
    }
  };
}
let unknownString = "unknown";
const func = (p) => {
  return { key: p.code, value: p.name };
};
function instance$2($$self, $$props, $$invalidate) {
  let { context } = $$props;
  context.activeSystem;
  let availSystems = [];
  const nullpreview = new SystemPreview();
  let activePreview = nullpreview;
  let factory = null;
  onMount(() => {
    var _a;
    $$invalidate(1, availSystems = (_a = context.availablePreviews) !== null && _a !== void 0 ? _a : []);
    loadAllSystems();
  });
  function loadAllSystems() {
    return __awaiter(this, void 0, void 0, function* () {
      let response = yield context.API.getAllSystems();
      $$invalidate(0, context.availablePreviews = response.response, context);
      $$invalidate(1, availSystems = response.response);
    });
  }
  function unloadPreview() {
    $$invalidate(3, activePreview = nullpreview);
    $$invalidate(4, factory = null);
  }
  function onSelectSystem(d) {
    return __awaiter(this, void 0, void 0, function* () {
      const pre = availSystems.find((p) => p.code == d);
      if (activePreview == pre || !pre) {
        $$invalidate(3, activePreview = nullpreview);
        return false;
      }
      $$invalidate(3, activePreview = pre);
      let response = yield context.API.getFactory(activePreview);
      $$invalidate(4, factory = response.response);
      return true;
    });
  }
  let pagesContainer;
  let editPages = ["designer", "UI-designer"];
  let activeSubPage = "designer";
  function changePage(event) {
    $$invalidate(6, activeSubPage = event.detail);
  }
  nullpreview.isEditable = null;
  const func_1 = (e) => {
    onSelectSystem(e);
    return true;
  };
  function section_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      pagesContainer = $$value;
      $$invalidate(5, pagesContainer);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("context" in $$props2)
      $$invalidate(0, context = $$props2.context);
  };
  return [
    context,
    availSystems,
    nullpreview,
    activePreview,
    factory,
    pagesContainer,
    activeSubPage,
    unloadPreview,
    onSelectSystem,
    editPages,
    changePage,
    func_1,
    section_binding
  ];
}
class SystemPage extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$2, create_fragment$2, safe_not_equal, { context: 0 });
  }
}
const Designer_svelte_svelte_type_style_lang = "";
function add_css(target) {
  append_styles(target, "svelte-q6h4ep", "#MainAppContainer.svelte-q6h4ep{container-type:inline-size;min-height:inherit}");
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
    p: noop,
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
    p: noop,
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
    p: noop,
    i: noop,
    o: noop,
    d(detaching) {
      if (detaching)
        detach(p);
    }
  };
}
function create_if_block_1(ctx) {
  let div;
  let systempage;
  let div_transition;
  let current;
  systempage = new SystemPage({ props: { context: ctx[0] } });
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
    p(new_ctx, dirty) {
      ctx = new_ctx;
      const systempage_changes = {};
      if (dirty & 1)
        systempage_changes.context = ctx[0];
      systempage.$set(systempage_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(systempage.$$.fragment, local);
      add_render_callback(() => {
        if (!current)
          return;
        if (!div_transition)
          div_transition = create_bidirectional_transition(div, pageSlide, { parent: ctx[2] }, true);
        div_transition.run(1);
      });
      current = true;
    },
    o(local) {
      transition_out(systempage.$$.fragment, local);
      if (!div_transition)
        div_transition = create_bidirectional_transition(div, pageSlide, { parent: ctx[2] }, false);
      div_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_component(systempage);
      if (detaching && div_transition)
        div_transition.end();
    }
  };
}
function create_if_block(ctx) {
  let div;
  let homepage;
  let div_transition;
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
    p(new_ctx, dirty) {
      ctx = new_ctx;
    },
    i(local) {
      if (current)
        return;
      transition_in(homepage.$$.fragment, local);
      add_render_callback(() => {
        if (!current)
          return;
        if (!div_transition)
          div_transition = create_bidirectional_transition(div, pageSlide, { parent: ctx[2] }, true);
        div_transition.run(1);
      });
      current = true;
    },
    o(local) {
      transition_out(homepage.$$.fragment, local);
      if (!div_transition)
        div_transition = create_bidirectional_transition(div, pageSlide, { parent: ctx[2] }, false);
      div_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_component(homepage);
      if (detaching && div_transition)
        div_transition.end();
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
      title: "TTP-RPG System Designer",
      regularOptions: ["home", "system", "data tables", "export", "import"],
      startChosen: ctx[3]
    }
  });
  menu.$on("changePage", ctx[5]);
  const if_block_creators = [
    create_if_block,
    create_if_block_1,
    create_if_block_2,
    create_if_block_3,
    create_if_block_4
  ];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (ctx2[3] == "home")
      return 0;
    if (ctx2[3] == "system")
      return 1;
    if (ctx2[3] == "home1")
      return 2;
    if (ctx2[3] == "home2")
      return 3;
    if (ctx2[3] == "home3")
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
      div = claim_element(nodes, "DIV", { id: true, class: true });
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
      attr(div, "id", "MainAppContainer");
      attr(div, "class", "svelte-q6h4ep");
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      mount_component(menu, div, null);
      append_hydration(div, t);
      append_hydration(div, section);
      if (~current_block_type_index) {
        if_blocks[current_block_type_index].m(section, null);
      }
      ctx[6](section);
      ctx[7](div);
      current = true;
    },
    p(ctx2, [dirty]) {
      const menu_changes = {};
      if (dirty & 8)
        menu_changes.startChosen = ctx2[3];
      menu.$set(menu_changes);
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type(ctx2);
      if (current_block_type_index === previous_block_index) {
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].p(ctx2, dirty);
        }
      } else {
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
          } else {
            if_block.p(ctx2, dirty);
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
      ctx[6](null);
      ctx[7](null);
    }
  };
}
function instance$1($$self, $$props, $$invalidate) {
  let $page;
  let page = writable("system");
  component_subscribe($$self, page, (value2) => $$invalidate(3, $page = value2));
  let { context } = $$props;
  let mainAppContainer;
  function changePage(event) {
    page.set(event.detail);
  }
  onMount(() => {
    $$invalidate(0, context.mainAppContainer = mainAppContainer, context);
  });
  let pagesContainer;
  function section_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      pagesContainer = $$value;
      $$invalidate(2, pagesContainer);
    });
  }
  function div_binding($$value) {
    binding_callbacks[$$value ? "unshift" : "push"](() => {
      mainAppContainer = $$value;
      $$invalidate(1, mainAppContainer);
    });
  }
  $$self.$$set = ($$props2) => {
    if ("context" in $$props2)
      $$invalidate(0, context = $$props2.context);
  };
  return [
    context,
    mainAppContainer,
    pagesContainer,
    $page,
    page,
    changePage,
    section_binding,
    div_binding
  ];
}
class Designer extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, { context: 0 }, add_css);
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
  static async mkdir(path) {
    return await PluginHandler.App.vault.adapter.mkdir(path);
  }
  static async rmdir(path) {
    return await PluginHandler.App.vault.adapter.rmdir(path, true);
  }
  static async lsdir(path) {
    return await PluginHandler.App.vault.adapter.list(path);
  }
  static async exists(path) {
    return await PluginHandler.App.vault.adapter.exists(path, false);
  }
  static async saveFile(path, fileContent) {
    return await PluginHandler.App.vault.adapter.write(path, fileContent);
  }
  static async readFile(path) {
    return await PluginHandler.App.vault.adapter.read(path);
  }
  static async rm(path) {
    return await PluginHandler.App.vault.adapter.remove(path);
  }
  static async copy(path, newPath) {
    return await PluginHandler.App.vault.adapter.copy(path, newPath);
  }
};
let FileHandler = _FileHandler;
__publicField(FileHandler, "_instance");
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
class UILayoutModelSchemes {
}
__publicField(UILayoutModelSchemes, "BASE", BASE_SCHEME);
__publicField(UILayoutModelSchemes, "PAGE", "PAGE");
class UILayoutModel {
  constructor() {
    __publicField(this, "id", distExports.keyManagerInstance.getNewKey());
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
__decorateClass([
  JsonString({ scheme: [UILayoutModelSchemes.BASE, UILayoutModelSchemes.PAGE] })
], UILayoutModel.prototype, "guid", 2);
__decorateClass([
  JsonString({ scheme: [UILayoutModelSchemes.BASE] })
], UILayoutModel.prototype, "author", 2);
__decorateClass([
  JsonString({ scheme: [UILayoutModelSchemes.BASE] })
], UILayoutModel.prototype, "version", 2);
__decorateClass([
  JsonString({ scheme: [UILayoutModelSchemes.BASE, UILayoutModelSchemes.PAGE] })
], UILayoutModel.prototype, "name", 2);
__decorateClass([
  JsonString({ scheme: [UILayoutModelSchemes.BASE] })
], UILayoutModel.prototype, "mainStyle", 2);
__decorateClass([
  JsonString({ scheme: [UILayoutModelSchemes.BASE] })
], UILayoutModel.prototype, "componentJs", 2);
__decorateClass([
  JsonString({ scheme: [UILayoutModelSchemes.BASE] })
], UILayoutModel.prototype, "folderSrc", 2);
const _FileContext = class {
  constructor(pluginHandler) {
    __publicField(this, "path");
    __publicField(this, "pluginHandler");
    __publicField(this, "loadedSystem");
    __publicField(this, "foldersWithNoIndex");
    __publicField(this, "availableSystems");
    if (!this.pluginHandler && !pluginHandler) {
      console.error("First get instance of FileContext, must include a plugin handler");
    }
    this.pluginHandler = pluginHandler;
    this.path = PluginHandler.PLUGIN_ROOT + "/" + PluginHandler.SYSTEMS_FOLDER_NAME;
  }
  static getInstance(pluginHandler) {
    if (!_FileContext.instance) {
      _FileContext.instance = new _FileContext(pluginHandler);
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
    async function DFSCopyAllFolders(path, newPath) {
      let ls = await FileHandler.lsdir(path);
      await Promise.all(ls.folders.map(async (folderPath) => {
        let foldername = folderPath.split("/").last();
        let newFolderPath = newPath + "/" + foldername;
        FileHandler.mkdir(newFolderPath);
        await DFSCopyAllFolders(folderPath, newFolderPath);
      }));
    }
    async function BFSCopyAllFiles(path, newPath) {
      let ls = await FileHandler.lsdir(path);
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
    const path = PluginHandler.PLUGIN_ROOT + "/" + PluginHandler.BUILTIN_UIS_FOLDER_NAME + "/";
    let commands = [];
    let exists = await FileHandler.exists(path);
    if (!exists) {
      throw new Error("File for BlockUI have been deleted. this feature longer works as a result");
    }
    const content = await FileHandler.lsdir(path);
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
    let pathsrc = path + "/src/";
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
class ObsidianAPI {
  constructor(pluginHandler) {
    __publicField(this, "pluginHandler");
    this.pluginHandler = pluginHandler;
  }
  getSystemUIs(preview) {
    throw new Error("Method not implemented.");
  }
  getFactory(preview) {
    throw new Error("Method not implemented.");
  }
  async getAllSystems() {
    var _a;
    let messages = [];
    try {
      let fileContext = FileContext.getInstance(this.pluginHandler);
      await fileContext.loadAllAvailableFiles(messages);
      let previews = (_a = fileContext.availableSystems) != null ? _a : [];
      let response = {
        responseCode: 200,
        messages: [],
        response: previews
      };
      return response;
    } catch (e) {
      messages["exception"] = { msg: e.message, type: "error" };
      let response = {
        responseCode: 300,
        messages: ["could not load system previews"],
        response: []
      };
      return response;
    }
  }
}
function create_fragment(ctx) {
  let div;
  let designer;
  let current;
  designer = new Designer({ props: { context: ctx[0] } });
  return {
    c() {
      div = element("div");
      create_component(designer.$$.fragment);
      this.h();
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", { id: true });
      var div_nodes = children(div);
      claim_component(designer.$$.fragment, div_nodes);
      div_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div, "id", "SvelteContainerForTTPRPGSystem");
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      mount_component(designer, div, null);
      current = true;
    },
    p(ctx2, [dirty]) {
      const designer_changes = {};
      if (dirty & 1)
        designer_changes.context = ctx2[0];
      designer.$set(designer_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(designer.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(designer.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_component(designer);
    }
  };
}
function instance($$self, $$props, $$invalidate) {
  let { pluginHandler } = $$props;
  let context = new Layout01Context();
  let API = new ObsidianAPI(pluginHandler);
  context.API = API;
  $$self.$$set = ($$props2) => {
    if ("pluginHandler" in $$props2)
      $$invalidate(1, pluginHandler = $$props2.pluginHandler);
  };
  return [context, pluginHandler];
}
class App extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance, create_fragment, safe_not_equal, { pluginHandler: 1 });
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
  constructor(app, plugin) {
    super(app, plugin);
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
  constructor(app, plugin) {
    super(app);
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