// // import { Button } from "@/components/ui/button";
// // import { Card, CardHeader, CardTitle } from "@/components/ui/card";
// // import { useNavigate } from "react-router-dom";

// // function PaymentSuccessPage() {
// //   const navigate = useNavigate();

// //   return (
// //     <Card className="p-10">
// //       <CardHeader className="p-0">
// //         <CardTitle className="text-4xl">Payment is successfull!</CardTitle>
// //       </CardHeader>
// //       <Button className="mt-5" onClick={() => navigate("/shop/account")}>
// //         View Orders
// //       </Button>
// //     </Card>
// //   );
// // }

// // export default PaymentSuccessPage;



// function PaymentSuccessPage() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const params = new URLSearchParams(location.search);
//   const paymentMethod = params.get("method") || "paypal"; // Pass method via URL

//   return (
//     <Card className="p-10">
//       <CardHeader className="p-0">
//         <CardTitle className="text-4xl">
//           {paymentMethod === "cod"
//             ? "Order placed successfully with Cash on Delivery!"
//             : "Payment is successful!"}
//         </CardTitle>
//       </CardHeader>
//       <Button className="mt-5" onClick={() => navigate("/shop/account")}>
//         View Orders
//       </Button>
//     </Card>
//   );
// }


import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export const createNewOrder = createAsyncThunk(
  "shopOrder/createNewOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/shop/order/create",
        orderData
      );
      if (response.data.success) {
        sessionStorage.setItem(
          "currentOrderId",
          JSON.stringify(response.data.orderId)
        );
        return response.data;
      } else {
        return rejectWithValue(response.data.message);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Network error");
    }
  }
);

const orderSlice = createSlice({
  name: "shopOrder",
  initialState: {
    approvalURL: null,
    order: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearOrderState: (state) => {
      state.approvalURL = null;
      state.order = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload.orderId;
        if (action.payload.approvalURL) {
          state.approvalURL = action.payload.approvalURL; // Set for PayPal
        }
      })
      .addCase(createNewOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrderState } = orderSlice.actions;
export default orderSlice.reducer;