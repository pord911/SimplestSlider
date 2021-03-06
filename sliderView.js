/**
 * Create a permutation matrix.
 * @param length  Length of elements
 */
function initMatrix( length ) {
    var array = new Array( length ), i, temp = [];

    for ( i = 0; i < length; i++ ) {
        array[ i ] = new Array( length );
        temp[ i ] = ( i == length - 1 ) ? -1 : i;
    }

    /*
     * Create permutated matrix. I.e.
     * |  0,  1,  2, -1 |
     * | -1,  0,  1,  2 |
     * |  2, -1,  0,  1 |
     * |  1,  2, -1,  0 |
     */
    array[ 0 ] = temp.slice();
    for ( i = 1; i < length; i++ ) {
        /* Put last element at first place */
        temp.splice( 0, 0, temp.pop() );
        array[ i ] = temp.slice();
    }

    return array;
}

var SliderElement = {

    settings: {
        elementListCss: {
            display: 'block',
            position: 'relative',
            "list-style": 'none'
        },
        elementCss: {
            position: 'absolute'
        },
        slideObject: null
    },

    init: function( jQObject, slideObject, config ) {
        var s = this.settings;

        s.elementListCss.width = config.widthStr;
        s.elementListCss.height = config.heightStr;
        s.elementCss.width = config.widthStr;
        s.elementCss.height = config.heightStr;
        s.slideObject = slideObject;
        this.jQObject = jQObject;
        this.matrix = initMatrix( config.elListLength );
        this.setContainer( config.widthStr, config.heightStr, config.sliderElementContainer );
        this.setWraper( config.widthStr, config.heightStr, config.wraperClass );
        this.setElementCss( config.option, config.width, config.height );
        this.createSlider();
    },

    setContainer: function( width, height, containerClass ) {
        this.jQObject.wrap("<div class='" + containerClass + "''></div>");
        this.jQObject.parent().css( { width: width, height: height } );
    },

    setWraper: function( width, height, wraperClass ) {
        /* Wraper needs to be created here since jQuery
         * needs to have container as a parent in it's
         * object. In order for the pager_box addition
         * to take effect. */
        this.jQObject.parent().wrap( "<div class='" + wraperClass + "'></div>" );
        this.jQObject.parent().parent().css( { width: width, height: height } );
    },

    setElementCss: function( option, width, height ) {
        if ( option == "horizontal" ) {
            this.position = 'left';
            this.value = width;
        } else if ( option == "vertical" ) {
            this.position = 'top';
            this.value = height;
        }
    },

    createSlider: function() {
        var elementCssObject = {}, context = this,
            children = this.jQObject.children(),
            s = this.settings;

        this.jQObject.css( s.elementListCss );
        children.css( s.elementCss );
        children.each( function( index ) {
            elementCssObject[ context.position ] = context.matrix[ 0 ][ index ] * context.value;
            $( this ).css( elementCssObject );
        } );
    },

    render: function() {
        var s = this.settings;
        s.slideObject.slide( SCONTROL.getMoveParams() );
    },

    getArrayFromMatrix: function( index ) {
        return this.matrix[ index ];
    },

    onMouseEnterEvent: function() {
        this.jQObject.parent().on("mouseenter", function() {
            SCONTROL.notify( "", SCONTROL.ControlMode.MOUSE_ENTER );
        });
    },

    onMouseLeaveEvent: function( control ) {
        this.jQObject.parent().on("mouseleave", function() {
            SCONTROL.notify( "next", SCONTROL.ControlMode.MOUSE_LEAVE );
        });
    }
};


var PagerElement = {
    settings: {
        pagerHtml: '<div class="pager_box"></div>',
        wraperHtml: '<div class="wraper"></div>'
    },

    /* TODO: Add configuration parameter for multiple types of pager */
    init: function( jQObject, length ) {
        this.sliderContainer = jQObject.parent();
        this.length = length;
        this.pager = $( this.settings.pagerHtml );
        this.createPager();
    },

    createPager: function() {
        var s = this.settings, pagerElement = '', i;
            pagerb = $( '<div class="pager_box"></div>' ),
            wraper = this.sliderContainer.parent();


        /* Append needs a jQuery object here in order 
         * for pagers parentElement to get set to wraper
         * I do not know why is this needed. Otherwise,
         * this.pager.append( pagerElement ) won't work. */
        wraper.append( this.pager );

        for ( i = 0; i < this.length; i++ ) {
            pagerElement += '<div class="pager_item"><a href="#" slide_index="'+ i +'"></a></div>';
        }

        this.pager.append( pagerElement );
        this.pager.find( 'a' ).first().addClass( 'active' );
        this.pagerLinks = this.pager.find( 'a' );
    },

    render: function() {
        this.pagerLinks.removeClass( 'active' );
        this.pagerLinks.each(function() {
            if (parseInt($(this).attr( 'slide_index' )) == SCONTROL.getIndex())
                $(this).addClass( 'active' );
        });
    },

    /* TODO: Add registerEvents function which will create all events */
    onPagerClick: function() {
        this.pager.find( 'a' ).on( "click", (function( context ) {
            return function( event ) {
                context.pagerClicked( event );
            }
        })( this ) );
    },

    pagerClicked: function( event ) {
        var triggeredElement = $( event.target ), direction,
            clickIndex = parseInt( triggeredElement.attr( "slide_index" ) );
        if ( clickIndex > SCONTROL.getIndex() )
            direction = "next";
        else
            direction = "prev";
        this.render( clickIndex );
        SCONTROL.notify( direction, SCONTROL.ControlMode.MOVE_WITH_INDEX, clickIndex );
    }
};

var ArrowElement = {
    settings: {

    },

    init: function( jQObject, config ) {
        this.sliderContainer = jQObject.parent();
        this.settings.next = $( '<img src="' + config.rightArrowImage +  '" class="' + config.righwArrowClass + '"/>'  );
        this.settings.prev = $( '<img src="' + config.leftArrowImage +  '" class="' + config.leftArrowClass + '"/>'  );
        this.createArrow();
    },

    createArrow: function() {
        this.sliderContainer.append( this.settings.next );
        this.sliderContainer.append( this.settings.prev );
    },

    onRightClick: function() {
        this.settings.next.on( "click", function() {
            SCONTROL.notify( "next", SCONTROL.ControlMode.MOVE );
        } );
    },

    onLeftClick: function() {
        this.settings.prev.on( "click", function() {
            SCONTROL.notify( "prev", SCONTROL.ControlMode.MOVE );
        } );
    }
};
