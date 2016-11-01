BuouFly=function(opt){
	'use strict';
	var defaults = {
		moveSpeed: 15,
		curvature: 0.0015
	};
	var opts = $.extend({}, defaults, opt);
	this.speed = opts.moveSpeed;
	this.curvature = opts.curvature;
	this.callback = opts.callback;
	this.init(opts);
};
	

BuouFly.prototype = {
	//constructor: this,
	init: function(opts){
		if(opts.src === undefined &&typeof opts.src != 'string'){
			return false;
		}
		this.el = $('<img>').attr('src', opts.src).css({
			position:'fixed',
			width:'45px',
			height:'45px',
			borderRadius:'50%',
			border: 0,
			background:'red'
		});
		this.start = this.getCoordinates(opts.fromEl),
		this.end = this.getCoordinates(opts.toEl);
		this.startMove();
	},
	startMove: function(){
		if(this.el===undefined){
			return false;
		}
		this.el.css({
			left:this.start.x+'px',
			top:this.start.y+'px'
		}).appendTo('body');
		this.start.y<= 20 ? this.animateStraight():this.animateCurve();
	},
	animateStraight: function(){
		var _y = this.end.y-this.start.y,
			_x = this.end.x-this.start.x,
			_this=this;
		var t = Math.sqrt(_y*_y+_x*_x)/this.speed;
		this.el.animate({
			left: this.end.x,
			top: this.end.y
		}, t*10, function(){
			_this.el.remove();
			!!_this.callback && typeof _this.callback == 'function'?_this.callback(_this.end):null;
		});
	},
	animateCurve: function(){
		var _this = this;
		var _y = this.end.y-this.start.y,
			_x = this.end.x-this.start.x,
			a = this.curvature,
			b = _y/_x-a*_x;
		setTimeout(function(){				
			_this.parabolic(a, b, _x);
		}, 30)

	},
	parabolic: function(a,b,_x){
		var _this = this;
		var x=0,y=0;
		(function test(){
			x+=_this.speed;
			y = a*x*x+b*x;
			_this.el.css({
				left: x+_this.start.x+'px',
				top: y+_this.start.y+'px'
			})
			if(x<_x){
				window.requestAnimFrame(test);
			}else{
				_this.el.remove();
				!!_this.callback && typeof _this.callback == 'function'?_this.callback(_this.end):null;
			}
		})();
	},
	getCoordinates: function(el){
		var el= $(el),
			coordinates = {};
		coordinates.x = el.offset().left+(el.outerWidth()-this.el.width())/2;
		coordinates.y = el.offset().top - $(document).scrollTop();
		return coordinates;
	},
	setCurvature: function(a){
		this.curvature = a;
		return this;
	}
};

//现代浏览器动画兼容
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

module.exports=BuouFly;