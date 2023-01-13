export const convertStringRouterQuery = (
	query?: string | string[]
): string | undefined => {
	let queryString;
	let queryStringCheck = query;
	if (typeof queryStringCheck === "object") {
		if (queryStringCheck.length > 0) {
			queryString = queryStringCheck[0];
		}
	} else {
		queryString = queryStringCheck;
	}

	return queryString;
};
