'use strict';

var myApp = angular.module('myApp', [
  'ngRoute',
  'ngAnimate',
  'ui.bootstrap',
  'ngSanitize'
]);


/* ----------------- CONFIG ------------------ */

/**
 * Define Angular Routes for app
 */
myApp.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');
  // $locationProvider.html5mode(true);

  $routeProvider
  
    .when('/home', {
      templateUrl: 'templates/home.html',
      controller: 'homeCtrl'
    })

    .otherwise({
      redirectTo: '/home'
    });

}]);


/* ----------------- SERVICES ------------------ */

/**
 * API Service - calls to external API's handled through this interface
 * 
 * @module ApiService
 * @param {Object} $http - AngularJS http object
 * @param {Object} $q - AngularJS promise provider
 *
 */
myApp.factory('ApiService', function($http, $q, $timeout) {

  // Make a GET request to the API endpoint
  var get = function(params) {
    var defer = $q.defer(),
      query = params.query || 'cars';
    $http.get('/api/' + query + '.json')
      .success(function(resp) {
        // Simulate network delay on api request
        $timeout(function() {
          defer.resolve(resp);
        }, 1000);
      }).error(function(err) {
        // test
        defer.reject("Error retrieving " + query + " - response got was " + err.status + ":" + err.data);
      });
    return defer.promise;
  };


  // Make a POST request to the API endpoint
  var post = function(params) {
    var defer = $q.defer(),
      query = params.query || 'cars';
    $http.post('/api/' + query + '.json', params.payload)
      .success(function(resp) {
        // Simulate network delay on api request
        $timeout(function() {
          defer.resolve(resp);
        }, 3000);
      }).error(function(err) {
        // test
        defer.reject("Error retrieving " + query + " - response got was " + err.status + ":" + err.data);
      });
    return defer.promise;
  };

  return {
    get: get,
    post: post
  }
});


/**
 * Search Result Service - class-like service to share data
 * 
 * @module SearchResultService
 *
 */
myApp.factory('SearchResultService', function($q, $interval) {

  var data = {};

  var get = function() {
     // need to periodically check here for data before resolving
     // TODO: use $broadcast to notify listeners

  };

  var set = function(data) {
     this.data = data; 
  };

  return {
    get: get,
    set: set 
  }

});

/* ----------------- CONTROLLERS ------------------ */

/**
 * Root Controller for handling root based logic
 * 
 * @module rootCtrl
 * @param {Object} $scope - AngularJS scope provider
 *
 */
myApp.controller('rootCtrl', function($scope) {
  // declare root level scope variables
  $scope.loading = true;
  $scope.max = 3;
  $scope.value = 1;
});


/**
 * Home Controller - typically the welcome page 
 * 
 * @module rootCtrl
 * @param {Object} $scope - AngularJS scope provider
 * @param {Object} ApiService - API service provider 
 *
 */
myApp.controller('homeCtrl', function($scope, ApiService) {
  $scope.searchResultParams = null;

  $scope.updateSearchParams = function(data) {
    $scope.searchResultParams = data;
    $scope.$broadcast('searchParamsUpdated');
    $scope.$parent.loading = false;
  };

  $scope.startSearch = function(sortParams) {
    $scope.$parent.loading = true;
    $scope.$broadcast("newSearch",sortParams);
  };

});

/**
 * SortControls Controller - allows sorting of resultBlocks !!scope communication!!
 * 
 * @module sortControlsCtrl
 * @param {Object} $scope - AngularJS scope provider
 *
 */
myApp.controller('sortControlsCtrl', function($scope) {

  $scope.labels = {
    title: "Reservo Car"
  };

  // get options from parent
  $scope.sort = {
    sortBy: function(param) {
      $scope.sort.sorted = param;
      $scope.$parent.startSearch({sortKey:param.value,order:$scope.sort.ordered, type: param.type});
    },
    setOrder: function(param) {
      $scope.sort.ordered = param;
      $scope.$parent.startSearch({sortKey:$scope.sort.sorted.value,order:param, type: $scope.sort.sorted.type});
    },
    options: [
      {
        key: 'Price',
        value: 'TotalCharge.@RateTotalAmount',
        type: 'int'
      },
      {
        key: 'Fuel Type',
        value: 'Vehicle.@FuelType',
        type: 'str'
      },
      {
        key: 'Doors',
        value: 'Vehicle.@DoorCount',
        type: 'str'
      },
      {
        key: 'Baggage Quantity',
        value: 'Vehicle.@BaggageQuantity',
        type: 'int'
      }
    ],
    orders: [
      'DESC',
      'ASC'
    ],
    sorted: {
      key: "Price",
      value: 'TotalCharge.@RateTotalAmount',
      type: 'int'
    },
    ordered: "DESC"
  };

  // default

  $scope.toggled = function(open) {
    // 
    console.log('Dropdown is now: ', open);
  };

  $scope.toggleDropdown = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
  };



});


/**
 * Header Controller - displays search criteria returned from JSON
 * 
 * @module headerCtrl
 * @param {Object} $scope - AngularJS scope provider
 *
 */
myApp.controller('headerCtrl', function($scope, SearchResultService) {
  // data provided by xhr call - has to go to parent to find it
  // transform date/time userfriendly

  // model 
  $scope.model = {
    data: null,
    pickUpLocations: [
      {
        id: 0,
        name: 'Paris Beauvais - Airport'
      },
      {
        id: 1,
        name: 'London Heathrow - Airport'
      },
      {
        id: 2,
        name: 'Madrid Carajas - Airport'
      }
    ],
    dropOffLocations: [
      {
        id: 0,
        name: 'Paris Beauvais - Airport'
      },
      {
        id: 1,
        name: 'London Heathrow - Airport'
      },
      {
        id: 2,
        name: 'Madrid Carajas - Airport'
      }
    ]
  };

  // template strings
  $scope.labels = {
    title: "Reservation Details",
    panels: {
      pickUp: {
        title: "Pick Up",
        location: "Location:",
        date: "Date:",
        time: "Time:"
      },
      dropOff: {
        title: "Drop Off",
        location: "Location:",
        date: "Date:",
        time: "Time:"
      }
    }
  };

  // UI dropdown options
  $scope.dropDown = {
    pickUp: {
      isOpen: false,
      open: function() {
        $scope.dropDown.pickUp.isOpen = true;
      }
    },
    dropOff: {
      isOpen: false,
      open: function() {
        $scope.dropDown.dropOff.isOpen = true;
      }
    }
  };

  // UI datePickerPopUp options
  $scope.datePickerPopUp = {
    options: {
      dateDisabled: function(data) {
        return data.mode == 'day' && (data.date.getDay() === 0 || data.date.getDay() === 6);
      },
      formatYear: 'yy',
      maxDate: new Date(2020, 5, 22),
      minDate: new Date(),
      startingDay: 1
    },
    pickUp: {
      format: 'dd-MMMM-yyyy',
      isOpen: false,
      closeText: "Close",
      open: function() {
        $scope.datePickerPopUp.pickUp.isOpen = true;
      },
      altInputFormats: ['M!/d!/yyyy']
    },
    dropOff: {
      format: 'dd-MMMM-yyyy',
      isOpen: false,
      closeText: "Close",
      open: function() {
        $scope.datePickerPopUp.dropOff.isOpen = true;
      },
      altInputFormats: ['M!/d!/yyyy']
    }
  };

  // UI timePicker options
  $scope.timePicker = {
    pickUp: {
      changed: function() {
        console.log("time changed: ");
      }
    },
    dropOff: {
      changed: function() {
        console.log("time changed: ");
      }
    }
  };


  // Wait for searchParamsUpdated event then update model
  $scope.$on('searchParamsUpdated', function(evt) {
    $scope.model.data = evt.targetScope.searchResultParams;
  });

});


/**
 * Results Controller - displays results returned from JSON
 * 
 * @module resultsCtrl
 * @param {Object} $scope - AngularJS scope provider
 *
 */
myApp.controller('resultsCtrl', function($scope, $rootScope, ApiService, SearchResultService, $filter) {

  // model
  $scope.model = {
    results: [],
    cdn: 'https://cdn.cartrawler.com'
  };

  // template strings
  $scope.labels = {
    title: "Awaiting search results...",
    postTitle: "Your search returned {0} result{1}",
    vehicleProps: [
      {'@AirConditionInd':"AirCon"},
      {'@BaggageQuantity':"Baggage"},
      // {'@Code':"Code"},
      // {'@CodeContext':"Code Context"},
      {'@DoorCount':"Doors"},
      // {'@DriveType':"Drive"},
      {'@FuelType':"Fuel"},
      {'@PassengerQuantity':"Seats"},
      {'@TransmissionType':"Transmission"}
    ]
  };

  /**
   * replaceStringVars - update variables in string with passed args
   * @param {String} str - A string with variables in '{n}' notation starting from '{0}'
   * @param {String} - unnamed args follow with vars to replace 
   */
  $scope.replaceStringVars = function(str) {
    if(arguments.length > 1) {
      for(var i=1; i < arguments.length; i++) {
        str = str.replace(new RegExp('\\{'+(i-1)+'\\}', 'g'), arguments[i]);
      }
      // if no matches for args found, just remove them from string
      str = str.replace(new RegExp('\\{[0-9]+\\}', 'g'), '');
    }
    return str;
  };

  /**
    * sortDataSet - sort array of objects based on a nested property
    */
  $scope.sortDataSet = function(arr, prop, type, desc) {
    type = type === 'int' ? function(val) { return parseInt(val); } : function(val) { return val };
    desc = desc === 'DESC';
    prop = prop.split('.');
    arr.sort(function (a, b) {
      a = type(a[prop[0]][prop[1]]);
      b = type(b[prop[0]][prop[1]]);
      if(a < b) {
        return -1;
      } else if (a > b) {
        return 1;
      } else {
        return 0;
      }
    });
    
    if(!desc) {
      arr.reverse();
    }

    return arr;
  };

  /**
   * Main init - fetch JSON and parse
   */
  $scope.init = function(sortProps) {

    // if we are provided with props use them, otherwise default
    sortProps = sortProps || {sortKey: 'TotalCharge.@RateTotalAmount', order: 'DESC', type: 'int'};

    // query ApiService with an known entity
    ApiService.get({query: 'cars'}).then(function(resp) {

      // implode resp array to object
      var data = resp.length ? resp[resp.length-1] : resp;

      if(data.VehAvailRSCore.VehVendorAvails.length > 0) {

        // reset results
        $scope.model.results.length = 0;

        var pickUpDate = new Date(data.VehAvailRSCore.VehRentalCore['@PickUpDateTime']),
          dropOffDate = new Date(data.VehAvailRSCore.VehRentalCore['@ReturnDateTime']);

        $scope.$parent.updateSearchParams({
          "PickUpDateTime": pickUpDate,
          "PickUpDate": pickUpDate,
          "PickUpTime": pickUpDate,
          "PickUpLocation": data.VehAvailRSCore.VehRentalCore.PickUpLocation['@Name'],
          "ReturnDateTime": data.VehAvailRSCore.VehRentalCore['@ReturnDateTime'],
          "ReturnDateTime": dropOffDate,
          "ReturnDate": dropOffDate,
          "ReturnTime": dropOffDate,
          "ReturnLocation": data.VehAvailRSCore.VehRentalCore.ReturnLocation['@Name']
        });

        // Iterate through structure of response
        angular.forEach(data.VehAvailRSCore.VehVendorAvails, function(value, key) {

          //Iterate through nested Vehicles array
          value.VehAvails.forEach(function(e,i,a) {

            // Merge into ng-repeat-able data structure
            var tuple = Object.assign({
              vendorName: $filter('lowercase')(value.Vendor['@Name']),
              vendorCode: value.Vendor['@Code'],
              vendorImage: $filter('mapSymbol')(value.Vendor['@Name'].toLowerCase())
            },e);

            // push onto results stack
            this.push(tuple);

          }, this);

        }, $scope.model.results);

        // sort array on price by default
        $scope.model.results = $scope.sortDataSet($scope.model.results, sortProps.sortKey, sortProps.type, sortProps.order);

        // update title label with search results
        $scope.labels.title = $scope.replaceStringVars($scope.labels.postTitle, $scope.model.results.length-1, $scope.model.results.length > 1 ? 's' : '');
      }
    },function(resp) {
      // Ordinarily an network exception would trigger an error state that we'd handle appropriately 
      console.log("Request failed: ", resp);
    });

  };


  // when this event is broadcast, perform new search 
  $scope.$on('newSearch', function(evt, props) {
    // Ordinarily, we wouldn't trigger another network request for data
    $scope.init(props);
  });

  // kick off search
  $scope.init();

});

/* ----------------- DIRECTIVES ------------------ */

/**
 * Directive loadingWidget - shows a loading graphic
 */

myApp.directive('loadingWidget', function() {
  return {
    restrict: "E",
    priority: 999,
    scope: true,
    replace: true,
    link: function(scope) {
      // simulate results being fetched - update value in scope iteratively
      scope.value = 2;
    },
    templateUrl: 'templates/loadingWidget.html'
  }
});


/* ----------------- FILTERS ------------------ */

/**
 * Filter wrapInnerTextWithTag - take some input, match a substring and wrap it in a html tag
 */
myApp.filter('wrapInnerTextWithTag', function() {
  return function(text,wrapText,tag) {
    if (typeof text === 'undefined') {
      return '';
    }
    var textSplit = new RegExp('^(.+ )(' + wrapText + ')$').exec(text);
    text = textSplit.length ? textSplit[1] + '<' + tag + '>' + textSplit[2] + '</' + tag + '>' : text;
    return text;
  };
});

/**
 * Filter mapSymbol- convert some expected strings to icons and such
 */
 myApp.filter('mapSymbol', function() {
  return function(text) {
    var symbols = {
      'true': '<span class="glyphicon glyphicon-ok"></span>',
      'false': '<span class="glyphicon glyphicon-remove"></span>',
      'avis': '/otaimages/vendor/large/AVIS.jpg',
      'alamo': '/otaimages/vendor/large/ALAMO.jpg',
      'hertz': '/otaimages/vendor/large/HERTZ.jpg',
      'CAD': '&#36;'
    };
    return symbols.hasOwnProperty(text) ? symbols[text] : text;
  };
 });

/**
 * Filter trust - Use ngSanitize to allow rendering of html by filter
 */
myApp.filter('trust', ['$sce', function($sce) {
  return function(value) {
    return $sce.trustAs('html',value);
  }
}]);

