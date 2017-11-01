var puzzle = {
	// 基本结构是否已经初始化
	_inited: false,
	// 最外层的容器
	container: null,
	// 9个小容器
	ceils: null,
	// 最外层容器的宽度
	w_container: 0,
	// 内层容器的宽度
	w_ceil: 0,
	// 图片的顺序
	orders: [],
	// 第一个点击的元素
	clickItem: null,
	// 元素默认样式
	defaultStyle: {},
	// 是否超时
	timeout: false,
	// 存放定时器
	_timers: [],

	// 图片url
	_imageUrl: '',

	// 用户可配置选项
	options: {
		// 碎片个数（最少的打乱次数）
		count: 9,
		// 准备时间
		readyDelay: 3000,
		// 拼图时间
		playDelay: 10000,
		// 边框颜色
		borderColor: '#999',
		// 边框宽度
		borderWidth: 3,
		// 高亮部分样式配置
		highlight: {
			top: 1,
			left: 1,
			borderColor: 'rgb(255, 68, 0)',
			boxShadow: {
				hz: 1,
				vt: 1,
				blur: 2,
				color: 'rgba(255, 68, 0, 0.8)'
			}
		},

		// 默认成功是调用的函数
		success: function() {
			setTimeout(function() {
				alert('Perfact');
			}, 100);
		},

		// 默认失败是调用的函数
		failure: function() {
			setTimeout(function() {
				alert('Handup');
			}, 0);
		}
	},

	/**
	 * 初始化
	 * @param  {string} url     图片地址
	 * @param  {DOM} root    挂载点
	 * @param  {object} options 配置项
	 */
	init: function(url, root, options) {
		if (!this._inited) {
			// 如果没有传入root挂载点，创建创建一个新节点
			if (root === undefined) {
				root = document.createElement('div');
				document.body.appendChild(root);
			}
			// 初始化配置
			this._initOptions(options);

			// 初始化页面结构
			this._initHTML(root);

			// 初始化样式
			this._initCSS();

			// 获取相关宽度
			this._getContainerWidth();

			// 计算碎片的宽度
			this._computeCeilWidth();

			// 设置碎片的宽高
			this._setCeilWidth();

			// 设置背景图片大小
			this._setBgImageSize();

			// 表明结构样式已经初始化完毕
			this._inited = true;
		}

		this._imageUrl = url;

		this._addImage();

		// 初始化碎片循序
		this._imageOrder(this.orders);

		// 展示图片
		this._showImage(this.orders);

		// 在指定时间后打乱
		var self = this;
		this._timers[0] = setTimeout(function() {
			self._imageOrder(self.orders);
			self._showImage(self.orders);

			//初始化图片上点击事件
			self._initEvent();
		}, this.options.readyDelay);


		if (self.options.failure !== null) {
			this._timers[1] = setTimeout(function() {
				self.stop(self.options.failure);
			}, this.options.readyDelay + this.options.playDelay);
		}
	},

	/**
	 * 恢复设置
	 */
	_reset: function() {
		// 卸载计时器
		clearTimeout(this._timers[0]);
		clearTimeout(this._timers[1]);

		// 卸载监听器
		this.timeout = true;
		this.ceils[0].click();

		// 清除选中
		if (this.clickItem !== null) {
			this._highlight(this.clickItem);
		}

		// 重置数组
		this.orders = [];

		this.timeout = false;
		this.clickItem = null;
	},

	/**
	 * 停止游戏
	 * @param  {function} callback 停止后的行为
	 */
	stop: function(callback) {
		this._reset();
		if (callback) {
			callback();
		}
	},

	/**
	 * 对外接口：从新开始接口
	 * @param  {string} url 图片地址
	 */
	restart: function(url) {
		if (this._inited) {
			this._reset();
			url ? this.init(url) : this.init(this._imageUrl);
		}
		// 如果没有初始化，静默失败
	},

	/**
	 * 设置配置项
	 * @param  {object} options 用户自定义配置
	 */
	_initOptions: function(options) {
		if (options === undefined || options === null) {
			return;
		}

		var self = this;
		Object.keys(options).forEach(function(key) {
			self.options[key] = options[key];

		});
	},

	/**
	 * 初始化页面结构
	 * @param  {DOM} root y
	 * @return {[type]}      [description]
	 */
	_initHTML: function(root) {
		var html = '';
		html += '<div id="container">';
		html += '	<div id="inner_container">';
		for (var i = 0; i < this.options.count; ++i) {
			html += '     	<div class="ceil-container" data-position="' + i + '"></div>';
		}
		html += '	</div>';
		html += '</div>';

		root.innerHTML = html;
	},

	/**
	 * 初始化基本样式
	 * @return {[type]} [description]
	 */
	_initCSS: function() {
		// 需要添加样式的DOM元素引用
		this.container = document.getElementById('container');
		var inner_container = document.getElementById('inner_container');
		this.ceils = Array.prototype.slice.call(document.getElementsByClassName('ceil-container'));

		var self = this;

		this._setStyles(this.container, {
			'position': 'relative',
			'width': '100%',
			'padding-top': '100%'
		});

		this._setStyles(inner_container, {
			'position': 'absolute',
			'left': '0',
			'top': '0',
			'display': 'inline-block',
			'text-align': 'center',
			'font-size': '0'
		});

		this.ceils.forEach(function(ceil, index) {
			var base = Math.ceil(Math.sqrt(self.options.count));
			self._setStyles(ceil, {
				'display': 'inline-block',
				'border': self.options.borderWidth + 'px solid ' + self.options.borderColor,
				'background-repeat': 'no-repeat'
			});
			if (index % base !== 0) {
				self._setStyles(ceil, {
					'margin-left': -self.options.borderWidth + 'px'
				});
			}

			if (index / base !== 0) {
				self._setStyles(ceil, {
					'margin-top': -self.options.borderWidth + 'px'
				});
			}
		});

	},

	/**
	 * 添加背景图片
	 */
	_addImage: function() {
		var self = this;
		this.ceils.forEach(function(ceil) {
			self._setStyles(ceil, {
				'background-image': 'url("' + self._imageUrl + '")'
			});
		});
	},

	/**
	 * 获取容器的宽度和碎片容器的宽度
	 */
	_getContainerWidth: function() {
		// 获取所有计算样式
		var styles = document.defaultView.getComputedStyle(this.container, null);
		// 获取容器的宽度
		this.w_container = parseInt(styles.width);
	},

	/**
	 * 计算容器中每一个小方块的宽度
	 * @param  {number} border 小方块边框宽度
	 * @return {number}       计算后小方块的宽度
	 */
	_computeCeilWidth: function(border) {
		// 根据给定总个数， 设置列数， 如果不为整数， 向下取整
		var base = Math.ceil(Math.sqrt(this.options.count));

		border = border ? border : this.options.borderWidth;
		var remainder = this.w_container % base;
		// 判断容器是否被3整除
		if (remainder !== 0) {
			this.w_container -= remainder;
		}

		this.w_ceil = Math.floor(this.w_container / base) - 2 * border;
	},

	/**
	 * 设置背景图片大小
	 */
	_setBgImageSize: function() {
		var self = this;
		this.ceils.forEach(function(ceil) {
			self._setStyles(ceil, {
				'background-size': self.w_container + 'px'
			});
		});
	},

	/**
	 * 设置小碎片的大小
	 */
	_setCeilWidth: function() {
		var self = this;
		this.ceils.forEach(function(ceil) {
			self._setStyles(ceil, {
				'width': self.w_ceil + 'px',
				'height': self.w_ceil + 'px'
			})
		});
	},

	/**
	 * 给特定元素设置样式
	 * @param {DOM} ele    需要设定样式的DOM元素
	 * @param {object} styles 所有样式对象
	 */
	_setStyles: function(ele, styles) {
		Object.keys(styles).forEach(function(propName) {
			var name = dashToCamel(propName);
			ele.style[name] = styles[propName];
		});
	},

	/**
	 * 将图片位置打乱
	 * 逻辑：随机抽取两个位置，然后互换位置，进行指定次数操作
	 * @param  {array} arr   存放图片位置数组
	 * @param  {number} count 打乱次数
	 * @return {array}       打乱后的数组
	 */
	_imageOrder: function(arr, count) {
		// 第一次调用
		if (arr.length === 0) {
			for (var i = 0; i < this.options.count; ++i) {
				arr[i] = i;
			}
			return;
		}
		// 初始化打乱次数
		count = count === undefined || count < this.options.count ? this.options.count : count;

		// 互换元素位置
		var start, end, temp, range = arr.length;

		for (var i = 0; i < count; ++i) {
			start = random(range);
			end = random(range);

			// 互换
			temp = arr[start];
			arr[start] = arr[end];
			arr[end] = temp;
		}
	},

	/**
	 * 展示图片
	 * @param  {array} orders 图片的循序
	 * @return {[type]}           [description]
	 */
	_showImage: function(orders) {
		for (var i = 0, len = this.ceils.length; i < len; ++i) {
			this._setImage(i);
		}
	},

	/**
	 * 设置某个位置的图片
	 * @param {number} index DOM元素的位置及在orders数组中的索引
	 */
	_setImage: function(index) {
		var base = Math.ceil(Math.sqrt(this.options.count));
		var row = Math.floor(this.orders[index] / base);
		var col = this.orders[index] % base;
		this.ceils[index].style.backgroundPosition = -(this.options.borderWidth + col * this.w_ceil) + 'px ' + -(this.options.borderWidth + row * this.w_ceil) + 'px';
		this.ceils[index].style.backgroundSize = this.w_container + 'px';
		this.ceils[index].dataset.order = this.orders[index];
	},

	/**
	 * 初始化图片点击事件
	 */
	_initEvent: function() {
		var self = this;

		function handler(event) {
			if (self.timeout) {
				// 清空所有的监听器
				self.ceils.forEach(function(ceil) {
					ceil.removeEventListener('click', handler);
				});
				return;
			}
			// 如果clickItem为null，存入clickItem中
			if (self.clickItem === null) {
				self.clickItem = this;
				self._highlight(this);
			} else {
				// 交换图片
				self._exchangeImage(self.clickItem.dataset.position, this.dataset.position);
				self._highlight(self.clickItem);
				self.clickItem = null;

				// 检查是否拼图成功
				if (self._checkOrder()) {
					self._reset();

					// 调用回调函数
					self.options.success();
				}
			}
		}

		this.ceils.forEach(function(ceil) {
			ceil.addEventListener('click', handler, false);
		});
	},

	/**
	 * 交换连个碎片的背景图片，调换后
	 * @param  {number} i_start 第一个点击的位置
	 * @param  {number} i_end   第二个点击的位置
	 */
	_exchangeImage: function(i_start, i_end) {
		var temp;

		// 交换数组中的数据
		temp = this.orders[i_start];
		this.orders[i_start] = this.orders[i_end];
		this.orders[i_end] = temp;

		// 交换背景图片
		this._setImage(i_start);
		this._setImage(i_end);
	},

	/**
	 * 判断是否拼图成功
	 * 当orders数组中，值和索引保持一致，拼图成功
	 * @return {[type]} [description]
	 */
	_checkOrder: function() {
		return this.orders.every(function(value, index) {
			return index === value;
		});
	},

	/**
	 * 选中高亮指定元素
	 * @param  {DOM} ele DOM元素
	 */
	_highlight: function(ele) {
		if (this.options.highlight === null) {
			return;
		}
		if (Object.getOwnPropertyNames(this.defaultStyle).length === 0) {
			var tempStyle = document.defaultView.getComputedStyle(ele, null);

			this.defaultStyle.position = tempStyle.position;
			this.defaultStyle.top = tempStyle.top;
			this.defaultStyle.left = tempStyle.left;
			this.defaultStyle.borderColor = tempStyle.borderColor;
			this.defaultStyle.boxShadow = tempStyle.boxShadow;

			// 兼容firefox borderColor为空的问题
			this.defaultStyle.borderLeftColor = tempStyle.borderLeftColor;

			var options = this.options.highlight;

			this._setStyles(ele, {
				'position': 'relative',
				'top': options.top + 'px',
				'left': options.left + 'px',
				'border-color': options.borderColor,
				'box-shadow': options.boxShadow.hz + 'px ' + options.boxShadow.vt + 'px ' + options.boxShadow.blur + 'px ' + options.boxShadow.color
			});
		} else {
			this._setStyles(ele, {
				'position': this.defaultStyle.position,
				'top': this.defaultStyle.top,
				'left': this.defaultStyle.left,
				'border-color': this.defaultStyle.borderColor || this.defaultStyle.borderLeftColor,
				'box-shadow': this.defaultStyle.boxShadow
			});
			this.defaultStyle = {};
		}
	}
}

/****************************** 工具类函数 *******************************/
/**
 * 连字符形式转换为驼峰式：background-color => backgroundColor
 * @param  {[type]} str [description]
 * @return {[type]}     [description]
 */
function dashToCamel(str) {
	return str.replace(/-(\w)/g, function(match, $1) {
		return $1.toUpperCase();
	});
}

/**
 * 生成指定范围内的随机数（包括start,不包括end）
 * @param  {number} start 起始数字
 * @param  {number} end   终止数字
 * @return {number}       范围内的随机数
 */
function random(start, end) {
	// 如果只传入一个参数时，默认指定的终止数字
	if (end === undefined) {
		end = start;
		start = 0;
	}
	return Math.floor(start + Math.random() * (end - start));
}