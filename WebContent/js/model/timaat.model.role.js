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

  TIMAAT.Role = class Role {
    constructor(model) {
      // console.log("TCL: Role -> constructor -> model", model);
			// setup model
			this.model = model;

			// create and style list view element
			this.listView = $(
				`<li class="list-group-item">
					<div class="row">
						<div class="col-lg-10">` +
							`<span class="roleListName">
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

			// $('#roleList').append(this.listView);
			// console.log("TCL: Role -> constructor -> this.updateUI()");
			var role = this; // save role for system events

			this.updateUI();

			// attach role handlers
			$(this.listView).on('click', this, function(ev) {
				// console.log("TCL: Role -> constructor -> open role dataSheet");
				ev.stopPropagation();
				// show tag editor - trigger popup
				TIMAAT.UI.hidePopups();
				$('.form').hide();
				$('.rolesNavTabs').show();
				$('.rolesDataTabs').hide();
				$('.nav-tabs a[href="#roleDataSheet"]').tab('show');
				$('#roleFormMetadata').data('role', role);
				TIMAAT.RoleLists.roleFormDataSheet('show', 'role', role);
			});
    }

		updateUI() {
			// console.log("TCL: Role -> updateUI -> this.model", this.model);
			var name = this.model.roleTranslations[0].name;
			if ( this.model.id < 0 ) name = "[not assigned]";
			this.listView.find('.roleListName').text(name);

		}

		remove() {
			// remove role from UI
			this.listView.remove();
      // console.log("TCL: Role -> remove -> this", this);
			$('#roleFormMetadata').data('role', null);
			// remove from roles list
			var index;
			for (var i = 0; i < TIMAAT.RoleLists.roles.length; i++) {
				if (TIMAAT.RoleLists.roles[i].model.id == this.model.id) {
					index = i;
					break;
				}
			}
			if (index > -1) {
				TIMAAT.RoleLists.roles.splice(index, 1);
				TIMAAT.RoleLists.roles.model.splice(index, 1);
			}
			// remove from role groups list
      var roleGroupIndex;
      for (var i = 0; i < TIMAAT.RoleLists.roleGroups.length; i++) {
        if (TIMAAT.RoleLists.roleGroups[i].model.id == this.model.id) {
          roleGroupIndex = i;
          break;
        }
      }
      if (roleGroupIndex > -1) {
        TIMAAT.RoleLists.roleGroups.splice(roleGroupIndex, 1);
        TIMAAT.RoleLists.roleGroups.model.splice(roleGroupIndex, 1);
      }
		}
  }

}, window));