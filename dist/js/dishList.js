$(function () {
    var data = $('body').data(), channel = data.channel,
        $menuHeader = $("#menu-head"),
        $mwHeader=$(".mw-header"),
        headHeight = $menuHeader.outerHeight();
    initEntName(data, $menuHeader);
    // if (!window.isInWeixinApp()) {
    if (!window.isInWeixinApp()) {
        $menuHeader.removeClass('hidden');
        $mwHeader.removeClass('hidden');
    } else {
        $menuHeader.addClass("hidden");
        $mwHeader.addClass('hidden');
        headHeight = 0;
    }
    initMenu(headHeight);
    initPageHash();
    bindChooseDishEvent();

    bindMaskTouchEvent();
    bindBackToMenuEvent();
    bindCategoryClickEvent();
    bindClearShoppingCar();
    bindHiddenShoppingCar();

    // FastClick.attach(document.body);
});
function preventScroll(){
    //ios禁止拖动
    var agent = navigator.userAgent,
        _isAndroid = /(Android)/i.test(agent),
        _isiOS = /(iPhone|iPad|iPod|iOS)/i.test(agent) && !_isAndroid;
    if (_isiOS) {
        /*overScrollPrebySel($(".page-inner"));*/
    }
}

function initPageHash(){
    pageControl._addPage(allPage.dishList);
    pageControl._addPage(allPage.addAttr);
    pageControl._addPage(allPage.addSideDish);
    pageControl._addPage(allPage.dishDetail);
    pageControl._addPage(allPage.shoppingCar);
    pageControl._addPage(allPage.login);
    pageControl._init();
}


function initEntName(data,$menuHeader){
    if(data.model == 1){
        $menuHeader.html('加菜');
    } else {
        if (window.isInWeixinApp()) {
            setTitle('菜单');
        }
        $("title").html('菜单');
        $menuHeader.find('span').html("菜单");
    }
}

function bindClearShoppingCar(){
    $('.dish-show').on('click','.delete', function (event) {
        event.stopPropagation();
        event.preventDefault();
        $('#selectDish').empty();
        $('#zhushiList').empty();
        $('#canweiList').empty();

        $('#dishSelectNum').html(0);

        $('#foodSelectNum').html(0).hide();
        $('#foodSelectShow').hide();

        $('#tablewareNum').html(0);
        $('#totalPrice').html(0);
        $('#orderDishNum').html(0);
        $('#iconDisNum').html(0);
        var addList = getAddList();
        initSmallImageModeChosenData(addList, false);
        initNoImageModelChosenData(addList, false);
        initBigImageModeChosenData(addList, false);
        $('#tablewareNumContainer').addClass('hidden');
        removeAddDishList();
        history.back();
        hideShoppingCar();
    });
}

function bindCategoryClickEvent(){
    $("#smallImgCategory").on("click", "li", function (event) {
        event.stopPropagation();
        var $this = $(this), index = $this.index();
        $this.addClass("active").siblings("li").removeClass("active");
        $('#groupName').find('.menu-group').html($this.find('.group-name').html());
        $('#dishList')[0].scrollTop = dishLiHeight[index];
    });
}

function bindMaskTouchEvent(){
    $('.dish-mask').click(function () {
        history.back();
        hideShoppingCar();
        $(".dish-sure-num").show();
        $('#dishSure').data('selected', '0');
        $('#commitOrder').html('选好了').data('selected', '0');
    });
}
var pluginsObj = {};
var categoryHeight = [],dishLiHeight = [], $categoryLi, $dishLi,orderDish = true;
function initMenu(headHeight) {


    var dishMenu = menuData.dishMenu,
        dishList = menuData.dishes;
    if (!!menuData.returnCode && menuData.returnCode == '00' && dishMenu && dishMenu.length > 0 && dishList) {
        var winHeight = $(window).height(), dishArr;
        renderFunction();
        pluginsObj.fromModleCode = 0;
        pluginsObj.dishList = dishList;
        dishAttrData2Array(pluginsObj.dishList);
        pluginsObj.dishArr = setGroupName2DishList(dishMenu, dishList);
        //orderDish = false;

        pluginsObj.dishMenu = buildData(dishMenu, dishList);
        pluginsObj.headHeight = headHeight;
        if (!orderDish) {
            $('.dish-sure').addClass('hidden');
            $('.dish-notice').addClass('hidden');
            pluginsObj.winHeight = winHeight - headHeight;
        } else {
            $('.dish-notice').addClass('hidden');
            pluginsObj.winHeight = winHeight - headHeight - 52;
        }

        //初始化页面模式，1大图模式，2预览模式，3无图模式，4小图模式
        switchOther(4);
        initShoppingCarChosenData(getAddList());
        //初始化修改订单的订单数据
        initUpdateDishData();
    }
}

function bindChooseDishEvent(){
    bindMenuListBtnEvent($("#menu-main"));
}

function dishAttrData2Array(dishList){
    var dishId, dishInfo, dishAttr, i;
    for(dishId in dishList){
        dishInfo = dishList[dishId];
        dishAttr = dishInfo.dishAttrData;
        if(dishAttr.length <= 0){
            continue;
        }
        for( i = 0; i < dishAttr.length; i++){
            dishAttr[i].optionName = dishAttr[i].optionName.split('|');
        }
    }
}

function switchOther(modelCode) {
    $('.main').addClass('hidden');
    var addDishList = getAddList();

    switch (modelCode){
        case 1:
        case 2:
        case 3:
        case 4:
            $(".main[data-sort='4']").removeClass('hidden');
            var $dishList = $('#dishList'), smalData = $dishList.data();
            if (!!smalData.is_load && smalData.is_load == 1) {
                return;
            }

            buildSmallImageMenu(pluginsObj.dishMenu, pluginsObj.winHeight, pluginsObj.headHeight);
            initSmallImageModeChosenData(addDishList, true);
            smalData.is_load = 1;
            break;
    }

}

function buildData(dishMenu, dishList){

    var dishMenuItem, length = dishMenu.length, dishMenuArr = [], index = 0;
    for(var i = 0; i < length; i ++){
        dishMenuItem = dishMenu[i];
        var dishes = dishMenuItem.dishes;
        if(dishes.length <= 0){
            continue;
        }
        for(var j = 0; j < dishes.length; j++){
            dishes[j] = $.extend(true,{},dishList[dishes[j]]);
            dishes[j].rowIndex = index+"_" + j;
            dishes[j].orderDish = orderDish;
        }
        index++;
        dishMenuArr.push($.extend(true, {}, dishMenuItem));
    }

    return dishMenuArr;
}

function setGroupName2DishList(dishMenu, dishList){

    var i = 0, j = 0, menuLength = dishMenu.length,noIdCount= 0,
        dishLength = 0, dishMenuItem, dishes, index = 0,
        dishId, dishArr = [], dishInfo,dishListItem;
    for(; i < menuLength; i ++){
        noIdCount = 0;
        dishMenuItem = dishMenu[i];
        dishes = dishMenuItem.dishes;
        dishLength = dishes.length;
        if(dishLength <= 0){
            continue;
        }
        for(j = 0; j < dishLength; j++){
            dishId = dishes[j];
            if(typeof dishId == 'object'){
                noIdCount ++;
                continue ;
            }
            //对象深复制
            dishInfo = $.extend(true, {}, dishList[dishId]);
            dishInfo.groupName=dishMenuItem.dishGroupName;
            dishInfo.rowIndex = index + "_" + j;
            dishListItem =  pluginsObj.dishList[dishId];
            if(!dishListItem.groupIndex){
                dishListItem.groupIndex = [];
            }
            if(!dishListItem.groupType){
                dishListItem.groupType = [];
            }
            dishListItem.groupType.push(dishMenuItem.groupType);
            dishListItem.groupIndex.push(index);
            dishArr.push(dishInfo);
        }
        index ++;
    }
    return dishArr;
}

function renderFunction(){
    $.views.helpers({
        "trans2yuan" : function (price) {
            if($.isNumeric(price)){
                return parseFloat(price/100).toFixed(2);
            }else{
                return 0.00;
            }
        },
        "imgPath": function (dishPic) {
            return getPath() + "/" + dishPic;
        },
        "formatOptionName": function (optionName) {
            return optionName.join(' ');
        }
    });
}

/**
 * 构建小图模式的菜单
 * @param dishMenu
 * @param menuHeight
 */
function buildSmallImageMenu(dishMenu,menuHeight,headHeight){
    var $smallImgCategory = $("#smallImgCategory"), dishList = $("#dishList");

    dishList.data('is_load', 1);
    dishList.append($("#dishListTpl").render(dishMenu));
    $smallImgCategory.append($("#groupList").render(dishMenu));
    $(".mw-menu").removeClass('hidden');
    //$('#menu-main').css('top', headHeight);
    $(".mw-dish").css("height",menuHeight);

    $(".dish-list").each(function () {
        $(this).find("li.menu-cont").last().css("border-bottom", 0);
    });
    $categoryLi = $("#smallImgCategory li");
    $dishLi = $("#dishList li.dish-list");
    //将各个分类的高度放入数组中以便滚动时使用
    setLiHeight($categoryLi, categoryHeight);
    setLiHeight($dishLi, dishLiHeight);
    $smallImgCategory.find("li:nth-child(1)").addClass("active");
    var groupName = $smallImgCategory.find("li:nth-child(1)").data().group_name;
    $('#groupName').find(".menu-group").html(groupName);
    dishList.scrollspy({ target: '#smallImgCategoryWrapper' });

    lazyLoadImageWithContainer('img.scroll-loading',dishList, 50);
    preventScroll();
}

function getIndex(heightArr, position){
    if(position < 0){
        return -1;
    }
    if($.isArray(heightArr)&& $.isNumeric(position)){
        for(var i = 1; i < heightArr.length; i ++){
           if(position >= heightArr[i-1] && position < heightArr[i]){
               return i;
           }
        }
    }else{
        return 0;
    }
}

function loadImage($activeSlide){
    if($activeSlide.length <= 0){
        return ;
    }
    var $pic = $activeSlide.find("img.preview-img");
    var imgPath = $pic.attr("src"), pic = $pic.data().original;
    if (!imgPath || imgPath != pic) {
        $pic.attr("src", pic).error(function () {
            $(this).attr('src', getPath() + "/resource/image/defaultPic/defaultEntPic.s200.png");
        }).dealImage2Center();
    }
}

function setLiHeight(liArr, HeightArr){
    var heightTemp = 0;
    for(var i = 0; i < liArr.length; i ++){
        if(i == 0){
            HeightArr.push(0);
        }else{
            heightTemp += $(liArr[i-1]).outerHeight();
            HeightArr.push(heightTemp);
        }
    }
}

function showDishSide(){
    setTitle("请您选择");
    $('.mw-menu-main').addClass('hidden');
    $('.dish-sure').addClass('hidden');
    $('.dish-side-container').removeClass('hidden');
}

function hideDishSide(){
    var hash = location.hash;
    if(hash === dishDetailHash){
        setTitle('菜品详情')
    }else{
        setTitle('菜单');
    }
    $('.dish-sure').removeClass('hidden');
    $('.dish-side-container').addClass('hidden');
    $('.total-price-wrapper').addClass('hidden').find('.total-price').html('');
}


/**
 * 绑定菜品配菜页返回按钮的事件
 */
function bindBackToMenuEvent(){
    $("#backToMenu").on('click', function () {
        history.back();
        hideDishSide();
    });
}

function bindChooseSideSubmitDish() {
    $('#addDish').on('touchend', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var dishId = $('.dish-attr-container').data().dish_id;
        var isHide = addSideDish(pluginsObj.dishList[dishId]);
        if (isHide) {
            hideDishSide();
            history.back();
        }
    });
}

/**
 * 绑定菜品属性页关闭按钮事件
 */
function bindDishAttrCloseEvent(){
    $('.attr-close').on('click', function () {
        history.back();
        layer.closeAll();
    });
}

function changeHash(hash){
    //location.hash = hash;
}

/*//监听返回事件
function goBackListener(){
    window.addEventListener('popstate', function () {
        var hash = location.hash;
        dealHash(hash);
    });
}*/

function dealHash(hash){

    /*switch (hash){
        case '':
            changeHash(dishListHash);
        case '#dishList':

            break;
        case '#login':
            if(isLogin){
                $('.mw-menu').removeClass('hidden').siblings('.container').addClass('hidden');
                changeHash(dishListHash);
                layer.closeAll();
            }else{
            }
            break;
        case '#shoppingCar':
            break;
        /!*case '#page' :

            break;*!/
        default :
            break;
    }*/
}

function dishSure(div) {
    event.stopPropagation();
    var html = $('#warningTip').render({'data':'请点菜'});
    if($(".dish-show-ul li").length==0){
        $(".dish-sure-num").show();
        $('#commitOrder').html('选好了').data('selected', 0);
        //hideShoppingCar();
        layer.open({
            content: html,
            style: 'background-color:#353637; color:#fff; border:none;',
            time: 2,
            shade: true
        });
        return;
    }else{
        var data = $('body').data();
        var $div = $(div),
            selected = $div.data('selected');
        //console.log("selected : " + selected);
        if (selected == 1) {
            var addDishList = getAddList();
            if (addDishList.length <= 0) {
                layer.open({
                    content: html,
                    style: 'background-color:#353637; color:#fff; border:none;',
                    time: 2,
                    shade: false
                });
                return;
            }
            isUserLogin();
            $div.data('selected', '0');

        } else {
            pageControl._goto(shoppingCarHash);
            showShoppingCar();
            $(".dish-sure .dish-sure-num").hide();
            $div.data('selected', '1');
            setTimeout(function () {
                if(data.model == 1){
                    $div.html("确定加菜");
                }else{
                    $div.html("确定");
                }
            }, 500);

            //changeHash(dishListHash);
        }
    }

}
/**
 * 加菜
 */
function addDish(){
    var isAddDish = 0;
    if(data.model == 1){
        isAddDish = 1;
    }
	$("#commitOrder").removeAttr("onclick");
    var parme = getOrderData();
    if (!parme.orderData) {
    	$("#commitOrder").attr("onclick","dishSure(this);");
        return;
    }
    var actcivtyList = JSON.parse(parme.orderData).dishList;
    parme.orderId = data.order_id;
    parme.dishlist = JSON.stringify(actcivtyList);
    $.post(getPath() + "/order/addDishToOrderInMicroWeb.action", parme, function (returnData) {
        /*console.log(returnData);*/
        if (returnData.returnCode == '00' && returnData.orderId) {
            removeAddDishList();
            var parmeData = "&money="+$(".myorder-btn").find('span').attr('submitprice');
            if($("#dishEntDiscount").attr('check')==1){//商家优惠
            	parmeData += "&privilegeId="+$("#dishEntDiscount").attr('keyid');
            }
            if($("#dishUserDiscount").attr('check')==1){//个人优惠
            	parmeData += "&actKeyIds="+$("#dishUserDiscount").attr('keyid');
            }
            parmeData+="&tradeType=JSAPI";
            	
            if (is_weixn()) {
                location.href = getPath() + "/pay/wxpay/orderWxPayPage.action?orderId=" + returnData.orderId + "&domainHacks=" + data.domain_hacks + "&addDish=" + isAddDish+parmeData;
            } else {
                location.href = getPath() + "/" + data.domain_hacks + "/orderNotPay?orderId=" + returnData.orderId+ "&addDish=" + isAddDish+parmeData;
            }
        } else if (returnData.returnCode == '-002') {
            showLoginPage();
            hideMd();
            $("#commitOrder").attr("onclick","dishSure(this);");
        }
    }, 'json');
}

function orderCar(div) {
    var $div = $(div),
        selected = $div.data('selected');
    if (selected == 1) {
        $div.data('selected', '0');
    } else {
        if($(".dish-show-ul li").length <= 0){
            //hideShoppingCar();
            var html = $('#warningTip').render({'data':'请点菜'});
            layer.open({
                content: html,
                style: 'background-color:#353637; color:#fff; border:none;',
                time: 2,
                shade: true
            });
        }else{
            $(".dish-sure .dish-sure-num").hide();
            $div.data('selected', '1');
            $('#commitOrder').html('确定').data('selected', 1);
            pageControl._goto(shoppingCarHash);
            showShoppingCar();

        }
    }
}

/**
 * 提交订单
 * */
function commitOrder(isMerge) {
    var data = $('body').data();
/*    if(data.is_merge == 1){
        $(".recovery-order-remind2").css("display","block");
    }*/
    //0-点菜，1-加菜，2-修改

    	//提交订单，改版之后应该是修改订单状态
        submitOrder(data.model);

}

function updateChosenData(){
    var data = $('body').data(), addDishList = getAddList();

    var parme = {
        'orderId':data.order_id,
        'orderData':JSON.stringify({'dishList':addDishList})
    };

    $.post(getPath() + "/order/modifyToSubmit.action", parme, function (returnData) {
        if (returnData.returnCode == '00' && returnData.orderId) {
            nextPage(getRootPath() + "/orderDish?orderId="+returnData.orderId);
        } else if (returnData.returnCode == '-002') {
            showLoginPage();
            $(".myorder-btn button").remove("disabled");
        }
    }, 'json');
}

function submitOrder(){
    var isAddDish = 0;
    if(data.model == 1){
        isAddDish = 1;
    }
    var orderId='';
//    var parme = getOrderData(1);
    if($('body').attr('vr_order_id')){
    	orderId=$('body').attr('vr_order_id');
    }else{
    	orderId=$('body').data().order_id;
    }
    var parme = {"orderId": orderId};
    //console.log(orderId);
/*    $.post(getPath() + "/order/submitOrderInMicroWeb.action", parme, function (returnData) {*/
    $.post(getPath()+"/order/confirmOrder.action", parme, function(returnData){
        if (returnData.returnCode == '00' && returnData.orderId) {
            removeAddDishList();
            var parmeData = "&money="+$(".myorder-btn").find('span').attr('submitprice');
            if($("#dishEntDiscount").attr('check')==1){//商家优惠
            	parmeData += "&privilegeId="+$("#dishEntDiscount").attr('keyid');
            }
            if($("#dishUserDiscount").attr('check')==1){//个人优惠
            	parmeData += "&actKeyIds="+$("#dishUserDiscount").attr('keyid');
            }
            parmeData+="&tradeType=JSAPI";
            	
            if (is_weixn()) {
                location.href = getPath() + "/pay/wxpay/orderWxPayPage.action?orderId=" + returnData.orderId + "&domainHacks=" + data.domain_hacks + "&addDish=" + isAddDish+parmeData;
            } else {
                location.href = getPath() + "/" + data.domain_hacks + "/orderNotPay?orderId=" + returnData.orderId+ "&addDish=" + isAddDish+parmeData;
            }
        } else if (returnData.returnCode == '-002') {
            showLoginPage();
            $(".myorder-btn button").remove("disabled");
        }
    }, 'json');
}


/**
 * 获取订单信息
 * */
function getOrderData(isMerge) {

    var data = $('body').data();
    var remark = $("#remark").html();

    var totalPrice = parseFloat($('#totalPrice').html()).toFixed(2);
    var deskNum = readCookie('deskNum'), submitWay = 0;
    if (deskNum) {
        submitWay = 1;
    } else {
        deskNum = "";
    }
    var addDishList = getAddList();
    isMerge = !!isMerge ? isMerge:0;
    var parameter = {
        'submitWay': submitWay,
        'entId': data.ent_id,
        'totalPrice': totalPrice,
        'discount': 0,
        'payPrice': totalPrice,
        'orderType': 0,
        'memoryStatus': 1,
        'deskNo': deskNum,
        'remark': remark,
        'activityList': [],
        'dishList': addDishList,
        'isScanQr': 0,
        'orderSource': 2,
        'isMerge':isMerge
    };

    if (!data.channel) {
        data.channel = 4;
    }
    return {
        'orderData': JSON.stringify(parameter),
        'entId': data.ent_id,
        'channel': data.channel
    };
}
var isLogin = false;

function showRemarkPage() {
    $('.customer-remarks').removeClass('hidden').siblings('div.container').addClass('hidden');
}

function hiddenRemarkPage() {
    $('.customer-remarks').addClass('hidden');
    $('#submit-container').removeClass('hidden');
}

//点击点菜确定的触发方法，先要判断是否登录
function isUserLogin(){
    var bodyData = $('body').data();
    if(bodyData.model==0){
        $.ajax({
            type:"post",
            url:"/isLogin.action",
            dataType:'json',
            asyn:'false',
            success:function(returnData){
                //console.log(returnData);
                if(returnData.returnCode == '-002'){
                    if(desk){
                        //查询商家优惠
                        isHaveActivity(bodyData.ent_id);
                    }else{
                        pageControl._goto(loginHash);
                        showLoginPage();
                    }
                    isShowRecoveryOrderDialog = true;
                }else{
                    submitVrOrder();
                }
            }
        });
    }else if(bodyData.model == 1){
        submitVrOrder();
    }else{
        updateChosenData();
    }

}

var isShowRecoveryOrderDialog = false;
var desk = readCookie('deskNum');

/*点菜页，点击确定，提交虚拟订单*/
function submitVrOrder() {
    var bodyData = $('body').data(),
        orderInfo = getOrderData(),
        dishList = [],
        parameter={};
    if ($.trim(orderInfo.orderData) != '') {
    	dishList = JSON.parse(orderInfo.orderData).dishList;
    	parameter = JSON.parse(orderInfo.orderData);
    }
    if(dishList.length <= 0){
        return ;
    }
    //changeHash(dishListHash);

    parameter = {
        'orderData': JSON.stringify(parameter),
        'channel': orderInfo.channel==""?4:orderInfo.channel,
        'orderId': bodyData.order_id,
        'entId':bodyData.ent_id
    };
    $.ajax({
    	type:"post",
    	url:"/order/generateTempOrder.action",
    	data:parameter,
    	dataType:'json',
    	asyn:'false',
    	success:function(returnData){

    		//console.log(returnData);
    		if(returnData.returnCode == '-002'){

            } else if (returnData.returnCode == '00') {
                if (!!returnData.orderId && returnData.orderId != -1) {
                    bodyData.order_id = returnData.orderId;
                    if(returnData.isMerge == 2){
                        bodyData.is_merge = 2;
                    }
                    if(returnData.isMerge == 1){
                        bodyData.is_merge = 1;
                    }
                    if (isShowRecoveryOrderDialog) {
                        isShowRecoveryOrderDialog = false;
                    }
                }
                $('body').attr('data-order_id', returnData.orderId);
                $('body').attr('vr_order_id', returnData.tempOrderId);
                var urlPara = "";
                if(!!returnData.tempOrderId){
                    urlPara = "&subOrderId="+returnData.tempOrderId;
                }
                nextPage(getPath() + "/"+bodyData.domain_hacks+"/orderDish?orderId="+returnData.orderId+urlPara);
            }else{
                void 0;
            }
    	}
    });
}


function getDiscount($id){
	if(($id.attr('discount')-$("#totalMoney").val())>0){
		$(".myorder-btn").find('span').html("￥0.00");
	}else{
		$(".myorder-btn").find('span').html("￥"+parseFloat($("#totalMoney").val()-$id.attr('discount')).toFixed(2));
	}
}
//商家是否有优惠可用
var isHaveCoupons = 2;
function isHaveActivity(entId){
    var data = $('body').data();
    $.ajax({
        type:"post",
        url:"/order/queryIsHaveActivity.action",
        data:{entId:entId,channel:data.channel,domainHacks:data.domain_hacks},
        dataType:"json",
        asyn:"false",
        success:function(returnData){
            pageControl._goto(loginHash);
            //if(data.model == 0){
            if(returnData.returnCode=='00'){
                    if(!!returnData.isDesk){
                        showLoginPage();
                        return;
                    }
                    if(returnData.isHaveCoupons == 1) {
                        //有优惠劵
                        isHaveCoupons = 1;
                    }else if(returnData.isHaveCoupons == 0){
                        isHaveCoupons = 0;
                    }
                    showLoginPage();
                }else{
                    //console.log("网络出现异常");
                    showLoginPage();
                }
           // }

        }
    });
}

function is_weixn() {
    return "micromessenger" == navigator.userAgent.toLowerCase().match(/MicroMessenger/i);
}

function goIndex() {
    var data = $('body').data();
    window.location.href = getPath() + "/" + data.domain_hacks + "/index?channel=" + data.channel + "&backType=" + data.back_type;
}


//图片加载失败
function imageLoadFailed($obj) {
    $obj.each(function (index, element) {
        $(element).error(function () {
            $(this).attr('src', "../../resource/image/defaultPic/defaultEntPic.s200.png");
        });
    });
}

function showLoginPage() {
    //TODO 显示登录弹框
    $('.dish-verify-code').removeClass('hidden').siblings('.container').addClass('hidden');
    setTitle("验证手机号");
    //history.back();
    if (isHaveCoupons == 1) {
        $("#noHaveCoupons1").css("display", "none");
        $("#noHaveCoupons2").css("display", "none");
    } else if (isHaveCoupons == 0) {
        $("#haveCoupons1").css("display", "none");
        $("#haveCoupons2").css("display", "none");
    } else {
        $("#haveCoupons1").css("display", "none");
        $("#noHaveCoupons2").css("display", "none");
        $("#haveCoupons2").css("display", "none");
    }
}

//弹框消失
function hideShoppingCar(){
    $('#dishList').removeClass('ovfHiden');
    var hash = location.hash;
    if(hash === dishDetailHash){
        setTitle('菜品详情')
    }else{
        setTitle('菜单');
    }
    $('.dish-show').addClass('hidden').removeClass('slideInUp');
    $(".dish-mask").hide();
    $(".dish-sure-num").show();
    $('#dishSure').data('selected', '0');
    $('#commitOrder').html('选好了').data('selected', '0');
}
//弹框出现
function showShoppingCar(){
    $('.dish-mask').show();
    $('#dishList').addClass('ovfHiden');
    $('.dish-show').removeClass('hidden').addClass('slideInUp');
    setTitle('已选菜品');
}

function bindHiddenShoppingCar(){
    //向下运动
    $(".return-back").click(function(){

        $(".dish-show").removeClass("slideInUp1");
        $(".returnDowm").hide();
        history.back();
        hideShoppingCar();
    })
}



function setTitle(title){
    var body = document.getElementsByTagName('body')[0];
    document.title = title;
    var iframe = document.createElement("iframe");
    iframe.setAttribute("src", "/microweb/image/icon-adding.png");
    iframe.className = 'hidden';
    iframe.addEventListener('load', function() {
        setTimeout(function() {
            iframe.removeEventListener('load',this);
            document.body.removeChild(iframe);
        }, 0);
    });
    document.body.appendChild(iframe);
}
function inputchange() {
	var vcode = $('#vcode').val();
    if(!(/^[0-9]\d*$/.test(vcode))){
        $('#vcode').val(vcode.replace(/\D/g,''));
        vcode = $('#vcode').val();
    }
	if (vcode != '') {
		$('#buttsure').attr("onclick", "sureClick();");

		$('#buttsure').removeClass("verify-submit-disable").addClass("verify-submit");
	} else {
		$('#buttsure').attr("onclick", "");
		$('#buttsure').removeClass("verify-submit").addClass("verify-submit-disable");
	}
}

//点击登陆
function sureClick() {
    if (loginT)
        return;
    verify();
}
function verifyTrue() {
    var temp = login();//登陆
    if (temp) {//跳转
        $('#submit-container').removeClass('hidden');
        $('.dish-verify-code').addClass('hidden');
        //showChooseTablewareDialog();
        var bodyData = $('body').data();
        if(bodyData.model == 2 ){
            updateChosenData();
        }else{
            submitVrOrder();
        }
        isLogin = true;
    }
    else {
        void 0;
    }
}

function verifyFalse() {
    void 0;
}

function bindLoginBackEvent(){
    history.back();
}

//用于页面之间跳转的锚点值
var addDishAttrHash = "#addAttr",
    addDishSideHash = "#addSideDish",
    shoppingCarHash = "#shoppingCar",
    dishListHash = "#dishList",
    dishDetailHash = "#dishDetail",
    loginHash = "#login";

//页面hash声明
var allPage = {
    'dishList' :  {
        sel: "#dishList",
        hash: "#dishList",
        _back: function() {
            //console.log("back");
            showDishList();
        },
        _show: function() {
        }
    },
    'login' :  {
        sel: "#login",
        hash: "#login",
        _back: function() {
            $('.dish-verify-code').addClass('hidden').siblings('.container').removeClass('hidden');
        },
        _show: function() {
        }
    },
    'addAttr' :  {
        sel: "#addAttr",
        hash: "#addAttr",
        _back: function() {
            showDishList();
        },
        _show: function() {
        }
    },
    'addSideDish' :  {
        sel: "#addSideDish",
        hash: "#addSideDish",
        _back: function() {
            //console.log("back");
            showDishList();
            var hash = location.hash;
            if(hash === dishDetailHash){
                $('#dish-detail').removeClass('hidden');
                setTitle('菜品详情')
            }else{
                $('.mw-menu-main').removeClass('hidden');
                setTitle('菜单');
            }
        },
        _show: function() {
        }
    },'dishDetail' :  {
        sel: "#dishDetail",
        hash: "#dishDetail",
        _back: function() {
            showDishListFromDishDetail();
        },
        _show: function() {

        }
    },
    'shoppingCar' :  {
        sel: "#shoppingCar",
        hash: "#shoppingCar",
        _back: function() {
            showDishList();
        },
        _show: function() {
            showShoppingCar();
        }
    }
};


function showDishList(title) {
    title = title || setTitle('菜单');
    var hash = location.hash;
    if(hash === dishDetailHash){
        setTitle('菜品详情')
    }
    $(".dish-show").removeClass("slideInUp1");
    $(".returnDowm").hide();
    hideShoppingCar();
    layer.closeAll();
    $('#dishSideWrap').addClass('hidden');
    $('.dish-sure').removeClass('hidden');
}

function showDishListFromDishDetail(){
    var $dishDetail = $('#dish-detail'),
        sort = $dishDetail.data('sort');
    $dishDetail.addClass('hidden');
    $('.mw-menu-main').removeClass('hidden');
}