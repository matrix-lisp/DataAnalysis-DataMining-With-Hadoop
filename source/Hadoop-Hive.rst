`UP <index.html>`__ \| `HOME <index.html>`__

数据仓库工具
--------------

9.1 安装部署
~~~~~~~~~~~~

9.1.1 环境要求
^^^^^^^^^^^^^^

| Hive是基于Hadoop的数据仓库工具, 所以要求系统已经安装部署了Hadoop。
|  此外为了存储元数据还需要MySQL环境。

-  | 安装MySQL

   | 

   ::

       sudo yum install -y mysql mysql-server mysql-devel
       # vim /etc/my.cnf
       # 在[mysqld]下添加
       character_set_server=utf8
       # 启动服务
       sudo service mysqld start 

-  | 添加hive用户

   | 

   ::

       # 设置root密码
       sudo mysqladmin -u root password 'rootadmin'
       # 以root登录
       mysql -u root -prootadmin
       # 创建hive数据库
       create database hive;
       alter database hive character set latin1;
       # 创建hive用户
       GRANT ALL PRIVILEGES ON hive.* TO 'hive'@'localhost' IDENTIFIED BY 'hive' WITH GRANT OPTION;
       GRANT ALL PRIVILEGES ON hive.* TO 'hive'@'%' IDENTIFIED BY 'hive' WITH GRANT OPTION;

       # 退出后以hive用户测试
       mysql -u hive -phive 

-  | 下载驱动
   |  在
   `http://www.mysql.com/downloads/connector/j/ <http://www.mysql.com/downloads/connector/j/>`__
   下载最新的MySQL的Java驱动, 这里是

   | 

   ::

       tar -zxvf mysql-connector-java-5.1.24.tar.gz
       cd mysql-connector-java-5.1.24/
       cp mysql-connector-java-5.1.24-bin.jar /usr/local/cloud/hive/lib/

9.1.2 版本选择
^^^^^^^^^^^^^^

| 这里使用 0.10.0 版。

9.1.3 目录规范
^^^^^^^^^^^^^^

-  | 程序目录

   | 

   ::

       tar -zxvf hive-0.10.0.tar.gz -C /usr/local/cloud/src/
       cd /usr/local/cloud/
       ln -s -f /usr/local/cloud/src/hive-0.10.0 hive

-  | 数据目录

   | 

   ::

       # 创建存储查询日志的目录
       # 每个用户的查询日志在 /data/logs/hive 中
       mkdir -p /data/logs/hive/query

9.1.4 修改配置
^^^^^^^^^^^^^^

-  | 系统设置

   | 

   ::

       vim /etc/profile
       export HIVE_HOME=/usr/local/cloud/hive
       export PATH=$JAVA_HOME/bin:$HADOOP_HOME/bin:$CHUKWA_HOME/bin:$HIVE_HOME/bin:$PATH
       source /etc/profile

-  | 全局配置

   -  使用 $HIVE\ :sub:`HOME`/conf/hive-env.sh 进行环境变量配置

   | 

   ::

       # 配置项参见同目录下的 hive-env.sh.template
       export JAVA_HOME=/usr/java/default
       export HADOOP_HOME=/usr/local/cloud/hadoop
       export HIVE_HOME=/usr/local/cloud/hive
       export HIVE_CONF_DIR=$HIVE_HOME/conf
       export HADOOP_HEAPSIZE=1024

   -  使用 $HIVE\ :sub:`HOME`/conf/hive-site.xml 进行参数配置

   | 

   ::

       <!-- 添加hdfs设置  -->
       <property>
           <name>default.fs.name</name>
           <value>hdfs://hadooptest:9000</value>
       </property>

       <!-- 修改一下配置项  -->
       <!-- 临时存储目录设置  -->
       <property>
           <name>hive.exec.scratchdir</name>
           <value>/user/${user.name}/hive/scratchdir</value>
           <description>Scratch space for Hive jobs</description>
       </property> 
       <property>
           <name>hive.exec.local.scratchdir</name>
           <value>/data/logs/hive/scratch/${user.name}</value>
           <description>Local scratch space for Hive jobs</description>
       </property>
       <!-- 数据文件存储目录  -->
       <property>
           <name>hive.metastore.warehouse.dir</name>
           <value>/hive/warehouse</value>
           <description>location of default database for the warehouse</description>
       </property>
       <!-- 查询日志存储目录  -->
       <property>
           <name>hive.querylog.location</name>
           <value>/data/logs/hive/query/${user.name}</value>
           <description>Location of Hive run time structured log file</description>
       </property>

       <!-- 使用MySQL存储元数据 -->

       <!-- MySQL服务器地址  -->
       <property>
           <name>javax.jdo.option.ConnectionURL</name>
           <value>jdbc:mysql://hadooptest:3306/hive?createDatabaseIfNotExist=true&amp;characterEncoding=UTF-8</value>
           <description>JDBC connect string for a JDBC metastore</description>
       </property>

       <property>
           <name>javax.jdo.option.ConnectionDriverName</name>
           <value>com.mysql.jdbc.Driver</value>
       </property>

       <property>
           <name>javax.jdo.option.ConnectionUserName</name>
           <value>hive</value>
           <description>username to use against metastore database</description>
       </property>

       <property>
           <name>javax.jdo.option.ConnectionPassword</name>
           <value>hive</value>
           <description>password to use against metastore database</description>
       </property>

-  | 日志设置

   | 

   ::

       # 在 $HIVE_HOME/conf/hive-log4j.properties 中设置日志数据目录
       hive.log.dir=/data/logs/hive/${user.name}

9.2 使用方式
~~~~~~~~~~~~

| 直接使用hive命令即可。

9.3 数据测试
~~~~~~~~~~~~

| 

9.4 处理流程
~~~~~~~~~~~~

Date: 2013-04-28 10:38:30 CST

Author: Cloud&Matrix

`matrix.lisp@gmail.com <mailto:matrix.lisp@gmail.com>`__

Org version 7.8.11 with Emacs version 24

`Validate XHTML 1.0 <http://validator.w3.org/check?uri=referer>`__
