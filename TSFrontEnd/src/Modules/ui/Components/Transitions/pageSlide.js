import { cubicOut , 	elasticInOut} from 'svelte/easing';
 

export function pageSlide(node, params) {

	const rect = node.getBoundingClientRect();
	const height	= rect.height;
	const width		= rect.width;
	return {
		delay: params.delay || 0,
		duration: params.duration || 400,
		easing: params.easing || cubicOut,
		css: (t, u) => `
			height:${height}px;
			width:${width}px;
			position:absolute;
			transform-origin: top;
			transform: translateX(${u*width}px);
			`
	};
}