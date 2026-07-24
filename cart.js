// Lanela Shop — carrito compartido entre páginas (localStorage)
const CART_KEY = 'lanela_cart';

function getCart(){
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch(e){ return []; }
}

function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

// item: {id, name, price (número sin puntos), color, size, img}
function addToCart(item){
  const cart = getCart();
  const existing = cart.find(i => i.id === item.id && i.color === item.color && i.size === item.size);
  if (existing){
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart(cart);
}

function removeFromCart(index){
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}

function updateQty(index, qty){
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].qty = Math.max(1, qty);
  saveCart(cart);
}

function clearCart(){
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

function getCartCount(){
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function getCartTotal(){
  return getCart().reduce((sum, i) => sum + (i.price * i.qty), 0);
}

function formatCOP(n){
  return '$ ' + n.toLocaleString('es-CO');
}

function updateCartBadge(){
  const el = document.getElementById('cart-count');
  if (el) el.textContent = getCartCount();
}

document.addEventListener('DOMContentLoaded', updateCartBadge);
