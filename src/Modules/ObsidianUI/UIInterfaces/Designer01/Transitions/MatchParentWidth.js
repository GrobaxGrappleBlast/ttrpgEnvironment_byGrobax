import { writable } from 'svelte/store';

export function matchParentWidth(node, levelsAbove = 1) {

	function updateWidth() {		

		let parent = node.parentElement;
		for (let i = 1; i < levelsAbove; i++) {
			parent = parent.parentElement
		}

		const parentWidth = parent.clientWidth; 
		node.style.setProperty('width',parentWidth + 'px') 

	}

	const observer = new MutationObserver(mutations => {
		updateWidth();
	});

	observer.observe(node, { characterData: true  });
	updateWidth();

	return { 
		destroy() {
			observer.disconnect();
		},
	};
}
