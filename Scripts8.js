jQuery.support.placeholder = (function(){
    var i = document.createElement('input');
    return 'placeholder' in i;
})();
jQuery.fx.interval = 67;
jQuery.browser={};(function(){jQuery.browser.msie=false;
jQuery.browser.version=0;if(navigator.userAgent.match(/MSIE ([0-9]+)\./)){
jQuery.browser.msie=true;jQuery.browser.version=RegExp.$1;}})();
var $oldbr = ($.browser.msie && $.browser.version < 8)  ;



//console.log($oldbr);

/*!
 * jQuery hashchange event - v1.3 - 7/21/2010
 * http://benalman.com/projects/jquery-hashchange-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery hashchange event
//
// *Version: 1.3, Last updated: 7/21/2010*
//
// Project Home - http://benalman.com/projects/jquery-hashchange-plugin/
// GitHub       - http://github.com/cowboy/jquery-hashchange/
// Source       - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.js
// (Minified)   - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.min.js (0.8kb gzipped)
//
// About: License
//
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
//
// About: Examples
//
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
//
// hashchange event - http://benalman.com/code/projects/jquery-hashchange/examples/hashchange/
// document.domain - http://benalman.com/code/projects/jquery-hashchange/examples/document_domain/
//
// About: Support and Testing
//
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
//
// jQuery Versions - 1.2.6, 1.3.2, 1.4.1, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-4, Chrome 5-6, Safari 3.2-5,
//                   Opera 9.6-10.60, iPhone 3.1, Android 1.6-2.2, BlackBerry 4.6-5.
// Unit Tests      - http://benalman.com/code/projects/jquery-hashchange/unit/
//
// About: Known issues
//
// While this jQuery hashchange event implementation is quite stable and
// robust, there are a few unfortunate browser bugs surrounding expected
// hashchange event-based behaviors, independent of any JavaScript
// window.onhashchange abstraction. See the following examples for more
// information:
//
// Chrome: Back Button - http://benalman.com/code/projects/jquery-hashchange/examples/bug-chrome-back-button/
// Firefox: Remote XMLHttpRequest - http://benalman.com/code/projects/jquery-hashchange/examples/bug-firefox-remote-xhr/
// WebKit: Back Button in an Iframe - http://benalman.com/code/projects/jquery-hashchange/examples/bug-webkit-hash-iframe/
// Safari: Back Button from a different domain - http://benalman.com/code/projects/jquery-hashchange/examples/bug-safari-back-from-diff-domain/
//
// Also note that should a browser natively support the window.onhashchange
// event, but not report that it does, the fallback polling loop will be used.
//
// About: Release History
//
// 1.3   - (7/21/2010) Reorganized IE6/7 Iframe code to make it more
//         "removable" for mobile-only development. Added IE6/7 document.title
//         support. Attempted to make Iframe as hidden as possible by using
//         techniques from http://www.paciellogroup.com/blog/?p=604. Added
//         support for the "shortcut" format $(window).hashchange( fn ) and
//         $(window).hashchange() like jQuery provides for built-in events.
//         Renamed jQuery.hashchangeDelay to <jQuery.fn.hashchange.delay> and
//         lowered its default value to 50. Added <jQuery.fn.hashchange.domain>
//         and <jQuery.fn.hashchange.src> properties plus document-domain.html
//         file to address access denied issues when setting document.domain in
//         IE6/7.
// 1.2   - (2/11/2010) Fixed a bug where coming back to a page using this plugin
//         from a page on another domain would cause an error in Safari 4. Also,
//         IE6/7 Iframe is now inserted after the body (this actually works),
//         which prevents the page from scrolling when the event is first bound.
//         Event can also now be bound before DOM ready, but it won't be usable
//         before then in IE6/7.
// 1.1   - (1/21/2010) Incorporated document.documentMode test to fix IE8 bug
//         where browser version is incorrectly reported as 8.0, despite
//         inclusion of the X-UA-Compatible IE=EmulateIE7 meta tag.
// 1.0   - (1/9/2010) Initial Release. Broke out the jQuery BBQ event.special
//         window.onhashchange functionality into a separate plugin for users
//         who want just the basic event & back button support, without all the
//         extra awesomeness that BBQ provides. This plugin will be included as
//         part of jQuery BBQ, but also be available separately.

(function($,window,undefined){
//  '$:nomunge'; // Used by YUI compressor.

  // Reused string.
  var str_hashchange = 'hashchange',

    // Method / object references.
    doc = document,
    fake_onhashchange,
    special = $.event.special,

    // Does the browser support window.onhashchange? Note that IE8 running in
    // IE7 compatibility mode reports true for 'onhashchange' in window, even
    // though the event isn't supported, so also test document.documentMode.
    doc_mode = doc.documentMode,
    supports_onhashchange = 'on' + str_hashchange in window && ( doc_mode === undefined || doc_mode > 7 );

  // Get location.hash (or what you'd expect location.hash to be) sans any
  // leading #. Thanks for making this necessary, Firefox!
  function get_fragment( url ) {
    url = url || location.href;
    return '#' + url.replace( /^[^#]*#?(.*)$/, '$1' );
  };

  // Method: jQuery.fn.hashchange
  //
  // Bind a handler to the window.onhashchange event or trigger all bound
  // window.onhashchange event handlers. This behavior is consistent with
  // jQuery's built-in event handlers.
  //
  // Usage:
  //
  // > jQuery(window).hashchange( [ handler ] );
  //
  // Arguments:
  //
  //  handler - (Function) Optional handler to be bound to the hashchange
  //    event. This is a "shortcut" for the more verbose form:
  //    jQuery(window).bind( 'hashchange', handler ). If handler is omitted,
  //    all bound window.onhashchange event handlers will be triggered. This
  //    is a shortcut for the more verbose
  //    jQuery(window).trigger( 'hashchange' ). These forms are described in
  //    the <hashchange event> section.
  //
  // Returns:
  //
  //  (jQuery) The initial jQuery collection of elements.

  // Allow the "shortcut" format $(elem).hashchange( fn ) for binding and
  // $(elem).hashchange() for triggering, like jQuery does for built-in events.
  $.fn[ str_hashchange ] = function( fn ) {
    return fn ? this.bind( str_hashchange, fn ) : this.trigger( str_hashchange );
  };

  // Property: jQuery.fn.hashchange.delay
  //
  // The numeric interval (in milliseconds) at which the <hashchange event>
  // polling loop executes. Defaults to 50.

  // Property: jQuery.fn.hashchange.domain
  //
  // If you're setting document.domain in your JavaScript, and you want hash
  // history to work in IE6/7, not only must this property be set, but you must
  // also set document.domain BEFORE jQuery is loaded into the page. This
  // property is only applicable if you are supporting IE6/7 (or IE8 operating
  // in "IE7 compatibility" mode).
  //
  // In addition, the <jQuery.fn.hashchange.src> property must be set to the
  // path of the included "document-domain.html" file, which can be renamed or
  // modified if necessary (note that the document.domain specified must be the
  // same in both your main JavaScript as well as in this file).
  //
  // Usage:
  //
  // jQuery.fn.hashchange.domain = document.domain;

  // Property: jQuery.fn.hashchange.src
  //
  // If, for some reason, you need to specify an Iframe src file (for example,
  // when setting document.domain as in <jQuery.fn.hashchange.domain>), you can
  // do so using this property. Note that when using this property, history
  // won't be recorded in IE6/7 until the Iframe src file loads. This property
  // is only applicable if you are supporting IE6/7 (or IE8 operating in "IE7
  // compatibility" mode).
  //
  // Usage:
  //
  // jQuery.fn.hashchange.src = 'path/to/file.html';

  $.fn[ str_hashchange ].delay = 50;
  /*
  $.fn[ str_hashchange ].domain = null;
  $.fn[ str_hashchange ].src = null;
  */

  // Event: hashchange event
  //
  // Fired when location.hash changes. In browsers that support it, the native
  // HTML5 window.onhashchange event is used, otherwise a polling loop is
  // initialized, running every <jQuery.fn.hashchange.delay> milliseconds to
  // see if the hash has changed. In IE6/7 (and IE8 operating in "IE7
  // compatibility" mode), a hidden Iframe is created to allow the back button
  // and hash-based history to work.
  //
  // Usage as described in <jQuery.fn.hashchange>:
  //
  // > // Bind an event handler.
  // > jQuery(window).hashchange( function(e) {
  // >   var hash = location.hash;
  // >   ...
  // > });
  // >
  // > // Manually trigger the event handler.
  // > jQuery(window).hashchange();
  //
  // A more verbose usage that allows for event namespacing:
  //
  // > // Bind an event handler.
  // > jQuery(window).bind( 'hashchange', function(e) {
  // >   var hash = location.hash;
  // >   ...
  // > });
  // >
  // > // Manually trigger the event handler.
  // > jQuery(window).trigger( 'hashchange' );
  //
  // Additional Notes:
  //
  // * The polling loop and Iframe are not created until at least one handler
  //   is actually bound to the 'hashchange' event.
  // * If you need the bound handler(s) to execute immediately, in cases where
  //   a location.hash exists on page load, via bookmark or page refresh for
  //   example, use jQuery(window).hashchange() or the more verbose
  //   jQuery(window).trigger( 'hashchange' ).
  // * The event can be bound before DOM ready, but since it won't be usable
  //   before then in IE6/7 (due to the necessary Iframe), recommended usage is
  //   to bind it inside a DOM ready handler.

  // Override existing $.event.special.hashchange methods (allowing this plugin
  // to be defined after jQuery BBQ in BBQ's source code).
  special[ str_hashchange ] = $.extend( special[ str_hashchange ], {

    // Called only when the first 'hashchange' event is bound to window.
    setup: function() {
      // If window.onhashchange is supported natively, there's nothing to do..
      if ( supports_onhashchange ) { return false; }

      // Otherwise, we need to create our own. And we don't want to call this
      // until the user binds to the event, just in case they never do, since it
      // will create a polling loop and possibly even a hidden Iframe.
      $( fake_onhashchange.start );
    },

    // Called only when the last 'hashchange' event is unbound from window.
    teardown: function() {
      // If window.onhashchange is supported natively, there's nothing to do..
      if ( supports_onhashchange ) { return false; }

      // Otherwise, we need to stop ours (if possible).
      $( fake_onhashchange.stop );
    }

  });

  // fake_onhashchange does all the work of triggering the window.onhashchange
  // event for browsers that don't natively support it, including creating a
  // polling loop to watch for hash changes and in IE 6/7 creating a hidden
  // Iframe to enable back and forward.
  fake_onhashchange = (function(){
    var self = {},
      timeout_id,

      // Remember the initial hash so it doesn't get triggered immediately.
      last_hash = get_fragment(),

      fn_retval = function(val){ return val; },
      history_set = fn_retval,
      history_get = fn_retval;

    // Start the polling loop.
    self.start = function() {
      timeout_id || poll();
    };

    // Stop the polling loop.
    self.stop = function() {
      timeout_id && clearTimeout( timeout_id );
      timeout_id = undefined;
    };

    // This polling loop checks every $.fn.hashchange.delay milliseconds to see
    // if location.hash has changed, and triggers the 'hashchange' event on
    // window when necessary.
    function poll() {
      var hash = get_fragment(),
        history_hash = history_get( last_hash );

      if ( hash !== last_hash ) {
        history_set( last_hash = hash, history_hash );

        $(window).trigger( str_hashchange );

      } else if ( history_hash !== last_hash ) {
        location.href = location.href.replace( /#.*/, '' ) + history_hash;
      }

      timeout_id = setTimeout( poll, $.fn[ str_hashchange ].delay );
    };

    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    // vvvvvvvvvvvvvvvvvvv REMOVE IF NOT SUPPORTING IE6/7/8 vvvvvvvvvvvvvvvvvvv
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    $.browser.msie && !supports_onhashchange && (function(){
      // Not only do IE6/7 need the "magical" Iframe treatment, but so does IE8
      // when running in "IE7 compatibility" mode.

      var iframe,
        iframe_src;

      // When the event is bound and polling starts in IE 6/7, create a hidden
      // Iframe for history handling.
      self.start = function(){
        if ( !iframe ) {
          iframe_src = $.fn[ str_hashchange ].src;
          iframe_src = iframe_src && iframe_src + get_fragment();

          // Create hidden Iframe. Attempt to make Iframe as hidden as possible
          // by using techniques from http://www.paciellogroup.com/blog/?p=604.
          iframe = $('<iframe tabindex="-1" title="empty"/>').hide()

            // When Iframe has completely loaded, initialize the history and
            // start polling.
            .one( 'load', function(){
              iframe_src || history_set( get_fragment() );
              poll();
            })

            // Load Iframe src if specified, otherwise nothing.
            .attr( 'src', iframe_src || 'javascript:0' )

            // Append Iframe after the end of the body to prevent unnecessary
            // initial page scrolling (yes, this works).
            .insertAfter( 'body' )[0].contentWindow;

          // Whenever `document.title` changes, update the Iframe's title to
          // prettify the back/next history menu entries. Since IE sometimes
          // errors with "Unspecified error" the very first time this is set
          // (yes, very useful) wrap this with a try/catch block.
          doc.onpropertychange = function(){
            try {
              if ( event.propertyName === 'title' ) {
                iframe.document.title = doc.title;
              }
            } catch(e) {}
          };

        }
      };

      // Override the "stop" method since an IE6/7 Iframe was created. Even
      // if there are no longer any bound event handlers, the polling loop
      // is still necessary for back/next to work at all!
      self.stop = fn_retval;

      // Get history by looking at the hidden Iframe's location.hash.
      history_get = function() {
        return get_fragment( iframe.location.href );
      };

      // Set a new history item by opening and then closing the Iframe
      // document, *then* setting its location.hash. If document.domain has
      // been set, update that as well.
      history_set = function( hash, history_hash ) {
        var iframe_doc = iframe.document,
          domain = $.fn[ str_hashchange ].domain;

        if ( hash !== history_hash ) {
          // Update Iframe with any initial `document.title` that might be set.
          iframe_doc.title = doc.title;

          // Opening the Iframe's document after it has been closed is what
          // actually adds a history entry.
          iframe_doc.open();

          // Set document.domain for the Iframe document as well, if necessary.
          domain && iframe_doc.write( '<script>document.domain="' + domain + '"</script>' );

          iframe_doc.close();

          // Update the Iframe's hash, for great justice.
          iframe.location.hash = hash;
        }
      };

    })();
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // ^^^^^^^^^^^^^^^^^^^ REMOVE IF NOT SUPPORTING IE6/7/8 ^^^^^^^^^^^^^^^^^^^
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

    return self;
  })();

})(jQuery,this);


//Cycler
/*!
 * jQuery Cycle Lite Plugin
 * http://malsup.com/jquery/cycle/lite/
 * Copyright (c) 2008-2012 M. Alsup
 * Version: 1.7 (20-FEB-2013)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * Requires: jQuery v1.3.2 or later
 */
var msie = true;

;(function($) {
"use strict";

var ver = 'Lite-1.7';
//var msie = /MSIE/.test(navigator.userAgent);

$.fn.cycle = function(options) {
    return this.each(function() {
        options = options || {};

        if (this.cycleTimeout)
            clearTimeout(this.cycleTimeout);

        this.cycleTimeout = 0;
        this.cyclePause = 0;

        var $cont = $(this);
        var $slides = options.slideExpr ? $(options.slideExpr, this) : $cont.children();
        var els = $slides.get();
        if (els.length < 2) {
//            if (window.console)
//                console.log('terminating; too few slides: ' + els.length);
            return; // don't bother
        }

        // support metadata plugin (v1.0 and v2.0)
        var opts = $.extend({}, $.fn.cycle.defaults, options || {}, $.metadata ? $cont.metadata() : $.meta ? $cont.data() : {});
        var meta = $.isFunction($cont.data) ? $cont.data(opts.metaAttr) : null;
        if (meta)
            opts = $.extend(opts, meta);

        opts.before = opts.before ? [opts.before] : [];
        opts.after = opts.after ? [opts.after] : [];
        opts.after.unshift(function(){ opts.busy=0; });

        // allow shorthand overrides of width, height and timeout
        var cls = this.className;
        opts.width = parseInt((cls.match(/w:(\d+)/)||[])[1], 10) || opts.width;
        opts.height = parseInt((cls.match(/h:(\d+)/)||[])[1], 10) || opts.height;
        opts.timeout = parseInt((cls.match(/t:(\d+)/)||[])[1], 10) || opts.timeout;

        if ($cont.css('position') == 'static')
            $cont.css('position', 'relative');
        if (opts.width)
            $cont.width(opts.width);
        if (opts.height && opts.height != 'auto')
            $cont.height(opts.height);

        var first = 0;
        $slides.css({position: 'absolute'}).each(function(i) {
            $(this).css('z-index', els.length-i);
        });
        $(els[first]).css('opacity',1).show(); // opacity bit needed to handle reinit case
        if (msie)
//        els[first].style.removeAttribute('filter');

        if (opts.fit && opts.width)
            $slides.width(opts.width);
        if (opts.fit && opts.height && opts.height != 'auto')
            $slides.height(opts.height);
        if (opts.pause)
            $cont.hover(function(){this.cyclePause=1;}, function(){this.cyclePause=0;});

        var txFn = $.fn.cycle.transitions[opts.fx];
        if (txFn)
            txFn($cont, $slides, opts);

        $slides.each(function() {
            var $el = $(this);
            this.cycleH = (opts.fit && opts.height) ? opts.height : $el.height();
            this.cycleW = (opts.fit && opts.width) ? opts.width : $el.width();
        });

        if (opts.cssFirst)
            $($slides[first]).css(opts.cssFirst);

        if (opts.timeout) {
            // ensure that timeout and speed settings are sane
            if (opts.speed.constructor == String)
                opts.speed = {slow: 600, fast: 200}[opts.speed] || 400;
            if (!opts.sync)
                opts.speed = opts.speed / 2;
            while((opts.timeout - opts.speed) < 250)
                opts.timeout += opts.speed;
        }
        opts.speedIn = opts.speed;
        opts.speedOut = opts.speed;

        opts.slideCount = els.length;
        opts.currSlide = first;
        opts.nextSlide = 1;

        // fire artificial events
        var e0 = $slides[first];
        if (opts.before.length)
            opts.before[0].apply(e0, [e0, e0, opts, true]);
        if (opts.after.length > 1)
            opts.after[1].apply(e0, [e0, e0, opts, true]);

        if (opts.click && !opts.next)
            opts.next = opts.click;
        if (opts.next)
            $(opts.next).unbind('click.cycle').bind('click.cycle', function(){return advance(els,opts,opts.rev?-1:1);});
        if (opts.prev)
            $(opts.prev).unbind('click.cycle').bind('click.cycle', function(){return advance(els,opts,opts.rev?1:-1);});

        if (opts.timeout)
            this.cycleTimeout = setTimeout(function() {
                go(els,opts,0,!opts.rev);
            }, opts.timeout + (opts.delay||0));
    });
};

function go(els, opts, manual, fwd) {
    var p = els[0].parentNode, curr = els[opts.currSlide], next = els[opts.nextSlide];

    if ($(p).css('display') == 'none') {p.cyclePause = true;curr.cycleTimeout = 0} else {p.cyclePause = false;curr.cycleTimeout = opts.timeout + (opts.delay||0);};
//    console.log(p.id + '-' + curr.cycleTimeout);
    if (opts.busy)
        return;

    if (p.cycleTimeout === 0 && !manual)
        return;

    if (manual || !p.cyclePause) {
        if (opts.before.length)
            $.each(opts.before, function(i,o) { o.apply(next, [curr, next, opts, fwd]); });
        var after = function() {
            if (msie)
//            this.style.removeAttribute('filter');
            $.each(opts.after, function(i,o) { o.apply(next, [curr, next, opts, fwd]); });
            queueNext(opts);
        };

        if (opts.nextSlide != opts.currSlide) {
            opts.busy = 1;
            $.fn.cycle.custom(curr, next, opts, after);
        }
        var roll = (opts.nextSlide + 1) == els.length;
        opts.nextSlide = roll ? 0 : opts.nextSlide+1;
        opts.currSlide = roll ? els.length-1 : opts.nextSlide-1;
    } else {
      queueNext(opts);
    }

    function queueNext(opts) {
        if (opts.timeout)
            p.cycleTimeout = setTimeout(function() { go(els,opts,0,!opts.rev); }, opts.timeout);
    }
}

// advance slide forward or back
function advance(els, opts, val) {
    var p = els[0].parentNode, timeout = p.cycleTimeout;
    if (timeout) {
        clearTimeout(timeout);
        p.cycleTimeout = 0;
    }
    opts.nextSlide = opts.currSlide + val;
    if (opts.nextSlide < 0) {
        opts.nextSlide = els.length - 1;
    }
    else if (opts.nextSlide >= els.length) {
        opts.nextSlide = 0;
    }
    go(els, opts, 1, val>=0);
    return false;
}

$.fn.cycle.custom = function(curr, next, opts, cb) {
    var $l = $(curr), $n = $(next);
    $n.css(opts.cssBefore);
    var fn = function() {$n.animate(opts.animIn, opts.speedIn, opts.easeIn, cb);};
    $l.animate(opts.animOut, opts.speedOut, opts.easeOut, function() {
        $l.css(opts.cssAfter);
        if (!opts.sync)
            fn();
    });
    if (opts.sync)
        fn();
};

$.fn.cycle.transitions = {
    fade: function($cont, $slides, opts) {
        $slides.not(':eq(0)').hide();
        opts.cssBefore = { opacity: 0, display: 'block' };
        opts.cssAfter  = { display: 'none' };
        opts.animOut = { opacity: 0 };
        opts.animIn = { opacity: 1 };
    },
    fadeout: function($cont, $slides, opts) {
        opts.before.push(function(curr,next,opts,fwd) {
            $(curr).css('zIndex',opts.slideCount + (fwd === true ? 1 : 0));
            $(next).css('zIndex',opts.slideCount + (fwd === true ? 0 : 1));
        });
        $slides.not(':eq(0)').hide();
        opts.cssBefore = { opacity: 1, display: 'block', zIndex: 1 };
        opts.cssAfter  = { display: 'none', zIndex: 0 };
        opts.animOut = { opacity: 0 };
        opts.animIn = { opacity: 1 };
    }
};

$.fn.cycle.ver = function() { return ver; };

// @see: http://malsup.com/jquery/cycle/lite/
$.fn.cycle.defaults = {
    animIn:        {},
    animOut:       {},
    fx:           'fade',
    after:         null,
    before:        null,
    cssBefore:     {},
    cssAfter:      {},
    delay:         0,
    fit:           0,
    height:       'auto',
    metaAttr:     'cycle',
    next:          null,
    pause:         false,
    prev:          null,
    speed:         1000,
    slideExpr:     null,
    sync:          true,
    timeout:       4000
};

})(jQuery);

function pass_show(){
    if ($("password").val() == "") {
            $("#pass").attr("value", $("#password").attr("title"));
            $("#password").hide();
            $("#pass").show();     }
}

pl_holder = function() {
    if ($.support.placeholder) {
        $("input, textarea").each(function(){
        this.placeholder = this.title;
        $(this).addClass('plhold');
        this.style.color = '#004080';
        });
        return;
    }
    $("input, textarea").each(function(){
      if ((this.value == "") && (!$(this).hasClass('spr'))) {
        if (!(this.id == "password")) { this.style.color = '#9966CC'; }
         this.value = this.title;
      }
    });
    $("input, textarea").blur(function(){
      if (this.value == "") {
        if (!(this.id == 'password')) {this.style.color = '#9966CC'};
        if ( this.id == 'password') {
            $("#pass").attr("value", $("#password").attr("title"));
            $("#password").hide();
            $("#pass").show();
        }
      this.value = this.title;
      }
    });
    $("input, textarea").focus(function(){
      if (this.value == this.title) {
        if (!(this.id == 'pass')) {this.style.color = '#004080'};
        if (this.id == "pass") {
            $("#pass").hide();
            $("#password").show();
            setTimeout(function () {$("#password").focus();}, 50);
        }
      if (this.type != "submit") this.value = '';
      }
    });
setTimeout(function() {$("#password").focus(); $("#password").blur(); }, 200);
}
function shufle(o) {
  var j, x, i = o.length;
    while (i) { // same as while(i != 0)
    j = parseInt(Math.random() * i);
    x = o[--i];
    o[i] = o[j];
    o[j] = x;
    }
    return o;
}

function slide(imgs, ids, spee, del) {
  var src='http://remar-auto.appspot.com/images/';
  function insert(ap,vl,fl) {
    $('<img src="'+fl+'" style="filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src="'+fl+'",sizingMethod="scale")"/>"').attr('src', fl).load(function(){
        if ($('.'+vl).length == 0) $(ids).append(ap);
        $('.'+vl).css("background","none\9");
        $('.'+vl).css("filter","progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+fl+"',sizingMethod='scale');");
        $(ids).cycle({timeout:spee, delay: del});
        });
  }
  if ($(ids).length == 0) return;
  jQuery.each(imgs, function(i,vl) {
    w = $('#slide').height();
    fl = src + vl + '.png';
    ap = '<span class="'+vl+' picture" style="position:absolute;background: url(' + fl + ') no-repeat;width:'+w+'px;height:'+w+'px;top:50%;left:50%;margin-top:-'+w/2+'px;margin-left:-'+w/2+'px;-webkit-background-size: contain;-moz-background-size: contain;-o-background-size: contain;background-size: contain;"></span>';
    $(ap).cycle({timeout: 0, delay: 0});
//    $('#slide').find('span '+vl).remove();
    insert(ap,vl,fl);
    });
}
function cycler(imgs, ids, spee, del) {
  var src='http://remar-auto.appspot.com/images/';
  function insert(ap,vl,fl) {
    $('<img src="'+fl+'" style="filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src="'+fl+'",sizingMethod="scale")"/>"').attr('src', fl).load(function(){
        if ($('.'+vl).length == 0) $(ids).append(ap);
        $('span.'+vl).css("background","none\9");
        $('span.'+vl).css("filter","progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+fl+"',sizingMethod='scale');");
        $('span.'+vl).css("-ms-filter","progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+fl+"',sizingMethod='scale');");
        $(ids).cycle({timeout:spee, delay: del});
        });
  }
  if ($(ids).length == 0) return;
  jQuery.each(imgs, function(i,vl) {
//    $('#cycler').css('width',($('#cycler').height()*1.265)+'px');
    h = $('#cycler').height();
    w = $('#cycler').width();
    fl = src + vl + '.png';
    ap = '<span class="'+vl+' picture" style="height:'+$('#cycler').height()+'px;width:'+$('#cycler').width()+'px;position:absolute;background: url(' + fl + ') no-repeat;right:0px;bottom:0px;-webkit-background-size: contain;-moz-background-size: contain;-o-background-size: contain; background-size: contain;"></span>';
//    $('#cycler').find('span '+vl).remove();
//    $('span '+vl).css( "background-size", "contain" );
    insert(ap,vl,fl);
    });
}



    $(function() {$('[autofocus]:not(:focus)').eq(0).focus();});
	$('.sections-header').toggleClass('inactive-header');
	$('.sections-header').first().toggleClass('active-header').toggleClass('inactive-header');
	$('.sections-content').first().slideDown('slow').toggleClass('open-content');
	$('.sections-header').click(function () {
        if($(this).is('.inactive-header')) {
			$('.active-header').toggleClass('active-header').toggleClass('inactive-header').next().slideToggle('slow').toggleClass('open-content');
			$(this).toggleClass('active-header').toggleClass('inactive-header');
			$(this).next().slideToggle('slow').toggleClass('open-content');
		}

    });

var $animate = false;

   function load(){
     function set(i){
       if (i > 9) i = 0;
       $('#loader').show();
       $(".search-Button").css("background-position",function(){return ( i * (-49)+'px 0px'); });
       if ($animate) {setTimeout(function() {set(++i);}, 50);} else {
        $('#loader').hide();
        $(".search-Button").css("background-position",'0px 0px');
        $(window).resize();
        return; }
        };
        set(0);
        };

   function isEmail(email) {
  			var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
  			return regex.test(email);
		};

   function search_info(srci) {
      var hci = '#' + srci;
      if (window.location.hash != hci) {window.location.hash = hci;return}
      $animate = true;
      load();
      var start = (new Date()).getTime();
      $.post("info_cat.php", srci, function(data) {
        if (data.file) {$('#loged').show();$('#login').hide();} else {alert('Влезте в Профила си, или се Регистрирайте!'); return;}
        $('#info_bg').html(data.contents);
        }, "json").done(function(data){
            var end = (new Date()).getTime();
            ex = $ex_c + ((end - start)/1000);
            if ($language=='bg') {$('.date').html($upd_c + data.date + ex + ' сек.');} else {$('.date').html($upd_c + data.date_en + ex + ' s.');}
            $('.usrr').html($us_c + data.user);
            $('#rp').hide();
            $('#home_bg, #products_bg, #partners_bg, .sm_products, .sm_partners, #slide, #cycler, #contact_us').hide();
            $c_menu = 4;
            $c_vmenu = 4;
            $c_vm = 1;
            $('#vm li.back_menu').stop().animate({top:  ($c_vm-1)*($('#vm li.back_menu').height())+10},500,'swing');
            $('#vmenu li.back_menu').stop().animate({top:  ($c_vmenu-1)*($('#vmenu li.back_menu').height())+10},500,'swing');
            $('#menu li.back_menu' ).stop().animate({left: ($c_menu-1)*($('#menu li').width())+0},500,'swing');
            $('#info_bg').show();
//            $('#photo').css( "background-size", "contain" );
        	$('.sections-header').toggleClass('inactive-header');
        	$('.sections-header').first().toggleClass('active-header').toggleClass('inactive-header');
        	$('.sections-content').first().slideDown('slow').toggleClass('open-content');
        	$('.sections-header').click(function () {
                if($(this).is('.inactive-header')) {
    			    $('.active-header').toggleClass('active-header').toggleClass('inactive-header').next().slideToggle('slow').toggleClass('open-content');
    			    $(this).toggleClass('active-header').toggleClass('inactive-header');
    			    $(this).next().slideToggle('slow').toggleClass('open-content');      }
                });
            $animate = false;
            });
      }

   function search_parts(srcp) {
      var hcp = '#' + srcp;
      if (window.location.hash != hcp) {window.location.hash = hcp;return}
      $animate = true;
      load();
      var start = (new Date()).getTime();
      $.post("parts_cat.php", srcp, function(data) {
        if (data.file) {$('#loged').show();$('#login').hide();} else {alert('Влезте в Профила си, или се Регистрирайте!'); return;}
        $('#catalogue_bg').html(data.contents);
        }, "json").done(function(data){
            var end = (new Date()).getTime();
            ex = $ex_c + ((end - start)/1000);
            if ($language=='bg') {$('.date').html($upd_c + data.date + ex + ' сек.');} else {$('.date').html($upd_c + data.date_en + ex + ' s.');}
            $('.usrr').html($us_c + data.user);
            $('#home_bg, #products_bg, #partners_bg, .sm_products, .sm_partners, #slide, #cycler, #info_bg, #contacts_bg, #contact_us').hide();
            $('.page_n').bind('click', function(e){
              e.preventDefault();
              srcp = ($(this).attr("href")).substr($(this).attr("href").indexOf('search_p='),100);
              search_parts(srcp);
              hcp = '#' + src;
              return false });
            $('.info_n').bind('click', function(e){
              e.preventDefault();
              srci = ($(this).attr("href")).substr($(this).attr("href").indexOf('search_i='),100);
              search_info(srci);
              hci = '#' + srci;
              return false });
            $c_menu = 4;
            $c_vmenu = 4;
            $c_vm = 1;
            $('#vm li.back_menu').stop().animate({top:  ($c_vm-1)*($('#vm li.back_menu').height())+10},500,'swing');
            $('#vmenu li.back_menu').stop().animate({top:  ($c_vmenu-1)*($('#vmenu li.back_menu').height())+10},500,'swing');
            $('#menu li.back_menu' ).stop().animate({left: ($c_menu-1)*($('#menu li').width())+0},500,'swing');
            $('#rp').show();
            $('#catalogue_bg, .sm_catalogue').show('fast');
            $('#cycler').hide();
            $animate = false;
            });
      }


   function search(src) {
      var hc = '#' + src;
      if (window.location.hash != hc) {window.location.hash = hc;return}
      $animate = true;
      load();
      var start = (new Date()).getTime();
      $.post("search_cat.php", src, function(data) {
        if (data.file) {$('#loged').show();$('#login').hide();} else {alert('Влезте в Профила си, или се Регистрирайте!'); return;}
        $('#catalogue_bg').html(data.contents);
        }, "json").done(function(data){
            var end = (new Date()).getTime();
            ex = $ex_c + ((end - start)/1000);
            if ($language=='bg') {$('.date').html($upd_c + data.date + ex + ' сек.');} else {$('.date').html($upd_c + data.date_en + ex + ' s.');}
            $('.usrr').html($us_c + data.user);
            $('#home_bg, #products_bg, #partners_bg, .sm_products, .sm_partners, #slide, #cycler, #info_bg, #contacts_bg, #contact_us').hide();
            $('.page_n').bind('click', function(e){
              e.preventDefault();
              src = ($(this).attr("href")).substr($(this).attr("href").indexOf('search='),100);
              search(src);
              hc = '#' + src;
              return false });
            $('.parts_n').bind('click', function(e){
              e.preventDefault();
              srcp = ($(this).attr("href")).substr($(this).attr("href").indexOf('search_p='),100);
              search_parts(srcp);
              hcp = '#' + srcp;
              return false });
            $('.info_n').bind('click', function(e){
              e.preventDefault();
              srci = ($(this).attr("href")).substr($(this).attr("href").indexOf('search_i='),100);
              search_info(srci);
              hci = '#' + srci;
              return false });
            $c_menu = 4;
            $c_vmenu = 4;
            $c_vm = 1;
            $('#vm li.back_menu').stop().animate({top:  ($c_vm-1)*($('#vm li.back_menu').height())+10},500,'swing');
            $('#vmenu li.back_menu').stop().animate({top:  ($c_vmenu-1)*($('#vmenu li.back_menu').height())+10},500,'swing');
            $('#menu li.back_menu' ).stop().animate({left: ($c_menu-1)*($('#menu li').width())+0},500,'swing');
            $('#rp').show();
            $('#catalogue_bg, .sm_catalogue').show('fast');
            $('#cycler, #info_bg').hide();
            $animate = false;
             });
      }
var $language = 'bg';
var $vmenu_cont_bg = ["Начало","Продукти","Алтернатори и Стартери","Части за Алтернатори","Части за Стартери","Партньори","Cargo","Mobiletron","O.R.M.E.","Каталог","Упътване","Подробно търсене","За Изтегляне","Контакти"];
var $vmenu_cont_en = ["Home","Products","Alternators and Starters","Spare Parts for Alternators","Spare Parts for Starters","Partners","Cargo","Mobiletron","O.R.M.E.","Catalogue","Instructions","Advansed Search","for Download","Contacts"];
var $menu_cont_en = ["Home","Products","Partners","Catalogue","Contacts"];
var $menu_cont_bg = ["Начало","Продукти","Партньори","Каталог","Контакти"];
var $us_bg = 'Потребител: ';
var $us_en = 'User: ';
var $us_c = $us_bg;
var $upd_bg = 'Последно обновяване на данните:<br>';
var $upd_en = 'Data was last updated:<br>';
var $upd_c = $upd_bg;
var $ex_bg = '<br>Търсенето отне: ';
var $ex_en = '<br>Execution time: ';
var $ex_c = $ex_bg;
var $c_menu = 1;
var $c_vmenu = 1;
var $c_vm = 1;
var $cat = $('#catalogue_bg').html();
var $hac = '';
var $map = true;
var $map_en = true;

    home_bgf = function(){

      $c_menu = 1;
      $c_vmenu = 1;
      $('#vmenu li.back_menu').stop().animate({top:  ($c_vmenu-1)*($('#vmenu li.back_menu').height())+10},500,'swing');
      $('#menu li.back_menu' ).stop().animate({left: ($c_menu-1)*($('#menu li').width())+0},500,'swing');
      $('#rp').show();
      $('#products_bg, #partners_bg, #catalogue_bg, .sm_products, .sm_partners, .sm_catalogue, #login, #loged, #info_bg, #contacts_bg, #contact_us').hide();
      $('#home_bg, #cycler, #slide').show('fast');
      }
    products_bgf = function() {

      $c_menu = 2;
      $c_vmenu = 2;
      $('#vmenu li.back_menu').stop().animate({top:  ($c_vmenu-1)*($('#vmenu li.back_menu').height())+10},500,'swing');
      $('#menu li.back_menu' ).stop().animate({left: ($c_menu-1)*($('#menu li').width())+0},500,'swing');
      $('#rp').show();
      $('#home_bg, #partners_bg, #catalogue_bg, .sm_partners, .sm_catalogue, #login, #loged, #info_bg, #contacts_bg, #contact_us').hide();
      $('#products_bg, .sm_products, #cycler, #slide').show('fast');
      }
    partners_bgf = function() {

      $c_menu = 3;
      $c_vmenu = 4;
      $('#vmenu li.back_menu').stop().animate({top:  ($c_vmenu-1)*($('#vmenu li.back_menu').height())+10},500,'swing');
      $('#menu li.back_menu' ).stop().animate({left: ($c_menu-1)*($('#menu li').width())+0},500,'swing');
      $('#rp').show();
      $('#home_bg, #products_bg, #catalogue_bg, .sm_products, .sm_catalogue, #cycler, #login, #loged, #info_bg, #contacts_bg, #contact_us').hide();
      $('#partners_bg, .sm_partners, #slide').show('fast');
      }
    catalogue_bgf = function() {

      $('#catalogue_bg').html($cat);
      $('#rp, #login').show();
      $('#home_bg, #products_bg, #partners_bg, .sm_products, .sm_partners, #slide, #info_bg, #contacts_bg, #contact_us, #loged').hide();
      $.get("logstatus.php", function(data){
      if (data.file) {$('#loged').show();$('#login').hide();}  else {$('#login').show();$('#loged').hide();}
        $('.date').html($upd_c + data.date);
        $('.usrr').html($us_c + data.user);
        }, "json");
      $c_vm = 1;
      $c_menu = 4;
      $c_vmenu = 4;
      $('#vm li.back_menu').stop().animate({top:  ($c_vm-1)*($('#vm li.back_menu').height())+10},500,'swing');
      $('#vmenu li.back_menu').stop().animate({top:  ($c_vmenu-1)*($('#vmenu li.back_menu').height())+10},500,'swing');
      $('#menu li.back_menu' ).stop().animate({left: ($c_menu-1)*($('#menu li').width())+0},500,'swing');
      $('#catalogue_bg, .sm_catalogue, #cycler').show('fast');

      }

    contacts_bgf = function() {
      $('#rp').show();
      $('#home_bg, #products_bg, #partners_bg, .sm_products, .sm_partners, #slide, #info_bg, #catalogue_bg, .sm_catalogue, #cycler, #login, #loged').hide();
      $c_menu = 5;
      $c_vmenu = 5;

      $('#menu li.back_menu' ).stop().animate({left: ($c_menu-1)*($('#menu li').width())+0},500,'swing');
      $('#vmenu li.back_menu').stop().animate({top:  ($c_vmenu-1)*($('#vmenu li.back_menu').height())+10},500,'swing');
      $('#contacts_bg, #contact_us').show('fast');
//      if ($map && $language == 'bg') {loadMap();$map = false;$map_en = false;}
//      if ($map_en && $language == 'en') {loadMap_en();$map = false;$map_en = false;}
      if ($language == 'bg') {
        $('#map_bg').show();
        if ($map) {// console.log('ínserted bg-map');
            $map = false;
            $('#map_bg').html('<iframe src="map_bg.html" width="100%" height="300px" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" align="middle"></iframe>');}
            }
        else {
        $('#map_en').show();
        if ($map_en) {// console.log('ínserted en-map');
            $map_en = false;
            $('#map_en').html('<iframe src="map_en.html" width="100%" height="300px" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" align="middle"></iframe>');}
            }
      }

    register_bgf = function() {
      $('#rp').show();
      $('#home_bg, #products_bg, #partners_bg, .sm_products, .sm_partners, #slide, #info_bg, #cycler, #contact_us').hide();
      $.get("register_bg.txt", function(data){
        $('#login').show();
        $('#loged').hide();
        $('#catalogue_bg').html(data);
        w = $('#un').width();
        $('select').css({'width': w+7});});
      $c_menu = 4;
      $c_vmenu = 4;
      setTimeout('pl_holder()', 400);
      $('#vmenu li.back_menu').stop().animate({top:  ($c_vmenu-1)*($('#vmenu li.back_menu').height())+10},500,'swing');
      $('#menu li.back_menu' ).stop().animate({left: ($c_menu-1)*($('#menu li').width())+0},500,'swing');
      $('#catalogue_bg, .sm_catalogue').show('fast');
      }
    profile_bgf = function() {
      $.get("http://test.remar-auto.com/profile_bg.php", function(data){
        if (!data.file) {register_bgf();return;}
        $('#loged').show();
        $('#login').hide();
        $.get("http://test.remar-auto.com/profile_bg.txt", function(ct){$('#catalogue_bg').html(ct);}).done(function(){
            $('[name="user_name"]').val(data.user);
            $('[name="mail"]').val(data.mail);
            $('[name="u_name"]').val(data.name);
            $('[name="company"]').val(data.company);
            $('[name="country"]').val(data.country);
            $('[name="city"]').val(data.city);
            $('[name="address"]').val(data.address);
            $('[name="phone"]').val(data.phone);
            $('.date').html('Последно обновяване на данните:<br>'+data.date);
            $('.usrr').html('Потребител: '+data.user);
            w = $('#un').width();
            $('select').css({'width': w+7});
            });
        }, "json");
      $('#rp').show();
      $('#home_bg, #products_bg, #partners_bg, .sm_products, .sm_partners, #slide, #info_bg, #cycler').hide();
      $c_menu = 4;
      $c_vmenu = 4;
      $c_vm = 2;
      setTimeout('pl_holder()', 400);
      $('#vm li.back_menu').stop().animate({top:  ($c_vm-1)*20+10},500,'swing');
      $('#vmenu li.back_menu').stop().animate({top:  ($c_vmenu-1)*($('#vmenu li.back_menu').height())+10},500,'swing');
      $('#menu li.back_menu' ).stop().animate({left: ($c_menu-1)*($('#menu li').width())+0},500,'swing');
      $('#catalogue_bg, .sm_catalogue').show('fast');
      }

    hash_change = function(h) {
        mn = function(l) {
          if ($language == 'bg') {
            lm = $menu_cont_bg;
            lvm = $vmenu_cont_bg;
            $us_c = $us_bg;
            $upd_c = $upd_bg;
            $ex_c = $ex_bg;
            $(".user.login-Box").attr({title: "Потребител", value: ""});
            $("#password").attr({title: "Парола", value: ""});
            $("#sr").attr({title: "Търсене...", value: ""});} else {
              lm = $menu_cont_en;
              lvm = $vmenu_cont_en;
              $us_c = $us_en;
              $upd_c = $upd_en;
              $ex_c = $ex_en;
              $(".user.login-Box").attr({title: "User", value: ""});
              $("#password").attr({title: "Password", value: ""});
              $("#sr").attr({title: "Search...", value: ""});}
          setTimeout('pl_holder()', 100);
          $.each(lm, function(i,v){$('#menu.shadow-30 li').eq(i+1).children().text(v);});
          $.each(lvm, function(i,v){$('#vmenu li').eq(i+1).children().text(v);});
          }
        mn($language);
        if ((h == '#home') || (h == '')) home_bgf();
        if (h == '#products') products_bgf();
        if (h == '#partners') partners_bgf();
        if (h == '#catalogue') catalogue_bgf();
        if (h == '#contacts') contacts_bgf();
        if (h == '#register') register_bgf();
        if (h == '#profile') profile_bgf();
        if (h.indexOf('#search=') >=0 ) {search(h.substr(1));}
        if (h.indexOf('#search_p=') >=0 ) {search_parts(h.substr(1));}
        if (h.indexOf('#search_i=') >=0 ) {search_info(h.substr(1));}

    }

    $('#auth').submit(function(e){
      e.preventDefault();
      $.post("http://test.remar-auto.com/logstatus.php", $('#auth').serialize(), function(data) {
        if (!data.file) {alert('Wrong password!');} else {catalogue_bgf();}
        }, "json");
      });
    $('#search').submit(function(e){e.preventDefault();search($('#search').serialize());});
    $('#bt_home_bg, .bt_home_bg').click(function(){home_bgf();});
    $('#bt_register_bg, .bt_register_bg').click(function(){register_bgf();});
    $('.bt_profile_bg').click(function(){profile_bgf();});
    $('#bt_products_bg, .bt_products_bg, bt_cargo_bg').click(function(){products_bgf();});
    $('#bt_partners_bg, .bt_partners_bg').click(function(){partners_bgf();});
    $('#bt_catalogue_bg, .bt_catalogue_bg').click(function(){catalogue_bgf();});
    $('#bt_contacts_bg, .bt_contacts_bg').click(function(){contacts_bgf();});
    $('.bt_logout_bg').click(function(){$.get("http://test.remar-auto.com/log-out.php").done(catalogue_bgf);});
    $('.spr.bottom.bg').click(function(e){e.preventDefault();$language='bg';$("#map_en").hide();hash_change(location.hash)});
    $('.spr.bottom.us').click(function(e){e.preventDefault();$language='us';$("#map_bg").hide();hash_change(location.hash)});
    $('#menu li').mouseover(function(e)  { $('#menu').find('li.back_menu').stop().animate({left: ($(this).index('li')-1)*($('#menu li').width())+0},500,'swing'); });
    $('#vmenu li').mouseover(function(e) { $('#vmenu').find('li.back_menu').stop().animate({top:  ($(this).index('#vmenu li:visible')-1)*($('#vmenu li.back_menu').height())+10},500,'swing'); });
    $('#menu li').mouseleave(function(e) { $('#menu').find('li.back_menu').stop().animate({left: ($c_menu-1)*($('#menu li').width())+0},500,'swing'); });
    $('#vmenu li').mouseleave(function(e){ $('#vmenu').find('li.back_menu').stop().animate({top:  ($c_vmenu-1)*($('#vmenu li.back_menu').height())+10},500,'swing'); });
    $('#vm li').mouseover(function(e) { $('#vm li.back_menu').stop().animate({top:  ($(this).index('#vm li')-1)*($('#vm li.back_menu').height())+10},500,'swing'); });
    $('#vm li').mouseleave(function(e){ $('#vm li.back_menu').stop().animate({top:  ($c_vm-1)*($('#vm li.back_menu').height())+10},500,'swing'); });
    $(".search-Button").mouseenter(function(){$(this).css("background-position",'-489px 0px');});
    $(".search-Button").mouseleave(function(){$(this).css("background-position",'   0px 0px');});


//$(window).on('hashchange', function(){ hash_change(); });
$(window).hashchange( function(){hash_change(location.hash);});
$(window).load(function()
{
    var h = $(window).height(); //window.innerHeight;
    var t = $('.header').height()+$('#menu').height();
    if (h/55>12) {$('html').css('font-size',h/55);} else {$('html').css('font-size',12);}
    if (h/55>12) {
        $('#vmenu li').css('height',Math.round(h/35));
        $('#vm li').css('height',Math.round(h/35));
        }  else {
        $('#vmenu li').css('height',23);
        $('#vm li').css('height',23);
        }
    if ((t+20)>($('#sheet').offset().top)) {
      $('#sheet').css('top',t+10+'px');
      $('#block').css('top',t+10+'px');
      $('#sheet').css('margin-top',0);
      $('#block').css('margin-top',0);
      } else {
      $('#sheet').css('top',50+'%');
      $('#block').css('top',50+'%');
      $('#sheet').css('margin-top',-17+'%');
      $('#block').css('margin-top',-17+'%');
      }
    if ($('#cycler').is(":visible")) {
        $('#cycler').css('width',($('#cycler').height()*1.265)+'px');
        $("#cycler span").css('width', $('#cycler').width()+'px');
        $("#cycler span").css('height', $('#cycler').height()+'px');
        }
    if ($('#slide').is(":visible")) {
        $('#slide').css('width',($('#slide').height())+'px');
        $('#slide').css('margin-left',($('#slide').width()/(-2))+'px');
        $("#slide span").css('width', $('#slide').width()+'px');
        $("#slide span").css('height', $('#slide').height()+'px');
        }
    $('#cycler').animate({opacity:'1'},1400);
    $('#slide').animate({opacity:'1'},2100);
    setTimeout('pl_holder()', 200);
    setTimeout('cycler(shufle(["alternator","starter","drive"]), "#cycler", 7000, 3500)', 100);
    setTimeout('slide(shufle(["Cargo-m","Mobiletron-m","Orme","Omar","Carbosint","zm","ina","nsk"]), "#slide", 7000, 0)', 100);
//    $('.picture').css( "background-size", "contain" );
//    $('#photo').css( "background-size", "contain" );
  return false;
  });
$( window ).resize(function() {
    var h = $(window).height(); //window.innerHeight;
    var t = $('.header').height()+$('#menu').height();

    if (h/55>12) {$('html').css('font-size',h/55);} else {$('html').css('font-size',12);}
    if (h/55>12) {
        $('#vmenu li').css('height',Math.round(h/35));
        $('#vm li').css('height',Math.round(h/35));
        }  else {
        $('#vmenu li').css('height',23);
        $('#vm li').css('height',23);
        }
    if ((t+20)>($('#sheet').offset().top)) {
      $('#sheet').css('top',t+10+'px');
      $('#block').css('top',t+10+'px');
      $('#sheet').css('margin-top',0);
      $('#block').css('margin-top',0);
      } else {
      $('#sheet').css('top',50+'%');
      $('#block').css('top',50+'%');
      $('#sheet').css('margin-top',-17+'%');
      $('#block').css('margin-top',-17+'%');
      }
    if ($('#cycler').is(":visible")) {
        $('#cycler').css('width',($('#cycler').height()*1.265)+'px');
        $("#cycler span").css('width', $('#cycler').width()+'px');
        $("#cycler span").css('height', $('#cycler').height()+'px');
        }
    if ($('#slide').is(":visible")) {
        $('#slide').css('width',($('#slide').height())+'px');
        $('#slide').css('margin-left',($('#slide').width()/(-2))+'px');
        $("#slide span").css('width', $('#slide').width()+'px');
        $("#slide span").css('height', $('#slide').height()+'px');
        }
    w = $('#un').width();
    $('select').css({'width': w+7});
    $('#vmenu li').mouseleave();
    $('#vm li').mouseleave();
    $('#menu li').mouseleave();
//    $('#photo').css( "background-size", "contain" );
    });
