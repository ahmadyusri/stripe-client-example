import React, { useEffect, useMemo, useState } from "react";
import {
	PaymentElement,
	useStripe,
	useElements,
} from "@stripe/react-stripe-js";
import { PaymentIntent } from "@stripe/stripe-js";
import {
	formatNumberForDisplay,
	formatNumberRemoveZeroDecimal,
} from "../../utils/currency";

export enum PaymentStatusList {
	INITIAL = "INITIAL",
	PROCESSING = "PROCESSING",
	PROCESSED = "PROCESSED",
	ERROR = "ERROR",
}

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
	const [paymentIntent, setPaymentIntent] = useState<
		PaymentIntent | undefined
	>(undefined);

	const stripe = useStripe();
	const elements = useElements();

	const amount = useMemo(() => {
		return paymentIntent
			? formatNumberRemoveZeroDecimal(
					paymentIntent.amount,
					paymentIntent.currency
			  )
			: undefined;
	}, [paymentIntent]);

	const amountDisplay = useMemo(() => {
		return paymentIntent && amount
			? formatNumberForDisplay(amount, paymentIntent.currency)
			: undefined;
	}, [amount, paymentIntent]);

	const description = useMemo(() => {
		return paymentIntent ? paymentIntent.description : undefined;
	}, [paymentIntent]);

	const livemode = useMemo(() => {
		return paymentIntent ? paymentIntent.livemode : undefined;
	}, [paymentIntent]);

	const returnUrl: string = `${APP_URL}/page/payment/stripe/payment-secret?client_secret=${payment.client_secret}`;

	useEffect(() => {
		if (!stripe) {
			return;
		}

		if (!payment.client_secret) {
			return;
		}

		setIsLoading(true);
		try {
			stripe
				.retrievePaymentIntent(payment.client_secret)
				.then(({ paymentIntent }) => {
					setPaymentIntent(paymentIntent);
					console.log({ paymentIntent });
					switch (paymentIntent?.status) {
						case "succeeded":
							updateStatus(PaymentStatusList.PROCESSED);
							setMessage({
								type: "success",
								message: "Payment succeeded!",
							});
							break;
						case "processing":
							updateStatus(PaymentStatusList.PROCESSED);
							setMessage({
								type: "info",
								message: "Your payment is processing",
							});

							break;
						case "requires_payment_method":
							break;
						default:
							updateStatus(PaymentStatusList.PROCESSED);
							setMessage({
								type: "error",
								message:
									"Failed to retrieve payment information",
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
		setIsLoading(false);
	}, [stripe, payment.client_secret, updateStatus]);

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
				return_url: returnUrl,
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
					<div className="mb-4 space-y-1">
						{amountDisplay && (
							<div className="text-center font-bold text-lg">
								Total: {amountDisplay}
							</div>
						)}
						{description && (
							<div className="text-center text-sm">
								{description}
							</div>
						)}
						{livemode === false && (
							<div className="text-center text-md font-bold text-amber-300">
								Environment Testing
							</div>
						)}
					</div>
					<PaymentElement id="payment-element" />
					<button
						className="rounded w-full p-2 my-2 bg-slate-500"
						disabled={
							isLoading ||
							!stripe ||
							!elements ||
							message !== undefined
						}
						id="submit"
					>
						<span id="button-text">
							{isLoading ? (
								<div className="spinner" id="spinner">
									Loading...
								</div>
							) : (
								`${
									amountDisplay
										? "Pay " + amountDisplay
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
