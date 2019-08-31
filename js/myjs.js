// $(document).ready(function(e) {    
//     $('#submitMsg').click(function() {       
//         var sEmail = $('#visitor_email').val();
//         var name = $('#visitor_name').val();
//         var msg = $('#visitor_msg').val();
//         if(msg.length>=5){
//           $('#visitor_msg').css("border-color", "#ccc");
//         } else{
//           $('#visitor_msg').css("border-color", "#ff3b49");
//         }        
//         if (name.length<3){
//           $('#visitor_name').css("border-color", "#ff3b49");
//         } else{
//           $('#visitor_name').css("border-color", "#ccc");
//         }
//         if ($.trim(sEmail).length == 0) {
//             $('#visitor_email').css("border-color", "#ff3b49");
//             //alert('Please enter valid email address'); 
//             //e.preventDefault();
//         }
//         if (validateEmail(sEmail)) {
//             $('#visitor_email').css("border-color", "#ccc");
//             //alert('Email is valid');
//         }
//         else {
//             //alert('Invalid Email Address');
//             $('#visitor_email').css("border-color", "#ff3b49");
//             //e.preventDefault();
//         }
//     });
     
// });

// function validateEmail(sEmail) {
//     var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
//     if (filter.test(sEmail)) {
//         return true;
//     }
//     else {
//         return false;
//     }
// }

$('.eachBody').height($('.eachBody').width());

$(document).ready(function(){ 
  function loadSvg(){ 
  var val = "";
  $(".eachBody").each(function(index){
   
    val = parseInt($(this).attr('data-pct'));
   
    var $circle = $('svg').eq(index).find('circle').eq(1);
   
     var r = $circle.attr('r'); 
    var c = Math.PI*(r*2);
    console.log(c);
    $('.lastCircle').eq(index).attr('stroke-dasharray', c);
    console.log($circle);
    if (val < 0) { val = 0;}
    if (val > 100) { val = 100;}
    
    var pct = ((100-val)/100)*c; 
    
    $circle.css({ strokeDashoffset: pct});
  });  
   }
  setTimeout(loadSvg(), 10000);
});
  


$(document).ready(function(){
  // Add smooth scrolling to all links
  $("a").on('click', function(event) {

    // Make sure this.hash has a value before overriding default behavior
    if (this.hash !== "") {
      // Prevent default anchor click behavior
      event.preventDefault();

      // Store hash
      var hash = this.hash;

      // Using jQuery's animate() method to add smooth page scroll
      // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
      $('html, body').animate({
        scrollTop: $(hash).offset().top - $('header').height()
      }, 800, function(){
   
        // Add hash (#) to URL when done scrolling (default click behavior)
        // window.location.hash = hash;
      });
    } // End if
  });
});