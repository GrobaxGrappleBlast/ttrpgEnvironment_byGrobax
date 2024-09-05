
import Tooltip from './toolTip.svelte';
export function tooltip(node, { text:text , type = "none", animX = 20, animY = 0, Xoffset = 0, Yoffset = 0 }) {
    
	let tooltipElement;
	let tooltipComponent;

    function showTooltip() {
        tooltipElement = document.createElement('div'); 
        tooltipElement.style.position = 'absolute'; 
        tooltipElement.style.zIndex = '2000';
  
		tooltipComponent = new Tooltip({
            target: tooltipElement,
            props: { text:text , type:type , animX:animX , animY:animY }
        });
		
        document.body.appendChild(tooltipElement);
        const { top, left, width, height } = node.getBoundingClientRect();
        tooltipElement.style.top = `${top + height + window.scrollY + Yoffset}px`;
        tooltipElement.style.left = `${(left + width / 2 - tooltipElement.offsetWidth / 2 + window.scrollX )+ Xoffset}px`;
 
    }

    function hideTooltip() {

		if (tooltipComponent) {
            tooltipComponent.$destroy();
            tooltipComponent = null;
        }

        if (tooltipElement) {
            tooltipElement.remove();
            tooltipElement = null;
        }
    }

    node.addEventListener('mouseenter', showTooltip);
    node.addEventListener('mouseleave', hideTooltip);

    return {
		update( { text:text , type = "none", animX = 20, animY = 0, Xoffset = 0, Yoffset = 0 }) {
            text = newText;
            if (tooltipComponent) {
                tooltipComponent.$set({ text:text , type:type , animX:animX , animY:animY  });
            }
        },
        destroy() {
            node.removeEventListener('mouseenter', showTooltip);
            node.removeEventListener('mouseleave', hideTooltip);
            if (tooltipComponent) {
                tooltipComponent.$destroy();
            } 
        } 
    };
}



/*

export function tooltip(node, { text }) {
    let tooltipComponent;

    function showTooltip() {
        tooltipComponent = new Tooltip({
            target: document.body,
            props: { text }
        });

        const { top, left, width, height } = node.getBoundingClientRect();
        tooltipComponent.$set({
            style: `top: ${top + height + window.scrollY}px; left: ${left + width / 2 + window.scrollX}px;`
        });
    }

    function hideTooltip() {
        if (tooltipComponent) {
            tooltipComponent.$destroy();
            tooltipComponent = null;
        }
    }

    node.addEventListener('mouseenter', showTooltip);
    node.addEventListener('mouseleave', hideTooltip);

    return {
        update({ text: newText }) {
            text = newText;
            if (tooltipComponent) {
                tooltipComponent.$set({ text: newText });
            }
        },
        destroy() {
            node.removeEventListener('mouseenter', showTooltip);
            node.removeEventListener('mouseleave', hideTooltip);
            if (tooltipComponent) {
                tooltipComponent.$destroy();
            }
        }
    };
}*/ 