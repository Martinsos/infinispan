package org.infinispan.client.hotrod;

import org.infinispan.Cache;
import org.infinispan.manager.CacheManager;
import org.infinispan.server.hotrod.HotRodServer;
import org.infinispan.test.SingleCacheManagerTest;
import org.infinispan.test.fwk.TestCacheManagerFactory;
import org.infinispan.util.logging.Log;
import org.infinispan.util.logging.LogFactory;
import org.testng.annotations.AfterClass;
import org.testng.annotations.Test;

import java.util.Properties;

/**
 * @author Mircea.Markus@jboss.com
 * @since 4.1
 */
@Test
public class ServerRestartTest extends SingleCacheManagerTest {

   private static Log log = LogFactory.getLog(HotRodIntegrationTest.class);

   RemoteCache defaultRemote;
   private RemoteCacheManager remoteCacheManager;

   protected HotRodServer hotrodServer;


   @Override
   protected CacheManager createCacheManager() throws Exception {
      cacheManager = TestCacheManagerFactory.createLocalCacheManager();
      cacheManager.getCache();


      hotrodServer = TestHelper.startHotRodServer(cacheManager);
      log.info("Started server on port: " + hotrodServer.getPort());

      Properties config = new Properties();
      config.put("hotrod-servers", "127.0.0.1:" + hotrodServer.getPort());
      config.put("timeBetweenEvictionRunsMillis", "2000");      
      remoteCacheManager = new RemoteCacheManager(config);
      defaultRemote = remoteCacheManager.getCache();
      return cacheManager;
   }


   @AfterClass
   public void testDestroyRemoteCacheFactory() {
      remoteCacheManager.stop();
      hotrodServer.stop();
   }

   public void testServerShutdown() throws Exception {
      defaultRemote.put("k","v");
      assert defaultRemote.get("k").equals("v");

      int port = hotrodServer.getPort();
      hotrodServer.stop();
      hotrodServer.start("localhost", port, cacheManager, 2, 2, 20000);

      Thread.sleep(3000);

      assert defaultRemote.get("k").equals("v");
      defaultRemote.put("k","v");
   }
}
