'use strict';

function createCanvas(width, height) {
  var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);

  return svg;
}

angular.module('chordsApp', [])
  .controller('MainCtrl', ['$scope', function (scope) {
    scope.chordTable = chordTable;
    scope.chordName = "C";
    scope.filterChords = function (chords) {
      var result = {};
      var value = scope.chordName;
      angular.forEach(chords, function (v, k) {
        if (k[0] && value && k[0].toLowerCase() == value[0].toLowerCase()) {
          result[k] = chordTable[k];
        }
      });
      return result;
    }
  }])
  .directive('chord', function () {
    return {
      restrict: "C",
      link: function (scope, element, attrs) {
        var sq = Math.min(window.innerWidth, window.innerHeight) * Number(attrs.size);
        var canvas = createCanvas(sq * 1.2, sq * 1.2);
        var chord = new ChordBox(canvas, sq / 5, sq / 5, sq, sq)

        attrs.$observe('chordname', function (value) {
          var inputChord;

          if (value) {
            inputChord = chordTable[value];
            chord.setChord(inputChord[0], inputChord[1] || 1);
            chord.draw();
          } else {
            scope.$watch('chordName', function (value) {
              if (!value) return;

              canvas.textContent = "";
              inputChord = chordTable[chordLowerCase[value.toLowerCase()]] || [];

              chord.setChord(inputChord[0] || [
                [1, 2],
                [2, 1],
                [3, 2],
                [4, 0],
                [5, 'x'],
                [6, 'x']
              ], inputChord[1] || 1);

              chord.draw();
            });
          }
        });
        element[0].appendChild(canvas);
      }
    }
  });
