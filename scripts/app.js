'use strict';

function createCanvas(width, height) {
  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);

  return svg;
}

function capitalise(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

angular.module('chordsApp', [])
  .controller('MainCtrl', ['$scope',
  function(scope) {
    scope.chordTable = chordTable;
    scope.chordName = 'C';
    scope.changeChord = function(chord) {
      //scope.$apply(function () {
      scope.chordName = chord;
      //});
    };

    scope.filterChords = function(chords) {
      var result = {};
      var value = scope.chordName;
      angular.forEach(chords, function(v, k) {
        if (k[0] && value && k[0].toLowerCase() === value[0].toLowerCase()) {
          result[k] = chordTable[k];
        }
      });
      return result;
    };
  }
])
  .directive('chord', function() {
  return {
    restrict: 'C',
    link: function(scope, element, attrs) {
      var sq = Math.min(window.innerWidth, window.innerHeight) * Number(attrs.size);
      var canvas = createCanvas(sq * 1.2, sq * 1.3);
      var chord, name;
      name = document.createElement('span');
      name.classList.add('chord_title');
      if (attrs.type === 'simple')
        chord = new ChordBoxSimple(canvas, sq / 5, sq / 5, sq, sq);
      else
        chord = new ChordBox(canvas, sq / 5, sq / 5, sq, sq);

      attrs.$observe('chordname', function(value) {
        var inputChord;

        if (value) {
          inputChord = chordTable[value];
          chord.setChord(inputChord[0], inputChord[1] || 1);
          chord.draw();
          document.body.scrollTop = document.documentElement.scrollTop = 0;
          name.textContent = capitalise(value);
        } else {
          scope.$watch('chordName', function(value) {
            if (!value) return;

            canvas.textContent = '';
            inputChord = chordTable[chordLowerCase[value.toLowerCase()]] || [];

            name.textContent = capitalise(value);
            chord.setChord(inputChord[0] || [
              [1, 2],
              [2, 1],
              [3, 2],
              [4, 0],
              [5, 'x'],
              [6, 'x']
            ], inputChord[1] || 1);

            chord.draw();
            document.body.scrollTop = document.documentElement.scrollTop = 0;
          });
        }
      });
      element[0].appendChild(name);
      element[0].appendChild(canvas);
    }
  };
}).directive('ngTap', function() {
  var isTouch = !! ('ontouchstart' in window);
  return function(scope, elm, attrs) {
    // if there is no touch available, we'll fall back to click
    if (isTouch) {
      var tapping = false;
      elm.bind('touchstart', function() {
        tapping = true;
      });
      // prevent firing when someone is f.e. dragging
      elm.bind('touchmove', function() {
        tapping = false;
      });
      elm.bind('touchend', function() {
        tapping && scope.$apply(attrs.ngTap);
      });
    } else {
      elm.bind('click', function() {
        scope.$apply(attrs.ngTap);
      });
    }
  };
});
