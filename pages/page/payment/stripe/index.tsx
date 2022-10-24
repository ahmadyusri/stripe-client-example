import Head from "next/head";
import Link from "next/link";

export interface IStripeProps {}

const styles = {
	container:
		"mx-auto p-2 space-x-2 flex items-center justify-center px-[100px] h-screen",
	button: "rounded w-full p-2 mb-2 bg-slate-500 text-center",
};

const Stripe = (_props: IStripeProps) => {
	return (
		<>
			<Head>
				<title>Stripe .:. Payment Client Example</title>
				<meta
					name="description"
					content="Stripe Payment Client Example"
				/>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<div className={styles.container}>
				<Link href="stripe/cart">
					<a className={styles.button} title="Payment Stripe By Cart">
						By Cart
					</a>
				</Link>
				<Link href="stripe/transaction">
					<a
						className={styles.button}
						title="Payment Stripe By Transaction"
					>
						By Transaction
					</a>
				</Link>
				<Link href="stripe/payment-secret">
					<a
						className={styles.button}
						title="Payment Stripe By Stripe Secret"
					>
						By Stripe Secret
					</a>
				</Link>
			</div>
		</>
	);
};

export default Stripe;
