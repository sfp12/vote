$(function(){
  
  var a = $('<a>', {href:location.href});
  var user_id = '';
  var voter_id = '';
  
  var search = a.prop('search').replace('?', '').split('&');
  $.each(search, function(index, item){
    var i = item.split('=');
    if(i[0] === 'voter_id'){
      voter_id = i[1];
    }
    if(i[0] === 'user_id'){
      user_id = i[1];
    }
  })

  function toastShow(id, content){
    var $toast_10 = $(id);
    $toast_10.find('.weui-toast__content').text(content);
    if ($toast_10.css('display') != 'none') return;
    $toast_10.fadeIn(100);
    setTimeout(function () {
        $toast_10.fadeOut(100);
    }, 2000);
  }

  // vote
  $('#voter').on('click', function(e){

    var that = this;

    $.post('/vote', {
      candidates: JSON.stringify(voted)
    })
    .done(function(data){
      toastShow('#toast-10', data.msg);
    })
    .fail(function(){
      toastShow('#toast-10', '投票失败');
    })

  })

  var count = 0;
  var voted = [];

  // checkbox
  $('.weui-check__label').on('touchstart', function(e){


    if(count === 10){
      if(!$(this).hasClass('checked')){

        var $toast_10 = $('#toast-10');
        $toast_10.find('.weui-toast__content').text('最多投10人');
        if ($toast_10.css('display') != 'none') return;
        $toast_10.fadeIn(100);
        setTimeout(function () {
            $toast_10.fadeOut(100);
        }, 2000);

        return;
      }      
    }

    $(this).toggleClass('checked');
    var id = $(this).data('id');
    if($(this).hasClass('checked')){
      voted.push(id);
    }else{
      var index = voted.indexOf(id);
      voted.splice(index, 1);
    }
    count = $('.checked.weui-check__label').length;

  })




})























