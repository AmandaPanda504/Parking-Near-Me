
      
      let mapElement
      let autocompleteElement
      let username;
      let key;
      let infowindow
      let map;
      let service
      const markers = {};

      
      $(function () {
        mapElement = document.getElementById('map');
        autocompleteElement = document.getElementById('address');
        $('#submit').on('click', display )

      })

      function initialize() {
        const autocomplete = new google.maps.places.Autocomplete(autocompleteElement, {
           
          types: ['(cities)'|'(address)'|'(establishment)'], componentRestrictions:{
              country:['us']
          }
          
        });
         
        map = new google.maps.Map(mapElement, {
            center: myLocation,
            zoom: 25,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        infowindow = new google.maps.InfoWindow();
      }
    
      
      function display() {
        $('.message').addClass("hidden");
        const address = $(autocompleteElement).val();
        let selLocLat;
        let selLocLng;
    
        let geocoder = new google.maps.Geocoder()
        
        geocoder.geocode({'address': address}, function(results, status) {
          if (status !== 'OK') {
             return alert('Geocode was not successful for the following reason: ' + status);
          }
            
          selLocLat = results[0].geometry.location.lat();
          selLocLng = results[0].geometry.location.lng();
          
    
          const myLocation = new google.maps.LatLng(selLocLat, selLocLng);
    
          map = new google.maps.Map(mapElement, {
            center: myLocation,
            zoom: 8
          });
    
          const request = {
            openNow: false,
            location: myLocation,
            radius: '7000',
            type: ['parking'] ,   
          };

          service = new google.maps.places.PlacesService(map);
          service.nearbySearch(request, callback);
        
        });
      }
     
      function callback(results, status) {
         for (let i = 0; i < results.length; i++) {
            let result = results[i]
            let request = {
              placeId: result.place_id,
              fields: ['formatted_phone_number','place_id', 'opening_hours']
            };
            service.getDetails(request, function (result, details) {
              result.opening_hours = {}
              if (details && details.opening_hours) {
                result.opening_hours = details.opening_hours
              }
              createMarker(result, result.icon);
              $('.list').append(`<li>${listingHtml(result)}</li>`)
              
            }.bind(null, result));
          }
           $('.list').on('click', 'h1', function (e) {
            const id = e.currentTarget.getAttribute('data-id')
            showMarker(id);
            document.querySelector('.map').scrollIntoView();

          })
      }
      
      
      function listingHtml(result) {

        var photoRef;
        let hours = ''
        let today = new Date().getDay()
        let opening_hours = result.opening_hours
        
        if (opening_hours && opening_hours.weekday_text && opening_hours.weekday_text[today - 1]) {
          hours = '<br /><span>' + result.opening_hours.weekday_text[today - 1]+ '</span>'
        }
        return `
          <h1 data-id="${result.place_id}">${result.name} </h1>
          <p>${result.vicinity}${hours}</p>
        `
      }

      function createMarker(place, icon) {

        var photos = place.photos;
        if (!photos) {
          return;
        }

        const placeLoc = place.geometry.location;
      
        const marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            icon: photos[0].getUrl({maxWidth: 35, maxHeight: 35}),
            
            
          });
         
          google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(listingHtml(place))
            infowindow.open(map, this);
          });
        
          markers[place.place_id] = marker;
      }
       
      function showMarker (index){
        google.maps.event.trigger(markers[index], 'click');
      }


      /*
      Once the icon for the location is clicked, it can show the route to
      get there

      filters that show ratings  (see rating , minPriceLevel and maxPriceLevel)
       */