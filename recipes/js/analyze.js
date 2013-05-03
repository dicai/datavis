"use strict";

var cuisine_data = {};
// proportion of recipes to keep for the out cuisines
var KEEP_PROP = 0.4;
// proportion of recipes to keep for the main cuisine
var KEEP_MAIN = 0.5;
// don't display more than this number 
var MAX_KEEP = 100;
var MIN_KEEP = 30;
var MIN_ING = 4;

// what level of match do we want
var MIN_SIMILARITY = .3;
var MAX_SIMILARITY = 1;

var visW = 700;
var visH = 600;
function load_data(cuisine) {
  d3.json("../data/"+cuisine+".json", function(error, json) {
    if(error) return console.warn(error);
    cuisine_data[cuisine] = {};
    cuisine_data[cuisine]["data"] = json;
    get_all_ingredients(json, cuisine);
    done_cuisines++;
    if(done_cuisines == total_cuisines) {
      all_files_loaded();
    }
  });
}

function delete_common(lst) {
  var common_to_delete = ["water", "salt", "pepper"];
  var common_to_keep = ["sugar", "garlic", "onion", "chicken", "beef", "egg", "ginger", "carrot", "mushroom", "cabbage", "pineapple", "pork", "shrimp", "soy sauce", "bean sprout", "tomato", "tofu"];
  var new_lst = [];
  for(var i = 0; i < lst.length; i++) {
    var elt = lst[i];
    var keep = true;
    for(var j = 0; j < common_to_delete.length; j++) {
      if(elt.indexOf(common_to_delete[j]) !== -1) {
        keep = false;
      }
    }
    if(keep) {
      for(var j = 0; j < common_to_keep.length; j++) {
        if(elt.indexOf(common_to_keep[j]) !== -1) {
          elt = common_to_keep[j];
        }
        if(elt.indexOf("oil") !== -1)
        {
          elt = elt.substring(0,elt.indexOf("oil") + 3);
        }
        if(elt.indexOf("rice") !== -1 && elt.indexOf("rice vinegar" == -1)) {
          elt = "rice";
        }
      }
      new_lst.push(elt);
    }
  }
  return new_lst;
}

function get_all_ingredients(data, cuisine) {
  var all_ing = []
  data.forEach(function(elt){
    var ings = elt["ings"];
    var ing_lst = ings.split(";");
    ing_lst = delete_common(ing_lst);
    elt["ing_lst"] = ing_lst;
    for(var i = 0;  i < ing_lst.length; i++) {
      var cur = ing_lst[i];
      if(all_ing.indexOf(cur) < 0){
        all_ing.push(cur);
      }
    }
  });
  cuisine_data[cuisine]["all_ing"] = all_ing;
  //console.log(cuisine, all_ing.length);
}

function sortObject(obj) {
  var arr = [];
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) 
    {
      arr.push(obj[prop]);
    }
  }
  arr.sort(function(a,b) {return a.value - b.value; });
  return arr;
}

function populate_cuisine_choice() {
  var dropdown = document.getElementById("cuisine");
  for(var cuisine in cuisine_data) {
    var elt = document.createElement("option");
    elt.textContent = cuisine;
    elt.value = cuisine;
    dropdown.appendChild(elt);
  }
}

function check_change(e) {
// e.target --> is  the chekcbox
  var uncheckall = document.getElementById("uncheckall");
  uncheckall.checked = false;
  var checkall = document.getElementById("checkall");
  checkall.checked = false;

  if(currentCodeFlower) {
      load_viz(true);
  }
}

function check_all(e) {
  console.log(e, e.checked);
  if(e.checked) {
    var uncheckall = document.getElementById("uncheckall");
    uncheckall.checked = false;
    var checkboxes = $(".check");
    for(var i =0; i < checkboxes.length; i++)
    {
      checkboxes[i].checked=true;
    }
  }
  if(currentCodeFlower) {
      load_viz(true);
      console.log("I cry to the heavens, they do not answer");
  }
}

function uncheck_all(e) {
  console.log(e, e.checked);
  if(e.checked) {
    var checkboxes = $(".check");
    var checkall = document.getElementById("checkall");
    checkall.checked = false;
    for(var i =0; i < checkboxes.length; i++)
    {
      checkboxes[i].checked=false;
    }
  }
  if(currentCodeFlower) {
      load_viz(true);
  }
}

function populate_check_boxes() {
  var checkboxes = document.getElementById("check_one");
  for(var cuisine in cuisine_data) {
    var elt = document.createElement("div");
    elt.innerHTML = '<input type = \"checkbox\" class=\"check\" name=\"' + cuisine + '\" checked onchange=\"check_change(this)\" id=\"' + cuisine + '\">' + cuisine +" ";
    var swatch = document.createElement("span");
    swatch.className = "swatch";
    swatch.style.backgroundColor = color(cuisine);
    elt.className = "check_cuisine"
    elt.appendChild(swatch);
    checkboxes.appendChild(elt);
  }
}

function all_files_loaded(){
  populate_cuisine_choice();
  populate_check_boxes();

  var dropdown = document.getElementById("cuisine");
  dropdown.selectedIndex = 1;
  load_recipes();
  var dropdown2 = document.getElementById("recipe");
  dropdown2.selectedIndex = 7;
  load_viz(false);
};


function randomize() {
  var dropdown = document.getElementById("cuisine");
  var index = Math.floor(Math.random()*(dropdown.length-1)+1);
  dropdown.selectedIndex = index;
  load_recipes();
  var dropdown2 = document.getElementById("recipe");
  index = Math.floor(Math.random()*(dropdown2.length-1)+1);
  dropdown2.selectedIndex = index;
  load_viz(false);
};


function load_recipes(){
  var dropdown = document.getElementById("cuisine");
  var index = dropdown.selectedIndex;
  if(index == 0) return true;

  var cuisine = dropdown.options[index].value;

  var dropdown2 = document.getElementById("recipe");
  dropdown2.options.length = 0;
  var elt = document.createElement("option");
  elt.textContent = "Select Recipe";
  elt.value = "Select Recipe";
  dropdown2.appendChild(elt);

  var recipes = cuisine_data[cuisine]["data"];
  for(var i = 0; i < recipes.length; i++) {
    var elt = document.createElement("option");
    elt.textContent = recipes[i]["title"].split('-').join(' ');
    elt.value = recipes[i]["title"];
    dropdown2.appendChild(elt);
  }
}

function load_viz(update){
  var dropdown = document.getElementById("cuisine");
  var index = dropdown.selectedIndex;
  if(index == 0) return true;
  var cuisine = dropdown.options[index].value;
  var dropdown = document.getElementById("recipe");
  var index = dropdown.selectedIndex;
  if(index == 0) return true;
  var recipe = dropdown.options[index].value;


  var recipes = cuisine_data[cuisine]["data"];
  for(var i = 0; i < recipes.length; i++) {
    if(recipes[i]["title"] == recipe) {
      build_code_flower(recipes[i], cuisine, update);
      break;
    }
  }
}


function total_unique_ing() {
  var non_unique = []
  var all_ing = {}
  for (var cuisine in cuisine_data) {
    var elt = cuisine_data[cuisine];
    for(i = 0; i< elt["all_ing"].length; i++){
      var cur = elt["all_ing"][i];
      if(!(cur in all_ing)){
        all_ing[cur] = 1;
      }
      else {
        all_ing[cur]++;
      }
      non_unique.push(cur);
    }
  }
  //console.log("non unique:", non_unique.length);
  return all_ing;
}

function cosine_similarity(elt1, elt2) {
  var elt1_ing_lst = elt1["ing_lst"];
  var elt2_ing_lst = elt2["ing_lst"];

  var same = 0;
  for(var i = 0; i < elt1_ing_lst.length; i++) {
    var cur = elt1_ing_lst[i];
    if(elt2_ing_lst.indexOf(cur) > -1) {
      same++;
    }
  }
  var similarity = same / (Math.sqrt(elt1_ing_lst.length) * Math.sqrt(elt2_ing_lst.length));
  return similarity;
}

var currentCodeFlower;
function build_code_flower(elt, cuisine, update) {
  // remove previous flower to save memory
  if(currentCodeFlower && !update) currentCodeFlower.cleanup();
  // construct a json centered around desired element
  var data = build_new_json(elt, cuisine);
  // adapt layout size to the total number of elements
  //var total = countElements(data);
  //w = parseInt(Math.sqrt(total) * 30, 10);
  //h = parseInt(Math.sqrt(total) * 30, 10);

  //create a new CodeFLower
  if (!update)
  {
    currentCodeFlower = new CodeFlower("#visualization", visW, visH);
  }
  currentCodeFlower.update(data);

  redraw_graphs("graph1");
  redraw_graphs("graph2");
}

var flattened_data = {};
function redraw_graphs(graph) {
  remove_old_graphs(graph);
  //plot_all_cuisines(flattened_data, "fat", "kcal");
  //plot_all_cuisines(flattened_data, "fat", "rating");

  var x_axis_drop = document.getElementById("x"+graph);
  var index = x_axis_drop.selectedIndex;
  var x_axis = x_axis_drop.options[index].value;

  var y_axis_drop = document.getElementById("y"+graph);
  index = y_axis_drop.selectedIndex;
  var y_axis = y_axis_drop.options[index].value;
  //console.log(flattened_data);
  plot_all_cuisines(flattened_data, x_axis, y_axis, "#"+graph);
}

function color(cuisine) {
  switch(cuisine) {
    case "unique":
      return "#000000";
    case "chinese":
      return "#8DD3C7";
    case "korean":
      return "#FFFFB3";
    case "japanese":
      return "#BEBADA";
    case "thai":
      return "#FB8072";
    case "vietnamese":
      return "#80B1D3";
    case "indian":
      return "#FDB462";
    case "filipino":
      return "#B3DE69";
    case "italian":
      return "#FCCDE5";
    case "french":
      return "#D9D9D9";
    case "greek":
      return "#BC80BD";
    case "hungarian":
      return "#CCEBC5";
    case "mexican":
      return "#FFED6F";
    default:
      return "hsl(" + parseInt(360 / total * d.id, 10) + ",90%,70%)";
  }
}
function build_new_json(elt, elt_cuisine){
  flattened_data = {};
  var json = {
    "title": elt["title"].split("-").join(" ").toUpperCase(),
    "name": elt["title"],
    "size": 1500,
    "similarity": 1.0,
    "cuisine": elt_cuisine,
    "rating": elt["rating"],
    "url" : "http://allrecipes.com/recipe/" + elt["title"] + "/detail.aspx",
    "ing_lst": elt["ing_lst"],
    "ning": elt["ning"],
    "color" : color("unique"),
    "kcal": elt["kcal"],
    "chol": elt["chol"],
    "protein": elt["protein"],
    "fiber": elt["fiber"],
    "sodium": elt["sodium"],
    "time": elt["time"],
    "fat": elt["fat"]
  };
  var children = [];
  var main_children = [];

  for (var cuisine in cuisine_data)
  {
    flattened_data[cuisine] = [];
    var checkbox = document.getElementById(cuisine);
    if(checkbox.checked) {
      var data = cuisine_data[cuisine];
      var recipes = data["data"];
      if(cuisine == elt_cuisine)
      {
        for(var i = 0; i < recipes.length; i++)
        {
          var recipe = recipes[i];
          if(recipe["title"] != elt["title"])
          {
            var child = build_child(elt, recipe, cuisine);
            if(child["ning"] < MIN_ING)
                continue;
            if(child["similarity"] >= MIN_SIMILARITY && child["similarity"] <= MAX_SIMILARITY)
            {
              main_children.push(child);
            }
          }
        }
      }
      else
      {
        var cuisine_vector = {
          "ing_lst": data["all_ing"],
          "title": cuisine
        };
        var cuisine_child = build_child(elt, cuisine_vector, cuisine);
        var cuisine_children = [];
        for(var i = 0; i < recipes.length; i++)
        {
          var recipe = recipes[i];
          var child = build_child(elt, recipe, cuisine);
          //if(child["similarity"] > 0)
          //{
            //outcuistotal += child["similarity"];
            //outcuisnum++;
          //}
          if(child["ning"] < MIN_ING)
              continue;
          if(child["similarity"] >= MIN_SIMILARITY && child["similarity"] <= MAX_SIMILARITY)
          {
            cuisine_children.push(child);
          }
        }
      var sorted = sortObject(cuisine_children);
      var num_keep = Math.min(MAX_KEEP, Math.max(MIN_KEEP, Math.round(KEEP_PROP * sorted.length)));
      cuisine_child["children"] = sorted.slice(0, num_keep);
      for(var i = 0; i < num_keep && i < sorted.length; i++) {
        flattened_data[cuisine].push(cuisine_child["children"][i]);
      }
      children.push(cuisine_child);
      }
    }
  }
 // console.log("in cuis avg", incuistotal/incuisnum);
 // console.log("out cuis avg", outcuistotal/outcuisnum);

  var sorted = sortObject(main_children);
  var num_keep = Math.min(MAX_KEEP, Math.max(MIN_KEEP, Math.round(KEEP_MAIN * sorted.length)));

  if (num_keep == 0)
      sorted = sorted;
  else
      sorted = sorted.slice(0, num_keep);

  var all_children = children.concat(sorted);
  for(var i = 0; i < num_keep && i < sorted.length; i++) {
    flattened_data[elt_cuisine].push(sorted[i]);
  }

  json["children"] =  all_children;

  return json;
}

function build_child(elt, recipe, cuisine) {
  var similarity = cosine_similarity(elt, recipe);

  var child = {
    "title": recipe["title"].split("-").join(" ").toUpperCase(),
    "name": recipe["title"], // original
    "size": similarity * similarity * 800,
    "cuisine": cuisine, //to set the color?
    "similarity": similarity,
    "rating": recipe["rating"],
    "url" : "http://allrecipes.com/recipe/" + recipe["title"] + "/detail.aspx",
    "inglist": recipe["ing_lst"],
    "ning": recipe["ning"],
    "color" : color(cuisine),
    "kcal": recipe["kcal"],
    "chol": recipe["chol"],
    "protein": recipe["protein"],
    "fiber": recipe["fiber"],
    "sodium": recipe["sodium"],
    "time": recipe["time"],
    "fat": recipe["fat"]
  };
  return child;
}

$(function() {
  $("#slider").slider({
    range: true,
  min: 0,
  max: 1,
  step: .01,
  values: [.3, 1],
  slide: function(event, ui) {
    MIN_SIMILARITY = ui.values[0];
    MAX_SIMILARITY = ui.values[1];
    $("#maxmin").text("Max: "+ ui.values[1] + " Min: " + ui.values[0]);
    if(currentCodeFlower) {
      load_viz(true);
    }
  }
  });
  var values = $("#slider").slider("option", "values");
  $("#maxmin").text("Max: "+ values[1] + " Min: " + values[0]);
});
//function slider(){
  //console.log("Imma make a slider");
  //$("#slider").slider({
    //range: true,
    //min: 0,
    //max: 1,
    //values: [.4, 1],
    //slide: function(event, ui) {
      //console.log("Slider stop sliding!",ui.values[0], ui.values[1]);
    //}
  //});

//}
//slider();

var total_cuisines = 12;
var done_cuisines = 0;
load_data("chinese");
load_data("korean");
load_data("japanese");
load_data("thai");
load_data("vietnamese");
load_data("indian");
load_data("filipino");
load_data("italian");
load_data("french");
load_data("greek");
load_data("hungarian");
load_data("mexican");
