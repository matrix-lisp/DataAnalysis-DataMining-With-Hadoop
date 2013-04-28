`UP <index.html>`__ \| `HOME <index.html>`__

分布式日志收集系统
--------------------

7.1 安装部署
~~~~~~~~~~~~

7.1.1 环境要求
^^^^^^^^^^^^^^

| Chukwa是基于Hadoop的日志收集框架, 所以需要系统已经安装部署了Hadoop

7.1.2 版本选择
^^^^^^^^^^^^^^

| 这里使用0.5版本

7.1.3 目录规范
^^^^^^^^^^^^^^

-  | 程序目录

   | 

   ::

       tar -zxvf chukwa-incubating-0.5.0.tar.gz -C /usr/local/cloud/src/
       cd /usr/local/cloud/
       ln -s -f /usr/local/cloud/src/chukwa-incubating-0.5.0 chukua

-  | 数据目录

   | 

   ::

       mkdir /data/logs/chukwa
       mkdir /data/pids/chukwa

7.1.4 修改配置
^^^^^^^^^^^^^^

-  | 系统变量设置

   | 

   ::

       vim /etc/profile
       export CHUKWA_HOME=/usr/local/cloud/chukwa
       export PATH=$JAVA_HOME/bin:$HADOOP_HOME/bin:$CHUKWA_HOME/bin:$PATH
       source /etc/profile

-  | 代理器配置

   -  使用 $CHUKWA\ :sub:`HOME`/etc/chukwa/agents 指定代理器地址

   | 

   ::

       localhost

   -  使用 $CHUKWA\ :sub:`HOME`/etc/chukwa/chukwa-agent-conf.xml
      配置代理器参数

   | 

   ::

       <!-- 设置轮询检测文件内容变化的间隔时间  -->
       <property>
           <name>chukwaAgent.adaptor.context.switch.time</name>
           <value>5000</value>
       </property>
       <!-- 设置读取文件增量内容的最大值  -->
       <property>
           <name>chukwaAgent.fileTailingAdaptor.maxReadSize</name>
           <value>2097152</value>
       </property>

-  | 收集器配置

   -  使用 $CHUKWA\ :sub:`HOME`/etc/chukwa/collectors 指定收集器地址

   | 

   ::

       # 单机部署的情况下与agents相同
       localhost

   -  使用 $CHUKWA\ :sub:`HOME`/etc/chukwa/chukwa-collector-conf.xml
      配置收集器参数

   | 

   ::

       <!-- Chukwa 0.5 版本添加了写入到HBase的实现, 如果不需要则应恢复默认 -->
       <!-- Sequence File Writer parameters -->
       <property>
           <name>chukwaCollector.pipeline</name>                                                                                   
           <value>org.apache.hadoop.chukwa.datacollection.writer.SocketTeeWriter,org.apache.hadoop.chukwa.datacollection.writer.Se#
       </property>

       <!-- 设置服务端地址  -->
       <property>
           <name>writer.hdfs.filesystem</name>
           <value>hdfs://hadooptest:9000</value>
       </property>

-  | 全局配置

   | 

   ::

       # 在 $CHUKWA_HOME/etc/chukwa/chukwa-env.sh 添加或修改如下项
       export JAVA_HOME=/usr/java/default
       export CLASSPATH=.:$JAVA_HOME/lib
       export HADOOP_HOME=/usr/local/cloud/hadoop
       export CHUKWA_HOME=/usr/local/cloud/chukua
       export CHUKWA_CONF_DIR=${CHUKWA_HOME}/etc/chukwa
       export CHUKWA_PID_DIR=/data/pids/chukwa
       export CHUKWA_LOG_DIR=/data/logs/chukwa

-  | 监测文件设置

   | 

   ::

       # 在 $CHUKWA_HOME/etc/chukwa/initial_adaptors 中添加要监测的日志文件, 但一般使用 telnet 链接到服务端的方式添加
       # 格式为 add [name =] <adaptor_class_name> <datatype> <adaptor specific params> <initial offset>
       # 依次为: 监测接口的实现类 数据类型 起始点 日志文件 已收集的文件大小 
       add filetailer.CharFileTailingAdaptorUTF8 typeone 0 /data/logs/web/typeone.log 0
       add filetailer.CharFileTailingAdaptorUTF8 typetwo 0 /data/logs/web/typetwo.log 0

7.2 启动服务
~~~~~~~~~~~~

7.2.1 启动收集器进程
^^^^^^^^^^^^^^^^^^^^

| 

::

    cd $CHUKWA_HOME/
    sbin/start-collectors.sh

7.2.2 启动代理器进程
^^^^^^^^^^^^^^^^^^^^

| 

::

    sbin/start-agents.sh

7.2.3 启动数据处理进程
^^^^^^^^^^^^^^^^^^^^^^

| 

::

    sbin/start-data-processors.sh

::

    [hadoop@hadooptest chukua]$ sbin/start-collectors.sh 
    localhost: starting collector, logging to /data/logs/chukwa/chukwa-hadoop-collector-hadooptest.out
    localhost: WARN: option chukwa.data.dir may not exist; val = /chukwa
    localhost: Guesses: 
    localhost:  chukwaRootDir null
    localhost:  fs.default.name URI
    localhost:  nullWriter.dataRate Time
    localhost: WARN: option chukwa.tmp.data.dir may not exist; val = /chukwa/temp
    localhost: Guesses: 
    localhost:  chukwaRootDir null
    localhost:  nullWriter.dataRate Time
    localhost:  chukwaCollector.tee.port Integral
    [hadoop@hadooptest chukua]$ sbin/start-agents.sh 
    localhost: starting agent, logging to /data/logs/chukwa/chukwa-hadoop-agent-hadooptest.out
    localhost: OK chukwaAgent.adaptor.context.switch.time [Time] = 5000
    localhost: OK chukwaAgent.checkpoint.dir [File] = /data/logs/chukwa/
    localhost: OK chukwaAgent.checkpoint.interval [Time] = 5000
    localhost: WARN: option chukwaAgent.collector.retries may not exist; val = 144000
    localhost: Guesses: 
    localhost:  chukwaAgent.connector.retryRate Time
    localhost:  chukwaAgent.sender.retries Integral
    localhost:  chukwaAgent.control.remote Boolean
    localhost: WARN: option chukwaAgent.collector.retryInterval may not exist; val = 20000
    localhost: Guesses: 
    [hadoop@hadooptest chukua]$ sbin/start-data-processors.sh 
    starting archive, logging to /data/logs/chukwa/chukwa-hadoop-archive-hadooptest.out
    starting demux, logging to /data/logs/chukwa/chukwa-hadoop-demux-hadooptest.out
    starting dp, logging to /data/logs/chukwa/chukwa-hadoop-dp-hadooptest.out
    [hadoop@hadooptest chukua]$ 

7.3 收集测试
~~~~~~~~~~~~

7.3.1 构造测试数据
^^^^^^^^^^^^^^^^^^

| 

::

    # 在 /data/logs/web/webone 中写入如下测试日志
    - 10.0.0.10 [17/Oct/2011:23:20:40 +0800] GET /img/chukwa0.jpg HTTP/1.0 "404" "16" "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1;)"  
    - 10.0.0.11 [17/Oct/2011:23:20:41 +0800] GET /img/chukwa1.jpg HTTP/1.0 "404" "16" "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1;)"  
    - 10.0.0.12 [17/Oct/2011:23:20:42 +0800] GET /img/chukwa2.jpg HTTP/1.0 "404" "16" "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1;)"  
    - 10.0.0.13 [17/Oct/2011:23:20:43 +0800] GET /img/chukwa3.jpg HTTP/1.0 "404" "16" "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1;)"  
    - 10.0.0.14 [17/Oct/2011:23:20:44 +0800] GET /img/chukwa4.jpg HTTP/1.0 "404" "16" "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1;)"  
    - 10.0.0.15 [17/Oct/2011:23:20:45 +0800] GET /img/chukwa5.jpg HTTP/1.0 "404" "16" "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1;)"  
    - 10.0.0.16 [17/Oct/2011:23:20:46 +0800] GET /img/chukwa6.jpg HTTP/1.0 "404" "16" "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1;)"  
    - 10.0.0.17 [17/Oct/2011:23:20:47 +0800] GET /img/chukwa7.jpg HTTP/1.0 "404" "16" "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1;)"  
    - 10.0.0.18 [17/Oct/2011:23:20:48 +0800] GET /img/chukwa8.jpg HTTP/1.0 "404" "16" "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1;)"  
    - 10.0.0.19 [17/Oct/2011:23:20:49 +0800] GET /img/chukwa9.jpg HTTP/1.0 "404" "16" "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1;)"

    # 在 /data/logs/web/webtwo 中写入如下测试日志
    - 192.168.0.10 [17/Oct/2011:23:20:40 +0800] GET /img/chukwa0.jpg HTTP/1.0 "404" "16" "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1;)"  
    - 192.168.0.11 [17/Oct/2011:23:21:40 +0800] GET /img/chukwa1.jpg HTTP/1.0 "404" "16" "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1;)"  
    - 192.168.0.12 [17/Oct/2011:23:22:40 +0800] GET /img/chukwa2.jpg HTTP/1.0 "404" "16" "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1;)"  
    - 192.168.0.13 [17/Oct/2011:23:23:40 +0800] GET /img/chukwa3.jpg HTTP/1.0 "404" "16" "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1;)"  
    - 192.168.0.14 [17/Oct/2011:23:24:40 +0800] GET /img/chukwa4.jpg HTTP/1.0 "404" "16" "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1;)"  
    - 192.168.0.15 [17/Oct/2011:23:25:40 +0800] GET /img/chukwa5.jpg HTTP/1.0 "404" "16" "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1;)"  
    - 192.168.0.16 [17/Oct/2011:23:26:40 +0800] GET /img/chukwa6.jpg HTTP/1.0 "404" "16" "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1;)"  
    - 192.168.0.17 [17/Oct/2011:23:27:40 +0800] GET /img/chukwa7.jpg HTTP/1.0 "404" "16" "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1;)"  
    - 192.168.0.18 [17/Oct/2011:23:28:40 +0800] GET /img/chukwa8.jpg HTTP/1.0 "404" "16" "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1;)"  
    - 192.168.0.19 [17/Oct/2011:23:29:40 +0800] GET /img/chukwa9.jpg HTTP/1.0 "404" "16" "Mozilla/5.0 (MSIE 9.0; Windows NT 6.1;)" 

7.3.2 模拟WEB日志
^^^^^^^^^^^^^^^^^

| 

::

    # 在 /data/logs/web/weblogadd.sh 中写入如下内容
    #!/bin/bash  
    cat /data/logs/web/webone >> /data/logs/web/typeone.log  
    cat /data/logs/web/webtwo >> /data/logs/web/typetwo.log  

    # 设置脚本文件可执行
    chmod +x weblogadd.sh 

    # 在 /etc/crontab 中添加定时任务以模拟WEB日志生成
    */1 * * * * hadoop /data/logs/web/weblogadd.sh   

7.3.3 添加日志监控
^^^^^^^^^^^^^^^^^^

| 

::

    # 链接到服务端的 telnet 服务
    telnet hadooptest 9093
    add org.apache.hadoop.chukwa.datacollection.adaptor.filetailer.CharFileTailingAdaptorUTF8 typeone 0 /data/logs/web/typeone.log 0
    add org.apache.hadoop.chukwa.datacollection.adaptor.filetailer.CharFileTailingAdaptorUTF8 typetwo 0 /data/logs/web/typetwo.log 0

7.4 处理流程
~~~~~~~~~~~~

7.4.1 目录结构
^^^^^^^^^^^^^^

| 

::

    /chukwa/
       archivesProcessing/
       dataSinkArchives/
       demuxProcessing/
       finalArchives/
       logs/
       postProcess/
       repos/
       rolling/
       temp/

7.4.2 流程图
^^^^^^^^^^^^

| `Chukwa数据处理流程 <../images/Chukwa_Processes_and_Data_Flow_0.4.png>`__

Date: 2013-04-28 10:38:31 CST

Author: Cloud&Matrix

`matrix.lisp@gmail.com <mailto:matrix.lisp@gmail.com>`__

Org version 7.8.11 with Emacs version 24

`Validate XHTML 1.0 <http://validator.w3.org/check?uri=referer>`__
