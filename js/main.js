var hover_cycle;
var hover_cycle_interval = 75;
var mono_col_breakpoint = 767;

$(document).ready(function() {

	var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))
    	$('html').addClass('ie');
 
	$('.js .panel').addClass('fade-me');

	fadePanels();
	switchLayout();

	$(".journal-gallery").addClass("gallery-cover");
	
	if ($(window).width() <= mono_col_breakpoint)
		$('body').addClass('mono').removeClass('duo');

	$('.text iframe[src*="youtube.com/embed/"]').wrap('<div class="youtube"></div>');

	$("#back-to-top a").on("click", function(e) {
		e.preventDefault();
		$('html, body').stop(true).animate({scrollTop:0}, 500);
	});

	$("nav#credits .active-territory a, .screen").on("click", function(e) {
		e.preventDefault();
		$(".territory-list").toggleClass("active");	
		$('body').toggleClass('territories-active');
	});

	$(".gallery-cover a.more").on("mouseover", function(e) {
		$(this).parent().parent().toggleClass("hover");
	}).on("mouseout", function(e) {
		$(this).parent().parent().toggleClass("hover");
	});

	if ($('body').hasClass('home-section') && $('body').hasClass('mono'))
		$('header').addClass('scrolled');
	
	$(window).scroll(function(e) {

		if ($(window).scrollTop() > $('header#nav').outerHeight()+$('header#nav').offset().top || $('header#nav').hasClass('mobilised') || ($('body').hasClass('home-section') && $('body').hasClass('mono')))
			$('header').addClass('scrolled');
		else
			$('header').removeClass('scrolled');

	});
	
	$('button.menu').on('click', function(e) {
		$('button.menu i').toggleClass('hide');
		$('header, footer').toggleClass('mobilised');
	});

	$(window).on('resize', function() {

		$('.js .panel').addClass('fade-me');
		switchLayout();

		$('.hero .bg, .music-index-item .bg, .release-header .bg').each(function() {
			var obj = $(this);
			var url = obj.css("background-image");
			url = $(window).width() <= mono_col_breakpoint
				? url.replace("-rect-", "-square-")
				: url.replace("-square-", "-rect-");
			obj.css({"background-image": url});
		});

	});
	

	$('.hover-cycle').find('a').on('mouseover', function(e) {
		if(!$(this).parent().hasClass('active') || $(this).parent().parent().parent().parent().hasClass('mobilised'))
		{
			this_hover = $(this);
			current_class = $(this).attr('class');
			x = parseInt(current_class.substring(4, 5));
			step();
		}
	});

	$('.hover-cycle').find('a').on('mouseout', function(e) {
		if (!$(this).parent().hasClass('active') || $(this).parent().parent().parent().parent().hasClass('mobilised'))
		{
			clearTimeout(hover_cycle);
			this_hover.removeClass('menu1 menu2 menu3 menu4 menu5').addClass(current_class);
		}
	});

	$("body").on("click", "a.play-button", function(e) {

		e.preventDefault();
		
		if ($(".inline-video").length > 0)
			video.remove();

		video = 
			$("<div class=\"inline-video\"><iframe src=\"https://www.youtube.com/embed/"+$(this).attr("data-youtube-id")+"?rel=0&showinfo=0&wmode=transparent&autoplay=1\" frameborder=\"0\" allowfullscreen></iframe><a class=\"close\" href=\"#\"><i class=\"icon-close\"></i></a></div>");
		video.insertAfter($(this));

		video.hide().fadeIn(500, function() {
			$(this).find("a.close").addClass("positioned");
		});
		
		video.on("click", "a.close", function(e) {
			e.preventDefault();
			$(this).removeClass("positioned");
			video.find("iframe").fadeOut(500, function() {
				video.remove();
			});
		});
	});
	
	$('.ie9 .panel.song-header .panel-content, .ie9 .panel.tweet .panel-content, .ie9 .panel.moment .panel-content, .ie9 .panel.gallery-cover .panel-content, .ie9 .instagram-hover, .ie9 .journal-moments .panel-content, .ie9 .panel.four-zero-four .panel-content').wrapInner('<div class="v-center"><div class="v-center-cell"></div></div>');

});

$(window).load(function() {

	retinas = $('.retinafy');
	for(i=0; i<retinas.length; i++)
		retinafy($(retinas[i]));

	$(".duo .agif").each(function() {
		var gif_id = $(this).attr("id");
		var gif_url = $(this).attr("data-gif-url");
		var img = new Image();
		$(img).load(function() {
			$("#"+gif_id).append($(img));
		}).attr("src", gif_url);

	});

});


function fadePanels() {

	if ($('.journal-section .isotope').length > 0)
	{
		$('.fade-me').not('.faded').waypoint(function(direction) {
			$(this).addClass('wp');
			 $(this).animate({'opacity': 1}, 250, function() {
				$(this).addClass('faded');
			 });
		}, { offset: '100%', context: '.isotope' });

	} else {
	
		$('.fade-me').not('.faded').waypoint(function(direction) {
			$(this).addClass('wp');
			 $(this).animate({'opacity': 1}, 250, function() {
				$(this).addClass('faded');
			 });
		}, { offset: '100%' });

	}
}

function switchLayout() {

	if ($(window).width() <= mono_col_breakpoint)
	{
		$('body').addClass('mono').removeClass('duo');
	} else {
		$('body').removeClass('mono').addClass('duo');
	}

}

function step()
{
	if (x > 6)
		x = 1;
	$(this_hover).removeClass().addClass('menu'+x);
	x++;
	hover_cycle = setTimeout(step, hover_cycle_interval);
	
}

function retinafy_if_file_exists(obj, url)
{
	var http;
	http = new XMLHttpRequest();
	http.open('HEAD', url);
	http.onreadystatechange = function() {

		if (http.readyState !== 4) {
			return false;
		}
		if (http.status >= 200 && http.status <= 399) {

			if (obj.hasClass('retinafy-src')) {

				obj.attr('src', url);

			} else {

				var img = new Image;
				$(img).load(function() {
					retinafy_replace(obj, url)
				}).attr("src", url);
				return true;
			}
		}
	};

	http.send();

}

function retinafy_replace(obj, url)
{
	new_obj = $('<div class="bg" />');
	new_obj.insertAfter(obj);
	new_obj.css({'background-image': 'url('+url+')'}).hide().fadeIn(250, function() {
		new_obj.addClass('retinafied');	
		obj.remove();
	});

}

function retinafy(obj)
{

	image_replace = $(window).width() <= 1024 ? 'med' : 'lrg';

	var
		sml_suffix	= '-sml',
		med_suffix	= '-med',
		lrg_suffix	= '-lrg';

	suffix = window.devicePixelRatio > 1 && !(obj).hasClass('retinafy-size-med') && image_replace == 'lrg'
		? lrg_suffix
		: med_suffix;
	
	if (obj.hasClass('retinafy-src'))
	{
		url = obj.prop('src');
	} else {
		url = obj.css('background-image');
		url = /^url\((['"]?)(.*)\1\)$/.exec(url);
		url = url ? url[2] : '';
	}

	if (url != '') {
		retina_url = url.replace(sml_suffix, suffix);
		retinafy_if_file_exists(obj, retina_url);
	}

}

window.onload = checkSMECookie;

function setSMECookie(smecookiename,smecookievalue,exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = smecookiename+"="+smecookievalue+"; "+expires;
}

function getSMECookie(smecookiename) {
    var name = smecookiename + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function checkSMECookie() {
    var smecookienotice = getSMECookie("smecookienotice");
    if (smecookienotice != "yes") {
		setSMECookie("smecookienotice", "yes", 30);
		var $smecookiemsg = $('#smecookienotice');
			$smecookiemsg.fadeIn(function(){
    		setTimeout(function(){
        	$smecookiemsg.fadeOut(function(){
            $smecookiemsg.remove();
        		});
    		},5000);
		});
    }

$('#closesmecookienotice').click(function(e){    
    $('#smecookienotice').fadeOut('slow');
});

}

function css_browser_selector(u){var ua=u.toLowerCase(),is=function(t){return ua.indexOf(t)>-1},g='gecko',w='webkit',s='safari',o='opera',m='mobile',h=document.documentElement,b=[(!(/opera|webtv/i.test(ua))&&/msie\s(\d)/.test(ua))?('ie ie'+RegExp.$1):is('firefox/2')?g+' ff2':is('firefox/3.5')?g+' ff3 ff3_5':is('firefox/3.6')?g+' ff3 ff3_6':is('firefox/3')?g+' ff3':is('gecko/')?g:is('opera')?o+(/version\/(\d+)/.test(ua)?' '+o+RegExp.$1:(/opera(\s|\/)(\d+)/.test(ua)?' '+o+RegExp.$2:'')):is('konqueror')?'konqueror':is('blackberry')?m+' blackberry':is('android')?m+' android':is('chrome')?w+' chrome':is('iron')?w+' iron':is('applewebkit/')?w+' '+s+(/version\/(\d+)/.test(ua)?' '+s+RegExp.$1:''):is('mozilla/')?g:'',is('j2me')?m+' j2me':is('iphone')?m+' iphone':is('ipod')?m+' ipod':is('ipad')?m+' ipad':is('mac')?'mac':is('darwin')?'mac':is('webtv')?'webtv':is('win')?'win'+(is('windows nt 6.0')?' vista':''):is('freebsd')?'freebsd':(is('x11')||is('linux'))?'linux':'','js']; c = b.join(' '); h.className += ' '+c; return c;}; css_browser_selector(navigator.userAgent);

(function(){var t=[].indexOf||function(t){for(var e=0,n=this.length;e<n;e++){if(e in this&&this[e]===t)return e}return-1},e=[].slice;(function(t,e){if(typeof define==="function"&&define.amd){return define("waypoints",["jquery"],function(n){return e(n,t)})}else{return e(t.jQuery,t)}})(window,function(n,r){var i,o,l,s,f,u,c,a,h,d,p,y,v,w,g,m;i=n(r);a=t.call(r,"ontouchstart")>=0;s={horizontal:{},vertical:{}};f=1;c={};u="waypoints-context-id";p="resize.waypoints";y="scroll.waypoints";v=1;w="waypoints-waypoint-ids";g="waypoint";m="waypoints";o=function(){function t(t){var e=this;this.$element=t;this.element=t[0];this.didResize=false;this.didScroll=false;this.id="context"+f++;this.oldScroll={x:t.scrollLeft(),y:t.scrollTop()};this.waypoints={horizontal:{},vertical:{}};this.element[u]=this.id;c[this.id]=this;t.bind(y,function(){var t;if(!(e.didScroll||a)){e.didScroll=true;t=function(){e.doScroll();return e.didScroll=false};return r.setTimeout(t,n[m].settings.scrollThrottle)}});t.bind(p,function(){var t;if(!e.didResize){e.didResize=true;t=function(){n[m]("refresh");return e.didResize=false};return r.setTimeout(t,n[m].settings.resizeThrottle)}})}t.prototype.doScroll=function(){var t,e=this;t={horizontal:{newScroll:this.$element.scrollLeft(),oldScroll:this.oldScroll.x,forward:"right",backward:"left"},vertical:{newScroll:this.$element.scrollTop(),oldScroll:this.oldScroll.y,forward:"down",backward:"up"}};if(a&&(!t.vertical.oldScroll||!t.vertical.newScroll)){n[m]("refresh")}n.each(t,function(t,r){var i,o,l;l=[];o=r.newScroll>r.oldScroll;i=o?r.forward:r.backward;n.each(e.waypoints[t],function(t,e){var n,i;if(r.oldScroll<(n=e.offset)&&n<=r.newScroll){return l.push(e)}else if(r.newScroll<(i=e.offset)&&i<=r.oldScroll){return l.push(e)}});l.sort(function(t,e){return t.offset-e.offset});if(!o){l.reverse()}return n.each(l,function(t,e){if(e.options.continuous||t===l.length-1){return e.trigger([i])}})});return this.oldScroll={x:t.horizontal.newScroll,y:t.vertical.newScroll}};t.prototype.refresh=function(){var t,e,r,i=this;r=n.isWindow(this.element);e=this.$element.offset();this.doScroll();t={horizontal:{contextOffset:r?0:e.left,contextScroll:r?0:this.oldScroll.x,contextDimension:this.$element.width(),oldScroll:this.oldScroll.x,forward:"right",backward:"left",offsetProp:"left"},vertical:{contextOffset:r?0:e.top,contextScroll:r?0:this.oldScroll.y,contextDimension:r?n[m]("viewportHeight"):this.$element.height(),oldScroll:this.oldScroll.y,forward:"down",backward:"up",offsetProp:"top"}};return n.each(t,function(t,e){return n.each(i.waypoints[t],function(t,r){var i,o,l,s,f;i=r.options.offset;l=r.offset;o=n.isWindow(r.element)?0:r.$element.offset()[e.offsetProp];if(n.isFunction(i)){i=i.apply(r.element)}else if(typeof i==="string"){i=parseFloat(i);if(r.options.offset.indexOf("%")>-1){i=Math.ceil(e.contextDimension*i/100)}}r.offset=o-e.contextOffset+e.contextScroll-i;if(r.options.onlyOnScroll&&l!=null||!r.enabled){return}if(l!==null&&l<(s=e.oldScroll)&&s<=r.offset){return r.trigger([e.backward])}else if(l!==null&&l>(f=e.oldScroll)&&f>=r.offset){return r.trigger([e.forward])}else if(l===null&&e.oldScroll>=r.offset){return r.trigger([e.forward])}})})};t.prototype.checkEmpty=function(){if(n.isEmptyObject(this.waypoints.horizontal)&&n.isEmptyObject(this.waypoints.vertical)){this.$element.unbind([p,y].join(" "));return delete c[this.id]}};return t}();l=function(){function t(t,e,r){var i,o;if(r.offset==="bottom-in-view"){r.offset=function(){var t;t=n[m]("viewportHeight");if(!n.isWindow(e.element)){t=e.$element.height()}return t-n(this).outerHeight()}}this.$element=t;this.element=t[0];this.axis=r.horizontal?"horizontal":"vertical";this.callback=r.handler;this.context=e;this.enabled=r.enabled;this.id="waypoints"+v++;this.offset=null;this.options=r;e.waypoints[this.axis][this.id]=this;s[this.axis][this.id]=this;i=(o=this.element[w])!=null?o:[];i.push(this.id);this.element[w]=i}t.prototype.trigger=function(t){if(!this.enabled){return}if(this.callback!=null){this.callback.apply(this.element,t)}if(this.options.triggerOnce){return this.destroy()}};t.prototype.disable=function(){return this.enabled=false};t.prototype.enable=function(){this.context.refresh();return this.enabled=true};t.prototype.destroy=function(){delete s[this.axis][this.id];delete this.context.waypoints[this.axis][this.id];return this.context.checkEmpty()};t.getWaypointsByElement=function(t){var e,r;r=t[w];if(!r){return[]}e=n.extend({},s.horizontal,s.vertical);return n.map(r,function(t){return e[t]})};return t}();d={init:function(t,e){var r;e=n.extend({},n.fn[g].defaults,e);if((r=e.handler)==null){e.handler=t}this.each(function(){var t,r,i,s;t=n(this);i=(s=e.context)!=null?s:n.fn[g].defaults.context;if(!n.isWindow(i)){i=t.closest(i)}i=n(i);r=c[i[0][u]];if(!r){r=new o(i)}return new l(t,r,e)});n[m]("refresh");return this},disable:function(){return d._invoke.call(this,"disable")},enable:function(){return d._invoke.call(this,"enable")},destroy:function(){return d._invoke.call(this,"destroy")},prev:function(t,e){return d._traverse.call(this,t,e,function(t,e,n){if(e>0){return t.push(n[e-1])}})},next:function(t,e){return d._traverse.call(this,t,e,function(t,e,n){if(e<n.length-1){return t.push(n[e+1])}})},_traverse:function(t,e,i){var o,l;if(t==null){t="vertical"}if(e==null){e=r}l=h.aggregate(e);o=[];this.each(function(){var e;e=n.inArray(this,l[t]);return i(o,e,l[t])});return this.pushStack(o)},_invoke:function(t){this.each(function(){var e;e=l.getWaypointsByElement(this);return n.each(e,function(e,n){n[t]();return true})});return this}};n.fn[g]=function(){var t,r;r=arguments[0],t=2<=arguments.length?e.call(arguments,1):[];if(d[r]){return d[r].apply(this,t)}else if(n.isFunction(r)){return d.init.apply(this,arguments)}else if(n.isPlainObject(r)){return d.init.apply(this,[null,r])}else if(!r){return n.error("jQuery Waypoints needs a callback function or handler option.")}else{return n.error("The "+r+" method does not exist in jQuery Waypoints.")}};n.fn[g].defaults={context:r,continuous:true,enabled:true,horizontal:false,offset:0,triggerOnce:false};h={refresh:function(){return n.each(c,function(t,e){return e.refresh()})},viewportHeight:function(){var t;return(t=r.innerHeight)!=null?t:i.height()},aggregate:function(t){var e,r,i;e=s;if(t){e=(i=c[n(t)[0][u]])!=null?i.waypoints:void 0}if(!e){return[]}r={horizontal:[],vertical:[]};n.each(r,function(t,i){n.each(e[t],function(t,e){return i.push(e)});i.sort(function(t,e){return t.offset-e.offset});r[t]=n.map(i,function(t){return t.element});return r[t]=n.unique(r[t])});return r},above:function(t){if(t==null){t=r}return h._filter(t,"vertical",function(t,e){return e.offset<=t.oldScroll.y})},below:function(t){if(t==null){t=r}return h._filter(t,"vertical",function(t,e){return e.offset>t.oldScroll.y})},left:function(t){if(t==null){t=r}return h._filter(t,"horizontal",function(t,e){return e.offset<=t.oldScroll.x})},right:function(t){if(t==null){t=r}return h._filter(t,"horizontal",function(t,e){return e.offset>t.oldScroll.x})},enable:function(){return h._invoke("enable")},disable:function(){return h._invoke("disable")},destroy:function(){return h._invoke("destroy")},extendFn:function(t,e){return d[t]=e},_invoke:function(t){var e;e=n.extend({},s.vertical,s.horizontal);return n.each(e,function(e,n){n[t]();return true})},_filter:function(t,e,r){var i,o;i=c[n(t)[0][u]];if(!i){return[]}o=[];n.each(i.waypoints[e],function(t,e){if(r(i,e)){return o.push(e)}});o.sort(function(t,e){return t.offset-e.offset});return n.map(o,function(t){return t.element})}};n[m]=function(){var t,n;n=arguments[0],t=2<=arguments.length?e.call(arguments,1):[];if(h[n]){return h[n].apply(null,t)}else{return h.aggregate.call(null,n)}};n[m].settings={resizeThrottle:100,scrollThrottle:30};return i.on("load.waypoints",function(){return n[m]("refresh")})})}).call(this);


jQuery(document).ready(function($){
    const footerDate = document.getElementById('footerDate')
    if ( footerDate !== null ) {
        const d = new Date()
        footerDate.textContent = d.getFullYear()
    }
})
