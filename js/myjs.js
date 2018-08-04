$(document).ready(function(e) {    
    $('#submitMsg').click(function() {       
        var sEmail = $('#visitor_email').val();
        var name = $('#visitor_name').val();
        var msg = $('#visitor_msg').val();
        if(msg.length>=5){
          $('#visitor_msg').css("border-color", "#ccc");
        } else{
          $('#visitor_msg').css("border-color", "#ff3b49");
        }        
        if (name.length<3){
          $('#visitor_name').css("border-color", "#ff3b49");
        } else{
          $('#visitor_name').css("border-color", "#ccc");
        }
        if ($.trim(sEmail).length == 0) {
            $('#visitor_email').css("border-color", "#ff3b49");
            //alert('Please enter valid email address'); 
            //e.preventDefault();
        }
        if (validateEmail(sEmail)) {
            $('#visitor_email').css("border-color", "#ccc");
            //alert('Email is valid');
        }
        else {
            //alert('Invalid Email Address');
            $('#visitor_email').css("border-color", "#ff3b49");
            //e.preventDefault();
        }
    });
     
});

function validateEmail(sEmail) {
    var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    if (filter.test(sEmail)) {
        return true;
    }
    else {
        return false;
    }
}