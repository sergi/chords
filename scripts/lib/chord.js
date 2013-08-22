/*
 * Loosely based on Vex Guitar Chord Chart Renderer by
 * Mohit Muthanna Cheppudira -- http://0xfe.blogspot.com
 *
 */

var svgns = "http://www.w3.org/2000/svg";

function line(x, y, x2, y2, w) {
  var line = document.createElementNS(svgns, "line");
  line.setAttribute("x1", x);
  line.setAttribute("y1", y);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);

  if (w) {
    line.setAttribute("stroke-width", w);
  }

  return line;
}

function circle(x, y, r) {
  var circle = document.createElementNS(svgns, "circle");
  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("r", r);
  circle.setAttribute("stroke", "#000");
  circle.setAttribute("fill", "#fff");

  return circle;
}

function text(x, y, text) {
  var txt = document.createElementNS(svgns, "text");
  txt.setAttribute("x", x);
  txt.setAttribute("y", y);
  txt.textContent = text;

  return txt;
}

ChordBox = function(paper, x, y, width, height) {
  this.paper = paper;
  this.x = x;
  this.y = y;

  this.width = width || 100;
  this.height = height || 100;
  this.tuning = ["E", "A", "D", "G", "B", "E"];
  this.numStrings = 6;
  this.numFrets = 5;

  this.metrics = {
    circle_radius: this.width / 24,
    text_shift_x: this.width / 25,
    text_shift_y: this.height / 25,
    font_size: this.width / 8,
    bar_shift_x: this.width / 24,
    bridge_stroke_width: 3,
    chord_fill: "#444"
  };

  this.spacing = this.width / this.numStrings;
  this.fretSpacing = this.height / (this.numFrets + 1);

  // Content
  this.position = 0;
  this.postitionText = 0;
  this.chord = [];
  this.bars = [];
};

ChordBox.prototype.setNumFrets = function(numFrets) {
  this.numFrets = numFrets;
  this.fretSpacing = this.height / (this.numFrets + 1);
  return this;
};

ChordBox.prototype.setChord = function(chord, position, bars, postitionText) {
  this.chord = chord;
  this.position = position || 0;
  this.postitionText = postitionText || 0;
  this.bars = bars || [];
  return this;
};

ChordBox.prototype.setPositionText = function(position) {
  this.postitionText = position;
  return this;
};

ChordBox.prototype.draw = function() {
  var i;
  var spacing = this.spacing;
  var fs = this.fretSpacing;

  // Draw guitar bridge
  var _line = line(
    this.x,
    this.y - (this.position <= 1 ? 1 : 0),
    this.x + (spacing * (this.numStrings - 1)),
    this.y - (this.position <= 1 ? 1 : 0),
    this.position <= 1 ? this.metrics.bridge_stroke_width : 1);
  _line.setAttribute("fill", "black"); // Set wedge color
  _line.setAttribute("stroke", "black"); // Outline wedge in black

  this.paper.appendChild(_line);

  if (this.position > 1) {
    // Draw position number
    var posNum = text(
      this.x - (this.spacing / 2) - this.metrics.text_shift_x,
      this.y + (fs / 2) + this.metrics.text_shift_y + (fs * this.postitionText),
      this.position);

    posNum.setAttribute("font-size", this.metrics.font_size);
    this.paper.appendChild(posNum);
  }

  // Draw strings
  var stringsEl = document.createElementNS(svgns, "g");
  stringsEl.setAttribute("fill", "black"); // Set wedge color
  stringsEl.setAttribute("stroke", "black"); // Outline wedge in black
  for (i = 0; i < this.numStrings; ++i) {
    stringsEl.appendChild(
      line(
        this.x + (spacing * i),
        this.y,
        this.x + (spacing * i),
        this.y + (fs * (this.numFrets))));
  }
  this.paper.appendChild(stringsEl);

  // Draw frets
  var fretsEl = document.createElementNS(svgns, "g");
  fretsEl.setAttribute("fill", "black"); // Set wedge color
  fretsEl.setAttribute("stroke", "black"); // Outline wedge in black
  for (i = 1; i < this.numFrets + 1; ++i) {
    fretsEl.appendChild(
      line(this.x, this.y + (fs * i),
        this.x + (spacing * (this.numStrings - 1)),
        this.y + (fs * i)));
  }
  this.paper.appendChild(fretsEl);

  // Draw tuning keys
  var tuningEl = document.createElementNS(svgns, "g");
  for (i = 0; i < this.tuning.length; ++i) {
    var t = text(
      this.x + (this.spacing * i),
      this.y + ((this.numFrets + 1) * fs),
      this.tuning[i]);

    t.setAttribute("font-size", this.metrics.font_size);
    tuningEl.appendChild(t);
  }
  this.paper.appendChild(tuningEl);

  // Draw chord
  for (i = 0; i < this.chord.length; ++i) {
    this.lightUp(this.chord[i][0], this.chord[i][1]);
  }

  // Draw bars
  for (i = 0; i < this.bars.length; ++i) {
    this.lightBar(this.bars[i].from_string,
      this.bars[i].to_string,
      this.bars[i].fret);
  }
};

ChordBox.prototype.lightUp = function(string_num, fret_num) {
  string_num = this.numStrings - string_num;

  var shift_position = 0;
  if (this.position === 1 && this.postitionText === 1) {
    shift_position = this.postitionText;
  }

  var mute = false;
  if (fret_num === "x") {
    fret_num = 0;
    mute = true;
  }
  else {
    fret_num -= shift_position;
  }

  var x = this.x + (this.spacing * string_num);
  var y = this.y + (this.fretSpacing * (fret_num - 1)) + (this.fretSpacing / 2);
  var c;
  if (mute) {
    c = text(x, y, "X");
    c.setAttribute("font-size", this.metrics.font_size);
  } else {
    c = circle(x, y, this.metrics.circle_radius);
    if (fret_num > 0) {
      c.setAttribute("fill", this.metrics.chord_fill);
    }
  }
  this.paper.appendChild(c);

  return this;
};

ChordBox.prototype.lightBar = function(string_from, string_to, fret_num) {
  if (this.position === 1 && this.postitionText === 1) {
    fret_num -= this.postitionText;
  }

  var string_from_num = this.numStrings - string_from;
  var string_to_num = this.numStrings - string_to;

  var x = this.x + (this.spacing * string_from_num) - this.metrics.bar_shift_x;
  var x_to = this.x + (this.spacing * string_to_num) + this.metrics.bar_shift_x;

  var fs = this.fretSpacing;
  var _y = this.y + (fs * (fret_num - 1));
  var y = _y + (fs / 4);
  var y_to = _y + ((fs / 4) * 3);

  var halfStroke = ((y_to - y) / 2);
  var capo = line(
    x + halfStroke,
    y + halfStroke,
    x + (x_to - x) - halfStroke,
    y + halfStroke,
    y_to - y);

  capo.setAttribute("stroke-linecap", "round");
  capo.setAttribute("fill", this.metrics.chord_fill);

  this.paper.appendChild(capo);

  return this;
};
