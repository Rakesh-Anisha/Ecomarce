import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

function ShoppingCheckout() {
  const { cartItems } = useSelector((state) => state.shopCart);
  const { user } = useSelector((state) => state.auth);
  const { approvalURL } = useSelector((state) => state.shopOrder);
  const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
  const [isPaymentStart, setIsPaymentStart] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null); // State to manage success message
  const dispatch = useDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const successDetails = JSON.parse(sessionStorage.getItem("orderSuccess"));
    if (successDetails) {
      setOrderSuccess(successDetails);
      sessionStorage.removeItem("orderSuccess"); // Clean up
    }
  }, []);

  const totalCartAmount =
    cartItems && cartItems.items && cartItems.items.length > 0
      ? cartItems.items.reduce(
          (sum, currentItem) =>
            sum +
            (currentItem?.salePrice > 0
              ? currentItem?.salePrice
              : currentItem?.price) *
              currentItem?.quantity,
          0
        )
      : 0;

  function handleInitiatePaypalPayment() {
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }
    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending",
      paymentMethod: "paypal",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        setIsPaymentStart(true);
      } else {
        setIsPaymentStart(false);
        toast({
          title: "Failed to place order. Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  function handleCashOnDelivery() {
    if (cartItems.length === 0) {
      toast({
        title: "Your cart is empty. Please add items to proceed",
        variant: "destructive",
      });
      return;
    }
    if (currentSelectedAddress === null) {
      toast({
        title: "Please select one address to proceed.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      userId: user?.id,
      cartId: cartItems?._id,
      cartItems: cartItems.items.map((singleCartItem) => ({
        productId: singleCartItem?.productId,
        title: singleCartItem?.title,
        image: singleCartItem?.image,
        price:
          singleCartItem?.salePrice > 0
            ? singleCartItem?.salePrice
            : singleCartItem?.price,
        quantity: singleCartItem?.quantity,
      })),
      addressInfo: {
        addressId: currentSelectedAddress?._id,
        address: currentSelectedAddress?.address,
        city: currentSelectedAddress?.city,
        pincode: currentSelectedAddress?.pincode,
        phone: currentSelectedAddress?.phone,
        notes: currentSelectedAddress?.notes,
      },
      orderStatus: "pending",
      paymentMethod: "cod",
      paymentStatus: "pending",
      totalAmount: totalCartAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      paymentId: "",
      payerId: "",
    };

    dispatch(createNewOrder(orderData)).then((data) => {
      if (data?.payload?.success) {
        setOrderSuccess({
          method: "cod",
          orderId: data.payload.orderId,
        });
      } else {
        toast({
          title: "Failed to place order. Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  if (approvalURL) {
    sessionStorage.setItem("paymentMethod", "paypal");
    window.location.href = approvalURL;
  }

  return (
    <div className="flex flex-col">
      <div className="relative h-[300px] w-full overflow-hidden">
        <img src={img} className="h-full w-full object-cover object-center" />
      </div>
      {orderSuccess ? (
        <div className="container mx-auto mt-5 p-5">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-green-600 text-center">
                Order Successful!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg">
                {orderSuccess.method === "cod"
                  ? `Your order has been placed successfully with Cash on Delivery! Order ID: ${orderSuccess.orderId}`
                  : `Your payment was successful! Order ID: ${orderSuccess.orderId}`}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                {orderSuccess.method === "cod"
                  ? "You will pay upon delivery. Thank you for shopping with us!"
                  : "Your payment has been processed. Thank you for your purchase!"}
              </p>
              <div className="mt-5 flex justify-center gap-4">
                <Button onClick={() => navigate("/shop/account")}>
                  View Orders
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/shop/order-details/${orderSuccess.orderId}`)}
                >
                  View Order Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
          <Address
            selectedId={currentSelectedAddress}
            setCurrentSelectedAddress={setCurrentSelectedAddress}
          />
          <div className="flex flex-col gap-4">
            {cartItems && cartItems.items && cartItems.items.length > 0
              ? cartItems.items.map((item) => (
                  <UserCartItemsContent cartItem={item} key={item.productId} />
                ))
              : null}
            <div className="mt-8 space-y-4">
              <div className="flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-bold">${totalCartAmount}</span>
              </div>
            </div>
            <div className="mt-4 w-full flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleInitiatePaypalPayment}
                className="w-full sm:w-1/2"
                disabled={isPaymentStart}
              >
                {isPaymentStart
                  ? "Processing PayPal Payment..."
                  : "Checkout with PayPal"}
              </Button>
              <Button
                onClick={handleCashOnDelivery}
                className="w-full sm:w-1/2 bg-green-600 hover:bg-green-700"
                disabled={isPaymentStart}
              >
                Cash on Delivery
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShoppingCheckout;