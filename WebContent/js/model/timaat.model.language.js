/*
 Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
 */

/**
 * @author Mirko Scherf <mscherf@uni-mainz.de>
 */
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

	TIMAAT.Language = class Language {
    constructor(model) {
      // console.log("TCL: Language -> constructor -> model", model);
			// setup model
			this.model = model;

			// create and style list view element
			this.listView = $(
				`<li class="list-group-item">
					<div class="row">
						<div class="col-lg-10">` +
							`<span class="languageListName">
							</span>
						</div>
						<div class="col-lg-2 float-right">
						  <div class="btn-group-vertical">
								<div class="text-muted timaat__user-log">
									<i class="fas fa-user"></i>
								</div>
						  </div>
						</div>
					</div>
				</li>`
			);

			// $('#languageList').append(this.listView);
			// console.log("TCL: Language -> constructor -> this.updateUI()");
			var language = this; // save language for system events

			this.updateUI();

			// attach language handlers
			$(this.listView).on('click', this, function(ev) {
				// console.log("TCL: Language -> constructor -> open language dataSheet");
				ev.stopPropagation();
				// show tag editor - trigger popup
				TIMAAT.UI.hidePopups();
				$('.form').hide();
				$('.languagesNavTabs').show();
				$('.languagesDataTabs').hide();
				$('.nav-tabs a[href="#languageDataSheet"]').tab('show');
				$('#languageFormMetadata').data('language', language);
				TIMAAT.LanguageLists.languageFormDataSheet('show', language);
			});
    }

		updateUI() {
			var name = this.model.name;
			if ( this.model.id < 0 ) name = "[not assigned]";
			this.listView.find('.languageListName').text(name);

		}

		remove() {
			// remove language from UI
			this.listView.remove();
      // console.log("TCL: Language -> remove -> this", this);
			$('#languageFormMetadata').data('language', null);
			// remove from language set lists
			var index;
			for (var i = 0; i < TIMAAT.LanguageLists.languages.length; i++) {
				if (TIMAAT.LanguageLists.languages[i].model.id == this.model.id) {
					index = i;
					break;
				}
			}
			if (index > -1) {
				TIMAAT.LanguageLists.languages.splice(index, 1);
				TIMAAT.LanguageLists.languages.model.splice(index, 1);
			}
		}
	}

}, window));
