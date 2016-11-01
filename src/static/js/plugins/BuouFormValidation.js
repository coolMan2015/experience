/*
 *Form Validator 
 *version: 1.0.0
 *author by: xucheng
 */
 ;(function(window, undefined){
	var defaults = {
		messages:{
			required: '%xc不能为空哦!',
			matches: '两次密码不一样',
			"default": '%xc仍然为默认的，请修改',
			phone_num: '请输入正确的%xc',
			// verify_code: '验证码不正确，请填写正确的验证码',
			phoneNumOrEmail: '请输入正确的%xc',
			valid_email: '请输入正确的%xc地址',
			valid_emails: '%xc必须含有所有有效的邮箱地址',
			min_length: '%xc至少%xc位',
			max_length: '%xc不能超过%xc',
			exact_length: '%xc必须为%xc位',
			greater_than: '%xc所填的数字必须大于%xc',
			less_than: '%xc所填的数字必须小于%xc',
			alpha: '%xc只能由字母组成',
			alpha_numberic: '%xc只能由数字组成',
			alpha_dash: '只能由字母、下划线、连字符组成',
			numeric: '只能包含数字',
			integer: '字段必须包含一个整数',
			decimal: '字段必须包含一个小数',
			is_natural: '必须只包含正数',
			is_natural_no_zero: '必须大于0',
			id_card: '亲，请填写正确的%xc哦!',
			valid_ip: '必须是一个有效的ip'
		},
		callback: function(errors){
			return !0;
		}
	};
	var ruleRegex = /^(.+?)\[(.+)\]$/,
		phoneNumOrEmailRegex = /^(1[34589]\d{9})|([a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/,
		phoneNum = /^1[34589]\d{9}$/,
		numericRegex = /^([0-9]+)$/,
		integerRegex = /^\-?[0-9]+$/,
		decimalRegex = /^\-?[0-9]*\.?[0-9]+$/,
		emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,
		alphaRegex = /^[a-z]+$/i,
		alphaNumericRegex = /^[a-z0-9]+$/i,
		alphaDashRegex = /^[a-z0-9_\-]+$/i,
		naturalRegex = /^[0-9]+$/i,
		naturalNoZeroRegex = /^[1-9][0-9]*$/i,
		ipRegex = /^((25[0-5]|2[0-4][0-9]|1[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i,	
		base64Regex = /[^a-zA-Z0-9\/\+=]/i,
		numericDashRegex = /^[\d\-\s]+$/,
		urlRegex = /^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+|)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
		IDCard = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/,
		dateRegex = /\d{4}-\d{1,2}-\d{1,2}/;


	var FormValidator = function (formNameOrNode,fields,callback){
		this.callback = callback || defaults.callback;
		this.errors = [];
		this.fields = {};
		this.form = this._formByNameOrNode(formNameOrNode) || {};
		this.messages = {};
		this.handlers = {};
		this.conditionals = {};

		fields = (Object.prototype.toString.call(fields) === '[object Array]') ? fields :[fields];
		for (var i = 0, fieldLength = fields.length; i < fieldLength; i++) {
			var field = fields[i];

			if(!field.name || !field.rules){
				console.warn('BuouFormValidation.js: 由于错误的配置已跳过该字段验证');
				console.warn(field);
				console.warn('请检查你是否给field设置了正确的name或者rules属性');
				continue;
			}
			this._addField(field,field.name)
		}

		var _onsubmit = this.form.onsubmit||function(){return false;};
		try{
			this.form.onsubmit= (function(that){
				return (function(evt){
					return that._validateForm(evt) && (_onsubmit === undefined || _onsubmit());
				})();
			})(this);		
		}catch(e){}

	},

	//公有方法		
	attributeValue = function(element, attributeName){
		var i;
		if((element.length > 0) && (element[0].type === 'radio' || element[0].type === 'checkbox')) {
			for(i = 0, elementLength = element.length; i < elementLength; i++) {
				if(element[i].checked){
					return element[i][attributeName];
				}
			}
			return;
		}
		return element[attributeName];
	};

	//公有方法
	FormValidator.prototype.setMessage = function(rule, message){
		this.messages[rule] = message;
		return this;
	};

	//公有方法
	FormValidator.prototype.registerCallback = function(name, handler){
		if(name && typeof name === 'string' && handler && typeof handler === 'function'){
			this.handlers[name] = handler;
		}
		return this;
	};

	//公有方法
	FormValidator.prototype.registerConditional = function(name, conditional){
		if(name && typeof name === 'string' && conditional && typeof conditional === 'function'){
			this.conditionals[name] = conditional;
		}
		return this;
	};

	//私有方法
	FormValidator.prototype._formByNameOrNode = function(formNameOrNode){
		return (typeof formNameOrNode === 'object') ? formNameOrNode : document.forms[formNameOrNode];
	};

	//私有方法 
	FormValidator.prototype._addField = function(field,nameValue){
		this.fields[nameValue] = {
			name: nameValue,
			display: field.display || nameValue,
			rules: field.rules,
			depends: field.depends,
			id: null,
			element: null,
			type: null,
			value: null
		};
	};

	//私有方法  
	FormValidator.prototype._validateForm = function(evt){
		this.errors = [];
		this.values = {};

		for(var key in this.fields){
			if(this.fields.hasOwnProperty(key)){
				var field = this.fields[key] || {},
					element = this.form[field.name]||$("#"+key)[0];

				if(element && element !== undefined) {
					field.id = attributeValue(element,'id');
					field.element = element;
					field.type = (element.length > 0) ? element[0].type : element.type;
					field.value = attributeValue(element, 'value');
					field.checked = attributeValue(element, 'checked');

					// 验证字段的值存入对象
					this.values[field.id] = field.value;

					if(field.depends && typeof field.depends === "function"){
						if(field.depends.call(this,field)){
							this._validateField(field);
						}
					} else if(field.depends && typeof field.depends ==="string" && this.conditionals[field.depends]){
						if(this.conditionals[field.depends].call(this,field)){
							this._validateField(field);
						}
					} else {
						this._validateField(field);
					}
				}
			}
		}

		if(typeof this.callback === 'function'){
			this.callback(this.errors,evt);
		}
		if(this.errors.length>0){
			if(evt && evt.preventDefault){
				evt.preventDefault();
			} else if(event){
				//ie事件对象
				event.returnValue = false;
			}
		}
		return true;
	}


	//私有方法  验证字段
	FormValidator.prototype._validateField = function(field){
		var i, j,
			rules = (/|/.test(field)) ? field.rules.split('|') : [field.rules],
			indexOfRequired = field.rules.indexOf('required'),
			isEmpty = (!field.value || field.value === '' || field.value === undefined);

		//Run through the rules and execute the validation methods as needed
		for(i = 0, ruleLength = rules.length; i < ruleLength; i++){
			var method = rules[i],
				param = null,
				failed = false,
				parts = ruleRegex.exec(method);

			/*
             * If this field is not required and the value is empty, continue on to the next rule unless it's a callback.
             * This ensures that a callback will always be called but other rules will be skipped.
             */

            if(indexOfRequired === -1 && method.indexOf('!callback_') === -1 && isEmpty){
            	continue;
            }

            /*
             * If the rule has a parameter (i.e. matches[param]) split it out
             */
            if(parts){
            	method = parts[1];
            	param = parts[2];
            }

            if(method.charAt(0) === '1'){
            	method = method.substring(1,method.length);
            }

            /*
             * If the hook is defined, run it to find any validation errors
             */
            if(typeof this._hooks[method] === 'function'){
            	if(!this._hooks[method].apply(this, [field, param])){
            		failed = true;
            	}
            } else if(method.substring(0,9) === 'callback_'){
            	method = method.substring(9, method.length);

            	if (typeof this.handlers[method] === 'function') {
            		if(this.handlers[method].apply(this, [field.value, param, field]) === false){
            			failed = true;
            		}
            	}
            }

            /*
             * If the hook failed, add a message to the errors array
             */
            if(failed){
            	// Make sure we have a message for this rule
            	var source = this.messages[field.name + '.' + method] || this.messages[method] || defaults.messages[method],
            		message = 'An errors has occurred with the' + field.display + 'field';

            	if(source){
            		message = source.replace('%xc', field.display);
            		if(param){
            			message =message.replace('%xc',(this.fields[param])? this.fields[param].display: param);
            		}
            	}

            	var existingError;
            	for(j = 0; j < this.errors.length; j++){
            		if(field.id === this.errors[j].id){
            			existingError = this.errors[j];
            		}
            	}

            	var errorObject = existingError || {
            		id: field.id,
            		display: field.display,
            		element: field.element,
            		name: field.name,
            		message: message,
            		messages: [],
            		rule: method
            	};
            	errorObject.messages.push(message);
            	if(!existingError) this.errors.push(errorObject);
            }
		}
	};

	//字符串日期转为对象
	FormValidator.prototype._getValidDate = function(date){
		if(!date.match('today') && !date.match(dateRegex)){
			return false;
		}

		var validDate = new Date(),
			validDateArray;
		if(!date.match('today')){
			validDateArray = date.split('-');
			validDate.setFullYear(validDateArray[0]);
			validDate.setMonth(validDateArray[1]-1);
			validDate.setDate(validDateArray[2]);
		}
		return validDate;
	};

	FormValidator.prototype._hooks = {
		required: function(field){
			var value = field.value;

			if((field.type === 'checkbox') || (field.type === 'radio')){
				return (field.checked ===true);
			}
			value=$.trim(value);
			return (value !== null && value !=="");
		},

		"default": function(field, defaultName){
			return field.value !== defaultName;
		},

		matches: function(field, matchName){
			var el = this.form[matchName] || $("#"+matchName)[0];

			if(el){
				return field.value === el.value;
			}
			return false;
		},

		phone_num: function(field){
			return phoneNum.test(field.value);
		},

		valid_email: function(field){
			return emailRegex.test(field.value);
		},

		phoneNumOrEmail: function(field) {
			return phoneNumOrEmailRegex.test(field.value);
		},
		
		valid_emails: function(field){
			var result = field.value.split(/\s*,\s*/g);

			for(var i = 0, resultLength = result.length; i < resultLength; i++){
				if(!emailRegex.test(result[i])){
					return false;
				}
			}
			return true;
		},
		min_length: function(field, length){
			if(!numericRegex.test(length)){
				return false;
			}
			return (field.value.length >= parseInt(length, 10));
		},
		max_length: function(field, length){
			if(!numbericRegex.test(length)){
				return false;
			}

			return (field.value.length <= parseInt(length, 10));
		},

		exact_length: function(field, length){
			if(!numbericRegex.test(length)){
				return false;
			}

			return (field.value.length === parseInt(length, 10));
		},

		range_length: function( field, rangeLength){
			var min = parseInt(rangeLength.split('-')[0], 10),
				max = parseInt(rangeLength.split('-')[1], 10);	
			return (field.value.length>=min && field.value.length<=max)
		},

		greater_than: function(field, param){
			if(!decimalRegex.test(field.value)){
				return false;
			}

			return (parseFloat(field.value) > parseFloat(param));
		},

		less_than: function(field, param){
			if(!decimalRegex.test(field.value)){
				return false;
			}

			return (parseFloat(field.value) < parseFloat(param));
		},

		alpha: function(field){
			return (alphaRegex.test(field.value));
		},

		alpha_numberic: function(field){
			return (alphaNumericRegex.test(field.value));
		},

		alpha_dash: function(field){
			return (alphaDashRegex.test(field.value));
		},

		numeric: function(field){
			return (numericRegex.test(field.value));
		},

		integer: function(field){
			return (integerRegex.test(field.value));
		},

		decimal: function(field){
			return (decimalRegex.test(field.value));
		},

		is_natural: function(field){
			return (naturalRegex.test(field.value));
		},

		is_natural_no_zero: function(field){
			return (naturalNoZeroRegex.test(field.value));
		},

		valid_ip: function(field){
			return (ipRegex.test(field.value));
		},

		valid_base64: function(field){
			return (base64Regex.test(field.value));
		},

		valid_url: function(field){
			return (urlRegex.test(field.value));
		},

		id_card: function(field){
			return IDCard.test(field.value);
		},

		valid_credit_card: function(field){			//验证银行卡号
			// Luhn Check Code from https://gist.github.com/4075533
			// accept only digits, dashes or spaces
			if (!numericDashRegex.test(field.value)) return false;

			// The Luhn Algorithm. It's so pretty.
			var nCheck = 0, nDigit = 0, bEven = false;
			var strippedField = field.value.replace(/\D/g, "");

			for (var n = strippedField.length - 1; n >= 0; n--) {
			    var cDigit = strippedField.charAt(n);
			    nDigit = parseInt(cDigit, 10);
			    if (bEven) {
			        if ((nDigit *= 2) > 9) nDigit -= 9;
			    }

			    nCheck += nDigit;
			    bEven = !bEven;
			}

			return (nCheck % 10) === 0;
		},

		is_file_type: function(field, type){
			if(field.type !== 'file'){
				return true;
			}

			var ext = field.value.substr((field.value.lastIndexOf('.')+1)),
				typeArray = type.split(','),
				inArray = false,
				i = 0,
				len = typeArray.length;
			for(i; i < len; i++){
				if(ext.toUpperCase() == typeArray[i].toUpperCase()) inArray = true;
			}
			return inArray;
		},

		greater_than_date: function(field, date){
			// console.log(this)
			var enteredDate = this._getValidDate(field.value),
				validDate = this._getValidDate(date);

			if(!validDate || !enteredDate){
				return false;
			}

			return enteredDate > validDate;
		},

		less_than_date: function(field, date){
			var enteredDate = this._getValidDate(field.value),
				validDate = this._getValidDate(date);

			if(!validDate || !enteredDate){
				return false;
			}

			return enteredDate < validDate;
		},		

		greater_than_or_equal_date: function(field, date){
			var enteredDate = this._getValidDate(field.value),
				validDate = this._getValidDate(date);

			if(!validDate || !enteredDate){
				return false;
			}

			return enteredDate >= validDate;
		},

		less_than_date: function(field, date){
			var enteredDate = this._getValidDate(field.value),
				validDate = this._getValidDate(date);

			if(!validDate || !enteredDate){
				return false;
			}

			return enteredDate <= validDate;
		}

	};
	window.BuouFormValidator = FormValidator; 	
 })(window)
