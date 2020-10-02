var paywall = require("./lib/paywall");
setTimeout(() => paywall(13176670), 5000);

require("component-responsive-frame/child");

// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");


var $ = require("./lib/qsa");
var colors = require("./lib/colors");
var debounce = require("./lib/debounce");

var scrollContainer = $.one(".scroll-graph");
var seasons = $(".season");
var vizContainer = $.one(".viz");


var body = document.body,
    html = document.documentElement;

var height = Math.max( body.scrollHeight, body.offsetHeight,
                       html.clientHeight, html.scrollHeight, html.offsetHeight );

var graphWidth = scrollContainer.offsetWidth;
var navScroll = document.getElementById("navScroll");




var gameData = window.plum;

var seasonCounter = 0;

// console.log(gameData);
var maxPoints = gameData[gameData.length - 1].aggregate + 100;
var total = 0;
var bySeason = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [], 10: [], 11: [], 12: [], 13: [], 14: [], 15: [], 16: [], 17: [] };
gameData.forEach(function(g, i) {
  bySeason[g.season].push(g);
  var [month, day, year] = g.date.split("/").map(Number);
  g.date = new Date(year, month - 1, day);
  if (g.notes) {
    var point = document.createElement("div");
    point.className = "point";
    point.setAttribute("data-index", i);
    point.style.left = (i + 1) / gameData.length * 100 + "%";
    point.style.top = "0%";
    navScroll.appendChild(point);
    g.element = point;
  }
  if (g.first_ofSeason === 1) {
    seasonCounter += 1;

    var seasonSep = document.createElement("div");
    seasonSep.className = "seasonSep";
    seasonSep.setAttribute("data-index", i);
    console.log(i);
    seasonSep.innerHTML = `S${seasonCounter}`;
    seasonSep.style.left = (i + 1) / gameData.length * 100 + "%";
    seasonSep.style.top = "0%";
    navScroll.appendChild(seasonSep);
    // g.element = point;
  }
});

var canvas = $.one(".graph");
var context = canvas.getContext("2d");
var counter = $.one(".viz .counter .totals");
var career = $.one(".viz .awards .bigCareer");
var awards = $.one(".viz .counter .awards");
var allstars = $.one(".viz .awards .each .allstars");
var medals = $.one(".viz .awards .each .medals");
var trophies = $.one(".viz .awards .each .wnba");
var credit = $.one(".viz .credit");

var credits = {
  0: "Dan Hulshizer / AP",
  1: "Dan Hulshizer / AP",
  2: "John Froschauer / AP",
  3: "Rod Mar / The Seattle Times",
  4: "Bob Chile / AP",
  5: "Jennifer Pottheiser / Getty",
  6: "Jim Bates / The Seattle Times",
  7: "John Froschauer / AP",
  8: "Mark Harrison / The Seattle Times",
  9: "Jesse D. Garrabrant / Getty images",
  10: "Joel Hawksley / The Seattle Times ",
  11: "Elaine Thompson / AP",
  12: "Lindsey Wasson / The Seattle Times",
  13: "Dean Rutz / The Seattle Times",
  14: "Dean Rutz / The Seattle Times",
  15: "Dean Rutz / The Seattle Times",
  16: "Bettina Hansen / The Seattle Times",
  17: "Phelan M. Ebenhack / AP",
};

var palette = {
  1: "white",
  2: colors.palette.stLightPurple,
  3: "white",
  4: colors.palette.stLightPurple
};

var commafy = s => s.toLocaleString().replace(/\.0+$/, "");
var months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
var date = d => `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

var popup = $.one(".scroll-graph .popup");
var notClosed = true;

var setPopup = function(data) {
  var element = data.element;
  if (!element) return;
  popup.style.display = "block";
  popup.classList[data.game == 137 ? "add" : "remove"]("record-breaker");
  popup.querySelector(".notes").innerHTML = `${data.notes}`;
  // <h2>${date(data.date)}</h2>
  //var vizBounds = vizContainer.getBoundingClientRect();
  // var pointBounds = element.getBoundingClientRect();
  // var popupBounds = popup.getBoundingClientRect();
  // var offset = 20;
  // var x = pointBounds.left - vizBounds.left;
  // x -= popupBounds.width + offset;
  // if (x < 0) x += popupBounds.width + offset * 2;
  // if (x + popupBounds.width > vizBounds.width) x = vizBounds.width - popupBounds.width;
  // var y = pointBounds.top - vizBounds.top;
  // y -= popupBounds.height + offset;
  // if (y < 0) y += popupBounds.height + pointBounds.height + offset * 2;
  // if (y + popupBounds.height > vizBounds.height) y = vizBounds.height - popupBounds.height;
  // popup.style.left = Math.floor(x) + "px";
  // popup.style.top = Math.floor(y) + "px";
}

popup.querySelector(".close-button").addEventListener("click", function() {
  popup.style.display = "none";
  $(".point.activated").forEach(p => p.classList.remove("activated"));
  notClosed = false;
});

var onScroll = debounce(function() {
  var season = null;
  var bounds = null;
  for (var i = 0; i < seasons.length; i++) {
    var s = seasons[i];
    var b = s.getBoundingClientRect();
    // console.log(s);
    if (b.top < 0) {
      if (!s.classList.contains("active")) s.classList.add("active");
    } else {
      s.classList.remove("active");
    }
    if (b.top <= window.innerHeight && b.bottom > 0 && !season) {
      season = s;
      bounds = b;
    }
  }
  // console.log(season);
  if (!bounds) {
    if (seasons[seasons.length - 1].getBoundingClientRect().top < 0) {
      season = s;
      bounds = b;
    } else return;
  }
  var progress = bounds.top > 0 ? 0 : 1 - ((bounds.height + bounds.top) / bounds.height);
  if (progress == 0) {
    credit.innerHTML = "Photo: " + credits[0];
    return;
  }
  if (progress > 1) progress = .99;
  // var num = season.getAttribute("data-season");
  var num = season.getAttribute("data-seasonData");

  var seasonData = bySeason[num];
  // console.log(seasonData);
  credit.innerHTML = "Photo: " + credits[num];
  var index = Math.floor(seasonData.length * progress);
  var final = seasonData[index];
  var noted = null;




var tryThis = scrollContainer.getBoundingClientRect().bottom;

// console.log(tryThis);


  // canvas.width = canvas.offsetWidth;
  // canvas.height = canvas.offsetHeight;
  // context.strokeStyle = palette[1];
  // context.lineWidth = 4;
  // context.beginPath();
  // context.moveTo(0, canvas.height);
  // var state = {
  //   season: 1,
  //   x: 0,
  //   y: 0
  // }

  for (var i = 0; i < gameData.length; i++) {
    var game = gameData[i];

    // var x = (i + 1) / gameData.length * canvas.width;
    // var y = canvas.height - (game.aggregate / maxPoints * canvas.height);
    // context.lineTo(x, y);

    // if (state.season != game.season) {
    //   context.stroke();
    //   context.beginPath();
    //   context.moveTo(state.x, state.y);
    //   context.strokeStyle = palette[game.season];
    //   state.season = game.season;
    // }
    //
    // state.x = x;
    // state.y = y;

    if (game.notes) noted = game;

    if (game == final) break;
  }

  // context.stroke();

  if (noted && notClosed) {
    $(".point.activated").forEach(p => p.classList.remove("activated"));
    noted.element.classList.add("activated");
    setPopup(noted);
  }

  // console.log(gameData.length);

  var interval = graphWidth / (gameData.length + 1);
  var scrollBarWidth = interval * final.game;
  console.log(interval);
  navScroll.style.backgroundSize = `${scrollBarWidth}px 20px`;
  //
  // console.log(final);





  counter.innerHTML = `
  <div class="block">
    <div class="seasonGame">
      <div class="headSeason">Season ${final.season}</div>
      <div class="game head">Game ${final.game}</div>
    </div>
    <div class="points">${final.points} points</div>
    <div class="points">${final.assists} assists</div>
    <div class="points">${final.steals} steals</div>
    <div class="points">${final.threept} 3-pointers</div>
  </div>`

  career.innerHTML = `
  <div class="block">
    <div class="head">Career:</div>
    <div class="career"><b>${final.game}</b> games played</div>
    <div class="career"><b>${commafy(final.aggregate_points)}</b> points</div>
    <div class="career"><b>${commafy(final.aggregate_assists)}</b> assists</div>
    <div class="career"><b>${commafy(final.aggregate_steals)}</b> steals</div>
    <div class="career"><b>${commafy(final.aggregate_3pts)}</b> 3-pointers</div>
  </div>`






  allstars.innerHTML = "";
  medals.innerHTML = "";
  trophies.innerHTML = "";

  document.querySelector('.a_s').style.display = (final.all_stars > 0) ? "block" : "none" ;
  document.querySelector('.g_m').style.display = (final.gold_medals > 0) ? "block" : "none" ;
  document.querySelector('.w_t').style.display = (final.titles > 0) ? "block" : "none" ;

  for (var i = 0; i < final.all_stars; i++) {
    allstars.innerHTML += `<img src='assets/allstar.png'/>`;
  }
  for (var i = 0; i < final.gold_medals; i++) {
    medals.innerHTML += `<img src='assets/goldmedal.png'/>`;
  }
  for (var i = 0; i < final.titles; i++) {
    trophies.innerHTML += `<img src='assets/wnba_trophy.png'/>`;
  }

}, 50);

window.addEventListener("scroll", onScroll);
onScroll();

// $(".point").forEach(el => el.addEventListener("click", function() {
//   el.classList.toggle("activated");
//   $(".point.activated").filter(p => p != el).forEach(p => p.classList.remove("activated"));
//   var index = el.getAttribute("data-index");
//   setPopup(gameData[index]);
//   notClosed = true;
// }));
