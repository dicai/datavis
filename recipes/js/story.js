var max = 6;
function next(i) {
  var current_div = document.getElementById("text"+i);
  var next_div = document.getElementById("text"+((i+1)%max));
  current_div.style.display = "none";
  next_div.style.display = "block";
  }

