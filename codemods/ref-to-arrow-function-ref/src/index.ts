import type { API, FileInfo, Options } from "jscodeshift";
export default function transform(
	file: FileInfo,
	api: API,
	options?: Options,
): string | undefined {
	const j = api.jscodeshift;
	const root = j(file.source);

	// Helper function to preserve comments
	function replaceWithComments(path, newNode) {
		// If the original node had comments, add them to the new node
		if (path.node.comments) {
			newNode.comments = path.node.comments;
		}

		// Replace the node
		j(path).replaceWith(newNode);
	}

	// Find JSX elements with ref attribute
	root
		// Find JSX elements with a ref attribute
		.find(j.JSXElement)
		.forEach((path) => {
			// Get the ref name
			const refName = path.node.openingElement.attributes.find(
				(attr) => attr?.name?.name === "ref",
			)?.value?.value;
			
			if (typeof refName !== "string") {
				return;
			}

			// Create new ref attribute
			const newRefAttr = j.jsxAttribute(
				j.jsxIdentifier("ref"),
				j.jsxExpressionContainer(
					j.arrowFunctionExpression(
						[j.jsxIdentifier("ref")],
						j.blockStatement([
							j.expressionStatement(
								j.assignmentExpression(
									"=",
									j.memberExpression(
										j.memberExpression(
											j.thisExpression(),
											j.identifier("refs"),
										),
										j.identifier(refName),
									),
									j.identifier("ref"),
								),
							),
						]),
					),
				),
			);

			// Replace old ref attribute with new one
			const newAttributes = path.node.openingElement.attributes.map((attr) =>
				attr?.name?.name === "ref" ? newRefAttr : attr,
			);
			const newOpeningElement = j.jsxOpeningElement(
				path.node.openingElement.name,
				newAttributes,
				path.node.openingElement.selfClosing,
			);
			const newElement = j.jsxElement(
				newOpeningElement,
				path.node.closingElement,
				path.node.children,
				path.node.selfClosing,
			);

			// Replace old element with new one, preserving comments
			replaceWithComments(path, newElement);
		});

	return root.toSource();
}
