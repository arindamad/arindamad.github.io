const firebaseConfig = {
  apiKey: "AIzaSyD6MIZXWCca8468vi84apW3dqRkIYVSzI8",
  authDomain: "arindamadgithub.firebaseapp.com",
  projectId: "arindamadgithub",
  storageBucket: "arindamadgithub.appspot.com",
  messagingSenderId: "615286653358",
  appId: "1:615286653358:web:90331b46df7e73fef5c83f",
  measurementId: "G-0KHP21EYH4"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// Reference messages collection
var messagesRef =  app.database().ref('messages');

// Listen for form submit
document.getElementById('myForm').addEventListener('submit', submitForm);







const ww = window.innerWidth;
const wh = window.innerHeight;
const scale = window.devicePixelRatio; 

const getOS =()=> {
    var userAgent = window.navigator.userAgent,
        platform = window.navigator?.userAgentData?.platform || window.navigator.platform,
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        iosPlatforms = ['iPhone', 'iPad', 'iPod'],
        os = null;
  
    if (macosPlatforms.indexOf(platform) !== -1) {
      os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
      os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
      os = 'Windows';
    } else if (/Android/.test(userAgent)) {
      os = 'Android';
    } else if (/Linux/.test(platform)) {
      os = 'Linux';
    }
  
    return os;
  }

// Submit form
function submitForm(e){
  e.preventDefault();

  // Get values
  let name = getInputVal('visitor_name');
  let email = getInputVal('visitor_email');
  let msg = getInputVal('visitor_msg');


  const date = new Date().toLocaleDateString('en-GB');
  const time = new Date().toLocaleTimeString('en-US', {hour12: false});
  // Save message
  saveMessage(name, email, msg, date, time, wh, ww, scale, getOS());

  // Show alert
  // document.querySelector('.alert').style.display = 'block';
  $('.alert').fadeIn();

  // Hide alert after 3 seconds
  setTimeout(function(){
    $('.alert').fadeOut();
    // document.querySelector('.alert').style.display = 'none';
  },3000);

  // Clear form
  document.getElementById('visitor_name').value="";
  document.getElementById('visitor_email').value="";
  document.getElementById('visitor_msg').value="";
}


  





// Function to get get form values
function getInputVal(id){
  return document.getElementById(id).value;
}


// Save message to firebase
function saveMessage(name, email, msg, date, time, ww, wh, scale, os){
  let newMessageRef = messagesRef.push();
  newMessageRef.set({
    name: name,
    email:email,
    msg:msg,
    time: time,
    date: date,
    deviceWidth : ww,
    deviceHeight: wh,
    scale: scale,
    Platform: os,
  });
}