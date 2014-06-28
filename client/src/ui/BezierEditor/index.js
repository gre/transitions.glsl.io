/** @jsx React.DOM */
var React = require("react");
var _ = require("lodash");

var BezierEditor = React.createClass({
  propTypes: {
    value: React.PropTypes.array,
    onChange: React.PropTypes.func,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    handleRadius: React.PropTypes.number,
    padding: React.PropTypes.array
  },
  getDefaultProps: function () {
    return {
      value: [ 0, 0, 1, 1 ],
      onChange: _.noop,
      width: 300,
      height: 300,
      handleRadius: 5,
      padding: [25, 5, 25, 18]
    };
  },
  getInitialState: function () {
    return {
      down: 0,
      startx: null,
      starty: null
    };
  },
  render: function () {
    var x = _.bind(this.x, this);
    var y = _.bind(this.y, this);
    var width = this.props.width;
    var height = this.props.height;
    var value = this.props.value;
    var handleRadius = this.props.handleRadius;
    var sx = x(0);
    var sy = y(0);
    var ex = x(1);
    var ey = y(1);
    var cx1 = x(value[0]);
    var cy1 = y(value[1]);
    var cx2 = x(value[2]);
    var cy2 = y(value[3]);
    var gridbg = [
      "M"+[sx,sy],
      "L"+[sx,ey],
      "L"+[ex,ey],
      "L"+[ex,sy],
      "Z"
    ].join(" ");
    var curve = [
      "M"+[sx,sy],
      "C"+[cx1,cy1],
      ""+[cx2,cy2],
      ""+[ex,ey]
    ].join(" ");

    var xhalf = this.gridX(2);
    var yhalf = this.gridY(2);
    var xtenth = this.gridX(10);
    var ytenth = this.gridY(10);

    var tenth = 
      _.map(xtenth, function (xp) {
        return [ "M"+[xp,sy], "L"+[xp,ey] ];
      }).concat(
        _.map(ytenth, function (yp) {
          return [ "M"+[sx,yp], "L"+[ex,yp] ];
        })
    ).join(" ");

    var half =
      _.map(xhalf, function (xp) {
        return [ "M"+[xp,sy], "L"+[xp,ey] ];
      }).concat(
      _.map(yhalf, function (yp) {
        return [ "M"+[sx,yp], "L"+[ex,yp] ];
      })
    ).join(" ");

    var ticksLeft =
      _.map(ytenth, function (yp, i) {
        var w = 3 + (i % 5 === 0 ? 2 : 0);
        return [ "M"+[sx,yp], "L"+[sx-w,yp] ];
      }).join(" ");

    var ticksBottom =
      _.map(xtenth, function (xp, i) {
        var h = 3 + (i % 5 === 0 ? 2 : 0);
        return [ "M"+[xp,sy], "L"+[xp,sy+h] ];
      }).join(" ");

    return <svg className="bezier-editor" width={width} height={height} onMouseDown={this.onMouseDown} onMouseMove={this.onMouseMove} onMouseUp={this.onMouseUp}>
      <g className="grid">
        <path className="bg" d={gridbg} />
        <path className="tenth" d={tenth} />
        <path className="half" d={half} />
      </g>
      <path className="bezierPath" d={curve} />
      <g className="axis left">
        <path className="ticks" d={ticksLeft} />
        <text className="legend" transform="rotate(-90)" x={-sy} y={sx-8}>Progress Percentage</text>
      </g>
      <g className="axis bottom">
        <path className="ticks" d={ticksBottom} />
        <text className="legend" x={ex} y={sy+5}>Time Percentage</text>
      </g>
      <g>
        <g className={"handle start"+(this.state.down===1 ? " active" : "")}>
          <line x1={cx1} y1={cy1} x2={sx} y2={sy} />
          <circle ref="handle1" cx={cx1} cy={cy1} r={handleRadius} />
        </g>
        <g className={"handle stop"+(this.state.down===2 ? " active" : "")}>
          <line x1={cx2} y1={cy2} x2={ex} y2={ey} />
          <circle ref="handle2" cx={cx2} cy={cy2} r={handleRadius} />
        </g>
      </g>
    </svg>;
  },
  onMouseDown: function (e) {
    var down = e.target === this.refs.handle1.getDOMNode() ? 1 : e.target === this.refs.handle2.getDOMNode() ? 2 : 0;
    if (down) {
      e.preventDefault();
      this.setState({
        down: down,
        startx: e.clientX,
        starty: e.clientY
      });
    }
  },
  onMouseMove: function (e) {
    if (this.state.down) {
      e.preventDefault();
      var rect = this.getDOMNode().getBoundingClientRect();
      var i = 2*(this.state.down-1);
      var value = _.clone(this.props.value);
      value[i] = this.inversex(e.clientX - rect.left);
      value[i+1] = this.inversey(e.clientY - rect.top);
      this.props.onChange(value);
    }
  },
  onMouseUp: function (e) {
    this.onMouseMove(e);
    this.setState({
      down: 0
    });
  },
  gridX: function (div) {
    var step = 1 / div;
    return _.map(_.range(0, 1+step, step), this.x, this);
  },
  gridY: function (div) {
    var step = 1 / div;
    return _.map(_.range(0, 1+step, step), this.y, this);
  },
  x: function (value) {
    var padding = this.props.padding;
    var w = this.props.width - padding[1] - padding[3];
    return Math.round(padding[3] + value * w);
  },
  inversex: function (x) {
    var padding = this.props.padding;
    var w = this.props.width - padding[1] - padding[3];
    return Math.max(0, Math.min((x-padding[3]) / w, 1));
  },
  y: function (value) {
    var padding = this.props.padding;
    var h = this.props.height - padding[0] - padding[2];
    return Math.round(padding[0] + (1-value) * h);
  },
  inversey: function (y) {
    var padding = this.props.padding;
    var h = this.props.height - padding[0] - padding[2];
    return 1 - (y - padding[0]) / h;
  }
});

module.exports = BezierEditor;
