Table of Contents
-----------------

-  `1 URL分类 <#sec-1>`__

   -  `1.1 需求 <#sec-1-1>`__
   -  `1.2 问题 <#sec-1-2>`__
   -  `1.3 思路 <#sec-1-3>`__
   -  `1.4 实现 <#sec-1-4>`__

      -  `1.4.1 获取样本数据 <#sec-1-4-1>`__
      -  `1.4.2 样本数据处理 <#sec-1-4-2>`__
      -  `1.4.3 获取用户数据 <#sec-1-4-3>`__
      -  `1.4.4 用户数据分析 <#sec-1-4-4>`__

   -  `1.5 演示 <#sec-1-5>`__

      -  `1.5.1 sample <#sec-1-5-1>`__
      -  `1.5.2 title <#sec-1-5-2>`__
      -  `1.5.3 classify <#sec-1-5-3>`__

1 URL分类
---------

1.1 需求
~~~~~~~~

| 每个人每天要访问很多网站,
分析用户经常上哪些网站有助于让我们更了解用户, 所以,
我们需要分析用户访问的URL, 对其进行归类以便于对用户贴标签。

1.2 问题
~~~~~~~~

| 分析用户就是分析URL, 如何才能对一个URL进行快速、正确的分类？

1.3 思路
~~~~~~~~

| 目前已经有了很多导航网站, 它们已经对一些常见的网址进行了归类,
可以使用它们的数据作为样本对用户数据进行分析,
然后将匹配结果更新到样本库, 使样本库匹配的更加准确。

1.4 实现
~~~~~~~~

1.4.1 获取样本数据
^^^^^^^^^^^^^^^^^^

-  | 网页抓取
   |  这里使用Python的urllib2实现, 相关文档参见:
   | 
   `http://docs.python.org/2/library/urllib2.html <http://docs.python.org/2/library/urllib2.html>`__

   | 

   ::

       # 防止中文乱码
       reload(sys)
       sys.setdefaultencoding('utf-8')

       # 构造头信息, 防止爬虫屏蔽
       sendHeaders = {
           'User-Agent':'Mozilla/5.0 (Windows NT 6.2; rv:16.0) Gecko/20100101 Firefox/16.0',
           'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
           'Connection':'keep-alive'
       }

       # 使用火狐网址大全
       req = urllib2.Request('http://www.huohu123.com', headers = sendHeaders)
       r = urllib2.urlopen(req, timeout = 20)
       html = r.read()

       # 处理压缩格式的内容 
       if html[:6] == '\x1f\x8b\x08\x00\x00\x00':
           html = gzip.GzipFile(fileobj = cStringIO.StringIO(html)).read()
       # 编码转换, 防止中文乱码
       try: 
           html = html.decode('utf-8')
       except UnicodeDecodeError, e:
           html = html.decode('gbk')

-  | 网页分析
   |  这里使用Python的BeautifulSoup实现, 相关文档参见:
   | 
   `http://www.crummy.com/software/BeautifulSoup/ <http://www.crummy.com/software/BeautifulSoup/>`__

   | 

   ::

       # 获取所有的频道
       channels = {}
       soup = BeautifulSoup(html)
       prefix = 'channel/channel_'
       for link in soup('a'):
           if ('href' in dict(link.attrs)):
               url = link['href']
               if url.startswith(prefix):
                   channels[url] = 1
       # 对每一个频道页面进行分析, 获得每个频道下的分类
       for channel in channels.keys():
           url = 'http://www.huohu123.com/' + channel
           soup = getSoup(url, 'u')
           title = soup.title.string
           # 频道名称从网页标题中获取
           cname = title.split()[0]
           tagDict = {}
           tag = ''
           # 根据div的样式特征查找分类及每个分类下的网站 
           for div in soup('div'):
               webList = []
               if ('class' not in dict(div.attrs)):
                   continue
               style = div['class']
               if style.find('data-table') == -1:
                   continue
               tagDiv = div.find('div')
               if tagDiv['class'] == 'table-title':
                   tag = tagDiv.string
               for link in div.findAll('a'):
                   if ('title' in dict(link.attrs)):
                       webList.append(link['href'] + ',' + link['title'])
                   else:
                       webList.append(link['href'] + ',' + link.contents[1])
               tagDict[tag] = webList
           channelDict[cname] = tagDict 

1.4.2 样本数据处理
^^^^^^^^^^^^^^^^^^

-  样本网址
    导航网站的链接有一些会带上跳转信息, 导致URL特别长,
   且真正的网址有可能被隐藏, 因此需要对一些特殊的链接进行处理。

-  样本标题
    导航网站的链接标题有时会带上导航站自身的信息, 这些也应该去除。

-  | 数据存储
   |  导航网站的数据因为已经进行了分类, 因此可以直接将其存储。

   | 

   ::

       -- 标签表:存储标签及其所属的频道
       create table tags(id integer primary key, pid, name)
       -- 网站表:存储网站所属的标签、类型、值 
       create table webs(id integer primary key, tid, flag, value)

1.4.3 获取用户数据
^^^^^^^^^^^^^^^^^^

-  | 提取标题
   |  过程与网页抓取类似, 只不过这里不需要获取网页全部内容,
   只需要获取标题即可

   | 

   ::

       # 在头信息中添加'Range:bytes=0-1023'项,只取前1024字节的内容
       sendHeaders = {
           'User-Agent':'Mozilla/5.0 (Windows NT 6.2; rv:16.0) Gecko/20100101 Firefox/16.0',
           'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
           'Connection':'keep-alive',
           'Range':'bytes=0-1023'
       }

       # 获得html后直接获取标题即可
       soup = BeautifulSoup(html)
       title = soup.title.string 

1.4.4 用户数据分析
^^^^^^^^^^^^^^^^^^

-  | 网址匹配
   |  查找用户访问URL与样本数据中的哪个网站的网址最接近,
   即利用相似度来为匹配的网址打分, 假设有一系列网址都匹配,
   则选择分值最高的网站, 然后查找此网站所属的标签和频道作为该URL的分类。
   |  很自然的, 会想到以最长匹配子串及其所在的位置来定义相似度,
   根据以下示例:

   | 

   ::

       用户数据:cps.youku.com/redirect.html?id=00000292 
       样本数据:v.youku.com
       最长匹配子串为'.youku.com', 长度为10, 其在用户数据字符串中的索引为3, 其在样本数据中所在比例为0.9091

   | 显然有如下规则:

   -  匹配子串越长则说明越匹配
   -  匹配子串在用户数据中的索引越小则说明越匹配
   -  匹配子串在样本数据中的比例越大则说明越匹配

   | 则由此可定义分值为 匹配子串长度 \* (1/匹配子串在用户数据中的索引)
   \* 匹配子串在样本数据中的比例

   | 

   ::

       url = 'cps.youku.com/redirect.html?id=00000292'
       domain = 'v.youku.com'
       if len(domain) > len(url):
           url, domain = domain, url
       temp = domain
       idx = url.find(temp)
       while idx == -1:
           temp = temp[1:]
           if len(temp) == 1:
               break
           idx = url.find(temp)
       percent = 0.001
       diverge = 0.001
       if idx != -1:
           percent = len(temp)*1.0/len(domain)
           diverge = 1.0-idx*1.0/len(domain)
       score = diverge*percent

-  | 标题匹配
   |  查找用户访问URL的标题与样本数据中哪个网站的名称最接近,
   假设有一系列网站都匹配, 则选择匹配位置最靠两边的网站,
   然后查找此网站所属的标签和频道作为该URL的分类。
   |  与网址匹配相同, 依然寻找最长匹配子串,
   但考虑到网站标题一般会把关键字放在两端, 所以获取分值时稍有差别。

   | 

   ::

       用户数据:优酷-中国第一视频网站,提供视频播放,视频发布,视频搜索 - 优酷视频
       样本数据:优酷网
       最长匹配子串为'优酷', 其在用户数据字符串中匹配了两次, 索引分别为0、31, 取索引值与中心的偏离程度作为分值依据。

   | 由此定义分值为 匹配子串长度 \* 最左边匹配索引与中心的偏离程度 \*
   最右边边匹配索引与中心的偏离程度 \* 匹配子串在样本数据中的比例

   | 

   ::

       title = unicode('优酷-中国第一视频网站,提供视频播放,视频发布,视频搜索 - 优酷视频', 'utf-8')
       name = unicode('优酷网', 'utf-8')
       if len(name) > len(title):
           title, name = name, title
       temp = name
       idx = title.find(temp)
       while idx == -1:
           temp = temp[0:len(temp)-1]
           if len(temp) == 1:
               break
           idx = title.find(temp)
       mid = len(title)/2.0
       lDiverge = 0.001
       rDiverge = 0.001
       percent = 0.001
       if idx != -1:
           lDiverge = abs(mid - idx)/mid
           ridx = title.rfind(temp)
           if ridx != idx:
               rDiverge = abs(mid - ridx)/mid
           percent = len(temp)*1.0/len(name)
       score = lDiverge*rDiverge*percent

-  | 分词匹配
   |  对用户访问URL的标题进行分词,
   在每个频道下的所有标签中查找最为匹配的值作为该URL的分类。
   |  为防止相关度不高的记录获得较高的分值,
   计算匹配记录与分词的长度之比和匹配分词在标题中的索引位置占比作为分值依据。

   | 

   ::

       title = unicode('优酷-中国第一视频网站,提供视频播放,视频发布,视频搜索 - 优酷视频', 'utf-8')
       tags = [unicode('视频', 'utf-8'), unicode('游戏', 'utf-8'), unicode('新闻', 'utf-8')]
       segList = [word for word in jieba.cut(title, cut_all=False) if len(word) > 1]
       tagScores = {}
       for tag in tags:
           for seg in segList:
               if (seg.find(tag) == -1) and (tag.find(seg) == -1):
                   continue
               score = tagScores.get(tag)
               if score == None:
                   percent = len(tag)*1.0/len(seg)
                   if percent > 1:
                       percent = 1.0/percent
                   idx = title.find(seg)
                   diverge = 1.0-idx*1.0/len(title)
                   score = diverge*percent
                   tagScores[tag] = score
               else:
                   tagScores[tag] = score*2

-  样本更新
    将用户数据分类结果以与导航网站数据相同的方式导入到数据库,
   以扩大样本库范围。以后如果发现某个网站归类存在偏差,
   直接修改数据库即可。

1.5 演示
~~~~~~~~

| 具体代码参见url\_classify项目。svn地址:
|  svn://10.0.0.10/data/applications/url\_classify

1.5.1 sample
^^^^^^^^^^^^

| 获取样本数据, 火狐导航与百度导航获取方式类似。

1.5.2 title
^^^^^^^^^^^

| 首先统计访问量比较高的域名, 然后获取这些域名的标题。

1.5.3 classify
^^^^^^^^^^^^^^

| 根据用户数据中的URL、标题进行分类。

| 

Date: 2013-03-20

Author: Matrix

`matrix.lisp@gmail.com <mailto:matrix.lisp@gmail.com>`__

Org version 7.8.11 with Emacs version 24

`Validate XHTML 1.0 <http://validator.w3.org/check?uri=referer>`__
