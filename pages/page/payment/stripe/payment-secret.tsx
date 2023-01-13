import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import getStripe from "../../../../utils/get-stripejs";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm, {
	PaymentCheckoutProps,
	PaymentStatusList,
} from "../../../../components/CheckoutForm";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { convertStringRouterQuery } from "../../../../utils/string";
import { useRouter } from "next/router";

export interface IStripeByPaymentSecretProps {
	client_secret?: string;
}

const styles = {
	container: "w-[400px] min-h-[500px] mx-auto bg-slate-400 p-2",
	input: "rounded w-full p-2 mb-2 outline-none",
	button: "rounded w-full p-2 mb-2 bg-slate-500",
};

interface PaymentContract {
	status: PaymentStatusList;
	paymentIntent?: PaymentCheckoutProps;
}

const StripeByPaymentSecret = (_props: IStripeByPaymentSecretProps) => {
	const router = useRouter();

	const [payment, setPayment] = useState<PaymentContract>({
		status: PaymentStatusList.INITIAL,
	});

	const form = {
		clientSecret: useRef<HTMLInputElement | null>(null),
	};

	const paymentStatus = useMemo(() => {
		return payment.status;
	}, [payment.status]);

	const clientSecret = useMemo(() => {
		return _props.client_secret;
	}, [_props.client_secret]);

	const payHandle = useCallback(async () => {
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
	}, [form.clientSecret]);

	useEffect(() => {
		if (clientSecret && clientSecret !== "") {
			if (form.clientSecret.current) {
				form.clientSecret.current.value = clientSecret;
				payHandle();
			}
		}
	}, [form.clientSecret, clientSecret, payHandle]);

	const cancelCheckout = async () => {
		let newQuery = router.query;
		delete newQuery["client_secret"];
		router
			.replace(
				{
					pathname: router.pathname,
					query: {
						...newQuery,
					},
				},
				undefined,
				{ shallow: true }
			)
			.then(() => {
				router.reload();
			});
	};

	const updateStatus = (status: PaymentStatusList) => {
		if (paymentStatus !== status) {
			payment.status = status;
			setPayment({ ...payment });
		}
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
				{paymentStatus === PaymentStatusList.INITIAL && (
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

				{paymentStatus !== PaymentStatusList.INITIAL && (
					<button className={styles.button} onClick={cancelCheckout}>
						{paymentStatus === PaymentStatusList.PROCESSED
							? "Back"
							: "Cancel"}
					</button>
				)}

				{paymentStatus !== PaymentStatusList.INITIAL &&
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
								status={paymentStatus}
								updateStatus={updateStatus}
							/>
						</Elements>
					)}
			</div>
		</>
	);
};

export default StripeByPaymentSecret;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
	const clientSecret = convertStringRouterQuery(query.client_secret);

	const props: IStripeByPaymentSecretProps = {
		...(clientSecret ? { client_secret: clientSecret } : {}),
	};

	return {
		props,
	};
};
