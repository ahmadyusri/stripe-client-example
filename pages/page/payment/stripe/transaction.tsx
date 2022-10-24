import { useRef, useState } from "react";
import getStripe from "../../../../utils/get-stripejs";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm, {
	PaymentCheckoutProps,
	PaymentStatusList,
} from "../../../../components/CheckoutForm";
import axios from "axios";
import Head from "next/head";

export interface IStripeProps {}

const styles = {
	container: "w-[400px] min-h-[500px] mx-auto bg-slate-400 p-2",
	input: "rounded w-full p-2 mb-2 outline-none",
	button: "rounded w-full p-2 mb-2 bg-slate-500",
};

interface PaymentContract {
	status: PaymentStatusList;
	paymentIntent?: PaymentCheckoutProps;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const Stripe = (_props: IStripeProps) => {
	const [payment, setPayment] = useState<PaymentContract>({
		status: PaymentStatusList.INITIAL,
	});

	const form = {
		apiToken: useRef<HTMLInputElement | null>(null),
		transactionId: useRef<HTMLInputElement | null>(null),
	};

	const cancelCheckout = async () => {
		setPayment({ status: PaymentStatusList.INITIAL });
	};

	const payHandle = async () => {
		const apiToken = form.apiToken.current?.value;
		const transactionId = form.transactionId.current?.value;

		if (apiToken === "" || !apiToken) {
			form.apiToken.current?.focus();
			alert("Please input API Token");
			return;
		}

		if (transactionId === "" || !transactionId) {
			form.transactionId.current?.focus();
			alert("Please input Transaction ID");
			return;
		}

		let response: any;
		try {
			const getTransaction = await axios.get(
				apiBaseUrl + "/payment/transactions/" + transactionId,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${apiToken}`,
					},
				}
			);

			response = getTransaction.data;
		} catch (error: any) {
			response = error.response?.data;
			if (response) {
				if (typeof response?.data?.errors === "object") {
					let newMessage = "";
					response?.data?.errors.map((item: any) => {
						newMessage += item.message + "\n";
					});

					if (newMessage !== "") {
						response.message = newMessage;
					}
				}
			} else {
				response = {
					success: false,
					message: error.message,
				};
			}
		}

		if (response?.success !== true) {
			alert(response?.message);
			return;
		}

		const { data: responseData } = response;
		const {
			latest_history: latestHistory,
			payment_confirm: paymentConfirm,
		} = responseData;

		if (paymentConfirm === true) {
			alert("Payment Already Confirmed");
			return;
		}

		if (!latestHistory.event_client_secret) {
			alert("Payment Information not valid");
			return;
		}

		const paymentIntent = {
			id: latestHistory.event_id,
			client_secret: latestHistory.event_client_secret,
			amount_display: responseData.currency + " " + responseData.price,
		};

		setPayment({
			status: PaymentStatusList.PROCESSING,
			paymentIntent,
		});
	};

	const updateStatus = (status: PaymentStatusList) => {
		setPayment((item) => {
			return { ...item, status };
		});
	};

	return (
		<>
			<Head>
				<title>By Transaction Stripe .:. Payment Client Example</title>
				<meta
					name="description"
					content="By Transaction Stripe Payment Client Example"
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<div className={styles.container}>
				{payment.status !== PaymentStatusList.PROCESSING && (
					<>
						<input
							ref={form.apiToken}
							className={styles.input}
							placeholder="API Token"
							required
						/>
						<input
							ref={form.transactionId}
							className={styles.input}
							placeholder="Transaction ID"
							required
						/>

						<button className={styles.button} onClick={payHandle}>
							Pay
						</button>
					</>
				)}

				{payment.status === PaymentStatusList.PROCESSING && (
					<button
						className={styles.button}
						onClick={cancelCheckout}
						disabled={
							payment.status !== PaymentStatusList.PROCESSING
						}
					>
						Cancel
					</button>
				)}

				{payment.status === PaymentStatusList.PROCESSING &&
					payment.paymentIntent && (
						<Elements
							stripe={getStripe()}
							options={{
								clientSecret:
									payment?.paymentIntent?.client_secret,
								appearance: {
									theme: "stripe",
									labels: "floating",
								},
							}}
						>
							<CheckoutForm
								payment={payment.paymentIntent}
								status={payment.status}
								updateStatus={updateStatus}
							/>
						</Elements>
					)}
			</div>
		</>
	);
};

export default Stripe;
