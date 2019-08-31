var parentElem =$('.parentElement');

$('.arCb').on('change', function(){
    var vals= $(this).val();
    var flexNames= $(this).attr('name');
    parentElem.css(flexNames, vals);
});

$('.generate').on('click', function(){
    $('.generatePop').fadeIn();
});
$('.generatePop').not('.popContent').on('click', function(){
    $(this).fadeOut();
});
