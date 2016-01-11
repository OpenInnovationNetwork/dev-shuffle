var DEMO = (function( $ ) {
  'use strict';

  var $grid = $('#grid'),
      $filterOptions = $('.filter-options'),
      $sizer = $grid.find('.shuffle__sizer'),

  init = function() {

    // Display initial items
    displayItems();

    // None of these need to be executed synchronously
    setTimeout(function() {
      listen();
      setupFilters();
      setupSorting();
      setupSearching();
    }, 100);

    // You can subscribe to custom events.
    // shrink, shrunk, filter, filtered, sorted, load, done
    $grid.on('loading.shuffle done.shuffle layout.shuffle', function(evt, shuffle) {
      // Make sure the browser has a console
      if ( window.console && window.console.log && typeof window.console.log === 'function' ) {
        console.log( 'Shuffle:', evt.type );
      }
    });

    // instantiate the plugin
    $grid.shuffle({
      itemSelector: '.picture-item',
      sizer: $sizer
    });

    // Destroy it! o_O
    // $grid.shuffle('destroy');
  },


  getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  displayItems = function() {
    // Creating random elements. You could use an
    // ajax request or clone elements instead
    var itemsToCreate = 5,
        frag = document.createDocumentFragment(),
        items = [],
        $items,
        classes = ['w2', 'h2', 'w3'],
        box, i, random, randomClass;

    for (i = 0; i < itemsToCreate; i++) {
      random = Math.random();
      box = document.createElement('div');
      box.className = 'box';
      box.setAttribute('created', getRandomInt(1, 150));

      // Randomly add a class
      if ( random > 0.8 ) {
        randomClass = Math.floor( Math.random() * 3 );
        box.className = box.className + ' ' + classes[ randomClass ];
      }

      box.innerHTML = "Box "+i;
      items.push( box );
      frag.appendChild( box );
    }

    $items = $(items);

    // Insert items in the grid
    $grid.append(frag);

    // Tell shuffle items have been appended.
    // It expects a jQuery object as the parameter.
    $grid.shuffle('appended', $items );
  },

  // Set up button clicks
  setupFilters = function() {
    var $btns = $filterOptions.children();
    $btns.on('click', function() {
      var $this = $(this),
          isActive = $this.hasClass( 'active' ),
          group = isActive ? 'all' : $this.data('group');

      // Hide current label, show current label in title
      if ( !isActive ) {
        $('.filter-options .active').removeClass('active');
      }

      $this.toggleClass('active');

      // Filter elements
      $grid.shuffle( 'shuffle', group );
    });

    $btns = null;
  },

  setupSorting = function() {
    // Sorting options
    $('.sort-options').on('change', function() {
      var sort = this.value,
          opts = {};

      // We're given the element wrapped in jQuery
      if ( sort === 'date-created' ) {
        opts = {
          reverse: true,
          by: function($el) {
            return $el.data('date-created');
          }
        };
      } else if ( sort === 'title' ) {
        opts = {
          by: function($el) {
            return $el.data('title').toLowerCase();
          }
        };
      }

      // Filter elements
      $grid.shuffle('sort', opts);
    });
  },

  setupSearching = function() {
    // Advanced filtering
    $('.js-shuffle-search').on('keyup change', function() {
      var val = this.value.toLowerCase();
      $grid.shuffle('shuffle', function($el, shuffle) {

        // Only search elements in the current group
        if (shuffle.group !== 'all' && $.inArray(shuffle.group, $el.data('groups')) === -1) {
          return false;
        }

        var text = $.trim( $el.find('.picture-item__title').text() ).toLowerCase();
        return text.indexOf(val) !== -1;
      });
    });
  },

  // Re layout shuffle when images load. This is only needed
  // below 768 pixels because the .picture-item height is auto and therefore
  // the height of the picture-item is dependent on the image
  // I recommend using imagesloaded to determine when an image is loaded
  // but that doesn't support IE7
  listen = function() {
    var debouncedLayout = $.throttle( 300, function() {
      $grid.shuffle('update');
    });

    // Get all images inside shuffle
    $grid.find('img').each(function() {
      var proxyImage;

      // Image already loaded
      if ( this.complete && this.naturalWidth !== undefined ) {
        return;
      }

      // If none of the checks above matched, simulate loading on detached element.
      proxyImage = new Image();
      $( proxyImage ).on('load', function() {
        $(this).off('load');
        debouncedLayout();
      });

      proxyImage.src = this.src;
    });

    // Because this method doesn't seem to be perfect.
    setTimeout(function() {
      debouncedLayout();
    }, 500);
  };

  return {
    init: init
  };
}( jQuery ));



$(document).ready(function() {
  DEMO.init();
});
