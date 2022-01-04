/**************************

嗶哩嗶哩, 港澳台番劇自動切換地區 & 顯示豆瓣評分

如需禁用豆瓣評分或策略通知, 可前往BoxJs設置.
BoxJs訂閱地址: https://raw.githubusercontent.com/NobyDa/Script/master/NobyDa_BoxJs.json

Update: 2021.09.26
Author: @NobyDa
Use: Surge, QuanX, Loon

****************************
港澳台自動切換地區說明 :
****************************

地區自動切換功能僅適用於Surge4.7+(iOS)，Loon2.1.10(286)+，QuanX1.0.22(543)+
低於以上版本僅顯示豆瓣評分.

您需要配置相關規則集:
Surge、Loon: 
https://raw.githubusercontent.com/DivineEngine/Profiles/master/Surge/Ruleset/StreamingMedia/StreamingSE.list

QuanX: 
https://raw.githubusercontent.com/DivineEngine/Profiles/master/Quantumult/Filter/StreamingMedia/StreamingSE.list

綁定相關select或static策略組，並且需要具有相關的區域代理服務器納入您的子策略中，子策略可以是服務器也可以是其他區域策略組．
最後，您可以通過BoxJs設置策略名和子策略名，或者手動填入腳本.

如需搜索指定地區番劇, 可在搜索框添加後綴" 港", " 台", " 中". 例如: 進擊的巨人 港

QX用戶注: 使用切換地區功能請確保您的QX=>其他設置=>溫和策略機制處於關閉狀態, 以及填寫策略名和子策略名時注意大小寫.

****************************
Surge 4.7+ 遠程腳本配置 :
****************************
[Script]
Bili Region = type=http-response,pattern=^https:\/\/ap(p|i)\.bilibili\.com\/(pgc\/view\/(v\d\/)?app|x(\/v\d)?\/view\/video)\/(season|online)\?access_key,requires-body=1,max-size=0,script-path=https://raw.githubusercontent.com/specialmenfo/Surge/Master/Bili_Auto_Regions.js

#可選, 適用於搜索指定地區的番劇
Bili Search = type=http-request,pattern=^https:\/\/app\.bilibili\.com\/x\/v\d\/search(\/type)?\?.+?%20(%E6%B8%AF|%E5%8F%B0|%E4%B8%AD)&,script-path=https://raw.githubusercontent.com/specialmenfo/Surge/Master/Bili_Auto_Regions.js

[MITM]
hostname = ap?.bilibili.com

****************************
Quantumult X 遠程腳本配置 :
****************************
[rewrite_local]
^https:\/\/ap(p|i)\.bilibili\.com\/(pgc\/view\/(v\d\/)?app|x(\/v\d)?\/view\/video)\/(season|online)\?access_key url script-response-body https://raw.githubusercontent.com/specialmenfo/Surge/Master/Bili_Auto_Regions.js

#可選, 適用於搜索指定地區的番劇
^https:\/\/app\.bilibili\.com\/x\/v\d\/search(\/type)?\?.+?%20(%E6%B8%AF|%E5%8F%B0|%E4%B8%AD)& url script-request-header https://raw.githubusercontent.com/specialmenfo/Surge/Master/Bili_Auto_Regions.js

[mitm]
hostname = ap?.bilibili.com

[filter_local]
#可選, 由於qx純tun特性, 不添加規則可能會導致腳本失效.
ip-cidr, 203.107.1.1/24, reject

****************************
Loon 遠程腳本配置 :
****************************
[Script]
http-response ^https:\/\/ap(p|i)\.bilibili\.com\/(pgc\/view\/(v\d\/)?app|x(\/v\d)?\/view\/video)\/(season|online)\?access_key script-path=https://raw.githubusercontent.com/specialmenfo/Surge/Master/Bili_Auto_Regions.js, requires-body=true, tag=bili自動地區

#可選, 適用於搜索指定地區的番劇
http-request ^https:\/\/app\.bilibili\.com\/x\/v\d\/search(\/type)?\?.+?%20(%E6%B8%AF|%E5%8F%B0|%E4%B8%AD)& script-path=https://raw.githubusercontent.com/specialmenfo/Surge/Master/Bili_Auto_Regions.js, requires-body=true, tag=bili自動地區(搜索)

[Mitm]
hostname = ap?.bilibili.com

***************************/

let $ = specialmenfo();
let run = EnvInfo();

async function SwitchRegion(play) {
	const Group = $.read('BiliArea_Policy') || '🌍 BiliBili國際'; //Your blibli policy group name.
	const CN = $.read('BiliArea_CN') || '🎯 全球直連'; //Your China sub-policy name.
	const TW = $.read('BiliArea_TW') || '🇹🇼 台灣節點'; //Your Taiwan sub-policy name.
	const HK = $.read('BiliArea_HK') || '🇭🇰 香港節點'; //Your HongKong sub-policy name.
	const current = await $.getPolicy(Group);
	const area = (() => {
		if (/\u50c5[\u4e00-\u9fa5]+\u6e2f|%20%E6%B8%AF&/.test(play)) {
			if (current != HK) return HK;
		} else if (/\u50c5[\u4e00-\u9fa5]+\u53f0|%20%E5%8F%B0&/.test(play)) {
			if (current != TW) return TW;
		} else if (current != CN) return CN;
	})()

	if (area) {
		const change = await $.setPolicy(Group, area);
		const notify = $.read('BiliAreaNotify') === 'true';
		const msg = SwitchStatus(change, current, area);
		if (!notify) {
			$.notify(/^http/.test(play) || !play ? `` : play, ``, msg);
		} else {
			console.log(`${/^http/.test(play)||!play?``:play}\n${msg}`);
		}
		if (change) {
			return true;
		}
	}
	return false;
}

function SwitchStatus(status, original, newPolicy) {
	if (status) {
		return `${original}  =>  ${newPolicy}  =>  成功切換🎉`;
	} else if (original === 2) {
		return `切換失敗, 策略組名未填寫或填寫有誤 ⚠️`
	} else if (original === 3) {
		return `切換失敗, 不支持您的VPN應用版本 ⚠️`
	} else if (status === 0) {
		return `切換失敗, 子策略名未填寫或填寫有誤 ⚠️`
	} else {
		return `策略切換失敗, 未知錯誤 ⚠️`
	}
}

function EnvInfo() {
	if (typeof($response) !== 'undefined') {
		const raw = JSON.parse($response.body);
		const data = raw.data || raw.result || {};
		//if surge or loon, $done() will auto reconnect with the new policy
		SwitchRegion(data.title)
			.then(s => s && !$.isQuanX ? $done() : QueryRating(raw, data));
	} else {
		const raw = $request.url;
		const res = {
			url: raw.replace(/%20(%E6%B8%AF|%E5%8F%B0|%E4%B8%AD)&/g, '&')
		};
		SwitchRegion(raw).then(() => $done(res));
	}
}

async function QueryRating(body, play) {
	try {
		const ratingEnabled = $.read('BiliDoubanRating') === 'false';
		if (!ratingEnabled && play.title && body.data && body.data.badge_info) {
			const [t1, t2] = await Promise.all([
				GetRawInfo(play.title),
				GetRawInfo(play.origin_name)
			]);
			const exYear = body.data.publish.release_date_show.split(/^(\d{4})/)[1];
			const info1 = (play.staff && play.staff.info) || '';
			const info2 = (play.actor && play.actor.info) || '';
			const info3 = (play.celebrity && play.celebrity.map(n => n.name).join('/')) || '';
			const filterInfo = [play.title, play.origin_name, info1 + info2 + info3, exYear];
			const [rating, folk, name, id, other] = ExtractMovieInfo([...t1, ...t2], filterInfo);
			const limit = JSON.stringify(body.data.modules)
				.replace(/"\u53d7\u9650"/g, `""`).replace(/("area_limit":)1/g, '$10');
			body.data.modules = JSON.parse(limit);
			body.data.detail = body.data.new_ep.desc.replace(/連載中,/, '');
			body.data.badge_info.text = `⭐️ 豆瓣：${!$.is403?`${rating||'無評'}分 (${folk||'無評價'})`:`查詢頻繁！`}`;
			body.data.evaluate = `${body.data.evaluate||''}\n\n豆瓣評分搜索結果: ${JSON.stringify(other,0,1)}`;
			body.data.new_ep.desc = name;
			body.data.styles.unshift({
				name: "⭐️ 點擊此處打開豆瓣劇集詳情頁",
				url: `https://m.douban.com/${id?`movie/subject/${id}/`:`search/?query=${encodeURI(play.title)}`}`
			});
		}
	} catch (err) {
		console.log(`Douban rating: \n${err}\n`);
	} finally {
		$done({
			body: JSON.stringify(body)
		});
	}
}

function ExtractMovieInfo(ret, fv) {
	const sole = new Set(ret.map(s => JSON.stringify(s))); //delete duplicate
	const f1 = [...sole].map(p => JSON.parse(p))
		.filter(t => {
			t.accuracy = 0;
			if (t.name && fv[0]) { //title
				if (t.name.includes(fv[0].slice(0, 4))) t.accuracy++;
				if (t.name.includes(fv[0].slice(-3))) t.accuracy++;
			}
			if (t.origin && fv[1]) { //origin title
				if (t.origin.includes(fv[1].slice(0, 4))) t.accuracy++;
				if (t.origin.includes(fv[1].slice(-3))) t.accuracy++;
			}
			if (t.pd && fv[2]) { //producer or actor
				const len = t.pd.split('/').filter(c => fv[2].includes(c));
				t.accuracy += len.length;
			}
			if (t.year && fv[3] && t.year == fv[3]) t.accuracy++; //year
			return Boolean(t.accuracy);
		});
	let x = {}; //assign most similar
	const f2 = f1.reduce((p, c) => c.accuracy > p ? (x = c, c.accuracy) : p, 0);
	return [x.rating, x.folk, x.name, x.id, f1];
}

function GetRawInfo(t) {
	let res = [];
	let st = Date.now();
	return new Promise((resolve) => {
		if (!t) return resolve(res);
		$.get({
			url: `https://www.douban.com/search?cat=1002&q=${encodeURIComponent(t)}`,
			headers: {
				'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
				'Cookie': JSON.stringify(st)
			}
		}, (error, resp, data) => {
			if (error) {
				console.log(`Douban rating: \n${t}\nRequest error: ${error}\n`);
			} else {
				if (/\u767b\u5f55<\/a>\u540e\u91cd\u8bd5\u3002/.test(data)) $.is403 = true;
				let s = data.replace(/\n| |&#\d{2}/g, '')
					.match(/\[\u7535\u5f71\].+?subject-cast\">.+?<\/span>/g) || [];
				for (let i = 0; i < s.length; i++) {
					res.push({
						name: s[i].split(/\}\)">(.+?)<\/a>/)[1],
						origin: s[i].split(/\u540d:(.+?)(\/|<)/)[1],
						pd: s[i].split(/\u539f\u540d.+?\/(.+?)\/\d+<\/span>$/)[1],
						rating: s[i].split(/">(\d\.\d)</)[1],
						folk: s[i].split(/(\d+\u4eba\u8bc4\u4ef7)/)[1],
						id: s[i].split(/sid:(\d+)/)[1],
						year: s[i].split(/(\d+)<\/span>$/)[1]
					})
				}
				let et = ((Date.now() - st) / 1000).toFixed(2);
				console.log(`Douban rating: \n${t}\n${res.length} movie info searched. (${et} s)\n`);
			}
			resolve(res);
		})
	})
}

function nobyda() {
	const isHTTP = typeof $httpClient != "undefined";
	const isLoon = typeof $loon != "undefined";
	const isQuanX = typeof $task != "undefined";
	const isSurge = typeof $network != "undefined" && typeof $script != "undefined";
	const notify = (title, subtitle, message) => {
		console.log(`${title}\n${subtitle}\n${message}`);
		if (isQuanX) $notify(title, subtitle, message);
		if (isHTTP) $notification.post(title, subtitle, message);
	}
	const read = (key) => {
		if (isQuanX) return $prefs.valueForKey(key);
		if (isHTTP) return $persistentStore.read(key);
	}
	const adapterStatus = (response) => {
		if (!response) return null;
		if (response.status) {
			response["statusCode"] = response.status;
		} else if (response.statusCode) {
			response["status"] = response.statusCode;
		}
		return response;
	}
	const getPolicy = (groupName) => {
		if (isSurge) {
			if (typeof($httpAPI) === 'undefined') return 3;
			return new Promise((resolve) => {
				$httpAPI("GET", "v1/policy_groups/select", {
					group_name: encodeURIComponent(groupName)
				}, (b) => resolve(b.policy || 2))
			})
		}
		if (isLoon) {
			if (typeof($config.getPolicy) === 'undefined') return 3;
			const getName = $config.getPolicy(groupName);
			return getName || 2;
		}
		if (isQuanX) {
			if (typeof($configuration) === 'undefined') return 3;
			return new Promise((resolve) => {
				$configuration.sendMessage({
					action: "get_policy_state"
				}).then(b => {
					if (b.ret && b.ret[groupName]) {
						resolve(b.ret[groupName][1]);
					} else resolve(2);
				}, () => resolve());
			})
		}
	}
	const setPolicy = (group, policy) => {
		if (isSurge && typeof($httpAPI) !== 'undefined') {
			return new Promise((resolve) => {
				$httpAPI("POST", "v1/policy_groups/select", {
					group_name: group,
					policy: policy
				}, (b) => resolve(!b.error || 0))
			})
		}
		if (isLoon && typeof($config.getPolicy) !== 'undefined') {
			const set = $config.setSelectPolicy(group, policy);
			return set || 0;
		}
		if (isQuanX && typeof($configuration) !== 'undefined') {
			return new Promise((resolve) => {
				$configuration.sendMessage({
					action: "set_policy_state",
					content: {
						[group]: policy
					}
				}).then((b) => resolve(!b.error || 0), () => resolve());
			})
		}
	}
	const get = (options, callback) => {
		if (isQuanX) {
			options["method"] = "GET";
			$task.fetch(options).then(response => {
				callback(null, adapterStatus(response), response.body)
			}, reason => callback(reason.error, null, null))
		}
		if (isHTTP) {
			if (isSurge) options.headers['X-Surge-Skip-Scripting'] = false;
			$httpClient.get(options, (error, response, body) => {
				callback(error, adapterStatus(response), body)
			})
		}
	}
	return {
		getPolicy,
		setPolicy,
		isSurge,
		isQuanX,
		isLoon,
		notify,
		read,
		get
	}
}
