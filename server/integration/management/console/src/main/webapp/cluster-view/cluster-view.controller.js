'use strict';

angular.module('managementConsole')
  .controller('ClusterViewCtrl', [
    '$scope',
    'api',
    function ($scope, api) {
      $scope.shared = {
        currentCollection: 'caches'
      };
      $scope.clusters = undefined;
      $scope.currentCluster = undefined;

      // Fetch all clusters and their caches.
      api.getClustersDeep(function(clusters) {
        $scope.$apply(function() {
          $scope.clusters = clusters;
          $scope.currentCluster = clusters[0];
        });
      });
  }]);