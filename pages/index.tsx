import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
	return (
		<div className={styles.container}>
			<Head>
				<title>Payment Client Example</title>
				<meta name="description" content="Payment Client Example" />
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main className={styles.main}>
				<h1 className={styles.title}>Payment Client Example So Thai</h1>

				<p className={styles.description}>
					List Example
					<code className={styles.code}>Payment</code>
				</p>

				<div className={styles.grid}>
					<Link href="page/payment/stripe">
						<a className={styles.card}>
							<h2>Stripe &rarr;</h2>
							<p>Stripe Payment Process</p>
						</a>
					</Link>
				</div>
			</main>

			<footer className={styles.footer}>
				<a
					href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
					target="_blank"
					rel="noopener noreferrer"
				>
					Powered by{" "}
					<span className={styles.logo}>
						<Image
							src="/vercel.svg"
							alt="Vercel Logo"
							width={72}
							height={16}
						/>
					</span>
				</a>
			</footer>
		</div>
	);
};

export default Home;
