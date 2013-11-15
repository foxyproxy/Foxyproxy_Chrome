	(function( $ ) {
		$.widget( "ui.combobox", {
			input: null,
			options: {
			 editable: false,
			 value: null
		   },
			_create: function() {
				var self = this,
					select = this.element.hide(),
					selected = select.children( ":selected" ),
					value = this.options.value?this.options.value:(selected.val() ? selected.text():"");
				this.input = $( "<input>" )
					.insertAfter( select )
					.val( value )
					.autocomplete({
						delay: 0,
						minLength: 0,
						source: function( request, response ) {
							var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
							response( select.children( "option" ).map(function() {
								var text = $( this ).text();
								if ( this.value && ( !request.term || matcher.test(text) ) )
									return {
										label: text,
										value: text,
										option: this
									};
							}) );
						},
						select: function( event, ui ) {
							ui.item.option.selected = true;
							self._trigger( "selected", event, {
								item: ui.item.option
							});
						},
						change: function( event, ui ) {
							if ( !ui.item ) {
								var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( $(this).val() ) + "$", "i" ),
									valid = false;
								select.children( "option" ).each(function() {
									if ( this.value.match( matcher ) ) {
										this.selected = valid = true;
										return false;
									}
								});
								if ( !valid ) {
									// remove invalid value, as it didn't match anything
									if(!self.options.editable){
										$( this ).val( self.options.value );
										select.val( $(this).val() );
									}
									return false;
								}
							}
						}
					})
					.addClass( "tbui-widget tbui-widget-content tbui-corner-left" );

				this.input.data( "autocomplete" )._renderItem = function( ul, item ) {
					return $( "<li></li>" )
						.data( "item.autocomplete", item )
						.append( "<a>" + item.label + "</a>" )
						.appendTo( ul );
				};

				$( "<button>&nbsp;</button>" )
					.attr( "tabIndex", -1 )
					.attr( "title", "Show All Items" )
					.insertAfter( this.input )
					.button({
						icons: {
							primary: "tbui-icon-triangle-1-s"
						},
						text: false
					})
					.removeClass( "tbui-corner-all" )
					.addClass( "tbui-corner-right tbui-button-icon" )
					.click(function() {
						// close if already visible
						if ( self.input.autocomplete( "widget" ).is( ":visible" ) ) {
							self.input.autocomplete( "close" );
							return;
						}

						// pass empty string as value to search for, displaying all results
						self.input.autocomplete( "search", "" );
						self.input.focus();
					});
			},
			value: function() {
			 return this.input.val();
		   }
		});
	})( jQuery );