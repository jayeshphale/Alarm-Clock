var LevelAccess = LevelAccess || {};
LevelAccess.InstanceHighlighter = function () {
	this.init();
};


LevelAccess.InstanceHighlighter.prototype = {
	/**
	 * @type {Node}
	 */
	container: null,
	
	/**
	 * @enum {Number}
	 */
	offsets: {
		horizontal: 4,
		vertical  : 4
	},
	
	/**
	 * @type {String}
	 */
	color: 'green',
	
	/**
	 * @type {Number}
	 */
	offscreenElements: 0,
	
	/**
	 * @returns {Element}
	 */
	getContainer: function () {
		return this.container;
	},
	
	/**
	 * @param {Node} el Element
	 */
	setContainer: function (el) {
		this.container = el;
	},
	
	/**
	 *
	 */
	init: function () {
		var container = document.getElementById('level-access-access-assistant-highlight-container');
		if (container !== null) {
			this.setContainer(container);
		}
		else {
			container = window.document.createElement('div');
			container.setAttribute('id', 'level-access-access-assistant-highlight-container');
			container.setAttribute('data-ae_invis', 'true');
			this.setContainer(container);
			window.document.body.appendChild(this.container);
		}
	},
	
	
	findElements: function (selector, context) {
		if (typeof selector !== 'string') {
			return [];
		}
		
		if (selector.indexOf('|') !== -1) {
			// this is a domuel coming from web component
			return window.LevelAccess_AccessEngine.ast_GetLiveDOMElementFromDOMUEL(selector);
		}
		
		return context.querySelectorAll(selector);
	},
	
	/**
	 *
	 * @param {String} selector
	 * @param {String} content
	 * @param {String} color
	 * @param {string} callback
	 * @param {bool} expanded
	 */
	highlight: function (selector, content, color, callback, expanded) {
		expanded = expanded || false;
		
		try {
			selector = selector.replace(/\\'/g, "'");
			
			var matches = this.findElements(selector, window.document);
			if (matches.length > 0) {
				for (var i = 0; i < matches.length; i++) {
					if (typeof callback === 'string') {
						content = this.executeContentCallback(matches[i], callback);
					}
					
					this.highlightNode(matches[i], content, undefined, color, expanded);
				}
				
				try {
					matches[matches.length - 1].scrollIntoView();
					window.scrollBy(0, -100);
				} catch (e) {
					// swallow highlighting exceptions
				}
			} else {
				this.highlightNode(undefined, content, undefined, color, expanded);
			}
		} catch (e) {
			// swallow highlighting exceptions
		}
	},
	
	/**
	 *
	 * @param {Node} node
	 * @param {String} cssClass
	 * @returns {boolean}
	 */
	hasClass: function (node, cssClass) {
		try {
			return node.getAttribute('class').indexOf(cssClass) !== -1;
		} catch (e) {
			return false;
		}
	},
	
	/**
	 *
	 * @param {Node} node
	 * @param {String} cssClass
	 */
	toggleClass: function (node, cssClass) {
		if (!this.hasClass(node, cssClass)) {
			node.setAttribute('class', node.getAttribute('class') + ' ' + cssClass);
		} else {
			node.setAttribute('class', node.getAttribute('class').replace(cssClass, ''));
		}
	},
	
	/**
	 * @param {Event} ev
	 */
	toggleHighlight: function (ev) {
		var el       = ev.currentTarget;
		var a11yText = el.querySelector('.ast-offscreen-text');
		this.toggleClass(el.parentNode, 'closed');
		
		if (this.hasClass(el.parentNode, 'closed')) {
			this.toggleClass(document.getElementById(el.getAttribute('aria-controls')), 'hidden');
			this.toggleClass(el, 'collapsed');
			a11yText.innerHTML = 'Expand';
		} else {
			this.toggleClass(document.getElementById(el.getAttribute('aria-controls')), 'hidden');
			this.toggleClass(el, 'collapsed');
			a11yText.innerHTML = 'Collapse';
		}
	},
	
	/**
	 * @param {String} selector
	 */
	toggleInstances: function (selector) {
		selector = selector.replace(/\\'/g, "'");
		
		var matches = this.findElements(selector, window.document);
		if (matches.length > 0) {
			for (var i = 0; i < matches.length; i++) {
				var id     = matches[i].getAttribute('data-la-highlighted-by');
				var toggle = document.getElementById(id);
				this.toggleHighlight({currentTarget: toggle});
			}
		}
	},
	
	/**
	 * @param {HTMLElement} node
	 * @param {String} content
	 * @param {{}} offsets
	 * @param {String} color
	 * @param {bool} expanded
	 * @returns {Element}
	 */
	highlightNode: function (node, content, offsets, color, expanded) {
		offsets  = offsets || this.offsets;
		color    = color || this.color;
		expanded = expanded || false;
		
		try {
			var el,
			    id  = this.uniqueid(),
			    ho  = offsets.vertical,
			    wo  = offsets.horizontal,
			    h   = 0,
			    w   = 0,
			    t, l, o,
			    tag = '',
			    c   = '';
			
			if (node !== undefined) {
				el  = node;
				o   = el.getBoundingClientRect();
				bo  = document.body.getBoundingClientRect();
				t   = o.top - bo.top;
				l   = o.left - bo.left;
				h   = el.offsetHeight;
				w   = el.offsetWidth;
				tag = el.tagName
			}
			
			// Account for offscreen elements or elements that have no size
			if (h === 0 && w === 0) {
				h     = 32;
				w     = 108;
				ho    = 0;
				wo    = 0;
				t     = 10;
				l     = 10 + (128 * this.offscreenElements++);
				c     = 'Offscreen';
				color = 'offscreen';
			}
			
			node.setAttribute('data-la-highlighted-by', id + '-toggle');
			
			var caret          = '<svg aria-hidden="true" data-prefix="fas" data-icon="caret-up" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" class="svg-inline--fa fa-caret-up fa-w-10 fa-3x"><path fill="currentColor" d="M288.662 352H31.338c-17.818 0-26.741-21.543-14.142-34.142l128.662-128.662c7.81-7.81 20.474-7.81 28.284 0l128.662 128.662c12.6 12.599 3.676 34.142-14.142 34.142z" class=""></path></svg>';
			var highlightStyle = 'min-height: ' + (h + ho) + 'px; min-width: ' + (w + wo + (wo > 0 ? 16 : 0)) + 'px; ';
			var html           = '<div style="' + highlightStyle + '" class="ast-node-highlight closed">' +
			                     '   <div class="tag">' + tag + '</div>' +
			                     '   <span>' + c + '</span>' +
			                     '   <a id="' + id + '-toggle" class="" aria-controls="' + id + '-details" aria-haspopup="true">' + caret + '<span class="ast-offscreen-text">Expand</span></a>' +
			                     '</div>' +
			                     '<div id="' + id + '-details" class="ast-node-details hidden">' +
			                     '   <div class="element">' + content + '</div>' +
			                     '</div>';
			
			var wrapper = document.createElement('div');
			wrapper.setAttribute('class', 'node-container ' + color);
			wrapper.setAttribute('style', 'top: ' + (t - (ho / 2)) + 'px; left: ' + (l - (wo / 2)) + 'px;');
			wrapper.innerHTML = html;
			
			this.getContainer().appendChild(wrapper);
			
			if (el !== undefined) {
				el.focus();
			}
			
			var toggle = document.getElementById(id + '-toggle');
			toggle.addEventListener('click', this.toggleHighlight.bind(this));
			
			if (expanded) {
				this.toggleHighlight({currentTarget: toggle});
			}
			
			return toggle;
		} catch (e) {
			// swallow highlighting exceptions, but try to log them
			console.log('Element could not be highlighted.', e);
		}
	},
	
	/**
	 *
	 */
	collapseAll: function () {
		var matches = document.querySelectorAll('div.node-container .ast-node-highlight > a:not(.collapsed)');
		
		for (var i = 0; i < matches.length; i++) {
			this.toggleHighlight({currentTarget: matches[i]});
		}
		
	},
	
	/**
	 *
	 */
	unhighlight: function () {
		try {
			this.offscreenElements = 0;
			var matches            = this.getContainer().querySelectorAll('div.node-container');
			
			for (var i = 0; i < matches.length; i++) {
				matches[i].remove();
			}
		} catch (e) {
			// swallow highlighting exceptions
		}
	},
	
	/**
	 * Generates a unique id
	 * @returns {string}
	 */
	uniqueid: function () {
		/**
		 * @returns {String}
		 */
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
			           .toString(16)
			           .substring(1);
		}
		
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	},
	
	executeContentCallback: function (node, callback) {
		switch (callback) {
			case 'iframes':
				var title,
				    scrolling;
				
				try {
					title = node.contentDocument.head.title;
					
					if (title.length === 0) {
						throw new Exception('empty title');
					}
				} catch (e) {
					title = '<em>empty</em>';
				}
				
				try {
					scrolling = window.getComputedStyle(node).getPropertyValue('overflow');
				} catch (e) {
					scrolling = '<em>undefined</em>';
				}
				
				return 'Title: ' + title + '<br/>Scrolling: ' + scrolling;
			
			case 'images':
				return 'ALT: ' + (node.getAttribute('alt') || '<em>empty</em>');
			
			case 'lists':
				return 'List Style Type: ' + window.getComputedStyle(node).getPropertyValue('list-style-type');
			
			case 'headings':
				var level = 'implicit';
				if (node.tagName.indexOf('H') === 0) {
					level = node.tagName.replace('H', '');
				} else if (node.getAttribute('aria-level') !== undefined) {
					level = node.getAttribute('aria-level');
				}
				
				return 'Level: ' + level;
			
			case 'lang':
				return 'Lang: ' + node.getAttribute('lang');
			
			case 'tables':
				var html    = '';
				var caption = node.querySelector('caption');
				var summary = node.getAttribute('summary');
				
				if (caption !== null) {
					html += 'Caption: ' + caption.innerHTML;
				} else {
					html += 'Caption: <em>none</em>';
				}
				
				html += '<br/>';
				
				if (summary !== null && summary !== '') {
					html += 'Summary: ' + summary;
				} else {
					html += 'Summary: <em>none</em>';
				}
				
				return html;
			
			case 'table-headings':
				var html  = '';
				var id    = node.getAttribute('id');
				var scope = node.getAttribute('scope');
				
				if (id !== null && id !== '') {
					html += 'ID: ' + id;
				} else {
					html += 'ID: <em>Not Defined</em>';
				}
				
				html += '<br/>';
				
				if (scope !== null && scope !== '') {
					html += 'Scope: ' + scope.innerHTML;
				} else {
					html += 'Scope: <em>Not Defined</em>';
				}
				
				return html;
			
			case 'table-data':
				var html = '';
				var id   = node.getAttribute('id');
				
				if (id !== null && id !== '') {
					return 'ID: ' + id;
				} else {
					return 'ID: <em>Not Defined</em>';
				}
			
		}
	}
};

// Global singleton
LevelAccess.instanceHighlighter = new LevelAccess.InstanceHighlighter();

// Message Listeners
window.addEventListener('message', function (event) {
	
	if (event.data.destination === 'page' && event.data.command) {
		switch (event.data.command.type) {
			case 'HIGHLIGHT_INSTANCE':
				var destFrameId = event.data.command.frameId;
				var selector    = event.data.command.selector;
				var content     = event.data.command.content;
				var color       = event.data.command.color || 'green';
				var callback    = event.data.command.callback;
				var expanded    = event.data.command.expanded || false;
				
				if (frameId === destFrameId || (destFrameId === 'top' && window.top.location === window.location)) {
					LevelAccess.instanceHighlighter.highlight(selector, content, color, callback, expanded);
				}
				break;
			
			case 'UNHIGHLIGHT_INSTANCE':
				LevelAccess.instanceHighlighter.unhighlight();
				break;
			
			case 'TOGGLE_INSTANCE_HIGHLIGHT':
				var destFrameId = event.data.command.frameId;
				var selector    = event.data.command.selector;
				
				if (frameId === destFrameId || (destFrameId === 'top' && window.top.location === window.location)) {
					LevelAccess.instanceHighlighter.toggleInstances(selector);
				}
				break;
		}
		
		// relay message to lower layers
		var iframes = document.querySelectorAll('iframe');
		for (var i = 0; i < iframes.length; i++) {
			iframes[i].contentWindow.postMessage(event.data, '*');
		}
	}
}, false);
/**
 * TestRunner.js
 */

LevelAccess.TestRunner = function () {
};

LevelAccess.TestRunner.prototype = {
	itemsOfInterest: null,
	styleEl        : null,
	
	injectStyles: function () {
		if (this.styleEl === null) {
			this.styleEl = window.document.createElement('STYLE');
			window.document.head.appendChild(this.styleEl);
		}
		
		if (this.styleEl.innerHTML === '') {
			var baseStyle = '[data-la-node-highlight] { ' +
			                '  outline: 5px solid #68B915 !important; cursor:alias !important; ' +
			                '}';
			
			if (window === window.top) {
				baseStyle += 'body {' +
				             'margin: 20px;' +
				             '}' +
				             '#level-access-access-assistant-highlight-container {' +
				             '  position:fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 2147483647; pointer-events: none;  opacity: 1;' +
				             '  display: flex; flex-direction: column;' +
				             '  border: 14px solid;' +
				             '  border-image: repeating-linear-gradient( ' +
				             '  45deg, ' +
				             '  #68B915, ' +
				             '  #68B915 10px, ' +
				             '  #fff 10px, ' +
				             '  #fff 20px ' +
				             ') 14;' +
				             '  box-shadow: inset 0 0 0 1px #68B915; ' +
				             '}';
			}
			
			this.styleEl.innerHTML = baseStyle;
		}
	},
	
	removeStyles: function () {
		if (this.styleEl) {
			this.styleEl.innerHTML = '';
		}
	},
	
	highlightElement: function (event) {
		event.target.setAttribute('data-la-node-highlight', 'on');
	},
	
	unhighlightElement: function (event) {
		event.target.removeAttribute('data-la-node-highlight');
	},
	
	/**
	 * @param element
	 * @returns {ClientRect | DOMRect}
	 */
	calcPosition: function (element) {
		// We need the real element to get its position
		var node = null;
		if (element.hasAttribute('data-ae_domuel') === false) {
			node = element;
		}
		else {
			node = document.querySelector(element.getAttribute('data-ae_domuel'));
		}
		
		return node.getBoundingClientRect();
	},
	
	/**
	 * @param {Node} node
	 *
	 * @returns {ClientRect | DOMRect}
	 */
	getNodePosition: function (node) {
		LevelAccess_AccessEngine.ast_nodeCapture_markdown();
		// if node in shadowDOM
		// to calcPosition we need to know descendant with 'data-ae_webcomp', otherwise position is 0,0,0,0
		// uel contains a pipe
		var position = null;
		var uel      = node.getAttribute('data-ae_domuel'); // all nodes will have at this stage due to having this attribute added in SubStation
		
		if (uel.indexOf('|') !== -1) {
			// find descendant with 'data-ae_webcomp' attribute - basically the first piece of pre-pipe css
			var cssForDescendant = uel.substring(0, uel.indexOf('|'));
			position             = this.calcPosition(window.document.querySelector(cssForDescendant));
		}
		
		LevelAccess_AccessEngine.ast_nodeCapture_cleanup();
		// Position cannot be passed directly because of cross DOM cloning restrictions
		return position || this.calcPosition(node);
	},
	
	getElementFromOrigShadowRoot: function (elementShdwrtLocation) {
		// [id='app']|[id='footer']|>*:nth-child(2)>*:nth-child(3)>*:nth-child(6)>*:nth-child(1)
		// we split the locator on "|". The piece before this is the web component which indicates 
		// recursively in web components
		var element = null;
		try {
			var levels = elementShdwrtLocation.split("|");
			// IMPORTANT: we need to reduce the length by 1 
			// as the last piece of the locator is the css selector within the lowest level of web components
			var currentShadowDOMHost = null;
			for (var i = 0, len = levels.length; i < len; i++) {
				// recursively find, and move to each shadowDOMHost
				var locator = levels[i];
				if (i !== len - 1) {
					// this is handling locating subsequent shadowDOMs
					// if the locator looks like *:nth-child(5) it is easy for other content to be located instead of the direct child needed
					// as the direct child could be located after other matching content has been located
					// so we recognise *:nth-child(x) 
					// and if we match it - we move other to using direct children instead.
					// noting that there is no :root css locator in a shadowDOM seemingly.
					if (currentShadowDOMHost === null) {
						currentShadowDOMHost = window.document.querySelector(locator);
					}
					else {
						// here is the main issue for the *:nth-child(x) locator
						// if the locator starts with *:nth-child( and there is no > then we'll have recognised the issue
						if ((locator.indexOf("*:nth-child(") === 0) && (locator.indexOf(">") === -1)) {
							currentShadowDOMHost = currentShadowDOMHost.shadowRoot.children[parseInt(locator.substring(12, locator.indexOf(")"))) - 1];
						}
						else {
							currentShadowDOMHost = currentShadowDOMHost.shadowRoot.querySelector(locator);
						}
					}
				}
				else {
					if (currentShadowDOMHost === null) {
						element = window.document.querySelector(locator);
					}
					else {
						// here is the main issue for the *:nth-child(x) locator
						// if the locator starts with *:nth-child( and there is no > then we'll have recognised the issue
						if ((locator.indexOf("*:nth-child(") === 0) && (locator.indexOf(">") === -1)) {
							element = currentShadowDOMHost.shadowRoot.children[parseInt(locator.substring(12, locator.indexOf(")"))) - 1];
						}
						else {
							element = currentShadowDOMHost.shadowRoot.querySelector(locator);
						}
					}
				}
			}
		}
		catch (err) {
			console.log(err);
		}
		
		return element;
	},
	
	nodeSelector: function (ev) {
		try {
			ev.stopPropagation();
		} catch (e) {
		}
		try {
			ev.preventDefault();
		} catch (e) {
		}
		
		var uel;
		var node = ev.target;
		
		// Mark this as the one clicked on
		node.setAttribute('data-la-node-captured', 'true');
		
		// Traverse upward 2 levels
		var getParentNode = function (node) {
			var parentNode    = node.parentNode,
			    parentTagName = parentNode.tagName;
			
			if (parentTagName === 'HTML') {
				return undefined;
			} else {
				return parentNode;
			}
		};
		node              = getParentNode(node) || node;
		node              = getParentNode(node) || node;
		
		var nodeHTML = node.outerHTML;
		
		if (node.tagName === 'BODY') {
			uel = 'body';
		} else {
			uel = LevelAccess_AccessEngine.uelAccurate_FromRoot(node);
		}
		
		// Check for Shadow DOM support
		if (node.shadowRoot) {
			// parent of parent will never be a data-ae_webcomp - as as yet content in shadowDOM cannot be selected through mouse click
			// you look to replace any element marked as a web component with it's expanded content
			var allEnclosedNodes = node.querySelectorAll("*[data-ae_webcomp]");
			for (var i = 0; i < allEnclosedNodes.length; i++) {
				var enclosedNode = allEnclosedNodes[i];
				var shadNode     = LevelAccess_AccessEngine.ast_runMarkDown_GetExpandedShadDOM_ForNode(enclosedNode);
				
				// First update our marked down HTML, then update live DOM
				nodeHTML               = nodeHTML.replace(enclosedNode.innerHTML, shadNode.innerHTML);
				enclosedNode.innerHTML = shadNode.innerHTML;
			}
		}
		
		window.postMessage({
			destination: 'ast',
			result     : {
				type   : 'NODE_SELECTION',
				node   : JSON.stringify(nodeHTML),
				uel    : uel,
				frameId: window.frameId
			}
		}, '*');
	},
	
	documentCapture: function (testTypes) {
		/**
		 * results will be gathered after the node is selected in DOM viewer
		 */
		this.removeASTMarkup();
		var results = LevelAccess_AccessEngine.ast_runAllTests_returnInstances_JSON(testTypes);
		this.restoreASTMarkup();
		
		window.postMessage({
			destination: 'ast',
			result     : {
				type    : 'DOCUMENT_CAPTURE',
				title   : window.document.title,
				location: window.document.location.href,
				results : results,
				frameId : window.frameId
			}
		}, '*');
	},
	
	nodeCapture: function (node, testTypes) {
		var position = this.getNodePosition(node);
		
		/**
		 * results will be gathered after the node is selected in DOM viewer
		 */
		var results;
		this.removeASTMarkup();
		if (node.tagName === 'BODY') {
			results = LevelAccess_AccessEngine.ast_runAllTests_returnInstances_JSON(testTypes);
		} else {
			results = LevelAccess_AccessEngine.ast_runAllTests_returnInstances_JSON_NodeCapture(node, testTypes);
		}
		this.restoreASTMarkup();
		
		window.postMessage({
			destination: 'ast',
			result     : {
				type    : 'NODE_CAPTURE_PREMESSAGE',
				results : results,
				position: {
					top   : position.top,
					left  : position.left,
					width : position.width,
					height: position.height
				},
				frameId : window.frameId
			}
		}, '*');
	},
	
	nodePosition: function (node) {
		var position = this.getNodePosition(node);
		
		window.postMessage({
			destination: 'ast',
			result     : {
				type    : 'NODE_POSITION',
				position: {
					top   : position.top,
					left  : position.left,
					width : position.width,
					height: position.height
				},
				frameId : window.frameId
			}
		}, '*');
	},
	
	/**
	 * Moved from AST.NodeCapture
	 */
	labelShadowDOMComponents: function () {
		var all = window.document.querySelectorAll('*');
		for (var i = all.length; i--;) {
			var el = all[i];
			if (el.shadowRoot !== null) {
				all[i].setAttribute('data-ae_webcomp', '');
			}
		}
	},
	
	/**
	 */
	removeNodeCaptureAttribute: function () {
		var previouslyCaptured = window.document.querySelectorAll('[data-la-node-captured]');
		for (var i = previouslyCaptured.length; i--;) {
			var el = previouslyCaptured[i].removeAttribute('data-la-node-captured');
		}
	},
	
	start: function () {
		this.removeNodeCaptureAttribute();
		this.removeASTMarkup();
		this.labelShadowDOMComponents();
		LevelAccess_AccessEngine.ast_nodeCapture_cleanup();
		LevelAccess_AccessEngine.ast_nodeCapture_markdown();
		this.injectStyles();
		this.itemsOfInterest = null;
		this.itemsOfInterest = document.querySelectorAll('BODY,DIV,SECTION,NAV,TABLE,OL,UL,DL,FORM,FIELDSET,HEADER,FOOTER,MAIN,ARTICLE,ASIDE,FIGURE');
		for (var i = this.itemsOfInterest.length; i--;) {
			var itemOfInterest = this.itemsOfInterest[i];
			itemOfInterest.addEventListener('mouseover', this.highlightElement, false);
			itemOfInterest.addEventListener('mouseout', this.unhighlightElement, false);
			itemOfInterest.addEventListener('click', this.nodeSelector, false);
		}
	},
	
	stop: function () {
		this.restoreASTMarkup();
		LevelAccess_AccessEngine.ast_nodeCapture_cleanup();
		this.removeStyles();
		try {
			if (this.itemsOfInterest) {
				for (var i = this.itemsOfInterest.length; i--;) {
					var itemOfInterest = this.itemsOfInterest[i];
					itemOfInterest.removeEventListener('mouseover', this.highlightElement);
					itemOfInterest.removeEventListener('mouseout', this.unhighlightElement);
					itemOfInterest.removeEventListener('click', this.nodeSelector);
				}
			}
		}
		catch (err) {
			console.log(err);
		}
	},
	
	/**
	 * @type {{el: Element, attributes: {key: String, val: String}[]}[]}
	 */
	ASTmarkup: [],
	
	removeASTMarkup: function () {
		var nodes, element;
		
		var elements = [];
		
		nodes = document.evaluate("//*/@*[starts-with(name(), 'data-ae')]/..|//*/@*[starts-with(name(), 'data-la')]/..", document, null, XPathResult.ANY_TYPE, null);
		while (element = nodes.iterateNext()) {
			elements.push(element);
		}
		
		for (var i = 0; i < elements.length; i++) {
			element        = elements[i];
			var attributes = [];
			for (var j = 0; j < element.attributes.length; j++) {
				var attr = element.attributes[j];
				
				// Leave in data attribute for hidden nodes so element filtering works
				if (attr.name === 'data-la-node-hidden') {
					continue;
				}
				
				if (attr.name.indexOf('data-ae') === 0 || attr.name.indexOf('data-la') === 0) {
					attributes.push({
						key: attr.name,
						val: attr.value
					});
					element.removeAttribute(attr.name);
				}
			}
			
			if (attributes.length > 0) {
				this.ASTmarkup.push({
					el        : element,
					attributes: attributes
				});
			}
		}
	},
	
	restoreASTMarkup: function () {
		for (var i = 0; i < this.ASTmarkup.length; i++) {
			var element = this.ASTmarkup[i];
			
			for (var j = 0; j < element.attributes.length; j++) {
				var attr = element.attributes[j];
				
				element.el.setAttribute(attr.key, attr.val);
			}
		}
		
		this.ASTmarkup = [];
	}
	
};

LevelAccess.testRunner = new LevelAccess.TestRunner();
/**
 * @namespace
 */
LevelAccess.ToggleCSS = {
	/**
	 * Removes CSS
	 *
	 * @static
	 */
	removeCSS: function () {
		var links = document.querySelectorAll('link[href]:not([href=""])');
		for (var i = 0; i < links.length; i++) {
			link            = links[i];
			var currentHref = link.getAttribute('href');
			link.setAttribute('data-ae-href', currentHref);
			link.removeAttribute('href');
		}
		
		var elementsWithStyle = document.querySelectorAll('*[style]:not([style=""])');
		for (var j = 0; j < elementsWithStyle.length; j++) {
			link             = elementsWithStyle[j];
			var currentStyle = link.getAttribute('style');
			link.setAttribute('data-ae-style', currentStyle);
			link.removeAttribute('style');
		}
		
		// need to comment-out contents of style elements
		var styles = document.querySelectorAll('style:not(:empty)');
		for (var k = 0; k < styles.length; k++) {
			styles[k].outerHTML = styles[k].outerHTML.replace(/^<style/, '<notstyle style="display:none;"').replace(/style>$/, 'notstyle>');
		}
	},
	
	/**
	 * Returns the page to normal
	 *
	 * @static
	 */
	restoreCSS: function () {
		var links = document.querySelectorAll('link[data-ae-href]');
		for (var i = 0; i < links.length; i++) {
			link            = links[i];
			var currentHref = link.getAttribute('data-ae-href');
			link.setAttribute('href', currentHref);
			link.removeAttribute('data-ae-href');
		}
		
		var elementsWithStyle = document.querySelectorAll('*[data-ae-style]');
		for (var j = 0; j < elementsWithStyle.length; j++) {
			link             = elementsWithStyle[j];
			var currentStyle = link.getAttribute('data-ae-style');
			link.setAttribute('style', currentStyle);
			link.removeAttribute('data-ae-style');
		}
		
		// need to comment-out contents of style elements
		var styles = document.querySelectorAll('notstyle');
		for (var k = 0; k < styles.length; k++) {
			styles[k].outerHTML = styles[k].outerHTML.replace(/^<notstyle style="display:none;"/, '<style').replace(/notstyle>$/, 'style>');
		}
	},
	
	/**
	 * @param {HTMLElement} el
	 * @param {String} property
	 * @returns {string}
	 */
	getCssProperty: function (el, property) {
		return window.getComputedStyle(el).getPropertyValue(property);
	},
	
	/**
	 * @param {HTMLElement} el
	 */
	hideImage: function (el) {
		el.setAttribute('data-background-image', LevelAccess.ToggleCSS.getCssProperty(el, 'background-image'));
		el.setAttribute('data-background-color', LevelAccess.ToggleCSS.getCssProperty(el, 'background-color'));
		
		el.style['background-image'] = 'none';
		el.style['background-color'] = 'transparent';
	},
	
	/**
	 * @param {HTMLElement} el
	 */
	showImage: function (el) {
		if (el.getAttribute('data-background-image') !== undefined) {
			el.style['background-image'] = el.getAttribute('data-background-image');
		}
		
		if (el.getAttribute('data-background-image') !== undefined) {
			el.style['background-color'] = el.getAttribute('data-background-color');
		}
		
		el.removeAttribute('data-background-image');
		el.removeAttribute('data-background-color');
	},
	
	/**
	 * @param {String} selector
	 * @param {String} mode
	 */
	toggleBackgroundImage: function (selector, mode) {
		selector = selector.replace(/\\'/g, "'");
		
		var matches = this.findElements(selector, window.document);
		if (matches.length > 0) {
			for (var i = 0; i < matches.length; i++) {
				if (matches[i].getAttribute('data-background-image') !== null || mode === 'on') {
					LevelAccess.ToggleCSS.showImage(matches[i]);
				} else {
					LevelAccess.ToggleCSS.hideImage(matches[i]);
				}
			}
		}
	},
	
	findElements: function (selector, context) {
		if (typeof selector !== 'string') {
			return [];
		}
		
		if (selector.indexOf('|') !== -1) {
			// this is a domuel coming from web component
			return window.LevelAccess_AccessEngine.ast_GetLiveDOMElementFromDOMUEL(selector);
		}
		
		return context.querySelectorAll(selector);
	}
};

window.addEventListener('message', function (event) {
	if (event.data.destination === 'page' && event.data.command) {
		switch (event.data.command.type) {
			case 'TOGGLE_CSS_OFF':
				LevelAccess.ToggleCSS.removeCSS();
				break;
			case 'TOGGLE_CSS_ON':
				LevelAccess.ToggleCSS.restoreCSS();
				break;
			
			case 'TOGGLE_BACKGROUND_IMAGE':
				var destFrameId = event.data.command.frameId;
				var selector    = event.data.command.selector;
				var mode        = event.data.command.mode || null;
				
				if (frameId === destFrameId || (destFrameId === 'top' && window.top.location === window.location)) {
					LevelAccess.ToggleCSS.toggleBackgroundImage(selector, mode);
				}
				break;
		}
	}
});
window.frameId = (function () {
	// Use full location to identify unique iframes
	var frameId;
	var topLocation;
	try {
		topLocation = window.top.location.toString();
	}
	catch (e) {
		topLocation = 'top';
	}
	var thisLocation = window.location.toString();
	
	if (topLocation === thisLocation) {
		frameId = topLocation;
	} else {
		frameId = '[' + topLocation + '][' + thisLocation + ']';
	}
	
	if (window.frameElement) {
		window.frameElement.setAttribute('data-la-frameId', frameId);
	}
	return frameId;
})();

window.addEventListener('message', function (event) {
		var destination = event.data.destination;
		if (destination === 'page') {
			// Node
			if (event.data.command) {
				switch (event.data.command.type) {
					case 'START_NODE_HIGHLIGHTING':
						if (LevelAccess.testRunner.start) {
							LevelAccess.testRunner.start();
						}
						break;
					
					case'STOP_NODE_HIGHLIGHTING':
						if (LevelAccess.testRunner.stop) {
							LevelAccess.testRunner.stop();
						}
						break;
					
					case 'DOCUMENT_CAPTURE':
						LevelAccess.testRunner.documentCapture(event.data.command.testTypes);
						return; // stop propagation since we always test the top frame
					
					case 'NODE_CAPTURE':
						if ((event.data.command.frameId === frameId) || (event.data.command.frameId === 'top' && window.top.location === window.location)) {
							var uel  = event.data.command.uel;
							var node = null;
							if (uel.indexOf("|") !== -1) {
								// indicates selected content is in ShadowDOM
								node = LevelAccess.testRunner.getElementFromOrigShadowRoot(uel);
							}
							else {
								node = document.querySelector(uel);
							}
							clone = node.cloneNode(false); // needed to enable an attribute to be set, will be swapped for original in AE
							clone.setAttribute("data-ae_domuel", uel);
							var testTypes = event.data.command.testTypes;
							LevelAccess.testRunner.nodeCapture(clone, testTypes);
							return; // stop propagation since we found the right frame
						}
						break;
					
					case 'NODE_CAPTURE_BODY':
						window.LevelAccess_AccessEngine.ast_nodeCapture_markdown();
						var bodyHtml = JSON.stringify(document.body.outerHTML);
						window.LevelAccess_AccessEngine.ast_nodeCapture_cleanup();
						
						window.postMessage({
							destination: 'ast',
							result     : {
								type   : 'NODE_SELECTION',
								node   : bodyHtml,
								uel    : 'body',
								frameId: window.frameId
							}
						}, "*");
						break;
					
					case 'NODE_POSITION':
						if ((event.data.command.frameId === frameId) || (event.data.command.frameId === 'top' && window.top.location === window.location)) {
							if (event.data.command.uel.indexOf("|") !== -1) {
								// indicates selected content is in ShadowDOM
								LevelAccess.testRunner.nodePosition(LevelAccess.testRunner.getElementFromOrigShadowRoot(event.data.command.uel));
							}
							else {
								LevelAccess.testRunner.nodePosition(document.querySelector(event.data.command.uel));
							}
							
							return; // stop propagation since we found the right frame
						}
						break;
					
					case 'PREVIEW_MODE':
						var getParents = function (el, parentSelector /* optional */) {
							// If no parentSelector defined will bubble up all the way to *document*
							if (parentSelector === undefined) {
								parentSelector = document;
							}
							
							var parents = [];
							var p       = el.parentNode;
							
							while (p !== parentSelector) {
								var o = p;
								parents.push(o);
								p = o.parentNode;
							}
							parents.push(parentSelector); // Push that parentSelector you wanted to stop at
							
							return parents;
						};
						
						var parent;
						if (event.data.command.parentSelector) {
							parent = document.querySelector(event.data.command.parentSelector);
						}
						
						var results    = [];
						var engResults = JSON.parse(LevelAccess_AccessEngine.ast_runPreviewMode_returnInstances_JSON(event.data.command.mode));
						
						for (var i = 0; i < engResults.length; i++) {
							var el = document.querySelector(engResults[i].path);
							
							if (event.data.command.parentSelector) {
								var parents = getParents(el);
								
								if (parents.indexOf(parent) === -1) {
									continue;
								}
							}
							
							engResults[i].tagName = el.tagName.toLowerCase();
							engResults[i].content = el.outerHTML;
							
							results.push(engResults[i]);
						}
						
						window.postMessage({
							destination: 'ast',
							result     : {
								type   : 'PREVIEW_MODE',
								mode   : event.data.command.mode,
								results: JSON.stringify(results),
								frameId: window.frameId
							}
						}, '*');
						break;
				}
			}
			
			// relay message to lower layers
			var iframes = document.querySelectorAll('iframe');
			for (var j = 0; j < iframes.length; j++) {
				iframes[j].contentWindow.postMessage(event.data, '*');
			}
		} else if (destination === 'ast') {
			// move results stuff to here
		}
		// TODO: this should use event.data.destination == 'page' instead, i think
		var result = event.data.result;
		if (result) {
			switch (result.type) {
				case 'NODE_CAPTURE_PREMESSAGE':
					// then the left and top coordinates are amended to include the left and top positions of all iframes between the content and the top window
					var position = result.position;
					
					// collect the frameId from the iframe which sent the message
					var fid     = result.frameId;
					var iframes = document.querySelectorAll('iframe');
					for (var i = 0; i < iframes.length; i++) {
						if (iframes[i].getAttribute('data-la-frameId') === fid) {
							var elCoords = LevelAccess.testRunner.calcPosition(iframes[i]);
							result.position.top += elCoords.top;
							result.position.left += elCoords.left;
							break;
						}
					}
					
					LevelAccess_AccessEngine.ast_nodeCapture_cleanup();
					
					if (window.top === window.self) {
						// Once the positions of all previous iframes have been added release the main message
						result.type = 'NODE_CAPTURE';
						window.postMessage({
							destination: 'ast',
							result     : result
						}, '*');
					}
					break;
				
				case 'RECONNECTED':
					// Don't send this back.
					return;
			}
			
			// pass results up to top window if not top window
			if (window.top !== window.self) {
				window.parent.postMessage(event.data, '*');
			}
		}
	},
	false
);