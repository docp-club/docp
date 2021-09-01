export const escapeEntity = (html) => {
  const entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  };
  if (typeof html !== 'string') return '';
  return html.replace(RegExp('[' + Object.keys(entityMap).join('') + ']', 'g'), function (match) {
    return entityMap[match];
  });
};