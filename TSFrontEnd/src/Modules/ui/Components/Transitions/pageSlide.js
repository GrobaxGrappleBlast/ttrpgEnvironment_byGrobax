import { cubicOut , 	elasticInOut} from 'svelte/easing';
import { tick } from 'svelte';

export function pageSlide(node, params) {

	const rect = node.getBoundingClientRect();
	const height	= rect.height;
	const width		= rect.width;
	const parent = params.parent;
	/*	
	const parent = params.parent;
	const pHeight = parseFloat(getComputedStyle(parent).height.replace('px',''));
	const nHeight = parseFloat(getComputedStyle(node).height.replace('px',''));
	const dHeight = (nHeight - pHeight) / 100;

	console.log(pHeight,nHeight,dHeight)
	*/
	setTimeout(
		() => {
			parent.removeAttribute('style')  
		},
		params.duration || 400 
	)  
	parent.style.display = "grid";
	parent.style.gridTemplateRows = '1fr';
	parent.style.gridTemplateColumns = '1fr';

	return {
		delay: params.delay || 0,
		duration: params.duration || 400,
		easing: params.easing || cubicOut,
		css: (t, u) =>{ 
			const height = node.scrollHeight; // Get height of the content
			return `   
			height:${height * t}px;
			width:${width}px; 
			transform-origin: top;
			transform: translateX(${u*width}px) scaleY(${t});
			`
			}
	};
}