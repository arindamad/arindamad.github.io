const firebaseConfig = {
  apiKey: "AIzaSyBx4ZpSgLcuG0-i9tWLUK1asYodPHzfJG8",
  authDomain: "myproject-db80c.firebaseapp.com",
  databaseURL: "https://myproject-db80c.firebaseio.com",
  projectId: "myproject-db80c",
  storageBucket: "myproject-db80c.appspot.com",
  messagingSenderId: "654486030185",
  appId: "1:654486030185:web:b8eb1882452ea380"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
// Reference messages collection
// var messagesRef = firebase.database().ref('messages');

// console.log(firebase);

// Reference messages collection
var messagesRef = firebase.database().ref('messages');

// Listen for form submit
document.getElementById('myForm').addEventListener('submit', submitForm);

// Submit form
function submitForm(e){
  e.preventDefault();

  // Get values
  var name = getInputVal('visitor_name');
  var email = getInputVal('visitor_email');
  var msg = getInputVal('visitor_msg');

  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  
  today = dd + '/' +  mm + '/' + yyyy;


  // Save message
  saveMessage(name, email, msg, today);

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
function saveMessage(name, email, msg, timestamp){
  var newMessageRef = messagesRef.push();
  newMessageRef.set({
    name: name,
    email:email,
    msg:msg,
    timestamp: timestamp,
  });
}