var name = ".sphinxsidebar";
var menuYloc = null;


  $(function() {
    var $t = $('table.docutils')
    $t.addClass('table');
    $t.removeClass('docutils');

    menuYloc = parseInt($(name).css("top").substring(0,$(name).css("top").indexOf("px")))
    $(window).scroll(function () {
        var offset = menuYloc+$(document).scrollTop()+"px";
        $(name).animate({top:offset},{duration:500,queue:false});
    });
  });
