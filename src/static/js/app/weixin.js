;(function(window, doc, undefined){
	var $base = doc.getElementById('domainId').value;
	var orderNumber = $('#orderNumber').val();

	// 加载flash
	var	flashvars = {},
		params = {},
		attributes = {
			id: 'send',
			name: 'send'
		},
		asAPI = 'tellReciver';
	swfobject.embedSWF("../static/flash/send.swf?"+parseInt(Math.random()*1e6), "send", "0", "0", "9.0.0", "../static/flash/expressInstall.swf", flashvars, params, attributes);

	var count = 0;
	var timerAjax = setInterval(function(){
		var done = false;
		count++;

		$.post($base+"/pay/query",{ orderNumber: orderNumber, payWay: "weixin" }, function(data){
			/^\{/.test(data) && (data = $.parseJSON(data));
			if(data && data.code=='200'){
				done = true;
				payDone(orderNumber, done);
				clearInterval(timerAjax);
			}
		})

		count>=30*60e3 && (clearInterval(timerAjax),alert('二维码已过期'));
	}, 1000)

	// 支付完成调用
	function payDone(orderNO, done){
		done && flashReady(attributes.name, asAPI, function(fn){
			// console.log('传值给flash');
			fn(orderNO);
		})
	}

	// 获取flash Dom方法
	function flashReady(objName, asAPI, callback){
		callAS();
		function callAS(){
			var fn = thisMovie(objName)[asAPI];
			(fn instanceof Function)?(callback&&(callback instanceof Function)&&callback(fn)):setTimeout(callAS, 100);
		}
	}

	// 获取flash Dom方法
	function thisMovie(movieName) {
		if(navigator.appName.indexOf("Microsoft") != -1){
			return window[movieName];
		}else{
			return document[movieName];
		}
	}

})(window, document)