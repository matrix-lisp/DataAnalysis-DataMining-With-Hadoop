`UP <index.html>`__ \| `HOME <index.html>`__

Hadoop安装
------------

4.1 系统要求
~~~~~~~~~~~~

| Linux, 线上环境多为CentOS, 这里使用Fedora作为测试系统

4.2 安装准备
~~~~~~~~~~~~

4.2.1 创建hadoop用户
^^^^^^^^^^^^^^^^^^^^

| 使用专有用户进行相关操作

| 

::

    # 创建hadoop用户组
    groupadd hadoop

    # 创建hadoop用户
    useradd hadoop

    # 设置密码
    passwd hadoop

    # 添加用户到用户组
    usermod -G hadoop hadoop

4.2.2 基本服务
^^^^^^^^^^^^^^

-  ssh&rsync

| 

::

    # 安装ssh服务
    yum install ssh

    # 安装数据同步工具
    yum install rsync

    # 设置ssh服务开机启动
    systemctl enable sshd.service

    # 启动ssh服务
    systemctl start sshd.service
    # 或者
    service sshd start

4.2.3 JDK
^^^^^^^^^

-  安装

| 选用Sun官方1.6版
| 
`http://www.oracle.com/technetwork/java/javase/downloads/index.html <http://www.oracle.com/technetwork/java/javase/downloads/index.html>`__

| 

::

    # 使用二进制版本安装
    ./jdk-6u39-linux-i586.bin

    # 移动到专门的目录下
    mkdir /usr/java
    mv jdk1.6.0_39 /usr/java/

    # 建立最新版本的软链接
    cd /usr/java/
    ln -s -f /usr/java/jdk1.6.0_39 latest

    # 建立默认版本的软链接
    ln -s -f /usr/java/latest default

    # 重新设置Java的软链接
    cd /usr/bin
    ln -s -f /usr/java/default/bin/java
    ln -s -f /usr/java/default/bin/javac

-  查看是否正确安装

| 

::

    # java -version
    java version "1.6.0_39"
    Java(TM) SE Runtime Environment (build 1.6.0_39-b04)
    Java HotSpot(TM) Server VM (build 20.14-b01, mixed mode)

-  设置系统变量

| 编辑/etc/profile

| 

::

    export JAVA_HOME=/usr/java/default
    export CLASSPATH=.:$JAVA_HOME/lib     
    export PATH=$JAVA_HOME/bin:$PATH
    source /etc/profile
    echo $JAVA_HOME

4.2.4 修改主机名
^^^^^^^^^^^^^^^^

| 

::

    # /etc/hostname
    hadooptest

    # /etc/hosts
    127.0.0.1    hadooptest localhost 

4.2.5 防火墙设置
^^^^^^^^^^^^^^^^

| 

::

    /etc/init.d/iptables stop

4.2.6 无密码登录
^^^^^^^^^^^^^^^^

-  生成RSA格式的密钥对

| 

::

    # 切换到hadoop账户
    cd
    ssh-keygen -t rsa -P ""

| 将会在~/.ssh/目录下生成密钥文件id\_rsa与公钥文件id\_rsa.pub

-  设置自动登录

| 

::

    # 单机模式下
    cp ~/.ssh/id_rsa.pub ~/.ssh/authorized_keys

    # 集群模式下
    scp ~/.ssh/id_rsa.pub hadoop@slver:/home/hadoop/.ssh/authorized_keys

4.3 安装配置
~~~~~~~~~~~~

4.3.1 目录规范
^^^^^^^^^^^^^^

| 为便于管理, 最好将程序目录和数据目录分离。

-  程序目录

| 

::

    mkdir /usr/local/cloud
    tar -zxvf hadoop-1.0.4.tar.gz -C /usr/local/cloud/src/
    cd /usr/local/cloud/
    ln -s -f /usr/local/cloud/src/hadoop-1.0.4 hadoop

-  数据目录

| 

::

    # 设置目录所有者为hadoop
    mkdir /data
    chown hadoop:hadoop /data

    # 切换到hadoop账户创建相关目录
    su hadoop
    mkdir hadoop
    mkdir -p logs/hadoop
    mkdir -p pids/hadoop

4.3.2 修改配置
^^^^^^^^^^^^^^

-  系统变量设置

| 

::

    # vim /etc/profile
    export HADOOP_HOME=/usr/local/cloud/hadoop
    export PATH=$JAVA_HOME/bin:$HADOOP_HOME/bin:$PATH 
    source /etc/profile

-  $HADOOP\_HOME/conf/hadoop-env.sh

| 

::

    export JAVA_HOME=/usr/java/default
    export HADOOP_LOG_DIR=/data/logs/hadoop
    export HADOOP_PID_DIR=/data/pids/hadoop

-  $HADOOP\_HOME/conf/core-site.xml

| 

::

    <property>
        <name>fs.default.name</name>
        <value>hdfs://hadooptest:9000</value>
    </property>
    <property>
        <name>hadoop.tmp.dir></name>
        <value>/data/hadoop</value>
    </property>  

-  $HADOOP\_HOME/conf/mapred-site.xml

| 

::

    <property>
        <name>mapred.job.tracker</name>
        <value>hadooptest:9001</value>
    </property>

-  $HADOOP\_HOME/conf/hdfs-site.xml

| 

::

    <property>
        <name>dfs.replication</name>
        <value>3</value>
    </property>
    <property>
        <name>dfs.data.dir</name>
        <value>${hadoop.tmp.dir}/dfs/data</value>
    </property>
    <property>
        <name>dfs.name.dir</name>
        <value>${hadoop.tmp.dir}/dfs/name</value>
    </property>

-  $HADOOP\_HOME/conf/masters

| 

::

    hadooptest

-  $HADOOP\_HOME/conf/slaves

| 

::

    hadooptest

4.3.3 启动服务
^^^^^^^^^^^^^^

-  格式化文件系统

| 

::

    $HADOOP_HOME/bin/hadoop namenode -format

-  启动HDFS服务

| 

::

    $HADOOP_HOME/bin/start-dfs.sh  

-  启动MR服务

| 

::

    $HADOOP_HOME/bin/start-mapred.sh  

-  WEB方式查看

| |image0|
|  |image1|

-  相关进程

| 

::

    [hadoop@hadooptest ~]$ cd /usr/local/cloud/hadoop/bin/
    [hadoop@hadooptest bin]$ ./start-all.sh 
    starting namenode, logging to /data/logs/hadoop/hadoop-hadoop-namenode-hadooptest.out
    hadooptest: starting datanode, logging to /data/logs/hadoop/hadoop-hadoop-datanode-hadooptest.out
    hadooptest: starting secondarynamenode, logging to /data/logs/hadoop/hadoop-hadoop-secondarynamenode-hadooptest.out
    starting jobtracker, logging to /data/logs/hadoop/hadoop-hadoop-jobtracker-hadooptest.out
    hadooptest: starting tasktracker, logging to /data/logs/hadoop/hadoop-hadoop-tasktracker-hadooptest.out
    [hadoop@hadooptest bin]$ jps
    2542 SecondaryNameNode
    2282 NameNode
    2764 TaskTracker
    2819 Jps
    2634 JobTracker
    2409 DataNode
    [hadoop@hadooptest bin]$ 

Date: 2013-04-28 10:38:29 CST

Author: Cloud&Matrix

`matrix.lisp@gmail.com <mailto:matrix.lisp@gmail.com>`__

Org version 7.8.11 with Emacs version 24

`Validate XHTML 1.0 <http://validator.w3.org/check?uri=referer>`__

.. |image0| image:: hdfs-http.png
.. |image1| image:: mr-http.png
