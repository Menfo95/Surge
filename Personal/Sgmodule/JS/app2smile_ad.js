let url=$request.url;let method=$request.method;let body=JSON.parse($response.body);let notifiTitle="去廣告腳本錯誤";let getMethod="GET";let postMethod="POST";if(url.indexOf("api.zhihu.com/commercial_api/real_time_launch_v2")!=-1&&method==getMethod){zhihuAds(body,'知乎-開屏頁')}else if(url.indexOf("api.zhihu.com/topstory/recommend")!=-1&&method==getMethod){console.log('知乎-推薦列表');let dataArr=body.data;if(dataArr==undefined){console.log("body:"+$response.body);$notification.post(notifiTitle,"知乎推薦","data字段為undefined")}else{body.data=dataArr.filter(item=>{if(item.hasOwnProperty("extra")&&item.extra.hasOwnProperty("type")&&item.extra.type==="zvideo"){let videoUrl=item.common_card.feed_content.video.customized_page_url;let videoID=getUrlParamValue(videoUrl,"videoID");if(videoID==null){console.log('zvideo未獲取到videoID');console.log("body:"+$response.body)}else{console.log(`videoID處理成功,原始:${item.common_card.feed_content.video.id},修改為:${videoID}`);item.common_card.feed_content.video.id=videoID}}else if(item.hasOwnProperty("type")&&item.type=='market_card'&&item.hasOwnProperty("fields")&&item.fields.hasOwnProperty("header")&&item.fields.header.hasOwnProperty("url")&&item.fields.hasOwnProperty("body")&&item.fields.body.hasOwnProperty("video")&&item.fields.body.video.hasOwnProperty("id")){let videoID=getUrlParamValue(item.fields.header.url,"videoID");if(videoID==null){console.log("body:"+$response.body);$notification.post(notifiTitle,"知乎推薦列表視頻","videoID獲取錯誤")}else{console.log(`market_card-videoID處理成功,原始:${item.fields.body.video.id},修改為:${videoID}`);item.fields.body.video.id=videoID}}else if(item.hasOwnProperty("common_card")&&item.common_card.hasOwnProperty("feed_content")&&item.common_card.feed_content.hasOwnProperty("video")&&item.common_card.feed_content.video.hasOwnProperty("id")){let search='"feed_content":{"video":{"id":';let str=$response.body.substring($response.body.indexOf(search)+search.length);let videoID=str.substring(0,str.indexOf(','));console.log(`其他-videoID處理成功,原始:${item.common_card.feed_content.video.id},修改為:${videoID}`);item.common_card.feed_content.video.id=videoID}return item.type!='feed_advert'});if(body.data.length==dataArr.length){console.log('列表數據無廣告')}else{console.log('成功')}}}else if((url.indexOf("api.zhihu.com/questions")!==-1||url.indexOf("api.zhihu.com/v4/questions")!==-1)&&method===getMethod){if(url.indexOf("v4/questions")!==-1){console.log('v4/questions')}else{console.log('questions')}console.log('知乎-問題回答列表');if(body.ad_info===undefined){console.log("問題回答列表無廣告")}else{body.ad_info=null;console.log('成功')}body.data=body.data.filter(item=>{if(item.hasOwnProperty("target_type")&&item.target_type==='answer'&&item.hasOwnProperty("target")&&item.target.hasOwnProperty('attachment')&&item.target.attachment.hasOwnProperty('type')&&item.target.attachment.type==='video'&&item.target.attachment.hasOwnProperty('video')&&item.target.attachment.video.hasOwnProperty('video_info')&&item.target.attachment.video.video_info.hasOwnProperty('video_id')){let videoID=item.target.attachment.attachment_id;console.log(`feeds-video_id處理成功,原始:${item.target.attachment.video.video_info.video_id},修改為:${videoID}`);item.target.attachment.video.video_info.video_id=videoID}else if(item.hasOwnProperty("answer_type")&&item.answer_type==='normal'&&item.hasOwnProperty("attachment")&&item.attachment.hasOwnProperty('type')&&item.attachment.type==='video'&&item.attachment.hasOwnProperty('attachment_id')&&item.attachment.hasOwnProperty('video')&&item.attachment.video.hasOwnProperty('video_info')&&item.attachment.video.video_info.hasOwnProperty('video_id')){let videoID=item.attachment.attachment_id;console.log(`v4-answers-video_id處理成功,原始:${item.attachment.video.video_info.video_id},修改為:${videoID}`);item.attachment.video.video_info.video_id=videoID}return true})}else if(url.indexOf("www.zhihu.com/api/v4/answers")!=-1&&method==getMethod){console.log('知乎-回答下的廣告');if(body.paging===undefined||body.data===undefined){console.log("body:"+$response.body);$notification.post(notifiTitle,'知乎回答下廣告',"paging/data字段為undefined")}else{body.paging=null;body.data=null;console.log('成功')}}else if(url.indexOf("magev6.if.qidian.com/argus/api/v4/client/getsplashscreen")!=-1&&method==getMethod){console.log('起點-開屏頁');if(body.Data==undefined||body.Data.List==undefined){console.log("body:"+$response.body);$notification.post(notifiTitle,"起點","Data/List字段為undefined")}else{body.Data.List=null;console.log('成功')}}else if(url.indexOf("magev6.if.qidian.com/argus/api/v2/deeplink/geturl")!=-1&&method==getMethod){console.log('起點-不跳轉精選');if(body.Data==undefined||body.Data.ActionUrl==undefined||body.Data.ActionUrl!='QDReader://Bookstore'){console.log("body:"+$response.body);$notification.post(notifiTitle,"起點","Data/ActionUrl字段為undefined或者不為QDReader://Bookstore")}else{body.Data=null;console.log('成功')}}else if(url.indexOf("magev6.if.qidian.com/argus/api/v1/adv/getadvlistbatch?positions=iOS_tab")!=-1&&method==getMethod){console.log('起點-iOS_tab');if(body.Data===undefined||body.Data.iOS_tab===undefined){console.log("body:"+$response.body);$notification.post(notifiTitle,"起點-iOS_tab","Data/iOS_tab字段為undefined")}else{if(body.Data.iOS_tab.length==0){console.log('返回配置空')}else{body.Data.iOS_tab=[];console.log('成功')}}}else if(url.indexOf("magev6.if.qidian.com/argus/api/v1/dailyrecommend/getdailyrecommend")!==-1&&method===getMethod){console.log('起點-每日導讀');if(body.hasOwnProperty('Data')&&body.Data!==null&&body.Data.length!==0){body.Data=[];console.log('成功')}else{console.log('每日導讀無數據')}}else if(url.indexOf("magev6.if.qidian.com/argus/api/v1/client/getconf")!=-1&&method==postMethod){console.log('起點-getconf');if(body.Data===undefined){console.log("body:"+$response.body);$notification.post(notifiTitle,"起點-getconf","Data字段為undefined")}else{if(body.Data.ActivityPopup===undefined||body.Data.ActivityPopup.Data==undefined){console.log("body:"+$response.body);$notification.post(notifiTitle,"起點-getconf","ActivityPopup/Data字段為undefined")}else{body.Data.ActivityPopup=null;console.log('ActivityPopup(活動彈窗)成功')}if(body.Data.ActivityIcon===undefined||body.Data.ActivityIcon.Type!==0){console.log("body:"+$response.body);$notification.post(notifiTitle,"起點-getconf","ActivityIcon/Type字段錯誤")}else{if(body.Data.ActivityIcon.EndTime===0){console.log('無ActivityIcon配置')}else{body.Data.ActivityIcon.StartTime=0;body.Data.ActivityIcon.EndTime=0;delete body.Data.ActivityIcon.Actionurl;delete body.Data.ActivityIcon.Icon;console.log('ActivityIcon成功')}}if(body.Data.EnableSearchUser===undefined||body.Data.EnableSearchUser!="0"){console.log("body:"+$response.body);$notification.post(notifiTitle,"起點-getconf","EnableSearchUser字段錯誤")}else{body.Data.EnableSearchUser="1";console.log('允許搜索用戶成功')}if(body.Data.hasOwnProperty('EnableClipboardReading')){if(body.Data.EnableClipboardReading===1){body.Data.EnableClipboardReading=0;console.log('不允許讀取剪切板')}else{console.log('無需修改剪切板配置')}}else{console.log("body:"+$response.body);$notification.post(notifiTitle,"起點-getconf","EnableClipboardReading字段錯誤")}}}else if(url.indexOf("api-access.pangolin-sdk-toutiao.com/api/ad/union/sdk")!=-1&&method==postMethod){console.log('穿山甲-get_ads');if(body.message===undefined){console.log("body:"+$response.body);if(body.status_code===undefined){$notification.post(notifiTitle,"穿山甲","message/status_code字段錯誤")}else{console.log('廣告為空')}}else{body.message=null;console.log('成功')}}else if(url.indexOf("app02.vgtime.com:8080/vgtime-app/api/v2/init/ad.json")!=-1&&method==postMethod){console.log('vgtime-開屏頁');if(body.data==undefined||body.data.ad===undefined){console.log("body:"+$response.body);$notification.post(notifiTitle,"vgtime","data/ad字段為undefined")}else{body.data.ad=null;console.log('成功')}}else if(url.indexOf("news.ssp.qq.com/app")!=-1&&method==postMethod){qqNewsAdList(body,'騰訊新聞-開屏頁')}else if(url.indexOf("r.inews.qq.com/getQQNewsUnreadList")!=-1&&method==postMethod){qqNewsAdList(body,'騰訊新聞-要聞/財經等')}else if(url.indexOf("r.inews.qq.com/getQQNewsMixedList")!=-1&&method==postMethod){qqNewsAdList(body,'騰訊新聞-專題列表-MixedList')}else if(url.indexOf("r.inews.qq.com/getTopicSelectList")!=-1&&method==postMethod){qqNewsAdList(body,'騰訊新聞-話題列表')}else if(url.indexOf("r.inews.qq.com/getQQNewsSpecialListItemsV2")!=-1&&method==postMethod){qqNewsAdList(body,'騰訊新聞-視頻精選(專題)')}else if(url.indexOf('us.l.qq.com/exapp?')!=-1&&method==getMethod){console.log('qq音樂-開屏頁');if(body.data===undefined){console.log("body:"+$response.body);$notification.post(notifiTitle,"qq音樂-開屏頁","data字段錯誤")}else{let dataObj=body.data;let count=0;for(const k in dataObj){let listObj=dataObj[k].list;for(let i=0;i<listObj.length;i++){if(listObj[i].is_empty===undefined){console.log("body:"+$response.body);$notification.post(notifiTitle,"qq音樂-開屏","is_empty字段錯誤");break}if(listObj[i].is_empty===0){listObj[i].is_empty=1;count++}}}console.log('成功count:'+count)}}else if(url.indexOf('mi.gdt.qq.com')!==-1&&method===getMethod){console.log('優量匯');if(body.hasOwnProperty('ret')){if(body.ret===0){body.ret=102006}else{console.log(`ret不為0,不處理`)}}else{console.log("body:"+$response.body);$notification.post(notifiTitle,"優量匯","無ret")}}else{$notification.post(notifiTitle,"路徑/請求方法匹配錯誤:",method+","+url)}body=JSON.stringify(body);$done({body});function qqNewsAdList(body,name){console.log(name);if(body.adList===undefined){console.log('無廣告')}else{body.adList=null;console.log('成功')}}function zhihuAds(body,name){console.log(name);let launch;if(body.launch==undefined){console.log("body:"+$response.body);$notification.post(notifiTitle,name,"launch字段為undefined")}else{launch=JSON.parse(body.launch)}if(launch.ads===undefined){console.log("body:"+$response.body);$notification.post(notifiTitle,name,"launch-ads字段為undefined")}else{launch.ads=[];console.log('成功')}body.launch=JSON.stringify(launch)}function getUrlParamValue(url,queryName){let i=url.indexOf("?");if(i!=-1&&i!=url.length-1){let arr=url.substring(i+1).split('&');for(let x=0;x<arr.length;x++){let pair=arr[x].split('=');if(pair.length==2){if(pair[0]==queryName){return pair[1]}}else{console.log('url:'+url);$notification.post(notifiTitle,'獲取url參數',"pair錯誤")}}}else{console.log('url:'+url);$notification.post(notifiTitle,'獲取url參數',"i錯誤");return null}return null}