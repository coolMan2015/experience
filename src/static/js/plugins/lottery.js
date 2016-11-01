/*
 *writeBy: xucheng
 *data: 2016.2.18
 */
;
(function(window, $, undefined) {
    'use strict';
    var defaults = {
        setting: {
            turns: 5,
            itemsNum: 12
        },
        animate: {
            a: 120,
            T: 770
        },
        requset: {
            award: '无效',
            name: '空',
            score: '未知'
        },
        callback: function() {}
    };

    var lottery = function(opts) {
        var options = $.extend({}, defaults, opts);

        // 抽奖启动
        options.btn = $(opts.btn);
        this.start(options);

        // winners show
        this.winnersShow(opts.winnersShow);
    };

    lottery.prototype.winnersShow = function(opts) {
        /*
        ==================================
        css说明：
        	viewBox必须 overflow:hidden
        	scrollBox必须清除浮动
        ==================================
        */
        if (typeof opts == 'undefined') {
            console.warn('中奖名单，参数无效');
            return false;
        }
        var viewBox = $(opts.viewBox),
            scrollBox = $(opts.scrollBox),
            item = $(opts.item);

        var sBoxH = scrollBox.height(),
            vBoxH = viewBox.height();
        var top = parseInt(scrollBox.css('margin-top').split('px')[0], 10);

        var t = 1000 / opts.setting.wSpeed || 200; //速度为 px/1000ms
        var timer = setInterval(function() {
            top = (top <= -sBoxH) ? vBoxH : top - 1
            scrollBox.css('margin-top', top + 'px');
        }, t)
    }

    lottery.prototype.start = function(opts) {
        var _this = this,
            btn = opts.btn;
        opts.ltyenable = true;

        btn.on('click', function(e) {
            e.preventDefault();
            if (opts.ltyenable == false) {
                return false;
            } else {
                opts.ltyenable = false;
                btn.addClass('unable');
            };
            // 扣除抽奖次数或积分,发信息给后台获取中奖信息,并开始执行动画
            _this.getAward(opts);

        });
    }

    lottery.prototype.getAward = function(opts) {
        //-----------------待修改-------------------
        var awardArr = [0, 8, 4, 10, 3, 5, 11, 2, 6, 7, 9, 1];
        // --------------以上为对应选项-------------

        var _this = this;
        $.post(opts.url, function(data) {

            var data = $.parseJSON(data);
            // console.log(data, 'source')
            if (data.code == '202') {
                typeof opts.login == 'function' ? opts.login() : null;
                opts.ltyenable = true;
                opts.btn.removeClass('unable');
            } else if (data.code == '201') {
                alert(data.data);
                opts.ltyenable = true;
                opts.btn.removeClass('unable');
            } else {
                opts.requset = {
                    award: getIndex(data.code, awardArr),
                    name: data.name,
                    score: data.score
                }
                _this.animateStart(opts);
                // console.log("code="+data.code+",name="+data.name+",积分："+data.score,"========3");
            }

        })
    }

    lottery.prototype.animateStart = function(opts) {
        var item_i = opts.requset.award;
        // 初始化
        typeof opts.callback == 'function' ? opts.callback(0) : null;

        opts.btn.css('cursor', 'default');


        var itemsNum = opts.setting.itemsNum,
            turns = opts.setting.turns;
        opts.animate.s = itemsNum * turns + item_i || 0;
        this.animation(opts, itemsNum);
    }

    function getIndex(e, arr) {
        if (typeof e == undefined || arr == undefined || typeof arr != 'object') {
            console.log('参数不正确');
            return false;
        }
        for (var i = 0; i < arr.length; i++) {
            if (e === arr[i]) {
                return i;
            }
        }
        return -1;
    }

    lottery.prototype.animation = function(opts, itemsNum) {
        var _this = this,
            index = 0,
            step = 0,
            a = opts.animate.a,
            _T = opts.animate.T,
            s = opts.animate.s;
        var sUp = 7,
            sDown = s - sUp;

        var action = function() {
            index = (index >= itemsNum - 1) ? 0 : index + 1;
            step++;
            if (step < sUp) {
                _T -= a;
            } else if (step > sDown && step < s) {
                _T += a;
            }
            if (_T <= 0) { //有效参数：_T-a*(sUp-1)>0;
                console.log('动画参数配置错误');
                return false;
            }
            // console.log(_T);
            opts.callback(index);
            (step != s) ? setTimeout(action, _T): _this.result(opts);
        };
        setTimeout(action, _T);
    }

    lottery.prototype.result = function(opts) {
        /*
        ----------------------待修改------------------------
        */
        var btn = $(opts.btn),
            showMsg = '<p style="line-height:60px; font-size:20px;">恭喜您抽中<span style="color:#df3d25">' + opts.requset.name + '</span></p><p style="text-align:left; line-height:30px"></p>' +
            '<p>又中奖了！传说中的吉星高照吗？赶紧再抽几次！！！</p>';
        // layerInstance?layerInstance({msg:showMsg, width:300}):alert(showMsg);
        opts.ltyenable = true;
        opts.btn.removeClass('unable');
        layerInstance && layerInstance({ msg: showMsg, width: '400', height: 160, type: 'confirm', confirmCallbackYes: function() { btn.trigger('click') }, confirmCallbackNo: function() { window.location.reload() } })
            // confirm('继续抽奖？')?btn.trigger('click'):(window.location.reload());
        btn.css('cursor', 'auto')
    }

    // msg, width, height, type
    function layerInstance(set) {
        var w = set.width || 350,
            h = set.height || 150;
        var layer = $('<div>')
            .css({
                width: w + 'px',
                height: h + 'px',
                position: 'fixed',
                left: '50%',
                top: '50%',
                margin: -h / 2 + 'px 0 0 ' + -w / 2 + 'px',
                padding: '4px',
                zIndex: 999,
                fontSize: '14px'
            }),
            layerShady = $('<div>')
            .css({
                position: 'fixed',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                zIndex: 998,
                background: '#fff',
                opacity: '0.8'
            }),
            tent = $('<div>')
            .css({
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: '#000',
                opacity: '0.6',
                borderRadius: '5px'
            }),
            content = $('<div>')
            .css({
                position: 'relative',
                paddingTop: '10px',
                height: h - 10 + 'px',
                background: '#fff',
                textAlign: 'center',
                left: '4px',
                top: '4px'
            }),
            sureBtn = $('<a href="javascript:;">确定</a>')
            .css({
                display: 'block',
                width: '100px',
                height: '26px',
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                marginLeft: '-50px',
                background: 'red',
                lineHeight: '26px',
                textAlign: 'center',
                color: '#fff',
                borderRadius: '5px'
            })
            .click(function() {
                layerShady.remove();
                layer.remove();
            });
        if (set.type && set.type == 'confirm') {
            var bool,
                sureBtn = $('<a href="javascript:;">继续抽奖？</a>')
                .css({
                    display: 'block',
                    width: '100px',
                    height: '26px',
                    position: 'absolute',
                    bottom: '15px',
                    left: '50%',
                    marginLeft: '-50px',
                    background: 'red',
                    lineHeight: '26px',
                    textAlign: 'center',
                    color: '#fff',
                    borderRadius: '5px'
                })
                .click(function() {
                    bool = !0;
                    layerShady.remove();
                    layer.remove();
                    set.confirmCallbackYes && typeof set.confirmCallbackYes == 'function' && set.confirmCallbackYes();
                }),
                cancelBtn = $('<a href="javascript:;">X</a>')
                .css({
                    display: 'block',
                    width: '20px',
                    height: '20px',
                    lineHeight: '21px',
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#aaa',
                    borderRadius: '50%',
                    marginLeft: '-50px',
                    textAlign: 'center',
                    fontFamily: 'microsoft Yahei',
                    color: '#fff'
                })
                .click(function() {
                    bool = !1;
                    layerShady.remove();
                    layer.remove();
                    set.confirmCallbackNo && typeof set.confirmCallbackNo == 'function' && set.confirmCallbackNo();
                })
            content
                .html(set.msg)
                .append(sureBtn)
                .append(cancelBtn);
            layer
                .append(tent)
                .append(content);
            $('body')
                .append(layer)
                .append(layerShady);
            return bool;
        } else {
            content
                .html(set.msg)
                .append(sureBtn);
        }
        layer
            .append(tent)
            .append(content);
        $('body')
            .append(layer)
            .append(layerShady);

    }

    window.BuouLottery = lottery;
})(window, jQuery);


// 以下只是示范用法
$(function() {
    var lottery = new BuouLottery({
        btn: '.btn_start',
        url: '/lottery/index',
        login: function() {
            // return new loginPop();

            // 此处掉登录弹框
        },
        callback: function(i) {
            //
            $('.lty_box span.item')
                .eq(i)
                .addClass('active')
                .siblings()
                .removeClass('active');
        },
        winnersShow: {
            viewBox: '.winners_box',
            scrollBox: '.winners_box ul',
            item: '.winners_box ul li',
            setting: {
                wSpeed: 5
            }
        },
        setting: {
            turns: 1,
            itemsNum: 12
        }
    })

})
