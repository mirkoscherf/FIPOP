'use strict';
(function (factory, window) {
    /*globals define, module, require*/

    // define an AMD module that relies on 'TIMAAT'
    if (typeof define === 'function' && define.amd) {
        define(['TIMAAT'], factory);


    // define a Common JS module that relies on 'TIMAAT'
    } else if (typeof exports === 'object') {
        module.exports = factory(require('TIMAAT'));
    }

    // attach your plugin to the global 'TIMAAT' variable
    if(typeof window !== 'undefined' && window.TIMAAT){
        factory(window.TIMAAT);
    }

}(function (TIMAAT) {

	TIMAAT.Category = class Category {
    constructor(model) {
      // console.log("TCL: Category -> constructor -> model", model);
			// setup model
			this.model = model;

			// create and style list view element
			this.listView = $(
				`<li class="list-group__item">
					<div class="row">
						<div class="col-lg-10">` +
							`<span class="timaat-categorylists-category-list-name">
							</span>
						</div>
						<div class="col-lg-2 float-right">
						  <div class="btn-group-vertical">
								<div class="text-muted timaat-user-log" style="margin-left: 12px; margin-bottom: 10px;">
									<i class="fas fa-user"></i>
								</div>
						  </div>
						</div>
					</div>
				</li>`
			);

			// $('#timaat-categorylists-category-list').append(this.listView);
			// console.log("TCL: Category -> constructor -> this.updateUI()");
			var category = this; // save category for system events

			this.updateUI();

			// attach category handlers
			$(this.listView).on('click', this, function(ev) {
				// console.log("TCL: Category -> constructor -> open category datasheet");
				ev.stopPropagation();
				// show tag editor - trigger popup
				TIMAAT.UI.hidePopups();
				$('.form').hide();
				$('.categories-nav-tabs').show();
				$('.categories-data-tabs').hide();
				$('.nav-tabs a[href="#categoryDatasheet"]').tab('show');
				$('#category-metadata-form').data('category', category);
        // console.log("TCL: Category -> constructor -> category", category);
				TIMAAT.CategoryLists.categoryOrCategorySetFormDataSheet('show', 'category', category);
			});
    }

		updateUI() {
			var name = this.model.name;
			if ( this.model.id < 0 ) name = "[not assigned]";
			this.listView.find('.timaat-categorylists-category-list-name').text(name);

		}

		remove() {
			// remove category from UI
			this.listView.remove();
      // console.log("TCL: Category -> remove -> this", this);
			$('#category-metadata-form').data('category', null);
			// remove from categoryset lists
			var index;
			for (var i = 0; i < TIMAAT.CategoryLists.categories.length; i++) {
				if (TIMAAT.CategoryLists.categories[i].model.id == this.model.id) {
					index = i;
					break;
				}
			}
			if (index > -1) {
				TIMAAT.CategoryLists.categories.splice(index, 1);
				TIMAAT.CategoryLists.categories.model.splice(index, 1);
			}
			// remove from categories list
      var categorySetIndex;
      for (var i = 0; i < TIMAAT.CategoryLists.categorySets.length; i++) {
        if (TIMAAT.CategoryLists.categorySets[i].model.id == this.model.id) {
          categorySetIndex = i;
          break;
        }
      }
      if (categorySetIndex > -1) {
        TIMAAT.CategoryLists.categorySets.splice(categorySetIndex, 1);
        TIMAAT.CategoryLists.categorySets.model.splice(categorySetIndex, 1);
      }
		}
	}

}, window));
