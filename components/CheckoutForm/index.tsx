import React, { useEffect, useState } from "react";
import {
	PaymentElement,
	useStripe,
	useElements,
} from "@stripe/react-stripe-js";
import { PaymentStatusList } from "../../pages/page/payment/stripe/payment-secret";

export interface Customer {
	id: string | number;
}

export interface PaymentCheckoutProps {
	client_secret: string;
	id?: string;
	amount_display?: string;
	customer?: Customer;
}

interface CheckoutFormProps {
	payment: PaymentCheckoutProps;
	status: PaymentStatusList;
	updateStatus: (status: PaymentStatusList) => void;
}

interface MessageContract {
	type: string;
	message: string;
}

const APP_URL: string =
	process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function CheckoutForm({
	payment,
	status,
	updateStatus,
}: CheckoutFormProps) {
	const [message, setMessage] = useState<MessageContract | undefined>();
	const [isLoading, setIsLoading] = useState(false);

	const stripe = useStripe();
	const elements = useElements();

	useEffect(() => {
		if (!stripe) {
			return;
		}

		if (!payment.client_secret) {
			return;
		}

		try {
			stripe
				.retrievePaymentIntent(payment.client_secret)
				.then(({ paymentIntent }) => {
					switch (paymentIntent?.status) {
						case "succeeded":
							updateStatus(PaymentStatusList.PROCESSED);
							setMessage({
								type: "success",
								message: "Payment succeeded!",
							});
							break;
						case "processing":
							setMessage({
								type: "info",
								message: "Your payment is processing",
							});

							break;
						case "requires_payment_method":
							break;
						default:
							setMessage({
								type: "error",
								message: "Your payment is processing",
							});
							break;
					}
				});
		} catch (error: any) {
			setMessage({
				type: "error",
				message: error.message,
			});
		}
	}, [stripe]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!stripe || !elements) {
			alert("Stripe not loaded");
			return;
		}

		setIsLoading(true);

		const { error } = await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: APP_URL,
			},
		});

		if (error.type === "card_error" || error.type === "validation_error") {
			setMessage({
				type: "error",
				message: error.message ?? "An unexpected error occured",
			});
		} else {
			setMessage({
				type: "error",
				message: "An unexpected error occured",
			});
		}

		setIsLoading(false);
	};

	return (
		<>
			{status === PaymentStatusList.PROCESSING && (
				<form
					id="payment-form"
					onSubmit={handleSubmit}
					className="m-auto"
				>
					{payment.amount_display && (
						<div className="mb-3 text-center font-bold text-lg">
							Total: {payment.amount_display}
						</div>
					)}
					<PaymentElement id="payment-element" />
					<button
						className="rounded w-full p-2 my-2 bg-slate-500"
						disabled={isLoading || !stripe || !elements}
						id="submit"
					>
						<span id="button-text">
							{isLoading ? (
								<div className="spinner" id="spinner"></div>
							) : (
								`${
									payment.amount_display
										? "Pay " + payment.amount_display
										: "Pay"
								}`
							)}
						</span>
					</button>
				</form>
			)}

			{/* Show any error or success messages */}
			{message && (
				<div
					id="payment-message"
					className={`text-center font-bold ${
						message.type === "success"
							? "text-green-800"
							: message.type === "error"
							? "text-red-500"
							: "text-black"
					}`}
				>
					{message.message}
				</div>
			)}
		</>
	);
}
