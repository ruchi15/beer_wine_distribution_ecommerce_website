$( document ).ready(function() {
    // creatLoginNav();

    getCart(createBillPanel, true);
    // should be called after creating every UI elements
    applyTemplateAnimation();
});


function createBillPanel(cart) {
    let cartSummaryHtml = "<h1>Cart Total</h1>";

    cart.product_ids.forEach(prod => {
        cartSummaryHtml+= `<p>${prod.product_details.name} x (${prod.quantity}) <span>$${prod.product_details.price*prod.quantity}</span></p>`;
    });

    let shipping =  Math.round(Math.min(cart.total_price*0.15, 12)*100) / 100;

    let grandTotal = Math.round((shipping + cart.total_price) * 100) / 100;

    cartSummaryHtml+= `<p class="sub-total">Sub Total<span>$${cart.total_price}</span></p>` +
        `<p class="ship-cost">Shipping Cost<span>$${shipping}</span></p>` +
        `<h2>Grand Total<span>${grandTotal}</span></h2>`;

    $("#cart-summary").html(cartSummaryHtml);

    getAddress(fillAddress);
}

function placeOrder() {

    let address = fetchAddress();
    if (!address) {
        return;
    }


    showLoader();
    $.ajax({
        type: "POST",
        url: "/place_order",
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify({'shipping_address': address}),
        success: function (response) {
            hideLoader();
            showErrorPopup("Order Placed", "Order placed successfully. You can view the order details in the account section.", "account");
            console.log('success \n', response);
        },
        error: function (error) {
            hideLoader();
            console.log('error', error);
            let errMessage = null;
            if (error.responseJSON.message) {
                errMessage = error.responseJSON.message;
            }
            showErrorPopup(null, errMessage);
        }
    })
}