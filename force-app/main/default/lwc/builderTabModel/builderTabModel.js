// Tab identity is the existing node ID; labels never control selection.
export function tabForSelection(node, selectedId) {
 const contains=n=>n.id===selectedId||(n.children||[]).some(contains);
 return node.children.find(contains)?.id||'';
}
export function resolveActiveTab(node, requested='', eligible=()=>true) {
 const available=node.children.filter(eligible);
 return available.find(n=>n.id===requested)?.id||available.find(n=>n.id===node.props.defaultTabId)?.id||available[0]?.id||'';
}
export function validateTabConfig(node) {
 if(node.props.defaultTabId!==undefined&&typeof node.props.defaultTabId!=='string')throw Error('Default tab must be a tab ID');
 // A removed/moved default gracefully falls back to the first tab.
}
