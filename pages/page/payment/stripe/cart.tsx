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
		cartId: useRef<HTMLInputElement | null>(null),
		paymentMethod: useRef<HTMLInputElement | null>(null),
		remark: useRef<HTMLInputElement | null>(null),
	};

	const cancelCheckout = async () => {
		setPayment({ status: PaymentStatusList.INITIAL });
	};

	const checkout = async () => {
		const apiToken = form.apiToken.current?.value;
		const cartId = form.cartId.current?.value;
		const paymentMethod = form.paymentMethod.current?.value;
		const remark = form.remark.current?.value;

		if (apiToken === "" || !apiToken) {
			form.apiToken.current?.focus();
			alert("Please input API Token");
			return;
		}

		if (cartId === "" || !cartId) {
			form.cartId.current?.focus();
			alert("Please input Cart ID");
			return;
		}

		if (paymentMethod === "" || !paymentMethod) {
			form.paymentMethod.current?.focus();
			alert("Please Pick Payment Method");
			return;
		}

		const params = {
			cart_id: cartId,
			payment_method: paymentMethod,
			remark: remark,
		};

		let response: any;
		try {
			const checkoutProcess = await axios.post(
				apiBaseUrl + "/massage/booking/checkout",
				params,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${apiToken}`,
					},
				}
			);

			response = checkoutProcess.data;
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
		const { payment_intent: paymentIntent, payment_data: paymentData } =
			responseData;

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
				<title>By Cart Stripe .:. Payment Client Example</title>
				<meta
					name="description"
					content="By Cart Stripe Payment Client Example"
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
							ref={form.cartId}
							className={styles.input}
							placeholder="Cart ID"
							required
						/>
						<input
							ref={form.paymentMethod}
							className={styles.input}
							placeholder="Payment Method"
							value="stripe"
							readOnly
							required
						/>
						<input
							ref={form.remark}
							className={styles.input}
							placeholder="Remark"
						/>

						<button className={styles.button} onClick={checkout}>
							Checkout
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
