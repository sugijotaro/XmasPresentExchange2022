
//UAで判別
var isMobile = (function(){
  var ua = window.navigator.userAgent.toLowerCase();
  if(ua.indexOf('ipad') != -1) return true;
  if(ua.indexOf('iphone') != -1) return true;
  if(ua.indexOf('android') != -1) return true;
})();

//レスポンシブ用
var isWideScreen = function() {
	var _breakPoint = "(max-width: 768px)";
	if(window["matchMedia"]){
		if (window.matchMedia( _breakPoint ).matches) {return false;}
	}
	return true;
};

$(function(){
  //ページ内リンク
  $('.ContentsBox a[href^="#"]').click(function(){
    var target= $(this).attr("href");
    // scrollTo($(target).offset().top - 50);
    scrollTo($(target).offset().top);
    return false;
  });
  function scrollTo(_n){
    $('html,body').animate({
      scrollTop:_n
    },{ duration: 400 });
  }
  initModalMovie()
  initModalNote()
});




function initModalMovie(){
  var tag = "";
    tag += '<div class="area-modal-movie">';
    tag += '  <div class="_modal-bg js-modal-close"></div>';
    tag += '  <div class="_modal-box">';
    tag += '    <div class="_modal-btn-close js-modal-close"></div>';
    tag += '    <div class="_modal-body js-place"></div>';
    tag += '  </div>';
    tag += '</div>';
  var modal = $(tag);
  var box = modal.find("._modal-box");
  var place = modal.find(".js-place");
  $("body").append(modal);

    var tID;
  if(tID) clearTimeout(tID);
  function openModal(){
    modal.addClass("js-show")
    tID = setTimeout(function(){
      openModal_core()
    },400);
  }
  function openModal_core(){
    var movieId = "ph6Jo__KReE"
    var tag = '<iframe width="560" height="315" src="https://www.youtube.com/embed/{ID}?autoplay=1&playsinline=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
    place.html(tag.split("{ID}").join(movieId))
  }
  function closeModal(){
    place.empty()
    modal.removeClass("js-show")
  }
  $('.js-modal-opener').click(function(event){
    openModal()
  });
  modal.find('.js-modal-close').click(function(event){
    closeModal();
  });
}


function initModalNote(){
  var modal = $('.js-modal-note');
  var tID;
  if(tID) clearTimeout(tID);
  function openModal(_id){
    modal.addClass("js-show")
  }
  function closeModal(){
    modal.removeClass("js-show")
  }
  $('.js-modal-note-opener').click(function(event){
    openModal()
  });
  modal.find('.js-modal-close').click(function(event){
    closeModal();
  });
}



//DEV
if(window.location.href.indexOf("/192.168.1.23") != -1){
  window.__dev__ = {
    css : ["index.css"],
    html : true,
    element : []
  }
  //for iframe
  if(window.parent != window){
    window.__dev__.html = false;
   //window.__dev__.reload = false;
    window.__dev__.meta = false;
    window.__dev__.element = [];
    window.__dev__.grid = false;
  }
  var u = "http://192.168.1.23:1000/lib/dev/import.js";
  var s = document.createElement('script');
    s.setAttribute('src',u);
  document.getElementsByTagName('head')[0].appendChild(s);
}




