export const baseUrl = VITE_BASE_URL;


export const navigate = (options: {
	search?: Record<string, string> | string,
	pathname?: string,
}) => {
	const url = new URL(location.href);
	if (options.pathname)
		url.pathname = baseUrl + options.pathname;

	if (typeof options.search === 'string')
		url.search = options.search;

	if (typeof options.search === 'object') {
		Object.entries(options.search).forEach(([ key, value ]) => {
			url.searchParams.set(key, value);
		});
	}

	history.pushState('', '', url);
	globalThis.dispatchEvent(new PopStateEvent('popstate'));
};


export class SearchParams {

	public static get(name: string) {
		return new URL(location.href).searchParams.get(name) ?? '';
	}

	public static has(name: string, value?: string) {
		return new URL(location.href).searchParams.has(name, value);
	}

}
