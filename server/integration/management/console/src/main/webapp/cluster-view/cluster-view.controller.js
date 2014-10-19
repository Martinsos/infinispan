'use strict';

angular.module('managementConsole')
  .controller('ClusterViewCtrl', [
    '$scope',
    'api',
    function ($scope, api) {
      $scope.shared = {
        currentCollection: 'nodes'
      };

      api.getClusters(function(clusters) {
        $scope.$apply(function() {
          $scope.clusters = clusters;
          console.log(clusters);
        });
      });
  }]);