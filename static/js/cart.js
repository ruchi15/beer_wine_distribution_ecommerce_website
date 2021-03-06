let cartData = []

$( document ).ready(function() {
    // creatLoginNav();

    getCart(createCart, false);

    // should be called after creating every UI elements
    applyTemplateAnimation();
});

function createCart(cart) {

    let cartHtml = '';

    if (cart == null || cart == undefined || cart.length == 0 || cart.product_ids.length ==0) {
        $("#cart-div").hide();
        $("#cart-empty-div").show();
    } else {
        $("#cart-div").show();
        $("#cart-empty-div").hide();
    }

    cart.product_ids.forEach((prod, idx) => {
        cartHtml += 
        `<tr id="cart-prod_${prod.product_id}">` +
            '<td>' +
                '<div class="img">' +
                    `<a href="#"><img src="${prod.product_details.images[0]}" alt="Image"></a>` +
                    `<p>${prod.product_details.name}</p>` +
                '</div>' +
            '</td>' +
            `<td>$${prod.product_details.price}</td>` +
            '<td>' +
                '<div class="qty">' +
                    `<button id="cart-dec_${prod.product_id}" onclick="decProdQty(this.id)" class="btn-minus"><i class="fa fa-minus"></i></button>` +
                    `<input id="cart-qty_${prod.product_id}" type="text" value="${prod.quantity}">` +
                    `<button id="cart-inc_${prod.product_id}" onclick="incProdQty(this.id)" class="btn-plus"><i class="fa fa-plus"></i></button>` +
                '</div>' +
            '</td>' +
            `<td id="cart-subTotal_${prod.product_id}">$${prod.product_details.price*prod.quantity}</td>` +
            `<td><button id="cart-del_${prod.product_id}" onclick="delFromCart(this.id)"><i class="fa fa-trash"></i></button></td>` +
        '</tr>';
    });

    updateCartSummary();

    $("#my-cart").html(cartHtml);
}


function updateCartSummary() {
    let shipping =  Math.round(Math.min(cartData.total_price*0.15, 12)*100) / 100;

    let grandTotal = Math.round((shipping + cartData.total_price) * 100) / 100;
    
    $("#sub-total").text("$"+ cartData.total_price);
    $("#shipping-total").text("$"+ shipping);
    $("#grand-total").text("$"+ grandTotal);
}

function incProdQty (id) {
    let prodId = id.split("_")[1];
    var prodIdx = cartData.product_ids.findIndex(p => p.product_id == prodId);
    if (cartData.product_ids[prodIdx].quantity < cartData.product_ids[prodIdx].product_details.stock) {
        cartData.product_ids[prodIdx].quantity+=1; 
        $("#cart-subTotal_" + prodId).text(cartData.product_ids[prodIdx].quantity*cartData.product_ids[prodIdx].product_details.price);
        $("#cart-qty_" + prodId).val(cartData.product_ids[prodIdx].quantity);
        cartData.total_price+=cartData.product_ids[prodIdx].product_details.price;
        updateCartSummary();
    }
}

function decProdQty (id) {
    let prodId = id.split("_")[1];
    var prodIdx = cartData.product_ids.findIndex(p => p.product_id == prodId);
    if (cartData.product_ids[prodIdx].quantity>1) {
        cartData.product_ids[prodIdx].quantity-=1; 
        $("#cart-subTotal_" + prodId).text(cartData.product_ids[prodIdx].quantity*cartData.product_ids[prodIdx].product_details.price);
        $("#cart-qty_" + prodId).val(cartData.product_ids[prodIdx].quantity);
        cartData.total_price-=cartData.product_ids[prodIdx].product_details.price;
        updateCartSummary();
    }
    
}

function delFromCart (id) {
    let prodId = id.split("_")[1];
    var prodIdx = cartData.product_ids.findIndex(p => p.product_id == prodId);
    cartData.total_price-=(cartData.product_ids[prodIdx].product_details.price*cartData.product_ids[prodIdx].quantity);
    cartData.product_ids.splice(prodIdx, 1);
    $("#cart-prod_" + prodId).remove();
    updateCartSummary();
}

function updateCart(callback) {

    let cartReq = JSON.parse(JSON.stringify(cartData));;

    cartReq.product_ids.forEach(prod => {
        delete prod.product_details;
    });
    
    showLoader();
    $.ajax({
        type: "PUT",
        url: "/update_cart",
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({'cart' : cartReq}),
        success: function (response) {
            hideLoader();
            console.log('success \n', response);
            if (callback)
                callback();
        },
        error: function (error) {
            hideLoader();
            console.log('error', error);
            showErrorPopup();
        }
    })

    return false;
}


function goToCheckout() {

    if (cartData.product_ids.length == 0) {
        showErrorPopup("Cart is empty", "Please add items to the cart to place the order.");
        return;
    }

    updateCart(() => {
        window.location.href = "/checkout";
    });

    return false;
}