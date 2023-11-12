export interface Env {
	URL: string
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		try {

			const fetched = await fetch(env.URL, request);

			if (!fetched.ok) {
				return new Response(fetched.statusText, {
					status: fetched.status,
				});
			}

			const text = await fetched.text();

			const groups = text.split("##").slice(1); // splits by '##' and remove the first empty element (since its just the header)
			const results = [];
		
			for (const groupText of groups) {
				const [group, ...lines] = groupText.split("\n").filter(Boolean); // splits by newline and remove empty lines
				const regex = /\|\s(?<code>\d+)\s\|\s(?<message>.+)\s\|/;
		
				for (const line of lines) {
					const match = regex.exec(line);
					if (match) {
						const code = match?.[1] ?? "";
						const message = match?.[2] ?? "";
		
						results.push({
							group: group.trim(),
							code: code.trim(),
							message: message.trim(),
						});
					}
				}
			}
		
			const json = JSON.stringify(results, null, 2);

			return new Response(json, {
				headers: {
					"content-type": "application/json;charset=UTF-8",
				},
			});
		} catch (err) {
			const error = err as Error;

			return new Response(JSON.stringify({
				error: true,
				stack: error.stack,
				message: error.message,
			}), {
				status: 500,
			});
		}
	},
};
