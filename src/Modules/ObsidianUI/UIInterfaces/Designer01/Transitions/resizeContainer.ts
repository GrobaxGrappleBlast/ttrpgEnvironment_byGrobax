export function resizeContainer(node) {
	function getHeight( item : HTMLElement ){
		return  item.offsetHeight > item.scrollHeight ? item.offsetHeight : item.scrollHeight;
	}

	async function updateHeight() {
		await new Promise(resolve => setTimeout(resolve, 50));
  
		const childrenHeight = [...node.children].reduce((acc, item) => acc + getHeight(item) , 0);
		node.style.setProperty('height', `${childrenHeight}px`);
	}
	
	const observer = new MutationObserver((mutations) => {
		updateHeight()
	});
		//attributes:true ,
	observer.observe(node, { attributes:true , characterData: true, subtree: true, childList: true });

	updateHeight();
	node.style.setProperty('overflow', 'hidden');
	node.style.setProperty('transition', 'height 150ms linear');

	return {
		destroy() {
			observer?.disconnect();
		},
	};
}

export function resizeContainer2(node) {
	function getHeight( item : HTMLElement ){ 
		const box = item.getBoundingClientRect();
		return  box.height;
	}

	async function updateHeight() {
		await new Promise(resolve => setTimeout(resolve, 50));
		const childrenHeight = [...node.children].reduce((acc, item) => acc + getHeight(item) , 0);
		 
		console.log('2');
		node.style.setProperty('height', `${childrenHeight}px`);
	}
	
	const observer = new MutationObserver((mutations) => {
		updateHeight()
	});
		//attributes:true ,
	observer.observe(node, { childList: true , attributeFilter: ['style']});

	updateHeight();
	node.style.setProperty('overflow', 'hidden');
	node.style.setProperty('transition', 'height 150ms linear');

	return {
		destroy() {
			observer?.disconnect();
		},
	};
}

export function transitionHeigt(node : HTMLElement) {
	  
	function start(node: HTMLElement) {

		const computedStyle = window.getComputedStyle(node);
		const height = computedStyle.height;
	
		console.log('start',height);
	  }
	
	  function end(node: HTMLElement) {
		// Get the computed height of the element after the animation
		const computedStyle = window.getComputedStyle(node);
		const height = computedStyle.height;
	
		console.log('end', height);
	  }
	

	node.addEventListener('animationstart'	, () =>start(node)	);
    node.addEventListener('animationend'	, () =>end	(node)	); 

	return {
		destroy() {
			node.removeEventListener('animationstart'	, () =>start(node)	);
   		 	node.removeEventListener('animationend'		, () =>end	(node)	);
		},
	};
}

export function resizeContainerFirstChild(node) {

	function getHeight( item : HTMLElement ){
		return  item.offsetHeight > item.scrollHeight ? item.offsetHeight : item.scrollHeight;
	}


	async function updateHeight() {
		
		await new Promise(resolve => setTimeout(resolve, 50));
		
		const height = getHeight(node.children)
		//const childrenHeight = [...node.children]
		//	.reduce((acc, item) => acc + getHeight(item) , 0);
		
		//console.log('recalc height --> ' + childrenHeight);
		node.style.setProperty('height', `${height}px`);
	}
	
	const observer = new MutationObserver((mutations) => {
			updateHeight()
		});
		//attributes:true ,
	observer.observe(node, { attributes:true , characterData: true, subtree: true, childList: true });

	updateHeight();
		
		node.style.setProperty('overflow', 'hidden');
		node.style.setProperty('transition', 'height 150ms linear');

	return {
		destroy() {
		observer?.disconnect();
		},
	};
}

 