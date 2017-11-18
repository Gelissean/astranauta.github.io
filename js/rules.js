const JSON_URL = "data/rules.json";

window.onload = function load() {
	loadJSON(JSON_URL, onJsonLoad);
};

let rulesList;
let tableDefault;

const entryRenderer = new EntryRenderer();

function onJsonLoad(data) {
	rulesList = data;
	tableDefault = $("#stats").html();

	const filterAndSearchBar = document.getElementById(ID_SEARCH_BAR);
	const filterList = [];
	const sourceFilter = new Filter("Source", FLTR_SOURCE, [], parse_sourceJsonToFull);
    //, Filter.asIs
	const groupFilter = new Filter("Group", FLTR_RULE_GROUP, [], Filter.asIs, Filter.asIs);
	filterList.push(sourceFilter);
    filterList.push(groupFilter);
	const filterBox = new FilterBox(filterAndSearchBar, filterList);

	for (let i = 0; i < rulesList.length; i++) {
		const curRule = rulesList[i];
        entriesList = getChildEntries(curRule);
        hiddenstring = entriesList.toString();
        
		// populate table
		$("ul.rules").append(`<li ${FLTR_RULE_GROUP}='${curRule.parentlist}'><a id='${i}' href='#${encodeForHash(curRule.name)}_${encodeForHash(curRule.parentlist)}' title='${curRule.name}'><span class='name col-xs-6'>${curRule.name} <span class='hidden'>${hiddenstring}</span></span><span class='parentlist col-xs-4' title='${parse_sourceJsonToFull(curRule.parentlist)}'>${parse_sourceJsonToAbv(curRule.parentlist)}</span><span class='source col-xs-2' title='${parse_sourceJsonToFull(curRule.Source)}'>${parse_sourceJsonToAbv(curRule.Source)}</span></a></li>`);

		// populate filters
		if ($.inArray(curRule.parentlist, groupFilter.items) === -1) {
			groupFilter.items.push(curRule.parentlist);
		}
        if ($.inArray(curRule.Source, sourceFilter.items) === -1) {
			sourceFilter.items.push(curRule.Source);
		}
	}

	const list = search({
		valueNames: ['name', 'parentlist', 'source'],
		listClass: "rules"
	});

	groupFilter.items.sort(ascSort);

	// filtering function
	$(filterBox).on(
		FilterBox.EVNT_VALCHANGE,
		function () {
			list.filter(function(item) {
				const f = filterBox.getValues();
                const r = rulesList[$(item.elm).attr(FLTR_ID)];
                
                const rightSource = f[sourceFilter.header][FilterBox.VAL_SELECT_ALL] || f[sourceFilter.header][r.Source]
                const rightGroup = f[groupFilter.header][FilterBox.VAL_SELECT_ALL] || f[groupFilter.header][groupFilter.valueFunction($(item.elm).attr(groupFilter.storageAttribute))]
				return rightSource && rightGroup;
			});
		}
	);

	// add filter reset to reset button
	document.getElementById(ID_RESET_BUTTON).addEventListener(EVNT_CLICK, function() {filterBox.reset();}, false);

	filterBox.render();
	initHistory()
}

function loadhash (id) {
	// reset details pane to initial HTML
	$("#stats").html(tableDefault);

	const curRule = rulesList[id];


	$("th#name").html(curRule.name);

	// build text list and display
	$("tr.text").remove();
	const textStack = [];
	entryRenderer.recursiveEntryRender(curRule, textStack);
	$("tr#text").after("<tr class='text'><td colspan='6'>" + textStack.join("") + "</td></tr>");
}

function getChildEntries(parent, topLevel=true){ 
    if(typeof parent.type === 'undefined' || !(parent.type == 'entries' || parent.type == 'section'))
        return [];
    (topLevel)? childList = [] : childList = childList.concat([parent.name]);
    for (let i = 0; i < parent.entries.length; i++) {
        getChildEntries(parent.entries[i], false);
    }
    return childList;
}
