/* 2022 ヘッダー変更 */
if(typeof 'undefined' === $j1111) var $j1111 = null;
if(typeof 'undefined' === jQuery) var jQuery = null;
var $jq2022 = $j1111 || jQuery || $;
(function($) {
  const breakPoint = 1024
  window.isSPHeader = window.innerWidth < breakPoint

  $(window).on('load resize orientationchange', function(){
    window.isSPHeader = window.innerWidth < breakPoint
  })

  $(document).ready(function(){
    init()
  })

  function init(){
    initProductSearch()
    setProductImages()
    setCartNum()
    setCurrentMark()
    setToggle()
    setDevLink()
    webviewNone()
    setMarginForBrowser()
  }

  function isDev(){
    return (document.domain === 'www2.starbucks.co.jp'
        || document.domain === 'st2.starbucks.co.jp'
        || document.domain === 'dev2.starbucks.co.jp'
        || document.domain === 'login2.starbucks.co.jp'
        || document.domain === 'member2.starbucks.co.jp'
        || document.domain === 'store2.starbucks.co.jp'
        || document.domain === 'product2.starbucks.co.jp'
        || document.domain === 'dyf2.starbucks.co.jp'
        || document.domain === 'card2.starbucks.co.jp'
        || document.domain === 'cart2.starbucks.co.jp'
        || document.domain === 'cart2.starbucks.co.jp'
        || document.domain === 'gift-test.starbucks.co.jp'
        || document.domain === 'dev.menu.starbucks.co.jp'
      )
  }

  function getWWWDomain(){
    return isDev()
      ? '//d3hjbu6zcoe45r.cloudfront.net'
      : '//d3vgbguy0yofad.cloudfront.net';
  }

  function getMenuDomain(){
    return isDev()
      ? '//dev.menu.starbucks.co.jp'
      : '//menu.starbucks.co.jp';
  }

  function initProductSearch(){
    //商品カテゴリーページではセレクトボックスの選択肢を最初から指定
    const presentUrl = window.location.href.split("/").filter(function(str) {
        return str !== "";
    });
    if(/^product/.test(presentUrl[1]) && presentUrl.length > 2) {
        const categoryName = presentUrl[2];
        if($('select[name=search-category] option[value=' + categoryName + ']').length > 0) {
            $('select[name=search-category]').val(categoryName);
        }
    }

    //フリーワード検索関数
    const searchKeyword = function() {
        const searchQuery = $("#search-keyword").val(), searchCategory = $('select[name=search-category]').val();
        let url = getMenuDomain() + "/search";

        if(searchQuery) {
            url += "?query=" + searchQuery;
            url += searchCategory === "all" ? "" : "&category_code=" + searchCategory;
        }
        else{
            url += searchCategory === "all" ? "" : "?category_code=" + searchCategory;
        }
        window.location.href = url;
    }

    //虫眼鏡マーク押下時にフリーワード検索実行
    $(".search-keyword-button-area").on("click", function() {
        searchKeyword();
    });
    $(".search-keyword-button-area").on('touchend', function(){
        searchKeyword();
    });

    //検索窓でエンターを押下したらフリーワード検索を実行する
    $("#search-keyword").keypress(function(e) {
        if(e.keyCode === 13) {
            searchKeyword();
        }
    });

    // 検索の商品カテゴリプルダウンを選択する
    if(location.host.match(/^(product|product2|dev|dev2)/)){
      $('.search-category option').each(function(){
        const category = $(this).val()
        const list_path_re = new RegExp('^\/'+category+'\/')
        if(location.pathname.match(list_path_re)){
          $(this).prop('selected', true)
        }
      });
    }
  }

  function webviewNone(){
    // webview
    if (navigator.userAgent.indexOf('starbucksjapan/') !== -1 ) {
      $('header').remove();
      $('footer').remove();
      $('.breadcrumb-wrap').remove();
    }
  }

  function setMarginForBrowser(){
    function setMargin(){
      if(window.innerWidth < breakPoint){
        $('.margin-for-browser').css('height', window.outerHeight - window.innerHeight - 40)
      }
      else{
        $('.margin-for-browser').css('height', 0)
      }
    }
    $(window).on('load resize orientationchange', function(){
      setMargin()
    })
    $(window).scroll(function(){
      setMargin()
    })
  }

  //OS枠の画像設定
  function setProductImages(){
    $.getJSON(getWWWDomain()+'/common/json/header/os_header_productList.json', (productJson) => {
        //ビバレッジ、フード、コーヒー豆の画像変更
        const navItem = $('.nav_img');
        if(productJson.product_category_image.beverage){
          navItem.eq(0).attr('src', productJson.product_category_image.beverage);
        }
        if(productJson.product_category_image.food){
          navItem.eq(1).attr('src', productJson.product_category_image.food);
        }
        if(productJson.product_category_image.beans){
          navItem.eq(2).attr('src', productJson.product_category_image.beans);
        }

        //OS商品の情報変更
        const osItemText = $('.tumbler_ttl'), osItemImage = $('.nav_store_img'), osItemLink = $('a.tumbler');
        for(let i = 0; i < 3; i++) {
          if(productJson.os_recommends[i]){
            osItemText.eq(i).text(productJson.os_recommends[i].product_name);
            osItemText.eq(i).append('<span class="en">' + productJson.os_recommends[i].price + '</span>');
            osItemImage.eq(i).attr('src', productJson.os_recommends[i].image);
            osItemLink.eq(i).attr('href', productJson.os_recommends[i].url);
          }
          else{
            $('header .tumbler_content').eq(i).html('')
          }
        }
    });
  }

  /*
   * 簡易版カートの数字変更機能
   */
  //ヘッダのカートの数字変更
  function setCartNum(){
    if(typeof setCartQtyPrice !== 'function'){
      window.setCartQtyPrice = function (num){
        var normalIcon = $(".js-normalIcon");    
        var zeroIcon = $(".js-zeroIcon");
        
        //switch
        if( !num || num === 0 || num === "0" )
        {
          normalIcon.addClass('none');
          zeroIcon.removeClass('none');
        }
        
        else
        {
          normalIcon.removeClass('none');
          zeroIcon.addClass('none');
        }
      
        //update
        $(".js-headercart-qty").text(num);
      }
    }

    function serCartCookieNum(){
      const env = isDev() ? 'staging' : 'production'
      let num_re = new RegExp( 'sbj_ols_cart_count_' + env + '=(\\d+)')
      let num = document.cookie.match(num_re)
      num = (num && num[1]) ? num[1] : 0
      setCartQtyPrice(num)
    }

    //定期cookieチェック
    //他のCartオブジェクトがない場合のみ発動
    if(window.CartInfo){
      if(typeof cart_check_interval_id !== 'undefined'){
        clearInterval(cart_check_interval_id) 
      }
    }
    else{
      let cart_check_interval_id = setInterval(function(){
        serCartCookieNum()
      }, 5000)

      serCartCookieNum()
    }
  }

  function setCurrentMark(){
    const CURRENT_LOCATION_LIST = {
      menu : [
        ['menu', '.*'],
        ['product', '.*'],
      ],
      store: [
        ['store', '.*'],
      ],
      cart: [
        ['cart', '.*', '^/mystore'], //mystore配下はmystarbucks扱い
      ],
      reward : [
        ['www', '^/rewards/'],
      ],
      mystarbucks : [
        ['www', '^/mystarbucks/'],
        ['cart', '^/mystore'],
      ],
      service : [
        ['card', '.*'],
        ['webapp', '.*'],
        ['dyf', '.*'],
        ['gift', '.*'],
        ['www', '^/mobile-app/'],
        ['www', '^/card/businessgift/'],
        ['www', '^/howto'],
        ['www', '^/history/'],
        ['www', '^/event/'],
        ['www', '^/coffee/recipe/'],
        ['www', '^/seminar/'],
        ['www', '^/coffee/meet_your_coffee/'],
      ],
    }

    // URLに応じてアイコンを緑にする
    for(let icon in CURRENT_LOCATION_LIST){
      let finish = false

      for(let list of CURRENT_LOCATION_LIST[icon]){
        const list_host_str = list[0] === 'www' ? '(www|www2|st|st2|dev|dev2)' : list[0]
        const list_host_re = new RegExp(list_host_str)
        const list_path_re = new RegExp(list[1])
        const list_path_re_exception = list[2] ? new RegExp(list[2]) : null
        if(location.host.match(list_host_re) && location.pathname.match(list_path_re)){
          // 例外はスキップ
          if(list_path_re_exception && location.pathname.match(list_path_re_exception)){
            continue
          }

          $('[data-current-location='+icon+']').addClass('current')
          finish = true
          break
        }
      };

      if(finish) break
    }
  }

  function toggleArea(clicked_area){

    // アカウントはSPのみ
    if(!isSPHeader && clicked_area === 'mystarbucks'){
      return
    }

    const slide_area_class = isSPHeader ? '.slideAreaSP' : '.slideArea';
    const $slide_area = $(slide_area_class);
    const $bg = $('.globalNav__bg');

    // activeエリア
    const current_active_area = window.current_active_area;
    const $current_active_area = $('[data-area='+current_active_area+']');
    const next_active_area = current_active_area === clicked_area ? null : clicked_area;
    const $next_active_area = $('[data-area='+next_active_area+']');
    window.current_active_area = next_active_area;

    // 背景
    if(next_active_area){
      $bg.addClass('active');
      $('html').addClass('is-locked')
    }
    else{
      $bg.removeClass('active');
      $('html').removeClass('is-locked')
    }

    // 開いているエリアを閉じる
    if(isSPHeader){
      if(['menu', 'service', 'mystarbucks'].indexOf(clicked_area) !== -1){
        // 何も閉じない
      }
      else{
        $('.slideAreaSP.slideHorizontalSP').removeClass('active');
        $('.slideAreaSP').not('.slideHorizontalSP').slideUp();
        setTimeout(function(){
          if(next_active_area){
            // 現在表示中のサブナビのみ非表示
            $current_active_area.addClass('slideHidden');
          }
          else{
            // 全サブナビ非表示
            $('.slideAreaSP.slideHorizontalSP').addClass('slideHidden');
          }
          
        }, 600)
      }
    }
    else{
      $('.slideArea').slideUp();
    }

    // 指定のエリアを開く
    $next_active_area.removeClass('slideHidden');
    setTimeout(function(){
      $next_active_area.addClass('active');
    }, 10)
    if(isSPHeader && $next_active_area.hasClass('slideHorizontal')){
      // CSSでスライド
    }
    else{
      $next_active_area.slideDown();
    }

    // アイコン/SPヘッダー
    $('.toggleButton').removeClass('active');
    $('.globalNav__sp__wrapper').css('position', 'relative');
    if(isSPHeader && ['global_nav', 'menu', 'service', 'mystarbucks'].indexOf(next_active_area) !== -1){
      $('.hamburger').addClass('active');
      $('.globalNav__sp__wrapper').css('position', 'fixed');
    }
    else if(next_active_area){
      $('[data-toggle-button='+next_active_area+']').addClass('active');
    }
  }

  function setToggle(){
    $('.toggleButton').on('click', function(){
      let clicked_area = $(this).data('toggle-button');

      if($(this).hasClass('hamburger')){
        const is_active_hamburger = $('.hamburger').hasClass('active');
        clicked_area = is_active_hamburger ? null : 'global_nav';
      }

      toggleArea(clicked_area);
    });

    $('.globalNav__bg').on('click', function(){
      toggleArea(null);
    });

    // searchBox delete
    $('.search-keyword-delete').on('click', function() {
      $('.search-keyword').val('');
    });

    // service
    $('.subnav_open').hover(function() {
      //カーソルが重なった時
      $(this).children('.subnav').addClass('open');
      }, function() {
      //カーソルが離れた時
      $(this).children('.subnav').removeClass('open'); 
    });

    $('.js-hover-mystarbucks, .subnav-mystarbucks').hover(function() {
      //カーソルが重なった時
      $('[data-area=mystarbucks]').children('.subnav').addClass('open');
      $('.js-hover-mystarbucks').addClass('active');
    }, function() {
      //カーソルが離れた時
      $('[data-area=mystarbucks]').children('.subnav').removeClass('open'); 
      $('.js-hover-mystarbucks').removeClass('active');
    });

    $(".subnav_open").click(function () {
      $(this).toggleClass('active');
      $(this).children('.subnav').slideToggle();
    });

    // footer accordion
    $('.footerNav__head').on('click',function(){
      // sp
      if (window.isSPHeader) {
        $(this).next('.footerNav__list').slideToggle();
        $(this).toggleClass('open');
      }
    });

    // リサイズ時にSP/PCが切り替わる場合
    $(window).on('resize orientationchange', function(){
      const _isSPHeader = $(window).width() < breakPoint
      if(isSPHeader && !_isSPHeader ||
         !isSPHeader && _isSPHeader ){
          // サブナビを閉じる
          toggleArea(null)
          $('.slideAreaSP.slideHorizontalSP').addClass('slideHidden')
          $('.slideArea').slideUp()

          if(_isSPHeader){
            $('.footerNav__head').removeClass('open')
            $('.footerNav__list').hide()
          }
          else{
            $('.footerNav__head').addClass('open')
            $('.footerNav__list').show()
          }
      }

      // フラグ変更
      isSPHeader = _isSPHeader
    })
  }

  /*
  * リンクのドメイン変更（検証系）
  */
  function setDevLink(){
    let location_subdomain = location.host.match(/([\w\.\-]+)\.starbucks/)
    location_subdomain = location_subdomain[1]

    if(!isDev() && location_subdomain !== 'dev'){
      return
    }

    $('header.globalNav a, footer.footerWrap a').each(function(){
      const href = $(this).attr('href')
      if(!href){
        return true
      }

      let new_subdomain = null
      let current_subdomain = href.match(/(\w+)\.starbucks/)
      if(!current_subdomain || current_subdomain.length < 1){
        return true
      }
      current_subdomain = current_subdomain[1]

      if(location_subdomain === 'dev'){
        switch(current_subdomain){
          case 'www':
          case 'product':
            new_subdomain = 'dev'
            break
          case 'cart':
            new_subdomain = 'cart2'
            break
          case 'store':
            $(this).attr('href', '/store/search/')
            return
        }
      }
      else{
        switch(current_subdomain){
          case 'www':
            new_subdomain = 'www2'
            if(location_subdomain === 'st2'){
              new_subdomain = 'st2'
            }
            else if(location_subdomain === 'dev2'){
              new_subdomain = 'dev2'
            }
            break
          case 'store':
            new_subdomain = 'store2'
            break
          case 'product':
            new_subdomain = 'product2'
            break
          case 'dyf':
            new_subdomain = 'dyf2'
            break
          case 'cart':
            new_subdomain = 'cart2'
            break
          case 'card':
            new_subdomain = 'card2'
            break
          case 'gift':
            new_subdomain = 'gift-test'
            break
        }
      }

      if(new_subdomain){
        let new_href = href.replace(current_subdomain, new_subdomain)
        $(this).attr('href', new_href)
      }
    })
  }
})($jq2022);

