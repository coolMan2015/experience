
if (BuouUtil) {
    var BuouUtil = BuouUtil || {};
}
BuouUtil={
		JSON:function(){
	        if (typeof JSON !== 'object') {
	            JSON = {};
	        }
	        var rx_one = /^[\],:{}\s]*$/,
	        rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
	        rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
	        rx_four = /(?:^|:|,)(?:\s*\[)+/g,
	        rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	        rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

	        function f(n) {
	            // Format integers to have at least two digits.
	            return n < 10 
	                ? '0' + n 
	                : n;
	        }
	    
	        function this_value() {
	            return this.valueOf();
	        }
	        if (typeof Date.prototype.toJSON !== 'function') {

	            Date.prototype.toJSON = function () {

	                return isFinite(this.valueOf())
	                    ? this.getUTCFullYear() + '-' +
	                            f(this.getUTCMonth() + 1) + '-' +
	                            f(this.getUTCDate()) + 'T' +
	                            f(this.getUTCHours()) + ':' +
	                            f(this.getUTCMinutes()) + ':' +
	                            f(this.getUTCSeconds()) + 'Z'
	                    : null;
	            };

	            Boolean.prototype.toJSON = this_value;
	            Number.prototype.toJSON = this_value;
	            String.prototype.toJSON = this_value;
	        }
	        var gap,
	            indent,
	            meta,
	            rep;
	        function quote(string) {
	            rx_escapable.lastIndex = 0;
	            return rx_escapable.test(string) 
	                ? '"' + string.replace(rx_escapable, function (a) {
	                    var c = meta[a];
	                    return typeof c === 'string'
	                        ? c
	                        : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	                }) + '"' 
	                : '"' + string + '"';
	        }

	        function str(key, holder) {
	            var i,          // The loop counter.
	                k,          // The member key.
	                v,          // The member value.
	                length,
	                mind = gap,
	                partial,
	                value = holder[key];
	            if (value && typeof value === 'object' &&
	                    typeof value.toJSON === 'function') {
	                value = value.toJSON(key);
	            }
	            if (typeof rep === 'function') {
	                value = rep.call(holder, key, value);
	            }

	            switch (typeof value) {
	            case 'string':
	                return quote(value);

	            case 'number':
	                return isFinite(value) 
	                    ? String(value) 
	                    : 'null';

	            case 'boolean':
	            case 'null':
	                return String(value);
	            case 'object':
	                if (!value) {
	                    return 'null';
	                }
	                gap += indent;
	                partial = [];
	                if (Object.prototype.toString.apply(value) === '[object Array]') {
	                    length = value.length;
	                    for (i = 0; i < length; i += 1) {
	                        partial[i] = str(i, value) || 'null';
	                    }
	                    v = partial.length === 0
	                        ? '[]'
	                        : gap
	                            ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
	                            : '[' + partial.join(',') + ']';
	                    gap = mind;
	                    return v;
	                }
	                if (rep && typeof rep === 'object') {
	                    length = rep.length;
	                    for (i = 0; i < length; i += 1) {
	                        if (typeof rep[i] === 'string') {
	                            k = rep[i];
	                            v = str(k, value);
	                            if (v) {
	                                partial.push(quote(k) + (
	                                    gap 
	                                        ? ': ' 
	                                        : ':'
	                                ) + v);
	                            }
	                        }
	                    }
	                } 
	                else {
	                    for (k in value) {
	                        if (Object.prototype.hasOwnProperty.call(value, k)) {
	                            v = str(k, value);
	                            if (v) {
	                                partial.push(quote(k) + (
	                                    gap 
	                                        ? ': ' 
	                                        : ':'
	                                ) + v);
	                            }
	                        }
	                    }
	                }
	                    v = partial.length === 0
	                        ? '{}'
	                        : gap
	                            ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
	                            : '{' + partial.join(',') + '}';
	                    gap = mind;
	                    return v;
	                }
	            }
	            if (typeof JSON.stringify !== 'function') {
	                meta = {    // table of character substitutions
	                    '\b': '\\b',
	                    '\t': '\\t',
	                    '\n': '\\n',
	                    '\f': '\\f',
	                    '\r': '\\r',
	                    '"': '\\"',
	                    '\\': '\\\\'
	            };
	            JSON.stringify = function (value, replacer, space) {
	                var i;
	                gap = '';
	                indent = '';
	                if (typeof space === 'number') {
	                    for (i = 0; i < space; i += 1) {
	                        indent += ' ';
	                    }

	                } else if (typeof space === 'string') {
	                    indent = space;
	                }
	                rep = replacer;
	                if (replacer && typeof replacer !== 'function' &&
	                        (typeof replacer !== 'object' ||
	                        typeof replacer.length !== 'number')) {
	                    throw new Error('JSON.stringify');
	                }
	                return str('', {'': value});
	                };
	            }
	            if (typeof JSON.parse !== 'function') {
	                JSON.parse = function (text, reviver) {
	                    var j;
	                    function walk(holder, key) {
	                        var k, v, value = holder[key];
	                        if (value && typeof value === 'object') {
	                            for (k in value) {
	                                if (Object.prototype.hasOwnProperty.call(value, k)) {
	                                    v = walk(value, k);
	                                    if (v !== undefined) {
	                                        value[k] = v;
	                                    } else {
	                                        delete value[k];
	                                    }
	                                }
	                            }
	                        }
	                        return reviver.call(holder, key, value);
	                    }

	                    text = String(text);
	                    rx_dangerous.lastIndex = 0;
	                    if (rx_dangerous.test(text)) {
	                        text = text.replace(rx_dangerous, function (a) {
	                            return '\\u' +
	                                    ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
	                        });
	                    }
	                    if (
	                        rx_one.test(
	                            text
	                                .replace(rx_two, '@')
	                                .replace(rx_three, ']')
	                                .replace(rx_four, '')
	                        )
	                    ) {
	                        j = eval('(' + text + ')');
	                        return typeof reviver === 'function'
	                            ? walk({'': j}, '')
	                            : j;
	                    }
	                    throw new SyntaxError('JSON.parse');
	            };
	        }
	    },
	    getCookie: function (name) {
	        'use strict';
	        var cookieValue = null;
	        if (document.cookie && document.cookie != "") {
	            var cookies = document.cookie.split(";");
	            for (var i = 0, length = cookies.length; i < length; i++) {
	                var cookie = $.trim(cookies[i]);
	                if (cookie.substring(0, name.length + 1) == (name + "=")) {
	                    cookieValue = cookie.substring(name.length + 1);
	                    //cookieValue=cookieValue.substring(1,cookieValue.length-1);
	                }
	            }
	        }
	        return cookieValue;
	    },
	    //js转化为json
	    js2Json:function (obj) {
	        if(typeof JSON !== 'object'){
	            var objJson=BuouUtil.JSON(obj);
	        }
	        var objJson = JSON.stringify(obj);
	        return objJson;
	    },
	    json2Js: function (str) {
	        if(typeof JSON !== 'object'){
	            var objJs=BuouUtil.JSON(str);
	        }
	        var objJs = JSON.parse(str);
	        return objJs;
	    },
	    //
	 //localhost:8080/static
	 staticDomain:function(){
	    	var url="";
	    	return typeof url==="string" ? $("#staticDomain").val():!1;
     }(),
     //localhost:8080
     base:function(){
	    	var url=$("#base").val();
	    	return typeof url==="string" ? url : "http://192.168.1.254:8070/";
     }(),
     //接口
     api:function(){
	    	var url=$("#api").val();
	    	return typeof url==="string" ? url : "http://192.168.1.254:8070/";
     }(),
     //image.buoumall.com
     imgDomain:function(){
	    	var url=$("#imgDomain").val();
	    	return typeof url==="string" ? url : "http://image.buoumall.com/";
     }(),
     // get check code
     getCode: function($el,type) {
        $el.attr("src", "/captcha-image?bizType="+type+"&date=" + new Date().getTime());
     },
     countdown: function($showEl){
     	var msg = {
     			still: "获取验证码",
     			count: "s后重新获取"
     		},
     		startTime = 60,
     		count = startTime;

     	$showEl.html(startTime + msg.count);

     	setTimeout(timeRun,1000);
     	function timeRun(){
     		var showMsg = msg.count; 
     		count--;
     		count>0?($showEl.html(count + showMsg),setTimeout(timeRun, 1000)):
     		(count=startTime,$showEl.html(msg.still).data("done",1));
     	}
     },
     checkAllValidInput:function(userinput){
    	 var KEYWORDS =
    	        // 关键字
    	        'break,case,catch,continue,debugger,default,delete,do,else,false'
    	        + ',finally,for,function,if,in,instanceof,new,null,return,switch,this'
    	        + ',throw,true,try,typeof,var,void,while,with'

    	            // 保留字
    	        + ',abstract,boolean,byte,char,class,const,double,enum,export,extends'
    	        + ',final,float,goto,implements,import,int,interface,long,native'
    	        + ',package,private,protected,public,short,static,super,synchronized'
    	        + ',throws,transient,volatile'

    	            // ECMA 5 - use strict
    	        + ',arguments,let,yield'

    	        + ',undefined';

    	    var REMOVE_RE = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|\s*\.\s*[$\w\.]+/g;

    	    var SPLIT_RE = /[^\w$]+/g;  //非数字字母下滑线和$符以外的其他字符

    	    //生成这样的正则，用于匹配关键字   /\bbreak\b|\bcase\b|\bcatch\b|\bcontinue\b|\bdebugger\b|\bdefault\b|\bdelete\b|\bdo\b|\belse\b|\bfalse\b|\bfinally\b|\bfor\b|\bfunction\b|\bif\b|\bin\b|\binstanceof\b|\bnew\b|\bnull\b|\breturn\b|\bswitch\b|\bthis\b|\bthrow\b|\btrue\b|\btry\b|\btypeof\b|\bvar\b|\bvoid\b|\bwhile\b|\bwith\b|\babstract\b|\bboolean\b|\bbyte\b|\bchar\b|\bclass\b|\bconst\b|\bdouble\b|\benum\b|\bexport\b|\bextends\b|\bfinal\b|\bfloat\b|\bgoto\b|\bimplements\b|\bimport\b|\bint\b|\binterface\b|\blong\b|\bnative\b|\bpackage\b|\bprivate\b|\bprotected\b|\bpublic\b|\bshort\b|\bstatic\b|\bsuper\b|\bsynchronized\b|\bthrows\b|\btransient\b|\bvolatile\b|\barguments\b|\blet\b|\byield\b|\bundefined\b/g
    	    var KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g');
    	    var NUMBER_RE = /^\d[^,]*|,\d[^,]*/g; //匹配数字开头或者逗号后紧跟着数字的，
    	    var BOUNDARY_RE = /^,+|,+$/g;  //匹配开头的一个或多个逗号以及结尾的 用于去除首尾的逗号
    	    var SPLIT2_RE = /^$|,+/; //匹配多个逗号，用于分割 类似 param1,param2,,param3=> ["param1","param2","param3"] ，/^$/是为了匹配防止空字符串被切割


    	    //
    	    return function(validinput) {
    	        return validinput
    	            .replace(REMOVE_RE, '')
    	           // .replace(SPLIT_RE, ',') 
    	            .replace(KEYWORDS_RE, '');
    	          //  .replace(NUMBER_RE, '')
    	          //  .replace(BOUNDARY_RE, '')
    	           // .split(SPLIT2_RE);
    	    }(userinput);
     },
     strFormat: function () {
    	     var args = arguments,
    	     	 reg = /\{(\d+)\}/g;
    	     return this.replace(reg, function (g0, g1) {
    	         return args[+g1];
    	     });
	 },
     ossImageShow:function(id,type){
    	var url=[],
    		ossfile=$("#ossfile_"+id);
    	/*if(undefined === type){
    		url=ossfile.children("div").data("url");
    	}*/
    	if(!type){	
    		url=ossfile.children("div").last().data("url") || url;
    	}
    	else if(!!type){
    		url=ossfile.children("div").last().data("url") || url;
    	}
    	return url;
     },
     showImage:function(ele,id,type){
    	 var imagePreview=$(".imagePreview_"+ele),
    	 	imgSrc=BuouUtil.ossImageShow(id,type),
    	 	update_rcol=$(".update-rcol");
    	imagePreview[0] && imagePreview.empty();
    	if(!type && undefined!==imgSrc){
    		var src="";
    		$.each(imgSrc,function(index){	
    			src=imgSrc[index];
    		});
    		imagePreview[0] && $("<img />").attr("src",BuouUtil.imgDomain+"/"+src).appendTo(imagePreview);
    		if(update_rcol[0]){
				var setSmallImg=function(){
					var midImage=$("#midImage"),
						smaImage=$("#smaImage");
					midImage[0] && midImage.attr("src",BuouUtil.imgDomain+"/"+src + '@100h_100w_1e_1c.png'),
					smaImage[0] && smaImage.attr("src",BuouUtil.imgDomain+"/"+src + '@50w_50h_1e_1c.png');
				}();
			}
    	}
    	else if(!!type && undefined!==imgSrc){
    		$.each(imgSrc,function(index){		
    			imagePreview[0] && $("<img />").attr("src",BuouUtil.imgDomain+"/"+imgSrc[index]).appendTo(imagePreview);
    		});
    	}
    	else{
    		return !1;
    	}
     },
     //@param {obj} form:Dom Form element
     getGoodsFormData:function(form){
    	 var $form=$(form),
    	 	data=$form.serializeArray(),
    	 	param={},
    	 	formArray=[];
    	 //input
    	 $.each(data,function(i,item){
    		 param={
				 "propertyId":parseInt(item.name, 10),
				 "propertyValue":item.value
    		 };
    		 formArray.push(param);
    	 });
    	 //file
    	 $.each($("input[type='file']",$form),function(i,item){
    		 var url=$("#ossfile"+item.name).children("div").data("url"),imgURL="";
    		 url!==undefined ?
    				 imgURL=url:
					 imgURL="";
    		 param={
    				 "propertyId":item.name,
    				 "propertyValue":imgURL
        		 };		 
    		 formArray.push(param);
    	 });
    	 //checkbox
    	 $.each($("input[type='checkbox']",$form),function(i,item){
    		 param[item.name]=item.checked;
    	 });
    	 return formArray;
     },
     //获取标签数据
     getGoodsTagData:function(){
		    var that = this,
		    	GoodsTag = $(".GoodsTag").find("li").filter(".select"),
		    	tagArray = [];
		 	return function() {
		 		var tagTxt;
		 		GoodsTag && $.each(GoodsTag,function(){
		 			tagTxt = $(this).text();
		 			tagArray.push(tagTxt);
		 		});
		 		return tagArray;
			}();	
	 },
     getGoodsSpecData:function(){
    	 var specNoPhoto =$(".specNoPhoto").find("li").filter(".select"),
	 		 specNoPhotoId = $("#specNoPhoto").val(),
	 		
			 goodsArray=[];
    	 
    	 var noPhotoParam={
			    "specId":specNoPhotoId,
 				"specoptionList":[]
    	 };
    	 specNoPhoto && $.each(specNoPhoto,function(index,value){
    		 var that = $(this);
    		 var tempSpecNoPhoto={
    				 "isOpen":1,
    				 "photo":"",
    				 "value":that.text()
    		 	};
    		 noPhotoParam["specoptionList"].push(tempSpecNoPhoto);
    	 });
    	 goodsArray.push(noPhotoParam);
    	 
    	 var specHasPhoto = $(".hasPhoto");
	 		 hasPhotoId = $("#hasPhoto").val(),
    	 	 hasPhotoParam={
	 				"specId":hasPhotoId,
	 				"specoptionList":[]
	 		 };
    	 $.each(specHasPhoto,function(index,value){
    		 var ossDiv=$("#ossfile_" + ++index).children("div"),
    		 	specImgUrl=[];

			 var url=ossDiv.data("url");
			 	 specImgUrl.push(url);
    		 var temp={
				 "isOpen":1,
				 "photo":specImgUrl.join(","),
				 "value":specHasPhoto.find(".colorInput").eq(--index).val()
    		 };
    		 hasPhotoParam["specoptionList"].push(temp);
    	 });
    	 goodsArray.push(hasPhotoParam);
    	 return goodsArray;
     },
     //检测对象是否为空
     isOwnEmpty:function (ownObj) { 
         for(var name in ownObj) 
         { 
             if(ownObj.hasOwnProperty(name)) 
             { 
                 return false; 
             } 
         } 
         return true; 
     },
     //定制项目规则
     getCustomItemData:function(){
    	 var proStep = $(".proStep"),
    	 	 customRuleArray = [];
    	 proStep[0] && $.each(proStep , function(index , value){
    		var $this = $(this),
    			obj = {},
    			_title = $this.find(".progressName").val(),
    			_price = $this.find(".progressPrice").val(),
    			_description = $this.find(".detailStep").val();
			if("" !== _title && "" !== _price){
				obj={
    				 title:_title,   				 
    				 price:_price,
    				 description:_description
    	    	 };
				!BuouUtil.isOwnEmpty(obj) && customRuleArray.push(obj);
			}
    		
    	 });
    	 return customRuleArray;
     },
     //现货sku属性
     getSpotSkuData:function(){
    	 var skuForm__info = $(".skuForm__info").find("ul"),
    	 	 spotSkuArray = [];
    	 skuForm__info[0] && $.each(skuForm__info , function(index , value){
    		 var $this = $(this),
    		 	 price,
    		 	 num,
		 		 skuid0, 
	 		     skuid1; 
    		 skuid0 = $this.find("li")[0].getAttribute("skuid0"),
    		 skuid1 = $this.find("li")[1].getAttribute("skuid1"),
		 	 price = $this.find(".skuForm__info--price").children("input").val(),
		 	 num = $this.find(".skuForm__info--num").children("input").val();
    		 var specoptionIdCombo = skuid0 + "_" + skuid1;
    		 var obj={
    				 "onSaleNum":num,
    				 "originalPrice":price,
				 	 "specoptionIdCombo":specoptionIdCombo
    		 };
    		 spotSkuArray.push(obj);
    	 });
    	 return spotSkuArray;
     },
     format: function() {
 		if (arguments.length == 0)
 			return null;

 		var str = arguments[0];
 		for (var i = 1; i < arguments.length; i++) {
 			var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
 			str = str.replace(re, arguments[i]);
 		}
 		return str;
 	},
     //
     upload:function(){
     	/*
     	 *btn
     	 *wrap
     	 *oss
     	 *postFile
     	 *imgId
     	 *type
     	 *
     	 *
     	 */
     	 // ========================================================

     	 // method reload
     	 if(arguments.length === 1 && Object.prototype.toString(arguments[0]) === '[object Object]'){
     	 	var opts	= arguments[0],
     	 		btn		= opts.browse_button || 'selectFile',
     	 		wrap 	= opts.container,
     	 		type 	= opts.multi_selection
     	 }else{
     	 	var btn			= arguments[0],
     	 		wrap		= arguments[1],
     	 		oss			= arguments[2],
     	 		postFile	= arguments[3],
     	 		imgId		= arguments[4],
     	 		type		= arguments[5],
     	 		maxlength	= arguments[6]
     	 }


    	var OSSAccessKeyId = '',
	    	host = '',
	    	policy = '',
	    	signature = '',
	    	key = '',
	    	expire = 0,
	    	g_object_name = '',
	    	now = timestamp = Date.parse(new Date()) / 1000; 

    	 function send_request(callback){
    	 	$.ajax({
    	 		url:BuouUtil.base + '/directUpload',
    	 		type:"POST",
    	 		dataType:"json",
    	 		cache:false,
    	 		async:false,
 				success:function(data){
    	 		if ($.isFunction(callback)) {
					callback(data);
				}
			 }});
    	 }

    	 function get_signature()
    	 {
    	     //可以判断当前expire是否超过了当前时间,如果超过了当前时间,就重新取一下.3s 做为缓冲
    	    now = timestamp = Date.parse(new Date()) / 1000; 
    	    if (expire < now + 3)
    	    {       send_request(function(data){
    	        	host = data.host;
    	         	policy = data.policy;
    	         	OSSAccessKeyId = data.OSSAccessKeyId;
    	         	signature = data.signature;
    	         	expire = parseInt(data.expire);
    	         	key = data.key;
    	       });
    	    }
    	 }
    	 function random_string(){
    	 	return Math.random().toString(36).substring(2, 12);
    	 }

    	 function get_suffix(filename) {
    	     pos = filename.lastIndexOf('.')
    	     suffix = ''
    	     if (pos != -1) {
    	         suffix = filename.substring(pos)
    	     }
    	     return suffix;
    	 }

    	 function calculate_object_name(filename){
	         suffix = get_suffix(filename);
	         g_object_name = key + random_string() + suffix
    	 }

    	 function set_upload_param(up, filename){
    	     get_signature();
    	     if (filename != '') {
    	         calculate_object_name(filename)
    	     }
    	     new_multipart_params = {
    	         'key' : g_object_name,
    	         'policy': policy,
    	         'OSSAccessKeyId': OSSAccessKeyId, 
    	         'success_action_status' : '200', //让服务端返回200,不然，默认会返回204
    	         'signature': signature
    	     };

    	     up.setOption({
    	         'url': host,
    	         'multipart_params': new_multipart_params
    	     });
    	 }
    	 
    	 var imgArr=[];
    		 var uploader = new plupload.Uploader({
    	    	 	runtimes : 'html5,flash,silverlight,html4',
    	    	 	browse_button : btn,
    	    	    multi_selection: type,
    	    	 	container: wrap,
    	    	 	flash_swf_url : 'lib/plupload-2.1.2/js/Moxie.swf',
    	    	 	silverlight_xap_url : 'lib/plupload-2.1.2/js/Moxie.xap',
    	    	    url : 'http://image.buoumall.com',
    	    	    resize : opts &&(opts.resize || undefined),
    	    	    tailor : opts &&(opts.tailor || undefined),
    	    	    filters: {
    	    	         mime_types : 
    	    	         //只允许上传图片
    	    	         [{ 
    	    	        	 title : "Image files", 
    	    	        	 extensions : "jpg,jpeg,gif,png,bmp" 
    	        		 }],
    	    	         max_file_size : '10mb', //最大只能上传10mb的文件
    	    	         prevent_duplicates : false //不允许选取重复文件
    	    	     },

    	    	 	init: {
    	    	 		PostInit: function() {
    	    	 			if(opts &&(opts.callbacks.PostInit)){
    	    	 				opts.callbacks.PostInit();
    	    	 				return false;
    	    	 			}
    	    	 			oss.text = '';
    	    	 			//postFile[0].onclick = function() {
    	    	             
    	    	             return false;
    	    	 			//};
    	    	 		},

    	    	 		FilesAdded: function(up, files) {
    	    	 			if(opts &&(opts.callbacks.FilesAdded)){
    	    	 				opts.callbacks.FilesAdded(up, files);
    	    	 				return false;
    	    	 			}
    	    	 			if(files.length >5){
    	    	 				up.files.splice(0,files.length);
    	    	 				layer.msg("最多只能上传5张图片哦！")
    	    	 				return false;
    	    	 			}
    	    	 			if(up.files.length >5){
    	    	 				up.files.splice(5);
    	    	 				layer.msg("最多只能上传5张图片哦！");
    	    	 				return false;
    	    	 			}
    	    	 		    up.start();
    	    	 			oss.children("div")[0] && oss.empty();
    	    	 			plupload.each(files, function(file) {
    	    	 				oss[0].innerHTML += '<div id="' + file.id + '">' + file.name + ' (' + plupload.formatSize(file.size) + ')<b></b>'
    	    	 				+'<div class="progress"><div class="progress-bar" style="width: 0%"></div></div>'
    	    	 				+'</div>';
    	    	 			});
    	    	 		},
    	    	 		BeforeUpload: function(up, file) {

    	    	             set_upload_param(up, file.name);
    	    	         },

    	    	 		UploadProgress: function(up, file) {
    	    	 			var d = document.getElementById(file.id);
    	    	 			var imagePreview=$(".imagePreview");
    	    	 			
    	    	 			if(!d)return false;
    	    	 			d.getElementsByTagName('b')[0].innerHTML = '<span>' + file.percent + "%</span>";
	    	 				for(var i=0,len=up.files.length;i<len;i++){
	    	 					if(-1===imgArr.indexOf(g_object_name)){
	    	 						imgArr.push(g_object_name);
	    	 					}
	    	 				}
    	    	 			$("#"+file.id).data("url",imgArr);
    	    	 			//$("#"+file.id).data("url");
    	    	            var prog = d.getElementsByTagName('div')[0];
    	    	 			var progBar = prog.getElementsByTagName('div')[0]
    	    	 			progBar.style.width= 2*file.percent+'px';
    	    	 			progBar.setAttribute('aria-valuenow', file.percent);
    	    	 		},

    	    	 		FileUploaded: function(up, file, info) {
    	    	 			if(opts && (opts.callbacks.FileUploaded)){
    	    	 				opts.callbacks.FileUploaded(up, file, info, g_object_name);
    	    	 				return false;
    	    	 			}
    	    	            if (info.status == 200)
    	    	            {
    	    	            	var assistShow=function(callback){
    	    	            		
    	    	            		document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = "上传成功";
    	    	            		callback;
	    	    	 			};
	    	    	 			assistShow(BuouUtil.showImage(imgId,imgId,type));
    	    	            }
    	    	            else
    	    	            {
    	    	                document.getElementById(file.id).getElementsByTagName('b')[0].innerHTML = info.response;
    	    	            } 
    	    	 		},

    	    	 		Error: function(up, err) {
    	    	 			if(opts && (opts.callbacks.Error)){
    	    	 				opts.callbacks.Error(up, err);
    	    	 				return false;
    	    	 			}
    	    	 			//$("#console").text("");
    	    	             if (err.code == -600) {
    	    	            	 alert("选择的文件太大了");
    	    	                 //document.getElementById('console').appendChild(document.createTextNode("\n选择的文件太大了"));
    	    	             }
    	    	             else if (err.code == -601) {
    	    	            	 
    	    	                 //document.getElementById('console').appendChild(document.createTextNode("\n选择的文件后缀不对,可以根据应用情况，在upload.js进行设置可允许的上传文件类型"));
    	    	             }
    	    	             else if (err.code == -602) {
    	    	            	 alert("这个文件已经上传过一遍了");
    	    	                // document.getElementById('console').appendChild(document.createTextNode("\n这个文件已经上传过一遍了"));
    	    	             }
    	    	             else 
    	    	             {
    	    	                 document.getElementById('console').appendChild(document.createTextNode("\nError xml:" + err.response));
    	    	             }
    	    	 		}
    	    	 	}
    	    	 });
    	    	 uploader.init();
    	    	 return uploader;
     }
};
