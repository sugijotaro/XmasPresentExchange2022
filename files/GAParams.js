var UAParams = {
	"DownloadOptions" : {
		"PutMethod": ["pageview","event"],
		"IncludeCondition": ["\\.pdf$","\\.zip$","\\.jpg$"],
		"ExcludeCondition": [],
		"EventCondition": {
			"Default":{
				"category":  "download",
				"action":    "other",
				"opt_value":     null
			},
			"ConditionList":[
				{
					"condition": ".*\\.pdf$",
					"category":  "download",
					"action":    "pdf",
					"opt_value": null
				},
				{
					"condition": ".*\\.zip$",
					"category":  "download",
					"action":    "zip",
					"opt_value": null
				},

				{
					"condition": ".*\\.jpg$",
					"category":  "download",
					"action":    "jpg",
					"opt_value": null
				}
			]
		}
	},
	"ExternalSiteOptions" : {
		"PutMethod": ["pageview","event"],
		"IncludeCondition": ["^http://","^https://"],
		"ExcludeCondition": ["starbucks.co.jp","cp11.smp.ne.jp"],
		"EventCondition": {
			"Default":{
				"category":  "ExternalSite",
				"action":    "external",
				"opt_value":     null
			},
			"ConditionList":[
				{
				}
			]
		}
	},
	"CustomVarOptions" : {

		"ConditionList": [

			{
				"condition": "co\\.jp/mystarbucks-entry/CstbaseRegComp",
				"index":  1,
				"name":   "member",
				"value":  "member",
				"opt_scope": 1
			},
			{
				"condition": "co\\.jp/mystarbucks/",
				"index":  1,
				"name":   "member",
				"value":  "member",
				"opt_scope": 1
			},

			{
				"condition": "smm=1",
				"index":  1,
				"name":   "member",
				"value":  "member",
				"opt_scope": 1
			}
		]
	},
	"waitingCount": 100,
	"IgnoreJumpUrl": {
		"active": false,
		"Condition": [
  		    {
  		    	"Include":[]
		    },
  		    {
				"Include":[]
		    },
			{
				"Include":[],
			   	"Exclude":[]

			}
		]
	}
};
