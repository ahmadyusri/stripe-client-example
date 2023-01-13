export const formatNumberForDisplay = (
	amount: number,
	currency: string,
	minimumFractionDigits: number = 0
): string => {
	let numberFormat = new Intl.NumberFormat(["en-US"], {
		style: "currency",
		currency: currency,
		currencyDisplay: "symbol",
		minimumFractionDigits,
	});

	return numberFormat.format(amount);
};

export const formatNumberWithZeroDecimal = (
	amount: number,
	currency: string
): number => {
	let numberFormat = new Intl.NumberFormat(["en-US"], {
		style: "currency",
		currency: currency,
		currencyDisplay: "symbol",
	});
	const parts = numberFormat.formatToParts(amount);
	let zeroDecimalCurrency: boolean = true;
	for (let part of parts) {
		if (part.type === "decimal") {
			zeroDecimalCurrency = false;
		}
	}

	return zeroDecimalCurrency ? amount : Math.round(amount * 100);
};

export const formatNumberRemoveZeroDecimal = (
	amount: number,
	currency: string
): number => {
	let numberFormat = new Intl.NumberFormat(["en-US"], {
		style: "currency",
		currency: currency,
		currencyDisplay: "symbol",
	});
	const parts = numberFormat.formatToParts(amount);
	let zeroDecimalCurrency: boolean = true;
	for (let part of parts) {
		if (part.type === "decimal") {
			zeroDecimalCurrency = false;
		}
	}

	return zeroDecimalCurrency ? amount : Math.round(amount / 100);
};
