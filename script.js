const pixelBatchAddress = 'https://business-api.tiktok.com/open_api/v1.2/pixel/batch/';
const accessToken = 'your-access-token-here';
const pixelCode = 'your-pixel-code-here';
let events = [];

// TIKTOK PIXEL BASE CODE
!//Part1
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};

//Part 2
  ttq.load(pixelCode);
  ttq.page();
}(window, document, 'ttq');

// Display cart on page load
displayCart();

// Add item to cart
function addToCart(content_id, name, price) {
  // Send AddToCart event to TikTok Pixel
  track(ttq.track('AddToCart',{
    content_id: content_id,
    value: price,
    currency: 'USD',
  }));

  alert("Pixel AddToCart tracked");

  // Get cart from localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Add item to cart
  cart.push({ name, price });

  // Save cart to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));

  // Display cart
  displayCart();
}

function addToWishlist(name, price) {
  track(ttq.track('AddToWishlist'));
  let wishlistItems = JSON.parse(localStorage.getItem("wishlist")) || [];
  wishlistItems.push({ name, price});
  localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
  alert("Product added to wishlist! Pixel AddToWishList tracked.");
}

// Remove item from cart
function removeFromCart(index) {
  // Get cart from localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Remove item from cart
  cart.splice(index, 1);

  // Save cart to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));

  // Display cart
  displayCart();
}

// Display cart
function displayCart() {
  // Get cart from localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Get cart items element
  let cartItems = document.getElementById('cart-items');

  // Clear cart items
  cartItems.innerHTML = '';

  // Display cart items
  cart.forEach((item, index) => {
    let li = document.createElement('li');
    let name = document.createElement('span');
    name.textContent = item.name;
    let price = document.createElement('span');
    price.textContent = `$${item.price}`;
    let removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.onclick = () => removeFromCart(index);
    li.appendChild(name);
    li.appendChild(price);
    li.appendChild(removeButton);
    cartItems.appendChild(li);
  });

  // Display total price
  let totalPrice = document.getElementById('total-price');
  let price = cart.reduce((total, item) => total + item.price, 0);
  totalPrice.textContent = `Total Price: $${price}`;
}

// Submit purchase
function submitPurchase(event) {
  event.preventDefault();

  // Match people on TikTok with Pixel Advanced Matching 
  ttq.identify({
    email: document.getElementById('email').value,
    phone_number: document.getElementById('phone').value,
  });

  // Send Purchase event to TikTok Pixel
  track(ttq.track('CompletePayment'));

  // Clear cart from localStorage
  localStorage.removeItem('cart');

  // Display empty cart
  displayCart();

  // Clear input values
  document.getElementById('email').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('cardNumber').value = '';
  document.getElementById('expirationDate').value = '';
  document.getElementById('securityCode').value = '';

  alert("Order confirmed! Pixel CompletePayment tracked.")
}

function trackPaymentInfo() {
  track(ttq.track('AddPaymentInfo'));
  alert("Pixel AddPaymentInfo tracked.");
}

function trackClickButton() {
  track(ttq.track('ClickButton'));
  alert("Pixel ClickButton tracked.");
}

// Search query
function search(event) {
  event.preventDefault(); // prevent form submission

  let query = document.getElementById("search-input").value; // get search query
  
  // clear the search input field
  document.getElementById("search-input").value = "";

  track(ttq.track('Search'));
  alert("Pixel Search tracked.");
}

function submitNewsletter() {
  let newsletterForm = document.getElementById("newsletter-email");
  newsletterForm.value = '';
  track(ttq.track('Subscribe'));
  alert("Thanks for subscribing to our newsletter! Pixel Subscribe tracked");
}

// Make a POST request to the TikTok Events API endpoint
function sendEvents() {
  if (events.length === 0) return;

  fetch(pixelBatchAddress, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': accessToken
    },
    body: JSON.stringify({
      pixel_code: pixelCode,
      batch: events
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to send events to server');
    }
    
    events.length = 0;
  })
  .catch(error => {
    console.error(error);
    console.error('Error sending events:', error);
  })
  .finally(() => {
    sendEvents();
    console.log('Events sent successfully');
  });
}

// Report web events when array reaches 1000 events
function track(event) {
  events.push(event);
  if (events.length >= 1000) {
    sendEvents();
  }
}
