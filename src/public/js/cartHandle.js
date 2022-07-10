var shoppingCart = (function() {
    cart = [];
    // construction
    function Shoe(shoeId, firstImg, shoeName, price, quantity, size) {
        this.shoeId = shoeId;
        this.firstImg = firstImg;
        this.shoeName = shoeName;
        this.price = price;
        this.quantity = quantity;
        this.size = size;
    }

    // save Cart
    function saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
    }

    // loadCart
    function loadCart() {
        cart = JSON.parse(localStorage.getItem('shoppingCart'));
    }
    if (localStorage.getItem("shoppingCart") != null) {
        loadCart();
    }

    // PUBLIC METHOD
    var obj = {};

    // Add to cart
    obj.addShoeToCart = function(shoeId, firstImg, shoeName, price, quantity, size) {
        console.log(quantity);
        // check shoe already have in cart
        for(var shoe in cart) {
            if(cart[shoe].shoeId === shoeId && cart[shoe].size === size) {
                cart[shoe].quantity++;
                saveCart();
                return;
            }
        }
        var shoe = new Shoe(shoeId, firstImg, shoeName, price, quantity, size);
        shoe.cartId = cart.length;
        cart.push(shoe);
        console.log(cart);
        saveCart();
    }

    // get list cart
    obj.getCart = function() {
        var cartCopy = [];
        for(i in cart) {
            shoe = cart[i];
            shoeCopy = {};
            for(properties in shoe) {
                shoeCopy[properties] = shoe[properties];
            }
            shoeCopy.total = Number(shoe.price * shoe.quantity).toFixed(2);
            cartCopy.push(shoeCopy)
        }
        return cartCopy;
    }

    //update shoe from cart
    obj.updateShoeFromCart = function(listToUpdate) {
        for(var itemUpdate = 0; itemUpdate < listToUpdate.length; itemUpdate++) {
            for(var itemRoot = 0; itemRoot < cart.length; itemRoot++) {
                if(cart[itemRoot].cartId === listToUpdate[itemUpdate].cartId) {
                    cart[itemRoot].quantity = listToUpdate[itemUpdate].quantity;
                }
            }
        }
        saveCart();
    }

    // Remove shoes from cart
    obj.removeShoeFromCart = function(cartId) {
        for(var shoe in cart) {
            if(cart[shoe].cartId === cartId) {
                cart.splice(shoe, 1);
                break;
            }
        }
        saveCart();
    }

    // Clear cart
    obj.clearCart = function() {
        cart = [];
        saveCart();
    }

    return obj;
})();