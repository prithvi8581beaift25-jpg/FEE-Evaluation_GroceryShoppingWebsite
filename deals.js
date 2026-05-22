// ===== DEALS PAGE LOGIC =====

var dealProducts = [
  { id: 3, discount: 30 },
  { id: 5, discount: 25 },
  { id: 8, discount: 20 },
  { id: 9, discount: 35 },
  { id: 17, discount: 15 },
  { id: 21, discount: 28 },
  { id: 28, discount: 40 },
  { id: 31, discount: 22 },
];

function getStars(rating) {
  var full = Math.floor(rating);
  var half = (rating - full) >= 0.5 ? 1 : 0;
  var s = "";
  for (var i = 0; i < full; i++) s += "★";
  if (half) s += "½";
  return s;
}

function buildDealItems() {
  var items = [];
  for (var i = 0; i < dealProducts.length; i++) {
    var d = dealProducts[i];
    for (var j = 0; j < allProducts.length; j++) {
      if (allProducts[j].id === d.id) {
        var p = Object.assign({}, allProducts[j]);
        p.discount = d.discount;
        p.originalPrice = p.price;
        p.price = Math.round(p.price * (1 - d.discount / 100));
        items.push(p);
        break;
      }
    }
  }
  return items;
}

function renderDeals(items) {
  var grid = document.getElementById("dealGrid");
  grid.innerHTML = "";
  for (var i = 0; i < items.length; i++) {
    var p = items[i];
    var card = document.createElement("div");
    card.className = "product-card deal-card";
    card.innerHTML =
      '<div class="card-inner">' +
        '<span class="badge deal-badge">-' + p.discount + '%</span>' +
        '<div class="product-img-wrap"><img src="' + p.img + '" alt="' + p.name + '" class="product-img" loading="lazy"/></div>' +
        '<div class="product-info">' +
          '<h3 class="product-name">' + p.name + '</h3>' +
          '<p class="product-desc">' + p.desc + '</p>' +
          '<div class="product-meta">' +
            '<span class="stars">' + getStars(p.rating) + '</span>' +
            '<span class="rating-num">(' + p.rating + ')</span>' +
          '</div>' +
          '<div class="product-footer">' +
            '<div class="price-block">' +
              '<span class="old-price-sm">₹' + p.originalPrice + '</span>' +
              '<span class="price">₹' + p.price + '</span>' +
              '<span class="unit">/ ' + p.unit + '</span>' +
            '</div>' +
            '<button class="add-btn" onclick="addToCart(' + p.id + ')">+ Add</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    grid.appendChild(card);
  }
}

function sortDeals() {
  var val = document.getElementById("dealSort").value;
  var items = buildDealItems();
  if (val === "discount") {
    items.sort(function(a, b) { return b.discount - a.discount; });
  } else if (val === "price-asc") {
    items.sort(function(a, b) { return a.price - b.price; });
  } else if (val === "price-desc") {
    items.sort(function(a, b) { return b.price - a.price; });
  } else if (val === "rating") {
    items.sort(function(a, b) { return b.rating - a.rating; });
  }
  renderDeals(items);
}

function addBundleToCart(ids) {
  for (var i = 0; i < ids.length; i++) {
    addToCart(ids[i]);
  }
  showToast("📦 Bundle added to cart!");
}

function copyCoupon(code, btn) {
  navigator.clipboard.writeText(code).then(function() {
    btn.textContent = "Copied!";
    btn.style.background = "#2ecc71";
    setTimeout(function() {
      btn.textContent = "Copy";
      btn.style.background = "";
    }, 2000);
  });
}

function toggleMenu() {
  var menu = document.getElementById("mobileMenu");
  if (menu.style.display === "flex") {
    menu.style.display = "none";
  } else {
    menu.style.display = "flex";
  }
}

// COUNTDOWN TIMER
function startCountdown() {
  function render() {
    var now = new Date();
    var midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    var diff = midnight - now;
    if (diff <= 0) return;
    var h = Math.floor(diff / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    document.getElementById("hours").textContent = h < 10 ? "0" + h : h;
    document.getElementById("mins").textContent  = m < 10 ? "0" + m : m;
    document.getElementById("secs").textContent  = s < 10 ? "0" + s : s;
  }
  render();
  setInterval(render, 1000);
}

// Init
var grid = document.getElementById("dealGrid");
if (grid) {
  var items = buildDealItems();
  items.sort(function(a, b) { return b.discount - a.discount; });
  renderDeals(items);
}
startCountdown();

// Init
var items = buildDealItems();
items.sort(function(a, b) { return b.discount - a.discount; });
renderDeals(items);
startCountdown();
