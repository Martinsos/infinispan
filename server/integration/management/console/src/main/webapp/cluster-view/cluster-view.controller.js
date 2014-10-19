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

      var jobsInProgress = 0;
      var jobStarted = function() {
        jobsInProgress += 1;
      };
      var jobEnded = function() {
        jobsInProgress -= 1;
        if (jobsInProgress === 0) {
          $scope.$digest();
        }
      };
      // Fetch all clusters and their caches.
      api.getClusters(function(clusters) {
        $scope.clusters = clusters;
        $scope.currentCluster = clusters[0];
        console.log(clusters);
        angular.forEach(clusters, function(cluster) {
          jobStarted();
          cluster.refresh(function(cluster) {
            // Refresh caches.
            var caches = cluster.getCaches();
            angular.forEach(caches, function(cache) {
              jobStarted();
              cache.refresh(function() {
                jobEnded();
              });
            });
            jobEnded();
          });
        });
      });
  }]);