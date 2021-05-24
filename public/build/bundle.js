
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
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
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
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
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
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
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
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
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function get_binding_group_value(group, __value, checked) {
        const value = new Set();
        for (let i = 0; i < group.length; i += 1) {
            if (group[i].checked)
                value.add(group[i].__value);
        }
        if (!checked) {
            value.delete(__value);
        }
        return Array.from(value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        const z_index = (parseInt(computed_style.zIndex) || 0) - 1;
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            `overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: ${z_index};`);
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
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
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
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
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
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
        flushing = false;
        seen_callbacks.clear();
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
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
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
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
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
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
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
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
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

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.6' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
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
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `string` starts with `search`
     * @param {string} string
     * @param {string} search
     * @return {boolean}
     */
    function startsWith(string, search) {
      return string.substr(0, search.length) === search;
    }

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Add the query to the pathname if a query is given
     * @param {string} pathname
     * @param {string} [query]
     * @return {string}
     */
    function addQuery(pathname, query) {
      return pathname + (query ? `?${query}` : "");
    }

    /**
     * Resolve URIs as though every path is a directory, no files. Relative URIs
     * in the browser can feel awkward because not only can you be "in a directory",
     * you can be "at a file", too. For example:
     *
     *  browserSpecResolve('foo', '/bar/') => /bar/foo
     *  browserSpecResolve('foo', '/bar') => /foo
     *
     * But on the command line of a file system, it's not as complicated. You can't
     * `cd` from a file, only directories. This way, links have to know less about
     * their current path. To go deeper you can do this:
     *
     *  <Link to="deeper"/>
     *  // instead of
     *  <Link to=`{${props.uri}/deeper}`/>
     *
     * Just like `cd`, if you want to go deeper from the command line, you do this:
     *
     *  cd deeper
     *  # not
     *  cd $(pwd)/deeper
     *
     * By treating every path as a directory, linking to relative paths should
     * require less contextual information and (fingers crossed) be more intuitive.
     * @param {string} to
     * @param {string} base
     * @return {string}
     */
    function resolve(to, base) {
      // /foo/bar, /baz/qux => /foo/bar
      if (startsWith(to, "/")) {
        return to;
      }

      const [toPathname, toQuery] = to.split("?");
      const [basePathname] = base.split("?");
      const toSegments = segmentize(toPathname);
      const baseSegments = segmentize(basePathname);

      // ?a=b, /users?b=c => /users?a=b
      if (toSegments[0] === "") {
        return addQuery(basePathname, toQuery);
      }

      // profile, /users/789 => /users/789/profile
      if (!startsWith(toSegments[0], ".")) {
        const pathname = baseSegments.concat(toSegments).join("/");

        return addQuery((basePathname === "/" ? "" : "/") + pathname, toQuery);
      }

      // ./       , /users/123 => /users/123
      // ../      , /users/123 => /users
      // ../..    , /users/123 => /
      // ../../one, /a/b/c/d   => /a/b/one
      // .././one , /a/b/c/d   => /a/b/c/one
      const allSegments = baseSegments.concat(toSegments);
      const segments = [];

      allSegments.forEach(segment => {
        if (segment === "..") {
          segments.pop();
        } else if (segment !== ".") {
          segments.push(segment);
        }
      });

      return addQuery("/" + segments.join("/"), toQuery);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /**
     * Decides whether a given `event` should result in a navigation or not.
     * @param {object} event
     */
    function shouldNavigate(event) {
      return (
        !event.defaultPrevented &&
        event.button === 0 &&
        !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
      );
    }

    /* node_modules\svelte-routing\src\Router.svelte generated by Svelte v3.29.6 */

    function create_fragment(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[5], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
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

    function instance($$self, $$props, $$invalidate) {
    	let $base;
    	let $location;
    	let $routes;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, ['default']);
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(10, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(9, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(8, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 256) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			 {
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 1536) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			 {
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [routes, location, base, basepath, url, $$scope, slots];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Route.svelte generated by Svelte v3.29.6 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 2,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[1],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 530) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[9], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[1],
    		/*routeProps*/ ctx[2]
    	];

    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 22)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 2 && get_spread_object(/*routeParams*/ ctx[1]),
    					dirty & /*routeProps*/ 4 && get_spread_object(/*routeProps*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
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
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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
    	let $activeRoute;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Route", slots, ['default']);
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(3, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(13, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(1, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(2, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 8) {
    			 if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(1, routeParams = $activeRoute.params);
    			}
    		}

    		 {
    			const { path, component, ...rest } = $$props;
    			$$invalidate(2, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		$$scope,
    		slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-routing\src\Link.svelte generated by Svelte v3.29.6 */
    const file = "node_modules\\svelte-routing\\src\\Link.svelte";

    function create_fragment$2(ctx) {
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	let a_levels = [
    		{ href: /*href*/ ctx[0] },
    		{ "aria-current": /*ariaCurrent*/ ctx[2] },
    		/*props*/ ctx[1]
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			if (default_slot) default_slot.c();
    			set_attributes(a, a_data);
    			add_location(a, file, 40, 0, 1249);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);

    			if (default_slot) {
    				default_slot.m(a, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*onClick*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1024) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[10], dirty, null, null);
    				}
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
    				(!current || dirty & /*ariaCurrent*/ 4) && { "aria-current": /*ariaCurrent*/ ctx[2] },
    				dirty & /*props*/ 2 && /*props*/ ctx[1]
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
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
    	let $base;
    	let $location;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Link", slots, ['default']);
    	let { to = "#" } = $$props;
    	let { replace = false } = $$props;
    	let { state = {} } = $$props;
    	let { getProps = () => ({}) } = $$props;
    	const { base } = getContext(ROUTER);
    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(14, $base = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(15, $location = value));
    	const dispatch = createEventDispatcher();
    	let href, isPartiallyCurrent, isCurrent, props;

    	function onClick(event) {
    		dispatch("click", event);

    		if (shouldNavigate(event)) {
    			event.preventDefault();

    			// Don't push another entry to the history stack when the user
    			// clicks on a Link to the page they are currently on.
    			const shouldReplace = $location.pathname === href || replace;

    			navigate(href, { state, replace: shouldReplace });
    		}
    	}

    	const writable_props = ["to", "replace", "state", "getProps"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Link> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		createEventDispatcher,
    		ROUTER,
    		LOCATION,
    		navigate,
    		startsWith,
    		resolve,
    		shouldNavigate,
    		to,
    		replace,
    		state,
    		getProps,
    		base,
    		location,
    		dispatch,
    		href,
    		isPartiallyCurrent,
    		isCurrent,
    		props,
    		onClick,
    		$base,
    		$location,
    		ariaCurrent
    	});

    	$$self.$inject_state = $$props => {
    		if ("to" in $$props) $$invalidate(6, to = $$props.to);
    		if ("replace" in $$props) $$invalidate(7, replace = $$props.replace);
    		if ("state" in $$props) $$invalidate(8, state = $$props.state);
    		if ("getProps" in $$props) $$invalidate(9, getProps = $$props.getProps);
    		if ("href" in $$props) $$invalidate(0, href = $$props.href);
    		if ("isPartiallyCurrent" in $$props) $$invalidate(12, isPartiallyCurrent = $$props.isPartiallyCurrent);
    		if ("isCurrent" in $$props) $$invalidate(13, isCurrent = $$props.isCurrent);
    		if ("props" in $$props) $$invalidate(1, props = $$props.props);
    		if ("ariaCurrent" in $$props) $$invalidate(2, ariaCurrent = $$props.ariaCurrent);
    	};

    	let ariaCurrent;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*to, $base*/ 16448) {
    			 $$invalidate(0, href = to === "/" ? $base.uri : resolve(to, $base.uri));
    		}

    		if ($$self.$$.dirty & /*$location, href*/ 32769) {
    			 $$invalidate(12, isPartiallyCurrent = startsWith($location.pathname, href));
    		}

    		if ($$self.$$.dirty & /*href, $location*/ 32769) {
    			 $$invalidate(13, isCurrent = href === $location.pathname);
    		}

    		if ($$self.$$.dirty & /*isCurrent*/ 8192) {
    			 $$invalidate(2, ariaCurrent = isCurrent ? "page" : undefined);
    		}

    		if ($$self.$$.dirty & /*getProps, $location, href, isPartiallyCurrent, isCurrent*/ 45569) {
    			 $$invalidate(1, props = getProps({
    				location: $location,
    				href,
    				isPartiallyCurrent,
    				isCurrent
    			}));
    		}
    	};

    	return [
    		href,
    		props,
    		ariaCurrent,
    		base,
    		location,
    		onClick,
    		to,
    		replace,
    		state,
    		getProps,
    		$$scope,
    		slots
    	];
    }

    class Link extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { to: 6, replace: 7, state: 8, getProps: 9 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Link",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get to() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get replace() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set replace(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get state() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set state(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getProps() {
    		throw new Error("<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getProps(value) {
    		throw new Error("<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\routes\Home.svelte generated by Svelte v3.29.6 */

    const file$1 = "src\\routes\\Home.svelte";

    function create_fragment$3(ctx) {
    	let h30;
    	let t1;
    	let section0;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let br;
    	let t3;
    	let img1;
    	let img1_src_value;
    	let t4;
    	let h31;
    	let strong;
    	let t6;
    	let h32;
    	let t8;
    	let section1;
    	let div1;
    	let img2;
    	let img2_src_value;
    	let t9;
    	let div2;
    	let img3;
    	let img3_src_value;
    	let t10;
    	let div3;
    	let img4;
    	let img4_src_value;
    	let t11;
    	let div4;
    	let img5;
    	let img5_src_value;
    	let t12;
    	let div5;
    	let img6;
    	let img6_src_value;
    	let t13;
    	let div6;
    	let img7;
    	let img7_src_value;
    	let t14;
    	let div7;
    	let img8;
    	let img8_src_value;
    	let t15;
    	let div8;
    	let img9;
    	let img9_src_value;
    	let t16;
    	let div9;
    	let img10;
    	let img10_src_value;
    	let t17;
    	let div10;
    	let img11;
    	let img11_src_value;
    	let t18;
    	let h33;
    	let t20;
    	let h34;

    	const block = {
    		c: function create() {
    			h30 = element("h3");
    			h30.textContent = "Add Quote from Author, funny or serious message, and make your own T-Shirt today!";
    			t1 = space();
    			section0 = element("section");
    			div0 = element("div");
    			img0 = element("img");
    			t2 = space();
    			br = element("br");
    			t3 = space();
    			img1 = element("img");
    			t4 = space();
    			h31 = element("h3");
    			strong = element("strong");
    			strong.textContent = "Custom T-Shirts";
    			t6 = space();
    			h32 = element("h3");
    			h32.textContent = "✔ Create Your Own  ✔ Different Styles & Colors   ✔ 1000+ Quotes   ✔ Personal message";
    			t8 = space();
    			section1 = element("section");
    			div1 = element("div");
    			img2 = element("img");
    			t9 = space();
    			div2 = element("div");
    			img3 = element("img");
    			t10 = space();
    			div3 = element("div");
    			img4 = element("img");
    			t11 = space();
    			div4 = element("div");
    			img5 = element("img");
    			t12 = space();
    			div5 = element("div");
    			img6 = element("img");
    			t13 = space();
    			div6 = element("div");
    			img7 = element("img");
    			t14 = space();
    			div7 = element("div");
    			img8 = element("img");
    			t15 = space();
    			div8 = element("div");
    			img9 = element("img");
    			t16 = space();
    			div9 = element("div");
    			img10 = element("img");
    			t17 = space();
    			div10 = element("div");
    			img11 = element("img");
    			t18 = space();
    			h33 = element("h3");
    			h33.textContent = "Custom t-shirts may seem like a small detail but they have the\r\n    power to turn your group into a team, to add the glue to a family reunion,\r\n    to express just what you wanted to say.\r\n     \r\n    We can’t wait for you to slip on a unique t-shirt!";
    			t20 = space();
    			h34 = element("h3");
    			h34.textContent = "Design Your Own T-Shirt at JoyfulQuotes";
    			attr_dev(h30, "class", "svelte-xzxjcp");
    			add_location(h30, file$1, 47, 0, 772);
    			if (img0.src !== (img0_src_value = "../../../build/images/tshirt.jpg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "tshirt with custom text");
    			add_location(img0, file$1, 52, 4, 896);
    			add_location(br, file$1, 55, 4, 987);
    			if (img1.src !== (img1_src_value = "../../../build/images/quote10.jpg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Quotes text");
    			add_location(img1, file$1, 57, 4, 1003);
    			add_location(div0, file$1, 50, 3, 880);
    			add_location(section0, file$1, 49, 0, 866);
    			add_location(strong, file$1, 64, 4, 1123);
    			attr_dev(h31, "class", "svelte-xzxjcp");
    			add_location(h31, file$1, 64, 0, 1119);
    			attr_dev(h32, "class", "svelte-xzxjcp");
    			add_location(h32, file$1, 66, 0, 1165);
    			if (img2.src !== (img2_src_value = "../../../build/images/quote2.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Quote template1");
    			attr_dev(img2, "class", "svelte-xzxjcp");
    			add_location(img2, file$1, 73, 28, 1454);
    			attr_dev(div1, "class", "svelte-xzxjcp");
    			add_location(div1, file$1, 72, 24, 1419);
    			if (img3.src !== (img3_src_value = "../../../build/images/quote3.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Quote template2");
    			attr_dev(img3, "class", "svelte-xzxjcp");
    			add_location(img3, file$1, 79, 28, 1699);
    			attr_dev(div2, "class", "svelte-xzxjcp");
    			add_location(div2, file$1, 78, 24, 1664);
    			if (img4.src !== (img4_src_value = "../../../build/images/image2.jpeg")) attr_dev(img4, "src", img4_src_value);
    			attr_dev(img4, "alt", "Quote template3");
    			attr_dev(img4, "class", "svelte-xzxjcp");
    			add_location(img4, file$1, 85, 28, 1943);
    			attr_dev(div3, "class", "svelte-xzxjcp");
    			add_location(div3, file$1, 84, 24, 1908);
    			if (img5.src !== (img5_src_value = "../../../build/images/quote4.png")) attr_dev(img5, "src", img5_src_value);
    			attr_dev(img5, "alt", "Quote template4");
    			attr_dev(img5, "class", "svelte-xzxjcp");
    			add_location(img5, file$1, 91, 28, 2187);
    			attr_dev(div4, "class", "svelte-xzxjcp");
    			add_location(div4, file$1, 90, 23, 2152);
    			if (img6.src !== (img6_src_value = "../../../build/images/image5.png")) attr_dev(img6, "src", img6_src_value);
    			attr_dev(img6, "alt", "Quote template5");
    			attr_dev(img6, "class", "svelte-xzxjcp");
    			add_location(img6, file$1, 97, 28, 2431);
    			attr_dev(div5, "class", "svelte-xzxjcp");
    			add_location(div5, file$1, 96, 24, 2396);
    			if (img7.src !== (img7_src_value = "../../../build/images/image6.png")) attr_dev(img7, "src", img7_src_value);
    			attr_dev(img7, "alt", "Quote template6");
    			attr_dev(img7, "class", "svelte-xzxjcp");
    			add_location(img7, file$1, 103, 28, 2651);
    			attr_dev(div6, "class", "svelte-xzxjcp");
    			add_location(div6, file$1, 102, 24, 2616);
    			if (img8.src !== (img8_src_value = "../../../build/images/quote1.png")) attr_dev(img8, "src", img8_src_value);
    			attr_dev(img8, "alt", "Quote template7");
    			attr_dev(img8, "class", "svelte-xzxjcp");
    			add_location(img8, file$1, 109, 28, 2871);
    			attr_dev(div7, "class", "svelte-xzxjcp");
    			add_location(div7, file$1, 108, 24, 2836);
    			if (img9.src !== (img9_src_value = "../../../build/images/quote12.png")) attr_dev(img9, "src", img9_src_value);
    			attr_dev(img9, "alt", "Quote template8");
    			attr_dev(img9, "class", "svelte-xzxjcp");
    			add_location(img9, file$1, 114, 28, 3089);
    			attr_dev(div8, "class", "svelte-xzxjcp");
    			add_location(div8, file$1, 113, 24, 3054);
    			if (img10.src !== (img10_src_value = "../../../build/images/quote13.png")) attr_dev(img10, "src", img10_src_value);
    			attr_dev(img10, "alt", "Quote template9");
    			attr_dev(img10, "class", "svelte-xzxjcp");
    			add_location(img10, file$1, 120, 28, 3310);
    			attr_dev(div9, "class", "svelte-xzxjcp");
    			add_location(div9, file$1, 119, 24, 3275);
    			if (img11.src !== (img11_src_value = "../../../build/images/quote11.png")) attr_dev(img11, "src", img11_src_value);
    			attr_dev(img11, "alt", "Quote template10");
    			attr_dev(img11, "class", "svelte-xzxjcp");
    			add_location(img11, file$1, 126, 28, 3531);
    			attr_dev(div10, "class", "svelte-xzxjcp");
    			add_location(div10, file$1, 125, 24, 3496);
    			attr_dev(section1, "class", "One svelte-xzxjcp");
    			add_location(section1, file$1, 70, 16, 1339);
    			attr_dev(h33, "class", "svelte-xzxjcp");
    			add_location(h33, file$1, 135, 4, 3788);
    			attr_dev(h34, "class", "svelte-xzxjcp");
    			add_location(h34, file$1, 142, 4, 4077);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h30, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, section0, anchor);
    			append_dev(section0, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t2);
    			append_dev(div0, br);
    			append_dev(div0, t3);
    			append_dev(div0, img1);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, h31, anchor);
    			append_dev(h31, strong);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, h32, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div1);
    			append_dev(div1, img2);
    			append_dev(section1, t9);
    			append_dev(section1, div2);
    			append_dev(div2, img3);
    			append_dev(section1, t10);
    			append_dev(section1, div3);
    			append_dev(div3, img4);
    			append_dev(section1, t11);
    			append_dev(section1, div4);
    			append_dev(div4, img5);
    			append_dev(section1, t12);
    			append_dev(section1, div5);
    			append_dev(div5, img6);
    			append_dev(section1, t13);
    			append_dev(section1, div6);
    			append_dev(div6, img7);
    			append_dev(section1, t14);
    			append_dev(section1, div7);
    			append_dev(div7, img8);
    			append_dev(section1, t15);
    			append_dev(section1, div8);
    			append_dev(div8, img9);
    			append_dev(section1, t16);
    			append_dev(section1, div9);
    			append_dev(div9, img10);
    			append_dev(section1, t17);
    			append_dev(section1, div10);
    			append_dev(div10, img11);
    			insert_dev(target, t18, anchor);
    			insert_dev(target, h33, anchor);
    			insert_dev(target, t20, anchor);
    			insert_dev(target, h34, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h30);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(h31);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(h32);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(section1);
    			if (detaching) detach_dev(t18);
    			if (detaching) detach_dev(h33);
    			if (detaching) detach_dev(t20);
    			if (detaching) detach_dev(h34);
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

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\routes\QuoteAuthor.svelte generated by Svelte v3.29.6 */

    const { console: console_1 } = globals;
    const file$2 = "src\\routes\\QuoteAuthor.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>      import { Router, Link, Route }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script>      import { Router, Link, Route }",
    		ctx
    	});

    	return block;
    }

    // (25:0) {:then quotesdata}
    function create_then_block(ctx) {
    	let ul;
    	let h1;
    	let t1;
    	let current;
    	let each_value = /*quotesdata*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			h1 = element("h1");
    			h1.textContent = "Quotes by Author Name";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$2, 26, 4, 569);
    			attr_dev(ul, "class", "svelte-9r39p8");
    			add_location(ul, file$2, 25, 4, 559);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, h1);
    			append_dev(ul, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*quotesPromise*/ 1) {
    				each_value = /*quotesdata*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
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
    			if (current) return;

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
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(25:0) {:then quotesdata}",
    		ctx
    	});

    	return block;
    }

    // (31:12) <Link to="/quotemessage/{quotedata.quoteAuthor}">
    function create_default_slot(ctx) {
    	let t_value = /*quotedata*/ ctx[2].quoteAuthor + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(31:12) <Link to=\\\"/quotemessage/{quotedata.quoteAuthor}\\\">",
    		ctx
    	});

    	return block;
    }

    // (29:4) {#each quotesdata as quotedata}
    function create_each_block(ctx) {
    	let li;
    	let link;
    	let t;
    	let current;

    	link = new Link({
    			props: {
    				to: "/quotemessage/" + /*quotedata*/ ctx[2].quoteAuthor,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(link.$$.fragment);
    			t = space();
    			attr_dev(li, "class", "svelte-9r39p8");
    			add_location(li, file$2, 29, 8, 659);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(link, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(29:4) {#each quotesdata as quotedata}",
    		ctx
    	});

    	return block;
    }

    // (23:22)       <h1>Loading all Quote Author....</h1>  {:then quotesdata}
    function create_pending_block(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Loading all Quote Author....";
    			add_location(h1, file$2, 23, 4, 496);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(23:22)       <h1>Loading all Quote Author....</h1>  {:then quotesdata}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 1,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*quotesPromise*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[1] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
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

    async function getQuotes() {
    	const response = await fetch("https://quote-garden.herokuapp.com/api/v2/quotes?page=1&limit=50");
    	const data = await response.json();
    	console.log(data.quotes);
    	return data.quotes;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("QuoteAuthor", slots, []);
    	let quotesPromise = getQuotes();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<QuoteAuthor> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router,
    		Link,
    		Route,
    		getQuotes,
    		quotesPromise
    	});

    	$$self.$inject_state = $$props => {
    		if ("quotesPromise" in $$props) $$invalidate(0, quotesPromise = $$props.quotesPromise);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [quotesPromise];
    }

    class QuoteAuthor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "QuoteAuthor",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\routes\Modal.svelte generated by Svelte v3.29.6 */
    const file$3 = "src\\routes\\Modal.svelte";
    const get_header_slot_changes = dirty => ({});
    const get_header_slot_context = ctx => ({});

    function create_fragment$5(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let hr0;
    	let t2;
    	let t3;
    	let hr1;
    	let t4;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const header_slot_template = /*#slots*/ ctx[4].header;
    	const header_slot = create_slot(header_slot_template, ctx, /*$$scope*/ ctx[3], get_header_slot_context);
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			if (header_slot) header_slot.c();
    			t1 = space();
    			hr0 = element("hr");
    			t2 = space();
    			if (default_slot) default_slot.c();
    			t3 = space();
    			hr1 = element("hr");
    			t4 = space();
    			button = element("button");
    			button.textContent = "close";
    			attr_dev(div0, "class", "modal-background svelte-21rqof");
    			add_location(div0, file$3, 41, 0, 931);
    			add_location(hr0, file$3, 49, 1, 1102);
    			add_location(hr1, file$3, 52, 1, 1127);
    			attr_dev(button, "class", "svelte-21rqof");
    			add_location(button, file$3, 55, 1, 1140);
    			attr_dev(div1, "class", "modal svelte-21rqof");
    			attr_dev(div1, "role", "dialog");
    			attr_dev(div1, "aria-modal", "true");
    			add_location(div1, file$3, 45, 0, 994);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);

    			if (header_slot) {
    				header_slot.m(div1, null);
    			}

    			append_dev(div1, t1);
    			append_dev(div1, hr0);
    			append_dev(div1, t2);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			append_dev(div1, t3);
    			append_dev(div1, hr1);
    			append_dev(div1, t4);
    			append_dev(div1, button);
    			/*div1_binding*/ ctx[5](div1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window, "keydown", /*handle_keydown*/ ctx[2], false, false, false),
    					listen_dev(div0, "click", /*close*/ ctx[1], false, false, false),
    					listen_dev(button, "click", /*close*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (header_slot) {
    				if (header_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(header_slot, header_slot_template, ctx, /*$$scope*/ ctx[3], dirty, get_header_slot_changes, get_header_slot_context);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header_slot, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header_slot, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			if (header_slot) header_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    			/*div1_binding*/ ctx[5](null);
    			mounted = false;
    			run_all(dispose);
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
    	validate_slots("Modal", slots, ['header','default']);
    	const dispatch = createEventDispatcher();
    	const close = () => dispatch("close");
    	let modal;

    	const handle_keydown = e => {
    		if (e.key === "Escape") {
    			close();
    			return;
    		}

    		if (e.key === "Tab") {
    			// trap focus
    			const nodes = modal.querySelectorAll("*");

    			const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0);
    			let index = tabbable.indexOf(document.activeElement);
    			if (index === -1 && e.shiftKey) index = 0;
    			index += tabbable.length + (e.shiftKey ? -1 : 1);
    			index %= tabbable.length;
    			tabbable[index].focus();
    			e.preventDefault();
    		}
    	};

    	const previously_focused = typeof document !== "undefined" && document.activeElement;

    	if (previously_focused) {
    		onDestroy(() => {
    			previously_focused.focus();
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			modal = $$value;
    			$$invalidate(0, modal);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onDestroy,
    		dispatch,
    		close,
    		modal,
    		handle_keydown,
    		previously_focused
    	});

    	$$self.$inject_state = $$props => {
    		if ("modal" in $$props) $$invalidate(0, modal = $$props.modal);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [modal, close, handle_keydown, $$scope, slots, div1_binding];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const yourMessage = writable(''); 

    const authorMessage = writable('');

    const genreMessage = writable('');

    /* src\routes\QuoteMessage.svelte generated by Svelte v3.29.6 */

    const { console: console_1$1 } = globals;
    const file$4 = "src\\routes\\QuoteMessage.svelte";

    // (1:0)  <script>      import { Router, Link, Route }
    function create_catch_block$1(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(1:0)  <script>      import { Router, Link, Route }",
    		ctx
    	});

    	return block;
    }

    // (79:0) {:then selectquotes}
    function create_then_block$1(ctx) {
    	let ul;
    	let h20;
    	let t0;
    	let html_tag;
    	let t1;
    	let p;
    	let t2;
    	let t3_value = /*currentQuote*/ ctx[2] + 1 + "";
    	let t3;
    	let t4;
    	let t5_value = /*selectquotes*/ ctx[16].length + "";
    	let t5;
    	let t6;
    	let h1;
    	let raw1_value = /*selectquotes*/ ctx[16][/*currentQuote*/ ctx[2]].quoteText + "";
    	let t7;
    	let h21;
    	let t9;
    	let button0;
    	let t11;
    	let button1;
    	let br;
    	let t13;
    	let button2;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[8](/*selectquotes*/ ctx[16]);
    	}

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[9](/*selectquotes*/ ctx[16]);
    	}

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[10](/*selectquotes*/ ctx[16]);
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			h20 = element("h2");
    			t0 = text("Quotes by ");
    			t1 = space();
    			p = element("p");
    			t2 = text("Quote ");
    			t3 = text(t3_value);
    			t4 = text("/");
    			t5 = text(t5_value);
    			t6 = space();
    			h1 = element("h1");
    			t7 = space();
    			h21 = element("h2");
    			h21.textContent = "The Quote you select will be printed on your T-Shirt";
    			t9 = space();
    			button0 = element("button");
    			button0.textContent = "Previous Quote";
    			t11 = space();
    			button1 = element("button");
    			button1.textContent = "Next Quote";
    			br = element("br");
    			t13 = space();
    			button2 = element("button");
    			button2.textContent = "Select the quote";
    			html_tag = new HtmlTag(null);
    			attr_dev(h20, "class", "svelte-t3u5ap");
    			add_location(h20, file$4, 81, 8, 1720);
    			attr_dev(p, "class", "svelte-t3u5ap");
    			add_location(p, file$4, 82, 8, 1767);
    			attr_dev(h1, "class", "svelte-t3u5ap");
    			add_location(h1, file$4, 84, 8, 1838);
    			attr_dev(h21, "class", "svelte-t3u5ap");
    			add_location(h21, file$4, 86, 8, 1915);
    			attr_dev(button0, "class", "svelte-t3u5ap");
    			add_location(button0, file$4, 88, 8, 1999);
    			attr_dev(button1, "class", "svelte-t3u5ap");
    			add_location(button1, file$4, 89, 8, 2090);
    			add_location(br, file$4, 89, 81, 2163);
    			attr_dev(button2, "class", "svelte-t3u5ap");
    			add_location(button2, file$4, 91, 8, 2187);
    			add_location(ul, file$4, 80, 4, 1706);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, h20);
    			append_dev(h20, t0);
    			html_tag.m(/*authorName*/ ctx[0], h20);
    			append_dev(ul, t1);
    			append_dev(ul, p);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(ul, t6);
    			append_dev(ul, h1);
    			h1.innerHTML = raw1_value;
    			append_dev(ul, t7);
    			append_dev(ul, h21);
    			append_dev(ul, t9);
    			append_dev(ul, button0);
    			append_dev(ul, t11);
    			append_dev(ul, button1);
    			append_dev(ul, br);
    			append_dev(ul, t13);
    			append_dev(ul, button2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler, false, false, false),
    					listen_dev(button1, "click", click_handler_1, false, false, false),
    					listen_dev(button2, "click", click_handler_2, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*authorName*/ 1) html_tag.p(/*authorName*/ ctx[0]);
    			if (dirty & /*currentQuote*/ 4 && t3_value !== (t3_value = /*currentQuote*/ ctx[2] + 1 + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*currentQuote*/ 4 && raw1_value !== (raw1_value = /*selectquotes*/ ctx[16][/*currentQuote*/ ctx[2]].quoteText + "")) h1.innerHTML = raw1_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(79:0) {:then selectquotes}",
    		ctx
    	});

    	return block;
    }

    // (77:21)   <h1>Joyful Quotes</h1>  {:then selectquotes}
    function create_pending_block$1(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Joyful Quotes";
    			attr_dev(h1, "class", "svelte-t3u5ap");
    			add_location(h1, file$4, 77, 0, 1651);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(77:21)   <h1>Joyful Quotes</h1>  {:then selectquotes}",
    		ctx
    	});

    	return block;
    }

    // (102:4) {#if showModal}
    function create_if_block$1(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modal.$on("close", /*close_handler*/ ctx[12]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty & /*$$scope, printQuote*/ 131080) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(102:4) {#if showModal}",
    		ctx
    	});

    	return block;
    }

    // (105:20) <Link to="/order">
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Order");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(105:20) <Link to=\\\"/order\\\">",
    		ctx
    	});

    	return block;
    }

    // (103:8) <Modal on:close="{() => showModal = false}">
    function create_default_slot$1(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let button;
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				to: "/order",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(/*printQuote*/ ctx[3]);
    			t1 = space();
    			button = element("button");
    			create_component(link.$$.fragment);
    			attr_dev(div, "class", "svelte-t3u5ap");
    			add_location(div, file$4, 103, 12, 2499);
    			attr_dev(button, "class", "svelte-t3u5ap");
    			add_location(button, file$4, 104, 12, 2537);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);
    			mount_component(link, button, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*printQuote*/ 8) set_data_dev(t0, /*printQuote*/ ctx[3]);
    			const link_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			destroy_component(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(103:8) <Modal on:close=\\\"{() => showModal = false}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let promise;
    	let t0;
    	let button;
    	let t2;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 16
    	};

    	handle_promise(promise = /*loadQuotes*/ ctx[4](), info);
    	let if_block = /*showModal*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			info.block.c();
    			t0 = space();
    			button = element("button");
    			button.textContent = "Next";
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(button, "class", "svelte-t3u5ap");
    			add_location(button, file$4, 97, 4, 2330);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => t0.parentNode;
    			info.anchor = t0;
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_3*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[16] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			if (/*showModal*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showModal*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
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
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
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
    	let $yourMessage;
    	let $genreMessage;
    	validate_store(yourMessage, "yourMessage");
    	component_subscribe($$self, yourMessage, $$value => $$invalidate(13, $yourMessage = $$value));
    	validate_store(genreMessage, "genreMessage");
    	component_subscribe($$self, genreMessage, $$value => $$invalidate(14, $genreMessage = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("QuoteMessage", slots, []);
    	let showModal = false;
    	let { authorName } = $$props;
    	let currentQuote = 0;
    	let printQuote = "";

    	function updateMessage() {
    		authorMessage.update(currentvalue => currentvalue = printQuote);
    	}

    	async function loadQuotes() {
    		const response = await fetch("https://quote-garden.herokuapp.com/api/v2/authors/" + authorName + "?");
    		const data = await response.json();
    		console.log(data);
    		return data.quotes;
    	}

    	function nextQuote(quoteslength) {
    		if (currentQuote < quoteslength - 1) {
    			$$invalidate(2, currentQuote++, currentQuote);
    		}
    	}

    	function previousQuote(quoteslength) {
    		if (currentQuote != 0) {
    			$$invalidate(2, currentQuote--, currentQuote);
    		}
    	}

    	function quoteSelected(print) {
    		$$invalidate(3, printQuote = print);
    		set_store_value(yourMessage, $yourMessage = "", $yourMessage);
    		set_store_value(genreMessage, $genreMessage = "", $genreMessage);
    		updateMessage();
    	}

    	const writable_props = ["authorName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<QuoteMessage> was created with unknown prop '${key}'`);
    	});

    	const click_handler = selectquotes => previousQuote(selectquotes.length);
    	const click_handler_1 = selectquotes => nextQuote(selectquotes.length);
    	const click_handler_2 = selectquotes => quoteSelected(selectquotes[currentQuote].quoteText);
    	const click_handler_3 = () => $$invalidate(1, showModal = true);
    	const close_handler = () => $$invalidate(1, showModal = false);

    	$$self.$$set = $$props => {
    		if ("authorName" in $$props) $$invalidate(0, authorName = $$props.authorName);
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		Link,
    		Route,
    		Modal,
    		authorMessage,
    		yourMessage,
    		genreMessage,
    		showModal,
    		authorName,
    		currentQuote,
    		printQuote,
    		updateMessage,
    		loadQuotes,
    		nextQuote,
    		previousQuote,
    		quoteSelected,
    		$yourMessage,
    		$genreMessage
    	});

    	$$self.$inject_state = $$props => {
    		if ("showModal" in $$props) $$invalidate(1, showModal = $$props.showModal);
    		if ("authorName" in $$props) $$invalidate(0, authorName = $$props.authorName);
    		if ("currentQuote" in $$props) $$invalidate(2, currentQuote = $$props.currentQuote);
    		if ("printQuote" in $$props) $$invalidate(3, printQuote = $$props.printQuote);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		authorName,
    		showModal,
    		currentQuote,
    		printQuote,
    		loadQuotes,
    		nextQuote,
    		previousQuote,
    		quoteSelected,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		close_handler
    	];
    }

    class QuoteMessage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { authorName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "QuoteMessage",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*authorName*/ ctx[0] === undefined && !("authorName" in props)) {
    			console_1$1.warn("<QuoteMessage> was created without expected prop 'authorName'");
    		}
    	}

    	get authorName() {
    		throw new Error("<QuoteMessage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set authorName(value) {
    		throw new Error("<QuoteMessage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\routes\QuoteGenre.svelte generated by Svelte v3.29.6 */

    const { console: console_1$2 } = globals;
    const file$5 = "src\\routes\\QuoteGenre.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (1:0) <script>      import { Router, Link, Route }
    function create_catch_block$2(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$2.name,
    		type: "catch",
    		source: "(1:0) <script>      import { Router, Link, Route }",
    		ctx
    	});

    	return block;
    }

    // (24:0) {:then quotesdata}
    function create_then_block$2(ctx) {
    	let ul;
    	let h1;
    	let t1;
    	let current;
    	let each_value = /*quotesdata*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			h1 = element("h1");
    			h1.textContent = "Quotes by Genre";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$5, 25, 4, 541);
    			attr_dev(ul, "class", "svelte-1v4jbks");
    			add_location(ul, file$5, 24, 0, 529);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, h1);
    			append_dev(ul, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*quotesPromise*/ 1) {
    				each_value = /*quotesdata*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(ul, null);
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
    			if (current) return;

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
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$2.name,
    		type: "then",
    		source: "(24:0) {:then quotesdata}",
    		ctx
    	});

    	return block;
    }

    // (30:13) <Link to="/quotegenremessage/{genre}">
    function create_default_slot$2(ctx) {
    	let t_value = /*genre*/ ctx[2] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(30:13) <Link to=\\\"/quotegenremessage/{genre}\\\">",
    		ctx
    	});

    	return block;
    }

    // (28:0) {#each quotesdata as genre}
    function create_each_block$1(ctx) {
    	let li;
    	let link;
    	let t;
    	let current;

    	link = new Link({
    			props: {
    				to: "/quotegenremessage/" + /*genre*/ ctx[2],
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			li = element("li");
    			create_component(link.$$.fragment);
    			t = space();
    			attr_dev(li, "class", "svelte-1v4jbks");
    			add_location(li, file$5, 28, 8, 609);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(link, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link_changes = {};

    			if (dirty & /*$$scope*/ 32) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(28:0) {#each quotesdata as genre}",
    		ctx
    	});

    	return block;
    }

    // (22:22)       <h1>Loading all Genres....</h1>  {:then quotesdata}
    function create_pending_block$2(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Loading all Genres....";
    			add_location(h1, file$5, 22, 4, 476);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$2.name,
    		type: "pending",
    		source: "(22:22)       <h1>Loading all Genres....</h1>  {:then quotesdata}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block$2,
    		then: create_then_block$2,
    		catch: create_catch_block$2,
    		value: 1,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*quotesPromise*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[1] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
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

    async function getQuotes$1() {
    	const response = await fetch("https://quote-garden.herokuapp.com/api/v2/genres/");
    	const data = await response.json();
    	console.log(data.quotes);
    	return data.genres;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("QuoteGenre", slots, []);
    	let quotesPromise = getQuotes$1();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<QuoteGenre> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Router,
    		Link,
    		Route,
    		getQuotes: getQuotes$1,
    		quotesPromise
    	});

    	$$self.$inject_state = $$props => {
    		if ("quotesPromise" in $$props) $$invalidate(0, quotesPromise = $$props.quotesPromise);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [quotesPromise];
    }

    class QuoteGenre extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "QuoteGenre",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src\routes\QuoteGenreMessage.svelte generated by Svelte v3.29.6 */

    const { console: console_1$3 } = globals;
    const file$6 = "src\\routes\\QuoteGenreMessage.svelte";

    // (1:0) <script>      import { Router, Link, Route }
    function create_catch_block$3(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$3.name,
    		type: "catch",
    		source: "(1:0) <script>      import { Router, Link, Route }",
    		ctx
    	});

    	return block;
    }

    // (78:0) {:then selectquotes}
    function create_then_block$3(ctx) {
    	let ul;
    	let h20;
    	let t0;
    	let html_tag;
    	let t1;
    	let p;
    	let t2;
    	let t3_value = /*currentQuote*/ ctx[2] + 1 + "";
    	let t3;
    	let t4;
    	let t5_value = /*selectquotes*/ ctx[16].length + "";
    	let t5;
    	let t6;
    	let h1;
    	let raw1_value = /*selectquotes*/ ctx[16][/*currentQuote*/ ctx[2]].quoteText + "";
    	let t7;
    	let button0;
    	let t9;
    	let button1;
    	let br;
    	let t11;
    	let button2;
    	let t13;
    	let h21;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[8](/*selectquotes*/ ctx[16]);
    	}

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[9](/*selectquotes*/ ctx[16]);
    	}

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[10](/*selectquotes*/ ctx[16]);
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");
    			h20 = element("h2");
    			t0 = text("Quotes by ");
    			t1 = space();
    			p = element("p");
    			t2 = text("Quote ");
    			t3 = text(t3_value);
    			t4 = text("/");
    			t5 = text(t5_value);
    			t6 = space();
    			h1 = element("h1");
    			t7 = space();
    			button0 = element("button");
    			button0.textContent = "Previous Quote";
    			t9 = space();
    			button1 = element("button");
    			button1.textContent = "Next Quote";
    			br = element("br");
    			t11 = space();
    			button2 = element("button");
    			button2.textContent = "Select the quote";
    			t13 = space();
    			h21 = element("h2");
    			h21.textContent = "Your Quote will be printed on your T-Shirt";
    			html_tag = new HtmlTag(null);
    			attr_dev(h20, "class", "svelte-nsvox");
    			add_location(h20, file$6, 80, 8, 1711);
    			attr_dev(p, "class", "svelte-nsvox");
    			add_location(p, file$6, 81, 8, 1757);
    			attr_dev(h1, "class", "svelte-nsvox");
    			add_location(h1, file$6, 83, 8, 1828);
    			attr_dev(button0, "class", "svelte-nsvox");
    			add_location(button0, file$6, 85, 8, 1899);
    			attr_dev(button1, "class", "svelte-nsvox");
    			add_location(button1, file$6, 86, 8, 1990);
    			add_location(br, file$6, 86, 81, 2063);
    			attr_dev(button2, "class", "svelte-nsvox");
    			add_location(button2, file$6, 88, 8, 2087);
    			add_location(ul, file$6, 79, 4, 1697);
    			attr_dev(h21, "class", "svelte-nsvox");
    			add_location(h21, file$6, 91, 3, 2206);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);
    			append_dev(ul, h20);
    			append_dev(h20, t0);
    			html_tag.m(/*genreName*/ ctx[0], h20);
    			append_dev(ul, t1);
    			append_dev(ul, p);
    			append_dev(p, t2);
    			append_dev(p, t3);
    			append_dev(p, t4);
    			append_dev(p, t5);
    			append_dev(ul, t6);
    			append_dev(ul, h1);
    			h1.innerHTML = raw1_value;
    			append_dev(ul, t7);
    			append_dev(ul, button0);
    			append_dev(ul, t9);
    			append_dev(ul, button1);
    			append_dev(ul, br);
    			append_dev(ul, t11);
    			append_dev(ul, button2);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, h21, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", click_handler, false, false, false),
    					listen_dev(button1, "click", click_handler_1, false, false, false),
    					listen_dev(button2, "click", click_handler_2, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*genreName*/ 1) html_tag.p(/*genreName*/ ctx[0]);
    			if (dirty & /*currentQuote*/ 4 && t3_value !== (t3_value = /*currentQuote*/ ctx[2] + 1 + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*currentQuote*/ 4 && raw1_value !== (raw1_value = /*selectquotes*/ ctx[16][/*currentQuote*/ ctx[2]].quoteText + "")) h1.innerHTML = raw1_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(h21);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$3.name,
    		type: "then",
    		source: "(78:0) {:then selectquotes}",
    		ctx
    	});

    	return block;
    }

    // (76:21)   <h1>Joyful Quotes</h1>  {:then selectquotes}
    function create_pending_block$3(ctx) {
    	let h1;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Joyful Quotes";
    			attr_dev(h1, "class", "svelte-nsvox");
    			add_location(h1, file$6, 76, 0, 1642);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$3.name,
    		type: "pending",
    		source: "(76:21)   <h1>Joyful Quotes</h1>  {:then selectquotes}",
    		ctx
    	});

    	return block;
    }

    // (101:0) {#if showModal}
    function create_if_block$2(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modal.$on("close", /*close_handler*/ ctx[12]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty & /*$$scope, printQuote*/ 131080) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(101:0) {#if showModal}",
    		ctx
    	});

    	return block;
    }

    // (104:16) <Link to="/order">
    function create_default_slot_1$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Order");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(104:16) <Link to=\\\"/order\\\">",
    		ctx
    	});

    	return block;
    }

    // (102:4) <Modal on:close="{() => showModal = false}">
    function create_default_slot$3(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let button;
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				to: "/order",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(/*printQuote*/ ctx[3]);
    			t1 = space();
    			button = element("button");
    			create_component(link.$$.fragment);
    			attr_dev(div, "class", "svelte-nsvox");
    			add_location(div, file$6, 102, 8, 2427);
    			attr_dev(button, "class", "svelte-nsvox");
    			add_location(button, file$6, 103, 8, 2461);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button, anchor);
    			mount_component(link, button, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*printQuote*/ 8) set_data_dev(t0, /*printQuote*/ ctx[3]);
    			const link_changes = {};

    			if (dirty & /*$$scope*/ 131072) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button);
    			destroy_component(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(102:4) <Modal on:close=\\\"{() => showModal = false}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let promise;
    	let t0;
    	let button;
    	let t2;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block$3,
    		then: create_then_block$3,
    		catch: create_catch_block$3,
    		value: 16
    	};

    	handle_promise(promise = /*loadQuotes*/ ctx[4](), info);
    	let if_block = /*showModal*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			info.block.c();
    			t0 = space();
    			button = element("button");
    			button.textContent = "Next";
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			attr_dev(button, "class", "svelte-nsvox");
    			add_location(button, file$6, 96, 0, 2282);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => t0.parentNode;
    			info.anchor = t0;
    			insert_dev(target, t0, anchor);
    			insert_dev(target, button, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_3*/ ctx[11], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			{
    				const child_ctx = ctx.slice();
    				child_ctx[16] = info.resolved;
    				info.block.p(child_ctx, dirty);
    			}

    			if (/*showModal*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showModal*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
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
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t2);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
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

    function instance$8($$self, $$props, $$invalidate) {
    	let $yourMessage;
    	let $authorMessage;
    	validate_store(yourMessage, "yourMessage");
    	component_subscribe($$self, yourMessage, $$value => $$invalidate(13, $yourMessage = $$value));
    	validate_store(authorMessage, "authorMessage");
    	component_subscribe($$self, authorMessage, $$value => $$invalidate(14, $authorMessage = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("QuoteGenreMessage", slots, []);
    	let showModal = false;
    	let { genreName } = $$props;
    	let currentQuote = 0;
    	let printQuote = "";

    	function updateMessage() {
    		genreMessage.update(currentvalue => currentvalue = printQuote);
    	}

    	async function loadQuotes() {
    		const response = await fetch("https://quote-garden.herokuapp.com/api/v2/genres/" + genreName + "?");
    		const data = await response.json();
    		console.log(data);
    		return data.quotes;
    	}

    	function nextQuote(quoteslength) {
    		if (currentQuote < quoteslength - 1) {
    			$$invalidate(2, currentQuote++, currentQuote);
    		}
    	}

    	function previousQuote(quoteslength) {
    		if (currentQuote != 0) {
    			$$invalidate(2, currentQuote--, currentQuote);
    		}
    	}

    	function quoteSelected(print) {
    		$$invalidate(3, printQuote = print);
    		set_store_value(yourMessage, $yourMessage = "", $yourMessage);
    		set_store_value(authorMessage, $authorMessage = "", $authorMessage);
    		updateMessage();
    	}

    	const writable_props = ["genreName"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<QuoteGenreMessage> was created with unknown prop '${key}'`);
    	});

    	const click_handler = selectquotes => previousQuote(selectquotes.length);
    	const click_handler_1 = selectquotes => nextQuote(selectquotes.length);
    	const click_handler_2 = selectquotes => quoteSelected(selectquotes[currentQuote].quoteText);
    	const click_handler_3 = () => $$invalidate(1, showModal = true);
    	const close_handler = () => $$invalidate(1, showModal = false);

    	$$self.$$set = $$props => {
    		if ("genreName" in $$props) $$invalidate(0, genreName = $$props.genreName);
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		Link,
    		Route,
    		Modal,
    		genreMessage,
    		yourMessage,
    		authorMessage,
    		showModal,
    		genreName,
    		currentQuote,
    		printQuote,
    		updateMessage,
    		loadQuotes,
    		nextQuote,
    		previousQuote,
    		quoteSelected,
    		$yourMessage,
    		$authorMessage
    	});

    	$$self.$inject_state = $$props => {
    		if ("showModal" in $$props) $$invalidate(1, showModal = $$props.showModal);
    		if ("genreName" in $$props) $$invalidate(0, genreName = $$props.genreName);
    		if ("currentQuote" in $$props) $$invalidate(2, currentQuote = $$props.currentQuote);
    		if ("printQuote" in $$props) $$invalidate(3, printQuote = $$props.printQuote);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		genreName,
    		showModal,
    		currentQuote,
    		printQuote,
    		loadQuotes,
    		nextQuote,
    		previousQuote,
    		quoteSelected,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		close_handler
    	];
    }

    class QuoteGenreMessage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { genreName: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "QuoteGenreMessage",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*genreName*/ ctx[0] === undefined && !("genreName" in props)) {
    			console_1$3.warn("<QuoteGenreMessage> was created without expected prop 'genreName'");
    		}
    	}

    	get genreName() {
    		throw new Error("<QuoteGenreMessage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set genreName(value) {
    		throw new Error("<QuoteGenreMessage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\routes\PersonalMessage.svelte generated by Svelte v3.29.6 */
    const file$7 = "src\\routes\\PersonalMessage.svelte";

    // (65:0) {#if showModal}
    function create_if_block$3(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				$$slots: { default: [create_default_slot$4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modal.$on("close", /*close_handler*/ ctx[11]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty & /*$$scope, personalMessage*/ 32770) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(65:0) {#if showModal}",
    		ctx
    	});

    	return block;
    }

    // (69:16) <Link to="/order">
    function create_default_slot_1$2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Order");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$2.name,
    		type: "slot",
    		source: "(69:16) <Link to=\\\"/order\\\">",
    		ctx
    	});

    	return block;
    }

    // (66:4) <Modal on:close="{() => showModal = false}">
    function create_default_slot$4(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let br;
    	let t2;
    	let button;
    	let link;
    	let current;

    	link = new Link({
    			props: {
    				to: "/order",
    				$$slots: { default: [create_default_slot_1$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(/*personalMessage*/ ctx[1]);
    			t1 = space();
    			br = element("br");
    			t2 = space();
    			button = element("button");
    			create_component(link.$$.fragment);
    			attr_dev(div, "class", "svelte-1p5696");
    			add_location(div, file$7, 66, 7, 1495);
    			add_location(br, file$7, 67, 7, 1532);
    			attr_dev(button, "class", "svelte-1p5696");
    			add_location(button, file$7, 68, 8, 1546);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, button, anchor);
    			mount_component(link, button, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*personalMessage*/ 2) set_data_dev(t0, /*personalMessage*/ ctx[1]);
    			const link_changes = {};

    			if (dirty & /*$$scope*/ 32768) {
    				link_changes.$$scope = { dirty, ctx };
    			}

    			link.$set(link_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(button);
    			destroy_component(link);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(66:4) <Modal on:close=\\\"{() => showModal = false}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let h1;
    	let t1;
    	let input0;
    	let t2;
    	let input1;
    	let t3;
    	let div;
    	let span;
    	let t4;
    	let div_resize_listener;
    	let t5;
    	let br;
    	let t6;
    	let button0;
    	let t8;
    	let button1;
    	let t10;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*showModal*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Your Message will be printed on your T-Shirt";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			t3 = space();
    			div = element("div");
    			span = element("span");
    			t4 = text(/*personalMessage*/ ctx[1]);
    			t5 = space();
    			br = element("br");
    			t6 = space();
    			button0 = element("button");
    			button0.textContent = "Select message";
    			t8 = space();
    			button1 = element("button");
    			button1.textContent = "Next";
    			t10 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			add_location(h1, file$7, 46, 4, 930);
    			attr_dev(input0, "placeholder", "Enter message");
    			attr_dev(input0, "class", "svelte-1p5696");
    			add_location(input0, file$7, 49, 4, 993);
    			attr_dev(input1, "type", "range");
    			attr_dev(input1, "class", "svelte-1p5696");
    			add_location(input1, file$7, 50, 4, 1063);
    			set_style(span, "font-size", /*size*/ ctx[4] + "px");
    			add_location(span, file$7, 53, 8, 1167);
    			attr_dev(div, "class", "svelte-1p5696");
    			add_render_callback(() => /*div_elementresize_handler*/ ctx[8].call(div));
    			add_location(div, file$7, 52, 4, 1108);
    			add_location(br, file$7, 55, 4, 1243);
    			attr_dev(button0, "class", "svelte-1p5696");
    			add_location(button0, file$7, 57, 4, 1255);
    			attr_dev(button1, "class", "svelte-1p5696");
    			add_location(button1, file$7, 59, 4, 1341);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, input0, anchor);
    			set_input_value(input0, /*personalMessage*/ ctx[1]);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, input1, anchor);
    			set_input_value(input1, /*size*/ ctx[4]);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t4);
    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[8].bind(div));
    			insert_dev(target, t5, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t10, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input1, "change", /*input1_change_input_handler*/ ctx[7]),
    					listen_dev(input1, "input", /*input1_change_input_handler*/ ctx[7]),
    					listen_dev(button0, "click", /*click_handler*/ ctx[9], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*personalMessage*/ 2 && input0.value !== /*personalMessage*/ ctx[1]) {
    				set_input_value(input0, /*personalMessage*/ ctx[1]);
    			}

    			if (dirty & /*size*/ 16) {
    				set_input_value(input1, /*size*/ ctx[4]);
    			}

    			if (!current || dirty & /*personalMessage*/ 2) set_data_dev(t4, /*personalMessage*/ ctx[1]);

    			if (!current || dirty & /*size*/ 16) {
    				set_style(span, "font-size", /*size*/ ctx[4] + "px");
    			}

    			if (/*showModal*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*showModal*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
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
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(input0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(input1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div);
    			div_resize_listener();
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t10);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			run_all(dispose);
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
    	let $authorMessage;
    	let $genreMessage;
    	let $yourMessage;
    	validate_store(authorMessage, "authorMessage");
    	component_subscribe($$self, authorMessage, $$value => $$invalidate(12, $authorMessage = $$value));
    	validate_store(genreMessage, "genreMessage");
    	component_subscribe($$self, genreMessage, $$value => $$invalidate(13, $genreMessage = $$value));
    	validate_store(yourMessage, "yourMessage");
    	component_subscribe($$self, yourMessage, $$value => $$invalidate(14, $yourMessage = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PersonalMessage", slots, []);
    	let showModal = false;
    	let personalMessage = "";
    	let w;
    	let h;
    	let size = 5;

    	function updateMessage() {
    		set_store_value(authorMessage, $authorMessage = "", $authorMessage);
    		set_store_value(genreMessage, $genreMessage = "", $genreMessage);
    		set_store_value(yourMessage, $yourMessage = "", $yourMessage);
    		yourMessage.update(currentvalue => currentvalue = personalMessage);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PersonalMessage> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		personalMessage = this.value;
    		$$invalidate(1, personalMessage);
    	}

    	function input1_change_input_handler() {
    		size = to_number(this.value);
    		$$invalidate(4, size);
    	}

    	function div_elementresize_handler() {
    		w = this.clientWidth;
    		h = this.clientHeight;
    		$$invalidate(2, w);
    		$$invalidate(3, h);
    	}

    	const click_handler = () => updateMessage();
    	const click_handler_1 = () => $$invalidate(0, showModal = true);
    	const close_handler = () => $$invalidate(0, showModal = false);

    	$$self.$capture_state = () => ({
    		Router,
    		Link,
    		Route,
    		Modal,
    		yourMessage,
    		authorMessage,
    		genreMessage,
    		showModal,
    		personalMessage,
    		w,
    		h,
    		size,
    		updateMessage,
    		$authorMessage,
    		$genreMessage,
    		$yourMessage
    	});

    	$$self.$inject_state = $$props => {
    		if ("showModal" in $$props) $$invalidate(0, showModal = $$props.showModal);
    		if ("personalMessage" in $$props) $$invalidate(1, personalMessage = $$props.personalMessage);
    		if ("w" in $$props) $$invalidate(2, w = $$props.w);
    		if ("h" in $$props) $$invalidate(3, h = $$props.h);
    		if ("size" in $$props) $$invalidate(4, size = $$props.size);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		showModal,
    		personalMessage,
    		w,
    		h,
    		size,
    		updateMessage,
    		input0_input_handler,
    		input1_change_input_handler,
    		div_elementresize_handler,
    		click_handler,
    		click_handler_1,
    		close_handler
    	];
    }

    class PersonalMessage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PersonalMessage",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\routes\Order.svelte generated by Svelte v3.29.6 */
    const file$8 = "src\\routes\\Order.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (87:0) {#each menu as color}
    function create_each_block$2(ctx) {
    	let label;
    	let input;
    	let input_value_value;
    	let t0;
    	let t1_value = /*color*/ ctx[18] + "";
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			input = element("input");
    			t0 = space();
    			t1 = text(t1_value);
    			attr_dev(input, "type", "checkbox");
    			input.__value = input_value_value = /*color*/ ctx[18];
    			input.value = input.__value;
    			attr_dev(input, "class", "svelte-j8uab1");
    			/*$$binding_groups*/ ctx[10][0].push(input);
    			add_location(input, file$8, 88, 2, 1651);
    			add_location(label, file$8, 87, 1, 1640);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			input.checked = ~/*colors*/ ctx[4].indexOf(input.__value);
    			append_dev(label, t0);
    			append_dev(label, t1);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[13]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*colors*/ 16) {
    				input.checked = ~/*colors*/ ctx[4].indexOf(input.__value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			/*$$binding_groups*/ ctx[10][0].splice(/*$$binding_groups*/ ctx[10][0].indexOf(input), 1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(87:0) {#each menu as color}",
    		ctx
    	});

    	return block;
    }

    // (97:0) {:else}
    function create_else_block$1(ctx) {
    	let h20;
    	let t0;
    	let t1;
    	let t2;
    	let t3_value = (/*colors*/ ctx[4].length === 1 ? "T-shirt" : "T-Shirts") + "";
    	let t3;
    	let t4;
    	let t5_value = join(/*colors*/ ctx[4]) + "";
    	let t5;
    	let t6;
    	let h21;
    	let t7;
    	let t8_value = /*colors*/ ctx[4].length + "";
    	let t8;
    	let t9;
    	let t10;

    	const block = {
    		c: function create() {
    			h20 = element("h2");
    			t0 = text("You ordered size ");
    			t1 = text(/*size*/ ctx[3]);
    			t2 = space();
    			t3 = text(t3_value);
    			t4 = text("\r\n\t\tin ");
    			t5 = text(t5_value);
    			t6 = space();
    			h21 = element("h2");
    			t7 = text("Total Price = 14.99 * ");
    			t8 = text(t8_value);
    			t9 = text(" = ");
    			t10 = text(/*total*/ ctx[1]);
    			attr_dev(h20, "class", "svelte-j8uab1");
    			add_location(h20, file$8, 97, 1, 1822);
    			attr_dev(h21, "class", "svelte-j8uab1");
    			add_location(h21, file$8, 101, 3, 1937);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h20, anchor);
    			append_dev(h20, t0);
    			append_dev(h20, t1);
    			append_dev(h20, t2);
    			append_dev(h20, t3);
    			append_dev(h20, t4);
    			append_dev(h20, t5);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, h21, anchor);
    			append_dev(h21, t7);
    			append_dev(h21, t8);
    			append_dev(h21, t9);
    			append_dev(h21, t10);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*size*/ 8) set_data_dev(t1, /*size*/ ctx[3]);
    			if (dirty & /*colors*/ 16 && t3_value !== (t3_value = (/*colors*/ ctx[4].length === 1 ? "T-shirt" : "T-Shirts") + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*colors*/ 16 && t5_value !== (t5_value = join(/*colors*/ ctx[4]) + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*colors*/ 16 && t8_value !== (t8_value = /*colors*/ ctx[4].length + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*total*/ 2) set_data_dev(t10, /*total*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h20);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(h21);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(97:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (94:0) {#if colors.length === 0}
    function create_if_block_2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Please select at least one color";
    			add_location(p, file$8, 94, 1, 1769);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(94:0) {#if colors.length === 0}",
    		ctx
    	});

    	return block;
    }

    // (111:0) {#if yes}
    function create_if_block_1$1(ctx) {
    	let button;
    	let t;
    	let button_disabled_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text("Place Order");
    			button.disabled = button_disabled_value = !/*yes*/ ctx[2];
    			attr_dev(button, "class", "svelte-j8uab1");
    			add_location(button, file$8, 111, 0, 2115);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[15], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*yes*/ 4 && button_disabled_value !== (button_disabled_value = !/*yes*/ ctx[2])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(111:0) {#if yes}",
    		ctx
    	});

    	return block;
    }

    // (117:0) {#if showModal}
    function create_if_block$4(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				$$slots: { default: [create_default_slot$5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	modal.$on("close", /*close_handler*/ ctx[16]);

    	const block = {
    		c: function create() {
    			create_component(modal.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const modal_changes = {};

    			if (dirty & /*$$scope, total, $genreMessage, $authorMessage, $yourMessage*/ 2097378) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(117:0) {#if showModal}",
    		ctx
    	});

    	return block;
    }

    // (118:1) <Modal on:close="{() => showModal = false}">
    function create_default_slot$5(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let p;
    	let t4;
    	let t5;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(/*$yourMessage*/ ctx[5]);
    			t1 = text(/*$authorMessage*/ ctx[6]);
    			t2 = text(/*$genreMessage*/ ctx[7]);
    			t3 = space();
    			p = element("p");
    			t4 = text("Order placed!  Total Price: ");
    			t5 = text(/*total*/ ctx[1]);
    			attr_dev(div, "class", "svelte-j8uab1");
    			add_location(div, file$8, 121, 0, 2288);
    			add_location(p, file$8, 125, 4, 2358);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t4);
    			append_dev(p, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$yourMessage*/ 32) set_data_dev(t0, /*$yourMessage*/ ctx[5]);
    			if (dirty & /*$authorMessage*/ 64) set_data_dev(t1, /*$authorMessage*/ ctx[6]);
    			if (dirty & /*$genreMessage*/ 128) set_data_dev(t2, /*$genreMessage*/ ctx[7]);
    			if (dirty & /*total*/ 2) set_data_dev(t5, /*total*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(118:1) <Modal on:close=\\\"{() => showModal = false}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let h20;
    	let t1;
    	let label0;
    	let input0;
    	let t2;
    	let t3;
    	let label1;
    	let input1;
    	let t4;
    	let t5;
    	let label2;
    	let input2;
    	let t6;
    	let t7;
    	let h21;
    	let t9;
    	let t10;
    	let t11;
    	let label3;
    	let input3;
    	let t12;
    	let t13;
    	let t14;
    	let if_block2_anchor;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*menu*/ ctx[8];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	function select_block_type(ctx, dirty) {
    		if (/*colors*/ ctx[4].length === 0) return create_if_block_2;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*yes*/ ctx[2] && create_if_block_1$1(ctx);
    	let if_block2 = /*showModal*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			h20 = element("h2");
    			h20.textContent = "Size";
    			t1 = space();
    			label0 = element("label");
    			input0 = element("input");
    			t2 = text("\r\n\tSmall");
    			t3 = space();
    			label1 = element("label");
    			input1 = element("input");
    			t4 = text("\r\n\tMedium");
    			t5 = space();
    			label2 = element("label");
    			input2 = element("input");
    			t6 = text("\r\n\tLarge");
    			t7 = space();
    			h21 = element("h2");
    			h21.textContent = "Color";
    			t9 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t10 = space();
    			if_block0.c();
    			t11 = space();
    			label3 = element("label");
    			input3 = element("input");
    			t12 = text("\r\n\tCheck when ready to place order");
    			t13 = space();
    			if (if_block1) if_block1.c();
    			t14 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			attr_dev(h20, "class", "svelte-j8uab1");
    			add_location(h20, file$8, 67, 0, 1339);
    			attr_dev(input0, "type", "radio");
    			input0.__value = "small";
    			input0.value = input0.__value;
    			attr_dev(input0, "class", "svelte-j8uab1");
    			/*$$binding_groups*/ ctx[10][1].push(input0);
    			add_location(input0, file$8, 70, 1, 1366);
    			add_location(label0, file$8, 69, 0, 1356);
    			attr_dev(input1, "type", "radio");
    			input1.__value = "Medium";
    			input1.value = input1.__value;
    			attr_dev(input1, "class", "svelte-j8uab1");
    			/*$$binding_groups*/ ctx[10][1].push(input1);
    			add_location(input1, file$8, 75, 1, 1446);
    			add_location(label1, file$8, 74, 0, 1436);
    			attr_dev(input2, "type", "radio");
    			input2.__value = "large";
    			input2.value = input2.__value;
    			attr_dev(input2, "class", "svelte-j8uab1");
    			/*$$binding_groups*/ ctx[10][1].push(input2);
    			add_location(input2, file$8, 80, 1, 1528);
    			add_location(label2, file$8, 79, 0, 1518);
    			attr_dev(h21, "class", "svelte-j8uab1");
    			add_location(h21, file$8, 84, 0, 1598);
    			attr_dev(input3, "type", "checkbox");
    			attr_dev(input3, "class", "svelte-j8uab1");
    			add_location(input3, file$8, 105, 1, 2014);
    			add_location(label3, file$8, 104, 0, 2004);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h20, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, label0, anchor);
    			append_dev(label0, input0);
    			input0.checked = input0.__value === /*size*/ ctx[3];
    			append_dev(label0, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, label1, anchor);
    			append_dev(label1, input1);
    			input1.checked = input1.__value === /*size*/ ctx[3];
    			append_dev(label1, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, label2, anchor);
    			append_dev(label2, input2);
    			input2.checked = input2.__value === /*size*/ ctx[3];
    			append_dev(label2, t6);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, h21, anchor);
    			insert_dev(target, t9, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, t10, anchor);
    			if_block0.m(target, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, label3, anchor);
    			append_dev(label3, input3);
    			input3.checked = /*yes*/ ctx[2];
    			append_dev(label3, t12);
    			insert_dev(target, t13, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t14, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_handler*/ ctx[9]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[11]),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[12]),
    					listen_dev(input3, "change", /*input3_change_handler*/ ctx[14])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*size*/ 8) {
    				input0.checked = input0.__value === /*size*/ ctx[3];
    			}

    			if (dirty & /*size*/ 8) {
    				input1.checked = input1.__value === /*size*/ ctx[3];
    			}

    			if (dirty & /*size*/ 8) {
    				input2.checked = input2.__value === /*size*/ ctx[3];
    			}

    			if (dirty & /*menu, colors*/ 272) {
    				each_value = /*menu*/ ctx[8];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(t10.parentNode, t10);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(t11.parentNode, t11);
    				}
    			}

    			if (dirty & /*yes*/ 4) {
    				input3.checked = /*yes*/ ctx[2];
    			}

    			if (/*yes*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					if_block1.m(t14.parentNode, t14);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*showModal*/ ctx[0]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*showModal*/ 1) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$4(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h20);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(label0);
    			/*$$binding_groups*/ ctx[10][1].splice(/*$$binding_groups*/ ctx[10][1].indexOf(input0), 1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(label1);
    			/*$$binding_groups*/ ctx[10][1].splice(/*$$binding_groups*/ ctx[10][1].indexOf(input1), 1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(label2);
    			/*$$binding_groups*/ ctx[10][1].splice(/*$$binding_groups*/ ctx[10][1].indexOf(input2), 1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(h21);
    			if (detaching) detach_dev(t9);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t10);
    			if_block0.d(detaching);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(label3);
    			if (detaching) detach_dev(t13);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t14);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
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

    function join(colors) {
    	if (colors.length === 1) return colors[0];
    	return `${colors.slice(0, -1).join(", ")} and ${colors[colors.length - 1]}`;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $yourMessage;
    	let $authorMessage;
    	let $genreMessage;
    	validate_store(yourMessage, "yourMessage");
    	component_subscribe($$self, yourMessage, $$value => $$invalidate(5, $yourMessage = $$value));
    	validate_store(authorMessage, "authorMessage");
    	component_subscribe($$self, authorMessage, $$value => $$invalidate(6, $authorMessage = $$value));
    	validate_store(genreMessage, "genreMessage");
    	component_subscribe($$self, genreMessage, $$value => $$invalidate(7, $genreMessage = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Order", slots, []);
    	let showModal = false;
    	let count = 0;
    	let total = 0;
    	let yes = false;
    	let size = "small";
    	let colors = ["Black"];
    	let menu = ["Black", "White", "Pink"];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Order> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[], []];

    	function input0_change_handler() {
    		size = this.__value;
    		$$invalidate(3, size);
    	}

    	function input1_change_handler() {
    		size = this.__value;
    		$$invalidate(3, size);
    	}

    	function input2_change_handler() {
    		size = this.__value;
    		$$invalidate(3, size);
    	}

    	function input_change_handler() {
    		colors = get_binding_group_value($$binding_groups[0], this.__value, this.checked);
    		$$invalidate(4, colors);
    	}

    	function input3_change_handler() {
    		yes = this.checked;
    		$$invalidate(2, yes);
    	}

    	const click_handler = () => $$invalidate(0, showModal = true);
    	const close_handler = () => $$invalidate(0, showModal = false);

    	$$self.$capture_state = () => ({
    		Modal,
    		yourMessage,
    		authorMessage,
    		genreMessage,
    		showModal,
    		count,
    		total,
    		yes,
    		size,
    		colors,
    		menu,
    		join,
    		$yourMessage,
    		$authorMessage,
    		$genreMessage
    	});

    	$$self.$inject_state = $$props => {
    		if ("showModal" in $$props) $$invalidate(0, showModal = $$props.showModal);
    		if ("count" in $$props) count = $$props.count;
    		if ("total" in $$props) $$invalidate(1, total = $$props.total);
    		if ("yes" in $$props) $$invalidate(2, yes = $$props.yes);
    		if ("size" in $$props) $$invalidate(3, size = $$props.size);
    		if ("colors" in $$props) $$invalidate(4, colors = $$props.colors);
    		if ("menu" in $$props) $$invalidate(8, menu = $$props.menu);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*colors*/ 16) {
    			 $$invalidate(1, total = colors.length * 14.99);
    		}
    	};

    	return [
    		showModal,
    		total,
    		yes,
    		size,
    		colors,
    		$yourMessage,
    		$authorMessage,
    		$genreMessage,
    		menu,
    		input0_change_handler,
    		$$binding_groups,
    		input1_change_handler,
    		input2_change_handler,
    		input_change_handler,
    		input3_change_handler,
    		click_handler,
    		close_handler
    	];
    }

    class Order extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Order",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.29.6 */
    const file$9 = "src\\App.svelte";

    // (79:6) <Link to="/">
    function create_default_slot_13(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Home");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_13.name,
    		type: "slot",
    		source: "(79:6) <Link to=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (80:6) <Link to="/quoteauthor">
    function create_default_slot_12(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Quotes by Author");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_12.name,
    		type: "slot",
    		source: "(80:6) <Link to=\\\"/quoteauthor\\\">",
    		ctx
    	});

    	return block;
    }

    // (81:6) <Link to="/quotegenre">
    function create_default_slot_11(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Quotes by Genre");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_11.name,
    		type: "slot",
    		source: "(81:6) <Link to=\\\"/quotegenre\\\">",
    		ctx
    	});

    	return block;
    }

    // (82:6) <Link to="/personalmessage">
    function create_default_slot_10(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Quotes by You");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_10.name,
    		type: "slot",
    		source: "(82:6) <Link to=\\\"/personalmessage\\\">",
    		ctx
    	});

    	return block;
    }

    // (86:1) <Route path="order/">
    function create_default_slot_9(ctx) {
    	let order;
    	let current;
    	order = new Order({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(order.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(order, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(order.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(order.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(order, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_9.name,
    		type: "slot",
    		source: "(86:1) <Route path=\\\"order/\\\">",
    		ctx
    	});

    	return block;
    }

    // (90:1) <Route path="personalmessage/">
    function create_default_slot_8(ctx) {
    	let personalmessage;
    	let current;
    	personalmessage = new PersonalMessage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(personalmessage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(personalmessage, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(personalmessage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(personalmessage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(personalmessage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(90:1) <Route path=\\\"personalmessage/\\\">",
    		ctx
    	});

    	return block;
    }

    // (94:1) <Route path="quotegenremessage/:id" let:params>
    function create_default_slot_7(ctx) {
    	let quotegenremessage;
    	let current;

    	quotegenremessage = new QuoteGenreMessage({
    			props: { genreName: /*params*/ ctx[1].id },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(quotegenremessage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(quotegenremessage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const quotegenremessage_changes = {};
    			if (dirty & /*params*/ 2) quotegenremessage_changes.genreName = /*params*/ ctx[1].id;
    			quotegenremessage.$set(quotegenremessage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(quotegenremessage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(quotegenremessage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(quotegenremessage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(94:1) <Route path=\\\"quotegenremessage/:id\\\" let:params>",
    		ctx
    	});

    	return block;
    }

    // (98:1) <Route path="quotegenremessage/">
    function create_default_slot_6(ctx) {
    	let quotegenremessage;
    	let current;
    	quotegenremessage = new QuoteGenreMessage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(quotegenremessage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(quotegenremessage, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(quotegenremessage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(quotegenremessage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(quotegenremessage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(98:1) <Route path=\\\"quotegenremessage/\\\">",
    		ctx
    	});

    	return block;
    }

    // (102:4) <Route path="quotegenre/">
    function create_default_slot_5(ctx) {
    	let quotegenre;
    	let current;
    	quotegenre = new QuoteGenre({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(quotegenre.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(quotegenre, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(quotegenre.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(quotegenre.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(quotegenre, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(102:4) <Route path=\\\"quotegenre/\\\">",
    		ctx
    	});

    	return block;
    }

    // (106:4) <Route path="quotemessage/:id" let:params>
    function create_default_slot_4(ctx) {
    	let quotemessage;
    	let current;

    	quotemessage = new QuoteMessage({
    			props: { authorName: /*params*/ ctx[1].id },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(quotemessage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(quotemessage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const quotemessage_changes = {};
    			if (dirty & /*params*/ 2) quotemessage_changes.authorName = /*params*/ ctx[1].id;
    			quotemessage.$set(quotemessage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(quotemessage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(quotemessage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(quotemessage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(106:4) <Route path=\\\"quotemessage/:id\\\" let:params>",
    		ctx
    	});

    	return block;
    }

    // (110:1) <Route path="quotemessage/">
    function create_default_slot_3(ctx) {
    	let quotemessage;
    	let current;
    	quotemessage = new QuoteMessage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(quotemessage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(quotemessage, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(quotemessage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(quotemessage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(quotemessage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(110:1) <Route path=\\\"quotemessage/\\\">",
    		ctx
    	});

    	return block;
    }

    // (114:4) <Route path="quoteauthor/">
    function create_default_slot_2(ctx) {
    	let quoteauthor;
    	let current;
    	quoteauthor = new QuoteAuthor({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(quoteauthor.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(quoteauthor, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(quoteauthor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(quoteauthor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(quoteauthor, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(114:4) <Route path=\\\"quoteauthor/\\\">",
    		ctx
    	});

    	return block;
    }

    // (118:1) <Route path="/">
    function create_default_slot_1$3(ctx) {
    	let home;
    	let current;
    	home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(home.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$3.name,
    		type: "slot",
    		source: "(118:1) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (75:0) <Router url="{url}">
    function create_default_slot$6(ctx) {
    	let h1;
    	let t1;
    	let nav;
    	let ul;
    	let li0;
    	let link0;
    	let t2;
    	let li1;
    	let link1;
    	let t3;
    	let li2;
    	let link2;
    	let t4;
    	let li3;
    	let link3;
    	let t5;
    	let route0;
    	let t6;
    	let route1;
    	let t7;
    	let route2;
    	let t8;
    	let route3;
    	let t9;
    	let route4;
    	let t10;
    	let route5;
    	let t11;
    	let route6;
    	let t12;
    	let route7;
    	let t13;
    	let route8;
    	let current;

    	link0 = new Link({
    			props: {
    				to: "/",
    				$$slots: { default: [create_default_slot_13] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link1 = new Link({
    			props: {
    				to: "/quoteauthor",
    				$$slots: { default: [create_default_slot_12] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link2 = new Link({
    			props: {
    				to: "/quotegenre",
    				$$slots: { default: [create_default_slot_11] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	link3 = new Link({
    			props: {
    				to: "/personalmessage",
    				$$slots: { default: [create_default_slot_10] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route0 = new Route({
    			props: {
    				path: "order/",
    				$$slots: { default: [create_default_slot_9] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route1 = new Route({
    			props: {
    				path: "personalmessage/",
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route2 = new Route({
    			props: {
    				path: "quotegenremessage/:id",
    				$$slots: {
    					default: [
    						create_default_slot_7,
    						({ params }) => ({ 1: params }),
    						({ params }) => params ? 2 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route3 = new Route({
    			props: {
    				path: "quotegenremessage/",
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route4 = new Route({
    			props: {
    				path: "quotegenre/",
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route5 = new Route({
    			props: {
    				path: "quotemessage/:id",
    				$$slots: {
    					default: [
    						create_default_slot_4,
    						({ params }) => ({ 1: params }),
    						({ params }) => params ? 2 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route6 = new Route({
    			props: {
    				path: "quotemessage/",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route7 = new Route({
    			props: {
    				path: "quoteauthor/",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	route8 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_1$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Joyful Quotes";
    			t1 = space();
    			nav = element("nav");
    			ul = element("ul");
    			li0 = element("li");
    			create_component(link0.$$.fragment);
    			t2 = space();
    			li1 = element("li");
    			create_component(link1.$$.fragment);
    			t3 = space();
    			li2 = element("li");
    			create_component(link2.$$.fragment);
    			t4 = space();
    			li3 = element("li");
    			create_component(link3.$$.fragment);
    			t5 = space();
    			create_component(route0.$$.fragment);
    			t6 = space();
    			create_component(route1.$$.fragment);
    			t7 = space();
    			create_component(route2.$$.fragment);
    			t8 = space();
    			create_component(route3.$$.fragment);
    			t9 = space();
    			create_component(route4.$$.fragment);
    			t10 = space();
    			create_component(route5.$$.fragment);
    			t11 = space();
    			create_component(route6.$$.fragment);
    			t12 = space();
    			create_component(route7.$$.fragment);
    			t13 = space();
    			create_component(route8.$$.fragment);
    			attr_dev(h1, "class", "svelte-1vo05rr");
    			add_location(h1, file$9, 75, 1, 1721);
    			attr_dev(li0, "class", "svelte-1vo05rr");
    			add_location(li0, file$9, 78, 2, 1760);
    			attr_dev(li1, "class", "svelte-1vo05rr");
    			add_location(li1, file$9, 79, 2, 1796);
    			attr_dev(li2, "class", "svelte-1vo05rr");
    			add_location(li2, file$9, 80, 2, 1855);
    			attr_dev(li3, "class", "svelte-1vo05rr");
    			add_location(li3, file$9, 81, 2, 1912);
    			attr_dev(ul, "class", "svelte-1vo05rr");
    			add_location(ul, file$9, 77, 2, 1753);
    			attr_dev(nav, "class", "svelte-1vo05rr");
    			add_location(nav, file$9, 76, 1, 1745);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);
    			append_dev(ul, li0);
    			mount_component(link0, li0, null);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			mount_component(link1, li1, null);
    			append_dev(ul, t3);
    			append_dev(ul, li2);
    			mount_component(link2, li2, null);
    			append_dev(ul, t4);
    			append_dev(ul, li3);
    			mount_component(link3, li3, null);
    			insert_dev(target, t5, anchor);
    			mount_component(route0, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(route2, target, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(route3, target, anchor);
    			insert_dev(target, t9, anchor);
    			mount_component(route4, target, anchor);
    			insert_dev(target, t10, anchor);
    			mount_component(route5, target, anchor);
    			insert_dev(target, t11, anchor);
    			mount_component(route6, target, anchor);
    			insert_dev(target, t12, anchor);
    			mount_component(route7, target, anchor);
    			insert_dev(target, t13, anchor);
    			mount_component(route8, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const link0_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				link0_changes.$$scope = { dirty, ctx };
    			}

    			link0.$set(link0_changes);
    			const link1_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				link1_changes.$$scope = { dirty, ctx };
    			}

    			link1.$set(link1_changes);
    			const link2_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				link2_changes.$$scope = { dirty, ctx };
    			}

    			link2.$set(link2_changes);
    			const link3_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				link3_changes.$$scope = { dirty, ctx };
    			}

    			link3.$set(link3_changes);
    			const route0_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				route0_changes.$$scope = { dirty, ctx };
    			}

    			route0.$set(route0_changes);
    			const route1_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				route1_changes.$$scope = { dirty, ctx };
    			}

    			route1.$set(route1_changes);
    			const route2_changes = {};

    			if (dirty & /*$$scope, params*/ 6) {
    				route2_changes.$$scope = { dirty, ctx };
    			}

    			route2.$set(route2_changes);
    			const route3_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				route3_changes.$$scope = { dirty, ctx };
    			}

    			route3.$set(route3_changes);
    			const route4_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				route4_changes.$$scope = { dirty, ctx };
    			}

    			route4.$set(route4_changes);
    			const route5_changes = {};

    			if (dirty & /*$$scope, params*/ 6) {
    				route5_changes.$$scope = { dirty, ctx };
    			}

    			route5.$set(route5_changes);
    			const route6_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				route6_changes.$$scope = { dirty, ctx };
    			}

    			route6.$set(route6_changes);
    			const route7_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				route7_changes.$$scope = { dirty, ctx };
    			}

    			route7.$set(route7_changes);
    			const route8_changes = {};

    			if (dirty & /*$$scope*/ 4) {
    				route8_changes.$$scope = { dirty, ctx };
    			}

    			route8.$set(route8_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(link0.$$.fragment, local);
    			transition_in(link1.$$.fragment, local);
    			transition_in(link2.$$.fragment, local);
    			transition_in(link3.$$.fragment, local);
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			transition_in(route5.$$.fragment, local);
    			transition_in(route6.$$.fragment, local);
    			transition_in(route7.$$.fragment, local);
    			transition_in(route8.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(link0.$$.fragment, local);
    			transition_out(link1.$$.fragment, local);
    			transition_out(link2.$$.fragment, local);
    			transition_out(link3.$$.fragment, local);
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(route5.$$.fragment, local);
    			transition_out(route6.$$.fragment, local);
    			transition_out(route7.$$.fragment, local);
    			transition_out(route8.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(nav);
    			destroy_component(link0);
    			destroy_component(link1);
    			destroy_component(link2);
    			destroy_component(link3);
    			if (detaching) detach_dev(t5);
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(route2, detaching);
    			if (detaching) detach_dev(t8);
    			destroy_component(route3, detaching);
    			if (detaching) detach_dev(t9);
    			destroy_component(route4, detaching);
    			if (detaching) detach_dev(t10);
    			destroy_component(route5, detaching);
    			if (detaching) detach_dev(t11);
    			destroy_component(route6, detaching);
    			if (detaching) detach_dev(t12);
    			destroy_component(route7, detaching);
    			if (detaching) detach_dev(t13);
    			destroy_component(route8, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(75:0) <Router url=\\\"{url}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let div;
    	let router;
    	let current;

    	router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot$6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(router.$$.fragment);
    			attr_dev(div, "class", "svelte-1vo05rr");
    			add_location(div, file$9, 73, 0, 1693);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(router, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope*/ 4) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(router);
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
    	validate_slots("App", slots, []);
    	let { url = "" } = $$props;
    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		Link,
    		Route,
    		Home,
    		QuoteAuthor,
    		QuoteMessage,
    		QuoteGenre,
    		QuoteGenreMessage,
    		PersonalMessage,
    		Order,
    		url
    	});

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
