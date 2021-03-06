(function(angular) {
    'use strict';

    function MirrorCtrl(AnnyangService, WeatherService, $scope, $timeout, $interval, $location) {
        var _this = this;
		var DEFAULT_COMMAND_TEXT = 'Says "Mirror" to see all commands';
		
		$scope.listening = false;
        $scope.focus = "default";
        $scope.user = {};
        $scope.interimResult = DEFAULT_COMMAND_TEXT;
		
		
		function navigatePage(url){
			if (url == "home") $location.path("/");
			else if (url == "weather") $location.path("/"+url);
			else if (url == null) $location.path("/");
		}

        // Reset the command text
        var restCommand = function(){
          $scope.finalResult = DEFAULT_COMMAND_TEXT;
		  $scope.interimResult = '';
        }
		
		// Reset to Home page
        var defaultView = function() {
            $scope.focus = "default";
			navigatePage("home");
        }
		
		
		 
         _this.init = function() {
            var tick = $interval(updateTime, 1000);
            updateTime();
 			fetchWeather("Singapore");
            restCommand();

             // List commands
 			AnnyangService.addCommand('Mirror (*args)', function(args) {
 				if (args == undefined) $scope.finalResult = "Mirror";
 				$scope.focus = "commands";
 			});
			
 			AnnyangService.addCommand('Go home', defaultView);
 			AnnyangService.addCommand('Exit', defaultView);
            
			
			AnnyangService.addCommand('My (name is)(name\'s) *name', function(name) {
                 $scope.focus = "default";
                 $scope.user.name = name;
 				getGreeting($scope.date.getHours());
            });
			
			
            AnnyangService.addCommand('weather', function() {
 				$scope.focus = "default";
 				fetchWeather("Singapore");
                 navigatePage("weather");
            });
            AnnyangService.addCommand('weather (in)(at) *city', function(cityName) {
 				fetchWeather(cityName);
                 navigatePage("weather");
            });
			

			//Track when the Annyang is listening to us
            var resetCommandTimeout;
             
            AnnyangService.start(
 			function(listening){
                 $scope.listening = listening;
             }, 
 			function(interimResult){
 				$scope.isTalking = true;
 				$scope.interimResult = interimResult;
 				$scope.finalResult = ''; 
				$timeout.cancel(resetCommandTimeout);
             },
 			function(result){
 				$scope.isTalking = false;
 				$scope.finalResult = '\"'+ result[0] + '\" is invalid command.';
 				$scope.interimResult = '';
				resetCommandTimeout = $timeout(restCommand, 5000);
             },
 			function(resultMatch){
 				$scope.isTalking = false;
 				$scope.finalResult = resultMatch;
				resetCommandTimeout = $timeout(restCommand, 5000);
             });
         };
		 

		
		
		
		
		/**** HOME functions ****/
		
        function updateTime(){
            $scope.date = new Date();
			getGreeting($scope.date.getHours());
        }
		
		
		function getGreeting(hour){
			if (hour < 12) $scope.greeting = 'Good morning';
			else if (hour >= 12 && hour <= 17) $scope.greeting = 'Good afternoon';
			else if (hour > 17 && hour <= 24) $scope.greeting = 'Good evening';
			
			if ($scope.user.name != null) $scope.greeting += ', ' + $scope.user.name;
		}

		/***** End of Home Page functions ******/
		
		
		
		/******* WEATHER functions *******/
		function fetchWeather(cityName) {
  	    	WeatherService.getWeather(cityName).then(function(data){
  	      		$scope.place = data;
				$scope.todayWeatherIcon = WeatherService.setWeatherIcon(data.item.condition.code);
				$scope.day1Icon = WeatherService.setWeatherIcon(data.item.forecast[1].code);
				$scope.day2Icon = WeatherService.setWeatherIcon(data.item.forecast[2].code);
				$scope.day3Icon = WeatherService.setWeatherIcon(data.item.forecast[3].code);
				$scope.day4Icon = WeatherService.setWeatherIcon(data.item.forecast[4].code);
  	    	});
		}
		
		/** End of WEATHER functions **/
		
		_this.init();
    }

    angular.module('SmartMirror')
        .controller('MirrorCtrl', MirrorCtrl);

}(window.angular));
