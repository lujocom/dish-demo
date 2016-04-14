$(function () {
    bindChooseSideSubmitDish();
    bindAppendDishOptionEvent();
    bindShopCarOptionEvent();
});
var categoryDishNum = 'dish-group-num';
function initUpdateDishData() {
    var bodyData = $('body').data(),
        param = {
            'orderId': bodyData.order_id,
            'entId': bodyData.ent_id
        };
    if (bodyData.model != 2) {
        return;
    }
    if ($.trim(param.orderId) != '') {
        $.post(getPath() + "/order/modifyChosenDish.action", param, function (returnData) {
            if (!!returnData && returnData.returnCode == '00') {
                var chosenDish = getAddList();
                if (chosenDish.length > 0) {
                    return;
                }
                var addDishList = returnData.dishJa, dishInfoTmp, i = 0;
                chosenDish = [];
                for (; i < addDishList.length; i++) {
                    dishInfoTmp = buildChosenDishInfo(addDishList[i]);
                    chosenDish.push(dishInfoTmp);
                }
                saveChosenDish2Local(chosenDish);
                initShoppingCarChosenData(chosenDish);
                initSmallImageModeChosenData(chosenDish, true);
                initBigImageModeChosenData(chosenDish, true);
                //initPreviewModelChosenData(chosenDish, true);
                initNoImageModelChosenData(chosenDish, true);
            }

        }, 'json');
    }

}

function buildChosenDishInfo(chosenDishInfo) {
    var dishInfoTmp = $.extend(true, {}, chosenDishInfo);
    var dishInfo = pluginsObj.dishList[dishInfoTmp.dishId];
    dishInfoTmp.dishUnit = dishInfo.dishUnit;
    dishInfoTmp.showName = dishInfoTmp.dishName;
    if (dishInfoTmp.attrCombo != '' && $.trim(dishInfoTmp.attrCombo) != '') {
        dishInfoTmp.showName += "(" + dishInfoTmp.attrCombo.split('|').join(' ') + ")";
    }

    var sideDishArrStr = [], j, sideDish, sideDishPrice = 0, temp = '';
    if (!!dishInfoTmp.sideDishData) {
        for (j = 0; j < dishInfoTmp.sideDishData.length; j++) {
            sideDish = dishInfoTmp.sideDishData[j];
            sideDishPrice += sideDish.num * sideDish.price;
            if (sideDish.num > 1) {
                temp = sideDish.dishName + "x" + sideDish.num;
            } else {
                temp = sideDish.dishName;
            }
            sideDishArrStr.push(temp);
        }
    }
    if(dishInfo.dishAttrData.length > 0){
        dishInfoTmp.price = calculateTotalPriceByDishAttr(dishInfoTmp.attrCombo.split('|'), dishInfo);
    }
    dishInfoTmp.sideDishStr = '';
    if (sideDishArrStr.length > 0) {
        sideDishArrStr.sort(sortFun);
        dishInfoTmp.sideDishStr = sideDishArrStr.join('、');
    }

    dishInfoTmp.totalPrice = dishInfoTmp.price + sideDishPrice;
    dishInfoTmp.dishMd5 = $.md5(dishInfoTmp.showName + dishInfoTmp.sideDishStr);
    return dishInfoTmp;
}

function initSmallImageModeChosenData(addDishList, isPlus) {
    var i = 0, $container = $("#menu-main"), dishId;
    for (; i < addDishList.length; i++) {
        dishId = addDishList[i].dishId;
        setCategoryNumber($('#smallImgCategory'), dishId, addDishList[i].num, isPlus);
        $container.find('.dish-item[data-dish_id="' + dishId + '"]').each(function () {
            var $this = $(this), data = $this.data();
            if (data.option == 0) {
                setMenuChosenDish($this, addDishList[i], isPlus);
            } else {
                appendChosenDish4MenuSub($this, addDishList[i], isPlus, false);
            }
        });
    }
}

function initBigImageModeChosenData(addDishList, isPlus) {
    var i = 0, $container = $("#b-menu-container"), dishId;
    for (; i < addDishList.length; i++) {
        dishId = addDishList[i].dishId;
        setCategoryNumber($('#b-category-list'), dishId, addDishList[i].num, isPlus);
        $container.find('.dish-item[data-dish_id="' + dishId + '"]').each(function () {
            var $this = $(this);
            setMenuChosenDish($this, addDishList[i], isPlus);
        });
    }
}

function setMenuChosenDish($li, addDishInfo, isPlus) {
    if(!addDishInfo){
        $li.find('.dish-num').addClass('hidden').html(0);
        $li.find('.icon-subtract').addClass('hidden');
        $li.find('.subtract-dish').addClass('hidden');
        $li.find('.icon-adding').addClass('icon-add').removeClass('icon-adding');
        return ;
    }
    var number = parseInt($li.find('.dish-num').html());
    if(!$.isNumeric(number)){
        number = 0;
    }
    if(isPlus){
        number += addDishInfo.num;
    } else{
        number -= addDishInfo.num;
    }
    if(number <= 0){
        $li.find('.dish-num').addClass('hidden').html(0);
        $li.find('.icon-subtract').addClass('hidden');
        $li.find('.subtract-dish').addClass('hidden');
        $li.find('.icon-adding').addClass('icon-add').removeClass('icon-adding');
    }else{
        $li.find('.dish-num').removeClass('hidden').html(number);
        $li.find('.icon-subtract').removeClass('hidden');
        $li.find('.subtract-dish').removeClass('hidden');
        $li.find('.icon-add').removeClass('icon-add').addClass('icon-adding');
    }

}

function setCategoryNumber($cateContainer, dishId, num, isPlus) {
    var dishInfo = pluginsObj.dishList[dishId], length = dishInfo.groupIndex.length;
    for (var i = 0; i < length; i++) {
        var $category = $cateContainer.find('.dish-group-num').eq(dishInfo.groupIndex[i]);
        var chosenNum = parseInt($category.html());
        if(!$.isNumeric(chosenNum)){
            chosenNum = 0;
        }
        if(isPlus){
            chosenNum += num;
        }else{
            chosenNum -= num;
        }
        $category.html(chosenNum);
        if(chosenNum > 0){
            $category.removeClass('hidden');
        }else{
            $category.addClass('hidden');
        }
    }
}

function initNoImageModelChosenData(addDishList, isPlus) {
    var i = 0, $container = $("#n-menu-main"), dishId;
    for (; i < addDishList.length; i++) {
        dishId = addDishList[i].dishId;
        $container.find('.dish-item[data-dish_id="' + dishId + '"]').each(function () {
            var $this = $(this), data = $this.data();
            if (data.option == 0) {
                setMenuChosenDish($this, addDishList[i], isPlus);
            } else {
                appendChosenDish4MenuSub($this, addDishList[i], isPlus, true);
            }
        });
    }
}

function initShoppingCarChosenData(addDishList) {
    var i = 0;

    if (addDishList.length <= 0) {
        return;
    }
    var dishInfoList = [],
        zhushiList = [], canweiList = [], seatNumList=[],
        zhushiNum = 0,tablewareNum = 0,seatNum = 0
        ,j = 0, chosenDishNum = 0,   $totalPrice = $('#totalPrice'),
    totalPrice = yuan2penny($totalPrice.html()), dishInfoTmp, $htmTpl = $('#shopCarTpl');
    for (; i < addDishList.length; i++) {
        dishInfoTmp = addDishList[i];
        totalPrice += dishInfoTmp.totalPrice * dishInfoTmp.num;

        if(dishInfoTmp.groupType == 1){
            zhushiNum += dishInfoTmp.num;
            zhushiList.push(dishInfoTmp);
        }else if(dishInfoTmp.groupType == 2){
            seatNum += dishInfoTmp.num;
            seatNumList.push(dishInfoTmp);
        } else if(dishInfoTmp.groupType == 4){//餐具
            tablewareNum += dishInfoTmp.num;
            canweiList.push(dishInfoTmp);
        }else{
            chosenDishNum += dishInfoTmp.num;
            dishInfoList.push(dishInfoTmp);
        }
    }

    $("#zhushiList").append($htmTpl.render(zhushiList));
    $("#selectDish").append($htmTpl.render(dishInfoList));
    $("#seatNumList").append($htmTpl.render(seatNumList));
    $("#canweiList").append($htmTpl.render(canweiList));
    var $iconDishNum = $('#iconDisNum');
    $iconDishNum.html(chosenDishNum + seatNum +zhushiNum + tablewareNum + parseInt($iconDishNum.html()));
    var $orderDishNum = $('#orderDishNum');
    $orderDishNum.html(chosenDishNum + seatNum +zhushiNum + tablewareNum + parseInt($orderDishNum.html()));

    //菜品
    var $dishSelectNum = $('#dishSelectNum');
    $dishSelectNum.html(chosenDishNum + parseInt($dishSelectNum.html()));
    //餐位
    var $seatNum = $('#seatNum');
    $seatNum.html(seatNum + parseInt($seatNum.html()));
    //餐具
    var $tableNum = $('#tablewareNum');
    $tableNum.html(tablewareNum + parseInt($tableNum.html()));
    //总价
    $totalPrice.html(parseFloat2(totalPrice/100));

    if(zhushiNum > 0){
        $('#foodSelectNum').html(zhushiNum).show();
        $('#foodSelectShow').show();
    }

    if(seatNum > 0){
        $('#seatNumContainer').removeClass('hidden');
    }

    if(tablewareNum > 0){
        $('#tablewareNumContainer').removeClass('hidden');
    }
}

/**
 * 绑定某个container下的加菜按钮的按钮事件
 * @param $container
 */
function bindMenuListBtnEvent($container) {
    $container.on('click', '.add-dish', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var $this = $(this), $parent = $this.parents('li.dish-item');
        addDish2Html($parent.data(), pluginsObj.dishList, $parent);
    });
    $container.on('click', '.icon-choose', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var $this = $(this), $parent = $this.parents('li.dish-item');
        addDish2Html($parent.data(), pluginsObj.dishList, $parent);
    });
    $container.on('click', '.subtract-dish', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var $this = $(this), $parent = $this.parents('li.dish-item');
        subtractDish2Html($parent.data(), pluginsObj.dishList);
    });
}

function addDish2Html(data, dishList, $parent) {
    var dishInfo = dishList[data.dish_id];
    if (data.option == 0) {
        changeNumber(dishInfo, true, [], null);
    } else {
        initChosenDishInfo(dishInfo);
        var arrayLength = 0;
        if (dishInfo.sideDishData.length > 0) {
            addDisWithSide(dishInfo);
            arrayLength = $('.dish-attr-container').find('.dish-attr-wrapper').length;
        } else {
            addDishWithAttr(dishInfo, $parent);
        }
        var dishAttrArr = new Array(arrayLength);
        bindDishAttrEvent(dishInfo, dishAttrArr);
    }
}

function subtractDish2Html(data, dishList) {
    var dishInfo = dishList[data.dish_id];
    if (data.option == 0) {
        changeNumber(dishInfo, false, [], null);
    }
}

function changeNumber(dishInfo, isPlus, sideDish, dishAttr) {
    changeMenuGroupNumber(dishInfo, isPlus);
    var addDishInfo = changeShopCarDish(dishInfo, sideDish, dishAttr, isPlus);
    if (!dishInfo.sideDishData || !!dishInfo.sideDishData && dishInfo.sideDishData.length <= 0 && !dishAttr) {
        changeMenuSelectNumber(addDishInfo.dishName, isPlus);
    } else {
        appendChosenDish4MenuMain(addDishInfo, isPlus);
    }
    //修改购物车相关选菜数量
    changeSelectedDishNum('orderDishNum', isPlus);//未显示购物车的选菜总数
    changeSelectedDishNum('iconDisNum', isPlus);//显示购物车的选菜总数
    changeTotalMoney((addDishInfo.price + addDishInfo.sideDishPrice) / 100, isPlus);  //已选菜品总金额
    return addDishInfo;
}

/**
 * 修改有图菜单多个分类上显示选菜数目
 * @param dishInfo
 * @param isPlus
 */
function changeMenuGroupNumber(dishInfo, isPlus) {
    var groupIndex = 0;
    for (; groupIndex < dishInfo.groupIndex.length; groupIndex++) {
        changeMenuGroupNum(".small-img ." + categoryDishNum, dishInfo.groupIndex[groupIndex], isPlus);//小图菜单分类中显示数目
        changeMenuGroupNum(".big-img ." + categoryDishNum, dishInfo.groupIndex[groupIndex], isPlus);//大图菜单分类中显示数目
    }
}

/**
 * 修改有图菜单单个分类上显示选菜数目
 * @param dishNumClassName 分类上显示选菜数据的类名
 * @param groupRowIndex 分类索引
 * @param isPlus 是否是加菜
 */
function changeMenuGroupNum(dishNumClassName, groupRowIndex, isPlus) {
    var $groupNum = $(dishNumClassName).eq(groupRowIndex);
    setDishNumber($groupNum, isPlus);
    if (isGtZero($groupNum)) {
        $groupNum.removeClass("hidden");
    } else {
        $groupNum.addClass("hidden");
    }
}

/**
 * 修改菜单中多个菜品的选菜数目
 * @param dishName
 * @param isPlus
 */
function changeMenuSelectNumber(dishName, isPlus) {
    var $lis = $(".mw-menu-main").find('.dish-item[data-dish_name="' + dishName + '"]');
    $lis.each(function () {
        var $this = $(this);
        changeChosenNum($this.find('.add-dish'), isPlus);
    });
}

/**
 * 修改菜单中单个菜品选菜数目
 */
function changeChosenNum($dishItem, isPlus) {
    var $dishNum = $dishItem.siblings(".dish-num");
    var number = setDishNumber($dishNum, isPlus);
    if (isGtZero($dishNum)) {
        $dishItem.siblings(".dish-num").removeClass('hidden');
        $dishItem.siblings(".icon-subtract").removeClass('hidden');
        $dishItem.siblings(".subtract-dish").removeClass('hidden');
        $dishItem.siblings(".icon-add").addClass("icon-adding").removeClass("icon-add");
    } else {
        $dishItem.siblings(".dish-num").addClass('hidden');
        $dishItem.siblings(".icon-subtract").addClass('hidden');
        $dishItem.siblings(".subtract-dish").addClass('hidden');
        $dishItem.siblings(".icon-adding").addClass("icon-add").removeClass("icon-adding");
    }
    return number;
}

function appendChosenDish4MenuMain(dishInfo, isPlus) {
    var dishName = dishInfo.dishName,
        $lis = $("#menu-main").find('.dish-item[data-dish_name="' + dishName + '"]'),
        $noImgLis = $('#n-menu-main').find('.dish-item[data-dish_name="' + dishName + '"]');

    $lis.each(function () {
        var $this = $(this);
        appendChosenDish4MenuSub($this, dishInfo, isPlus, false);
    });

    $noImgLis.each(function () {
        var $this = $(this);
        appendChosenDish4MenuSub($this, dishInfo, isPlus, true);
    });

}
/**
 *
 * @param $this
 * @param dishInfo 菜品信息
 * @param isPlus 是否加菜
 * @param isNoImg 是否是无图模式
 */
function appendChosenDish4MenuSub($this, dishInfo, isPlus, isNoImg) {
    var $appendContainer = $this.find(".append-container"),
        isDelete = false, deleteIndex = -1, $acItem, isAppend = true, number, $firstAcItem;

    for (var i = 0; i < $appendContainer.length; i++) {
        $acItem = $($appendContainer[i]);
        $acItem.css({'border-bottom': '1px solid #E6E6E6'});
        if ($acItem.data().md5 == dishInfo.dishMd5) {
            number = setDishNumber($acItem.find('.dish-num'), isPlus);
            if (number <= 0) {
                isDelete = true;
                deleteIndex = i;
            }
            isAppend = false;
        }
    }
    if (isAppend) {
        var html = '';
        if (isNoImg) {
            html = $('#appendHtml2NoImgTpl').render(dishInfo);
        } else {
            html = $('#appendHtmlTpl').render(dishInfo);
        }
        $this.append(html);
    }
    if (isDelete) {
        $appendContainer.eq(deleteIndex).remove();
    }
    $firstAcItem = $this.find(".append-container").first();
    var $lastAcItem = $this.find('.append-container').last();
    $firstAcItem.addClass('triangle');
    if (isNoImg) {
        $this.find('.dish-wrapper').css('border-bottom', 0);
    } else {
        if($this.find('.menu-img').length > 0){
            $firstAcItem.css('margin-top', '20px');
        }else{
            $firstAcItem.css('margin-top', '5px');
        }
        $this.find(".append-container").css('margin-bottom', 0);
        if ($this.find(".append-container").length > 0) {
            $this.css('padding-bottom', 0);
        } else {
            $this.css('padding-bottom', '10px');
        }
        $lastAcItem.css('margin-bottom', 10);
    }
    $this.find(".append-container").last().css({'border-bottom': 0});
}

function changeShopCarDish(dishInfo, sideDishArr, dishAttr, isPlus) {
    var addDish = buildDishInfo2Md5Str(dishInfo, sideDishArr, dishAttr, isPlus);

    if(addDish.groupType == 4){//餐具
        var $tablewareContainer = $('#tablewareNumContainer'),
            $tablewareNum = $('#tablewareNum');
        appendChosen2ShopCar($("#canweiList"), $tablewareNum, addDish, isPlus);
        if(parseInt($tablewareNum.html()) > 0){
            $tablewareContainer.removeClass('hidden');
        }else{
            $tablewareContainer.addClass('hidden');
        }
    }else if(addDish.groupType == 2){//餐位
        var $seatNumberContainer = $('#seatNumContainer'),
            $seatNumber = $('#seatNum');
        appendChosen2ShopCar($("#seatNumList"), $seatNumber, addDish, isPlus);
        if(parseInt($seatNumber.html()) > 0){
            $seatNumberContainer.removeClass('hidden');
        }else{
            $seatNumberContainer.addClass('hidden');
        }
    }
    else if(addDish.groupType == 1){
        var $foodSelect = $("#foodSelectNum"), $foodSelectShow = $('#foodSelectShow');
        appendChosen2ShopCar($("#zhushiList"), $foodSelect, addDish, isPlus);
        if( parseInt($foodSelect.html()) > 0){
            $foodSelect.show();
            $foodSelectShow.show();
        }else{
            $foodSelect.hide();
            $foodSelectShow.hide();
        }

    }else{
        appendChosen2ShopCar($("#selectDish"), $("#dishSelectNum"), addDish, isPlus);
    }

    return addDish;
}

function appendChosen2ShopCar($container, $chosenNum, addDish, isPlus) {
    var $carList = $container.find('li.add-dish-item'), isAdd = true;
    if (!!$chosenNum) {
        setDishNumber($chosenNum, isPlus);
    }

    if ($carList.length <= 0) {
        $container.append($('#shopCarTpl').render(addDish));
        return addDish;
    }
    $carList.each(function () {
        var $this = $(this), data = $this.data();
        if (data.md5 == addDish.dishMd5) {
            isAdd = false;
            setShopCarChoseNum($this, isPlus);
        }
    });
    if (isAdd) {
        var html = $('#shopCarTpl').render(addDish);
        $container.append(html);
    }

}

/**
 * 修改购物车中某个菜品的选菜数
 * @param $li
 * @param isPlus
 */
function setShopCarChoseNum($li, isPlus) {
    var $groupNum = $li.find('.dish-num');
    setDishNumber($groupNum, isPlus);
    if (!isGtZero($groupNum)) {
        $li.remove();
    }
}

/**
 * 添加有规格属性的菜品
 * @param dishInfo
 */
function addDishWithAttr(dishInfo, $parent) {
    console.log(dishInfo);
    layer.open({
        type: 1,
        content: $('#attrTpl').render(dishInfo),
        anim: 0,
        style: 'position:fixed; bottom:0; left:0; width:100%; padding:10px 0; border:none;'
    });

    var $wrapper = $(".dish-attr-info .dish-attr-wrapper"), $chosen = $("#chosen"), attr;
    var $appendChosenDish = $parent.find('.append-container');

    if (!!$appendChosenDish && $appendChosenDish.length > 0
        && dishInfo.chosenDishAttr && dishInfo.chosenDishAttr.length > 0) {
        attr = dishInfo.chosenDishAttr.join(' ');
        $wrapper.find('div.attr').each(function () {
            var $this = $(this);
            for (var i = 0; i < dishInfo.chosenDishAttr.length; i++) {
                if ($this.html() === dishInfo.chosenDishAttr[i]) {
                    $this.addClass('on');
                }
            }
        });
        $('#addDishByAttr').addClass('hidden').siblings('.dish-option').removeClass('hidden');
        setDishAttrChosenNum(dishInfo, dishInfo.chosenDishAttr);
    } else {
        attr = $($wrapper[0]).find('div.attr').eq(0).addClass('on').html();
    }

    pageControl._goto(addDishAttrHash);
    $chosen.html($.trim(attr));
    setDishAttrTotalMoney($.trim(attr).split(' '), dishInfo);
    bindDishAttrAddDishEvent(dishInfo);
    bindDishAttrCloseEvent();
}

/**
 * 选择带有规格属性或者配菜的菜品时，先初始化同样一道菜第一次选择的菜品
 * @param dishInfo
 */
function initChosenDishInfo(dishInfo) {

    var addDishList = getAddList();
    for (var i = 0; i < addDishList.length; i++) {
        if (addDishList[i].dishId == dishInfo.dishId) {
            dishInfo.chosenDishAttr = addDishList[i].attrCombo.split('|');
            dishInfo.chosedSideDish = addDishList[i].sideDishData;
        }
    }
}

/**
 * 添加有配菜的菜品
 * @param dishInfo
 */
function addDisWithSide(dishInfo) {
    var $dishSide = $('#dishSide');
    $dishSide.empty().html($('#sideDishTpl').render(dishInfo));
    $("#sideList").find("li.d-side-ele").last().css('border-bottom', 0);
    showDishSide();
    pageControl._goto(addDishSideHash);
    var $wrapper = $(".dish-attr-wrapper");
    if($wrapper.length > 0){
        $wrapper.eq(0).find('div.attr').eq(0).addClass('on');
    }

    //绑定配菜列表的加菜和减菜事件
    bindSideListEvent(dishInfo);
}

/**
 * 绑定选择规格属性按钮事件
 */
function bindDishAttrEvent(dishInfo, dishAttrArr) {
    if (dishAttrArr.length > 0) {
        var index = 0;
        $('.dish-attr-container').find('.dish-attr-wrapper').each(function () {
            var $this = $(this);
            dishAttrArr[index++] = $this.find('.on').html();
        });
    }
    $('.dish-attr-wrapper').on('touchend', '.attr', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var $this = $(this);
        $this.addClass("on");
        $this.siblings().removeClass("on");
        var $chosen = $('#chosen'), data = $this.data();
        if ($chosen.length > 0) {//
            var attr = $chosen.html().trim().split(' ');
            attr[data.index] = $this.html();
            $($chosen).html(attr.join(' '));
            setDishAttrTotalMoney(attr, dishInfo);
            setDishAttrChosenNum(dishInfo, attr);

        } else {
            dishAttrArr[data.index] = $this.html();
            setSideDishTotalPrice(dishInfo, dishAttrArr, getChosenSideDish());
        }
    });
}

function setDishAttrChosenNum(dishInfo, attrArr) {

    var dishMd5 = $.md5(dishInfo.dishName + '(' + attrArr.join(' ') + ')'), num = 0;

    var addDishList = getAddList();
    for (var i = 0; i < addDishList.length; i++) {
        if (dishMd5 == addDishList[i].dishMd5) {
            num = addDishList[i].num;
        }
    }
    var $dishNum = $('.attr-option').find('.dish-num');
    $dishNum.html(num);
    var $addDish = $('#addDishByAttr');

    if (isGtZero($dishNum)) {
        $addDish.addClass('hidden').siblings('.dish-option').removeClass('hidden');
        $dishNum.removeClass('hidden');
        $dishNum.siblings(".icon-subtract").removeClass('hidden');
        $dishNum.siblings(".subtract-dish").removeClass('hidden');
        $dishNum.siblings(".icon-add").addClass("icon-adding").removeClass("icon-add");
    } else {
        $addDish.removeClass('hidden').siblings('.dish-option').addClass('hidden');
        $dishNum.addClass('hidden');
        $dishNum.siblings(".icon-subtract").addClass('hidden');
        $dishNum.siblings(".subtract-dish").addClass('hidden');
        $dishNum.siblings(".icon-adding").addClass("icon-add").removeClass("icon-adding");
    }
}

function setDishAttrTotalMoney(attrArr, dishInfo) {
    var totalMoney = calculateTotalPriceByDishAttr(attrArr, dishInfo);
    $('.total-price-wrapper').find('.total-price').html(parseFloat2(totalMoney / 100));
}

/**
 * 绑定选择规格属性的加菜和减菜事件
 */
function bindDishAttrAddDishEvent() {
    var $dishOption = $('.attr-option');
    $dishOption.on('touchend', '.add-dish', function (event) {
        chooseDishFromAttr($(this), true, event);
    });
    $dishOption.on('touchend', '.subtract-dish', function (event) {
        chooseDishFromAttr($(this), false, event);
    });
    $('#addDishByAttr').on('touchend', function (event) {
        var $this = $(this);
        chooseDishFromDishAttr($this, true, event);
    });
}

/**
 * 从选择菜品规格添加或者减去菜品
 * @param $this
 * @param dishInfo
 * @param isPlus
 * @param event
 */
function chooseDishFromDishAttr($this, isPlus, event) {
    var $add = $this.siblings('.dish-option').find('.add-dish');
    chooseDishFromAttr($add, isPlus, event);
}

function chooseDishFromAttr($this, isPlus, event) {
    event.preventDefault();
    event.stopPropagation();
    var $attrOption = $this.parents('.attr-option');
    var dishInfo = pluginsObj.dishList[$attrOption.data().dish_id];
    var attr = $.trim($('#chosen').html());
    var totalPrice = $attrOption.find('.total-price').html();

    dishInfo.price = yuan2penny(totalPrice);
    var dishAttrWrapper = $('.dish-attr-info ').find('.dish-attr-wrapper');
    if (attr.split(' ').length < dishAttrWrapper.length) {
        showNoChooseDishAtt(dishAttrWrapper);
        return;
    }

    changeNumber(dishInfo, isPlus, [], attr.split(' ').join('|'));
    var numeber = changeDishAttrNumber($this, isPlus);
    if (numeber > 0) {
        $this.parents('.dish-option').removeClass('hidden').siblings('#addDishByAttr').addClass('hidden');
    } else {
        $this.parents('.dish-option').addClass('hidden').siblings('#addDishByAttr').removeClass('hidden');
    }
}

function showNoChooseDishAtt(dishAttrWrapper) {
    var noChose = [], $item;
    for (var i = 0; i < dishAttrWrapper.length; i++) {
        $item = $(dishAttrWrapper[i]);
        if ($item.find('.on').length <= 0) {
            noChose.push($item.find('.d-atf').html());
        }
    }
    var html = $('#warningTip').render({'data':'请选择 ' + noChose.join(" ")});
    layer.open({
        content: html,
        style: 'background-color:#353637; color:#fff; border:none;',
        time: 2,
        shade: false
    });
}

function changeDishAttrNumber($this, isPlus) {
    return changeChosenNum($this.parents('.dish-option').find('.add-dish'), isPlus);
}

function bindSideListEvent(dishInfo) {
    $('#sideList').on('click', '.add-dish', function (event) {
        var $this = $(this);
        changeSideListChosenNum($this, dishInfo, true, event);
    }).on('click', '.subtract-dish', function (event) {
        var $this = $(this);
        changeSideListChosenNum($this, dishInfo, false, event);
    });
}

function changeSideListChosenNum($this, dishInfo, isPlus, event) {
    event.preventDefault();
    event.stopPropagation();
    changeChosenNum($this.parents('.dish-option').find('.add-dish'), isPlus);
    var index = 0, dishAttrArr = [], $dishAttrContainer = $('.dish-attr-container');
    $dishAttrContainer.find('.on').each(function () {
        var $this = $(this);
        dishAttrArr[index++] = $this.html();
    });
    setSideDishTotalPrice(dishInfo, dishAttrArr, getChosenSideDish());
}

function addSideDish(dishInfo) {

    var index = 0, dishAttrArr = [], $dishAttrContainer = $('.dish-attr-container');
    $dishAttrContainer.find('.on').each(function () {
        var $this = $(this);
        dishAttrArr[index++] = $this.html();
    });

    var dishAttrWrapper = $dishAttrContainer.find('.dish-attr-wrapper');
    if (dishAttrArr.length < dishAttrWrapper.length) {
        showNoChooseDishAtt(dishAttrWrapper);
        return false;
    }

    var sideArr = getChosenSideDish();
    dishInfo.totalPrice = calculateTotalPriceByDishAttr(dishAttrArr, dishInfo);
    var addDishInfo = changeNumber(dishInfo, true, sideArr, dishAttrArr.join('|'));

    return true;
}

function getChosenSideDish() {
    var sideArr = [];

    $('#sideList').find('li').each(function () {
        var $this = $(this), data = $this.data(), $num = $this.find('.dish-num'), sideDish = {};
        if ($num.html() != 0) {
            sideDish.dishName = data.dish_name;
            sideDish.price = data.price;
            sideDish.num = parseInt($num.html());
            sideArr.push(sideDish);
        }
    });
    return sideArr;
}

function setSideDishTotalPrice(dishInfo, dishAttr, sideDishArr) {
    var dishTotalPrice = calculateTotalPriceByDishAttr(dishAttr, dishInfo);
    if (sideDishArr.length >= 0) {
        for (var i = 0; i < sideDishArr.length; i++) {
            dishTotalPrice += sideDishArr[i].price * sideDishArr[i].num;
        }
    }
    if (dishTotalPrice <= 0) {
        return;
    }
    $('.da-price').html(parseFloat2(dishTotalPrice / 100));
    $('.dish-attr-container .d-uf').html('/'+dishInfo.dishUnit);
}

function bindAppendDishOptionEvent() {
    $('.mw-menu-main').on('touchend', '.plus-dish', function (event) {
        var $this = $(this);
        changeAppendDishInfo(event, true, $this);
    }).on('touchend', '.reduce-dish', function (event) {
        var $this = $(this);
        changeAppendDishInfo(event, false, $this);
    });
}

function changeAppendDishInfo(event, isPlus, $this) {
    event.preventDefault();
    event.stopPropagation();
    var data = $this.parents('div.append-container').data();

    var dishInfo = $.extend(true, {}, pluginsObj.dishList[data.dish_id]), sideDish, attrCombo;
    dishInfo.dishMd5 = data.md5;

    var addDishList = getAddList();
    for (var i = 0; i < addDishList.length; i++) {
        if (dishInfo.dishMd5 == addDishList[i].dishMd5) {
            sideDish = addDishList[i].sideDishData;
            attrCombo = addDishList[i].attrCombo;
        }
    }

    if (!!dishInfo) {
        changeNumber(dishInfo, isPlus, sideDish, attrCombo);
    }
}

function bindShopCarOptionEvent() {
    $('.dish-show-ul').on('touchend', '.add-dish', function (event) {
        var $this = $(this);
        changeShopCarChosenNumber(event, true, $this);
    }).on('touchend', '.subtract-dish', function (event) {
        var $this = $(this);
        changeShopCarChosenNumber(event, false, $this);
    });
}

function changeShopCarChosenNumber(event, isPlus, $this) {
    event.preventDefault();
    event.stopPropagation();
    var data = $this.parents('li').data();

    if (!data) {
        return;
    }

    var dishInfo = $.extend(true, {}, pluginsObj.dishList[data.dish_id]), sideDish, attrCombo;
    dishInfo.dishMd5 = data.md5;
    var addDishList = getAddList();
    for (var i = 0; i < addDishList.length; i++) {
        if (dishInfo.dishMd5 == addDishList[i].dishMd5) {
            sideDish = addDishList[i].sideDishData;
            attrCombo = addDishList[i].attrCombo;
        }
    }

    if (!!dishInfo) {
        var addDishInfo = changeNumber(dishInfo, isPlus, sideDish, attrCombo);
    }
}
/**
 * 根据选择的菜品规格属性，计算价格
 * @param attrArr
 * @param dishInfo
 * @returns {*}
 */
function calculateTotalPriceByDishAttr(attrArr, dishInfo) {

    if( !dishInfo){
        return 0;
    }

    if (!attrArr || !$.isArray(attrArr) || attrArr.length <= 0) {
        return dishInfo.price;
    }

    var i = 0, dishAttrConfigArr = dishInfo.dishAttrOptionPriceData;
    if (!$.isArray(dishAttrConfigArr)) {
        return 0;
    }
    var attrArrTemp = attrArr.slice(0);
    attrArrTemp.sort(sortFun);
    var attrConfigLength = dishAttrConfigArr.length, options;
    for (; i < attrConfigLength; i++) {
        options = dishAttrConfigArr[i].options.split('|').sort(sortFun);
        if (options.join('') == attrArrTemp.join('')) {
            return dishAttrConfigArr[i].dishPrice;
        }
    }
    return 0;
}
/**
 * 用于分类排序
 * @param a
 * @param b
 * @returns {boolean}
 */
function sortFun(a, b) {
    return a.localeCompare(b);
}


/**
 * 修改已选菜单中菜品总数目
 */
function changeSelectedDishNum(orderDishNum, isPlus) {
    setDishNumber($('#' + orderDishNum), isPlus);
}

/**
 * 修改已选菜的总价格
 */
function changeTotalMoney(price, isPlus) {
    var $totalPrice = $("#totalPrice");
    var totalPrice = parseFloat($totalPrice.html());
    if (isPlus) {
        $totalPrice.html(parseFloat2(totalPrice + price));
    } else {
        $totalPrice.html(totalPrice > price ? parseFloat2(totalPrice - price) : 0);
    }
}


/**
 * 修改菜品数字
 * @param $num 菜品数标签的jQuery对象
 * @param isPlus 是否是加
 */
function setDishNumber($num, isPlus) {
    var number = parseInt($num.html());
    if (isPlus) {
        $num.html(++number);
    } else {
        number = number > 1 ? number - 1 : 0;
        $num.html(number);
    }
    return number;
}

/**
 * 是否大于0
 * @param $num
 * @returns {boolean}
 */
function isGtZero($num) {
    return parseInt($num.html()) > 0;
}

function parseFloat2(price) {
    return parseFloat(price).toFixed(2)
}

function yuan2penny(price) {
    return parseInt(price * 100)
}

/**
 * 构建数据
 * @param dishInfo
 * @param sideDishArr
 * @param dishAttr
 * @param isPlus
 */
function buildDishInfo2Md5Str(dishInfo, sideDishArr, dishAttr, isPlus) {
    var addDish = $.extend(true, {}, dishInfo), sideDishPrice = 0,
        i = 0, sideDish, sideDishArrStr = [], temp;

    if (!!sideDishArr) {
        for (i = 0; i < sideDishArr.length; i++) {
            sideDish = sideDishArr[i];
            sideDishPrice += sideDish.num * sideDish.price;
            if (sideDish.num > 1) {
                temp = sideDish.dishName + "x" + sideDish.num;
            } else {
                temp = sideDish.dishName;
            }
            sideDishArrStr.push(temp);
        }
    }

    if(dishInfo.dishAttrData.length > 0){
        addDish.price = calculateTotalPriceByDishAttr(dishAttr.split('|'), dishInfo);
    }

    addDish.sideDishData = sideDishArr;
    sideDishArrStr.sort(sortFun);
    addDish.sideDishStr = sideDishArrStr.join('、');
    addDish.attrCombo = dishAttr;
    if (!dishAttr) {
        addDish.attrCombo = "";
        addDish.showName = dishInfo.dishName;
    } else {
        addDish.showName = dishInfo.dishName + '(' + dishAttr.split('|').join(' ') + ')';
    }

    addDish.groupType = getGroupTypeByArr(addDish.groupType);

    addDish.dishMd5 = $.md5(addDish.showName + addDish.sideDishStr);
    addDish.num = 1;
    if (!!addDish.totalPrice && addDish.totalPrice > 0) {
        addDish.price = addDish.totalPrice;
    } else {
        addDish.totalPrice = addDish.price;
    }
    addDish.sideDishPrice = sideDishPrice;
    addDish.totalPrice += sideDishPrice;
    //移除不需要的属性
    delete addDish.dishAttrData;
    delete addDish.dishAttrOptionPriceData;
    delete addDish.dishBigPic;
    delete addDish.dishInfo;
    delete addDish.dishNo;
    delete addDish.dishPic;

    //移除不需要的属性以供提交订单使用，其中dishMd5属性不能删除
    dishInfo = $.extend(true, {}, addDish);
    dishInfo.sideDishData = sideDishArr;
    delete dishInfo.groupIndex;

    if (isPlus) {
        addDish2List(dishInfo);
    } else {
        //addDish.num = -1;
        removeDishFromAddList(dishInfo);
    }

    return addDish;

}

//groupType的值有餐具:4,特色推荐:3, 餐位:2，主食:1，菜品:0
// 優先加菜到餐具:4,餐位:2，其次主食:1，再次菜單:0
/**
 * 根据菜品分类数组
 * @param groupTypeArr 分类数组
 * @returns {*}
 */
function getGroupTypeByArr(groupTypeArr) {

    if (groupTypeArr.length == 1) {
        return groupTypeArr[0];
    }
    var groupType = 0;
    for (var i = 1; i < groupTypeArr.length; i++) {
        groupType = Math.max(groupTypeArr[i - 1], groupTypeArr[i]);
    }
    return groupType;
}

function addDish2List(addDish) {
    var i = 0, isAdd = true;

    var addDishList = getAddList();
    for (; i < addDishList.length; i++) {
        if (addDishList[i].dishMd5 == addDish.dishMd5) {
            addDishList[i].num++;
            isAdd = false;
        }
    }
    if (isAdd) {
        addDishList.push($.extend(true, {}, addDish));
    }
    saveChosenDish2Local(addDishList);
}

function removeDishFromAddList(addDish) {
    var i = 0, temp = [];

    var addDishList = getAddList();
    for (; i < addDishList.length; i++) {
        if (addDishList[i].dishMd5 == addDish.dishMd5) {
            addDishList[i].num--;
        }
        if (addDishList[i].num > 0) {
            temp.push(addDishList[i]);
        }
    }
    addDishList = temp;
    saveChosenDish2Local(addDishList);
}

/**
 * 根据id查询已添加菜品的信息,仅用于不含有配菜以及规格属性的菜品
 * @param id
 */
function getAddDishInfoById(id){
    var dishList = getAddList(),addDishList=[];

    if($.isArray(dishList)){
        for(var i= 0, len = dishList.length; i < len; i++){
            if(id === dishList[i].dishId){
                addDishList.push(dishList[i]);
            }
        }
    }
    return addDishList;
}

function getAddDishInfoByMd5(md5Str){
    var dishList = getAddList();
    if($.isArray(dishList)){
        for(var i= 0, len = dishList.length; i < len; i++){
            if(md5Str === dishList[i].dishMd5){
                return dishList[i];
            }
        }
    }
}