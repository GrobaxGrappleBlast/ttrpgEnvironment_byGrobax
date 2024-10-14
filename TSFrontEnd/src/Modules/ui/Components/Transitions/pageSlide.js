import { cubicOut , 	elasticInOut} from 'svelte/easing';
 

export function pageSlide(node, params) {
	return {
		delay: params.delay || 0,
		duration: params.duration || 400,
		easing: params.easing || cubicOut,
		css: (t, u) => `
			
			transform-origin: top;
			transform: translateX(${u*100}%);
			height:${t}px`
	};
}