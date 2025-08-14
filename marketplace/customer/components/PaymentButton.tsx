import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerAuth } from "../contexts/CustomerAuthContext";
import { paymentService } from "../lib/payments";
import { toast } from "react-hot-toast";

interface PaymentButtonProps {
  orderId: string;
  amount: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  orderId,
  amount,
  disabled = false,
  className = "",
  children = "Pay Now",
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { customer } = useCustomerAuth();
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (!customer) {
      toast.error("Please login to continue");
      navigate("/login");
      return;
    }

    setIsProcessing(true);

    try {
      await paymentService.processPayment({
        orderId,
        amount,
        customerName: customer.name,
        customerEmail: customer.email,
        customerContact: customer.phone || "",
      });

      toast.success("Payment completed successfully!");
      navigate(`/orders/${orderId}`);
    } catch (error: any) {
      toast.error(error.message || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || isProcessing}
      className={`btn-primary w-full py-4 text-lg font-semibold rounded-lg transition-all duration-200 ${
        disabled || isProcessing
          ? "opacity-50 cursor-not-allowed"
          : "hover:shadow-lg transform hover:-translate-y-1"
      } ${className}`}
    >
      {isProcessing ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          Processing Payment...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default PaymentButton;
