import { useRef, useState } from "react";
import getStripe from "../../../../utils/get-stripejs";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm, {
	PaymentCheckoutProps,
	PaymentStatusList,
} from "../../../../components/CheckoutForm";
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

const Stripe = (_props: IStripeProps) => {
	const [payment, setPayment] = useState<PaymentContract>({
		status: PaymentStatusList.INITIAL,
	});

	const form = {
		clientSecret: useRef<HTMLInputElement | null>(null),
	};

	const cancelCheckout = async () => {
		setPayment({ status: PaymentStatusList.INITIAL });
	};

	const payHandle = async () => {
		const clientSecret = form.clientSecret.current?.value;

		if (clientSecret === "" || !clientSecret) {
			form.clientSecret.current?.focus();
			alert("Please input Client Secret");
			return;
		}

		const paymentIntent = {
			client_secret: clientSecret,
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
				<title>By Stripe Secret .:. Payment Client Example</title>
				<meta
					name="description"
					content="By Stripe Secret Payment Client Example"
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<div className={styles.container}>
				{payment.status === PaymentStatusList.INITIAL && (
					<>
						<input
							ref={form.clientSecret}
							className={styles.input}
							placeholder="Client Secret"
							required
						/>

						<button className={styles.button} onClick={payHandle}>
							Pay
						</button>
					</>
				)}

				{payment.status !== PaymentStatusList.INITIAL && (
					<button className={styles.button} onClick={cancelCheckout}>
						{payment.status === PaymentStatusList.PROCESSED
							? "Back"
							: "Cancel"}
					</button>
				)}

				{payment.status !== PaymentStatusList.INITIAL &&
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
