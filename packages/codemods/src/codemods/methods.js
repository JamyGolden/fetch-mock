export function simpleMethods(fetchMockVariableName, root, j) {
	const fetchMockMethodCalls = root
		.find(j.CallExpression, {
			callee: {
				object: {
					type: 'Identifier',
					name: fetchMockVariableName,
				},
			},
		})
		.map((path) => {
			const paths = [path];
			while (path.parentPath.value.type !== 'ExpressionStatement') {
				path = path.parentPath;
				if (path.value.type === 'CallExpression') {
					paths.push(path);
				}
			}
			return paths;
		});

	fetchMockMethodCalls.forEach((path) => {
		const method = path.value.callee.property.name;
		if (method === 'mock') {
			path.value.callee.property.name = 'route';
		}
		['get', 'post', 'put', 'delete', 'head', 'patch'].some((httpMethod) => {
			let applyMethod = false;
			if (method === `${httpMethod}Any`) {
				applyMethod = true;
				path.value.callee.property.name = 'any';
			} else if (method === `${httpMethod}AnyOnce`) {
				applyMethod = true;
				path.value.callee.property.name = 'anyOnce';
			}
			if (applyMethod) {
				const options = path.value.arguments[1];
				if (!options) {
					path.value.arguments.push(
						j(`const options = {method: '${httpMethod}'}`)
							.find(j.ObjectExpression)
							.get().value,
					);
				} else if (options.type === 'Literal') {
					path.value.arguments[1] = j(
						`const options = {name: ${options.raw}, method: '${httpMethod}'}`,
					)
						.find(j.ObjectExpression)
						.get().value;
				} else if (options.type === 'ObjectExpression') {
					options.properties.push(
						j(`const options = {method: '${httpMethod}'}`)
							.find(j.Property)
							.get().value,
					);
				}
			}
		});
	});

	[
		['lastUrl', 'url'],
		['lastOptions', 'options'],
		['lastResponse', 'response'],
	].forEach(([oldMethod, newProperty]) => {
		root
			.find(j.CallExpression, {
				callee: {
					object: {
						type: 'Identifier',
						name: fetchMockVariableName,
					},
					property: {
						name: oldMethod,
					},
				},
			})
			.closest(j.ExpressionStatement)
			.replaceWith((path) => {
				const oldCall = j(path).find(j.CallExpression).get();
				const builder = j(
					`${fetchMockVariableName}.callHistory.lastCall()?.${newProperty}`,
				);
				const newCall = builder.find(j.CallExpression).get();
				newCall.value.arguments = oldCall.value.arguments;
				return builder.find(j.ExpressionStatement).get().value;
			});
	});
}
