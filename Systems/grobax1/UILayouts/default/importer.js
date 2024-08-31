import App from './components.js';

export default function render( sys ,textData, container ){
	const app = new App({
		target: container,
		props: {
			textData:textData,
			sys:sys
		}
	});
	return app;
}