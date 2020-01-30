    //  <!-- focus username field in login mask -->
      $('#timaat-login-modal').on('shown.bs.modal', function() {
        $('#timaat-login-user').focus();
      });

    // <!-- client side form validation -->
      var mediumFormMetadata = $("#timaat-mediadatasets-media-metadata-form");
      var mediumFormMetadataValidator = $("#timaat-mediadatasets-media-metadata-form").validate({
        rules: {
          displayTitle: {
            required: true,
            minlength: 3,
            maxlength: 200
          },
          displayTitleLanguageId: {
            required: true,
          },
          typeId: {
            required: true,
          },
          // releaseDate: {
          //   dateISO: true,
          // },
          // sourceLastAccessed: {
          //   dateISO: true,
          // },
          // length: {

          // },
          width: {
            number: true,
            max: 65535
          },
          height: {
            number: true,
            max: 65535
          },
          bitDepth: {
            number: true,
            max: 65535
          },
          frameRate: {
            number: true,
            max: 65535
          },
          dataRate: {
            number: true,
            max: 65535
          },
          totalBitrate: {
            number: true,
            max: 65535
          }       
        },
        messages: {
          displayTitle: {
            required: "Enter a title (min length: 3)",
            minlength: "Title too short: min length is 3",
            maxlength: "Title is too long: max length is 200"
          },
          displayTitleLanguageId: {
            required: "Please provide the title's language"
          },
          typeId: {
            required: "Please provide the type of the medium"
          },
          // releaseDate: {
          //   dateISO: "Please provide a valid date"
          // },
          // sourceLastAccessed: {
          //   dateISO: "Please provide a valid date"
          // },
          // length: {

          // },
          width: {
            number: "Please provide a valid number",
            max: "Please provide a value not greater 65535"
          },
          height: {
            number: "Please provide a valid number",
            max: "Please provide a value not greater 65535"
          },
          bitDepth: {
            number: "Please provide a valid number",
            max: "Please provide a value not greater 65535"
          },
          frameRate: {
            number: "Please provide a valid number",
            max: "Please provide a value not greater 65535"
          },
          dataRate: {
            number: "Please provide a valid number",
            max: "Please provide a value not greater 65535"
          },
          totalBitrate: {
            number: "Please provide a valid number",
            max: "Please provide a value not greater 65535"
          }
        },
        submitHandler: function(mediumFormMetadata) {
          mediumFormMetadata.submit();
        },
      });
      var mediumFormTitles = $("#timaat-mediadatasets-medium-titles-form");
      var mediumFormTitlesValidator = $("#timaat-mediadatasets-medium-titles-form").validate({
        rules: {
          title: {
            required: true,
            minlength: 3,
            maxlength: 200,
          },
          titleLanguageId: {
            required: true,
          },
        },
        submitHandler: function(mediumFormTitles) {
          mediumFormTitles.submit();
        },
      });
      var mediumFormLanguageTracks = $("#timaat-mediadatasets-medium-languagetracks-form");
      var mediumFormLanguageTracksValidator = $("#timaat-mediadatasets-medium-languagetracks-form").validate({
        rules: {
          languageTrackTypeId: {
            required: true,
          },
          languageTrackLanguageId: {
            required: true,
          },
        },
        submitHandler: function(mediumFormLanguageTracks) {
          mediumFormLanguageTracks.submit();
        },
      });
      var actorFormMetadata = $("#timaat-actordatasets-actor-metadata-form");
      var actorFormMetadataValidator = $("#timaat-actordatasets-actor-metadata-form").validate({
        rules: {
          displayName: {
            required: true,
            minlength: 3,
            maxlength: 200
          },
          typeId: {
            required: true,
          }     
        },
        messages: {
          displayName: {
            required: "Enter a name (min length: 3)",
            minlength: "Name too short: min length is 3",
            maxlength: "Name is too long: max length is 200"
          },
          typeId: {
            required: "Please provide the type of the actor"
          }
        },
        submitHandler: function(actorFormMetadata) {
          actorFormMetadata.submit();
        },
      });
      var actorFormNames = $("#timaat-mediadatasets-actor-names-form");
      var actorFormNamesValidator = $("#timaat-mediadatasets-actor-names-form").validate({
        rules: {
          name: {
            required: true,
            minlength: 3,
            maxlength: 200,
          },
        },
        submitHandler: function(actorFormNames) {
          actorFormNames.submit();
        },
      });

      function allocateArray(strOrArr) {
    		var arr = strOrArr instanceof Uint8Array || strOrArr instanceof Array ? strOrArr : Module.intArrayFromString(strOrArr);
    		return Module.allocate(arr, 'i8', Module.ALLOC_NORMAL);
    	}



      console.log("TIMAAT::HTML Scripts loaded");