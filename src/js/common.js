function getRootPath(){
    //获取当前网址，如： http://localhost:8083/uimcardprj/share/meun.jsp
    var curWwwPath=window.document.location.href;
    //获取主机地址之后的目录，如： uimcardprj/meun.jsp
    var pathName=window.document.location.pathname;
    var pos=curWwwPath.indexOf(pathName);
    //获取主机地址，如： http://localhost:8083
    var localhostPaht=curWwwPath.substring(0,pos);
    //获取带"/"的项目名，如：/uimcardprj
    var projectName=pathName.substring(0,pathName.substr(1).indexOf('/')+1);
    return(localhostPaht+projectName);
}
function getPath(){
    var curWwwPath=window.document.location.href;
    //获取主机地址之后的目录，如： uimcardprj/meun.jsp
    var pathName=window.document.location.pathname;
    var pos=curWwwPath.indexOf(pathName);
    //获取主机地址，如： http://localhost:8083
    var localhostPaht=curWwwPath.substring(0,pos);
    //获取带"/"的项目名，如：/uimcardprj

    return(localhostPaht);
}

function lazyLoadImageWithContainer(img,$container,threshold){
    $(img).lazyload({
        effect: 'fadeIn',
        threshold: threshold,
        container : $container,
        placeholder : getPath() + '/microweb/image/load-failed.png',
        load: function () {
            dealImage2Center(this);
            //$(this).dealImage2Center();
        }
    });
}

/**
 * 配合lazyload 使用
 * 图片居中显示
 * @param img
 * @private
 */
function dealImage2Center(img) {
    var self = img;
    var $this = $(img);
    var objHeight = self.naturalHeight;//图片高度
    var objWidth = self.naturalWidth;//图片宽度
    var _setImageStyle = function (width, height) {
        var parentHeight = $this.parent().height();//图片父容器高度
        var parentWidth = $this.parent().width();//图片父容器宽度
        /*console.log();*/
        var ratio = width / height;

        var tempHeight = parentWidth / ratio;
        var tempWidth = parentHeight * ratio;

        if (tempHeight >= parentHeight) {
            $this.width(parentWidth);
            $this.height(tempHeight);
            $this.css("top", (parentHeight - tempHeight) / 2 + "px")
        } else {
            $this.height(parentHeight);
            $this.width(tempWidth);
            $this.css("left", (parentWidth - tempWidth) / 2 + "px");
        }

        $this.data('loaded', 1);
        $this.css('visibility', 'visible');
    };

    !function () {
        if ($this.hasClass('scrollLoaded')) {//已处理过则跳过
            return;
        }

        if (objHeight > 0 && objWidth > 0) {
            _setImageStyle(objWidth, objHeight);
        }
        if (!objHeight || objHeight <= 0 || !objWidth || objWidth <= 0) {
            var timer = setInterval(function () {
                if (self.complete) {
                    _setImageStyle(self.naturalWidth, self.naturalHeight);
                    clearInterval(timer);
                }
            }, 300);
        }
    }();
}
/**
 * 图片处理为居中显示的jQuery插件
 */
(function ($) {
    $.fn.dealImage2Center = function () {

        return this.each(function () {
            var $this = $(this);
            var objHeight = $this[0].clientHeight;//图片高度
            var objWidth = $this[0].clientWidth;//图片宽度
            var _setImageStyle = function (width, height) {
                var parentHeight = $this.parent().height();//图片父容器高度
                var parentWidth = $this.parent().width();//图片父容器宽度
                /*console.log();*/
                var ratio = width / height;

                var tempHeight = parentWidth / ratio;
                var tempWidth = parentHeight * ratio;

                if (tempHeight >= parentHeight) {
                    $this.width(parentWidth);
                    $this.height(tempHeight);
                    $this.css("top", (parentHeight - tempHeight) / 2 + "px")
                } else {
                    $this.height(parentHeight);
                    $this.width(tempWidth);
                    $this.css("left", (parentWidth - tempWidth) / 2 + "px");
                }

                $this.data('loaded', 1);
                $this.css('visibility', 'visible');
            };

            !function () {
                if ($this.hasClass('scrollLoaded')) {//已处理过则跳过
                    return;
                }

                if (objHeight > 0 && objWidth > 0) {
                    _setImageStyle(objWidth, objHeight);
                }
                if (!objHeight || objHeight <= 0 || !objWidth || objWidth <= 0) {
                    var timer = setInterval(function () {
                        /*$this.error(function () {
                            $this[0].attr('src', getPath() + "/resource/image/defaultPic/defaultEntPic.s200.png");
                            clearInterval(timer);
                        });*/
                        if ($this[0].complete) {
                            _setImageStyle($this[0].naturalWidth, $this[0].naturalHeight);
                            clearInterval(timer);
                        }
                    }, 300);
                }
            }();
        });
    }
})(jQuery);




function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' '){
            c = c.substring(1,c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length,c.length);
        }
    }
    return null;
}

/**
 * 保存至本地存储
 * @param key
 * @param value
 */
function saveJson2LocalStorage(key, value){
    if(localStorage){
        localStorage.setItem(key, JSON.stringify(value));
    }
}

function getFromLocalStorage(key){
    if(localStorage){
       var value =  localStorage.getItem(key);
        if(!!value && $.trim(value) != ''){
            return JSON.parse(value);
        }
        return null;
    }
    return null;
}

function removeFromLocalStorage(key){
    localStorage.removeItem(key);
}


//判断是否是微信内置浏览器
window.isInWeixinApp = function() {
    return /MicroMessenger/.test(navigator.userAgent);
};

//返回上一页
function returnIndex(){
    window.history.go(-1);
}
if(window.isInWeixinApp()){
    $(".backHome").css("display","block");
}else{
    $(".backHome").css("display","none");
}
if(window.isInWeixinApp()){
    $("#head").hide();
    $("#submitContainer .header").hide();
    $("#choseCouponContainer .header").hide();
    $("#payFail .header").hide();
    $("#paySuccess1 .header").hide();
    $("#paySuccess2 .header").hide();


}else{
    $("#head").show();
    $("#submitContainer .header").show();
    $("#choseCouponContainer .header").show();
    $("#payFail .header").show();
    $("#paySuccess1 .header").show();
    $("#paySuccess2 .header").show();
}
if(window.isInWeixinApp()){
    $(".nowx-header").hide();
}else{
    $(".nowx-header").show();
}

function getAddList() {
    var domainHack = $('body').data('domain_hacks');
    var addDishList = getFromLocalStorage(domainHack+'_addDishList');
    if (!addDishList) {
        addDishList = [];
    }
    return addDishList;
}

function removeAddDishList() {
    var domainHack = $('body').data('domain_hacks');
    removeFromLocalStorage(domainHack+'_addDishList');
}

function saveChosenDish2Local(addDishList) {
    var domainHack = $('body').data('domain_hacks');
    saveJson2LocalStorage(domainHack + '_addDishList', addDishList);
}

var pageControl = {
    historylog: [],
    prehistory: [],
    isback: false,
    configs: [],
    _goto: function(name) {
        var config = this._find(name);
        if (config == null) {
            return;
        }
        config._show();
        var hashName = config.hash;
        location.hash = hashName;
        this.isback = false;
        this.historylog.push(hashName);
    },
    _find: function(key) {
        for (var ele in this.configs) {
            if (this.configs[ele].hash == key) {
                return this.configs[ele];
            }
        }
        return null;
    },
    _getPre: function() {
        var length = this.prehistory.length;
        if (length > 0) {
            return this.prehistory[length - 1];
        }
        return null;
    },
    _addPage: function(config) {
        this.configs.push(config);
    },
    _init: function() {
        window.onhashchange = function() {
            if (pageControl.isback) { //返回
                var hash = pageControl.historylog.pop();
                var config = pageControl._find(hash);
                config._back();
                pageControl.prehistory.push(hash);
            }
            pageControl.isback = true;
        }
    }
};

function nextPage(url){
    for(var n=0;n<pageControl.historylog.length;n++){
        history.back();
    }
    setTimeout(function(){window.location.href=url},3);

}