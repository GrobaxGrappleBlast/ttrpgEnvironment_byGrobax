
import { cubicOut , 	elasticInOut} from 'svelte/easing';
 

export function slidefade(node, params) {
	const existingTransform = getComputedStyle(node).transform.replace('none', '');

	return {
		delay: params.delay || 0,
		duration: params.duration || 400,
		easing: params.easing || cubicOut,
		css: (t, u) => `transform-origin: top left; transform: ${existingTransform} scaleY(${t}); opacity: ${t};`
	};
}
