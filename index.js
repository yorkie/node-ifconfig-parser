
var Buffer = require('buffer-extend');
var keys = [
  'inet6',
  'inet',
  'prefixlen',
  'netmask',
  'scopeid',
  'nd6',
  'options',
  'ether',
  'broadcast',
  'media:',
  'status:',
  'member:',
  'id',
  'priority',
  'hellotime',
  'fwddelay',
  'maxage',
  'holdcnt',
  'proto',
  'maxaddr',
  'timeout',
  'ipfilter',
  'ifmaxaddr',
  'flags'
];

function parse(src) {
  var lines = src.split('\n');
  var blocks = [];
  var temp = [];
  lines.forEach(function(item) {
    if (['\t', ' '].indexOf(item[0]) === -1 && temp.length > 0) {
      blocks.push(temp);
      temp = [];
    }
    temp.push(item);
  });

  return blocks.map(function(block) {
    var ret = {};
    var firstline = block[0].toString();
    var coionIdx = firstline.indexOf(':');
    var conf = block.slice(1);
    var flagsline = firstline.slice(coionIdx+1).trim();
    var flagsMh = flagsline.match(/^flags=[0-9]+<{1}([A-Z,]*)>{1} mtu ([0-9]+)/);

    ret.name = firstline.slice(0, coionIdx-1);
    ret.flags = flagsMh[1].split(',');
    ret.mtu = parseInt(flagsMh[2], 10);
    conf.forEach(function(item) {
      var list = item.split(' ').filter(function(item) {
        return item.length > 0;
      });
      var key = null;
      for (var i=0; i<list.length; i++) {
        if (keys.indexOf(list[i]+'') !== -1) {
          key = (list[i]+'').replace(':', '');
          if (key && !ret[key]) ret[key] = true;
          continue;
        }
        if (key) {
          ret[key] = list[i]+'';
        }
      }
    });

    if (ret.flags.length && !ret.flags[0].length) {
      ret.flags = [];
    }

    return ret;
  });
}

exports.parse = parse;
