/*
 * Create moving rules and configuration for vertical slider
 * slider:    main object which containes basic configuration
 */
function getVertical( config ) {
	return {
    	elCssValue: config.height,
    	elCssProperty: 'top',
    	elCssMoveProp: config.useCssThree ? config.cssPrefix + '-transform':'top',
        elCssDefaultMove: config.useCssThree ? 'translateY(0px)':'0px',
    	elMoveNext: config.useCssThree ? 'translateY(-' + config.height + 'px)':{top:'-' + config.height + 'px'},
        elMovePrev: config.useCssThree ? 'translateY(' + config.height + 'px)':{top:config.height + 'px'}
    }
}

/*
 * Create moving rules and configuration for horizontal slider
 * slider:    main object which containes basic configuration
 */
function getHorizontal( config ) {
	return {
    	elCssValue: config.width,
    	elCssProperty: 'left',
    	elCssMoveProp: config.useCssThree ? config.cssPrefix + '-transform':'left',
        elCssDefaultMove: config.useCssThree ? 'translateX(0px)':'0px',
    	elMoveNext: config.useCssThree ? 'translateX(-' + config.width + 'px)':{left:'-' + config.width + 'px'},
        elMovePrev: config.useCssThree ? 'translateX(' + config.width + 'px)':{left:config.width + 'px'}
    }
}

/*
* Create the corresponding slider based on the option value
* slider:    main object which containes basic configuration
*/
function getSlider( sliderType, config ) {
    if ( sliderType == "vertical" )
        return getVertical( config );
    else
        return getHorizontal( config );
}

function SliderMain( jQObject, config ) {
	this.jQObject = jQObject;
	this.elCssMoveConfig = getSlider( config.sliderType, config );
	this.skipAnim = config.skipAnim;
	this.moveAnim = config.moveAnim;
	this.callbackList = config.callbackList;
	this.cssDefault = {};
	this.cssDefault[ this.elCssMoveConfig.elCssProperty ] = this.elCssMoveConfig.elCssDefaultMove;
	this.slide = (function( useCssThree, context ) {
		if ( useCssThree )
			return context.slideWithCss;
		else
			return context.slideWithjQuery;
	})( config.useCssThree, this );
}

SliderMain.prototype.slideWithjQuery = function( moveParams ) {
    var moveObject = moveParams.next == "next" ? this.elCssMoveConfig.elMoveNext :
                                                 this.elCssMoveConfig.elMovePrev,
        skipObject = MoveState.checkMoveState( "SLIDER_SKIP" ) ? this.skipAnim : this.moveAnim;

    this.jQObject.animate(moveObject, skipObject, (function(params, context) {
        return function() {
            context.moveCallback( params );
        }
    })( moveParams, this ));
}

SliderMain.prototype.moveCallback = function( event ) {
	var params = event.data || event;

	this.removeCssClass( this.cssClass );
	this.setDefaultCss();
	this.updateElementOrder();

	if ( MoveState.checkMoveState( "SLIDER_SKIP" ) )
		Control.notify( CallbackRes.MOVE , params.next );
	else {
		this.callbackList.forEach( function( callback, index ) {
			callback();
		});
		Control.notify( CallbackRes.CALLBACK_FINISHED );
	}
}

SliderMain.prototype.slideWithCss = function( moveParams ) {

}

SliderMain.prototype.setDefaultCss = function() {
	this.jQObject.css( this.cssDefault );
}

SliderMain.prototype.removeCssClass = function( cssClass ) {
	this.jQObject.removeClass( cssClass );
}

SliderMain.prototype.updateElementOrder = function() {
	var array, cssValue = this.elCssMoveConfig.elCssValue,
	    cssProperty = this.elCssMoveConfig.elCssProperty, cssObject = {};
	array = SliderElement.getArrayFromMatrix( IndexObject.getIndex() );
	/* We have to call children here since it's
	 * updated every time a slide is made.
	 */
	this.jQObject.children().each(function( index, element ) {
		cssObject[ cssProperty ] = (array[ index ] * cssValue) + 'px';
		$( element ).css(cssObject);
	});
}