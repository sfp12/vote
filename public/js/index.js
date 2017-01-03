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
    
  }

  var voted = [];
  // vote
  $('#voter').on('click', function(e){

    var that = this;

    if($('#is_user').val() === 'false'){

      var $toast_10 = $('#toast-10');
      $toast_10.find('.weui-toast__content').text('学工号错误');
      if ($toast_10.css('display') != 'none') return;
      $toast_10.fadeIn(100);
      setTimeout(function () {
          $toast_10.fadeOut(100);
      }, 2000);

      return;

    }

    $("input:checked").each(function(){
      $t = $(this);
      $id = $t.attr("data-id");
      voted.push($id);
    });

    if(voted.length === 0){

      var $toast_10 = $('#toast-10');
      $toast_10.find('.weui-toast__content').text('请选择优秀教师');
      if ($toast_10.css('display') != 'none') return;
      $toast_10.fadeIn(100);
      setTimeout(function () {
          $toast_10.fadeOut(100);
      }, 2000);

      return;
    }

    var $toast_10 = $('#toast-10');
    $toast_10.find('.weui-toast__content').text('正在投票');
    if ($toast_10.css('display') != 'none') return;
    $toast_10.fadeIn(100);

    $.post('/vote', {
      candidates: JSON.stringify(voted)
    }, function(data){
      $toast_10.find('.weui-toast__content').text(data.msg);
      if(data.code === 0){
        var _a = [];
        $.each(data.result, function(index, item){
          var str = '<label class="weui-cell">';
          str += '<div class="weui-cell__hd">';
          str += '<p class="name">'+item.candidate_name+'</p>';
          str += '</div>';
          str += '<div class="weui-cell__bd">';
          str += '<p class="count">'+item["count(voted.candidate_id)"]+'票</p>';
          str += '</div>';
          str += '</label>';
          _a.push(str);
        });
        $('.weui-cells').html(''); 
        $('.weui-cells').html(_a.join('')); 
        $('.weui-cells').addClass('voted');
      }
      setTimeout(function () {
          $toast_10.fadeOut(100);
      }, 1000);
    })

  })

  var count = 0;  

  // checkbox
   $('.weui-check').on('click', function(e){

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
    count = $('input:checked').length;

    if(count === 10){
      $('input').each(function(){
        if(!$(this).prop('checked')){
          $(this).attr('disabled', true);
        }
      })
    }else{
      $('input').each(function(){
        $(this).removeAttr('disabled');
      })
    }

  })


})























