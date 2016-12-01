
一. 如何完成上报。
     1: 到系统申请pageid
     2: 在页面适当的地方嵌入_timemarks的各个时间点
     3: 引入测速的js模块  speed.module.js ，
     4: 调用 Speed.report(pageid, _timemarks) 进行上报。
     
     
二. 部门统一上报的时间点、耗时的定义
 - 上报起始点: 紧靠<head>标签，在有任何阻塞行为前。用做web页面内统计的时间起点，便于其他时间点求差值。 （必须上报）
 
 - <html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><script>va_timemarks=[new Date]</script><title>迅雷</title>
 
 - 首屏可交互的时间点。— 反应页面用户体验。 （必须上报）
 
 - 页面的主要功能呈现给用户，完成js加载，ajax数据请求和渲染，页面完成各类事件绑定，用户可以开始与页面功能交互的时间点。
 首屏可交互的耗时 = 首屏可交互的时间点 - 上报起始点
 <script>window._timemarks[‘active’] = new Date</script>
  
 小组可选的上报点：
 -首元素可见时间点 window._timemarks[‘active’]
 -首屏可见时间点.
 用户看到首屏页面的html渲染完成的时间。
 首屏可见的耗时 = 首屏渲染完成时间点 - 上报起始点
 <script>window._timemarks[‘firstScreen’] = new Date</script>
 首屏加载结束的时间点。 - 反应页面综合性能
 
 页面首屏的所有资源加载完成，与用户最终看到的首屏效果一致。
 <script>window._timemarks[‘finish’] = new Date </script>
