`UP <index.html>`__ \| `HOME <index.html>`__

Mahout
--------

12.1 简介
~~~~~~~~

| Mahout为推荐引擎提供了一些可扩展的机器学习领域的经典算法实现,
可以使开发人员更为快捷的创建智能应用程序。

12.2 安装
~~~~~~~~

12.2.1 要求
^^^^^^^^^^

| Hadoop集群已经正常启动

12.2.2 配置
^^^^^^^^^^

| 这里选用0.7版本

| 

::

    tar -zxvf mahout-distribution-0.7.tar.gz -C /usr/local/cloud/src/
    cd /usr/local/cloud/
    ln -s -f /usr/local/cloud/src/mahout-distribution-0.7 mahout

12.3 测试
~~~~~~~~

12.3.1 获取测试数据
^^^^^^^^^^^^^^^^^^

| 包含600行60列的一个测试数据

| 

::

    wget http://archive.ics.uci.edu/ml/databases/synthetic_control/synthetic_control.data

12.3.2 上传到Hadoop集群
^^^^^^^^^^^^^^^^^^^^^^

| 

::

    hadoop fs -mkdir testdata
    hadoop fs -put synthetic_control.data testdata

12.3.3 测试各种算法
^^^^^^^^^^^^^^^^^^

| 

::

    cd /usr/local/cloud/mahout/
    # canopy
    hadoop jar mahout-examples-0.7-job.jar org.apache.mahout.clustering.syntheticcontrol.canopy.Job
    # kmeans
    hadoop jar mahout-examples-0.7-job.jar org.apache.mahout.clustering.syntheticcontrol.kmeans.Job

12.4 推荐
~~~~~~~~

12.4.1 协同过滤
^^^^^^^^^^^^^^

-  Taste简介
    Taste 是 Apache Mahout
   提供的一个协同过滤算法的高效实现，它是一个基于 Java
   实现的可扩展的，高效的推荐引擎。Taste
   既实现了最基本的基于用户的和基于内容的推荐算法，同时也提供了扩展接口，使用户可以方便的定义和实现自己的推荐算法。同时，Taste
   不仅仅只适用于 Java 应用程序，它可以作为内部服务器的一个组件以 HTTP
   和 Web Service 的形式向外界提供推荐的逻辑。Taste
   的设计使它能满足企业对推荐引擎在性能、灵活性和可扩展性等方面的要求。

-  Taste原理

   -  系统架构
       |image0|

   -  接口设计

      -  DataModel
          DataModel
         是用户喜好信息的抽象接口，它的具体实现可能来自任意类型的数据源以抽取用户喜好信息。Taste提供了MySQLDataModel，方便用户通过JDBC和MySQL访问数据,
         此外还通过FileDataModel提供了对文件数据源的支持。

   -  UserSimilarity 和 ItemSimilarity
       UserSimilarity
      用于定义两个用户间的相似度，它是基于协同过滤的推荐引擎的核心部分，可以用来计算用户的“邻居”，这里我们将与当前用户口味相似的用户称为他的邻居。ItemSimilarity
      类似的，定义内容之间的相似度。

   -  UserNeighborhood

      用于基于用户相似度的推荐方法中，推荐的内容是基于找到与当前用户喜好相似的“邻居用户”的方式产生的。UserNeighborhood
      定义了确定邻居用户的方法，具体实现一般是基于 UserSimilarity
      计算得到的。

   -  Recommender
       Recommender 是推荐引擎的抽象接口，Taste
      中的核心组件。程序中，为它提供一个DataModel，它可以计算出对不同用户的推荐内容。实际应用中，主要使用它的实现类
      GenericUserBasedRecommender 或者
      GenericItemBasedRecommender，分别实现基于用户相似度的推荐引擎或者基于内容的推荐引擎。

-  Taste演示

   -  下载测试数据
       `http://www.grouplens.org/node/73 <http://www.grouplens.org/node/73>`__

   -  | 拷贝到指定目录

      | 

      ::

          cp ml-1m.zip /usr/local/cloud/mahout/
          cd /usr/local/cloud/mahout/
          unzip ml-1m.zip
          # 电影信息文件 格式为MovieID::MovieName::MovieTags
          cp movies.dat integration/src/main/resources/org/apache/mahout/cf/taste/example/grouplens/
          # 打分信息文件 格式为UserID::MovieID::Rating::Timestamp
          cp ratings.dat integration/src/main/resources/org/apache/mahout/cf/taste/example/grouplens/
          mvn install -DskipTests

   -  | 修改pom文件
      |  添加对mahout-examples的依赖

      | 

      ::

          <dependency>
              <groupId>${project.groupId}</groupId>
              <artifactId>mahout-examples</artifactId>
              <version>0.7</version>
          </dependency>

   -  | 使用jetty进行测试

      | 

      ::

          cd integration
          mvn jetty:run

      | 访问如下地址查看效果
      | 
      `http://hadooptest:8080/mahout-integration/RecommenderServlet?userID=1 <http://hadooptest:8080/mahout-integration/RecommenderServlet?userID=1>`__

   -  | 命令行方式测试

      | 

      ::

          mvn -q exec:java -Dexec.mainClass="org.apache.mahout.cf.taste.example.grouplens.GroupLensRecommenderEvaluatorRunner" -Dexec.args="-i /home/hadoop/cloud/ml-1m/ratings.dat"

-  | Taste示例

   | 

   ::

       // 1. 选择数据源
       // 数据源格式为UserID,MovieID,Ratings
       // 使用文件型数据接口
       DataModel model = new FileDataModel(new File("/Users/matrix/Documents/plan/test/ratings.txt"));

       // 2. 实现相似度算法
       // 使用PearsonCorrelationSimilarity实现UserSimilarity接口, 计算用户的相似度
       // 其中PearsonCorrelationSimilarity是基于皮尔逊相关系数计算相似度的实现类
       // 其它的还包括
       // EuclideanDistanceSimilarity：基于欧几里德距离计算相似度
       // TanimotoCoefficientSimilarity：基于 Tanimoto 系数计算相似度
       // UncerteredCosineSimilarity：计算 Cosine 相似度
       UserSimilarity similarity = new PearsonCorrelationSimilarity(model);
       // 可选项
       similarity.setPreferenceInferrer(new AveragingPreferenceInferrer(model));

       // 3. 选择邻居用户
       // 使用NearestNUserNeighborhood实现UserNeighborhood接口, 选择最相似的三个用户
       // 选择邻居用户可以基于'对每个用户取固定数量N个最近邻居'和'对每个用户基于一定的限制，取落在相似度限制以内的所有用户为邻居'
       // 其中NearestNUserNeighborhood即基于固定数量求最近邻居的实现类
       // 基于相似度限制的实现是ThresholdUserNeighborhood
       UserNeighborhood neighborhood = new NearestNUserNeighborhood(3, similarity, model);

       // 4. 实现推荐引擎
       // 使用GenericUserBasedRecommender实现Recommender接口, 基于用户相似度进行推荐
       Recommender recommender = new GenericUserBasedRecommender(model, neighborhood, similarity);
       Recommender cachingRecommender = new CachingRecommender(recommender);
       List<RecommendedItem> recommendations = cachingRecommender.recommend(1234, 10);

       // 输出推荐结果
       for (RecommendedItem item : recommendations) {
           System.out.println(item.getItemID() + "\t" + item.getValue());
       }

12.4.2 聚类分析
^^^^^^^^^^^^^^

-  框架设计

   针对分组需求，Mahout的聚类算法将对象表示成一种简单的数据模型：向量，然后通过计算各向量间的相似度进行分组。

-  数据模型
    在Mahout中向量(Vector)有多种实现.

   -  DenseVector
       它的实现就是一个浮点数数组, 对向量里所有维度进行存储,
      适合用于存储密集向量。

   -  RandomAccessSparseVector
       基于浮点数的HashMap实现, key是整数类型, value是浮点数类型,
      只存储向量中不为空的值, 并提供随机访问。

   -  SequentialAccessVector
       实现为整数类型和浮点数类型的并行数组, 同样只存储不为空的值,
      但只提供顺序访问

-  数据建模
    Mahout为实现将数据建模成向量, 提供了对数据进行向量化的各种方法。

   -  | 简单的整数类型或浮点型数据
      |  这种数据因为本身就被描述成一个向量, 因此可以直接存为向量。

      | 

      ::

          // 创建一个二维点集的向量组
          public static final double[][] points = { { 1, 1 }, { 2, 1 }, { 1, 2 }, 
           { 2, 2 }, { 3, 3 },  { 8, 8 }, { 9, 8 }, { 8, 9 }, { 9, 9 }, { 5, 5 }, 
           { 5, 6 }, { 6, 6 }}; 
          public static List<Vector> getPointVectors(double[][] raw) { 
              List<Vector> points = new ArrayList<Vector>(); 
              for (int i = 0; i < raw.length; i++) { 
                  double[] fr = raw[i]; 
                  // 这里选择创建 RandomAccessSparseVector 
                  Vector vec = new RandomAccessSparseVector(fr.length); 
              // 将数据存放在创建的 Vector 中
                  vec.assign(fr); 
                  points.add(vec); 
              }
              return points; 
          } 

   -  | 枚举类型数据
      |  这类数据是对物体的描述, 只是取值范围有限,
      比如苹果的颜色数据包括: 红色、黄色和绿色,
      则在数据建模时可以用数字表示颜色。
      |  红色=1, 黄色=2, 绿色=3

      | 

      ::

          // 创建苹果信息数据的向量组
          public static List<Vector> generateAppleData() { 
              List<Vector> apples = new ArrayList<Vector>(); 
              // 这里创建的是 NamedVector，其实就是在上面几种 Vector 的基础上，
              // 为每个 Vector 提供一个可读的名字
              NamedVector apple = new NamedVector(new DenseVector(new double[] {0.11, 510, 1}), "Small round green apple"); 
              apples.add(apple); 

              apple = new NamedVector(new DenseVector(new double[] {0.2, 650, 3}), "Large oval red apple"); 
              apples.add(apple); 

              apple = new NamedVector(new DenseVector(new double[] {0.09, 630, 1}), "Small elongated red apple"); 
              apples.add(apple);  

              apple = new NamedVector(new DenseVector(new double[] {0.18, 520, 2}), "Medium oval green apple"); 
              apples.add(apple); 

              return apples; 
          } 

   -  文本信息
       在信息检索领域中最常用的是向量空间模型,
      文本的向量空间模型就是将文本信息建模成一个向量,
      其中每个维度是文本中出现的一个词的权重。

-  常用算法

   -  K均值聚类算法

      -  原理
          给定一个N个对象的数据集, 构建数据的K个划分,
         每个划分就是一个聚类, K<=N,
         需要满足两个要求：1.每个划分至少包含一个对象; 2.
         每个对象必须属于且仅属于一个组。

      -  过程
          首先创建一个初始划分, 随机的选择K个对象,
         每个对象初始的代表了一个划分的中心, 对于其它的对象,
         根据其与各个划分的中心的距离, 把它们分给最近的划分。
          然后使用迭代进行重定位,
         尝试通过对象在划分间移动以改进划分。所谓重定位,
         就是当有新的对象被分配到了某个划分或者有对象离开了某个划分时,
         重新计算这个划分的中心。这个过程不断重复,
         直到各个划分中的对象不再变化。

      -  优缺点
          当划分结果比较密集, 且划分之间的区别比较明显时,
         K均值的效果比较好。K均值算法复杂度为O(NKt), 其中t为迭代次数。
          但其要求用户必须事先给出K值,
         而K值的选择一般都基于一些经验值或多次实验的结果。而且,
         K均值对孤立点数据比较敏感,
         少量这类的数据就能对评价值造成极大的影响。

      -  示例

         -  | 基于内存的单机应用(0.5版)

            | 

            ::

                /**
                 * 基于内存的K均值聚类算法实现
                 */
                public static void kMeansClusterInMemoryKMeans(){ 
                    // 指定需要聚类的个数
                    int k = 2; 

                    // 指定K均值聚类算法的最大迭代次数
                    int maxIter = 3; 

                    // 指定K均值聚类算法的最大距离阈值
                    double distanceThreshold = 0.01; 

                    // 声明一个计算距离的方法，这里选择了欧几里德距离
                    DistanceMeasure measure = new EuclideanDistanceMeasure(); 

                    // 构建向量集，使用的是二维点集
                    List<Vector> pointVectors = getPointVectors(points); 

                    // 从点集向量中随机的选择k个向量作为初始分组的中心
                    List<Vector> randomPoints = chooseRandomPoints(pointVectors, k); 

                    // 基于前面选中的中心构建分组
                    List<Cluster> clusters = new ArrayList<Cluster>(); 
                    int clusterId = 0; 
                    for(Vector v : randomPoints){ 
                    clusters.add(new Cluster(v, clusterId ++, measure)); 
                    } 
                    // 调用 KMeansClusterer.clusterPoints 方法执行K均值聚类
                    List<List<Cluster>> finalClusters = KMeansClusterer.clusterPoints(pointVectors, clusters, measure, maxIter, distanceThreshold); 

                    // 打印最终的聚类结果
                    for(Cluster cluster : finalClusters.get(finalClusters.size() -1)) { 
                    System.out.println("Cluster id: " + cluster.getId() + " center: " + cluster.getCenter().asFormatString()); 
                    System.out.println("\tPoints: " + cluster.getNumPoints());  
                    } 
                }

      -  | 基于Hadoop的集群应用(0.5版)
         |  注意：
         |  首先需要在MVN工程中添加如下依赖

         | 

         ::

             <dependency>
                 <groupId>org.apache.hadoop</groupId>
                 <artifactId>hadoop-core</artifactId>
                 <version>1.0.4</version>
             </dependency>
             <dependency>
                 <groupId>org.apache.mahout</groupId>
                 <artifactId>mahout-core</artifactId>
                 <version>0.5</version>
             </dependency>
             <dependency>
                 <groupId>org.apache.mahout</groupId>
                 <artifactId>mahout-utils</artifactId>
                 <version>0.5</version>
             </dependency>
             <dependency>
                 <groupId>org.apache.mahout</groupId>
                 <artifactId>mahout-math</artifactId>
                 <version>0.5</version>
             </dependency>

         | 其次在集群上运行前需要进行相关配置

         | 

         ::

             # 需要在$HADOOP_HOME/conf/hadoop-env.sh中设置CLASSPATH
             export MAHOUT_HOME=/usr/local/cloud/mahout
             for f in $MAHOUT_HOME/lib/*.jar; do
                 HADOOP_CLASSPATH=${HADOOP_CLASSPATH}:$f;
             done
             for f in $MAHOUT_HOME/*.jar; do
                HADOOP_CLASSPATH=$(HADOOP_CLASSPATH):$f;
             done

         | 然后即可测试如下代码

         | 

         ::

             /**
              * 基于 Hadoop 的K均值聚类算法实现
              * @throws Exception
              */
             public static void kMeansClusterUsingMapReduce () throws Exception{ 
                 Configuration conf = new Configuration();

                 // 声明一个计算距离的方法，这里选择了欧几里德距离
                 DistanceMeasure measure = new EuclideanDistanceMeasure(); 

                 // 指定输入路径，基于 Hadoop 的实现是通过指定输入输出的文件路径来指定数据源的。
                 Path testpoints = new Path("testpoints"); 
                 Path output = new Path("output"); 

                 // 清空输入输出路径下的数据
                 HadoopUtil.delete(conf, testpoints); 
                 HadoopUtil.delete(conf, output); 

                 RandomUtils.useTestSeed(); 

                 // 在输入路径下生成点集，与内存的方法不同，这里需要把所有的向量写进文件
                 writePointsToFile(testpoints); 

                 // 指定需要聚类的个数，这里选择 2 类
                 int k = 2; 

                 // 指定 K 均值聚类算法的最大迭代次数
                 int maxIter = 3; 

                 // 指定 K 均值聚类算法的最大距离阈值
                 double distanceThreshold = 0.01; 

                 // 随机的选择k个作为簇的中心
                 Path clusters = RandomSeedGenerator.buildRandom(conf, testpoints, new Path(output, "clusters-0"), k, measure); 

                 // 调用 KMeansDriver.runJob 方法执行 K 均值聚类算法
                 KMeansDriver.run(testpoints, clusters, output, measure, distanceThreshold, maxIter, true, true); 

                 // 调用 ClusterDumper 的 printClusters 方法将聚类结果打印出来。
                 ClusterDumper clusterDumper = new ClusterDumper(new Path(output, "clusters-" + (maxIter - 1)), new Path(output, "clusteredPoints")); 
                 clusterDumper.printClusters(null); 
             } 

      -  | 基于Hadoop的集群应用(0.7版)

         | 

         ::

             public static void kMeansClusterUsingMapReduce() throws IOException, InterruptedException,
                         ClassNotFoundException {
                 Configuration conf = new Configuration();

                 // 声明一个计算距离的方法，这里选择了欧几里德距离
                 DistanceMeasure measure = new EuclideanDistanceMeasure();
                 File testData = new File("input");
                 if (!testData.exists()) {
                 testData.mkdir();
                 }

                 // 指定输入路径，基于 Hadoop 的实现是通过指定输入输出的文件路径来指定数据源的。
                 Path samples = new Path("input/file1");

                 // 在输入路径下生成点集，这里需要把所有的向量写进文件
                 List<Vector> sampleData = new ArrayList<Vector>();

                 RandomPointsUtil.generateSamples(sampleData, 400, 1, 1, 3);
                 RandomPointsUtil.generateSamples(sampleData, 300, 1, 0, 0.5);
                 RandomPointsUtil.generateSamples(sampleData, 300, 0, 2, 0.1);
                 ClusterHelper.writePointsToFile(sampleData, conf, samples);

                 // 指定输出路径
                 Path output = new Path("output");
                 HadoopUtil.delete(conf, output);

                 // 指定需要聚类的个数，这里选择3
                 int k = 3;

                 // 指定 K 均值聚类算法的最大迭代次数
                 int maxIter = 10; 

                 // 指定 K 均值聚类算法的最大距离阈值
                 double distanceThreshold = 0.01; 

                 // 随机的选择k个作为簇的中心
                 Path clustersIn = new Path(output, "random-seeds");
                 RandomSeedGenerator.buildRandom(conf, samples, clustersIn, k, measure);

                 // 调用 KMeansDriver.run 方法执行 K 均值聚类算法
                 KMeansDriver.run(samples, clustersIn, output, measure, distanceThreshold, maxIter, true, 0.0, true);

                 // 输出结果
                 List<List<Cluster>> Clusters = ClusterHelper.readClusters(conf, output);
                 for (Cluster cluster : Clusters.get(Clusters.size() - 1)) {
                 System.out.println("Cluster id: " + cluster.getId() + " center: " + cluster.getCenter().asFormatString());
                 }
             }

         | 输出结果为：

         | 

         ::

             Cluster id: 997 center: {1:3.6810451340150467,0:3.8594229542914538}
             Cluster id: 998 center: {1:2.068611196044424,0:-0.5471173292759096}
             Cluster id: 999 center: {1:-0.6392433868275759,0:1.2972649625289365}

12.4.3 分类分析
^^^^^^^^^^^^^^

| 

Date: 2013-04-28 10:38:28 CST

Author: Cloud&Matrix

`matrix.lisp@gmail.com <mailto:matrix.lisp@gmail.com>`__

Org version 7.8.11 with Emacs version 24

`Validate XHTML 1.0 <http://validator.w3.org/check?uri=referer>`__

.. |image0| image:: ../images/taste-architecture.png
