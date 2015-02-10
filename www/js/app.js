// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var olssonCalculator = angular.module('olssonCalculator', ['ionic'])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

var keyboardShouldBeShown = false;
olssonCalculator.directive('input', function($timeout, $window){
  /*
  angular.element($window).bind('scroll', function(){
       element[0].blur();
  });*/ 
    return {
        restrict: 'E',
        scope: {},
        link: function(scope, element, attr){
        
            element.bind('focus', function(e){
              $timeout(function(){
                keyboardShouldBeShown = true;
               if(!cordova.plugins.Keyboard.isVisible){      
                  cordova.plugins.Keyboard.show();
                  console.log('show');
                }
              },30);          
            });

            element.bind('blur', function(e){
              keyboardShouldBeShown = false
              $timeout(function(){
                  if(!keyboardShouldBeShown){
                    cordova.plugins.Keyboard.close();
                    console.log('hide');
                  }
                },70);        
            });

            angular.element($window).bind('scroll', function(){
              element.blur();
            });

            element.bind('keydown', function(e){
                if(e.which === 13 || e.keyCode === 13){
                  element[0].blur();
                } 
            });   
        }
    }
});

olssonCalculator.controller('calculatorCtrl', ['$scope','$timeout', '$window', function($scope, $timeout, $window){



  $scope.classification = '';
  $scope.def = 'breeder'; //default constant

  $scope.constant = {
    breeder: {
      competitor:{
        title: 'Loose Lick',
        carveRate: 70,
        total:null,
        gramsPerHeadDry:260,
        gramsPerHeadWet:150,
        cost:0.8,
        defaultLabour: 0.07,
        labourCost:null,
        labourManuallyChanged: false
      },
      olssons:{
        carveRate: 80,
        total:null,
        defaultLabour: 0.05,
        gramsPerHeadDry:175,
        gramsPerHeadWet:90,
        cost:1.1,
        labourCost:null,
        labourManuallyChanged: false
      },
      seasonDuration:{
        wet: 140,
        dry: 140
      },
      salePrice : 400
    },
    grower: {
      competitor:{
        title: 'Loose Lick',
        carveRate: 70,
        total:null,
        defaultLabour: 0.07,
        gramsPerHeadDry:260,
        gramsPerHeadWet:150,
        cost:0.8,
        labourCost:null,
        labourManuallyChanged: false
      },
      olssons:{
        carveRate: 80,
        total:null,
        defaultLabour: 0.05,
        gramsPerHeadDry:175,
        gramsPerHeadWet:90,
        cost:1.1,
        labourCost:null,
        labourManuallyChanged: false
      },
      seasonDuration:{
        wet: 140,
        dry: 140
      },
      salePrice : 400
    },
    finisher: {
      competitor:{
        title:'Liquid Feeding',
        total:null,
        defaultLabour: 0,
        gramsPerHeadDry:700,
        liveWeightGain: 150,
        cost:0.65,
        labourCost:null,
        labourManuallyChanged: false,
      },
      olssons:{
        total:null,
        defaultLabour: 0.14,
        gramsPerHeadDry:300,
        liveWeightGain: 300,
        cost:1.1,
        labourCost:null,
        labourManuallyChanged: false
      },
      seasonDuration:{
        dry: 100
      },
      salePrice: 2.15
    }
  };
  var constantObjCopy = JSON.parse(JSON.stringify($scope.constant));
  $scope.calfEarnings = null;
  $scope.extraBeef = {
    kg: null,
    money: null
  }

  $scope.resetApp = function(){
    $scope.constant = JSON.parse(JSON.stringify(constantObjCopy));
  }

  $scope.manualChange = function(type){
    $scope.constant[$scope.classification || $scope.def][type].labourManuallyChanged = true;
  }

  var adjustLabour = function(type, classificationType){
    if(typeof $scope.constant.totalCattle === 'number' && !$scope.constant[classificationType][type].labourManuallyChanged){

      $scope.constant[classificationType][type].labourCost = ($scope.constant[classificationType][type].defaultLabour * $scope.constant.totalCattle); 
      $scope.constant[classificationType][type].labourCost = ($scope.constant[classificationType][type].labourCost < 10) ? Math.ceil($scope.constant[classificationType][type].labourCost) : Math.round($scope.constant[classificationType][type].labourCost);
    } else if(typeof $scope.constant.totalCattle !== 'number') {
      $scope.constant[classificationType][type].labourCost = 0;
    }
  }

  var calfSavings = function(type, classificationType){
    if(typeof $scope.constant[classificationType].competitor.carveRate === 'number' && typeof $scope.constant[classificationType].olssons.carveRate === 'number' && typeof $scope.constant[classificationType].salePrice === 'number' && typeof $scope.constant.totalCattle === 'number'){

      $scope.calfEarnings = (($scope.constant[classificationType].olssons.carveRate-$scope.constant[classificationType].competitor.carveRate)/100) * $scope.constant.totalCattle * $scope.constant[classificationType].salePrice;
    } else {
      $scope.calfEarnings = null;
    }
  }

  var extraBeef = function(type, classificationType){
    if(typeof $scope.constant[classificationType].competitor.liveWeightGain === 'number' && typeof $scope.constant[classificationType].olssons.liveWeightGain === 'number' && typeof $scope.constant[classificationType].salePrice === 'number' && typeof $scope.constant.totalCattle === 'number'){
      var kgGain = ($scope.constant[classificationType].olssons.liveWeightGain - $scope.constant[classificationType].competitor.liveWeightGain) * $scope.constant.totalCattle * ($scope.constant[classificationType].seasonDuration.dry || 0)/1000;
      $scope.extraBeef = {
        kg : kgGain,
        money: kgGain * $scope.constant[classificationType].salePrice
      };
    } else {
      $scope.extraBeef = {
        kg : null,
        money: null
      };
    }
  }

   var feedingSavings = function(type, classificationType){
    if(typeof $scope.constant.totalCattle === 'number' && (typeof $scope.constant[classificationType][type].gramsPerHeadDry === 'number' || $scope.constant[classificationType][type].gramsPerHeadWet === 'number') && (typeof $scope.constant[classificationType].seasonDuration.wet === 'number' || typeof $scope.constant[classificationType].seasonDuration.dry === 'number')){


      $scope.constant[classificationType].seasonDuration.dry = ($scope.constant[classificationType].seasonDuration.dry >= 0) ? $scope.constant[classificationType].seasonDuration.dry : null;
      $scope.constant[classificationType].seasonDuration.wet = ($scope.constant[classificationType].seasonDuration.wet >= 0) ? $scope.constant[classificationType].seasonDuration.wet : null;
      $scope.constant[classificationType][type].gramsPerHeadDry = ($scope.constant[classificationType][type].gramsPerHeadDry >= 0) ? $scope.constant[classificationType][type].gramsPerHeadDry : null;
      $scope.constant[classificationType][type].gramsPerHeadWet = ($scope.constant[classificationType][type].gramsPerHeadWet >= 0) ? $scope.constant[classificationType][type].gramsPerHeadWet : null;
      var feedCostDry = $scope.constant.totalCattle*($scope.constant[classificationType][type].gramsPerHeadDry/1000)*$scope.constant[classificationType][type].cost;
      var feedCostWet = $scope.constant.totalCattle*($scope.constant[classificationType][type].gramsPerHeadWet/1000)*$scope.constant[classificationType][type].cost;

      var totalFeedCostDry = feedCostDry*$scope.constant[classificationType].seasonDuration.dry || 0;
      var totalFeedCostWet = feedCostWet*$scope.constant[classificationType].seasonDuration.wet || 0;

      var totalLabourCost = (($scope.constant[classificationType][type].labourCost || 0)/7) * ($scope.constant[classificationType].seasonDuration.dry+$scope.constant[classificationType].seasonDuration.wet) || 0;

      $scope.constant[classificationType][type].total = (totalFeedCostDry + totalFeedCostWet + totalLabourCost);
    } else if($scope.constant[classificationType][type].total !== null) {
      $scope.constant[classificationType][type].total = null;
    }
  }

  var assignValues = function(type){
    $timeout(function(){

    var classificationType = $scope.classification || $scope.def;

  //determine labour cost automatically
  adjustLabour(type, classificationType);
  
  //determine calf savings
  if(classificationType === 'breeder'){
    calfSavings(type, classificationType);
  }

  if(classificationType === 'finisher'){
    extraBeef(type, classificationType);
  }

  //determine feedings savings
  feedingSavings(type, classificationType);
    }, 20);
  }

  $scope.$watch('constant', function(){
    assignValues('competitor');
    assignValues('olssons');
  }, true);

  $scope.$watch('classification', function(){
    assignValues('competitor');
    assignValues('olssons');
  })


}]);
