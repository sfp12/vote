$(function(){

  // tab switch start
  $('.item').on('click', function () {
      $(this).addClass('active').siblings('.active').removeClass('active');
      var index = $(this).index();
      $('.content')
        .removeClass('add-voter')
        .removeClass('add-candidate')
        .removeClass('ranking')
        .removeClass('import-user')
        ;
      if(index === 0){
        $('.content').addClass('add-voter');
      }else if(index === 1){
        $('.content').addClass('add-candidate');
      }else if(index === 2){
        $('.content').addClass('ranking');
      }else if(index === 3){
        $('.content').addClass('import-user');
      }
  });

  // tab switch end

  // add voter start

  function clearAddVoter(){

    $('#voter_name').val('');
    $('#voter_start_time').val('');
    $('#voter_end_time').val('');
    $('#voter_desc').val('');

  }

  $('#voter_submit').on('click', function(e){

    // 判断
    var v_n = $('#voter_name').val();
    var v_s_t = $('#voter_start_time').val();
    var v_e_t = $('#voter_end_time').val();
    var v_d = $('#voter_desc').val();

    if(v_n === ''){
      layer.msg('投票名称为空');
      return;
    }

    if(v_s_t === ''){
      layer.msg('投票开始时间为空');
      return;
    }

    if(v_e_t === ''){
      layer.msg('投票结束时间为空');
      return;
    }

    if(v_s_t > v_e_t){
      layer.msg('开始时间早于结束时间');
      return;
    }

    if(v_d === ''){
      layer.msg('投票简介为空');
      return;
    }

    $.post('/admin/addVoter', {
      v_n: v_n,
      v_s_t: v_s_t,
      v_e_t: v_e_t,
      v_d: v_d
    })
    .done(function(data){
      layer.msg(data.msg);
      if(data.code === 0){
        getVoter();
        $('#add-voter-modal').modal('hide');
      }else{
        
      }
    })
    .fail(function(){
      layer.msg('添加失败');
    })

  });

  $('#voter_start_wrap').datetimepicker({
    format: 'YYYY.MM.DD',
    locale: 'zh-cn'
  });

  $('#voter_end_wrap').datetimepicker({
    format: 'YYYY.MM.DD',
    locale: 'zh-cn'
  });

  $('#add-voter-btn').on('click', function(e){
    clearAddVoter();
    $('#add-voter-modal').modal('show');
  })

  function getVoter(){

    $.get('/admin/getVoter')
    .done(function(data){
      if(data.code === 0){
        var data = data.result;
        var a = [];
        for(var i=0; i<data.length; i++){
          var item = data[i];
          var str = '<tr>';
          str += '<td>'+item.voter_name+'</td>';
          str += '<td>'+item.voter_start_time+'</td>';
          str += '<td>'+item.voter_end_time+'</td>';
          str += '<td><p>'+item.voter_desc+'</p></td>';
          str += '<td data-id="'+item.id+'">';

          // 创建投票
          str += '<div class="voter-op">'
          if(item.voter_status === 1){
            str += '<span>使用中</span>';
            str += '<button type="button" class="btn switch-status btn-warning">停用</button>'
          }else{
            str += '<span>停用中</span>';
            str += '<button type="button" class="btn switch-status btn-success">启用</button>'
            
          }
          str += '<input type="text" value="?voter_id='+item.id+'&user_id=">';
          str += '</div>'

          // 添加候选人
          str += '<div class="candidate-op">'
          str += '<button type="button" class="btn add-candidate-btn btn-primary">添加候选人</button>'
          str += '<button type="button" class="btn get-candidate-btn btn-primary">查看候选人</button>'
          str += '</div>'

          // 查看统计结果
          str += '<div class="ranking-op">'
          str += '<button type="button" class="btn get-ranking-btn btn-primary">统计结果</button>'
          str += '</div>'

          // 查看统计结果
          str += '<div class="user-op">'
          str += '<button type="button" class="btn import-user-btn btn-primary">导入</button>'
          str += '<button type="button" class="btn get-user-btn btn-primary">查看</button>'
          str += '</div>'


          str += '</td>';
          str += '</tr>';
          a.push(str);
        }
        $('#voter-table tbody').html('');
        $('#voter-table tbody').html(a.join(''));

        importUserInit();
        rankingInit();
        addCandidateInit();
        addVoterInit();
      }else{
        layer.msg(data.msg);
      }
    })
    .fail(function(){
      layer.msg('查询所有投票失败');
    })

  }

  getVoter();

  function addVoterInit(){

    $('.switch-status').on('click', function(){
      var id = $(this).parents('td').data('id');
      var status = 0;
      var fail_tip = '停用失败';
      var success_tip = '停用成功';
      if($(this).prev().text() === '停用中'){
        status = 1;
        fail_tip = '启用失败';
        success_tip = '启用成功';
      }
      var that = this;

      $.get('/admin/switchStatus?id='+id+'&status='+status)
      .done(function(data){
        if(data.code === 0){
          layer.msg(success_tip);

          if(status === 0){
            $(that).prev().text('停用中');
            $(that).text('启用');
            $(that).removeClass('btn-warning').addClass('btn-success');
          }else{
            $(that).prev().text('启用中');
            $(that).text('停用');
            $(that).removeClass('btn-success').addClass('btn-warning');
          }

        }else{
          layer.msg(fail_tip);
        }
      })
      .fail(function(data){
        layer.msg(fail_tip);
      })
    })

  }  

  // add voter end

  // add candidate start

  function addCandidateInit(){

    $('.add-candidate-btn').on('click', function(e){
      clearAddCandidate();
      var id = $(this).parents('td').data('id');
      $('#add-submit').data('id', id);

      $('#add-candidate-modal').modal('show');
    })

    $('.get-candidate-btn').on('click', function(e){

      var id = $(this).parents('td').data('id');
      $.get('/admin/getCandidate?v_id='+id)
      .done(function(data){
        if(data.code === 0){

          var data = data.result;
          var a = [];
          for(var i=0; i<data.length; i++){
            var item = data[i];
            var str = '<tr>';
            str += '<td>'+item.candidate_name+'</td>'
            str += '<td><img src="../images/'+id+'/'+item.candidate_image+'"></td>'
            str += '<td><p>'+item.candidate_desc+'</p></td>'
            str += '</tr>';
            a.push(str);
          }
          $('#get-candidate-modal tbody').html('');
          $('#get-candidate-modal tbody').html(a.join(''));
          $('#get-candidate-modal').modal('show');
        }else{
          layer.msg(data.msg);
        }
      })
      .fail(function(err){
        layer.msg('查找失败');
      })      
    })

  } 

  function clearAddCandidate(){

    $('#candidate_name').val('');
    $('#candidate_desc').val('');

  }

  $('#add-submit').on('click', function(e){

    var c_name = $('#candidate_name').val();
    var c_desc = $('#candidate_desc').val();
    // var c_pic = $('#candidate_pic').val();

    if(c_name === ''){
      layer.msg('候选人姓名为空');
      return;
    }

    // if(c_pic === ''){
    //   layer.msg('候选人照片为空');
    //   return;
    // }

    if(c_desc === ''){
      layer.msg('候选人简介为空');
      return;
    }

    $.post('/admin/addCandidate', {
      candidate_name: c_name,
      candidate_desc: c_desc,
      v_id: $('#add-submit').data('id')
    })
    .done(function(data){
      layer.msg(data.msg);
      if(data.code === 0){
        $('#add-candidate-modal').modal('hide');
      }
    })
    .fail(function(err){
      layer.msg('添加候选人失败');
    })

    // 有照片的版本
    // $.ajaxFileUpload({
    //     url: '/admin/addCandidate',
    //     type: 'post',
    //     secureuri: false,
    //     fileElementId: 'candidate_pic',
    //     data: { 
    //       candidate_name: c_name,
    //       candidate_desc: c_desc,
    //       v_id: $('#add-submit').data('id')
    //     },
    //     dataType: 'json',
    //     success: function(data, status){
    //       layer.msg(data.msg);
    //       if(data.code === 0){
    //         $('#add-candidate-modal').modal('hide');
    //       }
    //     },
    //     error: function(data, status, e){
    //       layer.msg('添加失败');
    //     }
    // });

  })  

  // add candidate end

  // ranking start

  function rankingInit(){

    $('.get-ranking-btn').on('click', function(e){

      var id = $(this).parents('td').data('id');
      $.get('/admin/getRanking?v_id='+id)
      .done(function(data){
        if(data.code === 0){

          var data = data.result;
          var a = [];
          for(var i=0; i<data.length; i++){
            var item = data[i];
            var str = '<tr>';
            str += '<td>'+item.candidate_name+'</td>'
            str += '<td>'+item["count(voted.candidate_id)"]+'</td>'
            str += '</tr>';
            a.push(str);
          }
          $('#get-user-modal tbody').html('');
          $('#get-user-modal tbody').html(a.join(''));
          $('#get-user-modal').modal('show');
        }else{
          layer.msg(data.msg);
        }
      })
      .fail(function(err){
        layer.msg('查找失败');
      })      
    })

  }  

  // ranking end

  // upload user start

  function importUserInit(){

    $('.import-user-btn').on('click', function(e){

      var id = $(this).parents('td').data('id');
      $('#user-submit').data('id', id);

      $('#import-user-modal').modal('show');
    })

    $('.get-user-btn').on('click', function(e){

      var id = $(this).parents('td').data('id');
      $.get('/admin/getUser?v_id='+id)
      .done(function(data){
        if(data.code === 0){

          var data = data.result;
          var a = [];
          for(var i=0; i<data.length; i++){
            var item = data[i];
            var str = '<tr>';
            str += '<td>'+item.username+'</td>'
            str += '<td>'+item.count+'</td>'
            str += '</tr>';
            a.push(str);
          }
          $('#get-user-modal tbody').html('');
          $('#get-user-modal tbody').html(a.join(''));
          $('#get-user-modal').modal('show');
        }else{
          layer.msg(data.msg);
        }
      })
      .fail(function(err){
        layer.msg('查找投票者失败');
      })      
    })

  }  

  $('#user-submit').on('click', function(e){

    var file = $('#file').val();

    if(file === ''){
      layer.msg('投票者表格为空');
      return;
    }

    $.ajaxFileUpload({
        url: '/admin/uploadUser',
        type: 'post',
        secureuri: false,
        fileElementId: 'file',
        data: { 
          v_id: $('#user-submit').data('id')
        },
        dataType: 'json',
        success: function(data, status){
          if(data.code === 0){
            $('#import-user-modal').modal('hide');
          }else{
            layer.msg(data.msg);
          }          
        },
        error: function(data, status, e){
          layer.msg('导入失败');
        }
    });

  })

  // upload user end

});