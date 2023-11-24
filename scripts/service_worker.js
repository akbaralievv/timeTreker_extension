chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((e) => {
  const msg = `Cookies removed in request to ${e.request.url} on tab ${e.request.tabId}.`;
  console.log(msg);
});

async function updateStaticRules(enableRulesetIds, disableCandidateIds) {
  let options = { enableRulesetIds: enableRulesetIds, disableRulesetIds: disableCandidateIds };
  const enabledStaticCount = await chrome.declarativeNetRequest.getEnabledRulesets();
  const proposedCount = enableRulesetIds.length;
  if (
    enabledStaticCount + proposedCount >
    chrome.declarativeNetRequest.MAX_NUMBER_OF_ENABLED_STATIC_RULESETS
  ) {
    options.disableRulesetIds = disableCandidateIds;
  }
  await chrome.declarativeNetRequest.updateEnabledRulesets(options);
}

export async function getRulesEnabledState() {
  const enabledRuleSets = await chrome.declarativeNetRequest.getEnabledRulesets();
  return enabledRuleSets.length > 0;
}

export async function enableRulesForCurrentPage() {
  const enableRuleSetIds = ['ruleset_1'];
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (activeTab) {
    await updateStaticRules(enableRuleSetIds, []);
  }
}

export async function disableRulesForCurrentPage() {
  const disableRuleSetIds = ['ruleset_1'];
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (activeTab) {
    await updateStaticRules([], disableRuleSetIds);
  }
}
