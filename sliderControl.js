var SCONTROL = (function() {
    var ControlMode = {
        AUTO: 1,
        MOVE: 2,
        MOVE_WITH_INDEX: 3,
        STOP: 4
    },

    CallbackRes = {
        CALLBACK_FINISHED: 1,
        MOVE: 2
    },

    IndexObject = {

        settings: {
            indexLength: 0,
            index: 0,
            offset: 0
        },

        init: function( length ) {
            IndexObject.settings.indexLength = length - 1;
        },

        incrementIndex: function() {
            var s = IndexObject.settings;
            s.index++;
            if ( s.index > s.indexLength )
                s.index = 0;
        },

        decrementIndex: function() {
            var s = IndexObject.settings;
            s.index--;
            if (s.index < 0)
                s.index = s.indexLength;
        },

        updateIndex: function( next ) {
            if ( next == "next" )
                IndexObject.incrementIndex();
            else
                IndexObject.decrementIndex();
        },

        getIndex: function() {
            return IndexObject.settings.index;
        },

        getOffset: function( value ) {
            var s = IndexObject.settings;
            if ( value < 0 || value > s.indexLength )
                s.offset = 0;
            else
                s.offset = Math.abs( s.index - value );
            return s.offset;
        }
    },

    MoveState = {
        state: "SLIDER_MOVE",

        setMoveState: function( state ) {
            MoveState.state = state;
        },

        checkMoveState: function( state ) {
            return MoveState.state == state;
        }
    },

    Control = {

        settings: {
            moveParams: {
                next: "next"
            },
            autoMode: false,
            renderList: null,
            offset: 0,
            interval: 0,
            intervalSet: 0,
            state: "SLIDER_FREE",
            autoState: "STOPPED"
        },

        init: function( renderList, autoMode, interval ) {
            Control.settings.renderList = renderList;
            Control.settings.autoMode = autoMode;
            Control.settings.interval = interval;
            if ( Control.settings.autoMode )
                Control.startSlider( "next", ControlMode.AUTO, Control.settings.interval );
        },

        moveSlide: function( direction ) {
            var s = Control.settings;
            if ( s.offset > 1 ) {
                MoveState.setMoveState( "SLIDER_SKIP" );
                s.offset--;
            } else {
                MoveState.setMoveState( "SLIDER_MOVE" );
            }
            s.moveParams.next = direction;
            IndexObject.updateIndex( s.moveParams.next );
            s.state = "SLIDER_BUSY";
            /* Allow some time for the sliding to take affect. */
            setTimeout((function( renderList ) {
                return function() {
                    renderList.forEach(function( renderElement ) {
                        renderElement.render();
                    });
                }
            })( s.renderList ), 10);
        },

        startSlider: function( direction, moveDesicion, index ) {
            var s = Control.settings;
            if ( s.state == "SLIDER_BUSY")
                return;

            if ( moveDesicion == ControlMode.MOVE_WITH_INDEX ) {
                if ( index != undefined ) {
                    s.offset = IndexObject.getOffset( index );
                }
                Control.stopSlider();
                Control.moveSlide( direction );
            } else if ( moveDesicion == ControlMode.AUTO ) {
                s.intervalSet =
                    setInterval((function( context ) {
                        return function() {
                            context.moveSlide( "next" );
                        }
                    })( Control ), s.interval);
                s.autoState = "STARTED";
            } else if ( moveDesicion == ControlMode.MOVE_CLICK ) {
                s.offset = 0;
                Control.stopSlider();
                Control.moveSlide( direction );
            } else {
                Control.stopSlider();
            }
        },

        notify: function( message, args ) {
            var s = Control.settings;
            if ( message == CallbackRes.CALLBACK_FINISHED ) {
                s.state = "SLIDER_FREE";
                if ( s.autoState == "STOPPED" && s.autoMode )
                    Control.startSlider( "next", ControlMode.AUTO );
            }
            else if ( message == CallbackRes.MOVE )
                Control.moveSlide( args );
        },

        stopSlider: function() {
            var s = Control.settings;
            if ( s.autoMode  && s.autoState == "STARTED") {
                clearInterval( s.intervalSet );
                s.autoState = "STOPPED";
            }
        },

        getMoveParams: function() {
            return Control.settings.moveParams;
        }
    },

    init = function( controlConfig ) {
        IndexObject.init( controlConfig.length );
        Control.init( controlConfig.renderList,
                      controlConfig.autoMode,
                      controlConfig.interval );
    };

    return {
        init: init,
        getIndex: IndexObject.getIndex,
        getOffset: IndexObject.getOffset,
        checkMoveState: MoveState.checkMoveState,
        notify: Control.notify,
        startSlider: Control.startSlider,
        getMoveParams: Control.getMoveParams,
        ControlMode: ControlMode,
        CallbackRes: CallbackRes
    };
})();