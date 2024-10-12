
import { cubicOut , 	elasticInOut} from 'svelte/easing';
import { slide } from 'svelte/transition';
 
export function selectSlide(node , params , isInTransition = false ) {
    
    
    var container = params.container;
    var button = params.button;

    // if the position is absolute then we just use normal slide. for it is the stile for phones.
    const a = getComputedStyle(node).position == 'fixed';
    if(a || !container ){
        // if this is not used we reset the styles we are dependent on.
        node.style.transform = '';
        node.style.maxHeight = '';

        console.log('nospecial transition');
        return slide( node, params );
    }
    
    var existingTransform;
    var transformOrigin ;
    if ( isInTransition ){
        // get bounds of the screen
        const mrect = container .getBoundingClientRect();
        const lrect = node     .getBoundingClientRect(); 
    
        const measureBeneathBottom  = lrect.bottom - mrect.bottom;
        const beneathBottom = measureBeneathBottom > 0;
        
        const measureAboveTop = -1 * ( lrect.top - lrect.height) + mrect.top;
        const aboveTop = measureAboveTop > 0;

        var goUp;
        if (beneathBottom && aboveTop){ 
            if( measureAboveTop <  measureBeneathBottom){
                goUp=true;
            }
            else{
                goUp=false;
            }  
        }
        else if (beneathBottom){ 
            goUp=true;
        } else { 
            goUp=false;
        }

        var maxHeight;
        if(goUp){
            maxHeight = measureAboveTop > 0 ? lrect.height - measureAboveTop : null;
        }
        else{
            maxHeight = measureBeneathBottom > 0 ? lrect.height - measureBeneathBottom : null;
        }
        if(maxHeight){
            node.style.maxHeight = maxHeight;
        }

        // if there is a max height. then apply it.
        if(maxHeight){
            node.style.maxHeight = maxHeight;
        }

        // if we are going up then we are translating the item upwards
        var height = maxHeight ?? lrect.height;
        height = goUp ? (height * -1) : 0;
        const transform  = `translateY(${height}px) translateY(${(button.getBoundingClientRect().height) * (goUp ? -1 : 0) - (goUp ? 20 : 0 ) }px) `; ;
        node.style.transform = transform;
        node.style.width = button.getBoundingClientRect().width + 'px';

        transformOrigin = goUp ? 'bottom left' : 'top left';
        existingTransform = getComputedStyle(node).transform.replace('none', '');
    }else{
        transformOrigin = getComputedStyle(node).transformOrigin;
        existingTransform = getComputedStyle(node).transform.replace('none', '');
    }

    
    return {
        delay       : params.delay      || 0,
        duration    : params.duration   || 400,
        easing      : params.easing     || cubicOut,
        css: (t, u) => `transform-origin: ${transformOrigin}; transform: ${existingTransform}  scaleY(${t}); opacity: ${t};`,
    };

}

async function onFocus(){
    isFocussed = true;  
    
    if(!context){
        return;
    }

    // Wait for dropdown to render
    await tick();

    // get bounds of the screen
    const mrect = context.mainAppContainer.getBoundingClientRect();
    const lrect = label.getBoundingClientRect();
    const drect = endTracker.getBoundingClientRect();
    
    const drectHeight = drect.top - lrect.bottom;
    
    const measureBeneathBottom  = (lrect.bottom + drectHeight) - mrect.bottom;
    const beneathBottom = measureBeneathBottom > 0;
    
    const measureAboveTop = -1 * (( lrect.top - drectHeight) + mrect.top);
    const aboveTop = measureAboveTop > 0;

    if( !(beneathBottom || aboveTop) ){
        popUp.removeAttribute('data-direction');
        return;
    }

    popUp.style.removeProperty('marginTop');
    if (beneathBottom && aboveTop){ 
        // wee select Upwards direction, by chosign the least amount of scrolling
        // upwards is the least measure
        if( measureAboveTop <  measureBeneathBottom){
            
        }
        // downwards is the least measure
        else{

        }  
    }
    // Go upwards if it only goes beneath the bottom
    else if (beneathBottom){ 
        // Go upwards
        popUp.setAttribute('data-direction','up')
        popUp.style.marginTop = `-${drectHeight}px`;
        const maxHeight = drectHeight - measureAboveTop;
        if (maxHeight > 0){ 
            popUp.style.maxHeight = maxHeight + 'px';  
        }else{
            popUp.style.removeProperty('maxHeight');
        }
    } else { 
        // Go downwards
        popUp.setAttribute('data-direction','down')
        popUp.style.maxHeight = drectHeight - measureBeneathBottom + 'px';  
    }
    
    // get location of the bottom Tracker.

    // if the tracker is below the bottom See if it is above the top
    
} 