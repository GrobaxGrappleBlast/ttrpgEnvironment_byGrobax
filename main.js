"use strict";
var __defProp2 = Object.defineProperty;
var __defNormalProp = (obj, key, value2) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value: value2 }) : obj[key] = value2;
var __publicField = (obj, key, value2) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value2);
  return value2;
};
const obsidian = require("obsidian");
require("events");
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
const Designer$1 = "";
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
function create_fragment$e(ctx) {
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
function instance$e($$self, $$props, $$invalidate) {
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
    init(this, options, instance$e, create_fragment$e, safe_not_equal, { color: 0 });
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
function create_if_block$5(ctx) {
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
function create_fragment$d(ctx) {
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
  let if_block = ctx[1] != null && create_if_block$5(ctx);
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
          if_block = create_if_block$5(ctx2);
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
function instance$d($$self, $$props, $$invalidate) {
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
    init(this, options, instance$d, create_fragment$d, safe_not_equal, {
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
class Layout01Context {
  constructor() {
    __publicField(this, "activeSystem");
    __publicField(this, "availablePreviews");
    __publicField(this, "API");
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
      var node = new index_2.GrobDerivedNode(name, col);
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
      var node = new index_1.GrobFixedNode(name, col);
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
  AGrobNode2.prototype.setName = function(name) {
    var oldname = this.getName();
    _super2.prototype.setName.call(this, name);
    this.parent.update_node_name(oldname, name);
    this.updateLocation(this.parent);
  };
  AGrobNode2.prototype.updateLocation = function(parent) {
    this.parent = parent;
    for (var key in this.dependents) {
      var dep = this.dependents[key];
      dep.updateDependecysLocation(this);
    }
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
class UpdateListener {
  constructor() {
    __publicField(this, "guid", StringFunctions.uuidv4());
    __publicField(this, "listenersKeyed", {});
    __publicField(this, "listenersEvents", {});
  }
  callUpdateListeners(event) {
    for (let key in Object.keys(this.listenersEvents[event])) {
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
    let events = Object.keys(this.listenersKeyed[key]);
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
      uigrp.addEventListener(this.guid, "validChange", this.update.bind(this));
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
      this.callUpdateListeners("validChange");
    }
  }
  addCollection(group) {
  }
  remCollection(group) {
  }
  updCollection(group) {
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
      const uicol = new UICollection(this.sys, col);
      this.collections.push(uicol);
      isValid = isValid && uicol.valid;
      uicol.addEventListener(this.key, "validChange", this.isValidUpdate.bind(this));
    }
    this.valid = isValid;
  }
  isValidUpdate() {
    let orig = this.valid;
    var isValid = true;
    this.collections.forEach((p) => {
      isValid = isValid && p.valid;
    });
    this.valid = isValid;
    if (orig != this.valid) {
      this.callUpdateListeners("validChange");
    }
  }
  update() {
    this.key = this.link.getKey();
    this.name = this.link.getName();
    this.nameEdit = this.link.getName();
    this.isValidUpdate();
  }
  dispose() {
    this.removeAllEventListeners();
    this.collections.forEach((n) => n.dispose());
    this.link = null;
    this.sys = null;
    this.collections = [];
  }
}
class UICollection extends UpdateListener {
  constructor(system, col) {
    super();
    __publicField(this, "sys");
    __publicField(this, "link");
    __publicField(this, "nodes", []);
    __publicField(this, "key");
    __publicField(this, "name");
    __publicField(this, "nameEdit");
    __publicField(this, "valid");
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
      const uinode = new UINode(this.sys, node);
      this.nodes.push(uinode);
      isValid = isValid && uinode.valid;
      uinode.addEventListener(this.key, "validChange", this.isValidUpdate.bind(this));
    }
    this.link.addUpdateListener(this.key, this.update.bind(this));
    this.valid = isValid;
  }
  isValidUpdate() {
    var orig = this.valid;
    var isValid = true;
    this.nodes.forEach((p) => {
      isValid = isValid && p.valid;
    });
    this.valid = isValid;
    if (orig != this.valid) {
      this.callUpdateListeners("validChange");
    }
  }
  update() {
    this.key = this.link.getKey();
    this.name = this.link.getName();
    this.nameEdit = this.link.getName();
    this.isValidUpdate();
  }
  dispose() {
    this.link.removeUpdateListener(this.key);
    this.removeAllEventListeners();
    this.nodes.forEach((n) => n.dispose());
    this.link = null;
    this.sys = null;
    this.nodes = [];
  }
}
class UINode extends UpdateListener {
  constructor(system, node) {
    super();
    __publicField(this, "sys");
    __publicField(this, "link");
    __publicField(this, "key");
    __publicField(this, "name");
    __publicField(this, "nameEdit");
    __publicField(this, "valid");
    this.link = node;
    this.sys = system;
    this.key = node.getKey();
    this.name = node.getName();
    this.nameEdit = node.getName();
    this.valid = node.isValid();
    this.link.addUpdateListener(this.key, this.update.bind(this));
  }
  update() {
    let validOrig = this.valid;
    this.key = this.link.getKey();
    this.name = this.link.getName();
    this.nameEdit = this.link.getName();
    this.valid = this.link.isValid();
    if (validOrig != this.valid) {
      this.callUpdateListeners("validChange");
    }
  }
  dispose() {
    this.removeAllEventListeners();
    this.link.removeUpdateListener(this.key);
    this.link = null;
    this.sys = null;
  }
}
function create_fragment$c(ctx) {
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
function instance$c($$self, $$props, $$invalidate) {
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
    init(this, options, instance$c, create_fragment$c, safe_not_equal, { color: 0 });
  }
}
function create_fragment$b(ctx) {
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
function instance$b($$self, $$props, $$invalidate) {
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
    init(this, options, instance$b, create_fragment$b, safe_not_equal, { color: 0 });
  }
}
function create_fragment$a(ctx) {
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
function instance$a($$self, $$props, $$invalidate) {
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
    init(this, options, instance$a, create_fragment$a, safe_not_equal, { color: 0 });
  }
}
function create_fragment$9(ctx) {
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
function instance$9($$self, $$props, $$invalidate) {
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
    init(this, options, instance$9, create_fragment$9, safe_not_equal, { color: 0 });
  }
}
const toolTip = "";
function create_if_block$4(ctx) {
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
function create_fragment$8(ctx) {
  let div;
  let current;
  let if_block = ctx[4] && create_if_block$4(ctx);
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
          if_block = create_if_block$4(ctx2);
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
function instance$8($$self, $$props, $$invalidate) {
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
    init(this, options, instance$8, create_fragment$8, safe_not_equal, { text: 0, animX: 1, animY: 2, type: 3 });
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
function get_each_context$1(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[29] = list[i];
  child_ctx[31] = list;
  child_ctx[32] = i;
  const constants_0 = !child_ctx[6] && child_ctx[5] != null && !child_ctx[8];
  child_ctx[30] = constants_0;
  return child_ctx;
}
function create_if_block_3$1(ctx) {
  let div;
  let t0;
  let t1;
  let div_transition;
  let current;
  let if_block0 = ctx[4] != null && create_if_block_6(ctx);
  let if_block1 = ctx[2] != null && create_if_block_5(ctx);
  let if_block2 = ctx[3] != null && create_if_block_4$1(ctx);
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
          if (dirty[0] & 16) {
            transition_in(if_block0, 1);
          }
        } else {
          if_block0 = create_if_block_6(ctx2);
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
          if (dirty[0] & 4) {
            transition_in(if_block1, 1);
          }
        } else {
          if_block1 = create_if_block_5(ctx2);
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
          if (dirty[0] & 8) {
            transition_in(if_block2, 1);
          }
        } else {
          if_block2 = create_if_block_4$1(ctx2);
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
      transition_out(if_block0);
      transition_out(if_block1);
      transition_out(if_block2);
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
      if (if_block0)
        if_block0.d();
      if (if_block1)
        if_block1.d();
      if (if_block2)
        if_block2.d();
      if (detaching && div_transition)
        div_transition.end();
    }
  };
}
function create_if_block_6(ctx) {
  let current_block_type_index;
  let if_block;
  let if_block_anchor;
  let current;
  const if_block_creators = [create_if_block_7, create_else_block_2];
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
function create_else_block_2(ctx) {
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
function create_if_block_7(ctx) {
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
function create_if_block_5(ctx) {
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
          listen(imageContainer, "click", ctx[22]),
          listen(imageContainer, "keyup", ctx[21]),
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
function create_if_block_4$1(ctx) {
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
          listen(imageContainer, "click", ctx[23]),
          listen(imageContainer, "keyup", ctx[20]),
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
function create_else_block_1(ctx) {
  let div;
  let mounted;
  let dispose;
  function div_input_handler() {
    ctx[25].call(div, ctx[31], ctx[32]);
  }
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
      if (ctx[29].nameEdit === void 0)
        add_render_callback(div_input_handler);
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      if (ctx[29].nameEdit !== void 0) {
        div.textContent = ctx[29].nameEdit;
      }
      div.focus();
      if (!mounted) {
        dispose = [
          listen(div, "focus", onEditFocus),
          listen(div, "input", div_input_handler)
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & 1 && ctx[29].nameEdit !== div.textContent) {
        div.textContent = ctx[29].nameEdit;
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
function create_if_block_2$1(ctx) {
  let div;
  let t_value = ctx[29].name + "";
  let t;
  let mounted;
  let dispose;
  function click_handler_2() {
    return ctx[24](ctx[29]);
  }
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
          listen(div, "click", click_handler_2),
          listen(div, "keyup", ctx[19])
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
      if (dirty[0] & 1 && t_value !== (t_value = ctx[29].name + ""))
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
function create_else_block(ctx) {
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
function create_if_block_1$1(ctx) {
  let imageContainer;
  let image_minus;
  let imageContainer_transition;
  let current;
  let mounted;
  let dispose;
  image_minus = new Minus({ props: { color: "white" } });
  function click_handler_4() {
    return ctx[27](ctx[29]);
  }
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
          listen(imageContainer, "click", click_handler_4),
          listen(imageContainer, "keyup", ctx[18]),
          action_destroyer(tooltip.call(null, imageContainer, { text: "Delete item", type: "verbose" }))
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
    },
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
function create_if_block$3(ctx) {
  let imageContainer;
  let image_trash;
  let imageContainer_transition;
  let current;
  let mounted;
  let dispose;
  image_trash = new Trash({ props: { color: "white" } });
  function click_handler_3() {
    return ctx[26](ctx[29]);
  }
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
          listen(imageContainer, "click", click_handler_3),
          listen(imageContainer, "keyup", ctx[17]),
          action_destroyer(tooltip.call(null, imageContainer, { text: "Delete item", type: "verbose" }))
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
    },
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
function create_each_block$1(key_1, ctx) {
  let div1;
  let t0;
  let div0;
  let current_block_type_index;
  let if_block1;
  let t1;
  let div1_data_selected_value;
  let div1_data_isedit_value;
  let div1_transition;
  let current;
  function select_block_type_1(ctx2, dirty) {
    if (!ctx2[8])
      return create_if_block_2$1;
    return create_else_block_1;
  }
  let current_block_type = select_block_type_1(ctx);
  let if_block0 = current_block_type(ctx);
  const if_block_creators = [create_if_block$3, create_if_block_1$1, create_else_block];
  const if_blocks = [];
  function select_block_type_2(ctx2, dirty) {
    if (ctx2[30])
      return 0;
    if (ctx2[8] && ctx2[29].name != ctx2[29].nameEdit)
      return 1;
    return 2;
  }
  current_block_type_index = select_block_type_2(ctx);
  if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
  return {
    key: key_1,
    first: null,
    c() {
      div1 = element("div");
      if_block0.c();
      t0 = space();
      div0 = element("div");
      if_block1.c();
      t1 = space();
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
      t0 = claim_space(div1_nodes);
      div0 = claim_element(div1_nodes, "DIV", {});
      var div0_nodes = children(div0);
      if_block1.l(div0_nodes);
      div0_nodes.forEach(detach);
      t1 = claim_space(div1_nodes);
      div1_nodes.forEach(detach);
      this.h();
    },
    h() {
      var _a;
      attr(div1, "class", "Editable_row");
      attr(div1, "data-selected", div1_data_selected_value = !ctx[8] && ctx[29].key == ((_a = ctx[7]) == null ? void 0 : _a.key));
      attr(div1, "data-can-hover", true);
      attr(div1, "data-isedit", div1_data_isedit_value = ctx[8] && ctx[29].name != ctx[29].nameEdit);
      this.first = div1;
    },
    m(target, anchor) {
      insert_hydration(target, div1, anchor);
      if_block0.m(div1, null);
      append_hydration(div1, t0);
      append_hydration(div1, div0);
      if_blocks[current_block_type_index].m(div0, null);
      append_hydration(div1, t1);
      current = true;
    },
    p(new_ctx, dirty) {
      var _a;
      ctx = new_ctx;
      if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
        if_block0.p(ctx, dirty);
      } else {
        if_block0.d(1);
        if_block0 = current_block_type(ctx);
        if (if_block0) {
          if_block0.c();
          if_block0.m(div1, t0);
        }
      }
      let previous_block_index = current_block_type_index;
      current_block_type_index = select_block_type_2(ctx);
      if (current_block_type_index === previous_block_index) {
        if_blocks[current_block_type_index].p(ctx, dirty);
      } else {
        group_outros();
        transition_out(if_blocks[previous_block_index], 1, 1, () => {
          if_blocks[previous_block_index] = null;
        });
        check_outros();
        if_block1 = if_blocks[current_block_type_index];
        if (!if_block1) {
          if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
          if_block1.c();
        } else {
          if_block1.p(ctx, dirty);
        }
        transition_in(if_block1, 1);
        if_block1.m(div0, null);
      }
      if (!current || dirty[0] & 385 && div1_data_selected_value !== (div1_data_selected_value = !ctx[8] && ctx[29].key == ((_a = ctx[7]) == null ? void 0 : _a.key))) {
        attr(div1, "data-selected", div1_data_selected_value);
      }
      if (!current || dirty[0] & 257 && div1_data_isedit_value !== (div1_data_isedit_value = ctx[8] && ctx[29].name != ctx[29].nameEdit)) {
        attr(div1, "data-isedit", div1_data_isedit_value);
      }
    },
    i(local) {
      if (current)
        return;
      transition_in(if_block1);
      if (local) {
        add_render_callback(() => {
          if (!current)
            return;
          if (!div1_transition)
            div1_transition = create_bidirectional_transition(div1, slide, {}, true);
          div1_transition.run(1);
        });
      }
      current = true;
    },
    o(local) {
      transition_out(if_block1);
      if (local) {
        if (!div1_transition)
          div1_transition = create_bidirectional_transition(div1, slide, {}, false);
        div1_transition.run(0);
      }
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div1);
      if_block0.d();
      if_blocks[current_block_type_index].d();
      if (detaching && div1_transition)
        div1_transition.end();
    }
  };
}
function create_fragment$7(ctx) {
  let div;
  let t;
  let each_blocks = [];
  let each_1_lookup = /* @__PURE__ */ new Map();
  let div_class_value;
  let current;
  let if_block = !ctx[6] && create_if_block_3$1(ctx);
  let each_value = ctx[0];
  const get_key = (ctx2) => ctx2[29].key;
  for (let i = 0; i < each_value.length; i += 1) {
    let child_ctx = get_each_context$1(ctx, each_value, i);
    let key = get_key(child_ctx);
    each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
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
    p(ctx2, dirty) {
      if (!ctx2[6]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty[0] & 64) {
            transition_in(if_block, 1);
          }
        } else {
          if_block = create_if_block_3$1(ctx2);
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
      if (dirty[0] & 9185) {
        each_value = ctx2[0];
        group_outros();
        each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx2, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
        check_outros();
      }
      if (!current || dirty[0] & 2 && div_class_value !== (div_class_value = ctx2[1] ? "GrobsInteractiveContainer editableTable" : "editableTable")) {
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
function instance$7($$self, $$props, $$invalidate) {
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
  function keyup_handler_3(event) {
    bubble.call(this, $$self, event);
  }
  function keyup_handler_4(event) {
    bubble.call(this, $$self, event);
  }
  function keyup_handler_2(event) {
    bubble.call(this, $$self, event);
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
  const click_handler_2 = (element2) => {
    if (disabled) {
      return;
    }
    _onSelect(element2);
  };
  function div_input_handler(each_value, i) {
    each_value[i].nameEdit = this.textContent;
    $$invalidate(0, collection);
  }
  const click_handler_3 = (element2) => onDelete(element2);
  const click_handler_4 = (element2) => onEditCancelSingle(element2);
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
    keyup_handler_3,
    keyup_handler_4,
    keyup_handler_2,
    keyup_handler_1,
    keyup_handler,
    click_handler,
    click_handler_1,
    click_handler_2,
    div_input_handler,
    click_handler_3,
    click_handler_4
  ];
}
class EditAbleList2 extends SvelteComponent {
  constructor(options) {
    super();
    init(
      this,
      options,
      instance$7,
      create_fragment$7,
      safe_not_equal,
      {
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
      },
      null,
      [-1, -1]
    );
  }
  get deselect() {
    return this.$$.ctx[15];
  }
  get select() {
    return this.$$.ctx[16];
  }
}
function create_if_block$2(ctx) {
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
function create_fragment$6(ctx) {
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
  let if_block = ctx[2] && create_if_block$2(ctx);
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
          if_block = create_if_block$2(ctx2);
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
function instance$6($$self, $$props, $$invalidate) {
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
    init(this, options, instance$6, create_fragment$6, safe_not_equal, { title: 0, toogle: 1 });
  }
  get toogle() {
    return this.$$.ctx[1];
  }
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
  let current;
  editablelist20 = new EditAbleList2({
    props: {
      collection: (_b = (_a = ctx[3]) == null ? void 0 : _a.collections) != null ? _b : [],
      onSelect: ctx[7],
      onAdd: func_1,
      onUpdateItem: func_2,
      onDeleteItem: func_3
    }
  });
  editablelist20.$on("onDeSelect", onDeSelect_handler);
  editablelist21 = new EditAbleList2({
    props: {
      collection: (_d = (_c = ctx[1]) == null ? void 0 : _c.nodes) != null ? _d : [],
      onSelect: ctx[8],
      onAdd: func_5,
      onUpdateItem: func_6,
      onDeleteItem: func_7
    }
  });
  editablelist21.$on("onDeSelect", ctx[9]);
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
      this.h();
    },
    h() {
      set_style(div1, "display", "grid");
      set_style(div1, "grid-template-columns", "1fr 1fr");
      set_style(div1, "gap", "10px");
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
      current = true;
    },
    p(ctx2, dirty) {
      var _a2, _b2;
      const editablelist21_changes = {};
      if (dirty & 2)
        editablelist21_changes.collection = (_b2 = (_a2 = ctx2[1]) == null ? void 0 : _a2.nodes) != null ? _b2 : [];
      editablelist21.$set(editablelist21_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(editablelist20.$$.fragment, local);
      transition_in(editablelist21.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(editablelist20.$$.fragment, local);
      transition_out(editablelist21.$$.fragment, local);
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
  let current;
  editablelist20 = new EditAbleList2({
    props: {
      collection: (_b = (_a = ctx[2]) == null ? void 0 : _a.collections) != null ? _b : [],
      onSelect: ctx[10],
      onAdd: func_9,
      onUpdateItem: func_10,
      onDeleteItem: func_11
    }
  });
  editablelist20.$on("onDeSelect", ctx[11]);
  editablelist21 = new EditAbleList2({
    props: {
      collection: (_d = (_c = ctx[0]) == null ? void 0 : _c.nodes) != null ? _d : [],
      onSelect: ctx[12],
      onAdd: func_13,
      onUpdateItem: func_14,
      onDeleteItem: func_15
    }
  });
  editablelist21.$on("onDeSelect", onDeSelect_handler_3);
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
      this.h();
    },
    h() {
      set_style(div1, "display", "grid");
      set_style(div1, "grid-template-columns", "1fr 1fr");
      set_style(div1, "gap", "10px");
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
      current = true;
    },
    p(ctx2, dirty) {
      var _a2, _b2;
      const editablelist21_changes = {};
      if (dirty & 1)
        editablelist21_changes.collection = (_b2 = (_a2 = ctx2[0]) == null ? void 0 : _a2.nodes) != null ? _b2 : [];
      editablelist21.$set(editablelist21_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(editablelist20.$$.fragment, local);
      transition_in(editablelist21.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(editablelist20.$$.fragment, local);
      transition_out(editablelist21.$$.fragment, local);
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
    }
  };
}
function create_fragment$5(ctx) {
  let div;
  let tooglesection0;
  let t;
  let tooglesection1;
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
    p(ctx2, [dirty]) {
      const tooglesection0_changes = {};
      if (dirty & 4194306) {
        tooglesection0_changes.$$scope = { dirty, ctx: ctx2 };
      }
      tooglesection0.$set(tooglesection0_changes);
      const tooglesection1_changes = {};
      if (dirty & 4194305) {
        tooglesection1_changes.$$scope = { dirty, ctx: ctx2 };
      }
      tooglesection1.$set(tooglesection1_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(tooglesection0.$$.fragment, local);
      transition_in(tooglesection1.$$.fragment, local);
      current = true;
    },
    o(local) {
      transition_out(tooglesection0.$$.fragment, local);
      transition_out(tooglesection1.$$.fragment, local);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      destroy_component(tooglesection0);
      destroy_component(tooglesection1);
    }
  };
}
const func_1 = () => {
  return true;
};
const func_2 = () => {
  return true;
};
const func_3 = (e) => {
  return true;
};
const onDeSelect_handler = () => {
};
const func_5 = () => {
  return true;
};
const func_6 = () => {
  return true;
};
const func_7 = (e) => {
  return true;
};
const func_9 = () => {
  return true;
};
const func_10 = () => {
  return true;
};
const func_11 = (e) => {
  return true;
};
const func_13 = () => {
  return true;
};
const func_14 = () => {
  return true;
};
const func_15 = (e) => {
  return true;
};
const onDeSelect_handler_3 = () => {
};
function instance$5($$self, $$props, $$invalidate) {
  let { system } = $$props;
  let uiSystem = new UISystem(system);
  let derivedGrp = uiSystem.groups.find((p) => p.name == "derived");
  let fixedGrp = uiSystem.groups.find((p) => p.name == "fixed");
  let derivedCol = null;
  let fixedCol = null;
  function _colSelect(grp, col) {
    if (grp == "derived") {
      $$invalidate(0, derivedCol = col);
    } else {
      $$invalidate(1, fixedCol = col);
    }
  }
  function _nodSelect(grp, nod) {
  }
  const func2 = (e) => {
    _colSelect("fixed", e);
    return true;
  };
  const func_4 = (e) => {
    return true;
  };
  const onDeSelect_handler_1 = () => {
    _colSelect("fixed", null);
  };
  const func_8 = (e) => {
    _colSelect("derived", e);
    return true;
  };
  const onDeSelect_handler_2 = () => {
    _colSelect("derived", null);
  };
  const func_12 = (e) => {
    return true;
  };
  $$self.$$set = ($$props2) => {
    if ("system" in $$props2)
      $$invalidate(6, system = $$props2.system);
  };
  return [
    derivedCol,
    fixedCol,
    derivedGrp,
    fixedGrp,
    _colSelect,
    _nodSelect,
    system,
    func2,
    func_4,
    onDeSelect_handler_1,
    func_8,
    onDeSelect_handler_2,
    func_12
  ];
}
class SystemDesigner3Parts extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$5, create_fragment$5, safe_not_equal, { system: 6 });
  }
}
function create_if_block$1(ctx) {
  let section;
  let div;
  let systemdesigner3parts;
  let section_transition;
  let current;
  systemdesigner3parts = new SystemDesigner3Parts({ props: { system: ctx[2] } });
  return {
    c() {
      section = element("section");
      div = element("div");
      create_component(systemdesigner3parts.$$.fragment);
    },
    l(nodes) {
      section = claim_element(nodes, "SECTION", {});
      var section_nodes = children(section);
      div = claim_element(section_nodes, "DIV", {});
      var div_nodes = children(div);
      claim_component(systemdesigner3parts.$$.fragment, div_nodes);
      div_nodes.forEach(detach);
      section_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, section, anchor);
      append_hydration(section, div);
      mount_component(systemdesigner3parts, div, null);
      current = true;
    },
    p(ctx2, dirty) {
      const systemdesigner3parts_changes = {};
      if (dirty & 4)
        systemdesigner3parts_changes.system = ctx2[2];
      systemdesigner3parts.$set(systemdesigner3parts_changes);
    },
    i(local) {
      if (current)
        return;
      transition_in(systemdesigner3parts.$$.fragment, local);
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
      transition_out(systemdesigner3parts.$$.fragment, local);
      if (!section_transition)
        section_transition = create_bidirectional_transition(section, slide, {}, false);
      section_transition.run(0);
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(section);
      destroy_component(systemdesigner3parts);
      if (detaching && section_transition)
        section_transition.end();
    }
  };
}
function create_fragment$4(ctx) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
  let div20;
  let section;
  let div18;
  let div2;
  let div0;
  let t0;
  let t1;
  let div1;
  let t2_value = ((_b = (_a = ctx[1]) == null ? void 0 : _a.author) != null ? _b : unknownString) + "";
  let t2;
  let t3;
  let div5;
  let div3;
  let t4;
  let t5;
  let div4;
  let t6_value = ((_d = (_c = ctx[1]) == null ? void 0 : _c.version) != null ? _d : unknownString) + "";
  let t6;
  let t7;
  let div8;
  let div6;
  let t8;
  let t9;
  let div7;
  let t10_value = ((_f = (_e = ctx[1]) == null ? void 0 : _e.code) != null ? _f : unknownString) + "";
  let t10;
  let t11;
  let div11;
  let div9;
  let t12;
  let t13;
  let div10;
  let t14_value = ((_h = (_g = ctx[1]) == null ? void 0 : _g.isEditable) != null ? _h : unknownString) + "";
  let t14;
  let t15;
  let div14;
  let div12;
  let t16;
  let t17;
  let div13;
  let t18_value = ((_j = (_i = ctx[1]) == null ? void 0 : _i.name) != null ? _j : unknownString) + "";
  let t18;
  let t19;
  let div17;
  let div15;
  let t20;
  let t21;
  let div16;
  let t22_value = ((_l = (_k = ctx[1]) == null ? void 0 : _k.folderName) != null ? _l : unknownString) + "";
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
      collection: (_n = (_m = ctx[0]) == null ? void 0 : _m.map(func)) != null ? _n : [],
      onSelect: ctx[6]
    }
  });
  editablelist.$on("onDeSelect", ctx[3]);
  let if_block = ctx[2] && create_if_block$1(ctx);
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
      if ((!current || dirty & 2) && t2_value !== (t2_value = ((_b2 = (_a2 = ctx2[1]) == null ? void 0 : _a2.author) != null ? _b2 : unknownString) + ""))
        set_data(t2, t2_value);
      if ((!current || dirty & 2) && t6_value !== (t6_value = ((_d2 = (_c2 = ctx2[1]) == null ? void 0 : _c2.version) != null ? _d2 : unknownString) + ""))
        set_data(t6, t6_value);
      if ((!current || dirty & 2) && t10_value !== (t10_value = ((_f2 = (_e2 = ctx2[1]) == null ? void 0 : _e2.code) != null ? _f2 : unknownString) + ""))
        set_data(t10, t10_value);
      if ((!current || dirty & 2) && t14_value !== (t14_value = ((_h2 = (_g2 = ctx2[1]) == null ? void 0 : _g2.isEditable) != null ? _h2 : unknownString) + ""))
        set_data(t14, t14_value);
      if ((!current || dirty & 2) && t18_value !== (t18_value = ((_j2 = (_i2 = ctx2[1]) == null ? void 0 : _i2.name) != null ? _j2 : unknownString) + ""))
        set_data(t18, t18_value);
      if ((!current || dirty & 2) && t22_value !== (t22_value = ((_l2 = (_k2 = ctx2[1]) == null ? void 0 : _k2.folderName) != null ? _l2 : unknownString) + ""))
        set_data(t22, t22_value);
      const editablelist_changes = {};
      if (dirty & 1)
        editablelist_changes.collection = (_n2 = (_m2 = ctx2[0]) == null ? void 0 : _m2.map(func)) != null ? _n2 : [];
      editablelist.$set(editablelist_changes);
      if (ctx2[2]) {
        if (if_block) {
          if_block.p(ctx2, dirty);
          if (dirty & 4) {
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
function instance$4($$self, $$props, $$invalidate) {
  let { context } = $$props;
  context.activeSystem;
  let availSystems = [];
  const nullpreview = new SystemPreview();
  let activePreview = nullpreview;
  let factory = null;
  onMount(() => {
    var _a;
    $$invalidate(0, availSystems = (_a = context.availablePreviews) !== null && _a !== void 0 ? _a : []);
    loadAllSystems();
  });
  function loadAllSystems() {
    return __awaiter(this, void 0, void 0, function* () {
      let response = yield context.API.getAllSystems();
      $$invalidate(5, context.availablePreviews = response.response, context);
      $$invalidate(0, availSystems = response.response);
    });
  }
  function unloadPreview() {
    $$invalidate(1, activePreview = nullpreview);
  }
  function onSelectSystem(d) {
    return __awaiter(this, void 0, void 0, function* () {
      const pre = availSystems.find((p) => p.code == d);
      if (activePreview == pre || !pre) {
        $$invalidate(1, activePreview = nullpreview);
        return false;
      }
      $$invalidate(1, activePreview = pre);
      let response = yield context.API.getFactory(activePreview);
      $$invalidate(2, factory = response.response);
      return true;
    });
  }
  nullpreview.isEditable = null;
  const func_12 = (e) => {
    onSelectSystem(e);
    return true;
  };
  $$self.$$set = ($$props2) => {
    if ("context" in $$props2)
      $$invalidate(5, context = $$props2.context);
  };
  return [
    availSystems,
    activePreview,
    factory,
    unloadPreview,
    onSelectSystem,
    context,
    func_12
  ];
}
class SystemPage extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$4, create_fragment$4, safe_not_equal, { context: 5 });
  }
}
function create_fragment$3(ctx) {
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
function instance$3($$self, $$props, $$invalidate) {
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
    init(this, options, instance$3, create_fragment$3, safe_not_equal, {
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
function get_each_context(ctx, list, i) {
  const child_ctx = ctx.slice();
  child_ctx[10] = list[i];
  child_ctx[11] = list;
  child_ctx[12] = i;
  return child_ctx;
}
function create_each_block(ctx) {
  let menubtn;
  let i = ctx[12];
  let current;
  const assign_menubtn = () => ctx[6](menubtn, i);
  const unassign_menubtn = () => ctx[6](null, i);
  function click_handler() {
    return ctx[7](ctx[12]);
  }
  let menubtn_props = {
    special: ctx[0].includes(ctx[10]),
    title: ctx[10]
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
      if (dirty & 4)
        menubtn_changes.title = ctx[10];
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
function create_fragment$2(ctx) {
  let div7;
  let div6;
  let p;
  let t0;
  let t1;
  let div5;
  let div0;
  let t2;
  let div1;
  let t3;
  let div2;
  let t4;
  let div3;
  let t5;
  let div4;
  let t6;
  let section;
  let current;
  let each_value = ctx[2];
  let each_blocks = [];
  for (let i = 0; i < each_value.length; i += 1) {
    each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
  }
  const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
    each_blocks[i] = null;
  });
  return {
    c() {
      div7 = element("div");
      div6 = element("div");
      p = element("p");
      t0 = text("TTP-RPG System Designer");
      t1 = space();
      div5 = element("div");
      div0 = element("div");
      t2 = space();
      div1 = element("div");
      t3 = space();
      div2 = element("div");
      t4 = space();
      div3 = element("div");
      t5 = space();
      div4 = element("div");
      t6 = space();
      section = element("section");
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].c();
      }
      this.h();
    },
    l(nodes) {
      div7 = claim_element(nodes, "DIV", { class: true });
      var div7_nodes = children(div7);
      div6 = claim_element(div7_nodes, "DIV", { class: true });
      var div6_nodes = children(div6);
      p = claim_element(div6_nodes, "P", {});
      var p_nodes = children(p);
      t0 = claim_text(p_nodes, "TTP-RPG System Designer");
      p_nodes.forEach(detach);
      t1 = claim_space(div6_nodes);
      div5 = claim_element(div6_nodes, "DIV", { class: true });
      var div5_nodes = children(div5);
      div0 = claim_element(div5_nodes, "DIV", {});
      children(div0).forEach(detach);
      t2 = claim_space(div5_nodes);
      div1 = claim_element(div5_nodes, "DIV", {});
      children(div1).forEach(detach);
      t3 = claim_space(div5_nodes);
      div2 = claim_element(div5_nodes, "DIV", {});
      children(div2).forEach(detach);
      t4 = claim_space(div5_nodes);
      div3 = claim_element(div5_nodes, "DIV", {});
      children(div3).forEach(detach);
      t5 = claim_space(div5_nodes);
      div4 = claim_element(div5_nodes, "DIV", {});
      children(div4).forEach(detach);
      div5_nodes.forEach(detach);
      div6_nodes.forEach(detach);
      t6 = claim_space(div7_nodes);
      section = claim_element(div7_nodes, "SECTION", { class: true });
      var section_nodes = children(section);
      for (let i = 0; i < each_blocks.length; i += 1) {
        each_blocks[i].l(section_nodes);
      }
      section_nodes.forEach(detach);
      div7_nodes.forEach(detach);
      this.h();
    },
    h() {
      attr(div5, "class", "colorscheme");
      attr(div6, "class", "MenuTitle");
      attr(section, "class", "MenuBtnContainer");
      attr(div7, "class", "Menu");
    },
    m(target, anchor) {
      insert_hydration(target, div7, anchor);
      append_hydration(div7, div6);
      append_hydration(div6, p);
      append_hydration(p, t0);
      append_hydration(div6, t1);
      append_hydration(div6, div5);
      append_hydration(div5, div0);
      append_hydration(div5, t2);
      append_hydration(div5, div1);
      append_hydration(div5, t3);
      append_hydration(div5, div2);
      append_hydration(div5, t4);
      append_hydration(div5, div3);
      append_hydration(div5, t5);
      append_hydration(div5, div4);
      append_hydration(div7, t6);
      append_hydration(div7, section);
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
          const child_ctx = get_each_context(ctx2, each_value, i);
          if (each_blocks[i]) {
            each_blocks[i].p(child_ctx, dirty);
            transition_in(each_blocks[i], 1);
          } else {
            each_blocks[i] = create_each_block(child_ctx);
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
        detach(div7);
      destroy_each(each_blocks, detaching);
    }
  };
}
function instance$2($$self, $$props, $$invalidate) {
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
    init(this, options, instance$2, create_fragment$2, safe_not_equal, {
      regularOptions: 4,
      specialOptions: 0,
      startChosen: 5
    });
  }
}
function slidefade(node, params) {
  const existingTransform = getComputedStyle(node).transform.replace("none", "");
  return {
    delay: params.delay || 0,
    duration: params.duration || 400,
    easing: params.easing || cubicOut,
    css: (t, u) => `transform-origin: top left; transform: ${existingTransform} scaleY(${t}); opacity: ${t};`
  };
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
  let div_intro;
  let div_outro;
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
    p(ctx2, dirty) {
      const systempage_changes = {};
      if (dirty & 1)
        systempage_changes.context = ctx2[0];
      systempage.$set(systempage_changes);
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
        div_intro = create_in_transition(div, slidefade, { x: 100 });
        div_intro.start();
      });
      current = true;
    },
    o(local) {
      transition_out(systempage.$$.fragment, local);
      if (div_intro)
        div_intro.invalidate();
      div_outro = create_out_transition(div, slidefade, { x: -100 });
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
function create_if_block(ctx) {
  let div;
  let div_intro;
  let div_outro;
  let current;
  return {
    c() {
      div = element("div");
    },
    l(nodes) {
      div = claim_element(nodes, "DIV", {});
      var div_nodes = children(div);
      div_nodes.forEach(detach);
    },
    m(target, anchor) {
      insert_hydration(target, div, anchor);
      current = true;
    },
    p: noop,
    i(local) {
      if (current)
        return;
      add_render_callback(() => {
        if (!current)
          return;
        if (div_outro)
          div_outro.end(1);
        div_intro = create_in_transition(div, slidefade, { x: 100 });
        div_intro.start();
      });
      current = true;
    },
    o(local) {
      if (div_intro)
        div_intro.invalidate();
      div_outro = create_out_transition(div, slidefade, { x: -100 });
      current = false;
    },
    d(detaching) {
      if (detaching)
        detach(div);
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
      regularOptions: ["home", "system", "data tables", "export", "import"],
      startChosen: ctx[1]
    }
  });
  menu.$on("changePage", ctx[3]);
  const if_block_creators = [
    create_if_block,
    create_if_block_1,
    create_if_block_2,
    create_if_block_3,
    create_if_block_4
  ];
  const if_blocks = [];
  function select_block_type(ctx2, dirty) {
    if (ctx2[1] == "home")
      return 0;
    if (ctx2[1] == "system")
      return 1;
    if (ctx2[1] == "home1")
      return 2;
    if (ctx2[1] == "home2")
      return 3;
    if (ctx2[1] == "home3")
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
      if (dirty & 2)
        menu_changes.startChosen = ctx2[1];
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
    }
  };
}
function instance$1($$self, $$props, $$invalidate) {
  let $page;
  let page = writable("system");
  component_subscribe($$self, page, (value2) => $$invalidate(1, $page = value2));
  let { context } = $$props;
  function changePage(event) {
    page.set(event.detail);
  }
  $$self.$$set = ($$props2) => {
    if ("context" in $$props2)
      $$invalidate(0, context = $$props2.context);
  };
  return [context, $page, page, changePage];
}
class Designer extends SvelteComponent {
  constructor(options) {
    super();
    init(this, options, instance$1, create_fragment$1, safe_not_equal, { context: 0 });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsiVFNGcm9udEVuZC9ub2RlX21vZHVsZXMvc3ZlbHRlL2ludGVybmFsL2luZGV4Lm1qcyIsIlRTRnJvbnRFbmQvbm9kZV9tb2R1bGVzL3N2ZWx0ZS9lYXNpbmcvaW5kZXgubWpzIiwiVFNGcm9udEVuZC9ub2RlX21vZHVsZXMvc3ZlbHRlL3RyYW5zaXRpb24vaW5kZXgubWpzIiwiVFNGcm9udEVuZC9ub2RlX21vZHVsZXMvdHNsaWIvdHNsaWIuZXM2LmpzIiwiVFNGcm9udEVuZC9zcmMvTW9kdWxlcy91aS9Db21wb25lbnRzL2J1dHRvbnMvcGx1cy5zdmVsdGUiLCJUU0Zyb250RW5kL3NyYy9Nb2R1bGVzL3VpL0NvbXBvbmVudHMvZWRpdEFibGVMaXN0L0VkaXRBYmxlTGlzdC5zdmVsdGUiLCJUU0Zyb250RW5kL25vZGVfbW9kdWxlcy9zdmVsdGUvc3RvcmUvaW5kZXgubWpzIiwiVFNGcm9udEVuZC9zcmMvTW9kdWxlcy91aS9WaWV3cy9MYXlvdXQwMS9jb250ZXh0LnRzIiwiVFNGcm9udEVuZC9ub2RlX21vZHVsZXMvdHRycGctc3lzdGVtLWdyYXBoL2Rpc3QvQWJzdHJhY3Rpb25zL0tleU1hbmFnZXIuanMiLCJUU0Zyb250RW5kL25vZGVfbW9kdWxlcy90dHJwZy1zeXN0ZW0tZ3JhcGgvZGlzdC9BYnN0cmFjdGlvbnMvSU91dHB1dEhhbmRsZXIuanMiLCJUU0Zyb250RW5kL25vZGVfbW9kdWxlcy90dHJwZy1zeXN0ZW0tZ3JhcGgvZGlzdC9BYnN0cmFjdGlvbnMvQUdyYXBoSXRlbS5qcyIsIlRTRnJvbnRFbmQvbm9kZV9tb2R1bGVzL3R0cnBnLXN5c3RlbS1ncmFwaC9kaXN0L0dyb2JDb2xsZWN0aW9uLmpzIiwiVFNGcm9udEVuZC9ub2RlX21vZHVsZXMvdHRycGctc3lzdGVtLWdyYXBoL2Rpc3QvR3JvYkdyb3VwLmpzIiwiVFNGcm9udEVuZC9ub2RlX21vZHVsZXMvdHRycGctc3lzdGVtLWdyYXBoL2Rpc3QvR3JhcGgvVFRSUEdTeXN0ZW1HcmFwaEFic3RyYWN0TW9kZWwuanMiLCJUU0Zyb250RW5kL25vZGVfbW9kdWxlcy90dHJwZy1zeXN0ZW0tZ3JhcGgvZGlzdC9HcmFwaC9UVFJQR1N5c3RlbUdyYXBoTW9kZWwuanMiLCJUU0Zyb250RW5kL25vZGVfbW9kdWxlcy90dHJwZy1zeXN0ZW0tZ3JhcGgvZGlzdC9Ob2Rlcy9hbGdvcml0aG0vVGFyamFuTm9kZS5qcyIsIlRTRnJvbnRFbmQvbm9kZV9tb2R1bGVzL3R0cnBnLXN5c3RlbS1ncmFwaC9kaXN0L05vZGVzL0FHcm9iTm9kdGUuanMiLCJUU0Zyb250RW5kL25vZGVfbW9kdWxlcy90dHJwZy1zeXN0ZW0tZ3JhcGgvZGlzdC9HcmFwaC9UVFJQR1N5c3RlbXNHcmFwaERlcGVuZGVuY2llcy5qcyIsIlRTRnJvbnRFbmQvbm9kZV9tb2R1bGVzL3R0cnBnLXN5c3RlbS1ncmFwaC9kaXN0L05vZGVzL0dyb2JPcmlnaW4uanMiLCJUU0Zyb250RW5kL25vZGVfbW9kdWxlcy90dHJwZy1zeXN0ZW0tZ3JhcGgvZGlzdC9Ob2Rlcy9Hcm9iRGVyaXZlZE5vZGUuanMiLCJUU0Zyb250RW5kL25vZGVfbW9kdWxlcy90dHJwZy1zeXN0ZW0tZ3JhcGgvZGlzdC9Ob2Rlcy9Hcm9iQm9udXNOb2RlLmpzIiwiVFNGcm9udEVuZC9ub2RlX21vZHVsZXMvdHRycGctc3lzdGVtLWdyYXBoL2Rpc3QvSGVscGVycy9UVFJQR1N5c3RlbUJvbnVzRGVzaWduZXIuanMiLCJUU0Zyb250RW5kL25vZGVfbW9kdWxlcy90dHJwZy1zeXN0ZW0tZ3JhcGgvZGlzdC9Ob2Rlcy9Hcm9iRml4ZWROb2RlLmpzIiwiVFNGcm9udEVuZC9ub2RlX21vZHVsZXMvdHRycGctc3lzdGVtLWdyYXBoL2Rpc3QvVGFibGVzL0RhdGFUYWJsZS5qcyIsIlRTRnJvbnRFbmQvbm9kZV9tb2R1bGVzL3R0cnBnLXN5c3RlbS1ncmFwaC9kaXN0L2luZGV4LmpzIiwiVFNGcm9udEVuZC9ub2RlX21vZHVsZXMvZ3JvYmF4LWpzb24taGFuZGxlci9kaXN0L0pzb25Nb2R1bGVDb25zdGFudHMuanMiLCJUU0Zyb250RW5kL25vZGVfbW9kdWxlcy9ncm9iYXgtanNvbi1oYW5kbGVyL2Rpc3QvUmVmbGVjdC5qcyIsIlRTRnJvbnRFbmQvbm9kZV9tb2R1bGVzL2dyb2JheC1qc29uLWhhbmRsZXIvZGlzdC9Kc29uTW9kdWxlQmFzZUZ1bmN0aW9uLmpzIiwiVFNGcm9udEVuZC9ub2RlX21vZHVsZXMvZ3JvYmF4LWpzb24taGFuZGxlci9kaXN0L0RlY29yYXRvcnMuanMiLCJUU0Zyb250RW5kL25vZGVfbW9kdWxlcy9ncm9iYXgtanNvbi1oYW5kbGVyL2Rpc3QvSnNvbkhhbmRsZXIuanMiLCJUU0Zyb250RW5kL3NyYy9Nb2R1bGVzL2dyYXBoRGVzaWduZXIvaW5kZXgudHMiLCJUU0Zyb250RW5kL3NyYy9Nb2R1bGVzL2NvcmUvbW9kZWwvc3lzdGVtUHJldmlldy50cyIsIlRTRnJvbnRFbmQvc3JjL01vZHVsZXMvY29yZS9CYXNlRnVuY3Rpb25zL3N0cmluZ2Z1bmN0aW9ucy50cyIsIlRTRnJvbnRFbmQvc3JjL01vZHVsZXMvdWkvVmlld3MvTGF5b3V0MDEvU3lzdGVtRGVzaWduZXIvVUlHcmFwaEl0ZW1zLnRzIiwiVFNGcm9udEVuZC9zcmMvTW9kdWxlcy91aS9Db21wb25lbnRzL2J1dHRvbnMvdHJhc2guc3ZlbHRlIiwiVFNGcm9udEVuZC9zcmMvTW9kdWxlcy91aS9Db21wb25lbnRzL2J1dHRvbnMvbWludXMuc3ZlbHRlIiwiVFNGcm9udEVuZC9zcmMvTW9kdWxlcy91aS9Db21wb25lbnRzL2J1dHRvbnMvZWRpdC5zdmVsdGUiLCJUU0Zyb250RW5kL3NyYy9Nb2R1bGVzL3VpL0NvbXBvbmVudHMvYnV0dG9ucy9kb3dubG9hZC5zdmVsdGUiLCJUU0Zyb250RW5kL3NyYy9Nb2R1bGVzL3VpL0NvbXBvbmVudHMvTWVzc2FnZXMvdG9vbFRpcC5zdmVsdGUiLCJUU0Zyb250RW5kL3NyYy9Nb2R1bGVzL3VpL0NvbXBvbmVudHMvTWVzc2FnZXMvdG9vbFRpcC5qcyIsIlRTRnJvbnRFbmQvc3JjL01vZHVsZXMvdWkvQ29tcG9uZW50cy9lZGl0QWJsZUxpc3QvRWRpdEFibGVMaXN0Mi5zdmVsdGUiLCJUU0Zyb250RW5kL3NyYy9Nb2R1bGVzL3VpL0NvbXBvbmVudHMvdG9vZ2xlU2VjdGlvbi90b29nbGVTZWN0aW9uLnN2ZWx0ZSIsIlRTRnJvbnRFbmQvc3JjL01vZHVsZXMvdWkvVmlld3MvTGF5b3V0MDEvU3lzdGVtRGVzaWduZXIvU3lzdGVtRGVzaWduZXIzUGFydHMuc3ZlbHRlIiwiVFNGcm9udEVuZC9zcmMvTW9kdWxlcy91aS9WaWV3cy9MYXlvdXQwMS9WaWV3cy9QYWdlL1N5c3RlbVBhZ2Uuc3ZlbHRlIiwiVFNGcm9udEVuZC9zcmMvTW9kdWxlcy91aS9WaWV3cy9MYXlvdXQwMS9WaWV3cy9NZW51L01lbnVCdG4uc3ZlbHRlIiwiVFNGcm9udEVuZC9zcmMvTW9kdWxlcy91aS9WaWV3cy9MYXlvdXQwMS9WaWV3cy9NZW51L01lbnUuc3ZlbHRlIiwiVFNGcm9udEVuZC9zcmMvTW9kdWxlcy91aS9Db21wb25lbnRzL1RyYW5zaXRpb25zL1NsaWRlRmx5LmpzIiwiVFNGcm9udEVuZC9zcmMvTW9kdWxlcy91aS9WaWV3cy9MYXlvdXQwMS9EZXNpZ25lci5zdmVsdGUiLCJUU0Zyb250RW5kL25vZGVfbW9kdWxlcy9hc3luYy1tdXRleC9lczYvZXJyb3JzLmpzIiwiVFNGcm9udEVuZC9ub2RlX21vZHVsZXMvYXN5bmMtbXV0ZXgvZXM2L1NlbWFwaG9yZS5qcyIsIlRTRnJvbnRFbmQvbm9kZV9tb2R1bGVzL2FzeW5jLW11dGV4L2VzNi9NdXRleC5qcyIsIlRTRnJvbnRFbmQvc3JjL01vZHVsZXMvY29yZS9maWxlSGFuZGxlci50cyIsIlRTRnJvbnRFbmQvc3JjL01vZHVsZXMvY29yZS9tb2RlbC9VSUxheW91dE1vZGVsLnRzIiwiVFNGcm9udEVuZC9zcmMvTW9kdWxlcy9jb3JlL2ZpbGVDb250ZXh0LnRzIiwiVFNGcm9udEVuZC9zcmMvTW9kdWxlcy9hcGkvT2JzaWRpYW5BUEkudHMiLCJUU0Zyb250RW5kL3NyYy9Nb2R1bGVzL3VpLW9ic2lkaWFuL2FwcC5zdmVsdGUiLCJUU0Zyb250RW5kL3NyYy9Nb2R1bGVzL3VpLW9ic2lkaWFuL2FwcC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBub29wKCkgeyB9XG5jb25zdCBpZGVudGl0eSA9IHggPT4geDtcbmZ1bmN0aW9uIGFzc2lnbih0YXIsIHNyYykge1xuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBmb3IgKGNvbnN0IGsgaW4gc3JjKVxuICAgICAgICB0YXJba10gPSBzcmNba107XG4gICAgcmV0dXJuIHRhcjtcbn1cbi8vIEFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vdGhlbi9pcy1wcm9taXNlL2Jsb2IvbWFzdGVyL2luZGV4LmpzXG4vLyBEaXN0cmlidXRlZCB1bmRlciBNSVQgTGljZW5zZSBodHRwczovL2dpdGh1Yi5jb20vdGhlbi9pcy1wcm9taXNlL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbmZ1bmN0aW9uIGlzX3Byb21pc2UodmFsdWUpIHtcbiAgICByZXR1cm4gISF2YWx1ZSAmJiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpICYmIHR5cGVvZiB2YWx1ZS50aGVuID09PSAnZnVuY3Rpb24nO1xufVxuZnVuY3Rpb24gYWRkX2xvY2F0aW9uKGVsZW1lbnQsIGZpbGUsIGxpbmUsIGNvbHVtbiwgY2hhcikge1xuICAgIGVsZW1lbnQuX19zdmVsdGVfbWV0YSA9IHtcbiAgICAgICAgbG9jOiB7IGZpbGUsIGxpbmUsIGNvbHVtbiwgY2hhciB9XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHJ1bihmbikge1xuICAgIHJldHVybiBmbigpO1xufVxuZnVuY3Rpb24gYmxhbmtfb2JqZWN0KCkge1xuICAgIHJldHVybiBPYmplY3QuY3JlYXRlKG51bGwpO1xufVxuZnVuY3Rpb24gcnVuX2FsbChmbnMpIHtcbiAgICBmbnMuZm9yRWFjaChydW4pO1xufVxuZnVuY3Rpb24gaXNfZnVuY3Rpb24odGhpbmcpIHtcbiAgICByZXR1cm4gdHlwZW9mIHRoaW5nID09PSAnZnVuY3Rpb24nO1xufVxuZnVuY3Rpb24gc2FmZV9ub3RfZXF1YWwoYSwgYikge1xuICAgIHJldHVybiBhICE9IGEgPyBiID09IGIgOiBhICE9PSBiIHx8ICgoYSAmJiB0eXBlb2YgYSA9PT0gJ29iamVjdCcpIHx8IHR5cGVvZiBhID09PSAnZnVuY3Rpb24nKTtcbn1cbmxldCBzcmNfdXJsX2VxdWFsX2FuY2hvcjtcbmZ1bmN0aW9uIHNyY191cmxfZXF1YWwoZWxlbWVudF9zcmMsIHVybCkge1xuICAgIGlmICghc3JjX3VybF9lcXVhbF9hbmNob3IpIHtcbiAgICAgICAgc3JjX3VybF9lcXVhbF9hbmNob3IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgfVxuICAgIHNyY191cmxfZXF1YWxfYW5jaG9yLmhyZWYgPSB1cmw7XG4gICAgcmV0dXJuIGVsZW1lbnRfc3JjID09PSBzcmNfdXJsX2VxdWFsX2FuY2hvci5ocmVmO1xufVxuZnVuY3Rpb24gbm90X2VxdWFsKGEsIGIpIHtcbiAgICByZXR1cm4gYSAhPSBhID8gYiA9PSBiIDogYSAhPT0gYjtcbn1cbmZ1bmN0aW9uIGlzX2VtcHR5KG9iaikge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhvYmopLmxlbmd0aCA9PT0gMDtcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlX3N0b3JlKHN0b3JlLCBuYW1lKSB7XG4gICAgaWYgKHN0b3JlICE9IG51bGwgJiYgdHlwZW9mIHN0b3JlLnN1YnNjcmliZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCcke25hbWV9JyBpcyBub3QgYSBzdG9yZSB3aXRoIGEgJ3N1YnNjcmliZScgbWV0aG9kYCk7XG4gICAgfVxufVxuZnVuY3Rpb24gc3Vic2NyaWJlKHN0b3JlLCAuLi5jYWxsYmFja3MpIHtcbiAgICBpZiAoc3RvcmUgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbm9vcDtcbiAgICB9XG4gICAgY29uc3QgdW5zdWIgPSBzdG9yZS5zdWJzY3JpYmUoLi4uY2FsbGJhY2tzKTtcbiAgICByZXR1cm4gdW5zdWIudW5zdWJzY3JpYmUgPyAoKSA9PiB1bnN1Yi51bnN1YnNjcmliZSgpIDogdW5zdWI7XG59XG5mdW5jdGlvbiBnZXRfc3RvcmVfdmFsdWUoc3RvcmUpIHtcbiAgICBsZXQgdmFsdWU7XG4gICAgc3Vic2NyaWJlKHN0b3JlLCBfID0+IHZhbHVlID0gXykoKTtcbiAgICByZXR1cm4gdmFsdWU7XG59XG5mdW5jdGlvbiBjb21wb25lbnRfc3Vic2NyaWJlKGNvbXBvbmVudCwgc3RvcmUsIGNhbGxiYWNrKSB7XG4gICAgY29tcG9uZW50LiQkLm9uX2Rlc3Ryb3kucHVzaChzdWJzY3JpYmUoc3RvcmUsIGNhbGxiYWNrKSk7XG59XG5mdW5jdGlvbiBjcmVhdGVfc2xvdChkZWZpbml0aW9uLCBjdHgsICQkc2NvcGUsIGZuKSB7XG4gICAgaWYgKGRlZmluaXRpb24pIHtcbiAgICAgICAgY29uc3Qgc2xvdF9jdHggPSBnZXRfc2xvdF9jb250ZXh0KGRlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZm4pO1xuICAgICAgICByZXR1cm4gZGVmaW5pdGlvblswXShzbG90X2N0eCk7XG4gICAgfVxufVxuZnVuY3Rpb24gZ2V0X3Nsb3RfY29udGV4dChkZWZpbml0aW9uLCBjdHgsICQkc2NvcGUsIGZuKSB7XG4gICAgcmV0dXJuIGRlZmluaXRpb25bMV0gJiYgZm5cbiAgICAgICAgPyBhc3NpZ24oJCRzY29wZS5jdHguc2xpY2UoKSwgZGVmaW5pdGlvblsxXShmbihjdHgpKSlcbiAgICAgICAgOiAkJHNjb3BlLmN0eDtcbn1cbmZ1bmN0aW9uIGdldF9zbG90X2NoYW5nZXMoZGVmaW5pdGlvbiwgJCRzY29wZSwgZGlydHksIGZuKSB7XG4gICAgaWYgKGRlZmluaXRpb25bMl0gJiYgZm4pIHtcbiAgICAgICAgY29uc3QgbGV0cyA9IGRlZmluaXRpb25bMl0oZm4oZGlydHkpKTtcbiAgICAgICAgaWYgKCQkc2NvcGUuZGlydHkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGxldHM7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBsZXRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgY29uc3QgbWVyZ2VkID0gW107XG4gICAgICAgICAgICBjb25zdCBsZW4gPSBNYXRoLm1heCgkJHNjb3BlLmRpcnR5Lmxlbmd0aCwgbGV0cy5sZW5ndGgpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIG1lcmdlZFtpXSA9ICQkc2NvcGUuZGlydHlbaV0gfCBsZXRzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1lcmdlZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJCRzY29wZS5kaXJ0eSB8IGxldHM7XG4gICAgfVxuICAgIHJldHVybiAkJHNjb3BlLmRpcnR5O1xufVxuZnVuY3Rpb24gdXBkYXRlX3Nsb3RfYmFzZShzbG90LCBzbG90X2RlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgc2xvdF9jaGFuZ2VzLCBnZXRfc2xvdF9jb250ZXh0X2ZuKSB7XG4gICAgaWYgKHNsb3RfY2hhbmdlcykge1xuICAgICAgICBjb25zdCBzbG90X2NvbnRleHQgPSBnZXRfc2xvdF9jb250ZXh0KHNsb3RfZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBnZXRfc2xvdF9jb250ZXh0X2ZuKTtcbiAgICAgICAgc2xvdC5wKHNsb3RfY29udGV4dCwgc2xvdF9jaGFuZ2VzKTtcbiAgICB9XG59XG5mdW5jdGlvbiB1cGRhdGVfc2xvdChzbG90LCBzbG90X2RlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZGlydHksIGdldF9zbG90X2NoYW5nZXNfZm4sIGdldF9zbG90X2NvbnRleHRfZm4pIHtcbiAgICBjb25zdCBzbG90X2NoYW5nZXMgPSBnZXRfc2xvdF9jaGFuZ2VzKHNsb3RfZGVmaW5pdGlvbiwgJCRzY29wZSwgZGlydHksIGdldF9zbG90X2NoYW5nZXNfZm4pO1xuICAgIHVwZGF0ZV9zbG90X2Jhc2Uoc2xvdCwgc2xvdF9kZWZpbml0aW9uLCBjdHgsICQkc2NvcGUsIHNsb3RfY2hhbmdlcywgZ2V0X3Nsb3RfY29udGV4dF9mbik7XG59XG5mdW5jdGlvbiBnZXRfYWxsX2RpcnR5X2Zyb21fc2NvcGUoJCRzY29wZSkge1xuICAgIGlmICgkJHNjb3BlLmN0eC5sZW5ndGggPiAzMikge1xuICAgICAgICBjb25zdCBkaXJ0eSA9IFtdO1xuICAgICAgICBjb25zdCBsZW5ndGggPSAkJHNjb3BlLmN0eC5sZW5ndGggLyAzMjtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZGlydHlbaV0gPSAtMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGlydHk7XG4gICAgfVxuICAgIHJldHVybiAtMTtcbn1cbmZ1bmN0aW9uIGV4Y2x1ZGVfaW50ZXJuYWxfcHJvcHMocHJvcHMpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGsgaW4gcHJvcHMpXG4gICAgICAgIGlmIChrWzBdICE9PSAnJCcpXG4gICAgICAgICAgICByZXN1bHRba10gPSBwcm9wc1trXTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gY29tcHV0ZV9yZXN0X3Byb3BzKHByb3BzLCBrZXlzKSB7XG4gICAgY29uc3QgcmVzdCA9IHt9O1xuICAgIGtleXMgPSBuZXcgU2V0KGtleXMpO1xuICAgIGZvciAoY29uc3QgayBpbiBwcm9wcylcbiAgICAgICAgaWYgKCFrZXlzLmhhcyhrKSAmJiBrWzBdICE9PSAnJCcpXG4gICAgICAgICAgICByZXN0W2tdID0gcHJvcHNba107XG4gICAgcmV0dXJuIHJlc3Q7XG59XG5mdW5jdGlvbiBjb21wdXRlX3Nsb3RzKHNsb3RzKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgZm9yIChjb25zdCBrZXkgaW4gc2xvdHMpIHtcbiAgICAgICAgcmVzdWx0W2tleV0gPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gb25jZShmbikge1xuICAgIGxldCByYW4gPSBmYWxzZTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKHJhbilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgcmFuID0gdHJ1ZTtcbiAgICAgICAgZm4uY2FsbCh0aGlzLCAuLi5hcmdzKTtcbiAgICB9O1xufVxuZnVuY3Rpb24gbnVsbF90b19lbXB0eSh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PSBudWxsID8gJycgOiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIHNldF9zdG9yZV92YWx1ZShzdG9yZSwgcmV0LCB2YWx1ZSkge1xuICAgIHN0b3JlLnNldCh2YWx1ZSk7XG4gICAgcmV0dXJuIHJldDtcbn1cbmNvbnN0IGhhc19wcm9wID0gKG9iaiwgcHJvcCkgPT4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7XG5mdW5jdGlvbiBhY3Rpb25fZGVzdHJveWVyKGFjdGlvbl9yZXN1bHQpIHtcbiAgICByZXR1cm4gYWN0aW9uX3Jlc3VsdCAmJiBpc19mdW5jdGlvbihhY3Rpb25fcmVzdWx0LmRlc3Ryb3kpID8gYWN0aW9uX3Jlc3VsdC5kZXN0cm95IDogbm9vcDtcbn1cbmZ1bmN0aW9uIHNwbGl0X2Nzc191bml0KHZhbHVlKSB7XG4gICAgY29uc3Qgc3BsaXQgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLm1hdGNoKC9eXFxzKigtP1tcXGQuXSspKFteXFxzXSopXFxzKiQvKTtcbiAgICByZXR1cm4gc3BsaXQgPyBbcGFyc2VGbG9hdChzcGxpdFsxXSksIHNwbGl0WzJdIHx8ICdweCddIDogW3ZhbHVlLCAncHgnXTtcbn1cbmNvbnN0IGNvbnRlbnRlZGl0YWJsZV90cnV0aHlfdmFsdWVzID0gWycnLCB0cnVlLCAxLCAndHJ1ZScsICdjb250ZW50ZWRpdGFibGUnXTtcblxuY29uc3QgaXNfY2xpZW50ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCc7XG5sZXQgbm93ID0gaXNfY2xpZW50XG4gICAgPyAoKSA9PiB3aW5kb3cucGVyZm9ybWFuY2Uubm93KClcbiAgICA6ICgpID0+IERhdGUubm93KCk7XG5sZXQgcmFmID0gaXNfY2xpZW50ID8gY2IgPT4gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGNiKSA6IG5vb3A7XG4vLyB1c2VkIGludGVybmFsbHkgZm9yIHRlc3RpbmdcbmZ1bmN0aW9uIHNldF9ub3coZm4pIHtcbiAgICBub3cgPSBmbjtcbn1cbmZ1bmN0aW9uIHNldF9yYWYoZm4pIHtcbiAgICByYWYgPSBmbjtcbn1cblxuY29uc3QgdGFza3MgPSBuZXcgU2V0KCk7XG5mdW5jdGlvbiBydW5fdGFza3Mobm93KSB7XG4gICAgdGFza3MuZm9yRWFjaCh0YXNrID0+IHtcbiAgICAgICAgaWYgKCF0YXNrLmMobm93KSkge1xuICAgICAgICAgICAgdGFza3MuZGVsZXRlKHRhc2spO1xuICAgICAgICAgICAgdGFzay5mKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAodGFza3Muc2l6ZSAhPT0gMClcbiAgICAgICAgcmFmKHJ1bl90YXNrcyk7XG59XG4vKipcbiAqIEZvciB0ZXN0aW5nIHB1cnBvc2VzIG9ubHkhXG4gKi9cbmZ1bmN0aW9uIGNsZWFyX2xvb3BzKCkge1xuICAgIHRhc2tzLmNsZWFyKCk7XG59XG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdGFzayB0aGF0IHJ1bnMgb24gZWFjaCByYWYgZnJhbWVcbiAqIHVudGlsIGl0IHJldHVybnMgYSBmYWxzeSB2YWx1ZSBvciBpcyBhYm9ydGVkXG4gKi9cbmZ1bmN0aW9uIGxvb3AoY2FsbGJhY2spIHtcbiAgICBsZXQgdGFzaztcbiAgICBpZiAodGFza3Muc2l6ZSA9PT0gMClcbiAgICAgICAgcmFmKHJ1bl90YXNrcyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcHJvbWlzZTogbmV3IFByb21pc2UoZnVsZmlsbCA9PiB7XG4gICAgICAgICAgICB0YXNrcy5hZGQodGFzayA9IHsgYzogY2FsbGJhY2ssIGY6IGZ1bGZpbGwgfSk7XG4gICAgICAgIH0pLFxuICAgICAgICBhYm9ydCgpIHtcbiAgICAgICAgICAgIHRhc2tzLmRlbGV0ZSh0YXNrKTtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmNvbnN0IGdsb2JhbHMgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICA/IHdpbmRvd1xuICAgIDogdHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnXG4gICAgICAgID8gZ2xvYmFsVGhpc1xuICAgICAgICA6IGdsb2JhbCk7XG5cbi8qKlxuICogUmVzaXplIG9ic2VydmVyIHNpbmdsZXRvbi5cbiAqIE9uZSBsaXN0ZW5lciBwZXIgZWxlbWVudCBvbmx5IVxuICogaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9hL2Nocm9taXVtLm9yZy9nL2JsaW5rLWRldi9jL3o2aWVuT05VYjVBL20vRjUtVmNVWnRCQUFKXG4gKi9cbmNsYXNzIFJlc2l6ZU9ic2VydmVyU2luZ2xldG9uIHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgICAgIHRoaXMuX2xpc3RlbmVycyA9ICdXZWFrTWFwJyBpbiBnbG9iYWxzID8gbmV3IFdlYWtNYXAoKSA6IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgb2JzZXJ2ZShlbGVtZW50LCBsaXN0ZW5lcikge1xuICAgICAgICB0aGlzLl9saXN0ZW5lcnMuc2V0KGVsZW1lbnQsIGxpc3RlbmVyKTtcbiAgICAgICAgdGhpcy5fZ2V0T2JzZXJ2ZXIoKS5vYnNlcnZlKGVsZW1lbnQsIHRoaXMub3B0aW9ucyk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9saXN0ZW5lcnMuZGVsZXRlKGVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy5fb2JzZXJ2ZXIudW5vYnNlcnZlKGVsZW1lbnQpOyAvLyB0aGlzIGxpbmUgY2FuIHByb2JhYmx5IGJlIHJlbW92ZWRcbiAgICAgICAgfTtcbiAgICB9XG4gICAgX2dldE9ic2VydmVyKCkge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIHJldHVybiAoX2EgPSB0aGlzLl9vYnNlcnZlcikgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogKHRoaXMuX29ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKChlbnRyaWVzKSA9PiB7XG4gICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGVudHJpZXMpIHtcbiAgICAgICAgICAgICAgICBSZXNpemVPYnNlcnZlclNpbmdsZXRvbi5lbnRyaWVzLnNldChlbnRyeS50YXJnZXQsIGVudHJ5KTtcbiAgICAgICAgICAgICAgICAoX2EgPSB0aGlzLl9saXN0ZW5lcnMuZ2V0KGVudHJ5LnRhcmdldCkpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYShlbnRyeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pKTtcbiAgICB9XG59XG4vLyBOZWVkcyB0byBiZSB3cml0dGVuIGxpa2UgdGhpcyB0byBwYXNzIHRoZSB0cmVlLXNoYWtlLXRlc3RcblJlc2l6ZU9ic2VydmVyU2luZ2xldG9uLmVudHJpZXMgPSAnV2Vha01hcCcgaW4gZ2xvYmFscyA/IG5ldyBXZWFrTWFwKCkgOiB1bmRlZmluZWQ7XG5cbi8vIFRyYWNrIHdoaWNoIG5vZGVzIGFyZSBjbGFpbWVkIGR1cmluZyBoeWRyYXRpb24uIFVuY2xhaW1lZCBub2RlcyBjYW4gdGhlbiBiZSByZW1vdmVkIGZyb20gdGhlIERPTVxuLy8gYXQgdGhlIGVuZCBvZiBoeWRyYXRpb24gd2l0aG91dCB0b3VjaGluZyB0aGUgcmVtYWluaW5nIG5vZGVzLlxubGV0IGlzX2h5ZHJhdGluZyA9IGZhbHNlO1xuZnVuY3Rpb24gc3RhcnRfaHlkcmF0aW5nKCkge1xuICAgIGlzX2h5ZHJhdGluZyA9IHRydWU7XG59XG5mdW5jdGlvbiBlbmRfaHlkcmF0aW5nKCkge1xuICAgIGlzX2h5ZHJhdGluZyA9IGZhbHNlO1xufVxuZnVuY3Rpb24gdXBwZXJfYm91bmQobG93LCBoaWdoLCBrZXksIHZhbHVlKSB7XG4gICAgLy8gUmV0dXJuIGZpcnN0IGluZGV4IG9mIHZhbHVlIGxhcmdlciB0aGFuIGlucHV0IHZhbHVlIGluIHRoZSByYW5nZSBbbG93LCBoaWdoKVxuICAgIHdoaWxlIChsb3cgPCBoaWdoKSB7XG4gICAgICAgIGNvbnN0IG1pZCA9IGxvdyArICgoaGlnaCAtIGxvdykgPj4gMSk7XG4gICAgICAgIGlmIChrZXkobWlkKSA8PSB2YWx1ZSkge1xuICAgICAgICAgICAgbG93ID0gbWlkICsgMTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGhpZ2ggPSBtaWQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGxvdztcbn1cbmZ1bmN0aW9uIGluaXRfaHlkcmF0ZSh0YXJnZXQpIHtcbiAgICBpZiAodGFyZ2V0Lmh5ZHJhdGVfaW5pdClcbiAgICAgICAgcmV0dXJuO1xuICAgIHRhcmdldC5oeWRyYXRlX2luaXQgPSB0cnVlO1xuICAgIC8vIFdlIGtub3cgdGhhdCBhbGwgY2hpbGRyZW4gaGF2ZSBjbGFpbV9vcmRlciB2YWx1ZXMgc2luY2UgdGhlIHVuY2xhaW1lZCBoYXZlIGJlZW4gZGV0YWNoZWQgaWYgdGFyZ2V0IGlzIG5vdCA8aGVhZD5cbiAgICBsZXQgY2hpbGRyZW4gPSB0YXJnZXQuY2hpbGROb2RlcztcbiAgICAvLyBJZiB0YXJnZXQgaXMgPGhlYWQ+LCB0aGVyZSBtYXkgYmUgY2hpbGRyZW4gd2l0aG91dCBjbGFpbV9vcmRlclxuICAgIGlmICh0YXJnZXQubm9kZU5hbWUgPT09ICdIRUFEJykge1xuICAgICAgICBjb25zdCBteUNoaWxkcmVuID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgIGlmIChub2RlLmNsYWltX29yZGVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBteUNoaWxkcmVuLnB1c2gobm9kZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2hpbGRyZW4gPSBteUNoaWxkcmVuO1xuICAgIH1cbiAgICAvKlxuICAgICogUmVvcmRlciBjbGFpbWVkIGNoaWxkcmVuIG9wdGltYWxseS5cbiAgICAqIFdlIGNhbiByZW9yZGVyIGNsYWltZWQgY2hpbGRyZW4gb3B0aW1hbGx5IGJ5IGZpbmRpbmcgdGhlIGxvbmdlc3Qgc3Vic2VxdWVuY2Ugb2ZcbiAgICAqIG5vZGVzIHRoYXQgYXJlIGFscmVhZHkgY2xhaW1lZCBpbiBvcmRlciBhbmQgb25seSBtb3ZpbmcgdGhlIHJlc3QuIFRoZSBsb25nZXN0XG4gICAgKiBzdWJzZXF1ZW5jZSBvZiBub2RlcyB0aGF0IGFyZSBjbGFpbWVkIGluIG9yZGVyIGNhbiBiZSBmb3VuZCBieVxuICAgICogY29tcHV0aW5nIHRoZSBsb25nZXN0IGluY3JlYXNpbmcgc3Vic2VxdWVuY2Ugb2YgLmNsYWltX29yZGVyIHZhbHVlcy5cbiAgICAqXG4gICAgKiBUaGlzIGFsZ29yaXRobSBpcyBvcHRpbWFsIGluIGdlbmVyYXRpbmcgdGhlIGxlYXN0IGFtb3VudCBvZiByZW9yZGVyIG9wZXJhdGlvbnNcbiAgICAqIHBvc3NpYmxlLlxuICAgICpcbiAgICAqIFByb29mOlxuICAgICogV2Uga25vdyB0aGF0LCBnaXZlbiBhIHNldCBvZiByZW9yZGVyaW5nIG9wZXJhdGlvbnMsIHRoZSBub2RlcyB0aGF0IGRvIG5vdCBtb3ZlXG4gICAgKiBhbHdheXMgZm9ybSBhbiBpbmNyZWFzaW5nIHN1YnNlcXVlbmNlLCBzaW5jZSB0aGV5IGRvIG5vdCBtb3ZlIGFtb25nIGVhY2ggb3RoZXJcbiAgICAqIG1lYW5pbmcgdGhhdCB0aGV5IG11c3QgYmUgYWxyZWFkeSBvcmRlcmVkIGFtb25nIGVhY2ggb3RoZXIuIFRodXMsIHRoZSBtYXhpbWFsXG4gICAgKiBzZXQgb2Ygbm9kZXMgdGhhdCBkbyBub3QgbW92ZSBmb3JtIGEgbG9uZ2VzdCBpbmNyZWFzaW5nIHN1YnNlcXVlbmNlLlxuICAgICovXG4gICAgLy8gQ29tcHV0ZSBsb25nZXN0IGluY3JlYXNpbmcgc3Vic2VxdWVuY2VcbiAgICAvLyBtOiBzdWJzZXF1ZW5jZSBsZW5ndGggaiA9PiBpbmRleCBrIG9mIHNtYWxsZXN0IHZhbHVlIHRoYXQgZW5kcyBhbiBpbmNyZWFzaW5nIHN1YnNlcXVlbmNlIG9mIGxlbmd0aCBqXG4gICAgY29uc3QgbSA9IG5ldyBJbnQzMkFycmF5KGNoaWxkcmVuLmxlbmd0aCArIDEpO1xuICAgIC8vIFByZWRlY2Vzc29yIGluZGljZXMgKyAxXG4gICAgY29uc3QgcCA9IG5ldyBJbnQzMkFycmF5KGNoaWxkcmVuLmxlbmd0aCk7XG4gICAgbVswXSA9IC0xO1xuICAgIGxldCBsb25nZXN0ID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSBjaGlsZHJlbltpXS5jbGFpbV9vcmRlcjtcbiAgICAgICAgLy8gRmluZCB0aGUgbGFyZ2VzdCBzdWJzZXF1ZW5jZSBsZW5ndGggc3VjaCB0aGF0IGl0IGVuZHMgaW4gYSB2YWx1ZSBsZXNzIHRoYW4gb3VyIGN1cnJlbnQgdmFsdWVcbiAgICAgICAgLy8gdXBwZXJfYm91bmQgcmV0dXJucyBmaXJzdCBncmVhdGVyIHZhbHVlLCBzbyB3ZSBzdWJ0cmFjdCBvbmVcbiAgICAgICAgLy8gd2l0aCBmYXN0IHBhdGggZm9yIHdoZW4gd2UgYXJlIG9uIHRoZSBjdXJyZW50IGxvbmdlc3Qgc3Vic2VxdWVuY2VcbiAgICAgICAgY29uc3Qgc2VxTGVuID0gKChsb25nZXN0ID4gMCAmJiBjaGlsZHJlblttW2xvbmdlc3RdXS5jbGFpbV9vcmRlciA8PSBjdXJyZW50KSA/IGxvbmdlc3QgKyAxIDogdXBwZXJfYm91bmQoMSwgbG9uZ2VzdCwgaWR4ID0+IGNoaWxkcmVuW21baWR4XV0uY2xhaW1fb3JkZXIsIGN1cnJlbnQpKSAtIDE7XG4gICAgICAgIHBbaV0gPSBtW3NlcUxlbl0gKyAxO1xuICAgICAgICBjb25zdCBuZXdMZW4gPSBzZXFMZW4gKyAxO1xuICAgICAgICAvLyBXZSBjYW4gZ3VhcmFudGVlIHRoYXQgY3VycmVudCBpcyB0aGUgc21hbGxlc3QgdmFsdWUuIE90aGVyd2lzZSwgd2Ugd291bGQgaGF2ZSBnZW5lcmF0ZWQgYSBsb25nZXIgc2VxdWVuY2UuXG4gICAgICAgIG1bbmV3TGVuXSA9IGk7XG4gICAgICAgIGxvbmdlc3QgPSBNYXRoLm1heChuZXdMZW4sIGxvbmdlc3QpO1xuICAgIH1cbiAgICAvLyBUaGUgbG9uZ2VzdCBpbmNyZWFzaW5nIHN1YnNlcXVlbmNlIG9mIG5vZGVzIChpbml0aWFsbHkgcmV2ZXJzZWQpXG4gICAgY29uc3QgbGlzID0gW107XG4gICAgLy8gVGhlIHJlc3Qgb2YgdGhlIG5vZGVzLCBub2RlcyB0aGF0IHdpbGwgYmUgbW92ZWRcbiAgICBjb25zdCB0b01vdmUgPSBbXTtcbiAgICBsZXQgbGFzdCA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7XG4gICAgZm9yIChsZXQgY3VyID0gbVtsb25nZXN0XSArIDE7IGN1ciAhPSAwOyBjdXIgPSBwW2N1ciAtIDFdKSB7XG4gICAgICAgIGxpcy5wdXNoKGNoaWxkcmVuW2N1ciAtIDFdKTtcbiAgICAgICAgZm9yICg7IGxhc3QgPj0gY3VyOyBsYXN0LS0pIHtcbiAgICAgICAgICAgIHRvTW92ZS5wdXNoKGNoaWxkcmVuW2xhc3RdKTtcbiAgICAgICAgfVxuICAgICAgICBsYXN0LS07XG4gICAgfVxuICAgIGZvciAoOyBsYXN0ID49IDA7IGxhc3QtLSkge1xuICAgICAgICB0b01vdmUucHVzaChjaGlsZHJlbltsYXN0XSk7XG4gICAgfVxuICAgIGxpcy5yZXZlcnNlKCk7XG4gICAgLy8gV2Ugc29ydCB0aGUgbm9kZXMgYmVpbmcgbW92ZWQgdG8gZ3VhcmFudGVlIHRoYXQgdGhlaXIgaW5zZXJ0aW9uIG9yZGVyIG1hdGNoZXMgdGhlIGNsYWltIG9yZGVyXG4gICAgdG9Nb3ZlLnNvcnQoKGEsIGIpID0+IGEuY2xhaW1fb3JkZXIgLSBiLmNsYWltX29yZGVyKTtcbiAgICAvLyBGaW5hbGx5LCB3ZSBtb3ZlIHRoZSBub2Rlc1xuICAgIGZvciAobGV0IGkgPSAwLCBqID0gMDsgaSA8IHRvTW92ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB3aGlsZSAoaiA8IGxpcy5sZW5ndGggJiYgdG9Nb3ZlW2ldLmNsYWltX29yZGVyID49IGxpc1tqXS5jbGFpbV9vcmRlcikge1xuICAgICAgICAgICAgaisrO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFuY2hvciA9IGogPCBsaXMubGVuZ3RoID8gbGlzW2pdIDogbnVsbDtcbiAgICAgICAgdGFyZ2V0Lmluc2VydEJlZm9yZSh0b01vdmVbaV0sIGFuY2hvcik7XG4gICAgfVxufVxuZnVuY3Rpb24gYXBwZW5kKHRhcmdldCwgbm9kZSkge1xuICAgIHRhcmdldC5hcHBlbmRDaGlsZChub2RlKTtcbn1cbmZ1bmN0aW9uIGFwcGVuZF9zdHlsZXModGFyZ2V0LCBzdHlsZV9zaGVldF9pZCwgc3R5bGVzKSB7XG4gICAgY29uc3QgYXBwZW5kX3N0eWxlc190byA9IGdldF9yb290X2Zvcl9zdHlsZSh0YXJnZXQpO1xuICAgIGlmICghYXBwZW5kX3N0eWxlc190by5nZXRFbGVtZW50QnlJZChzdHlsZV9zaGVldF9pZCkpIHtcbiAgICAgICAgY29uc3Qgc3R5bGUgPSBlbGVtZW50KCdzdHlsZScpO1xuICAgICAgICBzdHlsZS5pZCA9IHN0eWxlX3NoZWV0X2lkO1xuICAgICAgICBzdHlsZS50ZXh0Q29udGVudCA9IHN0eWxlcztcbiAgICAgICAgYXBwZW5kX3N0eWxlc2hlZXQoYXBwZW5kX3N0eWxlc190bywgc3R5bGUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGdldF9yb290X2Zvcl9zdHlsZShub2RlKSB7XG4gICAgaWYgKCFub2RlKVxuICAgICAgICByZXR1cm4gZG9jdW1lbnQ7XG4gICAgY29uc3Qgcm9vdCA9IG5vZGUuZ2V0Um9vdE5vZGUgPyBub2RlLmdldFJvb3ROb2RlKCkgOiBub2RlLm93bmVyRG9jdW1lbnQ7XG4gICAgaWYgKHJvb3QgJiYgcm9vdC5ob3N0KSB7XG4gICAgICAgIHJldHVybiByb290O1xuICAgIH1cbiAgICByZXR1cm4gbm9kZS5vd25lckRvY3VtZW50O1xufVxuZnVuY3Rpb24gYXBwZW5kX2VtcHR5X3N0eWxlc2hlZXQobm9kZSkge1xuICAgIGNvbnN0IHN0eWxlX2VsZW1lbnQgPSBlbGVtZW50KCdzdHlsZScpO1xuICAgIGFwcGVuZF9zdHlsZXNoZWV0KGdldF9yb290X2Zvcl9zdHlsZShub2RlKSwgc3R5bGVfZWxlbWVudCk7XG4gICAgcmV0dXJuIHN0eWxlX2VsZW1lbnQuc2hlZXQ7XG59XG5mdW5jdGlvbiBhcHBlbmRfc3R5bGVzaGVldChub2RlLCBzdHlsZSkge1xuICAgIGFwcGVuZChub2RlLmhlYWQgfHwgbm9kZSwgc3R5bGUpO1xuICAgIHJldHVybiBzdHlsZS5zaGVldDtcbn1cbmZ1bmN0aW9uIGFwcGVuZF9oeWRyYXRpb24odGFyZ2V0LCBub2RlKSB7XG4gICAgaWYgKGlzX2h5ZHJhdGluZykge1xuICAgICAgICBpbml0X2h5ZHJhdGUodGFyZ2V0KTtcbiAgICAgICAgaWYgKCh0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZCA9PT0gdW5kZWZpbmVkKSB8fCAoKHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkICE9PSBudWxsKSAmJiAodGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQucGFyZW50Tm9kZSAhPT0gdGFyZ2V0KSkpIHtcbiAgICAgICAgICAgIHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkID0gdGFyZ2V0LmZpcnN0Q2hpbGQ7XG4gICAgICAgIH1cbiAgICAgICAgLy8gU2tpcCBub2RlcyBvZiB1bmRlZmluZWQgb3JkZXJpbmdcbiAgICAgICAgd2hpbGUgKCh0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZCAhPT0gbnVsbCkgJiYgKHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkLmNsYWltX29yZGVyID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICB0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZCA9IHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkLm5leHRTaWJsaW5nO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlICE9PSB0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZCkge1xuICAgICAgICAgICAgLy8gV2Ugb25seSBpbnNlcnQgaWYgdGhlIG9yZGVyaW5nIG9mIHRoaXMgbm9kZSBzaG91bGQgYmUgbW9kaWZpZWQgb3IgdGhlIHBhcmVudCBub2RlIGlzIG5vdCB0YXJnZXRcbiAgICAgICAgICAgIGlmIChub2RlLmNsYWltX29yZGVyICE9PSB1bmRlZmluZWQgfHwgbm9kZS5wYXJlbnROb2RlICE9PSB0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQuaW5zZXJ0QmVmb3JlKG5vZGUsIHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkID0gbm9kZS5uZXh0U2libGluZztcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChub2RlLnBhcmVudE5vZGUgIT09IHRhcmdldCB8fCBub2RlLm5leHRTaWJsaW5nICE9PSBudWxsKSB7XG4gICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChub2RlKTtcbiAgICB9XG59XG5mdW5jdGlvbiBpbnNlcnQodGFyZ2V0LCBub2RlLCBhbmNob3IpIHtcbiAgICB0YXJnZXQuaW5zZXJ0QmVmb3JlKG5vZGUsIGFuY2hvciB8fCBudWxsKTtcbn1cbmZ1bmN0aW9uIGluc2VydF9oeWRyYXRpb24odGFyZ2V0LCBub2RlLCBhbmNob3IpIHtcbiAgICBpZiAoaXNfaHlkcmF0aW5nICYmICFhbmNob3IpIHtcbiAgICAgICAgYXBwZW5kX2h5ZHJhdGlvbih0YXJnZXQsIG5vZGUpO1xuICAgIH1cbiAgICBlbHNlIGlmIChub2RlLnBhcmVudE5vZGUgIT09IHRhcmdldCB8fCBub2RlLm5leHRTaWJsaW5nICE9IGFuY2hvcikge1xuICAgICAgICB0YXJnZXQuaW5zZXJ0QmVmb3JlKG5vZGUsIGFuY2hvciB8fCBudWxsKTtcbiAgICB9XG59XG5mdW5jdGlvbiBkZXRhY2gobm9kZSkge1xuICAgIGlmIChub2RlLnBhcmVudE5vZGUpIHtcbiAgICAgICAgbm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG5vZGUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGRlc3Ryb3lfZWFjaChpdGVyYXRpb25zLCBkZXRhY2hpbmcpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZXJhdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgaWYgKGl0ZXJhdGlvbnNbaV0pXG4gICAgICAgICAgICBpdGVyYXRpb25zW2ldLmQoZGV0YWNoaW5nKTtcbiAgICB9XG59XG5mdW5jdGlvbiBlbGVtZW50KG5hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKTtcbn1cbmZ1bmN0aW9uIGVsZW1lbnRfaXMobmFtZSwgaXMpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lLCB7IGlzIH0pO1xufVxuZnVuY3Rpb24gb2JqZWN0X3dpdGhvdXRfcHJvcGVydGllcyhvYmosIGV4Y2x1ZGUpIHtcbiAgICBjb25zdCB0YXJnZXQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGsgaW4gb2JqKSB7XG4gICAgICAgIGlmIChoYXNfcHJvcChvYmosIGspXG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAmJiBleGNsdWRlLmluZGV4T2YoaykgPT09IC0xKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICB0YXJnZXRba10gPSBvYmpba107XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldDtcbn1cbmZ1bmN0aW9uIHN2Z19lbGVtZW50KG5hbWUpIHtcbiAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsIG5hbWUpO1xufVxuZnVuY3Rpb24gdGV4dChkYXRhKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEpO1xufVxuZnVuY3Rpb24gc3BhY2UoKSB7XG4gICAgcmV0dXJuIHRleHQoJyAnKTtcbn1cbmZ1bmN0aW9uIGVtcHR5KCkge1xuICAgIHJldHVybiB0ZXh0KCcnKTtcbn1cbmZ1bmN0aW9uIGNvbW1lbnQoY29udGVudCkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVDb21tZW50KGNvbnRlbnQpO1xufVxuZnVuY3Rpb24gbGlzdGVuKG5vZGUsIGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKSB7XG4gICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKTtcbiAgICByZXR1cm4gKCkgPT4gbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyLCBvcHRpb25zKTtcbn1cbmZ1bmN0aW9uIHByZXZlbnRfZGVmYXVsdChmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gZm4uY2FsbCh0aGlzLCBldmVudCk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHN0b3BfcHJvcGFnYXRpb24oZm4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICB9O1xufVxuZnVuY3Rpb24gc3RvcF9pbW1lZGlhdGVfcHJvcGFnYXRpb24oZm4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICB9O1xufVxuZnVuY3Rpb24gc2VsZihmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSB0aGlzKVxuICAgICAgICAgICAgZm4uY2FsbCh0aGlzLCBldmVudCk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHRydXN0ZWQoZm4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgaWYgKGV2ZW50LmlzVHJ1c3RlZClcbiAgICAgICAgICAgIGZuLmNhbGwodGhpcywgZXZlbnQpO1xuICAgIH07XG59XG5mdW5jdGlvbiBhdHRyKG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbClcbiAgICAgICAgbm9kZS5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlKTtcbiAgICBlbHNlIGlmIChub2RlLmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpICE9PSB2YWx1ZSlcbiAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlLCB2YWx1ZSk7XG59XG4vKipcbiAqIExpc3Qgb2YgYXR0cmlidXRlcyB0aGF0IHNob3VsZCBhbHdheXMgYmUgc2V0IHRocm91Z2ggdGhlIGF0dHIgbWV0aG9kLFxuICogYmVjYXVzZSB1cGRhdGluZyB0aGVtIHRocm91Z2ggdGhlIHByb3BlcnR5IHNldHRlciBkb2Vzbid0IHdvcmsgcmVsaWFibHkuXG4gKiBJbiB0aGUgZXhhbXBsZSBvZiBgd2lkdGhgL2BoZWlnaHRgLCB0aGUgcHJvYmxlbSBpcyB0aGF0IHRoZSBzZXR0ZXIgb25seVxuICogYWNjZXB0cyBudW1lcmljIHZhbHVlcywgYnV0IHRoZSBhdHRyaWJ1dGUgY2FuIGFsc28gYmUgc2V0IHRvIGEgc3RyaW5nIGxpa2UgYDUwJWAuXG4gKiBJZiB0aGlzIGxpc3QgYmVjb21lcyB0b28gYmlnLCByZXRoaW5rIHRoaXMgYXBwcm9hY2guXG4gKi9cbmNvbnN0IGFsd2F5c19zZXRfdGhyb3VnaF9zZXRfYXR0cmlidXRlID0gWyd3aWR0aCcsICdoZWlnaHQnXTtcbmZ1bmN0aW9uIHNldF9hdHRyaWJ1dGVzKG5vZGUsIGF0dHJpYnV0ZXMpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgZGVzY3JpcHRvcnMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhub2RlLl9fcHJvdG9fXyk7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gYXR0cmlidXRlcykge1xuICAgICAgICBpZiAoYXR0cmlidXRlc1trZXldID09IG51bGwpIHtcbiAgICAgICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoa2V5ID09PSAnc3R5bGUnKSB7XG4gICAgICAgICAgICBub2RlLnN0eWxlLmNzc1RleHQgPSBhdHRyaWJ1dGVzW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoa2V5ID09PSAnX192YWx1ZScpIHtcbiAgICAgICAgICAgIG5vZGUudmFsdWUgPSBub2RlW2tleV0gPSBhdHRyaWJ1dGVzW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGVzY3JpcHRvcnNba2V5XSAmJiBkZXNjcmlwdG9yc1trZXldLnNldCAmJiBhbHdheXNfc2V0X3Rocm91Z2hfc2V0X2F0dHJpYnV0ZS5pbmRleE9mKGtleSkgPT09IC0xKSB7XG4gICAgICAgICAgICBub2RlW2tleV0gPSBhdHRyaWJ1dGVzW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhdHRyKG5vZGUsIGtleSwgYXR0cmlidXRlc1trZXldKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIHNldF9zdmdfYXR0cmlidXRlcyhub2RlLCBhdHRyaWJ1dGVzKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gYXR0cmlidXRlcykge1xuICAgICAgICBhdHRyKG5vZGUsIGtleSwgYXR0cmlidXRlc1trZXldKTtcbiAgICB9XG59XG5mdW5jdGlvbiBzZXRfY3VzdG9tX2VsZW1lbnRfZGF0YV9tYXAobm9kZSwgZGF0YV9tYXApIHtcbiAgICBPYmplY3Qua2V5cyhkYXRhX21hcCkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIHNldF9jdXN0b21fZWxlbWVudF9kYXRhKG5vZGUsIGtleSwgZGF0YV9tYXBba2V5XSk7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBzZXRfY3VzdG9tX2VsZW1lbnRfZGF0YShub2RlLCBwcm9wLCB2YWx1ZSkge1xuICAgIGlmIChwcm9wIGluIG5vZGUpIHtcbiAgICAgICAgbm9kZVtwcm9wXSA9IHR5cGVvZiBub2RlW3Byb3BdID09PSAnYm9vbGVhbicgJiYgdmFsdWUgPT09ICcnID8gdHJ1ZSA6IHZhbHVlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgYXR0cihub2RlLCBwcm9wLCB2YWx1ZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gc2V0X2R5bmFtaWNfZWxlbWVudF9kYXRhKHRhZykge1xuICAgIHJldHVybiAoLy0vLnRlc3QodGFnKSkgPyBzZXRfY3VzdG9tX2VsZW1lbnRfZGF0YV9tYXAgOiBzZXRfYXR0cmlidXRlcztcbn1cbmZ1bmN0aW9uIHhsaW5rX2F0dHIobm9kZSwgYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgIG5vZGUuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCBhdHRyaWJ1dGUsIHZhbHVlKTtcbn1cbmZ1bmN0aW9uIGdldF9iaW5kaW5nX2dyb3VwX3ZhbHVlKGdyb3VwLCBfX3ZhbHVlLCBjaGVja2VkKSB7XG4gICAgY29uc3QgdmFsdWUgPSBuZXcgU2V0KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBncm91cC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAoZ3JvdXBbaV0uY2hlY2tlZClcbiAgICAgICAgICAgIHZhbHVlLmFkZChncm91cFtpXS5fX3ZhbHVlKTtcbiAgICB9XG4gICAgaWYgKCFjaGVja2VkKSB7XG4gICAgICAgIHZhbHVlLmRlbGV0ZShfX3ZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIEFycmF5LmZyb20odmFsdWUpO1xufVxuZnVuY3Rpb24gaW5pdF9iaW5kaW5nX2dyb3VwKGdyb3VwKSB7XG4gICAgbGV0IF9pbnB1dHM7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgLyogcHVzaCAqLyBwKC4uLmlucHV0cykge1xuICAgICAgICAgICAgX2lucHV0cyA9IGlucHV0cztcbiAgICAgICAgICAgIF9pbnB1dHMuZm9yRWFjaChpbnB1dCA9PiBncm91cC5wdXNoKGlucHV0KSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qIHJlbW92ZSAqLyByKCkge1xuICAgICAgICAgICAgX2lucHV0cy5mb3JFYWNoKGlucHV0ID0+IGdyb3VwLnNwbGljZShncm91cC5pbmRleE9mKGlucHV0KSwgMSkpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGluaXRfYmluZGluZ19ncm91cF9keW5hbWljKGdyb3VwLCBpbmRleGVzKSB7XG4gICAgbGV0IF9ncm91cCA9IGdldF9iaW5kaW5nX2dyb3VwKGdyb3VwKTtcbiAgICBsZXQgX2lucHV0cztcbiAgICBmdW5jdGlvbiBnZXRfYmluZGluZ19ncm91cChncm91cCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluZGV4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGdyb3VwID0gZ3JvdXBbaW5kZXhlc1tpXV0gPSBncm91cFtpbmRleGVzW2ldXSB8fCBbXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ3JvdXA7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHB1c2goKSB7XG4gICAgICAgIF9pbnB1dHMuZm9yRWFjaChpbnB1dCA9PiBfZ3JvdXAucHVzaChpbnB1dCkpO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICAgIF9pbnB1dHMuZm9yRWFjaChpbnB1dCA9PiBfZ3JvdXAuc3BsaWNlKF9ncm91cC5pbmRleE9mKGlucHV0KSwgMSkpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICAvKiB1cGRhdGUgKi8gdShuZXdfaW5kZXhlcykge1xuICAgICAgICAgICAgaW5kZXhlcyA9IG5ld19pbmRleGVzO1xuICAgICAgICAgICAgY29uc3QgbmV3X2dyb3VwID0gZ2V0X2JpbmRpbmdfZ3JvdXAoZ3JvdXApO1xuICAgICAgICAgICAgaWYgKG5ld19ncm91cCAhPT0gX2dyb3VwKSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgX2dyb3VwID0gbmV3X2dyb3VwO1xuICAgICAgICAgICAgICAgIHB1c2goKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLyogcHVzaCAqLyBwKC4uLmlucHV0cykge1xuICAgICAgICAgICAgX2lucHV0cyA9IGlucHV0cztcbiAgICAgICAgICAgIHB1c2goKTtcbiAgICAgICAgfSxcbiAgICAgICAgLyogcmVtb3ZlICovIHI6IHJlbW92ZVxuICAgIH07XG59XG5mdW5jdGlvbiB0b19udW1iZXIodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09ICcnID8gbnVsbCA6ICt2YWx1ZTtcbn1cbmZ1bmN0aW9uIHRpbWVfcmFuZ2VzX3RvX2FycmF5KHJhbmdlcykge1xuICAgIGNvbnN0IGFycmF5ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgYXJyYXkucHVzaCh7IHN0YXJ0OiByYW5nZXMuc3RhcnQoaSksIGVuZDogcmFuZ2VzLmVuZChpKSB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5O1xufVxuZnVuY3Rpb24gY2hpbGRyZW4oZWxlbWVudCkge1xuICAgIHJldHVybiBBcnJheS5mcm9tKGVsZW1lbnQuY2hpbGROb2Rlcyk7XG59XG5mdW5jdGlvbiBpbml0X2NsYWltX2luZm8obm9kZXMpIHtcbiAgICBpZiAobm9kZXMuY2xhaW1faW5mbyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG5vZGVzLmNsYWltX2luZm8gPSB7IGxhc3RfaW5kZXg6IDAsIHRvdGFsX2NsYWltZWQ6IDAgfTtcbiAgICB9XG59XG5mdW5jdGlvbiBjbGFpbV9ub2RlKG5vZGVzLCBwcmVkaWNhdGUsIHByb2Nlc3NOb2RlLCBjcmVhdGVOb2RlLCBkb250VXBkYXRlTGFzdEluZGV4ID0gZmFsc2UpIHtcbiAgICAvLyBUcnkgdG8gZmluZCBub2RlcyBpbiBhbiBvcmRlciBzdWNoIHRoYXQgd2UgbGVuZ3RoZW4gdGhlIGxvbmdlc3QgaW5jcmVhc2luZyBzdWJzZXF1ZW5jZVxuICAgIGluaXRfY2xhaW1faW5mbyhub2Rlcyk7XG4gICAgY29uc3QgcmVzdWx0Tm9kZSA9ICgoKSA9PiB7XG4gICAgICAgIC8vIFdlIGZpcnN0IHRyeSB0byBmaW5kIGFuIGVsZW1lbnQgYWZ0ZXIgdGhlIHByZXZpb3VzIG9uZVxuICAgICAgICBmb3IgKGxldCBpID0gbm9kZXMuY2xhaW1faW5mby5sYXN0X2luZGV4OyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcbiAgICAgICAgICAgIGlmIChwcmVkaWNhdGUobm9kZSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXBsYWNlbWVudCA9IHByb2Nlc3NOb2RlKG5vZGUpO1xuICAgICAgICAgICAgICAgIGlmIChyZXBsYWNlbWVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzW2ldID0gcmVwbGFjZW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghZG9udFVwZGF0ZUxhc3RJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBub2Rlcy5jbGFpbV9pbmZvLmxhc3RfaW5kZXggPSBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBPdGhlcndpc2UsIHdlIHRyeSB0byBmaW5kIG9uZSBiZWZvcmVcbiAgICAgICAgLy8gV2UgaXRlcmF0ZSBpbiByZXZlcnNlIHNvIHRoYXQgd2UgZG9uJ3QgZ28gdG9vIGZhciBiYWNrXG4gICAgICAgIGZvciAobGV0IGkgPSBub2Rlcy5jbGFpbV9pbmZvLmxhc3RfaW5kZXggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgICAgICAgaWYgKHByZWRpY2F0ZShub2RlKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlcGxhY2VtZW50ID0gcHJvY2Vzc05vZGUobm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKHJlcGxhY2VtZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0gPSByZXBsYWNlbWVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCFkb250VXBkYXRlTGFzdEluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLmNsYWltX2luZm8ubGFzdF9pbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHJlcGxhY2VtZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gU2luY2Ugd2Ugc3BsaWNlZCBiZWZvcmUgdGhlIGxhc3RfaW5kZXgsIHdlIGRlY3JlYXNlIGl0XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLmNsYWltX2luZm8ubGFzdF9pbmRleC0tO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBJZiB3ZSBjYW4ndCBmaW5kIGFueSBtYXRjaGluZyBub2RlLCB3ZSBjcmVhdGUgYSBuZXcgb25lXG4gICAgICAgIHJldHVybiBjcmVhdGVOb2RlKCk7XG4gICAgfSkoKTtcbiAgICByZXN1bHROb2RlLmNsYWltX29yZGVyID0gbm9kZXMuY2xhaW1faW5mby50b3RhbF9jbGFpbWVkO1xuICAgIG5vZGVzLmNsYWltX2luZm8udG90YWxfY2xhaW1lZCArPSAxO1xuICAgIHJldHVybiByZXN1bHROb2RlO1xufVxuZnVuY3Rpb24gY2xhaW1fZWxlbWVudF9iYXNlKG5vZGVzLCBuYW1lLCBhdHRyaWJ1dGVzLCBjcmVhdGVfZWxlbWVudCkge1xuICAgIHJldHVybiBjbGFpbV9ub2RlKG5vZGVzLCAobm9kZSkgPT4gbm9kZS5ub2RlTmFtZSA9PT0gbmFtZSwgKG5vZGUpID0+IHtcbiAgICAgICAgY29uc3QgcmVtb3ZlID0gW107XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbm9kZS5hdHRyaWJ1dGVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBub2RlLmF0dHJpYnV0ZXNbal07XG4gICAgICAgICAgICBpZiAoIWF0dHJpYnV0ZXNbYXR0cmlidXRlLm5hbWVdKSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlLnB1c2goYXR0cmlidXRlLm5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlbW92ZS5mb3JFYWNoKHYgPT4gbm9kZS5yZW1vdmVBdHRyaWJ1dGUodikpO1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0sICgpID0+IGNyZWF0ZV9lbGVtZW50KG5hbWUpKTtcbn1cbmZ1bmN0aW9uIGNsYWltX2VsZW1lbnQobm9kZXMsIG5hbWUsIGF0dHJpYnV0ZXMpIHtcbiAgICByZXR1cm4gY2xhaW1fZWxlbWVudF9iYXNlKG5vZGVzLCBuYW1lLCBhdHRyaWJ1dGVzLCBlbGVtZW50KTtcbn1cbmZ1bmN0aW9uIGNsYWltX3N2Z19lbGVtZW50KG5vZGVzLCBuYW1lLCBhdHRyaWJ1dGVzKSB7XG4gICAgcmV0dXJuIGNsYWltX2VsZW1lbnRfYmFzZShub2RlcywgbmFtZSwgYXR0cmlidXRlcywgc3ZnX2VsZW1lbnQpO1xufVxuZnVuY3Rpb24gY2xhaW1fdGV4dChub2RlcywgZGF0YSkge1xuICAgIHJldHVybiBjbGFpbV9ub2RlKG5vZGVzLCAobm9kZSkgPT4gbm9kZS5ub2RlVHlwZSA9PT0gMywgKG5vZGUpID0+IHtcbiAgICAgICAgY29uc3QgZGF0YVN0ciA9ICcnICsgZGF0YTtcbiAgICAgICAgaWYgKG5vZGUuZGF0YS5zdGFydHNXaXRoKGRhdGFTdHIpKSB7XG4gICAgICAgICAgICBpZiAobm9kZS5kYXRhLmxlbmd0aCAhPT0gZGF0YVN0ci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZS5zcGxpdFRleHQoZGF0YVN0ci5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbm9kZS5kYXRhID0gZGF0YVN0cjtcbiAgICAgICAgfVxuICAgIH0sICgpID0+IHRleHQoZGF0YSksIHRydWUgLy8gVGV4dCBub2RlcyBzaG91bGQgbm90IHVwZGF0ZSBsYXN0IGluZGV4IHNpbmNlIGl0IGlzIGxpa2VseSBub3Qgd29ydGggaXQgdG8gZWxpbWluYXRlIGFuIGluY3JlYXNpbmcgc3Vic2VxdWVuY2Ugb2YgYWN0dWFsIGVsZW1lbnRzXG4gICAgKTtcbn1cbmZ1bmN0aW9uIGNsYWltX3NwYWNlKG5vZGVzKSB7XG4gICAgcmV0dXJuIGNsYWltX3RleHQobm9kZXMsICcgJyk7XG59XG5mdW5jdGlvbiBjbGFpbV9jb21tZW50KG5vZGVzLCBkYXRhKSB7XG4gICAgcmV0dXJuIGNsYWltX25vZGUobm9kZXMsIChub2RlKSA9PiBub2RlLm5vZGVUeXBlID09PSA4LCAobm9kZSkgPT4ge1xuICAgICAgICBub2RlLmRhdGEgPSAnJyArIGRhdGE7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSwgKCkgPT4gY29tbWVudChkYXRhKSwgdHJ1ZSk7XG59XG5mdW5jdGlvbiBmaW5kX2NvbW1lbnQobm9kZXMsIHRleHQsIHN0YXJ0KSB7XG4gICAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDwgbm9kZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY29uc3Qgbm9kZSA9IG5vZGVzW2ldO1xuICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gOCAvKiBjb21tZW50IG5vZGUgKi8gJiYgbm9kZS50ZXh0Q29udGVudC50cmltKCkgPT09IHRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBub2Rlcy5sZW5ndGg7XG59XG5mdW5jdGlvbiBjbGFpbV9odG1sX3RhZyhub2RlcywgaXNfc3ZnKSB7XG4gICAgLy8gZmluZCBodG1sIG9wZW5pbmcgdGFnXG4gICAgY29uc3Qgc3RhcnRfaW5kZXggPSBmaW5kX2NvbW1lbnQobm9kZXMsICdIVE1MX1RBR19TVEFSVCcsIDApO1xuICAgIGNvbnN0IGVuZF9pbmRleCA9IGZpbmRfY29tbWVudChub2RlcywgJ0hUTUxfVEFHX0VORCcsIHN0YXJ0X2luZGV4KTtcbiAgICBpZiAoc3RhcnRfaW5kZXggPT09IGVuZF9pbmRleCkge1xuICAgICAgICByZXR1cm4gbmV3IEh0bWxUYWdIeWRyYXRpb24odW5kZWZpbmVkLCBpc19zdmcpO1xuICAgIH1cbiAgICBpbml0X2NsYWltX2luZm8obm9kZXMpO1xuICAgIGNvbnN0IGh0bWxfdGFnX25vZGVzID0gbm9kZXMuc3BsaWNlKHN0YXJ0X2luZGV4LCBlbmRfaW5kZXggLSBzdGFydF9pbmRleCArIDEpO1xuICAgIGRldGFjaChodG1sX3RhZ19ub2Rlc1swXSk7XG4gICAgZGV0YWNoKGh0bWxfdGFnX25vZGVzW2h0bWxfdGFnX25vZGVzLmxlbmd0aCAtIDFdKTtcbiAgICBjb25zdCBjbGFpbWVkX25vZGVzID0gaHRtbF90YWdfbm9kZXMuc2xpY2UoMSwgaHRtbF90YWdfbm9kZXMubGVuZ3RoIC0gMSk7XG4gICAgZm9yIChjb25zdCBuIG9mIGNsYWltZWRfbm9kZXMpIHtcbiAgICAgICAgbi5jbGFpbV9vcmRlciA9IG5vZGVzLmNsYWltX2luZm8udG90YWxfY2xhaW1lZDtcbiAgICAgICAgbm9kZXMuY2xhaW1faW5mby50b3RhbF9jbGFpbWVkICs9IDE7XG4gICAgfVxuICAgIHJldHVybiBuZXcgSHRtbFRhZ0h5ZHJhdGlvbihjbGFpbWVkX25vZGVzLCBpc19zdmcpO1xufVxuZnVuY3Rpb24gc2V0X2RhdGEodGV4dCwgZGF0YSkge1xuICAgIGRhdGEgPSAnJyArIGRhdGE7XG4gICAgaWYgKHRleHQuZGF0YSA9PT0gZGF0YSlcbiAgICAgICAgcmV0dXJuO1xuICAgIHRleHQuZGF0YSA9IGRhdGE7XG59XG5mdW5jdGlvbiBzZXRfZGF0YV9jb250ZW50ZWRpdGFibGUodGV4dCwgZGF0YSkge1xuICAgIGRhdGEgPSAnJyArIGRhdGE7XG4gICAgaWYgKHRleHQud2hvbGVUZXh0ID09PSBkYXRhKVxuICAgICAgICByZXR1cm47XG4gICAgdGV4dC5kYXRhID0gZGF0YTtcbn1cbmZ1bmN0aW9uIHNldF9kYXRhX21heWJlX2NvbnRlbnRlZGl0YWJsZSh0ZXh0LCBkYXRhLCBhdHRyX3ZhbHVlKSB7XG4gICAgaWYgKH5jb250ZW50ZWRpdGFibGVfdHJ1dGh5X3ZhbHVlcy5pbmRleE9mKGF0dHJfdmFsdWUpKSB7XG4gICAgICAgIHNldF9kYXRhX2NvbnRlbnRlZGl0YWJsZSh0ZXh0LCBkYXRhKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHNldF9kYXRhKHRleHQsIGRhdGEpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNldF9pbnB1dF92YWx1ZShpbnB1dCwgdmFsdWUpIHtcbiAgICBpbnB1dC52YWx1ZSA9IHZhbHVlID09IG51bGwgPyAnJyA6IHZhbHVlO1xufVxuZnVuY3Rpb24gc2V0X2lucHV0X3R5cGUoaW5wdXQsIHR5cGUpIHtcbiAgICB0cnkge1xuICAgICAgICBpbnB1dC50eXBlID0gdHlwZTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNldF9zdHlsZShub2RlLCBrZXksIHZhbHVlLCBpbXBvcnRhbnQpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgICBub2RlLnN0eWxlLnJlbW92ZVByb3BlcnR5KGtleSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBub2RlLnN0eWxlLnNldFByb3BlcnR5KGtleSwgdmFsdWUsIGltcG9ydGFudCA/ICdpbXBvcnRhbnQnIDogJycpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNlbGVjdF9vcHRpb24oc2VsZWN0LCB2YWx1ZSwgbW91bnRpbmcpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNlbGVjdC5vcHRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHNlbGVjdC5vcHRpb25zW2ldO1xuICAgICAgICBpZiAob3B0aW9uLl9fdmFsdWUgPT09IHZhbHVlKSB7XG4gICAgICAgICAgICBvcHRpb24uc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICghbW91bnRpbmcgfHwgdmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBzZWxlY3Quc2VsZWN0ZWRJbmRleCA9IC0xOyAvLyBubyBvcHRpb24gc2hvdWxkIGJlIHNlbGVjdGVkXG4gICAgfVxufVxuZnVuY3Rpb24gc2VsZWN0X29wdGlvbnMoc2VsZWN0LCB2YWx1ZSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZWN0Lm9wdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gc2VsZWN0Lm9wdGlvbnNbaV07XG4gICAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IH52YWx1ZS5pbmRleE9mKG9wdGlvbi5fX3ZhbHVlKTtcbiAgICB9XG59XG5mdW5jdGlvbiBzZWxlY3RfdmFsdWUoc2VsZWN0KSB7XG4gICAgY29uc3Qgc2VsZWN0ZWRfb3B0aW9uID0gc2VsZWN0LnF1ZXJ5U2VsZWN0b3IoJzpjaGVja2VkJyk7XG4gICAgcmV0dXJuIHNlbGVjdGVkX29wdGlvbiAmJiBzZWxlY3RlZF9vcHRpb24uX192YWx1ZTtcbn1cbmZ1bmN0aW9uIHNlbGVjdF9tdWx0aXBsZV92YWx1ZShzZWxlY3QpIHtcbiAgICByZXR1cm4gW10ubWFwLmNhbGwoc2VsZWN0LnF1ZXJ5U2VsZWN0b3JBbGwoJzpjaGVja2VkJyksIG9wdGlvbiA9PiBvcHRpb24uX192YWx1ZSk7XG59XG4vLyB1bmZvcnR1bmF0ZWx5IHRoaXMgY2FuJ3QgYmUgYSBjb25zdGFudCBhcyB0aGF0IHdvdWxkbid0IGJlIHRyZWUtc2hha2VhYmxlXG4vLyBzbyB3ZSBjYWNoZSB0aGUgcmVzdWx0IGluc3RlYWRcbmxldCBjcm9zc29yaWdpbjtcbmZ1bmN0aW9uIGlzX2Nyb3Nzb3JpZ2luKCkge1xuICAgIGlmIChjcm9zc29yaWdpbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNyb3Nzb3JpZ2luID0gZmFsc2U7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnBhcmVudCkge1xuICAgICAgICAgICAgICAgIHZvaWQgd2luZG93LnBhcmVudC5kb2N1bWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNyb3Nzb3JpZ2luID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY3Jvc3NvcmlnaW47XG59XG5mdW5jdGlvbiBhZGRfaWZyYW1lX3Jlc2l6ZV9saXN0ZW5lcihub2RlLCBmbikge1xuICAgIGNvbnN0IGNvbXB1dGVkX3N0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICBpZiAoY29tcHV0ZWRfc3R5bGUucG9zaXRpb24gPT09ICdzdGF0aWMnKSB7XG4gICAgICAgIG5vZGUuc3R5bGUucG9zaXRpb24gPSAncmVsYXRpdmUnO1xuICAgIH1cbiAgICBjb25zdCBpZnJhbWUgPSBlbGVtZW50KCdpZnJhbWUnKTtcbiAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdzdHlsZScsICdkaXNwbGF5OiBibG9jazsgcG9zaXRpb246IGFic29sdXRlOyB0b3A6IDA7IGxlZnQ6IDA7IHdpZHRoOiAxMDAlOyBoZWlnaHQ6IDEwMCU7ICcgK1xuICAgICAgICAnb3ZlcmZsb3c6IGhpZGRlbjsgYm9yZGVyOiAwOyBvcGFjaXR5OiAwOyBwb2ludGVyLWV2ZW50czogbm9uZTsgei1pbmRleDogLTE7Jyk7XG4gICAgaWZyYW1lLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuICAgIGlmcmFtZS50YWJJbmRleCA9IC0xO1xuICAgIGNvbnN0IGNyb3Nzb3JpZ2luID0gaXNfY3Jvc3NvcmlnaW4oKTtcbiAgICBsZXQgdW5zdWJzY3JpYmU7XG4gICAgaWYgKGNyb3Nzb3JpZ2luKSB7XG4gICAgICAgIGlmcmFtZS5zcmMgPSBcImRhdGE6dGV4dC9odG1sLDxzY3JpcHQ+b25yZXNpemU9ZnVuY3Rpb24oKXtwYXJlbnQucG9zdE1lc3NhZ2UoMCwnKicpfTwvc2NyaXB0PlwiO1xuICAgICAgICB1bnN1YnNjcmliZSA9IGxpc3Rlbih3aW5kb3csICdtZXNzYWdlJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuc291cmNlID09PSBpZnJhbWUuY29udGVudFdpbmRvdylcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmcmFtZS5zcmMgPSAnYWJvdXQ6YmxhbmsnO1xuICAgICAgICBpZnJhbWUub25sb2FkID0gKCkgPT4ge1xuICAgICAgICAgICAgdW5zdWJzY3JpYmUgPSBsaXN0ZW4oaWZyYW1lLmNvbnRlbnRXaW5kb3csICdyZXNpemUnLCBmbik7XG4gICAgICAgICAgICAvLyBtYWtlIHN1cmUgYW4gaW5pdGlhbCByZXNpemUgZXZlbnQgaXMgZmlyZWQgX2FmdGVyXyB0aGUgaWZyYW1lIGlzIGxvYWRlZCAod2hpY2ggaXMgYXN5bmNocm9ub3VzKVxuICAgICAgICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9zdmVsdGVqcy9zdmVsdGUvaXNzdWVzLzQyMzNcbiAgICAgICAgICAgIGZuKCk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGFwcGVuZChub2RlLCBpZnJhbWUpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGlmIChjcm9zc29yaWdpbikge1xuICAgICAgICAgICAgdW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh1bnN1YnNjcmliZSAmJiBpZnJhbWUuY29udGVudFdpbmRvdykge1xuICAgICAgICAgICAgdW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgICAgICBkZXRhY2goaWZyYW1lKTtcbiAgICB9O1xufVxuY29uc3QgcmVzaXplX29ic2VydmVyX2NvbnRlbnRfYm94ID0gLyogQF9fUFVSRV9fICovIG5ldyBSZXNpemVPYnNlcnZlclNpbmdsZXRvbih7IGJveDogJ2NvbnRlbnQtYm94JyB9KTtcbmNvbnN0IHJlc2l6ZV9vYnNlcnZlcl9ib3JkZXJfYm94ID0gLyogQF9fUFVSRV9fICovIG5ldyBSZXNpemVPYnNlcnZlclNpbmdsZXRvbih7IGJveDogJ2JvcmRlci1ib3gnIH0pO1xuY29uc3QgcmVzaXplX29ic2VydmVyX2RldmljZV9waXhlbF9jb250ZW50X2JveCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgUmVzaXplT2JzZXJ2ZXJTaW5nbGV0b24oeyBib3g6ICdkZXZpY2UtcGl4ZWwtY29udGVudC1ib3gnIH0pO1xuZnVuY3Rpb24gdG9nZ2xlX2NsYXNzKGVsZW1lbnQsIG5hbWUsIHRvZ2dsZSkge1xuICAgIGVsZW1lbnQuY2xhc3NMaXN0W3RvZ2dsZSA/ICdhZGQnIDogJ3JlbW92ZSddKG5hbWUpO1xufVxuZnVuY3Rpb24gY3VzdG9tX2V2ZW50KHR5cGUsIGRldGFpbCwgeyBidWJibGVzID0gZmFsc2UsIGNhbmNlbGFibGUgPSBmYWxzZSB9ID0ge30pIHtcbiAgICBjb25zdCBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0N1c3RvbUV2ZW50Jyk7XG4gICAgZS5pbml0Q3VzdG9tRXZlbnQodHlwZSwgYnViYmxlcywgY2FuY2VsYWJsZSwgZGV0YWlsKTtcbiAgICByZXR1cm4gZTtcbn1cbmZ1bmN0aW9uIHF1ZXJ5X3NlbGVjdG9yX2FsbChzZWxlY3RvciwgcGFyZW50ID0gZG9jdW1lbnQuYm9keSkge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHBhcmVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSk7XG59XG5mdW5jdGlvbiBoZWFkX3NlbGVjdG9yKG5vZGVJZCwgaGVhZCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGxldCBzdGFydGVkID0gMDtcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2YgaGVhZC5jaGlsZE5vZGVzKSB7XG4gICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSA4IC8qIGNvbW1lbnQgbm9kZSAqLykge1xuICAgICAgICAgICAgY29uc3QgY29tbWVudCA9IG5vZGUudGV4dENvbnRlbnQudHJpbSgpO1xuICAgICAgICAgICAgaWYgKGNvbW1lbnQgPT09IGBIRUFEXyR7bm9kZUlkfV9FTkRgKSB7XG4gICAgICAgICAgICAgICAgc3RhcnRlZCAtPSAxO1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY29tbWVudCA9PT0gYEhFQURfJHtub2RlSWR9X1NUQVJUYCkge1xuICAgICAgICAgICAgICAgIHN0YXJ0ZWQgKz0gMTtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzdGFydGVkID4gMCkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2gobm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbmNsYXNzIEh0bWxUYWcge1xuICAgIGNvbnN0cnVjdG9yKGlzX3N2ZyA9IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuaXNfc3ZnID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNfc3ZnID0gaXNfc3ZnO1xuICAgICAgICB0aGlzLmUgPSB0aGlzLm4gPSBudWxsO1xuICAgIH1cbiAgICBjKGh0bWwpIHtcbiAgICAgICAgdGhpcy5oKGh0bWwpO1xuICAgIH1cbiAgICBtKGh0bWwsIHRhcmdldCwgYW5jaG9yID0gbnVsbCkge1xuICAgICAgICBpZiAoIXRoaXMuZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNfc3ZnKVxuICAgICAgICAgICAgICAgIHRoaXMuZSA9IHN2Z19lbGVtZW50KHRhcmdldC5ub2RlTmFtZSk7XG4gICAgICAgICAgICAvKiogIzczNjQgIHRhcmdldCBmb3IgPHRlbXBsYXRlPiBtYXkgYmUgcHJvdmlkZWQgYXMgI2RvY3VtZW50LWZyYWdtZW50KDExKSAqL1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHRoaXMuZSA9IGVsZW1lbnQoKHRhcmdldC5ub2RlVHlwZSA9PT0gMTEgPyAnVEVNUExBVEUnIDogdGFyZ2V0Lm5vZGVOYW1lKSk7XG4gICAgICAgICAgICB0aGlzLnQgPSB0YXJnZXQudGFnTmFtZSAhPT0gJ1RFTVBMQVRFJyA/IHRhcmdldCA6IHRhcmdldC5jb250ZW50O1xuICAgICAgICAgICAgdGhpcy5jKGh0bWwpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaShhbmNob3IpO1xuICAgIH1cbiAgICBoKGh0bWwpIHtcbiAgICAgICAgdGhpcy5lLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgIHRoaXMubiA9IEFycmF5LmZyb20odGhpcy5lLm5vZGVOYW1lID09PSAnVEVNUExBVEUnID8gdGhpcy5lLmNvbnRlbnQuY2hpbGROb2RlcyA6IHRoaXMuZS5jaGlsZE5vZGVzKTtcbiAgICB9XG4gICAgaShhbmNob3IpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLm4ubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGluc2VydCh0aGlzLnQsIHRoaXMubltpXSwgYW5jaG9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwKGh0bWwpIHtcbiAgICAgICAgdGhpcy5kKCk7XG4gICAgICAgIHRoaXMuaChodG1sKTtcbiAgICAgICAgdGhpcy5pKHRoaXMuYSk7XG4gICAgfVxuICAgIGQoKSB7XG4gICAgICAgIHRoaXMubi5mb3JFYWNoKGRldGFjaCk7XG4gICAgfVxufVxuY2xhc3MgSHRtbFRhZ0h5ZHJhdGlvbiBleHRlbmRzIEh0bWxUYWcge1xuICAgIGNvbnN0cnVjdG9yKGNsYWltZWRfbm9kZXMsIGlzX3N2ZyA9IGZhbHNlKSB7XG4gICAgICAgIHN1cGVyKGlzX3N2Zyk7XG4gICAgICAgIHRoaXMuZSA9IHRoaXMubiA9IG51bGw7XG4gICAgICAgIHRoaXMubCA9IGNsYWltZWRfbm9kZXM7XG4gICAgfVxuICAgIGMoaHRtbCkge1xuICAgICAgICBpZiAodGhpcy5sKSB7XG4gICAgICAgICAgICB0aGlzLm4gPSB0aGlzLmw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5jKGh0bWwpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGkoYW5jaG9yKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5uLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBpbnNlcnRfaHlkcmF0aW9uKHRoaXMudCwgdGhpcy5uW2ldLCBhbmNob3IpO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gYXR0cmlidXRlX3RvX29iamVjdChhdHRyaWJ1dGVzKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGUgb2YgYXR0cmlidXRlcykge1xuICAgICAgICByZXN1bHRbYXR0cmlidXRlLm5hbWVdID0gYXR0cmlidXRlLnZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gZ2V0X2N1c3RvbV9lbGVtZW50c19zbG90cyhlbGVtZW50KSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgZWxlbWVudC5jaGlsZE5vZGVzLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgICAgcmVzdWx0W25vZGUuc2xvdCB8fCAnZGVmYXVsdCddID0gdHJ1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gY29uc3RydWN0X3N2ZWx0ZV9jb21wb25lbnQoY29tcG9uZW50LCBwcm9wcykge1xuICAgIHJldHVybiBuZXcgY29tcG9uZW50KHByb3BzKTtcbn1cblxuLy8gd2UgbmVlZCB0byBzdG9yZSB0aGUgaW5mb3JtYXRpb24gZm9yIG11bHRpcGxlIGRvY3VtZW50cyBiZWNhdXNlIGEgU3ZlbHRlIGFwcGxpY2F0aW9uIGNvdWxkIGFsc28gY29udGFpbiBpZnJhbWVzXG4vLyBodHRwczovL2dpdGh1Yi5jb20vc3ZlbHRlanMvc3ZlbHRlL2lzc3Vlcy8zNjI0XG5jb25zdCBtYW5hZ2VkX3N0eWxlcyA9IG5ldyBNYXAoKTtcbmxldCBhY3RpdmUgPSAwO1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Rhcmtza3lhcHAvc3RyaW5nLWhhc2gvYmxvYi9tYXN0ZXIvaW5kZXguanNcbmZ1bmN0aW9uIGhhc2goc3RyKSB7XG4gICAgbGV0IGhhc2ggPSA1MzgxO1xuICAgIGxldCBpID0gc3RyLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKVxuICAgICAgICBoYXNoID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgXiBzdHIuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gaGFzaCA+Pj4gMDtcbn1cbmZ1bmN0aW9uIGNyZWF0ZV9zdHlsZV9pbmZvcm1hdGlvbihkb2MsIG5vZGUpIHtcbiAgICBjb25zdCBpbmZvID0geyBzdHlsZXNoZWV0OiBhcHBlbmRfZW1wdHlfc3R5bGVzaGVldChub2RlKSwgcnVsZXM6IHt9IH07XG4gICAgbWFuYWdlZF9zdHlsZXMuc2V0KGRvYywgaW5mbyk7XG4gICAgcmV0dXJuIGluZm87XG59XG5mdW5jdGlvbiBjcmVhdGVfcnVsZShub2RlLCBhLCBiLCBkdXJhdGlvbiwgZGVsYXksIGVhc2UsIGZuLCB1aWQgPSAwKSB7XG4gICAgY29uc3Qgc3RlcCA9IDE2LjY2NiAvIGR1cmF0aW9uO1xuICAgIGxldCBrZXlmcmFtZXMgPSAne1xcbic7XG4gICAgZm9yIChsZXQgcCA9IDA7IHAgPD0gMTsgcCArPSBzdGVwKSB7XG4gICAgICAgIGNvbnN0IHQgPSBhICsgKGIgLSBhKSAqIGVhc2UocCk7XG4gICAgICAgIGtleWZyYW1lcyArPSBwICogMTAwICsgYCV7JHtmbih0LCAxIC0gdCl9fVxcbmA7XG4gICAgfVxuICAgIGNvbnN0IHJ1bGUgPSBrZXlmcmFtZXMgKyBgMTAwJSB7JHtmbihiLCAxIC0gYil9fVxcbn1gO1xuICAgIGNvbnN0IG5hbWUgPSBgX19zdmVsdGVfJHtoYXNoKHJ1bGUpfV8ke3VpZH1gO1xuICAgIGNvbnN0IGRvYyA9IGdldF9yb290X2Zvcl9zdHlsZShub2RlKTtcbiAgICBjb25zdCB7IHN0eWxlc2hlZXQsIHJ1bGVzIH0gPSBtYW5hZ2VkX3N0eWxlcy5nZXQoZG9jKSB8fCBjcmVhdGVfc3R5bGVfaW5mb3JtYXRpb24oZG9jLCBub2RlKTtcbiAgICBpZiAoIXJ1bGVzW25hbWVdKSB7XG4gICAgICAgIHJ1bGVzW25hbWVdID0gdHJ1ZTtcbiAgICAgICAgc3R5bGVzaGVldC5pbnNlcnRSdWxlKGBAa2V5ZnJhbWVzICR7bmFtZX0gJHtydWxlfWAsIHN0eWxlc2hlZXQuY3NzUnVsZXMubGVuZ3RoKTtcbiAgICB9XG4gICAgY29uc3QgYW5pbWF0aW9uID0gbm9kZS5zdHlsZS5hbmltYXRpb24gfHwgJyc7XG4gICAgbm9kZS5zdHlsZS5hbmltYXRpb24gPSBgJHthbmltYXRpb24gPyBgJHthbmltYXRpb259LCBgIDogJyd9JHtuYW1lfSAke2R1cmF0aW9ufW1zIGxpbmVhciAke2RlbGF5fW1zIDEgYm90aGA7XG4gICAgYWN0aXZlICs9IDE7XG4gICAgcmV0dXJuIG5hbWU7XG59XG5mdW5jdGlvbiBkZWxldGVfcnVsZShub2RlLCBuYW1lKSB7XG4gICAgY29uc3QgcHJldmlvdXMgPSAobm9kZS5zdHlsZS5hbmltYXRpb24gfHwgJycpLnNwbGl0KCcsICcpO1xuICAgIGNvbnN0IG5leHQgPSBwcmV2aW91cy5maWx0ZXIobmFtZVxuICAgICAgICA/IGFuaW0gPT4gYW5pbS5pbmRleE9mKG5hbWUpIDwgMCAvLyByZW1vdmUgc3BlY2lmaWMgYW5pbWF0aW9uXG4gICAgICAgIDogYW5pbSA9PiBhbmltLmluZGV4T2YoJ19fc3ZlbHRlJykgPT09IC0xIC8vIHJlbW92ZSBhbGwgU3ZlbHRlIGFuaW1hdGlvbnNcbiAgICApO1xuICAgIGNvbnN0IGRlbGV0ZWQgPSBwcmV2aW91cy5sZW5ndGggLSBuZXh0Lmxlbmd0aDtcbiAgICBpZiAoZGVsZXRlZCkge1xuICAgICAgICBub2RlLnN0eWxlLmFuaW1hdGlvbiA9IG5leHQuam9pbignLCAnKTtcbiAgICAgICAgYWN0aXZlIC09IGRlbGV0ZWQ7XG4gICAgICAgIGlmICghYWN0aXZlKVxuICAgICAgICAgICAgY2xlYXJfcnVsZXMoKTtcbiAgICB9XG59XG5mdW5jdGlvbiBjbGVhcl9ydWxlcygpIHtcbiAgICByYWYoKCkgPT4ge1xuICAgICAgICBpZiAoYWN0aXZlKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBtYW5hZ2VkX3N0eWxlcy5mb3JFYWNoKGluZm8gPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBvd25lck5vZGUgfSA9IGluZm8uc3R5bGVzaGVldDtcbiAgICAgICAgICAgIC8vIHRoZXJlIGlzIG5vIG93bmVyTm9kZSBpZiBpdCBydW5zIG9uIGpzZG9tLlxuICAgICAgICAgICAgaWYgKG93bmVyTm9kZSlcbiAgICAgICAgICAgICAgICBkZXRhY2gob3duZXJOb2RlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIG1hbmFnZWRfc3R5bGVzLmNsZWFyKCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZV9hbmltYXRpb24obm9kZSwgZnJvbSwgZm4sIHBhcmFtcykge1xuICAgIGlmICghZnJvbSlcbiAgICAgICAgcmV0dXJuIG5vb3A7XG4gICAgY29uc3QgdG8gPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGlmIChmcm9tLmxlZnQgPT09IHRvLmxlZnQgJiYgZnJvbS5yaWdodCA9PT0gdG8ucmlnaHQgJiYgZnJvbS50b3AgPT09IHRvLnRvcCAmJiBmcm9tLmJvdHRvbSA9PT0gdG8uYm90dG9tKVxuICAgICAgICByZXR1cm4gbm9vcDtcbiAgICBjb25zdCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSAzMDAsIGVhc2luZyA9IGlkZW50aXR5LCBcbiAgICAvLyBAdHMtaWdub3JlIHRvZG86IHNob3VsZCB0aGlzIGJlIHNlcGFyYXRlZCBmcm9tIGRlc3RydWN0dXJpbmc/IE9yIHN0YXJ0L2VuZCBhZGRlZCB0byBwdWJsaWMgYXBpIGFuZCBkb2N1bWVudGF0aW9uP1xuICAgIHN0YXJ0OiBzdGFydF90aW1lID0gbm93KCkgKyBkZWxheSwgXG4gICAgLy8gQHRzLWlnbm9yZSB0b2RvOlxuICAgIGVuZCA9IHN0YXJ0X3RpbWUgKyBkdXJhdGlvbiwgdGljayA9IG5vb3AsIGNzcyB9ID0gZm4obm9kZSwgeyBmcm9tLCB0byB9LCBwYXJhbXMpO1xuICAgIGxldCBydW5uaW5nID0gdHJ1ZTtcbiAgICBsZXQgc3RhcnRlZCA9IGZhbHNlO1xuICAgIGxldCBuYW1lO1xuICAgIGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgICAgICBpZiAoY3NzKSB7XG4gICAgICAgICAgICBuYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgMCwgMSwgZHVyYXRpb24sIGRlbGF5LCBlYXNpbmcsIGNzcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkZWxheSkge1xuICAgICAgICAgICAgc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgICAgaWYgKGNzcylcbiAgICAgICAgICAgIGRlbGV0ZV9ydWxlKG5vZGUsIG5hbWUpO1xuICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgfVxuICAgIGxvb3Aobm93ID0+IHtcbiAgICAgICAgaWYgKCFzdGFydGVkICYmIG5vdyA+PSBzdGFydF90aW1lKSB7XG4gICAgICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhcnRlZCAmJiBub3cgPj0gZW5kKSB7XG4gICAgICAgICAgICB0aWNrKDEsIDApO1xuICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcnVubmluZykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGFydGVkKSB7XG4gICAgICAgICAgICBjb25zdCBwID0gbm93IC0gc3RhcnRfdGltZTtcbiAgICAgICAgICAgIGNvbnN0IHQgPSAwICsgMSAqIGVhc2luZyhwIC8gZHVyYXRpb24pO1xuICAgICAgICAgICAgdGljayh0LCAxIC0gdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gICAgc3RhcnQoKTtcbiAgICB0aWNrKDAsIDEpO1xuICAgIHJldHVybiBzdG9wO1xufVxuZnVuY3Rpb24gZml4X3Bvc2l0aW9uKG5vZGUpIHtcbiAgICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgaWYgKHN0eWxlLnBvc2l0aW9uICE9PSAnYWJzb2x1dGUnICYmIHN0eWxlLnBvc2l0aW9uICE9PSAnZml4ZWQnKSB7XG4gICAgICAgIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gc3R5bGU7XG4gICAgICAgIGNvbnN0IGEgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBub2RlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgbm9kZS5zdHlsZS53aWR0aCA9IHdpZHRoO1xuICAgICAgICBub2RlLnN0eWxlLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgYWRkX3RyYW5zZm9ybShub2RlLCBhKTtcbiAgICB9XG59XG5mdW5jdGlvbiBhZGRfdHJhbnNmb3JtKG5vZGUsIGEpIHtcbiAgICBjb25zdCBiID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBpZiAoYS5sZWZ0ICE9PSBiLmxlZnQgfHwgYS50b3AgIT09IGIudG9wKSB7XG4gICAgICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICAgICAgY29uc3QgdHJhbnNmb3JtID0gc3R5bGUudHJhbnNmb3JtID09PSAnbm9uZScgPyAnJyA6IHN0eWxlLnRyYW5zZm9ybTtcbiAgICAgICAgbm9kZS5zdHlsZS50cmFuc2Zvcm0gPSBgJHt0cmFuc2Zvcm19IHRyYW5zbGF0ZSgke2EubGVmdCAtIGIubGVmdH1weCwgJHthLnRvcCAtIGIudG9wfXB4KWA7XG4gICAgfVxufVxuXG5sZXQgY3VycmVudF9jb21wb25lbnQ7XG5mdW5jdGlvbiBzZXRfY3VycmVudF9jb21wb25lbnQoY29tcG9uZW50KSB7XG4gICAgY3VycmVudF9jb21wb25lbnQgPSBjb21wb25lbnQ7XG59XG5mdW5jdGlvbiBnZXRfY3VycmVudF9jb21wb25lbnQoKSB7XG4gICAgaWYgKCFjdXJyZW50X2NvbXBvbmVudClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGdW5jdGlvbiBjYWxsZWQgb3V0c2lkZSBjb21wb25lbnQgaW5pdGlhbGl6YXRpb24nKTtcbiAgICByZXR1cm4gY3VycmVudF9jb21wb25lbnQ7XG59XG4vKipcbiAqIFNjaGVkdWxlcyBhIGNhbGxiYWNrIHRvIHJ1biBpbW1lZGlhdGVseSBiZWZvcmUgdGhlIGNvbXBvbmVudCBpcyB1cGRhdGVkIGFmdGVyIGFueSBzdGF0ZSBjaGFuZ2UuXG4gKlxuICogVGhlIGZpcnN0IHRpbWUgdGhlIGNhbGxiYWNrIHJ1bnMgd2lsbCBiZSBiZWZvcmUgdGhlIGluaXRpYWwgYG9uTW91bnRgXG4gKlxuICogaHR0cHM6Ly9zdmVsdGUuZGV2L2RvY3MjcnVuLXRpbWUtc3ZlbHRlLWJlZm9yZXVwZGF0ZVxuICovXG5mdW5jdGlvbiBiZWZvcmVVcGRhdGUoZm4pIHtcbiAgICBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5iZWZvcmVfdXBkYXRlLnB1c2goZm4pO1xufVxuLyoqXG4gKiBUaGUgYG9uTW91bnRgIGZ1bmN0aW9uIHNjaGVkdWxlcyBhIGNhbGxiYWNrIHRvIHJ1biBhcyBzb29uIGFzIHRoZSBjb21wb25lbnQgaGFzIGJlZW4gbW91bnRlZCB0byB0aGUgRE9NLlxuICogSXQgbXVzdCBiZSBjYWxsZWQgZHVyaW5nIHRoZSBjb21wb25lbnQncyBpbml0aWFsaXNhdGlvbiAoYnV0IGRvZXNuJ3QgbmVlZCB0byBsaXZlICppbnNpZGUqIHRoZSBjb21wb25lbnQ7XG4gKiBpdCBjYW4gYmUgY2FsbGVkIGZyb20gYW4gZXh0ZXJuYWwgbW9kdWxlKS5cbiAqXG4gKiBgb25Nb3VudGAgZG9lcyBub3QgcnVuIGluc2lkZSBhIFtzZXJ2ZXItc2lkZSBjb21wb25lbnRdKC9kb2NzI3J1bi10aW1lLXNlcnZlci1zaWRlLWNvbXBvbmVudC1hcGkpLlxuICpcbiAqIGh0dHBzOi8vc3ZlbHRlLmRldi9kb2NzI3J1bi10aW1lLXN2ZWx0ZS1vbm1vdW50XG4gKi9cbmZ1bmN0aW9uIG9uTW91bnQoZm4pIHtcbiAgICBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5vbl9tb3VudC5wdXNoKGZuKTtcbn1cbi8qKlxuICogU2NoZWR1bGVzIGEgY2FsbGJhY2sgdG8gcnVuIGltbWVkaWF0ZWx5IGFmdGVyIHRoZSBjb21wb25lbnQgaGFzIGJlZW4gdXBkYXRlZC5cbiAqXG4gKiBUaGUgZmlyc3QgdGltZSB0aGUgY2FsbGJhY2sgcnVucyB3aWxsIGJlIGFmdGVyIHRoZSBpbml0aWFsIGBvbk1vdW50YFxuICovXG5mdW5jdGlvbiBhZnRlclVwZGF0ZShmbikge1xuICAgIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLmFmdGVyX3VwZGF0ZS5wdXNoKGZuKTtcbn1cbi8qKlxuICogU2NoZWR1bGVzIGEgY2FsbGJhY2sgdG8gcnVuIGltbWVkaWF0ZWx5IGJlZm9yZSB0aGUgY29tcG9uZW50IGlzIHVubW91bnRlZC5cbiAqXG4gKiBPdXQgb2YgYG9uTW91bnRgLCBgYmVmb3JlVXBkYXRlYCwgYGFmdGVyVXBkYXRlYCBhbmQgYG9uRGVzdHJveWAsIHRoaXMgaXMgdGhlXG4gKiBvbmx5IG9uZSB0aGF0IHJ1bnMgaW5zaWRlIGEgc2VydmVyLXNpZGUgY29tcG9uZW50LlxuICpcbiAqIGh0dHBzOi8vc3ZlbHRlLmRldi9kb2NzI3J1bi10aW1lLXN2ZWx0ZS1vbmRlc3Ryb3lcbiAqL1xuZnVuY3Rpb24gb25EZXN0cm95KGZuKSB7XG4gICAgZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQub25fZGVzdHJveS5wdXNoKGZuKTtcbn1cbi8qKlxuICogQ3JlYXRlcyBhbiBldmVudCBkaXNwYXRjaGVyIHRoYXQgY2FuIGJlIHVzZWQgdG8gZGlzcGF0Y2ggW2NvbXBvbmVudCBldmVudHNdKC9kb2NzI3RlbXBsYXRlLXN5bnRheC1jb21wb25lbnQtZGlyZWN0aXZlcy1vbi1ldmVudG5hbWUpLlxuICogRXZlbnQgZGlzcGF0Y2hlcnMgYXJlIGZ1bmN0aW9ucyB0aGF0IGNhbiB0YWtlIHR3byBhcmd1bWVudHM6IGBuYW1lYCBhbmQgYGRldGFpbGAuXG4gKlxuICogQ29tcG9uZW50IGV2ZW50cyBjcmVhdGVkIHdpdGggYGNyZWF0ZUV2ZW50RGlzcGF0Y2hlcmAgY3JlYXRlIGFcbiAqIFtDdXN0b21FdmVudF0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0N1c3RvbUV2ZW50KS5cbiAqIFRoZXNlIGV2ZW50cyBkbyBub3QgW2J1YmJsZV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9MZWFybi9KYXZhU2NyaXB0L0J1aWxkaW5nX2Jsb2Nrcy9FdmVudHMjRXZlbnRfYnViYmxpbmdfYW5kX2NhcHR1cmUpLlxuICogVGhlIGBkZXRhaWxgIGFyZ3VtZW50IGNvcnJlc3BvbmRzIHRvIHRoZSBbQ3VzdG9tRXZlbnQuZGV0YWlsXShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvQ3VzdG9tRXZlbnQvZGV0YWlsKVxuICogcHJvcGVydHkgYW5kIGNhbiBjb250YWluIGFueSB0eXBlIG9mIGRhdGEuXG4gKlxuICogaHR0cHM6Ly9zdmVsdGUuZGV2L2RvY3MjcnVuLXRpbWUtc3ZlbHRlLWNyZWF0ZWV2ZW50ZGlzcGF0Y2hlclxuICovXG5mdW5jdGlvbiBjcmVhdGVFdmVudERpc3BhdGNoZXIoKSB7XG4gICAgY29uc3QgY29tcG9uZW50ID0gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCk7XG4gICAgcmV0dXJuICh0eXBlLCBkZXRhaWwsIHsgY2FuY2VsYWJsZSA9IGZhbHNlIH0gPSB7fSkgPT4ge1xuICAgICAgICBjb25zdCBjYWxsYmFja3MgPSBjb21wb25lbnQuJCQuY2FsbGJhY2tzW3R5cGVdO1xuICAgICAgICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgICAgICAgICAvLyBUT0RPIGFyZSB0aGVyZSBzaXR1YXRpb25zIHdoZXJlIGV2ZW50cyBjb3VsZCBiZSBkaXNwYXRjaGVkXG4gICAgICAgICAgICAvLyBpbiBhIHNlcnZlciAobm9uLURPTSkgZW52aXJvbm1lbnQ/XG4gICAgICAgICAgICBjb25zdCBldmVudCA9IGN1c3RvbV9ldmVudCh0eXBlLCBkZXRhaWwsIHsgY2FuY2VsYWJsZSB9KTtcbiAgICAgICAgICAgIGNhbGxiYWNrcy5zbGljZSgpLmZvckVhY2goZm4gPT4ge1xuICAgICAgICAgICAgICAgIGZuLmNhbGwoY29tcG9uZW50LCBldmVudCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiAhZXZlbnQuZGVmYXVsdFByZXZlbnRlZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xufVxuLyoqXG4gKiBBc3NvY2lhdGVzIGFuIGFyYml0cmFyeSBgY29udGV4dGAgb2JqZWN0IHdpdGggdGhlIGN1cnJlbnQgY29tcG9uZW50IGFuZCB0aGUgc3BlY2lmaWVkIGBrZXlgXG4gKiBhbmQgcmV0dXJucyB0aGF0IG9iamVjdC4gVGhlIGNvbnRleHQgaXMgdGhlbiBhdmFpbGFibGUgdG8gY2hpbGRyZW4gb2YgdGhlIGNvbXBvbmVudFxuICogKGluY2x1ZGluZyBzbG90dGVkIGNvbnRlbnQpIHdpdGggYGdldENvbnRleHRgLlxuICpcbiAqIExpa2UgbGlmZWN5Y2xlIGZ1bmN0aW9ucywgdGhpcyBtdXN0IGJlIGNhbGxlZCBkdXJpbmcgY29tcG9uZW50IGluaXRpYWxpc2F0aW9uLlxuICpcbiAqIGh0dHBzOi8vc3ZlbHRlLmRldi9kb2NzI3J1bi10aW1lLXN2ZWx0ZS1zZXRjb250ZXh0XG4gKi9cbmZ1bmN0aW9uIHNldENvbnRleHQoa2V5LCBjb250ZXh0KSB7XG4gICAgZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQuY29udGV4dC5zZXQoa2V5LCBjb250ZXh0KTtcbiAgICByZXR1cm4gY29udGV4dDtcbn1cbi8qKlxuICogUmV0cmlldmVzIHRoZSBjb250ZXh0IHRoYXQgYmVsb25ncyB0byB0aGUgY2xvc2VzdCBwYXJlbnQgY29tcG9uZW50IHdpdGggdGhlIHNwZWNpZmllZCBga2V5YC5cbiAqIE11c3QgYmUgY2FsbGVkIGR1cmluZyBjb21wb25lbnQgaW5pdGlhbGlzYXRpb24uXG4gKlxuICogaHR0cHM6Ly9zdmVsdGUuZGV2L2RvY3MjcnVuLXRpbWUtc3ZlbHRlLWdldGNvbnRleHRcbiAqL1xuZnVuY3Rpb24gZ2V0Q29udGV4dChrZXkpIHtcbiAgICByZXR1cm4gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQuY29udGV4dC5nZXQoa2V5KTtcbn1cbi8qKlxuICogUmV0cmlldmVzIHRoZSB3aG9sZSBjb250ZXh0IG1hcCB0aGF0IGJlbG9uZ3MgdG8gdGhlIGNsb3Nlc3QgcGFyZW50IGNvbXBvbmVudC5cbiAqIE11c3QgYmUgY2FsbGVkIGR1cmluZyBjb21wb25lbnQgaW5pdGlhbGlzYXRpb24uIFVzZWZ1bCwgZm9yIGV4YW1wbGUsIGlmIHlvdVxuICogcHJvZ3JhbW1hdGljYWxseSBjcmVhdGUgYSBjb21wb25lbnQgYW5kIHdhbnQgdG8gcGFzcyB0aGUgZXhpc3RpbmcgY29udGV4dCB0byBpdC5cbiAqXG4gKiBodHRwczovL3N2ZWx0ZS5kZXYvZG9jcyNydW4tdGltZS1zdmVsdGUtZ2V0YWxsY29udGV4dHNcbiAqL1xuZnVuY3Rpb24gZ2V0QWxsQ29udGV4dHMoKSB7XG4gICAgcmV0dXJuIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLmNvbnRleHQ7XG59XG4vKipcbiAqIENoZWNrcyB3aGV0aGVyIGEgZ2l2ZW4gYGtleWAgaGFzIGJlZW4gc2V0IGluIHRoZSBjb250ZXh0IG9mIGEgcGFyZW50IGNvbXBvbmVudC5cbiAqIE11c3QgYmUgY2FsbGVkIGR1cmluZyBjb21wb25lbnQgaW5pdGlhbGlzYXRpb24uXG4gKlxuICogaHR0cHM6Ly9zdmVsdGUuZGV2L2RvY3MjcnVuLXRpbWUtc3ZlbHRlLWhhc2NvbnRleHRcbiAqL1xuZnVuY3Rpb24gaGFzQ29udGV4dChrZXkpIHtcbiAgICByZXR1cm4gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQuY29udGV4dC5oYXMoa2V5KTtcbn1cbi8vIFRPRE8gZmlndXJlIG91dCBpZiB3ZSBzdGlsbCB3YW50IHRvIHN1cHBvcnRcbi8vIHNob3J0aGFuZCBldmVudHMsIG9yIGlmIHdlIHdhbnQgdG8gaW1wbGVtZW50XG4vLyBhIHJlYWwgYnViYmxpbmcgbWVjaGFuaXNtXG5mdW5jdGlvbiBidWJibGUoY29tcG9uZW50LCBldmVudCkge1xuICAgIGNvbnN0IGNhbGxiYWNrcyA9IGNvbXBvbmVudC4kJC5jYWxsYmFja3NbZXZlbnQudHlwZV07XG4gICAgaWYgKGNhbGxiYWNrcykge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGNhbGxiYWNrcy5zbGljZSgpLmZvckVhY2goZm4gPT4gZm4uY2FsbCh0aGlzLCBldmVudCkpO1xuICAgIH1cbn1cblxuY29uc3QgZGlydHlfY29tcG9uZW50cyA9IFtdO1xuY29uc3QgaW50cm9zID0geyBlbmFibGVkOiBmYWxzZSB9O1xuY29uc3QgYmluZGluZ19jYWxsYmFja3MgPSBbXTtcbmxldCByZW5kZXJfY2FsbGJhY2tzID0gW107XG5jb25zdCBmbHVzaF9jYWxsYmFja3MgPSBbXTtcbmNvbnN0IHJlc29sdmVkX3Byb21pc2UgPSAvKiBAX19QVVJFX18gKi8gUHJvbWlzZS5yZXNvbHZlKCk7XG5sZXQgdXBkYXRlX3NjaGVkdWxlZCA9IGZhbHNlO1xuZnVuY3Rpb24gc2NoZWR1bGVfdXBkYXRlKCkge1xuICAgIGlmICghdXBkYXRlX3NjaGVkdWxlZCkge1xuICAgICAgICB1cGRhdGVfc2NoZWR1bGVkID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZWRfcHJvbWlzZS50aGVuKGZsdXNoKTtcbiAgICB9XG59XG5mdW5jdGlvbiB0aWNrKCkge1xuICAgIHNjaGVkdWxlX3VwZGF0ZSgpO1xuICAgIHJldHVybiByZXNvbHZlZF9wcm9taXNlO1xufVxuZnVuY3Rpb24gYWRkX3JlbmRlcl9jYWxsYmFjayhmbikge1xuICAgIHJlbmRlcl9jYWxsYmFja3MucHVzaChmbik7XG59XG5mdW5jdGlvbiBhZGRfZmx1c2hfY2FsbGJhY2soZm4pIHtcbiAgICBmbHVzaF9jYWxsYmFja3MucHVzaChmbik7XG59XG4vLyBmbHVzaCgpIGNhbGxzIGNhbGxiYWNrcyBpbiB0aGlzIG9yZGVyOlxuLy8gMS4gQWxsIGJlZm9yZVVwZGF0ZSBjYWxsYmFja3MsIGluIG9yZGVyOiBwYXJlbnRzIGJlZm9yZSBjaGlsZHJlblxuLy8gMi4gQWxsIGJpbmQ6dGhpcyBjYWxsYmFja3MsIGluIHJldmVyc2Ugb3JkZXI6IGNoaWxkcmVuIGJlZm9yZSBwYXJlbnRzLlxuLy8gMy4gQWxsIGFmdGVyVXBkYXRlIGNhbGxiYWNrcywgaW4gb3JkZXI6IHBhcmVudHMgYmVmb3JlIGNoaWxkcmVuLiBFWENFUFRcbi8vICAgIGZvciBhZnRlclVwZGF0ZXMgY2FsbGVkIGR1cmluZyB0aGUgaW5pdGlhbCBvbk1vdW50LCB3aGljaCBhcmUgY2FsbGVkIGluXG4vLyAgICByZXZlcnNlIG9yZGVyOiBjaGlsZHJlbiBiZWZvcmUgcGFyZW50cy5cbi8vIFNpbmNlIGNhbGxiYWNrcyBtaWdodCB1cGRhdGUgY29tcG9uZW50IHZhbHVlcywgd2hpY2ggY291bGQgdHJpZ2dlciBhbm90aGVyXG4vLyBjYWxsIHRvIGZsdXNoKCksIHRoZSBmb2xsb3dpbmcgc3RlcHMgZ3VhcmQgYWdhaW5zdCB0aGlzOlxuLy8gMS4gRHVyaW5nIGJlZm9yZVVwZGF0ZSwgYW55IHVwZGF0ZWQgY29tcG9uZW50cyB3aWxsIGJlIGFkZGVkIHRvIHRoZVxuLy8gICAgZGlydHlfY29tcG9uZW50cyBhcnJheSBhbmQgd2lsbCBjYXVzZSBhIHJlZW50cmFudCBjYWxsIHRvIGZsdXNoKCkuIEJlY2F1c2Vcbi8vICAgIHRoZSBmbHVzaCBpbmRleCBpcyBrZXB0IG91dHNpZGUgdGhlIGZ1bmN0aW9uLCB0aGUgcmVlbnRyYW50IGNhbGwgd2lsbCBwaWNrXG4vLyAgICB1cCB3aGVyZSB0aGUgZWFybGllciBjYWxsIGxlZnQgb2ZmIGFuZCBnbyB0aHJvdWdoIGFsbCBkaXJ0eSBjb21wb25lbnRzLiBUaGVcbi8vICAgIGN1cnJlbnRfY29tcG9uZW50IHZhbHVlIGlzIHNhdmVkIGFuZCByZXN0b3JlZCBzbyB0aGF0IHRoZSByZWVudHJhbnQgY2FsbCB3aWxsXG4vLyAgICBub3QgaW50ZXJmZXJlIHdpdGggdGhlIFwicGFyZW50XCIgZmx1c2goKSBjYWxsLlxuLy8gMi4gYmluZDp0aGlzIGNhbGxiYWNrcyBjYW5ub3QgdHJpZ2dlciBuZXcgZmx1c2goKSBjYWxscy5cbi8vIDMuIER1cmluZyBhZnRlclVwZGF0ZSwgYW55IHVwZGF0ZWQgY29tcG9uZW50cyB3aWxsIE5PVCBoYXZlIHRoZWlyIGFmdGVyVXBkYXRlXG4vLyAgICBjYWxsYmFjayBjYWxsZWQgYSBzZWNvbmQgdGltZTsgdGhlIHNlZW5fY2FsbGJhY2tzIHNldCwgb3V0c2lkZSB0aGUgZmx1c2goKVxuLy8gICAgZnVuY3Rpb24sIGd1YXJhbnRlZXMgdGhpcyBiZWhhdmlvci5cbmNvbnN0IHNlZW5fY2FsbGJhY2tzID0gbmV3IFNldCgpO1xubGV0IGZsdXNoaWR4ID0gMDsgLy8gRG8gKm5vdCogbW92ZSB0aGlzIGluc2lkZSB0aGUgZmx1c2goKSBmdW5jdGlvblxuZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgLy8gRG8gbm90IHJlZW50ZXIgZmx1c2ggd2hpbGUgZGlydHkgY29tcG9uZW50cyBhcmUgdXBkYXRlZCwgYXMgdGhpcyBjYW5cbiAgICAvLyByZXN1bHQgaW4gYW4gaW5maW5pdGUgbG9vcC4gSW5zdGVhZCwgbGV0IHRoZSBpbm5lciBmbHVzaCBoYW5kbGUgaXQuXG4gICAgLy8gUmVlbnRyYW5jeSBpcyBvayBhZnRlcndhcmRzIGZvciBiaW5kaW5ncyBldGMuXG4gICAgaWYgKGZsdXNoaWR4ICE9PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgc2F2ZWRfY29tcG9uZW50ID0gY3VycmVudF9jb21wb25lbnQ7XG4gICAgZG8ge1xuICAgICAgICAvLyBmaXJzdCwgY2FsbCBiZWZvcmVVcGRhdGUgZnVuY3Rpb25zXG4gICAgICAgIC8vIGFuZCB1cGRhdGUgY29tcG9uZW50c1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgd2hpbGUgKGZsdXNoaWR4IDwgZGlydHlfY29tcG9uZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnQgPSBkaXJ0eV9jb21wb25lbnRzW2ZsdXNoaWR4XTtcbiAgICAgICAgICAgICAgICBmbHVzaGlkeCsrO1xuICAgICAgICAgICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChjb21wb25lbnQpO1xuICAgICAgICAgICAgICAgIHVwZGF0ZShjb21wb25lbnQuJCQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyByZXNldCBkaXJ0eSBzdGF0ZSB0byBub3QgZW5kIHVwIGluIGEgZGVhZGxvY2tlZCBzdGF0ZSBhbmQgdGhlbiByZXRocm93XG4gICAgICAgICAgICBkaXJ0eV9jb21wb25lbnRzLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICBmbHVzaGlkeCA9IDA7XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChudWxsKTtcbiAgICAgICAgZGlydHlfY29tcG9uZW50cy5sZW5ndGggPSAwO1xuICAgICAgICBmbHVzaGlkeCA9IDA7XG4gICAgICAgIHdoaWxlIChiaW5kaW5nX2NhbGxiYWNrcy5sZW5ndGgpXG4gICAgICAgICAgICBiaW5kaW5nX2NhbGxiYWNrcy5wb3AoKSgpO1xuICAgICAgICAvLyB0aGVuLCBvbmNlIGNvbXBvbmVudHMgYXJlIHVwZGF0ZWQsIGNhbGxcbiAgICAgICAgLy8gYWZ0ZXJVcGRhdGUgZnVuY3Rpb25zLiBUaGlzIG1heSBjYXVzZVxuICAgICAgICAvLyBzdWJzZXF1ZW50IHVwZGF0ZXMuLi5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZW5kZXJfY2FsbGJhY2tzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBjb25zdCBjYWxsYmFjayA9IHJlbmRlcl9jYWxsYmFja3NbaV07XG4gICAgICAgICAgICBpZiAoIXNlZW5fY2FsbGJhY2tzLmhhcyhjYWxsYmFjaykpIHtcbiAgICAgICAgICAgICAgICAvLyAuLi5zbyBndWFyZCBhZ2FpbnN0IGluZmluaXRlIGxvb3BzXG4gICAgICAgICAgICAgICAgc2Vlbl9jYWxsYmFja3MuYWRkKGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlbmRlcl9jYWxsYmFja3MubGVuZ3RoID0gMDtcbiAgICB9IHdoaWxlIChkaXJ0eV9jb21wb25lbnRzLmxlbmd0aCk7XG4gICAgd2hpbGUgKGZsdXNoX2NhbGxiYWNrcy5sZW5ndGgpIHtcbiAgICAgICAgZmx1c2hfY2FsbGJhY2tzLnBvcCgpKCk7XG4gICAgfVxuICAgIHVwZGF0ZV9zY2hlZHVsZWQgPSBmYWxzZTtcbiAgICBzZWVuX2NhbGxiYWNrcy5jbGVhcigpO1xuICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChzYXZlZF9jb21wb25lbnQpO1xufVxuZnVuY3Rpb24gdXBkYXRlKCQkKSB7XG4gICAgaWYgKCQkLmZyYWdtZW50ICE9PSBudWxsKSB7XG4gICAgICAgICQkLnVwZGF0ZSgpO1xuICAgICAgICBydW5fYWxsKCQkLmJlZm9yZV91cGRhdGUpO1xuICAgICAgICBjb25zdCBkaXJ0eSA9ICQkLmRpcnR5O1xuICAgICAgICAkJC5kaXJ0eSA9IFstMV07XG4gICAgICAgICQkLmZyYWdtZW50ICYmICQkLmZyYWdtZW50LnAoJCQuY3R4LCBkaXJ0eSk7XG4gICAgICAgICQkLmFmdGVyX3VwZGF0ZS5mb3JFYWNoKGFkZF9yZW5kZXJfY2FsbGJhY2spO1xuICAgIH1cbn1cbi8qKlxuICogVXNlZnVsIGZvciBleGFtcGxlIHRvIGV4ZWN1dGUgcmVtYWluaW5nIGBhZnRlclVwZGF0ZWAgY2FsbGJhY2tzIGJlZm9yZSBleGVjdXRpbmcgYGRlc3Ryb3lgLlxuICovXG5mdW5jdGlvbiBmbHVzaF9yZW5kZXJfY2FsbGJhY2tzKGZucykge1xuICAgIGNvbnN0IGZpbHRlcmVkID0gW107XG4gICAgY29uc3QgdGFyZ2V0cyA9IFtdO1xuICAgIHJlbmRlcl9jYWxsYmFja3MuZm9yRWFjaCgoYykgPT4gZm5zLmluZGV4T2YoYykgPT09IC0xID8gZmlsdGVyZWQucHVzaChjKSA6IHRhcmdldHMucHVzaChjKSk7XG4gICAgdGFyZ2V0cy5mb3JFYWNoKChjKSA9PiBjKCkpO1xuICAgIHJlbmRlcl9jYWxsYmFja3MgPSBmaWx0ZXJlZDtcbn1cblxubGV0IHByb21pc2U7XG5mdW5jdGlvbiB3YWl0KCkge1xuICAgIGlmICghcHJvbWlzZSkge1xuICAgICAgICBwcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIHByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBwcm9taXNlID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBwcm9taXNlO1xufVxuZnVuY3Rpb24gZGlzcGF0Y2gobm9kZSwgZGlyZWN0aW9uLCBraW5kKSB7XG4gICAgbm9kZS5kaXNwYXRjaEV2ZW50KGN1c3RvbV9ldmVudChgJHtkaXJlY3Rpb24gPyAnaW50cm8nIDogJ291dHJvJ30ke2tpbmR9YCkpO1xufVxuY29uc3Qgb3V0cm9pbmcgPSBuZXcgU2V0KCk7XG5sZXQgb3V0cm9zO1xuZnVuY3Rpb24gZ3JvdXBfb3V0cm9zKCkge1xuICAgIG91dHJvcyA9IHtcbiAgICAgICAgcjogMCxcbiAgICAgICAgYzogW10sXG4gICAgICAgIHA6IG91dHJvcyAvLyBwYXJlbnQgZ3JvdXBcbiAgICB9O1xufVxuZnVuY3Rpb24gY2hlY2tfb3V0cm9zKCkge1xuICAgIGlmICghb3V0cm9zLnIpIHtcbiAgICAgICAgcnVuX2FsbChvdXRyb3MuYyk7XG4gICAgfVxuICAgIG91dHJvcyA9IG91dHJvcy5wO1xufVxuZnVuY3Rpb24gdHJhbnNpdGlvbl9pbihibG9jaywgbG9jYWwpIHtcbiAgICBpZiAoYmxvY2sgJiYgYmxvY2suaSkge1xuICAgICAgICBvdXRyb2luZy5kZWxldGUoYmxvY2spO1xuICAgICAgICBibG9jay5pKGxvY2FsKTtcbiAgICB9XG59XG5mdW5jdGlvbiB0cmFuc2l0aW9uX291dChibG9jaywgbG9jYWwsIGRldGFjaCwgY2FsbGJhY2spIHtcbiAgICBpZiAoYmxvY2sgJiYgYmxvY2subykge1xuICAgICAgICBpZiAob3V0cm9pbmcuaGFzKGJsb2NrKSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgb3V0cm9pbmcuYWRkKGJsb2NrKTtcbiAgICAgICAgb3V0cm9zLmMucHVzaCgoKSA9PiB7XG4gICAgICAgICAgICBvdXRyb2luZy5kZWxldGUoYmxvY2spO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRldGFjaClcbiAgICAgICAgICAgICAgICAgICAgYmxvY2suZCgxKTtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYmxvY2subyhsb2NhbCk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxufVxuY29uc3QgbnVsbF90cmFuc2l0aW9uID0geyBkdXJhdGlvbjogMCB9O1xuZnVuY3Rpb24gY3JlYXRlX2luX3RyYW5zaXRpb24obm9kZSwgZm4sIHBhcmFtcykge1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7IGRpcmVjdGlvbjogJ2luJyB9O1xuICAgIGxldCBjb25maWcgPSBmbihub2RlLCBwYXJhbXMsIG9wdGlvbnMpO1xuICAgIGxldCBydW5uaW5nID0gZmFsc2U7XG4gICAgbGV0IGFuaW1hdGlvbl9uYW1lO1xuICAgIGxldCB0YXNrO1xuICAgIGxldCB1aWQgPSAwO1xuICAgIGZ1bmN0aW9uIGNsZWFudXAoKSB7XG4gICAgICAgIGlmIChhbmltYXRpb25fbmFtZSlcbiAgICAgICAgICAgIGRlbGV0ZV9ydWxlKG5vZGUsIGFuaW1hdGlvbl9uYW1lKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZ28oKSB7XG4gICAgICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDMwMCwgZWFzaW5nID0gaWRlbnRpdHksIHRpY2sgPSBub29wLCBjc3MgfSA9IGNvbmZpZyB8fCBudWxsX3RyYW5zaXRpb247XG4gICAgICAgIGlmIChjc3MpXG4gICAgICAgICAgICBhbmltYXRpb25fbmFtZSA9IGNyZWF0ZV9ydWxlKG5vZGUsIDAsIDEsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBjc3MsIHVpZCsrKTtcbiAgICAgICAgdGljaygwLCAxKTtcbiAgICAgICAgY29uc3Qgc3RhcnRfdGltZSA9IG5vdygpICsgZGVsYXk7XG4gICAgICAgIGNvbnN0IGVuZF90aW1lID0gc3RhcnRfdGltZSArIGR1cmF0aW9uO1xuICAgICAgICBpZiAodGFzaylcbiAgICAgICAgICAgIHRhc2suYWJvcnQoKTtcbiAgICAgICAgcnVubmluZyA9IHRydWU7XG4gICAgICAgIGFkZF9yZW5kZXJfY2FsbGJhY2soKCkgPT4gZGlzcGF0Y2gobm9kZSwgdHJ1ZSwgJ3N0YXJ0JykpO1xuICAgICAgICB0YXNrID0gbG9vcChub3cgPT4ge1xuICAgICAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAobm93ID49IGVuZF90aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpY2soMSwgMCk7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoKG5vZGUsIHRydWUsICdlbmQnKTtcbiAgICAgICAgICAgICAgICAgICAgY2xlYW51cCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm93ID49IHN0YXJ0X3RpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdCA9IGVhc2luZygobm93IC0gc3RhcnRfdGltZSkgLyBkdXJhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHRpY2sodCwgMSAtIHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBydW5uaW5nO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgbGV0IHN0YXJ0ZWQgPSBmYWxzZTtcbiAgICByZXR1cm4ge1xuICAgICAgICBzdGFydCgpIHtcbiAgICAgICAgICAgIGlmIChzdGFydGVkKVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIHN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgZGVsZXRlX3J1bGUobm9kZSk7XG4gICAgICAgICAgICBpZiAoaXNfZnVuY3Rpb24oY29uZmlnKSkge1xuICAgICAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZyhvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB3YWl0KCkudGhlbihnbyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBnbygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBpbnZhbGlkYXRlKCkge1xuICAgICAgICAgICAgc3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICBlbmQoKSB7XG4gICAgICAgICAgICBpZiAocnVubmluZykge1xuICAgICAgICAgICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gY3JlYXRlX291dF90cmFuc2l0aW9uKG5vZGUsIGZuLCBwYXJhbXMpIHtcbiAgICBjb25zdCBvcHRpb25zID0geyBkaXJlY3Rpb246ICdvdXQnIH07XG4gICAgbGV0IGNvbmZpZyA9IGZuKG5vZGUsIHBhcmFtcywgb3B0aW9ucyk7XG4gICAgbGV0IHJ1bm5pbmcgPSB0cnVlO1xuICAgIGxldCBhbmltYXRpb25fbmFtZTtcbiAgICBjb25zdCBncm91cCA9IG91dHJvcztcbiAgICBncm91cC5yICs9IDE7XG4gICAgZnVuY3Rpb24gZ28oKSB7XG4gICAgICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDMwMCwgZWFzaW5nID0gaWRlbnRpdHksIHRpY2sgPSBub29wLCBjc3MgfSA9IGNvbmZpZyB8fCBudWxsX3RyYW5zaXRpb247XG4gICAgICAgIGlmIChjc3MpXG4gICAgICAgICAgICBhbmltYXRpb25fbmFtZSA9IGNyZWF0ZV9ydWxlKG5vZGUsIDEsIDAsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBjc3MpO1xuICAgICAgICBjb25zdCBzdGFydF90aW1lID0gbm93KCkgKyBkZWxheTtcbiAgICAgICAgY29uc3QgZW5kX3RpbWUgPSBzdGFydF90aW1lICsgZHVyYXRpb247XG4gICAgICAgIGFkZF9yZW5kZXJfY2FsbGJhY2soKCkgPT4gZGlzcGF0Y2gobm9kZSwgZmFsc2UsICdzdGFydCcpKTtcbiAgICAgICAgbG9vcChub3cgPT4ge1xuICAgICAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAobm93ID49IGVuZF90aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpY2soMCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoKG5vZGUsIGZhbHNlLCAnZW5kJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghLS1ncm91cC5yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIHdpbGwgcmVzdWx0IGluIGBlbmQoKWAgYmVpbmcgY2FsbGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc28gd2UgZG9uJ3QgbmVlZCB0byBjbGVhbiB1cCBoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICBydW5fYWxsKGdyb3VwLmMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vdyA+PSBzdGFydF90aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHQgPSBlYXNpbmcoKG5vdyAtIHN0YXJ0X3RpbWUpIC8gZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB0aWNrKDEgLSB0LCB0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcnVubmluZztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChpc19mdW5jdGlvbihjb25maWcpKSB7XG4gICAgICAgIHdhaXQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZyhvcHRpb25zKTtcbiAgICAgICAgICAgIGdvKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZ28oKTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZW5kKHJlc2V0KSB7XG4gICAgICAgICAgICBpZiAocmVzZXQgJiYgY29uZmlnLnRpY2spIHtcbiAgICAgICAgICAgICAgICBjb25maWcudGljaygxLCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChydW5uaW5nKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFuaW1hdGlvbl9uYW1lKVxuICAgICAgICAgICAgICAgICAgICBkZWxldGVfcnVsZShub2RlLCBhbmltYXRpb25fbmFtZSk7XG4gICAgICAgICAgICAgICAgcnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZV9iaWRpcmVjdGlvbmFsX3RyYW5zaXRpb24obm9kZSwgZm4sIHBhcmFtcywgaW50cm8pIHtcbiAgICBjb25zdCBvcHRpb25zID0geyBkaXJlY3Rpb246ICdib3RoJyB9O1xuICAgIGxldCBjb25maWcgPSBmbihub2RlLCBwYXJhbXMsIG9wdGlvbnMpO1xuICAgIGxldCB0ID0gaW50cm8gPyAwIDogMTtcbiAgICBsZXQgcnVubmluZ19wcm9ncmFtID0gbnVsbDtcbiAgICBsZXQgcGVuZGluZ19wcm9ncmFtID0gbnVsbDtcbiAgICBsZXQgYW5pbWF0aW9uX25hbWUgPSBudWxsO1xuICAgIGZ1bmN0aW9uIGNsZWFyX2FuaW1hdGlvbigpIHtcbiAgICAgICAgaWYgKGFuaW1hdGlvbl9uYW1lKVxuICAgICAgICAgICAgZGVsZXRlX3J1bGUobm9kZSwgYW5pbWF0aW9uX25hbWUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbml0KHByb2dyYW0sIGR1cmF0aW9uKSB7XG4gICAgICAgIGNvbnN0IGQgPSAocHJvZ3JhbS5iIC0gdCk7XG4gICAgICAgIGR1cmF0aW9uICo9IE1hdGguYWJzKGQpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYTogdCxcbiAgICAgICAgICAgIGI6IHByb2dyYW0uYixcbiAgICAgICAgICAgIGQsXG4gICAgICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgICAgIHN0YXJ0OiBwcm9ncmFtLnN0YXJ0LFxuICAgICAgICAgICAgZW5kOiBwcm9ncmFtLnN0YXJ0ICsgZHVyYXRpb24sXG4gICAgICAgICAgICBncm91cDogcHJvZ3JhbS5ncm91cFxuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBnbyhiKSB7XG4gICAgICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDMwMCwgZWFzaW5nID0gaWRlbnRpdHksIHRpY2sgPSBub29wLCBjc3MgfSA9IGNvbmZpZyB8fCBudWxsX3RyYW5zaXRpb247XG4gICAgICAgIGNvbnN0IHByb2dyYW0gPSB7XG4gICAgICAgICAgICBzdGFydDogbm93KCkgKyBkZWxheSxcbiAgICAgICAgICAgIGJcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCFiKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIHRvZG86IGltcHJvdmUgdHlwaW5nc1xuICAgICAgICAgICAgcHJvZ3JhbS5ncm91cCA9IG91dHJvcztcbiAgICAgICAgICAgIG91dHJvcy5yICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJ1bm5pbmdfcHJvZ3JhbSB8fCBwZW5kaW5nX3Byb2dyYW0pIHtcbiAgICAgICAgICAgIHBlbmRpbmdfcHJvZ3JhbSA9IHByb2dyYW07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBpZiB0aGlzIGlzIGFuIGludHJvLCBhbmQgdGhlcmUncyBhIGRlbGF5LCB3ZSBuZWVkIHRvIGRvXG4gICAgICAgICAgICAvLyBhbiBpbml0aWFsIHRpY2sgYW5kL29yIGFwcGx5IENTUyBhbmltYXRpb24gaW1tZWRpYXRlbHlcbiAgICAgICAgICAgIGlmIChjc3MpIHtcbiAgICAgICAgICAgICAgICBjbGVhcl9hbmltYXRpb24oKTtcbiAgICAgICAgICAgICAgICBhbmltYXRpb25fbmFtZSA9IGNyZWF0ZV9ydWxlKG5vZGUsIHQsIGIsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBjc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGIpXG4gICAgICAgICAgICAgICAgdGljaygwLCAxKTtcbiAgICAgICAgICAgIHJ1bm5pbmdfcHJvZ3JhbSA9IGluaXQocHJvZ3JhbSwgZHVyYXRpb24pO1xuICAgICAgICAgICAgYWRkX3JlbmRlcl9jYWxsYmFjaygoKSA9PiBkaXNwYXRjaChub2RlLCBiLCAnc3RhcnQnKSk7XG4gICAgICAgICAgICBsb29wKG5vdyA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHBlbmRpbmdfcHJvZ3JhbSAmJiBub3cgPiBwZW5kaW5nX3Byb2dyYW0uc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVubmluZ19wcm9ncmFtID0gaW5pdChwZW5kaW5nX3Byb2dyYW0sIGR1cmF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgcGVuZGluZ19wcm9ncmFtID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2gobm9kZSwgcnVubmluZ19wcm9ncmFtLmIsICdzdGFydCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3NzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhcl9hbmltYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbl9uYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgdCwgcnVubmluZ19wcm9ncmFtLmIsIHJ1bm5pbmdfcHJvZ3JhbS5kdXJhdGlvbiwgMCwgZWFzaW5nLCBjb25maWcuY3NzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocnVubmluZ19wcm9ncmFtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub3cgPj0gcnVubmluZ19wcm9ncmFtLmVuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGljayh0ID0gcnVubmluZ19wcm9ncmFtLmIsIDEgLSB0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoKG5vZGUsIHJ1bm5pbmdfcHJvZ3JhbS5iLCAnZW5kJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXBlbmRpbmdfcHJvZ3JhbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIGRvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocnVubmluZ19wcm9ncmFtLmIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW50cm8g4oCUIHdlIGNhbiB0aWR5IHVwIGltbWVkaWF0ZWx5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyX2FuaW1hdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3V0cm8g4oCUIG5lZWRzIHRvIGJlIGNvb3JkaW5hdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghLS1ydW5uaW5nX3Byb2dyYW0uZ3JvdXAucilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bl9hbGwocnVubmluZ19wcm9ncmFtLmdyb3VwLmMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bm5pbmdfcHJvZ3JhbSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobm93ID49IHJ1bm5pbmdfcHJvZ3JhbS5zdGFydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcCA9IG5vdyAtIHJ1bm5pbmdfcHJvZ3JhbS5zdGFydDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQgPSBydW5uaW5nX3Byb2dyYW0uYSArIHJ1bm5pbmdfcHJvZ3JhbS5kICogZWFzaW5nKHAgLyBydW5uaW5nX3Byb2dyYW0uZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGljayh0LCAxIC0gdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICEhKHJ1bm5pbmdfcHJvZ3JhbSB8fCBwZW5kaW5nX3Byb2dyYW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcnVuKGIpIHtcbiAgICAgICAgICAgIGlmIChpc19mdW5jdGlvbihjb25maWcpKSB7XG4gICAgICAgICAgICAgICAgd2FpdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZyhvcHRpb25zKTtcbiAgICAgICAgICAgICAgICAgICAgZ28oYik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBnbyhiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZW5kKCkge1xuICAgICAgICAgICAgY2xlYXJfYW5pbWF0aW9uKCk7XG4gICAgICAgICAgICBydW5uaW5nX3Byb2dyYW0gPSBwZW5kaW5nX3Byb2dyYW0gPSBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlX3Byb21pc2UocHJvbWlzZSwgaW5mbykge1xuICAgIGNvbnN0IHRva2VuID0gaW5mby50b2tlbiA9IHt9O1xuICAgIGZ1bmN0aW9uIHVwZGF0ZSh0eXBlLCBpbmRleCwga2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAoaW5mby50b2tlbiAhPT0gdG9rZW4pXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGluZm8ucmVzb2x2ZWQgPSB2YWx1ZTtcbiAgICAgICAgbGV0IGNoaWxkX2N0eCA9IGluZm8uY3R4O1xuICAgICAgICBpZiAoa2V5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNoaWxkX2N0eCA9IGNoaWxkX2N0eC5zbGljZSgpO1xuICAgICAgICAgICAgY2hpbGRfY3R4W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBibG9jayA9IHR5cGUgJiYgKGluZm8uY3VycmVudCA9IHR5cGUpKGNoaWxkX2N0eCk7XG4gICAgICAgIGxldCBuZWVkc19mbHVzaCA9IGZhbHNlO1xuICAgICAgICBpZiAoaW5mby5ibG9jaykge1xuICAgICAgICAgICAgaWYgKGluZm8uYmxvY2tzKSB7XG4gICAgICAgICAgICAgICAgaW5mby5ibG9ja3MuZm9yRWFjaCgoYmxvY2ssIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT09IGluZGV4ICYmIGJsb2NrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cF9vdXRyb3MoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb25fb3V0KGJsb2NrLCAxLCAxLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZm8uYmxvY2tzW2ldID09PSBibG9jaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmZvLmJsb2Nrc1tpXSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjaGVja19vdXRyb3MoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaW5mby5ibG9jay5kKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYmxvY2suYygpO1xuICAgICAgICAgICAgdHJhbnNpdGlvbl9pbihibG9jaywgMSk7XG4gICAgICAgICAgICBibG9jay5tKGluZm8ubW91bnQoKSwgaW5mby5hbmNob3IpO1xuICAgICAgICAgICAgbmVlZHNfZmx1c2ggPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGluZm8uYmxvY2sgPSBibG9jaztcbiAgICAgICAgaWYgKGluZm8uYmxvY2tzKVxuICAgICAgICAgICAgaW5mby5ibG9ja3NbaW5kZXhdID0gYmxvY2s7XG4gICAgICAgIGlmIChuZWVkc19mbHVzaCkge1xuICAgICAgICAgICAgZmx1c2goKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNfcHJvbWlzZShwcm9taXNlKSkge1xuICAgICAgICBjb25zdCBjdXJyZW50X2NvbXBvbmVudCA9IGdldF9jdXJyZW50X2NvbXBvbmVudCgpO1xuICAgICAgICBwcm9taXNlLnRoZW4odmFsdWUgPT4ge1xuICAgICAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KGN1cnJlbnRfY29tcG9uZW50KTtcbiAgICAgICAgICAgIHVwZGF0ZShpbmZvLnRoZW4sIDEsIGluZm8udmFsdWUsIHZhbHVlKTtcbiAgICAgICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChudWxsKTtcbiAgICAgICAgfSwgZXJyb3IgPT4ge1xuICAgICAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KGN1cnJlbnRfY29tcG9uZW50KTtcbiAgICAgICAgICAgIHVwZGF0ZShpbmZvLmNhdGNoLCAyLCBpbmZvLmVycm9yLCBlcnJvcik7XG4gICAgICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQobnVsbCk7XG4gICAgICAgICAgICBpZiAoIWluZm8uaGFzQ2F0Y2gpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIGlmIHdlIHByZXZpb3VzbHkgaGFkIGEgdGhlbi9jYXRjaCBibG9jaywgZGVzdHJveSBpdFxuICAgICAgICBpZiAoaW5mby5jdXJyZW50ICE9PSBpbmZvLnBlbmRpbmcpIHtcbiAgICAgICAgICAgIHVwZGF0ZShpbmZvLnBlbmRpbmcsIDApO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChpbmZvLmN1cnJlbnQgIT09IGluZm8udGhlbikge1xuICAgICAgICAgICAgdXBkYXRlKGluZm8udGhlbiwgMSwgaW5mby52YWx1ZSwgcHJvbWlzZSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpbmZvLnJlc29sdmVkID0gcHJvbWlzZTtcbiAgICB9XG59XG5mdW5jdGlvbiB1cGRhdGVfYXdhaXRfYmxvY2tfYnJhbmNoKGluZm8sIGN0eCwgZGlydHkpIHtcbiAgICBjb25zdCBjaGlsZF9jdHggPSBjdHguc2xpY2UoKTtcbiAgICBjb25zdCB7IHJlc29sdmVkIH0gPSBpbmZvO1xuICAgIGlmIChpbmZvLmN1cnJlbnQgPT09IGluZm8udGhlbikge1xuICAgICAgICBjaGlsZF9jdHhbaW5mby52YWx1ZV0gPSByZXNvbHZlZDtcbiAgICB9XG4gICAgaWYgKGluZm8uY3VycmVudCA9PT0gaW5mby5jYXRjaCkge1xuICAgICAgICBjaGlsZF9jdHhbaW5mby5lcnJvcl0gPSByZXNvbHZlZDtcbiAgICB9XG4gICAgaW5mby5ibG9jay5wKGNoaWxkX2N0eCwgZGlydHkpO1xufVxuXG5mdW5jdGlvbiBkZXN0cm95X2Jsb2NrKGJsb2NrLCBsb29rdXApIHtcbiAgICBibG9jay5kKDEpO1xuICAgIGxvb2t1cC5kZWxldGUoYmxvY2sua2V5KTtcbn1cbmZ1bmN0aW9uIG91dHJvX2FuZF9kZXN0cm95X2Jsb2NrKGJsb2NrLCBsb29rdXApIHtcbiAgICB0cmFuc2l0aW9uX291dChibG9jaywgMSwgMSwgKCkgPT4ge1xuICAgICAgICBsb29rdXAuZGVsZXRlKGJsb2NrLmtleSk7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBmaXhfYW5kX2Rlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCkge1xuICAgIGJsb2NrLmYoKTtcbiAgICBkZXN0cm95X2Jsb2NrKGJsb2NrLCBsb29rdXApO1xufVxuZnVuY3Rpb24gZml4X2FuZF9vdXRyb19hbmRfZGVzdHJveV9ibG9jayhibG9jaywgbG9va3VwKSB7XG4gICAgYmxvY2suZigpO1xuICAgIG91dHJvX2FuZF9kZXN0cm95X2Jsb2NrKGJsb2NrLCBsb29rdXApO1xufVxuZnVuY3Rpb24gdXBkYXRlX2tleWVkX2VhY2gob2xkX2Jsb2NrcywgZGlydHksIGdldF9rZXksIGR5bmFtaWMsIGN0eCwgbGlzdCwgbG9va3VwLCBub2RlLCBkZXN0cm95LCBjcmVhdGVfZWFjaF9ibG9jaywgbmV4dCwgZ2V0X2NvbnRleHQpIHtcbiAgICBsZXQgbyA9IG9sZF9ibG9ja3MubGVuZ3RoO1xuICAgIGxldCBuID0gbGlzdC5sZW5ndGg7XG4gICAgbGV0IGkgPSBvO1xuICAgIGNvbnN0IG9sZF9pbmRleGVzID0ge307XG4gICAgd2hpbGUgKGktLSlcbiAgICAgICAgb2xkX2luZGV4ZXNbb2xkX2Jsb2Nrc1tpXS5rZXldID0gaTtcbiAgICBjb25zdCBuZXdfYmxvY2tzID0gW107XG4gICAgY29uc3QgbmV3X2xvb2t1cCA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCBkZWx0YXMgPSBuZXcgTWFwKCk7XG4gICAgY29uc3QgdXBkYXRlcyA9IFtdO1xuICAgIGkgPSBuO1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgY29uc3QgY2hpbGRfY3R4ID0gZ2V0X2NvbnRleHQoY3R4LCBsaXN0LCBpKTtcbiAgICAgICAgY29uc3Qga2V5ID0gZ2V0X2tleShjaGlsZF9jdHgpO1xuICAgICAgICBsZXQgYmxvY2sgPSBsb29rdXAuZ2V0KGtleSk7XG4gICAgICAgIGlmICghYmxvY2spIHtcbiAgICAgICAgICAgIGJsb2NrID0gY3JlYXRlX2VhY2hfYmxvY2soa2V5LCBjaGlsZF9jdHgpO1xuICAgICAgICAgICAgYmxvY2suYygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGR5bmFtaWMpIHtcbiAgICAgICAgICAgIC8vIGRlZmVyIHVwZGF0ZXMgdW50aWwgYWxsIHRoZSBET00gc2h1ZmZsaW5nIGlzIGRvbmVcbiAgICAgICAgICAgIHVwZGF0ZXMucHVzaCgoKSA9PiBibG9jay5wKGNoaWxkX2N0eCwgZGlydHkpKTtcbiAgICAgICAgfVxuICAgICAgICBuZXdfbG9va3VwLnNldChrZXksIG5ld19ibG9ja3NbaV0gPSBibG9jayk7XG4gICAgICAgIGlmIChrZXkgaW4gb2xkX2luZGV4ZXMpXG4gICAgICAgICAgICBkZWx0YXMuc2V0KGtleSwgTWF0aC5hYnMoaSAtIG9sZF9pbmRleGVzW2tleV0pKTtcbiAgICB9XG4gICAgY29uc3Qgd2lsbF9tb3ZlID0gbmV3IFNldCgpO1xuICAgIGNvbnN0IGRpZF9tb3ZlID0gbmV3IFNldCgpO1xuICAgIGZ1bmN0aW9uIGluc2VydChibG9jaykge1xuICAgICAgICB0cmFuc2l0aW9uX2luKGJsb2NrLCAxKTtcbiAgICAgICAgYmxvY2subShub2RlLCBuZXh0KTtcbiAgICAgICAgbG9va3VwLnNldChibG9jay5rZXksIGJsb2NrKTtcbiAgICAgICAgbmV4dCA9IGJsb2NrLmZpcnN0O1xuICAgICAgICBuLS07XG4gICAgfVxuICAgIHdoaWxlIChvICYmIG4pIHtcbiAgICAgICAgY29uc3QgbmV3X2Jsb2NrID0gbmV3X2Jsb2Nrc1tuIC0gMV07XG4gICAgICAgIGNvbnN0IG9sZF9ibG9jayA9IG9sZF9ibG9ja3NbbyAtIDFdO1xuICAgICAgICBjb25zdCBuZXdfa2V5ID0gbmV3X2Jsb2NrLmtleTtcbiAgICAgICAgY29uc3Qgb2xkX2tleSA9IG9sZF9ibG9jay5rZXk7XG4gICAgICAgIGlmIChuZXdfYmxvY2sgPT09IG9sZF9ibG9jaykge1xuICAgICAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgICAgICAgICAgbmV4dCA9IG5ld19ibG9jay5maXJzdDtcbiAgICAgICAgICAgIG8tLTtcbiAgICAgICAgICAgIG4tLTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghbmV3X2xvb2t1cC5oYXMob2xkX2tleSkpIHtcbiAgICAgICAgICAgIC8vIHJlbW92ZSBvbGQgYmxvY2tcbiAgICAgICAgICAgIGRlc3Ryb3kob2xkX2Jsb2NrLCBsb29rdXApO1xuICAgICAgICAgICAgby0tO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFsb29rdXAuaGFzKG5ld19rZXkpIHx8IHdpbGxfbW92ZS5oYXMobmV3X2tleSkpIHtcbiAgICAgICAgICAgIGluc2VydChuZXdfYmxvY2spO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRpZF9tb3ZlLmhhcyhvbGRfa2V5KSkge1xuICAgICAgICAgICAgby0tO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGRlbHRhcy5nZXQobmV3X2tleSkgPiBkZWx0YXMuZ2V0KG9sZF9rZXkpKSB7XG4gICAgICAgICAgICBkaWRfbW92ZS5hZGQobmV3X2tleSk7XG4gICAgICAgICAgICBpbnNlcnQobmV3X2Jsb2NrKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHdpbGxfbW92ZS5hZGQob2xkX2tleSk7XG4gICAgICAgICAgICBvLS07XG4gICAgICAgIH1cbiAgICB9XG4gICAgd2hpbGUgKG8tLSkge1xuICAgICAgICBjb25zdCBvbGRfYmxvY2sgPSBvbGRfYmxvY2tzW29dO1xuICAgICAgICBpZiAoIW5ld19sb29rdXAuaGFzKG9sZF9ibG9jay5rZXkpKVxuICAgICAgICAgICAgZGVzdHJveShvbGRfYmxvY2ssIGxvb2t1cCk7XG4gICAgfVxuICAgIHdoaWxlIChuKVxuICAgICAgICBpbnNlcnQobmV3X2Jsb2Nrc1tuIC0gMV0pO1xuICAgIHJ1bl9hbGwodXBkYXRlcyk7XG4gICAgcmV0dXJuIG5ld19ibG9ja3M7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZV9lYWNoX2tleXMoY3R4LCBsaXN0LCBnZXRfY29udGV4dCwgZ2V0X2tleSkge1xuICAgIGNvbnN0IGtleXMgPSBuZXcgU2V0KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IGdldF9rZXkoZ2V0X2NvbnRleHQoY3R4LCBsaXN0LCBpKSk7XG4gICAgICAgIGlmIChrZXlzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBoYXZlIGR1cGxpY2F0ZSBrZXlzIGluIGEga2V5ZWQgZWFjaCcpO1xuICAgICAgICB9XG4gICAgICAgIGtleXMuYWRkKGtleSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRfc3ByZWFkX3VwZGF0ZShsZXZlbHMsIHVwZGF0ZXMpIHtcbiAgICBjb25zdCB1cGRhdGUgPSB7fTtcbiAgICBjb25zdCB0b19udWxsX291dCA9IHt9O1xuICAgIGNvbnN0IGFjY291bnRlZF9mb3IgPSB7ICQkc2NvcGU6IDEgfTtcbiAgICBsZXQgaSA9IGxldmVscy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgICBjb25zdCBvID0gbGV2ZWxzW2ldO1xuICAgICAgICBjb25zdCBuID0gdXBkYXRlc1tpXTtcbiAgICAgICAgaWYgKG4pIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIG8pIHtcbiAgICAgICAgICAgICAgICBpZiAoIShrZXkgaW4gbikpXG4gICAgICAgICAgICAgICAgICAgIHRvX251bGxfb3V0W2tleV0gPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbikge1xuICAgICAgICAgICAgICAgIGlmICghYWNjb3VudGVkX2ZvcltrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZVtrZXldID0gbltrZXldO1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50ZWRfZm9yW2tleV0gPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldmVsc1tpXSA9IG47XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBvKSB7XG4gICAgICAgICAgICAgICAgYWNjb3VudGVkX2ZvcltrZXldID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGtleSBpbiB0b19udWxsX291dCkge1xuICAgICAgICBpZiAoIShrZXkgaW4gdXBkYXRlKSlcbiAgICAgICAgICAgIHVwZGF0ZVtrZXldID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gdXBkYXRlO1xufVxuZnVuY3Rpb24gZ2V0X3NwcmVhZF9vYmplY3Qoc3ByZWFkX3Byb3BzKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBzcHJlYWRfcHJvcHMgPT09ICdvYmplY3QnICYmIHNwcmVhZF9wcm9wcyAhPT0gbnVsbCA/IHNwcmVhZF9wcm9wcyA6IHt9O1xufVxuXG5jb25zdCBfYm9vbGVhbl9hdHRyaWJ1dGVzID0gW1xuICAgICdhbGxvd2Z1bGxzY3JlZW4nLFxuICAgICdhbGxvd3BheW1lbnRyZXF1ZXN0JyxcbiAgICAnYXN5bmMnLFxuICAgICdhdXRvZm9jdXMnLFxuICAgICdhdXRvcGxheScsXG4gICAgJ2NoZWNrZWQnLFxuICAgICdjb250cm9scycsXG4gICAgJ2RlZmF1bHQnLFxuICAgICdkZWZlcicsXG4gICAgJ2Rpc2FibGVkJyxcbiAgICAnZm9ybW5vdmFsaWRhdGUnLFxuICAgICdoaWRkZW4nLFxuICAgICdpbmVydCcsXG4gICAgJ2lzbWFwJyxcbiAgICAnbG9vcCcsXG4gICAgJ211bHRpcGxlJyxcbiAgICAnbXV0ZWQnLFxuICAgICdub21vZHVsZScsXG4gICAgJ25vdmFsaWRhdGUnLFxuICAgICdvcGVuJyxcbiAgICAncGxheXNpbmxpbmUnLFxuICAgICdyZWFkb25seScsXG4gICAgJ3JlcXVpcmVkJyxcbiAgICAncmV2ZXJzZWQnLFxuICAgICdzZWxlY3RlZCdcbl07XG4vKipcbiAqIExpc3Qgb2YgSFRNTCBib29sZWFuIGF0dHJpYnV0ZXMgKGUuZy4gYDxpbnB1dCBkaXNhYmxlZD5gKS5cbiAqIFNvdXJjZTogaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvaW5kaWNlcy5odG1sXG4gKi9cbmNvbnN0IGJvb2xlYW5fYXR0cmlidXRlcyA9IG5ldyBTZXQoWy4uLl9ib29sZWFuX2F0dHJpYnV0ZXNdKTtcblxuLyoqIHJlZ2V4IG9mIGFsbCBodG1sIHZvaWQgZWxlbWVudCBuYW1lcyAqL1xuY29uc3Qgdm9pZF9lbGVtZW50X25hbWVzID0gL14oPzphcmVhfGJhc2V8YnJ8Y29sfGNvbW1hbmR8ZW1iZWR8aHJ8aW1nfGlucHV0fGtleWdlbnxsaW5rfG1ldGF8cGFyYW18c291cmNlfHRyYWNrfHdicikkLztcbmZ1bmN0aW9uIGlzX3ZvaWQobmFtZSkge1xuICAgIHJldHVybiB2b2lkX2VsZW1lbnRfbmFtZXMudGVzdChuYW1lKSB8fCBuYW1lLnRvTG93ZXJDYXNlKCkgPT09ICchZG9jdHlwZSc7XG59XG5cbmNvbnN0IGludmFsaWRfYXR0cmlidXRlX25hbWVfY2hhcmFjdGVyID0gL1tcXHMnXCI+Lz1cXHV7RkREMH0tXFx1e0ZERUZ9XFx1e0ZGRkV9XFx1e0ZGRkZ9XFx1ezFGRkZFfVxcdXsxRkZGRn1cXHV7MkZGRkV9XFx1ezJGRkZGfVxcdXszRkZGRX1cXHV7M0ZGRkZ9XFx1ezRGRkZFfVxcdXs0RkZGRn1cXHV7NUZGRkV9XFx1ezVGRkZGfVxcdXs2RkZGRX1cXHV7NkZGRkZ9XFx1ezdGRkZFfVxcdXs3RkZGRn1cXHV7OEZGRkV9XFx1ezhGRkZGfVxcdXs5RkZGRX1cXHV7OUZGRkZ9XFx1e0FGRkZFfVxcdXtBRkZGRn1cXHV7QkZGRkV9XFx1e0JGRkZGfVxcdXtDRkZGRX1cXHV7Q0ZGRkZ9XFx1e0RGRkZFfVxcdXtERkZGRn1cXHV7RUZGRkV9XFx1e0VGRkZGfVxcdXtGRkZGRX1cXHV7RkZGRkZ9XFx1ezEwRkZGRX1cXHV7MTBGRkZGfV0vdTtcbi8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI2F0dHJpYnV0ZXMtMlxuLy8gaHR0cHM6Ly9pbmZyYS5zcGVjLndoYXR3Zy5vcmcvI25vbmNoYXJhY3RlclxuZnVuY3Rpb24gc3ByZWFkKGFyZ3MsIGF0dHJzX3RvX2FkZCkge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBPYmplY3QuYXNzaWduKHt9LCAuLi5hcmdzKTtcbiAgICBpZiAoYXR0cnNfdG9fYWRkKSB7XG4gICAgICAgIGNvbnN0IGNsYXNzZXNfdG9fYWRkID0gYXR0cnNfdG9fYWRkLmNsYXNzZXM7XG4gICAgICAgIGNvbnN0IHN0eWxlc190b19hZGQgPSBhdHRyc190b19hZGQuc3R5bGVzO1xuICAgICAgICBpZiAoY2xhc3Nlc190b19hZGQpIHtcbiAgICAgICAgICAgIGlmIChhdHRyaWJ1dGVzLmNsYXNzID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmNsYXNzID0gY2xhc3Nlc190b19hZGQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLmNsYXNzICs9ICcgJyArIGNsYXNzZXNfdG9fYWRkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChzdHlsZXNfdG9fYWRkKSB7XG4gICAgICAgICAgICBpZiAoYXR0cmlidXRlcy5zdHlsZSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgYXR0cmlidXRlcy5zdHlsZSA9IHN0eWxlX29iamVjdF90b19zdHJpbmcoc3R5bGVzX3RvX2FkZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLnN0eWxlID0gc3R5bGVfb2JqZWN0X3RvX3N0cmluZyhtZXJnZV9zc3Jfc3R5bGVzKGF0dHJpYnV0ZXMuc3R5bGUsIHN0eWxlc190b19hZGQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBsZXQgc3RyID0gJyc7XG4gICAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgICAgaWYgKGludmFsaWRfYXR0cmlidXRlX25hbWVfY2hhcmFjdGVyLnRlc3QobmFtZSkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IHZhbHVlID0gYXR0cmlidXRlc1tuYW1lXTtcbiAgICAgICAgaWYgKHZhbHVlID09PSB0cnVlKVxuICAgICAgICAgICAgc3RyICs9ICcgJyArIG5hbWU7XG4gICAgICAgIGVsc2UgaWYgKGJvb2xlYW5fYXR0cmlidXRlcy5oYXMobmFtZS50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlKVxuICAgICAgICAgICAgICAgIHN0ciArPSAnICcgKyBuYW1lO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHN0ciArPSBgICR7bmFtZX09XCIke3ZhbHVlfVwiYDtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBzdHI7XG59XG5mdW5jdGlvbiBtZXJnZV9zc3Jfc3R5bGVzKHN0eWxlX2F0dHJpYnV0ZSwgc3R5bGVfZGlyZWN0aXZlKSB7XG4gICAgY29uc3Qgc3R5bGVfb2JqZWN0ID0ge307XG4gICAgZm9yIChjb25zdCBpbmRpdmlkdWFsX3N0eWxlIG9mIHN0eWxlX2F0dHJpYnV0ZS5zcGxpdCgnOycpKSB7XG4gICAgICAgIGNvbnN0IGNvbG9uX2luZGV4ID0gaW5kaXZpZHVhbF9zdHlsZS5pbmRleE9mKCc6Jyk7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBpbmRpdmlkdWFsX3N0eWxlLnNsaWNlKDAsIGNvbG9uX2luZGV4KS50cmltKCk7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gaW5kaXZpZHVhbF9zdHlsZS5zbGljZShjb2xvbl9pbmRleCArIDEpLnRyaW0oKTtcbiAgICAgICAgaWYgKCFuYW1lKVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIHN0eWxlX29iamVjdFtuYW1lXSA9IHZhbHVlO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IG5hbWUgaW4gc3R5bGVfZGlyZWN0aXZlKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gc3R5bGVfZGlyZWN0aXZlW25hbWVdO1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIHN0eWxlX29iamVjdFtuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGVsZXRlIHN0eWxlX29iamVjdFtuYW1lXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3R5bGVfb2JqZWN0O1xufVxuY29uc3QgQVRUUl9SRUdFWCA9IC9bJlwiXS9nO1xuY29uc3QgQ09OVEVOVF9SRUdFWCA9IC9bJjxdL2c7XG4vKipcbiAqIE5vdGU6IHRoaXMgbWV0aG9kIGlzIHBlcmZvcm1hbmNlIHNlbnNpdGl2ZSBhbmQgaGFzIGJlZW4gb3B0aW1pemVkXG4gKiBodHRwczovL2dpdGh1Yi5jb20vc3ZlbHRlanMvc3ZlbHRlL3B1bGwvNTcwMVxuICovXG5mdW5jdGlvbiBlc2NhcGUodmFsdWUsIGlzX2F0dHIgPSBmYWxzZSkge1xuICAgIGNvbnN0IHN0ciA9IFN0cmluZyh2YWx1ZSk7XG4gICAgY29uc3QgcGF0dGVybiA9IGlzX2F0dHIgPyBBVFRSX1JFR0VYIDogQ09OVEVOVF9SRUdFWDtcbiAgICBwYXR0ZXJuLmxhc3RJbmRleCA9IDA7XG4gICAgbGV0IGVzY2FwZWQgPSAnJztcbiAgICBsZXQgbGFzdCA9IDA7XG4gICAgd2hpbGUgKHBhdHRlcm4udGVzdChzdHIpKSB7XG4gICAgICAgIGNvbnN0IGkgPSBwYXR0ZXJuLmxhc3RJbmRleCAtIDE7XG4gICAgICAgIGNvbnN0IGNoID0gc3RyW2ldO1xuICAgICAgICBlc2NhcGVkICs9IHN0ci5zdWJzdHJpbmcobGFzdCwgaSkgKyAoY2ggPT09ICcmJyA/ICcmYW1wOycgOiAoY2ggPT09ICdcIicgPyAnJnF1b3Q7JyA6ICcmbHQ7JykpO1xuICAgICAgICBsYXN0ID0gaSArIDE7XG4gICAgfVxuICAgIHJldHVybiBlc2NhcGVkICsgc3RyLnN1YnN0cmluZyhsYXN0KTtcbn1cbmZ1bmN0aW9uIGVzY2FwZV9hdHRyaWJ1dGVfdmFsdWUodmFsdWUpIHtcbiAgICAvLyBrZWVwIGJvb2xlYW5zLCBudWxsLCBhbmQgdW5kZWZpbmVkIGZvciB0aGUgc2FrZSBvZiBgc3ByZWFkYFxuICAgIGNvbnN0IHNob3VsZF9lc2NhcGUgPSB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8ICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKTtcbiAgICByZXR1cm4gc2hvdWxkX2VzY2FwZSA/IGVzY2FwZSh2YWx1ZSwgdHJ1ZSkgOiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIGVzY2FwZV9vYmplY3Qob2JqKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgZm9yIChjb25zdCBrZXkgaW4gb2JqKSB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gZXNjYXBlX2F0dHJpYnV0ZV92YWx1ZShvYmpba2V5XSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBlYWNoKGl0ZW1zLCBmbikge1xuICAgIGxldCBzdHIgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHN0ciArPSBmbihpdGVtc1tpXSwgaSk7XG4gICAgfVxuICAgIHJldHVybiBzdHI7XG59XG5jb25zdCBtaXNzaW5nX2NvbXBvbmVudCA9IHtcbiAgICAkJHJlbmRlcjogKCkgPT4gJydcbn07XG5mdW5jdGlvbiB2YWxpZGF0ZV9jb21wb25lbnQoY29tcG9uZW50LCBuYW1lKSB7XG4gICAgaWYgKCFjb21wb25lbnQgfHwgIWNvbXBvbmVudC4kJHJlbmRlcikge1xuICAgICAgICBpZiAobmFtZSA9PT0gJ3N2ZWx0ZTpjb21wb25lbnQnKVxuICAgICAgICAgICAgbmFtZSArPSAnIHRoaXM9ey4uLn0nO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYDwke25hbWV9PiBpcyBub3QgYSB2YWxpZCBTU1IgY29tcG9uZW50LiBZb3UgbWF5IG5lZWQgdG8gcmV2aWV3IHlvdXIgYnVpbGQgY29uZmlnIHRvIGVuc3VyZSB0aGF0IGRlcGVuZGVuY2llcyBhcmUgY29tcGlsZWQsIHJhdGhlciB0aGFuIGltcG9ydGVkIGFzIHByZS1jb21waWxlZCBtb2R1bGVzLiBPdGhlcndpc2UgeW91IG1heSBuZWVkIHRvIGZpeCBhIDwke25hbWV9Pi5gKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBvbmVudDtcbn1cbmZ1bmN0aW9uIGRlYnVnKGZpbGUsIGxpbmUsIGNvbHVtbiwgdmFsdWVzKSB7XG4gICAgY29uc29sZS5sb2coYHtAZGVidWd9ICR7ZmlsZSA/IGZpbGUgKyAnICcgOiAnJ30oJHtsaW5lfToke2NvbHVtbn0pYCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUubG9nKHZhbHVlcyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgIHJldHVybiAnJztcbn1cbmxldCBvbl9kZXN0cm95O1xuZnVuY3Rpb24gY3JlYXRlX3Nzcl9jb21wb25lbnQoZm4pIHtcbiAgICBmdW5jdGlvbiAkJHJlbmRlcihyZXN1bHQsIHByb3BzLCBiaW5kaW5ncywgc2xvdHMsIGNvbnRleHQpIHtcbiAgICAgICAgY29uc3QgcGFyZW50X2NvbXBvbmVudCA9IGN1cnJlbnRfY29tcG9uZW50O1xuICAgICAgICBjb25zdCAkJCA9IHtcbiAgICAgICAgICAgIG9uX2Rlc3Ryb3ksXG4gICAgICAgICAgICBjb250ZXh0OiBuZXcgTWFwKGNvbnRleHQgfHwgKHBhcmVudF9jb21wb25lbnQgPyBwYXJlbnRfY29tcG9uZW50LiQkLmNvbnRleHQgOiBbXSkpLFxuICAgICAgICAgICAgLy8gdGhlc2Ugd2lsbCBiZSBpbW1lZGlhdGVseSBkaXNjYXJkZWRcbiAgICAgICAgICAgIG9uX21vdW50OiBbXSxcbiAgICAgICAgICAgIGJlZm9yZV91cGRhdGU6IFtdLFxuICAgICAgICAgICAgYWZ0ZXJfdXBkYXRlOiBbXSxcbiAgICAgICAgICAgIGNhbGxiYWNrczogYmxhbmtfb2JqZWN0KClcbiAgICAgICAgfTtcbiAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KHsgJCQgfSk7XG4gICAgICAgIGNvbnN0IGh0bWwgPSBmbihyZXN1bHQsIHByb3BzLCBiaW5kaW5ncywgc2xvdHMpO1xuICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQocGFyZW50X2NvbXBvbmVudCk7XG4gICAgICAgIHJldHVybiBodG1sO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICByZW5kZXI6IChwcm9wcyA9IHt9LCB7ICQkc2xvdHMgPSB7fSwgY29udGV4dCA9IG5ldyBNYXAoKSB9ID0ge30pID0+IHtcbiAgICAgICAgICAgIG9uX2Rlc3Ryb3kgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdCA9IHsgdGl0bGU6ICcnLCBoZWFkOiAnJywgY3NzOiBuZXcgU2V0KCkgfTtcbiAgICAgICAgICAgIGNvbnN0IGh0bWwgPSAkJHJlbmRlcihyZXN1bHQsIHByb3BzLCB7fSwgJCRzbG90cywgY29udGV4dCk7XG4gICAgICAgICAgICBydW5fYWxsKG9uX2Rlc3Ryb3kpO1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBodG1sLFxuICAgICAgICAgICAgICAgIGNzczoge1xuICAgICAgICAgICAgICAgICAgICBjb2RlOiBBcnJheS5mcm9tKHJlc3VsdC5jc3MpLm1hcChjc3MgPT4gY3NzLmNvZGUpLmpvaW4oJ1xcbicpLFxuICAgICAgICAgICAgICAgICAgICBtYXA6IG51bGwgLy8gVE9ET1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgaGVhZDogcmVzdWx0LnRpdGxlICsgcmVzdWx0LmhlYWRcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgICQkcmVuZGVyXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGFkZF9hdHRyaWJ1dGUobmFtZSwgdmFsdWUsIGJvb2xlYW4pIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCB8fCAoYm9vbGVhbiAmJiAhdmFsdWUpKVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgY29uc3QgYXNzaWdubWVudCA9IChib29sZWFuICYmIHZhbHVlID09PSB0cnVlKSA/ICcnIDogYD1cIiR7ZXNjYXBlKHZhbHVlLCB0cnVlKX1cImA7XG4gICAgcmV0dXJuIGAgJHtuYW1lfSR7YXNzaWdubWVudH1gO1xufVxuZnVuY3Rpb24gYWRkX2NsYXNzZXMoY2xhc3Nlcykge1xuICAgIHJldHVybiBjbGFzc2VzID8gYCBjbGFzcz1cIiR7Y2xhc3Nlc31cImAgOiAnJztcbn1cbmZ1bmN0aW9uIHN0eWxlX29iamVjdF90b19zdHJpbmcoc3R5bGVfb2JqZWN0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHN0eWxlX29iamVjdClcbiAgICAgICAgLmZpbHRlcihrZXkgPT4gc3R5bGVfb2JqZWN0W2tleV0pXG4gICAgICAgIC5tYXAoa2V5ID0+IGAke2tleX06ICR7ZXNjYXBlX2F0dHJpYnV0ZV92YWx1ZShzdHlsZV9vYmplY3Rba2V5XSl9O2ApXG4gICAgICAgIC5qb2luKCcgJyk7XG59XG5mdW5jdGlvbiBhZGRfc3R5bGVzKHN0eWxlX29iamVjdCkge1xuICAgIGNvbnN0IHN0eWxlcyA9IHN0eWxlX29iamVjdF90b19zdHJpbmcoc3R5bGVfb2JqZWN0KTtcbiAgICByZXR1cm4gc3R5bGVzID8gYCBzdHlsZT1cIiR7c3R5bGVzfVwiYCA6ICcnO1xufVxuXG5mdW5jdGlvbiBiaW5kKGNvbXBvbmVudCwgbmFtZSwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBpbmRleCA9IGNvbXBvbmVudC4kJC5wcm9wc1tuYW1lXTtcbiAgICBpZiAoaW5kZXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb21wb25lbnQuJCQuYm91bmRbaW5kZXhdID0gY2FsbGJhY2s7XG4gICAgICAgIGNhbGxiYWNrKGNvbXBvbmVudC4kJC5jdHhbaW5kZXhdKTtcbiAgICB9XG59XG5mdW5jdGlvbiBjcmVhdGVfY29tcG9uZW50KGJsb2NrKSB7XG4gICAgYmxvY2sgJiYgYmxvY2suYygpO1xufVxuZnVuY3Rpb24gY2xhaW1fY29tcG9uZW50KGJsb2NrLCBwYXJlbnRfbm9kZXMpIHtcbiAgICBibG9jayAmJiBibG9jay5sKHBhcmVudF9ub2Rlcyk7XG59XG5mdW5jdGlvbiBtb3VudF9jb21wb25lbnQoY29tcG9uZW50LCB0YXJnZXQsIGFuY2hvciwgY3VzdG9tRWxlbWVudCkge1xuICAgIGNvbnN0IHsgZnJhZ21lbnQsIGFmdGVyX3VwZGF0ZSB9ID0gY29tcG9uZW50LiQkO1xuICAgIGZyYWdtZW50ICYmIGZyYWdtZW50Lm0odGFyZ2V0LCBhbmNob3IpO1xuICAgIGlmICghY3VzdG9tRWxlbWVudCkge1xuICAgICAgICAvLyBvbk1vdW50IGhhcHBlbnMgYmVmb3JlIHRoZSBpbml0aWFsIGFmdGVyVXBkYXRlXG4gICAgICAgIGFkZF9yZW5kZXJfY2FsbGJhY2soKCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3X29uX2Rlc3Ryb3kgPSBjb21wb25lbnQuJCQub25fbW91bnQubWFwKHJ1bikuZmlsdGVyKGlzX2Z1bmN0aW9uKTtcbiAgICAgICAgICAgIC8vIGlmIHRoZSBjb21wb25lbnQgd2FzIGRlc3Ryb3llZCBpbW1lZGlhdGVseVxuICAgICAgICAgICAgLy8gaXQgd2lsbCB1cGRhdGUgdGhlIGAkJC5vbl9kZXN0cm95YCByZWZlcmVuY2UgdG8gYG51bGxgLlxuICAgICAgICAgICAgLy8gdGhlIGRlc3RydWN0dXJlZCBvbl9kZXN0cm95IG1heSBzdGlsbCByZWZlcmVuY2UgdG8gdGhlIG9sZCBhcnJheVxuICAgICAgICAgICAgaWYgKGNvbXBvbmVudC4kJC5vbl9kZXN0cm95KSB7XG4gICAgICAgICAgICAgICAgY29tcG9uZW50LiQkLm9uX2Rlc3Ryb3kucHVzaCguLi5uZXdfb25fZGVzdHJveSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBFZGdlIGNhc2UgLSBjb21wb25lbnQgd2FzIGRlc3Ryb3llZCBpbW1lZGlhdGVseSxcbiAgICAgICAgICAgICAgICAvLyBtb3N0IGxpa2VseSBhcyBhIHJlc3VsdCBvZiBhIGJpbmRpbmcgaW5pdGlhbGlzaW5nXG4gICAgICAgICAgICAgICAgcnVuX2FsbChuZXdfb25fZGVzdHJveSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21wb25lbnQuJCQub25fbW91bnQgPSBbXTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFmdGVyX3VwZGF0ZS5mb3JFYWNoKGFkZF9yZW5kZXJfY2FsbGJhY2spO1xufVxuZnVuY3Rpb24gZGVzdHJveV9jb21wb25lbnQoY29tcG9uZW50LCBkZXRhY2hpbmcpIHtcbiAgICBjb25zdCAkJCA9IGNvbXBvbmVudC4kJDtcbiAgICBpZiAoJCQuZnJhZ21lbnQgIT09IG51bGwpIHtcbiAgICAgICAgZmx1c2hfcmVuZGVyX2NhbGxiYWNrcygkJC5hZnRlcl91cGRhdGUpO1xuICAgICAgICBydW5fYWxsKCQkLm9uX2Rlc3Ryb3kpO1xuICAgICAgICAkJC5mcmFnbWVudCAmJiAkJC5mcmFnbWVudC5kKGRldGFjaGluZyk7XG4gICAgICAgIC8vIFRPRE8gbnVsbCBvdXQgb3RoZXIgcmVmcywgaW5jbHVkaW5nIGNvbXBvbmVudC4kJCAoYnV0IG5lZWQgdG9cbiAgICAgICAgLy8gcHJlc2VydmUgZmluYWwgc3RhdGU/KVxuICAgICAgICAkJC5vbl9kZXN0cm95ID0gJCQuZnJhZ21lbnQgPSBudWxsO1xuICAgICAgICAkJC5jdHggPSBbXTtcbiAgICB9XG59XG5mdW5jdGlvbiBtYWtlX2RpcnR5KGNvbXBvbmVudCwgaSkge1xuICAgIGlmIChjb21wb25lbnQuJCQuZGlydHlbMF0gPT09IC0xKSB7XG4gICAgICAgIGRpcnR5X2NvbXBvbmVudHMucHVzaChjb21wb25lbnQpO1xuICAgICAgICBzY2hlZHVsZV91cGRhdGUoKTtcbiAgICAgICAgY29tcG9uZW50LiQkLmRpcnR5LmZpbGwoMCk7XG4gICAgfVxuICAgIGNvbXBvbmVudC4kJC5kaXJ0eVsoaSAvIDMxKSB8IDBdIHw9ICgxIDw8IChpICUgMzEpKTtcbn1cbmZ1bmN0aW9uIGluaXQoY29tcG9uZW50LCBvcHRpb25zLCBpbnN0YW5jZSwgY3JlYXRlX2ZyYWdtZW50LCBub3RfZXF1YWwsIHByb3BzLCBhcHBlbmRfc3R5bGVzLCBkaXJ0eSA9IFstMV0pIHtcbiAgICBjb25zdCBwYXJlbnRfY29tcG9uZW50ID0gY3VycmVudF9jb21wb25lbnQ7XG4gICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KGNvbXBvbmVudCk7XG4gICAgY29uc3QgJCQgPSBjb21wb25lbnQuJCQgPSB7XG4gICAgICAgIGZyYWdtZW50OiBudWxsLFxuICAgICAgICBjdHg6IFtdLFxuICAgICAgICAvLyBzdGF0ZVxuICAgICAgICBwcm9wcyxcbiAgICAgICAgdXBkYXRlOiBub29wLFxuICAgICAgICBub3RfZXF1YWwsXG4gICAgICAgIGJvdW5kOiBibGFua19vYmplY3QoKSxcbiAgICAgICAgLy8gbGlmZWN5Y2xlXG4gICAgICAgIG9uX21vdW50OiBbXSxcbiAgICAgICAgb25fZGVzdHJveTogW10sXG4gICAgICAgIG9uX2Rpc2Nvbm5lY3Q6IFtdLFxuICAgICAgICBiZWZvcmVfdXBkYXRlOiBbXSxcbiAgICAgICAgYWZ0ZXJfdXBkYXRlOiBbXSxcbiAgICAgICAgY29udGV4dDogbmV3IE1hcChvcHRpb25zLmNvbnRleHQgfHwgKHBhcmVudF9jb21wb25lbnQgPyBwYXJlbnRfY29tcG9uZW50LiQkLmNvbnRleHQgOiBbXSkpLFxuICAgICAgICAvLyBldmVyeXRoaW5nIGVsc2VcbiAgICAgICAgY2FsbGJhY2tzOiBibGFua19vYmplY3QoKSxcbiAgICAgICAgZGlydHksXG4gICAgICAgIHNraXBfYm91bmQ6IGZhbHNlLFxuICAgICAgICByb290OiBvcHRpb25zLnRhcmdldCB8fCBwYXJlbnRfY29tcG9uZW50LiQkLnJvb3RcbiAgICB9O1xuICAgIGFwcGVuZF9zdHlsZXMgJiYgYXBwZW5kX3N0eWxlcygkJC5yb290KTtcbiAgICBsZXQgcmVhZHkgPSBmYWxzZTtcbiAgICAkJC5jdHggPSBpbnN0YW5jZVxuICAgICAgICA/IGluc3RhbmNlKGNvbXBvbmVudCwgb3B0aW9ucy5wcm9wcyB8fCB7fSwgKGksIHJldCwgLi4ucmVzdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSByZXN0Lmxlbmd0aCA/IHJlc3RbMF0gOiByZXQ7XG4gICAgICAgICAgICBpZiAoJCQuY3R4ICYmIG5vdF9lcXVhbCgkJC5jdHhbaV0sICQkLmN0eFtpXSA9IHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGlmICghJCQuc2tpcF9ib3VuZCAmJiAkJC5ib3VuZFtpXSlcbiAgICAgICAgICAgICAgICAgICAgJCQuYm91bmRbaV0odmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChyZWFkeSlcbiAgICAgICAgICAgICAgICAgICAgbWFrZV9kaXJ0eShjb21wb25lbnQsIGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfSlcbiAgICAgICAgOiBbXTtcbiAgICAkJC51cGRhdGUoKTtcbiAgICByZWFkeSA9IHRydWU7XG4gICAgcnVuX2FsbCgkJC5iZWZvcmVfdXBkYXRlKTtcbiAgICAvLyBgZmFsc2VgIGFzIGEgc3BlY2lhbCBjYXNlIG9mIG5vIERPTSBjb21wb25lbnRcbiAgICAkJC5mcmFnbWVudCA9IGNyZWF0ZV9mcmFnbWVudCA/IGNyZWF0ZV9mcmFnbWVudCgkJC5jdHgpIDogZmFsc2U7XG4gICAgaWYgKG9wdGlvbnMudGFyZ2V0KSB7XG4gICAgICAgIGlmIChvcHRpb25zLmh5ZHJhdGUpIHtcbiAgICAgICAgICAgIHN0YXJ0X2h5ZHJhdGluZygpO1xuICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSBjaGlsZHJlbihvcHRpb25zLnRhcmdldCk7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgICAgICAgJCQuZnJhZ21lbnQgJiYgJCQuZnJhZ21lbnQubChub2Rlcyk7XG4gICAgICAgICAgICBub2Rlcy5mb3JFYWNoKGRldGFjaCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgICAgICAgJCQuZnJhZ21lbnQgJiYgJCQuZnJhZ21lbnQuYygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLmludHJvKVxuICAgICAgICAgICAgdHJhbnNpdGlvbl9pbihjb21wb25lbnQuJCQuZnJhZ21lbnQpO1xuICAgICAgICBtb3VudF9jb21wb25lbnQoY29tcG9uZW50LCBvcHRpb25zLnRhcmdldCwgb3B0aW9ucy5hbmNob3IsIG9wdGlvbnMuY3VzdG9tRWxlbWVudCk7XG4gICAgICAgIGVuZF9oeWRyYXRpbmcoKTtcbiAgICAgICAgZmx1c2goKTtcbiAgICB9XG4gICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KHBhcmVudF9jb21wb25lbnQpO1xufVxubGV0IFN2ZWx0ZUVsZW1lbnQ7XG5pZiAodHlwZW9mIEhUTUxFbGVtZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgU3ZlbHRlRWxlbWVudCA9IGNsYXNzIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICB0aGlzLmF0dGFjaFNoYWRvdyh7IG1vZGU6ICdvcGVuJyB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgb25fbW91bnQgfSA9IHRoaXMuJCQ7XG4gICAgICAgICAgICB0aGlzLiQkLm9uX2Rpc2Nvbm5lY3QgPSBvbl9tb3VudC5tYXAocnVuKS5maWx0ZXIoaXNfZnVuY3Rpb24pO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSB0b2RvOiBpbXByb3ZlIHR5cGluZ3NcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHRoaXMuJCQuc2xvdHRlZCkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgdG9kbzogaW1wcm92ZSB0eXBpbmdzXG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmRDaGlsZCh0aGlzLiQkLnNsb3R0ZWRba2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKGF0dHIsIF9vbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXNbYXR0cl0gPSBuZXdWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgICAgIHJ1bl9hbGwodGhpcy4kJC5vbl9kaXNjb25uZWN0KTtcbiAgICAgICAgfVxuICAgICAgICAkZGVzdHJveSgpIHtcbiAgICAgICAgICAgIGRlc3Ryb3lfY29tcG9uZW50KHRoaXMsIDEpO1xuICAgICAgICAgICAgdGhpcy4kZGVzdHJveSA9IG5vb3A7XG4gICAgICAgIH1cbiAgICAgICAgJG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBUT0RPIHNob3VsZCB0aGlzIGRlbGVnYXRlIHRvIGFkZEV2ZW50TGlzdGVuZXI/XG4gICAgICAgICAgICBpZiAoIWlzX2Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBub29wO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgY2FsbGJhY2tzID0gKHRoaXMuJCQuY2FsbGJhY2tzW3R5cGVdIHx8ICh0aGlzLiQkLmNhbGxiYWNrc1t0eXBlXSA9IFtdKSk7XG4gICAgICAgICAgICBjYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gY2FsbGJhY2tzLmluZGV4T2YoY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICAkc2V0KCQkcHJvcHMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLiQkc2V0ICYmICFpc19lbXB0eSgkJHByb3BzKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuJCQuc2tpcF9ib3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy4kJHNldCgkJHByb3BzKTtcbiAgICAgICAgICAgICAgICB0aGlzLiQkLnNraXBfYm91bmQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59XG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIFN2ZWx0ZSBjb21wb25lbnRzLiBVc2VkIHdoZW4gZGV2PWZhbHNlLlxuICovXG5jbGFzcyBTdmVsdGVDb21wb25lbnQge1xuICAgICRkZXN0cm95KCkge1xuICAgICAgICBkZXN0cm95X2NvbXBvbmVudCh0aGlzLCAxKTtcbiAgICAgICAgdGhpcy4kZGVzdHJveSA9IG5vb3A7XG4gICAgfVxuICAgICRvbih0eXBlLCBjYWxsYmFjaykge1xuICAgICAgICBpZiAoIWlzX2Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5vb3A7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY2FsbGJhY2tzID0gKHRoaXMuJCQuY2FsbGJhY2tzW3R5cGVdIHx8ICh0aGlzLiQkLmNhbGxiYWNrc1t0eXBlXSA9IFtdKSk7XG4gICAgICAgIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gY2FsbGJhY2tzLmluZGV4T2YoY2FsbGJhY2spO1xuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSlcbiAgICAgICAgICAgICAgICBjYWxsYmFja3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgJHNldCgkJHByb3BzKSB7XG4gICAgICAgIGlmICh0aGlzLiQkc2V0ICYmICFpc19lbXB0eSgkJHByb3BzKSkge1xuICAgICAgICAgICAgdGhpcy4kJC5za2lwX2JvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuJCRzZXQoJCRwcm9wcyk7XG4gICAgICAgICAgICB0aGlzLiQkLnNraXBfYm91bmQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2hfZGV2KHR5cGUsIGRldGFpbCkge1xuICAgIGRvY3VtZW50LmRpc3BhdGNoRXZlbnQoY3VzdG9tX2V2ZW50KHR5cGUsIE9iamVjdC5hc3NpZ24oeyB2ZXJzaW9uOiAnMy41OS4yJyB9LCBkZXRhaWwpLCB7IGJ1YmJsZXM6IHRydWUgfSkpO1xufVxuZnVuY3Rpb24gYXBwZW5kX2Rldih0YXJnZXQsIG5vZGUpIHtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTUluc2VydCcsIHsgdGFyZ2V0LCBub2RlIH0pO1xuICAgIGFwcGVuZCh0YXJnZXQsIG5vZGUpO1xufVxuZnVuY3Rpb24gYXBwZW5kX2h5ZHJhdGlvbl9kZXYodGFyZ2V0LCBub2RlKSB7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01JbnNlcnQnLCB7IHRhcmdldCwgbm9kZSB9KTtcbiAgICBhcHBlbmRfaHlkcmF0aW9uKHRhcmdldCwgbm9kZSk7XG59XG5mdW5jdGlvbiBpbnNlcnRfZGV2KHRhcmdldCwgbm9kZSwgYW5jaG9yKSB7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01JbnNlcnQnLCB7IHRhcmdldCwgbm9kZSwgYW5jaG9yIH0pO1xuICAgIGluc2VydCh0YXJnZXQsIG5vZGUsIGFuY2hvcik7XG59XG5mdW5jdGlvbiBpbnNlcnRfaHlkcmF0aW9uX2Rldih0YXJnZXQsIG5vZGUsIGFuY2hvcikge1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NSW5zZXJ0JywgeyB0YXJnZXQsIG5vZGUsIGFuY2hvciB9KTtcbiAgICBpbnNlcnRfaHlkcmF0aW9uKHRhcmdldCwgbm9kZSwgYW5jaG9yKTtcbn1cbmZ1bmN0aW9uIGRldGFjaF9kZXYobm9kZSkge1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NUmVtb3ZlJywgeyBub2RlIH0pO1xuICAgIGRldGFjaChub2RlKTtcbn1cbmZ1bmN0aW9uIGRldGFjaF9iZXR3ZWVuX2RldihiZWZvcmUsIGFmdGVyKSB7XG4gICAgd2hpbGUgKGJlZm9yZS5uZXh0U2libGluZyAmJiBiZWZvcmUubmV4dFNpYmxpbmcgIT09IGFmdGVyKSB7XG4gICAgICAgIGRldGFjaF9kZXYoYmVmb3JlLm5leHRTaWJsaW5nKTtcbiAgICB9XG59XG5mdW5jdGlvbiBkZXRhY2hfYmVmb3JlX2RldihhZnRlcikge1xuICAgIHdoaWxlIChhZnRlci5wcmV2aW91c1NpYmxpbmcpIHtcbiAgICAgICAgZGV0YWNoX2RldihhZnRlci5wcmV2aW91c1NpYmxpbmcpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGRldGFjaF9hZnRlcl9kZXYoYmVmb3JlKSB7XG4gICAgd2hpbGUgKGJlZm9yZS5uZXh0U2libGluZykge1xuICAgICAgICBkZXRhY2hfZGV2KGJlZm9yZS5uZXh0U2libGluZyk7XG4gICAgfVxufVxuZnVuY3Rpb24gbGlzdGVuX2Rldihub2RlLCBldmVudCwgaGFuZGxlciwgb3B0aW9ucywgaGFzX3ByZXZlbnRfZGVmYXVsdCwgaGFzX3N0b3BfcHJvcGFnYXRpb24sIGhhc19zdG9wX2ltbWVkaWF0ZV9wcm9wYWdhdGlvbikge1xuICAgIGNvbnN0IG1vZGlmaWVycyA9IG9wdGlvbnMgPT09IHRydWUgPyBbJ2NhcHR1cmUnXSA6IG9wdGlvbnMgPyBBcnJheS5mcm9tKE9iamVjdC5rZXlzKG9wdGlvbnMpKSA6IFtdO1xuICAgIGlmIChoYXNfcHJldmVudF9kZWZhdWx0KVxuICAgICAgICBtb2RpZmllcnMucHVzaCgncHJldmVudERlZmF1bHQnKTtcbiAgICBpZiAoaGFzX3N0b3BfcHJvcGFnYXRpb24pXG4gICAgICAgIG1vZGlmaWVycy5wdXNoKCdzdG9wUHJvcGFnYXRpb24nKTtcbiAgICBpZiAoaGFzX3N0b3BfaW1tZWRpYXRlX3Byb3BhZ2F0aW9uKVxuICAgICAgICBtb2RpZmllcnMucHVzaCgnc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uJyk7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01BZGRFdmVudExpc3RlbmVyJywgeyBub2RlLCBldmVudCwgaGFuZGxlciwgbW9kaWZpZXJzIH0pO1xuICAgIGNvbnN0IGRpc3Bvc2UgPSBsaXN0ZW4obm9kZSwgZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NUmVtb3ZlRXZlbnRMaXN0ZW5lcicsIHsgbm9kZSwgZXZlbnQsIGhhbmRsZXIsIG1vZGlmaWVycyB9KTtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgIH07XG59XG5mdW5jdGlvbiBhdHRyX2Rldihub2RlLCBhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gICAgYXR0cihub2RlLCBhdHRyaWJ1dGUsIHZhbHVlKTtcbiAgICBpZiAodmFsdWUgPT0gbnVsbClcbiAgICAgICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01SZW1vdmVBdHRyaWJ1dGUnLCB7IG5vZGUsIGF0dHJpYnV0ZSB9KTtcbiAgICBlbHNlXG4gICAgICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NU2V0QXR0cmlidXRlJywgeyBub2RlLCBhdHRyaWJ1dGUsIHZhbHVlIH0pO1xufVxuZnVuY3Rpb24gcHJvcF9kZXYobm9kZSwgcHJvcGVydHksIHZhbHVlKSB7XG4gICAgbm9kZVtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVNldFByb3BlcnR5JywgeyBub2RlLCBwcm9wZXJ0eSwgdmFsdWUgfSk7XG59XG5mdW5jdGlvbiBkYXRhc2V0X2Rldihub2RlLCBwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICBub2RlLmRhdGFzZXRbcHJvcGVydHldID0gdmFsdWU7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01TZXREYXRhc2V0JywgeyBub2RlLCBwcm9wZXJ0eSwgdmFsdWUgfSk7XG59XG5mdW5jdGlvbiBzZXRfZGF0YV9kZXYodGV4dCwgZGF0YSkge1xuICAgIGRhdGEgPSAnJyArIGRhdGE7XG4gICAgaWYgKHRleHQuZGF0YSA9PT0gZGF0YSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NU2V0RGF0YScsIHsgbm9kZTogdGV4dCwgZGF0YSB9KTtcbiAgICB0ZXh0LmRhdGEgPSBkYXRhO1xufVxuZnVuY3Rpb24gc2V0X2RhdGFfY29udGVudGVkaXRhYmxlX2Rldih0ZXh0LCBkYXRhKSB7XG4gICAgZGF0YSA9ICcnICsgZGF0YTtcbiAgICBpZiAodGV4dC53aG9sZVRleHQgPT09IGRhdGEpXG4gICAgICAgIHJldHVybjtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVNldERhdGEnLCB7IG5vZGU6IHRleHQsIGRhdGEgfSk7XG4gICAgdGV4dC5kYXRhID0gZGF0YTtcbn1cbmZ1bmN0aW9uIHNldF9kYXRhX21heWJlX2NvbnRlbnRlZGl0YWJsZV9kZXYodGV4dCwgZGF0YSwgYXR0cl92YWx1ZSkge1xuICAgIGlmICh+Y29udGVudGVkaXRhYmxlX3RydXRoeV92YWx1ZXMuaW5kZXhPZihhdHRyX3ZhbHVlKSkge1xuICAgICAgICBzZXRfZGF0YV9jb250ZW50ZWRpdGFibGVfZGV2KHRleHQsIGRhdGEpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgc2V0X2RhdGFfZGV2KHRleHQsIGRhdGEpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHZhbGlkYXRlX2VhY2hfYXJndW1lbnQoYXJnKSB7XG4gICAgaWYgKHR5cGVvZiBhcmcgIT09ICdzdHJpbmcnICYmICEoYXJnICYmIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmICdsZW5ndGgnIGluIGFyZykpIHtcbiAgICAgICAgbGV0IG1zZyA9ICd7I2VhY2h9IG9ubHkgaXRlcmF0ZXMgb3ZlciBhcnJheS1saWtlIG9iamVjdHMuJztcbiAgICAgICAgaWYgKHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicgJiYgYXJnICYmIFN5bWJvbC5pdGVyYXRvciBpbiBhcmcpIHtcbiAgICAgICAgICAgIG1zZyArPSAnIFlvdSBjYW4gdXNlIGEgc3ByZWFkIHRvIGNvbnZlcnQgdGhpcyBpdGVyYWJsZSBpbnRvIGFuIGFycmF5Lic7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgfVxufVxuZnVuY3Rpb24gdmFsaWRhdGVfc2xvdHMobmFtZSwgc2xvdCwga2V5cykge1xuICAgIGZvciAoY29uc3Qgc2xvdF9rZXkgb2YgT2JqZWN0LmtleXMoc2xvdCkpIHtcbiAgICAgICAgaWYgKCF+a2V5cy5pbmRleE9mKHNsb3Rfa2V5KSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGA8JHtuYW1lfT4gcmVjZWl2ZWQgYW4gdW5leHBlY3RlZCBzbG90IFwiJHtzbG90X2tleX1cIi5gKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmZ1bmN0aW9uIHZhbGlkYXRlX2R5bmFtaWNfZWxlbWVudCh0YWcpIHtcbiAgICBjb25zdCBpc19zdHJpbmcgPSB0eXBlb2YgdGFnID09PSAnc3RyaW5nJztcbiAgICBpZiAodGFnICYmICFpc19zdHJpbmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCc8c3ZlbHRlOmVsZW1lbnQ+IGV4cGVjdHMgXCJ0aGlzXCIgYXR0cmlidXRlIHRvIGJlIGEgc3RyaW5nLicpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHZhbGlkYXRlX3ZvaWRfZHluYW1pY19lbGVtZW50KHRhZykge1xuICAgIGlmICh0YWcgJiYgaXNfdm9pZCh0YWcpKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihgPHN2ZWx0ZTplbGVtZW50IHRoaXM9XCIke3RhZ31cIj4gaXMgc2VsZi1jbG9zaW5nIGFuZCBjYW5ub3QgaGF2ZSBjb250ZW50LmApO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNvbnN0cnVjdF9zdmVsdGVfY29tcG9uZW50X2Rldihjb21wb25lbnQsIHByb3BzKSB7XG4gICAgY29uc3QgZXJyb3JfbWVzc2FnZSA9ICd0aGlzPXsuLi59IG9mIDxzdmVsdGU6Y29tcG9uZW50PiBzaG91bGQgc3BlY2lmeSBhIFN2ZWx0ZSBjb21wb25lbnQuJztcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBpbnN0YW5jZSA9IG5ldyBjb21wb25lbnQocHJvcHMpO1xuICAgICAgICBpZiAoIWluc3RhbmNlLiQkIHx8ICFpbnN0YW5jZS4kc2V0IHx8ICFpbnN0YW5jZS4kb24gfHwgIWluc3RhbmNlLiRkZXN0cm95KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JfbWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGluc3RhbmNlO1xuICAgIH1cbiAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IHsgbWVzc2FnZSB9ID0gZXJyO1xuICAgICAgICBpZiAodHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnICYmIG1lc3NhZ2UuaW5kZXhPZignaXMgbm90IGEgY29uc3RydWN0b3InKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvcl9tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgIH1cbn1cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgU3ZlbHRlIGNvbXBvbmVudHMgd2l0aCBzb21lIG1pbm9yIGRldi1lbmhhbmNlbWVudHMuIFVzZWQgd2hlbiBkZXY9dHJ1ZS5cbiAqL1xuY2xhc3MgU3ZlbHRlQ29tcG9uZW50RGV2IGV4dGVuZHMgU3ZlbHRlQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIGlmICghb3B0aW9ucyB8fCAoIW9wdGlvbnMudGFyZ2V0ICYmICFvcHRpb25zLiQkaW5saW5lKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiJ3RhcmdldCcgaXMgYSByZXF1aXJlZCBvcHRpb25cIik7XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG4gICAgJGRlc3Ryb3koKSB7XG4gICAgICAgIHN1cGVyLiRkZXN0cm95KCk7XG4gICAgICAgIHRoaXMuJGRlc3Ryb3kgPSAoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ0NvbXBvbmVudCB3YXMgYWxyZWFkeSBkZXN0cm95ZWQnKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgICAgIH07XG4gICAgfVxuICAgICRjYXB0dXJlX3N0YXRlKCkgeyB9XG4gICAgJGluamVjdF9zdGF0ZSgpIHsgfVxufVxuLyoqXG4gKiBCYXNlIGNsYXNzIHRvIGNyZWF0ZSBzdHJvbmdseSB0eXBlZCBTdmVsdGUgY29tcG9uZW50cy5cbiAqIFRoaXMgb25seSBleGlzdHMgZm9yIHR5cGluZyBwdXJwb3NlcyBhbmQgc2hvdWxkIGJlIHVzZWQgaW4gYC5kLnRzYCBmaWxlcy5cbiAqXG4gKiAjIyMgRXhhbXBsZTpcbiAqXG4gKiBZb3UgaGF2ZSBjb21wb25lbnQgbGlicmFyeSBvbiBucG0gY2FsbGVkIGBjb21wb25lbnQtbGlicmFyeWAsIGZyb20gd2hpY2hcbiAqIHlvdSBleHBvcnQgYSBjb21wb25lbnQgY2FsbGVkIGBNeUNvbXBvbmVudGAuIEZvciBTdmVsdGUrVHlwZVNjcmlwdCB1c2VycyxcbiAqIHlvdSB3YW50IHRvIHByb3ZpZGUgdHlwaW5ncy4gVGhlcmVmb3JlIHlvdSBjcmVhdGUgYSBgaW5kZXguZC50c2A6XG4gKiBgYGB0c1xuICogaW1wb3J0IHsgU3ZlbHRlQ29tcG9uZW50VHlwZWQgfSBmcm9tIFwic3ZlbHRlXCI7XG4gKiBleHBvcnQgY2xhc3MgTXlDb21wb25lbnQgZXh0ZW5kcyBTdmVsdGVDb21wb25lbnRUeXBlZDx7Zm9vOiBzdHJpbmd9PiB7fVxuICogYGBgXG4gKiBUeXBpbmcgdGhpcyBtYWtlcyBpdCBwb3NzaWJsZSBmb3IgSURFcyBsaWtlIFZTIENvZGUgd2l0aCB0aGUgU3ZlbHRlIGV4dGVuc2lvblxuICogdG8gcHJvdmlkZSBpbnRlbGxpc2Vuc2UgYW5kIHRvIHVzZSB0aGUgY29tcG9uZW50IGxpa2UgdGhpcyBpbiBhIFN2ZWx0ZSBmaWxlXG4gKiB3aXRoIFR5cGVTY3JpcHQ6XG4gKiBgYGBzdmVsdGVcbiAqIDxzY3JpcHQgbGFuZz1cInRzXCI+XG4gKiBcdGltcG9ydCB7IE15Q29tcG9uZW50IH0gZnJvbSBcImNvbXBvbmVudC1saWJyYXJ5XCI7XG4gKiA8L3NjcmlwdD5cbiAqIDxNeUNvbXBvbmVudCBmb289eydiYXInfSAvPlxuICogYGBgXG4gKlxuICogIyMjIyBXaHkgbm90IG1ha2UgdGhpcyBwYXJ0IG9mIGBTdmVsdGVDb21wb25lbnQoRGV2KWA/XG4gKiBCZWNhdXNlXG4gKiBgYGB0c1xuICogY2xhc3MgQVN1YmNsYXNzT2ZTdmVsdGVDb21wb25lbnQgZXh0ZW5kcyBTdmVsdGVDb21wb25lbnQ8e2Zvbzogc3RyaW5nfT4ge31cbiAqIGNvbnN0IGNvbXBvbmVudDogdHlwZW9mIFN2ZWx0ZUNvbXBvbmVudCA9IEFTdWJjbGFzc09mU3ZlbHRlQ29tcG9uZW50O1xuICogYGBgXG4gKiB3aWxsIHRocm93IGEgdHlwZSBlcnJvciwgc28gd2UgbmVlZCB0byBzZXBhcmF0ZSB0aGUgbW9yZSBzdHJpY3RseSB0eXBlZCBjbGFzcy5cbiAqL1xuY2xhc3MgU3ZlbHRlQ29tcG9uZW50VHlwZWQgZXh0ZW5kcyBTdmVsdGVDb21wb25lbnREZXYge1xuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICAgICAgc3VwZXIob3B0aW9ucyk7XG4gICAgfVxufVxuZnVuY3Rpb24gbG9vcF9ndWFyZCh0aW1lb3V0KSB7XG4gICAgY29uc3Qgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGlmIChEYXRlLm5vdygpIC0gc3RhcnQgPiB0aW1lb3V0KSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0luZmluaXRlIGxvb3AgZGV0ZWN0ZWQnKTtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmV4cG9ydCB7IEh0bWxUYWcsIEh0bWxUYWdIeWRyYXRpb24sIFJlc2l6ZU9ic2VydmVyU2luZ2xldG9uLCBTdmVsdGVDb21wb25lbnQsIFN2ZWx0ZUNvbXBvbmVudERldiwgU3ZlbHRlQ29tcG9uZW50VHlwZWQsIFN2ZWx0ZUVsZW1lbnQsIGFjdGlvbl9kZXN0cm95ZXIsIGFkZF9hdHRyaWJ1dGUsIGFkZF9jbGFzc2VzLCBhZGRfZmx1c2hfY2FsbGJhY2ssIGFkZF9pZnJhbWVfcmVzaXplX2xpc3RlbmVyLCBhZGRfbG9jYXRpb24sIGFkZF9yZW5kZXJfY2FsbGJhY2ssIGFkZF9zdHlsZXMsIGFkZF90cmFuc2Zvcm0sIGFmdGVyVXBkYXRlLCBhcHBlbmQsIGFwcGVuZF9kZXYsIGFwcGVuZF9lbXB0eV9zdHlsZXNoZWV0LCBhcHBlbmRfaHlkcmF0aW9uLCBhcHBlbmRfaHlkcmF0aW9uX2RldiwgYXBwZW5kX3N0eWxlcywgYXNzaWduLCBhdHRyLCBhdHRyX2RldiwgYXR0cmlidXRlX3RvX29iamVjdCwgYmVmb3JlVXBkYXRlLCBiaW5kLCBiaW5kaW5nX2NhbGxiYWNrcywgYmxhbmtfb2JqZWN0LCBidWJibGUsIGNoZWNrX291dHJvcywgY2hpbGRyZW4sIGNsYWltX2NvbW1lbnQsIGNsYWltX2NvbXBvbmVudCwgY2xhaW1fZWxlbWVudCwgY2xhaW1faHRtbF90YWcsIGNsYWltX3NwYWNlLCBjbGFpbV9zdmdfZWxlbWVudCwgY2xhaW1fdGV4dCwgY2xlYXJfbG9vcHMsIGNvbW1lbnQsIGNvbXBvbmVudF9zdWJzY3JpYmUsIGNvbXB1dGVfcmVzdF9wcm9wcywgY29tcHV0ZV9zbG90cywgY29uc3RydWN0X3N2ZWx0ZV9jb21wb25lbnQsIGNvbnN0cnVjdF9zdmVsdGVfY29tcG9uZW50X2RldiwgY29udGVudGVkaXRhYmxlX3RydXRoeV92YWx1ZXMsIGNyZWF0ZUV2ZW50RGlzcGF0Y2hlciwgY3JlYXRlX2FuaW1hdGlvbiwgY3JlYXRlX2JpZGlyZWN0aW9uYWxfdHJhbnNpdGlvbiwgY3JlYXRlX2NvbXBvbmVudCwgY3JlYXRlX2luX3RyYW5zaXRpb24sIGNyZWF0ZV9vdXRfdHJhbnNpdGlvbiwgY3JlYXRlX3Nsb3QsIGNyZWF0ZV9zc3JfY29tcG9uZW50LCBjdXJyZW50X2NvbXBvbmVudCwgY3VzdG9tX2V2ZW50LCBkYXRhc2V0X2RldiwgZGVidWcsIGRlc3Ryb3lfYmxvY2ssIGRlc3Ryb3lfY29tcG9uZW50LCBkZXN0cm95X2VhY2gsIGRldGFjaCwgZGV0YWNoX2FmdGVyX2RldiwgZGV0YWNoX2JlZm9yZV9kZXYsIGRldGFjaF9iZXR3ZWVuX2RldiwgZGV0YWNoX2RldiwgZGlydHlfY29tcG9uZW50cywgZGlzcGF0Y2hfZGV2LCBlYWNoLCBlbGVtZW50LCBlbGVtZW50X2lzLCBlbXB0eSwgZW5kX2h5ZHJhdGluZywgZXNjYXBlLCBlc2NhcGVfYXR0cmlidXRlX3ZhbHVlLCBlc2NhcGVfb2JqZWN0LCBleGNsdWRlX2ludGVybmFsX3Byb3BzLCBmaXhfYW5kX2Rlc3Ryb3lfYmxvY2ssIGZpeF9hbmRfb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2ssIGZpeF9wb3NpdGlvbiwgZmx1c2gsIGZsdXNoX3JlbmRlcl9jYWxsYmFja3MsIGdldEFsbENvbnRleHRzLCBnZXRDb250ZXh0LCBnZXRfYWxsX2RpcnR5X2Zyb21fc2NvcGUsIGdldF9iaW5kaW5nX2dyb3VwX3ZhbHVlLCBnZXRfY3VycmVudF9jb21wb25lbnQsIGdldF9jdXN0b21fZWxlbWVudHNfc2xvdHMsIGdldF9yb290X2Zvcl9zdHlsZSwgZ2V0X3Nsb3RfY2hhbmdlcywgZ2V0X3NwcmVhZF9vYmplY3QsIGdldF9zcHJlYWRfdXBkYXRlLCBnZXRfc3RvcmVfdmFsdWUsIGdsb2JhbHMsIGdyb3VwX291dHJvcywgaGFuZGxlX3Byb21pc2UsIGhhc0NvbnRleHQsIGhhc19wcm9wLCBoZWFkX3NlbGVjdG9yLCBpZGVudGl0eSwgaW5pdCwgaW5pdF9iaW5kaW5nX2dyb3VwLCBpbml0X2JpbmRpbmdfZ3JvdXBfZHluYW1pYywgaW5zZXJ0LCBpbnNlcnRfZGV2LCBpbnNlcnRfaHlkcmF0aW9uLCBpbnNlcnRfaHlkcmF0aW9uX2RldiwgaW50cm9zLCBpbnZhbGlkX2F0dHJpYnV0ZV9uYW1lX2NoYXJhY3RlciwgaXNfY2xpZW50LCBpc19jcm9zc29yaWdpbiwgaXNfZW1wdHksIGlzX2Z1bmN0aW9uLCBpc19wcm9taXNlLCBpc192b2lkLCBsaXN0ZW4sIGxpc3Rlbl9kZXYsIGxvb3AsIGxvb3BfZ3VhcmQsIG1lcmdlX3Nzcl9zdHlsZXMsIG1pc3NpbmdfY29tcG9uZW50LCBtb3VudF9jb21wb25lbnQsIG5vb3AsIG5vdF9lcXVhbCwgbm93LCBudWxsX3RvX2VtcHR5LCBvYmplY3Rfd2l0aG91dF9wcm9wZXJ0aWVzLCBvbkRlc3Ryb3ksIG9uTW91bnQsIG9uY2UsIG91dHJvX2FuZF9kZXN0cm95X2Jsb2NrLCBwcmV2ZW50X2RlZmF1bHQsIHByb3BfZGV2LCBxdWVyeV9zZWxlY3Rvcl9hbGwsIHJhZiwgcmVzaXplX29ic2VydmVyX2JvcmRlcl9ib3gsIHJlc2l6ZV9vYnNlcnZlcl9jb250ZW50X2JveCwgcmVzaXplX29ic2VydmVyX2RldmljZV9waXhlbF9jb250ZW50X2JveCwgcnVuLCBydW5fYWxsLCBzYWZlX25vdF9lcXVhbCwgc2NoZWR1bGVfdXBkYXRlLCBzZWxlY3RfbXVsdGlwbGVfdmFsdWUsIHNlbGVjdF9vcHRpb24sIHNlbGVjdF9vcHRpb25zLCBzZWxlY3RfdmFsdWUsIHNlbGYsIHNldENvbnRleHQsIHNldF9hdHRyaWJ1dGVzLCBzZXRfY3VycmVudF9jb21wb25lbnQsIHNldF9jdXN0b21fZWxlbWVudF9kYXRhLCBzZXRfY3VzdG9tX2VsZW1lbnRfZGF0YV9tYXAsIHNldF9kYXRhLCBzZXRfZGF0YV9jb250ZW50ZWRpdGFibGUsIHNldF9kYXRhX2NvbnRlbnRlZGl0YWJsZV9kZXYsIHNldF9kYXRhX2Rldiwgc2V0X2RhdGFfbWF5YmVfY29udGVudGVkaXRhYmxlLCBzZXRfZGF0YV9tYXliZV9jb250ZW50ZWRpdGFibGVfZGV2LCBzZXRfZHluYW1pY19lbGVtZW50X2RhdGEsIHNldF9pbnB1dF90eXBlLCBzZXRfaW5wdXRfdmFsdWUsIHNldF9ub3csIHNldF9yYWYsIHNldF9zdG9yZV92YWx1ZSwgc2V0X3N0eWxlLCBzZXRfc3ZnX2F0dHJpYnV0ZXMsIHNwYWNlLCBzcGxpdF9jc3NfdW5pdCwgc3ByZWFkLCBzcmNfdXJsX2VxdWFsLCBzdGFydF9oeWRyYXRpbmcsIHN0b3BfaW1tZWRpYXRlX3Byb3BhZ2F0aW9uLCBzdG9wX3Byb3BhZ2F0aW9uLCBzdWJzY3JpYmUsIHN2Z19lbGVtZW50LCB0ZXh0LCB0aWNrLCB0aW1lX3Jhbmdlc190b19hcnJheSwgdG9fbnVtYmVyLCB0b2dnbGVfY2xhc3MsIHRyYW5zaXRpb25faW4sIHRyYW5zaXRpb25fb3V0LCB0cnVzdGVkLCB1cGRhdGVfYXdhaXRfYmxvY2tfYnJhbmNoLCB1cGRhdGVfa2V5ZWRfZWFjaCwgdXBkYXRlX3Nsb3QsIHVwZGF0ZV9zbG90X2Jhc2UsIHZhbGlkYXRlX2NvbXBvbmVudCwgdmFsaWRhdGVfZHluYW1pY19lbGVtZW50LCB2YWxpZGF0ZV9lYWNoX2FyZ3VtZW50LCB2YWxpZGF0ZV9lYWNoX2tleXMsIHZhbGlkYXRlX3Nsb3RzLCB2YWxpZGF0ZV9zdG9yZSwgdmFsaWRhdGVfdm9pZF9keW5hbWljX2VsZW1lbnQsIHhsaW5rX2F0dHIgfTtcbiIsImV4cG9ydCB7IGlkZW50aXR5IGFzIGxpbmVhciB9IGZyb20gJy4uL2ludGVybmFsL2luZGV4Lm1qcyc7XG5cbi8qXG5BZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL21hdHRkZXNsXG5EaXN0cmlidXRlZCB1bmRlciBNSVQgTGljZW5zZSBodHRwczovL2dpdGh1Yi5jb20vbWF0dGRlc2wvZWFzZXMvYmxvYi9tYXN0ZXIvTElDRU5TRS5tZFxuKi9cbmZ1bmN0aW9uIGJhY2tJbk91dCh0KSB7XG4gICAgY29uc3QgcyA9IDEuNzAxNTggKiAxLjUyNTtcbiAgICBpZiAoKHQgKj0gMikgPCAxKVxuICAgICAgICByZXR1cm4gMC41ICogKHQgKiB0ICogKChzICsgMSkgKiB0IC0gcykpO1xuICAgIHJldHVybiAwLjUgKiAoKHQgLT0gMikgKiB0ICogKChzICsgMSkgKiB0ICsgcykgKyAyKTtcbn1cbmZ1bmN0aW9uIGJhY2tJbih0KSB7XG4gICAgY29uc3QgcyA9IDEuNzAxNTg7XG4gICAgcmV0dXJuIHQgKiB0ICogKChzICsgMSkgKiB0IC0gcyk7XG59XG5mdW5jdGlvbiBiYWNrT3V0KHQpIHtcbiAgICBjb25zdCBzID0gMS43MDE1ODtcbiAgICByZXR1cm4gLS10ICogdCAqICgocyArIDEpICogdCArIHMpICsgMTtcbn1cbmZ1bmN0aW9uIGJvdW5jZU91dCh0KSB7XG4gICAgY29uc3QgYSA9IDQuMCAvIDExLjA7XG4gICAgY29uc3QgYiA9IDguMCAvIDExLjA7XG4gICAgY29uc3QgYyA9IDkuMCAvIDEwLjA7XG4gICAgY29uc3QgY2EgPSA0MzU2LjAgLyAzNjEuMDtcbiAgICBjb25zdCBjYiA9IDM1NDQyLjAgLyAxODA1LjA7XG4gICAgY29uc3QgY2MgPSAxNjA2MS4wIC8gMTgwNS4wO1xuICAgIGNvbnN0IHQyID0gdCAqIHQ7XG4gICAgcmV0dXJuIHQgPCBhXG4gICAgICAgID8gNy41NjI1ICogdDJcbiAgICAgICAgOiB0IDwgYlxuICAgICAgICAgICAgPyA5LjA3NSAqIHQyIC0gOS45ICogdCArIDMuNFxuICAgICAgICAgICAgOiB0IDwgY1xuICAgICAgICAgICAgICAgID8gY2EgKiB0MiAtIGNiICogdCArIGNjXG4gICAgICAgICAgICAgICAgOiAxMC44ICogdCAqIHQgLSAyMC41MiAqIHQgKyAxMC43Mjtcbn1cbmZ1bmN0aW9uIGJvdW5jZUluT3V0KHQpIHtcbiAgICByZXR1cm4gdCA8IDAuNVxuICAgICAgICA/IDAuNSAqICgxLjAgLSBib3VuY2VPdXQoMS4wIC0gdCAqIDIuMCkpXG4gICAgICAgIDogMC41ICogYm91bmNlT3V0KHQgKiAyLjAgLSAxLjApICsgMC41O1xufVxuZnVuY3Rpb24gYm91bmNlSW4odCkge1xuICAgIHJldHVybiAxLjAgLSBib3VuY2VPdXQoMS4wIC0gdCk7XG59XG5mdW5jdGlvbiBjaXJjSW5PdXQodCkge1xuICAgIGlmICgodCAqPSAyKSA8IDEpXG4gICAgICAgIHJldHVybiAtMC41ICogKE1hdGguc3FydCgxIC0gdCAqIHQpIC0gMSk7XG4gICAgcmV0dXJuIDAuNSAqIChNYXRoLnNxcnQoMSAtICh0IC09IDIpICogdCkgKyAxKTtcbn1cbmZ1bmN0aW9uIGNpcmNJbih0KSB7XG4gICAgcmV0dXJuIDEuMCAtIE1hdGguc3FydCgxLjAgLSB0ICogdCk7XG59XG5mdW5jdGlvbiBjaXJjT3V0KHQpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KDEgLSAtLXQgKiB0KTtcbn1cbmZ1bmN0aW9uIGN1YmljSW5PdXQodCkge1xuICAgIHJldHVybiB0IDwgMC41ID8gNC4wICogdCAqIHQgKiB0IDogMC41ICogTWF0aC5wb3coMi4wICogdCAtIDIuMCwgMy4wKSArIDEuMDtcbn1cbmZ1bmN0aW9uIGN1YmljSW4odCkge1xuICAgIHJldHVybiB0ICogdCAqIHQ7XG59XG5mdW5jdGlvbiBjdWJpY091dCh0KSB7XG4gICAgY29uc3QgZiA9IHQgLSAxLjA7XG4gICAgcmV0dXJuIGYgKiBmICogZiArIDEuMDtcbn1cbmZ1bmN0aW9uIGVsYXN0aWNJbk91dCh0KSB7XG4gICAgcmV0dXJuIHQgPCAwLjVcbiAgICAgICAgPyAwLjUgKlxuICAgICAgICAgICAgTWF0aC5zaW4oKCgrMTMuMCAqIE1hdGguUEkpIC8gMikgKiAyLjAgKiB0KSAqXG4gICAgICAgICAgICBNYXRoLnBvdygyLjAsIDEwLjAgKiAoMi4wICogdCAtIDEuMCkpXG4gICAgICAgIDogMC41ICpcbiAgICAgICAgICAgIE1hdGguc2luKCgoLTEzLjAgKiBNYXRoLlBJKSAvIDIpICogKDIuMCAqIHQgLSAxLjAgKyAxLjApKSAqXG4gICAgICAgICAgICBNYXRoLnBvdygyLjAsIC0xMC4wICogKDIuMCAqIHQgLSAxLjApKSArXG4gICAgICAgICAgICAxLjA7XG59XG5mdW5jdGlvbiBlbGFzdGljSW4odCkge1xuICAgIHJldHVybiBNYXRoLnNpbigoMTMuMCAqIHQgKiBNYXRoLlBJKSAvIDIpICogTWF0aC5wb3coMi4wLCAxMC4wICogKHQgLSAxLjApKTtcbn1cbmZ1bmN0aW9uIGVsYXN0aWNPdXQodCkge1xuICAgIHJldHVybiAoTWF0aC5zaW4oKC0xMy4wICogKHQgKyAxLjApICogTWF0aC5QSSkgLyAyKSAqIE1hdGgucG93KDIuMCwgLTEwLjAgKiB0KSArIDEuMCk7XG59XG5mdW5jdGlvbiBleHBvSW5PdXQodCkge1xuICAgIHJldHVybiB0ID09PSAwLjAgfHwgdCA9PT0gMS4wXG4gICAgICAgID8gdFxuICAgICAgICA6IHQgPCAwLjVcbiAgICAgICAgICAgID8gKzAuNSAqIE1hdGgucG93KDIuMCwgMjAuMCAqIHQgLSAxMC4wKVxuICAgICAgICAgICAgOiAtMC41ICogTWF0aC5wb3coMi4wLCAxMC4wIC0gdCAqIDIwLjApICsgMS4wO1xufVxuZnVuY3Rpb24gZXhwb0luKHQpIHtcbiAgICByZXR1cm4gdCA9PT0gMC4wID8gdCA6IE1hdGgucG93KDIuMCwgMTAuMCAqICh0IC0gMS4wKSk7XG59XG5mdW5jdGlvbiBleHBvT3V0KHQpIHtcbiAgICByZXR1cm4gdCA9PT0gMS4wID8gdCA6IDEuMCAtIE1hdGgucG93KDIuMCwgLTEwLjAgKiB0KTtcbn1cbmZ1bmN0aW9uIHF1YWRJbk91dCh0KSB7XG4gICAgdCAvPSAwLjU7XG4gICAgaWYgKHQgPCAxKVxuICAgICAgICByZXR1cm4gMC41ICogdCAqIHQ7XG4gICAgdC0tO1xuICAgIHJldHVybiAtMC41ICogKHQgKiAodCAtIDIpIC0gMSk7XG59XG5mdW5jdGlvbiBxdWFkSW4odCkge1xuICAgIHJldHVybiB0ICogdDtcbn1cbmZ1bmN0aW9uIHF1YWRPdXQodCkge1xuICAgIHJldHVybiAtdCAqICh0IC0gMi4wKTtcbn1cbmZ1bmN0aW9uIHF1YXJ0SW5PdXQodCkge1xuICAgIHJldHVybiB0IDwgMC41XG4gICAgICAgID8gKzguMCAqIE1hdGgucG93KHQsIDQuMClcbiAgICAgICAgOiAtOC4wICogTWF0aC5wb3codCAtIDEuMCwgNC4wKSArIDEuMDtcbn1cbmZ1bmN0aW9uIHF1YXJ0SW4odCkge1xuICAgIHJldHVybiBNYXRoLnBvdyh0LCA0LjApO1xufVxuZnVuY3Rpb24gcXVhcnRPdXQodCkge1xuICAgIHJldHVybiBNYXRoLnBvdyh0IC0gMS4wLCAzLjApICogKDEuMCAtIHQpICsgMS4wO1xufVxuZnVuY3Rpb24gcXVpbnRJbk91dCh0KSB7XG4gICAgaWYgKCh0ICo9IDIpIDwgMSlcbiAgICAgICAgcmV0dXJuIDAuNSAqIHQgKiB0ICogdCAqIHQgKiB0O1xuICAgIHJldHVybiAwLjUgKiAoKHQgLT0gMikgKiB0ICogdCAqIHQgKiB0ICsgMik7XG59XG5mdW5jdGlvbiBxdWludEluKHQpIHtcbiAgICByZXR1cm4gdCAqIHQgKiB0ICogdCAqIHQ7XG59XG5mdW5jdGlvbiBxdWludE91dCh0KSB7XG4gICAgcmV0dXJuIC0tdCAqIHQgKiB0ICogdCAqIHQgKyAxO1xufVxuZnVuY3Rpb24gc2luZUluT3V0KHQpIHtcbiAgICByZXR1cm4gLTAuNSAqIChNYXRoLmNvcyhNYXRoLlBJICogdCkgLSAxKTtcbn1cbmZ1bmN0aW9uIHNpbmVJbih0KSB7XG4gICAgY29uc3QgdiA9IE1hdGguY29zKHQgKiBNYXRoLlBJICogMC41KTtcbiAgICBpZiAoTWF0aC5hYnModikgPCAxZS0xNClcbiAgICAgICAgcmV0dXJuIDE7XG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gMSAtIHY7XG59XG5mdW5jdGlvbiBzaW5lT3V0KHQpIHtcbiAgICByZXR1cm4gTWF0aC5zaW4oKHQgKiBNYXRoLlBJKSAvIDIpO1xufVxuXG5leHBvcnQgeyBiYWNrSW4sIGJhY2tJbk91dCwgYmFja091dCwgYm91bmNlSW4sIGJvdW5jZUluT3V0LCBib3VuY2VPdXQsIGNpcmNJbiwgY2lyY0luT3V0LCBjaXJjT3V0LCBjdWJpY0luLCBjdWJpY0luT3V0LCBjdWJpY091dCwgZWxhc3RpY0luLCBlbGFzdGljSW5PdXQsIGVsYXN0aWNPdXQsIGV4cG9JbiwgZXhwb0luT3V0LCBleHBvT3V0LCBxdWFkSW4sIHF1YWRJbk91dCwgcXVhZE91dCwgcXVhcnRJbiwgcXVhcnRJbk91dCwgcXVhcnRPdXQsIHF1aW50SW4sIHF1aW50SW5PdXQsIHF1aW50T3V0LCBzaW5lSW4sIHNpbmVJbk91dCwgc2luZU91dCB9O1xuIiwiaW1wb3J0IHsgY3ViaWNJbk91dCwgbGluZWFyLCBjdWJpY091dCB9IGZyb20gJy4uL2Vhc2luZy9pbmRleC5tanMnO1xuaW1wb3J0IHsgc3BsaXRfY3NzX3VuaXQsIGlzX2Z1bmN0aW9uLCBhc3NpZ24gfSBmcm9tICcuLi9pbnRlcm5hbC9pbmRleC5tanMnO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbkNvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxyXG5cclxuUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55XHJcbnB1cnBvc2Ugd2l0aCBvciB3aXRob3V0IGZlZSBpcyBoZXJlYnkgZ3JhbnRlZC5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEhcclxuUkVHQVJEIFRPIFRISVMgU09GVFdBUkUgSU5DTFVESU5HIEFMTCBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZXHJcbkFORCBGSVRORVNTLiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SIEJFIExJQUJMRSBGT1IgQU5ZIFNQRUNJQUwsIERJUkVDVCxcclxuSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NXHJcbkxPU1MgT0YgVVNFLCBEQVRBIE9SIFBST0ZJVFMsIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBORUdMSUdFTkNFIE9SXHJcbk9USEVSIFRPUlRJT1VTIEFDVElPTiwgQVJJU0lORyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBVU0UgT1JcclxuUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS5cclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxuXHJcbmZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXHJcbiAgICAgICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxuXG5mdW5jdGlvbiBibHVyKG5vZGUsIHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDQwMCwgZWFzaW5nID0gY3ViaWNJbk91dCwgYW1vdW50ID0gNSwgb3BhY2l0eSA9IDAgfSA9IHt9KSB7XG4gICAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUpO1xuICAgIGNvbnN0IHRhcmdldF9vcGFjaXR5ID0gK3N0eWxlLm9wYWNpdHk7XG4gICAgY29uc3QgZiA9IHN0eWxlLmZpbHRlciA9PT0gJ25vbmUnID8gJycgOiBzdHlsZS5maWx0ZXI7XG4gICAgY29uc3Qgb2QgPSB0YXJnZXRfb3BhY2l0eSAqICgxIC0gb3BhY2l0eSk7XG4gICAgY29uc3QgW3ZhbHVlLCB1bml0XSA9IHNwbGl0X2Nzc191bml0KGFtb3VudCk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVsYXksXG4gICAgICAgIGR1cmF0aW9uLFxuICAgICAgICBlYXNpbmcsXG4gICAgICAgIGNzczogKF90LCB1KSA9PiBgb3BhY2l0eTogJHt0YXJnZXRfb3BhY2l0eSAtIChvZCAqIHUpfTsgZmlsdGVyOiAke2Z9IGJsdXIoJHt1ICogdmFsdWV9JHt1bml0fSk7YFxuICAgIH07XG59XG5mdW5jdGlvbiBmYWRlKG5vZGUsIHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDQwMCwgZWFzaW5nID0gbGluZWFyIH0gPSB7fSkge1xuICAgIGNvbnN0IG8gPSArZ2V0Q29tcHV0ZWRTdHlsZShub2RlKS5vcGFjaXR5O1xuICAgIHJldHVybiB7XG4gICAgICAgIGRlbGF5LFxuICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgZWFzaW5nLFxuICAgICAgICBjc3M6IHQgPT4gYG9wYWNpdHk6ICR7dCAqIG99YFxuICAgIH07XG59XG5mdW5jdGlvbiBmbHkobm9kZSwgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gNDAwLCBlYXNpbmcgPSBjdWJpY091dCwgeCA9IDAsIHkgPSAwLCBvcGFjaXR5ID0gMCB9ID0ge30pIHtcbiAgICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgY29uc3QgdGFyZ2V0X29wYWNpdHkgPSArc3R5bGUub3BhY2l0eTtcbiAgICBjb25zdCB0cmFuc2Zvcm0gPSBzdHlsZS50cmFuc2Zvcm0gPT09ICdub25lJyA/ICcnIDogc3R5bGUudHJhbnNmb3JtO1xuICAgIGNvbnN0IG9kID0gdGFyZ2V0X29wYWNpdHkgKiAoMSAtIG9wYWNpdHkpO1xuICAgIGNvbnN0IFt4VmFsdWUsIHhVbml0XSA9IHNwbGl0X2Nzc191bml0KHgpO1xuICAgIGNvbnN0IFt5VmFsdWUsIHlVbml0XSA9IHNwbGl0X2Nzc191bml0KHkpO1xuICAgIHJldHVybiB7XG4gICAgICAgIGRlbGF5LFxuICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgZWFzaW5nLFxuICAgICAgICBjc3M6ICh0LCB1KSA9PiBgXG5cdFx0XHR0cmFuc2Zvcm06ICR7dHJhbnNmb3JtfSB0cmFuc2xhdGUoJHsoMSAtIHQpICogeFZhbHVlfSR7eFVuaXR9LCAkeygxIC0gdCkgKiB5VmFsdWV9JHt5VW5pdH0pO1xuXHRcdFx0b3BhY2l0eTogJHt0YXJnZXRfb3BhY2l0eSAtIChvZCAqIHUpfWBcbiAgICB9O1xufVxuZnVuY3Rpb24gc2xpZGUobm9kZSwgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gNDAwLCBlYXNpbmcgPSBjdWJpY091dCwgYXhpcyA9ICd5JyB9ID0ge30pIHtcbiAgICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgY29uc3Qgb3BhY2l0eSA9ICtzdHlsZS5vcGFjaXR5O1xuICAgIGNvbnN0IHByaW1hcnlfcHJvcGVydHkgPSBheGlzID09PSAneScgPyAnaGVpZ2h0JyA6ICd3aWR0aCc7XG4gICAgY29uc3QgcHJpbWFyeV9wcm9wZXJ0eV92YWx1ZSA9IHBhcnNlRmxvYXQoc3R5bGVbcHJpbWFyeV9wcm9wZXJ0eV0pO1xuICAgIGNvbnN0IHNlY29uZGFyeV9wcm9wZXJ0aWVzID0gYXhpcyA9PT0gJ3knID8gWyd0b3AnLCAnYm90dG9tJ10gOiBbJ2xlZnQnLCAncmlnaHQnXTtcbiAgICBjb25zdCBjYXBpdGFsaXplZF9zZWNvbmRhcnlfcHJvcGVydGllcyA9IHNlY29uZGFyeV9wcm9wZXJ0aWVzLm1hcCgoZSkgPT4gYCR7ZVswXS50b1VwcGVyQ2FzZSgpfSR7ZS5zbGljZSgxKX1gKTtcbiAgICBjb25zdCBwYWRkaW5nX3N0YXJ0X3ZhbHVlID0gcGFyc2VGbG9hdChzdHlsZVtgcGFkZGluZyR7Y2FwaXRhbGl6ZWRfc2Vjb25kYXJ5X3Byb3BlcnRpZXNbMF19YF0pO1xuICAgIGNvbnN0IHBhZGRpbmdfZW5kX3ZhbHVlID0gcGFyc2VGbG9hdChzdHlsZVtgcGFkZGluZyR7Y2FwaXRhbGl6ZWRfc2Vjb25kYXJ5X3Byb3BlcnRpZXNbMV19YF0pO1xuICAgIGNvbnN0IG1hcmdpbl9zdGFydF92YWx1ZSA9IHBhcnNlRmxvYXQoc3R5bGVbYG1hcmdpbiR7Y2FwaXRhbGl6ZWRfc2Vjb25kYXJ5X3Byb3BlcnRpZXNbMF19YF0pO1xuICAgIGNvbnN0IG1hcmdpbl9lbmRfdmFsdWUgPSBwYXJzZUZsb2F0KHN0eWxlW2BtYXJnaW4ke2NhcGl0YWxpemVkX3NlY29uZGFyeV9wcm9wZXJ0aWVzWzFdfWBdKTtcbiAgICBjb25zdCBib3JkZXJfd2lkdGhfc3RhcnRfdmFsdWUgPSBwYXJzZUZsb2F0KHN0eWxlW2Bib3JkZXIke2NhcGl0YWxpemVkX3NlY29uZGFyeV9wcm9wZXJ0aWVzWzBdfVdpZHRoYF0pO1xuICAgIGNvbnN0IGJvcmRlcl93aWR0aF9lbmRfdmFsdWUgPSBwYXJzZUZsb2F0KHN0eWxlW2Bib3JkZXIke2NhcGl0YWxpemVkX3NlY29uZGFyeV9wcm9wZXJ0aWVzWzFdfVdpZHRoYF0pO1xuICAgIHJldHVybiB7XG4gICAgICAgIGRlbGF5LFxuICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgZWFzaW5nLFxuICAgICAgICBjc3M6IHQgPT4gJ292ZXJmbG93OiBoaWRkZW47JyArXG4gICAgICAgICAgICBgb3BhY2l0eTogJHtNYXRoLm1pbih0ICogMjAsIDEpICogb3BhY2l0eX07YCArXG4gICAgICAgICAgICBgJHtwcmltYXJ5X3Byb3BlcnR5fTogJHt0ICogcHJpbWFyeV9wcm9wZXJ0eV92YWx1ZX1weDtgICtcbiAgICAgICAgICAgIGBwYWRkaW5nLSR7c2Vjb25kYXJ5X3Byb3BlcnRpZXNbMF19OiAke3QgKiBwYWRkaW5nX3N0YXJ0X3ZhbHVlfXB4O2AgK1xuICAgICAgICAgICAgYHBhZGRpbmctJHtzZWNvbmRhcnlfcHJvcGVydGllc1sxXX06ICR7dCAqIHBhZGRpbmdfZW5kX3ZhbHVlfXB4O2AgK1xuICAgICAgICAgICAgYG1hcmdpbi0ke3NlY29uZGFyeV9wcm9wZXJ0aWVzWzBdfTogJHt0ICogbWFyZ2luX3N0YXJ0X3ZhbHVlfXB4O2AgK1xuICAgICAgICAgICAgYG1hcmdpbi0ke3NlY29uZGFyeV9wcm9wZXJ0aWVzWzFdfTogJHt0ICogbWFyZ2luX2VuZF92YWx1ZX1weDtgICtcbiAgICAgICAgICAgIGBib3JkZXItJHtzZWNvbmRhcnlfcHJvcGVydGllc1swXX0td2lkdGg6ICR7dCAqIGJvcmRlcl93aWR0aF9zdGFydF92YWx1ZX1weDtgICtcbiAgICAgICAgICAgIGBib3JkZXItJHtzZWNvbmRhcnlfcHJvcGVydGllc1sxXX0td2lkdGg6ICR7dCAqIGJvcmRlcl93aWR0aF9lbmRfdmFsdWV9cHg7YFxuICAgIH07XG59XG5mdW5jdGlvbiBzY2FsZShub2RlLCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSA0MDAsIGVhc2luZyA9IGN1YmljT3V0LCBzdGFydCA9IDAsIG9wYWNpdHkgPSAwIH0gPSB7fSkge1xuICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICBjb25zdCB0YXJnZXRfb3BhY2l0eSA9ICtzdHlsZS5vcGFjaXR5O1xuICAgIGNvbnN0IHRyYW5zZm9ybSA9IHN0eWxlLnRyYW5zZm9ybSA9PT0gJ25vbmUnID8gJycgOiBzdHlsZS50cmFuc2Zvcm07XG4gICAgY29uc3Qgc2QgPSAxIC0gc3RhcnQ7XG4gICAgY29uc3Qgb2QgPSB0YXJnZXRfb3BhY2l0eSAqICgxIC0gb3BhY2l0eSk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgZGVsYXksXG4gICAgICAgIGR1cmF0aW9uLFxuICAgICAgICBlYXNpbmcsXG4gICAgICAgIGNzczogKF90LCB1KSA9PiBgXG5cdFx0XHR0cmFuc2Zvcm06ICR7dHJhbnNmb3JtfSBzY2FsZSgkezEgLSAoc2QgKiB1KX0pO1xuXHRcdFx0b3BhY2l0eTogJHt0YXJnZXRfb3BhY2l0eSAtIChvZCAqIHUpfVxuXHRcdGBcbiAgICB9O1xufVxuZnVuY3Rpb24gZHJhdyhub2RlLCB7IGRlbGF5ID0gMCwgc3BlZWQsIGR1cmF0aW9uLCBlYXNpbmcgPSBjdWJpY0luT3V0IH0gPSB7fSkge1xuICAgIGxldCBsZW4gPSBub2RlLmdldFRvdGFsTGVuZ3RoKCk7XG4gICAgY29uc3Qgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUpO1xuICAgIGlmIChzdHlsZS5zdHJva2VMaW5lY2FwICE9PSAnYnV0dCcpIHtcbiAgICAgICAgbGVuICs9IHBhcnNlSW50KHN0eWxlLnN0cm9rZVdpZHRoKTtcbiAgICB9XG4gICAgaWYgKGR1cmF0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKHNwZWVkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGR1cmF0aW9uID0gODAwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZHVyYXRpb24gPSBsZW4gLyBzcGVlZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZHVyYXRpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZHVyYXRpb24gPSBkdXJhdGlvbihsZW4pO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBkZWxheSxcbiAgICAgICAgZHVyYXRpb24sXG4gICAgICAgIGVhc2luZyxcbiAgICAgICAgY3NzOiAoXywgdSkgPT4gYFxuXHRcdFx0c3Ryb2tlLWRhc2hhcnJheTogJHtsZW59O1xuXHRcdFx0c3Ryb2tlLWRhc2hvZmZzZXQ6ICR7dSAqIGxlbn07XG5cdFx0YFxuICAgIH07XG59XG5mdW5jdGlvbiBjcm9zc2ZhZGUoX2EpIHtcbiAgICB2YXIgeyBmYWxsYmFjayB9ID0gX2EsIGRlZmF1bHRzID0gX19yZXN0KF9hLCBbXCJmYWxsYmFja1wiXSk7XG4gICAgY29uc3QgdG9fcmVjZWl2ZSA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCB0b19zZW5kID0gbmV3IE1hcCgpO1xuICAgIGZ1bmN0aW9uIGNyb3NzZmFkZShmcm9tX25vZGUsIG5vZGUsIHBhcmFtcykge1xuICAgICAgICBjb25zdCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSBkID0+IE1hdGguc3FydChkKSAqIDMwLCBlYXNpbmcgPSBjdWJpY091dCB9ID0gYXNzaWduKGFzc2lnbih7fSwgZGVmYXVsdHMpLCBwYXJhbXMpO1xuICAgICAgICBjb25zdCBmcm9tID0gZnJvbV9ub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBjb25zdCB0byA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIGNvbnN0IGR4ID0gZnJvbS5sZWZ0IC0gdG8ubGVmdDtcbiAgICAgICAgY29uc3QgZHkgPSBmcm9tLnRvcCAtIHRvLnRvcDtcbiAgICAgICAgY29uc3QgZHcgPSBmcm9tLndpZHRoIC8gdG8ud2lkdGg7XG4gICAgICAgIGNvbnN0IGRoID0gZnJvbS5oZWlnaHQgLyB0by5oZWlnaHQ7XG4gICAgICAgIGNvbnN0IGQgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybSA9IHN0eWxlLnRyYW5zZm9ybSA9PT0gJ25vbmUnID8gJycgOiBzdHlsZS50cmFuc2Zvcm07XG4gICAgICAgIGNvbnN0IG9wYWNpdHkgPSArc3R5bGUub3BhY2l0eTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRlbGF5LFxuICAgICAgICAgICAgZHVyYXRpb246IGlzX2Z1bmN0aW9uKGR1cmF0aW9uKSA/IGR1cmF0aW9uKGQpIDogZHVyYXRpb24sXG4gICAgICAgICAgICBlYXNpbmcsXG4gICAgICAgICAgICBjc3M6ICh0LCB1KSA9PiBgXG5cdFx0XHRcdG9wYWNpdHk6ICR7dCAqIG9wYWNpdHl9O1xuXHRcdFx0XHR0cmFuc2Zvcm0tb3JpZ2luOiB0b3AgbGVmdDtcblx0XHRcdFx0dHJhbnNmb3JtOiAke3RyYW5zZm9ybX0gdHJhbnNsYXRlKCR7dSAqIGR4fXB4LCR7dSAqIGR5fXB4KSBzY2FsZSgke3QgKyAoMSAtIHQpICogZHd9LCAke3QgKyAoMSAtIHQpICogZGh9KTtcblx0XHRcdGBcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gdHJhbnNpdGlvbihpdGVtcywgY291bnRlcnBhcnRzLCBpbnRybykge1xuICAgICAgICByZXR1cm4gKG5vZGUsIHBhcmFtcykgPT4ge1xuICAgICAgICAgICAgaXRlbXMuc2V0KHBhcmFtcy5rZXksIG5vZGUpO1xuICAgICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY291bnRlcnBhcnRzLmhhcyhwYXJhbXMua2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvdGhlcl9ub2RlID0gY291bnRlcnBhcnRzLmdldChwYXJhbXMua2V5KTtcbiAgICAgICAgICAgICAgICAgICAgY291bnRlcnBhcnRzLmRlbGV0ZShwYXJhbXMua2V5KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNyb3NzZmFkZShvdGhlcl9ub2RlLCBub2RlLCBwYXJhbXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBpZiB0aGUgbm9kZSBpcyBkaXNhcHBlYXJpbmcgYWx0b2dldGhlclxuICAgICAgICAgICAgICAgIC8vIChpLmUuIHdhc24ndCBjbGFpbWVkIGJ5IHRoZSBvdGhlciBsaXN0KVxuICAgICAgICAgICAgICAgIC8vIHRoZW4gd2UgbmVlZCB0byBzdXBwbHkgYW4gb3V0cm9cbiAgICAgICAgICAgICAgICBpdGVtcy5kZWxldGUocGFyYW1zLmtleSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbGxiYWNrICYmIGZhbGxiYWNrKG5vZGUsIHBhcmFtcywgaW50cm8pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIFtcbiAgICAgICAgdHJhbnNpdGlvbih0b19zZW5kLCB0b19yZWNlaXZlLCBmYWxzZSksXG4gICAgICAgIHRyYW5zaXRpb24odG9fcmVjZWl2ZSwgdG9fc2VuZCwgdHJ1ZSlcbiAgICBdO1xufVxuXG5leHBvcnQgeyBibHVyLCBjcm9zc2ZhZGUsIGRyYXcsIGZhZGUsIGZseSwgc2NhbGUsIHNsaWRlIH07XG4iLCIvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbkNvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLlxyXG5cclxuUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55XHJcbnB1cnBvc2Ugd2l0aCBvciB3aXRob3V0IGZlZSBpcyBoZXJlYnkgZ3JhbnRlZC5cclxuXHJcblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEhcclxuUkVHQVJEIFRPIFRISVMgU09GVFdBUkUgSU5DTFVESU5HIEFMTCBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZXHJcbkFORCBGSVRORVNTLiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SIEJFIExJQUJMRSBGT1IgQU5ZIFNQRUNJQUwsIERJUkVDVCxcclxuSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NXHJcbkxPU1MgT0YgVVNFLCBEQVRBIE9SIFBST0ZJVFMsIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBORUdMSUdFTkNFIE9SXHJcbk9USEVSIFRPUlRJT1VTIEFDVElPTiwgQVJJU0lORyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBVU0UgT1JcclxuUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS5cclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxuLyogZ2xvYmFsIFJlZmxlY3QsIFByb21pc2UsIFN1cHByZXNzZWRFcnJvciwgU3ltYm9sLCBJdGVyYXRvciAqL1xyXG5cclxudmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbihkLCBiKSB7XHJcbiAgICBleHRlbmRTdGF0aWNzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8XHJcbiAgICAgICAgKHsgX19wcm90b19fOiBbXSB9IGluc3RhbmNlb2YgQXJyYXkgJiYgZnVuY3Rpb24gKGQsIGIpIHsgZC5fX3Byb3RvX18gPSBiOyB9KSB8fFxyXG4gICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICByZXR1cm4gZXh0ZW5kU3RhdGljcyhkLCBiKTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4dGVuZHMoZCwgYikge1xyXG4gICAgaWYgKHR5cGVvZiBiICE9PSBcImZ1bmN0aW9uXCIgJiYgYiAhPT0gbnVsbClcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2xhc3MgZXh0ZW5kcyB2YWx1ZSBcIiArIFN0cmluZyhiKSArIFwiIGlzIG5vdCBhIGNvbnN0cnVjdG9yIG9yIG51bGxcIik7XHJcbiAgICBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG4gICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19hc3NpZ24gPSBmdW5jdGlvbigpIHtcclxuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiBfX2Fzc2lnbih0KSB7XHJcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XHJcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XHJcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSkgdFtwXSA9IHNbcF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIF9fYXNzaWduLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3Jlc3QocywgZSkge1xyXG4gICAgdmFyIHQgPSB7fTtcclxuICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSAmJiBlLmluZGV4T2YocCkgPCAwKVxyXG4gICAgICAgIHRbcF0gPSBzW3BdO1xyXG4gICAgaWYgKHMgIT0gbnVsbCAmJiB0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyA9PT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBwID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhzKTsgaSA8IHAubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGUuaW5kZXhPZihwW2ldKSA8IDAgJiYgT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHMsIHBbaV0pKVxyXG4gICAgICAgICAgICAgICAgdFtwW2ldXSA9IHNbcFtpXV07XHJcbiAgICAgICAgfVxyXG4gICAgcmV0dXJuIHQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2RlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKSB7XHJcbiAgICB2YXIgYyA9IGFyZ3VtZW50cy5sZW5ndGgsIHIgPSBjIDwgMyA/IHRhcmdldCA6IGRlc2MgPT09IG51bGwgPyBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih0YXJnZXQsIGtleSkgOiBkZXNjLCBkO1xyXG4gICAgaWYgKHR5cGVvZiBSZWZsZWN0ID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBSZWZsZWN0LmRlY29yYXRlID09PSBcImZ1bmN0aW9uXCIpIHIgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnMsIHRhcmdldCwga2V5LCBkZXNjKTtcclxuICAgIGVsc2UgZm9yICh2YXIgaSA9IGRlY29yYXRvcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIGlmIChkID0gZGVjb3JhdG9yc1tpXSkgciA9IChjIDwgMyA/IGQocikgOiBjID4gMyA/IGQodGFyZ2V0LCBrZXksIHIpIDogZCh0YXJnZXQsIGtleSkpIHx8IHI7XHJcbiAgICByZXR1cm4gYyA+IDMgJiYgciAmJiBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHIpLCByO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19wYXJhbShwYXJhbUluZGV4LCBkZWNvcmF0b3IpIHtcclxuICAgIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0LCBrZXkpIHsgZGVjb3JhdG9yKHRhcmdldCwga2V5LCBwYXJhbUluZGV4KTsgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19lc0RlY29yYXRlKGN0b3IsIGRlc2NyaXB0b3JJbiwgZGVjb3JhdG9ycywgY29udGV4dEluLCBpbml0aWFsaXplcnMsIGV4dHJhSW5pdGlhbGl6ZXJzKSB7XHJcbiAgICBmdW5jdGlvbiBhY2NlcHQoZikgeyBpZiAoZiAhPT0gdm9pZCAwICYmIHR5cGVvZiBmICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJGdW5jdGlvbiBleHBlY3RlZFwiKTsgcmV0dXJuIGY7IH1cclxuICAgIHZhciBraW5kID0gY29udGV4dEluLmtpbmQsIGtleSA9IGtpbmQgPT09IFwiZ2V0dGVyXCIgPyBcImdldFwiIDoga2luZCA9PT0gXCJzZXR0ZXJcIiA/IFwic2V0XCIgOiBcInZhbHVlXCI7XHJcbiAgICB2YXIgdGFyZ2V0ID0gIWRlc2NyaXB0b3JJbiAmJiBjdG9yID8gY29udGV4dEluW1wic3RhdGljXCJdID8gY3RvciA6IGN0b3IucHJvdG90eXBlIDogbnVsbDtcclxuICAgIHZhciBkZXNjcmlwdG9yID0gZGVzY3JpcHRvckluIHx8ICh0YXJnZXQgPyBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwgY29udGV4dEluLm5hbWUpIDoge30pO1xyXG4gICAgdmFyIF8sIGRvbmUgPSBmYWxzZTtcclxuICAgIGZvciAodmFyIGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgdmFyIGNvbnRleHQgPSB7fTtcclxuICAgICAgICBmb3IgKHZhciBwIGluIGNvbnRleHRJbikgY29udGV4dFtwXSA9IHAgPT09IFwiYWNjZXNzXCIgPyB7fSA6IGNvbnRleHRJbltwXTtcclxuICAgICAgICBmb3IgKHZhciBwIGluIGNvbnRleHRJbi5hY2Nlc3MpIGNvbnRleHQuYWNjZXNzW3BdID0gY29udGV4dEluLmFjY2Vzc1twXTtcclxuICAgICAgICBjb250ZXh0LmFkZEluaXRpYWxpemVyID0gZnVuY3Rpb24gKGYpIHsgaWYgKGRvbmUpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgYWRkIGluaXRpYWxpemVycyBhZnRlciBkZWNvcmF0aW9uIGhhcyBjb21wbGV0ZWRcIik7IGV4dHJhSW5pdGlhbGl6ZXJzLnB1c2goYWNjZXB0KGYgfHwgbnVsbCkpOyB9O1xyXG4gICAgICAgIHZhciByZXN1bHQgPSAoMCwgZGVjb3JhdG9yc1tpXSkoa2luZCA9PT0gXCJhY2Nlc3NvclwiID8geyBnZXQ6IGRlc2NyaXB0b3IuZ2V0LCBzZXQ6IGRlc2NyaXB0b3Iuc2V0IH0gOiBkZXNjcmlwdG9yW2tleV0sIGNvbnRleHQpO1xyXG4gICAgICAgIGlmIChraW5kID09PSBcImFjY2Vzc29yXCIpIHtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gdm9pZCAwKSBjb250aW51ZTtcclxuICAgICAgICAgICAgaWYgKHJlc3VsdCA9PT0gbnVsbCB8fCB0eXBlb2YgcmVzdWx0ICE9PSBcIm9iamVjdFwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0IGV4cGVjdGVkXCIpO1xyXG4gICAgICAgICAgICBpZiAoXyA9IGFjY2VwdChyZXN1bHQuZ2V0KSkgZGVzY3JpcHRvci5nZXQgPSBfO1xyXG4gICAgICAgICAgICBpZiAoXyA9IGFjY2VwdChyZXN1bHQuc2V0KSkgZGVzY3JpcHRvci5zZXQgPSBfO1xyXG4gICAgICAgICAgICBpZiAoXyA9IGFjY2VwdChyZXN1bHQuaW5pdCkpIGluaXRpYWxpemVycy51bnNoaWZ0KF8pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChfID0gYWNjZXB0KHJlc3VsdCkpIHtcclxuICAgICAgICAgICAgaWYgKGtpbmQgPT09IFwiZmllbGRcIikgaW5pdGlhbGl6ZXJzLnVuc2hpZnQoXyk7XHJcbiAgICAgICAgICAgIGVsc2UgZGVzY3JpcHRvcltrZXldID0gXztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAodGFyZ2V0KSBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBjb250ZXh0SW4ubmFtZSwgZGVzY3JpcHRvcik7XHJcbiAgICBkb25lID0gdHJ1ZTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3J1bkluaXRpYWxpemVycyh0aGlzQXJnLCBpbml0aWFsaXplcnMsIHZhbHVlKSB7XHJcbiAgICB2YXIgdXNlVmFsdWUgPSBhcmd1bWVudHMubGVuZ3RoID4gMjtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5pdGlhbGl6ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFsdWUgPSB1c2VWYWx1ZSA/IGluaXRpYWxpemVyc1tpXS5jYWxsKHRoaXNBcmcsIHZhbHVlKSA6IGluaXRpYWxpemVyc1tpXS5jYWxsKHRoaXNBcmcpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHVzZVZhbHVlID8gdmFsdWUgOiB2b2lkIDA7XHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19wcm9wS2V5KHgpIHtcclxuICAgIHJldHVybiB0eXBlb2YgeCA9PT0gXCJzeW1ib2xcIiA/IHggOiBcIlwiLmNvbmNhdCh4KTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NldEZ1bmN0aW9uTmFtZShmLCBuYW1lLCBwcmVmaXgpIHtcclxuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gXCJzeW1ib2xcIikgbmFtZSA9IG5hbWUuZGVzY3JpcHRpb24gPyBcIltcIi5jb25jYXQobmFtZS5kZXNjcmlwdGlvbiwgXCJdXCIpIDogXCJcIjtcclxuICAgIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoZiwgXCJuYW1lXCIsIHsgY29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogcHJlZml4ID8gXCJcIi5jb25jYXQocHJlZml4LCBcIiBcIiwgbmFtZSkgOiBuYW1lIH0pO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fbWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpIHtcclxuICAgIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgUmVmbGVjdC5tZXRhZGF0YSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gUmVmbGVjdC5tZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2F3YWl0ZXIodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XHJcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cclxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cclxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxyXG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19nZW5lcmF0b3IodGhpc0FyZywgYm9keSkge1xyXG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZyA9IE9iamVjdC5jcmVhdGUoKHR5cGVvZiBJdGVyYXRvciA9PT0gXCJmdW5jdGlvblwiID8gSXRlcmF0b3IgOiBPYmplY3QpLnByb3RvdHlwZSk7XHJcbiAgICByZXR1cm4gZy5uZXh0ID0gdmVyYigwKSwgZ1tcInRocm93XCJdID0gdmVyYigxKSwgZ1tcInJldHVyblwiXSA9IHZlcmIoMiksIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcclxuICAgICAgICB3aGlsZSAoZyAmJiAoZyA9IDAsIG9wWzBdICYmIChfID0gMCkpLCBfKSB0cnkge1xyXG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XHJcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcclxuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XHJcbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19jcmVhdGVCaW5kaW5nID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcclxuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XHJcbiAgICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcclxuICAgIH1cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgZGVzYyk7XHJcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgb1trMl0gPSBtW2tdO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgbykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBwKSkgX19jcmVhdGVCaW5kaW5nKG8sIG0sIHApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xyXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcclxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3JlYWQobywgbikge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xyXG4gICAgaWYgKCFtKSByZXR1cm4gbztcclxuICAgIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXlzKCkge1xyXG4gICAgZm9yICh2YXIgcyA9IDAsIGkgPSAwLCBpbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpbDsgaSsrKSBzICs9IGFyZ3VtZW50c1tpXS5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciByID0gQXJyYXkocyksIGsgPSAwLCBpID0gMDsgaSA8IGlsOyBpKyspXHJcbiAgICAgICAgZm9yICh2YXIgYSA9IGFyZ3VtZW50c1tpXSwgaiA9IDAsIGpsID0gYS5sZW5ndGg7IGogPCBqbDsgaisrLCBrKyspXHJcbiAgICAgICAgICAgIHJba10gPSBhW2pdO1xyXG4gICAgcmV0dXJuIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5KHRvLCBmcm9tLCBwYWNrKSB7XHJcbiAgICBpZiAocGFjayB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAyKSBmb3IgKHZhciBpID0gMCwgbCA9IGZyb20ubGVuZ3RoLCBhcjsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIGlmIChhciB8fCAhKGkgaW4gZnJvbSkpIHtcclxuICAgICAgICAgICAgaWYgKCFhcikgYXIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tLCAwLCBpKTtcclxuICAgICAgICAgICAgYXJbaV0gPSBmcm9tW2ldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0by5jb25jYXQoYXIgfHwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdCh2KSB7XHJcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIF9fYXdhaXQgPyAodGhpcy52ID0gdiwgdGhpcykgOiBuZXcgX19hd2FpdCh2KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNHZW5lcmF0b3IodGhpc0FyZywgX2FyZ3VtZW50cywgZ2VuZXJhdG9yKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIGcgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSksIGksIHEgPSBbXTtcclxuICAgIHJldHVybiBpID0gT2JqZWN0LmNyZWF0ZSgodHlwZW9mIEFzeW5jSXRlcmF0b3IgPT09IFwiZnVuY3Rpb25cIiA/IEFzeW5jSXRlcmF0b3IgOiBPYmplY3QpLnByb3RvdHlwZSksIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiwgYXdhaXRSZXR1cm4pLCBpW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0sIGk7XHJcbiAgICBmdW5jdGlvbiBhd2FpdFJldHVybihmKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHYpLnRoZW4oZiwgcmVqZWN0KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gdmVyYihuLCBmKSB7IGlmIChnW25dKSB7IGlbbl0gPSBmdW5jdGlvbiAodikgeyByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKGEsIGIpIHsgcS5wdXNoKFtuLCB2LCBhLCBiXSkgPiAxIHx8IHJlc3VtZShuLCB2KTsgfSk7IH07IGlmIChmKSBpW25dID0gZihpW25dKTsgfSB9XHJcbiAgICBmdW5jdGlvbiByZXN1bWUobiwgdikgeyB0cnkgeyBzdGVwKGdbbl0odikpOyB9IGNhdGNoIChlKSB7IHNldHRsZShxWzBdWzNdLCBlKTsgfSB9XHJcbiAgICBmdW5jdGlvbiBzdGVwKHIpIHsgci52YWx1ZSBpbnN0YW5jZW9mIF9fYXdhaXQgPyBQcm9taXNlLnJlc29sdmUoci52YWx1ZS52KS50aGVuKGZ1bGZpbGwsIHJlamVjdCkgOiBzZXR0bGUocVswXVsyXSwgcik7IH1cclxuICAgIGZ1bmN0aW9uIGZ1bGZpbGwodmFsdWUpIHsgcmVzdW1lKFwibmV4dFwiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHJlamVjdCh2YWx1ZSkgeyByZXN1bWUoXCJ0aHJvd1wiLCB2YWx1ZSk7IH1cclxuICAgIGZ1bmN0aW9uIHNldHRsZShmLCB2KSB7IGlmIChmKHYpLCBxLnNoaWZ0KCksIHEubGVuZ3RoKSByZXN1bWUocVswXVswXSwgcVswXVsxXSk7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNEZWxlZ2F0b3Iobykge1xyXG4gICAgdmFyIGksIHA7XHJcbiAgICByZXR1cm4gaSA9IHt9LCB2ZXJiKFwibmV4dFwiKSwgdmVyYihcInRocm93XCIsIGZ1bmN0aW9uIChlKSB7IHRocm93IGU7IH0pLCB2ZXJiKFwicmV0dXJuXCIpLCBpW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzOyB9LCBpO1xyXG4gICAgZnVuY3Rpb24gdmVyYihuLCBmKSB7IGlbbl0gPSBvW25dID8gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIChwID0gIXApID8geyB2YWx1ZTogX19hd2FpdChvW25dKHYpKSwgZG9uZTogZmFsc2UgfSA6IGYgPyBmKHYpIDogdjsgfSA6IGY7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNWYWx1ZXMobykge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBtID0gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0sIGk7XHJcbiAgICByZXR1cm4gbSA/IG0uY2FsbChvKSA6IChvID0gdHlwZW9mIF9fdmFsdWVzID09PSBcImZ1bmN0aW9uXCIgPyBfX3ZhbHVlcyhvKSA6IG9bU3ltYm9sLml0ZXJhdG9yXSgpLCBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaSk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaVtuXSA9IG9bbl0gJiYgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgdiA9IG9bbl0odiksIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHYuZG9uZSwgdi52YWx1ZSk7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCBkLCB2KSB7IFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGZ1bmN0aW9uKHYpIHsgcmVzb2x2ZSh7IHZhbHVlOiB2LCBkb25lOiBkIH0pOyB9LCByZWplY3QpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ha2VUZW1wbGF0ZU9iamVjdChjb29rZWQsIHJhdykge1xyXG4gICAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29va2VkLCBcInJhd1wiLCB7IHZhbHVlOiByYXcgfSk7IH0gZWxzZSB7IGNvb2tlZC5yYXcgPSByYXc7IH1cclxuICAgIHJldHVybiBjb29rZWQ7XHJcbn07XHJcblxyXG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XHJcbn0pIDogZnVuY3Rpb24obywgdikge1xyXG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0U3Rhcihtb2QpIHtcclxuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoayAhPT0gXCJkZWZhdWx0XCIgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwgayk7XHJcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0RGVmYXVsdChtb2QpIHtcclxuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgZGVmYXVsdDogbW9kIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHJlY2VpdmVyLCBzdGF0ZSwga2luZCwgZikge1xyXG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgZ2V0dGVyXCIpO1xyXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgIT09IHN0YXRlIHx8ICFmIDogIXN0YXRlLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgcmVhZCBwcml2YXRlIG1lbWJlciBmcm9tIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4ga2luZCA9PT0gXCJtXCIgPyBmIDoga2luZCA9PT0gXCJhXCIgPyBmLmNhbGwocmVjZWl2ZXIpIDogZiA/IGYudmFsdWUgOiBzdGF0ZS5nZXQocmVjZWl2ZXIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZFNldChyZWNlaXZlciwgc3RhdGUsIHZhbHVlLCBraW5kLCBmKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJtXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIG1ldGhvZCBpcyBub3Qgd3JpdGFibGVcIik7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBzZXR0ZXJcIik7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB3cml0ZSBwcml2YXRlIG1lbWJlciB0byBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xyXG4gICAgcmV0dXJuIChraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlciwgdmFsdWUpIDogZiA/IGYudmFsdWUgPSB2YWx1ZSA6IHN0YXRlLnNldChyZWNlaXZlciwgdmFsdWUpKSwgdmFsdWU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkSW4oc3RhdGUsIHJlY2VpdmVyKSB7XHJcbiAgICBpZiAocmVjZWl2ZXIgPT09IG51bGwgfHwgKHR5cGVvZiByZWNlaXZlciAhPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcmVjZWl2ZXIgIT09IFwiZnVuY3Rpb25cIikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgdXNlICdpbicgb3BlcmF0b3Igb24gbm9uLW9iamVjdFwiKTtcclxuICAgIHJldHVybiB0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyID09PSBzdGF0ZSA6IHN0YXRlLmhhcyhyZWNlaXZlcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FkZERpc3Bvc2FibGVSZXNvdXJjZShlbnYsIHZhbHVlLCBhc3luYykge1xyXG4gICAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB2b2lkIDApIHtcclxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0IGV4cGVjdGVkLlwiKTtcclxuICAgICAgICB2YXIgZGlzcG9zZSwgaW5uZXI7XHJcbiAgICAgICAgaWYgKGFzeW5jKSB7XHJcbiAgICAgICAgICAgIGlmICghU3ltYm9sLmFzeW5jRGlzcG9zZSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0Rpc3Bvc2UgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgICAgICAgICBkaXNwb3NlID0gdmFsdWVbU3ltYm9sLmFzeW5jRGlzcG9zZV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkaXNwb3NlID09PSB2b2lkIDApIHtcclxuICAgICAgICAgICAgaWYgKCFTeW1ib2wuZGlzcG9zZSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5kaXNwb3NlIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgICAgICAgICAgZGlzcG9zZSA9IHZhbHVlW1N5bWJvbC5kaXNwb3NlXTtcclxuICAgICAgICAgICAgaWYgKGFzeW5jKSBpbm5lciA9IGRpc3Bvc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgZGlzcG9zZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiT2JqZWN0IG5vdCBkaXNwb3NhYmxlLlwiKTtcclxuICAgICAgICBpZiAoaW5uZXIpIGRpc3Bvc2UgPSBmdW5jdGlvbigpIHsgdHJ5IHsgaW5uZXIuY2FsbCh0aGlzKTsgfSBjYXRjaCAoZSkgeyByZXR1cm4gUHJvbWlzZS5yZWplY3QoZSk7IH0gfTtcclxuICAgICAgICBlbnYuc3RhY2sucHVzaCh7IHZhbHVlOiB2YWx1ZSwgZGlzcG9zZTogZGlzcG9zZSwgYXN5bmM6IGFzeW5jIH0pO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoYXN5bmMpIHtcclxuICAgICAgICBlbnYuc3RhY2sucHVzaCh7IGFzeW5jOiB0cnVlIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG5cclxufVxyXG5cclxudmFyIF9TdXBwcmVzc2VkRXJyb3IgPSB0eXBlb2YgU3VwcHJlc3NlZEVycm9yID09PSBcImZ1bmN0aW9uXCIgPyBTdXBwcmVzc2VkRXJyb3IgOiBmdW5jdGlvbiAoZXJyb3IsIHN1cHByZXNzZWQsIG1lc3NhZ2UpIHtcclxuICAgIHZhciBlID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgcmV0dXJuIGUubmFtZSA9IFwiU3VwcHJlc3NlZEVycm9yXCIsIGUuZXJyb3IgPSBlcnJvciwgZS5zdXBwcmVzc2VkID0gc3VwcHJlc3NlZCwgZTtcclxufTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2Rpc3Bvc2VSZXNvdXJjZXMoZW52KSB7XHJcbiAgICBmdW5jdGlvbiBmYWlsKGUpIHtcclxuICAgICAgICBlbnYuZXJyb3IgPSBlbnYuaGFzRXJyb3IgPyBuZXcgX1N1cHByZXNzZWRFcnJvcihlLCBlbnYuZXJyb3IsIFwiQW4gZXJyb3Igd2FzIHN1cHByZXNzZWQgZHVyaW5nIGRpc3Bvc2FsLlwiKSA6IGU7XHJcbiAgICAgICAgZW52Lmhhc0Vycm9yID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIHZhciByLCBzID0gMDtcclxuICAgIGZ1bmN0aW9uIG5leHQoKSB7XHJcbiAgICAgICAgd2hpbGUgKHIgPSBlbnYuc3RhY2sucG9wKCkpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGlmICghci5hc3luYyAmJiBzID09PSAxKSByZXR1cm4gcyA9IDAsIGVudi5zdGFjay5wdXNoKHIpLCBQcm9taXNlLnJlc29sdmUoKS50aGVuKG5leHQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHIuZGlzcG9zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSByLmRpc3Bvc2UuY2FsbChyLnZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoci5hc3luYykgcmV0dXJuIHMgfD0gMiwgUHJvbWlzZS5yZXNvbHZlKHJlc3VsdCkudGhlbihuZXh0LCBmdW5jdGlvbihlKSB7IGZhaWwoZSk7IHJldHVybiBuZXh0KCk7IH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBzIHw9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGZhaWwoZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHMgPT09IDEpIHJldHVybiBlbnYuaGFzRXJyb3IgPyBQcm9taXNlLnJlamVjdChlbnYuZXJyb3IpIDogUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgaWYgKGVudi5oYXNFcnJvcikgdGhyb3cgZW52LmVycm9yO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5leHQoKTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gICAgX19leHRlbmRzOiBfX2V4dGVuZHMsXHJcbiAgICBfX2Fzc2lnbjogX19hc3NpZ24sXHJcbiAgICBfX3Jlc3Q6IF9fcmVzdCxcclxuICAgIF9fZGVjb3JhdGU6IF9fZGVjb3JhdGUsXHJcbiAgICBfX3BhcmFtOiBfX3BhcmFtLFxyXG4gICAgX19tZXRhZGF0YTogX19tZXRhZGF0YSxcclxuICAgIF9fYXdhaXRlcjogX19hd2FpdGVyLFxyXG4gICAgX19nZW5lcmF0b3I6IF9fZ2VuZXJhdG9yLFxyXG4gICAgX19jcmVhdGVCaW5kaW5nOiBfX2NyZWF0ZUJpbmRpbmcsXHJcbiAgICBfX2V4cG9ydFN0YXI6IF9fZXhwb3J0U3RhcixcclxuICAgIF9fdmFsdWVzOiBfX3ZhbHVlcyxcclxuICAgIF9fcmVhZDogX19yZWFkLFxyXG4gICAgX19zcHJlYWQ6IF9fc3ByZWFkLFxyXG4gICAgX19zcHJlYWRBcnJheXM6IF9fc3ByZWFkQXJyYXlzLFxyXG4gICAgX19zcHJlYWRBcnJheTogX19zcHJlYWRBcnJheSxcclxuICAgIF9fYXdhaXQ6IF9fYXdhaXQsXHJcbiAgICBfX2FzeW5jR2VuZXJhdG9yOiBfX2FzeW5jR2VuZXJhdG9yLFxyXG4gICAgX19hc3luY0RlbGVnYXRvcjogX19hc3luY0RlbGVnYXRvcixcclxuICAgIF9fYXN5bmNWYWx1ZXM6IF9fYXN5bmNWYWx1ZXMsXHJcbiAgICBfX21ha2VUZW1wbGF0ZU9iamVjdDogX19tYWtlVGVtcGxhdGVPYmplY3QsXHJcbiAgICBfX2ltcG9ydFN0YXI6IF9faW1wb3J0U3RhcixcclxuICAgIF9faW1wb3J0RGVmYXVsdDogX19pbXBvcnREZWZhdWx0LFxyXG4gICAgX19jbGFzc1ByaXZhdGVGaWVsZEdldDogX19jbGFzc1ByaXZhdGVGaWVsZEdldCxcclxuICAgIF9fY2xhc3NQcml2YXRlRmllbGRTZXQ6IF9fY2xhc3NQcml2YXRlRmllbGRTZXQsXHJcbiAgICBfX2NsYXNzUHJpdmF0ZUZpZWxkSW46IF9fY2xhc3NQcml2YXRlRmllbGRJbixcclxuICAgIF9fYWRkRGlzcG9zYWJsZVJlc291cmNlOiBfX2FkZERpc3Bvc2FibGVSZXNvdXJjZSxcclxuICAgIF9fZGlzcG9zZVJlc291cmNlczogX19kaXNwb3NlUmVzb3VyY2VzLFxyXG59O1xyXG4iLCI8c2NyaXB0IGxhbmc9XCJ0c1wiPlxuICAgZXhwb3J0IGxldCBjb2xvcjogc3RyaW5nID0gXCJibGFja1wiIDsgXG48L3NjcmlwdD5cbiAgPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT17Y29sb3J9IHN0cm9rZS13aWR0aD1cIjJcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIiBjbGFzcz1cInN2Zy1pY29uIGx1Y2lkZS1wbHVzLWNpcmNsZVwiPlxuICAgICAgICA8Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjEwXCI+XG4gICAgICAgIDwvY2lyY2xlPlxuICAgICAgICA8bGluZSB4MT1cIjEyXCIgeTE9XCI4XCIgeDI9XCIxMlwiIHkyPVwiMTZcIj5cbiAgICAgICAgPC9saW5lPlxuICAgICAgICA8bGluZSB4MT1cIjhcIiB5MT1cIjEyXCIgeDI9XCIxNlwiIHkyPVwiMTJcIj5cbiAgICAgICAgPC9saW5lPlxuICAgIDwvc3ZnPiIsIjxzY3JpcHQgbGFuZz1cInRzXCI+XG5cblxuXHRpbXBvcnQgSW1hZ2VfcGx1cyBmcm9tIFwiLi4vYnV0dG9ucy9wbHVzLnN2ZWx0ZVwiOyBcbiAgICBpbXBvcnQgeyAgIHNsaWRlIH0gZnJvbSBcInN2ZWx0ZS90cmFuc2l0aW9uXCI7XG4gICAgaW1wb3J0IHsgY3JlYXRlRXZlbnREaXNwYXRjaGVyLCBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiOyAgXG4gXG5cblx0ZXhwb3J0IGxldCBpc0VkaXRhYmxlQ29udGFpbmVyOmJvb2xlYW4gPSB0cnVlO1xuICAgIGV4cG9ydCBsZXQgY29sbGVjdGlvbjogc3RyaW5nW10gfCB7a2V5OnN0cmluZywgdmFsdWU6c3RyaW5nLCBpc1NlbGVjdGVkPzpib29sZWFuIH1bXTsgXG5cdCQ6IF9jb2xsZWN0aW9uID0gY29sbGVjdGlvbi5tYXAoIHAgPT4geyBcblx0XHRpZiAoIHAua2V5ICYmIHAudmFsdWUgKXtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGtleVx0XHRcdDpwLmtleSxcblx0XHRcdFx0bmFtZVx0XHQ6cC52YWx1ZSxcblx0XHRcdFx0aXNTZWxlY3RlZFx0OnAuaXNTZWxlY3RlZCA/PyBmYWxzZSxcblx0XHRcdFx0bmFtZUVkaXRcdDpwLnZhbHVlLFxuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNle1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0a2V5XHRcdFx0OnAgYXMgc3RyaW5nLFxuXHRcdFx0XHRuYW1lXHRcdDpwIGFzIHN0cmluZyxcblx0XHRcdFx0aXNTZWxlY3RlZFx0OmZhbHNlLFxuXHRcdFx0XHRuYW1lRWRpdFx0OnAgYXMgc3RyaW5nLFxuXHRcdFx0fVxuXHRcdH1cblx0fSlcblxuXHRleHBvcnQgbGV0IG9uU2VsZWN0XHRcdDogKCBkOiBhbnkgKSA9PiBib29sZWFuO1xuXHRleHBvcnQgbGV0IG9uQWRkXHRcdDogKCgpID0+IGFueSkgfCBudWxsID0gbnVsbDsgXG5cdGNvbnN0IGRpc3BhdGNoID0gY3JlYXRlRXZlbnREaXNwYXRjaGVyKCk7XG5cblx0aW50ZXJmYWNlIElWaWV3RWxlbWVudHtcblx0XHRrZXk6c3RyaW5nO1xuXHRcdG5hbWU6c3RyaW5nO1xuXHRcdGlzU2VsZWN0ZWQ6Ym9vbGVhbjtcblx0XHRuYW1lRWRpdDpzdHJpbmc7IFxuXHR9XG5cblx0bGV0IHNlbGVjdGVkIDogSVZpZXdFbGVtZW50IHwgbnVsbCA9IG51bGw7XG5cdFxuXHRleHBvcnQgZnVuY3Rpb24gZGVzZWxlY3QoKXtcblx0XHRpZighc2VsZWN0ZWQpXG5cdFx0XHRyZXR1cm47XG4gXG5cdFx0bGV0IGkgPSBfY29sbGVjdGlvbi5maW5kSW5kZXgoIHAgPT4gcC5pc1NlbGVjdGVkICk7IFxuXHRcdGlmKCBpICE9IC0xIClcblx0XHRcdF9jb2xsZWN0aW9uW2ldLmlzU2VsZWN0ZWQgPSBmYWxzZTtcblxuXHRcdHNlbGVjdGVkID0gbnVsbDtcblx0XHRkaXNwYXRjaCgnb25EZVNlbGVjdCcpXG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gc2VsZWN0KCBrZXkgOiBzdHJpbmcgKXtcblx0XHRsZXQgaXRlbSA9IF9jb2xsZWN0aW9uLmZpbmQoIHAgPT4gcC5rZXkgPT0ga2V5ICk7XG5cdFx0aWYgKCBpdGVtICl7XG5cdFx0XHRfb25TZWxlY3QoIGl0ZW0gKTtcblx0XHR9XG5cdH1cblx0IFxuXHRmdW5jdGlvbiBfb25TZWxlY3QoaXRlbSA6IElWaWV3RWxlbWVudCl7IFxuXG5cdFx0Ly8gZ2V0IGxhc3Qgc2VsZWN0ZWQgXG5cdFx0bGV0IGkgPSBfY29sbGVjdGlvbi5maW5kSW5kZXgoIHAgPT4gcC5pc1NlbGVjdGVkICk7IFxuXHRcblx0XHQvLyBlbnN1cmUgdGhhdCBhIENsaWNrIG9uIHRoZSBzYW1lIGl0ZW0gaXMgYSBkZXNlbGVjdFxuXHRcdGlmICggaSAhPSAtMSAmJiBfY29sbGVjdGlvbltpXS5rZXkgPT0gaXRlbS5rZXkgKXtcblx0XHRcdF9jb2xsZWN0aW9uW2ldLmlzU2VsZWN0ZWQgPSBmYWxzZTsgXG5cdFx0XHRzZWxlY3RlZCA9IG51bGw7XG5cdFx0XHRkaXNwYXRjaCgnb25EZVNlbGVjdCcpXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gZGVzZWxlY3Rcblx0XHRpZiAoIGkgIT0gLTEgKVxuXHRcdFx0X2NvbGxlY3Rpb25baV0uaXNTZWxlY3RlZCA9IGZhbHNlO1xuXG5cdFx0aSA9IF9jb2xsZWN0aW9uLmZpbmRJbmRleCggcCA9PiBwLmtleSA9PSBpdGVtLmtleSApOyAgXG5cdFx0Y29uc3QgaXNTZWxlY3RlZCA9IG9uU2VsZWN0KF9jb2xsZWN0aW9uW2ldLmtleSk7IFxuXHRcdGlmIChpc1NlbGVjdGVkKXtcblx0XHRcdHNlbGVjdGVkID0gX2NvbGxlY3Rpb25baV07XG5cdFx0fSBlbHNle1xuXHRcdFx0c2VsZWN0ZWQgPSBudWxsO1xuXHRcdH1cbiBcblx0XHRfY29sbGVjdGlvbltpXS5pc1NlbGVjdGVkID0gaXNTZWxlY3RlZDtcblx0fVxuXG5cdGZ1bmN0aW9uIF9vbkFkZCgpe1xuXHRcdGlmKCFvbkFkZClcblx0XHRcdHJldHVybjtcdFxuIFxuXHRcdGRlc2VsZWN0KCk7XG5cdFx0b25BZGQoKTtcblx0fVxuXG48L3NjcmlwdD5cblxuXG4gICAgPGRpdiBjbGFzcz17IGlzRWRpdGFibGVDb250YWluZXIgPyBcIkdyb2JzSW50ZXJhY3RpdmVDb250YWluZXIgZWRpdGFibGVUYWJsZVwiIDogXCJlZGl0YWJsZVRhYmxlXCJ9ID5cblx0XHRcdHsjZWFjaCBfY29sbGVjdGlvbiBhcyBlICggZS5rZXkgKSB9XG5cdFx0XHRcdDxkaXZcblx0XHRcdFx0XHRjbGFzcz1cIkVkaXRhYmxlX3Jvd1wiIFxuXHRcdFx0XHRcdGRhdGEtc2VsZWN0ZWQ9eyBlLmlzU2VsZWN0ZWQgfVxuXHRcdFx0XHRcdHRyYW5zaXRpb246c2xpZGUgXG5cdFx0XHRcdFx0ZGF0YS1jYW4taG92ZXI9e3RydWV9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHQ8ZGl2XG5cdFx0XHRcdFx0XHR0YWJpbmRleD1cIi0xXCJcblx0XHRcdFx0XHRcdGNsYXNzPVwiRWRpdGFibGVfY29sdW1uXCJcblx0XHRcdFx0XHRcdGNvbnRlbnRlZGl0YWJsZT1cImZhbHNlXCJcblx0XHRcdFx0XHRcdGJpbmQ6dGV4dENvbnRlbnQ9e2UubmFtZX0gXG5cdFx0XHRcdFx0XHRvbjpjbGljaz17ICgpID0+IF9vblNlbGVjdChlKSB9XG5cdFx0XHRcdFx0XHRvbjprZXl1cFxuXHRcdFx0XHRcdD4gXG5cdFx0XHRcdFx0XHR7ZS5uYW1lfVxuXHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdHsvZWFjaH1cblx0XHRcdHsjaWYgb25BZGQgIT0gbnVsbCB9XG5cdFx0XHRcdDxkaXZcblx0XHRcdFx0XHRjbGFzcz1cIkVkaXRhYmxlX3JvdyBFZGl0YWJsZV9yb3dQbHVzQnV0dG9uXCJcblx0XHRcdFx0XHRkYXRhLXNlbGVjdGVkPXsgZmFsc2UgfVxuXHRcdFx0XHRcdHRyYW5zaXRpb246c2xpZGVcblx0XHRcdFx0XHRkYXRhLWNhbi1ob3Zlcj17dHJ1ZX1cblx0XHRcdFx0XHRzdHlsZT1cImRpc3BsYXk6ZmxleDtqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcIlxuXHRcdFx0XHRcdG9uOmNsaWNrPXsgKCkgPT4gX29uQWRkKCkgfVxuXHRcdFx0XHRcdG9uOmtleXVwPXsgKCkgPT4gX29uQWRkKCkgfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0PGRpdiBcblx0XHRcdFx0XHRcdHRhYmluZGV4PVwiLTFcIlxuXHRcdFx0XHRcdFx0Y2xhc3M9XCJFZGl0YWJsZV9JY29uXCJcblx0XHRcdFx0XHRcdGNvbnRlbnRlZGl0YWJsZT1cImZhbHNlXCIgXG5cdFx0XHRcdFx0PiAgXG5cdFx0XHRcdFx0XHQ8SW1hZ2VfcGx1cyBjb2xvcj17JyNmZmYnfS8+XG5cdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdDwvZGl2Plx0XG5cdFx0XHR7L2lmfVxuXHQ8L2Rpdj5cblxuICIsImltcG9ydCB7IG5vb3AsIHNhZmVfbm90X2VxdWFsLCBzdWJzY3JpYmUsIHJ1bl9hbGwsIGlzX2Z1bmN0aW9uIH0gZnJvbSAnLi4vaW50ZXJuYWwvaW5kZXgubWpzJztcbmV4cG9ydCB7IGdldF9zdG9yZV92YWx1ZSBhcyBnZXQgfSBmcm9tICcuLi9pbnRlcm5hbC9pbmRleC5tanMnO1xuXG5jb25zdCBzdWJzY3JpYmVyX3F1ZXVlID0gW107XG4vKipcbiAqIENyZWF0ZXMgYSBgUmVhZGFibGVgIHN0b3JlIHRoYXQgYWxsb3dzIHJlYWRpbmcgYnkgc3Vic2NyaXB0aW9uLlxuICogQHBhcmFtIHZhbHVlIGluaXRpYWwgdmFsdWVcbiAqIEBwYXJhbSB7U3RhcnRTdG9wTm90aWZpZXJ9IFtzdGFydF1cbiAqL1xuZnVuY3Rpb24gcmVhZGFibGUodmFsdWUsIHN0YXJ0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3Vic2NyaWJlOiB3cml0YWJsZSh2YWx1ZSwgc3RhcnQpLnN1YnNjcmliZVxuICAgIH07XG59XG4vKipcbiAqIENyZWF0ZSBhIGBXcml0YWJsZWAgc3RvcmUgdGhhdCBhbGxvd3MgYm90aCB1cGRhdGluZyBhbmQgcmVhZGluZyBieSBzdWJzY3JpcHRpb24uXG4gKiBAcGFyYW0geyo9fXZhbHVlIGluaXRpYWwgdmFsdWVcbiAqIEBwYXJhbSB7U3RhcnRTdG9wTm90aWZpZXI9fSBzdGFydFxuICovXG5mdW5jdGlvbiB3cml0YWJsZSh2YWx1ZSwgc3RhcnQgPSBub29wKSB7XG4gICAgbGV0IHN0b3A7XG4gICAgY29uc3Qgc3Vic2NyaWJlcnMgPSBuZXcgU2V0KCk7XG4gICAgZnVuY3Rpb24gc2V0KG5ld192YWx1ZSkge1xuICAgICAgICBpZiAoc2FmZV9ub3RfZXF1YWwodmFsdWUsIG5ld192YWx1ZSkpIHtcbiAgICAgICAgICAgIHZhbHVlID0gbmV3X3ZhbHVlO1xuICAgICAgICAgICAgaWYgKHN0b3ApIHsgLy8gc3RvcmUgaXMgcmVhZHlcbiAgICAgICAgICAgICAgICBjb25zdCBydW5fcXVldWUgPSAhc3Vic2NyaWJlcl9xdWV1ZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdWJzY3JpYmVyIG9mIHN1YnNjcmliZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXJbMV0oKTtcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlcl9xdWV1ZS5wdXNoKHN1YnNjcmliZXIsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJ1bl9xdWV1ZSkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN1YnNjcmliZXJfcXVldWUubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXJfcXVldWVbaV1bMF0oc3Vic2NyaWJlcl9xdWV1ZVtpICsgMV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXJfcXVldWUubGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gdXBkYXRlKGZuKSB7XG4gICAgICAgIHNldChmbih2YWx1ZSkpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzdWJzY3JpYmUocnVuLCBpbnZhbGlkYXRlID0gbm9vcCkge1xuICAgICAgICBjb25zdCBzdWJzY3JpYmVyID0gW3J1biwgaW52YWxpZGF0ZV07XG4gICAgICAgIHN1YnNjcmliZXJzLmFkZChzdWJzY3JpYmVyKTtcbiAgICAgICAgaWYgKHN1YnNjcmliZXJzLnNpemUgPT09IDEpIHtcbiAgICAgICAgICAgIHN0b3AgPSBzdGFydChzZXQpIHx8IG5vb3A7XG4gICAgICAgIH1cbiAgICAgICAgcnVuKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHN1YnNjcmliZXJzLmRlbGV0ZShzdWJzY3JpYmVyKTtcbiAgICAgICAgICAgIGlmIChzdWJzY3JpYmVycy5zaXplID09PSAwICYmIHN0b3ApIHtcbiAgICAgICAgICAgICAgICBzdG9wKCk7XG4gICAgICAgICAgICAgICAgc3RvcCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB7IHNldCwgdXBkYXRlLCBzdWJzY3JpYmUgfTtcbn1cbmZ1bmN0aW9uIGRlcml2ZWQoc3RvcmVzLCBmbiwgaW5pdGlhbF92YWx1ZSkge1xuICAgIGNvbnN0IHNpbmdsZSA9ICFBcnJheS5pc0FycmF5KHN0b3Jlcyk7XG4gICAgY29uc3Qgc3RvcmVzX2FycmF5ID0gc2luZ2xlXG4gICAgICAgID8gW3N0b3Jlc11cbiAgICAgICAgOiBzdG9yZXM7XG4gICAgY29uc3QgYXV0byA9IGZuLmxlbmd0aCA8IDI7XG4gICAgcmV0dXJuIHJlYWRhYmxlKGluaXRpYWxfdmFsdWUsIChzZXQpID0+IHtcbiAgICAgICAgbGV0IHN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgdmFsdWVzID0gW107XG4gICAgICAgIGxldCBwZW5kaW5nID0gMDtcbiAgICAgICAgbGV0IGNsZWFudXAgPSBub29wO1xuICAgICAgICBjb25zdCBzeW5jID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHBlbmRpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBmbihzaW5nbGUgPyB2YWx1ZXNbMF0gOiB2YWx1ZXMsIHNldCk7XG4gICAgICAgICAgICBpZiAoYXV0bykge1xuICAgICAgICAgICAgICAgIHNldChyZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY2xlYW51cCA9IGlzX2Z1bmN0aW9uKHJlc3VsdCkgPyByZXN1bHQgOiBub29wO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB1bnN1YnNjcmliZXJzID0gc3RvcmVzX2FycmF5Lm1hcCgoc3RvcmUsIGkpID0+IHN1YnNjcmliZShzdG9yZSwgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB2YWx1ZXNbaV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIHBlbmRpbmcgJj0gfigxIDw8IGkpO1xuICAgICAgICAgICAgaWYgKHN0YXJ0ZWQpIHtcbiAgICAgICAgICAgICAgICBzeW5jKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgIHBlbmRpbmcgfD0gKDEgPDwgaSk7XG4gICAgICAgIH0pKTtcbiAgICAgICAgc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIHN5bmMoKTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICAgICAgICBydW5fYWxsKHVuc3Vic2NyaWJlcnMpO1xuICAgICAgICAgICAgY2xlYW51cCgpO1xuICAgICAgICAgICAgLy8gV2UgbmVlZCB0byBzZXQgdGhpcyB0byBmYWxzZSBiZWNhdXNlIGNhbGxiYWNrcyBjYW4gc3RpbGwgaGFwcGVuIGRlc3BpdGUgaGF2aW5nIHVuc3Vic2NyaWJlZDpcbiAgICAgICAgICAgIC8vIENhbGxiYWNrcyBtaWdodCBhbHJlYWR5IGJlIHBsYWNlZCBpbiB0aGUgcXVldWUgd2hpY2ggZG9lc24ndCBrbm93IGl0IHNob3VsZCBubyBsb25nZXJcbiAgICAgICAgICAgIC8vIGludm9rZSB0aGlzIGRlcml2ZWQgc3RvcmUuXG4gICAgICAgICAgICBzdGFydGVkID0gZmFsc2U7XG4gICAgICAgIH07XG4gICAgfSk7XG59XG4vKipcbiAqIFRha2VzIGEgc3RvcmUgYW5kIHJldHVybnMgYSBuZXcgb25lIGRlcml2ZWQgZnJvbSB0aGUgb2xkIG9uZSB0aGF0IGlzIHJlYWRhYmxlLlxuICpcbiAqIEBwYXJhbSBzdG9yZSAtIHN0b3JlIHRvIG1ha2UgcmVhZG9ubHlcbiAqL1xuZnVuY3Rpb24gcmVhZG9ubHkoc3RvcmUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzdWJzY3JpYmU6IHN0b3JlLnN1YnNjcmliZS5iaW5kKHN0b3JlKVxuICAgIH07XG59XG5cbmV4cG9ydCB7IGRlcml2ZWQsIHJlYWRhYmxlLCByZWFkb25seSwgd3JpdGFibGUgfTtcbiIsImltcG9ydCB7IElBUEkgfSBmcm9tIFwic3JjL01vZHVsZXMvYXBpL0lBUElcIjtcbmltcG9ydCB7IFN5c3RlbVByZXZpZXcgfSBmcm9tIFx0XHRcdFx0XCIuLi8uLi8uLi8uLi9zcmMvTW9kdWxlcy9jb3JlL21vZGVsL3N5c3RlbVByZXZpZXdcIjtcbmltcG9ydCB7IFRUUlBHU3lzdGVtSlNPTkZvcm1hdHRpbmcgfSBmcm9tIFx0XCIuLi8uLi8uLi8uLi9zcmMvTW9kdWxlcy9ncmFwaERlc2lnbmVyL2luZGV4XCI7XG5cbmV4cG9ydCBjbGFzcyBMYXlvdXQwMUNvbnRleHR7XG5cdHB1YmxpYyBhY3RpdmVTeXN0ZW0gXHQ6IFRUUlBHU3lzdGVtSlNPTkZvcm1hdHRpbmc7XG5cdHB1YmxpYyBhdmFpbGFibGVQcmV2aWV3czpTeXN0ZW1QcmV2aWV3W107XG5cdHB1YmxpYyBBUEkgOiBJQVBJO1xufSIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5rZXlNYW5hZ2VySW5zdGFuY2UgPSBleHBvcnRzLktleU1hbmFnZXIgPSB2b2lkIDA7XG52YXIgS2V5TWFuYWdlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBLZXlNYW5hZ2VyKCkge1xuICAgICAgICB0aGlzLmtleUNvdW50ZXIgPSAwO1xuICAgIH1cbiAgICBLZXlNYW5hZ2VyLnByb3RvdHlwZS5nZXROZXdLZXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBudW0gPSB0aGlzLmtleUNvdW50ZXIrKztcbiAgICAgICAgcmV0dXJuIG51bS50b1N0cmluZygxNik7XG4gICAgfTtcbiAgICByZXR1cm4gS2V5TWFuYWdlcjtcbn0oKSk7XG5leHBvcnRzLktleU1hbmFnZXIgPSBLZXlNYW5hZ2VyO1xuZXhwb3J0cy5rZXlNYW5hZ2VySW5zdGFuY2UgPSBuZXcgS2V5TWFuYWdlcigpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLm5ld091dHB1dEhhbmRsZXIgPSB2b2lkIDA7XG5mdW5jdGlvbiBuZXdPdXRwdXRIYW5kbGVyKCkge1xuICAgIHZhciBhID0ge1xuICAgICAgICBvdXRFcnJvcjogZnVuY3Rpb24gKG1zZykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgICB9LFxuICAgICAgICBvdXRMb2c6IGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG1zZyk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBhO1xufVxuZXhwb3J0cy5uZXdPdXRwdXRIYW5kbGVyID0gbmV3T3V0cHV0SGFuZGxlcjtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5BR3JhcGhJdGVtID0gdm9pZCAwO1xudmFyIEtleU1hbmFnZXJfMSA9IHJlcXVpcmUoXCIuL0tleU1hbmFnZXJcIik7XG52YXIga2V5TWFuYWdlciA9IG5ldyBLZXlNYW5hZ2VyXzEuS2V5TWFuYWdlcigpO1xudmFyIEFHcmFwaEl0ZW0gPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQUdyYXBoSXRlbShuYW1lLCBrZXkpIHtcbiAgICAgICAgaWYgKG5hbWUgPT09IHZvaWQgMCkgeyBuYW1lID0gJyc7IH1cbiAgICAgICAgaWYgKGtleSA9PT0gdm9pZCAwKSB7IGtleSA9ICcnOyB9XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuX2tleSA9IGtleSArIGtleU1hbmFnZXIuZ2V0TmV3S2V5KCk7XG4gICAgfVxuICAgIEFHcmFwaEl0ZW0ucHJvdG90eXBlLmdldE5hbWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5hbWU7XG4gICAgfTtcbiAgICBBR3JhcGhJdGVtLnByb3RvdHlwZS5zZXROYW1lID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB9O1xuICAgIEFHcmFwaEl0ZW0ucHJvdG90eXBlLmdldEtleSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2tleTtcbiAgICB9O1xuICAgIHJldHVybiBBR3JhcGhJdGVtO1xufSgpKTtcbmV4cG9ydHMuQUdyYXBoSXRlbSA9IEFHcmFwaEl0ZW07XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuR3JvYkNvbGxlY3Rpb24gPSB2b2lkIDA7XG52YXIgdHNsaWJfMSA9IHJlcXVpcmUoXCJ0c2xpYlwiKTtcbnZhciBBR3JhcGhJdGVtXzEgPSByZXF1aXJlKFwiLi9BYnN0cmFjdGlvbnMvQUdyYXBoSXRlbVwiKTtcbnZhciBHcm9iQ29sbGVjdGlvbiA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICB0c2xpYl8xLl9fZXh0ZW5kcyhHcm9iQ29sbGVjdGlvbiwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBHcm9iQ29sbGVjdGlvbihuYW1lLCBwYXJlbnQpIHtcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgbmFtZSwgJ0MnKSB8fCB0aGlzO1xuICAgICAgICBfdGhpcy5ub2Rlc19uYW1lcyA9IHt9O1xuICAgICAgICBfdGhpcy51cGRhdGVMaXN0ZW5lcnMgPSB7fTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBHcm9iQ29sbGVjdGlvbi5wcm90b3R5cGUuZ2V0Tm9kZU5hbWVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5ub2Rlc19uYW1lcyk7XG4gICAgfTtcbiAgICBHcm9iQ29sbGVjdGlvbi5wcm90b3R5cGUuZ2V0Tm9kZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMubm9kZXNfbmFtZXMpO1xuICAgIH07XG4gICAgR3JvYkNvbGxlY3Rpb24ucHJvdG90eXBlLmhhc05vZGUgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5ub2Rlc19uYW1lc1tuYW1lXSA/IHRydWUgOiBmYWxzZTtcbiAgICB9O1xuICAgIEdyb2JDb2xsZWN0aW9uLnByb3RvdHlwZS5nZXROb2RlID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICByZXR1cm4gKF9hID0gdGhpcy5ub2Rlc19uYW1lc1tuYW1lXSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogbnVsbDtcbiAgICB9O1xuICAgIEdyb2JDb2xsZWN0aW9uLnByb3RvdHlwZS5hZGROb2RlID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgIG5vZGUucGFyZW50ID0gdGhpcztcbiAgICAgICAgdGhpcy5ub2Rlc19uYW1lc1tub2RlLmdldE5hbWUoKV0gPSBub2RlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICAgIEdyb2JDb2xsZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVOb2RlID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgaWYgKCFub2RlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdhdHRlbXB0ZWQgdG8gZGVsZXRlIG5vZGUgXCJOdWxsXCIgJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5hbWUgPSBub2RlLmdldE5hbWUoKTtcbiAgICAgICAgdmFyIG4gPSB0aGlzLm5vZGVzX25hbWVzW25hbWVdO1xuICAgICAgICBpZiAoIW4pXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIG4uZGlzcG9zZSgpO1xuICAgICAgICBkZWxldGUgdGhpcy5ub2Rlc19uYW1lc1tuYW1lXTtcbiAgICAgICAgcmV0dXJuIHRoaXMubm9kZXNfbmFtZXNbbmFtZV0gPT0gbnVsbDtcbiAgICB9O1xuICAgIEdyb2JDb2xsZWN0aW9uLnByb3RvdHlwZS51cGRhdGVfbm9kZV9uYW1lID0gZnVuY3Rpb24gKG9sZE5hbWUsIG5ld05hbWUpIHtcbiAgICAgICAgaWYgKG9sZE5hbWUgPT0gbmV3TmFtZSlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgdGhpcy5ub2Rlc19uYW1lc1tuZXdOYW1lXSA9IHRoaXMubm9kZXNfbmFtZXNbb2xkTmFtZV07XG4gICAgICAgIGRlbGV0ZSB0aGlzLm5vZGVzX25hbWVzW29sZE5hbWVdO1xuICAgIH07XG4gICAgR3JvYkNvbGxlY3Rpb24ucHJvdG90eXBlLnNldE5hbWUgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICB2YXIgb2xkbmFtZSA9IHRoaXMuZ2V0TmFtZSgpO1xuICAgICAgICBpZiAob2xkbmFtZSA9PSBuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgX3N1cGVyLnByb3RvdHlwZS5zZXROYW1lLmNhbGwodGhpcywgbmFtZSk7XG4gICAgICAgIHRoaXMucGFyZW50LnVwZGF0ZV9jb2xsZWN0aW9uX25hbWUob2xkbmFtZSwgbmFtZSk7XG4gICAgICAgIHRoaXMudXBkYXRlTG9jYXRpb24odGhpcy5wYXJlbnQpO1xuICAgIH07XG4gICAgR3JvYkNvbGxlY3Rpb24ucHJvdG90eXBlLnVwZGF0ZUxvY2F0aW9uID0gZnVuY3Rpb24gKHBhcmVudCkge1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLm5vZGVzX25hbWVzKSB7XG4gICAgICAgICAgICB2YXIgY3VyciA9IHRoaXMubm9kZXNfbmFtZXNbbmFtZV07XG4gICAgICAgICAgICBjdXJyLnVwZGF0ZUxvY2F0aW9uKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ2V0Tm9kZXMoKS5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICBub2RlLnVwZGF0ZSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5jYWxsVXBkYXRlTGlzdGVuZXJzKCk7XG4gICAgfTtcbiAgICBHcm9iQ29sbGVjdGlvbi5wcm90b3R5cGUuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzLm5vZGVzX25hbWVzKSB7XG4gICAgICAgICAgICB2YXIgY3VyciA9IHRoaXMubm9kZXNfbmFtZXNbbmFtZV07XG4gICAgICAgICAgICBjdXJyLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLm5vZGVzX25hbWVzW25hbWVdO1xuICAgICAgICB9XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBudWxsO1xuICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgdGhpcy5uYW1lID0gbnVsbDtcbiAgICB9O1xuICAgIEdyb2JDb2xsZWN0aW9uLnByb3RvdHlwZS5nZXRDb2xsZWN0aW9uVHlwZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sVHlwZTtcbiAgICB9O1xuICAgIEdyb2JDb2xsZWN0aW9uLnByb3RvdHlwZS5zZXRDb2xsZWN0aW9uVHlwZSA9IGZ1bmN0aW9uIChjb2xUeXBlKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbFR5cGUgIT0gbnVsbCAmJiBjb2xUeXBlICE9IGNvbFR5cGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndHJpZWQgdG8gY29udmVydCBhIGdyb3VwIHR5cGUgYWZ0ZXIgU2V0dGluZy4gRGVuaWVkIEFjdGlvbicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29sVHlwZSA9IGNvbFR5cGU7XG4gICAgfTtcbiAgICBHcm9iQ29sbGVjdGlvbi5wcm90b3R5cGUuY2FsbFVwZGF0ZUxpc3RlbmVycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgKE9iamVjdC5rZXlzKHRoaXMudXBkYXRlTGlzdGVuZXJzKSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBfdGhpcy51cGRhdGVMaXN0ZW5lcnNba2V5XSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgICBHcm9iQ29sbGVjdGlvbi5wcm90b3R5cGUuYWRkVXBkYXRlTGlzdGVuZXIgPSBmdW5jdGlvbiAoa2V5LCBsaXN0ZW5lcikge1xuICAgICAgICBpZiAodGhpcy51cGRhdGVMaXN0ZW5lcnNba2V5XSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ3RyaWVkIHRvIGFkZCB1cGRhdGVsaXN0ZW5lciB0byBub2RlIHdpdGgga2V5OicgKyBrZXkgKyAnLiBidXQgdGhlcmUgd2FzIGFscmVhZHkgYSBsaXN0ZW5lciB1c2luZyB0aGF0IGtleScpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlTGlzdGVuZXJzW2tleV0gPSBsaXN0ZW5lcjtcbiAgICB9O1xuICAgIEdyb2JDb2xsZWN0aW9uLnByb3RvdHlwZS5yZW1vdmVVcGRhdGVMaXN0ZW5lciA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMudXBkYXRlTGlzdGVuZXJzW2tleV07XG4gICAgfTtcbiAgICBHcm9iQ29sbGVjdGlvbi5wcm90b3R5cGUucmVtb3ZlQWxsVXBkYXRlTGlzdGVuZXJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnVwZGF0ZUxpc3RlbmVycyA9IHt9O1xuICAgIH07XG4gICAgcmV0dXJuIEdyb2JDb2xsZWN0aW9uO1xufShBR3JhcGhJdGVtXzEuQUdyYXBoSXRlbSkpO1xuZXhwb3J0cy5Hcm9iQ29sbGVjdGlvbiA9IEdyb2JDb2xsZWN0aW9uO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkdyb2JHcm91cCA9IHZvaWQgMDtcbnZhciB0c2xpYl8xID0gcmVxdWlyZShcInRzbGliXCIpO1xudmFyIEFHcmFwaEl0ZW1fMSA9IHJlcXVpcmUoXCIuL0Fic3RyYWN0aW9ucy9BR3JhcGhJdGVtXCIpO1xudmFyIEdyb2JHcm91cCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICB0c2xpYl8xLl9fZXh0ZW5kcyhHcm9iR3JvdXAsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gR3JvYkdyb3VwKG5hbWUsIHBhcmVudCkge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBuYW1lLCAnRycpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLmNvbGxlY3Rpb25zX25hbWVzID0ge307XG4gICAgICAgIHJldHVybiBfdGhpcztcbiAgICB9XG4gICAgR3JvYkdyb3VwLnByb3RvdHlwZS5nZXRDb2xsZWN0aW9uc05hbWVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy5jb2xsZWN0aW9uc19uYW1lcyk7XG4gICAgfTtcbiAgICBHcm9iR3JvdXAucHJvdG90eXBlLmhhc0NvbGxlY3Rpb24gPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb2xsZWN0aW9uc19uYW1lc1tuYW1lXSA/IHRydWUgOiBmYWxzZTtcbiAgICB9O1xuICAgIEdyb2JHcm91cC5wcm90b3R5cGUuZ2V0Q29sbGVjdGlvbiA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb25zX25hbWVzW25hbWVdO1xuICAgIH07XG4gICAgR3JvYkdyb3VwLnByb3RvdHlwZS5hZGRDb2xsZWN0aW9uID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24pIHtcbiAgICAgICAgY29sbGVjdGlvbi5wYXJlbnQgPSB0aGlzO1xuICAgICAgICB0aGlzLmNvbGxlY3Rpb25zX25hbWVzW2NvbGxlY3Rpb24uZ2V0TmFtZSgpXSA9IGNvbGxlY3Rpb247XG4gICAgICAgIGNvbGxlY3Rpb24uc2V0Q29sbGVjdGlvblR5cGUodGhpcy5ncm91cFR5cGUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICAgIEdyb2JHcm91cC5wcm90b3R5cGUucmVtb3ZlQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uKSB7XG4gICAgICAgIHZhciBuYW1lID0gY29sbGVjdGlvbi5nZXROYW1lKCk7XG4gICAgICAgIHZhciBjID0gdGhpcy5jb2xsZWN0aW9uc19uYW1lc1tuYW1lXTtcbiAgICAgICAgaWYgKCFjKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBjb2xsZWN0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuY29sbGVjdGlvbnNfbmFtZXNbbmFtZV07XG4gICAgICAgIHJldHVybiB0aGlzLmNvbGxlY3Rpb25zX25hbWVzW25hbWVdID09IG51bGw7XG4gICAgfTtcbiAgICBHcm9iR3JvdXAucHJvdG90eXBlLnVwZGF0ZV9jb2xsZWN0aW9uX25hbWUgPSBmdW5jdGlvbiAob2xkTmFtZSwgbmV3TmFtZSkge1xuICAgICAgICB0aGlzLmNvbGxlY3Rpb25zX25hbWVzW25ld05hbWVdID0gdGhpcy5jb2xsZWN0aW9uc19uYW1lc1tvbGROYW1lXTtcbiAgICAgICAgZGVsZXRlIHRoaXMuY29sbGVjdGlvbnNfbmFtZXNbb2xkTmFtZV07XG4gICAgfTtcbiAgICBHcm9iR3JvdXAucHJvdG90eXBlLnNldE5hbWUgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICBfc3VwZXIucHJvdG90eXBlLnNldE5hbWUuY2FsbCh0aGlzLCBuYW1lKTtcbiAgICAgICAgZm9yICh2YXIgbmFtZV8xIGluIHRoaXMuY29sbGVjdGlvbnNfbmFtZXMpIHtcbiAgICAgICAgICAgIHZhciBjdXJyID0gdGhpcy5jb2xsZWN0aW9uc19uYW1lc1tuYW1lXzFdO1xuICAgICAgICAgICAgY3Vyci51cGRhdGVMb2NhdGlvbih0aGlzKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgR3JvYkdyb3VwLnByb3RvdHlwZS5kaXNwb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMuY29sbGVjdGlvbnNfbmFtZXMpIHtcbiAgICAgICAgICAgIHZhciBjdXJyID0gdGhpcy5jb2xsZWN0aW9uc19uYW1lc1tuYW1lXTtcbiAgICAgICAgICAgIGN1cnIuZGlzcG9zZSgpO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuY29sbGVjdGlvbnNfbmFtZXNbbmFtZV07XG4gICAgICAgIH1cbiAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgIHRoaXMubmFtZSA9IG51bGw7XG4gICAgfTtcbiAgICBHcm9iR3JvdXAucHJvdG90eXBlLmdldEdyb3VwVHlwZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3JvdXBUeXBlO1xuICAgIH07XG4gICAgR3JvYkdyb3VwLnByb3RvdHlwZS5zZXRHcm91cFR5cGUgPSBmdW5jdGlvbiAoZ3JvdXBUeXBlKSB7XG4gICAgICAgIGlmICh0aGlzLmdyb3VwVHlwZSAhPSBudWxsICYmIGdyb3VwVHlwZSAhPSBncm91cFR5cGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndHJpZWQgdG8gY29udmVydCBhIGdyb3VwIHR5cGUgYWZ0ZXIgU2V0dGluZy4gRGVuaWVkIEFjdGlvbicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JvdXBUeXBlID0gZ3JvdXBUeXBlO1xuICAgICAgICBPYmplY3QudmFsdWVzKHRoaXMuY29sbGVjdGlvbnNfbmFtZXMpLmZvckVhY2goZnVuY3Rpb24gKGNvbCkge1xuICAgICAgICAgICAgY29sLnNldENvbGxlY3Rpb25UeXBlKGdyb3VwVHlwZSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIEdyb2JHcm91cDtcbn0oQUdyYXBoSXRlbV8xLkFHcmFwaEl0ZW0pKTtcbmV4cG9ydHMuR3JvYkdyb3VwID0gR3JvYkdyb3VwO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlRUUlBHU3lzdGVtR3JhcGhBYnN0cmFjdE1vZGVsID0gdm9pZCAwO1xudmFyIEdyb2JDb2xsZWN0aW9uXzEgPSByZXF1aXJlKFwiLi4vR3JvYkNvbGxlY3Rpb25cIik7XG52YXIgR3JvYkdyb3VwXzEgPSByZXF1aXJlKFwiLi4vR3JvYkdyb3VwXCIpO1xudmFyIElPdXRwdXRIYW5kbGVyXzEgPSByZXF1aXJlKFwiLi4vQWJzdHJhY3Rpb25zL0lPdXRwdXRIYW5kbGVyXCIpO1xuLyoqXG4qIGEgZ2VuZXJhbCBhbmQgZmxleGlibGUgaW1wbGVtZW50YXRpb24gb2YgVFRSUEcgc3lzdGVtLiBpdCBmb2N1c3NlcyBvbiBub3QgZGlza3JpbWluYXRpb24gb3Igc29ydGluZyBkYXRhLlxuKiBzaW1wbHkgaGF2aW5nIGxvZ2ljIHRoYXQgaXMgdGhlIHNhbWUgZm9yIGV2ZXJ5dGhpbmcuXG4qL1xudmFyIFRUUlBHU3lzdGVtR3JhcGhBYnN0cmFjdE1vZGVsID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFRUUlBHU3lzdGVtR3JhcGhBYnN0cmFjdE1vZGVsKCkge1xuICAgICAgICB0aGlzLmRhdGEgPSB7fTtcbiAgICB9XG4gICAgVFRSUEdTeXN0ZW1HcmFwaEFic3RyYWN0TW9kZWwucHJvdG90eXBlLnNldE91dCA9IGZ1bmN0aW9uIChvdXQpIHtcbiAgICAgICAgdGhpcy5vdXQgPSBvdXQgPyBvdXQgOiAoMCwgSU91dHB1dEhhbmRsZXJfMS5uZXdPdXRwdXRIYW5kbGVyKSgpO1xuICAgIH07XG4gICAgVFRSUEdTeXN0ZW1HcmFwaEFic3RyYWN0TW9kZWwucHJvdG90eXBlLl9kZWxldGVHcm91cCA9IGZ1bmN0aW9uIChncm91cCkge1xuICAgICAgICBpZiAodHlwZW9mIGdyb3VwID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB2YXIgZ18xID0gdGhpcy5fZ2V0R3JvdXAoZ3JvdXApO1xuICAgICAgICAgICAgaWYgKCFnXzEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgZ3JvdXAgPSBnXzE7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGtleSA9IGdyb3VwLmdldE5hbWUoKTtcbiAgICAgICAgdmFyIGcgPSB0aGlzLmRhdGFba2V5XTtcbiAgICAgICAgaWYgKCFnKSB7XG4gICAgICAgICAgICB0aGlzLm91dC5vdXRFcnJvcigndHJpZWQgdG8gZGVsZXRlIG5vbiBleGlzdGFudCBncm91cCcpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGdyb3VwLmRpc3Bvc2UoKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuZGF0YVtrZXldO1xuICAgIH07XG4gICAgVFRSUEdTeXN0ZW1HcmFwaEFic3RyYWN0TW9kZWwucHJvdG90eXBlLl9jcmVhdGVHcm91cCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIGlmICh0aGlzLl9oYXNHcm91cChuYW1lKSkge1xuICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoJ2F0dGVtcHRlZCB0byBhZGQgbmV3IGdyb3VwLCBob3dldmVyIGdyb3VwIGFscmVhZHkgZXhpc3RlZCcpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGdwID0gbmV3IEdyb2JHcm91cF8xLkdyb2JHcm91cChuYW1lLCB0aGlzKTtcbiAgICAgICAgdGhpcy5kYXRhW2dwLmdldE5hbWUoKV0gPSBncDtcbiAgICAgICAgcmV0dXJuIGdwO1xuICAgIH07XG4gICAgVFRSUEdTeXN0ZW1HcmFwaEFic3RyYWN0TW9kZWwucHJvdG90eXBlLl9oYXNHcm91cCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmRhdGEpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGFba2V5XS5nZXROYW1lKCkgPT0gbmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICAgIFRUUlBHU3lzdGVtR3JhcGhBYnN0cmFjdE1vZGVsLnByb3RvdHlwZS5fZ2V0R3JvdXBfa2V5ID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5kYXRhW2tleV07XG4gICAgfTtcbiAgICBUVFJQR1N5c3RlbUdyYXBoQWJzdHJhY3RNb2RlbC5wcm90b3R5cGUuX2dldEdyb3VwID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuZGF0YSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF0YVtrZXldLmdldE5hbWUoKSA9PSBuYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG4gICAgVFRSUEdTeXN0ZW1HcmFwaEFic3RyYWN0TW9kZWwucHJvdG90eXBlLl9kZWxldGVDb2xsZWN0aW9uID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24pIHtcbiAgICAgICAgaWYgKCFjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLm91dC5vdXRFcnJvcihcInRyaWVkIHRvIGRlbGV0ZSBjb2xsZWN0aW9uLCBidXQgc3VwcGxpZWQgY29sbGVjdGlvbiB3YXMgaW52YWxpZFwiKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZ3JvdXAgPSBjb2xsZWN0aW9uLnBhcmVudDtcbiAgICAgICAgcmV0dXJuIGdyb3VwLnJlbW92ZUNvbGxlY3Rpb24oY29sbGVjdGlvbik7XG4gICAgfTtcbiAgICBUVFJQR1N5c3RlbUdyYXBoQWJzdHJhY3RNb2RlbC5wcm90b3R5cGUuX2NyZWF0ZUNvbGxlY3Rpb24gPSBmdW5jdGlvbiAoZ3JvdXAsIG5hbWUpIHtcbiAgICAgICAgaWYgKCFncm91cCkge1xuICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJ0cmllZCB0byBjcmVhdGUgY29sbGVjdGlvbiwgYnV0IHN1cHBsaWVkIGdyb3VwIHdhcyBpbnZhbGlkXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChncm91cC5oYXNDb2xsZWN0aW9uKG5hbWUpKSB7XG4gICAgICAgICAgICB0aGlzLm91dC5vdXRFcnJvcihcIkNvbGxlY3Rpb24gYnkgdGhhdCBuYW1lIGFscmVhZHkgZXhpc3RlZCBpbiAnXCIuY29uY2F0KGdyb3VwLmdldE5hbWUoKSwgXCInXCIpKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjb2xsZWN0aW9uID0gbmV3IEdyb2JDb2xsZWN0aW9uXzEuR3JvYkNvbGxlY3Rpb24obmFtZSwgZ3JvdXApO1xuICAgICAgICBncm91cC5hZGRDb2xsZWN0aW9uKGNvbGxlY3Rpb24pO1xuICAgICAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgICB9O1xuICAgIFRUUlBHU3lzdGVtR3JhcGhBYnN0cmFjdE1vZGVsLnByb3RvdHlwZS5fQWRkTm9kZSA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uLCBub2RlKSB7XG4gICAgICAgIGlmICghY29sbGVjdGlvbikge1xuICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJ0cmllZCB0byBhZGQgbm9kZSwgYnV0IHN1cHBsaWVkIGNvbGxlY3Rpb24gd2FzIGludmFsaWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNvbGxlY3Rpb24uZ2V0Q29sbGVjdGlvblR5cGUoKSAhPSAnTm9kZScpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVHJpZWQgdG8gQWRkIE5vZGUgdG8gTm9uIE5vZGUgQ29sbGVjdG9uJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uYWRkTm9kZShub2RlKTtcbiAgICB9O1xuICAgIFRUUlBHU3lzdGVtR3JhcGhBYnN0cmFjdE1vZGVsLnByb3RvdHlwZS5fZGVsZXRlTm9kZSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIHZhciBjb2wgPSBub2RlLnBhcmVudDtcbiAgICAgICAgdmFyIHIgPSBjb2wucmVtb3ZlTm9kZShub2RlKTtcbiAgICAgICAgbm9kZS5kaXNwb3NlKCk7XG4gICAgICAgIHJldHVybiByO1xuICAgIH07XG4gICAgVFRSUEdTeXN0ZW1HcmFwaEFic3RyYWN0TW9kZWwucHJvdG90eXBlLl9hZGROb2RlRGVwZW5kZW5jeSA9IGZ1bmN0aW9uIChub2RlLCBkZXApIHtcbiAgICAgICAgdmFyIG8xID0gbm9kZS5hZGREZXBlbmRlbmN5KGRlcCk7XG4gICAgICAgIHZhciBvMiA9IGRlcC5hZGREZXBlbmRlbnQobm9kZSk7XG4gICAgICAgIGlmICghKG8xICYmIG8yKSkge1xuICAgICAgICAgICAgaWYgKCFvMSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwiQ291bGQgbm90IGFkZCBkZXBlbmRlbmN5IFwiLmNvbmNhdChkZXAuZ2V0TmFtZSgpLCBcIiwgb24gbm9kZSBcIikuY29uY2F0KG5vZGUuZ2V0TmFtZSgpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIW8yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJDb3VsZCBub3QgYWRkIGRlcGVuZGVudCBcIi5jb25jYXQobm9kZS5nZXROYW1lKCksIFwiLCBvbiBub2RlIFwiKS5jb25jYXQoZGVwLmdldE5hbWUoKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gICAgVFRSUEdTeXN0ZW1HcmFwaEFic3RyYWN0TW9kZWwucHJvdG90eXBlLl9yZW1vdmVOb2RlRGVwZW5kZW5jeSA9IGZ1bmN0aW9uIChub2RlLCBkZXApIHtcbiAgICAgICAgdmFyIG8xID0gbm9kZS5yZW1vdmVEZXBlbmRlbmN5KGRlcCk7XG4gICAgICAgIHZhciBvMiA9IGRlcC5yZW1vdmVEZXBlbmRlbnQobm9kZSk7XG4gICAgICAgIGlmICghKG8xICYmIG8yKSkge1xuICAgICAgICAgICAgaWYgKCFvMSkge1xuICAgICAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwiQ291bGQgbm90IHJlbW92ZSBkZXBlbmRlbmN5IFwiLmNvbmNhdChkZXAuZ2V0TmFtZSgpLCBcIiwgb24gbm9kZSBcIikuY29uY2F0KG5vZGUuZ2V0TmFtZSgpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIW8yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJDb3VsZCBub3QgcmVtb3ZlIGRlcGVuZGVudCBcIi5jb25jYXQobm9kZS5nZXROYW1lKCksIFwiLCBvbiBub2RlIFwiKS5jb25jYXQoZGVwLmdldE5hbWUoKSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gICAgVFRSUEdTeXN0ZW1HcmFwaEFic3RyYWN0TW9kZWwucHJvdG90eXBlLl9hZGRUYWJsZSA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uLCB0YWJsZSkge1xuICAgICAgICBpZiAoIWNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwidHJpZWQgdG8gYWRkIG5vZGUsIGJ1dCBzdXBwbGllZCBjb2xsZWN0aW9uIHdhcyBpbnZhbGlkXCIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb2xsZWN0aW9uLmdldENvbGxlY3Rpb25UeXBlKCkgIT0gJ1RhYmxlJykge1xuICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoJ1RyaWVkIHRvIEFkZCB0YWJsZSB0byBOb24gVGFibGUgQ29sbGVjdG9uJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uYWRkTm9kZSh0YWJsZSk7XG4gICAgfTtcbiAgICByZXR1cm4gVFRSUEdTeXN0ZW1HcmFwaEFic3RyYWN0TW9kZWw7XG59KCkpO1xuZXhwb3J0cy5UVFJQR1N5c3RlbUdyYXBoQWJzdHJhY3RNb2RlbCA9IFRUUlBHU3lzdGVtR3JhcGhBYnN0cmFjdE1vZGVsO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlRUUlBHU3lzdGVtR3JhcGhNb2RlbCA9IHZvaWQgMDtcbnZhciB0c2xpYl8xID0gcmVxdWlyZShcInRzbGliXCIpO1xudmFyIElPdXRwdXRIYW5kbGVyXzEgPSByZXF1aXJlKFwiLi4vQWJzdHJhY3Rpb25zL0lPdXRwdXRIYW5kbGVyXCIpO1xudmFyIFRUUlBHU3lzdGVtR3JhcGhBYnN0cmFjdE1vZGVsXzEgPSByZXF1aXJlKFwiLi9UVFJQR1N5c3RlbUdyYXBoQWJzdHJhY3RNb2RlbFwiKTtcbnZhciBpbmRleF8xID0gcmVxdWlyZShcIi4uL2luZGV4XCIpO1xudmFyIGluZGV4XzIgPSByZXF1aXJlKFwiLi4vaW5kZXhcIik7XG52YXIgZGVyaXZlZCA9ICdkZXJpdmVkJztcbnZhciBmaXhlZCA9ICdmaXhlZCc7XG4vKipcbiAqICBoYW5kbGVzIE1vZGVsIG9wZXJhdGlvbnMgYW5kIERhdGEgQ29udGFpbm1lbnQsXG4gKiBFbnN1cmVzIHRoYXQgZGF0YSBpcyBtYWludGFpbmVkLCBhcyB3ZWxsIGFzIGdyYXBobGlua3NcbiovXG52YXIgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIHRzbGliXzEuX19leHRlbmRzKFRUUlBHU3lzdGVtR3JhcGhNb2RlbCwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBUVFJQR1N5c3RlbUdyYXBoTW9kZWwoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLnNldE91dCgoMCwgSU91dHB1dEhhbmRsZXJfMS5uZXdPdXRwdXRIYW5kbGVyKSgpKTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICAvL1RPRE8gOiBmaW5kIGJldHRlciBzb2x1dGlvbiB0aGFuIHRoaXMuXG4gICAgLy8gciBcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmluaXRBc05ldyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fY3JlYXRlR3JvdXAoJ2ZpeGVkJyk7XG4gICAgICAgIHRoaXMuX2NyZWF0ZUdyb3VwKCdkZXJpdmVkJyk7XG4gICAgICAgIHRoaXMuX2NyZWF0ZUdyb3VwKCdleHRyYScpO1xuICAgICAgICB0aGlzLmRhdGFbJ2ZpeGVkJ10uc2V0R3JvdXBUeXBlKCdOb2RlJyk7XG4gICAgICAgIHRoaXMuZGF0YVsnZGVyaXZlZCddLnNldEdyb3VwVHlwZSgnTm9kZScpO1xuICAgICAgICB0aGlzLmRhdGFbJ2V4dHJhJ10uc2V0R3JvdXBUeXBlKCdUYWJsZScpO1xuICAgIH07XG4gICAgLy8vIENyZWF0ZSBTdGF0ZW1lbnRzIFxuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuY3JlYXRlQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIChncm91cCwgbmFtZSkge1xuICAgICAgICAvLyBlbnN1cmUgdGhhdCBncm91cCBleGlzdHMsIHNhbWUgd2F5IGFzIHRoZSBvdGhlcnNcbiAgICAgICAgaWYgKCF0aGlzLl9oYXNHcm91cChncm91cCkpIHtcbiAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwiTm8gZ3JvdXAgZXhpc3RlZCBieSBuYW1lIFwiLmNvbmNhdChncm91cCkpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBncnAgPSB0aGlzLl9nZXRHcm91cChncm91cCk7XG4gICAgICAgIGlmICghZ3JwKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIHJldHVybiB0aGlzLl9jcmVhdGVDb2xsZWN0aW9uKGdycCwgbmFtZSk7XG4gICAgfTtcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmNyZWF0ZURlcml2ZWRDb2xsZWN0aW9uID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQ29sbGVjdGlvbihkZXJpdmVkLCBuYW1lKTtcbiAgICB9O1xuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuY3JlYXRlRml4ZWRDb2xsZWN0aW9uID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQ29sbGVjdGlvbihmaXhlZCwgbmFtZSk7XG4gICAgfTtcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmNyZWF0ZU5vZGUgPSBmdW5jdGlvbiAoZ3JvdXAsIGNvbCwgbmFtZSkge1xuICAgICAgICAvLyBlbnN1cmUgdGhhdCBncm91cCBleGlzdHMsIHNhbWUgd2F5IGFzIHRoZSBvdGhlcnNcbiAgICAgICAgaWYgKCF0aGlzLl9oYXNHcm91cChncm91cCkpIHtcbiAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwiTm8gZ3JvdXAgZXhpc3RlZCBieSBuYW1lIFwiLmNvbmNhdChncm91cCkpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaGFzTm9kZShncm91cCwgY29sLCBuYW1lKSkge1xuICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJOb2RlIGJ5IHRoaXMgbmFtZSBhbHJlYWR5IGV4aXN0ZWQgXCIuY29uY2F0KGdyb3VwKSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ3JvdXAgPT0gJ2ZpeGVkJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlRml4ZWROb2RlKGNvbCwgbmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZ3JvdXAgPT0gJ2Rlcml2ZWQnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jcmVhdGVEZXJpdmVkTm9kZShjb2wsIG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG4gICAgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsLnByb3RvdHlwZS5jcmVhdGVEZXJpdmVkTm9kZSA9IGZ1bmN0aW9uIChjb2wsIG5hbWUpIHtcbiAgICAgICAgdmFyIGNvbE5hbWUgPSBjb2w7XG4gICAgICAgIGlmICh0eXBlb2YgY29sID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB2YXIgZ3JwID0gdGhpcy5fZ2V0R3JvdXAoZGVyaXZlZCk7XG4gICAgICAgICAgICBpZiAoIWdycClcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNvbCA9IGdycC5nZXRDb2xsZWN0aW9uKGNvbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb2xOYW1lID0gY29sLmdldE5hbWUoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbCkge1xuICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJObyBEZXJpdmVkIGNvbGxlY3Rpb24gZm91bmQgYnkgbmFtZTogXCIuY29uY2F0KGNvbE5hbWUsIFwiIFwiKSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbm9kZSA9IG5ldyBpbmRleF8yLkdyb2JEZXJpdmVkTm9kZShuYW1lLCBjb2wpO1xuICAgICAgICBjb2wuYWRkTm9kZShub2RlKTtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfTtcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmNyZWF0ZUZpeGVkTm9kZSA9IGZ1bmN0aW9uIChjb2wsIG5hbWUpIHtcbiAgICAgICAgdmFyIGdycCA9IHRoaXMuX2dldEdyb3VwKGZpeGVkKTtcbiAgICAgICAgaWYgKCFncnApXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgdmFyIGNvbE5hbWUgPSBjb2w7XG4gICAgICAgIGlmICh0eXBlb2YgY29sICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgY29sTmFtZSA9IGNvbC5nZXROYW1lKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb2wgPSBncnAuZ2V0Q29sbGVjdGlvbihjb2xOYW1lKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbCkge1xuICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJObyBGaXhlZCBjb2xsZWN0aW9uIGZvdW5kIGJ5IG5hbWU6IFwiLmNvbmNhdChjb2xOYW1lLCBcIiBcIikpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5vZGUgPSBuZXcgaW5kZXhfMS5Hcm9iRml4ZWROb2RlKG5hbWUsIGNvbCk7XG4gICAgICAgIGNvbC5hZGROb2RlKG5vZGUpO1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9O1xuICAgIC8vIGhhcyBTdGF0ZW1lbnRzIFxuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuaGFzQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIChncm91cCwgbmFtZSkge1xuICAgICAgICB2YXIgZ3JwID0gdGhpcy5fZ2V0R3JvdXAoZ3JvdXApO1xuICAgICAgICBpZiAoIWdycCkge1xuICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJObyBncm91cCBleGlzdGVkIGJ5IG5hbWUgXCIuY29uY2F0KGdyb3VwKSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdycC5oYXNDb2xsZWN0aW9uKG5hbWUpO1xuICAgIH07XG4gICAgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsLnByb3RvdHlwZS5oYXNEZXJpdmVkQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhc0NvbGxlY3Rpb24oZGVyaXZlZCwgbmFtZSk7XG4gICAgfTtcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmhhc0ZpeGVkQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmhhc0NvbGxlY3Rpb24oZml4ZWQsIG5hbWUpO1xuICAgIH07XG4gICAgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsLnByb3RvdHlwZS5oYXNOb2RlID0gZnVuY3Rpb24gKGdyb3VwLCBjb2wsIG5hbWUpIHtcbiAgICAgICAgdmFyIGdycCA9IHRoaXMuX2dldEdyb3VwKGdyb3VwKTtcbiAgICAgICAgaWYgKCFncnApIHtcbiAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwiTm8gZ3JvdXAgZXhpc3RlZCBieSBuYW1lIFwiLmNvbmNhdChncm91cCkpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBfY29sID0gY29sO1xuICAgICAgICBpZiAodHlwZW9mIGNvbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIF9jb2wgPSB0aGlzLmdldENvbGxlY3Rpb24oZ3JwLCBjb2wpO1xuICAgICAgICAgICAgaWYgKCFfY29sKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJhdHRlbXB0ZWQgdG8gZ2V0IFwiLmNvbmNhdChncm91cCwgXCIgY29sbGVjdGlvbiBcIikuY29uY2F0KG5hbWUsIFwiLCBidXQgbm8gY29sbGVjdGlvbiBleGlzdGVkIGJ5IHRoYXQgbmFtZVwiKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfY29sLmhhc05vZGUobmFtZSk7XG4gICAgfTtcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmhhc0Rlcml2ZWROb2RlID0gZnVuY3Rpb24gKGNvbCwgbmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5oYXNOb2RlKGRlcml2ZWQsIGNvbCwgbmFtZSk7XG4gICAgfTtcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmhhc0ZpeGVkTm9kZSA9IGZ1bmN0aW9uIChjb2wsIG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzTm9kZShmaXhlZCwgY29sLCBuYW1lKTtcbiAgICB9O1xuICAgIC8vIGdldCBTdGF0ZW1lbnRzIFxuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuZ2V0Q29sbGVjdGlvbk5hbWVzID0gZnVuY3Rpb24gKGdyb3VwKSB7XG4gICAgICAgIHZhciBncnA7XG4gICAgICAgIGlmICh0eXBlb2YgZ3JvdXAgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGdycCA9IHRoaXMuX2dldEdyb3VwKGdyb3VwKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGdycCA9IGdyb3VwO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZ3JwKSB7XG4gICAgICAgICAgICB0aGlzLm91dC5vdXRFcnJvcihcIk5vIGdyb3VwIGV4aXN0ZWQgYnkgbmFtZSBcIi5jb25jYXQoZ3JvdXApKTtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ3JwLmdldENvbGxlY3Rpb25zTmFtZXMoKTtcbiAgICB9O1xuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuZ2V0Q29sbGVjdGlvbiA9IGZ1bmN0aW9uIChncm91cCwgbmFtZSkge1xuICAgICAgICB2YXIgZ3JwO1xuICAgICAgICBpZiAodHlwZW9mIGdyb3VwID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBncnAgPSB0aGlzLl9nZXRHcm91cChncm91cCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBncnAgPSBncm91cDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWdycCkge1xuICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJObyBncm91cCBleGlzdGVkIGJ5IG5hbWUgXCIuY29uY2F0KGdyb3VwKSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29sID0gZ3JwLmdldENvbGxlY3Rpb24obmFtZSk7XG4gICAgICAgIGlmICghY29sKSB7XG4gICAgICAgICAgICB0aGlzLm91dC5vdXRFcnJvcihcImF0dGVtcHRlZCB0byBnZXQgXCIuY29uY2F0KGdyb3VwLCBcIiBjb2xsZWN0aW9uIFwiKS5jb25jYXQobmFtZSwgXCIsIGJ1dCBubyBjb2xsZWN0aW9uIGV4aXN0ZWQgYnkgdGhhdCBuYW1lXCIpKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2w7XG4gICAgfTtcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmdldERlcml2ZWRDb2xsZWN0aW9uID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29sbGVjdGlvbihkZXJpdmVkLCBuYW1lKTtcbiAgICB9O1xuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuZ2V0Rml4ZWRDb2xsZWN0aW9uID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29sbGVjdGlvbihmaXhlZCwgbmFtZSk7XG4gICAgfTtcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmdldE5vZGUgPSBmdW5jdGlvbiAoZ3JvdXAsIGNvbCwgbmFtZSkge1xuICAgICAgICB2YXIgZ3JwID0gdGhpcy5fZ2V0R3JvdXAoZ3JvdXApO1xuICAgICAgICBpZiAoIWdycCkge1xuICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJObyBncm91cCBleGlzdGVkIGJ5IG5hbWUgXCIuY29uY2F0KGdyb3VwKSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICAvLyBkZWZpbmUgb3V0cHV0XG4gICAgICAgIHZhciBub2RlO1xuICAgICAgICAvLyBpZiB0aGlzIGlzIGEgY29sbGVjdGlvbiwganVzdCBnZXQgdGhlIG5vZGUuXG4gICAgICAgIGlmICh0eXBlb2YgY29sICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgbm9kZSA9IGNvbC5nZXROb2RlKG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGlmIGNvbCBpcyBhIHN0cmluZywgdGhlbiBsZXQgaXQgYmUgc2VlbiBhcyB0aGUgbmFtZSBvZiB0aGUgY29sbGVjdGlvbiwgYW5kIGZldGNoIGl0LlxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGdldCBkYXRhXG4gICAgICAgICAgICB2YXIgY29sTmFtZSA9IGNvbDtcbiAgICAgICAgICAgIGNvbCA9IGdycC5nZXRDb2xsZWN0aW9uKGNvbCk7XG4gICAgICAgICAgICAvLyBlcnJvciBoYW5kbGluZy5cbiAgICAgICAgICAgIGlmICghY29sKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJhdHRlbXB0ZWQgdG8gZ2V0IFwiLmNvbmNhdChncm91cCwgXCIgY29sbGVjdGlvbiBcIikuY29uY2F0KGNvbE5hbWUsIFwiLCBidXQgZGlkIG5vdCBleGlzdFwiKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBkZWZpbmVkIG91dHB1dFxuICAgICAgICAgICAgbm9kZSA9IGNvbC5nZXROb2RlKG5hbWUpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGVycm9yIGhhbmRsaW5nXG4gICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJhdHRlbXB0ZWQgdG8gZ2V0IFwiLmNvbmNhdChncm91cCwgXCIuXCIpLmNvbmNhdChjb2wuZ2V0TmFtZSgpLCBcIiBOb2RlIFwiKS5jb25jYXQobmFtZSwgXCIsIGJ1dCBkaWQgbm90IGV4aXN0XCIpKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgIH07XG4gICAgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsLnByb3RvdHlwZS5nZXREZXJpdmVkTm9kZSA9IGZ1bmN0aW9uIChjb2wsIG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Tm9kZShkZXJpdmVkLCBjb2wsIG5hbWUpO1xuICAgIH07XG4gICAgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsLnByb3RvdHlwZS5nZXRGaXhlZE5vZGUgPSBmdW5jdGlvbiAoY29sLCBuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldE5vZGUoZml4ZWQsIGNvbCwgbmFtZSk7XG4gICAgfTtcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmdldE5vZGVOYW1lcyA9IGZ1bmN0aW9uIChncm91cCwgY29sKSB7XG4gICAgICAgIHZhciBncnAgPSB0aGlzLl9nZXRHcm91cChncm91cCk7XG4gICAgICAgIGlmICghZ3JwKSB7XG4gICAgICAgICAgICB0aGlzLm91dC5vdXRFcnJvcihcIk5vIGdyb3VwIGV4aXN0ZWQgYnkgbmFtZSBcIi5jb25jYXQoZ3JvdXApKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHZhciBfY29sO1xuICAgICAgICBpZiAodHlwZW9mIGNvbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIF9jb2wgPSBncnAuZ2V0Q29sbGVjdGlvbihjb2wpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgX2NvbCA9IGNvbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX2NvbC5nZXROb2RlTmFtZXMoKTtcbiAgICB9O1xuICAgIC8vIGRlbGV0ZSBTdGF0ZW1lbnRzIFxuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuX2RlbGV0ZUdyb3VwID0gZnVuY3Rpb24gKGdyb3VwKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZ3JvdXAgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHZhciBuYW1lID0gZ3JvdXA7XG4gICAgICAgICAgICBncm91cCA9IHRoaXMuX2dldEdyb3VwKGdyb3VwKTtcbiAgICAgICAgICAgIGlmICghZ3JvdXApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm91dC5vdXRFcnJvcignTm8gQ29sbGVjdGlvbiBieSBuYW1lICcgKyBuYW1lKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgX3N1cGVyLnByb3RvdHlwZS5fZGVsZXRlR3JvdXAuY2FsbCh0aGlzLCBncm91cCk7XG4gICAgfTtcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmRlbGV0ZUNvbGxlY3Rpb24gPSBmdW5jdGlvbiAoZ3JvdXAsIGNvbCkge1xuICAgICAgICB2YXIgZ3JwID0gdGhpcy5fZ2V0R3JvdXAoZ3JvdXApO1xuICAgICAgICBpZiAoIWdycCkge1xuICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJObyBncm91cCBleGlzdGVkIGJ5IG5hbWUgXCIuY29uY2F0KGdyb3VwKSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBjb2wgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBjb2wgPVxuICAgICAgICAgICAgICAgIGNvbCA9IGdycC5nZXRDb2xsZWN0aW9uKGNvbCk7XG4gICAgICAgICAgICBpZiAoIWNvbClcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlbGV0ZUNvbGxlY3Rpb24oY29sKTtcbiAgICB9O1xuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuZGVsZXRlRGVyaXZlZENvbGxlY3Rpb24gPSBmdW5jdGlvbiAoY29sKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlbGV0ZUNvbGxlY3Rpb24oZGVyaXZlZCwgY29sKTtcbiAgICB9O1xuICAgIFRUUlBHU3lzdGVtR3JhcGhNb2RlbC5wcm90b3R5cGUuZGVsZXRlRml4ZWRDb2xsZWN0aW9uID0gZnVuY3Rpb24gKGNvbCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kZWxldGVDb2xsZWN0aW9uKGZpeGVkLCBjb2wpO1xuICAgIH07XG4gICAgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsLnByb3RvdHlwZS5kZWxldGVOb2RlID0gZnVuY3Rpb24gKGdyb3VwLCBjb2wsIG5hbWUpIHtcbiAgICAgICAgdmFyIGdycCA9IHRoaXMuX2dldEdyb3VwKGdyb3VwKTtcbiAgICAgICAgaWYgKCFncnApIHtcbiAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwiTm8gZ3JvdXAgZXhpc3RlZCBieSBuYW1lIFwiLmNvbmNhdChncm91cCkpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgY29sID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY29sID0gZ3JwLmdldENvbGxlY3Rpb24oY29sKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbCkge1xuICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJhdHRlbXB0ZWQgdG8gZ2V0IFwiLmNvbmNhdChncm91cCwgXCIgY29sbGVjdGlvbiBcIikuY29uY2F0KG5hbWUsIFwiLCBidXQgbm8gY29sbGVjdGlvbiBleGlzdGVkIGJ5IHRoYXQgbmFtZVwiKSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5vZGUgPSBjb2wuZ2V0Tm9kZShuYW1lKTtcbiAgICAgICAgcmV0dXJuIGNvbC5yZW1vdmVOb2RlKG5vZGUpO1xuICAgIH07XG4gICAgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsLnByb3RvdHlwZS5kZWxldGVEZXJpdmVkTm9kZSA9IGZ1bmN0aW9uIChjb2wsIG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVsZXRlTm9kZShkZXJpdmVkLCBjb2wsIG5hbWUpO1xuICAgIH07XG4gICAgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsLnByb3RvdHlwZS5kZWxldGVGaXhlZE5vZGUgPSBmdW5jdGlvbiAoY29sLCBuYW1lKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlbGV0ZU5vZGUoZml4ZWQsIGNvbCwgbmFtZSk7XG4gICAgfTtcbiAgICAvLyBSZW5hbWluZyBmdW5jdGlvbnNcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLnJlbmFtZUNvbGxlY3Rpb24gPSBmdW5jdGlvbiAoZ3JvdXAsIGNvbCwgbmV3TmFtZSkge1xuICAgICAgICAvLyBjaGVjayB0aGF0IGdyb3VwIGV4aXN0cywgYW5kIGdldCB0aGUgdmFsdWVzLiBcbiAgICAgICAgdmFyIGdycDtcbiAgICAgICAgdmFyIGdycE5hbWU7XG4gICAgICAgIGlmICh0eXBlb2YgZ3JvdXAgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGdycE5hbWUgPSBncm91cDtcbiAgICAgICAgICAgIGdycCA9IHRoaXMuX2dldEdyb3VwKGdyb3VwKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGdycE5hbWUgPSBncm91cC5nZXROYW1lKCk7XG4gICAgICAgICAgICBncnAgPSBncm91cDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWdycCkge1xuICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJObyBncm91cCBleGlzdGVkIGJ5IG5hbWUgXCIuY29uY2F0KGdycE5hbWUpKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIC8vIENoZWNrIHRoYXQgQ29sbGVjdGlvbiBleGlzdHMgYW5kIGdldCB0aGUgdmFsdWVzIFxuICAgICAgICB2YXIgY29sTmFtZSA9IGNvbDtcbiAgICAgICAgaWYgKHR5cGVvZiBjb2wgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGNvbE5hbWUgPSBjb2w7XG4gICAgICAgICAgICBjb2wgPSBncnAuZ2V0Q29sbGVjdGlvbihjb2wpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29sTmFtZSA9IGNvbC5nZXROYW1lKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjb2wpIHtcbiAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwiTm8gQ29sbGVjdGlvbiBleGlzdGVkIGJ5IG5hbWUgXCIuY29uY2F0KGNvbE5hbWUsIFwiIGluIFwiKS5jb25jYXQoZ3JwTmFtZSkpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY2hlY2sgdGhhdCB0aGUgbmV3IE5hbWUgY29sbGVjdGlvbiBkb2VzZW50IGFscmVhZHkgZXhpc3QuXG4gICAgICAgIGlmIChncnAuZ2V0Q29sbGVjdGlvbihuZXdOYW1lKSkge1xuICAgICAgICAgICAgdGhpcy5vdXQub3V0RXJyb3IoXCJDb2xsZWN0aW9uIGFscmVhZHkgZXhpc3RlZCBieSBuYW1lIFwiLmNvbmNhdChuZXdOYW1lLCBcIiBpbiBcIikuY29uY2F0KGdycE5hbWUpKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIC8vIHVwZGF0ZSBcbiAgICAgICAgcmV0dXJuIGNvbC5zZXROYW1lKG5ld05hbWUpO1xuICAgIH07XG4gICAgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsLnByb3RvdHlwZS5yZW5hbWVJdGVtID0gZnVuY3Rpb24gKGdyb3VwLCBjb2wsIG9sZE5hbWUsIG5ld05hbWUpIHtcbiAgICAgICAgLy8gY2hlY2sgdGhhdCBncm91cCBleGlzdHMsIGFuZCBnZXQgdGhlIHZhbHVlcy4gXG4gICAgICAgIHZhciBncnA7XG4gICAgICAgIHZhciBncnBOYW1lO1xuICAgICAgICBpZiAodHlwZW9mIGdyb3VwID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBncnBOYW1lID0gZ3JvdXA7XG4gICAgICAgICAgICBncnAgPSB0aGlzLl9nZXRHcm91cChncm91cCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBncnBOYW1lID0gZ3JvdXAuZ2V0TmFtZSgpO1xuICAgICAgICAgICAgZ3JwID0gZ3JvdXA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFncnApIHtcbiAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwiTm8gZ3JvdXAgZXhpc3RlZCBieSBuYW1lIFwiLmNvbmNhdChncnBOYW1lKSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICAvLyBDaGVjayB0aGF0IENvbGxlY3Rpb24gZXhpc3RzIGFuZCBnZXQgdGhlIHZhbHVlcyBcbiAgICAgICAgdmFyIGNvbE5hbWUgPSBjb2w7XG4gICAgICAgIGlmICh0eXBlb2YgY29sID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBjb2xOYW1lID0gY29sO1xuICAgICAgICAgICAgY29sID0gZ3JwLmdldENvbGxlY3Rpb24oY29sKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbE5hbWUgPSBjb2wuZ2V0TmFtZSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghY29sKSB7XG4gICAgICAgICAgICB0aGlzLm91dC5vdXRFcnJvcihcIk5vIENvbGxlY3Rpb24gZXhpc3RlZCBieSBuYW1lIFwiLmNvbmNhdChjb2xOYW1lLCBcIiBpbiBcIikuY29uY2F0KGdycE5hbWUpKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIC8vIGNoZWNrIHRoYXQgdGhlIE5vZGUgZXhpc3RzXG4gICAgICAgIGlmICghY29sLmhhc05vZGUob2xkTmFtZSkpIHtcbiAgICAgICAgICAgIHRoaXMub3V0Lm91dEVycm9yKFwiTm8gSXRlbSBleGlzdGVkIGJ5IG5hbWUgXCIuY29uY2F0KG9sZE5hbWUsIFwiIGluIFwiKS5jb25jYXQoZ3JwTmFtZSwgXCIuXCIpLmNvbmNhdChjb2xOYW1lKSk7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICAvLyB1cGRhdGUgXG4gICAgICAgIHJldHVybiBjb2wudXBkYXRlX25vZGVfbmFtZShvbGROYW1lLCBuZXdOYW1lKTtcbiAgICB9O1xuICAgIC8vIFZhbGlkYXRpb24gRnVuY3Rpb25zXG4gICAgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsLnByb3RvdHlwZS5pc1ZhbGlkID0gZnVuY3Rpb24gKGVycm9yTWVzc2FnZXMpIHtcbiAgICAgICAgaWYgKGVycm9yTWVzc2FnZXMgPT09IHZvaWQgMCkgeyBlcnJvck1lc3NhZ2VzID0gW107IH1cbiAgICAgICAgdmFyIGtleV9ncm91cCwga2V5X2NvbGxlY3Rpb24sIGtleV9ub2RlO1xuICAgICAgICB2YXIgY29sbGVjdGlvbk5hbWVzLCBub2RlTmFtZXM7XG4gICAgICAgIHZhciBncm91cCwgY29sbGVjdGlvbiwgbm9kZTtcbiAgICAgICAgdmFyIGlzVmFsaWQ7XG4gICAgICAgIC8vIGZvcmVhY2ggZ3JvdXAsIGdldCBkbyB0aGlzIGZvciBhbGwgY29sbGVjdGlvbnMuXG4gICAgICAgIGZvciAoa2V5X2dyb3VwIGluIHRoaXMuZGF0YSkge1xuICAgICAgICAgICAgZ3JvdXAgPSB0aGlzLmRhdGFba2V5X2dyb3VwXTtcbiAgICAgICAgICAgIGNvbGxlY3Rpb25OYW1lcyA9IGdyb3VwLmdldENvbGxlY3Rpb25zTmFtZXMoKTtcbiAgICAgICAgICAgIC8vIGZvcmFjaCBjb2xsZWN0aW9uIGRvIHRoaXMgZm9yIGFsbCBub2RlcyBcbiAgICAgICAgICAgIGZvciAodmFyIGMgPSAwOyBjIDwgY29sbGVjdGlvbk5hbWVzLmxlbmd0aDsgYysrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbEluZGV4ID0gYztcbiAgICAgICAgICAgICAgICAvL2ZvciAoIGNvbnN0IGNvbEluZGV4IGluIGdyb3VwLmdldENvbGxlY3Rpb25zTmFtZXMoKSApe1xuICAgICAgICAgICAgICAgIGtleV9jb2xsZWN0aW9uID0gY29sbGVjdGlvbk5hbWVzW2NvbEluZGV4XTtcbiAgICAgICAgICAgICAgICBjb2xsZWN0aW9uID0gZ3JvdXAuZ2V0Q29sbGVjdGlvbihrZXlfY29sbGVjdGlvbik7XG4gICAgICAgICAgICAgICAgbm9kZU5hbWVzID0gY29sbGVjdGlvbi5nZXROb2RlTmFtZXMoKTtcbiAgICAgICAgICAgICAgICAvLyBkbyB0aGlzIGZvciBlYWNoIG5vZGUuIFxuICAgICAgICAgICAgICAgIGZvciAodmFyIG4gPSAwOyBuIDwgbm9kZU5hbWVzLmxlbmd0aDsgbisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBub2RlSW5kZXggPSBuO1xuICAgICAgICAgICAgICAgICAgICAvL2ZvciAoIGNvbnN0IG5vZGVJbmRleCBpbiBub2RlTmFtZXMgKXtcbiAgICAgICAgICAgICAgICAgICAga2V5X25vZGUgPSBub2RlTmFtZXNbbm9kZUluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IGNvbGxlY3Rpb24uZ2V0Tm9kZShrZXlfbm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIGlzVmFsaWQgPSBub2RlLmlzVmFsaWQoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbXNnID0gXCJcIi5jb25jYXQoa2V5X2dyb3VwLCBcIi5cIikuY29uY2F0KGtleV9jb2xsZWN0aW9uLCBcIi5cIikuY29uY2F0KGtleV9ub2RlLCBcIiB3YXMgaW52YWxpZFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrZXlzID0gW2tleV9ncm91cCwga2V5X2NvbGxlY3Rpb24sIGtleV9ub2RlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yTWVzc2FnZXMucHVzaCh7IG1zZzogbXNnLCBrZXk6IGtleXMgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVycm9yTWVzc2FnZXMubGVuZ3RoID09IDA7XG4gICAgfTtcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLl9nZXRHcm91cCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHZhciBncnAgPSB0aGlzLmRhdGFbbmFtZV07XG4gICAgICAgIHJldHVybiBncnAgIT09IG51bGwgJiYgZ3JwICE9PSB2b2lkIDAgPyBncnAgOiBudWxsO1xuICAgIH07XG4gICAgLy8gYWRkIGRlcGVuZGVuY3lcbiAgICBUVFJQR1N5c3RlbUdyYXBoTW9kZWwucHJvdG90eXBlLmFkZE5vZGVEZXBlbmRlbmN5ID0gZnVuY3Rpb24gKG5vZGUsIGRlcCkge1xuICAgICAgICB0aGlzLl9hZGROb2RlRGVwZW5kZW5jeShub2RlLCBkZXApO1xuICAgIH07XG4gICAgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsLnByb3RvdHlwZS5yZW1vdmVOb2RlRGVwZW5kZW5jeSA9IGZ1bmN0aW9uIChub2RlLCBkZXApIHtcbiAgICAgICAgdGhpcy5fcmVtb3ZlTm9kZURlcGVuZGVuY3kobm9kZSwgZGVwKTtcbiAgICB9O1xuICAgIHJldHVybiBUVFJQR1N5c3RlbUdyYXBoTW9kZWw7XG59KFRUUlBHU3lzdGVtR3JhcGhBYnN0cmFjdE1vZGVsXzEuVFRSUEdTeXN0ZW1HcmFwaEFic3RyYWN0TW9kZWwpKTtcbmV4cG9ydHMuVFRSUEdTeXN0ZW1HcmFwaE1vZGVsID0gVFRSUEdTeXN0ZW1HcmFwaE1vZGVsO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkdyb2JBbGdvcml0aG1zID0gdm9pZCAwO1xudmFyIEdyb2JBbGdvcml0aG1zID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEdyb2JBbGdvcml0aG1zKCkge1xuICAgIH1cbiAgICBHcm9iQWxnb3JpdGhtcy5UYXJqQWxnbyA9IGZ1bmN0aW9uIChub2Rlcywgc3Ryb25nQ29tcG9uZW50cykge1xuICAgICAgICAvKlxuICAgICAgICAgICAgY29uc3QgZGVyaXZlZCA9ICdkZXJpdmVkJztcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUdyYXBoKCAgKSA6IFJlY29yZDxzdHJpbmcsZGVwZW5kZW5jeU5vZGU+e1xuXG4gICAgICAgICAgICAgICAgLy8gY3JlYXRpbmcgdGhlIGRhdGEgd2UgbmVlZCB0byB3b3JrIHdpdGguXG4gICAgICAgICAgICAgICAgLy8gZmlyc3Qgd2UgR2V0IHRoZSBub2RlcyB3aXRoIHRoZWlyIG5hbWVzXG4gICAgICAgICAgICAgICAgdmFyIGdyYXBoIFx0XHQ6IFJlY29yZDxzdHJpbmcsQUdyb2JOb2RlPGFueT4+ID0ge307XG4gICAgICAgICAgICAgICAgZGF0YS5mb3JFYWNoKCBDb2xsZWN0aW9uID0+IHtcbiAgICAgICAgICAgICAgICAgICAgQ29sbGVjdGlvbi5kYXRhLmZvckVhY2goIHN0YXQgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGAke2Rlcml2ZWR9LiR7Q29sbGVjdGlvbi5uYW1lfS4ke3N0YXQubmFtZX1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9kZSA9IG5ldyBkZXBlbmRlbmN5Tm9kZSggbmFtZSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZ3JhcGhbIG5hbWUgXSA9IG5vZGU7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAvLyBXZSBhZGQgdGhlIGRlcGVuZGVuY2llcyB0byB0aGUgbm9kZXMgYXMgb3V0Z29pbmcgZWRnZXMuXG4gICAgICAgICAgICAgICAgLy8gV2hpbGUgRG9pbmcgc28gd2hlbiB3ZSBmaW5kIGFuIGVkZ2UsIHdlIGFsc28gYWRkIGl0IGFzIGluZ29pbmcgdG8gaXRzIHRhcmdldC5cbiAgICAgICAgICAgICAgICBmb3IgKCBjb25zdCBrZXkgaW4gZ3JhcGggKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgbm9kZSA9IGdyYXBoW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBkaWN0W2tleV07XG4gICAgICAgICAgICAgICAgICAgICAgICBcblxuICAgICAgICAgICAgICAgICAgICAvLyBnZXQgdGhlIGVkZ2VzXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGVkZ2VzID0gaXRlbS5kYXRhLm1hcChwID0+IHAub3JpZ2luKTtcbiAgICAgICAgICAgICAgICAgICAgZWRnZXMuZm9yRWFjaCggZWRnZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBncmFwaFtlZGdlXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWYgaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYoICF0YXJnZXQgKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkIG91dGdvaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLmRlcGVuZGVuY2llcy5wdXNoKCB0YXJnZXQgKTtcbiAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhZGQgaW5nb2luZ1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LmRlcGVuZGVudHMucHVzaChub2RlKTtcblxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHJldHVybiBncmFwaDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gV2UgbmVlZCBhIGRpY3Rpb25hcnkgd2hlcmUgdGhlIG5hbWVzIG1hdGNoIHRoZSBuYW1lcyBpbiB0aGUgcG9pbnRlcnNcbiAgICAgICAgICAgIC8vIHdoZXJlIHRoZSBwb2ludGVycyBhcmUgdGhlIHJlZmVyZW5jZXMgdG8gb3VyIG9iamN0LlxuICAgICAgICAgICAgY29uc3QgZGljdDogUmVjb3JkPHN0cmluZywgSURlcml2ZWRTdGF0PFQ+PiA9IHt9O1xuICAgICAgICAgICAgZm9yIChsZXQgYyA9IDA7IGMgPCBkYXRhLmxlbmd0aDsgYysrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IGRhdGFbY107XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgcyA9IDA7IHMgPCBjb2xsZWN0aW9uLmRhdGEubGVuZ3RoOyBzKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdCA9IGNvbGxlY3Rpb24uZGF0YVtzXTtcbiAgICAgICAgICAgICAgICAgICAgZGljdFtgZGVyaXZlZC4ke2NvbGxlY3Rpb24ubmFtZX0uJHtzdGF0Lm5hbWV9YF1cdD0gc3RhdDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZ3JhcGg6IFJlY29yZDxzdHJpbmcsZGVwZW5kZW5jeU5vZGU+ICA9IGNyZWF0ZUdyYXBoKGRhdGEsZGljdCk7XG4gICAgICAgICovXG4gICAgICAgIGlmIChzdHJvbmdDb21wb25lbnRzID09PSB2b2lkIDApIHsgc3Ryb25nQ29tcG9uZW50cyA9IHt9OyB9XG4gICAgICAgIC8vICAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tICAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLVxuICAgICAgICAvLyBUYXJqYW5zIEFsZ29yaXRobVxuICAgICAgICAvLyAgLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAgLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS1cbiAgICAgICAgLy8gd2UgdXNlIHRhcmphbnMgYWxnb3JpdGhtIHRvIGNvdW50IGlzbGFuZHMuIGxvb2sgZm9yIGN5Y2xpYyBkZXBlbmRlbmNpZXMgKCBpbiB3aWNoIGNhc2UsIHdlIEVSUk9SIClcbiAgICAgICAgLy8gYW5kIGZvciB0aGlzLCB3ZWUgbmVlZCB0byBwcmVwYXJlIGEgcXVlLiB3ZSBhcmUgZ29pbmcgdG8gdXNlIGEgY29weSBvZiB0aGUgbm9kZSBjb2xsZWN0aW9uIHdlIGhhdmUuXG4gICAgICAgIHZhciBxdWUgPSBbXTtcbiAgICAgICAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgcXVlLnB1c2gobm9kZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgYWxnTGV2ZWwgPSBHcm9iQWxnb3JpdGhtcy5hbGdMZXZlbCsrO1xuICAgICAgICB2YXIgY291bnRlciA9IDA7XG4gICAgICAgIC8vbGV0IGN5Y2xpY0NvdW50ZXIgPSAwO1xuICAgICAgICAvL2xldCBpc2xhbmRzIDogR3JvYk5vZGVbXVtdID0gW107XG4gICAgICAgIC8vbGV0IHRyYWNrZXIgPSBuZXcgIE5hbWVWYWx1ZVRyYWNrZXI8R3JvYk5vZGU+KCk7IFxuICAgICAgICB2YXIgc3RhY2sgPSBbXTtcbiAgICAgICAgLy8gV2UgY3JlYXRlIG91ciBzdGFjaywgYSBsaXN0IG9mIGFsbCBub2RlcyB3aGVyZSBldmVyeSBub2RlIGhhcyBhIGxpbmsgYW5kIExvd0xpbmsgdmFsdWUuXG4gICAgICAgIC8vIEJGUyBTZWFyY2hpbmcgdG8gYXNpZ24gbGluayB2YWx1ZXM7XG4gICAgICAgIHdoaWxlIChxdWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdmFyIGN1cnIgPSBxdWUucG9wKCk7XG4gICAgICAgICAgICBpZiAoY3Vyci50YXJqYW5BbGdvcml0aG1BbGdvcml0aG1JbmRleCAhPSBhbGdMZXZlbCkge1xuICAgICAgICAgICAgICAgIGN1cnIubGlua1ZhbHVlID0gY291bnRlcisrO1xuICAgICAgICAgICAgICAgIGN1cnIuTG93TGlua1ZhbHVlID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVI7XG4gICAgICAgICAgICAgICAgY3Vyci50YXJqYW5BbGdvcml0aG1BbGdvcml0aG1JbmRleCA9IGFsZ0xldmVsO1xuICAgICAgICAgICAgICAgIHF1ZS5wdXNoLmFwcGx5KHF1ZSwgT2JqZWN0LnZhbHVlcyhjdXJyLmRlcGVuZGVuY2llcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RhY2sucHVzaChjdXJyKTtcbiAgICAgICAgICAgIC8vIGFkZCB0cmFja2luZyBmb3IgdGhpcyBsb2NhdGlvbi4gXG4gICAgICAgICAgICAvL3RyYWNrZXIubmFtZVRvTnVtYmVyKCBjdXJyLmdldExvY2F0aW9uS2V5KCkgLCBjdXJyLkxvd0xpbmtWYWx1ZSAsIGN1cnIgKTtcbiAgICAgICAgfVxuICAgICAgICBxdWUgPSBbXTtcbiAgICAgICAgbm9kZXMuZm9yRWFjaChmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgcXVlLnB1c2gobm9kZSk7XG4gICAgICAgIH0pO1xuICAgICAgICBhbGdMZXZlbCA9IEdyb2JBbGdvcml0aG1zLmFsZ0xldmVsKys7XG4gICAgICAgIHdoaWxlIChxdWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgdmFyIGN1cnIgPSBxdWUucG9wKCk7XG4gICAgICAgICAgICB0YXJqYW5Ob2RlVmlzaXQoYWxnTGV2ZWwsIGN1cnIsIHN0cm9uZ0NvbXBvbmVudHMpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHRhcmphbk5vZGVWaXNpdChhbGdMZXZlbCwgbm9kZSwgc3Ryb25nQ29tcG9uZW50cykge1xuICAgICAgICAgICAgLy8gU3RvcCBUaGUgYWxnb3JpdGhtIGlmIHRoZSBub2RlIGhhcyBhbHJlYWR5IGJlZW4gdmlzaXRlZFxuICAgICAgICAgICAgaWYgKG5vZGUudGFyamFuQWxnb3JpdGhtQWxnb3JpdGhtSW5kZXggPT0gYWxnTGV2ZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbm9kZS5Mb3dMaW5rVmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcXVlID0gT2JqZWN0LnZhbHVlcyhub2RlLmRlcGVuZGVuY2llcyk7XG4gICAgICAgICAgICB2YXIgbG93TGlua1ZhbHVlID0gbm9kZS5Mb3dMaW5rVmFsdWU7XG4gICAgICAgICAgICBub2RlLnRhcmphbkFsZ29yaXRobUFsZ29yaXRobUluZGV4ID0gYWxnTGV2ZWw7XG4gICAgICAgICAgICB3aGlsZSAocXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VyciA9IHF1ZS5wb3AoKTtcbiAgICAgICAgICAgICAgICB2YXIgbG93TGlua0NhbmRpZGF0ZSA9IHRhcmphbk5vZGVWaXNpdChhbGdMZXZlbCwgY3Vyciwgc3Ryb25nQ29tcG9uZW50cyk7XG4gICAgICAgICAgICAgICAgaWYgKGN1cnIuTG93TGlua1ZhbHVlID09IGxvd0xpbmtDYW5kaWRhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgc3Ryb25nQ29tcG9uZW50c1tjdXJyLmdldExvY2F0aW9uS2V5KCldID0gY3VycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY3Vyci5Mb3dMaW5rVmFsdWUgPCBsb3dMaW5rQ2FuZGlkYXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxvd0xpbmtWYWx1ZSA9IGxvd0xpbmtDYW5kaWRhdGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbm9kZS5Mb3dMaW5rVmFsdWUgPSBsb3dMaW5rVmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gbG93TGlua1ZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbT2JqZWN0LmtleXMoc3Ryb25nQ29tcG9uZW50cykubGVuZ3RoID09IDAsIHN0cm9uZ0NvbXBvbmVudHNdO1xuICAgIH07XG4gICAgR3JvYkFsZ29yaXRobXMuYWxnTGV2ZWwgPSAxO1xuICAgIHJldHVybiBHcm9iQWxnb3JpdGhtcztcbn0oKSk7XG5leHBvcnRzLkdyb2JBbGdvcml0aG1zID0gR3JvYkFsZ29yaXRobXM7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuQUdyb2JOb2RlID0gdm9pZCAwO1xudmFyIHRzbGliXzEgPSByZXF1aXJlKFwidHNsaWJcIik7XG52YXIgQUdyYXBoSXRlbV8xID0gcmVxdWlyZShcIi4uL0Fic3RyYWN0aW9ucy9BR3JhcGhJdGVtXCIpO1xudmFyIFRhcmphbk5vZGVfMSA9IHJlcXVpcmUoXCIuL2FsZ29yaXRobS9UYXJqYW5Ob2RlXCIpO1xudmFyIEFHcm9iTm9kZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICB0c2xpYl8xLl9fZXh0ZW5kcyhBR3JvYk5vZGUsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gQUdyb2JOb2RlKG5hbWUsIGtleXN0YXJ0LCBwYXJlbnQpIHtcbiAgICAgICAgdmFyIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgbmFtZSwga2V5c3RhcnQpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLmRlcGVuZGVuY2llcyA9IHt9O1xuICAgICAgICBfdGhpcy5kZXBlbmRlbnRzID0ge307XG4gICAgICAgIF90aGlzLnVwZGF0ZUxpc3RlbmVycyA9IHt9O1xuICAgICAgICBfdGhpcy5ib251c2VzID0ge307XG4gICAgICAgIC8vIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLVxuICAgICAgICAvLyAtLS0gVGFyamFuIEFsZ29yaXRobSBJbXBsZW1lbnRhdGlvbiAtLS0gLS0tIC0tLSAtLS1cbiAgICAgICAgLy8gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tXG4gICAgICAgIF90aGlzLnRhcmphbkFsZ29yaXRobUFsZ29yaXRobUluZGV4ID0gMDtcbiAgICAgICAgX3RoaXMuTG93TGlua1ZhbHVlID0gMDtcbiAgICAgICAgX3RoaXMubGlua1ZhbHVlID0gMDtcbiAgICAgICAgaWYgKHBhcmVudClcbiAgICAgICAgICAgIF90aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBBR3JvYk5vZGUucHJvdG90eXBlLmFkZEJvbnVzID0gZnVuY3Rpb24gKGJvbnVzSW5kZXgsIGJvbnVzLCBlcnJvcnMpIHtcbiAgICAgICAgaWYgKGVycm9ycyA9PT0gdm9pZCAwKSB7IGVycm9ycyA9IFtdOyB9XG4gICAgICAgIGJvbnVzLnVwZGF0ZSgpO1xuICAgICAgICAvLyBmaXJzdCBzZWUgaWYgdGhlcmUgaXMgYSBjaXJjdWxhciBkZXBlbmRlbmN5LCBpZiB0aGVyZSBhbHJlYWR5IGlzIGRvbnQgZG8gYSB0aGluZy4gXG4gICAgICAgIHZhciBwcmVTdHJvbmdDb21wb25lbnRzID0ge307XG4gICAgICAgIHZhciBhbHJlYWR5SGFkU3Ryb25nQ29tcHMgPSBUYXJqYW5Ob2RlXzEuR3JvYkFsZ29yaXRobXMuVGFyakFsZ28oW3RoaXNdLCBwcmVTdHJvbmdDb21wb25lbnRzKTtcbiAgICAgICAgaWYgKGFscmVhZHlIYWRTdHJvbmdDb21wc1swXSkge1xuICAgICAgICAgICAgZXJyb3JzLnB1c2goeyBrZXk6ICdQcmUtQWRkQm9udXNFcnJvcicsIG1zZzogJ3RoaXMgbm9kZSBhbHJlYWR5IGhhZCBjaXJjdWxhciBkZXBlbmRlbmNpZXMsIGJlZm9yZSBhZGRpbmcgYW5vdGhlciBub2RlLiBBZGRlZCBCb251cyBpcyB0aGVyZWZvcmUgcmVmdXNlZCcgfSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYm9udXNlc1tib251c0luZGV4XSkge1xuICAgICAgICAgICAgdGhpcy5yZW1Cb251cyhib251c0luZGV4KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJvbnVzZXNbYm9udXNJbmRleF0gPSBib251cztcbiAgICAgICAgdGhpcy5hZGREZXBlbmRlbmN5KGJvbnVzKTtcbiAgICAgICAgLy8gZmlyc3Qgc2VlIGlmIHRoZXJlIGlzIGEgY2lyY3VsYXIgZGVwZW5kZW5jeSwgaWYgdGhlcmUgYWxyZWFkeSBpcyBkb250IGRvIGEgdGhpbmcuIFxuICAgICAgICB2YXIgU3Ryb25nQ29tcG9uZW50cyA9IHt9O1xuICAgICAgICB2YXIgU3Ryb25nQ29tcHMgPSBUYXJqYW5Ob2RlXzEuR3JvYkFsZ29yaXRobXMuVGFyakFsZ28oW3RoaXNdLCBTdHJvbmdDb21wb25lbnRzKTtcbiAgICAgICAgaWYgKFN0cm9uZ0NvbXBzWzBdKSB7XG4gICAgICAgICAgICBlcnJvcnMucHVzaCh7IGtleTogJ1ByZS1BZGRCb251c0Vycm9yJywgbXNnOiAndGhpcyBub2RlIGFscmVhZHkgaGFkIGNpcmN1bGFyIGRlcGVuZGVuY2llcywgYmVmb3JlIGFkZGluZyBhbm90aGVyIG5vZGUuIEFkZGVkIEJvbnVzIGlzIHRoZXJlZm9yZSByZWZ1c2VkJyB9KTtcbiAgICAgICAgICAgIHRoaXMucmVtQm9udXMoYm9udXNJbmRleCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgICBBR3JvYk5vZGUucHJvdG90eXBlLnJlbUJvbnVzID0gZnVuY3Rpb24gKGJvbnVzSW5kZXgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmJvbnVzZXNbYm9udXNJbmRleF0pXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzLmJvbnVzZXNbYm9udXNJbmRleF07XG4gICAgICAgIGRlbGV0ZSB0aGlzLmJvbnVzZXNbYm9udXNJbmRleF07XG4gICAgICAgIHRoaXMucmVtb3ZlRGVwZW5kZW5jeShub2RlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgICBBR3JvYk5vZGUuZ2V0VHlwZVN0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICdOb2R0ZTxUIGV4dGVuZHMgTm9kdGU8VD4+JztcbiAgICB9O1xuICAgIEFHcm9iTm9kZS5wcm90b3R5cGUuYWRkRGVwZW5kZW50ID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgdmFyIGtleSA9IG5vZGUuZ2V0S2V5KCk7XG4gICAgICAgIGlmICh0aGlzLmRlcGVuZGVudHNba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kZXBlbmRlbnRzW2tleV0gPSBub2RlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICAgIEFHcm9iTm9kZS5wcm90b3R5cGUucmVtb3ZlRGVwZW5kZW50ID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuZGVwZW5kZW50c1tub2RlLmdldEtleSgpXTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVwZW5kZW50c1tub2RlLmdldEtleSgpXSA9PSBudWxsO1xuICAgIH07XG4gICAgQUdyb2JOb2RlLnByb3RvdHlwZS5nZXREZXBlbmRlbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIC8vQHRzLWlnbm9yZVxuICAgICAgICByZXR1cm4gKF9hID0gT2JqZWN0LnZhbHVlcyh0aGlzLmRlcGVuZGVudHMpKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBbXTtcbiAgICB9O1xuICAgIEFHcm9iTm9kZS5wcm90b3R5cGUuYWRkRGVwZW5kZW5jeSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICAgIEFHcm9iTm9kZS5wcm90b3R5cGUucmVtb3ZlRGVwZW5kZW5jeSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICAgIEFHcm9iTm9kZS5wcm90b3R5cGUubnVsbGlmeURlcGVuZGVuY3kgPSBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgICBBR3JvYk5vZGUucHJvdG90eXBlLmdldERlcGVuZGVuY2llcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIChfYSA9IE9iamVjdC52YWx1ZXModGhpcy5kZXBlbmRlbmNpZXMpKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBbXTtcbiAgICB9O1xuICAgIEFHcm9iTm9kZS5wcm90b3R5cGUuZ2V0VmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpbml0aWFsVmFsdWUgPSB0aGlzLl9nZXRWYWx1ZSgpO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5ib251c2VzKSB7XG4gICAgICAgICAgICB2YXIgYm9udXMgPSB0aGlzLmJvbnVzZXNba2V5XTtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGJvbnVzLl9nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgaW5pdGlhbFZhbHVlICs9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbml0aWFsVmFsdWU7XG4gICAgfTtcbiAgICBBR3JvYk5vZGUucHJvdG90eXBlLmdldExvY2F0aW9uS2V5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VncyA9IHRoaXMuZ2V0TG9jYXRpb25LZXlTZWdtZW50cygpO1xuICAgICAgICByZXR1cm4gc2Vncy5qb2luKCcuJyk7XG4gICAgfTtcbiAgICBBR3JvYk5vZGUucHJvdG90eXBlLmdldExvY2F0aW9uS2V5U2VnbWVudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfYSwgX2IsIF9jLCBfZCwgX2UsIF9mO1xuICAgICAgICB2YXIgc2VnID0gWycnLCAnJywgJyddO1xuICAgICAgICBzZWdbMF0gPSAoX2MgPSAoX2IgPSAoX2EgPSB0aGlzLnBhcmVudCkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnBhcmVudCkgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmdldE5hbWUoKSkgIT09IG51bGwgJiYgX2MgIT09IHZvaWQgMCA/IF9jIDogJ3Vua25vd24nO1xuICAgICAgICBzZWdbMV0gPSAoX2UgPSAoX2QgPSB0aGlzLnBhcmVudCkgPT09IG51bGwgfHwgX2QgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9kLmdldE5hbWUoKSkgIT09IG51bGwgJiYgX2UgIT09IHZvaWQgMCA/IF9lIDogJ3Vua25vd24nO1xuICAgICAgICBzZWdbMl0gPSAoX2YgPSB0aGlzLmdldE5hbWUoKSkgIT09IG51bGwgJiYgX2YgIT09IHZvaWQgMCA/IF9mIDogJ3Vua25vd24nO1xuICAgICAgICByZXR1cm4gc2VnO1xuICAgIH07XG4gICAgQUdyb2JOb2RlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuX3VwZGF0ZSgpO1xuICAgICAgICAoT2JqZWN0LmtleXModGhpcy51cGRhdGVMaXN0ZW5lcnMpKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIF90aGlzLnVwZGF0ZUxpc3RlbmVyc1trZXldKCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICAgIEFHcm9iTm9kZS5wcm90b3R5cGUuZGlzcG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gZGVsZXRlIHJlZmVyZW5jZXMgYWxsIFxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5kZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgICAgIHZhciBjdXJyID0gdGhpcy5kZXBlbmRlbmNpZXNba2V5XTtcbiAgICAgICAgICAgIGN1cnIucmVtb3ZlRGVwZW5kZW50KHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmRlcGVuZGVudHMpIHtcbiAgICAgICAgICAgIHZhciBjdXJyID0gdGhpcy5kZXBlbmRlbnRzW2tleV07XG4gICAgICAgICAgICBjdXJyLm51bGxpZnlEZXBlbmRlbmN5KHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIC8vQHRzLWlnbm9yZVxuICAgICAgICB0aGlzLnBhcmVudCA9IG51bGw7XG4gICAgICAgIC8vQHRzLWlnbm9yZVxuICAgICAgICB0aGlzLm5hbWUgPSBudWxsO1xuICAgIH07XG4gICAgQUdyb2JOb2RlLnByb3RvdHlwZS5zZXROYW1lID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgdmFyIG9sZG5hbWUgPSB0aGlzLmdldE5hbWUoKTtcbiAgICAgICAgX3N1cGVyLnByb3RvdHlwZS5zZXROYW1lLmNhbGwodGhpcywgbmFtZSk7XG4gICAgICAgIHRoaXMucGFyZW50LnVwZGF0ZV9ub2RlX25hbWUob2xkbmFtZSwgbmFtZSk7XG4gICAgICAgIHRoaXMudXBkYXRlTG9jYXRpb24odGhpcy5wYXJlbnQpO1xuICAgIH07XG4gICAgLyogYnkgbG9jYXRpb24gd2UgbWVhbiB0aGlzIGl0ZW1zIGdyb3VwIC0gY29sbGVjdGlvbiAtIG5vZGUga2V5LiAgKi9cbiAgICBBR3JvYk5vZGUucHJvdG90eXBlLnVwZGF0ZUxvY2F0aW9uID0gZnVuY3Rpb24gKHBhcmVudCkge1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIHRoaXMuZGVwZW5kZW50cykge1xuICAgICAgICAgICAgdmFyIGRlcCA9IHRoaXMuZGVwZW5kZW50c1trZXldO1xuICAgICAgICAgICAgZGVwLnVwZGF0ZURlcGVuZGVjeXNMb2NhdGlvbih0aGlzKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgQUdyb2JOb2RlLnByb3RvdHlwZS51cGRhdGVEZXBlbmRlY3lzTG9jYXRpb24gPSBmdW5jdGlvbiAoZGVwZW5kZW5jeSkge1xuICAgIH07XG4gICAgQUdyb2JOb2RlLnByb3RvdHlwZS5pc1ZhbGlkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICAgIC8vIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLVxuICAgIC8vIC1Gb3IgaW5kZXBlbmRlbnQgVUkgaW1wbGVtZW50YXRpb24ncyB0byBoYXZlIHNvZW10aGluZyB0byBhdHRhY2ggYSBub2RlJ3MgdXBkYXRlIHRvLiBcbiAgICAvLyAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS1cbiAgICBBR3JvYk5vZGUucHJvdG90eXBlLmFkZFVwZGF0ZUxpc3RlbmVyID0gZnVuY3Rpb24gKGtleSwgbGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKHRoaXMudXBkYXRlTGlzdGVuZXJzW2tleV0gIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCd0cmllZCB0byBhZGQgdXBkYXRlbGlzdGVuZXIgdG8gbm9kZSB3aXRoIGtleTonICsga2V5ICsgJy4gYnV0IHRoZXJlIHdhcyBhbHJlYWR5IGEgbGlzdGVuZXIgdXNpbmcgdGhhdCBrZXknKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZUxpc3RlbmVyc1trZXldID0gbGlzdGVuZXI7XG4gICAgfTtcbiAgICBBR3JvYk5vZGUucHJvdG90eXBlLnJlbW92ZVVwZGF0ZUxpc3RlbmVyID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBkZWxldGUgdGhpcy51cGRhdGVMaXN0ZW5lcnNba2V5XTtcbiAgICB9O1xuICAgIEFHcm9iTm9kZS5wcm90b3R5cGUucmVtb3ZlQWxsVXBkYXRlTGlzdGVuZXJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnVwZGF0ZUxpc3RlbmVycyA9IHt9O1xuICAgIH07XG4gICAgcmV0dXJuIEFHcm9iTm9kZTtcbn0oQUdyYXBoSXRlbV8xLkFHcmFwaEl0ZW0pKTtcbmV4cG9ydHMuQUdyb2JOb2RlID0gQUdyb2JOb2RlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmdyb2JEZXJpdmVkU3ltYm9sUmVnZXggPSB2b2lkIDA7XG5leHBvcnRzLmdyb2JEZXJpdmVkU3ltYm9sUmVnZXggPSAvQFthLXpBLVpdL2c7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuR3JvYk9yaWdpbiA9IHZvaWQgMDtcbnZhciBHcm9iT3JpZ2luID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEdyb2JPcmlnaW4oKSB7XG4gICAgICAgIHRoaXMuc3RhbmRhcmRWYWx1ZSA9IDE7XG4gICAgfVxuICAgIEdyb2JPcmlnaW4uVW5rb3duTG9jYXRpb25LZXkgPSAndW5rbm93bi51bmtub3duLnVua25vd24nO1xuICAgIHJldHVybiBHcm9iT3JpZ2luO1xufSgpKTtcbmV4cG9ydHMuR3JvYk9yaWdpbiA9IEdyb2JPcmlnaW47XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuR3JvYkRlcml2ZWROb2RlID0gdm9pZCAwO1xudmFyIHRzbGliXzEgPSByZXF1aXJlKFwidHNsaWJcIik7XG52YXIgQUdyb2JOb2R0ZV8xID0gcmVxdWlyZShcIi4vQUdyb2JOb2R0ZVwiKTtcbnZhciBUVFJQR1N5c3RlbXNHcmFwaERlcGVuZGVuY2llc18xID0gcmVxdWlyZShcIi4uL0dyYXBoL1RUUlBHU3lzdGVtc0dyYXBoRGVwZW5kZW5jaWVzXCIpO1xudmFyIEdyb2JPcmlnaW5fMSA9IHJlcXVpcmUoXCIuL0dyb2JPcmlnaW5cIik7XG52YXIgR3JvYkRlcml2ZWROb2RlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIHRzbGliXzEuX19leHRlbmRzKEdyb2JEZXJpdmVkTm9kZSwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBHcm9iRGVyaXZlZE5vZGUobmFtZSwgcGFyZW50KSB7XG4gICAgICAgIHZhciBfdGhpcyA9IF9zdXBlci5jYWxsKHRoaXMsIG5hbWUsICdORCcsIHBhcmVudCkgfHwgdGhpcztcbiAgICAgICAgX3RoaXMuY2FsYyA9ICdAYSc7XG4gICAgICAgIF90aGlzLm9yaWdpbnMgPSBbXTtcbiAgICAgICAgX3RoaXMuX3ZhbHVlID0gTmFOO1xuICAgICAgICByZXR1cm4gX3RoaXM7XG4gICAgfVxuICAgIEdyb2JEZXJpdmVkTm9kZS5wcm90b3R5cGUuX2dldFZhbHVlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gICAgfTtcbiAgICBHcm9iRGVyaXZlZE5vZGUucHJvdG90eXBlLnNldFZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgfTtcbiAgICBHcm9iRGVyaXZlZE5vZGUuZ2V0VHlwZVN0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuICdkZXJpdmVkTm9kZSc7XG4gICAgfTtcbiAgICBHcm9iRGVyaXZlZE5vZGUucHJvdG90eXBlLmdldFR5cGVTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBHcm9iRGVyaXZlZE5vZGUuZ2V0VHlwZVN0cmluZygpO1xuICAgIH07XG4gICAgR3JvYkRlcml2ZWROb2RlLnByb3RvdHlwZS5hZGREZXBlbmRlbmN5ID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgdmFyIGtleSA9IG5vZGUuZ2V0S2V5KCk7XG4gICAgICAgIHRoaXMuZGVwZW5kZW5jaWVzW2tleV0gPSBub2RlO1xuICAgICAgICBub2RlLmFkZERlcGVuZGVudCh0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgICBHcm9iRGVyaXZlZE5vZGUucHJvdG90eXBlLnJlbW92ZURlcGVuZGVuY3kgPSBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAvLyBkZWxldGUgdGhlIGRlcGVuZGVuY3lcbiAgICAgICAgdmFyIGtleSA9IG5vZGUuZ2V0S2V5KCk7XG4gICAgICAgIGlmICh0aGlzLmRlcGVuZGVuY2llc1trZXldKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5kZXBlbmRlbmNpZXNba2V5XTtcbiAgICAgICAgICAgIG5vZGUucmVtb3ZlRGVwZW5kZW50KHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJlbW92ZSBvcmlnaW4gZGVwZW5kZW5jeSBcbiAgICAgICAgLy8gd2UgZmluZCB0aGUgb3JpZ2luLCB3aXRoIHRoZSBrZXkgdmFsdWUsIGFuZCByZW1vdmUgaXQuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vcmlnaW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgb3JpZyA9IHRoaXMub3JpZ2luc1tpXTtcbiAgICAgICAgICAgIGlmIChvcmlnLm9yaWdpbiAhPSBudWxsICYmIG9yaWcub3JpZ2luLmdldEtleSgpID09IGtleSkge1xuICAgICAgICAgICAgICAgIG9yaWcub3JpZ2luID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5kZXBlbmRlbmNpZXNba2V5XSA9PSBudWxsO1xuICAgIH07XG4gICAgR3JvYkRlcml2ZWROb2RlLnByb3RvdHlwZS5udWxsaWZ5RGVwZW5kZW5jeSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIC8vIGZpcnN0IEVtcHR5IHRoZSBvcmlnaW4uXG4gICAgICAgIHZhciBrZXkgPSBub2RlLmdldEtleSgpO1xuICAgICAgICB2YXIgb3JpZyA9IHRoaXMub3JpZ2lucy5maW5kKGZ1bmN0aW9uIChwKSB7IHZhciBfYTsgcmV0dXJuICgoX2EgPSBwLm9yaWdpbikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmdldEtleSgpKSA9PSBrZXk7IH0pO1xuICAgICAgICBpZiAob3JpZykge1xuICAgICAgICAgICAgb3JpZy5vcmlnaW4gPSBudWxsO1xuICAgICAgICAgICAgb3JpZy5vcmlnaW5LZXkgPSBHcm9iT3JpZ2luXzEuR3JvYk9yaWdpbi5Vbmtvd25Mb2NhdGlvbktleTtcbiAgICAgICAgfVxuICAgICAgICAvLyB0aGVuIG51bGlmeSB0aGUgZGVwZW5kZW5jeVxuICAgICAgICByZXR1cm4gdGhpcy5yZW1vdmVEZXBlbmRlbmN5KG5vZGUpO1xuICAgIH07XG4gICAgR3JvYkRlcml2ZWROb2RlLnByb3RvdHlwZS5zZXRPcmlnaW4gPSBmdW5jdGlvbiAoc3ltYm9sLCBub2RlLCBzdGFuZGFyZFZhbHVlKSB7XG4gICAgICAgIHZhciBfYSwgX2I7XG4gICAgICAgIGlmIChzdGFuZGFyZFZhbHVlID09PSB2b2lkIDApIHsgc3RhbmRhcmRWYWx1ZSA9IG51bGw7IH1cbiAgICAgICAgdmFyIG9yaWdpbiA9IHRoaXMub3JpZ2lucy5maW5kKGZ1bmN0aW9uIChwKSB7IHJldHVybiBwLnN5bWJvbCA9PSBzeW1ib2w7IH0pO1xuICAgICAgICBpZiAoIW9yaWdpbikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcmlnaW4ub3JpZ2luKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZURlcGVuZGVuY3kob3JpZ2luLm9yaWdpbik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZW5zdXJlIHRoYXQgdGhpcyBpcyB0aGUgcmlnaHQgdHlwZSBvZiBvYmplY3QuXG4gICAgICAgIHZhciBub2RlS2V5ID0gKF9hID0gbm9kZSA9PT0gbnVsbCB8fCBub2RlID09PSB2b2lkIDAgPyB2b2lkIDAgOiBub2RlLmdldFR5cGVTdHJpbmcoKSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogJyc7XG4gICAgICAgIGlmICghWydkZXJpdmVkTm9kZScsICdmaXhlZE5vZGUnXS5maW5kKGZ1bmN0aW9uIChwKSB7IHJldHVybiBwID09IG5vZGVLZXk7IH0pKSB7XG4gICAgICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgICAgIG5vZGUgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgICB0aGlzLmFkZERlcGVuZGVuY3kobm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgb3JpZ2luLm9yaWdpbiA9IG5vZGU7XG4gICAgICAgIG9yaWdpbi5zdGFuZGFyZFZhbHVlID0gKF9iID0gKHN0YW5kYXJkVmFsdWUgIT09IG51bGwgJiYgc3RhbmRhcmRWYWx1ZSAhPT0gdm9pZCAwID8gc3RhbmRhcmRWYWx1ZSA6IG9yaWdpbi5zdGFuZGFyZFZhbHVlKSkgIT09IG51bGwgJiYgX2IgIT09IHZvaWQgMCA/IF9iIDogMTtcbiAgICAgICAgaWYgKG9yaWdpbi5vcmlnaW4pXG4gICAgICAgICAgICBvcmlnaW4ub3JpZ2luS2V5ID0gb3JpZ2luLm9yaWdpbi5nZXRMb2NhdGlvbktleSgpO1xuICAgICAgICBpZiAodGhpcy5pc1ZhbGlkKCkpIHtcbiAgICAgICAgICAgIHRoaXMucmVjYWxjdWxhdGUoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG4gICAgR3JvYkRlcml2ZWROb2RlLnByb3RvdHlwZS5pc1ZhbGlkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaGFkTnVsbE9yaWdpbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLm9yaWdpbnMuZm9yRWFjaChmdW5jdGlvbiAobykge1xuICAgICAgICAgICAgaWYgKCFvLm9yaWdpbikge1xuICAgICAgICAgICAgICAgIGhhZE51bGxPcmlnaW4gPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGhhZE51bGxPcmlnaW4pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgb3JpZ2luc1dpdGhMaW5rcyA9IHRoaXMub3JpZ2lucy5maWx0ZXIoZnVuY3Rpb24gKHApIHsgcmV0dXJuIHAub3JpZ2luICE9IG51bGw7IH0pO1xuICAgICAgICBpZiAob3JpZ2luc1dpdGhMaW5rcy5sZW5ndGggIT0gdGhpcy5nZXREZXBlbmRlbmNpZXMoKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuICAgIEdyb2JEZXJpdmVkTm9kZS5wcm90b3R5cGUudXBkYXRlT3JpZ2lucyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG9yaWdpblJlcyA9IHRoaXMucGFyc2VDYWxjdWxhdGlvblRvT3JpZ2lucyh0aGlzLmNhbGMpO1xuICAgICAgICBpZiAob3JpZ2luUmVzKSB7XG4gICAgICAgICAgICB2YXIgc3ltYm9sc1RvUmVtXzEgPSBvcmlnaW5SZXMuc3ltYm9sc1RvUmVtO1xuICAgICAgICAgICAgdmFyIHN5bWJvbHNUb0FkZCA9IG9yaWdpblJlcy5zeW1ib2xzVG9BZGQ7XG4gICAgICAgICAgICAvLyByZW1vdmUgc3ltYm9scyBcbiAgICAgICAgICAgIGlmIChzeW1ib2xzVG9SZW1fMS5sZW5ndGggIT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMub3JpZ2lucyA9IHRoaXMub3JpZ2lucy5maWx0ZXIoZnVuY3Rpb24gKHApIHsgcmV0dXJuICFzeW1ib2xzVG9SZW1fMS5pbmNsdWRlcyhwLnN5bWJvbCk7IH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gYWRkIGl0ZW1zIGlmIHRoZXJlIGlzIGFueXRoaW5nIHRvIGFkZC4gIFxuICAgICAgICAgICAgaWYgKHN5bWJvbHNUb0FkZC5sZW5ndGggIT0gMCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3ltYm9sc1RvQWRkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvcmlnID0gbmV3IEdyb2JPcmlnaW5fMS5Hcm9iT3JpZ2luKCk7XG4gICAgICAgICAgICAgICAgICAgIG9yaWcuc3ltYm9sID0gc3ltYm9sc1RvQWRkW2ldO1xuICAgICAgICAgICAgICAgICAgICBvcmlnLnN0YW5kYXJkVmFsdWUgPSAxO1xuICAgICAgICAgICAgICAgICAgICBvcmlnLm9yaWdpbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIG9yaWcub3JpZ2luS2V5ID0gR3JvYk9yaWdpbl8xLkdyb2JPcmlnaW4uVW5rb3duTG9jYXRpb25LZXk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3JpZ2lucy5wdXNoKG9yaWcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGhhbmRsZSBEZXBlbmRlbmNpZXMgXG4gICAgICAgICAgICB2YXIgb2xkRGVwZW5kZW5jaWVzXzEgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuZ2V0RGVwZW5kZW5jaWVzKCkuZm9yRWFjaChmdW5jdGlvbiAocCkgeyByZXR1cm4gb2xkRGVwZW5kZW5jaWVzXzFbcC5nZXROYW1lKCldID0gcDsgfSk7XG4gICAgICAgICAgICB2YXIgbmV3RGVwZW5kZW5jaWVzXzEgPSB7fTtcbiAgICAgICAgICAgIHRoaXMub3JpZ2lucy5mb3JFYWNoKGZ1bmN0aW9uIChwKSB7IHZhciBfYTsgaWYgKHAub3JpZ2luICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBuZXdEZXBlbmRlbmNpZXNfMVsoX2EgPSBwLm9yaWdpbikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmdldE5hbWUoKV0gPSBwLm9yaWdpbjtcbiAgICAgICAgICAgIH0gfSk7XG4gICAgICAgICAgICAvLyByZW1vdmUgb2xkIERlcGVuZGVuY2llcyBcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBvbGREZXBlbmRlbmNpZXNfMSkge1xuICAgICAgICAgICAgICAgIGlmICghbmV3RGVwZW5kZW5jaWVzXzFba2V5XSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZURlcGVuZGVuY3kob2xkRGVwZW5kZW5jaWVzXzFba2V5XSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsgYWRkZWQ6IHN5bWJvbHNUb0FkZCwgcmVtb3ZlZDogc3ltYm9sc1RvUmVtXzEubGVuZ3RoIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4geyBhZGRlZDogMCwgcmVtb3ZlZDogMCB9O1xuICAgICAgICB9XG4gICAgfTtcbiAgICBHcm9iRGVyaXZlZE5vZGUucHJvdG90eXBlLnNldENhbGMgPSBmdW5jdGlvbiAoY2FsYywgdXBkYXRlT3JpZ2lucykge1xuICAgICAgICBpZiAodXBkYXRlT3JpZ2lucyA9PT0gdm9pZCAwKSB7IHVwZGF0ZU9yaWdpbnMgPSB0cnVlOyB9XG4gICAgICAgIC8vIHJlc2V0IFRoaXMnIFZhbHVlO1xuICAgICAgICB0aGlzLl92YWx1ZSA9IE5hTjtcbiAgICAgICAgLy8gdGVzdCBpZiBpdCBpcyBjYWxjdWxhdGVhYmxlXG4gICAgICAgIHZhciB0ZXN0Q2FsYyA9IHRoaXMudGVzdENhbGN1bGF0ZShjYWxjKTtcbiAgICAgICAgaWYgKHRlc3RDYWxjID09IG51bGwgfHwgIXRlc3RDYWxjLnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbGMgPSBjYWxjO1xuICAgICAgICAvLyB1cGRhdGUgb3JpZ2lucy5cbiAgICAgICAgaWYgKHVwZGF0ZU9yaWdpbnMpIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlT3JpZ2lucygpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgdGhpcy5yZWNhbGN1bGF0ZShmYWxzZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBQYXJzZXMgY2FsY3VsYXRpb24gVG8gYSBOdW1iZXIgb2YgT3JpZ2lucy5cbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIEdyb2JEZXJpdmVkTm9kZS5wcm90b3R5cGUucGFyc2VDYWxjdWxhdGlvblRvT3JpZ2lucyA9IGZ1bmN0aW9uIChjYWxjKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgdmFyIGNhbGNWYWx1ZSA9IGNhbGM7XG4gICAgICAgIC8vIGdldCBzeW1ib2xzIGZyb20gdGhlIGNhbGMuIGFuZCB0dXJuIGl0IGludG8gYW4gYXJyYXkuIGltcG9ydGFudCwgdGhlIGFycmF5IGlzIGFuIGFycmF5IG9mIHVuaXF1ZSBrZXlzLlxuICAgICAgICB2YXIgc3ltYm9scyA9IChfYSA9IGNhbGNWYWx1ZS5tYXRjaChUVFJQR1N5c3RlbXNHcmFwaERlcGVuZGVuY2llc18xLmdyb2JEZXJpdmVkU3ltYm9sUmVnZXgpKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBbXTtcbiAgICAgICAgc3ltYm9scyA9IEFycmF5LmZyb20obmV3IFNldChzeW1ib2xzKSk7XG4gICAgICAgIC8vIGdldCB0aGUga2V5cyB0aGF0IGFyZSBhbHJlYWR5IHRoZXJlLlxuICAgICAgICB2YXIgZXhpc3RpbmdLZXlzQXJyYXkgPSB0aGlzLm9yaWdpbnMubWFwKGZ1bmN0aW9uIChwKSB7IHJldHVybiBwLnN5bWJvbDsgfSk7XG4gICAgICAgIC8vIGdldCBhIGxpc3Qgb2Ygc3ltYm9scyB0byBhZGQgYW5kIHJlbW92ZS5cbiAgICAgICAgdmFyIHN5bWJvbHNUb0FkZCA9IHN5bWJvbHMuZmlsdGVyKGZ1bmN0aW9uIChwKSB7IHJldHVybiAhZXhpc3RpbmdLZXlzQXJyYXkuaW5jbHVkZXMocCk7IH0pO1xuICAgICAgICB2YXIgc3ltYm9sc1RvUmVtID0gZXhpc3RpbmdLZXlzQXJyYXkuZmlsdGVyKGZ1bmN0aW9uIChwKSB7IHJldHVybiAhc3ltYm9scy5pbmNsdWRlcyhwKTsgfSk7XG4gICAgICAgIHJldHVybiB7IHN5bWJvbHNUb1JlbTogc3ltYm9sc1RvUmVtLCBzeW1ib2xzVG9BZGQ6IHN5bWJvbHNUb0FkZCwgdG90YWxTeW1ib2xzOiBzeW1ib2xzIH07XG4gICAgfTtcbiAgICBHcm9iRGVyaXZlZE5vZGUuc3RhdGljUGFyc2VDYWxjdWxhdGlvblRvT3JpZ2lucyA9IGZ1bmN0aW9uIChjYWxjKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgdmFyIGNhbGNWYWx1ZSA9IGNhbGM7XG4gICAgICAgIC8vIGdldCBzeW1ib2xzIGZyb20gdGhlIGNhbGMuIGFuZCB0dXJuIGl0IGludG8gYW4gYXJyYXkuIGltcG9ydGFudCwgdGhlIGFycmF5IGlzIGFuIGFycmF5IG9mIHVuaXF1ZSBrZXlzLlxuICAgICAgICB2YXIgc3ltYm9scyA9IChfYSA9IGNhbGNWYWx1ZS5tYXRjaChUVFJQR1N5c3RlbXNHcmFwaERlcGVuZGVuY2llc18xLmdyb2JEZXJpdmVkU3ltYm9sUmVnZXgpKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBbXTtcbiAgICAgICAgc3ltYm9scyA9IEFycmF5LmZyb20obmV3IFNldChzeW1ib2xzKSk7XG4gICAgICAgIHJldHVybiBzeW1ib2xzO1xuICAgIH07XG4gICAgR3JvYkRlcml2ZWROb2RlLnByb3RvdHlwZS5yZWNhbGN1bGF0ZSA9IGZ1bmN0aW9uICh1c2VUZW1wVmFsdWVzKSB7XG4gICAgICAgIGlmICh1c2VUZW1wVmFsdWVzID09PSB2b2lkIDApIHsgdXNlVGVtcFZhbHVlcyA9IGZhbHNlOyB9XG4gICAgICAgIC8vY29uc3Qgc3ltYm9scyA9IHRoaXMuY2FsYy5tYXRjaCggZ3JvYkRlcml2ZWRTeW1ib2xSZWdleCApOyAgXG4gICAgICAgIHZhciByZWMgPSB1c2VUZW1wVmFsdWVzID9cbiAgICAgICAgICAgIE9iamVjdC5mcm9tRW50cmllcyh0aGlzLm9yaWdpbnMubWFwKGZ1bmN0aW9uIChwKSB7IHJldHVybiBbcC5zeW1ib2wsIHAuc3RhbmRhcmRWYWx1ZV07IH0pKSA6XG4gICAgICAgICAgICBPYmplY3QuZnJvbUVudHJpZXModGhpcy5vcmlnaW5zLm1hcChmdW5jdGlvbiAocCkgeyB2YXIgX2E7IHJldHVybiBbcC5zeW1ib2wsIChfYSA9IHAub3JpZ2luKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuZ2V0VmFsdWUoKV07IH0pKTtcbiAgICAgICAgdmFyIHN0YXRlbWVudCA9IHRoaXMuY2FsYztcbiAgICAgICAgdmFyIHJlcyA9IHRoaXMuX3JlY2FsY3VsYXRlKHJlYywgc3RhdGVtZW50KTtcbiAgICAgICAgdGhpcy5fdmFsdWUgPSByZXMudmFsdWU7XG4gICAgICAgIHJldHVybiByZXMuc3VjY2VzcztcbiAgICB9O1xuICAgIEdyb2JEZXJpdmVkTm9kZS5wcm90b3R5cGUuX3JlY2FsY3VsYXRlID0gZnVuY3Rpb24gKHJlYywgc3RhdGVtZW50KSB7XG4gICAgICAgIGlmIChyZWMgPT09IHZvaWQgMCkgeyByZWMgPSB7fTsgfVxuICAgICAgICByZXR1cm4gR3JvYkRlcml2ZWROb2RlLnJlY2FsY3VsYXRlKHJlYywgc3RhdGVtZW50KTtcbiAgICB9O1xuICAgIEdyb2JEZXJpdmVkTm9kZS5yZWNhbGN1bGF0ZSA9IGZ1bmN0aW9uIChyZWMsIHN0YXRlbWVudCkge1xuICAgICAgICBpZiAocmVjID09PSB2b2lkIDApIHsgcmVjID0ge307IH1cbiAgICAgICAgdmFyIHN5bWJvbHMgPSBzdGF0ZW1lbnQubWF0Y2goVFRSUEdTeXN0ZW1zR3JhcGhEZXBlbmRlbmNpZXNfMS5ncm9iRGVyaXZlZFN5bWJvbFJlZ2V4KTtcbiAgICAgICAgLy9sZXQgcmVjID0gXG4gICAgICAgIC8vXHR1c2VUZW1wVmFsdWVzID9cbiAgICAgICAgLy9cdE9iamVjdC5mcm9tRW50cmllcyggb3JpZ2lucy5tYXAocCA9PiBbIHAuc3ltYm9sLCBwLnN0YW5kYXJkVmFsdWVdKSk6XHRcbiAgICAgICAgLy9cdE9iamVjdC5mcm9tRW50cmllcyggb3JpZ2lucy5tYXAocCA9PiBbIHAuc3ltYm9sLCBwLm9yaWdpbj8uZ2V0VmFsdWUoKSBdKSk7XG4gICAgICAgIHZhciBfc3RhdGVtZW50ID0gc3RhdGVtZW50O1xuICAgICAgICBzeW1ib2xzID09PSBudWxsIHx8IHN5bWJvbHMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHN5bWJvbHMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICB2YXIgdiA9IHJlY1trZXldO1xuICAgICAgICAgICAgX3N0YXRlbWVudCA9IF9zdGF0ZW1lbnQucmVwbGFjZShrZXksIHYgKyBcIlwiKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciByZWNhbGNTdWNjZXNzID0gZmFsc2U7XG4gICAgICAgIHZhciB2YWx1ZSA9IDA7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgcmVzID0gZXZhbChfc3RhdGVtZW50KTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcmVzID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIHJlY2FsY1N1Y2Nlc3MgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHZhbHVlID0gcmVzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVjYWxjU3VjY2VzcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHZhbHVlID0gTmFOO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICByZWNhbGNTdWNjZXNzID0gZmFsc2U7XG4gICAgICAgICAgICB2YWx1ZSA9IE5hTjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiByZWNhbGNTdWNjZXNzLCB2YWx1ZTogdmFsdWUgfTtcbiAgICB9O1xuICAgIEdyb2JEZXJpdmVkTm9kZS5wcm90b3R5cGUudGVzdENhbGN1bGF0ZSA9IGZ1bmN0aW9uIChzdGF0ZW1lbnQpIHtcbiAgICAgICAgdmFyIHN5bWJvbHMgPSBzdGF0ZW1lbnQubWF0Y2goVFRSUEdTeXN0ZW1zR3JhcGhEZXBlbmRlbmNpZXNfMS5ncm9iRGVyaXZlZFN5bWJvbFJlZ2V4KTtcbiAgICAgICAgdmFyIHJlYyA9IHN5bWJvbHMgPyBPYmplY3QuZnJvbUVudHJpZXMoc3ltYm9scy5tYXAoZnVuY3Rpb24gKHMpIHsgcmV0dXJuIFtzLCAxXTsgfSkpIDoge307XG4gICAgICAgIHZhciByZXMgPSB0aGlzLl9yZWNhbGN1bGF0ZShyZWMsIHN0YXRlbWVudCk7XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfTtcbiAgICBHcm9iRGVyaXZlZE5vZGUudGVzdENhbGN1bGF0ZSA9IGZ1bmN0aW9uIChzdGF0ZW1lbnQsIHN5bWJvbHNUb1ZhbHVlKSB7XG4gICAgICAgIGlmIChzeW1ib2xzVG9WYWx1ZSA9PT0gdm9pZCAwKSB7IHN5bWJvbHNUb1ZhbHVlID0ge307IH1cbiAgICAgICAgdmFyIHN5bWJvbHMgPSBzdGF0ZW1lbnQubWF0Y2goVFRSUEdTeXN0ZW1zR3JhcGhEZXBlbmRlbmNpZXNfMS5ncm9iRGVyaXZlZFN5bWJvbFJlZ2V4KTtcbiAgICAgICAgZnVuY3Rpb24gbWFwVmFsdWVUb1N5bWJvbChzLCBtKSB7XG4gICAgICAgICAgICBpZiAobVtzXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtW3NdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlYyA9IHN5bWJvbHMgPyBPYmplY3QuZnJvbUVudHJpZXMoc3ltYm9scy5tYXAoZnVuY3Rpb24gKHMpIHsgcmV0dXJuIFtzLCBtYXBWYWx1ZVRvU3ltYm9sKHMsIHN5bWJvbHNUb1ZhbHVlKV07IH0pKSA6IHt9O1xuICAgICAgICB2YXIgcmVzID0gR3JvYkRlcml2ZWROb2RlLnJlY2FsY3VsYXRlKHJlYywgc3RhdGVtZW50KTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9O1xuICAgIEdyb2JEZXJpdmVkTm9kZS5wcm90b3R5cGUuX3VwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzVmFsaWQoKSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIk5vZGUgaXNlbnQgVmFsaWQgXCIuY29uY2F0KHRoaXMuZ2V0TmFtZSgpLCBcIiBcIikuY29uY2F0KHRoaXMuZ2V0TG9jYXRpb25LZXkoKSwgXCIgU3RvcHBpbmcgdXBkYXRlXCIpKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBmaXJzdCByZWNhbGN1bGF0ZVxuICAgICAgICB0aGlzLnJlY2FsY3VsYXRlKCk7XG4gICAgICAgIC8vIHRoZW4gY2FsbCB1cGRhdGUgZm9yIGFsbCBkZXBlbmRlbnRzIFxuICAgICAgICB2YXIgc3VjY2VzcyA9IHRydWU7XG4gICAgICAgIGZvciAodmFyIGsgaW4gdGhpcy5kZXBlbmRlbnRzKSB7XG4gICAgICAgICAgICB2YXIgZGVwID0gdGhpcy5kZXBlbmRlbnRzW2tdO1xuICAgICAgICAgICAgc3VjY2VzcyA9IHN1Y2Nlc3MgJiYgZGVwLnVwZGF0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdWNjZXNzO1xuICAgIH07XG4gICAgR3JvYkRlcml2ZWROb2RlLnByb3RvdHlwZS51cGRhdGVEZXBlbmRlY3lzTG9jYXRpb24gPSBmdW5jdGlvbiAoZGVwZW5kZW5jeSkge1xuICAgICAgICB2YXIgb3JpZyA9IHRoaXMub3JpZ2lucy5maW5kKGZ1bmN0aW9uIChwKSB7IHZhciBfYTsgcmV0dXJuICgoX2EgPSBwLm9yaWdpbikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmdldE5hbWUoKSkgPT0gZGVwZW5kZW5jeS5nZXROYW1lKCk7IH0pO1xuICAgICAgICBpZiAoIW9yaWcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIG9yaWcub3JpZ2luS2V5ID0gZGVwZW5kZW5jeS5nZXRMb2NhdGlvbktleSgpO1xuICAgIH07XG4gICAgcmV0dXJuIEdyb2JEZXJpdmVkTm9kZTtcbn0oQUdyb2JOb2R0ZV8xLkFHcm9iTm9kZSkpO1xuZXhwb3J0cy5Hcm9iRGVyaXZlZE5vZGUgPSBHcm9iRGVyaXZlZE5vZGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuR3JvYkJvbnVzTm9kZSA9IHZvaWQgMDtcbnZhciB0c2xpYl8xID0gcmVxdWlyZShcInRzbGliXCIpO1xudmFyIEdyb2JEZXJpdmVkTm9kZV8xID0gcmVxdWlyZShcIi4vR3JvYkRlcml2ZWROb2RlXCIpO1xudmFyIFRUUlBHU3lzdGVtQm9udXNEZXNpZ25lcl8xID0gcmVxdWlyZShcIi4uL0hlbHBlcnMvVFRSUEdTeXN0ZW1Cb251c0Rlc2lnbmVyXCIpO1xudmFyIEdyb2JCb251c05vZGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgdHNsaWJfMS5fX2V4dGVuZHMoR3JvYkJvbnVzTm9kZSwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBHcm9iQm9udXNOb2RlKG5hbWUsIHBhcmVudCkge1xuICAgICAgICByZXR1cm4gX3N1cGVyLmNhbGwodGhpcywgbmFtZSwgcGFyZW50KSB8fCB0aGlzO1xuICAgIH1cbiAgICBHcm9iQm9udXNOb2RlLkNyZWF0ZU5vZGVDaGFpbiA9IGZ1bmN0aW9uIChzeXMsIG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIFRUUlBHU3lzdGVtQm9udXNEZXNpZ25lcl8xLlRUUlBHU3lzdGVtQm9udXNEZXNpZ25lci5jcmVhdGVCb251c05vZGVDaGFpbihzeXMsIG5hbWUpO1xuICAgIH07XG4gICAgR3JvYkJvbnVzTm9kZS5nZXRUeXBlU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJ2JvbnVzTm9kZSc7XG4gICAgfTtcbiAgICBHcm9iQm9udXNOb2RlLnByb3RvdHlwZS5nZXRUeXBlU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gR3JvYkJvbnVzTm9kZS5nZXRUeXBlU3RyaW5nKCk7XG4gICAgfTtcbiAgICByZXR1cm4gR3JvYkJvbnVzTm9kZTtcbn0oR3JvYkRlcml2ZWROb2RlXzEuR3JvYkRlcml2ZWROb2RlKSk7XG5leHBvcnRzLkdyb2JCb251c05vZGUgPSBHcm9iQm9udXNOb2RlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLlRUUlBHU3lzdGVtQm9udXNEZXNpZ25lciA9IHZvaWQgMDtcbnZhciBHcm9iQm9udXNOb2RlXzEgPSByZXF1aXJlKFwiLi4vTm9kZXMvR3JvYkJvbnVzTm9kZVwiKTtcbnZhciBUVFJQR1N5c3RlbUJvbnVzRGVzaWduZXIgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gVFRSUEdTeXN0ZW1Cb251c0Rlc2lnbmVyKCkge1xuICAgIH1cbiAgICBUVFJQR1N5c3RlbUJvbnVzRGVzaWduZXIuY3JlYXRlQm9udXNOb2RlQ2hhaW4gPSBmdW5jdGlvbiAoc3lzLCBuYW1lKSB7XG4gICAgICAgIHZhciBpbnN0YW5jZSA9IG5ldyBUVFJQR1N5c3RlbUJvbnVzRGVzaWduZXIoKTtcbiAgICAgICAgaWYgKCFzeXMuaGFzQ29sbGVjdGlvbignZXh0cmEnLCAnYm9udXMnKSkge1xuICAgICAgICAgICAgc3lzLmNyZWF0ZUNvbGxlY3Rpb24oJ2V4dHJhJywgJ2JvbnVzJyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNvbCA9IHN5cy5nZXRDb2xsZWN0aW9uKCdleHRyYScsICdib251cycpO1xuICAgICAgICAvLyBDcmVhdGUgdGhlIE5vZGUuXG4gICAgICAgIGluc3RhbmNlLmFjdGl2ZU5vZGUgPSBpbnN0YW5jZS5jcmVhdGVOZXdOb2RlKG5hbWUsIGNvbCk7XG4gICAgICAgIHJldHVybiBpbnN0YW5jZTtcbiAgICB9O1xuICAgIFRUUlBHU3lzdGVtQm9udXNEZXNpZ25lci5wcm90b3R5cGUuY3JlYXRlTmV3Tm9kZSA9IGZ1bmN0aW9uIChuYW1lLCBwYXJlbnQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBHcm9iQm9udXNOb2RlXzEuR3JvYkJvbnVzTm9kZShuYW1lLCBwYXJlbnQpO1xuICAgIH07XG4gICAgVFRSUEdTeXN0ZW1Cb251c0Rlc2lnbmVyLnByb3RvdHlwZS5hZGRDYWxjdWxhdGlvbiA9IGZ1bmN0aW9uIChjYWxjKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlTm9kZS5zZXRDYWxjKGNhbGMpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuICAgIFRUUlBHU3lzdGVtQm9udXNEZXNpZ25lci5wcm90b3R5cGUuYWRkT3JpZ2luID0gZnVuY3Rpb24gKHN5bWJvbCwgbm9kZSkge1xuICAgICAgICB0aGlzLmFjdGl2ZU5vZGUuc2V0T3JpZ2luKHN5bWJvbCwgbm9kZSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgVFRSUEdTeXN0ZW1Cb251c0Rlc2lnbmVyLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlTm9kZS51cGRhdGVPcmlnaW5zKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG4gICAgVFRSUEdTeXN0ZW1Cb251c0Rlc2lnbmVyLnByb3RvdHlwZS5nZXROb2RlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hY3RpdmVOb2RlO1xuICAgIH07XG4gICAgVFRSUEdTeXN0ZW1Cb251c0Rlc2lnbmVyLnByb3RvdHlwZS5nZXRPcmlnaW5TdGF0ZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZU5vZGUucGFyc2VDYWxjdWxhdGlvblRvT3JpZ2lucyh0aGlzLmFjdGl2ZU5vZGUuY2FsYyk7XG4gICAgfTtcbiAgICBUVFJQR1N5c3RlbUJvbnVzRGVzaWduZXIucHJvdG90eXBlLmlzVmFsaWRDYWxjdWxhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlTm9kZS50ZXN0Q2FsY3VsYXRlKHRoaXMuYWN0aXZlTm9kZS5jYWxjKTtcbiAgICB9O1xuICAgIFRUUlBHU3lzdGVtQm9udXNEZXNpZ25lci5wcm90b3R5cGUuaXNWYWxpZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlTm9kZS5pc1ZhbGlkKCk7XG4gICAgfTtcbiAgICByZXR1cm4gVFRSUEdTeXN0ZW1Cb251c0Rlc2lnbmVyO1xufSgpKTtcbmV4cG9ydHMuVFRSUEdTeXN0ZW1Cb251c0Rlc2lnbmVyID0gVFRSUEdTeXN0ZW1Cb251c0Rlc2lnbmVyO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLkdyb2JGaXhlZE5vZGUgPSB2b2lkIDA7XG52YXIgdHNsaWJfMSA9IHJlcXVpcmUoXCJ0c2xpYlwiKTtcbnZhciBBR3JvYk5vZHRlXzEgPSByZXF1aXJlKFwiLi9BR3JvYk5vZHRlXCIpO1xudmFyIEdyb2JGaXhlZE5vZGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgdHNsaWJfMS5fX2V4dGVuZHMoR3JvYkZpeGVkTm9kZSwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBHcm9iRml4ZWROb2RlKG5hbWUsIHBhcmVudCkge1xuICAgICAgICB2YXIgX3RoaXMgPSBfc3VwZXIuY2FsbCh0aGlzLCBuYW1lLCAnTkYnLCBwYXJlbnQpIHx8IHRoaXM7XG4gICAgICAgIF90aGlzLl9fX3ZhbHVlID0gMTtcbiAgICAgICAgcmV0dXJuIF90aGlzO1xuICAgIH1cbiAgICBHcm9iRml4ZWROb2RlLnByb3RvdHlwZS5fZ2V0VmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9fX3ZhbHVlO1xuICAgIH07XG4gICAgR3JvYkZpeGVkTm9kZS5wcm90b3R5cGUuc2V0VmFsdWUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy5fX192YWx1ZSA9IHZhbHVlO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5kZXBlbmRlbnRzKSB7XG4gICAgICAgICAgICB2YXIgY3VyciA9IHRoaXMuZGVwZW5kZW50c1trZXldO1xuICAgICAgICAgICAgY3Vyci51cGRhdGUoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgR3JvYkZpeGVkTm9kZS5nZXRUeXBlU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJ2ZpeGVkTm9kZSc7XG4gICAgfTtcbiAgICBHcm9iRml4ZWROb2RlLnByb3RvdHlwZS5nZXRUeXBlU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gR3JvYkZpeGVkTm9kZS5nZXRUeXBlU3RyaW5nKCk7XG4gICAgfTtcbiAgICBHcm9iRml4ZWROb2RlLnByb3RvdHlwZS5hZGREZXBlbmRlbmN5ID0gZnVuY3Rpb24gKG5vZGUpIHsgcmV0dXJuIGZhbHNlOyB9O1xuICAgIEdyb2JGaXhlZE5vZGUucHJvdG90eXBlLnJlbW92ZURlcGVuZGVuY3kgPSBmdW5jdGlvbiAobm9kZSkgeyByZXR1cm4gZmFsc2U7IH07XG4gICAgR3JvYkZpeGVkTm9kZS5wcm90b3R5cGUubnVsbGlmeURlcGVuZGVuY3kgPSBmdW5jdGlvbiAobm9kZSkgeyByZXR1cm4gZmFsc2U7IH07XG4gICAgR3JvYkZpeGVkTm9kZS5wcm90b3R5cGUuX3VwZGF0ZSA9IGZ1bmN0aW9uICgpIHsgfTtcbiAgICByZXR1cm4gR3JvYkZpeGVkTm9kZTtcbn0oQUdyb2JOb2R0ZV8xLkFHcm9iTm9kZSkpO1xuZXhwb3J0cy5Hcm9iRml4ZWROb2RlID0gR3JvYkZpeGVkTm9kZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5BRGF0YVJvdyA9IGV4cG9ydHMuQURhdGFUYWJsZSA9IHZvaWQgMDtcbnZhciBBRGF0YVRhYmxlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFEYXRhVGFibGUoKSB7XG4gICAgICAgIHRoaXMuZGF0YSA9IHt9O1xuICAgIH1cbiAgICBBRGF0YVRhYmxlLnByb3RvdHlwZS5nZXROYW1lID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJNZXRob2Qgbm90IGltcGxlbWVudGVkLlwiKTtcbiAgICB9O1xuICAgIEFEYXRhVGFibGUucHJvdG90eXBlLmRpc3Bvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xuICAgIH07XG4gICAgQURhdGFUYWJsZS5wcm90b3R5cGUudXBkYXRlTG9jYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xuICAgIH07XG4gICAgQURhdGFUYWJsZS5wcm90b3R5cGUuZ2V0TG9jYXRpb25LZXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzZWdzID0gdGhpcy5nZXRMb2NhdGlvbktleVNlZ21lbnRzKCk7XG4gICAgICAgIHJldHVybiBzZWdzLmpvaW4oJy4nKTtcbiAgICB9O1xuICAgIEFEYXRhVGFibGUucHJvdG90eXBlLmdldExvY2F0aW9uS2V5U2VnbWVudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfYSwgX2IsIF9jLCBfZCwgX2UsIF9mO1xuICAgICAgICB2YXIgc2VnID0gWycnLCAnJywgJyddO1xuICAgICAgICBzZWdbMF0gPSAoX2MgPSAoX2IgPSAoX2EgPSB0aGlzLnBhcmVudCkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnBhcmVudCkgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmdldE5hbWUoKSkgIT09IG51bGwgJiYgX2MgIT09IHZvaWQgMCA/IF9jIDogJ3Vua25vd24nO1xuICAgICAgICBzZWdbMV0gPSAoX2UgPSAoX2QgPSB0aGlzLnBhcmVudCkgPT09IG51bGwgfHwgX2QgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9kLmdldE5hbWUoKSkgIT09IG51bGwgJiYgX2UgIT09IHZvaWQgMCA/IF9lIDogJ3Vua25vd24nO1xuICAgICAgICBzZWdbMl0gPSAoX2YgPSB0aGlzLmdldE5hbWUoKSkgIT09IG51bGwgJiYgX2YgIT09IHZvaWQgMCA/IF9mIDogJ3Vua25vd24nO1xuICAgICAgICByZXR1cm4gc2VnO1xuICAgIH07XG4gICAgQURhdGFUYWJsZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKCkgeyB9O1xuICAgIHJldHVybiBBRGF0YVRhYmxlO1xufSgpKTtcbmV4cG9ydHMuQURhdGFUYWJsZSA9IEFEYXRhVGFibGU7XG52YXIgQURhdGFSb3cgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQURhdGFSb3coKSB7XG4gICAgfVxuICAgIHJldHVybiBBRGF0YVJvdztcbn0oKSk7XG5leHBvcnRzLkFEYXRhUm93ID0gQURhdGFSb3c7XG4iLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMudXVpZHY0ID0gZXhwb3J0cy5UVFJQR1N5c3RlbUhlbHBlciA9IGV4cG9ydHMuVFRSUEdTeXN0ZW0gPSBleHBvcnRzLkFEYXRhVGFibGUgPSBleHBvcnRzLkFEYXRhUm93ID0gZXhwb3J0cy5Hcm9iR3JvdXAgPSBleHBvcnRzLkdyb2JDb2xsZWN0aW9uID0gZXhwb3J0cy5Hcm9iQm9udXNOb2RlID0gZXhwb3J0cy5Hcm9iRGVyaXZlZE5vZGUgPSBleHBvcnRzLkdyb2JEZXJpdmVkT3JpZ2luID0gZXhwb3J0cy5Hcm9iRml4ZWROb2RlID0gZXhwb3J0cy5rZXlNYW5hZ2VySW5zdGFuY2UgPSB2b2lkIDA7XG52YXIgS2V5TWFuYWdlcl8xID0gcmVxdWlyZShcIi4vQWJzdHJhY3Rpb25zL0tleU1hbmFnZXJcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJrZXlNYW5hZ2VySW5zdGFuY2VcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIEtleU1hbmFnZXJfMS5rZXlNYW5hZ2VySW5zdGFuY2U7IH0gfSk7XG52YXIgVFRSUEdTeXN0ZW1HcmFwaE1vZGVsXzEgPSByZXF1aXJlKFwiLi9HcmFwaC9UVFJQR1N5c3RlbUdyYXBoTW9kZWxcIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJUVFJQR1N5c3RlbVwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gVFRSUEdTeXN0ZW1HcmFwaE1vZGVsXzEuVFRSUEdTeXN0ZW1HcmFwaE1vZGVsOyB9IH0pO1xudmFyIEdyb2JDb2xsZWN0aW9uXzEgPSByZXF1aXJlKFwiLi9Hcm9iQ29sbGVjdGlvblwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIkdyb2JDb2xsZWN0aW9uXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBHcm9iQ29sbGVjdGlvbl8xLkdyb2JDb2xsZWN0aW9uOyB9IH0pO1xudmFyIEdyb2JHcm91cF8xID0gcmVxdWlyZShcIi4vR3JvYkdyb3VwXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiR3JvYkdyb3VwXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBHcm9iR3JvdXBfMS5Hcm9iR3JvdXA7IH0gfSk7XG52YXIgVFRSUEdTeXN0ZW1Cb251c0Rlc2lnbmVyXzEgPSByZXF1aXJlKFwiLi9IZWxwZXJzL1RUUlBHU3lzdGVtQm9udXNEZXNpZ25lclwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIlRUUlBHU3lzdGVtSGVscGVyXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBUVFJQR1N5c3RlbUJvbnVzRGVzaWduZXJfMS5UVFJQR1N5c3RlbUJvbnVzRGVzaWduZXI7IH0gfSk7XG52YXIgR3JvYkJvbnVzTm9kZV8xID0gcmVxdWlyZShcIi4vTm9kZXMvR3JvYkJvbnVzTm9kZVwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIkdyb2JCb251c05vZGVcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIEdyb2JCb251c05vZGVfMS5Hcm9iQm9udXNOb2RlOyB9IH0pO1xudmFyIEdyb2JEZXJpdmVkTm9kZV8xID0gcmVxdWlyZShcIi4vTm9kZXMvR3JvYkRlcml2ZWROb2RlXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiR3JvYkRlcml2ZWROb2RlXCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBHcm9iRGVyaXZlZE5vZGVfMS5Hcm9iRGVyaXZlZE5vZGU7IH0gfSk7XG52YXIgR3JvYkZpeGVkTm9kZV8xID0gcmVxdWlyZShcIi4vTm9kZXMvR3JvYkZpeGVkTm9kZVwiKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIkdyb2JGaXhlZE5vZGVcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIEdyb2JGaXhlZE5vZGVfMS5Hcm9iRml4ZWROb2RlOyB9IH0pO1xudmFyIEdyb2JPcmlnaW5fMSA9IHJlcXVpcmUoXCIuL05vZGVzL0dyb2JPcmlnaW5cIik7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJHcm9iRGVyaXZlZE9yaWdpblwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gR3JvYk9yaWdpbl8xLkdyb2JPcmlnaW47IH0gfSk7XG52YXIgRGF0YVRhYmxlXzEgPSByZXF1aXJlKFwiLi9UYWJsZXMvRGF0YVRhYmxlXCIpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiQURhdGFSb3dcIiwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIERhdGFUYWJsZV8xLkFEYXRhUm93OyB9IH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiQURhdGFUYWJsZVwiLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gRGF0YVRhYmxlXzEuQURhdGFUYWJsZTsgfSB9KTtcbmZ1bmN0aW9uIHV1aWR2NCgpIHtcbiAgICByZXR1cm4gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCdcbiAgICAgICAgLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpICogMTYgfCAwLCB2ID0gYyA9PSAneCcgPyByIDogKHIgJiAweDMgfCAweDgpO1xuICAgICAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gICAgfSk7XG59XG5leHBvcnRzLnV1aWR2NCA9IHV1aWR2NDtcbiIsImV4cG9ydCB2YXIgQkFTRV9TQ0hFTUUgPSAnX2Jhc2UnO1xuZXhwb3J0IHZhciBOb091dHB1dCA9IHtcbiAgICBvdXRFcnJvcjogZnVuY3Rpb24gKG1zZykgeyB9LFxuICAgIG91dExvZzogZnVuY3Rpb24gKG1zZykgeyB9XG59O1xuZXhwb3J0IHZhciBKU09OX1RBR1M7XG4oZnVuY3Rpb24gKEpTT05fVEFHUykge1xuICAgIEpTT05fVEFHU1tcIkpTT05fUFJPUEVSVFlcIl0gPSBcIkpTT05fUFJPUEVSVFlcIjtcbiAgICBKU09OX1RBR1NbXCJKU09OX1BST1BFUlRZX1RZUEVEXCJdID0gXCJKU09OX1BST1BFUlRZX1RZUEVEXCI7XG4gICAgSlNPTl9UQUdTW1wiSlNPTl9QUk9QRVJUWV9UWVBFRF9TS0lQX0ZPUkNFRFwiXSA9IFwiSlNPTl9QUk9QRVJUWV9UWVBFRF9TS0lQX0ZPUkNFRFwiO1xuICAgIEpTT05fVEFHU1tcIkpTT05fUFJPUEVSVFlfTkFNRV9NQVBfSU5cIl0gPSBcIkpTT05fUFJPUEVSVFlfTkFNRV9NQVBfSU5cIjtcbiAgICBKU09OX1RBR1NbXCJKU09OX1BST1BFUlRZX05BTUVfTUFQX09VVFwiXSA9IFwiSlNPTl9QUk9QRVJUWV9OQU1FX01BUF9PVVRcIjtcbiAgICBKU09OX1RBR1NbXCJKU09OX1BST1BFUlRZX0ZVTkNfTUFQX0lOXCJdID0gXCJKU09OX1BST1BFUlRZX0ZVTkNfTUFQX0lOXCI7XG4gICAgSlNPTl9UQUdTW1wiSlNPTl9QUk9QRVJUWV9GVU5DX01BUF9PVVRcIl0gPSBcIkpTT05fUFJPUEVSVFlfRlVOQ19NQVBfT1VUXCI7XG4gICAgSlNPTl9UQUdTW1wiSlNPTl9QUk9QRVJUWV9GT1JDRV9CQVNFX1RZUEVcIl0gPSBcIkpTT05fUFJPUEVSVFlfRk9SQ0VfQkFTRV9UWVBFXCI7XG4gICAgSlNPTl9UQUdTW1wiSlNPTl9QUk9QRVJUWV9GT1JDRV9BUlJBWVwiXSA9IFwiSlNPTl9QUk9QRVJUWV9GT1JDRV9BUlJBWVwiO1xuICAgIEpTT05fVEFHU1tcIkpTT05fT0JKRUNUX09OX0FGVEVSX0RFX1NFUklBTElaQVRJT05cIl0gPSBcIkpTT05fT0JKRUNUX09OX0FGVEVSX0RFX1NFUklBTElaQVRJT05cIjtcbiAgICBKU09OX1RBR1NbXCJKU09OX09CSkVDVF9PTl9BRlRFUl9TRVJJQUxJWkFUSU9OX0JFRk9SRV9TVFJJTkdcIl0gPSBcIkpTT05fT0JKRUNUX09OX0FGVEVSX1NFUklBTElaQVRJT05fQkVGT1JFX1NUUklOR1wiO1xuICAgIEpTT05fVEFHU1tcIkpTT05fT0JKRUNUX09OX0FGVEVSX1NFUklBTElaQVRJT05cIl0gPSBcIkpTT05fT0JKRUNUX09OX0FGVEVSX1NFUklBTElaQVRJT05cIjtcbiAgICBKU09OX1RBR1NbXCJKU09OX09CSkVDVF9PTl9CRUZPUkVfU0VSSUFMSVpBVElPTlwiXSA9IFwiSlNPTl9PQkpFQ1RfT05fQkVGT1JFX1NFUklBTElaQVRJT05cIjtcbiAgICBKU09OX1RBR1NbXCJKU09OX09CSkVDVF9PTl9CRUZPUkVfREVfU0VSSUFMSVpBVElPTlwiXSA9IFwiSlNPTl9PQkpFQ1RfT05fQkVGT1JFX0RFX1NFUklBTElaQVRJT05cIjtcbn0pKEpTT05fVEFHUyB8fCAoSlNPTl9UQUdTID0ge30pKTtcbmV4cG9ydCB2YXIgSlNPTl9CQVNFVFlQRVM7XG4oZnVuY3Rpb24gKEpTT05fQkFTRVRZUEVTKSB7XG4gICAgSlNPTl9CQVNFVFlQRVNbXCJzdHJpbmdcIl0gPSBcInN0cmluZ1wiO1xuICAgIEpTT05fQkFTRVRZUEVTW1wiYm9vbFwiXSA9IFwiYm9vbFwiO1xuICAgIEpTT05fQkFTRVRZUEVTW1wibnVtYmVyXCJdID0gXCJudW1iZXJcIjtcbn0pKEpTT05fQkFTRVRZUEVTIHx8IChKU09OX0JBU0VUWVBFUyA9IHt9KSk7XG4iLCJpbXBvcnQgeyBCQVNFX1NDSEVNRSB9IGZyb20gXCIuL0pzb25Nb2R1bGVDb25zdGFudHNcIjtcbmZ1bmN0aW9uIGNyZWF0ZUd1aWQoKSB7XG4gICAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnXG4gICAgICAgIC5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uIChjKSB7XG4gICAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKSAqIDE2IHwgMCwgdiA9IGMgPT0gJ3gnID8gciA6IChyICYgMHgzIHwgMHg4KTtcbiAgICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgIH0pO1xufVxudmFyIHNlbGZLZXkgPSBjcmVhdGVHdWlkKCkgKyBcIlNFTEZcIjtcbnZhciBNZXRhRGF0YVRhZ05hbWUgPSAnZ2ptZCc7IC8vIEdyb2JheCBKc29uIE1ldGEgRGF0YTtcbnZhciBSZWZsZWN0ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIFJlZmxlY3QoKSB7XG4gICAgfVxuICAgIFJlZmxlY3QuZ2V0UHJvdG90eXBlID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICB2YXIgYTtcbiAgICAgICAgaWYgKHR5cGVvZiBvYmogPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgYSA9IG9iai5wcm90b3R5cGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhID0gb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYTtcbiAgICB9O1xuICAgIFJlZmxlY3Quc2V0UHJvdG90eXBlID0gZnVuY3Rpb24gKG9iaiwgcHJvdG90eXBlKSB7XG4gICAgICAgIC8vT2JqZWN0LnNldFByb3RvdHlwZU9mKCBvYmogLCBwcm90b3R5cGUgKVxuICAgICAgICBpZiAodHlwZW9mIG9iaiA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBJbXBsZW1lbnRlZCBFcnJvciwgcGxlYXNlIHJlcG9ydCB0aGUgc2NlbmFyaW8gdG8gbWUnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihvYmosIHByb3RvdHlwZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFJlZmxlY3QuZ2V0T3JDcmVhdGVBbGxNZXRhRGF0YSA9IGZ1bmN0aW9uIChvYmosIGNyZWF0ZSkge1xuICAgICAgICBpZiAoY3JlYXRlID09PSB2b2lkIDApIHsgY3JlYXRlID0gZmFsc2U7IH1cbiAgICAgICAgdmFyIHByb3RvdHlwZSA9IFJlZmxlY3QuZ2V0UHJvdG90eXBlKG9iaik7XG4gICAgICAgIGlmIChwcm90b3R5cGUgPT09IE9iamVjdC5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwcm90b3R5cGUgPT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB2YXIgYSA9IHByb3RvdHlwZTtcbiAgICAgICAgaWYgKCEoYVsnZ2ptZCddKSkge1xuICAgICAgICAgICAgaWYgKCFjcmVhdGUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBhWydnam1kJ10gPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBhID0gYVsnZ2ptZCddO1xuICAgICAgICBpZiAoIWFbcHJvdG90eXBlLmNvbnN0cnVjdG9yLm5hbWVdKSB7XG4gICAgICAgICAgICBpZiAoIWNyZWF0ZSlcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGFbcHJvdG90eXBlLmNvbnN0cnVjdG9yLm5hbWVdID0ge307XG4gICAgICAgIH1cbiAgICAgICAgYSA9IGFbcHJvdG90eXBlLmNvbnN0cnVjdG9yLm5hbWVdO1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9O1xuICAgIFJlZmxlY3QuZ2V0T3JDcmVhdGVEZWZpbmVkTWV0YURhdGEgPSBmdW5jdGlvbiAob2JqLCBzY2hlbWUsIGNyZWF0ZSkge1xuICAgICAgICBpZiAoY3JlYXRlID09PSB2b2lkIDApIHsgY3JlYXRlID0gZmFsc2U7IH1cbiAgICAgICAgdmFyIGEgPSBSZWZsZWN0LmdldE9yQ3JlYXRlQWxsTWV0YURhdGEob2JqLCBjcmVhdGUpO1xuICAgICAgICBpZiAoIWEpXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgaWYgKCEoYVtzY2hlbWVdKSkge1xuICAgICAgICAgICAgaWYgKCFjcmVhdGUpXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBhW3NjaGVtZV0gPSB7fTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYVtzY2hlbWVdO1xuICAgIH07XG4gICAgLy8gS0VZUyAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLVxuICAgIFJlZmxlY3QuZ2V0TWV0YWRhdGFLZXlzID0gZnVuY3Rpb24gKG9iaiwga2V5LCBzY2hlbWUpIHtcbiAgICAgICAgaWYgKHNjaGVtZSA9PT0gdm9pZCAwKSB7IHNjaGVtZSA9IEJBU0VfU0NIRU1FOyB9XG4gICAgICAgIHZhciBhID0gUmVmbGVjdC5nZXRPckNyZWF0ZURlZmluZWRNZXRhRGF0YShvYmosIHNjaGVtZSk7XG4gICAgICAgIGlmICghYSB8fCAhYVtrZXldKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKGFba2V5XSk7XG4gICAgfTtcbiAgICBSZWZsZWN0LmdldE93bk1ldGFEYXRhS2V5cyA9IGZ1bmN0aW9uIChvYmosIHNjaGVtZSkge1xuICAgICAgICBpZiAoc2NoZW1lID09PSB2b2lkIDApIHsgc2NoZW1lID0gQkFTRV9TQ0hFTUU7IH1cbiAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0TWV0YWRhdGFLZXlzKG9iaiwgc2VsZktleSwgc2NoZW1lKTtcbiAgICB9O1xuICAgIC8vIEdFVCAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLVxuICAgIFJlZmxlY3QuZ2V0TWV0YWRhdGEgPSBmdW5jdGlvbiAobWV0YVRhZywgdGFyZ2V0LCBwcm9wZXJ0eUtleSwgc2NoZW1lKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgaWYgKHNjaGVtZSA9PT0gdm9pZCAwKSB7IHNjaGVtZSA9IEJBU0VfU0NIRU1FOyB9XG4gICAgICAgIHZhciBhID0gUmVmbGVjdC5nZXRPckNyZWF0ZURlZmluZWRNZXRhRGF0YSh0YXJnZXQsIHNjaGVtZSk7XG4gICAgICAgIGlmICghYVtwcm9wZXJ0eUtleV0pXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIChfYSA9IGFbcHJvcGVydHlLZXldW21ldGFUYWddKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBudWxsO1xuICAgIH07XG4gICAgUmVmbGVjdC5nZXRPd25NZXRhRGF0YSA9IGZ1bmN0aW9uIChtZXRhVGFnLCB0YXJnZXQsIHNjaGVtZSkge1xuICAgICAgICBpZiAoc2NoZW1lID09PSB2b2lkIDApIHsgc2NoZW1lID0gQkFTRV9TQ0hFTUU7IH1cbiAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0TWV0YWRhdGEobWV0YVRhZywgdGFyZ2V0LCBzZWxmS2V5LCBzY2hlbWUpO1xuICAgIH07XG4gICAgLy8gREVGSU5FIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tXG4gICAgUmVmbGVjdC5kZWZpbmVNZXRhRGF0YSA9IGZ1bmN0aW9uIChtZXRhVGFnLCBkYXRhLCB0YXJnZXQsIHByb3BlcnR5S2V5LCBzY2hlbWUpIHtcbiAgICAgICAgaWYgKHNjaGVtZSA9PT0gdm9pZCAwKSB7IHNjaGVtZSA9IEJBU0VfU0NIRU1FOyB9XG4gICAgICAgIHZhciBhID0gUmVmbGVjdC5nZXRPckNyZWF0ZURlZmluZWRNZXRhRGF0YSh0YXJnZXQsIHNjaGVtZSwgdHJ1ZSk7XG4gICAgICAgIGlmICghYVtwcm9wZXJ0eUtleV0pXG4gICAgICAgICAgICBhW3Byb3BlcnR5S2V5XSA9IHt9O1xuICAgICAgICBhW3Byb3BlcnR5S2V5XVttZXRhVGFnXSA9IGRhdGE7XG4gICAgfTtcbiAgICBSZWZsZWN0LmRlZmluZU93bk1ldGFEYXRhID0gZnVuY3Rpb24gKG1ldGFUYWcsIGRhdGEsIHRhcmdldCwgc2NoZW1lKSB7XG4gICAgICAgIGlmIChzY2hlbWUgPT09IHZvaWQgMCkgeyBzY2hlbWUgPSBCQVNFX1NDSEVNRTsgfVxuICAgICAgICByZXR1cm4gUmVmbGVjdC5kZWZpbmVNZXRhRGF0YShtZXRhVGFnLCBkYXRhLCB0YXJnZXQsIHNlbGZLZXksIHNjaGVtZSk7XG4gICAgfTtcbiAgICAvLyBoYXMgLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS1cbiAgICBSZWZsZWN0Lmhhc01ldGFEYXRhID0gZnVuY3Rpb24gKG1ldGFUYWcsIHRhcmdldCwga2V5LCBzY2hlbWUpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICBpZiAoc2NoZW1lID09PSB2b2lkIDApIHsgc2NoZW1lID0gQkFTRV9TQ0hFTUU7IH1cbiAgICAgICAgdmFyIGEgPSBSZWZsZWN0LmdldE9yQ3JlYXRlRGVmaW5lZE1ldGFEYXRhKHRhcmdldCwgc2NoZW1lKTtcbiAgICAgICAgaWYgKGEgPT0gbnVsbClcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKCEoYVtrZXldKSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIChfYSA9IGFba2V5XVttZXRhVGFnXSkgIT09IG51bGwgJiYgX2EgIT09IHZvaWQgMCA/IF9hIDogZmFsc2U7XG4gICAgfTtcbiAgICBSZWZsZWN0Lmhhc093bk1ldGFEYXRhID0gZnVuY3Rpb24gKG1ldGFUYWcsIHRhcmdldCwgc2NoZW1lKSB7XG4gICAgICAgIGlmIChzY2hlbWUgPT09IHZvaWQgMCkgeyBzY2hlbWUgPSBCQVNFX1NDSEVNRTsgfVxuICAgICAgICByZXR1cm4gUmVmbGVjdC5oYXNNZXRhRGF0YShtZXRhVGFnLCB0YXJnZXQsIHNlbGZLZXksIHNjaGVtZSk7XG4gICAgfTtcbiAgICBSZWZsZWN0LmdldEFsbE1ldGEgPSBmdW5jdGlvbiAob2JqLCBzY2hlbWUpIHtcbiAgICAgICAgaWYgKHNjaGVtZSkge1xuICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0T3JDcmVhdGVEZWZpbmVkTWV0YURhdGEob2JqLCBzY2hlbWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0T3JDcmVhdGVBbGxNZXRhRGF0YShvYmosIHRydWUpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gUmVmbGVjdDtcbn0oKSk7XG5leHBvcnQgeyBSZWZsZWN0IH07XG4iLCJpbXBvcnQgeyBCQVNFX1NDSEVNRSB9IGZyb20gXCIuL0pzb25Nb2R1bGVDb25zdGFudHNcIjtcbmltcG9ydCB7IFJlZmxlY3QgfSBmcm9tIFwiLi9SZWZsZWN0XCI7XG5leHBvcnQgZnVuY3Rpb24gaGFzTWV0YURhdGFJblNjaGVtZShtZXRhVGFnLCB0YXJnZXQsIHByb3BlcnR5S2V5LCBzY2hlbWUpIHtcbiAgICB0cnkge1xuICAgICAgICB2YXIgZGF0YSA9IFJlZmxlY3QuZ2V0TWV0YWRhdGEobWV0YVRhZywgdGFyZ2V0LCBwcm9wZXJ0eUtleSk7XG4gICAgICAgIGlmIChkYXRhW3NjaGVtZV0gIT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbi8vIEdFVCAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLVxuZXhwb3J0IGZ1bmN0aW9uIGdldE1ldGFkYXRhKG1ldGFUYWcsIHRhcmdldCwgcHJvcGVydHlLZXksIHNjaGVtZSkge1xuICAgIGlmIChzY2hlbWUgPT09IHZvaWQgMCkgeyBzY2hlbWUgPSBCQVNFX1NDSEVNRTsgfVxuICAgIHJldHVybiBSZWZsZWN0LmdldE1ldGFkYXRhKG1ldGFUYWcsIHRhcmdldCwgcHJvcGVydHlLZXksIHNjaGVtZSk7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0T3duTWV0YURhdGEobWV0YVRhZywgdGFyZ2V0LCBzY2hlbWUpIHtcbiAgICBpZiAoc2NoZW1lID09PSB2b2lkIDApIHsgc2NoZW1lID0gQkFTRV9TQ0hFTUU7IH1cbiAgICByZXR1cm4gUmVmbGVjdC5nZXRPd25NZXRhRGF0YShtZXRhVGFnLCB0YXJnZXQsIHNjaGVtZSk7XG59XG4vLyBERUZJTkUgLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS1cbmV4cG9ydCBmdW5jdGlvbiBzZXRNZXRhZGF0YShtZXRhVGFnLCB2YWx1ZSwgdGFyZ2V0LCBwcm9wZXJ0eUtleSwgc2NoZW1lKSB7XG4gICAgaWYgKHNjaGVtZSA9PT0gdm9pZCAwKSB7IHNjaGVtZSA9IEJBU0VfU0NIRU1FOyB9XG4gICAgUmVmbGVjdC5kZWZpbmVNZXRhRGF0YShtZXRhVGFnLCB2YWx1ZSwgdGFyZ2V0LCBwcm9wZXJ0eUtleSwgc2NoZW1lKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXRPd25NZXRhRGF0YShtZXRhVGFnLCB0YXJnZXQsIHZhbHVlLCBzY2hlbWUpIHtcbiAgICBpZiAoc2NoZW1lID09PSB2b2lkIDApIHsgc2NoZW1lID0gQkFTRV9TQ0hFTUU7IH1cbiAgICBSZWZsZWN0LmRlZmluZU93bk1ldGFEYXRhKG1ldGFUYWcsIHZhbHVlLCB0YXJnZXQsIHNjaGVtZSk7XG59XG4vLyBLRVlTIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tIC0tLSAtLS0gLS0tXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3duTWV0YURhdGFLZXlzKHRhcmdldCwgc2NoZW1lKSB7XG4gICAgaWYgKHNjaGVtZSA9PT0gdm9pZCAwKSB7IHNjaGVtZSA9IEJBU0VfU0NIRU1FOyB9XG4gICAgdmFyIGtleXMgPSBSZWZsZWN0LmdldE93bk1ldGFEYXRhS2V5cyh0YXJnZXQsIHNjaGVtZSk7XG4gICAgcmV0dXJuIGtleXM7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0TWV0YURhdGFLZXlzKHRhcmdldCwga2V5LCBzY2hlbWUpIHtcbiAgICBpZiAoc2NoZW1lID09PSB2b2lkIDApIHsgc2NoZW1lID0gQkFTRV9TQ0hFTUU7IH1cbiAgICB2YXIga2V5cyA9IFJlZmxlY3QuZ2V0TWV0YWRhdGFLZXlzKHRhcmdldCwga2V5LCBzY2hlbWUpO1xuICAgIHJldHVybiBrZXlzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGhhc01ldGFEYXRhKHRhcmdldCwgc2NoZW1lKSB7XG4gICAgdmFyIGEgPSBSZWZsZWN0LmdldEFsbE1ldGEodGFyZ2V0LCBzY2hlbWUpO1xuICAgIGlmICghYSlcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFByb3RvdHlwZShvYmopIHtcbiAgICByZXR1cm4gUmVmbGVjdC5nZXRQcm90b3R5cGUob2JqKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBzZXRQcm90b3R5cGUob2JqLCBwcm90b3R5cGUpIHtcbiAgICBSZWZsZWN0LnNldFByb3RvdHlwZShvYmosIHByb3RvdHlwZSk7XG4gICAgcmV0dXJuIFJlZmxlY3QuZ2V0UHJvdG90eXBlKG9iaikgPT0gcHJvdG90eXBlO1xufVxuIiwiaW1wb3J0IHsgQkFTRV9TQ0hFTUUsIEpTT05fQkFTRVRZUEVTLCBKU09OX1RBR1MgfSBmcm9tIFwiLi9Kc29uTW9kdWxlQ29uc3RhbnRzXCI7XG5pbXBvcnQgeyBzZXRNZXRhZGF0YSwgc2V0T3duTWV0YURhdGEgfSBmcm9tIFwiLi9Kc29uTW9kdWxlQmFzZUZ1bmN0aW9uXCI7XG5mdW5jdGlvbiBjbGVhbk5vbkFjY2VzaWJsZVNldHRpbmdzKG9wdGlvbikge1xuICAgIGlmICghb3B0aW9uKVxuICAgICAgICByZXR1cm4ge307XG4gICAgaWYgKCFvcHRpb24uc2NoZW1lIHx8IG9wdGlvbi5zY2hlbWUubGVuZ3RoID09IDApXG4gICAgICAgIG9wdGlvbi5zY2hlbWUgPSBbQkFTRV9TQ0hFTUVdO1xuICAgIG9wdGlvbi5tYXBwaW5nRnVuY3Rpb25zID0gbnVsbDtcbiAgICBvcHRpb24udHlwZSA9IG51bGw7XG4gICAgb3B0aW9uLmlzQXJyYXkgPSBudWxsO1xuICAgIG9wdGlvbi5mb3JjZUJhc2VUeXBlID0gbnVsbDtcbiAgICByZXR1cm4gb3B0aW9uO1xufVxuLyoqXG4gKiBUaGlzIGlzIHRoZSBiYXNlIHByb3BlcnR5LCB0aGlzIGlzIHRoZSBwcm9wZXJ0eSB0aGF0IG90aGVyIHByb3BlcnRpZXMgdXNlLlxuICogaXQgaXMgcmVjb21tZW5kZWQgdGhhdCB5b3UgdXNlIHRoZSBtb3JlIHNwZWNpZmlrIHByb3BlcnRpZXMgd2hlbiBwb3NzaWJsZVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBKc29uUHJvcGVydHkob3B0aW9uKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIHByb3BlcnR5S2V5KSB7XG4gICAgICAgIHZhciBzY2hlbWVzO1xuICAgICAgICBpZiAoIShvcHRpb24gPT09IG51bGwgfHwgb3B0aW9uID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRpb24uc2NoZW1lKSkge1xuICAgICAgICAgICAgc2NoZW1lcyA9IFtCQVNFX1NDSEVNRV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvcHRpb24uc2NoZW1lKSkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbi5zY2hlbWUubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgICAgICBzY2hlbWVzID0gW0JBU0VfU0NIRU1FXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNjaGVtZXMgPSBvcHRpb24uc2NoZW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc2NoZW1lcyA9IFtvcHRpb24uc2NoZW1lXTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNjaGVtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzY2hlbWUgPSBzY2hlbWVzW2ldO1xuICAgICAgICAgICAgc2V0TWV0YWRhdGEoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFksIHRydWUsIHRhcmdldCwgcHJvcGVydHlLZXksIHNjaGVtZSk7XG4gICAgICAgICAgICBpZiAoIW9wdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvcHRpb24uZm9yY2VCYXNlVHlwZSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAob3B0aW9uLmZvcmNlQmFzZVR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBKU09OX0JBU0VUWVBFUy5zdHJpbmc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgSlNPTl9CQVNFVFlQRVMubnVtYmVyOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIEpTT05fQkFTRVRZUEVTLmJvb2w6XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRNZXRhZGF0YShKU09OX1RBR1MuSlNPTl9QUk9QRVJUWV9GT1JDRV9CQVNFX1RZUEUsIG9wdGlvbi5mb3JjZUJhc2VUeXBlLCB0YXJnZXQsIHByb3BlcnR5S2V5LCBzY2hlbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChvcHRpb24uaXNBcnJheSkge1xuICAgICAgICAgICAgICAgIHNldE1ldGFkYXRhKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX0ZPUkNFX0FSUkFZLCB0cnVlLCB0YXJnZXQsIHByb3BlcnR5S2V5LCBzY2hlbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG9wdGlvbi5uYW1lKSB7XG4gICAgICAgICAgICAgICAgc2V0TWV0YWRhdGEoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfTkFNRV9NQVBfSU4sIHByb3BlcnR5S2V5LCB0YXJnZXQsIG9wdGlvbi5uYW1lLCBzY2hlbWUpO1xuICAgICAgICAgICAgICAgIHNldE1ldGFkYXRhKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX05BTUVfTUFQX09VVCwgb3B0aW9uLm5hbWUsIHRhcmdldCwgcHJvcGVydHlLZXksIHNjaGVtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3B0aW9uLm1hcHBpbmdGdW5jdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBzZXRNZXRhZGF0YShKU09OX1RBR1MuSlNPTl9QUk9QRVJUWV9GVU5DX01BUF9JTiwgb3B0aW9uLm1hcHBpbmdGdW5jdGlvbnMuaW4sIHRhcmdldCwgcHJvcGVydHlLZXksIHNjaGVtZSk7XG4gICAgICAgICAgICAgICAgc2V0TWV0YWRhdGEoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfRlVOQ19NQVBfT1VULCBvcHRpb24ubWFwcGluZ0Z1bmN0aW9ucy5vdXQsIHRhcmdldCwgcHJvcGVydHlLZXksIHNjaGVtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3B0aW9uLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBzZXRNZXRhZGF0YShKU09OX1RBR1MuSlNPTl9QUk9QRVJUWV9UWVBFRCwgb3B0aW9uLnR5cGUsIHRhcmdldCwgcHJvcGVydHlLZXksIHNjaGVtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob3B0aW9uLnNraXBGb3JjZVR5cGUpIHtcbiAgICAgICAgICAgICAgICBzZXRNZXRhZGF0YShKU09OX1RBR1MuSlNPTl9QUk9QRVJUWV9UWVBFRF9TS0lQX0ZPUkNFRCwgdHJ1ZSwgdGFyZ2V0LCBwcm9wZXJ0eUtleSwgc2NoZW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59XG4vKipcbiAqIFRoaXMgaXMgdGhlIGJhc2UgcHJvcGVydHksIHRoYXQgZW5zdXJlIHdoYXQgZXZlciBpcyBkZXNlcmlhbGl6ZWR8c2VyaWFsaXplZCBpcyBhbiBhcnJheVxuKi9cbmV4cG9ydCBmdW5jdGlvbiBKc29uQXJyYXlQcm9wZXJ0eShvcHRpb24pIHtcbiAgICBvcHRpb24gPSBjbGVhbk5vbkFjY2VzaWJsZVNldHRpbmdzKG9wdGlvbik7XG4gICAgb3B0aW9uLmlzQXJyYXkgPSB0cnVlO1xuICAgIHJldHVybiBKc29uUHJvcGVydHkob3B0aW9uKTtcbn1cbi8qKlxuICogVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgY29udmVydHMgdG8gYSBudW1iZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEpzb25OdW1iZXIob3B0aW9uKSB7XG4gICAgb3B0aW9uID0gY2xlYW5Ob25BY2Nlc2libGVTZXR0aW5ncyhvcHRpb24pO1xuICAgIG9wdGlvbi5mb3JjZUJhc2VUeXBlID0gSlNPTl9CQVNFVFlQRVMubnVtYmVyO1xuICAgIHJldHVybiBKc29uUHJvcGVydHkob3B0aW9uKTtcbn1cbi8qKlxuICogVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgY29udmVydHMgdG8gYSBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEpzb25TdHJpbmcob3B0aW9uKSB7XG4gICAgb3B0aW9uID0gY2xlYW5Ob25BY2Nlc2libGVTZXR0aW5ncyhvcHRpb24pO1xuICAgIG9wdGlvbi5mb3JjZUJhc2VUeXBlID0gSlNPTl9CQVNFVFlQRVMuc3RyaW5nO1xuICAgIHJldHVybiBKc29uUHJvcGVydHkob3B0aW9uKTtcbn1cbi8qKlxuICogVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgY29udmVydHMgdG8gYSBib29sZWFuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBKc29uQm9vbGVhbihvcHRpb24pIHtcbiAgICBvcHRpb24gPSBjbGVhbk5vbkFjY2VzaWJsZVNldHRpbmdzKG9wdGlvbik7XG4gICAgb3B0aW9uLmZvcmNlQmFzZVR5cGUgPSBKU09OX0JBU0VUWVBFUy5ib29sO1xuICAgIHJldHVybiBKc29uUHJvcGVydHkob3B0aW9uKTtcbn1cbi8qKlxuICogVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgY29udmVydHMgdG8gYSBjbGFzcyBpbnN0YW5jZSxcbiAqIHdoZW4gZGVzZXJpbGl6aW5nIGl0IHdpbGwgYmUgY3JlYXRlZCB0aHJvdWdoIHRoZSBjb25zdHJ1Y3Rvci5cbiAqIHdoZW4gc2VyaWFsaXppZ24gaXQgd2lsbCBmb3JjZSBpdCB0aHJvdWdoIHRoZSBwcm90b3R5cGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBKc29uQ2xhc3NUeXBlZCh0eXBlLCBvcHRpb24pIHtcbiAgICBvcHRpb24gPSBjbGVhbk5vbkFjY2VzaWJsZVNldHRpbmdzKG9wdGlvbik7XG4gICAgb3B0aW9uLnR5cGUgPSB0eXBlO1xuICAgIHJldHVybiBKc29uUHJvcGVydHkob3B0aW9uKTtcbn1cbi8qKlxuICogVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgY29udmVydHMgdG8gYSBudW1iZXIgYXJyYXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEpzb25BcnJheU51bWJlcihvcHRpb24pIHtcbiAgICBvcHRpb24gPSBjbGVhbk5vbkFjY2VzaWJsZVNldHRpbmdzKG9wdGlvbik7XG4gICAgb3B0aW9uLmZvcmNlQmFzZVR5cGUgPSBKU09OX0JBU0VUWVBFUy5udW1iZXI7XG4gICAgb3B0aW9uLmlzQXJyYXkgPSB0cnVlO1xuICAgIHJldHVybiBKc29uUHJvcGVydHkob3B0aW9uKTtcbn1cbi8qKlxuICogVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgY29udmVydHMgdG8gYSBzdHJpbmcgYXJyYXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEpzb25BcnJheVN0cmluZyhvcHRpb24pIHtcbiAgICBvcHRpb24gPSBjbGVhbk5vbkFjY2VzaWJsZVNldHRpbmdzKG9wdGlvbik7XG4gICAgb3B0aW9uLmZvcmNlQmFzZVR5cGUgPSBKU09OX0JBU0VUWVBFUy5zdHJpbmc7XG4gICAgb3B0aW9uLmlzQXJyYXkgPSB0cnVlO1xuICAgIHJldHVybiBKc29uUHJvcGVydHkob3B0aW9uKTtcbn1cbi8qKlxuICogVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgY29udmVydHMgdG8gYSBib29sZWFuIGFycmF5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBKc29uQXJyYXlCb29sZWFuKG9wdGlvbikge1xuICAgIG9wdGlvbiA9IGNsZWFuTm9uQWNjZXNpYmxlU2V0dGluZ3Mob3B0aW9uKTtcbiAgICBvcHRpb24uZm9yY2VCYXNlVHlwZSA9IEpTT05fQkFTRVRZUEVTLmJvb2w7XG4gICAgb3B0aW9uLmlzQXJyYXkgPSB0cnVlO1xuICAgIHJldHVybiBKc29uUHJvcGVydHkob3B0aW9uKTtcbn1cbi8qKlxuICogVGhpcyBpcyBhIHByb3BlcnR5IHRoYXQgY29udmVydHMgdG8gYSBjbGFzc2luc3RhbmNlIGFycmF5XG4gKiB3aGVuIGRlc2VyaWxpemluZyBpdCB3aWxsIGJlIGNyZWF0ZWQgdGhyb3VnaCB0aGUgY29uc3RydWN0b3IuXG4gKiB3aGVuIHNlcmlhbGl6aWduIGl0IHdpbGwgZm9yY2UgaXQgdGhyb3VnaCB0aGUgcHJvdG90eXBlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gSnNvbkFycmF5Q2xhc3NUeXBlZCh0eXBlLCBvcHRpb24pIHtcbiAgICBvcHRpb24gPSBjbGVhbk5vbkFjY2VzaWJsZVNldHRpbmdzKG9wdGlvbik7XG4gICAgb3B0aW9uLmlzQXJyYXkgPSB0cnVlO1xuICAgIG9wdGlvbi50eXBlID0gdHlwZTtcbiAgICByZXR1cm4gSnNvblByb3BlcnR5KG9wdGlvbik7XG59XG4vKipcbiAqIFRoaXMgaXMgYSBwcm9wZXJ0eSB0aGF0IGhlbHBzIGVhc2UgbWFwcGluZyBzb21ldGhpbmcgaW4gYW5kIG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gSnNvbk1hcHBpbmcocGFyYW1zKSB7XG4gICAgdmFyIF9hO1xuICAgIC8vIGNsZWFuIHRoZSBpbnB1dC5cbiAgICB2YXIgb3B0aW9uID0gY2xlYW5Ob25BY2Nlc2libGVTZXR0aW5ncygoX2EgPSBwYXJhbXMub3B0aW9uKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiB7fSk7XG4gICAgLy8gc2V0IHRoZSB0eXBlXG4gICAgaWYgKHBhcmFtcy50eXBlKVxuICAgICAgICBvcHRpb24udHlwZSA9IHBhcmFtcy50eXBlO1xuICAgIC8vIFNldCBtYXBwaW5nIGZ1bmN0aW9ucyBcbiAgICBvcHRpb24ubWFwcGluZ0Z1bmN0aW9ucyA9IHtcbiAgICAgICAgb3V0OiBwYXJhbXMub3V0RnVuY3Rpb24sXG4gICAgICAgIGluOiBwYXJhbXMuaW5GdW5jdGlvbixcbiAgICB9O1xuICAgIHJldHVybiBKc29uUHJvcGVydHkob3B0aW9uKTtcbn1cbi8qKlxuICogVGhpcyBpcyBhIHByb3BlcnR5IHRvIGVhc2UgdGhlIGFjdGlvbiBvZiBoYXZpbmcgYSByZWNvcmQgaW4gdGhlIHN5c3RlbSBidXQgYW4gYXJyYXkgaW4gdGhlIGpzb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEpzb25NYXBwaW5nUmVjb3JkSW5BcnJheU91dChvcHRpb24pIHtcbiAgICAvLyBjbGVhbiB0aGUgaW5wdXQuXG4gICAgdmFyIHR5cGUgPSBvcHRpb24udHlwZTtcbiAgICBvcHRpb24gPSBjbGVhbk5vbkFjY2VzaWJsZVNldHRpbmdzKG9wdGlvbiAhPT0gbnVsbCAmJiBvcHRpb24gIT09IHZvaWQgMCA/IG9wdGlvbiA6IHt9KTtcbiAgICB2YXIgb3V0ZnVuYyA9IGZ1bmN0aW9uIChjb2wsIHMpIHsgcmV0dXJuIE9iamVjdC52YWx1ZXMoY29sKS5tYXAoZnVuY3Rpb24gKHApIHsgcmV0dXJuIHMocCk7IH0pOyB9O1xuICAgIHZhciBpbmZ1bmMgPSBmdW5jdGlvbiAoY29sLCBkKSB7XG4gICAgICAgIHZhciByID0ge307XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgY29sLm1hcChmdW5jdGlvbiAocCkge1xuICAgICAgICAgICAgdmFyIG8gPSBkKHApO1xuICAgICAgICAgICAgdmFyIHYgPSBvW29wdGlvbi5LZXlQcm9wZXJ0eU5hbWVdO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2ID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB2ID0gb1tvcHRpb24uS2V5UHJvcGVydHlOYW1lXSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodiA9PT0gbnVsbCB8fCB2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImFmdGVyIGNhbGxpbmcgZnVuY3Rpb24gXCIuY29uY2F0KG9wdGlvbi5LZXlQcm9wZXJ0eU5hbWUsIFwiIGtleSB2YWx1ZSB3YXMgJ1wiKS5jb25jYXQodiwgXCInIFwiKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2VBZGRvbiA9IHYubGVuZ3RoID4gMCA/ICcsIE5vdGUgdGhhdCBtZXNzYWdlIG11c3QgaGF2ZSAwIEFyZ3VtZW50cywgdGhhdCBhcmVudCBlaXRoZXIgb3B0aW9uYWwgb3IgaGF2ZSBkZWZhdWx0IHZhbHVlcycgOiAnJztcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIlNvbWV0aGluZyB3ZW50IHdyb25nIHdpdGggY2FsbGlnbiBtZXRob2QgJ1wiLmNvbmNhdChvcHRpb24uS2V5UHJvcGVydHlOYW1lLCBcIidcIikuY29uY2F0KG1lc3NhZ2VBZGRvbik7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByW3ZdID0gbztcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByO1xuICAgIH07XG4gICAgaWYgKHR5cGUpIHtcbiAgICAgICAgb3B0aW9uLnR5cGUgPSB0eXBlO1xuICAgIH1cbiAgICAvLyBTZXQgbWFwcGluZyBmdW5jdGlvbnMgXG4gICAgb3B0aW9uLm1hcHBpbmdGdW5jdGlvbnMgPSB7XG4gICAgICAgIG91dDogb3V0ZnVuYyxcbiAgICAgICAgaW46IGluZnVuYyxcbiAgICB9O1xuICAgIHJldHVybiBKc29uUHJvcGVydHkob3B0aW9uKTtcbn1cbmZ1bmN0aW9uIGNsZWFuT2JqZWN0T3B0aW9ucyhvcHRpb24pIHtcbiAgICBpZiAoIW9wdGlvbilcbiAgICAgICAgb3B0aW9uID0ge307XG4gICAgaWYgKCFvcHRpb24ub25BZnRlckRlU2VyaWFsaXphdGlvbikge1xuICAgICAgICBvcHRpb24ub25BZnRlckRlU2VyaWFsaXphdGlvbiA9IGZ1bmN0aW9uIChvKSB7IH07XG4gICAgfVxuICAgIGlmICghb3B0aW9uLnNjaGVtZSB8fCBvcHRpb24uc2NoZW1lLmxlbmd0aCA9PSAwKVxuICAgICAgICBvcHRpb24uc2NoZW1lID0gW0JBU0VfU0NIRU1FXTtcbiAgICByZXR1cm4gb3B0aW9uO1xufVxuZXhwb3J0IGZ1bmN0aW9uIEpzb25PYmplY3Qob3B0aW9uKSB7XG4gICAgb3B0aW9uID0gY2xlYW5PYmplY3RPcHRpb25zKG9wdGlvbik7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgdmFyIHNjaGVtZXMgPSBvcHRpb24gPT09IG51bGwgfHwgb3B0aW9uID09PSB2b2lkIDAgPyB2b2lkIDAgOiBvcHRpb24uc2NoZW1lO1xuICAgICAgICBpZiAoIXNjaGVtZXMgfHwgc2NoZW1lcy5sZW5ndGggPT0gMClcbiAgICAgICAgICAgIHNjaGVtZXMgPSBbQkFTRV9TQ0hFTUVdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNjaGVtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBzY2hlbWUgPSBzY2hlbWVzW2ldO1xuICAgICAgICAgICAgLy8gU0VSSUFMSVpBVElPTiBcbiAgICAgICAgICAgIGlmIChvcHRpb24ub25BZnRlckRlU2VyaWFsaXphdGlvbilcbiAgICAgICAgICAgICAgICBzZXRPd25NZXRhRGF0YShKU09OX1RBR1MuSlNPTl9PQkpFQ1RfT05fQUZURVJfREVfU0VSSUFMSVpBVElPTiwgdGFyZ2V0LCBvcHRpb24ub25BZnRlckRlU2VyaWFsaXphdGlvbiwgc2NoZW1lKTtcbiAgICAgICAgICAgIGlmIChvcHRpb24ub25BZnRlclNlcmlhbGl6YXRpb25fYmVmb3JlU3RyaW5nKVxuICAgICAgICAgICAgICAgIHNldE93bk1ldGFEYXRhKEpTT05fVEFHUy5KU09OX09CSkVDVF9PTl9BRlRFUl9TRVJJQUxJWkFUSU9OX0JFRk9SRV9TVFJJTkcsIHRhcmdldCwgb3B0aW9uLm9uQWZ0ZXJTZXJpYWxpemF0aW9uX2JlZm9yZVN0cmluZywgc2NoZW1lKTtcbiAgICAgICAgICAgIGlmIChvcHRpb24ub25BZnRlclNlcmlhbGl6YXRpb24pXG4gICAgICAgICAgICAgICAgc2V0T3duTWV0YURhdGEoSlNPTl9UQUdTLkpTT05fT0JKRUNUX09OX0FGVEVSX1NFUklBTElaQVRJT04sIHRhcmdldCwgb3B0aW9uLm9uQWZ0ZXJTZXJpYWxpemF0aW9uLCBzY2hlbWUpO1xuICAgICAgICAgICAgLy8gREUgU0VSSUFMSVpBVElPTiBcbiAgICAgICAgICAgIGlmIChvcHRpb24ub25CZWZvcmVTZXJpYWxpemF0aW9uKVxuICAgICAgICAgICAgICAgIHNldE93bk1ldGFEYXRhKEpTT05fVEFHUy5KU09OX09CSkVDVF9PTl9CRUZPUkVfU0VSSUFMSVpBVElPTiwgdGFyZ2V0LCBvcHRpb24ub25CZWZvcmVTZXJpYWxpemF0aW9uLCBzY2hlbWUpO1xuICAgICAgICAgICAgaWYgKG9wdGlvbi5vbkJlZm9yZURlU2VyaWFsaXphdGlvbilcbiAgICAgICAgICAgICAgICBzZXRPd25NZXRhRGF0YShKU09OX1RBR1MuSlNPTl9PQkpFQ1RfT05fQkVGT1JFX0RFX1NFUklBTElaQVRJT04sIHRhcmdldCwgb3B0aW9uLm9uQmVmb3JlRGVTZXJpYWxpemF0aW9uLCBzY2hlbWUpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbiIsImltcG9ydCB7IGdldE1ldGFkYXRhLCBnZXRPd25NZXRhRGF0YSwgZ2V0T3duTWV0YURhdGFLZXlzLCBnZXRNZXRhRGF0YUtleXMsIGhhc01ldGFEYXRhLCBnZXRQcm90b3R5cGUsIHNldFByb3RvdHlwZSB9IGZyb20gXCIuL0pzb25Nb2R1bGVCYXNlRnVuY3Rpb25cIjtcbmltcG9ydCB7IEJBU0VfU0NIRU1FLCBKU09OX0JBU0VUWVBFUywgSlNPTl9UQUdTLCBOb091dHB1dCB9IGZyb20gXCIuL0pzb25Nb2R1bGVDb25zdGFudHNcIjtcbnZhciBKU09OSGFuZGxlciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBKU09OSGFuZGxlcigpIHtcbiAgICB9XG4gICAgSlNPTkhhbmRsZXIuc2VyaWFsaXplID0gZnVuY3Rpb24gKG9iaiwgc2NoZW1lKSB7XG4gICAgICAgIGlmIChzY2hlbWUgPT09IHZvaWQgMCkgeyBzY2hlbWUgPSBCQVNFX1NDSEVNRTsgfVxuICAgICAgICB2YXIgbyA9IEpTT05IYW5kbGVyLnNlcmlhbGl6ZVJhdyhvYmosIHNjaGVtZSk7XG4gICAgICAgIHZhciBzdHIgPSBKU09OLnN0cmluZ2lmeShvKTtcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gQWZ0ZXIgc2VyaWFsaXplIGZ1bmN0aW9uIGdldCBpdCBhbmQgcnVuIGl0LiBcbiAgICAgICAgdmFyIE9iamVjdE1ldGEgPSBnZXRPd25NZXRhRGF0YUtleXMob2JqKTtcbiAgICAgICAgaWYgKE9iamVjdE1ldGEuaW5jbHVkZXMoSlNPTl9UQUdTLkpTT05fT0JKRUNUX09OX0FGVEVSX1NFUklBTElaQVRJT04pKSB7XG4gICAgICAgICAgICB2YXIgZiA9IGdldE93bk1ldGFEYXRhKEpTT05fVEFHUy5KU09OX09CSkVDVF9PTl9BRlRFUl9TRVJJQUxJWkFUSU9OLCBvYmosIHNjaGVtZSk7XG4gICAgICAgICAgICBpZiAoZilcbiAgICAgICAgICAgICAgICBzdHIgPSBmKHN0cik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9O1xuICAgIEpTT05IYW5kbGVyLnNlcmlhbGl6ZVJhdyA9IGZ1bmN0aW9uIChvYmosIHNjaGVtZSwgcGFyZW50TmFtZSkge1xuICAgICAgICBpZiAoc2NoZW1lID09PSB2b2lkIDApIHsgc2NoZW1lID0gQkFTRV9TQ0hFTUU7IH1cbiAgICAgICAgaWYgKHBhcmVudE5hbWUgPT09IHZvaWQgMCkgeyBwYXJlbnROYW1lID0gJ0ZJUlNUJzsgfVxuICAgICAgICBpZiAoIW9iaikge1xuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZiB0aGlzIGlzIGEgYmFzZSB0eXBlIGp1c3QgcmV0dXJuXG4gICAgICAgIHZhciB0eXBlID0gdHlwZW9mIG9iajtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgICAgIHJldHVybiBKU09OSGFuZGxlci5kZXNlcmlhbGl6ZUFuZEZvcmNlU2ltcGxlKCdzdHJpbmcnLCBvYmosIHNjaGVtZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgICAgIGNhc2UgJ251bWJlcic6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuICAgICAgICAvLyBpbiBjYXNlIHRoaXMgaXMgYSByZWd1bGFyIG9iamVjdCB3aXRoIG5vIGRlY29yYXRvcnMgXG4gICAgICAgIGlmICghaGFzTWV0YURhdGEob2JqLCBzY2hlbWUpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiAob2JqKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIHNlcmlhbGl6ZWRPYmplY3QgaXMgYSBuZXcgb2JqZWN0LCB3aXRob3V0IG5vbiBKc29ucHJvcGVydGllc1xuICAgICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICAgIC8vIEVWRU5UIEJGT1JFIFNFUklBTElaQVRJT05cbiAgICAgICAgdmFyIE9iamVjdE1ldGEgPSBnZXRPd25NZXRhRGF0YUtleXMob2JqKTtcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gQWZ0ZXIgc2VyaWFsaXplIGZ1bmN0aW9uIGdldCBpdCBhbmQgcnVuIGl0LiBcbiAgICAgICAgaWYgKE9iamVjdE1ldGEuaW5jbHVkZXMoSlNPTl9UQUdTLkpTT05fT0JKRUNUX09OX0JFRk9SRV9TRVJJQUxJWkFUSU9OKSkge1xuICAgICAgICAgICAgLy8gZ2V0IG1ldGEgZGF0YSBmdW5jdGlvbiBhbmQgcnVuIGl0IG9uIHRoZSByZXN1bHRpbmcgb2JqZWN0XG4gICAgICAgICAgICB2YXIgZiA9IGdldE93bk1ldGFEYXRhKEpTT05fVEFHUy5KU09OX09CSkVDVF9PTl9CRUZPUkVfU0VSSUFMSVpBVElPTiwgb2JqLCBzY2hlbWUpO1xuICAgICAgICAgICAgaWYgKGYpXG4gICAgICAgICAgICAgICAgZihvYmopO1xuICAgICAgICB9XG4gICAgICAgIC8vIGdldCBwcm9wZXJ0eW5hbWVzIGFuZCBsb29wIHRocm91Z2ggXG4gICAgICAgIHZhciBwcm9wZXJ0eU5hbWVzO1xuICAgICAgICBwcm9wZXJ0eU5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqKTtcbiAgICAgICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgLy8gZ2V0IGJhc2ljIHByb3BlcnRpZXNcbiAgICAgICAgICAgIHZhciBrZXkgPSBwcm9wZXJ0eU5hbWVzW2ldO1xuICAgICAgICAgICAgdmFyIG1ldGEgPSBnZXRNZXRhRGF0YUtleXMob2JqLCBrZXksIHNjaGVtZSk7XG4gICAgICAgICAgICAvLyBjaGVjayBpZiB0aGUgc2NoZW1lIHdlIGFyZSBhYm91dCB0byBleHBvcnQgaGF2ZSBUaGUgUHJvcGVydHkgaW4gaXRcbiAgICAgICAgICAgIGlmICghbWV0YS5pbmNsdWRlcyhKU09OX1RBR1MuSlNPTl9QUk9QRVJUWSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJjb250aW51ZVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gY3JlYXRlIHRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSwgYnV0IGlmIHRoZXJlIGlzIGEgbWFwcGVkIG91dCBuYW1lLCBnZXQgdGhhdCBpbnN0ZWFkXG4gICAgICAgICAgICB2YXIgUHJvcGVydHlOYW1lID0ga2V5O1xuICAgICAgICAgICAgaWYgKG1ldGEuaW5jbHVkZXMoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfTkFNRV9NQVBfT1VUKSkge1xuICAgICAgICAgICAgICAgIFByb3BlcnR5TmFtZSA9IGdldE1ldGFkYXRhKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX05BTUVfTUFQX09VVCwgb2JqLCBrZXksIHNjaGVtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiB0aGUgaXRlbSBpcyB0eXBlZCwgdGhlbiB3ZSBleGNhbmdlIHRoZSBwcm90b3R5cGVzIGZvciBlYWNoIG9iamVjdCBhcyB3ZSBkZXNlcmlhbGl6ZS4gXG4gICAgICAgICAgICAvLyB3ZSBkbyB0aGlzIGluIGEgZnVuY2l0b24gdG8gbWluaW1pemUgaWYgc3RhdGVtZW50IGNoYW9zO1xuICAgICAgICAgICAgdmFyIHR5cGVkY29udmVyc2lvbiA9IGZ1bmN0aW9uICh2LCBzZXIpIHsgcmV0dXJuIHY7IH07XG4gICAgICAgICAgICB2YXIgc2tpcEZvcmNlVHlwZSA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKG1ldGEuaW5jbHVkZXMoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfVFlQRURfU0tJUF9GT1JDRUQpKSB7XG4gICAgICAgICAgICAgICAgc2tpcEZvcmNlVHlwZSA9IGdldE1ldGFkYXRhKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX1RZUEVEX1NLSVBfRk9SQ0VELCBvYmosIGtleSwgc2NoZW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtZXRhLmluY2x1ZGVzKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX1RZUEVEKSAmJiAhc2tpcEZvcmNlVHlwZSkge1xuICAgICAgICAgICAgICAgIHR5cGVkY29udmVyc2lvbiA9IGZ1bmN0aW9uICh2LCBzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gZ2V0IHByb3RvdHlwZXM7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkdXJpbmcgPSAoZ2V0TWV0YWRhdGEoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfVFlQRUQsIG9iaiwga2V5LCBzY2hlbWUpKS5wcm90b3R5cGU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiZWZvcmUgPSBnZXRQcm90b3R5cGUodik7XG4gICAgICAgICAgICAgICAgICAgIC8vIHNldCBwcm90b3R5cGUgc2VyaWFsaXplIHRoZW4gc2V0IHByb3RvdHlwZSBiYWNrIFxuICAgICAgICAgICAgICAgICAgICBzZXRQcm90b3R5cGUodiwgZHVyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHIgPSBzZXIodik7XG4gICAgICAgICAgICAgICAgICAgIHNldFByb3RvdHlwZSh2LCBiZWZvcmUpO1xuICAgICAgICAgICAgICAgICAgICAvLyBkb25lXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBhIG1hcHBpbmcgZnVuY3Rpb25cbiAgICAgICAgICAgIHZhciBvdXQgPSBudWxsO1xuICAgICAgICAgICAgaWYgKG1ldGEuaW5jbHVkZXMoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfRlVOQ19NQVBfT1VUKSkge1xuICAgICAgICAgICAgICAgIHZhciBvdXRGdW5jdGlvbl8xID0gZ2V0TWV0YWRhdGEoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfRlVOQ19NQVBfT1VULCBvYmosIGtleSwgc2NoZW1lKTtcbiAgICAgICAgICAgICAgICB2YXIgX291dEYgPSBmdW5jdGlvbiAobzEpIHsgcmV0dXJuIG91dEZ1bmN0aW9uXzEobzEsIGZ1bmN0aW9uIChvMikgeyByZXR1cm4gdHlwZWRjb252ZXJzaW9uKG8yLCBmdW5jdGlvbiAobzMpIHsgcmV0dXJuIEpTT05IYW5kbGVyLnNlcmlhbGl6ZVJhdyhvMywgc2NoZW1lLCBwYXJlbnROYW1lICsgJzonICsga2V5KTsgfSk7IH0pOyB9O1xuICAgICAgICAgICAgICAgIG91dCA9IF9vdXRGKG9ialtrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG1ldGEuaW5jbHVkZXMoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfRk9SQ0VfQVJSQVkpKSB7XG4gICAgICAgICAgICAgICAgb3V0ID0gW107XG4gICAgICAgICAgICAgICAgaWYgKG9ialtrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KG9ialtrZXldKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIF9sb29wXzIgPSBmdW5jdGlvbiAoaikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlID0gdHlwZWRjb252ZXJzaW9uKG9ialtrZXldW2pdLCBmdW5jdGlvbiAobykgeyByZXR1cm4gSlNPTkhhbmRsZXIuc2VyaWFsaXplUmF3KG8sIHNjaGVtZSwgcGFyZW50TmFtZSArICc6WycgKyBqICsgJ106JyArIGtleSk7IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dC5wdXNoKGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgb2JqW2tleV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfbG9vcF8yKGopO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0LnB1c2godHlwZWRjb252ZXJzaW9uKG9ialtrZXldLCBmdW5jdGlvbiAobykgeyByZXR1cm4gSlNPTkhhbmRsZXIuc2VyaWFsaXplUmF3KG8sIHNjaGVtZSwgcGFyZW50TmFtZSArICc6JyArIGtleSk7IH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG91dCA9IHR5cGVkY29udmVyc2lvbihvYmpba2V5XSwgZnVuY3Rpb24gKG8pIHsgcmV0dXJuIEpTT05IYW5kbGVyLnNlcmlhbGl6ZVJhdyhvLCBzY2hlbWUsIHBhcmVudE5hbWUgKyAnOicgKyBrZXkpOyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEhBTkRMRSBGb3JjZSBUeXBpbmdcbiAgICAgICAgICAgIGlmIChtZXRhLmluY2x1ZGVzKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX0ZPUkNFX0JBU0VfVFlQRSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdHlwZWtleV8xID0gZ2V0TWV0YWRhdGEoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfRk9SQ0VfQkFTRV9UWVBFLCBvYmosIGtleSwgc2NoZW1lKTtcbiAgICAgICAgICAgICAgICB2YXIgY29udkZ1bmMgPSBmdW5jdGlvbiAoZSkgeyByZXR1cm4gSlNPTkhhbmRsZXIuZGVzZXJpYWxpemVBbmRGb3JjZVNpbXBsZSh0eXBla2V5XzEsIGUsIHNjaGVtZSk7IH07XG4gICAgICAgICAgICAgICAgaWYgKG1ldGEuaW5jbHVkZXMoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfRk9SQ0VfQVJSQVkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0ZW1wID0gb3V0O1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV3b3V0ID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGlfMSA9IDA7IGlfMSA8IHRlbXAubGVuZ3RoOyBpXzErKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3b3V0LnB1c2goY29udkZ1bmModGVtcFtpXzFdKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb3V0ID0gbmV3b3V0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ID0gY29udkZ1bmMob2JqW2tleV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdFtQcm9wZXJ0eU5hbWVdID0gb3V0O1xuICAgICAgICB9O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BlcnR5TmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIF9sb29wXzEoaSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gQWZ0ZXIgc2VyaWFsaXplIGZ1bmN0aW9uIGdldCBpdCBhbmQgcnVuIGl0LiBcbiAgICAgICAgaWYgKE9iamVjdE1ldGEuaW5jbHVkZXMoSlNPTl9UQUdTLkpTT05fT0JKRUNUX09OX0FGVEVSX1NFUklBTElaQVRJT05fQkVGT1JFX1NUUklORykpIHtcbiAgICAgICAgICAgIHZhciBmID0gZ2V0T3duTWV0YURhdGEoSlNPTl9UQUdTLkpTT05fT0JKRUNUX09OX0FGVEVSX1NFUklBTElaQVRJT05fQkVGT1JFX1NUUklORywgb2JqLCBzY2hlbWUpO1xuICAgICAgICAgICAgaWYgKGYpXG4gICAgICAgICAgICAgICAgZihyZXN1bHQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgICBKU09OSGFuZGxlci5kZXNlcmlhbGl6ZSA9IGZ1bmN0aW9uICh0YXJnZXQsIGpzb24sIHNjaGVtZSwgd3JpdGVPdXQpIHtcbiAgICAgICAgaWYgKHNjaGVtZSA9PT0gdm9pZCAwKSB7IHNjaGVtZSA9IEJBU0VfU0NIRU1FOyB9XG4gICAgICAgIGlmICghd3JpdGVPdXQpIHtcbiAgICAgICAgICAgIHdyaXRlT3V0ID0gTm9PdXRwdXQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YganNvbjtcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGpzb24gPSBKU09OLnBhcnNlKGpzb24pO1xuICAgICAgICB9XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICAgICAgICAgIHdyaXRlT3V0Lm91dEVycm9yKCdDYW5ub3QgZGVyc2VyaWFsaXplIHR5cGUgb2YgJyArIHR5cGUpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShqc29uKSkge1xuICAgICAgICAgICAgdmFyIGFyciA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBqc29uLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgYXJyLnB1c2godGhpcy5kZXNlcmlhbGl6ZVJhdyh0YXJnZXQsIGpzb25baV0sIHNjaGVtZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFycjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRlc2VyaWFsaXplUmF3KHRhcmdldCwganNvbiwgc2NoZW1lKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgSlNPTkhhbmRsZXIuZGVzZXJpYWxpemVBbmRGb3JjZVNpbXBsZSA9IGZ1bmN0aW9uICh0eXBla2V5LCBvYmosIHNjaGVtZSkge1xuICAgICAgICBpZiAoc2NoZW1lID09PSB2b2lkIDApIHsgc2NoZW1lID0gQkFTRV9TQ0hFTUU7IH1cbiAgICAgICAgdmFyIG91dCA9IG9iajtcbiAgICAgICAgdmFyIGNvbnZGdW5jID0gZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGU7IH07XG4gICAgICAgIHN3aXRjaCAodHlwZWtleSkge1xuICAgICAgICAgICAgY2FzZSBKU09OX0JBU0VUWVBFUy5ib29sOlxuICAgICAgICAgICAgICAgIGNvbnZGdW5jID0gZnVuY3Rpb24gKGlucHV0KSB7IHJldHVybiBCb29sZWFuKGlucHV0KTsgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgSlNPTl9CQVNFVFlQRVMuc3RyaW5nOlxuICAgICAgICAgICAgICAgIGlmIChvYmogPT0gbnVsbClcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBvYmogPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zdCBzdHIgPSBvYmoucmVwbGFjZUFsbChcIjw8ZHA+PlwiLCdcXFxcXCInKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvYmopKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHIgPSBKU09OLnN0cmluZ2lmeShvYmopO1xuICAgICAgICAgICAgICAgICAgICAvL3N0ciA9IHN0ci5yZXBsYWNlQWxsKFwiPDxkcD4+XCIsJ1xcXFxcIicpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0eXBlb2Ygb2JqID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChoYXNNZXRhRGF0YShvYmosIHNjaGVtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBKU09OSGFuZGxlci5zZXJpYWxpemUob2JqLCBzY2hlbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9sZXQgc3RyID0gSlNPTi5zdHJpbmdpZnkob2JqKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vc3RyID0gc3RyLnJlcGxhY2VBbGwoJ1xcXFxcIicsXCI8PGRwPj5cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL3JldHVybiBzdHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShvYmopO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnZGdW5jID0gZnVuY3Rpb24gKGlucHV0KSB7IHJldHVybiBTdHJpbmcoaW5wdXQpOyB9O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBKU09OX0JBU0VUWVBFUy5udW1iZXI6XG4gICAgICAgICAgICAgICAgaWYgKG9iaiA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG9iaiA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29udkZ1bmMgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbnVtYmVyVmFsdWUgPSBOdW1iZXIoZSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpc05hTihudW1iZXJWYWx1ZSkgPyAwIDogbnVtYmVyVmFsdWU7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBvdXQgPSBjb252RnVuYyhvdXQpO1xuICAgICAgICByZXR1cm4gb3V0O1xuICAgIH07XG4gICAgSlNPTkhhbmRsZXIuZGVzZXJpYWxpemVSYXcgPSBmdW5jdGlvbiAodGFyZ2V0LCBvYmosIHNjaGVtZSwgcGFyZW50TmFtZSkge1xuICAgICAgICBpZiAoc2NoZW1lID09PSB2b2lkIDApIHsgc2NoZW1lID0gQkFTRV9TQ0hFTUU7IH1cbiAgICAgICAgaWYgKHBhcmVudE5hbWUgPT09IHZvaWQgMCkgeyBwYXJlbnROYW1lID0gJ0ZJUlNUJzsgfVxuICAgICAgICBpZiAoIW9iaikge1xuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuICAgICAgICAvLyBzZXJpYWxpemVkT2JqZWN0IGlzIGEgbmV3IG9iamVjdCwgd2l0aG91dCBub24gSnNvbnByb3BlcnRpZXNcbiAgICAgICAgdmFyIHJlc3VsdCA9IG5ldyB0YXJnZXQoKTtcbiAgICAgICAgdmFyIHByb3RvdHlwZSA9IHRhcmdldC5wcm90b3R5cGU7XG4gICAgICAgIC8vIEVWRU5UIE9OIEFGVEVSIERFU0VSSUFMSVpFXG4gICAgICAgIHZhciBPYmplY3RNZXRhID0gZ2V0T3duTWV0YURhdGFLZXlzKHRhcmdldCk7XG4gICAgICAgIGlmIChPYmplY3RNZXRhLmluY2x1ZGVzKEpTT05fVEFHUy5KU09OX09CSkVDVF9PTl9CRUZPUkVfREVfU0VSSUFMSVpBVElPTikpIHtcbiAgICAgICAgICAgIC8vIGdldCBtZXRhIGRhdGEgZnVuY3Rpb24gYW5kIHJ1biBpdCBvbiB0aGUgcmVzdWx0aW5nIG9iamVjdFxuICAgICAgICAgICAgdmFyIGYgPSBnZXRPd25NZXRhRGF0YShKU09OX1RBR1MuSlNPTl9PQkpFQ1RfT05fQkVGT1JFX0RFX1NFUklBTElaQVRJT04sIHJlc3VsdCwgc2NoZW1lKTtcbiAgICAgICAgICAgIGlmIChmKVxuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGYocmVzdWx0LCBvYmopO1xuICAgICAgICAgICAgLy8gaW5jYXNlIHRoZSBCZWZvcmUgaGFzIGNoYW5nZWQgdGhlIHR5cGUgXG4gICAgICAgICAgICBpZiAoIUpTT05IYW5kbGVyLmFyZVNhbWVQcm90b3R5cGVzKHJlc3VsdCwgdGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgIHRhcmdldCA9IGdldFByb3RvdHlwZShyZXN1bHQpLmNvbnN0cnVjdG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGdldCBwcm9wZXJ0eW5hbWVzIGFuZCBsb29wIHRocm91Z2ggXG4gICAgICAgIHZhciBwcm9wZXJ0eU5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMob2JqKTtcbiAgICAgICAgdmFyIF9sb29wXzMgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgLy8gZ2V0IGJhc2ljIHByb3BlcnRpZXNcbiAgICAgICAgICAgIHZhciBrZXkgPSBwcm9wZXJ0eU5hbWVzW2ldO1xuICAgICAgICAgICAgdmFyIGluS2V5ID0ga2V5O1xuICAgICAgICAgICAgdmFyIG1ldGEgPSBnZXRNZXRhRGF0YUtleXModGFyZ2V0LCBrZXksIHNjaGVtZSk7XG4gICAgICAgICAgICB2YXIgUHJvcGVydHlOYW1lID0ga2V5O1xuICAgICAgICAgICAgaWYgKG1ldGEubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJjb250aW51ZVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaWYgdGhpcyBpcyBhbiBPdXQga2V5LCBjb252ZXJ0IGl0IHRvIGFuIElOIEtleSwgc28gd2UgY2FuIGdldCB0aGUgcmlnaHQgbWV0YSBkYXRhLiBcbiAgICAgICAgICAgIGlmIChtZXRhLmluY2x1ZGVzKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX05BTUVfTUFQX0lOKSkge1xuICAgICAgICAgICAgICAgIC8vIGdldCBvdXQga2V5IGZyb20gdGhlIGluIEtleVxuICAgICAgICAgICAgICAgIGtleSA9IGdldE1ldGFkYXRhKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX05BTUVfTUFQX0lOLCBwcm90b3R5cGUsIGtleSwgc2NoZW1lKTtcbiAgICAgICAgICAgICAgICAvLyBpbiBjYXNlIHRoYXQgYSBrZXkgYmVsb25nZWQgdG8gYW5vdGhlciBzY2hlbWUsIHRoZW4gdGhlIGtleSBpcyB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAvL1x0aWYoa2V5PT11bmRlZmluZWQpe1xuICAgICAgICAgICAgICAgIC8vXHRcdGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIC8vXHR9IFxuICAgICAgICAgICAgICAgIG1ldGEgPSBnZXRNZXRhRGF0YUtleXModGFyZ2V0LCBrZXksIHNjaGVtZSk7XG4gICAgICAgICAgICAgICAgUHJvcGVydHlOYW1lID0ga2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gR2V0IHRoZSBjb25zdHJ1Y3RvciBpZiB0aGVyZSBpcyBhbnksIEdlbmVyaWNzIHRha2UgcHJpb3JpdHlcbiAgICAgICAgICAgIHZhciBvdXQgPSBudWxsO1xuICAgICAgICAgICAgdmFyIGNvbnN0ciA9IGdldE1ldGFkYXRhKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX1RZUEVELCBwcm90b3R5cGUsIGtleSwgc2NoZW1lKTtcbiAgICAgICAgICAgIGlmIChtZXRhLmluY2x1ZGVzKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX0ZVTkNfTUFQX0lOKSkge1xuICAgICAgICAgICAgICAgIHZhciBpbkZ1bmN0aW9uID0gZ2V0TWV0YWRhdGEoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfRlVOQ19NQVBfSU4sIHByb3RvdHlwZSwga2V5LCBzY2hlbWUpO1xuICAgICAgICAgICAgICAgIGlmIChjb25zdHIpIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ID0gaW5GdW5jdGlvbihvYmpbaW5LZXldLCBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmVzID0gSlNPTkhhbmRsZXIuZGVzZXJpYWxpemVSYXcoY29uc3RyLCBvYmosIHNjaGVtZSwga2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXM7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ID0gaW5GdW5jdGlvbihvYmpbaW5LZXldLCBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmo7IH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKG1ldGEuaW5jbHVkZXMoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfRk9SQ0VfQVJSQVkpKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgaXQgbmVlZHMgZGVzZXJpYWxpemluZ1xuICAgICAgICAgICAgICAgIHZhciBjb252ZXJ0XzEgPSBmdW5jdGlvbiAoZSkgeyByZXR1cm4gZTsgfTtcbiAgICAgICAgICAgICAgICBpZiAoY29uc3RyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnZlcnRfMSA9IGZ1bmN0aW9uIChlKSB7IHJldHVybiBKU09OSGFuZGxlci5kZXNlcmlhbGl6ZVJhdyhjb25zdHIsIGUsIHNjaGVtZSwga2V5KTsgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGFzIHN0YXRlZCBhYm92ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBpZiBpdCBuZWVkcyB0byBiZSBjb252ZXJ0ZWQgdG8gYSBzaW1wbGUgdHlwZS4gRVZFTiBhZnRlciBkZXNlcmlhbGl6aW5nXG4gICAgICAgICAgICAgICAgdmFyIGNvbnZlcnQyID0gZnVuY3Rpb24gKGUsIHR5cGVrZXkpIHsgcmV0dXJuIGNvbnZlcnRfMShlKTsgfTtcbiAgICAgICAgICAgICAgICBpZiAobWV0YS5pbmNsdWRlcyhKU09OX1RBR1MuSlNPTl9QUk9QRVJUWV9GT1JDRV9CQVNFX1RZUEUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnZlcnQyID0gZnVuY3Rpb24gKGUsIHR5cGVrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBKU09OSGFuZGxlci5kZXNlcmlhbGl6ZUFuZEZvcmNlU2ltcGxlKHR5cGVrZXksIGUpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gYXMgc3RhdGVkIGFib3ZlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG91dCA9IFtdO1xuICAgICAgICAgICAgICAgIHZhciB0eXBla2V5ID0gZ2V0TWV0YWRhdGEoSlNPTl9UQUdTLkpTT05fUFJPUEVSVFlfRk9SQ0VfQkFTRV9UWVBFLCBwcm90b3R5cGUsIGtleSwgc2NoZW1lKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IG9ialtpbktleV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGUgPSBvYmpbaW5LZXldW2pdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgciA9IGNvbnZlcnQyKGUsIHR5cGVrZXkpO1xuICAgICAgICAgICAgICAgICAgICBvdXQucHVzaChyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoY29uc3RyKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dCA9IEpTT05IYW5kbGVyLmRlc2VyaWFsaXplUmF3KGNvbnN0ciwgb2JqW2luS2V5XSwgc2NoZW1lLCBrZXkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChtZXRhLmluY2x1ZGVzKEpTT05fVEFHUy5KU09OX1BST1BFUlRZX0ZPUkNFX0JBU0VfVFlQRSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHR5cGVLZXkgPSBnZXRNZXRhZGF0YShKU09OX1RBR1MuSlNPTl9QUk9QRVJUWV9GT1JDRV9CQVNFX1RZUEUsIHRhcmdldCwga2V5LCBzY2hlbWUpO1xuICAgICAgICAgICAgICAgICAgICBvdXQgPSBKU09OSGFuZGxlci5kZXNlcmlhbGl6ZUFuZEZvcmNlU2ltcGxlKHR5cGVLZXksIG9ialtpbktleV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0ID0gb2JqW2luS2V5XTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXN1bHRbUHJvcGVydHlOYW1lXSA9IG91dDtcbiAgICAgICAgfTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wZXJ0eU5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBfbG9vcF8zKGkpO1xuICAgICAgICB9XG4gICAgICAgIC8vIEVWRU5UIE9OIEFGVEVSIERFU0VSSUFMSVpFXG4gICAgICAgIE9iamVjdE1ldGEgPSBnZXRPd25NZXRhRGF0YUtleXMocmVzdWx0KTtcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgYW4gQWZ0ZXIgc2VyaWFsaXplIGZ1bmN0aW9uIGdldCBpdCBhbmQgcnVuIGl0LiBcbiAgICAgICAgaWYgKE9iamVjdE1ldGEuaW5jbHVkZXMoSlNPTl9UQUdTLkpTT05fT0JKRUNUX09OX0FGVEVSX0RFX1NFUklBTElaQVRJT04pKSB7XG4gICAgICAgICAgICAvLyBnZXQgbWV0YSBkYXRhIGZ1bmN0aW9uIGFuZCBydW4gaXQgb24gdGhlIHJlc3VsdGluZyBvYmplY3RcbiAgICAgICAgICAgIHZhciBmID0gZ2V0T3duTWV0YURhdGEoSlNPTl9UQUdTLkpTT05fT0JKRUNUX09OX0FGVEVSX0RFX1NFUklBTElaQVRJT04sIHJlc3VsdCwgc2NoZW1lKTtcbiAgICAgICAgICAgIGlmIChmKVxuICAgICAgICAgICAgICAgIGYocmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgSlNPTkhhbmRsZXIuY2hhbmdlUHJvdG90eXBlID0gZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG4gICAgICAgIHZhciBwcm90b3R5cGUgPSBnZXRQcm90b3R5cGUoc291cmNlKTtcbiAgICAgICAgc2V0UHJvdG90eXBlKHRhcmdldCwgcHJvdG90eXBlKTtcbiAgICB9O1xuICAgIEpTT05IYW5kbGVyLmFyZVNhbWVQcm90b3R5cGVzID0gZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG4gICAgICAgIHZhciBwcm90b3R5cGUxID0gZ2V0UHJvdG90eXBlKHNvdXJjZSk7XG4gICAgICAgIHZhciBwcm90b3R5cGUyID0gZ2V0UHJvdG90eXBlKHRhcmdldCk7XG4gICAgICAgIHJldHVybiBwcm90b3R5cGUxID09IHByb3RvdHlwZTI7XG4gICAgfTtcbiAgICByZXR1cm4gSlNPTkhhbmRsZXI7XG59KCkpO1xuZXhwb3J0IHsgSlNPTkhhbmRsZXIgfTtcbiIsIiBcbmltcG9ydCB7IEdyb2JDb2xsZWN0aW9uICwgR3JvYkdyb3VwICwgdHlwZSBHcm9iTm9kZVR5cGUgLCBHcm9iRGVyaXZlZE5vZGUsIEdyb2JEZXJpdmVkT3JpZ2luLCBHcm9iRml4ZWROb2RlLCBUVFJQR1N5c3RlbSAsIHV1aWR2NCB9IGZyb20gXCJ0dHJwZy1zeXN0ZW0tZ3JhcGhcIjtcbmltcG9ydCB7IEpzb25PYmplY3QsIEpzb25NYXBwaW5nUmVjb3JkSW5BcnJheU91dCwgSnNvbkNsYXNzVHlwZWQsIEpzb25TdHJpbmcsIEpzb25OdW1iZXIsIEpzb25BcnJheUNsYXNzVHlwZWQgfSBmcm9tIFwiZ3JvYmF4LWpzb24taGFuZGxlclwiO1xuaW1wb3J0IHsgQkFTRV9TQ0hFTUUgfSBmcm9tIFwiZ3JvYmF4LWpzb24taGFuZGxlclwiO1xuIFxuXG4vLyBpZiBzb21ldGhpbmcgaXMgQUdyYXBoSXRlbSBcbi8qXG5ASnNvblN0cmluZygpIFxucHVibGljIG5hbWUgO1xuKi9cbi8vIG9yaWdpbnNcbmV4cG9ydCBjbGFzcyBHcm9iSkRlcml2ZWRPcmlnaW4gZXh0ZW5kcyBHcm9iRGVyaXZlZE9yaWdpbiB7IFxuXHRASnNvblN0cmluZygpXG5cdHB1YmxpYyBzeW1ib2w6IHN0cmluZzsgXG5cdFxuXHRASnNvblN0cmluZygpXG5cdHB1YmxpYyBvcmlnaW5LZXk6IHN0cmluZyA7XG59XG5cbiBcbi8vIE5PREVTICBcbmV4cG9ydCBjbGFzcyBHcm9iSkRlcml2ZWROb2RlIGV4dGVuZHMgR3JvYkRlcml2ZWROb2RlIHtcblx0QEpzb25TdHJpbmcoKSBcblx0cHVibGljIG5hbWUgO1xuXG5cdEBKc29uU3RyaW5nKHtuYW1lIDogJ2NhbGN1bGF0aW9uU3RyaW5nJ30pXG5cdHB1YmxpYyBjYWxjOnN0cmluZztcblxuXHRASnNvbkFycmF5Q2xhc3NUeXBlZChHcm9iSkRlcml2ZWRPcmlnaW4se25hbWU6J2NhbGNPcmlnaW5zJ30pXG5cdHB1YmxpYyBvcmlnaW5zIDogR3JvYkpEZXJpdmVkT3JpZ2luW107XG59IFxuZXhwb3J0IGNsYXNzIEdyb2JKRml4ZWROb2RlIGV4dGVuZHMgR3JvYkZpeGVkTm9kZSB7XG5cblx0QEpzb25TdHJpbmcoKSBcblx0cHVibGljIG5hbWUgO1xuXG5cdEBKc29uTnVtYmVyKHtuYW1lIDogJ3N0YW5kYXJkVmFsdWUnfSlcblx0cHVibGljIF9fX3ZhbHVlOm51bWJlclxufVxuZXhwb3J0IHR5cGUgR3JvYkpOb2RlVHlwZSA9IEdyb2JKRGVyaXZlZE5vZGUgfCBHcm9iSkZpeGVkTm9kZTtcblxuIFxuXG4vLyAgQ09MTEVDVElPTlMgXG5leHBvcnQgY2xhc3MgR3JvYkNvbGxlY3Rpb25EZXJpdmVkIGV4dGVuZHMgR3JvYkNvbGxlY3Rpb248R3JvYkpEZXJpdmVkTm9kZT57IFxuXHRASnNvblN0cmluZygpIFxuXHRwdWJsaWMgbmFtZSA7XG5cdFxuXHRASnNvbk1hcHBpbmdSZWNvcmRJbkFycmF5T3V0KHtLZXlQcm9wZXJ0eU5hbWU6J2dldE5hbWUnLCBuYW1lOidkYXRhJyx0eXBlOkdyb2JKRGVyaXZlZE5vZGUgfSlcblx0bm9kZXNfbmFtZXM6IFJlY29yZDxzdHJpbmcsIEdyb2JKRGVyaXZlZE5vZGU+ID0ge31cbn0gXG5leHBvcnQgY2xhc3MgR3JvYkNvbGxlY3Rpb25GaXhlZCBleHRlbmRzIEdyb2JDb2xsZWN0aW9uPEdyb2JKRml4ZWROb2RlPntcblxuXHRASnNvblN0cmluZygpIFxuXHRwdWJsaWMgbmFtZSA7XG5cblx0QEpzb25NYXBwaW5nUmVjb3JkSW5BcnJheU91dCh7S2V5UHJvcGVydHlOYW1lOidnZXROYW1lJywgbmFtZTonZGF0YScsdHlwZTpHcm9iSkZpeGVkTm9kZSAgfSlcblx0bm9kZXNfbmFtZXM6IFJlY29yZDxzdHJpbmcsIEdyb2JKRml4ZWROb2RlPiA9IHt9XG59XG5cblxuXG5cblxuLy8gIEdST1VQUyBcbmV4cG9ydCBjbGFzcyBHcm9iR3JvdXBEZXJpdmVkIGV4dGVuZHMgR3JvYkdyb3VwPEdyb2JEZXJpdmVkTm9kZT57XG5cdFxuXHRASnNvblN0cmluZygpIFxuXHRwdWJsaWMgbmFtZSA7XG5cblx0QEpzb25NYXBwaW5nUmVjb3JkSW5BcnJheU91dCh7S2V5UHJvcGVydHlOYW1lOidnZXROYW1lJywgbmFtZTonZGF0YScsdHlwZSA6R3JvYkNvbGxlY3Rpb25EZXJpdmVkICB9KVxuXHRjb2xsZWN0aW9uc19uYW1lczogUmVjb3JkPHN0cmluZywgR3JvYkNvbGxlY3Rpb25EZXJpdmVkID4gPSB7fTtcblxufSBcbmV4cG9ydCBjbGFzcyBHcm9iR3JvdXBGaXhlZCBleHRlbmRzIEdyb2JHcm91cDxHcm9iRml4ZWROb2RlPntcblx0XG5cdEBKc29uU3RyaW5nKCkgXG5cdHB1YmxpYyBuYW1lIDtcblxuXHRASnNvbk1hcHBpbmdSZWNvcmRJbkFycmF5T3V0KHtLZXlQcm9wZXJ0eU5hbWU6J2dldE5hbWUnLCBuYW1lOidkYXRhJywgdHlwZSA6R3JvYkNvbGxlY3Rpb25GaXhlZCAgfSlcblx0Y29sbGVjdGlvbnNfbmFtZXM6IFJlY29yZDxzdHJpbmcsR3JvYkNvbGxlY3Rpb25GaXhlZD4gPSB7fTtcblxufVxuXG5cblxuXG5cbiBcbmV4cG9ydCBjbGFzcyBUVFJQR19TQ0hFTUVTIHsgXG5cdHN0YXRpYyBQUkVWSUVXID0nbWluaSc7XG59IFxuXG4vKipcbiAqICBoYW5kbGVzIE1vZGVsIG9wZXJhdGlvbnMgYW5kIERhdGEgQ29udGFpbm1lbnQsIFxuICogRW5zdXJlcyB0aGF0IGRhdGEgaXMgbWFpbnRhaW5lZCwgYXMgd2VsbCBhcyBncmFwaGxpbmtzXG4qL1xuQEpzb25PYmplY3Qoe1xuXHRvbkJlZm9yZVNlcmlhbGl6YXRpb246KHNlbGY6VFRSUEdTeXN0ZW1KU09ORm9ybWF0dGluZykgPT4ge30sXG5cdG9uQWZ0ZXJEZVNlcmlhbGl6YXRpb246KHNlbGY6VFRSUEdTeXN0ZW1KU09ORm9ybWF0dGluZywgLi4uYXJncyApID0+IHtcblx0XHRcblx0XHQvLyBhZGQgZGVyaXZlZCBhbmQgZml4ZWQgdG8gZ3JvdXBzIFxuXHRcdGlmICggIXNlbGYuZml4ZWRcdCApe1xuXHRcdFx0c2VsZi5fY3JlYXRlR3JvdXAoJ2ZpeGVkJyk7XG5cdFx0XHRzZWxmLmZpeGVkXHQgPSBzZWxmLl9nZXRHcm91cCgnZml4ZWQnKVx0IGFzIEdyb2JHcm91cEZpeGVkXHQ7XG5cdFx0fWVsc2V7XG5cdFx0XHRzZWxmLmRhdGFbJ2ZpeGVkJ10gPSBzZWxmLmZpeGVkO1xuXHRcdH1cblx0XHRpZiAoICFzZWxmLmRlcml2ZWQgKXtcblx0XHRcdHNlbGYuX2NyZWF0ZUdyb3VwKCdkZXJpdmVkJyk7XG5cdFx0XHRzZWxmLmRlcml2ZWQgPSBzZWxmLl9nZXRHcm91cCgnZGVyaXZlZCcpIGFzIEdyb2JHcm91cERlcml2ZWQ7XHRcblx0XHR9ZWxzZXtcblx0XHRcdHNlbGYuZGF0YVsnZGVyaXZlZCddID0gc2VsZi5kZXJpdmVkO1xuXHRcdH1cblxuXHRcdC8vIEZvciBhbGwgZ3JvdXBzIFxuXHRcdGZvcihjb25zdCBncm91cF9rZXkgaW4gKHNlbGYgYXMgYW55KS5kYXRhICl7XG5cdFx0XHRjb25zdCBncm91cCA9IChzZWxmIGFzIGFueSkuZGF0YVtncm91cF9rZXldO1xuXHRcdFx0Z3JvdXAucGFyZW50ID0gc2VsZjtcblxuXHRcdFx0Zm9yKGNvbnN0IGNvbF9rZXkgaW4gKGdyb3VwIGFzIGFueSkuY29sbGVjdGlvbnNfbmFtZXMgKXtcblx0XHRcdFx0Y29uc3QgY29sbGVjdGlvbiA6IEdyb2JDb2xsZWN0aW9uPEdyb2JOb2RlVHlwZT4gPSBncm91cC5jb2xsZWN0aW9uc19uYW1lc1tjb2xfa2V5XTtcblx0XHRcdFx0Y29sbGVjdGlvbi5wYXJlbnQgPSBncm91cDtcblx0XHRcdFx0Z3JvdXAuY29sbGVjdGlvbnNfbmFtZXNbY29sbGVjdGlvbi5nZXROYW1lKCldID0gY29sbGVjdGlvbjtcblxuXHRcdFx0XHRmb3IoIGNvbnN0IG5vZGVfa2V5IGluIChjb2xsZWN0aW9uIGFzIGFueSkubm9kZXNfbmFtZXMgKXtcblx0XHRcdFx0XHRjb25zdCBub2RlID0gKGNvbGxlY3Rpb24gYXMgYW55KS5ub2Rlc19uYW1lc1tub2RlX2tleV07XG5cdFx0XHRcdFx0bm9kZS5wYXJlbnQgPSBjb2xsZWN0aW9uO1xuXHRcdFx0XHRcdGNvbGxlY3Rpb24ubm9kZXNfbmFtZXNbbm9kZS5nZXROYW1lKCldID0gbm9kZTtcblxuXHRcdFx0XHRcdGNvbnN0IG9yaWdpbnMgOiBHcm9iRGVyaXZlZE9yaWdpbltdID0gbm9kZS5vcmlnaW5zID8/IFtdO1xuXHRcdFx0XHRcdG9yaWdpbnMuZm9yRWFjaCggb3JpZ2luICA9PiB7XG5cdFx0XHRcdFx0XHRsZXQga2V5cyA9IG9yaWdpbi5vcmlnaW5LZXkuc3BsaXQoJy4nKTtcblx0XHRcdFx0XHRcdGNvbnN0IHRhcmdldCA9IHNlbGYuZ2V0Tm9kZShrZXlzWzBdIGFzIGFueSxrZXlzWzFdLGtleXNbMl0pXG5cdFx0XHRcdFx0XHRvcmlnaW4ub3JpZ2luID0gdGFyZ2V0O1xuXG5cdFx0XHRcdFx0XHRub2RlLmFkZERlcGVuZGVuY3kodGFyZ2V0KVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0Y29uc3QgZ3JvdXBzID0gT2JqZWN0LnZhbHVlcygoc2VsZiBhcyBhbnkpLmRhdGEpOyBcblx0fVxufSlcbmV4cG9ydCBjbGFzcyBUVFJQR1N5c3RlbUpTT05Gb3JtYXR0aW5nIGV4dGVuZHMgVFRSUEdTeXN0ZW0ge1xuXHQgIFxuXHRASnNvbkNsYXNzVHlwZWQgKCBHcm9iR3JvdXBGaXhlZCApXG5cdHB1YmxpYyBmaXhlZCBcdDogR3JvYkdyb3VwRml4ZWRcdDtcblxuXHRASnNvbkNsYXNzVHlwZWQgKCBHcm9iR3JvdXBEZXJpdmVkIClcblx0cHVibGljIGRlcml2ZWQgXHQ6IEdyb2JHcm91cERlcml2ZWRcdDtcblxuXHRASnNvblN0cmluZygpXG5cdEBKc29uU3RyaW5nKHtzY2hlbWU6W0JBU0VfU0NIRU1FLFRUUlBHX1NDSEVNRVMuUFJFVklFV119KVxuXHRwdWJsaWMgYXV0aG9yIDogc3RyaW5nID0gXCJcIjtcblxuXHRASnNvblN0cmluZygpXG5cdEBKc29uU3RyaW5nKHtzY2hlbWU6W0JBU0VfU0NIRU1FLFRUUlBHX1NDSEVNRVMuUFJFVklFV119KVxuXHRwdWJsaWMgdmVyc2lvbjogc3RyaW5nID0gXCJcIjtcblx0XG5cdEBKc29uU3RyaW5nKClcblx0QEpzb25TdHJpbmcoe3NjaGVtZTpbQkFTRV9TQ0hFTUUsVFRSUEdfU0NIRU1FUy5QUkVWSUVXXX0pXG5cdHB1YmxpYyBzeXN0ZW1Db2RlTmFtZTpzdHJpbmcgPSB1dWlkdjQoKTtcblx0XG5cdEBKc29uU3RyaW5nKClcblx0QEpzb25TdHJpbmcoe3NjaGVtZTpbQkFTRV9TQ0hFTUUsVFRSUEdfU0NIRU1FUy5QUkVWSUVXXX0pXG5cdHB1YmxpYyBzeXN0ZW1OYW1lOnN0cmluZyA9IFwiXCI7XG5cdFxuXHRwdWJsaWMgY29uc3RydWN0b3IoKXtcblx0XHRzdXBlcigpOyBcblx0fVxuXG5cblx0c2V0RGVmYXVsdFZhbHVlcyggZGVmdWFsdFZhbHVlcyA6IHtncm91cDpzdHJpbmcsIGNvbDpzdHJpbmcgLCBrZXk6c3RyaW5nICwgdmFsdWV9W10gKXtcblxuXHRcdGxldCBvYmogPSB7fTtcblx0XHRjb25zdCBncm91cEtleSA9ICdkZXJpdmVkJztcblx0XHRjb25zdCBjb2xLZXlzID0gT2JqZWN0LmtleXModGhpcy5kZXJpdmVkLmNvbGxlY3Rpb25zX25hbWVzKTtcblx0XHRmb3IgKGxldCBjID0gMDsgYyA8IE9iamVjdC5rZXlzKHRoaXMuZGVyaXZlZC5jb2xsZWN0aW9uc19uYW1lcykubGVuZ3RoOyBjKyspIHtcblx0XHRcdGNvbnN0IGNvbEtleSA9IGNvbEtleXNbY107XG5cdFx0XHRjb25zdCBjb2xsZWN0aW9uID0gdGhpcy5kZXJpdmVkLmNvbGxlY3Rpb25zX25hbWVzW2NvbEtleV07XG5cblx0XHRcdGNvbnN0IG5vZGVLZXlzID0gT2JqZWN0LmtleXMoY29sbGVjdGlvbi5ub2Rlc19uYW1lcyk7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IG5vZGVLZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNvbnN0IG5vZGVLZXkgPSBub2RlS2V5c1tpXTtcblx0XHRcdFx0Y29uc3Qgbm9kZSA9IGNvbGxlY3Rpb24ubm9kZXNfbmFtZXNbbm9kZUtleV07XG5cdFx0XHRcdFxuXHRcdFx0XHRvYmpbZ3JvdXBLZXkgKycuJysgY29sS2V5ICsnLicrIG5vZGVLZXldID0gKCkgPT4gbm9kZS5zZXRWYWx1ZSggbm9kZS5nZXRWYWx1ZSgpID8/IDAgKVxuXHRcdFx0fVxuXHRcdH1cblxuXHR9XG59XG5cblxuIiwiaW1wb3J0IHsgQkFTRV9TQ0hFTUUsIEpzb25OdW1iZXIgfSBmcm9tIFwiZ3JvYmF4LWpzb24taGFuZGxlclwiO1xuaW1wb3J0IHsga2V5TWFuYWdlckluc3RhbmNlIH0gZnJvbSBcInR0cnBnLXN5c3RlbS1ncmFwaFwiO1xuaW1wb3J0IHsgSnNvbkJvb2xlYW4sIEpzb25PYmplY3QsIEpzb25Qcm9wZXJ0eSwgSnNvblN0cmluZyB9IGZyb20gXCJncm9iYXgtanNvbi1oYW5kbGVyXCI7XG5cblxuZXhwb3J0IGNsYXNzIFN5c3RlbVByZXZpZXdTY2hlbWVzeyBcblx0c3RhdGljIEJBU0UgPSBCQVNFX1NDSEVNRTtcblx0c3RhdGljIFBBR0UgXHQ9ICdQQUdFJzsgXG59XG5cbkBKc29uT2JqZWN0KHtcblx0XG59KVxuZXhwb3J0IGNsYXNzIFN5c3RlbVByZXZpZXcge1xuXG5cblx0QEpzb25OdW1iZXIoe3NjaGVtZTpbU3lzdGVtUHJldmlld1NjaGVtZXMuQkFTRSAsIFN5c3RlbVByZXZpZXdTY2hlbWVzLlBBR0VdfSlcblx0cHVibGljIGlkIDogbnVtYmVyIDtcblx0cHVibGljIGZpbGVQYXRoOnN0cmluZyA7XG5cblx0cHVibGljIGNvbnN0cnVjdG9yKCl7XG5cdFx0XG5cdH1cblx0cHVibGljIGluaXQoKXtcblx0XHR0aGlzLmF1dGhvciA9IFwiZ3JvYmF4XCI7XG5cdFx0dGhpcy52ZXJzaW9uID0gXCIwLjAuMVwiO1x0XG5cdFx0dGhpcy5jb2RlID0gXCJncm9iZG5kXCI7XG5cdFx0dGhpcy5uYW1lID0gXCJHcm9iYXgnIERuRCBUVFBSUEdcIjtcblx0fVxuXG5cdEBKc29uQm9vbGVhbih7c2NoZW1lOltTeXN0ZW1QcmV2aWV3U2NoZW1lcy5CQVNFXX0pXG5cdHB1YmxpYyBpc0VkaXRhYmxlXHRcdDogYm9vbGVhbiA9IHRydWUgO1xuXG5cdEBKc29uU3RyaW5nKHtzY2hlbWU6W1N5c3RlbVByZXZpZXdTY2hlbWVzLkJBU0VdfSlcblx0cHVibGljIGF1dGhvclx0XHRcdDogc3RyaW5nIDtcblx0XG5cdEBKc29uU3RyaW5nKHtzY2hlbWU6W1N5c3RlbVByZXZpZXdTY2hlbWVzLkJBU0UsU3lzdGVtUHJldmlld1NjaGVtZXMuUEFHRV19KVxuXHRwdWJsaWMgdmVyc2lvblx0XHRcdDogc3RyaW5nIDtcblx0XG5cdEBKc29uU3RyaW5nKHtzY2hlbWU6W1N5c3RlbVByZXZpZXdTY2hlbWVzLkJBU0UsU3lzdGVtUHJldmlld1NjaGVtZXMuUEFHRV19KVxuXHRwdWJsaWMgY29kZVx0OiBzdHJpbmcgO1x0XG5cblx0QEpzb25TdHJpbmcoe3NjaGVtZTpbU3lzdGVtUHJldmlld1NjaGVtZXMuQkFTRSxTeXN0ZW1QcmV2aWV3U2NoZW1lcy5QQUdFXX0pXG5cdHB1YmxpYyBuYW1lXHRcdDogc3RyaW5nIDtcblx0XG5cdHB1YmxpYyBmb2xkZXJQYXRoXHRcdDogc3RyaW5nIDtcblx0cHVibGljIGZvbGRlck5hbWVcdFx0OiBzdHJpbmcgO1xuXHRcbn1cblxuXG5leHBvcnQgY2xhc3MgRmlsbGVkU3lzdGVtUHJldmlldyAgZXh0ZW5kcyBTeXN0ZW1QcmV2aWV3ICB7XG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcigpe1xuXHRcdHN1cGVyKCk7XG5cdFx0dGhpcy5hdXRob3IgPSBcImdyb2JheFwiO1xuXHRcdHRoaXMudmVyc2lvbiA9IFwiMC4wLjFcIjtcblx0XHR0aGlzLmNvZGUgPSBcImdyb2JkbmRcIjtcblx0XHR0aGlzLm5hbWUgPSBcIkdyb2JheCcgRG5EIFRUUFJQR1wiO1xuXHR9XG59IiwiXG5leHBvcnQgY2xhc3MgU3RyaW5nRnVuY3Rpb25ze1xuXG5cdHB1YmxpYyBzdGF0aWMgaXNWYWxpZFdpbmRvd3NGaWxlU3RyaW5nKCBzdHIgOiBzdHJpbmcgKXtcblxuXHRcdGlmKCFzdHIpXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHQvLyBSZWd1bGFyIGV4cHJlc3Npb24gdG8gbWF0Y2ggaW52YWxpZCBjaGFyYWN0ZXJzIGluIGEgV2luZG93cyBmaWxlIG5hbWVcblx0XHRjb25zdCBpbnZhbGlkQ2hhcnNSZWdleCA9IC9bPD46XCIvXFxcXHw/KlxceDAwLVxceDFGXS9nO1xuXHRcdFxuXHRcdC8vIENoZWNrIGlmIHRoZSBzdHJpbmcgY29udGFpbnMgYW55IGludmFsaWQgY2hhcmFjdGVycyBvciByZXNlcnZlZCBuYW1lc1xuXHRcdHJldHVybiAhaW52YWxpZENoYXJzUmVnZXgudGVzdChzdHIpICYmICEvXihjb258cHJufGF1eHxudWx8Y29tWzAtOV18bHB0WzAtOV0pJC9pLnRlc3Qoc3RyKSAmJiBzdHIubGVuZ3RoIDw9IDI1NTtcblx0fVxuXG5cdHB1YmxpYyBzdGF0aWMgaXNWYWxpZFN5c3RlbUNvZGVOYW1lKCBzdHIgOiBzdHJpbmcgKXtcblxuXHRcdGlmKCFzdHIpXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XG5cdFx0Y29uc3QgcmVnZXggPSAvW15hLXpBLVowLTldLztcblx0XHRyZXR1cm4gIXJlZ2V4LnRlc3Qoc3RyKTtcblx0fVxuXG5cdHB1YmxpYyBzdGF0aWMgQ29udmVydFRvVmFsaWRXaW5kb3dzRmlsZVN0cmluZyggc3RyIDogc3RyaW5nICl7XG5cdFx0Ly92YXIgb3V0ID0gKHN0ci5yZXBsYWNlKC9bICZcXC9cXFxcIywrKCkkfiUuJ1wiOio/PD57fV0vZywgXCJcIikpO1xuXHRcdC8vcmV0dXJuIG91dDsgXG5cdFx0Ly8gUmVndWxhciBleHByZXNzaW9uIHRvIG1hdGNoIGludmFsaWQgY2hhcmFjdGVycyBpbiBhIFdpbmRvd3MgZmlsZSBuYW1lXG5cdFx0Y29uc3QgaW52YWxpZENoYXJzUmVnZXggPSAvWzw+OlwiL1xcXFx8PypcXHgwMC1cXHgxRl0vZztcblxuXHRcdC8vIFJlcGxhY2UgaW52YWxpZCBjaGFyYWN0ZXJzIHdpdGggYW4gdW5kZXJzY29yZVxuXHRcdGNvbnN0IHZhbGlkU3RyID0gc3RyLnJlcGxhY2UoaW52YWxpZENoYXJzUmVnZXgsIFwiX1wiKTtcblxuXHRcdC8vIEVuc3VyZSB0aGUgc3RyaW5nIGlzIG5vdCBsb25nZXIgdGhhbiAyNTUgY2hhcmFjdGVyc1xuXHRcdHJldHVybiB2YWxpZFN0ci5zbGljZSgwLCAyNTUpO1xuXHR9XG5cblx0cHVibGljIHN0YXRpYyAgdXVpZHY0KCkge1xuXHRcdHJldHVybiAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4J1xuXHRcdC5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uIChjKSB7XG5cdFx0XHRjb25zdCByID0gTWF0aC5yYW5kb20oKSAqIDE2IHwgMCwgXG5cdFx0XHRcdHYgPSBjID09ICd4JyA/IHIgOiAociAmIDB4MyB8IDB4OCk7XG5cdFx0XHRyZXR1cm4gdi50b1N0cmluZygxNik7XG5cdFx0fSk7XG5cdH1cbiBcblx0cHVibGljIHN0YXRpYyAgdXVpZFNob3J0KCkge1xuXHRcdHJldHVybiAneHh4eHh4eHgnXG5cdFx0LnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24gKGMpIHtcblx0XHRcdGNvbnN0IHIgPSBNYXRoLnJhbmRvbSgpICogMTYgfCAwLCBcblx0XHRcdFx0diA9IGMgPT0gJ3gnID8gciA6IChyICYgMHgzIHwgMHg4KTtcblx0XHRcdHJldHVybiB2LnRvU3RyaW5nKDE2KTtcblx0XHR9KTtcblx0fVxufSIsImltcG9ydCB7IFN0cmluZ0Z1bmN0aW9ucyB9IFx0XHRcdFx0XHRcdFx0ZnJvbSBcIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9Nb2R1bGVzL2NvcmUvQmFzZUZ1bmN0aW9ucy9zdHJpbmdmdW5jdGlvbnNcIjtcbmltcG9ydCB7IFRUUlBHU3lzdGVtSlNPTkZvcm1hdHRpbmcgfSBcdFx0XHRcdGZyb20gXCIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvTW9kdWxlcy9ncmFwaERlc2lnbmVyXCI7XG5pbXBvcnQgeyBHcm9iQ29sbGVjdGlvbiwgR3JvYkdyb3VwLCBHcm9iTm9kZVR5cGUgfSBcdGZyb20gXCJ0dHJwZy1zeXN0ZW0tZ3JhcGhcIjtcblxuXG5cbmV4cG9ydCBpbnRlcmZhY2UgSVZpZXdFbGVtZW50e1xuXHRrZXlcdFx0OnN0cmluZztcblx0bmFtZVx0OnN0cmluZzsgXG5cdG5hbWVFZGl0OnN0cmluZzsgXG5cdHZhbGlkXHQ6Ym9vbGVhbjtcbn1cbmNsYXNzIFVwZGF0ZUxpc3RlbmVye1xuXG5cdHByb3RlY3RlZCBndWlkID0gU3RyaW5nRnVuY3Rpb25zLnV1aWR2NCgpO1xuXHRwdWJsaWMgbGlzdGVuZXJzS2V5ZWRcdD0ge307XG5cdHB1YmxpYyBsaXN0ZW5lcnNFdmVudHMgXHQ9IHt9O1xuXG5cdFxuXHRcdFxuXG5cdHByb3RlY3RlZCBjYWxsVXBkYXRlTGlzdGVuZXJzKGV2ZW50KXtcblx0XHRmb3IobGV0IGtleSBpbiBPYmplY3Qua2V5cyh0aGlzLmxpc3RlbmVyc0V2ZW50c1tldmVudF0pKXtcblx0XHRcdHRoaXMubGlzdGVuZXJzRXZlbnRzW2V2ZW50XVtrZXldLmNhbGwoKTtcblx0XHR9IFxuXHR9XG5cdGFkZEV2ZW50TGlzdGVuZXIoIGtleSAsIGV2ZW50OnN0cmluZyAsICBsaXN0ZW5lciA6ICgpID0+IGFueSApe1xuXHRcdFxuXHRcdGlmICghdGhpcy5saXN0ZW5lcnNFdmVudHNbZXZlbnRdKXtcblx0XHRcdHRoaXMubGlzdGVuZXJzRXZlbnRzW2V2ZW50XSA9IHt9O1xuXHRcdH1cblxuXHRcdGlmICghdGhpcy5saXN0ZW5lcnNLZXllZFtrZXldKXtcblx0XHRcdHRoaXMubGlzdGVuZXJzS2V5ZWRba2V5XSA9IHt9O1xuXHRcdH1cbiBcblx0XHR0aGlzLmxpc3RlbmVyc0tleWVkW2tleV1bZXZlbnRdID0gbGlzdGVuZXI7XG5cdFx0dGhpcy5saXN0ZW5lcnNFdmVudHNbZXZlbnRdW2tleV0gPSBsaXN0ZW5lcjtcblx0fVxuXG5cdHJlbW92ZUV2ZW50TGlzdGVuZXIoIGtleSApe1xuXG5cdFx0Ly8gZmlyc3QgZ2V0IGFsbCBldmVudHMgXG5cdFx0bGV0IGV2ZW50cyA9IE9iamVjdC5rZXlzICggdGhpcy5saXN0ZW5lcnNLZXllZFtrZXldICk7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBldmVudHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbnN0IGUgPSBldmVudHNbaV07XG5cblx0XHRcdC8vZGVsZXRlIHRoaXMga2V5IGZyb20gYWxsIGV2ZW50cyBcblx0XHRcdGRlbGV0ZSB0aGlzLmxpc3RlbmVyc0V2ZW50c1tlXVtrZXldXHQ7XG5cdFx0fVxuXG5cdFx0Ly8gZGVsdGUgdGhpcyBrZXkgXG5cdFx0ZGVsZXRlIHRoaXMubGlzdGVuZXJzS2V5ZWRba2V5XTtcblx0fVxuXHRyZW1vdmVBbGxFdmVudExpc3RlbmVycygpe1xuXHRcdHRoaXMubGlzdGVuZXJzS2V5ZWRcdFx0PSB7fTtcblx0XHR0aGlzLmxpc3RlbmVyc0V2ZW50cyBcdD0ge307XG5cdH1cbn1cbmVudW0gdXBkYXRlRXZlbnRzIHsgXG5cdHZhbGlkQ2hhbmdlID0gJ3ZhbGlkQ2hhbmdlJyxcblxufVxuXG5cblxuXG5leHBvcnQgY2xhc3MgVUlTeXN0ZW0gZXh0ZW5kcyBVcGRhdGVMaXN0ZW5lcntcblxuXHRzeXNcdFx0OiBUVFJQR1N5c3RlbUpTT05Gb3JtYXR0aW5nO1xuXHRncm91cHNcdDogVUlHcm91cFtdID0gW107XG5cdHZhbGlkIDogYm9vbGVhbiA9IHRydWU7XG5cblx0Y29uc3RydWN0b3IoIHN5c3RlbSA6IFRUUlBHU3lzdGVtSlNPTkZvcm1hdHRpbmcpe1xuXHRcdHN1cGVyKCk7XG5cdFx0dGhpcy5zeXMgPSBzeXN0ZW07XG5cdFx0dGhpcy52YWxpZCA9IHRydWU7IFxuXHRcdGxldCBncm91cHMgPSBbJ2Rlcml2ZWQnLCdmaXhlZCddO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgZ3JvdXBzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCBncnAgPSB0aGlzLnN5cy5kYXRhW2dyb3Vwc1tpXV0gYXMgR3JvYkdyb3VwPEdyb2JOb2RlVHlwZT47O1xuXHRcdFx0Y29uc3QgdWlncnAgPSBuZXcgVUlHcm91cCh0aGlzICwgZ3JwKTtcblxuXHRcdFx0dGhpcy5ncm91cHMucHVzaCh1aWdycCk7IFxuXHRcdFx0dGhpcy52YWxpZCA9IHRoaXMudmFsaWQgJiYgdWlncnAudmFsaWQ7XG5cdFx0XHR1aWdycC5hZGRFdmVudExpc3RlbmVyKCB0aGlzLmd1aWQgLCB1cGRhdGVFdmVudHMudmFsaWRDaGFuZ2UgLCB0aGlzLnVwZGF0ZS5iaW5kKHRoaXMpICk7XG5cdFx0fVxuXHR9XG5cblx0dXBkYXRlKCl7XG4gXG5cdFx0bGV0IG9yaWcgPSB0aGlzLnZhbGlkO1xuXG5cdFx0dmFyIGlzVmFsaWQgPSB0cnVlO1xuXHRcdHRoaXMuZ3JvdXBzLmZvckVhY2gocCA9PiB7XG5cdFx0XHRpc1ZhbGlkID0gaXNWYWxpZCAmJiBwLnZhbGlkO1xuXHRcdH0pXG5cdFx0dGhpcy52YWxpZCBcdFx0PSBpc1ZhbGlkOyBcblxuXHRcdGlmIChvcmlnICE9IHRoaXMudmFsaWQpe1xuXHRcdFx0dGhpcy5jYWxsVXBkYXRlTGlzdGVuZXJzKCAgdXBkYXRlRXZlbnRzLnZhbGlkQ2hhbmdlICApO1xuXHRcdH1cblx0fVxuXHRcblx0cHVibGljIGFkZENvbGxlY3Rpb24oIGdyb3VwOnN0cmluZyApe1xuXG5cdH1cblx0cHVibGljIHJlbUNvbGxlY3Rpb24oIGdyb3VwOnN0cmluZyApe1xuXG5cdH1cblx0cHVibGljIHVwZENvbGxlY3Rpb24oIGdyb3VwOnN0cmluZyApe1xuXG5cdH1cblxuXG5cbn1cbmV4cG9ydCBjbGFzcyBVSUdyb3VwIGV4dGVuZHMgVXBkYXRlTGlzdGVuZXIgaW1wbGVtZW50cyBJVmlld0VsZW1lbnR7XG5cblxuXHRzeXNcdFx0XHQ6IFVJU3lzdGVtO1xuXHRsaW5rXHRcdDogR3JvYkdyb3VwPEdyb2JOb2RlVHlwZT47XG5cdGNvbGxlY3Rpb25zIDogVUlDb2xsZWN0aW9uW10gPSBbXTtcblx0a2V5XHRcdFx0OiBzdHJpbmc7XG5cdG5hbWVcdFx0OiBzdHJpbmc7XG5cdG5hbWVFZGl0XHQ6IHN0cmluZztcblx0dmFsaWRcdFx0OiBib29sZWFuO1xuXG5cdGNvbnN0cnVjdG9yKCBzeXN0ZW0gOiBVSVN5c3RlbSwgZ3JvdXAgOiBHcm9iR3JvdXA8R3JvYk5vZGVUeXBlPiApe1xuXHRcdHN1cGVyKCk7XG5cdFx0dGhpcy5zeXMgPSBzeXN0ZW07XG5cdFx0dGhpcy5saW5rID0gZ3JvdXA7XG5cdFx0XG5cdFx0dGhpcy5rZXkgPSBncm91cC5nZXRLZXkoKTtcblx0XHR0aGlzLm5hbWU9IGdyb3VwLmdldE5hbWUoKTtcblx0XHR0aGlzLm5hbWVFZGl0ID0gdGhpcy5uYW1lO1xuXG5cdFx0dmFyIGlzVmFsaWQgPSB0cnVlO1xuXHRcdHZhciBjb2xOYW1lcyA9IGdyb3VwLmdldENvbGxlY3Rpb25zTmFtZXMoKTtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGNvbE5hbWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCBuID0gY29sTmFtZXNbaV07XG5cdFx0XHRjb25zdCBjb2wgPSBncm91cC5nZXRDb2xsZWN0aW9uKG4pO1xuXG5cdFx0XHRpZighY29sKVxuXHRcdFx0XHRjb250aW51ZTtcblxuXHRcdFx0Y29uc3QgdWljb2wgPSBuZXcgVUlDb2xsZWN0aW9uKCB0aGlzLnN5cyAsIGNvbCApO1xuXHRcdFx0dGhpcy5jb2xsZWN0aW9ucy5wdXNoKHVpY29sKTtcdCBcblx0XHRcdGlzVmFsaWQgPSBpc1ZhbGlkICYmIHVpY29sLnZhbGlkO1xuXG5cdFx0XHR1aWNvbC5hZGRFdmVudExpc3RlbmVyKHRoaXMua2V5LCB1cGRhdGVFdmVudHMudmFsaWRDaGFuZ2UgLCB0aGlzLmlzVmFsaWRVcGRhdGUuYmluZCh0aGlzKSApO1xuXHRcdH1cblx0XHR0aGlzLnZhbGlkID0gaXNWYWxpZDtcblx0XHRcblx0XHRcblx0fVxuXG5cdGlzVmFsaWRVcGRhdGUoKXtcblxuXHRcdGxldCBvcmlnID0gdGhpcy52YWxpZDtcblxuXHRcdHZhciBpc1ZhbGlkID0gdHJ1ZTtcblx0XHR0aGlzLmNvbGxlY3Rpb25zLmZvckVhY2gocCA9PiB7XG5cdFx0XHRpc1ZhbGlkID0gaXNWYWxpZCAmJiBwLnZhbGlkO1xuXHRcdH0pXG5cdFx0dGhpcy52YWxpZCBcdFx0PSBpc1ZhbGlkO1xuXG5cdFx0aWYgKG9yaWcgIT0gdGhpcy52YWxpZCl7XG5cdFx0XHR0aGlzLmNhbGxVcGRhdGVMaXN0ZW5lcnMoIHVwZGF0ZUV2ZW50cy52YWxpZENoYW5nZSApO1xuXHRcdH1cblx0fVxuXG5cdHVwZGF0ZSgpe1xuXG5cdFx0dGhpcy5rZXlcdFx0PSB0aGlzLmxpbmsuZ2V0S2V5KCk7XG5cdFx0dGhpcy5uYW1lICAgXHQ9IHRoaXMubGluay5nZXROYW1lKCk7XG5cdFx0dGhpcy5uYW1lRWRpdCBcdD0gdGhpcy5saW5rLmdldE5hbWUoKTtcblx0XHR0aGlzLmlzVmFsaWRVcGRhdGUoKTtcblx0fVxuXHRcblx0ZGlzcG9zZSgpe1xuXHRcdFxuXHRcdHRoaXMucmVtb3ZlQWxsRXZlbnRMaXN0ZW5lcnMoKTtcblx0XHR0aGlzLmNvbGxlY3Rpb25zLmZvckVhY2goIG4gPT4gbi5kaXNwb3NlKCkgKTtcblxuXHRcdC8vQHRzLWlnbm9yZVxuXHRcdHRoaXMubGluayA9IG51bGw7XG5cdFx0Ly9AdHMtaWdub3JlXG5cdFx0dGhpcy5zeXMgPSBudWxsO1xuXG5cdFx0dGhpcy5jb2xsZWN0aW9ucyA9IFtdO1xuXHR9XG59XG5leHBvcnQgY2xhc3MgVUlDb2xsZWN0aW9uIGV4dGVuZHMgVXBkYXRlTGlzdGVuZXIgaW1wbGVtZW50cyBJVmlld0VsZW1lbnR7XG5cblx0c3lzXHQgXHQ6IFVJU3lzdGVtO1xuXHRsaW5rXHQ6IEdyb2JDb2xsZWN0aW9uPEdyb2JOb2RlVHlwZT47XG5cdG5vZGVzICAgOiBVSU5vZGVbXT0gW107XG5cdGtleVx0IFx0OiBzdHJpbmc7XG5cdG5hbWVcdDogc3RyaW5nO1xuXHRuYW1lRWRpdDogc3RyaW5nO1xuXHR2YWxpZCAgIDogYm9vbGVhbjtcblx0XG5cdGNvbnN0cnVjdG9yKCBzeXN0ZW0gOiBVSVN5c3RlbSAsIGNvbCA6IEdyb2JDb2xsZWN0aW9uPEdyb2JOb2RlVHlwZT4gKXtcblx0XHRzdXBlcigpO1xuXHRcdHRoaXMuc3lzID0gc3lzdGVtO1xuXHRcdHRoaXMubGluayA9IGNvbDtcblxuXHRcdHRoaXMua2V5ID0gY29sLmdldEtleSgpO1xuXHRcdHRoaXMubmFtZSA9IGNvbC5nZXROYW1lKCk7XG5cdFx0dGhpcy5uYW1lRWRpdCA9IHRoaXMubmFtZTtcblxuXHRcdHZhciBpc1ZhbGlkID0gdHJ1ZTtcblx0XHR2YXIgbm9kZU5hbWVzID0gY29sLmdldE5vZGVOYW1lcygpO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZU5hbWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCBuID0gbm9kZU5hbWVzW2ldO1xuXHRcdFx0Y29uc3Qgbm9kZSA9IGNvbC5nZXROb2RlKG4pO1xuXG5cdFx0XHRpZighbm9kZSlcblx0XHRcdFx0Y29udGludWU7XG5cblx0XHRcdGNvbnN0IHVpbm9kZSA9IG5ldyBVSU5vZGUoIHRoaXMuc3lzICwgbm9kZSApO1xuXHRcdFx0dGhpcy5ub2Rlcy5wdXNoKHVpbm9kZSk7XHQgXG5cdFx0XHRpc1ZhbGlkID0gaXNWYWxpZCAmJiB1aW5vZGUudmFsaWQ7XG5cblx0XHRcdHVpbm9kZS5hZGRFdmVudExpc3RlbmVyKHRoaXMua2V5LCB1cGRhdGVFdmVudHMudmFsaWRDaGFuZ2UgLCB0aGlzLmlzVmFsaWRVcGRhdGUuYmluZCh0aGlzKSApO1xuXHRcdH1cblxuXHRcdHRoaXMubGluay5hZGRVcGRhdGVMaXN0ZW5lcih0aGlzLmtleSwgdGhpcy51cGRhdGUuYmluZCh0aGlzKSApO1xuXHRcdHRoaXMudmFsaWQgPSBpc1ZhbGlkO1xuXHR9XG5cblx0aXNWYWxpZFVwZGF0ZSgpe1xuXHRcdHZhciBvcmlnID0gdGhpcy52YWxpZDtcblxuXHRcdHZhciBpc1ZhbGlkID0gdHJ1ZTtcblx0XHR0aGlzLm5vZGVzLmZvckVhY2gocCA9PiB7XG5cdFx0XHRpc1ZhbGlkID0gaXNWYWxpZCAmJiBwLnZhbGlkO1xuXHRcdH0pXG5cdFx0dGhpcy52YWxpZCBcdFx0PSBpc1ZhbGlkO1xuXG5cdFx0aWYgKG9yaWcgIT0gdGhpcy52YWxpZCl7XG5cdFx0XHR0aGlzLmNhbGxVcGRhdGVMaXN0ZW5lcnMoIHVwZGF0ZUV2ZW50cy52YWxpZENoYW5nZSApO1xuXHRcdH1cblx0fVxuXG5cdHVwZGF0ZSgpe1xuIFxuXHRcdHRoaXMua2V5XHRcdD0gdGhpcy5saW5rLmdldEtleSgpO1xuXHRcdHRoaXMubmFtZSAgIFx0PSB0aGlzLmxpbmsuZ2V0TmFtZSgpO1xuXHRcdHRoaXMubmFtZUVkaXQgXHQ9IHRoaXMubGluay5nZXROYW1lKCk7XG5cdFx0dGhpcy5pc1ZhbGlkVXBkYXRlKCk7XG5cdH1cblx0XG5cdGRpc3Bvc2UoKXtcblxuXHRcdC8vIGdldCByaWQgb2Ygbm9kZSBsaXN0ZW5lclxuXHRcdHRoaXMubGluay5yZW1vdmVVcGRhdGVMaXN0ZW5lciggdGhpcy5rZXkgKTtcblx0XHR0aGlzLnJlbW92ZUFsbEV2ZW50TGlzdGVuZXJzKCk7XG5cdFx0XG5cdFx0Ly8gZGlzcG9zZSBvZiBhbGwgY2hpbGRyZW4uIFxuXHRcdHRoaXMubm9kZXMuZm9yRWFjaCggbiA9PiBuLmRpc3Bvc2UoKSApO1xuXG5cdFx0Ly9AdHMtaWdub3JlXG5cdFx0dGhpcy5saW5rID0gbnVsbDtcblx0XHQvL0B0cy1pZ25vcmVcblx0XHR0aGlzLnN5cyA9IG51bGw7XG5cblx0XHR0aGlzLm5vZGVzID0gW107XG5cdH1cblxuXG59XG5leHBvcnQgY2xhc3MgVUlOb2RlIGV4dGVuZHMgVXBkYXRlTGlzdGVuZXIgaW1wbGVtZW50cyBJVmlld0VsZW1lbnR7XG5cblx0c3lzXHRcdDogVUlTeXN0ZW07XG5cdGxpbmtcdDogR3JvYk5vZGVUeXBlO1xuXHRrZXlcdFx0OiBzdHJpbmc7XG5cdG5hbWVcdDogc3RyaW5nO1xuXHRuYW1lRWRpdDogc3RyaW5nO1x0IFxuXHR2YWxpZCAgIDogYm9vbGVhbjtcblx0XG5cdGNvbnN0cnVjdG9yKCBzeXN0ZW0gOiBVSVN5c3RlbSwgbm9kZSA6IEdyb2JOb2RlVHlwZSl7XG5cdFx0c3VwZXIoKTtcblx0XHR0aGlzLmxpbmsgPSBub2RlO1xuXHRcdHRoaXMuc3lzID0gc3lzdGVtO1xuXG5cdFx0dGhpcy5rZXlcdD0gbm9kZS5nZXRLZXkoKTtcblx0XHR0aGlzLm5hbWUgICA9IG5vZGUuZ2V0TmFtZSgpO1xuXHRcdHRoaXMubmFtZUVkaXQgPSBub2RlLmdldE5hbWUoKTtcblx0XHR0aGlzLnZhbGlkID0gbm9kZS5pc1ZhbGlkKCk7XHRcblx0XHRcblx0XHR0aGlzLmxpbmsuYWRkVXBkYXRlTGlzdGVuZXIoIHRoaXMua2V5ICwgdGhpcy51cGRhdGUuYmluZCh0aGlzKSApO1xuXHR9XG5cblx0dXBkYXRlKCl7XG5cdFx0bGV0IHZhbGlkT3JpZyA9IHRoaXMudmFsaWQ7XG5cblx0XHR0aGlzLmtleVx0XHQ9IHRoaXMubGluay5nZXRLZXkoKTtcblx0XHR0aGlzLm5hbWUgICBcdD0gdGhpcy5saW5rLmdldE5hbWUoKTtcblx0XHR0aGlzLm5hbWVFZGl0IFx0PSB0aGlzLmxpbmsuZ2V0TmFtZSgpO1xuXHRcdHRoaXMudmFsaWQgXHRcdD0gdGhpcy5saW5rLmlzVmFsaWQoKTtcblxuXHRcdGlmICh2YWxpZE9yaWcgIT0gdGhpcy52YWxpZCl7XG5cdFx0XHR0aGlzLmNhbGxVcGRhdGVMaXN0ZW5lcnMoIHVwZGF0ZUV2ZW50cy52YWxpZENoYW5nZSApO1xuXHRcdH1cblx0fVxuXHRcblx0ZGlzcG9zZSgpe1xuXG5cdFx0dGhpcy5yZW1vdmVBbGxFdmVudExpc3RlbmVycygpO1xuXHRcdHRoaXMubGluay5yZW1vdmVVcGRhdGVMaXN0ZW5lciggdGhpcy5rZXkgKTtcblx0XHQvL0B0cy1pZ25vcmVcblx0XHR0aGlzLmxpbmsgPSBudWxsO1xuXHRcdC8vQHRzLWlnbm9yZVxuXHRcdHRoaXMuc3lzID0gbnVsbDtcblx0fVxuXG59IiwiPHNjcmlwdCBsYW5nPVwidHNcIj4gXG4gICAgIGV4cG9ydCBsZXQgY29sb3I6IHN0cmluZyA9IFwiYmxhY2tcIiA7IFxuPC9zY3JpcHQ+XG48c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9e2NvbG9yfSBzdHJva2Utd2lkdGg9XCIyXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCIgY2xhc3M9XCJzdmctaWNvbiBsdWNpZGUtdHJhc2gtMlwiPlxuICAgIDxwYXRoIGQ9XCJNMyA2aDE4XCI+PC9wYXRoPlxuICAgIDxwYXRoIGQ9XCJNMTkgNnYxNGMwIDEtMSAyLTIgMkg3Yy0xIDAtMi0xLTItMlY2XCI+PC9wYXRoPlxuICAgIDxwYXRoIGQ9XCJNOCA2VjRjMC0xIDEtMiAyLTJoNGMxIDAgMiAxIDIgMnYyXCI+PC9wYXRoPlxuICAgIDxsaW5lIHgxPVwiMTBcIiB5MT1cIjExXCIgeDI9XCIxMFwiIHkyPVwiMTdcIj48L2xpbmU+XG4gICAgPGxpbmUgeDE9XCIxNFwiIHkxPVwiMTFcIiB4Mj1cIjE0XCIgeTI9XCIxN1wiPjwvbGluZT5cbjwvc3ZnPiIsIjxzY3JpcHQgbGFuZz1cInRzXCI+XG4gICBleHBvcnQgbGV0IGNvbG9yOiBzdHJpbmcgPSBcImJsYWNrXCIgOyBcbjwvc2NyaXB0PlxuICA8c3ZnIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPXtjb2xvcn0gc3Ryb2tlLXdpZHRoPVwiMlwiIHN0cm9rZS1saW5lY2FwPVwicm91bmRcIiBzdHJva2UtbGluZWpvaW49XCJyb3VuZFwiIGNsYXNzPVwic3ZnLWljb24gbHVjaWRlLXBsdXMtY2lyY2xlXCI+XG4gICAgICAgIDxjaXJjbGUgY3g9XCIxMlwiIGN5PVwiMTJcIiByPVwiMTBcIj5cbiAgICAgICAgPC9jaXJjbGU+XG4gICAgICAgIDxsaW5lIHgxPVwiOFwiIHkxPVwiMTJcIiB4Mj1cIjE2XCIgeTI9XCIxMlwiPlxuICAgICAgPC9saW5lPlxuICAgIDwvc3ZnPiIsIjxzY3JpcHQgbGFuZz1cInRzXCI+IFxuICAgICBleHBvcnQgbGV0IGNvbG9yOiBzdHJpbmcgPSBcImJsYWNrXCIgOyBcbjwvc2NyaXB0PlxuXG5cbjxzdmcgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIGhlaWdodD1cIjEwMCVcIiB3aWR0aD1cIjEwMCVcIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9e2NvbG9yfSBzdHJva2Utd2lkdGg9XCIyXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCIgY2xhc3M9XCJzdmctaWNvbiBsdWNpZGUtcGx1cy1jaXJjbGVcIj5cbiAgICA8cGF0aCBkPVwiTTEyIDIwaDlcIj48L3BhdGg+XG4gICAgPHBhdGggZD1cIk0xNi41IDMuNWEyLjEyMSAyLjEyMSAwIDAgMSAzIDNMNyAxOWwtNCAxIDEtNEwxNi41IDMuNXpcIj48L3BhdGg+XG48L3N2Zz4gIiwiPHNjcmlwdCBsYW5nPVwidHNcIj5cbiAgICAgZXhwb3J0IGxldCBjb2xvcjogc3RyaW5nID0gXCJibGFja1wiIDsgIFxuPC9zY3JpcHQ+XG4gPHN2ZyB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT17Y29sb3J9IHN0cm9rZS13aWR0aD1cIjJcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIiBjbGFzcz1cInN2Zy1pY29uIGx1Y2lkZS1wbHVzLWNpcmNsZVwiPlxuICAgICAgICA8cGF0aCBkPVwiTTIxIDE1djRhMiAyIDAgMCAxLTIgMkg1YTIgMiAwIDAgMS0yLTJ2LTRcIj48L3BhdGg+XG4gICAgICAgIDxwb2x5bGluZSBwb2ludHM9XCI3IDEwIDEyIDE1IDE3IDEwXCI+PC9wb2x5bGluZT5cbiAgICAgICAgPGxpbmUgeDE9XCIxMlwiIHkxPVwiMTVcIiB4Mj1cIjEyXCIgeTI9XCIzXCI+PC9saW5lPlxuICAgIDwvc3ZnPiIsIjxzY3JpcHQgbGFuZz1cInRzXCI+XG4gICAgaW1wb3J0IHsgb25Nb3VudCB9IGZyb20gXCJzdmVsdGVcIjtcblx0aW1wb3J0IHsgIGZseSB9IGZyb20gXCJzdmVsdGUvdHJhbnNpdGlvblwiO1xuXHRpbXBvcnQgJy4vdG9vbFRpcC5zY3NzJ1xuXG5cblx0ZXhwb3J0IGxldCB0ZXh0IDogc3RyaW5nIDtcblx0ZXhwb3J0IGxldCBhbmltWCA9IDIwO1xuXHRleHBvcnQgbGV0IGFuaW1ZID0gMDtcblx0ZXhwb3J0IGxldCB0eXBlIDogXCJlcnJvclwiIHwgXCJ2ZXJib3NlXCIgfCBcImdvb2RcIiB8IFwibm9uZVwiO1xuXG5cdGxldCBtb3VudGVkID0gZmFsc2U7XG5cdG9uTW91bnQoKCk9Pntcblx0XHRzZXRUaW1lb3V0KCgpID0+IHsgbW91bnRlZCA9IHRydWUgfSwgMTAwICkgXG5cdH0pXG48L3NjcmlwdD5cbiBcbjxkaXY+XG5cdHsjaWYgbW91bnRlZH1cblx0XHQ8ZGl2IGNsYXNzPVwidG9vbHRpcElubmVyQm94XCIgZGF0YS10eXBlPXt0eXBlfSB0cmFuc2l0aW9uOmZseT17e3g6YW5pbVgsIHk6YW5pbVkgfX0gPlxuXHRcdFx0e3RleHR9XG5cdFx0PC9kaXY+XG5cdHsvaWZ9XG48L2Rpdj4iLCJcbmltcG9ydCBUb29sdGlwIGZyb20gJy4vdG9vbFRpcC5zdmVsdGUnO1xuZXhwb3J0IGZ1bmN0aW9uIHRvb2x0aXAobm9kZSwgeyB0ZXh0OnRleHQgLCB0eXBlID0gXCJub25lXCIsIGFuaW1YID0gMjAsIGFuaW1ZID0gMCwgWG9mZnNldCA9IDAsIFlvZmZzZXQgPSAwIH0pIHtcbiAgICBcblx0bGV0IHRvb2x0aXBFbGVtZW50O1xuXHRsZXQgdG9vbHRpcENvbXBvbmVudDtcblxuICAgIGZ1bmN0aW9uIHNob3dUb29sdGlwKCkge1xuICAgICAgICB0b29sdGlwRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpOyBcbiAgICAgICAgdG9vbHRpcEVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnOyBcbiAgICAgICAgdG9vbHRpcEVsZW1lbnQuc3R5bGUuekluZGV4ID0gJzIwMDAnO1xuICBcblx0XHR0b29sdGlwQ29tcG9uZW50ID0gbmV3IFRvb2x0aXAoe1xuICAgICAgICAgICAgdGFyZ2V0OiB0b29sdGlwRWxlbWVudCxcbiAgICAgICAgICAgIHByb3BzOiB7IHRleHQ6dGV4dCAsIHR5cGU6dHlwZSAsIGFuaW1YOmFuaW1YICwgYW5pbVk6YW5pbVkgfVxuICAgICAgICB9KTtcblx0XHRcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0b29sdGlwRWxlbWVudCk7XG4gICAgICAgIGNvbnN0IHsgdG9wLCBsZWZ0LCB3aWR0aCwgaGVpZ2h0IH0gPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB0b29sdGlwRWxlbWVudC5zdHlsZS50b3AgPSBgJHt0b3AgKyBoZWlnaHQgKyB3aW5kb3cuc2Nyb2xsWSArIFlvZmZzZXR9cHhgO1xuICAgICAgICB0b29sdGlwRWxlbWVudC5zdHlsZS5sZWZ0ID0gYCR7KGxlZnQgKyB3aWR0aCAvIDIgLSB0b29sdGlwRWxlbWVudC5vZmZzZXRXaWR0aCAvIDIgKyB3aW5kb3cuc2Nyb2xsWCApKyBYb2Zmc2V0fXB4YDtcbiBcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoaWRlVG9vbHRpcCgpIHtcblxuXHRcdGlmICh0b29sdGlwQ29tcG9uZW50KSB7XG4gICAgICAgICAgICB0b29sdGlwQ29tcG9uZW50LiRkZXN0cm95KCk7XG4gICAgICAgICAgICB0b29sdGlwQ29tcG9uZW50ID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0b29sdGlwRWxlbWVudCkge1xuICAgICAgICAgICAgdG9vbHRpcEVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgICAgICB0b29sdGlwRWxlbWVudCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBzaG93VG9vbHRpcCk7XG4gICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgaGlkZVRvb2x0aXApO1xuXG4gICAgcmV0dXJuIHtcblx0XHR1cGRhdGUoIHsgdGV4dDp0ZXh0ICwgdHlwZSA9IFwibm9uZVwiLCBhbmltWCA9IDIwLCBhbmltWSA9IDAsIFhvZmZzZXQgPSAwLCBZb2Zmc2V0ID0gMCB9KSB7XG4gICAgICAgICAgICB0ZXh0ID0gbmV3VGV4dDtcbiAgICAgICAgICAgIGlmICh0b29sdGlwQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgdG9vbHRpcENvbXBvbmVudC4kc2V0KHsgdGV4dDp0ZXh0ICwgdHlwZTp0eXBlICwgYW5pbVg6YW5pbVggLCBhbmltWTphbmltWSAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGRlc3Ryb3koKSB7XG4gICAgICAgICAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBzaG93VG9vbHRpcCk7XG4gICAgICAgICAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBoaWRlVG9vbHRpcCk7XG4gICAgICAgICAgICBpZiAodG9vbHRpcENvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHRvb2x0aXBDb21wb25lbnQuJGRlc3Ryb3koKTtcbiAgICAgICAgICAgIH0gXG4gICAgICAgIH0gXG4gICAgfTtcbn1cblxuXG5cbi8qXG5cbmV4cG9ydCBmdW5jdGlvbiB0b29sdGlwKG5vZGUsIHsgdGV4dCB9KSB7XG4gICAgbGV0IHRvb2x0aXBDb21wb25lbnQ7XG5cbiAgICBmdW5jdGlvbiBzaG93VG9vbHRpcCgpIHtcbiAgICAgICAgdG9vbHRpcENvbXBvbmVudCA9IG5ldyBUb29sdGlwKHtcbiAgICAgICAgICAgIHRhcmdldDogZG9jdW1lbnQuYm9keSxcbiAgICAgICAgICAgIHByb3BzOiB7IHRleHQgfVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCB7IHRvcCwgbGVmdCwgd2lkdGgsIGhlaWdodCB9ID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgdG9vbHRpcENvbXBvbmVudC4kc2V0KHtcbiAgICAgICAgICAgIHN0eWxlOiBgdG9wOiAke3RvcCArIGhlaWdodCArIHdpbmRvdy5zY3JvbGxZfXB4OyBsZWZ0OiAke2xlZnQgKyB3aWR0aCAvIDIgKyB3aW5kb3cuc2Nyb2xsWH1weDtgXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhpZGVUb29sdGlwKCkge1xuICAgICAgICBpZiAodG9vbHRpcENvbXBvbmVudCkge1xuICAgICAgICAgICAgdG9vbHRpcENvbXBvbmVudC4kZGVzdHJveSgpO1xuICAgICAgICAgICAgdG9vbHRpcENvbXBvbmVudCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCBzaG93VG9vbHRpcCk7XG4gICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgaGlkZVRvb2x0aXApO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdXBkYXRlKHsgdGV4dDogbmV3VGV4dCB9KSB7XG4gICAgICAgICAgICB0ZXh0ID0gbmV3VGV4dDtcbiAgICAgICAgICAgIGlmICh0b29sdGlwQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgdG9vbHRpcENvbXBvbmVudC4kc2V0KHsgdGV4dDogbmV3VGV4dCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZGVzdHJveSgpIHtcbiAgICAgICAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHNob3dUb29sdGlwKTtcbiAgICAgICAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIGhpZGVUb29sdGlwKTtcbiAgICAgICAgICAgIGlmICh0b29sdGlwQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgdG9vbHRpcENvbXBvbmVudC4kZGVzdHJveSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn0qLyAiLCI8c2NyaXB0IGxhbmc9XCJ0c1wiPlxuXG5cdGltcG9ydCBJbWFnZV90cmFzaCBmcm9tIFwiLi4vYnV0dG9ucy90cmFzaC5zdmVsdGVcIjtcblx0aW1wb3J0IEltYWdlX21pbnVzIGZyb20gXCIuLi9idXR0b25zL21pbnVzLnN2ZWx0ZVwiO1xuXHRpbXBvcnQgSW1hZ2VfcGx1cyBmcm9tIFwiLi4vYnV0dG9ucy9wbHVzLnN2ZWx0ZVwiO1xuICAgIGltcG9ydCBJbWFnZV9lZGl0IGZyb20gXCIuLi9idXR0b25zL2VkaXQuc3ZlbHRlXCI7IFxuXHRpbXBvcnQgSW1hZ2Vfc2F2ZSBmcm9tIFwiLi4vYnV0dG9ucy9kb3dubG9hZC5zdmVsdGVcIjsgXG4gICAgaW1wb3J0IHsgc2xpZGUgfSBmcm9tIFwic3ZlbHRlL3RyYW5zaXRpb25cIjtcbiAgICBpbXBvcnQgeyBjcmVhdGVFdmVudERpc3BhdGNoZXIsIG9uTW91bnQgfSBmcm9tIFwic3ZlbHRlXCI7ICBcblx0XG5cdGltcG9ydCB7IHRvb2x0aXAgfSBmcm9tICcuLi9NZXNzYWdlcy90b29sVGlwLmpzJztcbiAgICBpbXBvcnQgeyBJVmlld0VsZW1lbnQgfSBmcm9tIFwiLi4vLi4vVmlld3MvTGF5b3V0MDEvU3lzdGVtRGVzaWduZXIvVUlHcmFwaEl0ZW1zXCI7XG5cblxuXHRleHBvcnQgbGV0IGlzRWRpdGFibGVDb250YWluZXI6Ym9vbGVhbiA9IHRydWU7XG4gICAgZXhwb3J0IGxldCBjb2xsZWN0aW9uOiBJVmlld0VsZW1lbnRbXSA9IFtdO1xuXHRleHBvcnQgbGV0IG9uU2VsZWN0XHRcdDogKCBkOiBJVmlld0VsZW1lbnQgKSA9PiBib29sZWFuO1xuXHRleHBvcnQgbGV0IG9uQWRkXHRcdDooKCkgPT4gYW55KSB8IG51bGwgPSBudWxsOyBcblx0ZXhwb3J0IGxldCBvblNwZWNpYWxBZGRcdDooKCkgPT4gYW55KSB8IG51bGwgPSBudWxsOyAgXG5cdGV4cG9ydCBsZXQgb25VcGRhdGVJdGVtXHQ6KCAoaXRlbTpJVmlld0VsZW1lbnRbXSk9PmFueSkgfCBudWxsO1xuXHRleHBvcnQgbGV0IG9uRGVsZXRlSXRlbVx0OiggKGl0ZW06SVZpZXdFbGVtZW50KT0+YW55KSB8IG51bGw7XG5cdGV4cG9ydCBsZXQgZGlzYWJsZWQgOiBib29sZWFuID0gZmFsc2U7XG5cdGNvbnN0IGRpc3BhdGNoID0gY3JlYXRlRXZlbnREaXNwYXRjaGVyKCk7XG5cblx0bGV0IHNlbGVjdGVkIDogSVZpZXdFbGVtZW50IHwgbnVsbCA9IG51bGw7IFxuXHRsZXQgZWRpdElzQWN0aXZlID0gZmFsc2U7IFxuXHRcblx0b25Nb3VudCgoKT0+eyBcblx0XHRNb3VudCgpO1xuXHR9KVxuXHRcblx0ZnVuY3Rpb24gTW91bnQoKXt9XG4gXG5cdGV4cG9ydCBmdW5jdGlvbiBkZXNlbGVjdCgpe1xuXHRcdGlmKCFzZWxlY3RlZClcblx0XHRcdHJldHVybjtcblxuXHRcdHNlbGVjdGVkID0gbnVsbDtcblx0XHRkaXNwYXRjaCgnb25EZVNlbGVjdCcpXG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gc2VsZWN0KCBrZXkgOiBzdHJpbmcgKXtcblx0XHRcblx0XHRsZXQgaXRlbSA9IGNvbGxlY3Rpb24uZmluZCggcCA9PiBwLmtleSA9PSBrZXkgKTtcblx0XHRpZiAoIGl0ZW0/LmtleSA9PSBzZWxlY3RlZD8ua2V5KXtcblx0XHRcdGRlc2VsZWN0KCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdFxuXHRcdFxuXHRcdGVsc2UgaWYgKCBpdGVtICl7XG5cdFx0XHRfb25TZWxlY3QoIGl0ZW0gKTtcblx0XHR9XG5cdH1cblx0IFxuXHRmdW5jdGlvbiBfb25TZWxlY3QoaXRlbSA6IElWaWV3RWxlbWVudCl7IFxuXG5cdFx0Ly8gZW5zdXJlIHRoYXQgYSBDbGljayBvbiB0aGUgc2FtZSBpdGVtIGlzIGEgZGVzZWxlY3Rcblx0XHRpZiAoIGl0ZW0ua2V5ID09IHNlbGVjdGVkPy5rZXkgKXtcblx0XHRcdGRlc2VsZWN0KCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdFxuXHRcdGNvbnN0IGlzU2VsZWN0ZWQgPSBvblNlbGVjdChpdGVtKTsgXG5cdFx0aWYgKGlzU2VsZWN0ZWQpe1xuXHRcdFx0c2VsZWN0ZWQgPSBpdGVtO1xuXHRcdH0gZWxzZXtcblx0XHRcdHNlbGVjdGVkID0gbnVsbDtcblx0XHR9XG4gXG5cdH1cblxuXHRmdW5jdGlvbiBfb25BZGQoKXtcblx0XHRpZighb25BZGQpXG5cdFx0XHRyZXR1cm47XHRcblx0XHRvbkFkZCgpO1xuXHR9XG5cblxuXHQvLyBFRElUIEZVTkNUSU9OQUxJVElFUyBcblx0ZnVuY3Rpb24gb25FZGl0Q2xpY2tlZCggKXtcblxuXHRcdGNvbGxlY3Rpb24uZm9yRWFjaCggaXRlbSA9PiB7XG5cdFx0XHRpdGVtLm5hbWVFZGl0ID0gaXRlbS5uYW1lO1xuXHRcdH0pO1xuXHRcdGVkaXRJc0FjdGl2ZSA9ICFlZGl0SXNBY3RpdmU7XG5cdH1cblx0ZnVuY3Rpb24gb25FZGl0U2F2ZWQoICl7XG5cdCBcdCAgXG5cdFx0aWYgKCFvblVwZGF0ZUl0ZW0pe1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRvblVwZGF0ZUl0ZW0oIGNvbGxlY3Rpb24gKTsgIFxuXHRcdGVkaXRJc0FjdGl2ZSA9ICFlZGl0SXNBY3RpdmU7IFxuXHR9IFxuXG5cdGZ1bmN0aW9uIG9uRWRpdENhbmNlbFNpbmdsZSggaXRlbSA6IElWaWV3RWxlbWVudCApeyBcblx0XHRpdGVtLm5hbWVFZGl0ID0gaXRlbS5uYW1lOyBcblx0fVxuXHRmdW5jdGlvbiBvbkRlbGV0ZSggaXRlbSA6IElWaWV3RWxlbWVudCApeyBcblx0XHRpZiAoICFvbkRlbGV0ZUl0ZW0pIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0b25EZWxldGVJdGVtKCBpdGVtICk7XG5cdH0gXG5cdFxuXHRcblx0ZnVuY3Rpb24gb25FZGl0Rm9jdXMoIHJvdyA6IGFueSApe1xuXHRcdGNvbnN0IGVsZW1lbnQgPSByb3cudGFyZ2V0O1xuXHRcdGNvbnN0IHJhbmdlID0gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcblx0XHRjb25zdCBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG4gIFxuXHRcdGlmICghcmFuZ2UgfHwgIXNlbGVjdGlvbil7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuIFxuXHRcdHJhbmdlLnNlbGVjdE5vZGVDb250ZW50cyhlbGVtZW50KTtcblx0XHRyYW5nZS5jb2xsYXBzZShmYWxzZSk7IC8vIENvbGxhcHNlIHRoZSByYW5nZSB0byB0aGUgZW5kXG5cdFx0c2VsZWN0aW9uLnJlbW92ZUFsbFJhbmdlcygpO1xuXHRcdHNlbGVjdGlvbi5hZGRSYW5nZShyYW5nZSk7XG5cdH1cblxuIFxuXG48L3NjcmlwdD5cblxuXG4gICAgPGRpdiBjbGFzcz17IGlzRWRpdGFibGVDb250YWluZXIgPyBcIkdyb2JzSW50ZXJhY3RpdmVDb250YWluZXIgZWRpdGFibGVUYWJsZVwiIDogXCJlZGl0YWJsZVRhYmxlXCJ9ID5cblx0XHRcdHsjaWYgKCFkaXNhYmxlZCkgfVxuXHRcdFx0XHQ8ZGl2XG5cdFx0XHRcdFx0Y2xhc3M9XCJFZGl0YWJsZV9yb3dIZWFkZXJcIiAgXG5cdFx0XHRcdFx0dHJhbnNpdGlvbjpzbGlkZXxsb2NhbFxuXHRcdFx0XHRcdGRhdGEtY2FuLWhvdmVyPXt0cnVlfSBcblx0XHRcdFx0PlxuXG5cdFx0XHRcdFx0PCEtLSBlZGl0IC0tPlxuXHRcdFx0XHRcdHsjaWYgb25VcGRhdGVJdGVtICE9IG51bGwgfVxuXHRcdFx0XHRcdFx0eyNpZiAhZWRpdElzQWN0aXZlIH1cblx0XHRcdFx0XHRcdFx0PGltYWdlQ29udGFpbmVyIFxuXHRcdFx0XHRcdFx0XHRcdG9uOmNsaWNrPXsgb25FZGl0Q2xpY2tlZCB9XG5cdFx0XHRcdFx0XHRcdFx0b246a2V5dXA9eyBvbkVkaXRDbGlja2VkIH1cblx0XHRcdFx0XHRcdFx0XHR0cmFuc2l0aW9uOnNsaWRlfGxvY2FsXG5cdFx0XHRcdFx0XHRcdFx0cm9sZT1cIm5vbmVcIlxuXHRcdFx0XHRcdFx0XHRcdHVzZTp0b29sdGlwPXt7IHRleHQ6ICdUdXJuIG9uIEVkaXQgbW9kZScsIHR5cGU6J3ZlcmJvc2UnIH19IFxuXHRcdFx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHRcdFx0PEltYWdlX2VkaXQgY29sb3I9eyAnd2hpdGUnfSAvPlxuXHRcdFx0XHRcdFx0XHQ8L2ltYWdlQ29udGFpbmVyID5cblx0XHRcdFx0XHRcdHs6ZWxzZX1cblx0XHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHRcdDxpbWFnZUNvbnRhaW5lciBcblx0XHRcdFx0XHRcdFx0XHRvbjpjbGljaz17IG9uRWRpdENsaWNrZWQgfVxuXHRcdFx0XHRcdFx0XHRcdG9uOmtleXVwPXsgb25FZGl0Q2xpY2tlZCB9XG5cdFx0XHRcdFx0XHRcdFx0dHJhbnNpdGlvbjpzbGlkZXxsb2NhbFxuXHRcdFx0XHRcdFx0XHRcdHJvbGU9XCJub25lXCJcblx0XHRcdFx0XHRcdFx0XHR1c2U6dG9vbHRpcD17eyB0ZXh0OiAnVHVybiBvZmYgRWRpdCBtb2RlJywgdHlwZTondmVyYm9zZScgfX0gXG5cdFx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0XHQ8SW1hZ2VfZWRpdCBjb2xvcj17ICd3aGl0ZSd9IC8+XG5cdFx0XHRcdFx0XHRcdDwvaW1hZ2VDb250YWluZXIgPlxuXHRcdFx0XHRcdFx0XHQ8aW1hZ2VDb250YWluZXIgXG5cdFx0XHRcdFx0XHRcdFx0b246Y2xpY2s9eyBvbkVkaXRTYXZlZCB9XG5cdFx0XHRcdFx0XHRcdFx0b246a2V5dXA9eyBvbkVkaXRTYXZlZCB9XG5cdFx0XHRcdFx0XHRcdFx0dHJhbnNpdGlvbjpzbGlkZXxsb2NhbFxuXHRcdFx0XHRcdFx0XHRcdHJvbGU9XCJub25lXCJcblx0XHRcdFx0XHRcdFx0XHR1c2U6dG9vbHRpcD17eyB0ZXh0OiAnU2F2ZSBjaGFuZ2VzIG1hZGUnLCB0eXBlOid2ZXJib3NlJyB9fSBcblx0XHRcdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0XHRcdDxJbWFnZV9zYXZlIGNvbG9yPXsgJ3doaXRlJ30gLz5cblx0XHRcdFx0XHRcdFx0PC9pbWFnZUNvbnRhaW5lciA+XG5cblx0XHRcdFx0XHRcdFx0PGltYWdlQ29udGFpbmVyIFxuXHRcdFx0XHRcdFx0XHRcdG9uOmNsaWNrPXsgb25FZGl0Q2xpY2tlZCB9XG5cdFx0XHRcdFx0XHRcdFx0b246a2V5dXA9eyBvbkVkaXRDbGlja2VkIH1cblx0XHRcdFx0XHRcdFx0XHR0cmFuc2l0aW9uOnNsaWRlfGxvY2FsXG5cdFx0XHRcdFx0XHRcdFx0cm9sZT1cIm5vbmVcIlxuXHRcdFx0XHRcdFx0XHRcdHVzZTp0b29sdGlwPXt7IHRleHQ6ICdEaXNjYXJkIENoYW5nZXMnLCB0eXBlOid2ZXJib3NlJyB9fSBcblx0XHRcdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0XHRcdDxJbWFnZV9taW51cyBjb2xvcj17ICd3aGl0ZSd9IC8+XG5cdFx0XHRcdFx0XHRcdDwvaW1hZ2VDb250YWluZXIgPlxuXHRcdFx0XHRcdFx0ey9pZn1cblx0XHRcdFx0XHR7L2lmfVxuXG5cdFx0XHRcdFx0PCEtLSBBZGQgLS0+XG5cdFx0XHRcdFx0eyNpZiBvbkFkZCAhPSBudWxsIH1cblx0XHRcdFx0XHRcdDxpbWFnZUNvbnRhaW5lciBcblx0XHRcdFx0XHRcdFx0b246Y2xpY2s9eyAoKSA9PntpZihfb25BZGQpeyBfb25BZGQoKX19IH1cblx0XHRcdFx0XHRcdFx0b246a2V5dXAgXG5cdFx0XHRcdFx0XHRcdHRyYW5zaXRpb246c2xpZGV8bG9jYWxcblx0XHRcdFx0XHRcdFx0cm9sZT1cIm5vbmVcIlxuXHRcdFx0XHRcdFx0XHR1c2U6dG9vbHRpcD17eyB0ZXh0OiAnQWRkIFRvIExpc3QnLCB0eXBlOid2ZXJib3NlJyB9fSBcblx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0PEltYWdlX3BsdXMgY29sb3I9eyAnd2hpdGUnfSAvPlxuXHRcdFx0XHRcdFx0PC9pbWFnZUNvbnRhaW5lciA+XG5cdFx0XHRcdFx0ey9pZn1cblxuXHRcdFx0XHRcdDwhLS0gQWRkIFNwZWNpYWwgLS0+XG5cdFx0XHRcdFx0eyNpZiBvblNwZWNpYWxBZGQgIT0gbnVsbCB9XG5cdFx0XHRcdFx0XHQ8aW1hZ2VDb250YWluZXIgXG5cdFx0XHRcdFx0XHRcdG9uOmNsaWNrPXsgKCkgPT4ge2lmKG9uU3BlY2lhbEFkZCl7b25TcGVjaWFsQWRkKCl9fSB9XG5cdFx0XHRcdFx0XHRcdG9uOmtleXVwIFxuXHRcdFx0XHRcdFx0XHR0cmFuc2l0aW9uOnNsaWRlfGxvY2FsXG5cdFx0XHRcdFx0XHRcdHJvbGU9XCJub25lXCJcblx0XHRcdFx0XHRcdFx0dXNlOnRvb2x0aXA9e3sgdGV4dDogJ0FkZCBFbnRpcmUgY29sbGVjdGlvbicsIHR5cGU6J3ZlcmJvc2UnIH19IFxuXHRcdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0XHQ8SW1hZ2VfcGx1cyBjb2xvcj17ICd5ZWxsb3cnfSAvPlxuXHRcdFx0XHRcdFx0PC9pbWFnZUNvbnRhaW5lciA+XG5cdFx0XHRcdFx0ey9pZn1cblxuXHRcdFx0XHQ8L2Rpdj5cblx0XHRcdHsvaWZ9XG5cdFx0XHR7I2VhY2ggY29sbGVjdGlvbiBhcyBlbGVtZW50ICwgaSAgKCBlbGVtZW50LmtleSApIH0gXG5cdFx0XHRcdHtAY29uc3QgZGVsZXRlSXNBbGxvd2VkPSggIWRpc2FibGVkICYmIChvbkRlbGV0ZUl0ZW0gIT0gbnVsbCkgICkgICYmICFlZGl0SXNBY3RpdmUgIH1cblx0XHRcdFx0PGRpdlxuXHRcdFx0XHRcdGNsYXNzPVwiRWRpdGFibGVfcm93XCIgXG5cdFx0XHRcdFx0ZGF0YS1zZWxlY3RlZD17ICFlZGl0SXNBY3RpdmUgJiYgKGVsZW1lbnQua2V5ID09IHNlbGVjdGVkPy5rZXkpIH1cblx0XHRcdFx0XHR0cmFuc2l0aW9uOnNsaWRlfGxvY2FsXG5cdFx0XHRcdFx0ZGF0YS1jYW4taG92ZXI9e3RydWV9XG5cdFx0XHRcdFx0ZGF0YS1pc0VkaXQ9eyBlZGl0SXNBY3RpdmUgJiYgKGVsZW1lbnQubmFtZSAhPSBlbGVtZW50Lm5hbWVFZGl0KSB9IFxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0eyNpZiAhZWRpdElzQWN0aXZlIH0gXG5cdFx0XHRcdFx0XHQ8ZGl2XG5cdFx0XHRcdFx0XHRcdHRhYmluZGV4PVwiLTFcIiBcblx0XHRcdFx0XHRcdFx0Y29udGVudGVkaXRhYmxlPVwiZmFsc2VcIiBcblx0XHRcdFx0XHRcdFx0b246Y2xpY2s9eyAoKSA9PiB7IGlmKCBkaXNhYmxlZCApeyByZXR1cm4gfSAgX29uU2VsZWN0KGVsZW1lbnQpfSB9XG5cdFx0XHRcdFx0XHRcdG9uOmtleXVwIFxuXHRcdFx0XHRcdFx0XHRyb2xlPVwibm9uZVwiXG5cdFx0XHRcdFx0XHQ+ICBcblx0XHRcdFx0XHRcdFx0eyBlbGVtZW50Lm5hbWUgfSBcblx0XHRcdFx0XHRcdDwvZGl2PlxuXHRcdFx0XHRcdHs6ZWxzZX1cblx0XHRcdFx0XHRcdDxkaXZcblx0XHRcdFx0XHRcdFx0dGFiaW5kZXg9XCIxXCIgXG5cdFx0XHRcdFx0XHRcdHJvbGU9XCJjZWxsXCJcblx0XHRcdFx0XHRcdFx0Y29udGVudGVkaXRhYmxlPVwidHJ1ZVwiXG5cdFx0XHRcdFx0XHRcdG9uOmZvY3VzPXsgb25FZGl0Rm9jdXMgfVxuXHRcdFx0XHRcdFx0XHRiaW5kOnRleHRDb250ZW50PXsgZWxlbWVudC5uYW1lRWRpdCB9IFxuXHRcdFx0XHRcdFx0XHRhdXRvZm9jdXM9e3RydWV9XG5cdFx0XHRcdFx0XHQ+IFxuXHRcdFx0XHRcdFx0PC9kaXY+XG5cdFx0XHRcdFx0ey9pZiB9XG5cdFx0XHRcdCAgXG5cdFx0XHRcdFx0PGRpdj4gXG5cdFx0XHRcdFx0XHR7I2lmIGRlbGV0ZUlzQWxsb3dlZCB9IFxuXHRcdFx0XHRcdFx0XHQ8aW1hZ2VDb250YWluZXIgIFxuXHRcdFx0XHRcdFx0XHRcdG9uOmNsaWNrPXsgKCkgPT4gb25EZWxldGUoIGVsZW1lbnQgKSB9XG5cdFx0XHRcdFx0XHRcdFx0b246a2V5dXAgXG5cdFx0XHRcdFx0XHRcdFx0cm9sZT1cIm5vbmVcIlxuXHRcdFx0XHRcdFx0XHRcdHRyYW5zaXRpb246c2xpZGV8bG9jYWxcblx0XHRcdFx0XHRcdFx0XHR1c2U6dG9vbHRpcD17eyB0ZXh0OiAnRGVsZXRlIGl0ZW0nLCB0eXBlOid2ZXJib3NlJyAsIH19XG5cdFx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0XHQ8SW1hZ2VfdHJhc2ggY29sb3I9eyAnd2hpdGUnfS8+XG5cdFx0XHRcdFx0XHRcdDwvaW1hZ2VDb250YWluZXI+ICAgXG5cdFx0XHRcdFx0XHR7OmVsc2UgaWYgZWRpdElzQWN0aXZlICYmIGVsZW1lbnQubmFtZSAhPSBlbGVtZW50Lm5hbWVFZGl0IH1cblx0XHRcdFx0XHRcdFx0PGltYWdlQ29udGFpbmVyICBcblx0XHRcdFx0XHRcdFx0XHRvbjpjbGljaz17ICgpID0+IG9uRWRpdENhbmNlbFNpbmdsZShlbGVtZW50KSB9XG5cdFx0XHRcdFx0XHRcdFx0b246a2V5dXAgXG5cdFx0XHRcdFx0XHRcdFx0cm9sZT1cIm5vbmVcIlxuXHRcdFx0XHRcdFx0XHRcdHRyYW5zaXRpb246c2xpZGV8bG9jYWxcblx0XHRcdFx0XHRcdFx0XHR1c2U6dG9vbHRpcD17eyB0ZXh0OiAnRGVsZXRlIGl0ZW0nLCB0eXBlOid2ZXJib3NlJyAsIH19XG5cdFx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdFx0XHQ8SW1hZ2VfbWludXMgY29sb3I9eyAnd2hpdGUnfS8+XG5cdFx0XHRcdFx0XHRcdDwvaW1hZ2VDb250YWluZXI+ICAgXG5cdFx0XHRcdFx0XHR7OmVsc2V9XG5cdFx0XHRcdFx0XHRcdDxpbWFnZUNvbnRhaW5lciA+IDwvaW1hZ2VDb250YWluZXI+IFxuXHRcdFx0XHRcdFx0ey9pZn1cblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdDwvZGl2PiBcblx0XHRcdFx0PC9kaXY+XG5cdFx0XHR7L2VhY2h9XG5cdFx0XHRcblx0PC9kaXY+XG5cbiAiLCI8c2NyaXB0IGxhbmc9XCJ0c1wiPlxuICAgIGltcG9ydCB7IHNsaWRlIH0gZnJvbSBcInN2ZWx0ZS90cmFuc2l0aW9uXCI7IFxuICAgIGltcG9ydCB7IGNyZWF0ZUV2ZW50RGlzcGF0Y2hlciB9IGZyb20gXCJzdmVsdGVcIjtcblxuXHRleHBvcnQgbGV0IHRpdGxlIDogc3RyaW5nIDtcblx0bGV0IGRpc3BhdGNoID0gY3JlYXRlRXZlbnREaXNwYXRjaGVyKCk7XG5cdGxldCB0b29nbGVkID0gZmFsc2U7XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIHRvb2dsZSggZm9yY2VTdGF0ZSA6IGJvb2xlYW4gfCBudWxsID0gbnVsbCApe1xuXHRcdGxldCBvcmlnU3RhdGUgPSB0b29nbGVkO1xuXHRcdGlmICggZm9yY2VTdGF0ZSA9PSBudWxsICl7XG5cdFx0XHR0b29nbGVkID0gIXRvb2dsZWQ7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0dG9vZ2xlZCA9IGZvcmNlU3RhdGU7XG5cdFx0fVxuXG5cdFx0Ly8gYXZvaWQgdXBkYXRpbmcgaWYgdGhlIHN0YXRlIGlzIHVuY2hhbmdlZFxuXHRcdGlmKHRvb2dsZWQgPT0gb3JpZ1N0YXRlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0aWYodG9vZ2xlZCl7XG5cdFx0XHRkaXNwYXRjaCgnY2xvc2UnKVxuXHRcdH1lbHNle1xuXHRcdFx0ZGlzcGF0Y2goJ29wZW4nKVxuXHRcdH1cblx0XG5cdH1cblxuXHRcblxuPC9zY3JpcHQ+XG48ZGl2PlxuXHQ8ZGl2IGNsYXNzPVwidG9vZ2xlU2VjdGlvbkhlYWRlclwiIG9uOmNsaWNrPXsgKCkgPT4gdG9vZ2xlKCkgfSBkYXRhLXRvb2dsZWQ9e3Rvb2dsZWR9ID5cblx0XHQ8cFx0XHRcdHN0eWxlPVwiZ3JpZC1hcmVhOm5hbWU7XCIgPnt0aXRsZX08L3A+XG5cdFx0PHNlY3Rpb25cdHN0eWxlPVwiZ3JpZC1hcmVhOmljb247XCIgY2xhc3M9XCJ0b29nbGVTZWN0aW9uSWNvblwiID4mbmJzcDs8L3NlY3Rpb24+XG5cdFx0PGRpdlx0XHRzdHlsZT1cImdyaWQtYXJlYTpsaW5lO1wiIGNsYXNzPVwidG9vZ2xlU2VjdGluTGluZVwiID48L2Rpdj5cblx0PC9kaXY+XG5cdDxkaXYgY2xhc3M9XCJ0b29nbGVTZWN0aW9uQm9keVwiID4gXG5cdFx0eyNpZiB0b29nbGVkfVxuXHRcdFx0PGRpdiB0cmFuc2l0aW9uOnNsaWRlID5cblx0XHRcdFx0PHNsb3QgLz5cblx0XHRcdDwvZGl2PlxuXHRcdHsvaWZ9IFxuXHQ8L2Rpdj5cbjwvZGl2PiIsIjxzY3JpcHQgbGFuZz1cInRzXCI+XG4gICAgaW1wb3J0IHsgVFRSUEdTeXN0ZW1KU09ORm9ybWF0dGluZyB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvTW9kdWxlcy9ncmFwaERlc2lnbmVyXCI7XG4gICAgaW1wb3J0IHsgVUlDb2xsZWN0aW9uLCBVSUdyb3VwLCBVSU5vZGUsIFVJU3lzdGVtIH0gZnJvbSBcIi4vVUlHcmFwaEl0ZW1zXCI7XG4gICAgaW1wb3J0IEVkaXRBYmxlTGlzdDIgZnJvbSBcIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9Nb2R1bGVzL3VpL0NvbXBvbmVudHMvZWRpdEFibGVMaXN0L0VkaXRBYmxlTGlzdDIuc3ZlbHRlXCI7XG4gICAgaW1wb3J0IFRvb2dsZVNlY3Rpb24gZnJvbSBcIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9Nb2R1bGVzL3VpL0NvbXBvbmVudHMvdG9vZ2xlU2VjdGlvbi90b29nbGVTZWN0aW9uLnN2ZWx0ZVwiO1xuXG4gICAgXG4gICAgZXhwb3J0IGxldCBzeXN0ZW0gOiBUVFJQR1N5c3RlbUpTT05Gb3JtYXR0aW5nO1xuICAgIGxldCB1aVN5c3RlbSA9IG5ldyBVSVN5c3RlbShzeXN0ZW0pO1xuXG5cdC8vIEdlbmVyaWNcblx0bGV0IGdycFNlbCA6IFVJR3JvdXBcdFx0fCBudWxsID0gbnVsbDtcblx0bGV0IGNvbFNlbCA6IFVJQ29sbGVjdGlvblx0fCBudWxsID0gbnVsbDtcblx0bGV0IG5vZFNlbCA6IFVJTm9kZVx0XHRcdHwgbnVsbCA9IG51bGw7XG5cblx0ZnVuY3Rpb24gZ3JwU2VsZWN0KCBncnAgOiAgVUlHcm91cFx0XHR8bnVsbHxhbnkpe1xuXHRcdGNvbFNlbGVjdChudWxsKTtcblx0XHRncnBTZWwgPSBncnA7XG5cdH1cblx0ZnVuY3Rpb24gY29sU2VsZWN0KCBjb2wgOiAgVUlDb2xsZWN0aW9uXHR8bnVsbHxhbnkpe1xuXHRcdG5vZFNlbGVjdChudWxsKTtcblx0XHRjb2xTZWwgPSBjb2w7XG5cdH1cblx0ZnVuY3Rpb24gbm9kU2VsZWN0KCBub2QgOiAgVUlOb2RlXHRcdHxudWxsfGFueSl7XG5cdFx0bm9kU2VsID0gbm9kO1xuXHR9XG5cblx0Ly8gRGVyaXZlZCBGaXhlZCBMb2dpY1xuXHRsZXQgZGVyaXZlZEdycFx0PSB1aVN5c3RlbS5ncm91cHMuZmluZCggcCA9PiBwLm5hbWUgPT0gJ2Rlcml2ZWQnKTtcblx0bGV0IGZpeGVkR3JwXHQ9IHVpU3lzdGVtLmdyb3Vwcy5maW5kKCBwID0+IHAubmFtZSA9PSAnZml4ZWQnKTtcblxuXHRsZXQgZGVyaXZlZENvbFx0OiBVSUNvbGxlY3Rpb24gfCBudWxsID0gbnVsbDtcblx0bGV0IGZpeGVkQ29sXHQ6IFVJQ29sbGVjdGlvbiB8IG51bGwgPSBudWxsO1xuXG5cdGxldCBkZXJpdmVkTm9kXHQ6IFVJTm9kZSB8IG51bGwgPSBudWxsO1xuXHRsZXQgZml4ZWROb2RcdDogVUlOb2RlIHwgbnVsbCA9IG51bGw7XG5cblx0ZnVuY3Rpb24gX2NvbFNlbGVjdCggZ3JwOidkZXJpdmVkJ3wnZml4ZWQnICxjb2wgOiAgVUlDb2xsZWN0aW9uXHR8bnVsbHxhbnkpe1xuXHRcdF9ub2RTZWxlY3QoZ3JwLG51bGwpO1xuXG5cdFx0aWYgKGdycCA9PSAnZGVyaXZlZCcpIHtcblx0XHRcdGRlcml2ZWRDb2wgPSBjb2w7XG5cdFx0fVxuXHRcdGVsc2Uge1xuXHRcdFx0Zml4ZWRDb2wgPSBjb2w7XG5cdFx0fVxuXHR9XG5cdGZ1bmN0aW9uIF9ub2RTZWxlY3QoIGdycDonZGVyaXZlZCd8J2ZpeGVkJywgbm9kIDogVUlOb2RlIHxudWxsfGFueSl7XHRcdG5vZFNlbCA9IG5vZDtcblx0XHRpZiAoZ3JwID09ICdkZXJpdmVkJykge1xuXHRcdFx0ZGVyaXZlZE5vZCA9IG5vZDtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRmaXhlZE5vZCA9IG5vZDtcblx0XHR9XG5cdH1cblxuPC9zY3JpcHQ+XG48ZGl2PlxuXHQ8VG9vZ2xlU2VjdGlvbiBcblx0XHR0aXRsZT1cImZpeGVkXCJcblx0PlxuXHRcdDxkaXY+XG5cdFx0XHQ8aDE+Rml4ZWQgSXRlbSBEZXNpZ248L2gxPlxuXHRcdFx0PHA+XG5cdFx0XHRcdEZpeGVkIHByb3BlcnRpZXMgYXJlIHRoZSBwcm9wZXJ0aWVzIHRoYXQgYXJlIGRlZmllbmQgb24gZWFjaCBhcnRpY2xlJ3MgbWV0YSBkYXRhLlxuXHRcdFx0PC9wPlxuXHRcdDwvZGl2PlxuXHRcdDxkaXYgc3R5bGU9XCJkaXNwbGF5OmdyaWQ7Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOjFmciAxZnI7Z2FwOjEwcHg7XCIgPlxuXHRcdFx0PEVkaXRBYmxlTGlzdDIgXG5cdFx0XHRcdGNvbGxlY3Rpb249eyBmaXhlZEdycD8uY29sbGVjdGlvbnMgPz8gW10gfVxuXHRcdFx0XHRvblNlbGVjdCAgICBcdD17IChlKSA9PiB7IF9jb2xTZWxlY3QoJ2ZpeGVkJyxlKTsgcmV0dXJuIHRydWUgfX1cblx0XHRcdFx0b25BZGQgICAgICAgXHQ9eyAoICkgPT4geyByZXR1cm4gdHJ1ZSB9fVxuXHRcdFx0XHRvblVwZGF0ZUl0ZW1cdD17ICggKSA9PiB7IHJldHVybiB0cnVlIH19XG5cdFx0XHRcdG9uRGVsZXRlSXRlbVx0PXsgKGUpID0+IHsgcmV0dXJuIHRydWUgfX0gXG5cdFx0XHRcdG9uOm9uRGVTZWxlY3RcdD17ICggKSA9PiB7IH19XG5cdFx0XHQvPlxuXHRcdFx0PEVkaXRBYmxlTGlzdDIgXG5cdFx0XHRcdGNvbGxlY3Rpb249eyBmaXhlZENvbD8ubm9kZXMgPz8gW10gfVxuXHRcdFx0XHRvblNlbGVjdCAgICBcdD17IChlKSA9PiB7IF9ub2RTZWxlY3QoJ2ZpeGVkJyxlKTsgcmV0dXJuIHRydWUgfX1cblx0XHRcdFx0b25BZGQgICAgICAgXHQ9eyAoICkgPT4geyByZXR1cm4gdHJ1ZSB9fVxuXHRcdFx0XHRvblVwZGF0ZUl0ZW1cdD17ICggKSA9PiB7IHJldHVybiB0cnVlIH19XG5cdFx0XHRcdG9uRGVsZXRlSXRlbVx0PXsgKGUpID0+IHsgcmV0dXJuIHRydWUgfX0gXG5cdFx0XHRcdG9uOm9uRGVTZWxlY3RcdD17ICggKSA9PiB7IF9jb2xTZWxlY3QoJ2ZpeGVkJyxudWxsKTt9fVxuXHRcdFx0Lz5cblx0XHQ8L2Rpdj5cblx0PC9Ub29nbGVTZWN0aW9uPlxuXG5cdDxUb29nbGVTZWN0aW9uIFxuXHRcdHRpdGxlPVwiZGVyaXZlZFwiXG5cdD5cblx0XHQ8ZGl2PlxuXHRcdFx0PGgxPkRlcml2ZWQgSXRlbSBEZXNpZ248L2gxPlxuXHRcdFx0PHA+XG5cdFx0XHRcdERlcml2ZWQgcHJvcGVydGllcyBhcmUgdGhlIGRhdGEsIHRoYXQgYXJlIGRlcml2ZWQgZnJvbSBmaXhlZERhdGFcblx0XHRcdDwvcD5cblx0XHQ8L2Rpdj5cblx0XHQ8ZGl2IHN0eWxlPVwiZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczoxZnIgMWZyO2dhcDoxMHB4O1wiID5cblx0XHRcdDxFZGl0QWJsZUxpc3QyIFxuXHRcdFx0XHRjb2xsZWN0aW9uPXsgZGVyaXZlZEdycD8uY29sbGVjdGlvbnMgPz8gW10gfVxuXHRcdFx0XHRvblNlbGVjdCAgICBcdD17IChlKSA9PiB7IF9jb2xTZWxlY3QoJ2Rlcml2ZWQnLGUpOyByZXR1cm4gdHJ1ZSB9fVxuXHRcdFx0XHRvbkFkZCAgICAgICBcdD17ICggKSA9PiB7IHJldHVybiB0cnVlIH19XG5cdFx0XHRcdG9uVXBkYXRlSXRlbVx0PXsgKCApID0+IHsgcmV0dXJuIHRydWUgfX1cblx0XHRcdFx0b25EZWxldGVJdGVtXHQ9eyAoZSkgPT4geyByZXR1cm4gdHJ1ZSB9fSBcblx0XHRcdFx0b246b25EZVNlbGVjdFx0PXsgKCApID0+IHsgX2NvbFNlbGVjdCgnZGVyaXZlZCcsbnVsbCk7fX1cblx0XHRcdC8+XG5cdFx0XHQ8RWRpdEFibGVMaXN0MiBcblx0XHRcdFx0Y29sbGVjdGlvbj17IGRlcml2ZWRDb2w/Lm5vZGVzID8/IFtdIH1cblx0XHRcdFx0b25TZWxlY3QgICAgXHQ9eyAoZSkgPT4geyBfbm9kU2VsZWN0KCdkZXJpdmVkJyxlKTsgcmV0dXJuIHRydWUgfX1cblx0XHRcdFx0b25BZGQgICAgICAgXHQ9eyAoICkgPT4geyByZXR1cm4gdHJ1ZSB9fVxuXHRcdFx0XHRvblVwZGF0ZUl0ZW1cdD17ICggKSA9PiB7IHJldHVybiB0cnVlIH19XG5cdFx0XHRcdG9uRGVsZXRlSXRlbVx0PXsgKGUpID0+IHsgcmV0dXJuIHRydWUgfX0gXG5cdFx0XHRcdG9uOm9uRGVTZWxlY3RcdD17ICggKSA9PiB7IH19XG5cdFx0XHQvPlxuXHRcdDwvZGl2PlxuXHQ8L1Rvb2dsZVNlY3Rpb24+XG5cblx0PCEtLVxuXHQ8ZGl2IHN0eWxlPVwiZGlzcGxheTpncmlkO2dyaWQtdGVtcGxhdGUtY29sdW1uczoxZnIgMWZyIDFmcjtnYXA6MTBweDtcIiA+XG5cdFx0PEVkaXRBYmxlTGlzdDIgXG5cdFx0XHRjb2xsZWN0aW9uPXsgdWlTeXN0ZW0uZ3JvdXBzIH1cblx0XHRcdG9uU2VsZWN0ICAgIFx0PXsgKGUpID0+IHsgZ3JwU2VsZWN0KGUpOyByZXR1cm4gdHJ1ZSB9fVxuXHRcdFx0b25BZGQgICAgICAgXHQ9eyAoICkgPT4geyByZXR1cm4gdHJ1ZSB9fVxuXHRcdFx0b25VcGRhdGVJdGVtXHQ9eyAoICkgPT4geyByZXR1cm4gdHJ1ZSB9fVxuXHRcdFx0b25EZWxldGVJdGVtXHQ9eyAoZSkgPT4geyByZXR1cm4gdHJ1ZSB9fSBcblx0XHRcdG9uOm9uRGVTZWxlY3RcdD17ICggKSA9PiB7IH19XG5cdFx0Lz5cblx0XHQ8RWRpdEFibGVMaXN0MiBcblx0XHRcdGNvbGxlY3Rpb249eyBncnBTZWw/LmNvbGxlY3Rpb25zID8/IFtdIH1cblx0XHRcdG9uU2VsZWN0ICAgIFx0PXsgKGUpID0+IHsgY29sU2VsZWN0KGUpOyByZXR1cm4gdHJ1ZSB9fVxuXHRcdFx0b25BZGQgICAgICAgXHQ9eyAoICkgPT4geyByZXR1cm4gdHJ1ZSB9fVxuXHRcdFx0b25VcGRhdGVJdGVtXHQ9eyAoICkgPT4geyByZXR1cm4gdHJ1ZSB9fVxuXHRcdFx0b25EZWxldGVJdGVtXHQ9eyAoZSkgPT4geyByZXR1cm4gdHJ1ZSB9fSBcblx0XHRcdG9uOm9uRGVTZWxlY3RcdD17ICggKSA9PiB7IH19XG5cdFx0Lz5cblx0XHQ8RWRpdEFibGVMaXN0MiBcblx0XHRcdGNvbGxlY3Rpb249eyBjb2xTZWw/Lm5vZGVzID8/IFtdIH1cblx0XHRcdG9uU2VsZWN0ICAgIFx0PXsgKGUpID0+IHsgbm9kU2VsZWN0KGUpOyByZXR1cm4gdHJ1ZSB9fVxuXHRcdFx0b25BZGQgICAgICAgXHQ9eyAoICkgPT4geyByZXR1cm4gdHJ1ZSB9fVxuXHRcdFx0b25VcGRhdGVJdGVtXHQ9eyAoICkgPT4geyByZXR1cm4gdHJ1ZSB9fVxuXHRcdFx0b25EZWxldGVJdGVtXHQ9eyAoZSkgPT4geyByZXR1cm4gdHJ1ZSB9fSBcblx0XHRcdG9uOm9uRGVTZWxlY3RcdD17ICggKSA9PiB7IH19XG5cdFx0Lz5cblxuXG5cdDwvZGl2PlxuXHQtLT5cblxuPC9kaXY+IiwiPHNjcmlwdCBsYW5nPVwidHNcIj5cbiAgICBpbXBvcnQgeyBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xuXG5cblx0aW1wb3J0IEVkaXRBYmxlTGlzdCBmcm9tIFx0XHRcdFx0XHRcIi4uLy4uLy4uLy4uL0NvbXBvbmVudHMvZWRpdEFibGVMaXN0L0VkaXRBYmxlTGlzdC5zdmVsdGVcIjsgXG4gICAgaW1wb3J0IFN0YXRpY01lc3NhZ2VIYW5kbGVyIGZyb20gXHRcdFx0XCIuLi8uLi8uLi8uLi9Db21wb25lbnRzL01lc3NhZ2VzL1N0YXRpY01lc3NhZ2VIYW5kbGVyLnN2ZWx0ZVwiO1xuICAgIGltcG9ydCB7IFdyaXRhYmxlLCB3cml0YWJsZSB9IGZyb20gXCJzdmVsdGUvc3RvcmVcIjtcbiAgICBpbXBvcnQgeyBmYWRlLCBzbGlkZSB9IGZyb20gXCJzdmVsdGUvdHJhbnNpdGlvblwiO1xuICAgIGltcG9ydCB7IExheW91dDAxQ29udGV4dCB9IGZyb20gXCIuLi8uLi9jb250ZXh0XCI7XG4gICAgaW1wb3J0IHsgVFRSUEdTeXN0ZW1KU09ORm9ybWF0dGluZyB9IGZyb20gXHRcIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9Nb2R1bGVzL2dyYXBoRGVzaWduZXIvaW5kZXhcIjtcbiAgICBpbXBvcnQgeyBTeXN0ZW1QcmV2aWV3IH0gZnJvbSBcdFx0XHRcdFwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL01vZHVsZXMvY29yZS9tb2RlbC9zeXN0ZW1QcmV2aWV3XCI7XG4gICAgaW1wb3J0IFN5c3RlbURlc2lnbmVyM1BhcnRzIGZyb20gXCIuLi8uLi9TeXN0ZW1EZXNpZ25lci9TeXN0ZW1EZXNpZ25lcjNQYXJ0cy5zdmVsdGVcIjtcblxuXHQvL2xldCBtZXNzYWdlSGFuZGxlciA6IFN0YXRpY01lc3NhZ2VIYW5kbGVyO1xuXHRcblx0ZXhwb3J0IGxldCBjb250ZXh0XHQ6IExheW91dDAxQ29udGV4dDsgXG5cdGxldCBhY3RpdmVTeXN0ZW0gOiBUVFJQR1N5c3RlbUpTT05Gb3JtYXR0aW5nID0gY29udGV4dC5hY3RpdmVTeXN0ZW07XG5cdGxldCBhdmFpbFN5c3RlbXMgOiBTeXN0ZW1QcmV2aWV3W10gPSBbXTtcblx0XG5cdGNvbnN0IG51bGxwcmV2aWV3ID0gbmV3IFN5c3RlbVByZXZpZXcoKTtcblx0bGV0IGFjdGl2ZVByZXZpZXc6IFN5c3RlbVByZXZpZXcgPSBudWxscHJldmlldztcblx0bGV0IHVua25vd25TdHJpbmcgPSAndW5rbm93bic7XG5cblx0bGV0IGZhY3RvcnkgOiBUVFJQR1N5c3RlbUpTT05Gb3JtYXR0aW5nIHwgbnVsbCA9IG51bGw7XG5cdFxuXG4gXG5cdG9uTW91bnQoICgpID0+IHtcblx0XHRhdmFpbFN5c3RlbXMgPSBjb250ZXh0LmF2YWlsYWJsZVByZXZpZXdzID8/IFtdO1xuXHRcdGxvYWRBbGxTeXN0ZW1zKCk7XG5cdH0pXG5cblx0YXN5bmMgZnVuY3Rpb24gbG9hZEFsbFN5c3RlbXMoKXtcblx0XHRsZXQgcmVzcG9uc2UgPSBhd2FpdCBjb250ZXh0LkFQSS5nZXRBbGxTeXN0ZW1zKCk7XG5cdFx0Y29udGV4dC5hdmFpbGFibGVQcmV2aWV3cyA9IHJlc3BvbnNlLnJlc3BvbnNlO1xuXHRcdGF2YWlsU3lzdGVtcyA9IHJlc3BvbnNlLnJlc3BvbnNlO1xuXHR9XG5cblx0ZnVuY3Rpb24gdW5sb2FkUHJldmlldygpe1xuXHRcdGFjdGl2ZVByZXZpZXcgPSBudWxscHJldmlld1xuXHR9XG5cdGFzeW5jIGZ1bmN0aW9uIG9uU2VsZWN0U3lzdGVtKCBkICl7XG5cdFx0Y29uc3QgcHJlID0gYXZhaWxTeXN0ZW1zLmZpbmQoIHAgPT4gcC5jb2RlID09IGQpOyBcblxuXHRcdC8vIGlmIG5vIHByZXZpZXcuLi4gdGhlbiBuby4gb3IgaWYgdGhlIHByZXZpZXcgaXMgdGhlIHNhbWUgYXMgYmVmb3JlIGRlc2VsY3QgaXRcblx0XHRpZiAoIGFjdGl2ZVByZXZpZXcgPT0gcHJlIHx8ICFwcmUpe1xuXHRcdFx0YWN0aXZlUHJldmlldyA9IG51bGxwcmV2aWV3O1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIHNlbGVjdCBpdFxuXHRcdGFjdGl2ZVByZXZpZXcgPSBwcmU7XG5cblx0XHQvLyByZXF1ZXN0IHRoZSBmYWN0b3J5O1xuXHRcdGxldCByZXNwb25zZSA9IGF3YWl0IGNvbnRleHQuQVBJLmdldEZhY3RvcnkoIGFjdGl2ZVByZXZpZXcgKTtcblx0XHRmYWN0b3J5ID0gcmVzcG9uc2UucmVzcG9uc2U7XG5cdFx0XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvL0B0cy1pZ25vcmUgVGhpcyBpcyBmb3IgcmVuZGVyaW5nIHRoZSB1bmtub3duIHN0cm5pZ1xuXHRudWxscHJldmlldy5pc0VkaXRhYmxlID0gbnVsbDtcblxuPC9zY3JpcHQ+XG5cbjxkaXYgY2xhc3M9XCJNYWluQXBwQ29udGFpbmVyUGFnZSBNYWluQXBwQ29udGFpbmVyUGFnZVN5c3RlbVwiPlxuXHQgXG5cdDxzZWN0aW9uPlxuXHRcdDxkaXYgY2xhc3M9XCJ0YWJsZSBTeXN0ZW1QcmV2aWV3ZXJcIiBkYXRhLWlzLWVkaXQ9eyBmYWxzZSB9IHRyYW5zaXRpb246ZmFkZT5cblx0XHRcdDxkaXYgY2xhc3M9XCJ0YWJsZVJvd1wiPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwidGFibGVSb3dDb2x1bW5cIj5BdXRob3I8L2Rpdj4gXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJ0YWJsZVJvd0NvbHVtblwiID57YWN0aXZlUHJldmlldz8uYXV0aG9yID8/IHVua25vd25TdHJpbmd9PC9kaXY+XG5cdFx0XHQ8L2Rpdj5cblx0XHRcdDxkaXYgY2xhc3M9XCJ0YWJsZVJvd1wiPlxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwidGFibGVSb3dDb2x1bW5cIj5WZXJzaW9uPC9kaXY+IFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwidGFibGVSb3dDb2x1bW5cIiA+e2FjdGl2ZVByZXZpZXc/LnZlcnNpb24gPz8gdW5rbm93blN0cmluZ308L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdFx0PGRpdiBjbGFzcz1cInRhYmxlUm93XCI+XG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJ0YWJsZVJvd0NvbHVtblwiPlN5c3RlbUNvZGVOYW1lPC9kaXY+IFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwidGFibGVSb3dDb2x1bW5cIiA+e2FjdGl2ZVByZXZpZXc/LmNvZGUgPz8gdW5rbm93blN0cmluZ308L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdFx0PGRpdiBjbGFzcz1cInRhYmxlUm93XCI+XG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJ0YWJsZVJvd0NvbHVtblwiPmVkaXRhYmxlPC9kaXY+IFxuXHRcdFx0XHQ8ZGl2IGNsYXNzPVwidGFibGVSb3dDb2x1bW5cIiA+e2FjdGl2ZVByZXZpZXc/LmlzRWRpdGFibGUgPz8gdW5rbm93blN0cmluZ308L2Rpdj5cblx0XHRcdDwvZGl2PlxuXHRcdFx0PGRpdiBjbGFzcz1cInRhYmxlUm93XCI+XG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJ0YWJsZVJvd0NvbHVtblwiPlN5c3RlbU5hbWU8L2Rpdj4gXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJ0YWJsZVJvd0NvbHVtblwiID57YWN0aXZlUHJldmlldz8ubmFtZSA/PyB1bmtub3duU3RyaW5nfTwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0XHQ8ZGl2IGNsYXNzPVwidGFibGVSb3dcIj5cblx0XHRcdFx0PGRpdiBjbGFzcz1cInRhYmxlUm93Q29sdW1uXCI+Zm9sZGVyIG5hbWU8L2Rpdj4gXG5cdFx0XHRcdDxkaXYgY2xhc3M9XCJ0YWJsZVJvd0NvbHVtblwiID57YWN0aXZlUHJldmlldz8uZm9sZGVyTmFtZSA/PyB1bmtub3duU3RyaW5nfTwvZGl2PlxuXHRcdFx0PC9kaXY+XG5cdFx0PC9kaXY+XG5cblx0XHQ8YnI+XG5cdFx0PCEtLSBTeXN0ZW0gU2VsZWN0b3IgLS0+XG5cdFx0PGRpdiBjbGFzcz1cIlBhZ2VTeXN0ZW1MaXN0XCIgPlx0XG5cdFx0XHQ8RWRpdEFibGVMaXN0XG5cdFx0XHRcdGlzRWRpdGFibGVDb250YWluZXI9e2ZhbHNlfVxuXHRcdFx0XHRjb2xsZWN0aW9uPSB7IGF2YWlsU3lzdGVtcz8ubWFwKCBwID0+IHtyZXR1cm4geyBrZXkgOiBwLmNvZGUgLCB2YWx1ZSA6IHAubmFtZX19KSA/PyBbXSB9XG5cdFx0XHRcdG9uU2VsZWN0PXsgKGUpID0+IHtvblNlbGVjdFN5c3RlbShlKSA7IHJldHVybiB0cnVlOyB9IH0gXG5cdFx0XHRcdG9uOm9uRGVTZWxlY3Q9eyB1bmxvYWRQcmV2aWV3IH1cblx0XHRcdC8+IFxuXHRcdDwvZGl2PiBcblxuXG5cdFx0XG5cdDwvc2VjdGlvbj5cblxuXHR7I2lmIGZhY3RvcnkgfVxuXHRcdDxzZWN0aW9uIHRyYW5zaXRpb246c2xpZGUgPlxuXHRcdFx0PGRpdj5cblx0XHRcdFx0PFN5c3RlbURlc2lnbmVyM1BhcnRzIFxuXHRcdFx0XHRcdHN5c3RlbT17IGZhY3RvcnkgfVxuXHRcdFx0XHQvPlxuXHRcdFx0PC9kaXY+XG5cdFx0PC9zZWN0aW9uPlxuXHR7L2lmfVxuPC9kaXY+IiwiPHNjcmlwdCBsYW5nPVwidHNcIj5cbiAgICBpbXBvcnQgeyBjcmVhdGVFdmVudERpc3BhdGNoZXIgfSBmcm9tIFwic3ZlbHRlXCI7XG5cblx0ZXhwb3J0IGxldCBzcGVjaWFsXHQ9IGZhbHNlO1xuXHRleHBvcnQgbGV0IHRleHQgIFx0PSBcIkJhc2ljIGluZm9ybWF0aW9uIGFuZCBzZXR0aW5nc1wiO1xuXHRleHBvcnQgbGV0IHRpdGxlIFx0PSBcIkhvbWVcIjtcblxuXHRsZXQgYWN0aXZlO1xuXHRleHBvcnQgZnVuY3Rpb24gc2V0QWN0aXZlKCB0byA6IGJvb2xlYW4pe1xuXHRcdGFjdGl2ZSA9IHRvO1xuXHR9XG5cdGxldCBkaXNwYXRjaCA9IGNyZWF0ZUV2ZW50RGlzcGF0Y2hlcigpO1xuXHRcblx0ZnVuY3Rpb24gb25DbGljaygpeyBcblx0XHRkaXNwYXRjaCgnY2xpY2snKVxuXHR9XG48L3NjcmlwdD5cbjxkaXYgY2xhc3M9eyBzcGVjaWFsID8gXCJNZW51U0J0blwiIDogXCJNZW51QnRuXCJ9IG9uOmNsaWNrPXtvbkNsaWNrfSBvbjprZXlwcmVzcyBkYXRhLWFjdGl2ZT17YWN0aXZlfSA+XG5cdDxkaXYgY2xhc3M9XCJNZW51QnRuSWNvblwiPlxuXHRcdFgyXG5cdDwvZGl2PlxuXHQ8ZGl2IGNsYXNzPVwiTWVudUJ0blRleHRcIj5cblx0XHQ8IS0taDQ+e3RpdGxlfTwvaDQtLT5cblx0XHQ8cD57dGl0bGV9PC9wPlxuXHQ8L2Rpdj5cbjwvZGl2PiIsIjxzY3JpcHQgbGFuZz1cInRzXCI+XG4gICAgaW1wb3J0IHsgY3JlYXRlRXZlbnREaXNwYXRjaGVyLCBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xuICAgIGltcG9ydCBNZW51QnRuIGZyb20gXCIuL01lbnVCdG4uc3ZlbHRlXCI7XG4gICAgaW1wb3J0IHsgb24gfSBmcm9tIFwiZXZlbnRzXCI7XG5cblx0ZXhwb3J0IGxldCByZWd1bGFyT3B0aW9ucyA6IHN0cmluZ1tdID0gW11cblx0ZXhwb3J0IGxldCBzcGVjaWFsT3B0aW9ucyA6IHN0cmluZ1tdID0gW107XG5cdGV4cG9ydCBsZXQgc3RhcnRDaG9zZW4gOiBzdHJpbmcgPSBcIlwiO1xuXHQkOiBvcHRpb25zID0gcmVndWxhck9wdGlvbnMuY29uY2F0KC4uLnNwZWNpYWxPcHRpb25zKTtcblx0bGV0IGRpc3BhdGNoID0gY3JlYXRlRXZlbnREaXNwYXRjaGVyKCk7XG5cdFxuXHRcblx0bGV0IGJ0bkFyciA6IE1lbnVCdG5bXSA9IFtdO1xuXHRsZXQgY2hvc2VuIDogTWVudUJ0biB8IG51bGwgPSBudWxsO1xuXHRmdW5jdGlvbiBvbkJ0bkNsaWNrKCBpICl7XG5cdFx0Y29uc3QgYnRuID0gYnRuQXJyW2ldO1xuXHRcdGlmKGJ0biA9PSBjaG9zZW4pe1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmKGNob3Nlbilcblx0XHRcdGNob3Nlbi5zZXRBY3RpdmUoZmFsc2UpXG5cblx0XHRidG4uc2V0QWN0aXZlKHRydWUpO1xuXHRcdGNob3NlbiA9IGJ0bjtcblx0XHRkaXNwYXRjaCgnY2hhbmdlUGFnZScsIG9wdGlvbnNbaV0pO1xuXHR9XG4gXG5cdG9uTW91bnQoKCk9Pntcblx0XHRsZXQgaSA9IG9wdGlvbnMuZmluZEluZGV4KCBwID0+IHAgPT0gc3RhcnRDaG9zZW4gKTtcblx0XHRpZihpICE9IC0xKXtcblx0XHRcdG9uQnRuQ2xpY2soaSk7XG5cdFx0fVxuXHR9KVxuPC9zY3JpcHQ+XG48ZGl2IGNsYXNzPVwiTWVudVwiID5cblx0PGRpdiBjbGFzcz1cIk1lbnVUaXRsZVwiID5cblx0XHQ8cD5UVFAtUlBHIFN5c3RlbSBEZXNpZ25lcjwvcD5cblx0XHQ8ZGl2IGNsYXNzPVwiY29sb3JzY2hlbWVcIj5cblx0XHRcdDxkaXY+PC9kaXY+XG5cdFx0XHQ8ZGl2PjwvZGl2PlxuXHRcdFx0PGRpdj48L2Rpdj5cblx0XHRcdDxkaXY+PC9kaXY+XG5cdFx0XHQ8ZGl2PjwvZGl2PlxuXHRcdDwvZGl2PlxuXHQ8L2Rpdj5cblx0PHNlY3Rpb24gY2xhc3M9XCJNZW51QnRuQ29udGFpbmVyXCIgPlxuXHRcdHsjZWFjaCBvcHRpb25zIGFzIG9wdCxpIH1cblx0XHRcdDxNZW51QnRuIFxuXHRcdFx0XHRzcGVjaWFsPXtzcGVjaWFsT3B0aW9ucy5pbmNsdWRlcyhvcHQpfVxuXHRcdFx0XHR0aXRsZT17b3B0fVxuXHRcdFx0XHRiaW5kOnRoaXM9e2J0bkFycltpXX1cblx0XHRcdFx0b246Y2xpY2s9eygpID0+IG9uQnRuQ2xpY2soaSl9XG5cdFx0XHQvPlx0XG5cdFx0ey9lYWNofVxuXHQ8L3NlY3Rpb24+XG48L2Rpdj4iLCJcbmltcG9ydCB7IGN1YmljT3V0ICwgXHRlbGFzdGljSW5PdXR9IGZyb20gJ3N2ZWx0ZS9lYXNpbmcnO1xuIFxuXG5leHBvcnQgZnVuY3Rpb24gc2xpZGVmYWRlKG5vZGUsIHBhcmFtcykge1xuXHRjb25zdCBleGlzdGluZ1RyYW5zZm9ybSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSkudHJhbnNmb3JtLnJlcGxhY2UoJ25vbmUnLCAnJyk7XG5cblx0cmV0dXJuIHtcblx0XHRkZWxheTogcGFyYW1zLmRlbGF5IHx8IDAsXG5cdFx0ZHVyYXRpb246IHBhcmFtcy5kdXJhdGlvbiB8fCA0MDAsXG5cdFx0ZWFzaW5nOiBwYXJhbXMuZWFzaW5nIHx8IGN1YmljT3V0LFxuXHRcdGNzczogKHQsIHUpID0+IGB0cmFuc2Zvcm0tb3JpZ2luOiB0b3AgbGVmdDsgdHJhbnNmb3JtOiAke2V4aXN0aW5nVHJhbnNmb3JtfSBzY2FsZVkoJHt0fSk7IG9wYWNpdHk6ICR7dH07YFxuXHR9O1xufSIsIjxzY3JpcHQgbGFuZz1cInRzXCI+IFxuXHRpbXBvcnQgeyBmbHksIHNsaWRlIH0gZnJvbSAnc3ZlbHRlL3RyYW5zaXRpb24nO1xuICAgIGltcG9ydCAnLi9EZXNpZ25lci5zY3NzJyAgXG4gICAgaW1wb3J0IEhvbWVQYWdlIGZyb20gJy4vVmlld3MvUGFnZS9Ib21lUGFnZS5zdmVsdGUnO1xuICAgIGltcG9ydCBTeXN0ZW1QYWdlIGZyb20gJy4vVmlld3MvUGFnZS9TeXN0ZW1QYWdlLnN2ZWx0ZSc7XG4gICAgaW1wb3J0IHsgd3JpdGFibGUgfSBmcm9tICdzdmVsdGUvc3RvcmUnO1xuXHRpbXBvcnQgTWVudSBmcm9tICcuL1ZpZXdzL01lbnUvTWVudS5zdmVsdGUnO1xuICAgIGltcG9ydCB7IExheW91dDAxQ29udGV4dCB9IGZyb20gJy4vY29udGV4dCc7XG5cdGltcG9ydCB7c2xpZGVmYWRlfSBmcm9tICcuLi8uLi8uLi8uLi8uLi9zcmMvTW9kdWxlcy91aS9Db21wb25lbnRzL1RyYW5zaXRpb25zL1NsaWRlRmx5LmpzJztcblxuXHRsZXQgcGFnZSA9IHdyaXRhYmxlKCAnc3lzdGVtJyk7XG5cdGV4cG9ydCBsZXQgY29udGV4dFx0OiBMYXlvdXQwMUNvbnRleHQ7IFxuXHRcblx0ZnVuY3Rpb24gY2hhbmdlUGFnZSggZXZlbnQgKXtcblx0XHRwYWdlLnNldChldmVudC5kZXRhaWwpOyAgXG5cdH1cblxuIDwvc2NyaXB0PlxuPGRpdiBjbGFzcz1cIk1haW5BcHBDb250YWluZXJcIiA+XG5cdFxuXHQ8IS0tIE1lbnUgLS0+XG5cdDxNZW51IFxuXHRcdHJlZ3VsYXJPcHRpb25zPXtbJ2hvbWUnLCdzeXN0ZW0nLCdkYXRhIHRhYmxlcycsJ2V4cG9ydCcsJ2ltcG9ydCddfVxuXHRcdG9uOmNoYW5nZVBhZ2U9e2NoYW5nZVBhZ2V9XG5cdFx0c3RhcnRDaG9zZW49eyRwYWdlfVx0XG5cdC8+XG5cdFxuXHQ8c2VjdGlvbiBjbGFzcz1cIk1haW5BcHBDb250YWluZXJQYWdlc1wiPlxuXHRcdHsjaWYgXHRcdCRwYWdlID09ICdob21lJ31cblx0XHRcdDxkaXYgaW46c2xpZGVmYWRlPXt7eDoxMDB9fSBvdXQ6c2xpZGVmYWRlPXt7eDotMTAwfX0gPlxuXHRcdFx0XHQ8IS0tSG9tZVBhZ2UgLy0tPlxuXHRcdFx0PC9kaXY+XG5cdFx0ezplbHNlIGlmXHQkcGFnZSA9PSAnc3lzdGVtJ31cblx0XHRcdDxkaXYgaW46c2xpZGVmYWRlPXt7eDoxMDB9fSBvdXQ6c2xpZGVmYWRlPXt7eDotMTAwfX0gPlxuXHRcdFx0XHQ8U3lzdGVtUGFnZVxuXHRcdFx0XHRcdGNvbnRleHQgPSB7Y29udGV4dH1cblx0XHRcdFx0Lz5cblx0XHRcdDwvZGl2PlxuXHRcdHs6ZWxzZSBpZlx0JHBhZ2UgPT0gJ2hvbWUxJ31cblx0XHRcdDxwPjE8L3A+XG5cdFx0ezplbHNlIGlmXHQkcGFnZSA9PSAnaG9tZTInfVxuXHRcdFx0PHA+MTwvcD5cblx0XHR7OmVsc2UgaWZcdCRwYWdlID09ICdob21lMyd9XG5cdFx0XHQ8cD4xPC9wPlxuXHRcdHsvaWZ9XG5cdDwvc2VjdGlvbj5cbjwvZGl2PlxuICIsImV4cG9ydCB2YXIgRV9USU1FT1VUID0gbmV3IEVycm9yKCd0aW1lb3V0IHdoaWxlIHdhaXRpbmcgZm9yIG11dGV4IHRvIGJlY29tZSBhdmFpbGFibGUnKTtcbmV4cG9ydCB2YXIgRV9BTFJFQURZX0xPQ0tFRCA9IG5ldyBFcnJvcignbXV0ZXggYWxyZWFkeSBsb2NrZWQnKTtcbmV4cG9ydCB2YXIgRV9DQU5DRUxFRCA9IG5ldyBFcnJvcigncmVxdWVzdCBmb3IgbG9jayBjYW5jZWxlZCcpO1xuIiwiaW1wb3J0IHsgX19hd2FpdGVyLCBfX2dlbmVyYXRvciB9IGZyb20gXCJ0c2xpYlwiO1xuaW1wb3J0IHsgRV9DQU5DRUxFRCB9IGZyb20gJy4vZXJyb3JzJztcbnZhciBTZW1hcGhvcmUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU2VtYXBob3JlKF92YWx1ZSwgX2NhbmNlbEVycm9yKSB7XG4gICAgICAgIGlmIChfY2FuY2VsRXJyb3IgPT09IHZvaWQgMCkgeyBfY2FuY2VsRXJyb3IgPSBFX0NBTkNFTEVEOyB9XG4gICAgICAgIHRoaXMuX3ZhbHVlID0gX3ZhbHVlO1xuICAgICAgICB0aGlzLl9jYW5jZWxFcnJvciA9IF9jYW5jZWxFcnJvcjtcbiAgICAgICAgdGhpcy5fcXVldWUgPSBbXTtcbiAgICAgICAgdGhpcy5fd2VpZ2h0ZWRXYWl0ZXJzID0gW107XG4gICAgfVxuICAgIFNlbWFwaG9yZS5wcm90b3R5cGUuYWNxdWlyZSA9IGZ1bmN0aW9uICh3ZWlnaHQsIHByaW9yaXR5KSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGlmICh3ZWlnaHQgPT09IHZvaWQgMCkgeyB3ZWlnaHQgPSAxOyB9XG4gICAgICAgIGlmIChwcmlvcml0eSA9PT0gdm9pZCAwKSB7IHByaW9yaXR5ID0gMDsgfVxuICAgICAgICBpZiAod2VpZ2h0IDw9IDApXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIHdlaWdodCBcIi5jb25jYXQod2VpZ2h0LCBcIjogbXVzdCBiZSBwb3NpdGl2ZVwiKSk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICB2YXIgdGFzayA9IHsgcmVzb2x2ZTogcmVzb2x2ZSwgcmVqZWN0OiByZWplY3QsIHdlaWdodDogd2VpZ2h0LCBwcmlvcml0eTogcHJpb3JpdHkgfTtcbiAgICAgICAgICAgIHZhciBpID0gZmluZEluZGV4RnJvbUVuZChfdGhpcy5fcXVldWUsIGZ1bmN0aW9uIChvdGhlcikgeyByZXR1cm4gcHJpb3JpdHkgPD0gb3RoZXIucHJpb3JpdHk7IH0pO1xuICAgICAgICAgICAgaWYgKGkgPT09IC0xICYmIHdlaWdodCA8PSBfdGhpcy5fdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAvLyBOZWVkcyBpbW1lZGlhdGUgZGlzcGF0Y2gsIHNraXAgdGhlIHF1ZXVlXG4gICAgICAgICAgICAgICAgX3RoaXMuX2Rpc3BhdGNoSXRlbSh0YXNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIF90aGlzLl9xdWV1ZS5zcGxpY2UoaSArIDEsIDAsIHRhc2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuICAgIFNlbWFwaG9yZS5wcm90b3R5cGUucnVuRXhjbHVzaXZlID0gZnVuY3Rpb24gKGNhbGxiYWNrXzEpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCBhcmd1bWVudHMsIHZvaWQgMCwgZnVuY3Rpb24gKGNhbGxiYWNrLCB3ZWlnaHQsIHByaW9yaXR5KSB7XG4gICAgICAgICAgICB2YXIgX2EsIHZhbHVlLCByZWxlYXNlO1xuICAgICAgICAgICAgaWYgKHdlaWdodCA9PT0gdm9pZCAwKSB7IHdlaWdodCA9IDE7IH1cbiAgICAgICAgICAgIGlmIChwcmlvcml0eSA9PT0gdm9pZCAwKSB7IHByaW9yaXR5ID0gMDsgfVxuICAgICAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYikge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoX2IubGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAwOiByZXR1cm4gWzQgLyp5aWVsZCovLCB0aGlzLmFjcXVpcmUod2VpZ2h0LCBwcmlvcml0eSldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICBfYSA9IF9iLnNlbnQoKSwgdmFsdWUgPSBfYVswXSwgcmVsZWFzZSA9IF9hWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgX2IubGFiZWwgPSAyO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICBfYi50cnlzLnB1c2goWzIsICwgNCwgNV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgY2FsbGJhY2sodmFsdWUpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOiByZXR1cm4gWzIgLypyZXR1cm4qLywgX2Iuc2VudCgpXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsZWFzZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs3IC8qZW5kZmluYWxseSovXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSA1OiByZXR1cm4gWzIgLypyZXR1cm4qL107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgU2VtYXBob3JlLnByb3RvdHlwZS53YWl0Rm9yVW5sb2NrID0gZnVuY3Rpb24gKHdlaWdodCwgcHJpb3JpdHkpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgaWYgKHdlaWdodCA9PT0gdm9pZCAwKSB7IHdlaWdodCA9IDE7IH1cbiAgICAgICAgaWYgKHByaW9yaXR5ID09PSB2b2lkIDApIHsgcHJpb3JpdHkgPSAwOyB9XG4gICAgICAgIGlmICh3ZWlnaHQgPD0gMClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgd2VpZ2h0IFwiLmNvbmNhdCh3ZWlnaHQsIFwiOiBtdXN0IGJlIHBvc2l0aXZlXCIpKTtcbiAgICAgICAgaWYgKHRoaXMuX2NvdWxkTG9ja0ltbWVkaWF0ZWx5KHdlaWdodCwgcHJpb3JpdHkpKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIV90aGlzLl93ZWlnaHRlZFdhaXRlcnNbd2VpZ2h0IC0gMV0pXG4gICAgICAgICAgICAgICAgICAgIF90aGlzLl93ZWlnaHRlZFdhaXRlcnNbd2VpZ2h0IC0gMV0gPSBbXTtcbiAgICAgICAgICAgICAgICBpbnNlcnRTb3J0ZWQoX3RoaXMuX3dlaWdodGVkV2FpdGVyc1t3ZWlnaHQgLSAxXSwgeyByZXNvbHZlOiByZXNvbHZlLCBwcmlvcml0eTogcHJpb3JpdHkgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgU2VtYXBob3JlLnByb3RvdHlwZS5pc0xvY2tlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlIDw9IDA7XG4gICAgfTtcbiAgICBTZW1hcGhvcmUucHJvdG90eXBlLmdldFZhbHVlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XG4gICAgfTtcbiAgICBTZW1hcGhvcmUucHJvdG90eXBlLnNldFZhbHVlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsdWU7XG4gICAgICAgIHRoaXMuX2Rpc3BhdGNoUXVldWUoKTtcbiAgICB9O1xuICAgIFNlbWFwaG9yZS5wcm90b3R5cGUucmVsZWFzZSA9IGZ1bmN0aW9uICh3ZWlnaHQpIHtcbiAgICAgICAgaWYgKHdlaWdodCA9PT0gdm9pZCAwKSB7IHdlaWdodCA9IDE7IH1cbiAgICAgICAgaWYgKHdlaWdodCA8PSAwKVxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCB3ZWlnaHQgXCIuY29uY2F0KHdlaWdodCwgXCI6IG11c3QgYmUgcG9zaXRpdmVcIikpO1xuICAgICAgICB0aGlzLl92YWx1ZSArPSB3ZWlnaHQ7XG4gICAgICAgIHRoaXMuX2Rpc3BhdGNoUXVldWUoKTtcbiAgICB9O1xuICAgIFNlbWFwaG9yZS5wcm90b3R5cGUuY2FuY2VsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB0aGlzLl9xdWV1ZS5mb3JFYWNoKGZ1bmN0aW9uIChlbnRyeSkgeyByZXR1cm4gZW50cnkucmVqZWN0KF90aGlzLl9jYW5jZWxFcnJvcik7IH0pO1xuICAgICAgICB0aGlzLl9xdWV1ZSA9IFtdO1xuICAgIH07XG4gICAgU2VtYXBob3JlLnByb3RvdHlwZS5fZGlzcGF0Y2hRdWV1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fZHJhaW5VbmxvY2tXYWl0ZXJzKCk7XG4gICAgICAgIHdoaWxlICh0aGlzLl9xdWV1ZS5sZW5ndGggPiAwICYmIHRoaXMuX3F1ZXVlWzBdLndlaWdodCA8PSB0aGlzLl92YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5fZGlzcGF0Y2hJdGVtKHRoaXMuX3F1ZXVlLnNoaWZ0KCkpO1xuICAgICAgICAgICAgdGhpcy5fZHJhaW5VbmxvY2tXYWl0ZXJzKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFNlbWFwaG9yZS5wcm90b3R5cGUuX2Rpc3BhdGNoSXRlbSA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIHZhciBwcmV2aW91c1ZhbHVlID0gdGhpcy5fdmFsdWU7XG4gICAgICAgIHRoaXMuX3ZhbHVlIC09IGl0ZW0ud2VpZ2h0O1xuICAgICAgICBpdGVtLnJlc29sdmUoW3ByZXZpb3VzVmFsdWUsIHRoaXMuX25ld1JlbGVhc2VyKGl0ZW0ud2VpZ2h0KV0pO1xuICAgIH07XG4gICAgU2VtYXBob3JlLnByb3RvdHlwZS5fbmV3UmVsZWFzZXIgPSBmdW5jdGlvbiAod2VpZ2h0KSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHZhciBjYWxsZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChjYWxsZWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIF90aGlzLnJlbGVhc2Uod2VpZ2h0KTtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIFNlbWFwaG9yZS5wcm90b3R5cGUuX2RyYWluVW5sb2NrV2FpdGVycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3F1ZXVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgZm9yICh2YXIgd2VpZ2h0ID0gdGhpcy5fdmFsdWU7IHdlaWdodCA+IDA7IHdlaWdodC0tKSB7XG4gICAgICAgICAgICAgICAgdmFyIHdhaXRlcnMgPSB0aGlzLl93ZWlnaHRlZFdhaXRlcnNbd2VpZ2h0IC0gMV07XG4gICAgICAgICAgICAgICAgaWYgKCF3YWl0ZXJzKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB3YWl0ZXJzLmZvckVhY2goZnVuY3Rpb24gKHdhaXRlcikgeyByZXR1cm4gd2FpdGVyLnJlc29sdmUoKTsgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fd2VpZ2h0ZWRXYWl0ZXJzW3dlaWdodCAtIDFdID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgcXVldWVkUHJpb3JpdHlfMSA9IHRoaXMuX3F1ZXVlWzBdLnByaW9yaXR5O1xuICAgICAgICAgICAgZm9yICh2YXIgd2VpZ2h0ID0gdGhpcy5fdmFsdWU7IHdlaWdodCA+IDA7IHdlaWdodC0tKSB7XG4gICAgICAgICAgICAgICAgdmFyIHdhaXRlcnMgPSB0aGlzLl93ZWlnaHRlZFdhaXRlcnNbd2VpZ2h0IC0gMV07XG4gICAgICAgICAgICAgICAgaWYgKCF3YWl0ZXJzKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB2YXIgaSA9IHdhaXRlcnMuZmluZEluZGV4KGZ1bmN0aW9uICh3YWl0ZXIpIHsgcmV0dXJuIHdhaXRlci5wcmlvcml0eSA8PSBxdWV1ZWRQcmlvcml0eV8xOyB9KTtcbiAgICAgICAgICAgICAgICAoaSA9PT0gLTEgPyB3YWl0ZXJzIDogd2FpdGVycy5zcGxpY2UoMCwgaSkpXG4gICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKChmdW5jdGlvbiAod2FpdGVyKSB7IHJldHVybiB3YWl0ZXIucmVzb2x2ZSgpOyB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFNlbWFwaG9yZS5wcm90b3R5cGUuX2NvdWxkTG9ja0ltbWVkaWF0ZWx5ID0gZnVuY3Rpb24gKHdlaWdodCwgcHJpb3JpdHkpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9xdWV1ZS5sZW5ndGggPT09IDAgfHwgdGhpcy5fcXVldWVbMF0ucHJpb3JpdHkgPCBwcmlvcml0eSkgJiZcbiAgICAgICAgICAgIHdlaWdodCA8PSB0aGlzLl92YWx1ZTtcbiAgICB9O1xuICAgIHJldHVybiBTZW1hcGhvcmU7XG59KCkpO1xuZnVuY3Rpb24gaW5zZXJ0U29ydGVkKGEsIHYpIHtcbiAgICB2YXIgaSA9IGZpbmRJbmRleEZyb21FbmQoYSwgZnVuY3Rpb24gKG90aGVyKSB7IHJldHVybiB2LnByaW9yaXR5IDw9IG90aGVyLnByaW9yaXR5OyB9KTtcbiAgICBhLnNwbGljZShpICsgMSwgMCwgdik7XG59XG5mdW5jdGlvbiBmaW5kSW5kZXhGcm9tRW5kKGEsIHByZWRpY2F0ZSkge1xuICAgIGZvciAodmFyIGkgPSBhLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGlmIChwcmVkaWNhdGUoYVtpXSkpIHtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMTtcbn1cbmV4cG9ydCBkZWZhdWx0IFNlbWFwaG9yZTtcbiIsImltcG9ydCB7IF9fYXdhaXRlciwgX19nZW5lcmF0b3IgfSBmcm9tIFwidHNsaWJcIjtcbmltcG9ydCBTZW1hcGhvcmUgZnJvbSAnLi9TZW1hcGhvcmUnO1xudmFyIE11dGV4ID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIE11dGV4KGNhbmNlbEVycm9yKSB7XG4gICAgICAgIHRoaXMuX3NlbWFwaG9yZSA9IG5ldyBTZW1hcGhvcmUoMSwgY2FuY2VsRXJyb3IpO1xuICAgIH1cbiAgICBNdXRleC5wcm90b3R5cGUuYWNxdWlyZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCBhcmd1bWVudHMsIHZvaWQgMCwgZnVuY3Rpb24gKHByaW9yaXR5KSB7XG4gICAgICAgICAgICB2YXIgX2EsIHJlbGVhc2VyO1xuICAgICAgICAgICAgaWYgKHByaW9yaXR5ID09PSB2b2lkIDApIHsgcHJpb3JpdHkgPSAwOyB9XG4gICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9iKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChfYi5sYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDA6IHJldHVybiBbNCAvKnlpZWxkKi8sIHRoaXMuX3NlbWFwaG9yZS5hY3F1aXJlKDEsIHByaW9yaXR5KV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hID0gX2Iuc2VudCgpLCByZWxlYXNlciA9IF9hWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFsyIC8qcmV0dXJuKi8sIHJlbGVhc2VyXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBNdXRleC5wcm90b3R5cGUucnVuRXhjbHVzaXZlID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBwcmlvcml0eSkge1xuICAgICAgICBpZiAocHJpb3JpdHkgPT09IHZvaWQgMCkgeyBwcmlvcml0eSA9IDA7IH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbWFwaG9yZS5ydW5FeGNsdXNpdmUoZnVuY3Rpb24gKCkgeyByZXR1cm4gY2FsbGJhY2soKTsgfSwgMSwgcHJpb3JpdHkpO1xuICAgIH07XG4gICAgTXV0ZXgucHJvdG90eXBlLmlzTG9ja2VkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2VtYXBob3JlLmlzTG9ja2VkKCk7XG4gICAgfTtcbiAgICBNdXRleC5wcm90b3R5cGUud2FpdEZvclVubG9jayA9IGZ1bmN0aW9uIChwcmlvcml0eSkge1xuICAgICAgICBpZiAocHJpb3JpdHkgPT09IHZvaWQgMCkgeyBwcmlvcml0eSA9IDA7IH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbWFwaG9yZS53YWl0Rm9yVW5sb2NrKDEsIHByaW9yaXR5KTtcbiAgICB9O1xuICAgIE11dGV4LnByb3RvdHlwZS5yZWxlYXNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5fc2VtYXBob3JlLmlzTG9ja2VkKCkpXG4gICAgICAgICAgICB0aGlzLl9zZW1hcGhvcmUucmVsZWFzZSgpO1xuICAgIH07XG4gICAgTXV0ZXgucHJvdG90eXBlLmNhbmNlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbWFwaG9yZS5jYW5jZWwoKTtcbiAgICB9O1xuICAgIHJldHVybiBNdXRleDtcbn0oKSk7XG5leHBvcnQgZGVmYXVsdCBNdXRleDtcbiIsImltcG9ydCBQbHVnaW5IYW5kbGVyIGZyb20gXCIuLi91aS1vYnNpZGlhbi9hcHBcIjtcblxuZXhwb3J0IGNsYXNzIEZpbGVIYW5kbGVye1xuXG5cdHByaXZhdGUgc3RhdGljIF9pbnN0YW5jZSA6IEZpbGVIYW5kbGVyOyAgXG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcigpe1xuXHRcdGlmKEZpbGVIYW5kbGVyLl9pbnN0YW5jZSA9PSBudWxsICl7XG5cdFx0XHRGaWxlSGFuZGxlci5faW5zdGFuY2UgID0gbmV3IEZpbGVIYW5kbGVyKCk7IFxuXHRcdH1cblx0XHRyZXR1cm4gRmlsZUhhbmRsZXIuX2luc3RhbmNlO1xuXHR9XG5cblxuXHQvLyBGb2xkZXIgSGFuZGxpbmdcblx0cHVibGljIHN0YXRpYyBhc3luYyBta2RpciAoIHBhdGggKXtcblx0XHRyZXR1cm4gYXdhaXQgUGx1Z2luSGFuZGxlci5BcHAudmF1bHQuYWRhcHRlci5ta2RpciggcGF0aCApO1xuXHR9XG5cdHB1YmxpYyBzdGF0aWMgYXN5bmMgcm1kaXIocGF0aDpzdHJpbmcpeyBcblx0XHRyZXR1cm4gYXdhaXQgUGx1Z2luSGFuZGxlci5BcHAudmF1bHQuYWRhcHRlci5ybWRpcihwYXRoLHRydWUpO1xuXHR9XG5cblxuXHQvLyBQYXRoIGNvbW1hbmRzXG5cdHB1YmxpYyBzdGF0aWMgYXN5bmMgbHNkaXIoIHBhdGggOiBzdHJpbmcgKXtcblx0XHRyZXR1cm4gYXdhaXQgUGx1Z2luSGFuZGxlci5BcHAudmF1bHQuYWRhcHRlci5saXN0KHBhdGgpO1xuXHR9XG5cdHB1YmxpYyBzdGF0aWMgYXN5bmMgZXhpc3RzKCBwYXRoIDogc3RyaW5nICkgOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRyZXR1cm4gYXdhaXQgUGx1Z2luSGFuZGxlci5BcHAudmF1bHQuYWRhcHRlci5leGlzdHMoIHBhdGggLCBmYWxzZSApO1xuXHR9XG5cblxuXHQvLyBGaWxlIENvbW1hbmRzIFxuXHRwdWJsaWMgc3RhdGljIGFzeW5jIHNhdmVGaWxlKCBwYXRoIDogc3RyaW5nICwgZmlsZUNvbnRlbnQ6c3RyaW5nICl7IFxuXHRcdHJldHVybiBhd2FpdCBQbHVnaW5IYW5kbGVyLkFwcC52YXVsdC5hZGFwdGVyLndyaXRlKHBhdGgsZmlsZUNvbnRlbnQpO1xuXHR9XHRcblx0cHVibGljIHN0YXRpYyBhc3luYyByZWFkRmlsZShwYXRoOnN0cmluZyl7IFxuXHRcdHJldHVybiBhd2FpdCBQbHVnaW5IYW5kbGVyLkFwcC52YXVsdC5hZGFwdGVyLnJlYWQocGF0aCk7XG5cdH1cbiBcblx0cHVibGljIHN0YXRpYyBhc3luYyBybShwYXRoOnN0cmluZyl7IFxuXHRcdHJldHVybiBhd2FpdCBQbHVnaW5IYW5kbGVyLkFwcC52YXVsdC5hZGFwdGVyLnJlbW92ZShwYXRoKTtcblx0fVxuXG5cdHB1YmxpYyBzdGF0aWMgYXN5bmMgY29weShwYXRoOnN0cmluZywgbmV3UGF0aDpzdHJpbmcgKXsgXG5cdFx0cmV0dXJuIGF3YWl0IFBsdWdpbkhhbmRsZXIuQXBwLnZhdWx0LmFkYXB0ZXIuY29weShwYXRoLG5ld1BhdGgpO1xuXHR9XG5cbn1cbiIsImltcG9ydCB7IEpzb25BcnJheVN0cmluZywgSnNvbkJvb2xlYW4sIEpzb25Qcm9wZXJ0eSwgSnNvblN0cmluZyB9IGZyb20gXCJncm9iYXgtanNvbi1oYW5kbGVyXCI7IFxuaW1wb3J0IHsgRmlsZUhhbmRsZXIgfSBmcm9tIFwiLi4vZmlsZUhhbmRsZXJcIjtcbmltcG9ydCB7IGtleU1hbmFnZXJJbnN0YW5jZSB9IGZyb20gXCJ0dHJwZy1zeXN0ZW0tZ3JhcGhcIjtcbmltcG9ydCBQbHVnaW5IYW5kbGVyIGZyb20gXCIuLi8uLi8uLi8uLi9zcmMvTW9kdWxlcy91aS1vYnNpZGlhbi9hcHBcIjtcbmltcG9ydCB7IEJBU0VfU0NIRU1FIH0gZnJvbSBcImdyb2JheC1qc29uLWhhbmRsZXJcIjtcbiBcbmV4cG9ydCBjbGFzcyBVSUxheW91dE1vZGVsU2NoZW1lc3sgXG5cdHN0YXRpYyBCQVNFIFx0PSBCQVNFX1NDSEVNRSA7XG5cdHN0YXRpYyBQQUdFIFx0PSdQQUdFJzsgXG59XG5leHBvcnQgY2xhc3MgVUlMYXlvdXRNb2RlbCB7XG5cblx0cHVibGljIGlkIDogc3RyaW5nID0ga2V5TWFuYWdlckluc3RhbmNlLmdldE5ld0tleSgpO1xuXG5cdEBKc29uU3RyaW5nKHtzY2hlbWU6W1VJTGF5b3V0TW9kZWxTY2hlbWVzLkJBU0UsVUlMYXlvdXRNb2RlbFNjaGVtZXMuUEFHRV19KVxuXHRndWlkXHQ6c3RyaW5nID0gUGx1Z2luSGFuZGxlci51dWlkdjQoKTtcblxuXHRASnNvblN0cmluZyh7c2NoZW1lOltVSUxheW91dE1vZGVsU2NoZW1lcy5CQVNFXX0pXG5cdGF1dGhvclx0OnN0cmluZztcblx0XG5cdEBKc29uU3RyaW5nKHtzY2hlbWU6W1VJTGF5b3V0TW9kZWxTY2hlbWVzLkJBU0VdfSlcblx0dmVyc2lvbjpzdHJpbmc7XG5cblx0QEpzb25TdHJpbmcoe3NjaGVtZTpbVUlMYXlvdXRNb2RlbFNjaGVtZXMuQkFTRSxVSUxheW91dE1vZGVsU2NoZW1lcy5QQUdFXX0pXG5cdG5hbWVcdDpzdHJpbmc7XG5cdFxuXHRASnNvblN0cmluZyh7c2NoZW1lOltVSUxheW91dE1vZGVsU2NoZW1lcy5CQVNFXX0pXG5cdG1haW5TdHlsZSA6IHN0cmluZztcblx0XG5cdEBKc29uU3RyaW5nKHtzY2hlbWU6W1VJTGF5b3V0TW9kZWxTY2hlbWVzLkJBU0VdfSlcblx0Y29tcG9uZW50SnNcdDogc3RyaW5nO1xuXG5cdEBKc29uU3RyaW5nKHtzY2hlbWU6W1VJTGF5b3V0TW9kZWxTY2hlbWVzLkJBU0VdfSlcblx0Zm9sZGVyU3JjOlN0cmluZztcblx0dmFsaWQgOiBib29sZWFuID0gdHJ1ZTtcblx0ZXJyb3JzIDogc3RyaW5nW10gPSBbXTtcblx0XG5cdHB1YmxpYyBhc3luYyBpc1ZhbGlkKCAgKXtcblx0XHRsZXQgZXJyb3JzIDogc3RyaW5nIFtdID1bXTtcblx0XHRcblx0XHRpZiAoIXRoaXMuZm9sZGVyU3JjKXtcblx0XHRcdGVycm9ycy5wdXNoKGBVSUxheW91dE1vZGVsIGZvciAke3RoaXMubmFtZX0gYnkgJHt0aGlzLmF1dGhvcn0sIGRpZCBub3QgaGF2ZSBhIGZvbGRlclNyY2ApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxldCB2YWxpZCA9IHRydWU7XG5cblx0XHQvLyBzZWUgaWYgdGhlIEphdmFzY3JpcHQgZXhpc3RzXG5cdFx0bGV0IHNyYyA9IHRoaXMuZm9sZGVyU3JjICsnLycrdGhpcy5jb21wb25lbnRKcztcblx0XHRsZXQgXyA9IGF3YWl0IEZpbGVIYW5kbGVyLmV4aXN0cyggc3JjICk7XG5cdFx0aWYgKCAhXyApe1xuXHRcdFx0ZXJyb3JzLnB1c2goYFVJTGF5b3V0TW9kZWwgZm9yICR7dGhpcy5uYW1lfSBieSAke3RoaXMuYXV0aG9yfSwgUG9pbnRlZCB0byBhIG1pc3NpbmcgZmlsZSAke3NyY31gKTtcblx0XHRcdHZhbGlkID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gc2VlIGlmIHRoZSBjc3MgZXhpc3RzIFxuXHRcdHNyYyA9IHRoaXMuZm9sZGVyU3JjICsnLycrdGhpcy5tYWluU3R5bGU7XG5cdFx0XyA9IGF3YWl0IEZpbGVIYW5kbGVyLmV4aXN0cyggc3JjICk7XG5cdFx0aWYgKCAhXyApe1xuXHRcdFx0ZXJyb3JzLnB1c2goYFVJTGF5b3V0TW9kZWwgZm9yICR7dGhpcy5uYW1lfSBieSAke3RoaXMuYXV0aG9yfSwgUG9pbnRlZCB0byBhIG1pc3NpbmcgZmlsZSAke3NyY31gKTtcblx0XHRcdHZhbGlkID0gZmFsc2U7XG5cdFx0fVxuXG5cdFx0dGhpcy52YWxpZCA9IHZhbGlkO1xuXHRcdHJldHVybiB2YWxpZDtcblx0fVxuXG5cdHB1YmxpYyBhc3luYyBsb2FkZmlsZShmaWxlICwgZXJyb3JzIDogc3RyaW5nIFtdID0gW10gKXtcblx0XHRjb25zdCBzcmMgPSB0aGlzLmZvbGRlclNyYyArJy8nK2ZpbGU7XG5cdFx0bGV0IF8gPSBhd2FpdCBGaWxlSGFuZGxlci5leGlzdHMoIHNyYyApO1xuXHRcdGlmICggIV8gKXtcblx0XHRcdGVycm9ycy5wdXNoKGBmaWxlIGF0ICR7c3JjfSBkaWQgbm90IGV4aXN0c2ApO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0bGV0IGYgPSBhd2FpdCBGaWxlSGFuZGxlci5yZWFkRmlsZShzcmMpO1xuXHRcdHJldHVybiBmO1xuXHR9XG59XG4iLCJpbXBvcnQgeyBNdXRleCB9IGZyb20gXCJhc3luYy1tdXRleFwiO1xuaW1wb3J0IHsgRmlsZUhhbmRsZXIgfSBmcm9tIFwiLi9maWxlSGFuZGxlclwiO1xuaW1wb3J0IHsgSlNPTkhhbmRsZXIgfSBmcm9tICdncm9iYXgtanNvbi1oYW5kbGVyJzsgXG5pbXBvcnQgeyBTeXN0ZW1QcmV2aWV3IH0gZnJvbSBcIi4vbW9kZWwvc3lzdGVtUHJldmlld1wiO1xuaW1wb3J0IHsgZm9sZGVyIH0gZnJvbSBcImpzemlwXCI7XG5pbXBvcnQgeyBVSUxheW91dE1vZGVsIH0gZnJvbSBcIi4vbW9kZWwvVUlMYXlvdXRNb2RlbFwiO1xuaW1wb3J0IFBsdWdpbkhhbmRsZXIgZnJvbSBcIi4uL3VpLW9ic2lkaWFuL2FwcFwiO1xuaW1wb3J0IHsgVFRSUEdTeXN0ZW1KU09ORm9ybWF0dGluZyB9IGZyb20gXCIuLi9ncmFwaERlc2lnbmVyXCI7XG5cbnR5cGUgY29tbWFuZCA9IHsgY29tbWFuZDonZmlsZSd8J2ZvbGRlcicgLCBwYXRoOnN0cmluZywgY29udGVudDpzdHJpbmcgfVxudHlwZSBtZXNzYWdlTGlzdCA9IFJlY29yZDxzdHJpbmcsYW55PjtcblxuXG5leHBvcnQgY2xhc3MgRmlsZUNvbnRleHQge1xuXG5cdHByaXZhdGUgc3RhdGljIG11dGV4Ok11dGV4ID0gbmV3IE11dGV4KCk7XG5cdHByaXZhdGUgcGF0aCA6IHN0cmluZyA7IFxuXHRwcml2YXRlIHBsdWdpbkhhbmRsZXI7XG5cdC8vIHNpbmdsZXRvbiBpbXBsZW1lbnRhdGlvblxuXHRwcml2YXRlIHN0YXRpYyBpbnN0YW5jZTpGaWxlQ29udGV4dDtcblx0cHJpdmF0ZSBjb25zdHJ1Y3RvcihwbHVnaW5IYW5kbGVyPyA6IFBsdWdpbkhhbmRsZXIpe1xuXHRcdFxuXHRcdGlmICghdGhpcy5wbHVnaW5IYW5kbGVyICYmICFwbHVnaW5IYW5kbGVyKXtcblx0XHRcdGNvbnNvbGUuZXJyb3IoJ0ZpcnN0IGdldCBpbnN0YW5jZSBvZiBGaWxlQ29udGV4dCwgbXVzdCBpbmNsdWRlIGEgcGx1Z2luIGhhbmRsZXInKVxuXHRcdH0gXG5cdFx0dGhpcy5wbHVnaW5IYW5kbGVyID0gcGx1Z2luSGFuZGxlcjtcblx0XG5cdFx0dGhpcy5wYXRoID0gUGx1Z2luSGFuZGxlci5QTFVHSU5fUk9PVCArICcvJyArXG5cdFx0XHRcdFx0UGx1Z2luSGFuZGxlci5TWVNURU1TX0ZPTERFUl9OQU1FOyArICcvJyA7XG5cdH1cblx0cHVibGljIHN0YXRpYyBnZXRJbnN0YW5jZSggcGx1Z2luSGFuZGxlcj8gOiBQbHVnaW5IYW5kbGVyICl7IFxuXHRcdFxuXHRcdGlmKCFGaWxlQ29udGV4dC5pbnN0YW5jZSl7XG5cdFx0XHRGaWxlQ29udGV4dC5pbnN0YW5jZSA9IG5ldyBGaWxlQ29udGV4dChwbHVnaW5IYW5kbGVyKTtcblx0XHR9XG5cdFx0XG5cblx0XHRyZXR1cm4gRmlsZUNvbnRleHQuaW5zdGFuY2U7IFxuXHR9XG5cblx0cHVibGljIGxvYWRlZFN5c3RlbSA6IHN0cmluZzsgXG5cdHB1YmxpYyBmb2xkZXJzV2l0aE5vSW5kZXg6IHN0cmluZ1tdO1xuXHRwdWJsaWMgYXZhaWxhYmxlU3lzdGVtczogU3lzdGVtUHJldmlld1tdOyBcblxuXHRwcml2YXRlIGFzeW5jIGluaXRTeXN0ZW1zU3RydWN0dXJlKCl7IFxuXHRcdGlmICgoIGF3YWl0IEZpbGVIYW5kbGVyLmV4aXN0cyh0aGlzLnBhdGgpKSApXG5cdFx0XHRyZXR1cm47IFxuXHRcdEZpbGVIYW5kbGVyLm1rZGlyKHRoaXMucGF0aCk7IFxuXHR9XG5cblxuXHRwcml2YXRlIGFzeW5jIGxvYWRQcmV2aWV3QW5kZm9sZGVyKGZvbGRlclBhdGg6c3RyaW5nKXtcblx0XHRjb25zdCBpbmRleFBhdGggPSBmb2xkZXJQYXRoICsgJy9pbmRleC5qc29uJztcblx0XHRjb25zdCBmb2xkZXJOYW1lID0gZm9sZGVyUGF0aC5zcGxpdCgnLycpLmxhc3QoKTtcblx0XHRsZXQgZXhpc3RzID0gYXdhaXQgRmlsZUhhbmRsZXIuZXhpc3RzKGluZGV4UGF0aClcblx0XHRpZiggZXhpc3RzICl7XG5cdFx0XHRjb25zdCBjb250ZW50ID0gYXdhaXQgRmlsZUhhbmRsZXIucmVhZEZpbGUoaW5kZXhQYXRoKTsgXG5cdFx0XHRjb25zdCBzeXN0ZW1QcmV2aWV3ID0gSlNPTkhhbmRsZXIuZGVzZXJpYWxpemUoU3lzdGVtUHJldmlldyxjb250ZW50KTtcblx0XHRcdHN5c3RlbVByZXZpZXcuZm9sZGVyTmFtZVx0PSBmb2xkZXJOYW1lO1xuXHRcdFx0c3lzdGVtUHJldmlldy5mb2xkZXJQYXRoXHQ9IGZvbGRlclBhdGg7XG5cdFx0XHRzeXN0ZW1QcmV2aWV3LmZpbGVQYXRoXHRcdD0gaW5kZXhQYXRoOyBcblx0XHRcdHJldHVybiBbc3lzdGVtUHJldmlldyxmb2xkZXJOYW1lXVxuXHRcdH1cblx0XHRyZXR1cm4gW251bGwsZm9sZGVyTmFtZV07XG5cdH1cblx0cHJpdmF0ZSBhc3luYyBsb2FkUHJldmlldyhmb2xkZXJQYXRoOnN0cmluZyl7XG5cdFx0cmV0dXJuIChhd2FpdCB0aGlzLmxvYWRQcmV2aWV3QW5kZm9sZGVyKGZvbGRlclBhdGgpKVswXTtcblx0fVxuXG5cdHB1YmxpYyBzdGF0aWMgYXN5bmMgbG9hZEFsbEF2YWlsYWJsZUZpbGVzKCApe1xuXHRcdGxldCBpbnN0YW5jZSA9IEZpbGVDb250ZXh0LmdldEluc3RhbmNlKCk7XG5cdFx0cmV0dXJuIGluc3RhbmNlLmxvYWRBbGxBdmFpbGFibGVGaWxlcygpO1xuXHR9XG5cdHB1YmxpYyBhc3luYyBsb2FkQWxsQXZhaWxhYmxlRmlsZXMoIG1lc3NhZ2VzIDogbWVzc2FnZUxpc3QgPSB7fSApeyBcblx0XHRsZXQgcmVsZWFzZSA9IGF3YWl0IEZpbGVDb250ZXh0Lm11dGV4LmFjcXVpcmUoKTsgXG5cblx0XHRcdC8vIGZpbmQgYWxsIGZvbGRlcnMsIHRoYXQgY291bGQgY29udGFpbiBhIHN5c3RlbS4gXG5cdFx0XHRsZXQgbHNEaXIgPSBhd2FpdCBGaWxlSGFuZGxlci5sc2Rpcih0aGlzLnBhdGgpO1xuXHRcdFx0bGV0IHN5c3RlbXMgPSBhd2FpdCBQcm9taXNlLmFsbCggbHNEaXIuZm9sZGVycy5tYXAoYXN5bmMgKCBmb2xkZXJQYXRoICkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gYXdhaXQgdGhpcy5sb2FkUHJldmlld0FuZGZvbGRlcihmb2xkZXJQYXRoKTtcblx0XHRcdH0pKSBcblxuXHRcdFx0dGhpcy5mb2xkZXJzV2l0aE5vSW5kZXggPSBbXTtcblx0XHRcdHRoaXMuYXZhaWxhYmxlU3lzdGVtcyA9IFtdO1xuXG5cdFx0XHQvLyBTb3J0IGludG8gZm91bmQgYW5kIHVuZm91bmRcblx0XHRcdHN5c3RlbXMuZm9yRWFjaCggcCA9PiB7XG5cdFx0XHRcdGlmKHBbMF0pe1xuXHRcdFx0XHRcdHRoaXMuYXZhaWxhYmxlU3lzdGVtc1x0LnB1c2gocFswXSk7XG5cdFx0XHRcdH1lbHNle1xuXHRcdFx0XHRcdHRoaXMuZm9sZGVyc1dpdGhOb0luZGV4IC5wdXNoKHBbMV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KSBcblx0XHRyZWxlYXNlKCk7XG5cdH1cbiBcblx0cHVibGljIHN0YXRpYyBhc3luYyBjcmVhdGVTeXN0ZW1EZWZpbml0aW9uKCBzeXN0ZW0gOiBTeXN0ZW1QcmV2aWV3ICwgbWVzc2FnZXMgOiBtZXNzYWdlTGlzdCA9IHt9ICkgOiBQcm9taXNlPFN5c3RlbVByZXZpZXcgfCBudWxsPiB7XG5cdFx0bGV0IGluc3RhbmNlID0gRmlsZUNvbnRleHQuZ2V0SW5zdGFuY2UoKTtcblx0XHRyZXR1cm4gaW5zdGFuY2UuY3JlYXRlU3lzdGVtRGVmaW5pdGlvbihzeXN0ZW0sIG1lc3NhZ2VzICk7XG5cdH1cblx0cHVibGljIGFzeW5jIGNyZWF0ZVN5c3RlbURlZmluaXRpb24oIHN5c3RlbSA6IFN5c3RlbVByZXZpZXcgLCBtZXNzYWdlcyA6IG1lc3NhZ2VMaXN0ID0ge30pIDogUHJvbWlzZTxTeXN0ZW1QcmV2aWV3IHwgbnVsbD4gIHtcblx0XHRsZXQgcmVsZWFzZSA9IGF3YWl0IEZpbGVDb250ZXh0Lm11dGV4LmFjcXVpcmUoKTsgXG5cblx0XHQgXHR0aGlzLmluaXRTeXN0ZW1zU3RydWN0dXJlKCk7XG5cblx0XHRcdC8vIGNyZWF0ZSBmb2xkZXIgaWYgbm90IGV4aXN0cy4gXG5cdFx0XHRsZXQgZm9sZGVyUGF0aCA9IHRoaXMucGF0aCArICcvJyArIHN5c3RlbS5mb2xkZXJOYW1lO1xuXHRcdFx0aWYgKCEgYXdhaXQgRmlsZUhhbmRsZXIuZXhpc3RzKGZvbGRlclBhdGgpKXtcblx0XHRcdFx0YXdhaXQgRmlsZUhhbmRsZXIubWtkaXIoZm9sZGVyUGF0aClcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRpZiAoYXdhaXQgRmlsZUhhbmRsZXIuZXhpc3RzKGZvbGRlclBhdGggKyAnL2luZGV4Lmpzb24nKSl7XG5cdFx0XHRcdFx0bWVzc2FnZXNbJ2NyZWF0ZVN5c3RlbSddID0ge21zZzpgZm9sZGVyICcke3N5c3RlbS5mb2xkZXJOYW1lfScgYWxyZWFkeSBleGlzdGVkLCBhbmQgY29udGFpbmVkIGEgc3lzdGVtLiBcXG5FaXRoZXIgZGVsZXRlIHRoZSBvbGQgc3lzdGVtLCBvciBjaG9vc2UgYW5vdGhlciBmb2xkZXJuYW1lYCwgdHlwZTonZXJyb3InfTtcblx0XHRcdFx0XHRyZWxlYXNlKCk7XG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0Ly8vIGNyZWF0ZSB0aGUgc3lzdGVtLidcblx0XHRcdGxldCBmaWxlcGF0aCA9IGZvbGRlclBhdGgrJy9pbmRleC5qc29uJztcblx0XHRcdGF3YWl0IEZpbGVIYW5kbGVyLnNhdmVGaWxlKCBmaWxlcGF0aCAsIEpTT05IYW5kbGVyLnNlcmlhbGl6ZShzeXN0ZW0pIClcblx0XHRcdGlmICghIGF3YWl0IEZpbGVIYW5kbGVyLmV4aXN0cyhmaWxlcGF0aCkpe1xuXHRcdFx0XHRtZXNzYWdlc1snY3JlYXRlU3lzdGVtJ10gPSB7bXNnOmB0cmllZCB0byBzYXZlIGluZGV4Lmpzb24gYXQgJyR7ZmlsZXBhdGh9IFxcbiBidXQgc29tZXRoaW5nIHdlbnQgd3JvbmcuYCwgdHlwZTonZXJyb3InfTtcblx0XHRcdFx0cmVsZWFzZSgpO1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0XG5cdFx0XHRsZXQgc3lzdGVtUmVsb2FkZWQgPSBhd2FpdCB0aGlzLmxvYWRQcmV2aWV3KGZvbGRlclBhdGgpO1xuXHRcdHJlbGVhc2UoKTtcblx0XHRyZXR1cm4gc3lzdGVtUmVsb2FkZWQ7XG5cdH1cblxuXHRwdWJsaWMgc3RhdGljIGFzeW5jIGNvcHlTeXN0ZW1EZWZpbml0aW9uKCBzeXN0ZW0gOiBTeXN0ZW1QcmV2aWV3ICwgc3lzdGVtTmV3IDogU3lzdGVtUHJldmlldyAsIG1lc3NhZ2VzIDogbWVzc2FnZUxpc3QgPSB7fSApIDogUHJvbWlzZTxTeXN0ZW1QcmV2aWV3IHwgbnVsbD4gICB7XG5cdFx0bGV0IGluc3RhbmNlID0gRmlsZUNvbnRleHQuZ2V0SW5zdGFuY2UoKTtcblx0XHRyZXR1cm4gaW5zdGFuY2UuY29weVN5c3RlbURlZmluaXRpb24oc3lzdGVtLHN5c3RlbU5ldyxtZXNzYWdlcyk7XG5cdH1cblx0cHVibGljIGFzeW5jIGNvcHlTeXN0ZW1EZWZpbml0aW9uKCBzeXN0ZW0gOiBTeXN0ZW1QcmV2aWV3ICwgc3lzdGVtTmV3IDogU3lzdGVtUHJldmlldyAsIG1lc3NhZ2VzIDogbWVzc2FnZUxpc3QgPSB7fSkgOiBQcm9taXNlPFN5c3RlbVByZXZpZXcgfCBudWxsPiAge1xuXHRcdFxuXHRcdGxldCBjb3BpZWRTeXN0ZW0gPSBhd2FpdCB0aGlzLmNyZWF0ZVN5c3RlbURlZmluaXRpb24oc3lzdGVtTmV3LCBtZXNzYWdlcyk7XG5cdFx0aWYgKCFjb3BpZWRTeXN0ZW0pe1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHRcdFxuXHRcdGFzeW5jIGZ1bmN0aW9uIERGU0NvcHlBbGxGb2xkZXJzKCBwYXRoOnN0cmluZyAsIG5ld1BhdGg6c3RyaW5nKXtcblx0XHRcdGxldCBscyA9IGF3YWl0IEZpbGVIYW5kbGVyLmxzZGlyKHBhdGgpO1xuXHRcdFx0YXdhaXQgUHJvbWlzZS5hbGwoIGxzLmZvbGRlcnMubWFwKGFzeW5jICggZm9sZGVyUGF0aCApID0+IHtcblx0XHRcdFx0bGV0IGZvbGRlcm5hbWUgPSBmb2xkZXJQYXRoLnNwbGl0KCcvJykubGFzdCgpO1xuXHRcdFx0XHRsZXQgbmV3Rm9sZGVyUGF0aCA9IG5ld1BhdGggKyAnLycgKyBmb2xkZXJuYW1lO1xuXHRcdFx0XHRGaWxlSGFuZGxlci5ta2RpcihuZXdGb2xkZXJQYXRoKTtcblx0XHRcdFx0YXdhaXQgREZTQ29weUFsbEZvbGRlcnMoZm9sZGVyUGF0aCxuZXdGb2xkZXJQYXRoKTtcblx0XHRcdH0pKTtcblx0XHR9XG5cblx0XHRhc3luYyBmdW5jdGlvbiBCRlNDb3B5QWxsRmlsZXMoIHBhdGg6c3RyaW5nICwgbmV3UGF0aDpzdHJpbmcpe1xuXG5cblx0XHRcdGxldCBscyA9IGF3YWl0IEZpbGVIYW5kbGVyLmxzZGlyKHBhdGgpO1xuXHRcdFx0YXdhaXQgUHJvbWlzZS5hbGwoIGxzLmZpbGVzLm1hcChhc3luYyAoIGZpbGVQYXRoICkgPT4geyBcblx0XHRcdFx0bGV0IGZpbGUgPSBhd2FpdCBGaWxlSGFuZGxlci5yZWFkRmlsZShmaWxlUGF0aCk7XG5cdFx0XHRcdGxldCBmaWxlTmFtZSA9IGZpbGVQYXRoLnNwbGl0KCcvJykubGFzdCgpO1xuXHRcdFx0XHRhd2FpdCBGaWxlSGFuZGxlci5zYXZlRmlsZShuZXdQYXRoICsgJy8nKyBmaWxlTmFtZSAsZmlsZSk7XG5cdFx0XHR9KSk7XG4gXG5cdFx0XHRhd2FpdCBQcm9taXNlLmFsbCggbHMuZm9sZGVycy5tYXAoYXN5bmMgKCBmb2xkZXJQYXRoICkgPT4geyBcblx0XHRcdFx0bGV0IHNlZ21lbnRzUGF0aCA9IGZvbGRlclBhdGguc3BsaXQoJy8nKTsgXG5cdFx0XHRcdGxldCBmb2xkZXJuYW1lID0gc2VnbWVudHNQYXRoLnBvcCgpO1xuXHRcdFx0XHRsZXQgbmV3Rm9sZGVyUGF0aCA9IG5ld1BhdGggKyAnLycgKyBmb2xkZXJuYW1lO1xuXHRcdFx0XHRhd2FpdCBCRlNDb3B5QWxsRmlsZXMoZm9sZGVyUGF0aCxuZXdGb2xkZXJQYXRoKTtcblx0XHRcdH0pKTtcblx0XHR9XG5cblx0XHRhd2FpdCBERlNDb3B5QWxsRm9sZGVycyhzeXN0ZW0uZm9sZGVyUGF0aCwgY29waWVkU3lzdGVtLmZvbGRlclBhdGgpO1xuXHRcdGF3YWl0IEJGU0NvcHlBbGxGaWxlcyhzeXN0ZW0uZm9sZGVyUGF0aCwgY29waWVkU3lzdGVtLmZvbGRlclBhdGgpOyBcblx0XHRhd2FpdCBGaWxlSGFuZGxlci5zYXZlRmlsZShjb3BpZWRTeXN0ZW0uZmlsZVBhdGgsIEpTT05IYW5kbGVyLnNlcmlhbGl6ZShjb3BpZWRTeXN0ZW0pIClcblx0XHRyZXR1cm4gY29waWVkU3lzdGVtO1xuXG5cdH1cblxuXHRwdWJsaWMgc3RhdGljIGFzeW5jIHN5c3RlbURlZmluaXRpb25FeGlzdHNJbkZvbGRlciggZm9sZGVyOnN0cmluZyl7XG5cdFx0bGV0IGluc3RhbmNlID0gRmlsZUNvbnRleHQuZ2V0SW5zdGFuY2UoKTtcblx0XHRyZXR1cm4gaW5zdGFuY2Uuc3lzdGVtRGVmaW5pdGlvbkV4aXN0c0luRm9sZGVyKGZvbGRlcik7XG5cdH1cblx0cHVibGljIGFzeW5jIHN5c3RlbURlZmluaXRpb25FeGlzdHNJbkZvbGRlciggZm9sZGVyOnN0cmluZyApe1xuXHRcdGxldCBmb2xkZXJQYXRoID0gdGhpcy5wYXRoICsgJy8nICsgZm9sZGVyO1xuXHRcdGlmICghIGF3YWl0IEZpbGVIYW5kbGVyLmV4aXN0cyhmb2xkZXJQYXRoKSl7XG5cdFx0XHQgcmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRlbHNlIHsgXG5cdFx0XHRpZiAoYXdhaXQgRmlsZUhhbmRsZXIuZXhpc3RzKGZvbGRlclBhdGggKyAnL2luZGV4Lmpzb24nKSl7IFxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0gXG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cblx0cHVibGljIHN0YXRpYyBhc3luYyBnZXRPckNyZWF0ZVN5c3RlbXNEZXNpZ25zKCBmb2xkZXI6c3RyaW5nKXtcblx0XHRyZXR1cm4gRmlsZUNvbnRleHQuZ2V0SW5zdGFuY2UoKS5zeXN0ZW1EZWZpbml0aW9uRXhpc3RzSW5Gb2xkZXIoZm9sZGVyKTtcblx0fVxuXHRwdWJsaWMgYXN5bmMgZ2V0T3JDcmVhdGVTeXN0ZW1zRGVzaWducyggZm9sZGVyOnN0cmluZyApe1xuIFxuXHRcdC8vIGlmIHRoZSBmb2xkZXIgZG9lcyBub3QgZXhpc3QuIHJldHVybiBmYWxzZSBcblx0XHRpZiAoISBhd2FpdCBGaWxlSGFuZGxlci5leGlzdHMoZm9sZGVyKSl7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHQvLyBpZiB0aGUgZm9sZGVyIGRvZXMgbm90IGV4aXN0LiByZXR1cm4gZmFsc2UgXG5cdFx0aWYgKCEgYXdhaXQgRmlsZUhhbmRsZXIuZXhpc3RzKGZvbGRlcikpe1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0Ly8gU2VlIGlmIHRoZSBmaWxlIGV4aXN0cy4gXG5cdFx0bGV0IGZpbGVwYXRoID0gZm9sZGVyICsgJy9kZXNpZ25lci5qc29uJztcblx0XHRpZiAoIWF3YWl0IEZpbGVIYW5kbGVyLmV4aXN0cyhmaWxlcGF0aCkpe1xuXG5cdFx0XHQvLyBDcmVhdGUgdGhlIGZpbGUuIFxuXHRcdFx0bGV0IGRlc2lnbmVyID0gbmV3IFRUUlBHU3lzdGVtSlNPTkZvcm1hdHRpbmcoKTtcblx0XHRcdGRlc2lnbmVyLmluaXRBc05ldygpO1xuXHRcdFx0YXdhaXQgRmlsZUhhbmRsZXIuc2F2ZUZpbGUoIGZpbGVwYXRoICwgSlNPTkhhbmRsZXIuc2VyaWFsaXplKGRlc2lnbmVyKSApO1xuXG5cdFx0XHRyZXR1cm4gZGVzaWduZXI7XG5cdFx0fVxuXHRcdFxuXHRcdGxldCBmaWxlID0gYXdhaXQgRmlsZUhhbmRsZXIucmVhZEZpbGUoZmlsZXBhdGgpO1xuXHRcdGxldCBsb2FkZWQgPSBKU09OSGFuZGxlci5kZXNlcmlhbGl6ZTxUVFJQR1N5c3RlbUpTT05Gb3JtYXR0aW5nPiggVFRSUEdTeXN0ZW1KU09ORm9ybWF0dGluZywgZmlsZSApO1xuXHRcdHJldHVybiBsb2FkZWQgYXMgVFRSUEdTeXN0ZW1KU09ORm9ybWF0dGluZztcblx0fVxuXHRwdWJsaWMgYXN5bmMgc2F2ZVN5c3RlbXNEZXNpZ25zKCBmb2xkZXI6c3RyaW5nICwgZGVzaWduZXI6IFRUUlBHU3lzdGVtSlNPTkZvcm1hdHRpbmcgKXtcblxuXHRcdC8vIGlmIHRoZSBmb2xkZXIgZG9lcyBub3QgZXhpc3QuIHJldHVybiBmYWxzZSBcblx0XHRpZiAoISBhd2FpdCBGaWxlSGFuZGxlci5leGlzdHMoZm9sZGVyKSl7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHQvLyBpZiB0aGUgZm9sZGVyIGRvZXMgbm90IGV4aXN0LiByZXR1cm4gZmFsc2UgXG5cdFx0aWYgKCEgYXdhaXQgRmlsZUhhbmRsZXIuZXhpc3RzKGZvbGRlcikpe1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0Ly8gU2VlIGlmIHRoZSBmaWxlIGV4aXN0cy4gXG5cdFx0bGV0IGZpbGVwYXRoID0gZm9sZGVyICsgJy9kZXNpZ25lci5qc29uJztcblx0XHRhd2FpdCBGaWxlSGFuZGxlci5zYXZlRmlsZSggZmlsZXBhdGggLCBKU09OSGFuZGxlci5zZXJpYWxpemUoZGVzaWduZXIpICk7IFxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG4gXG5cdHByaXZhdGUgYXN5bmMgbG9hZEZvbGRlckFuZEZpbGVzUmVjdXJzaWNlKGZvbGRlclBhdGgpOiBQcm9taXNlPGNvbW1hbmRbXT57XG5cdFx0XG5cdFx0Ly8gZmlyc3QgY3JlYXRlIHRoaXMgZm9sZGVyXG5cdFx0bGV0IGMgOiBjb21tYW5kW10gPSBbXTsgXG5cblx0XHQvLyBsb2FkIGFsbCBmaWxlcyBpbiB0aGUgRm9sZGVyXG5cdFx0Y29uc3QgY29udGVudCA9IGF3YWl0IEZpbGVIYW5kbGVyLmxzZGlyKGZvbGRlclBhdGgpO1xuXHRcdGxldCBtYXAgPSBhd2FpdCBQcm9taXNlLmFsbCggY29udGVudC5maWxlcy5tYXAoYXN5bmMgKCBmICkgPT4ge1xuXHRcdFx0cmV0dXJuIGF3YWl0IHRoaXMubG9hZEZpbGVBbmRDcmVhdGVDb21tYW5kKGYpO1xuXHRcdH0pKSBcdFxuXHRcdG1hcC5mb3JFYWNoKCBwID0+IHtcblx0XHRcdGMucHVzaChwKTtcblx0XHR9KVxuXG5cdFx0Ly8gbG9hZCBhbGwgZm9sZGVycyBpbiB0aGUgZm9sZGVyIFxuXHRcdGxldCBtYXAyID0gYXdhaXQgUHJvbWlzZS5hbGwoIGNvbnRlbnQuZm9sZGVycy5tYXAoYXN5bmMgKCBmICkgPT4ge1xuXHRcdFx0cmV0dXJuIGF3YWl0IHRoaXMubG9hZEZvbGRlckFuZEZpbGVzUmVjdXJzaWNlKGYpO1xuXHRcdH0pKSBcdFxuXHRcdG1hcDIuZm9yRWFjaCggcCA9PiB7XG5cdFx0XHRwLmZvckVhY2gocSA9PiB7XG5cdFx0XHRcdGMucHVzaChxKTtcblx0XHRcdH0pO1xuXHRcdH0pXG5cdFx0XG5cblx0XHRyZXR1cm4gYztcblx0fVxuXHRwcml2YXRlIGFzeW5jIGxvYWRGaWxlQW5kQ3JlYXRlQ29tbWFuZCggZmlsZXBhdGggKSA6IFByb21pc2U8Y29tbWFuZD57XG5cdFx0bGV0IGRhdGEgPSBhd2FpdCBGaWxlSGFuZGxlci5yZWFkRmlsZShmaWxlcGF0aCk7XG5cdFx0cmV0dXJuIHsgXG5cdFx0XHRjb21tYW5kOidmaWxlJyxcblx0XHRcdHBhdGg6ZmlsZXBhdGgsXG5cdFx0XHRjb250ZW50OmRhdGFcblx0XHR9XG5cdH1cblxuXG5cdHB1YmxpYyBhc3luYyBsb2FkQmxvY2tVSVRlbXBsYXRlKCApe1xuXHRcdFxuXHRcdGNvbnN0IHBhdGggPSAgUGx1Z2luSGFuZGxlci5QTFVHSU5fUk9PVCArICcvJyArIFBsdWdpbkhhbmRsZXIuQlVJTFRJTl9VSVNfRk9MREVSX05BTUUgKyAnLyc7IFxuXHRcdGxldCBjb21tYW5kcyA6Y29tbWFuZFtdID0gW107XG5cblx0XHQvLyBmaXJzdCB3ZSBnZXQgdGhlIHVwcGVyIGZpbGVzIGluIHRoZSBmb2xkZXIgXG5cdFx0bGV0IGV4aXN0cyA9IGF3YWl0IEZpbGVIYW5kbGVyLmV4aXN0cyhwYXRoKVxuXHRcdGlmKCAhZXhpc3RzICl7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ZpbGUgZm9yIEJsb2NrVUkgaGF2ZSBiZWVuIGRlbGV0ZWQuIHRoaXMgZmVhdHVyZSBsb25nZXIgd29ya3MgYXMgYSByZXN1bHQnKVxuXHRcdH1cblx0XHQgIFxuXHRcdC8vIEZJTEVTIEFERCBUTyBDT01NQU5EUyBcblx0XHRjb25zdCBjb250ZW50ID0gYXdhaXQgRmlsZUhhbmRsZXIubHNkaXIocGF0aCk7XG5cdFx0bGV0IG1hcCA9IGF3YWl0IFByb21pc2UuYWxsKCBjb250ZW50LmZpbGVzLm1hcChhc3luYyAoIGYgKSA9PiB7XG5cdFx0XHRyZXR1cm4gYXdhaXQgdGhpcy5sb2FkRmlsZUFuZENyZWF0ZUNvbW1hbmQoZik7XG5cdFx0fSkpIFx0IFxuXHRcdG1hcC5mb3JFYWNoKCBwID0+IHtcblx0XHRcdGlmKCFwLnBhdGguZW5kc1dpdGgoXCIvZGVjbGFyYXRpb24udHNcIikpe1xuXHRcdFx0XHRsZXQgbiA6IHN0cmluZyA9IChwLnBhdGguc3BsaXQoJ0Jsb2NrVUlEZXYvJykubGFzdCgpICk/PyAnJztcblx0XHRcdFx0cC5wYXRoID0gXCJzcmMvXCIgKyBuOyBcblx0XHRcdFx0Y29tbWFuZHMucHVzaChwKTtcblx0XHRcdH1cblx0XHR9KSBcblx0XHRcblx0XHQvLyB0aGVuIHdlIGxvYWQgc3BlY2lmaWsgRm9sZGVycy4gXG5cdFx0bGV0IHBhdGhzcmMgPSBwYXRoICsgJy8nICsgJ3NyYy8nO1xuXHRcdGxldCBtYXAyID0gYXdhaXQgdGhpcy5sb2FkRm9sZGVyQW5kRmlsZXNSZWN1cnNpY2UocGF0aHNyYyk7XG5cdFx0bWFwMi5mb3JFYWNoKHA9PnsgXG5cdFx0XHRsZXQgbiA9IHAucGF0aC5zcGxpdCgnQmxvY2tVSURldi8nKS5sYXN0KCkgPz8gJyc7XG5cdFx0XHRwLnBhdGggPSBuO1xuXHRcdFx0aWYobiAhPSBcIi9zcmMvXCIpe1xuXHRcdFx0XHRjb21tYW5kcy5wdXNoKHApO1xuXHRcdFx0fVxuXHRcdH0pIFxuXHRcdCBcblx0XHRyZXR1cm4gY29tbWFuZHM7XG5cdH1cblxuXHRwcml2YXRlIGFzeW5jIGxvYWRVSUxheW91dCggZm9sZGVyc3JjIDogc3RyaW5nICwgZXJyb3JzIDogc3RyaW5nW10gPSBbXSl7XG5cdFx0Y29uc3Qgc3JjID0gZm9sZGVyc3JjICsgJy8nICsgUGx1Z2luSGFuZGxlci5TWVNURU1fVUlfTEFZT1VURklMRU5BTUUgO1xuXHRcdGNvbnN0IGV4aXN0c1x0PSBhd2FpdCBGaWxlSGFuZGxlci5leGlzdHMoIHNyYyApO1xuXHRcdGlmKCFleGlzdHMpXG5cdFx0XHRyZXR1cm4gbnVsbDtcblxuXHRcdGNvbnN0IGZpbGUgPSBhd2FpdCBGaWxlSGFuZGxlci5yZWFkRmlsZShzcmMpO1xuXHRcdGxldCBtb2RlbCA6IFVJTGF5b3V0TW9kZWw7XG5cdFx0dHJ5IHtcblx0XHRcdG1vZGVsID0gSlNPTkhhbmRsZXIuZGVzZXJpYWxpemUoVUlMYXlvdXRNb2RlbCxmaWxlKTtcblx0XHR9Y2F0Y2goZSl7XG5cdFx0XHRlcnJvcnMucHVzaChlLm1lc3NhZ2UpO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXG5cdFx0bW9kZWwuZm9sZGVyU3JjID0gZm9sZGVyc3JjO1xuXHRcdGF3YWl0IG1vZGVsLmlzVmFsaWQoKTtcblx0XHRyZXR1cm4gbW9kZWw7XG5cdH1cblx0cHVibGljIGFzeW5jIGdldEFsbEJsb2NrVUlBdmFpbGFibGVQcmV2aWV3KCBzeXMgOiBTeXN0ZW1QcmV2aWV3ICl7XG5cdFx0Y29uc3QgVUlGb2xkZXJwYXRoID0gc3lzLmZvbGRlclBhdGggKyAnLycgKyBQbHVnaW5IYW5kbGVyLlNZU1RFTV9VSV9DT05UQUlORVJfRk9MREVSX05BTUU7XG5cdFx0Y29uc3QgZXhpc3RzID0gYXdhaXQgRmlsZUhhbmRsZXIuZXhpc3RzKFVJRm9sZGVycGF0aClcblx0XHRcblx0XHRsZXQgbGF5b3V0cyA6IFVJTGF5b3V0TW9kZWxbXT1bXTtcblx0XHRpZiggZXhpc3RzICl7XG5cdFx0XHRsZXQgZm9sZGVycyA9IChhd2FpdCBGaWxlSGFuZGxlci5sc2RpcihVSUZvbGRlcnBhdGgpKS5mb2xkZXJzO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBmb2xkZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNvbnN0IGZvbGRlciA9IGZvbGRlcnNbaV07XG5cdFx0XHRcdGxldCBsYXlvdXQgPSBhd2FpdCB0aGlzLmxvYWRVSUxheW91dChmb2xkZXIpO1xuXHRcdFx0XHRpZihsYXlvdXQpXG5cdFx0XHRcdFx0bGF5b3V0cy5wdXNoKGxheW91dCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBsYXlvdXRzO1xuXHR9XG5cblxuXG5cblx0XG59IiwiXG5pbXBvcnQgeyBGaWxlQ29udGV4dCB9IGZyb20gXCIuLi9jb3JlL2ZpbGVDb250ZXh0XCI7XG5pbXBvcnQgeyBTeXN0ZW1QcmV2aWV3IH0gZnJvbSBcIi4uL2NvcmUvbW9kZWwvc3lzdGVtUHJldmlld1wiOyBcbmltcG9ydCBQbHVnaW5IYW5kbGVyIGZyb20gXCIuLi91aS1vYnNpZGlhbi9hcHBcIjtcbmltcG9ydCB7IEFQSVJldHVybk1vZGVsLCBJQVBJIH0gZnJvbSBcIi4vSUFQSVwiO1xuXG5cbmV4cG9ydCBjbGFzcyBPYnNpZGlhbkFQSSBpbXBsZW1lbnRzIElBUEl7XG5cblx0cGx1Z2luSGFuZGxlciA6IFBsdWdpbkhhbmRsZXI7XG5cdHB1YmxpYyBjb25zdHJ1Y3RvcihwbHVnaW5IYW5kbGVyIDogUGx1Z2luSGFuZGxlciApe1xuXHRcdHRoaXMucGx1Z2luSGFuZGxlciA9IHBsdWdpbkhhbmRsZXI7XG5cdH1cblxuXHRnZXRTeXN0ZW1VSXMocHJldmlldzogU3lzdGVtUHJldmlldykge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xuXHR9XG5cdGdldEZhY3RvcnkocHJldmlldzogU3lzdGVtUHJldmlldykge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIk1ldGhvZCBub3QgaW1wbGVtZW50ZWQuXCIpO1xuXHR9XG5cdHB1YmxpYyBhc3luYyBnZXRBbGxTeXN0ZW1zKCkgOiBQcm9taXNlPEFQSVJldHVybk1vZGVsPFN5c3RlbVByZXZpZXdbXT4+e1xuXHRcdGxldCBtZXNzYWdlcyA9IFtdXG5cdFx0dHJ5e1xuXHRcdFx0bGV0IGZpbGVDb250ZXh0ID0gRmlsZUNvbnRleHQuZ2V0SW5zdGFuY2UoIHRoaXMucGx1Z2luSGFuZGxlciApO1xuXHRcdFx0YXdhaXQgZmlsZUNvbnRleHQubG9hZEFsbEF2YWlsYWJsZUZpbGVzKCBtZXNzYWdlcyApOyBcblx0XHRcdGxldCBwcmV2aWV3cyA9IGZpbGVDb250ZXh0LmF2YWlsYWJsZVN5c3RlbXMgPz8gW107XHRcblx0XHRcdGxldCByZXNwb25zZSA9IHtcblx0XHRcdFx0cmVzcG9uc2VDb2RlIDogMjAwLFxuXHRcdFx0XHRtZXNzYWdlcyA6IFtdLFxuXHRcdFx0XHRyZXNwb25zZTogcHJldmlld3Ncblx0XHRcdH0gYXMgQVBJUmV0dXJuTW9kZWw8U3lzdGVtUHJldmlld1tdPlxuXHRcdFx0cmV0dXJuIHJlc3BvbnNlO1xuXHRcdH1cblx0XHRjYXRjaCAoZSl7XG5cdFx0XHRtZXNzYWdlc1snZXhjZXB0aW9uJ10gPSB7bXNnOmUubWVzc2FnZSAsIHR5cGU6J2Vycm9yJ307XG5cdFx0XHRsZXQgcmVzcG9uc2UgPSB7XG5cdFx0XHRcdHJlc3BvbnNlQ29kZSA6IDMwMCxcblx0XHRcdFx0bWVzc2FnZXMgOiBbJ2NvdWxkIG5vdCBsb2FkIHN5c3RlbSBwcmV2aWV3cyddLFxuXHRcdFx0XHRyZXNwb25zZTogW11cblx0XHRcdH0gYXMgQVBJUmV0dXJuTW9kZWw8U3lzdGVtUHJldmlld1tdPlxuXHRcdFx0cmV0dXJuIHJlc3BvbnNlXG5cdFx0fSBcblx0fVxufVxuXG4vKlxuXG5cbmNsYXNzIFN5c3RlbURlZmluaXRpb25NYW5hZ2VtZW50e1xuXG5cdHByaXZhdGUgYXN5bmMgcmVjdXJzaXZlRmluZE5ld0ZvbGRlck5hbWUoIGRlcHRoID0gMCwgbWF4RGVwdGggPSA1KSA6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4gIHtcblxuXHRcdGlmIChkZXB0aCA9PSBtYXhEZXB0aCl7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRsZXQgdXVpZCA9IFN0cmluZ0Z1bmN0aW9ucy51dWlkU2hvcnQoKTtcblx0XHRpZiAoYXdhaXQgRmlsZUNvbnRleHQuc3lzdGVtRGVmaW5pdGlvbkV4aXN0c0luRm9sZGVyKHV1aWQpKXtcblx0XHRcdHJldHVybiB0aGlzLnJlY3Vyc2l2ZUZpbmROZXdGb2xkZXJOYW1lKGRlcHRoICsgMSk7XG5cdFx0fVxuXHRcdHJldHVybiB1dWlkO1xuXHR9XG5cblx0cHJpdmF0ZSBhc3luYyBpc1ZhbGlkU3lzdGVtUHJldmlldyggc3lzIDogU3lzdGVtUHJldmlldywgaW52YWxpZE1lc3NhZ2VzIDogbWVzc2FnZUxpc3QgPSB7fSApIDogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0bGV0IGlzVmFsaWQgPSB0cnVlO1xuXHRcdGNvbnN0IHN5c3RlbVByZXZpZXdWYWxpZGF0aW9uQ29kZSA9ICdzcHYnO1xuXG5cdFx0bGV0IF8gPSAnJzsgXG5cdFx0Ly8gQXV0aG9yIFxuXHRcdGlmICggIXN5cy5hdXRob3IgICl7XHRcblx0XHRcdGludmFsaWRNZXNzYWdlc1tzeXN0ZW1QcmV2aWV3VmFsaWRhdGlvbkNvZGUrJzEnXSA9IHttc2c6J2EgYXV0aG9yIGlzIG5vdCByZXF1aXJlZCBidXQgaGVscGZ1bGwgdG8gdXNlcnMnLCB0eXBlOiAgTWVzc2FnZVR5cGVzLnZlcmJvc2UgYXMgYW55ICB9IFxuXHRcdH1cblxuXHRcdC8vIFZlcnNpb24gXG5cdFx0aWYgKCAhc3lzLnZlcnNpb24gICl7XHRcblx0XHRcdGludmFsaWRNZXNzYWdlc1tzeXN0ZW1QcmV2aWV3VmFsaWRhdGlvbkNvZGUrJzInXSA9IHttc2c6J2EgdmVyc2lvbiBpcyBub3QgcmVxdWlyZWQgYnV0IGhlbHBmdWxsIHRvIHVzZXJzJywgdHlwZTogIE1lc3NhZ2VUeXBlcy52ZXJib3NlIGFzIGFueSAgfSAgXG5cdFx0fVxuXG5cdFx0Ly8gU3lzdGVtQ29kZU5hbWUgXG5cdFx0aWYgKCAhc3lzLnN5c3RlbUNvZGVOYW1lICApe1x0XG5cdFx0XHRpc1ZhbGlkID0gZmFsc2U7ICBcblx0XHRcdGludmFsaWRNZXNzYWdlc1tzeXN0ZW1QcmV2aWV3VmFsaWRhdGlvbkNvZGUrJzMnXSA9IHttc2c6J0RpZCBub3QgaGF2ZSBhIHN5c3RlbUNvZGVOYW1lLlxcbiBjYW4gb25seSBjb250YWluIHJlZ3VsYXIgbGV0dGVyIGFuZCBudW1iZXJzLCBubyBzcGVjaWFsIGNoYXJhY3RlcnMgb3Igd2hpdGVzcGFjZScsIHR5cGU6ICBNZXNzYWdlVHlwZXMuZXJyb3IgYXMgYW55ICB9ICBcblx0XHR9ZWxzZSBpZiAoIVN0cmluZ0Z1bmN0aW9ucy5pc1ZhbGlkU3lzdGVtQ29kZU5hbWUoc3lzLnN5c3RlbUNvZGVOYW1lKSl7XG5cdFx0XHRpc1ZhbGlkID0gZmFsc2U7ICBcblx0XHRcdGludmFsaWRNZXNzYWdlc1tzeXN0ZW1QcmV2aWV3VmFsaWRhdGlvbkNvZGUrJzQnXSA9IHttc2c6J0RpZCBub3QgaGF2ZSBhIHZhbGlkIHN5c3RlbUNvZGVOYW1lLlxcbiBjYW4gb25seSBjb250YWluIHJlZ3VsYXIgbGV0dGVyIGFuZCBudW1iZXJzLCBubyBzcGVjaWFsIGNoYXJhY3RlcnMgb3Igd2hpdGVzcGFjZScsIHR5cGU6ICBNZXNzYWdlVHlwZXMuZXJyb3IgYXMgYW55ICB9IFxuXHRcdH1cblx0XHRlbHNlIGlmIChcblx0XHRcdChGaWxlQ29udGV4dC5nZXRJbnN0YW5jZSgpLmF2YWlsYWJsZVN5c3RlbXMuZmluZEluZGV4KCBwID0+IHAuc3lzdGVtQ29kZU5hbWUgPT0gc3lzLnN5c3RlbUNvZGVOYW1lKSlcblx0XHRcdCE9IFxuXHRcdFx0LTFcblx0XHQpe1xuXHRcdFx0aXNWYWxpZCA9IGZhbHNlOyBcblx0XHRcdGludmFsaWRNZXNzYWdlc1tzeXN0ZW1QcmV2aWV3VmFsaWRhdGlvbkNvZGUrJ2QxJ10gPSB7bXNnOidzaGFyZXMgQ29kZW5hbWUgd2l0aCBhbm90aGVyIHN5c3RlbScsIHR5cGU6ICBNZXNzYWdlVHlwZXMuZXJyb3IgYXMgYW55ICB9XG5cdFx0fVxuXG5cdFx0Ly8gU3lzdGVtTmFtZSBObyBcXG4gY2hhcmFjdGVycy5cblx0XHRpZiAoICFzeXMuc3lzdGVtTmFtZSAgKXtcdFxuXHRcdFx0aXNWYWxpZCA9IGZhbHNlOyAgXG5cdFx0XHRpbnZhbGlkTWVzc2FnZXNbc3lzdGVtUHJldmlld1ZhbGlkYXRpb25Db2RlKyc1J10gPSB7bXNnOidEaWQgbm90IGhhdmUgYSBzeXN0ZW0gbmFtZS4nLCB0eXBlOiAgTWVzc2FnZVR5cGVzLmVycm9yIGFzIGFueSAgfSAgXG5cdFx0fWVsc2UgaWYgKCFTdHJpbmdGdW5jdGlvbnMuaXNWYWxpZFdpbmRvd3NGaWxlU3RyaW5nKHN5cy5zeXN0ZW1OYW1lKSl7XG5cdFx0XHRpc1ZhbGlkID0gZmFsc2U7ICBcblx0XHRcdGludmFsaWRNZXNzYWdlc1tzeXN0ZW1QcmV2aWV3VmFsaWRhdGlvbkNvZGUrJzYnXSA9IHttc2c6J0RpZCBub3QgaGF2ZSBhIHZhbGlkIHN5c3RlbSBuYW1lLicsIHR5cGU6ICBNZXNzYWdlVHlwZXMuZXJyb3IgYXMgYW55ICB9ICBcblx0XHR9XG5cdFx0ZWxzZSBpZiAoXG5cdFx0XHQoRmlsZUNvbnRleHQuZ2V0SW5zdGFuY2UoKS5hdmFpbGFibGVTeXN0ZW1zLmZpbmRJbmRleCggcCA9PiBwLnN5c3RlbU5hbWUgPT0gc3lzLnN5c3RlbU5hbWUpKVxuXHRcdFx0IT0gXG5cdFx0XHQtMVxuXHRcdCl7XG5cdFx0XHRpc1ZhbGlkID0gZmFsc2U7IFxuXHRcdFx0aW52YWxpZE1lc3NhZ2VzW3N5c3RlbVByZXZpZXdWYWxpZGF0aW9uQ29kZSsnZDInXSA9IHttc2c6J3NoYXJlcyBuYW1lIHdpdGggYW5vdGhlciBzeXN0ZW0nLCB0eXBlOiAgTWVzc2FnZVR5cGVzLmVycm9yIGFzIGFueSAgfVxuXHRcdH1cblxuXHRcdC8vIGZvbGRlciBvbmx5IGFsbG93IHdpbmRvd3MgZm9sZGVyIG5hbWUgYWNjZXB0ZWQgZm9sZGVyIG5hbWVzLlxuXHRcdGlmICggIXN5cy5mb2xkZXJOYW1lICApe1x0XG5cblx0XHRcdGxldCBuZXdGb2xkZXJuYW1lID0gYXdhaXQgdGhpcy5yZWN1cnNpdmVGaW5kTmV3Rm9sZGVyTmFtZSgwLDUpO1xuXHRcdFx0aWYgKCFuZXdGb2xkZXJuYW1lKXtcblx0XHRcdFx0aW52YWxpZE1lc3NhZ2VzW3N5c3RlbVByZXZpZXdWYWxpZGF0aW9uQ29kZSsnNyddID0ge21zZzonQSBuZXcgZm9sZGVyIG5hbWUgaXMgcmVxdWlyZWQsIE11c3QgYmUgdW5pcXVlLicsIHR5cGU6ICBNZXNzYWdlVHlwZXMuZXJyb3IgYXMgYW55ICB9ICAgXG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0c3lzLmZvbGRlck5hbWUgPSBuZXdGb2xkZXJuYW1lLy9cblx0XHRcdFx0aW52YWxpZE1lc3NhZ2VzW3N5c3RlbVByZXZpZXdWYWxpZGF0aW9uQ29kZSsnOCddID0ge21zZzonRGlkIG5vdCBoYXZlIGEgZm9sZGVyIG5hbWUgc28gY3JlYXRlZCBvbmUuJywgdHlwZTogIE1lc3NhZ2VUeXBlcy52ZXJib3NlIGFzIGFueSAgfSAgIFxuXHRcdFx0fVxuXHRcdH0gXG5cdFx0ZWxzZSBpZiAoIVN0cmluZ0Z1bmN0aW9ucy5pc1ZhbGlkV2luZG93c0ZpbGVTdHJpbmcoc3lzLmZvbGRlck5hbWUpKXsgXG5cdFx0XHRpc1ZhbGlkID0gZmFsc2U7ICBcblx0XHRcdGludmFsaWRNZXNzYWdlc1tzeXN0ZW1QcmV2aWV3VmFsaWRhdGlvbkNvZGUrJzknXSA9IHttc2c6J2ZvbGRlciBuYW1lIHdhcyBub3QgdmFsaWQgd2luZG93cyBmb2xkZXIgbmFtZS4nLCB0eXBlOiAgTWVzc2FnZVR5cGVzLmVycm9yIGFzIGFueSAgfSAgIFxuXHRcdH0gXG5cdFx0ZWxzZSBpZiAoXG5cdFx0XHQoRmlsZUNvbnRleHQuZ2V0SW5zdGFuY2UoKS5hdmFpbGFibGVTeXN0ZW1zLmZpbmRJbmRleCggcCA9PiBwLmZvbGRlclBhdGguZW5kc1dpdGgoJy8nICsgc3lzLmZvbGRlck5hbWUpKSlcblx0XHRcdCE9IFxuXHRcdFx0LTFcblx0XHQpe1xuXHRcdFx0aXNWYWxpZCA9IGZhbHNlOyAgXG5cdFx0XHRpbnZhbGlkTWVzc2FnZXNbc3lzdGVtUHJldmlld1ZhbGlkYXRpb25Db2RlKydkMyddID0ge21zZzonZm9sZGVyIG5hbWUgd2FzIGFscmVhZHkgdXNlZCwgeW91IG11c3QgdXNlIGFub3RoZXIsIG9yIHVzZSBhbiBvdmVyd3JpdGUgZmVhdHVyZS4nLCB0eXBlOiAgTWVzc2FnZVR5cGVzLmVycm9yIGFzIGFueSAgfVxuXHRcdH1cblxuXHRcdGlmIChpc1ZhbGlkKXtcblx0XHRcdGludmFsaWRNZXNzYWdlc1tzeXN0ZW1QcmV2aWV3VmFsaWRhdGlvbkNvZGUrJ09LJ10gPSB7bXNnOidBbGwgaXMgR29vZC4nLCB0eXBlOiAgTWVzc2FnZVR5cGVzLmdvb2QgYXMgYW55ICB9XG5cdFx0fVxuXHRcdHJldHVybiBpc1ZhbGlkO1xuXHR9XG5cblx0cHVibGljIGFzeW5jIHZhbGlkYXRlU3lzdGVtKCBzeXMgOiBTeXN0ZW1QcmV2aWV3ICl7XG5cdFx0bGV0IG1lc3NhZ2VzIDogbWVzc2FnZUxpc3QgPSB7fTtcblx0XHR0cnl7XG5cdFx0XHRpZiAoICFhd2FpdCB0aGlzLmlzVmFsaWRTeXN0ZW1QcmV2aWV3KHN5cywgbWVzc2FnZXMpICl7XG5cdFx0XHRcdHJldHVybiBjcmVhdGVSZXNwb25zZSg0MDYsZmFsc2UsbWVzc2FnZXMgKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBjcmVhdGVSZXNwb25zZSgyMDAsdHJ1ZSxtZXNzYWdlcyApO1xuXHRcdH1cblx0XHRjYXRjaCAoZSl7XG5cdFx0XHRtZXNzYWdlc1snZXhjZXB0aW9uJ10gPSB7bXNnOmUubWVzc2FnZSAsIHR5cGU6J2Vycm9yJ307XG5cdFx0XHRyZXR1cm4gY3JlYXRlUmVzcG9uc2UoNTAwLG51bGwsbWVzc2FnZXMgKTtcblx0XHR9IFxuXHR9XG5cblx0cHVibGljIGFzeW5jIENyZWF0ZU5ld1N5c3RlbSggc3lzIDogU3lzdGVtUHJldmlldyApIDogUHJvbWlzZTxBUElSZXR1cm5Nb2RlbDxTeXN0ZW1QcmV2aWV3fG51bGw+PiB7XG5cdFx0bGV0IG1lc3NhZ2VzIDogbWVzc2FnZUxpc3QgPSB7fTtcblx0XHR0cnl7XG5cdFx0XHRpZiAoICFhd2FpdCB0aGlzLmlzVmFsaWRTeXN0ZW1QcmV2aWV3KHN5cywgbWVzc2FnZXMpICl7XG5cdFx0XHRcdHJldHVybiBjcmVhdGVSZXNwb25zZSg0MDYsbnVsbCxtZXNzYWdlcyApO1xuXHRcdFx0fVxuXHRcdFxuXHRcdFx0bGV0IGNyZWF0ZWRBbmRSZWxvYWRlZCA9IGF3YWl0IEZpbGVDb250ZXh0LmNyZWF0ZVN5c3RlbURlZmluaXRpb24oIHN5cyApO1xuXHRcdFx0aWYgKGNyZWF0ZWRBbmRSZWxvYWRlZCl7XG5cdFx0XHRcdHJldHVybiBjcmVhdGVSZXNwb25zZSgyMDAsY3JlYXRlZEFuZFJlbG9hZGVkLG1lc3NhZ2VzICk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gY3JlYXRlUmVzcG9uc2UoNDA2LG51bGwsbWVzc2FnZXMgKTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpe1xuXHRcdFx0bWVzc2FnZXNbJ2V4Y2VwdGlvbiddID0ge21zZzplLm1lc3NhZ2UgLCB0eXBlOidlcnJvcid9O1xuXHRcdFx0cmV0dXJuIGNyZWF0ZVJlc3BvbnNlKDUwMCxudWxsLG1lc3NhZ2VzICk7XG5cdFx0fSBcblx0fVxuXG5cdHB1YmxpYyBhc3luYyBDb3B5U3lzdGVtKCBmcm9tIDogU3lzdGVtUHJldmlldywgdG8gOiBTeXN0ZW1QcmV2aWV3KSA6IFByb21pc2U8QVBJUmV0dXJuTW9kZWw8U3lzdGVtUHJldmlld3xudWxsPj4ge1xuXHRcdGxldCBtZXNzYWdlcyA6IG1lc3NhZ2VMaXN0ID0ge307XG5cdFx0dHJ5e1xuXHRcdFx0aWYgKCAhYXdhaXQgdGhpcy5pc1ZhbGlkU3lzdGVtUHJldmlldyh0bywgbWVzc2FnZXMpICl7XG5cdFx0XHRcdHJldHVybiBjcmVhdGVSZXNwb25zZSg0MDYsbnVsbCxtZXNzYWdlcyApO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgc2F2ZWRBbmRSZWxvYWRlZCA9IGF3YWl0IEZpbGVDb250ZXh0LmNvcHlTeXN0ZW1EZWZpbml0aW9uKCBmcm9tICwgdG8gKTtcblx0XHRcdGlmIChzYXZlZEFuZFJlbG9hZGVkKXtcblx0XHRcdFx0cmV0dXJuIGNyZWF0ZVJlc3BvbnNlKDIwMCxzYXZlZEFuZFJlbG9hZGVkLG1lc3NhZ2VzICk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gY3JlYXRlUmVzcG9uc2UoNDA2LG51bGwsbWVzc2FnZXMgKTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpe1xuXHRcdFx0bWVzc2FnZXNbJ2V4Y2VwdGlvbiddID0ge21zZzplLm1lc3NhZ2UgLCB0eXBlOidlcnJvcid9O1xuXHRcdFx0cmV0dXJuIGNyZWF0ZVJlc3BvbnNlKDUwMCxudWxsLG1lc3NhZ2VzICk7XG5cdFx0fSBcblx0fVxuXG5cdHB1YmxpYyBhc3luYyBEZWxldGVzeXN0ZW0oIHN5cyA6IFN5c3RlbVByZXZpZXcgKSA6IFByb21pc2U8QVBJUmV0dXJuTW9kZWw8Ym9vbGVhbj4+IHtcblx0XHRyZXR1cm4gY3JlYXRlUmVzcG9uc2UoNTAxLGZhbHNlLHt9ICk7XG5cdH1cblxuXHRwdWJsaWMgYXN5bmMgRWRpdFN5c3RlbSggc3lzIDogU3lzdGVtUHJldmlldyApIDogUHJvbWlzZTxBUElSZXR1cm5Nb2RlbDxTeXN0ZW1QcmV2aWV3fG51bGw+Pntcblx0XHRyZXR1cm4gY3JlYXRlUmVzcG9uc2UoNTAxLG51bGwse30gKTtcblx0fVxuXG5cdHB1YmxpYyBhc3luYyBnZXRBbGxTeXN0ZW1zKCkgOiBQcm9taXNlPEFQSVJldHVybk1vZGVsPFN5c3RlbVByZXZpZXdbXXxudWxsPj57XG5cdFx0bGV0IG1lc3NhZ2VzIDogbWVzc2FnZUxpc3QgPSB7fTtcblx0XHR0cnl7XG5cdFx0XHRsZXQgZmlsZUNvbnRleHQgPSBGaWxlQ29udGV4dC5nZXRJbnN0YW5jZSgpO1xuXHRcdFx0YXdhaXQgZmlsZUNvbnRleHQubG9hZEFsbEF2YWlsYWJsZUZpbGVzKCBtZXNzYWdlcyApOyBcblx0XHRcdGxldCBwcmV2aWV3cyA9IGZpbGVDb250ZXh0LmF2YWlsYWJsZVN5c3RlbXMgPz8gW107XHRcblx0XHRcdHJldHVybiBjcmVhdGVSZXNwb25zZSgyMDAscHJldmlld3MsbWVzc2FnZXMgKTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpe1xuXHRcdFx0bWVzc2FnZXNbJ2V4Y2VwdGlvbiddID0ge21zZzplLm1lc3NhZ2UgLCB0eXBlOidlcnJvcid9O1xuXHRcdFx0cmV0dXJuIGNyZWF0ZVJlc3BvbnNlKDUwMCxudWxsLG1lc3NhZ2VzICk7XG5cdFx0fSBcblx0fVxufVxuXG5jbGFzcyBTeXN0ZW1GYWN0b3J5e1xuXHRwdWJsaWMgYXN5bmMgZ2V0T3JDcmVhdGVTeXN0ZW1GYWN0b3J5KCBwcmV2aWV3IDogU3lzdGVtUHJldmlldyApIDogUHJvbWlzZTxBUElSZXR1cm5Nb2RlbDxUVFJQR1N5c3RlbUpTT05Gb3JtYXR0aW5nfG51bGw+PiB7XG5cdFx0XG5cdFx0aWYgKCFwcmV2aWV3LmZvbGRlclBhdGgpe1xuXHRcdFx0cmV0dXJuIGNyZWF0ZVJlc3BvbnNlKDQwNixudWxsLGNyZWF0ZU1lc3NhZ2UoJ2dldE9yQ3JlYXRlU3lzdGVtRmFjdG9yeTEnLCdzeXN0ZW1QcmV2aWV3IHdhcyBpbnZhbGlkJywgJ2Vycm9yJykpO1xuXHRcdH1cblxuXHRcdGxldCBmaWxlQ29udGVudCA9IEZpbGVDb250ZXh0LmdldEluc3RhbmNlKCk7XG5cdFx0bGV0IGRlc2lnbmVyID0gYXdhaXQgZmlsZUNvbnRlbnQuZ2V0T3JDcmVhdGVTeXN0ZW1zRGVzaWducyggcHJldmlldy5mb2xkZXJQYXRoICk7XG5cdFx0aWYgKGRlc2lnbmVyKXtcblx0XHRcdHJldHVybiAgY3JlYXRlUmVzcG9uc2UoMjAwLCBkZXNpZ25lciwgY3JlYXRlTWVzc2FnZSgnZ2V0T3JDcmVhdGVTeXN0ZW1GYWN0b3J5JywnU3lzdGVtIERlc2lnbmVyIExvYWRlZCcsJ2dvb2QnKSApO1xuXHRcdH1cblx0XHRyZXR1cm4gY3JlYXRlUmVzcG9uc2UoNTAwLCBudWxsICwgY3JlYXRlTWVzc2FnZSgnZ2V0T3JDcmVhdGVTeXN0ZW1GYWN0b3J5JywnU29tZXRoaW5nIHdlbnQgd3JvbmcgbG9hZGluZyB0aGUgZmlsZScsJ2Vycm9yJykgKTtcblx0fVxuXHRwdWJsaWMgYXN5bmMgc2F2ZVN5c3RlbURlc2lnbmVyKCBwcmV2aWV3IDogU3lzdGVtUHJldmlldyAsIGRlc2lnbmVyIDogVFRSUEdTeXN0ZW1KU09ORm9ybWF0dGluZyApe1xuXG5cdFx0aWYgKCFwcmV2aWV3LmZvbGRlclBhdGgpe1xuXHRcdFx0cmV0dXJuIGNyZWF0ZVJlc3BvbnNlKDQwNixudWxsLGNyZWF0ZU1lc3NhZ2UoJ3NhdmVTeXN0ZW1GYWN0b3J5MScsJ3N5c3RlbVByZXZpZXcgd2FzIGludmFsaWQnLCAnZXJyb3InKSk7XG5cdFx0fVxuXG5cdFx0aWYgKCAhZGVzaWduZXIuaXNWYWxpZCgpICl7XG5cdFx0XHRyZXR1cm4gY3JlYXRlUmVzcG9uc2UoNDA2LG51bGwsY3JlYXRlTWVzc2FnZSgnc2F2ZVN5c3RlbUZhY3RvcnkxJywnc3lzdGVtIERlc2lnbmVyIHZhbGlkYXRlZCB0byBpbnZhbGlkLiAnLCAnZXJyb3InKSk7XG5cdFx0fVxuXG5cblx0XHRsZXQgZmlsZUNvbnRlbnQgPSBGaWxlQ29udGV4dC5nZXRJbnN0YW5jZSgpO1xuXHRcdGlmIChhd2FpdCBmaWxlQ29udGVudC5zYXZlU3lzdGVtc0Rlc2lnbnMoIHByZXZpZXcuZm9sZGVyUGF0aCwgZGVzaWduZXIgKSl7XG5cdFx0XHRyZXR1cm4gY3JlYXRlUmVzcG9uc2UoMjAwLCBudWxsICwgY3JlYXRlTWVzc2FnZSgnc2F2ZVN5c3RlbUZhY3RvcnkxJywnc2F2ZWQgZGVzaWduZXInLCdnb29kJykgKTtcblx0XHR9XG5cdFx0cmV0dXJuIGNyZWF0ZVJlc3BvbnNlKDUwMCwgbnVsbCAsIGNyZWF0ZU1lc3NhZ2UoJ3NhdmVTeXN0ZW1GYWN0b3J5MScsJ1NvbWV0aGluZyB3ZW50IHdyb25nIGxvYWRpbmcgdGhlIGZpbGUnLCdlcnJvcicpICk7XG5cdH1cblx0cHVibGljIGFzeW5jIGRlbGV0ZVN5c3RlbUZhY3RvcnkoKXt9XG59XG5cblxuXG5jbGFzcyBVSUltcG9ydGVyRXhwb3Rlcntcblx0cHVibGljIGFzeW5jIGxvYWRCbG9ja1VJRm9yRXhwb3J0KCl7XG5cblx0XHRsZXQgbWVzc2FnZXMgOiBtZXNzYWdlTGlzdCA9IHt9O1xuXHRcdHRyeXsgIFxuXHRcdFx0bGV0IGJsb2NrVUlGaWxlc1Jlc3BvbnNlID0gYXdhaXQgRmlsZUNvbnRleHQuZ2V0SW5zdGFuY2UoKS5sb2FkQmxvY2tVSVRlbXBsYXRlKCk7O1xuXHRcdFx0cmV0dXJuIGNyZWF0ZVJlc3BvbnNlKDIwMCxibG9ja1VJRmlsZXNSZXNwb25zZSwge30gKTtcblx0XHR9XG5cdFx0Y2F0Y2ggKGUpe1xuXHRcdFx0bWVzc2FnZXNbJ0Vycm9yJ109KHttc2c6ZS5tZXNzYWdlICwgdHlwZTonZXJyb3InfSk7XG5cdFx0XHRyZXR1cm4gY3JlYXRlUmVzcG9uc2UoMzAwLFtdLG1lc3NhZ2VzICk7XG5cdFx0fSBcblx0fVxuXHRcblx0cHVibGljIGFzeW5jIGdldEFsbEF2YWlsYWJsZVVJc0ZvclN5c3RlbSggc3lzIDogU3lzdGVtUHJldmlldyApe1xuXHRcdGxldCBtZXNzYWdlcyA6IG1lc3NhZ2VMaXN0ID0ge307XG5cdFx0dHJ5e1xuXHRcdFx0bGV0IGZpbGVDb250ZXh0ID0gRmlsZUNvbnRleHQuZ2V0SW5zdGFuY2UoKTtcblx0XHRcdGxldCBsYXlvdXRzID0gYXdhaXQgZmlsZUNvbnRleHQuZ2V0QWxsQmxvY2tVSUF2YWlsYWJsZVByZXZpZXcoIHN5cyApO1xuXHRcdFx0cmV0dXJuIGNyZWF0ZVJlc3BvbnNlKDIwMCxsYXlvdXRzLG1lc3NhZ2VzICk7XG5cdFx0fVxuXHRcdGNhdGNoIChlKXtcblx0XHRcdG1lc3NhZ2VzWydleGNlcHRpb24nXSA9IHttc2c6ZS5tZXNzYWdlICwgdHlwZTonZXJyb3InfTtcblx0XHRcdHJldHVybiBjcmVhdGVSZXNwb25zZSg1MDAsbnVsbCxtZXNzYWdlcyApO1xuXHRcdH0gXG5cdH0gXG59XG5cblxuXG5jbGFzcyBUZXN0e1xuXG5cdHB1YmxpYyBhc3luYyBDYWxsVGVzdEVycm9yKCBlcnJvckNvZGUgPSAzMDAgICl7XG5cdFx0XG5cdFx0bGV0IG1lc3NhZ2VzIDogbWVzc2FnZUxpc3QgPSB7fTtcblx0XHRtZXNzYWdlc1snRXJyb3IwJ109KHttc2c6J1Rlc3QgTWVzc2FnZSAxJywgdHlwZTonZXJyb3InfSk7XG5cdFx0bWVzc2FnZXNbJ0Vycm9yMSddPSh7bXNnOidUZXN0IE1lc3NhZ2UgMicsIHR5cGU6J3ZlcmJvc2UnfSk7XG5cdFx0bWVzc2FnZXNbJ0Vycm9yMiddPSh7bXNnOidUZXN0IE1lc3NhZ2UgMycsIHR5cGU6J2dvb2QnfSk7XG5cblxuXHRcdHJldHVybiBjcmVhdGVSZXNwb25zZShlcnJvckNvZGUsW10sbWVzc2FnZXMgKTtcblx0fVxufVxuXG4qLyIsIjxzY3JpcHQgbGFuZz1cInRzXCI+XG5cdGltcG9ydCBEZXNpZ25lciBmcm9tICcuLi91aS9WaWV3cy9MYXlvdXQwMS9EZXNpZ25lci5zdmVsdGUnO1xuICAgIGltcG9ydCB7IElBUEkgfSBmcm9tICcuLi9hcGkvSUFQSSc7XG4gICAgaW1wb3J0IHsgT2JzaWRpYW5BUEkgfSBmcm9tICcuLi9hcGkvT2JzaWRpYW5BUEknO1xuICAgIGltcG9ydCB7IFdlYkFwaUNvbm5lY3Rpb24gfSBmcm9tICcuLi9hcGkvV2ViQVBJQ29ubmVjdGlvbic7XG4gICAgaW1wb3J0IHsgTGF5b3V0MDFDb250ZXh0IH0gZnJvbSAnLi4vdWkvVmlld3MvTGF5b3V0MDEvY29udGV4dCc7XHRcbiAgICBpbXBvcnQgUGx1Z2luSGFuZGxlciBmcm9tICcuL2FwcCc7XG5cblx0ZXhwb3J0IGxldCBwbHVnaW5IYW5kbGVyIDogUGx1Z2luSGFuZGxlcjtcblx0bGV0IGNvbnRleHRcdDogTGF5b3V0MDFDb250ZXh0ID0gbmV3IExheW91dDAxQ29udGV4dCgpOyBcblx0bGV0IEFQSSA6IElBUEkgPSBuZXcgT2JzaWRpYW5BUEkocGx1Z2luSGFuZGxlcik7XG5cdGNvbnRleHQuQVBJID0gQVBJO1xuXHRcbjwvc2NyaXB0PlxuPGRpdiBpZD1cIlN2ZWx0ZUNvbnRhaW5lckZvclRUUFJQR1N5c3RlbVwiID5cblx0PERlc2lnbmVyIFxuXHRcdGNvbnRleHQgPSB7Y29udGV4dH1cblx0Lz5cbjwvZGl2PlxuPHN0eWxlPjwvc3R5bGU+IiwiaW1wb3J0IHsgQXBwLCBJdGVtVmlldywgTW9kYWwsIFBsYXRmb3JtLCBQbHVnaW4sIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcsIFRGaWxlLCBXb3Jrc3BhY2VMZWFmLCBwYXJzZVlhbWwgfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQgIFN2ZWx0ZUFwcCBmcm9tICcuL2FwcC5zdmVsdGUnO1xuaW1wb3J0IHsgQmxvY2tSZW5kZXJlciB9IGZyb20gJy4vQmxvY2tSZW5kZXJlci9CbG9ja1JlbmRlcmVyJztcbiBcblxuY29uc3QgVklFV19UWVBFID0gXCJzdmVsdGUtdmlld1wiOyAgICBcbmludGVyZmFjZSBNeVBsdWdpblNldHRpbmdzIHtcblx0bXlTZXR0aW5nOiBzdHJpbmc7XG4gXG59XG5cbmNvbnN0IERFRkFVTFRfU0VUVElOR1M6IE15UGx1Z2luU2V0dGluZ3MgPSB7XG5cdG15U2V0dGluZzogJ2RlZmF1bHQnXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsdWdpbkhhbmRsZXIgZXh0ZW5kcyBQbHVnaW4geyBcblxuXHRwdWJsaWMgc3RhdGljIEFwcCA6IEFwcDsgXG5cdHB1YmxpYyBzdGF0aWMgUk9PVFx0XHQgIFx0OiBzdHJpbmc7XHRcblx0cHVibGljIHN0YXRpYyBQTFVHSU5fUk9PVFx0OiBzdHJpbmc7XG5cdHB1YmxpYyBzdGF0aWMgU1lTVEVNU19GT0xERVJfTkFNRVx0OiBzdHJpbmc7XG5cdHB1YmxpYyBzdGF0aWMgQlVJTFRJTl9VSVNfRk9MREVSX05BTUVcdDogc3RyaW5nO1xuXHRwdWJsaWMgc3RhdGljIFNZU1RFTV9VSV9DT05UQUlORVJfRk9MREVSX05BTUVcdDogc3RyaW5nO1xuXHRwdWJsaWMgc3RhdGljIFNZU1RFTV9VSV9MQVlPVVRGSUxFTkFNRVx0OiBzdHJpbmc7XG5cdHB1YmxpYyBzdGF0aWMgU1lTVEVNX0xBWU9VVF9CTE9DS05BTUUgOnN0cmluZztcblx0cHVibGljIHN0YXRpYyBHTE9CQUxfU1lTVEVNX1BBU1NFUiA6c3RyaW5nO1xuXG5cdHB1YmxpYyBzdGF0aWMgc2VsZlx0XHRcdDogUGx1Z2luSGFuZGxlcjsgXG5cdFxuXHQvL0B0cy1pZ25vcmVcblx0c2V0dGluZ3M6IE15UGx1Z2luU2V0dGluZ3M7ICBcblxuXHRwdWJsaWMgc3RhdGljIHV1aWR2NCgpIHtcblx0XHRyZXR1cm4gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCdcblx0XHQucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbiAoYykge1xuXHRcdFx0Y29uc3QgciA9IE1hdGgucmFuZG9tKCkgKiAxNiB8IDAsIFxuXHRcdFx0XHR2ID0gYyA9PSAneCcgPyByIDogKHIgJiAweDMgfCAweDgpO1xuXHRcdFx0cmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuXHRcdH0pO1xuXHR9XG5cblx0YXN5bmMgb25sb2FkKCkge1xuXG5cdFx0YXdhaXQgdGhpcy5sb2FkU2V0dGluZ3MoKTsgXG5cdFx0UGx1Z2luSGFuZGxlci5zZWxmID0gdGhpcztcblx0XHRQbHVnaW5IYW5kbGVyLkFwcCAgPSB0aGlzLmFwcDsgIFxuXHRcdFBsdWdpbkhhbmRsZXIuUk9PVCA9IFBsdWdpbkhhbmRsZXIuQXBwLnZhdWx0LmNvbmZpZ0RpcjsgXG5cdFx0UGx1Z2luSGFuZGxlci5QTFVHSU5fUk9PVCA9IHRoaXMubWFuaWZlc3QuZGlyIGFzIHN0cmluZzsgXG5cdFx0XG5cdFx0Ly8gRk9MREVSUyBcblx0XHRQbHVnaW5IYW5kbGVyLlNZU1RFTVNfRk9MREVSX05BTUUgXHRcdFx0XHQ9IFwiU3lzdGVtc1wiXG5cdFx0UGx1Z2luSGFuZGxlci5CVUlMVElOX1VJU19GT0xERVJfTkFNRSBcdFx0XHQ9IFwic3ViUHJvamVjdHMvQmxvY2tVSURldlwiO1xuXHRcdFBsdWdpbkhhbmRsZXIuU1lTVEVNX1VJX0NPTlRBSU5FUl9GT0xERVJfTkFNRSBcdD0gJ1VJTGF5b3V0cyc7XG5cdFx0UGx1Z2luSGFuZGxlci5TWVNURU1fVUlfTEFZT1VURklMRU5BTUUgXHRcdFx0PSBcIlVJUHJldmlldy5qc29uXCJcblxuXHRcdC8vIFN0cmluZ3MgdXNlZCBmb3IgZ2xvYmFsIHZhcmlhYmxlcyBcblx0XHRQbHVnaW5IYW5kbGVyLkdMT0JBTF9TWVNURU1fUEFTU0VSXHRcdFx0XHQ9ICdHcm9iYXhUVFJQR0dsb2JhbFZhcmlhYmxlJztcblx0XHRcblxuXHRcdFBsdWdpbkhhbmRsZXIuU1lTVEVNX0xBWU9VVF9CTE9DS05BTUUgXHRcdFx0PSBcIlRUUlBHXCI7XHRcblx0XHQgXG5cdFx0Ly8gYWRkIFJpYmJvbiBJY29ucywgdGhlc2UgYXJlIHRoZSBpY29ucyBpbiB0aGUgbGVmdCBiYXIgb2YgdGhlIHdpbmRvd1xuXHRcdHRoaXMuYWRkUmliYm9uSWNvbignZGljZScsICdIYW5zc1xcJyBQbHVnaW4nLCAoZXZ0OiBNb3VzZUV2ZW50KSA9PiB7XG5cdFx0XHRuZXcgTW9kYWxNb3VudCh0aGlzLmFwcCwgdGhpcyApLm9wZW4oKTsgXG5cdFx0fSk7XG5cdFx0dGhpcy5hcHAud29ya3NwYWNlLm9uTGF5b3V0UmVhZHkodGhpcy5vbkxheW91dFJlYWR5LmJpbmQodGhpcykpO1xuXHRcdCBcblx0XHQvLyBBZGRpbmYgdGhlIHRhYiBpbiBzZXR0aW5ncy4gXG5cdFx0dGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBTYW1wbGVTZXR0aW5nVGFiKHRoaXMuYXBwLCB0aGlzKSk7XG5cblx0XHR0aGlzLnJlZ2lzdGVyTWFya2Rvd25Db2RlQmxvY2tQcm9jZXNzb3IoUGx1Z2luSGFuZGxlci5TWVNURU1fTEFZT1VUX0JMT0NLTkFNRSwgKHNvdXJjZSwgZWwsIGN0eCkgPT4ge1xuXHRcdFx0Y29uc3QgcmVuZGVyZXIgPSBuZXcgQmxvY2tSZW5kZXJlcihzb3VyY2UsZWwsY3R4KTtcblx0XHRcdC8vcmVuZGVyZXIucmVuZGVyKCk7IFxuXHRcdH0pO1xuXG5cdFx0dGhpcy5yZWdpc3RlckV2ZW50KFxuXHRcdFx0dGhpcy5hcHAud29ya3NwYWNlLm9uKCdhY3RpdmUtbGVhZi1jaGFuZ2UnLCAobGVhZikgPT4ge1xuXHRcdFx0XHRpZiAobGVhZikge1xuXHRcdFx0XHRcdHdpbmRvd1tQbHVnaW5IYW5kbGVyLkdMT0JBTF9TWVNURU1fUEFTU0VSXSA9IHt9O1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdCk7XG5cdCAgXG5cdFx0XG5cdH0gXG5cdG9uTGF5b3V0UmVhZHkoKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoVklFV19UWVBFKS5sZW5ndGgpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGhpcy5hcHAud29ya3NwYWNlLmdldFJpZ2h0TGVhZihmYWxzZSk/LnNldFZpZXdTdGF0ZSh7XG5cdFx0XHR0eXBlOiBWSUVXX1RZUEUsXG5cdFx0fSk7XG5cdH1cblxuXHRhc3luYyBsb2FkU2V0dGluZ3MoKSB7XG5cdFx0dGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XG5cdH1cblxufVxuXG5jbGFzcyBTYW1wbGVTZXR0aW5nVGFiIGV4dGVuZHMgUGx1Z2luU2V0dGluZ1RhYiB7XG5cdHBsdWdpbjogUGx1Z2luSGFuZGxlcjtcblx0XG5cdGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IFBsdWdpbkhhbmRsZXIpIHtcblx0XHRzdXBlcihhcHAsIHBsdWdpbik7XG5cdFx0dGhpcy5wbHVnaW4gPSBwbHVnaW47XG5cdH0gXG5cblx0ZGlzcGxheSgpOiB2b2lkIHtcblx0XHRjb25zdCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzOyBcblx0XHRjb250YWluZXJFbC5lbXB0eSgpOyAgICBcblx0XHRuZXcgU3ZlbHRlQXBwKHtcblx0XHRcdHRhcmdldDp0aGlzLmNvbnRhaW5lckVsLFxuXHRcdFx0cHJvcHM6e1xuXHRcdFx0XHQvL0B0cy1pZ25vcmVcblx0XHRcdFx0cGx1Z2luOiB0aGlzLnBsdWdpblxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cbn1cbmNsYXNzIE1vZGFsTW91bnQgZXh0ZW5kcyBNb2RhbCB7ICBcblx0cGx1Z2luOiAgUGx1Z2luSGFuZGxlcjsgXG5cblx0Y29uc3RydWN0b3IoYXBwOiBBcHAgLCBwbHVnaW46IFBsdWdpbkhhbmRsZXIpIHtcblx0XHRzdXBlcihhcHApO1xuXHRcdHRoaXMucGx1Z2luID0gcGx1Z2luOyBcblx0fSBcblxuXHRvbk9wZW4oKSB7XG5cdFx0bmV3IFN2ZWx0ZUFwcCh7XG5cdFx0XHR0YXJnZXQ6dGhpcy5jb250ZW50RWwsXG5cdFx0XHRwcm9wczp7XG5cdFx0XHRcdC8vQHRzLWlnbm9yZVxuXHRcdFx0XHRwbHVnaW46IHRoaXMucGx1Z2luXG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRvbkNsb3NlKCkge1xuXHRcdGNvbnN0IHtjb250ZW50RWx9ID0gdGhpcztcblx0XHRjb250ZW50RWwuZW1wdHkoKTtcblx0fVxufSJdLCJuYW1lcyI6WyJ2YWx1ZSIsIm5vdyIsImNoaWxkcmVuIiwiZWxlbWVudCIsInRleHQiLCJoYXNoIiwiZGV0YWNoIiwiaW5pdCIsImNyZWF0ZV9lYWNoX2Jsb2NrIiwiaW5zdGFuY2UiLCJjcmVhdGVfZnJhZ21lbnQiLCJsaW5lYXIiLCJkIiwiYiIsIl9fYXNzaWduIiwidiIsImN0eCIsImNyZWF0ZV9pZl9ibG9jayIsImRpc3BhdGNoIiwidXBkYXRlIiwic3Vic2NyaWJlIiwicnVuIiwiS2V5TWFuYWdlcl8xIiwiS2V5TWFuYWdlciIsIkFHcmFwaEl0ZW1fMSIsInJlcXVpcmUkJDAiLCJBR3JhcGhJdGVtIiwiR3JvYkNvbGxlY3Rpb25fMSIsInRzbGliXzEiLCJyZXF1aXJlJCQxIiwiX3N1cGVyIiwiR3JvYkNvbGxlY3Rpb24iLCJHcm9iR3JvdXBfMSIsIkdyb2JHcm91cCIsIlRUUlBHU3lzdGVtR3JhcGhBYnN0cmFjdE1vZGVsXzEiLCJyZXF1aXJlJCQyIiwiVFRSUEdTeXN0ZW1HcmFwaEFic3RyYWN0TW9kZWwiLCJUVFJQR1N5c3RlbUdyYXBoTW9kZWxfMSIsIklPdXRwdXRIYW5kbGVyXzEiLCJyZXF1aXJlJCQzIiwiVFRSUEdTeXN0ZW1HcmFwaE1vZGVsIiwiR3JvYkFsZ29yaXRobXMiLCJhbGdMZXZlbCIsInN0cm9uZ0NvbXBvbmVudHMiLCJxdWUiLCJjdXJyIiwiQUdyb2JOb2RlIiwiR3JvYk9yaWdpbl8xIiwiR3JvYk9yaWdpbiIsIkdyb2JEZXJpdmVkTm9kZV8xIiwiQUdyb2JOb2R0ZV8xIiwic3ltYm9scyIsInJlYyIsInN0YXRlbWVudCIsInJlcyIsIkdyb2JCb251c05vZGVfMSIsIkdyb2JCb251c05vZGUiLCJUVFJQR1N5c3RlbUJvbnVzRGVzaWduZXJfMSIsIlRUUlBHU3lzdGVtQm9udXNEZXNpZ25lciIsIkdyb2JGaXhlZE5vZGVfMSIsIkdyb2JGaXhlZE5vZGUiLCJBRGF0YVRhYmxlIiwiQURhdGFSb3ciLCJleHBvcnRzIiwicmVxdWlyZSQkNCIsInJlcXVpcmUkJDUiLCJyZXF1aXJlJCQ2IiwicmVxdWlyZSQkNyIsInJlcXVpcmUkJDgiLCJyZXF1aXJlJCQ5IiwiSlNPTl9UQUdTIiwiSlNPTl9CQVNFVFlQRVMiLCJSZWZsZWN0IiwiSlNPTkhhbmRsZXIiLCJpIiwiaiIsIm9iaiIsImUiLCJ0eXBla2V5IiwiR3JvYkRlcml2ZWRPcmlnaW4iLCJfX2RlY29yYXRlQ2xhc3MiLCJHcm9iRGVyaXZlZE5vZGUiLCJUVFJQR1N5c3RlbSIsInV1aWR2NCIsIlRvb2x0aXAiLCJ0eXBlIiwiYW5pbVgiLCJhbmltWSIsIlhvZmZzZXQiLCJZb2Zmc2V0IiwiY3JlYXRlX2lmX2Jsb2NrXzQiLCJjcmVhdGVfaWZfYmxvY2tfMiIsImNyZWF0ZV9pZl9ibG9ja18zIiwiX2IiLCJfYSIsIl9kIiwiX2MiLCJfZiIsIl9lIiwiX2giLCJfZyIsIl9qIiwiX2kiLCJfbCIsIl9rIiwiX24iLCJfbSIsImFjdGl2ZSIsIlNlbWFwaG9yZSIsIk11dGV4Iiwia2V5TWFuYWdlckluc3RhbmNlIiwiZm9sZGVyIiwiUGx1Z2luIiwiUGx1Z2luU2V0dGluZ1RhYiIsIlN2ZWx0ZUFwcCIsIk1vZGFsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxTQUFTLE9BQU87QUFBRztBQUNuQixNQUFNLFdBQVcsT0FBSztBQUN0QixTQUFTLE9BQU8sS0FBSyxLQUFLO0FBRXRCLGFBQVcsS0FBSztBQUNaLFFBQUksS0FBSyxJQUFJO0FBQ2pCLFNBQU87QUFDWDtBQVdBLFNBQVMsSUFBSSxJQUFJO0FBQ2IsU0FBTyxHQUFFO0FBQ2I7QUFDQSxTQUFTLGVBQWU7QUFDcEIsU0FBTyx1QkFBTyxPQUFPLElBQUk7QUFDN0I7QUFDQSxTQUFTLFFBQVEsS0FBSztBQUNsQixNQUFJLFFBQVEsR0FBRztBQUNuQjtBQUNBLFNBQVMsWUFBWSxPQUFPO0FBQ3hCLFNBQU8sT0FBTyxVQUFVO0FBQzVCO0FBQ0EsU0FBUyxlQUFlLEdBQUcsR0FBRztBQUMxQixTQUFPLEtBQUssSUFBSSxLQUFLLElBQUksTUFBTSxNQUFPLEtBQUssT0FBTyxNQUFNLFlBQWEsT0FBTyxNQUFNO0FBQ3RGO0FBWUEsU0FBUyxTQUFTLEtBQUs7QUFDbkIsU0FBTyxPQUFPLEtBQUssR0FBRyxFQUFFLFdBQVc7QUFDdkM7QUFNQSxTQUFTLFVBQVUsVUFBVSxXQUFXO0FBQ3BDLE1BQUksU0FBUyxNQUFNO0FBQ2YsV0FB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
