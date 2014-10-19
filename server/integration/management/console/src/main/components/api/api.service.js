'use strict';

angular.module('managementConsole.api')
  /**
   * Main service in the api module.
   */
  .factory('api', [
    'ModelController',
    'DomainModel',
    function (ModelController, DomainModel) {

      var dmrClient = new ModelController('http://localhost:3000/management', 'admin', '!qazxsw2');

      var domain = new DomainModel(dmrClient);

      /**
       * Fetches all clusters, but in order to get more data you need to refresh them manually.
       * @param callback([ClusterModel]) Callback whose first param is list of clusters.
       */
      var getClustersShallow = function(callback) {
        domain.refresh(function(d) {
          callback(d.getClusters());
        });
      };


      /**
       * Fetches all clusters and all their data, including all nodes and caches.
       * @param callback([ClusterModel]) Callback whose first param is list of clusters.
       */
      var getClustersDeep = function(callback) {
        var clusters = undefined;

        var jobsInProgress = 0;
        var jobStarted = function() {
          jobsInProgress += 1;
        };
        var jobEnded = function() {
          jobsInProgress -= 1;
          if (jobsInProgress === 0) {
            // TODO(martinsos): Although it should not happen,
            // it is theoretically possible that callback will be called multiple times.
            callback(clusters);
          }
        };

        domain.refresh(function(domain) {
          clusters = domain.getClusters();
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
      };

      return {
        getClustersShallow: getClustersShallow,
        getClustersDeep: getClustersDeep
      };
    }
  ]);